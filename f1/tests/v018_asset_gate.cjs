/* F1 v0.18 image-asset gate; run after Work commits assets.
 *
 *   node f1/tests/v018_asset_gate.cjs --phase=P1
 *   node f1/tests/v018_asset_gate.cjs --phase=ALL --strict
 *
 * Without --strict, missing files show WAITING (not PASS), exit 0.
 * With --strict, missing/invalid assets fail and exit nonzero.
 * Visual alignment must still be checked manually using P1 comparison images.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const scene=require(path.join(__dirname,'..','store_scene_v018.js'));
const phase=process.argv.includes('--phase=ALL')?'ALL':'P1';
const strict=process.argv.includes('--strict');
const assetsDir=path.join(__dirname,'..','assets');
const names=phase==='P1'?scene.P1_FILES:scene.FILES;

function webpDimensions(data){
 if(data.length<30||data.toString('ascii',0,4)!=='RIFF'
   ||data.toString('ascii',8,12)!=='WEBP')throw Error('Not a valid WebP RIFF header');
 const fourcc=data.toString('ascii',12,16);
 if(fourcc==='VP8X'){
  return [data.readUIntLE(24,3)+1,data.readUIntLE(27,3)+1];
 }
 if(fourcc==='VP8 '){
  if(data.length<30||data[23]!==0x9d||data[24]!==0x01||data[25]!==0x2a)
   throw Error('Unsupported VP8 frame header');
  return [data.readUInt16LE(26)&0x3fff,data.readUInt16LE(28)&0x3fff];
 }
 if(fourcc==='VP8L'){
  if(data[20]!==0x2f||data.length<25)throw Error('Bad VP8L signature');
  const b1=data[21],b2=data[22],b3=data[23],b4=data[24];
  return [1+b1+((b2&0x3f)<<8),1+(b2>>6)+(b3<<2)+((b4&0xf)<<10)];
 }
 throw Error('Unknown first WebP chunk '+fourcc);
}

const present=[],missing=[],problems=[],heavy=[];
for(const name of names){
 const filename=path.join(assetsDir,name);
 if(!fs.existsSync(filename)){missing.push(name);continue}
 try{
  const bytes=fs.readFileSync(filename);
  const [width,height]=webpDimensions(bytes);
  if(width!==1100||height!==619)problems.push(name+': '+width+'x'+height+' (expected 1100x619)');
  if(bytes.length>700*1024)problems.push(name+': size '+bytes.length+' bytes > 700 KiB');
  else if(bytes.length>350*1024)heavy.push(name+': '+bytes.length+' bytes');
  present.push(name);
 }catch(e){problems.push(name+': '+e.message)}
}
const report={
 phase,status:problems.length?'FAIL':missing.length?'WAITING':'PASS',
 planned:names.length,validFiles:present.length-problems.filter(x=>present.some(n=>x.startsWith(n+':'))).length,
 missing,problems,heavyWarnings:heavy,
 visualAlignment:'NOT_TESTED (requires P1 review)'
};
console.log(JSON.stringify(report,null,2));
if(problems.length||(strict&&missing.length))process.exitCode=1;
