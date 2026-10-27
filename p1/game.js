'use strict';
/* P1 v0.9.6-beta. All content is fictitious. No network calls beyond story.json. */
const APP=document.getElementById('app');
const SAVE='short-ui-games-p1-v090';
const DAYS=['10月12日（月）','10月13日（火）','10月14日（水）','10月15日（木）','10月16日（金）','10月17日（土）','10月18日（日）'];
const REPORTERS=[['S','佐伯','行政・予算'],['K','桐谷','経済・企業'],['M','森下','医療・現場'],['O','大野','観光・地域'],['B','黒田','社会問題']];
const REPORTER_PROFILES={
 S:{trait:'慎重で寡黙。数字と手続きを突き合わせるのが得意。',reason:'行政の決定が、どんな資料に基づくのかを追う。',voice:['「発表資料の一行目より、脚注を確認したいですね。」','「決まった、で終わらせず。誰が何を決めたのかを残します。」']},
 K:{trait:'理屈っぽく現実的。企業の言葉を数字に置き換える。',reason:'投資や支援の実現条件を、企業と金融機関に確かめる。',voice:['「『検討中』は、出資したことにはなりませんから。」','「いい話ほど、条件が小さな字で書かれています。」']},
 M:{trait:'聞き上手で粘り強い。現場の声をじっくり拾う。',reason:'政策で暮らしが変わる人の声と、運営実態を確かめる。',voice:['「数字の向こうに、今日も診察を待つ人がいます。」','「病院の将来も大事です。今日の患者さんも同じくらい。」']},
 O:{trait:'人懐っこい行動派。立場の違う人をつなぐのが得意。',reason:'観光と住民の暮らしが両立する道を取材する。',voice:['「賛成か反対かの前に、地元の話を聞きませんか。」','「いい計画なら、誰の毎日が変わるのか知りたいです。」']},
 B:{trait:'疑い深いが早合点はしない。資料の食い違いを見逃さない。',reason:'不審な点を調べ、疑惑と確認済みの事実を分ける。',voice:['「おかしい、だけじゃ記事にはなりません。」','「噂の出どころを確かめてから、書きましょう。」']}
};
function reporterRoster(expanded=false){
 return `<details class="panel reporter-roster" ${expanded?'open':''}><summary>編集部の記者5人｜性格と意気込みを見る</summary><p class="small muted">記者によって取材の切り口が変わります。全員、4つのテーマを担当できます。</p><div class="reporter-grid">${REPORTERS.map(([id,name,skill])=>{const p=REPORTER_PROFILES[id];return `<div class="reporter-bio"><h4>${esc(name)} <span>${esc(skill)}</span></h4><p>${esc(p.trait)}</p><p class="reporter-quote">${esc(p.voice[0])}</p></div>`}).join('')}</div></details>`
}
function missionReference(){
 return `<details class="panel mission-reference"><summary>因果観察室からの任務指示を確認する</summary><p class="small"><b>役割：</b>2026年10月12〜18日の東雲日報・臨時編集担当。紙面に掲載する事実とその大きさを選び、2027年の県の姿を観測する。</p><p class="small"><b>復元する未来：</b>中央病院の存続／霧峰高原の観光開発／千鳥湿原の保護区域維持。</p><p class="small"><b>制約：</b>三分野すべてに公費を投入する余裕はありません。企業や住民の選択も重要です。</p><p class="small muted">事実そのものを書き換えることはできません。掲載しない出来事も、県内では進みます。</p></details>`
}
const TOPICS=[['H','医療'],['T','観光'],['E','自然環境'],['G','県政・財政']];
const NEWS={H:['N01','N02','N03','N04'],T:['N05','N06','N07','N08'],E:['N09','N10','N11','N12'],G:['N13','N14','N15','N16']};
const AT={I01:'H',I02:'T',I03:'E',I04:'H',I05:'H',I06:'T',I07:'E',I08:'T',I09:'H',I10:'T',I11:'E',I12:'H',I13:'H',I14:'T',I15:'E',I16:'T',I17:'H',I18:'T',I19:'E',I20:'E',N13:'H',N14:'T',N15:'E',N16:'H'};
const EVIDENCE={I01:'public_h',I02:'permits_t',I03:'public_e',I05:'private_h',I06:'investment_t',I09:'reform_h',I14:'eco_tour',I15:'community_e',I19:'survey_e'};
const ARTICLE_LEADS={I01:['hospital_budget'],I05:['hospital_staff'],I06:['eco_joint'],I09:['land_h'],I14:['tourism_capital'],I19:['wetland_map'],N01:['hospital_budget'],N05:['tourism_capital'],N09:['wetland_map'],N13:['hospital_staff'],N14:['tourism_levy'],N15:['ecology_data']};
const LEAD_RULES={land_h:['BH','KH'],hospital_budget:['SH','SG'],hospital_staff:['MH','MG'],tourism_capital:['KT','KG'],development_land:['BT','ST'],wetland_map:['BE','SE'],eco_joint:['OT','OE'],medical_tourism:['MT','OH'],public_records:['BG','SG'],ecology_data:['ME','BE'],conservation_finance:['KE','OE'],tourism_levy:['OG','ST']};
const REACTION_LEADS={R03:'hospital_staff',R06:'medical_tourism',R08:'wetland_map',R09:'tourism_levy',R12:'hospital_budget',R16:'wetland_map',R17:'wetland_map',R18:'ecology_data',R21:'hospital_budget',R22:'public_records',R24:'development_land',R25:'ecology_data',R27:'public_records',R29:'hospital_staff',R30:'hospital_staff',R31:'tourism_capital',R32:'tourism_capital',R33:'eco_joint',R35:'conservation_finance',R38:'wetland_map',R41:'land_h',R42:'hospital_budget',R43:'tourism_capital',R44:'wetland_map',R49:'ecology_data'};
const CHANNEL={R01:'読者投書',R02:'読者投書',R03:'SNS',R04:'観光事業者',R05:'SNS',R06:'SNS',R07:'読者投書',R08:'北部住民',R09:'県議会事務局',R10:'SNS',R11:'県議会議員',R12:'SNS',R13:'SNS',R14:'SNS',R15:'SNS',R16:'SNS',R17:'住民団体',R18:'SNS',R19:'SNS',R20:'SNS',R21:'県医療政策課',R22:'県議会議員',R23:'県議事務所',R24:'県観光課',R25:'研究者',R26:'県財政課',R27:'SNS',R28:'新聞社・校閲部',R29:'医療従事者',R30:'県内企業連合',R31:'SNS',R32:'SNS',R33:'SNS',R34:'広告主',R35:'保全団体',R36:'読者投書',R37:'校閲部',R38:'北部支局',R39:'地元テレビ',R40:'読者投書',R41:'匿名投書',R42:'県医療政策課',R43:'観光事業者',R44:'匿名投書',R45:'差出人不明',R46:'差出人不明',R47:'SNS',R48:'SNS',R49:'SNS',R50:'読者投書'};
const LABEL={H:'地域医療',T:'観光開発',E:'自然保護',G:'県政・財政'};
const ADMIN_NEWS=new Set(['N13','N14','N15','N16','C08']);
// Section is what the paper reports; topic() remains the social issue affected by coverage.
function section(a){return a?.topicCode==='G'||ADMIN_NEWS.has(a?.id)?'G':topic(a)}
function sectionCaption(a){const k=section(a),impact=topic(a);return k==='G'?`${LABEL.G}（${LABEL[impact]}に関係）`:LABEL[k]}

let database=null, articles={}, reactions={}, s=null;
const esc=(v)=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrUnique=a=>[...new Set(a)];
const topic=a=>AT[a.id]||a.publicAttentionTopic||a.topicCode||('H');
const header=(small,big,description='')=>`<p class="kicker">${esc(small)}</p><h1 class="headline">${esc(big)}</h1>${description?`<p class="lede">${esc(description)}</p>`:''}`;
const status=()=>`<div class="status"><span>第 ${s.day} 日／7日</span><span>公的支援上限：2分野</span><span>発行済 ${s.history.length} 紙</span></div>`;
function random(){s.random=(s.random+0x6D2B79F5)>>>0;let t=s.random;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296}
function choice(a){return a[Math.floor(random()*a.length)]}
function init(seed){s={version:9,stage:'intro',day:1,random:seed>>>0,variant:'none',att:{H:0,T:0,E:0},evidence:[],small:{},budget:2,leads:[],verified:[],reactionsSeen:[],reactionLeads:[],verifiedReactionLeads:[],lastVerifiedLeads:[],latestReactions:[],history:[],publishedIds:[],outcomes:{},carry:null,research:[],candidates:[],slots:[null,null,null,null],trace:[],lastDecisions:[],lastAttention:{H:0,T:0,E:0},lastPaper:[]};s.variant=choice(['none','H','T','E']);s.newsOrder={};for(const k of 'HTEG'){const list=NEWS[k].slice();for(let i=list.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[list[i],list[j]]=[list[j],list[i]]}s.newsOrder[k]=list}save()}
function save(){try{localStorage.setItem(SAVE,JSON.stringify(s))}catch(e){/* private mode */}}
function restore(){try{const old=JSON.parse(localStorage.getItem(SAVE));if(old?.version===9&&old.day>=1&&old.day<=7&&['intro','morning','newsroom','published','ending'].includes(old.stage))return old}catch(e){}return null}
function seen(id){return s.publishedIds.includes(id)}
function previouslyPrinted(id){return s.history.some(h=>h.day<s.day&&h.published.includes(id))}
function newspaper(slots,small=false){const pieces=slots.map(id=>id&&articles[id]);return `<section class="paper" aria-label="組版済み新聞プレビュー"><div class="masthead"><h2>東雲日報</h2><time>2026年<br>${esc(DAYS[s.day-1])}</time></div>${pieces.map((a,i)=>i<2?`<div class="front ${i?'second':'top'}"><small>${i?'準トップ':'一面トップ'}　${a?esc(sectionCaption(a)):'未設定'}</small><h3>${a?esc(previouslyPrinted(a.id)?'続報｜'+(s.candidates.find(z=>z.id===a.id)?.displayHeadline||a.headline):(s.candidates.find(z=>z.id===a.id)?.displayHeadline||a.headline)):'記事を選択してください'}</h3>${a?`<p class="brief">${esc((s.candidates.find(z=>z.id===a.id)?.displayBody||a.body||'').slice(0,i?72:110))}${small?'': '…'}</p>`:''}</div>`:'').join('')}<div class="mini-grid">${pieces.slice(2).map((a,i)=>`<div class="front mini"><small>小記事${i+1}</small><h3>${a?esc(s.candidates.find(z=>z.id===a.id)?.displayHeadline||a.headline):'未設定'}</h3></div>`).join('')}</div></section>`}
function initialSituation(){
 return {
  H:'県内情勢：病院の再建を巡り住民の意見が分かれています。支援の必要性を広く伝えるには丁寧な報道が求められます。',
  T:'県内情勢：観光開発の採算性に慎重な企業が多く、投資への支持を広げるには追加の説明が必要です。',
  E:'県内情勢：湿原保護の重要性は地域外では十分に知られておらず、県全体へ議論を広げる必要があります。',
  none:'県内情勢：医療・観光・自然の各課題に関心が分かれ、どの論点が議題になるかは今後の報道次第です。'
 }[s.variant]||'';
}
function requiredAttention(k){
 const corroboration={
  H:['hospital_budget','hospital_staff','land_h'],
  T:['tourism_capital','eco_joint','tourism_levy'],
  E:['wetland_map','ecology_data','conservation_finance']
 };
 return 6+(s.variant===k?1:0)-(corroboration[k].some(t=>(s.verifiedReactionLeads||[]).includes(t))?1:0);
}
function briefingText(){
 const d=s.day,t=[],a=s.att,ev=s.evidence,has=x=>ev.includes(x);
 if(d===1)return ['中央病院では人員不足が続き、霧峰高原では観光計画、千鳥湿原では保護指定の行方が問題です。','取材で見つけた事実は、紙面に載せて初めて広く知られます。三分野すべてを公費だけで支えることはできません。',initialSituation()];
 if(!has('public_h')&&!has('private_h'))t.push('病院：存続に向けた具体的な資金支援案が、まだ広く報じられていません。');
 else if(a.H<5)t.push('病院：支援案は報じられましたが、地域での議論はまだ広がりきっていません。');
 else if(has('private_h')&&!has('reform_h'))t.push('病院：企業の支援案は知られ始めました。医療機関同士の連携も論点になっています。');
 else t.push('病院：救済案への関心が広がり、実行体制が議論されています。');
 if(!has('investment_t'))t.push('観光：開発への期待だけでなく、誰がどの条件で出資するかの確認が必要です。');
 else if(a.T<5)t.push('観光：出資の条件は知られていますが、実現に向けた支持の広がりはまだ限定的です。');
 else if(!has('eco_tour')&&!has('permits_t'))t.push('観光：資金の議論は進んでいます。許認可や自然との両立は未解決です。');
 else t.push('観光：投資条件と開発方式について議論が進んでいます。');
 if(a.E<5)t.push('湿原：保護を求める声は、県全体の大きな議論にはなっていません。');
 else if(!has('survey_e')&&!has('public_e'))t.push('湿原：自然への関心が増えています。保護区域の根拠と管理計画を確かめる必要があります。');
 else t.push('湿原：保全の根拠は知られ始めました。継続的な管理費と担い手が問われています。');
 if(d===4)t.push(initialSituation());
 if(d===7){t.push(initialSituation());t.push('今日も通常の取材と紙面編集ができます。今夜の最終号までの報道を踏まえ、一年後の姿が決まります。')}
 return t
}
function intro(){
 APP.innerHTML=`<div class="stage intro-stage">
 ${header('N国・因果観察室｜観測記録 P1','明日の一面を決めてください。','2026年10月12日。東雲県の地方紙に、あなたが臨時編集担当として入ります。')}
 <section class="dossier"><p class="dossier-label">因果観察室／観測差分報告書</p>
 <p>2027年の東雲県では、県立中央病院が縮小し、霧峰高原の観光計画が止まり、千鳥湿原の保護区域も失われかけている。</p>
 <p>しかし、因果観察室の記録には、<b>病院・観光・自然がすべて守られた別の未来</b>が残っていた。</p>
 <p class="dossier-dialogue">「事故が起きたわけではない。誰か一人が間違えたわけでもない。県民と企業と行政が、少しずつ違う判断を積み重ねた結果だ」</p>
 <p>調査で分かったのは、その判断を左右する大きな接点が、県内最大の新聞『東雲日報』だったということ。</p>
 <p>あなたに与えられるのは、<b>2026年10月12日から18日までの7日間の編集権限</b>。取材する記者を決め、記事を選び、どのニュースを一面に載せるか決める。</p>
 <p class="dossier-dialogue">「事実を作る必要はない。ただ、県が何を知るかは、君の紙面で変わる」</p>
 </section>
 <section class="panel"><h3>取り戻す、3つの未来</h3>
 <ul class="objective-list"><li><b>医療</b>　県立中央病院が存続する</li><li><b>観光</b>　霧峰高原の大型観光計画が実現する</li><li><b>自然</b>　千鳥湿原の保護区域が維持される</li></ul>
 <p class="small">行政の予算は限られています。三つを同時に実現するには、公的支援だけでなく、企業や住民の判断も変わる必要があります。</p>
 </section>
 ${reporterRoster(true)}
 <section class="panel"><h3>あなたの仕事は、毎日2つ</h3>
 <ol class="intro-steps"><li><b>記者2人に取材テーマを指定する。</b> 5人の記者は、それぞれ異なる切り口で情報を集めます。</li><li><b>集まった記事から紙面の4枠を決める。</b> 一面トップ1本・準トップ1本・小記事2本。新聞は自動で組み上がります。</li></ol>
 <p class="small">翌朝、読者の投書・SNS・政治家や企業からの反響が届きます。噂はそのまま事実にはできません。必要なら記者に裏取りさせてください。</p>
 <p class="small muted">7日目の新聞を発行した後、2027年の県の姿を観測します。報じなかった出来事も消えるわけではありません。</p>
 </section>
 <div class="btn-row"><button class="btn" data-do="start">10月12日｜最初の編集会議へ</button></div>
 </div>`
}
function reactionEligible(ids){const p=s.lastPaper.map(x=>x.id),counts={H:0,T:0,E:0,G:0},sections={H:0,T:0,E:0,G:0};
p.forEach(id=>{counts[topic(articles[id])]++;sections[section(articles[id])]++});const top=topic(articles[p[0]]||{}),att=s.att,prior=s.publishedIds,earlierT=prior.filter(id=>topic(articles[id]||{})==='T').length,earlierH=prior.filter(id=>topic(articles[id]||{})==='H').length,day=s.day;const inc=id=>p.includes(id),hasEvidence=k=>s.evidence.includes(k),ever=id=>prior.includes(id),reactionHas=id=>s.reactionsSeen.includes(id);
const c={R01:counts.H>0&&top==='H',R02:counts.H===0,R03:counts.H>0,R04:counts.T>0,R05:counts.T>=2||att.T>=6,R06:counts.H>0&&counts.T>0,R07:top==='E',R08:counts.E===0,R09:p.some(x=>['I04','I08','I12','I16','I20','N13','N14','N15','N16'].includes(x)),R10:true,R11:top==='H',R12:att.H>=4,R13:att.H>=7,R14:top==='T',R15:earlierT>=4&&att.T>=6,R16:att.T>=6&&att.E<=3,R17:top==='E',R18:inc('I19')||inc('I11'),R19:reactionHas('R22')||reactionHas('R23'),R20:Object.values(sections).filter(x=>x>0).length>=3&&day>=2,R21:inc('I01'),R22:earlierH>=4&&ever('I01'),R23:reactionHas('R22')&&top==='H',R24:inc('I06')||inc('I02'),R25:att.E>=4,R26:day>=3&&att.H>=4&&(att.T>=3||att.E>=3),R27:p.some(x=>['I04','I08','I12','I16','I20','N13','N14','N15','N16'].includes(x)),R28:p.some(x=>x.startsWith('I'))&&day>=2,R29:top==='H',R30:inc('I05'),R31:att.T>=3,R32:att.T>=4&&!hasEvidence('investment_t'),R33:att.T>=3&&att.E>=3,R34:p.some(x=>['I17','I18','I19','I20'].includes(x)),R35:att.E>=5,R36:earlierH>=3&&counts.H>0,R37:earlierT>=4,R38:att.E<=2&&day>=2,R39:s.candidates.some(a=>a.id.startsWith('C')),R40:p.slice(2).some(x=>x.startsWith('I')),R41:att.H>=4,R42:inc('I01'),R43:att.T>=5,R44:att.T>=4&&att.E<=3,R45:day>=4&&att.H>=5&&hasEvidence('public_h'),R46:day>=6&&(reactionHas('R45')||ever('I19')),R47:att.H>=6,R48:day>=5&&att.T>=6&&hasEvidence('investment_t'),R49:att.E>=5,R50:day>=5&&(att.H>=5||att.T>=5||att.E>=5)};return ids.filter(id=>c[id]&&!s.reactionsSeen.includes(id));}
function reactionText(r){return r.revisionSample?.copy||r.baseCopy||'記事について意見が届きました。'}
function reactionList(ids,period='今朝'){const important=ids.filter(id=>REACTION_LEADS[id]||id==='R45'||id==='R46');const rest=ids.filter(id=>!important.includes(id));const ordered=[...important,...rest];const first=ordered.slice(0,3),tail=ordered.slice(3);const card=id=>{const r=reactions[id];return `<div class="${(CHANNEL[id]||'').includes('SNS')?'social':'listening'}"><h4>${esc(r.revisionSample?.channel||CHANNEL[id]||'編集部への連絡')}</h4><p>${esc(reactionText(r))}</p></div>`};return `<h3>届いた反響 <span class="muted small">${ids.length}件</span></h3>${ids.length?first.map(card).join(''):'<p class="small muted">${esc(period)}、新しい連絡はありません。</p>'}${tail.length?`<details><summary>その他の投稿・反響 ${tail.length}件を読む</summary>${tail.map(card).join('')}</details>`:''}<p class="small muted">SNS上の言説や投書は未確認情報を含みます。信頼できる記事にするには取材が必要です。</p>`}
function morning(){const msgs=s.latestReactions;APP.innerHTML=`<div class="stage">${header('東雲日報｜朝の編集会議',`${s.day}日目｜${DAYS[s.day-1]}`,'昨日の報道の反響を確認し、今日の重点取材を決めます。')}${status()}${missionReference()}<section class="panel"><h3>編集長からのメモ</h3>${briefingText().map(x=>`<p class="small">・${esc(x)}</p>`).join('')}</section>${s.day>1?`<section class="panel">${reactionList(msgs)}</section>`:''}${reporterRoster(false)}<section class="panel"><h3>重点取材｜記者とテーマを2組指定</h3><div class="fields">${[0,1].map(i=>`<div class="field"><label class="field-label" for="reporter${i}">派遣記者 ${i+1}</label><select id="reporter${i}" data-reporter="${i}">${REPORTERS.map(([id,name,skill])=>`<option value="${id}" ${id===(i?'B':'S')?'selected':''}>${name}｜${skill}</option>`).join('')}</select><label class="field-label" for="topic${i}" style="margin-top:10px">取材テーマ</label><select id="topic${i}">${TOPICS.map(([id,name])=>`<option value="${id}" ${id===(i?'E':'H')?'selected':''}>${name}</option>`).join('')}</select><p class="reporter-mood" id="reporterMood${i}"></p><p class="small muted" id="hint${i}"></p></div>`).join('')}</div><p id="dispatchError" class="warning" hidden></p><div class="btn-row"><button class="btn" data-do="dispatch">2人を取材に派遣する</button></div></section></div>`;updateHints()}
const ANGLES={
 SH:'病院の救済に使える公費と、予算上の手続きを調べる',
 ST:'観光施設の許認可と、工事を始めるまでの障害を調べる',
 SE:'湿原の保護指定を維持するための条例と手続きを調べる',
 SG:'県の予算資料の違いと、実際に動かせる財源を調べる',
 KH:'地元企業が病院支援に参加できる条件を調べる',
 KT:'観光計画に出資する企業の判断材料を調べる',
 KE:'企業による自然保全基金とその財源を調べる',
 KG:'金融機関が県の資金計画をどう評価するか調べる',
 MH:'医療現場の人員配置と病院間の連携を調べる',
 MT:'観光客の増加と地域救急医療への影響を調べる',
 ME:'水質や自然環境が健康に与える影響を確認する',
 MG:'県の医療費推計と、前提条件の違いを調べる',
 OH:'地域医療と高齢者向け滞在サービスの関係を調べる',
 OT:'自然を守りながら観光開発を進める方法を探る',
 OE:'住民と事業者による湿原保全の協定を調べる',
 OG:'宿泊税など観光財源の使い道を調べる',
 BH:'病院周辺の土地取引に不審な点がないか調べる',
 BT:'観光予定地の土地取引と関係者の説明を照合する',
 BE:'環境調査で対象から外れた区域がないか調べる',
 BG:'県の審査記録と公表説明に食い違いがないか調べる'
};
function updateHints(){
 for(let i=0;i<2;i++){
  const r=document.getElementById('reporter'+i),t=document.getElementById('topic'+i);
  if(!r||!t)return;
  const code=r.value+t.value,id='I'+String(1+REPORTERS.findIndex(x=>x[0]===r.value)*4+TOPICS.findIndex(x=>x[0]===t.value)).padStart(2,'0');
  const done=seen(id),el=document.getElementById('hint'+i);
  if(el)el.textContent=(done?'前回も取材した組み合わせ。引き続き追うと続報になる場合があります。':'取材の切り口：')+(ANGLES[code]||'現地の状況を調べる')+'。';
  const mood=document.getElementById('reporterMood'+i),profile=REPORTER_PROFILES[r.value];
  if(mood&&profile)mood.textContent=profile.voice[s.day>=4?1:0];
 }
}

function chainEligible(){const a=s.att,e=s.evidence;return ['C01','C02','C03','C04','C05','C06','C07','C08'].filter(id=>({C01:a.H>=4,C02:e.includes('public_h')&&a.H>=5,C03:a.T>=4,C04:a.T>=4&&a.E>=3,C05:a.E>=4,C06:e.includes('survey_e'),C07:a.T>=6&&a.E<=2,C08:a.H>=6&&e.includes('public_h')&&a.T>=3})[id])}
const TIME_VARIANTS={
 N13:{from:4,headline:'県議会、中央病院の財源と医療再編を協議',body:'予算の使途と地域医療の維持をめぐって、県議会で議論が続いている。公的支援の規模は、他事業との調整や支援体制の裏付けを踏まえて判断される見通しだ。'},
 N15:{from:6,headline:'千鳥湿原、保護区域と開発計画の調整続く',body:'保護区域を維持するための予算と管理の担い手について、県と関係団体の協議が続いている。開発側からも意見が寄せられている。'},
 N05:{from:5,headline:'霧峰高原の観光構想、事業化へ課題整理',body:'観光事業者と地元関係者が、投資条件や地域雇用への影響を検討している。具体化には環境対応と資金計画をそろえる必要がある。'},
 N08:{from:5,headline:'観光開発の資金計画、関係者が条件を協議',body:'県内の企業や金融機関が、観光事業の収支と用地条件を精査している。県の整備方針も投資判断に関わるという。'},
 N04:{from:4,headline:'中央病院の診療体制、再編に向けて協議続く',body:'医師や看護師の配置と病院間の連携について協議が続いている。支援策があっても、現場の体制を立て直すことが欠かせない。'},
 N16:{from:4,headline:'県内医療ネットワーク、再編方針を検討',body:'中央病院の機能維持と周辺医療機関との連携を巡り、担当部署が実務上の課題を洗い出している。制度変更には調整が必要だ。'}
};
const FOLLOWUP_TITLES={
 N01:'中央病院の待ち時間、診療体制の改善なお課題',
 N02:'中央病院の夜勤体制、人員補充の調整続く',
 N03:'県北部の診療所、医師派遣縮小の影響続く',
 N05:'霧峰高原の開発構想、企業が条件を精査',
 N06:'宿泊需要の伸び、持続性について意見分かれる',
 N07:'高原へのアクセス道路、交通対策を検討',
 N09:'千鳥湿原の希少鳥、保護活動の課題を確認',
 N10:'県北部の河川、水質変化の原因調査続く',
 N11:'登山道の復旧、管理の担い手確保が課題',
 N13:'中央病院の運営費、県議会で協議続く',
 N14:'宿泊税の使途、観光と環境保全で意見分かれる',
 N15:'千鳥湿原の保護指定、維持管理費も論点に'
};
const FOLLOWUP_INV={
 I01:'病院向け県費の活用、議会手続きが焦点',
 I05:'企業の病院出資案、診療連携の条件を再確認',
 I06:'高原開発への出資、環境対策の見通しが焦点',
 I09:'中央病院の診療連携、調整の行方',
 I14:'環境共生型観光案、費用とルートを再検討',
 I15:'湿原の保全協定、負担と管理責任を協議',
 I19:'湿原周辺の環境調査、追加検証が焦点'
};
function displayArticle(a){
 const v=TIME_VARIANTS[a.id],base=v&&s.day>=v.from?v:a;
 if(!seen(a.id))return base;
 const suffix=a.id.startsWith('I')
  ?'前回の取材内容を踏まえ、関係者への追加照会を続けている。現時点で最終決定は出ていない。'
  :'前回の記事以降も、住民や担当者が対応の行方を注視している。課題の解決には継続的な確認が必要だ。';
 return {headline:FOLLOWUP_TITLES[a.id]||FOLLOWUP_INV[a.id]||base.headline,body:base.body+' '+suffix};
}
function makeCandidates(pairs){
 const articleCode=([r,t])=>`I${String(1+REPORTERS.findIndex(x=>x[0]===r)*4+TOPICS.findIndex(x=>x[0]===t)).padStart(2,'0')}`;
 const codes=pairs.map(articleCode);
 const scheduled=t=>(s.newsOrder?.[t]||NEWS[t])[(s.day-1)%4];let ids=['H','T','E','G'].map(scheduled).concat(codes);
 const carry=s.carry;s.carry=null;
 if(carry&&!ids.includes(carry.id)){ids=ids.filter(x=>x!==scheduled('G'));ids.push(carry.id)}
 const chain=chainEligible();if(chain.length)ids.push(choice(chain));ids=arrUnique(ids);
 s.candidates=ids.map(id=>{
  const a=articles[id];const pair=pairs.find(p=>articleCode(p)===id);
  const lead=pair&&a.leadVariant?.leadToken&&s.leads.includes(a.leadVariant.leadToken)&&LEAD_RULES[a.leadVariant.leadToken]?.includes(pair.join(''))?a.leadVariant.leadToken:null;
  const resolved=lead||(carry?.id===id?carry.lead:null)||null;
  const view=displayArticle(a);
  const extra=resolved&&a.leadVariant?.leadToken===resolved?a.leadVariant.body:null;
  const displayBody=extra?(seen(id)?view.body+' 追加取材では、'+extra:extra):view.body;
  return {id,lead:resolved,carried:carry?.id===id,displayHeadline:view.headline,displayBody}

 });
 s.slots=[null,null,null,null];s.research=pairs;s.stage='newsroom';save();
}
function articleList(){return s.candidates.map(a=>{const d=articles[a.id],prior=seen(a.id);return `<div class="article"><div class="labels"><span class="pill ${a.id.startsWith('I')?'':'pale'}">${a.carried?'前日の取材':a.id.startsWith('I')?'重点取材':a.id.startsWith('C')?'続報・派生':'一般記事'}</span><span class="small muted">${esc(sectionCaption(d))}</span></div><h3>${esc(prior?'続報｜'+a.displayHeadline:a.displayHeadline)}</h3><p>${esc(a.displayBody)}</p>${a.carried?'<p class="small muted">前日に取材し、掲載を保留していた記事です。</p>':''}${a.lead?`<p class="small"><b>追加調査済み：</b>${(s.reactionLeads||[]).includes(a.lead)?'届いた投書・反響を記者が照合しました。':'以前の報道を手掛かりに追加取材しました。'}</p>`:''}</div>`}).join('')}
function slotsForm(){return `<div class="slots">${['一面トップ','準トップ','小記事①','小記事②'].map((slot,i)=>`<div class="slot"><label for="slot${i}">${slot}</label><select id="slot${i}" data-slot="${i}"><option value="">掲載する記事を選ぶ</option>${s.candidates.map(a=>`<option value="${a.id}" ${s.slots[i]===a.id?'selected':''}>${esc(a.displayHeadline)}</option>`).join('')}</select></div>`).join('')}</div>`}
function newsroom(){APP.innerHTML=`<div class="stage">${header('東雲日報｜紙面編集',`${s.day}日目の紙面を組む`,'取材で確認した情報から4本掲載してください。紙面の見た目は自動配置されます。')}${status()}<div class="note">一面トップは影響が大きく、小記事は届く範囲が限られます。掲載しない記事の出来事も、社会では進行し続けます。</div><div class="newsroom"><section id="articlePool"><h2 style="font-size:1rem">届いた記事 ${s.candidates.length}本</h2><p class="editor-jump"><a href="#paperEditor">掲載する記事を決める ↓</a></p>${articleList()}</section><section id="paperEditor"><h2 style="font-size:1rem">掲載枠を選ぶ</h2><p class="editor-jump"><a href="#articlePool">記事一覧へ戻る ↑</a></p>${slotsForm()}<h2 style="font-size:1rem;margin-top:22px">一面プレビュー</h2><div id="preview">${newspaper(s.slots,true)}</div><div class="footer-controls"><p class="small muted" id="slotCounter">${s.slots.filter(Boolean).length}／4本設定</p><button class="btn" id="publish" data-do="publish" ${new Set(s.slots.filter(Boolean)).size===4?'':'disabled'}>この紙面で発行する</button></div></section></div></div>`}
function setSlot(i,val){
 if(!val){s.slots[i]=null}else{const j=s.slots.indexOf(val);if(j>=0&&j!==i)s.slots[j]=s.slots[i]||null;s.slots[i]=val}
 for(let j=0;j<4;j++)document.getElementById('slot'+j).value=s.slots[j]||'';
 document.getElementById('preview').innerHTML=newspaper(s.slots,true);
 document.getElementById('slotCounter').textContent=s.slots.filter(Boolean).length+'／4本設定';
 document.getElementById('publish').disabled=s.slots.some(x=>!x)||new Set(s.slots).size!==4;
 save();
}
function chooseEvidence(a,i){const ev=EVIDENCE[a.id];if(!ev)return null;if(i<2){if(!s.evidence.includes(ev))s.evidence.push(ev);return ev}const n=s.small[a.id]=(s.small[a.id]||0)+1;if(n>=2&&!s.evidence.includes(ev)){s.evidence.push(ev);return ev}return null}
function decide(){
 if(s.day!==7)return {};
 const e=new Set(s.evidence),a=s.att,has=k=>e.has(k);
 const req=requiredAttention;
 const result={H:'failed',T:'failed',E:'failed'};
 const privateRoutes={
  H:a.H>=req('H')&&has('private_h')&&has('reform_h')&&a.T>=3,
  T:a.T>=req('T')&&has('investment_t')&&has('eco_tour')&&a.E>=4,
  E:a.E>=req('E')&&has('community_e')&&has('survey_e')&&has('eco_tour')
 };
 const publicRoutes={
  H:a.H>=req('H')&&has('public_h'),
  T:a.T>=req('T')&&has('investment_t')&&has('permits_t'),
  E:a.E>=req('E')&&(has('public_e')||has('survey_e'))
 };
 for(const k of 'HTE')if(privateRoutes[k])result[k]=k==='T'?'private_eco':'private';
 const eligible=[...'HTE'].filter(k=>result[k]==='failed'&&publicRoutes[k]);
 eligible.sort((x,y)=>(a[y]-req(y))-(a[x]-req(x))||'HTE'.indexOf(x)-'HTE'.indexOf(y));
 for(const k of eligible.slice(0,s.budget)){result[k]='public';s.budget--}
 s.outcomes=result;
 return {...result}
}
const RES_NAMES={H:{public:'行政支援で病院存続',private:'民間出資で病院存続',failed:'病院の規模を縮小'},T:{public:'行政主導の観光開発',private_eco:'民間主導の共生型開発',failed:'観光計画は凍結'},E:{public:'公的管理で保護区域維持',private:'民間協定で保護区域維持',failed:'保護区域を一部変更'}};
function getReactions(){const eligible=reactionEligible(Object.keys(reactions));const count=Math.min(8,Math.floor(random()*9),eligible.length);let chosen=[];const preferred=eligible.filter(id=>REACTION_LEADS[id]);if(preferred.length&&count>0&&random()<.7){const id=choice(preferred);chosen.push(id)}while(chosen.length<count){const pool=eligible.filter(x=>!chosen.includes(x));if(!pool.length)break;chosen.push(choice(pool))}for(const id of chosen){s.reactionsSeen.push(id);const token=REACTION_LEADS[id];if(token){if(!s.leads.includes(token))s.leads.push(token);if(!s.reactionLeads?.includes(token)){s.reactionLeads=s.reactionLeads||[];s.reactionLeads.push(token)}}}return chosen}
function publish(){if(s.slots.some(x=>!x)||new Set(s.slots).size!==4)return;const prev=Object.assign({},s.att),earned={H:0,T:0,E:0};for(const k of 'HTE')s.att[k]=Math.max(0,s.att[k]-1);const published=s.slots.map(id=>s.candidates.find(a=>a.id===id));const proof=[];s.lastVerifiedLeads=[];published.forEach((a,i)=>{const weight=[3,2,1,1][i],t=topic(articles[a.id]);if(earned[t]!==undefined)earned[t]+=weight;const gained=chooseEvidence(a,i);if(gained)proof.push({id:a.id,evidence:gained,slot:i});if(a.lead&&!s.verified.includes(a.lead))s.verified.push(a.lead);
 if(a.lead&&i<2&&(s.reactionLeads||[]).includes(a.lead)){s.verifiedReactionLeads=s.verifiedReactionLeads||[];if(!s.verifiedReactionLeads.includes(a.lead))s.verifiedReactionLeads.push(a.lead);s.lastVerifiedLeads.push(a.lead)}if(a.lead)s.trace.push({day:s.day,type:'verification',id:a.id,lead:a.lead});(ARTICLE_LEADS[a.id]||[]).forEach(x=>{if(!s.leads.includes(x))s.leads.push(x)})});for(const k of 'HTE')s.att[k]=Math.min(12,s.att[k]+earned[k]);const outcomes=decide();s.lastAttention=prev;s.lastDecisions=[];s.lastPaper=published;s.publishedIds.push(...s.slots);const unused=s.candidates.filter(a=>a.id.startsWith('I')&&!s.slots.includes(a.id));if(s.day<7&&unused.length){const deadlines={H:7,T:7,E:7,G:7};unused.sort((a,b)=>(deadlines[topic(articles[a.id])]||7)-(deadlines[topic(articles[b.id])]||7));s.carry={id:unused[0].id,lead:unused[0].lead}}else s.carry=null;
s.trace.push({day:s.day,type:'paper',top:published[0].id,second:published[1].id,unprinted:s.candidates.filter(a=>!s.slots.includes(a.id)).map(a=>a.id),proof:proof.map(x=>x.evidence),decision:outcomes});s.latestReactions=getReactions();s.history.push({day:s.day,headlines:published.map(x=>x.displayHeadline),published:s.slots.slice(),unprinted:s.candidates.filter(a=>!s.slots.includes(a.id)).map(a=>a.id),attention:{...s.att},earned,budget:s.budget,decision:outcomes,reactions:s.latestReactions.slice()});s.stage='published';save()}
function publicationFeedback(){
 const last=s.history.at(-1),topArticle=articles[last.published[0]],top=topic(topArticle),paperSection=section(topArticle),a=s.att,e=s.evidence,notes=[];
 if(paperSection==='G')notes.push('県政・財政に関する報道を受け、関係部署に説明を求める声が出ています。');
 else if(top==='H')notes.push(e.includes('public_h')?'病院支援の財源についてこれまでに報じた内容を巡り、県の予算担当者が説明を求められています。':e.includes('private_h')?'病院再建を巡る企業の動きが、地域の関心を集めています。':'中央病院の現状について、医療関係者から追加取材を求める声が出ています。');
 else if(top==='T')notes.push(e.includes('investment_t')?'これまでの投資条件の報道も踏まえ、観光事業者の間で計画の実現性が話題になっています。':'観光計画の話題が広がる一方、事業資金については確認を求める声が続いています。');
 else if(top==='E')notes.push(e.includes('survey_e')?'これまでの湿原の調査報道を踏まえ、地域の保護団体が資料の公開を求めています。':'湿原への関心が高まり、管理の費用や区域について意見が分かれています。');
  if(a.H>=6&&e.includes('reform_h'))notes.push('医療機関の連携案が広く知られ、経営再建の実現性が議論されています。');
 else if(a.T>=6&&e.includes('eco_tour'))notes.push('環境に配慮した観光案を巡り、投資と保全の両立が話題になっています。');
 else if(a.E>=6&&e.includes('community_e'))notes.push('住民参加の保全協定案が注目され、資金確保の方法が議論されています。');
 if(s.lastVerifiedLeads?.length)notes.unshift('読者・関係者から届いた手掛かりを裏取りした記事が大きく報じられ、議論の根拠が増えました。');if(s.day===7)notes.push('最終号を発行しました。7日間の新聞が積み重ねた影響は、1年後に明らかになります。');
 return notes.slice(0,2);
}
function published(){const last=s.history.at(-1);APP.innerHTML=`<div class="stage">${header('東雲日報｜朝刊発行',`${s.day}日目の新聞が発行されました。`,s.day===7?'最終号までの報道が出そろいました。届いた反響を確認し、1年後を観測してください。':'一面に何を載せたかが、翌日以降の判断を変えていきます。')}<div class="columns"><div>${newspaper(last.published)}</div><div><div class="panel"><h3>発行後の県内</h3><p class="small">県内の関心：医療 ${s.att.H} ／ 観光 ${s.att.T} ／ 自然 ${s.att.E}</p><p class="small muted">これは新聞社の推定指標です。具体的な政策判断には取材で得た根拠も必要です。</p><div class="note">${publicationFeedback().map(x=>`<p class="small">${esc(x)}</p>`).join('')}</div>${s.day===3?'<div class="note">中間観測：3日間の報道が県内の議論に影響しています。ただし、記事が注目されたことと、政策や投資が決まったことは別です。</div>':''}<p class="small">未掲載 ${last.unprinted.length}本。報道しなかった問題も県内では進行しています。</p></div><div class="panel">${s.day===7?reactionList(s.latestReactions,'発行後は'):`<h3>初動の反響</h3>${s.latestReactions.length?`<p class="small">新しい連絡 ${s.latestReactions.length}件。${esc(reactionText(reactions[s.latestReactions[0]]))}</p>`:'<p class="small muted">今のところ目立った連絡はありません。</p>'}<p class="small muted">翌朝の編集部受信箱で確認できます。</p>`}</div></div></div><div class="btn-row"><button class="btn" data-do="next">${s.day===7?'1年後の東雲県を観測する':'翌朝の編集会議へ'}</button></div></div>`}
function outcomeText(k){const v=s.outcomes[k];return ({H:{public:'公的支援を受け、中央病院は地域の総合医療を維持しています。',private:'県内企業の支援と診療連携により、中央病院の経営は立て直されました。',failed:'中央病院は機能を縮小し、県北部の通院負担が増えました。'},T:{public:'県の基盤整備支援を受け、霧峰高原の観光拠点は第一期施設が開業しました。周辺整備も進み、県内に新たな雇用が生まれています。',private_eco:'湿原の保護区域を避けた民間主導の観光拠点が先行開業しました。周辺整備は続き、地域資源を生かした観光が始まっています。',failed:'投資と事業条件がまとまらず、霧峰高原の開発計画は凍結されました。'},E:{public:'県による保全体制が整い、千鳥湿原の保護区域は維持されました。',private:'住民団体と地元事業者の保全協定が成立し、管理費と役割の分担を決めて保護区域が維持されました。',failed:'管理財源と保護方針がまとまらず、湿原の保護区域は一部変更されました。'}})[k][v]}
function outcomeReason(k){
 const v=s.outcomes[k],e=s.evidence,a=s.att,req=requiredAttention(k);
 const eligibleForPublic=k==='H'?e.includes('public_h'):k==='T'?e.includes('investment_t')&&e.includes('permits_t'):e.includes('public_e')||e.includes('survey_e');
 if(k==='H'){
  if(v==='public')return '県費活用の取材が広く報じられ、病院支援をめぐる行政の判断を後押ししました。';
  if(v==='private')return '企業の出資条件と医療機関の連携案が伝わりました。地域経済への期待も後押しとなり、民間による病院再建につながりました。';
  if(a.H>=req&&eligibleForPublic)return '病院の公的支援に必要な根拠と関心は整いましたが、限られた行政支援枠が他の事業へ配分され、存続には届きませんでした。';
  if(!e.includes('public_h')&&!e.includes('private_h'))return '経営危機は続きましたが、行政や企業が動くための具体的な支援策は十分に知られませんでした。';
  if(a.H<req)return '支援策は記事になったものの、県内で継続的な議論になるほどの関心は集まりませんでした。';
  return '支援策への関心は高まりましたが、資金や診療連携の条件が最後までそろいませんでした。';
 }
 if(k==='T'){
  if(v==='public')return '投資条件と許認可の調査が伝わり、行政の事業支援につながりました。';
  if(v==='private_eco')return '企業の投資条件と湿原を避ける代替案が広く報じられ、民間主導の開発が実現しました。';
  if(a.T>=req&&eligibleForPublic)return '観光への投資・許認可は報じられましたが、行政支援の余力が他分野に使われ、民間だけでは開発を実現できませんでした。';
  if(!e.includes('investment_t'))return '開発への期待はあっても、誰がどの条件で投資するのかが十分に報じられませんでした。';
  if(a.T<req)return '投資条件は明らかになりましたが、事業を後押しするほどの関心は集まりませんでした。';
  return '開発への関心は高まりましたが、許認可と自然保護を両立させる方式を確立できませんでした。';
 }
 if(v==='public')return '保護区域の根拠を示す記事が広まり、公的な保全体制が整いました。';
 if(v==='private')return '湿原の調査と地域の保全協定案が知られ、住民と企業の管理体制が成立しました。';
 if(a.E>=req&&eligibleForPublic)return '保護の根拠と県内の支持は整いましたが、公的管理に必要な行政支援枠が他分野に配分され、維持できませんでした。';
 if(a.E<req)return '保護区域をめぐる動きは続いていましたが、県全体の議論には十分広がりませんでした。';
 return '保護への関心は高まりましたが、区域維持の根拠と継続的な管理体制が十分に整いませんでした。';
}
function observationDebrief(){
 const n='HTE'.split('').filter(k=>s.outcomes[k]!=='failed').length;
 return [
  '観測記録にあった三つの状態が、2027年の東雲県でも確認できました。ただし、記録にあった未来と実現までの道筋が同じだったとは限りません。どの記事が広まり、誰が動いたか。その違いも記録に残ります。',
  '記録にある三項目のうち、二つを確認できました。残る一つも新聞では扱われていましたが、実現に必要な条件はそろいませんでした。県内の変化は、どの分野にも同じように届くわけではありません。',
  '記録にあった未来と一致したのは、一項目だけでした。新聞が生んだ反応は残りましたが、他の問題を動かすには至りませんでした。',
  '観測記録にあった三項目は、どれも確認できませんでした。けれど、七日間の記事と、それを受けて行動した県民の記録まで消えたわけではありません。'
 ][3-n];
}
function intersectingConsequences(){
 const H=s.outcomes.H!=='failed',T=s.outcomes.T!=='failed',E=s.outcomes.E!=='failed';
 if(T&&!H)return '観光地に人が集まり始める一方、県北部の医療体制には課題が残りました。救急受入れや通院手段の整備を求める声が上がっています。';
 if(T&&!E)return '観光拠点は動き始めましたが、湿原全体の保護指定は維持できませんでした。施設が保護区域を避けることと、県が区域を守り続けることは別の問題でした。';
 if(!T&&E&&s.outcomes.E==='private')return '観光開発が停滞した後も、湿原の管理は地域の協定により続いています。保全は観光事業の成功だけに依存するものではありません。';
 if(H&&T&&E)return '医療と観光が前進し、湿原の保護も続きました。三つを両立させたのは一つの万能策ではなく、異なる立場の人々が選んだ別々の方法です。';
 if(!H&&!T&&!E)return '医療・観光・自然のどれも、関心だけでは解決できませんでした。問題を知ることと、実行の条件がそろうことには距離があります。';
 return '事業の成否は一つずつ違います。ある報道が新たな選択を生み、別の問題では十分な準備が整わないまま、一年が過ぎました。';
}
function ending(){const complete=[...'HTE'].filter(k=>s.outcomes[k]!=='failed').length;const h=s.history;
 const majors={H:0,T:0,E:0,G:0};
 for(const issue of h){for(const id of issue.published.slice(0,2)){const k=section(articles[id]);if(k in majors)majors[k]++}}const trace=h.map(x=>'<li><b>'+x.day+'日目</b>　一面トップ「'+esc(x.headlines?.[0]||articles[x.published[0]]?.headline||'')+'」／準トップ「'+esc(x.headlines?.[1]||articles[x.published[1]]?.headline||'')+'」</li>').join('');const unreleased=arrUnique(h.flatMap(x=>x.unprinted)).filter(id=>!s.publishedIds.includes(id)).sort((a,b)=>{const rank=id=>(s.outcomes[topic(articles[id])]==='failed'?4:0)+(EVIDENCE[id]&&!s.evidence.includes(EVIDENCE[id])?3:0)+(id.startsWith('I')?1:0);return rank(b)-rank(a)}).slice(0,3).map(id=>({headline:articles[id]?.headline,domain:topic(articles[id])})).filter(x=>x.headline);APP.innerHTML=`<div class="stage">${header('因果観察室｜2027年10月','一年後の東雲県','7日目の朝刊発行を終え、1週間の報道履歴から未来を確定しました。')}<section class="paper"><div class="masthead"><h2>東雲日報</h2><time>2027年10月<br>特別紙面</time></div><p class="kicker">未来復元 ${complete}／3条件</p><h3 class="headline" style="font-size:1.36rem">${complete===3?'県の未来、医療・観光・自然が共存':complete===0?'変化は届かず、県の課題が深刻化':`変わった県の未来、残された課題は${3-complete}つ`}</h3>${'HTE'.split('').map(k=>`<div class="front"><small>${esc(LABEL[k])}</small><h3 style="font-size:1rem">${s.outcomes[k]==='failed'?'未達成':'達成'}｜${esc(RES_NAMES[k][s.outcomes[k]])}</h3><p class="brief">${esc(outcomeText(k))}</p><p class="brief">${esc(outcomeReason(k))}</p></div>`).join('')}</section><section class="panel observation-report"><h3>因果観察室｜観測照合</h3><p class="small muted">照合対象：2027年の中央病院・霧峰高原・千鳥湿原</p><p>${esc(observationDebrief())}</p><p class="small">${esc(intersectingConsequences())}</p></section><div class="panel"><h3>あなたの新聞が動かした出来事</h3><ul class="log">${trace||'<li>政策決定の記録なし</li>'}</ul><p class="small">一面トップ・準トップの紙面分野別掲載回数：医療 ${majors.H}回／観光 ${majors.T}回／自然保護 ${majors.E}回／県政・財政 ${majors.G}回。県の未来は7日間の関心と根拠の積み重ねで決まりました。${s.verifiedReactionLeads?.length?' 期間中には、投書やSNSの手掛かりを追加取材で確かめた報道も政策判断を後押ししました。':''}</p></div><div class="panel"><h3>発行されなかった記事</h3><p class="small">紙面に載らなかった記事のうち、次のニュースも県内では進行していました。</p><ul>${unreleased.length?unreleased.map(t=>`<li class="small">${esc(t.headline)}${s.outcomes[t.domain]==='failed'?'（この問題を広く知らせる機会は限られたままでした）':'（紙面には載らず、課題は続いていました）'}</li>`).join(''):'<li class="small">該当する未掲載記事はありません。</li>'}</ul><p class="small muted">不掲載が直接問題を発生させたわけではありません。報道による社会の反応が起きなかったことが、結果に影響しました。</p></div><div class="panel"><h3>別の編集方針を試す</h3><p class="small">同じ3目標を達成しても、公的資金と民間資金の組み合わせによって未来の新聞が変わります。</p><div class="btn-row"><button class="btn" data-do="restart">もう一度、7日間を編集する</button></div></div></div>`}
function render(){if(!database)return;switch(s.stage){case'intro':intro();break;case'morning':morning();break;case'newsroom':newsroom();break;case'published':published();break;case'ending':ending();break;default:intro()}APP.focus({preventScroll:true});window.scrollTo(0,0)}
APP.addEventListener('change',e=>{if(e.target.matches('[data-slot]')){setSlot(Number(e.target.dataset.slot),e.target.value)}if(e.target.matches('[data-reporter]')||e.target.id.startsWith('topic'))updateHints()});
APP.addEventListener('click',e=>{const button=e.target.closest('[data-do]');if(!button)return;switch(button.dataset.do){case'start':s.stage='morning';save();render();break;case'dispatch':{const r=[document.getElementById('reporter0').value,document.getElementById('reporter1').value],t=[document.getElementById('topic0').value,document.getElementById('topic1').value];if(r[0]===r[1]){const el=document.getElementById('dispatchError');el.hidden=false;el.textContent='同じ記者を同じ日に二度派遣することはできません。';return}makeCandidates(r.map((x,i)=>[x,t[i]]));render();break}case'publish':publish();render();break;case'next':if(s.day===7)s.stage='ending';else{s.day++;s.stage='morning'}save();render();break;case'restart':init(Date.now());render();break}});
document.getElementById('reset').addEventListener('click',()=>{if(confirm('現在の7日間の編集記録を消し、最初からやり直しますか？')){init(Date.now());render()}});
async function boot(){try{const r=await fetch('./story.json?v=0.9.5',{cache:'no-store'});if(!r.ok)throw new Error(`HTTP ${r.status}`);database=await r.json();if(database.version!=='v0.9.5-beta')throw Error('記事データの版数が一致しません。ページを再読み込みしてください。');if(database.articles?.length!==44||database.reactions?.length!==50)throw Error('記事データの件数不整合');articles=Object.fromEntries(database.articles.map(x=>[x.id,x]));reactions=Object.fromEntries(database.reactions.map(x=>[x.id,x]));s=restore();if(!s){const param=new URLSearchParams(location.search).get('seed');init(param===null?Date.now():Number(param)||2026)}render()}catch(e){APP.innerHTML=`<section class="stage"><h1 class="headline">編集資料を読み込めませんでした</h1><p>${esc(e.message)}</p><p>接続を確認し、ページを再読み込みしてください。</p></section>`}}
boot();
