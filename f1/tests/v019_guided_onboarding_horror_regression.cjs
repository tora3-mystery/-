/* F1 v0.19 — deterministic DAY 0, dual-key shrine, corrupted regular DAY 8.
 * node f1/tests/v019_guided_onboarding_horror_regression.cjs
 * DOM-only assertions, not a substitute for Chrome/Safari layout inspection.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const photos=fs.readFileSync(path.join(__dirname,'..','store_scene_v018.js'),'utf8');
const js=html.match(/<script>\s*(\(\(\)=>[\s\S]*?)<\/script>/)?.[1];
if(!js)throw Error('F1 game script is missing');
let checks=0;
const ok=(yes,reason)=>{checks++;if(!yes)throw Error('F1 v019 '+checks+': '+reason)};
function boot(memory=new Map()){
 const nodes=new Map(),win={};
 const element=()=>{
  const flags=new Set(['hidden']),attrs={};
  return {children:[],textContent:'',innerHTML:'',src:'',value:'',style:{},disabled:false,className:'',
   classList:{contains:x=>flags.has(x),add:(...v)=>v.forEach(x=>flags.add(x)),
    remove:(...v)=>v.forEach(x=>flags.delete(x)),toggle:(x,b)=>b?flags.add(x):flags.delete(x)},
   append(...v){this.children.push(...v)},replaceChildren(...v){this.children=v},
   setAttribute:(k,v)=>{attrs[k]=v},getAttribute:k=>attrs[k]??null,focus(){}};
 };
 const doc={body:element(),createElement:element,getElementById:id=>{
  if(!nodes.has(id))nodes.set(id,element());return nodes.get(id)}};
 const storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
 new Function('window','module',photos)(win,{exports:{}});
 new Function('document','localStorage','window','scrollTo','confirm',js)(doc,storage,win,()=>{},()=>true);
 return {api:win.__F1_DEBUG__,get:doc.getElementById,memory};
}
function step(app,id){
 ok(app.api.availableIds().includes(id),'Action available: '+id+' on DAY '+app.api.getState().day);
 app.api.play(id);app.api.advance();
 if(!app.get('dayTransition').classList.contains('hidden'))app.api.closeTransition();
}
function inspectProduct(app){
 const product=app.api.getState().complaintTickets.find(x=>x.body.includes('見掛けない商品'));
 ok(!!product,'Mysterious product is in normal customer comments');
 ok(app.api.focus(product.id,'見掛けない商品がありました'),'Investigate product underline');
}
ok(html.includes('id="day0Panel"')&&html.includes('id="day8Meters"'),'Both new UI shells exist');
ok(!html.includes('class="intro-grid"')&&!html.includes('class="playloop-path"'),'Duplicated onboarding panels removed');
const newGame=boot();
ok(!newGame.get('intro').classList.contains('hidden'),'Intro visible at first entry');
ok(newGame.get('start').onclick instanceof Function,'Start button has an action');
newGame.get('start').onclick();
ok(newGame.api.practiceStatus()===0&&!newGame.get('day0Panel').classList.contains('hidden'),'DAY 0 opens');
ok(newGame.get('day0Apply').classList.contains('hidden'),'Practice response initially hidden');
newGame.get('day0Investigate').onclick();
ok(newGame.api.practiceStatus()===1&&!newGame.get('day0Discovery').classList.contains('hidden'),'Actual underlined phrase yields a policy');
newGame.get('day0Apply').onclick();
ok(newGame.api.practiceStatus()===2&&newGame.get('day0Queue').textContent==='1件'&&newGame.get('day0Noise').textContent==='2件','Practice shows both improvement and side effect');
ok(!newGame.get('day0Finish').classList.contains('hidden'),'Practice has a completion action');
newGame.get('day0Finish').onclick();
let state=newGame.api.getState();
ok(state.day===1&&state.vals.join(',')==='2,1,1,1'&&state.attraction===7,'DAY 1 has the unmodified opening metrics');
ok(state.days.length===0&&state.revenue===0&&state.used.length===0,'Practice leaves no real decisions or sales');
ok(newGame.api.availableIds().join(',')==='idle','No action unlocked by the practice');
const preserved=JSON.stringify(newGame.api.getState());
newGame.api.showLanding(true,true);
ok(!newGame.get('practiceAgain').classList.contains('hidden'),'Help offers a repeatable rehearsal');
newGame.get('practiceAgain').onclick();
newGame.get('day0Investigate').onclick();newGame.get('day0Apply').onclick();
newGame.get('day0Finish').onclick();
ok(JSON.stringify(newGame.api.getState())===preserved,'Repeatable rehearsal does not overwrite ongoing state');

// Navigation regression: users with existing saves must not be locked out of DAY 0.
const savedSeed=boot();savedSeed.api.restart();
savedSeed.api.setState({...savedSeed.api.getState(),day:4,revenue:180,
 days:[{day:1,sales:60},{day:2,sales:60},{day:3,sales:60}],
 discoveredActions:['register'],actionCounts:{register:1}});
const saved=boot(savedSeed.memory);
ok(!saved.get('resume').classList.contains('hidden'),'Existing-save resume button remains visible');
ok(!saved.get('practiceAgain').classList.contains('hidden'),'Existing-save DAY 0 practice button is visible');
ok(!saved.get('startOver').classList.contains('hidden'),'Existing-save new-game DAY 0 button is visible');
saved.get('practiceAgain').onclick();
ok(saved.api.practiceStatus()===0&&!saved.get('day0Panel').classList.contains('hidden'),
 'Existing-save rehearsal enters DAY 0');
saved.get('day0Investigate').onclick();saved.get('day0Apply').onclick();saved.get('day0Finish').onclick();
ok(saved.api.getState().day===4&&saved.api.getState().revenue===180,
 'Rehearsal preserves saved day and sales');
saved.api.showLanding(true,false);saved.get('startOver').onclick();
ok(!saved.get('day0Panel').classList.contains('hidden'),'New game from saved data enters DAY 0');
ok(saved.api.getState().day===4,'Entering new DAY 0 does not immediately erase previous save');
saved.get('day0Investigate').onclick();saved.get('day0Apply').onclick();saved.get('day0Finish').onclick();
ok(saved.api.getState().day===1&&saved.api.getState().revenue===0,
 'After DAY 0 a new, clean DAY 1 is created');
saved.get('restart').onclick();
ok(saved.api.practiceStatus()===0&&!saved.get('day0Panel').classList.contains('hidden'),
 'In-game restart now begins at DAY 0, not DAY 1');
saved.api.setState({...saved.api.getState(),day:7,revenue:510,finish:true,ending:'normal_success',
 days:Array.from({length:7},(_,i)=>({day:i+1,sales:70}))});
const replayButton=saved.get('ending').children.find(x=>x.textContent==='もう一度営業する');
ok(!!replayButton&&typeof replayButton.onclick==='function','Ending has replay button');
replayButton.onclick();
ok(saved.api.practiceStatus()===0&&!saved.get('day0Panel').classList.contains('hidden'),
 'Ending replay enters DAY 0');

const blocked=boot();blocked.api.restart();
step(blocked,'idle');
ok(blocked.api.focus('f17-back-review','裏手の社の周りが暗く'),'Rear alley investigated');
step(blocked,'inspectBack');
ok(blocked.api.getState().day===3,'Reach third day without product handling');
ok(!blocked.api.availableIds().includes('audit'),'Rear alley alone does not unlock visit');
ok(blocked.api.availableIds().includes('removeShrine'),'Demolition remains available without product handling');
const sameSave=new Map([['f1-v10',JSON.stringify(blocked.api.getState())]]);
const noBypass=boot(sameSave);noBypass.api.resumeCurrent();
ok(!noBypass.api.availableIds().includes('audit'),'New saves cannot bypass the additional condition');

const old=blocked.api.getState();delete old.legacyShrineAccess;
const oldApp=boot(new Map([['f1-v10',JSON.stringify(old)]]));oldApp.api.resumeCurrent();
ok(oldApp.api.getState().legacyShrineAccess===true,'Pre-v019 rear-shrine save is grandfathered');
ok(oldApp.api.availableIds().includes('audit'),'Pre-v019 in-progress route remains reachable');

const route=boot();route.api.restart();inspectProduct(route);
step(route,'productCheck');
ok(route.api.getState().day===2,'Product investigation can be performed on DAY 1');
ok(route.api.focus('f17-back-review','裏手の社の周りが暗く'),'Rear investigation remains a separate finding');
step(route,'inspectBack');
ok(route.api.availableIds().includes('audit')&&route.api.availableIds().includes('removeShrine'),'Both investigations unlock DAY 3 fork');
step(route,'audit');
ok(route.api.getState().day===4&&route.api.getState().odd===1,'One unusual complaint on DAY 4');
step(route,'camera0');ok(route.api.getState().day===5&&route.api.getState().odd===2,'Second unusual stage on DAY 5');
step(route,'open0');ok(route.api.getState().day===6&&route.api.getState().odd===3,'Third unusual stage on DAY 6');
step(route,'idle');ok(route.api.getState().day===7,'DAY 7 ordinary return');
step(route,'idle');
ok(route.api.getState().day8Active,'Conditional DAY 8 begins');
ok(route.get('day8Title').textContent==='DAY 08 / 07','DAY 8 looks like original business day');
ok(route.get('day8Meters').children.length===4,'Same four operational indicators');
ok(route.get('day8Sales').textContent.endsWith('万円'),'Ordinary-looking sales first');
ok(route.get('day8Feedback').children.length===0,'No premature praise posts at opening');
route.api.advanceDay8();
ok(route.get('day8Feedback').children.length===10,'Ten praise posts in ordinary customer board');
ok(route.get('day8SceneStatus').textContent==='入店客数 0名','Zero customers with sales');
const resume=boot(route.memory);resume.api.resumeCurrent();
ok(resume.api.getState().day8Stage===1&&resume.get('day8Feedback').children.length===10,'DAY 8 stage persists across resume');
resume.api.advanceDay8();
ok(resume.get('day8Title').textContent==='DAY 08 / 07 / 08','Impossible day label');
ok(resume.get('day8Attraction').textContent==='88/10'&&resume.get('day8IssueTag').textContent==='未解決 -10件','Impossible statistics');
ok(resume.get('day8Meters').children.length===4&&resume.get('day8Ledger').textContent.includes('明日：DAY 08'),'Corrupt original-style metrics and HQ bulletin');
resume.api.advanceDay8();
ok(resume.api.getState().ending==='odd_day8'&&resume.api.getState().finish,'Anomalous ending reached normally');
console.log('PASS F1 v019 onboarding + dual-condition shrine + corrupted DAY 8 '+checks+' checks');
