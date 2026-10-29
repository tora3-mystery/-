"use strict";
/* S8 timetable puzzle alpha v0.1.0. Framework-free, deterministic seed, no external assets. */
const $ = id => document.getElementById(id);
const STORE = "s8_save_v010", BEST = "s8_best_v010_";
const DAYS = ["月","火","水","木","金","土"];
const FACULTIES = {
  humanities:{name:"文学系",desc:"自由度◎・レポート科目が豊富",risk:2},
  economics:{name:"経済・経営系",desc:"必修と選択のバランス型",risk:0},
  science:{name:"理工系",desc:"実験と前提科目が多い",risk:-2}
};
const ACTIVITIES = {
  none:{name:"学業専念",desc:"拘束なし／全科目の取得率+5%",blocks:[],bonus:0,modifier:5},
  club:{name:"音楽サークル",desc:"月5・水5を使用／レポート系+4%＆今期+250pt",blocks:["月5","水5"],bonus:250,modifier:0},
  job:{name:"塾講師バイト",desc:"火5・木5を使用／学期+400pt、取得率-4%",blocks:["火5","木5"],bonus:400,modifier:-4}
};
let state=null, facultyChoice="economics", activityChoice="none", filterChoice="all", focused=null, revealTimer=null, toastTimer=null;
const base=(id,name,credits,diff,method,slotSets,more={})=>({id,name,credits,diff,method,slotSets,...more});
const WEEK_1=[
 base("psych","心理学入門",2,2,"レポート",[["月3"],["木1"]],{rumor:"提出物を出せばかなり安定。",net:"採点は比較的ゆるいという声。"}),
 base("stats","統計学基礎",4,4,"試験",[["火2","木2"],["火3","金3"]],{rumor:"中間試験で一気に差がつく。",net:"毎週の演習がカギ。"}),
 base("pe","体育実習",2,1,"出席",[["水3","水4"],["火3","火4"]],{rumor:"欠席だけは厳しい。",net:"楽しいが2コマ塞がる。"}),
 base("film","映画と社会",2,2,"レポート",[["水1"],["月4"]],{lottery:60,rumor:"人気すぎて毎年抽選。",net:"授業は面白く落単は少ない。"}),
 base("it","情報リテラシー",2,1,"課題",[["金4"],["木4"]],{rumor:"課題を毎回出せば問題なし。",net:"PC作業中心の基礎科目。"}),
 base("law","法学概論",2,3,"試験",[["月4"],["火1"]],{rumor:"過去問が役立つ。",net:"試験範囲は広い。"}),
 base("eco","ミクロ経済学",2,4,"試験",[["木1"],["水2"]],{rumor:"グラフで躓く人が多い。",net:"理解すれば試験は解ける。"}),
 base("game","ゲーム理論入門",2,5,"試験",[["火3"],["金5"]],{rumor:"難しいけど得点は大きい。",net:"課題に計算問題が多い。"}),
 base("sat_soc","土曜の社会学",2,2,"出席",[["土2"]],{rumor:"土曜なので空席が多い。",net:"少人数で先生が丁寧。"}),
 base("sat_field","地域フィールドワーク",2,3,"レポート",[["土3","土4"]],{rumor:"休日を使う価値はある。",net:"現地調査とレポートが必要。"}),
 base("philo","哲学の問い",2,3,"レポート",[["火1"],["金1"]],{rumor:"自由記述の採点は読めない。",net:"興味がある人には人気。"}),
 base("design","デザイン思考",2,3,"課題",[["金5"],["水2"]],{lottery:72,rumor:"人気のグループワーク。",net:"抽選のため代替科目も必要。"}),
 base("eco_nature","環境と政策",2,2,"レポート",[["木4"],["火4"]],{rumor:"身近なテーマで書きやすい。",net:"毎回のミニレポート。"}),
 base("program","プログラミング入門",2,4,"課題",[["水2"],["月1"]],{rumor:"最後の課題が山場。",net:"演習時間が必要。"})
];
const WEEK_2=[
 base("psych2","社会心理学",2,3,"レポート",[["月3"],["木1"]],{rumor:"発表が少しある。",net:"毎週の提出物が大切。"}),
 base("data","データ分析演習",4,5,"課題",[["火2","木2"],["水2","金2"]],{prereq:"stats",rumor:"統計の基礎なしでは厳しい。",net:"取得できれば高評価。"}),
 base("sports2","スポーツ科学",2,2,"出席",[["水3","水4"],["火3","火4"]],{rumor:"連続授業の割に取得しやすい。",net:"実技もある。"}),
 base("media","メディア文化論",2,2,"レポート",[["水1"],["木4"]],{lottery:64,rumor:"抽選倍率が高い。",net:"映画と社会とは違う切り口。"}),
 base("office","データ整理実務",2,1,"課題",[["金4"],["月4"]],{rumor:"課題の難度は低め。",net:"毎回の操作練習が中心。"}),
 base("politics","公共政策",2,4,"試験",[["月4"],["火1"]],{rumor:"記述式が難しい。",net:"範囲が広いので計画学習を。"}),
 base("management","経営戦略入門",2,3,"レポート",[["木1"],["水2"]],{rumor:"事例分析が中心。",net:"発表の評価も入る。"}),
 base("ai","AI活用演習",2,5,"課題",[["火3"],["金5"]],{prereq:"program",rumor:"制作物の質を見られる。",net:"実践的だが時間を取られる。"}),
 base("sat_culture","土曜の文化人類学",2,2,"出席",[["土2"]],{rumor:"土曜ゆえ抽選なし。",net:"少人数でディスカッション。"}),
 base("sat_lab","まちづくり実習",2,4,"レポート",[["土3","土4"]],{rumor:"現地調査は楽しい。",net:"土曜がほぼ埋まる。"}),
 base("ethics","情報倫理",2,2,"レポート",[["火1"],["金1"]],{rumor:"身近なテーマで取り組みやすい。",net:"提出物中心。"}),
 base("startup","起業と実践",2,4,"課題",[["金5"],["水2"]],{lottery:74,rumor:"倍率が高く企画が大変。",net:"当たれば高得点候補。"}),
 base("sustain","サステナビリティ論",2,2,"レポート",[["木4"],["火4"]],{rumor:"短いレポートが多い。",net:"出席も重視。"}),
 base("web","Web制作入門",2,4,"課題",[["水2"],["月1"]],{prereq:"program",rumor:"作品提出で評価。",net:"慣れれば進めやすい。"})
];
const SPECIALS={
 humanities:[
  base("litA","日本文学散歩",2,3,"レポート",[["火4"],["土1"]],{rumor:"作品を読む量が多い。",net:"読書好きならおすすめ。"}),
  base("litB","創作演習",2,4,"課題",[["木3"],["土1"]],{rumor:"締切がかなり厳しい。",net:"提出した作品を講評。"})
 ],
 economics:[
  base("busA","マーケティング入門",2,3,"レポート",[["火4"],["土1"]],{rumor:"グループ課題あり。",net:"事例研究が好評。"}),
  base("busB","会計リテラシー",2,4,"試験",[["木3"],["土1"]],{rumor:"簿記の知識があると有利。",net:"計算問題は要練習。"})
 ],
 science:[
  base("sciA","化学演習",2,4,"試験",[["火4"],["土1"]],{rumor:"小テストが多い。",net:"演習量で差がつく。"}),
  base("sciB","ロボット基礎",2,5,"課題",[["木3"],["土1"]],{rumor:"工作課題に時間がかかる。",net:"難しいが人気は高い。"})
 ]
};
const MUST={
 humanities:[
  [base("writing1","文章表現基礎",2,2,"レポート",[["月2"]]),base("english1","英語Ⅰ",2,2,"試験",[["金2"]])],
  [base("writing2","基礎演習",2,3,"レポート",[["月2"]]),base("english2","英語Ⅱ",2,3,"試験",[["金2"]])]
 ],
 economics:[
  [base("econ1","経済学入門",2,3,"試験",[["月2"]]),base("english1","英語Ⅰ",2,2,"試験",[["金2"]]),base("academic1","大学基礎演習",2,2,"レポート",[["木3"]])],
  [base("econ2","マクロ経済学",2,4,"試験",[["月2"]]),base("english2","英語Ⅱ",2,3,"試験",[["金2"]]),base("academic2","データ読解基礎",2,3,"課題",[["木3"]])]
 ],
 science:[
  [base("math1","微積分Ⅰ",2,4,"試験",[["月2"]]),base("english1","英語Ⅰ",2,2,"試験",[["金2"]]),base("physics1","物理実験Ⅰ",2,4,"実験",[["水3","水4"]])],
  [base("math2","微積分Ⅱ",2,5,"試験",[["月2"]]),base("english2","英語Ⅱ",2,3,"試験",[["金2"]]),base("physics2","理科実験Ⅱ",2,4,"実験",[["水3","水4"]])]
 ]
};
function hashSeed(value){let h=2166136261;for(const c of value){h=Math.imul(h^c.charCodeAt(0),16777619)}return h>>>0}
function rand(){let t=state.rng+=0x6D2B79F5;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}
function pick(a){return a[Math.floor(rand()*a.length)]}
const index=s=>DAYS.indexOf(s[0])*5+Number(s.slice(1))-1;
const pretty=slots=>slots.map(x=>x[0]+"曜"+x.slice(1)+"限").join("＋");
const fmt=n=>Math.round(n).toLocaleString("ja-JP");
function courseMaterialize(x,term,required=false){const o={...x,slots:pick(x.slotSets).map(index),type:required?"required":"elective",campus:"中央キャンパス",canonicalId:x.id,term};delete o.slotSets;return o}
function getActivityBlocks(){return ACTIVITIES[state.activity].blocks.map(index)}
function occupied(){const result=new Map();for(const c of state.offers){if(c.type==="required"||state.selectedIds.includes(c.id))for(const pos of c.slots)result.set(pos,c)}return result}
function creditLoad(){return state.offers.filter(c=>c.type==="required"||state.selectedIds.includes(c.id)).reduce((n,c)=>n+c.credits,0)}
function allowed(c){if(c.type==="required")return {ok:false,reason:"必修科目は自動登録されています。"};if(state.selectedIds.includes(c.id))return {ok:true,reason:"登録済み。もう一度タップして解除できます。"};if(c.prereq&&!state.passedIds.includes(c.prereq))return {ok:false,reason:"前提科目の単位が必要です："+c.prereqName};if(creditLoad()+c.credits>14)return {ok:false,reason:"今期の登録上限14単位を超えます。"};const used=occupied(),blocks=getActivityBlocks();for(const p of c.slots){if(blocks.includes(p))return {ok:false,reason:"サークル・アルバイトの時間と重複します。"};if(used.has(p))return {ok:false,reason:"ほかの科目と時間割が重複します："+used.get(p).name}}return {ok:true,reason:"時間割に配置できます。"}}
function allRegistered(){return state.offers.filter(c=>c.type==="required"||state.selectedIds.includes(c.id))}
function passChance(c){let p=99-(c.diff-1)*10+FACULTIES[state.faculty].risk+ACTIVITIES[state.activity].modifier;if(state.activity==="club"&&c.method==="レポート")p+=4;p-=Math.max(0,creditLoad()-10)*2;if(c.slots.some(s=>Math.floor(s/5)===5))p+=3;return Math.min(98,Math.max(40,p))}
function points(c,combo){return Math.round(c.credits*(120+55*c.diff)*(1+Math.min(9,combo-1)*.2))+(c.slots.some(s=>Math.floor(s/5)===5)?120:0)}
function save(){try{localStorage.setItem(STORE,JSON.stringify(state))}catch(e){/* private mode */}}
function createOffers(){const term=state.semester;const mand=MUST[state.faculty][term].map(x=>courseMaterialize(x,term,true));const opts=(term===0?WEEK_1:WEEK_2).concat(SPECIALS[state.faculty]).filter(x=>!state.passedIds.includes(x.id)).map(x=>courseMaterialize(x,term));for(const c of opts){if(c.prereq)c.prereqName={"stats":"統計学基礎","program":"プログラミング入門"}[c.prereq]||c.prereq}
if(term===1){const blocked=new Set(mand.flatMap(c=>c.slots).concat(getActivityBlocks()));for(const f of state.failedRequired){let list=[];for(let d=0;d<6;d++)for(let p=0;p<5;p++){let pos=d*5+p;if(!blocked.has(pos))list.push(pos)}const positions=f.slots.length>1?list.filter(pos=>pos%5<4&&!blocked.has(pos+1)).map(pos=>[pos,pos+1]):list.map(pos=>[pos]);if(!positions.length)continue;const slots=pick(positions);opts.unshift({...f,id:"retry_"+f.canonicalId,type:"retake",slots,term,rumor:"先輩「今度こそ取り切ろう」",net:"未取得必修は今学期中に再挑戦できる。"});}}
state.offers=mand.concat(opts);state.selectedIds=[];state.results=[];state.revealIndex=0;state.termScore=0;state.currentCombo=0;state.phase="registration";save()}
function textNode(el,text){el.textContent=String(text)}
function displayIntro(){ $("intro").classList.remove("hidden");$("game").classList.add("hidden");$("ending").classList.add("hidden");const fp=$("faculty-picker"),ap=$("activity-picker");fp.innerHTML="";ap.innerHTML="";
for(const [key,v] of Object.entries(FACULTIES)){const b=document.createElement("button");b.className="choose"+(key===facultyChoice?" active":"");b.innerHTML="<b>"+v.name+"</b><small>"+v.desc+"</small>";b.onclick=()=>{facultyChoice=key;displayIntro()};fp.append(b)}
for(const [key,v] of Object.entries(ACTIVITIES)){const b=document.createElement("button");b.className="choose"+(key===activityChoice?" active":"");b.innerHTML="<b>"+v.name+"</b><small>"+v.desc+"</small>";b.onclick=()=>{activityChoice=key;displayIntro()};ap.append(b)}
$("resume-btn").classList.toggle("hidden",!hasSaved())}
function hasSaved(){try{return !!localStorage.getItem(STORE)}catch(e){return false}}
function start(sameSeed){const seed=sameSeed||$("seed-input").value.trim()||String(Math.floor(Math.random()*1e9));state={version:"0.1.0",faculty:facultyChoice,activity:activityChoice,seed,rng:hashSeed(seed),semester:0,phase:"registration",offers:[],selectedIds:[],results:[],revealIndex:0,credits:0,score:0,termScore:0,passedIds:[],failedRequired:[],currentCombo:0,maxCombo:0,perfectTerms:0,history:[]};createOffers();render()}
function resume(){try{const s=JSON.parse(localStorage.getItem(STORE));if(!s||s.version!=="0.1.0"||!FACULTIES[s.faculty]||!ACTIVITIES[s.activity]||s.semester>1)throw Error("incompatible");state=s;render();if(state.phase==="reveal")playReveal()}catch(e){showToast("保存データを復元できませんでした。");localStorage.removeItem(STORE);displayIntro()}}
function render(){if(!state)return;$("intro").classList.add("hidden");$("game").classList.toggle("hidden",state.phase==="end");$("ending").classList.toggle("hidden",state.phase!=="end");if(state.phase==="end"){renderEnd();return}
$("semester-label").textContent="1年"+(state.semester===0?"前期":"後期")+" / 2学期試作";$("faculty-label").textContent=FACULTIES[state.faculty].name+" · "+ACTIVITIES[state.activity].name+" · SEED "+state.seed;
$("total-credits").textContent=state.credits;$("total-score").textContent=fmt(state.score);
$("current-credits").textContent=creditLoad()+" / 14";
$("schedule-hint").textContent=state.failedRequired.length?"未取得必修："+state.failedRequired.map(c=>c.name).join("、")+"（再履修は選択科目から）":"必修は青。科目をタップすると占有マスを一度に確認できます。";
$("summary-line").textContent="登録 "+allRegistered().length+"科目／"+creditLoad()+"単位　·　目安：10単位以上で履修確定";
$("register-btn").disabled=creditLoad()<10||state.phase!=="registration";
$("register-btn").textContent=creditLoad()<10?"あと"+(10-creditLoad())+"単位で確定可能":"履修を確定する →";
$("clear-btn").disabled=state.selectedIds.length===0;
renderGrid($("timetable-grid"),true);renderCourses();
$("reveal").classList.toggle("hidden",state.phase!=="reveal");if(state.phase==="reveal")renderReveal();
}
function gradeFor(id){const r=state.results.find(x=>x.id===id);return r&&state.results.indexOf(r)<state.revealIndex?r:null}
function renderGrid(target,interactive){target.innerHTML="";const add=(cls,txt)=>{const d=document.createElement("div");d.className="cell "+cls;const sp=document.createElement("span");sp.className="cn";sp.textContent=txt;d.append(sp);target.append(d);return d};
add("corner","");for(const day of DAYS)add("day"+(day==="土"?" sat":""),day);
const used=occupied(),act=getActivityBlocks();let pre=null,valid=null;if(interactive&&focused){pre=state.offers.find(c=>c.id===focused);if(pre&&pre.type!=="required"&&!state.selectedIds.includes(pre.id))valid=allowed(pre).ok}
for(let p=0;p<5;p++){add("period",p+1+"限");for(let d=0;d<6;d++){const cell=d*5+p,c=used.get(cell),isBlock=act.includes(cell);let cls=c?(c.type==="required"?"required":"optional"):isBlock?"activity":"empty";if(pre&&pre.slots.includes(cell)&&!state.selectedIds.includes(pre.id))cls+=" "+(valid?"preview":"invalid");const r=c?gradeFor(c.id):null;if(r)cls+=" "+(r.pass?"passed":"failed");const x=add(cls,c?c.name:isBlock?(state.activity==="club"?"サークル":"バイト"):"");if(c){const sm=document.createElement("span");sm.className="small";sm.textContent=r?(r.pass?"✓ 単位GET":"× "+(r.lotteryLost?"抽選落ち":"落単")):c.slots.length>1?"セット "+c.slots.length+"コマ":c.credits+"単位";x.append(sm);if(interactive)x.onclick=()=>openCourse(c.id)}else if(isBlock){x.title="固定の課外活動";}if(interactive&&pre&&pre.slots.includes(cell)){x.title=valid?"このコマを使用":"重複のため登録不可"}}}
}
function courseDescription(c){const status=allowed(c),saturday=c.slots.some(x=>Math.floor(x/5)===5);return {status,slot:pretty(c.slots.map(p=>DAYS[Math.floor(p/5)]+(p%5+1))),chance:passChance(c),base:points(c,1),saturday}}
function renderCourses(){const list=$("course-list");list.innerHTML="";const opts=state.offers.filter(c=>c.type!=="required");let show=opts.filter(c=>filterChoice==="all"||filterChoice==="safe"&&passChance(c)>=82||filterChoice==="high"&&c.diff>=4||filterChoice==="fit"&&(state.selectedIds.includes(c.id)||allowed(c).ok));
show.sort((a,b)=>Number(state.selectedIds.includes(b.id))-Number(state.selectedIds.includes(a.id)));$("available-counter").textContent=opts.filter(c=>allowed(c).ok&&!state.selectedIds.includes(c.id)).length+"科目が登録可能";
for(const c of show){const x=courseDescription(c),sel=state.selectedIds.includes(c.id),item=document.createElement("button");item.className="course"+(sel?" selected":"")+(x.status.ok||sel?"":" disabled");item.innerHTML='<span><span class="course-name"></span><span class="course-meta"></span><span class="course-extra"></span></span><span class="pill"></span>';item.querySelector(".course-name").textContent=(sel?"✓ ":"")+c.name;item.querySelector(".course-meta").textContent=x.slot+"　· "+c.credits+"単位 · 難度"+c.diff;item.querySelector(".course-extra").textContent=(c.type==="retake"?"【再履修】 ":"")+"取得目安"+x.chance+"% · 基礎"+fmt(x.base)+"pt";const badge=item.querySelector(".pill");badge.textContent=sel?"登録済":c.prereq&&!state.passedIds.includes(c.prereq)?"前提未取得":c.lottery?"抽選"+c.lottery+"%":x.status.ok?"空きあり":"登録不可";badge.className="pill "+(sel?"ok":!x.status.ok?"ng":c.lottery?"lottery":"");item.onclick=()=>openCourse(c.id);list.append(item)}
if(!show.length){const p=document.createElement("p");p.className="smallhint";p.textContent="条件に合う科目はありません。";list.append(p)}
}
function closeDrawer(){focused=null;$("course-drawer").classList.add("hidden");renderGrid($("timetable-grid"),true)}
function openCourse(id){if(state.phase!=="registration")return;focused=id;const c=state.offers.find(x=>x.id===id);if(!c)return;const d=courseDescription(c),selected=state.selectedIds.includes(id),mandatory=c.type==="required";
$("drawer-kind").textContent=mandatory?"必修 / 自動登録":c.type==="retake"?"必修再履修":"選択科目";$("drawer-title").textContent=c.name;
const tags=[c.credits+"単位","難度 ★".repeat(0)+"★".repeat(c.diff)+"☆".repeat(5-c.diff),c.slots.length>1?(c.slots.every((x,i,a)=>i===0||x===a[i-1]+1)?"連続":"週2セット"):"週1コマ",c.lottery?"抽選科目":"先着なし"];
$("drawer-tags").innerHTML=tags.map(t=>"<span>"+t+"</span>").join("");
const infos=[["曜日・時限",d.slot],["キャンパス",c.campus],["履修対象","1年生"],["成績評価",c.method],["単位取得目安",d.chance+"%"+(c.lottery?"（当選時）":"")],["基本スコア",fmt(d.base)+" pt"],["前提科目",c.prereqName||"なし"],["抽選",c.lottery?("当選率"+c.lottery+"%"):"なし"],["正式情報 / シラバス","単位・時限・評価方式は登録上の確定情報です。"],["先輩の噂（非公式）",c.rumor||"「必修なので早めに取ろう」"],["ネットの声（非公式）",c.net||"「毎週の復習が大切」"]];
$("drawer-detail").innerHTML="";for(const [lab,val] of infos){const e=document.createElement("div");e.className="info"+(lab.includes("情報")||lab.includes("噂")||lab.includes("ネット")?" wide":"");const b=document.createElement("b");b.textContent=lab;const v=document.createElement("span");v.textContent=val;e.append(b,v);$("drawer-detail").append(e)}
$("drawer-message").textContent=mandatory?"必修科目は解除できません。":selected?"すでに配置済みです。解除すると空きマスが戻ります。":d.status.reason;
$("drawer-message").className="drawer-message"+(!d.status.ok&&!mandatory&&!selected?" error":"");
$("drawer-action").disabled=mandatory||(!selected&&!d.status.ok);$("drawer-action").textContent=mandatory?"必修は自動登録":selected?"この科目を解除":"この科目を登録 →";
$("drawer-action").onclick=()=>{if(mandatory)return;if(selected){state.selectedIds=state.selectedIds.filter(x=>x!==id);showToast("履修を解除しました")}else{const res=allowed(c);if(!res.ok){showToast(res.reason);return}state.selectedIds.push(id);showToast(c.slots.length>1?"セット科目を"+c.slots.length+"コマ登録！":"時間割に登録！")}save();closeDrawer();render()};
$("course-drawer").classList.remove("hidden");renderGrid($("timetable-grid"),true)}
function showToast(msg){const e=$("toast");e.textContent=msg;e.classList.remove("hidden");clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.add("hidden"),1700)}
function beginReveal(){if(creditLoad()<10)return;state.results=[];state.revealIndex=0;state.termScore=0;state.currentCombo=0;
const ordered=allRegistered().slice().sort((a,b)=>Math.min(...a.slots)-Math.min(...b.slots));
for(const c of ordered){const lotteryLost=!!c.lottery&&rand()*100>=c.lottery;const pass=!lotteryLost&&rand()*100<passChance(c);state.results.push({id:c.id,name:c.name,pass,lotteryLost,credits:c.credits,required:c.type==="required"||c.type==="retake",canonicalId:c.canonicalId,course:c,earned:0,combo:0})}
state.phase="reveal";save();render();playReveal()}
function renderReveal(){const term=state.semester===0?"前期":"後期";$("reveal-title").textContent="1年"+term+" 成績発表";$("reveal-score").textContent=fmt(state.termScore)+" pt";$("reveal-bar").style.width=Math.round(100*state.revealIndex/Math.max(1,state.results.length))+"%";
const log=$("reveal-log");log.innerHTML="";for(let i=0;i<state.revealIndex;i++){const r=state.results[i];const row=document.createElement("div");row.className="reveal-row "+(r.pass?"good":"bad");row.append(Object.assign(document.createElement("span"),{textContent:r.name}),Object.assign(document.createElement("b"),{textContent:r.pass?"単位GET！ +"+fmt(r.earned):r.lotteryLost?"抽選落ち":"落単"}));log.append(row)}log.scrollTop=log.scrollHeight;
$("skip-btn").classList.toggle("hidden",state.revealIndex>=state.results.length);$("next-btn").classList.toggle("hidden",state.revealIndex<state.results.length);
$("next-btn").textContent=state.semester===0?"次の学期へ →":"1年次リザルトを見る →";
let mini=$("reveal-mini");if(!mini){mini=document.createElement("div");mini.id="reveal-mini";mini.className="time-grid mini-grid";$("reveal-sub").before(mini)}renderGrid(mini,false)}
function playReveal(){if(!state||state.phase!=="reveal")return;clearTimeout(revealTimer);if(state.revealIndex===state.results.length){endReveal();return}revealTimer=setTimeout(()=>{stepReveal();if(state.phase==="reveal"&&state.revealIndex<state.results.length)playReveal()},430)}
function stepReveal(){const r=state.results[state.revealIndex];if(!r)return;
if(r.lotteryLost){$("reveal-flash").textContent="抽選落ち";$("reveal-flash").className="reveal-flash fail";$("reveal-combo").textContent="";$("reveal-sub").textContent=r.name+" / 登録できませんでした";}
else if(r.pass){state.currentCombo++;state.maxCombo=Math.max(state.maxCombo,state.currentCombo);r.combo=state.currentCombo;r.earned=points(r.course,r.combo);state.score+=r.earned;state.termScore+=r.earned;state.credits+=r.credits;if(!state.passedIds.includes(r.canonicalId))state.passedIds.push(r.canonicalId);if(r.required)state.failedRequired=state.failedRequired.filter(f=>f.canonicalId!==r.canonicalId);$("reveal-flash").textContent="単位GET！";$("reveal-flash").className="reveal-flash success";$("reveal-combo").textContent=state.currentCombo>=2?state.currentCombo+" COMBO! ×"+(1+Math.min(9,state.currentCombo-1)*.2).toFixed(1):"";$("reveal-sub").textContent=r.name+"　+"+fmt(r.earned)+" pt";}
else{state.currentCombo=0;if(r.required&&!state.failedRequired.some(x=>x.canonicalId===r.canonicalId))state.failedRequired.push(r.course);$("reveal-flash").textContent="落単！";$("reveal-flash").className="reveal-flash fail";$("reveal-combo").textContent="COMBO BREAK";$("reveal-sub").textContent=r.name+"　再挑戦を検討しよう。"}
const fx=$("reveal-flash");fx.classList.remove("burst");void fx.offsetWidth;fx.classList.add("burst");state.revealIndex++;save();renderReveal();if(state.revealIndex===state.results.length)endReveal()}
function endReveal(){if(!state||state.phase!=="reveal"||state.revealIndex!==state.results.length)return;clearTimeout(revealTimer);if(!state.history.some(x=>x.term===state.semester)){const passes=state.results.filter(x=>x.pass);const perfect=state.results.every(x=>x.pass);let bonus=0;if(perfect){bonus+=650;state.perfectTerms++}if(state.activity==="club"&&passes.length>=3)bonus+=250;if(state.activity==="job"&&passes.reduce((n,x)=>n+x.credits,0)>=6)bonus+=400;state.score+=bonus;state.termScore+=bonus;state.history.push({term:state.semester,passes:passes.length,total:state.results.length,credits:passes.reduce((n,x)=>n+x.credits,0),score:state.termScore,perfect,bonus});$("reveal-flash").textContent=perfect?"PERFECT SEMESTER!":"RESULT COMPLETE";$("reveal-flash").className="reveal-flash "+(perfect?"success":"");$("reveal-sub").textContent=passes.length+"/"+state.results.length+"科目取得 · "+(bonus?"学期ボーナス +"+fmt(bonus)+" pt":"成績確定");$("reveal-combo").textContent=perfect?"ALL CLEAR!":"MAX COMBO "+state.maxCombo;save()}
renderReveal();}
function revealAll(){clearTimeout(revealTimer);while(state.phase==="reveal"&&state.revealIndex<state.results.length)stepReveal();endReveal()}
function advance(){clearTimeout(revealTimer);if(state.phase!=="reveal"||state.revealIndex<state.results.length)return;if(state.semester===0){state.semester=1;createOffers();render();window.scrollTo(0,0)}else{state.phase="end";save();render();window.scrollTo(0,0)}}
function renderEnd(){let best=0;try{best=Number(localStorage.getItem(BEST+state.faculty))||0}catch(e){}const record=state.score>best;if(record){try{localStorage.setItem(BEST+state.faculty,String(state.score))}catch(e){}}
const grade=state.score>=12000?"S":state.score>=9000?"A":state.score>=6500?"B":"C";
$("ending-content").innerHTML='<h2>'+(record?"NEW HIGH SCORE!":"1年次 修了")+'</h2><div class="hero-score">'+fmt(state.score)+' pt</div><p>総合評価 <strong>'+grade+'</strong>　·　'+FACULTIES[state.faculty].name+'</p><div class="ending-stats"><div><small>取得単位</small><b>'+state.credits+'単位</b></div><div><small>最大コンボ</small><b>'+state.maxCombo+' COMBO</b></div><div><small>PERFECT学期</small><b>'+state.perfectTerms+' / 2</b></div><div><small>過去のベスト</small><b>'+fmt(Math.max(best,state.score))+' pt</b></div></div><p>'+ (state.failedRequired.length?"未取得必修："+state.failedRequired.map(x=>x.name).join("・"):"必修の未取得はありません。")+'</p><p class="smallhint">SEED '+state.seed+' ／ 2学期分のスコア。卒業判定は未実装。</p>';
}
function registerHandlers(){$("begin-btn").onclick=()=>start();$("resume-btn").onclick=resume;$("drawer-close").onclick=closeDrawer;$("drawer-scrim").onclick=closeDrawer;$("clear-btn").onclick=()=>{state.selectedIds=[];save();render();showToast("選択科目を解除しました")};$("register-btn").onclick=beginReveal;$("skip-btn").onclick=revealAll;$("next-btn").onclick=advance;$("retry-btn").onclick=()=>{state=null;localStorage.removeItem(STORE);$("seed-input").value="";displayIntro();window.scrollTo(0,0)};$("same-seed-btn").onclick=()=>{facultyChoice=state.faculty;activityChoice=state.activity;start(state.seed);window.scrollTo(0,0)};document.querySelectorAll(".filter").forEach(b=>b.onclick=()=>{filterChoice=b.dataset.filter;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderCourses()});document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("course-drawer").classList.contains("hidden"))closeDrawer()})}
registerHandlers();displayIntro();
