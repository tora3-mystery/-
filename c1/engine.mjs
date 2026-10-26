/** C1 gameplay logic. Pure and dependency-free: also imported by tests. */
export const VERSION = '0.6.2';
export const UPDATED_JST = '2026-10-26 17:35 JST';
export const LIMITS = Object.freeze({ cp: 20, progress: 22, growth: 6 });
export const DAYS = ['月曜日', '火曜日', '水曜日', '木曜日', '金曜日'];
export const SPEED_HARASSMENTS = Object.freeze(['即レスハラ','遅レスハラ']);
export const DIRECTIVES = Object.freeze([
  {time:'09:00', title:'初週の育成と即戦力化', demand:'歓迎・指導は丁寧に。ただし資料も初日から進めること。進捗3以上、習熟2以上を報告。', progress:3, growth:2, remark:'挨拶だけで終わる初日など論外だぞ。'},
  {time:'09:00', title:'生産性向上の即日報告', demand:'AIは積極活用。ミスはゼロ。昨日まで含め進捗9以上、習熟3以上に。', progress:9, growth:3, remark:'AIに任せたのに遅い、という説明は受け付けない。'},
  {time:'09:00', title:'自主性と進捗管理を両立', demand:'手取り足取りは禁止。ただし進捗15以上、習熟4以上を必達。', progress:15, growth:4, remark:'放置と自律支援の区別くらい、課長なら分かるだろう。'},
  {time:'09:00', title:'会議ゼロ・品質最大化', demand:'残業はゼロ。明日の役員報告に向け、進捗20以上・習熟5以上。', progress:20, growth:5, remark:'間に合わないなら工夫して。もちろん長時間労働は禁止。'},
  {time:'09:00', title:'本日17時、役員説明', demand:'進捗22以上・習熟6以上で着地。コンプラ20点は即呼び出し。言い訳は認めない。', progress:22, growth:6, remark:'成功するまでが育成。成功しなかったら指導方法を見直そう。'}
]);
const pick = (xs, rng) => xs[Math.min(xs.length - 1, Math.floor(rng() * xs.length))];
// Display names are independently generated; neither gender nor name affects gameplay rules.
const surnames = ['佐藤','鈴木','高橋','田中','伊藤','渡辺','山本','中村','小林','加藤','吉田','山田','佐々木','山口','松本','井上','木村','林','斎藤','清水','山崎','森','阿部','池田','橋本','石川','前田','藤田','青木','岡田'];
const givenNames = {
  '男性': ['悠真','陸','一樹','湊','直哉','拓海','蒼','大輝','悠斗','蓮','陽翔','晴人','颯太','大和','航平','翔太','健太','樹','悠人','朝陽','智也','新','俊介','直樹'],
  '女性': ['花音','葵','美咲','結衣','陽菜','彩乃','紗季','結菜','凛','美月','琴音','莉子','陽葵','さくら','心春','菜々','楓','優奈','咲良','千尋','明日香','真央','詩織','美緒'],
};
export const ENDING_META = {
  E01: ['初週で部長室','週の途中で、部長室への呼び出しだけが確定した。','D'],
  E02: ['全部私がやりました','仕事と対応を課長が抱え込んだ。新人が手を動かす機会は、少しずつ失われていった。','D'],
  E03: ['ランチでつまずいた課長','あの昼休みの強引な対応が、人事の記録にも残ってしまった。','D'],
  E04: ['ハラスメント百貨店','一週間で何種類の社内分類に触れたのだろう。職場は今日も平和だ。','D'],
  E05: ['全員が幸せな未完成資料','気を配り、よく話し合った。納期だけが誰にも配慮されなかった。','C'],
  E06: ['目標未達の5営業日','対応に追われた一週間。仕事も育成も、目標には届かなかった。','D'],
  E07: ['最強のプレイングマネージャー','仕事は完璧。なお、新人は何も覚えていない。','B−'],
  E08: ['新人、まだ独り立ちできず','資料は完成した。新人は「来週も、分からないところは相談させてください」と言う。','C'],
  E09: ['無難な課長','大きな事故もなく、仕事も育成も終わった。部長は褒めない。','B'],
  E10: ['修羅場の納期職人','ハラスメント認定寸前で資料を提出。人事室の廊下が長く見えた。','B'],
  E11: ['育成課長','新しい戦力が育った。次は指導法を全社展開しろと言われた。','A'],
  E12: ['提案資料のスピードスター','なんとか数字を揃えて納品。部長は来週の案件も抱えてきた。','A'],
  E13: ['出典、重要箇所は確認済み','火曜の出典に加え、金曜の追加数字も重要箇所を検証した。役員から「AIなら一瞬でしょ？」と尋ねられた。','A'],
  E14: ['令和の調整職人','認定をほとんど受けず、仕事を終えた。社内で絶滅危惧種と呼ばれる。','S'],
  E15: ['新人が役員席で話した日','新人の説明に役員が頷く。部長はなぜか自分の手柄にした。','S'],
  E16: ['コンプラ室への推薦状','「ハラスメントが多すぎて無理でした」。その一言を、人事部は新規分類の参考にした。','?'],
  E17: ['本件、対応いたしかねます。','板挟みの末、課長は社員証を置いて姿を消した。人事部はこれを「業務放棄誘発ハラ」と分類した。','?'],
  E18: ['好きになってしまいました。','新人からの思いがけない告白。架空の社内基準によって「恋愛感情誘発ハラ」が特別認定された。','D'],
};
const PHOTO_BANK = Object.freeze({
  '男性': ['./assets/employee-m01.webp', './assets/employee-m02.webp', './assets/employee-m03.webp', './assets/employee-m04.webp', './assets/employee-m05.webp', './assets/employee-m06.webp', './assets/employee-m07.webp', './assets/employee-m08.webp', './assets/employee-m09.webp', './assets/employee-m10.webp', './assets/employee-m11.webp'],
  '女性': ['./assets/employee-f01.webp', './assets/employee-f02.webp', './assets/employee-f03.webp', './assets/employee-f04.webp', './assets/employee-f05.webp', './assets/employee-f06.webp', './assets/employee-f07.webp', './assets/employee-f08.webp', './assets/employee-f09.webp', './assets/employee-f10.webp', './assets/employee-f11.webp'],
});
/** Retain the employee identity when upgrading old saves; replace every legacy external portrait. */
export function ensureLocalPortrait(profile) {
  if(!profile)return profile;
  const bank=PHOTO_BANK[profile.gender]||PHOTO_BANK['男性'];
  if(!bank.includes(profile.photo)) {
    let hash=0;
    for(const ch of String(profile.name||''))hash=((hash*33)+ch.codePointAt(0))>>>0;
    profile.photo=bank[hash%bank.length];
  }
  return profile;
}
export const CAMPUS_BACKGROUNDS = Object.freeze([
  ['東都大学','経済学部'],['南星学院大学','社会学部'],['青葉大学','情報学部'],['東央工科大学','理工学部'],
  ['北辰大学','法学部'],['桜都大学','文学部'],['星丘大学','商学部'],['新都大学','心理学部'],
  ['海丘大学','統計学部'],['白峰大学','経営学部'],['緑川大学','国際学部'],['港央大学','メディア学部'],
  ['西都大学','教育学部'],['朝凪大学','デザイン学部'],['千景大学','政策学部'],['光陵大学','人間科学部'],
  ['若葉大学','地域創生学部'],['北浜大学','データ科学部'],['朱雀大学','コミュニケーション学部'],['水城大学','生活科学部'],
  ['東雲大学','会計学部'],['南港大学','工学部'],['月峰大学','言語文化学部'],['桐葉大学','環境学部']
]);
export const CLUBS = Object.freeze([
  ['ボードゲーム研究会','ルール説明を担当し、曖昧な条件に気づく役でした。'],
  ['軽音サークル','演奏前の段取り表を作るのが好きでした。'],
  ['学園祭実行委員','関係者の予定を一枚の表にまとめていました。'],
  ['写真部','同じ場所でも光の違いに気づくのが楽しかったです。'],
  ['バスケットボールサークル','試合前に役割を確認してから動いていました。'],
  ['ラグビー部','練習後に先輩と作戦を振り返っていました。'],
  ['野球部','記録係も経験し、練習メニューを見直していました。'],
  ['放送研究会','聞き手に伝わる順番を考えて原稿を書いていました。'],
  ['料理研究会','試作の手順と分量をノートに残していました。'],
  ['無所属','授業の後は接客のアルバイトを続けていました。'],
  ['統計研究会','アンケートの集計方法を何度も見直していました。'],
  ['演劇部','台詞よりも相手の間の取り方を観察していました。'],
  ['学生新聞部','取材相手の言葉を確かめてから記事にしました。'],
  ['地域ボランティア','参加者ごとの困りごとを聞く役でした。'],
  ['美術部','展示の細部を直していると時間を忘れました。'],
  ['ディベートサークル','反対意見を先に整理して議論しました。'],
  ['フットサル部','急な交代でも声を掛け合って動いていました。'],
  ['天文研究会','観測記録を決まった形式で残していました。'],
  ['映像制作サークル','短い映像でも伝える順番を何度も編集しました。'],
  ['図書館ボランティア','本を探す人の質問を最後まで聞いていました。']
]);
export const TEMPERAMENTS = Object.freeze([
  ['段取り重視','先に手順が見えると安心します。'],['行動派','試しながら方向を決めることが多いです。'],
  ['検証派','根拠の出所を確かめてから進めたいです。'],['観察派','小さな変化を見つけるのが好きです。'],
  ['調整派','全員の予定を揃えると落ち着きます。'],['伝え手','相手に届く説明の順番を考えます。'],
  ['数字好き','表を見て傾向を探すのが楽しいです。'],['改善好き','一度決めた手順も見直したくなります。'],
  ['聞き上手','結論を急がず相手の話を聞きます。'],['挑戦派','初めての案を試すときに力が出ます。'],
  ['仕上げ派','最後の確認に時間をかけます。'],['橋渡し役','立場の違う人の言葉をつなぎます。'],
  ['慎重派','見落としを防ぐために一度立ち止まります。'],['発想派','別の使い道を考えるのが好きです。'],
  ['粘り強い','一度でできなくても工夫を続けます。']
]);
export const PREVIOUS_DEPARTMENTS = Object.freeze(['法人営業部','カスタマーサクセス部','データ分析部','商品企画部','営業推進部','顧客調査部','広報部','品質管理部','業務改革部','人材開発部']);
// Each archetype owns its narrative and maps onto the existing six judgement traits.
// Campus and club choices are restricted to themes that fit its story; names/photos stay cosmetic.
export const PROFILE_TYPES = Object.freeze([
  {id:'planner',name:'段取りを組む設計者',traits:['guided','written','batched','analysis','expert'],campus:[0,9,14,20],clubs:[2,8,17],temperaments:[0,12],previous:[4,8],hobbies:['旅行の行程表づくり','パズル'],habit:'作業前にチェック欄を作る。',weakness:'予定変更が重なると、優先順位を決め直すのに時間がかかる。',episode:'配属前の資料整理で手順の抜けを見つけ、担当者に確認してから修正した。',thanks:'最初に道筋を一緒に整理してくださったので、途中から自分で進められました。'},
  {id:'runner',name:'現場で動く実行役',traits:['autonomous','spoken','immediate','presentation','management'],campus:[1,10,16,18],clubs:[4,5,6,16],temperaments:[1,14],previous:[0,1,4],hobbies:['街歩き','フットサル'],habit:'まず小さく試してから報告する。',weakness:'急ぐと記録を後回しにしがち。',episode:'配属前の合同作業で止まっていた連絡を引き受け、その日のうちに関係者へ確認した。',thanks:'任せていただいた後も要点をすぐ確認できたので、安心して動けました。'},
  {id:'verifier',name:'根拠を追う検証家',traits:['guided','written','immediate','analysis','expert'],campus:[2,8,17,20],clubs:[0,10,12,15],temperaments:[2,12],previous:[2,5,7],hobbies:['推理小説','資料の出典探し'],habit:'数字の横に必ず出典をメモする。',weakness:'確認事項が増えると提出の判断が遅れる。',episode:'配属前の集計で定義の違う二つの数字に気づき、元資料まで戻って確かめた。',thanks:'根拠を確かめる時間を認めてくださって、自信を持って数字を説明できました。'},
  {id:'observer',name:'静かな観察者',traits:['autonomous','written','batched','analysis','expert'],campus:[5,7,15,23],clubs:[3,14,17],temperaments:[3,12],previous:[5,7,8],hobbies:['写真散歩','植物の記録'],habit:'会議中は気づいた点を短く書き留める。',weakness:'発言のタイミングを逃すことがある。',episode:'配属前の会議で誰も気づかなかった表記のずれを、終了後にメモで伝えた。',thanks:'考えてから伝える時間をいただけたので、小さな違和感も提案に変えられました。'},
  {id:'coordinator',name:'人をつなぐ調整役',traits:['guided','spoken','batched','presentation','management'],campus:[1,6,10,14],clubs:[2,4,13],temperaments:[4,11],previous:[0,1,4,9],hobbies:['持ち寄りの料理会','イベント運営'],habit:'話の最後に担当と期限を確認する。',weakness:'相手に気を遣って自分の作業を抱えがち。',episode:'配属前の共同企画で意見が割れたとき、双方の条件を一枚に整理した。',thanks:'役割を一緒に確認してくださって、皆さんと相談しながら前に進めました。'},
  {id:'speaker',name:'説明を磨く伝え手',traits:['guided','spoken','immediate','presentation','expert'],campus:[5,11,18,22],clubs:[1,7,11,18],temperaments:[5,13],previous:[6,9,3],hobbies:['朗読','短い動画づくり'],habit:'結論を一文で言えるまで話す順番を直す。',weakness:'急な質問には一呼吸必要。',episode:'配属前の説明会で難しい用語を言い換え、質問が減った経験がある。',thanks:'説明の練習に付き合ってくださったので、自分の言葉で伝えられました。'},
  {id:'analyst',name:'数字を読む分析家',traits:['autonomous','written','batched','analysis','expert'],campus:[2,3,8,17,20],clubs:[0,10,17],temperaments:[6,2],previous:[2,5,7],hobbies:['数独','天気データを見ること'],habit:'会議の前に集計条件を確認する。',weakness:'数字に集中すると読み手の前提を忘れやすい。',episode:'配属前のレポートで平均値だけでは見えない偏りを見つけた。',thanks:'数字の見方を一緒に確認してくださって、分析を説明に結びつけられました。'},
  {id:'improver',name:'仕組みを直す改善屋',traits:['autonomous','written','immediate','analysis','management'],campus:[3,9,17,21],clubs:[8,15,18],temperaments:[7,13],previous:[7,8,4],hobbies:['道具の手入れ','工作'],habit:'同じ手間が二度出たら手順を書き換える。',weakness:'改善案を出しすぎて周囲を急かすことがある。',episode:'配属前の作業で重複入力を見つけ、確認を挟んだ簡単な手順に直した。',thanks:'改善案を試す範囲を一緒に決めてくださったので、周りと歩調を合わせられました。'},
  {id:'listener',name:'相手に寄り添う聞き手',traits:['guided','spoken','batched','presentation','management'],campus:[1,7,12,15],clubs:[9,13,19],temperaments:[8,11],previous:[1,5,9],hobbies:['読書会','地域の催し'],habit:'相談を受けると最初に困りごとを言い直す。',weakness:'断る場面で言葉を選びすぎる。',episode:'配属前の窓口業務で、質問の背景を聞いてから担当部署へつないだ。',thanks:'答えを急がず話を聞いてくださったので、私も相談の仕方を学べました。'},
  {id:'challenger',name:'新しい案を試す企画者',traits:['autonomous','spoken','immediate','presentation','management'],campus:[6,11,13,16],clubs:[2,11,16,18],temperaments:[9,13],previous:[3,6,4],hobbies:['新しい店めぐり','企画展'],habit:'思いつきを小さな試案にして見せる。',weakness:'面白い案に気を取られ、地味な確認を忘れがち。',episode:'配属前の企画募集で小さな試作品を持ち込み、反応を見て案を直した。',thanks:'試案を頭ごなしに否定せず、試す条件を一緒に考えてくださって嬉しかったです。'},
  {id:'finisher',name:'最後まで詰める仕上げ役',traits:['guided','written','batched','analysis','expert'],campus:[3,5,19,21],clubs:[3,8,14],temperaments:[10,14],previous:[7,2,8],hobbies:['模型づくり','料理の作り置き'],habit:'提出前に体裁と数字をもう一度見る。',weakness:'細部を直し続け、完了の線引きに迷う。',episode:'配属前の資料で注記の抜けを見つけ、提出前に関係者へ確認した。',thanks:'完成の基準を示してくださったので、確認を終えて自分の手で提出できました。'},
  {id:'bridge',name:'部署をまたぐ橋渡し役',traits:['guided','spoken','immediate','presentation','management'],campus:[4,10,18,22],clubs:[7,12,13,19],temperaments:[11,4],previous:[0,1,6,9],hobbies:['ラジオ','まちの案内図集め'],habit:'専門用語を別部署向けに言い換える。',weakness:'両方の期待を引き受けて予定が詰まりがち。',episode:'配属前の引継ぎで二つの部署の用語の違いを一覧にし、確認の往復を減らした。',thanks:'誰に何を伝えるか一緒に整理してくださって、部署をまたぐ仕事が少し怖くなくなりました。'}
]);
export function createProfile(rng = Math.random) {
  const gender = pick(['男性','女性'],rng);
  const type=pick(PROFILE_TYPES,rng);
  const [university, faculty] = CAMPUS_BACKGROUNDS[pick(type.campus,rng)];
  const [club,studentMemory] = CLUBS[pick(type.clubs,rng)];
  const [temperament,temperamentText] = TEMPERAMENTS[pick(type.temperaments,rng)];
  const photo=pick(PHOTO_BANK[gender],rng);
  const surname = pick(surnames,rng);
  const given = pick(givenNames[gender],rng);
  const [check,medium,feedback,strength,career]=type.traits;
  const grade = pick([1,2,3,4],rng);
  // 交流希望は本人の申告で、部活・人物タイプ・性別から断定しない。
  const socialStyle = pick(['convivial','quiet','flexible'],rng);
  const socialVoices={
    convivial:'仕事帰りの食事会や飲み会は好きです。誘ってもらえると嬉しいですが、参加は自由だと安心です。',
    quiet:'仕事帰りは自分の時間を大切にしています。食事会は事前に分かると助かります。',
    flexible:'ご飯会は日程次第です。参加するか自分で決められると嬉しいです。'
  };
  const previous = grade === 1 ? '新卒配属' : PREVIOUS_DEPARTMENTS[pick(type.previous,rng)];
  const checks = {guided:'途中で進捗を確認してもらえると安心です。',autonomous:'まず自分で進めて、詰まった時にまとめて相談したいです。'};
  const mediums = {spoken:'口頭で教えてもらうと頭に入りやすいです。',written:'文章やメモで確認しながら覚えるのが得意です。'};
  const feedbacks = {immediate:'改善点は気づいた時に教えてください。',batched:'改善点は一度にまとめて聞けると助かります。'};
  const strengths = {presentation:['相手に合わせて要点を説明するのが得意です。','短い発表でも伝える順番を考えるのが得意です。'],analysis:['数字の出所と集計条件を確かめるのが得意です。','資料の差分やデータの偏りを見つけるのが得意です。']};
  const careers = {management:['将来は役割を調整し、チームを支える仕事に挑戦したいです。','現場を知ったうえで、企画を動かす立場を目指しています。'],expert:['専門分野を深めて、根拠を説明できる担当者になりたいです。','一つの分野を磨き、難しい相談にも応えられる人になりたいです。']};
  return {
    name: `${surname} ${given}`,gender,grade,age:22+grade-1,
    previous, department:'営業企画部',socialStyle,socialVoice:socialVoices[socialStyle],
    university,faculty,club,studentMemory,temperament,temperamentText,photo,
    typeId:type.id,typeName:type.name,hobby:pick(type.hobbies,rng),workHabit:type.habit,weakness:type.weakness,
    episode:type.episode.replace('配属前の',grade===1?'配属前研修の':'前部署での'),
    check,medium,feedback,strength,career,
    speech:[checks[check],mediums[medium],feedbacks[feedback]],
    ambition:pick(careers[career],rng),skill:pick(strengths[strength],rng),
    avatar:pick(['💼','🧑‍💼','📊','🗂️','🧑‍💻'],rng)
  };
}
export function createRun(profile) {
  return {
    version:VERSION, profile,profileAccepted:false,index:0, cp:0, progress:0, growth:0, logs:[],
    flags:{checkAgreed:false,aiUnverified:false,aiVerified:false,presentationPrepped:false},
    phase:'briefing',pending:null,ending:null,bossReports:[],
    // Each playthrough chooses the authored alternate scene in roughly half of eligible slots.
    // Stored in the save so that reloading never rerolls an ongoing scenario.
    eventPlan:Array.from({length:15},()=>Math.random()<0.5?0:1),
    // Stable for this playthrough. Legacy saves without an order retain original A-F ordering.
    choiceOrders:Array.from({length:15},()=>{
      const order=['A','B','C','D','E','F'];
      for(let i=order.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
      return order;
    }),
    choiceTextPlan:Array.from({length:15},()=>Math.random()<0.5?0:1),
  };
}
export function fitAdjustment(choice, profile) {
  if (!choice.fit) return 0;
  const [key,value] = choice.fit.split(':');
  return profile[key] === value ? -1 : 1;
}
export function calculate(run, event, choice, replyTiming = null) {
  if (!run || !event || !choice) throw new Error('判定情報が不足しています');
  if (run.phase !== 'scene') throw new Error('この場面はすでに処理済みです');
  if (event.id !== run.currentId && run.currentId !== undefined) throw new Error('イベントの不整合');
  const adjustment=fitAdjustment(choice, run.profile);
  let baseCp=choice.harassment.endsWith('疑義')?0:Math.max(0,choice.cp+adjustment);
  const styleMismatch=event.id==='D4-1'&&!event.alternateId&&run.profile.socialStyle==='convivial'&&choice.id==='A';
  if(styleMismatch)baseCp=Math.max(0,baseCp-1);
  let deltaCp=baseCp;
  let deltaP=choice.progress;
  let deltaS=choice.growth;
  // Social approval is reflected in feedback, not an unearned technical-skill increase.
  let extraReason='';
  let speedName='',speedReason='',speedCp=0;
  if(event.id==='D2-3' && choice.id==='D' && run.flags.checkAgreed) {
    deltaP++;
    extraReason='月曜に確認時刻を合意していたため、予定どおり短時間で確認できた。';
  }
  if(event.id==='D5-1') {
    if(run.flags.aiUnverified) {deltaP-=2;extraReason='火曜に出典を未検証のまま進めたため、差し戻し対応が発生した。';}
    else if(run.flags.aiVerified) {deltaP++;extraReason='火曜に出典を検証していたため、追加依頼への対応が早かった。';}
  }
  // The final report is after the 17:00 presentation. Reporting cannot retroactively complete a slide or train an employee.
  if(event.id==='D5-3'){deltaP=0;deltaS=0;}
  if(event.id==='D3-1') {
    const mode=typeof replyTiming==='number'?(replyTiming<=2?'instant':replyTiming>20?'late':'normal'):replyTiming;
    if(!['instant','normal','late'].includes(mode)) throw new Error('返信タイミングを選択してください');
    if(mode==='late')extraReason='この問い合わせへの返信を保留したまま、他の予定業務は進行した。';
    // F is not a reply, so avoid falsely claiming "immediate/late reply" and double-counting a nonexistent response.
    if(choice.id==='F'){
      if(mode!=='normal')extraReason+=' 返信を送らない選択だったため、返信速度による追加認定はなかった。';
    } else {
      if(mode==='instant'){speedName='即レスハラ';speedReason='通知から数秒で返信したため、常時即応を求める空気を生むと社内認定された。';}
      else if(mode==='late'){speedName='遅レスハラ';speedReason='業務時間内の問い合わせを翌朝まで保留し、相談機会を遅らせたと社内認定された。';}
      if(speedName && speedName!==choice.harassment.replace(/疑義$/,'')){speedCp=2;deltaCp+=speedCp;}
    }
  }
  // Every third consecutive officially recognized event adds one compliance point.
  // Suspicions (0-point, no speed penalty) interrupt the streak. Old saves are supported.
  const official=deltaCp>0;
  let previousStreak=0;
  if(official){
    for(let i=run.logs.length-1;i>=0;i--){
      const prior=run.logs[i];
      const priorOfficial=('baseCp' in prior || 'speedCp' in prior)
        ? (Number(prior.baseCp||0)+Number(prior.speedCp||0)>0)
        : Number(prior.deltaCp||0)>0;
      if(!priorOfficial)break;
      previousStreak++;
    }
  }
  const comboStreak=official?previousStreak+1:0;
  const comboCp=comboStreak>0 && comboStreak%3===0?1:0;
  deltaCp+=comboCp;
  const baseName=choice.harassment.replace(/疑義$/,'');
  const effectiveName=baseCp===0?`${baseName}疑義`:baseName;
  const denial=/不認定|認定なし|疑義止まり|疑義に留まり|正式認定には至らない|正式認定は回避|正式認定はなかった/;
  let resolvedReason=baseCp>0 && denial.test(choice.reason)
    ? `本人の希望・得意分野との不一致により、制度上「${baseName}」として正式認定された。`
    : baseCp===0&&!choice.harassment.endsWith('疑義')
      ? `本人の希望・得意分野との適合が認められたため、今回は正式認定を見送り「${baseName}」の疑義にとどまった。`
      : choice.reason;
  if(styleMismatch) resolvedReason='本人が交流を希望しており、任意参加を前提とした誘いだったため正式認定を見送った。';
  if(event.id==='D4-1' && run.profile.socialStyle==='convivial'){
    extraReason += ['B','D'].includes(choice.id)
      ? ' 本人は交流好きだが、強制参加や酒席での業務まで望んではいない。'
      : ' 本人は交流の機会を好むと話していた。ただし参加は任意である。';
  }
  const next=structuredClone(run);
  next.cp+=deltaCp;
  next.progress=Math.max(0,next.progress+deltaP);
  next.growth=Math.max(0,next.growth+deltaS);
  if(event.id==='D1-2' && choice.id==='E') next.flags.checkAgreed=true;
  if(event.id==='D2-2') {
    next.flags.aiUnverified=['A','E'].includes(choice.id);
    next.flags.aiVerified=choice.id==='D';
  }
  if(event.id==='D4-3' && ['A','C'].includes(choice.id)) next.flags.presentationPrepped=true;
  const log={id:event.id,day:event.day,title:event.title,choiceId:choice.id,choiceText:choice.text,
    name:effectiveName,rawName:choice.harassment,reason:resolvedReason,baseCp,speedCp,comboCp,comboStreak,speedReason,deltaCp,deltaP,deltaS,
    speedName,replyTiming,eventIndex:run.index,extraReason,fitAdjustment:adjustment,time:event.time||'',};
  next.logs.push(log);
  next.pending=log;
  next.phase='result';
  const done=next.cp>=LIMITS.cp || next.index===14;
  if(done){
    next.ending=resolveEnding(next);
    if(next.ending==='E18')next.specialRecognition=20; // After ending determination, not live CP.
  }
  return next;
}
export function beginDay(run) {
  if(run.phase!=='briefing') throw new Error('部長指令画面からのみ開始できます');
  const next=structuredClone(run);next.phase='scene';return next;
}
export function settleDirective(run) {
  const day=Math.floor(run.index/3);
  if(day>=4 || run.index%3!==2) throw new Error('日次査定の時刻ではありません');
  const demand=DIRECTIVES[day];
  const missing=[];
  if(run.progress<demand.progress) missing.push('進捗');
  if(run.growth<demand.growth) missing.push('育成');
  const penalty=missing.length; // 資料や育成報告の再作成が発生
  const next=structuredClone(run);
  next.progress=Math.max(0,next.progress-penalty);
  next.bossReports??=[];
  next.bossReports.push({day,met:missing.length===0,missing,penalty,progress:run.progress,growth:run.growth});
  next.phase='dayReview';
  return next;
}
export function advance(run) {
  if(!['result','dayReview'].includes(run.phase))throw new Error('この画面から先へ進めません');
  if(run.phase==='dayReview'){
    const next=structuredClone(run);next.index++;next.phase='briefing';next.pending=null;return next;
  }
  if(run.phase==='result' && !run.ending && run.index%3===2)return settleDirective(run);
  const next=structuredClone(run);
  if(next.ending)next.phase='ending';
  else {next.index++;next.phase='scene';}
  next.pending=null;
  return next;
}
// Hidden trust is derived from choices, not from gender/portrait, and requires no save migration.
export function trustEvidence(run) {
  let score=0;const days=new Set();
  for(const log of run.logs||[]){
    const cp=Number(log.baseCp??log.deltaCp??0),growth=Number(log.deltaS??0);
    const good=growth>0&&cp===0?2:growth>0&&cp===1?1:0;
    if(!good)continue;
    score+=good+(log.fitAdjustment===-1?1:0);
    if(log.day)days.add(log.day);
  }
  return {score,days:days.size};
}
export function resolveEnding(run) {
  const wraps=run.logs.filter(l=>/巻取り|無言修正|抱え込み|登壇機会剥奪|過剰保護/.test(l.rawName)).length;
  const lunch=run.logs.find(l=>l.id==='D1-3');
  if(run.cp>=LIMITS.cp) {
    if(run.index<=8)return 'E01';
    if(wraps>=3)return 'E02';
    if(lunch&&['A','B'].includes(lunch.choiceId)&&Number(lunch.baseCp??lunch.deltaCp)>=2)return 'E03';
    return 'E04';
  }
  const last=run.logs.at(-1);
  const missed=(run.bossReports||[]).filter(r=>!r.met).length;
  // Friday's deliberate resignation is distinct from the 20-point immediate loss.
  if(run.index===14&&last?.id==='D5-3'&&last.choiceId==='F'&&run.cp>=12&&missed>=2)return 'E17';
  if(run.progress<LIMITS.progress) return run.growth>=LIMITS.growth?'E05':'E06';
  if(run.growth<LIMITS.growth) return wraps>=3?'E07':'E08';
  if(last?.choiceId==='F'&&last.id==='D5-3')return 'E16';
  const trust=trustEvidence(run);
  if(run.index===14&&run.cp<=8&&run.growth>=9&&trust.score>=21&&trust.days>=4)return 'E18';
  if(run.flags.presentationPrepped&&run.profile.strength==='presentation'&&run.growth>=8)return 'E15';
  if(run.cp<=5)return 'E14';
  if(run.flags.aiVerified&&run.logs.find(l=>l.id==='D5-1')?.choiceId==='C'&&run.progress>=25)return 'E13';
  if(run.progress>=28)return 'E12';
  if(run.growth>=9)return 'E11';
  if(run.cp>=15)return 'E10';
  return 'E09';
}
export function isValidSave(save, events) {
  return !!save && ['0.4.0','0.4.1','0.5.0','0.5.1','0.5.2','0.5.3','0.5.4','0.5.5','0.5.6','0.5.7','0.5.8','0.5.9','0.6.0','0.6.1',VERSION].includes(save.version) && Number.isInteger(save.index) && save.index>=0 && save.index<events.length
   && ['briefing','scene','result','dayReview','ending'].includes(save.phase) && Array.isArray(save.logs) && typeof save.profile?.name==='string'
   && save.flags && typeof save.cp==='number';
}
