/* F1 v0.20.1 complaint database and deterministic shrine QA (DOM mock). */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const photo=fs.readFileSync(path.join(__dirname,'..','store_scene_v018.js'),'utf8');
const db=JSON.parse(fs.readFileSync(path.join(__dirname,'..','COMPLAINT_POLICY_DB_V020.json'),'utf8'));
const js=html.match(/<script>\s*(\(\(\)=>[\s\S]*?)<\/script>/)?.[1];
function element(){const c=new Set(['hidden']);return{children:[],textContent:'',innerHTML:'',className:'',style:{},classList:{add:(...v)=>v.forEach(x=>c.add(x)),remove:(...v)=>v.forEach(x=>c.delete(x)),contains:x=>c.has(x),toggle:(x,y)=>y?c.add(x):c.delete(x)},append(...v){this.children.push(...v)},replaceChildren(...v){this.children=v},focus(){},setAttribute(){},getAttribute(){return null}}}
function boot(mem=new Map()){const map=new Map(),win={},doc={body:element(),createElement:element,getElementById:id=>{if(!map.has(id))map.set(id,element());return map.get(id)}},store={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)};new Function('window','module',photo)(win,{exports:{}});new Function('document','localStorage','window','scrollTo','confirm',js.replace('window.__F1_DEBUG__=','window.__CATALOG__={options,F20_LATE_COMPLAINTS};window.__F1_DEBUG__='))(doc,store,win,()=>{},()=>true);return{api:win.__F1_DEBUG__,catalog:win.__CATALOG__,get:doc.getElementById,mem}}
let count=0;const ok=(x,why)=>{count++;if(!x)throw Error('v020 '+count+': '+why)};
const first=boot(),ids=new Set(db.actions.map(x=>x.id));
ok(db.actions.length===50&&first.catalog.options.length===50,'50 existing actions');
ok(JSON.stringify(db.actions.map(x=>x.id))===JSON.stringify(first.catalog.options.map(x=>x.id)),'Catalog action IDs match runtime');
ok(db.laterFreshPool.length===32&&JSON.stringify(db.laterFreshPool)===JSON.stringify(first.catalog.F20_LATE_COMPLAINTS),'32 late templates are synced');
for(const x of db.laterFreshPool){ok(x.body.includes(x.hint),'Actionable text exists');ok(x.actionIds.every(id=>ids.has(id)),'No invalid policy IDs')}
const combinations=new Map(),firstLayouts=new Set();
for(let seed=0;seed<400;seed++){const x=boot();x.api.setState({...x.api.getState(),policySeed:seed,complaintTickets:null});const letters=x.api.getState().complaintTickets;ok(letters.length===5,'Five first-day complaints');const key=String(letters.some(x=>x.body.includes('見掛けない商品')))+String(letters.some(x=>x.body.includes('商店街の神社')));combinations.set(key,(combinations.get(key)||0)+1);firstLayouts.add(letters.map(x=>x.body).join('|'))}
ok(combinations.size===4&&[...combinations.values()].every(n=>n>60&&n<140),'Both initial clues are optional and near-independent');
ok(firstLayouts.size>200,'Initial complaints vary across seeds');
const route=boot();route.api.setState({...route.api.getState(),policySeed:0,complaintTickets:null});
ok(!route.api.getState().complaintTickets.some(x=>x.body.includes('見掛けない商品')||x.body.includes('商店街の神社')),'No-clue seed');
const q=route.api.getState().complaintTickets.find(x=>x.body.includes('レジに20分並びました'));
ok(q&&route.api.focus(q.id,'レジに20分並びました'),'Normal policy is discoverable without clues');
function step(id){ok(route.api.availableIds().includes(id),'Must allow '+id);route.api.play(id);route.api.advance();if(!route.get('dayTransition').classList.contains('hidden'))route.api.closeTransition()}
step('pickup');
ok(route.api.focus('f19-product-review','見掛けない商品がありました'),'Product appears by DAY2');
ok(route.api.focus('f17-back-review','裏手の社の周りが暗く'),'Rear shrine appears by DAY2');
for(const id of ['productCheck','inspectBack','audit','camera0','open0'])step(id);
ok(route.api.getState().odd===3&&route.api.getState().shrineOutcome==='odd'&&route.api.getState().day===7,'No random roll after shrine');
step('idle');ok(route.api.getState().day8Active,'DAY8 is reachable with neither first-day clue');
const seen=new Set();
for(let day=2;day<=7;day++)for(let seed=0;seed<60;seed++){const x=boot(),s=x.api.getState();
x.api.setState({...s,day:day-1,policySeed:seed,complaintTickets:null,complaintSequence:0,
days:Array.from({length:day-2},(_,i)=>({day:i+1,sales:70})),revenue:(day-2)*70,vals:[1,1,1,1],attraction:9,dailyPostDays:[],finish:false,needsAdvance:false,actionCounts:{},last:null,jobs:[]});
x.api.play('idle');x.api.advance();if(!x.get('dayTransition').classList.contains('hidden'))x.api.closeTransition();
const state=x.api.getState(),letters=state.complaintTickets.filter(x=>x.day===day&&x.focusHint);
ok(letters.length===(day>=4?2:1),'Independent new letters per day');
for(const z of letters){ok(z.body.includes(z.focusHint.text),'Underlined phrase exists');seen.add(z.body)}
const again=boot(x.mem);again.api.resumeCurrent();ok(JSON.stringify(again.api.getState().complaintTickets)===JSON.stringify(state.complaintTickets),'Late letters preserve on reload')}
ok(seen.size===32,'All 32 late messages are reachable');
console.log('PASS F1 v020 '+count+' checks; '+firstLayouts.size+' initial layouts, '+seen.size+' late templates');
