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
/* ── v13: color-codes each Phase by where TODAY falls relative to it (past =
   muted gray, current = blue glow, upcoming = amber) instead of one flat
   color for everything — plus a date ruler (start/today/end, with weekday)
   and a "today" line running through every bar, so the timeline actually
   reads as a timeline instead of a list of same-colored bars. ── */
/* ── v13: shared date ruler — evenly-spaced tick marks with weekday + date,
   used by both CoursePhaseGantt and CourseScheduleView so "hiển thị ngày cụ
   thể theo dạng lịch ở trên cùng" (per user's reference screenshots) looks
   the same in both places. A full day-by-day header (like the Excel example)
   isn't practical for a ~2-month range in a narrow card, so this shows N
   evenly-spaced markers instead — a deliberate scaled-down compromise, not
   a 1:1 reproduction of the reference image. ── */
function TimelineRuler({start,end,ticks=5}){
  const s=new Date(start);s.setHours(0,0,0,0);
  const e=new Date(end);e.setHours(0,0,0,0);
  const totalMs=Math.max(1,e-s);
  const points=Array.from({length:ticks},(_,i)=>{
    const t=new Date(s.getTime()+totalMs*(i/(ticks-1)));
    return{pct:(i/(ticks-1))*100,date:t};
  });
  return<div style={{position:'relative',height:24,marginBottom:6}}>
    {points.map((p,i)=><div key={i} style={{position:'absolute',left:`${p.pct}%`,transform:i===0?'translateX(0)':i===ticks-1?'translateX(-100%)':'translateX(-50%)',textAlign:'center',whiteSpace:'nowrap'}}>
      <div style={{fontSize:8,color:'var(--dm)',fontWeight:600}}>{DV[p.date.getDay()]}</div>
      <div style={{fontSize:9,color:'var(--mu)'}}>{String(p.date.getDate()).padStart(2,'0')}/{String(p.date.getMonth()+1).padStart(2,'0')}</div>
    </div>)}
  </div>;}

function CoursePhaseGantt({course,onUpdate,data}){
  const [showAdd,setShowAdd]=useState(false);
  const [editId,setEditId]=useState(null);
  const [f,setF]=useState({title:'',startDate:TODAY,endDate:TODAY});
  const coursePhases=(course.coursePhases||[]).slice().sort((a,b)=>(a.order||0)-(b.order||0));
  const start=coursePhases.length?new Date(Math.min(...coursePhases.map(p=>new Date(p.startDate||p.endDate||TODAY)))):new Date();
  start.setHours(0,0,0,0);
  const end=new Date(course.examDate||course.endDate||coursePhases[coursePhases.length-1]?.endDate||'2026-07-31');
  end.setHours(0,0,0,0);
  const totalMs=Math.max(1,end-start);
  const now=new Date();now.setHours(0,0,0,0);
  const todayInRange=now>=start&&now<=end;
  const todayPct=Math.max(0,Math.min(100,(now-start)/totalMs*100));
  const pOf=(ds)=>{if(!ds)return 0;const d=new Date(ds);d.setHours(0,0,0,0);return Math.max(0,Math.min(100,(d-start)/totalMs*100));};
  const wOf=(s,e)=>Math.max(2,pOf(e)-pOf(s||e));
  const dayCount=(p)=>{const ps=new Date(p.startDate||TODAY);const pe=new Date(p.endDate||p.startDate||TODAY);return Math.max(1,Math.round((pe-ps)/86400000)+1);};
  const phaseTiming=(p)=>{
    const ps=new Date(p.startDate||TODAY);ps.setHours(0,0,0,0);
    const pe=new Date(p.endDate||p.startDate||TODAY);pe.setHours(0,0,0,0);
    if(now>pe)return'past';
    if(now>=ps&&now<=pe)return'current';
    return'upcoming';
  };
  const TIMING_STYLE={
    past:{bar:'var(--dm)',text:'var(--mu)',glow:'none',opacity:.55},
    current:{bar:'var(--in)',text:'var(--in)',glow:'0 0 0 3px var(--inb)',opacity:1},
    upcoming:{bar:'var(--wa)',text:'var(--wa)',glow:'none',opacity:.85},
  };
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
    {coursePhases.length>0&&<>
      <TimelineRuler start={start} end={end} ticks={5}/>
      {(()=>{
        const currentPhase=coursePhases.find(p=>phaseTiming(p)==='current');
        if(!currentPhase)return todayInRange?null:<div style={{textAlign:'center',fontSize:10,color:'var(--dm)',marginBottom:6}}>Hôm nay ({fmtL(now)}) nằm ngoài các Phase đã khai báo.</div>;
        const ps=new Date(currentPhase.startDate||TODAY);ps.setHours(0,0,0,0);
        const pe=new Date(currentPhase.endDate||currentPhase.startDate||TODAY);pe.setHours(0,0,0,0);
        const totalD=Math.max(1,Math.round((pe-ps)/86400000)+1);
        const passedD=Math.min(totalD,Math.max(0,Math.round((now-ps)/86400000)+1));
        const leftD=Math.max(0,totalD-passedD);
        return<div style={{textAlign:'center',marginBottom:8,fontSize:11}}>
          📍 Đang ở <b style={{color:'var(--in)'}}>{currentPhase.title}</b> — đã qua {passedD} ngày · còn {leftD} ngày <span style={{color:'var(--dm)'}}>(trong tổng {totalD} ngày)</span>
        </div>;
      })()}
    </>}
    <div style={{position:'relative'}}>
      {coursePhases.map(p=>{
        const linkedChapterCount=(course.chapters||[]).filter(ch=>ch.coursePhaseId===p.id).length;
        const prog=phaseProgress(p,course.chapters||[],course.concepts||[],data);
        const timing=phaseTiming(p);
        const ts=TIMING_STYLE[timing];
        return<div key={p.id} className="gantt2-row">
          <div className="gantt2-label" onClick={()=>{setEditId(p.id);setF({title:p.title,startDate:p.startDate||TODAY,endDate:p.endDate||TODAY});setShowAdd(true);}} style={{cursor:'pointer',color:ts.text,opacity:timing==='past'?.7:1}} title="Click để sửa">{p.title}</div>
          <div className="gantt2-track" style={{position:'relative'}}>
            <div className="gantt2-bar" style={{left:`${pOf(p.startDate)}%`,width:`${wOf(p.startDate,p.endDate)}%`,background:linkedChapterCount===0?'var(--dm)':ts.bar,opacity:linkedChapterCount===0?.35:ts.opacity,boxShadow:ts.glow,position:'relative',overflow:'hidden',transition:'box-shadow .2s'}} title={linkedChapterCount===0?'Chưa có Chapter nào gắn vào Phase này — % sẽ luôn là 0% cho tới khi bạn gắn ít nhất 1 Chapter':`${fmt(p.startDate)} → ${fmt(p.endDate)} · ${dayCount(p)} ngày · ${prog}% mastery${timing==='current'?' · ĐANG Ở PHASE NÀY':timing==='past'?' · Đã qua':' · Sắp tới'}`}>
              {linkedChapterCount>0&&<div style={{position:'absolute',inset:0,background:'rgba(0,0,0,.35)',width:`${100-prog}%`,right:0,left:'auto'}}/>}
              <span style={{position:'relative'}}>{linkedChapterCount===0?`${p.title} · ⚠️ chưa có Chapter nào gắn`:`${p.title} · ${dayCount(p)}N · ${prog}%`}</span>
            </div>
            {/* "Today" marker — placed in the SAME %-based coordinate system as the
               bar above (pOf), inside each track individually. Safer than one
               page-wide overlay: doesn't need to guess the label column's pixel
               width from CSS we don't have on hand, and stays pixel-aligned with
               the bars no matter the layout. */}
            {todayInRange&&<div style={{position:'absolute',left:`${todayPct}%`,top:-3,bottom:-3,width:2,background:'var(--acc)',zIndex:2,borderRadius:1,pointerEvents:'none'}} title={`Hôm nay · ${fmtL(now)}`}/>}
          </div>
          <button onClick={()=>delPhase(p.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:13,opacity:.4,marginLeft:6}}>×</button>
        </div>;})}
    </div>
    {coursePhases.length>0&&<div style={{display:'flex',gap:12,marginTop:8,justifyContent:'center'}}>
      <span style={{fontSize:9,color:'var(--mu)'}}><span style={{color:'var(--dm)'}}>●</span> Đã qua</span>
      <span style={{fontSize:9,color:'var(--mu)'}}><span style={{color:'var(--in)'}}>●</span> Đang ở đây</span>
      <span style={{fontSize:9,color:'var(--mu)'}}><span style={{color:'var(--wa)'}}>●</span> Sắp tới</span>
    </div>}
  </div>;}

/* ── Sessions placeholder — Learning Objectives moved here per approved v12.1 spec
   (Session is the learning unit; Objectives now live inside Session, not Course).
   Session is single-use per approved decision: each planned study occasion is
   its own Session object (Draft→Planned→In Progress→Completed→Reviewed); to
   study the same Concepts again later, create a NEW Session rather than reuse. ── */
const SESSION_STATUS_META={
  draft:{emoji:'📝',color:'var(--dm)',label:'Draft'},
  planned:{emoji:'📌',color:'var(--in)',label:'Đã lên kế hoạch'},
  in_progress:{emoji:'▶️',color:'var(--acc)',label:'Đang học'},
  completed:{emoji:'✅',color:'var(--su)',label:'Hoàn thành'},
  reviewed:{emoji:'🔍',color:'#8B7EF5',label:'Đã review'},
};

/* ── Live timer for an in-progress Session — reads `session.activeStartedAt`
   (a persisted Date.now() timestamp), NOT component-local refs. This means the
   timer survives page navigation, tab close/reopen, even switching devices —
   the running total is always recomputed fresh from data, never lost. ── */
/* ── Live elapsed time = accumulatedSeconds (from previous active periods,
   frozen while paused) + time since the CURRENT active period started (0 if
   currently paused, i.e. activeStartedAt is null). Multi-day sessions: pause
   today, resume tomorrow — nothing is lost, nothing keeps ticking while away. ── */
function useSessionTimer(session){
  const [tick,setTick]=useState(0);
  const isRunning=session?.status==='in_progress'&&!!session.activeStartedAt;
  useEffect(()=>{
    if(!isRunning)return;
    const iv=setInterval(()=>setTick(t=>t+1),1000);
    return()=>clearInterval(iv);
  },[isRunning,session?.activeStartedAt]);
  if(!session||session.status!=='in_progress')return session?.accumulatedSeconds||0;
  const base=session.accumulatedSeconds||0;
  return session.activeStartedAt?base+Math.floor((Date.now()-session.activeStartedAt)/1000):base;
}

/* ── Start Study: creates the Journal Entry (execution instance) immediately,
   marks Session in_progress, and stamps the wall-clock start time.
   v12.2: also pauses any OTHER in_progress Session system-wide (not just
   within this course) — fixes a latent bug where starting a Session in one
   course while another course still had one running left BOTH timers
   ticking in parallel. Enforces "only one Session RUNNING at a time"
   (matches SPEC-001's business rule from the reviewed architecture docs).
   Because of this, the update now writes the full `courses` array directly
   instead of going through the single-course `onUpdateCourse` helper. ── */
function startSession(course,session,onUpdateCourse,upd,data,awardXP){
  const now=Date.now();
  const journalEntryId=uid();
  const checklist=(session.customTodos||[]).map(t=>({id:uid(),text:t.text,done:false}));
  const entry={
    id:journalEntryId,date:TODAY,courseId:course.id,sessionId:session.id,duration:0,
    reflection:'',questionsRaised:'',actionItems:[],confidenceAfter:0,difficulty:0,notes:'',
    conceptTouches:[],checklist,status:'in_progress',
  };
  const paused=pauseAllOtherRunningSessions(data.courses||[],course.id,session.id,now);
  const courses=paused.map(c=>c.id!==course.id?c:{...c,sessions:(c.sessions||[]).map(s=>s.id===session.id?{...s,status:'in_progress',activeStartedAt:now,accumulatedSeconds:0,activeJournalEntryId:journalEntryId}:s)});
  upd({courses,journalEntries:[entry,...(data.journalEntries||[])]});
}

/* ── Pause: freeze accumulated time, clear the running start-stamp so the
   clock stops ticking (both live-display and true source of truth) until
   Resume is pressed. Safe across days/devices — nothing depends on the tab
   staying open. ── */
function pauseSession(course,session,onUpdateCourse){
  if(!session.activeStartedAt)return; // already paused
  const addedSeconds=Math.floor((Date.now()-session.activeStartedAt)/1000);
  onUpdateCourse({sessions:(course.sessions||[]).map(s=>s.id===session.id?{...s,activeStartedAt:null,accumulatedSeconds:(s.accumulatedSeconds||0)+addedSeconds}:s)});
}
/* ── v12.2: Resume goes through the same pauseAllOtherRunningSessions guard
   as startSession — otherwise resuming a PAUSED session while a different
   course's session is RUNNING would reopen the exact parallel-timer bug
   through a second door. ── */
function resumeSession(course,session,onUpdateCourse,upd,data){
  const now=Date.now();
  const paused=pauseAllOtherRunningSessions(data.courses||[],course.id,session.id,now);
  const courses=paused.map(c=>c.id!==course.id?c:{...c,sessions:(c.sessions||[]).map(s=>s.id===session.id?{...s,activeStartedAt:now}:s)});
  upd({courses});
}

/* ── Finish Study: stop the clock, save reflection + per-concept touches,
   close out both the Session and its Journal Entry. Works whether currently
   running or paused — total = accumulated + any live delta.
   v13: takes an optional onDone(masteryDeltas) callback — computes mastery
   before/after per touched Concept so the caller (Next Queue) can show
   immediate "+X% Mastery" feedback right after Finish. ── */
function finishSession(course,session,formData,onUpdateCourse,upd,data,awardXP,onDone){
  const totalSeconds=(session.accumulatedSeconds||0)+(session.activeStartedAt?Math.floor((Date.now()-session.activeStartedAt)/1000):0);
  const durationMin=Math.round(totalSeconds/60);
  const journalEntries=data.journalEntries||[];
  const entry=journalEntries.find(j=>j.id===session.activeJournalEntryId);
  const updatedEntry={
    ...(entry||{id:session.activeJournalEntryId||uid(),date:TODAY,courseId:course.id,sessionId:session.id,checklist:[]}),
    duration:durationMin,reflection:formData.reflection,questionsRaised:formData.questionsRaised,
    actionItems:formData.actionItems,confidenceAfter:formData.confidenceAfter,difficulty:formData.difficulty,
    notes:formData.notes,conceptTouches:formData.conceptTouches,checklist:formData.checklist,status:'completed',
  };
  upd({journalEntries:entry?journalEntries.map(j=>j.id===entry.id?updatedEntry:j):[updatedEntry,...journalEntries]});

  // Push each rated concept touch into the Concept's history (drives mastery calc),
  // recording the before/after mastery for each so Next Queue can show real deltas.
  const ms=getMasterySettings(data);
  const masteryDeltas=[];
  const concepts=(course.concepts||[]).map(c=>{
    const t=formData.conceptTouches.find(ct=>ct.conceptId===c.id);
    if(!t)return c;
    const before=calcProgress(c,ms);
    const newTouches=[...(c.touches||[]),{understanding:t.understanding,confidence:t.confidence,timestamp:Date.now(),sessionId:session.id}];
    const after=calcProgress({...c,touches:newTouches},ms);
    masteryDeltas.push({conceptId:c.id,title:c.title,before,after});
    return{...c,touches:newTouches};
  });
  onUpdateCourse({
    concepts,
    sessions:(course.sessions||[]).map(s=>s.id===session.id?{...s,status:'completed',activeStartedAt:null,accumulatedSeconds:0,activeJournalEntryId:null}:s),
  });
  if(awardXP)awardXP(XPR.session_complete+Math.round(durationMin/10),`✅ Hoàn thành: ${session.title}`);
  if(onDone)onDone(masteryDeltas);
}

function markReviewed(course,session,onUpdateCourse){
  onUpdateCourse({sessions:(course.sessions||[]).map(s=>s.id===session.id?{...s,status:'reviewed'}:s)});
}

/* ── Session blueprint editor: title, duration, objectives (lightweight + expandable
   detail), concepts covered, resources, custom todos. ── */
/* ── v13: Import nhiều Session cùng lúc từ 1 khối text — dán từ ChatGPT hoặc
   ghi chú riêng, mỗi Session cách nhau bởi dòng bắt đầu "###". Trong mỗi
   khối, các dòng "Key: value" khai báo field tương ứng:
     Objective: <text>      — thêm 1 Learning Objective
     Todo: <text>           — thêm 1 việc vào checklist
     Link: <text/url>       — thêm 1 Resource
     Concept: <tên concept> — khớp theo TÊN với Concept đã có trong môn (không
                              phân biệt hoa/thường); không khớp được thì bỏ qua
     Duration: <số phút>    — estimatedDuration, mặc định 30 nếu bỏ trống
   Mọi Session tạo ra đều ở trạng thái 'planned' — không tự Start, người dùng
   xem lại rồi bấm Bắt đầu như bình thường. ── */
function parseSessionImportTemplate(text,concepts){
  const blocks=text.split(/^###\s*/m).map(b=>b.trim()).filter(Boolean);
  return blocks.map(block=>{
    const lines=block.split('\n').map(l=>l.trim()).filter(Boolean);
    const title=lines[0]||'Session không tên';
    const objectives=[],customTodos=[],resources=[],conceptIds=[],unmatchedConcepts=[];
    let estimatedDuration=30;
    for(let i=1;i<lines.length;i++){
      const m=lines[i].match(/^(Objective|Todo|Link|Concept|Duration)\s*:\s*(.+)$/i);
      if(!m)continue;
      const key=m[1].toLowerCase(),val=m[2].trim();
      if(key==='objective')objectives.push({id:uid(),text:val,description:'',expectedOutcome:'',conceptIds:[],estimatedTime:'',assessmentCriteria:''});
      else if(key==='todo')customTodos.push({id:uid(),text:val,done:false});
      else if(key==='link')resources.push({id:uid(),text:val});
      else if(key==='concept'){
        const match=concepts.find(c=>c.title.toLowerCase()===val.toLowerCase());
        if(match)conceptIds.push(match.id);else unmatchedConcepts.push(val);
      }
      else if(key==='duration')estimatedDuration=Math.max(1,parseInt(val)||30);
    }
    return{title,estimatedDuration,objectives,conceptIds,resources,customTodos,unmatchedConcepts};
  });
}

function BulkImportSessionsModal({concepts,onSave,onClose}){
  const [text,setText]=useState('');
  const parsed=text.trim()?parseSessionImportTemplate(text,concepts):[];
  const allUnmatched=[...new Set(parsed.flatMap(p=>p.unmatchedConcepts))];
  const save=()=>{
    if(parsed.length===0)return;
    onSave(parsed.map(p=>({id:uid(),title:p.title,estimatedDuration:p.estimatedDuration,objectives:p.objectives,conceptIds:p.conceptIds,resources:p.resources,customTodos:p.customTodos,status:'planned',activeStartedAt:null,accumulatedSeconds:0,activeJournalEntryId:null,createdAt:Date.now()})));
  };
  const example=`### Chuẩn bị script\nObjective: Viết xong script thuyết trình\nTodo: Outline nội dung\nTodo: Viết draft đầu tiên\nLink: https://docs.google.com/...\nConcept: Thuyết trình\nDuration: 45\n\n### Rehearse lần 1\nTodo: Tự tập nói 1 mình\nTodo: Quay video xem lại\nDuration: 30`;
  return<div className="ov" onClick={onClose}><div className="modal" style={{maxWidth:480,maxHeight:'85vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
    <div className="flex-sb" style={{marginBottom:10}}><span style={{fontSize:14,fontWeight:600}}>📥 Import nhiều Session</span><button className="btn-g btn-sm" onClick={onClose}>✕</button></div>
    <div className="tx-dm" style={{marginBottom:6}}>Mỗi Session bắt đầu bằng dòng <code>###</code> + tên. Bên dưới khai báo <code>Objective:</code>, <code>Todo:</code>, <code>Link:</code>, <code>Concept:</code> (khớp tên Concept có sẵn), <code>Duration:</code> (phút) — dòng nào cũng tuỳ chọn, dán nhiều dòng cùng loại để thêm nhiều mục.</div>
    <textarea value={text} onChange={e=>setText(e.target.value)} rows={9} placeholder={example}
      style={{width:'100%',background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:8,padding:'8px 10px',color:'var(--tx)',fontSize:11,outline:'none',fontFamily:'monospace',resize:'vertical',boxSizing:'border-box',marginBottom:10}} autoFocus/>
    {parsed.length>0&&<div style={{marginBottom:10}}>
      <div className="tx-dm" style={{marginBottom:5,fontWeight:600}}>Xem trước ({parsed.length} Session):</div>
      {parsed.map((p,i)=><div key={i} style={{fontSize:11,background:'var(--sur)',borderRadius:6,padding:'6px 9px',marginBottom:4}}>
        <b>{p.title}</b> · {p.estimatedDuration}′
        {p.objectives.length>0&&<span> · {p.objectives.length} objective</span>}
        {p.customTodos.length>0&&<span> · {p.customTodos.length} todo</span>}
        {p.resources.length>0&&<span> · {p.resources.length} link</span>}
        {p.conceptIds.length>0&&<span> · 🔗{p.conceptIds.length} concept</span>}
      </div>)}
      {allUnmatched.length>0&&<div style={{fontSize:10,color:'var(--wa)',marginTop:4}}>⚠️ Không khớp được Concept: {allUnmatched.join(', ')} — kiểm tra đúng tên chưa (không phân biệt hoa/thường, nhưng phải khớp chính xác).</div>}
    </div>}
    <div style={{display:'flex',gap:8}}>
      <button className="btn-p" style={{flex:1,justifyContent:'center',opacity:parsed.length===0?.5:1}} disabled={parsed.length===0} onClick={save}>+ Tạo {parsed.length>0?parsed.length+' ':''}Session</button>
      <button className="btn-g" onClick={onClose}>Huỷ</button>
    </div>
  </div></div>;}

function SessionEditorModal({session,concepts,onSave,onClose}){
  const [f,setF]=useState(session?{
    title:session.title,estimatedDuration:session.estimatedDuration||30,
    objectives:session.objectives||[],conceptIds:session.conceptIds||[],
    resources:session.resources||[],customTodos:session.customTodos||[],
  }:{title:'',estimatedDuration:30,objectives:[],conceptIds:[],resources:[],customTodos:[]});
  const [newObjText,setNewObjText]=useState('');
  const [expandedObjId,setExpandedObjId]=useState(null);
  const [newResource,setNewResource]=useState('');
  const [newTodo,setNewTodo]=useState('');
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const togConcept=(id)=>setF(p=>({...p,conceptIds:p.conceptIds.includes(id)?p.conceptIds.filter(x=>x!==id):[...p.conceptIds,id]}));
  const addObjective=()=>{if(!newObjText.trim())return;setF(p=>({...p,objectives:[...p.objectives,{id:uid(),text:newObjText.trim(),description:'',expectedOutcome:'',conceptIds:[],estimatedTime:'',assessmentCriteria:''}]}));setNewObjText('');};
  const updObjective=(id,ch)=>setF(p=>({...p,objectives:p.objectives.map(o=>o.id===id?{...o,...ch}:o)}));
  const delObjective=(id)=>setF(p=>({...p,objectives:p.objectives.filter(o=>o.id!==id)}));
  const addResource=()=>{if(!newResource.trim())return;setF(p=>({...p,resources:[...p.resources,{id:uid(),text:newResource.trim()}]}));setNewResource('');};
  const delResource=(id)=>setF(p=>({...p,resources:p.resources.filter(r=>r.id!==id)}));
  const addTodo=()=>{if(!newTodo.trim())return;setF(p=>({...p,customTodos:[...p.customTodos,{id:uid(),text:newTodo.trim()}]}));setNewTodo('');};
  const delTodo=(id)=>setF(p=>({...p,customTodos:p.customTodos.filter(t=>t.id!==id)}));
  const save=(status)=>{if(!f.title.trim())return;onSave(session?{...session,...f}:{id:uid(),status:status||'draft',activeStartedAt:null,activeJournalEntryId:null,...f});};

  // Group concepts by chapter for a more readable picker (chapterId passed separately)
  return<div className="ov" onClick={onClose}><div className="modal" style={{maxWidth:480,maxHeight:'85vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
    <div className="flex-sb" style={{marginBottom:12}}><span style={{fontSize:15,fontWeight:600}}>{session?'✏️ Sửa Session':'+ Session mới'}</span><button className="btn-g btn-sm" onClick={onClose}>✕</button></div>

    <div className="tx-dm" style={{marginBottom:2}}>Tên Session *</div>
    <input className="inp" value={f.title} onChange={e=>s('title',e.target.value)} placeholder="VD: Buổi 1 — MLE cơ bản" style={{marginBottom:10}} autoFocus/>

    <div className="tx-dm" style={{marginBottom:2}}>Thời lượng ước tính (phút)</div>
    <input type="number" className="inp" value={f.estimatedDuration} onChange={e=>s('estimatedDuration',parseInt(e.target.value)||0)} style={{marginBottom:14}}/>

    <div className="tx-dm" style={{marginBottom:5,fontWeight:600}}>🎯 Learning Objectives</div>
    {f.objectives.map((o,i)=>{
      const exp=expandedObjId===o.id;
      return<div key={o.id} style={{background:'var(--sur)',borderRadius:7,padding:'7px 9px',marginBottom:6}}>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          <span style={{fontSize:11,flex:1}}>{i+1}. {o.text}</span>
          <button onClick={()=>setExpandedObjId(exp?null:o.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--acc)',fontSize:10}}>{exp?'thu gọn ▲':'chi tiết ▼'}</button>
          <button onClick={()=>delObjective(o.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:12}}>×</button>
        </div>
        {exp&&<div style={{marginTop:8,paddingTop:8,borderTop:'1px solid var(--bdr)'}}>
          <input className="inp" value={o.description} onChange={e=>updObjective(o.id,{description:e.target.value})} placeholder="Mô tả chi tiết..." style={{marginBottom:5,fontSize:11}}/>
          <input className="inp" value={o.expectedOutcome} onChange={e=>updObjective(o.id,{expectedOutcome:e.target.value})} placeholder="Kết quả mong đợi (Expected Outcome)..." style={{marginBottom:5,fontSize:11}}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:5,marginBottom:5}}>
            <input className="inp" value={o.estimatedTime} onChange={e=>updObjective(o.id,{estimatedTime:e.target.value})} placeholder="Thời gian (phút)" style={{fontSize:11}}/>
            <input className="inp" value={o.assessmentCriteria} onChange={e=>updObjective(o.id,{assessmentCriteria:e.target.value})} placeholder="Tiêu chí đánh giá..." style={{fontSize:11}}/>
          </div>
          {concepts.length>0&&<div style={{display:'flex',flexWrap:'wrap',gap:4}}>
            {concepts.map(c=><button key={c.id} onClick={()=>updObjective(o.id,{conceptIds:(o.conceptIds||[]).includes(c.id)?o.conceptIds.filter(x=>x!==c.id):[...(o.conceptIds||[]),c.id]})}
              style={{fontSize:9,padding:'2px 6px',borderRadius:5,border:`1px solid ${(o.conceptIds||[]).includes(c.id)?'var(--acc)':'var(--bdr)'}`,background:(o.conceptIds||[]).includes(c.id)?'var(--acc2)':'transparent',color:(o.conceptIds||[]).includes(c.id)?'var(--acc)':'var(--mu)',cursor:'pointer'}}>{c.title}</button>)}
          </div>}
        </div>}
      </div>;})}
    <div style={{display:'flex',gap:5,marginBottom:14}}>
      <input className="inp" value={newObjText} onChange={e=>setNewObjText(e.target.value)} placeholder="Thêm objective..." style={{flex:1,fontSize:11}} onKeyDown={e=>e.key==='Enter'&&addObjective()}/>
      <button className="btn-p btn-sm" onClick={addObjective}>+</button>
    </div>

    <div className="tx-dm" style={{marginBottom:5,fontWeight:600}}>📚 Concepts phủ trong Session này</div>
    {concepts.length===0&&<div className="tx-dm" style={{marginBottom:14}}>Chưa có Concept nào trong môn — thêm ở phần Chapters & Concepts trước.</div>}
    {concepts.length>0&&<div style={{display:'flex',flexWrap:'wrap',gap:5,marginBottom:14}}>
      {concepts.map(c=><button key={c.id} onClick={()=>togConcept(c.id)} style={{fontSize:10,padding:'4px 8px',borderRadius:6,border:`1px solid ${f.conceptIds.includes(c.id)?'var(--acc)':'var(--bdr)'}`,background:f.conceptIds.includes(c.id)?'var(--acc2)':'transparent',color:f.conceptIds.includes(c.id)?'var(--acc)':'var(--mu)',cursor:'pointer'}}>{c.title}</button>)}
    </div>}

    <div className="tx-dm" style={{marginBottom:5,fontWeight:600}}>📎 Resources</div>
    {f.resources.map(r=><div key={r.id} style={{display:'flex',gap:6,alignItems:'center',marginBottom:4}}>
      <span style={{fontSize:11,flex:1}}>🔗 {r.text}</span><button onClick={()=>delResource(r.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:12}}>×</button>
    </div>)}
    <div style={{display:'flex',gap:5,marginBottom:14}}>
      <input className="inp" value={newResource} onChange={e=>setNewResource(e.target.value)} placeholder="Link/tên tài liệu..." style={{flex:1,fontSize:11}} onKeyDown={e=>e.key==='Enter'&&addResource()}/>
      <button className="btn-p btn-sm" onClick={addResource}>+</button>
    </div>

    <div className="tx-dm" style={{marginBottom:5,fontWeight:600}}>☑️ Custom Todos</div>
    {f.customTodos.map(t=><div key={t.id} style={{display:'flex',gap:6,alignItems:'center',marginBottom:4}}>
      <span style={{fontSize:11,flex:1}}>{t.text}</span><button onClick={()=>delTodo(t.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:12}}>×</button>
    </div>)}
    <div style={{display:'flex',gap:5,marginBottom:18}}>
      <input className="inp" value={newTodo} onChange={e=>setNewTodo(e.target.value)} placeholder="VD: Đọc slide, làm bài tập..." style={{flex:1,fontSize:11}} onKeyDown={e=>e.key==='Enter'&&addTodo()}/>
      <button className="btn-p btn-sm" onClick={addTodo}>+</button>
    </div>

    <div style={{display:'flex',gap:8}}>
      <button className="btn-p" style={{flex:1,justifyContent:'center'}} onClick={()=>save('planned')}>{session?'Lưu':'Lưu & Lên kế hoạch'}</button>
      {!session&&<button className="btn-g" onClick={()=>save('draft')}>Lưu Draft</button>}
      <button className="btn-g" onClick={onClose}>Huỷ</button>
    </div>
  </div></div>;}

/* ── Finish Study modal: reflection, questions, action items, confidence/difficulty,
   per-concept touch ratings, notes. This is where mastery actually updates. ── */
/* ── v13: one-time bottom-sheet CSS, injected like applyTheme's #br-override
   in 02-theme.js. Pilot for FinishSessionModal ONLY (per user's request:
   try 1 spot before considering it everywhere — Finish is the most-used
   modal in the app, so it's the highest-signal place to try). Keeps ALL of
   FinishSessionModal's internal fields/logic untouched — only the outer
   shell changes from centered popup to a sheet anchored at the bottom. ── */
(function injectBottomSheetCSS(){
  if(document.getElementById('bs-style'))return;
  const el=document.createElement('style');el.id='bs-style';
  el.textContent=`
    .bs-ov{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:999;display:flex;align-items:flex-end;justify-content:center;animation:bsFadeIn .2s ease}
    .bs-panel{background:var(--card);border-radius:16px 16px 0 0;width:100%;max-width:560px;max-height:88vh;overflow-y:auto;padding:10px 18px 22px;box-sizing:border-box;animation:bsSlideUp .25s cubic-bezier(.16,1,.3,1);box-shadow:0 -8px 30px rgba(0,0,0,.35)}
    .bs-handle{width:36px;height:4px;background:var(--bdr);border-radius:2px;margin:0 auto 14px;cursor:pointer}
    @keyframes bsSlideUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
    @keyframes bsFadeIn{from{opacity:0}to{opacity:1}}
  `;
  document.head.appendChild(el);
})();

function FinishSessionModal({session,concepts,currentChecklist,onSave,onClose}){
  const sessionConcepts=concepts.filter(c=>(session.conceptIds||[]).includes(c.id));
  const [reflection,setReflection]=useState('');
  const [questionsRaised,setQuestionsRaised]=useState('');
  const [actionItems,setActionItems]=useState([]);
  const [newAction,setNewAction]=useState('');
  const [confidenceAfter,setConfidenceAfter]=useState(3);
  const [difficulty,setDifficulty]=useState(3);
  const [notes,setNotes]=useState('');
  const [checklist]=useState(currentChecklist||[]);
  const [touches,setTouches]=useState(sessionConcepts.map(c=>({conceptId:c.id,understanding:3,confidence:3})));
  const setTouch=(conceptId,k,v)=>setTouches(p=>p.map(t=>t.conceptId===conceptId?{...t,[k]:v}:t));
  const addAction=()=>{if(!newAction.trim())return;setActionItems(p=>[...p,{id:uid(),text:newAction.trim(),done:false}]);setNewAction('');};

  const Picker=({value,onChange,activeColor})=><div style={{display:'flex',gap:5}}>
    {[1,2,3,4,5].map(n=><button key={n} onClick={()=>onChange(n)} style={{flex:1,padding:'7px 0',borderRadius:6,border:`1.5px solid ${value>=n?activeColor:'var(--bdr)'}`,background:value>=n?activeColor+'22':'transparent',color:value>=n?activeColor:'var(--dm)',cursor:'pointer',fontSize:12,fontWeight:700}}>{n}</button>)}
  </div>;

  return<div className="bs-ov" onClick={onClose}><div className="bs-panel" onClick={e=>e.stopPropagation()}>
    <div className="bs-handle" onClick={onClose} title="Đóng"/>
    <div className="flex-sb" style={{marginBottom:4}}><span style={{fontSize:15,fontWeight:600}}>🏁 Kết thúc buổi học</span><button className="btn-g btn-sm" onClick={onClose}>✕</button></div>
    <div className="tx-dm" style={{marginBottom:16}}>{session.title}</div>

    {sessionConcepts.length===0&&<div style={{background:'var(--wab)',border:'1px solid var(--waBdr)',borderRadius:8,padding:'9px 11px',marginBottom:16,fontSize:11,color:'var(--wa)'}}>
      ⚠️ Session này chưa gắn Concept nào — kết thúc sẽ <b>không</b> cập nhật % tiến độ của môn học. Nếu buổi học này thực sự phục vụ 1 Concept cụ thể, bấm ✏️ sửa Session trước khi Kết thúc để chọn Concept.
    </div>}

    {sessionConcepts.length>0&&<div style={{marginBottom:16}}>
      <div className="tx-dm" style={{marginBottom:6,fontWeight:600}}>📚 Đánh giá từng Concept đã học</div>
      {sessionConcepts.map(c=>{const t=touches.find(x=>x.conceptId===c.id);return<div key={c.id} style={{background:'var(--sur)',borderRadius:8,padding:'8px 10px',marginBottom:6}}>
        <div style={{fontSize:11,fontWeight:600,marginBottom:6}}>{c.title}</div>
        <div style={{fontSize:9,color:'var(--dm)',marginBottom:3}}>Understanding</div>
        <Picker value={t.understanding} onChange={v=>setTouch(c.id,'understanding',v)} activeColor="var(--acc)"/>
        <div style={{fontSize:9,color:'var(--dm)',margin:'6px 0 3px'}}>Confidence</div>
        <Picker value={t.confidence} onChange={v=>setTouch(c.id,'confidence',v)} activeColor="var(--wa)"/>
      </div>;})}
    </div>}

    <div className="tx-dm" style={{marginBottom:4}}>📝 Reflection — hôm nay học được gì?</div>
    <textarea value={reflection} onChange={e=>setReflection(e.target.value)} rows={3} placeholder="Tóm tắt buổi học..."
      style={{width:'100%',background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:7,padding:'7px 9px',color:'var(--tx)',fontSize:12,outline:'none',fontFamily:'inherit',resize:'vertical',boxSizing:'border-box',marginBottom:10}}/>

    <div className="tx-dm" style={{marginBottom:4}}>❓ Questions Raised (tùy chọn)</div>
    <textarea value={questionsRaised} onChange={e=>setQuestionsRaised(e.target.value)} rows={2} placeholder="Câu hỏi còn thắc mắc..."
      style={{width:'100%',background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:7,padding:'7px 9px',color:'var(--tx)',fontSize:12,outline:'none',fontFamily:'inherit',resize:'vertical',boxSizing:'border-box',marginBottom:10}}/>

    <div className="tx-dm" style={{marginBottom:4}}>✅ Action Items (tùy chọn)</div>
    {actionItems.map(a=><div key={a.id} style={{display:'flex',gap:6,alignItems:'center',marginBottom:4}}>
      <span style={{fontSize:11,flex:1}}>{a.text}</span><button onClick={()=>setActionItems(p=>p.filter(x=>x.id!==a.id))} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:12}}>×</button>
    </div>)}
    <div style={{display:'flex',gap:5,marginBottom:14}}>
      <input className="inp" value={newAction} onChange={e=>setNewAction(e.target.value)} placeholder="VD: Làm lại bài tập 3..." style={{flex:1,fontSize:11}} onKeyDown={e=>e.key==='Enter'&&addAction()}/>
      <button className="btn-p btn-sm" onClick={addAction}>+</button>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
      <div><div className="tx-dm" style={{marginBottom:5}}>Confidence sau buổi học</div><Picker value={confidenceAfter} onChange={setConfidenceAfter} activeColor="var(--su)"/></div>
      <div><div className="tx-dm" style={{marginBottom:5}}>Độ khó</div><Picker value={difficulty} onChange={setDifficulty} activeColor="var(--cr)"/></div>
    </div>

    <div className="tx-dm" style={{marginBottom:4}}>Ghi chú thêm (tùy chọn)</div>
    <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={2} placeholder="..."
      style={{width:'100%',background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:7,padding:'7px 9px',color:'var(--tx)',fontSize:12,outline:'none',fontFamily:'inherit',resize:'vertical',boxSizing:'border-box',marginBottom:16}}/>

    <button className="btn-p" style={{width:'100%',justifyContent:'center'}} onClick={()=>onSave({reflection,questionsRaised,actionItems,confidenceAfter,difficulty,notes,conceptTouches:touches,checklist})}>✅ Lưu & Hoàn thành</button>
  </div></div>;}

/* ── Manual edit for an already-completed Journal Entry — per user's request,
   nothing should be permanently locked after Finish. Editing understanding/
   confidence here also syncs the matching Concept.touches entry (by sessionId)
   so mastery stays consistent with whatever you correct here. ── */
function EditJournalEntryModal({entry,concepts,onSave,onClose}){
  const [f,setF]=useState({
    duration:entry.duration||0,reflection:entry.reflection||'',questionsRaised:entry.questionsRaised||'',
    actionItems:entry.actionItems||[],confidenceAfter:entry.confidenceAfter||0,difficulty:entry.difficulty||0,
    notes:entry.notes||'',conceptTouches:entry.conceptTouches||[],
  });
  const [newAction,setNewAction]=useState('');
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const setTouch=(conceptId,k,v)=>setF(p=>({...p,conceptTouches:p.conceptTouches.map(t=>t.conceptId===conceptId?{...t,[k]:v}:t)}));
  const addAction=()=>{if(!newAction.trim())return;setF(p=>({...p,actionItems:[...p.actionItems,{id:uid(),text:newAction.trim(),done:false}]}));setNewAction('');};
  const delAction=(id)=>setF(p=>({...p,actionItems:p.actionItems.filter(a=>a.id!==id)}));
  const togAction=(id)=>setF(p=>({...p,actionItems:p.actionItems.map(a=>a.id===id?{...a,done:!a.done}:a)}));

  const Picker=({value,onChange,activeColor})=><div style={{display:'flex',gap:5}}>
    {[1,2,3,4,5].map(n=><button key={n} onClick={()=>onChange(n)} style={{flex:1,padding:'7px 0',borderRadius:6,border:`1.5px solid ${value>=n?activeColor:'var(--bdr)'}`,background:value>=n?activeColor+'22':'transparent',color:value>=n?activeColor:'var(--dm)',cursor:'pointer',fontSize:12,fontWeight:700}}>{n}</button>)}
  </div>;

  return<div className="ov" onClick={onClose}><div className="modal" style={{maxWidth:440,maxHeight:'85vh',overflowY:'auto'}} onClick={e=>e.stopPropagation()}>
    <div className="flex-sb" style={{marginBottom:14}}><span style={{fontSize:15,fontWeight:600}}>✏️ Sửa Journal Entry</span><button className="btn-g btn-sm" onClick={onClose}>✕</button></div>

    <div className="tx-dm" style={{marginBottom:2}}>Thời lượng (phút)</div>
    <input type="number" className="inp" value={f.duration} onChange={e=>s('duration',parseInt(e.target.value)||0)} style={{marginBottom:12}}/>

    {f.conceptTouches.length>0&&<div style={{marginBottom:14}}>
      <div className="tx-dm" style={{marginBottom:6,fontWeight:600}}>📚 Sửa đánh giá Concept</div>
      {f.conceptTouches.map(t=>{const c=concepts.find(x=>x.id===t.conceptId);return<div key={t.conceptId} style={{background:'var(--sur)',borderRadius:8,padding:'8px 10px',marginBottom:6}}>
        <div style={{fontSize:11,fontWeight:600,marginBottom:6}}>{c?.title||'(concept đã xoá)'}</div>
        <div style={{fontSize:9,color:'var(--dm)',marginBottom:3}}>Understanding</div>
        <Picker value={t.understanding} onChange={v=>setTouch(t.conceptId,'understanding',v)} activeColor="var(--acc)"/>
        <div style={{fontSize:9,color:'var(--dm)',margin:'6px 0 3px'}}>Confidence</div>
        <Picker value={t.confidence} onChange={v=>setTouch(t.conceptId,'confidence',v)} activeColor="var(--wa)"/>
      </div>;})}
    </div>}

    <div className="tx-dm" style={{marginBottom:4}}>📝 Reflection</div>
    <textarea value={f.reflection} onChange={e=>s('reflection',e.target.value)} rows={3}
      style={{width:'100%',background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:7,padding:'7px 9px',color:'var(--tx)',fontSize:12,outline:'none',fontFamily:'inherit',resize:'vertical',boxSizing:'border-box',marginBottom:10}}/>

    <div className="tx-dm" style={{marginBottom:4}}>❓ Questions Raised</div>
    <textarea value={f.questionsRaised} onChange={e=>s('questionsRaised',e.target.value)} rows={2}
      style={{width:'100%',background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:7,padding:'7px 9px',color:'var(--tx)',fontSize:12,outline:'none',fontFamily:'inherit',resize:'vertical',boxSizing:'border-box',marginBottom:10}}/>

    <div className="tx-dm" style={{marginBottom:4}}>✅ Action Items</div>
    {f.actionItems.map(a=><div key={a.id} style={{display:'flex',gap:6,alignItems:'center',marginBottom:4}}>
      <div onClick={()=>togAction(a.id)} style={{width:14,height:14,borderRadius:3,border:`1.5px solid ${a.done?'var(--su)':'var(--bdr)'}`,background:a.done?'var(--su)':'transparent',cursor:'pointer',flexShrink:0}}/>
      <span style={{fontSize:11,flex:1,textDecoration:a.done?'line-through':'none',opacity:a.done?.6:1}}>{a.text}</span>
      <button onClick={()=>delAction(a.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:12}}>×</button>
    </div>)}
    <div style={{display:'flex',gap:5,marginBottom:14}}>
      <input className="inp" value={newAction} onChange={e=>setNewAction(e.target.value)} placeholder="Thêm action item..." style={{flex:1,fontSize:11}} onKeyDown={e=>e.key==='Enter'&&addAction()}/>
      <button className="btn-p btn-sm" onClick={addAction}>+</button>
    </div>

    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
      <div><div className="tx-dm" style={{marginBottom:5}}>Confidence sau buổi học</div><Picker value={f.confidenceAfter} onChange={v=>s('confidenceAfter',v)} activeColor="var(--su)"/></div>
      <div><div className="tx-dm" style={{marginBottom:5}}>Độ khó</div><Picker value={f.difficulty} onChange={v=>s('difficulty',v)} activeColor="var(--cr)"/></div>
    </div>

    <div className="tx-dm" style={{marginBottom:4}}>Ghi chú thêm</div>
    <textarea value={f.notes} onChange={e=>s('notes',e.target.value)} rows={2}
      style={{width:'100%',background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:7,padding:'7px 9px',color:'var(--tx)',fontSize:12,outline:'none',fontFamily:'inherit',resize:'vertical',boxSizing:'border-box',marginBottom:16}}/>

    <div style={{display:'flex',gap:8}}>
      <button className="btn-p" style={{flex:1,justifyContent:'center'}} onClick={()=>onSave({...entry,...f})}>Lưu thay đổi</button>
      <button className="btn-g" onClick={onClose}>Huỷ</button>
    </div>
  </div></div>;}

/* ── Current Session card — the primary "start studying" entry point, per spec.
   Shows live timer if in_progress, checklist ticking, Kết thúc button. ── */
function CurrentSessionCard({course,session,journalEntries,onUpdateCourse,upd,data,awardXP,onEdit,onDelete,onFinished}){
  const [showFinish,setShowFinish]=useState(false);
  const elapsed=useSessionTimer(session);
  const entry=(journalEntries||[]).find(j=>j.id===session.activeJournalEntryId);
  const meta=SESSION_STATUS_META[session.status]||SESSION_STATUS_META.draft;
  const isPaused=session.status==='in_progress'&&!session.activeStartedAt;
  const toggleChecklistItem=(itemId)=>{
    if(!entry)return;
    const checklist=(entry.checklist||[]).map(c=>c.id===itemId?{...c,done:!c.done}:c);
    upd({journalEntries:(data.journalEntries||[]).map(j=>j.id===entry.id?{...j,checklist}:j)});
  };
  const objectives=session.objectives||[];
  const concepts=(course.concepts||[]).filter(c=>(session.conceptIds||[]).includes(c.id));

  return<div className="card" style={{marginBottom:10,border:`1.5px solid ${meta.color}55`,background:session.status==='in_progress'&&!isPaused?meta.color+'0d':'var(--card)'}}>
    <div className="flex-sb" style={{marginBottom:8}}>
      <div style={{display:'flex',alignItems:'center',gap:7}}>
        <span style={{fontSize:15}}>{isPaused?'⏸️':meta.emoji}</span>
        <div>
          <div style={{fontSize:13,fontWeight:700}}>{session.title}</div>
          <div className="tx-dm">{isPaused?'Đã tạm dừng':meta.label} · ~{session.estimatedDuration||0} phút{session.currentPosition?` · 📍 ${session.currentPosition}`:''}</div>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        {session.status==='in_progress'&&<div style={{fontSize:22,fontWeight:800,color:isPaused?'var(--dm)':meta.color,fontFamily:'monospace',fontVariantNumeric:'tabular-nums'}}>{fmtS(elapsed)}</div>}
        {(onEdit||onDelete)&&<div style={{display:'flex',gap:4}}>
          {onEdit&&<button onClick={onEdit} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:11,opacity:.5}}>✏️</button>}
          {onDelete&&<button onClick={onDelete} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:13,opacity:.35}}>×</button>}
        </div>}
      </div>
    </div>

    {objectives.length>0&&<div style={{marginBottom:8}}>
      <div className="tx-dm" style={{marginBottom:3,fontWeight:600}}>🎯 Objectives</div>
      {objectives.map(o=><div key={o.id} style={{fontSize:11,padding:'2px 0'}}>• {o.text}</div>)}
    </div>}
    {concepts.length>0&&<div style={{marginBottom:8,display:'flex',flexWrap:'wrap',gap:4}}>
      {concepts.map(c=><span key={c.id} style={{fontSize:9,background:'var(--sur)',borderRadius:4,padding:'2px 6px',color:'var(--mu)'}}>{c.title}</span>)}
    </div>}
    {session.resources?.length>0&&<div className="tx-dm" style={{marginBottom:8}}>📎 {session.resources.map(r=>r.text).join(' · ')}</div>}

    {session.status==='in_progress'&&entry?.checklist?.length>0&&<div style={{marginBottom:10}}>
      {entry.checklist.map(item=><div key={item.id} onClick={()=>toggleChecklistItem(item.id)} style={{display:'flex',gap:7,alignItems:'center',padding:'4px 0',cursor:'pointer'}}>
        <div style={{width:16,height:16,borderRadius:4,border:`1.5px solid ${item.done?meta.color:'var(--bdr)'}`,background:item.done?meta.color:'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{item.done&&<span style={{color:'#fff',fontSize:9}}>✓</span>}</div>
        <span style={{fontSize:11,textDecoration:item.done?'line-through':'none',opacity:item.done?.55:1}}>{item.text}</span>
      </div>)}
    </div>}

    {/* ── Current Position: điểm dừng chính xác (câu X/Y, video mm:ss...) — lưu khi
       rời khỏi ô (onBlur), không lưu theo từng phím gõ. Giúp Resume không cần nhớ
       tay đang học tới đâu, đúng nguyên tắc "StudyOS remembers, learner doesn't". ── */}
    {session.status==='in_progress'&&<div style={{marginBottom:10}}>
      <div className="tx-dm" style={{marginBottom:3,fontWeight:600}}>📍 Đang ở đâu?</div>
      <input className="inp" defaultValue={session.currentPosition||''} placeholder="VD: Câu 11/30, Video 18:24, Trang 42..."
        onBlur={e=>{if(e.target.value!==(session.currentPosition||''))onUpdateCourse({sessions:(course.sessions||[]).map(s=>s.id===session.id?{...s,currentPosition:e.target.value}:s)});}}
        style={{fontSize:12}}/>
    </div>}

    {session.status==='planned'&&<button className="btn-p" style={{width:'100%',justifyContent:'center',padding:'10px'}} onClick={()=>startSession(course,session,onUpdateCourse,upd,data,awardXP)}>▶ Bắt đầu học</button>}
    {session.status==='in_progress'&&<div style={{display:'flex',gap:8}}>
      {isPaused
        ?<button className="btn-p" style={{flex:1,justifyContent:'center',padding:'10px'}} onClick={()=>resumeSession(course,session,onUpdateCourse,upd,data)}>▶ Tiếp tục</button>
        :<button className="btn-g" style={{flex:1,justifyContent:'center',padding:'10px'}} onClick={()=>pauseSession(course,session,onUpdateCourse)}>⏸ Tạm dừng</button>}
      <button className="btn-p" style={{flex:1,justifyContent:'center',padding:'10px',background:'var(--su)'}} onClick={()=>setShowFinish(true)}>🏁 Kết thúc</button>
    </div>}
    {session.status==='completed'&&<button className="btn-g btn-sm" onClick={()=>markReviewed(course,session,onUpdateCourse)}>🔍 Đánh dấu đã Review</button>}

    {showFinish&&<FinishSessionModal session={session} concepts={course.concepts||[]} currentChecklist={entry?.checklist||[]}
      onSave={formData=>{finishSession(course,session,formData,onUpdateCourse,upd,data,awardXP,onFinished);setShowFinish(false);}}
      onClose={()=>setShowFinish(false)}/>}
  </div>;}

/* ── Session Library — replaces the Bước-1 placeholder. Shows the Current Session
   (in_progress, else earliest planned) prominently, other sessions grouped below,
   and lets you create new Session blueprints. ── */
function SessionLibraryBlock({course,data,upd,awardXP,onUpdate}){
  const [showEditor,setShowEditor]=useState(false);
  const [editSession,setEditSession]=useState(null);
  const [showQuick,setShowQuick]=useState(false);
  const [quickTitle,setQuickTitle]=useState('');
  const [showBulkImport,setShowBulkImport]=useState(false);
  const [nextQueue,setNextQueue]=useState(null); // {deltas, simulatedData} — set right after Finish
  const sessions=course.sessions||[];
  const legacy=course.legacyLearningObjectives||[];
  // Prefer the session that's ACTUALLY running (activeStartedAt set) over one
  // that's merely status='in_progress' but paused — both can coexist in the
  // same course right after the parallel-session guard pauses an old one
  // in place (its status stays 'in_progress', only activeStartedAt clears).
  // Falling back to plain .find() would show whichever comes first in array
  // order, which is not necessarily the one truly running.
  const inProgress=sessions.find(s=>s.status==='in_progress'&&s.activeStartedAt)||sessions.find(s=>s.status==='in_progress');
  const planned=sessions.filter(s=>s.status==='planned').sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));
  const current=inProgress||planned[0]||null;
  const others=sessions.filter(s=>s.id!==current?.id);
  const saveSession=(f)=>{
    const withMeta=f.createdAt?f:{...f,createdAt:Date.now()};
    if(sessions.find(s=>s.id===f.id))onUpdate({sessions:sessions.map(s=>s.id===f.id?withMeta:s)});
    else onUpdate({sessions:[...sessions,withMeta]});
    setShowEditor(false);setEditSession(null);
  };
  const delSession=(id)=>{
    if(!confirm('Xoá Session này? Journal Entry liên quan (nếu có) cũng sẽ bị xoá.'))return;
    onUpdate({sessions:sessions.filter(s=>s.id!==id)});
    upd({journalEntries:(data.journalEntries||[]).filter(j=>j.sessionId!==id)});
  };
  const startQuick=()=>{
    if(!quickTitle.trim())return;
    quickStartFreeformSession(data,upd,course,quickTitle.trim());
    setQuickTitle('');setShowQuick(false);
  };
  // Called by CurrentSessionCard right after Finish. `data` here is still the
  // PRE-finish snapshot (React state hasn't propagated yet), so we simulate
  // the post-finish state ourselves — otherwise computeNextAction would still
  // see the just-finished Session as in_progress and wrongly re-suggest it.
  const handleFinished=(finishedSessionId,deltas)=>{
    const simulatedData={...data,courses:data.courses.map(c=>c.id!==course.id?c:{...c,sessions:(c.sessions||[]).map(s=>s.id===finishedSessionId?{...s,status:'completed'}:s)})};
    setNextQueue({deltas,simulatedData});
  };

  return<div style={{marginBottom:10}}>
    <div className="flex-sb" style={{marginBottom:8}}>
      <div className="lbl" style={{margin:0}}>🎯 CURRENT SESSION</div>
      <div style={{display:'flex',gap:6}}>
        <button className="btn-g btn-sm" onClick={()=>setShowQuick(s=>!s)}>⚡ Quick Session</button>
        <button className="btn-g btn-sm" onClick={()=>setShowBulkImport(true)}>📥 Import nhiều</button>
        <button className="btn-g btn-sm" onClick={()=>setShowEditor(true)}>+ Session mới</button>
      </div>
    </div>

    {showBulkImport&&<BulkImportSessionsModal concepts={course.concepts||[]}
      onSave={(newSessions)=>{onUpdate({sessions:[...sessions,...newSessions]});setShowBulkImport(false);}}
      onClose={()=>setShowBulkImport(false)}/>}

    {showQuick&&<div className="card" style={{marginBottom:10,display:'flex',gap:6}}>
      <input className="inp" autoFocus value={quickTitle} onChange={e=>setQuickTitle(e.target.value)} placeholder="Tên nhanh, vd: Ôn lại bài cũ..." style={{flex:1}} onKeyDown={e=>e.key==='Enter'&&startQuick()}/>
      <button className="btn-p btn-sm" onClick={startQuick}>▶ Start</button>
    </div>}

    {nextQueue&&<div className="card" style={{marginBottom:10,border:'1.5px solid var(--suBdr)',background:'var(--sub)'}}>
      <div style={{textAlign:'center',marginBottom:nextQueue.deltas.length>0?8:0}}>
        <div style={{fontSize:20,marginBottom:2}}>🎉</div>
        <div style={{fontSize:13,fontWeight:700}}>Xong! Làm tốt lắm.</div>
      </div>
      {nextQueue.deltas.map(d=><div key={d.conceptId} style={{fontSize:11,color:'var(--su)',textAlign:'center'}}>📈 {d.title}: {d.before}% → {d.after}%</div>)}
      <div style={{marginTop:10,paddingTop:10,borderTop:'1px solid var(--bdr)'}}>
        <NextActionBanner data={nextQueue.simulatedData} upd={upd} awardXP={awardXP}/>
      </div>
      <button className="btn-g btn-sm" style={{width:'100%',justifyContent:'center'}} onClick={()=>setNextQueue(null)}>Đóng</button>
    </div>}

    {current?<CurrentSessionCard key={current.id} course={course} session={current} journalEntries={data.journalEntries} onUpdateCourse={onUpdate} upd={upd} data={data} awardXP={awardXP}
        onEdit={()=>setEditSession(current)} onDelete={()=>delSession(current.id)} onFinished={(deltas)=>handleFinished(current.id,deltas)}/>
      :<div className="card" style={{marginBottom:10,textAlign:'center',padding:18}}>
        <div className="tx-dm" style={{marginBottom:8}}>Chưa có Session nào đang chờ học.</div>
        <button className="btn-p btn-sm" onClick={()=>setShowEditor(true)}>+ Tạo Session đầu tiên</button>
      </div>}

    {others.length>0&&<div className="card" style={{marginBottom:10}}>
      <div className="lbl" style={{marginBottom:8}}>📋 CÁC SESSION KHÁC</div>
      {others.map(s=>{const meta=SESSION_STATUS_META[s.status]||SESSION_STATUS_META.draft;return<div key={s.id} style={{display:'flex',alignItems:'center',gap:8,padding:'6px 0',borderBottom:'1px solid var(--bdr)'}}>
        <span style={{fontSize:12}}>{meta.emoji}</span>
        <div style={{flex:1}}><div style={{fontSize:11,fontWeight:500}}>{s.title}</div><div className="tx-dm">{meta.label}</div></div>
        <button onClick={()=>setEditSession(s)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:11,opacity:.5}}>✏️</button>
        <button onClick={()=>delSession(s.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:13,opacity:.35}}>×</button>
      </div>;})}
    </div>}

    {legacy.length>0&&<div className="card" style={{marginBottom:10,borderStyle:'dashed'}}>
      <div className="tx-dm" style={{fontWeight:600,marginBottom:5}}>📥 Objectives cũ (chưa gắn Session):</div>
      {legacy.map((o,i)=><div key={o.id} style={{fontSize:11,color:'var(--mu)',padding:'2px 0'}}>{i+1}. {o.text}</div>)}
    </div>}

    {(showEditor||editSession)&&<SessionEditorModal session={editSession} concepts={course.concepts||[]} onSave={saveSession} onClose={()=>{setShowEditor(false);setEditSession(null);}}/>}
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
function ConceptRow({concept,color,examDate,data,course,upd,onTouch,onEdit,onDelete}){
  const [showHistory,setShowHistory]=useState(false);
  const [showSessions,setShowSessions]=useState(false);
  const touches=concept.touches||[];
  const isTask=concept.targetTouches>0;
  const mastery=calcProgress(concept,data);
  const status=deriveConceptStatus(concept,examDate,data);
  const meta=STATUS_META[status];
  const reviewPriority=computeReviewPriority(concept,examDate,data);
  const rpMeta=REVIEW_PRIORITY_META[reviewPriority];
  const conf=latestConfidence(touches);
  const history=[...touches].sort((a,b)=>a.timestamp-b.timestamp);
  // v13: every Session that lists this Concept in its conceptIds — lets you
  // jump straight from "what am I studying" (Concept) to "which Session
  // covers it" (per user's request: click a Concept, see its Sessions, pick
  // one to start) instead of hunting through the Session list separately.
  const linkedSessions=(course?.sessions||[]).filter(s=>(s.conceptIds||[]).includes(concept.id));
  const onUpdateCourseLocal=course&&upd?(ch)=>upd({courses:data.courses.map(c=>c.id===course.id?{...c,...ch}:c)}):null;
  return<div style={{padding:'8px 0',borderBottom:'1px solid var(--bdr)'}}>
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <span style={{fontSize:13,flexShrink:0}}>{meta.emoji}</span>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3,cursor:linkedSessions.length>0?'pointer':'default'}} onClick={()=>linkedSessions.length>0&&setShowSessions(s=>!s)}>
          <span style={{fontSize:12,fontWeight:500}}>{concept.title}</span>
          {conf>0&&<span style={{fontSize:9,color:'var(--dm)'}}>{'⭐'.repeat(conf)}</span>}
          {reviewPriority!=='None'&&reviewPriority!=='Low'&&<span title={rpMeta.label} style={{fontSize:9,background:rpMeta.color+'22',color:rpMeta.color,borderRadius:4,padding:'1px 5px',fontWeight:700}}>{rpMeta.emoji} {rpMeta.label}</span>}
          {linkedSessions.length>0&&<span style={{fontSize:9,color:'var(--acc)',background:'var(--acc2)',borderRadius:4,padding:'1px 5px'}}>🔗 {linkedSessions.length} session {showSessions?'▲':'▼'}</span>}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <div style={{flex:1}}><Bar v={mastery} color={meta.color}/></div>
          <span style={{fontSize:10,color:meta.color,fontWeight:700,minWidth:34,textAlign:'right'}}>{isTask?`${touches.length}/${concept.targetTouches}`:`${mastery}%`}</span>
        </div>
        <div style={{fontSize:9,color:meta.color,marginTop:2}}>{isTask?'Tiến độ task (đếm số lần hoàn thành, không phải EMA)':meta.label}{history.length>0&&<span style={{color:'var(--dm)'}}> · {history.length} lần đánh giá</span>}
          {history.length>1&&<span onClick={()=>setShowHistory(s=>!s)} style={{color:'var(--acc)',cursor:'pointer',marginLeft:6}}>{showHistory?'ẩn history ▲':'xem history ▼'}</span>}
        </div>
      </div>
      <button onClick={onTouch} title="Ghi nhanh đánh giá" style={{background:'var(--acc2)',border:'1px solid var(--acc3)',borderRadius:7,cursor:'pointer',fontSize:11,padding:'4px 8px',color:'var(--acc)',fontWeight:600,flexShrink:0}}>⚡ Ghi nhanh</button>
      {course&&upd&&<button onClick={()=>quickStartSession(data,upd,course,concept)} title="Tạo Session nhanh cho Concept này và bắt đầu ngay" style={{background:'var(--sub)',border:'1px solid var(--suBdr)',borderRadius:7,cursor:'pointer',fontSize:11,padding:'4px 8px',color:'var(--su)',fontWeight:600,flexShrink:0}}>▶ Bắt đầu ngay</button>}
      <button onClick={onEdit} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:11,opacity:.5}}>✏️</button>
      <button onClick={onDelete} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:13,opacity:.35}}>×</button>
    </div>
    {showSessions&&linkedSessions.length>0&&<div style={{marginTop:8,marginLeft:21,background:'var(--sur)',borderRadius:7,padding:'8px'}}>
      {linkedSessions.map(s=>{
        const smeta=SESSION_STATUS_META[s.status]||{};
        const isPaused=s.status==='in_progress'&&!s.activeStartedAt;
        return<div key={s.id} style={{display:'flex',alignItems:'center',gap:6,padding:'4px 0'}}>
          <span style={{fontSize:11,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.title}</span>
          <span style={{fontSize:9,color:'var(--dm)'}}>{isPaused?'Đã tạm dừng':smeta.label}</span>
          {s.status==='planned'&&onUpdateCourseLocal&&<button className="btn-p btn-sm" onClick={()=>startSession(course,s,onUpdateCourseLocal,upd,data)}>▶ Bắt đầu</button>}
          {isPaused&&onUpdateCourseLocal&&<button className="btn-p btn-sm" onClick={()=>resumeSession(course,s,onUpdateCourseLocal,upd,data)}>▶ Tiếp tục</button>}
        </div>;})}
    </div>}
    {showHistory&&history.length>1&&<div style={{marginTop:8,marginLeft:21,background:'var(--sur)',borderRadius:7,padding:'8px'}}>
      <div style={{display:'flex',alignItems:'flex-end',gap:3,height:40}}>
        {history.map((t,i)=>{
          // Running progress up to this point, so the sparkline matches calcProgress's trajectory
          const runningTouches=history.slice(0,i+1);
          const m=calcProgress({...concept,touches:runningTouches},data);
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
   Session, not Concept-side; a Session declares which Concepts it covers instead).
   v13: optional "Task mode" (targetTouches) — for Concepts that represent a
   deliverable needing N Sessions to actually finish (e.g. "Thuyết trình" =
   3 Sessions), rather than knowledge learned through repetition. Left blank,
   nothing changes — this is purely additive, 100% backward-compatible. ── */
function ConceptEditorModal({concept,chapterId,onSave,onClose}){
  const [f,setF]=useState(concept?{title:concept.title,targetDate:concept.targetDate||concept.legacyDueDate||'',targetTouches:concept.targetTouches||''}:{title:'',targetDate:'',targetTouches:''});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const save=()=>{
    if(!f.title.trim())return;
    const clean={...f,targetTouches:f.targetTouches?Math.max(1,parseInt(f.targetTouches)||0)||undefined:undefined};
    onSave(concept?{...concept,...clean}:{id:uid(),chapterId,touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacySubtasks:[],...clean});
  };
  return<div className="ov" onClick={onClose}><div className="modal" style={{maxWidth:400}} onClick={e=>e.stopPropagation()}>
    <div className="flex-sb" style={{marginBottom:12}}><span style={{fontSize:14,fontWeight:500}}>{concept?'✏️ Sửa Concept':'+ Concept mới'}</span><button className="btn-g btn-sm" onClick={onClose}>✕</button></div>
    <div className="tx-dm" style={{marginBottom:2}}>Tên concept *</div>
    <input className="inp" value={f.title} onChange={e=>s('title',e.target.value)} placeholder="VD: Maximum Likelihood Estimation..." style={{marginBottom:10}} autoFocus/>
    <div className="tx-dm" style={{marginBottom:2}}>Muốn thành thạo trước ngày nào (tùy chọn)</div>
    <input type="date" className="inp" value={f.targetDate} onChange={e=>s('targetDate',e.target.value)} style={{marginBottom:10}}/>
    <div className="tx-dm" style={{marginBottom:2}}>Concept dạng Task — cần bao nhiêu Session mới xong? (tùy chọn)</div>
    <input type="number" min="1" className="inp" value={f.targetTouches} onChange={e=>s('targetTouches',e.target.value)} placeholder="Để trống = tính theo Mastery (kiến thức) như bình thường" style={{marginBottom:4}}/>
    <div style={{fontSize:10,color:'var(--dm)',marginBottom:14}}>Điền số này nếu Concept là 1 việc cần làm (vd "Thuyết trình" cần 3 buổi) chứ không phải kiến thức cần học lại nhiều lần — % sẽ tính theo số buổi đã xong / số buổi cần, không dùng công thức Mastery nữa.</div>
    <div style={{display:'flex',gap:8}}><button className="btn-p" style={{flex:1,justifyContent:'center'}} onClick={save}>Lưu</button><button className="btn-g" onClick={onClose}>Huỷ</button></div>
  </div></div>;}

/* ── Chapter block: header (progress) + expandable Concept list ── */
function ChapterBlock({chapter,concepts,examDate,color,data,course,upd,onAddConcept,onEditConcept,onDeleteConcept,onTouch,onEditChapter,onDeleteChapter,onBulkAddConcepts}){
  const [expanded,setExpanded]=useState(true);
  const [showBulk,setShowBulk]=useState(false);
  const chConcepts=concepts.filter(c=>c.chapterId===chapter.id);
  const prog=chapterProgress(chapter,concepts,data);
  // v13: a Chapter created before any coursePhase existed defaults to
  // coursePhaseId:'' and silently never counts toward Phase/Course progress
  // (found via a real bug report — Concepts showed correct %, Phase stayed
  // at 0%). Surface it right here so it's visible without opening the editor.
  const isOrphanChapter=!chapter.coursePhaseId||!(course.coursePhases||[]).some(p=>p.id===chapter.coursePhaseId);
  return<div className="card" style={{marginBottom:8,padding:'11px 14px',border:isOrphanChapter?'1px solid var(--waBdr)':undefined}}>
    <div style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}} onClick={()=>setExpanded(e=>!e)}>
      <span style={{fontSize:11,color:'var(--dm)'}}>{expanded?'▼':'▶'}</span>
      <span style={{fontSize:13,fontWeight:700,flex:1}}>{chapter.title}</span>
      {isOrphanChapter&&<span title="Chưa gắn Phase nào — % sẽ không tính vào Phase/môn học" style={{fontSize:9,color:'var(--wa)',background:'var(--wab)',border:'1px solid var(--waBdr)',borderRadius:4,padding:'1px 6px',fontWeight:700}}>⚠️ Chưa gắn Phase</span>}
      <div style={{width:60}}><Bar v={prog} color={color}/></div>
      <span style={{fontSize:11,fontWeight:700,color,minWidth:32,textAlign:'right'}}>{prog}%</span>
      <span className="tx-dm" style={{minWidth:50,textAlign:'right'}}>{chConcepts.length} concept</span>
      <button onClick={e=>{e.stopPropagation();onEditChapter();}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:11,opacity:.5}}>✏️</button>
      <button onClick={e=>{e.stopPropagation();onDeleteChapter();}} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:13,opacity:.35}}>×</button>
    </div>
    {expanded&&<div style={{marginTop:8,paddingLeft:19}}>
      {chConcepts.length===0&&<div className="tx-dm" style={{padding:'8px 0'}}>Chưa có concept nào trong chapter này</div>}
      {chConcepts.map(c=><ConceptRow key={c.id} concept={c} color={color} examDate={examDate} data={data} course={course} upd={upd}
        onTouch={()=>onTouch(c)} onEdit={()=>onEditConcept(c)} onDelete={()=>onDeleteConcept(c.id)}/>)}
      <div style={{display:'flex',gap:6,marginTop:8}}>
        <button className="btn-g btn-sm" onClick={()=>onAddConcept(chapter.id)}>+ Thêm Concept</button>
        <button className="btn-g btn-sm" onClick={()=>setShowBulk(true)}>📋 Dán nhanh nhiều Concept</button>
      </div>
    </div>}
    {showBulk&&<BulkAddConceptsModal chapterTitle={chapter.title}
      onSave={(titles)=>{onBulkAddConcepts(chapter.id,titles);setShowBulk(false);}} onClose={()=>setShowBulk(false)}/>}
  </div>;}

/* ── Chapter editor (lightweight — title + which Phase it belongs to) ── */
function ChapterEditorModal({chapter,coursePhases,onSave,onClose}){
  const [f,setF]=useState(chapter?{title:chapter.title,coursePhaseId:chapter.coursePhaseId||''}:{title:'',coursePhaseId:coursePhases[0]?.id||''});
  const isOrphan=f.coursePhaseId&&!coursePhases.some(p=>p.id===f.coursePhaseId);
  const isUnset=!f.coursePhaseId;
  const save=()=>{if(!f.title.trim())return;onSave(chapter?{...chapter,...f}:{id:uid(),...f});};
  return<div className="ov" onClick={onClose}><div className="modal" style={{maxWidth:360}} onClick={e=>e.stopPropagation()}>
    <div className="flex-sb" style={{marginBottom:12}}><span style={{fontSize:14,fontWeight:500}}>{chapter?'✏️ Sửa Chapter':'+ Chapter mới'}</span><button className="btn-g btn-sm" onClick={onClose}>✕</button></div>
    <div className="tx-dm" style={{marginBottom:2}}>Tên chapter *</div>
    <input className="inp" value={f.title} onChange={e=>setF(p=>({...p,title:e.target.value}))} placeholder="VD: Binary Choice Models..." style={{marginBottom:10}} autoFocus/>
    {coursePhases.length>0&&<div>
      <div className="tx-dm" style={{marginBottom:2}}>Thuộc Phase</div>
      {/* v13: explicit placeholder option — without this, a Chapter whose
         coursePhaseId doesn't match any real Phase (orphaned, e.g. created
         before any Phase existed) would have the browser silently render the
         FIRST option as if selected, hiding the mismatch. Now it shows
         clearly as unset until you actually pick one. */}
      <select className="sel" value={f.coursePhaseId} onChange={e=>setF(p=>({...p,coursePhaseId:e.target.value}))} style={{marginBottom:isUnset||isOrphan?6:14}}>
        {(isUnset||isOrphan)&&<option value="">— Chưa gắn Phase nào, chọn 1 cái —</option>}
        {coursePhases.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}
      </select>
      {(isUnset||isOrphan)&&<div style={{fontSize:10,color:'var(--wa)',marginBottom:14}}>⚠️ Chapter này chưa gắn Phase nào — % tiến độ của Phase/môn học sẽ không tính các Concept trong Chapter này cho tới khi bạn chọn 1 Phase và bấm Lưu.</div>}
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

/* ── Schedule timeline — reads Concept.targetDate (new) or legacyDueDate (migrated), colored by mastery status.
   v13: sort by actual Date value (not string .localeCompare — fragile if any
   date ever isn't zero-padded ISO) + show undated Concepts in their own group
   instead of silently hiding them (was making the dated ones look "out of
   order" since the sequence had invisible gaps). ── */
const DAY_PX=15;

/* ── Shared month+day calendar header for the day-strip timeline, horizontally
   scrollable alongside the concept rows below it. ── */
function CalendarDayHeader({days}){
  const monthGroups=[];
  days.forEach(d=>{
    const key=`${d.getFullYear()}-${d.getMonth()}`;
    const last=monthGroups[monthGroups.length-1];
    if(last&&last.key===key)last.count++;
    else monthGroups.push({key,count:1,label:MV[d.getMonth()]});
  });
  return<div style={{position:'sticky',top:0,background:'var(--card)',zIndex:1}}>
    <div style={{display:'flex'}}>
      {monthGroups.map((m,i)=><div key={i} style={{width:m.count*DAY_PX,textAlign:'center',fontSize:9,fontWeight:700,color:'var(--mu)',borderBottom:'1px solid var(--bdr)',paddingBottom:2,whiteSpace:'nowrap',overflow:'hidden'}}>{m.label}</div>)}
    </div>
    <div style={{display:'flex',marginBottom:4}}>
      {days.map((d,i)=><div key={i} style={{width:DAY_PX,textAlign:'center',fontSize:8,color:d.getDay()===0||d.getDay()===6?'#9B7FE0':'var(--dm)'}}>{d.getDate()}</div>)}
    </div>
  </div>;}

/* ── One Concept's day-by-day strip. Color rules (priority order):
   1. Today → green.  2. Weekend → purple (readability aid, applies everywhere).
   3. Past (before today) → gray.  4. Inside THIS concept's own inferred window
   → blue if the window has already started (today ≥ windowStart), else
   yellow (window is still fully in the future). 5. Anything else (future,
   outside this concept's window) → empty/dim, not this row's business.

   v13 caveat, stated plainly: Concepts only ever had a single `targetDate`
   (deadline), never a start date. Rather than block on adding a new field,
   "windowStart" here is INFERRED as the previous concept's targetDate + 1
   day (chronological chain) — a reasonable approximation, not a true
   authored start date. If this doesn't feel right in practice, the real
   fix is adding an explicit start date per Concept — flagged, not silently
   assumed to be good enough forever. ── */
function ConceptDayStripRow({concept,days,windowStart,windowEnd,today}){
  const targetDate=new Date(concept._date);targetDate.setHours(0,0,0,0);
  return<div style={{display:'flex'}}>
    {days.map((d,i)=>{
      const isToday=d.getTime()===today.getTime();
      const isWeekend=d.getDay()===0||d.getDay()===6;
      const isPast=d<today;
      const inWindow=windowStart&&windowEnd&&d>=windowStart&&d<=windowEnd;
      const windowActive=windowStart&&today>=windowStart;
      const isTarget=d.getTime()===targetDate.getTime();
      let bg='transparent',border='1px solid var(--bdr)';
      if(isToday){bg='var(--su)';border='1px solid var(--su)';}
      else if(isWeekend){bg='#7C5CBF55';border='1px solid #7C5CBF88';}
      else if(isPast){bg='var(--dm)';border='1px solid var(--dm)';}
      else if(inWindow){bg=windowActive?'var(--in)':'var(--go)';border=`1px solid ${windowActive?'var(--in)':'var(--go)'}`;}
      return<div key={i} title={fmtL(d)} style={{width:DAY_PX,height:14,boxSizing:'border-box',background:bg,border:isTarget?'2px solid var(--cr)':border,flexShrink:0}}/>;
    })}
  </div>;}

function CourseScheduleView({course,data}){
  const withDate=(course.concepts||[]).filter(c=>c.targetDate||c.legacyDueDate).map(c=>({...c,_date:c.targetDate||c.legacyDueDate})).sort((a,b)=>new Date(a._date)-new Date(b._date));
  const noDate=(course.concepts||[]).filter(c=>!c.targetDate&&!c.legacyDueDate);
  if(withDate.length===0&&noDate.length===0)return null;
  if(withDate.length===0)return<div className="card" style={{marginBottom:10}}>
    <div className="lbl" style={{marginBottom:6}}>📅 STUDY TIMELINE</div>
    <div className="tx-dm">Chưa có Concept nào đặt ngày mục tiêu — xem "Chưa có ngày" bên dưới hoặc thêm ngày ở mỗi Concept.</div>
  </div>;

  const now=new Date();now.setHours(0,0,0,0);
  const startAct=new Date(Math.min(new Date(withDate[0]._date).getTime(),now.getTime()));startAct.setHours(0,0,0,0);
  const endD=new Date(course.examDate||course.endDate||withDate[withDate.length-1]._date);endD.setHours(0,0,0,0);
  const totalD=Math.max(1,Math.round((endD-startAct)/86400000)+1);
  const passedD=Math.min(totalD,Math.max(0,Math.round((now-startAct)/86400000)+1));
  const leftD=Math.max(0,totalD-passedD);

  // Chronological window inference (see ConceptDayStripRow's comment) — must
  // use the DATE-sorted list, before any status-based reordering for display.
  const windows={};
  withDate.forEach((c,i)=>{
    const wEnd=new Date(c._date);wEnd.setHours(0,0,0,0);
    const wStart=i===0?startAct:(()=>{const d=new Date(withDate[i-1]._date);d.setHours(0,0,0,0);d.setDate(d.getDate()+1);return d;})();
    windows[c.id]={windowStart:wStart,windowEnd:wEnd};
  });

  // Display order: đang học (top) → chưa học (giữa) → đã xong (dưới cùng),
  // date-order preserved within each tier since withDate is already sorted
  // and .filter() preserves relative order.
  const inProgress=withDate.filter(c=>{const p=calcProgress(c,data);return p>0&&p<100;});
  const notStarted=withDate.filter(c=>(c.touches||[]).length===0);
  const doneConcepts=withDate.filter(c=>calcProgress(c,data)>=100);
  const ordered=[...inProgress,...notStarted,...doneConcepts];

  const days=[];{let cur=new Date(startAct);while(cur<=endD){days.push(new Date(cur));cur=new Date(cur.getTime()+86400000);}}
  const stripWidth=days.length*DAY_PX;

  return<div className="card" style={{marginBottom:10}}>
    <div className="lbl" style={{marginBottom:6}}>📅 STUDY TIMELINE <span style={{fontWeight:400,color:'var(--dm)',fontSize:9}}>(theo Concept — sẽ chuyển sang Session ở Bước 2)</span></div>
    <div style={{textAlign:'center',marginBottom:8,fontSize:11}}>
      📍 Hôm nay — đã qua {passedD} ngày · còn {leftD} ngày <span style={{color:'var(--dm)'}}>(trong tổng {totalD} ngày)</span>
    </div>
    <div style={{display:'flex',gap:8,marginBottom:6,fontSize:9,color:'var(--mu)',flexWrap:'wrap'}}>
      <span><span style={{display:'inline-block',width:9,height:9,background:'var(--dm)',marginRight:3,verticalAlign:'middle'}}/>Đã qua</span>
      <span><span style={{display:'inline-block',width:9,height:9,background:'var(--su)',marginRight:3,verticalAlign:'middle'}}/>Hôm nay</span>
      <span><span style={{display:'inline-block',width:9,height:9,background:'var(--in)',marginRight:3,verticalAlign:'middle'}}/>Đang trong giai đoạn</span>
      <span><span style={{display:'inline-block',width:9,height:9,background:'var(--go)',marginRight:3,verticalAlign:'middle'}}/>Sắp tới</span>
      <span><span style={{display:'inline-block',width:9,height:9,background:'#7C5CBF88',marginRight:3,verticalAlign:'middle'}}/>Cuối tuần</span>
      <span><span style={{display:'inline-block',width:9,height:9,border:'2px solid var(--cr)',marginRight:3,verticalAlign:'middle'}}/>Deadline</span>
    </div>
    <div style={{overflowX:'auto',paddingBottom:4}}>
      <div style={{width:Math.max(stripWidth,200),marginLeft:140}}>
        <CalendarDayHeader days={days}/>
      </div>
      {ordered.map(c=>{
        const status=deriveConceptStatus(c,course.examDate,data);
        const meta=STATUS_META[status];
        const{windowStart,windowEnd}=windows[c.id];
        const days2=daysTo(c._date);
        return<div key={c.id} style={{display:'flex',alignItems:'center',marginBottom:3}}>
          <div style={{width:140,flexShrink:0,paddingRight:8,overflow:'hidden'}}>
            <div style={{fontSize:10,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{meta.emoji} {c.title}</div>
            <div style={{fontSize:8,color:meta.color}}>{days2<=0?`${Math.abs(days2)}N trước`:`còn ${days2}N`}</div>
          </div>
          <ConceptDayStripRow concept={c} days={days} windowStart={windowStart} windowEnd={windowEnd} today={now}/>
        </div>;})}
    </div>
    {noDate.length>0&&<div style={{marginTop:8,paddingTop:8,borderTop:'1px solid var(--bdr)'}}>
      <div className="tx-dm" style={{marginBottom:4}}>Chưa có ngày mục tiêu ({noDate.length}):</div>
      <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
        {noDate.map(c=><span key={c.id} style={{fontSize:10,background:'var(--sur)',border:'1px solid var(--bdr)',color:'var(--mu)',borderRadius:5,padding:'3px 7px'}}>{c.title}</span>)}
      </div>
    </div>}
  </div>;}

/* ── Course Detail — full page assembly ── */
function CourseDetail({course,data,upd,awardXP,onBack,onUpdate,onDelete}){
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
  const addConceptsBulk=(chapterId,titles)=>{
    const newConcepts=titles.map(title=>({id:uid(),chapterId,title,touches:[],objectiveIds:[],prerequisiteConceptIds:[],legacySubtasks:[],targetDate:''}));
    onUpdate({concepts:[...concepts,...newConcepts]});
  };
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
    <NextActionBanner data={data} upd={upd} awardXP={awardXP} onlyCourseId={course.id}/>
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
    <SessionLibraryBlock course={course} data={data} upd={upd} awardXP={awardXP} onUpdate={onUpdate}/>

    <div className="flex-sb" style={{marginBottom:8}}>
      <div className="lbl" style={{margin:0}}>📚 CHAPTERS & CONCEPTS</div>
      <button className="btn-p btn-sm" onClick={()=>setShowAddChapter(true)}>+ Chapter</button>
    </div>
    {chapters.length===0&&<div className="card"><div className="tx-dm" style={{textAlign:'center',padding:14}}>Chưa có Chapter nào. Thêm Phase trước (nếu cần), rồi thêm Chapter.</div></div>}
    {chapters.map(ch=><ChapterBlock key={ch.id} chapter={ch} concepts={concepts} examDate={course.examDate} color={course.color} data={data} course={course} upd={upd}
      onAddConcept={(chapterId)=>setEditConcept({chapterId})}
      onEditConcept={(c)=>setEditConcept({concept:c,chapterId:c.chapterId})}
      onDeleteConcept={delConcept}
      onTouch={setTouchConcept}
      onEditChapter={()=>setEditChapter(ch)}
      onDeleteChapter={()=>delChapter(ch.id)}
      onBulkAddConcepts={addConceptsBulk}/>)}

    <KnowledgeNotesBlock course={course} onUpdate={onUpdate}/>

    {showEditor&&<CourseEditorModal existing={course} onSave={f=>{onUpdate(f);setShowEditor(false);}} onClose={()=>setShowEditor(false)}/>}
    {(showAddChapter||editChapter)&&<ChapterEditorModal chapter={editChapter} coursePhases={coursePhases} onSave={saveChapter} onClose={()=>{setShowAddChapter(false);setEditChapter(null);}}/>}
    {editConcept&&<ConceptEditorModal concept={editConcept.concept} chapterId={editConcept.chapterId}
      onSave={f=>{editConcept.concept?editConceptSave(f):addConcept(f);setEditConcept(null);}} onClose={()=>setEditConcept(null)}/>}
    {touchConcept&&<ConceptTouchModal concept={touchConcept} color={course.color}
      onSave={(understanding,confidence)=>touchSave(touchConcept.id,understanding,confidence)} onClose={()=>setTouchConcept(null)}/>}
  </div>;}

/* ── Courses list page (wrapper — mostly unchanged) ── */
function CoursesPage({data,upd,awardXP,initCourseId,resetAt}){
  const [sel,setSel]=useState(initCourseId||null);
  const [showEditor,setShowEditor]=useState(false);
  const [showArchived,setShowArchived]=useState(false);
  // v13 fix: previously only synced when initCourseId was truthy, so clicking
  // the sidebar "Môn học" link while deep in a Course Detail did nothing —
  // `sel` stayed stuck (a list-tile click only updates this LOCAL `sel`, it
  // never told the parent, so initCourseId often hadn't actually "changed"
  // from the parent's point of view either). `resetAt` is a fresh timestamp
  // sent by that specific nav click, guaranteeing this effect always has
  // something new to react to and reliably snaps back to the list.
  useEffect(()=>{setSel(initCourseId||null);},[initCourseId,resetAt]);
  const course=data.courses.find(c=>c.id===sel);
  const updCourse=(ch)=>upd({courses:data.courses.map(c=>c.id===sel?{...c,...ch}:c)});
  const delCourse=()=>{upd({courses:data.courses.filter(c=>c.id!==sel)});setSel(null);};
  const addCourse=(f)=>{upd({courses:[...data.courses,f]});setShowEditor(false);setSel(f.id);};
  const visible=data.courses.filter(c=>showArchived?c.archived:!c.archived);

  if(course)return<CourseDetail course={course} data={data} upd={upd} awardXP={awardXP} onBack={()=>setSel(null)} onUpdate={updCourse} onDelete={delCourse}/>;

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
