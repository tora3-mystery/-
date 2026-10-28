# N1｜Work専用 画像素材発注書（納品済み・履歴保存）

> **納品・統合状況（2026/10/27）**：Workが32点を制作し `n1/catalog-assets-batch01`（`eb32ecb`）に保存済み。Chatは検証ブランチへ画像32点・台帳・プロンプトのみを `acab2304` で取り込み、v0.6.0-rc1で35商品に接続した。模擬ゲームQAは通過。公開mainへの統合・実ブラウザQA・残り29点の人間最終画像レビューは未実施。**以下は制作時の発注条件として保存する。**

## 原則

このファイルはChatが作成した発注仕様。Workが画像を生成・検品し、GitHubに素材だけ保存する。公開mainの本体は人間レビュー中で変更しない。
画像は個別製品のレプリカでなく、**カテゴリ共通の参考写真風イメージ**。正式商品名・型番・価格は別管理。画面では「カテゴリ参考画像」と表示する。

## 最初の代表3点

| キー | ファイル名 | 完成条件 |
|---|---|---|
| earbuds | earbuds-neutral.webp | 汎用の完全ワイヤレスイヤホン＋ケース。無地、文字なし |
| charger | charger-neutral.webp | 汎用のUSB-C充電器。ロゴ・ブランド固有形状なし |
| eraser | eraser-neutral.webp | 汎用消しゴム。無地のケース、文字・商品番号なし |

代表3点を人間が確認してから残りをまとめて作る。画風が未確定のまま32点を一括制作しない。

## 全32カテゴリ画像

正本は n1/catalog-v1.js の imageCatalog とし、各キーに -neutral.webp を付ける。

- 文具8種：eraser / correction_pen / correction_tape / pencil_case / pen / notebook / paper / underlay
- デジタル9種：earbuds / headphones / charger / cable / smartphone / mouse / keyboard / clock / speaker
- 日用品10種：mug / tumbler / coffee / kitchen / tableware / beauty / towel / bag / clothing / shoes
- その他5種：furniture / appliance / diffuser / gift / car

## 画風・サイズ

- サイズ800×600 px、4:3横長、sRGBのWebP。基本不透明。容量目安1枚200KB以下、見た目を損なう過度な圧縮は禁止
- 明るいニュートラル背景、自然光風の商品撮影、適度な影、無理な発光や過剰なCG質感なし
- 商品単体を中央に置き、スマートフォン上でシルエットが認識できるようにする
- ブランドロゴ、型番、文字、水印、既存写真のトレース、著名な商標・特徴的意匠の再現は禁止
- 実在製品と完全に同じ外観に見せかけず、カテゴリの一般形状にする

## 保存場所・権限

- 制作物：n1/assets/catalog/<imageKey>-neutral.webp
- 素材台帳：n1/assets/catalog/manifest.json。キー、ファイル名、容量、寸法、SHA-256、制作方法、権利注記、試作/承認状態を記載
- Workが変更できる範囲：**n1/assets/catalog/ 内だけ**
- Workは n1/index.html、n1/scenario-v04.js、n1/catalog-v1.js、n1/README.md、ルート index.html、他作品に触れない
- GitHub更新前に最新コミットを取得し、他担当の変更を絶対に上書きしない

## QA・完了判定

32点のキー一致・欠番なし、全件WebPデコード、800×600、破損なし、統一感、スマホ縮小時の識別性、商標なし、台帳整合性を確認。発注数は試作3点＋本制作残り29点。再作成は不備があるファイルのみ。

## Chatへ引き継ぐもの

素材のコミット、パス、検品結果、素材台帳。Chatがパスを検証後に画像を組み込み、正式価格チェック済みかつ画像のある商品だけを出題対象にする。素材納入とゲームへの反映は別管理。

**制作前の指示書であり、現時点で画像が完成したことを意味しない。**
