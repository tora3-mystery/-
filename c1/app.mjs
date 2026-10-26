import {VERSION,UPDATED_JST,LIMITS,DAYS,DIRECTIVES,ENDING_META,createProfile,createRun,calculate,advance,beginDay,isValidSave,SPEED_HARASSMENTS,ensureLocalPortrait} from './engine.mjs';

const app=document.getElementById('app');
const SAVE_KEY='arg_c1_save_v04';
const RECORD_KEY='arg_c1_records_v04';
const PREF_KEY='arg_c1_mute_v04';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const load=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key))??fallback}catch{return fallback}};
const persist=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};
let events=[];
let run=null;
let screen='intro';
let popup='';
let modalReturnFocus=null;
let records=load(RECORD_KEY,{names:{},endings:{},plays:0});
records.names??={};records.endings??={};
for(const key of Object.keys(records.names)){if(key.endsWith('疑義')){const normal=key.slice(0,-2);records.names[normal]??={count:0};records.names[normal].count+=(records.names[key]?.count||0);delete records.names[key];}}
let muted=load(PREF_KEY,false);
let clockSelected='normal';
let toast='';
const displayDay=()=>Math.floor((run?.index??0)/3);
const displayTime=()=>activeEvent()?.time||'09:00';
const cpRemaining=()=>Math.max(0,LIMITS.cp-run.cp);
const bossBadge=(e)=>e.actor==='boss';
const DIRECTOR_IMAGE='./assets/director.webp';
// Save-level eventPlan chooses the optional alternative. Legacy saves retain their original events.
function activeEvent(){
 if(!run)return null;
 const e=events[run.index], v=e?.alternates?.[run.eventPlan?.[run.index]-1];
 const result=v?{...e,...v,id:e.id,day:e.day,alternateId:v.variantId}: {...e,alternateId:null};
 if(result.id==='D5-1'){
   result.scene=run.flags.aiVerified
     ? '火曜日に出典確認を済ませた資料は準備できている。部長から役員向けの追加数字を今朝求められた。'
     : run.flags.aiUnverified
     ? '火曜に未確認のまま進めた出典に問題が見つかった。部長から追加数字も求められ、差し戻し対応が必要だ。'
     : '部長から追加数字を要求された。火曜日の資料の出典を確認しつつ、提出範囲を整理する必要がある。';
 }
 if(result.id==='D3-2' && run.logs.some(l=>l.id==='D3-1' && l.replyTiming==='late')){
   result.scene='前のチャットは未返信のまま、別件が発生。'+result.scene;
 }
 if(result.id==='D2-3'&&run.flags.checkAgreed){
   const choice=result.choices.find(c=>c.id==='D');
   if(choice)choice.text='月曜に決めた確認時刻に、困りごとだけ聞く';
 }
 if(result.id==='D4-1'&&run.profile.socialVoice)result.scene+=' 配属時の本人メモ：「'+run.profile.socialVoice+'」';
 result.choices=result.choices.map(c=>({...c,text:(!v&&run.choiceTextPlan?.[run.index]===1&&c.altText)?c.altText:c.text}));
 return result;
}
function orderedChoices(e){
 const order=run.choiceOrders?.[run.index];
 if(!Array.isArray(order)||order.length!==6||new Set(order).size!==6)return e.choices;
 const m=new Map(e.choices.map(c=>[c.id,c]));
 return order.every(id=>m.has(id))?order.map(id=>m.get(id)):e.choices;
}

function save(){if(run)persist(SAVE_KEY,run);}
function storeRecords(){persist(RECORD_KEY,records);}
function restoreSaved(saved){const migrated=structuredClone(saved);migrated.version=VERSION;migrated.profileAccepted=migrated.profileAccepted??(migrated.logs.length>0||migrated.index>0);migrated.bossReports??=[];ensureLocalPortrait(migrated.profile);return migrated;}
function stat(label,value,cap,kind){return `<div class="stat ${kind}"><div class="statline"><span>${label}</span><span>${Math.min(value,cap)}/${cap}</span></div><div class="statnum mono">${value}<small style="font-size:11px;font-weight:500;color:#778a96"> / ${cap}</small></div><div class="bar"><i style="width:${Math.min(100,Math.round(100*value/cap))}%"></i></div></div>`;}
function scorePanel(){return `<div class="stats">${stat('コンプラ違反ポイント',run.cp,LIMITS.cp,'cp')}${stat('業務進捗',run.progress,LIMITS.progress,'progress')}${stat('新人の習熟',run.growth,LIMITS.growth,'growth')}</div>`;}
function statusBar(){
  const completed=run.logs.length;
  const days=['月','火','水','木','金'];
  const groups=days.map((day,d)=>{
    const steps=[0,1,2].map(k=>{
      const n=d*3+k,done=n<completed,current=n===run.index&&!done;
      const status=done?'done':current?'current':'future';
      const title=day+'曜 業務'+(k+1)+(done?'：完了':current?'：現在':'：未着手');
      return '<span class="week-step '+status+'" title="'+title+'" aria-hidden="true"></span>';
    }).join('');
    return '<div class="week-day" aria-label="'+day+'曜日の3業務"><div class="week-day-label"><span>DAY '+(d+1)+'</span><strong>'+day+'曜</strong></div><div class="week-steps">'+steps+'</div></div>';
  }).join('');
  return '<div class="daytime"><span class="day-pill">DAY '+(displayDay()+1)+' / 5</span><strong>'+DAYS[displayDay()]+'　'+displayTime()+'</strong><span class="time-extra">業務 '+(run.index%3+1)+' / 3</span></div>'
  +'<div class="progress-label"><strong>5日間 × 3業務 = 全15業務</strong><span>完了 '+completed+' / 15</span></div>'
  +'<div class="week-progress" role="img" aria-label="全15業務のうち'+completed+'業務完了。現在'+DAYS[displayDay()]+'の'+(run.index%3+1)+'番目の業務。">'+groups+'</div>'
  +'<div class="week-legend"><span><i class="done"></i>完了</span><span><i class="current"></i>現在</span><span><i class="future"></i>未着手</span></div>';
}
function topActions(){return `<div class="toolrow"><button class="quiet" data-action="show-profile">社員プロフィール</button><button class="quiet" data-action="show-notes">業務メモ</button><button class="quiet" data-action="show-archive">ハラ図鑑</button><button class="quiet" data-action="show-guide">操作説明</button></div>`;}
function intro(){
  const saved=load(SAVE_KEY,null);const canResume=isValidSave(saved,events);
  return `<div class="eyebrow">2030 / HUMAN RESOURCE MANAGEMENT SYSTEM</div>
    <h1 class="h1">適切に<br>ご対応ください。</h1>
    <p class="lead">あなたは営業企画部の課長です。今週、新しい若手社員が配属されます。<br>金曜日の役員説明までに<strong>仕事を終え、新人を育て、コンプラ違反ポイントの上限到達を回避</strong>してください。</p>
    <div class="paper spaced"><div class="panelhead"><b>管理職向け 業務指示</b><span class="tag">重要</span></div>
    <div class="quote">「新人には積極的に声をかけるように。指導は丁寧に。過干渉は厳禁。資料の遅延も認めません」<br><span class="tiny">— 営業本部 部長</span></div>
    <div class="rules"><div class="rule"><span>コンプラ違反</span><b>20 pt</b><span>到達で即呼び出し</span></div><div class="rule"><span>業務進捗</span><b>22 以上</b><span>金曜の達成条件</span></div><div class="rule"><span>新人の習熟</span><b>6 以上</b><span>金曜の達成条件</span></div></div>
    <p class="small" style="line-height:1.9">各場面で<strong>6つの対応</strong>から1つ選択。判定直後に新たな「○○ハラ」が派手に発表されます。<strong>認定でコンプラ違反ポイントが加算</strong>。部長指令のノルマを逃すと、翌日の作業が増えて進捗が下がります。<strong>疑義は原則0pt</strong>です。正式認定が<strong>3回連続するごとにコンプラ・コンボで+1pt</strong>。</p>
    <p class="privacy">架空の社内分類を風刺する作品です。現実の被害やハラスメント認定を扱う研修ではありません。記録はこの端末にのみ保存され、外部に送信されません。</p>
    <div class="actions">${canResume?'<button class="primary" data-action="resume">続きから再開</button>':''}<button class="${canResume?'secondary':'primary'}" data-action="start">${canResume?'最初から始める':'配属社員を確認して始める'}</button></div>
    </div><div class="toolrow spaced"><button class="quiet" data-action="show-archive">これまでのハラ図鑑 (${Object.keys(records.names).length}件)</button><button class="quiet" data-action="show-endings">エンディング収集 (${Object.keys(records.endings).length}/16)</button><button class="quiet" data-action="toggle-sound">効果音：${muted?'OFF':'ON'}</button></div>`;
}
function profileCard(p){
 const fallback=esc(p.avatar||'🧑‍💼');
 const portrait=p.photo ? `<div class="portrait face-photo" role="img" aria-label="架空の社員の合成顔写真"><span class="portrait-fallback">${fallback}</span><img src="${esc(p.photo)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display='none'"></div>` : `<div class="portrait" role="img" aria-label="社員アイコン">${fallback}</div>`;
 const education=p.university&&p.faculty?`<div class="info"><b>出身大学・学部</b>${esc(p.university)} ${esc(p.faculty)}</div>`:'';
 const club=p.club?`<div class="info"><b>サークル・学生生活</b>${esc(p.club)}<div class="tiny">${esc(p.studentMemory||'')}</div></div>`:'';
 const temperament=p.temperament?`<div class="info"><b>本人の自己紹介より</b><strong>${esc(p.temperament)}</strong><div class="tiny">${esc(p.temperamentText||'')}</div></div>`:'';
 const social=p.socialVoice?`<div class="info"><b>食事会・交流への希望</b>${esc(p.socialVoice)}</div>`:'';
 return `<div class="employee">${portrait}<div><div class="tiny">本日配属・人材プロフィール</div><div class="employee-name">${esc(p.name)}</div><div class="employee-sub">${esc(p.gender)}・${esc(p.age)}歳 / 入社${p.grade}年目<br>${esc(p.previous)} → ${esc(p.department)}</div></div></div>
 <div class="profile-grid">${education}${club}${temperament}${social}<div class="info"><b>希望するキャリア</b>${esc(p.ambition)}</div><div class="info"><b>強み・経験</b>${esc(p.skill)}</div></div>
 <div class="list-header">本人からのメッセージ</div>${p.speech.map(s=>`<div class="quote">「${esc(s)}」</div>`).join('')}
 <p class="tiny">顔写真は架空社員のAI生成画像を本ゲーム内に保存。外部の画像配信サービスには接続しません。大学・サークルは人物像の参考情報であり、コンプラ判定には使われません。</p>`;
}
function profileScreen(){return `<div class="eyebrow">DAY 01 / 配属通知</div><h1 class="h2">今週の配属社員</h1><p class="lead">人材基本情報を確認してください。希望や得意分野は、今週の指導に影響します。</p><section class="paper">${profileCard(run.profile)}<div class="actions"><button class="primary" data-action="begin">この社員を受け入れる</button><button class="quiet" data-action="reroll">別の社員を表示する</button></div></section>`;}
function directiveCompact(){const d=DIRECTIVES[displayDay()];return `<aside class="boss-mini"><span class="boss-stamp">部長指令｜当日の縛り</span><strong>進捗 ${d.progress} 以上・習熟 ${d.growth} 以上</strong><span>未達なら追加報告が発生し、進捗が減少</span></aside>`;}
function briefingScreen(){const i=displayDay(),d=DIRECTIVES[i];return `<div class="eyebrow">部長室からの通達 / 2030</div><div class="daytime large"><span class="day-pill">DAY ${i+1} / 5</span><strong>${DAYS[i]}　${d.time}</strong></div><section class="boss-directive"><div class="boss-crest">部長指令 <span>読了必須</span></div><img class="boss-photo" src="${DIRECTOR_IMAGE}" alt="部長の顔（架空人物のAI生成画像）" width="74" height="87"><h2>${esc(d.title)}</h2><p>「${esc(d.demand)}」</p><div class="boss-orders"><div><small>この日の終業までに</small><strong>業務進捗 ${d.progress} 以上</strong></div><div><small>加えて</small><strong>新人の習熟 ${d.growth} 以上</strong></div></div><p class="boss-remark">部長：「${esc(d.remark)}」</p><p class="small">どちらか一方でも目標を外すと、未達項目ごとに追加確認が発生し、仕事の進捗が減ります。部長の評価と新人への対応は別の問題です。</p></section><div class="actions"><button class="primary" data-action="begin-day">指令を確認して業務開始</button></div>`;}
function dayReviewScreen(){const i=displayDay(),r=run.bossReports?.at(-1),d=DIRECTIVES[i];if(!r)return '<p>日次査定を確認できませんでした。</p>';return `<div class="eyebrow">終業報告 / 部長からの返信</div><div class="daytime large"><span class="day-pill">DAY ${i+1} / 5</span><strong>${DAYS[i]}　18:00</strong></div><section class="boss-directive ${r.met?'boss-pass':'boss-fail'}"><div class="boss-crest">部長査定 <span>${r.met?'ノルマ達成':'追加業務発生'}</span></div><img class="boss-photo" src="${DIRECTOR_IMAGE}" alt="部長の顔（架空人物のAI生成画像）" width="74" height="87"><h2>${r.met?'「まあ、今日のところはいいだろう」':'「この数字で帰るつもりか？」'}</h2><p>提出した数字：進捗 ${r.progress} / 目標 ${d.progress}、習熟 ${r.growth} / 目標 ${d.growth}</p>${r.met?'<p>本日の部長指令はクリア。次の日の指示はさらに厳しくなります。</p>':`<p>未達の項目：${r.missing.map(esc).join('・')}。不足資料の再作成が発生しました。</p><div class="score-boost boss-penalty">業務進捗 −${r.penalty}</div>`}</section><div class="actions"><button class="primary" data-action="next">翌営業日の部長指令を確認</button><button class="secondary" data-action="show-notes">対応履歴を確認</button></div>`;}
function scene(){const e=activeEvent();const dayIndex=displayDay();const isBoss=bossBadge(e);
return `<div class="panelhead"><span class="eyebrow">2030年度 人材育成支援システム</span><span class="tag">自動保存</span></div>${statusBar()}${scorePanel()}${directiveCompact()}${topActions()}
<section class="event-unit ${isBoss?'event-boss':'event-employee'}"><div class="event-type"><span>${isBoss?'⚠ 部長案件':'● 若手社員との対応'}</span><span>${DAYS[dayIndex]} ${esc(e.time||'')}</span></div>
<div class="scene-header"><img class="scene-actor-photo" src="${isBoss?DIRECTOR_IMAGE:esc(run.profile.photo||'./assets/employee-f01.webp')}" alt="${isBoss?'部長':'配属社員'}の顔（架空人物）" width="76" height="88" loading="lazy"><div class="scene-index">CASE ${run.index%3+1}　${esc(e.id)}</div><div class="scene-title">${esc(e.title)}</div><div class="scene-description">${esc(e.scene)}</div>${run.index<3?`<div class="cue">配属初日の確認メモ：${esc(e.cue)}</div>`:""}</div></section>
<section class="paper spaced"><div class="panelhead"><strong class="small">あなたはどう対応しますか？</strong><span class="tiny">6つから1つ選択</span></div>${e.id==='D3-1'?clockWidget():''}<div class="choices">${orderedChoices(e).map((c,i)=>`<button class="choice" data-choice="${c.id}"><span class="letter">${String.fromCharCode(65+i)}</span><span>${esc(c.text)}</span></button>`).join('')}</div></section><p class="privacy">※選択後は戻せません。コンプラ違反ポイントが20に到達すると部長室に呼び出されます。</p>`;}
function clockWidget(){const choices=[['instant','通知から数秒で返信'],['normal','15分ほどで返信'],['late','翌朝まで保留']];return `<div class="clockbox"><strong class="small">社内チャット｜返信するタイミングを指定</strong><p class="clock-warning">実時間の計測はありません。先に返信タイミングを選び、続けて返信内容を選択してください。</p><div class="clockmode">${choices.map(([value,label])=>`<button data-time="${value}" class="quiet ${clockSelected===value?'selected':''}" aria-pressed="${clockSelected===value}">${label}</button>`).join('')}</div></div>`;}
function resultScreen(){const log=run.pending;if(!log)return '<p class="error">表示できる判定がありません。</p>';
const safe=log.deltaCp===0,speedPrimary=log.speedCp>0&&log.baseCp===0;
const name=speedPrimary?log.speedName:log.name;
const keyName=log.name.replace(/疑義$/,'');
const newLabels=[keyName,...(log.speedCp>0?[log.speedName]:[])].filter(n=>records.names[n]?.count===1);
const heat=run.cp>=LIMITS.cp?'alert':run.cp>=15?'danger':run.cp>=10?'warning':'normal';
const combo=log.comboStreak??0;
const comboCp=log.comboCp??0;
return `<div class="eyebrow">DAY ${displayDay()+1}｜${DAYS[displayDay()]} ${displayTime()}　社内ハラスメント認定システム</div>
<section class="result-card ${safe?'safe':'hit'} ${heat}" aria-label="${esc(name)}の判定結果"><div class="result-confetti" aria-hidden="true">${Array.from({length:14},(_,i)=>`<i style="--k:${i};--x:${(i*37)%99}%;--d:${i%5*0.12}s"></i>`).join('')}</div>
<div class="result-symbol">${safe?'★':'⚡'}</div><div class="reveal-kicker">${safe?'社内審査：疑義レベル':'H A R A S S M E N T 　D E T E C T E D'}</div>
<div class="reveal-word">${safe?'あぶない！':'認 定 ！'}</div><h1 class="result-name">${esc(name)}！</h1><strong class="small">${safe?'今回は正式認定なし':'本日、新たな社内分類が記録されました'}</strong>
<p class="result-reason">${esc(speedPrimary?log.speedReason:log.reason)}</p>
${log.fitAdjustment!==0&&!log.rawName?.endsWith('疑義')?`<p class="tiny">${log.fitAdjustment<0?(log.baseCp===0?'本人の希望・得意分野と一致し、正式認定を回避。':'本人の希望・得意分野と一致し、判定が軽減。'):'本人の希望・得意分野との不一致により、正式認定のポイントが増加。'}</p>`:''}
${log.speedCp>0&&!speedPrimary?`<div class="extra-hit"><b>追撃！ ${esc(log.speedName)}：+${log.speedCp} コンプラ違反ポイント</b><p>${esc(log.speedReason)}</p></div>`:''}
${log.extraReason?`<p class="small">${esc(log.extraReason)}</p>`:''}
<div class="score-title">${safe?'今回は加点なし':'コンプラ違反ポイント 加算'}</div><div class="score-boost ${safe?'safe':''}">+${log.deltaCp}<small> コンプラ違反pt</small></div>
<div class="limit-proximity">累積コンプラ違反 <strong>${run.cp} / ${LIMITS.cp} pt</strong>　｜　${cpRemaining()===0?'部長室へ直行':`あと ${cpRemaining()} pt でゲームオーバー`}</div>
${comboCp>0?`<div class="combo combo-bonus">🔥 ${combo}連続正式認定！ コンプラ・コンボ <strong>+${comboCp}pt</strong><small>（通常認定 +${log.deltaCp-comboCp}pt ／ コンボ +${comboCp}pt）</small></div>`:combo===2||combo%3===2?`<div class="combo combo-ready">⚡ ${combo}連続認定。次も正式認定ならコンボ +1pt！</div>`:''}
<div class="result-stats"><span>業務進捗 ${log.deltaP>=0?'+':''}${log.deltaP}</span><span>新人の習熟 ${log.deltaS>=0?'+':''}${log.deltaS}</span><span>コンプラ残り ${cpRemaining()}pt</span></div>
${newLabels.length?`<div class="collection">✦ 図鑑に新規発見：${newLabels.map(esc).join('・')}</div>`:''}</section>
<div class="actions"><button class="primary" data-action="next">${run.ending?(run.cp>=LIMITS.cp?'部長室に向かう':'最終評価を確認する'):(run.index%3===2?'終業・部長査定へ':'次の業務へ進む')}</button><button class="secondary" data-action="show-notes">これまでの対応を確認</button></div>`;}
function logLabel(l){
 if(!l.speedCp||!l.speedName)return l.name;
 return l.baseCp>0?`${l.name} ＋ ${l.speedName}`:`${l.speedName}（返信内容：${l.name}）`;
}
function logReason(l){return l.reason+(l.speedCp>0&&l.speedReason?'／'+l.speedReason:'');}
function rookieComment(){
 const g=run.growth, early=run.logs.length<15, highCp=run.cp>=15;
 let note=g<=2?'「まだ自信が持てないところも多いです。もう少し質問できると助かります……」'
   :g<=5?'「少しずつ分かってきました。今週教えていただいたことを、来週も確認してみます」'
   :g<=8?'「課長、丁寧に見てくださってありがとうございました！ 担当した部分は、少し自信がつきました」'
   :highCp?'「課長、今週はいろいろ教えてくださってありがとうございました！ 成長できた気がします。……でも、コンプラの通知はちょっと怖かったです」'
   :'「課長、今週は本当にありがとうございました！ 自分で考えて進められるようになったのは、課長のおかげです。来週も頑張ります！」';
 if(run.ending==='E07'||run.ending==='E08')note='「助けていただいてありがとうございました。ただ、次はもう少し自分でやってみたいです……」';
 if(run.ending==='E15')note='「課長、発表を任せてくださってありがとうございました！ 緊張しましたが、すごく自信になりました！」';
 if(early)note='「まだ週の途中なので、何がよかったのか整理できていません。ここまで教えていただいたことは覚えています」';
 const admired=run.logs.find(l=>l.id==='D4-1' && (
   (run.eventPlan?.[9]===1&&l.choiceId==='C')||(run.eventPlan?.[9]!==1&&['A','F'].includes(l.choiceId))
 ));
 const social=admired&&run.profile.socialStyle==='convivial'?'食事のことも気軽に声をかけてくださって、嬉しかったです。':'';
 const ambition=run.profile.career==='expert'?'専門分野をもっと勉強したいです。':'いつか私もチームを動かせるようになりたいです。';
 return {note,ambition:early?'':(social?social+' ':'')+ambition};
}
function endingScreen(){const id=run.ending||'E04', [title,desc,grade]=ENDING_META[id];const failed=run.cp>=LIMITS.cp;
  const director=failed?'「君、今週いったい何件のハラスメント認定を受けたんだ！ このままでは新人を任せられん！」':
    id==='E05'||id==='E06'?'「配慮は分かった。ところで、提出資料はどこにある？」':
    ['E07','E08'].includes(id)?'「仕事はできているな。……で、新人に何を教えたんだ？」':
    '「よくやった。来週もう一人配属される。ちなみに来月から社内分類が17項目増えるそうだ」';
  return `<div class="eyebrow">2030年度 / 人事評価通知</div><div class="end-banner"><div class="tiny" style="color:#c3d1dd">ENDING ${id.slice(1)} / 16</div><div class="ending-title">${esc(title)}</div><div class="grade">評価 ${esc(grade)}</div><p class="end-sub">${esc(desc)}</p></div>
  <div class="end-grid"><div><strong>${run.cp}</strong><span>コンプラ pt</span></div><div><strong>${run.progress}</strong><span>業務進捗</span></div><div><strong>${run.growth}</strong><span>新人の習熟</span></div></div>
  <section class="paper"><div class="panelhead"><strong>上司からの最終講評</strong><span class="tag ${failed?'red':''}">${failed?'管理職適性再審査':'週次評価'}</span></div><div class="quote">${director}</div><p class="small muted">配属社員：${esc(run.profile.name)} / ${esc(run.profile.ambition)}</p></section>
  <section class="paper spaced"><div class="panelhead"><strong>新人からのコメント</strong><span class="tag">習熟度 ${run.growth}</span></div><div class="employee mini-employee"><div class="portrait face-photo"><img src="${esc(run.profile.photo||'./assets/employee-f01.webp')}" alt="配属社員の顔写真" loading="lazy"></div><div><strong>${esc(run.profile.name)}</strong><p class="quote">${esc(rookieComment().note)}${rookieComment().ambition?'\n'+esc(rookieComment().ambition):''}</p></div></div></section>
  <div class="paper spaced"><strong>今回のハラ認定履歴</strong><p class="tiny">どの対応が何点だったか、選択ごとの根拠を確認できます。</p>${run.logs.map(l=>`<details class="history-row" style="margin-top:7px"><summary><b>${esc(l.id)}｜${esc(logLabel(l))}　コンプラ違反+${l.deltaCp}pt</b></summary><div class="small" style="padding-top:7px">対応：${esc(l.choiceText)}<br>${esc(logReason(l))}${l.extraReason?`<br>${esc(l.extraReason)}`:''}</div></details>`).join('')}</div>
  <div class="actions"><button class="primary" data-action="restart">別の社員でもう一度</button><button class="secondary" data-action="download-card">結果カードを画像保存</button><button class="secondary" data-action="share">結果を共有・コピー</button></div>
  <div class="toolrow spaced"><button class="quiet" data-action="show-archive">ハラ図鑑 (${Object.keys(records.names).length}種)</button><button class="quiet" data-action="show-endings">獲得エンディング (${Object.keys(records.endings).length}/16)</button><button class="quiet" data-action="intro">タイトル画面へ戻る</button></div>`;}
function showModal(type){
  const p=run?.profile;
  let title='',body='';
  if(type==='profile'){title='配属社員プロフィール';body=p?profileCard(p):'<div class="empty">まだ社員が配属されていません。</div>';}
  if(type==='guide'){title='操作説明';body=`<div class="info">5営業日×各3業務＝全15イベント（8枠にシナリオ差分あり、選択肢の並びや一部の文言も周回ごとに変化）で、6つの対応から1つずつ選びます。正式認定が3回連続するごとにコンプラ・コンボで追加+1pt（疑義はリセット）。コンプラ違反20ptで即敗北。金曜までに業務22以上・習熟6以上でクリア。毎朝の部長指令の数値ノルマを未達にすると、追加報告が発生し、業務進捗が減少します。選択後の結果画面で「○○ハラ」の種類と点数が表示されます。</div><p class="small">チャット返信イベントでは、実時間を測らず返信タイミングを選べます。プロフィールと業務メモはいつでも参照できます。</p><p class="privacy">スコア、名前、イベントはゲーム内のフィクションであり、現実の法的判断ではありません。</p>`;}
  if(type==='notes'){title='業務メモ';body=run?`${run.logs.length?`<div class="timeline">${run.logs.map(l=>`<div class="history-row"><strong>${esc(l.id)}｜${esc(l.title)}　コンプラ違反+${l.deltaCp}pt</strong>${esc(l.choiceText)}<br><span class="muted">${esc(logLabel(l))}　${esc(logReason(l))}</span></div>`).join('')}</div>`:'<div class="empty">対応履歴はありません。</div>'}<hr class="sectionline"><div class="info"><b>これまでの引継ぎ事項</b>${run.flags.checkAgreed?'✓ 確認時間を合意済み<br>':'・確認時刻は未合意<br>'}${run.flags.aiVerified?'✓ AIの資料は出典検証済み<br>':run.flags.aiUnverified?'！AIの出典に未確認部分がある<br>':'・AIの出典は未確認リスクが明示されていない<br>'}${run.flags.presentationPrepped?'✓ 発表担当の準備を進めた':'・発表担当の練習は未確認'}</div>`:'<div class="empty">まだ業務履歴はありません。</div>';}
  if(type==='archive'){title='ハラ図鑑';const names=[...new Set([...events.flatMap(e=>[...e.choices,...(e.alternates||[]).flatMap(a=>a.choices)].map(c=>c.harassment.replace(/疑義$/,''))),...SPEED_HARASSMENTS,...Object.keys(records.names)])].sort((a,b)=>Number(!!records.names[b])-Number(!!records.names[a]));const found=names.filter(n=>records.names[n]).length;body=`<p class="small muted">発見 ${found} / ${names.length} 分類。認定・疑義を含めて記録。発見済みを先頭に表示します。</p><div class="timeline">${names.map(n=>{const info=records.names[n];return `<div class="history-row"><strong>${info?'✦ '+esc(n):'？？？ 未発見'}</strong>${info?`認定・疑義を含む遭遇回数：${info.count}回`:'未発見の分類'}</div>`;}).join('')}</div>`;}
  if(type==='endings'){title='エンディングコレクション';body=`<p class="small muted">${Object.keys(records.endings).length}/16 種を解放</p><div class="timeline">${Object.entries(ENDING_META).map(([id,d])=>`<div class="history-row"><strong>${records.endings[id]?`${id}｜${esc(d[0])}`:`${id}｜？？？`}</strong>${records.endings[id]?esc(d[1]):'未達成のエンディング'}</div>`).join('')}</div>`;}
  modalReturnFocus=document.activeElement?.dataset?.action||null;
  popup=`<div class="overlay" id="overlay"><section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><button class="modal-close" data-action="close-modal" aria-label="閉じる">×</button><h2 class="h2">${esc(title)}</h2>${body}</section></div>`;
  render(false);
  app.querySelector('.modal-close')?.focus();
}
function closeModal(){popup='';render(false);if(modalReturnFocus)app.querySelector(`[data-action="${modalReturnFocus}"]`)?.focus();modalReturnFocus=null;}
function render(scroll=true){
  if(!events.length){app.innerHTML='<div class="loading">読み込み中…</div>';return;}
  if(screen==='intro')app.innerHTML=intro();
  else if(screen==='profile')app.innerHTML=profileScreen();
  else if(run?.phase==='briefing')app.innerHTML=briefingScreen();
  else if(run?.phase==='dayReview')app.innerHTML=dayReviewScreen();
  else if(run?.phase==='scene')app.innerHTML=scene();
  else if(run?.phase==='result')app.innerHTML=resultScreen();
  else if(run?.phase==='ending')app.innerHTML=endingScreen();
  else app.innerHTML=intro();
  if(popup)app.insertAdjacentHTML('beforeend',popup);
  if(toast)app.insertAdjacentHTML('beforeend',`<div class="paper spaced" role="status">${esc(toast)}</div>`);
  if(scroll)window.scrollTo({top:0,behavior:'instant'});
}
function resetClock(){clockSelected='normal';}
function tone(safe,points=0,combo=0){if(muted)return;try{const ctx=new (window.AudioContext||window.webkitAudioContext)();let t=ctx.currentTime;
 const notes=safe?[[740,0,.09],[900,.13,.13]]:[[523,0,.10],[659,.10,.10],[784,.21,.12],[1046,.34,.20],[1318,.51,.15]];
 if(!safe&&combo>=3&&combo%3===0)notes.push([1568,.68,.21],[1760,.83,.17]);
 for(const [freq,offset,len] of notes){const o=ctx.createOscillator(),g=ctx.createGain();o.type=safe?'sine':'triangle';o.frequency.value=freq;g.gain.setValueAtTime(.0001,t+offset);g.gain.exponentialRampToValueAtTime(.07,t+offset+.025);g.gain.exponentialRampToValueAtTime(.0001,t+offset+len);o.connect(g);g.connect(ctx.destination);o.start(t+offset);o.stop(t+offset+len+.02);}
 setTimeout(()=>ctx.close(),1300);
}catch{}}
function finishRunOnce(){if(!run?.ending||run.finishedRecorded)return;run.finishedRecorded=true;records.plays++;records.endings[run.ending]=(records.endings[run.ending]||0)+1;storeRecords();save();}
function resultToText(){if(!run?.ending)return '';const d=ENDING_META[run.ending];return `適切にご対応ください。｜ARG C1\nENDING ${run.ending.slice(1)} / 16「${d[0]}」\n評価 ${d[2]}｜コンプラ違反 ${run.cp}pt／進捗 ${run.progress}／習熟 ${run.growth}\n${d[1]}\nhttps://tora3-mystery.github.io/short-ui-games/c1/`}
async function share(){const txt=resultToText();if(!txt)return;try{if(navigator.share){await navigator.share({title:'適切にご対応ください。',text:txt});return;}if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(txt);}else{const el=document.createElement('textarea');el.value=txt;document.body.appendChild(el);el.select();document.execCommand('copy');el.remove();}toast='結果テキストをコピーしました。';}catch(e){if(e?.name!=='AbortError')toast='共有に失敗しました。画像保存をお試しください。';}render(false);}
function drawWrapped(ctx,text,x,y,maxWidth,lineHeight){let line='';for(const char of text){if(ctx.measureText(line+char).width>maxWidth){ctx.fillText(line,x,y);y+=lineHeight;line='';}line+=char;}if(line){ctx.fillText(line,x,y);y+=lineHeight;}return y;}
function downloadCard(){if(!run?.ending)return;const [title,desc,grade]=ENDING_META[run.ending];const can=document.createElement('canvas');can.width=1000;can.height=800;const ctx=can.getContext('2d');if(!ctx){toast='画像保存に対応していないブラウザです。';render(false);return;}
  ctx.fillStyle='#132d47';ctx.fillRect(0,0,1000,800);ctx.fillStyle='#b9cfe0';ctx.font='26px sans-serif';ctx.fillText('東央ソリューションズ　|　管理職人事評価 2030',68,94);
  ctx.fillStyle='#fff';ctx.font='bold 29px sans-serif';ctx.fillText(`ENDING ${run.ending.slice(1)} / 16`,68,166);
  ctx.font='bold 53px sans-serif';let y=drawWrapped(ctx,title,68,253,860,67);
  ctx.fillStyle='#f5d89b';ctx.font='bold 63px sans-serif';ctx.fillText('評価 '+grade,68,y+42);
  ctx.fillStyle='#dfe9f0';ctx.font='28px sans-serif';y=drawWrapped(ctx,desc,68,y+112,860,45);
  ctx.fillStyle='#314f68';ctx.fillRect(65,530,870,130);
  ctx.fillStyle='#ffffff';ctx.font='bold 34px sans-serif';ctx.fillText(`コンプラ ${run.cp} pt`,91,609);ctx.fillText(`進捗 ${run.progress}`,410,609);ctx.fillText(`育成 ${run.growth}`,690,609);
  ctx.fillStyle='#a9bbca';ctx.font='24px sans-serif';ctx.fillText('適切にご対応ください。｜ ARG C1',68,730);
  const a=document.createElement('a');a.download=`ARG_C1_${run.ending}.png`;a.href=can.toDataURL('image/png');a.click();}
function maybeNew(){const saved=load(SAVE_KEY,null);if(isValidSave(saved,events)&&!confirm('保存中のプレイは上書きされます。新しく始めますか？'))return;run=createRun(createProfile());resetClock();screen='profile';popup='';save();render();}
app.addEventListener('click', async ev=>{
  const target=ev.target.closest('[data-action],[data-choice],[data-time]');
  if(!target){if(ev.target.id==='overlay')closeModal();return;}
  if(target.dataset.time){clockSelected=target.dataset.time;render(false);return;}
  if(target.dataset.choice){if(!run||run.phase!=='scene')return;const e=activeEvent();const timing=e.id==='D3-1'?clockSelected:null;
    try{run=calculate(run,e,e.choices.find(c=>c.id===target.dataset.choice),timing);const last=run.pending;const category=last.name.replace(/疑義$/,'');records.names[category]??={count:0};records.names[category].count++;
    if(last.speedCp>0&&last.speedName!==last.name.replace(/疑義$/,'')){records.names[last.speedName]??={count:0};records.names[last.speedName].count++;}
    storeRecords();save();finishRunOnce();resetClock();tone(last.deltaCp===0,last.deltaCp,last.comboStreak??0);render();}catch(err){toast=err.message;render(false);}return;}
  const action=target.dataset.action;
  if(action==='start'||action==='restart'){maybeNew();return;}
  if(action==='intro'){screen='intro';popup='';render();return;}
  if(action==='resume'){const saved=load(SAVE_KEY,null);if(isValidSave(saved,events)){run=restoreSaved(saved);screen=run.profileAccepted?'play':'profile';resetClock();save();render();}return;}
  if(action==='reroll'){run=createRun(createProfile());save();render();return;}
  if(action==='begin'){run.profileAccepted=true;screen='play';save();render();return;}
  if(action==='begin-day'){run=beginDay(run);save();render();return;}
  if(action==='next'){run=advance(run);save();render();return;}
  if(action.startsWith('show-')){showModal(action.slice(5));return;}
  if(action==='close-modal'){closeModal();return;}
  if(action==='toggle-sound'){muted=!muted;persist(PREF_KEY,muted);render(false);return;}
  if(action==='share'){await share();return;}
  if(action==='download-card'){downloadCard();return;}
});
document.addEventListener('keydown',ev=>{
  if(!popup)return;
  if(ev.key==='Escape'){ev.preventDefault();closeModal();return;}
  if(ev.key==='Tab'){
    const modal=app.querySelector('[role="dialog"]');if(!modal)return;
    const focusable=[...modal.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),[tabindex]:not([tabindex="-1"])')];
    if(!focusable.length){ev.preventDefault();modal.focus();return;}
    const first=focusable[0],last=focusable.at(-1);
    if(ev.shiftKey&&(document.activeElement===first||!modal.contains(document.activeElement))){ev.preventDefault();last.focus();}
    else if(!ev.shiftKey&&(document.activeElement===last||!modal.contains(document.activeElement))){ev.preventDefault();first.focus();}
  }
});

(async()=>{try{const response=await fetch('./events.json?v=0.5.6',{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);const json=await response.json();events=json.events;
  if(!Array.isArray(events)||events.length!==15||events.some(e=>e.choices.length!==6))throw new Error('イベント定義が不正です');
  render();}catch(err){app.innerHTML=`<div class="error"><strong>ゲームデータを読み込めませんでした。</strong><p>${esc(err.message)}</p><p>ネットワーク接続を確認してページを再読み込みしてください。</p></div>`;}})();
