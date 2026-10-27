import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CAMPUS_BACKGROUNDS,CLUBS,TEMPERAMENTS,PREVIOUS_DEPARTMENTS,PROFILE_TYPES,ENDING_META,VERSION,createProfile,createRun,calculate,isValidSave,ensureLocalPortrait} from '../engine.mjs';

const events=JSON.parse(readFileSync(new URL('../events.json',import.meta.url),'utf8')).events;
assert.equal(events.length,15);
assert.equal(events.reduce((n,e)=>n+1+(e.alternates?.length||0),0),23);
assert.equal(events.reduce((n,e)=>n+e.choices.length+(e.alternates||[]).reduce((m,v)=>m+v.choices.length,0),0),138);
assert.equal(Object.keys(ENDING_META).length,18);
assert.equal(PROFILE_TYPES.length,12);
assert.equal(CAMPUS_BACKGROUNDS.length,24);
assert.equal(CLUBS.length,20);
assert.equal(TEMPERAMENTS.length,15);
assert.equal(PREVIOUS_DEPARTMENTS.length,10);

let seed=20261026;
const rng=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
const seen={types:new Set(),campus:new Set(),clubs:new Set(),temperaments:new Set(),previous:new Set(),hobbies:new Set(),names:new Set()};
const generated=[];
for(let i=0;i<24000;i++){
  const p=createProfile(rng),type=PROFILE_TYPES.find(t=>t.id===p.typeId);
  assert(type,`unknown archetype ${p.typeId}`);
  assert.equal(p.typeName,type.name);
  assert.deepEqual([p.check,p.medium,p.feedback,p.strength,p.career],type.traits);
  assert(type.campus.some(index=>CAMPUS_BACKGROUNDS[index][0]===p.university&&CAMPUS_BACKGROUNDS[index][1]===p.faculty));
  assert(type.clubs.some(index=>CLUBS[index][0]===p.club));
  assert(type.temperaments.some(index=>TEMPERAMENTS[index][0]===p.temperament));
  assert(type.hobbies.includes(p.hobby));
  assert.equal(p.workHabit,type.habit);
  assert.equal(p.weakness,type.weakness);
  assert(p.episode.includes(p.grade===1?'配属前研修の':'前部署での'));
  assert.equal(p.age,21+p.grade);
  if(p.grade===1)assert.equal(p.previous,'新卒配属');
  else assert(type.previous.some(index=>PREVIOUS_DEPARTMENTS[index]===p.previous));
  assert.equal(p.speech.length,3);
  assert(['convivial','quiet','flexible'].includes(p.socialStyle));
  assert(p.socialVoice&&p.ambition&&p.skill&&p.photo);
  for(const key of ['hobby','workHabit','weakness','episode'])assert(p[key].length>=2);
  seen.types.add(p.typeId);seen.campus.add(`${p.university}/${p.faculty}`);seen.clubs.add(p.club);
  seen.temperaments.add(p.temperament);seen.previous.add(p.previous);seen.hobbies.add(p.hobby);seen.names.add(p.name);
  if(i<12)generated.push(p);
}
assert.equal(seen.types.size,12);assert.equal(seen.campus.size,24);assert.equal(seen.clubs.size,20);
assert.equal(seen.temperaments.size,15);assert.equal(seen.previous.size,11);assert(seen.hobbies.size>=20);

const oldVersions=['0.4.0','0.4.1','0.5.0','0.5.1','0.5.2','0.5.3','0.5.4','0.5.5','0.5.6','0.5.7','0.5.8','0.5.9','0.6.0','0.6.1','0.6.2','0.6.3','0.6.4','0.6.5','0.6.6'];
const legacyProfile={name:'佐藤 花音',gender:'女性',grade:2,previous:'法人営業部',department:'営業企画部',check:'guided',medium:'written',feedback:'batched',strength:'analysis',career:'expert',speech:['途中で確認したいです。'],ambition:'専門性を深めたいです。',skill:'数字の確認が得意です。',photo:'https://old.example.invalid/portrait.jpg'};
for(const version of oldVersions){
  const saved={...createRun(structuredClone(legacyProfile)),version,index:4,phase:'scene',logs:[],flags:{},cp:3};
  assert(isValidSave(saved,events),`legacy save ${version}`);
  const restored=structuredClone(saved),prior=structuredClone(restored.profile);
  ensureLocalPortrait(restored.profile);
  assert.equal(restored.profile.name,prior.name);
  assert.equal(restored.profile.career,prior.career);
  assert(restored.profile.photo.startsWith('./assets/'));
  assert.equal(restored.index,4);
}
assert(isValidSave({...createRun(generated[0]),index:0,phase:'briefing'},events));
assert.equal(VERSION,'1.0');

let scoreChecks=0;
for(const p of generated){
  const plain=structuredClone(p);
  for(const key of ['typeId','typeName','hobby','workHabit','weakness','episode'])delete plain[key];
  for(const event of events){
    for(const scene of [event,...(event.alternates||[])]){
      for(const choice of scene.choices){
        const run={...createRun(p),phase:'scene',index:events.indexOf(event),currentId:event.id,flags:{checkAgreed:false,aiUnverified:false,aiVerified:false,presentationPrepped:false}};
        const baseline={...run,profile:plain};
        const a=calculate(run,event,choice,'normal'),b=calculate(baseline,event,choice,'normal');
        assert.deepEqual([a.cp,a.progress,a.growth,a.pending.baseCp,a.pending.fitAdjustment,a.ending],[b.cp,b.progress,b.growth,b.pending.baseCp,b.pending.fitAdjustment,b.ending]);
        scoreChecks++;
      }
    }
  }
}
console.log(`PASS C1 v1.0: 24,000 profiles, 12 types, 24 campuses, 20 clubs, 15 temperaments, 10 prior departments; ${oldVersions.length} old save versions; ${scoreChecks} unchanged scoring comparisons; 15 jobs / 23 scenarios / 138 choices / 18 endings.`);
