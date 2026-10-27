/* F1 v0.18 integrated photo scenario test (DOM model, not real browser).
   node f1/tests/v018_integration_regression.cjs
*/
'use strict';
const fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const photoScript=fs.readFileSync(path.join(__dirname,'..','store_scene_v018.js'),'utf8');
const gameScript=html.match(/<script>\s*(\(\(\)=>[\s\S]*?)<\/script>/)?.[1];
if(!gameScript)throw Error('Missing F1 game script');
let assertions=0;
const ok=(yes,why)=>{assertions++;if(!yes)throw Error('F1 v0.18 photo integration: '+why)};
function el(){
 const classes=new Set(['hidden']),attrs={};
 return {children:[],textContent:'',innerHTML:'',value:'',src:'',style:{},className:'',
  classList:{contains:x=>classes.has(x),add:(...a)=>a.forEach(t=>classes.add(t)),remove:(...a)=>a.forEach(t=>classes.delete(t)),
    toggle:(x,set)=>set?classes.add(x):classes.delete(x)},
  setAttribute:(x,v)=>{attrs[x]=v},getAttribute:x=>attrs[x]??null,
  append(...c){this.children.push(...c)},replaceChildren(...c){this.children=c},focus(){}};
}
function boot(){
 const dom=new Map(),storage=new Map(),win={};
 const doc={body:el(),createElement:el,getElementById:id=>{if(!dom.has(id))dom.set(id,el());return dom.get(id)}};
 const localStorage={getItem:x=>storage.get(x)??null,setItem:(x,v)=>storage.set(x,v)};
 new Function('window','module',photoScript)(win,{exports:{}});
 new Function('document','localStorage','window','scrollTo','confirm',gameScript)(doc,localStorage,win,()=>{},()=>true);
 return{get:doc.getElementById,api:win.__F1_DEBUG__,lib:win.F1StoreSceneV018};
}
const {get,api,lib}=boot();
api.restart();
ok(!!lib,'Photo resolver script loaded before the game');
ok(html.includes('<script src="./store_scene_v018.js"></script>'),'Main page loads the real module');
ok(get('storeImage').src.includes('/main-'),'DAY 1 uses the new fixed-camera main image');
ok(!get('storeImage').src.includes('main-improved-register'),'Installation image is not used in default photo');
api.setState({...api.getState(),day:2,odd:0,vals:[4,3,0,0],attraction:7});
ok(get('storeImage').src.endsWith('main-checkout-aisle-severe.webp'),'Two complaints select the correct composite panorama');
api.setState({...api.getState(),day:1,odd:0,vals:[2,0,0,0],attraction:7,discoveredActions:['register']});
ok(get('storeImage').src.endsWith('main-checkout-mild.webp'),'One mild complaint selects mild photo');
api.play('register');api.advance();
const after=api.getState();
ok(after.day===2,'DAY 2 is reached after selecting register upgrade');
ok(after.visuals.some(x=>x.id==='register'),'Register is actually completed at the next opening');
ok(get('transitionImage').src.endsWith('main-improved-register-added.webp'),'New counter appears in the one-time opening report');
ok(get('transitionImage').classList.contains('register-result'),'One-time photo has its own record-photo crop');
ok(get('transitionCaption').textContent.includes('写真は設備の記録'),'Installation result is described as an equipment record');
ok(!get('storeImage').src.includes('main-improved-register'),'Regular panorama never switches to fourth-counter picture');
ok(get('sceneMarkers').children.some(x=>x.textContent==='有人レジ増設済み'),'Permanent register status is visible in the scene');
api.closeTransition();
api.play('idle');api.advance();
ok(api.getState().day===3,'Second next-day report is reached');
ok(!get('transitionImage').classList.contains('register-result'),'Register-result photo does not repeat');
ok(!get('transitionImage').src.includes('main-improved-register'),'Next report uses normal store state');
ok(get('sceneMarkers').children.some(x=>x.textContent==='有人レジ増設済み'),'Register-installed state persists after the one-time photo');
api.closeTransition();
api.setState({...api.getState(),day:7,odd:3,finish:false,day8Active:false});
ok(!get('storeImage').src.includes('/main-'),'DAY 7 masquerading as normal continues to use legacy art');
api.setState({...api.getState(),day:2,odd:1,finish:false,day8Active:false});
ok(!get('storeImage').src.includes('/main-'),'Unusual route preserves original scene art');
api.setState({...api.getState(),day:2,odd:0,finish:false,day8Active:false,vals:[3,1,0,0]});
ok(get('storeImage').src.includes('/main-'),'Return to ordinary route uses the new panorama');
get('storeImage').onerror();
ok(get('storeImage').src.startsWith('./assets/')&&!get('storeImage').src.includes('/main-'),
 'Missing main WebP switches to an existing old store photo before SVG fallback');
ok(get('sceneCaption').textContent.includes('代替の店舗写真'),'Fallback is explained correctly');
console.log('PASS F1 v018 photo integration '+assertions+' assertions');
