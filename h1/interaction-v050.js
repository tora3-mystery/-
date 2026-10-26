/* H1 α0.5.0 — all clues coexist in every play; no per-run scenario-theme selection. */
const H1_V050={
  emotions:["neutral","smile","thinking","tense"],
  // Stable pseudo-random choice: same conversation, same reaction, even after opening evidence.
  hash(seed,...parts){
    let x=(seed>>>0)^0x9e3779b9;
    for(const v of parts){x=Math.imul((x^(Number(v)>>>0))+0x85ebca6b,0xc2b2ae35)>>>0;x^=x>>>13;}
    return x>>>0;
  },
  pick(seed,max,...parts){return this.hash(seed,...parts)%max;},
  expression(seed,person,phase,round,question,shown){
    const phaseId=phase==="private"?1:phase==="group"?2:phase==="reverse"?3:0;
    if(phaseId===0)return "neutral";
    const n=this.pick(seed,4,person,phaseId,round,question,shown?1:0);
    const overrides=[["smile","thinking","neutral","tense"],["thinking","neutral","smile","tense"],["thinking","tense","neutral","smile"],["neutral","tense","smile","thinking"]];
    return overrides[person][n];
  },
  pupil(seed,monster,person,stage,active){
    if(person!==monster||!active)return 0;
    if(stage==="horror")return 3;
    const chance=this.pick(seed,100,monster,stage==="reverse"?9:7,19);
    return stage==="reverse"?(chance<55?2:0):(stage==="last-group"&&chance<35?1:0);
  },
  voice(seed,base,person,round,question){
    const choice=this.pick(seed,3,person,round,question,43);
    if(choice===0)return base;
    const t=String(base),framed=t.startsWith("「")&&t.endsWith("」");
    if(!framed)return base;
    const inner=t.slice(1,-1).trim();
    const starts=["ええと、","そうですね、","少し考えたのですが、","そのときは、"];
    if(choice===1 && !/^(ええと|そうですね|……|はい。|ありません。)/.test(inner))return "「"+starts[person]+inner+"」";
    const ends=["そこは今でも覚えています。","その経験は印象に残っています。","……言葉にすると難しいですね。","自分としては、そう考えています。"];
    if(choice===2 && !/[？?]$/.test(inner))return "「"+inner.replace(/[。．]$/,"。")+" "+ends[person]+"」";
    return base;
  },
  reaction(seed,round,q,monster,names){
    const speaker=this.pick(seed,4,round,q,65);
    const target=(speaker+1+this.pick(seed,3,round,q,66))%4;
    const neutral=[
      ["……確かに、役割を決めるときはそういう考えもありますね。","それは少し意外でした。自分の活動とも近い部分がありそうです。","私はその進め方、結構参考になると思いました。"],
      ["少し条件が違う気もしますが、考え方は理解できます。","……その点は、僕も気になりました。","具体的な記録が残っているのは大事ですね。"],
      ["お話を聞いて、似た場面を思い出しました。","ありがとうございます。少し考え方が整理できました。","……私は別の方法を選びそうですが、分かります。"],
      ["それ、現場だと難しいこともありますよね。","ああ、そういう判断もあるんですね。","……なるほど。僕ならまず担当に確認するかもしれません。"]
    ];
    const line=neutral[speaker][this.pick(seed,3,speaker,round,q,67)];
    const descriptions=["大野が少し前のめりになる。","岡野が小さくうなずき、手元を見直す。","澤田が一瞬だけ視線を落とす。","水野が隣の応募者の方を向く。"];
    return {speaker,target,person:names[speaker],line,description:descriptions[speaker]};
  }
};