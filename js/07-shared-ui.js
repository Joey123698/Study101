/* ══════════════════════════════════════════════════════════════
   07-shared-ui.js — Reusable primitives, auth screens, common modals
   ══════════════════════════════════════════════════════════════ */
function Badge({risk}){const r=RISK[risk]||RISK.medium;return<span className={`badge ${r.cls}`}>{r.label}</span>;}
function Bar({v,color,h=5}){return<div className="bar-w" style={{height:h}}><div className="bar-f" style={{width:`${Math.max(0,Math.min(100,v||0))}%`,height:'100%',background:color||'#7C6EF5'}}/></div>;}
function Tick({done,color,onClick}){return<div className="tick" style={{borderColor:done?(color||'#7C6EF5'):'var(--bdr)',background:done?(color||'#7C6EF5'):'transparent'}} onClick={onClick}>{done&&<span style={{color:'#fff',fontSize:10,fontWeight:700}}>✓</span>}</div>;}

function SignInPage({onSignIn,onSignInEmail,onSignUpEmail,onResetPassword,authErr}){
  const [mode,setMode]=useState('signin'); // 'signin' | 'signup' | 'reset'
  const [email,setEmail]=useState('');const [pass,setPass]=useState('');const [pass2,setPass2]=useState('');
  const [loading,setLoading]=useState(false);const [localErr,setLocalErr]=useState('');const [resetSent,setResetSent]=useState(false);
  const err=localErr||authErr;
  const submit=async(e)=>{
    e.preventDefault();setLocalErr('');setResetSent(false);
    if(!email.trim()){setLocalErr('Nhập email trước đã.');return;}
    if(mode==='reset'){
      setLoading(true);
      try{await onResetPassword(email.trim());setResetSent(true);}catch(_){}
      setLoading(false);return;
    }
    if(!pass){setLocalErr('Nhập mật khẩu.');return;}
    if(mode==='signup'&&pass!==pass2){setLocalErr('Hai mật khẩu không khớp.');return;}
    if(mode==='signup'&&pass.length<6){setLocalErr('Mật khẩu cần ít nhất 6 ký tự.');return;}
    setLoading(true);
    try{if(mode==='signup')await onSignUpEmail(email.trim(),pass);else await onSignInEmail(email.trim(),pass);}catch(_){}
    setLoading(false);
  };
  return<div className="signin-wrap"><div style={{textAlign:'center',maxWidth:380,width:'100%',padding:'36px 32px',background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:20}}>
    <div style={{fontSize:46,marginBottom:14}}>⚡</div>
    <div style={{fontSize:21,fontWeight:700,color:'var(--acc)',marginBottom:6}}>StudyOS v11</div>
    <p style={{color:'var(--mu)',marginBottom:20,lineHeight:1.7,fontSize:13}}>Timer Fix · Sidebar · Study Journal · Mini Cards<br/><strong style={{color:'var(--tx)'}}>Sync real-time tất cả thiết bị</strong></p>

    <button className="g-btn" onClick={onSignIn} type="button">
      <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
      Đăng nhập bằng Google
    </button>

    <div style={{display:'flex',alignItems:'center',gap:10,margin:'18px 0'}}>
      <div style={{flex:1,height:1,background:'var(--bdr)'}}/>
      <span style={{fontSize:11,color:'var(--dm)'}}>hoặc dùng email</span>
      <div style={{flex:1,height:1,background:'var(--bdr)'}}/>
    </div>

    <form onSubmit={submit} style={{textAlign:'left'}}>
      <input type="email" className="inp" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email của bạn" autoComplete="email" style={{marginBottom:8,width:'100%',boxSizing:'border-box'}}/>
      {mode!=='reset'&&<input type="password" className="inp" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Mật khẩu" autoComplete={mode==='signup'?'new-password':'current-password'} style={{marginBottom:8,width:'100%',boxSizing:'border-box'}}/>}
      {mode==='signup'&&<input type="password" className="inp" value={pass2} onChange={e=>setPass2(e.target.value)} placeholder="Nhập lại mật khẩu" autoComplete="new-password" style={{marginBottom:8,width:'100%',boxSizing:'border-box'}}/>}

      {resetSent&&mode==='reset'&&<div style={{background:'var(--sub)',border:'1px solid var(--suBdr)',borderRadius:7,padding:'8px 10px',marginBottom:10,fontSize:11,color:'var(--su)'}}>✓ Đã gửi email đặt lại mật khẩu — kiểm tra hộp thư của bạn.</div>}
      {err&&<div style={{background:'var(--crb)',border:'1px solid var(--crBdr)',borderRadius:7,padding:'8px 10px',marginBottom:10,fontSize:11,color:'var(--cr)',lineHeight:1.5,textAlign:'left'}}>{err}</div>}

      <button type="submit" disabled={loading} className="btn-p" style={{width:'100%',justifyContent:'center',padding:'10px',opacity:loading?.6:1}}>
        {loading?'Đang xử lý...':mode==='signup'?'Tạo tài khoản':mode==='reset'?'Gửi email đặt lại mật khẩu':'Đăng nhập'}
      </button>
    </form>

    <div style={{marginTop:14,fontSize:11,color:'var(--mu)',display:'flex',justifyContent:'center',gap:14}}>
      {mode==='signin'&&<>
        <span style={{cursor:'pointer',color:'var(--acc)'}} onClick={()=>{setMode('signup');setLocalErr('');}}>Chưa có tài khoản? Đăng ký</span>
        <span style={{cursor:'pointer'}} onClick={()=>{setMode('reset');setLocalErr('');setResetSent(false);}}>Quên mật khẩu?</span>
      </>}
      {mode==='signup'&&<span style={{cursor:'pointer',color:'var(--acc)'}} onClick={()=>{setMode('signin');setLocalErr('');}}>Đã có tài khoản? Đăng nhập</span>}
      {mode==='reset'&&<span style={{cursor:'pointer',color:'var(--acc)'}} onClick={()=>{setMode('signin');setLocalErr('');setResetSent(false);}}>← Quay lại đăng nhập</span>}
    </div>
  </div></div>;}

/* ── V11d: Firebase init failure — visible error instead of hanging forever ── */
function FirebaseErrorScreen(){return<div className="signin-wrap"><div style={{textAlign:'center',maxWidth:420,padding:'36px 32px',background:'var(--sur)',border:'1px solid var(--crBdr)',borderRadius:20}}>
  <div style={{fontSize:40,marginBottom:12}}>⚠️</div>
  <div style={{fontSize:17,fontWeight:700,color:'var(--cr)',marginBottom:8}}>Không kết nối được Firebase</div>
  <p style={{color:'var(--mu)',fontSize:12.5,lineHeight:1.7,marginBottom:16,textAlign:'left'}}>
    SDK Firebase không tải được. Nguyên nhân thường gặp:
    <br/>• Mạng chặn <code style={{background:'var(--ch)',padding:'1px 4px',borderRadius:3}}>gstatic.com</code> (CDN Google)
    <br/>• Trình duyệt/extension chặn quảng cáo can thiệp
    <br/>• Đang mở file trực tiếp (file://) thay vì qua server/GitHub Pages
  </p>
  <button className="btn-p" style={{width:'100%',justifyContent:'center'}} onClick={()=>window.location.reload()}>🔄 Tải lại trang</button>
</div></div>;}

/* ── V11d: Personalized welcome screen shown right after login/data-load, before Dashboard ── */
function WelcomeScreen({data,user,onContinue}){
  const name=user?.displayName?.split(' ')[0]||data.settings?.userName||'bạn';
  const bannerUrl=data.settings?.bannerUrl;
  useEffect(()=>{const t=setTimeout(onContinue,2200);return()=>clearTimeout(t);},[]);
  const hour=new Date().getHours();
  const greeting=hour<11?'Chào buổi sáng':hour<14?'Chào buổi trưa':hour<18?'Chào buổi chiều':'Chào buổi tối';
  return<div onClick={onContinue} style={{position:'fixed',inset:0,zIndex:9998,cursor:'pointer',background:bannerUrl?'#000':'var(--bg)',display:'flex',alignItems:'flex-end',overflow:'hidden'}}>
    {bannerUrl&&<img src={bannerUrl} alt="" style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',opacity:.75}} onError={e=>{e.target.style.display='none';}}/>}
    <div style={{position:'absolute',inset:0,background:bannerUrl?'linear-gradient(180deg,rgba(0,0,0,.15) 0%,rgba(0,0,0,.35) 55%,rgba(0,0,0,.8) 100%)':'radial-gradient(circle at 50% 40%,var(--acc2),var(--bg) 70%)'}}/>
    <div style={{position:'relative',width:'100%',padding:'0 0 56px',textAlign:'center'}}>
      <div style={{fontSize:13,color:bannerUrl?'rgba(255,255,255,.75)':'var(--mu)',fontWeight:600,letterSpacing:'.06em',marginBottom:8,animation:'fadeInUp .6s ease both'}}>{greeting.toUpperCase()}</div>
      <div style={{fontSize:36,fontWeight:800,color:bannerUrl?'#fff':'var(--tx)',textShadow:bannerUrl?'0 2px 20px rgba(0,0,0,.4)':'none',marginBottom:10,animation:'fadeInUp .6s ease .1s both'}}>Welcome back, {name} 👋</div>
      <div style={{fontSize:13,color:bannerUrl?'rgba(255,255,255,.65)':'var(--dm)',animation:'fadeInUp .6s ease .2s both'}}>Nhấn để vào Dashboard →</div>
    </div>
  </div>;}

/* ── V9: EMOJI PICKER ── */
const EMOJI_LIST={'📚 Học tập':['📚','📖','✏️','📝','🎓','🔬','📊','📈','💻','🧮','📐','🔭','💡','🗒️','📋'],'📅 Deadline':['📅','⏰','⌛','🗓️','⏱️','🎯','📌','🔔','✅','☑️','🚨','🔥','⚡','🏁','🎪'],'🌍 Sự kiện':['🌍','🎤','🏆','🎉','🤝','💼','🗣️','🏫','🌱','💰','🤔','🎭','🏅','🎊','🌐'],'🏠 Cuộc sống':['🏠','🍳','🛒','👕','🏊','💧','😴','🍎','☕','🎵','🌞','🌙','❤️','🐾','🎨']};
function EmojiPicker({value,onChange}){
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  useEffect(()=>{const h=(e)=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);},[]);
  return<div style={{position:'relative'}} ref={ref}>
    <div style={{fontSize:22,cursor:'pointer',background:'var(--ch)',borderRadius:7,width:42,height:42,display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid var(--bdr)',userSelect:'none'}} onClick={()=>setOpen(o=>!o)} title="Chọn emoji">{value||'📌'}</div>
    {open&&<div style={{position:'absolute',top:'calc(100% + 4px)',left:0,zIndex:500,background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:12,padding:'10px',width:248,boxShadow:'0 8px 32px rgba(0,0,0,.5)',maxHeight:260,overflowY:'auto'}}>
      {Object.entries(EMOJI_LIST).map(([cat,emojis])=><div key={cat} style={{marginBottom:8}}>
        <div style={{fontSize:9,color:'var(--dm)',fontWeight:700,marginBottom:3,letterSpacing:'.05em'}}>{cat}</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:2}}>
          {emojis.map(e=><button key={e} onClick={()=>{onChange(e);setOpen(false);}} style={{background:'none',border:'1px solid transparent',borderRadius:5,cursor:'pointer',fontSize:16,padding:'3px 5px',lineHeight:1}} onMouseEnter={ev=>ev.currentTarget.style.background='var(--ch)'} onMouseLeave={ev=>ev.currentTarget.style.background='none'}>{e}</button>)}
        </div>
      </div>)}
      <div style={{borderTop:'1px solid var(--bdr)',paddingTop:6}}>
        <input className="inp" value={value} onChange={e=>onChange(e.target.value)} placeholder="Nhập emoji khác..." style={{fontSize:13,padding:'4px 8px'}} onClick={e=>e.stopPropagation()}/>
      </div>
    </div>}
  </div>;}

/* ── V9: RECURRING EVENT HELPERS ── */
function getEventsOnDate(events,date){
  const dow=new Date(date+'T12:00:00').getDay();
  return events.filter(e=>{
    if(e.date===date)return true;
    if(e.recurring&&(e.recurringDow||[]).includes(dow)){
      if(date<e.date)return false;
      if(e.recurringEndDate&&date>e.recurringEndDate)return false;
      return true;
    }
    return false;
  }).map(e=>e.date===date?e:{...e,date,id:`${e.id}_${date}`});
}
function getUpcomingEvts(events,days=45){
  const res=[];const seen=new Set();
  for(let i=0;i<days;i++){const d=new Date(TODAY+'T12:00:00');d.setDate(d.getDate()+i);const ds=toLocalDateStr(d);getEventsOnDate(events,ds).forEach(e=>{if(!seen.has(e.id)){seen.add(e.id);res.push(e);}});}
  return res;
}

function AddEventModal({initDate,existing,onSave,onClose}){
  const [f,setF]=useState(existing?{title:existing.title,date:existing.date,time:existing.time||'',emoji:existing.emoji||'📅',type:existing.type,note:existing.note||'',shortLabel:existing.shortLabel||'',recurring:existing.recurring||false,recurringDow:existing.recurringDow||[],recurringEndDate:existing.recurringEndDate||''}:{title:'',date:initDate||TODAY,time:'',emoji:'📅',type:'academic',note:'',shortLabel:'',recurring:false,recurringDow:[],recurringEndDate:''});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const togDow=(d)=>setF(p=>({...p,recurringDow:p.recurringDow.includes(d)?p.recurringDow.filter(x=>x!==d):[...p.recurringDow,d]}));
  return<div className="ov" onClick={onClose}><div className="modal" style={{maxWidth:420}} onClick={e=>e.stopPropagation()}>
    <div className="flex-sb" style={{marginBottom:12}}><span style={{fontSize:14,fontWeight:500}}>{existing?'✏️ Sửa Event':'Thêm Event'}</span><button className="btn-g btn-sm" onClick={onClose}>✕</button></div>
    <div style={{display:'grid',gridTemplateColumns:'52px 1fr',gap:8,marginBottom:8}}>
      <div><div className="tx-dm" style={{marginBottom:4}}>Icon</div><EmojiPicker value={f.emoji} onChange={v=>s('emoji',v)}/></div>
      <div><div className="tx-dm" style={{marginBottom:2}}>Tiêu đề *</div><input className="inp" value={f.title} onChange={e=>s('title',e.target.value)} placeholder="Tên event..."/></div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
      <div><div className="tx-dm" style={{marginBottom:2}}>Ngày</div><input type="date" className="inp" value={f.date} onChange={e=>s('date',e.target.value)}/></div>
      <div><div className="tx-dm" style={{marginBottom:2}}>Giờ</div><input type="time" className="inp" value={f.time} onChange={e=>s('time',e.target.value)}/></div>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
      <div><div className="tx-dm" style={{marginBottom:2}}>Loại</div>
        <select className="sel" value={f.type} onChange={e=>s('type',e.target.value)}>
          {[['academic','Học thuật'],['exam','Kỳ thi'],['language','Ngôn ngữ'],['health','Sức khỏe'],['networking','Networking'],['other','Khác']].map(([k,v])=><option key={k} value={k}>{v}</option>)}
        </select>
      </div>
      <div><div className="tx-dm" style={{marginBottom:2}}>Tên tắt (Gantt)</div><input className="inp" value={f.shortLabel} onChange={e=>s('shortLabel',e.target.value)} placeholder="VD: Prs GSE"/></div>
    </div>
    <input className="inp" value={f.note} onChange={e=>s('note',e.target.value)} placeholder="Ghi chú..." style={{marginBottom:8}}/>
    <div style={{background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:8,padding:'9px',marginBottom:12}}>
      <div style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',marginBottom:f.recurring?8:0}} onClick={()=>s('recurring',!f.recurring)}>
        <div style={{width:17,height:17,borderRadius:4,border:`1.5px solid ${f.recurring?'var(--acc)':'var(--bdr)'}`,background:f.recurring?'var(--acc)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{f.recurring&&<span style={{color:'#fff',fontSize:9,fontWeight:700}}>✓</span>}</div>
        <span style={{fontSize:12,color:f.recurring?'var(--tx)':'var(--mu)',fontWeight:f.recurring?500:400}}>🔄 Lặp lại hàng tuần</span>
      </div>
      {f.recurring&&<div>
        <div className="tx-dm" style={{marginBottom:4}}>Ngày trong tuần</div>
        <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:8}}>
          {DV.map((d,i)=><button key={i} onClick={()=>togDow(i)} style={{width:33,height:33,borderRadius:6,border:`1.5px solid ${f.recurringDow.includes(i)?'var(--acc)':'var(--bdr)'}`,background:f.recurringDow.includes(i)?'var(--acc2)':'transparent',color:f.recurringDow.includes(i)?'var(--acc)':'var(--mu)',cursor:'pointer',fontSize:11,fontWeight:600}}>{d}</button>)}
        </div>
        <div className="tx-dm" style={{marginBottom:2}}>Lặp đến ngày</div>
        <input type="date" className="inp" value={f.recurringEndDate} onChange={e=>s('recurringEndDate',e.target.value)} style={{fontSize:11}}/>
      </div>}
    </div>
    <div style={{display:'flex',gap:8}}><button className="btn-p" style={{flex:1,justifyContent:'center'}} onClick={()=>f.title&&onSave(existing?{...existing,...f}:{...f,id:uid()})}>{existing?'Lưu':'Thêm'}</button><button className="btn-g" onClick={onClose}>Huỷ</button></div>
  </div></div>;}

/* ── v13: optional Goal link — Habit can (optionally) belong to a Goal from
   any Uni Phase, so it shows up grouped under that Goal on Uni Phase Plan
   instead of floating disconnected. Left unset, nothing changes for any
   existing habit. ── */
function EditHabitModal({habit,data,onSave,onArchive,onClose}){
  const [f,setF]=useState({name:habit.name,emoji:habit.emoji,color:habit.color,goalId:habit.goalId||''});
  const allGoals=(data?.uniPhases||[]).flatMap(p=>(p.goals||[]).map(g=>({...g,phaseName:p.name})));
  return<div className="ov" onClick={onClose}><div className="modal" style={{maxWidth:340}} onClick={e=>e.stopPropagation()}>
    <div className="flex-sb" style={{marginBottom:12}}><span style={{fontSize:14,fontWeight:500}}>Chỉnh sửa Habit</span><button className="btn-g btn-sm" onClick={onClose}>✕</button></div>
    <div style={{display:'grid',gridTemplateColumns:'50px 1fr',gap:8,marginBottom:10}}>
      <div><div className="tx-dm" style={{marginBottom:2}}>Icon</div><input className="inp" value={f.emoji} onChange={e=>setF(p=>({...p,emoji:e.target.value}))} style={{textAlign:'center',fontSize:18,padding:'4px'}}/></div>
      <div><div className="tx-dm" style={{marginBottom:2}}>Tên</div><input className="inp" value={f.name} onChange={e=>setF(p=>({...p,name:e.target.value}))}/></div>
    </div>
    <div className="tx-dm" style={{marginBottom:5}}>Màu</div>
    <div style={{display:'flex',gap:6,marginBottom:10,flexWrap:'wrap'}}>{PAL.map(c=><div key={c} onClick={()=>setF(p=>({...p,color:c}))} style={{width:22,height:22,borderRadius:'50%',background:c,cursor:'pointer',border:`3px solid ${f.color===c?'#fff':'transparent'}`}}/>)}</div>
    {allGoals.length>0&&<>
      <div className="tx-dm" style={{marginBottom:2}}>Phục vụ Goal nào? (tuỳ chọn)</div>
      <select className="sel" value={f.goalId} onChange={e=>setF(p=>({...p,goalId:e.target.value}))} style={{marginBottom:14,width:'100%'}}>
        <option value="">— Không liên kết —</option>
        {allGoals.map(g=><option key={g.id} value={g.id}>{g.icon} {g.text} ({g.phaseName})</option>)}
      </select>
    </>}
    <div style={{display:'flex',gap:8}}>
      <button className="btn-p" style={{flex:1,justifyContent:'center'}} onClick={()=>onSave({...habit,...f})}>Lưu</button>
      <button className="btn-g" onClick={()=>onArchive(habit.id)} style={{color:'var(--wa)'}}>Archive</button>
      <button className="btn-g" onClick={onClose}>Huỷ</button>
    </div>
  </div></div>;}

/* ── V5 NEW: ADMIN TASK MODAL ── */
function AdminTaskModal({existing,existingMode,onSave,onClose}){
  const isEdit=!!existing;
  const [f,setF]=useState(isEdit?{title:existing.title,emoji:existing.emoji,type:existingMode||'recurring',dow:existing.dow||[]}:{title:'',emoji:'📌',type:'daily',dow:[]});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const tog=(d)=>setF(p=>({...p,dow:p.dow.includes(d)?p.dow.filter(x=>x!==d):[...p.dow,d]}));
  return<div className="ov" onClick={onClose}><div className="modal" style={{maxWidth:360}} onClick={e=>e.stopPropagation()}>
    <div className="flex-sb" style={{marginBottom:12}}><span style={{fontSize:14,fontWeight:500}}>{isEdit?'✏️ Sửa Admin Task':'Thêm Admin Task'}</span><button className="btn-g btn-sm" onClick={onClose}>✕</button></div>
    <div style={{display:'grid',gridTemplateColumns:'52px 1fr',gap:8,marginBottom:10}}>
      <div><div className="tx-dm" style={{marginBottom:4}}>Icon</div><EmojiPicker value={f.emoji} onChange={v=>s('emoji',v)}/></div>
      <div><div className="tx-dm" style={{marginBottom:2}}>Tên task *</div><input className="inp" value={f.title} onChange={e=>s('title',e.target.value)} placeholder="VD: Nấu ăn..."/></div>
    </div>
    {!isEdit&&<div style={{display:'flex',gap:8,marginBottom:10}}>
      {[['daily','Một lần hôm nay'],['recurring','Hàng tuần']].map(([k,v])=><button key={k} className={f.type===k?'btn-p btn-sm':'btn-g btn-sm'} onClick={()=>s('type',k)}>{v}</button>)}
    </div>}
    {f.type==='recurring'&&<div style={{marginBottom:10}}>
      <div className="tx-dm" style={{marginBottom:5}}>Ngày trong tuần</div>
      <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
        {DV.map((d,i)=><button key={i} onClick={()=>tog(i)} style={{width:34,height:34,borderRadius:6,border:`1.5px solid ${f.dow.includes(i)?'var(--acc)':'var(--bdr)'}`,background:f.dow.includes(i)?'var(--acc2)':'transparent',color:f.dow.includes(i)?'var(--acc)':'var(--mu)',cursor:'pointer',fontSize:11,fontWeight:600}}>{d}</button>)}
      </div>
    </div>}
    <div style={{display:'flex',gap:8}}><button className="btn-p" style={{flex:1,justifyContent:'center'}} onClick={()=>{if(!f.title.trim())return;onSave(f);}}>{isEdit?'Lưu':'Thêm'}</button><button className="btn-g" onClick={onClose}>Huỷ</button></div>
  </div></div>;}

