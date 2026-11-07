// Fleet Council online server.
// Zero dependencies: Node's http module serves the static game, a small JSON API,
// and Server-Sent Events that push each player their own view of the room.
// Rooms, PIN accounts and the all-time ranking are kept in storage (Upstash Redis or files),
// so a restart or a free-tier spin-down does not lose them.
//
//   node server/server.js            (PORT defaults to 8080)
//
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Room, cleanName } = require('../app/world-room.js');
const { createStorage } = require('./storage.js');

const ROOT = path.resolve(__dirname, '..');
const MAX_ROOMS = 200;
const ROOM_IDLE_MS = 2 * 60 * 60 * 1000;
const SAVE_EVERY_MS = 15000;
const MAX_BODY = 8 * 1024;
const PIN_PATTERN = /^\d{4,8}$/;
const PIN_FAILS_BEFORE_LOCK = 5;
const PIN_LOCK_MS = 10 * 60 * 1000;
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

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function createApp(options) {
  const storage = options.storage;
  const log = options.log || (() => {});
  const rooms = new Map();
  const streams = new Map(); // room code -> Set of { res, playerId }
  const savedVersions = new Map(); // room code -> version last written to storage
  const pinFailures = new Map(); // account -> { count, lockedUntil }
  let leaderboard = {};
  let accounts = {};
  let savedIndex = '[]';
  let saving = null;

  // ── Accounts ─────────────────────────────────────────────────────────────

  function hashPin(pin, salt) {
    return crypto.scryptSync(pin, salt, 32).toString('hex');
  }

  // Returns the account key for a PIN-protected name, or null for a guest.
  async function authenticate(name, pin, now) {
    const key = name.toLowerCase();
    const account = accounts[key];
    if (pin === undefined || pin === null || pin === '') {
      if (account) throw new HttpError(403, `"${account.name}" is protected by a PIN. Enter its PIN to use this name.`);
      return null;
    }
    pin = String(pin);
    if (!PIN_PATTERN.test(pin)) throw new HttpError(400, 'The PIN must be 4 to 8 digits.');
    if (!account) {
      const salt = crypto.randomBytes(16).toString('hex');
      accounts[key] = { name, salt, pinHash: hashPin(pin, salt), created: now };
      await storage.set('accounts', accounts);
      log(`New pilot account: ${name}`);
      return key;
    }
    const fails = pinFailures.get(key) || { count: 0, lockedUntil: 0 };
    if (fails.lockedUntil > now) throw new HttpError(429, 'Too many wrong PINs for this name. Try again in a few minutes.');
    const expected = Buffer.from(account.pinHash, 'hex');
    const given = Buffer.from(hashPin(pin, account.salt), 'hex');
    if (!crypto.timingSafeEqual(expected, given)) {
      fails.count += 1;
      if (fails.count >= PIN_FAILS_BEFORE_LOCK) {
        fails.count = 0;
        fails.lockedUntil = now + PIN_LOCK_MS;
      }
      pinFailures.set(key, fails);
      throw new HttpError(403, 'Wrong PIN for this pilot name.');
    }
    pinFailures.delete(key);
    return key;
  }

  // ── Leaderboard ──────────────────────────────────────────────────────────

  // Only PIN-protected pilots are ranked, so nobody can collect EXP under someone else's name.
  function recordMatch(room, results) {
    results.players.forEach(p => {
      const seat = room.players.get(p.id);
      if (!seat || !seat.account) return;
      const account = accounts[seat.account];
      const entry = leaderboard[seat.account] || { name: account ? account.name : p.name, exp: 0, matches: 0, wins: 0, raidsWon: 0 };
      entry.exp += p.exp;
      entry.matches += 1;
      entry.raidsWon += p.record.raidsWon;
      if (results.winners.includes(p.worldId)) entry.wins += 1;
      leaderboard[seat.account] = entry;
    });
    storage.set('leaderboard', leaderboard).catch(error => log('Could not save leaderboard: ' + error.message));
  }

  function topPlayers() {
    return Object.values(leaderboard).sort((a, b) => b.exp - a.exp).slice(0, 50);
  }

  // ── Rooms ────────────────────────────────────────────────────────────────

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

  function roomOptions() {
    return {
      makeToken: () => crypto.randomBytes(18).toString('base64url'),
      onChange: r => broadcast(r),
      onMatchEnd: recordMatch
    };
  }

  function createRoom(now) {
    const room = new Room(Object.assign(roomOptions(), { code: newCode(), seed: crypto.randomInt(2 ** 31), now }));
    rooms.set(room.code, room);
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

  // ── Persistence ──────────────────────────────────────────────────────────

  async function load() {
    const now = Date.now();
    leaderboard = (await storage.get('leaderboard')) || {};
    accounts = (await storage.get('accounts')) || {};
    const codes = (await storage.get('rooms')) || [];
    for (const code of codes) {
      const data = await storage.get('room:' + code);
      if (!data) continue;
      const room = Room.fromJSON(data, roomOptions(), now);
      rooms.set(code, room);
      savedVersions.set(code, room.version);
    }
    savedIndex = JSON.stringify([...rooms.keys()].sort());
    log(`Storage: ${storage.kind}. Restored ${rooms.size} room(s), ${Object.keys(accounts).length} account(s).`);
  }

  // Writes only rooms that changed since the last save, to stay inside free-tier limits.
  async function saveRooms() {
    const now = Date.now();
    for (const [code, room] of rooms) {
      if (savedVersions.get(code) === room.version) continue;
      const version = room.version;
      await storage.set('room:' + code, room.toJSON(now));
      savedVersions.set(code, version);
    }
    for (const code of [...savedVersions.keys()]) {
      if (rooms.has(code)) continue;
      await storage.del('room:' + code);
      savedVersions.delete(code);
    }
    const index = JSON.stringify([...rooms.keys()].sort());
    if (index !== savedIndex) {
      await storage.set('rooms', JSON.parse(index));
      savedIndex = index;
    }
  }

  function flush() {
    if (!saving) {
      saving = saveRooms()
        .catch(error => log('Could not save rooms: ' + error.message))
        .finally(() => { saving = null; });
    }
    return saving;
  }

  // ── HTTP helpers ─────────────────────────────────────────────────────────

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
          reject(new HttpError(400, 'Request too large.'));
          req.destroy();
          return;
        }
        chunks.push(chunk);
      });
      req.on('end', () => {
        try {
          resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
        } catch (error) {
          reject(new HttpError(400, 'Invalid JSON.'));
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

  // ── API ──────────────────────────────────────────────────────────────────

  function seatReply(room, player) {
    return { code: room.code, token: player.token, playerId: player.id, registered: !!player.account };
  }

  async function handleApi(req, res, url) {
    const route = url.pathname;

    if (req.method === 'GET' && route === '/api/leaderboard') {
      sendJson(res, 200, { players: topPlayers() });
      return;
    }

    if (req.method === 'GET' && route === '/api/events') {
      const room = findRoom(url.searchParams.get('code'));
      const player = room && room.playerByToken(url.searchParams.get('token'));
      if (!player) throw new HttpError(404, 'Room or player not found.');
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

    if (req.method !== 'POST') throw new HttpError(405, 'Method not allowed.');
    const body = await readBody(req);
    const now = Date.now();

    if (route === '/api/create') {
      if (rooms.size >= MAX_ROOMS) throw new HttpError(503, 'The server is full. Try again later.');
      const name = cleanName(body.name);
      const account = await authenticate(name, body.pin, now);
      const room = createRoom(now);
      const player = room.join(account ? accounts[account].name : name, now, account);
      sendJson(res, 200, seatReply(room, player));
      return;
    }

    if (route === '/api/join') {
      const room = findRoom(body.code);
      if (!room) throw new HttpError(404, 'No room with that code.');
      const existing = room.playerByToken(body.token);
      if (existing && !existing.left) {
        sendJson(res, 200, seatReply(room, existing));
        return;
      }
      const name = cleanName(body.name);
      const account = await authenticate(name, body.pin, now);
      const seat = room.playerByAccount(account);
      if (seat) {
        sendJson(res, 200, seatReply(room, seat));
        return;
      }
      try {
        sendJson(res, 200, seatReply(room, room.join(account ? accounts[account].name : name, now, account)));
      } catch (error) {
        throw new HttpError(409, error.message);
      }
      return;
    }

    if (route === '/api/command') {
      const room = findRoom(body.code);
      const player = room && room.playerByToken(body.token);
      if (!player) throw new HttpError(404, 'Room or player not found.');
      if (body.type === 'leave') {
        room.removePlayer(player.id, now);
        sendJson(res, 200, { ok: true });
        return;
      }
      const outcome = room.command(player.id, String(body.type || ''), body.payload, now);
      sendJson(res, outcome.ok ? 200 : 400, outcome);
      return;
    }

    throw new HttpError(404, 'Unknown endpoint.');
  }

  const server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname === '/healthz') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('ok');
      return;
    }
    if (url.pathname.startsWith('/api/')) {
      handleApi(req, res, url).catch(error => {
        if (!(error instanceof HttpError)) log(error.stack || String(error));
        if (!res.headersSent) sendJson(res, error.status || 500, { error: error instanceof HttpError ? error.message : 'Server error.' });
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

  let timers = [];
  async function start(port) {
    await load();
    timers = [setInterval(tickRooms, 400), setInterval(pingStreams, 20000), setInterval(flush, SAVE_EVERY_MS)];
    await new Promise(resolve => server.listen(port, resolve));
    return server.address().port;
  }

  async function stop() {
    timers.forEach(clearInterval);
    streams.forEach(set => set.forEach(client => client.res.end()));
    if (saving) await saving; // a save already in flight may miss the latest changes
    await flush();
    await new Promise(resolve => {
      server.close(() => resolve());
      server.closeAllConnections();
    });
  }

  return { server, rooms, start, stop, flush };
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 8080;
  const app = createApp({ storage: createStorage(process.env, path.join(ROOT, 'var')), log: message => console.log(message) });
  app.start(port).then(() => {
    console.log(`Fleet Council server on http://localhost:${port}/world.html`);
  }).catch(error => {
    console.error('Could not start:', error);
    process.exit(1);
  });
  // Render sends SIGTERM before a deploy or a free-tier spin-down: save rooms first.
  let stopping = false;
  const shutdown = signal => {
    if (stopping) return;
    stopping = true;
    console.log(`${signal}: saving rooms before exit.`);
    app.stop().finally(() => process.exit(0));
    setTimeout(() => process.exit(0), 8000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

module.exports = { createApp };
