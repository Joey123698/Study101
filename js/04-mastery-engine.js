/* ══════════════════════════════════════════════════════════════
   04-mastery-engine.js — NEW in v12
   Core rule (agreed with user): Concept.mastery is NEVER set by hand.
   It is always DERIVED from the history of ConceptEval entries
   (one entry per Study Session that touched that Concept).
   This file is the single source of truth for that derivation,
   so Dashboard / Course Detail / Analytics all agree with each other.
   ══════════════════════════════════════════════════════════════ */

const MASTERY_ALPHA_DEFAULT=0.4; // EMA smoothing factor — configurable in Settings later
const STALE_DAYS=14;             // "haven't touched this Concept in N days" threshold
const EXAM_SOON_DAYS=21;         // "exam is close" threshold — combined with STALE_DAYS triggers Review Needed

/**
 * Compute current mastery (0-100) for a Concept from its eval history.
 * evals: [{score, confidence, timestamp}] — any order; sorted internally by timestamp asc.
 * Uses EMA: mastery_new = mastery_old + alpha * (score_new - mastery_old)
 * First eval sets mastery directly (no prior baseline to blend against).
 */
function calcMastery(evals,alpha=MASTERY_ALPHA_DEFAULT){
  if(!evals||evals.length===0)return 0;
  const sorted=[...evals].sort((a,b)=>a.timestamp-b.timestamp);
  let m=sorted[0].score;
  for(let i=1;i<sorted.length;i++){m=m+alpha*(sorted[i].score-m);}
  return Math.round(Math.max(0,Math.min(100,m)));
}

/** Latest self-rated confidence (1-5 stars) — NOT smoothed, always the most recent value. */
function latestConfidence(evals){
  if(!evals||evals.length===0)return 0;
  const sorted=[...evals].sort((a,b)=>b.timestamp-a.timestamp);
  return sorted[0].confidence||0;
}

/** Days since the Concept was last touched by any eval. Returns null if never touched. */
function daysSinceLastTouch(evals){
  if(!evals||evals.length===0)return null;
  const latest=Math.max(...evals.map(e=>e.timestamp));
  return Math.floor((Date.now()-latest)/86400000);
}

/**
 * Derive display status for a Concept.
 * Base thresholds on mastery, but overridden to "Review Needed" if the Concept
 * has gone stale AND the course's exam is coming up soon — this is the
 * "82% mastery but Review Needed" case the user specifically asked for.
 */
function deriveConceptStatus(concept,examDate){
  const evals=concept.evals||[];
  if(evals.length===0)return 'Not Started';
  const mastery=calcMastery(evals);
  const stale=daysSinceLastTouch(evals);
  const daysToExam=examDate?Math.ceil((new Date(examDate)-new Date())/86400000):null;
  const examSoon=daysToExam!==null&&daysToExam>=0&&daysToExam<=EXAM_SOON_DAYS;
  if(stale!==null&&stale>STALE_DAYS&&examSoon)return 'Review Needed';
  if(mastery<30)return 'Learning';
  if(mastery<=70)return 'Practicing';
  return 'Mastered';
}

const STATUS_META={
  'Not Started':{emoji:'⚪',color:'var(--dm)',label:'Chưa bắt đầu'},
  'Learning':{emoji:'🌱',color:'var(--in)',label:'Đang học'},
  'Practicing':{emoji:'💪',color:'var(--wa)',label:'Đang luyện'},
  'Mastered':{emoji:'✅',color:'var(--su)',label:'Đã thành thạo'},
  'Review Needed':{emoji:'🔁',color:'var(--cr)',label:'Cần ôn lại'},
};

/** Chapter progress = average mastery of its Concepts (0 if no concepts). */
function chapterProgress(chapter,allConcepts){
  const cs=allConcepts.filter(c=>c.chapterId===chapter.id);
  if(cs.length===0)return 0;
  return Math.round(cs.reduce((s,c)=>s+calcMastery(c.evals||[]),0)/cs.length);
}

/** Phase (course-level) progress = average of its Chapters' progress. */
function phaseProgress(phase,allChapters,allConcepts){
  const chs=allChapters.filter(ch=>ch.phaseId===phase.id);
  if(chs.length===0)return 0;
  return Math.round(chs.reduce((s,ch)=>s+chapterProgress(ch,allConcepts),0)/chs.length);
}

/** Course-wide progress = average of all its Phases' progress. */
function courseProgress(course){
  const phases=course.coursePhases||[];
  const chapters=course.chapters||[];
  const concepts=course.concepts||[];
  if(phases.length===0)return 0;
  return Math.round(phases.reduce((s,p)=>s+phaseProgress(p,chapters,concepts),0)/phases.length);
}

/** Find concepts in a course that are stale AND exam is close — used for "Weak Concepts" analytics + Review Needed badge counts. */
function weakConcepts(course){
  const concepts=course.concepts||[];
  return concepts.filter(c=>deriveConceptStatus(c,course.examDate)==='Review Needed');
}

/** Emoji quick-eval scale used by the "Ghi nhanh" ADHD-friendly flow. Maps emoji tap -> 0-100 score. */
const QUICK_EVAL_SCALE=[
  {emoji:'😵‍💫',score:15,label:'Rối quá'},
  {emoji:'😐',score:40,label:'Còn mơ hồ'},
  {emoji:'🙂',score:65,label:'Hiểu cơ bản'},
  {emoji:'💪',score:85,label:'Tự tin'},
  {emoji:'🤩',score:98,label:'Nắm chắc'},
];
