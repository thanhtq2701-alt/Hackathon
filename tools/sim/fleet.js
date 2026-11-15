// Fleet Council bot-vs-bot simulation: plays all-bot rooms with the real room bots and rules
// and prints the balance numbers tracked in docs/PROJECT.md.
//
//   node tools/sim/fleet.js                      all scenarios, default match counts
//   node tools/sim/fleet.js --matches 200        same number of matches for every scenario
//   node tools/sim/fleet.js --scenario 2v2 --turns 14 --seed 7
//
// Scenarios: 4v1 (crew of four against a solo pilot, sides alternate), 2v2, 3w (three solo worlds).
// Every match is seeded, so the same options always print the same numbers.
const { Room, DEFAULT_SETTINGS } = require('../../app/world-room.js');
const { WORLD_TEMPLATES } = require('../../data/world-content.js');

const SCENARIOS = {
  '4v1': { crews: [4, 1], matches: 3000, alternate: true },
  '2v2': { crews: [2, 2], matches: 1000 },
  '3w': { crews: [1, 1, 1], matches: 2500 }
};

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1];
  }
  return args;
}

// Plays one all-bot match. Room.tick() pauses without a connected human, so the phases are driven here
// the same way tick() drives them: bots act, the vote locks when everyone decided or the timer ran out.
function playMatch(crews, maxTurns, seed) {
  const room = new Room({ code: 'SIM', seed });
  room.settings = Object.assign({}, DEFAULT_SETTINGS, { worldCount: crews.length, maxTurns });
  const worldIds = WORLD_TEMPLATES.slice(0, crews.length).map(w => w.id);
  let now = 0;
  worldIds.forEach((id, w) => {
    for (let k = 0; k < crews[w]; k++) room.addPlayer('Bot ' + id + ' ' + (k + 1), now, true, id);
  });
  room.startMatch(now);

  const stats = { raids: 0, aborted: 0, attackerWins: 0, polls: 0, crises: 0, stuckVotes: 0 };
  for (let guard = 0; room.phase !== 'ended'; guard++) {
    if (guard > 100000) throw new Error('Match did not finish (seed ' + seed + ')');
    now += 500;
    if (room.phase === 'vote') {
      room.runBots(now);
      const decided = room.everyoneDecided();
      if (decided || now >= room.deadline) {
        if (!decided) stats.stuckVotes++;
        room.lockAndResolve(now);
        Object.entries(room.match.lastReport.worlds).forEach(([id, report]) => {
          stats.polls++;
          if (report.crisis) stats.crises++;
          report.battles.filter(b => b.attackerId === id).forEach(b => {
            if (b.aborted) { stats.aborted++; return; }
            stats.raids++;
            if (b.winner === b.attackerId) stats.attackerWins++;
          });
        });
      }
    } else if (room.phase === 'report') {
      room.beginVote(now);
    }
  }
  const results = room.match.results;
  return {
    worldIds,
    winners: results.winners,
    coreLevels: worldIds.map(id => room.match.worlds[id].buildings.core.level),
    stats
  };
}

function pct(part, whole) {
  return whole ? (100 * part / whole).toFixed(1) + '%' : '-';
}

function runScenario(name, options) {
  const spec = SCENARIOS[name];
  const matches = options.matches || spec.matches;
  const totals = { raids: 0, aborted: 0, attackerWins: 0, polls: 0, crises: 0, stuckVotes: 0 };
  const winShareByCrew = {};      // crew size -> summed share of wins (a tie splits the win)
  const seatsByCrew = {};         // crew size -> number of worlds with that crew size
  const winShareByPosition = spec.crews.map(() => 0);
  let matchesWithRaid = 0;
  let coreSum = 0;
  let coreCount = 0;
  const coreHistogram = {};

  for (let i = 0; i < matches; i++) {
    // Alternating sides keeps the world position from biasing a lopsided matchup.
    const crews = spec.alternate && i % 2 ? spec.crews.slice().reverse() : spec.crews;
    const result = playMatch(crews, options.turns, options.seed + i);
    Object.keys(totals).forEach(k => { totals[k] += result.stats[k]; });
    if (result.stats.raids + result.stats.aborted > 0) matchesWithRaid++;
    result.worldIds.forEach((id, w) => {
      const share = result.winners.includes(id) ? 1 / result.winners.length : 0;
      winShareByCrew[crews[w]] = (winShareByCrew[crews[w]] || 0) + share;
      seatsByCrew[crews[w]] = (seatsByCrew[crews[w]] || 0) + 1;
      winShareByPosition[w] += share;
      const level = result.coreLevels[w];
      coreSum += level;
      coreCount++;
      coreHistogram[level] = (coreHistogram[level] || 0) + 1;
    });
  }

  console.log(`\n== ${name}: crews ${spec.crews.join(' vs ')}, ${matches} matches, ${options.turns} turns, seed ${options.seed} ==`);
  const sizes = Object.keys(seatsByCrew).map(Number).sort((a, b) => b - a);
  if (sizes.length > 1) {
    sizes.forEach(size => console.log(`  Win rate, crew of ${size}:   ${pct(winShareByCrew[size], seatsByCrew[size])}`));
  }
  if (!spec.alternate) {
    console.log(`  Win share by world:     ${winShareByPosition.map((s, w) => WORLD_TEMPLATES[w].name + ' ' + pct(s, matches)).join(' / ')}`);
  }
  console.log(`  Raids per match:        ${(totals.raids / matches).toFixed(2)} (plus ${(totals.aborted / matches).toFixed(2)} turned back)`);
  console.log(`  Matches with a raid:    ${pct(matchesWithRaid, matches)}`);
  console.log(`  Attacker wins:          ${pct(totals.attackerWins, totals.raids)}`);
  console.log(`  Final Command Core:     avg Lv${(coreSum / coreCount).toFixed(2)}  (${Object.keys(coreHistogram).sort().map(l => 'Lv' + l + ' ' + pct(coreHistogram[l], coreCount)).join(', ')})`);
  console.log(`  Crisis polls:           ${pct(totals.crises, totals.polls)}`);
  console.log(`  Votes that hit the timer: ${totals.stuckVotes}`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const options = {
    matches: args.matches ? Number(args.matches) : null,
    turns: args.turns ? Number(args.turns) : DEFAULT_SETTINGS.maxTurns,
    seed: args.seed ? Number(args.seed) : 1
  };
  const names = args.scenario ? [args.scenario] : Object.keys(SCENARIOS);
  names.forEach(name => {
    if (!SCENARIOS[name]) throw new Error('Unknown scenario ' + name + ' (use ' + Object.keys(SCENARIOS).join(', ') + ')');
  });
  const started = Date.now();
  names.forEach(name => runScenario(name, options));
  console.log(`\nDone in ${((Date.now() - started) / 1000).toFixed(1)} s.`);
}

if (require.main === module) main();
module.exports = { playMatch, SCENARIOS };
