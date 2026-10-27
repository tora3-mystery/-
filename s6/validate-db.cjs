'use strict';
/**
 * S6 database audit. Execute: node s6/validate-db.cjs
 * Reads the committed game-data.js without evaluating it.
 */
const fs = require('node:fs');
const path = require('node:path');
const file = path.join(__dirname, 'game-data.js');
const source = fs.readFileSync(file, 'utf8');
const match = source.match(/^window\.S6_DATA\s*=\s*([\s\S]+?)\s*;\s*$/);
if (!match) throw new Error('Unexpected game-data.js format');
const D = JSON.parse(match[1]);
const errors = [];
const check = (ok, why) => { if (!ok) errors.push(why); };
const unique = (items, key, label) => {
  const values = items.map(item => item[key]);
  check(values.length === new Set(values).size, 'Duplicate ' + label + ' ' + key);
  return new Set(values);
};
const persons = unique(D.people, 'person_id', 'person');
const groups = new Map(D.groups.map(g => [g.group_id, g]));
const events = new Map(D.events.map(e => [e.event_id, e]));
const profiles = unique(D.socialProfiles, 'person_id', 'social profile');
const memberPairs = new Set(D.members.map(x => x.group_id + '|' + x.person_id));
const accountPairs = new Set(D.accounts.map(x => x.person_id + '|' + x.platform));
const validFactIds = new Set(D.facts.map(x => x.fact_id));
const expected = {people:96,socialProfiles:96,orgs:6,events:12,groups:44,members:125,lines:132,questions:88,actions:44,posts:24};
for (const [key, count] of Object.entries(expected)) check(D[key].length === count, key + ' expected ' + count + ', found ' + D[key].length);
check(persons.size === profiles.size, 'Each person must have one profile');
check(groups.size === D.groups.length, 'Duplicate group ID');
check(events.size === D.events.length, 'Duplicate event ID');
const hooks = [];
for (const p of D.people) {
  const suffix = p.person_id.match(/^P(\d{3})$/)?.[1];
  check(suffix && Number(suffix) >= 1 && Number(suffix) <= 96, 'Invalid person ID: ' + p.person_id);
  check(profiles.has(p.person_id), 'Missing profile: ' + p.person_id);
  check(p.portrait_path === 'assets/faces/p' + suffix + '.webp', 'Portrait mismatch ' + p.person_id);
  check(p.portrait_status === 'ready', 'Portrait not ready ' + p.person_id);
}
for (const p of D.socialProfiles) {
  check(persons.has(p.person_id), 'Orphan profile ' + p.person_id);
  check(typeof p.first_hook === 'string' && p.first_hook.length >= 10, 'Invalid first hook ' + p.person_id);
  check(Number.isInteger(p.intro_min_affinity) && p.intro_min_affinity >= 0 && p.intro_min_affinity <= 2, 'Invalid intro threshold ' + p.person_id);
  hooks.push(p.first_hook);
}
check(new Set(hooks).size === hooks.length, 'Duplicate conversation hooks');
for (const g of D.groups) check(events.has(g.event_id), 'Orphan group ' + g.group_id);
for (const m of D.members) {
  check(persons.has(m.person_id), 'Orphan member person ' + m.person_id);
  check(groups.has(m.group_id) && groups.get(m.group_id)?.event_id === m.event_id, 'Member event mismatch ' + m.group_id);
  check(!m.visual_description.includes('顔素材は未制作'), 'Stale face metadata ' + m.person_id);
}
for (const line of D.lines) {
  check(memberPairs.has(line.group_id + '|' + line.speaker_id), 'Orphan speaker ' + line.group_id);
  if (line.order === '1') check(line.introduced_effect === 'none', 'Automatic introduction ' + line.group_id);
}
for (const q of D.questions) {
  check(memberPairs.has(q.group_id + '|' + q.target_id), 'Question target not present ' + q.group_id);
  const p = D.people.find(x => x.person_id === q.target_id);
  if (p && q.question !== '自己紹介してもらってもいい？') check(!q.answer.includes(p.name), 'Unexpected name in answer ' + q.group_id + ' ' + q.target_id);
}
for (const a of D.actions) check(groups.has(a.group_id), 'Orphan group action ' + a.group_id);
for (const c of D.contactChannels) {
  check(memberPairs.has(c.group_id + '|' + c.person_id), 'Orphan contact ' + c.group_id + ' ' + c.person_id);
  check(accountPairs.has(c.person_id + '|' + c.platform), 'Missing account for contact ' + c.person_id);
}
for (const x of D.reunions) check(memberPairs.has(x.group_id + '|' + x.person_id), 'Orphan reunion ' + x.group_id);
for (const x of D.posts) check(persons.has(x.author_id), 'Orphan post author ' + x.post_id);
for (const x of D.marks) {
  check(persons.has(x.person_id), 'Orphan mark person ' + x.mark_rule_id);
  check(validFactIds.has(x.trigger_fact_id), 'Orphan mark fact ' + x.mark_rule_id);
}
// Four classmates independently pursue music interests, even if the player never meets them.
const peerIds = new Set(['P013','P014','P015','P016']);
check(D.peerProgress?.length === 4, 'Expected four independent student timelines');
const peerProfiles = unique(D.peerProgress || [], 'person_id', 'peer progress');
for (const peer of D.peerProgress || []) {
  check(peerIds.has(peer.person_id) && persons.has(peer.person_id), 'Unknown peer ' + peer.person_id);
  check(Array.isArray(peer.daily_messages) && peer.daily_messages.length === 5, 'Incomplete weekday messages ' + peer.person_id);
  for (const [i,msg] of (peer.daily_messages||[]).entries()) check(typeof msg === 'string' && msg.length >= 10, 'Invalid peer message ' + peer.person_id + ':' + i);
  for (const field of ['met_memory','contact_memory','reply_memory']) check(typeof peer[field] === 'string' && peer[field].length >= 10, 'Missing peer epilogue ' + peer.person_id + ':' + field);
}
for (const peer of peerIds) check(peerProfiles.has(peer), 'Missing peer arc ' + peer);
for (const rule of D.contactChannels) if ('min_affinity' in rule)
  check(Number.isInteger(rule.min_affinity) && rule.min_affinity >= 0 && rule.min_affinity <= 8, 'Invalid contact affinity ' + rule.person_id);
// Evidence photograph assets are separate from the 96 portrait photos; G01-G08 are not expected to be ready.
const overview = {
  version: D.version,
  people: D.people.length, profiles: D.socialProfiles.length,
  firstHookUnique: new Set(hooks).size,
  customReunions: D.socialProfiles.filter(x => x.reunion_hook).length, peerProgress: (D.peerProgress||[]).length,
  groups: D.groups.length, members: D.members.length,
  lines: D.lines.length, questions: D.questions.length,
  contactChannels: D.contactChannels.length, errors: errors.length
};
console.log(JSON.stringify(overview));
if (errors.length) {
  for (const reason of errors) console.error('ERROR:', reason);
  process.exitCode = 1;
}
