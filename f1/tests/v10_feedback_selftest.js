/* Run: node f1/tests/v09_integrated_selftest.js
 * Self-contained DOM mock regression for the integrated staged F1/index.html.
 * This does not replace browser visual QA or image-file verification.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const match=html.match(/<script>([\s\S]*?)<\/script>/);
assert(match,'F1 must contain an inline game script');
const source=match[1];
class ClassList {
 constructor(initial=[]){this.values=new Set(initial)}
 add(...values){values.forEach(x=>this.values.add(x))}
 remove(...values){values.forEach(x=>this.values.delete(x))}
 contains(x){return this.values.has(x)}
 toggle(x,on){(on===undefined?!this.contains(x):on)?this.add(x):this.remove(x)}
}
class Element {
 constructor(initial=[]){this.classList=new ClassList(initial);this.children=[];this.style={};
 this.attributes={};this.textContent='';this.innerHTML='';this.value='';this.hidden=false;this.disabled=false;this.src='';this.open=false}
 append(...x){this.children.push(...x)}
 appendChild(x){this.children.push(x)}
 replaceChildren(...x){this.children=x}
 setAttribute(k,v){this.attributes[k]=v}
 getAttribute(k){return this.attributes[k]??null}
 focus(){}
}
const memory=new Map();
const localStorage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
function boot(){
 const nodes=new Map();
 const get=id=>{if(!nodes.has(id))nodes.set(id,new Element(
 ['overlay','finalChoice','ending','day8Panel','oddEvidenceBoard','inferArea'].includes(id)?['hidden']:
 id==='game'?['gameonly']:[]));return nodes.get(id)};
 const document={body:new Element(),getElementById:get,createElement:()=>new Element(),addEventListener(){}};
 const window={};
 new Function('window','document','localStorage','confirm','scrollTo',source)(
 window,document,localStorage,()=>true,()=>{});
 return {api:window.__F1_DEBUG__,get};
}
let env=boot();
function playRoute(route,name){
 env.api.restart();
 const history=[];
 for(const [index,id] of route.entries()){
  const s=env.api.getState(),offered=env.api.availableIds();
  assert.equal(offered.length,6,name+' day '+(index+1)+' six options');
  assert(offered.includes(id),name+' day '+(index+1)+' has '+id);
  const before=s.revenue;
  env.api.play(id);
  const after=env.api.getState();
  assert.equal(after.revenue-before,after.days.at(-1).sales,name+' day '+(index+1)+' accounting');
  env.api.advance();
  const advanced=env.api.getState();
  assert.equal(advanced.complaintTickets.filter(x=>x.status==='open').length,
   advanced.vals.reduce((a,b)=>a+b,0),name+' complaint ledger');
  history.push({day:index+1,id,after});
  if(advanced.finish)break;
 }
 return {state:env.api.getState(),history};
}
const normal=[
 ['N1',['pickup','delivery','vibration','forecast','register','rest','floorcheck'],'normal_success'],
 ['N2',['pickup','vibration','farmer','rest','display','gourmet','discount'],'normal_customer'],
 ['N3',['pickup','quiet','display','quiet','floorcheck','quiet','floorcheck'],'normal_strain'],
 ['Zero-sales closure',['discount','sampling','gourmet','sale'],'normal_strain','閉店'],
 ['Manager dismissal',['quiet','lane','early','limit','early'],'normal_strain','店長交代']
];
for(const [name,route,end,reason] of normal){
 const {state,history}=playRoute(route,name);
 assert.equal(state.ending,end,name+' ending');
 if(reason)assert.equal(state.endingReason,reason,name+' reason');
 assert.equal(state.finish,true,name+' completion');
 if(reason==='閉店')assert.equal(history.at(-1).after.days.at(-1).sales,0);
}
assert.equal(JSON.parse(memory.get('f1-v09')).version,9);
const restored=boot().api.getState();
assert.equal(restored.ending,env.api.getState().ending,'saved state restores');
const freshRun=env.api.restart();
assert.equal(env.api.getState().complaintTickets.length,5,'opening five distinct complaints');
const firstChoice=env.api.availableIds().includes('floorcheck')?'floorcheck':env.api.availableIds()[0];
env.api.play(firstChoice);
assert.equal(env.api.getState().needsAdvance,true,'daily report must await explicit next');
const pendingResume=boot();
assert.equal(pendingResume.api.getState().day,1,'refresh does not silently advance');
assert.equal(pendingResume.get('intro').classList.contains('hidden'),false,'refresh returns to saved-game landing');
assert.equal(pendingResume.get('resume').classList.contains('hidden'),false,'saved-game resume control is shown');
assert.equal(pendingResume.get('overlay').classList.contains('hidden'),true,'daily report waits behind resume control');
pendingResume.api.resumeCurrent();
assert.equal(pendingResume.get('overlay').classList.contains('hidden'),false,'resume restores daily report');
assert(pendingResume.get('dialogTitle').textContent.includes('再表示'),'restored day report title');
pendingResume.api.advance();
assert.equal(pendingResume.api.getState().day,2,'explicit next click advances after refresh');
assert(pendingResume.api.getState().complaintTickets.filter(x=>x.replies?.some(r=>r.visibleFrom===2)).length>0,
 'manager answers appear the following morning');
const oddRoutes=[
 ['X1',['register','delivery','audit','camera0','open0','glitch6','display'],'odd_stop','stop'],
 ['X2',['floorcheck','display','quiet','delivery','audit','camera0','discount'],'odd_missing','missing'],
 ['X3',['discount','receive','audit','camera0','open0','glitch6','ticket'],'odd_day8','close'],
 ['X4',['quiet','delivery','audit','camera0','open0','glitch6','ticket'],'odd_hidden','infer']
];
for(const [name,route,end,action] of oddRoutes){
 const {state}=playRoute(route,name);
 assert.equal(state.finish,false,name+' final choice remains open');
 assert(state.odd>=2,name+' entered anomaly');
 if(state.glitchSeen){
  assert.equal(route[5],'glitch6',name+' Saturday sixfold anomaly');
  // The sixth day must have six identical controls, not merely one special choice.
  const copy={...state,day:6,glitchSeen:false,finish:false};
  env.api.setState(copy);
  assert.deepEqual(env.api.availableIds(),Array(6).fill('glitch6'),name+' six duplicate buttons');
  env.api.setState(state);
  assert.equal(env.api.getState().day,7,name+' seventh day returns');
 }
 if(action==='stop')env.api.finalDecision('stop');
 else if(action==='missing')env.api.finalDecision('customer');
 else if(action==='close'){
  env.api.finalDecision('day8');assert.equal(env.api.getState().day8Active,true);
  env.api.finishDay8('close');
 }else{
  for(const item of env.get('finalEvidenceList').children)item.children[0].onclick();
  assert.equal(env.api.getState().clues,3,'all evidence manually read');
  env.api.startInference();env.api.resolveInference('self','yesterday');
 }
 assert.equal(env.api.getState().ending,end,name+' ending');
 assert.equal(env.api.getState().finish,true,name+' completion');
}
// All fifteen missing-image fallbacks must yield valid, distinguishable inline SVG URLs.
const sceneNames=['normal','queue','aisle','stock','noise','thriving','popular-chaos','underused','declining',
 'construction','odd1','odd2','odd3','human-day','closed'];
const illustrations=new Set();
for(const name of sceneNames){
 const uri=env.api.sceneFallback('store-'+name+'.jpg');
 assert(uri.startsWith('data:image/svg+xml;charset=utf-8,'),'scene '+name+' must be SVG data URI');
 const svg=decodeURIComponent(uri.slice(uri.indexOf(',')+1));
 assert(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'),'scene '+name+' svg root');
 assert(svg.includes('viewBox="0 0 1100 619"'),'scene '+name+' standard resolution');
 assert(svg.includes('試作イラスト'),'scene '+name+' provisional asset disclosure');
 illustrations.add(svg);
}
assert.equal(illustrations.size,15,'each scene has distinct fallback artwork');


env.api.restart();
const initialComplaintCards=env.get('complaintBoard').children;
assert.equal(initialComplaintCards.length,5,'five initial unresolved complaints');
for(const card of initialComplaintCards){
 assert.equal(card.children.length,2,'no reply nor reply-placeholder on open complaint');
 assert.equal(card.classList.contains('resolved'),false,'open complaint not grayed out');
}
assert(!env.api.availableIds().some(id=>['audit','camera0','open0'].includes(id)),'ritual not shown on day 1');
for(const id of ['pickup','quiet']){
 assert(env.api.availableIds().includes(id),'setup option '+id);
 env.api.play(id);env.api.advance();
}
assert.equal(env.api.getState().day,3,'first contract decision is day 3');
assert(env.api.availableIds().includes('audit'),'ritual available on day 3');
const offered=env.get('actions').children;
assert(offered.some(el=>el.innerHTML.includes('禁じられた「売上保証の儀式」')),'ritual name explicit before click');
assert(offered.some(el=>el.innerHTML.includes('帰れない人 ＋1名')),'ritual price disclosed before click');
const before=env.api.getState();
env.api.play('audit');const first=env.api.getState();
assert.equal(first.odd,1,'first ritual has anomaly level one');
assert.equal(first.attraction,Math.min(10,before.attraction+2),'first ritual has real gameplay upside');
assert(first.remaining>=1,'first ritual has visible human cost');
assert.equal(first.days.at(-1).sales,Math.max(0,30+10*first.attraction-10*first.vals.reduce((a,b)=>a+b,0)),'revenue remains formula-driven');
env.api.advance();
assert(env.api.availableIds().includes('camera0'),'second contract offered');
const before2=env.api.getState().attraction;
env.api.play('camera0');assert.equal(env.api.getState().attraction,Math.min(10,before2+1),'second contract gives gain');
env.api.advance();
assert(env.api.availableIds().includes('open0'),'third contract offered');
const before3=env.api.getState().attraction;
env.api.play('open0');assert.equal(env.api.getState().attraction,Math.min(10,before3+1),'third contract gives gain');
env.api.advance();
assert.deepEqual(env.api.availableIds(),Array(6).fill('glitch6'),'contract compels identical Saturday choices');
assert(!env.get('contractWarning').classList.contains('hidden'),'dangerous contract has visible warning on Saturday');
assert(env.get('contractWarning').textContent.includes('帰宅できない人'),'contract warning states human price');
env.api.play('glitch6');env.api.advance();
assert.equal(env.api.getState().day,7,'the contract reaches Sunday');
assert(env.get('contractWarning').classList.contains('hidden'),'Sunday mask conceals contract temporarily');

assert(html.includes('complaint-ticket.resolved{opacity:.69;filter:grayscale(.8)'), 'resolved complaint uses subdued styling');
assert(html.includes('苦情（－改善／＋悪化）'), 'customer complaint effect has readable sign legend');
assert(html.includes('契約を破棄し、今後の利益を手放す'), 'final contract exit option explicitly labeled');

console.log('PASS F1 v0.10 feedback tests: 9 route endings, 15 scene SVGs, closed-ticket replies, pact benefits/costs and Saturday compulsion.');
console.log('NOT TESTED: actual browsers, visual responsive layout, real image bytes/load, GitHub Pages deployment.');
