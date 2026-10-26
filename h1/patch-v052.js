"use strict";
/* H1 α0.5.2: fairness and narrative polish. Loaded after patch-v051.js. */
const H1_V052 = {
 // Each route retains its original distinctive borrowed memory verbatim.
 // The lead-in makes it part of the interviewee's apparent work history,
 // rather than an unmotivated fact pasted into the answer.
 bridges:[
  [
   ["学園祭の急な予定変更では、誰が何を引き受けるかを最初に組み直しました。","搬入予定が変わったときは、次の担当も分かるよう時刻を書き残しました。","誘導の配置を変えた日は、案内の位置が決まるまで調整を重ねました。"],
   ["案内係の勤務日を変更したときは、曜日まで記録していました。","来場者への対応で起きたことも、次の係に分かるよう受付の記録に残しました。","案内方法を直した理由は、次の係にも伝わるようにメモしました。"],
   ["協賛ブースの混雑対策では、受付の待ち時間も確かめました。","担当の作業状況を分けるために、受付で小さな札を使いました。","新しい担当の分け方には反対もあったので、説明を重ねました。"],
   ["設営を立て直す際は、ほかの学生に作業の分担を助けてもらいました。","搬入時刻の確認は先輩に教わり、その後も自分で控えていました。","会場案内の配置を直すときは、経験者に確認してもらいました。"]
  ],
  [
   ["計測の予定を変える前に、研究室内の管理作業の分担を見直しました。","装置を動かす予定が変わったとき、安全案内の表示も確認し直しました。","計測が遅れた日は、最後に作業場所を閉めるところまで確認しました。"],
   ["担当が変わった日を後から追えるよう、測定準備の曜日も記録しました。","測定終了時には退室確認を二人で行い、点検表に残しました。","初めて装置を使う学生には、チェックする順番も記録して引き継ぎました。"],
   ["測定待ちの処理を分担するため、平均所要時間を出して比較しました。","装置が点検中か完了済みか、誰でも分かる表示にしました。","役割の切り分けには先輩から異論も出たので、記録を見せて説明しました。"],
   ["先輩から作業分類を教わって、通常のものと例外を分けて処理しました。","安全案内の方法はほかの学生に教わり、研究室に取り入れました。","作業終了時の確認は、研究室の先輩が残してくれた手順に従っていました。"]
  ],
  [
   ["学習会の日程が急に変わったときは、教材の調達先から確認しました。","教室を変更した日には、初めて来た方への案内表示を直しました。","指導員の予定変更があった日は、最後の片付けまで当番で分担しました。"],
   ["曜日ごとの当番が入れ替わっても分かるよう、連絡帳に日程を残しました。","送り迎えの引継ぎも、当日の記録に残すようにしました。","指導方法を変えた日は、どこまで説明したか連絡帳に書きました。"],
   ["学習会の受付が混雑したので、待ち時間を測って担当を分けました。","席への案内と終了確認を担当者で分けて、札で区別しました。","担当を替える提案には反対した指導員もいたので、理由を聞いて説明しました。"],
   ["教室で使う教材は、職員の提案で貸与分と通常分を区別しました。","教室への案内表示は先輩のやり方を参考にして試しました。","片付けを忘れない方法は、職員が使っていた確認表から学びました。"]
  ],
  [
   ["返品が集中した日は、通常処理と貸出扱いの例外を分けて確認しました。","混雑で列を組み替えた際に、店内の案内表示も貼り直しました。","当番を急に変えた日は、閉店後の返却物まで確認しました。"],
   ["担当を替えた日は、次の人に伝わるよう曜日と勤務日を残しました。","作業を引き継ぐときは、誰が最後に確認したか時刻も記録しました。","新人への引継ぎでは、何を誰に任せたかまで残しました。"],
   ["返品カウンターの混雑を整理する際、応援の人数と役割を分けました。","迷子の案内も返品窓口で受けることがあり、職員への引継ぎが必要でした。","新人が受付を担当する日は、最初の対応だけ一緒に進めました。"],
   ["先輩の提案を取り入れ、通常処理と例外を一度分けてみました。","案内表示を変えるときは、別の売場で使っていた配置も参考にしました。","閉店時の確認手順は、以前から使っていた担当者の方法を試しました。"]
  ]
 ],
 // Real humans may look different under the dimming fluorescent lights.
 // Eye changes are ambiguous. An abnormal finale is still unmistakable.
 eye(seed,monster,person,phase,round,shown){
  if(phase==="horror")return person===monster?3:0;
  const r=H1_V050.pick(seed,100,person,phase==="reverse"?31:23,round,shown?1:0);
  if(phase==="group" && round===2 && shown){
   return person===monster ? (r<51?1:0) : (r<35?1:0);
  }
  if(phase==="reverse"){
   if(person===monster)return r<31?2:r<64?1:0;
   return r<12?2:r<39?1:0;
  }
  return 0;
 },
 // Short natural reactions tied to the question being discussed rather than a
 // disconnected random sentence. There is no monster-only reaction bank.
 reactions:[
  [
   ["役割を決める前に、誰が苦手かを聞くのも大切だと思いました。","小学生のときから、そういう分担を考えていたんですね。"],
   ["失敗のあとに何を変えたか、もう少し聞いてみたくなりました。","そのとき一人で抱え込まずに済んだのはよかったですね。"],
   ["みんなの意見をどうまとめたのか、参考になりました。","人数が多いと、全員の考えを聞くのは難しそうですね。"],
   ["助けてもらった経験を覚えているのはいいですね。","周りの人のおかげだと説明できるのは大事だと思いました。"]
  ],
  [
   ["予定が変わった直後の判断は、意外と難しいですよね。","先に何を直すか決める必要があるのは、私も分かります。"],
   ["記録の残し方が違っていて、参考になります。","あとから確認する人のことを考えていたんですね。"],
   ["役割を分けた理由まで説明するのが大事ですね。","担当が曖昧なままだと、やり直しが増えますよね。"],
   ["提案をそのまま採用せず、確かめる姿勢は必要ですね。","誰の意見か確認するのも、思ったより難しい気がします。"]
  ],
  [
   ["結果が出なかったときの向き合い方は、人によって違いますね。","評価されなかった経験も話せるのは大事だと思いました。"],
   ["引継ぎには、文字にできない部分もあると思います。","後の担当者のことを考えるのは難しいですね。"],
   ["結果と過程を分けて考える話は、私にも心当たりがあります。","数字だけでは説明しきれない仕事もありますよね。"],
   ["間違いに気づいたあと、どう訂正するかが大切ですね。","説明が間違っていたと認めるのは、案外勇気が要りますね。"]
  ]
 ]
};
const h1BaseFace = face;
face=function(i,distort,phase="neutral"){
 const type=distort?"tense":phase==="group"?H1_V050.expression(state.seed,i,"group",state.round,state.b,state.shown):phase==="reverse"?H1_V050.expression(state.seed,i,"reverse",state.reverseIndex,state.reverseTargets[state.reverseIndex]??0,state.reverseShown):phase==="private"?H1_V050.expression(state.seed,i,"private",state.privateIndex,state.privatePick,state.privateShown):"neutral";
 const pupil=distort?3:H1_V052.eye(state.seed,state.monsterIndex,i,phase,state.round,state.shown);
 return '<span class="portrait-photo person-'+i+' expression-'+type+(pupil?" pupil-stage-"+pupil:"")+(distort?" uncanny":"")+'" role="img" aria-label="'+esc(people[i].name)+'の顔写真"></span>';
};
const h1OldGroupAnswer=groupAnswer;
groupAnswer=function(round,idx,person){
 if(round!==1||person!==state.monsterIndex)return h1OldGroupAnswer(round,idx,person);
 const others=[0,1,2,3].filter(i=>i!==state.monsterIndex),source=others[[0,1,2,0][idx]],entry=privateEntry(source);
 if(!entry)throw Error("借用元の個人面接記録がありません");
 const bridge=H1_V052.bridges[person][idx][entry.option];
 const borrowed=stripQuote(S.borrowing_echoes[person][source][entry.option]);
 return "「"+bridge+" "+borrowed+"」";
};
H1_V050.reaction=function(seed,round,q,monster,names){
 const speaker=this.pick(seed,4,round,q,65);
 const target=(speaker+1+this.pick(seed,3,round,q,66))%4;
 const variants=H1_V052.reactions[round][q],chosen=this.pick(seed,variants.length,speaker,round,q,67);
 const closers=["相手の方を見てから、手元のメモに戻る。","少し考え込んでから、静かにうなずく。","表情を和らげ、次の質問を待つ。","口を開きかけたあと、言葉を選んで続ける。"];
 return {speaker,target,person:names[speaker],line:"「"+names[target]+"さんのお話を聞いて、"+variants[chosen]+"」",description:names[speaker]+"は"+closers[speaker]};
};
// Never change the successful inference logic: only help players understand
// why referencing a private transcript may lead to loss of control.
const h1PreviousAfter=H1UX.after;
H1UX.after=function(){
 h1PreviousAfter.call(this);
 if(state.phase==="game"&&state.shown&&state.b===3&&(state.round===1||state.round===2)){
  const next=el("continue");
  if(typeof next?.insertAdjacentHTML==="function"){
   const line=state.round===1?"誰の提案だったのか、と尋ねたあと、こちらを見る視線が一拍だけ長く止まった。":"説明の誤りについて聞くと、なぜか面接官の発言欄にもカーソルが点滅していた。";
   next.insertAdjacentHTML("beforebegin",'<div class="h1-risk-foreshadow">'+line+'</div>');
  }
 }
 if(state.phase==="reverse"&&state.reverseConfirmed&&state.reverseShown&&state.reverseChoice==="verify"){
  const next=el("next-reverse");
  if(typeof next?.insertAdjacentHTML==="function"){
   next.insertAdjacentHTML("beforebegin",'<div class="h1-risk-foreshadow">他の応募者に非公開だった記録を口にした。その瞬間、採用管理画面の「質問者」欄が一度だけ空白になった。</div>');
  }
 }
};
const h1OldHorror=H1UX.horror;
H1UX.horror=function(){
 const first=state.horrorStep||0;
 h1OldHorror.call(this);
 if(first===0){
  const q2=state.asked[1]?.idx===3,q3=state.asked[2]?.idx===3;
  const both=state.reverseStyles.filter(x=>x.style==="verify").length===2;
  const reason=both?"非公開の記録を、複数の応募者へ繰り返し示した。":q3?"説明の誤りを問いただしたあと、相手はあなたの回答まで記録し始めた。":q2?"誰の発案かを確認したときから、こちらの問いを聞く目が変わっていた。":"誰が質問しているのか、もう分からなかった。";
  const next=el("next-ending");
  if(typeof next?.insertAdjacentHTML==="function")next.insertAdjacentHTML("beforebegin",'<p class="h1-risk-recall">'+reason+'</p>');
 }
};
const h1OriginalStage=H1UX.stage;
H1UX.stage=function(type,step,title,body){
 if(type!=="bad")return h1OriginalStage.call(this,type,step,title,body);
 el("docs-wrap").hidden=true;el("bottom-mobile").hidden=true;
 const progress=[0,1,2].map(i=>'<span class="'+(i===step?'active':i<step?'done':'')+'"></span>').join("");
 const label=step===2?"もう一度プレイする":"その後を見る";
 el("main").innerHTML='<section class="ending panel bad h1-story-ending h1-bad-story"><p class="eyebrow bad">BAD END｜採用してはいけない人</p><div class="ending-stage-dots">'+progress+'</div><h1>'+title+'</h1>'+body+'<button id="next-ending" class="btn primary wide">'+label+'</button></section>';
 el("next-ending").onclick=()=>{if(step===2)this.reset();else{state.badStep=step+1;render();}};
};
H1UX.bad=function(){
 const step=state.badStep||0,culprit=esc(people[state.monsterIndex].name),rejected=esc(people[state.reject].name);
 if(step===0){
  const roster=people.filter((p,i)=>i!==state.reject).map(p=>'<div class="h1-result-row"><strong>'+esc(p.name)+'</strong><b class="approved">採用予定</b></div>').join("");
  this.stage("bad",0,"三名の採用を決めた。",'<div class="h1-result-paper"><b class="h1-accept-mark">✓ 最終選考結果の登録が完了しました</b>'+roster+'</div><p>不採用としたのは'+rejected+'。不採用通知を送信すると、画面はいつもの色に戻った。</p><p>少なくとも、その日は何も起きなかった。</p>');
 }else if(step===1){
  this.stage("bad",1,"四月、知らない笑顔があった。",'<div class="h1-bad-photo"><small>2027年4月｜新入社員紹介</small><div class="ending-portraits ominous">'+[0,1,2,3].filter(i=>i!==state.reject).map(i=>'<div class="h1-final-person"><div class="avatar">'+face(i,false)+'</div><small>'+esc(people[i].name)+'</small></div>').join("")+'</div></div><p>社内報の写真で、'+culprit+'はごく自然に笑っていた。</p><p>その隣の社員も、その隣の社員も、なぜか同じ角度で顔を傾けていた。</p>');
 }else{
  this.stage("bad",2,"人事部からの照会。",'<div class="h1-morning-memo"><small>入社後｜人事部・記録照会</small><h3>過去の応募履歴の確認について</h3><p>'+culprit+'の職歴申告には、別人の経験と一致する記述が複数見つかっています。面接時の個人記録と原本の再確認をお願いします。</p></div><p>画面に届いた確認依頼を開くと、あなたの面接記録には「異常なし」と表示されていた。</p><p class="h1-bad-lastline">不採用にすべき人を、会社に入れてしまった。</p><details><summary>今回の選考記録を振り返る</summary>'+h1FullRecord()+'</details>');
 }
};
function h1FullRecord(){
 const priv='<h4>個人面接</h4>'+people.map((p,i)=>{
  const e=state.privateAnswers[i];if(!e)return "";
  return '<details><summary>'+esc(p.name)+'｜個人面接</summary><p><b>面接官：</b>'+esc(privateQuestions[i][e.option].q)+'</p><p><b>応募者：</b>'+esc(e.answer)+'</p></details>';
 }).join("");
 const group='<h4>グループ面接</h4>'+getRecords();
 const rev='<h4>逆質問</h4>'+state.reverseStyles.map(x=>{
  const i=x.person,k=reverseMethods.findIndex(item=>item[0]===x.style),answer=i===state.monsterIndex?S.reverse_monster[i][k]:S.reverse_human[i][k];
  return '<details><summary>'+esc(people[i].name)+'｜逆質問</summary><p><b>応募者：</b>'+esc(S.reverse_questions[i])+'</p><p><b>面接官：</b>'+esc(S.reverse_replies[x.style])+'</p><p><b>応募者：</b>'+esc(answer)+'</p></details>';
 }).join("");
 return '<div class="h1-full-record">'+priv+group+rev+'</div>';
}
const h1OriginalGood=H1UX.good;
H1UX.good=function(){
 h1OriginalGood.call(this);
 if((state.goodStep||0)===2){
  const next=el("next-ending");
  if(typeof next?.insertAdjacentHTML==="function"){
   const privAndReverse='<h4>個人面接の記録</h4>'+people.map((p,i)=>{const e=state.privateAnswers[i];return e?'<details><summary>'+esc(p.name)+'</summary><p>'+esc(privateQuestions[i][e.option].q)+'</p><p>'+esc(e.answer)+'</p></details>':"";}).join("")+
   '<h4>逆質問の記録</h4>'+state.reverseStyles.map(x=>{const i=x.person,k=reverseMethods.findIndex(item=>item[0]===x.style),reply=i===state.monsterIndex?S.reverse_monster[i][k]:S.reverse_human[i][k];return '<details><summary>'+esc(people[i].name)+'</summary><p>'+esc(S.reverse_questions[i])+'</p><p>'+esc(S.reverse_replies[x.style])+'</p><p>'+esc(reply)+'</p></details>';}).join("");
   next.insertAdjacentHTML("beforebegin",'<details class="h1-full-record"><summary>個人面接・逆質問の記録を確認</summary>'+privAndReverse+'</details>');
  }
 }
};
const h1PriorEnding=renderEnding;
renderEnding=function(){
 if(outcome()==="bad")return H1UX.bad();
 return h1PriorEnding();
};
const h1OriginalReset=H1UX.reset;
H1UX.reset=function(){state.badStep=0;return h1OriginalReset.call(this);};
