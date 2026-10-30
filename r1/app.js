(() => {
"use strict";
const E=window.R1;
if(!E){document.getElementById("gameRoot").textContent="ゲームの読み込みに失敗しました。ページを再読込してください。";return}
const KEY="r1-machikado-v1";
const root=document.getElementById("gameRoot");
let game,selectedId=null,dinedId=null,selectedStar=null,selectedGenre=null,dineModal=false,tab="street",notification="";
const esc=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dshop=id=>E.SHOPS.find(x=>x.id===id);
const dgenre=id=>E.GENRES.find(x=>x.id===id);
function newGame(){const state=E.createState(Date.now()>>>0);state.introSeen=false;return state}
function load(){
 try{const raw=localStorage.getItem(KEY);if(raw){const s=JSON.parse(raw);if(s.version===E.VERSION){E.audit(s);return s;}if(["0.1.0-alpha","0.2.0-alpha","0.3.0-alpha","0.3.1-alpha","0.3.2-alpha","0.4.0-alpha","0.4.1-alpha","0.5.0-alpha","0.6.0-alpha","0.7.0-alpha","0.8.0-alpha","0.9.0-alpha","0.9.1-alpha","0.9.2-alpha","0.9.3-alpha","0.9.4-alpha","0.9.5-alpha","0.9.6-alpha","0.9.7-alpha"].includes(s.version)){
 if(["0.1.0-alpha","0.2.0-alpha","0.3.0-alpha","0.3.1-alpha","0.3.2-alpha","0.4.0-alpha"].includes(s.version)){
 const ramen=s.shops.ramen;
 ramen.scores=Object.fromEntries(E.GENRES.map(g=>[g.id,0]));
 ramen.hardening=false;ramen.stage=0;ramen.route=null;ramen.closed=false;
 ramen.money=Math.max(1,ramen.money);
 ramen.disputes=ramen.history.length+ramen.history.filter(h=>h.exchange).length;
 ramen.lastChange="看板も硬麺も変わらず営業中。";
 if(s.view==="result"&&s.last?.review.id==="ramen")s.view="map";
 }
 if(!s.shops.curry)s.shops.curry=E.createState(s.seed).shops.curry;
 if(!Number.isFinite(s.viralCount))s.viralCount=0;
 if(!Number.isFinite(s.lastViralMonth))s.lastViralMonth=-10;
 if(!s.shops.teishoku)s.shops.teishoku=E.createState(s.seed).shops.teishoku;
 const template=E.createState(s.seed);
 for(const d of E.SHOPS)if(!s.shops[d.id]){
  s.shops[d.id]=template.shops[d.id];
  s.shops[d.id].opened=false;s.shops[d.id].openedMonth=null;
 }
 for(const d of E.SHOPS){const x=s.shops[d.id];if(typeof x.opened!=="boolean")x.opened=d.id!=="teishoku";if(x.opened&&x.openedMonth==null)x.openedMonth=0;if(!x.opened)x.openedMonth=null;if(!Number.isFinite(x.slowMonths))x.slowMonths=0;if(!("closedReason" in x))x.closedReason=x.closed?"閉店":null;}
 const allocated=new Set();
 const existing=E.SHOPS.filter(d=>s.shops[d.id].opened);
 s.shops.ramen.lot=1;allocated.add(1);
 for(const d of existing.filter(d=>d.id!=="ramen"&&Number.isInteger(s.shops[d.id].lot)&&s.shops[d.id].lot>=2&&s.shops[d.id].lot<=5))allocated.add(s.shops[d.id].lot);
 for(const d of existing.filter(d=>d.id!=="ramen"&&!Number.isInteger(s.shops[d.id].lot))){
  const lot=[2,3,4,5].find(q=>!allocated.has(q))||5;s.shops[d.id].lot=lot;allocated.add(lot);
 }
 for(const d of E.SHOPS){const x=s.shops[d.id];if(!x.opened)x.lot=null;if(typeof x.reborn!=="boolean")x.reborn=false;}
 if(!Number.isFinite(s.ramenReturnMonth))s.ramenReturnMonth=null;
 if(typeof s.ramenFinalSilent!=="boolean")s.ramenFinalSilent=false;
 if(typeof s.ramenReborn!=="boolean")s.ramenReborn=!!s.shops.ramen.reborn;
 s.version=E.VERSION;E.audit(s);return s;
}}}
 catch(err){console.warn("R1 save reset:",err)}
 return newGame();
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(game))}catch(err){console.warn("R1 saving unavailable:",err)}}
game=load();let onboarding=game.introSeen===false;save();
function scrollTop(){window.scrollTo({top:0,behavior:"auto"})}
function pill(tone,text){return '<span class="chip '+(tone||"")+'">'+esc(text)+'</span>'}
const ART_ROOT="./assets/production_c_20261030/";
const STAGE4_ART=new Set(["bakery_mood_plus","bakery_service_minus","burger_mood_plus","burger_service_minus","cafe_identity_minus","cafe_mood_plus","cake_mood_plus","cake_service_minus","chinese_mood_plus","chinese_service_minus","curry_identity_plus","curry_mood_minus","fish_price_minus","fish_taste_plus","onigiri_mood_minus","onigiri_taste_plus","pasta_identity_plus","pasta_price_minus","sandwich_mood_plus","sandwich_service_minus","soba_mood_plus","soba_price_minus","teishoku_mood_plus","teishoku_price_minus","udon_service_minus","udon_taste_plus","veggie_mood_plus","veggie_price_minus"]);
const ownerArt=id=>ART_ROOT+"owners/"+id+".webp";
const foodArt=id=>ART_ROOT+"items/"+id+".webp";
function storefrontArt(v){
 const id=v.base.id,route=v.route||{};
 if(id==="ramen"&&!v.open)return ART_ROOT+"special/ramen_closed.webp";
 if(id==="ramen"&&v.open&&v.phase==="拡張本店")return ART_ROOT+"special/ramen_giant.webp";
 const routeKey=[id,route.genre,route.polarity].join("_");
 if(v.open&&route.stage===4&&STAGE4_ART.has(routeKey))return ART_ROOT+"evolutions/"+routeKey+"_stage4.webp";
 return ART_ROOT+"shops/"+id+"_base.webp";
}
function storyClue(id){
 if(id==="ramen")return game.viralCount>=1?
 "商店街の噂：「あの店は口コミで言い合うほど注目される。反論を面白がる人も、硬い麺だけは認める人もいるらしい。閉めても惜しむ客はいるんじゃないか」":
 "商店街の噂：「愛想はよくないけれど、何度も来るお客の注文だけは黙って覚えているそうだよ」";
 if(id==="cafe")return "窓際の小さな札には「静かに本を読みたい方へ」。店主は、落ち着けたという感想を大切にしているらしい。";
 if(id==="cake")return "新作棚のそばに「面白いと思ったお菓子を教えてください」と手書きのメモがある。";
 return "";
}
function storefront(v){
 const stage=v.route.stage,closed=!v.open,visual=v.visual||{icon:v.base.icon,product:v.base.product,tagline:"いつもの味",variety:0};
 const featureLabel={taste:"味・メニュー",service:"注文・接客",price:"価格・セット",mood:"店内・客席",identity:"店のこだわり"}[v.route.genre]||"看板の商品";
 const artwork=storefrontArt(v),covered=stage===4&&STAGE4_ART.has([v.base.id,v.route.genre,v.route.polarity].join("_"));
 const merch=closed?"":'<div class="store-merch"><span class="merch-icon" aria-hidden="true">'+esc(visual.icon)+'</span><span class="merch-label"><strong>'+esc(visual.product)+'</strong><span>'+esc(stage>0?featureLabel:"看板の商品")+'</span></span></div>';
 const feature=(!closed&&stage>0)?'<div class="store-feature">'+esc(v.feature)+'</div>':"";
 const classname="storefront has-art "+esc(v.base.palette)+" stage-"+stage+" route-"+(v.route.genre||"base")+" dir-"+(v.route.polarity||"none")+(closed?" closed":"")+(v.phase==="拡張本店"?" ramen-giant":"")+(covered?" illustrated-evolution":stage>0?" text-evolution":"");
 return '<div class="'+classname+'" role="img" aria-label="'+esc(v.base.name+"。"+v.summary+" "+(v.feature||""))+'">'+
  '<img class="storefront-picture" src="'+esc(artwork)+'" alt="" loading="lazy" decoding="async">'+
  '<div class="sign">'+esc(closed?"閉店しました":v.sign)+'</div>'+merch+feature+
  '<span class="stage-tag">'+esc(closed?"CLOSED":stage===0?"営業中":stage===1?"店頭改装":stage===2?"新看板":stage===3?"新装":"大改装")+'</span></div>';
}
function shopCard(d){
 const v=E.display(game.shops[d.id],d.id),pub=E.publicReviews(game,d.id),mine=game.reviews.filter(x=>x.id===d.id),all=[...pub,...mine],rating=all.length?(all.reduce((t,x)=>t+x.star,0)/all.length).toFixed(1):null;
 return '<button type="button" class="shop-card '+(d.id===selectedId?"selected":"")+(game.shops[d.id].closed?" closed-card":"")+'" data-shop="'+d.id+'" aria-pressed="'+(d.id===selectedId)+'">'+
 storefront(v)+'<span class="card-copy"><span class="small">'+esc(d.category)+' ／ '+esc((game.shops[d.id].lot||'?')+'番地')+' ／ '+(game.shops[d.id].closed?"閉店":(rating?("★"+rating+"（"+all.length+"件）"):"口コミなし"))+'</span><strong>'+esc(d.name)+'</strong>'+
 '<span class="summary">'+esc(v.summary)+'</span><span class="tap">口コミを確認する　›</span></span></button>';
}
function replySnippet(id,reply,fromOwner="店主からの返信"){
 return reply?'<div class="reply"><strong>'+esc(fromOwner)+'</strong><p>「'+esc(reply)+'」</p></div>':'<div class="reply-absent">この口コミには、店主からの返信がありません。</div>';
}
function recentFeed(id){
 const all=E.publicReviews(game,id),items=all.slice(-12).reverse();
 return '<section class="public-reviews" aria-label="来店者の口コミ"><h3>お客さまの口コミ（'+all.length+'件）</h3><p class="section-intro">毎月口コミが増える店も、増えない店もあります。店主から返信がないこともあります。</p>'+
 (items.length?items.map(f=>'<article class="public-review"><div class="meta">'+esc(f.by)+'　'+esc("★".repeat(f.star))+' ／ '+esc(dgenre(f.genre).name)+(f.archived?'　以前の投稿':f.month?'　'+esc(E.MONTHS[f.month-1]):'')+'</div><p>'+esc(f.text)+'</p>'+
 replySnippet(id,f.reply)+'</article>').join(""):'<p class="no-shop-reviews">オープンしたばかりで、口コミはまだありません。</p>')+
 (all.length>items.length?'<p class="section-intro">直近'+items.length+'件を表示しています。</p>':"")+'</section>';
}
function reviewForm(id){
 if(game.shops[id].closed)return '<div class="note">現在、この店は閉店しています。別のお店を選んでください。</div>';
 return '<div class="dine-cta"><p>口コミを読んで、今日のお店を決めましたか？</p><button type="button" class="primary" data-dine="'+id+'">'+(id==="cake"?"食後のおやつを買う":"この店でランチを食べる")+'　→</button></div>';
}
function dineDialog(){
 if(!dineModal||!selectedId||game.shops[selectedId].closed)return "";
 const id=selectedId,d=dshop(id),notes=E.lunchImpressions(game,id);
 const genres=E.GENRES.map(g=>'<button type="button" class="genre '+(selectedGenre===g.id?"selected":"")+'" data-genre="'+g.id+'" aria-pressed="'+(selectedGenre===g.id)+'">'+g.icon+' '+esc(g.name)+'</button>').join("");
 const stars=Array.from({length:5},(_,i)=>i+1).map(x=>'<button type="button" class="star '+(selectedStar===x?"selected":"")+'" data-star="'+x+'" aria-label="星'+x+'" aria-pressed="'+(selectedStar===x)+'">★'+x+'</button>').join("");
 const valid=selectedGenre!==null&&selectedStar!==null;
 let preview="";
 if(valid){try{preview=E.reviewText(game,id,selectedStar,selectedGenre)}catch(err){preview="口コミの作成に失敗しました。"}}
 return '<div class="dine-overlay"><button type="button" class="dialog-backdrop" data-modal-close aria-label="投稿を取り消してお店に戻る"></button>'+
 '<section class="dine-dialog" role="dialog" aria-modal="true" aria-labelledby="dineTitle" tabindex="-1">'+
 '<div class="dialog-heading"><div><span class="eyebrow">今日のランチを食べ終えました</span><h2 id="dineTitle">'+esc(d.name)+'の口コミ</h2></div><button type="button" class="dialog-close secondary" data-modal-close aria-label="閉じる">×</button></div>'+
 '<section class="observation-panel" aria-label="食後の観察メモ"><span class="eyebrow">食べてみた感想</span><h3>'+esc(d.name)+'で気づいたこと</h3><p class="section-intro">あなたが感じたこと。良し悪しの評価は自分で決めてください。</p><div class="observation-grid">'+
 [['🍽️ 味・商品',notes.food],['💬 接客',notes.service],['🪑 店の雰囲気',notes.mood],['💰 価格',notes.price]].map(x=>'<article><strong>'+esc(x[0])+'</strong><p>'+esc(x[1])+'</p></article>').join("")+'</div>'+
 (notes.change?'<p class="observation-change">'+esc(notes.change)+'</p>':"")+'</section>'+
 '<div class="label-row"><strong>① 口コミのジャンルを選ぶ</strong><small>どこを評価しますか？</small></div><div class="genres" role="group" aria-label="口コミジャンル">'+genres+'</div>'+
 '<div class="label-row"><strong>② 星の数を選ぶ</strong><small>悪い ★1 ─ ★5 良い</small></div><div class="stars" role="group" aria-label="星評価">'+stars+'</div>'+
 '<div class="preview"><span class="kicker">投稿前のプレビュー'+(valid?'　★'+selectedStar+' ／ '+esc(dgenre(selectedGenre).name):'')+'</span><p>'+esc(valid?preview:"ジャンルと星の数を選ぶと、投稿内容を確認できます。")+'</p></div>'+
 '<button type="button" class="primary dialog-post" data-post '+(valid?"":"disabled")+'>'+esc(E.MONTHS[game.month])+'の口コミを投稿する</button>'+
 '<p class="note">投稿後は店主からの返信を確認できます。投稿内容は取り消せません。</p></section></div>';
}
function detail(id){
 const d=dshop(id),s=game.shops[id],v=E.display(s,id);
 const last=s.history.length?s.history[s.history.length-1]:null;
 return '<section class="panel" id="shopDetail"><div class="detail-header"><div><span class="eyebrow">お店のページ</span><h2>'+esc(d.name)+'</h2><p class="subtitle">'+esc(d.category)+' ／ '+(v.route.stage>0?'店頭の注目：':'')+esc(v.visual?v.visual.product:d.product)+'</p></div><span class="summary-badge">'+esc(v.business)+'</span></div>'+
 '<div class="shop-meta">'+pill('',(s.lot||'?')+'番地')+pill(v.closed?"bad":"good",v.business)+pill("",v.population)+(v.route.label?pill("",v.route.label):pill("","創業時の看板"))+'</div>'+
 '<div class="owner-box"><img class="owner-portrait" src="'+esc(ownerArt(id))+'" alt="'+esc(d.owner)+'のイラスト" loading="lazy" decoding="async"><div><strong>店主：'+esc(d.owner)+'（'+d.age+'）</strong><p>'+esc(d.description)+'</p></div></div>'+
 '<div class="featured-item"><img src="'+esc(foodArt(id))+'" alt="'+esc(d.product)+'のイラスト" loading="lazy" decoding="async"><div><strong>'+esc(v.route.stage>0?"開業時の看板メニュー":"看板の商品")+'</strong><p>'+esc(d.product)+'</p>'+(v.route.stage>0?'<small>現在の店頭：'+esc(v.visual.product)+'</small>':"")+'</div></div>'+
 (storyClue(id)?'<p class="shop-clue">'+esc(storyClue(id))+'</p>':"")+
 '<div class="note">'+esc(v.summary)+'</div>'+recentFeed(id)+
 (last?'<div class="recent"><h3>あなたの前回の投稿</h3>'+replySnippet(id,last.reply,d.owner+'からの返信')+'</div>':'')+reviewForm(id)+'</section>';
}
function tutorial(){
 const preview=E.SHOPS.find(d=>d.id!=="ramen"&&game.shops[d.id].opened),base=E.createState(game.seed);base.shops[preview.id].opened=true;base.shops[preview.id].openedMonth=0;const before=E.display(base.shops[preview.id],preview.id);
 base.shops[preview.id].scores.identity=16;base.shops[preview.id].history=[{id:preview.id,genre:"identity",star:5,month:1}];
 const after=E.display(base.shops[preview.id],preview.id);
 return '<section class="tutorial" aria-labelledby="tutorialTitle"><div class="tutorial-hero"><span class="eyebrow">出張先での昼休み</span>'+
 '<h2 id="tutorialTitle">毎月この街に、<br>出張でやって来る。</h2><p>昼休みは1時間。今日はどこに入ろう？ 評判の良い店も、気になる返信をする店もあります。</p></div>'+
 '<div class="business-story"><strong>📍 今月も、この商店街でランチ。</strong><p>まずは口コミを読んで、行くお店を選びましょう。食後はあなたも感想を投稿できます。</p></div>'+
 '<div class="tutorial-steps"><article><strong>① 口コミを読む</strong><p>最初は3店舗から昼食先を選びます。途中で新しいお店が開店することもあります。</p></article>'+
 '<article><strong>② お店で食べる</strong><p>行き先を決めます。店によっては食後のおやつを選べます。</p></article>'+
 '<article><strong>③ 返信を確認する</strong><p>ジャンルと星を選んで投稿。店主に返すか決めてから、翌月の街の変化を見ます。</p></article></div>'+
 '<div class="tutorial-comparison"><p class="eyebrow">口コミが積み重なった店では……</p><div class="result-views"><div><small>以前の店構え</small>'+storefront(before)+'</div><div class="after-spotlight"><small>後日の店構え</small>'+storefront(after)+'</div></div></div>'+
 '<div class="tutorial-end"><strong>4月から翌3月まで、月に1回・全12回の出張。</strong><p>同じ店を選んでも、違う店を開拓しても自由です。</p><button type="button" class="primary start-game" data-begin>4月の出張へ　→</button></div></section>';
}
function street(){
 const listed=E.SHOPS.filter(x=>game.shops[x.id].opened),all=listed.map(shopCard).join(""),openCount=listed.filter(x=>!game.shops[x.id].closed).length;
 const feed=game.feed.filter(x=>x.kind==="sns"||x.kind==="viral"||x.kind==="lifecycle"||x.kind==="rumor").slice(-5).reverse();
 const lot2Vacant=E.SHOPS.some(d=>game.shops[d.id].opened&&game.shops[d.id].closed&&game.shops[d.id].lot===2)&&
  !E.SHOPS.some(d=>game.shops[d.id].opened&&!game.shops[d.id].closed&&game.shops[d.id].lot===2);
 const vacantCard=lot2Vacant?'<aside class="lot-vacancy"><img src="'+ART_ROOT+'special/lot2_vacant.webp" alt="看板の跡が残る2番地の空き店舗" loading="lazy" decoding="async"><p>2番地には、前の店の看板跡だけが残っている。</p></aside>':"";
 const recentNpcs=game.last&&game.last.month===game.month?(game.last.npcs||[]):[];
 const changes=game.last&&game.last.month===game.month?
 [...(game.last.openings||[]).map(x=>'<div class="shop-announcement new"><strong>'+(x.comeback?'🏢 おかえりなさい':'🎉 NEW OPEN')+'　'+esc(x.name)+'</strong><p>'+esc(x.notice)+'</p></div>'),
 ...(game.last.closures||[]).map(x=>'<div class="shop-announcement ended"><strong>閉店のお知らせ　'+esc(x.name)+'（'+esc((x.lot||"?")+'番地')+'）</strong><p>'+esc(x.reason)+'ため営業終了。以前の口コミは引き続き確認できます。</p></div>')].join(""):"";
 return '<div class="layout"><div><section class="travel-head"><span class="eyebrow">'+esc(E.MONTHS[Math.min(game.month,11)])+' ／ 出張先の昼休み</span><h2>今日のランチ、どこにしよう？</h2><p>口コミを読んで店を選び、食べた後で評価しましょう。</p></section>'+
 '<p class="shop-count">本日の営業店舗：'+openCount+'店</p>'+vacantCard+changes+'<div class="street-list">'+all+'</div><section class="feed-list"><h2>商店街の話題</h2>'+
 (feed.length?feed.map(f=>'<div class="feed-card '+(f.kind==="viral"?"viral-list":f.kind==="rumor"?"lot-rumor":"")+'"><div class="meta">'+esc(f.kind==="lifecycle"?"商店街のお知らせ":f.kind==="rumor"?"商店街の噂":"つぶやき広場")+' ／ '+esc(E.MONTHS[f.month-1])+'</div><p class="body">'+esc(f.text)+'</p></div>').join(""):'<p class="section-intro">今日も昼休みの商店街。店の評判を見てみましょう。</p>')+'</section>'+
 (recentNpcs.length?'<section class="feed-list neighborhood-reviews"><h2>まちの反応・ほかのお客さんの口コミ</h2><p class="section-intro">先月届いた'+recentNpcs.length+'件のうち、最大8件を表示。全件は各店舗と履歴でも確認できます。</p>'+recentNpcs.slice(0,8).map(n=>'<article class="feed-card"><div class="meta">'+esc(n.by)+' ／ '+esc(dshop(n.id).name)+'　★'+n.star+'</div><p class="body">'+esc(n.text)+'</p>'+replySnippet(n.id,n.reply,dshop(n.id).owner+"からの返信")+'</article>').join("")+'</section>':"")+'</div>'+
 (selectedId?detail(selectedId):'<aside class="panel choice-placeholder"><h2>口コミからお店を選ぶ</h2><p>お店のカードを選ぶと、過去の口コミと店主の返信を確認できます。</p></aside>')+'</div>';
}
function reviewThread(){
 const r=game.last;if(!r)return street();
 const d=dshop(r.review.id),y=r.review;
 const initial=y.reply?'<div class="owner-reply owner-arrives thread-reveal '+(d.id==="ramen"?"ramen-argument":"")+'"><span class="name">'+esc(d.owner)+'　店主より</span><p>「'+esc(y.reply)+'」</p></div>':
 '<p class="reply-absent owner-arrives thread-reveal">店主からの返信はありません。口コミはそのまま残ります。</p>';
 let follow="";
 if(r.exchange){
  follow='<div class="reply-thread" id="exchangeArea"><div class="thread-player thread-reveal player-arrives"><span>あなたから追記</span><p>'+esc(r.exchange.playerText)+'</p></div>'+
  (r.exchange.ownerText?'<div class="thread-owner thread-reveal owner-returns"><span>'+esc(d.owner)+'から再返信</span><p>「'+esc(r.exchange.ownerText)+'」</p></div>':'<p class="reply-absent thread-reveal owner-returns">店主から追加の返信はありません。</p>')+'</div>';
 }else if(r.declined){
  follow='<div class="reply-absent thread-decision">返信せずにやり取りを終えました。</div>';
 }else if(y.reply){
  follow='<div class="counter-choices thread-reveal response-options" id="exchangeArea"><p>この返信にどうしますか？</p><div class="counter-buttons"><button type="button" class="secondary" data-counter="evidence">🌱 前向きに返信する</button><button type="button" class="secondary no-reply" data-decline>何もしない</button><button type="button" class="secondary sharp" data-counter="quip">💢 強く言い返す</button></div></div>';
 }
 return '<section class="box result-top review-thread-page"><span class="eyebrow">'+esc(E.MONTHS[y.month-1])+' ／ 投稿完了</span><h2 class="result-title">口コミを投稿しました。</h2><div class="feed-card user-review"><div class="meta">あなた　／　'+esc(d.name)+'　／　'+esc("★".repeat(y.star))+'　'+esc(dgenre(y.genre).name)+'</div><p class="quote">'+esc(y.text)+'</p></div>'+
 '<div class="owner-timeline"><h3 class="thread-reveal timeline-title">店主からの返信</h3>'+initial+follow+'</div>'+
 '<div class="thread-navigation"><p>このやり取りを確認したら、翌月の商店街へ進みましょう。お店の変化や新しい出店は、次の画面で分かります。</p>'+
 (y.reply&&!r.exchange&&!r.declined?'<p class="section-intro">店主への対応を選ぶと、翌月へ進めます。</p>':'<button type="button" class="primary next-month" data-next>翌月へ　→</button>')+'</div></section>';
}

function townReport(){
 const r=game.last;if(!r)return street();
 const d=dshop(r.review.id),y=r.review,major=r.before.sign!==r.after.sign||r.before.route.stage!==r.after.route.stage||r.before.route.label!==r.after.route.label||r.before.open!==r.after.open;
 const minor=!major&&(r.before.feature!==r.after.feature||r.before.visual?.product!==r.after.visual?.product),changed=major||minor,closedNow=!r.after.open,evolved=changed&&!closedNow;
 const otherCause=r.cause==="other",combinedCause=r.cause==="combined",offsetCause=r.cause==="offset",legacyOther=typeof r.cause!=="string"&&r.npc?.id===r.review.id;
 const headline=closedNow?"お店が閉店しました。":otherCause?"ほかのお客さまの口コミで変化！":combinedCause?"口コミが重なり、店が変化！":offsetCause?"二つの意見が交差した。":major?"お店の姿が変わった！":minor?"店頭に新しい動きが！":"お店はいつもどおり。";
 const causeHint=otherCause?"あなたの投稿とは別の口コミが、今回の店舗変化のきっかけです。":combinedCause?"あなたの投稿と、ほかのお客さまの口コミが両方影響しました。":offsetCause?"あなたの口コミへの反応が、同じ月の別の口コミで変わりました。":legacyOther?"この月は同じ店舗にほかのお客さまも口コミを投稿しました。変化の原因は一つとは限りません。":"";
 const burst=evolved?'<div class="evolution-burst" aria-hidden="true">'+Array.from({length:14},(_,i)=>'<span style="--n:'+i+'">✦</span>').join("")+'</div>':"";
 const viralNotice=r.viral?'<section class="viral-event" role="status"><span class="eyebrow">つぶやき広場で話題に</span><h2>🔥 '+esc(r.viral.label)+'</h2><p>'+esc(r.viral.text)+'</p><small>評判が広まり、昼休みの客足にも変化が出ています。</small></section>':"";
 const lifecycleNotice=[...(r.closures||[]).map(c=>'<article class="closing-event"><span class="eyebrow">閉店のお知らせ ／ '+esc((c.lot||'?')+'番地')+'</span><h3>'+esc(c.name)+'</h3><p>'+esc(c.reason)+'ため営業終了。口コミの閲覧はできます。</p></article>'),
 ...(r.openings||[]).map(o=>'<article class="opening-event"><span class="eyebrow">'+(o.comeback?'突然の営業再開':'NEW OPEN')+' ／ '+esc((o.lot||'?')+'番地')+'</span><h3>'+(o.comeback?'🏢 ':'🎉 ')+esc(o.name)+'</h3><p>'+esc(o.notice)+'</p><p>次の出張から選べます。</p></article>')].join("");
 const changes=(r.affected||[]).map(x=>'<div class="linked-change"><strong>'+esc(dshop(x.id).name)+'</strong><p>'+esc(x.reason||"同じ月に届いたほかの口コミが影響しました。")+'</p><p>'+esc(x.after.summary)+'</p><div class="linked-compare"><div><small>前</small>'+storefront(x.before)+'</div><div><small>後</small>'+storefront(x.after)+'</div></div></div>').join("");
 return '<section class="box town-intro"><span class="eyebrow">'+(game.month>=12?"1年後の商店街":esc(E.MONTHS[game.month])+"の商店街")+'</span><h2>あれから、商店街はどうなった？</h2><p>'+esc(E.MONTHS[y.month-1])+'の口コミと、街の人たちの行動を経た現在の様子です。</p></section>'+viralNotice+
 (lifecycleNotice?'<section class="lifecycle-events" aria-label="商店街のお知らせ">'+lifecycleNotice+'</section>':"")+'<section class="box evolution-box '+(evolved?"has-evolution":closedNow?"has-closure":"no-evolution")+'">'+burst+'<div class="result-heading"><span class="eyebrow">投稿から1か月後</span><h2>'+headline+'</h2><p class="section-intro">'+esc(d.name)+'の今月の様子</p></div>'+
 '<div class="transformation-kicker">'+(closedNow?"閉店のお知らせ":evolved?"✨ 店の様子が変わった！":"今月の店頭")+'</div><div class="result-views"><div><small>投稿前</small>'+storefront(r.before)+'</div><div class="'+(evolved?"after-spotlight":"")+'"><small>1か月後</small>'+storefront(r.after)+'</div></div>'+
 '<div class="result-note">'+esc(r.transition)+'</div>'+(causeHint?'<p class="cause-hint">'+esc(causeHint)+'</p>':'')+
 '<p class="section-intro result-metrics">'+esc(r.after.population)+' ／ '+esc(r.after.business)+'</p></section>'+
 ((r.affected||[]).length?'<section class="box ripple-box"><h2>ほかのお店にも動きが！</h2><p class="section-intro">同じ月の口コミや経営状況によって、別のお店にも動きがありました。</p>'+changes+'</section>':"")+
 '<section class="box town-conclusion"><h2>今月の商店街</h2>'+
 (r.neighbor?'<div class="feed-card"><div class="meta">客足の変化</div><p class="body">'+esc(r.neighbor)+'</p></div>':"")+
 (r.sns?'<div class="feed-card"><div class="meta">つぶやき広場</div><p class="body">'+esc(r.sns.text)+'</p></div>':"")+
 (!r.neighbor&&!r.sns?'<p class="section-intro">新しい話題がない月も、街は営業を続けています。</p>':"")+
 '<p class="section-intro">ほかのお客さんの口コミは、次の商店街画面・各店舗・履歴から確認できます。</p>'+
 '<button type="button" class="primary next-month" data-continue>'+(game.month>=12?"1年後の結末を見る":"次のランチ先を探す　→")+'</button></section>';
}

function finalPage(){
 const end=E.finish(game);
 return '<section class="box result-top"><span class="eyebrow">出張12回目のあと ／ 3月</span><h2 class="result-title">'+esc(end.title)+'</h2><p>'+esc(end.description)+'</p><p>あなたが書いた12件の口コミ。その間に、お店も客も少しずつ変わりました。</p></section>'+
 '<section class="box"><h2>現在の商店街</h2><p class="section-intro">'+end.shops.length+'店舗の看板と店主の言葉を振り返ります。違う選択なら、この一年は別の姿だったかもしれません。</p><div class="ending-grid">'+end.shops.map(f=>{const v=E.display(game.shops[f.id],f.id);return '<article class="ending-card">'+storefront(v)+'<div><h3>'+esc(f.name)+'</h3><span class="summary-badge">'+esc(f.sign)+'</span><p>'+esc(f.description)+'</p><blockquote class="owner-last">'+esc(f.ownerLine||"今年もありがとうございました。")+'</blockquote><small>'+f.reviews+'件の口コミを投稿</small></div></article>'}).join("")+'</div></section>'+
 '<section class="box"><h2>あの日の口コミを振り返る</h2><p>口コミ履歴から、返事があった投稿も、最後まで返信されなかった投稿も読み返せます。</p>'+
 '<button type="button" class="secondary" data-tab="history">12か月の口コミ履歴を見る</button>'+
 '<button type="button" class="primary" data-restart>別の一年を始める</button></section>';
}
function history(){
 if(!game.reviews.length)return '<section class="box"><h2>口コミ履歴</h2><p>まだ口コミはありません。ランチ先を選んで感想を書くと、ここに残ります。</p></section>';
 return '<section class="box"><h2>あなたの口コミ履歴</h2><p class="section-intro">投稿済み：'+game.reviews.length+' / 12件。出張先のランチ記録です。</p><div class="timeline">'+[...game.reviews].reverse().map(f=>
 '<article class="history-card"><div class="tiny">'+esc(E.MONTHS[f.month-1])+' ／ '+esc(dshop(f.id).name)+' ／ '+esc(dgenre(f.genre).name)+'</div><h3>'+esc("★".repeat(f.star))+'</h3><p>'+esc(f.text)+'</p>'+replySnippet(f.id,f.reply,dshop(f.id).owner+"からの返信")+
 (f.exchange?'<div class="history-exchange"><p><strong>あなたの追記</strong>　'+esc(f.exchange.playerText)+'</p>'+(f.exchange.ownerText?'<p><strong>'+esc(dshop(f.id).owner)+'の再返信</strong>　'+esc(f.exchange.ownerText)+'</p>':'<p>店主から追加の返信はありません。</p>')+'</div>':"")+'</article>').join("")+'</div></section>'+
 '<section class="box"><h2>ほかのお客さんの口コミ・街の話題</h2>'+
 [...game.feed].reverse().filter(f=>f.kind==="npc"||f.kind==="sns"||f.kind==="viral"||f.kind==="lifecycle"||f.kind==="rumor").map(f=>
 '<div class="feed-card '+(f.kind==="viral"?"viral-list":f.kind==="rumor"?"lot-rumor":"")+'"><div class="meta">'+esc(E.MONTHS[f.month-1])+' ／ '+esc(f.kind==="lifecycle"?"商店街のお知らせ":f.kind==="rumor"?"商店街の噂":f.kind==="sns"||f.kind==="viral"?"つぶやき広場":f.by+"・"+dshop(f.id).name)+'</div><p class="body">'+esc(f.text)+'</p>'+
 (f.kind==="npc"?replySnippet(f.id,f.reply,dshop(f.id).owner+"からの返信"):"")+'</div>').join("")+'</section>';
}
function guide(){
 return '<section class="box guide-text"><h2>遊び方</h2><p>あなたは毎月この商店街へ出張で来る会社員。昼休みに口コミと返信を読み、店で食べた後に投稿します。4月から翌3月まで全12回です。</p>'+
 '<h3>① 口コミを読んで昼食を決める</h3><p>営業中のお店と過去の口コミを読み、店主からの返信があれば参考にして行き先を選びます。食後の味・接客・雰囲気・価格を観察したうえで、ポップアップから①評価ジャンル、②星1〜5の順に選びます。</p>'+
 '<h3>② 投稿後のやり取りを確認する</h3><p>店主は口コミに感謝したり、反論したり、ときには返信をしないこともあります。確認後「翌月へ」で街の変化を見ます。口コミで客足が減ると閉店するお店もあれば、途中で新しく開店するお店もあります。SNSで評判が広まることもあります。</p>'+
 '<h3>③ 同じ店を再評価する</h3><p>同じ店に何度でも投稿できます。店主から返信が来るかどうかはお店や評価によって異なります。返信が来た場合は一言返すか、返信しないかを選べます。星やジャンルを変えると、別の方向に変化することがあります。別のお客さんの声や、架空SNSの話題も時々現れます。</p>'+
 '<h3>④ 一年後を見届ける</h3><p>お店は繁盛することも、衰退することもあります。正解の星の付け方はありません。12回目を終えると、その一年の商店街の姿を見られます。</p>'+
 '<p class="note">このバージョンは試作版です。看板や内装は仮のCSSイラストで表現しています。画面上部のバージョン表示は実装の更新時刻です。</p>'+
 '<button type="button" class="secondary" data-tab="street">商店街に戻る</button>'+
 '<button type="button" class="secondary" data-restart>最初から遊び直す</button></section>';
}
function render(){
 const showingReview=tab==="street"&&game.view==="review";
 const month=showingReview?Math.max(0,game.month-1):Math.min(game.month,11);
 document.getElementById("monthText").textContent=game.month===12&&!showingReview?"1年後":E.MONTHS[month];
 document.getElementById("monthCaption").textContent=showingReview?"今回の投稿が完了":game.view==="result"?"商店街の変化を確認":game.month===12?"12 / 12 件 投稿済み":"次の口コミ "+(game.month+1)+" / 12 件目";
 document.getElementById("monthProgress").innerHTML=Array.from({length:12},(_,i)=>'<span class="'+(i<game.month?"done":i===game.month?"current":"")+'" aria-hidden="true"></span>').join("");
 document.querySelectorAll(".tabs button").forEach(b=>{const active=b.dataset.tab===tab;b.classList.toggle("active",active);if(active)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
 if(selectedId&&!game.shops[selectedId])selectedId=null;
 root.innerHTML=onboarding?tutorial():(notification?'<p class="note" role="status">'+esc(notification)+'</p>':"")+(tab==="history"?history():tab==="guide"?guide():game.view==="final"?finalPage():game.view==="review"?reviewThread():game.view==="result"?townReport():street())+(tab==="street"&&game.view==="map"&&dineModal?dineDialog():"");
 document.body.classList.toggle("modal-open",!onboarding&&tab==="street"&&game.view==="map"&&dineModal);
}
function refreshDialogSelection(selector){
 const previous=root.querySelector(".dine-dialog"),top=previous?.scrollTop||0;
 render();
 const modal=root.querySelector(".dine-dialog");if(modal)modal.scrollTop=top;
 const chosen=modal?.querySelector(selector);
 if(chosen){try{chosen.focus({preventScroll:true})}catch(err){chosen.focus();if(modal)modal.scrollTop=top;}}
}
document.addEventListener("keydown",e=>{
 if(!dineModal)return;
 if(e.key==="Escape"){dineModal=false;dinedId=null;render();document.querySelector("[data-dine]")?.focus();return;}
 if(e.key==="Tab"){
  const modal=root.querySelector(".dine-dialog");
  if(!modal)return;
  const focusable=Array.from(modal.querySelectorAll("button:not([disabled])"));
  if(!focusable.length)return;
  const first=focusable[0],last=focusable[focusable.length-1];
  if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
  else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
 }
});
document.addEventListener("click",e=>{
 const btn=e.target.closest("button");if(!btn)return;
 if(btn.hasAttribute("data-restart")){
  if(!window.confirm("現在のセーブ記録を消して、4月から最初に戻りますか？ この操作は取り消せません。"))return;
  game=newGame();onboarding=true;selectedId=null;dinedId=null;selectedStar=null;selectedGenre=null;dineModal=false;tab="street";notification="";
  save();render();scrollTop();return;
 }
 if(btn.hasAttribute("data-begin")){onboarding=false;game.introSeen=true;save();render();scrollTop();return;}
 if(onboarding)return;
 if(btn.dataset.counter){try{game=E.counter(game,btn.dataset.counter);save();render();document.getElementById("exchangeArea")?.scrollIntoView({behavior:"smooth",block:"center"});}catch(err){notification="この返信には、もう追記できません。";render();}return;}
 if(btn.dataset.tab){dineModal=false;tab=btn.dataset.tab;notification="";render();scrollTop();return;}
 if(btn.dataset.shop){selectedId=btn.dataset.shop;dinedId=null;selectedStar=null;selectedGenre=null;dineModal=false;tab="street";render();if(window.innerWidth<760){setTimeout(()=>document.getElementById("shopDetail")?.scrollIntoView({behavior:"smooth",block:"start"}),0)}return;}
 if(btn.dataset.dine){dinedId=btn.dataset.dine;selectedStar=null;selectedGenre=null;dineModal=true;render();root.querySelector(".dine-dialog")?.focus();return;}
 if(btn.hasAttribute("data-modal-close")){dineModal=false;dinedId=null;render();document.querySelector("[data-dine]")?.focus();return;}
 if(btn.dataset.star){selectedStar=Number(btn.dataset.star);refreshDialogSelection('[data-star="'+selectedStar+'"]');return;}
 if(btn.dataset.genre){selectedGenre=btn.dataset.genre;refreshDialogSelection('[data-genre="'+selectedGenre+'"]');return;}
 if(btn.hasAttribute("data-post")){if(!dineModal||dinedId!==selectedId||selectedStar===null||selectedGenre===null)return;try{game=E.advance(game,{id:selectedId,star:selectedStar,genre:selectedGenre});dineModal=false;notification="";save();render();scrollTop()}catch(err){notification="投稿できませんでした。店舗を選び直してください。";render()}return;}
 if(btn.hasAttribute("data-decline")){if(game.view==="review"&&game.last?.review.reply&&!game.last.exchange){game.last.declined=true;save();render();}return;}
 if(btn.hasAttribute("data-next")){if(game.view!=="review"||(game.last?.review.reply&&!game.last?.exchange&&!game.last?.declined))return;game.view="result";tab="street";save();render();scrollTop();return;}
 if(btn.hasAttribute("data-continue")){if(game.view!=="result")return;game.view=game.month>=12?"final":"map";tab="street";selectedId=null;dinedId=null;selectedStar=null;selectedGenre=null;dineModal=false;save();render();scrollTop();return;}

});
render();
})();