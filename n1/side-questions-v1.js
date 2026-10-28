/*
 * N1 source-backed incidental number pool v2.
 * Four story-critical questions and all retained legacy questions are separate.
 * Approved side categories: I12 (real population), I15 (fictional stock arithmetic),
 * P18-P23 (historical prices, rental benchmarks, product weight, film runtime,
 * structure height and official store counts).
 * Public values are pinned to the date/definition in each record.
 */
(function(root){
'use strict';
const SIDE_IDS=Object.freeze([0,2,3,4,5,9]);
const fixed=(id,theme,person,slot,opening,speech,context,truth,unit,scale,good,low,high,source=null,factDate=null,detail='')=>({
 id,theme,person,slot,opening,speech,context,truth,unit,scale,
 mode:'facts',zone:[truth,truth],min:0,max:Math.max(100,Math.ceil(truth*4)),
 good,low,high,source,factDate,detail,recap:slot+'の数字を予想した。',type:unit==='円'?'yen':'count'
});
const SOURCES=Object.freeze({
 population:'https://www.metro.tokyo.lg.jp/information/press/2026/09/2026093007',
 gba:'https://www.nintendo.co.jp/corporate/release/2004/040901.html',
 ds:'https://www.nintendo.co.jp/corporate/release/2004/040921a.html',
 dsl:'https://www.nintendo.co.jp/corporate/release/2006/060126.html',
 rent:'https://suumo.jp/chintai/tokyo/',
 ipad1:'https://support.apple.com/ja-jp/112438',
 ipad8:'https://support.apple.com/ja-jp/118451',
 ipad10:'https://support.apple.com/ja-jp/111840',
 totoro:'https://www.ghibli.jp/works/totoro/',
 chihiro:'https://www.ghibli.jp/works/chihiro/',
 mononoke:'https://www.ghibli.jp/works/mononoke/',
 tokyo:'https://www.tokyotower.co.jp/plan/towerpedia/',
 skytree:'https://www.tokyo-skytree.jp/about/outline/',
 harukas:'https://www.abenoharukas-300.jp/about/outline.html',
 muji:'https://www.ryohin-keikaku.jp/corporate/overview'
});
const CITY=[
 ['世田谷区',959130,'東京都の区で人口が最も多い住宅地'],
 ['練馬区',764060,'東京23区でも人口上位の住宅地'],
 ['八王子市',574003,'東京都の市では人口最多']
];
const HISTORIC=[
 ['ゲームボーイアドバンスSPの2004年9月15日までの税込希望小売価格',12500,SOURCES.gba,'2004-09-15'],
 ['初代ニンテンドーDSの2004年発売時の税込希望小売価格',15000,SOURCES.ds,'2004-12-02'],
 ['ニンテンドーDS Liteの2006年発売時の税込希望小売価格',16800,SOURCES.dsl,'2006-03-02']
];
const RENT=[
 ['荒川区','1K・1DK',87000],
 ['中野区','1LDK・2K・2DK',140000],
 ['新宿区','2LDK・3K・3DK',269000]
];
const WEIGHT=[
 ['初代iPad（Wi-Fiモデル）',680,SOURCES.ipad1],
 ['iPad（第8世代・Wi-Fiモデル）',490,SOURCES.ipad8],
 ['iPad（第10世代・Wi-Fiモデル）',477,SOURCES.ipad10]
];
const FILMS=[
 ['となりのトトロ',86,SOURCES.totoro],
 ['千と千尋の神隠し',125,SOURCES.chihiro],
 ['もののけ姫',133,SOURCES.mononoke]
];
const HEIGHT=[
 ['東京タワー',333,SOURCES.tokyo],
 ['東京スカイツリー',634,SOURCES.skytree],
 ['あべのハルカス',300,SOURCES.harukas]
];
const STORES=[
 ['国内の無印良品店舗（Café&Meal MUJI・IDÉEを除く）',683],
 ['国内の全店舗（無印良品・Café&Meal MUJI・IDÉEを含む）',717],
 ['国内外の全店舗（無印良品・Café&Meal MUJI・IDÉEを含む）',1474]
];
const FACTORIES=[
 // I12: published real population, approximate answers welcome
 (v)=>{
  const [town,truth,clue]=CITY[v];
  const width=Math.round(truth*.09);
  return {...fixed('I12-'+v,'I12','keisuke','実在する街の人口',
   '圭介と街歩きのパンフレットを開いた。',
   town+'って、住んでいる人は何人くらいだと思う？',
   clue+'。厳密な数字ではなく、大まかな人口を聞かれている。',
   truth,'人',Math.max(10000,Math.round(truth*.05)),
   'そのくらいの規模感だよね。','もう少し人口が多いはず。','そこまで大きくはないと思う。',
   SOURCES.population,'2026-09-01','東京都「東京都の人口（推計）」2026年9月1日時点の推計値。'),
   mode:'estimate',zone:[truth-width,truth+width],min:0,max:3000000,
   recap:'圭介と'+town+'の人口規模を予想した。'};
 },
 // I15: one explicitly fictional, in-world accounting example
 (v,extra)=>{
  const old=[42,75,63][v]+extra*2,arrival=[20,30,25][v]+extra*3,used=[17,28,19][v];
  const truth=old+arrival-used;
  return {...fixed('I15-'+v,'I15','fujino','在庫を確認',
   '藤野さんが職場の備品庫で記録を確認している。',
   'いま棚に残っている備品は、いくつ？',
   '朝の在庫'+old+'個、今日の納品'+arrival+'個、使用済み'+used+'個。ゲーム内の架空の備品庫。',
   truth,'個',5,'記録と合っています。','もう少し残っているはずです。','使った分を引き忘れていませんか。',
   null,null,'架空の備品庫。朝の在庫＋納品−使用。'),
   recap:'藤野さんと備品庫の在庫を数えた。'};
 },
 (v)=>{
  const [subject,truth,source,date]=HISTORIC[v];
  return {...fixed('P18-'+v,'P18','rika','昔の商品の価格',
   '梨花が古いゲーム機の広告を見つけた。',
   subject+'、何円だったか覚えてる？',
   '当時の税込メーカー希望小売価格を答える。現在の中古価格や物価換算ではない。',
   truth,'円',Math.round(truth*.14),
   '懐かしい。値段まで覚えてるんだ。','今よりもっと高く感じたかもね。','そこまで高くなかったと思う。',
   source,date,'任天堂の当時の公式報道資料に掲載された税込希望小売価格。')};
 },
 (v)=>{
  const [area,layout,truth]=RENT[v];
  return {...fixed('P19-'+v,'P19','souma','家賃相場',
   '相馬さんが賃貸サイトの相場表を見ている。',
   area+'の'+layout+'、家賃相場は月いくらだと思う？',
   'SUUMOが2026年10月10日に掲載した東京都の賃貸マンション相場。管理費や個別物件の実際の賃料を当てる問題ではない。',
   truth,'円',Math.round(truth*.15),
   'なるほど、今はそのくらいなんですね。','今の相場はもう少し高いみたい。','その値段ならもっと選択肢が広がりそうですね。',
   SOURCES.rent,'2026-10-10','SUUMO東京都の家賃相場表・2026年10月10日掲載値を固定した問題。最新の相場と異なる場合がある。')};
 },
 (v)=>{
  const [item,truth,source]=WEIGHT[v];
  return {...fixed('P20-'+v,'P20','arai','製品の重量',
   '新井が古いタブレットの仕様を調べている。',
   item+'って、重さは何グラム？',
   '本体のみの公称重量。容量や通信方式が違うモデルとは混同しないでください。',
   truth,'g',55,
   '機種名までよく見ていますね。','実際はもう少し重たいです。','そこまで重くはないですね。',
   source,null,'Apple公式「技術仕様」のWi-Fiモデル重量。')};
 },
 (v)=>{
  const [item,truth,source]=FILMS[v];
  return {...fixed('P21-'+v,'P21','makabe','映画の上映時間',
   '真壁先輩が映画の話を始めた。',
   '映画「'+item+'」、何分くらいあるか知ってる？',
   'スタジオジブリが掲載している本編の上映時間。予告編の時間は含まない。',
   truth,'分',20,
   '上映時間まで覚えてるのね。','もう少し長い作品よ。','そこまで長編ではないわね。',
   source,null,'スタジオジブリ公式の作品情報「上映時間（約○分）」。')};
 },
 (v)=>{
  const [item,truth,source]=HEIGHT[v];
  return {...fixed('P22-'+v,'P22','hina','建物の高さ',
   '陽菜が街のランドマークの話を始めた。',
   item+'の高さって、何メートルでしょう？',
   '建物・塔の最高高さを尋ねている。展望フロアの高さとは異なる。',
   truth,'m',55,
   'よく知ってますね！','実はもっと高いんです。','そこまでは高くないです。',
   source,null,'各施設の公式サイト掲載の最高高さ。')};
 },
 (v)=>{
  const [item,truth]=STORES[v];
  return {...fixed('P23-'+v,'P23','umeda','お店の店舗数',
   '梅田が無印良品の店舗展開の話をしている。',
   item+'は何店舗だと思う？',
   '良品計画の2025年8月末時点の会社概要に掲載された数値。国内と海外、店舗区分を区別してね。',
   truth,'店舗',Math.max(100,Math.round(truth*.14)),
   'こんなにあるんだね。','もう少し店舗が多いよ。','もう少し少ないんだって。',
   SOURCES.muji,'2025-08-31','良品計画「会社概要」地域別店舗数（2025年8月末）。Café&Meal MUJI・IDÉEの扱いを設問で明記。')};
 }
];
const rand32=x=>{let n=(x+0x9e3779b9)>>>0;n=Math.imul(n^(n>>>16),0x85ebca6b);n=Math.imul(n^(n>>>13),0xc2b2ae35);return(n^(n>>>16))>>>0};
function draw(seed){
 const order=Array.from({length:FACTORIES.length},(_,i)=>i);
 for(let i=order.length-1;i>0;i--){const j=rand32(seed+i*293+i*i)%(i+1);[order[i],order[j]]=[order[j],order[i]]}
 const out={};
 SIDE_IDS.forEach((slot,i)=>{
   const theme=order[i],v=rand32(seed^Math.imul(slot+1,0x12ef5c9d))%3,extra=rand32(seed^Math.imul(i+1,0x2c1b3c6d))%3;
   out[slot]=FACTORIES[theme](v,extra);
 });
 return out;
}
function applyToQuestion(q,scene){
 if(!scene||!Number.isSafeInteger(scene.truth))throw new Error('Malformed incidental scene');
 const nr={...q,...scene};
 nr.person=scene.person;
 nr.character=scene.person;
 nr.item=scene.slot; // Avoid retaining the overwritten price, age or landmark question.
 nr.opening=q.day+'。'+scene.opening;
 nr.cardType='none';
 nr.emoji='🔢';
 nr.imageKey=null;
 nr.productId=null;
 nr.situationType=null;
 nr.micro=true;
 nr.publicDetail='';
 nr.spec='';
 nr.resultDetail=scene.detail;
 nr.explain=scene.detail;
 nr.hint='';
 nr.min=scene.min;
 nr.max=scene.max;
 if(!(nr.min<=nr.truth&&nr.truth<=nr.max&&nr.zone[0]<=nr.zone[1]&&nr.zone[0]>=nr.min&&nr.zone[1]<=nr.max))
   throw new Error('Incoherent numeric range: '+scene.id);
 return nr;
}
const API=Object.freeze({VERSION:'2.0.1',SIDE_IDS,FACTORY_COUNT:FACTORIES.length,CANONICAL_VARIANTS:FACTORIES.length*3,APPROVED_IDS:['I12','I15','P18','P19','P20','P21','P22','P23'],draw,applyToQuestion});
root.N1SideQuestions=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof window!=='undefined'?window:globalThis);
