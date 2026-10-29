window.R1 = (function makeEngine(){
"use strict";
const VERSION="0.6.0-alpha";
const GENRES=[
{id:"taste",name:"商品・味",icon:"🍜"},
{id:"service",name:"接客",icon:"💬"},
{id:"price",name:"価格",icon:"💴"},
{id:"mood",name:"雰囲気",icon:"🪑"},
{id:"identity",name:"個性・こだわり",icon:"✨"}
];
const MONTHS=["4月","5月","6月","7月","8月","9月","10月","11月","12月","1月","2月","3月"];
const SHOPS=[
{id:"ramen",name:"麺処いわき",owner:"岩城 譲",age:43,icon:"🍜",category:"ラーメン",description:"開業以来、硬麺を看板に掲げる個人店。",product:"看板の硬麺",palette:"ramen"},
{id:"cafe",name:"喫茶こもれび",owner:"紺野 千草",age:54,icon:"☕",category:"喫茶店",description:"商店街で長く営業している喫茶店。",product:"ブレンドと厚切りトースト",palette:"cafe"},
{id:"cake",name:"パティスリー・リボン",owner:"安西 美波",age:32,icon:"🍰",category:"洋菓子",description:"季節のお菓子と新しいレシピを扱う洋菓子店。",product:"季節のショートケーキ",palette:"cake"},
{id:"curry",name:"カレー食堂こはく",owner:"杉浦 奏",age:37,icon:"🍛",category:"カレー",description:"スパイスカレーと日替わりの副菜を出す食堂。",product:"定番スパイスカレー",palette:"curry"},
{id:"teishoku",name:"定食屋つむぎ",owner:"田辺 芽衣",age:46,icon:"🍱",category:"定食",description:"焼き魚と日替わりの小鉢が評判の定食屋。",product:"本日の日替わり定食",palette:"teishoku"}
];
const PATHS={
ramen:{
taste:{plus:"硬麺を極める店",minus:"茹で加減研究所"},
service:{plus:"寡黙なおもてなし店",minus:"完全食券制の店"},
price:{plus:"お値打ち満腹ラーメン",minus:"価格見直し食堂"},
mood:{plus:"一人席の聖域",minus:"落ち着く街の食堂"},
identity:{plus:"超硬麺専門店",minus:"王道中華そば店"}
},
cafe:{
taste:{plus:"自家焙煎の名店",minus:"メニュー全面刷新喫茶"},
service:{plus:"会話を楽しむ喫茶",minus:"注文セルフ喫茶"},
price:{plus:"お値打ちブレンド喫茶",minus:"価格改定の喫茶"},
mood:{plus:"静寂の読書喫茶",minus:"交流カフェ"},
identity:{plus:"昭和純喫茶",minus:"現代型カフェ"}
},
cake:{
taste:{plus:"至高の一品専門店",minus:"レシピ再出発工房"},
service:{plus:"お祝い相談の洋菓子店",minus:"無人受取スイーツ店"},
price:{plus:"お値段以上の洋菓子店",minus:"手頃なおやつ工房"},
mood:{plus:"お姫様のサロン",minus:"気軽な街角菓子店"},
identity:{plus:"奇抜な新作工房",minus:"定番ケーキの店"}},
curry:{taste:{plus:"香りを極めたカレー店",minus:"辛さ選べるカレー店"},service:{plus:"注文相談のカレー店",minus:"セルフ式カレー食堂"},price:{plus:"満腹セット食堂",minus:"小皿カレー専門店"},mood:{plus:"ゆったりスパイス食堂",minus:"気軽な立ち食いカレー"},identity:{plus:"週替わりスパイス研究所",minus:"王道カレー食堂"}},
teishoku:{taste:{plus:"小鉢が主役の定食屋",minus:"味付け選べる定食屋"},service:{plus:"おかえり定食屋",minus:"注文セルフの定食屋"},price:{plus:"満腹おかわり食堂",minus:"小盛り定食屋"},mood:{plus:"くつろぎ座敷定食屋",minus:"すばやい昼食処"},identity:{plus:"季節の小鉢研究所",minus:"昔ながらの定食屋"}}};
const POSTERS={"ramen":{"taste":{"plus":"硬麺の新作が店頭に登場","minus":"茹で加減の再調整を告知"},"service":{"plus":"接客方針の札を掲示","minus":"注文方法を見直した"},"price":{"plus":"お得なセットを追加","minus":"価格表を作り直した"},"mood":{"plus":"客席を整えた","minus":"席の間隔を調整した"},"identity":{"plus":"こだわりメニューを増やした","minus":"定番メニューも取り扱う"}},"cafe":{"taste":{"plus":"自家焙煎メニューを拡充","minus":"抽出方法を再検討"},"service":{"plus":"会話の時間を設けた","minus":"接客ルールを見直した"},"price":{"plus":"お得なセットを掲示","minus":"定番商品の価格を調整"},"mood":{"plus":"読書席を増やした","minus":"席の配置を変更した"},"identity":{"plus":"懐かしい食器を並べた","minus":"新メニューを試作した"}},"cake":{"taste":{"plus":"人気商品の新作を発売","minus":"レシピを改良した"},"service":{"plus":"贈り物の相談窓口を新設","minus":"受け取り方法を変更"},"price":{"plus":"お得な焼き菓子セットを追加","minus":"小さなサイズを販売"},"mood":{"plus":"ショーケースを華やかにした","minus":"店内の装飾を減らした"},"identity":{"plus":"個性派ケーキを発表","minus":"定番商品の試作を始めた"}}};
const VISUALS={"ramen":{"taste":{"plus":["🪨","特製・硬麺","麺の硬さ五段階"],"minus":["⏱️","茹で加減表","標準茹で時間を明示"]},"service":{"plus":["🙇","接客の心得","挨拶を大切に"],"minus":["🎫","食券販売機","会話なしで注文"]},"price":{"plus":["🍚","満腹セット","おかわり相談可"],"minus":["📋","改定価格表","一杯の内訳を表示"]},"mood":{"plus":["🪑","一人席","静かに麺を味わう"],"minus":["🛋️","広々客席","家族席もご用意"]},"identity":{"plus":["💪","限界硬麺","挑むか、引き返すか"],"minus":["🍥","王道中華そば","初めての一杯から"]}},"cafe":{"taste":{"plus":["☕","店内焙煎豆","香りで豆を選ぶ"],"minus":["🫖","抽出実験","豆ごとに温度調整"]},"service":{"plus":["💬","おしゃべり席","会話も一杯のうち"],"minus":["🔕","静かな接客","声かけは最小限"]},"price":{"plus":["🍞","朝食セット","毎日通える値段"],"minus":["🧾","価格のご案内","一杯ずつ納得して"]},"mood":{"plus":["📚","読書コーナー","長居歓迎"],"minus":["🪑","席の配置変更","気兼ねなく立ち寄れる"]},"identity":{"plus":["📻","昭和レコード","懐かしさをお届け"],"minus":["🧋","新作ドリンク","昔と今のいいとこ取り"]}},"cake":{"taste":{"plus":["🍓","季節のショート","果物の甘さが主役"],"minus":["🧁","甘さ控えめ試作","レシピを一から見直し"]},"service":{"plus":["🎁","贈答相談カウンター","大切な日のお菓子"],"minus":["📦","受取専用窓口","待ち時間を短く"]},"price":{"plus":["🍪","焼き菓子セット","ちょっとお得なおやつ"],"minus":["🧾","ミニサイズ販売","少しだけ食べたい日に"]},"mood":{"plus":["🎀","サロン席","ケーキと過ごす午後"],"minus":["🪟","すっきりした売場","見やすいショーケース"]},"identity":{"plus":["🌈","本日の異色作","見たことのないケーキ"],"minus":["🍰","王道の定番菓子","いつでも食べたい味"]}}};
POSTERS.curry={"taste":{"plus":"スパイスの香りを強めた","minus":"辛さを選べるようにした"},"service":{"plus":"注文の相談席を設けた","minus":"セルフ式注文を始めた"},"price":{"plus":"満腹セットを追加","minus":"小皿サイズを新発売"},"mood":{"plus":"落ち着ける席を増やした","minus":"席の回転を速めた"},"identity":{"plus":"週替わりスパイスを導入","minus":"定番カレーを復活させた"}};
VISUALS.curry={"taste":{"plus":["🌶️","香り重視カレー","挽きたてスパイス"],"minus":["🥄","選べる辛さ","辛さは五段階"]},"service":{"plus":["👩‍🍳","カレー相談","好みの味を一緒に"],"minus":["🎫","セルフ注文","さっと食べられる"]},"price":{"plus":["🍚","満腹セット","ライスのおかわり可"],"minus":["🥣","小皿カレー","軽いランチにも"]},"mood":{"plus":["🪴","ゆったり食堂","昼休みを少し長く"],"minus":["🪑","立ち寄り席","すぐに食べて出発"]},"identity":{"plus":["🧪","週替わりスパイス","今月の一皿は実験中"],"minus":["🍛","定番カレー","変わらぬ安心の味"]}};
POSTERS.teishoku={"taste":{"plus":"小鉢の種類を増やした","minus":"味付けを選べるようにした"},"service":{"plus":"常連の相談札を設置","minus":"食券式を取り入れた"},"price":{"plus":"おかわり付きのセットを追加","minus":"小盛り定食を新発売"},"mood":{"plus":"くつろぎの座敷席を設置","minus":"昼休み用の席配置にした"},"identity":{"plus":"季節ごとの小鉢を考案","minus":"定番おかずを復刻"}};
VISUALS.teishoku={"taste":{"plus":["🥬","彩り小鉢定食","小鉢が五つ"],"minus":["🥢","味付け選べる定食","好みに合わせて"]},"service":{"plus":["🍵","おかえり定食","お茶と一緒に"],"minus":["🎫","食券式定食","迷わず注文"]},"price":{"plus":["🍚","おかわり定食","ご飯おかわり自由"],"minus":["🥣","小盛り定食","軽い昼食に"]},"mood":{"plus":["🪑","お座敷ランチ","昼休みをゆったり"],"minus":["⏱️","速い昼定食","時間のない日にも"]},"identity":{"plus":["🌾","季節の小鉢","旬の食材を使って"],"minus":["🐟","昔ながらの焼き魚","変わらない食卓"]}};
const TOPICS={
ramen:{taste:"麺の硬さとスープ",service:"店主の受け答え",price:"一杯の価格",mood:"店内の居心地",identity:"独特のこだわり"},
cafe:{taste:"コーヒーと軽食",service:"店員の応対",price:"飲み物の価格",mood:"店内の落ち着き",identity:"昔ながらの雰囲気"},
cake:{taste:"ケーキの味と種類",service:"店員の応対",price:"ケーキの値段",mood:"売場の雰囲気",identity:"商品の独創性"},
curry:{taste:"スパイスと辛さ",service:"注文の説明",price:"ランチの値段",mood:"昼休みの居心地",identity:"週替わりメニュー"},
teishoku:{taste:"おかずと小鉢の味",service:"店員の受け答え",price:"定食の値段",mood:"食堂の雰囲気",identity:"季節のおかず"}
};
const RESPONSES={
ramen:{
taste:{minus:["麺が硬いのではありません。硬さが売りです。ただ、茹で不足と硬麺は違います。確認します。","硬さが好みでないのは分かります。仕込みまで間違っていたなら、それは私の問題です。"],plus:["硬さに気づいてくださりありがとうございます。もっと硬くできるかは検討中です。","味の評価、ありがたく受け取ります。褒められても茹で時間は変えません。"]},
service:{minus:["接客が威圧的とのこと。説明を短くしていましたが、伝え方は改めます。","無愛想と威圧は別です。とはいえ嫌な思いをさせたなら申し訳ない。"],plus:["接客を褒められるとは予想外です。麺の感想も次回お聞かせください。","言葉数の少なさを気に入る方もいる。もちろん挨拶はします。"]},
price:{minus:["値付けは材料と手間から決めています。安くする方法は、確かに考える余地があります。","高いとのご指摘、原価表を公開する気はありませんが、価格の理由は説明します。"],plus:["価格を評価いただきありがとうございます。安いと言われても、値上げの許可とは受け取りません。","値段よりも中身を見てもらえたなら何よりです。"]},
mood:{minus:["落ち着かないとのこと。席の配置には改善の余地がありそうです。","静かすぎても騒がしくても文句は出ます。ですが換気と座席は見直します。"],plus:["居心地を褒められる日が来るとは。静かな店は続けます。","ラーメンが冷める前に食べられる空間なら、それで十分です。"]},
identity:{minus:["こだわりが強すぎると。店の個性を残す方法と押しつけは分けて考えます。","普通のラーメンも好きです。うちで出すかは、また別の話です。"],plus:["個性を評価いただいたなら、その言葉に甘えずもっと突き詰めます。","唯一無二という言葉は軽々しく使いませんが、悪い気はしません。"]}
},
cafe:{
taste:{minus:["コーヒーは豆が変わると味も変わります。今回は抽出を見直してみます。","ご期待に添えず残念です。定番メニューほど、手を抜けませんね。"],plus:["いつもの味を気に入っていただけて、うれしいです。","良い豆が入ったんです。また違う香りも試してくださいね。"]},
service:{minus:["行き届かないところがありましたね。店で話し合ってみます。","気軽な店のつもりでしたが、距離感が近すぎたかもしれません。"],plus:["お話できて楽しかったです。無理にお声がけはしないようにしています。","常連さんも初めての方も、同じように迎えたいですね。"]},
price:{minus:["毎日来られる価格かどうか、もう一度計算してみます。","高く感じさせてしまったのですね。値段の見せ方も工夫します。"],plus:["お値段まで見てくださって、ありがとうございます。","このまま続けられる価格であることも、大事だと思っています。"]},
mood:{minus:["落ち着かない日もあったでしょう。席の使い方を考えますね。","店内の雰囲気はお客さまと一緒に作るもの。手を加えられる部分もあります。"],plus:["ここでゆっくりできたなら、何よりです。","静かな時間を守れるよう、少しずつ工夫しています。"]},
identity:{minus:["懐かしさだけでは続けられませんね。新しい工夫も考えてみます。","時代に合わないところはあります。好きな部分は残したいですね。"],plus:["昔のままに見えても、少しずつ変えているんですよ。","この店らしさを見つけてくださったんですね。ありがとうございます。"]}
},
cake:{
taste:{minus:["仕上がりが期待以下だったのは悔しいです。次の試作に反映します。","甘さの調整からやり直します。言っていただけて助かりました。"],plus:["ありがとうございます！ 次はさらに印象に残る一品を作りたいです。","味を褒められると、新しいレシピが頭に浮かんでしまいます。"]},
service:{minus:["接客のせいでお菓子まで嫌いになってほしくないです。改善します。","忙しさを言い訳にしたくありません。受け取り方を工夫します。"],plus:["相談してもらえる店になりたいです！","記念日のお菓子を一緒に選べるのが、いちばんうれしい仕事です。"]},
price:{minus:["高く感じられたのですね。材料は守りつつ、選択肢を増やせるか考えます。","予算に合わない方もいるはず。小さなお菓子も作ってみます。"],plus:["価格まで褒めていただけるなんて。素材にもっとこだわりたくなります。","お値段に見合う体験にできるよう、工夫します！"]},
mood:{minus:["売場が落ち着かなかったでしょうか。飾りすぎたかもしれません。","居心地まで考えていませんでした。ショーケースを見直します。"],plus:["内装も頑張ったので、うれしいです！ もっと飾りたくなります。","ここで過ごす時間もお菓子の一部だと思っています。"]},
identity:{minus:["新作に力を入れすぎたかもしれません。定番も磨き直します。","普通のお菓子がおいしいことも大切ですよね。少し考えます。"],plus:["その言葉を待っていました！ 次の試作も楽しみにしてください。","変わったものが好きな方がいてよかった！ でも味は忘れません。"]}
}};
RESPONSES.curry={"taste":{"minus":["辛さと香りの感じ方は違いますね。次は調整できるようにします。"],"plus":["ありがとうございます。次は香りの違いも試してください。"]},"service":{"minus":["注文の説明が分かりにくかったですね。改善します。"],"plus":["説明が役立ったなら良かったです。"]},"price":{"minus":["量も価格も見直してみます。小さいサイズも考えます。"],"plus":["ランチに選んでもらえる価格を維持します。"]},"mood":{"minus":["昼休みは短いですものね。席の使い方を工夫します。"],"plus":["少し休めたなら良かったです。"]},"identity":{"minus":["今週の実験は好みが分かれましたね。定番も残します。"],"plus":["次は違うスパイスを試してみます。"]}};
RESPONSES.teishoku={"taste":{"minus":["味付けが濃かったようですね。次の仕込みで調整します。"],"plus":["小鉢まで見てくださってありがとうございます。"]},"service":{"minus":["お待たせしました。注文の流れを見直します。"],"plus":["お昼の時間が心地よいものになってよかったです。"]},"price":{"minus":["お値段と量のバランスを考え直します。"],"plus":["毎日食べられる値段を大切にします。"]},"mood":{"minus":["席が落ち着かなかったでしょうか。配置を変えます。"],"plus":["ほっとできる店にしたいです。"]},"identity":{"minus":["いつもの定食も残しつつ、季節の味も考えます。"],"plus":["旬のおかずをまた考えたくなります。"]}};
const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
const copy=x=>JSON.parse(JSON.stringify(x));
function createState(seed=20261029){const shops={};for(const d of SHOPS)shops[d.id]={scores:Object.fromEntries(GENRES.map(x=>[x.id,0])),money:70,locals:55,visitors:28,stress:15,stage:0,route:null,closed:false,hardening:false,disputes:0,history:[],lastChange:"昔ながらの店構えで営業中。",opened:!["curry","teishoku"].includes(d.id),openedMonth:["curry","teishoku"].includes(d.id)?null:0,slowMonths:0,closedReason:null};return {schema:1,version:VERSION,seed,month:0,shops,reviews:[],feed:[],last:null,viralCount:0,lastViralMonth:-10,view:"map",started:true};}
function random(seed){let x=(seed>>>0)||1234567;return ()=>{x=(1664525*x+1013904223)>>>0;return x/4294967296};}
function routeFor(s){let k=null,best=0,pol=null;for(const g of GENRES){const score=s.scores[g.id],abs=Math.abs(score);if(abs>best||(abs===best&&g.id==="identity"&&s.hardening&&score>0)){best=abs;k=g.id;pol=score>0?"plus":"minus";}}if(!k||best<1)return {genre:null,polarity:null,stage:0,label:null,score:best};const stage=best>=15?4:best>=9?3:best>=4?2:1;return {genre:k,polarity:pol,stage,label:null,score:best};}
function display(s,id){
 if(!s.opened){const base=SHOPS.find(x=>x.id===id);return {id,base,route:{genre:null,polarity:null,stage:0,label:null},phase:"",sign:"空き店舗",sign2:"",feature:"新しいお店を準備中",visual:{icon:"🏬",product:"空きテナント",tagline:"出店者募集中",variety:0},open:false,summary:"まだ営業していない。",population:"準備中",business:"未開店"};}
 if(id==="ramen"){
  const base=SHOPS.find(x=>x.id===id);
  return {id,base,route:{genre:null,polarity:null,stage:0,label:null,score:0},phase:"",sign:base.name,sign2:"",
   feature:"看板も硬麺も変わらず営業中",visual:{icon:base.icon,product:base.product,tagline:"麺の硬さは変えません",variety:0},
   open:!s.closed,summary:s.closed?"客足が減り、硬麺は変えないままシャッターを下ろした。":"店主は今日も口コミに反論中。看板も商品も、開店当時のまま。",
   population:s.locals>=65?"地元客で賑わう":s.visitors>=65?"話題を聞いた客が増えた":s.locals<=30?"常連が減っている":"いつもの客足",
   business:s.closed?"閉店":s.money>=100?"繁盛":s.money>=40?"営業中":"経営が厳しい",disputes:s.disputes||0};
 }
 const base=SHOPS.find(x=>x.id===id),route=routeFor(s),info=route.genre?PATHS[id][route.genre][route.polarity]:null,phase=["","小さな改装","看板一新","店舗改装","完成・拡張"][route.stage];
const sign=route.stage>=2?info:route.stage===1?base.name+"（改装中）":base.name;
const visualData=route.genre?VISUALS[id][route.genre][route.polarity]:null;
const visual={icon:visualData?visualData[0]:base.icon,product:visualData?visualData[1]:base.product,tagline:visualData?visualData[2]:"いつもの品揃え",variety:route.stage};
const last=[...s.history].reverse().find(h=>h.star!==3),currentGenre=last&&GENRES.some(g=>g.id===last.genre)?last.genre:route.genre;
const positive=last?last.star>=4:route.polarity==="plus",poster=currentGenre?POSTERS[id][currentGenre][positive?"plus":"minus"]:"いつもの営業案内";
const repeated=last?s.history.filter(h=>h.genre===currentGenre&&Math.sign(h.star-3)===Math.sign(last.star-3)).length:0;
const feature=last?poster+(repeated>=2?"（第"+repeated+"回の見直し）":""):route.stage?"改装を準備中":"本日も営業中";
const summary=s.closed?"シャッターが下り、閉店のお知らせが貼られている。":route.stage===0?"昔ながらの店構えで営業中。":route.stage===1?`「${info}」に向けて小さな改装を始めた。`:route.stage===2?`「${info}」へ看板を掛け替えた。`:route.stage===3?`「${info}」に合わせて内装と商品を変更した。`:`「${info}」として店の営業形態が定着した。`;
return {id,base,route:{...route,label:info},phase,sign,sign2:route.stage===1?info+"へ":route.stage>=3?info+"・"+phase:"",feature,visual,open:!s.closed,summary,population:s.locals>=65?"地元客で賑わう":s.visitors>=65?"初めての客が目立つ":s.locals<=30?"常連が減っている":"いつもの客足",business:s.money>=100?"繁盛":s.money>=40?"営業中":s.money>0?"経営が厳しい":"閉店"};}
function reviewText(state,id,star,genre){const s=state.shops[id];if(!s||!GENRES.some(g=>g.id===genre)||!Number.isInteger(star)||star<1||star>5)throw Error("invalid review");const topic=TOPICS[id][genre];const revisit=s.history.length>0?"以前にも来ました。 ":"";if(s.closed||!s.opened)throw Error("closed or unopened store");const current=display(s,id);const changed=current.route.stage>0?`今の「${current.route.label}」という方向性も踏まえると、`:"";const texts={1:`${topic}にはかなり不満があります。改善してほしいです。`,2:`${topic}は気になる点がありました。もう少し工夫があるとうれしい。`,3:`${topic}は良い点も気になる点もありました。今後に期待します。`,4:`${topic}は良かったです。この良さが続くといいと思います。`,5:`${topic}がとても良かったです。ぜひこの方向を極めてほしい。`};return revisit+changed+texts[star];}
const PUBLIC_REVIEWS={"ramen":[{"by":"近隣の会社員","star":1,"genre":"taste","text":"麺が硬すぎて食べづらい。","reply":"硬麺だと看板に書いています。柔らかい麺は別のお店へどうぞ。","archived":true},{"by":"麺好き","star":5,"genre":"taste","text":"これくらいの硬さが欲しかった。","reply":"分かってもらえたようですが、明日も同じものを出します。","archived":true},{"by":"出張中の客","star":2,"genre":"service","text":"店主の返事がとにかく強い。","reply":"書いたことには返信します。それの何が問題でしょう。","archived":true}],"cafe":[{"by":"近所の読書好き","star":5,"genre":"mood","text":"長居しても急かされない。","reply":"いつでもお好きな本を持っていらしてくださいね。","archived":true},{"by":"急いでいる人","star":2,"genre":"service","text":"話しかけられて時間を使った。","reply":"失礼しました。次はお声がけを控えます。","archived":true},{"by":"常連","star":4,"genre":"taste","text":"ブレンドが毎回おいしい。","reply":"豆を少し替えているのに、よく気づかれましたね。","archived":true}],"cake":[{"by":"スイーツ好き","star":5,"genre":"identity","text":"新作ケーキの見た目が独創的！","reply":"ありがとうございます！ 次はもっと驚くものを作ります！","archived":true},{"by":"近所の母親","star":2,"genre":"taste","text":"少し甘さが強すぎた。","reply":"悔しい……次の試作で別の甘さを試します！","archived":true},{"by":"お祝い帰りの客","star":4,"genre":"service","text":"ギフトの相談が丁寧だった。","reply":"記念日のお手伝いができてうれしいです！","archived":true}],"curry":[{"by":"出張の営業職","star":4,"genre":"taste","text":"午後も元気が出るスパイス感。","reply":"ありがとうございます。次は香りの違いもぜひ。","archived":true},{"by":"近隣の会社員","star":2,"genre":"price","text":"ちょっと量が少ないかな。","reply":"なるほど、満腹感ですね。セット内容を考えます。","archived":true},{"by":"辛党の客","star":5,"genre":"identity","text":"週替わりが面白い。","reply":"次は香りの組み合わせも試してみます。","archived":true}]};
PUBLIC_REVIEWS.teishoku=[{"by":"近くの職員","star":5,"genre":"taste","text":"焼き魚と小鉢の味が優しい。","reply":"ありがとうございます。明日も焼きたてを出しますね。","archived":true},{"by":"急いでいる人","star":2,"genre":"service","text":"注文後、少し待ちました。","reply":"お昼のお時間を使わせてしまいましたね。動線を見直します。","archived":true},{"by":"常連の女性","star":4,"genre":"identity","text":"季節で副菜が変わるのが楽しみ。","reply":"旬を見つけたら、また小鉢にしますね。","archived":true}];
function publicReviews(state,id){if(!PUBLIC_REVIEWS[id])throw Error("unknown shop");const later=state.feed.filter(x=>x.kind==="npc"&&x.id===id).map(x=>({by:x.by,star:x.star,genre:x.genre,text:x.text,reply:x.reply,month:x.month}));return [...PUBLIC_REVIEWS[id],...later].slice(-9);}
const RAMEN_ARGUMENTS={
 taste:{minus:["硬い麺の店で『硬い』。看板の文字は読めましたか？ 茹で時間は変えません。","柔らかい麺がお好きなら、他店を勧めます。ここで出す麺はこの硬さです。"],neutral:["星3。つまり何が言いたいんです？ 私の麺は中間の硬さにはしません。"],plus:["褒められても茹で時間は変えません。あなたの好みがたまたま合っただけです。","おいしいならそれで結構。次も同じ味を出しますから、過剰な期待はしないでください。"]},
 service:{minus:["無愛想？ 麺に愛想は必要ないでしょう。注文は聞こえています。それで十分です。","接客が気に入らない？ こちらはラーメンを作っています。会話はメニューにありません。"],neutral:["接客が星3。私の挨拶を評価する前に、麺が伸びますよ。"],plus:["接客を褒められても困る。笑顔を増やす予定はありません。","愛想が良いだなんて誤解です。お客さまに必要な説明をしているだけです。"]},
 price:{minus:["高い？ 材料費の請求書はお見せしません。値下げもしません。","値段の相談なら市場へ。私はこの一杯をこの値段で売ります。"],neutral:["価格が普通なら、わざわざ星3で書く必要がありましたか。"],plus:["お得と思ったなら良かったですね。だからといって値段も量も変えません。","安く感じたなら、それは私の値付けではなくあなたの感覚です。"]},
 mood:{minus:["店内が狭い？ 寝泊まりする場所ではありません。麺が冷める前にどうぞ。","椅子の数より、丼の中を見てほしいですね。内装を変えるつもりはありません。"],neutral:["雰囲気は星3ですか。ここは観光施設ではないんですよ。"],plus:["落ち着く？ では静かに食べてください。店内は今のままです。","居心地より麺です。椅子を褒めても席は増やしません。"]},
 identity:{minus:["こだわりを捨てたら、私が作る意味がありません。店を変える気はありません。","普通の店にしてほしい？ 普通のお店は他にもたくさんあります。"],neutral:["個性が星3。平均点に合わせるつもりは、最初からありません。"],plus:["唯一無二ですか。それでも、明日も同じラーメンを出します。","褒められて変わったら、それはこだわりではなく迎合でしょう。"]}
};
function replyFor(state,id,star,genre){
 const s=state.shops[id],positive=star>3,negative=star<3,band=positive?"plus":negative?"minus":"neutral";
 const n=s.history.length,sameGenre=s.history.filter(h=>h.genre===genre).length;
 const rnd=random((state.seed+state.month*107+n*31+star*13+GENRES.findIndex(x=>x.id===genre)*17+SHOPS.findIndex(x=>x.id===id)*23)>>>0);
 if(id==="ramen"){
  const lines=RAMEN_ARGUMENTS[genre][band];
  let msg=lines[Math.floor(rnd()*lines.length)];
  if(sameGenre>=2)msg="また同じ話ですか。前にも返信しましたよ。"+msg;
  else if(sameGenre===1)msg="前回もお伝えしましたが、"+msg;
  if((s.disputes||0)>=5)msg="これで何度目の口コミですか。"+msg;
  return msg;
 }
 const arr=RESPONSES[id][genre][band==="neutral"?"plus":band];
 let msg=band==="neutral"?["評価が分かれた点、参考にいたします。","どちらとも言い切れないご感想も、大切に読みます。","次に来られたとき、違いを感じていただけるといいですね。","良いところも気になるところもある、という評価ですね。次の一皿の参考にします。"][SHOPS.findIndex(x=>x.id===id)]:arr[Math.floor(rnd()*arr.length)];
 if(band!=="neutral"&&sameGenre>=1){const edge=SPICY_REPLIES[id][genre][band];msg=edge[Math.floor(rnd()*edge.length)];}
 if(n&&s.history[n-1].genre===genre)msg="前回も同じ点を見てくださっていましたね。"+msg;
 else if(n>0&&n%3===0)msg="何度も足を運んでくださっていることは覚えています。"+msg;
 return msg;
}
const SPICY_REPLIES={"ramen":{"taste":{"minus":["硬い麺の店に来て『硬い』は、看板を読んでから書いていただけると助かります。ただ、茹で不足なら私の責任です。","柔らかい麺を求める自由はあります。うちの麺を変える義務があるかは別です。"],"plus":["分かっていただけたようで。……ただ、褒められたからといって気を緩める気はありません。","硬さを評価するなら、スープとの相性まで見てほしい。そこが本題です。"]},"service":{"minus":["『無愛想』ですか。麺はしゃべりませんが、客には挨拶しています。威圧に見えたなら直します。","接客の改善はします。しかし、笑顔をトッピングする店になる予定はありません。"],"plus":["接客を褒める口コミは珍しいですね。疑ってはいませんが、麺の感想もお願いします。","『話しかけられないのが良い』とのこと。褒め言葉として受け取っていいんでしょうね。"]},"price":{"minus":["高い？ では、どの材料を抜けば納得されるか教えてください。とはいえ説明不足は認めます。","安くして味が落ちたら、次は味で星1でしょう。だから慎重に考えています。"],"plus":["『安い』と書かれましたが、値上げの合図ではありませんよね。","値段を認めてもらえるのはありがたい。でも一杯の価値は食べ終わってから決まります。"]},"mood":{"minus":["『落ち着かない』と『活気がある』は紙一重です。うちが前者なら配置を考えます。","席の狭さは認めます。お客さまの意見を壁に貼れば、もっと狭くなるのでやめます。"],"plus":["雰囲気を褒められても、壁紙でスープの味は変わりません。ただ、悪い気はしません。","ラーメン屋を居心地で選ぶ方もいるんですね。席の掃除は一層丁寧にします。"]},"identity":{"minus":["『こだわりすぎ』と。こだわりを捨てたら、ここは何屋になるんですかね。","個性が邪魔だという指摘は受け取りました。押しつけなのか、看板なのか考えます。"],"plus":["『唯一無二』は便利な言葉ですね。期待に負けるつもりはありません。","評価ありがとうございます。その一言で店を変えると思われたくないので、むしろ真剣に考えます。"]}},"cafe":{"taste":{"minus":["コーヒーが薄い、と。『飲みやすい』と褒めた方もいます。どちらの声にも向き合いますね。","味に正解は一つではありません。でも、飲み残した理由は知りたいです。"],"plus":["豆の話までしてくださるとは。次は抽出温度にも気づくかもしれませんね。","おいしい、だけでは足りませんか？ ……いえ、十分うれしいです。"]},"service":{"minus":["『干渉しすぎ』と『無関心』を同じ日にいただきました。接客とは難しいものですね。","話しかけすぎと言われるなら、こちらが黙る番かもしれません。"],"plus":["おしゃべりが良かったならよかったです。無理に会話を始めたわけではありませんよ。","私の対応まで口コミに？ どうやらこの店は、飲み物以外も見られていますね。"]},"price":{"minus":["高い、というご意見。原価計算をしてみますが、椅子の賃料まで削れませんからね。","お値段を気にされる方も大切なお客さまです。ただ、安さだけの店にはしたくありません。"],"plus":["お手頃と評判になると、次の値上げが難しくなりますね。うれしい悩みです。","手頃さを褒められると、もっとお得にしたくなって困ります。"]},"mood":{"minus":["『静かすぎる』と言われた日に『うるさい』とも書かれました。椅子を増やす前に考えます。","居心地の悪さは見直します。ただ、皆が同じ心地よさを求めてはいないようです。"],"plus":["落ち着く、と言われると、このまま時計を止めたくなりますね。","読書には良い店。でも、長居しすぎてお仕事に遅れないように。"]},"identity":{"minus":["古臭い、ですか。『懐かしい』と呼んでいた棚ですが、手を入れる時期かもしれません。","今どきではないという指摘、承知しました。今どきの良さも少し取り入れます。"],"plus":["懐かしいと褒められるほど、古いものを捨てにくくなるんですよ。","この店の古さを価値にしてくださるなら、磨く仕事が増えそうです。"]}},"cake":{"taste":{"minus":["『甘すぎる』ですか？ 昨日は『もっと甘く』と言われました。どちらも試してみます！","このケーキに星1……悔しいです。でも、作り直す口実ができました。"],"plus":["最高ですか！？ そう言われると次は最高を更新したくなります。危険ですね。","うれしい！ でも『これ以上はない』なんて、作り手には言わないでください。"]},"service":{"minus":["対応が遅かったのは反省しています。でも急いで箱詰めすると、今度は崩れます……！","そこまで見られていたとは。次から包装手順を変えます。"],"plus":["接客まで褒めてもらえたら、もうお菓子を増やすしかないですね！","ありがとうございます。記念日の相談、次はさらに気合いを入れます。"]},"price":{"minus":["高いですよね……材料を見直すか、小さなお菓子も作るか。簡単に値下げとは言えません。","高いという言葉は効きます。でも、良い素材までやめるのは違う気がします。"],"plus":["『お値段以上』！？ それなら来月はもっとお得な箱を作りたくなります！","コスパが良いと言われたら、値段はそのままで中身を増やすべきでしょうか？"]},"mood":{"minus":["飾りすぎですか！ せっかくリボンを増やしたのに……少し減らしてみます。","店内がまぶしいとは予想外。ケーキが見えるように照明を直します。"],"plus":["かわいいと言われたら、次は天井にもリボンを付けたい！ ……だめですか？","内装を褒めてもらえるなんて。ケーキ屋なのに内装の新作を考えています。"]},"identity":{"minus":["『変わりすぎ』ですか。そんなに変ですか！？ ……定番も作ります。","誰にも理解されない新作は、ただの失敗作かも。考え直します。"],"plus":["個性が良い！？ なら来月はもっと変わったものを出します。止めないでください！","独自性を褒められたら、普通のケーキに戻れなくなりそうです！"]}}};
SPICY_REPLIES.curry={"taste":{"plus":["香りはまだ伸ばせそうです。また試します。"],"minus":["好みは分かれますね。次の仕込みで調整します。"]},"service":{"plus":["説明を褒めていただけると助かります。"],"minus":["説明が不足していました。メニュー表を変えます。"]},"price":{"plus":["食べごたえの評価、ありがたいです。"],"minus":["高く感じたなら組み合わせを見直します。"]},"mood":{"plus":["昼休みが心地よければうれしいです。"],"minus":["落ち着かないなら席の間隔を考えます。"]},"identity":{"plus":["新しい組み合わせ、また試したくなります。"],"minus":["実験が外れたようですね。定番も大切にします。"]}};
SPICY_REPLIES.teishoku={"taste":{"plus":["小鉢を気に入ってくださったなら、次も作ります。"],"minus":["濃さが合わなかったのですね。別の味付けを考えます。"]},"service":{"plus":["ご丁寧に、こちらこそありがとうございます。"],"minus":["お待たせしない段取りを考えます。"]},"price":{"plus":["続けられる値段でいたいですね。"],"minus":["少しずつ量を選べるようにします。"]},"mood":{"plus":["お昼に一息ついていただけたらうれしいです。"],"minus":["昼休みは短いですから、座りやすくしたいです。"]},"identity":{"plus":["次はどの旬のおかずにしましょうか。"],"minus":["いつもの味を求める方も大切にします。"]}};
const NPC_NAMES=["駅前の会社員","近所の学生","通りがかりの客","常連のひとり","休日の散歩客","子連れの住民","隣町からの来訪者"];
function background(state,review){const rand=random((state.seed+state.month*9973+98127)>>>0);const ids=SHOPS.filter(d=>state.shops[d.id].opened&&!state.shops[d.id].closed).map(d=>d.id);if(!ids.length)return null;const id=ids[Math.floor(rand()*ids.length)],genre=GENRES[Math.floor(rand()*GENRES.length)].id;const star=1+Math.floor(rand()*5),s=state.shops[id];if(id!=="ramen")s.scores[genre]=clamp(s.scores[genre]+Math.sign(star-3)*2,-25,25);s.money=clamp(s.money+(star-3)*0.8,-100,160);s.locals=clamp(s.locals+(star-3)*.7,0,100);s.visitors=clamp(s.visitors+(star-3)*.5,0,100);return {by:NPC_NAMES[Math.floor(rand()*NPC_NAMES.length)],id,star,genre,reply:replyFor(state,id,star,genre),text:`${TOPICS[id][genre]}について${star>=4?"良い印象でした。":star<=2?"少し残念でした。":"良いところも気になるところもありました。"}`};}
function social(state,review){const s=state.shops[review.id];const rand=random((state.seed+state.month*8191+345)>>>0);const makesSense=(state.month%3===0)||(s.stress>=55&&review.star<=2);if(!makesSense||rand()>0.72)return null;const pos=review.star>=4,neg=review.star<=2;let content;if(neg&&review.id==="ramen")content="『麺の硬さの話なのに、店主の返信が一番硬い』と書き込む人もいる。";else if(neg)content=`${SHOPS.find(x=>x.id===review.id).name}の改善点を指摘する投稿が広がり、店を心配する声が増えた。`;else if(pos)content=`${SHOPS.find(x=>x.id===review.id).name}の口コミを見た人が写真を投稿。初めての客が少し増えた。`;else content="『この通り、少し雰囲気が変わった？』という投稿に、地元の人が昔の写真を添えた。";s.visitors=clamp(s.visitors+(pos?5:neg?2:1),0,100);s.stress=clamp(s.stress+(neg?9:1),0,100);return {service:"つぶやき広場",text:content,id:review.id};}
function controversy(state,review){
 if(review.id!=="ramen"||review.star>2||state.shops.ramen.closed)return null;
 const ramen=state.shops.ramen,prior=ramen.history.filter(h=>h.star<=2).length;
 if(prior<2||state.month-(state.lastViralMonth??-10)<3)return null;
 const rand=random((state.seed+state.month*7531+Math.floor(ramen.stress)*11)>>>0);
 if(rand()>.74)return null;
 const label=(state.viralCount||0)%2===0?"返信欄が燃えている":"反論が名物になった";
 const text=label==="返信欄が燃えている"?
 "麺処いわきの返信がスクリーンショットで広まり、賛否両論の書き込みが殺到。店主は返信を続けている。":
 "今度は『どんな口コミにも必ず反論するラーメン屋』として話題に。確認しに来る客も増えている。";
 ramen.visitors=clamp(ramen.visitors+12,0,100);ramen.stress=clamp(ramen.stress+18,0,100);
 const cafe=state.shops.cafe;if(cafe.opened&&!cafe.closed)cafe.visitors=clamp(cafe.visitors+3,0,100);
 const curry=state.shops.curry;if(curry?.opened&&!curry.closed)curry.visitors=clamp(curry.visitors+3,0,100);
 state.viralCount=(state.viralCount||0)+1;state.lastViralMonth=state.month;
 return {label,text,id:"ramen",kind:"viral",month:state.month};
}
function settleAndClose(state){
 const available=SHOPS.filter(d=>state.shops[d.id].opened&&!state.shops[d.id].closed);
 for(const d of available){
  const s=state.shops[d.id];
  const customerFootfall=s.locals*.7+s.visitors*.3+(d.id==="ramen"?9:0);
  s.slowMonths=customerFootfall<39?(s.slowMonths||0)+1:0;
  s.money=clamp(s.money-1+(customerFootfall-45)*.16,-100,160);
 }
 const threatened=available.filter(d=>state.shops[d.id].money<=0||state.shops[d.id].slowMonths>=3)
 .sort((a,b)=>state.shops[a.id].money-state.shops[b.id].money);
 const closures=[];let remaining=available.length;
 for(const d of threatened){
  if(remaining<=1||closures.length>=1)break;
  const s=state.shops[d.id],cause=s.money<=0?"経営資金が尽きた":"客足の少ない月が続いた";
  s.closed=true;s.closedReason=cause;s.lastChange=cause+"ため閉店。";
  closures.push({id:d.id,name:d.name,reason:cause,month:state.month});
  remaining--;
 }
 return closures;
}
function openNewShops(state){
 const operating=SHOPS.filter(d=>state.shops[d.id].opened&&!state.shops[d.id].closed).length;
 if(operating>=5||state.month>=12)return [];
 const first=state.shops.curry.opened?"teishoku":"curry",start=first==="curry"?3:7;
 if(state.month<start)return [];
 const rng=random((state.seed+state.month*4007+(first==="curry"?197:911))>>>0);
 const chance=first==="curry"?.27:.14;
 if(rng()>chance&&!(first==="curry"&&state.month>=9))return [];
 const target=state.shops[first];target.opened=true;target.openedMonth=state.month;
 target.money=72;target.locals=49;target.visitors=32;target.slowMonths=0;
 const d=SHOPS.find(x=>x.id===first);
 return [{id:first,name:d.name,category:d.category,month:state.month,notice:d.name+"がオープンしました。昼休みの選択肢が一つ増えました。"}];
}
function advance(state,action){if(state.month>=12)throw Error("finished");if(!action||!state.shops[action.id]||!GENRES.some(x=>x.id===action.genre)||!Number.isInteger(action.star)||action.star<1||action.star>5)throw Error("invalid action");const next=copy(state),s=next.shops[action.id];if(s.closed)throw Error("closed store");const allBefore=Object.fromEntries(SHOPS.map(d=>[d.id,display(next.shops[d.id],d.id)])),before=allBefore[action.id],text=reviewText(next,action.id,action.star,action.genre),reply=replyFor(next,action.id,action.star,action.genre);const delta=(action.star-3)*2;
if(action.id!=="ramen")s.scores[action.genre]=clamp(s.scores[action.genre]+delta,-25,25);
if(action.id==="cake"&&action.genre==="identity"&&action.star>=4)s.scores.identity=clamp(s.scores.identity+2,-25,25);
if(action.id==="ramen")s.disputes=(s.disputes||0)+1;
s.money=clamp(s.money+(action.star-3)*5,-100,160);s.locals=clamp(s.locals+(action.star-3)*(action.genre==="price"?3:1.5),0,100);s.visitors=clamp(s.visitors+(action.star-3)*(action.genre==="identity"?3:1.5),0,100);s.stress=clamp(s.stress+(action.star<=2?11:action.star>=4?-3:1)+(action.genre==="service"&&action.star<=2?3:0),0,100);const rev={month:next.month+1,id:action.id,star:action.star,genre:action.genre,text,reply};s.history.push(rev);next.reviews.push(rev);next.month+=1;

let spillover=null;
if(action.id==="ramen"&&action.star<=2&&(action.genre==="service"||action.genre==="price")){
 const neighbor=next.shops.cafe;if(neighbor.opened&&!neighbor.closed){neighbor.locals=clamp(neighbor.locals+3,0,100);neighbor.money=clamp(neighbor.money+2,-100,160);spillover="麺処いわきから離れた客が喫茶こもれびで昼を過ごすようになった。";}
}else if(action.id==="cake"&&action.star>=4&&(action.genre==="taste"||action.genre==="mood")){
 const neighbor=next.shops.cafe;if(neighbor.opened&&!neighbor.closed){neighbor.visitors=clamp(neighbor.visitors+3,0,100);neighbor.money=clamp(neighbor.money+2,-100,160);spillover="ケーキ目当ての来訪者が、喫茶こもれびにも立ち寄っている。";}
}else if(action.id==="cafe"&&action.star>=4&&action.genre==="mood"){
 const neighbor=next.shops.ramen;if(neighbor.opened&&!neighbor.closed){neighbor.visitors=clamp(neighbor.visitors+2,0,100);neighbor.money=clamp(neighbor.money+1,-100,160);spillover="喫茶こもれびを訪れた人が、近くの麺処いわきにも足を延ばしている。";}
}
const playerAfter=display(s,action.id);
const npc=background(next,rev);const sns=social(next,rev);const viral=controversy(next,rev);
const closures=settleAndClose(next);const openings=openNewShops(next);
const after=display(s,action.id);s.stage=after.route.stage;s.route=after.route.genre?`${after.route.genre}:${after.route.polarity}`:null;
s.lastChange=after.summary;
const viewChanged=(a,b)=>a.open!==b.open||a.sign!==b.sign||a.route.label!==b.route.label||a.route.stage!==b.route.stage||a.feature!==b.feature||a.visual.product!==b.visual.product;
const playerChanged=viewChanged(before,playerAfter),npcChanged=npc?.id===action.id&&viewChanged(playerAfter,after);
const endChanged=viewChanged(before,after);
const cause=!endChanged&&playerChanged&&npcChanged?"offset":playerChanged&&npcChanged?"combined":npcChanged?"other":playerChanged?"player":"none";
const transition=before.open&&!after.open?`${before.base.name}は${s.closedReason||"経営上の理由"}ため閉店した。`:
cause==="other"?`あなたの投稿後、${npc.by}の口コミが入り、${after.summary}`:
cause==="combined"?`あなたの投稿に加え、${npc.by}の口コミが重なった。${after.summary}`:
cause==="offset"?`あなたの投稿後、${npc.by}の口コミが重なった。最終的な店構えは大きく変わらなかった。`:
before.route.label!==after.route.label||before.route.stage!==after.route.stage?`店舗が変化した：${after.summary}`:
before.feature!==after.feature?`店頭に変化があった：${after.feature}`:`大きな変化はなかった。${after.business}。`;
const affected=SHOPS.filter(d=>d.id!==action.id&&allBefore[d.id].open).map(d=>({id:d.id,before:allBefore[d.id],after:display(next.shops[d.id],d.id),reason:next.shops[d.id].closed?`${d.name}は${next.shops[d.id].closedReason}ため閉店。`:npc?.id===d.id?`${npc.by}の口コミを受け、店舗が変化した。`:"まちの動きを受け、店舗が変化した。"})).filter(x=>viewChanged(x.before,x.after));
const neighbor=spillover;
const result={review:rev,transition,before,after,playerAfter,cause,affected,npc,sns,viral,neighbor,closures,openings,month:next.month};
next.last=result;next.view="result";next.feed.push({month:next.month,kind:"player",...rev});if(npc)next.feed.push({month:next.month,kind:"npc",...npc});if(sns)next.feed.push({month:next.month,kind:"sns",...sns});if(viral)next.feed.push(viral);return next;}
function finish(state){if(state.month<12)throw Error("not finished");const ls=SHOPS.filter(d=>state.shops[d.id].opened).map(d=>({d,s:state.shops[d.id]}));const closed=ls.filter(x=>x.s.closed).length;const totalStages=ls.reduce((n,x)=>n+routeFor(x.s).stage,0);const local=ls.reduce((n,x)=>n+x.s.locals,0),vis=ls.reduce((n,x)=>n+x.s.visitors,0);
let title,description;
const ramen=state.shops.ramen,cake=state.shops.cake,cafe=state.shops.cafe;
const ramenRoute=routeFor(ramen),cakeRoute=routeFor(cake),cafeRoute=routeFor(cafe);
const ramenHardReviews=ramen.history.filter(h=>h.genre==="taste"&&h.star<=2).length;
const cakePraise=cake.history.filter(h=>h.genre==="identity"&&h.star>=4).length;
if(closed>=1){title="シャッターのある通り";description="一年で閉まった店もある。隣の店には、新しい看板が掛かった。";}
else if(ls.filter(x=>x.s.money<40).length>=2){title="踏ん張る商店街";description="値段も商品も見直した。売上が安定したとは言えないが、灯りは消えていない。";}
else if((state.viralCount||0)>=2&&ramen.history.filter(h=>h.star<=2).length>=3){title="返信欄が名物の商店街";description="店主の返信がネットで繰り返し話題になった。麺処いわきの味は変わらず、街に新しい客が訪れている。";}
else if((ramen.disputes||0)>=6&&ramen.history.filter(h=>h.star<=2).length>=3){title="論争の絶えない商店街";description="一年じゅう口コミで言い争った麺処いわき。看板も麺も変わらず、返信だけが積み重なった。";}
else if(cakePraise>=3&&cakeRoute.genre==="identity"&&cakeRoute.polarity==="plus"&&cakeRoute.stage>=3){title="新作が止まらない商店街";description="褒められるたび新商品が並ぶ。洋菓子店のショーケースは、もう昨年の面影がない。";}
else if(cafeRoute.genre==="mood"&&cafeRoute.polarity==="plus"&&cafeRoute.stage>=4){title="静かな時間の商店街";description="目立つ看板だけが商売ではない。静かな一杯を求めて、人が通う街になった。";}
else if(totalStages>=6&&vis>=local*0.72){title="よそから人が来る商店街";description="見慣れない客が増えた。新しい看板の下に、昔からの常連も座っている。";}
else if(totalStages>=7){title="看板が変わり続ける街";description="一年前の写真と見比べると、同じ通りとは思えない。それでも店主は変わらず店先に立つ。";}
else if(totalStages<=2){title="いつもの商店街";description="大きな改装は起きなかった。毎朝、いつもの時間にシャッターが開く。";}
else if(totalStages>=3&&local>vis*1.9&&vis<=100){title="常連のいる商店街";description="外からは静かに見える。でも、ここに来る理由を知っている人は多い。";}
else if(ls.filter(x=>routeFor(x.s).genre==="identity"&&routeFor(x.s).stage>=2).length>=2){title="個性の競演する通り";description="店ごとのこだわりが並ぶ。看板だけで好みが分かれそうだ。";}
else if(ls.filter(x=>routeFor(x.s).genre==="price"&&routeFor(x.s).stage>=2).length>=2){title="値札が話題の商店街";description="値段を見直した店が増えた。高いか安いかより、その理由が街の話題になった。";}
else if(ls.filter(x=>routeFor(x.s).genre==="taste"&&routeFor(x.s).stage>=2).length>=2){title="味が変わった商店街";description="変わらない味を守る店も、新しい味を試す店もある。一年で食の選択肢は変化した。";}
else if(totalStages>=4){title="それぞれ違う商店街";description="進んだ方向はばらばら。それでも店主たちは、ここで商売を続けている。";}
else{title="少し変わった商店街";description="一年で何もかもが変わったわけではない。でも新しい店も、閉じた店もあるかもしれない。";}
const shops=ls.map(({d,s})=>{const view=display(s,d.id),count=s.history.length,last=s.history[count-1],ownerLine=s.closed?
(d.id==="ramen"?"「鍋の火は止めました。それでも麺の話は、まだ終わっていません。」":d.id==="cafe"?"「この椅子に座っていた人のことは、忘れないと思います。」":d.id==="cake"?"「最後のお菓子だけは、ちゃんと焼き上げました。」":d.id==="curry"?"「最後の一皿も、丁寧に仕上げました。」":"「最後まで、焼き魚は丁寧に焼きました。」"):
count===0?"「口コミはいただきませんでしたが、今日も店を開けています。」":
d.id==="ramen"?"「星をいくつ付けようと自由です。でも麺も値段も、一年前から変えていません。」":view.route.stage===0?"「新しい看板はありません。けれど、毎日のお客さまはいます。」":
d.id==="ramen"?`「${view.visual.product}を看板にしました。納得できない方もいるでしょう。でも味は見てください。」`:
d.id==="cafe"?`「${view.visual.product}を始めました。昔からのお客さまも、新しい方も歓迎ですよ。」`:
d.id==="cake"?`「${view.visual.product}が人気です！ ただ、来年はまた違うものを作るかもしれません。」`:
d.id==="curry"?`「${view.visual.product}、今月のおすすめでした。次の出張でもぜひ寄ってください。」`:
`「${view.visual.product}、来月も小鉢を考えますね。」`;
return {id:d.id,name:d.name,owner:d.owner,sign:view.sign,icon:d.icon,stage:view.route.stage,route:view.route.label,closed:s.closed,ownerLine,product:view.visual.product,description:s.closed?`${d.owner}の店は閉まった。最後の口コミも、店先の貼り紙も残っている。`:view.route.stage?`${view.route.label}として営業中。${view.population}。`:`以前と変わらない看板で営業中。${view.population}。`,reviews:count};});
return {title,description,shops};}
function audit(state){
 if(!state||state.schema!==1||!Array.isArray(state.reviews)||state.month!==state.reviews.length||!state.shops)throw Error("invalid save");
 if(state.month<0||state.month>12)throw Error("invalid month");
 let available=0,opened=0;
 for(const d of SHOPS){
  const x=state.shops[d.id];
  if(!x||!x.scores||!Array.isArray(x.history)||!Number.isFinite(x.money)||typeof x.opened!=="boolean")throw Error("invalid shop");
  if(x.opened){opened++;if(!x.closed)available++;}
  if(!x.opened&&(x.closed||x.history.length))throw Error("future shop invalid");
  for(const g of GENRES)if(!Number.isFinite(x.scores[g.id]))throw Error("invalid scores");
 }
 if(opened>5||available===0)throw Error("no available shops");
 return true;
}
function counter(state,style){
 if(!["evidence","quip"].includes(style)||state.view!=="result"||!state.last||state.last.exchange)throw Error("unavailable reply");
 const next=copy(state),r=next.last,rev=r.review,s=next.shops[rev.id],genre=rev.genre,positive=rev.star>=4,negative=rev.star<=2;
 const topic=TOPICS[rev.id][genre],shop=SHOPS.find(d=>d.id===rev.id);
 const playerText=style==="evidence"?
 (negative?`実際に${topic}が気になったんです。もう一度、確かめてもらえませんか。`:positive?`褒めたのは本心です。${topic}を今後も大事にしてほしいです。`:`良いところも気になるところもある、と伝えたかったんです。`):
 (negative?"そんなに言い返す前に、まず口コミの星を見てもらえます？":positive?"褒めたのに反撃されるとは。星を減らした方がいいんですか？":"星3にここまで返事が来るとは思いませんでした。");
 let ownerText;
 if(rev.id==="ramen"){
  if(style==="evidence")ownerText=negative?"その根拠を読んでも、茹で時間は1秒も変えません。反論は以上です。":"根拠は読みました。では次回も同じ一杯を出すので、ご自身で確かめてください。";
  else ownerText=negative?"星が何個だろうと、麺の硬さは変えません。返信が欲しいなら何度でもどうぞ。":"星を減らしていただいて結構。私のレシピはそのままです。";
 }else if(rev.id==="cafe"){
  ownerText=style==="evidence"?"そういうことでしたか。書き言葉では、細かい温度が伝わらないものですね。参考にします。":"あら、言い合いになるつもりはなかったのに。次は店で一杯飲みながら、どうでしょう。";
 }else if(rev.id==="cake"){
  ownerText=style==="evidence"?"なるほど、そういう意味だったんですね！ 次の試作メモに書き足しました。":"すみません、熱くなってしまいました！ でも次の商品、もう考えています。";
 }else{
  ownerText=style==="evidence"?"分かりました。辛さや量を、もう一度確かめてみます。":"こちらも熱くなりそうです。お客さんの一言はスパイスですね。";
 }
 s.stress=clamp(s.stress+(style==="quip"?9:negative?2:-2),0,100);if(rev.id==="ramen")s.disputes=(s.disputes||0)+1;
 s.visitors=clamp(s.visitors+(style==="quip"?2:0),0,100);
 const exchange={style,playerText,ownerText,shop:shop.name};
 r.exchange=exchange;
 rev.exchange=copy(exchange);
 const hist=s.history.find(h=>h.month===rev.month&&h.id===rev.id&&h.genre===rev.genre);
 if(hist)hist.exchange=copy(exchange);
 const index=next.reviews.findIndex(h=>h.month===rev.month&&h.id===rev.id);
 if(index>=0)next.reviews[index].exchange=copy(exchange);
 next.feed.push({month:next.month,kind:"exchange",id:rev.id,text:playerText,ownerReply:ownerText});
 return next;
}
return {VERSION,GENRES,MONTHS,SHOPS,PATHS,TOPICS,createState,routeFor,display,reviewText,replyFor,publicReviews,advance,counter,finish,audit};
})();
