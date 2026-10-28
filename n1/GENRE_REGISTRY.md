# N1 出題ジャンル採用台帳（v0.6.0-rc5、2026/10/28）

## 採用方針
- I01〜I11：すべて採用継続。物語連動4問と旧問題プールを維持。
- I12：採用・実データ化。東京都2026年9月1日推計の世田谷区959,130人、練馬区764,060人、八王子市574,003人を使用。概数の回答も受容。
- I13・I14：採用しない。
- I15：採用。架空の備品庫の在庫計算、1ジャンルに限定。
- I16〜I23：不採用、抽選から除外。
- P01〜P17：根拠・採点規準が不十分なため未採用。
- P18〜P23：出典確認済みの実データを使って採用。
- P24〜P28：採否未指定のため保留。

## 新小質問8ジャンル×3基本変種
- I12 人口：東京都2026/9/1推計。https://www.metro.tokyo.lg.jp/information/press/2026/09/2026093007
- I15 備品庫在庫：ゲーム内架空の数値。実データを装わず明示。
- P18 当時のゲーム機価格：GBA SP 2004/9価格改定前12,500円、初代DS発売時15,000円、DS Lite発売時16,800円。https://www.nintendo.co.jp/corporate/release/2004/040901.html https://www.nintendo.co.jp/corporate/release/2004/040921a.html https://www.nintendo.co.jp/corporate/release/2006/060126.html
- P19 家賃相場：SUUMO 2026/10/10掲載値の固定データ。荒川区1K/1DK 87,000円、中野区1LDK/2K/2DK 140,000円、新宿区2LDK/3K/3DK 269,000円。https://suumo.jp/chintai/tokyo/ ※ページ更新で数値が変わり得るため、基準日付き記録として管理する。
- P20 製品重量：初代iPad Wi-Fi 680g、第8世代Wi-Fi 490g、第10世代Wi-Fi 477g。Apple公式 https://support.apple.com/ja-jp/112438 https://support.apple.com/ja-jp/118451 https://support.apple.com/ja-jp/111840
- P21 映画上映時間：約86分『となりのトトロ』、約125分『千と千尋の神隠し』、約133分『もののけ姫』。ジブリ公式 https://www.ghibli.jp/works/totoro/ https://www.ghibli.jp/works/chihiro/ https://www.ghibli.jp/works/mononoke/
- P22 建物・塔の高さ：東京タワー333m、東京スカイツリー634m、あべのハルカス300m。施設公式 https://www.tokyotower.co.jp/plan/towerpedia/ https://www.tokyo-skytree.jp/about/outline/ https://www.abenoharukas-300.jp/about/outline.html
- P23 店舗数：2025/8末の国内無印良品683店舗、国内全業態717店舗、国内海外全業態1,474店舗。良品計画 https://www.ryohin-keikaku.jp/corporate/overview

## 抽選・採点
- 月〜金×2問＝10問のうち物語連動4問は固定し、残る6問に新ジャンル4〜5問・旧ジャンル1〜2問を割り当てる。
- 曜日内の順序は変動する。同日に同じ登場人物を2回使わない。
- 事実の完全一致は100点、それ以外は距離に応じて部分点（100未満）。人口の概算幅の内側は100点。
- 通常30秒・挑戦15秒、時間切れ0点。出典と基準日を結果画面で表示。画像は参考画像であり公式製品写真を装わない。

## QAと残存課題
- 模擬JavaScriptによる1,200周・12,000問、8ジャンル全出現、同日人物重複0、商品ID再登場一致、話者の一致、出典URL欠損0、生成例外0を確認。
- 実ブラウザのrc5通しQA、iOS/Android実機、人間初見プレイは未実施。
