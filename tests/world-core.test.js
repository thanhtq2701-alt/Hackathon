const assert = require('assert');
const http = require('http');
const content = require('../data/world-content.js');
const core = require('../app/world-core.js');
const { Room } = require('../app/world-room.js');

const pending = [];
function test(name, run) {
  const result = run();
  if (result && typeof result.then === 'function') {
    pending.push(result.then(() => console.log('PASS ' + name), error => {
      console.error('FAIL ' + name);
      throw error;
    }));
  } else {
    console.log('PASS ' + name);
  }
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

test('construction costs resources, is limited to one per turn and respects the Command Core', function () {
  const match = twoWorldMatch();
  core.startTurn(match);
  const world = match.worlds.aurora;
  assert.throws(() => core.startBuild(match, 'a1', 'mine'), /Needs Command Core Lv2/);
  core.startBuild(match, 'a1', 'shipyard');
  assert.equal(world.gold, 25);
  assert.equal(world.ore, 30);
  assert.throws(() => core.startBuild(match, 'a2', 'shield'), /One build per turn/);
  assert.equal(world.buildings.shipyard.level, 0);
  core.resolveTurn(match);
  assert.equal(world.buildings.shipyard.level, 1);
  assert.equal(core.fleetCap(world), 6);
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

test('the online server creates rooms, accepts commands and streams snapshots', function () {
  const { start } = require('../server/server.js');
  const server = start(0);
  return new Promise((resolve, reject) => {
    server.on('listening', async () => {
      const base = `http://127.0.0.1:${server.address().port}`;
      const post = (path, body) => fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(r => r.json());
      try {
        const created = await post('/api/create', { name: '<b>Host</b>' });
        assert.match(created.code, /^[A-Z]{4}$/);
        const joined = await post('/api/join', { code: created.code, name: 'Guest' });
        assert.notEqual(joined.token, created.token);
        const bad = await post('/api/command', { code: created.code, token: joined.token, type: 'start' });
        assert.equal(bad.ok, false);

        const first = await new Promise((done, fail) => {
          const req = http.get(`${base}/api/events?code=${created.code}&token=${created.token}`, res => {
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
        assert.equal(first.phase, 'lobby');
        assert.equal(first.me.name.includes('<'), false);
        assert.equal(first.lobby.reduce((n, w) => n + w.members.length, 0), 2);

        const started = await post('/api/command', { code: created.code, token: created.token, type: 'start' });
        assert.equal(started.ok, true);
        const page = await fetch(base + '/world.html');
        assert.equal(page.status, 200);
        const blocked = await fetch(base + '/server/server.js');
        assert.equal(blocked.status, 404);
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        server.close();
        server.closeAllConnections();
      }
    });
  });
});

Promise.all(pending).catch(error => {
  console.error(error);
  process.exit(1);
});
