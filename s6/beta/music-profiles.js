(()=>{
'use strict';
// S6 beta-only stable 96-character skills. Indexed by canonical person_id, never by name/photo.
const columns=["vocal","guitar","bass","drums","keyboard","other","dtm"];
const records={
 "P001": {
  "grades": [
   "◎",
   "◎",
   "△",
   "×",
   "△",
   "×",
   "○"
  ],
  "original": true,
  "cover": true
 },
 "P002": {
  "grades": [
   "○",
   "◎",
   "△",
   "×",
   "△",
   "×",
   "△"
  ],
  "original": true,
  "cover": true
 },
 "P003": {
  "grades": [
   "○",
   "△",
   "◎",
   "×",
   "×",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P004": {
  "grades": [
   "×",
   "△",
   "×",
   "×",
   "○",
   "△",
   "◎"
  ],
  "original": true,
  "cover": false
 },
 "P005": {
  "grades": [
   "△",
   "×",
   "△",
   "◎",
   "×",
   "△",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P006": {
  "grades": [
   "△",
   "△",
   "×",
   "×",
   "◎",
   "×",
   "○"
  ],
  "original": true,
  "cover": true
 },
 "P007": {
  "grades": [
   "×",
   "◎",
   "×",
   "×",
   "○",
   "×",
   "△"
  ],
  "original": false,
  "cover": true
 },
 "P008": {
  "grades": [
   "△",
   "×",
   "◎",
   "△",
   "×",
   "×",
   "×"
  ],
  "original": true,
  "cover": true
 },
 "P009": {
  "grades": [
   "×",
   "×",
   "○",
   "◎",
   "×",
   "△",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P010": {
  "grades": [
   "◎",
   "×",
   "×",
   "×",
   "○",
   "×",
   "×"
  ],
  "original": true,
  "cover": true
 },
 "P011": {
  "grades": [
   "△",
   "◎",
   "×",
   "×",
   "△",
   "×",
   "△"
  ],
  "original": false,
  "cover": true
 },
 "P012": {
  "grades": [
   "×",
   "△",
   "△",
   "○",
   "×",
   "◎",
   "×"
  ],
  "original": true,
  "cover": true
 },
 "P013": {
  "grades": [
   "◎",
   "×",
   "×",
   "×",
   "○",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P014": {
  "grades": [
   "×",
   "○",
   "×",
   "◎",
   "×",
   "×",
   "△"
  ],
  "original": false,
  "cover": true
 },
 "P015": {
  "grades": [
   "○",
   "×",
   "×",
   "×",
   "◎",
   "×",
   "△"
  ],
  "original": true,
  "cover": true
 },
 "P016": {
  "grades": [
   "×",
   "△",
   "◎",
   "×",
   "×",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P017": {
  "grades": [
   "◎",
   "○",
   "×",
   "×",
   "△",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P018": {
  "grades": [
   "○",
   "◎",
   "×",
   "×",
   "△",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P019": {
  "grades": [
   "×",
   "×",
   "×",
   "◎",
   "×",
   "○",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P020": {
  "grades": [
   "×",
   "×",
   "◎",
   "△",
   "×",
   "×",
   "×"
  ],
  "original": true,
  "cover": true
 },
 "P021": {
  "grades": [
   "○",
   "×",
   "×",
   "×",
   "◎",
   "×",
   "△"
  ],
  "original": false,
  "cover": true
 },
 "P022": {
  "grades": [
   "×",
   "◎",
   "×",
   "×",
   "○",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P023": {
  "grades": [
   "◎",
   "×",
   "×",
   "×",
   "×",
   "×",
   "○"
  ],
  "original": false,
  "cover": true
 },
 "P024": {
  "grades": [
   "△",
   "◎",
   "×",
   "×",
   "△",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P025": {
  "grades": [
   "◎",
   "×",
   "×",
   "×",
   "○",
   "×",
   "×"
  ],
  "original": true,
  "cover": false
 },
 "P026": {
  "grades": [
   "×",
   "○",
   "×",
   "◎",
   "×",
   "×",
   "×"
  ],
  "original": true,
  "cover": true
 },
 "P027": {
  "grades": [
   "○",
   "×",
   "×",
   "×",
   "◎",
   "×",
   "△"
  ],
  "original": true,
  "cover": false
 },
 "P028": {
  "grades": [
   "×",
   "△",
   "◎",
   "×",
   "×",
   "×",
   "△"
  ],
  "original": true,
  "cover": true
 },
 "P029": {
  "grades": [
   "×",
   "◎",
   "×",
   "×",
   "×",
   "×",
   "○"
  ],
  "original": true,
  "cover": false
 },
 "P030": {
  "grades": [
   "◎",
   "○",
   "×",
   "×",
   "△",
   "×",
   "×"
  ],
  "original": true,
  "cover": true
 },
 "P031": {
  "grades": [
   "×",
   "○",
   "×",
   "×",
   "×",
   "◎",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P032": {
  "grades": [
   "×",
   "◎",
   "×",
   "×",
   "×",
   "×",
   "△"
  ],
  "original": false,
  "cover": true
 },
 "P033": {
  "grades": [
   "○",
   "×",
   "×",
   "×",
   "◎",
   "×",
   "△"
  ],
  "original": false,
  "cover": true
 },
 "P034": {
  "grades": [
   "×",
   "○",
   "◎",
   "×",
   "×",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P035": {
  "grades": [
   "◎",
   "×",
   "×",
   "×",
   "×",
   "×",
   "○"
  ],
  "original": true,
  "cover": false
 },
 "P036": {
  "grades": [
   "◎",
   "△",
   "×",
   "×",
   "△",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P037": {
  "grades": [
   "×",
   "◎",
   "×",
   "×",
   "○",
   "×",
   "×"
  ],
  "original": true,
  "cover": true
 },
 "P038": {
  "grades": [
   "×",
   "○",
   "×",
   "×",
   "◎",
   "×",
   "×"
  ],
  "original": true,
  "cover": true
 },
 "P039": {
  "grades": [
   "◎",
   "○",
   "×",
   "×",
   "△",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P040": {
  "grades": [
   "△",
   "○",
   "×",
   "×",
   "△",
   "×",
   "◎"
  ],
  "original": true,
  "cover": true
 },
 "P041": {
  "grades": [
   "○",
   "×",
   "×",
   "×",
   "×",
   "×",
   "◎"
  ],
  "original": true,
  "cover": false
 },
 "P042": {
  "grades": [
   "◎",
   "○",
   "×",
   "×",
   "△",
   "×",
   "△"
  ],
  "original": true,
  "cover": true
 },
 "P043": {
  "grades": [
   "×",
   "○",
   "×",
   "×",
   "×",
   "×",
   "◎"
  ],
  "original": true,
  "cover": false
 },
 "P044": {
  "grades": [
   "×",
   "△",
   "×",
   "×",
   "◎",
   "×",
   "×"
  ],
  "original": true,
  "cover": true
 },
 "P045": {
  "grades": [
   "×",
   "×",
   "○",
   "◎",
   "×",
   "△",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P046": {
  "grades": [
   "◎",
   "×",
   "×",
   "×",
   "○",
   "×",
   "×"
  ],
  "original": true,
  "cover": true
 },
 "P047": {
  "grades": [
   "×",
   "×",
   "◎",
   "○",
   "×",
   "×",
   "×"
  ],
  "original": true,
  "cover": true
 },
 "P048": {
  "grades": [
   "△",
   "◎",
   "×",
   "×",
   "△",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P049": {
  "grades": [
   "×",
   "×",
   "×",
   "×",
   "◎",
   "×",
   "○"
  ],
  "original": true,
  "cover": true
 },
 "P050": {
  "grades": [
   "◎",
   "×",
   "×",
   "×",
   "×",
   "×",
   "○"
  ],
  "original": true,
  "cover": true
 },
 "P051": {
  "grades": [
   "◎",
   "○",
   "×",
   "×",
   "△",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P052": {
  "grades": [
   "×",
   "◎",
   "×",
   "×",
   "△",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P053": {
  "grades": [
   "×",
   "×",
   "◎",
   "○",
   "×",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P054": {
  "grades": [
   "×",
   "×",
   "○",
   "◎",
   "×",
   "△",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P055": {
  "grades": [
   "×",
   "×",
   "×",
   "×",
   "◎",
   "×",
   "○"
  ],
  "original": true,
  "cover": true
 },
 "P056": {
  "grades": [
   "×",
   "◎",
   "×",
   "×",
   "×",
   "×",
   "△"
  ],
  "original": false,
  "cover": true
 },
 "P057": {
  "grades": [
   "◎",
   "○",
   "×",
   "×",
   "△",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P058": {
  "grades": [
   "×",
   "○",
   "◎",
   "×",
   "×",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P059": {
  "grades": [
   "◎",
   "×",
   "×",
   "×",
   "×",
   "×",
   "○"
  ],
  "original": true,
  "cover": false
 },
 "P060": {
  "grades": [
   "△",
   "◎",
   "×",
   "×",
   "△",
   "×",
   "×"
  ],
  "original": true,
  "cover": true
 },
 "P061": {
  "grades": [
   "×",
   "×",
   "×",
   "×",
   "◎",
   "×",
   "○"
  ],
  "original": true,
  "cover": false
 },
 "P062": {
  "grades": [
   "×",
   "○",
   "×",
   "◎",
   "×",
   "×",
   "×"
  ],
  "original": true,
  "cover": true
 },
 "P063": {
  "grades": [
   "○",
   "△",
   "◎",
   "×",
   "×",
   "×",
   "△"
  ],
  "original": true,
  "cover": false
 },
 "P064": {
  "grades": [
   "×",
   "◎",
   "×",
   "×",
   "△",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P065": {
  "grades": [
   "◎",
   "×",
   "×",
   "×",
   "×",
   "×",
   "○"
  ],
  "original": true,
  "cover": false
 },
 "P066": {
  "grades": [
   "×",
   "△",
   "×",
   "×",
   "○",
   "◎",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P067": {
  "grades": [
   "×",
   "×",
   "×",
   "×",
   "◎",
   "×",
   "○"
  ],
  "original": false,
  "cover": true
 },
 "P068": {
  "grades": [
   "×",
   "△",
   "×",
   "◎",
   "×",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P069": {
  "grades": [
   "○",
   "△",
   "◎",
   "×",
   "×",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P070": {
  "grades": [
   "×",
   "◎",
   "×",
   "×",
   "○",
   "×",
   "△"
  ],
  "original": true,
  "cover": false
 },
 "P071": {
  "grades": [
   "◎",
   "×",
   "×",
   "×",
   "×",
   "×",
   "○"
  ],
  "original": false,
  "cover": true
 },
 "P072": {
  "grades": [
   "×",
   "△",
   "×",
   "×",
   "△",
   "◎",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P073": {
  "grades": [
   "◎",
   "×",
   "×",
   "×",
   "○",
   "×",
   "×"
  ],
  "original": true,
  "cover": true
 },
 "P074": {
  "grades": [
   "×",
   "◎",
   "×",
   "×",
   "×",
   "×",
   "○"
  ],
  "original": true,
  "cover": true
 },
 "P075": {
  "grades": [
   "○",
   "×",
   "×",
   "×",
   "◎",
   "×",
   "△"
  ],
  "original": false,
  "cover": true
 },
 "P076": {
  "grades": [
   "×",
   "△",
   "×",
   "×",
   "×",
   "◎",
   "×"
  ],
  "original": true,
  "cover": true
 },
 "P077": {
  "grades": [
   "◎",
   "×",
   "×",
   "×",
   "×",
   "×",
   "○"
  ],
  "original": true,
  "cover": false
 },
 "P078": {
  "grades": [
   "○",
   "◎",
   "×",
   "×",
   "△",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P079": {
  "grades": [
   "×",
   "○",
   "×",
   "×",
   "×",
   "×",
   "◎"
  ],
  "original": true,
  "cover": false
 },
 "P080": {
  "grades": [
   "△",
   "×",
   "×",
   "×",
   "×",
   "×",
   "◎"
  ],
  "original": false,
  "cover": true
 },
 "P081": {
  "grades": [
   "◎",
   "○",
   "×",
   "×",
   "△",
   "×",
   "×"
  ],
  "original": true,
  "cover": false
 },
 "P082": {
  "grades": [
   "×",
   "×",
   "×",
   "×",
   "◎",
   "×",
   "○"
  ],
  "original": true,
  "cover": true
 },
 "P083": {
  "grades": [
   "○",
   "×",
   "×",
   "×",
   "×",
   "×",
   "◎"
  ],
  "original": true,
  "cover": false
 },
 "P084": {
  "grades": [
   "×",
   "△",
   "×",
   "×",
   "△",
   "×",
   "◎"
  ],
  "original": true,
  "cover": true
 },
 "P085": {
  "grades": [
   "◎",
   "×",
   "×",
   "×",
   "○",
   "×",
   "×"
  ],
  "original": true,
  "cover": true
 },
 "P086": {
  "grades": [
   "×",
   "◎",
   "×",
   "×",
   "×",
   "×",
   "○"
  ],
  "original": true,
  "cover": true
 },
 "P087": {
  "grades": [
   "○",
   "△",
   "◎",
   "×",
   "×",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P088": {
  "grades": [
   "×",
   "×",
   "×",
   "◎",
   "×",
   "△",
   "×"
  ],
  "original": true,
  "cover": false
 },
 "P089": {
  "grades": [
   "×",
   "○",
   "×",
   "×",
   "◎",
   "×",
   "×"
  ],
  "original": true,
  "cover": true
 },
 "P090": {
  "grades": [
   "○",
   "◎",
   "×",
   "×",
   "△",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P091": {
  "grades": [
   "◎",
   "×",
   "×",
   "×",
   "○",
   "×",
   "△"
  ],
  "original": false,
  "cover": true
 },
 "P092": {
  "grades": [
   "×",
   "◎",
   "×",
   "×",
   "×",
   "×",
   "△"
  ],
  "original": false,
  "cover": true
 },
 "P093": {
  "grades": [
   "○",
   "×",
   "×",
   "×",
   "◎",
   "×",
   "△"
  ],
  "original": false,
  "cover": true
 },
 "P094": {
  "grades": [
   "×",
   "○",
   "◎",
   "×",
   "×",
   "×",
   "×"
  ],
  "original": false,
  "cover": true
 },
 "P095": {
  "grades": [
   "◎",
   "×",
   "×",
   "×",
   "×",
   "×",
   "○"
  ],
  "original": true,
  "cover": true
 },
 "P096": {
  "grades": [
   "×",
   "×",
   "△",
   "◎",
   "×",
   "△",
   "×"
  ],
  "original": false,
  "cover": true
 }
};
const map=Object.fromEntries(Object.entries(records).map(([id,r])=>[id,Object.freeze({id,skills:Object.freeze(Object.fromEntries(columns.map((k,i)=>[k,r.grades[i]]))),composition:Object.freeze({original:r.original,cover:r.cover})})]));
window.S6_BETA_MUSIC=Object.freeze({columns:Object.freeze(columns),people:Object.freeze(map)});
})();
