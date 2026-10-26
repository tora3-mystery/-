"use strict";
const H1UX={
 originalRender:render, originalEnding:renderEnding, originalDocs:docMarkup, originalMood:mood,
 level(){
  if(state.phase==="private"||state.phase==="private-select")return Math.min(2,state.privateAnswers.filter(Boolean).length*.4+(state.privateShown?.3:0));
  if(state.phase==="game")return 2.2+state.round*1.3+(state.shown?.7:0);
  if(state.phase==="reverse")return 6+state.reverseIndex+(state.reverseShown?.6:0)+(state.reverseConfirmed?.3:0);
  if(state.phase==="decision")return 8.3;
  if(state.phase==="ending"&&outcome()==="horror")return 10;
  return 0;
 },
 shade(){
  if(!document.body?.classList)return;
  const level=this.level(),t=level/10;
  for(let i=0;i<5;i++)document.body.classList.remove("h1-dread-"+i);
  document.body.classList.add("h1-dread-"+(level>=9?4:level>=6?3:level>=4?2:level>=2?1:0));
  const rgb=(light,dark)=>"rgb("+light.map((v,i)=>Math.round(v+(dark[i]-v)*t)).join(",")+")";
  document.body.style.setProperty("--h1-site-color",rgb([231,236,236],[133,146,156]));
  document.body.style.setProperty("--h1-room-bright",String(Math.max(.54,1-level*.046)));
 },
 reset(){
  state.goodStep=0;state.horrorStep=0;
  Object.assign(state,{seed:Math.floor(Math.random()*2147483647),docsPinned:false,reverseTargets:[],reverseConfirmed:false,reverseStyles:[],reverseIndex:0,reverseShown:false,reverseChoice:"policy",monsterIndex:drawMonster(),phase:"intro",privateIndex:0,privatePick:0,privateShown:false,privateAnswers:[null,null,null,null],round:0,a:0,b:0,shown:false,asked:[],tab:"file",person:0,archive:false,recordsOpen:true,reject:-1});render();
 },
 stage(type,step,title,body){
  el("docs-wrap").hidden=true;el("bottom-mobile").hidden=true;
  const progress=[0,1,2].map(i=>'<span class="'+(i===step?'active':i<step?'done':'')+'"></span>').join("");
  el("main").innerHTML='<section class="ending panel '+type+' h1-story-ending"><p class="eyebrow '+(type==="good"?'good':'bad')+'">'+(type==="good"?'GOOD END｜選考終了':'HORROR END｜まだ終わっていません')+'</p><div class="ending-stage-dots">'+progress+'</div><h1>'+title+'</h1>'+body+'<button id="next-ending" class="btn primary wide">'+(step===2?'もう一度プレイする':type==="good"?'その後を見る':'退室する')+'</button></section>';
  el("next-ending").onclick=()=>{if(step===2)this.reset();else{if(type==="good")state.goodStep=step+1;else state.horrorStep=step+1;render();}};
 },
 good(){
  const step=state.goodStep||0,ok=[0,1,2,3].filter(i=>i!==state.monsterIndex);
  if(step===0){
   const rows=people.map((p,i)=>'<div class="h1-result-row"><strong>'+esc(p.name)+'</strong><b class="'+(i===state.monsterIndex?'rejected':'approved')+'">'+(i===state.monsterIndex?'不採用':'採用予定')+'</b></div>').join("");
   this.stage("good",0,"選考結果が確定しました。",'<div class="h1-result-paper"><b class="h1-accept-mark">✓ 選考結果の登録が完了しました</b>'+rows+'</div><p>確定ボタンを押したあと、何も起きなかった。</p><p>廊下では、いつもどおりエレベーターが動いている。</p>');
  }else if(step===1){
   this.stage("good",1,"面接室には、誰もいない。",'<div class="h1-vacant-room"><small>第4面接室｜終了後</small><div class="h1-four-chairs"><i></i><i></i><i></i><i></i></div><p>蛍光灯の低い音が戻ってきた。</p></div><p>さっきまで暗く見えた部屋は、ただの会議室だった。</p><p>扉を閉める前に振り返る。四つの椅子は、どれも空いている。</p>');
  }else{
   const portraits='<div class="ending-portraits">'+ok.map(i=>'<div class="h1-final-person"><div class="avatar">'+face(i,false)+'</div><small>'+esc(people[i].name)+'</small></div>').join("")+'</div>';
   this.stage("good",2,"三人は、それぞれの春へ。",'<div class="h1-good-memo"><small>後日報告｜人事部</small><strong>三人の採用手続きが始まった</strong><p>'+ok.map(i=>esc(people[i].name)).join('、')+'へ選考通過を通知しました。三人は受諾し、入社書類の確認へ進んでいます。不採用者の名義での手続きや、記録の書き換えは確認されていません。</p></div>'+portraits+'<p class="h1-final-line">あなたの面接は、確かに終わった。</p><details><summary>質問・回答の記録を確認</summary>'+getRecords()+'</details>');
  }
 },
 horror(){
  const step=state.horrorStep||0,who=esc(people[state.monsterIndex].name);
  if(step===0){
   this.stage("horror",0,"退室してください。",'<div class="h1-system-error"><small>面接システム｜終了処理</small><strong>終了できません</strong><p>面接記録の評価者と回答者が一致しません。</p></div><div class="h1-horror-room"><small>第4面接室</small><p>一つ、また一つ。天井の照明が消えていく。</p><p>椅子が引かれる音がする。応募者席からではない。</p></div><p class="h1-horror-whisper">「……まだ、あなたの番が残っています」</p>');
  }else if(step===1){
   this.stage("horror",1,"次は、あなたの面接です。",'<div class="h1-role-flip"><div><small>面接官</small><div class="avatar">'+face(state.monsterIndex,true)+'</div><b>'+who+'</b></div><span>↔</span><div><small>応募者</small><div class="h1-empty-portrait"></div><b>あなた</b></div></div><div class="h1-false-transcript"><div class="record-label">面接記録 No.005 <span>録音中</span></div><p><b>面接官：</b>「他人の経験を、自分のものとして話したことはありますか？」</p><p><b>応募者：</b>［発言を待っています］</p><p>「黙っている時間も、記録されますよ」</p></div>');
  }else{
   this.stage("horror",2,"面接官は、あなたではない。",'<div class="h1-morning-memo"><small>翌営業日｜人事部通達</small><h3>最終面接担当者の変更</h3><p>本日より、'+who+'を面接担当者に登録しました。前任者の情報は応募者管理システムへ移管済みです。</p></div><div class="h1-chat-log"><b>人事部・連絡メモ</b><p>「昨日までの面接官、応募者一覧に載ってるよね」</p><p>「最初から応募者だったと思うけど」</p><p>「……昨日の面接、誰が担当したんだっけ」</p></div><p class="h1-horror-whisper">ドアの向こうから、あなたの声で「本日はよろしくお願いいたします」と聞こえた。</p>');
  }
 },
 after(){
  if(state.phase==="game"&&state.shown){
   const lines=["相づちを返した声が、少し遠く聞こえた。四人は次の質問を待っている。","回答が終わると、あなたの相づちだけが記録に残った。誰かが記録画面を見ている。","最後の回答のあと、誰かがこちらを見た。<br>「では、面接官の方はどう思われますか？」"];
   const b=el("continue");if(typeof b?.insertAdjacentHTML==="function")b.insertAdjacentHTML("beforebegin",'<div class="h1-reverse-cue">'+lines[state.round]+'</div>');
  }
  if(state.phase==="reverse"){
   const m=el("main");if(typeof m?.insertAdjacentHTML==="function")m.insertAdjacentHTML("afterbegin",'<div class="h1-reverse-cue"><small>面接進行記録</small><br>質問者：応募者　／　回答者：あなた'+(state.reverseShown?'　／　評価：記録中':'')+'</div>');
  }
 }
};
docMarkup=function(){
 const active=state.tab==="archive"?"archive":"file";
 const tabs='<div class="tabs-doc"><button data-tab="file" class="'+(active==="file"?'on':'')+'">応募者カルテ（ES・面接記録）</button><button data-tab="archive" class="'+(active==="archive"?'on':'')+'">過年度記録</button></div>';
 if(active==="archive"){const original=H1UX.originalDocs();const i=original.indexOf('<div class="archive-intro">');return tabs+original.slice(i);}
 const nav='<div class="people-nav">'+people.map((p,i)=>'<button data-person="'+i+'" class="'+(state.person===i?'on':'')+'">'+String(i+1).padStart(2,"0")+' '+p.name.split(" ")[0]+'</button>').join("")+'</div>';
 const i=state.person;
 const hints=state.phase==="private"&&!state.privateShown&&i===state.privateIndex?'<div class="es-hints"><b>ESから質問を選ぶ</b>'+privateQuestions[i].map((q,k)=>'<button data-private-option="'+k+'">'+esc(q.term)+' → 質問へ</button>').join("")+'</div>':"";
 const groupHints=shortcuts[i].filter(x=>state.phase==="game"&&!state.shown&&x.round===state.round).map(x=>'<button data-shortcut="'+x.idx+'">'+esc(x.label)+' → 質問を選ぶ</button>').join("");
 return tabs+nav+'<div class="h1-dossier-title"><small>CONFIDENTIAL / CANDIDATE FILE</small><h3>'+esc(people[i].name)+'｜応募者カルテ</h3></div>'+resumeMarkup(i,false)+hints+(groupHints?'<div class="es-hints">'+groupHints+'</div>':"")+'<div class="h1-dossier-divider">本日の個人面接記録</div>'+recordMarkup(i);
};
mood=function(){
 if(state.phase==="reverse")return "質問を返す立場になった途端、部屋が少し狭く感じる。";
 if(state.round===0)return H1UX.originalMood();
 if(state.round===1)return "空調の音が止まった。誰も気に留めないまま、面接は進む。";
 return "窓が暗い。気がつけば、四人ともこちらの返事を待っている。";
};
renderEnding=function(){
 if(outcome()==="good")return H1UX.good();
 if(outcome()==="horror")return H1UX.horror();
 return H1UX.originalEnding();
};
render=function(){
 H1UX.shade();if(state.phase==="intro"){state.goodStep=0;state.horrorStep=0;}
 H1UX.originalRender();H1UX.after();
};
