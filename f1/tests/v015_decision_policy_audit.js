/* F1 v0.15 decision-policy audit.
   Simulated numeric decisions, not observed human success rates.
   Execute from repository root: node f1/tests/v015_decision_policy_audit.js */
'use strict';
const fs=require('node:fs'),path=require('node:path');
function auditHumanDecisions(html){
 const game=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 if(!game)throw Error('Missing game script');
 function init(){
  const nodes=new Map(),memory=new Map();
  const node=()=>{const cl=new Set(['hidden']),attrs={};return {
   className:'',innerHTML:'',textContent:'',value:'',src:'',style:{},children:[],
   classList:{contains:x=>cl.has(x),add:(...a)=>a.forEach(x=>cl.add(x)),remove:(...a)=>a.forEach(x=>cl.delete(x)),toggle:(x,on)=>on?cl.add(x):cl.delete(x)},
   append(...x){this.children.push(...x)},replaceChildren(...x){this.children=x},
   setAttribute:(k,v)=>attrs[k]=v,getAttribute:k=>attrs[k]??null,focus(){}};
  };
  const document={body:node(),createElement:node,getElementById:id=>{if(!nodes.has(id))nodes.set(id,node());return nodes.get(id)}};
  const localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v)},window={};
  new Function('document','window','localStorage','scrollTo','confirm',game)(document,window,localStorage,()=>{},()=>true);
  window.__F1_DEBUG__.getTestNode=document.getElementById;return window.__F1_DEBUG__;
 }
 const api=init(),personas=[
  {name:'売上の改善幅を最優先',gray:false,rev:1.15,cust:.3,risks:.3},
  {name:'売上と顧客の苦情を両立',gray:false,rev:.82,cust:1.1,risks:1},
  {name:'最悪の苦情カテゴリを優先',gray:false,rev:.56,cust:2.0,risks:1},
  {name:'グレー施策も計算に含める',gray:true,rev:1.1,cust:.45,risks:.2},
  {name:'目標割れが見えたらグレーも検討',gray:'crisis',rev:.85,cust:.9,risks:.7}
 ];
 const clip=(n,max=5)=>Math.max(0,Math.min(max,n));
 function ranked(s,p){
  const currentSales=Math.max(0,30+s.attraction*10-s.vals.reduce((a,b)=>a+b,0)*10);
  const projection=s.revenue+(8-s.day)*currentSales;
  return api.getAvailableActions().filter(a=>a.kind!=='odd'&&(p.gray!==false||a.kind!=='gray')&&
   (p.gray!=='crisis'||a.kind!=='gray'||projection<480||currentSales<=30)).map(a=>{
    const delta=a.delta||[0,0,0,0],next=s.vals.map((v,i)=>clip(v+delta[i]));
    const before=s.vals.reduce((x,y)=>x+y,0),after=next.reduce((x,y)=>x+y,0);
    const gain=(clip(s.attraction+(a.attractionOnCompletion||0),10)-s.attraction+before-after)*10;
    const peak=Math.max(...s.vals)-Math.max(...next);
    const cascadeBefore=before>=8||Math.max(...s.vals)>=4;
    const cascadeAfter=after>=8||Math.max(...next)>=4;
    const sideEffect=(a.risk||[]).reduce((x,y)=>x+y,0);
    const score=p.rev*gain*Math.max(.25,8-s.day)+p.cust*(20*(before-after)+9*peak+(Number(cascadeBefore)-Number(cascadeAfter))*20)-
      p.risks*sideEffect*10*Math.max(1,7-s.day)+(a.v15Family&&s.day<=4?6:0);
    return {action:a,score};
   }).sort((a,b)=>b.score-a.score||a.action.id.localeCompare(b.action.id));
 }
 function inspectFeedback(state,tried){
  const names=['レジ待ち','通路','品切れ','店内騒音'],inspected=new Set();
  for(let attempt=0;attempt<3;attempt++){
   const cards=[...api.getTestNode('complaintBoard').children,...api.getTestNode('complaintExtraBody').children];
   const candidates=[];
   for(const card of cards){
    const label=card.children[0]?.children[1]?.textContent||'';
    const metric=names.findIndex(name=>label.startsWith(name));
    const elems=(card.children[1]?.children||[]).filter(x=>x.className==='complaint-focus'&&!x.disabled);
    for(const btn of elems){
     const key=label+':'+btn.textContent;
     if(tried.has(key))continue;
     const urgency=metric<0?0:state.vals[metric],diversity=inspected.has(metric)?-60:0;
     candidates.push({btn,key,metric,score:urgency*10+diversity});
    }
   }
   if(!candidates.length)break;
   candidates.sort((a,b)=>b.score-a.score||a.key.localeCompare(b.key));
   const chosen=candidates[0];tried.add(chosen.key);inspected.add(chosen.metric);
   chosen.btn.onclick();
  }
 }
 function run(p,alternateDay){
  api.restart();const decisions=[],tried=new Set();
  for(let day=1;day<=7;day++){
   const state=api.getState();if(state.finish)break;
   inspectFeedback(state,tried);
   const choices=ranked(api.getState(),p);if(!choices.length)throw Error('No plausible action for '+p.name);
   const selected=choices[alternateDay===day&&choices.length>=2?1:0].action;
   if(!api.availableIds().includes(selected.id))throw Error('Policy chose unavailable card');
   api.play(selected.id);decisions.push(selected.id);
   api.advance();api.closeTransition();
   const s=api.getState();
   if(s.revenue!==s.days.reduce((n,d)=>n+(d.sales||0),0))throw Error('Revenue ledger mismatch');
   if(s.vals.some(v=>v<0||v>5))throw Error('Complaint limit');
   if((s.complaintTickets||[]).filter(x=>x.status==='open').length!==s.vals.reduce((a,b)=>a+b,0))throw Error('Complaint ticket mismatch');
  }
  const s=api.getState();return {alternateDay,decisions,ending:s.ending,revenue:s.revenue,complaints:s.vals.reduce((a,b)=>a+b,0)};
 }
 const report=personas.map(p=>{
  const main=run(p,0),alternatives=Array.from({length:7},(_,i)=>run(p,i+1));
  return {persona:p.name,baseline:main,secondBestByDay:alternatives,
   successAmongSecondBest:alternatives.filter(a=>a.ending==='normal_success').length,
   endingTypes:[...new Set([main.ending,...alternatives.map(a=>a.ending)])]};
 });
 if(report.some(x=>!x.baseline.ending||x.secondBestByDay.length!==7))throw Error('Incomplete decision audit');
 return {method:'Five heuristic decision styles. Each day inspects up to three customer phrases before selecting a policy; one-day second-choice perturbations. DOM-model, not observed human success.',games:40,profiles:report};
}
if(require.main===module){
 const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
 console.log(JSON.stringify(auditHumanDecisions(html),null,2));
}
module.exports={auditHumanDecisions};
