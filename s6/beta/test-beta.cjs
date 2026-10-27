'use strict';
// Run: node s6/beta/test-beta.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const dataCode=fs.readFileSync(path.join(root,'game-data.js'),'utf8');
const profileCode=fs.readFileSync(path.join(__dirname,'character-profiles.js'),'utf8');
const socialCode=fs.readFileSync(path.join(__dirname,'social-personas.js'),'utf8');
const dialogueCode=fs.readFileSync(path.join(__dirname,'dialogue-engine.js'),'utf8');
const game=fs.readFileSync(path.join(__dirname,'game.js'),'utf8');
const dataScope={window:{}};vm.runInNewContext(dataCode,dataScope);
vm.runInNewContext(profileCode,dataScope);vm.runInNewContext(socialCode,dataScope);vm.runInNewContext(dialogueCode,dataScope);
const D=dataScope.window.S6_DATA;
let total=0, failures=0;
function check(name,fn){try{fn();total++;console.log('PASS',name)}catch(e){failures++;console.error('FAIL',name,e.stack||e)}}
function makeSession(cache=new Map()){
 let html='',onClick,fields={};
 const app={set innerHTML(v){html=v},get innerHTML(){return html},addEventListener(n,f){if(n==='click')onClick=f}};
 const doc={getElementById:id=>id==='app'?app:fields[id]||null};
 const storage={getItem:k=>cache.get(k)||null,setItem:(k,v)=>cache.set(k,v)};
 const win={S6_DATA:D,S6_BETA_PROFILES:dataScope.window.S6_BETA_PROFILES,S6_BETA_SOCIAL:dataScope.window.S6_BETA_SOCIAL,S6_BETA_DIALOGUE:dataScope.window.S6_BETA_DIALOGUE,scrollTo(){}};
 vm.runInNewContext(game,{window:win,document:doc,localStorage:storage});
 return {
  get html(){return html},
  get state(){return JSON.parse(cache.get('s6-origin-beta-010')||'{}')},
  cache,
  field(id,value){fields[id]={value}},
  click(action,id=''){assert.ok(onClick);onClick({target:{closest:()=>({dataset:{act:action,id}})},preventDefault(){}});return html;}
 };
}
const newPlayer=()=>{const s=makeSession();for(const a of ['start','show-campus','show-intro','begin'])s.click(a);return s};
const skipWeek=()=>{const s=newPlayer();for(let i=0;i<5;i++){s.click('skip');s.click('next-day')}assert.equal(s.state.phase,'camp');return s};
const visit=(s,e,g)=>{s.click('attend',e);s.click('join-group',g);assert.equal(s.state.phase,'flash');s.click('leave-flash')};
check('96 original DB people and portraits, 6 clubs, 12 events, 44 groups',()=>{
 assert.equal(D.people.length,96);assert.equal(D.orgs.length,6);assert.equal(D.events.length,12);assert.equal(D.groups.length,44);
 assert.equal(new Set(D.people.map(x=>x.person_id)).size,96);
 for(const p of D.people)assert.match(p.portrait_path,/^assets\/faces\/p\d{3}\.webp$/);
});
check('content warning, six-club tutorial, and online stalking backstory',()=>{
 const s=makeSession();s.click('start');assert.equal(s.state.phase,'warning');assert.match(s.html,/ジャンプスケア/);
 s.click('show-campus');for(const o of D.orgs)assert.ok(s.html.includes(o.formal_name));
 s.click('show-intro');assert.match(s.html,/SNSで見知らぬ相手/);s.click('begin');assert.equal(s.state.phase,'day');
});
check('entering a venue shows faces but no names',()=>{
 const s=newPlayer();s.click('attend','E01');assert.equal(s.state.phase,'venue');
 assert.equal(s.state.introduced.length,0);assert.equal(s.state.seen.length,11);assert.doesNotMatch(s.html,/神谷杏奈/);
});
check('introduction reveals only the joined group, and disappears afterward',()=>{
 const s=newPlayer();s.click('attend','E01');s.click('join-group','E01-A');
 assert.deepEqual(Array.from(s.state.flash),['P003','P019','P051']);assert.match(s.html,/神谷杏奈/);assert.doesNotMatch(s.html,/高橋健/);
 s.click('leave-flash');assert.equal(s.state.phase,'group');assert.doesNotMatch(s.html,/神谷杏奈/);
});
check('an existing acquaintance never gets a second free introduction',()=>{
 const s=newPlayer();visit(s,'E01','E01-A');s.click('back-venue');s.click('finish-venue');s.click('next-day');s.click('skip');s.click('next-day');
 s.click('attend','E06');s.click('join-group','E06-A');assert.ok(!s.state.flash.includes('P003'));
});
check('speaker portrait and A/B chat labels accompany every group line',()=>{
 const s=newPlayer();visit(s,'E01','E01-A');assert.match(s.html,/chat-line/);assert.match(s.html,/chat-avatar/);
 assert.match(s.html,/参加者A/);assert.match(s.html,/p003.webp/);
});
check('freshman peers show highlighted photo and identity hint without permanent name',()=>{
 const s=newPlayer();s.click('attend','E01');s.click('join-group','E01-C');
 assert.match(s.html,/同期の新入生/);assert.match(s.html,/peer-highlight/);assert.match(s.html,/高橋健/);
 s.click('leave-flash');assert.match(s.html,/同級生/);assert.doesNotMatch(s.html,/高橋健/);
});
check('the four actions offer two attempts per group',()=>{
 const s=newPlayer();visit(s,'E01','E01-A');
 for(const q of ['話しかける','質問する','連絡先を頼む','聞き耳を立てる'])assert.ok(s.html.includes(q));
 s.click('action-menu','talk');s.click('act-target','P003');assert.match(s.html,/受付にいると/);assert.doesNotMatch(s.html,/と声をかけてくれた/);
 s.click('action-menu','question');assert.match(s.html,/担当しているパート/);
 s.click('ask-affiliation','P003');assert.equal(s.state.knownOrg.P003,'L');
 assert.equal(s.state.groupLog['E01-A'].length,2);
 s.click('action-menu','contact');assert.equal(s.state.phase,'group');
});
check('all 44 group activities can be entered and listened to twice',()=>{
 let total=0;const dates=['2026-04-06','2026-04-07','2026-04-08','2026-04-09','2026-04-10'];
 for(const e of D.events)for(const g of D.groups.filter(x=>x.event_id===e.event_id)){
  const s=newPlayer();for(let i=0;i<dates.indexOf(e.date);i++){s.click('skip');s.click('next-day')}
  visit(s,e.event_id,g.group_id);s.click('listen-group');s.click('listen-group');assert.equal(s.state.groupLog[g.group_id].length,2);total++;
 }
 assert.equal(total,44);
});
check('there are at most two conversation circles per event',()=>{
 const s=newPlayer();s.click('attend','E01');
 for(const g of ['E01-A','E01-B']){s.click('join-group',g);s.click('leave-flash');s.click('back-venue')}
 s.click('join-group','E01-C');assert.equal(s.state.phase,'venue');assert.equal(s.state.visitedGroups.length,2);
});
check('day notebook prevents both guessing and editing',()=>{
 const s=newPlayer();s.click('attend','E01');s.click('join-group','E01-A');s.click('leave-flash');
 s.click('open-notebook');s.click('open-identity','P003');assert.doesNotMatch(s.html,/data-act="submit-identity"/);assert.doesNotMatch(s.html,/data-act="save-note"/);
 s.field('guessName','P003');s.field('guessOrg','L');s.click('submit-identity');assert.equal(s.state.guesses.P003,undefined);
});
check('night notebook accepts unlimited incorrect attempts and a correct match',()=>{
 const s=newPlayer();visit(s,'E01','E01-A');s.click('back-venue');s.click('finish-venue');s.click('open-notebook');s.click('open-identity','P003');
 for(let i=0;i<5;i++){s.field('guessName','P003');s.field('guessOrg','Z');s.click('submit-identity');assert.equal(s.state.guesses.P003.verified,false);s.click('open-identity','P003')}
 s.field('guessName','P003');s.field('guessOrg','L');s.click('submit-identity');
 assert.equal(s.state.guesses.P003.verified,true);assert.equal(s.state.checks['2026-04-06'],undefined);
});
check('SNS TINE/Photogram/Zitter plus board all available same night',()=>{
 const s=newPlayer();s.click('skip');for(const p of ['TINE','Photogram','Zitter']){s.click('night-sns',p);assert.equal(s.state.phase,'sns');s.click('back-night')}
 s.click('night-board');assert.equal(s.state.phase,'board');assert.equal(s.state.viewedBoard['2026-04-06'],true);assert.equal(s.state.viewedPlatforms['2026-04-06'].length,3);
});
check('public profile face matches anonymously only when previously seen',()=>{
 const s=newPlayer();s.click('skip');s.click('next-day');s.click('skip');s.click('next-day');visit(s,'E05','E05-A');s.click('back-venue');s.click('finish-venue');
 s.click('night-sns','Photogram');s.click('account-match','S02');assert.equal(s.state.phase,'sns-match');
 s.click('match-social-face','P013');assert.equal(s.state.socialLinked.P001,undefined);
 s.click('match-social-face','P001');assert.ok(s.state.socialLinked.P001.includes('Photogram'));
 const anon=newPlayer();for(let i=0;i<3;i++){anon.click('skip');anon.click('next-day')}
 anon.click('skip');anon.click('night-sns','Zitter');assert.match(anon.html,/匿名アカウント/);assert.doesNotMatch(anon.html,/p004.webp/);
});
check('character identification plus conversation and board link to camp judgment',()=>{
 const s=newPlayer();s.click('skip');s.click('night-board');s.click('back-night');s.click('next-day');s.click('skip');s.click('next-day');
 visit(s,'E05','E05-A');s.click('action-menu','talk');s.click('act-target','P001');
 s.click('action-menu','question');s.click('ask-affiliation','P001');s.click('back-venue');s.click('finish-venue');
 s.click('open-notebook');s.click('open-identity','P001');s.field('guessName','P001');s.field('guessOrg','K');s.click('submit-identity');
 s.click('back-from-notebook');s.click('next-day');s.click('skip');s.click('next-day');s.click('skip');s.click('next-day');
 assert.match(s.html,/ばらばらだった情報が、一つの団体につながった/);
});
check('non-K and no-camp options do not share the special trap',()=>{
 for(const c of ['L','Z','J','W','F','N']){const s=skipWeek();s.click('choose-camp',c);assert.doesNotMatch(s.html,/data-act="private"/);s.click('finish-safe');assert.equal(s.state.result,'SAFE')}
});
check('specific hazard allows refusal, rescue, shared rescue, and danger',()=>{
 let s=skipWeek();s.click('choose-camp','K');s.click('finish-safe');assert.equal(s.state.result,'DECLINED');
 s=skipWeek();s.click('choose-camp','K');s.click('private');s.click('stay');assert.equal(s.state.result,'DANGER');
 s=skipWeek();s.click('choose-camp','K');s.click('private');s.click('escape');assert.equal(s.state.result,'RESCUED');
 s=skipWeek();s.click('choose-camp','K');s.click('share');s.click('private');assert.doesNotMatch(s.html,/data-act="stay"/);
});
check('separate save and legacy beta migration',()=>{
 const cache=new Map(),s=makeSession(cache);
 for(const a of ['start','show-campus','show-intro','begin'])s.click(a);
 s.click('attend','E01');s.click('join-group','E01-A');s.click('leave-flash');
 assert.equal(makeSession(cache).state.phase,'group');
 assert.equal(cache.has('s6-case-a-v03-auto'),false);
 const data=s.state;data.phase='flash';data.group=null;cache.set('s6-origin-beta-010',JSON.stringify(data));
 const reread=makeSession(cache);assert.equal(reread.state.phase,'venue');
});
check('all 96 character profiles provide stable voice, four traits and SNS demeanor',()=>{
 const profiles=dataScope.window.S6_BETA_PROFILES;
 assert.equal(Object.keys(profiles.people).length,96);
 for(const p of D.people){
  const c=profiles.people[p.person_id];assert.ok(c);
  for(const k of ['initiative','warmth','caution','expressiveness'])assert.ok(Number.isInteger(c[k])&&c[k]>=0&&c[k]<=4);
  assert.ok(['friendly','energetic','casual','quiet','soft','precise','reserved'].includes(c.voice));
  assert.ok(['active','quiet','private','curated'].includes(c.snsTone));
 }
});
check('all 10 first-year original scene lines are rewritten with newcomer-appropriate voices',()=>{
 const B=dataScope.window.S6_BETA_DIALOGUE;
 assert.equal(B.chatAudit().firstYearLines,10);assert.equal(B.chatAudit().overridden,10);
 const original=D.lines.find(x=>x.group_id==='E02-A'&&x.speaker_id==='P091');
 assert.match(B.sceneLine(original),/安心しました/);
 const s=newPlayer();s.click('attend','E02');s.click('join-group','E02-A');s.click('leave-flash');
 assert.match(s.html,/顔を出さずに投稿してもいいんですね/);
 assert.doesNotMatch(s.html,/自分で決めていいんだ/);
});
check('character responses are plain spoken dialogue without double quotation or name leakage',()=>{
 const B=dataScope.window.S6_BETA_DIALOGUE;
 for(const p of D.people){
  const state={spokenTo:[],contacts:[],affinity:{},eventHistory:['E01']};
  const gid=D.members.find(m=>m.person_id===p.person_id)?.group_id||'E01-A';
  const first=B.talk(p.person_id,gid,state);
  assert.ok(first.text.length>6);
  assert.doesNotMatch(first.text,/^[「『]|[」』]$/);
  assert.doesNotMatch(first.text,/と声をかけてくれた|と返してくれた|と話し始めた/);
  assert.ok(!first.text.includes(p.name),'identity leaked via auto-generated greeting '+p.person_id);
 }
});
check('familiarity, club role and personality alter the response while keeping the same person voice',()=>{
 const B=dataScope.window.S6_BETA_DIALOGUE,pid='P003',gid='E01-A';
 const first=B.talk(pid,gid,{spokenTo:[],contacts:[],affinity:{},eventHistory:['E01']});
 const met=B.talk(pid,gid,{spokenTo:[pid],contacts:[],affinity:{P003:2},eventHistory:['E01','E06']});
 const close=B.talk(pid,gid,{spokenTo:[pid],contacts:[pid],affinity:{P003:4},relationshipDays:{P003:['2026-04-06','2026-04-08']},eventHistory:['E01','E06']});
 assert.equal(first.role,'host');assert.equal(first.relationship,'new');
 assert.equal(met.relationship,'acquainted');assert.equal(close.relationship,'familiar');
 assert.ok(first.text!==met.text&&met.text!==close.text);
 assert.equal(first.voice,met.voice);
});
check('all 132 scene lines and 88 questions refer to members of the displayed group',()=>{
 const memberships=new Map(D.groups.map(g=>[g.group_id,new Set(D.members.filter(m=>m.group_id===g.group_id).map(m=>m.person_id))]));
 assert.equal(D.lines.length,132);assert.equal(D.questions.length,88);
 for(const l of D.lines){assert.ok(memberships.get(l.group_id)?.has(l.speaker_id),l.group_id+'/'+l.speaker_id);
  assert.ok(dataScope.window.S6_BETA_DIALOGUE.sceneLine(l).length>=4)}
 for(const q of D.questions){assert.ok(memberships.get(q.group_id)?.has(q.target_id),q.group_id+'/'+q.target_id);
  assert.ok(q.answer.length>0)}
});
check('all 125 memberships render first, repeat and contact-stage dialogue without narrator double quotation',()=>{
 const engine=dataScope.window.S6_BETA_DIALOGUE;
 assert.equal(D.members.length,125);
 let scenarios=0;
 for(const m of D.members){
  const seen={spokenTo:[],contacts:[],affinity:{},eventHistory:[m.event_id]};
  const repeat={spokenTo:[m.person_id],contacts:[],affinity:{[m.person_id]:2},eventHistory:[m.event_id]};
  const linked={spokenTo:[m.person_id],contacts:[m.person_id],affinity:{[m.person_id]:5},eventHistory:[m.event_id]};
  for(const s of [seen,repeat,linked]){
   const reply=engine.talk(m.person_id,m.group_id,s);
   assert.ok(reply.text.length>=8,m.group_id+'/'+m.person_id);
   assert.doesNotMatch(reply.text,/^「|」$|と声をかけてくれた|と返された/);
   assert.ok(!reply.text.includes(D.people.find(p=>p.person_id===m.person_id).name),'auto-reveal '+m.person_id);
   scenarios++;
  }
 }
 assert.equal(scenarios,375);
});
check('meeting someone twice in the same day cannot make them a close friend',()=>{
 const B=dataScope.window.S6_BETA_DIALOGUE;
 const s=newPlayer();visit(s,'E01','E01-A');
 s.click('action-menu','talk');s.click('act-target','P003');
 s.click('action-menu','question');s.click('ask-affiliation','P003');
 assert.equal(s.state.affinity.P003,2);
 assert.equal(s.state.relationshipDays.P003.length,1);
 assert.equal(B.level(s.state,'P003'),'acquainted');
});
check('contact exchange does not grant familiarity even if approved immediately',()=>{
 const B=dataScope.window.S6_BETA_DIALOGUE;
 const s=newPlayer();visit(s,'E01','E01-A');
 s.click('action-menu','contact');s.click('act-target','P003');
 assert.ok(s.state.contacts.includes('P003'));
 assert.equal(s.state.affinity.P003||0,0);
 assert.equal(B.level(s.state,'P003'),'new');
});
check('reunion after a separate day unlocks a warmer response with no legal-name leakage',()=>{
 const B=dataScope.window.S6_BETA_DIALOGUE;
 const s=newPlayer();visit(s,'E01','E01-A');
 s.click('action-menu','talk');s.click('act-target','P003');
 s.click('action-menu','question');s.click('ask-affiliation','P003');
 s.click('back-venue');s.click('finish-venue');s.click('next-day');
 s.click('skip');s.click('next-day');
 visit(s,'E06','E06-A');s.click('action-menu','talk');s.click('act-target','P003');
 assert.equal(s.state.affinity.P003,3.25);
 assert.equal(B.level(s.state,'P003'),'familiar');
 assert.equal(s.state.relationshipDays.P003.length,2);
 assert.match(s.html,/この前の続きも話せそう/);
 assert.doesNotMatch(s.html,/神谷杏奈/);
});
check('TINE displays personal messages only for approved contacts, without dating or safety badges',()=>{
 const B=dataScope.window.S6_BETA_DIALOGUE;
 const no=newPlayer();no.click('skip');no.click('night-sns','TINE');
 assert.doesNotMatch(no.html,/交換済みの連絡先/);
 assert.equal(B.snsMessage('P003',no.state),null);
 const s=newPlayer();visit(s,'E01','E01-A');
 s.click('action-menu','contact');s.click('act-target','P003');
 s.click('back-venue');s.click('finish-venue');s.click('night-sns','TINE');
 assert.match(s.html,/交換済みの連絡先/);
 assert.match(s.html,/相手が安全かどうかは別の話/);
 const msg=B.snsMessage('P003',s.state);
 assert.ok(msg?.text.includes('新歓'));
 assert.doesNotMatch(msg.text,/神谷杏奈|好きだよ|付き合って/);
 assert.equal(s.state.affinity.P003||0,0);
});
check('old beta saves missing relationshipDay fields load without error or false intimacy',()=>{
 const storage=new Map(),s=newPlayer();
 // Supply an actual legacy shape to the loader and confirm graceful migration.
 const legacy=s.state;
 legacy.affinity={P003:4};delete legacy.relationshipDays;delete legacy.dailyAffinity;
 storage.set('s6-origin-beta-010',JSON.stringify(legacy));
 const loaded=makeSession(storage);
 assert.equal(loaded.state.affinity.P003,4);
 assert.equal(dataScope.window.S6_BETA_DIALOGUE.level(loaded.state,'P003'),'acquainted');
});
console.log(JSON.stringify({passed:total,failed:failures}));if(failures)process.exitCode=1;
