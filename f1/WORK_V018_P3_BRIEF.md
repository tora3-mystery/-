# F1 v0.18｜P3正式制作発注書【P2代替案採用・新規23枚】

## 制作判断（2026-10-27）

対象：`tora3-mystery/short-ui-games`、ゲームF1「すべてのご意見に対応してください。」

**P1承認済み、P2検品済み。P2の透明レジ合成は不合格だったため、「増設結果写真1回＋継続効果は数値・状態表示」を正式採用する。P3は通常営業の主写真23枚のみ。過去の「残り28枚」指示は無効。**

発注対象はGitHub `main` 最新版の `f1/store_scene_v018.js` が公開する `P3_FILES`（23ファイル）と、この書面を正本とする。**ゲーム実装はChat側で別工程**。P3でHTML・JS・INDEXを変更しない。

## フェーズ別・最終制作物

| フェーズ | 素材 | 数 |
|---|---|---:|
| P1 | main-base-neutral, main-checkout-mild, main-checkout-aisle-severe | 3枚：人間承認済み |
| P2 | main-checkout-moderate, main-improved-register-added, main-noise-severe | 3枚：検品済み |
| P3 | 以下の主写真23ファイル | 23枚：今回の対象 |
| **最終** | 定点主写真28点＋レジ増設結果の記録写真1点 | **29枚** |

元34候補のうち `main-improved-aisle-rearranged.webp`、`main-improved-restocked.webp`、`main-improved-renovated.webp`、`main-outcome-success.webp`、`main-outcome-decline.webp` は**制作しない**。既存のエンディング素材は維持。

## P3新規23点（ファイル名・用途）

1. `f1/assets/main-base-orderly.webp`
2. `f1/assets/main-base-busy.webp`
3. `f1/assets/main-base-underused.webp`
4. `f1/assets/main-checkout-severe.webp`
5. `f1/assets/main-aisle-mild.webp`
6. `f1/assets/main-aisle-moderate.webp`
7. `f1/assets/main-aisle-severe.webp`
8. `f1/assets/main-stock-mild.webp`
9. `f1/assets/main-stock-moderate.webp`
10. `f1/assets/main-stock-severe.webp`
11. `f1/assets/main-noise-mild.webp`
12. `f1/assets/main-noise-moderate.webp`
13. `f1/assets/main-checkout-aisle-moderate.webp`
14. `f1/assets/main-checkout-stock-moderate.webp`
15. `f1/assets/main-checkout-stock-severe.webp`
16. `f1/assets/main-checkout-noise-moderate.webp`
17. `f1/assets/main-checkout-noise-severe.webp`
18. `f1/assets/main-aisle-stock-moderate.webp`
19. `f1/assets/main-aisle-stock-severe.webp`
20. `f1/assets/main-aisle-noise-moderate.webp`
21. `f1/assets/main-aisle-noise-severe.webp`
22. `f1/assets/main-stock-noise-moderate.webp`
23. `f1/assets/main-stock-noise-severe.webp`

**必須：** この23ファイルの名前・用途・順序は `store_scene_v018.js` の `P3_FILES` と突合する。画像の対応が1つでもずれたら出荷しない。

## 画面に何を表すか

- 主写真の責任範囲は **現在の店舗状況（レジ待ち、通路、欠品、騒音の雰囲気）**。お客様の声の下線調査や数値指標と対応する。
- 主写真を「設備改装履歴の完全な記録」に使わない。店舗基本構造はP1 `main-base-neutral.webp` に固定し、**新たなレジ台、売場改装、セルフレジ、受取窓口等の増設設備をP3写真へ追加しない**。
- `main-improved-register-added.webp` は、**レジ増設が実際に完了した翌朝の結果写真**として1回のみ、全景ではなく4台目のレジ付近を切り取った記録写真としてChatが表示する。通常全景へ復帰してもレジが魔法のように消えたと感じさせない見せ方を統合時に監査する。4台目が主画面の外にある可能性を踏まえ、**主写真から店内設備の総数が必ず読めるようなキャプションは付けない**。
- 騒音の大小は写真だけでは定量化できない。スピーカーの業務・放送中の店員・客の反応を控えめに描き、ゲームの騒音指標・アイコンで補う。写真に擬音の文字や音波エフェクトを焼き込まない。
- `moderate` と `severe` の混合状態は「最大の問題が深刻ならsevere」。両問題の深刻さを必ず同じに描かず、最重要の苦情を優先する。
- 一度施策を実行したかどうかで背景の什器が変わらない。変化は客・待機列・カート動線・欠品商品・PA業務の様子を局所編集して示す。

## マスターと生成方法

- 保存先のP1/P2代表6枚を必ず参照。P1ベースに使った**同一撮影マスター画像**を引き続き編集入力に使用。独立生成・画角変更・棚の再構築・別店舗への移動は禁止。
- レジ3列、オリーブ色柱、ベージュ床、緑のかご、右棚、奥PA設備の配置を維持。人・カートの増減はよいが、レジ台数、柱・床の目地、棚の輪郭、遠近法を保持する。
- 写実的な日本の架空スーパー。人物は架空、商標・読めるブランド文字・説明文字を焼き込まない。人工的な光や不自然な手足を避ける。
- 各画像1100×619 WebP（16:9）、品質82程度、目標350KB以内（過大ファイルは圧縮再検討）。同じ入力マスターから段階差を編集する。
- 同一カテゴリの mild → moderate → severe を390px幅で横並び比較。単なる明暗差・人数差だけでなく、列や通路の**長さ・幅・通行可能性**で識別できること。
- 複合12枚は、画面内の片方の問題が消えていないか確認。3種類以上の苦情が同時に悪い場合でも、画像が表すのは上位2軸のみでよい。
- 23枚すべて必要な制作数として管理するが、画質または不整合が顕著な素材は**該当画像のみ差し戻し**。問題のある画像を黙って流用・複製して枚数合わせしない。

## 検品・納品

1. P3全23点のファイル存在・WebP形式・1100×619・容量・ファイル名対応をチェック。
2. 既存6点を含め計29点の台帳 `f1/ASSETS_V018.md` を更新（そのうち28主写真＋1結果写真）。
3. P1マスターとの固定物50%透過比較、同一カテゴリの3段階390px比較、複合問題の2軸整合性を点検。写真間の変化が分からないもの、設備位置がずれるものを列挙・対象差分だけ修正。
4. 合否・未解決課題・各ファイル容量・GitHubコミットSHA・変更ファイルを報告。
5. 写真納品完了とゲーム表示・公開済みを混同しない。ゲーム本体への組込みはChatが実施する。

## GitHub／権限とコンフリクト回避

- P1/P2が保存された既存レビュー用ブランチ `f1-v018-p1-20261027` の最新HEADを取得し、**そのブランチへP3素材を継ぎ足す**。画像6枚と台帳内容を維持。
- `main` は他作業で更新されているため、まず `main` 最新の本書・`STORE_PHOTO_STATE_SPEC_V018.md`・`store_scene_v018.js` を参照し、**ブランチに古い設計書・コードを再導入しない**。
- 編集可能：レビュー用ブランチ内の `f1/assets/main-*.webp`（新規23枚）、`f1/ASSETS_V018.md` のみ。既存6枚は原則不変更。
- **変更禁止：** `f1/index.html`、`f1/store_scene_v018.js`、`f1/tests/`、仕様書／発注書、ルートINDEX、他作品。
- レビュー用ブランチ全体を `main` に強制マージしない。Chatが最新mainを基準に画像・素材台帳のみ安全に統合する。
