/*
 * N1 scenario design v0.4.0 — independent, browser-compatible module.
 * This file does not load images and does not mutate the legacy UI.
 * Only mount it in n1/index.html AFTER Work's image/UI branch has been integrated.
 *
 * Usage:
 *   const plan = N1ScenarioV04.createPlan(build, picks);
 *   const question = plan.questions[index];
 *   const feedback = N1ScenarioV04.react(question, answer, grade, answerHistory);
 *   const interlude = N1ScenarioV04.dayBreak(dayIndex, answerHistory);
 *
 * Formatted text is raw data; render all untrusted strings as text, not HTML.
 */
(function (root) {
  'use strict';
  const VERSION = '0.5.1';
  const ORDER = Object.freeze([0, 1, 2, 3, 4, 5, 9, 7, 8, 11]);
  const DAYS = Object.freeze(['月曜日','火曜日','水曜日','木曜日','金曜日']);
  const SCENES = Object.freeze([
    {id:'mon_age',legacyIndex:0,character:'makabe',day:0},
    {id:'mon_purchase',legacyIndex:1,character:'umeda',day:0},
    {id:'tue_price',legacyIndex:2,character:'arai',day:1},
    {id:'tue_wait',legacyIndex:3,character:'rika',day:1},
    {id:'wed_age',legacyIndex:4,character:'souma',day:2},
    {id:'wed_gift',legacyIndex:5,character:'fujino',day:2},
    {id:'thu_history',legacyIndex:9,character:'keisuke',day:3},
    {id:'thu_present',legacyIndex:7,character:'shoji',day:3},
    {id:'fri_sale',legacyIndex:8,character:'rika',day:4},
    {id:'fri_final',legacyIndex:11,character:'shoji',day:4}
  ]);
  const CELEBRITIES = Object.freeze([
    {name:'大久保佳代子',age:55,source:'https://www.p-jinriki.com/sp/talent/oasiz/',clue:'『めちゃイケ』に出演していた頃から知っている人には、だいたいの世代が分かると思うの。',hint:'1990年代にはオアシズとして活動を始めていて、2000年代にはOLと芸人の二足のわらじでも知られていた。'},
    {name:'仲間由紀恵',age:46,source:'https://ogipro.com/talent/nakama/',clue:'『TRICK』が始まった頃は、まだ随分若かったわよね。',hint:'「TRICK」の連続ドラマは2000年から、「ごくせん」は2002年から。どちらも若い頃の主演作。'},
    {name:'久本雅美',age:68,source:'https://www.talent-databank.co.jp/search/profile/2000041015',clue:'ずっとテレビで見てきたけど、昔は舞台が中心だったのよね。',hint:'1984年にWAHAHA本舗の設立に参加し、1990年代には「笑っていいとも！」でもおなじみだった。'}
  ]);
  // Year-question pool: construction/renovation/opening dates must be named precisely.
  // Dates and sources verified against the operators, municipalities or heritage registry.
  const LANDMARKS_POOL=Object.freeze([
    {name:'東京駅',event:'開業',year:1914,emoji:'🚉',source:'https://www.jreast.co.jp/estation/station/info.aspx?StationCd=1039',detail:'東京駅の開業は1914年。現存する駅舎の復原工事が完了した年ではない。',clue:'丸の内側の赤レンガ駅舎。大正時代に営業を始めた駅だ。'},
    {name:'国会議事堂',event:'竣工',year:1936,emoji:'🏛️',source:'https://www.sangiin.go.jp/japanese/goiken_gositumon/faq/index.html',detail:'国会議事堂は1936年に竣工。着工年ではない。',clue:'現在の国会議事堂。昭和初期に完成した建物だ。'},
    {name:'東京タワー',event:'竣工',year:1958,emoji:'🗼',source:'https://www.japantowers.jp/tokyo_tower/',detail:'東京タワーは1958年に竣工。',clue:'戦後の高度成長を象徴する赤白の電波塔だ。'},
    {name:'東京スカイツリー',event:'開業',year:2012,emoji:'🗼',source:'https://www.tokyo-skytree.jp/about/timeline/',detail:'東京スカイツリータウンのグランドオープンは2012年5月22日。',clue:'高さ634m。21世紀に開業した比較的新しい電波塔だ。'},
    {name:'東京ドーム',event:'開場',year:1988,emoji:'🏟️',source:'https://www.tokyo-dome.jp/company/history/',detail:'東京ドームは1988年3月17日に開場した。',clue:'日本初の全天候型多目的スタジアム。昭和後期に開場した。'},
    {name:'レインボーブリッジ',event:'開通',year:1993,emoji:'🌉',source:'https://www.shutoko.co.jp/activities/database/bridge/rainbow-bridge/',detail:'レインボーブリッジは1993年8月26日に開通した。',clue:'東京湾の吊橋。東京臨海副都心の開発が進んだ平成初期に開通した。'},
    {name:'横浜赤レンガ倉庫２号館',event:'竣工',year:1911,emoji:'🧱',source:'https://www.city.yokohama.lg.jp/kanko-bunka/minato/taikan/asobu/spot/red-renga/rekishi/history.html',detail:'横浜赤レンガ倉庫2号館は1911年に竣工。1号館は1913年なので混同しない。',clue:'横浜の新港ふ頭。商業施設としての再オープンよりずっと前に完成していた。'},
    {name:'京都駅ビル（現在の４代目）',event:'開業',year:1997,emoji:'🚉',source:'https://www.kyoto-station-building.co.jp/about/',detail:'京都駅ビルは1997年9月11日にグランドオープン。駅そのものの初代開業年ではない。',clue:'原広司設計の大規模な駅ビル。平成の半ばに新しい姿になった。'},
    {name:'明石海峡大橋',event:'開通',year:1998,emoji:'🌉',source:'https://www.jb-honshi.co.jp/corp_index/technology/introduction/introduction_akashi.html',detail:'明石海峡大橋は1998年4月5日に供用開始。',clue:'神戸と淡路島を結ぶ大きな吊橋。平成の終わりよりずっと前に開通した。'},
    {name:'大阪城天守閣（現在の復興天守）',event:'完成',year:1931,emoji:'🏯',source:'https://www.city.osaka.lg.jp/toshikeikaku/page/0000594239.html',detail:'現在の大阪城天守閣は1931年に市民の寄付で再建された復興天守。豊臣期の築城年とは異なる。',clue:'豊臣秀吉が建てた初代ではなく、現在も残る鉄筋コンクリートの復興天守のこと。'},
    {name:'通天閣（現在の２代目）',event:'完成',year:1956,emoji:'🗼',source:'https://www.city.osaka.lg.jp/toshiseibi/page/0000643945.html',detail:'現在の2代目通天閣は1956年に完成。初代の完成年ではない。',clue:'新世界のシンボル。初代が解体された後、戦後に再建された鉄塔だ。'},
    {name:'日本橋（現在の石造アーチ橋）',event:'完成',year:1911,emoji:'🌉',source:'https://www.city.chuo.lg.jp/miryoku/imamukashi/nihonbashi.html',detail:'現在の日本橋は1911年に完成した石造アーチ橋。江戸時代の最初の橋ではない。',clue:'五街道の起点として知られる日本橋。現在の石造の橋について尋ねている。'},
    {name:'東京ミッドタウン（六本木）',event:'開業',year:2007,emoji:'🏙️',source:'https://www.tokyo-midtown.com/jp/about/',detail:'東京ミッドタウンは2007年3月30日にグランドオープン。',clue:'防衛庁檜町庁舎の跡地に生まれた大型複合施設だ。'}
  ]);
  const WAIT_VARIANTS = Object.freeze([
    {promise:'18:00',arrival:'18:21',checkin:'17:53',wait:28,delay:21},
    {promise:'18:00',arrival:'18:27',checkin:'17:55',wait:32,delay:27},
    {promise:'18:00',arrival:'18:34',checkin:'17:48',wait:46,delay:34}
  ]);
  const INTRO = Object.freeze([
    '月曜日。オフィスで真壁先輩と顔を合わせると、急にじっと見られた。',
    '月曜日。梅田が新しい買い物を見せながら、さっきから妙に得意げだ。',
    '火曜日。新井がスマホにメーカーの商品ページを開いてきた。',
    '火曜日。約束の時間を過ぎてカフェに駆け込むと、梨花がレシートを指でトントン叩いていた。',
    '水曜日。久しぶりに相馬さんと会うと、昨日見返したテレビの話になった。',
    '水曜日。藤野さんが送別会の贈り物を一緒に選んでほしいと言ってきた。',
    '木曜日、圭介と街歩き。見慣れた建物を指さして、急に歴史クイズが始まった。',
    '木曜日。経理の庄司さんが、少し照れながらプレゼントの相談を持ちかけてきた。',
    '金曜日の昼。梨花から突然、梅田の買い物についてメッセージが届いた。',
    '金曜日の夕方。庄司さんが木曜に見せてくれた商品を持って、またやってきた。'
  ]);
  const NEXT_DAY = Object.freeze([
    '火曜日。今度は相手の気持ちだけでなく、数字そのものも試されそう。',
    '水曜日。数字に詳しい人より、人の顔色に詳しい人が強い日かもしれない。',
    '木曜日。休日を待つ前に、ちょっとした歴史と買い物の話が待っている。',
    '金曜日。週の前半に聞いた数字を、覚えているだろうか。'
  ]);
  const fmt = n => new Intl.NumberFormat('ja-JP').format(n);
  const person = q => ({
    0:'真壁',1:'梅田',2:'新井',3:'梨花',4:'相馬',5:'藤野',
    9:'圭介',7:'庄司',8:'梨花',11:'庄司'
  }[q.legacyIndex] || '相手');
  function requireSafe(x, name) {
    if (!Number.isSafeInteger(x)) throw new Error(name + ' must be a safe integer');
    return x;
  }
  function localeTimeMinutes(s) {
    const parts = s.split(':').map(Number);
    return parts[0] * 60 + parts[1];
  }
  function guardPublic(question) {
    const q = question;
    const fields = [q.opening,q.speech,q.context,q.hint,q.item,q.publicDetail].filter(Boolean).join(' ');
    if (q.legacyIndex === 9) {
      const year = String(q.truth);
      if (fields.includes(year)) throw new Error('History answer leaked before submission: ' + year);
      if (/竣工したのは|完成したのは/.test(q.publicDetail || '')) throw new Error('History source detail leaked');
    }
    if (q.legacyIndex === 4 && /(?:19|20)\d\d年生まれ|生年月日/.test(fields)) {
      throw new Error('Celebrity birth year leaked');
    }
    if (q.legacyIndex === 8 && /公式価格\s*[0-9,]+円|購入価格\s*[0-9,]+円|税込価格\s*[0-9,]+円/.test(fields)) {
      throw new Error('Discount question reveals original yen amount');
    }
    return true;
  }
  function informalProductName(name) {
    const value=String(name||'');
    if(/アダプタ/.test(value))return 'Appleの充電器';
    if(/Alarmo/.test(value))return '任天堂の目覚まし時計';
    if(/WH-1000XM6/.test(value))return 'ソニーのヘッドホン';
    if(/ポリッシングクロス/.test(value))return 'Appleの画面拭き';
    if(/消しゴム/.test(value))return '無印良品の消しゴム';
    if(/マグカップ/.test(value))return '無印のマグカップ';
    if(/ディフューザー/.test(value))return '無印のアロマディフューザー';
    if(/カローラ/.test(value))return 'カローラ';
    return value.replace(/／[A-Z0-9-]+.*$/,'').replace(/の別店舗価格$/,'');
  }
  // Situation derives from the chosen product, not a fixed 'present' slot label.
  // Scene texts, social target band, replies and Friday callback must all agree.
  const CONSUMABLE_CATEGORIES=new Set(['eraser','correction_pen','correction_tape','pencil_case','pen','notebook','paper','underlay','cable']);
  const EQUIPMENT_CATEGORIES=new Set(['car','furniture','appliance','smartphone','keyboard','mouse','speaker','charger']);
  const GIFTABLE_CATEGORIES=new Set(['gift','beauty','clothing','bag','shoes','towel','coffee','mug','tumbler','tableware','diffuser','clock']);
  const SITUATION_TYPES=new Set(['office_supplies','office_equipment','farewell_gift','spouse_gift','household_supplies']);
  function productSituation(q,role) {
    const category=q.imageKey||'',cost=q.truth;
    const override=q.sceneOverrides?.[role];
    if(override!==undefined&&override!==null){
      if(!SITUATION_TYPES.has(override))throw new Error('Invalid scene override for '+q.productId);
      return override;
    }
    if(GIFTABLE_CATEGORIES.has(category)){
      if(cost<300)return 'office_supplies';
      if(role==='shoji'&&cost<1500)return 'household_supplies';
      if(role==='fujino'&&cost<1500)return 'office_supplies';
      return role==='fujino'?'farewell_gift':'spouse_gift';
    }
    if(CONSUMABLE_CATEGORIES.has(category)||cost<300)return 'office_supplies';
    if(EQUIPMENT_CATEGORIES.has(category)||cost>30000)return 'office_equipment';
    return role==='fujino'?'farewell_gift':'spouse_gift';
  }
  function productSceneVariant(q) {
    const name=q.speechName||'';
    if(q.imageKey==='paper'&&/画面拭き|ポリッシングクロス/.test(name+' '+q.item))return 'device_care';
    if(['mug','tableware','coffee','kitchen','tumbler'].includes(q.imageKey))return 'breakroom_item';
    if(q.imageKey==='gift'&&q.truth<300)return 'event_token';
    if(['eraser','pen','pencil_case','correction_pen','correction_tape','underlay'].includes(q.imageKey)&&q.truth>=500)return 'office_trial';
    return 'training_handout';
  }
  function applyProductScene(q) {
    if(![5,7,11].includes(q.legacyIndex))return;
    const role=q.legacyIndex===5?'fujino':'shoji';
    const type=productSituation(q,role);
    q.situationType=type;
    q.sceneVariant=productSceneVariant(q);
    const name=q.speechName;
    if(q.legacyIndex===5) {
      if(type==='office_supplies'){
        const v=q.sceneVariant;
        q.opening=v==='device_care'?'水曜日。藤野さんが共用端末の手入れ用品を選んでいる。':v==='breakroom_item'?'水曜日。藤野さんがオフィスの休憩スペース用の備品を選んでいる。':v==='event_token'?'水曜日。藤野さんが社内イベントの参加賞を選んでいる。':v==='office_trial'?'水曜日。藤野さんが職場で試す新しい文具の見積もりを見ている。':'水曜日。藤野さんが社内研修で配る備品の準備をしている。';
        q.speech=v==='device_care'?'共用端末用の'+name+'、1点いくらくらい予算を見ておきましょう？':v==='breakroom_item'?'休憩スペース用の'+name+'、1点いくらくらいで考えましょう？':v==='office_trial'?'試しに使う'+name+'、1点いくらくらい見ておけば安心ですか？':v==='event_token'?'参加賞にする'+name+'、1個いくらくらい予算を取っておきましょう？':'研修で配る'+name+'、1ついくらくらい予算を見ておくと安心ですか？';
        q.context=v==='device_care'?'藤野「機器の手入れ用品を揃えるんです。単価は余裕を持って見積もりたくて」':v==='breakroom_item'?'藤野「共用のものですし、人数分ではなく予備まで考えておきたいんです」':v==='office_trial'?'藤野「まず1つ使ってみてから、部署全体で導入するか決めます」':v==='event_token'?'藤野「参加者に配るので、個数を掛けても予算内に収まるか気になって」':'藤野「人数分揃えたいんです。見積もりを低く出しすぎて足りなくなると困るので……」';
        q.hint='1点あたりの通常価格を見積もり、少し予算に余裕を持たせると安心。';
        q.explain='実際の価格と、配布物として確保する予算は別の数字。';
        q.zone=[q.truth,Math.max(q.truth+1,Math.ceil(q.truth*1.2))];
      }else if(type==='office_equipment'){
        q.opening='水曜日。藤野さんが部署の備品・設備を導入する相談に来た。';
        q.speech='部署で'+name+'を導入するとして、いくらくらい予算を見ておきましょう？';
        q.context='藤野「上司に予算案を出すんです。安く見積もって足りなくなるのが一番怖くて」';
        q.hint='予算申請では、価格を過小評価するより少し余裕を取るのが安心。';
        q.explain='実際の調達価格と、予算確保のための数字は同じとは限らない。';
        q.zone=[q.truth,Math.max(q.truth+1,Math.ceil(q.truth*1.15))];
      }else{
        const premium=q.truth>=15000;
        q.opening=premium?'水曜日。藤野さんが退職する先輩へ、皆で贈る記念品の相談をしてきた。':'水曜日。藤野さんが送別会の贈り物を一緒に選んでほしいと言ってきた。';
        q.speech=(premium?'退職記念に皆で':'送別会で')+name+'を贈ろうと思うんです。いくらくらいに見えます？';
        q.context=premium?'藤野「皆で費用を出し合って決めたんです。重く感じさせたくないのですが……」':'藤野「相手が受け取りやすいものにしたくて。包装も迷ってるんです」';
        q.hint='お礼の品だから、高く見えすぎると相手も気を遣うかも。';
        q.explain='贈り物の実価格と、受け取る人に伝わる印象は別の数字。';
        q.zone=[Math.round(q.truth*.65),Math.round(q.truth*.85)];
      }
    }else if(q.legacyIndex===7){
      if(type==='office_supplies'){
        const v=q.sceneVariant;
        q.opening=v==='device_care'?'木曜日。庄司さんが共用端末の手入れ用品の価格を調べている。':v==='breakroom_item'?'木曜日。庄司さんが共用スペースの備品を買い足そうとしている。':v==='office_trial'?'木曜日。庄司さんが新しい文具の試験購入について確認している。':v==='event_token'?'木曜日。庄司さんが社内イベントの参加賞を確認している。':'木曜日。庄司さんが来週の研修で使う消耗品の単価表を見ている。';
        q.speech='この'+name+'、通常は1つ何円なのか分かりますか？';
        q.context=v==='device_care'?'庄司「共用の機器を清掃するものです。注文前に正式な単価を見たくて」':v==='breakroom_item'?'庄司「休憩室で使う備品です。買い足す前に価格を確認したいんです」':v==='office_trial'?'庄司「まず1個試し買いをします。正式な価格を確認したいんです」':v==='event_token'?'庄司「イベントの参加賞を数えています。単価を確定したいんです」':'庄司「来週の研修で必要なんです。見積書の数字を確認しておきたくて」';
        q.hint='消耗品も正式商品名と規格を照合。通常の単品税込価格を答える。';
        q.explain='研修用品の単価を確認するための正確な数字。';
      }else if(type==='office_equipment'){
        q.opening='木曜日。庄司さんが部署で検討中の設備・機器の価格を確認している。';
        q.speech='この'+name+'、メーカーの通常価格を確認したいんです。何円でしょう？';
        q.context='庄司「会社の購入申請に出すものなので、数字は正確にしておきたいんです」';
        q.hint='商品の規格・機種・公式の税込表示を確認。購入付帯費用は除外する。';
        q.explain='備品・設備の申請に使う通常価格を確認。';
      }else if(type==='household_supplies'){
        q.opening='木曜日。庄司さんが家で使う日用品の買い足しを検討している。';
        q.speech='家で使う'+name+'、通常価格はいくらか分かりますか？';
        q.context='庄司「妻に買い物を頼まれまして。家計簿の金額も確認しておきたいんです」';
        q.hint='メーカー公式の単品税込価格を確認。家計の見積もりは翌日に考える。';
        q.explain='日常の買い足しについての正確な価格。';
      }else{
        q.opening='木曜日。庄司さんが、少し照れながら妻へのプレゼントの相談を持ちかけてきた。';
        q.speech='妻への贈り物に'+name+'を考えています。通常価格はいくらなんでしょう？';
        q.context='庄司「妻が前に気にしていたものなんです。値段も知っておきたくて」';
        q.hint='メーカー公式の通常税込価格。値下げやポイントは考えなくていい。';
        q.explain='妻へのプレゼント候補のメーカー・ブランド通常価格。';
      }
      q.mode='facts';q.zone=[q.truth,q.truth];
    }else {
      if(type==='office_supplies'){
        const v=q.sceneVariant;
        q.opening=v==='device_care'?'金曜日。庄司さんが昨日の端末清掃用品の発注書を持ってきた。':v==='breakroom_item'?'金曜日。庄司さんが共用スペースの備品予算を確認している。':v==='office_trial'?'金曜日。庄司さんが試験購入する文具の申請額を確認している。':v==='event_token'?'金曜日。庄司さんがイベントの参加賞に必要な予算を確認している。':'金曜日。庄司さんが昨日の研修備品の発注見積もりを持ってきた。';
        q.speech='昨日の'+name+'、1つあたりいくらで予算を確保したらいいと思います？';
        q.context='庄司「正確な単価は分かったんですが、経理への申請額を少し余裕を持って組むべきか迷っていまして」';
        q.hint='昨日の単価は会話ログに残っている。予算を低く見積もりすぎないことも大切。';
        q.explain='価格の正確さと、発注予算の見積もりは別の判断。';
        q.zone=[q.truth,Math.max(q.truth+1,Math.ceil(q.truth*1.2))];
      }else if(type==='office_equipment'){
        q.opening='金曜日。庄司さんが昨日の設備・機器の購入申請書を持ってきた。';
        q.speech='昨日の'+name+'、購入予算にはいくらくらい計上しておくのが妥当でしょう？';
        q.context='庄司「本体価格だけでなく、予算に少し余裕がないと稟議を出し直すことになるので」';
        q.hint='木曜のメーカー価格はログから確認。予算額には少し余裕があると安心。';
        q.explain='メーカー価格と、会社が確保する購入予算は区別する。';
        q.zone=[q.truth,Math.max(q.truth+1,Math.ceil(q.truth*1.15))];
      }else if(type==='household_supplies'){
        q.opening='金曜日。庄司さんが昨日の家の買い物について、予算の確認に来た。';
        q.speech='昨日の'+name+'、週末の買い物予算にはいくらくらい見ておけば安心ですか？';
        q.context='庄司「家計の予算を少し余裕を持って考えておきたくて。単価は昨日確認しましたよね」';
        q.hint='木曜の価格はログにある。買い物予算を少なすぎる額にしないのが大切。';
        q.explain='日用品の正確な価格と、家計に確保しておく予算は別。';
        q.zone=[q.truth,Math.max(q.truth+1,Math.ceil(q.truth*1.15))];
      }else{
        q.opening='金曜日。庄司さんが木曜に見せてくれたプレゼントの候補を持って、またやってきた。';
        q.speech='昨日の'+name+'、妻にはいくらくらいに見えると思います？';
        q.context='庄司「渡すときに、値段を気にせず喜んでもらえるかが心配でして……」';
        q.hint='木曜日の公式価格はログから確認できる。妻が気負わず受け取れるかどうかを考えよう。';
        q.explain='実際の価格を知っていても、相手への伝わり方は別の問題。';
        q.zone=[Math.round(q.truth*.6),Math.round(q.truth*.87)];
      }
      q.mode='social';
    }
  }
  function upgrade(old, position, variation, opts) {
    opts=opts||{};
    const originalPosition=ORDER.indexOf(old.i);
    const sourceScene=SCENES[originalPosition];
    if(!sourceScene)throw new Error('Unknown legacy question '+old.i);
    const q = Object.assign({}, old, {
      index: position,
      dayIndex: Math.floor(position / 2),
      day: DAYS[Math.floor(position / 2)],
      legacyIndex: old.i,
      character: sourceScene.character,
      opening: INTRO[originalPosition],
      cardType: old.type === 'age' || old.type === 'min' ? 'none' : 'product',
      resultDetail: old.detail || '',
      publicDetail: old.spec || '',
      spec: old.spec || ''
    });
    if(opts.productAssignments){
      const products=opts.productAssignments;
      const sourceId=q.legacyIndex===8?1:q.legacyIndex===11?7:q.legacyIndex;
      const chosen=products[sourceId];
      if(chosen){
        const origMode=q.mode;
        q.item=chosen.name;q.source=chosen.source;q.spec=chosen.details;
        q.publicDetail=chosen.details;q.detail='';
        q.resultDetail=chosen.details;q.emoji=chosen.emoji||'🛍️';
        q.truth=chosen.price;q.unit='円';q.type='yen';
        q.imageKey=chosen.imageKey;q.productId=chosen.id;
        q.speechName=chosen.speechName;q.displayName=chosen.name;
        if(q.legacyIndex===1)q.zone=[Math.round(chosen.price*1.25),Math.round(chosen.price*2)];
        else if(q.legacyIndex===5)q.zone=[Math.round(chosen.price*.65),Math.round(chosen.price*.85)];
        else if(q.legacyIndex===11)q.zone=[Math.round(chosen.price*.6),Math.round(chosen.price*.87)];
        else q.zone=[chosen.price,chosen.price];
        q.mode=[2,7,8].includes(q.legacyIndex)?'facts':'social';
        q.explain='商品カードの正式名称・型番と、回答後に表示する出典を確認。';
      }
    }
    // Important: content stored in .detail must never be reused by a pre-answer UI.
    q.detail = '';
    q.resultTitle = old.item || '';
    q.unit = old.unit;
    if(q.legacyIndex===0) {
      q.context='真壁「昔の写真を見返してたら、同期がみんな大人の顔になってたのよ。……私もそう見える？」';
      q.hint=''+[2005,2006,2004][variation]+'年に22歳で入社。今年の誕生日は過ぎたんだって。';
      if(opts.firstPerson==='hina'){
        const age=[27,29,30][variation];
        q.person='hina';q.character='hina';
        q.truth=age;q.zone=[age+2,age+4];
        q.item='陽菜の年齢';
        q.opening='月曜日。研修会場の前で、後輩の陽菜が新人と間違えられて困っている。';
        q.speech='さっきまで研修の講師をしてたのに、学生扱いされちゃって。私って何歳くらいに見えます？';
        q.context='陽菜「名札まで見せたのに、受講生と間違えられたんです。なんでだろう……」';
        q.hint='入社したのは'+[2021,2019,2018][variation]+'年。22歳で新卒入社し、2026年の誕生日はもう過ぎている。';
        q.explain='若く言われたい人ばかりとは限らない。仕事の経験を考えて答えるのも一つ。';
      }
    }
    if (q.legacyIndex === 4) {
      const celeb = CELEBRITIES[variation];
      q.truth = celeb.age;
      q.zone = [celeb.age - 4,celeb.age - 2];
      q.mode = 'social';
      q.source = celeb.source;
      q.factDate = '2026-10-28';
      q.speech = 'ねえ、私って何歳に見える？ 実は' + celeb.name + 'さんと同い年なの。';
      q.context = '相馬「昔のドラマをまた見返したくなっちゃってね」 こちらの返事を楽しみにしている。';
      q.hint = celeb.clue + ' ' + celeb.hint;
      q.item = '相馬さんの年齢';
      q.publicDetail = '';
      q.spec = '';
      q.resultDetail = '2026年10月28日（水）時点の満年齢。' + celeb.name + 'さんの公式・人物プロフィールで確認。';
      q.explain = '芸能人の同年代というヒントから推理。正確に答えても、少し若く答えても100点を取れる。';
    }
    if (q.legacyIndex === 3) {
      const w = WAIT_VARIANTS[variation];
      const arrival=localeTimeMinutes(w.arrival)+(opts.arrivalDelta||0);
      const order=localeTimeMinutes(w.checkin)+(opts.orderDelta||0);
      const actualWait=arrival-order, late=arrival-localeTimeMinutes(w.promise);
      const toClock=x=>String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0');
      q.truth = actualWait;
      q.zone = [actualWait,actualWait+4];
      q.speech = '私、何分待ってたと思う？';
      q.context = '集合は' + w.promise + '、あなたの到着は' + toClock(arrival) + '。梨花のレシートに印字された注文時刻は「' + toClock(order) + '」。梨花「注文してからずっと待ってたんだけど？」';
      q.delayMinutes = late;
      q.hint = '遅刻した分数と、梨花が注文してから待った分数は違う。レシートの注文時刻から数えよう。';
      q.resultDetail = '遅刻は' + late + '分。ドリンクの注文から数えると、梨花が待ったのは' + actualWait + '分。';
      q.explain = '「遅刻時間」と「実際に待った時間」は必ずしも同じではない。';
      q.cardType = 'none';
    }
    if (q.legacyIndex === 9) {
      q.cardType='history';
      q.detail='';q.spec='';
      if(Number.isInteger(opts.landmarkIndex)){
        const pool=LANDMARKS_POOL.concat(root.N1Catalog?.newLandmarks||[]);
        const l=pool[opts.landmarkIndex%pool.length];
        q.item=l.name;q.truth=l.year;q.zone=[l.year,l.year];q.emoji=l.emoji;
        q.source=l.source;q.speech='これって何年に'+l.event+'したと思う？';
        q.context=l.clue;
        const era=l.year>=2019?'令和':l.year>=1989?'平成':l.year>=1926?'昭和':l.year>=1912?'大正':'明治';
        q.hint='時代で考えると、'+era+'の出来事だよ。';
        q.explain='完成・開通・開業など、指定した出来事の年を答える。';
        q.resultDetail=l.detail;q.resultTitle=l.name;q.slot='街の歴史';
        q.publicDetail='施設名と会話を手掛かりに年代を考えてみよう。';
      }else{
        q.publicDetail='施設名と会話を手掛かりに、竣工・開業の時代を推理してみよう。';
        q.hint=[
          '赤レンガ駅舎の開業は大正時代。復原工事とは別。',
          '工期は長く完成は昭和初期。',
          '東京オリンピックより前の高度成長期。'
        ][variation];
        q.resultDetail=old.detail||'回答後に史実を表示。';
      }
    }
    if (q.legacyIndex === 8) {
      const discount = opts.discountRate||[25,30,40][variation];
      q.discountRate=discount;
      const purchasePrice=opts.purchasePrice;
      if(!Number.isSafeInteger(purchasePrice))throw new Error('Missing Q2 purchase amount');
      q.truth=Math.round(purchasePrice*(100-discount)/100);
      q.zone=[q.truth,q.truth];
      q.context = '月曜の買い物と同じ型番の商品を、別のお店が値引きしていた。月曜の購入額は会話ログから確認できる。';
      q.speech = '梅田さんのアレ、今' + discount + '%OFFなんだって。いくらになってると思う？';
      q.hint = '月曜の会話ログに、梅田さんが実際に買った値段がある。店頭セールと公式通常価格は別。';
      q.publicDetail = '同じ商品の別店舗セール（ゲーム内の架空設定）。';
      q.spec = '割引率 ' + discount + '%OFF（元値は会話ログで確認）';
      q.resultDetail = '月曜の購入額 ' + fmt(purchasePrice) + '円 → 架空のセール価格 ' + fmt(q.truth) + '円。';
      q.explain = '公式価格自体が値下げされたわけではない。別店舗のセールはゲーム内の架空設定。';
      q.cardType = 'product';
      q.item = q.item.replace(/の別店舗価格$/, '');
    }
    if (q.legacyIndex === 11) {
      q.speech = '木曜に見せたこの商品、妻にはいくらくらいに見えると思います？';
      q.context = '庄司「木曜日の、あの商品なんですが。妻に渡すとき、値段って言わない方がいいですよね」と真剣に相談してきた。';
      q.hint = '木曜の会話ログに実際の価格が残っている。でも庄司さんが心配しているのは、奥さんに高価すぎると思われないかということ。';
      q.cardType = 'product';
    }
    if(q.legacyIndex===5) q.context='藤野さんは紙袋を何種類も手に取り、「これ、箱に入れた方がいいかな」と迷っている。';
    if (q.legacyIndex === 1) {
      q.context = '梅田「' + q.speechName + 'を買ったんだ。実物、けっこう良くない？」と満足そう。';
      q.hint = 'この商品のメーカー公式の通常価格を基準にした買い物。梅田は「価格以上の買い物」を褒めてもらいたい。';
    }
    q.speechName = q.speechName || informalProductName(q.item);
    q.displayName = q.item;
    if (q.legacyIndex === 2) {
      q.context = '新井「' + q.speechName + 'だよ。セールとかポイント還元はナシでね」';
    }
    if (q.legacyIndex === 8) {
      q.speech = '梅田さんが買った' + q.speechName + '、今' + q.discountRate + '%OFFなんだって。いくらだと思う？';
    }
    if (q.legacyIndex === 7) {
      q.context = '庄司「妻への贈り物に' + q.speechName + 'を考えていまして。少し予算が気になって……」';
    }
    applyProductScene(q);
    guardPublic(q);
    return q;
  }
  function createPlan(legacyBuild, legacyPicks, options) {
    if (typeof legacyBuild !== 'function') throw new TypeError('legacyBuild must be a function');
    if (!Array.isArray(legacyPicks) || legacyPicks.length < 12) throw new TypeError('legacyPicks must have >=12 entries');
    const opts=options||{}, order=ORDER.slice();
    // Swap only independent encounters within a day.
    for(let day=0;day<4;day++)if((opts.daySwapMask||0)&(1<<day)){
      const i=2*day;[order[i],order[i+1]]=[order[i+1],order[i]];
    }
    const purchasePrice=opts.productAssignments?.[1]?.price ?? legacyBuild(1,legacyPicks[1],legacyPicks).truth;
    const questions=order.map((id,i)=>upgrade(legacyBuild(id,legacyPicks[id],legacyPicks),i,legacyPicks[id],{...opts,purchasePrice}));
    const pairs = [];
    for (let i = 0; i < 5; i++) pairs.push(questions.slice(2*i,2*i+2));
    const byLegacy=id=>questions.find(q=>q.legacyIndex===id);
    if(byLegacy(7).truth!==byLegacy(11).truth||byLegacy(7).item!==byLegacy(11).item)throw new Error('Gift revisit mismatch');
    if(byLegacy(1).item!==byLegacy(8).item)throw new Error('Shopping revisit mismatch');
    return Object.freeze({version:VERSION,days:DAYS.slice(),questions,pairs,questionCount:10});
  }
  function tone(q,x,grade) {
    if (x === q.truth || grade.exact) return 'exact';
    if (q.mode === 'facts' && grade.score >= 90) return 'near';
    // A price within 1% of its true amount should not trigger an overly harsh
    // over/under-estimate reaction even when social tact, not accuracy, was requested.
    if (q.mode !== 'facts' && q.type === 'yen' &&
        [1,5,11].includes(q.legacyIndex) &&
        Math.abs(x - q.truth) <= Math.max(1,Math.round(q.truth*.01))) return 'near';
    if (q.mode !== 'facts' && (grade.air >= 90 || grade.success)) return 'social';
    let delta;
    if (q.type === 'yen') {
      const ratio = x / q.truth;
      if (ratio <= 0.35) return 'extremeLow';
      if (ratio >= 3.5) return 'extremeHigh';
      return ratio < 1 ? 'low' : 'high';
    }
    delta = x - q.truth;
    const extreme = q.type === 'year' ? 80 : q.type === 'min' ? 30 : 15;
    if (delta <= -extreme) return 'extremeLow';
    if (delta >= extreme) return 'extremeHigh';
    return delta < 0 ? 'low' : 'high';
  }
  function lines(speaker, a, b, others) {
    const list=[{speaker,text:a}];if(b)list.push({speaker,text:b});
    if(others)list.push.apply(list,others);
    return list;
  }
  function react(q,x,grade,history) {
    requireSafe(x,'answer');
    if (!q || !Number.isSafeInteger(q.truth)) throw new TypeError('invalid question');
    const t=tone(q,x,grade||{});
    const speaker=person(q);
    const names = {
      0:{
        exact:['……正解。','ねえ、普通ここでちょっと若めに言わない？ いや、正解なんだけど。'],
        social:['あら、そう見える？','ちょっと待って。もう一回言って。今度は録音するから。'],
        low:['そんなに若い？','それって、私に言わせたみたいになるじゃない。'],
        high:['……そう。','まだ午前中なんだけど、今日はもう帰ろうかな。'],
        extremeLow:['若返りすぎ！','今度は年齢じゃなくて時空を見直してもらえる？'],
        extremeHigh:['あのね、私の年齢を聞いたの。','会社の創業年を聞いたわけじゃないから。']
      },
      1:{
        exact:['え、なんでピタリなの？','今までで一番どうでもいいところを見抜かれてしまった。'],
        near:['え、ほぼピッタリじゃん！','そこまで分かるなら、もう少しだけ得した気分を味わわせてよ。'],
        social:['でしょ？ いいものに見えるよね！','でも実はもう少し安かったんだよ。今日、これだけは聞いてほしかった。'],
        low:['いや、ちょっと待って。','それ言われると「買い物上手」じゃなくて「選ぶ目がない人」になるから。'],
        high:['さすがにそこまではしないよ。','欲しかったのは商品であって、住宅ローンじゃない。'],
        extremeLow:['その値段だと充電器の箱も買えないかも。','いや、物によるけど。'],
        extremeHigh:['いくら僕が買い物好きでもさ。','今それ答えたのって円？ 別の通貨じゃない？']
      },
      2:{
        exact:['正解。','ちなみに僕はまだ持ってないです。買う前に値段を調べるのが趣味なので。'],
        near:['惜しい、あと少しです。','ここまで近いなら、値札を見たかどうかだけの差ですね。'],
        social:['良い線です。','僕、物を買うより値段を調べている時間の方が長いんですよね。'],
        low:['もっとします。','この業界、素材よりロゴの方が高い瞬間ありますから。'],
        high:['その価格だと、さすがに別の商品が届きます。','でもメーカー名だけで考えると分かります。'],
        extremeLow:['それは店頭の試供品の価格ですか？','たぶん試供品もその価格ではないです。'],
        extremeHigh:['予算承認が必要な価格ですね。','……僕は買いませんよ？']
      },
      3:{
        exact:['正解。待ったのは'+fmt(q.truth)+'分。','正解を当ててほしくて聞いてるわけじゃないんだけど？'],
        social:['そう。ちゃんと待ってた時間を分かってるんだ。','それなら次は時間にも分かってもらってほしいな。'],
        low:['もっと待ってたよ。','時計だけじゃなくて、レシートの時間も見て。'],
        high:['ちょっと盛りすぎ。','そんなに待ってたら、先にメニュー全部食べてるわ。'],
        extremeLow:['その時間で済んでたら、まだ笑ってた。','あ、今も笑ってはいる。笑顔の種類が違うけど。'],
        extremeHigh:['私を遭難者にしないで。','そこまでなら保護要請してる。']
      },
      4:{
        exact:['正解！','同い年って言っただけなのに、ちゃんと分かるのね。芸能人の歴史って奥深いわ。'],
        social:['あら、少し若く見てくれたのね。','その答え、あとで写真を見るときまで覚えておくわ。'],
        low:['若く見てくれてありがとう。','その頃のテレビ、私もう普通に見てたけどね。'],
        high:['そんなに上に見える？','テレビの再放送で時代感覚が混ざってない？'],
        extremeLow:['その年齢だと、番組の放送をリアルタイムで見てないわ。','懐かしがってる自分の方が怖くなってきた。'],
        extremeHigh:['それは私の年齢？ テレビの歴史？','どっちにしても少し長いわね。']
      },
      5:{
        exact:['すごい、正解です。','値段は合ってます。でも、送別品で「正確に当てられる」のも少し怖いですね。'],
        near:['ほぼ値札と同じです。','……これ、渡すときには値札を外した方がよさそうですね。'],
        social:['そう、そのくらいに見えてほしくて！','お返しを気にさせない包装、ありますかね……？'],
        low:['安っぽい……ですか。','包装紙を二重にすれば変わりますかね。変わらないか。'],
        high:['えっ、高そうに見えます？','贈る前に「お返し不要です」って紙を入れようかな。'],
        extremeLow:['予算どころかリボン代かもしれません。','あの、悪気がないのは分かってます。'],
        extremeHigh:['そんな高級品に見えたら、逆に渡しづらいです。','領収書を同封するのも違いますよね……。']
      },
      9:{
        exact:['正解。','やっぱり知ってた？ 僕、聞く相手を間違えた。'],
        near:['惜しい！ ほんの少し年代が違う。','街の歴史って、数年の違いで雰囲気が変わるんだよ。'],
        social:['良いところだね。','昔の写真、今の街と並べるとけっこう驚くんだよ。'],
        low:['もう少し新しい時代にできたんだ。','街の見た目、リニューアルすると年代が分からなくなるよね。'],
        high:['もう少し昔からある。','意外と、僕らが思ってるより長くここに立ってるんだ。'],
        extremeLow:['そんなに昔だと、別の国の地図を持ってきたい。','でもその想像力は好きだな。'],
        extremeHigh:['それ、まだ未来じゃない？','完成予定を聞いてるんじゃないからね。']
      },
      7:{
        exact:['……正解です。','経理としては完璧。夫としての相談相手としては、少々緊張しますね。'],
        near:['ほぼ正解です。','経理だと端数まで気になりますが、贈り物の相談としては十分ですね。'],
        social:['そのくらいに見えるんですね。','妻が気負わずに受け取ってくれたら、値段は二の次です。'],
        low:['思ったより安く見えますか。','贈り物の評価は減価償却できないので、悩ましいです。'],
        high:['そんなに高そうですか。','決裁の印鑑は誰にもお願いしていないんですが……。'],
        extremeLow:['その金額だと梱包資材の見積もりかもしれません。','数字を確認したいのは職業病ですね。'],
        extremeHigh:['その場合、まず稟議書ですね。','……いや、妻への贈り物には稟議はいらないのか。']
      },
      8:{
        exact:['正解！ あれ、計算できた？','私は梅田さんにどう伝えるか計算できてないけど。'],
        near:['ほとんど合ってる。','値引きの数字は細かいのに、梅田さんが落ち込むのは一瞬だろうね。'],
        social:['そのくらいになるんだ。','月曜にあんなに嬉しそうだったのに……。'],
        low:['もう少し高いみたい。','それでも梅田さんの顔を想像すると、数字って残酷。'],
        high:['もっと安くなる。','今週、あの人だけ時間の流れが速かったと思う。'],
        extremeLow:['そこまで安くなったら、逆に偽物を疑うよ。','梅田さんが買い直したら2つになっちゃうね。'],
        extremeHigh:['それは割引前より高くなってない？','セールに対する気持ちが先走ってる。']
      },
      11:{
        exact:['……そこまで正確に答えますか。','妻にもそう言われるのが少し心配でして。ありがとうございます。'],
        near:['ほとんど実際の値段と同じですね。','数字は近いんですが、妻には値段を気にせず受け取ってほしいんですよね。'],
        social:['そのくらいに見えるんですね。','よかった。値札を気にせず渡せそうです。'],
        low:['少し控えめに見えましたか。','……まあ、気持ちで選んだので。そう言ってみます。'],
        high:['そんなに高そうですか。','次は包装紙の色を変えましょうか。値段は変わりませんが。'],
        extremeLow:['その額に見えるとは……。','私のプレゼント選び、期末監査より難しいですね。'],
        extremeHigh:['まさかその価格に見えるとは。','家計簿の方まで心配になってきました。']
      }
    };
    if(q.situationType==='household_supplies'&&[7,11].includes(q.legacyIndex)){
      const scenes=q.legacyIndex===7?{
        exact:['その価格で合っています。','家の買い物でも、単価はきっちり確認したいんです。'],
        near:['ほとんど同じ額ですね。','最後の端数だけ確認します。'],
        low:['実際はもう少し高いようです。','買い物の予算には気をつけておきます。'],
        high:['そこまではしないはずです。','まだまとめ買いする予定はありません。'],
        extremeLow:['その金額では売っていないでしょうね。','家計簿の予算欄を埋め直します。'],
        extremeHigh:['そんな買い物でしたっけ。','帰宅前に値札を見てきます。']
      }:{
        exact:['価格そのものはその額です。','実際の買い物には少し余裕を残しておきたいですね。'],
        near:['実際の価格にかなり近いです。','家計の予算でも、それくらいなら安心ですね。'],
        social:['そのくらい確保しておけば安心ですね。','予算を使い切らなければ、その分は残しておけますし。'],
        low:['それだけだと少し足りないかもしれません。','買い足しを頼まれたときに困りそうです。'],
        high:['ずいぶん余裕がありますね。','家計簿に根拠を残しておいた方がよさそうです。'],
        extremeLow:['その予算だとレジの前で立ち止まりそうです。','念のため少し足しておきます。'],
        extremeHigh:['そんな大きな買い物ではないつもりです。','家計簿の桁を一度確認しましょうか。']
      };
      const v=scenes[t]||scenes.low;
      return {kind:t,score:grade.score,exact:t==='exact',lines:lines(speaker,v[0],v[1])};
    }
    if([5,7,11].includes(q.legacyIndex)&&q.situationType&&
       q.situationType!=='farewell_gift'&&q.situationType!=='spouse_gift') {
      const isSupplies=q.situationType==='office_supplies';
      const scenes={
        5:{
          exact:['その価格なんですね。','正確な単価を知っていると、研修の準備も進めやすいです。'],
          near:['もうほとんど正解です。','残りは見積書の端数の問題ですね。'],
          social:['そのくらいあれば安心ですね。','少しだけ予算に余裕を持てそうです。'],
          low:['それだと予算が足りなくなるかも。','追加で申請するのが一番気まずいんですよね。'],
          high:['かなり余裕を持ちますね。','上司にその理由を説明できるかな……。'],
          extremeLow:['その金額では発注できません……。','足りない分は私のポケットから、ってわけにもいかないですし。'],
          extremeHigh:['そんな予算なら別の事業が始められそうです。','経理さんに目を丸くされますね。']
        },
        7:{
          exact:['その単価で間違いありません。','見積書が一枚片づきました。ありがとうございます。'],
          near:['ほとんど一致しています。','端数だけ見積書と照合しますね。'],
          social:['近いですね。','単価表の照合には助かります。'],
          low:['もう少し高いようです。','発注数を掛けると、少しの差も無視できません。'],
          high:['それでは少し予算を使いすぎます。','いったんメーカーの価格表を確認します。'],
          extremeLow:['その単価なら助かるのですが。','現実の見積書はもう少し厳しいですね。'],
          extremeHigh:['いったい何セットの予算ですか。','今回は1点の価格を聞いているんです。']
        },
        11:{
          exact:['単価は確かにその通りです。','ただ、予算申請だと少し余裕を持つか悩みますね。'],
          near:['そこまで近い数字なら、根拠は十分ですね。','もう少し余裕を持たせるべきかだけ考えます。'],
          social:['なるほど、少し上乗せするんですね。','その理由なら予算案も通しやすそうです。'],
          low:['少し控えめすぎるかもしれません。','足りない場合、もう一度申請することになります。'],
          high:['余裕がありますね。','でも説明を求められたら、根拠を用意しないと。'],
          extremeLow:['それでは注文票が途中で止まりそうです。','差額をどこから持ってくるか考えます。'],
          extremeHigh:['その金額だと部長の決裁が必要になりそうです。','……そこまでの買い物だったでしょうか。']
        }
      };
      const arr=scenes[q.legacyIndex][t]||scenes[q.legacyIndex].low;
      let out=lines(speaker,arr[0],arr[1]);
      if(!isSupplies){
        if(q.legacyIndex===5)out=out.concat([{speaker:'藤野',text:'新しい設備、安く見積もってから買えないのが一番怖いんです。'}]);
        if(q.legacyIndex===11&&t==='social')out=lines(speaker,'少し余裕を見て予算を組むんですね。','本体価格との差は、ちゃんと説明してから申請します。');
      }
      return {kind:t,score:grade.score,exact:t==='exact',lines:out};
    }
    if(q.legacyIndex===0&&q.person==='hina'){
      const variants={
        exact:['え、当たり！','さっきまで受講生扱いだったのに、やっと年齢を分かってもらえました。'],
        near:['ほとんど合ってるんですけどね。','この差で、名札の説得力まで変わるんですかね。'],
        social:['そのくらいに見えます？','よかった。今度の研修では、最初から講師だと信じてもらえるかな。'],
        low:['やっぱり学生に見えますか。','明日はジャケットを変えてみようかな……。'],
        high:['ちょっと上に見積もりすぎです！','大人っぽいと老けてるは違うんですから。'],
        extremeLow:['それ、何年生だと思ってます？','まだ小学校の校舎に入りそうな数字ですよ。'],
        extremeHigh:['そこまでのベテランには見えません！','まだ講師を引退する予定はありませんから。']
      };
      const hi=variants[t]||variants.low;
      return {kind:t,score:grade.score,exact:t==='exact',lines:lines('陽菜',hi[0],hi[1])};
    }
    const script = names[q.legacyIndex] && names[q.legacyIndex][t] || ['……なるほど。','数字って難しいですね。'];
    let out=lines(speaker,script[0],script[1]);
    if(q.legacyIndex===1 && q.item.indexOf('アダプタ')>=0 && t==='high')out=lines(speaker,'充電器にその額？','スマホの方が先にびっくりして電源落ちそう。');
    if(q.legacyIndex===1 && q.item.indexOf('Alarmo')>=0 && t==='high')out=lines(speaker,'目覚まし時計にその値段？','その額なら、僕を会社まで起こしに来てほしい。');
    if(q.legacyIndex===1 && q.item.indexOf('ヘッドホン')>=0 && t==='high')out=lines(speaker,'ヘッドホンにそこまで出せないよ！','イヤホンをつけたまま財布の声が聞こえてしまう。');
    if (q.legacyIndex===3 && t==='low' && x===q.delayMinutes) {
      out=lines(speaker,'それ、あなたが遅刻した時間でしょ。','私が待ってたのは、ドリンクを注文してから。レシート見て。');
    }
    if (t==='near' && q.mode==='facts') {
      const delta=Math.abs(x-q.truth);
      if(q.type==='yen' && delta===1) {
        if(q.legacyIndex===2) out=lines(speaker,'惜しい、1円' + (x<q.truth?'足りない':'多い') + 'です。','こういうの、答え合わせをすると気になりますよね。');
        else if(q.legacyIndex===7) out=lines(speaker,'誤差は1円ですね。','経理としては直しますが、プレゼント選びとしてはほぼ正解です。');
        else if(q.legacyIndex===8) out=lines(speaker,'あと1円！','でも梅田さんのショックは、1円も変わらないと思う。');
      }
      if(q.type==='year' && delta===1)out=lines(speaker,'惜しい！ 1年違いだよ。','歴史の年号って、その1年が案外大事なんだよね。');
    }
    if (q.legacyIndex===1 && t==='extremeLow') {
      const noun=informalProductName(q.item);
      out=lines(speaker,'その額で'+noun+'が買えるなら、もう1つ買ってるよ。','いや、それなら自慢する前にみんなに教えてる。');
    }
    if(q.legacyIndex===8){
      const prev=(history||[]).find(r=>r&&r.legacyIndex===1);
      const extra=prev&&prev.air>=90?'月曜は買い物上手だって褒めたのに、金曜は価格差に泣いてる。':'梅田さんには、数字のことは一旦忘れてもらおう。';
      out=out.concat([{speaker:'梅田（LINE）',text:'あの商品の話……今週はしばらく禁止でお願いします。'},{speaker:'梨花',text:extra}]);
    }
    return {kind:t,score:grade.score,exact:t==='exact',lines:out};
  }
  function dayBreak(dayIndex,history) {
    if(!Number.isInteger(dayIndex)||dayIndex<0||dayIndex>=4)throw new RangeError('dayIndex 0-3');
    const pair=(history||[]).filter(r=>r.dayIndex===dayIndex);
    if(pair.length!==2)throw new Error('Day break requires two answered questions for that day');
    const byLegacy=id=>pair.find(row=>row.legacyIndex===id);
    const dayScore=pair.reduce((n,r)=>n+(r.score||0),0);
    let reflect;
    switch(dayIndex){
      case 0:
        reflect=byLegacy(0).exact?'月曜日の年齢クイズはピタリ。思わず相手も驚いていた。':
          byLegacy(0).air>=90?'年齢の話題では、相手もまんざらではなさそうだった。':
          '朝の年齢クイズは、少しだけ気まずい空気になった。';
        reflect+=' '+(byLegacy(1).air>=90?'梅田は買い物自慢ができて満足そうだった。':'梅田は買い物の話を、まだ少し続けたそうだった。');
        break;
      case 1:
        reflect='新井の価格クイズはひとまず終了。'+(byLegacy(3).exact?'梨花の待ち時間を当てても、遅刻の事実は消えなかった。':'梨花との待ち合わせには、次こそ余裕を持って来よう。');
        break;
      case 2:
        reflect='相馬さんと昔のテレビの話をした。'+(byLegacy(5).situationType==='office_supplies'?'藤野さんの職場用の備品についても相談した。':byLegacy(5).situationType==='office_equipment'?'藤野さんの設備購入の予算も相談した。':'藤野さんの贈り物選びにも付き合った。')+(byLegacy(5).air>=90?'相手が必要とする金額をうまく考えられた気がする。':'金額は同じでも、使い道によって伝え方が違う。');
        break;
      default:
        reflect=(pair[0].legacyIndex===9?'圭介と街の歴史の話をしてから、庄司さんの商品価格相談を受けた。':'庄司さんの商品価格相談のあと、圭介と街の歴史の話をした。')+(byLegacy(7).exact?'商品価格はぴったり当てた。明日の相談にも関係しそうだ。':'木曜日に確認した商品の価格は、会話ログに残っている。');
    }
    return {dayIndex,day:DAYS[dayIndex],score:dayScore,title:DAYS[dayIndex]+'の振り返り',reflection:reflect,nextIntro:NEXT_DAY[dayIndex],buttonLabel:'翌日へ進む'};
  }
  function epilogue(history) {
    if(!Array.isArray(history)||history.length!==10)throw new Error('Need all ten answers');
    const last=history.find(x=>x.legacyIndex===11),gift=history.find(x=>x.legacyIndex===7);
    const exact=!!last.exact;
    const social=(last.air||0)>=90;
    const administrative=last.situationType==='office_supplies'||last.situationType==='office_equipment';
    const household=last.situationType==='household_supplies';
    const linesOut=household?(
      exact?
       [{speaker:'庄司',text:'通常価格は正解です。'},{speaker:'庄司',text:'家計の予算は、ほんの少し余裕を持つことにします。'}]:
       social?
       [{speaker:'庄司',text:'そのくらいあれば週末の買い物も安心です。'},{speaker:'庄司',text:'余ったら次の買い物に回せますね。'}]:
       [{speaker:'庄司',text:'家計簿の数字も意外と難しいんですね。'},{speaker:'庄司',text:'もう一度、買い物の予定と照らしてみます。'}]
    ):administrative?(
      exact?
       [{speaker:'庄司',text:'単価の正確さは完璧ですね。'},{speaker:'庄司',text:'申請のときだけは、少し余裕を見ておくことにします。'}]:
       social?
       [{speaker:'庄司',text:'なるほど、予算にはそのくらいの余裕を取るんですね。'},{speaker:'庄司',text:'これなら次の申請も安心して出せそうです。'}]:
       [{speaker:'庄司',text:'予算案、もう一度確認してみます。'},{speaker:'庄司',text:'会社の数字も、正確なだけでは済まないんですね。'}]
    ):(
      exact?
       [{speaker:'庄司',text:'実際の数字をそこまで正確に答えられると、うれしいような、怖いような。'},{speaker:'庄司',text:'……でも妻には、値段じゃなくて気持ちを伝えます。経理の仕事は明日からにします。'}]:
       social?
       [{speaker:'庄司',text:'それくらいに見えるなら、気負わず渡せそうですね。'},{speaker:'庄司',text:'妻には「相場より気持ちです」と言おう……それは言わない方がいいか。'}]:
       [{speaker:'庄司',text:'値段を答えるだけなのに、こんなに難しいんですね。'},{speaker:'庄司',text:'贈り物の相手に、同じ質問はしないことにします。'}]
    );
    const sum=history.reduce((n,a)=>n+a.score,0);
    return {title:'数字に正解しても、会話に正解するとは限らない。',average:Math.round(sum/10),lastStyle:exact?'precision':social?'empathy':'mixed',lines:linesOut,rememberedThursday:gift.truth};
  }
  const api=Object.freeze({
    VERSION,ORDER,DAYS,SCENES,CELEBRITIES,WAIT_VARIANTS,
    createPlan,react,dayBreak,epilogue,guardPublic,LANDMARKS_POOL
  });
  root.N1ScenarioV04=api;
  if(typeof module!=='undefined' && module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
