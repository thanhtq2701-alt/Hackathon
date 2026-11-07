const assert = require('assert');
const http = require('http');
const content = require('../data/world-content.js');
const core = require('../app/world-core.js');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { Room } = require('../app/world-room.js');
const { fileStorage, upstashStorage } = require('../server/storage.js');
const { createApp } = require('../server/server.js');

function tempStorage() {
  return fileStorage(fs.mkdtempSync(path.join(os.tmpdir(), 'fleet-council-test-')));
}

async function startApp(storage) {
  const app = createApp({ storage });
  const port = await app.start(0);
  const base = `http://127.0.0.1:${port}`;
  const post = (route, body) => fetch(base + route, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    .then(async r => Object.assign({ status: r.status }, await r.json()));
  return { app, base, post };
}

function firstSnapshot(base, code, token) {
  return new Promise((done, fail) => {
    const req = http.get(`${base}/api/events?code=${code}&token=${token}`, res => {
      let buffer = '';
      res.on('data', chunk => {
        buffer += chunk;
        const match = buffer.match(/data: (.*)\n\n/);
        if (match) {
          req.destroy();
          done(JSON.parse(match[1]));
        }
      });
    });
    req.on('error', fail);
  });
}

// Tests run one after another so the server tests never overlap.
let chain = Promise.resolve();
function test(name, run) {
  chain = chain.then(async () => {
    try {
      await run();
      console.log('PASS ' + name);
    } catch (error) {
      console.error('FAIL ' + name);
      console.error(error);
      process.exitCode = 1;
    }
  });
}

function twoWorldMatch(extraPlayers) {
  return core.createMatch({
    seed: 7,
    maxTurns: 10,
    worlds: content.WORLD_TEMPLATES.slice(0, 2),
    players: [
      { id: 'a1', name: 'A1', worldId: 'aurora' },
      { id: 'a2', name: 'A2', worldId: 'aurora' },
      { id: 'n1', name: 'N1', worldId: 'nova' }
    ].concat(extraPlayers || [])
  });
}

test('every poll offers 3-4 balanced options with a real trade-off', function () {
  const ids = new Set();
  content.SITUATIONS.forEach(situation => {
    assert.ok(!ids.has(situation.id), 'duplicate id ' + situation.id);
    ids.add(situation.id);
    assert.ok(situation.options.length >= 3 && situation.options.length <= 4, situation.id);
    const values = situation.options.map(o => core.optionValue(o.effects));
    assert.ok(Math.max(...values) - Math.min(...values) <= 1, `${situation.id} options are not balanced: ${values}`);
    situation.options.forEach((option, i) => {
      const deltas = Object.values(option.effects);
      assert.ok(deltas.some(d => d > 0) && deltas.some(d => d < 0), `${situation.id} option ${i + 1} has no trade-off`);
      Object.entries(option.effects).forEach(([key, d]) => {
        if (core.STAT_KEYS.includes(key)) assert.ok(Math.abs(d) <= 10, `${situation.id} stat delta too large`);
      });
    });
  });
  assert.ok(content.SITUATIONS.length >= 20);
});

test('all worlds start equal at 50', function () {
  const match = twoWorldMatch();
  Object.values(match.worlds).forEach(world => {
    assert.deepEqual(world.stats, { morale: 50, economy: 50, energy: 50, security: 50 });
    assert.equal(world.gold, 50);
    assert.equal(world.ore, 50);
    assert.equal(world.ships, 3);
  });
  Object.values(match.players).forEach(player => assert.equal(player.inventory.length, 1));
});

test('plurality vote wins and the report shows the change actually applied', function () {
  const match = twoWorldMatch();
  core.startTurn(match);
  const world = match.worlds.aurora;
  world.poll = { situationId: 'solar_flare', vetoed: [] };
  world.stats.security = 97; // option 1 gives +6 Security, which must clamp at 100
  core.castVote(match, 'a1', 0);
  core.castVote(match, 'a2', 0);
  const report = core.resolveTurn(match).worlds.aurora;
  assert.equal(report.chosenIndex, 0);
  assert.equal(report.pollDelta.security, 3);
  assert.equal(report.pollDelta.energy, -5);
});

test('no votes fall back to the first available option; locked options cannot be voted', function () {
  const match = twoWorldMatch();
  core.startTurn(match);
  const world = match.worlds.aurora;
  world.poll = { situationId: 'miners_strike', vetoed: [] };
  world.gold = 5; // "Raise their wages" costs 16 gold
  assert.throws(() => core.castVote(match, 'a1', 0), /Needs 16 gold/);
  const tally = core.tallyPoll(match, world);
  assert.equal(tally.option.index, 1);
});

test('veto strikes an option, clears its votes and keeps at least two options', function () {
  const match = twoWorldMatch();
  core.startTurn(match);
  const world = match.worlds.aurora;
  world.poll = { situationId: 'reactor_overload', vetoed: [] };
  match.players.a1.inventory = [{ uid: 'v1', type: 'veto' }, { uid: 'v2', type: 'veto' }];
  match.players.a2.inventory = [{ uid: 'v3', type: 'veto' }];
  core.castVote(match, 'a2', 2);
  core.playCard(match, 'a1', 'v1', 2);
  assert.equal(world.votes.a2, undefined);
  assert.throws(() => core.playCard(match, 'a1', 'v2', 1), /One special card per turn/);
  core.playCard(match, 'a2', 'v3', 3);
  assert.equal(core.pollOptions(world).filter(o => !o.vetoed).length, 2);
});

test('buildings fill storage, harvesting moves it to the treasury and grants EXP', function () {
  const match = twoWorldMatch();
  core.startTurn(match);
  core.resolveTurn(match);
  const world = match.worlds.aurora;
  const stored = world.buildings.mine.storage;
  assert.ok(stored > 0);
  const goldBefore = world.gold;
  const expBefore = match.players.a1.exp;
  const result = core.harvest(match, 'a1', 'mine');
  assert.equal(result.amount, stored);
  assert.equal(world.gold, goldBefore + stored);
  assert.equal(world.buildings.mine.storage, 0);
  assert.ok(match.players.a1.exp > expBefore);
  assert.throws(() => core.harvest(match, 'a1', 'mine'), /Storage is empty/);
});

test('storage is capped at three turns of production', function () {
  const match = twoWorldMatch();
  for (let i = 0; i < 6; i++) {
    core.startTurn(match);
    core.resolveTurn(match);
  }
  const mine = match.worlds.aurora.buildings.mine;
  assert.equal(mine.storage, core.storageCap('mine', mine.level));
});

// A poll option without gold or ore effects, so treasury checks only see construction and upkeep.
function neutralPoll(match, worldId) {
  match.worlds[worldId].poll = { situationId: 'alien_signal', vetoed: [] };
  core.membersOf(match, worldId).forEach(p => core.castVote(match, p.id, 1));
}

test('construction is a crew plan: nothing is spent until the vote ends and it is approved', function () {
  const match = twoWorldMatch();
  core.startTurn(match);
  neutralPoll(match, 'aurora');
  const world = match.worlds.aurora;
  assert.throws(() => core.proposeBuild(match, 'a1', 'mine'), /Needs Command Core Lv2/);
  core.proposeBuild(match, 'a1', 'shipyard');
  assert.equal(world.gold, 50);
  assert.throws(() => core.proposeBuild(match, 'a2', 'shield'), /One build per turn/);
  assert.throws(() => core.cancelBuild(match, 'a2'), /Only the proposer/);
  core.voteBuild(match, 'a2', true);
  const report = core.resolveTurn(match).worlds.aurora;
  assert.equal(world.buildings.shipyard.level, 1);
  assert.equal(world.gold, 50 - 25 - 3); // construction, then upkeep for 3 ships
  assert.equal(world.ore, 30);
  assert.equal(core.fleetCap(world), 6);
  assert.equal(match.players.a1.record.builds, 1);
  assert.ok(report.notes.some(n => /Crew approved Shipyard Lv1 \(2 yes, 0 no\)/.test(n)));
});

test('a teammate can veto a build plan; silence does not block it; solo worlds decide alone', function () {
  const match = twoWorldMatch();
  core.startTurn(match);
  neutralPoll(match, 'aurora');
  core.proposeBuild(match, 'a1', 'shipyard');
  core.voteBuild(match, 'a2', false);
  core.proposeBuild(match, 'n1', 'shipyard');
  let report = core.resolveTurn(match);
  assert.equal(match.worlds.aurora.buildings.shipyard.level, 0);
  assert.equal(match.worlds.aurora.gold, 50 - 3);
  assert.ok(report.worlds.aurora.notes.some(n => /voted down \(1 yes, 1 no\)/.test(n)));
  assert.equal(match.worlds.nova.buildings.shipyard.level, 1);

  core.startTurn(match);
  neutralPoll(match, 'aurora');
  core.proposeBuild(match, 'a1', 'shipyard');
  report = core.resolveTurn(match);
  assert.equal(match.worlds.aurora.buildings.shipyard.level, 1);
});

test('a raid needs crew support and a winning raid moves loot and protects the loser', function () {
  const match = twoWorldMatch();
  core.startTurn(match);
  assert.throws(() => core.proposeRaid(match, 'a1', 'nova'), /turn 2/);
  core.resolveTurn(match);
  core.startTurn(match);

  core.proposeRaid(match, 'a1', 'nova');
  core.voteRaid(match, 'a2', false);
  assert.equal(core.raidPasses(match, match.worlds.aurora), false);
  core.voteRaid(match, 'a2', true);
  assert.equal(core.raidPasses(match, match.worlds.aurora), true);

  const attacker = match.worlds.aurora;
  const defender = match.worlds.nova;
  attacker.ships = 6;
  attacker.buildings.shipyard.level = 1;
  defender.ships = 1;
  const report = core.resolveTurn(match);
  const battle = report.worlds.aurora.battles[0];
  assert.equal(battle.winner, 'aurora');
  assert.ok(battle.goldLoot > 0);
  assert.equal(defender.protectedUntilTurn, match.turn);
  assert.ok(match.players.a1.record.raidsWon === 1 && match.players.a2.record.raidsWon === 1);
  core.startTurn(match);
  assert.match(core.raidLockReason(match, attacker, defender), /protection/);
});

test('aid moves exactly 10 units once per pilot per turn', function () {
  const match = twoWorldMatch();
  core.startTurn(match);
  core.sendAid(match, 'a1', 'nova', 'ore');
  assert.equal(match.worlds.aurora.ore, 40);
  assert.equal(match.worlds.nova.ore, 60);
  assert.throws(() => core.sendAid(match, 'a1', 'nova', 'ore'), /already sent/);
});

test('a full room with bots plays to the end and ranks every pilot', function () {
  let now = 0;
  let ended = null;
  const room = new Room({ code: 'TEST', seed: 99, now, onMatchEnd: (r, results) => { ended = results; } });
  const host = room.join('Host', now);
  room.setConnected(host.id, 1, now);
  assert.equal(room.command(host.id, 'settings', { worldCount: 3, maxTurns: 6 }, now).ok, true);
  assert.equal(room.command(host.id, 'start', {}, now).ok, false);
  room.command(host.id, 'fillBots', {}, now);
  room.command(host.id, 'addBot', { worldId: host.worldId }, now);
  assert.equal(room.command(host.id, 'start', {}, now).ok, true);

  for (let guard = 0; room.phase !== 'ended' && guard < 10000; guard++) {
    now += 500;
    if (room.phase === 'vote') {
      const world = room.match.worlds[host.worldId];
      if (world.votes[host.id] === undefined) room.command(host.id, 'vote', { option: core.pollOptions(world).find(o => !o.lockReason && !o.vetoed).index }, now);
      if (world.raid && world.raid.votes[host.id] === undefined) room.command(host.id, 'raidVote', { yes: false }, now);
    }
    room.tick(now);
  }
  assert.equal(room.phase, 'ended');
  assert.ok(ended && ended.winners.length >= 1);
  assert.equal(ended.players.length, 4); // host, a bot teammate, and one bot in each empty world
  for (let i = 1; i < ended.players.length; i++) assert.ok(ended.players[i - 1].exp >= ended.players[i].exp);
});

test('snapshots hide rival polls, raid plans and inventories', function () {
  const now = 0;
  const room = new Room({ code: 'HIDE', seed: 3, now });
  const a = room.join('Alpha', now);
  const b = room.join('Bravo', now);
  room.setConnected(a.id, 1, now);
  room.setConnected(b.id, 1, now);
  assert.notEqual(a.worldId, b.worldId);
  room.command(a.id, 'start', {}, now);
  const view = room.snapshot(a.id, now);
  const mine = view.match.worlds.find(w => w.id === a.worldId);
  const rival = view.match.worlds.find(w => w.id === b.worldId);
  assert.ok(mine.poll && mine.buildOptions);
  assert.equal(rival.poll, undefined);
  assert.equal(rival.raid, undefined);
  assert.equal(rival.buildings.mine.storage, undefined);
  assert.equal(JSON.stringify(view).includes(b.token), false);
  assert.ok(view.me.inventory.length === 1);
});

test('file storage round-trips JSON values and treats missing keys as empty', async function () {
  const storage = tempStorage();
  assert.equal(await storage.get('rooms'), null);
  await storage.set('room:ABCD', { a: 1, list: [1, 2] });
  assert.deepEqual(await storage.get('room:ABCD'), { a: 1, list: [1, 2] });
  await storage.del('room:ABCD');
  await storage.del('room:ABCD');
  assert.equal(await storage.get('room:ABCD'), null);
});

test('Upstash storage sends Redis commands over HTTPS with the token and a key prefix', async function () {
  const calls = [];
  const db = {};
  const fakeFetch = async (url, init) => {
    const command = JSON.parse(init.body);
    calls.push({ url, auth: init.headers.Authorization, command });
    let result = null;
    if (command[0] === 'SET') { db[command[1]] = command[2]; result = 'OK'; }
    if (command[0] === 'GET') result = command[1] in db ? db[command[1]] : null;
    if (command[0] === 'DEL') { delete db[command[1]]; result = 1; }
    return { ok: true, json: async () => ({ result }) };
  };
  const storage = upstashStorage('https://example.upstash.io', 'secret', fakeFetch);
  await storage.set('leaderboard', { thanh: { exp: 5 } });
  assert.deepEqual(await storage.get('leaderboard'), { thanh: { exp: 5 } });
  assert.equal(await storage.get('missing'), null);
  assert.deepEqual(calls[0], { url: 'https://example.upstash.io', auth: 'Bearer secret', command: ['SET', 'fc:leaderboard', '{"thanh":{"exp":5}}'] });
  const failing = upstashStorage('https://example.upstash.io', 'bad', async () => ({ ok: false, status: 401, json: async () => ({ error: 'Unauthorized' }) }));
  await assert.rejects(() => failing.get('x'), /Unauthorized/);
});

test('a saved room resumes mid-vote with its timer, seats and match intact', function () {
  let now = 1000;
  const room = new Room({ code: 'SAVE', seed: 5, now });
  const host = room.join('Host', now, 'host');
  room.setConnected(host.id, 1, now);
  room.command(host.id, 'fillBots', {}, now);
  room.command(host.id, 'start', {}, now);
  now += 30000; // 45 of 75 seconds left
  const saved = JSON.parse(JSON.stringify(room.toJSON(now)));

  const later = now + 10 * 60 * 1000; // the server was down for ten minutes
  const restored = Room.fromJSON(saved, {}, later);
  assert.equal(restored.phase, 'vote');
  assert.equal(restored.deadline, later + 45000);
  assert.equal(restored.playerByToken(host.token).id, host.id);
  assert.equal(restored.playerByAccount('host').id, host.id);
  assert.equal(restored.players.get(host.id).connections, 0);
  assert.equal(restored.match.turn, 1);

  restored.setConnected(host.id, 1, later);
  const world = restored.match.worlds[host.worldId];
  const option = core.pollOptions(world).find(o => !o.lockReason).index;
  assert.equal(restored.command(host.id, 'vote', { option }, later).ok, true);
  for (let t = later; restored.phase === 'vote' && t < later + 60000; t += 500) restored.tick(t);
  assert.equal(restored.phase, 'report');
  assert.equal(restored.match.turn, 2);
});

test('PIN accounts protect a pilot name, lock after repeated wrong PINs and rank only registered pilots', async function () {
  const { app, base, post } = await startApp(tempStorage());
  try {
    const health = await fetch(base + '/healthz');
    assert.equal(health.status, 200);

    const host = await post('/api/create', { name: 'Thanh', pin: '2701' });
    assert.equal(host.status, 200);
    assert.equal(host.registered, true);
    assert.equal((await post('/api/create', { name: 'thanh' })).status, 403);
    assert.equal((await post('/api/join', { code: host.code, name: 'THANH' })).status, 403);
    assert.equal((await post('/api/join', { code: host.code, name: 'Thanh', pin: '12' })).status, 400);

    // The right PIN on another device takes the same seat instead of a second one.
    const sameSeat = await post('/api/join', { code: host.code, name: 'thanh', pin: '2701' });
    assert.equal(sameSeat.playerId, host.playerId);

    const guest = await post('/api/join', { code: host.code, name: 'Guest' });
    assert.equal(guest.registered, false);

    for (let i = 0; i < 5; i++) assert.equal((await post('/api/join', { code: host.code, name: 'Thanh', pin: '0000' })).status, 403);
    assert.equal((await post('/api/join', { code: host.code, name: 'Thanh', pin: '2701' })).status, 429);

    // Play a short match to the end: only the registered pilot is ranked.
    const room = app.rooms.get(host.code);
    assert.equal((await post('/api/command', { code: host.code, token: host.token, type: 'settings', payload: { maxTurns: 6 } })).ok, true);
    assert.equal((await post('/api/command', { code: host.code, token: host.token, type: 'start' })).ok, true);
    room.setConnected(host.playerId, 1, Date.now());
    let t = Date.now();
    while (room.phase !== 'ended') {
      t += 1000;
      if (room.phase === 'report') room.deadline = t;
      if (room.phase === 'vote') room.deadline = t;
      room.tick(t);
    }
    const ranking = await (await fetch(base + '/api/leaderboard')).json();
    assert.deepEqual(ranking.players.map(p => p.name), ['Thanh']);
    assert.equal(ranking.players[0].matches, 1);
  } finally {
    await app.stop();
  }
});

test('the server keeps rooms, accounts and the ranking across a restart', async function () {
  const storage = tempStorage();
  const first = await startApp(storage);
  const host = await first.post('/api/create', { name: 'Host', pin: '4321' });
  const guest = await first.post('/api/join', { code: host.code, name: '<b>Guest</b>' });
  assert.equal((await first.post('/api/command', { code: host.code, token: guest.token, type: 'start' })).ok, false);
  const snapshot = await firstSnapshot(first.base, host.code, host.token);
  assert.equal(JSON.stringify(snapshot.lobby).includes('<'), false);
  assert.equal(snapshot.lobby.reduce((n, w) => n + w.members.length, 0), 2);
  assert.equal((await first.post('/api/command', { code: host.code, token: host.token, type: 'start' })).ok, true);
  assert.equal((await fetch(first.base + '/server/server.js')).status, 404);
  await first.app.stop(); // what Render's SIGTERM triggers

  const second = await startApp(storage);
  try {
    const rejoin = await second.post('/api/join', { code: host.code, token: guest.token });
    assert.equal(rejoin.status, 200);
    assert.equal(rejoin.playerId, guest.playerId);
    const view = await firstSnapshot(second.base, host.code, host.token);
    assert.equal(view.phase, 'vote');
    assert.equal(view.match.turn, 1);
    assert.equal((await second.post('/api/create', { name: 'host', pin: '1111' })).status, 403);
    assert.equal((await second.post('/api/create', { name: 'host', pin: '4321' })).status, 200);
  } finally {
    await second.app.stop();
  }
});

chain.then(() => {
  if (process.exitCode) process.exit(process.exitCode);
});
