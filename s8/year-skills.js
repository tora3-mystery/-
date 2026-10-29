"use strict";
/* S8 v0.6.0 — deterministic random annual draft of three skill cards. */
(function(){
const SKILLS=[
 {id:"past_exams",name:"先輩から過去問を入手",type:"学業・永続／重複可",description:"全科目の単位取得率 +5ポイント。重ね取りで最大+15ポイント。",score:"合格しやすくなるが直接の得点増加はなし。",repeat:3},
 {id:"cheating",name:"カンニングを企む",type:"危険・翌年度限定",description:"次の学年の全講義で取得率 +50ポイント。ただし各科目10%で発覚し、その周回は強制留年＝GAME OVER。",score:"高い単位取得数を狙えるが、失敗時は卒業不可。",repeat:3},
 {id:"mandatory_master",name:"必修科目の鬼",type:"戦略・永続",description:"必修の直前に予習1コマを確保できれば、その必修の取得率100%。予習コマには授業を登録できない。",score:"必修の未取得を防ぎ、卒業を狙いやすくなる。",repeat:1},
 {id:"parttime_raise",name:"バイトの時給UP",type:"活動・永続",description:"塾講師バイトの拘束を来年度から週1コマ減らす（収入ボーナスは維持）。繰り返し取得でさらに1コマ減る。",score:"空いたコマを授業に使える。",repeat:2,when:act=>act==="job"||act==="combo"},
 {id:"club_retire",name:"サークル引退",type:"活動・永続",description:"翌年度からサークルの週2コマが空きになる。代わりに毎学期スコアが120pt減る。",score:"時間割が楽になる代わりに得点が下がる。",repeat:1,when:act=>act==="club"||act==="combo"},
 {id:"morning_routine",name:"朝活の習慣",type:"学業・永続／重複可",description:"1限の授業の単位取得率 +8ポイント。重ね取りで最大+16ポイント。",score:"早起きの授業を取りやすくする。",repeat:2},
 {id:"saturday_special",name:"土曜日の常連",type:"学業・永続／重複可",description:"土曜の授業の取得率 +10ポイント。重ね取りで最大+20ポイント。",score:"土曜日のハンデを補いやすくなる。",repeat:2},
 {id:"report_hacks",name:"レポート職人",type:"学業・永続／重複可",description:"レポート・課題評価の取得率 +7ポイント。重ね取りで最大+14ポイント。",score:"提出型の授業と相性が良い。",repeat:2},
 {id:"exam_tactics",name:"試験対策ノート",type:"学業・永続／重複可",description:"試験評価の取得率 +8ポイント。重ね取りで最大+16ポイント。",score:"試験が中心の学部向き。",repeat:2},
 {id:"minimalism",name:"詰め込まない勇気",type:"学業・永続",description:"今期の履修が14単位以下なら全科目の取得率 +8ポイント。",score:"少ない科目を確実に取る作戦に向く。",repeat:1},
 {id:"professor_notes",name:"教授のクセを研究",type:"学業・永続／重複可",description:"難度4以上の講義の取得率 +6ポイント。重ね取りで最大+12ポイント。",score:"難しい必修やゼミにも効果がある。",repeat:2},
 {id:"score_boost",name:"要領よく高評価",type:"得点・永続／重複可",description:"単位を取った時の科目得点が+10%（最大+20%）。取得率は増えない。",score:"スコアアタック向け。",repeat:2},
 {id:"night_shift",name:"夜型生活の達人",type:"学業・永続",description:"4・5限の取得率 +8ポイント。ただし1限の取得率 -5ポイント。",score:"午後中心の時間割に向く。",repeat:1},
 {id:"weekend_reset",name:"週休の達人",type:"学業・永続",description:"直前の曜日が全休だった時の取得率補正を+5→+10ポイントに強化。月曜日は対象外。",score:"授業の無い日を作る作戦に向く。",repeat:1}
];
const byId=Object.fromEntries(SKILLS.map(x=>[x.id,x]));
function count(id){return(state?.skills||[]).filter(x=>x.id===id).length}
function active(id){return count(id)>0}
function ensure(){
 if(!state)return;
 if(!Array.isArray(state.skills))state.skills=[];
 if(!state.skillOffers||typeof state.skillOffers!=="object")state.skillOffers={};
 if(!state.skillChosenYears||typeof state.skillChosenYears!=="object")state.skillChosenYears={};
}
function skillActiveYear(year){return year<=3&&year>=1}
function draft(year){
 ensure();
 const k=String(year);
 const previous=state.skillOffers[k];
 if(previous&&previous.length===3)return previous;
 const eligible=SKILLS.filter(s=>(!s.when||s.when(state.activity))&&count(s.id)<s.repeat);
 let seed=hashSeed(String(state.seed)+"|skill-draft|"+year+"|"+state.faculty+"|"+state.activity);
 const items=eligible.slice();
 for(let i=items.length-1;i>0;i--){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const j=seed%(i+1);[items[i],items[j]]=[items[j],items[i]]
 }
 const picks=items.slice(0,3).map(s=>s.id);
 // There are always many eligible items for each of the three annual drafts.
 if(picks.length!==3)throw Error("Annual skill offer pool exhausted");
 state.skillOffers[k]=picks;save();return picks
}
function isSchoolYearEnd(){return state?.phase==="reveal"&&state.semester<7&&state.semester%2===1&&state.revealIndex===state.results.length}
function eligibleForDraft(){return isSchoolYearEnd()&&state.credits>=[16,34,54][Math.floor(state.semester/2)]&&!state.cheatCaughtYear}
function pendingDraft(){const y=Math.floor(state.semester/2)+1;return eligibleForDraft()&&!state.skillChosenYears?.[String(y)]}
function displayDraft(){
 const panel=$("year-skill-panel");if(!panel)return;
 const show=state?.phase==="reveal"&&state.yearSkillPending&&state.skillReviewConfirmedTerm===state.semester&&pendingDraft()&&!state.appealPending;
 panel.classList.toggle("hidden",!show);
 if(!show)return;
 const year=Math.floor(state.semester/2)+1,choices=draft(year);
 $("year-skill-title").textContent=year+"年次CLEAR！ 来年度のスキルを1つ選択";
 panel.scrollTop=0;
 const box=$("year-skill-options");box.replaceChildren();
 for(const id of choices){
  const skill=byId[id],button=document.createElement("button");button.className="year-skill-option";button.dataset.skill=id;
  const title=document.createElement("strong");title.textContent=skill.name;
  const subtype=document.createElement("span");subtype.className="skill-type";subtype.textContent=skill.type;
  const desc=document.createElement("small");desc.textContent=skill.description;
  const score=document.createElement("div");score.className="skill-score-detail";score.textContent=skill.score;
  button.append(title,subtype,desc,score);button.onclick=()=>choose(id);box.append(button)
 }
 $("year-skill-history").textContent=state.skills.length?"取得済み："+state.skills.map(s=>byId[s.id]?.name||s.id).join(" / "):"今回が最初のスキル取得です。";
 $("skip-btn").classList.add("hidden");$("next-btn").classList.add("hidden")
}
function choose(id){
 if(!pendingDraft()||!state.yearSkillPending||state.appealPending)return;
 const year=Math.floor(state.semester/2)+1;
 if(!draft(year).includes(id))return;
 const skill=byId[id];if(!skill||count(id)>=skill.repeat)return;
 state.skills.push({id,year});
 state.skillChosenYears[String(year)]=id;
 state.yearSkillPending=false;
 save();
 displayDraft();
 showToast("「"+skill.name+"」を取得！ 来年度へ。");
 advance()
}
function skillBonus(c){
 if(!state?.skills?.length)return 0;
 const year=Math.floor(state.semester/2)+1;
 let b=count("past_exams")*5;
 if(c.slots.some(x=>x%5===0))b+=count("morning_routine")*8;
 if(c.slots.some(x=>Math.floor(x/5)===5))b+=count("saturday_special")*10;
 if(["レポート","課題"].includes(c.method))b+=count("report_hacks")*7;
 if(c.method==="試験")b+=count("exam_tactics")*8;
 if(c.diff>=4)b+=count("professor_notes")*6;
 if(active("minimalism")&&creditLoad()<=14)b+=8;
 if(active("night_shift")){
  if(c.slots.some(x=>x%5>=3))b+=8;
  if(c.slots.some(x=>x%5===0))b-=5
 }
 if(active("weekend_reset")){
  const courses=allRegistered();
  const used=new Set(courses.flatMap(x=>x.slots).concat(getActivityBlocks()));
  if(c.slots.some(x=>Math.floor(x/5)>0&&![...used].some(p=>Math.floor(p/5)===Math.floor(x/5)-1)))b+=5
 }
 // Powerful but one-year-only risky shortcut. Multiple acquisitions are for different years.
 if(state.skills.some(s=>s.id==="cheating"&&s.year+1===year))b+=50;
 return b
}
function isCheatingYear(){
 const year=Math.floor(state?.semester/2)+1;
 return state?.skills?.some(s=>s.id==="cheating"&&s.year+1===year)
}
const originalActivities=getActivityBlocks;
getActivityBlocks=function(){
 const blocks=originalActivities();
 if(!state||!state.skills?.length)return blocks;
 const raises=Math.min(2,count("parttime_raise"));
 const retire=active("club_retire");
 if(!raises&&!retire)return blocks;
 let kept=blocks.slice();
 if(state.activity==="combo"){
  // Order by base generation: first two club slots, the rest paid work.
  // In older years expansion appends extra commitments at the end.
  if(retire)kept=kept.filter((p,i)=>i>=2);
  if(raises)kept=kept.slice(0,Math.max(0,kept.length-raises));
 }else if(state.activity==="job"){
  if(raises)kept=kept.slice(0,Math.max(0,kept.length-raises));
 }else if(state.activity==="club"&&retire){
  // Club retirement cancels the club itself, including its later-year extra meetings.
  kept=[]
 }
 return kept
};
function prepSlots(){
 const result=new Map();
 if(!state||!active("mandatory_master")||!Array.isArray(state.offers))return result;
 const mandatory=state.offers.filter(x=>x.type==="required");
 const other=state.offers.filter(x=>x.type==="annualCarry"||state.selectedIds.includes(x.id));
 const occupiedSlots=new Set(mandatory.concat(other).flatMap(x=>x.slots));
 const activity=new Set(getActivityBlocks());
 // Give each compulsory course priority for one fixed revision period just before its earliest lecture.
 for(const c of mandatory){
  const first=Math.min(...c.slots),prior=first-1;
  if(first%5===0||occupiedSlots.has(prior)||activity.has(prior))continue;
  result.set(prior,c);
  occupiedSlots.add(prior)
 }
 return result
}
const oldOccupied=occupied;
occupied=function(){
 const used=oldOccupied();
 for(const [p,c]of prepSlots())if(!used.has(p))used.set(p,{id:"study_"+c.id,type:"study",name:"📖必修予習",credits:0,slots:[p]});
 return used
};
const previousAllowed=allowed;
allowed=function(c){
 const original=previousAllowed(c);
 if(!original.ok||!active("mandatory_master")||state.selectedIds.includes(c.id)||c.type==="required"||c.type==="annualCarry")return original;
 const prep=prepSlots();
 if(c.slots.some(p=>prep.has(p)))return{ok:false,reason:"必修科目の鬼による予習コマと重なります。"};
 return original
};
const oldGrid=renderGrid;
renderGrid=function(target,interactive){
 oldGrid(target,interactive);
 if(!state)return;
 for(const [p]of prepSlots()){
  const day=Math.floor(p/5),period=p%5;
  const cell=target.children[8+period*7+day];
  if(!cell)continue;
  cell.classList.add("study");
  const label=cell.querySelector(".cn");
  if(label)label.textContent="📖予習"
 }
};
const originalChance=passChance;
passChance=function(c){
 const b=skillBonus(c);
 const prep=prepSlots();
 if(c.type==="required"&&[...prep.values()].some(x=>x.canonicalId===c.canonicalId))return 100;
 return Math.max(5,Math.min(98,originalChance(c)+b))
};
const originalPoints=points;
points=function(c,combo){
 const base=originalPoints(c,combo);
 return Math.round(base*(1+Math.min(2,count("score_boost"))*.1))
};
const originalBegin=beginReveal;
beginReveal=function(){
 if(!state||state.phase!=="registration")return;
 originalBegin();
 // A cheating detection is independent of grade RNG and cannot be rerolled.
 if(isCheatingYear()){
  const caught=state.results.filter(r=>hashSeed(String(state.seed)+"|caught-cheating|"+state.semester+"|"+r.canonicalId)%100<10);
  if(caught.length){
   state.cheatCaughtYear=Math.floor(state.semester/2)+1;
   state.cheatCaughtTerm=state.semester;
   state.cheatCaughtNames=caught.map(r=>r.name);
   save()
  }
 }
};
const beforeSkillEnd=endReveal;
endReveal=function(){
 const first=Boolean(state?.phase==="reveal"&&state.revealIndex===state.results.length&&!state.history.some(h=>h.term===state.semester));
 beforeSkillEnd();
 if(!first||!active("club_retire")||!state||state.phase!=="reveal")return;
 // Retirement opens club periods but loses a modest score every term.
 const deduction=Math.min(120,state.score),h=state.history.find(x=>x.term===state.semester);
 state.score-=deduction;state.termScore-=deduction;
 if(h){h.score-=deduction;h.skillScoreAdjustment=-deduction}
 save();renderReveal()
};
const beforeAnnualDraft=endReveal;
endReveal=function(){
 // Always let players inspect their final grades before the annual skill interstitial.
 beforeAnnualDraft();
 if(!state||state.phase!=="reveal"||state.revealIndex!==state.results.length)return;
 if(pendingDraft()&&state.skillReviewConfirmedTerm!==state.semester){
  // Selection is offered by the "choose next year's skill" button, not auto-opened.
  $("next-btn").textContent="次年度のスキルを選ぶ →";
 }
};
const originalReveal=renderReveal;
renderReveal=function(){
 originalReveal();
 if(!state||state.phase!=="reveal")return;
 const cheat=$("cheat-alert"),done=state.revealIndex===state.results.length;
 const h=state.history.find(x=>x.term===state.semester);
 if(done&&h?.skillScoreAdjustment<0){
  const d=$("reveal-breakdown");
  if(d&&!d.textContent.includes("サークル引退"))d.textContent+=" ／ サークル引退："+fmt(h.skillScoreAdjustment)+"pt"
 }
 const detected=done&&state.cheatCaughtTerm===state.semester;
 cheat.classList.toggle("hidden",!detected);
 if(detected){
  cheat.textContent="🚨 カンニング発覚！ 「"+(state.cheatCaughtNames||[]).join("・")+"」で不正が発覚しました。進級資格を失います。";
  $("next-btn").textContent="処分通知を確認する →"
 }
 if(done&&!detected&&!state.appealPending&&pendingDraft()&&state.skillReviewConfirmedTerm!==state.semester){
  $("next-btn").textContent="成績を確認しました・次年度のスキルを選ぶ →";
  $("next-btn").classList.remove("hidden")
 }
 displayDraft()
};
const originalAdvance=advance;
advance=function(){
 if(!state||state.phase!=="reveal"||state.revealIndex<state.results.length){originalAdvance();return}
 if(state.appealPending){originalAdvance();return}
 if(state.cheatCaughtTerm===state.semester){
  state.phase="end";state.cheatDisqualified=true;state.stageFailYear=null;save();render();
  try{window.scrollTo(0,0)}catch(e){}
  return
 }
 if(pendingDraft()){
  state.yearSkillPending=true;
  state.skillReviewConfirmedTerm=state.semester;
  draft(Math.floor(state.semester/2)+1);
  save();renderReveal();
  return
 }
 if(state.yearSkillPending)return;
 originalAdvance()
};
const originalRender=render;
render=function(){
 originalRender();if(!state||state.phase==="end")return;
 const status=$("skill-summary");if(status){
  const lines=[];
  if(state.skills?.length)lines.push("🎒 獲得スキル："+state.skills.map(x=>byId[x.id]?.name||x.id).join(" / "));
  if(isCheatingYear())lines.push("🚨 カンニング実行中：各科目10%の発覚リスク");
  status.textContent=lines.join("　｜　");status.classList.toggle("hidden",!lines.length)
 }
};
const originalEnd=renderEnd;
renderEnd=function(){
 if(!state?.cheatDisqualified){originalEnd();return}
 const container=$("ending-content");container.replaceChildren();
 const head=document.createElement("h2");head.textContent="GAME OVER｜カンニング発覚";
 const score=document.createElement("div");score.className="hero-score";score.textContent=fmt(state.score)+" pt";
 const message=document.createElement("p");message.textContent="「"+(state.cheatCaughtNames||[]).join("・")+"」で不正が発覚。"+state.cheatCaughtYear+"年次に強制留年となり、卒業チャレンジは終了しました。";
 container.append(head,score,message)
};
const oldResume=resume;
resume=function(){
 oldResume();
 if(!state)return;
 ensure();
 if(state.phase==="reveal"){
  // Previous releases auto-opened the skill draft. A resumed save gets the
  // grade result first unless the player had already explicitly opened the choice.
  if(state.yearSkillPending&&state.skillReviewConfirmedTerm!==state.semester){
   state.yearSkillPending=false;save()
  }
  if(state.revealIndex===state.results.length){
   clearTimeout(revealTimer);
   renderReveal()
  }
 }
};
$("resume-btn").onclick=resume;
})();
