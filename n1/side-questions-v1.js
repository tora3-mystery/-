/*
 * N1 short incidental-number question bank.
 * Fictional quantities: every invented census/attendance/vote count is explicitly
 * part of the game's fictional setting, NEVER an official public statistic.
 * The four recurring main-story questions remain managed by scenario-v04.js.
 */
(function(root){
'use strict';
const SIDE_IDS=Object.freeze([0,2,3,4,5,9]);
const f=(id,theme,person,slot,opening,speech,context,truth,unit,mode,zone,scale,recap,good,low,high,detail='',min=0,max=null)=>({
 id,theme,person,slot,opening,speech,context,truth,unit,
 mode,zone,scale,recap,good,low,high,detail,
 min,max:max??Math.max(truth*4,100),type:'count'
});
const FACTORIES=[
 function population(v,extra){
  const town=['架空の桜丘市','架空の港ヶ丘町','架空の月見野市'][v],truth=[46800,72300,38500][v]+extra*200;
  return f('pop-'+v,'population','keisuke','町の人口',
   '圭介が街歩きのパンフレットを広げた。',
   'この町、だいたい何人くらいが暮らしてると思う？',
   town+'の人口について雑談している。駅前はにぎやかだが、郊外には住宅地が広がる。市の資料をいま見ることはできない。',
   truth,'人','estimate',[truth-3000,truth+3000],3000,
   '圭介と架空の町の規模について話した。','そのくらいの規模感だと思う。街を見る目が変わるね。',
   'ちょっと小さく見積もったね。郊外も広いんだよ。','それだと大都市になっちゃう。駅前だけで判断できないな。',
   'この街と人口はゲーム内の架空設定。実在の自治体の人口統計ではない。',1000,300000);
 },
 function survey(v,extra){
  const total=[100,200,100][v], yes=[62,126,47][v]+extra*(v===1?2:1),truth=Math.round(100*yes/total);
  return f('survey-'+v,'ratio','arai','アンケート結果',
  '社内アンケートをまとめた新井が、集計表を見せてくれた。',
  '賛成は全体の何パーセントでしたっけ？ 四捨五入して答えてください。',
  '回答'+total+'人、そのうち賛成'+yes+'人。母数は回答者のみ。',
  truth,'%','facts',[truth,truth],1,'新井とアンケートの賛成率を計算した。',
  '計算が合ってます。あとはこの数字をどう説明するかですね。',
  'もう少し賛成が多かったです。','もう少し賛成が少なかったです。',
  '賛成者数÷回答者数×100を四捨五入。架空の社内調査。',0,100);
 },
 function headcount(v,extra){
  const first=[31,42,28][v]+extra,second=[25,33,36][v]+extra,outs=[3,5,4][v],truth=first+second-outs;
  return f('heads-'+v,'count','hina','参加者数',
  '陽菜が2会場を使った研修の出席を確認している。',
  '最終的に研修に残っていたのは何人ですか？',
  'A会場'+first+'人、B会場'+second+'人。途中退席は合計'+outs+'人で、重複登録はない。',
  truth,'人','facts',[truth,truth],2,'陽菜の研修出席者を数えた。',
  '名簿と一致しました。これで報告できます！','もう少し参加者がいました。','途中退席の人数も引きましたか？',
  '2会場合計から途中退席者を引く。架空の研修。',0,300);
 },
 function stock(v,extra){
  const old=[42,75,63][v]+extra*2,arrival=[20,30,25][v]+extra*3,used=[17,28,19][v],truth=old+arrival-used;
  return f('stock-'+v,'stock','fujino','在庫数',
  '藤野さんが倉庫の棚を眺めて、メモを取り直している。',
  'いま残っている備品は何個でしょう？',
  '朝の在庫'+old+'個、今日の納品'+arrival+'個、使用済み'+used+'個。',
  truth,'個','facts',[truth,truth],2,'藤野さんと倉庫の在庫を照合した。',
  '合っています。棚卸しが終わります。','記録上はもう少し残っています。','使用済みの分は戻ってきませんよ。',
  '在庫＋納品−使用。架空の事務所。',0,400);
 },
 function attendance(v,extra){
  const truth=[32,56,78][v]+extra*2, seats=[36,60,84][v]+extra*2;
  return f('attend-'+v,'attendance','hina','来場予想',
  '陽菜が社内イベントの会場準備を任されている。',
  '当日の参加人数、何人くらいを想定して席を確保します？',
  '会議室は最大'+seats+'席。申し込み状況から、ほぼ満席になる見込み。',
  truth,'人','estimate',[truth,Math.min(seats,truth+4)],3,
  '陽菜とイベントの席数を見積もった。','それなら立ち見も出さずにすみそうです。',
  '少ないと立ってもらうことになりそうです。','用意できる席数には限りがあります。',
  '社内イベントは架空設定。準備数は予想参加者より少し多めが安心。',0,200);
 },
 function length(v,extra){
  const one=[750,1100,950][v]+extra*50,two=[420,630,380][v]+extra*20,truth=one+two;
  return f('walk-'+v,'distance','keisuke','散歩道の距離',
  '圭介が街歩きの案内板を見つけた。',
  '駅から公園まで寄り道すると、全部で何メートル？',
  '駅→図書館が'+one+'m、図書館→公園が'+two+'m。寄り道はこの2区間だけ。',
  truth,'m','facts',[truth,truth],100,'圭介と散歩の距離を足し算した。',
  'その距離なら、ちょっと歩くにはちょうどいいね。',
  'もう少し歩くことになるよ。','遠回りしすぎ。公園が遠くなっちゃうよ。',
  '案内板は架空設定。2区間の合計距離。',0,8000);
 },
 function ballots(v,extra){
  const red=[87,102,95][v]+extra*3,blue=[94,116,121][v]+extra*2,invalid=[4,7,5][v],truth=red+blue+invalid;
  return f('ballot-'+v,'votes','makabe','投票総数',
  '真壁先輩が社内イベントの企画投票を集計している。',
  '投票用紙は全部で何枚集まった？',
  '企画A'+red+'票、企画B'+blue+'票、無効票'+invalid+'票。未回収は含まない。',
  truth,'票','facts',[truth,truth],5,'真壁先輩のイベント投票を集計した。',
  '集計は正確ね。結果の発表は私からするわ。',
  '無効票も数えた？','その数字だと、投票してない人まで数えてない？',
  '企画投票は架空設定。無効票も投票用紙の枚数に含める。',0,1000);
 },
 function occupancy(v,extra){
  const seats=[24,48,36][v]+extra*2,truth=seats+3;
  return f('occupancy-'+v,'seats','shoji','必要な椅子',
  '庄司さんが取引先との会議室の手配をしている。',
  '椅子は何脚くらい手配しておけばよさそうですか？',
  '参加予定は約'+seats+'人。予備は多少必要ですが、部屋を狭くしすぎたくありません。',
  truth,'脚','estimate',[seats+1,seats+5],3,'庄司さんと会議室の椅子を準備した。',
  'その数なら安心です。準備する側の気持ちも分かりますね。',
  '予備が足りないかもしれません。','部屋が椅子だらけになりそうです。',
  '会議は架空設定。見積もりの推奨帯は参加予定数＋1〜5脚。',0,200);
 },
 function stairs(v,extra){
  const floors=[7,11,6][v]+extra,per=[18,20,16][v],truth=(floors-1)*per;
  return f('stairs-'+v,'stairs','rika','階段の段数',
  '梨花がエレベーターの点検中に階段を上がろうとしている。',
  '1階から'+floors+'階まで階段で上がると、何段？',
  '1フロア上がるのに'+per+'段。出発は1階、到着は'+floors+'階。',
  truth,'段','facts',[truth,truth],6,'梨花の階段の段数を数えた。',
  'うん、それだけ上がった。帰りはエレベーターがいい。',
  'フロアの移動回数を確認して。','それ、何階分も余計に登ってない？',
  '1階からN階はN−1フロア分。架空のビル。',0,1000);
 },
 function visitors(v,extra){
  const truth=[360,480,275][v]+extra*10;
  return f('visitors-'+v,'visitors','umeda','来場者数の予想',
  '梅田が週末のフリーマーケットの規模について話している。',
  'このイベント、何人くらい来ると思う？',
  '前回の来場者は約'+Math.round(truth/100)*100+'人。今回は同程度の天気で、出店もほぼ同じ。',
  truth,'人','estimate',[Math.round(truth/100)*100-70,Math.round(truth/100)*100+40],40,'梅田とフリーマーケットの来場者を予想した。',
  'そのくらい来るよね。今度は早めに行こう。',
  'もっとにぎわうと思うよ。','そこまで大きいイベントだったっけ？',
  'イベントと来場者は架空設定。前回のおおよその規模から予想する。',0,5000);
 },
 function books(v,extra){
  const a=[42,60,38][v]+extra,b=[33,25,47][v]+extra,returns=[15,22,17][v],truth=a+b-returns;
  return f('books-'+v,'books','souma','貸出冊数',
  '相馬さんが地域図書室の週末イベントを手伝っている。',
  'いま貸出中の本は何冊ですかね？',
  '昨日貸出'+a+'冊、今日新規貸出'+b+'冊、返却'+returns+'冊。集計対象はこの2日間のみ。',
  truth,'冊','facts',[truth,truth],3,'相馬さんと図書室の貸出冊数を数えた。',
  'ありがとうございます。返却分を引くの、忘れがちですよね。',
  'もう少し多く残っています。','返却された本は棚に戻っていますよ。',
  '架空の地域図書室の集計。',0,1000);
 },
 function percentage(v,extra){
  const total=[80,120,200][v],delivered=[48,72,130][v]+extra*(v===0?4:v===1?6:10),truth=Math.round(100*delivered/total);
  return f('progress-'+v,'progress','arai','作業の進捗率',
  '新井がチームの進捗表を見ながら声をかけてきた。',
  '完了率は何パーセントです？ 四捨五入で。',
  '全'+total+'件中、完了'+delivered+'件。未完了はまだ数えない。',
  truth,'%','facts',[truth,truth],1,'新井の業務進捗を集計した。',
  '完了率はそれで合っています。次は残りの分ですね。',
  'もう少し進んでいます。','まだ完了していないものも含めていませんか？',
  '架空の社内作業。完了件数÷全件数×100。',0,100);
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
 nr.opening=q.day+'。'+scene.opening;
 nr.cardType='none';
 nr.source=null;
 nr.factDate=null;
 nr.emoji='🔢';
 nr.imageKey=null;
 nr.productId=null;
 nr.situationType=null;
 nr.micro=true;
 nr.publicDetail='';
 nr.spec='';
 nr.detail='';
 nr.resultDetail=scene.detail;
 nr.explain=scene.detail;
 nr.hint='';
 nr.min=scene.min;
 nr.max=scene.max;
 if(!(nr.min<=nr.truth&&nr.truth<=nr.max&&nr.zone[0]<=nr.zone[1]&&nr.zone[0]>=nr.min&&nr.zone[1]<=nr.max))
   throw new Error('Incoherent numeric range: '+scene.id);
 return nr;
}
const API=Object.freeze({VERSION:'1.0.0',SIDE_IDS,FACTORY_COUNT:FACTORIES.length,CANONICAL_VARIANTS:FACTORIES.length*3,draw,applyToQuestion});
root.N1SideQuestions=API;
if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof window!=='undefined'?window:globalThis);
