# F1 v0.18.0｜店舗写真統合・監査記録

- 正式タイトル：**すべてのご意見に対応してください。**
- v0.18.0 更新表示：**2026-10-27 21:17:29 JST**
- 公開ページ： https://tora3-mystery.github.io/short-ui-games/f1/
- 素材納品元：`f1-v018-p1-20261027` / P3最終 `554b16bd34a57706127dd335ab90685fe2d84524`
- **ゲーム公開後の実ブラウザ表示・実操作確認は未実施。GitHubへの統合とDOMモデル上の回帰だけを確認。**

## 実装したこと

1. P1・P2・P3の**写真29点＋素材台帳**を最新mainに取り込み。コピー元GitHub blob SHAを保ち、レビュー用ブランチを丸ごとマージしない。コピーしたのは `f1/assets/main-*.webp` と `f1/ASSETS_V018.md` のみ（コミット `d2b14f513108d3a9d65c4a8736b612295a24a81a`）。
2. `f1/index.html` に `store_scene_v018.js` を先読み接続。通常営業では **28点の固定カメラ店舗写真**を、当日の苦情4軸と集客力によって決定。直近施策を優先して店内写真を飛ばす旧方式から切替。
3. `main-improved-register-added.webp` は**レジ増設が翌朝反映された場合の報告写真に限る**。記録写真を縦方向にトリミングして、通常の定点全景と区別する。翌日以降は定点主写真へ戻しつつ、実際に施策完了済みなら「有人レジ増設済み」の表示を残す。
4. DAY 7の通常風偽装、社をめぐる不穏ルート、DAY 8、エンディングの従来専用写真を維持。
5. 新主写真の読み込みに失敗した場合、まず旧店舗写真へフォールバック。それも失敗した場合に既存のSVG代替画像を出す。
6. 既存のクレームから施策を発見する操作・売上ロジック・グレー発覚・セーブを原則変更しない。
7. ルートINDEXの**F1欄だけ**をv0.18.0に更新。

## GitHub上で確認した素材29点

`f1/assets/main-*.webp` 29ファイルの存在、ファイル名、各ファイルのBase64実データとWebPヘッダ（RIFF/WEBP/VP8）、実画素寸法1100×619pxを**29/29件**で確認。非WebP・欠番・寸法相違ゼロ。ファイルサイズ合計 **4,392,588 bytes**。

全画像の個々の状態差分についてWorkが横並び・50%透過・390px幅を比較済み。Chatでも代表画像 `main-base-neutral`、`main-checkout-stock-moderate`、`main-aisle-mild`、`main-improved-register-added` を直接表示して視認性と固定構図を確認。

## スクリプト回帰検証

| テスト | 結果 |
|---|---|
| `v012_runtime_regression.js` | 418 assertions PASS |
| `v014_runtime_regression.js` | 631 checks PASS |
| `v015_decision_policy_audit.js` | 人物傾向5種を使った40模擬ゲーム完走 |
| `v0161_horror_regression.js` | 24 checks PASS |
| `v017_discovery_regression.js` | 16 checks PASS |
| `v0171_feedback_first_regression.js` | 48 assertions PASS |
| `v018_scene_selection.cjs` | 14,256状態・28,544 checks PASS |
| `v018_game_state_bridge.cjs` | 14,256状態・42,798 checks PASS |
| **`v018_integration_regression.cjs`** | **22 assertions PASS**（実際に画像選択コードを読み込むDOMモデル） |

DOMモデルでは、初日表示、複合苦情による画像選択、レジ増設の完了前後、翌朝だけの結果写真、別の翌朝に写真を繰り返さないこと、レジ増設済みステータスの保持、DAY 7偽装、不穏ルートでの旧画像、画像読み込み失敗時の代替写真を検証。

**検証の限界：** モックDOMでの確認であり、実Chrome・Safari・iPhoneでの表示・実タップ操作とは区別する。実ブラウザ上でのCSSトリミング、スクロール、画像読み込み時間、セーブ再開、メモリ使用量、通信失敗時の見え方は人間テストまたは実ブラウザQAが必要。

## 残存課題（未対応）

### 1. 左上黒板の判読不能な文字模様（13枚）

P3の `main-aisle-mild.webp`、`main-aisle-moderate.webp`、`main-aisle-severe.webp`、`main-aisle-stock-moderate.webp`、`main-checkout-aisle-moderate.webp`、`main-checkout-noise-moderate.webp`、`main-checkout-noise-severe.webp`、`main-checkout-stock-moderate.webp`、`main-checkout-stock-severe.webp`、`main-noise-mild.webp`、`main-noise-moderate.webp`、`main-stock-moderate.webp`、`main-stock-severe.webp` に小さな生成由来の文字模様が残る。**「画像内の読めない文字を避ける」という制作条件は完全には満たしていない。** 390pxでは目立ちにくいと報告されているが、完成品質の判断は実機で行う。

### 2. レジを含む中度の複合状態3枚

`main-checkout-aisle-moderate.webp`、`main-checkout-stock-moderate.webp`、`main-checkout-noise-moderate.webp` はレジ待ちの列が単独の中度写真より分かりにくい。補助の苦情数表示に依存する。人間レビューでゲーム性を損なうようなら**この3枚だけ**差分修正をWorkに依頼する。画像を追加して数合わせはしない。

### 3. 音量・常設設備の静止画表現

音量は客の反応の補助表現のみ。実際の騒音苦情は画面数値を主情報とする。レジ増設後の定点写真は3台の元構図だが、増設の結果写真を**別用途の記録写真**として扱い、進行画面には施策完了済みの状態表示を継続させる。全画像から実店舗の設備数が厳密に再現できるわけではない。

## 進捗判定

- GitHub画像・台帳の統合：**完了**
- GitHubゲームコード統合：**完了**
- ファイル形式・サイズ・解像度・プログラム回帰：**完了**
- GitHub Pagesの実表示と実操作：**未実施**
- 人間の初見レビュー：**未実施**
- 黒板文字13点、レジ中度複合3点の完成品質判断：**未了**

**この段階は「v0.18.0の試作公開候補」であり、完成のGate C達成ではない。**
