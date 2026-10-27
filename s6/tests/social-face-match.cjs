'use strict';
// Run: node s6/tests/social-face-match.cjs
// Deterministic DOM/storage simulation; no image assets, browser, or npm dependency needed.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const dataCode = fs.readFileSync(path.join(root, 'game-data.js'), 'utf8');
const gameCode = fs.readFileSync(path.join(root, 'game.js'), 'utf8');
const dataContext = {window: {}};
vm.runInNewContext(dataCode, dataContext, {filename: 'game-data.js'});
const D = dataContext.window.S6_DATA;
const total = {passed: 0};
const test = (name, fn) => {
  try {fn();total.passed++;console.log('PASS', name)}
  catch(err){console.error('FAIL', name, err);process.exitCode = 1}
};
const memory = () => new Map();
function createSession(storage = memory()) {
  let clickHandler = null, html = '';
  const app = {
    set innerHTML(x) {html = x},
    get innerHTML() {return html},
    addEventListener(name, fn) {if(name === 'click') clickHandler = fn}
  };
  const document = {getElementById: id => id === 'app' ? app : null};
  const localStorage = {
    getItem: key => storage.get(key) || null,
    setItem: (key, val) => storage.set(key, String(val))
  };
  const window = {S6_DATA: D, scrollTo() {}};
  vm.runInNewContext(gameCode, {window,document,localStorage,alert(){}}, {filename: 'game.js'});
  return {
    get html(){return html},
    get save(){return JSON.parse(storage.get('s6-case-a-v03-auto') || '{}')},
    storage,
    click(act, args = {}) {
      assert.ok(clickHandler, 'click listener is initialized');
      clickHandler({
        target: {closest: () => ({dataset: {act, ...args}})},
        preventDefault() {}
      });
      return html;
    }
  };
}
function toMonday() {
  const h = createSession();
  h.click('start');h.click('campus');h.click('intro');h.click('begin');
  return h;
}
test('235 SNS profiles have explicit face/icon avatars', () => {
  assert.equal(D.accounts.length,235);
  for(const a of D.accounts)assert.ok(['face','icon'].includes(a.avatar_kind),a.account_id);
  assert.ok(D.accounts.some(a=>a.platform==='Photogram'&&a.avatar_kind==='face'));
  assert.ok(D.accounts.some(a=>a.platform==='Zitter'&&a.avatar_kind==='face'));
});
test('public face post can match a previously seen student without revealing a name', () => {
  const h=toMonday();
  h.click('event',{eid:'E01'});h.click('finish-venue');
  const first=h.click('browse-sns',{platform:'Photogram'});
  assert.match(first,/data-postid="S20"/);
  assert.doesNotMatch(first,/data-postid="S01"/); // private post
  h.click('start-sns-match',{postid:'S20'});
  assert.match(h.html,/data-pid="P017"/);
  h.click('match-sns-person',{pid:'P003'});
  assert.match(h.html,/別の人/);
  assert.equal(h.save.person.P017?.socialMatches?.length||0,0);
  h.click('match-sns-person',{pid:'P017'});
  assert.match(h.html,/まだ本名は分からない/);
  assert.deepEqual(Array.from(h.save.person.P017.socialMatches),['Photogram']);
  assert.equal(h.save.person.P017.introduced,false);
  assert.equal(h.save.person.P017.identity_confirmed,false);
  h.click('notebook');h.click('open-person',{pid:'P017'});
  assert.match(h.html,/SNSで見つけた顔/);
  assert.match(h.html,/名前は未確認/);
  const loaded=createSession(h.storage);
  loaded.click('load');
  assert.deepEqual(Array.from(loaded.save.person.P017.socialMatches),['Photogram']);
});
test('an icon-only Photogram post never offers a face match', () => {
  const h=toMonday();h.click('event',{eid:'E02'});h.click('finish-venue');
  const screen=h.click('browse-sns',{platform:'Photogram'});
  assert.match(screen,/音だけ先に公開しています/); // P040
  assert.doesNotMatch(screen,/data-postid="S04"/);
});
test('a face match becomes a full identification only once the name is learned', () => {
  const h=toMonday();h.click('event',{eid:'E01'});h.click('finish-venue');
  h.click('browse-sns',{platform:'Photogram'});
  h.click('start-sns-match',{postid:'S20'});
  h.click('match-sns-person',{pid:'P017'});
  const state=h.save;state.person.P017.introduced=true;
  h.storage.set('s6-case-a-v03-auto',JSON.stringify(state));
  h.click('load');h.click('notebook');h.click('open-person',{pid:'P017'});
  assert.match(h.html,/斉藤咲/);
  assert.match(h.html,/本人の名前を確認済み/);
});
test('unseen faces cannot be matched just by browsing SNS', () => {
  const h=toMonday();h.click('skip-day');
  const screen=h.click('browse-sns',{platform:'Photogram'});
  assert.doesNotMatch(screen,/data-postid="S20"/);
  h.click('start-sns-match',{postid:'S20'});
  assert.equal(h.save.phase,'sns');
});
test('the owner of an anonymous post never receives a face avatar', () => {
  const h=toMonday();
  const s=h.save;
  s.phase='sns';s.day=4;s.platform='Zitter';s.socialDate='2026-04-11';s.viewedPosts=['S10','S19'];
  h.storage.set('s6-case-a-v03-auto',JSON.stringify(s));
  h.click('load');
  assert.match(h.html,/匿名ユーザー/);
  assert.match(h.html,/消したはずの下書きが残る/);
  assert.doesNotMatch(h.html,/data-postid="S19"/);
  assert.doesNotMatch(h.html,/assets\/faces\/p004.webp/);
});
test('old schema-3 saves without socialMatches remain readable', () => {
  const h=toMonday();
  const s=h.save;
  s.phase='notebook';
  s.person.P017={seen:true,met:false,introduced:false};
  h.storage.set('s6-case-a-v03-auto',JSON.stringify(s));
  h.click('load');
  h.click('open-person',{pid:'P017'});
  assert.match(h.html,/人物手帳|NOTEBOOK/);
  assert.deepEqual(Array.from(h.save.person.P017.socialMatches),[]);
});
test('TINE face avatars require genuine contact access', () => {
  const h=toMonday();
  const s=h.save;
  s.phase='night';
  s.person.P013={seen:true,met:true,introduced:true,contacts:['TINE'],pendingContacts:[],socialMatches:[]};
  h.storage.set('s6-case-a-v03-auto',JSON.stringify(s));
  h.click('load');
  assert.match(h.html,/assets\/faces\/p013.webp/);
});
console.log(JSON.stringify({passed:total.passed,failed:process.exitCode?1:0,version:D.version}));
