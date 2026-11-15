// First-game tips for both modes: short hints shown once, at the moment they matter, one at a time.
// The page calls TheOvalTips.show(id); a tip already seen (or all tips, once turned off) is skipped.
// What was seen is remembered in this browser (oval.tips); [data-tips-reset] turns the tips back on.
// Tip texts are English; app/i18n.js shows them in Vietnamese like the rest of the page.
(function (root) {
  const KEY = 'oval.tips';
  const TIPS = {
    // Solo story
    'solo-bars': 'These five bars must stay in balance; a bar flashing red is in danger. If the Energy Core reaches 0, the station collapses and the run ends.',
    'solo-card': 'Each turn brings one card. Tap an option to reveal it, then tap it again to confirm your choice.',
    'solo-result': 'The card now shows what actually changed. Press Continue for the next turn.',
    'solo-crisis': 'A warning gives you one turn to recover. Fix that bar now, or the penalty hits next turn.',
    'solo-arc': 'A story arc has started: its acts replace the normal cards until it ends, and its choices weigh heavily.',
    // Fleet Council
    'fleet-lobby': 'Pick the number of worlds, turns and vote time, add bots or share the invite link, then launch the match.',
    'fleet-vote': 'Every pilot votes for one card; the most votes wins. You can change your vote until the timer runs out.',
    'fleet-harvest': 'Your buildings filled their storage. Press Harvest to move it into the treasury and earn EXP.',
    'fleet-build': 'Building and ordering ships spend the shared treasury, so they are crew plans: propose one, then the crew votes yes or no.',
    'fleet-report': 'The report shows what your crew chose and what changed this turn. Press Ready when you are done.',
    'fleet-raid': 'From turn 2 you can propose a raid on a rival in the Galaxy tab. Check the raid estimate before you attack.'
  };
  const queue = [];
  let showing = null;
  // Translated right away (no English flash before the page translator runs).
  const tr = text => (root.TheOvalI18n ? root.TheOvalI18n.t(text) : text);

  function load() {
    try { return JSON.parse(root.localStorage.getItem(KEY)) || { seen: [], off: false }; } catch (error) { return { seen: [], off: false }; }
  }
  function save(data) {
    try { root.localStorage.setItem(KEY, JSON.stringify(data)); } catch (error) { /* not remembered */ }
  }

  function addStyle(doc) {
    if (doc.getElementById('tips-style')) return;
    const style = doc.createElement('style');
    style.id = 'tips-style';
    style.textContent = `
      .tip-panel { position: fixed; left: 50%; bottom: 16px; transform: translateX(-50%); z-index: 9999;
        width: min(440px, calc(100vw - 32px)); padding: 14px 16px; border-radius: 12px;
        background: rgba(8, 14, 24, 0.96); border: 1px solid var(--accent, var(--gold, #7cf4ff));
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.55); color: var(--text, #e6eefb);
        font: 14px/1.5 system-ui, -apple-system, 'Segoe UI', sans-serif; }
      .tip-panel .tip-label { display: block; font-size: 11px; letter-spacing: .1em; text-transform: uppercase;
        color: var(--accent, var(--gold, #7cf4ff)); margin-bottom: 4px; }
      .tip-panel .tip-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 10px; }
      .tip-panel button { min-height: 32px; padding: 4px 12px; border-radius: 8px; cursor: pointer; font: inherit; font-size: 13px;
        border: 1px solid var(--accent, var(--gold, #7cf4ff)); background: transparent; color: var(--text, #e6eefb); }
      .tip-panel button.tip-ok { background: var(--accent, var(--gold, #7cf4ff)); color: #04161a; font-weight: 600; }`;
    doc.head.appendChild(style);
  }

  function render(id) {
    const doc = root.document;
    addStyle(doc);
    showing = id;
    const panel = doc.createElement('div');
    panel.className = 'tip-panel';
    panel.setAttribute('role', 'status');
    panel.innerHTML = `<span class="tip-label">First game tip</span><p></p>
      <div class="tip-actions"><button type="button" class="tip-off">Turn off tips</button><button type="button" class="tip-ok">Got it</button></div>`;
    panel.querySelector('p').textContent = tr(TIPS[id] || id);
    panel.querySelectorAll('.tip-label, button').forEach(el => { el.textContent = tr(el.textContent); });
    panel.querySelector('.tip-ok').onclick = () => close(panel, false);
    panel.querySelector('.tip-off').onclick = () => close(panel, true);
    doc.body.appendChild(panel);
  }

  function close(panel, turnOff) {
    const data = load();
    if (showing && !data.seen.includes(showing)) data.seen.push(showing);
    if (turnOff) data.off = true;
    save(data);
    panel.remove();
    showing = null;
    if (turnOff) queue.length = 0;
    else if (queue.length) render(queue.shift());
  }

  // Shows a tip once (queued behind the one on screen). Does nothing outside a browser page.
  function show(id) {
    if (!root.document || !root.document.body || !TIPS[id]) return;
    const data = load();
    if (data.off || data.seen.includes(id) || showing === id || queue.includes(id)) return;
    if (showing) queue.push(id);
    else render(id);
  }

  function reset() {
    save({ seen: [], off: false });
  }

  if (root.document) {
    root.document.addEventListener('click', event => {
      const button = event.target.closest && event.target.closest('[data-tips-reset]');
      if (!button) return;
      event.preventDefault();
      reset();
      button.textContent = tr('Tips are on again');
    });
  }

  const api = { show, reset, TIPS };
  root.TheOvalTips = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
