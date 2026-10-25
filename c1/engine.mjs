/** C1 gameplay logic. Pure and dependency-free: also imported by tests. */
export const VERSION = '0.4.1';
export const UPDATED_JST = '2026-10-25 18:00 JST';
export const LIMITS = Object.freeze({ cp: 20, progress: 22, growth: 6 });
export const DAYS = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日'];
export const SPEED_HARASSMENTS = Object.freeze(['即レスハラ','遅レスハラ']);
const pick = (xs, rng) => xs[Math.min(xs.length - 1, Math.floor(rng() * xs.length))];
const names = {
  '男性': [['青木','悠真'], ['佐藤','陸'], ['高橋','一樹'], ['小林','湊'], ['山本','直哉'], ['森','拓海']],
  '女性': [['青木','花音'], ['佐藤','葵'], ['高橋','美咲'], ['小林','結衣'], ['山本','陽菜'], ['森','彩乃']],
};
export const ENDING_META = {
  E01: ['初週で部長室','月曜の朝は、もう戻ってこない。','D'],
  E02: ['全部私がやりました','課長の作業だけが、すべての部署を救った。新人の机は真っ白だ。','D'],
  E03: ['ランチでつまずいた課長','あの昼休みを境に、人事のファイルが厚くなった。','D'],
  E04: ['ハラスメント百貨店','一週間で何種類の社内分類に触れたのだろう。職場は今日も平和だ。','D'],
  E05: ['全員が幸せな未完成資料','気を配り、よく話し合った。納期だけが誰にも配慮されなかった。','C'],
  E06: ['会議だけで終わった5日間','新人の名前は覚えた。資料の1ページ目はまだ白い。','D'],
  E07: ['最強のプレイングマネージャー','仕事は完璧。なお、新人は何も覚えていない。','B−'],
  E08: ['新人、何も覚えず','資料は完成した。新人は来週も「最初から教えてください」と言う。','C'],
  E09: ['無難な課長','大きな事故もなく、仕事も育成も終わった。部長は褒めない。','B'],
  E10: ['修羅場の納期職人','ハラスメント認定寸前で資料を提出。人事室の廊下が長く見えた。','B'],
  E11: ['育成課長','新しい戦力が育った。次は指導法を全社展開しろと言われた。','A'],
  E12: ['提案資料のスピードスター','余裕で納品した。部長は来週の案件も抱えてきた。','A'],
  E13: ['出典はすべて確認しました','裏を取ることを教えた。役員から「AIなら一瞬でしょ？」と尋ねられた。','A'],
  E14: ['令和の調整職人','認定をほとんど受けず、仕事を終えた。社内で絶滅危惧種と呼ばれる。','S'],
  E15: ['新人が役員席で話した日','新人の説明に役員が頷く。部長はなぜか自分の手柄にした。','S'],
  E16: ['コンプラ室への推薦状','「分類が多すぎませんか？」その一言を、人事部は新規分類の参考にした。','?'],
};
export function createProfile(rng = Math.random) {
  const gender = pick(['男性','女性'],rng);
  const [surname,given] = pick(names[gender],rng);
  const check = pick(['guided','autonomous'],rng);
  const medium = pick(['spoken','written'],rng);
  const feedback = pick(['immediate','batched'],rng);
  const strength = pick(['presentation','analysis'],rng);
  const career = pick(['management','expert'],rng);
  const grade = pick([1,2,3,4],rng);
  const previous = grade === 1 ? '新卒配属' : pick(['法人営業部','カスタマーサクセス部','データ分析部','商品企画部','営業推進部'],rng);
  const checks = {guided:'途中で進捗を確認してもらえると安心です。',autonomous:'まず自分で進めて、詰まった時にまとめて相談したいです。'};
  const mediums = {spoken:'口頭で教えてもらうと頭に入りやすいです。',written:'文章やメモで確認しながら覚えるのが得意です。'};
  const feedbacks = {immediate:'改善点は気づいた時に教えてください。',batched:'改善点は一度にまとめて聞けると助かります。'};
  const strengths = {presentation:'説明やプレゼンが得意です。',analysis:'数字の検証やデータ集計が得意です。'};
  const careers = {management:'将来はチームをまとめる仕事に挑戦したいです。',expert:'専門性を深めて頼られる担当者になりたいです。'};
  return {
    name: `${surname} ${given}`,gender,grade,age:22+grade-1,
    previous, department:'営業企画部',
    check,medium,feedback,strength,career,
    speech:[checks[check],mediums[medium],feedbacks[feedback]],
    ambition:careers[career],skill:strengths[strength],
    avatar:pick(['💼','🧑‍💼','📊','🗂️','🧑‍💻'],rng)
  };
}
export function createRun(profile) {
  return {
    version:VERSION, profile,profileAccepted:false,index:0, cp:0, progress:0, growth:0, logs:[],
    flags:{checkAgreed:false,aiUnverified:false,aiVerified:false,presentationPrepped:false},
    phase:'scene',pending:null,ending:null,
  };
}
export function fitAdjustment(choice, profile) {
  if (!choice.fit) return 0;
  const [key,value] = choice.fit.split(':');
  return profile[key] === value ? -1 : 1;
}
export function calculate(run, event, choice, replySeconds = null) {
  if (!run || !event || !choice) throw new Error('判定情報が不足しています');
  if (run.phase !== 'scene') throw new Error('この場面はすでに処理済みです');
  if (event.id !== run.currentId && run.currentId !== undefined) throw new Error('イベントの不整合');
  const adjustment=fitAdjustment(choice, run.profile);
  const baseCp=Math.max(0,choice.cp+adjustment);
  let deltaCp=baseCp;
  let deltaP=choice.progress;
  const deltaS=choice.growth;
  let extraReason='';
  let speedName='',speedReason='',speedCp=0;
  if(event.id==='D2-3' && choice.id==='D' && run.flags.checkAgreed) {
    deltaP++;
    extraReason='初日に確認時刻を合意していたため、作業がスムーズに進んだ。';
  }
  if(event.id==='D5-1') {
    if(run.flags.aiUnverified) {deltaP-=2;extraReason='火曜に出典を未検証のまま進めたため、差し戻し対応が発生した。';}
    else if(run.flags.aiVerified) {deltaP++;extraReason='火曜に出典を検証していたため、追加依頼への対応が早かった。';}
  }
  if(event.id==='D3-1') {
    if(!Number.isFinite(replySeconds) || replySeconds < 0) throw new Error('返信時間を選択してください');
    if(replySeconds<=2) {speedName='即レスハラ';speedReason='2秒以内の返信が、同じ即応速度を求める社内圧力と認定された。';}
    else if(replySeconds>20) {speedName='遅レスハラ';speedReason='返信まで20秒超の経過が、相談を後回しにしたとの社内認定につながった。';}
    if(speedName && speedName!==choice.harassment){speedCp=1;deltaCp+=speedCp;}
  }
  const effectiveName=baseCp===0 && !choice.harassment.endsWith('疑義') ? `${choice.harassment}疑義` : choice.harassment;
  const next=structuredClone(run);
  next.cp+=deltaCp;
  next.progress=Math.max(0,next.progress+deltaP);
  next.growth=Math.max(0,next.growth+deltaS);
  if(event.id==='D1-2' && choice.id==='E') next.flags.checkAgreed=true;
  if(event.id==='D2-2') {
    next.flags.aiUnverified=['A','E'].includes(choice.id);
    next.flags.aiVerified=choice.id==='D';
  }
  if(event.id==='D4-3' && ['A','C','E'].includes(choice.id)) next.flags.presentationPrepped=true;
  const log={id:event.id,day:event.day,title:event.title,choiceId:choice.id,choiceText:choice.text,
    name:effectiveName,rawName:choice.harassment,reason:choice.reason,baseCp,speedCp,speedReason,deltaCp,deltaP,deltaS,
    speedName,replySeconds,eventIndex:run.index,extraReason,fitAdjustment:adjustment};
  next.logs.push(log);
  next.pending=log;
  next.phase='result';
  const done=next.cp>=LIMITS.cp || next.index===14;
  if(done) next.ending=resolveEnding(next);
  return next;
}
export function advance(run) {
  if(run.phase!=='result') throw new Error('結果画面からのみ進行できます');
  const next=structuredClone(run);
  if(next.ending) next.phase='ending';
  else {next.index++;next.phase='scene';}
  next.pending=null;
  return next;
}
export function resolveEnding(run) {
  const wraps=run.logs.filter(l=>/巻取り|無言修正|抱え込み|登壇機会剥奪|過剰保護/.test(l.rawName)).length;
  const lunch=run.logs.find(l=>l.id==='D1-3');
  if(run.cp>=LIMITS.cp) {
    if(run.index<=8)return 'E01';
    if(wraps>=3)return 'E02';
    if(lunch&&['A','B'].includes(lunch.choiceId))return 'E03';
    return 'E04';
  }
  if(run.progress<LIMITS.progress) return run.growth>=LIMITS.growth?'E05':'E06';
  if(run.growth<LIMITS.growth) return wraps>=3?'E07':'E08';
  const last=run.logs.at(-1);
  if(last?.choiceId==='F'&&last.id==='D5-3')return 'E16';
  if(run.flags.presentationPrepped&&run.profile.strength==='presentation'&&run.growth>=8)return 'E15';
  if(run.cp<=5)return 'E14';
  if(run.flags.aiVerified&&run.progress>=25)return 'E13';
  if(run.progress>=28)return 'E12';
  if(run.growth>=9)return 'E11';
  if(run.cp>=15)return 'E10';
  return 'E09';
}
export function isValidSave(save, events) {
  return !!save && ['0.4.0',VERSION].includes(save.version) && Number.isInteger(save.index) && save.index>=0 && save.index<events.length
   && ['scene','result','ending'].includes(save.phase) && Array.isArray(save.logs) && typeof save.profile?.name==='string'
   && save.flags && typeof save.cp==='number';
}
