# R1 本番画像素材制作 C｜制作メモ

## 正本・参照

- GitHub main: `6fc3ab075025e5615d825b1ce36f45b96424c978`（R1 v0.9.7-alpha）
- 必読: `r1/engine.js`, `r1/app.js`, `r1/index.html`, `r1/status.json`, `r1/QA_PREART_V096.md`
- 採用画風C: branch `r1-style-trials-20261030`, commit `7f7b57973236b491ea89300bff28dea17ebb6dc4`
- 画風Cの基準画像と評価資料を読み取り参照。既存比較素材は変更しない。

## 特殊画像3枚の選定

1. `ramen_closed`: 麺処いわきの閉店演出。ゲームの閉店状態で使用する想定。外観骨格を維持し、閉店状態を一目で識別できる。
2. `ramen_giant`: 麺処いわきの巨大本店復活。status.jsonの特殊結末に明記された同一1番地での再開で、麺処いわきの意匠を維持する。
3. `lot2_vacant`: 2番地の空き店舗。status.jsonの入居履歴・入替わりの噂を視覚的に支える。看板跡と補修跡は自然に表現し、ホラーや「呪われた土地」の断定表現は避ける。

## 代表進化28枚の選定

各店の外観で変化を読み取りやすい方向を優先。好転/悪化は `engine.js` の `PATHS` の文字列を正本として、選定したgenre・polarity・stage4をmanifestに記録する。

| 店舗ID | 好転代表 | 悪化代表 |
|---|---|---|
| cafe | mood plus: 静寂の読書喫茶 | identity minus: 現代型カフェ |
| cake | mood plus: お姫様のサロン | service minus: 無人受取スイーツ店 |
| curry | identity plus: 週替わりスパイス研究所 | mood minus: 気軽な立ち食いカレー |
| teishoku | mood plus: くつろぎ座敷定食屋 | price minus: 小盛り定食屋 |
| udon | taste plus: 極太もちもちうどんの店 | service minus: 食券うどんの店 |
| soba | mood plus: 静かなそば座敷の店 | price minus: 小せいろの店 |
| sandwich | mood plus: ピクニック席の店 | service minus: 受取ロッカーの店 |
| burger | mood plus: 鉄板ライブ席の店 | service minus: セルフ受取の店 |
| pasta | identity plus: 試作ソースの店 | price minus: ハーフパスタの店 |
| chinese | mood plus: 円卓の町中華の店 | service minus: 食券中華の店 |
| bakery | mood plus: イートインベーカリーの店 | service minus: セルフ袋詰めの店 |
| fish | taste plus: 炭火焼き魚の店 | price minus: 小ぶり魚定食の店 |
| onigiri | taste plus: 炊きたて米のおむすびの店 | mood minus: 立ち寄り受取窓口の店 |
| veggie | mood plus: 緑のテラス席の店 | price minus: 小皿野菜ランチの店 |

## 変更・未完了の境界

今回の差分は `r1/assets/production_c_20261030/` のみ。ゲームコード、status、INDEX、他作品の変更、画像統合、Pages公開は対象外。全進化分岐140枚の完成とは扱わない。


## 今回の制作・検品追記

- 基本ファイル名: shops/{shop_id}_base.webp、owners/{shop_id}.webp、items/{shop_id}.webp。
- 特殊画像: special/ramen_closed.webp、special/ramen_giant.webp、special/lot2_vacant.webp。
- 進化差分: evolutions/{shop_id}_{genre}_{polarity}_stage4.webp。対応するゲーム上の名称と選定理由は上表およびasset_manifest.csvに記録。
- 店主ポートレートは一覧で顔立ちが重複して見えた初回案を差し替え、髪型・顔形・年齢感を付け直した。
- 進化差分は390px相当の前後比較を確認し、差が弱い案（カフェ、ケーキ、ベーカリー、魚、むすび、パスタ、うどんの一部）を再生成。なお内装中心の差分は単独画像だと変化が穏やかなため、組み込み時にbefore/after比較を推奨。
- review/には外観・店主・料理・特殊状態・好転/悪化進化の一覧、および各画像を幅390pxで表示した単体/比較シートを保存。
- 残る未制作ルートはengine.js内の全経路から今回選定した28ルートを除いたもの。今回の制作完了は全分岐の網羅を意味しない。
