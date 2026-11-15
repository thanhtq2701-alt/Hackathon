const assert = require('assert');
const fs = require('fs');
const path = require('path');
const core = require('../app/game-core.js');
const content = require('../data/content.js');

function test(name, run) {
  run();
  console.log('PASS ' + name);
}

test('initial state has the original starting values and a balanced topic queue', function () {
  const state = core.createInitialState(() => 0.5);

  assert.equal(state.turn, 1);
  assert.deepEqual(state.bars, {
    publicApproval: 50,
    internationalTension: 30,
    economicState: 70,
    stateAuthority: 50,
    partyLoyalty: 60
  });
  assert.equal(state.energy, 100);
  assert.equal(state.topicQueue.length, 40);
  for (const topic of ['environment', 'war', 'economy', 'civilrights', 'scandal']) {
    assert.equal(state.topicQueue.filter(item => item === topic).length, 8);
  }
});

test('normal choices preserve delta caps and clamp resource bars', function () {
  const state = core.createInitialState(() => 0.5);
  state.bars.publicApproval = 96;
  state.energy = 98;

  core.applyDeltas(state, { approval: 20, tension: -20, energy: 8, empathy: 150 });

  assert.equal(state.bars.publicApproval, 100);
  assert.equal(state.bars.internationalTension, 21);
  assert.equal(state.energy, 100);
  assert.equal(state.empathy, 100);
});

test('convergence route preserves its multiplier and bypasses the normal delta cap', function () {
  const state = core.createInitialState(() => 0.5);
  state.activeArc = { id: 'convergence_route' };
  state.activeArcActIndex = 0;

  core.applyDeltas(state, { approval: 15, energy: -50 });

  assert.equal(state.bars.publicApproval, 87.5);
  assert.equal(state.energy, 0);
});

test('scaled choices round display deltas without changing the original choice', function () {
  const choice = { approval: 1.6, empathy: -2.4, energy: 3 };
  const scaled = core.scaleChoice(choice);

  assert.deepEqual(scaled, { approval: 2, empathy: -2, energy: 3 });
  assert.deepEqual(choice, { approval: 1.6, empathy: -2.4, energy: 3 });
});

test('hidden behavior counters change only for non-arc choices', function () {
  const state = core.createInitialState(() => 0.5);
  const choice = { empathy: 1, integrity: -1, ideology: 1, unrest: 2, party: 1 };

  core.trackHiddenBehaviors(state, choice, 'environment', false);
  assert.deepEqual(state.hiddenStats.behaviors, {
    environmentHarming: 1,
    compassionate: 1,
    authoritarian: 1,
    corrupt: 1
  });

  core.trackHiddenBehaviors(state, choice, 'environment', true);
  assert.deepEqual(state.hiddenStats.behaviors, {
    environmentHarming: 1,
    compassionate: 1,
    authoritarian: 1,
    corrupt: 1
  });
});

test('extracted game content retains the expected cards, story arcs, and endings', function () {
  const cardCount = Object.keys(content.CARDS).reduce((total, topic) => total + content.CARDS[topic].length, 0);
  const actCount = content.ARCS.reduce((total, arc) => total + arc.acts.length, 0);

  assert.equal(cardCount, 100);
  assert.equal(content.ARCS.length, 4);
  assert.equal(actCount, 70);
  assert.equal(content.ENDINGS.length, 12);
});

test('root web entry point references existing organized assets', function () {
  const repositoryRoot = path.resolve(__dirname, '..');
  const html = fs.readFileSync(path.join(repositoryRoot, 'index.html'), 'utf8');
  const references = html.match(/(?:src|href)="([^"]+)"/g) || [];
  const localAssets = references
    .map(function (reference) { return reference.match(/="([^"]+)"/)[1]; })
    .filter(function (reference) { return /\.(?:js|css)$/.test(reference); });

  assert.equal(localAssets.length, 6);
  localAssets.forEach(function (asset) {
    assert.ok(fs.existsSync(path.join(repositoryRoot, asset)), 'Missing web asset: ' + asset);
  });
});

// ── Turn rules (app/game-core.js) ──────────────────────────────────────────

const arcById = id => content.ARCS.find(arc => arc.id === id);

test('a confirmed choice reports the change actually applied, not the raw card numbers', function () {
  const state = core.createInitialState(() => 0.5);
  state.bars.publicApproval = 95;
  const { applied } = core.applyChoice(state, { text: 'Cut taxes', approval: 12, eco: -3 }, 'economy', false, 'Budget');

  assert.deepEqual(applied, { approval: 5, eco: -3 }); // +12 is capped at +9, then the bar stops at 100
  assert.equal(state.arcTriggerCounts.economy, 1);
  assert.deepEqual(state.definingChoices[0], { topic: 'ECONOMY', card: 'Budget', choice: 'Cut taxes' });
});

test('offering to resign ends the run only when Approval stays under 50', function () {
  const revolution = arcById('revolution');
  const resign = revolution.acts.flatMap(act => act.choices).find(choice => choice.resignation);

  const accepted = core.createInitialState(() => 0.5);
  accepted.activeArc = revolution;
  accepted.bars.publicApproval = 30;
  core.applyChoice(accepted, resign, 'arc', true, 'Revolution');
  assert.equal(accepted.resigned, true);
  assert.deepEqual(core.advanceArc(accepted, resign), { end: true });
  assert.equal(core.resolveEnding(accepted).title, 'The Resignation');

  const refused = core.createInitialState(() => 0.5);
  refused.activeArc = revolution;
  refused.bars.publicApproval = 45;
  core.applyChoice(refused, resign, 'arc', true, 'Revolution');
  assert.equal(refused.resigned, false);
  assert.deepEqual(core.advanceArc(refused, resign), { finished: true });
  assert.equal(refused.activeArc, null);
});

test('during the Revolution a collapse of the Economy removes you', function () {
  const state = core.createInitialState(() => 0.5);
  state.activeArc = arcById('revolution');
  state.bars.economicState = 8;
  assert.deepEqual(core.advanceArc(state, { nextAct: 1 }), { end: true });
  assert.equal(core.resolveEnding(state).title, 'The Impeached');
});

test('a party revolt warns for three turns and removes you on the fourth', function () {
  const state = core.createInitialState(() => 0.5);
  state.bars.partyLoyalty = 5;
  for (let turn = 1; turn <= 3; turn++) {
    const notices = [];
    assert.equal(core.checkFailSafes(state, notices), false);
    assert.ok(notices.some(n => n.includes('within ' + (4 - turn) + ' turn(s)')), notices.join(' | '));
  }
  assert.equal(core.checkFailSafes(state, []), true);
  assert.equal(state.impeached, true);
});

test('an economic crisis warns first and only penalises a turn without recovery', function () {
  const recovered = core.createInitialState(() => 0.5);
  recovered.bars.economicState = 10;
  core.checkFailSafes(recovered, []);
  assert.equal(recovered.economyWarned, true);
  recovered.bars.economicState = 30;
  core.checkFailSafes(recovered, []);
  assert.equal(recovered.economyWarned, false);
  assert.equal(recovered.bars.economicState, 30);

  const collapsed = core.createInitialState(() => 0.5);
  collapsed.bars.economicState = 10;
  const notices = [];
  core.checkFailSafes(collapsed, notices);
  assert.ok(notices[0].includes('economy is failing'));
  assert.equal(collapsed.bars.economicState, 10);
  core.checkFailSafes(collapsed, notices);
  assert.deepEqual(collapsed.bars, { publicApproval: 20, internationalTension: 30, economicState: 50, stateAuthority: 30, partyLoyalty: 50 });
});

test('the Energy Core is checked before the passive +1: empty means The Lazarus Protocol', function () {
  const empty = core.createInitialState(() => 0.5);
  empty.energy = 0;
  const step = core.nextTurn(empty);
  assert.equal(step.end, true);
  assert.equal(empty.energy, 0);
  assert.equal(core.resolveEnding(empty, step.override).title, 'The Lazarus Protocol');

  const nearlyFull = core.createInitialState(() => 0.5);
  nearlyFull.energy = 99;
  assert.equal(core.nextTurn(nearlyFull).end, false);
  assert.equal(nearlyFull.energy, 100);
  core.nextTurn(nearlyFull);
  assert.equal(nearlyFull.energy, 100);
  assert.equal(nearlyFull.turn, 3);
});

test('a run ends after turn 40 unless a story arc is still running', function () {
  const state = core.createInitialState(() => 0.5);
  state.turn = 40;
  assert.equal(core.nextTurn(state).end, true);

  const inArc = core.createInitialState(() => 0.5);
  inArc.turn = 40;
  inArc.activeArc = arcById('legacy');
  assert.equal(core.nextTurn(inArc).end, false);
  assert.equal(inArc.turn, 41);
});

test('in shorter runs normal cards weigh more; arc acts and Energy do not', function () {
  const card = { approval: 6, energy: -4 };
  const full = core.createInitialState(() => 0.5, 40);
  const short = core.createInitialState(() => 0.5, 20);
  const medium = core.createInitialState(() => 0.5, 30);
  core.applyDeltas(full, card);
  core.applyDeltas(short, card);
  core.applyDeltas(medium, card);
  assert.equal(full.bars.publicApproval, 56);
  assert.equal(short.bars.publicApproval, 60);   // 6 x 1.7 = 10.2, rounded
  assert.equal(medium.bars.publicApproval, 58);  // 6 x 1.25 = 7.5, rounded
  assert.equal(short.energy, 96);

  const capped = core.createInitialState(() => 0.5, 20);
  core.applyDeltas(capped, { approval: 12 });
  assert.equal(capped.bars.publicApproval, 65); // the +-9 cap grows too: 9 x 1.7, rounded to 15

  const inArc = core.createInitialState(() => 0.5, 20);
  inArc.activeArc = arcById('legacy');
  core.applyDeltas(inArc, { approval: 6 });
  assert.equal(inArc.bars.publicApproval, 56);
});

test('a run can last 20, 30 or 40 turns and the Legacy arc opens on its last turn', function () {
  assert.equal(core.createInitialState(() => 0.5).maxTurns, 40);
  assert.equal(core.createInitialState(() => 0.5, 25).maxTurns, 40);

  const short = core.createInitialState(() => 0.5, 20);
  short.turn = 19;
  assert.equal(core.nextTurn(short).arcStarted.id, 'legacy');
  assert.equal(short.turn, 20);
  short.activeArc = null; // the arc was played out
  assert.equal(core.nextTurn(short).end, true);
});

test('story arcs: the Revolution rallies Approval, Convergence waits for turn 6, three arcs at most', function () {
  const revolt = core.createInitialState(() => 0.5);
  revolt.bars.stateAuthority = 20;
  revolt.bars.publicApproval = 5;
  const notices = [];
  assert.equal(core.checkArcTriggers(revolt, notices).id, 'revolution');
  assert.equal(revolt.bars.publicApproval, 20);
  assert.ok(notices[0].includes('rally'));

  const tense = core.createInitialState(() => 0.5);
  tense.bars.internationalTension = 99;
  tense.turn = 5;
  assert.equal(core.checkArcTriggers(tense, []), null);
  tense.turn = 6;
  assert.equal(core.checkArcTriggers(tense, []).id, 'convergence_route');

  const veteran = core.createInitialState(() => 0.5);
  veteran.arcsCompleted = ['the_scandal', 'revolution', 'legacy'];
  veteran.turn = 10;
  veteran.bars.internationalTension = 99;
  assert.equal(core.checkArcTriggers(veteran, []), null);
});

test('cards do not repeat until their topic runs out, and Approval 80+ halves Approval gains', function () {
  const state = core.createInitialState(() => 0.5);
  state.topicQueue = state.topicQueue.map(() => 'economy');
  const pool = content.CARDS.economy;
  const seen = new Set();
  for (let i = 0; i < pool.length; i++) seen.add(core.drawCard(state, () => 0.99).card.title);
  assert.equal(seen.size, pool.length);
  core.drawCard(state, () => 0);
  assert.equal(state.cardHistory.economy.length, 1); // the topic ran out and started over

  state.bars.publicApproval = 85;
  let checked = 0;
  for (let i = 0; i < pool.length; i++) {
    const { card } = core.drawCard(state, () => 0);
    const original = pool.find(c => c.title === card.title);
    card.choices.forEach((choice, k) => {
      const before = original.choices[k].approval;
      if (before > 0) { assert.equal(choice.approval, Math.ceil(before / 2)); checked++; }
    });
  }
  assert.ok(checked > 0);
});

test('gift cards appear once, and low Party Loyalty can lock two of four options', function () {
  const state = core.createInitialState(() => 0.5);
  state.bars.internationalTension = 5;
  assert.equal(core.giftCard(state, () => 0).title, 'The Golden Standard');
  assert.equal(core.giftCard(state, () => 0), null);

  state.bars.partyLoyalty = 30;
  assert.deepEqual(core.partyLock(state, 4, () => 0), []);
  state.bars.partyLoyalty = 5;
  const locked = core.partyLock(state, 4, () => 0);
  assert.equal(locked.length, 2);
  assert.notEqual(locked[0], locked[1]);
  assert.deepEqual(core.partyLock(state, 3, () => 0), []);
});

test('the last Convergence act depends on Tension and picks the matching ending', function () {
  const convergence = arcById('convergence_route');
  const last = convergence.acts[convergence.acts.length - 1];

  const calm = core.createInitialState(() => 0.5);
  calm.activeArc = convergence;
  calm.bars.internationalTension = 40;
  const peace = core.resolveAct(last, calm).choices;
  assert.deepEqual(peace.map(c => c.text), ['The Peacemaker Ending.']);
  const step = core.advanceArc(calm, peace[0]);
  assert.equal(step.end, true);
  assert.equal(core.resolveEnding(calm, step.override).title, 'The Peacemaker');

  const war = core.createInitialState(() => 0.5);
  war.activeArc = convergence;
  war.bars.internationalTension = 70;
  war.bars.publicApproval = 40;
  const wage = core.resolveAct(last, war).choices.find(c => c.text === 'WAGE WAR');
  core.applyChoice(war, wage, 'arc', true, 'Ultimatum');
  assert.equal(war.impeached, true);
  assert.equal(core.resolveEnding(war, core.advanceArc(war, wage).override).title, 'The Impeached');
});
