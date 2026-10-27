#!/usr/bin/env node
'use strict';
// Run: node proposals/village-review/tests/qa_feedback_v0621.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
const db=JSON.parse(fs.readFileSync(path.join(root,'evolution-db.json'),'utf8'));
assert(script,'Game script missing');
function harness(storage={}){
 const nodes={};
 const get=id=>nodes[id]||(nodes[id]={innerHTML:'',textContent:'',scrollTop:0,style:{},
  classList:{add(){},remove(){}},addEventListener(){},setAttribute(){},querySelectorAll(){return []},scrollIntoView(){}});
 const env={document:{getElementById:get,querySelectorAll(){return []}},window:{},console,Date,Math,
  navigator:{},location:{search:'?qa=1',href:'https://example.invalid/v1/'},confirm:()=>true,
  localStorage:{getItem:k=>storage[k]||null,setItem:(k,v)=>{storage[k]=v}}};
 vm.runInNewContext(script,env,{filename:'v1/index.html',timeout:30000});
 const qa=env.window.__VILLAGE_QA__;
 assert(qa&&qa.makeCandidates&&qa.finaleCandidate,'QA hooks missing');
 assert(qa.evolutionRegister(db),'Evolution DB invalid');
 return {qa,get};
}
const {qa,get}=harness();
assert.equal(db.stage2.length,96);
assert.equal(db.stage3.length,576);
assert.equal(qa.v1ExpectedAssets().size,145);
const terrains=new Set(),endings=new Set();let reviews=0,seaReviews=0;
for(let seed=1;seed<=160;seed++){
 qa.generate(Math.imul(seed,2654435761)>>>0);
 terrains.add(qa.getState().terrain);
 assert(get('map').innerHTML.includes('今月訪問可'),'Visit badge missing');
 for(let month=0;month<12;month++){
  const st=qa.getState(),id=st.candidates[(seed+month)%st.candidates.length];
  const f=st.facilities.find(x=>x.id===id),facts=qa.factsFor(f),ix=(seed+month)%facts.length;
  qa.post(id,ix,[5,4,2,1,3][(seed+month)%5]);reviews++;
  const now=qa.getState(),modal=get('modal').innerHTML;
  assert.equal(now.result.reviewedId,id);
  assert(modal.includes('reviewQuote')&&modal.indexOf('reviewQuote')<modal.indexOf('resultArt'));
  assert.equal(now.reviewHistory.length,month+1);
  assert.equal(qa.groundQA().length,0);
  if(facts[ix].tag==='sea'){
   seaReviews++;
   now.result.changes.filter(e=>e.kind==='big'&&e.facilityId===id).forEach(e=>{
    assert(/海|潮|港|波|漁/.test(e.title+' '+e.detail),'Inland title from sea review');
   });
  }
 }
 endings.add(qa.annual().main.name);
}
assert.equal(terrains.size,5);
assert(endings.size>=7);
const quiet=[['rail.1.0',4],['shrine.0.0',4],['shrine.0.1',-4],
 ['inn.0.0',4],['scenic.2.0',4],['harbor.1.0',2],['office.0.0',2]];
for(const [id,value] of quiet){
 qa.generate(171);
 const state=qa.getState(),row=db.stage2.find(r=>r.id===id),f=state.facilities[0];
 f.kind=row.kind;f.stage=2;state.quiet=50;
 assert.equal(qa.applyEvolutionConsequences(f,row).delta.quiet,value,id);
}
function marchFixture(flag,tag,kind,base,others){
 const {qa:q}=harness();
 let st,subject;
 for(let seed=1;seed<=500;seed++){
  q.generate(Math.imul(seed,2654435761)>>>0);st=q.getState();
  subject=st.facilities.find(f=>f.kind===kind);
  if(subject&&(!others||st.facilities.some(f=>others.includes(f.kind)))&&(!base||base.includes(st.terrain)))break;
 }
 assert(subject,'Missing '+kind+' March fixture');
 st.month=11;st.secrets[flag]=true;st.themes[tag]=10;
 if(flag==='ancient'){st.themes.tradition=7;st.themes.history=3}
 const two=st.facilities.filter(f=>f.id!==subject.id).slice(0,2);
 st.reviewHistory=two.map(f=>({id:f.id,tag,stars:5}));
 q.makeCandidates();assert(st.candidates.includes(subject.id),'Final target hidden by candidate RNG');
 const ix=q.factsFor(subject).findIndex(f=>f.tag===tag);
 assert(ix>=0);q.post(subject.id,ix,5);
 return q.annual().hidden;
}
assert.equal(marchFixture('ancient','tradition','office',null,['shrine','hall']),'因習村');
assert.equal(marchFixture('deep','sea','harbor',['coast','island'],null),'海とつながりすぎた村');
// Robot is normally unlocked through progression rather than present initially.
{
 const {qa:q}=harness();q.generate(718);const st=q.getState(),robot=st.facilities[0];
 robot.kind='robot';st.month=11;st.secrets.robot=true;st.themes.tech=10;
 st.reviewHistory=st.facilities.slice(1,3).map(f=>({id:f.id,tag:'tech',stars:5}));
 q.makeCandidates();assert(st.candidates.includes(robot.id));
 q.post(robot.id,q.factsFor(robot).findIndex(f=>f.tag==='tech'),5);
 assert.equal(q.annual().hidden,'近未来の村');
}
// Legacy saved sea-themed evolution is migrated without losing past reviews.
{
 const store={},h=harness(store),q=h.qa;
 let shrine=null;
 for(let seed=1;seed<=400;seed++){
  q.generate(Math.imul(seed,2654435761)>>>0);
  const st=q.getState();
  shrine=['coast','island'].includes(st.terrain)?st.facilities.find(f=>f.kind==='shrine'):null;
  if(shrine)break;
 }
 assert(shrine,'No coastal legacy fixture');
 q.getState().candidates=[shrine.id];
 q.post(shrine.id,3,5);
 const st=q.getState(),event=st.result.changes.find(e=>e.kind==='big'&&e.facilityId===shrine.id);
 assert(event,'No big evolution from sea review');
 delete shrine.coastalStage;delete shrine.coastalMode;delete shrine.coastalHistory;
 event.title='森に守られた静かな聖域';event.detail='森の特徴を維持しました。';
 st.version='0.6.14-alpha';
 store['village-review-prototype-v010']=JSON.stringify(st);
 const reopened=harness(store).qa.getState();
 const migrated=reopened.result.changes.find(e=>e.kind==='big'&&e.facilityId===shrine.id);
 assert(/海|潮|港|波/.test(migrated.title),'Legacy sea title not corrected');
 assert(reopened.facilities.find(f=>f.id===shrine.id).coastalStage>=1,'Coastal stage not retained');
}

console.log(JSON.stringify({status:'PASS',villages:160,reviews,seaReviews,terrain:[...terrains],endingCount:endings.size,quiet:'PASS',march:'3/3'},null,2));
