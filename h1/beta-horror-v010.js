"use strict";
/* H1 β0.1.0 | interviewer's identity was appropriated.
   No faceless-player photograph or 'swap' diagram: only the newly registered
   interviewer's name is made explicit. The name always matches the monster.
*/
const BETA_HORROR_STAGE=H1UX.stage;
H1UX.stage=function(type,step,title,body){
 if(type!=="horror")return BETA_HORROR_STAGE.call(this,type,step,title,body);
 el("docs-wrap").hidden=true;el("bottom-mobile").hidden=true;
 const progress=[0,1,2].map(i=>'<span class="'+(i===step?'active':i<step?'done':'')+'"></span>').join("");
 el("main").innerHTML='<section class="ending panel horror h1-story-ending beta-horror"><p class="eyebrow bad">HORROR END｜面接記録の異常</p><div class="ending-stage-dots">'+progress+'</div><h1>'+title+'</h1>'+body+'<button id="next-ending" class="btn primary wide">'+(step===2?'もう一度プレイする':'その後を見る')+'</button></section>';
 el("next-ending").onclick=()=>{if(step===2)this.reset();else{state.horrorStep=step+1;render();}};
};
H1UX.horror=function(){
 const step=state.horrorStep||0,name=esc(people[state.monsterIndex].name);
 if(step===0){
  this.stage("horror",0,"面接を終了できません。",
   '<div class="h1-system-error h164-identity-error"><small>東央産業｜採用管理システム</small><strong>終了処理に失敗しました</strong><p>担当者認証に変更がありました。</p></div>'+
   '<div class="h164-action-recall"><small>非公開情報の開示</small><p>あなたは'+name+'に、他の応募者だけが話した非公開の面接内容を示した。</p><p>'+name+'は、何も言わずにこちらを見ていた。</p></div>'+
   '<p>選考結果を保存しようとしても、完了ボタンは反応しない。</p><p class="h1-horror-whisper">「……今度は、こちらが確認します」</p>');
 }else if(step===1){
  this.stage("horror",1,"面接担当者が変更されました。",
   '<div class="beta-reassigned"><small>採用管理システム｜面接官の登録情報</small><strong>面接官：'+name+'</strong><span>登録済み・有効</span></div>'+
   '<p>'+name+'は、ついさっきまで応募者席に座っていた。表情も声も変わらない。</p>'+
   '<p>変わったのは、この画面に表示される名前だけだった。</p>'+
   '<div class="h1-false-transcript"><div class="record-label">面接記録 No.005 <span>記録中</span></div><p><b>面接官：'+name+'</b></p><p>「他人の経験を、自分のものとして話したことはありますか？」</p><p>［回答を待っています］</p></div>');
 }else{
  this.stage("horror",2,"あなたの名前は、記録から消えた。",
   '<div class="beta-reassigned beta-reassigned-final"><small>人事部｜翌営業日の登録情報</small><strong>面接官：'+name+'</strong><span>この変更履歴はありません</span></div>'+
   '<div class="h1-chat-log"><b>社内連絡板｜人事部</b><p>「最終面接の担当者って、'+name+'さんでしたよね」</p><p>「そうですね。昨日もその方が担当しています」</p><p>「では、最初に選考していた人は……誰ですか？」</p></div>'+
   '<p>端末を開くと、あなたが行ったはずの質問が、すべて'+name+'の記録として保存されていた。</p>'+
   '<p class="h1-horror-whisper">どこにも、あなたが面接官だった証拠は残っていない。</p>');
 }
};
