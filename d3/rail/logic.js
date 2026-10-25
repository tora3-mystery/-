/* CASE 0048 | Deterministic causal engine, no real train-control instructions. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.RailLogic = api;
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const IDS = Object.freeze(['A','B','C','D','E','F']);
  const CORRECT = Object.freeze(['A','B','C','D']);
  const INITIAL = Object.freeze(['E','A','F','C']);
  const RECORDS = Object.freeze({
    A:{no:'R-42', name:'駅構内記録', location:'旧1番線', kind:'station', clues:['「旧1番線 最終営業」の案内が出ている。','旧線側の改札は閉まり、工事区域を分ける柵が続く。','新線のホーム番号は、この写真には写っていない。']},
    B:{no:'R-07', name:'構内設備記録', location:'連動制御室', kind:'device', clues:['操作表示に「進路 N-7 → 新3番線」「照合 OK」。','画面の別欄に「旧1番線 作業閉鎖済」。','これは単なる手動転てつではなく、信号と転てつ器の連動照合が終わった記録。']},
    C:{no:'R-31', name:'車両通過記録', location:'新3番線', kind:'trial', clues:['列車正面は「回送」。扉の前に一般客は見えない。','ホーム柱の「03」と分岐脇の「N-7」が同じ画角にある。','運行前の確認走行と読み取れる。']},
    D:{no:'R-16', name:'駅構内記録', location:'新3番線', kind:'opening', clues:['ホーム柱は「03」、車内とホームに乗客。','行先表示は「新都心」、案内板は「本日開業」。','列車が営業できるのは、設備の確認走行が成立した後。']},
    E:{no:'R-58', name:'開業関連記録', location:'広報室', kind:'model', clues:['華やかな「北湾新都心線」背景は、上部が巻かれた横断幕。','線路に見えるものは展示模型の台座。','開業への期待を示すが、列車の実走や設備の承認は示さない。']},
    F:{no:'R-24', name:'車両通過記録', location:'旧1番線', kind:'old', clues:['列車正面は「回送」。車種は別写真と同じ。','ホーム柱にあるのは「01」。線路脇の記号は「S-2」。','新3番線の試験走行を証明する写真ではない。']}
  });
  const WORLD_NAMES = Object.freeze({success:'巨大ターミナル',small:'小さな地方駅',bus:'バスターミナル',sealed:'封鎖された駅舎'});
  function validate(order){return Array.isArray(order)&&order.length===4&&new Set(order).size===4&&order.every(id=>IDS.includes(id));}
  function classify(order){
    if(!validate(order)) return {world:'pending',cause:'incomplete',head:'4枚を選択してください',text:'重複のない4枚を採用し、上から順に並べてください。',evidence:'未確定',trace:[]};
    // All four slots are interpreted as attempted historical events. A rejected event
    // cannot magically make signalling, trials, or passenger service happen.
    let oldClosed=false, routeOK=false, testOK=false, open=false, openingHeld=false, heldAfterClosure=false;
    const trace=[];
    for(const id of order){
      if(id==='A') {oldClosed=true; trace.push('旧1番線の使用を終了。代替交通が必要になる。');}
      if(id==='B') {
        if(oldClosed){routeOK=true;trace.push('旧線閉鎖を照合。N-7の連動検査が成立。');}
        else trace.push('旧線の作業閉鎖前。N-7の使用承認は成立しない。');
      }
      if(id==='C') {
        if(routeOK){testOK=true;trace.push('新3番線の無旅客確認走行が成立。');}
        else trace.push('新線の進路確認がなく、回送試験は見合わせ。');
      }
      if(id==='D') {
        if(testOK){open=true;trace.push('確認走行後、営業列車が新3番線へ到着。');}
        else {openingHeld=true;heldAfterClosure=oldClosed;trace.push('開業運行の要求を保安側で抑止。営業列車は進入せず。');}
      }
      if(id==='E')trace.push('式典用模型の撮影。線路・運転の実績にはならない。');
      if(id==='F')trace.push(oldClosed?'旧1番線の回送記録は本件の新線試験として不採用。':'旧線での回送。新線の試験にはならない。');
    }
    if(open){
      return {world:'success',cause:'restored',head:'基準履歴と一致：北湾新都心線、開業',text:'旧1番線の使用終了、N-7の連動照合、無旅客の確認走行、最初の営業列車到着が順に成立。2026年の開業を起点に、2030年の北湾駅は広域の結節点となった。',evidence:'2026年：旧線終了 → 連動確認 → 無旅客試走 → 営業開始',trace};
    }
    if(openingHeld && heldAfterClosure){
      const reason=!routeOK?'進路承認前の開業要求':!testOK?'確認走行前の開業要求':'運行条件の不一致';
      return {world:'sealed',cause:!routeOK?'route-hold':'trial-hold',head:'保安側が営業進入を抑止',text:`${reason}が記録され、信号保安系が営業列車の進入を止めた。事故は起きていない。虚偽の開業発表と安全確認の問題で投資が凍結され、2030年も新駅舎は封鎖されている。`,evidence:'運行結果：発車／進入不成立・調査・事業凍結',trace};
    }
    if(oldClosed){
      if(testOK){return {world:'bus',cause:'no-opening',head:'試走成功、開業の記録なし',text:'線路と信号の確認まで完了したが、営業開始の記録がつながらない。旧1番線は既に使用終了。北湾の交通は代替バスを中心に再編された。',evidence:'旧線終了／新線試走済／営業開始未確定',trace};}
      if(routeOK){return {world:'bus',cause:'no-trial',head:'設備は確認済み、試走が成立しない',text:'新線への進路確認後、無旅客の確認走行が成立しなかった。開業は延期され、旧線の代替となるバス乗換拠点だけが残った。',evidence:'旧線終了／進路照合済／試走未成立',trace};}
      return {world:'bus',cause:'no-route',head:'旧線が閉じ、新線も使えない',text:'旧1番線を閉じた一方、N-7の連動確認を済ませた歴史がない。新線への列車進入は許されず、2030年の北湾はバスターミナルに変わった。',evidence:'旧線終了／新線使用承認なし',trace};
    }
    return {world:'small',cause:openingHeld?'opening-cancelled':'legacy-remains',head:openingHeld?'早すぎた開業案内、旧線は存続':'新線の開業に至らず、旧駅が存続',text:openingHeld?'新線開業の要求は保安側で抑止された。旧1番線がまだ使えるため、地域列車だけは残り、街の開発は進まなかった。':'新線の成立を裏付ける履歴が欠けている。旧1番線は引き続き利用され、2030年も小規模な駅のままとなった。',evidence:'旧線営業継続／新線未開業',trace};
  }
  function allArrangements(){const out=[];for(const a of IDS)for(const b of IDS)for(const c of IDS)for(const d of IDS){let o=[a,b,c,d];if(new Set(o).size===4)out.push(o);}return out;}
  return Object.freeze({IDS,CORRECT,INITIAL,RECORDS,WORLD_NAMES,validate,classify,allArrangements});
});
