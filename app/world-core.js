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
      aidTurn: 0,
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
      else if (world.pendingBuild) lockReason = 'One build per turn';
      else if (world.gold < cost.gold || world.ore < cost.ore) lockReason = 'Not enough resources';
      return { id, level, target, cost, lockReason };
    });
  }

  function startBuild(match, playerId, buildingId) {
    const player = getPlayer(match, playerId);
    const world = match.worlds[player.worldId];
    const option = buildOptions(world).find(o => o.id === buildingId);
    if (!option) fail('Unknown building.');
    if (option.lockReason) fail(option.lockReason + '.');
    world.gold -= option.cost.gold;
    world.ore -= option.cost.ore;
    world.pendingBuild = { id: buildingId, target: option.target, by: player.name };
    player.exp += EXP.build;
    player.record.builds++;
    log(match, `${player.name} started ${BUILDINGS[buildingId].name} Lv${option.target}.`, world.id);
    return option;
  }

  function buildShip(match, playerId) {
    const player = getPlayer(match, playerId);
    const world = match.worlds[player.worldId];
    if (world.buildings.shipyard.level < 1) fail('Build a Shipyard first.');
    if (world.ships >= fleetCap(world)) fail('Fleet is at its cap. Upgrade the Shipyard.');
    if (world.gold < SHIP_COST.gold || world.ore < SHIP_COST.ore) fail('Not enough resources.');
    world.gold -= SHIP_COST.gold;
    world.ore -= SHIP_COST.ore;
    world.ships += 1;
    log(match, `${player.name} launched a new ship.`, world.id);
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

  function sendAid(match, playerId, targetId, resource) {
    const player = getPlayer(match, playerId);
    const world = match.worlds[player.worldId];
    const target = match.worlds[targetId];
    if (!target || target === world) fail('Choose another world.');
    if (resource !== 'gold' && resource !== 'ore') fail('Only gold or ore can be sent.');
    if (player.aidTurn === match.turn) fail('You already sent aid this turn.');
    if (world[resource] < 10) fail(`Your world needs 10 ${resource}.`);
    world[resource] -= 10;
    target[resource] += 10;
    player.aidTurn = match.turn;
    player.exp += EXP.aid;
    log(match, `${player.name} (${world.name}) sent 10 ${resource} to ${target.name}.`);
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

  function voteRaid(match, playerId, yes) {
    const player = getPlayer(match, playerId);
    const world = match.worlds[player.worldId];
    if (!world.raid) fail('There is no raid plan.');
    world.raid.votes[playerId] = !!yes;
  }

  function cancelRaid(match, playerId) {
    const player = getPlayer(match, playerId);
    const world = match.worlds[player.worldId];
    if (!world.raid) fail('There is no raid plan.');
    if (world.raid.by !== playerId) fail('Only the proposer can cancel.');
    world.raid = null;
  }

  function raidPasses(match, world) {
    if (!world.raid) return false;
    const members = membersOf(match, world.id).length;
    const votes = Object.values(world.raid.votes);
    const yes = votes.filter(Boolean).length;
    const no = votes.length - yes;
    return yes > no && yes * 2 >= members;
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

    // 3. Production, upkeep and passive effects.
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

      // 4. Construction finishes at the end of the turn, active from the next one.
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
    EXP, MAX_MEMBERS, INVENTORY_CAP, RAID_ENERGY_COST, START_VALUE, STAT_KEYS, GameError,
    addPlayer, applyEffects, buildCost, buildOptions, buildShip, cancelRaid, castVote, clamp,
    createMatch, fleetCap, harvest, membersOf, optionLockReason, optionValue, playCard,
    playerLevel, playerRanking, pollOptions, proposeRaid, raidLockReason, raidPasses, random,
    resolveTurn, sendAid, standings, startBuild, startTurn, storageCap, tallyPoll, voteRaid, worldPower
  };

  root.FleetCouncilCore = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
