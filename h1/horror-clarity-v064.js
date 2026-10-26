"use strict";
/* H1 α0.6.4 | Horror ending: make the role reversal explicit.
   The creature does not become physically monstrous.
   The horrific change is in records, identity, and power. */
H1UX.horror=function(){
 const step=state.horrorStep||0;
 const culprit=esc(people[state.monsterIndex].name);
 if(step===0){
  this.stage("horror",0,"面接を終了できません。", 
   '<div class="h1-system-error h164-identity-error"><small>東央産業｜面接管理システム</small><strong>終了処理に失敗しました</strong><p>面接担当者の本人確認が一致しません。</p></div>'+
   '<div class="h164-action-recall"><small>面接記録｜非公開情報の開示</small><p>あなたは'+culprit+'に、他の応募者だけが話した非公開の面接内容を示した。</p><p>'+culprit+'は、あなたがどこまで疑っているのかを知った。</p></div>'+
   '<div class="h164-scan"><div><small>登録されていた面接官</small><b>あなた</b><span>本人確認：失効</span></div><div><small>新しい面接官</small><b>確認中……</b><span>登録内容を更新しています</span></div></div>'+
   '<p>席の向こうにいる'+culprit+'は、面接のときと変わらない表情であなたを見ていた。</p>'+
   '<p class="h1-horror-whisper">「次は、こちらから質問させてください」</p>');
 }else if(step===1){
  this.stage("horror",1,"面接官が変更されました。",
   '<div class="h164-system-switch"><small>採用管理システム｜権限変更通知</small><div class="h164-before"><b>変更前</b><span>面接官：あなた　／　応募者：'+culprit+'</span></div><div class="h164-arrow">↓</div><div class="h164-after"><b>変更後</b><span>面接官：'+culprit+'　／　応募者：あなた</span></div></div>'+
   '<div class="h1-role-flip"><div><small>面接官</small><div class="avatar">'+face(state.monsterIndex,false,"neutral")+'</div><b>'+culprit+'</b></div><span>→</span><div><small>応募者</small><div class="h1-empty-portrait"></div><b>あなた</b></div></div>'+
   '<p>顔も声もさっきと同じだった。変わったのは、記録に表示される役割だけだ。</p>'+
   '<div class="h1-false-transcript"><div class="record-label">面接記録 No.005 <span>録音中</span></div><p><b>面接官：'+culprit+'</b>「これまでに、他人の経験を自分のものとして話したことはありますか？」</p><p><b>応募者：あなた</b>［回答待ち］</p></div>');
 }else{
  this.stage("horror",2,"面接官は、あなたではない。",
   '<div class="h1-morning-memo"><small>翌営業日｜人事部通達</small><h3>最終面接担当者の変更について</h3><p>'+culprit+'を新しい面接担当者として登録しました。前任者の記録は、応募者管理システムに移管されています。</p></div>'+
   '<div class="h164-final-record"><small>採用管理システム｜応募者情報</small><p>応募者番号：005</p><strong>氏名：あなた</strong><p>面接状況：回答待ち</p><p>面接官：'+culprit+'</p></div>'+
   '<div class="h1-chat-log"><b>人事部・連絡メモ</b><p>「昨日まで面接官だった人、応募者一覧に載っているんだけど」</p><p>「最初から五人いたんじゃなかった？」</p><p>「昨日の面接担当者は'+culprit+'でしょう？」</p></div>'+
   '<p class="h1-horror-whisper">面接室の向こうから、あなたの声で「本日はよろしくお願いいたします」と聞こえた。</p>');
 }
};
