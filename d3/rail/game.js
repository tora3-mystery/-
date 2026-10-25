/* CASE 0048 user interface: follows D3 pretest interaction model with independent data and artwork. */
(()=>{'use strict';
const L=globalThis.RailLogic,Art=globalThis.RailArt;
if(!L||!Art){document.body.textContent='必要なゲームファイルの読み込みに失敗しました。';return;}
const $=id=>document.getElementById(id);
const DISPLAY=['F','B','E','D','A','C'];
let selected=[...L.INITIAL],attempts=0,lastResult=null,pendingReplacement=null,history=[],hintLevel=0,lastFocus=null;
const nice={success:'繁栄',small:'小駅',bus:'バス',sealed:'封鎖'};
const HINTS=[
 '見た目の似た2本の「回送」を比較。ホーム柱の番号と、線路脇の進路記号を見てください。',
 '広報用の模型は実走の証拠になりません。旧1番線の使用終了と、新3番線の連動制御記録も照合してください。',
 '因果の鎖は「旧線終了」→「N-7の連動照合」→「新線で無旅客確認走行」→「最初の営業列車」です。'
];
function card(id){const r=L.RECORDS[id];return `<article class="record ${selected.includes(id)?'selected':''}"><div class="recordtop"><strong>${r.no}</strong><span class="tag">${selected.includes(id)?'採用中':'候補'}</span></div><div class="snapshot">${Art.photo(id)}</div><div class="recordname">${r.name}</div><div class="recordplace">2026 / 映像断片</div><div class="recordops"><button class="button secondary tiny" data-zoom="${id}" aria-label="${r.no}を拡大">拡大</button><button class="button ${selected.includes(id)?'ghost':'secondary'} tiny" data-toggle="${id}">${selected.includes(id)?'外す':selected.length===4?'入替':'採用'}</button></div></article>`}
function render(){
 $('records').innerHTML=DISPLAY.map(card).join('');
 $('slots').innerHTML=Array.from({length:4},(_,i)=>{const id=selected[i],r=id&&L.RECORDS[id];return id?`<div class="slot"><div class="slotNum">${i+1}</div><div class="slotname">${r.no}<small>${r.name}</small></div><div class="slotbuttons"><button class="iconBtn" data-up="${i}" aria-label="${r.no}を上へ" ${i===0?'disabled':''}>↑</button><button class="iconBtn" data-down="${i}" aria-label="${r.no}を下へ" ${i===selected.length-1?'disabled':''}>↓</button><button class="iconBtn remove" data-remove="${i}" aria-label="${r.no}を外す">×</button></div></div>`:`<div class="slot placeholder"><div class="slotNum">${i+1}</div><div class="slotname">写真を採用してください</div></div>`}).join('');
 $('selectionCount').textContent=`${selected.length} / 4`;$('simulate').disabled=selected.length!==4;
 $('records').querySelectorAll('[data-zoom]').forEach(b=>b.onclick=()=>showModal(b.dataset.zoom));
 $('records').querySelectorAll('[data-toggle]').forEach(b=>b.onclick=()=>{const id=b.dataset.toggle;
   if(selected.includes(id)){selected=selected.filter(x=>x!==id);pendingReplacement=null;selectionChanged();}
   else if(selected.length<4){selected.push(id);pendingReplacement=null;selectionChanged();}
   else showReplacement(id);
 });
 $('slots').querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>swap(Number(b.dataset.up),-1));
 $('slots').querySelectorAll('[data-down]').forEach(b=>b.onclick=()=>swap(Number(b.dataset.down),1));
 $('slots').querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{selected.splice(Number(b.dataset.remove),1);pendingReplacement=null;selectionChanged()});
}
function showReplacement(id){const r=L.RECORDS[id];pendingReplacement=id;const el=$('replacePanel');el.classList.remove('hidden');el.innerHTML=`<strong>${r.no}を採用します。どの写真と交換しますか？</strong><div class="choices">${selected.map((x,i)=>`<button data-replace="${i}" aria-label="${L.RECORDS[x].no}と交換">${L.RECORDS[x].no}</button>`).join('')}</div><button class="button ghost tiny" id="cancelReplace">キャンセル</button>`;
 el.querySelectorAll('[data-replace]').forEach(b=>b.onclick=()=>{selected[Number(b.dataset.replace)]=id;pendingReplacement=null;selectionChanged();});$('cancelReplace').onclick=()=>{pendingReplacement=null;el.classList.add('hidden')};}
function swap(i,dir){const j=i+dir;if(j<0||j>=selected.length)return;[selected[i],selected[j]]=[selected[j],selected[i]];pendingReplacement=null;selectionChanged()}
function selectionChanged(){render();if(!pendingReplacement)$('replacePanel').classList.add('hidden');$('status').textContent=selected.length===4?'4枚選択済み・未観測':'4枚に満たないため未確定';$('status').className='status';$('result-head').textContent='配置を変更しました';$('result-text').textContent='「この因果を確定・観測」を押すと、新しい2030年を計算します。';$('result-extra').textContent='観測映像は前回確定時の状態です。';$('trace').replaceChildren();$('end').classList.add('hidden');}
function showModal(id){const r=L.RECORDS[id];lastFocus=document.activeElement;$('modalTitle').textContent=r.no+'｜'+r.name;$('modalPhoto').innerHTML=Art.photo(id);$('modalPhoto').classList.remove('zoomed');$('modalPhoto').onclick=()=>{$('modalPhoto').classList.toggle('zoomed')};$('modalBody').innerHTML=`<strong>撮影位置：${r.location}</strong><ul>${r.clues.map(c=>`<li>${c}</li>`).join('')}</ul>`;$('modal').classList.remove('hidden');$('closeModal').focus();}
function closeModal(){if($('modal').classList.contains('hidden'))return;$('modal').classList.add('hidden');if(lastFocus?.isConnected)lastFocus.focus()}
function showFuture(r){const el=$('future');el.innerHTML=Art.future(r.world);el.classList.remove('observation-flash');void el.offsetWidth;el.classList.add('observation-flash');$('future-code').textContent=`観測：${L.WORLD_NAMES[r.world]}`;$('future-title').textContent=L.WORLD_NAMES[r.world];$('future-sub').textContent=r.head;}
function observe(){if(selected.length!==4)return;const r=L.classify(selected);attempts++;lastResult=r;showFuture(r);$('status').textContent=r.world==='success'?'因果復元・完全一致':'因果不一致を検出';$('status').className='status'+(r.world==='success'?' good':'');$('result-head').textContent=r.head;$('result-text').textContent=r.text;$('result-extra').textContent=r.evidence;$('trace').innerHTML=r.trace.map(t=>`<li>${t}</li>`).join('');history.unshift(`${attempts}. ${selected.map(id=>L.RECORDS[id].no).join('→')}：${nice[r.world]}`);history=history.slice(0,5);$('history').innerHTML=history.map(x=>`<span class="chip">${x}</span>`).join('');if(r.world==='success'){$('end').classList.remove('hidden');$('end').scrollIntoView({behavior:'smooth',block:'start'})}else $('end').classList.add('hidden');}
function reset(){selected=[...L.INITIAL];pendingReplacement=null;hintLevel=0;$('hintText').classList.add('hidden');$('hintText').textContent='';$('hintLevel').textContent='0 / 3';$('hintButton').disabled=false;$('replacePanel').classList.add('hidden');render();const r=L.classify(selected);showFuture(r);$('status').textContent='初期の改変履歴';$('status').className='status';$('result-head').textContent='敵国により確定した歴史';$('result-text').textContent='新線への進路照合が成立せず、旧線だけが使用終了。代替輸送が定着してしまった。';$('result-extra').textContent='履歴を再編集し、違う2030年を観測してください。';$('trace').innerHTML=r.trace.map(t=>`<li>${t}</li>`).join('');$('end').classList.add('hidden');}
$('start').onclick=()=>{$('intro').classList.add('hidden');$('game').classList.remove('hidden');$('restart').classList.remove('hidden');$('reference').innerHTML=Art.future('success');reset();$('game').scrollIntoView({behavior:'smooth',block:'start'});};
$('simulate').onclick=observe;$('reset').onclick=reset;
$('restart').onclick=()=>{reset();attempts=0;history=[];$('history').innerHTML='<span class="caption">まだありません</span>';$('game').scrollIntoView({behavior:'smooth'});};
$('endRestart').onclick=$('restart').onclick;
$('keepPlaying').onclick=()=>{$('end').classList.add('hidden');$('records').scrollIntoView({behavior:'smooth',block:'start'})};
$('toggleReference').onclick=()=>{const el=$('referenceWrap'),isHidden=el.classList.toggle('hidden');$('toggleReference').setAttribute('aria-expanded',String(!isHidden));$('toggleReference').textContent=isHidden?'本来の2030年と比較する':'本来の2030年を閉じる';};
$('hintButton').onclick=()=>{if(hintLevel>=3)return;$('hintText').classList.remove('hidden');$('hintText').textContent=HINTS[hintLevel++];$('hintLevel').textContent=`${hintLevel} / 3`;if(hintLevel===3)$('hintButton').disabled=true;};
$('closeModal').onclick=closeModal;$('modal').onclick=e=>{if(e.target===$('modal'))closeModal()};document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal()});
// QA hook exposes only deterministic functions; internal letter symbols are not visible on the UI.
globalThis.RAIL_QA=Object.freeze({classify:L.classify,allArrangements:L.allArrangements,getSelected:()=>[...selected],getAttempts:()=>attempts});
})();
