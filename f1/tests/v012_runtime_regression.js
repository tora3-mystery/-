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
  const window={};new Function('document','localStorage','window','scrollTo','confirm',script.replace('grayAuditSeed:Math.floor(Math.random()*4294967296)>>>0','grayAuditSeed:0'))(document,localStorage,window,()=>{},()=>true);
  return {api:window.__F1_DEBUG__,get:document.getElementById,db};
 }
 function step(h,id){
  const s=h.api.getState(),choices=h.api.availableIds();
  check(choices.includes(id),'Missing action '+id+' on day '+s.day);
  check(choices.length<=(s.day===1?7:s.day<=3?9:s.day<=5?11:13),'Too many choices');
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
 const none=boot();none.api.restart();for(let day=1;day<=7&&!none.api.getState().finish;day++)step(none,'idle');
 check(none.api.getState().ending==='normal_strain'&&none.api.getState().days.length<7,'All idle must fail before 7 days');
 const best=route(['pickup','vibration','floorcheck','delivery','quiet','display','discount']);
 check(best.api.getState().revenue===500&&best.api.getState().ending==='normal_success','Hard clean route');
 const mixed=route(['pickup','complaintHide','delivery','vibration','floorcheck','stockCover','shrine']);
 check(mixed.api.getState().revenue>=500&&mixed.api.getState().ending==='normal_success'&&mixed.api.getState().grayUsed.length>=2,'Gray strategy wins');
 const shrine=boot();shrine.api.restart();step(shrine,'shrine');check(shrine.api.getState().attraction===8,'Shrine deferred boost');
 const closure=boot();closure.api.restart();closure.api.setState({day:2,lowDays:1,attraction:0,vals:[5,5,5,5],days:[{day:1,sales:0}],revenue:0});
 step(closure,'idle');check(closure.api.getState().finish&&closure.api.getState().endingReason==='店長解任・営業停止','Immediate close on zero sales');
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
  if(i===3||i===4){const line=clue.get('oddEvidenceList').children[i-3];check(!!line,'Clue not visible');line.children[0].onclick();}
 }
 check(clue.api.getState().clues===2,'Both clues read');
 clue.api.startInference();clue.api.resolveInference('self','yesterday');
 check(clue.api.getState().ending==='odd_hidden','Hidden ending');
 for(const end of [none,best,mixed,stop,day8,sales8,clue])check(end.get('ending').children.some(x=>x.className==='ending-media'),'Missing news and forum');
 const clamp=boot();clamp.api.restart();clamp.api.setState({day:4,attraction:10,vals:[0,5,0,5],days:[{day:1,sales:80}],revenue:80});
 for(const card of clamp.get('actions').children){
  const numbers=[...card.innerHTML.matchAll(/aria-label="(?:集客力|レジ待ち|通路|品切れ|店内騒音) ([+-]?\d+)"/g)].map(x=>Number(x[1]));
  check(numbers.length===5,'All five effect numbers required');
  check(numbers[0]<=0&&numbers[1]>=0&&numbers[2]<=0&&numbers[3]>=0&&numbers[4]<=0,'Unbounded shown effect');
 }

 const repeated=boot();repeated.api.restart();
 repeated.api.setState({day:4,attraction:7,vals:[2,1,1,2],revenue:150,
  actionCounts:{quiet:2},days:[{day:1,sales:50},{day:2,sales:50},{day:3,sales:50}]});
 check(repeated.api.availableIds().includes('quiet'),'Repeated quiet action unavailable in test');
 repeated.api.play('quiet');
 check(repeated.api.getState().complaintTickets.filter(x=>x.status==='open').every(x=>(x.replies||[]).length===0),
  'Unresolved complaints should not receive template replies');
 const ongoing=boot();ongoing.api.restart();
 ongoing.api.setState({day:5,odd:1,attraction:8,vals:[2,1,1,2],revenue:230,
  afterSales:18,remaining:1,permit:'要確認',
  days:[{day:1,sales:50},{day:2,sales:60},{day:3,sales:60},{day:4,sales:60}]});
 step(ongoing,'idle');
 check(ongoing.get('transitionHeadline').textContent==='今日も、同じご意見が届きました',
  'Unchanged uncanny level repeats ritual completion event');

 const first=boot();first.api.restart();
 const initial=first.api.getState().complaintTickets;
 check(initial.length===5,'Five initial complaints');
 check(initial.every(x=>x.status==='open'&&(x.replies||[]).length===0),'Initial complaints must be unanswered');
 step(first,'pickup');
 const day2=first.api.getState();
 check(day2.day===2,'DAY2 after first selection');
 check(day2.vals.join(',')==='1,1,0,2','Pickup plus new complaint');
 const pending=day2.complaintTickets.filter(x=>x.status==='open');
 const resolved=day2.complaintTickets.filter(x=>x.status==='resolved');
 check(pending.length===4&&resolved.length===3,'Three resolved and four current after new arrivals');
 check(first.get('complaintBoard').children.length===4,'Resolved complaints leaked into visible inbox');
 check(first.get('complaintArchiveBody').children.length===3,'Archived replies absent');
 check(first.get('complaintArchiveBody').children.every(x=>x.className.includes('resolved')),'Resolved cards not grayed');
 check(first.get('complaintBoard').children.every(x=>!x.children.some(y=>y.className==='complaint-reply')),'Unresolved card received a reply');
 check(resolved.every(x=>x.replies.at(-1)?.body.includes('改善しました')),'Resolved replies must report actual fix');
 check(first.get('complaintArchiveLabel').textContent.includes('対応済みのご意見（3件'),'Archive label wrong');
 check(first.get('transitionDecision').textContent.includes('昨日の判断')&&first.get('transitionDecision').textContent.includes('別件で新たなご意見'),'Decision result and daily pressure should be separate');
 const random=boot(),seen=new Set();
 for(let i=0;i<24;i++){random.api.restart();seen.add(random.api.getState().complaintTickets.map(x=>x.body).join('|'))}
 check(seen.size>5,'Starting complaints are fixed, not randomized');
 const creep=boot();creep.api.restart();creep.api.setState({day:6,odd:3,afterSales:91,remaining:9,permit:'不許可',revenue:290,
  days:[{day:1,sales:50},{day:2,sales:50},{day:3,sales:50},{day:4,sales:50},{day:5,sales:50}],vals:[2,2,1,3]});
 const horror=creep.get('complaintBoard');
 check(horror.children.length>=10,'Ten regular complaint cards in late eerie stage');
 check(horror.children.slice(0,10).every(x=>x.children[1]?.textContent.includes('ありがとうございました。完璧なスーパーです。スーパーは完璧なので好きです。ありがとうございました。ありがとうございました。')),
  'Ten identical ordinary reviews required');
 check(creep.get('oddMetrics').classList.contains('hidden'),'Abstract occult dashboard should not be shown');
 check(!html.includes('記録 A：差出人不明のご意見'),'Deleted record A should not exist');
 check(!html.includes('id="anomalyComplaints"'),'Special reviews must not have a colored container');

 const late=boot();late.api.restart();
 late.api.setState({day:5,odd:0,revenue:200,attraction:7,vals:[2,1,1,1],
  days:[{day:1,sales:50},{day:2,sales:50},{day:3,sales:50},{day:4,sales:50}]});
 step(late,'audit');step(late,'camera0');step(late,'open0');
 check(late.api.getState().odd===3&&late.api.getState().day===7,'Late-stage ritual not effective in closing calculation');
 check(!late.get('finalChoice').classList.contains('hidden'),'Late ritual finale missing');
 check(late.get('finalLead').textContent.includes('生肉'),'Day7 ritual must reveal the offering next morning');
 const finalEcho=late.get('finalAnomalyComplaints');
 check(finalEcho.children.length===10&&finalEcho.children[0].className==='complaint-ticket','Closing scene should show ten ordinary customer reviews');
 return {pass:true,assertions,endingTypes:7,tests:['seven choice cards','deferred effects','sales formula','complaint ledger','full seven-endings','resume after close','five-number visual bounds','shrine']};

}
const outcome=runRegression(html);
console.log('PASS F1 runtime '+outcome.assertions+' assertions, '+outcome.endingTypes+' endings');
