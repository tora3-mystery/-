(() => {
"use strict";
const E=window.R1;
if(!E){document.getElementById("gameRoot").textContent="ゲームの読み込みに失敗しました。ページを再読込してください。";return}
const KEY="r1-machikado-v1";
const root=document.getElementById("gameRoot");
let game,selectedId="ramen",selectedStar=null,selectedGenre=null,tab="street",notification="";
const esc=x=>String(x==null?"":x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dshop=id=>E.SHOPS.find(x=>x.id===id);
const dgenre=id=>E.GENRES.find(x=>x.id===id);
function newGame(){const state=E.createState(Date.now()>>>0);state.introSeen=false;return state}
function load(){
 try{const raw=localStorage.getItem(KEY);if(raw){const s=JSON.parse(raw);E.audit(s);if(s.version===E.VERSION)return s;if(["0.1.0-alpha","0.2.0-alpha","0.3.0-alpha","0.3.1-alpha","0.3.2-alpha"].includes(s.version)){
 const ramen=s.shops.ramen;
 if(ramen.history.filter(h=>h.genre==="taste"&&h.star<=2).length>=3){
  ramen.hardening=true;
  ramen.scores.identity=Math.min(25,Math.max(ramen.scores.identity,Math.abs(ramen.scores.taste)+2));
 }
 s.version=E.VERSION;return s;
}}}
 catch(err){console.warn("R1 save reset:",err)}
 return newGame();
}
function save(){try{localStorage.setItem(KEY,JSON.stringify(game))}catch(err){console.warn("R1 saving unavailable:",err)}}
game=load();let onboarding=game.introSeen===false;save();
function scrollTop(){window.scrollTo({top:0,behavior:"auto"})}
function pill(tone,text){return '<span class="chip '+(tone||"")+'">'+esc(text)+'</span>'}
function storefront(v){
 const stage=v.route.stage,closed=!v.open,visual=v.visual||{icon:v.base.icon,product:v.base.product,tagline:"いつもの味",variety:0};
 const merchandise=closed?"":'<div class="store-merch"><span class="merch-icon" aria-hidden="true">'+esc(visual.icon)+'</span><span class="merch-label"><strong>'+esc(visual.product)+'</strong><span>'+esc(stage>=2?visual.tagline:"看板の商品")+'</span></span></div>';
 const feature=(!closed&&stage>0)?'<div class="store-feature">'+esc(v.feature)+'</div>':"";
 return '<div class="storefront '+esc(v.base.palette)+' stage-'+stage+" route-"+(v.route.genre||"base")+" dir-"+(v.route.polarity||"none")+(closed?" closed":"")+'" role="img" aria-label="'+esc(v.base.name+"。"+v.summary+" "+(v.feature||""))+'">'+
 '<div class="sign">'+esc(closed?"閉店しました":v.sign)+'</div>'+merchandise+feature+
 '<span class="stage-tag">'+esc(closed?"CLOSED":stage===0?"営業中":stage===1?"店頭改装":stage===2?"新看板":stage===3?"新装":"大改装")+'</span></div>';
}
function shopCard(d){
 const v=E.display(game.shops[d.id],d.id),hist=game.shops[d.id].history.length;
 return '<button type="button" class="shop-card '+(d.id===selectedId?"selected":"")+'" data-shop="'+d.id+'" aria-pressed="'+(d.id===selectedId)+'">'+
 storefront(v)+'<span class="card-copy"><span class="small">'+esc(d.category)+'・'+hist+'件投稿</span><strong>'+esc(d.name)+'</strong>'+
 '<span class="summary">'+esc(v.summary)+'</span><span class="tap">店舗を見る　›</span></span></button>';
}
function recentFeed(id){const items=game.feed.filter(f=>f.kind==="npc"&&f.id===id).slice(-2).reverse();
 if(!items.length)return '<div class="recent"><h3>ほかのお客さまの声</h3><p>まだ投稿がありません。</p></div>';
 return '<div class="recent"><h3>ほかのお客さまの声</h3>'+items.map(f=>'<p><strong>'+esc(f.by)+'</strong>　'+esc("★".repeat(f.star))+'<br>'+esc(f.text)+'</p>').join('<hr style="border:0;border-top:1px solid #435166;margin:9px 0">')+'</div>';}
function reviewForm(id){
 const d=dshop(id),s=game.shops[id],v=E.display(s,id);
 if(s.closed)return '<div class="note">現在、この店には口コミを投稿できません。ほかのお店を選んでください。</div>';
 const stars=Array.from({length:5},(_,i)=>i+1).map(x=>'<button type="button" class="star '+(selectedStar===x?"selected":"")+'" data-star="'+x+'" aria-label="星'+x+'" aria-pressed="'+(selectedStar===x)+'">★'+x+'</button>').join("");
 const genres=E.GENRES.map(g=>'<button type="button" class="genre '+(selectedGenre===g.id?"selected":"")+'" data-genre="'+g.id+'" aria-pressed="'+(selectedGenre===g.id)+'">'+g.icon+' '+esc(g.name)+'</button>').join("");
 const valid=selectedStar!==null&&selectedGenre!==null;let preview="";
 if(valid){try{preview=E.reviewText(game,id,selectedStar,selectedGenre)}catch(err){preview="投稿文を作成できませんでした。"}}
 return '<div class="form-title">この店をレビューする</div>'+
 '<div class="label-row"><strong>① 星を選ぶ</strong><small>悪い ★1 ─ ★5 良い</small></div>'+
 '<div class="stars" role="group" aria-label="星評価">'+stars+'</div>'+
 '<div class="label-row"><strong>② 口コミのジャンルを選ぶ</strong><small>評価の観点</small></div>'+
 '<div class="genres" role="group" aria-label="口コミジャンル">'+genres+'</div>'+
 '<div class="preview"><span class="kicker">投稿前のプレビュー'+(valid?'　★'+selectedStar+' ／ '+esc(dgenre(selectedGenre).name):'')+'</span><p>'+esc(valid?preview:"星とジャンルを選ぶと、口コミ文が表示されます。")+'</p></div>'+
 '<button type="button" class="primary" data-post '+(valid?"":"disabled")+'>'+esc(E.MONTHS[game.month])+'の口コミを投稿する</button>'+
 '<div class="note">星とジャンルの組み合わせが、店主の返信や店の方向性に影響します。投稿は月に1回です。</div>';
}
function detail(id){
 const d=dshop(id),s=game.shops[id],v=E.display(s,id);
 const last=s.history.length?s.history[s.history.length-1]:null;
 return '<section class="panel" id="shopDetail"><div class="detail-header"><div><span class="eyebrow">お店のページ</span><h2>'+esc(d.name)+'</h2><p class="subtitle">'+esc(d.category)+' ／ '+esc(v.visual?v.visual.product:d.product)+'</p></div><span class="summary-badge">'+esc(v.business)+'</span></div>'+
 '<div class="shop-meta">'+pill(v.closed?"bad":"good",v.business)+pill("",v.population)+(v.route.label?pill("",v.route.label):pill("","創業時の看板"))+'</div>'+
 '<div class="owner-box"><span class="owner-icon" aria-hidden="true">'+esc(d.icon)+'</span><div><strong>店主：'+esc(d.owner)+'（'+d.age+'）</strong><p>'+esc(d.description)+'</p></div></div>'+
 '<div class="note">'+esc(v.summary)+'</div>'+reviewForm(id)+
 (last?'<div class="recent"><h3>前回あなたに届いた返信</h3><p><strong>'+esc(d.owner)+'</strong>：「'+esc(last.reply)+'」</p></div>':'')+recentFeed(id)+'</section>';
}
function tutorial(){
 const base=E.createState(101),before=E.display(base.shops.ramen,"ramen");
 base.shops.ramen.scores.identity=16;
 base.shops.ramen.history=[{id:"ramen",genre:"identity",star:5,month:1}];
 const after=E.display(base.shops.ramen,"ramen");
 return '<section class="tutorial" aria-labelledby="tutorialTitle">'+
 '<div class="tutorial-hero"><span class="eyebrow">まちかどレビュー ／ ご利用前に</span>'+
 '<h2 id="tutorialTitle">この商店街、<br>口コミで変わります。</h2>'+
 '<p>ラーメン屋、喫茶店、洋菓子店。あなたの感想に、店主は感謝するかもしれないし、言い返してくるかもしれません。</p></div>'+
 '<div class="tutorial-comparison"><p class="eyebrow">たとえば、あるラーメン屋</p><div class="result-views"><div><small>最初は普通の店</small>'+storefront(before)+'</div><div class="after-spotlight"><small>口コミを重ねると……</small>'+storefront(after)+'</div></div></div>'+
 '<div class="tutorial-steps"><article><strong>① お店を選ぶ</strong><p>3店舗のどこに口コミを書くか決めます。</p></article>'+
 '<article><strong>② 星とジャンルを選ぶ</strong><p>★1〜5と「味・接客・価格・雰囲気・個性」を組み合わせ、投稿文を確認します。</p></article>'+
 '<article><strong>③ 返信と変化を見る</strong><p>店主から返信が来ます。言い返すことも可能。次の月には、店や商品が変わっているかもしれません。</p></article></div>'+
 '<div class="tutorial-end"><strong>期間は4月から翌3月まで。月に1件、合計12件。</strong>'+
 '<p>ほかのお客さんの口コミも店に影響します。正解はありません。1年後の商店街を見届けてください。</p>'+
 '<button type="button" class="primary start-game" data-begin>商店街へ行く　→</button><p class="tiny">進行状況は端末に保存されます。操作はいつでも「あそび方」から確認できます。</p></div></section>';
}
function street(){
 const all=E.SHOPS.map(shopCard).join("");
 const lastMonth=game.month>0?'<p class="section-intro">前回の投稿は '+esc(E.MONTHS[game.month-1])+'。お店の看板や雰囲気を見比べてみましょう。</p>':'<p class="section-intro">気になるお店を選んで、最初の口コミを投稿してください。</p>';
 const feed=game.feed.filter(x=>x.kind==="sns").slice(-3).reverse();
 return '<div class="layout"><div><h2 class="section-title">商店街を歩く</h2>'+lastMonth+'<div class="street-list">'+all+'</div>'+
 '<section class="feed-list"><h2>まちの話題</h2>'+(feed.length?feed.map(f=>'<div class="feed-card"><div class="meta">つぶやき広場　／　'+esc(E.MONTHS[f.month-1])+'</div><p class="body">'+esc(f.text)+'</p></div>').join(""):'<p class="section-intro">大きな話題はまだありません。口コミや店の変化が注目されることもあります。</p>')+'</section></div>'+detail(selectedId)+'</div>';
}
function result(){
 const r=game.last;if(!r)return street();
 const d=dshop(r.review.id),y=r.review,major=r.before.sign!==r.after.sign||r.before.route.stage!==r.after.route.stage||r.before.route.label!==r.after.route.label||r.before.open!==r.after.open;
 const minor=!major&&(r.before.feature!==r.after.feature||r.before.visual?.product!==r.after.visual?.product),changed=major||minor;
 const otherCause=r.cause==="other",combinedCause=r.cause==="combined",offsetCause=r.cause==="offset",legacyOther=typeof r.cause!=="string"&&r.npc?.id===r.review.id;
 const headline=otherCause?"ほかのお客さまの口コミで変化！":combinedCause?"口コミが重なり、店が変化！":offsetCause?"二つの意見が交差した。":major?"お店の姿が変わった！":minor?"店頭に新しい動きが！":"お店はいつもどおり。";
 const causeHint=otherCause?"あなたの投稿とは別の口コミが、今回の店舗変化のきっかけです。":combinedCause?"あなたの投稿と、ほかのお客さまの口コミが両方影響しました。":offsetCause?"あなたの口コミへの反応が、同じ月の別の口コミで変わりました。":legacyOther?"この月は同じ店舗にほかのお客さまも口コミを投稿しました。変化の原因は一つとは限りません。":"";
 const burst=changed?'<div class="evolution-burst" aria-hidden="true">'+Array.from({length:14},(_,i)=>'<span style="--n:'+i+'">✦</span>').join("")+'</div>':"";
 const exchange=r.exchange?
  '<div class="reply-thread" id="exchangeArea"><div class="thread-player"><span>あなたから追記</span><p>'+esc(r.exchange.playerText)+'</p></div><div class="thread-owner"><span>'+esc(d.owner)+'から再返信</span><p>「'+esc(r.exchange.ownerText)+'」</p></div></div>':
  '<div class="counter-choices" id="exchangeArea"><p>この返信に、一言返す？ <small>どちらか1回だけ。返さずに翌月へ進んでもOK。</small></p><div class="counter-buttons"><button type="button" class="secondary" data-counter="evidence">📋 根拠を伝える</button><button type="button" class="secondary sharp" data-counter="quip">💬 軽く言い返す</button></div></div>';
 const changes=(r.affected||[]).map(x=>'<div class="linked-change"><strong>'+esc(dshop(x.id).name)+'</strong><p>'+esc(x.reason||"同じ月に届いたほかの口コミが影響しました。")+'</p><p>'+esc(x.after.summary)+'</p><div class="linked-compare"><div><small>前</small>'+storefront(x.before)+'</div><div><small>後</small>'+storefront(x.after)+'</div></div></div>').join("");
 return '<section class="box result-top"><span class="eyebrow">'+esc(E.MONTHS[y.month-1])+'に投稿した口コミ</span><h2 class="result-title">口コミへの返信が届きました。</h2><div class="feed-card user-review"><div class="meta">あなた　／　'+esc(d.name)+'　／　'+esc("★".repeat(y.star))+'　'+esc(dgenre(y.genre).name)+'</div><p class="quote">'+esc(y.text)+'</p></div>'+
 '<div class="owner-reply"><span class="name">'+esc(d.owner)+'　店主より</span><p>「'+esc(y.reply)+'」</p></div>'+exchange+'</section>'+
 '<section class="box evolution-box '+(changed?"has-evolution":"no-evolution")+'">'+burst+'<div class="result-heading"><span class="eyebrow">投稿から1か月後</span><h2>'+headline+'</h2><p class="section-intro">'+esc(d.name)+'の今月の様子</p></div>'+
 '<div class="transformation-kicker">'+(changed?"✨ 店の様子が変わった！":"今月の店頭")+'</div><div class="result-views"><div><small>投稿前</small>'+storefront(r.before)+'</div><div class="'+(changed?"after-spotlight":"")+'"><small>1か月後</small>'+storefront(r.after)+'</div></div>'+
 '<div class="result-note">'+esc(r.transition)+'</div>'+(causeHint?'<p class="cause-hint">'+esc(causeHint)+'</p>':'')+
 '<p class="section-intro result-metrics">'+esc(r.after.population)+' ／ '+esc(r.after.business)+'</p></section>'+
 ((r.affected||[]).length?'<section class="box ripple-box"><h2>このお店にも変化が！</h2><p class="section-intro">同じ月に届いたほかのお客さまの口コミなどで、近くの店にも動きがありました。</p>'+changes+'</section>':"")+
 '<section class="box"><h2>まちの反応</h2>'+
 (r.neighbor?'<div class="feed-card"><div class="meta">客足の変化</div><p class="body">'+esc(r.neighbor)+'</p></div>':"")+
 (r.npc?'<div class="feed-card"><div class="meta">'+esc(r.npc.by)+'　／　'+esc(dshop(r.npc.id).name)+'　★'+r.npc.star+'</div><p class="body">'+esc(r.npc.text)+'</p></div>':"")+
 (r.sns?'<div class="feed-card"><div class="meta">つぶやき広場</div><p class="body">'+esc(r.sns.text)+'</p></div>':"")+
 (!r.npc&&!r.sns&&!r.neighbor?'<p class="section-intro">今月はいつもどおりの商店街でした。</p>':"")+
 '<button type="button" class="primary next-month" data-next>'+(game.month>=12?"1年後の商店街を見る":"翌月の商店街を見に行く　→")+'</button></section>';
}
function finalPage(){
 const end=E.finish(game);
 return '<section class="box result-top"><span class="eyebrow">一年後 ／ 3月</span><h2 class="result-title">'+esc(end.title)+'</h2><p>'+esc(end.description)+'</p><p>あなたが書いた12件の口コミ。その間に、お店も客も少しずつ変わりました。</p></section>'+
 '<section class="box"><h2>現在の商店街</h2><p class="section-intro">三軒の看板と店主の言葉を振り返ります。違う選択なら、この一年は別の姿だったかもしれません。</p><div class="ending-grid">'+end.shops.map(f=>{const v=E.display(game.shops[f.id],f.id);return '<article class="ending-card">'+storefront(v)+'<div><h3>'+esc(f.name)+'</h3><span class="summary-badge">'+esc(f.sign)+'</span><p>'+esc(f.description)+'</p><blockquote class="owner-last">'+esc(f.ownerLine||"今年もありがとうございました。")+'</blockquote><small>'+f.reviews+'件の口コミを投稿</small></div></article>'}).join("")+'</div></section>'+
 '<section class="box"><h2>あの日の口コミを振り返る</h2><p>口コミ履歴から、店主の返事をもう一度読むことができます。</p>'+
 '<button type="button" class="secondary" data-tab="history">12か月の口コミ履歴を見る</button>'+
 '<button type="button" class="primary" data-restart>別の一年を始める</button></section>';
}
function history(){
 if(!game.reviews.length)return '<section class="box"><h2>口コミ履歴</h2><p>まだ口コミはありません。お店に感想を届けると、ここに記録されます。</p></section>';
 return '<section class="box"><h2>あなたの口コミ履歴</h2><p class="section-intro">投稿済み：'+game.reviews.length+' / 12件。星・ジャンル・店主の返信が残っています。</p><div class="timeline">'+[...game.reviews].reverse().map(f=>'<article class="history-card"><div class="tiny">'+esc(E.MONTHS[f.month-1])+' ／ '+esc(dshop(f.id).name)+' ／ '+esc(dgenre(f.genre).name)+'</div><h3>'+esc("★".repeat(f.star))+'</h3><p>'+esc(f.text)+'</p><div class="reply">'+esc(dshop(f.id).owner)+'：「'+esc(f.reply)+'」</div>'+(f.exchange?'<div class="history-exchange"><p><strong>あなたの追記</strong>　'+esc(f.exchange.playerText)+'</p><p><strong>'+esc(dshop(f.id).owner)+'の再返信</strong>　'+esc(f.exchange.ownerText)+'</p></div>':'')+'</article>').join("")+'</div></section>'+
 '<section class="box"><h2>ほかの人の口コミ・まちの話題</h2>'+[...game.feed].reverse().filter(f=>f.kind==="npc"||f.kind==="sns").map(f=>'<div class="feed-card"><div class="meta">'+esc(E.MONTHS[f.month-1])+' ／ '+esc(f.kind==="sns"?"つぶやき広場":f.by+"・"+dshop(f.id).name)+'</div><p class="body">'+esc(f.text)+'</p></div>').join("")+'</section>';
}
function guide(){
 return '<section class="box guide-text"><h2>遊び方</h2><p>あなたは「まちかどレビュー」を使う一般客です。3つのお店から1店を選び、毎月1件の口コミを投稿します。4月から翌3月まで、全部で12回です。</p>'+
 '<h3>① 星とジャンルを選ぶ</h3><p>星1〜5で評価を、商品・味／接客／価格／雰囲気／個性からコメントの対象を選びます。投稿する文章は、そのときの店の状況に合わせて表示されます。</p>'+
 '<h3>② 返信と変化を見る</h3><p>店主は口コミに感謝したり、反論したり、ときには店の方針そのものを変えます。一度の投稿で看板が変わることも、メニューの一部だけ変わることもあります。動かない店もあります。</p>'+
 '<h3>③ 同じ店を再評価する</h3><p>同じ店に何度でも投稿できます。返信に一言返すと店主がさらに返事をすることもあります。星やジャンルを変えると、別の方向に変化することがあります。別のお客さんの声や、架空SNSの話題も時々現れます。</p>'+
 '<h3>④ 一年後を見届ける</h3><p>お店は繁盛することも、衰退することもあります。正解の星の付け方はありません。12回目を終えると、その一年の商店街の姿を見られます。</p>'+
 '<p class="note">このバージョンは試作版です。看板や内装は仮のCSSイラストで表現しています。画面上部のバージョン表示は実装の更新時刻です。</p>'+
 '<button type="button" class="secondary" data-tab="street">商店街に戻る</button>'+
 '<button type="button" class="secondary" data-restart>最初から遊び直す</button></section>';
}
function render(){
 const showingResult=tab==="street"&&game.view==="result";
 const month=showingResult?Math.max(0,game.month-1):Math.min(game.month,11);
 document.getElementById("monthText").textContent=game.month===12&&!showingResult?"1年後":E.MONTHS[month];
 document.getElementById("monthCaption").textContent=game.month===12?"12 / 12 件 投稿済み":game.view==="result"?"今回の投稿が完了":"次の口コミ "+(game.month+1)+" / 12 件目";
 document.getElementById("monthProgress").innerHTML=Array.from({length:12},(_,i)=>'<span class="'+(i<game.month?"done":i===game.month?"current":"")+'" aria-hidden="true"></span>').join("");
 document.querySelectorAll(".tabs button").forEach(b=>{const active=b.dataset.tab===tab;b.classList.toggle("active",active);if(active)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});
 if(!game.shops[selectedId])selectedId="ramen";
 root.innerHTML=onboarding?tutorial():(notification?'<p class="note" role="status">'+esc(notification)+'</p>':"")+(tab==="history"?history():tab==="guide"?guide():game.view==="final"?finalPage():game.view==="result"?result():street());
}
document.addEventListener("click",e=>{
 const btn=e.target.closest("button");if(!btn)return;
 if(btn.hasAttribute("data-begin")){onboarding=false;game.introSeen=true;save();render();scrollTop();return;}
 if(onboarding)return;
 if(btn.dataset.counter){try{game=E.counter(game,btn.dataset.counter);save();render();document.getElementById("exchangeArea")?.scrollIntoView({behavior:"smooth",block:"center"});}catch(err){notification="この返信には、もう追記できません。";render();}return;}
 if(btn.dataset.tab){tab=btn.dataset.tab;notification="";render();scrollTop();return;}
 if(btn.dataset.shop){selectedId=btn.dataset.shop;selectedStar=null;selectedGenre=null;tab="street";render();if(window.innerWidth<760){setTimeout(()=>document.getElementById("shopDetail")?.scrollIntoView({behavior:"smooth",block:"start"}),0)}return;}
 if(btn.dataset.star){selectedStar=Number(btn.dataset.star);render();return;}
 if(btn.dataset.genre){selectedGenre=btn.dataset.genre;render();return;}
 if(btn.hasAttribute("data-post")){if(selectedStar===null||selectedGenre===null)return;try{game=E.advance(game,{id:selectedId,star:selectedStar,genre:selectedGenre});notification="";save();render();scrollTop()}catch(err){notification="投稿できませんでした。店舗を選び直してください。";render()}return;}
 if(btn.hasAttribute("data-next")){game.view=game.month>=12?"final":"map";tab="street";selectedStar=null;selectedGenre=null;save();render();scrollTop();return;}
 if(btn.hasAttribute("data-restart")){if(!window.confirm("これまでの12か月の記録を消して、新しく始めますか？"))return;game=newGame();onboarding=true;selectedId="ramen";selectedStar=null;selectedGenre=null;tab="street";notification="";save();render();scrollTop();return;}
});
render();
})();