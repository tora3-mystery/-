# F1 v0.18 店舗写真素材台帳（P1・P2）

制作日：2026-10-27（JST）  
進捗：P1はユーザー承認済み。P2の3点を制作・検品。P3と残り28候補は未着手。

## 正本・参照

- 制作開始時に確認した `main`：`d68cb0d66db71127a9c2275f2dc65466be25e415`
- P2開始時の `main`：`9693ef4df53557eb08784d020dc3ded42021b39d`。P1レビュー用ページと画像ゲートテストの追加を確認。状態仕様・発注書のblobは制作開始時と同一。
- 発注書：`f1/WORK_V018_PHOTO_BRIEF.md`（blob `c7936dcda81ef1d4bc157483c66f7c9a3c7df54d`）
- 状態仕様：`f1/STORE_PHOTO_STATE_SPEC_V018.md`（blob `a0d8b61caf4a69529022b6805e82e593937534de`）
- 参照素材：`f1/assets/store-normal.jpg`（blob `0b37a7228c3db3e2a54c537625755efd5e24d879`）と `f1/assets/scene-checkout-normal.webp`。世界観参照には使ったが、指定レイアウトに合わず、共通マスターを新規制作。

## 共通制作方法

Imagegenで架空の日本のスーパー「まるまるスーパー」の撮影マスターを1枚制作。既存写真を色調・素材感の参照にした。入口側から店内を少し高い位置で斜めに見る固定画角。左に白いレジ3台、中央にカート通路、右に商品棚、奥に放送設備を配置。

共通マスターPNG：`/Users/ryu/.codex/generated_images/01a17850-e471-7362-a690-0d929573e475/exec-f04174ad-82f3-4ae2-b8cd-efcde23e6439.png`（1672×941）。全6枚はこのマスターを起点にした。各画像はLanczosで1100×619へ縮小し、WebP quality 82 / method 6で書き出した。RGB、16:9、画像内の説明文字・ロゴなし。

## 成果物一覧

| ファイル | 用途・差分 | 容量 | 判定 |
|---|---|---:|---|
| `f1/assets/main-base-neutral.webp` | 通常営業の固定マスター | 156,562 bytes | P1承認済み。1100×619。 |
| `f1/assets/main-checkout-mild.webp` | レジ待ち軽度。短い列を少し延長、主通路は開放 | 148,718 bytes | P1承認済み。390px幅で区別可。 |
| `f1/assets/main-checkout-moderate.webp` | 中間状態。列は中央通路の縁まで伸びるが、通行路は残す | 161,218 bytes | P2合格。mildより明確に混み、severeより通路の余裕がある。 |
| `f1/assets/main-checkout-aisle-severe.webp` | レジ列が中央通路へ波及し、通行を妨げる | 168,866 bytes | P1承認済み。moderateより列が密で通路が狭い。 |
| `f1/assets/main-improved-register-added.webp` | 有人レジ1台増設の試作。既存3台に4台目を追加 | 144,334 bytes | P2素材として合格。継続表示の検証は不合格。下記参照。 |
| `f1/assets/main-noise-severe.webp` | 後方PAでの呼出業務と、音に反応する客の控えめな仕草 | 146,300 bytes | P2補助写真として合格。音の強さを写真だけで確実に示す用途には不十分。 |

## 比較・目視検品

- 6枚・各390px幅の一覧：`/Users/ryu/Documents/ChatGPT/ARG/f1-v018-p2-review/six-up-390.png`
- 全6枚を390px幅で縦並び：`/Users/ryu/Documents/ChatGPT/ARG/f1-v018-p2-review/phone-390-all-six.png`
- mild / moderate 50%重ね：`/Users/ryu/Documents/ChatGPT/ARG/f1-v018-p2-review/overlay-mild-moderate.png`
- moderate / severe 50%重ね：`/Users/ryu/Documents/ChatGPT/ARG/f1-v018-p2-review/overlay-moderate-severe.png`
- 通常 / 増設レジ 50%重ね：`/Users/ryu/Documents/ChatGPT/ARG/f1-v018-p2-review/overlay-base-register-added.png`
- 通常 / 騒音補助写真 50%重ね：`/Users/ryu/Documents/ChatGPT/ARG/f1-v018-p2-review/overlay-base-noise-severe.png`
- 増設後から通常画像へ戻るときの390px確認：`/Users/ryu/Documents/ChatGPT/ARG/f1-v018-p2-review/register-continuity-check-390.png`
- 透明レジレイヤー合成試験（通常・moderate・severeの各390px）：`/Users/ryu/Documents/ChatGPT/ARG/f1-v018-p2-review/transparent-register-overlay-trial-390.png`

固定カメラ、柱、壁・床境界、既存レジ、主通路、右棚、奥スピーカーの位置は6枚で整合。人物とカートは各状態差として配置が変わる。mild→moderate→severeは390px幅で3段階を見分けられる。騒音写真はPA設備と客の仕草を補助に使うが、写真単体で音量を判定できないため、数値・アイコンを主情報とする。

## レジ増設の継続表示ゲート

`main-improved-register-added.webp`では4台目の有人レジが見える。一方、P1の通常・混雑画像は3台のままなので、その後に通常状態画像へ戻すと4台目が消える。固定カメラの1枚編集で追加設備を常時維持することは、この6枚のままでは実証できなかった。これは状態画像として使う場合の矛盾であり、P3の制作ゲート未解決。

固定位置の透明差分レイヤーも試作して通常・moderate・severeへ重ねたが、レジの視点・縮尺と床への接地が合わず、切り抜きを貼ったように浮いて見えたため採用しなかった。レイヤー合成でも継続表示は実証できていない。

仕様案の代替として、増設写真は施策直後の結果写真、継続する効果はゲーム内のレジ数・待ち時間表示で示す役割分担を提案する。状態写真へ使う場合は、Chat側が設備履歴を合成する処理を先に決める必要がある。どちらの扱いにするか決まるまでP3・残り28枚は制作しない。

## 編集範囲

この作業で追加するのは上記 `main-*.webp` 6枚と本台帳のみ。`f1/index.html`、JavaScript、テスト、INDEX、既存の `scene-*.webp`、他作品は変更しない。
