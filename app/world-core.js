// Fleet Council rules engine.
// Pure functions over a plain match object: no DOM, no network, no clock.
// Randomness comes from a seeded generator stored inside the match so that
// the server and the offline practice mode resolve turns identically.
(function (root) {
  const content = (typeof module !== 'undefined' && module.exports)
    ? require('../data/world-content.js')
    : root.FleetCouncilContent;
  const { BUILDINGS, SHIP_COST, SPECIAL_CARDS, SITUATIONS } = content;

  const STAT_KEYS = ['morale', 'economy', 'energy', 'security'];
  const RESOURCE_KEYS = ['gold', 'ore', 'ships'];
  const START_VALUE = 50;
  const MAX_MEMBERS = 4;
  const INVENTORY_CAP = 5;
  const CARD_DROP_CHANCE = 0.25;
  const CRISIS_CHANCE = 0.35;     // share of polls drawn from the crisis cards
  const RAID_ENERGY_COST = 10;
  const MAX_SHIP_ORDER = 3;
  const AID_AMOUNT = 20;          // sent by the giver
  const AID_RECEIVED = 30;        // received: trade makes aid worth more on arrival
  const AID_GOODWILL = { morale: 4, economy: 2 };
  const PACT_TURNS = 2;           // a world that receives aid cannot raid the giver for this long
  const RAID_SPOILS = { gold: 30, ore: 30 };
  const DEFENCE_BOUNTY = 15;      // gold for repelling a raid
  const UNDERDOG_RATIO = 0.9;     // below 90% of the leader's power
  const UNDERDOG_PRODUCTION = 1.3;
  const UNDERDOG_DEFENCE = 1.25;
  const REVENGE_ATTACK = 1.3;
  const REVENGE_TURNS = 2;
  const SMALL_CREW_BONUS = 0.02;  // extra production per pilot fewer than the largest crew

  const EXP = {
    vote: 5,
    build: 4,
    card: 3,
    aid: 5,
    raidWin: 20,
    defend: 8,
    finish: 10,
    victory: 30
  };

  class GameError extends Error {}

  function fail(message) {
    throw new GameError(message);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  // mulberry32: small, fast, deterministic.
  function random(match) {
    match.rngState = (match.rngState + 0x6D2B79F5) | 0;
    let t = match.rngState;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function randomInt(match, n) {
    return Math.floor(random(match) * n);
  }

  function shuffle(match, list) {
    const copy = list.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = randomInt(match, i + 1);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  // Weighted value of an option, used to keep the cards in a poll close to each other.
  function optionValue(effects) {
    let value = 0;
    STAT_KEYS.forEach(key => { value += effects[key] || 0; });
    value += (effects.gold || 0) / 4;
    value += (effects.ore || 0) / 4;
    value += (effects.ships || 0) * 5;
    return value;
  }

  function playerLevel(exp) {
    return 1 + Math.floor(Math.sqrt(Math.max(0, exp) / 25));
  }

  function fleetCap(world) {
    return 3 + 3 * world.buildings.shipyard.level;
  }

  // Crews are paid every turn: 1 gold per 2 ships, rounded up.
  function shipUpkeep(world) {
    return Math.ceil(world.ships / 2);
  }

  function storageCap(buildingId, level) {
    const def = BUILDINGS[buildingId];
    return def.produces ? def.rate * level * 3 : 0;
  }

  function buildCost(buildingId, targetLevel) {
    const def = BUILDINGS[buildingId];
    return { gold: def.cost.gold * targetLevel, ore: def.cost.ore * targetLevel };
  }

  function worldPower(world) {
    let power = 0;
    STAT_KEYS.forEach(key => { power += world.stats[key]; });
    power += Math.floor(world.gold / 2) + Math.floor(world.ore / 2);
    power += world.ships * 8;
    Object.values(world.buildings).forEach(b => { power += b.level * 12; });
    return power;
  }

  function createWorld(template) {
    return {
      id: template.id,
      name: template.name,
      hue: template.hue,
      stats: { morale: START_VALUE, economy: START_VALUE, energy: START_VALUE, security: START_VALUE },
      gold: START_VALUE,
      ore: START_VALUE,
      ships: 3,
      buildings: {
        core: { level: 1, storage: 0 },
        mine: { level: 1, storage: 0 },
        refinery: { level: 1, storage: 0 },
        reactor: { level: 1, storage: 0 },
        shipyard: { level: 0, storage: 0 },
        shield: { level: 0, storage: 0 },
        habitat: { level: 0, storage: 0 }
      },
      pendingBuild: null,
      buildPlan: null,
      shipPlan: null,
      aidPlan: null,
      poll: null,
      votes: {},
      raid: null,
      flags: { overclock: false, shieldMatrix: false },
      protectedUntilTurn: 1,
      raidedLastTurn: false,
      underdog: false,       // behind the leader: production and defence bonus this turn
      revenge: null,         // { targetId, untilTurn }: attack bonus against the world that raided us
      pacts: {},             // giverId -> last turn this world may not raid that giver
      history: []
    };
  }

  function createPlayer(info) {
    return {
      id: info.id,
      name: info.name,
      bot: !!info.bot,
      worldId: info.worldId,
      exp: 0,
      inventory: [],
      cardTurn: 0,
      cardsUsed: 0,
      record: { votes: 0, harvested: 0, raidsWon: 0, builds: 0, cards: 0 }
    };
  }

  function createMatch(options) {
    const match = {
      rngState: (options.seed >>> 0) || 1,
      turn: 1,
      maxTurns: options.maxTurns || 10,
      worldOrder: options.worlds.map(w => w.id),
      worlds: {},
      players: {},
      deck: [],
      nextUid: 1,
      log: [],
      lastReport: null,
      finished: false,
      results: null
    };
    options.worlds.forEach(template => { match.worlds[template.id] = createWorld(template); });
    options.players.forEach(info => addPlayer(match, info, false));
    // Every world starts with as many special cards as the largest crew, shared among its pilots,
    // so a solo pilot facing a crew of four holds four cards too.
    const largest = largestCrew(match);
    match.worldOrder.forEach(id => {
      const crew = membersOf(match, id);
      for (let k = 0; crew.length && k < largest; k++) giveCard(match, crew[k % crew.length], randomCardType(match));
    });
    return match;
  }

  // Pilots who join a running match bring one card.
  function addPlayer(match, info, starterCard) {
    if (!match.worlds[info.worldId]) fail('Unknown world.');
    const player = createPlayer(info);
    match.players[player.id] = player;
    if (starterCard !== false) giveCard(match, player, randomCardType(match));
    return player;
  }

  function membersOf(match, worldId) {
    return Object.values(match.players).filter(p => p.worldId === worldId);
  }

  function largestCrew(match) {
    return Math.max(1, ...match.worldOrder.map(id => membersOf(match, id).length));
  }

  // Special-card plays per pilot per turn. Smaller crews play more each, so every world
  // can use about the same number of cards per turn (a solo pilot vs a crew of four plays 4).
  function cardAllowance(match, worldId) {
    const crew = Math.max(1, membersOf(match, worldId).length);
    return Math.max(1, Math.round(largestCrew(match) / crew));
  }

  function cardsLeft(match, player) {
    const used = player.cardTurn === match.turn ? player.cardsUsed : 0;
    return Math.max(0, cardAllowance(match, player.worldId) - used);
  }

  function randomCardType(match) {
    const types = Object.keys(SPECIAL_CARDS);
    return types[randomInt(match, types.length)];
  }

  function giveCard(match, player, type) {
    if (player.inventory.length >= INVENTORY_CAP * cardAllowance(match, player.worldId)) return null;
    const card = { uid: 'c' + (match.nextUid++), type };
    player.inventory.push(card);
    return card;
  }

  function log(match, text, worldId) {
    match.log.push({ turn: match.turn, text, worldId: worldId || null });
    if (match.log.length > 80) match.log.shift();
  }

  function getPlayer(match, playerId) {
    const player = match.players[playerId];
    if (!player) fail('You are not part of this match.');
    return player;
  }

  // ── Polls ────────────────────────────────────────────────────────────────

  // Two shuffled decks: about 35% of polls come from the crisis cards, the rest from the others.
  function drawSituation(match) {
    const crisis = random(match) < CRISIS_CHANCE;
    const key = crisis ? 'crisisDeck' : 'deck';
    if (!match[key] || !match[key].length) {
      match[key] = shuffle(match, SITUATIONS.map((s, i) => i).filter(i => !!SITUATIONS[i].crisis === crisis));
    }
    return SITUATIONS[match[key].pop()];
  }

  function optionLockReason(world, effects) {
    if (effects.gold < 0 && world.gold < -effects.gold) return `Needs ${-effects.gold} gold`;
    if (effects.ore < 0 && world.ore < -effects.ore) return `Needs ${-effects.ore} ore`;
    if (effects.ships < 0 && world.ships < 1 - effects.ships) return `Needs ${1 - effects.ships} ships`;
    return null;
  }

  function pollOptions(world) {
    if (!world.poll) return [];
    const situation = SITUATIONS.find(s => s.id === world.poll.situationId);
    // Only options still on the table count: a Veto must not leave a poll where nothing can be chosen.
    const anyOpen = situation.options.some((opt, i) => !world.poll.vetoed.includes(i) && !optionLockReason(world, opt.effects));
    return situation.options.map((opt, index) => ({
      index,
      text: opt.text,
      effects: opt.effects,
      value: optionValue(opt.effects),
      vetoed: world.poll.vetoed.includes(index),
      // If every option is unaffordable, nothing is locked: the world still has to decide.
      lockReason: anyOpen ? optionLockReason(world, opt.effects) : null
    }));
  }

  function startTurn(match) {
    // Catch-up: from turn 2, worlds below 90% of the leader's power get the underdog bonus this turn.
    const powers = match.worldOrder.map(id => worldPower(match.worlds[id]));
    const top = Math.max(...powers);
    const largest = largestCrew(match);
    match.worldOrder.forEach((id, i) => {
      match.worlds[id].underdog = match.turn >= 2 && powers[i] < top * UNDERDOG_RATIO;
      match.worlds[id].crewGap = largest - membersOf(match, id).length;
    });
    match.worldOrder.forEach(id => {
      const world = match.worlds[id];
      const situation = drawSituation(match);
      world.poll = { situationId: situation.id, vetoed: [] };
      world.votes = {};
      world.raid = null;
      world.buildPlan = null;
      world.shipPlan = null;
      world.aidPlan = null;
      world.flags = { overclock: false, shieldMatrix: false };
    });
  }

  function castVote(match, playerId, optionIndex) {
    const player = getPlayer(match, playerId);
    const world = match.worlds[player.worldId];
    const option = pollOptions(world).find(o => o.index === optionIndex);
    if (!option) fail('That option does not exist.');
    if (option.vetoed) fail('That option was vetoed.');
    if (option.lockReason) fail(option.lockReason + '.');
    world.votes[playerId] = optionIndex;
  }

  function defaultOption(options) {
    return options.find(o => !o.vetoed && !o.lockReason) || options.find(o => !o.vetoed) || options[0];
  }

  function tallyPoll(match, world) {
    const options = pollOptions(world);
    const counts = {};
    options.forEach(o => { counts[o.index] = 0; });
    Object.values(world.votes).forEach(index => {
      const option = options[index];
      if (option && !option.vetoed && !option.lockReason) counts[index]++;
    });
    const best = Math.max(...Object.values(counts));
    if (best === 0) {
      return { option: defaultOption(options), tied: null, counts, reason: 'No votes: the default option was used.' };
    }
    // A clear majority (e.g. 3-1) decides. An exact tie takes the average of the tied options.
    const tied = options.filter(o => counts[o.index] === best);
    if (tied.length === 1) return { option: tied[0], tied: null, counts, reason: 'Most votes.' };
    return { option: tied[0], tied, counts, reason: `Tie between ${tied.length} options: the council took the average of their effects.` };
  }

  // Average of several options' effects, rounded half away from zero.
  function averageEffects(list) {
    const sums = {};
    list.forEach(effects => Object.entries(effects).forEach(([k, v]) => { sums[k] = (sums[k] || 0) + v; }));
    const avg = {};
    Object.entries(sums).forEach(([k, v]) => {
      const a = v / list.length;
      const rounded = Math.sign(a) * Math.round(Math.abs(a));
      if (rounded) avg[k] = rounded;
    });
    return avg;
  }

  // ── Effects ──────────────────────────────────────────────────────────────

  function snapshotWorld(world) {
    return {
      morale: world.stats.morale,
      economy: world.stats.economy,
      energy: world.stats.energy,
      security: world.stats.security,
      gold: world.gold,
      ore: world.ore,
      ships: world.ships
    };
  }

  function diffWorld(before, after) {
    const diff = {};
    Object.keys(before).forEach(key => {
      const d = after[key] - before[key];
      if (d) diff[key] = d;
    });
    return diff;
  }

  function addStat(world, key, amount) {
    world.stats[key] = clamp(Math.round(world.stats[key] + amount), 0, 100);
  }

  function addResource(world, key, amount) {
    if (key === 'ships') {
      world.ships = clamp(world.ships + amount, 0, fleetCap(world));
    } else {
      world[key] = Math.max(0, Math.round(world[key] + amount));
    }
  }

  // Applies effects and returns what actually changed after clamping.
  function applyEffects(world, effects) {
    const before = snapshotWorld(world);
    Object.keys(effects).forEach(key => {
      if (STAT_KEYS.includes(key)) addStat(world, key, effects[key]);
      else if (RESOURCE_KEYS.includes(key)) addResource(world, key, effects[key]);
    });
    return diffWorld(before, snapshotWorld(world));
  }

  // ── Building, harvesting, ships ──────────────────────────────────────────

  function buildOptions(world) {
    return Object.keys(BUILDINGS).map(id => {
      const level = world.buildings[id].level;
      const def = BUILDINGS[id];
      const target = level + 1;
      const cost = buildCost(id, target);
      let lockReason = null;
      if (level >= def.maxLevel) lockReason = 'Max level';
      else if (id !== 'core' && target > world.buildings.core.level) lockReason = `Needs Command Core Lv${target}`;
      else if (world.buildPlan || world.pendingBuild) lockReason = 'One build per turn';
      else if (world.gold < cost.gold || world.ore < cost.ore) lockReason = 'Not enough resources';
      return { id, level, target, cost, lockReason };
    });
  }

  // Spending shared resources on construction is a crew decision, decided like a raid:
  // the plan passes at the end of the vote if yes > no and at least half the crew says yes.
  function proposeBuild(match, playerId, buildingId) {
    const player = getPlayer(match, playerId);
    const world = match.worlds[player.worldId];
    const option = buildOptions(world).find(o => o.id === buildingId);
    if (!option) fail('Unknown building.');
    if (option.lockReason) fail(option.lockReason + '.');
    world.buildPlan = { id: buildingId, target: option.target, by: player.id, votes: { [player.id]: true } };
    log(match, `${player.name} proposed ${BUILDINGS[buildingId].name} Lv${option.target}.`, world.id);
    return option;
  }

  // ── Crew plans ───────────────────────────────────────────────────────────
  // Everything that spends the world's shared resources or fleet is a plan the crew votes on:
  // a raid, a construction, a ship order or an aid shipment. One plan of each kind per turn.

  const PLAN_FIELDS = { raid: 'raid', build: 'buildPlan', ships: 'shipPlan', aid: 'aidPlan' };
  const PLAN_LABELS = { raid: 'raid plan', build: 'build plan', ships: 'ship order', aid: 'aid plan' };

  function openPlan(match, playerId, kind) {
    const field = PLAN_FIELDS[kind];
    if (!field) fail('Unknown plan.');
    const player = getPlayer(match, playerId);
    const world = match.worlds[player.worldId];
    if (!world[field]) fail(`There is no ${PLAN_LABELS[kind]}.`);
    return { world, field };
  }

  function votePlan(match, playerId, kind, yes) {
    const { world, field } = openPlan(match, playerId, kind);
    world[field].votes[playerId] = !!yes;
  }

  function cancelPlan(match, playerId, kind) {
    const { world, field } = openPlan(match, playerId, kind);
    if (world[field].by !== playerId) fail('Only the proposer can cancel.');
    world[field] = null;
  }

  function planPasses(match, world, kind) {
    const plan = world[PLAN_FIELDS[kind]];
    return !!plan && crewApproves(match, world, plan.votes);
  }

  function tallyText(plan) {
    const votes = Object.values(plan.votes);
    return `${votes.filter(Boolean).length} yes, ${votes.filter(v => !v).length} no`;
  }

  function voteBuild(match, playerId, yes) { votePlan(match, playerId, 'build', yes); }
  function cancelBuild(match, playerId) { cancelPlan(match, playerId, 'build'); }
  function buildPasses(match, world) { return planPasses(match, world, 'build'); }

  // Runs at the end of the vote. Costs are checked again because the poll may have spent resources.
  function settleBuildPlan(match, world, report) {
    const plan = world.buildPlan;
    world.buildPlan = null;
    if (!plan) return;
    const name = `${BUILDINGS[plan.id].name} Lv${plan.target}`;
    const tally = tallyText(plan);
    if (!crewApproves(match, world, plan.votes)) {
      report.notes.push(`The ${name} plan was voted down (${tally}).`);
      return;
    }
    const option = buildOptions(world).find(o => o.id === plan.id);
    if (option.lockReason || option.target !== plan.target) {
      report.notes.push(`The ${name} plan was approved (${tally}) but could not start: ${(option.lockReason || 'level changed').toLowerCase()}.`);
      return;
    }
    world.gold -= option.cost.gold;
    world.ore -= option.cost.ore;
    world.pendingBuild = { id: plan.id, target: plan.target };
    const proposer = match.players[plan.by];
    if (proposer) {
      proposer.exp += EXP.build;
      proposer.record.builds++;
    }
    report.notes.push(`Crew approved ${name} (${tally}): −${option.cost.gold} gold, −${option.cost.ore} ore.`);
  }

  function shipOrderLockReason(world, count) {
    if (!(count >= 1 && count <= MAX_SHIP_ORDER)) return `Order 1 to ${MAX_SHIP_ORDER} ships`;
    if (world.shipPlan) return 'One ship order per turn';
    if (world.buildings.shipyard.level < 1) return 'Build a Shipyard first';
    if (world.ships + count > fleetCap(world)) return 'Fleet cap reached';
    if (world.gold < SHIP_COST.gold * count || world.ore < SHIP_COST.ore * count) return 'Not enough resources';
    return null;
  }

  function proposeShips(match, playerId, count) {
    const player = getPlayer(match, playerId);
    const world = match.worlds[player.worldId];
    count = Number(count);
    const reason = shipOrderLockReason(world, count);
    if (reason) fail(reason + '.');
    world.shipPlan = { count, by: player.id, votes: { [player.id]: true } };
    log(match, `${player.name} proposed ordering ${count} ship${count > 1 ? 's' : ''}.`, world.id);
  }

  // Launches as many of the approved ships as the treasury and fleet cap still allow.
  function settleShipPlan(match, world, report) {
    const plan = world.shipPlan;
    world.shipPlan = null;
    if (!plan) return;
    const label = `${plan.count} ship${plan.count > 1 ? 's' : ''}`;
    const tally = tallyText(plan);
    if (!crewApproves(match, world, plan.votes)) {
      report.notes.push(`The order for ${label} was voted down (${tally}).`);
      return;
    }
    const launched = Math.min(
      plan.count,
      fleetCap(world) - world.ships,
      Math.floor(world.gold / SHIP_COST.gold),
      Math.floor(world.ore / SHIP_COST.ore)
    );
    if (world.buildings.shipyard.level < 1 || launched <= 0) {
      report.notes.push(`The order for ${label} was approved (${tally}) but no ship could be built: not enough resources or fleet room.`);
      return;
    }
    world.gold -= SHIP_COST.gold * launched;
    world.ore -= SHIP_COST.ore * launched;
    world.ships += launched;
    const partial = launched < plan.count ? ` Only ${launched} could be paid for.` : '';
    report.notes.push(`Crew approved ${label} (${tally}): ${launched} launched, −${SHIP_COST.gold * launched} gold, −${SHIP_COST.ore * launched} ore.${partial}`);
  }

  function harvest(match, playerId, buildingId) {
    const player = getPlayer(match, playerId);
    const world = match.worlds[player.worldId];
    const def = BUILDINGS[buildingId];
    if (!def || !def.produces) fail('Nothing to harvest there.');
    const building = world.buildings[buildingId];
    const amount = building.storage;
    if (amount <= 0) fail('Storage is empty.');
    building.storage = 0;
    world[def.produces] += amount;
    const exp = Math.max(1, Math.round(amount / 4 / cardAllowance(match, player.worldId)));
    player.exp += exp;
    player.record.harvested += amount;
    let card = null;
    if (random(match) < CARD_DROP_CHANCE) card = giveCard(match, player, randomCardType(match));
    return { amount, resource: def.produces, exp, card };
  }

  function aidLockReason(world, target, resource) {
    if (!target || target === world) return 'Choose another world';
    if (resource !== 'gold' && resource !== 'ore') return 'Only gold or ore can be sent';
    if (world.aidPlan) return 'One aid shipment per turn';
    if (world[resource] < AID_AMOUNT) return `Needs ${AID_AMOUNT} ${resource}`;
    return null;
  }

  function proposeAid(match, playerId, targetId, resource) {
    const player = getPlayer(match, playerId);
    const world = match.worlds[player.worldId];
    const target = match.worlds[targetId];
    const reason = aidLockReason(world, target, resource);
    if (reason) fail(reason + '.');
    world.aidPlan = { targetId, resource, amount: AID_AMOUNT, by: player.id, votes: { [player.id]: true } };
    log(match, `${player.name} proposed sending ${AID_AMOUNT} ${resource} to ${target.name}.`, world.id);
  }

  function settleAidPlan(match, world, reports) {
    const plan = world.aidPlan;
    world.aidPlan = null;
    if (!plan) return;
    const target = match.worlds[plan.targetId];
    const label = `${plan.amount} ${plan.resource} to ${target.name}`;
    const tally = tallyText(plan);
    if (!crewApproves(match, world, plan.votes)) {
      reports[world.id].notes.push(`Sending ${label} was voted down (${tally}).`);
      return;
    }
    if (world[plan.resource] < plan.amount) {
      reports[world.id].notes.push(`Sending ${label} was approved (${tally}) but the treasury no longer had ${plan.amount} ${plan.resource}.`);
      return;
    }
    // Aid helps both sides: the receiver gets more than was sent, the giver gains goodwill,
    // and the receiver may not raid the giver for the next turns.
    world[plan.resource] -= plan.amount;
    target[plan.resource] += AID_RECEIVED;
    applyEffects(world, AID_GOODWILL);
    target.pacts = target.pacts || {};
    target.pacts[world.id] = match.turn + PACT_TURNS;
    const proposer = match.players[plan.by];
    if (proposer) proposer.exp += EXP.aid;
    reports[world.id].notes.push(`Crew approved sending ${label} (${tally}). Goodwill: +${AID_GOODWILL.morale} Morale, +${AID_GOODWILL.economy} Economy. ${target.name} cannot raid you until the end of turn ${match.turn + PACT_TURNS}.`);
    reports[target.id].notes.push(`${world.name} sent you aid: +${AID_RECEIVED} ${plan.resource}. Peace pact: you cannot raid them until the end of turn ${match.turn + PACT_TURNS}.`);
    log(match, `${world.name} sent ${label} (${AID_RECEIVED} arrived) and signed a peace pact.`);
  }

  // ── Special cards ────────────────────────────────────────────────────────

  function playCard(match, playerId, uid, target) {
    const player = getPlayer(match, playerId);
    const world = match.worlds[player.worldId];
    const card = player.inventory.find(c => c.uid === uid);
    if (!card) fail('You do not hold that card.');
    if (cardsLeft(match, player) <= 0) fail('No special card plays left this turn.');
    const def = SPECIAL_CARDS[card.type];
    let detail = '';

    if (card.type === 'overclock') world.flags.overclock = true;
    else if (card.type === 'shield_matrix') world.flags.shieldMatrix = true;
    else if (card.type === 'convoy') applyEffects(world, { gold: 15, ore: 10 });
    else if (card.type === 'rally') applyEffects(world, { morale: 6 });
    else if (card.type === 'recruit') {
      if (world.ships >= fleetCap(world)) fail('Fleet is at its cap.');
      applyEffects(world, { ships: 1 });
    } else if (card.type === 'sabotage') {
      const rival = match.worlds[target];
      if (!rival || rival === world) fail('Choose a rival world.');
      Object.values(rival.buildings).forEach(b => { b.storage = Math.floor(b.storage / 2); });
      addStat(rival, 'energy', -4);
      detail = ` on ${rival.name}`;
    } else if (card.type === 'veto') {
      const index = Number(target);
      const options = pollOptions(world);
      const open = options.filter(o => !o.vetoed);
      if (!options[index] || options[index].vetoed) fail('Choose an option to strike.');
      if (open.length <= 2) fail('At least two options must remain.');
      world.poll.vetoed.push(index);
      Object.keys(world.votes).forEach(pid => { if (world.votes[pid] === index) delete world.votes[pid]; });
      detail = ` on option ${index + 1}`;
    }

    player.inventory = player.inventory.filter(c => c.uid !== uid);
    if (player.cardTurn !== match.turn) {
      player.cardTurn = match.turn;
      player.cardsUsed = 0;
    }
    player.cardsUsed += 1;
    player.exp += Math.max(1, Math.round(EXP.card / cardAllowance(match, player.worldId)));
    player.record.cards++;
    const isPublic = card.type === 'sabotage';
    log(match, `${player.name} played ${def.name}${detail}.`, isPublic ? null : world.id);
    return card;
  }

  // ── Raids ────────────────────────────────────────────────────────────────

  function raidLockReason(match, world, target) {
    if (!target || target === world) return 'Choose a rival world.';
    if (match.turn < 2) return 'Raids open from turn 2.';
    if (world.raid) return 'Your world already has a raid plan this turn.';
    if (world.ships < 2) return 'Needs at least 2 ships.';
    if (world.stats.energy < RAID_ENERGY_COST) return `Needs ${RAID_ENERGY_COST} Energy.`;
    if (target.protectedUntilTurn >= match.turn) return `${target.name} is under protection this turn.`;
    if ((world.pacts || {})[target.id] >= match.turn) return `${target.name} sent you aid: peace pact until the end of turn ${world.pacts[target.id]}.`;
    return null;
  }

  function proposeRaid(match, playerId, targetId) {
    const player = getPlayer(match, playerId);
    const world = match.worlds[player.worldId];
    const reason = raidLockReason(match, world, match.worlds[targetId]);
    if (reason) fail(reason);
    world.raid = { targetId, by: player.id, votes: { [player.id]: true } };
    log(match, `${player.name} proposed a raid on ${match.worlds[targetId].name}.`, world.id);
  }

  function voteRaid(match, playerId, yes) { votePlan(match, playerId, 'raid', yes); }
  function cancelRaid(match, playerId) { cancelPlan(match, playerId, 'raid'); }

  // Crew decisions (all plans): more yes than no, and at least half the crew says yes.
  function crewApproves(match, world, votesById) {
    const members = membersOf(match, world.id).length;
    const votes = Object.values(votesById);
    const yes = votes.filter(Boolean).length;
    const no = votes.length - yes;
    return yes > no && yes * 2 >= members;
  }

  function raidPasses(match, world) {
    return planPasses(match, world, 'raid');
  }

  function hasRevenge(match, attacker, defender) {
    return !!attacker.revenge && attacker.revenge.targetId === defender.id && attacker.revenge.untilTurn >= match.turn;
  }

  function attackStrength(match, attacker, defender) {
    const base = attacker.ships * 10 * (0.75 + attacker.stats.energy / 200);
    return hasRevenge(match, attacker, defender) ? base * REVENGE_ATTACK : base;
  }

  function defenceStrength(world) {
    let value = world.ships * 10 * (1 + 0.2 * world.buildings.shield.level) * (0.75 + world.stats.security / 200) + 10;
    if (world.underdog) value *= UNDERDOG_DEFENCE;
    return world.flags.shieldMatrix ? value * 2 : value;
  }

  // Expected strengths before the ±15% battle roll; shown to players and used by bots.
  function raidOdds(match, attacker, defender) {
    return { attack: Math.round(attackStrength(match, attacker, defender)), defence: Math.round(defenceStrength(defender)) };
  }

  function storageOf(world, resource) {
    return Object.keys(BUILDINGS).filter(id => BUILDINGS[id].produces === resource).reduce((s, id) => s + world.buildings[id].storage, 0);
  }

  // Takes a share of a resource's uncollected storage out of the buildings.
  function takeStorage(world, resource, share) {
    let taken = 0;
    Object.keys(BUILDINGS).filter(id => BUILDINGS[id].produces === resource).forEach(id => {
      const amount = Math.floor(world.buildings[id].storage * share);
      world.buildings[id].storage -= amount;
      taken += amount;
    });
    return taken;
  }

  function resolveRaid(match, attacker, defender) {
    const yesVoters = Object.keys(attacker.raid.votes).filter(id => attacker.raid.votes[id]);
    if (attacker.stats.energy < RAID_ENERGY_COST || attacker.ships < 2) {
      return { attackerId: attacker.id, defenderId: defender.id, aborted: true, text: `${attacker.name} could not launch the raid (needs 2 ships and ${RAID_ENERGY_COST} Energy).` };
    }
    if (defender.protectedUntilTurn >= match.turn) {
      return { attackerId: attacker.id, defenderId: defender.id, aborted: true, text: `${defender.name} was already protected; the raid turned back.` };
    }
    addStat(attacker, 'energy', -RAID_ENERGY_COST);
    const revenge = hasRevenge(match, attacker, defender);
    const odds = raidOdds(match, attacker, defender);
    const attack = Math.round(odds.attack * (0.85 + random(match) * 0.3));
    const defence = Math.round(odds.defence * (0.85 + random(match) * 0.3));
    const result = {
      attackerId: attacker.id, defenderId: defender.id, attack, defence, revenge, underdogDefence: !!defender.underdog,
      attackerShipsBefore: attacker.ships, defenderShipsBefore: defender.ships
    };

    if (attack > defence) {
      // Loot: half the treasury gold, 40% of the ore, half of the uncollected storage, plus war spoils.
      const goldLoot = Math.floor(defender.gold * 0.5) + takeStorage(defender, 'gold', 0.5) + RAID_SPOILS.gold;
      const oreLoot = Math.floor(defender.ore * 0.4) + takeStorage(defender, 'ore', 0.5) + RAID_SPOILS.ore;
      const defenderLoss = Math.min(defender.ships, Math.ceil(defender.ships * 0.25));
      defender.gold -= Math.floor(defender.gold * 0.5);
      defender.ore -= Math.floor(defender.ore * 0.4);
      defender.ships -= defenderLoss;
      addStat(defender, 'morale', -5);
      attacker.gold += goldLoot;
      attacker.ore += oreLoot;
      attacker.ships -= 1;
      defender.protectedUntilTurn = match.turn + 1;
      defender.raidedLastTurn = true;
      defender.revenge = { targetId: attacker.id, untilTurn: match.turn + REVENGE_TURNS };
      if (revenge) attacker.revenge = null;
      yesVoters.forEach(id => {
        const p = match.players[id];
        if (p) { p.exp += EXP.raidWin; p.record.raidsWon++; }
      });
      Object.assign(result, {
        winner: attacker.id, goldLoot, oreLoot, attackerLoss: 1, defenderLoss,
        text: `${attacker.name} raided ${defender.name} (${attack} vs ${defence})${revenge ? ' in revenge' : ''} and took ${goldLoot} gold, ${oreLoot} ore. ${defender.name} may strike back with +30% attack for ${REVENGE_TURNS} turns.`
      });
    } else {
      const attackerLoss = Math.min(attacker.ships, Math.ceil(attacker.ships * 0.35));
      const defenderLoss = defender.ships > 0 ? 1 : 0;
      attacker.ships -= attackerLoss;
      defender.ships -= defenderLoss;
      defender.gold += DEFENCE_BOUNTY;
      addStat(defender, 'security', 3);
      membersOf(match, defender.id).forEach(p => { p.exp += EXP.defend; });
      Object.assign(result, {
        winner: defender.id, goldLoot: 0, oreLoot: 0, attackerLoss, defenderLoss, bounty: DEFENCE_BOUNTY,
        text: `${defender.name} repelled ${attacker.name} (${defence} vs ${attack}) and salvaged ${DEFENCE_BOUNTY} gold from the wrecks.`
      });
    }
    return result;
  }

  // ── Turn resolution ──────────────────────────────────────────────────────

  function productionMultiplier(world) {
    let mult = 0.5 + world.stats.economy / 100;
    if (world.flags.overclock) mult *= 1.5;
    if (world.underdog) mult *= UNDERDOG_PRODUCTION;
    mult *= 1 + SMALL_CREW_BONUS * (world.crewGap || 0);
    if (world.stats.energy <= 0) mult = 0;
    else if (world.stats.energy < 25) mult *= 0.5;
    if (world.stats.morale < 20) mult *= 0.75;
    return mult;
  }

  function resolveTurn(match) {
    if (match.finished) fail('The match is over.');
    const turn = match.turn;
    const reports = {};
    const before = {};

    // 1. Polls.
    match.worldOrder.forEach(id => {
      const world = match.worlds[id];
      before[id] = snapshotWorld(world);
      const situation = SITUATIONS.find(s => s.id === world.poll.situationId);
      const tally = tallyPoll(match, world);
      const tiedOptions = tally.tied ? tally.tied.map(o => situation.options[o.index]) : null;
      const chosen = tiedOptions
        ? {
          text: tiedOptions.map(o => o.text).join(' + '),
          outcome: 'The crew was split evenly, so the council took a middle path between the tied options.',
          effects: averageEffects(tiedOptions.map(o => o.effects))
        }
        : situation.options[tally.option.index];
      const pollDelta = applyEffects(world, chosen.effects);
      Object.keys(world.votes).forEach(pid => {
        const p = match.players[pid];
        if (p) { p.exp += EXP.vote; p.record.votes++; }
      });
      reports[id] = {
        worldId: id,
        situationTitle: situation.title,
        situationArt: situation.art,
        chosenIndex: tally.option.index,
        chosenIndices: tally.tied ? tally.tied.map(o => o.index) : [tally.option.index],
        crisis: !!situation.crisis,
        chosenText: chosen.text,
        outcome: chosen.outcome,
        counts: tally.counts,
        reason: tally.reason,
        pollDelta,
        notes: [],
        battles: []
      };
      world.history.push({ turn, title: situation.title, choice: chosen.text });
    });

    // 2. Raids, in a fair random order.
    match.worldOrder.forEach(id => { match.worlds[id].raidedLastTurn = false; });
    const raiders = shuffle(match, match.worldOrder.filter(id => raidPasses(match, match.worlds[id])));
    match.worldOrder.forEach(id => {
      const world = match.worlds[id];
      if (world.raid && !raiders.includes(id)) {
        reports[id].notes.push(`The raid on ${match.worlds[world.raid.targetId].name} was voted down.`);
      }
    });
    raiders.forEach(id => {
      const attacker = match.worlds[id];
      const defender = match.worlds[attacker.raid.targetId];
      const battle = resolveRaid(match, attacker, defender);
      reports[attacker.id].battles.push(battle);
      reports[defender.id].battles.push(battle);
      log(match, battle.text);
    });

    // 3. Construction, ship orders and aid the crew voted on.
    match.worldOrder.forEach(id => {
      settleBuildPlan(match, match.worlds[id], reports[id]);
      settleShipPlan(match, match.worlds[id], reports[id]);
      settleAidPlan(match, match.worlds[id], reports);
    });

    // 4. Production, upkeep and passive effects.
    match.worldOrder.forEach(id => {
      const world = match.worlds[id];
      const report = reports[id];
      const mult = productionMultiplier(world);
      Object.keys(BUILDINGS).forEach(bid => {
        const def = BUILDINGS[bid];
        const b = world.buildings[bid];
        if (!def.produces || b.level < 1) return;
        const cap = storageCap(bid, b.level);
        const produced = Math.round(def.rate * b.level * mult);
        const room = cap - b.storage;
        b.storage = Math.min(cap, b.storage + produced);
        if (produced > room) report.notes.push(`${def.name} storage is full: ${produced - Math.max(0, room)} ${def.produces} was lost. Harvest sooner!`);
      });
      if (mult === 0) report.notes.push('Blackout: no production this turn.');
      addStat(world, 'energy', 3 * world.buildings.reactor.level - (2 + Math.floor(world.ships / 3)));
      addStat(world, 'morale', 2 * world.buildings.habitat.level - 1);
      const upkeep = shipUpkeep(world);
      if (world.gold >= upkeep) {
        world.gold -= upkeep;
      } else {
        world.gold = 0;
        addStat(world, 'morale', -3);
        report.notes.push('Ship crews went unpaid: Morale -3.');
      }
      if (world.stats.morale <= 0) {
        world.gold -= Math.floor(world.gold * 0.2);
        Object.values(world.buildings).forEach(b => { b.storage = Math.floor(b.storage / 2); });
        report.notes.push('Riots! 20% of gold and half of all storage were lost.');
      }

      // 5. Approved construction finishes at the end of the turn, active from the next one.
      if (world.pendingBuild) {
        world.buildings[world.pendingBuild.id].level = world.pendingBuild.target;
        report.notes.push(`${BUILDINGS[world.pendingBuild.id].name} reached Lv${world.pendingBuild.target}.`);
        world.pendingBuild = null;
      }
      world.ships = Math.min(world.ships, fleetCap(world));
      report.totalDelta = diffWorld(before[id], snapshotWorld(world));
      report.power = worldPower(world);
    });

    match.lastReport = { turn, worlds: reports };
    match.turn += 1;
    if (match.turn > match.maxTurns) finishMatch(match);
    return match.lastReport;
  }

  function standings(match) {
    return match.worldOrder
      .map(id => ({ id, name: match.worlds[id].name, hue: match.worlds[id].hue, power: worldPower(match.worlds[id]) }))
      .sort((a, b) => b.power - a.power);
  }

  function playerRanking(match) {
    return Object.values(match.players)
      .map(p => ({ id: p.id, name: p.name, bot: p.bot, worldId: p.worldId, exp: p.exp, level: playerLevel(p.exp), record: p.record }))
      .sort((a, b) => b.exp - a.exp || a.name.localeCompare(b.name));
  }

  function finishMatch(match) {
    const worlds = standings(match);
    const topPower = worlds[0].power;
    const winners = worlds.filter(w => w.power === topPower).map(w => w.id);
    Object.values(match.players).forEach(p => {
      p.exp += EXP.finish;
      if (winners.includes(p.worldId)) p.exp += EXP.victory;
    });
    match.finished = true;
    match.results = { winners, worlds, players: playerRanking(match) };
    log(match, `Match over. ${winners.map(id => match.worlds[id].name).join(' & ')} won.`);
    return match.results;
  }

  const api = {
    AID_AMOUNT, AID_GOODWILL, AID_RECEIVED, DEFENCE_BOUNTY, EXP, MAX_MEMBERS, MAX_SHIP_ORDER, INVENTORY_CAP, PACT_TURNS,
    PLAN_FIELDS, RAID_ENERGY_COST, RAID_SPOILS, REVENGE_ATTACK, REVENGE_TURNS, SHIP_COST, START_VALUE, STAT_KEYS,
    UNDERDOG_DEFENCE, UNDERDOG_PRODUCTION, UNDERDOG_RATIO, GameError,
    addPlayer, aidLockReason, applyEffects, averageEffects, buildCost, buildOptions, buildPasses, cancelBuild, cancelPlan,
    cancelRaid, cardAllowance, cardsLeft, castVote, clamp, createMatch, fleetCap, harvest, largestCrew, membersOf,
    optionLockReason, optionValue, planPasses, playCard, playerLevel, playerRanking, pollOptions, proposeAid, proposeBuild,
    proposeRaid, proposeShips, raidLockReason, raidOdds, raidPasses, random, resolveTurn, shipOrderLockReason, shipUpkeep,
    standings, startTurn, storageCap, storageOf, tallyPoll, voteBuild, votePlan, voteRaid, worldPower
  };

  root.FleetCouncilCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
