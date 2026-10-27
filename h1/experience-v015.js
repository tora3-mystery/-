"use strict";
/* H1 β0.1.5: session-stable applicant aliases and viewport reset on a new screen.
   Applicant number (0-3), photo, background, private evidence and endings stay
   bound to the same profile. Historical archive applicants do not change.
*/
const H1_V015_NAMES=[
  ["高瀬 美咲","宮原 彩乃","佐伯 花音","藤崎 結衣","三浦 奈央","川島 里奈","柴田 明日香","成瀬 由衣"],
  ["黒田 悠真","吉岡 智也","川辺 健太","小田切 直樹","石田 俊介","中島 誠","松岡 凌","久保田 拓海"],
  ["桐山 真央","日向 朱里","瀬戸 香澄","西原 七海","白石 由佳","小泉 美月","木村 沙耶","若林 佳奈"],
  ["神谷 翔太","飯島 航","津田 陸","古川 大輔","長沢 悠斗","相沢 健","橋本 亮介","森本 遼"]
];
let h115NamedSeed=null;
let h115LastScreen=null;
function h115SynchronizeNames(){
  if(h115NamedSeed===state.seed)return;
  for(let i=0;i<people.length;i++){
    const bank=H1_V015_NAMES[i];
    let index=H1_V050.pick(state.seed,bank.length,11515,i);
    // Do not repeat an applicant's full name in two consecutive selections.
    if(bank[index]===people[i].name)index=(index+1)%bank.length;
    const name=bank[index];
    people[i].name=name;
    people[i].initial=name.slice(0,1);
    if(Array.isArray(S.people))S.people[i]=name;
  }
  h115NamedSeed=state.seed;
  // The older reset implementation uses "file", which is not a current tab.
  if(state.tab==="file")state.tab="es";
}
function h115ScreenKey(){
  const common=state.seed+"|"+state.phase;
  switch(state.phase){
    case "private":return common+"|"+state.privateIndex+"|"+state.privateShown;
    case "game":return common+"|"+state.round+"|"+state.shown;
    case "reverse":return common+"|"+state.reverseConfirmed+"|"+state.reverseIndex+"|"+state.reverseShown;
    case "ending":return common+"|"+outcome()+"|"+(state.goodStep||0)+"|"+(state.badStep||0)+"|"+(state.horrorStep||0);
    case "investigate":return common+"|"+(state.h106Result||false);
    default:return common;
  }
}
const h115PreviousRender=render;
render=function(){
  h115SynchronizeNames();
  h115PreviousRender();
  const screen=h115ScreenKey();
  // A radio button, bookmark, document tab, or comparison selection is still
  // the same screen; keep its scroll position. Only actual scene changes reset.
  if(h115LastScreen!==null&&screen!==h115LastScreen){
    window.scrollTo(0,0);
    // iOS Safari can restore the old scroll position after a large DOM swap.
    // A second reset on the next frame happens only if this screen remains active.
    if(typeof window.requestAnimationFrame==="function"){
      window.requestAnimationFrame(()=>{
        if(h115ScreenKey()===screen)window.scrollTo(0,0);
      });
    }
  }
  h115LastScreen=screen;
};
