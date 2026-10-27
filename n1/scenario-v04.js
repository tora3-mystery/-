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
  const VERSION = '0.5.0';
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
    {name:'大久保佳代子',age:55,source:'https://www.p-jinriki.com/sp/talent/oasiz/',clue:'「めちゃイケ」に出演していた頃から知っている人には、だいたいの世代が分かると思うの。',hint:'1990年代にはオアシズとして活動を始めていて、2000年代にはOLと芸人の二足のわらじでも知られていた。'},
    {name:'仲間由紀恵',age:46,source:'https://ogipro.com/talent/nakama/',clue:'「TRICK」が始まった頃は、まだ随分若かったわよね。',hint:'「TRICK」の連続ドラマは2000年から、「ごくせん」は2002年から。どちらも若い頃の主演作。'},
    {name:'久本雅美',age:68,source:'https://www.talent-databank.co.jp/search/profile/2000041015',clue:'ずっとテレビで見てきたけど、昔は舞台が中心だったのよね。',hint:'1984年にWAHAHA本舗の設立に参加し、1990年代には「笑っていいとも！」でもおなじみだった。'}
  ]);
  const WAIT_VARIANTS = Object.freeze([
    {promise:'18:00',arrival:'18:21',checkin:'17:53',wait:28,delay:21},
    {promise:'18:00',arrival:'18:27',checkin:'17:55',wait:32,delay:27},
    {promise:'18:00',arrival:'18:34',checkin:'17:48',wait:46,delay:34}
  ]);
  const INTRO = Object.freeze([
    '出勤途中、会社の真壁先輩と偶然ばったり。立ち話の途中で、急に顔をじっと見られた。',
    'その日の昼。梅田が新しい買い物を見せながら、さっきから妙に得意げだ。',
    '火曜日の休憩時間。新井がスマホにメーカーの商品ページを開いてきた。',
    '約束の時間を過ぎてカフェに駆け込んだ。梨花はレシートを指でトントン叩いている。',
    '水曜日。久しぶりに相馬さんと会うと、昨日見返したテレビの話になった。',
    '同じ日の昼休み。藤野さんが送別会の贈り物を一緒に選んでほしいと言ってきた。',
    '木曜日、圭介と街歩き。見慣れた建物を指さして、急に歴史クイズが始まった。',
    '木曜の帰り際。経理の庄司さんが、少し照れながらプレゼントの相談を持ちかけてきた。',
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
  function upgrade(old, position, variation) {
    const q = Object.assign({}, old, {
      index: position,
      dayIndex: Math.floor(position / 2),
      day: DAYS[Math.floor(position / 2)],
      legacyIndex: SCENES[position].legacyIndex,
      character: SCENES[position].character,
      opening: INTRO[position],
      cardType: old.type === 'age' || old.type === 'min' ? 'none' : 'product',
      resultDetail: old.detail || '',
      publicDetail: old.spec || '',
      spec: old.spec || ''
    });
    // Important: content stored in .detail must never be reused by a pre-answer UI.
    q.detail = '';
    q.resultTitle = old.item || '';
    q.unit = old.unit;
    if (q.legacyIndex === 4) {
      const celeb = CELEBRITIES[variation];
      q.truth = celeb.age;
      q.zone = [celeb.age - 4,celeb.age - 2];
      q.mode = 'social';
      q.source = celeb.source;
      q.speech = 'ねえ、私って何歳に見える？ 実は' + celeb.name + 'さんと同い年なの。';
      q.context = '相馬「' + celeb.clue + '」 生年は教えずに、表情を見てこちらの答えを待っている。';
      q.hint = celeb.hint;
      q.item = '相馬さんの年齢';
      q.publicDetail = '';
      q.spec = '';
      q.resultDetail = '2026年10月28日（水）時点の満年齢。' + celeb.name + 'さんの公式・人物プロフィールで確認。';
      q.explain = '芸能人の同年代というヒントから推理。正確に答えても、少し若く答えても100点を取れる。';
    }
    if (q.legacyIndex === 3) {
      const w = WAIT_VARIANTS[variation];
      q.truth = w.wait;
      q.zone = [w.wait, w.wait + 4];
      q.speech = '私、何分待ってたと思う？';
      q.context = '集合は' + w.promise + '、あなたの到着は' + w.arrival + '。テーブルのレシートには「入店 ' + w.checkin + '」とある。';
      q.hint = '遅刻時間と、梨花が店に入ってから待った時間は違う。店に入った時刻から考えよう。';
      q.resultDetail = '遅刻は' + w.delay + '分、梨花が入店してからは' + w.wait + '分。';
      q.explain = '「遅刻時間」と「実際に待った時間」は必ずしも同じではない。';
      q.cardType = 'none';
    }
    if (q.legacyIndex === 9) {
      // Public history card: no answer year, no year-bearing official detail.
      q.cardType = 'history';
      q.publicDetail = '建物の名称と写真を見て、竣工・開業の時代を推理してみよう。';
      q.detail = '';
      q.spec = '';
      q.hint = [
        '赤レンガ駅舎の開業は大正時代。近年の復原工事の年ではない。',
        '着工は大正時代。工事期間は長く、完成は昭和初期。',
        '高度経済成長の入口に完成。東京オリンピックより前。'
      ][variation];
      q.resultDetail = old.detail || '回答後に史実の詳細を表示。';
      q.explain = '開業・竣工・復原を混同しないこと。年を答えた後で施設の公式説明を確認できる。';
    }
    if (q.legacyIndex === 8) {
      const discount = [25,30,40][variation];
      q.context = '同じ型番の商品を扱う架空の別店舗で、今週は' + discount + '%OFFの広告。値下がり前の値段は月曜の会話ログに残っている。';
      q.speech = '梅田さんのアレ、今' + discount + '%OFFなんだって。いくらになってると思う？';
      q.hint = '月曜の会話ログに、梅田さんが実際に買った値段がある。店頭セールと公式通常価格は別。';
      q.publicDetail = '今週の割引率：' + discount + '%OFF。キャンペーンは架空の設定。';
      q.spec = '割引率 ' + discount + '%OFF（元値は会話ログで確認）';
      q.resultDetail = '月曜の購入額 ' + fmt(old.truth / (1 - discount / 100)) + '円 → 架空のセール価格 ' + fmt(old.truth) + '円。';
      q.explain = '公式価格自体が値下げされたわけではない。別店舗のセールはゲーム内の架空設定。';
      q.cardType = 'product';
    }
    if (q.legacyIndex === 11) {
      q.speech = '木曜に見せたこの商品、妻にはいくらくらいに見えると思います？';
      q.context = '木曜に公式価格は教えてもらっている。庄司は「高すぎて気を遣わせるんじゃないか」と少し心配している。';
      q.hint = '木曜の会話ログに本当の価格が残っている。正確さでも空気読みでも100点が狙える。';
      q.cardType = 'product';
    }
    if (q.legacyIndex === 1) {
      q.context = '梅田「' + informalProductName(q.item) + 'を買ったんだ。実物、けっこう良くない？」と満足そう。';
      q.hint = 'この商品のメーカー公式の通常価格を基準にした買い物。梅田は「価格以上の買い物」を褒めてもらいたい。';
    }
    q.speechName = informalProductName(q.item);
    q.displayName = q.item;
    if (q.legacyIndex === 2) {
      q.context = '新井「' + q.speechName + 'だよ。普通のお店でいくらくらいだと思う？ セールは考えなくていいからね」';
    }
    if (q.legacyIndex === 8) {
      q.speech = '梅田さんが買った' + informalProductName(q.item) + '、今' + [25,30,40][variation] + '%OFFなんだって。いくらだと思う？';
    }
    if (q.legacyIndex === 7) {
      q.context = '庄司「妻への贈り物に' + q.speechName + 'を考えていまして。少し予算が気になって……」';
    }
    guardPublic(q);
    return q;
  }
  function createPlan(legacyBuild, legacyPicks) {
    if (typeof legacyBuild !== 'function') throw new TypeError('legacyBuild must be a function');
    if (!Array.isArray(legacyPicks) || legacyPicks.length < 12) throw new TypeError('legacyPicks must have >=12 entries');
    const questions = ORDER.map((id, i) => upgrade(legacyBuild(id,legacyPicks[id],legacyPicks),i,legacyPicks[id]));
    const pairs = [];
    for (let i = 0; i < 5; i++) pairs.push(questions.slice(2*i,2*i+2));
    if (questions[7].truth !== questions[9].truth) throw new Error('Thursday-Friday gift must retain the same official price');
    if (questions[1].item.replace(/の別店舗価格$/,'') !== questions[8].item.replace(/の別店舗価格$/,'')) throw new Error('Monday-Friday deal must be the same product');
    return Object.freeze({version:VERSION,days:DAYS.slice(),questions,pairs,questionCount:10});
  }
  function tone(q,x,grade) {
    if (x === q.truth || grade.exact) return 'exact';
    if (q.mode === 'facts' && grade.score >= 90) return 'near';
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
        low:['それ、あなたが遅れた時間でしょ。','私が待ったのは、店に入ったときから。レシート見て。'],
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
        social:['そう、そのくらいに見えてほしくて！','お返しを気にさせない包装、ありますかね……？'],
        low:['安っぽい……ですか。','包装紙を二重にすれば変わりますかね。変わらないか。'],
        high:['えっ、高そうに見えます？','贈る前に「お返し不要です」って紙を入れようかな。'],
        extremeLow:['予算どころかリボン代かもしれません。','あの、悪気がないのは分かってます。'],
        extremeHigh:['そんな高級品に見えたら、逆に渡しづらいです。','領収書を同封するのも違いますよね……。']
      },
      9:{
        exact:['正解。','やっぱり知ってた？ 僕、聞く相手を間違えた。'],
        near:['惜しい！ ほんの少し年代が違う。','歴史の写真を見比べると、その差が意外と大きいんだよ。'],
        social:['良いところだね。','昔の写真、今の街と並べるとけっこう驚くんだよ。'],
        low:['もう少し古いんだ。','街の見た目、リニューアルすると年代が分からなくなるよね。'],
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
        social:['そのくらいに見えるんですね。','よかった。値札を気にせず渡せそうです。'],
        low:['少し控えめに見えましたか。','……まあ、気持ちで選んだので。そう言ってみます。'],
        high:['そんなに高そうですか。','次は包装紙の色を変えましょうか。値段は変わりませんが。'],
        extremeLow:['その額に見えるとは……。','私のプレゼント選び、期末監査より難しいですね。'],
        extremeHigh:['まさかその価格に見えるとは。','家計簿の方まで心配になってきました。']
      }
    };
    const script = names[q.legacyIndex] && names[q.legacyIndex][t] || ['……なるほど。','数字って難しいですね。'];
    let out=lines(speaker,script[0],script[1]);
    if(q.legacyIndex===1 && q.item.indexOf('アダプタ')>=0 && t==='high')out=lines(speaker,'充電器にその額？','スマホの方が先にびっくりして電源落ちそう。');
    if(q.legacyIndex===1 && q.item.indexOf('Alarmo')>=0 && t==='high')out=lines(speaker,'目覚まし時計にその値段？','その額なら、僕を会社まで起こしに来てほしい。');
    if(q.legacyIndex===1 && q.item.indexOf('ヘッドホン')>=0 && t==='high')out=lines(speaker,'ヘッドホンにそこまで出せないよ！','イヤホンをつけたまま財布の声が聞こえてしまう。');
    if (t==='near' && q.mode==='facts') {
      const delta=Math.abs(x-q.truth);
      if(q.type==='yen' && delta<=1)out=lines(speaker,'あと1円！','この1円だけ、どこに置いてきたんですか？');
      if(q.type==='year' && delta===1)out=lines(speaker,'惜しい！ 1年違いだよ。','歴史の年号って、その1年が案外大事なんだよね。');
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
    const dayScore=pair.reduce((n,r)=>n+(r.score||0),0);
    let reflect;
    switch(dayIndex){
      case 0:
        reflect=pair[0].exact && pair[0].air<90?'真壁先輩の年齢は当てた。でも本人は少し複雑そうだった。':
          pair[0].air>=90?'真壁先輩との立ち話は妙にうまくいった。':
          '真壁先輩とは、朝からちょっとした温度差が生まれた。';
        reflect+=' '+(pair[1].air>=90?'梅田は満足げに自分の買い物を見せていた。':'梅田は自分の買い物について、まだ何か言いたそうだった。');
        break;
      case 1:
        reflect='新井の価格クイズはひとまず終了。'+(pair[1].exact?'梨花の待ち時間を当てても、遅刻の事実は消えなかった。':'梨花との待ち合わせには、次こそ余裕を持って来よう。');
        break;
      case 2:
        reflect='相馬さんと昔のテレビの話をして、藤野さんの贈り物にも付き合った。'+(pair[1].air>=90?'相手の気持ちを汲む方も、少し上達した気がする。':'相手が気にする金額は、自分の相場感と必ずしも一致しない。');
        break;
      default:
        reflect='圭介との街歩きのあと、庄司さんが珍しく贈り物の相談をしてきた。'+(pair[1].exact?'商品価格はぴったり当てた。覚えておくと何かあるかもしれない。':'木曜の贈り物の値段は、会話ログに残しておこう。');
    }
    return {dayIndex,day:DAYS[dayIndex],score:dayScore,title:DAYS[dayIndex]+'の振り返り',reflection:reflect,nextIntro:NEXT_DAY[dayIndex],buttonLabel:'翌日へ進む'};
  }
  function epilogue(history) {
    if(!Array.isArray(history)||history.length!==10)throw new Error('Need all ten answers');
    const last=history[9], gift=history[7];
    const exact=!!last.exact;
    const social=(last.air||0)>=90;
    const linesOut=exact?
      [{speaker:'庄司',text:'実際の数字をそこまで正確に答えられると、うれしいような、怖いような。'},{speaker:'庄司',text:'……でも妻には、値段じゃなくて気持ちを伝えます。経理の仕事は明日からにします。'}]:
      social?
      [{speaker:'庄司',text:'それくらいに見えるなら、気負わず渡せそうですね。'},{speaker:'庄司',text:'妻には「相場より気持ちです」と言おう……それは言わない方がいいか。'}]:
      [{speaker:'庄司',text:'値段を答えるだけなのに、こんなに難しいんですね。'},{speaker:'庄司',text:'贈り物の相手に、同じ質問はしないことにします。'}];
    const sum=history.reduce((n,a)=>n+a.score,0);
    return {title:'数字に正解しても、会話に正解するとは限らない。',average:Math.round(sum/10),lastStyle:exact?'precision':social?'empathy':'mixed',lines:linesOut,rememberedThursday:gift.truth};
  }
  const api=Object.freeze({
    VERSION,ORDER,DAYS,SCENES,CELEBRITIES,WAIT_VARIANTS,
    createPlan,react,dayBreak,epilogue,guardPublic
  });
  root.N1ScenarioV04=api;
  if(typeof module!=='undefined' && module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
