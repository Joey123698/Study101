/* ══════════════════════════════════════════════════════════════
   12-decision-engine.js — v1 Decision Engine (deterministic, no AI)

   Answers exactly one question every time StudyOS is opened, or a Course
   is opened: "What should I do right now?" — this is the direct fix for
   the ADHD/decision-fatigue pain point (mở Dashboard hoặc môn học lại
   không biết làm gì trước). Agreed scope for this pass:
     1. Fix: only one Session may be RUNNING system-wide (pause others).
     2. Decision Engine + banner (this file).
     3. Bulk-paste Concept creation (this file: BulkAddConceptsModal).
     4. Current Position field (wired in 08-page-course.js).

   Design choices carried over from the reviewed architecture docs, scoped
   down to fit this app (no Blueprint/YAML import, no Execution Context
   object, no event bus — see chat discussion):
     • Deterministic rule order, first match wins. No AI, no weighted
       scoring — every recommendation must be explainable in one sentence.
     • Nothing here is persisted. computeNextAction() is a pure function
       recomputed fresh from `data` on every render, like calcMastery().
   ══════════════════════════════════════════════════════════════ */

const DECISION_RISK_RANK={critical:0,watch:1,medium:2,good:3};

/* ── Guard: pause every OTHER in_progress Session system-wide before a new
   one starts, freezing accumulatedSeconds exactly like pauseSession() does.
   This is the fix for the parallel-timer bug: starting a Session in Course A
   used to leave an already-running Session in Course B ticking forever. ── */
function pauseAllOtherRunningSessions(courses,exceptCourseId,exceptSessionId,now){
  return (courses||[]).map(c=>({
    ...c,
    sessions:(c.sessions||[]).map(s=>{
      if(c.id===exceptCourseId&&s.id===exceptSessionId)return s; // the one being started — caller sets its own fields
      if(s.status==='in_progress'&&s.activeStartedAt){
        const addedSeconds=Math.floor((now-s.activeStartedAt)/1000);
        return{...s,activeStartedAt:null,accumulatedSeconds:(s.accumulatedSeconds||0)+addedSeconds};
      }
      return s;
    }),
  }));
}

/* ── One-click quick-start for the "môn mờ tịt, chưa setup gì" case: creates
   a minimal Session (title = Concept title, 30' default) already in_progress
   in a single click — no modal, no form. Matches the ADHD-friendly "giảm số
   ô phải điền trước khi bắt đầu" principle already used for Ghi nhanh. ── */
function quickStartSession(data,upd,course,concept){
  const now=Date.now();
  const sessionId=uid();
  const journalEntryId=uid();
  const newSession={id:sessionId,title:concept.title,estimatedDuration:30,objectives:[],conceptIds:[concept.id],resources:[],customTodos:[],currentPosition:'',status:'in_progress',activeStartedAt:now,accumulatedSeconds:0,activeJournalEntryId:journalEntryId,createdAt:now};
  const entry={id:journalEntryId,date:TODAY,courseId:course.id,sessionId,duration:0,reflection:'',questionsRaised:'',actionItems:[],confidenceAfter:0,difficulty:0,notes:'',conceptTouches:[],checklist:[],status:'in_progress'};
  const paused=pauseAllOtherRunningSessions(data.courses||[],course.id,sessionId,now);
  const courses=paused.map(c=>c.id!==course.id?c:{...c,sessions:[...(c.sessions||[]),newSession]});
  upd({courses,journalEntries:[entry,...(data.journalEntries||[])]});
}

/* ── The Decision Engine: deterministic rule order, evaluated top to bottom,
   first match wins. Each rule returns a fully-formed recommendation object
   so the banner never has to re-derive "why". ── */
function computeNextAction(data){
  const courses=(data.courses||[]).filter(c=>!c.archived);

  // Rule 1 — Resume: an in_progress Session already exists (only one can,
  // enforced by pauseAllOtherRunningSessions above).
  for(const course of courses){
    // Same preference as SessionLibraryBlock's `current`: a truly-running
    // session (activeStartedAt set) beats one that's merely status='in_progress'
    // but paused, when both coexist in the same course.
    const session=(course.sessions||[]).find(s=>s.status==='in_progress'&&s.activeStartedAt)||(course.sessions||[]).find(s=>s.status==='in_progress');
    if(session){
      const paused=!session.activeStartedAt;
      return{kind:'resume',course,session,
        reason:paused?'Đang tạm dừng — tiếp tục để không mất mạch.':'Đang học dở — tiếp tục ngay.'};
    }
  }

  // Rule 2 — Setup needed: course rủi ro cao (critical) nhưng CHƯA từng có
  // Session nào — đúng trường hợp "mờ tịt, mở lên không biết bắt đầu đâu".
  const needsSetup=courses.filter(c=>c.risk==='critical'&&(c.sessions||[]).length===0&&(c.concepts||[]).length>0)
    .sort((a,b)=>(daysTo(a.examDate||a.endDate)??999)-(daysTo(b.examDate||b.endDate)??999));
  if(needsSetup.length>0){
    const course=needsSetup[0];
    const chapter=(course.chapters||[])[0];
    const concept=chapter?(course.concepts||[]).find(c=>c.chapterId===chapter.id):null;
    if(concept)return{kind:'setup_needed',course,chapter,concept,
      reason:`${course.name} chưa có Session nào — bắt đầu với concept đầu tiên trong "${chapter.title}".`};
    return{kind:'setup_needed_no_chapter',course,
      reason:`${course.name} đang rủi ro cao nhưng chưa có Chapter/Concept nào — vào môn học để tạo khung trước.`};
  }

  // Rule 3 — Một Session đã lên kế hoạch (planned) sẵn — ưu tiên course rủi
  // ro cao nhất / thi gần nhất, rồi tới Session tạo trước.
  const plannedCandidates=[];
  courses.forEach(course=>(course.sessions||[]).forEach(session=>{if(session.status==='planned')plannedCandidates.push({course,session});}));
  if(plannedCandidates.length>0){
    plannedCandidates.sort((a,b)=>{
      const r=DECISION_RISK_RANK[a.course.risk]-DECISION_RISK_RANK[b.course.risk];if(r!==0)return r;
      const da=daysTo(a.course.examDate||a.course.endDate)??999,db=daysTo(b.course.examDate||b.course.endDate)??999;
      if(da!==db)return da-db;
      return(a.session.createdAt||0)-(b.session.createdAt||0);
    });
    const{course,session}=plannedCandidates[0];
    return{kind:'start_planned',course,session,
      reason:`${course.name} đang rủi ro ${RISK[course.risk]?.label||''} — Session này đã lên kế hoạch sẵn.`};
  }

  // Rule 4 — Review: Concept có Review Priority High mà chưa Session nào phủ.
  const reviewCandidates=[];
  courses.forEach(course=>{
    (course.concepts||[]).forEach(concept=>{
      if(computeReviewPriority(concept,course.examDate,data)==='High'){
        const covered=(course.sessions||[]).some(s=>(s.status==='planned'||s.status==='in_progress')&&(s.conceptIds||[]).includes(concept.id));
        if(!covered)reviewCandidates.push({course,concept});
      }
    });
  });
  if(reviewCandidates.length>0){
    reviewCandidates.sort((a,b)=>DECISION_RISK_RANK[a.course.risk]-DECISION_RISK_RANK[b.course.risk]);
    const{course,concept}=reviewCandidates[0];
    return{kind:'review',course,concept,
      reason:`"${concept.title}" đang cần ôn gấp (Review Priority cao) và chưa có Session nào phủ.`};
  }

  // Rule 5 — Fallback: không có gì khẩn cấp.
  return{kind:'idle',reason:'Không có gì gấp lúc này — bạn có thể tự chọn việc muốn làm.'};
}

/* ── The one visual home of the Decision Engine's output (ADR-003: "Dashboard
   does not decide, it communicates"). Used on both Dashboard (global, no
   onlyCourseId) and Course Detail (onlyCourseId set — stays silent unless the
   recommendation is actually about THIS course, since Dashboard already
   covers the global case). ── */
function NextActionBanner({data,upd,awardXP,nav,onlyCourseId}){
  const next=computeNextAction(data);
  if(onlyCourseId&&next.course?.id!==onlyCourseId)return null;
  const updateCourseById=(courseId,ch)=>upd({courses:data.courses.map(c=>c.id===courseId?{...c,...ch}:c)});

  if(next.kind==='idle')return<div className="card" style={{marginBottom:10,textAlign:'center',padding:'12px',border:'1px dashed var(--bdr)'}}>
    <span style={{fontSize:12,color:'var(--mu)'}}>✅ {next.reason}</span>
  </div>;

  const{course}=next;
  const cardStyle={marginBottom:10,border:`1.5px solid ${course.color}55`,background:course.color+'0d'};

  if(next.kind==='resume'){
    const isPaused=!next.session.activeStartedAt;
    return<div className="card" style={cardStyle}>
      <div style={{fontSize:10,fontWeight:700,color:course.color,marginBottom:4,letterSpacing:'.03em'}}>📍 TIẾP THEO</div>
      <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{course.emoji} {next.session.title}</div>
      {next.session.currentPosition&&<div style={{fontSize:11,color:'var(--mu)',marginBottom:4}}>📍 Đang ở: {next.session.currentPosition}</div>}
      <div style={{fontSize:11,color:'var(--mu)',marginBottom:8}}>{next.reason}</div>
      <button className="btn-p" style={{width:'100%',justifyContent:'center',opacity:(!isPaused&&!nav)?.6:1}}
        onClick={()=>{if(isPaused)resumeSession(course,next.session,ch=>updateCourseById(course.id,ch),upd,data);else if(nav)nav('courses',{courseId:course.id});}}>
        {isPaused?'▶ Tiếp tục ngay':(nav?'→ Vào Session đang chạy':'✓ Đang chạy — xem bên dưới')}
      </button>
    </div>;
  }

  if(next.kind==='start_planned'){
    return<div className="card" style={cardStyle}>
      <div style={{fontSize:10,fontWeight:700,color:course.color,marginBottom:4,letterSpacing:'.03em'}}>📍 TIẾP THEO</div>
      <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{course.emoji} {next.session.title}</div>
      <div style={{fontSize:11,color:'var(--mu)',marginBottom:8}}>{next.reason}</div>
      <button className="btn-p" style={{width:'100%',justifyContent:'center'}}
        onClick={()=>startSession(course,next.session,ch=>updateCourseById(course.id,ch),upd,data,awardXP)}>▶ Bắt đầu học</button>
    </div>;
  }

  if(next.kind==='setup_needed'){
    return<div className="card" style={{...cardStyle,border:'1.5px solid var(--crBdr)',background:'var(--crb)'}}>
      <div style={{fontSize:10,fontWeight:700,color:'var(--cr)',marginBottom:4,letterSpacing:'.03em'}}>📍 TIẾP THEO — CHƯA SETUP</div>
      <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{course.emoji} {next.concept.title}</div>
      <div style={{fontSize:11,color:'var(--mu)',marginBottom:8}}>{next.reason}</div>
      <button className="btn-p" style={{width:'100%',justifyContent:'center'}} onClick={()=>quickStartSession(data,upd,course,next.concept)}>⚡ Tạo Session nhanh & bắt đầu</button>
    </div>;
  }

  if(next.kind==='setup_needed_no_chapter'){
    return<div className="card" style={{...cardStyle,border:'1.5px solid var(--crBdr)',background:'var(--crb)'}}>
      <div style={{fontSize:10,fontWeight:700,color:'var(--cr)',marginBottom:4,letterSpacing:'.03em'}}>📍 TIẾP THEO — CHƯA SETUP</div>
      <div style={{fontSize:12,marginBottom:nav?8:0}}>{next.reason}</div>
      {nav&&<button className="btn-p" style={{width:'100%',justifyContent:'center'}} onClick={()=>nav('courses',{courseId:course.id})}>→ Vào {course.name}</button>}
    </div>;
  }

  if(next.kind==='review'){
    return<div className="card" style={cardStyle}>
      <div style={{fontSize:10,fontWeight:700,color:course.color,marginBottom:4,letterSpacing:'.03em'}}>📍 TIẾP THEO — ÔN GẤP</div>
      <div style={{fontSize:13,fontWeight:600,marginBottom:2}}>{course.emoji} {next.concept.title}</div>
      <div style={{fontSize:11,color:'var(--mu)',marginBottom:8}}>{next.reason}</div>
      <button className="btn-p" style={{width:'100%',justifyContent:'center'}} onClick={()=>quickStartSession(data,upd,course,next.concept)}>⚡ Tạo Session ôn nhanh</button>
    </div>;
  }

  return null;
}

/* ── Quick Session (course-level, no Concept picked): "Tên. Start. Hết."
   For when you just want to log a study block without picking Concepts up
   front — the freeform counterpart to quickStartSession's Concept-scoped
   version above. ── */
function quickStartFreeformSession(data,upd,course,title){
  const now=Date.now();
  const sessionId=uid();
  const journalEntryId=uid();
  const newSession={id:sessionId,title,estimatedDuration:30,objectives:[],conceptIds:[],resources:[],customTodos:[],currentPosition:'',status:'in_progress',activeStartedAt:now,accumulatedSeconds:0,activeJournalEntryId:journalEntryId,createdAt:now};
  const entry={id:journalEntryId,date:TODAY,courseId:course.id,sessionId,duration:0,reflection:'',questionsRaised:'',actionItems:[],confidenceAfter:0,difficulty:0,notes:'',conceptTouches:[],checklist:[],status:'in_progress'};
  const paused=pauseAllOtherRunningSessions(data.courses||[],course.id,sessionId,now);
  const courses=paused.map(c=>c.id!==course.id?c:{...c,sessions:[...(c.sessions||[]),newSession]});
  upd({courses,journalEntries:[entry,...(data.journalEntries||[])]});
}

/* ── How many days since the last COMPLETED Session, anywhere. Powers the
   Mission screen's "Recovery tone" — coming back after a gap should feel
   welcoming, not accusatory (no "5 days overdue" language). ── */
function daysSinceLastActivity(data){
  const completed=(data.journalEntries||[]).filter(j=>j.status==='completed');
  if(completed.length===0)return null;
  const lastDate=completed.reduce((max,j)=>j.date>max?j.date:max,completed[0].date);
  return Math.floor((new Date(TODAY)-new Date(lastDate))/86400000);
}

/* ── Mission screen — the new default landing page (replaces Dashboard in
   that role; Dashboard becomes "review", Mission becomes "do"). Shows the
   same Decision Engine banner front and center, plus a single "Mission hôm
   nay" (reuses data.dailyFocus[TODAY].mustDo — no new data model, just a
   simpler view of an existing field), plus a Recovery-toned greeting when
   returning after ≥5 days away. ── */
function MissionScreen({data,upd,awardXP,nav}){
  const daysSince=daysSinceLastActivity(data);
  const isReturning=daysSince!==null&&daysSince>=5;
  const hour=new Date().getHours();
  const greeting=hour<12?'Chào buổi sáng ☀️':hour<18?'Chào buổi chiều 👋':'Chào buổi tối 🌙';
  const fd=getDayFocus(data,TODAY);
  const [editing,setEditing]=useState(false);
  const [missionText,setMissionText]=useState('');
  const openEdit=()=>{setMissionText(fd.mustDo?.text||'');setEditing(true);};
  const saveMission=()=>{
    const nfd={...fd,mustDo:{text:missionText.trim(),done:fd.mustDo?.done||false}};
    upd({dailyFocus:{...(data.dailyFocus||{}),[TODAY]:nfd}});
    setEditing(false);
  };
  const togMission=()=>{
    const nfd={...fd,mustDo:{...(fd.mustDo||{text:''}),done:!fd.mustDo?.done}};
    upd({dailyFocus:{...(data.dailyFocus||{}),[TODAY]:nfd}});
  };
  return<div>
    <div style={{textAlign:'center',marginBottom:14}}>
      <div style={{fontSize:14,color:'var(--mu)'}}>{isReturning?'Chào mừng trở lại 👋':greeting}</div>
      {isReturning&&<div style={{fontSize:11,color:'var(--mu)',marginTop:3}}>Đã {daysSince} ngày chưa học — không sao cả, hôm nay chỉ cần bắt đầu lại 1 buổi thôi.</div>}
    </div>
    <NextActionBanner data={data} upd={upd} awardXP={awardXP} nav={nav}/>
    <div className="card" style={{marginBottom:10}}>
      <div className="flex-sb" style={{marginBottom:8}}>
        <div className="lbl" style={{margin:0}}>🎯 MISSION HÔM NAY</div>
        {!editing&&<button className="btn-g btn-sm" onClick={openEdit}>✏️</button>}
      </div>
      {editing?<div style={{display:'flex',gap:6}}>
        <input className="inp" autoFocus value={missionText} onChange={e=>setMissionText(e.target.value)} placeholder="Việc quan trọng nhất hôm nay..." style={{flex:1}} onKeyDown={e=>e.key==='Enter'&&saveMission()}/>
        <button className="btn-p btn-sm" onClick={saveMission}>Lưu</button>
      </div>
      :fd.mustDo?.text
        ?<div style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}} onClick={togMission}>
          <Tick done={fd.mustDo.done} color="var(--acc)" onClick={togMission}/>
          <span style={{fontSize:14,fontWeight:600,textDecoration:fd.mustDo.done?'line-through':'none',opacity:fd.mustDo.done?.55:1}}>{fd.mustDo.text}</span>
        </div>
        :<div style={{textAlign:'center',cursor:'pointer',padding:'6px 0'}} onClick={openEdit}><span className="tx-dm">+ Đặt 1 việc quan trọng nhất hôm nay</span></div>}
    </div>
    <div style={{textAlign:'center'}}>
      <button className="btn-g btn-sm" onClick={()=>nav('dashboard')}>Xem Dashboard đầy đủ →</button>
    </div>
  </div>;}

/* ── Bulk-paste Concept creation — for courses ở giai đoạn ôn thi / mờ tịt
   cần dựng cả khung concept một lúc. Bạn vẫn tự lên ChatGPT xin roadmap
   (ranh giới không đổi: ChatGPT lo Teaching, StudyOS chỉ Execution) — cái
   này chỉ thay việc gõ tay từng Concept bằng dán 1 lần. Mỗi dòng = 1
   Concept; tự bỏ bullet (-, *, •) và số thứ tự (1. / 1)) nếu có. ── */
function BulkAddConceptsModal({chapterTitle,onSave,onClose}){
  const [text,setText]=useState('');
  const parseLines=(raw)=>raw.split('\n').map(l=>l.replace(/^\s*[-*•]\s*/,'').replace(/^\s*\d+[.)]\s*/,'').trim()).filter(Boolean);
  const preview=parseLines(text);
  const save=()=>{if(preview.length===0)return;onSave(preview);};
  return<div className="ov" onClick={onClose}><div className="modal" style={{maxWidth:440}} onClick={e=>e.stopPropagation()}>
    <div className="flex-sb" style={{marginBottom:10}}><span style={{fontSize:14,fontWeight:600}}>📋 Dán nhanh nhiều Concept</span><button className="btn-g btn-sm" onClick={onClose}>✕</button></div>
    <div className="tx-dm" style={{marginBottom:6}}>Vào "{chapterTitle}" — dán danh sách concept (từ ChatGPT hoặc ghi chú), mỗi dòng 1 concept.</div>
    <textarea value={text} onChange={e=>setText(e.target.value)} rows={8} placeholder={"VD:\n- Maximum Likelihood Estimation\n- Instrumental Variables\n- Heteroskedasticity"}
      style={{width:'100%',background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:8,padding:'8px 10px',color:'var(--tx)',fontSize:12,outline:'none',fontFamily:'inherit',resize:'vertical',boxSizing:'border-box',marginBottom:10}} autoFocus/>
    {preview.length>0&&<div style={{marginBottom:12}}>
      <div className="tx-dm" style={{marginBottom:5,fontWeight:600}}>Xem trước ({preview.length} concept):</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
        {preview.map((t,i)=><span key={i} style={{fontSize:10,background:'var(--acc2)',color:'var(--acc)',borderRadius:5,padding:'3px 7px'}}>{t}</span>)}
      </div>
    </div>}
    <div style={{display:'flex',gap:8}}>
      <button className="btn-p" style={{flex:1,justifyContent:'center',opacity:preview.length===0?.5:1}} disabled={preview.length===0} onClick={save}>+ Thêm {preview.length>0?preview.length+' ':''}Concept</button>
      <button className="btn-g" onClick={onClose}>Huỷ</button>
    </div>
  </div></div>;}
