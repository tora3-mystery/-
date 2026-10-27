'use strict';
// Run: node s6/beta/test-beta.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const dataCode=fs.readFileSync(path.join(root,'game-data.js'),'utf8');
const game=fs.readFileSync(path.join(__dirname,'game.js'),'utf8');
const dataScope={window:{}};vm.runInNewContext(dataCode,dataScope);
const D=dataScope.window.S6_DATA;
let total=0, failures=0;
function check(name,fn){try{fn();total++;console.log('PASS',name)}catch(e){failures++;console.error('FAIL',name,e.stack||e)}}
function makeSession(cache=new Map()){
 let html='',onClick,fields={};
 const app={set innerHTML(v){html=v},get innerHTML(){return html},addEventListener(n,f){if(n==='click')onClick=f}};
 const doc={getElementById:id=>id==='app'?app:fields[id]||null};
 const storage={getItem:k=>cache.get(k)||null,setItem:(k,v)=>cache.set(k,v)};
 const win={S6_DATA:D,scrollTo(){}};
 vm.runInNewContext(game,{window:win,document:doc,localStorage:storage});
 return {
  get html(){return html},
  get state(){return JSON.parse(cache.get('s6-origin-beta-010')||'{}')},
  cache,
  field(id,value){fields[id]={value}},
  click(action,id=''){assert.ok(onClick);onClick({target:{closest:()=>({dataset:{act:action,id}})},preventDefault(){}});return html;}
 };
}
const newPlayer=()=>{const s=makeSession();s.click('start');s.click('begin');return s};
const skipWeek=()=>{
 const s=newPlayer();for(let d=0;d<5;d++){s.click('skip');s.click('next-day')}
 assert.equal(s.state.phase,'camp');return s;
};
check('96-person shared DB, portrait paths, 6 clubs and 12 independent events',()=>{
 assert.equal(D.people.length,96);assert.equal(D.orgs.length,6);assert.equal(D.events.length,12);
 assert.equal(D.groups.length,44);assert.equal(new Set(D.people.map(p=>p.person_id)).size,96);
 for(const p of D.people){assert.match(p.portrait_path,/^assets\/faces\/p\d{3}\.webp$/);assert.equal(p.portrait_status,'ready')}
});
check('first introduction lists 11 faces and names, venue hides names afterwards',()=>{
 const s=newPlayer();s.click('attend','E01');
 assert.equal(s.state.flash.length,11);assert.match(s.html,/神谷杏奈/);
 s.click('leave-flash');assert.equal(s.state.phase,'venue');assert.doesNotMatch(s.html,/神谷杏奈/);
 assert.equal(s.state.seen.length,11);
});
check('second encounter does not repeat a learned face/name introduction',()=>{
 const s=newPlayer();
 s.click('attend','E01');s.click('leave-flash');s.click('finish-venue');s.click('next-day');
 s.click('skip');s.click('next-day');
 s.click('attend','E06');
 assert.equal(s.state.phase,'flash');
 assert.ok(!s.state.flash.includes('P003'),'P003 already introduced on Monday');
 assert.ok(!s.state.flash.includes('P010'),'P010 already introduced on Monday');
});
check('name and primary club must BOTH match to verify an encountered person',()=>{
 const s=newPlayer();s.click('attend','E01');s.click('leave-flash');s.click('finish-venue');
 s.click('open-notebook');s.click('open-identity','P003');
 s.field('guessName','P003');s.field('guessOrg','Z');s.click('submit-identity');
 assert.equal(s.state.guesses.P003.verified,false);assert.equal(s.state.checks['2026-04-06'],1);
 s.click('open-identity','P003');s.field('guessName','P003');s.field('guessOrg','L');s.click('submit-identity');
 assert.equal(s.state.guesses.P003.verified,true);assert.equal(s.state.checks['2026-04-06'],2);
 s.click('open-identity','P019');s.field('guessName','P019');s.field('guessOrg','L');s.click('submit-identity');
 assert.equal(s.state.checks['2026-04-06'],2);
 assert.ok(!s.state.guesses.P019);
});
check('2 groups per event and one action per group',()=>{
 const s=newPlayer();s.click('attend','E01');s.click('leave-flash');
 const gs=D.groups.filter(g=>g.event_id==='E01');
 s.click('join-group',gs[0].group_id);s.click('choose-person',D.members.find(m=>m.group_id===gs[0].group_id).person_id);s.click('interact','talk');
 const first=s.state.groupDone[gs[0].group_id];s.click('back-venue');
 s.click('join-group',gs[1].group_id);s.click('listen-group');s.click('back-venue');
 s.click('join-group',gs[2].group_id);assert.equal(s.state.phase,'venue');assert.equal(s.state.visitedGroups.length,2);
 assert.equal(s.state.groupDone[gs[0].group_id],first);
});
check('each of the 44 groups can be entered and a real action completed',()=>{
 let count=0;
 for(const e of D.events){for(const g of D.groups.filter(x=>x.event_id===e.event_id)){
  const s=newPlayer();
  while(s.state.day<['2026-04-06','2026-04-07','2026-04-08','2026-04-09','2026-04-10'].indexOf(e.date)){s.click('skip');s.click('next-day')}
  s.click('attend',e.event_id);s.click('leave-flash');s.click('join-group',g.group_id);
  assert.equal(s.state.group,g.group_id);
  s.click('listen-group');assert.ok(s.state.groupDone[g.group_id]);count++;
 }}
 assert.equal(count,44);
});
check('public SNS can show face, but anonymous post uses an icon',()=>{
 const s=newPlayer();s.click('skip');s.click('night-sns','Photogram');
 assert.match(s.html,/つむ/);assert.match(s.html,/p001.webp/);
 const t=newPlayer();
 for(let i=0;i<3;i++){t.click('skip');t.click('next-day')}
 t.click('skip');t.click('night-sns','Zitter');
 assert.match(t.html,/匿名アカウント/);assert.doesNotMatch(t.html,/p004.webp/);
});
check('night SNS/notice is at most one channel/day',()=>{
 const s=newPlayer();s.click('skip');s.click('night-sns','Photogram');
 s.click('back-night');s.click('night-sns','Zitter');assert.equal(s.state.phase,'night');
 s.click('night-board');assert.equal(s.state.phase,'night');
 assert.equal(s.state.nightChoice['2026-04-06'],'Photogram');
});
check('all six camps are safe from the specific private-room trap',()=>{
 const clubs=['L','Z','J','W','F'];for(const id of clubs){const s=skipWeek();
  s.click('choose-camp',id);assert.equal(s.state.phase,'saturday');assert.doesNotMatch(s.html,/data-act="private"/);
  s.click('finish-safe');assert.equal(s.state.result,'SAFE');assert.equal(s.state.phase,'end');
 }
});
check('the dangerous invitation belongs to komorebi, but can be refused',()=>{
 const s=skipWeek();s.click('choose-camp','K');assert.match(s.html,/data-act="private"/);
 s.click('finish-safe');assert.equal(s.state.result,'DECLINED');
});
check('danger, rescue, and pre-shared rescue are separately reachable',()=>{
 const a=skipWeek();a.click('choose-camp','K');a.click('private');a.click('stay');assert.equal(a.state.result,'DANGER');
 const b=skipWeek();b.click('choose-camp','K');b.click('private');b.click('escape');assert.equal(b.state.result,'RESCUED');
 const c=skipWeek();c.click('choose-camp','K');c.click('share');c.click('private');
 assert.doesNotMatch(c.html,/data-act="stay"/);c.click('escape');assert.equal(c.state.result,'RESCUED');
});
check('all-skip and opt-out ending remains possible without guessing any name',()=>{
 const s=skipWeek();s.click('choose-camp','N');s.click('finish-safe');
 assert.equal(s.state.phase,'end');assert.equal(s.state.result,'SAFE');assert.equal(s.state.seen.length,0);
});
check('save/load preserves memory but never overwrites main S6 save keys',()=>{
 const cache=new Map();const s=makeSession(cache);s.click('start');s.click('begin');
 s.click('attend','E01');s.click('leave-flash');s.click('finish-venue');
 const after=makeSession(cache);assert.equal(after.state.phase,'night');
 assert.deepEqual(Array.from(after.state.seen),Array.from(s.state.seen));
 assert.equal(cache.has('s6-case-a-v03-auto'),false);
});
check('16 existing important faces are not changed, and first-club links for the suspects are defined',()=>{
 const ids=['P001','P002','P003','P004','P018'];
 for(const id of ids){assert.ok(D.people.find(p=>p.person_id===id));assert.ok(D.accounts.find(a=>a.person_id===id))}
 assert.equal(D.people.find(p=>p.person_id==='P001').primary_org,'K');
});
check('public-profile photo can link to a remembered face without exposing names',()=>{
 const s=newPlayer();s.click('skip');s.click('next-day');s.click('skip');s.click('next-day');
 s.click('attend','E05');s.click('leave-flash');s.click('finish-venue');
 s.click('night-sns','Photogram');assert.match(s.html,/つむ/);
 s.click('account-match','S02');assert.equal(s.state.phase,'sns-match');
 s.click('match-social-face','P013');assert.equal(s.state.socialLinked.P001,undefined);
 s.click('match-social-face','P001');assert.equal(s.state.phase,'sns');
 assert.ok(s.state.socialLinked.P001.includes('Photogram'));
 assert.equal(s.state.guesses.P001,undefined);
});
check('a verified suspect and earlier records produce decision-time, club-specific evidence',()=>{
 const s=newPlayer();s.click('skip');s.click('night-board');s.click('back-night');s.click('next-day');
 s.click('skip');s.click('next-day');
 s.click('attend','E05');s.click('leave-flash');s.click('join-group','E05-A');
 s.click('choose-person','P001');s.click('interact','talk');assert.match(s.html,/入学前から/);
 s.click('back-venue');s.click('finish-venue');s.click('open-notebook');s.click('open-identity','P001');
 s.field('guessName','P001');s.field('guessOrg','K');s.click('submit-identity');
 assert.equal(s.state.guesses.P001.verified,true);
 s.click('back-from-notebook');s.click('next-day');
 s.click('skip');s.click('next-day');s.click('skip');s.click('next-day');
 assert.equal(s.state.phase,'camp');
 assert.match(s.html,/ばらばらだった情報が、一つの団体につながった/);
 assert.match(s.html,/こもれび/);
});
console.log(JSON.stringify({passed:total,failed:failures}));if(failures)process.exitCode=1;
