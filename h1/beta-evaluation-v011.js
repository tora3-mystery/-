"use strict";
/* H1 β0.1.1 | Strong ending closure + optional after-story evaluation.
 * Reports the true clue source ONLY AFTER the ending narrative is completed.
 * HORROR keeps its story-first impact, then records the interviewer takeover.
 */
const H1_B011_REPORT={
  build(){
    const kind=outcome(),culprit=state.monsterIndex,culpritName=esc(people[culprit].name);
    const rejected=state.reject>=0?esc(people[state.reject].name):"未確定";
    const info=H1_B010.inspect(),source=info.source,sourceName=esc(people[source].name);
    const strong=state.asked.find(q=>q.round===info.strongRound);
    const fact=esc(H1_V061_CUES[source][info.anchor??0]);
    const notes=state.h162Marks||[],paired=state.h106Links||[];
    const matched=paired.some(x=>x.suspect===culprit&&x.source===source&&x.round===info.strongRound);
    const found=notes.some(x=>x.person===culprit);
    const disclosed=state.reverseStyles.some(x=>x.style==="verify");
    const grade=kind==="horror"?"判定不能":kind==="bad"?"D":matched&&found?"S":"A";
    const name=kind==="horror"?"面接官の資格が失われました":kind==="bad"?"不採用者の選択に誤りがあります":"正体の特定に成功しました";
    const reason=kind==="horror"?"異形本人へ非公開情報を示したため、面接官の認証が奪われました。":kind==="bad"?"不採用にした人物は人間でした。異形は採用対象に残りました。":"異形を不採用にし、選考を無事に終了しました。";
    const certainty=matched?"借用元との一致を記録":"照合メモでの決定的な一致は未記録";
    const confidentiality=disclosed?"非公開情報の開示あり":"非公開情報の開示なし";
    return '<section class="h011-assessment panel">'+
      '<p class="eyebrow">SELECTION REPORT｜最終評価</p>'+
      '<div class="h011-end-mark">THE END</div>'+
      '<h1>今回の選考評価</h1>'+
      '<div class="h011-evaluation"><small>評価結果</small><strong class="'+(kind==="horror"?"not-rated":"")+'">'+grade+'</strong><span>'+name+'</span></div>'+
      '<p class="h011-verdict">'+reason+'</p>'+
      '<div class="h011-stat-grid">'+
      '<div><small>選んだ不採用者</small><b>'+rejected+'</b></div>'+
      '<div><small>異形の正体</small><b>'+culpritName+'</b></div>'+
      '<div><small>記録の照合</small><b>'+paired.length+'組｜'+(matched?"核心も照合済み":"その他")+'</b></div>'+
      '<div><small>情報管理</small><b>'+confidentiality+'</b></div>'+
      '</div>'+
      '<details class="h011-proof" open><summary>今回の推理の決め手</summary>'+
      '<p>共通ケース面接の<strong>第'+(info.strongRound+1)+'問</strong>で、'+culpritName+'は'+sourceName+'の非公開の個人面接で話された内容を、自分の説明に混ぜていました。</p>'+
      '<div class="h011-proof-entry"><small>非公開記録から借用された具体的な事実</small><p>'+fact+'</p></div>'+
      '<p class="tiny subtle">'+certainty+'。補助的な手掛かりはほかの2問にも配置されていました。今回の証拠の順番は、次のプレイでは変わります。</p>'+
      '</details>'+
      (kind==="horror"?'<p class="h011-after-horror">この結果の表示も、すでに'+culpritName+'の面接記録として保存されています。</p>':"")+
      '<button id="h011-again" type="button" class="btn primary wide">次の選考を始める</button>'+
      '</section>';
  }
};
// Add the actual applicant's photo to the newly registered interviewer block.
// No faceless player portrait, no big pupils, no role-exchange illustration.
const h011OriginalStage=H1UX.stage;
H1UX.stage=function(type,step,title,body){
 if(type==="horror"&&(step===1||step===2)){
   const marker='<div class="beta-reassigned'+(step===2?' beta-reassigned-final':'')+'">';
   const photo='<div class="h011-new-interviewer"><div class="avatar">'+face(state.monsterIndex,false,"neutral")+'</div></div>';
   if(!body.includes(marker))throw Error("HORROR interviewer registration block missing");
   body=body.replace(marker,marker+photo);
 }
 const r=h011OriginalStage.call(this,type,step,title,body);
 if(step===2){
  const button=el("next-ending");
  if(button){button.textContent="選考評価を見る";button.onclick=()=>{state.phase="assessment";render();};}
 }
 return r;
};
function h011RenderAssessment(){
 el("docs-wrap").hidden=true;el("bottom-mobile").hidden=true;
 el("main").innerHTML=H1_B011_REPORT.build();
 el("h011-again").onclick=()=>H1UX.reset();
}
const h011OriginalRender=render;
render=function(){
 if(state.phase!=="assessment")return h011OriginalRender();
 H1UX.shade();head();h011RenderAssessment();
};
