/* ══════════════════════════════════════════════════════════════
   06-data-model.js — buildInit() + full migration chain
   ══════════════════════════════════════════════════════════════
   V12 ARCHITECTURE CHANGE — Knowledge-based instead of Todo-based.

   Naming: the OLD semester-wide "Phase" (Phase 1: Foundation & GPA,
   spanning all courses, with goals[]/milestones[]) is renamed to
   `uniPhases` / "Uni Phase" throughout — because the NEW per-course
   structural unit (Foundation / Part A / Part B / Review inside ONE
   course) now owns the name "Phase" (stored as `course.coursePhases`).

   New per-course entities:
     course.coursePhases: [{id,title,startDate,endDate,order}]
     course.chapters:     [{id,coursePhaseId,title}]
     course.concepts:     [{id,chapterId,title,evals:[],objectiveIds:[],legacyDueDate,legacySubtasks}]
     course.learningObjectives: [{id,text}]
     course.attendance: {}   ← UNCHANGED, deliberately kept separate from
                                 StudySession (classroom attendance vs.
                                 self-study are different behaviors — see
                                 design discussion)

   New global entities:
     data.studyPlans:    [{id,courseId,title,estimatedDuration,order,conceptIds,todos}]  (blueprint — Phase 2 UI)
     data.studySessions: [{id,studyPlanId,courseId,date,startTime,endTime,duration,
                            status,notes,reflection,quizScore,todos:[],conceptEvals:[]}] (execution — Phase 2 UI)

   Legacy fields are NEVER destroyed — old topics/tasks are renamed to
   legacyTopics/legacyTasks and kept inert, so no data is lost even
   though the new UI no longer reads them directly.
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
  if(d.events)d.events=d.events.map(e=>({...e,shortLabel:e.shortLabel||'',recurring:e.recurring||false,recurringDow:e.recurringDow||[],recurringEndDate:e.recurringEndDate||''}));
  if(d.courses)d.courses=d.courses.map(c=>({...c,topics:(c.topics||[]).map(t=>({...t,subtasks:(t.subtasks||[]).map(s=>({...s,dueDate:s.dueDate||''}))}))}));
  if(!d.studyJournal)d.studyJournal=[];
  return d;
}

/* ── V12: THE BIG ONE — Todo-based → Knowledge-based restructure ──
   Idempotent: safe to run on already-migrated data (checks course.concepts
   existence before converting). Never destroys old data — old topics/tasks
   survive renamed as legacyTopics/legacyTasks. */
function migrateToV12(d){
  if(!d)return d;
  d=migrateToV6(d);

  // 1. Rename semester-wide `phases` → `uniPhases` (name freed up for per-course Phase)
  if(d.phases&&!d.uniPhases){d.uniPhases=d.phases;delete d.phases;}
  if(d.currentPhaseId!==undefined&&d.currentUniPhaseId===undefined){d.currentUniPhaseId=d.currentPhaseId;delete d.currentPhaseId;}
  if(!d.uniPhases)d.uniPhases=[];

  // 2. Per-course restructure: topics[] → coursePhases/chapters/concepts
  if(d.courses)d.courses=d.courses.map(c=>{
    if(c.concepts)return c; // already migrated — idempotent guard
    const oldTopics=c.topics||[];
    const oldTasks=c.tasks||[];

    // Group old topics by their `sec` field (existing section grouping) into Chapters.
    // If a course already has `sections[]` (v6+), use those names/order; otherwise
    // derive section names from whatever `sec` values appear on topics.
    const secNames=(c.sections&&c.sections.length)
      ? c.sections.map(s=>s.name)
      : [...new Set(oldTopics.map(t=>t.sec).filter(Boolean))];
    const finalSecNames=secNames.length?secNames:['Chưa phân loại'];

    const coursePhaseId='cp_'+c.id+'_legacy';
    const coursePhases=[{id:coursePhaseId,title:'📥 Nhập từ hệ thống cũ',startDate:'',endDate:c.examDate||c.endDate||'',order:0}];

    const chapters=finalSecNames.map((name,i)=>({id:'ch_'+c.id+'_'+i,coursePhaseId,title:name}));
    const chapterByName={};chapters.forEach(ch=>{chapterByName[ch.title]=ch.id;});
    const fallbackChapterId=chapterByName['Chưa phân loại']||chapters[0]?.id;

    const concepts=oldTopics.map((t,i)=>{
      const chId=chapterByName[t.sec]||fallbackChapterId;
      // Give already-completed topics a starting eval so they don't show mastery 0
      // — clearly a rough estimate, user should re-evaluate via Quick Eval.
      const evals=t.done?[{score:75,confidence:3,timestamp:Date.now()-((oldTopics.length-i)*86400000),sessionId:null,legacy:true}]:[];
      return{
        id:'cn_'+c.id+'_'+i,chapterId:chId,title:t.label,evals,objectiveIds:[],
        legacyDueDate:t.dueDate||'',legacySubtasks:t.subtasks||[]
      };
    });

    return{
      ...c,
      coursePhases,chapters,concepts,
      learningObjectives:c.learningObjectives||[],
      legacyTopics:oldTopics,   // preserved, inert — not read by new UI
      legacyTasks:oldTasks,     // preserved, inert — "task lẻ" retired per user decision
      topics:undefined,tasks:undefined,
    };
  });

  // 3. Global Study Plan / Study Session shape (blueprint vs execution — Phase 2 builds the UI,
  //    but the shape must exist now so no further migration is needed later).
  if(!d.studyPlans)d.studyPlans=[];
  if(!d.studySessions)d.studySessions=[];
  // Keep legacy studyJournal inert too — Phase 2 will offer an optional one-time
  // "convert old journal entries into StudySession records" tool, not automatic,
  // since journal entries don't cleanly map to a single StudyPlan.
  if(!d.masterySettings)d.masterySettings={alpha:MASTERY_ALPHA_DEFAULT};

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
    chapters:[{id:'ch_micro_1',coursePhaseId:'cp_micro_a',title:'MLE & Discrete Choice'},{id:'ch_micro_2',coursePhaseId:'cp_micro_b',title:'Causal Inference'}],
    concepts:[
      {id:'cn_micro_1',chapterId:'ch_micro_1',title:'Maximum-Likelihood Estimation',evals:[],objectiveIds:[],legacyDueDate:'2026-06-25',legacySubtasks:[]},
      {id:'cn_micro_2',chapterId:'ch_micro_1',title:'Binary Outcome Models (Logit/Probit)',evals:[],objectiveIds:[],legacyDueDate:'2026-07-01',legacySubtasks:[]},
      {id:'cn_micro_3',chapterId:'ch_micro_1',title:'Multinomial & Count Data',evals:[],objectiveIds:[],legacyDueDate:'2026-07-05',legacySubtasks:[]},
      {id:'cn_micro_4',chapterId:'ch_micro_1',title:'Limited Dependent Variables',evals:[],objectiveIds:[],legacyDueDate:'2026-07-08',legacySubtasks:[]},
      {id:'cn_micro_5',chapterId:'ch_micro_2',title:'Causal Diagrams (DAGs)',evals:[],objectiveIds:[],legacyDueDate:'2026-07-10',legacySubtasks:[]},
      {id:'cn_micro_6',chapterId:'ch_micro_2',title:'Machine Learning for Causal Inference',evals:[],objectiveIds:[],legacyDueDate:'2026-07-12',legacySubtasks:[]},
      {id:'cn_micro_7',chapterId:'ch_micro_2',title:'Propensity Score Matching',evals:[],objectiveIds:[],legacyDueDate:'2026-07-14',legacySubtasks:[]},
      {id:'cn_micro_8',chapterId:'ch_micro_2',title:'Instrumental Variables',evals:[],objectiveIds:[],legacyDueDate:'2026-07-16',legacySubtasks:[]},
      {id:'cn_micro_9',chapterId:'ch_micro_2',title:'Difference-in-Differences',evals:[],objectiveIds:[],legacyDueDate:'2026-07-18',legacySubtasks:[]},
      {id:'cn_micro_10',chapterId:'ch_micro_2',title:'Regression Discontinuity',evals:[],objectiveIds:[],legacyDueDate:'2026-07-20',legacySubtasks:[]},
    ],
    learningObjectives:[
      {id:'lo_micro_1',text:'Giải thích tại sao OLS thất bại với biến phụ thuộc nhị phân'},
      {id:'lo_micro_2',text:'Derive Logit likelihood function'},
      {id:'lo_micro_3',text:'Diễn giải marginal effects đúng cách'},
    ],
    legacyTopics:[],legacyTasks:[]},
  {id:'ipe',name:"Int'l Political Economics",emoji:'🌍',color:'#BA7517',risk:'watch',schedule:'9–10/7',examDate:null,endDate:'2026-07-10',nextAction:'Hoàn thiện 2/3 slides còn lại',note:'Chỉ 2 ngày: 9/7 thuyết trình, 10/7 simulation.',archived:false,ects:5,grade:null,notes:[],instructor:'',contact:'',location:'',sections:[],attendance:{},
    coursePhases:[{id:'cp_ipe_1',title:'Day 1 — Presentation',startDate:'',endDate:'2026-07-09',order:0},{id:'cp_ipe_2',title:'Day 2 — Simulation',startDate:'',endDate:'2026-07-10',order:1}],
    chapters:[{id:'ch_ipe_1',coursePhaseId:'cp_ipe_1',title:'Group Presentation'},{id:'ch_ipe_2',coursePhaseId:'cp_ipe_2',title:'Simulation Game'}],
    concepts:[
      {id:'cn_ipe_1',chapterId:'ch_ipe_1',title:'Presentation slides content',evals:[],objectiveIds:[],legacyDueDate:'2026-07-08',legacySubtasks:[]},
      {id:'cn_ipe_2',chapterId:'ch_ipe_1',title:'Delivery / luyện thuyết trình',evals:[],objectiveIds:[],legacyDueDate:'2026-07-08',legacySubtasks:[]},
      {id:'cn_ipe_3',chapterId:'ch_ipe_2',title:'Luật chơi simulation',evals:[],objectiveIds:[],legacyDueDate:'2026-07-09',legacySubtasks:[]},
      {id:'cn_ipe_4',chapterId:'ch_ipe_2',title:'Chiến lược vai trò trong game',evals:[],objectiveIds:[],legacyDueDate:'2026-07-09',legacySubtasks:[]},
    ],
    learningObjectives:[],legacyTopics:[],legacyTasks:[]},
  {id:'gse',name:'Global Sustainability Econ',emoji:'🌱',color:'#1D9E75',risk:'medium',schedule:'Thứ 5, 16:00–18:00',examDate:null,endDate:'2026-07-24',nextAction:'Viết Skill Development Plan (nháp 1)',note:'2 phần: Skill Development + Presentation & debate.',archived:false,ects:6,grade:null,notes:[],instructor:'',contact:'',location:'',sections:[],attendance:{},
    coursePhases:[{id:'cp_gse_1',title:'Lecture Series',startDate:'',endDate:'2026-07-24',order:0},{id:'cp_gse_2',title:'Assessment',startDate:'',endDate:'2026-07-24',order:1}],
    chapters:[{id:'ch_gse_1',coursePhaseId:'cp_gse_1',title:'Core Lectures'},{id:'ch_gse_2',coursePhaseId:'cp_gse_2',title:'Assessed Work'}],
    concepts:[
      {id:'cn_gse_1',chapterId:'ch_gse_1',title:'Introduction to Sustainability Econ',evals:[{score:75,confidence:4,timestamp:Date.now()-8640000*9,sessionId:null,legacy:true}],objectiveIds:[],legacyDueDate:'',legacySubtasks:[]},
      {id:'cn_gse_2',chapterId:'ch_gse_1',title:'Complexity Economics',evals:[{score:75,confidence:4,timestamp:Date.now()-8640000*8,sessionId:null,legacy:true}],objectiveIds:[],legacyDueDate:'',legacySubtasks:[]},
      {id:'cn_gse_3',chapterId:'ch_gse_1',title:'SDGs Framework',evals:[{score:75,confidence:4,timestamp:Date.now()-8640000*7,sessionId:null,legacy:true}],objectiveIds:[],legacyDueDate:'',legacySubtasks:[]},
      {id:'cn_gse_4',chapterId:'ch_gse_1',title:'Sustainability Ethics',evals:[],objectiveIds:[],legacyDueDate:'2026-06-26',legacySubtasks:[]},
      {id:'cn_gse_5',chapterId:'ch_gse_2',title:'Skill Development Plan',evals:[],objectiveIds:[],legacyDueDate:'2026-07-01',legacySubtasks:[]},
      {id:'cn_gse_6',chapterId:'ch_gse_2',title:'Group Presentation & Debate',evals:[],objectiveIds:[],legacyDueDate:'2026-07-24',legacySubtasks:[]},
    ],
    learningObjectives:[],legacyTopics:[],legacyTasks:[]},
  {id:'macro',name:'Macroeconomics',emoji:'📈',color:'#7C6EF5',risk:'medium',schedule:'T2 16–18h | T3 12–14h',examDate:null,endDate:'2026-07-25',nextAction:'Ôn chắc Ramsey model',note:'Kiến thức thực tế mới đến nửa Ramsey. Catch up!',archived:false,ects:6,grade:null,notes:[],instructor:'',contact:'',location:'',sections:[],attendance:{},
    coursePhases:[{id:'cp_macro_1',title:'Growth Models',startDate:'',endDate:'2026-07-14',order:0},{id:'cp_macro_2',title:'Business Cycles',startDate:'',endDate:'2026-07-25',order:1}],
    chapters:[{id:'ch_macro_1',coursePhaseId:'cp_macro_1',title:'Solow–Ramsey'},{id:'ch_macro_2',coursePhaseId:'cp_macro_2',title:'RBC / DSGE & Cycles'}],
    concepts:[
      {id:'cn_macro_1',chapterId:'ch_macro_1',title:'Solow Growth Model',evals:[{score:80,confidence:4,timestamp:Date.now()-8640000*10,sessionId:null,legacy:true}],objectiveIds:[],legacyDueDate:'',legacySubtasks:[]},
      {id:'cn_macro_2',chapterId:'ch_macro_1',title:'Ramsey Model',evals:[{score:70,confidence:3,timestamp:Date.now()-8640000*9,sessionId:null,legacy:true}],objectiveIds:[],legacyDueDate:'2026-06-24',legacySubtasks:[]},
      {id:'cn_macro_3',chapterId:'ch_macro_2',title:'RBC / DSGE',evals:[{score:75,confidence:3,timestamp:Date.now()-8640000*8,sessionId:null,legacy:true}],objectiveIds:[],legacyDueDate:'2026-07-01',legacySubtasks:[]},
      {id:'cn_macro_4',chapterId:'ch_macro_2',title:'System Dynamics',evals:[],objectiveIds:[],legacyDueDate:'2026-06-23',legacySubtasks:[]},
      {id:'cn_macro_5',chapterId:'ch_macro_2',title:'Goodwin–Minsky–Keen',evals:[],objectiveIds:[],legacyDueDate:'2026-07-25',legacySubtasks:[]},
      {id:'cn_macro_6',chapterId:'ch_macro_2',title:'Business Cycles & Modeling Process',evals:[],objectiveIds:[],legacyDueDate:'2026-07-25',legacySubtasks:[]},
    ],
    learningObjectives:[],legacyTopics:[],legacyTasks:[]}
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
studyPlans:[],
studySessions:[],
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
masterySettings:{alpha:MASTERY_ALPHA_DEFAULT},
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
