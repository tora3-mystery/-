#!/usr/bin/env node
"use strict";
const fs=require("node:fs");
const path=require("node:path");
const root=__dirname;
const db=JSON.parse(fs.readFileSync(path.join(root,"people_appearance_v1.json"),"utf8"));
const rows=db.records||[];
let errors=[];
const fail=(id,msg)=>errors.push(id+": "+msg);
if(rows.length!==96)fail("DB","96 people required, got "+rows.length);
const seen=new Set();
const core=["stature","build","shoulders","face_shape","face_ratio","face_width","cheek_volume","jaw","eye_size","eye_shape","eye_spacing","nose_bridge","nose_width","mouth_width","lips","skin_tone","skin_texture","hair_color","hair_length","hair_texture","fringe","expression","camera_distance"];
for(let i=0;i<rows.length;i++){
 const r=rows[i],id="P"+String(i+1).padStart(3,"0");
 if(r.person_id!==id)fail(id,"missing/order mismatch");
 if(seen.has(r.person_id))fail(id,"duplicate");
 seen.add(r.person_id);
 if(i<16){if(r.design_status!=="画像維持・記録のみ")fail(id,"protected image status changed");continue;}
 for(const k of core)if(!r[k]||r[k]==="未設定")fail(id,"missing "+k);
 if(r.face_shape==="幅広の丸型"&&(r.face_width!=="広め"||r.face_ratio==="長め"))fail(id,"broad-round face conflict");
 if(r.face_shape==="面長"&&r.face_ratio!=="長め")fail(id,"long face ratio conflict");
 if(r.face_shape==="丸型"&&r.face_ratio==="長め")fail(id,"round face ratio conflict");
 if(r.build==="華奢"&&r.shoulders==="広め")fail(id,"slim broad shoulders needs review");
 if(r.build==="がっしり"&&r.shoulders==="狭め")fail(id,"sturdy narrow shoulders needs review");
}
console.log(errors.length?"FAIL "+errors.length:"PASS IDs=96, fixed=16, draft=80, consistency=PASS");
for(let msg of errors)console.error(msg);
if(errors.length)process.exitCode=1;
