# S6 容姿DB仕様（Phase 0 / draft v1.0）

## 基本設計
- 正本人物ID・氏名・学年は `s6/game-data.js`。
- このフォルダは**画像生成のための独立した容姿DB**。ゲーム本体のDBを編集しない。
- P001〜P016は現行写真維持。見えない属性に値を捏造せず「未設定」。
- P017〜P096は仮設計であり、実写真の形状・性表現に合わせた人間レビュー前提。
- `style_anchor`は**既存写真で観察される見た目**であり、性別・性自認の設定ではない。
- 身長感・体格・肩幅は数値体重などの断定を避ける。

## 生成ルール
- 一定seed 20261027、項目の**重み付き抽選**（人間の創作上の分布、統計的実測値ではない）。
- 70候補/人を生成して、同一グループの人物を重視し、顔骨格・目鼻・体格を優先して近さを下げる。
- 不自然な組合せを補正（幅広の丸型×狭顔、面長×短い顔比、華奢×広肩など）。
- 確定的な容姿分類や人格評価ではない。肌の状態を「欠点」とせず、自然な揺らぎの一部とする。

## カラム
- 識別：`person_id,name,year,portrait_path`
- 管理：`design_status,style_anchor,existing_appearance,design_source,review_status`
- 体格：`stature,build,shoulders,neck`
- 骨格：`face_shape,face_ratio,face_width,cheek_volume,cheekbones,jaw,forehead`
- 目鼻口：`eye_size,eye_shape,eye_spacing,eyelid,brow,nose_bridge,nose_width,nose_tip,mouth_width,lips`
- 肌：`skin_tone,skin_texture`
- 髪：`hair_color,hair_length,hair_volume,hair_texture,fringe,parting,styling`
- 外見：`eyewear,distinguishing_detail,facial_hair`
- 撮影：`expression,gaze,camera_angle,camera_distance,outfit,light,background`
- 固定16人目視補足：`anchor_face_note,anchor_hair_note`

## 禁止事項
- 顔から性格・善悪・安全性・所属を決めない。
- フェイスパーツの個性を過剰に誇張しない。
- 名前から性別・外見を推測しない。
- 顔写真生成前に本番画像を書き換えない。
