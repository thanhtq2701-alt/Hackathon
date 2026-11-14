// Fleet Council browser client.
// Renders room snapshots and sends commands. Two transports share one interface:
//   NetTransport   - online room on the Node server (fetch + Server-Sent Events)
//   LocalTransport - offline practice room with bots, running the same Room class in the page
(function () {
  const C = window.FleetCouncilContent;
  const Art = window.FleetCouncilArt;
  const { Room } = window.FleetCouncilRoom;
  const view = document.getElementById('view');

  const STAT_ORDER = ['morale', 'economy', 'energy', 'security'];
  const LABEL = { morale: 'Morale', economy: 'Economy', energy: 'Energy', security: 'Security', gold: 'Gold', ore: 'Ore', ships: 'Ships' };
  const PHASE_LABEL = { vote: 'Council vote', report: 'Turn report', lobby: 'Lobby', ended: 'Match over' };
  // Where online rooms run. Static copies of the site link here instead of offering broken buttons.
  const ONLINE_URL = 'https://fleet-council.onrender.com/world.html';

  const app = { transport: null, snap: null, clockOffset: 0, screen: null, cache: {}, tab: 'galaxy', busy: false };

  // ── Utilities ────────────────────────────────────────────────────────────

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (error) {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* storage unavailable */ }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (error) { /* storage unavailable */ }
    }
  };

  // Room sessions live per tab, so two tabs in one browser are two different pilots,
  // while reloading a tab rejoins as the same pilot.
  const tabStore = {
    get(key, fallback) {
      try {
        const raw = sessionStorage.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (error) {
        return fallback;
      }
    },
    set(key, value) {
      try { sessionStorage.setItem(key, JSON.stringify(value)); } catch (error) { /* storage unavailable */ }
    },
    remove(key) {
      try { sessionStorage.removeItem(key); } catch (error) { /* storage unavailable */ }
    }
  };

  function esc(value) {
    return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function signed(n) {
    return (n > 0 ? '+' : '') + n;
  }

  function chips(effects, empty) {
    const keys = Object.keys(effects || {}).filter(k => effects[k]);
    if (!keys.length) return `<span class="chip neutral">${empty || 'No change'}</span>`;
    return keys.map(k => `<span class="chip ${effects[k] > 0 ? 'up' : 'down'}">${signed(effects[k])} ${LABEL[k] || k}</span>`).join('');
  }

  function cost(c) {
    return `${c.gold}g · ${c.ore}o`;
  }

  let toastTimer = null;
  function toast(message, kind) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.className = 'show ' + (kind || '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = ''; }, 3200);
  }

  function setConn(text) {
    const el = document.getElementById('conn');
    el.hidden = !text;
    el.textContent = text || '';
  }

  function ensureScreen(key, html) {
    if (app.screen === key) return;
    app.screen = key;
    app.cache = {};
    view.innerHTML = html;
  }

  function setRegion(id, html) {
    if (app.cache[id] === html) return;
    app.cache[id] = html;
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
  }

  // Animated SVG is only rebuilt when what it depicts changes.
  function setKeyed(id, key, build) {
    const cacheKey = id + '#key';
    if (app.cache[cacheKey] === key) return;
    app.cache[cacheKey] = key;
    const el = document.getElementById(id);
    if (el) el.innerHTML = build();
  }

  function myWorld() {
    const s = app.snap;
    return s && s.match && s.match.worlds.find(w => w.id === s.me.worldId);
  }

  function worldById(id) {
    return app.snap.match.worlds.find(w => w.id === id);
  }

  function worldName(id) {
    const list = (app.snap.match && app.snap.match.worlds) || app.snap.lobby || [];
    const w = list.find(x => x.id === id);
    return w ? w.name : id;
  }

  function hueOf(id) {
    const t = C.WORLD_TEMPLATES.find(w => w.id === id);
    return t ? t.hue : 200;
  }

  // ── Local ranking (offline practice) ─────────────────────────────────────

  function recordLocal(results) {
    const ranks = store.get('fc.ranks', {});
    results.players.filter(p => !p.bot).forEach(p => {
      const key = p.name.toLowerCase();
      const entry = ranks[key] || { name: p.name, exp: 0, matches: 0, wins: 0, raidsWon: 0 };
      entry.exp += p.exp;
      entry.matches += 1;
      entry.raidsWon += p.record.raidsWon;
      if (results.winners.includes(p.worldId)) entry.wins += 1;
      ranks[key] = entry;
    });
    store.set('fc.ranks', ranks);
  }

  // ── Transports ───────────────────────────────────────────────────────────

  async function post(path, body) {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    let data = {};
    try { data = await response.json(); } catch (error) { /* empty body */ }
    if (!response.ok && !('ok' in data)) throw new Error(data.error || 'The server did not answer.');
    return data;
  }

  class NetTransport {
    constructor(code, token) {
      this.code = code;
      this.token = token;
      this.offline = false;
    }

    static async create(name, pin) {
      const data = await post('/api/create', { name, pin });
      return new NetTransport(data.code, data.token);
    }

    static async join(code, name, token, pin) {
      const data = await post('/api/join', { code, name, token, pin });
      return new NetTransport(data.code, data.token);
    }

    connect(onSnapshot) {
      const url = `/api/events?code=${encodeURIComponent(this.code)}&token=${encodeURIComponent(this.token)}`;
      this.events = new EventSource(url);
      this.events.onmessage = event => onSnapshot(JSON.parse(event.data));
      this.events.onopen = () => setConn('');
      this.events.onerror = () => {
        if (this.events.readyState === EventSource.CLOSED) {
          tabStore.remove('fc.session');
          leaveToHome('The room is no longer available.');
        } else {
          setConn('Reconnecting…');
        }
      };
    }

    send(type, payload) {
      return post('/api/command', { code: this.code, token: this.token, type, payload: payload || {} });
    }

    close(leaving) {
      if (leaving) this.send('leave').catch(() => {});
      if (this.events) this.events.close();
    }
  }

  class LocalTransport {
    constructor(name) {
      this.offline = true;
      this.code = 'PRACTICE';
      const now = Date.now();
      this.room = new Room({
        code: this.code,
        seed: Math.floor(Math.random() * 2147483647),
        now,
        onChange: () => this.queue(),
        onMatchEnd: (room, results) => recordLocal(results)
      });
      this.me = this.room.join(name, now);
      this.room.setConnected(this.me.id, 1, now);
      const rival = C.WORLD_TEMPLATES[1].id;
      this.room.command(this.me.id, 'addBot', { worldId: this.me.worldId }, now);
      this.room.command(this.me.id, 'addBot', { worldId: this.me.worldId }, now);
      this.room.command(this.me.id, 'addBot', { worldId: rival }, now);
      this.room.command(this.me.id, 'addBot', { worldId: rival }, now);
      this.room.command(this.me.id, 'addBot', { worldId: rival }, now);
    }

    queue() {
      if (this.pending) return;
      this.pending = true;
      Promise.resolve().then(() => {
        this.pending = false;
        if (this.onSnapshot) this.onSnapshot(this.room.snapshot(this.me.id, Date.now()));
      });
    }

    connect(onSnapshot) {
      this.onSnapshot = onSnapshot;
      this.timer = setInterval(() => this.room.tick(Date.now()), 250);
      this.queue();
    }

    send(type, payload) {
      return Promise.resolve(this.room.command(this.me.id, type, payload || {}, Date.now()));
    }

    close() {
      clearInterval(this.timer);
      this.onSnapshot = null;
    }
  }

  // ── Flow ─────────────────────────────────────────────────────────────────

  function enterRoom(transport) {
    app.transport = transport;
    app.screen = null;
    if (!transport.offline) {
      tabStore.set('fc.session', { code: transport.code, token: transport.token });
      history.replaceState(null, '', `world.html?room=${transport.code}`);
    }
    transport.connect(onSnapshot);
  }

  function leaveToHome(message) {
    if (app.transport) app.transport.close(true);
    app.transport = null;
    app.snap = null;
    app.screen = null;
    setConn('');
    tabStore.remove('fc.session');
    history.replaceState(null, '', 'world.html');
    renderHome(message);
  }

  function onSnapshot(snap) {
    if (!snap.me) {
      leaveToHome('You are no longer in that room.');
      return;
    }
    app.clockOffset = snap.serverNow - Date.now();
    app.snap = snap;
    render();
  }

  async function send(type, payload) {
    if (!app.transport) return null;
    try {
      const outcome = await app.transport.send(type, payload);
      if (!outcome.ok) {
        toast(outcome.error, 'warn');
        return null;
      }
      return outcome.result;
    } catch (error) {
      toast(error.message, 'warn');
      return null;
    }
  }

  // ── Home ─────────────────────────────────────────────────────────────────

  function renderHome(message) {
    app.screen = 'home';
    app.cache = {};
    const name = store.get('fc.name', '');
    const code = (new URLSearchParams(location.search).get('room') || '').toUpperCase();
    const demo = {
      id: 'aurora-demo', name: 'Aurora Prime', hue: 188, ships: 6, raidedLastTurn: false,
      stats: { morale: 62, economy: 58, energy: 70, security: 55 },
      buildings: { core: { level: 2 }, mine: { level: 2 }, refinery: { level: 2 }, reactor: { level: 1 }, shipyard: { level: 2 }, shield: { level: 1 }, habitat: { level: 1 } }
    };
    view.innerHTML = `
      <section class="home">
        <div class="hero">
          <div class="hero-copy">
            <p class="eyebrow">Team strategy · 2–4 worlds · 1–4 pilots per world</p>
            <h1>Every team is a world.</h1>
            <p class="lead">Your crew votes on each crisis together. Between votes you build your planet, harvest what it produces, and choose whether to trade with rival worlds or raid them.</p>
            <form id="home-form" class="home-form" onsubmit="return false">
              <div class="name-row">
                <label class="field">Pilot name
                  <input id="name" maxlength="16" value="${esc(name)}" placeholder="Your name" autocomplete="nickname">
                </label>
                <label class="field">PIN
                  <input id="pin" type="password" inputmode="numeric" maxlength="8" placeholder="Optional" autocomplete="off">
                </label>
              </div>
              <p class="note pin-note">A PIN (4–8 digits) reserves your pilot name and keeps your EXP in the all-time ranking. Without one you play as a guest. The first PIN you use for a name becomes its PIN.</p>
              <div class="home-actions">
                <button type="button" class="btn primary" data-home="create">Create online room</button>
                <div class="join-row">
                  <input id="code" maxlength="4" placeholder="CODE" value="${esc(code)}" aria-label="Room code" autocomplete="off">
                  <button type="button" class="btn" data-home="join">Join room</button>
                </div>
                <button type="button" class="btn ghost" data-home="practice">Practice offline with bots</button>
              </div>
              <p id="server-note" class="note"></p>
              ${message ? `<p class="note warn">${esc(message)}</p>` : ''}
            </form>
          </div>
          <div class="hero-art">${Art.planetScene(demo)}</div>
        </div>
        <div class="home-grid">
          <article class="panel">
            <h2>How a turn works</h2>
            <ol class="steps">
              <li><b>Crisis.</b> Each world draws a situation with 3–4 option cards. Options are balanced: every card has a cost and a gain.</li>
              <li><b>Vote.</b> Every pilot has one vote. Most votes wins; a tie is settled by a fair draw.</li>
              <li><b>Build &amp; harvest.</b> Buildings fill their storage each turn. Harvest for gold, ore, EXP and a chance at special cards.</li>
              <li><b>Raid or aid.</b> Propose a raid on a rival world — it launches only if your crew agrees — or send them supplies.</li>
            </ol>
            <p class="note">All worlds start equal: every stat at 50, 50 gold, 50 ore, 3 ships.</p>
          </article>
          <article class="panel">
            <h2>Pilot ranking</h2>
            <div id="hall"><p class="note">Loading…</p></div>
          </article>
        </div>
      </section>`;
    loadHall();
  }

  function hallTable(players, source) {
    if (!players.length) return `<p class="note">No finished matches yet${source ? ' ' + source : ''}.</p>`;
    return `<table class="rank-table"><thead><tr><th>#</th><th>Pilot</th><th>Lv</th><th>EXP</th><th>Wins</th><th>Matches</th></tr></thead><tbody>
      ${players.slice(0, 15).map((p, i) => `<tr><td>${i + 1}</td><td>${esc(p.name)}</td><td>${window.FleetCouncilCore.playerLevel(p.exp)}</td><td>${p.exp}</td><td>${p.wins}</td><td>${p.matches}</td></tr>`).join('')}
      </tbody></table>${source ? `<p class="note">${source}</p>` : ''}`;
  }

  async function loadHall() {
    const note = () => document.getElementById('server-note');
    const hall = () => document.getElementById('hall');
    try {
      const response = await fetch('/api/leaderboard', { cache: 'no-store' });
      if (!response.ok) throw new Error('offline');
      const data = await response.json();
      app.serverOnline = true;
      if (hall()) hall().innerHTML = hallTable(data.players, '(PIN-protected pilots only)');
    } catch (error) {
      app.serverOnline = false;
      const local = Object.values(store.get('fc.ranks', {})).sort((a, b) => b.exp - a.exp);
      if (hall()) hall().innerHTML = hallTable(local, '(practice matches on this device)');
      if (note()) note().innerHTML = '<b>Online rooms are off on this site</b> because it runs without the game server. Practice with bots works right now, or open the online server.';
      showOfflineActions();
    }
  }

  // Without a server, practice becomes the main action and online buttons are disabled up front,
  // instead of failing only after a click.
  function showOfflineActions() {
    const actions = document.querySelector('.home-actions');
    if (!actions) return;
    const practice = actions.querySelector('[data-home="practice"]');
    practice.className = 'btn primary';
    actions.prepend(practice);
    const pinInput = document.getElementById('pin');
    if (pinInput) {
      pinInput.disabled = true;
      pinInput.placeholder = 'Online only';
    }
    actions.querySelectorAll('[data-home="create"], [data-home="join"], #code').forEach(el => {
      el.disabled = true;
      el.title = 'Needs the Fleet Council server';
    });
    actions.querySelector('[data-home="create"]').className = 'btn';
    actions.querySelector('[data-home="create"]').textContent = 'Create online room (server needed)';
    if (location.origin !== new URL(ONLINE_URL).origin) {
      const online = document.createElement('a');
      online.className = 'btn';
      online.href = ONLINE_URL + location.search;
      online.textContent = 'Play online at fleet-council.onrender.com →';
      practice.after(online);
    }
  }

  async function homeAction(kind) {
    if (app.busy) return;
    const nameInput = document.getElementById('name');
    const name = nameInput.value.trim();
    if (!name) {
      toast('Enter a pilot name first.', 'warn');
      nameInput.focus();
      return;
    }
    store.set('fc.name', name);
    if (kind === 'practice') {
      enterRoom(new LocalTransport(name));
      return;
    }
    if (app.serverOnline === false) {
      toast('The online server is not running. Try practice mode.', 'warn');
      return;
    }
    const pin = document.getElementById('pin').value.trim();
    if (pin && !/^\d{4,8}$/.test(pin)) {
      toast('The PIN must be 4 to 8 digits, or leave it empty to play as a guest.', 'warn');
      return;
    }
    app.busy = true;
    try {
      if (kind === 'create') {
        enterRoom(await NetTransport.create(name, pin));
      } else {
        const code = document.getElementById('code').value.trim().toUpperCase();
        if (!/^[A-Z]{4}$/.test(code)) {
          toast('Room codes have 4 letters.', 'warn');
          return;
        }
        const session = tabStore.get('fc.session', null);
        enterRoom(await NetTransport.join(code, name, session && session.code === code ? session.token : null, pin));
      }
    } catch (error) {
      toast(error.message, 'warn');
    } finally {
      app.busy = false;
    }
  }

  // ── Router ───────────────────────────────────────────────────────────────

  function render() {
    const s = app.snap;
    if (!s) return;
    if (s.phase === 'lobby') renderLobby(s);
    else if (s.phase === 'ended') renderEnded(s);
    else renderGame(s);
    updateTimer();
  }

  // ── Lobby ────────────────────────────────────────────────────────────────

  function renderLobby(s) {
    ensureScreen('lobby', `
      <section class="lobby">
        <div id="lobby-head" class="lobby-head"></div>
        <div id="lobby-worlds" class="lobby-worlds"></div>
        <div id="lobby-foot" class="lobby-foot"></div>
        <div id="lobby-signals" class="panel signals-panel"></div>
      </section>`);
    const offline = app.transport && app.transport.offline;
    const host = s.me.isHost;
    const link = `${location.origin}${location.pathname}?room=${s.code}`;
    const seg = (key, values, suffix) => `<div class="seg" role="group" aria-label="${key}">${values.map(v =>
      `<button class="${s.settings[key] === v ? 'on' : ''}" data-act="settings" data-key="${key}" data-value="${v}" ${host ? '' : 'disabled'}>${v}${suffix}</button>`).join('')}</div>`;

    setRegion('lobby-head', `
      <div class="room-code">
        <span class="eyebrow">${offline ? 'Offline practice room' : 'Room code'}</span>
        <strong>${offline ? 'PRACTICE' : esc(s.code)}</strong>
        ${offline ? '<span class="note">Bots are labelled BOT. Practice results are saved on this device only.</span>'
          : `<button class="btn small" data-act="copy" data-link="${esc(link)}">Copy invite link</button>`}
      </div>
      <div class="settings">
        <div><span class="label">Worlds</span>${seg('worldCount', [2, 3, 4], '')}</div>
        <div><span class="label">Turns</span>${seg('maxTurns', [6, 10, 14], '')}</div>
        <div><span class="label">Vote time</span>${seg('voteSeconds', [45, 75, 120], 's')}</div>
      </div>`);

    setRegion('lobby-worlds', s.lobby.map(w => {
      const mine = w.id === s.me.worldId;
      return `<article class="world-col ${mine ? 'mine' : ''}" style="--h:${w.hue}">
        <header><span class="dot"></span><h3>${esc(w.name)}</h3><span class="count">${w.members.length}/4</span></header>
        <ul class="members">${w.members.map(m => `<li>
          <span class="online ${m.online ? 'on' : ''}" title="${m.online ? 'Online' : 'Offline'}"></span>
          ${esc(m.name)}${m.id === s.me.id ? ' <em>(you)</em>' : ''}${m.id === s.hostId ? ' <span class="tag">HOST</span>' : ''}
          ${host && m.bot ? `<button class="x" data-act="removeBot" data-id="${m.id}" aria-label="Remove ${esc(m.name)}">×</button>` : ''}
        </li>`).join('') || '<li class="empty">No pilots yet</li>'}</ul>
        <footer>
          ${mine ? '<span class="note">Your world</span>' : `<button class="btn small" data-act="pickWorld" data-id="${w.id}" ${w.members.length >= 4 ? 'disabled' : ''}>Join this world</button>`}
          ${host ? `<button class="btn small ghost" data-act="addBot" data-id="${w.id}" ${w.members.length >= 4 ? 'disabled' : ''}>+ Bot</button>` : ''}
        </footer>
      </article>`;
    }).join(''));

    const empty = s.lobby.filter(w => !w.members.length).length;
    setRegion('lobby-foot', `
      ${host ? `<button class="btn primary big" data-act="start" ${empty ? 'disabled' : ''}>Launch match</button>
        ${empty ? `<button class="btn" data-act="fillBots">Fill empty worlds with bots</button><span class="note">${empty} world(s) have no pilots.</span>` : ''}`
        : '<span class="note">Waiting for the host to launch the match…</span>'}
      <button class="btn ghost" data-act="leave">Leave</button>`);

    setRegion('lobby-signals', signalsHtml(s));
  }

  function signalsHtml(s) {
    return `<h3>Signals</h3>
      <div class="signal-feed">${s.signals.slice().reverse().map(x =>
        `<p style="--h:${hueOf(x.worldId)}"><b>${esc(x.name)}</b> ${esc(x.text)}</p>`).join('') || '<p class="note">Send a quick signal to every world.</p>'}</div>
      <div class="signal-buttons">${C.SIGNALS.map((text, i) => `<button class="btn tiny" data-act="signal" data-i="${i}">${esc(text)}</button>`).join('')}</div>`;
  }

  // ── Game ─────────────────────────────────────────────────────────────────

  function renderGame(s) {
    ensureScreen('game', `
      <section class="game">
        <div id="g-status" class="statusbar"></div>
        <div class="game-grid">
          <div class="col-world panel">
            <div id="g-planet" class="planet-wrap"></div>
            <div id="g-base"></div>
          </div>
          <div id="g-council" class="col-council"></div>
          <div id="g-side" class="col-side"></div>
        </div>
      </section>`);
    const world = myWorld();
    renderStatus(s, world);
    setKeyed('g-planet', planetKey(world), () => Art.planetScene(world));
    renderBase(s, world);
    if (s.phase === 'vote') renderPoll(s, world);
    else renderReport(s, world);
    renderSide(s, world);
  }

  function planetKey(w) {
    const levels = Object.values(w.buildings).map(b => b.level).join('');
    return [w.id, levels, Math.min(w.ships, 12), w.stats.energy < 25, w.raidedLastTurn].join('|');
  }

  function renderStatus(s, world) {
    const me = s.me;
    const floor = 25 * Math.pow(me.level - 1, 2);
    const pct = Math.round(100 * (me.exp - floor) / Math.max(1, me.nextLevelExp - floor));
    setRegion('g-status', `
      <div class="turn"><span class="label">Turn</span><strong>${s.match.turn}</strong><span class="of">/ ${s.match.maxTurns}</span></div>
      <div class="phase ${s.phase}"><span class="label">${PHASE_LABEL[s.phase]}</span><strong id="timer">--:--</strong></div>
      <div class="me-world" style="--h:${world.hue}"><span class="dot"></span>${esc(world.name)}</div>
      <div class="me-exp" title="${me.exp} EXP"><span class="label">${esc(me.name)} · Lv ${me.level}</span>
        <div class="xpbar"><span style="width:${pct}%"></span></div><span class="xp">${me.exp} EXP</span></div>
      <div class="status-actions">
        ${me.isHost ? `<button class="btn tiny ghost" data-act="skip" title="End this phase now">Skip timer</button>` : ''}
        <button class="btn tiny ghost" data-act="leave">Leave</button>
      </div>`);
  }

  function statBars(stats) {
    return STAT_ORDER.map(k => `<div class="stat ${k} ${stats[k] < 25 ? 'danger' : ''}">
      <span class="stat-name">${LABEL[k]}</span><span class="stat-val">${stats[k]}</span>
      <div class="bar"><span style="width:${stats[k]}%"></span></div></div>`).join('');
  }

  function renderBase(s, w) {
    const pending = w.pendingBuild;
    const shipCost = C.SHIP_COST;
    const canShip = w.buildings.shipyard.level > 0 && w.ships < w.fleetCap && w.gold >= shipCost.gold && w.ore >= shipCost.ore;
    const shipReason = w.buildings.shipyard.level < 1 ? 'Build a Shipyard first' : w.ships >= w.fleetCap ? 'Fleet cap reached' : 'Not enough resources';
    const tiles = Object.keys(C.BUILDINGS).map(id => {
      const def = C.BUILDINGS[id];
      const b = w.buildings[id];
      const opt = w.buildOptions.find(o => o.id === id);
      const isPending = pending && pending.id === id;
      const storage = def.produces && b.level ? `
        <div class="storage"><div class="bar"><span style="width:${Math.round(100 * b.storage / Math.max(1, b.cap))}%"></span></div>
          <span>${b.storage}/${b.cap}</span></div>
        <button class="btn tiny harvest" data-act="harvest" data-id="${id}" ${b.storage > 0 ? '' : 'disabled'}>${b.storage > 0 ? `Harvest +${b.storage} ${def.produces}` : 'Nothing yet'}</button>` : '';
      const planned = w.buildPlan && w.buildPlan.id === id;
      const voting = s.phase === 'vote';
      const upgrade = planned
        ? `<span class="building-now">Proposed Lv${w.buildPlan.target} · crew is voting</span>`
        : isPending
          ? `<span class="building-now">Building Lv${pending.target}…</span>`
          : opt.lockReason === 'Max level'
            ? '<span class="note">Max level</span>'
            : `<button class="btn tiny" data-act="build" data-id="${id}" ${opt.lockReason || !voting ? 'disabled' : ''} title="${esc(opt.lockReason || (voting ? 'Ask your crew to approve this construction' : 'Propose during the council vote'))}">
                Propose ${b.level ? 'upgrade' : 'build'} Lv${opt.target} · ${cost(opt.cost)}</button>
               ${opt.lockReason && opt.lockReason !== 'One build per turn' ? `<span class="lock">${esc(opt.lockReason)}</span>` : ''}`;
      return `<div class="bld ${b.level ? '' : 'unbuilt'} ${isPending || planned ? 'pending' : ''}">
        <div class="bld-head">${Art.buildingIcon(id, b.level)}<div><b>${def.name}</b><span class="lv">${b.level ? 'Lv' + b.level : 'Not built'}</span></div></div>
        <p class="bld-desc">${def.describe(Math.max(1, b.level))}</p>${storage}<div class="bld-actions">${upgrade}</div></div>`;
    }).join('');

    setRegion('g-base', `
      <div class="stats">${statBars(w.stats)}</div>
      <div class="resources">
        <div><span class="label">Gold</span><strong class="gold">${w.gold}</strong></div>
        <div><span class="label">Ore</span><strong class="ore">${w.ore}</strong></div>
        <div><span class="label">Ships</span><strong>${w.ships}<small>/${w.fleetCap}</small></strong></div>
        <div><span class="label">Power</span><strong>${w.power}</strong></div>
      </div>
      <div class="fleet-row">
        <span class="ships">${Array.from({ length: Math.min(w.ships, 12) }, () => Art.shipIcon(w.hue)).join('')}</span>
        <button class="btn tiny" data-act="ship" ${canShip ? '' : 'disabled'} title="${canShip ? '' : shipReason}">Build ship · ${cost(shipCost)}</button>
      </div>
      ${w.flags && (w.flags.overclock || w.flags.shieldMatrix) ? `<p class="flags">${w.flags.overclock ? '⚡ Overclock active ' : ''}${w.flags.shieldMatrix ? '🛡 Shield Matrix active' : ''}</p>` : ''}
      <h3 class="section-title">Your planet <span class="note">Construction needs crew approval · one per turn · decided when the vote ends</span></h3>
      <div class="buildings">${tiles}</div>`);
  }

  function renderPoll(s, w) {
    const poll = w.poll;
    const open = poll.options.filter(o => !o.vetoed && !o.lockReason);
    const fallback = open[0] || poll.options.find(o => !o.vetoed);
    const voters = w.members.filter(m => !m.left);
    const votedCount = voters.filter(m => m.voted).length;
    setRegion('g-council', `
      <article class="situation panel">
        <div class="sit-art-wrap">${Art.situationArt(poll.art, w.hue)}</div>
        <div class="sit-body">
          <span class="eyebrow">Council of ${esc(w.name)}</span>
          <h2>${esc(poll.title)}</h2>
          <p>${esc(poll.body)}</p>
        </div>
      </article>
      <div class="options count-${poll.options.length}">
        ${poll.options.map(o => {
          const mine = poll.myVote === o.index;
          const names = poll.votes[o.index] || [];
          const disabled = o.vetoed || o.lockReason;
          return `<article class="opt ${mine ? 'mine' : ''} ${o.vetoed ? 'vetoed' : ''} ${o.lockReason ? 'locked' : ''}">
            <div class="opt-top"><span class="opt-num">${o.index + 1}</span>
              ${fallback && fallback.index === o.index ? '<span class="tag" title="Chosen if nobody votes">DEFAULT</span>' : ''}
              ${o.vetoed ? '<span class="tag red">VETOED</span>' : ''}</div>
            <p class="opt-text">${esc(o.text)}</p>
            <div class="chips">${chips(o.effects)}</div>
            <div class="opt-votes">${names.map(n => `<span class="voter">${esc(n)}</span>`).join('')}</div>
            <button class="btn ${mine ? 'primary' : ''}" data-act="vote" data-option="${o.index}" ${disabled ? 'disabled' : ''}>
              ${o.vetoed ? 'Struck out' : o.lockReason ? esc(o.lockReason) : mine ? '✓ Your vote' : 'Vote'}</button>
          </article>`;
        }).join('')}
      </div>
      <div class="crew panel">
        <span class="label">Crew votes ${votedCount}/${voters.length}</span>
        ${voters.map(m => `<span class="crew-member ${m.voted ? 'done' : ''}">${m.voted ? '✓' : '…'} ${esc(m.name)}${m.online ? '' : ' (offline)'}</span>`).join('')}
        <p class="note">The vote locks when everyone online has voted, or when the timer runs out. You can change your vote until then.</p>
      </div>`);
  }

  function renderReport(s, w) {
    const report = s.match.lastReport;
    if (!report) {
      setRegion('g-council', '<div class="panel">Resolving…</div>');
      return;
    }
    const mine = report.worlds[w.id];
    const situation = C.SITUATIONS.find(x => x.title === mine.situationTitle);
    const total = Object.values(mine.counts).reduce((a, b) => a + b, 0);
    const humans = s.match.worlds.flatMap(x => x.members).filter(m => !m.bot && m.online && !m.left);
    const waiting = humans.filter(m => !m.ready).map(m => m.name);
    const battles = mine.battles.map(b => {
      const attacker = worldById(b.attackerId);
      const defender = worldById(b.defenderId);
      const won = b.winner === w.id;
      if (b.aborted) return `<div class="battle"><p>${esc(b.text)}</p></div>`;
      return `<div class="battle ${won ? 'won' : 'lost'}">
        ${Art.battleArt(attacker.hue, defender.hue, b.winner === b.attackerId)}
        <p><b>${won ? 'Victory' : 'Defeat'}</b> — ${esc(b.text)}</p>
        <p class="note">Losses: ${esc(attacker.name)} −${b.attackerLoss} ship(s), ${esc(defender.name)} −${b.defenderLoss} ship(s).</p>
      </div>`;
    }).join('');
    const rivals = Object.values(report.worlds).filter(r => r.worldId !== w.id);

    setRegion('g-council', `
      <article class="report panel">
        <span class="eyebrow">Turn ${report.turn} report</span>
        <h2>${esc(mine.situationTitle)}</h2>
        <div class="decision">
          <p class="chosen">“${esc(mine.chosenText)}”</p>
          <p class="outcome">${esc(mine.outcome)}</p>
          <p class="note">${esc(mine.reason)}</p>
        </div>
        ${situation ? `<div class="tally">${situation.options.map((o, i) => {
          const n = mine.counts[i] || 0;
          return `<div class="tally-row ${i === mine.chosenIndex ? 'win' : ''}"><span>${i + 1}. ${esc(o.text)}</span>
            <div class="bar"><span style="width:${total ? Math.round(100 * n / total) : 0}%"></span></div><b>${n}</b></div>`;
        }).join('')}</div>` : ''}
        <div class="delta-block"><span class="label">Decision effect</span><div class="chips">${chips(mine.pollDelta)}</div></div>
        <div class="delta-block"><span class="label">Whole turn (decision, raids, production, upkeep)</span><div class="chips">${chips(mine.totalDelta)}</div></div>
        ${mine.notes.length ? `<ul class="notes">${mine.notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
        ${battles}
        ${rivals.length ? `<div class="rivals-report"><span class="label">Other worlds</span>${rivals.map(r => `<p style="--h:${hueOf(r.worldId)}"><span class="dot"></span><b>${esc(worldName(r.worldId))}</b> faced “${esc(r.situationTitle)}” and chose “${esc(r.chosenText)}”</p>`).join('')}</div>` : ''}
        <div class="ready-row">
          <button class="btn primary" data-act="ready" ${s.me.ready ? 'disabled' : ''}>${s.me.ready ? '✓ Ready' : `Ready for turn ${s.match.turn}`}</button>
          <span class="note">${waiting.length ? 'Waiting for ' + waiting.map(esc).join(', ') : 'Starting…'} · you can still harvest and build now.</span>
        </div>
      </article>`);
  }

  function renderSide(s, w) {
    const tabs = [['galaxy', 'Galaxy'], ['cards', `Cards (${s.me.inventory.length})`], ['ranking', 'Ranking'], ['log', 'Log']];
    let body = '';
    if (app.tab === 'galaxy') body = galaxyHtml(s, w);
    else if (app.tab === 'cards') body = cardsHtml(s, w);
    else if (app.tab === 'ranking') body = rankingHtml(s);
    else body = logHtml(s);
    setRegion('g-side', `
      ${buildPlanHtml(s, w)}
      ${raidHtml(s, w)}
      <div class="panel side-panel">
        <div class="tabs" role="tablist">${tabs.map(([id, label]) => `<button role="tab" aria-selected="${app.tab === id}" class="${app.tab === id ? 'on' : ''}" data-act="tab" data-tab="${id}">${label}</button>`).join('')}</div>
        <div class="tab-body">${body}</div>
      </div>`);
  }

  function buildPlanHtml(s, w) {
    const p = w.buildPlan;
    if (!p || s.phase !== 'vote') return '';
    const name = C.BUILDINGS[p.id].name;
    return `<div class="panel build-plan">
      <span class="eyebrow">🏗 Build plan</span>
      <h3>${esc(name)} Lv${p.target}?</h3>
      <p class="note">Proposed by ${esc(p.by)}. Costs ${cost(p.cost)} from the shared treasury. Decided when the vote ends: more yes than no, and at least half the crew says yes. Staying silent counts as not objecting.</p>
      <p>Yes: ${p.yes.map(esc).join(', ') || '—'}<br>No: ${p.no.map(esc).join(', ') || '—'}</p>
      <p class="${p.passing ? 'ok' : 'warn'}">${p.passing ? 'Will be built' : 'Not enough support yet'}</p>
      <div class="row">
        <button class="btn small ${p.myVote === true ? 'primary' : ''}" data-act="buildVote" data-yes="1">Yes, build</button>
        <button class="btn small ${p.myVote === false ? 'primary' : ''}" data-act="buildVote" data-yes="0">No</button>
        ${p.byMe ? '<button class="btn small ghost" data-act="cancelBuild">Cancel plan</button>' : ''}</div>
    </div>`;
  }

  function raidHtml(s, w) {
    if (!w.raid) return '';
    const r = w.raid;
    const target = worldById(r.targetId);
    const voting = s.phase === 'vote';
    return `<div class="panel raid-plan">
      <span class="eyebrow">⚔ Raid plan</span>
      <h3>Raid ${esc(target.name)}?</h3>
      <p class="note">Proposed by ${esc(r.by)}. Costs 10 Energy. Launches at the end of the vote if more crew say yes than no, and at least half the crew says yes.</p>
      <p>Yes: ${r.yes.map(esc).join(', ') || '—'}<br>No: ${r.no.map(esc).join(', ') || '—'}</p>
      <p class="${r.passing ? 'ok' : 'warn'}">${r.passing ? 'Will launch' : 'Not enough support yet'}</p>
      ${voting ? `<div class="row">
        <button class="btn small ${r.myVote === true ? 'primary' : ''}" data-act="raidVote" data-yes="1">Yes, attack</button>
        <button class="btn small ${r.myVote === false ? 'primary' : ''}" data-act="raidVote" data-yes="0">No</button>
        ${r.byMe ? '<button class="btn small ghost" data-act="cancelRaid">Cancel plan</button>' : ''}</div>` : ''}
    </div>`;
  }

  function galaxyHtml(s, w) {
    const rivals = s.match.worlds.filter(x => x.id !== w.id);
    const voting = s.phase === 'vote';
    return rivals.map(r => {
      const reason = s.match.raidReasons[r.id];
      return `<div class="rival" style="--h:${r.hue}">
        <div class="rival-head"><span class="dot"></span><b>${esc(r.name)}</b>
          ${r.protected ? '<span class="tag">PROTECTED</span>' : ''}${r.raidedLastTurn ? '<span class="tag red">RAIDED</span>' : ''}</div>
        <div class="rival-stats">
          <span>Power <b>${r.power}</b></span><span>Ships <b>${r.ships}</b></span><span>Shield <b>Lv${r.buildings.shield.level}</b></span>
          <span>Gold <b>${r.gold}</b></span><span>Ore <b>${r.ore}</b></span>
        </div>
        <div class="mini-stats">${STAT_ORDER.map(k => `<div class="mini ${k}" title="${LABEL[k]} ${r.stats[k]}"><span style="width:${r.stats[k]}%"></span></div>`).join('')}</div>
        <p class="crew-line">${r.members.map(m => esc(m.name)).join(', ')}</p>
        <div class="row">
          ${voting ? `<button class="btn tiny danger" data-act="raid" data-id="${r.id}" ${reason ? 'disabled' : ''} title="${esc(reason || 'Propose a raid to your crew')}">⚔ Propose raid</button>` : ''}
          <button class="btn tiny" data-act="aid" data-id="${r.id}" data-res="gold" ${s.me.aidSent ? 'disabled' : ''}>Send 10 gold</button>
          <button class="btn tiny" data-act="aid" data-id="${r.id}" data-res="ore" ${s.me.aidSent ? 'disabled' : ''}>Send 10 ore</button>
        </div>
        ${voting && reason ? `<p class="lock">${esc(reason)}</p>` : ''}
      </div>`;
    }).join('') + '<p class="note">Aid: each pilot can send one shipment per turn.</p>';
  }

  function cardsHtml(s, w) {
    const inv = s.me.inventory;
    if (!inv.length) return '<p class="note">No special cards. Harvesting has a 25% chance to find one (max 5).</p>';
    const voting = s.phase === 'vote';
    const blocked = !voting ? 'Cards can be played during the council vote.' : s.me.cardPlayed ? 'You already played a card this turn.' : '';
    const rivals = s.match.worlds.filter(x => x.id !== w.id);
    const openOptions = w.poll ? w.poll.options.filter(o => !o.vetoed) : [];
    return `${blocked ? `<p class="note">${blocked}</p>` : ''}${inv.map(card => {
      let buttons = '';
      if (card.target === 'world') {
        buttons = rivals.map(r => `<button class="btn tiny" data-act="card" data-uid="${card.uid}" data-target="${r.id}" ${blocked ? 'disabled' : ''}>On ${esc(r.name)}</button>`).join('');
      } else if (card.target === 'option') {
        buttons = openOptions.map(o => `<button class="btn tiny" data-act="card" data-uid="${card.uid}" data-target="${o.index}" ${blocked || openOptions.length <= 2 ? 'disabled' : ''}>Strike ${o.index + 1}</button>`).join('');
      } else {
        buttons = `<button class="btn tiny" data-act="card" data-uid="${card.uid}" ${blocked ? 'disabled' : ''}>Play</button>`;
      }
      return `<div class="special ${card.type}">${Art.cardGlyph(card.type)}<div><b>${esc(card.name)}</b><p>${esc(card.text)}</p><div class="row">${buttons}</div></div></div>`;
    }).join('')}`;
  }

  function rankingHtml(s) {
    const worlds = s.match.worlds.slice().sort((a, b) => b.power - a.power);
    const top = Math.max(...worlds.map(x => x.power), 1);
    return `<h4>Worlds by power</h4>
      ${worlds.map((x, i) => `<div class="power-row" style="--h:${x.hue}"><span>${i + 1}. ${esc(x.name)}</span><div class="bar"><span style="width:${Math.round(100 * x.power / top)}%"></span></div><b>${x.power}</b></div>`).join('')}
      <h4>Pilots by EXP</h4>
      <table class="rank-table"><thead><tr><th>#</th><th>Pilot</th><th>Lv</th><th>EXP</th></tr></thead><tbody>
      ${s.match.players.map((p, i) => `<tr class="${p.id === s.me.id ? 'me' : ''}"><td>${i + 1}</td><td><span class="dot" style="--h:${hueOf(p.worldId)}"></span>${esc(p.name)}</td><td>${p.level}</td><td>${p.exp}</td></tr>`).join('')}
      </tbody></table>
      <p class="note">EXP: vote +5, build +4, harvest +1 per 4 units, special card +3, aid +2, winning raid +12, repelling a raid +8, finishing +10, winning world +30.</p>`;
  }

  function logHtml(s) {
    return `<div class="log">${s.match.log.slice().reverse().map(e => `<p><span class="t">T${e.turn}</span>${esc(e.text)}</p>`).join('') || '<p class="note">Nothing yet.</p>'}</div>
      <div class="signals-inline">${signalsHtml(s)}</div>`;
  }

  // ── Ended ────────────────────────────────────────────────────────────────

  function renderEnded(s) {
    ensureScreen('ended', '<section id="end" class="end"></section>');
    const results = s.match.results;
    const winners = results.winners.map(id => worldName(id));
    const mineWon = results.winners.includes(s.me.worldId);
    const top = Math.max(...results.worlds.map(w => w.power), 1);
    setRegion('end', `
      <div class="end-hero ${mineWon ? 'won' : ''}">
        <span class="eyebrow">Match over · ${s.match.maxTurns} turns</span>
        <h1>${esc(winners.join(' & '))} ${winners.length > 1 ? 'share' : 'takes'} the sector</h1>
        <p class="lead">${mineWon ? 'Your world finished on top. Every pilot of the winning world earns +30 EXP.' : 'Your world did not finish first this time. Every pilot still earns +10 EXP for finishing.'}</p>
      </div>
      <div class="end-grid">
        <article class="panel">
          <h2>Worlds</h2>
          ${results.worlds.map((w, i) => `<div class="power-row" style="--h:${w.hue}"><span>${i + 1}. ${esc(w.name)}</span><div class="bar"><span style="width:${Math.round(100 * w.power / top)}%"></span></div><b>${w.power}</b></div>`).join('')}
        </article>
        <article class="panel">
          <h2>Pilot ranking</h2>
          <table class="rank-table"><thead><tr><th>#</th><th>Pilot</th><th>Lv</th><th>EXP</th><th>Votes</th><th>Harvested</th><th>Raids won</th></tr></thead><tbody>
          ${results.players.map((p, i) => `<tr class="${p.id === s.me.id ? 'me' : ''}"><td>${i + 1}</td><td><span class="dot" style="--h:${hueOf(p.worldId)}"></span>${esc(p.name)}</td><td>${p.level}</td><td>${p.exp}</td><td>${p.record.votes}</td><td>${p.record.harvested}</td><td>${p.record.raidsWon}</td></tr>`).join('')}
          </tbody></table>
          <p class="note">${app.transport && app.transport.offline ? 'Saved to this device\'s practice ranking.' : (s.me.registered ? 'Your EXP was added to the all-time ranking.' : 'You played as a guest, so this match is not in the all-time ranking. Add a PIN next time to keep your EXP.')}</p>
        </article>
      </div>
      <div class="end-actions">
        ${s.me.isHost ? '<button class="btn primary" data-act="restart">Back to lobby with this crew</button>' : '<span class="note">The host can start another match.</span>'}
        <button class="btn ghost" data-act="leave">Leave</button>
      </div>`);
  }

  // ── Timer ────────────────────────────────────────────────────────────────

  function updateTimer() {
    const el = document.getElementById('timer');
    if (!el || !app.snap || !app.snap.deadline) return;
    const left = Math.max(0, app.snap.deadline - (Date.now() + app.clockOffset));
    const sec = Math.ceil(left / 1000);
    el.textContent = `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
    el.classList.toggle('urgent', sec <= 10);
  }
  setInterval(updateTimer, 250);

  // ── Events ───────────────────────────────────────────────────────────────

  async function act(d) {
    switch (d.act) {
      case 'vote': await send('vote', { option: Number(d.option) }); break;
      case 'harvest': {
        const r = await send('harvest', { buildingId: d.id });
        if (r) toast(`+${r.amount} ${r.resource} · +${r.exp} EXP${r.card ? ` · Found a card: ${C.SPECIAL_CARDS[r.card.type].name}!` : ''}`, r.card ? 'good' : '');
        break;
      }
      case 'build': {
        const r = await send('build', { buildingId: d.id });
        if (r) toast(`Proposed ${C.BUILDINGS[d.id].name} Lv${r.target}. Your crew votes until the vote ends.`);
        break;
      }
      case 'buildVote': await send('buildVote', { yes: d.yes === '1' }); break;
      case 'cancelBuild': await send('cancelBuild'); break;
      case 'ship': if (await send('buildShip') !== null) toast('A new ship joins the fleet.'); break;
      case 'raid': await send('proposeRaid', { targetId: d.id }); break;
      case 'raidVote': await send('raidVote', { yes: d.yes === '1' }); break;
      case 'cancelRaid': await send('cancelRaid'); break;
      case 'aid': if (await send('aid', { targetId: d.id, resource: d.res }) !== null) toast(`Sent 10 ${d.res} to ${worldName(d.id)}.`); break;
      case 'card': {
        const r = await send('playCard', { uid: d.uid, target: d.target });
        if (r) toast(`${C.SPECIAL_CARDS[r.type].name} played.`, 'good');
        break;
      }
      case 'ready': await send('ready'); break;
      case 'skip': await send('skip'); break;
      case 'signal': await send('signal', { index: Number(d.i) }); break;
      case 'settings': await send('settings', { [d.key]: Number(d.value) }); break;
      case 'pickWorld': await send('pickWorld', { worldId: d.id }); break;
      case 'addBot': await send('addBot', { worldId: d.id }); break;
      case 'removeBot': await send('removeBot', { playerId: d.id }); break;
      case 'fillBots': await send('fillBots'); break;
      case 'start': await send('start'); break;
      case 'restart': await send('restart'); break;
      case 'tab': app.tab = d.tab; render(); break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(d.link);
          toast('Invite link copied.');
        } catch (error) {
          toast(d.link);
        }
        break;
      case 'leave': leaveToHome(); break;
      default: break;
    }
  }

  view.addEventListener('click', event => {
    const home = event.target.closest('[data-home]');
    if (home) {
      homeAction(home.dataset.home);
      return;
    }
    const button = event.target.closest('[data-act]');
    if (!button || button.disabled) return;
    act(button.dataset);
  });

  view.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    if (event.target.id === 'code') homeAction('join');
    else if (event.target.id === 'name' || event.target.id === 'pin') homeAction(document.getElementById('code').value.trim() ? 'join' : 'create');
  });

  // ── Boot ─────────────────────────────────────────────────────────────────

  async function boot() {
    const code = (new URLSearchParams(location.search).get('room') || '').toUpperCase();
    const session = tabStore.get('fc.session', null);
    const name = store.get('fc.name', '');
    if (code && session && session.code === code && name) {
      try {
        enterRoom(await NetTransport.join(code, name, session.token));
        return;
      } catch (error) {
        tabStore.remove('fc.session');
      }
    }
    renderHome();
  }

  boot();
})();
