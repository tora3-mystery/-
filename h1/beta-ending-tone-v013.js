"use strict";
/* H1 β0.1.3 — post-selection reports are in-world HR records, not
   a guide to evidence mechanics or an explanation of grading thresholds.
   Move the entire ending into its own visual mode, reset on replay.
*/
const H1_B013={
  storyType(){return outcome();},
  buildAssessment(){
    const type=outcome(),monster=state.monsterIndex;
    const suspect=esc(people[monster].name);
    const rejected=state.reject<0?"未確定":esc(people[state.reject].name);
    const source=H1_B010.borrowedSource(),name=esc(people[source].name);
    const clue=esc(H1_V061_CUES[source][privateEntry(source)?.option??0]);
    const coreRound=H1_B010.strongRound()+1;
    // The grade remains on the internal decision slip. How the player
    // achieved it is intentionally not explained by the game.
    const matched=(state.h106Links||[]).some(x=>
      x.suspect===monster&&x.source===source&&x.round===coreRound-1);
    const marked=(state.h162Marks||[]).some(x=>x.person===monster);
    const grade=type==="horror"?"無効":type==="bad"?"D":matched&&marked?"S":"A";
    const title=type==="horror"?"面接官の登録が変更されました。":
      type==="bad"?"面接時の判断に、確認が必要です。":
      "最終選考は、問題なく終了しました。";
    const summary=type==="horror"
      ?'<div class="h113-signoff"><small>最終面接の登録担当者</small><strong>面接官：'+suspect+'</strong></div>'
      :'<div class="h113-signoff"><small>今回の不採用者</small><strong>'+rejected+'</strong></div>';
    const outcomeLine=type==="horror"
      ?"あなたが担当した面接の記録は見つかりません。":
      type==="bad"?"後日、"+suspect+"の応募記録について再照会が届きました。":
      "人事部から、選考手続きの完了が通知されました。";
    return '<section class="panel h011-assessment h113-report">'+
      '<p class="eyebrow">CONFIDENTIAL｜人事部・選考記録</p>'+
      '<div class="h011-end-mark">THE END</div>'+
      '<h1>最終選考の記録</h1>'+
      '<div class="h011-evaluation"><small>選考評価</small><strong class="'+(type==="horror"?"not-rated":"")+'">'+grade+'</strong><span>'+title+'</span></div>'+
      summary+
      '<p class="h113-conclusion">'+outcomeLine+'</p>'+
      '<details class="h113-archive"><summary>照合記録を開く</summary>'+
      '<p>'+suspect+'の発言には、'+name+'が非公開の個人面接で話していた内容が含まれていました。</p>'+
      '<blockquote>'+clue+'</blockquote>'+
      '</details>'+
      '<button id="h011-again" type="button" class="btn primary wide">別の選考を始める</button>'+
      '</section>';
  },
  applyEndingTheme(){
    const classes=["h113-outcome-good","h113-outcome-bad","h113-outcome-horror"];
    const body=document.body;
    if(!body?.classList)return;
    classes.forEach(c=>body.classList.remove(c));
    const isEnd=state.phase==="ending"||state.phase==="assessment";
    if(isEnd){
      const type=this.storyType();
      body.classList.add("h113-outcome-"+type);
      const section=el("main")?.querySelector?.(".h1-story-ending");
      const eyebrow=section?.querySelector?.(".eyebrow");
      if(eyebrow){
        eyebrow.textContent=type==="good"?"SELECTION CLOSED｜選考終了":
          type==="bad"?"PERSONNEL FILE｜入社後照会":
          "ACCESS LOG｜担当者変更";
      }
    }
  }
};
// Replace only the result document, preserve the ending's three acts.
H1_B011_REPORT.build=function(){return H1_B013.buildAssessment();};
const h113PriorRender=render;
render=function(){
  h113PriorRender();
  H1_B013.applyEndingTheme();
};
