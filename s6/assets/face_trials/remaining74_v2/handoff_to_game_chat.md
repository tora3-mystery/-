# S6 ゲーム本体Chatへの引き継ぎ

## 画像構成

- P001〜P016：mainの `s6/assets/faces/` を維持。
- P018・P019・P026・P036・P046：Phase 1 v4.0候補。
- P094：Phase 1 v4.1候補。
- その他74人：この `remaining74_v2/images/`。v1と同一55枚、変更19枚。

これは本番採用前の候補素材。main、本番のfaces、ゲームコード、容姿DBは未変更。

## 人物設定との照合

画像の制作基準は容姿DBの主要属性と `style_anchor`。現行の `game-data.js` にある `appearance` や `members.visual_description` は古い外見を含むため、写真を本番採用する際はゲーム側で独立に確認する。19人のゲーム説明とDB要約は `reviews/game_data_description_handoff_19.csv`。

特にP028・P030・P033・P057・P065・P071・P077・P078・P091は髪、眼鏡、または小物の記述に目立つ差がある。設定変更は本Workでは行っていない。

## 視覚QAの引き継ぎ

- 44グループは `reviews/group_visual_qa_44.csv` に結果。E04-DとE12-Bの改善前後比較あり。
- E04-A、E04-B、E09-A、E09-C、E12-Aは小表示で要注意。E09-AのP002/P008は重要人物であり、今回の画像変更対象外。
- ゲーム内の会場・人物手帳・SNSで、同じ人物IDに同じ画像を使い、再登場時の照合を試験する。
- スマートフォン実機での表示・負荷・初見プレイヤー評価は未実施。
