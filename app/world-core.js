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
  const RAID_ENERGY_COST = 10;
  const MAX_SHIP_ORDER = 3;
  const AID_AMOUNT = 20;

  const EXP = {
    vote: 5,
    build: 4,
    card: 3,
    aid: 2,
    raidWin: 12,
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
      cardPlayedTurn: 0,
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
    options.players.forEach(info => addPlayer(match, info));
    return match;
  }

  function addPlayer(match, info) {
    if (!match.worlds[info.worldId]) fail('Unknown world.');
    const player = createPlayer(info);
    match.players[player.id] = player;
    giveCard(match, player, randomCardType(match));
    return player;
  }

  function membersOf(match, worldId) {
    return Object.values(match.players).filter(p => p.worldId === worldId);
  }

  function randomCardType(match) {
    const types = Object.keys(SPECIAL_CARDS);
    return types[randomInt(match, types.length)];
  }

  function giveCard(match, player, type) {
    if (player.inventory.length >= INVENTORY_CAP) return null;
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

  function drawSituation(match) {
    if (!match.deck.length) match.deck = shuffle(match, SITUATIONS.map((_, i) => i));
    return SITUATIONS[match.deck.pop()];
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
    const anyOpen = situation.options.some(opt => !optionLockReason(world, opt.effects));
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
    let chosen;
    let reason;
    if (best === 0) {
      chosen = defaultOption(options);
      reason = 'No votes: the default option was used.';
    } else {
      const tied = options.filter(o => counts[o.index] === best);
      chosen = tied.length === 1 ? tied[0] : tied[randomInt(match, tied.length)];
      reason = tied.length === 1 ? 'Most votes.' : `Tie between ${tied.length} options, broken by a fair draw.`;
    }
    return { option: chosen, counts, reason };
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
    const exp = Math.max(1, Math.floor(amount / 4));
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
    world[plan.resource] -= plan.amount;
    target[plan.resource] += plan.amount;
    const proposer = match.players[plan.by];
    if (proposer) proposer.exp += EXP.aid;
    reports[world.id].notes.push(`Crew approved sending ${label} (${tally}).`);
    reports[target.id].notes.push(`${world.name} sent you ${plan.amount} ${plan.resource}.`);
    log(match, `${world.name} sent ${label}.`);
  }

  // ── Special cards ────────────────────────────────────────────────────────

  function playCard(match, playerId, uid, target) {
    const player = getPlayer(match, playerId);
    const world = match.worlds[player.worldId];
    const card = player.inventory.find(c => c.uid === uid);
    if (!card) fail('You do not hold that card.');
    if (player.cardPlayedTurn === match.turn) fail('One special card per turn.');
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
    player.cardPlayedTurn = match.turn;
    player.exp += EXP.card;
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

  function attackStrength(world) {
    return world.ships * 10 * (0.75 + world.stats.energy / 200);
  }

  function defenceStrength(world) {
    const base = world.ships * 10 * (1 + 0.2 * world.buildings.shield.level) * (0.75 + world.stats.security / 200) + 10;
    return world.flags.shieldMatrix ? base * 2 : base;
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
    const attack = Math.round(attackStrength(attacker) * (0.85 + random(match) * 0.3));
    const defence = Math.round(defenceStrength(defender) * (0.85 + random(match) * 0.3));
    const result = {
      attackerId: attacker.id, defenderId: defender.id, attack, defence,
      attackerShipsBefore: attacker.ships, defenderShipsBefore: defender.ships
    };

    if (attack > defence) {
      const goldLoot = Math.min(Math.floor(defender.gold * 0.3), 40);
      const oreLoot = Math.min(Math.floor(defender.ore * 0.2), 20);
      const defenderLoss = Math.min(defender.ships, Math.ceil(defender.ships * 0.25));
      defender.gold -= goldLoot;
      defender.ore -= oreLoot;
      defender.ships -= defenderLoss;
      addStat(defender, 'morale', -5);
      attacker.gold += goldLoot;
      attacker.ore += oreLoot;
      attacker.ships -= 1;
      defender.protectedUntilTurn = match.turn + 1;
      defender.raidedLastTurn = true;
      yesVoters.forEach(id => {
        const p = match.players[id];
        if (p) { p.exp += EXP.raidWin; p.record.raidsWon++; }
      });
      Object.assign(result, {
        winner: attacker.id, goldLoot, oreLoot, attackerLoss: 1, defenderLoss,
        text: `${attacker.name} raided ${defender.name} (${attack} vs ${defence}) and took ${goldLoot} gold, ${oreLoot} ore.`
      });
    } else {
      const attackerLoss = Math.min(attacker.ships, Math.ceil(attacker.ships * 0.35));
      const defenderLoss = defender.ships > 0 ? 1 : 0;
      attacker.ships -= attackerLoss;
      defender.ships -= defenderLoss;
      addStat(defender, 'security', 3);
      membersOf(match, defender.id).forEach(p => { p.exp += EXP.defend; });
      Object.assign(result, {
        winner: defender.id, goldLoot: 0, oreLoot: 0, attackerLoss, defenderLoss,
        text: `${defender.name} repelled ${attacker.name} (${defence} vs ${attack}).`
      });
    }
    return result;
  }

  // ── Turn resolution ──────────────────────────────────────────────────────

  function productionMultiplier(world) {
    let mult = 0.5 + world.stats.economy / 100;
    if (world.flags.overclock) mult *= 1.5;
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
      const chosen = situation.options[tally.option.index];
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
      if (world.gold >= world.ships) {
        world.gold -= world.ships;
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
    AID_AMOUNT, EXP, MAX_MEMBERS, MAX_SHIP_ORDER, INVENTORY_CAP, PLAN_FIELDS, RAID_ENERGY_COST, SHIP_COST, START_VALUE, STAT_KEYS, GameError,
    addPlayer, aidLockReason, applyEffects, buildCost, buildOptions, buildPasses, cancelBuild, cancelPlan, cancelRaid,
    castVote, clamp, createMatch, fleetCap, harvest, membersOf, optionLockReason, optionValue, planPasses, playCard,
    playerLevel, playerRanking, pollOptions, proposeAid, proposeBuild, proposeRaid, proposeShips, raidLockReason, raidPasses,
    random, resolveTurn, shipOrderLockReason, standings, startTurn, storageCap, tallyPoll, voteBuild, votePlan, voteRaid,
    worldPower
  };

  root.FleetCouncilCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
