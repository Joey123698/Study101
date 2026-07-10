/* ══════════════════════════════════════════════════════════════
   04-mastery-engine.js — v12.1 (Session-based revision)
   Core rule: Concept.mastery is NEVER set by hand. It is always DERIVED
   from the history of ConceptTouch entries (one per Session that touched
   that Concept, recording Understanding 1-5 + Confidence 1-5).

   v12.1 changes (per user's approved adjustments):
   1. EMA alpha + understanding/confidence weights are now CONFIGURABLE
      (data.masterySettings), not hard-coded — see DEFAULT_MASTERY_SETTINGS.
   2. Binary "Review Needed" replaced with a computed Review Priority
      (Low/Medium/High), derived from mastery + staleness + confidence +
      exam proximity — a continuous signal instead of an overwrite hack.
   3. Concept carries an optional `prerequisiteConceptIds` field — data
      model only, no UI yet (future feature, per user's request).
   ══════════════════════════════════════════════════════════════ */

/* ── Configurable defaults — live values come from data.masterySettings,
   these are only the fallback/seed values used by buildInit() and when a
   setting is missing after migration. ── */
const DEFAULT_MASTERY_SETTINGS={
  emaAlpha:0.4,               // how much a new touch shifts mastery (0-1, higher = more reactive)
  understandingWeight:0.7,    // weight of self-rated Understanding in each touch's composite score
  confidenceWeight:0.3,       // weight of self-rated Confidence in each touch's composite score
  staleDays:14,               // "haven't touched this Concept in N days" threshold
  examSoonDays:21,            // "exam is close" threshold
  // Review Priority composite weights (must conceptually sum to ~1, not strictly enforced)
  reviewW_mastery:0.35,       // lower mastery → higher priority
  reviewW_staleness:0.30,     // more days since last touch → higher priority
  reviewW_confidence:0.15,    // lower confidence → higher priority
  reviewW_examUrgency:0.20,   // closer exam → higher priority
};

function getMasterySettings(data){return{...DEFAULT_MASTERY_SETTINGS,...(data?.masterySettings||{})};}

/** Composite 0-100 score for a single touch, blending Understanding(1-5) + Confidence(1-5). */
function touchScore(touch,ms){
  const uw=ms.understandingWeight, cw=ms.confidenceWeight;
  const u=(touch.understanding||0)/5*100, c=(touch.confidence||0)/5*100;
  return u*uw+c*cw;
}

/**
 * Compute current mastery (0-100) for a Concept from its touch history.
 * touches: [{understanding,confidence,timestamp,sessionId}] — any order.
 * Uses EMA: mastery_new = mastery_old + alpha * (touchScore_new - mastery_old)
 */
function calcMastery(touches,masterySettingsOrData){
  const ms=masterySettingsOrData?.emaAlpha!==undefined?masterySettingsOrData:getMasterySettings(masterySettingsOrData);
  if(!touches||touches.length===0)return 0;
  const sorted=[...touches].sort((a,b)=>a.timestamp-b.timestamp);
  let m=touchScore(sorted[0],ms);
  for(let i=1;i<sorted.length;i++){m=m+ms.emaAlpha*(touchScore(sorted[i],ms)-m);}
  return Math.round(Math.max(0,Math.min(100,m)));
}

/**
 * v13: Progress for a Concept — branches by Concept "mode", inferred from the
 * optional `targetTouches` field (undefined for every existing Concept, so
 * this is 100% backward-compatible: nothing changes for Micro/Macro unless
 * you explicitly set it).
 *
 * - Knowledge Concept (targetTouches unset, the default — e.g. Micro/Macro):
 *   unchanged EMA calcMastery. Repetition converges toward true understanding.
 * - Task Concept (targetTouches set, e.g. IPE "Thuyết trình" needing 3
 *   Sessions): progress = touches.length / targetTouches. Finishing 1 of 3
 *   required Sessions with full confidence no longer wrongly shows ~100% —
 *   "how confident I felt" and "how much of the task is done" are different
 *   numbers, and conflating them was the actual bug being fixed here.
 *
 * Always returns 0-100, same contract as calcMastery, so every existing
 * caller (Review Priority, chapter/phase/course progress rollups, the
 * Decision Engine) keeps working without any other change.
 */
function calcProgress(concept,masterySettingsOrData){
  const touches=concept.touches||[];
  if(concept.targetTouches>0)return Math.round(Math.min(100,(touches.length/concept.targetTouches)*100));
  const ms=masterySettingsOrData?.emaAlpha!==undefined?masterySettingsOrData:getMasterySettings(masterySettingsOrData);
  return calcMastery(touches,ms);
}

/** Latest self-rated confidence (1-5) — NOT smoothed, always the most recent touch's value. */
function latestConfidence(touches){
  if(!touches||touches.length===0)return 0;
  const sorted=[...touches].sort((a,b)=>b.timestamp-a.timestamp);
  return sorted[0].confidence||0;
}
/** Latest self-rated understanding (1-5) — companion to latestConfidence, same "unsmoothed" rule. */
function latestUnderstanding(touches){
  if(!touches||touches.length===0)return 0;
  const sorted=[...touches].sort((a,b)=>b.timestamp-a.timestamp);
  return sorted[0].understanding||0;
}

/** Days since the Concept was last touched. Returns null if never touched. */
function daysSinceLastTouch(touches){
  if(!touches||touches.length===0)return null;
  const latest=Math.max(...touches.map(t=>t.timestamp));
  return Math.floor((Date.now()-latest)/86400000);
}

/* ── Status: purely about learning stage, no longer carries urgency (that's Review Priority's job). ── */
const STATUS_META={
  'Not Started':{emoji:'⚪',color:'var(--dm)',label:'Chưa bắt đầu'},
  'Learning':{emoji:'🌱',color:'var(--in)',label:'Đang học'},
  'Familiar':{emoji:'🙂',color:'var(--wa)',label:'Quen thuộc'},
  'Comfortable':{emoji:'💪',color:'#4FA3FF',label:'Thoải mái'},
  'Mastered':{emoji:'✅',color:'var(--su)',label:'Đã thành thạo'},
};
function deriveConceptStatus(concept,examDate,data){
  const touches=concept.touches||[];
  if(touches.length===0)return 'Not Started';
  const mastery=calcProgress(concept,data);
  if(mastery<40)return 'Learning';
  if(mastery<65)return 'Familiar';
  if(mastery<=85)return 'Comfortable';
  return 'Mastered';
}

/* ── Review Priority: continuous composite score → Low/Medium/High bucket.
   Replaces the old binary "Review Needed" overwrite. Orthogonal to Status:
   Status = "what stage am I at", Review Priority = "how urgently should I
   revisit this right now". A Concept can be Mastered AND High priority
   (e.g. mastered long ago, exam is in 3 days, never touched since). ── */
const REVIEW_PRIORITY_META={
  'None':{emoji:'',color:'var(--dm)',label:''},
  'Low':{emoji:'🟢',color:'var(--su)',label:'Ưu tiên thấp'},
  'Medium':{emoji:'🟡',color:'var(--wa)',label:'Nên ôn lại'},
  'High':{emoji:'🔴',color:'var(--cr)',label:'Cần ôn gấp'},
};
function computeReviewPriority(concept,examDate,data){
  const touches=concept.touches||[];
  if(touches.length===0)return 'None'; // nothing to "review" yet — it's Not Started, a different concern
  const ms=getMasterySettings(data);
  const mastery=calcProgress(concept,data);
  const stale=daysSinceLastTouch(touches);
  const conf=latestConfidence(touches);

  const masteryUrgency=100-mastery; // lower mastery → more urgent
  const stalenessUrgency=Math.min(100,(stale/30)*100); // caps at 30 days = fully urgent
  const confidenceUrgency=100-(conf/5*100); // lower confidence → more urgent
  const daysToExam=examDate?Math.ceil((new Date(examDate)-new Date())/86400000):null;
  const examUrgency=(daysToExam===null||daysToExam<0)?0:Math.max(0,100-(daysToExam/60*100));

  const score=
    masteryUrgency*ms.reviewW_mastery+
    stalenessUrgency*ms.reviewW_staleness+
    confidenceUrgency*ms.reviewW_confidence+
    examUrgency*ms.reviewW_examUrgency;

  if(score>=65)return 'High';
  if(score>=35)return 'Medium';
  return 'Low';
}

/** Chapter progress = average mastery of its Concepts (0 if no concepts). */
function chapterProgress(chapter,allConcepts,data){
  const cs=allConcepts.filter(c=>c.chapterId===chapter.id);
  if(cs.length===0)return 0;
  return Math.round(cs.reduce((s,c)=>s+calcProgress(c,data),0)/cs.length);
}

/** Phase (course-level) progress = average of its Chapters' progress. */
function phaseProgress(phase,allChapters,allConcepts,data){
  const chs=allChapters.filter(ch=>ch.phaseId===phase.id||ch.coursePhaseId===phase.id);
  if(chs.length===0)return 0;
  return Math.round(chs.reduce((s,ch)=>s+chapterProgress(ch,allConcepts,data),0)/chs.length);
}

/** Course-wide progress = average of all its Phases' progress. */
function courseProgress(course,data){
  const phases=course.coursePhases||[];
  const chapters=course.chapters||[];
  const concepts=course.concepts||[];
  if(phases.length===0)return 0;
  return Math.round(phases.reduce((s,p)=>s+phaseProgress(p,chapters,concepts,data),0)/phases.length);
}

/** Concepts needing urgent review — used for Dashboard/Course badges + future Analytics. */
function weakConcepts(course,data){
  const concepts=course.concepts||[];
  return concepts.filter(c=>computeReviewPriority(c,course.examDate,data)==='High');
}

/** Emoji quick-touch scale — NOT used directly for scoring anymore (Understanding+Confidence
   sliders replace the old single-score emoji picker), kept only as a friendly reference scale
   if a future UI wants a quick emoji shorthand for Understanding. */
const QUICK_EVAL_SCALE=[
  {emoji:'😵‍💫',value:1,label:'Rối quá'},
  {emoji:'😐',value:2,label:'Còn mơ hồ'},
  {emoji:'🙂',value:3,label:'Hiểu cơ bản'},
  {emoji:'💪',value:4,label:'Tự tin'},
  {emoji:'🤩',value:5,label:'Nắm chắc'},
];
