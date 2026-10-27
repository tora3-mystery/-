# V1｜最終版・一括素材制作仕様 v1.1
2026年10月27日 JST（最終監査改訂）｜「この村の評価をお願いします。」｜短編UIゲーム実験室

## Workの作業境界
実装上の正本は `proposals/village-review/index.html` の `VISUAL_ROUTES`, `ROUTE_BY_FACT`, `GROUND`。必ず最新mainを取得。Workは画像素材・軽量WebP・manifest・コンタクトシートのみを `proposals/village-review/assets/` 配下に追加し、ゲーム本体・ルートindex・他作品は変更しない。既存の公開URLは維持。

## 数量と最終画風
**計145マスター画像**：16施設×初期・第1進化＝32、35系統×第2進化・最終形態＝70、地形背景5、地形タイル8、汎用状態差分14、隠しエンド×2＝6、住民アイコン10。
日本の田舎を、柔らかい2.5D・斜め上固定視点のジオラマで表現。子ども向けに寄せすぎない。**すべての建物で方位・接地面・光源・縮尺・余白を統一**。文字や施設名は画像に焼き込まない。初期と第1進化は共通、第2・最終は進化方向が視覚的に明確に異なること。
施設PNGマスター：512×512透過。WebP縮小版も制作（寸法・描画アンカーをmanifest記録）。地形背景は共通5×4区画に重ねる画像、隠しエンドは16:9の大判イラスト＋マップ変質オーバーレイ。住民アイコン256×256透過。

## 35の進化系統（第2進化→最終形態）
| 施設 | 系統と画像に必要な差分 |
|---|---|
|rail（無人駅）|`transport`：地域交通の乗換駅 → 村の総合交通ターミナル／`heritage`：保存された木造観光駅 → 駅舎を活かした文化観光駅|
|market（道の駅）|`tourist`：特産品市場 → 巨大観光商業センター／`community`：地域生活直売所 → 地域流通センター|
|school（小学校）|`education`：教育・移住交流校 → 教育交流学園／`culture`：地域文化を伝える学校 → 地域文化学舎|
|shrine（神社）|`ritual`：祭礼の中心神社 → 大祭礼の神社／`mystery`：怪談を伝える神社 → 怪談観光の聖地／`sanctuary`：静かな杜の神社 → 森に守られた静かな聖域|
|inn（温泉旅館）|`gourmet`：郷土料理の人気旅館 → グルメ温泉リゾート／`retreat`：自然を楽しむ静養旅館 → 絶景静養リゾート／`heritage`：修復された老舗旅館 → 文化財温泉旅館|
|office（村役場）|`digital`：デジタル行政庁舎 → 自律行政センター／`policy`：地域政策の拠点 → 村の政策・文化拠点|
|clinic（診療所）|`community`：地域連携型の診療所 → 地域医療総合センター／`advanced`：高機能検査診療所 → 先進医療センター|
|shop（村の商店）|`specialty`：人気の地元専門店 → 村の大型専門商業店／`daily`：暮らしの総合商店 → 地域生活総合拠点|
|hall（公民館）|`festival`：祭礼文化会館 → 広域伝統文化センター／`community`：村民交流複合館 → 地域交流複合施設|
|farm（農園）|`brand`：地元ブランド農園 → 大規模農業ブランド／`agritourism`：見学できる観光農園 → 農業観光テーマパーク／`automation`：ロボット農園 → 完全自動農業拠点|
|scenic（村の景勝地）|`conservation`：保護された自然景勝地 → 自然保護景観エリア／`park`：散策と展望の公園 → 広域観光自然公園|
|cafe（喫茶店）|`local`：村民の憩いの喫茶店 → 村民交流喫茶／`gourmet`：地元食材の人気カフェ → 名物グルメカフェ|
|museum（地域資料館）|`history`：郷土展示館 → 村立歴史博物館／`mystery`：不思議な展示資料館 → 怪異資料博物館|
|lodge（山の宿）|`retreat`：静かな隠れ家民宿 → 自然に包まれた隠れ家宿／`activity`：体験プログラムの宿 → 大型体験型宿泊施設|
|harbor（漁港）|`fishery`：水産物の加工拠点 → 大規模水産加工拠点／`maritime`：観光と海の拠点 → 海洋観光都市拠点|
|robot（自動化研究センター）|`research`：自動化実験研究所 → 自律技術研究都市／`coexist`：人とロボットの交流棟 → ロボット住民共生地区|

## 48基本観点の分類（★4〜5／★1〜2）
| 施設 | 観点と分岐キー |
|---|---|
|rail|本数：`transport / transport`／風景：`heritage / heritage`／古さ：`heritage / transport`|
|market|混雑：`tourist / community`／地元の商品：`tourist / community`／価格：`community / community`|
|school|児童の様子：`education / education`／校舎：`culture / education`／地域行事：`culture / culture`|
|shrine|静けさ：`sanctuary / sanctuary`／古い行事：`ritual / sanctuary`／不思議な雰囲気：`mystery / sanctuary`|
|inn|静けさ：`retreat / retreat`／食事：`gourmet / gourmet`／古さ・料金：`heritage / heritage`|
|office|手続き：`digital / digital`／地域振興：`policy / policy`／村の決まり：`policy / policy`|
|clinic|待ち時間：`community / community`／設備：`advanced / advanced`／診療日：`community / community`|
|shop|価格：`daily / daily`／接客：`daily / daily`／品揃え：`specialty / daily`|
|hall|集まり：`community / community`／静けさ：`community / community`／祭りの準備：`festival / community`|
|farm|農産物：`brand / brand`／農作業：`automation / automation`／景色：`agritourism / agritourism`|
|scenic|眺め：`conservation / park`／歩きやすさ：`park / park`／静けさ：`conservation / conservation`|
|cafe|店の雰囲気：`local / local`／メニュー：`gourmet / gourmet`／静けさ：`local / local`|
|museum|展示：`history / history`／不思議な資料：`mystery / history`／静けさ：`history / history`|
|lodge|自然：`retreat / retreat`／料金：`retreat / retreat`／設備：`activity / activity`|
|harbor|魚：`fishery / fishery`／海との距離：`maritime / fishery`／賑わい：`maritime / fishery`|
|robot|自動化：`research / coexist`／職員：`coexist / coexist`／教育：`coexist / coexist`|
★3は原則として現状維持。観点だけでなく観察された事実との整合性を保つ。海沿い・離島の追加観点「海とのつながり」は通常の35ルートを増やさない（旅館／民宿はretreat、景勝地はconservation、神社はsanctuary）。

## 個々の施設画像のファイル名
格納先：`assets/facilities/<kind>/<stage>.png` と同名 `.webp`。初期・第1進化 `base-0`, `base-1`、後半2段階 `<route>-2`, `<route>-3`。
- rail: `base-0`, `base-1`, `transport-2`, `transport-3`, `heritage-2`, `heritage-3`
- market: `base-0`, `base-1`, `tourist-2`, `tourist-3`, `community-2`, `community-3`
- school: `base-0`, `base-1`, `education-2`, `education-3`, `culture-2`, `culture-3`
- shrine: `base-0`, `base-1`, `ritual-2`, `ritual-3`, `mystery-2`, `mystery-3`, `sanctuary-2`, `sanctuary-3`
- inn: `base-0`, `base-1`, `gourmet-2`, `gourmet-3`, `retreat-2`, `retreat-3`, `heritage-2`, `heritage-3`
- office: `base-0`, `base-1`, `digital-2`, `digital-3`, `policy-2`, `policy-3`
- clinic: `base-0`, `base-1`, `community-2`, `community-3`, `advanced-2`, `advanced-3`
- shop: `base-0`, `base-1`, `specialty-2`, `specialty-3`, `daily-2`, `daily-3`
- hall: `base-0`, `base-1`, `festival-2`, `festival-3`, `community-2`, `community-3`
- farm: `base-0`, `base-1`, `brand-2`, `brand-3`, `agritourism-2`, `agritourism-3`, `automation-2`, `automation-3`
- scenic: `base-0`, `base-1`, `conservation-2`, `conservation-3`, `park-2`, `park-3`
- cafe: `base-0`, `base-1`, `local-2`, `local-3`, `gourmet-2`, `gourmet-3`
- museum: `base-0`, `base-1`, `history-2`, `history-3`, `mystery-2`, `mystery-3`
- lodge: `base-0`, `base-1`, `retreat-2`, `retreat-3`, `activity-2`, `activity-3`
- harbor: `base-0`, `base-1`, `fishery-2`, `fishery-3`, `maritime-2`, `maritime-3`
- robot: `base-0`, `base-1`, `research-2`, `research-3`, `coexist-2`, `coexist-3`

## 5地形・8タイル
山間 `tthtt/tlllt/hlllh/tlllt`
川沿い `llwll/llbll/flwlf/flwlf`
平野 `flllf/flllf/flllf/flllf`
海沿い `wwwww/ccccc/lllll/flllf`
離島 `wwccw/wcllc/clllc/wcllw`
各地形の20マスは固定座標。記号はl=陸地、f=農地、t=森林、h=丘、c=海岸陸地、w=水、b=橋。タイル素材8種＝land, field, forest, hill, coast, sea, river, bridge。海・川・橋に**建物を描かない**。一般施設はl/f/t/h/c、港は水域と隣接したcのみ。桟橋等だけ海上へはみ出してよい。建物が進化しても海や隣区画に跨らないよう、各施設PNGの接地面を統一。道路は陸地・橋を通って各施設を結び、海上を横断しない。道路線はゲーム側CSS/SVG生成なので画像に焼き込まない。

## 14の状態オーバーレイ
closed-sign（閉業札）、boarded-door（板張り）、weeds（草木）、scaffolding（工事）、reopening（再開）、crowd（客の行列）、traffic（車両）、market-stall（市）、festival（祭礼）、quiet-garden（植栽）、automation（設備）、robot-citizens（ロボット）、odd-notice（奇妙な貼り紙）、tidal（潮汐異変）。

## 6の隠しエンド画像
因習村：ancient-map（札や統一掲示）／ancient-ending（年末背景）
近未来の村：robot-map（自動化された街区）／robot-ending（ロボット住民・空中道路・自律住宅）
海とつながりすぎた村：deepsea-map（海へ伸びる住宅街）／deepsea-ending（水面下の住所・住民）
初期マップには不穏さを焼き込まない。版権作品の固有ロゴやキャラは使わない。

## 10の村民アイコン
案内所職員／商店主／農家／漁師／宿従業員／学校保護者／子育て世帯／高齢住民／役場職員／匿名の住民。特定実在人物には似せない。

## 一括Workの工程・品質
まず「温泉旅館」「道の駅」「神社」の全進化で方向・画角・縮小時視認性・ルート間差を確認し、**同じWork工程内**で残る全件を完成させる。全145点とWebP派生ファイルを `asset-manifest.json` に列挙し、存在・透過・サイズ・フォルダ一致・64px縮小表示を自動＋目視で確認する。PNGマスターとWebP軽量版のコンタクトシートも作る。音や動く演出はコード側で実装し、画面全体のスクリーンショットは素材に含めない。
作業完了報告には点数、未完、更新日時JST、コミットSHA、変更ファイル、公開ビルドと実画面確認の区別を含める。

## 現時点の実装状況
V1 α0.4.2では35分岐の施設名と地形区画判定を実装済み。画像表示・最終形態の大型アニメーション・隠しエンドの特殊背景は**素材制作後の実装工程**であり未完成。35分岐それぞれ到達経路を確認済み。隠しエンドは隠し抽選をオンにした誘導テストで3種とも成立、実際の自然出現率は別途要検証。


## 追加確認事項：素材の座標・合成・描き直し防止（v1.1で拘束力のある仕様）

### A. マップ座標系を固定する
ゲームの地形区画は**横5×縦4、正方形タイル20個**。画像側の論理カンバスは1600×1280px（左上原点、1区画320×320px）で、ゲーム側は**地図全体を縦横比5:4で等比縮小**する。各座標は「列0～4、行0～3」で扱う。
地形背景5種は1600×1280px、原則として不透明PNG。地形タイル8種は320×320pxの正方形PNG、背景と矛盾しない形状・地形色。両者は必ず同一のカメラ設定・光源・色温度にする。道路や橋の動的接続線はCSS/SVGで描くため、背景に道路を固定的に焼き込まない（橋がある固定位置の下地だけは背景に含めてもよい）。
建物512×512pxマスターは等比縮小して**1区画の中心へ合成する独立スプライト**。接地面（底辺中央基準）と入口方向を全102種で一致させる。画面幅320pxで建物が50～60px程度になることを想定し、屋根形状・色・シルエットで進化先が区別できること。最終形態の建物が大きく見えるのは、区画内で使う面積が増えるためであり、隣の建物や海にまたがる大きさにはしない。最終形態の結果モーダルでは同じ高解像度PNG/WebPを拡大表示してよい。
厳密な実装は直交5×4グリッド上の斜め見下ろし型2.5D建物であり、ダイヤ形タイルの真のアイソメトリック座標ではない。**真の等角投影タイルマップ用に制作しない。**

### B. 描画レイヤーと背景の互換性
下から、(1)地形背景（5種、全域）、(2)空き区画の地形タイル、(3)道路／橋の接続線（ゲーム側生成）、(4)建物スプライト（102）、(5)状態オーバーレイ（14）、(6)UIラベル・施設名（HTML）の順番。地形背景・地形タイルには施設や名前を描き込まない。
島の施設は絶対に水域wや橋bへ配置しない。港だけが**海に隣接する陸地c**に建つ。港の桟橋はスプライト内で少し張り出しても、別区画の水面上へ無関係な建物として浮かせない。海岸と水面の境界は地形の固定マスクを基準とする。
景勝地scenicは人工の大型ビルではなく、展望・歩道・景観設備などの**自然地形付き施設スプライト**として描く。山間・平野・海沿い・離島すべてで使い回せる通常施設は、海や高山を背景として一体化しない。地形固有の風景は背景側が担う。

### C. 特殊な地形に依存する隠しエンド差分
**map系画像3点は「固定1600×1280の完成した村全景」ではなく、地形を問わず重ねられる透明の局所演出スプライト（512×512px）**として制作する。
- ancient-map: 札・掲示・紋章のセット。陸地の施設周辺に重ねられる。
- robot-map: 小型ロボット・建物の装飾・空中通路の「断片」。陸地セル上の複数地点に配置し、通路の接続はコード側で行う。
- deepsea-map: 不自然な潮目・濡れた足跡・水面の色の異変。海岸／海タイルに選択して重ね、平野や山間へ誤配置しない。
3点を地形ごとに描き直す運用は禁止。地形別の完成全景が必要になる場合は、**素材制作を開始する前に仕様変更を企画担当へ報告**し、追加9点が必要な案と、局所演出のままで済む案を比較する。
*ending系3点*は1600×900px（16:9）の年末イラストで、全景の場面演出を描ける。こちらはゲーム内マップとの座標一致は不要。
因習村・近未来の村は山間・川沿い・平野・海沿い・離島でも成立し得るため、end絵に固定の海岸線・特定地形を決め打ちしない。海の隠しエンドだけは海沿い・離島の前提を持つ。

### D. ファイル名・寸法・透明背景をカテゴリ別に固定
- **施設102点**：`assets/facilities/{kind}/{base-0|base-1|route-2|route-3}.png`、512×512、透過。等価WebPを同名で作る。
- **背景5点**：`assets/backgrounds/{mountain|river|plain|coast|island}.png`、1600×1280、基本不透明。
- **地形タイル8点**：`assets/tiles/{land|field|forest|hill|coast|sea|river|bridge}.png`、320×320。パターンの端の継ぎ目を目立たせず、空き地でも成立する形にする。
- **状態オーバーレイ14点**：`assets/overlays/{name}.png`、512×512、透過。同一スプライトに重ねられる視点・アンカーにする。素材IDは本仕様書「14の状態オーバーレイ」に記載した厳密なIDを使う。
- **隠しエンド6点**：`assets/endings/{ancient-map|robot-map|deepsea-map}.png`は512×512、透明・局所合成用。`assets/endings/{ancient-ending|robot-ending|deepsea-ending}.png`は1600×900、年末画面用。
- **住民10点**：`assets/people/{guide|shopkeeper|farmer|fisher|inn-staff|parent|family|elderly|official|villager}.png`、256×256、透過。
別途軽量WebPを画像1点につき1点制作。背景や年末絵のみ不透明を許可。施設・オーバーレイ・村民の透過チェックを必須とする。

### E. 実装中の村民役職との対応
村民の台詞には「近所の住民」「長年の住民」「沿道の住民」「働く住民」「移住してきた人」「買い物帰りの住民」「祭りの世話役」など、10を超える発言者名が存在する。**発言者数に合わせて顔画像を増殖させる必要はない。** 10種類の画像を以下のように一貫した分類で使い回す。
案内所→guide、商工会／商店→shopkeeper、農家→farmer、漁師→fisher、宿泊業→inn-staff、保護者→parent、移住者・子育て世帯→family、年配・長年の住民→elderly、役場→official、その他住民・祭りの世話役→villager。役職と画像の対応は `asset-manifest.json` に `speakerAliases` として格納する。

### F. マニフェスト・受入試験
ゲーム内の35ルートIDと画像ファイル名を文字列として完全一致させる。生成後の `asset-manifest.json` は145レコードを持ち、各レコードに `id, category, png, webp, width, height, alpha, anchor, allowedTerrains`（該当しないものはnull）を格納する。
**出力前に `ASSET_TARGETS.json` を唯一の発注在庫表として使用する。** 期待する145点と実際のPNG/WebPのペアの差集合が空であることを機械的に検証する。各PNGの解像度、建物基準点、ファイル名の欠損、透過欠損、背景の5:4比、エンディングの16:9比を検査する。
三つの試作施設では各ルートの後半画像が一目で別の建物に見えることをチェックし、特に**最終形態が小さな地図表示でも初期形態と識別できること**を確認する。
GitHubに画像が保存されたことと、GitHub Pagesに反映されたこと、実ブラウザで読み込めることを区別して記録。画像未完成・不一致・読み込み不可を「完成」と表現しない。
