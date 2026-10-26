"use strict";
/* H1 α0.6.1: borrowed memories must still answer the same hypothetical task.
   Odd details are clues; no answer shifts into a different autobiographical story. */
const H1_V061_CUES=[
 [
  "協力の内容を、金銭の提供11件と機材の貸与1件に分けて確認する方法もあります。",
  "赤い矢印を3本用意し、最後の1本だけ逆向きにすることで案内を分けられます。",
  "返却表を照合し、最後に照明を消すまでを一連の確認手順にします。"
 ],
 [
  "四人なら対応2人・調整1人・記録1人に分けて担当を明確にします。",
  "切替時刻を18時12分まで詳しく記録すれば、変更の前後を追えると思います。",
  "条件変更を23回分まで記録し、どこで安定したか比較するのがよいと思います。"
 ],
 [
  "担当を火曜日と金曜日の週2回に固定すれば、引継ぎの予定も分かりやすいです。",
  "引継ぎ済みの欄には、連絡帳の余白へ星印を付けるような方法が考えられます。",
  "最初の1件だけ一緒に進めて、残りは本人に任せる方法もあると思います。"
 ],
 [
  "受付の平均時間を測り、9.8分から5.2分まで短縮するという具体的な目標を置きます。",
  "青い札を付け、終わったら裏返すことで処理中と完了済みを区別します。",
  "ベテランの先輩が最後まで納得しなくても、理由を聞き続けて記録に残します。"
 ]
];
const h161AnswerBeforeClarity=groupAnswer;
groupAnswer=function(round,idx,person){
 if(round!==1||person!==state.monsterIndex)return h161AnswerBeforeClarity(round,idx,person);
 const others=[0,1,2,3].filter(i=>i!==state.monsterIndex),source=others[[0,1,2,0,1,2][idx]];
 const entry=privateEntry(source);
 if(!entry)throw Error("借用元の非公開記録がない");
 const casePrompt=H1_V061_CASES[1][idx];
 return "「"+stripQuote(casePrompt.prefix[person])+" "+H1_V061_CUES[source][entry.option]+"」";
};
selfTest=function(){
 const before={monster:state.monsterIndex,privateAnswers:state.privateAnswers,asked:state.asked,styles:state.reverseStyles,reject:state.reject};
 let borrowing=0,branches=0,good=0,bad=0,horror=0;
 for(let m=0;m<4;m++)for(let p0=0;p0<3;p0++)for(let p1=0;p1<3;p1++)for(let p2=0;p2<3;p2++)for(let p3=0;p3<3;p3++){
  state.monsterIndex=m;state.privateAnswers=[p0,p1,p2,p3].map((option,i)=>({option,answer:privateAnswer(i,option)}));
  for(let q=0;q<6;q++){
   const other=[0,1,2,3].filter(i=>i!==m),source=other[[0,1,2,0,1,2][q]];
   const clue=H1_V061_CUES[source][state.privateAnswers[source].option];
   if(!groupAnswer(1,q,m).includes(clue))throw Error("Borrowed detail missing "+m+"/"+q);
   borrowing++;
  }
 }
 for(let m=0;m<4;m++)for(let g0=0;g0<6;g0++)for(let g1=0;g1<6;g1++)for(let g2=0;g2<6;g2++){
  state.monsterIndex=m;state.asked=[{idx:g0,round:0},{idx:g1,round:1},{idx:g2,round:2}];
  for(let a=0;a<4;a++)for(let b=a+1;b<4;b++)for(let x=0;x<3;x++)for(let y=0;y<3;y++)for(let reject=0;reject<4;reject++){
   state.reverseStyles=[{person:a,style:reverseMethods[x][0]},{person:b,style:reverseMethods[y][0]}];state.reject=reject;
   const risky=(a===m&&x===2)||(b===m&&y===2);
   const expect=risky?"horror":reject===m?"good":"bad";
   const actual=outcome();
   if(actual!==expect)throw Error("Ending mismatch");
   branches++;if(actual==="good")good++;else if(actual==="bad")bad++;else horror++;
  }
 }
 Object.assign(state,{monsterIndex:before.monster,privateAnswers:before.privateAnswers,asked:before.asked,reverseStyles:before.styles,reject:before.reject});
 if(borrowing!==1944||branches!==186624)throw Error("QA route count mismatch");
 return {borrowRoutes:borrowing,endingBranches:branches,good,bad,horror,groupCases:18};
};
window.H1_QA=selfTest;
