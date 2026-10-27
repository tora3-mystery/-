/*
 * N1 catalog v1 — image categories and factual source provenance are separate.
 * This is an expandable candidate index, NOT a claim that 500 products are verified.
 * No external API calls at play time. Human-readable source links are retained.
 */
(function(root){
 'use strict';
 const imageCatalog=Object.freeze({
  eraser:{category:'消しゴム',prompt:'neutral unbranded rectangular eraser with wrapper, white or black blank wrapper, catalog-style product photography, no text/no logos',ratio:'4:3'},
  correction_pen:{category:'修正ペン',prompt:'generic white correction pen, isolated studio photograph, no logo and no labels',ratio:'4:3'},
  correction_tape:{category:'修正テープ',prompt:'generic white translucent correction tape dispenser on desk, no logo or label',ratio:'4:3'},
  pencil_case:{category:'筆箱',prompt:'simple unbranded plain canvas pencil case studio photograph',ratio:'4:3'},
  pen:{category:'筆記具',prompt:'unbranded ballpoint pen on neutral studio background',ratio:'4:3'},
  notebook:{category:'ノート',prompt:'blank unbranded A5 ruled notebook on desk',ratio:'4:3'},
  paper:{category:'文具・紙',prompt:'blank office paper and sticky notes neutral photo',ratio:'4:3'},
  underlay:{category:'下敷き',prompt:'transparent stationery underlay sheet with plain background no logo',ratio:'4:3'},
  earbuds:{category:'完全ワイヤレスイヤホン',prompt:'unbranded wireless earbuds and simple charging case, studio product photo no logo',ratio:'4:3'},
  headphones:{category:'ヘッドホン',prompt:'generic black wireless over-ear headphones on neutral desk no brand marks',ratio:'4:3'},
  charger:{category:'充電器',prompt:'plain compact white USB C charger without logo or model text isolated studio photograph',ratio:'4:3'},
  cable:{category:'ケーブル',prompt:'plain coiled USB C cable in studio photography no branding',ratio:'4:3'},
  smartphone:{category:'スマートフォン',prompt:'generic modern smartphone screen off and simple black frame no brand logos',ratio:'4:3'},
  mouse:{category:'マウス',prompt:'generic black ergonomic wireless mouse without logos',ratio:'4:3'},
  keyboard:{category:'キーボード',prompt:'generic minimalist mechanical keyboard without logo or labels',ratio:'4:3'},
  clock:{category:'置き時計',prompt:'plain minimalist desk alarm clock with no branding or legible numerals',ratio:'4:3'},
  speaker:{category:'スピーカー',prompt:'generic compact wireless speaker no branding',ratio:'4:3'},
  mug:{category:'マグカップ',prompt:'plain ceramic cup in neutral color, studio product photo unbranded',ratio:'4:3'},
  tumbler:{category:'タンブラー',prompt:'plain stainless steel vacuum tumbler no label no logo',ratio:'4:3'},
  coffee:{category:'コーヒー器具',prompt:'simple coffee dripper and mug, studio still life without logo',ratio:'4:3'},
  kitchen:{category:'キッチン用品',prompt:'generic modern kitchen utensil on plain studio table',ratio:'4:3'},
  tableware:{category:'食器',prompt:'simple white ceramic bowl, studio product photo',ratio:'4:3'},
  beauty:{category:'美容用品',prompt:'simple generic skincare bottle without label or logo',ratio:'4:3'},
  towel:{category:'タオル',prompt:'folded plain soft cotton bath towel, product studio',ratio:'4:3'},
  bag:{category:'バッグ',prompt:'unbranded minimalist canvas tote bag studio',ratio:'4:3'},
  clothing:{category:'衣類',prompt:'neutral plain t-shirt on table studio photo unbranded',ratio:'4:3'},
  shoes:{category:'シューズ',prompt:'minimalistic generic walking sneakers no branding',ratio:'4:3'},
  furniture:{category:'家具',prompt:'generic small side table in light wood no brand logos studio photo',ratio:'4:3'},
  appliance:{category:'家電',prompt:'generic small home appliance on neutral table with no logo',ratio:'4:3'},
  diffuser:{category:'アロマディフューザー',prompt:'simple unbranded small white ultrasonic diffuser studio photo no logo',ratio:'4:3'},
  gift:{category:'贈答品',prompt:'plain wrapped gift box neutral wrapping paper no logos',ratio:'4:3'},
  car:{category:'乗用車',prompt:'generic modern compact sedan studio side view without company logos or license plates',ratio:'4:3'}
 });
 const product=(id,name,speechName,price,category,source,flags={})=>({
   id,name,speechName,price,category,source,brand:flags.brand||'MUJI',
   details:flags.details||'',priceCheckedAt:'2026-10-27',priceBasis:'official_including_tax',
   reviewed:true,
   assetReady:!!flags.assetReady,
   imageKey:category,
   sourceType:flags.sourceType||'official_detail',
   emoji:flags.emoji||'🛍️',
   questionRoles:flags.roles||['fact','gift'],
   sceneOverrides:flags.sceneOverrides||{},sceneVariant:flags.sceneVariant||null
 });
 // Each price below is copied from an individually opened current official product page.
 const confirmedAdditions=Object.freeze([
  product('muji-eraser-white-small-76726012','無印良品 消しゴム 白・小／76726012','無印の小さな消しゴム',50,'eraser','https://www.muji.com/jp/ja/store/cmdty/detail/4548076726012',{details:'白・小／76726012。単品通常税込価格。',emoji:'⬜'}),
  product('muji-eraser-white-large-76725992','無印良品 消しゴム 白・大／76725992','無印の大きな消しゴム',80,'eraser','https://www.muji.com/jp/ja/store/cmdty/detail/4548076725992',{details:'白・大／76725992。単品通常税込価格。',emoji:'⬜'}),
  product('muji-eraser-black-small-76726036','無印良品 消しゴム 黒・小／76726036','無印の小さな消しゴム',50,'eraser','https://www.muji.com/jp/ja/store/cmdty/detail/4548076726036',{details:'黒・小／76726036。単品通常税込価格。',emoji:'⬛'}),
  product('muji-underlay-pet-b5-83904333','無印良品 PET下じき B5／83904333','無印の下敷き',150,'underlay','https://www.muji.com/jp/ja/store/cmdty/detail/4550583904333',{details:'B5用・PET製／83904333。単品通常税込価格。',emoji:'📄'}),
  product('muji-correction-pen-white-15138173','無印良品 修正ペン 白／15138173','無印の修正ペン',190,'correction_pen','https://www.muji.com/jp/ja/store/cmdty/detail/4547315138173',{details:'白・小型修正ペン／15138173。単品通常税込価格。',emoji:'🖊️'})
 ]);
 // Expansion backlog: labels/categories only; no guessed official prices, no gameplay eligibility.
 const researchBacklog=Object.freeze([
  {id:'muji-tape-research',name:'無印良品 修正テープ本体',category:'correction_tape',source:'https://www.muji.com/jp/ja/store/cmdty/section/S1070327',status:'needs_product_page'},
  {id:'muji-stapler-research',name:'無印良品 針を使わないステープラー',category:'paper',source:'https://www.muji.com/jp/ja/store/cmdty/section/T20017',status:'needs_product_page'},
  {id:'kinto-mug-research',name:'KINTO SCS-S03 マグ320ml',category:'mug',source:'https://kinto.co.jp/products/20754',status:'needs_price_recheck'},
  {id:'hario-dripper-research',name:'HARIO×たち吉 V60透過ドリッパー02',category:'coffee',source:'https://shop.hariocorp.co.jp/products/t-vdt-02-ob',status:'needs_price_recheck'},
  {id:'snowpeak-mug-research',name:'スノーピーク チタンシングルマグ450',category:'mug',source:'https://ec.snowpeak.co.jp/item/SNP0117A0185',status:'needs_price_recheck'},
  {id:'kokuyo-scissors-research',name:'コクヨ サクサ チタン刃',category:'paper',source:'https://www.kokuyo-shop.jp/sc/ProductDetail.aspx?pcd=4901480395548',status:'needs_price_recheck'},
  {id:'toraya-yokan-research',name:'とらや 小形羊羹5本入',category:'gift',source:'https://checkout.toraya-group.co.jp/products/box-yokan-petite_boxof5',status:'needs_price_recheck'},
  {id:'yokumoku-research',name:'ヨックモック シガール20本入',category:'gift',source:'https://yokumoku.co.jp/products/1010011201030',status:'needs_price_recheck'},
  {id:'ikea-table-research',name:'IKEA LACK サイドテーブル',category:'furniture',source:'https://www.ikea.com/jp/ja/p/lack-side-table-white-10514792/',status:'needs_price_recheck'},
  {id:'balmuda-toaster-research',name:'BALMUDA The Toaster',category:'appliance',source:'https://www.balmuda.com/jp/',status:'needs_price_recheck'}
 ]);
 const getCandidateProductIds=(existing)=>new Set(existing.map(x=>x.id));
 const playable=products=>products.filter(p=>p.reviewed&&p.assetReady&&Number.isSafeInteger(p.price)&&p.price>0&&/^https:\/\//.test(p.source)&&imageCatalog[p.category]);
 const normalizeLegacy=(id,item,imageKey,roles)=>{
  if(!item||!Number.isSafeInteger(item.price))throw new Error('missing legacy product: '+id);
  return {id,name:item.name,speechName:item.speechName||item.name,price:item.price,category:imageKey,
    source:item.url,brand:item.brand,details:item.detail,priceCheckedAt:'2026-10-26',
    priceBasis:'official_including_tax',reviewed:true,assetReady:true,imageKey,
    sourceType:'official_detail',emoji:item.emoji,questionRoles:roles,
    sceneOverrides:item.sceneOverrides||{},sceneVariant:item.sceneVariant||null};
 };
 const chooseSlots=(products,seed,avoid=[])=>{
   const pool=playable(products),recent=new Set(avoid),keys=['buy','fact','gift','present'];
   const hash=(id,salt)=>{
     let x=(seed ^ Math.imul(salt+1,0x9e3779b9))>>>0;
     for(let i=0;i<id.length;i++){x=Math.imul(x^id.charCodeAt(i),0x01000193)>>>0;}
     x=Math.imul(x^(x>>>16),0x85ebca6b);x=Math.imul(x^(x>>>13),0xc2b2ae35);
     return (x^(x>>>16))>>>0;
   };
   const used=new Set(),out={};
   for(let i=0;i<keys.length;i++){
     const role=keys[i],options=pool.filter(x=>x.questionRoles.includes(role)&&!used.has(x.id));
     if(!options.length)throw new Error('Insufficient playable image-covered products for '+role);
     options.sort((a,b)=>Number(recent.has(a.id))-Number(recent.has(b.id)) || hash(a.id,i)-hash(b.id,i) || a.id.localeCompare(b.id));
     const pick=options[0];out[role]=pick;used.add(pick.id);
   }
   return out;
 };
 // Landmark increments are source-backed; do not conflate a building's year with its predecessor.
 const newLandmarks=Object.freeze([
   {name:'横浜赤レンガ倉庫1号館',event:'竣工',year:1913,emoji:'🧱',source:'https://www.city.yokohama.lg.jp/kanko-bunka/minato/taikan/asobu/spot/red-renga/rekishi/history.html',detail:'1号館は1913年竣工。2号館（1911年）と混同しない。',clue:'横浜新港にある赤レンガの倉庫。2号館とは建設年が異なる。'},
   {name:'東京ドームホテル',event:'開業',year:2000,emoji:'🏨',source:'https://www.tokyo-dome.jp/company/history/',detail:'東京ドームホテルは2000年6月1日開業。東京ドーム本体の開場は1988年。',clue:'東京ドームシティの高層ホテル。ドーム本体より後から開業した。'},
   {name:'ラクーア（東京ドームシティ）',event:'開場',year:2003,emoji:'♨️',source:'https://www.tokyo-dome.jp/company/history/',detail:'LaQuaは2003年5月1日に開場した。',clue:'天然温泉や商業施設などを備える複合施設。2000年代に開場した。'},
   {name:'後楽園ゆうえんち（現在のアトラクションズ）',event:'開場',year:1955,emoji:'🎡',source:'https://www.tokyo-dome.jp/company/history/',detail:'後楽園ゆうえんちは1955年7月9日に開場した。現在の名称への変更は別の年。',clue:'東京の中心部に誕生した老舗遊園地。昭和の半ばから営業していた。'},
   {name:'東京ドームシティ ASOBono!',event:'開場',year:2011,emoji:'🧸',source:'https://www.tokyo-dome.jp/company/history/',detail:'ASOBono!は2011年8月19日に開場した。',clue:'東京ドームシティの屋内キッズ施設。平成後期にオープンした。'},
   {name:'シアターGロッソ',event:'開場',year:2009,emoji:'🎭',source:'https://www.tokyo-dome.jp/company/history/',detail:'シアターGロッソは2009年4月25日開場。',clue:'東京ドームシティのヒーローショー会場。2000年代の終わり頃に開場。'},
   {name:'東京ドームシティ Gallery AaMo',event:'開場',year:2017,emoji:'🖼️',source:'https://www.tokyo-dome.jp/company/history/',detail:'Gallery AaMoは2017年4月15日に開場した。',clue:'東京ドームシティの展示スペース。2010年代に開場した。'}
 ]);
 const validate=()=>{
  const seen=new Set();
  for(const p of confirmedAdditions){
    if(seen.has(p.id)||!imageCatalog[p.imageKey]||!p.source.startsWith('https://')||!Number.isSafeInteger(p.price))throw new Error('catalog product invalid '+p.id);seen.add(p.id);
  }
  for(const l of newLandmarks)if(!Number.isInteger(l.year)||!/開業|開場|竣工/.test(l.event)||!l.source)throw new Error('catalog landmark invalid '+l.name);
  return true;
 };
 validate();
 const API=Object.freeze({VERSION:'1.0.0',imageCatalog,confirmedAdditions,researchBacklog,newLandmarks,playable,normalizeLegacy,chooseSlots,validate});
 root.N1Catalog=API;if(typeof module!=='undefined'&&module.exports)module.exports=API;
})(typeof window!=='undefined'?window:globalThis);
