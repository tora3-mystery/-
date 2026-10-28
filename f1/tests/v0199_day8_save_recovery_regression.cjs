/* F1 v0.19.9: orphaned DAY 8 save recovery and 7th-day transitions. DOM mock, not a physical browser. */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const photo=fs.readFileSync(path.join(__dirname,'..','store_scene_v018.js'),'utf8');
const js=html.match(/<script>\s*(\(\(\)=>[\s\S]*?)<\/script>/)?.[1];
if(!js)throw Error('Missing F1 inline script');
function el(){const cls=new Set(['hidden']),attrs={};return{children:[],innerHTML:'',textContent:'',src:'',className:'',style:{},disabled:false,
 classList:{contains:x=>cls.has(x),add:(...x)=>x.forEach(i=>cls.add(i)),remove:(...x)=>x.forEach(i=>cls.delete(i)),toggle:(x,v)=>v?cls.add(x):cls.delete(x)},
 append(...x){this.children.push(...x)},replaceChildren(...x){this.children=x},setAttribute:(k,v)=>attrs[k]=v,getAttribute:k=>attrs[k]??null,focus(){}}}
function boot(memory=new Map()){const nodes=new Map(),window={};
 const document={body:el(),createElement:el,getElementById:id=>{if(!nodes.has(id))nodes.set(id,el());return nodes.get(id)}};
 const storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
 new Function('window','module',photo)(window,{exports:{}});
 new Function('document','localStorage','window','scrollTo','confirm',js)(document,storage,window,()=>{},()=>true);
 return{api:window.__F1_DEBUG__,get:document.getElementById,memory};}
let checks=0;function ok(value,why){checks++;if(!value)throw Error('v0199 check '+checks+': '+why)}
const run=boot();run.api.restart();
const base={...run.api.getState(),version:10,day:8,odd:3,day8Active:false,day8Stage:0,
 day8OpeningPending:false,day8Revealed:false,needsAdvance:false,finish:false,revenue:350,
 days:Array.from({length:7},(_,i)=>({day:i+1,sales:50}))};
const restored=boot(new Map([['f1-v10',JSON.stringify(base)]]));
ok(restored.api.getState().day8Active,'Orphaned DAY 8 restores dedicated screen');
ok(restored.api.getState().day8OpeningPending,'Restored DAY 8 presents opening');
ok(JSON.parse(restored.memory.get('f1-v10')).day8Active,'Migration persists, no repeated fallback');
restored.api.resumeCurrent();
ok(!restored.get('day8Panel').classList.contains('hidden')&&restored.get('game').classList.contains('hidden'),'Human-day screen, not ordinary day 8');
ok(!restored.get('dayTransition').classList.contains('hidden')&&restored.get('transitionTitle').innerHTML.includes('人曜日'),'Opening clearly states human day');
ok(restored.get('day8Sales').textContent==='88人'&&restored.get('day8Meters').children[0].innerHTML.includes('石'),'Broken numbers present');
ok(restored.get('day8Feedback').children.length===10,'Ten impossible customer letters');
restored.api.advanceDay8();ok(!restored.api.getState().finish,'Cannot bypass unrevealed finale');
restored.get('transitionContinue').onclick();
ok(!restored.api.getState().day8OpeningPending&&restored.get('dayTransition').classList.contains('hidden'),'Opening acknowledgement persists');
const reopened=boot(restored.memory);reopened.api.resumeCurrent();
ok(reopened.get('day8Date').textContent.includes('人曜日'),'Reload preserves human day');
ok(reopened.get('dayTransition').classList.contains('hidden'),'Acknowledged opening does not repeat');
const ask=reopened.get('day8Feedback').children[9].children[1].children.find(x=>x.textContent==='終わりはありますか');
ok(!!ask,'Last letter investigation control exists');
ask.onclick();
ok(reopened.api.getState().day8Revealed&&reopened.get('day8Offers').children.length===10,'Ten sacrifice choices unlock');
const endings=boot(reopened.memory);endings.api.resumeCurrent();
ok(endings.get('day8Offers').children.length===10,'Choices persist across reload');
endings.get('day8Offers').children[9].onclick();
ok(endings.api.getState().finish&&endings.api.getState().ending==='odd_day8','Last choice reaches proper finale');
ok(!endings.get('ending').classList.contains('hidden'),'Finale visible');
const legacy=boot(new Map([['f1-v09',JSON.stringify({...base,version:9})]]));legacy.api.resumeCurrent();
ok(legacy.api.getState().day8Active&&legacy.get('day8Date').textContent.includes('人曜日'),'v09 storage key migrated');
ok(JSON.parse(legacy.memory.get('f1-v10')).day8Active,'Legacy key migration saved to current key');
const already=boot(new Map([['f1-v10',JSON.stringify({...base,day8Active:true,day8OpeningPending:false,day8Revealed:true})]]));
already.api.resumeCurrent();
ok(already.get('dayTransition').classList.contains('hidden')&&already.get('day8Offers').children.length===10,'Valid active DAY8 remains untouched');
const normal=boot(new Map([['f1-v10',JSON.stringify({...base,odd:0,day8Active:false})]]));normal.api.resumeCurrent();
ok(normal.api.getState().finish&&normal.api.getState().ending?.startsWith('normal_'),'Normal orphan returns to weekly ending');
ok(!normal.get('ending').classList.contains('hidden')&&normal.get('game').classList.contains('hidden'),'No playable ordinary DAY8');
const late=boot(new Map([['f1-v10',JSON.stringify({...base,day:7,odd:2,day8Active:false,needsAdvance:true,
 jobs:[{kind:'odd',id:'open0',name:'裏手の社に生贄を捧げる',delta:[-1,-1,-1,-1],attraction:0,after:45,remain:5,finishDay:8}]})]]));
late.api.resumeCurrent();late.api.advance();
ok(late.api.getState().odd===3&&late.api.getState().day8Active,'DAY7 final pending job triggers DAY8');
ok(!late.get('dayTransition').classList.contains('hidden'),'DAY8 opening reached after final pending job');
const ordinary7=boot(new Map([['f1-v10',JSON.stringify({...base,day:7,odd:0,day8Active:false,needsAdvance:true,jobs:[]})]]));
ordinary7.api.resumeCurrent();ordinary7.api.advance();
ok(ordinary7.api.getState().finish&&!ordinary7.api.getState().day8Active,'Ordinary DAY7 goes to normal ending');
console.log('PASS F1 v0199 DAY8 legacy recovery '+checks+' checks');
