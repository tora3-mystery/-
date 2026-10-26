"use strict";
const VERSION = "α0.4.3";
const UPDATED = "2026.10.26 14:28 JST";
const people = [
 {name:"大野 彩花",school:"経営学部・2027年3月卒業見込み",initial:"大",tone:"warm",character:"社交的で段取り上手。成果をやや大きく表現するが、自分で確認すると訂正できる。",es:"学園祭実行委員会で協賛交渉を担当しました。企業12社の協力を取りつけ、当日は赤い養生テープで来場者の動線を改善しました。誰も気づかない仕事を先に拾うことを大切にしています。",record:"協賛金を提供したのは11社で、残り1社は機材貸与でした。床に赤い矢印を3本貼り、最後の1本だけ逆向きにして出口を案内しました。"},
 {name:"岡野 直人",school:"理工学研究科・2027年3月修了見込み",initial:"岡",tone:"cool",character:"口下手だが誠実。数字を正確に覚え、記録の裏付けを重視する。",es:"4人の研究チームで環境計測装置の精度改善に取り組みました。測定条件を切り分け、誤差を約15％低減しました。午後6時12分に記録された異常値がきっかけでした。",record:"装置の自動校正が毎日18時12分に作動していました。23回目の条件変更で測定が安定しました。相対誤差は7.8％から6.6％になりました。"},
 {name:"澤田 千尋",school:"社会学部・2027年3月卒業見込み",initial:"澤",tone:"soft",character:"穏やかで、質問意図を即座に理解する。やや模範的すぎる印象がある。",es:"大学2年次から地域の学習支援に参加しました。週2回、子どもに合わせた教材を工夫し、最後の一人が帰るまで会場に残りました。相手の立場で考える姿勢を学びました。",record:"学習支援では子ども一人ひとりに合わせて教材を変えていました。特に、最後まで責任を持って活動することを心掛けました。"},
 {name:"水野 海斗",school:"経済学部・2027年3月卒業見込み",initial:"水",tone:"earth",character:"率直で合理的。面接官にも意見を返すが、具体的な実績はある。",es:"スーパーのアルバイトで返品対応を改善しました。役割を整理して対応時間を約半分に短縮。反対意見もありましたが、現場で試しながら説明しました。",record:"確認待ちの商品には青い札を付け、処理が済んだら裏返しました。平均対応時間は9.8分から5.2分に改善しました。反対した先輩もいました。"}
];
const S=H1_V04;
const rounds=S.questions.map((group,round)=>group.map((q,idx)=>({q,risk:0,ans:S.human_group[round][idx]})));
const privateQuestions=S.private.map(group=>group.map(q=>({term:q.term,q:q.q,answer:q.human,monster:q.monster,fact:q.fact})));
function drawMonster(){return Math.floor(Math.random()*4);}
function privateEntry(i){return state.privateAnswers[i];}
function privateAnswer(i,opt){const x=privateQuestions[i][opt];return i===state.monsterIndex?x.monster:x.answer;}
function stripQuote(t){return String(t).replace(/^「/,"").replace(/」$/,"");}
function groupAnswer(round,idx,person){
 if(person!==state.monsterIndex)return rounds[round][idx].ans[person];
 if(round===0)return S.monster_group_first[person][idx];
 if(round===2)return S.monster_group_third[person][idx];
 const others=[0,1,2,3].filter(i=>i!==state.monsterIndex);
 const source=others[[0,1,2,0][idx]],entry=privateEntry(source);
 if(!entry)throw Error("個人面接記録が未保存："+source);
 const prefix=stripQuote(S.monster_second_base[person][idx]);
 const borrowed=stripQuote(S.borrowing_echoes[person][source][entry.option]);
 return "「"+prefix+" "+borrowed+"」";
}
const state={docsPinned:false,reverseTargets:[],reverseConfirmed:false,reverseStyles:[],reverseIndex:0,reverseShown:false,reverseChoice:"policy",monsterIndex:drawMonster(),phase:"intro",privateIndex:0,privatePick:0,privateShown:false,privateAnswers:[null,null,null,null],round:0,a:0,b:0,shown:false,asked:[],tab:"es",person:0,archive:false,recordsOpen:true,reject:-1};
const archive=S.archive.map(x=>({year:x.year,name:x.name,result:"最終選考・不採用",body:x.text,note:x.note,transcript:x.transcript}));
function el(id){return document.getElementById(id);}
function esc(x){return String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
// 可視化したいのは本人が実際に話した語句。怪異の正解を示す色は使わない。
function highlightWords(text,words){
 const original=String(text),terms=[...new Set(words.filter(Boolean))].sort((a,b)=>b.length-a.length);
 let pos=0,result="";
 while(pos<original.length){
  let start=-1,word="";
  for(const candidate of terms){const at=original.indexOf(candidate,pos);if(at>=0&&(start<0||at<start||(at===start&&candidate.length>word.length))){start=at;word=candidate;}}
  if(start<0){result+=esc(original.slice(pos));break;}
  result+=esc(original.slice(pos,start))+'<u class="document-keyword">'+esc(word)+'</u>';
  pos=start+word.length;
 }
 return result;
}
const recordWords=["担当","引継ぎ","記録","評価","成果","完了"];
function face(i,distort){
 const cls="portrait-photo person-"+i+(distort?" uncanny":"");
 return '<span class="'+cls+'" role="img" aria-label="'+esc(people[i].name)+'の顔写真"></span>';
}

// 面接中の通常の緊張演出。異形の識別情報を混ぜない。
function tension(){return state.asked.length>=3?2:0;}
function mood(){
 if(state.phase==="reverse")return "応募者は全員、こちらの返答を待っている。誰が選ばれるのか、まだ分からない。";
 if(state.round===0)return "4人は少し緊張している。岡野が手元を見つめ、水野が椅子に座り直した。";
 if(state.round===1)return "ひとりが小さく言い直した。別の候補者は、黙って次の質問を待っている。";
 return "面接の終わりが近づいている。大野が呼吸を整え、澤田が背筋を伸ばした。";
}
function head(){
 const step={intro:0,"private-select":1,private:1,game:2,reverse:3,decision:4,ending:5}[state.phase]??0;
 el("header-state").textContent=["PROLOGUE","PERSONAL INTERVIEW","GROUP INTERVIEW","REVERSE QUESTIONS","FINAL DECISION","RESULT"][step];
 el("version").textContent=VERSION+"｜更新 "+UPDATED;
 const p=state.phase==="intro"||state.phase==="private"||state.phase==="private-select"?0:state.phase==="game"?1:state.phase==="reverse"?2:state.phase==="decision"?3:4;
 el("progress").innerHTML=["個人","グループ","逆質問","判定","結果"].map((x,i)=>'<span class="'+(i<p?'done':i===p?'on':'')+'">'+x+'</span>').join("");
}
function chooseTab(x){state.tab=x;renderDocs("tab");}
function selectPerson(i){state.person=i;state.docsPinned=true;renderDocs("person");}
const shortcuts=[
 [{round:0,idx:2,label:"協賛活動・リーダー経験"},{round:1,idx:0,label:"赤い養生テープ"},{round:2,idx:0,label:"成果の評価"}],
 [{round:0,idx:1,label:"実験時の失敗"},{round:1,idx:1,label:"測定条件の記録"},{round:2,idx:2,label:"実験の結果と過程"}],
 [{round:0,idx:2,label:"学習支援での取りまとめ"},{round:1,idx:2,label:"学習支援の役割分担"},{round:2,idx:1,label:"担当者への引継ぎ"}],
 [{round:0,idx:2,label:"改善活動での役割"},{round:1,idx:2,label:"返品対応の工夫"},{round:2,idx:0,label:"反対意見への対応"}]
];
function resumeMarkup(i,compact=false){
 const p=people[i],n=String(i+1).padStart(2,"0");
 return '<div class="resume-sheet '+(compact?'resume-compact':'')+'"><div class="resume-label"><b>ENTRY SHEET</b><span>新卒採用｜応募書類 No.'+n+'</span></div><div class="resume-identity"><div class="resume-data"><span class="resume-field">氏名</span><h3>'+esc(p.name)+'</h3><span class="resume-field">学校・卒業見込み</span><p>'+esc(p.school)+'</p></div><div class="resume-photo"><div class="avatar">'+face(i,false)+'</div><small>応募者写真</small></div></div><div class="resume-essay"><span class="resume-field">学生時代に力を入れたこと</span><p>'+highlightWords(p.es,privateQuestions[i].map(x=>x.term).concat(["12社","4人","青い札","学習支援","返品対応","養生テープ"]))+'</p></div></div>';
}
function recordMarkup(i){
 const p=people[i],entry=privateEntry(i);
 if(!entry)return '<div class="transcript-sheet"><div class="record-label">INTERVIEW RECORD <span>未実施</span></div><p>この応募者への個人面接はまだ実施されていません。</p></div>';
 return '<div class="transcript-sheet"><div class="record-label">INTERVIEW RECORD <span>自動文字起こし／非公開</span></div><h3>'+esc(p.name)+'｜個人面接</h3><div class="spoken interviewer"><b>面接官</b><p>'+esc(privateQuestions[i][entry.option].q)+'</p></div><div class="spoken applicant"><b>'+esc(p.name)+'</b><p>'+highlightWords(entry.answer,[privateQuestions[i][entry.option].term])+'</p></div></div>';
}
function docMarkup(){
 const tabs='<div class="tabs-doc" role="tablist" aria-label="選考資料の種類"><button type="button" data-tab="es" role="tab" aria-selected="'+(state.tab==="es")+'" class="'+(state.tab==="es"?'on':'')+'">ES・履歴書</button><button type="button" data-tab="record" role="tab" aria-selected="'+(state.tab==="record")+'" class="'+(state.tab==="record"?'on':'')+'">面接記録</button><button type="button" data-tab="archive" role="tab" aria-selected="'+(state.tab==="archive")+'" class="'+(state.tab==="archive"?'on':'')+'">過年度記録</button></div>';
 if(state.tab==="archive"){
  return tabs+'<div class="archive-intro"><b>機密｜過年度選考資料</b><p>2018〜2023年度の最終面接文字起こし（抜粋）。質問・回答・当時の所見を照合してください。</p></div><div class="paper">'+archive.map(x=>'<details class="old"><summary><span class="archive-year">'+x.year+'年度</span> '+esc(x.name)+'｜'+x.result+'</summary><div class="archive-body"><div class="archive-transcript">'+x.transcript.map(([speaker,line])=>'<div class="archive-line"><b>'+esc(speaker)+'</b><p>'+highlightWords(line,recordWords)+'</p></div>').join('')+'</div><div class="archive-assessment"><b>選考所見</b><p>'+esc(x.note)+'</p></div></div></details>').join('')+'</div>';
 }
 const profiles='<div class="people-nav">'+people.map((p,i)=>'<button type="button" data-person="'+i+'" class="'+(state.person===i?'on':'')+'">'+String(i+1).padStart(2,"0")+' '+p.name.split(" ")[0]+'</button>').join('')+'</div>';
 if(state.tab==="es"){
  const current=state.phase==="private"&&!state.privateShown&&state.person===state.privateIndex;
  const privateHints=current?'<div class="es-hints"><b>この記述から質問する</b>'+privateQuestions[state.privateIndex].map((q,i)=>'<button data-private-option="'+i+'" type="button">'+esc(q.term)+' → 質問へ</button>').join("")+'</div>':'';
  const hints=shortcuts[state.person].filter(x=>state.phase==="game"&&!state.shown&&x.round===state.round);
  const groupHints=hints.length?'<div class="es-hints"><b>関連する共通質問</b>'+hints.map(x=>'<button data-shortcut="'+x.idx+'" type="button">'+esc(x.label)+' → 質問を選ぶ</button>').join("")+'</div>':'';
  return tabs+profiles+resumeMarkup(state.person,false)+privateHints+groupHints;
 }
 return tabs+profiles+recordMarkup(state.person);
}
function renderDocs(mode="keep"){
 const panel=el("docs");
 if(!panel)return;
 const oldScroll=panel.scrollTop;
 panel.innerHTML=docMarkup();
 panel.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>chooseTab(b.dataset.tab)));
 panel.querySelectorAll("[data-person]").forEach(b=>b.addEventListener("click",()=>selectPerson(Number(b.dataset.person))));
 panel.querySelectorAll("[data-shortcut]").forEach(b=>b.addEventListener("click",()=>{const idx=Number(b.dataset.shortcut);state.b=idx;closeDocs();render();}));
 panel.querySelectorAll("[data-private-option]").forEach(b=>b.addEventListener("click",()=>{state.privatePick=Number(b.dataset.privateOption);closeDocs();render();}));
 if(mode==="keep")panel.scrollTop=oldScroll;
 else{
  panel.scrollTop=0;
  const target=mode==="tab"?panel.querySelector('[data-tab="'+state.tab+'"]'):panel.querySelector('[data-person="'+state.person+'"]');
  if(target&&typeof target.focus==="function")target.focus({preventScroll:true});
 }
}
function renderIntro(){
 el("main").innerHTML='<section class="opening"><p class="eyebrow">CONFIDENTIAL｜人事部より</p><h1>本日の最終面接について</h1><p>4名の最終候補者から、<strong>1名を不採用</strong>としてください。</p><p>ただし、社内調査により<strong>1名は人間ではない存在</strong>である可能性が極めて高いと判明しました。</p><p>過去の事例では、この存在は<strong>他の学生の非公開面接記録を学習し、自分の経験として語る</strong>と報告されています。どの応募者が異形になるかは、プレイごとに変わります。</p><p class="warning">正体を疑っていることを悟られないでください。通常どおり面接を実施し、静かに1名を見送ってください。</p>'+
 '<div class="guide"><h2>あなたが行うこと</h2><ol><li>4名を順番に個人面接し、ESから各1問を選ぶ</li><li>自動文字起こしされた4人の回答を資料として確認する</li><li>全員同席のグループ面接で共通質問を3問選ぶ</li><li>4名の逆質問から2名を選び、それぞれに回答する</li><li>回答の出所・時系列・過去記録との重複を調べる</li><li>面接終了後、別室で不採用者を1人選ぶ</li></ol><p>質問の仕方によっては、会議室の空気が変わります。通常の深掘りは問題ありませんが、異形に正体への疑いを悟らせる質問の連続は危険です。</p><p class="tiny subtle">選考結果は後日通知。音声・個人情報の送信はありません。架空の会社・人物によるフィクションです。</p></div>'+
 '<button class="btn primary wide" id="start">選考資料を確認して面接を始める</button></section>';
 el("docs-wrap").hidden=true;el("bottom-mobile").hidden=true;
 el("start").onclick=()=>{state.phase="private-select";state.tab="es";render();};
}

function renderPrivateHub(){
 el("docs-wrap").hidden=false;el("bottom-mobile").hidden=false;
 const count=state.privateAnswers.filter(Boolean).length;
 const cards=people.map((p,i)=>{
  const complete=!!state.privateAnswers[i];
  const control=complete?'<button type="button" id="review-person-'+i+'" class="btn outline wide">面接記録を見る</button>':'<button type="button" id="interview-person-'+i+'" class="btn primary wide">この学生を個人面接する</button>';
  return '<article class="interview-candidate"><div class="candidate-head"><div class="avatar smallavatar">'+face(i,false)+'</div><div><span class="mini-index">応募者 '+String(i+1).padStart(2,"0")+'</span><h3>'+esc(p.name)+'</h3><small>'+esc(p.school)+'</small></div></div><p class="candidate-brief">'+esc(p.es)+'</p><div class="candidate-status '+(complete?'is-done':'')+'">'+(complete?'✓ 個人面接済み・記録あり':'● 個人面接は未実施')+'</div>'+control+'</article>';
 }).join('');
 el("main").innerHTML='<section class="panel hub-title"><p class="eyebrow">PERSONAL INTERVIEW｜選考準備</p><h1>どの応募者から面接しますか？</h1><p>4名の個人面接は<strong>好きな順番</strong>で実施できます。各人のESから1問選び、回答を記録してください。</p><div class="hub-progress"><b>面接済み '+count+' / 4名</b><span>'+people.map((_,i)=>state.privateAnswers[i]?'●':'○').join(' ')+'</span></div></section><section class="hub-grid">'+cards+'</section><section class="archive-callout"><div class="archive-head"><span class="file-tag">機密資料</span><h2>過年度の面接記録</h2></div><p>今回の候補者だけではなく、<strong>過去に不採用となった応募者の記録</strong>も照合できます。最初の面接前に目を通しても、後から読み返しても構いません。</p><div class="archive-names">'+archive.map(x=>'<span>'+x.year+'｜'+esc(x.name)+'</span>').join('')+'</div><button id="archive-from-hub" class="btn outline wide" type="button">過年度の選考記録を読む</button></section><div class="hub-bottom">'+(count===4?'<button id="begin-group" class="btn primary wide">4名の個人面接が完了しました｜グループ面接へ進む</button>':'<p class="subtle">個人面接をあと'+(4-count)+'名実施すると、グループ面接に進めます。</p><button type="button" class="btn wide" disabled>グループ面接へ（'+count+'/4名完了）</button>')+'</div>';
 for(let i=0;i<4;i++){
  if(state.privateAnswers[i]){
   el("review-person-"+i).onclick=()=>{state.person=i;state.docsPinned=true;state.tab="record";renderDocs("tab");openDocs();};
  }else{
   el("interview-person-"+i).onclick=()=>{
    state.privateIndex=i;state.privatePick=0;state.privateShown=false;state.docsPinned=false;state.person=i;state.tab="es";state.phase="private";render();
   };
  }
 }
 el("archive-from-hub").onclick=()=>{state.tab="archive";renderDocs("tab");openDocs();};
 if(count===4)el("begin-group").onclick=()=>{
  if(!state.privateAnswers.every(Boolean))return;
  state.phase="game";state.round=0;state.shown=false;state.b=0;
  state.tab="record";state.docsPinned=false;state.person=0;render();
 };
}
function renderPrivate(){
 el("docs-wrap").hidden=false;el("bottom-mobile").hidden=false;
 const i=state.privateIndex,p=people[i],selected=privateQuestions[i][state.privatePick];
 if(!state.docsPinned)state.person=i;
 let html='<section class="gamehead"><div><p class="eyebrow">PERSONAL INTERVIEW｜個人面接</p><h1>'+esc(p.name)+'</h1><p class="subtle small">ESから質問を選び、回答を記録する</p></div><span class="small status">'+(state.privateShown?'文字起こし保存済':'面接中')+'</span></section>';
 html+='<button id="back-to-candidates" type="button" class="back-link">‹ 応募者一覧に戻る</button>';
 html+=resumeMarkup(i,false);
 if(!state.privateShown){
  html+='<section class="panel interview-question"><h2>ESのどの記述について尋ねますか？</h2><p class="subtle">質問は1つ選べます。回答は非公開記録として残ります。</p><div class="private-choices">'+privateQuestions[i].map((q,k)=>'<label class="private-choice"><input type="radio" name="private-q" value="'+k+'" '+(state.privatePick===k?'checked':'')+'><span><strong>'+esc(q.term)+'</strong><small>'+esc(q.q)+'</small></span></label>').join('')+'</div><div class="preview"><span>面接官の質問</span><strong>'+esc(selected.q)+'</strong></div><button class="btn primary wide" id="ask-private">質問して回答を記録する</button></section>';
 }else{
  html+=recordMarkup(i)+'<section class="panel private-next"><div class="save-note">✓ 個人面接を保存しました。ほかの応募者への面接は、好きな順番で続けられます。</div><button type="button" id="next-private" class="btn primary wide">'+(state.privateAnswers.every(Boolean)?'4名の面接完了｜グループ面接の準備へ':'応募者一覧に戻る（次の学生を選ぶ）')+'</button></section>';
 }
 el("main").innerHTML=html;
 el("back-to-candidates").onclick=()=>{state.phase="private-select";state.tab="es";render();};
 if(!state.privateShown){
  el("main").querySelectorAll('input[name="private-q"]').forEach(input=>input.onchange=()=>{state.privatePick=Number(input.value);render();});
  el("ask-private").onclick=()=>{if(state.privateAnswers[i])return;state.privateAnswers[i]={person:i,option:state.privatePick,answer:privateAnswer(i,state.privatePick)};state.privateShown=true;render();};
 }else{
  el("next-private").onclick=()=>{state.phase="private-select";state.privateShown=false;state.docsPinned=false;state.tab="es";render();};
 }
}
function questionOptions(){
 return '<div class="question-choices">'+rounds[state.round].map((q,i)=>'<label class="private-choice"><input type="radio" name="group-q" value="'+i+'" '+(state.b===i?'checked':'')+'><span><strong>候補 '+(i+1)+'</strong><small>'+esc(q.q)+'</small></span></label>').join('')+'</div>';
}
function showQuestion(){el("preview-q").textContent=rounds[state.round][state.b].q;}
function getRecords(){return state.asked.map((entry,i)=>'<details class="rec"><summary>質問 '+(i+1)+'｜'+esc(rounds[entry.round][entry.idx].q)+'</summary>'+people.map((p,j)=>'<p><b>'+p.name+'：</b>'+esc(entry.answers[j])+'</p>').join('')+'</details>').join("");}
function renderGame(){
 el("docs-wrap").hidden=false;el("bottom-mobile").hidden=false;
 let r=state.round;
 let q=rounds[r][state.b];
 let body='<section class="gamehead"><div><p class="eyebrow">GROUP INTERVIEW｜最終選考</p><h1>共通質問 '+(r+1)+' / 3</h1></div><span class="small status">'+(state.shown?'文字起こし保存済':'面接進行中')+'</span></section>';
 body+='<div class="room '+(tension()>=4?'high':tension()>=2?'medium':'')+'"><div class="room-inner">'+people.map((p,i)=>'<div class="seat"><div class="avatar smallavatar">'+face(i,false)+'</div><b>'+p.name+'</b><span>候補者 0'+(i+1)+'</span></div>').join('')+'</div><p class="atmosphere"><span>面接室の様子</span>'+esc(mood())+'</p></div>';
 if(!state.shown){
  body+='<div class="panel"><h2>全員に尋ねる質問を作成</h2><p class="subtle">4種類から共通質問を選びます。4名全員が同じ質問に回答します。</p>'+questionOptions()+'<div class="preview"><span>質問プレビュー</span><strong id="preview-q">'+esc(q.q)+'</strong></div><button id="ask" class="btn primary wide">この質問を4名全員にする</button></div>';
 } else {
  const entry=state.asked[state.asked.length-1], pack=rounds[entry.round][entry.idx];
  body+='<div class="panel"><p class="eyebrow">面接官からの質問</p><h2>'+esc(pack.q)+'</h2></div><div class="replies">'+people.map((p,i)=>'<article class="reply"><div class="who"><div class="avatar mini">'+face(i,false)+'</div><b>'+p.name+'</b></div><p>'+esc(entry.answers[i])+'</p></article>').join('')+'</div><div class="notice">'+esc(mood())+'</div><button id="continue" class="btn primary wide">'+(r===2?'面接を終え、逆質問へ':'次の共通質問へ進む')+'</button>';
 }
 if(state.asked.length){
  body+='<div class="panel records"><h2>これまでの回答を見直す</h2>'+getRecords()+'</div>';
 }
 el("main").innerHTML=body;
 if(!state.shown){
  el("main").querySelectorAll('input[name="group-q"]').forEach(input=>input.onchange=()=>{state.b=Number(input.value);showQuestion();});
  el("ask").onclick=()=>{const idx=state.b;state.asked.push({round:r,idx,answers:people.map((_,i)=>groupAnswer(r,idx,i))});state.shown=true;render();};
 }else{
  el("continue").onclick=()=>{if(state.round===2){state.phase="reverse";}else{state.round++;state.a=0;state.b=0;state.shown=false;}render();};
 }
}
const reverseMethods=[
 ["policy","企業の一般的な制度を説明する"],
 ["context","質問をした背景をもう一段聞く"],
 ["verify","他の応募者の非公開記録と一致することを明かす"]
];
function renderReverse(){
 el("docs-wrap").hidden=false;el("bottom-mobile").hidden=false;
 if(!state.reverseConfirmed){
  let body='<section class="panel"><p class="eyebrow">REVERSE QUESTIONS｜逆質問</p><h1>応募者からの質問</h1><p>4名から質問があります。時間の都合上、回答できるのは<strong>2名だけ</strong>です。誰に回答するかを選んでください。</p><div class="reverse-list">'+S.reverse_questions.map((q,i)=>'<button id="reverse-target-'+i+'" class="private-choice reverse-target '+(state.reverseTargets.includes(i)?'selected':'')+'" type="button"><span><strong>'+esc(people[i].name)+'</strong><small>'+esc(q)+'</small></span><span class="selected-mark">'+(state.reverseTargets.includes(i)?'✓ 選択中':'選択')+'</span></button>').join('')+'</div><p class="small subtle">回答する応募者：'+state.reverseTargets.length+' / 2 名（他の2名には後日回答）</p><button class="btn primary wide" id="begin-reverse" '+(state.reverseTargets.length!==2?'disabled':'')+'>2名への回答を始める</button></section>';
  el("main").innerHTML=body;
  for(let i=0;i<4;i++)el("reverse-target-"+i).onclick=()=>{const a=state.reverseTargets;state.reverseTargets=a.includes(i)?a.filter(x=>x!==i):a.length<2?[...a,i]:[a[1],i];render();};
  el("begin-reverse").onclick=()=>{if(state.reverseTargets.length===2){state.reverseConfirmed=true;state.reverseIndex=0;state.reverseShown=false;state.reverseChoice="policy";render();}};
  return;
 }
 const i=state.reverseTargets[state.reverseIndex],style=state.reverseChoice;
 const methodIndex=reverseMethods.findIndex(([k])=>k===style);
 let body='<section class="panel"><p class="eyebrow">REVERSE QUESTIONS｜'+(state.reverseIndex+1)+'/2</p><h1>'+esc(people[i].name)+'の逆質問</h1><blockquote>'+esc(S.reverse_questions[i])+'</blockquote>';
 if(!state.reverseShown){
  body+='<p>どのように回答しますか？</p><div class="private-choices">'+reverseMethods.map(([key,label])=>'<label class="private-choice"><input type="radio" name="reverse-method" value="'+key+'" '+(key===style?'checked':'')+'><span><strong>'+esc(label)+'</strong>'+(key==="verify"?'<small>※他の応募者の非公開内容を本人に伝える、通常の採用面接では不適切な追及です</small>':'')+'</span></label>').join('')+'</div><div class="preview"><span>面接官の回答</span><strong>'+esc(S.reverse_replies[style])+'</strong></div><button class="btn primary wide" id="answer-reverse">この内容で回答する</button>';
 }else{
  const reply=i===state.monsterIndex?S.reverse_monster[i][methodIndex]:S.reverse_human[i][methodIndex];
  body+='<p class="eyebrow">面接官</p><blockquote>'+esc(S.reverse_replies[style])+'</blockquote><p class="eyebrow">'+esc(people[i].name)+'</p><div class="reply"><p>'+esc(reply)+'</p></div><div class="notice">'+(style==="verify"?'会場の空気が少し張り詰めた。ほかの学生たちは何も知らずにこちらを見ている。':'丁寧に返答が続いた。ほかの応募者は静かに耳を傾けている。')+'</div><button class="btn primary wide" id="next-reverse">'+(state.reverseIndex===1?'最終判定へ進む':'もう1名の逆質問に回答する')+'</button>';
 }
 body+='</section><div class="panel records"><h2>グループ面接の記録</h2>'+getRecords()+'</div>';
 el("main").innerHTML=body;
 if(!state.reverseShown){
  el("main").querySelectorAll('input[name="reverse-method"]').forEach(input=>input.onchange=()=>{state.reverseChoice=input.value;render();});
  el("answer-reverse").onclick=()=>{state.reverseStyles.push({person:i,style});state.reverseShown=true;render();};
 }else el("next-reverse").onclick=()=>{
  if(state.reverseIndex===1){state.phase="decision";}else{state.reverseIndex=1;state.reverseChoice="policy";state.reverseShown=false;}
  render();
 };
}
function renderDecision(){
 el("docs-wrap").hidden=false;el("bottom-mobile").hidden=false;
 el("main").innerHTML='<section class="decision panel"><p class="eyebrow">CONFIDENTIAL｜最終選考処理</p><h1>誰を不採用にしますか？</h1><p>個人面接4件・共通質問3問・逆質問への回答2件が終了しました。選考結果は後日通知されます。</p><p><strong>4名から1名だけ不採用</strong>とします。判断する前に選考資料を確認できます。</p><div class="rejects">'+people.map((p,i)=>'<label class="reject"><input type="radio" name="reject" value="'+i+'" '+(state.reject===i?'checked':'')+'><span>0'+(i+1)+'｜'+esc(p.name)+'<small>'+esc(p.school)+'</small></span></label>').join('')+'</div><button class="btn primary wide" id="submit" '+(state.reject<0?'disabled':'')+'>不採用者を確定する</button><p class="tiny subtle">結果を通知するのは後日です。確定後は別のプレイを開始できます。</p></section><div class="panel records"><h2>本日の回答履歴</h2>'+getRecords()+'</div>';
 el("main").querySelectorAll('input[name="reject"]').forEach(input=>input.onchange=()=>{state.reject=Number(input.value);el("submit").disabled=false;});
 el("submit").onclick=()=>{if(state.reject<0)return;state.phase="ending";render();};
}
function exposed(){
 const accused=state.reverseStyles.some(x=>x.person===state.monsterIndex&&x.style==="verify");
 const double=state.reverseStyles.filter(x=>x.style==="verify").length===2;
 return accused&&(state.asked[1]?.idx===3||state.asked[2]?.idx===3||double);
}
function outcome(){if(exposed())return "horror";return state.reject===state.monsterIndex?"good":"bad";}
function renderEnding(){
 el("docs-wrap").hidden=true;el("bottom-mobile").hidden=true;
 const result=outcome();
 let header="",text="",scene="";
 if(result==="good"){
  header='<p class="eyebrow good">GOOD END｜選考終了</p><h1>採用予定者、3名。</h1>';
  text='<p>不採用：'+people[state.monsterIndex].name+'。</p><p>翌週、人事部から連絡が届いた。</p><blockquote>「今回の最終選考について、異常な入社手続きは確認されませんでした。ご対応ありがとうございました」</blockquote><p>3人の内定者は、少しぎこちなく笑っている。</p><p><strong>あなたは会社を守った。</strong></p>';
  scene='<div class="ending-portraits">'+[0,1,2,3].filter(i=>i!==state.monsterIndex).map(i=>'<div class="avatar">'+face(i,false)+'</div>').join('')+'</div>';
 }else if(result==="bad"){
  header='<p class="eyebrow bad">BAD END｜入社手続き完了</p><h1>新入社員、3名。</h1>';
  text='<p>2027年4月。社内報に、入社式の集合写真が載った。</p><p>写真の中央で、'+people[state.monsterIndex].name+'が笑っている。面接のときより、ずっと自然だ。</p><p>隣の社員も、その隣の社員も、同じ角度で笑っている。</p><p><strong>会社に入れてはならない存在を、採用してしまった。</strong></p>';
  scene='<div class="ending-portraits ominous">'+[0,1,2,3].filter(i=>i!==state.reject).map(i=>'<div class="avatar">'+face(i,false)+'</div>').join('')+'</div>';
 }else{
  header='<p class="eyebrow bad">HORROR END｜面接は終了していません</p><h1>あなたの面接が始まります。</h1>';
  const culprit=people[state.monsterIndex].name;
  text='<div class="system-scan"><span>採用管理システム｜面接終了処理</span><b>選考結果の登録に失敗しました</b><p>理由：<u class="document-keyword">面接官の本人確認が完了していません</u></p></div>'+
   '<p>無人のはずの面接室から、椅子を引く音が聞こえる。</p>'+
   '<p>面接官の席にいるのは、'+esc(culprit)+'だ。机の下に伸びた腕が、さっきまであなたが触っていたマウスを動かしている。</p>'+
   '<p>「先ほどは、質問していただきありがとうございました。……では、こちらも確認させてください」</p>'+
   '<blockquote>「これまでに、他人の経験を自分のものとして話したことはありますか？」</blockquote>'+
   '<div class="horror-interview-card"><div class="record-label">面接記録 No.005 <span>自動文字起こし・進行中</span></div><div class="archive-line"><b>面接官 '+esc(culprit)+'</b><p>「回答は記録として保存します。何度でも、あなたの言葉でお願いします」</p></div><div class="archive-line"><b>応募者 あなた</b><p class="empty-transcript">［発言を待っています］</p></div></div>'+
   '<p class="horror-lastline">扉の向こうでは、あなたの声で誰かが「本日はありがとうございました」と言っている。</p>';
  scene='<div class="ending-horror horror-scene"><div class="interview-swap"><span>面接官席</span><div class="avatar">'+face(state.monsterIndex,true)+'</div><b>'+esc(culprit)+'</b></div><div class="horror-divider"></div><div class="interview-swap applicant"><span>応募者席</span><div class="empty-seat"></div><b>あなた</b></div></div>'+
   '<div class="post-interview-news"><div class="news-masthead"><b>東央産業｜社内通達</b><span>翌営業日・人事部配信</span></div><h3>最終面接担当者の変更について</h3><p>本日付で、最終面接の担当者を'+esc(culprit)+'へ変更しました。前任担当者に関する応募情報は採用管理システムに統合されています。</p><div class="message-thread"><b>社内連絡板｜人事部</b><p>「昨日の面接官、今日の内定者リストにいない？」</p><p>「違うよ。候補者が一人増えただけだと思う」</p><p>「でも、あの人が面接する側だった記録は残っていないよね」</p></div></div>';

 }
 el("main").innerHTML='<section class="ending panel '+result+'">'+header+scene+text+'<div class="recap"><strong>今回の選考</strong><p>不採用：'+people[state.reject].name+' ／ 質問3問 ／ 面接室：'+(exposed()?'異常':state.reverseStyles.some(x=>x.style==='verify')?'重い空気':'平穏')+'</p><details><summary>質問履歴と回答を確認</summary>'+getRecords()+'</details></div><button id="again" class="btn primary wide">別の質問で再プレイする</button></section>';
 el("again").onclick=()=>{Object.assign(state,{docsPinned:false,reverseTargets:[],reverseConfirmed:false,reverseStyles:[],reverseIndex:0,reverseShown:false,reverseChoice:"policy",monsterIndex:drawMonster(),phase:"intro",privateIndex:0,privatePick:0,privateShown:false,privateAnswers:[null,null,null,null],round:0,a:0,b:0,shown:false,asked:[],tab:"es",person:0,archive:false,recordsOpen:true,reject:-1});render();};
}
function render(){
 head();
 if(state.phase==="intro")renderIntro();
 else if(state.phase==="private-select")renderPrivateHub();
 else if(state.phase==="private")renderPrivate();
 else if(state.phase==="game")renderGame();
 else if(state.phase==="reverse")renderReverse();
 else if(state.phase==="decision")renderDecision();
 else renderEnding();
 if(state.phase==="private-select"||state.phase==="private"||state.phase==="game"||state.phase==="reverse"||state.phase==="decision")renderDocs();
 closeDocs();
}
function selfTest(){
 const originalMonster=state.monsterIndex,originalP=state.privateAnswers,originalAsked=state.asked,originalReverse=state.reverseStyles,originalReject=state.reject;
 let borrow=0,group=0,ends=0,goods=0,bads=0,horrors=0;
 for(let m=0;m<4;m++)for(let c0=0;c0<3;c0++)for(let c1=0;c1<3;c1++)for(let c2=0;c2<3;c2++)for(let c3=0;c3<3;c3++){
  state.monsterIndex=m;state.privateAnswers=[c0,c1,c2,c3].map((opt,i)=>({option:opt,answer:privateAnswer(i,opt)}));
  for(let q=0;q<4;q++){
   const source=[0,1,2,3].filter(i=>i!==m)[[0,1,2,0][q]];
   const s=stripQuote(S.borrowing_echoes[m][source][state.privateAnswers[source].option]);
   if(!groupAnswer(1,q,m).includes(s))throw Error("Borrow missing: "+m+"/"+q);
   borrow++;
  }
 }
 for(let m=0;m<4;m++)for(let g0=0;g0<4;g0++)for(let g1=0;g1<4;g1++)for(let g2=0;g2<4;g2++){
  state.monsterIndex=m;state.asked=[{idx:g0,round:0},{idx:g1,round:1},{idx:g2,round:2}];
  for(let a=0;a<4;a++)for(let b=a+1;b<4;b++)for(let x=0;x<3;x++)for(let y=0;y<3;y++)for(let reject=0;reject<4;reject++){
   state.reverseStyles=[{person:a,style:reverseMethods[x][0]},{person:b,style:reverseMethods[y][0]}];state.reject=reject;
   const out=outcome(),warn=(a===m&&x===2)||(b===m&&y===2),double=x===2&&y===2;
   const expect=warn&&(g1===3||g2===3||double)?"horror":reject===m?"good":"bad";
   if(out!==expect)throw Error("Ending mismatch "+m+"-"+g1+"-"+g2);
   ends++;if(out==="good")goods++;else if(out==="bad")bads++;else horrors++;
  }
  group++;
 }
 state.monsterIndex=originalMonster;state.privateAnswers=originalP;state.asked=originalAsked;state.reverseStyles=originalReverse;state.reject=originalReject;
 if(borrow!==1296||group!==256||ends!==55296||!goods||!bads||!horrors)throw Error("QA counts failed");
 return {borrowRoutes:borrow,groupRoutes:group,endingBranches:ends,good:goods,bad:bads,horror:horrors};
}
window.H1_QA=selfTest;
function openDocs(){
 el("docs-wrap").classList.add("mobile-open");
 document.body.classList.add("docs-open");
 const close=el("close-docs");
 if(close&&typeof close.focus==="function")close.focus({preventScroll:true});
}
function closeDocs(){
 el("docs-wrap").classList.remove("mobile-open");
 document.body.classList.remove("docs-open");
}
document.addEventListener("DOMContentLoaded",()=>{
 el("toggle-docs").onclick=()=>{
  if(el("docs-wrap").classList.contains("mobile-open"))closeDocs();else openDocs();
 };
 el("close-docs").onclick=()=>{closeDocs();const b=el("toggle-docs");if(b&&typeof b.focus==="function")b.focus({preventScroll:true});};
 document.addEventListener("keydown",e=>{if(e.key==="Escape"&&el("docs-wrap").classList.contains("mobile-open"))closeDocs();});
 render();
 try{selfTest();}catch(e){console.error("H1 QA",e);}
});