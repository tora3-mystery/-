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
ok(newGame.get('day0Queue').textContent==='3/5'&&newGame.get('day0Noise').textContent==='0/5','DAY 0 begins one action before normal DAY 1');
newGame.get('day0Investigate').onclick();
ok(newGame.api.practiceStatus()===1&&!newGame.get('day0Discovery').classList.contains('hidden'),'Actual underlined phrase yields a policy');
newGame.get('day0Apply').onclick();
ok(newGame.api.practiceStatus()===2&&newGame.get('day0Queue').textContent==='2/5'&&newGame.get('day0Noise').textContent==='1/5','Practice shows both improvement and side effect');
ok(!newGame.get('day0Finish').classList.contains('hidden'),'Practice has a completion action');
newGame.get('day0Finish').onclick();
let state=newGame.api.getState();
ok(state.day===1&&state.vals.join(',')==='2,1,1,1'&&state.attraction===7,'DAY 1 has the unmodified opening metrics');
ok(state.days.length===0&&state.revenue===0&&state.used.length===0,'Practice leaves no real decisions or sales');
ok(newGame.api.availableIds().join(',')==='idle','No action unlocked by the practice');
const preserved=JSON.stringify(newGame.api.getState());
newGame.api.showLanding(true,true);
ok(!newGame.get('start').classList.contains('hidden')&&newGame.get('practiceAgain').classList.contains('hidden'),'Help shows unified DAY0 start instead of redundant rehearsal');
newGame.api.startPractice(true);
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
ok(!saved.get('start').classList.contains('hidden'),'Existing-save DAY0 button visible');
ok(!saved.get('startOver').classList.contains('hidden'),'Existing-save DAY1 button visible');
ok(saved.get('start').textContent.includes('DAY 0')&&saved.get('startOver').textContent.includes('DAY 1'),'Two start routes are explicit');
saved.api.startPractice(true);
ok(saved.api.practiceStatus()===0&&!saved.get('day0Panel').classList.contains('hidden'),
 'Existing-save rehearsal enters DAY 0');
saved.get('day0Investigate').onclick();saved.get('day0Apply').onclick();saved.get('day0Finish').onclick();
ok(saved.api.getState().day===4&&saved.api.getState().revenue===180,
 'Rehearsal preserves saved day and sales');
saved.api.showLanding(true,false);saved.get('start').onclick();
ok(!saved.get('day0Panel').classList.contains('hidden'),'Saved user can enter DAY 0 from unified start');
ok(saved.api.getState().day===4,'DAY 0 entry retains save until tutorial completion');
saved.get('day0Investigate').onclick();saved.get('day0Apply').onclick();saved.get('day0Finish').onclick();
ok(saved.api.getState().day===1&&saved.api.getState().revenue===0,
 'Finishing DAY 0 starts fresh DAY 1');
saved.api.setState({...saved.api.getState(),day:4,revenue:180,
 days:[{day:1,sales:60},{day:2,sales:60},{day:3,sales:60}]});
saved.api.showLanding(true,false);saved.get('startOver').onclick();
ok(saved.get('day0Panel').classList.contains('hidden')&&saved.api.getState().day===1,'Direct DAY 1 skips tutorial and replaces save');
saved.get('restart').onclick();
ok(!saved.get('intro').classList.contains('hidden')&&!saved.get('start').classList.contains('hidden'),
 'In-game restart presents both start options');
saved.api.setState({...saved.api.getState(),day:7,revenue:510,finish:true,ending:'normal_success',
 days:Array.from({length:7},(_,i)=>({day:i+1,sales:70}))});
const replayButton=saved.get('ending').children.find(x=>x.textContent==='もう一度営業する');
ok(!!replayButton&&typeof replayButton.onclick==='function','Ending has replay button');
replayButton.onclick();
ok(!saved.get('intro').classList.contains('hidden')&&saved.get('day0Panel').classList.contains('hidden'),
 'Ending replay returns to start choice, not forced DAY 0');
ok(!saved.get('start').classList.contains('hidden')&&!saved.get('startOver').classList.contains('hidden'),
 'Both DAY 0 and DAY 1 are available after game over');

const blocked=boot();blocked.api.restart();
step(blocked,'idle');
ok(blocked.api.focus('f17-back-review','裏手の社の周りが暗く'),'Rear alley investigated');
step(blocked,'inspectBack');
ok(blocked.api.getState().day===3,'Reach third day without product handling');
ok(blocked.api.getState().vals.join(',')==='2,2,2,1','Rear inspection changes no severity; only daily natural deterioration applies');
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
route.api.play('idle');route.api.advance();
ok(route.api.getState().day8Active,'Conditional DAY 8 begins');
ok(route.get('day8Title').textContent==='DAY 08 / 07','DAY 8 looks like original business day');
ok(route.api.getState().day8OpeningPending&&!route.get('dayTransition').classList.contains('hidden'),
 'Seventh-day close leads to a familiar overnight opening panel');
ok(route.get('transitionScoreLabel').textContent==='本日の日売上見込'&&
 route.get('transitionScore').textContent==='88人'&&
 route.get('transitionContinue').textContent==='今日の営業を確認する',
 'DAY 8 opening intentionally corrupts the revenue unit without losing its continue action');
const day8Pending=boot(route.memory);day8Pending.api.resumeCurrent();
ok(!day8Pending.get('dayTransition').classList.contains('hidden'),'DAY 8 opening panel survives saving and reloading');
day8Pending.api.closeTransition();
ok(!day8Pending.api.getState().day8OpeningPending,'Closing the overnight panel clears persisted pending flag');
ok(route.get('day8Meters').children.length===4,'Same four operational indicators');
ok(route.get('day8Sales').textContent==='88人','DAY 8 sales is counted as people');
ok(route.get('day8Date').textContent==='DAY 08 / 07 ｜ 人曜日','Human day on first business screen');
ok(route.get('day8Feedback').children.length===10,'Ten strange customer letters appear immediately');
const firstLetter=route.get('day8Feedback').children[0].children[1];
ok(firstLetter.textContent.includes('最後尾に戻っています'),'Impossible checkout-loop complaint');
ok(route.get('day8FeedbackSummary').textContent.includes('新着 10件'),'Ten incoming complaints');
route.api.closeTransition();
ok(route.get('dayTransition').classList.contains('hidden')&&!route.api.getState().day8OpeningPending,
 'Opening handoff ends without an intermediate anomalous phase');
ok(route.get('day8Next').classList.contains('hidden'),'No free next-day choice before inspecting the final complaint');
ok(route.get('day8Meters').children[0].innerHTML.includes('石')&&
 route.get('day8Meters').children[0].innerHTML.includes('88,888/5'),
 'Stone metric breaks scale');
ok(route.get('transitionScore').textContent==='88人'&&route.get('transitionDecision').textContent.includes('第8営業日')&&
 route.get('transitionTotal').textContent.includes('縺ｧ■繧ｫ件'),
 'Opening ledger has crossed units and mojibake');
const resume=boot(route.memory);resume.api.resumeCurrent();
ok(!resume.api.getState().day8OpeningPending&&resume.get('day8Date').textContent.includes('人曜日'),
 'Human day remains on resume');
ok(resume.get('day8Feedback').children.length===10,'Unusual letters remain on resume');
const last=resume.get('day8Feedback').children[9].children[1];
const ask=last.children.find(x=>x.textContent==='終わりはありますか');
ok(!!ask&&typeof ask.onclick==='function','The last complaint has an investigable ending question');
resume.api.advanceDay8();
ok(!resume.api.getState().finish,'The ending cannot be entered before investigating');
ask.onclick();
ok(resume.api.getState().day8Revealed&&resume.get('day8Offers').children.length===10,
 'Question reveals ten identically named responses');
const reloaded=boot(resume.memory);reloaded.api.resumeCurrent();
ok(reloaded.get('day8Offers').children.length===10,'Unlocked choices survive save and reload');
resume.get('day8Offers').children[5].onclick();
ok(resume.api.getState().ending==='odd_day8'&&resume.api.getState().finish,'One of the ten choices ends the story');
ok(resume.get('ending').children[0].textContent==='店舗運営報告','Same header genre as normal endings');
const report=resume.get('ending').children.find(x=>x.className==='outcome');
ok(!!report&&report.innerHTML.includes('営業 8/7日間')&&report.innerHTML.includes('集客力 88/10'),
 'Ordinary scorecard contains impossible statistics');
ok(report.children[0].children.some(x=>x.textContent.includes('88/5')),'Impossible metric in regular scorecard');
ok(resume.get('ending').children.some(x=>x.className==='ending-media'),'Ending retains normal newspaper and forum layout');
console.log('PASS F1 v019 onboarding + dual-condition shrine + corrupted DAY 8 '+checks+' checks');
