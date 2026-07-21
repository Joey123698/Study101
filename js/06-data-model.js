/* ══════════════════════════════════════════════════════════════
   06-data-model.js — buildInit() + full migration chain
   ══════════════════════════════════════════════════════════════
   V12 → V12.1 ARCHITECTURE — Knowledge-based, Session-centered.

   v12.1 revision (per user's approved spec): Concept is knowledge,
   SESSION is the learning unit. A Concept can appear in many Sessions.

   Naming: the OLD semester-wide "Phase" is `uniPhases` / "Uni Phase".
   The per-course structural unit is `course.coursePhases` ("Phase").

   Per-course entities:
     course.coursePhases: [{id,title,startDate,endDate,order}]
     course.chapters:     [{id,coursePhaseId,title}]
     course.concepts:     [{id,chapterId,title,touches:[],objectiveIds:[],
                             prerequisiteConceptIds:[],  ← data model only, no UI yet
                             legacyDueDate,legacySubtasks}]
     course.concepts[].touches: [{understanding:1-5,confidence:1-5,timestamp,sessionId}]
       — replaces old single-score `evals[]`. Mastery is derived from this
         history via configurable EMA — see 04-mastery-engine.js.
     course.sessions: [{id,title,estimatedDuration,objectives:[],conceptIds:[],
                         resources:[],customTodos:[],status}]
       — Session blueprint (what a study session SHOULD cover). status is a
         lifecycle: 'draft'|'planned'|'in_progress'|'completed'|'reviewed'.
     course.sessions[].objectives: [{id,text,description,expectedOutcome,
                         conceptIds:[],estimatedTime,assessmentCriteria}]
       — Learning Objectives now live INSIDE Session (moved from course-level).
     course.legacyLearningObjectives: [{id,text}]  ← preserved, inert (old
         course-level objectives from before this move)
     course.attendance: {}   ← UNCHANGED, deliberately kept separate from
                                 Session (classroom attendance vs. self-study)

   Global entities:
     data.journalEntries: [{id,date,courseId,sessionId,duration,reflection,
                             questionsRaised,actionItems:[{id,text,done}],
                             confidenceAfter,difficulty,notes,
                             conceptTouches:[{conceptId,understanding,confidence}],
                             checklist:[{id,text,done}],status}]
       — ONE entry per Session Instance (execution). Renamed from the
         earlier studyPlans/studySessions placeholder shape (never had UI,
         safe rename). Analytics reads from here, never from manual %.
     data.masterySettings: emaAlpha, understandingWeight, confidenceWeight,
         staleDays, examSoonDays, reviewW_* — all configurable (Settings UI),
         see DEFAULT_MASTERY_SETTINGS in 04-mastery-engine.js.

   Legacy fields are NEVER destroyed — old topics/tasks/evals/learningObjectives
   survive renamed with a `legacy`/`legacyX` prefix, kept inert.
   ══════════════════════════════════════════════════════════════ */

const CAT_META=[['grammar','📖','Ngữ pháp','Điểm ngữ pháp mới...'],['vocabulary','📝','Từ vựng','(xem block riêng bên dưới)'],['speaking','🗣️','Nói','Topic đã luyện nói...'],['writing','✍️','Viết','Bài viết / essay...']];
const CEFR_LEVELS=['A1','A2','B1','B2','C1'];
const CEFR_VOCAB={A1:500,A2:1000,B1:2000,B2:4000,C1:8000};
const GRADE_BANDS=[{max:1.5,label:'Sehr gut (Xuất sắc)',color:'#1D9E75'},{max:2.5,label:'Gut (Giỏi)',color:'#378ADD'},{max:3.5,label:'Befriedigend (Khá)',color:'#BA7517'},{max:4.0,label:'Ausreichend (Đạt)',color:'#E08F1A'},{max:6.0,label:'Nicht ausreichend',color:'#E24B4A'}];
function gradeBand(g){if(g==null)return null;return GRADE_BANDS.find(b=>g<=b.max)||GRADE_BANDS[GRADE_BANDS.length-1];}
function defCats(){return{grammar:{items:[]},vocabulary:{total:0,weeklyGoal:50,log:{}},speaking:{items:[]},writing:{items:[]}};}

/* ── Pre-v12 migration chain (kept intact from earlier versions) ── */
function migrateToV5(d){if(!d)return d;if(d.languages)d.languages=d.languages.map(l=>{if(!l.categories)l={...l,categories:defCats()};return l;});if(d.courses)d.courses=d.courses.map(c=>({...c,topics:(c.topics||[]).map(t=>t.subtasks?t:{...t,subtasks:[]})}));return d;}
function migrateToV6(d){
  if(!d)return d;
  d=migrateToV5(d);
  if(d.courses)d.courses=d.courses.map(c=>({
    ...c,archived:c.archived??false,ects:c.ects??6,grade:c.grade??null,notes:c.notes||[],
    tasks:(c.tasks||[]).map(t=>({...t,dueDate:t.dueDate??'',dueTime:t.dueTime??''}))
  }));
  if(d.languages)d.languages=d.languages.map(l=>{
    const cats=l.categories||defCats();
    const g=cats.grammar||{items:[]};
    const grammar={items:(g.items||[]).map(it=>({...it,level:it.level??''}))};
    let vocab=cats.vocabulary;
    if(!vocab||vocab.total===undefined){const oldCount=vocab?.count||0;vocab={total:oldCount,weeklyGoal:vocab?.weeklyGoal||50,log:{}};}
    const w=cats.writing||{items:[]};
    const writing={items:(w.items||[]).map(it=>({...it,link:it.link??''}))};
    return{...l,categories:{...cats,grammar,vocabulary:vocab,writing,speaking:cats.speaking||{items:[]}}};
  });
  if(!d.timerCategories)d.timerCategories=[];
  if(!d.settings)d.settings={theme:'purple',radius:'rounded',fontFamily:'system',bannerUrl:'',userName:''};
  if(!d.settings.fontFamily)d.settings.fontFamily='system';
  if(!d.settings.bannerUrl)d.settings.bannerUrl='';
  if(!d.dailyFocus){
    d.dailyFocus={};
    if(d.todayFocus){const old=d.todayFocus;d.dailyFocus[old.date||TODAY]={mustDo:{text:old.mustDo||'',done:false},top3:(old.top3||[]).map((t,i)=>({id:'t'+(i+1),text:t||'',done:false}))};}
    delete d.todayFocus;
  }
  if(d.courses)d.courses=d.courses.map(c=>{
    const updated={...c};
    if(!updated.instructor)updated.instructor='';
    if(!updated.contact)updated.contact='';
    if(!updated.location)updated.location='';
    if(!updated.sections){const secNames=[...new Set((c.topics||[]).map(t=>t.sec).filter(Boolean))];updated.sections=secNames.map((name,i)=>({id:'s'+(i+1),name}));}
    return updated;
  });
  if(d.phases)d.phases=d.phases.map(p=>({...p,goals:p.goals.map(g=>g.id==='g1'&&g.linkedTo==='course_completion'?{...g,type:'gpa',linkedTo:'gpa_auto'}:g)}));
  if(!d.parkingTasks){d.parkingTasks=(d.parkingLot||[]).map(p=>({...p,category:'Khác',deadline:'',done:false}));}
  if(!d.parkingNotes)d.parkingNotes=[];
  if(!d.parkingCategories)d.parkingCategories=['Ý tưởng','Cần làm','Học tập','Công việc','Khác'];
  if(!d.frictionLog)d.frictionLog=[]; // v13.1: quick-select friction capture, see FRICTION_TAGS
  if(d.events)d.events=d.events.map(e=>({...e,shortLabel:e.shortLabel||'',recurring:e.recurring||false,recurringDow:e.recurringDow||[],recurringEndDate:e.recurringEndDate||''}));
  if(d.courses)d.courses=d.courses.map(c=>({...c,topics:(c.topics||[]).map(t=>({...t,subtasks:(t.subtasks||[]).map(s=>({...s,dueDate:s.dueDate||''}))}))}));
  if(!d.studyJournal)d.studyJournal=[];
  return d;
}

/* ── V12/V12.1: THE BIG ONE — Todo-based → Knowledge-based → Session-centered ──
   Idempotent per-step: safe to run repeatedly, safe to run on data that's
   already partially migrated (e.g. this user's live Firestore data already
   has Concepts with populated `evals` from real Quick-Eval usage in v12 —
   step 2b below converts that forward to `touches`, it does NOT get skipped
   just because `concepts` already exists). Never destroys old data. */
function migrateToV12(d){
  if(!d)return d;
  d=migrateToV6(d);

  // 1. Rename semester-wide `phases` → `uniPhases` (name freed up for per-course Phase)
  if(d.phases&&!d.uniPhases){d.uniPhases=d.phases;delete d.phases;}
  if(d.currentPhaseId!==undefined&&d.currentUniPhaseId===undefined){d.currentUniPhaseId=d.currentPhaseId;delete d.currentPhaseId;}
  if(!d.uniPhases)d.uniPhases=[];

  if(d.courses)d.courses=d.courses.map(c=>{
    let course=c;

    // 2a. Structural: topics[] → coursePhases/chapters/concepts (skip if already done)
    if(!course.concepts){
      const oldTopics=course.topics||[];
      const oldTasks=course.tasks||[];
      const secNames=(course.sections&&course.sections.length)
        ? course.sections.map(s=>s.name)
        : [...new Set(oldTopics.map(t=>t.sec).filter(Boolean))];
      const finalSecNames=secNames.length?secNames:['Chưa phân loại'];
      const coursePhaseId='cp_'+course.id+'_legacy';
      const coursePhases=[{id:coursePhaseId,title:'📥 Nhập từ hệ thống cũ',startDate:'',endDate:course.examDate||course.endDate||'',order:0}];
      const chapters=finalSecNames.map((name,i)=>({id:'ch_'+course.id+'_'+i,coursePhaseIds:[coursePhaseId],title:name}));
      const chapterByName={};chapters.forEach(ch=>{chapterByName[ch.title]=ch.id;});
      const fallbackChapterId=chapterByName['Chưa phân loại']||chapters[0]?.id;
      const concepts=oldTopics.map((t,i)=>{
        const chId=chapterByName[t.sec]||fallbackChapterId;
        // Already-completed topics get a starting touch so they don't show mastery 0
        // — a rough estimate (Understanding 4, Confidence 3), user should re-rate via a real touch.
        const touches=t.done?[{understanding:4,confidence:3,timestamp:Date.now()-((oldTopics.length-i)*86400000),sessionId:null,legacy:true}]:[];
        return{id:'cn_'+course.id+'_'+i,chapterId:chId,title:t.label,touches,objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:t.dueDate||'',legacySubtasks:t.subtasks||[]};
      });
      course={...course,coursePhases,chapters,concepts,legacyTopics:oldTopics,legacyTasks:oldTasks,topics:undefined,tasks:undefined};
    }

    // 2b. Per-concept: evals[] (old single-score) → touches[] (Understanding+Confidence).
    //     Runs even if `concepts` already existed (e.g. this user's live v12 data with
    //     real Quick-Eval history) — converts forward, does not skip.
    course={...course,concepts:(course.concepts||[]).map(cn=>{
      if(cn.touches)return{...cn,prerequisiteConceptIds:cn.prerequisiteConceptIds||[]}; // already v12.1 — just backfill new field
      const oldEvals=cn.evals||[];
      const touches=oldEvals.map(e=>({
        understanding:e.score!==undefined?Math.max(1,Math.min(5,Math.round(e.score/20))):3,
        confidence:e.confidence||3,timestamp:e.timestamp,sessionId:e.sessionId||null,legacy:true,
      }));
      return{...cn,touches,evals:undefined,prerequisiteConceptIds:cn.prerequisiteConceptIds||[]};
    })};

    // 2c. Learning Objectives move from Course-level into Session-level (per approved spec).
    //     Old course.learningObjectives preserved inert as legacyLearningObjectives.
    if(course.learningObjectives&&!course.legacyLearningObjectives){
      course={...course,legacyLearningObjectives:course.learningObjectives,learningObjectives:undefined};
    }

    // 2d. Chapter↔Phase relationship: singular coursePhaseId → plural coursePhaseIds
    //     (many-to-many, per user's explicit request — a Chapter may belong to
    //     more than one Phase, and a Phase may contain Chapters shared with
    //     others; forcing 1 Chapter = 1 Phase didn't fit courses where the
    //     Phase/Chapter counts just don't line up 1:1). Old singular id
    //     becomes a 1-item array — coursePhaseId itself is left in place
    //     (harmless leftover) rather than deleted; every internal reader now
    //     uses coursePhaseIds exclusively.
    if(course.chapters&&course.chapters.some(ch=>!ch.coursePhaseIds)){
      course={...course,chapters:course.chapters.map(ch=>ch.coursePhaseIds?ch:{...ch,coursePhaseIds:ch.coursePhaseId?[ch.coursePhaseId]:[]})};
    }

    if(!course.sessions)course={...course,sessions:[]}; // Session blueprints — Bước 2 builds the editor UI

    return course;
  });

  // 3. Global Journal Entries (execution instances) — renamed from the earlier
  //    studyPlans/studySessions placeholder shape, which never had UI built on it
  //    (safe direct rename). Preserved inert under legacy* just in case.
  if(!d.journalEntries){
    d.journalEntries=d.studySessions&&d.studySessions.length?d.studySessions:[];
  }
  if(d.studyPlans&&d.studyPlans.length&&!d.legacyStudyPlans)d.legacyStudyPlans=d.studyPlans;
  if(d.studySessions&&d.studySessions.length&&!d.legacyStudySessions)d.legacyStudySessions=d.studySessions;
  delete d.studyPlans;delete d.studySessions;

  // 4. Mastery settings — merge forward, converting old `alpha` key name to `emaAlpha`,
  //    and backfilling any new configurable weight that didn't exist before.
  const oldMs=d.masterySettings||{};
  d.masterySettings={
    ...DEFAULT_MASTERY_SETTINGS,
    ...oldMs,
    emaAlpha:oldMs.emaAlpha??oldMs.alpha??DEFAULT_MASTERY_SETTINGS.emaAlpha,
    alpha:undefined,
  };

  // 5. v13.1 Language module rebuild — per approved spec (StudyOS tracks
  //    PROCESS, not content; OneNote stays the single knowledge source).
  //    Grammar & Speaking become Concepts, reusing the EXACT SAME touches/EMA
  //    mastery + Review Priority engine Course already uses — a grammar
  //    point or a speaking topic genuinely benefits from "how well do I
  //    still remember this", which is exactly what touches already model.
  //    Vocabulary's simple +N counter is left untouched ON PURPOSE — it's
  //    the lowest-friction path for daily logging, and forcing every word
  //    through a Concept rating would fight the whole point (ADHD-friendly
  //    quick capture > completeness). Writing stays a task list — essays
  //    are one-off deliverables, not a "review repeatedly" skill — just
  //    gains score/feedback fields. Old checklist items are preserved inert
  //    under legacyGrammarItems/legacySpeakingItems, never deleted, per this
  //    file's own convention.
  if(d.languages)d.languages=d.languages.map(l=>{
    if(l.concepts)return l; // already migrated
    const cats=l.categories||defCats();
    const grammarItems=cats.grammar?.items||[];
    const speakingItems=cats.speaking?.items||[];
    const writingItems=cats.writing?.items||[];
    const n=grammarItems.length+speakingItems.length;
    let idx=0;
    const toConcept=(item,skill)=>{
      idx++;
      return{
        id:'lc_'+l.id+'_'+skill+'_'+item.id,
        title:item.text,skill,
        legacyLevel:item.level||'', // grammar's old CEFR tag — kept for display only
        touches:item.done?[{understanding:4,confidence:4,timestamp:Date.now()-((n-idx)*86400000),sessionId:null,legacy:true}]:[],
        objectiveIds:[],prerequisiteConceptIds:[],
      };
    };
    const concepts=[
      ...grammarItems.map(it=>toConcept(it,'grammar')),
      ...speakingItems.map(it=>toConcept(it,'speaking')),
    ];
    const writing={items:writingItems.map(it=>({...it,score:it.score??null,feedback:it.feedback??''}))};
    return{...l,concepts,categories:{...cats,writing},legacyGrammarItems:grammarItems,legacySpeakingItems:speakingItems};
  });

  // 5b. Uni Phase goals — the old German-only, target-blind auto-link
  //     ('german_hours'/'german_cefr', always measured against a hard-coded
  //     B2/4000-word yardstick) becomes languageId + targetLevel per goal —
  //     so two Phases tracking the SAME language toward two DIFFERENT
  //     targets (Phase 1 → B2, Phase 2 → C1) each show their own honest %,
  //     without the underlying vocab/grammar/speaking data ever resetting
  //     or duplicating between phases. Best-effort infers targetLevel from
  //     the goal's own label first (so seed data "German Recovery B2+" and
  //     "German → C1" resolve correctly on their own), falling back to the
  //     language's current `target` text, then a hard 'B2' default — always
  //     editable by hand afterward via the goal editor.
  const inferTargetLevel=(str)=>{
    if(!str)return null;
    return CEFR_LEVELS.slice().reverse().find(lv=>str.includes(lv))||null;
  };
  if(d.uniPhases)d.uniPhases=d.uniPhases.map(p=>({
    ...p,
    goals:(p.goals||[]).map(g=>{
      if(g.linkedTo!=='german_hours'&&g.linkedTo!=='german_cefr'&&g.linkedTo!=='language_cefr')return g;
      if(g.linkedTo==='language_cefr'&&g.targetLevel)return g; // already migrated
      const lang=(d.languages||[]).find(x=>x.id===(g.languageId||'de'));
      const targetLevel=g.targetLevel||inferTargetLevel(g.text)||inferTargetLevel(lang?.target)||'B2';
      return{...g,linkedTo:'language_cefr',languageId:g.languageId||'de',targetLevel};
    }),
  }));

  // 6. v13.2 Exam Metadata + Objective Library, per approved proposal.
  //    difficulty/examWeight default to 0 ("chưa đặt") — additive only, see
  //    the matching computeReviewPriority change in 04-mastery-engine.js:
  //    examWeight=0 contributes exactly 0 to the review-priority score, so
  //    every concept nobody has touched yet scores IDENTICALLY to before
  //    this migration ran. No existing priority silently shifts.
  //    objectiveLibrary is a NEW, separate, empty-by-default array — it does
  //    NOT touch session.objectives at all (still full inline objects, still
  //    read/written exactly as before everywhere). Library entries only get
  //    COPIED into a session's objectives when picked, so nothing that reads
  //    session.objectives needs to change.
  if(d.courses)d.courses=d.courses.map(c=>({
    ...c,
    objectiveLibrary:c.objectiveLibrary||[],
    concepts:(c.concepts||[]).map(cn=>({...cn,difficulty:cn.difficulty||0,examWeight:cn.examWeight||0})),
  }));

  return d;
}

function buildInit(){return{
uniPhases:[
  {id:1,name:'Phase 1: Foundation & GPA',dateRange:'T4–T7/2026',endDate:'2026-07-31',color:'#7C6EF5',status:'active',
    goals:[{id:'g1',text:'GPA trung bình các môn',icon:'🎓',type:'gpa',progress:0,linkedTo:'gpa_auto',hint:'Tự động: trung bình có trọng số ECTS từ điểm thi đã nhập (mục tiêu ≤1.5)'},{id:'g2',text:'German Recovery B2+',icon:'🇩🇪',progress:15,linkedTo:'german_hours',hint:'Tự động: giờ học tiếng Đức tuần này'},{id:'g3',text:'Networking & ngoại khóa',icon:'🤝',progress:10,linkedTo:'events_attended',hint:'Tự động: số events networking đã tham gia'}],
    milestones:[{date:'2026-07-09',text:'IPE Day 1: Thuyết trình nhóm'},{date:'2026-07-10',text:'IPE Day 2: Simulation Game'},{date:'2026-07-20',text:'Metrics Tutorial kết thúc'},{date:'2026-07-22',text:'🎯 THI Microeconometrics'},{date:'2026-07-24',text:'GSE kết thúc'},{date:'2026-07-25',text:'Macro kết thúc'},{date:'2026-07-31',text:'🏁 Phase 1 kết thúc'}]},
  {id:2,name:'Phase 2: Jobs & Language',dateRange:'T8–T12/2026',endDate:'2026-12-31',color:'#1D9E75',status:'upcoming',
    goals:[{id:'g1',text:'Tìm Working Student / Internship',icon:'💼',progress:0,linkedTo:'manual',hint:'Cập nhật thủ công'},{id:'g2',text:'German → C1',icon:'🇩🇪',progress:0,linkedTo:'german_hours',hint:'Tự động: giờ học tích lũy'},{id:'g3',text:'Duy trì GPA kỳ 2',icon:'🎓',progress:0,linkedTo:'manual',hint:'Cập nhật thủ công'}],milestones:[]}
],
currentUniPhaseId:1,
courses:[
  {id:'micro',name:'Microeconometrics',emoji:'📊',color:'#E24B4A',risk:'critical',schedule:'Thứ 4, 8:00–12:00',examDate:'2026-07-22',endDate:'2026-07-20',nextAction:'Xem MLE từ đầu → Binary Models',note:'Thi 22/7 — HIGHEST PRIORITY. Kiến thức gần như trống. Crash study ngay!',archived:false,ects:6,grade:null,notes:[],instructor:'',contact:'',location:'',sections:[],attendance:{},
    coursePhases:[{id:'cp_micro_a',title:'Part A',startDate:'',endDate:'2026-07-08',order:0},{id:'cp_micro_b',title:'Part B',startDate:'',endDate:'2026-07-20',order:1}],
    chapters:[{id:'ch_micro_1',coursePhaseIds:['cp_micro_a'],title:'MLE & Discrete Choice'},{id:'ch_micro_2',coursePhaseIds:['cp_micro_b'],title:'Causal Inference'}],
    concepts:[
      {id:'cn_micro_1',chapterId:'ch_micro_1',title:'Maximum-Likelihood Estimation',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-06-25',legacySubtasks:[]},
      {id:'cn_micro_2',chapterId:'ch_micro_1',title:'Binary Outcome Models (Logit/Probit)',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-07-01',legacySubtasks:[]},
      {id:'cn_micro_3',chapterId:'ch_micro_1',title:'Multinomial & Count Data',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-07-05',legacySubtasks:[]},
      {id:'cn_micro_4',chapterId:'ch_micro_1',title:'Limited Dependent Variables',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-07-08',legacySubtasks:[]},
      {id:'cn_micro_5',chapterId:'ch_micro_2',title:'Causal Diagrams (DAGs)',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-07-10',legacySubtasks:[]},
      {id:'cn_micro_6',chapterId:'ch_micro_2',title:'Machine Learning for Causal Inference',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-07-12',legacySubtasks:[]},
      {id:'cn_micro_7',chapterId:'ch_micro_2',title:'Propensity Score Matching',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-07-14',legacySubtasks:[]},
      {id:'cn_micro_8',chapterId:'ch_micro_2',title:'Instrumental Variables',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-07-16',legacySubtasks:[]},
      {id:'cn_micro_9',chapterId:'ch_micro_2',title:'Difference-in-Differences',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-07-18',legacySubtasks:[]},
      {id:'cn_micro_10',chapterId:'ch_micro_2',title:'Regression Discontinuity',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-07-20',legacySubtasks:[]},
    ],
    sessions:[],
    legacyLearningObjectives:[
      {id:'lo_micro_1',text:'Giải thích tại sao OLS thất bại với biến phụ thuộc nhị phân'},
      {id:'lo_micro_2',text:'Derive Logit likelihood function'},
      {id:'lo_micro_3',text:'Diễn giải marginal effects đúng cách'},
    ],
    legacyTopics:[],legacyTasks:[]},
  {id:'ipe',name:"Int'l Political Economics",emoji:'🌍',color:'#BA7517',risk:'watch',schedule:'9–10/7',examDate:null,endDate:'2026-07-10',nextAction:'Hoàn thiện 2/3 slides còn lại',note:'Chỉ 2 ngày: 9/7 thuyết trình, 10/7 simulation.',archived:false,ects:5,grade:null,notes:[],instructor:'',contact:'',location:'',sections:[],attendance:{},
    coursePhases:[{id:'cp_ipe_1',title:'Day 1 — Presentation',startDate:'',endDate:'2026-07-09',order:0},{id:'cp_ipe_2',title:'Day 2 — Simulation',startDate:'',endDate:'2026-07-10',order:1}],
    chapters:[{id:'ch_ipe_1',coursePhaseIds:['cp_ipe_1'],title:'Group Presentation'},{id:'ch_ipe_2',coursePhaseIds:['cp_ipe_2'],title:'Simulation Game'}],
    concepts:[
      {id:'cn_ipe_1',chapterId:'ch_ipe_1',title:'Presentation slides content',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-07-08',legacySubtasks:[]},
      {id:'cn_ipe_2',chapterId:'ch_ipe_1',title:'Delivery / luyện thuyết trình',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-07-08',legacySubtasks:[]},
      {id:'cn_ipe_3',chapterId:'ch_ipe_2',title:'Luật chơi simulation',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-07-09',legacySubtasks:[]},
      {id:'cn_ipe_4',chapterId:'ch_ipe_2',title:'Chiến lược vai trò trong game',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-07-09',legacySubtasks:[]},
    ],
    sessions:[],legacyLearningObjectives:[],legacyTopics:[],legacyTasks:[]},
  {id:'gse',name:'Global Sustainability Econ',emoji:'🌱',color:'#1D9E75',risk:'medium',schedule:'Thứ 5, 16:00–18:00',examDate:null,endDate:'2026-07-24',nextAction:'Viết Skill Development Plan (nháp 1)',note:'2 phần: Skill Development + Presentation & debate.',archived:false,ects:6,grade:null,notes:[],instructor:'',contact:'',location:'',sections:[],attendance:{},
    coursePhases:[{id:'cp_gse_1',title:'Lecture Series',startDate:'',endDate:'2026-07-24',order:0},{id:'cp_gse_2',title:'Assessment',startDate:'',endDate:'2026-07-24',order:1}],
    chapters:[{id:'ch_gse_1',coursePhaseIds:['cp_gse_1'],title:'Core Lectures'},{id:'ch_gse_2',coursePhaseIds:['cp_gse_2'],title:'Assessed Work'}],
    concepts:[
      {id:'cn_gse_1',chapterId:'ch_gse_1',title:'Introduction to Sustainability Econ',touches:[{understanding:4,confidence:4,timestamp:Date.now()-8640000*9,sessionId:null,legacy:true}],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'',legacySubtasks:[]},
      {id:'cn_gse_2',chapterId:'ch_gse_1',title:'Complexity Economics',touches:[{understanding:4,confidence:4,timestamp:Date.now()-8640000*8,sessionId:null,legacy:true}],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'',legacySubtasks:[]},
      {id:'cn_gse_3',chapterId:'ch_gse_1',title:'SDGs Framework',touches:[{understanding:4,confidence:4,timestamp:Date.now()-8640000*7,sessionId:null,legacy:true}],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'',legacySubtasks:[]},
      {id:'cn_gse_4',chapterId:'ch_gse_1',title:'Sustainability Ethics',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-06-26',legacySubtasks:[]},
      {id:'cn_gse_5',chapterId:'ch_gse_2',title:'Skill Development Plan',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-07-01',legacySubtasks:[]},
      {id:'cn_gse_6',chapterId:'ch_gse_2',title:'Group Presentation & Debate',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-07-24',legacySubtasks:[]},
    ],
    sessions:[],legacyLearningObjectives:[],legacyTopics:[],legacyTasks:[]},
  {id:'macro',name:'Macroeconomics',emoji:'📈',color:'#7C6EF5',risk:'medium',schedule:'T2 16–18h | T3 12–14h',examDate:null,endDate:'2026-07-25',nextAction:'Ôn chắc Ramsey model',note:'Kiến thức thực tế mới đến nửa Ramsey. Catch up!',archived:false,ects:6,grade:null,notes:[],instructor:'',contact:'',location:'',sections:[],attendance:{},
    coursePhases:[{id:'cp_macro_1',title:'Growth Models',startDate:'',endDate:'2026-07-14',order:0},{id:'cp_macro_2',title:'Business Cycles',startDate:'',endDate:'2026-07-25',order:1}],
    chapters:[{id:'ch_macro_1',coursePhaseIds:['cp_macro_1'],title:'Solow–Ramsey'},{id:'ch_macro_2',coursePhaseIds:['cp_macro_2'],title:'RBC / DSGE & Cycles'}],
    concepts:[
      {id:'cn_macro_1',chapterId:'ch_macro_1',title:'Solow Growth Model',touches:[{understanding:4,confidence:4,timestamp:Date.now()-8640000*10,sessionId:null,legacy:true}],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'',legacySubtasks:[]},
      {id:'cn_macro_2',chapterId:'ch_macro_1',title:'Ramsey Model',touches:[{understanding:4,confidence:3,timestamp:Date.now()-8640000*9,sessionId:null,legacy:true}],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-06-24',legacySubtasks:[]},
      {id:'cn_macro_3',chapterId:'ch_macro_2',title:'RBC / DSGE',touches:[{understanding:4,confidence:3,timestamp:Date.now()-8640000*8,sessionId:null,legacy:true}],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-07-01',legacySubtasks:[]},
      {id:'cn_macro_4',chapterId:'ch_macro_2',title:'System Dynamics',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-06-23',legacySubtasks:[]},
      {id:'cn_macro_5',chapterId:'ch_macro_2',title:'Goodwin–Minsky–Keen',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-07-25',legacySubtasks:[]},
      {id:'cn_macro_6',chapterId:'ch_macro_2',title:'Business Cycles & Modeling Process',touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacyDueDate:'2026-07-25',legacySubtasks:[]},
    ],
    sessions:[],legacyLearningObjectives:[],legacyTopics:[],legacyTasks:[]}
],
languages:[
  {id:'de',name:'Tiếng Đức',emoji:'🇩🇪',color:'#FFD700',level:'B2 (đã quên nhiều)',target:'B2+ / C1',schedule:'T4 & T6, 12:00–13:30',classDOW:[3,5],selfMin:30,note:'Ưu tiên nói và nghe',resources:['Lớp học','Deutsche Welle','Duolingo'],log:{},
    categories:{grammar:{items:[{id:'g1',text:'Adjektivdeklination',done:false,level:'B1'},{id:'g2',text:'Konjunktiv II',done:false,level:'B2'},{id:'g3',text:'Passiv (Passive voice)',done:false,level:'B1'}]},vocabulary:{total:0,weeklyGoal:50,log:{}},speaking:{items:[{id:'s1',text:'Über mich — Vorstellung',done:true},{id:'s2',text:'Uni Alltag — Tagesablauf',done:false}]},writing:{items:[{id:'w1',text:'Email an Professor (formell)',done:false,link:''}]}}},
  {id:'en',name:'Tiếng Anh',emoji:'🇬🇧',color:'#4FA3FF',level:'C1 (academic yếu)',target:'C1+ Academic',schedule:'T2 & T5, 12:00–13:30',classDOW:[1,4],selfMin:20,note:'Focus academic writing & speaking',resources:['Lớp học','TED Talks','Writing practice'],log:{},
    categories:{grammar:{items:[{id:'g1',text:'Academic hedging language',done:false,level:'C1'},{id:'g2',text:'Concession & contrast structures',done:false,level:'B2'}]},vocabulary:{total:0,weeklyGoal:30,log:{}},speaking:{items:[{id:'s1',text:'GSE Presentation — Sustainability',done:false},{id:'s2',text:'Academic debate structure',done:false}]},writing:{items:[{id:'w1',text:'Skill Development Plan',done:false,link:''},{id:'w2',text:'Reflection Essay (GSE)',done:false,link:''}]}}}
],
habits:[
  {id:'h1',name:'Tự học Tiếng Đức 20 phút',emoji:'🇩🇪',color:'#FFD700',completions:{},archived:false},
  {id:'h2',name:'Ôn Microeconometrics 1 tiếng',emoji:'📊',color:'#E24B4A',completions:{},archived:false},
  {id:'h3',name:'Review 1 concept Macro',emoji:'📈',color:'#7C6EF5',completions:{},archived:false},
  {id:'h4',name:'Ngủ trước 12h đêm',emoji:'😴',color:'#1D9E75',completions:{},archived:false},
  {id:'h5',name:'Uống đủ 2L nước',emoji:'💧',color:'#4FA3FF',completions:{},archived:false}
],
studyLog:[],
journalEntries:[],
events:[
  {id:'ev1',title:'SprachCafe',date:'2026-06-17',time:'18:00',emoji:'🗣️',type:'language',note:'Networking với người bản ngữ'},
  {id:'ev2',title:'Swimming',date:'2026-06-17',time:'14:00',emoji:'🏊',type:'health',note:'Thứ 3 hàng tuần'},
  {id:'ev3',title:'IPE Thuyết trình',date:'2026-07-09',time:'09:00',emoji:'🌍',type:'exam',note:''},
  {id:'ev4',title:'IPE Simulation',date:'2026-07-10',time:'09:00',emoji:'🌍',type:'exam',note:''},
  {id:'ev5',title:'🎯 Thi Microeconometrics',date:'2026-07-22',time:'10:00',emoji:'📊',type:'exam',note:'HZO 90'}
],
adminTasks:{
  recurring:[
    {id:'r1',title:'Nấu ăn',emoji:'🍳',dow:[2,6]},
    {id:'r2',title:'Đi chợ',emoji:'🛒',dow:[5]},
    {id:'r3',title:'Giặt đồ',emoji:'👕',dow:[0]}
  ],
  daily:{}
},
dailyPerf:{},
gamification:{xp:0,achievements:[]},
timerCategories:[],
settings:{theme:'purple',radius:'rounded',fontFamily:'system',bannerUrl:'',userName:''},
masterySettings:{...DEFAULT_MASTERY_SETTINGS},
parkingLot:[{id:'p1',text:'Tìm công cụ AI hỗ trợ học Econometrics',date:TODAY},{id:'p2',text:'Cập nhật CV cho Phase 2',date:TODAY}],
parkingTasks:[{id:'pt1',text:'Tìm công cụ AI hỗ trợ học Econometrics',category:'Học tập',deadline:'',done:false,date:TODAY},{id:'pt2',text:'Cập nhật CV cho Phase 2',category:'Công việc',deadline:'2026-08-01',done:false,date:TODAY}],
parkingNotes:[],
parkingCategories:['Ý tưởng','Cần làm','Học tập','Công việc','Khác'],
studyJournal:[],
dailyFocus:{}
};}

function getDayFocus(data,date){
  const d=data.dailyFocus?.[date];
  if(d)return d;
  return{mustDo:{text:'',done:false},top3:[{id:'t1',text:'',done:false},{id:'t2',text:'',done:false},{id:'t3',text:'',done:false}]};
}
