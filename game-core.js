(function (root) {
  const statKeys = {
    approval: 'publicApproval',
    tension: 'internationalTension',
    eco: 'economicState',
    unrest: 'stateAuthority',
    party: 'partyLoyalty'
  };
  const topics = ['environment', 'war', 'economy', 'civilrights', 'scandal'];

  function clamp(value, minimum, maximum) {
    return Math.max(minimum, Math.min(maximum, value));
  }

  function buildTopicQueue(random = Math.random) {
    const queue = [];
    for (let i = 0; i < 8; i++) {
      queue.push(...[...topics].sort(() => random() - 0.5));
    }
    return queue;
  }

  function createInitialState(random = Math.random) {
    return {
      turn: 1,
      bars: { publicApproval: 50, internationalTension: 30, economicState: 70, stateAuthority: 50, partyLoyalty: 60 },
      energy: 100,
      lowApprovalTurns: 0, lowEconomyTurns: 0, lowAuthorityTurns: 0, highTensionTurns: 0,
      empathy: 0, integrity: 0, courage: 0, ideologyScore: 0,
      arcTriggerCounts: { environment: 0, war: 0, economy: 0, civilrights: 0, scandal: 0 },
      hiddenStats: {
        behaviors: { environmentHarming: 0, compassionate: 0, authoritarian: 0, corrupt: 0 },
        sacrifices: []
      },
      activeArc: null, activeArcActIndex: 0,
      arcsCompleted: [], arcsTriggered: [],
      impeached: false,
      definingChoices: [],
      cardHistory: { environment: [], war: [], economy: [], civilrights: [], scandal: [] },
      topicQueue: buildTopicQueue(random)
    };
  }

  function applyDeltas(state, choice) {
    let multiplier = 1;
    if (state.activeArc && state.activeArc.id === 'convergence_route' && state.activeArcActIndex < 4) {
      multiplier = 2.5;
    }

    Object.keys(statKeys).forEach(key => {
      if (choice[key]) {
        let value = choice[key] * multiplier;
        if (!(state.activeArc && state.activeArc.id === 'convergence_route')) {
          value = clamp(value, -9, 9);
        }
        const stateKey = statKeys[key];
        state.bars[stateKey] = clamp(state.bars[stateKey] + value, 0, 100);
      }
    });

    if (choice.empathy) state.empathy += clamp(choice.empathy * multiplier, -100, 100);
    if (choice.integrity) state.integrity += clamp(choice.integrity * multiplier, -100, 100);
    if (choice.courage) state.courage += clamp(choice.courage * multiplier, -100, 100);
    if (choice.ideology) state.ideologyScore += clamp(choice.ideology * multiplier, -100, 100);

    if (choice.energy) {
      state.energy += choice.energy * multiplier;
      if (state.energy > 100) state.energy = 100;
      if (state.energy < 0) state.energy = 0;
    }

    return state;
  }

  function scaleDelta(value) {
    if (!value) return 0;
    return Math.round(value * 1.0);
  }

  function scaleChoice(choice) {
    const scaled = Object.assign({}, choice);
    ['approval', 'tension', 'eco', 'unrest', 'party', 'empathy', 'integrity', 'courage', 'ideology'].forEach(key => {
      if (typeof choice[key] === 'number') scaled[key] = scaleDelta(choice[key]);
    });
    return scaled;
  }

  function trackHiddenBehaviors(state, choice, topic, isArc) {
    if (isArc) return;
    const behaviors = state.hiddenStats.behaviors;
    const harmsEnvironment = topic === 'environment'
      && (choice.empathy < 0 || choice.integrity < 0 || choice.ideology > 0);
    if (harmsEnvironment) behaviors.environmentHarming++;
    if (choice.empathy > 0) behaviors.compassionate++;
    if (choice.unrest > 0 && choice.party > 0) behaviors.authoritarian++;
    if (choice.integrity < 0) behaviors.corrupt++;
  }

  root.TheOvalCore = {
    applyDeltas,
    buildTopicQueue,
    clamp,
    createInitialState,
    scaleChoice,
    scaleDelta,
    trackHiddenBehaviors
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.TheOvalCore;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
