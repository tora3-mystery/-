"use strict";
/* S8 v0.3.0 — feature layer. Loaded immediately after game.js, no external dependencies. */
(function(){
const SAVE3="s8_save_v030", BEST3="s8_best_v030_", AUDIO3="s8_audio_v030";
let audio=null, soundOn=true, searchText="", currentSlot=null, finishedSemester=-1;
try{soundOn=localStorage.getItem(AUDIO3)!=="off"}catch(e){}
Object.assign(ACTIVITIES,{
 sports:{name:"体育会系（難）",desc:"火5・金5・土3／取得率-7%、学期+1200pt",blocks:["火5","金5","土3"],bonus:1200,modifier:-7},
 combo:{name:"サークル＋バイト（激難）",desc:"月5・水5・火5・木5／取得率-9%、学期+1500pt",blocks:["月5","水5","火5","木5"],bonus:1500,modifier:-9}
});
const C=(id,name,credits,diff,method,slotSets,more={})=>base(id,name,credits,diff,method,slotSets,more);
const EXTRA=[
 C("anthro","文化人類学入門",2,2,"レポート",[["月1"],["土4"]],{rumor:"身近な題材が多い。",net:"毎週の短いレポート。"}),
 C("urban","都市と住まい",2,3,"レポート",[["火4"],["木2"]],{rumor:"街歩きの課題がある。",net:"観察が得点のカギ。"}),
 C("logic","論理と思考",2,4,"試験",[["水1"],["金3"]],{rumor:"小テストで鍛えられる。",net:"論証が難しい。"}),
 C("music","音楽と文化",2,2,"レポート",[["月5"],["土1"]],{rumor:"音楽好きなら楽しい。",net:"感想文の質を見られる。"}),
 C("food","食文化論",2,2,"レポート",[["火1"],["土5"]],{lottery:65,rumor:"抽選が厳しめ。",net:"レポート中心。"}),
 C("climate","気象と環境",2,4,"試験",[["金1"],["月3"]],{rumor:"計算問題もある。",net:"出席で理解が進む。"}),
 C("human","行動科学",2,4,"試験",[["木2"],["金3"]],{rumor:"試験は思考力勝負。",net:"先輩に人気。"}),
 C("art","アートリサーチ",2,3,"課題",[["水5"],["土3"]],{rumor:"制作発表が中心。",net:"作品を作る。"}),
 C("history","現代史を読む",2,2,"レポート",[["月1"],["木5"]],{rumor:"歴史好きには易しい。",net:"読書量がポイント。"}),
 C("finance","金融のしくみ",2,4,"試験",[["火4"],["木1"]],{rumor:"数字が苦手だと大変。",net:"市場の話が多い。"}),
 C("bio","生命科学入門",2,3,"試験",[["水1"],["金4"]],{rumor:"用語が多い。",net:"暗記と理解。"}),
 C("negotiation","交渉学",2,4,"課題",[["木5"],["火3"]],{lottery:70,rumor:"グループワークが白熱。",net:"実演が多い。"}),
 C("englishTalk","英会話ワークショップ",2,3,"出席",[["金1"],["土1"]],{rumor:"出席が基本。",net:"会話中心。"}),
 C("robot","ロボットと社会",2,4,"レポート",[["木2"],["月5"]],{rumor:"倫理も学ぶ。",net:"論文を読む。"}),
 C("field","観察実習",2,3,"課題",[["土1","土2"],["木4","木5"]],{rumor:"現場に出る。",net:"連続授業に注意。"}),
 C("world","世界の宗教",2,3,"レポート",[["火2"],["金3"]],{rumor:"比較文化がテーマ。",net:"記述中心。"}),
 C("sportTheory","スポーツ心理学",2,3,"試験",[["水2"],["土5"]],{rumor:"運動しない授業。",net:"試験は意外と難しい。"}),
 C("program2","実践プログラミング",2,5,"課題",[["火4"],["土2"]],{prereq:"program",rumor:"課題が重い。",net:"継続学習が必要。"}),
 C("statistics2","多変量解析",2,5,"試験",[["水1"],["土4"]],{prereq:"stats",rumor:"数式が多い。",net:"統計の発展科目。"}),
 C("entre","ビジネス実験",2,5,"課題",[["月5"],["木4"]],{prereq:"busA",rumor:"試作品を作る。",net:"発表が多い。"}),
 C("writingAdv","文章表現実践",2,4,"レポート",[["土4"],["月1"]],{prereq:"writing1",rumor:"書く量が多い。",net:"添削が丁寧。"}),
 C("marine","海洋環境論",2,4,"試験",[["木4"],["金1"]],{rumor:"データが多い。",net:"図表が頻出。"}),
 C("tourism","観光と地域",2,3,"課題",[["月3"],["土4"]],{rumor:"現地調査あり。",net:"フィールド活動中心。"}),
 C("cognitive","認知心理学",2,4,"試験",[["火1"],["金5"]],{rumor:"知識量が必要。",net:"実験の紹介が多い。"})
];
const ADVANCED={
 humanities:[
 C("seminar_lit","物語研究ゼミ",4,4,"ゼミ",[["火3","火4"],["土1","土2"]],{seminar:true,yearMin:3,rumor:"創作と批評の両方。",net:"少人数の発表。"}),
 C("seminar_culture","文化表象ゼミ",4,3,"ゼミ",[["木2","木3"],["土2","土3"]],{seminar:true,yearMin:3,rumor:"発表が多い。",net:"毎週討論。"}),
 C("thesis_lit","卒業制作演習",4,5,"課題",[["水2","水3"]],{yearMin:4,prereq:"seminar_lit",rumor:"大作を仕上げる。",net:"卒業制作。"})
 ],
 economics:[
 C("seminar_econ","企業戦略ゼミ",4,4,"ゼミ",[["火3","火4"],["土1","土2"]],{seminar:true,yearMin:3,rumor:"ケース分析が多い。",net:"発表も多い。"}),
 C("seminar_data","データ経営ゼミ",4,5,"ゼミ",[["木2","木3"],["土2","土3"]],{seminar:true,yearMin:3,rumor:"統計分析が中心。",net:"発表がハード。"}),
 C("thesis_econ","卒業研究演習",4,5,"課題",[["水2","水3"]],{yearMin:4,prereq:"seminar_econ",rumor:"文献を丹念に。",net:"研究論文を提出。"})
 ],
 science:[
 C("seminar_sci","先端技術ゼミ",4,5,"ゼミ",[["火3","火4"],["土1","土2"]],{seminar:true,yearMin:3,rumor:"研究課題が重い。",net:"高度な実験。"}),
 C("seminar_math","応用数理ゼミ",4,5,"ゼミ",[["木2","木3"],["土2","土3"]],{seminar:true,yearMin:3,rumor:"証明が主役。",net:"数式で考える。"}),
 C("thesis_sci","卒業研究実習",4,5,"実験",[["水2","水3"]],{yearMin:4,prereq:"seminar_sci",rumor:"研究室中心。",net:"締切を守ること。"})
 ]
};
const ANNUAL={
 humanities:[C("annual_reading","日本文学通年講読",4,3,"通年",[["火1"],["土1"]],{annual:true,rumor:"前期・後期の継続講読。",net:"単位は後期末にまとめて4単位。"}),C("annual_world","世界文学通年演習",4,4,"通年",[["火4"],["土5"]],{annual:true,rumor:"年間を通じた提出物。",net:"前期は中間評価のみ。"})],
 economics:[C("annual_trade","通年ビジネス研究",4,4,"通年",[["火1"],["土1"]],{annual:true,rumor:"1年間で企画を完成。",net:"後期に4単位を一括取得。"}),C("annual_economy","経済史通年講読",4,3,"通年",[["火4"],["土5"]],{annual:true,rumor:"前期の成績は仮評価。",net:"単位確定は後期末。"})],
 science:[C("annual_lab","総合科学通年実習",4,5,"通年",[["火1"],["土1"]],{annual:true,rumor:"半年×2の実験。",net:"後期末に4単位を確定。"}),C("annual_math","数理通年演習",4,4,"通年",[["火4"],["土5"]],{annual:true,rumor:"通年で演習を積む。",net:"前期は仮評価。"})]
};
const UPPER={
 humanities:[
 [C("lit_method","文学研究法",2,3,"レポート",[["月2"]])],[C("lit_analysis","作品分析基礎",2,3,"レポート",[["金2"]])],
 [C("lit_seminar_intro","専門研究入門",2,4,"課題",[["月2"]])],[C("lit_presentation","研究発表演習",2,4,"ゼミ",[["金2"]])],
 [C("lit_career","キャリア研究",2,3,"レポート",[["月2"]])],[C("lit_review","総合演習",2,4,"レポート",[["金2"]])]
 ],
 economics:[
 [C("econometrics","計量経済入門",2,4,"試験",[["月2"]])],[C("organization","組織と経営",2,3,"レポート",[["金2"]])],
 [C("specialty","専門演習基礎",2,4,"課題",[["月2"]])],[C("research","研究デザイン",2,4,"レポート",[["金2"]])],
 [C("biz_strategy","戦略と政策",2,4,"試験",[["月2"]])],[C("review_econ","総合演習",2,4,"レポート",[["金2"]])]
 ],
 science:[
 [C("engineering","工学数理",2,5,"試験",[["月2"]]),C("sci_experiment3","物理実験Ⅲ",2,4,"実験",[["水3","水4"]])],
 [C("engineering2","情報数理",2,5,"試験",[["金2"]]),C("sci_experiment4","化学実験Ⅳ",2,5,"実験",[["水3","水4"]])],
 [C("engineering3","専門計算",2,5,"試験",[["月2"]])],[C("engineering4","先端解析",2,5,"試験",[["金2"]])],
 [C("sci_project","卒研準備",2,4,"課題",[["月2"]])],[C("sci_report","技術報告",2,4,"レポート",[["金2"]])]
 ]
};
const prereqLabels={"stats":"統計学基礎","program":"プログラミング入門","busA":"マーケティング入門","writing1":"文章表現基礎","seminar_lit":"物語研究ゼミ","seminar_econ":"企業戦略ゼミ","seminar_sci":"先端技術ゼミ"};
function ensureDefaults(){
 if(!state)return;
 if(!Array.isArray(state.annualCourses))state.annualCourses=[];
 if(!Array.isArray(state.history))state.history=[];
 if(!Array.isArray(state.failedRequired))state.failedRequired=[];
 if(!Array.isArray(state.passedIds))state.passedIds=[];
}
save=function(){try{localStorage.setItem(SAVE3,JSON.stringify(state))}catch(e){}};
hasSaved=function(){try{return !!localStorage.getItem(SAVE3)}catch(e){return false}};
const priorStart=start;
start=function(seed){priorStart(seed);state.version="0.3.0";ensureDefaults();save()};
resume=function(){
 try{const s=JSON.parse(localStorage.getItem(SAVE3));if(!s||s.version!=="0.3.0"||!FACULTIES[s.faculty]||!ACTIVITIES[s.activity]||s.semester>7)throw Error("incompatible");
 state=s;ensureDefaults();facultyChoice=s.faculty;activityChoice=s.activity;render();
 if(state.phase==="reveal")playReveal();
 }catch(e){showToast("保存データを復元できませんでした。");displayIntro()}
};
const priorOccupied=occupied;
occupied=function(){
 const used=priorOccupied();
 if(state)for(const c of state.offers||[])if(c.type==="annualCarry")for(const p of c.slots)used.set(p,c);
 return used
};
creditLoad=function(){return state.offers.filter(c=>c.type==="required"||c.type==="annualCarry"||state.selectedIds.includes(c.id)).reduce((n,c)=>n+c.credits,0)};
allRegistered=function(){return state.offers.filter(c=>c.type==="required"||c.type==="annualCarry"||state.selectedIds.includes(c.id))};
const priorAllowed=allowed;
allowed=function(c){if(c.type==="annualCarry")return {ok:false,reason:"通年授業の後期は自動的に継続します。"};return priorAllowed(c)};
const priorPassChance=passChance;
passChance=function(c){let p=priorPassChance(c);if(c.type==="annualCarry")p+=c.midtermOk?9:-10;return Math.max(35,Math.min(98,p))};
createOffers=function(){
 ensureDefaults();
 const term=state.semester,year=Math.floor(term/2)+1,half=term%2;
 const mandatoryDefs=term<2?MUST[state.faculty][term]:UPPER[state.faculty][term-2];
 const must=mandatoryDefs.map(c=>courseMaterialize(c,term,true));
 const carry=half===1?state.annualCourses.map(a=>({...a.course,id:"carry_"+a.id,canonicalId:a.id,type:"annualCarry",term,midtermOk:a.midtermOk})): [];
 const pool=(half===0?WEEK_1:WEEK_2).concat(EXTRA,SPECIALS[state.faculty],ADVANCED[state.faculty].filter(c=>!c.yearMin||year>=c.yearMin),half===0?ANNUAL[state.faculty]:[]);
 const optional=pool.filter(c=>!state.passedIds.includes(c.id)&&!state.annualCourses.some(a=>a.id===c.id)).map(c=>courseMaterialize(c,term));
 for(const c of optional)if(c.prereq)c.prereqName=prereqLabels[c.prereq]||c.prereq;
 const blocked=new Set(must.concat(carry).flatMap(c=>c.slots).concat(getActivityBlocks()));
 for(const f of state.failedRequired){
  if(must.some(c=>c.canonicalId===f.canonicalId))continue;
  const places=[];
  for(let d=0;d<6;d++)for(let p=0;p<5;p++){
   const q=d*5+p;if(blocked.has(q))continue;
   if(f.slots.length>1){if(p<4&&!blocked.has(q+1))places.push([q,q+1])}
   else places.push([q]);
  }
  if(places.length)optional.unshift({...f,id:"retry_"+f.canonicalId,type:"retake",slots:pick(places),term,rumor:"再履修のチャンス。",net:"今度こそ単位GETを狙おう。"});
 }
 state.offers=must.concat(carry,optional);
 state.selectedIds=[];state.results=[];state.revealIndex=0;state.termScore=0;state.currentCombo=0;state.phase="registration";save()
};
function termName(n){return (Math.floor(n/2)+1)+"年"+(n%2?"後期":"前期")}
function playSound(type){
 if(!soundOn)return;
 const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;
 try{
  if(!audio)audio=new Ctx();if(audio.state==="suspended")audio.resume();
  let freqs=type==="success"?[640,850]:type==="combo"?[660,880,1180]:type==="perfect"?[523,659,784,1046]:type==="fail"?[260,175]:type==="final"?[523,659,784,988,1175]:type==="select"?[380,550]:[370];
  freqs.forEach((hz,i)=>{const t=audio.currentTime+i*.07,o=audio.createOscillator(),g=audio.createGain();o.type=type==="fail"?"triangle":"sine";o.frequency.setValueAtTime(hz,t);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(type==="click"?.026:.07,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+.16);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.18)});
 }catch(e){}
}
function updateSoundToggle(){
 const b=$("sound-toggle");if(b){b.textContent=soundOn?"♪ 音ON":"♪ 音OFF";b.setAttribute("aria-pressed",String(soundOn))}
}
const priorRender=render;
render=function(){
 priorRender();
 if(!state)return;
 if(state.phase==="end")return;
 $("semester-label").textContent=termName(state.semester)+" / 8学期";
 $("faculty-label").textContent=FACULTIES[state.faculty].name+" · "+ACTIVITIES[state.activity].name+" · SEED "+state.seed;
 $("schedule-hint").textContent="空きマスをタップして候補を選択。通年科目は後期まで時間割を確保します。";
 const panel=$("mandatory-panel");panel.replaceChildren();
 const h=document.createElement("strong");h.textContent="📘 今期の必修";panel.append(h);
 const these=state.offers.filter(c=>c.type==="required"||c.type==="annualCarry");
 for(const c of these){const d=document.createElement("span");d.className="mandatory-tag";d.textContent=(c.type==="annualCarry"?"通年継続 ":"必修 ")+c.name;panel.append(d)}
 const last=state.history.find(x=>x.term===state.semester-1);
 if(last){const p=document.createElement("p");p.className="prior-results";p.textContent="前学期の必修："+last.required.map(r=>r.name+"【"+r.status+"】").join("・");panel.append(p)}
 if(state.failedRequired.length){const p=document.createElement("p");p.className="prior-results";p.textContent="⚠ 未取得必修："+state.failedRequired.map(c=>c.name+"（再履修候補）").join("、");panel.append(p)}
 const yearlong=$("yearlong-panel");yearlong.replaceChildren();
 const annual=state.offers.filter(c=>c.annual&&(c.type==="annualCarry"||state.selectedIds.includes(c.id)));
 if(annual.length){yearlong.textContent="📅 通年科目："+annual.map(c=>c.name+(c.type==="annualCarry"?"（後期・固定）":"（後期も固定／4単位は後期末）")).join("、")}
};
const priorGrid=renderGrid;
renderGrid=function(target,interactive){
 priorGrid(target,interactive);
 if(!state)return;
 // 7 header cells, then each 7 cells per period row.
 for(let period=0;period<5;period++)for(let day=0;day<6;day++){
  const p=day*5+period,dom=target.children[8+period*7+day],c=occupied().get(p);
  if(!dom)continue;
  if(interactive&&!c&&!getActivityBlocks().includes(p)){
   dom.classList.add("slot-action");dom.setAttribute("role","button");dom.setAttribute("tabindex","0");
   dom.setAttribute("aria-label",DAYS[day]+"曜日"+(period+1)+"限の候補科目");
   dom.onclick=()=>openSlot(p);
   dom.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();openSlot(p)}}
   dom.querySelector(".cn").textContent="＋";
  }
  if(c&&c.type==="annualCarry")dom.classList.add("annual-block");
  if(c&&c.annual&&gradeFor(c.id)&&state.semester%2===0){
   const sm=dom.querySelector(".small");if(sm)sm.textContent=gradeFor(c.id).pass?"前期クリア":"前期要補講";
  }
 }
};
function openSlot(pos){
 if(!state||state.phase!=="registration")return;
 currentSlot=pos;playSound("click");
 const day=DAYS[Math.floor(pos/5)],period=pos%5+1;
 $("slot-picker-title").textContent=day+"曜"+period+"限 の候補科目";
 $("slot-picker-sub").textContent="このコマを含む講義。週2・連続・通年科目は他のコマも占有します。";
 const list=$("slot-list");list.replaceChildren();
 const matches=state.offers.filter(c=>c.type!=="required"&&c.type!=="annualCarry"&&c.slots.includes(pos)&&!state.selectedIds.includes(c.id));
 matches.sort((a,b)=>Number(allowed(b).ok)-Number(allowed(a).ok)||b.diff-a.diff);
 for(const c of matches){
  const allowedNow=allowed(c),b=document.createElement("button");
  b.className="slot-option"+(allowedNow.ok?"":" unavailable");
  const top=document.createElement("strong");top.textContent=c.name+"　"+(c.annual?"〔通年〕":c.seminar?"〔ゼミ〕":"");
  const bot=document.createElement("small");
  bot.textContent=pretty(c.slots.map(q=>DAYS[Math.floor(q/5)]+(q%5+1)))+" · "+c.credits+"単位 · 難度"+c.diff+" · "+(allowedNow.ok?"登録可能":allowedNow.reason);
  b.append(top,bot);b.onclick=()=>{closeSlot();openCourse(c.id)};
  list.append(b);
 }
 if(!matches.length){const p=document.createElement("p");p.className="smallhint";p.textContent="このコマを含む候補はありません。";list.append(p)}
 $("slot-picker").classList.remove("hidden")
}
function closeSlot(){currentSlot=null;$("slot-picker").classList.add("hidden")}
const previousOpenCourse=openCourse;
openCourse=function(id){playSound("click");previousOpenCourse(id);
 const c=state.offers.find(x=>x.id===id);if(!c)return;
 if(c.annual){
  $("drawer-kind").textContent=c.type==="annualCarry"?"通年科目 / 後期継続":"通年科目 / 前期登録";
  const tag=document.createElement("span");tag.textContent=c.type==="annualCarry"?"後期末に4単位確定":"前期は仮判定／単位は後期末";$("drawer-tags").append(tag);
  $("drawer-message").textContent=c.type==="annualCarry"?"前期から自動継続しています。":state.selectedIds.includes(id)?"登録済み。後期も同じ時間が埋まります。":"2学期を拘束します。中間評価を受け、後期末に4単位を獲得。";
  if(c.type==="annualCarry"){$("drawer-action").disabled=true;$("drawer-action").textContent="通年継続中（解除不可）"}
 }
 if(c.seminar){const tag=document.createElement("span");tag.textContent="3年次以降の少人数演習";$("drawer-tags").append(tag)}
};
const priorRenderCourses=renderCourses;
renderCourses=function(){
 priorRenderCourses();
 const search=$("course-search");if(search&&search.value.trim()){
  const v=search.value.trim().toLowerCase();
  for(const item of $("course-list").querySelectorAll(".course")){
   const name=item.querySelector(".course-name")?.textContent||"";
   item.classList.toggle("hidden",!name.toLowerCase().includes(v));
  }
 }
 for(const item of $("course-list").querySelectorAll(".course")){
  const name=item.querySelector(".course-name")?.textContent||"";
  const c=state.offers.find(v=>name.includes(v.name));
  if(c?.type==="annualCarry"){item.remove();continue}
  if(c&&c.annual){item.querySelector(".course-name").textContent+=" 📅 通年"}
  if(c&&c.seminar){item.querySelector(".course-name").textContent+=" 🎓 ゼミ"}
 }
};
const priorBegin=beginReveal;
beginReveal=function(){
 if(creditLoad()<10)return;
 if(state.semester%2===0){
  state.annualCourses=allRegistered().filter(c=>c.annual&&c.type!=="annualCarry").map(c=>({id:c.canonicalId,course:c,midtermOk:false}));
 }
 playSound("select");priorBegin()
};
const priorReveal=renderReveal;
renderReveal=function(){
 priorReveal();
 if(!state||state.phase!=="reveal")return;
 $("reveal-title").textContent=termName(state.semester)+" 成績発表";
 $("next-btn").textContent=state.semester<7?"次の学期へ →":"4年間の結果を見る →";
 const logRows=$("reveal-log").querySelectorAll(".reveal-row");
 if(state.semester%2===0)for(let i=0;i<state.revealIndex;i++){
  const r=state.results[i];
  if(r.course.annual&&logRows[i]){const label=logRows[i].querySelector("b");if(label)label.textContent=r.pass?"前期クリア +"+fmt(r.earned):"前期要補講"}
 }
 const box=$("reveal-required");box.replaceChildren();
 const mand=state.results.filter(r=>r.required||r.course.annual);
 if(!mand.length)return;
 const head=document.createElement("strong");head.textContent="必修・通年の結果";box.append(head);
 for(const r of mand){
  const index=state.results.indexOf(r),done=index<state.revealIndex;
  const tag=document.createElement("span");tag.className="mandatory-tag "+(done?(r.pass?"got":"lost"):"pending");
  const status=done?(r.course.annual&&state.semester%2===0?(r.pass?"前期クリア":"前期要補講"):r.pass?(r.course.annual?"4単位取得":"取得"):r.lotteryLost?"抽選落ち":"落単"):"発表待ち";
  tag.textContent=r.name+"："+status;
  box.append(tag)
 }
};
const priorStep=stepReveal;
stepReveal=function(){
 const r=state?.results?.[state.revealIndex];if(!r)return;
 if(r.course.annual&&state.semester%2===0){
  if(r.pass){
   state.currentCombo++;state.maxCombo=Math.max(state.maxCombo,state.currentCombo);
   r.combo=state.currentCombo;r.earned=180+40*r.course.diff;state.score+=r.earned;state.termScore+=r.earned;
   $("reveal-flash").textContent="前期クリア！";$("reveal-flash").className="reveal-flash success";
   $("reveal-combo").textContent=state.currentCombo>=2?state.currentCombo+" COMBO!":"";
   $("reveal-sub").textContent=r.name+"　通年の単位は後期末に確定";
   playSound(state.currentCombo>=3?"combo":"success");
  }else{
   state.currentCombo=0;$("reveal-flash").textContent="前期要補講";$("reveal-flash").className="reveal-flash fail";
   $("reveal-combo").textContent="COMBO BREAK";$("reveal-sub").textContent=r.name+"　後期末に挽回できる";
   playSound("fail");
  }
  const rec=state.annualCourses.find(a=>a.id===r.canonicalId);if(rec)rec.midtermOk=r.pass;
  state.revealIndex++;save();renderReveal();if(state.revealIndex===state.results.length)endReveal();
  return;
 }
 priorStep();
 if(r.course.type==="annualCarry"&&!r.pass){state.failedRequired=state.failedRequired.filter(c=>c.canonicalId!==r.canonicalId);save()}
 playSound(r.pass?(state.currentCombo>=3?"combo":"success"):(r.lotteryLost?"click":"fail"));
};
const priorEnd=endReveal;
endReveal=function(){
 if(!state||state.phase!=="reveal"||state.revealIndex!==state.results.length)return;
 const already=state.history.some(x=>x.term===state.semester);
 priorEnd();
 const h=state.history.find(x=>x.term===state.semester);if(!h)return;
 if(!already){
  if(state.activity==="sports"||state.activity==="combo"){
   const threshold=state.activity==="sports"?6:6;
   const earned=state.results.filter(x=>x.pass&&!((x.course.annual)&&(state.semester%2===0))).reduce((n,x)=>n+x.credits,0);
   if(earned>=threshold){const b=ACTIVITIES[state.activity].bonus;state.score+=b;state.termScore+=b;h.score+=b;h.bonus+=b}
  }
  h.required=state.results.filter(x=>x.required).map(r=>({name:r.name,status:r.pass?"取得":r.lotteryLost?"抽選落ち":"落単",id:r.canonicalId}));
  h.annual=state.results.filter(x=>x.course.annual).map(r=>({name:r.name,status:state.semester%2===0?(r.pass?"前期クリア":"前期要補講"):(r.pass?"4単位取得":"落単")}));
  if(state.semester%2===0){h.credits-=state.results.filter(x=>x.course.annual&&x.pass).reduce((n,x)=>n+x.credits,0)}
  if(h.perfect)playSound("perfect");
  if(state.semester===7)playSound("final");
  save();
 }
 const mand=state.results.filter(r=>r.required);
 const got=mand.filter(r=>r.pass).length;
 if(mand.length)$("reveal-sub").textContent+="　| 必修 "+got+"/"+mand.length+"取得";
 $("reveal-score").textContent=fmt(state.termScore)+" pt";
};
advance=function(){
 clearTimeout(revealTimer);
 if(state.phase!=="reveal"||state.revealIndex<state.results.length)return;
 if(state.semester<7){
  state.semester++;
  if(state.semester%2===0)state.annualCourses=[];
  createOffers();render();window.scrollTo(0,0);playSound("select")
 }else{state.phase="end";save();render();window.scrollTo(0,0);playSound("final")}
};
renderEnd=function(){
 const condition=state.credits>=72&&state.failedRequired.length===0;
 if(condition&&!state.graduationApplied){state.score+=3000;state.graduationApplied=true;save()}
 const bestKey=BEST3+state.faculty+"_"+state.activity;let best=0;
 try{best=Number(localStorage.getItem(bestKey))||0}catch(e){}
 const isRecord=state.score>best;
 if(isRecord)try{localStorage.setItem(bestKey,String(state.score))}catch(e){}
 const grade=state.score>=42000?"S":state.score>=32000?"A":state.score>=22000?"B":"C";
 const area=$("ending-content");area.replaceChildren();
 const heading=document.createElement("h2");heading.textContent=isRecord?"NEW HIGH SCORE!":condition?"卒業おめでとう！":"大学4年間 終了";area.append(heading);
 const score=document.createElement("div");score.className="hero-score";score.textContent=fmt(state.score)+" pt";area.append(score);
 const msg=document.createElement("p");msg.textContent=(condition?"🎓 卒業認定（+3000pt）":"卒業判定：要単位再取得")+"　·　総合評価 "+grade+"　·　"+FACULTIES[state.faculty].name;area.append(msg);
 const wrap=document.createElement("div");wrap.className="ending-stats";
 for(const [label,value] of [["取得単位",state.credits+"単位"],["最大コンボ",state.maxCombo+" COMBO"],["PERFECT学期",state.perfectTerms+" / 8"],["自己ベスト",fmt(Math.max(best,state.score))+" pt"]]){const d=document.createElement("div"),small=document.createElement("small"),b=document.createElement("b");small.textContent=label;b.textContent=value;d.append(small,b);wrap.append(d)}area.append(wrap);
 const history=document.createElement("div");history.className="history-list";
 for(const h of state.history){const row=document.createElement("div");row.className="history-row";const title=document.createElement("strong");title.textContent=termName(h.term)+" "+fmt(h.score)+"pt / "+h.credits+"単位";row.append(title);const details=document.createElement("small");details.textContent="必修："+(h.required||[]).map(r=>r.name+" "+r.status).join("、")+(h.annual?.length?"　通年："+h.annual.map(a=>a.name+" "+a.status).join("、"):"");row.append(details);history.append(row)}area.append(history);
 const p=document.createElement("p");p.className="smallhint";p.textContent="SEED "+state.seed+" ／ "+ACTIVITIES[state.activity].name+" ／ 未取得必修："+(state.failedRequired.map(c=>c.name).join("、")||"なし");area.append(p);
};
const oldShowToast=showToast;
showToast=function(msg){oldShowToast(msg);if(/登録！|解除/.test(msg))playSound(msg.includes("解除")?"click":"select")};
$("slot-close").onclick=closeSlot;$("slot-scrim").onclick=closeSlot;
$("sound-toggle").onclick=()=>{soundOn=!soundOn;try{localStorage.setItem(AUDIO3,soundOn?"on":"off")}catch(e){}updateSoundToggle();if(soundOn)playSound("select")};
$("course-search").addEventListener("input",()=>{searchText=$("course-search").value;renderCourses()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!$("slot-picker").classList.contains("hidden"))closeSlot()});
const retryOriginal=$("retry-btn").onclick;$("retry-btn").onclick=()=>{retryOriginal();playSound("select")};
const sameOriginal=$("same-seed-btn").onclick;$("same-seed-btn").onclick=()=>{sameOriginal();playSound("select")};
$("register-btn").onclick=beginReveal;$("next-btn").onclick=advance;$("resume-btn").onclick=resume;
updateSoundToggle();displayIntro();
})();
