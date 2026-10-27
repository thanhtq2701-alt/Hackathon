const assert = require('assert');
const core = require('../game-core.js');
const content = require('../content.js');

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

  test('extracted game content retains the expected cards, story arcs, and endings', function () {
    const cardCount = Object.keys(content.CARDS).reduce((total, topic) => total + content.CARDS[topic].length, 0);
    const actCount = content.ARCS.reduce((total, arc) => total + arc.acts.length, 0);

    assert.equal(cardCount, 100);
    assert.equal(content.ARCS.length, 4);
    assert.equal(actCount, 70);
    assert.equal(content.ENDINGS.length, 9);
  });

  core.trackHiddenBehaviors(state, choice, 'environment', true);
  assert.deepEqual(state.hiddenStats.behaviors, {
    environmentHarming: 1,
    compassionate: 1,
    authoritarian: 1,
    corrupt: 1
  });
});
