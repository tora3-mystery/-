# F1 v0.18 素材台帳（P1代表3枚）

制作日：2026-10-27（JST）  
対象：P1のみ。P2・P3および残り31候補は未着手。

## 正本・参照

- `main` 確認時点：`d68cb0d66db71127a9c2275f2dc65466be25e415`
- 最新発注書：`f1/WORK_V018_PHOTO_BRIEF.md`（blob `c7936dcda81ef1d4bc157483c66f7c9a3c7df54d`）
- 最新状態仕様：`f1/STORE_PHOTO_STATE_SPEC_V018.md`（blob `a0d8b61caf4a69529022b6805e82e593937534de`）
- 参照素材：`f1/assets/store-normal.jpg`（main上のblob `0b37a7228c3db3e2a54c537625755efd5e24d879`）と `f1/assets/scene-checkout-normal.webp`。いずれも世界観の参照には使えたが、固定カメラで「左レジ3列・中央主通路・右棚・奥の放送設備」を揃えたP1マスターには構図が合わなかったため、共通マスターを新規制作。

## 制作方法

Imagegenで架空の日本のスーパー「まるまるスーパー」の撮影マスターを1枚作成。既存写真を色調・素材感の参照にした。カメラは入口側から店内を少し高い位置で斜めに見る固定画角。左に白いレジ、中央にカート通路、右に商品棚、奥に放送設備を置いた。

共通マスターPNG：`/Users/ryu/.codex/generated_images/01a17850-e471-7362-a690-0d929573e475/exec-f04174ad-82f3-4ae2-b8cd-efcde23e6439.png`（1672×941）。neutral画像はこのマスターから直接書き出した。mildとsevereは同じPNGマスターをそれぞれ編集入力に指定し、独立に差分編集した。最終3枚はLanczosで1100×619へ縮小し、WebP quality 82 / method 6で書き出した。3枚とも16:9、RGB、文字・ロゴ焼き込みなし。

## P1成果物

| ファイル | 状態・編集差分 | 容量 | 検品 |
|---|---|---:|---|
| `f1/assets/main-base-neutral.webp` | 固定カメラの通常営業マスター。左レジ、中央通路、右棚、奥スピーカー。 | 156,562 bytes | 1100×619 WebP。基準画像。 |
| `f1/assets/main-checkout-mild.webp` | マスターからの局所編集。レジ付近の待ち列を少し延長。中央主通路は開放。 | 148,718 bytes | 1100×619 WebP。390px幅でneutralとの軽度差を識別。 |
| `f1/assets/main-checkout-aisle-severe.webp` | 同じマスターからの局所編集。レジ列とカートが中央通路へ広がり、通行幅を狭める。 | 168,866 bytes | 1100×619 WebP。mildより混雑が明確で、主通路に波及。 |

## 比較・視認性検品

- 横並び比較：`/private/tmp/f1-v018-p1-qa/three-up.png`
- neutral対mild 50%透過：`/private/tmp/f1-v018-p1-qa/overlay-main-checkout-mild.png`
- neutral対severe 50%透過：`/private/tmp/f1-v018-p1-qa/overlay-main-checkout-aisle-severe.png`
- 390px幅（各画像390×219px）の縦並び：`/private/tmp/f1-v018-p1-qa/phone-390-stacked.png`

目視結果：柱、壁・床の境界、固定レジ什器、主通路の遠近、右棚、奥のスピーカーは各比較で同じ位置に揃う。変化を付けた人物・カートは各差分の周辺で位置や人数が変わる。mildは短い列が少し伸びた差として見え、severeは列が主通路へ流れた状態として390px幅でも識別できる。用途どおり建物・什器の位置は固定できたが、人物の完全なピクセル単位維持を保証するものではない。

この台帳と上記3 WebPのみをF1へ追加する。P2・P3、残り31画像、ゲーム本体・テスト・INDEXは変更しない。
