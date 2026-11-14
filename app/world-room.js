// Fleet Council room: lobby, phases, timers, bots and per-player snapshots.
// The same class runs on the Node server (online play) and in the browser (practice mode).
// Time is always passed in, so the room never reads a clock by itself.
(function (root) {
  const isNode = typeof module !== 'undefined' && module.exports;
  const content = isNode ? require('../data/world-content.js') : root.FleetCouncilContent;
  const core = isNode ? require('./world-core.js') : root.FleetCouncilCore;
  const { WORLD_TEMPLATES, SPECIAL_CARDS, SIGNALS, SITUATIONS, BUILDINGS } = content;

  const REPORT_MS = 20000;
  const NAME_MAX = 16;
  const BOT_NAMES = ['Unit-7', 'Astra', 'Kepler', 'Halley', 'Nyx', 'Cosmo', 'Lumen', 'Vesta', 'Orbit', 'Quasar'];

  const DEFAULT_SETTINGS = { worldCount: 2, maxTurns: 10, voteSeconds: 75 };
  const ALLOWED = { worldCount: [2, 3, 4], maxTurns: [6, 10, 14], voteSeconds: [45, 75, 120] };

  function cleanName(name) {
    const text = String(name || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, NAME_MAX);
    return text || 'Pilot';
  }

  class Room {
    constructor(options) {
      this.code = options.code;
      this.seed = options.seed >>> 0 || 1;
      this.makeToken = options.makeToken || (() => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2));
      this.onChange = options.onChange || (() => {});
      this.onMatchEnd = options.onMatchEnd || (() => {});
      this.players = new Map();
      this.hostId = null;
      this.settings = Object.assign({}, DEFAULT_SETTINGS);
      this.phase = 'lobby';
      this.deadline = null;
      this.match = null;
      this.version = 0;
      this.signals = [];
      this.botPlans = new Map();
      this.nextId = 1;
      this.lastActivity = options.now || 0;
      this.botRng = { rngState: (this.seed ^ 0x9e3779b9) | 0 };
    }

    // ── Membership ─────────────────────────────────────────────────────────

    activeWorldIds() {
      return WORLD_TEMPLATES.slice(0, this.settings.worldCount).map(w => w.id);
    }

    worldMembers(worldId) {
      return [...this.players.values()].filter(p => p.worldId === worldId);
    }

    smallestWorld() {
      const ids = this.activeWorldIds().filter(id => this.worldMembers(id).length < core.MAX_MEMBERS);
      ids.sort((a, b) => this.worldMembers(a).length - this.worldMembers(b).length);
      return ids[0] || null;
    }

    uniqueName(name) {
      const taken = new Set([...this.players.values()].map(p => p.name.toLowerCase()));
      if (!taken.has(name.toLowerCase())) return name;
      for (let i = 2; ; i++) {
        const candidate = name.slice(0, NAME_MAX - 3) + ' ' + i;
        if (!taken.has(candidate.toLowerCase())) return candidate;
      }
    }

    // `account` is the server's key for a PIN-protected pilot name (null for guests and bots).
    addPlayer(name, now, bot, worldId, account) {
      const target = worldId || this.smallestWorld();
      if (!target) throw new core.GameError('Every world is full (4 per world).');
      if (this.worldMembers(target).length >= core.MAX_MEMBERS) throw new core.GameError('That world is full.');
      const player = {
        id: 'p' + (this.nextId++),
        name: this.uniqueName(cleanName(name)),
        token: bot ? null : this.makeToken(),
        bot: !!bot,
        account: account || null,
        worldId: target,
        connections: 0,
        ready: false
      };
      this.players.set(player.id, player);
      if (!bot && !this.hostId) this.hostId = player.id;
      if (this.match) {
        core.addPlayer(this.match, { id: player.id, name: player.name, bot: player.bot, worldId: player.worldId });
        if (bot && this.phase === 'vote') this.planBot(player, now);
      }
      this.touch(now);
      return player;
    }

    join(name, now, account) {
      return this.addPlayer(name, now, false, null, account);
    }

    playerByToken(token) {
      if (!token) return null;
      return [...this.players.values()].find(p => p.token === token) || null;
    }

    // Lets a registered pilot continue on another device without a second seat.
    playerByAccount(account) {
      if (!account) return null;
      return [...this.players.values()].find(p => p.account === account && !p.left) || null;
    }

    // ── Saving and restoring ───────────────────────────────────────────────
    // Times are stored relative to `now`, so a restored room resumes its timers
    // where they stopped instead of expiring during the downtime.

    toJSON(now) {
      return {
        format: 1,
        code: this.code,
        seed: this.seed,
        settings: this.settings,
        phase: this.phase,
        deadlineLeft: this.deadline === null ? null : Math.max(0, this.deadline - now),
        match: this.match,
        version: this.version,
        signals: this.signals,
        nextId: this.nextId,
        hostId: this.hostId,
        botRng: this.botRng,
        players: [...this.players.values()].map(p => Object.assign({}, p, { connections: 0 })),
        botPlans: [...this.botPlans].map(([id, at]) => [id, Math.max(0, at - now)])
      };
    }

    static fromJSON(data, options, now) {
      const room = new Room(Object.assign({}, options, { code: data.code, seed: data.seed, now }));
      room.settings = data.settings;
      room.phase = data.phase;
      room.deadline = data.deadlineLeft === null ? null : now + data.deadlineLeft;
      room.match = data.match;
      room.version = data.version;
      room.signals = data.signals || [];
      room.nextId = data.nextId;
      room.hostId = data.hostId;
      room.botRng = data.botRng;
      room.players = new Map(data.players.map(p => [p.id, p]));
      room.botPlans = new Map(data.botPlans.map(([id, left]) => [id, now + left]));
      return room;
    }

    setConnected(playerId, delta, now) {
      const player = this.players.get(playerId);
      if (!player) return;
      player.connections = Math.max(0, player.connections + delta);
      this.touch(now);
    }

    removePlayer(playerId, now) {
      const player = this.players.get(playerId);
      if (!player) return;
      if (this.phase === 'lobby') {
        this.players.delete(playerId);
      } else {
        player.connections = 0;
        player.left = true;
      }
      if (this.hostId === playerId) {
        const next = [...this.players.values()].find(p => !p.bot && !p.left && p.id !== playerId);
        this.hostId = next ? next.id : null;
      }
      this.touch(now);
    }

    humans() {
      return [...this.players.values()].filter(p => !p.bot && !p.left);
    }

    touch(now) {
      if (typeof now === 'number') this.lastActivity = now;
      this.version++;
      this.onChange(this);
    }

    // ── Commands ───────────────────────────────────────────────────────────

    command(playerId, type, payload, now) {
      const player = this.players.get(playerId);
      if (!player) return { ok: false, error: 'You are not in this room.' };
      payload = payload || {};
      try {
        const result = this.dispatch(player, type, payload, now);
        this.touch(now);
        return { ok: true, result: result || null };
      } catch (error) {
        if (error instanceof core.GameError) return { ok: false, error: error.message };
        throw error;
      }
    }

    requireHost(player) {
      if (player.id !== this.hostId) throw new core.GameError('Only the host can do that.');
    }

    requirePhase(...phases) {
      if (!phases.includes(this.phase)) throw new core.GameError('Not available right now.');
    }

    dispatch(player, type, payload, now) {
      const m = this.match;
      switch (type) {
        case 'signal': {
          const text = SIGNALS[payload.index];
          if (!text) throw new core.GameError('Unknown signal.');
          const last = this.signals[this.signals.length - 1];
          if (last && last.playerId === player.id && now - last.at < 3000) throw new core.GameError('Slow down a little.');
          this.signals.push({ playerId: player.id, name: player.name, worldId: player.worldId, text, at: now });
          if (this.signals.length > 30) this.signals.shift();
          return null;
        }
        case 'settings': {
          this.requirePhase('lobby');
          this.requireHost(player);
          Object.keys(ALLOWED).forEach(key => {
            const value = Number(payload[key]);
            if (payload[key] !== undefined && ALLOWED[key].includes(value)) this.settings[key] = value;
          });
          // Players whose world disappeared move to the smallest remaining world.
          const active = this.activeWorldIds();
          [...this.players.values()].forEach(p => {
            if (!active.includes(p.worldId)) {
              const target = this.smallestWorld();
              if (target) p.worldId = target;
              else this.players.delete(p.id);
            }
          });
          return null;
        }
        case 'pickWorld': {
          this.requirePhase('lobby');
          if (!this.activeWorldIds().includes(payload.worldId)) throw new core.GameError('Unknown world.');
          if (payload.worldId === player.worldId) return null;
          if (this.worldMembers(payload.worldId).length >= core.MAX_MEMBERS) throw new core.GameError('That world is full.');
          player.worldId = payload.worldId;
          return null;
        }
        case 'addBot': {
          this.requirePhase('lobby');
          this.requireHost(player);
          const name = BOT_NAMES[this.nextId % BOT_NAMES.length] + ' [BOT]';
          this.addPlayer(name, now, true, payload.worldId || null);
          return null;
        }
        case 'fillBots': {
          this.requirePhase('lobby');
          this.requireHost(player);
          this.activeWorldIds().forEach(id => {
            if (this.worldMembers(id).length === 0) {
              this.addPlayer(BOT_NAMES[this.nextId % BOT_NAMES.length] + ' [BOT]', now, true, id);
            }
          });
          return null;
        }
        case 'removeBot': {
          this.requirePhase('lobby');
          this.requireHost(player);
          const bot = this.players.get(payload.playerId);
          if (!bot || !bot.bot) throw new core.GameError('Not a bot.');
          this.players.delete(bot.id);
          return null;
        }
        case 'start': {
          this.requirePhase('lobby');
          this.requireHost(player);
          const empty = this.activeWorldIds().filter(id => this.worldMembers(id).length === 0);
          if (empty.length) throw new core.GameError('Every world needs at least one member. Add bots or change the world count.');
          this.startMatch(now);
          return null;
        }
        case 'vote':
          this.requirePhase('vote');
          core.castVote(m, player.id, Number(payload.option));
          return null;
        case 'proposeRaid':
          this.requirePhase('vote');
          core.proposeRaid(m, player.id, payload.targetId);
          return null;
        case 'playCard':
          this.requirePhase('vote');
          return core.playCard(m, player.id, payload.uid, payload.target);
        case 'build':
          this.requirePhase('vote');
          return core.proposeBuild(m, player.id, payload.buildingId);
        case 'proposeShips':
          this.requirePhase('vote');
          core.proposeShips(m, player.id, payload.count);
          return null;
        case 'proposeAid':
          this.requirePhase('vote');
          core.proposeAid(m, player.id, payload.targetId, payload.resource);
          return null;
        // Yes/no and cancel for any crew plan: kind is raid, build, ships or aid.
        case 'planVote':
          this.requirePhase('vote');
          core.votePlan(m, player.id, payload.kind, !!payload.yes);
          return null;
        case 'cancelPlan':
          this.requirePhase('vote');
          core.cancelPlan(m, player.id, payload.kind);
          return null;
        case 'harvest':
          this.requirePhase('vote', 'report');
          return core.harvest(m, player.id, payload.buildingId);
        case 'ready':
          this.requirePhase('report');
          player.ready = true;
          return null;
        case 'skip':
          this.requireHost(player);
          this.requirePhase('vote', 'report');
          this.deadline = now;
          return null;
        case 'restart':
          this.requirePhase('ended');
          this.requireHost(player);
          this.match = null;
          this.phase = 'lobby';
          this.deadline = null;
          [...this.players.values()].forEach(p => { if (p.left) this.players.delete(p.id); });
          return null;
        default:
          throw new core.GameError('Unknown command.');
      }
    }

    // ── Phases ─────────────────────────────────────────────────────────────

    startMatch(now) {
      const worlds = WORLD_TEMPLATES.slice(0, this.settings.worldCount);
      const players = [...this.players.values()].map(p => ({ id: p.id, name: p.name, bot: p.bot, worldId: p.worldId }));
      this.seed = (Math.imul(this.seed, 1664525) + 1013904223) >>> 0;
      this.match = core.createMatch({ seed: this.seed, maxTurns: this.settings.maxTurns, worlds, players });
      this.beginVote(now);
    }

    beginVote(now) {
      core.startTurn(this.match);
      this.phase = 'vote';
      this.deadline = now + this.settings.voteSeconds * 1000;
      this.botPlans.clear();
      [...this.players.values()].filter(p => p.bot).forEach(bot => this.planBot(bot, now));
    }

    everyoneDecided() {
      const m = this.match;
      const deciders = [...this.players.values()].filter(p => !p.left && (p.bot || p.connections > 0));
      if (!deciders.length) return false;
      return deciders.every(p => {
        const world = m.worlds[p.worldId];
        if (p.bot && this.botPlans.has(p.id)) return false;
        if (world.votes[p.id] === undefined) return false;
        return Object.values(core.PLAN_FIELDS).every(field => !world[field] || world[field].votes[p.id] !== undefined);
      });
    }

    lockAndResolve(now) {
      core.resolveTurn(this.match);
      [...this.players.values()].forEach(p => { p.ready = p.bot; });
      if (this.match.finished) {
        this.phase = 'ended';
        this.deadline = null;
        this.onMatchEnd(this, this.match.results);
      } else {
        this.phase = 'report';
        this.deadline = now + REPORT_MS;
      }
    }

    tick(now) {
      // With no human connected the clock pauses, so bots cannot play the match out alone.
      const anyoneHere = this.humans().some(p => p.connections > 0);
      if (!anyoneHere && this.deadline && this.lastTick !== undefined) this.deadline += now - this.lastTick;
      this.lastTick = now;
      if (!anyoneHere) return;
      if (this.phase === 'vote') {
        let changed = this.runBots(now);
        if (now >= this.deadline || this.everyoneDecided()) {
          this.lockAndResolve(now);
          changed = true;
        }
        if (changed) this.touch(now);
      } else if (this.phase === 'report') {
        const waiting = this.humans().filter(p => p.connections > 0 && !p.ready);
        if (now >= this.deadline || !waiting.length) {
          this.beginVote(now);
          this.touch(now);
        }
      }
    }

    // ── Bots ───────────────────────────────────────────────────────────────

    planBot(bot, now) {
      const delay = 1500 + Math.floor(core.random(this.botRng) * 4500);
      this.botPlans.set(bot.id, now + delay);
    }

    runBots(now) {
      let acted = false;
      for (const [id, at] of [...this.botPlans]) {
        if (at > now) continue;
        this.botPlans.delete(id);
        const bot = this.players.get(id);
        if (bot) { this.botAct(bot); acted = true; }
      }
      // Bots answer plans proposed after they already acted.
      [...this.players.values()].filter(p => p.bot && !this.botPlans.has(p.id)).forEach(bot => {
        if (this.botVotePlans(bot)) acted = true;
      });
      return acted;
    }

    // Votes on every open crew plan the bot has not answered yet. Returns true if it voted.
    botVotePlans(bot) {
      const world = this.match.worlds[bot.worldId];
      let voted = false;
      Object.entries(core.PLAN_FIELDS).forEach(([kind, field]) => {
        const plan = world[field];
        if (!plan || plan.votes[bot.id] !== undefined) return;
        core.votePlan(this.match, bot.id, kind, this.botLikesPlan(world, kind, plan));
        voted = true;
      });
      return voted;
    }

    // Bots back plans that leave the world a small reserve; raids only against weaker fleets.
    botLikesPlan(world, kind, plan) {
      if (kind === 'raid') return world.ships >= this.match.worlds[plan.targetId].ships;
      if (kind === 'build') {
        const cost = core.buildCost(plan.id, plan.target);
        return world.gold - cost.gold >= 10 && world.ore >= cost.ore;
      }
      if (kind === 'ships') return world.gold - core.SHIP_COST.gold * plan.count >= 10 && world.ore >= core.SHIP_COST.ore * plan.count;
      return world[plan.resource] - plan.amount >= 30;
    }

    botAct(bot) {
      const m = this.match;
      const world = m.worlds[bot.worldId];
      const attempt = fn => { try { return fn(); } catch (e) { if (!(e instanceof core.GameError)) throw e; return null; } };

      // Leave harvesting to human teammates unless the storage is about to overflow.
      const humansAboard = this.worldMembers(world.id).some(p => !p.bot && !p.left && p.connections > 0);
      Object.keys(BUILDINGS).forEach(id => {
        const b = world.buildings[id];
        const nearlyFull = b.storage >= core.storageCap(id, b.level) * 0.8;
        if (b.storage > 0 && (!humansAboard || nearlyFull)) attempt(() => core.harvest(m, bot.id, id));
      });

      const priorities = ['mine', 'refinery', 'shipyard', 'core', 'shield', 'habitat', 'reactor'];
      if (world.stats.energy < 35) priorities.unshift('reactor');
      if (world.stats.morale < 35) priorities.unshift('habitat');
      const builds = core.buildOptions(world);
      const choice = priorities.map(id => builds.find(b => b.id === id)).find(b => b && !b.lockReason);
      if (choice && world.gold - choice.cost.gold >= 15) attempt(() => core.proposeBuild(m, bot.id, choice.id));
      if (world.ships < 4) attempt(() => core.proposeShips(m, bot.id, 1));

      // Vote: favour whatever repairs the weakest stat, with a little noise.
      const weakest = core.STAT_KEYS.slice().sort((a, b) => world.stats[a] - world.stats[b])[0];
      const options = core.pollOptions(world).filter(o => !o.vetoed && !o.lockReason);
      if (options.length) {
        const scored = options.map(o => ({ o, score: o.value + (o.effects[weakest] || 0) * 0.5 + core.random(this.botRng) * 3 }));
        scored.sort((a, b) => b.score - a.score);
        attempt(() => core.castVote(m, bot.id, scored[0].o.index));
      }

      if (!world.raid && core.random(this.botRng) < 0.35) {
        const rivals = m.worldOrder.filter(id => id !== world.id).map(id => m.worlds[id])
          .filter(r => !core.raidLockReason(m, world, r) && world.ships >= r.ships + 2);
        if (rivals.length) attempt(() => core.proposeRaid(m, bot.id, rivals[0].id));
      }
      this.botVotePlans(bot);

      const player = m.players[bot.id];
      if (player && player.inventory.length && player.cardPlayedTurn !== m.turn) {
        const card = player.inventory.find(c => ['convoy', 'rally', 'overclock', 'shield_matrix'].includes(c.type));
        if (card) attempt(() => core.playCard(m, bot.id, card.uid));
      }
    }

    // ── Snapshots ──────────────────────────────────────────────────────────

    publicWorld(world) {
      return {
        id: world.id,
        name: world.name,
        hue: world.hue,
        stats: world.stats,
        gold: world.gold,
        ore: world.ore,
        ships: world.ships,
        fleetCap: core.fleetCap(world),
        buildings: Object.fromEntries(Object.entries(world.buildings).map(([id, b]) => [id, { level: b.level }])),
        power: core.worldPower(world),
        protected: world.protectedUntilTurn >= this.match.turn,
        raidedLastTurn: world.raidedLastTurn,
        members: this.worldMembers(world.id).map(p => this.memberView(p))
      };
    }

    memberView(p) {
      const mp = this.match && this.match.players[p.id];
      const world = this.match && this.match.worlds[p.worldId];
      return {
        id: p.id,
        name: p.name,
        bot: p.bot,
        online: p.bot || p.connections > 0,
        left: !!p.left,
        level: mp ? core.playerLevel(mp.exp) : 1,
        voted: !!(world && world.votes[p.id] !== undefined),
        ready: p.ready
      };
    }

    privateWorld(world, me) {
      const situation = world.poll && SITUATIONS.find(s => s.id === world.poll.situationId);
      const votes = {};
      Object.entries(world.votes).forEach(([pid, index]) => {
        const p = this.players.get(pid);
        (votes[index] = votes[index] || []).push(p ? p.name : '?');
      });
      return Object.assign(this.publicWorld(world), {
        buildings: Object.fromEntries(Object.entries(world.buildings).map(([id, b]) => [id, {
          level: b.level, storage: b.storage, cap: core.storageCap(id, b.level)
        }])),
        buildOptions: core.buildOptions(world),
        pendingBuild: world.pendingBuild,
        flags: world.flags,
        poll: situation ? {
          id: situation.id, title: situation.title, body: situation.body, art: situation.art,
          options: core.pollOptions(world), votes, myVote: world.votes[me.id]
        } : null,
        raid: this.planView(world, 'raid', me, p => ({ targetId: p.targetId })),
        buildPlan: this.planView(world, 'build', me, p => ({ id: p.id, target: p.target, cost: core.buildCost(p.id, p.target) })),
        shipPlan: this.planView(world, 'ships', me, p => ({
          count: p.count, cost: { gold: core.SHIP_COST.gold * p.count, ore: core.SHIP_COST.ore * p.count }
        })),
        aidPlan: this.planView(world, 'aid', me, p => ({
          targetId: p.targetId, targetName: this.match.worlds[p.targetId].name, resource: p.resource, amount: p.amount
        })),
        history: world.history.slice(-6)
      });
    }

    // What a crewmate sees of an open plan: details, who proposed it, the votes so far.
    planView(world, kind, me, details) {
      const plan = world[core.PLAN_FIELDS[kind]];
      if (!plan) return null;
      const name = id => (this.players.get(id) || {}).name;
      return Object.assign(details(plan), {
        by: name(plan.by),
        byMe: plan.by === me.id,
        yes: Object.entries(plan.votes).filter(([, v]) => v).map(([id]) => name(id)),
        no: Object.entries(plan.votes).filter(([, v]) => !v).map(([id]) => name(id)),
        myVote: plan.votes[me.id],
        passing: core.planPasses(this.match, world, kind)
      });
    }

    snapshot(playerId, now) {
      const me = this.players.get(playerId);
      const base = {
        code: this.code,
        phase: this.phase,
        version: this.version,
        serverNow: now,
        deadline: this.deadline,
        settings: this.settings,
        hostId: this.hostId,
        signals: this.signals.slice(-12),
        me: me ? { id: me.id, name: me.name, worldId: me.worldId, isHost: me.id === this.hostId, ready: me.ready, registered: !!me.account } : null
      };
      if (!this.match || this.phase === 'lobby') {
        base.lobby = WORLD_TEMPLATES.slice(0, this.settings.worldCount).map(t => ({
          id: t.id, name: t.name, hue: t.hue,
          members: this.worldMembers(t.id).map(p => ({ id: p.id, name: p.name, bot: p.bot, online: p.bot || p.connections > 0 }))
        }));
        return base;
      }
      const m = this.match;
      const mine = me && m.players[me.id];
      base.match = {
        turn: Math.min(m.turn, m.maxTurns),
        maxTurns: m.maxTurns,
        worlds: m.worldOrder.map(id => (me && id === me.worldId) ? this.privateWorld(m.worlds[id], me) : this.publicWorld(m.worlds[id])),
        players: core.playerRanking(m),
        log: m.log.filter(entry => !entry.worldId || (me && entry.worldId === me.worldId)).slice(-25),
        lastReport: m.lastReport ? this.reportView(m.lastReport, me) : null,
        results: m.results,
        raidReasons: me ? Object.fromEntries(m.worldOrder.filter(id => id !== me.worldId).map(id => [id, core.raidLockReason(m, m.worlds[me.worldId], m.worlds[id])])) : {}
      };
      if (mine) {
        base.me.exp = mine.exp;
        base.me.level = core.playerLevel(mine.exp);
        base.me.nextLevelExp = 25 * Math.pow(core.playerLevel(mine.exp), 2);
        base.me.inventory = mine.inventory.map(c => Object.assign({ uid: c.uid, type: c.type }, SPECIAL_CARDS[c.type]));
        base.me.cardPlayed = mine.cardPlayedTurn === m.turn;
        base.me.record = mine.record;
      }
      return base;
    }

    // Other worlds see what a rival chose and how battles went, not its vote split.
    reportView(report, me) {
      const worlds = {};
      Object.entries(report.worlds).forEach(([id, r]) => {
        if (me && id === me.worldId) worlds[id] = r;
        else worlds[id] = { worldId: id, situationTitle: r.situationTitle, chosenText: r.chosenText, battles: r.battles, power: r.power };
      });
      return { turn: report.turn, worlds };
    }
  }

  const api = { Room, DEFAULT_SETTINGS, ALLOWED, REPORT_MS, cleanName };
  root.FleetCouncilRoom = api;
  if (isNode) module.exports = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
