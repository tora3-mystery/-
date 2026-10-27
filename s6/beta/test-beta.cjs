'use strict';
// Run: node s6/beta/test-beta.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const dataCode=fs.readFileSync(path.join(root,'game-data.js'),'utf8');
const profileCode=fs.readFileSync(path.join(__dirname,'character-profiles.js'),'utf8');
const socialCode=fs.readFileSync(path.join(__dirname,'social-personas.js'),'utf8');
const storyCode=fs.readFileSync(path.join(__dirname,'story-vocaloid.js'),'utf8');
const dialogueCode=fs.readFileSync(path.join(__dirname,'dialogue-engine.js'),'utf8');
const game=fs.readFileSync(path.join(__dirname,'game.js'),'utf8');
const dataScope={window:{}};vm.runInNewContext(dataCode,dataScope);
vm.runInNewContext(profileCode,dataScope);vm.runInNewContext(socialCode,dataScope);vm.runInNewContext(storyCode,dataScope);vm.runInNewContext(dialogueCode,dataScope);
const D=dataScope.window.S6_DATA;
let total=0, failures=0;
function check(name,fn){try{fn();total++;console.log('PASS',name)}catch(e){failures++;console.error('FAIL',name,e.stack||e)}}
function makeSession(cache=new Map()){
 let html='',onClick,fields={};
 const app={set innerHTML(v){html=v},get innerHTML(){return html},addEventListener(n,f){if(n==='click')onClick=f}};
 const doc={getElementById:id=>id==='app'?app:fields[id]||null};
 const storage={getItem:k=>cache.get(k)||null,setItem:(k,v)=>cache.set(k,v)};
 const win={S6_DATA:D,S6_BETA_PROFILES:dataScope.window.S6_BETA_PROFILES,S6_BETA_SOCIAL:dataScope.window.S6_BETA_SOCIAL,S6_BETA_STORY:dataScope.window.S6_BETA_STORY,S6_BETA_DIALOGUE:dataScope.window.S6_BETA_DIALOGUE,scrollTo(){}};
 vm.runInNewContext(game,{window:win,document:doc,localStorage:storage});
 return {
  get html(){return html},
  get state(){return JSON.parse(cache.get('s6-vocaloid-beta-060')||'{}')},
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
check('six-club tutorial and invited search for anonymous Vocaloid producer',()=>{
 const s=makeSession();s.click('start');assert.equal(s.state.phase,'warning');assert.match(s.html,/見つけたら声をかけて/);
 s.click('show-campus');for(const o of D.orgs)assert.ok(s.html.includes(o.formal_name));
 s.click('show-intro');assert.match(s.html,/余白ラムネ/);assert.match(s.html,/午前二時の紙飛行機/);
 assert.doesNotMatch(s.html,/ストーカー|つきまとい/);
 s.click('begin');assert.equal(s.state.phase,'day');
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
check('SNS face matching records a tentative user guess without confirming true identity',()=>{
 const s=newPlayer();s.click('skip');s.click('next-day');s.click('skip');s.click('next-day');visit(s,'E05','E05-A');s.click('back-venue');s.click('finish-venue');
 s.click('night-sns','Photogram');s.click('account-match','S02');assert.equal(s.state.phase,'sns-match');
 s.click('match-social-face','P013');
 assert.equal(s.state.phase,'sns');assert.equal(s.state.socialCandidates.S02,'P013');
 assert.match(s.html,/推測を記録した/);assert.doesNotMatch(s.html,/別人だった|一致した/);
 s.click('account-match','S02');s.click('match-social-face','P001');
 assert.equal(s.state.socialCandidates.S02,'P001');assert.equal(s.state.socialLinked.P013.length,0);
 assert.ok(s.state.socialLinked.P001.includes('Photogram'));
 assert.doesNotMatch(s.html,/正解|不正解|一致した/);
 const anon=newPlayer();for(let i=0;i<3;i++){anon.click('skip');anon.click('next-day')}
 anon.click('skip');anon.click('night-sns','Zitter');assert.match(anon.html,/匿名アカウント/);assert.doesNotMatch(anon.html,/p004.webp/);
});
check('character identification plus conversation and board link to camp judgment',()=>{
 const s=newPlayer();s.click('skip');s.click('night-board');s.click('back-night');s.click('next-day');s.click('skip');s.click('next-day');
 visit(s,'E05','E05-A');s.click('action-menu','talk');s.click('act-target','P001');
 s.click('action-menu','question');s.click('ask-affiliation','P001');s.click('back-venue');s.click('finish-venue');
 s.click('open-notebook');s.click('open-identity','P001');s.field('guessName','P001');s.field('guessOrg','K');s.click('submit-identity');
 s.click('back-from-notebook');s.click('next-day');s.click('skip');s.click('next-day');s.click('skip');s.click('next-day');
 assert.match(s.html,/こもれびで会った西園寺紬/);
});
check('five alternate clubs and no-camp each have coherent outcomes',()=>{
 for(const c of ['L','Z','J','W','F','N']){
  const s=skipWeek();s.click('choose-camp',c);
  assert.equal(s.state.phase,'saturday');assert.doesNotMatch(s.html,/data-act="meet-producer"/);
  assert.match(s.html,/このサークルで演奏を楽しむ|一週間を振り返る/);
  s.click('finish-other');assert.equal(s.state.result,c==='N'?'SKIPPED':'OTHER');
  assert.equal(s.state.phase,'end');assert.match(s.html,/2027年4月/);
 }
});
check('the target circle lets you meet the Vocaloid producer or just listen',()=>{
 let s=skipWeek();s.click('choose-camp','K');assert.match(s.html,/最後の一拍/);
 s.click('meet-producer');assert.equal(s.state.result,'FOUND');assert.match(s.html,/西園寺紬/);
 assert.match(s.html,/聞かれても教えないで/);
 s=skipWeek();s.click('choose-camp','K');s.click('listen-only');assert.equal(s.state.result,'HEARD');
 assert.doesNotMatch(s.html,/「余白ラムネさん、ですか？/);
});
check('separate save and legacy beta migration',()=>{
 const cache=new Map(),s=makeSession(cache);
 for(const a of ['start','show-campus','show-intro','begin'])s.click(a);
 s.click('attend','E01');s.click('join-group','E01-A');s.click('leave-flash');
 assert.equal(makeSession(cache).state.phase,'group');
 assert.equal(cache.has('s6-case-a-v03-auto'),false);assert.equal(cache.has('s6-origin-beta-010'),false);
 const data=s.state;data.phase='flash';data.group=null;cache.set('s6-vocaloid-beta-060',JSON.stringify(data));
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
 assert.equal(B.chatAudit().firstYearLines,10);assert.ok(B.chatAudit().overridden>=10);
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
 assert.equal(B.level(s.state,'P003'),'acquainted');
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
 assert.match(s.html,/ネット上の活動名義は別の話/);
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
 storage.set('s6-vocaloid-beta-060',JSON.stringify(legacy));
 const loaded=makeSession(storage);
 assert.equal(loaded.state.affinity.P003,4);
 assert.equal(dataScope.window.S6_BETA_DIALOGUE.level(loaded.state,'P003'),'acquainted');
});
check('trait-specific response: 96 profiles give distinct talk/question gains',()=>{
 const E=dataScope.window.S6_BETA_DIALOGUE;
 assert.equal(E.responseGain('P003','talk'),1.25);
 assert.equal(E.responseGain('P004','talk'),0.5);
 assert.equal(E.responseGain('P004','question'),0.75);
 assert.equal(E.responseGain('P001','contact'),0);
 for(const p of D.people)for(const kind of ['talk','question','affiliation']){
  const x=E.responseGain(p.person_id,kind);assert.ok(x>=0.5&&x<=1.25);
 }
});
check('outgoing/cautious students react differently without skipping event dates',()=>{
 const a=newPlayer();visit(a,'E01','E01-A');a.click('action-menu','talk');a.click('act-target','P003');
 const b=newPlayer();visit(b,'E02','E02-A');b.click('action-menu','talk');b.click('act-target','P004');
 assert.equal(a.state.affinity.P003,1.25);assert.equal(b.state.affinity.P004,0.5);
 assert.equal(b.state.relationshipDays.P004.length,1);
});
check('235 persona SNS accounts have unique handles with original platform visibility and avatar rights',()=>{
 const list=dataScope.window.S6_BETA_SOCIAL.accounts;
 assert.equal(list.length,235);assert.equal(new Set(list.map(a=>a.handle)).size,235);
 assert.equal(new Set(list.map(a=>a.platform+'|'+a.person_id)).size,235);
 for(const original of D.accounts){
  const a=list.find(x=>x.account_id===original.account_id);
  assert.ok(a,original.account_id);assert.doesNotMatch(a.handle,/^(tine_|pg_|zt_)[0-9]{3}$/);
  assert.equal(a.visibility,original.visibility);assert.equal(a.avatar_kind,original.avatar_kind);
  assert.equal(a.platform,original.platform);assert.equal(a.person_id,original.person_id);
 }
});
check('anonymous Zitter author never displays persona name, handle or photo',()=>{
 const a=dataScope.window.S6_BETA_SOCIAL.accounts.find(x=>x.platform==='Zitter'&&x.person_id==='P004');
 const s=newPlayer();for(let i=0;i<3;i++){s.click('skip');s.click('next-day')}
 s.click('skip');s.click('night-sns','Zitter');
 assert.match(s.html,/匿名アカウント/);
 assert.ok(!s.html.includes(a.display_name));assert.ok(!s.html.includes(a.handle));
 assert.doesNotMatch(s.html,/p004.webp/);
});
check('public posts and approved TINE message use beta handles not source database handles',()=>{
 const list=dataScope.window.S6_BETA_SOCIAL.accounts;
 const s=newPlayer();s.click('skip');s.click('night-sns','Photogram');
 const pub=list.find(a=>a.person_id==='P001'&&a.platform==='Photogram');
 assert.ok(s.html.includes(pub.handle));assert.ok(s.html.includes(pub.display_name));
 const t=newPlayer();visit(t,'E01','E01-A');t.click('action-menu','contact');t.click('act-target','P003');
 assert.ok(t.state.contacts.includes('P003'));t.click('back-venue');t.click('finish-venue');t.click('night-sns','TINE');
 const tine=list.find(a=>a.person_id==='P003'&&a.platform==='TINE');
 assert.ok(t.html.includes(tine.handle));assert.ok(t.html.includes(tine.display_name));
});
check('all 24 curated SNS posts preserve source visibility and factual scheduling',()=>{
 const SNS=dataScope.window.S6_BETA_SOCIAL;
 assert.equal(Object.keys(SNS.postTexts).length,D.posts.length);
 for(const post of D.posts){
  assert.ok(SNS.postTexts[post.post_id]?.length>5,post.post_id);
  assert.ok(SNS.accounts.some(a=>a.platform===post.platform&&a.person_id===post.author_id));
 }
 const b=newPlayer();b.click('skip');b.click('night-sns','Photogram');
 assert.match(b.html,/こもれびは水曜のお茶会から/);
 assert.match(b.html,/音だけでも、聴きに来てください。/);
});
check('Photogram requires a face-to-face follow request, independently from TINE',()=>{
 const SNS=dataScope.window.S6_BETA_SOCIAL.accounts;
 const a=SNS.find(x=>x.person_id==='P003'&&x.platform==='Photogram');
 const no=newPlayer();no.click('skip');no.click('night-sns','Photogram');assert.ok(!no.html.includes(a.handle));
 const tine=newPlayer();visit(tine,'E01','E01-A');tine.click('action-menu','contact');tine.click('act-target','P003');
 assert.ok(tine.state.contacts.includes('P003'));
 tine.click('back-venue');tine.click('finish-venue');tine.click('night-sns','Photogram');
 assert.ok(!tine.html.includes(a.handle));
 const yes=newPlayer();visit(yes,'E01','E01-A');
 yes.click('action-menu','photo');yes.click('act-target','P003');
 assert.ok(yes.state.photoRequests.includes('P003'));assert.ok(!yes.state.contacts.includes('P003'));
 yes.click('back-venue');yes.click('finish-venue');yes.click('night-sns','Photogram');
 assert.ok(!yes.html.includes(a.handle));
 yes.click('back-night');yes.click('next-day');yes.click('skip');yes.click('night-sns','Photogram');
 assert.ok(yes.state.photoFollows.includes('P003'));assert.ok(yes.html.includes(a.handle));
});
check('public SNS portrait can be compared even when the real author has never been met',()=>{
 const s=newPlayer();visit(s,'E01','E01-A');s.click('back-venue');s.click('finish-venue');s.click('night-sns','Photogram');
 assert.ok(!s.state.seen.includes('P001'));
 assert.match(s.html,/data-id="S02"/);
 s.click('account-match','S02');assert.equal(s.state.phase,'sns-match');
 assert.match(s.html,/正誤は自動判定されません/);
});
check('direct face-match actions cannot bypass locked or future post privacy',()=>{
 const s=newPlayer();visit(s,'E01','E01-A');s.click('back-venue');s.click('finish-venue');s.click('night-sns','Photogram');
 s.click('account-match','S01');assert.equal(s.state.phase,'sns');
 s.click('account-match','S22');assert.equal(s.state.phase,'sns');
 s.click('account-match','S02');assert.equal(s.state.phase,'sns-match');
});
check('all senior/junior scene lines distinguish observer from organizer',()=>{
 const E=dataScope.window.S6_BETA_DIALOGUE,source=D.lines;
 const line=(gid,n)=>E.sceneLine(source.find(x=>x.group_id===gid&&x.order===String(n)));
 assert.match(line('E01-D',1),/新入生って/);assert.match(line('E01-D',2),/案内してます/);
 assert.match(line('E01-D',3),/決めていいよ/);assert.ok(line('E01-D',1)!==line('E01-D',3));
 assert.match(line('E06-E',1),/見学だけで/);assert.match(line('E06-E',3),/何度でも見学/);
 for(const gid of ['E01-C','E03-A','E07-A','E08-A','E11-A','E12-A']){
  const f=source.find(x=>x.group_id===gid&&D.people.find(p=>p.person_id===x.speaker_id)?.year==='1');
  assert.ok(f);assert.match(E.sceneLine(f),/です|ます|先輩|ですね/);
 }
});
check('a group member can join the chat without consuming a player action',()=>{
 const s=newPlayer();s.click('attend','E01');s.click('join-group','E01-C');s.click('leave-flash');
 assert.match(s.html,/演奏がひと区切り/);
 s.click('action-menu','talk');s.click('act-target','P014');
 assert.equal(s.state.groupLog['E01-C'].length,1);
 const response=s.state.groupLog['E01-C'][0].reply;
 if(response){assert.ok(response.pid);assert.match(s.html,/輪の反応/);}
 else assert.doesNotMatch(s.html,/輪の反応/);
 s.click('listen-group');assert.equal(s.state.groupLog['E01-C'].length,2);
});
check('presentation shuffle does not alter membership, calendar, or case A evidence',()=>{
 const E=dataScope.window.S6_BETA_DIALOGUE;
 assert.equal(E.sceneMode('E01-C'),'performance');
 assert.equal(E.sceneMode('E01-A'),'conversation');
 assert.equal(D.members.filter(x=>x.group_id==='E01-C').length,2);
 assert.equal(D.events.find(x=>x.event_id==='E01').date,'2026-04-06');
 const a=newPlayer(),b=newPlayer();
 assert.ok(Number.isFinite(a.state.presentationSeed));
 assert.ok(Number.isFinite(b.state.presentationSeed));
});
check('new rounds shuffle first-day visual circle order but keep event/group membership fixed',()=>{
 const cache=new Map(),first=makeSession(cache);
 for(const act of ['start','show-campus','show-intro','begin'])first.click(act);
 first.click('attend','E01');assert.equal(first.state.phase,'venue');
 const layouts=new Set();
 for(let seed=0;seed<24;seed++){
  const st={...first.state,presentationSeed:seed};cache.set('s6-vocaloid-beta-060',JSON.stringify(st));
  const same=makeSession(cache);
  const layout=(same.html.match(/data-id="E01-[A-E]"/g)||[]).join('|');
  layouts.add(layout);
  assert.equal(same.state.seen.length,11);
  assert.equal(same.state.eventHistory.length,1);
  assert.equal(same.state.clues.length,0);
 }
 assert.ok(layouts.size>1,'at least two layouts should differ across replay seeds');
});
check('first-year dialogue to senior players stays polite in every authored freshman scene line',()=>{
 const lines=D.lines.filter(l=>D.people.find(p=>p.person_id===l.speaker_id)?.year==='1');
 assert.equal(lines.length,10);
 const engine=dataScope.window.S6_BETA_DIALOGUE;
 for(const l of lines){
  const rendered=engine.sceneLine(l);
  assert.ok(rendered.length>8);
  assert.match(rendered,/です|ます|先輩|ですね/);
 }
 assert.match(engine.sceneLine(D.lines.find(x=>x.group_id==='E04-A'&&x.speaker_id==='P015')),/です/);
 assert.match(engine.sceneLine(D.lines.find(x=>x.group_id==='E05-A'&&x.speaker_id==='P013')),/ですね/);
});

check('a 0.5-point conversation is immediately marked as an interaction',()=>{
 const s=newPlayer();visit(s,'E02','E02-A');
 s.click('action-menu','talk');s.click('act-target','P004');
 assert.equal(s.state.affinity.P004,0.5);
 assert.ok(s.state.interacted.includes('P004'));
 assert.equal(dataScope.window.S6_BETA_DIALOGUE.relationshipLabel(s.state,'P004'),'話したことがある');
 assert.ok(s.state.personalIntroduced.P004);
 assert.match(s.html,/有村遥です/);
});
check('group introduction and personal introduction are independent one-time flags',()=>{
 const s=newPlayer();s.click('attend','E01');s.click('join-group','E01-A');s.click('leave-flash');
 assert.ok(s.state.introduced.includes('P003'));
 assert.equal(s.state.personalIntroduced.P003,undefined);
 s.click('action-menu','talk');s.click('act-target','P003');
 assert.ok(s.state.personalIntroduced.P003);
 assert.equal((s.state.groupLog['E01-A'][0].text.match(/神谷杏奈です/g)||[]).length,1);
 s.click('action-menu','talk');s.click('act-target','P003');
 assert.doesNotMatch(s.state.groupLog['E01-A'][1].text,/神谷杏奈です/);
 assert.doesNotMatch(s.state.groupLog['E01-A'][1].text,/また会ったね/);
});
check('contact/photo interaction also counts as having talked but never boosts friendship',()=>{
 const s=newPlayer();visit(s,'E01','E01-A');
 s.click('action-menu','contact');s.click('act-target','P003');
 assert.equal(s.state.affinity.P003||0,0);
 assert.ok(s.state.interacted.includes('P003'));
 assert.equal(dataScope.window.S6_BETA_DIALOGUE.relationshipLabel(s.state,'P003'),'話したことがある');
 assert.ok(s.state.personalIntroduced.P003);
});
check('interpersonal addresses honor grade and remain stable for each pair',()=>{
 const B=dataScope.window.S6_BETA_DIALOGUE,P=dataScope.window.S6_BETA_PROFILES;
 assert.equal(B.addressFor('P014','P017'),'斉藤先輩');
 assert.equal(B.addressFor('P015','P001'),'西園寺先輩');
 assert.equal(P.people.P018.nameParts.family,'橘');
 assert.equal(P.people.P065.nameParts.family,'林');
 assert.equal(B.addressFor('P014','P013'),B.addressFor('P014','P013'));
 assert.ok(!B.addressFor('P014','P013').includes('先輩'));
});
check('probabilistic secondary dialogue includes silence, comments and voluntary introductions',()=>{
 const E=dataScope.window.S6_BETA_DIALOGUE;
 const state={personalIntroduced:{},groupLog:{},interacted:[],spokenTo:[]};
 let silent=0,talked=0,introduced=0;
 for(let seed=0;seed<300;seed++){
  const reply=E.thirdParty('P014','E01-C',{...state,presentationSeed:seed},'talk');
  if(!reply)silent++;
  else {talked++;if(reply.selfIntroduced){introduced++;assert.match(reply.text,/です/)}}
 }
 assert.ok(silent>0&&talked>0&&introduced>0);
 assert.deepEqual(E.thirdParty('P014','E01-C',{...state,presentationSeed:23},'talk'),
 E.thirdParty('P014','E01-C',{...state,presentationSeed:23},'talk'));
});
check('personal name flags from old beta saves survive reload without invented affinity',()=>{
 const cache=new Map(),s=makeSession(cache);
 for(const a of ['start','show-campus','show-intro','begin'])s.click(a);
 const legacy=s.state;legacy.spokenTo=['P003'];delete legacy.personalIntroduced;delete legacy.interacted;
 cache.set('s6-vocaloid-beta-060',JSON.stringify(legacy));
 const loaded=makeSession(cache);
 assert.ok(loaded.state.personalIntroduced.P003);
 assert.equal(loaded.state.affinity.P003||0,0);
});
check('a second conversation in the same circle is not a same-day accidental reunion',()=>{
 const s=newPlayer();visit(s,'E01','E01-A');
 s.click('action-menu','talk');s.click('act-target','P003');
 s.click('action-menu','talk');s.click('act-target','P003');
 assert.match(s.state.groupLog['E01-A'][1].text,/さっきの話|そうそう/);
 assert.doesNotMatch(s.state.groupLog['E01-A'][1].text,/前に来たとき|また会ったね/);
});

check('first direct talk is a real first meeting, not an accidental reunion',()=>{
 const s=newPlayer();visit(s,'E01','E01-A');
 s.click('action-menu','talk');s.click('act-target','P003');
 const first=s.state.groupLog['E01-A'][0].text;
 assert.match(first,/神谷杏奈/);
 assert.doesNotMatch(first,/あ、また会ったね|あ、また会えた|この前はどうも|この前もいたよね|前にも話したよね/);
 assert.ok(s.state.interacted.includes('P003'));
});
check('the producer speaking cue appears on first talk without forcing their alias',()=>{
 const s=newPlayer();
 for(let i=0;i<2;i++){s.click('skip');s.click('next-day')}
 visit(s,'E05','E05-A');
 s.click('action-menu','talk');s.click('act-target','P001');
 const first=s.state.groupLog['E05-A'][0].text;
 assert.match(first,/西園寺紬/);assert.match(first,/鳴らしていない一拍/);
 s.click('action-menu','talk');s.click('act-target','P001');
 const second=s.state.groupLog['E05-A'][1].text;
 assert.doesNotMatch(second,/鳴らしていない一拍/);
});
check('all 88 questions match the seniority of the target',()=>{
 const E=dataScope.window.S6_BETA_DIALOGUE;
 const people=new Map(D.people.map(p=>[p.person_id,p]));
 let seniors=0,peers=0;
 for(const q of D.questions){
  const rendered=E.questionText(q);
  assert.ok(rendered.length>5);
  if(Number(people.get(q.target_id).year)>1){
   seniors++;assert.match(rendered,/ですか？|ますか？/);
   assert.doesNotMatch(rendered,/何が大事？|してるの？|って誰？|を聴く？|教えて。/);
  }else{peers++;assert.equal(rendered,q.question)}
 }
 assert.equal(seniors,87);assert.equal(peers,1);
});
check('all fourteen value questions receive an actual meaningful answer',()=>{
 const E=dataScope.window.S6_BETA_DIALOGUE;
 const items=D.questions.filter(q=>q.question.includes('何が大事'));
 assert.equal(items.length,14);
 for(const q of items){
  const answer=E.answer(q.target_id,q.group_id,'question').text;
  assert.ok(answer.length>=20,q.group_id);
  assert.doesNotMatch(answer,/中心かな。.*担当|中心かな。.*やってるよ/);
 }
});
check('the mismatched performance descriptions match the actual instruments',()=>{
 const E=dataScope.window.S6_BETA_DIALOGUE;
 assert.match(E.sceneActivity('E04-B'),/ギターとドラム/);
 assert.match(E.sceneLine(D.lines.find(x=>x.group_id==='E04-B'&&x.speaker_id==='P009')),/ギターから/);
 assert.match(E.listenText('E04-B'),/ギター/);
 assert.match(E.listenText('E06-C'),/ベース/);
 assert.match(E.listenText('E07-C'),/ベース/);
 assert.match(E.listenText('E11-B'),/ギターとサックス/);
 assert.match(E.listenText('E11-C'),/ドラム/);
 assert.match(E.sceneLine(D.lines.find(x=>x.group_id==='E03-C'&&x.speaker_id==='P027')),/伴奏の余白/);
});


check('third-party question responses follow the question subject across every circle',()=>{
 const E=dataScope.window.S6_BETA_DIALOGUE;
 let spoken=0,silent=0;
 for(const q of D.questions){
  for(let seed=0;seed<32;seed++){
   const result=E.thirdParty(q.target_id,q.group_id,{presentationSeed:seed,groupLog:{},personalIntroduced:{}},'question');
   if(!result){silent++;continue}
   spoken++;
   assert.doesNotMatch(result.text,/さっきの演奏|今の一小節/);
   assert.match(result.text,/お名前|好きな音楽|担当パート|大切にしていること|今の活動/);
  }
 }
 assert.ok(spoken>0&&silent>0);
});


check('all story clues match real performers and the deliberate red herrings',()=>{
 const story=dataScope.window.S6_BETA_STORY;
 assert.equal(story.homeOrg,'K');assert.equal(story.producerId,'P001');
 assert.equal(D.people.find(p=>p.person_id==='P001').primary_org,story.homeOrg);
 assert.equal(story.board.length,5);
 assert.equal(story.confidants.length,3);
 for(const pid of story.confidants)assert.ok(D.people.some(p=>p.person_id===pid));
 for(const key of Object.keys(story.lines)){
  const [gid,pid,order]=key.split('|');
  assert.ok(D.lines.some(x=>x.group_id===gid&&x.speaker_id===pid&&String(x.order)===order),key);
 }
 for(const gid of Object.keys(story.listening))assert.ok(D.groups.some(x=>x.group_id===gid),gid);
 for(const id of Object.keys(story.posts))assert.ok(D.posts.some(p=>p.post_id===id),id);
});
check('vocaloid clues are available without visiting the correct circle',()=>{
 const s=newPlayer();
 s.click('skip');s.click('night-board');
 assert.match(s.html,/ネットで曲を作る人/);
 s.click('back-night');s.click('night-sns','Photogram');
 assert.match(s.html,/一拍/);
 assert.doesNotMatch(s.html,/余白ラムネ.*西園寺紬/);
});
check('producer line and listening clue are heard only in the actual circle',()=>{
 const E=dataScope.window.S6_BETA_DIALOGUE;
 assert.match(E.listenText('E05-A'),/あのボカロ曲/);
 assert.match(E.listenText('E10-A'),/高校時代に何度も聴いた/);
 assert.match(E.sceneLine(D.lines.find(x=>x.group_id==='E05-A'&&x.speaker_id==='P001')),/最後の一拍/);
 assert.match(E.answer('P001','E05-A','question').text,/ボカロも聴く/);
 assert.match(E.answer('P001','E10-A','question').text,/DTMもする/);
 assert.doesNotMatch(E.listenText('E09-A'),/高校時代の公開ライブ/);
});
check('found ending reflects real peer contact and prior identity match',()=>{
 const s=newPlayer();
 for(let i=0;i<2;i++){s.click('skip');s.click('next-day')}
 visit(s,'E05','E05-A');s.click('action-menu','talk');s.click('act-target','P001');
 s.click('back-venue');s.click('finish-venue');s.click('open-notebook');s.click('open-identity','P001');
 s.field('guessName','P001');s.field('guessOrg','K');s.click('submit-identity');s.click('back-from-notebook');
 for(let i=2;i<4;i++){s.click('next-day');s.click('skip')}
 s.click('next-day');assert.equal(s.state.phase,'camp');
 s.click('choose-camp','K');s.click('meet-producer');
 assert.match(s.html,/覚えていた顔と名前/);
 assert.match(s.html,/新歓でも会話した相手/);
});
check('old S6 beta saves do not mix stalking and producer narratives',()=>{
 const cache=new Map();
 cache.set('s6-origin-beta-010',JSON.stringify({schema:1,phase:'private',result:'DANGER'}));
 const s=makeSession(cache);
 assert.equal(s.state.phase,'title');
 assert.match(s.html,/サークルは/);
});

console.log(JSON.stringify({passed:total,failed:failures}));if(failures)process.exitCode=1;
