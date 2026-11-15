// The Oval auto-play simulation: runs the real game scripts (content.js, game-core.js, client.js)
// in a Node vm with a stub DOM and a seeded Math.random, plays whole runs with a simple strategy,
// and prints how the runs ended. Choices are made by clicking a card twice (reveal, confirm),
// exactly like a player, and options greyed out by the low-Loyalty Party lock are skipped.
//
//   node tools/sim/oval.js                         every strategy, 100 runs each
//   node tools/sim/oval.js --games 500 --strategy random --seed 7
//
// Strategies: random (any option), balanced (keep every bar near the middle),
// approval (always take the biggest Approval gain).
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..', '..');
const SCRIPTS = ['data/content.js', 'app/game-core.js', 'app/client.js'];
const MAX_CHOICES = 500; // a full run is about 40 cards plus arc acts

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// An element that accepts any property or method call and remembers what was written to it.
function stubElement() {
  const el = {
    id: '',
    className: '',
    style: { setProperty() {} },
    classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
    innerHTML: '',
    textContent: '',
    querySelector: () => null,
    querySelectorAll: () => []
  };
  return new Proxy(el, {
    get(target, key) {
      if (key in target || typeof key !== 'string') return target[key];
      return () => undefined;
    }
  });
}

// Loads the game into a fresh vm context. The browser scripts declare their functions as globals,
// so the harness can wrap showEndScreen to read the ending the player would see.
function loadGame() {
  const elements = {};
  const created = [];
  const timers = [];
  let clock = 0;
  const document = stubElement();
  // The only DOM query the rules depend on: the option cards of the current turn.
  const choiceCards = () => created.filter(el => context.cardFlipStates && context.cardFlipStates[el.id]);
  Object.assign(document, {
    body: stubElement(),
    documentElement: stubElement(),
    getElementById: id => elements[id] || created.find(el => el.id === id) || (elements[id] = stubElement()),
    createElement: () => { const el = stubElement(); created.push(el); return el; },
    querySelectorAll: selector => (selector === '.choice-card' ? choiceCards() : [])
  });
  const context = {
    console,
    document,
    alert() {},
    setTimeout(fn, delay) { timers.push({ at: clock + (delay || 0), fn }); return timers.length; },
    clearTimeout() {},
    getComputedStyle: () => ({ display: 'none' }),
    scrollTo() {},
    open() {},
    TheOvalAudio: { updateAtmosphere() {}, play() {}, stop() {}, toggle() {}, setTrack() {} }
  };
  context.window = context;
  vm.createContext(context);
  // Card ids use Date.now(); the virtual clock keeps them unique per turn and the run reproducible.
  vm.runInContext('Date', context).now = () => clock;
  SCRIPTS.forEach(file => vm.runInContext(fs.readFileSync(path.join(ROOT, file), 'utf8'), context, { filename: file }));

  const game = { context, ending: null };
  // Options the player can click this turn: one per rendered card, minus cards the Party lock disabled.
  game.options = () => choiceCards()
    .filter(el => el.style.pointerEvents !== 'none')
    .map(el => ({ el, choice: context.cardFlipStates[el.id].choice }));
  game.click = el => { context.onCardClick(el, el.id); game.flush(); };
  const showEndScreen = context.showEndScreen;
  context.showEndScreen = function (choiceOverride) {
    showEndScreen(choiceOverride);
    const match = /class="end-title">([^<]*)</.exec(elements['end-screen'].innerHTML);
    game.ending = match ? match[1].trim() : '?';
  };
  game.flush = () => {
    while (timers.length) {
      timers.sort((a, b) => a.at - b.at);
      const timer = timers.shift();
      clock = timer.at;
      timer.fn();
    }
  };
  game.state = () => vm.runInContext('gs', context);
  return game;
}

// Bars after taking a choice, using the game's own delta rules.
function barsAfter(game, choice) {
  const core = game.context.TheOvalCore;
  const gs = game.state();
  const copy = {
    bars: Object.assign({}, gs.bars), energy: gs.energy, activeArc: gs.activeArc, activeArcActIndex: gs.activeArcActIndex,
    empathy: 0, integrity: 0, courage: 0, ideologyScore: 0
  };
  core.applyDeltas(copy, core.scaleChoice(choice));
  return copy;
}

const STRATEGIES = {
  random: (game, choices, rng) => choices[Math.floor(rng() * choices.length)],
  balanced: (game, choices, rng) => best(choices, rng, choice => {
    const after = barsAfter(game, choice);
    const spread = Object.values(after.bars).reduce((sum, v) => sum + (v - 52.5) * (v - 52.5), 0);
    return -spread - (after.energy < 15 ? (15 - after.energy) * 50 : 0);
  }),
  approval: (game, choices, rng) => best(choices, rng, choice => game.context.TheOvalCore.scaleChoice(choice).approval || 0)
};

// Highest-scoring choice; ties are broken at random.
function best(choices, rng, score) {
  let top = -Infinity;
  let picks = [];
  choices.forEach(choice => {
    const value = score(choice);
    if (value > top) { top = value; picks = [choice]; } else if (value === top) picks.push(choice);
  });
  return picks[Math.floor(rng() * picks.length)];
}

function playRun(strategy, seed) {
  const game = loadGame();
  const rng = mulberry32(seed);
  vm.runInContext('Math', game.context).random = mulberry32(seed ^ 0x5bd1e995);
  game.context.startGame('normal');
  game.flush();
  for (let n = 0; !game.ending; n++) {
    const options = game.options();
    if (n > MAX_CHOICES || !options.length) throw new Error('Run stalled (seed ' + seed + ', turn ' + game.state().turn + ')');
    const choice = STRATEGIES[strategy](game, options.map(o => o.choice), rng);
    const card = options.find(o => o.choice === choice).el;
    game.click(card); // reveal
    game.click(card); // confirm
    game.context.continueAfterChoice();
    game.flush();
  }
  const gs = game.state();
  return {
    ending: game.ending, turn: gs.turn, arcs: gs.arcsTriggered.slice(), partyRevolt: gs.lowLoyaltyTurns >= 4,
    bars: Object.assign({}, gs.bars, { energy: gs.energy })
  };
}

function pct(part, whole) {
  return (100 * part / whole).toFixed(1) + '%';
}

function runStrategy(strategy, games, seed) {
  const endings = {};
  const arcs = {};
  let early = 0;
  let turnSum = 0;
  let revolts = 0;
  for (let i = 0; i < games; i++) {
    const run = playRun(strategy, seed + i);
    endings[run.ending] = (endings[run.ending] || 0) + 1;
    run.arcs.forEach(id => { arcs[id] = (arcs[id] || 0) + 1; });
    if (run.turn < 40) early++;
    if (run.partyRevolt) revolts++;
    turnSum += run.turn;
  }
  console.log(`\n== ${strategy}: ${games} runs, seed ${seed} ==`);
  console.log(`  Endings seen: ${Object.keys(endings).length}`);
  Object.entries(endings).sort((a, b) => b[1] - a[1])
    .forEach(([title, count]) => console.log(`    ${title.padEnd(24)} ${pct(count, games).padStart(6)}`));
  console.log(`  Arcs triggered: ${Object.entries(arcs).sort((a, b) => b[1] - a[1]).map(([id, c]) => id + ' ' + pct(c, games)).join(', ') || 'none'}`);
  console.log(`  Ended before turn 40: ${pct(early, games)} (average last turn ${(turnSum / games).toFixed(1)})`);
  console.log(`  Removed by a party revolt: ${pct(revolts, games)}`);
}

function main() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[i + 1];
  const games = args.games ? Number(args.games) : 100;
  const seed = args.seed ? Number(args.seed) : 1;
  const names = args.strategy ? [args.strategy] : Object.keys(STRATEGIES);
  names.forEach(name => {
    if (!STRATEGIES[name]) throw new Error('Unknown strategy ' + name + ' (use ' + Object.keys(STRATEGIES).join(', ') + ')');
  });
  const started = Date.now();
  names.forEach(name => runStrategy(name, games, seed));
  console.log(`\nDone in ${((Date.now() - started) / 1000).toFixed(1)} s.`);
}

if (require.main === module) main();
module.exports = { playRun, STRATEGIES };
