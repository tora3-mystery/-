import fs from 'node:fs';
import vm from 'node:vm';

class ClassList {
  constructor(...names) { this.names = new Set(names); }
  add(...xs) { xs.forEach(x => this.names.add(x)); }
  remove(...xs) { xs.forEach(x => this.names.delete(x)); }
  contains(x) { return this.names.has(x); }
  toggle(x, force) {
    const on = force === undefined ? !this.contains(x) : force;
    on ? this.add(x) : this.remove(x);
    return on;
  }
}

class ElementStub {
  constructor(classes = []) {
    this.classList = new ClassList(...classes);
    this.children = [];
    this.textContent = '';
    this.innerHTML = '';
    this.open = false;
    this.disabled = false;
    this.style = {};
  }
  replaceChildren(...xs) { this.children = xs; }
  append(...xs) { this.children.push(...xs); }
  appendChild(x) { this.children.push(x); }
  setAttribute() {}
  focus() {}
}

const elements = new Map();
function element(id) {
  if (!elements.has(id)) {
    const hidden = ['overlay', 'finalChoice', 'ending'].includes(id) ? ['hidden'] : [];
    if (id === 'game') hidden.push('gameonly');
    elements.set(id, new ElementStub(hidden));
  }
  return elements.get(id);
}

const storage = new Map();
const document = {
  body: new ElementStub(),
  getElementById: element,
  createElement: () => new ElementStub(),
  addEventListener() {},
};
const context = {
  document,
  localStorage: { getItem: k => storage.get(k) ?? null, setItem: (k, v) => storage.set(k, v) },
  confirm: () => true,
  scrollTo() {},
  console,
  JSON,
  Math,
  Array,
  Set,
};
context.window = context;

const html = fs.readFileSync(new URL('../f1/index.html', import.meta.url), 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
if (!source) throw new Error('F1 script not found');
vm.createContext(context);
vm.runInContext(source, context, { filename: 'f1/index.html' });
const api = context.__F1_DEBUG__;

const oddIds = new Set(['audit', 'camera0', 'open0']);
const policies = {
  improvement: ['ticket', 'vibration', 'display', 'quiet', 'forecast', 'receive', 'shift', 'limit', 'compact', 'rest', 'lane', 'discount'],
  sales: ['discount', 'sampling', 'sale', 'gourmet', 'night', 'delivery', 'early', 'shift', 'rest'],
  balanced: ['shift', 'discount', 'ticket', 'farmer', 'display', 'vibration', 'quiet', 'receive', 'rest'],
};

function pick(ids, preference) {
  return preference.find(id => ids.includes(id)) ?? ids.find(id => !oddIds.has(id)) ?? ids[0];
}

function run(name, preference, odd = false) {
  api.restart();
  const choices = [];
  for (let day = 1; day <= 7; day++) {
    const ids = api.availableIds();
    if (ids.length !== 6) throw new Error(`${name}: DAY ${day} choices=${ids.length}`);
    const forced = odd ? ['audit', 'camera0', 'open0'][day - 1] : null;
    const choice = forced && ids.includes(forced) ? forced : pick(ids, preference);
    choices.push(choice);
    api.play(choice);
    api.advance();
  }
  if (odd) api.finalDecision('stop');
  return { name, choices, state: api.getState() };
}

const results = [
  run('improvement', policies.improvement),
  run('sales', policies.sales),
  run('balanced', policies.balanced),
  run('odd-stop', policies.balanced, true),
];

api.restart();
for (let day = 1; day <= 7; day++) {
  const ids = api.availableIds();
  const forced = ['audit', 'camera0', 'open0'][day - 1];
  api.play(forced && ids.includes(forced) ? forced : pick(ids, policies.balanced));
  api.advance();
}
api.finalDecision('customer');
const hidden = api.getState();
if (hidden.ending !== 'odd_hidden' || hidden.afterSales !== 0 || hidden.remaining !== 0 || hidden.permit !== '許可') {
  throw new Error('hidden ending did not clear anomaly metrics');
}

api.restart();
for (let day = 1; day <= 7; day++) {
  const ids = api.availableIds();
  api.play(day === 1 ? 'audit' : pick(ids, policies.balanced));
  api.advance();
}
api.finalDecision('customer');
const missing = api.getState();
if (missing.ending !== 'odd_missing') throw new Error('incomplete evidence ending is unreachable');

api.restart();
for (let day = 1; day <= 7; day++) {
  const ids = api.availableIds();
  const forced = ['audit', 'camera0', 'open0'][day - 1];
  api.play(forced && ids.includes(forced) ? forced : pick(ids, policies.balanced));
  api.advance();
}
api.finalDecision('day8');
const day8 = api.getState();
if (day8.ending !== 'odd_day8' || day8.day !== 8) throw new Error('day 8 ending is unreachable');

for (const { name, choices, state } of results) {
  console.log(JSON.stringify({
    scenario: name,
    choices,
    ending: state.ending,
    cash: state.cash,
    vals: state.vals,
    afterSales: state.afterSales,
    remaining: state.remaining,
  }));
}
console.log(JSON.stringify({ scenario: 'odd-hidden', ending: hidden.ending, cash: hidden.cash, afterSales: hidden.afterSales, remaining: hidden.remaining, permit: hidden.permit }));
console.log(JSON.stringify({ scenario: 'odd-missing', ending: missing.ending, clues: missing.clues }));
console.log(JSON.stringify({ scenario: 'odd-day8', ending: day8.ending, day: day8.day, cash: day8.cash }));
