// Fleet Council online server.
// Zero dependencies: Node's http module serves the static game, a small JSON API,
// and Server-Sent Events that push each player their own view of the room.
//
//   node server/server.js            (PORT defaults to 8080)
//
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Room, cleanName } = require('../app/world-room.js');

const ROOT = path.resolve(__dirname, '..');
const PORT = Number(process.env.PORT) || 8080;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, 'var');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');
const MAX_ROOMS = 200;
const ROOM_IDLE_MS = 2 * 60 * 60 * 1000;
const MAX_BODY = 8 * 1024;
const PUBLIC_DIRS = ['app', 'data', 'web'];
const PUBLIC_FILES = ['index.html', 'world.html'];
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const rooms = new Map();
const streams = new Map(); // room code -> Set of { res, playerId }

// ── Leaderboard ────────────────────────────────────────────────────────────

let leaderboard = {};
try {
  leaderboard = JSON.parse(fs.readFileSync(LEADERBOARD_FILE, 'utf8'));
} catch (error) {
  leaderboard = {};
}

function saveLeaderboard() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = LEADERBOARD_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(leaderboard, null, 2));
  fs.renameSync(tmp, LEADERBOARD_FILE);
}

function recordMatch(room, results) {
  results.players.filter(p => !p.bot).forEach(p => {
    const key = p.name.toLowerCase();
    const entry = leaderboard[key] || { name: p.name, exp: 0, matches: 0, wins: 0, raidsWon: 0 };
    entry.name = p.name;
    entry.exp += p.exp;
    entry.matches += 1;
    entry.raidsWon += p.record.raidsWon;
    if (results.winners.includes(p.worldId)) entry.wins += 1;
    leaderboard[key] = entry;
  });
  try {
    saveLeaderboard();
  } catch (error) {
    console.error('Could not save leaderboard:', error.message);
  }
}

function topPlayers() {
  return Object.values(leaderboard).sort((a, b) => b.exp - a.exp).slice(0, 50);
}

// ── Rooms ──────────────────────────────────────────────────────────────────

function newCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  for (;;) {
    let code = '';
    for (let i = 0; i < 4; i++) code += letters[crypto.randomInt(letters.length)];
    if (!rooms.has(code)) return code;
  }
}

function broadcast(room) {
  const set = streams.get(room.code);
  if (!set) return;
  const now = Date.now();
  set.forEach(client => {
    client.res.write(`data: ${JSON.stringify(room.snapshot(client.playerId, now))}\n\n`);
  });
}

function createRoom() {
  const code = newCode();
  const room = new Room({
    code,
    seed: crypto.randomInt(2 ** 31),
    now: Date.now(),
    makeToken: () => crypto.randomBytes(18).toString('base64url'),
    onChange: r => broadcast(r),
    onMatchEnd: recordMatch
  });
  rooms.set(code, room);
  return room;
}

function findRoom(code) {
  return rooms.get(String(code || '').toUpperCase()) || null;
}

function tickRooms() {
  const now = Date.now();
  rooms.forEach((room, code) => {
    room.tick(now);
    const viewers = streams.get(code);
    if (now - room.lastActivity > ROOM_IDLE_MS && (!viewers || viewers.size === 0)) rooms.delete(code);
  });
}

function pingStreams() {
  streams.forEach(set => set.forEach(client => client.res.write(': ping\n\n')));
}

// ── HTTP helpers ───────────────────────────────────────────────────────────

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': TYPES['.json'], 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', chunk => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(new Error('Request too large.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch (error) {
        reject(new Error('Invalid JSON.'));
      }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res, pathname) {
  let rel = decodeURIComponent(pathname).replace(/^\/+/, '');
  if (rel === '') rel = 'index.html';
  const top = rel.split('/')[0];
  if (!PUBLIC_FILES.includes(rel) && !PUBLIC_DIRS.includes(top)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const file = path.resolve(ROOT, rel);
  if (!file.startsWith(ROOT + path.sep)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(file, (error, data) => {
    if (error) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}

// ── API ────────────────────────────────────────────────────────────────────

async function handleApi(req, res, url) {
  const route = url.pathname;

  if (req.method === 'GET' && route === '/api/leaderboard') {
    sendJson(res, 200, { players: topPlayers() });
    return;
  }

  if (req.method === 'GET' && route === '/api/events') {
    const room = findRoom(url.searchParams.get('code'));
    const player = room && room.playerByToken(url.searchParams.get('token'));
    if (!player) {
      sendJson(res, 404, { error: 'Room or player not found.' });
      return;
    }
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    const client = { res, playerId: player.id };
    if (!streams.has(room.code)) streams.set(room.code, new Set());
    streams.get(room.code).add(client);
    room.setConnected(player.id, 1, Date.now());
    req.on('close', () => {
      const set = streams.get(room.code);
      if (set) set.delete(client);
      room.setConnected(player.id, -1, Date.now());
    });
    return;
  }

  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed.' });
    return;
  }

  let body;
  try {
    body = await readBody(req);
  } catch (error) {
    sendJson(res, 400, { error: error.message });
    return;
  }
  const now = Date.now();

  if (route === '/api/create') {
    if (rooms.size >= MAX_ROOMS) {
      sendJson(res, 503, { error: 'The server is full. Try again later.' });
      return;
    }
    const room = createRoom();
    const player = room.join(cleanName(body.name), now);
    sendJson(res, 200, { code: room.code, token: player.token, playerId: player.id });
    return;
  }

  if (route === '/api/join') {
    const room = findRoom(body.code);
    if (!room) {
      sendJson(res, 404, { error: 'No room with that code.' });
      return;
    }
    const existing = room.playerByToken(body.token);
    if (existing && !existing.left) {
      sendJson(res, 200, { code: room.code, token: existing.token, playerId: existing.id });
      return;
    }
    try {
      const player = room.join(cleanName(body.name), now);
      sendJson(res, 200, { code: room.code, token: player.token, playerId: player.id });
    } catch (error) {
      sendJson(res, 409, { error: error.message });
    }
    return;
  }

  if (route === '/api/command') {
    const room = findRoom(body.code);
    const player = room && room.playerByToken(body.token);
    if (!player) {
      sendJson(res, 404, { error: 'Room or player not found.' });
      return;
    }
    if (body.type === 'leave') {
      room.removePlayer(player.id, now);
      sendJson(res, 200, { ok: true });
      return;
    }
    const outcome = room.command(player.id, String(body.type || ''), body.payload, now);
    sendJson(res, outcome.ok ? 200 : 400, outcome);
    return;
  }

  sendJson(res, 404, { error: 'Unknown endpoint.' });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    handleApi(req, res, url).catch(error => {
      console.error(error);
      if (!res.headersSent) sendJson(res, 500, { error: 'Server error.' });
    });
    return;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405);
    res.end();
    return;
  }
  serveStatic(req, res, url.pathname);
});

function start(port, callback) {
  const timers = [setInterval(tickRooms, 400), setInterval(pingStreams, 20000)];
  server.on('close', () => timers.forEach(clearInterval));
  return server.listen(port, callback);
}

if (require.main === module) {
  start(PORT, () => {
    console.log(`Fleet Council server on http://localhost:${PORT}/world.html`);
  });
}

module.exports = { server, rooms, start };
