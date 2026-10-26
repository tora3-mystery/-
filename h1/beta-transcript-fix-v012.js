"use strict";
/* H1 β0.1.2 | The private interview transcript must reproduce the question
   the player actually selected, not the fixed question for the same topic.
   Includes dossiers, BAD history, and GOOD end-credit replay records.
 */
function h112SavedQuestion(person,entry){
 if(!entry)return "";
 return typeof entry.question==="string"&&entry.question.trim()
  ?entry.question : privateQuestions[person][entry.option].q;
}
recordMarkup=function(person){
 const entry=privateEntry(person),applicant=esc(people[person].name);
 if(!entry)return '<div class="transcript-sheet"><div class="record-label">INTERVIEW RECORD <span>未実施</span></div><p>この応募者への個人面接はまだ実施されていません。</p></div>';
 const question=h112SavedQuestion(person,entry);
 return '<div class="transcript-sheet"><div class="record-label">INTERVIEW RECORD <span>自動文字起こし／非公開</span></div><h3>'+applicant+'｜個人面接</h3>'+
  '<div class="spoken interviewer"><b>面接官</b><p>'+esc(question)+'</p></div>'+
  '<div class="spoken applicant"><b>'+applicant+'</b><p>'+esc(entry.answer)+'</p></div></div>';
};
function h112CorrectQuestionHistory(html){
 let result=html;
 for(let person=0;person<4;person++){
  const entry=state.privateAnswers[person];
  if(!entry)continue;
  const old=esc(privateQuestions[person][entry.option].q);
  const actual=esc(h112SavedQuestion(person,entry));
  if(old!==actual)result=result.replace(old,actual);
 }
 return result;
}
const h112PreviousFullRecord=h1FullRecord;
h1FullRecord=function(){return h112CorrectQuestionHistory(h112PreviousFullRecord());};
const h112PreviousGood=H1UX.good;
H1UX.good=function(){
 h112PreviousGood.call(this);
 if((state.goodStep||0)!==2)return;
 // This details element is inserted by the α ending's historic-replay extension.
 // Updating its content in place preserves the ending button's click handler.
 const record=el("main")?.querySelector?.("details.h1-full-record");
 if(record)record.innerHTML=h112CorrectQuestionHistory(record.innerHTML);
};
// In case a future ending uses an inline current-record excerpt, the same
// invariant is provided as a pure check for automated regression QA.
function h112VerifyPrivateTranscript(person){
 const entry=state.privateAnswers[person];
 if(!entry)return true;
 const html=recordMarkup(person);
 return html.includes(esc(entry.question))&&html.includes(esc(entry.answer));
}
