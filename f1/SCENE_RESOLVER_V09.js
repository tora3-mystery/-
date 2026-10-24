/* F1 scene resolver proposal v0.9, pure helper.
 * NOT wired into f1/index.html, and files are not yet committed to assets/.
 */
const F1_SCENE_FILES = Object.freeze([
  "store-normal.jpg","store-queue.jpg","store-aisle.jpg","store-stock.jpg","store-noise.jpg",
  "store-thriving.jpg","store-popular-chaos.jpg","store-underused.jpg","store-declining.jpg",
  "store-construction.jpg","store-odd1.jpg","store-odd2.jpg","store-odd3.jpg",
  "store-human-day.jpg","store-closed.jpg"
]);
function resolveF1Scene(x) {
  const cats = Array.isArray(x.complaintsByCategory) ? x.complaintsByCategory : [0,0,0,0];
  if(cats.length !== 4 || cats.some(v => !Number.isInteger(v)||v<0)) throw Error("Invalid complaint categories");
  const total = cats.reduce((a,b)=>a+b,0),attraction = Number(x.attraction ?? 7);
  if(!Number.isFinite(attraction)||attraction<0||attraction>10) throw Error("Invalid attraction");
  const dominant = cats.indexOf(Math.max(...cats));
  const issueFiles = ["store-queue.jpg","store-aisle.jpg","store-stock.jpg","store-noise.jpg"];
  const dominantFile = issueFiles[dominant];
  const ending = x.ending || null;
  if(ending) {
    const endings = {
      normal_success:"store-thriving.jpg",
      odd_stop:"store-odd1.jpg",
      odd_missing:"store-odd2.jpg",
      odd_day8:"store-human-day.jpg",
      odd_hidden:"store-normal.jpg"
    };
    if(endings[ending]) return endings[ending];
    if(x.endingReason === "閉店") return "store-closed.jpg";
    if(x.endingReason === "店長交代" && attraction<=3) return total<=3?"store-underused.jpg":"store-declining.jpg";
    if(ending === "normal_customer" && attraction>=8 && total>=5) return "store-popular-chaos.jpg";
    if(ending === "normal_customer") return dominantFile;
    if(ending !== "normal_strain") throw Error("Unknown ending: "+ending);
  }
  if(x.isHumanDay || Number(x.day) === 8) return "store-human-day.jpg";
  const maskedSunday = Number(x.day)===7 && Boolean(x.glitchSeen) && !Boolean(x.sundayRevealed);
  if(maskedSunday) return "store-normal.jpg";
  if(x.anomalyLevel > 0) return ["store-normal.jpg","store-odd1.jpg","store-odd2.jpg","store-odd3.jpg"][Math.min(3,Number(x.anomalyLevel))];
  if(x.inConstructionResult) return "store-construction.jpg";
  if(Number(x.day)===1 && !x.gameStarted) return "store-normal.jpg";
  if(attraction<=3) return total<=3?"store-underused.jpg":"store-declining.jpg";
  if(attraction>=9 && total>=6) return "store-popular-chaos.jpg";
  if(attraction>=8 && total<=2) return "store-thriving.jpg";
  if(Math.max(...cats)>=3 || (total>=6 && Math.max(...cats)>=2)) return dominantFile;
  return "store-normal.jpg";
}
if(typeof module !== "undefined" && module.exports) module.exports = {resolveF1Scene,F1_SCENE_FILES};
