// How to play guides in Vietnamese and English (both modes). A guide is an element with class "guide"
// holding buttons [data-guide-lang="vi|en"] and blocks [data-guide-text="vi|en"]; Vietnamese shows first.
// Uses one delegated listener, so guides rendered later (Fleet Council's home page) work too. Nothing is stored.
(function () {
  document.addEventListener('click', function (event) {
    const button = event.target.closest('[data-guide-lang]');
    const guide = button && button.closest('.guide');
    if (!guide) return;
    event.preventDefault();
    const lang = button.getAttribute('data-guide-lang');
    guide.querySelectorAll('[data-guide-lang]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b === button));
    });
    guide.querySelectorAll('[data-guide-text]').forEach(function (block) {
      block.hidden = block.getAttribute('data-guide-text') !== lang;
    });
  });
})();
