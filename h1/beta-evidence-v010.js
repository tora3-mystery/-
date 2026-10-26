"use strict";
/* H1 β0.1.0 | randomized evidence distribution.
   Exactly one strong private-record match + two auxiliary clues,
   independently of the selected group case and group-question order.
   The same other applicant is used throughout one playthrough.
   No exact-match explanation is exposed to players.
*/
const H1_B010={
 strongLabels:["補助","強","補助"],
 strongRound(){
   return H1_V050.pick(state.seed,3,8081,state.monsterIndex);
 },
 borrowedSource(){
   const others=[0,1,2,3].filter(i=>i!==state.monsterIndex);
   return others[H1_V050.pick(state.seed,3,8082,state.monsterIndex)];
 },
 evidenceRole(round){
   if(round===this.strongRound())return "strong";
   return round<this.strongRound()
     ?(round===0?"soft":"follow")
     :(round===2?"follow":"soft");
 },
 contextLead(round,idx){
   const contextual=[
    [
     "このケースでも、考え方を別の場面に置き換えてみます。",
     "配布する資料に残す情報は、細かいところまで確認したいです。",
     "教える側と教わる側を分けるときに、以前の手順が参考になります。",
     "限られた時間なら、作業を小さな手順に分けたいです。",
     "二つの登録を区別するには、記録の特徴を揃えておきます。",
     "終了したと判断する条件を、途中の確認と分けたいです。"
    ],
    [
     "変更した内容を全員に伝える際に、例として説明するなら、",
     "後から追える記録の残し方としては、",
     "役割を決める際に具体的な方法を挙げるなら、",
     "新しい方法を取り入れるときの例として、",
     "他の人の工夫を応用する具体例として、",
     "資料が足りないときでも、まず確認する方法として、"
    ],
    [
     "評価を説明する根拠として、以前から意識しているのは、",
     "担当が変わるときでも確認を続ける方法として、",
     "仕事を残さず帰るため、終わった部分を分けるやり方として、",
     "誰が何を提案したかを誤らないために、例を挙げるなら、",
     "発言の正しさを確認するとき、具体的に見るのは、",
     "四人の案を比べるなら、記録の付け方として、"
    ]
   ];
   return contextual[round]?.[idx]||"具体的には、";
 },
 softCue(source){
   // Weak, familiar style, intentionally not diagnostic.
   return H1_V064_TRIAD.soft[source];
 },
 followCue(source,option){
   // Paraphrases the same private-record topic, without the unique value.
   const paraphrases=[
    ["協力の数を種類別に数え直すことです。","入口と出口の案内の向きを変えて区別することです。","作業の終わりまで確認した記録を残すことです。"],
    ["作業する人と記録する人を分けることです。","毎日決まった時刻に動く処理まで確認することです。","条件を何度も変更して、数字の差を比較することです。"],
    ["活動を続ける曜日を決めておくことです。","確認済みのものだけ、小さな印で区別することです。","最初は一緒にやり、残りを本人に任せることです。"],
    ["変更前と変更後の時間を測ることです。","処理中か完了済みかを札の向きで分けることです。","納得していない経験者の話も最後まで聞くことです。"]
   ];
   return paraphrases[source][option];
 },
 // Keep base responses grounded in the actual shared situation. Strong/weak
 // variations add one example, not an unrelated new personal story.
 baseResponse(round,idx,person){
   let ans=H1_V061_CASES[round][idx].human[person];
   const specific=H1_V062.humanDetails[round][idx][person];
   const emphasize=H1_V050.pick(state.seed,100,8014,round,idx,person)<35;
   if(emphasize)ans=ans.replace(/」$/," "+specific+"」").replace(/。。/g,"。");
   return ans;
 },
 formatStrong(source,option,round,idx){
   // This exact fact originates only in the selected other candidate's private
   // interview. The adapter keeps it framed as a process example.
   let fact=H1_V061_CUES[source][option];
   const lead=this.contextLead(round,idx);
   return lead+" "+fact;
 },
 formatAnswer(round,idx,person){
   const original=this.baseResponse(round,idx,person);
   if(person!==state.monsterIndex){
     // Humans also sometimes stumble and have distinctive concrete suggestions.
     if(H1_V050.pick(state.seed,100,8030,round,idx,person)<29)
       return h163Stammer(original,person,round,idx,4);
     return original;
   }
   const source=this.borrowedSource(),record=privateEntry(source);
   if(!record)throw Error("β: borrow source's private interview must be completed");
   const option=record.option;
   if(option<0||option>2)throw Error("β: invalid private evidence anchor");
   const role=this.evidenceRole(round);
   let detail="";
   if(role==="strong")detail=this.formatStrong(source,option,round,idx);
   else if(role==="follow")detail="先ほどの例を別の状況でも使うなら、"+this.followCue(source,option);
   else detail="考え方としては、"+this.softCue(source);
   const sentence=stripQuote(original);
   const text="「"+sentence+" "+detail+"」";
   return H1_V050.pick(state.seed,100,8031,round,idx,person)<31
     ?h163Stammer(text,person,round,idx,5):text;
 },
 inspect(){
   return {
    strongRound:this.strongRound(),
    source:this.borrowedSource(),
    anchor:privateEntry(this.borrowedSource())?.option??null
   };
 }
};
groupAnswer=function(round,idx,person){return H1_B010.formatAnswer(round,idx,person);};

/* No numerical identifiers, question numbers or evidence labels revealed to the
   player; keep this metadata purely in deterministic game logic. */
