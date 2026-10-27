/* F1 v0.19.8 DAY1 and shrine seeded regression. DOM model, no physical browser. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8'),photo=fs.readFileSync(path.join(__dirname,'..','store_scene_v018.js'),'utf8'),js=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function el(){const c=new Set(['hidden']);return {children:[],style:{},textContent:'',innerHTML:'',className:'',classList:{contains:x=>c.has(x),add:(...xs)=>xs.forEach(x=>c.add(x)),remove:(...xs)=>xs.forEach(x=>c.delete(x)),toggle:(x,y)=>y?c.add(x):c.delete(x)},append(...xs){this.children.push(...xs)},replaceChildren(...xs){this.children=xs},focus(){},setAttribute(){},getAttribute(){return null}}}
function boot(db=new Map()){const nodes=new Map(),window={},document={body:el(),createElement:el,getElementById:id=>{if(!nodes.has(id))nodes.set(id,el());return nodes.get(id)}},storage={getItem:k=>db.get(k)??null,setItem:(k,v)=>db.set(k,v)};new Function('window','module',photo)(window,{exports:{}});new Function('document','localStorage','window','scrollTo','confirm',js)(document,storage,window,()=>{},()=>true);return{api:window.__F1_DEBUG__,get:document.getElementById,db}}
let checks=0;const ok=(x,m)=>{checks++;if(!x)throw Error('v0198 '+checks+' '+m)},seed=i=>Math.imul(i+1,2654435761)>>>0;
const p=boot();p.api.startPractice(false);ok(p.get('day0Sales').textContent==='50万円','DAY0 sales');ok(html.includes('通路混雑の不満度')&&html.includes('品切れの不満度'),'DAY0 complete metrics');
p.get('day0Investigate').onclick();ok(!p.get('day0CoachNotice').classList.contains('hidden'),'First speech visible');
p.get('day0CoachClose').onclick();ok(p.get('day0CoachNotice').classList.contains('hidden'),'Speech dismissable');
p.get('day0Apply').onclick();ok(p.get('day0CoachNoticeText').textContent.includes('3→2'),'Second speech distinct');
p.get('day0Finish').onclick();ok(p.get('day0CoachNotice').classList.contains('hidden'),'Speech cleared on finish');
ok(!html.includes('負担度')&&html.includes('body .action.odd-action.odd-tier-1'),'Terminology and pale shrine CSS');
const bodies=new Set(),orders=new Set(),authors=new Set();
for(let i=0;i<100;i++){const x=boot();x.api.restart();x.api.setState({...x.api.getState(),policySeed:seed(i),complaintTickets:null,complaintSequence:0});const letters=x.api.getState().complaintTickets;
ok(letters.length===5&&[0,1,2,3].every(j=>letters.filter(x=>x.metric===j).length===(j===0?2:1)),'5 letters and categories');
ok(new Set(letters.map(x=>x.body)).size===5&&new Set(letters.map(x=>x.customer)).size===5,'Different letters and people');
ok(letters.some(x=>x.body.includes('見掛けない商品がありました'))&&letters.some(x=>x.body.includes('商店街の神社で商売繁盛を祈願したらどうですか')),'Both clues exist');
const y=boot(new Map([['f1-v10',JSON.stringify(x.api.getState())]]));ok(JSON.stringify(y.api.getState().complaintTickets)===JSON.stringify(letters),'Save preserves order and text');
bodies.add(letters.map(x=>x.body).join('|'));orders.add(letters.map(x=>x.metric).join(','));authors.add(letters.map(x=>x.customer).join('|'))}
ok(bodies.size>70&&orders.size>=8&&authors.size>20,'100 seeds vary');
let odd=0,normal=0;
for(let i=0;i<100;i++){const x=boot();x.api.restart();x.api.setState({...x.api.getState(),policySeed:seed(i),day:3,days:[{day:1,sales:50},{day:2,sales:50}],revenue:100,actionCounts:{productCheck:1,inspectBack:1},vals:[2,1,1,1],attraction:7,odd:0,complaintTickets:null,shrineOutcome:null,shrineRoll:null,jobs:[],finish:false,needsAdvance:false,last:null});
ok(x.api.availableIds().includes('audit'),'Shine available');x.api.play('audit');const s=x.api.getState(),roll=Math.floor(seed(i)*100/4294967296),branch=roll<30?'odd':'normal';ok(s.shrineRoll===roll&&s.shrineOutcome===branch,'Seed determines branch');
const y=boot(new Map([['f1-v10',JSON.stringify(s)]]));ok(y.api.getState().shrineOutcome===branch,'Branch survives load');y.api.resumeCurrent();y.api.advance();const result=y.api.getState();
ok(result.day===4&&result.attraction===8,'Next day completed');
if(branch==='odd'){odd++;ok(result.odd===1&&result.afterSales===18&&y.api.availableIds().includes('camera0'),'Odd followup exists')}else{normal++;ok(result.odd===0&&result.afterSales===0&&!y.api.availableIds().includes('camera0')&&result.vals[3]===1,'Normal prayer leaves no curse')}}
ok(odd>=23&&odd<=37&&odd+normal===100,'70:30 share');
console.log('PASS F1 v0198 '+checks+' checks; '+bodies.size+' letter layouts, '+orders.size+' orders, '+normal+'/'+odd+' shrine split');
