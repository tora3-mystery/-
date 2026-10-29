"use strict";
/* S8 v0.6.2 — visual midday break, lunch transfer, third-period ease and annual goal summary. */
(function(){
const GOALS=[16,34,54,72];
const oldRenderGrid=renderGrid;
renderGrid=function(target,interactive){
 oldRenderGrid(target,interactive);
 if(!target||!target.children)return;
 // Position existing 7-column cells without altering their DOM indices,
 // which are also used by slot pickers, preview colors and movement overlays.
 const n=Math.min(42,target.children.length);
 for(let i=0;i<n;i++){
  const period=i<7?-1:Math.floor((i-7)/7);
  const row=period<0?1:period+2+(period>=2?1:0);
  const col=i<7?i+1:((i-7)%7)+1;
  const cell=target.children[i];
  cell.style.gridRow=String(row);cell.style.gridColumn=String(col);
 }
 const lunch=document.createElement("div");
 lunch.className="lunch-break";
 lunch.textContent="🍱 昼休み 12:10〜13:10（1時間）／キャンパス移動可";
 lunch.setAttribute("aria-label","2限と3限の間は1時間の昼休みです。ここでキャンパスを移動できます。");
 lunch.style.gridRow="4";lunch.style.gridColumn="1 / -1";
 target.append(lunch)
};
const previousChance=passChance;
passChance=function(c){
 const before=previousChance(c);
 if(!c||!c.slots?.some(p=>p%5===2))return before;
 // Never weaken the mandatory 100% preparation skill.
 return before>=100?100:Math.min(98,before+6)
};
const previousOpen=openCourse;
openCourse=function(id){
 previousOpen(id);
 const c=state?.offers?.find(x=>x.id===id);
 if(!c)return;
 const messages=[];
 if(c.slots.some(p=>p%5===2))messages.push("昼休み明けの3限：+6ポイント");
 const activities=new Set(getActivityBlocks());
 if(c.slots.some(p=>p%5<4&&activities.has(p+1)))messages.push("確実に参加する活動の直前：+4ポイント");
 const registered=allRegistered().filter(x=>x.id!==c.id).concat(c);
 const lessons=new Set(registered.flatMap(x=>x.slots));
 const present=new Set([...lessons,...activities]);
 let blank=0;
 for(const p of c.slots){
  const earlier=[...lessons].filter(x=>Math.floor(x/5)===Math.floor(p/5)&&x<p);
  if(!earlier.length)continue;
  const previous=Math.max(...earlier);
  let free=0;for(let x=previous+1;x<p;x++)if(!present.has(x))free++;
  blank=Math.max(blank,free)
 }
 if(blank)messages.push("授業の間の空きコマ"+blank+"つで帰宅リスク："+(blank>=2?"−9":"−6")+"ポイント");
 if(c.slots.some(p=>p%5===2&&lessons.has(p-1)))messages.push("2・3限は昼休みで分かれるため、連続ペナルティなし");
 if(!messages.length)return;
 const info=document.createElement("div");info.className="info wide";
 const label=document.createElement("b");label.textContent="時間割による取得率の変化";
 const value=document.createElement("span");value.textContent=messages.join(" ／ ")+"（表示している取得見込に反映済み）";
 info.append(label,value);$("drawer-detail").append(info)
};
const oldRender=render;
render=function(){
 oldRender();
 const panel=$("goal-banner");
 if(!panel||!state||state.phase==="end"){if(panel)panel.classList.add("hidden");return}
 panel.classList.remove("hidden");
 const y=Math.floor(state.semester/2)+1,required=GOALS[y-1],needed=Math.max(0,required-state.credits);
 const heading=$("goal-banner-title"),amount=$("goal-banner-amount"),details=$("goal-banner-details");
 heading.textContent=y===4?"🎓 卒業ノルマ":"🎯 "+y+"年次の進級ノルマ";
 amount.textContent=needed>0?"あと "+needed+" 単位":"単位ノルマ達成！";
 const requiredIds=new Set();
 if(y===4){
  for(const c of state.failedRequired||[])if(!state.passedIds.includes(c.canonicalId))requiredIds.add(c.canonicalId);
  for(const c of state.offers||[])if(c.type==="required"&&!state.passedIds.includes(c.canonicalId))requiredIds.add(c.canonicalId);
 }
 details.textContent="確定 "+state.credits+" / 必要 "+required+"単位　｜　今期登録分は成績確定後に加算"+(y===4?"　｜　未取得必修 "+requiredIds.size+"科目（今期・再履修）":"");
 panel.classList.toggle("goal-met",needed===0&&!(y===4&&requiredIds.size));
 panel.classList.toggle("goal-critical",state.semester%2===1&&needed>0)
 const bar=$("goal-banner-progress");
 if(bar)bar.style.width=Math.max(0,Math.min(100,state.credits/required*100))+"%";
};
})();
