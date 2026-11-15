// The Oval solo story: run state and every rule of a run (choices, turns, crises, story arcs, endings).
// The page (app/client.js) only renders what these functions decide, so the rules can be tested in Node.
(function (root) {
  const content = (typeof module !== 'undefined' && module.exports)
    ? require('../data/content.js')
    : root.TheOvalContent;
  const { CARDS, ARCS, ENDINGS, GIFTS } = content;

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

  // A run lasts 20, 30 or 40 turns (40 is the full story and the default).
  function createInitialState(random = Math.random, maxTurns = RUN_TURNS) {
    return {
      turn: 1,
      maxTurns: RUN_LENGTHS.includes(maxTurns) ? maxTurns : RUN_TURNS,
      bars: { publicApproval: 50, internationalTension: 30, economicState: 70, stateAuthority: 50, partyLoyalty: 60 },
      energy: 100,
      lowApprovalTurns: 0, lowEconomyTurns: 0, lowAuthorityTurns: 0, highTensionTurns: 0, lowLoyaltyTurns: 0,
      approvalWarned: false, economyWarned: false,
      empathy: 0, integrity: 0, courage: 0, ideologyScore: 0,
      arcTriggerCounts: { environment: 0, war: 0, economy: 0, civilrights: 0, scandal: 0 },
      hiddenStats: {
        behaviors: { environmentHarming: 0, compassionate: 0, authoritarian: 0, corrupt: 0 },
        sacrifices: []
      },
      activeArc: null, activeArcActIndex: 0,
      arcsCompleted: [], arcsTriggered: [],
      impeached: false,
      resigned: false,
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

  // ── Turn rules ─────────────────────────────────────────────────────────
  // `random` defaults to Math.random, so the page and the seeded simulator draw in the same order.

  const RUN_TURNS = 40;
  const RUN_LENGTHS = [20, 30, 40];
  const LAZARUS = {
    text: 'CRITICAL FAILURE',
    outcome: 'ENDING: The Lazarus Protocol. Energy core depleted. The space station has collapsed. Preparing to extract Legacy Data...'
  };
  const APPLIED_KEYS = { approval: 'publicApproval', tension: 'internationalTension', eco: 'economicState', unrest: 'stateAuthority', party: 'partyLoyalty', energy: 'energy' };

  function topicLabel(topic) {
    return topic.toUpperCase().replace('CIVILRIGHTS', 'CIVIL RIGHTS');
  }

  // A confirmed choice. Returns the scaled choice and what actually changed (what the card shows).
  function applyChoice(state, choice, topic, isArc, cardTitle) {
    const effective = scaleChoice(choice);
    const before = Object.assign({}, state.bars, { energy: state.energy });
    if (typeof choice.onSelect === 'function') choice.onSelect(state);
    applyDeltas(state, effective);
    // Offering to resign: the people accept when Approval (after this choice) is below 50.
    if (choice.resignation) state.resigned = state.bars.publicApproval < 50;
    const applied = {};
    Object.entries(APPLIED_KEYS).forEach(([key, stateKey]) => {
      const now = stateKey === 'energy' ? state.energy : state.bars[stateKey];
      const delta = Math.round((now - before[stateKey]) * 10) / 10;
      if (delta) applied[key] = delta;
    });
    trackHiddenBehaviors(state, choice, topic, isArc);
    if (!isArc) state.arcTriggerCounts[topic]++;
    state.definingChoices.push({ topic: topicLabel(topic), card: cardTitle, choice: choice.text });
    if (state.definingChoices.length > 8) state.definingChoices.shift();
    return { effective, applied };
  }

  // Warnings and penalties between turns. Pushes messages to `notices`; returns true if the run ended.
  function checkFailSafes(state, notices) {
    const bars = state.bars;
    state.lowApprovalTurns += (bars.publicApproval < 10) ? 1 : -state.lowApprovalTurns;
    state.lowEconomyTurns += (bars.economicState <= 20) ? 1 : -state.lowEconomyTurns;
    state.lowAuthorityTurns += (bars.stateAuthority < 30) ? 1 : -state.lowAuthorityTurns;
    state.highTensionTurns += (bars.internationalTension > 80) ? 1 : -state.highTensionTurns;
    state.lowLoyaltyTurns = (bars.partyLoyalty < 10) ? (state.lowLoyaltyTurns || 0) + 1 : 0;

    // Party revolt: four turns with almost no party support and the party removes you.
    if (state.lowLoyaltyTurns >= 1 && state.lowLoyaltyTurns <= 3) {
      notices.push(`⚠ Party revolt brewing: raise Party Loyalty above 10 within ${4 - state.lowLoyaltyTurns} turn(s) or your party will remove you.`);
    }
    if (state.lowLoyaltyTurns >= 4) {
      state.impeached = true;
      notices.push('⚠ Party Revolt: your own party has voted you out.');
      return true;
    }

    const inRevolution = state.activeArc && state.activeArc.id === 'revolution';
    const approvalCrisis = state.lowApprovalTurns >= 3 || bars.publicApproval <= 0;
    if (approvalCrisis && !state.approvalWarned) {
      state.approvalWarned = true;
      notices.push('⚠ Approval is collapsing: improve it this turn or face an Approval Crisis.');
    } else if (approvalCrisis) {
      if (inRevolution) { state.impeached = true; return true; }
      state.approvalWarned = false;
      bars.publicApproval = 50;
      bars.economicState = clamp(bars.economicState - 25, 0, 100);
      bars.partyLoyalty = clamp(bars.partyLoyalty - 20, 0, 100);
      bars.stateAuthority = clamp(bars.stateAuthority - 20, 0, 100);
      notices.push('⚠ Approval Crisis: Confidence reset, penalties applied across Economy and Loyalty.');
      state.lowApprovalTurns = 0;
    } else {
      state.approvalWarned = false;
    }
    // State Control below 30 bleeds Party Loyalty.
    if (bars.stateAuthority < 30) bars.partyLoyalty = clamp(bars.partyLoyalty - 1, 0, 100);

    const economyCrisis = state.lowEconomyTurns >= 3 || bars.economicState <= 10;
    if (economyCrisis && !state.economyWarned) {
      state.economyWarned = true;
      notices.push('⚠ The economy is failing: improve it this turn or face an Economic Collapse.');
    } else if (economyCrisis) {
      if (inRevolution) { state.impeached = true; return true; }
      state.economyWarned = false;
      bars.economicState = 50;
      bars.publicApproval = clamp(bars.publicApproval - 30, 0, 100);
      bars.partyLoyalty = clamp(bars.partyLoyalty - 10, 0, 100);
      bars.stateAuthority = clamp(bars.stateAuthority - 20, 0, 100);
      notices.push('⚠ Economic Collapse: Markets subsidized, immense public backlash absorbed.');
      state.lowEconomyTurns = 0;
    } else {
      state.economyWarned = false;
    }
    return false;
  }

  // Starts the first story arc whose trigger is met. Returns that arc, or null.
  function checkArcTriggers(state, notices) {
    if (state.activeArc) return null;
    if (state.arcsCompleted.length >= 3) return null;
    for (const arc of ARCS) {
      if (state.arcsCompleted.includes(arc.id) || state.arcsTriggered.includes(arc.id)) continue;
      if (arc.trigger(state)) {
        state.activeArc = arc;
        state.activeArcActIndex = 0;
        // A revolution is a last chance, not an instant loss: your remaining supporters rally.
        if (arc.id === 'revolution' && state.bars.publicApproval < 20) {
          state.bars.publicApproval = 20;
          notices.push('Your remaining supporters rally in the streets: Approval steadies at 20.');
        }
        state.arcsTriggered.push(arc.id);
        return arc;
      }
    }
    return null;
  }

  // Moves to the next turn. Returns { end, override, arcStarted, notices }:
  // end = the run is over (override is the Lazarus ending when the Energy Core ran out).
  function nextTurn(state) {
    const notices = [];
    // Check depletion before the passive +1, otherwise an empty core was revived to 1.
    if (state.energy <= 0) {
      state.energy = 0;
      return { end: true, override: LAZARUS, notices };
    }
    state.energy = Math.min(100, state.energy + 1); // passive energy gain each turn, capped at 100
    if (state.turn >= state.maxTurns && !state.activeArc) return { end: true, notices };
    if (state.bars.economicState <= 5) return { end: true, notices };
    state.turn++;
    if (checkFailSafes(state, notices)) return { end: true, notices };
    const arcStarted = checkArcTriggers(state, notices);
    return { end: false, arcStarted, notices };
  }

  function closeArc(state) {
    state.arcsCompleted.push(state.activeArc.id);
    state.activeArc = null;
    state.activeArcActIndex = 0;
  }

  // After an arc choice. Returns { end, override } when the run ends, { act } for the next act,
  // or { finished: true } when the arc is over and normal turns resume.
  function advanceArc(state, choice) {
    const arc = state.activeArc;
    const next = (choice && typeof choice.nextAct === 'number') ? choice.nextAct : state.activeArcActIndex + 1;
    // The people accepted your resignation: the term ends here.
    if (state.resigned) { closeArc(state); return { end: true }; }
    // During the Revolution a collapse of Approval or the Economy is not rescued: you are removed.
    if (arc.id === 'revolution' && (state.bars.publicApproval <= 0 || state.bars.economicState <= 10)) {
      state.impeached = true;
      closeArc(state);
      return { end: true };
    }
    if (arc.id === 'convergence_route' && (next === 999 || next >= arc.acts.length)) {
      closeArc(state);
      return { end: true, override: choice };
    }
    if (next < arc.acts.length) {
      state.activeArcActIndex = next;
      return { act: next };
    }
    closeArc(state);
    return { finished: true };
  }

  // An act with its state-dependent text resolved (the last Convergence act depends on Tension).
  function resolveAct(act, state) {
    return {
      tag: act.tag,
      title: act.title,
      body: typeof act.body === 'function' ? act.body(state) : act.body,
      choices: typeof act.choices === 'function' ? act.choices(state) : act.choices
    };
  }

  // A rare gift card that replaces the normal draw, or null.
  function giftCard(state, random = Math.random) {
    if (!state.tensionGiftTriggered && state.bars.internationalTension <= 10) {
      const chance = 10 + (10 - state.bars.internationalTension);
      if (random() * 100 < chance) {
        state.tensionGiftTriggered = true;
        return JSON.parse(JSON.stringify(GIFTS.tension));
      }
    }
    if (!state.ecoGiftTriggered && state.bars.economicState >= 80) {
      const chance = 10 + (state.bars.economicState - 80);
      if (random() * 100 < chance) {
        state.ecoGiftTriggered = true;
        return JSON.parse(JSON.stringify(GIFTS.economy));
      }
    }
    return null;
  }

  // Draws this turn's card (no repeats until a topic runs out) and applies the high-bar rules to a copy.
  function drawCard(state, random = Math.random) {
    const topic = state.topicQueue[(state.turn - 1) % state.topicQueue.length];
    const pool = CARDS[topic];
    let available = pool.filter((_, i) => !state.cardHistory[topic].includes(i));
    if (!available.length) { state.cardHistory[topic] = []; available = pool; }
    const original = available[Math.floor(random() * available.length)];
    state.cardHistory[topic].push(pool.indexOf(original));
    const card = JSON.parse(JSON.stringify(original));
    const bars = state.bars;
    card.choices.forEach(ch => {
      // Public Approval 80+: the economy booms, Approval gains are halved (diminishing returns near the top).
      if (bars.publicApproval >= 80) {
        if (ch.eco > 0) ch.eco += 3;
        if (ch.eco < 0) ch.eco += 1;
        if (ch.approval > 0) ch.approval = Math.ceil(ch.approval / 2);
        if (ch.approval < 0) ch.approval -= 1;
      }
      // State Control 80+: a heavy hand makes Approval losses worse.
      if (bars.stateAuthority >= 80) {
        if (ch.approval < 0) ch.approval -= 3;
        if (ch.approval > 0) ch.approval -= 1;
      }
      // Party Loyalty 80+ on scandal cards: other effects soften, party effects cost one more.
      if (bars.partyLoyalty >= 80 && topic === 'scandal') {
        ['approval', 'tension', 'eco', 'unrest', 'empathy', 'integrity', 'courage'].forEach(k => {
          if (ch[k] > 0) ch[k] += 1;
          if (ch[k] < 0) ch[k] += 1;
        });
        if (ch.party > 0) ch.party -= 1;
        if (ch.party < 0) ch.party -= 1;
      }
    });
    return { card, topic };
  }

  // Low Party Loyalty can grey out two of four options. Returns the option indices to lock.
  function partyLock(state, optionCount, random = Math.random) {
    if (state.bars.partyLoyalty > 20) return [];
    const chance = 20 - state.bars.partyLoyalty;
    if (!(random() * 100 < chance) || optionCount < 4) return [];
    const order = Array.from({ length: optionCount }, (_, i) => i).sort(() => 0.5 - random());
    return order.slice(0, 2);
  }

  function pickEnding(state) {
    for (const ending of ENDINGS) if (ending.check(state)) return ending;
    return ENDINGS[0];
  }

  // The ending to show. The Convergence route and the Lazarus Protocol pass the choice that ended the run.
  function resolveEnding(state, override) {
    let ending = pickEnding(state);
    // The peace branch has its own ending card; without this check its outcome
    // sentence was used as the ending title.
    if (override && override.outcome && override.text !== 'The Peacemaker Ending.') {
      const parts = override.outcome.split('. ');
      const rawTitle = parts[0].replace('ENDING: ', '').trim();
      const scenarioLine = parts.slice(1).join('. ').trim();
      const canonical = ENDINGS.find(e => e.title === rawTitle || ('The ' + e.title) === rawTitle || e.title === ('The ' + rawTitle));
      if (canonical) {
        ending = Object.assign({}, canonical);
        if (scenarioLine) ending.narrative = `<b>${scenarioLine}</b><br><br>${ending.narrative}`;
      } else {
        ending = {
          id: 'convergence',
          title: rawTitle,
          emoji: rawTitle.includes('Warmonger') ? '⚔️' : rawTitle.includes('Peacemaker') ? '🕊️' : rawTitle.includes('Pacifist') ? '☮️' : '⌛',
          tagline: 'The World on Fire',
          narrative: scenarioLine,
          profile: 'Legacy of the Ultimatum'
        };
      }
    } else if (override && override.text === 'The Peacemaker Ending.') {
      ending = {
        id: 'convergence_peace',
        title: 'The Peacemaker',
        emoji: '🕊️',
        tagline: 'Healed the Divide',
        narrative: 'By de-escalating global tension before the brink, you secured a era of prosperity without firing a single shot.',
        profile: 'The Architect of Peace'
      };
    }
    return ending;
  }

  // The four moral axes on the end screen, as marker positions (2-98%).
  function moralAxes(state) {
    const pct = v => clamp(Math.round(50 + (v / 100) * 50), 2, 98);
    return [
      { id: 'a', left: 'Logic', right: 'Empathy', pct: pct(state.empathy) },
      { id: 'b', left: 'Freedom', right: 'Order', pct: pct(state.ideologyScore) },
      { id: 'c', left: 'Caution', right: 'Courage', pct: pct(state.courage) },
      { id: 'd', left: 'Pragmatism', right: 'Integrity', pct: pct(state.integrity) }
    ];
  }

  root.TheOvalCore = {
    RUN_LENGTHS,
    RUN_TURNS,
    advanceArc,
    applyChoice,
    applyDeltas,
    buildTopicQueue,
    checkArcTriggers,
    checkFailSafes,
    clamp,
    createInitialState,
    drawCard,
    giftCard,
    moralAxes,
    nextTurn,
    partyLock,
    pickEnding,
    resolveAct,
    resolveEnding,
    scaleChoice,
    scaleDelta,
    topicLabel,
    trackHiddenBehaviors
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = root.TheOvalCore;
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
