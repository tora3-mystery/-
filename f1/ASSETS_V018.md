# F1 v0.18 店舗写真素材台帳（P1・P2・P3）

制作日：2026-10-27（JST）  
対象ブランチ：`f1-v018-p1-20261027`  
反映前ブランチHEAD：`c5cadd7bee895f995d3ee8276a62fc32e67af46f`  
制作範囲：P3正式発注書の新規23枚のみ。P1/P2を含む素材台帳は計29枚。

## 正本・参照

- 制作前に確認した最新 `main`：`9b0ba740c3d5a66834836e96f5d061ff00fe64d8`
- 正式発注書：`f1/WORK_V018_P3_BRIEF.md`（blob `293e98b09ff9b306a8897d9ca2d7fa3e478c75fe`）
- 状態仕様：`f1/STORE_PHOTO_STATE_SPEC_V018.md`（blob `5fd36164abac39b84c0a4e916414d0e8fbd1c396`）
- 表示対象名・順序は最新 `f1/store_scene_v018.js` の `P3_FILES` と照合。発注書・コードとも23枚で一致。
- 共通マスター：`/Users/ryu/.codex/generated_images/01a17850-e471-7362-a690-0d929573e475/exec-f04174ad-82f3-4ae2-b8cd-efcde23e6439.png`（1672×941）

## 共通制作・出力

架空の日本のスーパーの店舗全景を共通マスターとして、同じ入口側カメラ位置から差分編集した。柱、既存の3台のレジ、中央通路、床目地、左右の商品棚、奥の放送設備を固定し、客・カート・棚在庫・客の反応のみを状態差分とした。レジ増設写真および透明な設備レイヤーは通常営業写真に含めていない。P2方針どおり、増設写真は施策結果写真に限り1回使用し、継続効果はゲーム内状態・数値表示で示す。

出力仕様は全23枚ともWebP、1100×619、16:9、RGB、quality 82 / method 6。全ファイル350KB未満。

## 29枚の素材一覧

| 区分 | ファイル | 用途・見える状態差分 | 容量 | 判定 |
|---|---|---|---:|---|
| P1 | `main-base-neutral.webp` | 通常営業の固定マスター | 156,562 B | 承認済み |
| P1 | `main-checkout-mild.webp` | レジ待ち軽度 | 148,718 B | 承認済み |
| P1 | `main-checkout-aisle-severe.webp` | レジ列が通路側へ波及する深刻状態 | 168,866 B | 承認済み |
| P2 | `main-checkout-moderate.webp` | レジ待ち中度 | 161,218 B | 合格 |
| P2 | `main-improved-register-added.webp` | レジ増設施策の直後を示す写真。1回だけ使用 | 144,334 B | 施策結果写真として採用 |
| P2 | `main-noise-severe.webp` | 放送設備への客の反応を示す深刻状態の補助写真 | 146,300 B | 補助用途として合格 |
| P3 | `main-base-orderly.webp` | 通常・整然 | 152,990 B | 合格 |
| P3 | `main-base-busy.webp` | 通常営業の混雑 | 151,838 B | 合格 |
| P3 | `main-base-underused.webp` | 客が少なくレジが空く状態 | 151,054 B | 合格 |
| P3 | `main-checkout-severe.webp` | レジ待ち深刻 | 153,860 B | 合格 |
| P3 | `main-aisle-mild.webp` | 通路混雑・軽度 | 149,588 B | 合格 |
| P3 | `main-aisle-moderate.webp` | 通路混雑・中度 | 158,134 B | 合格 |
| P3 | `main-aisle-severe.webp` | 通路混雑・深刻 | 166,208 B | 合格 |
| P3 | `main-stock-mild.webp` | 欠品・軽度 | 151,626 B | 合格 |
| P3 | `main-stock-moderate.webp` | 欠品・中度 | 141,936 B | 合格 |
| P3 | `main-stock-severe.webp` | 欠品・深刻 | 135,086 B | 合格 |
| P3 | `main-noise-mild.webp` | 放送音への反応・軽度 | 149,294 B | 合格・補助写真 |
| P3 | `main-noise-moderate.webp` | 放送音への反応・中度 | 150,122 B | 合格・補助写真 |
| P3 | `main-checkout-aisle-moderate.webp` | レジ待ち＋通路混雑・中度 | 164,246 B | 合格、レジ列差分はやや弱い |
| P3 | `main-checkout-stock-moderate.webp` | レジ待ち＋欠品・中度 | 143,254 B | 合格、レジ列差分はやや弱い |
| P3 | `main-checkout-stock-severe.webp` | レジ待ち＋欠品・深刻 | 149,302 B | 合格 |
| P3 | `main-checkout-noise-moderate.webp` | レジ待ち＋放送反応・中度 | 151,880 B | 合格、レジ列差分は弱い |
| P3 | `main-checkout-noise-severe.webp` | レジ待ち＋放送反応・深刻 | 157,680 B | 合格 |
| P3 | `main-aisle-stock-moderate.webp` | 通路混雑＋欠品・中度 | 148,198 B | 合格 |
| P3 | `main-aisle-stock-severe.webp` | 通路混雑＋欠品・深刻 | 154,142 B | 合格 |
| P3 | `main-aisle-noise-moderate.webp` | 通路混雑＋放送反応・中度 | 152,510 B | 合格・放送反応は補助 |
| P3 | `main-aisle-noise-severe.webp` | 通路混雑＋放送反応・深刻 | 161,374 B | 合格・放送反応は補助 |
| P3 | `main-stock-noise-moderate.webp` | 欠品＋放送反応・中度 | 136,756 B | 合格・放送反応は補助 |
| P3 | `main-stock-noise-severe.webp` | 欠品＋放送反応・深刻 | 135,512 B | 合格・放送反応は補助 |

## 比較・検品結果

目視用ローカル比較物（コミット対象外）：

- 23枚一覧：`/Users/ryu/Documents/ChatGPT/ARG/f1-v018-p3-review/p3-contact-23.jpg`
- すべてを共通マスターと50%透過で重ねた一覧：`/Users/ryu/Documents/ChatGPT/ARG/f1-v018-p3-review/p3-overlays-50-master.jpg`
- 各画像を横幅390pxで表示した23枚一覧：`/Users/ryu/Documents/ChatGPT/ARG/f1-v018-p3-review/p3-phone-390-23.jpg`

確認した差分：

- `base-orderly` → `base-busy` → `base-underused` は、客数・カート・空いたレジの有無で区別できる。
- 通路の軽度→中度→深刻は、中央通路の利用可能幅とカート密度が段階的に変わり、390px幅の一覧でも差が追える。
- 欠品の軽度→中度→深刻は、商品を残した小さな棚の空きから複数棚の広い空きへ進む。空棚の面積で段階を区別できる。
- 放送状態は、スピーカー方向を見る客・スタッフの反応で表現。音量自体は静止画から検証できないため、ゲーム内数値・状態表示が主情報。
- 50%重ね合わせで柱、レジ配置、通路、棚の位置、床目地は大きくずれていない。人物やカートの重なりは状態編集による差分。
- 29枚全体に対し新規P3は23枚のみ。P1/P2の6枚は上書きしていない。

## 残る不整合・留意点

- `main-checkout-aisle-moderate.webp`、`main-checkout-stock-moderate.webp`、`main-checkout-noise-moderate.webp` は、390px表示では中度のレジ列がP2 `main-checkout-moderate.webp` ほど明瞭でない。複合写真では通路・欠品・放送反応の副状態は見える。レジ待ちの厳密な段階判断は、P2の単独写真またはゲーム内数値を併用する。
- 放送状態の軽度・中度・深刻は写真だけで音の強さを伝えられない。客の反応は補助情報として扱い、ゲーム内数値・状態表示を正とする。
- これは写真素材の静的・390px幅での目視検品であり、ゲーム画面への実装、実機Safari表示、ユーザー評価は含まない。

## 編集範囲

P3で追加するのは上記の新規23枚と本台帳の更新のみ。P1/P2の6枚は保持。ゲーム本体HTML・JavaScript、テスト、仕様書、INDEX、他作品は変更していない。P3完了後のP2・P3以外の追加制作は対象外。
