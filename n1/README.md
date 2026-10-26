# N1『正確にお答えにならないでください。』

- 実装バージョン：v0.1.0（2026-10-26 18:52 JST 初回プレイテスト版）
- 公開パス：`/n1/`（静的 HTML/CSS/JavaScript、外部 API なし）
- 管理範囲：原則 `n1/` のみ。トップページ `/index.html` は ARG 企画マスター管理。

## 遊び

日常生活の12問を数値自由入力で回答。空気読み0〜100点を基本とし、実際の数字と完全一致すれば無条件100点。相手の反応と事実への的中は異なるため、同じ100点でも異なるリアクションが生じる。1周3枚のヒント券、会話ログ、最終成績、周回での変種変更を実装。

## データ設計

- 12出題枠×3変種（36個の問題設定）。人物・質問形式は固定し、年齢・商品・価格・ヒントが周回で入れ替わる。
- Q2→Q9は同一の架空商品と購入価格・他店舗セール価格を共有。Q8→Q12は同一の実在商品と公式価格を共有。
- 架空の商品価格はフィクションと明示。実在する商品の正解は、第三者通販のセール・ポイント値引きではなく、メーカーまたはブランド公式ページの税込表示価格。基準日 2026-10-26。
- 資料や商品について、画面上のイラストは独自制作の模式イラストまたは絵文字。公式写真の無断流用なし。

## 実在商品データ台帳（2026-10-26 確認）

| ID | 仕様固定・税込公式価格 | 公式出典 |
|---|---|---|
| cloth | Apple ポリッシングクロス 1,580円 | https://www.apple.com/jp/shop/product/mlh74fe/a/ |
| mug | Snow Peak チタンシングルマグ450 MG-143 3,520円 | https://ec.snowpeak.co.jp/item/SNP0117A0185 |
| scissors | コクヨ サクサ HSM-PTA100D 1,540円 | https://www.kokuyo-shop.jp/sc/ProductDetail.aspx?pcd=4901480395548 |
| toraya | とらや 小形羊羹5本入 1,782円 | https://checkout.toraya-group.co.jp/products/box-yokan-petite_boxof5 |
| yokumoku | ヨックモック シガール20本入 1,998円 | https://yokumoku.co.jp/products/1010011201030 |
| kinto | KINTO SCS-S03 マグ320ml 2,200円 | https://kinto.co.jp/products/20754 |
| hario | HARIO×たち吉 V60伝統釉・織部 T-VDT-02-OB 11,000円 | https://shop.hariocorp.co.jp/products/t-vdt-02-ob |
| ikea | IKEA LACK白35×35cm 105.147.92 999円（店舗差あり） | https://www.ikea.com/jp/ja/p/lack-side-table-white-10514792/ |
| car | トヨタ カローラ G 2WD 1.8Lハイブリッド 2,745,600円（メーカー希望小売価格。オプション・諸費用・登録費用等は含めない） | https://toyota.jp/corolla/grade/ |
| toaster | BALMUDA The Toaster KTT02JP 2026年モデル 39,600円 | https://www.balmuda.com/jp/news/3800 |
| stand | KINTO SCS-S04 ブリューワースタンドセット2cups No.27572 14,300円 | https://kinto.co.jp/products/27572 |

## 実在人物・施設の基準

- 阿部寛 1964/6/22：https://site.official.jp/AbeHiroshi/
- ヒロミ 1965/2/13：https://www.talent-databank.co.jp/search/profile/2000042632
- 浜田雅功 1963/5/11：https://profile.yoshimoto.co.jp/talent/detail?id=252
- 東京駅開業1914年：https://www.jreast.co.jp/estation/station/info.aspx?StationCd=1039
- 国会議事堂竣工1936年：https://www.sangiin.go.jp/japanese/goiken_gositumon/faq/index.html
- 東京タワー竣工1958年：https://www.japantowers.jp/tokyo_tower/

## QA記録

- JS構文検証：成功。
- 36変種：完全一致時100点、空気読み満点帯100点、出典・入力範囲検証：成功。
- 36,000件の採点ランダム入力：点数0〜100、NaNや範囲逸脱なし。
- モック DOM による3通りの12問通し進行・ヒント消費・再登場一致：成功。
- N1とは無関係の既存6作品のファイルは編集していない。
- **未実施：実機ブラウザ表示、320/390pxでのレイアウト検証、音声や実アニメーションの確認、GitHub Pagesでのレンダリング確認。** これらは本リリースのプレイテスト課題。

## 今後の課題

- 固定人物のオリジナル顔画像の充実。現段階では独自 SVG ポートレート。
- 商品の模式イラストと型番識別の精度向上。現段階で一部の品目は絵文字。
- 空気読み満点帯・笑いの反応・12問のプレイ時間をユーザーテストから調整。
- 公式価格はゲーム内の2026-10-26基準価格として固定し、変更時は仕様・ソース・基準日をすべて一緒に改訂する。
