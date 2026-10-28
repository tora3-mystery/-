/* F1 v0.20.6: test discovery limits across an entire customer comment.
 * Pure DOM model. Real browser/mobile testing is a separate gate.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const photo=fs.readFileSync(path.join(__dirname,'..','store_scene_v018.js'),'utf8');
const db=JSON.parse(fs.readFileSync(path.join(__dirname,'..','COMPLAINT_POLICY_DB_V020.json'),'utf8'));
const js=html.match(/<script>\s*(\(\(\)=>[\s\S]*?)<\/script>/)?.[1];
if(!js)throw Error('Missing game JavaScript');
function elem(){const flags=new Set(['hidden']),attrs={};return{children:[],style:{},textContent:'',innerHTML:'',className:'',src:'',
 classList:{contains:k=>flags.has(k),add:(...k)=>k.forEach(v=>flags.add(v)),remove:(...k)=>k.forEach(v=>flags.delete(v)),toggle:(k,v)=>v?flags.add(k):flags.delete(k)},
 append(...c){this.children.push(...c)},replaceChildren(...c){this.children=c},setAttribute:(k,v)=>attrs[k]=v,getAttribute:k=>attrs[k]??null,focus(){}}}
function boot(memory=new Map()){const nodes=new Map(),window={},document={body:elem(),createElement:elem,getElementById:id=>{if(!nodes.has(id))nodes.set(id,elem());return nodes.get(id)}};
 const storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
 new Function('window','module',photo)(window,{exports:{}});
 new Function('document','localStorage','window','scrollTo','confirm',js.replace('window.__F1_DEBUG__=',
  'window.__F1_DISCOVERY_AUDIT__={focusSegments,F17_SNIPPETS,F20_LATE_COMPLAINTS};window.__F1_DEBUG__='))(document,storage,window,()=>{},()=>true);
 return {api:window.__F1_DEBUG__,logic:window.__F1_DISCOVERY_AUDIT__,get:document.getElementById,memory}}
let checks=0;function ok(x,why){checks++;if(!x)throw Error('F1 v0206 #'+checks+': '+why)}
const x=boot(),known=new Set(db.actions.map(a=>a.id));
ok(db.discoveryLimits?.maxPoliciesPerUnderline===2,'Max two policies per underline in DB');
ok(db.discoveryLimits?.maxPoliciesPerComplaint===3,'Max three policies per whole customer letter in DB');
ok(db.discoveryLimits?.randomExtraPolicy===false,'Extra seeded policy is off');
ok(db.discoveryRules.length===23,'Phrase-specific mapping has 23 groups');
const allTargets=new Set();
for(const row of db.discoveryRules){ok(row.actionIds.length>=1&&row.actionIds.length<=2,'Phrase maps to one/two IDs');for(const id of row.actionIds){ok(known.has(id),'Rule references real action');allTargets.add(id)}}
for(const row of db.laterFreshPool){ok(row.actionIds.length>=1&&row.actionIds.length<=2,'Late template maps to one/two IDs');ok(row.body.includes(row.hint),'Clickable hint exists');for(const id of row.actionIds){ok(known.has(id),'Late rule references real action');allTargets.add(id)}}
ok(known.size===50&&allTargets.size===46,'All ordinary policies remain discoverable');
ok(['audit','camera0','open0','removeShrine'].every(id=>known.has(id)&&!allTargets.has(id)),'Four condition-gated policies stay separate');
function validate(ticket){const parts=x.logic.focusSegments(ticket),all=parts.flatMap(p=>p.ids);
 ok(all.length<=3,'Whole complaint budget');ok(parts.every(p=>p.ids.length>=1&&p.ids.length<=2),'Per underline budget');
 ok(new Set(all).size===all.length,'Do not unlock same policy twice in one letter');
 for(const p of parts){ok(ticket.body.slice(p.start,p.end)===p.text,'Underline matches exact text');ok(p.ids.every(id=>known.has(id)),'Real policy only')}}
for(const pool of db.initialComplaintPool)for(const body of pool.variants)validate({metric:pool.metric,body});
for(const pool of db.laterGeneralPool)for(const body of pool.variants)validate({metric:pool.metric,body});
for(const row of db.actionSideEffectComments)validate({metric:row.metric,body:row.body});
for(const row of db.laterFreshPool)validate({metric:row.metric,body:row.body,focusHint:{text:row.hint,ids:row.actionIds}});
let arrangements=new Set();
for(let seed=0;seed<250;seed++){
 const a=boot();a.api.restart();a.api.setState({...a.api.getState(),policySeed:seed,complaintTickets:null});
 const letters=a.api.getState().complaintTickets;for(const letter of letters)validate(letter);
 arrangements.add(letters.map(t=>t.body).join('|'));
}
ok(arrangements.size>170,'Seeded initial complaints retain variety');
const custom={id:'two-underline',metric:0,body:'昨日はレジに20分並びました。通路まで列が伸びていて、カートが通れませんでした。',customer:'テスト',day:1,status:'open',replies:[]};
const parts=x.logic.focusSegments(custom);
ok(parts.length===2&&parts[0].ids.length===2&&parts[1].ids.length===1,'Two underlines share a total budget of three');
const app=boot();app.api.setState({...app.api.getState(),complaintTickets:[custom],focusHistory:[],focusKeys:[],focusDay:0,discoveredActions:[],randomBonusIds:[],randomBonusDays:[]});
ok(app.api.focus(custom.id,parts[1].text),'Second underline can be examined first');
ok(app.api.focus(custom.id,parts[0].text),'First underline can be examined next');
ok(app.api.getState().discoveredActions.length===3,'Two taps reveal exactly three policies, never four');
ok(app.api.getState().randomBonusIds.length===0,'No extra policy lottery');
const persisted=boot(app.memory);persisted.api.resumeCurrent();
ok(JSON.stringify(persisted.api.getState().discoveredActions)===JSON.stringify(app.api.getState().discoveredActions),'Discovered policies preserved after reload');
ok(persisted.api.focus(custom.id,parts[0].text)&&persisted.api.getState().discoveredActions.length===3,'Repeat does not create new discovery');
for(let i=0;i<100;i++){
 const t=boot();t.api.setState({...t.api.getState(),policySeed:i,complaintTickets:[custom],focusHistory:[],focusKeys:[],focusDay:0,discoveredActions:[],randomBonusIds:[]});
 ok(t.api.focus(custom.id,parts[0].text),'Tap available for all seeds');
 ok(t.api.getState().discoveredActions.length===2&&t.api.getState().randomBonusIds.length===0,'No hidden bonus from any seed');
}
console.log('PASS F1 v0206: '+checks+' checks, '+arrangements.size+' initial arrangements, 46/50 standard discovery targets');
