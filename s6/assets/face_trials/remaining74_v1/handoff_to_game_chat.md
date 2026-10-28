# ゲーム本体Chatへの引継ぎ｜S6 faces v5.0

このブランチは人間確認前の候補素材です。ここから本番画像への統合はしていません。

- ブランチ：`s6/face-trials-remaining74-v1-20261029`
- 納品ディレクトリ：`s6/assets/face_trials/remaining74_v1/`
- 新規対象：P017〜P096からPhase 1対象6人を除く74人、`images/pNNN.webp`
- 比較用96人一覧には、既存P001〜P016、v4.0候補5人、v4.1候補P094、今回74候補を配置。実ゲームの参照は未変更。

## 次工程で確認すること

1. 各画像候補を監修し、必要な画像だけ採用・差し替え。
2. `reviews/visual_similarity_top20.csv` の手動候補を、特に同グループ登場（E12-B P049/P086、E04-D P064/P065など）で確認。数値顔照合は未実施。
3. `reviews/appearance_mismatch_handoff.md` と容姿DBブランチの `s6/assets/face_design/game_data_mismatch.md` を使い、採用画像と `people[].appearance` / `members[].visual_description` を照合。
4. 写真らしさについて、整いすぎ・同じ撮影スタイルが残る点を受け入れ可能か判断。
5. 採用後にのみ、ゲームUI、人物手帳、SNS、再登場照合を実機サイズで検証。

## 変更していないもの

`s6/assets/faces/`、`game-data.js`、`game.js`、`index.html`、`style.css`、`status.json`、appearance DB、ルートindex、他作品。
