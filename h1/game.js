"use strict";
const VERSION = "α0.2.0";
const UPDATED = "2026.10.26 01:55 JST";
const people = [
 {name:"大野 彩花",school:"経営学部・2027年3月卒業見込み",initial:"大",tone:"warm",character:"社交的で段取り上手。成果をやや大きく表現するが、自分で確認すると訂正できる。",es:"学園祭実行委員会で協賛交渉を担当しました。企業12社の協力を取りつけ、当日は赤い養生テープで来場者の動線を改善しました。誰も気づかない仕事を先に拾うことを大切にしています。",record:"協賛金を提供したのは11社で、残り1社は機材貸与でした。床に赤い矢印を3本貼り、最後の1本だけ逆向きにして出口を案内しました。"},
 {name:"岡野 直人",school:"理工学研究科・2027年3月修了見込み",initial:"岡",tone:"cool",character:"口下手だが誠実。数字を正確に覚え、記録の裏付けを重視する。",es:"4人の研究チームで環境計測装置の精度改善に取り組みました。測定条件を切り分け、誤差を約15％低減しました。午後6時12分に記録された異常値がきっかけでした。",record:"装置の自動校正が毎日18時12分に作動していました。23回目の条件変更で測定が安定しました。相対誤差は7.8％から6.6％になりました。"},
 {name:"澤田 千尋",school:"社会学部・2027年3月卒業見込み",initial:"澤",tone:"soft",character:"穏やかで、質問意図を即座に理解する。やや模範的すぎる印象がある。",es:"大学2年次から地域の学習支援に参加しました。週2回、子どもに合わせた教材を工夫し、最後の一人が帰るまで会場に残りました。相手の立場で考える姿勢を学びました。",record:"学習支援では子ども一人ひとりに合わせて教材を変えていました。特に、最後まで責任を持って活動することを心掛けました。"},
 {name:"水野 海斗",school:"経済学部・2027年3月卒業見込み",initial:"水",tone:"earth",character:"率直で合理的。面接官にも意見を返すが、具体的な実績はある。",es:"スーパーのアルバイトで返品対応を改善しました。役割を整理して対応時間を約半分に短縮。反対意見もありましたが、現場で試しながら説明しました。",record:"確認待ちの商品には青い札を付け、処理が済んだら裏返しました。平均対応時間は9.8分から5.2分に改善しました。反対した先輩もいました。"}
];
const axes = [
 {a:["小学校時代","大学時代"],b:["代表経験","失敗した経験"]},
 {a:["予定変更","役割の混乱"],b:["工夫した方法","記録・発案者"]},
 {a:["評価されないとき","自分の経験を疑われたとき"],b:["優先すること","確かめること"]}
];
const rounds = [
 [
 {q:"小学校時代に、クラスや集団の代表になったことはありますか？",risk:0,ans:[
 "「5年生のとき図書委員会の班長でした。当番表を作るのは結構好きでした」",
 "「ありません。人前で話すより、毎日の飼育記録を付ける方が好きでした」",
 "「はい、学級委員でした。最後の一人が帰るまで教室に残りました。出口の灯りは、最後の一人のために残すものですから」",
 "「ありません。代表に文句を言って、先生に注意されたことはあります」"
 ]},
 {q:"小学校時代に、大きな失敗をした経験はありますか？",risk:0,ans:[
 "「図書室の返却当番を忘れました。友達が代わってくれて、ちゃんと謝りました」",
 "「工作の長さを測り間違えて、作り直しました。記録を残すようになったのはその頃です」",
 "「人が残っているのに教室を閉めてしまいました。いえ、閉められたんでした。すみません、少し混同して」",
 "「友達の提案を勝手に変えて怒られました。謝るまで三日かかりました」"
 ]},
 {q:"大学時代に、チームや団体の代表を務めたことはありますか？",risk:0,ans:[
 "「学園祭では協賛チームの窓口を任されました。代表といっても、先輩が最終判断をしていました」",
 "「ありません。研究室の記録管理は担当しましたが、チームリーダーではないです」",
 "「学習支援の当番をまとめていました。みんなが帰った後も、最後の一人を待っていたんです」",
 "「店では改善案を出しましたが、責任者ではありません。店長の承認を取りました」"
 ]},
 {q:"大学時代に、失敗をして対処した経験はありますか？",risk:0,ans:[
 "「協賛先に古い資料を送ってしまい、すぐ訂正しました。確認が甘かったです」",
 "「実験で装置の設定を間違えました。操作ログを追って原因を特定しました」",
 "「支援記録を取り違えたことがあります。2018年……いえ、大学2年の2024年でした」",
 "「改善案を先輩に押し付けてしまいました。最初はうまくいかず、説明の仕方を変えました」"
 ]}
 ],
 [
 {q:"予定が急に変わったとき、どんな工夫をしましたか？",risk:0,ans:[
 "「学園祭では出口への流れが変わったので、床の案内を貼り直しました」",
 "「測定順を変え、時刻と条件を記録しました。結果を比較できなくなるので」",
 "「赤い矢印を3本貼ったんです。最後の1本だけ逆向きにして、帰る人の道を示しました」",
 "「返品窓口の場所が変わったとき、店長と導線を確認しました」"
 ]},
 {q:"予定変更があったとき、何を記録して引き継ぎましたか？",risk:0,ans:[
 "「変わった担当者と連絡先を一覧表に追記しました」",
 "「変更前後の条件です。後から理由が分かるようにしていました」",
 "「変更が何回あったかを記録しました。23回目に、ようやく安定したんです」",
 "「受付時刻と担当者です。お客様に説明できるように残しました」"
 ]},
 {q:"役割が混乱したとき、どんな工夫で解決しましたか？",risk:0,ans:[
 "「担当表を更新し、誰が対応するか本人に確認しました」",
 "「測定者と調整担当を分けて、各自の操作を残すようにしました」",
 "「青い札で対応中の子を区別しました。終わったら裏返すだけです」",
 "「返品対応では、担当ごとに青い札を用意して混乱を減らしました」"
 ]},
 {q:"役割が混乱したとき、その方法を最初に考えた人まで確認しましたか？ 他人の経験を自分の成果にしていませんか？",risk:2,ans:[
 "「はい。発案者は記録に残しました。自分だけの成果ではありません」",
 "「条件を考えた人と実行した人を分けて記録しています」",
 "「……私が考えました。赤い矢印も、青い札も。どうして、ほかの人の話だと思われるんですか？」",
 "「自分の案でも、店長や先輩の工夫が入っています。そこは区別します」"
 ]}
 ],
 [
 {q:"自分の取り組みが評価されなかったとき、何を優先しますか？",risk:0,ans:[
 "「成果をきちんと伝えられたか振り返ります。でも正直、悔しいです」",
 "「評価の前に、結果が再現できるかを確認します」",
 "「何が足りなかったのか知りたいです。次は、ちゃんと答えられるように」",
 "「現場で結果を出すことです。全員の賛成はなくても改善できるので」"
 ]},
 {q:"自分の取り組みが評価されなかったとき、最後に何を確認しますか？",risk:0,ans:[
 "「目標と結果が食い違っていなかったか、数字と相手の反応を見ます」",
 "「比較条件です。条件が違えば同じ結果でも評価できません」",
 "「不採用になった理由です。何度でも聞きたいと思います。どこで間違えたのか」",
 "「判断した人が、理由を説明できるかどうかですね」"
 ]},
 {q:"あなた自身の経験が疑われたとき、何を優先して説明しますか？",risk:2,ans:[
 "「担当表や協賛先との連絡を見せます。曖昧なところは訂正します」",
 "「実験ログです。言葉より、残った記録の方が確かです」",
 "「……どの経験が疑わしいのでしょう。誰と比べているんですか？ あなたは、もう分かっているんですか？」",
 "「その場にいた人に確認してもらいます。疑われるのは嫌ですけど」"
 ]},
 {q:"もし他人の記憶を自分の経験として話していると指摘されたら、何を確かめますか？",risk:2,ans:[
 "「そもそも自分の経験か、記録や友人に確かめます」",
 "「まずその記録の出所が信頼できるか調べます」",
 "「……どうして、そんな質問を？ あなたは私が誰か、知っているんですか？」",
 "「何でそんな前提なんですか。事実と違うなら訂正してほしいです」"
 ]}
 ]
];

// 本日の個人面接：ESの語句を1つ選ぶ。回答は非公開文字起こしに保存される。
const privateQuestions=[
 [
  {term:"企業12社の協力",q:"協力いただいた12社の内訳を教えてください。",answer:"「協賛金は11社で、最後の1社は機材を貸してくださいました。ESの表現は正確ではありませんでした」",borrow:"11件の協力をいただき、最後の1件は教材の貸し出しでした。"},
  {term:"赤い養生テープ",q:"養生テープをどのように使いましたか？",answer:"「床に赤い矢印を3本貼りました。最後の1本だけ逆向きにして出口を案内しました」",borrow:"赤い矢印を3本貼りました。最後の1本だけ逆向きにして出口を案内しました。"},
  {term:"誰も気づかない仕事",q:"具体的にどのような裏方の仕事をしましたか？",answer:"「全員が帰った後、照明を消して、借りた備品が全て返っているか確認しました」",borrow:"全員が帰った後、照明を消して、借りた教材が全て返っているか確認しました。"}
 ],
 [
  {term:"4名の研究チーム",q:"4名の役割分担を教えてください。",answer:"「測定担当が2人、装置調整が1人、私が記録担当です。指導教員は含めません」",borrow:"4名で、子どもの対応が2人、教材調整が1人、私が記録を担当していました。"},
  {term:"午後6時12分",q:"なぜ18時12分という時刻を覚えているのですか？",answer:"「自動校正が毎日18時12分に入るので、何度もログで確認していました」",borrow:"毎日18時12分に作業しました。何度も記録で確認していたので覚えています。"},
  {term:"誤差15％低減",q:"改善の過程を教えてください。",answer:"「23回目の条件変更で安定しました。相対誤差は7.8％から6.6％になりました」",borrow:"23回目にようやく結果が安定しました。回数は記録していました。"}
 ],
 [
  {term:"大学2年次から",q:"学習支援を始めたのは何年ですか？",answer:"「2018年の秋です。……失礼しました。大学2年なら2024年です。似た記憶と混ざりました」",borrow:""},
  {term:"最後の一人",q:"最後の一人まで残った理由は何ですか？",answer:"「出口の灯りは最後の一人のために残しておくものですから。そう答えるのが正しいと思いました」",borrow:""},
  {term:"教材の工夫",q:"具体的にどんな教材を使いましたか？",answer:"「相手の理解度に合わせて変えていました。質問する側が必要とする答えを考えていました」",borrow:""}
 ],
 [
  {term:"返品対応の改善",q:"対応時間はどれほど改善しましたか？",answer:"「平均9.8分から5.2分に短縮しました。計測は自分たちで行いました」",borrow:"個別対応を平均9.8分から5.2分まで短縮したんです。"},
  {term:"役割を整理",q:"混乱を防ぐためにどのような方法を使いましたか？",answer:"「青い札で担当を区別して、終わったら札を裏返すことにしました」",borrow:"青い札で対応中の子を区別しました。終わったら裏返すんです。"},
  {term:"反対意見",q:"反対した人にはどう対応しましたか？",answer:"「ベテランの先輩は最後まで納得しませんでした。結果を説明し続けました」",borrow:"ベテランの方は最後まで納得されませんでした。何度も説明しました。"}
 ]
];
function privateEntry(i){return state.privateAnswers[i];}
function groupAnswer(round,idx,person){
 if(person!==2||round!==1)return rounds[round][idx].ans[person];
 const source=idx===0?0:idx===1?1:idx===2?3:-1;
 if(source>=0){
  const entry=privateEntry(source);
  const lead=idx===0?"「予定が変わったときの工夫として、":idx===1?"「そのときに残した記録ですが、":"「担当が混乱したときは、";
  return lead+privateQuestions[source][entry.option].borrow+"」";
 }
 const bits=[0,1,3].map(i=>privateQuestions[i][privateEntry(i).option].borrow);
 return "「自分の経験です。"+bits.slice(0,2).join(" それから、")+"……なぜ、ほかの方の話だと思うんですか？」";
}

const state={phase:"intro",privateIndex:0,privatePick:0,privateShown:false,privateAnswers:[null,null,null,null],round:0,a:0,b:0,shown:false,asked:[],tab:"es",person:0,archive:false,recordsOpen:true,reject:-1};
const archive=[
 {year:"2018",name:"古谷 真奈",result:"最終面接・不採用",body:"「出口の灯りは、最後の一人のために残すものだと思っていました」",note:"本人の努力は認められるが、具体的成果の説明が弱い。"},
 {year:"2019",name:"坂本 智也",result:"二次面接・不採用",body:"「失敗した回数より、原因を記録する方が大事だと思います」",note:"実績の説明が曖昧。"},
 {year:"2021",name:"岸田 友香",result:"最終面接・不採用",body:"「評価はうれしいですが、次に何を直すか考えたいです」",note:"社風との適合が課題。"},
 {year:"2023",name:"石井 勇人",result:"一次面接・不採用",body:"「委員会の代表はしていません。裏方の方が得意です」",note:"応募書類の提出不足。"}
];
function el(id){return document.getElementById(id);}
function esc(x){return String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function face(i,distort){
 const colors=["#bc886d","#6c9ca8","#a28fb0","#829774"];
 const c=colors[i];
 return '<svg class="portrait '+(distort?'uncanny':'')+'" viewBox="0 0 120 140" role="img" aria-label="'+esc(people[i].name)+'の人物イラスト">'+
 '<rect width="120" height="140" fill="#d9e4e9"/><rect y="98" width="120" height="42" fill="#b6cad2"/>'+
 '<path d="M12 140Q16 101 49 95H71Q105 103 110 140Z" fill="#252e39"/>'+
 '<path d="M45 101L59 129 74 100Z" fill="#fff"/><path d="M57 128L61 128 65 140H51Z" fill="#596979"/>'+
 '<ellipse cx="60" cy="53" rx="30" ry="39" fill="#d8ac91"/>'+
 '<path d="M30 52Q25 9 60 10Q97 10 90 55L82 41Q67 32 40 41Z" fill="'+c+'"/>'+
 '<path d="M41 61Q48 57 52 62M68 62Q75 57 80 61" fill="none" stroke="#4e4747" stroke-width="2" stroke-linecap="round"/>'+
 '<path d="M54 81Q60 84 66 81" fill="none" stroke="#805c57" stroke-width="2" stroke-linecap="round"/>'+
 (distort?'<path d="M31 41Q5 65 28 115M88 39Q116 80 88 130" fill="none" stroke="#534a56" stroke-width="4"/><ellipse cx="76" cy="61" rx="5" ry="10" fill="#30313a"/>':'')+'</svg>';
}
function tension(){return state.asked.reduce((s,x)=>s+rounds[x.round][x.idx].risk,0);}
function mood(){
 const t=tension();
 return t>=4?'会議室が静まり返る。澤田は動かず、こちらの指先だけを見ている。':t>=2?'空気が重い。澤田の笑顔が消えないまま、返答までの間が長くなった。':state.round>0?'一瞬、会話が途切れた。ほかの応募者が姿勢を直す。':'4人は少し緊張しながらも、落ち着いて話を聞いている。';
}
function head(){
 const step={intro:0,private:1,game:2,decision:3,ending:4}[state.phase]??0;
 el("header-state").textContent=["PROLOGUE","PERSONAL INTERVIEW","GROUP INTERVIEW","FINAL DECISION","RESULT"][step];
 el("version").textContent=VERSION+"｜更新 "+UPDATED;
 const progressStep=state.phase==="intro"||state.phase==="private"?0:state.phase==="game"?1:state.phase==="decision"?2:3;
 el("progress").innerHTML=["個人面接","グループ面接","採用判定","結果"].map((name,i)=>'<span class="'+(i<progressStep?'done':i===progressStep?'on':'')+'">'+name+'</span>').join("");
}
function chooseTab(x){state.tab=x;renderDocs();}
function selectPerson(i){state.person=i;state.tab="es";renderDocs();}
const shortcuts=[
 [{round:0,idx:2,label:"協賛活動・リーダー経験"},{round:1,idx:0,label:"赤い養生テープ"},{round:2,idx:0,label:"成果の評価"}],
 [{round:0,idx:3,label:"実験時の失敗"},{round:1,idx:1,label:"測定条件の記録"},{round:2,idx:2,label:"経験の裏付け"}],
 [{round:0,idx:0,label:"最後の一人"},{round:1,idx:2,label:"学習支援の役割分担"},{round:2,idx:1,label:"自分の努力の評価"}],
 [{round:0,idx:2,label:"改善活動での役割"},{round:1,idx:2,label:"返品対応の工夫"},{round:2,idx:0,label:"反対意見への対応"}]
];
function docMarkup(){
 const tabs='<div class="tabs-doc"><button data-tab="es" class="'+(state.tab==="es"?'on':'')+'">ES</button><button data-tab="record" class="'+(state.tab==="record"?'on':'')+'">個人面接</button><button data-tab="archive" class="'+(state.tab==="archive"?'on':'')+'">過年度</button></div>';
 if(state.tab==="archive"){
  return tabs+'<div class="paper"><h3>過年度・選考記録</h3><p class="subtle">社内限定。過去の応募者の抜粋記録です。</p>'+archive.map(x=>'<details class="old"><summary>'+x.year+'年度｜'+esc(x.name)+'｜'+x.result+'</summary><p>'+esc(x.body)+'</p><p class="subtle">面接官所見：'+esc(x.note)+'</p></details>').join('')+'</div>';
 }
 const p=people[state.person];
 const profiles='<div class="people-nav">'+people.map((person,i)=>'<button data-person="'+i+'" class="'+(state.person===i?'on':'')+'">'+String(i+1).padStart(2,"0")+' '+person.name.split(" ")[0]+'</button>').join('')+'</div>';
 if(state.tab==="es"){
  const current=state.phase==="private"&&!state.privateShown&&state.person===state.privateIndex;
  const privateHints=current?'<div class="es-hints"><b>このESから個人面接の質問を選ぶ</b>'+privateQuestions[state.privateIndex].map((q,i)=>'<button data-private-option="'+i+'" type="button">'+esc(q.term)+' → 質問へ</button>').join("")+'</div>':'';
  const hints=shortcuts[state.person].filter(x=>state.phase==="game"&&!state.shown&&x.round===state.round);
  const groupHints=hints.length?'<div class="es-hints"><b>この記述から共通質問を作る</b>'+hints.map(x=>'<button data-shortcut="'+x.idx+'" type="button">'+esc(x.label)+' → 質問へ</button>').join("")+'</div>':'';
  return tabs+profiles+'<div class="paper"><div class="applicant"><div class="avatar">'+face(state.person,false)+'</div><div><h3>'+esc(p.name)+'</h3><p class="subtle">'+esc(p.school)+'</p><p class="small">'+esc(p.character)+'</p></div></div><div class="line"></div><h4>学生時代に力を入れたこと</h4><p>'+esc(p.es)+'</p>'+privateHints+groupHints+'</div>';
 }
 const entry=privateEntry(state.person);
 const transcript=entry?'<blockquote><b>面接官：</b>'+esc(privateQuestions[state.person][entry.option].q)+'</blockquote><blockquote><b>'+esc(p.name)+'：</b>'+esc(entry.answer)+'</blockquote>':'<p>本日の個人面接はまだ実施されていません。面接終了後に記録が保存されます。</p>';
 return tabs+profiles+'<div class="paper"><h3>'+esc(p.name)+'｜本日の個人面接</h3><p class="subtle">採用管理システムの自動文字起こし／他の応募者には非公開</p>'+transcript+'</div>';
}
function renderDocs(){
 const panel=el("docs");
 if(!panel)return;
 panel.innerHTML=docMarkup();
 panel.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>chooseTab(b.dataset.tab)));
 panel.querySelectorAll("[data-person]").forEach(b=>b.addEventListener("click",()=>selectPerson(Number(b.dataset.person))));
 panel.querySelectorAll("[data-shortcut]").forEach(b=>b.addEventListener("click",()=>{const idx=Number(b.dataset.shortcut);state.a=Math.floor(idx/2);state.b=idx%2;render();}));
 panel.querySelectorAll("[data-private-option]").forEach(b=>b.addEventListener("click",()=>{state.privatePick=Number(b.dataset.privateOption);render();}));
}
function renderIntro(){
 el("main").innerHTML='<section class="opening"><p class="eyebrow">CONFIDENTIAL｜人事部より</p><h1>本日の最終面接について</h1><p>4名の最終候補者から、<strong>1名を不採用</strong>としてください。</p><p>ただし、社内調査により<strong>1名は人間ではない存在</strong>である可能性が極めて高いと判明しました。</p><p>過去の事例では、この存在は<strong>他の学生の非公開面接記録を学習し、自分の経験として語る</strong>と報告されています。</p><p class="warning">正体を疑っていることを悟られないでください。通常どおり面接を実施し、静かに1名を見送ってください。</p>'+
 '<div class="guide"><h2>あなたが行うこと</h2><ol><li>4名を順番に個人面接し、ESから各1問を選ぶ</li><li>自動文字起こしされた4人の回答を資料として確認する</li><li>全員同席のグループ面接で共通質問を3問選ぶ</li><li>回答の出所・時系列・過去記録との重複を調べる</li><li>面接終了後、別室で不採用者を1人選ぶ</li></ol><p>質問の仕方によっては、会議室の空気が変わります。通常の深掘りは問題ありませんが、異形に正体への疑いを悟らせる質問の連続は危険です。</p><p class="tiny subtle">選考結果は後日通知。音声・個人情報の送信はありません。架空の会社・人物によるフィクションです。</p></div>'+
 '<button class="btn primary wide" id="start">選考資料を確認して面接を始める</button></section>';
 el("docs-wrap").hidden=true;el("bottom-mobile").hidden=true;
 el("start").onclick=()=>{state.phase="private";render();};
}

function renderPrivate(){
 el("docs-wrap").hidden=false;el("bottom-mobile").hidden=false;
 const i=state.privateIndex,p=people[i],selected=privateQuestions[i][state.privatePick];
 state.person=i;
 let html='<section class="gamehead"><div><p class="eyebrow">PERSONAL INTERVIEW｜個人面接</p><h1>応募者 '+(i+1)+' / 4｜'+esc(p.name)+'</h1></div><span class="small status">'+(state.privateShown?'文字起こし保存済':'面接中')+'</span></section>';
 html+='<div class="private-scene"><div class="avatar private-portrait">'+face(i,false)+'</div><div><strong>'+esc(p.name)+'</strong><p class="subtle small">'+esc(p.school)+'</p><p>「本日はよろしくお願いいたします」</p></div></div>';
 html+='<div class="panel"><p class="eyebrow">ENTRY SHEET｜ES</p><p>'+esc(p.es)+'</p></div>';
 if(!state.privateShown){
  html+='<div class="panel"><h2>ESのどこを質問しますか？</h2><p class="subtle">気になる語句を選び、応募者に直接質問してください。回答は文字起こしで保存されます。</p><div class="private-choices">'+privateQuestions[i].map((q,k)=>'<label class="private-choice"><input type="radio" name="private-q" value="'+k+'" '+(state.privatePick===k?'checked':'')+'><span><strong>'+esc(q.term)+'</strong><small>'+esc(q.q)+'</small></span></label>').join('')+'</div><div class="preview"><span>選択中の質問</span><strong>'+esc(selected.q)+'</strong></div><button class="btn primary wide" id="ask-private">この応募者に質問する</button></div>';
 }else{
  const entry=privateEntry(i),pack=privateQuestions[i][entry.option];
  html+='<div class="panel"><p class="eyebrow">面接官の質問</p><h2>'+esc(pack.q)+'</h2><div class="reply"><div class="who"><div class="avatar mini">'+face(i,false)+'</div><b>'+esc(p.name)+'</b></div><p>'+esc(entry.answer)+'</p></div><div class="save-note">✓ 面接内容を自動保存しました。この内容は次のグループ面接で照合できます。</div><button id="next-private" class="btn primary wide">'+(i===3?'4名の個人面接を終え、グループ面接へ':'次の応募者を個人面接する')+'</button></div>';
 }
 el("main").innerHTML=html;
 if(!state.privateShown){
  el("main").querySelectorAll('input[name="private-q"]').forEach(input=>input.onchange=()=>{state.privatePick=Number(input.value);render();});
  el("ask-private").onclick=()=>{state.privateAnswers[i]={person:i,option:state.privatePick,answer:privateQuestions[i][state.privatePick].answer};state.privateShown=true;render();};
 }else{
  el("next-private").onclick=()=>{
   if(i===3){state.phase="game";state.person=0;state.tab="record";}
   else{state.privateIndex++;state.privatePick=0;state.privateShown=false;state.person=state.privateIndex;state.tab="es";}
   render();
  };
 }
}

function questionOptions(){
 const axis=axes[state.round];
 return '<div class="compose"><label>質問の前半<select id="axis-a">'+axis.a.map((x,i)=>'<option value="'+i+'"'+(state.a===i?' selected':'')+'>'+esc(x)+'</option>').join('')+'</select></label><label>質問の後半<select id="axis-b">'+axis.b.map((x,i)=>'<option value="'+i+'"'+(state.b===i?' selected':'')+'>'+esc(x)+'</option>').join('')+'</select></label></div>';
}
function showQuestion(){
 let pack=rounds[state.round][state.a*2+state.b];
 el("preview-q").textContent=pack.q;
}
function getRecords(){return state.asked.map((entry,i)=>'<details class="rec"><summary>質問 '+(i+1)+'｜'+esc(rounds[entry.round][entry.idx].q)+'</summary>'+people.map((p,j)=>'<p><b>'+p.name+'：</b>'+esc(entry.answers[j])+'</p>').join('')+'</details>').join("");}
function renderGame(){
 el("docs-wrap").hidden=false;el("bottom-mobile").hidden=false;
 let r=state.round;
 let q=rounds[r][state.a*2+state.b];
 let body='<section class="gamehead"><div><p class="eyebrow">GROUP INTERVIEW｜最終選考</p><h1>共通質問 '+(r+1)+' / 3</h1></div><span class="small status">'+(state.shown?'文字起こし保存済':'面接進行中')+'</span></section>';
 body+='<div class="room '+(tension()>=4?'high':tension()>=2?'medium':'')+'"><div class="room-inner">'+people.map((p,i)=>'<div class="seat"><div class="avatar smallavatar">'+face(i,i===2&&tension()>=4)+'</div><b>'+p.name+'</b><span>候補者 0'+(i+1)+'</span></div>').join('')+'</div><p class="atmosphere"><span>面接室の様子</span>'+esc(mood())+'</p></div>';
 if(!state.shown){
  body+='<div class="panel"><h2>全員に尋ねる質問を作成</h2><p class="subtle">2つの語句を組み合わせます。全員が同じ質問に回答します。</p>'+questionOptions()+'<div class="preview"><span>質問プレビュー</span><strong id="preview-q">'+esc(q.q)+'</strong></div><button id="ask" class="btn primary wide">この質問を4名全員にする</button></div>';
 } else {
  const entry=state.asked[state.asked.length-1], pack=rounds[entry.round][entry.idx];
  body+='<div class="panel"><p class="eyebrow">面接官からの質問</p><h2>'+esc(pack.q)+'</h2></div><div class="replies">'+people.map((p,i)=>'<article class="reply"><div class="who"><div class="avatar mini">'+face(i,false)+'</div><b>'+p.name+'</b></div><p>'+esc(entry.answers[i])+'</p></article>').join('')+'</div><div class="notice">'+esc(mood())+'</div><button id="continue" class="btn primary wide">'+(r===2?'面接を終え、最終判定へ':'次の共通質問へ進む')+'</button>';
 }
 if(state.asked.length){
  body+='<div class="panel records"><h2>これまでの回答を見直す</h2>'+getRecords()+'</div>';
 }
 el("main").innerHTML=body;
 if(!state.shown){
  el("axis-a").onchange=e=>{state.a=Number(e.target.value);showQuestion();};
  el("axis-b").onchange=e=>{state.b=Number(e.target.value);showQuestion();};
  el("ask").onclick=()=>{const idx=state.a*2+state.b;state.asked.push({round:r,idx,answers:people.map((_,i)=>groupAnswer(r,idx,i))});state.shown=true;render();};
 }else{
  el("continue").onclick=()=>{if(state.round===2){state.phase="decision";}else{state.round++;state.a=0;state.b=0;state.shown=false;}render();};
 }
}
function renderDecision(){
 el("docs-wrap").hidden=false;el("bottom-mobile").hidden=false;
 el("main").innerHTML='<section class="decision panel"><p class="eyebrow">CONFIDENTIAL｜最終選考処理</p><h1>誰を不採用にしますか？</h1><p>面接は終了し、候補者は退出しました。選考結果は後日通知されます。</p><p><strong>4名中、1名を見送ってください。</strong> 面接の記録は右側（スマートフォンでは資料ボタン）から再確認できます。</p><div class="rejects">'+people.map((p,i)=>'<label class="reject"><input type="radio" name="reject" value="'+i+'" '+(state.reject===i?'checked':'')+'><span>0'+(i+1)+'｜'+esc(p.name)+'<small>'+esc(p.school)+'</small></span></label>').join('')+'</div><p class="atmosphere"><span>廊下の様子</span>扉の向こうで足音が遠ざかる。面接室には、もう誰もいない。</p><button class="btn primary wide" id="submit" '+(state.reject===-1?'disabled':'')+'>不採用者を確定する</button><p class="tiny subtle">確定後はやり直せません。別の質問で試す場合はタイトル画面から再プレイしてください。</p></section><div class="panel records"><h2>本日の面接記録</h2>'+getRecords()+'</div>';
 el("main").querySelectorAll('input[name="reject"]').forEach(x=>x.onchange=()=>{state.reject=Number(x.value);el("submit").disabled=false;});
 el("submit").onclick=()=>{if(state.reject<0)return;state.phase="ending";render();};
}
function outcome(){if(tension()>=4)return "horror";return state.reject===2?"good":"bad";}
function renderEnding(){
 el("docs-wrap").hidden=true;el("bottom-mobile").hidden=true;
 const result=outcome();
 let header="",text="",scene="";
 if(result==="good"){
  header='<p class="eyebrow good">GOOD END｜選考終了</p><h1>採用予定者、3名。</h1>';
  text='<p>不採用：澤田 千尋。</p><p>翌週、人事部から連絡が届いた。</p><blockquote>「今回の最終選考について、異常な入社手続きは確認されませんでした。ご対応ありがとうございました」</blockquote><p>3人の内定者は、少しぎこちなく笑っている。</p><p><strong>あなたは会社を守った。</strong></p>';
  scene='<div class="ending-portraits">'+[0,1,3].map(i=>'<div class="avatar">'+face(i,false)+'</div>').join('')+'</div>';
 }else if(result==="bad"){
  header='<p class="eyebrow bad">BAD END｜入社手続き完了</p><h1>新入社員、3名。</h1>';
  text='<p>2027年4月。社内報に、入社式の集合写真が載った。</p><p>写真の中央で、澤田千尋が笑っている。面接のときより、ずっと自然だ。</p><p>隣の社員も、その隣の社員も、同じ角度で笑っている。</p><p><strong>会社に入れてはならない存在を、採用してしまった。</strong></p>';
  scene='<div class="ending-portraits ominous">'+[0,2,1].map(i=>'<div class="avatar">'+face(i,false)+'</div>').join('')+'</div>';
 }else{
  header='<p class="eyebrow bad">HORROR END｜面接を続けてください</p><h1>まだ、終わっていません。</h1>';
  text='<p>採用管理システムに通知が現れた。</p><blockquote>「面接が終了していません」</blockquote><p>面接官の席に澤田が座っている。腕がテーブルの端まで、あり得ない長さで伸びていた。</p><p>「では、これまでのご経験について、もう少し詳しく教えてください」</p><p><strong>次の応募者：あなた</strong></p>';
  scene='<div class="ending-horror"><div class="avatar">'+face(2,true)+'</div><div class="horror-chair">面接官席<br>担当者：澤田 千尋</div></div>';
 }
 el("main").innerHTML='<section class="ending panel '+result+'">'+header+scene+text+'<div class="recap"><strong>今回の選考</strong><p>不採用：'+people[state.reject].name+' ／ 質問3問 ／ 面接室：'+(tension()>=4?'異常':tension()>=2?'重い空気':'平穏')+'</p><details><summary>質問履歴と回答を確認</summary>'+getRecords()+'</details></div><button id="again" class="btn primary wide">別の質問で再プレイする</button></section>';
 el("again").onclick=()=>{Object.assign(state,{phase:"intro",privateIndex:0,privatePick:0,privateShown:false,privateAnswers:[null,null,null,null],round:0,a:0,b:0,shown:false,asked:[],tab:"es",person:0,archive:false,recordsOpen:true,reject:-1});render();};
}
function render(){
 head();
 if(state.phase==="intro")renderIntro();
 else if(state.phase==="private")renderPrivate();
 else if(state.phase==="game")renderGame();
 else if(state.phase==="decision")renderDecision();
 else renderEnding();
 if(state.phase==="private"||state.phase==="game"||state.phase==="decision")renderDocs();
 el("docs-wrap").classList.remove("mobile-open");
}
function selfTest(){
 let checked=0,good=0,bad=0,horror=0;
 for(let a=0;a<4;a++)for(let b=0;b<4;b++)for(let c=0;c<4;c++){
  const localT=rounds[0][a].risk+rounds[1][b].risk+rounds[2][c].risk;
  for(let r=0;r<4;r++){
   checked++;
   let result=localT>=4?"horror":r===2?"good":"bad";
   if(result==="good")good++;else if(result==="bad")bad++;else horror++;
   if(!rounds[0][a].ans.every(x=>typeof x==="string"&&x.length>5)||!rounds[1][b].ans.every(x=>typeof x==="string"&&x.length>5)||!rounds[2][c].ans.every(x=>typeof x==="string"&&x.length>5))throw new Error("Missing answer");
  }
 }
 if(checked!==256||!good||!bad||!horror)throw new Error("Branch QA failed");
 let testedPrivateVariants=0;
 for(let a=0;a<3;a++)for(let b=0;b<3;b++)for(let c=0;c<3;c++)for(let d=0;d<3;d++){
  const source=[a,b,c,d];
  for(let j=0;j<4;j++)if(!privateQuestions[j][source[j]].answer||!privateQuestions[j][source[j]].q)throw new Error("Private answer missing");
  testedPrivateVariants++;
 }
 if(testedPrivateVariants!==81)throw new Error("Private routes incomplete");
 return {checked,good,bad,horror,testedPrivateVariants};
}
window.H1_QA=selfTest;
document.addEventListener("DOMContentLoaded",()=>{
 el("toggle-docs").onclick=()=>{const w=el("docs-wrap");w.classList.toggle("mobile-open");renderDocs();};
 el("close-docs").onclick=()=>el("docs-wrap").classList.remove("mobile-open");
 render();
 try{selfTest();}catch(e){console.error("H1 QA",e);}
});