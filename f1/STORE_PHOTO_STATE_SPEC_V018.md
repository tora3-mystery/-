# F1 店舗写真・状態遷移の再設計｜v0.18素材仕様案

策定日：2026-10-27。**仕様提案・Work用発注下書きであり、画像34枚は現時点では未制作・未反映。** 現在のゲーム本体はv0.17.3。

## 目的と実装担当

ユーザーレビュー：「大きなスーパーの画像の変化が分かりにくい。大きな写真は数十状態を用意し、下のアイコン的な状態表示は維持してよい」。既存16点のv0.16追加画像は欠陥ではないが、主題の売場や撮影角度が場面ごとに変わるため、店舗全体の「昨日→今日」を比較しづらい。直近の施策で写真を選んだ後、深刻な苦情で別写真に上書きするコードもあり、主画像が店全体の最終状態を表せていない。

- **Chat**：以下の選択ルール・仕様を策定。ゲームコードへの組込みとバランスQAを担当。
- **Work**：代表3枚で同一店舗・同一カメラアングルの統一を検証した後、承認された素材34点を製作、WebP圧縮、検品、台帳保存、GitHub `f1/assets/` 内へ反映。原則 `f1/index.html` を変更しない。
- 既存の`scene-*.webp`16点は残す。グレー施策、オーナー視察、社、DAY 8などの近景・結果演出には再利用できる。通常経営画面の主写真のみ新系列へ切替予定。

## 固定カメラ・画作り

- ワイド16:9、公開時1100×619 WebP（品質80～84を想定）。比率、カメラ高さ、視野角、主な什器座標、照明色、店名を**全34点で一致**させる。
- カメラ：入口横の通路から店内を斜めに眺める、少し高い固定地点。**画面左に白いレジ3列、中央に買い物カートが通る主通路、右に日用品・食品棚、奥に店内放送設備**が一画面に収まる。
- まるまるスーパーの世界観は実在チェーンのコピーをせず、既存マスター画像のオリーブ色の柱・ベージュ床・緑のカゴ・白いレジ・暖色寄り照明を固定。
- 状態変化は「人の数・列の長さ」「障害物とカート動線」「棚の空き」「放送現場の様子」に限定して明確化。変化前後で**同じ床・壁・レジの位置**が保持されることが最優先。
- 音は写真自体で表しづらいので、スピーカー付近での大きな身振りや客の反応を使う。音量の正確な数値は下のゲーム内表示で補う。
- 写真内の文字・会社ロゴ・商標は読めないか架空。人物は架空。過度なAI的発光、ピクセル・枠線、説明文字の焼き込みを禁止。

## 新規主写真34点

| No. | ファイル | 種別 | 主な描写・用途 |
|---:|---|---|---|
| 01 | `main-base-neutral.webp` | 基本状態 | neutral |
| 02 | `main-base-orderly.webp` | 基本状態 | orderly |
| 03 | `main-base-busy.webp` | 基本状態 | busy |
| 04 | `main-base-underused.webp` | 基本状態 | underused |
| 05 | `main-checkout-mild.webp` | 単一問題 | レジ mild：行列の長さ・稼働レジ・待機場所 |
| 06 | `main-checkout-moderate.webp` | 単一問題 | レジ moderate：行列の長さ・稼働レジ・待機場所 |
| 07 | `main-checkout-severe.webp` | 単一問題 | レジ severe：行列の長さ・稼働レジ・待機場所 |
| 08 | `main-aisle-mild.webp` | 単一問題 | 通路 mild：カートの詰まり・荷物・通行可能な幅 |
| 09 | `main-aisle-moderate.webp` | 単一問題 | 通路 moderate：カートの詰まり・荷物・通行可能な幅 |
| 10 | `main-aisle-severe.webp` | 単一問題 | 通路 severe：カートの詰まり・荷物・通行可能な幅 |
| 11 | `main-stock-mild.webp` | 単一問題 | 品切れ mild：空棚・補充カート・棚の充実 |
| 12 | `main-stock-moderate.webp` | 単一問題 | 品切れ moderate：空棚・補充カート・棚の充実 |
| 13 | `main-stock-severe.webp` | 単一問題 | 品切れ severe：空棚・補充カート・棚の充実 |
| 14 | `main-noise-mild.webp` | 単一問題 | 騒音 mild：放送担当の位置・スピーカー・客の表情と姿勢 |
| 15 | `main-noise-moderate.webp` | 単一問題 | 騒音 moderate：放送担当の位置・スピーカー・客の表情と姿勢 |
| 16 | `main-noise-severe.webp` | 単一問題 | 騒音 severe：放送担当の位置・スピーカー・客の表情と姿勢 |
| 17 | `main-checkout-aisle-moderate.webp` | 複合問題 | checkoutとaisleのmoderate |
| 18 | `main-checkout-aisle-severe.webp` | 複合問題 | checkoutとaisleのsevere |
| 19 | `main-checkout-stock-moderate.webp` | 複合問題 | checkoutとstockのmoderate |
| 20 | `main-checkout-stock-severe.webp` | 複合問題 | checkoutとstockのsevere |
| 21 | `main-checkout-noise-moderate.webp` | 複合問題 | checkoutとnoiseのmoderate |
| 22 | `main-checkout-noise-severe.webp` | 複合問題 | checkoutとnoiseのsevere |
| 23 | `main-aisle-stock-moderate.webp` | 複合問題 | aisleとstockのmoderate |
| 24 | `main-aisle-stock-severe.webp` | 複合問題 | aisleとstockのsevere |
| 25 | `main-aisle-noise-moderate.webp` | 複合問題 | aisleとnoiseのmoderate |
| 26 | `main-aisle-noise-severe.webp` | 複合問題 | aisleとnoiseのsevere |
| 27 | `main-stock-noise-moderate.webp` | 複合問題 | stockとnoiseのmoderate |
| 28 | `main-stock-noise-severe.webp` | 複合問題 | stockとnoiseのsevere |
| 29 | `main-improved-register-added.webp` | 構造的改善 | register-added |
| 30 | `main-improved-aisle-rearranged.webp` | 構造的改善 | aisle-rearranged |
| 31 | `main-improved-restocked.webp` | 構造的改善 | restocked |
| 32 | `main-improved-renovated.webp` | 構造的改善 | renovated |
| 33 | `main-outcome-success.webp` | 全体評価 | success |
| 34 | `main-outcome-decline.webp` | 全体評価 | decline |

## 主写真選択の決定ルール（実装前の承認案）

1. **DAY 8／DAY 7の通常復帰／社の段階**は専用の既存演出を優先。隠しルートのメタ説明やネタバレラベルは表示しない。
2. 通常の日は、4種の苦情 `vals=[queue,aisle,stock,noise]` と集客力 `attraction` を使い、**その日の開店後の確定状態**から選択する。単純な「直近の施策IDから1枚選ぶ」方式は廃止する。
3. 苦情が **3以上のカテゴリが2種類以上**なら上位2カテゴリの組合せ画像を選択する。上位2つがともに4以上なら severe、そうでなければ moderate。3つ以上のカテゴリが悪い場合、主画像に表れないカテゴリは下の数値・アイコンで残す。
4. 苦情が3以上のカテゴリが1種類なら単一問題画像を使用。該当が4～5なら severe、3なら moderate。大きな問題がない場合でも最も優先度の高い苦情に応じて mild とするか、基本状態に戻す（閾値はUIテストで決める）。
5. 課題が目立たない場合は、集客力が高ければ orderly/busy、低ければ underused、標準なら neutral を選択。**売上上昇だけで「改装済み」など存在しない設備は表示しない。**
6. register-added / aisle-rearranged / restocked / renovated は、該当する設備改善を実際に実行した場合のみ表示対象にする。ただし深刻な複合問題の写真を無条件に上書きしない。複数効果が重なるケースで未対応の見かけを作らないよう判定を監査する。
7. 同じ確定状態なら原則同じ写真。乱数で別の写真へ飛ばさない。**前日と数値が同じなのに景色が変わる**のを避ける。
8. 下の苦情4軸・集客力・施策効果の**数値アイコンは存続**。メイン写真と重複する小さな「別角度の状態写真」は削減候補とする。「何が変わったか」は翌朝の短い1文で説明。写真にタイトル文字を大量に重ねない。

## 代表3枚（Workの最初の試作）

- `main-base-neutral.webp`：全素材のカメラ・什器・配色の基準。
- `main-checkout-severe.webp`：ベースと同じカメラから、レジ前の長い列だけを強調。
- `main-checkout-aisle-severe.webp`：同じ店舗で行列が通路へはみ出し、カート動線が詰まる複合状態。

この3点の整合性、差分の読みやすさ、390px表示の見やすさを確認してから残り31点を一括制作する。

## 完了条件とQA

- 34点の欠番ゼロ・画像読込成功・WebP 1100×619・ファイル名/状態台帳一致。
- 画像が「レジ数」「棚の位置」「設備の有無」で矛盾しない。元の画像と比較して、変化しない箇所は固定。
- 特に `mild→moderate→severe` の差がスマホ390pxで見分けられる。
- **全候補の画像選択を4種苦情×6段階×集客力11段階の組合せ（最大14,256状態）で機械監査**し、参照欠番・表示不整合を検出。
- 売上計算・グレー発覚・DAY 8条件・セーブ形式を変更しない。
- 画像保存成功とゲーム組込完了、GitHubコミットとPages配信、実ブラウザ検証を区別して報告する。

### GitHub編集範囲

Workは `f1/assets/main-*.webp` と `f1/ASSETS_V018.md`（素材台帳）のみ新規・修正可。既存の `f1/index.html`、テスト、ルート `index.html`、他作品は変更しない。Chatが最新素材を確認したうえで別コミットで画像切替ロジックを実装する。
