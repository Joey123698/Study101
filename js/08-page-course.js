/* ══════════════════════════════════════════════════════════════
   08-page-course.js — V12 Course Detail: Knowledge-based architecture
   Chapters → Concepts, static mastery display + lightweight Quick Eval.
   Full Study Session flow (Start/Todos/Reflection/Complete) is Phase 2 —
   Quick Eval here is the ADHD-friendly "Ghi nhanh" shortcut agreed on,
   giving Concepts a working interaction even before the full flow exists.
   ══════════════════════════════════════════════════════════════ */

/* ── Course Editor (updated: v12 base object, no more topics/tasks) ── */
function CourseEditorModal({existing,onSave,onClose}){
  const [f,setF]=useState(existing?{name:existing.name,emoji:existing.emoji,color:existing.color,risk:existing.risk,schedule:existing.schedule||'',examDate:existing.examDate||'',endDate:existing.endDate||'',nextAction:existing.nextAction||'',note:existing.note||'',ects:existing.ects??6,grade:existing.grade??'',instructor:existing.instructor||'',contact:existing.contact||'',location:existing.location||''}:{name:'',emoji:'📚',color:'#7C6EF5',risk:'medium',schedule:'',examDate:'',endDate:'',nextAction:'',note:'',ects:6,grade:'',instructor:'',contact:'',location:''});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const save=()=>{
    if(!f.name.trim())return;
    const base=existing||{id:uid(),archived:false,notes:[],sections:[],attendance:{},scheduleDOW:[],coursePhases:[],chapters:[],concepts:[],learningObjectives:[],legacyTopics:[],legacyTasks:[]};
    const grade=f.grade===''?null:parseFloat(f.grade);
    onSave({...base,...f,examDate:f.examDate||null,endDate:f.endDate||null,ects:parseFloat(f.ects)||6,grade});
  };
  const band=f.grade!==''?gradeBand(parseFloat(f.grade)):null;
  return<div className="ov" onClick={onClose}><div className="modal" style={{maxWidth:440}} onClick={e=>e.stopPropagation()}>
    <div className="flex-sb" style={{marginBottom:14}}><span style={{fontSize:15,fontWeight:500}}>{existing?'✏️ Sửa môn học':'📚 Thêm môn học mới'}</span><button className="btn-g btn-sm" onClick={onClose}>✕</button></div>
    <div style={{display:'grid',gridTemplateColumns:'52px 1fr',gap:8,marginBottom:10}}>
      <div><div className="tx-dm" style={{marginBottom:2}}>Icon</div><input className="inp" value={f.emoji} onChange={e=>s('emoji',e.target.value)} style={{textAlign:'center',fontSize:18,padding:'5px'}}/></div>
      <div><div className="tx-dm" style={{marginBottom:2}}>Tên môn *</div><input className="inp" value={f.name} onChange={e=>s('name',e.target.value)} placeholder="VD: Microeconomics..."/></div>
    </div>
    <div className="tx-dm" style={{marginBottom:4}}>Mức độ ưu tiên</div>
    <div style={{display:'flex',gap:5,marginBottom:10}}>
      {Object.entries(RISK).map(([k,r])=><button key={k} onClick={()=>s('risk',k)} style={{flex:1,padding:'5px 3px',borderRadius:6,cursor:'pointer',fontSize:10,fontWeight:700,background:f.risk===k?(r.cls.includes('cr')?'var(--crb)':r.cls.includes('wa')?'var(--wab)':r.cls.includes('su')?'var(--sub)':'var(--inb)'):'var(--card)',border:`1.5px solid ${f.risk===k?r.c:'var(--bdr)'}`,color:f.risk===k?r.c:'var(--mu)'}}>{r.label}</button>)}
    </div>
    <div className="tx-dm" style={{marginBottom:4}}>Màu sắc</div>
    <div style={{display:'flex',gap:7,marginBottom:10}}>{PAL.map(c=><div key={c} onClick={()=>s('color',c)} style={{width:24,height:24,borderRadius:'50%',background:c,cursor:'pointer',border:`3px solid ${f.color===c?'#fff':'transparent'}`}}/>)}</div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
      <div><div className="tx-dm" style={{marginBottom:2}}>📍 Địa điểm học</div><input className="inp" value={f.location} onChange={e=>s('location',e.target.value)} placeholder="VD: HZO 10, Raum 201"/></div>
      <div><div className="tx-dm" style={{marginBottom:2}}>📅 Lịch học</div><input className="inp" value={f.schedule} onChange={e=>s('schedule',e.target.value)} placeholder="VD: T2 16–18h"/></div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
      <div><div className="tx-dm" style={{marginBottom:2}}>👨‍🏫 Giảng viên</div><input className="inp" value={f.instructor} onChange={e=>s('instructor',e.target.value)} placeholder="Tên giảng viên"/></div>
      <div><div className="tx-dm" style={{marginBottom:2}}>📧 Liên hệ</div><input className="inp" value={f.contact} onChange={e=>s('contact',e.target.value)} placeholder="Email / Moodle..."/></div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
      <div><div className="tx-dm" style={{marginBottom:2}}>Ngày thi</div><input type="date" className="inp" value={f.examDate} onChange={e=>s('examDate',e.target.value)}/></div>
      <div><div className="tx-dm" style={{marginBottom:2}}>Ngày kết thúc</div><input type="date" className="inp" value={f.endDate} onChange={e=>s('endDate',e.target.value)}/></div>
    </div>
    <div style={{background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:8,padding:'10px',marginBottom:10}}>
      <div className="lbl" style={{marginBottom:7}}>🎓 ĐIỂM SỐ (cho GPA tự động)</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        <div><div className="tx-dm" style={{marginBottom:2}}>ECTS (tín chỉ)</div><input type="number" className="inp" value={f.ects} onChange={e=>s('ects',e.target.value)} min="1" max="30" step="1"/></div>
        <div><div className="tx-dm" style={{marginBottom:2}}>Điểm thi (1.0–5.0)</div><input type="number" className="inp" value={f.grade} onChange={e=>s('grade',e.target.value)} min="1.0" max="5.0" step="0.1" placeholder="Để trống nếu chưa thi"/></div>
      </div>
      {band&&<div style={{marginTop:7,fontSize:11,color:band.color,fontWeight:600}}>● {band.label}</div>}
    </div>
    <div className="tx-dm" style={{marginBottom:2}}>Bước tiếp theo</div>
    <input className="inp" value={f.nextAction} onChange={e=>s('nextAction',e.target.value)} placeholder="Việc cần làm ngay..." style={{marginBottom:8}}/>
    <div className="tx-dm" style={{marginBottom:2}}>Ghi chú</div>
    <textarea value={f.note} onChange={e=>s('note',e.target.value)} placeholder="Ghi chú quan trọng..." rows={2} style={{width:'100%',background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:8,padding:'7px 10px',color:'var(--tx)',fontSize:13,outline:'none',fontFamily:'inherit',resize:'vertical',marginBottom:14}}/>
    <div style={{display:'flex',gap:8}}><button className="btn-p" style={{flex:1,justifyContent:'center'}} onClick={save}>{existing?'Lưu thay đổi':'Thêm môn học'}</button><button className="btn-g" onClick={onClose}>Huỷ</button></div>
  </div></div>;}

/* ── Attendance — KEPT SEPARATE from Study Session by design (classroom vs self-study) ── */
function CourseAttendance({course,onUpdate}){
  const [weekOffset,setWeekOffset]=useState(0);
  const [expandDate,setExpandDate]=useState(null);
  const [showDowPicker,setShowDowPicker]=useState(false);
  const wd=weekDates();
  const baseWd=wd.map(d=>{const dt=new Date(d+'T12:00:00');dt.setDate(dt.getDate()+weekOffset*7);return toLocalDateStr(dt);});
  const weekLabel=weekOffset===0?'Tuần này':`${weekOffset<0?Math.abs(weekOffset)+' tuần trước':''}`;
  const att=course.attendance||{};
  const scheduleDOW=course.scheduleDOW||[];
  const togAttend=(date)=>{const cur=att[date]||{attended:false,note:''};const na={...att,[date]:{...cur,attended:!cur.attended}};onUpdate({attendance:na});};
  const setNote=(date,note)=>onUpdate({attendance:{...att,[date]:{...(att[date]||{attended:false}),note}}});
  const togDow=(d)=>onUpdate({scheduleDOW:scheduleDOW.includes(d)?scheduleDOW.filter(x=>x!==d):[...scheduleDOW,d].sort()});
  const attendedCount=baseWd.filter(d=>att[d]?.attended).length;
  return<div className="card" style={{marginBottom:10}}>
    <div className="flex-sb" style={{marginBottom:8}}>
      <div className="lbl" style={{margin:0}}>📋 ĐIỂM DANH <span style={{fontWeight:400,color:'var(--dm)',fontSize:9}}>(lớp học — độc lập với tự học)</span></div>
      <div style={{display:'flex',gap:6,alignItems:'center'}}>
        <span style={{fontSize:11,color:'var(--su)',fontWeight:600}}>{attendedCount}/7</span>
        <button className="btn-g btn-sm" onClick={()=>setWeekOffset(w=>w-1)}>‹</button>
        <span style={{fontSize:10,color:weekOffset===0?'var(--acc)':'var(--tx)',fontWeight:weekOffset===0?600:400}}>{weekLabel}</span>
        <button className="btn-g btn-sm" onClick={()=>setWeekOffset(w=>Math.min(0,w+1))} disabled={weekOffset>=0} style={{opacity:weekOffset>=0?.3:1}}>›</button>
        <button className="btn-g btn-sm" onClick={()=>setShowDowPicker(s=>!s)} title="Cấu hình ngày học trong tuần">⚙️</button>
      </div>
    </div>
    {showDowPicker&&<div style={{background:'var(--sur)',borderRadius:8,padding:'8px',marginBottom:8}}>
      <div style={{fontSize:10,color:'var(--mu)',marginBottom:5}}>📅 Ngày học cố định trong tuần — bỏ chọn hết nếu đã kết thúc khóa trên lớp:</div>
      <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
        {DV.map((d,i)=><button key={i} onClick={()=>togDow(i)} style={{width:30,height:30,borderRadius:6,border:`1.5px solid ${scheduleDOW.includes(i)?course.color:'var(--bdr)'}`,background:scheduleDOW.includes(i)?course.color+'22':'transparent',color:scheduleDOW.includes(i)?course.color:'var(--mu)',cursor:'pointer',fontSize:10,fontWeight:600}}>{d}</button>)}
      </div>
    </div>}
    <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:8}}>
      {baseWd.map(date=>{
        const dow=new Date(date+'T12:00:00').getDay();
        const isClassDay=scheduleDOW.includes(dow);
        const a=att[date]||{};const isT=date===TODAY;
        return<div key={date} style={{textAlign:'center'}}>
          <div style={{fontSize:9,color:isT?'var(--acc)':'var(--dm)',fontWeight:isT?700:400,marginBottom:2}}>{['CN','T2','T3','T4','T5','T6','T7'][dow]}</div>
          <div style={{fontSize:9,color:isT?'var(--acc)':'var(--dm)',marginBottom:4}}>{new Date(date+'T12:00:00').getDate()}/{new Date(date+'T12:00:00').getMonth()+1}</div>
          <div onClick={()=>togAttend(date)} style={{width:28,height:28,borderRadius:6,
            border:`1.5px solid ${a.attended?course.color:isClassDay?course.color+'88':'var(--bdr)'}`,
            background:a.attended?course.color+'33':isClassDay?course.color+'10':'transparent',
            cursor:'pointer',margin:'auto',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,
            boxShadow:isT?`0 0 0 1.5px ${course.color}55`:'none'}}
            title={a.attended?'Đã đi học — click để bỏ':isClassDay?'Ngày học theo lịch — click để điểm danh':'Click để đánh dấu đi học'}>
            {a.attended?'✓':isClassDay?'·':''}
          </div>
          <div onClick={()=>setExpandDate(expandDate===date?null:date)}
            style={{fontSize:8,color:a.note?course.color:'var(--dm)',cursor:'pointer',marginTop:2,textAlign:'center',opacity:a.attended||a.note?1:.4}}>
            {a.note?'📝':'+ ghi'}
          </div>
        </div>;
      })}
    </div>
    {expandDate&&<div style={{background:'var(--sur)',borderRadius:8,padding:'8px',marginTop:4}}>
      <div style={{fontSize:10,color:'var(--mu)',marginBottom:4}}>📝 Nội dung buổi học {fmt(expandDate)}:</div>
      <textarea value={att[expandDate]?.note||''} onChange={e=>setNote(expandDate,e.target.value)}
        placeholder="Hôm nay học về nội dung gì? Điểm cần nhớ? Bài tập về nhà?..."
        rows={2} style={{width:'100%',background:'var(--card)',border:'1px solid var(--bdr)',borderRadius:6,padding:'6px',color:'var(--tx)',fontSize:11,outline:'none',fontFamily:'inherit',resize:'vertical',boxSizing:'border-box'}}/>
    </div>}
    {scheduleDOW.length===0&&<div className="tx-dm" style={{fontSize:10,marginTop:4}}>💡 Nhấn ⚙️ để đặt ngày học cố định trong tuần — vẫn có thể điểm danh tự do bất kỳ ngày nào.</div>}
  </div>;}

/* ── Phase Gantt — now renders REAL course.coursePhases (structural unit), not a decorative list.
   Width shows date range, fill % shows computed mastery progress within that Phase. ── */
function CoursePhaseGantt({course,onUpdate,data}){
  const [showAdd,setShowAdd]=useState(false);
  const [editId,setEditId]=useState(null);
  const [f,setF]=useState({title:'',startDate:TODAY,endDate:TODAY});
  const coursePhases=(course.coursePhases||[]).slice().sort((a,b)=>(a.order||0)-(b.order||0));
  const start=coursePhases.length?new Date(Math.min(...coursePhases.map(p=>new Date(p.startDate||p.endDate||TODAY)))):new Date();
  start.setHours(0,0,0,0);
  const end=new Date(course.examDate||course.endDate||coursePhases[coursePhases.length-1]?.endDate||'2026-07-31');
  const totalMs=Math.max(1,end-start);
  const pOf=(ds)=>{if(!ds)return 0;const d=new Date(ds);d.setHours(0,0,0,0);return Math.max(0,Math.min(100,(d-start)/totalMs*100));};
  const wOf=(s,e)=>Math.max(2,pOf(e)-pOf(s||e));
  const save=()=>{
    if(!f.title.trim())return;
    if(editId){onUpdate({coursePhases:coursePhases.map(p=>p.id===editId?{...p,...f}:p)});}
    else{onUpdate({coursePhases:[...coursePhases,{id:uid(),...f,order:coursePhases.length}]});}
    setF({title:'',startDate:TODAY,endDate:TODAY});setShowAdd(false);setEditId(null);
  };
  const delPhase=(id)=>{
    // Guard: don't silently orphan Chapters that reference this Phase
    const hasChapters=(course.chapters||[]).some(ch=>ch.coursePhaseId===id);
    if(hasChapters&&!confirm('Phase này có Chapter bên trong. Xoá Phase sẽ để Chapter đó không thuộc Phase nào. Tiếp tục?'))return;
    onUpdate({coursePhases:coursePhases.filter(p=>p.id!==id)});
  };
  return<div className="card" style={{marginBottom:10}}>
    <div className="flex-sb" style={{marginBottom:8}}>
      <div className="lbl" style={{margin:0}}>📊 PHASE TRONG MÔN</div>
      <button className="btn-g btn-sm" onClick={()=>{setShowAdd(s=>!s);setEditId(null);setF({title:'',startDate:TODAY,endDate:TODAY});}}>+ Thêm Phase</button>
    </div>
    {showAdd&&<div style={{background:'var(--sur)',borderRadius:8,padding:'10px',marginBottom:10}}>
      <input className="inp" value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))} placeholder="VD: Foundation, Part A..." style={{marginBottom:6,fontSize:12}}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:8}}>
        <div><div className="tx-dm" style={{marginBottom:2}}>Bắt đầu</div><input type="date" className="inp" value={f.startDate} onChange={e=>setF(p=>({...p,startDate:e.target.value}))} style={{fontSize:11}}/></div>
        <div><div className="tx-dm" style={{marginBottom:2}}>Kết thúc</div><input type="date" className="inp" value={f.endDate} onChange={e=>setF(p=>({...p,endDate:e.target.value}))} style={{fontSize:11}}/></div>
      </div>
      <div style={{display:'flex',gap:6}}><button className="btn-p btn-sm" onClick={save}>{editId?'Lưu':'Thêm'}</button><button className="btn-g btn-sm" onClick={()=>{setShowAdd(false);setEditId(null);}}>Huỷ</button></div>
    </div>}
    {coursePhases.length===0&&!showAdd&&<div className="tx-dm" style={{textAlign:'center',padding:'10px'}}>Chưa có Phase nào — bấm "+ Thêm Phase" để tạo</div>}
    {coursePhases.map(p=>{
      const prog=phaseProgress(p,course.chapters||[],course.concepts||[],data);
      return<div key={p.id} className="gantt2-row">
        <div className="gantt2-label" onClick={()=>{setEditId(p.id);setF({title:p.title,startDate:p.startDate||TODAY,endDate:p.endDate||TODAY});setShowAdd(true);}} style={{cursor:'pointer'}} title="Click để sửa">{p.title}</div>
        <div className="gantt2-track">
          <div className="gantt2-bar" style={{left:`${pOf(p.startDate)}%`,width:`${wOf(p.startDate,p.endDate)}%`,background:course.color,position:'relative',overflow:'hidden'}} title={`${fmt(p.startDate)} → ${fmt(p.endDate)} · ${prog}% mastery`}>
            <div style={{position:'absolute',inset:0,background:'rgba(0,0,0,.35)',width:`${100-prog}%`,right:0,left:'auto'}}/>
            <span style={{position:'relative'}}>{p.title} · {prog}%</span>
          </div>
        </div>
        <button onClick={()=>delPhase(p.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:13,opacity:.4,marginLeft:6}}>×</button>
      </div>;})}
  </div>;}

/* ── Sessions placeholder — Learning Objectives moved here per approved v12.1 spec
   (Session is the learning unit; Objectives now live inside Session, not Course).
   Full Session blueprint editor + "Current Session" entry point is Bước 2.
   Any pre-existing course-level objectives are preserved read-only below. ── */
function SessionsPlaceholderBlock({course}){
  const legacy=course.legacyLearningObjectives||[];
  const sessions=course.sessions||[];
  return<div className="card" style={{marginBottom:10,borderStyle:'dashed'}}>
    <div className="flex-sb" style={{marginBottom:legacy.length?8:0}}>
      <div className="lbl" style={{margin:0}}>🎯 SESSIONS & LEARNING OBJECTIVES</div>
      <span style={{fontSize:9,background:'var(--acc2)',color:'var(--acc)',borderRadius:4,padding:'2px 6px',fontWeight:600}}>Sắp ra mắt — Bước 2</span>
    </div>
    <div className="tx-dm" style={{marginBottom:legacy.length?8:0}}>
      Session sẽ là đơn vị học chính: 1 Session = 1 buổi học, phủ nhiều Concept, có Objectives riêng, resources, và nút "Bắt đầu học". {sessions.length>0&&`Hiện có ${sessions.length} session blueprint.`}
    </div>
    {legacy.length>0&&<div style={{marginTop:8,paddingTop:8,borderTop:'1px solid var(--bdr)'}}>
      <div className="tx-dm" style={{marginBottom:5,fontWeight:600}}>📥 Objectives cũ (sẽ gắn vào Session khi Bước 2 hoàn thành):</div>
      {legacy.map((o,i)=><div key={o.id} style={{fontSize:11,color:'var(--mu)',padding:'3px 0'}}>{i+1}. {o.text}</div>)}
    </div>}
  </div>;}

/* ── Concept Touch modal — the ADHD-friendly "Ghi nhanh" shortcut.
   Rate Understanding + Confidence (1-5 each, tap-to-select) → one touch
   logged. No session, no todos, no friction. Mastery is derived from the
   history of these touches via configurable EMA (04-mastery-engine.js). ── */
function ConceptTouchModal({concept,color,onSave,onClose}){
  const [understanding,setUnderstanding]=useState(latestUnderstanding(concept.touches||[])||3);
  const [confidence,setConfidence]=useState(latestConfidence(concept.touches||[])||3);
  return<div className="ov" onClick={onClose}><div className="modal" style={{maxWidth:380}} onClick={e=>e.stopPropagation()}>
    <div className="flex-sb" style={{marginBottom:4}}><span style={{fontSize:14,fontWeight:600}}>⚡ Ghi nhanh</span><button className="btn-g btn-sm" onClick={onClose}>✕</button></div>
    <div style={{fontSize:12,color:'var(--mu)',marginBottom:18}}>{concept.title}</div>

    <div className="tx-dm" style={{marginBottom:6}}>🧠 Understanding — bạn hiểu đến đâu?</div>
    <div style={{display:'flex',gap:6,marginBottom:18}}>
      {[1,2,3,4,5].map(n=><button key={n} onClick={()=>setUnderstanding(n)}
        style={{flex:1,padding:'10px 0',borderRadius:8,border:`1.5px solid ${understanding>=n?color:'var(--bdr)'}`,background:understanding>=n?color+'22':'transparent',color:understanding>=n?color:'var(--dm)',cursor:'pointer',fontSize:14,fontWeight:700}}>{n}</button>)}
    </div>

    <div className="tx-dm" style={{marginBottom:6}}>⭐ Confidence — bạn tự tin đến đâu?</div>
    <div style={{display:'flex',gap:6,marginBottom:22}}>
      {[1,2,3,4,5].map(n=><button key={n} onClick={()=>setConfidence(n)}
        style={{flex:1,padding:'10px 0',borderRadius:8,border:`1.5px solid ${confidence>=n?'var(--wa)':'var(--bdr)'}`,background:confidence>=n?'var(--wab)':'transparent',color:confidence>=n?'var(--wa)':'var(--dm)',cursor:'pointer',fontSize:14,fontWeight:700}}>{n}</button>)}
    </div>

    <button className="btn-p" style={{width:'100%',justifyContent:'center'}} onClick={()=>{onSave(understanding,confidence);onClose();}}>Lưu đánh giá</button>
  </div></div>;}

/* ── Concept row: mastery bar + status + review priority + touch + history sparkline ── */
function ConceptRow({concept,color,examDate,data,onTouch,onEdit,onDelete}){
  const [showHistory,setShowHistory]=useState(false);
  const touches=concept.touches||[];
  const mastery=calcMastery(touches,data);
  const status=deriveConceptStatus(concept,examDate,data);
  const meta=STATUS_META[status];
  const reviewPriority=computeReviewPriority(concept,examDate,data);
  const rpMeta=REVIEW_PRIORITY_META[reviewPriority];
  const conf=latestConfidence(touches);
  const history=[...touches].sort((a,b)=>a.timestamp-b.timestamp);
  return<div style={{padding:'8px 0',borderBottom:'1px solid var(--bdr)'}}>
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <span style={{fontSize:13,flexShrink:0}}>{meta.emoji}</span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
          <span style={{fontSize:12,fontWeight:500}}>{concept.title}</span>
          {conf>0&&<span style={{fontSize:9,color:'var(--dm)'}}>{'⭐'.repeat(conf)}</span>}
          {reviewPriority!=='None'&&reviewPriority!=='Low'&&<span title={rpMeta.label} style={{fontSize:9,background:rpMeta.color+'22',color:rpMeta.color,borderRadius:4,padding:'1px 5px',fontWeight:700}}>{rpMeta.emoji} {rpMeta.label}</span>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{flex:1}}><Bar v={mastery} color={meta.color}/></div>
          <span style={{fontSize:10,color:meta.color,fontWeight:700,minWidth:30,textAlign:'right'}}>{mastery}%</span>
        </div>
        <div style={{fontSize:9,color:meta.color,marginTop:2}}>{meta.label}{history.length>0&&<span style={{color:'var(--dm)'}}> · {history.length} lần đánh giá</span>}
          {history.length>1&&<span onClick={()=>setShowHistory(s=>!s)} style={{color:'var(--acc)',cursor:'pointer',marginLeft:6}}>{showHistory?'ẩn history ▲':'xem history ▼'}</span>}
        </div>
      </div>
      <button onClick={onTouch} title="Ghi nhanh đánh giá" style={{background:'var(--acc2)',border:'1px solid var(--acc3)',borderRadius:7,cursor:'pointer',fontSize:11,padding:'4px 8px',color:'var(--acc)',fontWeight:600,flexShrink:0}}>⚡ Ghi nhanh</button>
      <button onClick={onEdit} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:11,opacity:.5}}>✏️</button>
      <button onClick={onDelete} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:13,opacity:.35}}>×</button>
    </div>
    {showHistory&&history.length>1&&<div style={{marginTop:8,marginLeft:21,background:'var(--sur)',borderRadius:7,padding:'8px'}}>
      <div style={{display:'flex',alignItems:'flex-end',gap:3,height:40}}>
        {history.map((t,i)=>{
          // Running EMA up to this point, so the sparkline matches calcMastery's trajectory
          const runningTouches=history.slice(0,i+1);
          const m=calcMastery(runningTouches,data);
          return<div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-end',height:'100%'}} title={`${new Date(t.timestamp).toLocaleDateString('vi-VN')}: ${m}% (U${t.understanding}/C${t.confidence})`}>
            <div style={{width:'70%',height:`${Math.max(4,m)}%`,background:color,borderRadius:'2px 2px 0 0',opacity:.4+0.6*(i/(history.length-1||1))}}/>
          </div>;})}
      </div>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:4,fontSize:8,color:'var(--dm)'}}>
        <span>{new Date(history[0].timestamp).toLocaleDateString('vi-VN',{day:'numeric',month:'numeric'})}</span>
        <span>{new Date(history[history.length-1].timestamp).toLocaleDateString('vi-VN',{day:'numeric',month:'numeric'})}</span>
      </div>
    </div>}
  </div>;}

/* ── Concept editor: title, target date (optional, for schedule timeline), prerequisites (data
   model only per user's request — no UI yet). Objective links removed (Objectives now live in
   Session, not Concept-side; a Session declares which Concepts it covers instead). ── */
function ConceptEditorModal({concept,chapterId,onSave,onClose}){
  const [f,setF]=useState(concept?{title:concept.title,targetDate:concept.targetDate||concept.legacyDueDate||''}:{title:'',targetDate:''});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const save=()=>{if(!f.title.trim())return;onSave(concept?{...concept,...f}:{id:uid(),chapterId,touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacySubtasks:[],...f});};
  return<div className="ov" onClick={onClose}><div className="modal" style={{maxWidth:400}} onClick={e=>e.stopPropagation()}>
    <div className="flex-sb" style={{marginBottom:12}}><span style={{fontSize:14,fontWeight:500}}>{concept?'✏️ Sửa Concept':'+ Concept mới'}</span><button className="btn-g btn-sm" onClick={onClose}>✕</button></div>
    <div className="tx-dm" style={{marginBottom:2}}>Tên concept *</div>
    <input className="inp" value={f.title} onChange={e=>s('title',e.target.value)} placeholder="VD: Maximum Likelihood Estimation..." style={{marginBottom:10}} autoFocus/>
    <div className="tx-dm" style={{marginBottom:2}}>Muốn thành thạo trước ngày nào (tùy chọn)</div>
    <input type="date" className="inp" value={f.targetDate} onChange={e=>s('targetDate',e.target.value)} style={{marginBottom:14}}/>
    <div style={{display:'flex',gap:8}}><button className="btn-p" style={{flex:1,justifyContent:'center'}} onClick={save}>Lưu</button><button className="btn-g" onClick={onClose}>Huỷ</button></div>
  </div></div>;}

/* ── Chapter block: header (progress) + expandable Concept list ── */
function ChapterBlock({chapter,concepts,examDate,color,data,onAddConcept,onEditConcept,onDeleteConcept,onTouch,onEditChapter,onDeleteChapter}){
  const [expanded,setExpanded]=useState(true);
  const chConcepts=concepts.filter(c=>c.chapterId===chapter.id);
  const prog=chapterProgress(chapter,concepts,data);
  return<div className="card" style={{marginBottom:8,padding:'11px 14px'}}>
    <div style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}} onClick={()=>setExpanded(e=>!e)}>
      <span style={{fontSize:11,color:'var(--dm)'}}>{expanded?'▼':'▶'}</span>
      <span style={{fontSize:13,fontWeight:700,flex:1}}>{chapter.title}</span>
      <div style={{width:60}}><Bar v={prog} color={color}/></div>
      <span style={{fontSize:11,fontWeight:700,color,minWidth:32,textAlign:'right'}}>{prog}%</span>
      <span className="tx-dm" style={{minWidth:50,textAlign:'right'}}>{chConcepts.length} concept</span>
      <button onClick={e=>{e.stopPropagation();onEditChapter();}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:11,opacity:.5}}>✏️</button>
      <button onClick={e=>{e.stopPropagation();onDeleteChapter();}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:13,opacity:.35}}>×</button>
    </div>
    {expanded&&<div style={{marginTop:8,paddingLeft:19}}>
      {chConcepts.length===0&&<div className="tx-dm" style={{padding:'8px 0'}}>Chưa có concept nào trong chapter này</div>}
      {chConcepts.map(c=><ConceptRow key={c.id} concept={c} color={color} examDate={examDate} data={data}
        onTouch={()=>onTouch(c)} onEdit={()=>onEditConcept(c)} onDelete={()=>onDeleteConcept(c.id)}/>)}
      <button className="btn-g btn-sm" style={{marginTop:8}} onClick={()=>onAddConcept(chapter.id)}>+ Thêm Concept</button>
    </div>}
  </div>;}

/* ── Chapter editor (lightweight — title + which Phase it belongs to) ── */
function ChapterEditorModal({chapter,coursePhases,onSave,onClose}){
  const [f,setF]=useState(chapter?{title:chapter.title,coursePhaseId:chapter.coursePhaseId}:{title:'',coursePhaseId:coursePhases[0]?.id||''});
  const save=()=>{if(!f.title.trim())return;onSave(chapter?{...chapter,...f}:{id:uid(),...f});};
  return<div className="ov" onClick={onClose}><div className="modal" style={{maxWidth:360}} onClick={e=>e.stopPropagation()}>
    <div className="flex-sb" style={{marginBottom:12}}><span style={{fontSize:14,fontWeight:500}}>{chapter?'✏️ Sửa Chapter':'+ Chapter mới'}</span><button className="btn-g btn-sm" onClick={onClose}>✕</button></div>
    <div className="tx-dm" style={{marginBottom:2}}>Tên chapter *</div>
    <input className="inp" value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))} placeholder="VD: Binary Choice Models..." style={{marginBottom:10}} autoFocus/>
    {coursePhases.length>0&&<div>
      <div className="tx-dm" style={{marginBottom:2}}>Thuộc Phase</div>
      <select className="sel" value={f.coursePhaseId} onChange={e=>setF(p=>({...p,coursePhaseId:e.target.value}))} style={{marginBottom:14}}>
        {coursePhases.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
      </select>
    </div>}
    <div style={{display:'flex',gap:8}}><button className="btn-p" style={{flex:1,justifyContent:'center'}} onClick={save}>Lưu</button><button className="btn-g" onClick={onClose}>Huỷ</button></div>
  </div></div>;}

/* ── Knowledge Notes — upgraded from free-floating Notes: every Note is tied to a Concept ── */
function KnowledgeNotesBlock({course,onUpdate}){
  const [text,setText]=useState('');
  const [conceptId,setConceptId]=useState(course.concepts?.[0]?.id||'');
  const notes=course.notes||[];
  const concepts=course.concepts||[];
  const conceptTitle=(id)=>concepts.find(c=>c.id===id)?.title||'(concept đã xoá)';
  const add=()=>{if(!text.trim()||!conceptId)return;onUpdate({notes:[{id:uid(),text:text.trim(),date:TODAY,conceptId,comments:[]},...notes]});setText('');};
  const del=(id)=>onUpdate({notes:notes.filter(n=>n.id!==id)});
  if(concepts.length===0)return null;
  return<div className="card" style={{marginBottom:10}}>
    <div className="lbl" style={{marginBottom:8}}>💬 KNOWLEDGE NOTES</div>
    <div style={{display:'flex',gap:6,marginBottom:10}}>
      <select className="sel" value={conceptId} onChange={e=>setConceptId(e.target.value)} style={{maxWidth:150,fontSize:11}}>
        {concepts.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}
      </select>
      <input className="inp" value={text} onChange={e=>setText(e.target.value)} placeholder="Ghi chú / câu hỏi ôn thi cho concept này..." style={{flex:1,fontSize:12}} onKeyDown={e=>e.key==='Enter'&&add()}/>
      <button className="btn-p btn-sm" onClick={add}>Đăng</button>
    </div>
    {notes.length===0&&<div className="tx-dm" style={{textAlign:'center',padding:'10px'}}>Chưa có ghi chú nào</div>}
    {notes.map(n=><div key={n.id} className="note-post">
      <div className="flex-sb" style={{marginBottom:4}}>
        <span style={{fontSize:9,background:'var(--acc2)',color:'var(--acc)',borderRadius:4,padding:'1px 6px',fontWeight:600}}>{conceptTitle(n.conceptId)}</span>
        <button onClick={()=>del(n.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:12,opacity:.4}}>×</button>
      </div>
      <div style={{fontSize:12,lineHeight:1.5,whiteSpace:'pre-wrap'}}>{n.text}</div>
      <div className="tx-dm" style={{marginTop:3}}>{fmt(n.date)}</div>
    </div>)}
  </div>;}

/* ── Schedule timeline — reads Concept.targetDate (new) or legacyDueDate (migrated), colored by mastery status ── */
function CourseScheduleView({course,data}){
  const concepts=(course.concepts||[]).filter(c=>c.targetDate||c.legacyDueDate).map(c=>({...c,_date:c.targetDate||c.legacyDueDate})).sort((a,b)=>a._date.localeCompare(b._date));
  if(concepts.length===0)return null;
  const startAct=new Date(Math.min(new Date(concepts[0]._date).getTime(),Date.now()));startAct.setHours(0,0,0,0);
  const endD=new Date(course.examDate||course.endDate||concepts[concepts.length-1]._date);endD.setHours(0,0,0,0);
  const totalMs=Math.max(1,endD-startAct);
  const todayPct=Math.max(0,Math.min(100,(new Date()-startAct)/totalMs*100));
  return<div className="card" style={{marginBottom:10}}>
    <div className="lbl" style={{marginBottom:6}}>📅 STUDY TIMELINE <span style={{fontWeight:400,color:'var(--dm)',fontSize:9}}>(theo Concept — sẽ chuyển sang Session ở Bước 2)</span></div>
    <div style={{position:'relative',height:20,marginBottom:8,marginLeft:4,marginRight:60}}>
      <div style={{position:'absolute',inset:'8px 0',background:'var(--dm)',borderRadius:2,opacity:.4}}/>
      <div style={{position:'absolute',left:`${todayPct}%`,top:0,bottom:0,width:2,background:'var(--acc)',borderRadius:1}}/>
      <div style={{position:'absolute',left:`${todayPct}%`,top:-2,transform:'translateX(-50%)',background:'var(--acc)',color:'#fff',fontSize:8,fontWeight:700,borderRadius:3,padding:'1px 4px',whiteSpace:'nowrap'}}>Hôm nay</div>
    </div>
    {concepts.map(c=>{
      const status=deriveConceptStatus(c,course.examDate,data);
      const meta=STATUS_META[status];
      const days=daysTo(c._date);
      return<div key={c.id} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0'}}>
        <span style={{fontSize:12}}>{meta.emoji}</span>
        <span style={{fontSize:11,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.title}</span>
        <span style={{fontSize:10,color:meta.color,fontWeight:600,whiteSpace:'nowrap'}}>{days<=0?`${Math.abs(days)}N trước`:`còn ${days}N`}</span>
      </div>;})}
  </div>;}

/* ── Course Detail — full page assembly ── */
function CourseDetail({course,data,onBack,onUpdate,onDelete}){
  const [showEditor,setShowEditor]=useState(false);
  const [showAddChapter,setShowAddChapter]=useState(false);
  const [editChapter,setEditChapter]=useState(null);
  const [editConcept,setEditConcept]=useState(null); // {concept, chapterId} or {chapterId} for new
  const [touchConcept,setTouchConcept]=useState(null);
  const [delConfirm,setDelConfirm]=useState(false);

  const coursePhases=course.coursePhases||[];
  const chapters=course.chapters||[];
  const concepts=course.concepts||[];
  const progress=courseProgress(course,data);
  const weak=weakConcepts(course,data);
  const examD=course.examDate?daysTo(course.examDate):null;

  const addConcept=(f)=>onUpdate({concepts:[...concepts,f]});
  const editConceptSave=(f)=>onUpdate({concepts:concepts.map(c=>c.id===f.id?f:c)});
  const delConcept=(id)=>onUpdate({concepts:concepts.filter(c=>c.id!==id)});
  const touchSave=(conceptId,understanding,confidence)=>{
    onUpdate({concepts:concepts.map(c=>c.id===conceptId?{...c,touches:[...(c.touches||[]),{understanding,confidence,timestamp:Date.now(),sessionId:null}]}:c)});
  };
  const saveChapter=(f)=>{
    if(chapters.find(c=>c.id===f.id))onUpdate({chapters:chapters.map(c=>c.id===f.id?f:c)});
    else onUpdate({chapters:[...chapters,f]});
    setShowAddChapter(false);setEditChapter(null);
  };
  const delChapter=(id)=>{
    const has=concepts.some(c=>c.chapterId===id);
    if(has&&!confirm('Chapter này có Concept bên trong. Xoá sẽ xoá luôn các Concept đó. Tiếp tục?'))return;
    onUpdate({chapters:chapters.filter(c=>c.id!==id),concepts:concepts.filter(c=>c.chapterId!==id)});
  };

  return<div>
    <button className="btn-g btn-sm" style={{marginBottom:10}} onClick={onBack}>← Danh sách môn</button>
    <div className="card" style={{marginBottom:10}}>
      <div className="flex-sb" style={{marginBottom:8}}>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <span style={{fontSize:28}}>{course.emoji}</span>
          <div><div style={{fontSize:17,fontWeight:700}}>{course.name}</div><Badge risk={course.risk}/></div>
        </div>
        <div style={{display:'flex',gap:6}}>
          <button className="btn-g btn-sm" onClick={()=>setShowEditor(true)}>✏️ Sửa</button>
          {delConfirm?<button className="btn-g btn-sm" style={{color:'var(--cr)'}} onClick={onDelete}>Xác nhận xoá?</button>
            :<button className="btn-g btn-sm" onClick={()=>{setDelConfirm(true);setTimeout(()=>setDelConfirm(false),3000);}} style={{color:'var(--cr)'}}>🗑️</button>}
        </div>
      </div>
      <div style={{display:'flex',gap:14,flexWrap:'wrap',fontSize:11,color:'var(--mu)',marginBottom:10}}>
        {course.instructor&&<span>👨‍🏫 {course.instructor}</span>}
        {course.contact&&<span>📧 {course.contact}</span>}
        {course.location&&<span>📍 {course.location}</span>}
        {course.schedule&&<span>📅 {course.schedule}</span>}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{flex:1}}><Bar v={progress} color={course.color} h={7}/></div>
        <span style={{fontWeight:700,color:course.color}}>{progress}%</span>
        {examD!==null&&<span style={{fontSize:11,color:examD<=7?'var(--cr)':'var(--mu)',fontWeight:600}}>còn {examD} ngày đến thi</span>}
      </div>
      {weak.length>0&&<div style={{marginTop:8,fontSize:11,color:'var(--cr)'}}>🔴 {weak.length} concept cần ôn gấp (Review Priority cao)</div>}
      {course.note&&<div style={{marginTop:8,fontSize:11,color:'var(--mu)',background:'var(--sur)',borderRadius:6,padding:'6px 8px'}}>{course.note}</div>}
    </div>

    <CourseAttendance course={course} onUpdate={onUpdate}/>
    <CourseScheduleView course={course} data={data}/>
    <CoursePhaseGantt course={course} onUpdate={onUpdate} data={data}/>
    <SessionsPlaceholderBlock course={course}/>

    <div className="flex-sb" style={{marginBottom:8}}>
      <div className="lbl" style={{margin:0}}>📚 CHAPTERS & CONCEPTS</div>
      <button className="btn-p btn-sm" onClick={()=>setShowAddChapter(true)}>+ Chapter</button>
    </div>
    {chapters.length===0&&<div className="card"><div className="tx-dm" style={{textAlign:'center',padding:14}}>Chưa có Chapter nào. Thêm Phase trước (nếu cần), rồi thêm Chapter.</div></div>}
    {chapters.map(ch=><ChapterBlock key={ch.id} chapter={ch} concepts={concepts} examDate={course.examDate} color={course.color} data={data}
      onAddConcept={(chapterId)=>setEditConcept({chapterId})}
      onEditConcept={(c)=>setEditConcept({concept:c,chapterId:c.chapterId})}
      onDeleteConcept={delConcept}
      onTouch={setTouchConcept}
      onEditChapter={()=>setEditChapter(ch)}
      onDeleteChapter={()=>delChapter(ch.id)}/>)}

    <KnowledgeNotesBlock course={course} onUpdate={onUpdate}/>

    {showEditor&&<CourseEditorModal existing={course} onSave={f=>{onUpdate(f);setShowEditor(false);}} onClose={()=>setShowEditor(false)}/>}
    {(showAddChapter||editChapter)&&<ChapterEditorModal chapter={editChapter} coursePhases={coursePhases} onSave={saveChapter} onClose={()=>{setShowAddChapter(false);setEditChapter(null);}}/>}
    {editConcept&&<ConceptEditorModal concept={editConcept.concept} chapterId={editConcept.chapterId}
      onSave={f=>{editConcept.concept?editConceptSave(f):addConcept(f);setEditConcept(null);}} onClose={()=>setEditConcept(null)}/>}
    {touchConcept&&<ConceptTouchModal concept={touchConcept} color={course.color}
      onSave={(understanding,confidence)=>touchSave(touchConcept.id,understanding,confidence)} onClose={()=>setTouchConcept(null)}/>}
  </div>;}

/* ── Courses list page (wrapper — mostly unchanged) ── */
function CoursesPage({data,upd,initCourseId}){
  const [sel,setSel]=useState(initCourseId||null);
  const [showEditor,setShowEditor]=useState(false);
  const [showArchived,setShowArchived]=useState(false);
  useEffect(()=>{if(initCourseId)setSel(initCourseId);},[initCourseId]);
  const course=data.courses.find(c=>c.id===sel);
  const updCourse=(ch)=>upd({courses:data.courses.map(c=>c.id===sel?{...c,...ch}:c)});
  const delCourse=()=>{upd({courses:data.courses.filter(c=>c.id!==sel)});setSel(null);};
  const addCourse=(f)=>{upd({courses:[...data.courses,f]});setShowEditor(false);setSel(f.id);};
  const visible=data.courses.filter(c=>showArchived?c.archived:!c.archived);

  if(course)return<CourseDetail course={course} data={data} onBack={()=>setSel(null)} onUpdate={updCourse} onDelete={delCourse}/>;

  return<div>
    <div className="flex-sb" style={{marginBottom:4}}><div className="h1">📚 Môn học</div><button className="btn-p btn-sm" onClick={()=>setShowEditor(true)}>+ Thêm môn</button></div>
    <div style={{display:'flex',gap:7,marginBottom:14}}>
      <button onClick={()=>setShowArchived(false)} style={{padding:'6px 14px',borderRadius:8,border:`1.5px solid ${!showArchived?'var(--acc)':'var(--bdr)'}`,background:!showArchived?'var(--acc2)':'var(--sur)',color:!showArchived?'var(--acc)':'var(--mu)',cursor:'pointer',fontSize:12,fontWeight:!showArchived?700:400}}>Đang học ({data.courses.filter(c=>!c.archived).length})</button>
      <button onClick={()=>setShowArchived(true)} style={{padding:'6px 14px',borderRadius:8,border:`1.5px solid ${showArchived?'var(--acc)':'var(--bdr)'}`,background:showArchived?'var(--acc2)':'var(--sur)',color:showArchived?'var(--acc)':'var(--mu)',cursor:'pointer',fontSize:12,fontWeight:showArchived?700:400}}>Đã lưu trữ ({data.courses.filter(c=>c.archived).length})</button>
    </div>
    <div className="g2">
      {visible.map(c=>{const p=courseProgress(c,data);const d=daysTo(c.examDate||c.endDate);return<div key={c.id} className="card" style={{cursor:'pointer'}} onClick={()=>setSel(c.id)}>
        <div className="flex-sb" style={{marginBottom:6}}>
          <div style={{display:'flex',gap:8,alignItems:'center'}}><span style={{fontSize:18}}>{c.emoji}</span><span style={{fontWeight:600,fontSize:13}}>{c.name}</span></div>
          <Badge risk={c.risk}/>
        </div>
        <Bar v={p} color={c.color}/>
        <div className="flex-sb" style={{marginTop:5}}><span className="tx-dm">{p}% mastery</span>{d!==null&&<span className="tx-dm">{d}N</span>}</div>
      </div>;})}
    </div>
    {showEditor&&<CourseEditorModal onSave={addCourse} onClose={()=>setShowEditor(false)}/>}
  </div>;}
