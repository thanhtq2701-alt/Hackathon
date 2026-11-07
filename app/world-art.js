// Fleet Council illustrations, generated as inline SVG strings.
// The planet scene reflects the rules: buildings rise with their level, ships orbit,
// shields glow, lights dim on low energy and smoke rises after a lost raid.
(function (root) {
  let uid = 0;

  function hash(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i++) {
      h ^= text.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function seeded(seed) {
    let s = seed || 1;
    return () => {
      s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function stars(rand, count, w, h) {
    let out = '';
    for (let i = 0; i < count; i++) {
      const x = (rand() * w).toFixed(1);
      const y = (rand() * h).toFixed(1);
      const r = (rand() * 1.1 + 0.3).toFixed(2);
      const o = (rand() * 0.6 + 0.25).toFixed(2);
      out += `<circle cx="${x}" cy="${y}" r="${r}" fill="#dfe9ff" opacity="${o}"/>`;
    }
    return out;
  }

  function shipPath(x, y, s, fill, angle) {
    return `<g transform="translate(${x} ${y}) rotate(${angle || 0}) scale(${s})">
      <path d="M14 0 L-8 -7 L-4 0 L-8 7 Z" fill="${fill}" stroke="rgba(255,255,255,.55)" stroke-width="1"/>
      <path d="M-8 -3 L-15 0 L-8 3 Z" fill="#ffb347" opacity=".85"/>
    </g>`;
  }

  function planetDisk(x, y, r, hue, id) {
    return `<defs><radialGradient id="${id}" cx="35%" cy="32%" r="75%">
        <stop offset="0" stop-color="hsl(${hue} 70% 62%)"/>
        <stop offset=".6" stop-color="hsl(${hue} 55% 34%)"/>
        <stop offset="1" stop-color="hsl(${hue} 60% 12%)"/></radialGradient></defs>
      <circle cx="${x}" cy="${y}" r="${r}" fill="url(#${id})"/>
      <ellipse cx="${x}" cy="${y + r * 0.25}" rx="${r * 0.92}" ry="${r * 0.12}" fill="hsl(${hue} 60% 75%)" opacity=".12"/>
      <ellipse cx="${x}" cy="${y - r * 0.3}" rx="${r * 0.8}" ry="${r * 0.08}" fill="hsl(${hue} 60% 80%)" opacity=".1"/>`;
  }

  // ── Planet scene ─────────────────────────────────────────────────────────

  const TOWER_ORDER = ['mine', 'refinery', 'reactor', 'core', 'shipyard', 'shield', 'habitat'];
  const TOWER_COLOR = {
    core: '#e8f4ff', mine: '#ffd166', refinery: '#c3a6ff', reactor: '#7cf4ff',
    shipyard: '#9ad0ff', shield: '#6ff0c0', habitat: '#ffa8c5'
  };

  function planetScene(world) {
    const id = 'pl' + (++uid);
    const rand = seeded(hash(world.id));
    const cx = 200;
    const cy = 150;
    const r = 76;
    const energy = world.stats.energy;
    const dim = energy < 25;
    let svg = `<svg viewBox="0 0 400 260" class="planet-svg" role="img" aria-label="${world.name}: ${world.ships} ships, energy ${energy}">`;
    svg += stars(rand, 46, 400, 260);

    // Shield dome.
    const shield = world.buildings.shield.level;
    if (shield > 0) {
      svg += `<circle cx="${cx}" cy="${cy}" r="${r + 22}" fill="none" stroke="#6ff0c0" stroke-width="${1 + shield}" stroke-dasharray="6 5" opacity="${0.25 + shield * 0.15}">
        <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="40s" repeatCount="indefinite"/></circle>`;
    }
    svg += `<circle cx="${cx}" cy="${cy}" r="${r + 7}" fill="none" stroke="hsl(${world.hue} 90% 70%)" stroke-width="5" opacity=".18"/>`;
    svg += planetDisk(cx, cy, r, world.hue, id);

    // Buildings rise from the upper limb of the planet.
    TOWER_ORDER.forEach((bid, i) => {
      const level = world.buildings[bid].level;
      if (!level) return;
      const angle = (-155 + i * (130 / (TOWER_ORDER.length - 1))) * Math.PI / 180;
      const bx = cx + Math.cos(angle) * (r - 2);
      const by = cy + Math.sin(angle) * (r - 2);
      const height = 8 + level * 7;
      const deg = angle * 180 / Math.PI + 90;
      const color = TOWER_COLOR[bid];
      svg += `<g transform="translate(${bx.toFixed(1)} ${by.toFixed(1)}) rotate(${deg.toFixed(1)})">
        <rect x="-4" y="${-height}" width="8" height="${height}" rx="1.5" fill="${color}" opacity=".9"/>
        <rect x="-2.2" y="${-height - 4}" width="4.4" height="4" fill="${color}"/>
        ${dim ? '' : `<circle cx="0" cy="${-height - 6}" r="1.6" fill="#fff"><animate attributeName="opacity" values="1;.2;1" dur="${2 + i * 0.3}s" repeatCount="indefinite"/></circle>`}
      </g>`;
    });

    // City lights on the night side.
    const lights = 8 + Object.values(world.buildings).reduce((s, b) => s + b.level, 0) * 3;
    for (let i = 0; i < lights; i++) {
      const a = rand() * Math.PI * 0.9 + Math.PI * 0.05;
      const d = Math.sqrt(rand()) * (r - 10);
      const x = cx + Math.cos(a) * d * 0.95;
      const y = cy + Math.sin(a) * d * 0.9;
      svg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(rand() * 0.9 + 0.6).toFixed(2)}" fill="#ffd98a" opacity="${dim ? 0.15 : (0.55 + rand() * 0.4).toFixed(2)}"/>`;
    }
    if (dim) svg += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#000" opacity=".35"/>`;

    // Smoke after a lost raid.
    if (world.raidedLastTurn) {
      for (let i = 0; i < 4; i++) {
        const sx = cx - 30 + i * 18;
        svg += `<circle cx="${sx}" cy="${cy - 40}" r="6" fill="#55606e" opacity=".0">
          <animate attributeName="cy" values="${cy - 40};${cy - 90}" dur="${3 + i * 0.4}s" repeatCount="indefinite"/>
          <animate attributeName="r" values="4;14" dur="${3 + i * 0.4}s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values=".7;0" dur="${3 + i * 0.4}s" repeatCount="indefinite"/></circle>`;
      }
      svg += `<circle cx="${cx}" cy="${cy}" r="${r + 2}" fill="none" stroke="#ff4d6d" stroke-width="2" opacity=".5"><animate attributeName="opacity" values=".6;.1;.6" dur="1.6s" repeatCount="indefinite"/></circle>`;
    }

    // Orbiting fleet.
    const orbit = `M${cx - 160},${cy} a160,52 0 1,0 320,0 a160,52 0 1,0 -320,0`;
    svg += `<path d="${orbit}" fill="none" stroke="hsl(${world.hue} 80% 75%)" stroke-opacity=".14" stroke-dasharray="2 6"/>`;
    const shown = Math.min(world.ships, 12);
    const dur = 26;
    for (let i = 0; i < shown; i++) {
      svg += `<g>${shipPath(0, 0, 0.75, `hsl(${world.hue} 85% 72%)`, 0)}
        <animateMotion dur="${dur}s" repeatCount="indefinite" rotate="auto" begin="-${(i * dur / Math.max(shown, 1)).toFixed(2)}s" path="${orbit}"/></g>`;
    }
    svg += '</svg>';
    return svg;
  }

  // ── Building icons ───────────────────────────────────────────────────────

  function buildingIcon(id, level) {
    const c = TOWER_COLOR[id] || '#fff';
    const off = level ? 1 : 0.35;
    const s = `fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" opacity="${off}"`;
    const shapes = {
      core: `<path ${s} d="M24 5 L39 14 V32 L24 43 L9 32 V14 Z"/><path ${s} d="M24 15 L31 19 V28 L24 33 L17 28 V19 Z"/>`,
      mine: `<path ${s} d="M10 40 L24 10 L38 40"/><path ${s} d="M16 28 H32"/><circle cx="24" cy="38" r="4" fill="${c}" opacity="${off}"/>`,
      refinery: `<path ${s} d="M7 40 V24 L17 30 V24 L27 30 V12 H35 V40 Z"/><path ${s} d="M31 12 V6"/>`,
      reactor: `<ellipse ${s} cx="24" cy="24" rx="17" ry="7"/><ellipse ${s} cx="24" cy="24" rx="17" ry="7" transform="rotate(60 24 24)"/><ellipse ${s} cx="24" cy="24" rx="17" ry="7" transform="rotate(-60 24 24)"/><circle cx="24" cy="24" r="3.5" fill="${c}" opacity="${off}"/>`,
      shipyard: `<path ${s} d="M10 40 V8 H34"/><path ${s} d="M28 8 V18"/><path ${s} d="M16 30 H40 L34 38 H20 Z"/>`,
      shield: `<path ${s} d="M24 6 L39 12 V24 C39 33 32 39 24 43 C16 39 9 33 9 24 V12 Z"/><path ${s} d="M17 24 L22 29 L31 19"/>`,
      habitat: `<circle ${s} cx="24" cy="24" r="16"/><circle ${s} cx="24" cy="24" r="7"/><path ${s} d="M24 8 V17 M24 31 V40 M8 24 H17 M31 24 H40"/>`
    };
    return `<svg viewBox="0 0 48 48" class="bicon" aria-hidden="true">${shapes[id] || ''}</svg>`;
  }

  // ── Situation art ────────────────────────────────────────────────────────

  function person(x, y, color) {
    return `<circle cx="${x}" cy="${y - 16}" r="5" fill="${color}"/><path d="M${x - 7} ${y + 6} Q${x} ${y - 14} ${x + 7} ${y + 6} Z" fill="${color}"/>`;
  }

  function situationArt(art, hue) {
    const id = 'sa' + (++uid);
    const rand = seeded(hash(art + hue));
    const accent = `hsl(${hue} 85% 68%)`;
    const W = 320;
    const H = 120;
    let body = '';
    switch (art) {
      case 'ship':
        body = shipPath(150, 64, 4.2, '#3a4a66', -8) + shipPath(250, 30, 1.2, accent, 160) + `<circle cx="70" cy="40" r="2" fill="#ffb347"><animate attributeName="opacity" values="1;0;1" dur="1.5s" repeatCount="indefinite"/></circle>`;
        break;
      case 'storm':
        body = `<circle cx="60" cy="60" r="34" fill="#ffb347"/><circle cx="60" cy="60" r="46" fill="#ff7a18" opacity=".25"/>
          <path d="M95 50 Q170 10 240 55" stroke="#ffd166" stroke-width="5" fill="none" opacity=".7"/>
          <path d="M210 30 L196 62 H214 L200 96" stroke="#e8f4ff" stroke-width="3.5" fill="none"/>`;
        break;
      case 'crowd':
        for (let i = 0; i < 9; i++) body += person(30 + i * 32, 104 - (i % 2) * 6, i % 3 ? '#2b3a55' : accent);
        body += `<rect x="92" y="18" width="46" height="22" fill="${accent}"/><path d="M115 40 V70" stroke="${accent}" stroke-width="3"/><rect x="190" y="12" width="40" height="20" fill="#ff4d6d"/><path d="M210 32 V64" stroke="#ff4d6d" stroke-width="3"/>`;
        break;
      case 'pirates':
        body = `<path d="M40 20 V100 M280 20 V100" stroke="#ff4d6d" stroke-width="4" stroke-dasharray="8 6"/>` + shipPath(160, 60, 3.6, '#1a1f2b', 180) + `<circle cx="168" cy="60" r="7" fill="#ff4d6d"/>` + shipPath(70, 40, 1.1, accent, 0) + shipPath(66, 84, 1.1, accent, 0);
        break;
      case 'alien':
        for (let i = 1; i < 6; i++) body += `<circle cx="250" cy="60" r="${i * 14}" fill="none" stroke="#9cff57" stroke-opacity="${0.6 - i * 0.1}" stroke-width="2"><animate attributeName="r" values="${i * 14};${i * 14 + 14}" dur="2s" repeatCount="indefinite"/></circle>`;
        body += planetDisk(250, 60, 14, 100, id + 'p') + `<path d="M20 90 L60 70 L60 110" fill="${accent}" opacity=".6"/><path d="M60 80 L80 76" stroke="${accent}" stroke-width="2"/>`;
        break;
      case 'reactor':
        body = `<circle cx="160" cy="60" r="40" fill="${accent}" opacity=".12"/>` + `<g transform="translate(136 36)">${buildingIcon('reactor', 1).replace('class="bicon"', 'width="48" height="48"')}</g>`
          + `<path d="M60 60 H110 M210 60 H260" stroke="#ff4d6d" stroke-width="3" stroke-dasharray="4 4"><animate attributeName="stroke-dashoffset" values="0;16" dur=".6s" repeatCount="indefinite"/></path>`;
        break;
      case 'trade':
        for (let i = 0; i < 4; i++) body += shipPath(50 + i * 70, 60 + (i % 2 ? 10 : -10), 1.8, i % 2 ? '#ffd166' : accent, 0) + `<rect x="${32 + i * 70}" y="${76 + (i % 2 ? 10 : -10)}" width="12" height="9" fill="#c38b4a"/>`;
        break;
      case 'asteroid':
        body = `<path d="M110 30 L170 18 L215 40 L222 82 L176 104 L120 96 L96 64 Z" fill="#5a5048" stroke="#8d7f73" stroke-width="2"/><circle cx="150" cy="50" r="8" fill="#463e38"/><circle cx="190" cy="80" r="6" fill="#ffd166"/><circle cx="135" cy="80" r="4" fill="#ffd166"/>`
          + shipPath(260, 40, 0.9, accent, 200) + shipPath(270, 80, 0.9, accent, 160) + shipPath(60, 60, 0.9, accent, -10);
        break;
      case 'spy':
        body = `<path d="M60 60 Q160 0 260 60 Q160 120 60 60 Z" fill="none" stroke="${accent}" stroke-width="3"/><circle cx="160" cy="60" r="20" fill="${accent}" opacity=".25"/><circle cx="160" cy="60" r="8" fill="${accent}"/>
          <rect x="40" y="0" width="240" height="3" fill="#ff4d6d" opacity=".6"><animate attributeName="y" values="10;110;10" dur="3s" repeatCount="indefinite"/></rect>`;
        break;
      case 'academy':
        body = `<path d="M100 100 V50 L160 26 L220 50 V100 Z" fill="#22304a" stroke="${accent}" stroke-width="2"/><rect x="146" y="70" width="28" height="30" fill="${accent}" opacity=".5"/><path d="M160 6 L164 16 L175 16 L166 22 L170 32 L160 26 L150 32 L154 22 L145 16 L156 16 Z" fill="#ffd166"/>`;
        break;
      case 'diplomat':
        body = shipPath(90, 60, 2.6, accent, 0) + shipPath(230, 60, 2.6, '#ff9f68', 180) + `<path d="M135 60 H185" stroke="#e8f4ff" stroke-width="2" stroke-dasharray="3 5"/><circle cx="160" cy="60" r="9" fill="none" stroke="#e8f4ff" stroke-width="2"/>`;
        break;
      case 'market':
        for (let i = 0; i < 5; i++) body += `<rect x="${30 + i * 56}" y="60" width="44" height="40" fill="#1f2a3f" stroke="${accent}" stroke-opacity=".4"/><path d="M${26 + i * 56} 60 L${52 + i * 56} 44 L${78 + i * 56} 60 Z" fill="${i % 2 ? '#ff4d6d' : '#7c5cff'}" opacity=".7"/><circle cx="${52 + i * 56}" cy="30" r="5" fill="#ffd166" opacity=".8"/>`;
        break;
      case 'artifact':
        body = `<circle cx="160" cy="60" r="44" fill="none" stroke="#b9a37a" stroke-width="8" stroke-dasharray="14 8"/><circle cx="160" cy="60" r="28" fill="none" stroke="${accent}" stroke-width="2"><animate attributeName="stroke-opacity" values="1;.2;1" dur="2.5s" repeatCount="indefinite"/></circle><path d="M0 105 Q160 80 320 105 V120 H0 Z" fill="#cfe8ff" opacity=".25"/>`;
        break;
      case 'medical':
        body = `<path d="M160 14 L200 37 V83 L160 106 L120 83 V37 Z" fill="#1f2a3f" stroke="#6ff0c0" stroke-width="2"/><path d="M152 38 H168 V52 H182 V68 H168 V82 H152 V68 H138 V52 H152 Z" fill="#6ff0c0"/>`;
        break;
      case 'shipyard':
        body = `${buildingIcon('shipyard', 1).replace('class="bicon"', 'x="40" y="10" width="100" height="100"')}` + shipPath(220, 70, 3, accent, 0);
        break;
      case 'ice':
        body = `<path d="M60 70 L300 20" stroke="#bfe6ff" stroke-width="16" stroke-linecap="round" opacity=".18"/><path d="M60 70 L300 40" stroke="#bfe6ff" stroke-width="6" stroke-linecap="round" opacity=".25"/><circle cx="60" cy="70" r="14" fill="#e8f7ff"/>`
          + shipPath(160, 92, 1.4, accent, -20);
        break;
      case 'rebels':
        body = planetDisk(160, 70, 38, 30, id + 'm') + `<path d="M170 32 V2" stroke="#e8f4ff" stroke-width="2"/><path d="M170 2 H196 L190 9 L196 16 H170 Z" fill="#ff4d6d"/>`;
        break;
      case 'fleet':
        [[160, 60], [125, 38], [125, 82], [90, 18], [90, 102]].forEach(([x, y], i) => { body += shipPath(x, y, i ? 1.6 : 2.2, accent, 0); });
        body += `<path d="M190 60 H300" stroke="${accent}" stroke-opacity=".3" stroke-dasharray="4 6"/>`;
        break;
      case 'festival':
        [[80, 40, '#ff4d6d'], [160, 28, '#ffd166'], [240, 44, '#7cf4ff']].forEach(([x, y, c]) => {
          for (let i = 0; i < 10; i++) {
            const a = i * Math.PI / 5;
            body += `<path d="M${x} ${y} L${(x + Math.cos(a) * 20).toFixed(1)} ${(y + Math.sin(a) * 20).toFixed(1)}" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`;
          }
        });
        body += `<path d="M10 100 L120 80" stroke="#bfe6ff" stroke-width="5" stroke-linecap="round" opacity=".4"/><circle cx="120" cy="80" r="5" fill="#fff"/>`;
        break;
      case 'planet':
      default:
        body = planetDisk(160, 62, 34, hue + 40, id + 'g') + `<ellipse cx="160" cy="62" rx="62" ry="12" fill="none" stroke="#e8f4ff" stroke-opacity=".5" stroke-width="2"/>` + shipPath(260, 30, 1, accent, 150);
    }
    return `<svg viewBox="0 0 ${W} ${H}" class="sit-art" aria-hidden="true">
      <defs><linearGradient id="${id}bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl(${hue} 45% 14%)"/><stop offset="1" stop-color="#05070d"/></linearGradient></defs>
      <rect width="${W}" height="${H}" fill="url(#${id}bg)"/>${stars(rand, 28, W, H)}${body}</svg>`;
  }

  // ── Battle art ───────────────────────────────────────────────────────────

  function battleArt(attackerHue, defenderHue, attackerWon) {
    const id = 'ba' + (++uid);
    const rand = seeded(attackerHue * 31 + defenderHue);
    let body = stars(rand, 24, 320, 110);
    body += planetDisk(285, 55, 34, defenderHue, id);
    for (let i = 0; i < 4; i++) body += shipPath(40 + (i % 2) * 24, 22 + i * 22, 1.5, `hsl(${attackerHue} 85% 70%)`, 0);
    for (let i = 0; i < 3; i++) body += shipPath(225, 30 + i * 25, 1.3, `hsl(${defenderHue} 85% 70%)`, 180);
    for (let i = 0; i < 4; i++) {
      const y1 = 22 + i * 22;
      body += `<path d="M70 ${y1} L215 ${30 + (i % 3) * 25}" stroke="${i % 2 ? `hsl(${attackerHue} 90% 70%)` : `hsl(${defenderHue} 90% 70%)`}" stroke-width="1.6" stroke-dasharray="10 30">
        <animate attributeName="stroke-dashoffset" values="40;0" dur="${0.5 + i * 0.15}s" repeatCount="indefinite"/></path>`;
    }
    const bx = attackerWon ? 230 : 55;
    body += `<circle cx="${bx}" cy="55" r="10" fill="#ffb347" opacity=".8"><animate attributeName="r" values="4;22;4" dur="1.2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".9;0;.9" dur="1.2s" repeatCount="indefinite"/></circle>`;
    return `<svg viewBox="0 0 320 110" class="battle-art" aria-hidden="true"><rect width="320" height="110" fill="#05070d"/>${body}</svg>`;
  }

  // ── Special card glyphs ──────────────────────────────────────────────────

  function cardGlyph(type) {
    const s = 'fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
    const glyphs = {
      overclock: `<path ${s} d="M22 4 L10 22 H20 L16 36 L30 16 H20 Z"/>`,
      shield_matrix: `<path ${s} d="M20 4 L33 9 V19 C33 27 27 33 20 36 C13 33 7 27 7 19 V9 Z"/><path ${s} d="M20 10 V30 M12 20 H28"/>`,
      sabotage: `<circle ${s} cx="18" cy="22" r="11"/><path ${s} d="M26 14 L31 9 M29 6 L34 11"/>`,
      convoy: `<rect ${s} x="5" y="14" width="18" height="14"/><path ${s} d="M23 18 H30 L35 23 V28 H23"/><circle ${s} cx="11" cy="31" r="3"/><circle ${s} cx="29" cy="31" r="3"/>`,
      veto: `<circle ${s} cx="20" cy="20" r="14"/><path ${s} d="M10 10 L30 30"/>`,
      rally: `<path ${s} d="M9 36 V5"/><path ${s} d="M9 6 H31 L26 13 L31 20 H9"/>`,
      recruit: `<circle ${s} cx="15" cy="13" r="6"/><path ${s} d="M5 34 C5 25 25 25 25 34"/><path ${s} d="M31 12 V24 M25 18 H37"/>`
    };
    return `<svg viewBox="0 0 40 40" class="glyph" aria-hidden="true">${glyphs[type] || ''}</svg>`;
  }

  function shipIcon(hue) {
    return `<svg viewBox="-16 -10 32 20" class="ship-icon" aria-hidden="true">${shipPath(0, 0, 1, `hsl(${hue} 85% 70%)`, 0)}</svg>`;
  }

  const api = { planetScene, buildingIcon, situationArt, battleArt, cardGlyph, shipIcon };
  root.FleetCouncilArt = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
