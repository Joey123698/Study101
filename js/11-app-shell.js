/* ══════════════════════════════════════════════════════════════
   11-app-shell.js — PAGES nav config + App root component
   ══════════════════════════════════════════════════════════════ */
const PAGES=[
  {id:'dashboard',label:'Dashboard',emoji:'🏠',sec:'TỔNG QUAN'},
  {id:'uniphase',label:'Uni Phase',emoji:'🗺️',sec:'TỔNG QUAN'},
  {id:'timeline',label:'Timeline',emoji:'📅',sec:'TỔNG QUAN'},
  {id:'timer',label:'Timer / Pomodoro',emoji:'⏱️',sec:'HỌC TẬP'},
  {id:'journal',label:'Nhật ký học',emoji:'📓',sec:'HỌC TẬP'},
  {id:'courses',label:'Môn học',emoji:'📚',sec:'HỌC TẬP'},
  {id:'language',label:'Ngôn ngữ',emoji:'🌐',sec:'HỌC TẬP'},
  {id:'studylog',label:'Study Log',emoji:'📊',sec:'HỌC TẬP'},
  {id:'habits',label:'Habits',emoji:'✅',sec:'LIFESTYLE'},
  {id:'events',label:'Events',emoji:'🗓️',sec:'LIFESTYLE'},
  {id:'admin',label:'Admin Tasks',emoji:'🧹',sec:'LIFESTYLE'},
  {id:'parking',label:'Parking Lot',emoji:'🅿️',sec:'LIFESTYLE'},
  {id:'settings',label:'Cài đặt',emoji:'⚙️',sec:'HỆ THỐNG'},
];

function App(){
  const [user,setUser]=useState(null);const [data,setData]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [fbInitFailed,setFbInitFailed]=useState(false);
  const [showWelcome,setShowWelcome]=useState(true);
  const [syncing,setSyncing]=useState(false);const [syncErr,setSyncErr]=useState(false);const [lastSync,setLastSync]=useState(null);
  const [page,setPage]=useState('dashboard');const [pageParams,setPageParams]=useState({});
  const [sbOpen,setSbOpen]=useState(true);
  const [expandedNav,setExpandedNav]=useState({});
  const saveTimer=useRef(null);const saving=useRef(false);const unsubRef=useRef(null);

  useEffect(()=>{
    // Firebase init failure → fall back to local storage with visible warning, never hang silently.
    if(!FB_ON||!_auth||!_db){
      if(FB_ON&&(!_auth||!_db)){console.error('Firebase SDK failed to initialize — falling back to local storage.');setFbInitFailed(true);}
      let saved=loadLocal();if(saved)saved=migrateToV12(saved);const d=saved||buildInit();setData(d);applyTheme(d.settings);setAuthLoading(false);
      setTimeout(()=>{const el=document.getElementById('loading');if(el)el.style.display='none';},300);return;
    }
    const unsub=_auth.onAuthStateChanged(async u=>{setUser(u);if(u){await loadFB(u.uid);}else{setData(null);}setAuthLoading(false);setTimeout(()=>{const el=document.getElementById('loading');if(el)el.style.display='none';},300);});
    return()=>unsub();
  },[]);

  const loadFB=async(uid)=>{try{const ref=_db.collection('users').doc(uid);const doc=await ref.get();let init=doc.exists&&doc.data().appData?JSON.parse(doc.data().appData):buildInit();init=migrateToV12(init);setData(init);applyTheme(init.settings);if(!doc.exists)await ref.set({appData:JSON.stringify(init),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});setLastSync(new Date());if(unsubRef.current)unsubRef.current();unsubRef.current=ref.onSnapshot(snap=>{if(!snap.exists||saving.current)return;try{const nd=migrateToV12(JSON.parse(snap.data().appData));setData(nd);applyTheme(nd.settings);setLastSync(new Date());setSyncErr(false);}catch(e){}});}catch(e){setSyncErr(true);console.error(e);}};
  const doSave=async(uid,d)=>{saving.current=true;setSyncing(true);setSyncErr(false);try{await _db.collection('users').doc(uid).set({appData:JSON.stringify(d),updatedAt:firebase.firestore.FieldValue.serverTimestamp()});setLastSync(new Date());}catch(e){setSyncErr(true);}finally{setTimeout(()=>{saving.current=false;},2500);setSyncing(false);}};
  const upd=useCallback((changes)=>{setData(d=>{const nd={...d,...changes};if(FB_ON&&user){if(saveTimer.current)clearTimeout(saveTimer.current);saveTimer.current=setTimeout(()=>doSave(user.uid,nd),1500);}else saveLocal(nd);return nd;});},[user]);
  const awardXP=useCallback((amount,label)=>{showXpPop(amount);setData(d=>{const g={...d.gamification,xp:(d.gamification?.xp||0)+amount};const achs=[...(g.achievements||[])];if(!achs.includes('first_log')&&label?.includes('⏱️')){achs.push('first_log');showAch(ACH.find(a=>a.id==='first_log'));}const nd={...d,gamification:{...g,achievements:achs}};if(FB_ON&&user){if(saveTimer.current)clearTimeout(saveTimer.current);saveTimer.current=setTimeout(()=>doSave(user.uid,nd),1500);}else saveLocal(nd);return nd;});},[user]);
  const [authErr,setAuthErr]=useState('');
  const signIn=()=>{
    if(!_auth)return;
    setAuthErr('');
    const p=new firebase.auth.GoogleAuthProvider();
    _auth.signInWithPopup(p).catch(e=>{console.error(e);const msg=authErrMsg(e);if(msg)setAuthErr(msg);});
  };
  const signInEmail=(email,pass)=>{if(!_auth)return;setAuthErr('');return _auth.signInWithEmailAndPassword(email,pass).catch(e=>{console.error(e);setAuthErr(authErrMsg(e));throw e;});};
  const signUpEmail=(email,pass)=>{if(!_auth)return;setAuthErr('');return _auth.createUserWithEmailAndPassword(email,pass).catch(e=>{console.error(e);setAuthErr(authErrMsg(e));throw e;});};
  const resetPassword=(email)=>{if(!_auth)return;setAuthErr('');return _auth.sendPasswordResetEmail(email).catch(e=>{console.error(e);setAuthErr(authErrMsg(e));throw e;});};
  const signOut=()=>{if(unsubRef.current)unsubRef.current();if(_auth)_auth.signOut();setUser(null);setData(null);};
  const nav=(pg,params={})=>{setPage(pg);setPageParams(params);};
  const togNav=(id)=>setExpandedNav(p=>({...p,[id]:!p[id]}));

  if(authLoading)return null;
  if(FB_ON&&fbInitFailed)return<FirebaseErrorScreen/>;
  if(FB_ON&&!user)return<SignInPage onSignIn={signIn} onSignInEmail={signInEmail} onSignUpEmail={signUpEmail} onResetPassword={resetPassword} authErr={authErr}/>;
  if(!data)return null;
  if(showWelcome)return<WelcomeScreen data={data} user={user} onContinue={()=>setShowWelcome(false)}/>;

  const sections={};PAGES.forEach(p=>{if(!sections[p.sec])sections[p.sec]=[];sections[p.sec].push(p);});
  const cp=PAGES.find(p=>p.id===page);
  const xp=data.gamification?.xp||0;const lv=getLevel(xp);
  const nlv=LEVELS.find(l=>l.level===lv.level+1)||lv;
  const xpP=Math.min(100,Math.round((xp-lv.min)/(nlv.min-lv.min)*100));
  const critCount=data.courses.filter(c=>c.risk==='critical').length;
  const hMissed=data.habits.filter(h=>!h.archived&&!h.completions[TODAY]).length;
  const activeCourses=data.courses.filter(c=>!c.archived);

  function renderPage(){
    if(page==='dashboard')return<DashboardPage data={data} upd={upd} nav={nav} awardXP={awardXP}/>;
    if(page==='uniphase')return<UniPhasePage data={data} upd={upd}/>;
    if(page==='timeline')return<TimelinePage data={data}/>;
    if(page==='timer')return<TimerPage data={data} upd={upd} awardXP={awardXP} nav={nav}/>;
    if(page==='journal')return<StudyJournalPage data={data} upd={upd} awardXP={awardXP}/>;
    if(page==='courses')return<CoursesPage data={data} upd={upd} awardXP={awardXP} initCourseId={pageParams.courseId}/>;
    if(page==='language')return<LanguagePage data={data} upd={upd}/>;
    if(page==='studylog')return<StudyLogPage data={data} upd={upd}/>;
    if(page==='habits')return<HabitsPage data={data} upd={upd}/>;
    if(page==='admin')return<AdminPage data={data} upd={upd}/>;
    if(page==='events')return<EventsPage data={data} upd={upd}/>;
    if(page==='settings')return<SettingsPage data={data} upd={upd}/>;
    if(page==='parking')return<ParkingLotPage data={data} upd={upd}/>;
  }

  return<div className="app">
    <div className={`sb${sbOpen?'':' collapsed'}`}>
      <div className="sb-logo">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div className="sb-title">⚡<span className="sb-ver"> StudyOS <span style={{fontSize:9,background:'var(--acc2)',color:'var(--acc)',borderRadius:3,padding:'1px 4px'}}>v12</span></span></div>
          <button className="sb-toggle" onClick={()=>setSbOpen(o=>!o)} title={sbOpen?'Thu gọn sidebar':'Mở rộng sidebar'}>{sbOpen?'◀':'▶'}</button>
        </div>
        {sbOpen&&<div style={{marginTop:7}}>
          <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}><span style={{fontSize:13}}>{lv.emoji}</span><span style={{fontSize:11,fontWeight:600,color:'var(--tx)'}}>Lv.{lv.level} {lv.name}</span><span style={{fontSize:10,color:'var(--mu)',marginLeft:'auto'}}>{xp} XP</span></div>
          <div className="xp-bar"><div className="xp-fill" style={{width:`${xpP}%`,background:'linear-gradient(90deg,var(--acc),#B06EF5)'}}/></div>
          <div className="xp-info"><span>{xp-lv.min}</span><span>/{nlv.min-lv.min}</span></div>
        </div>}
      </div>
      <div style={{flex:1,paddingBottom:8,overflowY:'auto'}}>
        {Object.entries(sections).map(([sec,pages])=><div key={sec}>
          {sbOpen&&<div className="sb-sec">{sec}</div>}
          {pages.map(p=>{
            let badge=null;
            if(p.id==='courses'&&critCount>0)badge=<span className="nav-badge" style={{marginLeft:'auto',background:'var(--cr)',color:'#fff',borderRadius:9,padding:'1px 5px',fontSize:9,fontWeight:700}}>{critCount}</span>;
            if(p.id==='habits'&&hMissed>0)badge=<span className="nav-badge" style={{marginLeft:'auto',background:'var(--wa)',color:'#fff',borderRadius:9,padding:'1px 5px',fontSize:9,fontWeight:700}}>{hMissed}</span>;
            if(p.id==='events'){const up=getUpcomingEvts(data.events,14).length;if(up>0)badge=<span className="nav-badge" style={{marginLeft:'auto',color:'var(--mu)',fontSize:10}}>{up}</span>;}
            if(p.id==='parking'){const total=(data.parkingTasks||[]).filter(t=>!t.done).length+(data.parkingNotes||[]).length;if(total>0)badge=<span className="nav-badge" style={{marginLeft:'auto',color:'var(--dm)',fontSize:10}}>{total}</span>;}
            const isCoursesExpanded=expandedNav['courses'];
            return<div key={p.id}>
              <button className={`nav ${page===p.id?'on':''}`} onClick={()=>{nav(p.id);if(p.id==='courses'&&sbOpen)togNav('courses');}}>
                <span style={{fontSize:14,width:18,textAlign:'center',flexShrink:0}}>{p.emoji}</span>
                <span className="sb-label">{p.label}</span>{badge}
                {p.id==='courses'&&sbOpen&&activeCourses.length>0&&<span style={{marginLeft:'auto',fontSize:10,color:'var(--dm)',opacity:.6}}>{isCoursesExpanded?'▲':'▼'}</span>}
              </button>
              {p.id==='courses'&&sbOpen&&isCoursesExpanded&&activeCourses.map(c=>
                <button key={c.id} className={`nav-sub${pageParams.courseId===c.id&&page==='courses'?' on':''}`}
                  onClick={()=>nav('courses',{courseId:c.id})}>
                  {c.emoji} {c.name}
                </button>)}
            </div>;})}
        </div>)}
      </div>
      <div style={{padding:'8px 12px',borderTop:'1px solid var(--bdr)'}}>
        <button onClick={()=>{
          const curT=THEMES[data.settings?.theme||'purple'];
          const isLight=curT?.mode==='light';
          const ns={...data.settings,theme:isLight?(data.settings?.lastDarkTheme||'purple'):'cozy',lastDarkTheme:isLight?data.settings?.lastDarkTheme:(data.settings?.theme||'purple')};
          upd({settings:ns});applyTheme(ns);
        }} style={{display:'flex',alignItems:'center',gap:sbOpen?7:0,justifyContent:sbOpen?'flex-start':'center',width:'100%',padding:'6px 8px',marginBottom:6,background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:7,cursor:'pointer',color:'var(--mu)'}}>
          <span style={{fontSize:13}}>{THEMES[data.settings?.theme||'purple']?.mode==='light'?'☀️':'🌙'}</span>
          {sbOpen&&<span style={{fontSize:11}}>{THEMES[data.settings?.theme||'purple']?.mode==='light'?'Light · chuyển Dark':'Dark · chuyển Light'}</span>}
        </button>
        {FB_ON&&user&&<div>
          {sbOpen&&<div className="sb-user" style={{fontSize:10,color:'var(--mu)',marginBottom:3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>👤 {user.displayName||user.email}</div>}
          <div style={{display:'flex',alignItems:'center',fontSize:10,color:'var(--mu)',marginBottom:5}}>
            <div className={`sync-dot ${syncing?'pulsing':''}`} style={{background:syncErr?'var(--cr)':syncing?'var(--wa)':'var(--su)'}}/>
            {sbOpen&&(syncErr?'Lỗi sync':syncing?'Đang sync...':lastSync?`${lastSync.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}`:'')}</div>
          {sbOpen&&<button className="btn-g" style={{padding:'3px 8px',fontSize:10,width:'100%',justifyContent:'center'}} onClick={signOut}>Đăng xuất</button>}
        </div>}
        {!FB_ON&&sbOpen&&<div style={{fontSize:10,color:'var(--dm)'}}>⚠️ Chưa cấu hình Firebase — dữ liệu chỉ lưu trên trình duyệt này</div>}
      </div>
    </div>
    <div className="main">
      <div className="mhd">
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {!sbOpen&&<button className="sb-toggle" onClick={()=>setSbOpen(true)} style={{fontSize:16}}>☰</button>}
          <div style={{fontSize:14,fontWeight:500}}>{cp?.emoji} {cp?.label}</div>
          {page==='courses'&&pageParams.courseId&&<button className="btn-g btn-sm" onClick={()=>nav('courses')} style={{marginLeft:4}}>← Danh sách môn</button>}
        </div>
        <div style={{fontSize:11,color:'var(--mu)'}}>{new Date().toLocaleDateString('vi-VN',{day:'numeric',month:'numeric',year:'numeric'})}</div>
      </div>
      <div className="scroll"><div className="content">{renderPage()}</div></div>
    </div>
  </div>;}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
