/* F1 v0.19.2: severity 0–5, independent customer letter count,
 * 5/5 surcharge and forced closure at non-positive forecast.
 * Run with: node f1/tests/v0192_severity_and_sales_regression.cjs
 * Uses a minimal DOM mock; visual mobile QA requires a real browser.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const photo=fs.readFileSync(path.join(__dirname,'..','store_scene_v018.js'),'utf8');
const js=html.match(/<script>\s*(\(\(\)=>[\s\S]*?)<\/script>/)?.[1];
if(!js)throw Error('Game source not found');
function el(){
 const c=new Set(['hidden']),a={};
 return {children:[],className:'',textContent:'',innerHTML:'',src:'',style:{},
  classList:{add:(...v)=>v.forEach(x=>c.add(x)),remove:(...v)=>v.forEach(x=>c.delete(x)),
   contains:x=>c.has(x),toggle:(x,on)=>on?c.add(x):c.delete(x)},
  setAttribute:(k,v)=>a[k]=v,getAttribute:k=>a[k]??null,
  append(...v){this.children.push(...v)},replaceChildren(...v){this.children=v},focus(){}};
}
function boot(memory=new Map()){
 const nodes=new Map(),win={};
 const doc={body:el(),createElement:el,getElementById:id=>{
  if(!nodes.has(id))nodes.set(id,el());return nodes.get(id)}};
 const storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
 new Function('window','module',photo)(win,{exports:{}});
 new Function('document','localStorage','window','scrollTo','confirm',js)(
  doc,storage,win,()=>{},()=>true);
 return {api:win.__F1_DEBUG__,get:doc.getElementById,memory};
}
let count=0;
function ok(v,why){count++;if(!v)throw Error('F1 v0192 check '+count+': '+why)}
ok(html.includes('.meterrow.severity-max')&&html.includes('background:#25191d'), 'Black/red critical state');
ok(html.includes("MAX_SEVERITY_PENALTY=15"),'Additional sales loss 15 per maxed area');
const a=boot();a.api.restart();
ok(a.get('total').textContent==='50万円','Unchanged initial 50');
const initial=a.api.getState();
a.api.setState({...initial,vals:[4,1,1,1],complaintTickets:null});
ok(a.get('total').textContent==='30万円','Severity 4 forecast');
a.api.setState({...initial,vals:[5,1,1,1],complaintTickets:null});
ok(a.get('total').textContent==='5万円','Severity 5 adds 15 loss atop normal 10');
ok(a.get('meters').children[0].className.includes('severity-max'),'5/5 highlighted');
ok(a.get('meters').children[0].innerHTML.includes('5/5'),'5/5 text not misleading ticket count');
ok(!a.get('meters').children[1].className.includes('severity-max'),'Other metrics remain normal');
a.api.setState({...initial,vals:[5,0,0,0],attraction:10,complaintTickets:null,days:[],jobs:[]});
ok(a.get('total').textContent==='65万円','Forecast formula for 5/5 alone');
a.api.play('idle');a.api.advance();
if(!a.get('dayTransition').classList.contains('hidden'))a.api.closeTransition();
const day2=a.api.getState();
const q1=day2.complaintTickets.filter(x=>x.metric===0&&x.status==='open').length;
ok(day2.vals[0]===5&&q1>5,'New feedback exceeds 5 while severity stays 5');
a.api.play('idle');a.api.advance();
if(!a.get('dayTransition').classList.contains('hidden'))a.api.closeTransition();
const day3=a.api.getState();
const q2=day3.complaintTickets.filter(x=>x.metric===0&&x.status==='open').length;
ok(day3.vals[0]===5&&q2>q1,'More feedback next day with severity already capped');
const totalOpen=day3.complaintTickets.filter(x=>x.status==='open').length;
ok(a.get('issueTag').textContent.includes('未解決 '+totalOpen+'件'),'Inbox shows actual submissions');
const reloaded=boot(a.memory);
ok(reloaded.api.getState().complaintTickets.filter(x=>x.metric===0&&x.status==='open').length===q2,
 'Uncapped complaint submissions survive save/load');

const b=boot();b.api.restart();
b.api.setState({...b.api.getState(),vals:[4,3,2,2],attraction:9,
 complaintTickets:null,days:[],jobs:[]});
ok(b.get('total').textContent==='10万円','Closing setup starts above zero');
b.api.play('idle');
ok(!b.api.getState().finish,'Positive forecast still trades on initial day');
b.api.advance();
ok(b.api.getState().finish&&b.api.getState().endingReason==='店長解任・営業停止',
 '0 forecast on next opening forces termination');
ok(b.api.getState().days.length===1,'Second day is never traded');
ok(b.get('transitionScore').textContent==='0万円','Opening reveal foregrounds current sales');
ok(b.get('transitionScoreLabel').textContent==='本日の日売上見込み',
 'Sales forecast foregrounded, not change');
ok(b.get('transitionTotal').textContent.startsWith('前日比 '),'Change is small secondary detail');
ok(b.get('transitionContinue').textContent.includes('営業停止'),'Stop CTA instead of start');
b.get('transitionContinue').onclick();
ok(!b.get('ending').classList.contains('hidden'),'Final screen shown after notice');
ok(b.get('ending').children[1].textContent.includes('営業停止'),
 'Game over cause explicit in ending title');
console.log('PASS F1 v0.19.2 severity and zero forecast '+count+' checks');
