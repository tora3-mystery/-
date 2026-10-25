import {VERSION,UPDATED_JST,LIMITS,DAYS,ENDING_META,createProfile,createRun,calculate,advance,isValidSave} from './engine.mjs';

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
let records=load(RECORD_KEY,{names:{},endings:{},plays:0});
let muted=load(PREF_KEY,false);
let clockMode='choice';
let clockStart=null;
let clockInterval=null;
let clockSelected=8;
let toast='';
const isTouch=()=>false;

function save(){if(run)persist(SAVE_KEY,run);}
function storeRecords(){persist(RECORD_KEY,records);}
function stat(label,value,cap,kind){return `<div class="stat ${kind}"><div class="statline"><span>${label}</span><span>${Math.min(value,cap)}/${cap}</span></div><div class="statnum mono">${value}<small style="font-size:11px;font-weight:500;color:#778a96"> / ${cap}</small></div><div class="bar"><i style="width:${Math.min(100,Math.round(100*value/cap))}%"></i></div></div>`;}
function scorePanel(){return `<div class="stats">${stat('コンプラ',run.cp,LIMITS.cp,'cp')}${stat('業務進捗',run.progress,LIMITS.progress,'progress')}${stat('新人の習熟',run.growth,LIMITS.growth,'growth')}</div>`;}
function statusBar(){return `<div class="progress-label"><span>5営業日間の育成記録</span><span>${DAYS[Math.floor(run.index/3)]}　${run.index%3+1} / 3</span></div><div class="progressline">${DAYS.map((_,i)=>`<i class="${Math.floor(run.index/3)>=i?'active':''}"></i>`).join('')}</div>`;}
function topActions(){return `<div class="toolrow"><button class="quiet" data-action="show-profile">社員プロフィール</button><button class="quiet" data-action="show-notes">業務メモ</button><button class="quiet" data-action="show-archive">ハラ図鑑</button><button class="quiet" data-action="show-guide">操作説明</button></div>`;}
function intro(){
  const saved=load(SAVE_KEY,null);const canResume=isValidSave(saved,events);
  return `<div class="eyebrow">2030 / HUMAN RESOURCE MANAGEMENT SYSTEM</div>
    <h1 class="h1">適切に<br>ご対応ください。</h1>
    <p class="lead">あなたは営業企画部の課長です。今週、新しい若手社員が配属されます。<br>金曜日の役員説明までに<strong>仕事を終え、新人を育て、コンプライアンス違反を回避</strong>してください。</p>
    <div class="paper spaced"><div class="panelhead"><b>管理職向け 業務指示</b><span class="tag">重要</span></div>
    <div class="quote">「新人には積極的に声をかけるように。指導は丁寧に。過干渉は厳禁。資料の遅延も認めません」<br><span class="tiny">— 営業本部 部長</span></div>
    <div class="rules"><div class="rule"><span>コンプラ</span><b>20 pt</b><span>到達で即呼び出し</span></div><div class="rule"><span>業務進捗</span><b>22 以上</b><span>金曜の達成条件</span></div><div class="rule"><span>新人の習熟</span><b>6 以上</b><span>金曜の達成条件</span></div></div>
    <p class="small" style="line-height:1.9">各場面で<strong>6つの対応</strong>から1つ選択。判定直後に新たな「○○ハラ」が発表されます。<strong>疑義は0pt</strong>。本人の経歴・希望や過去のやり取りを読むと、認定リスクを減らせます。</p>
    <p class="privacy">架空の社内分類を風刺する作品です。現実の被害やハラスメント認定を扱う研修ではありません。記録はこの端末にのみ保存され、外部に送信されません。</p>
    <div class="actions">${canResume?'<button class="primary" data-action="resume">続きから再開</button>':''}<button class="${canResume?'secondary':'primary'}" data-action="start">${canResume?'最初から始める':'配属社員を確認して始める'}</button></div>
    </div><div class="toolrow spaced"><button class="quiet" data-action="show-archive">これまでのハラ図鑑 (${Object.keys(records.names).length}件)</button><button class="quiet" data-action="show-endings">エンディング収集 (${Object.keys(records.endings).length}/16)</button><button class="quiet" data-action="toggle-sound">効果音：${muted?'OFF':'ON'}</button></div>`;
}
function profileCard(p){return `<div class="employee"><div class="portrait" role="img" aria-label="社員を表すアイコン">${esc(p.avatar)}</div><div><div class="tiny">本日配属・人材プロフィール</div><div class="employee-name">${esc(p.name)}</div><div class="employee-sub">${esc(p.gender)}・${esc(p.age)}歳 / 入社${p.grade}年目<br>${esc(p.previous)} → ${esc(p.department)}</div></div></div>
  <div class="profile-grid"><div class="info"><b>希望するキャリア</b>${esc(p.ambition)}</div><div class="info"><b>強み・経験</b>${esc(p.skill)}</div></div>
  <div class="list-header">本人からのメッセージ</div>${p.speech.map(s=>`<div class="quote">「${esc(s)}」</div>`).join('')}`;}
function profileScreen(){return `<div class="eyebrow">DAY 01 / 配属通知</div><h1 class="h2">今週の配属社員</h1><p class="lead">人材基本情報を確認してください。希望や得意分野は、今週の指導に影響します。</p><section class="paper">${profileCard(run.profile)}<div class="actions"><button class="primary" data-action="begin">この社員を受け入れる</button><button class="quiet" data-action="reroll">別の社員を表示する</button></div></section>`;}
function scene(){const e=events[run.index];const dayIndex=Math.floor(run.index/3);const dayline=run.index%3===0?`<div class="daynote"><strong>${DAYS[dayIndex]}・部長からの連絡</strong><br>${[
  '今週から若手社員を育ててくれ。話しかけて、でもプレッシャーは与えないように。',
  '指導時間は短く。資料の品質も落とすな。AIは適切に活用し、責任は現場で持つこと。',
  '自主性を尊重しろ。進捗は徹底管理してくれ。',
  '働きやすい職場づくりが最優先。もちろん明日の成果物は完成させろ。',
  '本日17時、役員報告。資料と育成状況を報告してくれ。失敗はなしで頼む。'][dayIndex]}</div>`:'';
  return `<div class="panelhead"><span class="eyebrow">業務進行中</span><span class="tag">自動保存</span></div>${scorePanel()}${statusBar()}${topActions()}${dayline}
  <div class="scene-header"><div class="scene-index">DAY ${dayIndex+1} / CASE ${run.index%3+1}　${esc(e.id)}</div><div class="scene-title">${esc(e.title)}</div><div class="scene-description">${esc(e.scene)}</div><div class="cue">判断材料：${esc(e.cue)}</div></div>
  <section class="paper"><div class="panelhead"><strong class="small">あなたはどう対応しますか？</strong><span class="tiny">6つから1つ選択</span></div>
  ${e.id==='D3-1'?clockWidget():''}
  <div class="choices">${e.choices.map(c=>`<button class="choice" data-choice="${c.id}" ${e.id==='D3-1'&&clockMode==='real'&&clockStart===null?'disabled title="まず時間計測を開始してください"':''}><span class="letter">${c.id}</span><span>${esc(c.text)}</span></button>`).join('')}</div></section><p class="privacy">※選択後の対応は戻せません。コンプラポイントが20に到達すると、ただちに部長から呼び出されます。</p>`;
}
function clockWidget(){return `<div class="clockbox"><strong class="small">特殊イベント｜返信速度を測定</strong><p class="clock-warning">メッセージを読み終えてから開始してください。返信のタイミングに応じて追加認定が発生する場合があります。</p><div class="clockmode"><button data-action="clock-choice" class="quiet ${clockMode==='choice'?'selected':''}">時間を選んで返信</button><button data-action="clock-real" class="quiet ${clockMode==='real'?'selected':''}">実際の時間を計測</button></div>
  ${clockMode==='choice'?`<div class="clockmode"><button class="quiet ${clockSelected===1?'selected':''}" data-time="1">即返信（1秒）</button><button class="quiet ${clockSelected===8?'selected':''}" data-time="8">通常（8秒）</button><button class="quiet ${clockSelected===25?'selected':''}" data-time="25">後で返信（25秒）</button></div><div class="clock-warning">選択中：${clockSelected}秒。下の返信内容を選ぶと確定します。</div>`:
    `<div class="clocktime mono" id="clock-display">${clockStart===null?'00.0 秒':((performance.now()-clockStart)/1000).toFixed(1)+' 秒'}</div><div class="clockmode"><button class="secondary" data-action="clock-start" ${clockStart!==null?'disabled':''}>${clockStart===null?'計測開始':'計測中…'}</button></div><div class="clock-warning">計測中は返信を選んだ瞬間に停止します。ページ再読込でタイマーのみリセットされます。</div>`}
  </div>`;}
function resultScreen(){const log=run.pending;if(!log)return '<p class="error">表示できる判定がありません。</p>';
  const safe=log.deltaCp===0, name=log.name.endsWith('疑義')&&safe?log.name:log.name;
  const newly=records.names[log.rawName]?.count===1;
  return `<div class="eyebrow">社内コンプライアンス認定システム / 判定結果</div><div class="result-card ${safe?'safe':''}">
    <div class="result-symbol">${safe?'✓':'!'}</div><div class="tiny">${safe?'審査終了｜正式認定なし':'新たなハラスメントを検出'}</div>
    <div class="result-name">${esc(name)}！</div><strong class="small">${safe?'今回は疑義止まりです':'社内コンプライアンス分類'}</strong>
    <p class="result-reason">${esc(log.reason)}</p>
    ${log.fitAdjustment!==0?`<p class="tiny">${log.fitAdjustment<0?'本人の希望・得意分野に一致したため認定が軽減されました。':'本人の希望・得意分野との不一致が加点に影響しました。'}</p>`:''}
    ${log.speedName?`<p class="small"><strong>追加認定：${esc(log.speedName)}</strong>（返信${log.replySeconds.toFixed(1)}秒）</p>`:''}
    ${log.extraReason?`<p class="small">${esc(log.extraReason)}</p>`:''}
    <div class="score-boost ${safe?'safe':''}">+${log.deltaCp} pt</div><div class="result-stats"><span>業務進捗 ${log.deltaP>=0?'+':''}${log.deltaP}</span><span>新人の習熟 +${log.deltaS}</span><span>累積 ${run.cp}/${LIMITS.cp}</span></div>
    ${newly?'<div class="collection">✦ 新たなハラ分類を図鑑に登録しました</div>':''}</div>
    <div class="actions"><button class="primary" data-action="next">${run.ending?(run.cp>=LIMITS.cp?'部長室に向かう':'最終評価を確認する'):(run.index%3===2?'翌営業日へ進む':'次の業務へ進む')}</button><button class="secondary" data-action="show-notes">これまでの対応を確認</button></div>`;}
function endingScreen(){const id=run.ending||'E04', [title,desc,grade]=ENDING_META[id];const failed=run.cp>=LIMITS.cp;
  const director=failed?'「君、今週いったい何回ハラスメントをしたんだ！ こんなに申告される管理職は初めて見たぞ！ 君には新人を任せられん！」':
    id==='E05'||id==='E06'?'「配慮は分かった。ところで、提出資料はどこにある？」':
    ['E07','E08'].includes(id)?'「仕事はできているな。……で、新人に何を教えたんだ？」':
    '「よくやった。来週もう一人配属される。ちなみに来月から社内分類が17項目増えるそうだ」';
  return `<div class="eyebrow">2030年度 / 人事評価通知</div><div class="end-banner"><div class="tiny" style="color:#c3d1dd">ENDING ${id.slice(1)} / 16</div><div class="ending-title">${esc(title)}</div><div class="grade">評価 ${esc(grade)}</div><p class="end-sub">${esc(desc)}</p></div>
  <div class="end-grid"><div><strong>${run.cp}</strong><span>コンプラ pt</span></div><div><strong>${run.progress}</strong><span>業務進捗</span></div><div><strong>${run.growth}</strong><span>新人の習熟</span></div></div>
  <section class="paper"><div class="panelhead"><strong>上司からの最終講評</strong><span class="tag ${failed?'red':''}">${failed?'管理職適性再審査':'週次評価'}</span></div><div class="quote">${director}</div><p class="small muted">配属社員：${esc(run.profile.name)} / ${esc(run.profile.ambition)}</p></section>
  <div class="paper spaced"><strong>今回のハラ認定履歴</strong><p class="tiny">どの対応が何点だったか、選択ごとの根拠を確認できます。</p>${run.logs.map(l=>`<details class="history-row" style="margin-top:7px"><summary><b>${esc(l.id)}｜${esc(l.name)}　+${l.deltaCp}pt</b></summary><div class="small" style="padding-top:7px">対応：${esc(l.choiceText)}<br>${esc(l.reason)}${l.extraReason?`<br>${esc(l.extraReason)}`:''}</div></details>`).join('')}</div>
  <div class="actions"><button class="primary" data-action="restart">別の社員でもう一度</button><button class="secondary" data-action="download-card">結果カードを画像保存</button><button class="secondary" data-action="share">結果を共有・コピー</button></div>
  <div class="toolrow spaced"><button class="quiet" data-action="show-archive">ハラ図鑑 (${Object.keys(records.names).length}種)</button><button class="quiet" data-action="show-endings">獲得エンディング (${Object.keys(records.endings).length}/16)</button><button class="quiet" data-action="intro">タイトル画面へ戻る</button></div>`;}
function showModal(type){
  const p=run?.profile;
  let title='',body='';
  if(type==='profile'){title='配属社員プロフィール';body=p?profileCard(p):'<div class="empty">まだ社員が配属されていません。</div>';}
  if(type==='guide'){title='操作説明';body=`<div class="info">5営業日・15イベントで、6つの対応から1つずつ選びます。コンプラ20ptで即敗北。金曜までに業務22以上・習熟6以上でクリア。選択後の結果画面で「○○ハラ」の種類と点数が表示されます。</div><p class="small">チャット返信イベントでは、実時間計測または時間指定を選べます。プロフィールと業務メモはいつでも参照できます。</p><p class="privacy">スコア、名前、イベントはゲーム内のフィクションであり、現実の法的判断ではありません。</p>`;}
  if(type==='notes'){title='業務メモ';body=run?`${run.logs.length?`<div class="timeline">${run.logs.map(l=>`<div class="history-row"><strong>${esc(l.id)}｜${esc(l.title)}　+${l.deltaCp}pt</strong>${esc(l.choiceText)}<br><span class="muted">${esc(l.name)}　${esc(l.reason)}</span></div>`).join('')}</div>`:'<div class="empty">対応履歴はありません。</div>'}<hr class="sectionline"><div class="info"><b>これまでの引継ぎ事項</b>${run.flags.checkAgreed?'✓ 確認時間を合意済み<br>':'・確認時刻は未合意<br>'}${run.flags.aiVerified?'✓ AIの資料は出典検証済み<br>':run.flags.aiUnverified?'！AIの出典に未確認部分がある<br>':'・AIの出典は未確認リスクが明示されていない<br>'}${run.flags.presentationPrepped?'✓ 発表担当の準備を進めた':'・発表担当の練習は未確認'}</div>`:'<div class="empty">まだ業務履歴はありません。</div>';}
  if(type==='archive'){title='ハラ図鑑';const names=[...new Set(events.flatMap(e=>e.choices.map(c=>c.harassment)))];body=`<p class="small muted">発見 ${Object.keys(records.names).length} / ${names.length} 分類。疑義として現れた名称も図鑑に登録されます。</p><div class="timeline">${names.map(n=>{const info=records.names[n];return `<div class="history-row"><strong>${info?'✦ '+esc(n):'？？？ 未発見'}</strong>${info?`認定・疑義を含む遭遇回数：${info.count}回`:'未発見の分類'}</div>`;}).join('')}</div>`;}
  if(type==='endings'){title='エンディングコレクション';body=`<p class="small muted">${Object.keys(records.endings).length}/16 種を解放</p><div class="timeline">${Object.entries(ENDING_META).map(([id,d])=>`<div class="history-row"><strong>${records.endings[id]?`${id}｜${esc(d[0])}`:`${id}｜？？？`}</strong>${records.endings[id]?esc(d[1]):'未達成のエンディング'}</div>`).join('')}</div>`;}
  popup=`<div class="overlay" id="overlay"><section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}"><button class="modal-close" data-action="close-modal" aria-label="閉じる">×</button><h2 class="h2">${esc(title)}</h2>${body}</section></div>`;
  render(false);
}
function render(scroll=true){
  if(!events.length){app.innerHTML='<div class="loading">読み込み中…</div>';return;}
  if(screen==='intro')app.innerHTML=intro();
  else if(screen==='profile')app.innerHTML=profileScreen();
  else if(run?.phase==='scene')app.innerHTML=scene();
  else if(run?.phase==='result')app.innerHTML=resultScreen();
  else if(run?.phase==='ending')app.innerHTML=endingScreen();
  else app.innerHTML=intro();
  if(popup)app.insertAdjacentHTML('beforeend',popup);
  if(toast)app.insertAdjacentHTML('beforeend',`<div class="paper spaced" role="status">${esc(toast)}</div>`);
  if(clockStart!==null&&run?.phase==='scene'&&events[run.index].id==='D3-1') startClockInterval();
  if(scroll)window.scrollTo({top:0,behavior:'instant'});
}
function startClockInterval(){if(clockInterval)clearInterval(clockInterval);clockInterval=setInterval(()=>{const e=document.getElementById('clock-display');if(e&&clockStart!==null)e.textContent=((performance.now()-clockStart)/1000).toFixed(1)+' 秒';},100);}
function resetClock(){if(clockInterval)clearInterval(clockInterval);clockInterval=null;clockStart=null;clockMode='choice';clockSelected=8;}
function tone(safe){if(muted)return;try{const ctx=new (window.AudioContext||window.webkitAudioContext)();let t=ctx.currentTime;for(const [freq,offset] of (safe?[[520,0],[660,.11]]:[[430,0],[370,.13],[540,.24]])){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(.0001,t+offset);g.gain.exponentialRampToValueAtTime(.08,t+offset+.01);g.gain.exponentialRampToValueAtTime(.0001,t+offset+.12);o.connect(g);g.connect(ctx.destination);o.start(t+offset);o.stop(t+offset+.13);}setTimeout(()=>ctx.close(),550);}catch{}}
function finishRunOnce(){if(!run?.ending||run.finishedRecorded)return;run.finishedRecorded=true;records.plays++;records.endings[run.ending]=(records.endings[run.ending]||0)+1;storeRecords();save();}
function resultToText(){if(!run?.ending)return '';const d=ENDING_META[run.ending];return `適切にご対応ください。｜ARG C1\nENDING ${run.ending.slice(1)} / 16「${d[0]}」\n評価 ${d[2]}｜コンプラ ${run.cp}pt／進捗 ${run.progress}／習熟 ${run.growth}\n${d[1]}\nhttps://tora3-mystery.github.io/short-ui-games/c1/`}
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
  if(!target){if(ev.target.id==='overlay'){popup='';render(false)}return;}
  if(target.dataset.time){clockSelected=Number(target.dataset.time);render(false);return;}
  if(target.dataset.choice){if(!run||run.phase!=='scene')return;const e=events[run.index];let seconds=null;if(e.id==='D3-1'){
    if(clockMode==='real'&&clockStart===null)return;
    seconds=clockMode==='choice'?clockSelected:(performance.now()-clockStart)/1000;
  }
    try{run=calculate(run,e,e.choices.find(c=>c.id===target.dataset.choice),seconds);const last=run.pending;records.names[last.rawName]??={count:0};records.names[last.rawName].count++;
    if(last.speedName&&last.speedName!==last.rawName){records.names[last.speedName]??={count:0};records.names[last.speedName].count++;}
    storeRecords();save();finishRunOnce();resetClock();tone(last.deltaCp===0);render();}catch(err){toast=err.message;render(false);}return;}
  const action=target.dataset.action;
  if(action==='start'||action==='restart'){maybeNew();return;}
  if(action==='intro'){screen='intro';popup='';render();return;}
  if(action==='resume'){const saved=load(SAVE_KEY,null);if(isValidSave(saved,events)){run=saved;screen='play';resetClock();render();}return;}
  if(action==='reroll'){run=createRun(createProfile());save();render();return;}
  if(action==='begin'){screen='play';save();render();return;}
  if(action==='next'){run=advance(run);save();render();return;}
  if(action.startsWith('show-')){showModal(action.slice(5));return;}
  if(action==='close-modal'){popup='';render(false);return;}
  if(action==='clock-choice'){resetClock();clockMode='choice';render(false);return;}
  if(action==='clock-real'){resetClock();clockMode='real';render(false);return;}
  if(action==='clock-start'){clockStart=performance.now();render(false);return;}
  if(action==='toggle-sound'){muted=!muted;persist(PREF_KEY,muted);render(false);return;}
  if(action==='share'){await share();return;}
  if(action==='download-card'){downloadCard();return;}
});
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&popup){popup='';render(false);}});

(async()=>{try{const response=await fetch('./events.json?v=0.4.0',{cache:'no-store'});if(!response.ok)throw new Error(`HTTP ${response.status}`);const json=await response.json();events=json.events;
  if(!Array.isArray(events)||events.length!==15||events.some(e=>e.choices.length!==6))throw new Error('イベント定義が不正です');
  render();}catch(err){app.innerHTML=`<div class="error"><strong>ゲームデータを読み込めませんでした。</strong><p>${esc(err.message)}</p><p>ネットワーク接続を確認してページを再読み込みしてください。</p></div>`;}})();
