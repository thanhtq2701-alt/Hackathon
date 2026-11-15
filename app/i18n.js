// The Oval language support: Vietnamese by default, English on request (remembered on this device).
// The game is written in English. With Vietnamese on, every text node and the title / placeholder /
// aria-label attributes are translated as they appear on the page: first exact phrases from the
// dictionaries (data/vi-*.js), then patterns for texts that contain numbers or names. Anything without
// a translation stays in English, so a missing entry never breaks the page.
// Blocks written in both languages carry data-guide-text="vi|en"; only the current language is shown.
// Buttons with data-set-lang="vi|en" switch the language (the page reloads in the new language).
(function (root) {
  const KEY = 'oval.lang';
  const ATTRS = ['title', 'placeholder', 'aria-label'];
  const phrases = Object.create(null);
  const patterns = []; // [RegExp, (match, t) => string]
  let lang = 'vi';
  try {
    const saved = root.document && root.localStorage && root.localStorage.getItem(KEY);
    if (saved === 'en' || saved === 'vi') lang = saved;
  } catch (error) { /* storage unavailable: keep the default */ }

  // Adds dictionary entries ({ English: Vietnamese }) and patterns ([RegExp, build]).
  function add(dict, list) {
    Object.assign(phrases, dict || {});
    (list || []).forEach(p => patterns.push(p));
  }

  // Vietnamese for one English phrase without surrounding spaces, or null when unknown.
  function lookup(text) {
    if (text in phrases) return phrases[text];
    for (const [re, build] of patterns) {
      const match = re.exec(text);
      if (match) {
        const out = build(match, t);
        if (out !== text) return out;
      }
    }
    return null;
  }

  // Translates text when Vietnamese is on; otherwise, or when unknown, returns it unchanged.
  function t(text) {
    if (lang !== 'vi' || typeof text !== 'string') return text;
    const parts = /^(\s*)([\s\S]*?)(\s*)$/.exec(text);
    if (!parts[2]) return text;
    const out = lookup(parts[2]);
    return out === null ? text : parts[1] + out + parts[3];
  }

  function translateNode(node) {
    if (node.nodeType === 3) {
      if (lang === 'vi') {
        const out = t(node.nodeValue);
        if (out !== node.nodeValue) node.nodeValue = out;
      }
      return;
    }
    if (node.nodeType !== 1 || node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;
    if (node.hasAttribute('data-guide-text')) {
      node.hidden = node.getAttribute('data-guide-text') !== lang;
      return; // written in its own language
    }
    if (node.hasAttribute('data-set-lang')) node.setAttribute('aria-pressed', String(node.getAttribute('data-set-lang') === lang));
    if (node.hasAttribute('data-no-i18n')) return;
    if (lang === 'vi') {
      ATTRS.forEach(name => {
        if (!node.hasAttribute(name)) return;
        const value = node.getAttribute(name);
        const out = t(value);
        if (out !== value) node.setAttribute(name, out);
      });
    }
    node.childNodes.forEach(translateNode);
  }

  function setLang(next) {
    if (next !== 'vi' && next !== 'en' || next === lang) return;
    try { root.localStorage.setItem(KEY, next); } catch (error) { /* not remembered */ }
    root.location.reload();
  }

  function start() {
    const doc = root.document;
    doc.documentElement.lang = lang;
    doc.addEventListener('click', event => {
      const button = event.target.closest && event.target.closest('[data-set-lang]');
      if (!button) return;
      event.preventDefault();
      event.stopPropagation();
      setLang(button.getAttribute('data-set-lang'));
    }, true);
    if (lang === 'vi') doc.title = t(doc.title);
    translateNode(doc.body);
    if (typeof root.MutationObserver === 'function') {
      new root.MutationObserver(records => records.forEach(record => {
        if (record.type === 'childList') record.addedNodes.forEach(translateNode);
        else translateNode(record.target);
      })).observe(doc.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
    }
    if (lang === 'vi' && typeof root.alert === 'function') {
      const alertOriginal = root.alert.bind(root);
      root.alert = message => alertOriginal(t(String(message)));
    }
  }

  // True when a Vietnamese version exists (exact phrase or pattern). Used by the tests.
  function has(text) {
    const parts = /^(\s*)([\s\S]*?)(\s*)$/.exec(String(text));
    return lookup(parts[2]) !== null;
  }

  const api = {
    add, t, has, setLang,
    get lang() { return lang; },
    _setLangForTests(next) { lang = next; }
  };
  root.TheOvalI18n = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else if (root.document) {
    if (root.document.readyState === 'loading') root.document.addEventListener('DOMContentLoaded', start);
    else start();
  }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
