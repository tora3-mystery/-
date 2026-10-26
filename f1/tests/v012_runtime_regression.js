/* F1 v0.12+ live-runtime regression. Run: node f1/tests/v012_runtime_regression.js
 * Supersedes v09_* smoke expectations for daily choice counts and timing.
 * A DOM mock validates logic, not actual browser pixel layout or Pages deployment.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
function runRegression(html){
 const script=html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 if(!script)throw Error('Inline script missing');new Function(script);
 let assertions=0;
 const check=(c,m)=>{assertions++;if(!c)throw Error('F1 regression: '+m)};
 function boot(db=new Map()){
  const dom=new Map();
  const el=()=>{
   const cl=new Set(['hidden']),attrs={};
   return {className:'',innerHTML:'',textContent:'',src:'',children:[],value:'',style:{},open:false,
    classList:{add:(...v)=>v.forEach(x=>cl.add(x)),remove:(...v)=>v.forEach(x=>cl.delete(x)),
     contains:x=>cl.has(x),toggle:(x,b)=>{b===true?cl.add(x):b===false?cl.delete(x):cl.has(x)?cl.delete(x):cl.add(x)}},
    append(...v){this.children.push(...v)},replaceChildren(...v){this.children=v},focus(){},
    setAttribute:(k,v)=>{attrs[k]=v},getAttribute:k=>attrs[k]??null};
  };
  const document={body:el(),createElement:el,getElementById:id=>{if(!dom.has(id))dom.set(id,el());return dom.get(id)}};
  const localStorage={getItem:k=>db.get(k)??null,setItem:(k,v)=>db.set(k,v)};
  const window={};new Function('document','localStorage','window','scrollTo','confirm',script)(document,localStorage,window,()=>{},()=>true);
  return {api:window.__F1_DEBUG__,get:document.getElementById,db};
 }
 function step(h,id){
  const s=h.api.getState(),choices=h.api.availableIds();
  check(choices.includes(id),'Missing action '+id+' on day '+s.day);
  check(choices.length<=7,'Too many choices');
  check(h.get('actions').children.length===choices.length,'Visible option count mismatch');
  for(const b of h.get('actions').children)check((b.innerHTML.match(/class="effect-chip/g)||[]).length===5,'Metric chips not five');
  h.api.play(id);const post=h.api.getState();
  const sales=Math.max(0,30+10*s.attraction-10*s.vals.reduce((a,b)=>a+b,0));
  check(post.days.at(-1).sales===sales,'Daily sales mismatch '+id);
  check(post.revenue===s.revenue+sales,'Revenue sum mismatch '+id);
  check(post.vals.join(',')===s.vals.join(',')&&post.attraction===s.attraction&&post.odd===s.odd,'Same-day effect '+id);
  h.api.advance();const after=h.api.getState();
  check(after.vals.every(v=>v>=0&&v<=5)&&after.attraction>=0&&after.attraction<=10,'State boundaries');
  check(after.complaintTickets.filter(x=>x.status==='open').length===after.vals.reduce((a,b)=>a+b,0),'Complaint ledger mismatch');
  if(!h.get('dayTransition').classList.contains('hidden'))h.api.closeTransition();
 }
 function route(ids){const h=boot();h.api.restart();ids.forEach(id=>step(h,id));return h}
 check(html.includes('<label>👥 集客力</label>')&&html.includes("['🧾','↔️','📦','🔊'][i]"),'Top indicators lack matching icons');
 const none=route(Array(7).fill('idle'));
 check(none.api.getState().revenue===350&&none.api.getState().ending==='normal_strain','All idle route');
 const best=route(['pickup','vibration','rest','farmer','delivery','rest','display']);
 check(best.api.getState().revenue===710&&best.api.getState().ending==='normal_success','Successful route');
 const mixed=route(['pickup','vibration','rest','farmer','display','gourmet','discount']);
 check(mixed.api.getState().revenue===680&&mixed.api.getState().ending==='normal_customer','Customer complaints route');
 const shrine=boot();shrine.api.restart();step(shrine,'shrine');check(shrine.api.getState().attraction===8,'Shrine deferred boost');
 const closure=boot();closure.api.restart();closure.api.setState({day:2,lowDays:1,attraction:0,vals:[5,5,5,5],days:[{day:1,sales:0}],revenue:0});
 step(closure,'idle');check(closure.api.getState().finish&&closure.api.getState().endingReason==='閉店','Immediate close on zero sales');
 const savedDb=new Map(),original=boot(savedDb);original.api.restart();original.api.play('register');
 const resumed=boot(savedDb);check(resumed.api.getState().needsAdvance,'Report not saved');resumed.api.resumeCurrent();
 check(!resumed.get('overlay').classList.contains('hidden'),'Report not restored');resumed.api.advance();
 check(resumed.api.getState().day===2&&resumed.api.getState().vals[0]===0,'Deferred effect lost on resume');
 function odd(){return route(['pickup','vibration','audit','camera0','open0','glitch6','idle'])}
 const stop=odd();check(!stop.get('finalChoice').classList.contains('hidden'),'Odd final prompt');stop.api.finalDecision('stop');
 check(stop.api.getState().ending==='odd_stop','Odd stop');
 const day8=odd();day8.api.finalDecision('day8');check(day8.api.getState().day8Active,'Day8 not opened');day8.api.finishDay8('close');
 check(day8.api.getState().ending==='odd_day8','Day8 closure');
 const sales8=odd();sales8.api.finalDecision('day8');sales8.api.finishDay8('book');
 check(sales8.api.getState().ending==='odd_missing','Day8 sales ending');
 const clue=boot();clue.api.restart();
 for(const [i,id] of ['pickup','vibration','audit','camera0','open0','glitch6','idle'].entries()){
  step(clue,id);
  if(i>=2&&i<=4){const line=clue.get('oddEvidenceList').children[i-2];check(!!line,'Clue not visible');line.children[0].onclick();}
 }
 check(clue.api.getState().clues===3,'Three clues unread');
 clue.api.startInference();clue.api.resolveInference('self','yesterday');
 check(clue.api.getState().ending==='odd_hidden','Hidden ending');
 for(const end of [none,best,mixed,stop,day8,sales8,clue])check(end.get('ending').children.some(x=>x.className==='ending-media'),'Missing news and forum');
 const clamp=boot();clamp.api.restart();clamp.api.setState({day:4,attraction:10,vals:[0,5,0,5],days:[{day:1,sales:80}],revenue:80});
 for(const card of clamp.get('actions').children){
  const numbers=[...card.innerHTML.matchAll(/aria-label="(?:集客力|レジ待ち|通路|品切れ|店内騒音) ([+-]?\d+)"/g)].map(x=>Number(x[1]));
  check(numbers.length===5,'All five effect numbers required');
  check(numbers[0]<=0&&numbers[1]>=0&&numbers[2]<=0&&numbers[3]>=0&&numbers[4]<=0,'Unbounded shown effect');
 }
 return {pass:true,assertions,endingTypes:7,tests:['seven choice cards','deferred effects','sales formula','complaint ledger','full seven-endings','resume after close','five-number visual bounds','shrine']};

}
const outcome=runRegression(html);
console.log('PASS F1 runtime '+outcome.assertions+' assertions, '+outcome.endingTypes+' endings');
