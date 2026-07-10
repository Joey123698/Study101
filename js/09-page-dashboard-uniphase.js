/* ══════════════════════════════════════════════════════════════
   09-page-dashboard-uniphase.js — Dashboard, Uni Phase Plan, Timeline
   (V12: "Phase" renamed to "Uni Phase" here — semester-wide roadmap,
   distinct from per-course Phase in 08-page-course.js)
   ══════════════════════════════════════════════════════════════ */
function QuickLangInput({data,upd}){
  const [selLang,setSelLang]=useState('de');const [selCat,setSelCat]=useState('vocabulary');const [text,setText]=useState('');const [vocabN,setVocabN]=useState(5);
  const lang=data.languages.find(l=>l.id===selLang);
  const add=()=>{
    if(selCat==='vocabulary'){
      // vocabulary: only increment total counter, never create list items
      const langs=data.languages.map(l=>{
        if(l.id!==selLang)return l;
        const cats={...(l.categories||defCats())};
        const vocab={...(cats.vocabulary||{total:0,weeklyGoal:50})};
        vocab.total=(vocab.total||0)+vocabN;
        cats.vocabulary=vocab;
        return{...l,categories:cats};
      });
      upd({languages:langs});
    } else {
      if(!text.trim())return;
      const langs=data.languages.map(l=>{
        if(l.id!==selLang)return l;
        const cats={...(l.categories||defCats())};
        const catD={...(cats[selCat]||{items:[]})};
        const ni={id:uid(),text:text.trim(),done:false};
        if(selCat==='writing')ni.link='';
        if(selCat==='grammar')ni.level='B1';
        catD.items=[ni,...(catD.items||[])];
        cats[selCat]=catD;
        return{...l,categories:cats};
      });
      upd({languages:langs});setText('');
    }
  };
  const vocab=lang?.categories?.vocabulary||{total:0};
  return<div className="card">
    <div className="lbl" style={{marginBottom:8}}>🌐 NGÔN NGỮ — QUICK LOG</div>
    <div style={{display:'flex',gap:5,marginBottom:7}}>
      {data.languages.map(l=><button key={l.id} className={selLang===l.id?'btn-p btn-sm':'btn-g btn-sm'} onClick={()=>setSelLang(l.id)}>{l.emoji} {l.name.split(' ')[1]}</button>)}
    </div>
    <div style={{display:'flex',gap:4,marginBottom:8,flexWrap:'wrap'}}>
      {[['vocabulary','📝','Từ vựng'],['grammar','📖','Ngữ pháp'],['speaking','🗣️','Nói'],['writing','✍️','Viết']].map(([k,e,lb])=><button key={k} onClick={()=>setSelCat(k)} style={{padding:'3px 8px',borderRadius:5,border:`1px solid ${selCat===k?(lang?.color||'var(--acc)'):'var(--bdr)'}`,background:selCat===k?(lang?.color+'22'||'var(--acc2)'):'transparent',color:selCat===k?(lang?.color||'var(--acc)'):'var(--mu)',cursor:'pointer',fontSize:10,fontWeight:selCat===k?700:400}}>{e} {lb}</button>)}
    </div>
    {selCat==='vocabulary'?<div>
      <div style={{display:'flex',alignItems:'center',gap:8,background:'var(--sur)',borderRadius:8,padding:'8px 12px',marginBottom:6}}>
        <span className="tx-mu">Tổng từ:</span>
        <span style={{fontSize:20,fontWeight:800,color:lang?.color||'var(--acc)'}}>{vocab.total||0}</span>
        <span className="tx-mu">từ</span>
        <div style={{marginLeft:'auto',display:'flex',gap:5}}>
          {[1,5,10,25].map(n=><button key={n} className="btn-p btn-sm" onClick={()=>{const langs=data.languages.map(l=>{if(l.id!==selLang)return l;const cats={...(l.categories||defCats())};const v={...(cats.vocabulary||{total:0})};v.total=(v.total||0)+n;cats.vocabulary=v;return{...l,categories:cats};});upd({languages:langs});}}>{`+${n}`}</button>)}
        </div>
      </div>
      <div style={{fontSize:10,color:'var(--dm)'}}>💡 Từ vựng được log theo số lượng, không theo từng từ cụ thể</div>
    </div>:<div style={{display:'flex',gap:6}}>
      <input className="inp" value={text} onChange={e=>setText(e.target.value)}
        placeholder={selCat==='speaking'?'Topic đã luyện nói...':selCat==='writing'?'Tên bài viết đã làm...':'Điểm ngữ pháp mới...'}
        onKeyDown={e=>e.key==='Enter'&&add()} style={{flex:1,fontSize:12}}/>
      <button className="btn-p btn-sm" onClick={add}>Lưu</button>
    </div>}
    <div style={{marginTop:5,display:'flex',gap:12,flexWrap:'wrap'}}>
      {data.languages.map(l=><span key={l.id} style={{fontSize:10,color:'var(--mu)'}}>{l.emoji} {l.categories?.vocabulary?.total||0} từ</span>)}
    </div>
  </div>;}

function MiniCalendar({events,onDateSelect,selectedDate}){
  const [vy,setVy]=useState(new Date().getFullYear());
  const [vm,setVm]=useState(new Date().getMonth());
  const sel=selectedDate||TODAY;
  const firstDay=(new Date(vy,vm,1).getDay()+6)%7; // Mon=0, Tue=1, ... Sun=6
  const dim=new Date(vy,vm+1,0).getDate();
  const dip=new Date(vy,vm,0).getDate();
  const cells=[];
  for(let i=firstDay-1;i>=0;i--)cells.push({day:dip-i,cur:false});
  for(let i=1;i<=dim;i++)cells.push({day:i,cur:true});
  while(cells.length%7!==0)cells.push({day:cells.length-dim-firstDay+1,cur:false});
  const evByDate={};
  // Include recurring events for this calendar month
  for(let d=1;d<=dim;d++){const ds=`${vy}-${String(vm+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;getEventsOnDate(events,ds).forEach(e=>{if(!evByDate[ds])evByDate[ds]=[];if(!evByDate[ds].find(x=>x.id===e.id))evByDate[ds].push(e);});}
  const TC={academic:'#7C6EF5',exam:'#E24B4A',language:'#FFD700',health:'#1D9E75',networking:'#4FA3FF',other:'#6B75A0'};
  const prev=()=>{if(vm===0){setVm(11);setVy(y=>y-1);}else setVm(m=>m-1);};
  const next=()=>{if(vm===11){setVm(0);setVy(y=>y+1);}else setVm(m=>m+1);};
  return<div>
    <div className="flex-sb" style={{marginBottom:7}}>
      <button className="btn-g btn-sm" onClick={prev}>‹</button>
      <span style={{fontSize:12,fontWeight:600}}>{MV[vm]} {vy}</span>
      <button className="btn-g btn-sm" onClick={next}>›</button>
    </div>
    <div className="cal-grid" style={{marginBottom:3}}>{['T2','T3','T4','T5','T6','T7','CN'].map(d=><div key={d} className="cal-hd">{d}</div>)}</div>
    <div className="cal-grid">{cells.map((c,i)=>{
      if(!c.cur)return<div key={i} className="cal-cell other-month"><span style={{fontSize:11,color:'var(--dm)'}}>{c.day}</span></div>;
      const ds=`${vy}-${String(vm+1).padStart(2,'0')}-${String(c.day).padStart(2,'0')}`;
      const evs=evByDate[ds]||[];const isT=ds===TODAY;const isS=ds===sel;
      return<div key={i} className={`cal-cell ${isT?'today':''} ${isS&&!isT?'selected':''}`} onClick={()=>onDateSelect(ds)}>
        <div style={{fontSize:11,lineHeight:1.3}}>{c.day}</div>
        {evs.length>0&&<div className="cal-dots">{evs.slice(0,3).map((e,j)=><div key={j} className="cal-dot" style={{background:TC[e.type]||'#7C6EF5'}}/>)}</div>}
      </div>;
    })}</div>
  </div>;}

function DashboardPage({data,upd,nav,awardXP}){
  const [editF,setEditF]=useState(false);
  const [fEdit,setFEdit]=useState({mustDo:'',top3:['','','']});
  const [focusDate,setFocusDate]=useState(TODAY);
  const [adminDate,setAdminDate]=useState(TODAY);
  const [selDate,setSelDate]=useState(TODAY);
  const [showAddEv,setShowAddEv]=useState(false);
  const [editEv,setEditEv]=useState(null);
  const [showAddAdmin,setShowAddAdmin]=useState(false);
  const [editAdmin,setEditAdmin]=useState(null); // {src,item}
  const [perfDate,setPerfDate]=useState(TODAY);
  const phase=data.uniPhases.find(p=>p.id===data.currentUniPhaseId);
  const crits=data.courses.filter(c=>c.risk==='critical'&&!c.archived);
  const todayDOW=new Date(TODAY+'T12:00:00').getDay();
  const classesToday=data.courses.filter(c=>!c.archived&&(c.scheduleDOW||[]).includes(todayDOW));
  const togCourseAttend=(course)=>{
    const cur=(course.attendance||{})[TODAY]||{attended:false,note:''};
    const na={...(course.attendance||{}),[TODAY]:{...cur,attended:!cur.attended}};
    upd({courses:data.courses.map(c=>c.id===course.id?{...c,attendance:na}:c)});
  };
  // dailyFocus helpers
  const fd=getDayFocus(data,focusDate);
  const stale=focusDate===TODAY&&!fd.mustDo?.text&&!fd.top3?.some(t=>t.text);
  const openEditF=()=>{setFEdit({mustDo:fd.mustDo?.text||'',top3:(fd.top3||[]).map(t=>t.text||'')});setEditF(true);};
  const saveF=()=>{const nfd={mustDo:{text:fEdit.mustDo.trim(),done:fd.mustDo?.done||false},top3:[{id:'t1',text:fEdit.top3[0]?.trim()||'',done:fd.top3?.[0]?.done||false},{id:'t2',text:fEdit.top3[1]?.trim()||'',done:fd.top3?.[1]?.done||false},{id:'t3',text:fEdit.top3[2]?.trim()||'',done:fd.top3?.[2]?.done||false}]};const df={...(data.dailyFocus||{}),[focusDate]:nfd};upd({dailyFocus:df});if(nfd.mustDo.text&&!fd.mustDo?.text)awardXP(XPR.focus,'Focus set!');setEditF(false);};
  const togMustDo=()=>{const nfd={...fd,mustDo:{...(fd.mustDo||{text:''}),done:!fd.mustDo?.done}};upd({dailyFocus:{...(data.dailyFocus||{}),[focusDate]:nfd}});};
  const togTop3=(id)=>{const nfd={...fd,top3:(fd.top3||[]).map(t=>t.id===id?{...t,done:!t.done}:t)};upd({dailyFocus:{...(data.dailyFocus||{}),[focusDate]:nfd}});};
  const fmtDateNav=(ds)=>{if(ds===TODAY)return'Hôm nay';const d=new Date(ds+'T12:00:00');const diff=Math.round((d-new Date(TODAY+'T12:00:00'))/(86400000));if(diff===1)return'Ngày mai';if(diff===-1)return'Hôm qua';if(diff>0)return`+${diff} ngày`;return`${Math.abs(diff)} ngày trước`;};
  const navFocus=(dir)=>{const d=new Date(focusDate+'T12:00:00');d.setDate(d.getDate()+dir);setFocusDate(toLocalDateStr(d));};
  const navAdmin=(dir)=>{const d=new Date(adminDate+'T12:00:00');d.setDate(d.getDate()+dir);setAdminDate(toLocalDateStr(d));};
  const adminDow=new Date(adminDate+'T12:00:00').getDay();
  const wd=weekDates();
  const weekH=data.studyLog.filter(l=>wd.includes(l.date)).reduce((s,l)=>s+l.hours,0);
  const selEvs=getEventsOnDate(data.events,selDate).sort((a,b)=>a.time.localeCompare(b.time));
  const recAdmin=data.adminTasks.recurring.filter(r=>r.dow.includes(adminDow));
  // dailyAdmin previously also swept up 'rec_'-prefixed completion markers
  // (stored in the same daily[date] bucket) and mislabeled them src:'day',
  // causing a duplicate of the recurring item to render. Filter those out —
  // they're completion state for recAdmin items, not standalone tasks.
  const dailyAdmin=(data.adminTasks.daily[adminDate]||[]).filter(t=>!String(t.id).startsWith('rec_'));
  // Carry-over: one-off ("day") admin tasks from a PAST date that are still
  // not done — surfaced on TODAY's view too, instead of staying buried on a
  // date you'd have to navigate back to find. Only applies when viewing
  // today (not when browsing other dates via ‹ ›), and never touches
  // recurring completion markers.
  const overdueAdmin=adminDate===TODAY?Object.entries(data.adminTasks.daily||{})
    .filter(([date])=>date<TODAY)
    .flatMap(([date,items])=>(items||[]).filter(t=>!String(t.id).startsWith('rec_')&&!t.done).map(t=>({...t,src:'day',overdueFrom:date})))
    :[];
  const allAdmin=[...recAdmin.map(r=>({...r,src:'rec'})),...dailyAdmin.map(t=>({...t,src:'day'})),...overdueAdmin];
  const perfD=(date)=>{const p=data.dailyPerf[date]||{};const h=data.studyLog.filter(l=>l.date===date).reduce((s,l)=>s+l.hours,0);const act=data.habits.filter(x=>!x.archived);return{...p,h,hd:act.filter(x=>x.completions[date]).length,ht:act.length};};
  const perf=perfD(perfDate);
  const isAdminDone=(item)=>{if(item.src==='rec'){const d=data.adminTasks.daily[adminDate]||[];return d.find(t=>t.id===`rec_${item.id}`)?.done||false;}return item.done||false;};
  const togAdmin=(item)=>{
    const at={...data.adminTasks,daily:{...data.adminTasks.daily}};
    if(item.src==='rec'){
      const existing=at.daily[adminDate]||[];
      const key=`rec_${item.id}`;
      const idx=existing.findIndex(t=>t.id===key);
      if(idx>=0)at.daily[adminDate]=existing.map(t=>t.id===key?{...t,done:!t.done}:t);
      else at.daily[adminDate]=[...existing,{id:key,title:item.title,done:true}];
    } else {
      // Overdue items belong to their ORIGINAL date bucket, not today's —
      // update it there so completing it doesn't lose or duplicate history.
      const homeDate=item.overdueFrom||adminDate;
      const existing=at.daily[homeDate]||[];
      at.daily[homeDate]=existing.map(t=>t.id===item.id?{...t,done:!t.done}:t);
    }
    upd({adminTasks:at});
  };
  const saveRating=(r)=>{const dp={...data.dailyPerf,[perfDate]:{...(data.dailyPerf[perfDate]||{}),rating:r}};upd({dailyPerf:dp});};
  const navPerf=(d)=>{const nd=new Date(perfDate);nd.setDate(nd.getDate()+d);const s=toLocalDateStr(nd);if(s<=TODAY)setPerfDate(s);};
  const sorted=[...data.courses].filter(c=>!c.archived).sort((a,b)=>{const o={critical:0,watch:1,medium:2,good:3};return(o[a.risk]??2)-(o[b.risk]??2);});

  const saveAdminEdit=(f)=>{
    if(!editAdmin)return;
    if(editAdmin.src==='rec'){upd({adminTasks:{...data.adminTasks,recurring:data.adminTasks.recurring.map(r=>r.id===editAdmin.item.id?{...r,title:f.title,emoji:f.emoji,dow:f.dow}:r)}});}
    else{const daily={...data.adminTasks.daily};daily[adminDate]=(daily[adminDate]||[]).map(t=>t.id===editAdmin.item.id?{...t,title:f.title,emoji:f.emoji}:t);upd({adminTasks:{...data.adminTasks,daily}});}
    setEditAdmin(null);
  };

  // Deadlines widget: aggregate concept target dates across all non-archived courses
  // (V12: topics/tasks retired — deadlines now come from Concept.targetDate/legacyDueDate)
  const allDeadlines=[];
  data.courses.filter(c=>!c.archived).forEach(c=>{
    (c.concepts||[]).filter(cn=>{const d=cn.targetDate||cn.legacyDueDate;return d&&deriveConceptStatus(cn,c.examDate)!=='Mastered';}).forEach(cn=>{
      allDeadlines.push({type:'concept',courseId:c.id,courseEmoji:c.emoji,courseColor:c.color,courseName:c.name,label:cn.title,date:cn.targetDate||cn.legacyDueDate});
    });
  });
  allDeadlines.sort((a,b)=>a.date.localeCompare(b.date));
  const upcomingDeadlines=allDeadlines.filter(d=>d.date>=TODAY).slice(0,6);
  const overdueDeadlines=allDeadlines.filter(d=>d.date<TODAY);

  // Compact course row (4 per row) - top of dashboard
  const courseTop=<div style={{marginBottom:10}}>
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5}}>
      <div className="lbl" style={{margin:0}}>📚 MÔN HỌC</div>
      <button className="btn-g btn-sm" onClick={()=>nav('courses')}>Tất cả →</button>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}}>
      {sorted.map(c=>{const p=courseProgress(c,data);const d=daysTo(c.examDate||c.endDate);const r=RISK[c.risk]||RISK.medium;
      const ringColor=d!==null?(d<=7?'#E24B4A':d<=14?'#BA7517':d<=28?'#F5A623':c.color):c.color;
      return<div key={c.id} className="course-mini" style={{borderLeft:`3px solid ${c.color}`,borderRadius:9,cursor:'pointer'}}
        onClick={()=>nav('courses',{courseId:c.id})} onMouseEnter={e=>e.currentTarget.style.background='var(--ch)'} onMouseLeave={e=>e.currentTarget.style.background='var(--card)'}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontSize:15}}>{c.emoji}</span>
          {d!==null&&<div style={{textAlign:'right',background:ringColor+'18',borderRadius:6,padding:'2px 6px'}}>
            <div style={{fontSize:19,fontWeight:900,color:ringColor,lineHeight:1}}>{d}</div>
            <div style={{fontSize:7,color:ringColor,fontWeight:700,opacity:.8}}>NGÀY</div>
          </div>}
        </div>
        <div style={{fontSize:10,fontWeight:600,lineHeight:1.2,marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.name}</div>
        <Bar v={p} color={c.color}/><div style={{fontSize:8,color:c.color,fontWeight:600,marginTop:1}}>{p}%</div>
      </div>;})}
    </div>
  </div>;

  // Exam countdown
  const nextExam=data.courses.filter(c=>!c.archived&&c.examDate&&c.examDate>=TODAY).sort((a,b)=>a.examDate.localeCompare(b.examDate))[0];
  const daysToExam=nextExam?daysTo(nextExam.examDate):null;

  return<div>
    <NextActionBanner data={data} upd={upd} awardXP={awardXP} nav={nav}/>
    {courseTop}
    {data.settings?.bannerUrl&&<div style={{width:'100%',height:200,borderRadius:12,marginBottom:14,overflow:'hidden',position:'relative',flexShrink:0}}>
      <img src={data.settings.bannerUrl} alt="banner" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:`${data.settings.bannerPosX??50}% ${data.settings.bannerPosY??50}%`,display:'block'}}
        onError={e=>{
          const fb=toDirectImageUrlFallback(data.settings.bannerUrl);
          if(fb&&e.target.src!==fb){e.target.src=fb;return;} // try secondary Drive endpoint once
          e.target.style.display='none';e.target.parentElement.style.background='var(--sur)';
        }}/>
      <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom,rgba(0,0,0,.1) 0%,transparent 35%,rgba(0,0,0,.65) 100%)'}}/>
      <div style={{position:'absolute',bottom:14,left:16,right:16,display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
        <div><div style={{color:'#fff',fontSize:14,fontWeight:600,textShadow:'0 1px 3px rgba(0,0,0,.5)'}}>{new Date().toLocaleDateString('vi-VN',{weekday:'long',day:'numeric',month:'long'})}</div>
        <div style={{fontSize:12,color:'rgba(255,255,255,.85)',marginTop:2,textShadow:'0 1px 3px rgba(0,0,0,.5)'}}>{phase?.name}</div></div>
        {nextExam&&<div style={{background:'rgba(10,12,22,.6)',backdropFilter:'blur(6px)',borderRadius:14,padding:'8px 20px',textAlign:'center',border:`2px solid ${daysToExam<=7?'#ff6b6b':daysToExam<=14?'#ffa94d':'rgba(255,255,255,.3)'}`}}>
          <div style={{fontSize:44,fontWeight:900,color:daysToExam<=7?'#ff6b6b':daysToExam<=14?'#ffa94d':'#fff',lineHeight:1,textShadow:'0 2px 8px rgba(0,0,0,.4)'}}>{daysToExam}</div>
          <div style={{fontSize:9,color:'rgba(255,255,255,.85)',fontWeight:700,letterSpacing:'.04em',marginTop:2}}>NGÀY ĐẾN THI</div>
          <div style={{fontSize:9,color:'rgba(255,255,255,.65)',marginTop:1}}>{nextExam.emoji} {nextExam.name.split(' ').slice(0,2).join(' ')}</div>
        </div>}
      </div>
    </div>}
    {!data.settings?.bannerUrl&&<div style={{marginBottom:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div className="tx-mu">{new Date().toLocaleDateString('vi-VN',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
          <div style={{fontSize:11,color:'#7C6EF5',marginTop:2}}>📍 {phase?.name} · còn {daysTo(phase?.endDate)} ngày</div>
        </div>
        {nextExam&&<div style={{background:'var(--card)',border:`2px solid ${daysToExam<=7?'var(--crBdr)':daysToExam<=14?'var(--waBdr)':'var(--acc3)'}`,borderRadius:14,padding:'10px 24px',textAlign:'center',flexShrink:0}}>
          <div style={{fontSize:44,fontWeight:900,color:daysToExam<=7?'var(--cr)':daysToExam<=14?'var(--wa)':'var(--acc)',lineHeight:1}}>{daysToExam}</div>
          <div style={{fontSize:9,color:'var(--dm)',fontWeight:700,letterSpacing:'.04em',marginTop:2}}>NGÀY ĐẾN THI</div>
          <div style={{fontSize:10,color:'var(--mu)',marginTop:1}}>{nextExam.emoji} {nextExam.name.split(' ').slice(0,2).join(' ')}</div>
        </div>}
      </div>
    </div>}
    {crits.map(c=><div key={c.id} style={{background:'var(--crb)',border:'1px solid var(--crBdr)',borderRadius:10,padding:'10px 13px',marginBottom:10,display:'flex',gap:10,alignItems:'center'}}>
      <span style={{fontSize:18}}>🚨</span>
      <div><div style={{fontSize:10,fontWeight:700,color:'var(--cr)',marginBottom:2}}>CẦN XỬ LÝ NGAY</div>
        <div style={{fontSize:12}}>{c.emoji} <strong>{c.name}</strong>{c.examDate&&<span style={{color:'var(--cr)'}}> · còn <strong>{daysTo(c.examDate)}</strong> ngày đến thi</span>}</div>
        <div style={{fontSize:11,color:'var(--mu)',marginTop:1}}>{c.nextAction}</div>
      </div>
    </div>)}
    {overdueDeadlines.length>0&&<div style={{background:'var(--wab)',border:'1px solid var(--waBdr)',borderRadius:10,padding:'9px 13px',marginBottom:10,fontSize:11,color:'var(--wa)'}}>
      ⚠️ {overdueDeadlines.length} deadline đã quá hạn — xem bên dưới
    </div>}
    {classesToday.length>0&&<div className="card" style={{marginBottom:10}}>
      <div className="lbl" style={{marginBottom:6}}>📋 ĐIỂM DANH HÔM NAY</div>
      {classesToday.map(c=>{
        const attended=((c.attendance||{})[TODAY]||{}).attended;
        return<div key={c.id} style={{display:'flex',alignItems:'center',gap:8,padding:'4px 0'}}>
          <div onClick={()=>togCourseAttend(c)} style={{width:20,height:20,borderRadius:5,border:`1.5px solid ${attended?c.color:'var(--bdr)'}`,background:attended?c.color+'33':'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}}>
            {attended&&<span style={{color:c.color,fontSize:11,fontWeight:700}}>✓</span>}
          </div>
          <span style={{fontSize:12,flex:1}}>{c.emoji} {c.name}</span>
          <span style={{fontSize:10,color:attended?c.color:'var(--dm)',fontWeight:600}}>{attended?'Đã điểm danh':'Chưa điểm danh'}</span>
        </div>;})}
    </div>}
    {(upcomingDeadlines.length>0||overdueDeadlines.length>0)&&<div className="card" style={{marginBottom:10}}>
      <div className="flex-sb" style={{marginBottom:8}}><div className="lbl" style={{margin:0}}>⏰ DEADLINES (từ tất cả môn học)</div><button className="btn-g btn-sm" onClick={()=>nav('courses')}>Xem môn học →</button></div>
      {overdueDeadlines.slice(0,3).map((d,i)=><div key={'o'+i} className="deadline-row">
        <span style={{fontSize:14}}>{d.courseEmoji}</span>
        <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.label}</div><div className="tx-dm">{d.courseName}</div></div>
        <span style={{fontSize:10,color:'var(--cr)',fontWeight:700,whiteSpace:'nowrap'}}>Quá hạn!</span>
      </div>)}
      {upcomingDeadlines.map((d,i)=>{const days=daysTo(d.date);return<div key={'u'+i} className="deadline-row">
        <span style={{fontSize:14}}>{d.courseEmoji}</span>
        <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.label}</div><div className="tx-dm">{d.courseName} · {fmt(d.date)}{d.time?` ${d.time}`:''}</div></div>
        <span style={{fontSize:10,color:days<=2?'var(--cr)':days<=5?'var(--wa)':'var(--mu)',fontWeight:700,whiteSpace:'nowrap'}}>{days}N</span>
      </div>;})}
    </div>}
    <div className="g2" style={{marginBottom:10}}>
      <div className="card" style={{borderColor:stale?'var(--waBdr)':'rgba(124,110,245,.3)'}}>
        {/* Header: label + date nav + edit */}
        <div style={{display:'flex',alignItems:'center',gap:4,marginBottom:7}}>
          <div className="lbl" style={{margin:0,flex:1}}>⚡ FOCUS</div>
          <button className="btn-g btn-sm" onClick={()=>navFocus(-1)}>‹</button>
          <div style={{position:'relative'}}>
            <input type="date" value={focusDate} onChange={e=>e.target.value&&setFocusDate(e.target.value)}
              style={{position:'absolute',opacity:0,width:'100%',height:'100%',cursor:'pointer',top:0,left:0,zIndex:1}}/>
            <span style={{fontSize:10,color:focusDate===TODAY?'var(--acc)':'var(--tx)',fontWeight:focusDate===TODAY?700:400,minWidth:72,textAlign:'center',display:'block',padding:'0 2px',position:'relative',zIndex:0}}>
              {fmtDateNav(focusDate)}<br/><span style={{fontSize:9,color:'var(--dm)'}}>{fmt(focusDate)}</span>
            </span>
          </div>
          <button className="btn-g btn-sm" onClick={()=>navFocus(1)}>›</button>
          {focusDate!==TODAY&&<button className="btn-g btn-sm" onClick={()=>setFocusDate(TODAY)} style={{fontSize:9}}>Now</button>}
          <button className="btn-g btn-sm" onClick={openEditF}>✏️</button>
        </div>
        {stale&&<div style={{background:'var(--wab)',border:'1px solid var(--waBdr)',borderRadius:6,padding:'5px 9px',marginBottom:7,fontSize:11,color:'var(--wa)'}}>⚠️ Chưa set focus — <span style={{textDecoration:'underline',cursor:'pointer'}} onClick={openEditF}>đặt ngay</span></div>}
        {editF?<div>
          <div className="tx-dm" style={{marginBottom:2}}>🎯 MUST DO</div>
          <input className="inp" value={fEdit.mustDo} onChange={e=>setFEdit(p=>({...p,mustDo:e.target.value}))} placeholder="Việc quan trọng nhất..." style={{marginBottom:6}} autoFocus/>
          <div className="tx-dm" style={{marginBottom:2}}>📌 TOP 3</div>
          {fEdit.top3.map((t,i)=><input key={i} className="inp" value={t} onChange={e=>{const a=[...fEdit.top3];a[i]=e.target.value;setFEdit(p=>({...p,top3:a}));}} placeholder={`Task ${i+1}...`} style={{marginBottom:4}} onKeyDown={e=>e.key==='Enter'&&i===2&&saveF()}/>)}
          <div style={{display:'flex',gap:5,marginTop:6}}><button className="btn-p btn-sm" onClick={saveF}>Lưu</button><button className="btn-g btn-sm" onClick={()=>setEditF(false)}>Huỷ</button></div>
        </div>:<div>
          {fd.mustDo?.text
            ?<div style={{background:'var(--acc2)',border:'1px solid var(--acc3)',borderRadius:7,padding:'8px 10px',marginBottom:6,display:'flex',alignItems:'center',gap:8,cursor:'pointer'}} onClick={togMustDo}>
              <Tick done={fd.mustDo.done} color='var(--acc)' onClick={togMustDo}/>
              <div style={{flex:1}}>
                <div style={{fontSize:9,color:'#7C6EF5',fontWeight:700,marginBottom:1}}>🎯 MUST DO</div>
                <div style={{fontSize:13,fontWeight:500,textDecoration:fd.mustDo.done?'line-through':'none',opacity:fd.mustDo.done?.55:1}}>{fd.mustDo.text}</div>
              </div>
              {fd.mustDo.done&&<span style={{fontSize:11,color:'var(--su)'}}>✓</span>}
            </div>
            :<div style={{border:'1px dashed var(--bdr)',borderRadius:7,padding:'8px',textAlign:'center',cursor:'pointer',marginBottom:6}} onClick={openEditF}>
              <span className="tx-dm" style={{fontSize:11}}>+ Set must-do {focusDate===TODAY?'hôm nay':'ngày này'}</span>
            </div>}
          {fd.top3?.some(t=>t.text)
            ?<div>{fd.top3.filter(t=>t.text).map(t=><div key={t.id} style={{display:'flex',gap:6,alignItems:'center',marginBottom:4,cursor:'pointer',padding:'2px 0'}} onClick={()=>togTop3(t.id)}>
                <Tick done={t.done} color='var(--acc)' onClick={()=>togTop3(t.id)}/>
                <span style={{fontSize:11,flex:1,textDecoration:t.done?'line-through':'none',opacity:t.done?.45:1}}>{t.text}</span>
              </div>)}</div>
            :<div style={{fontSize:11,color:'var(--dm)',paddingTop:2}}>— Chưa có Top 3</div>}
          {!fd.mustDo?.text&&!fd.top3?.some(t=>t.text)&&<div style={{textAlign:'center',paddingTop:4}}>
            <button className="btn-g btn-sm" style={{fontSize:10}} onClick={openEditF}>+ Đặt kế hoạch {focusDate===TODAY?'hôm nay':'ngày này'}</button>
          </div>}
        </div>}
      </div>
      <div className="card">
        {/* Header: label + date nav + manage */}
        <div style={{display:'flex',alignItems:'center',gap:4,marginBottom:7}}>
          <div className="lbl" style={{margin:0,flex:1}}>🧹 ADMIN</div>
          <button className="btn-g btn-sm" onClick={()=>navAdmin(-1)}>‹</button>
          <div style={{position:'relative'}}>
            <input type="date" value={adminDate} onChange={e=>e.target.value&&setAdminDate(e.target.value)}
              style={{position:'absolute',opacity:0,width:'100%',height:'100%',cursor:'pointer',top:0,left:0,zIndex:1}}/>
            <span style={{fontSize:10,color:adminDate===TODAY?'var(--acc)':'var(--tx)',fontWeight:adminDate===TODAY?700:400,minWidth:72,textAlign:'center',display:'block',padding:'0 2px',position:'relative',zIndex:0}}>
              {fmtDateNav(adminDate)}<br/><span style={{fontSize:9,color:'var(--dm)'}}>{fmt(adminDate)}</span>
            </span>
          </div>
          <button className="btn-g btn-sm" onClick={()=>navAdmin(1)}>›</button>
          {adminDate!==TODAY&&<button className="btn-g btn-sm" onClick={()=>setAdminDate(TODAY)} style={{fontSize:9}}>Now</button>}
          <button className="btn-g btn-sm" onClick={()=>nav('admin')}>⚙️</button>
        </div>
        {allAdmin.length===0&&<div className="tx-dm" style={{padding:'6px 0'}}>Không có admin task ngày này 🎉</div>}
        {allAdmin.map((item,i)=>{const done=isAdminDone(item);return<div key={i} className="admin-item">
          <div style={{width:20,height:20,borderRadius:4,border:`1.5px solid ${done?'var(--su)':'var(--bdr)'}`,background:done?'var(--su)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,fontSize:10}}
            onClick={()=>togAdmin(item)}>{done&&<span style={{color:'#fff',fontWeight:700}}>✓</span>}</div>
          <span style={{fontSize:12,textDecoration:done?'line-through':'none',opacity:done?.6:1,flex:1}}>{item.emoji} {item.title}</span>
          {item.overdueFrom&&<span style={{fontSize:9,color:'var(--cr)',fontWeight:700}} title={`Chưa xong từ ${fmt(item.overdueFrom)}`}>Quá hạn</span>}
          {item.src==='rec'&&<span style={{fontSize:9,color:'var(--dm)'}}>↻</span>}
          <button onClick={()=>setEditAdmin({src:item.src,item})} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:11,opacity:.5}}>✏️</button>
          {item.src==='day'&&<button style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:12,opacity:.5}} onClick={()=>{const homeDate=item.overdueFrom||adminDate;const at={...data.adminTasks,daily:{...data.adminTasks.daily}};at.daily[homeDate]=(at.daily[homeDate]||[]).filter(t=>t.id!==item.id);upd({adminTasks:at});}}>×</button>}
        </div>;})}
        <button className="btn-g btn-sm" style={{marginTop:8,width:'100%',justifyContent:'center'}} onClick={()=>setShowAddAdmin(true)}>+ Thêm task {adminDate===TODAY?'hôm nay':fmt(adminDate)}</button>
      </div>
    </div>
    <div className="card" style={{marginBottom:10}}>
      <div className="flex-sb" style={{marginBottom:7}}><div className="lbl" style={{margin:0}}>✅ HABITS HÔM NAY</div>
        <span style={{fontSize:11,color:'var(--su)'}}>{data.habits.filter(h=>!h.archived&&h.completions[TODAY]).length}/{data.habits.filter(h=>!h.archived).length}</span>
      </div>
      <div style={{display:'flex',flexWrap:'wrap',gap:7}}>
        {data.habits.filter(h=>!h.archived).map(h=>{const done=h.completions[TODAY];
        return<div key={h.id} style={{display:'flex',alignItems:'center',gap:6,background:done?h.color+'22':'var(--sur)',border:`1px solid ${done?h.color+'44':'var(--bdr)'}`,borderRadius:8,padding:'5px 9px',cursor:'pointer',transition:'all .15s'}}
          onClick={()=>{const habits=data.habits.map(x=>x.id===h.id?{...x,completions:{...x.completions,[TODAY]:!x.completions[TODAY]}}:x);upd({habits});if(!done)awardXP(XPR.habit,`${h.emoji} Habit!`);}}>
          <span style={{fontSize:13}}>{h.emoji}</span>
          <span style={{fontSize:11,color:done?h.color:'var(--mu)',textDecoration:done?'line-through':'none'}}>{h.name}</span>
          {done&&<span style={{fontSize:10,color:h.color,fontWeight:700}}>✓</span>}
        </div>;})}
      </div>
    </div>
    <div className="g2" style={{marginBottom:10}}>
      <div className="card">
        <div className="flex-sb" style={{marginBottom:8}}><div className="lbl" style={{margin:0}}>📅 LỊCH</div><button className="btn-g btn-sm" onClick={()=>setShowAddEv(true)}>+ Event</button></div>
        <MiniCalendar events={data.events} onDateSelect={setSelDate} selectedDate={selDate}/>
        <div style={{marginTop:8,paddingTop:8,borderTop:'1px solid var(--bdr)'}}>
          <div style={{fontSize:11,fontWeight:600,color:'var(--mu)',marginBottom:5}}>{selDate===TODAY?'Hôm nay 📍':fmt(selDate)}</div>
          {selEvs.length===0?<div className="tx-dm">Không có event — <span style={{color:'var(--acc)',cursor:'pointer'}} onClick={()=>setShowAddEv(true)}>thêm ngay</span></div>
          :selEvs.map(e=><div key={e.id} style={{display:'flex',gap:7,alignItems:'center',marginBottom:4,padding:'4px 0',borderBottom:'1px solid var(--bdr)'}}>
            <span style={{fontSize:14}}>{e.emoji}</span>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:500}}>{e.title}</div>{e.time&&<div className="tx-dm">{e.time}</div>}</div>
            <button onClick={()=>setEditEv(e)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:11,opacity:.5}}>✏️</button>
            <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:12,opacity:.5}} onClick={()=>upd({events:data.events.filter(x=>x.id!==e.id)})}>×</button>
          </div>)}
          <button className="btn-g btn-sm" style={{marginTop:5,width:'100%',justifyContent:'center'}} onClick={()=>setShowAddEv(true)}>+ Thêm event {fmt(selDate)}</button>
        </div>
      </div>
      <div className="card">
        <div className="lbl" style={{marginBottom:8}}>📊 HIỆU SUẤT</div>
        <div className="flex-sb" style={{marginBottom:8}}>
          <button className="btn-g btn-sm" onClick={()=>navPerf(-1)}>‹</button>
          <span style={{fontSize:12,fontWeight:600,color:perfDate===TODAY?'var(--acc)':'var(--tx)'}}>{perfDate===TODAY?'Hôm nay':fmt(perfDate)}</span>
          <button className="btn-g btn-sm" onClick={()=>navPerf(1)} style={{opacity:perfDate===TODAY?.3:1}} disabled={perfDate===TODAY}>›</button>
        </div>
        <div className="g3" style={{marginBottom:8}}>
          <div style={{textAlign:'center',background:'var(--sur)',borderRadius:7,padding:'7px 4px'}}><div style={{fontSize:17,fontWeight:600,color:'#1D9E75'}}>{perf.ht>0?`${perf.hd}/${perf.ht}`:'-'}</div><div className="tx-dm">Habits</div></div>
          <div style={{textAlign:'center',background:'var(--sur)',borderRadius:7,padding:'7px 4px'}}><div style={{fontSize:17,fontWeight:600,color:'#7C6EF5'}}>{perf.h>0?perf.h.toFixed(1):'-'}</div><div className="tx-dm">Giờ học</div></div>
          <div style={{textAlign:'center',background:'var(--sur)',borderRadius:7,padding:'7px 4px'}}><div style={{fontSize:17,fontWeight:600,color:'var(--go)'}}>{data.gamification?.xp||0}</div><div className="tx-dm">Total XP</div></div>
        </div>
        <div className="tx-dm" style={{marginBottom:4}}>Đánh giá ngày này:</div>
        <div style={{display:'flex',gap:4,justifyContent:'center'}}>
          {[1,2,3,4,5].map(n=><span key={n} className="perf-star" style={{opacity:perf.rating>=n?1:.2}} onClick={()=>saveRating(n)}>⭐</span>)}
        </div>
        {perf.rating&&<div style={{textAlign:'center',fontSize:11,color:'var(--mu)',marginTop:3}}>{['','Cần cố gắng hơn 💪','Khá ổn 👍','Tốt! ✨','Rất tốt! 🎉','Xuất sắc! 🏆'][perf.rating]}</div>}
        <div style={{marginTop:8,borderTop:'1px solid var(--bdr)',paddingTop:7}}>
          <div className="flex-sb"><span className="tx-mu">Tuần này</span><span style={{fontSize:12,color:'#7C6EF5',fontWeight:600}}>{weekH.toFixed(1)}h học</span></div>
        </div>
      </div>
    </div>
    <div style={{marginBottom:10}}><QuickLangInput data={data} upd={upd}/></div>
    {showAddEv&&<AddEventModal initDate={selDate} onSave={e=>{upd({events:[...data.events,e]});setShowAddEv(false);}} onClose={()=>setShowAddEv(false)}/>}
    {editEv&&<AddEventModal existing={editEv} onSave={e=>{upd({events:data.events.map(x=>x.id===e.id?e:x)});setEditEv(null);}} onClose={()=>setEditEv(null)}/>}
    {showAddAdmin&&<AdminTaskModal onSave={item=>{const at={...data.adminTasks,daily:{...data.adminTasks.daily}};if(item.type==='recurring'&&item.dow.length>0)at.recurring=[...at.recurring,{id:uid(),title:item.title,emoji:item.emoji,dow:item.dow}];else{at.daily[adminDate]=[...(at.daily[adminDate]||[]),{id:uid(),title:item.title,emoji:item.emoji,done:false,src:'day'}];}upd({adminTasks:at});setShowAddAdmin(false);}} onClose={()=>setShowAddAdmin(false)}/>}
    {editAdmin&&<AdminTaskModal existing={editAdmin.item} existingMode={editAdmin.src==='rec'?'recurring':'daily'} onSave={saveAdminEdit} onClose={()=>setEditAdmin(null)}/>}
  </div>;}


function AdminPage({data,upd}){
  const [showAdd,setShowAdd]=useState(false);
  return<div>
    <div className="h1">🧹 Admin Tasks</div>
    <p className="tx-mu" style={{marginBottom:14}}>Recurring tasks xuất hiện tự động trên Dashboard theo ngày trong tuần.</p>
    <div className="card">
      <div className="flex-sb" style={{marginBottom:10}}>
        <div className="lbl" style={{margin:0}}>RECURRING TASKS</div>
        <button className="btn-p btn-sm" onClick={()=>setShowAdd(true)}>+ Thêm</button>
      </div>
      {data.adminTasks.recurring.map(r=><div key={r.id} className="admin-item">
        <span style={{fontSize:14}}>{r.emoji}</span>
        <div style={{flex:1}}><div style={{fontSize:12}}>{r.title}</div><div className="tx-dm">{r.dow.map(d=>DV[d]).join(', ')}</div></div>
        <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--cr)',fontSize:13}} onClick={()=>upd({adminTasks:{...data.adminTasks,recurring:data.adminTasks.recurring.filter(x=>x.id!==r.id)}})}>✕</button>
      </div>)}
      {data.adminTasks.recurring.length===0&&<div className="tx-dm">Chưa có recurring task nào</div>}
    </div>
    {showAdd&&<AdminTaskModal onSave={item=>{if(item.type==='recurring'&&item.dow.length>0)upd({adminTasks:{...data.adminTasks,recurring:[...data.adminTasks.recurring,{id:uid(),title:item.title,emoji:item.emoji,dow:item.dow}]}});setShowAdd(false);}} onClose={()=>setShowAdd(false)}/>}
  </div>;}

function MilestoneModal({existing,onSave,onClose}){
  const [text,setText]=useState(existing?.text||'');
  const [date,setDate]=useState(existing?.date||TODAY);
  return<div className="ov" onClick={onClose}><div className="modal" style={{maxWidth:340}} onClick={e=>e.stopPropagation()}>
    <div className="flex-sb" style={{marginBottom:12}}><span style={{fontSize:14,fontWeight:500}}>{existing?'✏️ Sửa Milestone':'+ Milestone mới'}</span><button className="btn-g btn-sm" onClick={onClose}>✕</button></div>
    <div className="tx-dm" style={{marginBottom:2}}>Nội dung *</div>
    <input className="inp" value={text} onChange={e=>setText(e.target.value)} placeholder="VD: Thi Microeconometrics..." style={{marginBottom:8}}/>
    <div className="tx-dm" style={{marginBottom:2}}>Ngày</div>
    <input type="date" className="inp" value={date} onChange={e=>setDate(e.target.value)} style={{marginBottom:14}}/>
    <div style={{display:'flex',gap:8}}><button className="btn-p" style={{flex:1,justifyContent:'center'}} onClick={()=>{if(!text.trim())return;onSave({text:text.trim(),date});}}>{existing?'Lưu':'Thêm'}</button><button className="btn-g" onClick={onClose}>Huỷ</button></div>
  </div></div>;}

function UniPhasePage({data,upd}){
  const [eg,setEg]=useState(null);
  const [milestoneEdit,setMilestoneEdit]=useState(null); // {phId, index|null}
  const updG=(phId,gId,v)=>upd({uniPhases:data.uniPhases.map(p=>p.id===phId?{...p,goals:p.goals.map(g=>g.id===gId?{...g,progress:v}:g)}:p)});

  const computeGPA=()=>{
    const graded=data.courses.filter(c=>c.grade!=null&&!isNaN(c.grade));
    if(graded.length===0)return null;
    const totalEcts=graded.reduce((s,c)=>s+(c.ects||6),0);
    const weighted=graded.reduce((s,c)=>s+c.grade*(c.ects||6),0);
    return{avg:weighted/totalEcts,gradedCount:graded.length,totalCount:data.courses.filter(c=>!c.archived).length};
  };

  const computeGermanProgress=(data)=>{
    const de=data.languages.find(l=>l.id==='de');if(!de)return{pct:0,detail:[]};
    const cats=de.categories||defCats();
    const vocab=cats.vocabulary?.total||0;
    const grammarItems=cats.grammar?.items||[];
    const speakingItems=cats.speaking?.items||[];
    const writingItems=cats.writing?.items||[];
    // Score: vocab vs B2 (4000 words) + grammar completion + speaking + writing
    const vocabPct=Math.min(100,Math.round(vocab/4000*100));
    const grTotal=grammarItems.length||1;const grDone=grammarItems.filter(g=>g.done).length;
    const grPct=Math.round(grDone/grTotal*100);
    const spTotal=speakingItems.length||1;const spDone=speakingItems.filter(s=>s.done).length;
    const spPct=Math.round(spDone/spTotal*100);
    const wrTotal=writingItems.length||1;const wrDone=writingItems.filter(w=>w.done).length;
    const wrPct=Math.round(wrDone/wrTotal*100);
    const overall=Math.round((vocabPct*0.4+grPct*0.3+spPct*0.2+wrPct*0.1));
    // Grammar by CEFR level
    const byLevel={};
    grammarItems.forEach(g=>{const lv=g.level||'?';if(!byLevel[lv])byLevel[lv]={total:0,done:0};byLevel[lv].total++;if(g.done)byLevel[lv].done++;});
    return{pct:overall,vocab,vocabPct,grDone,grTotal,grPct,spDone,spTotal,spPct,wrDone,wrTotal,wrPct,byLevel};
  };

  const autoP=(goal,data)=>{
    if(goal.linkedTo==='german_hours'||goal.linkedTo==='german_cefr'){return computeGermanProgress(data).pct;}
    if(goal.linkedTo==='events_attended'){return Math.min(100,data.events.filter(e=>e.date<TODAY&&e.type==='networking').length*20);}
    return null;
  };

  const saveMilestone=(phId,idx,m)=>{
    const uniPhases=data.uniPhases.map(p=>{
      if(p.id!==phId)return p;
      const ms=[...p.milestones];
      if(idx===null||idx===undefined)ms.push(m);else ms[idx]=m;
      ms.sort((a,b)=>a.date.localeCompare(b.date));
      return{...p,milestones:ms};
    });
    upd({uniPhases});setMilestoneEdit(null);
  };
  const delMilestone=(phId,idx)=>{
    const uniPhases=data.uniPhases.map(p=>p.id!==phId?p:{...p,milestones:p.milestones.filter((_,i)=>i!==idx)});
    upd({uniPhases});
  };

  const gpa=computeGPA();

  return<div>
    <div className="h1">🗺️ Uni Phase Plan</div>
    <p className="tx-mu" style={{marginBottom:16}}>Chiến lược tổng thể. GPA tự tính từ điểm thi thực tế (nhập ở tab Môn học).</p>
    {data.uniPhases.map(ph=>{const isA=ph.status==='active';const phD=daysTo(ph.endDate);
    return<div key={ph.id} className={`phase-card ${isA?'phase-active':''}`} style={{background:isA?'var(--card)':'var(--sur)',opacity:isA?1:.7}}>
      <div style={{position:'absolute',left:0,top:0,bottom:0,width:4,background:ph.color,borderRadius:'4px 0 0 4px'}}/>
      <div style={{paddingLeft:12}}>
        <div className="flex-sb" style={{marginBottom:10}}>
          <div><div style={{display:'flex',alignItems:'center',gap:7,marginBottom:1}}><div style={{fontSize:13,fontWeight:600}}>{ph.name}</div>
            {isA&&<span style={{background:'var(--acc2)',color:'#7C6EF5',border:'1px solid var(--acc3)',borderRadius:4,padding:'1px 5px',fontSize:9,fontWeight:700}}>ACTIVE</span>}
            {!isA&&<span style={{background:'var(--sub)',color:'var(--su)',border:'1px solid var(--suBdr)',borderRadius:4,padding:'1px 5px',fontSize:9,fontWeight:700}}>SẮP TỚI</span>}
          </div><div className="tx-dm">{ph.dateRange}</div></div>
          {phD!==null&&phD>0&&<div style={{textAlign:'right'}}><span style={{fontSize:22,fontWeight:500,color:ph.color}}>{phD}</span><span className="tx-dm" style={{marginLeft:3}}>ngày còn lại</span></div>}
        </div>
        <div className="lbl" style={{marginBottom:7}}>MỤC TIÊU CHÍNH</div>
        {ph.goals.map(g=>{
          if(g.type==='gpa'){
            const band=gpa?gradeBand(gpa.avg):null;
            return<div key={g.id} style={{marginBottom:10,background:'var(--sur)',borderRadius:8,padding:'9px'}}>
              <div className="flex-sb" style={{marginBottom:6}}>
                <div style={{fontSize:12,fontWeight:500}}><span style={{marginRight:5}}>{g.icon}</span>{g.text}</div>
                <span style={{fontSize:11,color:'var(--mu)'}}>Mục tiêu: ≤1.5</span>
              </div>
              {gpa?<div className="grade-pill" style={{background:band.color+'22',color:band.color,border:`1px solid ${band.color}55`}}>
                <span style={{fontSize:18}}>{gpa.avg.toFixed(2)}</span><span style={{fontWeight:500,fontSize:11}}>{band.label}</span>
              </div>:<div style={{fontSize:12,color:'var(--dm)'}}>Chưa có điểm nào — 0/{gpa?.totalCount||data.courses.filter(c=>!c.archived).length} môn đã thi</div>}
              {gpa&&<div className="tx-dm" style={{marginTop:6}}>Tính từ {gpa.gradedCount}/{gpa.totalCount} môn đã có điểm (trọng số ECTS)</div>}
              <div style={{fontSize:10,color:'var(--dm)',marginTop:4}}>📊 Nhập điểm thi ở tab Môn học → Sửa môn → ô "Điểm thi"</div>
            </div>;
          }
          const auto=isA?autoP(g,data):null;
          const isGerman=g.linkedTo==='german_hours'||g.linkedTo==='german_cefr';
          const deDetail=isA&&isGerman?computeGermanProgress(data):null;
          return<div key={g.id} style={{marginBottom:10,background:'var(--sur)',borderRadius:8,padding:'9px'}}>
            <div className="flex-sb" style={{marginBottom:4}}><div style={{fontSize:12,fontWeight:500}}><span style={{marginRight:5}}>{g.icon}</span>{g.text}</div>
              <div style={{display:'flex',alignItems:'center',gap:5}}>
                <span style={{fontSize:12,color:ph.color,fontWeight:600}}>{isGerman&&deDetail?deDetail.pct:g.progress}%</span>
                {isA&&!isGerman&&<button className="btn-g btn-sm" onClick={()=>setEg({phId:ph.id,gId:g.id,v:g.progress})}>Sửa</button>}
              </div>
            </div>
            <Bar v={isGerman&&deDetail?deDetail.pct:g.progress} color={ph.color} h={6}/>
            {/* German B2+ sub-goals breakdown */}
            {deDetail&&<div style={{marginTop:8,display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
              <div style={{background:'var(--card)',borderRadius:6,padding:'7px 9px'}}>
                <div style={{fontSize:10,color:'var(--mu)',marginBottom:4,fontWeight:700}}>📝 TỪ VỰNG</div>
                <div style={{fontSize:16,fontWeight:700,color:ph.color}}>{deDetail.vocab}</div>
                <div className="tx-dm" style={{marginBottom:4}}>từ đã học</div>
                <Bar v={deDetail.vocabPct} color={ph.color} h={4}/>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:3}}>
                  {Object.entries(CEFR_VOCAB).slice(0,4).map(([lv,min])=><span key={lv} style={{fontSize:9,color:deDetail.vocab>=min?ph.color:'var(--dm)',fontWeight:deDetail.vocab>=min?700:400}}>{lv}{deDetail.vocab>=min?'✓':''}</span>)}
                </div>
              </div>
              <div style={{background:'var(--card)',borderRadius:6,padding:'7px 9px'}}>
                <div style={{fontSize:10,color:'var(--mu)',marginBottom:4,fontWeight:700}}>📖 NGỮ PHÁP</div>
                <div style={{fontSize:16,fontWeight:700,color:ph.color}}>{deDetail.grDone}/{deDetail.grTotal}</div>
                <div className="tx-dm" style={{marginBottom:4}}>điểm ngữ pháp ✓</div>
                <Bar v={deDetail.grPct} color={ph.color} h={4}/>
                {Object.entries(deDetail.byLevel).length>0&&<div style={{marginTop:4,display:'flex',gap:4,flexWrap:'wrap'}}>
                  {Object.entries(deDetail.byLevel).map(([lv,d])=><span key={lv} style={{fontSize:9,padding:'1px 5px',borderRadius:8,background:d.done===d.total?ph.color+'33':'var(--sur)',color:d.done===d.total?ph.color:'var(--dm)',border:`1px solid ${d.done===d.total?ph.color+'55':'var(--bdr)'}`}}>{lv}: {d.done}/{d.total}</span>)}
                </div>}
              </div>
              <div style={{background:'var(--card)',borderRadius:6,padding:'7px 9px'}}>
                <div style={{fontSize:10,color:'var(--mu)',marginBottom:4,fontWeight:700}}>🗣️ NÓI</div>
                <div style={{fontSize:16,fontWeight:700,color:ph.color}}>{deDetail.spDone}/{deDetail.spTotal}</div>
                <div className="tx-dm" style={{marginBottom:4}}>topics đã luyện</div>
                <Bar v={deDetail.spPct} color={ph.color} h={4}/>
              </div>
              <div style={{background:'var(--card)',borderRadius:6,padding:'7px 9px'}}>
                <div style={{fontSize:10,color:'var(--mu)',marginBottom:4,fontWeight:700}}>✍️ VIẾT</div>
                <div style={{fontSize:16,fontWeight:700,color:ph.color}}>{deDetail.wrDone}/{deDetail.wrTotal}</div>
                <div className="tx-dm" style={{marginBottom:4}}>bài viết hoàn thành</div>
                <Bar v={deDetail.wrPct} color={ph.color} h={4}/>
              </div>
            </div>}
            {auto!==null&&!isGerman&&<div style={{marginTop:5,display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
              <span style={{fontSize:10,color:'var(--mu)'}}>💡 Gợi ý: <strong style={{color:ph.color}}>{auto}%</strong></span>
              {auto!==g.progress&&<button className="btn-p" style={{padding:'2px 8px',fontSize:10,borderRadius:5}} onClick={()=>updG(ph.id,g.id,auto)}>Áp dụng</button>}
            </div>}
            {isGerman&&<div style={{fontSize:10,color:'var(--dm)',marginTop:4}}>📊 Tự tính từ Language tab · 40% vocab + 30% ngữ pháp + 20% nói + 10% viết</div>}
            {!isGerman&&<div style={{fontSize:10,color:'var(--dm)',marginTop:3}}>📊 {g.hint}</div>}
            {(data.habits||[]).filter(h=>!h.archived&&h.goalId===g.id).length>0&&<div style={{marginTop:6,paddingTop:6,borderTop:'1px solid var(--bdr)',display:'flex',gap:6,flexWrap:'wrap'}}>
              {(data.habits||[]).filter(h=>!h.archived&&h.goalId===g.id).map(h=>{const done=h.completions[TODAY];const str=hStreak(h.completions);
                return<span key={h.id} style={{fontSize:9,display:'flex',alignItems:'center',gap:3,background:done?h.color+'22':'var(--card)',color:done?h.color:'var(--mu)',border:`1px solid ${done?h.color+'55':'var(--bdr)'}`,borderRadius:5,padding:'2px 6px'}}>{h.emoji} {h.name}{str>0&&` 🔥${str}`}</span>;})}
            </div>}
            {eg?.gId===g.id&&<div style={{marginTop:7,display:'flex',gap:5,alignItems:'center'}}>
              <input type="range" min={0} max={100} step={5} value={eg.v} onChange={e=>setEg(p=>({...p,v:+e.target.value}))} style={{flex:1}}/>
              <span style={{fontSize:12,color:'var(--acc)',fontWeight:600,minWidth:30}}>{eg.v}%</span>
              <button className="btn-p btn-sm" onClick={()=>{updG(eg.phId,eg.gId,eg.v);setEg(null);}}>OK</button>
              <button className="btn-g btn-sm" onClick={()=>setEg(null)}>✕</button>
            </div>}
          </div>;
        })}
        <div className="flex-sb" style={{marginTop:10,marginBottom:7}}>
          <div className="lbl" style={{margin:0}}>MILESTONES</div>
          <button className="btn-g btn-sm" onClick={()=>setMilestoneEdit({phId:ph.id,index:null})}>+ Thêm</button>
        </div>
        {ph.milestones.length===0&&<div className="tx-dm" style={{marginBottom:6}}>Chưa có milestone nào</div>}
        {ph.milestones.map((m,i)=>{const past=m.date<TODAY;const days=daysTo(m.date);
        return<div key={i} style={{display:'flex',gap:8,marginBottom:5,alignItems:'flex-start'}}>
          <div className={`m-dot ${past?'past':days&&days<=7?'urg':''}`} style={{marginTop:4,flexShrink:0}}/>
          <div style={{flex:1}}><div style={{fontSize:12,color:past?'var(--mu)':'var(--tx)',textDecoration:past?'line-through':'none'}}>{m.text}</div>
          <div className="tx-dm">{fmt(m.date)}{days!==null&&!past&&<span style={{color:days<=7?'var(--cr)':days<=14?'var(--wa)':'var(--mu)'}}> · {days} ngày nữa</span>}{past&&' · Đã qua'}</div></div>
          <button onClick={()=>setMilestoneEdit({phId:ph.id,index:i})} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:11,opacity:.6}}>✏️</button>
          <button onClick={()=>delMilestone(ph.id,i)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:13,opacity:.5}}>×</button>
        </div>;})}
      </div>
    </div>;})}
    {milestoneEdit&&<MilestoneModal
      existing={milestoneEdit.index!==null?data.uniPhases.find(p=>p.id===milestoneEdit.phId)?.milestones[milestoneEdit.index]:null}
      onSave={m=>saveMilestone(milestoneEdit.phId,milestoneEdit.index,m)}
      onClose={()=>setMilestoneEdit(null)}/>}
  </div>;}

function TimelinePage({data}){
  const start=new Date();start.setHours(0,0,0,0);
  const end=new Date('2026-07-31');const totalMs=end-start;
  function pOf(ds){if(!ds)return 0;const d=new Date(ds);d.setHours(0,0,0,0);return Math.max(0,Math.min(100,(d-start)/totalMs*100));}
  function wOf(s,e){return Math.max(0,pOf(e)-pOf(s));}
  const phase=data.uniPhases.find(p=>p.id===data.currentUniPhaseId);
  const milestones=(phase?.milestones||[]).filter(m=>m.date>=TODAY&&m.date<='2026-07-31');
  const wks=[];let cw=new Date(start);while(cw<=end){wks.push({p:(cw-start)/totalMs*100,l:cw.toLocaleDateString('vi-VN',{day:'numeric',month:'numeric'})});cw=new Date(cw);cw.setDate(cw.getDate()+7);}
  const rows=[...data.courses.map(c=>({type:'c',id:c.id,label:`${c.emoji} ${c.name}`,color:c.color,sd:TODAY,ed:c.endDate||c.examDate||'2026-07-25',exam:c.examDate})),{type:'l',id:'de',label:'🇩🇪 Tiếng Đức',color:'#FFD700',sd:TODAY,ed:'2026-07-31'},{type:'l',id:'en',label:'🇬🇧 Tiếng Anh',color:'#4FA3FF',sd:TODAY,ed:'2026-07-31'}];
  const upEvs=data.events.filter(e=>e.date>=TODAY&&e.date<='2026-07-31').sort((a,b)=>a.date.localeCompare(b.date));
  return<div>
    <div className="h1">📅 Timeline</div>
    <p className="tx-mu" style={{marginBottom:12}}>Phase 1 · {fmt(TODAY)} → 31/7/2026 · Kéo ngang để xem đầy đủ</p>
    <div className="card" style={{padding:'14px'}}>
      <div style={{position:'relative',height:18,marginLeft:155,marginBottom:3,overflow:'hidden'}}>
        {wks.map((w,i)=><div key={i} style={{position:'absolute',left:`${w.p}%`,fontSize:9,color:'var(--dm)',transform:'translateX(-50%)',whiteSpace:'nowrap'}}>{w.l}</div>)}
      </div>
      {rows.map(row=><div key={row.id} className="tl2-row">
        <div className="tl2-label" title={row.label}>{row.label}</div>
        <div className="tl2-track">
          {wks.map((w,i)=><div key={i} className="tl2-wk" style={{left:`${w.p}%`}}/>)}
          <div className="tl2-today" style={{left:`${pOf(TODAY)}%`}} title="Hôm nay"/>
          <div className="tl2-bar" style={{left:`${pOf(row.sd)}%`,width:`${wOf(row.sd,row.ed)}%`,background:row.color}}>
            {row.label.replace(/[🇩🇪🇬🇧📊🌍🌱📈]/g,'').trim().slice(0,20)}
          </div>
          {row.exam&&<div className="tl2-exam" style={{left:`${pOf(row.exam)}%`}} title={`Thi: ${fmt(row.exam)}`}>🎯</div>}
        </div>
      </div>)}
      <div className="tl2-row">
        <div className="tl2-label">📌 Events</div>
        <div className="tl2-track" style={{height:26}}>
          {wks.map((w,i)=><div key={i} className="tl2-wk" style={{left:`${w.p}%`}}/>)}
          <div className="tl2-today" style={{left:`${pOf(TODAY)}%`}}/>
          {upEvs.map((e,i)=><div key={i} className="tl2-evt" style={{left:`${pOf(e.date)}%`,zIndex:i+1,background:'#7C6EF5'}} title={`${e.title} · ${fmt(e.date)}`}>{e.emoji}</div>)}
          {milestones.map((m,i)=><div key={i} className="tl2-exam" style={{left:`${pOf(m.date)}%`,background:'#E24B4A'}} title={m.text}>🏁</div>)}
        </div>
      </div>
    </div>
    <div className="card" style={{marginTop:10}}>
      <div className="lbl" style={{marginBottom:8}}>EVENTS SẮP TỚI (chi tiết)</div>
      {upEvs.map(e=>{const d=daysTo(e.date);return<div key={e.id} style={{display:'flex',gap:10,alignItems:'center',padding:'5px 0',borderBottom:'1px solid var(--bdr)'}}>
        <span style={{fontSize:16}}>{e.emoji}</span>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:500}}>{e.title}</div><div className="tx-dm">{fmtL(e.date)}{e.time&&` · ${e.time}`}{e.note&&` — ${e.note}`}</div></div>
        <div style={{fontSize:11,fontWeight:700,color:d<=7?'var(--cr)':d<=21?'var(--wa)':'var(--mu)',whiteSpace:'nowrap'}}>{d}N</div>
      </div>;})}
      {milestones.map((m,i)=>{const d=daysTo(m.date);return<div key={i} style={{display:'flex',gap:10,alignItems:'center',padding:'5px 0',borderBottom:'1px solid var(--bdr)'}}>
        <span style={{fontSize:16}}>🏁</span>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:500}}>{m.text}</div><div className="tx-dm">{fmtL(m.date)}</div></div>
        <div style={{fontSize:11,fontWeight:700,color:d<=7?'var(--cr)':d<=21?'var(--wa)':'var(--mu)',whiteSpace:'nowrap'}}>{d}N</div>
      </div>;})}
    </div>
  </div>;}

function TimerPage({data,upd,awardXP,nav}){
  const [mode,setMode]=useState('stopwatch');
  const [running,setRunning]=useState(false);
  const [elapsed,setElapsed]=useState(0); // display seconds
  const [subj,setSubj]=useState(data.courses[0]?.id||'other');
  const [pomoDur,setPomoDur]=useState(25*60);
  const [pomoLeft,setPomoLeft]=useState(25*60);
  const [isBreak,setIsBreak]=useState(false);
  const [sessions,setSessions]=useState([]);
  const [showAddCat,setShowAddCat]=useState(false);
  const [newCatName,setNewCatName]=useState('');const [newCatEmoji,setNewCatEmoji]=useState('📌');
  const intRef=useRef(null);
  const startRef=useRef(null);   // ← V10 FIX: wall clock start time
  const baseRef=useRef(0);       // ← V10 FIX: accumulated secs before last pause
  const customCats=(data.timerCategories||[]).map(c=>({id:`custom_${c.id}`,name:c.name,emoji:c.emoji}));
  const allS=[...data.courses.filter(c=>!c.archived).map(c=>({id:c.id,name:c.name,emoji:c.emoji})),{id:'de',name:'Tiếng Đức',emoji:'🇩🇪'},{id:'en',name:'Tiếng Anh',emoji:'🇬🇧'},...customCats,{id:'other',name:'Khác',emoji:'📌'}];
  const addCat=()=>{if(!newCatName.trim())return;upd({timerCategories:[...(data.timerCategories||[]),{id:uid(),name:newCatName.trim(),emoji:newCatEmoji}]});setNewCatName('');setNewCatEmoji('📌');setShowAddCat(false);};
  const delCat=(id)=>upd({timerCategories:(data.timerCategories||[]).filter(c=>c.id!==id)});
  useEffect(()=>{return()=>{if(intRef.current)clearInterval(intRef.current);};},[]);
  // ← V10c: resync display instantly when tab becomes visible again (browsers throttle
  // setInterval in background tabs, so the number may "freeze" while hidden — this fixes
  // the visual lag immediately on return. The underlying wall-clock math was already accurate.)
  useEffect(()=>{
    const onVis=()=>{if(document.visibilityState==='visible'&&startRef.current&&mode==='stopwatch'){setElapsed(getRealElapsed());}};
    document.addEventListener('visibilitychange',onVis);
    return()=>document.removeEventListener('visibilitychange',onVis);
  },[mode]);
  const getRealElapsed=()=>baseRef.current+(startRef.current?Math.floor((Date.now()-startRef.current)/1000):0);
  const startStop=()=>{
    if(running){
      // Pause: commit real wall-clock time, clear startRef to prevent double-counting
      clearInterval(intRef.current);intRef.current=null;
      baseRef.current=getRealElapsed();
      startRef.current=null; // ← FIX: clear so getRealElapsed doesn't double-count
      setElapsed(baseRef.current);
      setRunning(false);
    } else {
      startRef.current=Date.now();
      setRunning(true);
      intRef.current=setInterval(()=>{
        if(mode==='stopwatch'){
          const real=Math.floor((Date.now()-startRef.current)/1000)+baseRef.current;
          setElapsed(real);
        } else {
          setPomoLeft(p=>{if(p<=1){clearInterval(intRef.current);intRef.current=null;setRunning(false);if(!isBreak)setIsBreak(true);return isBreak?pomoDur:5*60;}return p-1;});
        }
      },1000);
    }
  };
  const reset=()=>{if(intRef.current)clearInterval(intRef.current);intRef.current=null;startRef.current=null;baseRef.current=0;setRunning(false);setElapsed(0);setPomoLeft(pomoDur);setIsBreak(false);};
  const logSession=()=>{
    const secs=mode==='stopwatch'?getRealElapsed():(pomoDur-pomoLeft);
    const h=Math.round(secs/3600*4)/4;
    if(h<0.05){reset();return;}
    const s=allS.find(x=>x.id===subj);
    const entry={id:uid(),date:TODAY,subjectId:subj,hours:h,subjectName:s?.name||'',note:`⏱️ ${fmtS(secs)} (${mode})`};
    // ← FIX: single upd call prevents save race condition between upd+awardXP
    const newXP=(data.gamification?.xp||0)+Math.round(h*XPR.hour);
    const newAchs=[...(data.gamification?.achievements||[])];
    if(!newAchs.includes('first_log'))newAchs.push('first_log');
    upd({studyLog:[entry,...data.studyLog],gamification:{...(data.gamification||{}),xp:newXP,achievements:newAchs}});
    showXpPop(Math.round(h*XPR.hour));
    setSessions(prev=>[...prev,entry]);reset();
  };
  const display=mode==='stopwatch'?fmtS(elapsed):fmtS(pomoLeft);
  return<div>
    <div className="h1">⏱️ Timer / Pomodoro</div>
    <p className="tx-mu" style={{marginBottom:16}}>Đếm giờ học và tự động log. Nhấn ✓ để lưu session.</p>
    <div className="card" style={{marginBottom:12,textAlign:'center',padding:'20px'}}>
      <div style={{display:'flex',gap:8,justifyContent:'center',marginBottom:16}}>
        {[['stopwatch','⏱️ Stopwatch'],['pomodoro','🍅 Pomodoro']].map(([k,v])=><button key={k} className={mode===k?'btn-p':'btn-g'} style={{padding:'6px 16px'}} onClick={()=>{if(!running){setMode(k);reset();setPomoLeft(pomoDur);}}}>{v}</button>)}
      </div>
      {mode==='pomodoro'&&<div style={{marginBottom:8}}>
        <div style={{fontSize:11,color:isBreak?'var(--su)':'var(--acc)',fontWeight:600,marginBottom:5}}>{isBreak?'☕ Nghỉ giải lao (5 phút)':'🎯 Thời gian học tập'}</div>
        <div style={{height:5,background:'var(--dm)',borderRadius:3,overflow:'hidden',margin:'0 auto 10px',maxWidth:280}}>
          <div style={{width:`${Math.round((pomoDur-pomoLeft)/pomoDur*100)}%`,height:'100%',background:isBreak?'var(--su)':'var(--acc)',borderRadius:3,transition:'width .5s'}}/>
        </div>
      </div>}
      <div className="timer-big" style={{color:isBreak?'var(--su)':'var(--acc)'}}>{display}</div>
      <select className="sel" value={subj} onChange={e=>setSubj(e.target.value)} style={{maxWidth:240,margin:'0 auto 14px',display:'block'}}>
        {allS.map(s=><option key={s.id} value={s.id}>{s.emoji} {s.name}</option>)}
      </select>
      {mode==='pomodoro'&&!running&&<div style={{marginBottom:12}}>
        <div className="tx-dm" style={{marginBottom:5}}>Thời gian mỗi phiên:</div>
        <div style={{display:'flex',gap:5,justifyContent:'center'}}>
          {[15,20,25,30,45].map(m=><button key={m} className={pomoDur===m*60?'btn-p btn-sm':'btn-g btn-sm'} onClick={()=>{setPomoDur(m*60);setPomoLeft(m*60);}}>{m}m</button>)}
        </div>
      </div>}
      <div style={{display:'flex',gap:10,justifyContent:'center',alignItems:'center'}}>
        <button className="t-btn" onClick={reset} style={{background:'var(--sur)',color:'var(--mu)',fontSize:18}}>↺</button>
        <button className="t-btn" onClick={startStop} style={{width:60,height:60,fontSize:22,background:running?'var(--cr)':'var(--acc)',color:'#fff'}}>{running?'⏸':'▶'}</button>
        <button className="t-btn" onClick={logSession} style={{background:'var(--su)',color:'#fff',fontSize:18}} title="Lưu & reset">✓</button>
      </div>
      <div className="tx-dm" style={{marginTop:8}}>▶ bắt đầu · ⏸ tạm dừng · ✓ lưu session & reset</div>
    </div>
    {sessions.length>0&&<div className="card">
      <div className="lbl" style={{marginBottom:7}}>PHIÊN HÔM NAY</div>
      {sessions.map((s,i)=><div key={i} style={{display:'flex',gap:8,alignItems:'center',padding:'4px 0',borderBottom:'1px solid var(--bdr)'}}>
        <span style={{fontSize:14}}>{allS.find(x=>x.id===s.subjectId)?.emoji||'📚'}</span>
        <div style={{flex:1}}><div style={{fontSize:12}}>{s.subjectName}</div><div className="tx-dm">{s.note}</div></div>
        <span style={{fontSize:13,fontWeight:600,color:'var(--acc)'}}>{s.hours.toFixed(2)}h</span>
      </div>)}
      <div style={{paddingTop:7,display:'flex',justifyContent:'space-between'}}>
        <span className="tx-mu">Tổng hôm nay</span>
        <span style={{fontWeight:600,color:'var(--acc)'}}>{sessions.reduce((s,x)=>s+x.hours,0).toFixed(2)}h</span>
      </div>
    </div>}
    <div className="card" style={{marginTop:10}}>
      <div className="flex-sb" style={{marginBottom:8}}><div className="lbl" style={{margin:0}}>⚙️ DANH MỤC TÙY CHỈNH</div><button className="btn-g btn-sm" onClick={()=>setShowAddCat(s=>!s)}>+ Thêm</button></div>
      <div className="tx-dm" style={{marginBottom:8}}>Thêm danh mục theo dõi giờ học ngoài môn học (VD: Tìm việc, Volunteer...)</div>
      <div className="tx-dm" style={{marginBottom:6}}>💡 Các môn học sẽ tự động xuất hiện ở trên khi thêm ở tab Môn học</div>
      {(data.timerCategories||[]).map(c=><div key={c.id} style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',borderBottom:'1px solid var(--bdr)'}}>
        <span style={{fontSize:14}}>{c.emoji}</span><span style={{flex:1,fontSize:12}}>{c.name}</span>
        <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--cr)',fontSize:13,opacity:.6}} onClick={()=>delCat(c.id)}>✕</button>
      </div>)}
      {(data.timerCategories||[]).length===0&&!showAddCat&&<div className="tx-dm">Chưa có danh mục tùy chỉnh</div>}
      {showAddCat&&<div style={{display:'flex',gap:5,marginTop:8,flexWrap:'wrap'}}>
        <input className="inp" value={newCatEmoji} onChange={e=>setNewCatEmoji(e.target.value)} style={{width:44,textAlign:'center',fontSize:16,padding:'5px'}}/>
        <input className="inp" value={newCatName} onChange={e=>setNewCatName(e.target.value)} placeholder="Tên danh mục..." onKeyDown={e=>e.key==='Enter'&&addCat()} style={{flex:1}}/>
        <button className="btn-p btn-sm" onClick={addCat}>Thêm</button>
        <button className="btn-g btn-sm" onClick={()=>setShowAddCat(false)}>Huỷ</button>
      </div>}
    </div>
  </div>;}

