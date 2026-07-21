/* ══════════════════════════════════════════════════════════════
   10-page-misc.js — Language, Habits, StudyLog, Events, Settings,
   ParkingLot, Study Journal (legacy — Phase 2 will rebuild as
   proper Session flow; kept functional in the meantime)
   ══════════════════════════════════════════════════════════════ */
function LanguagePage({data,upd}){
  const [weekOffset,setWeekOffset]=useState(0);
  const [editLang,setEditLang]=useState(null);  // ← V10c: language settings editor
  const updateLang=(lid,changes)=>upd({languages:data.languages.map(l=>l.id!==lid?l:{...l,...changes})});

  const getWeekDates=(offset)=>{
    const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+offset*7);
    const dow=d.getDay();const m=new Date(d);m.setDate(d.getDate()-(dow===0?6:dow-1));
    return Array.from({length:7},(_,i)=>{const dd=new Date(m);dd.setDate(m.getDate()+i);return dd;});
  };

  const weekObjs=getWeekDates(weekOffset);
  const wd=weekObjs.map(d=>toLocalDateStr(d));
  const weekLabel=`${weekObjs[0].toLocaleDateString('vi-VN',{day:'numeric',month:'numeric'})} – ${weekObjs[6].toLocaleDateString('vi-VN',{day:'numeric',month:'numeric',year:'numeric'})}`;

  const tog=(lid,date,type)=>upd({languages:data.languages.map(l=>l.id!==lid?l:{...l,log:{...l.log,[`${date}_${type}`]:!l.log[`${date}_${type}`]}})});
  const setMin=(lid,date,v)=>upd({languages:data.languages.map(l=>l.id!==lid?l:{...l,log:{...l.log,[`${date}_self_min`]:v}})});

  return<div>
    <div className="h1">🌐 Ngôn ngữ</div>
    <p className="tx-mu" style={{marginBottom:14}}>Theo dõi TIẾN TRÌNH học tập — nội dung/ghi chú vẫn nằm ở OneNote, essay ở Google Docs. Ngữ pháp & Nói dùng chung engine mastery với Course, nên cũng tự có Review Priority khi lâu chưa đụng tới.</p>
    {data.languages.map(lang=>{
      const cats=lang.categories||defCats();
      const concepts=lang.concepts||[];
      const cd=wd.filter(d=>lang.log[`${d}_class`]).length;
      const st=wd.reduce((s,d)=>s+(lang.log[`${d}_self_min`]||0),0);
      const goal=lang.classDOW.length*90+lang.selfMin*7;
      const pv=Math.min(100,Math.round((st+cd*90)/goal*100));
      const vocab=cats.vocabulary||{total:0,weeklyGoal:50};
      const totalVocab=vocab.total||0;
      const grammarConcepts=concepts.filter(c=>c.skill==='grammar');
      const speakingConcepts=concepts.filter(c=>c.skill==='speaking');
      const vocabConcepts=concepts.filter(c=>c.skill==='vocab');
      const grammarDone=grammarConcepts.filter(c=>deriveConceptStatus(c,null,data)==='Mastered').length;
      const speakingDone=speakingConcepts.filter(c=>deriveConceptStatus(c,null,data)==='Mastered').length;
      const writingItems=cats.writing?.items||[];
      const writingDone=writingItems.filter(i=>i.done).length;
      const cefrEntry=Object.entries(CEFR_VOCAB).find(([,v])=>totalVocab<v);
      const cefrNext=cefrEntry?cefrEntry:[null,null];
      const updateSkillConcepts=(skill,updatedList)=>{
        const others=concepts.filter(c=>c.skill!==skill);
        updateLang(lang.id,{concepts:[...updatedList,...others]});
      };
      const updateWriting=(updatedItems)=>updateLang(lang.id,{categories:{...cats,writing:{items:updatedItems}}});
      return<div key={lang.id} className="card" style={{marginBottom:14}}>
        <div className="flex-sb" style={{marginBottom:10}}>
          <div style={{display:'flex',gap:9,alignItems:'center'}}><span style={{fontSize:24}}>{lang.emoji}</span><div><div style={{fontSize:14,fontWeight:600}}>{lang.name}</div><div className="tx-dm">{lang.level} → {lang.target}</div></div></div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div style={{textAlign:'right'}}><div style={{fontSize:15,fontWeight:600,color:lang.color}}>{pv}%</div><div className="tx-dm">tuần {weekOffset===0?'này':weekOffset===-1?'trước':weekOffset<0?`${-weekOffset} tuần trước`:''}</div></div>
            <button className="btn-g btn-sm" onClick={()=>setEditLang({...lang})} title="Sửa lịch học / mục tiêu">✏️</button>
          </div>
        </div>
        {/* Stats row */}
        <div style={{display:'flex',gap:8,marginBottom:10,flexWrap:'wrap'}}>
          <div style={{background:'var(--sur)',borderRadius:6,padding:'5px 10px',textAlign:'center',flex:1}}>
            <div style={{fontSize:16,fontWeight:700,color:lang.color}}>{totalVocab}</div>
            <div className="tx-dm">từ vựng</div>
            {cefrNext[0]&&<div style={{fontSize:9,color:'var(--dm)'}}>→ {cefrNext[1]-totalVocab} đến {cefrNext[0]}</div>}
          </div>
          <div style={{background:'var(--sur)',borderRadius:6,padding:'5px 10px',textAlign:'center',flex:1}}><div style={{fontSize:16,fontWeight:600,color:lang.color}}>{grammarDone}/{grammarConcepts.length}</div><div className="tx-dm">ngữ pháp thành thạo</div></div>
          <div style={{background:'var(--sur)',borderRadius:6,padding:'5px 10px',textAlign:'center',flex:1}}><div style={{fontSize:16,fontWeight:600,color:lang.color}}>{speakingDone}/{speakingConcepts.length}</div><div className="tx-dm">topics thành thạo</div></div>
          <div style={{background:'var(--sur)',borderRadius:6,padding:'5px 10px',textAlign:'center',flex:1}}><div style={{fontSize:16,fontWeight:600,color:lang.color}}>{writingDone}</div><div className="tx-dm">bài viết ✓</div></div>
        </div>
        {/* Week navigation + attendance — process-tracking, không đổi */}
        <div style={{background:'var(--sur)',borderRadius:8,padding:'9px',marginBottom:10}}>
          <div className="week-nav">
            <button className="btn-g btn-sm" onClick={()=>setWeekOffset(w=>w-1)}>‹ Tuần trước</button>
            <span style={{fontSize:11,fontWeight:600,color:weekOffset===0?'var(--acc)':'var(--tx)'}}>{weekLabel}</span>
            <button className="btn-g btn-sm" onClick={()=>setWeekOffset(w=>Math.min(0,w+1))} style={{opacity:weekOffset>=0?.3:1}} disabled={weekOffset>=0}>Tuần sau ›</button>
          </div>
          <div style={{overflowX:'auto'}}>
            <div style={{display:'grid',gridTemplateColumns:'90px repeat(7,1fr)',gap:3,alignItems:'center',minWidth:420}}>
              <div/>
              {weekObjs.map((d,i)=>{const ds=wd[i];return<div key={i} style={{textAlign:'center'}}>
                <div style={{fontSize:9,color:ds===TODAY?'var(--acc)':'var(--mu)',fontWeight:ds===TODAY?700:400}}>
                  {d.toLocaleDateString('vi-VN',{weekday:'short'})}
                </div>
                <div style={{fontSize:10,color:ds===TODAY?'var(--acc)':'var(--dm)',fontWeight:ds===TODAY?700:400}}>
                  {d.toLocaleDateString('vi-VN',{day:'numeric',month:'numeric'})}
                </div>
              </div>;})}
              <div style={{fontSize:11,color:'var(--mu)'}}>Lớp học ✓</div>
              {wd.map((date,i)=>{const isCd=lang.classDOW.includes(weekObjs[i].getDay());const done=lang.log[`${date}_class`];
              return<div key={date} style={{textAlign:'center'}}>
                {isCd?<div onClick={()=>tog(lang.id,date,'class')} style={{width:26,height:26,borderRadius:4,border:`1.5px solid ${done?lang.color:'var(--bdr)'}`,background:done?lang.color+'44':'transparent',cursor:'pointer',margin:'auto',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11}}>{done?'✓':''}</div>
                :<div style={{width:26,height:26,background:'var(--bg)',borderRadius:4,margin:'auto',opacity:.12}}/>}
              </div>;})}
              <div style={{fontSize:11,color:'var(--mu)'}}>Tự học (phút)</div>
              {wd.map(date=><div key={date}><input type="number" min={0} max={180} value={lang.log[`${date}_self_min`]||''} onChange={e=>setMin(lang.id,date,+e.target.value)} style={{width:30,background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:3,color:'var(--tx)',fontSize:10,padding:'2px 3px',textAlign:'center',outline:'none'}}/></div>)}
            </div>
          </div>
          <div style={{marginTop:6}}><Bar v={pv} color={lang.color} h={4}/><div className="tx-dm" style={{marginTop:2}}>{st+cd*90}/{goal} phút</div></div>
        </div>
        {/* Vocabulary — counter ở đây CỐ TÌNH giữ nguyên siêu đơn giản (1 chạm =
           log ngay), không ép qua Concept/rating. Vocab Batches bên dưới là lớp
           theo dõi SÂU HƠN, hoàn toàn tuỳ chọn — không bắt buộc dùng. */}
        <div className="lang-cat">
          <div className="lang-cat-hd flex-sb" style={{marginBottom:8}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{fontSize:15}}>📝</span><span style={{fontSize:13,fontWeight:600,color:'var(--tx)'}}>Từ vựng</span>
              <span className="tx-dm">({totalVocab} từ tổng · 🎯 {vocab.weeklyGoal||50}/tuần)</span>
            </div>
          </div>
          <div className="vocab-box">
            <div style={{fontSize:40,fontWeight:800,color:lang.color,lineHeight:1}}>{totalVocab}</div>
            <div className="tx-dm" style={{margin:'4px 0 10px'}}>từ đã học</div>
            <div style={{display:'flex',gap:6,justifyContent:'center',flexWrap:'wrap'}}>
              {[1,5,10,25,50].map(n=><button key={n} className="btn-p btn-sm" onClick={()=>updateLang(lang.id,{categories:{...cats,vocabulary:{...vocab,total:(vocab.total||0)+n}}})}>{n>0?`+${n}`:n}</button>)}
              <button className="btn-g btn-sm" style={{color:'var(--cr)'}} onClick={()=>{if(vocab.total>0)updateLang(lang.id,{categories:{...cats,vocabulary:{...vocab,total:Math.max(0,(vocab.total||0)-1)}}});}}>-1</button>
            </div>
            <div style={{marginTop:8,fontSize:11,color:'var(--dm)'}}>
              {Object.entries(CEFR_VOCAB).map(([lv,min])=><span key={lv} style={{marginRight:8,color:totalVocab>=min?lang.color:'var(--dm)',fontWeight:totalVocab>=min?700:400}}>{totalVocab>=min?'✓':''}{lv}≥{min}</span>)}
            </div>
          </div>
        </div>
        <LanguageConceptSection lang={lang} skill="vocab" emoji="🗂️" label="Vocab Batches (tuỳ chọn)" hint="Chỉ dùng nếu muốn ôn lại theo từng cụm — không bắt buộc mỗi từ."
          concepts={vocabConcepts} data={data} onUpdate={l=>updateSkillConcepts('vocab',l)} defaultOpen={false} newPlaceholder="VD: Lektion 8 — Reisen..."/>
        <LanguageConceptSection lang={lang} skill="grammar" emoji="📖" label="Ngữ pháp" hasLevelChip
          concepts={grammarConcepts} data={data} onUpdate={l=>updateSkillConcepts('grammar',l)} defaultOpen={true} newPlaceholder="Điểm ngữ pháp mới..."/>
        <LanguageConceptSection lang={lang} skill="speaking" emoji="🗣️" label="Nói"
          concepts={speakingConcepts} data={data} onUpdate={l=>updateSkillConcepts('speaking',l)} defaultOpen={true} newPlaceholder="Topic đã luyện nói..."/>
        <LanguageWritingSection lang={lang} items={writingItems} onUpdate={updateWriting}/>
        <div style={{marginTop:10,fontSize:11,color:'var(--mu)'}}>📅 <strong style={{color:'var(--tx)'}}>{lang.schedule}</strong> · {lang.resources.join(' · ')}</div>
      </div>;})}
    {editLang&&<LangEditorModal lang={editLang} onSave={ch=>{updateLang(editLang.id,ch);setEditLang(null);}} onClose={()=>setEditLang(null)}/>}
  </div>;}

function LangEditorModal({lang,onSave,onClose}){
  const [f,setF]=useState({name:lang.name,level:lang.level,target:lang.target,schedule:lang.schedule,classDOW:lang.classDOW||[],selfMin:lang.selfMin||20});
  const s=(k,v)=>setF(p=>({...p,[k]:v}));
  const togDow=(d)=>setF(p=>({...p,classDOW:p.classDOW.includes(d)?p.classDOW.filter(x=>x!==d):[...p.classDOW,d].sort()}));
  return<div className="ov" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}>
    <div className="flex-sb" style={{marginBottom:12}}><span style={{fontSize:14,fontWeight:500}}>{lang.emoji} Sửa {lang.name}</span><button className="btn-g btn-sm" onClick={onClose}>✕</button></div>
    <div className="tx-dm" style={{marginBottom:2}}>Trình độ hiện tại</div>
    <input className="inp" value={f.level} onChange={e=>s('level',e.target.value)} style={{marginBottom:8}}/>
    <div className="tx-dm" style={{marginBottom:2}}>Mục tiêu</div>
    <input className="inp" value={f.target} onChange={e=>s('target',e.target.value)} style={{marginBottom:8}}/>
    <div className="tx-dm" style={{marginBottom:2}}>Mô tả lịch học (hiển thị ở cuối card)</div>
    <input className="inp" value={f.schedule} onChange={e=>s('schedule',e.target.value)} placeholder="VD: T4 & T6, 12:00–13:30 (hoặc để trống nếu đã kết thúc khóa)" style={{marginBottom:10}}/>
    <div className="tx-dm" style={{marginBottom:4}}>📅 Ngày học trên lớp (dùng để highlight điểm danh)</div>
    <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:4}}>
      {DV.map((d,i)=><button key={i} onClick={()=>togDow(i)} style={{width:36,height:36,borderRadius:7,border:`1.5px solid ${f.classDOW.includes(i)?lang.color:'var(--bdr)'}`,background:f.classDOW.includes(i)?lang.color+'22':'transparent',color:f.classDOW.includes(i)?lang.color:'var(--mu)',cursor:'pointer',fontSize:11,fontWeight:600}}>{d}</button>)}
    </div>
    {f.classDOW.length===0&&<div style={{fontSize:10,color:'var(--wa)',marginBottom:8}}>⚠️ Không chọn ngày nào — sẽ không có buổi lớp nào được highlight (phù hợp nếu đã hoàn thành khóa học trên lớp)</div>}
    <div className="tx-dm" style={{margin:'8px 0 2px'}}>Mục tiêu tự học mỗi ngày (phút)</div>
    <input type="number" className="inp" value={f.selfMin} onChange={e=>s('selfMin',+e.target.value)} style={{marginBottom:14}}/>
    <div style={{display:'flex',gap:8}}><button className="btn-p" style={{flex:1,justifyContent:'center'}} onClick={()=>onSave(f)}>Lưu</button><button className="btn-g" onClick={onClose}>Huỷ</button></div>
  </div></div>;}

/* ── v13.1: Grammar/Speaking/Vocab-batch section — Concept-based, reuses the
   SAME mastery/touches/Review-Priority engine as Course (04-mastery-engine.js).
   Rating is intentionally ONE tap (QUICK_EVAL_SCALE), not two separate
   Understanding+Confidence sliders like Course's FinishSessionModal — a
   language skill check is quick and informal, low-friction matters more
   here than the extra precision. ── */
function LanguageConceptSection({lang,skill,emoji,label,concepts,data,onUpdate,defaultOpen,hasLevelChip,newPlaceholder,hint}){
  const [open,setOpen]=useState(defaultOpen!==false);
  const [newText,setNewText]=useState('');
  const [newLevel,setNewLevel]=useState('B1');
  const add=()=>{
    if(!newText.trim())return;
    const nc={id:uid(),title:newText.trim(),skill,legacyLevel:hasLevelChip?newLevel:'',touches:[],objectiveIds:[],prerequisiteConceptIds:[]};
    onUpdate([nc,...concepts]);
    setNewText('');
  };
  const updateOne=(updated)=>onUpdate(concepts.map(c=>c.id===updated.id?updated:c));
  const delOne=(id)=>onUpdate(concepts.filter(c=>c.id!==id));
  const masteredCount=concepts.filter(c=>deriveConceptStatus(c,null,data)==='Mastered').length;
  return<div className="lang-cat">
    <div className="lang-cat-hd flex-sb" style={{marginBottom:open?8:0}} onClick={()=>setOpen(o=>!o)}>
      <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:15}}>{emoji}</span><span style={{fontSize:13,fontWeight:600,color:'var(--tx)'}}>{label}</span><span className="tx-dm">({masteredCount}/{concepts.length} thành thạo)</span></div>
      <span style={{fontSize:10,color:'var(--dm)'}}>{open?'▲':'▼'}</span>
    </div>
    {open&&<div>
      {hint&&<div className="tx-dm" style={{marginBottom:6}}>{hint}</div>}
      {concepts.length===0&&<div className="tx-dm" style={{padding:'8px 0',textAlign:'center'}}>Chưa có mục nào</div>}
      {concepts.map(c=><LangConceptRow key={c.id} concept={c} color={lang.color} data={data} onUpdate={updateOne} onDelete={()=>delOne(c.id)}/>)}
      <div style={{display:'flex',gap:5,marginTop:7,flexWrap:'wrap'}}>
        {hasLevelChip&&<select value={newLevel} onChange={e=>setNewLevel(e.target.value)} style={{background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:6,color:'var(--tx)',fontSize:11,padding:'4px 6px',outline:'none'}}>{CEFR_LEVELS.map(l=><option key={l} value={l}>{l}</option>)}</select>}
        <input className="inp" value={newText} onChange={e=>setNewText(e.target.value)} placeholder={newPlaceholder}
          onKeyDown={e=>e.key==='Enter'&&add()} style={{flex:1,fontSize:11,padding:'5px 8px'}}/>
        <button className="btn-p btn-sm" onClick={add}>+</button>
      </div>
    </div>}
  </div>;}

function LangConceptRow({concept,color,data,onUpdate,onDelete}){
  const [rating,setRating]=useState(false);
  const status=deriveConceptStatus(concept,null,data);
  const meta=STATUS_META[status];
  const mastery=calcProgress(concept,data);
  const rp=computeReviewPriority(concept,null,data);
  const rate=(v)=>{
    onUpdate({...concept,touches:[...(concept.touches||[]),{understanding:v,confidence:v,timestamp:Date.now(),sessionId:null}]});
    setRating(false);
  };
  return<div style={{padding:'6px 0',borderBottom:'1px solid var(--bdr)'}}>
    <div style={{display:'flex',alignItems:'center',gap:7}}>
      <span style={{fontSize:13}} title={STATUS_META[status].label}>{meta.emoji}</span>
      {concept.legacyLevel&&<span className="level-chip on" style={{background:color+'33',color,borderColor:color+'55'}}>{concept.legacyLevel}</span>}
      <span onClick={()=>setRating(r=>!r)} style={{flex:1,fontSize:12,cursor:'pointer'}}>{concept.title}</span>
      {mastery>0&&<span style={{fontSize:10,color,fontWeight:600}}>{mastery}%</span>}
      {(rp==='Medium'||rp==='High')&&<span style={{fontSize:9}} title={reviewPriorityLabel(rp,false)}>{rp==='High'?'🔴':'🟡'}</span>}
      <button onClick={()=>setRating(r=>!r)} style={{background:'none',border:'none',cursor:'pointer',color,fontSize:11,opacity:.75}}>⭐</button>
      <button onClick={onDelete} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:12,opacity:.35}}>×</button>
    </div>
    {rating&&<div style={{display:'flex',gap:5,marginTop:5,paddingLeft:20}}>
      {QUICK_EVAL_SCALE.map(s=><button key={s.value} onClick={()=>rate(s.value)} title={s.label} style={{background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:6,padding:'3px 7px',cursor:'pointer',fontSize:14}}>{s.emoji}</button>)}
    </div>}
  </div>;}

/* Writing stays a task list — essays are one-off deliverables, not a "review
   repeatedly" skill, so unlike Grammar/Speaking they're NOT converted to
   Concepts. Just gains Score/Feedback once marked done. */
function LanguageWritingSection({lang,items,onUpdate}){
  const [open,setOpen]=useState(true);
  const [newText,setNewText]=useState('');
  const [newLink,setNewLink]=useState('');
  const add=()=>{if(!newText.trim())return;onUpdate([{id:uid(),text:newText.trim(),done:false,link:newLink,score:null,feedback:''},...items]);setNewText('');setNewLink('');};
  const upd1=(id,changes)=>onUpdate(items.map(i=>i.id===id?{...i,...changes}:i));
  const del1=(id)=>onUpdate(items.filter(i=>i.id!==id));
  const done=items.filter(i=>i.done).length;
  return<div className="lang-cat">
    <div className="lang-cat-hd flex-sb" style={{marginBottom:open?8:0}} onClick={()=>setOpen(o=>!o)}>
      <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:15}}>✍️</span><span style={{fontSize:13,fontWeight:600,color:'var(--tx)'}}>Viết</span><span className="tx-dm">({done}/{items.length} ✓)</span></div>
      <span style={{fontSize:10,color:'var(--dm)'}}>{open?'▲':'▼'}</span>
    </div>
    {open&&<div>
      {items.length===0&&<div className="tx-dm" style={{padding:'8px 0',textAlign:'center'}}>Chưa có bài viết nào</div>}
      {items.map(it=><div key={it.id} style={{padding:'6px 0',borderBottom:'1px solid var(--bdr)'}}>
        <div style={{display:'flex',alignItems:'center',gap:7}}>
          <Tick done={it.done} color={lang.color} onClick={()=>upd1(it.id,{done:!it.done})}/>
          <span style={{flex:1,fontSize:12,textDecoration:it.done?'line-through':'none',opacity:it.done?.6:1}}>{it.text}</span>
          <button style={{background:'none',border:'none',cursor:'pointer',color:it.link?lang.color:'var(--dm)',fontSize:10,opacity:it.link?.8:.35}} onClick={()=>{if(it.link)window.open(it.link,'_blank');else{const u=prompt('Link bài viết (Google Docs...):','https://');if(u)upd1(it.id,{link:u});}}}>🔗</button>
          <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:12,opacity:.35}} onClick={()=>del1(it.id)}>×</button>
        </div>
        {it.link&&<div style={{fontSize:10,color:lang.color,paddingLeft:24,marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}><a href={it.link} target="_blank" rel="noreferrer" style={{color:lang.color}}>{it.link}</a></div>}
        {it.done&&<div style={{display:'flex',gap:6,marginTop:4,paddingLeft:23,alignItems:'center'}}>
          <span className="tx-dm">Điểm:</span>
          <input type="number" min={0} max={10} value={it.score??''} onChange={e=>upd1(it.id,{score:e.target.value===''?null:+e.target.value})} placeholder="-" style={{width:40,background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:4,color:'var(--tx)',fontSize:11,padding:'2px 5px',textAlign:'center',outline:'none'}}/>
          <input value={it.feedback} onChange={e=>upd1(it.id,{feedback:e.target.value})} placeholder="Feedback ngắn..." style={{flex:1,background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:4,color:'var(--tx)',fontSize:11,padding:'2px 6px',outline:'none'}}/>
        </div>}
      </div>)}
      <div style={{display:'flex',gap:5,marginTop:7}}>
        <input className="inp" value={newText} onChange={e=>setNewText(e.target.value)} placeholder="Tên bài viết..." onKeyDown={e=>e.key==='Enter'&&add()} style={{flex:1,fontSize:11,padding:'5px 8px'}}/>
        <input className="inp" value={newLink} onChange={e=>setNewLink(e.target.value)} placeholder="Link (optional)..." style={{flex:1,fontSize:11,padding:'5px 8px'}}/>
        <button className="btn-p btn-sm" onClick={add}>+</button>
      </div>
    </div>}
  </div>;}

function HabitsPage({data,upd}){
  const [showAdd,setShowAdd]=useState(false);const [editH,setEditH]=useState(null);const [showArch,setShowArch]=useState(false);
  const wd=weekDates();
  const wdObjs=wd.map(ds=>new Date(ds));
  const allGoals=(data.uniPhases||[]).flatMap(p=>p.goals||[]);
  const goalOf=(habit)=>habit.goalId?allGoals.find(g=>g.id===habit.goalId):null;
  const tog=(hid,date)=>upd({habits:data.habits.map(h=>h.id===hid?{...h,completions:{...h.completions,[date]:!h.completions[date]}}:h)});
  const active=data.habits.filter(h=>!h.archived);const archived=data.habits.filter(h=>h.archived);
  const done=active.filter(h=>h.completions[TODAY]).length;
  const last30=Array.from({length:30},(_,i)=>{const d=new Date();d.setDate(d.getDate()-i);return toLocalDateStr(d);});
  const overall=active.length>0?Math.round(last30.reduce((s,d)=>s+active.filter(h=>h.completions[d]).length,0)/(active.length*30)*100):0;
  return<div>
    <div className="flex-sb" style={{marginBottom:3}}><div className="h1">✅ Habits</div>
      <div style={{display:'flex',gap:5}}><button className="btn-g btn-sm" onClick={()=>setShowArch(s=>!s)}>📦 {archived.length}</button><button className="btn-p btn-sm" onClick={()=>setShowAdd(true)}>+ Thêm</button></div>
    </div>
    <p className="tx-mu" style={{marginBottom:12}}>Hôm nay: <strong style={{color:'var(--su)'}}>{done}/{active.length}</strong> · 30 ngày: <strong style={{color:'var(--acc)'}}>{overall}%</strong></p>
    <div className="card" style={{overflowX:'auto',marginBottom:10}}>
      <div style={{minWidth:420}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr repeat(7,34px)',gap:3,marginBottom:6}}>
          <div className="lbl" style={{margin:0}}>HABIT</div>
          {wdObjs.map((d,i)=>{const isT=wd[i]===TODAY;return<div key={i} style={{textAlign:'center'}}>
            <div style={{fontSize:9,color:isT?'var(--acc)':'var(--mu)',fontWeight:isT?700:400}}>
              {d.toLocaleDateString('vi-VN',{weekday:'short'})}
            </div>
            <div style={{fontSize:10,color:isT?'var(--acc)':'var(--dm)',fontWeight:isT?700:400,background:isT?'var(--acc2)':'transparent',borderRadius:4,padding:'1px 2px'}}>
              {d.getDate()}/{d.getMonth()+1}
            </div>
          </div>;})}
        </div>
        {active.map(h=>{const str=hStreak(h.completions);const r30=Math.round(last30.filter(d=>h.completions[d]).length/30*100);
        return<div key={h.id} style={{display:'grid',gridTemplateColumns:'1fr repeat(7,34px)',gap:3,alignItems:'center',padding:'4px 0',borderBottom:'1px solid var(--bdr)'}}>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:13}}>{h.emoji}</span>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:11,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{h.name}</div>
              <div style={{display:'flex',gap:7,alignItems:'center'}}>{str>0&&<span style={{fontSize:9,color:h.color}}>🔥{str}</span>}<span style={{fontSize:9,color:'var(--dm)'}}>{r30}%</span>{goalOf(h)&&<span style={{fontSize:8,background:'var(--acc2)',color:'var(--acc)',borderRadius:3,padding:'0 4px'}}>{goalOf(h).icon} Goal</span>}</div>
            </div>
            <button onClick={()=>setEditH(h)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:11,opacity:.6,flexShrink:0}}>✏️</button>
          </div>
          {wd.map((date,i)=>{const d=h.completions[date];return<div key={date} className={`hab-cell ${d?'done':''}`} style={{background:d?h.color:'transparent',borderColor:d?h.color:date===TODAY?'var(--acc3)':'var(--bdr)'}} onClick={()=>tog(h.id,date)}>{d?'✓':''}</div>;})}
        </div>;})}
      </div>
    </div>
    <div className="card" style={{marginBottom:10}}>
      <div className="lbl" style={{marginBottom:7}}>📊 THỐNG KÊ 30 NGÀY</div>
      {active.map(h=>{const r=Math.round(last30.filter(d=>h.completions[d]).length/30*100);const str=hStreak(h.completions);
      return<div key={h.id} style={{marginBottom:7}}><div className="flex-sb" style={{marginBottom:2}}><span style={{fontSize:11}}>{h.emoji} {h.name}</span><div style={{display:'flex',gap:8,alignItems:'center'}}><span style={{fontSize:10,color:h.color}}>🔥{str}</span><span style={{fontSize:11,color:h.color,fontWeight:600}}>{r}%</span></div></div><Bar v={r} color={h.color} h={4}/></div>;})}
    </div>
    {showArch&&archived.length>0&&<div className="card" style={{marginBottom:10,opacity:.7}}>
      <div className="lbl" style={{marginBottom:7}}>📦 ARCHIVED</div>
      {archived.map(h=><div key={h.id} style={{display:'flex',gap:8,alignItems:'center',padding:'5px 0',borderBottom:'1px solid var(--bdr)'}}>
        <span>{h.emoji}</span><span style={{flex:1,fontSize:12,color:'var(--mu)'}}>{h.name}</span>
        <button className="btn-g btn-sm" onClick={()=>upd({habits:data.habits.map(x=>x.id===h.id?{...x,archived:false}:x)})}>Khôi phục</button>
        <button className="btn-g btn-sm" style={{color:'var(--cr)'}} onClick={()=>upd({habits:data.habits.filter(x=>x.id!==h.id)})}>Xóa</button>
      </div>)}
    </div>}
    {showAdd&&<div className="ov" onClick={()=>setShowAdd(false)}><div className="modal" style={{maxWidth:340}} onClick={e=>e.stopPropagation()}>
      <div className="flex-sb" style={{marginBottom:12}}><span style={{fontSize:14,fontWeight:500}}>+ Habit mới</span><button className="btn-g btn-sm" onClick={()=>setShowAdd(false)}>✕</button></div>
      <div style={{display:'grid',gridTemplateColumns:'50px 1fr',gap:8,marginBottom:10}}>
        <div><div className="tx-dm" style={{marginBottom:2}}>Icon</div><input className="inp" id="hEm" defaultValue="✅" style={{textAlign:'center',fontSize:18,padding:'4px'}}/></div>
        <div><div className="tx-dm" style={{marginBottom:2}}>Tên</div><input className="inp" id="hNm" placeholder="VD: Đọc sách..."/></div>
      </div>
      <div className="tx-dm" style={{marginBottom:5}}>Màu</div>
      <div style={{display:'flex',gap:6,marginBottom:14}}>{PAL.map((c,ci)=><div key={c} id={`hpal_${ci}`} onClick={()=>PAL.forEach((_,j)=>{const el=document.getElementById(`hpal_${j}`);if(el)el.style.border=j===ci?'3px solid #fff':'3px solid transparent';})} style={{width:22,height:22,borderRadius:'50%',background:c,cursor:'pointer',border:'3px solid transparent'}}/>)}</div>
      <div style={{display:'flex',gap:8}}>
        <button className="btn-p" style={{flex:1,justifyContent:'center'}} onClick={()=>{const name=document.getElementById('hNm')?.value;const emoji=document.getElementById('hEm')?.value;if(!name?.trim())return;const ci=PAL.findIndex((_,j)=>document.getElementById(`hpal_${j}`)?.style.border!=='3px solid transparent');const col=ci>=0?PAL[ci]:PAL[0];upd({habits:[...data.habits,{id:uid(),name:name.trim(),emoji:emoji||'✅',color:col,completions:{},archived:false}]});setShowAdd(false);}}>Thêm</button>
        <button className="btn-g" onClick={()=>setShowAdd(false)}>Huỷ</button>
      </div>
    </div></div>}
    {editH&&<EditHabitModal habit={editH} data={data} onSave={h=>{upd({habits:data.habits.map(x=>x.id===h.id?h:x)});setEditH(null);}} onArchive={id=>{upd({habits:data.habits.map(h=>h.id===id?{...h,archived:true}:h)});setEditH(null);}} onClose={()=>setEditH(null)}/>}
  </div>;}

/* ── V11: STUDY HEATMAP — signature element, inspired by reference image's writing-stats calendar ── */
function StudyHeatmap({studyLog,weeks=14}){
  const dailyH={};studyLog.forEach(l=>{dailyH[l.date]=(dailyH[l.date]||0)+l.hours;});
  const todayD=new Date(TODAY+'T12:00:00');
  const totalDays=weeks*7;
  const startDate=new Date(todayD);startDate.setDate(startDate.getDate()-(totalDays-1));
  const startDow=(startDate.getDay()+6)%7;startDate.setDate(startDate.getDate()-startDow); // back to Monday
  const cols=[];let cur=new Date(startDate);
  while(cur<=todayD){
    const col=[];
    for(let r=0;r<7;r++){const ds=toLocalDateStr(cur);col.push({date:ds,hours:dailyH[ds]||0,isFuture:ds>TODAY,isFirstOfMonth:cur.getDate()===1});cur.setDate(cur.getDate()+1);}
    cols.push(col);
  }
  const level=(h)=>h<=0?0:h<=0.5?1:h<=1.5?2:h<=3?3:4;
  // streak calc
  let streak=0;let sc=new Date(todayD);if(!dailyH[TODAY])sc.setDate(sc.getDate()-1);
  while(true){const ds=toLocalDateStr(sc);if(dailyH[ds]>0){streak++;sc.setDate(sc.getDate()-1);}else break;}
  const totalH=Object.entries(dailyH).filter(([d])=>d>=toLocalDateStr(startDate)).reduce((s,[,h])=>s+h,0);
  return<div className="card" style={{marginBottom:10}}>
    <div className="flex-sb" style={{marginBottom:8}}>
      <div className="lbl" style={{margin:0}}>🔥 STUDY HEATMAP</div>
      <div style={{display:'flex',gap:10,fontSize:11}}>
        {streak>0&&<span style={{color:'var(--acc)',fontWeight:700}}>🔥 {streak} ngày liên tiếp</span>}
        <span className="tx-dm">{totalH.toFixed(0)}h / {weeks} tuần</span>
      </div>
    </div>
    <div style={{overflowX:'auto',paddingBottom:4}}>
      <div style={{display:'flex',gap:3,minWidth:cols.length*13}}>
        {cols.map((col,ci)=><div key={ci} style={{display:'flex',flexDirection:'column',gap:3}}>
          {col.map((cell,ri)=><div key={ri} title={`${fmt(cell.date)}: ${cell.hours.toFixed(1)}h`}
            style={{width:11,height:11,borderRadius:3,background:cell.isFuture?'transparent':`var(--hm${level(cell.hours)})`,
              border:cell.date===TODAY?'1.5px solid var(--acc)':cell.isFuture?'1px dashed var(--bdr)':'none',
              opacity:cell.isFuture?.3:1}}/>)}
        </div>)}
      </div>
    </div>
    <div style={{display:'flex',alignItems:'center',gap:5,marginTop:7,justifyContent:'flex-end'}}>
      <span style={{fontSize:9,color:'var(--dm)'}}>Ít</span>
      {[0,1,2,3,4].map(l=><div key={l} style={{width:10,height:10,borderRadius:2,background:`var(--hm${l})`}}/>)}
      <span style={{fontSize:9,color:'var(--dm)'}}>Nhiều</span>
    </div>
  </div>;}

function StudyLogPage({data,upd}){
  const [showLog,setShowLog]=useState(false);const chartRef=useRef(null);const chartInst=useRef(null);
  const wd=useMemo(()=>weekDates(),[]);
  const wl=data.studyLog.filter(l=>wd.includes(l.date));
  const subH={};wl.forEach(l=>{subH[l.subjectId]=(subH[l.subjectId]||0)+l.hours;});
  const subC={micro:'#E24B4A',ipe:'#BA7517',gse:'#1D9E75',macro:'#7C6EF5',de:'#FFD700',en:'#4FA3FF',other:'#6B75A0'};
  const subN={micro:'Microeconometrics',ipe:'IPE',gse:'GSE',macro:'Macro',de:'Tiếng Đức',en:'Tiếng Anh',other:'Khác'};
  const wt=wl.reduce((s,l)=>s+l.hours,0);
  useEffect(()=>{if(!chartRef.current||!Object.keys(subH).length)return;if(chartInst.current)chartInst.current.destroy();
    const cs=getComputedStyle(document.documentElement);const muC=cs.getPropertyValue('--mu').trim()||'#6B75A0';const txC=cs.getPropertyValue('--tx').trim()||'#E4E8FA';const bdrC=cs.getPropertyValue('--bdr').trim()||'#252D4A';
    chartInst.current=new Chart(chartRef.current,{type:'bar',data:{labels:Object.keys(subH).map(k=>subN[k]||k),datasets:[{data:Object.values(subH),backgroundColor:Object.keys(subH).map(k=>subC[k]||'#7C6EF5'),borderRadius:4}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',plugins:{legend:{display:false}},scales:{x:{ticks:{color:muC,font:{size:10}},grid:{color:bdrC}},y:{ticks:{color:txC,font:{size:11}},grid:{display:false}}}}});return()=>{if(chartInst.current)chartInst.current.destroy();};},[wl.length,data.settings?.theme]);
  return<div>
    <div className="flex-sb" style={{marginBottom:3}}><div className="h1">📊 Study Log</div><button className="btn-g btn-sm" onClick={()=>setShowLog(true)}>+ Log thủ công</button></div>
    <p className="tx-mu" style={{marginBottom:12}}>Tuần này: <strong style={{color:'#7C6EF5'}}>{wt.toFixed(1)}h</strong> · Dùng tab ⏱️ Timer để auto-log</p>
    <StudyHeatmap studyLog={data.studyLog}/>
    <div className="g2" style={{marginBottom:10}}>
      <div className="card"><div className="lbl" style={{marginBottom:5}}>PHÂN BỔ TUẦN</div>
        {Object.keys(subH).length>0?<div className="chart-wrap"><canvas ref={chartRef}/></div>:<div style={{height:90,display:'flex',alignItems:'center',justifyContent:'center',color:'var(--dm)',fontSize:12}}>Mở tab ⏱️ Timer để bắt đầu!</div>}
      </div>
      <div className="card"><div className="lbl" style={{marginBottom:5}}>TOP MÔN HỌC</div>
        {Object.entries(subH).sort((a,b)=>b[1]-a[1]).map(([k,h])=><div key={k} style={{marginBottom:6}}><div className="flex-sb" style={{marginBottom:2}}><span style={{fontSize:11}}>{subN[k]||k}</span><span style={{fontSize:11,color:subC[k]||'#7C6EF5',fontWeight:600}}>{h.toFixed(1)}h</span></div><Bar v={wt>0?h/wt*100:0} color={subC[k]||'#7C6EF5'} h={4}/></div>)}
        {!Object.keys(subH).length&&<div className="tx-dm">Chưa có dữ liệu</div>}
        {wt>0&&<div style={{borderTop:'1px solid var(--bdr)',marginTop:7,paddingTop:7,display:'flex',justifyContent:'space-between'}}><span className="tx-mu">Tổng</span><span style={{fontWeight:600,color:'#7C6EF5'}}>{wt.toFixed(1)}h</span></div>}
      </div>
    </div>
    <div className="card"><div className="lbl" style={{marginBottom:7}}>LỊCH SỬ GẦN ĐÂY</div>
      {!data.studyLog.length&&<div className="tx-dm" style={{textAlign:'center',padding:'14px'}}>Chưa có log — mở tab ⏱️ Timer!</div>}
      {data.studyLog.slice(0,12).map(l=><div key={l.id} className="log-entry">
        <div style={{width:30,height:30,borderRadius:5,background:(subC[l.subjectId]||'#7C6EF5')+'22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,flexShrink:0}}>{data.courses.find(c=>c.id===l.subjectId)?.emoji||'📚'}</div>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:500}}>{l.subjectName||subN[l.subjectId]||l.subjectId}</div><div className="tx-dm">{fmt(l.date)}{l.note&&` · ${l.note}`}</div></div>
        <div style={{fontSize:13,fontWeight:600,color:subC[l.subjectId]||'#7C6EF5'}}>{l.hours}h</div>
        <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:12,opacity:.4}} onClick={()=>upd({studyLog:data.studyLog.filter(x=>x.id!==l.id)})}>×</button>
      </div>)}
    </div>
    {showLog&&<div className="ov" onClick={()=>setShowLog(false)}><div className="modal" style={{maxWidth:340}} onClick={e=>e.stopPropagation()}>
      <div className="flex-sb" style={{marginBottom:12}}><span style={{fontSize:14,fontWeight:500}}>Log thủ công</span><button className="btn-g btn-sm" onClick={()=>setShowLog(false)}>✕</button></div>
      <select className="sel" id="lsS" style={{marginBottom:7}}>
        {[...data.courses,{id:'de',name:'Tiếng Đức',emoji:'🇩🇪'},{id:'en',name:'Tiếng Anh',emoji:'🇬🇧'},{id:'other',name:'Khác',emoji:'📌'}].map(c=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
      </select>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7,marginBottom:7}}>
        <div><div className="tx-dm" style={{marginBottom:2}}>Số giờ</div><input type="number" className="inp" id="lsH" defaultValue="1.5" min="0.25" step="0.25"/></div>
        <div><div className="tx-dm" style={{marginBottom:2}}>Ngày</div><input type="date" className="inp" id="lsD" defaultValue={TODAY}/></div>
      </div>
      <input className="inp" id="lsN" placeholder="Ghi chú..." style={{marginBottom:12}}/>
      <div style={{display:'flex',gap:7}}>
        <button className="btn-p" style={{flex:1,justifyContent:'center'}} onClick={()=>{const s=document.getElementById('lsS')?.value;const h=parseFloat(document.getElementById('lsH')?.value);const d=document.getElementById('lsD')?.value;const n=document.getElementById('lsN')?.value;if(!h||h<=0)return;const sub=[...data.courses,{id:'de',name:'Tiếng Đức'},{id:'en',name:'Tiếng Anh'},{id:'other',name:'Khác'}].find(c=>c.id===s);upd({studyLog:[{id:uid(),date:d||TODAY,subjectId:s,hours:h,subjectName:sub?.name||'',note:n},...data.studyLog]});setShowLog(false);}}>Lưu</button>
        <button className="btn-g" onClick={()=>setShowLog(false)}>Huỷ</button>
      </div>
    </div></div>}
    {/* PERFORMANCE REPORT */}
    <div className="card" style={{marginTop:12}}>
      <div className="lbl" style={{marginBottom:8}}>📋 BÁO CÁO TUẦN NÀY</div>
      {(()=>{
        const last7=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6+i);return toLocalDateStr(d);});
        const dailyH=last7.map(ds=>({ds,h:data.studyLog.filter(l=>l.date===ds).reduce((s,l)=>s+l.hours,0),d:new Date(ds)}));
        const totalH=dailyH.reduce((s,d)=>s+d.h,0);
        const prevWeek=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-13+i);return toLocalDateStr(d);});
        const prevH=data.studyLog.filter(l=>prevWeek.includes(l.date)).reduce((s,l)=>s+l.hours,0);
        const activH=data.habits.filter(h=>!h.archived);
        const habPct=activH.length>0?Math.round(last7.reduce((s,d)=>s+activH.filter(h=>h.completions[d]).length,0)/(activH.length*7)*100):0;
        const ratings=last7.map(d=>data.dailyPerf[d]?.rating).filter(Boolean);
        const avgRating=ratings.length>0?(ratings.reduce((s,r)=>s+r,0)/ratings.length).toFixed(1):null;
        const maxH=Math.max(...dailyH.map(d=>d.h),1);
        const diff=totalH-prevH;
        return<div>
          <div className="g3" style={{marginBottom:12}}>
            <div style={{textAlign:'center',background:'var(--sur)',borderRadius:8,padding:'8px'}}><div style={{fontSize:20,fontWeight:700,color:'var(--acc)'}}>{totalH.toFixed(1)}h</div><div className="tx-dm">tổng giờ học</div>{prevH>0&&<div style={{fontSize:10,color:diff>=0?'var(--su)':'var(--cr)',marginTop:2}}>{diff>=0?'+':''}{diff.toFixed(1)}h vs tuần trước</div>}</div>
            <div style={{textAlign:'center',background:'var(--sur)',borderRadius:8,padding:'8px'}}><div style={{fontSize:20,fontWeight:700,color:'#1D9E75'}}>{habPct}%</div><div className="tx-dm">habits hoàn thành</div></div>
            <div style={{textAlign:'center',background:'var(--sur)',borderRadius:8,padding:'8px'}}><div style={{fontSize:20,fontWeight:700,color:'var(--go)'}}>{avgRating?`${avgRating}⭐`:'-'}</div><div className="tx-dm">đánh giá TB</div></div>
          </div>
          {/* Daily bar chart */}
          <div style={{display:'flex',gap:4,alignItems:'flex-end',height:70,marginBottom:4}}>
            {dailyH.map(({ds,h,d})=><div key={ds} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
              <div style={{fontSize:9,color:'var(--dm)',fontWeight:600}}>{h>0?h.toFixed(1):''}</div>
              <div style={{width:'100%',background:ds===TODAY?'var(--acc)':'var(--sur)',borderRadius:'3px 3px 0 0',height:`${Math.max(4,h/maxH*50)}px`,border:`1px solid ${ds===TODAY?'var(--acc3)':'var(--bdr)'}`,transition:'height .3s'}}/>
              <div style={{fontSize:9,color:ds===TODAY?'var(--acc)':'var(--dm)'}}>{d.getDate()}/{d.getMonth()+1}</div>
            </div>)}
          </div>
          <div style={{fontSize:10,color:'var(--dm)',textAlign:'center'}}>📊 Giờ học mỗi ngày trong tuần (cột xanh = hôm nay)</div>
        </div>;
      })()}
    </div>
  </div>;}

/* ── EVENTS MANAGEMENT PAGE ── */
function EventsPage({data,upd}){
  const [showAdd,setShowAdd]=useState(false);const [editEv,setEditEv]=useState(null);
  const TC={academic:'#7C6EF5',exam:'#E24B4A',language:'#FFD700',health:'#1D9E75',networking:'#4FA3FF',other:'#6B75A0'};
  const TL={academic:'Học thuật',exam:'Kỳ thi',language:'Ngôn ngữ',health:'Sức khỏe',networking:'Networking',other:'Khác'};
  const baseEvents=[...data.events].sort((a,b)=>a.date.localeCompare(b.date));
  const nonRecurring=baseEvents.filter(e=>!e.recurring);
  const recurring=baseEvents.filter(e=>e.recurring);
  const upcoming=getUpcomingEvts(data.events,45);
  const past=nonRecurring.filter(e=>e.date<TODAY);
  const delBase=(id)=>{const base=id.split('_')[0];upd({events:data.events.filter(x=>x.id!==base)});};
  const getBase=(e)=>data.events.find(x=>x.id===e.id.split('_')[0])||e;
  return<div>
    <div className="flex-sb" style={{marginBottom:4}}><div className="h1">🗓️ Tất cả Events</div><button className="btn-p btn-sm" onClick={()=>setShowAdd(true)}>+ Thêm</button></div>
    <p className="tx-mu" style={{marginBottom:14}}>Tất cả events, lịch thi và hoạt động. Cũng có thể thêm/sửa từ Calendar trên Dashboard.</p>
    {recurring.length>0&&<div className="card" style={{marginBottom:12}}>
      <div className="lbl" style={{marginBottom:8}}>🔄 LỊCH LẶP LẠI ({recurring.length})</div>
      {recurring.map(e=><div key={e.id} style={{display:'flex',gap:8,alignItems:'center',padding:'5px 0',borderBottom:'1px solid var(--bdr)'}}>
        <span style={{fontSize:15}}>{e.emoji}</span>
        <div style={{flex:1}}><div style={{fontSize:12,fontWeight:500}}>{e.title}</div>
          <div className="tx-dm">{e.recurringDow.map(d=>DV[d]).join(', ')} · đến {e.recurringEndDate?fmt(e.recurringEndDate):'hết học kỳ'}</div></div>
        <button onClick={()=>setEditEv(e)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:11,opacity:.5}}>✏️</button>
        <button onClick={()=>upd({events:data.events.filter(x=>x.id!==e.id)})} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:13,opacity:.4}}>×</button>
      </div>)}
    </div>}
    {upcoming.length>0&&<div><div className="lbl">SẮP TỚI — 45 NGÀY TỚI ({upcoming.length})</div>
      {upcoming.map(e=>{const d=daysTo(e.date);const isRec=e.id.includes('_');return<div key={e.id} className="ev-card" style={{background:'var(--card)',border:'1px solid var(--bdr)',borderRadius:10,padding:'10px',marginBottom:7,display:'flex',gap:9,alignItems:'flex-start'}}>
        <div style={{width:36,height:36,borderRadius:7,background:(TC[e.type]||'#7C6EF5')+'22',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0}}>{e.emoji}</div>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:500}}>{e.title}{isRec&&<span style={{fontSize:9,marginLeft:5,color:'var(--dm)'}}>🔄</span>}</div>
          <div className="tx-dm">{fmtL(e.date)}{e.time&&` · ${e.time}`}{e.note&&` — ${e.note}`}</div>
        </div>
        <div style={{textAlign:'right',flexShrink:0}}>
          <span style={{padding:'2px 6px',borderRadius:4,fontSize:9,fontWeight:600,background:(TC[e.type]||'#7C6EF5')+'22',color:TC[e.type]||'#7C6EF5'}}>{TL[e.type]}</span>
          <div style={{fontSize:11,color:d===0?'var(--cr)':d<=7?'var(--wa)':'var(--mu)',marginTop:3}}>{d===0?'Hôm nay!':`${d} ngày`}</div>
        </div>
        {!isRec&&<div style={{display:'flex',flexDirection:'column',gap:3}}>
          <button onClick={()=>setEditEv(getBase(e))} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:12,opacity:.5}}>✏️</button>
          <button onClick={()=>delBase(e.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:13,opacity:.4}}>×</button>
        </div>}
      </div>;})}
    </div>}
    {past.length>0&&<div style={{marginTop:12,opacity:.65}}><div className="lbl">ĐÃ QUA ({past.length})</div>
      {past.slice(-8).reverse().map(e=><div key={e.id} style={{display:'flex',gap:8,alignItems:'center',padding:'6px 0',borderBottom:'1px solid var(--bdr)'}}>
        <span style={{fontSize:14}}>{e.emoji}</span>
        <div style={{flex:1}}><div style={{fontSize:12,textDecoration:'line-through',color:'var(--mu)'}}>{e.title}</div><div className="tx-dm">{fmt(e.date)}</div></div>
        <button onClick={()=>setEditEv(e)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:11,opacity:.4}}>✏️</button>
        <button onClick={()=>upd({events:data.events.filter(x=>x.id!==e.id)})} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:13,opacity:.4}}>×</button>
      </div>)}
    </div>}
    {showAdd&&<AddEventModal onSave={e=>{upd({events:[...data.events,e]});setShowAdd(false);}} onClose={()=>setShowAdd(false)}/>}
    {editEv&&<AddEventModal existing={editEv} onSave={e=>{upd({events:data.events.map(x=>x.id===e.id?e:x)});setEditEv(null);}} onClose={()=>setEditEv(null)}/>}
  </div>;}

/* ── SETTINGS PAGE ── */
function SettingsPage({data,upd}){
  const s=data.settings||{theme:'purple',radius:'rounded'};
  const setS=(k,v)=>{const ns={...s,[k]:v};upd({settings:ns});applyTheme(ns);};
  return<div>
    <div className="h1">⚙️ Cài đặt</div>
    <p className="tx-mu" style={{marginBottom:18}}>Tuỳ chỉnh giao diện StudyOS theo phong cách của bạn.</p>
    <div className="card" style={{marginBottom:12}}>
      <div className="lbl" style={{marginBottom:10}}>🎨 GIAO DIỆN</div>
      <div style={{fontSize:10,color:'var(--mu)',fontWeight:700,letterSpacing:'.05em',marginBottom:6}}>🌙 DARK MODE</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
        {Object.entries(THEMES).filter(([k,t])=>t.mode!=='light').map(([k,t])=>{const active=s.theme===k;return<div key={k} onClick={()=>setS('theme',k)} style={{cursor:'pointer',border:`2px solid ${active?t['--acc']:'var(--bdr)'}`,borderRadius:10,padding:'10px 12px',background:active?t['--acc']+'22':'var(--sur)',transition:'all .15s'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
            <div style={{width:20,height:20,borderRadius:'50%',background:t['--acc'],flexShrink:0}}/>
            <span style={{fontSize:12,fontWeight:active?700:400,color:active?t['--acc']:'var(--tx)'}}>{t.emoji} {t.name}</span>
            {active&&<span style={{marginLeft:'auto',fontSize:10,color:t['--acc'],fontWeight:700}}>✓</span>}
          </div>
          <div style={{display:'flex',gap:3}}>
            {['--bg','--sur','--card','--acc'].map(v=><div key={v} style={{flex:1,height:8,borderRadius:2,background:t[v]}}/>)}
          </div>
        </div>;})}
      </div>
      <div style={{fontSize:10,color:'var(--mu)',fontWeight:700,letterSpacing:'.05em',marginBottom:6}}>☀️ LIGHT MODE</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
        {Object.entries(THEMES).filter(([k,t])=>t.mode==='light').map(([k,t])=>{const active=s.theme===k;return<div key={k} onClick={()=>setS('theme',k)} style={{cursor:'pointer',border:`2px solid ${active?t['--acc']:'var(--bdr)'}`,borderRadius:10,padding:'10px 12px',background:active?t['--acc']+'22':'var(--sur)',transition:'all .15s'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:5}}>
            <div style={{width:20,height:20,borderRadius:'50%',background:t['--acc'],flexShrink:0}}/>
            <span style={{fontSize:12,fontWeight:active?700:400,color:active?t['--acc']:'var(--tx)'}}>{t.emoji} {t.name}</span>
            {active&&<span style={{marginLeft:'auto',fontSize:10,color:t['--acc'],fontWeight:700}}>✓</span>}
          </div>
          <div style={{display:'flex',gap:3}}>
            {['--bg','--sur','--card','--acc'].map(v=><div key={v} style={{flex:1,height:8,borderRadius:2,background:t[v],border:v==='--card'?'1px solid #00000010':'none'}}/>)}
          </div>
        </div>;})}
      </div>
    </div>
    <div className="card" style={{marginBottom:12}}>
      <div className="lbl" style={{marginBottom:4}}>🧠 MASTERY ENGINE</div>
      <div className="tx-dm" style={{marginBottom:12,fontSize:10}}>Tinh chỉnh cách hệ thống tính % mastery và độ ưu tiên ôn tập. Đổi ở đây áp dụng ngay cho mọi môn học.</div>
      {(()=>{
        const ms={...DEFAULT_MASTERY_SETTINGS,...(data.masterySettings||{})};
        const setMs=(k,v)=>upd({masterySettings:{...ms,[k]:v}});
        const Row=({label,hint,k,min,max,step})=><div style={{marginBottom:12}}>
          <div className="flex-sb" style={{marginBottom:3}}>
            <span style={{fontSize:11,color:'var(--tx)'}}>{label}</span>
            <span style={{fontSize:11,color:'var(--acc)',fontWeight:700}}>{ms[k]}</span>
          </div>
          <input type="range" min={min} max={max} step={step} value={ms[k]} onChange={e=>setMs(k,parseFloat(e.target.value))} style={{width:'100%'}}/>
          {hint&&<div className="tx-dm" style={{fontSize:9,marginTop:2}}>{hint}</div>}
        </div>;
        return<div>
          <div style={{fontSize:10,color:'var(--mu)',fontWeight:700,letterSpacing:'.05em',marginBottom:8}}>CÔNG THỨC MASTERY (EMA)</div>
          <Row label="EMA Alpha — độ nhạy với lần đánh giá mới" hint="Cao hơn = phản ứng nhanh hơn với lần Ghi nhanh gần nhất; thấp hơn = mượt hơn, ít bị lệch bởi 1 lần tệ" k="emaAlpha" min={0.1} max={0.9} step={0.05}/>
          <Row label="Trọng số Understanding" hint="Understanding + Confidence phải cộng lại ≈ 1" k="understandingWeight" min={0} max={1} step={0.05}/>
          <Row label="Trọng số Confidence" k="confidenceWeight" min={0} max={1} step={0.05}/>
          <div style={{fontSize:10,color:'var(--mu)',fontWeight:700,letterSpacing:'.05em',margin:'14px 0 8px'}}>REVIEW PRIORITY</div>
          <Row label="Ngưỡng 'lâu chưa ôn' (ngày)" k="staleDays" min={3} max={30} step={1}/>
          <Row label="Ngưỡng 'thi sắp tới' (ngày)" k="examSoonDays" min={7} max={45} step={1}/>
          <Row label="Trọng số: mastery thấp" k="reviewW_mastery" min={0} max={1} step={0.05}/>
          <Row label="Trọng số: lâu chưa ôn" k="reviewW_staleness" min={0} max={1} step={0.05}/>
          <Row label="Trọng số: confidence thấp" k="reviewW_confidence" min={0} max={1} step={0.05}/>
          <Row label="Trọng số: thi sắp tới" k="reviewW_examUrgency" min={0} max={1} step={0.05}/>
          <button className="btn-g btn-sm" onClick={()=>upd({masterySettings:{...DEFAULT_MASTERY_SETTINGS}})}>↺ Reset về mặc định</button>
        </div>;
      })()}
    </div>
    <div className="card" style={{marginBottom:12}}>
      <div className="lbl" style={{marginBottom:10}}>🔘 BO GÓC (Border Radius)</div>
      <div style={{display:'flex',gap:8}}>
        {[['sharp','Vuông sắc','4px'],['rounded','Bo vừa','12px'],['pill','Bo nhiều','20px']].map(([k,label,px])=>{const active=s.radius===k;return<button key={k} onClick={()=>setS('radius',k)} style={{flex:1,padding:'10px',border:`2px solid ${active?'var(--acc)':'var(--bdr)'}`,borderRadius:active?k==='sharp'?4:k==='pill'?20:12:8,background:active?'var(--acc2)':'var(--sur)',cursor:'pointer',color:active?'var(--acc)':'var(--mu)',fontWeight:active?700:400,fontSize:12}}>
          <div style={{width:24,height:24,border:'2px solid currentColor',borderRadius:px,margin:'0 auto 5px'}}/>
          {label}
        </button>;})}
      </div>
    </div>
    <div className="card" style={{marginBottom:12}}>
      <div className="lbl" style={{marginBottom:10}}>✏️ FONT CHỮ</div>
      <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
        {[['system','System (Mặc định)'],['inter','Inter'],['outfit','Outfit'],['space','Space Grotesk'],['dm','DM Sans']].map(([k,label])=>{const active=(s.fontFamily||'system')===k;return<button key={k} onClick={()=>setS('fontFamily',k)} style={{padding:'7px 13px',borderRadius:8,border:`1.5px solid ${active?'var(--acc)':'var(--bdr)'}`,background:active?'var(--acc2)':'var(--sur)',color:active?'var(--acc)':'var(--mu)',cursor:'pointer',fontSize:12,fontFamily:FONTS[k],fontWeight:active?600:400,transition:'all .12s'}}>{label}</button>;})}
      </div>
    </div>
    <div className="card" style={{marginBottom:12}}>
      <div className="lbl" style={{marginBottom:8}}>👋 TÊN HIỂN THỊ</div>
      <input className="inp" value={s.userName||''} onChange={e=>setS('userName',e.target.value)} placeholder="Tên bạn (hiện ở màn hình Welcome)..."/>
      <div className="tx-dm" style={{marginTop:5,fontSize:10}}>Dùng khi chưa đăng nhập Google, hoặc muốn hiển thị tên khác trên màn hình chào.</div>
    </div>
    <div className="card" style={{marginBottom:12}}>
      <div className="lbl" style={{marginBottom:8}}>🖼️ BANNER DASHBOARD</div>
      <input className="inp" value={s.bannerUrl||''} onChange={e=>setS('bannerUrl',toDirectImageUrl(e.target.value))} placeholder="Dán URL hình ảnh hoặc link chia sẻ Google Drive..." style={{marginBottom:6}}/>
      <div className="tx-dm" style={{marginBottom:6,fontSize:10}}>💡 Ảnh này cũng được dùng làm nền cho màn hình "Welcome back" khi mở app.</div>
      <div style={{background:'var(--acc2)',border:'1px solid var(--acc3)',borderRadius:7,padding:'7px 9px',marginBottom:10,fontSize:10,color:'var(--mu)',lineHeight:1.6}}>
        💡 <strong style={{color:'var(--tx)'}}>Dùng ảnh từ Google Drive:</strong><br/>
        1. Chuột phải ảnh trên Drive → <strong>Chia sẻ</strong> → đổi thành <strong>"Bất kỳ ai có đường liên kết"</strong><br/>
        2. Copy link → dán thẳng vào ô trên — app <strong>tự động convert</strong> sang link ảnh trực tiếp
      </div>
      <div className="tx-dm" style={{marginBottom:8,fontSize:11}}>Hoặc chọn nhanh từ Unsplash:</div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:5,marginBottom:8}}>
        {[
          ['📚 Desk','https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=70'],
          ['📖 Books','https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&q=70'],
          ['☕ Coffee','https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=800&q=70'],
          ['🏔 Mountain','https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=70'],
          ['🌅 Sunset','https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=70'],
          ['🌆 City','https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&q=70'],
        ].map(([label,url])=><button key={label} onClick={()=>setS('bannerUrl',url)} style={{padding:'5px',borderRadius:7,border:`1.5px solid ${s.bannerUrl===url?'var(--acc)':'var(--bdr)'}`,background:'var(--sur)',cursor:'pointer',fontSize:11,color:s.bannerUrl===url?'var(--acc)':'var(--mu)',fontWeight:s.bannerUrl===url?600:400}}>{label}</button>)}
      </div>
      {s.bannerUrl&&<div>
        <div className="tx-dm" style={{marginBottom:5,fontSize:10}}>🎯 Kéo trên ảnh để chỉnh vị trí hiển thị (focal point):</div>
        <div style={{width:'100%',height:140,borderRadius:8,overflow:'hidden',border:'1px solid var(--bdr)',marginTop:2,position:'relative',background:'var(--sur)',cursor:'crosshair'}}
          onMouseDown={e=>{
            const box=e.currentTarget;
            const move=(ev)=>{
              const r=box.getBoundingClientRect();
              const x=Math.max(0,Math.min(100,Math.round((ev.clientX-r.left)/r.width*100)));
              const y=Math.max(0,Math.min(100,Math.round((ev.clientY-r.top)/r.height*100)));
              setS('bannerPosX',x);setS('bannerPosY',y);
            };
            move(e.nativeEvent);
            const up=()=>{window.removeEventListener('mousemove',move);window.removeEventListener('mouseup',up);};
            window.addEventListener('mousemove',move);window.addEventListener('mouseup',up);
          }}>
          <img src={s.bannerUrl} alt="preview" style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:`${s.bannerPosX??50}% ${s.bannerPosY??50}%`,pointerEvents:'none'}}
            onError={e=>{
              const fb=toDirectImageUrlFallback(s.bannerUrl);
              if(fb&&e.target.src!==fb){e.target.src=fb;return;}
              e.target.style.display='none';const w=e.target.parentElement.nextSibling;if(w)w.style.display='flex';
            }}/>
          <div style={{position:'absolute',left:`${s.bannerPosX??50}%`,top:`${s.bannerPosY??50}%`,width:16,height:16,borderRadius:'50%',border:'2.5px solid #fff',boxShadow:'0 0 0 1.5px rgba(0,0,0,.4), 0 2px 6px rgba(0,0,0,.4)',transform:'translate(-50%,-50%)',pointerEvents:'none'}}/>
        </div>
        <div style={{display:'flex',gap:8,marginTop:6}}>
          <button className="btn-g btn-sm" onClick={()=>{setS('bannerPosX',50);setS('bannerPosY',50);}}>↺ Về giữa</button>
          <span className="tx-dm" style={{alignSelf:'center'}}>X:{s.bannerPosX??50}% Y:{s.bannerPosY??50}%</span>
        </div>
      </div>}
      {s.bannerUrl&&<button className="btn-g btn-sm" style={{marginTop:6,color:'var(--cr)'}} onClick={()=>setS('bannerUrl','')}>Xoá banner</button>}
    </div>
    <div className="card" style={{marginBottom:12}}>
      <div className="lbl" style={{marginBottom:8}}>💾 DỮ LIỆU</div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        <button className="btn-g" onClick={()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`study101-backup-${TODAY}.json`;a.click();}}>⬇️ Xuất dữ liệu (JSON)</button>
        <button className="btn-g" style={{color:'var(--wa)'}} onClick={()=>{if(confirm('Reset tất cả cài đặt theme về mặc định?')){const ns={theme:'purple',radius:'rounded'};upd({settings:ns});applyTheme(ns);}}}>↺ Reset theme</button>
      </div>
      <div className="tx-dm" style={{marginTop:8}}>Data tự động sync qua Firebase. Xuất JSON để backup thủ công.</div>
    </div>
    <div className="card">
      <div className="lbl" style={{marginBottom:8}}>ℹ️ THÔNG TIN</div>
      <div style={{fontSize:12,color:'var(--mu)',lineHeight:1.7}}>
        Study101 · React 18 + Firebase<br/>
        Bochum, Đức 🇩🇪 · GSE Program<br/>
        <span style={{color:'var(--dm)',fontSize:10}}>Data lưu trên Firebase — sync real-time mọi thiết bị</span>
      </div>
    </div>
  </div>;}

function ParkingLotPage({data,upd}){
  const [tab,setTab]=useState('tasks');
  const [viewMode,setViewMode]=useState('list'); // 'list' | 'kanban'
  const [showAddTask,setShowAddTask]=useState(false);
  const [showAddNote,setShowAddNote]=useState(false);
  const [editTask,setEditTask]=useState(null);
  const [editNote,setEditNote]=useState(null);
  const [catFilter,setCatFilter]=useState('all');
  const [newCat,setNewCat]=useState('');const [showCatMgr,setShowCatMgr]=useState(false);
  const [showDone,setShowDone]=useState(false);
  // Form state at top level (fixes Rules of Hooks)
  const [taskForm,setTaskForm]=useState({text:'',category:'Khác',deadline:'',priority:'medium'});
  const [noteForm,setNoteForm]=useState({title:'',content:'',color:'#1A2038',noteType:'text',todos:[]});
  const tf=(k,v)=>setTaskForm(p=>({...p,[k]:v}));
  const nf=(k,v)=>setNoteForm(p=>({...p,[k]:v}));

  const tasks=data.parkingTasks||[];const notes=data.parkingNotes||[];const cats=data.parkingCategories||['Ý tưởng','Cần làm','Học tập','Khác'];
  const PRIORITY_META={high:{label:'Cao',color:'var(--cr)',order:0},medium:{label:'TB',color:'var(--wa)',order:1},low:{label:'Thấp',color:'var(--mu)',order:2}};
  // v13: status (todo/doing/done) — kept in sync with the older `done` boolean
  // so existing data (and the List view's checkbox) keeps working unchanged.
  // Migration-safe: tasks without a status yet fall back to done?'done':'todo'.
  const STATUS_META={todo:{label:'Chưa làm',color:'var(--mu)'},doing:{label:'Đang làm',color:'var(--in)'},done:{label:'Đã xong',color:'var(--su)'}};
  const statusOf=(t)=>t.status||(t.done?'done':'todo');
  const setStatus=(id,status)=>upd({parkingTasks:tasks.map(t=>t.id===id?{...t,status,done:status==='done'}:t)});
  const undone=tasks.filter(t=>!t.done).sort((a,b)=>(PRIORITY_META[a.priority||'medium'].order-PRIORITY_META[b.priority||'medium'].order));
  const done=tasks.filter(t=>t.done);
  const filtered=catFilter==='all'?undone:undone.filter(t=>t.category===catFilter);
  const addTask=()=>{if(!taskForm.text.trim())return;upd({parkingTasks:[{id:uid(),...taskForm,done:false,status:'todo',date:TODAY},...tasks]});setTaskForm({text:'',category:cats[0]||'Khác',deadline:'',priority:'medium'});setShowAddTask(false);};
  const updTask=(id,ch)=>upd({parkingTasks:tasks.map(t=>t.id===id?{...t,...ch}:t)});
  const delTask=id=>upd({parkingTasks:tasks.filter(t=>t.id!==id)});
  const addNote=()=>{upd({parkingNotes:[{id:uid(),...noteForm,date:TODAY},...notes]});setNoteForm({title:'',content:'',color:'#1A2038',noteType:'text',todos:[]});setShowAddNote(false);};
  const updNote=(id,ch)=>upd({parkingNotes:notes.map(n=>n.id===id?{...n,...ch}:n)});
  const delNote=id=>upd({parkingNotes:notes.filter(n=>n.id!==id)});
  const togNoteTodo=(noteId,i)=>{const note=notes.find(n=>n.id===noteId);if(!note)return;updNote(noteId,{todos:note.todos.map((t,j)=>j===i?{...t,done:!t.done}:t)});};
  const NOTE_COLORS=[['#1A2038','Indigo'],['#2A1F3D','Violet'],['#1A2F26','Emerald'],['#2F2214','Amber'],['#1A252F','Teal'],['#2F1A22','Rose']];

  return<div>
    <div className="flex-sb" style={{marginBottom:6}}>
      <div className="h1">🅿️ Parking Lot</div>
      {tab==='tasks'&&<button className="btn-p btn-sm" onClick={()=>{setTaskForm({text:'',category:cats[0]||'Khác',deadline:''});setShowAddTask(true);}}>+ Task</button>}
      {tab==='notes'&&<button className="btn-p btn-sm" onClick={()=>{setNoteForm({title:'',content:'',color:'#1A2038',noteType:'text',todos:[]});setShowAddNote(true);}}>+ Note</button>}
    </div>
    <p className="tx-mu" style={{marginBottom:12}}>Dump ý tưởng, task và ghi chú — não rảnh để tập trung học.</p>
    <div style={{display:'flex',gap:7,marginBottom:14}}>
      {[['tasks',`✅ Tasks (${undone.length})`],['notes',`📝 Notes (${notes.length})`]].map(([k,l])=>
        <button key={k} onClick={()=>setTab(k)} style={{padding:'7px 16px',borderRadius:8,border:`1.5px solid ${tab===k?'var(--acc)':'var(--bdr)'}`,background:tab===k?'var(--acc2)':'var(--sur)',color:tab===k?'var(--acc)':'var(--mu)',cursor:'pointer',fontSize:12,fontWeight:tab===k?700:400}}>{l}</button>)}
    </div>

    {tab==='tasks'&&<div>
      <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:10,alignItems:'center'}}>
        {['all',...cats].map(c=>{const n=c==='all'?undone.length:undone.filter(t=>t.category===c).length;return<button key={c} onClick={()=>setCatFilter(c)} style={{padding:'4px 10px',borderRadius:6,border:`1px solid ${catFilter===c?'var(--acc)':'var(--bdr)'}`,background:catFilter===c?'var(--acc2)':'transparent',color:catFilter===c?'var(--acc)':'var(--mu)',cursor:'pointer',fontSize:11}}>{c==='all'?'🗂 Tất cả':c} ({n})</button>;})}
        <button className="btn-g btn-sm" onClick={()=>setShowCatMgr(s=>!s)} title="Quản lý category">⚙️</button>
        <div style={{marginLeft:'auto',display:'flex',gap:4}}>
          <button onClick={()=>setViewMode('list')} title="Danh sách" style={{padding:'4px 9px',borderRadius:6,border:`1px solid ${viewMode==='list'?'var(--acc)':'var(--bdr)'}`,background:viewMode==='list'?'var(--acc2)':'transparent',color:viewMode==='list'?'var(--acc)':'var(--mu)',cursor:'pointer',fontSize:12}}>☰</button>
          <button onClick={()=>setViewMode('kanban')} title="Kanban" style={{padding:'4px 9px',borderRadius:6,border:`1px solid ${viewMode==='kanban'?'var(--acc)':'var(--bdr)'}`,background:viewMode==='kanban'?'var(--acc2)':'transparent',color:viewMode==='kanban'?'var(--acc)':'var(--mu)',cursor:'pointer',fontSize:12}}>▦</button>
        </div>
      </div>
      {showCatMgr&&<div className="card" style={{marginBottom:10}}>
        <div className="flex-sb" style={{marginBottom:8}}><div className="lbl" style={{margin:0}}>Quản lý Categories</div><button className="btn-g btn-sm" onClick={()=>setShowCatMgr(false)}>✕</button></div>
        <div style={{display:'flex',gap:5,flexWrap:'wrap',marginBottom:8}}>
          {cats.map(c=><div key={c} style={{display:'flex',alignItems:'center',gap:3,background:'var(--sur)',border:'1px solid var(--bdr)',borderRadius:6,padding:'3px 8px'}}>
            <span style={{fontSize:12}}>{c}</span>
            {!['Ý tưởng','Cần làm','Học tập','Khác'].includes(c)&&<button style={{background:'none',border:'none',cursor:'pointer',color:'var(--cr)',fontSize:11}} onClick={()=>upd({parkingCategories:cats.filter(x=>x!==c)})}>×</button>}
          </div>)}
        </div>
        <div style={{display:'flex',gap:5}}>
          <input className="inp" value={newCat} onChange={e=>setNewCat(e.target.value)} placeholder="Tên category mới..." style={{flex:1,fontSize:12}} onKeyDown={e=>{if(e.key==='Enter'&&newCat.trim()&&!cats.includes(newCat.trim())){upd({parkingCategories:[...cats,newCat.trim()]});setNewCat('');}}}/>
          <button className="btn-p btn-sm" onClick={()=>{if(newCat.trim()&&!cats.includes(newCat.trim())){upd({parkingCategories:[...cats,newCat.trim()]});setNewCat('');}}}> + </button>
        </div>
      </div>}
      {viewMode==='list'&&<>
      {filtered.length===0&&<div style={{textAlign:'center',padding:'24px 0',color:'var(--dm)'}}><div style={{fontSize:24,marginBottom:6}}>🎉</div><div style={{fontSize:12}}>Không có task nào trong category này</div></div>}
      {filtered.map(task=>{
        const dd=task.deadline?daysTo(task.deadline):null;
        if(editTask?.id===task.id)return<div key={task.id} className="card" style={{marginBottom:7}}>
          <div className="tx-dm" style={{marginBottom:3}}>Nội dung</div>
          <input className="inp" value={editTask.text} onChange={e=>setEditTask(p=>({...p,text:e.target.value}))} style={{marginBottom:6}} autoFocus/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginBottom:8}}>
            <div><div className="tx-dm" style={{marginBottom:2}}>Category</div>
              <select className="sel" value={editTask.category} onChange={e=>setEditTask(p=>({...p,category:e.target.value}))}>
                {cats.map(c=><option key={c} value={c}>{c}</option>)}
              </select></div>
            <div><div className="tx-dm" style={{marginBottom:2}}>Deadline</div>
              <input type="date" className="inp" value={editTask.deadline||''} onChange={e=>setEditTask(p=>({...p,deadline:e.target.value}))}/></div>
          </div>
          <div style={{marginBottom:8}}><div className="tx-dm" style={{marginBottom:2}}>Mức độ ưu tiên</div>
            <select className="sel" value={editTask.priority||'medium'} onChange={e=>setEditTask(p=>({...p,priority:e.target.value}))}>
              <option value="high">🔴 Cao</option><option value="medium">🟡 Trung bình</option><option value="low">⚪ Thấp</option>
            </select></div>
          <div style={{display:'flex',gap:5}}><button className="btn-p btn-sm" onClick={()=>{updTask(task.id,{text:editTask.text,category:editTask.category,deadline:editTask.deadline,priority:editTask.priority||'medium'});setEditTask(null);}}>Lưu</button><button className="btn-g btn-sm" onClick={()=>setEditTask(null)}>Huỷ</button></div>
        </div>;
        return<div key={task.id} className="ptask-row">
          <div style={{width:20,height:20,borderRadius:5,border:`1.5px solid ${task.done?'var(--su)':'var(--bdr)'}`,background:task.done?'var(--su)':'transparent',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}} onClick={()=>setStatus(task.id,task.done?'todo':'done')}>{task.done&&<span style={{color:'#fff',fontSize:10,fontWeight:700}}>✓</span>}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,textDecoration:task.done?'line-through':'none',opacity:task.done?.6:1,whiteSpace:'normal',wordBreak:'break-word'}}>{task.text}</div>
            <div style={{display:'flex',gap:5,marginTop:1,alignItems:'center',flexWrap:'wrap'}}>
              <span style={{fontSize:9,fontWeight:700,color:PRIORITY_META[task.priority||'medium'].color}}>● {PRIORITY_META[task.priority||'medium'].label}</span>
              <span style={{fontSize:9,background:'var(--acc2)',color:'var(--acc)',borderRadius:4,padding:'1px 5px'}}>{task.category}</span>
              {statusOf(task)==='doing'&&<span style={{fontSize:9,color:'var(--in)',fontWeight:700}}>● Đang làm</span>}
              {task.deadline&&<span style={{fontSize:9,color:dd<=0?'var(--cr)':dd<=3?'var(--wa)':'var(--dm)'}}>{dd<=0?'Quá hạn!':fmt(task.deadline)}</span>}
            </div>
          </div>
          <button onClick={()=>setEditTask({...task})} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:11,opacity:.4}}>✏️</button>
          <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:13,opacity:.35}} onClick={()=>delTask(task.id)}>×</button>
        </div>;})}
      {done.length>0&&<div style={{marginTop:10}}>
        <button className="btn-g btn-sm" onClick={()=>setShowDone(s=>!s)} style={{marginBottom:6}}>☑️ Đã xong ({done.length}) {showDone?'▲':'▼'}</button>
        {showDone&&done.map(task=><div key={task.id} className="ptask-row" style={{opacity:.55}}>
          <div style={{width:20,height:20,borderRadius:5,border:'1.5px solid var(--su)',background:'var(--su)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0}} onClick={()=>setStatus(task.id,'todo')}><span style={{color:'#fff',fontSize:10,fontWeight:700}}>✓</span></div>
          <span style={{flex:1,fontSize:12,textDecoration:'line-through'}}>{task.text}</span>
          <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--cr)',fontSize:13}} onClick={()=>delTask(task.id)}>×</button>
        </div>)}
      </div>}
      </>}

      {viewMode==='kanban'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8}}>
        {['todo','doing','done'].map(colStatus=>{
          const colTasks=tasks.filter(t=>statusOf(t)===colStatus&&(catFilter==='all'||t.category===catFilter));
          return<div key={colStatus} style={{background:'var(--sur)',borderRadius:8,padding:'8px',minHeight:80}}>
            <div style={{fontSize:10,fontWeight:700,color:STATUS_META[colStatus].color,marginBottom:8,textAlign:'center'}}>{STATUS_META[colStatus].label} ({colTasks.length})</div>
            {colTasks.map(task=>{const dd=task.deadline?daysTo(task.deadline):null;
              return<div key={task.id} className="card" style={{marginBottom:6,padding:'8px 9px'}}>
                <div style={{fontSize:11,marginBottom:4,wordBreak:'break-word'}}>{task.text}</div>
                <div style={{display:'flex',gap:4,marginBottom:5,flexWrap:'wrap'}}>
                  <span style={{fontSize:8,fontWeight:700,color:PRIORITY_META[task.priority||'medium'].color}}>● {PRIORITY_META[task.priority||'medium'].label}</span>
                  {task.deadline&&<span style={{fontSize:8,color:dd<=0?'var(--cr)':'var(--dm)'}}>{dd<=0?'Quá hạn!':fmt(task.deadline)}</span>}
                </div>
                <div style={{display:'flex',gap:3}}>
                  {colStatus!=='todo'&&<button onClick={()=>setStatus(task.id,colStatus==='done'?'doing':'todo')} title="Lùi lại" style={{flex:1,fontSize:10,padding:'3px',borderRadius:4,border:'1px solid var(--bdr)',background:'var(--card)',color:'var(--mu)',cursor:'pointer'}}>‹</button>}
                  <button onClick={()=>setEditTask({...task})} style={{fontSize:10,padding:'3px 6px',borderRadius:4,border:'1px solid var(--bdr)',background:'var(--card)',color:'var(--mu)',cursor:'pointer'}}>✏️</button>
                  {colStatus!=='done'&&<button onClick={()=>setStatus(task.id,colStatus==='todo'?'doing':'done')} title="Tiến lên" style={{flex:1,fontSize:10,padding:'3px',borderRadius:4,border:'1px solid var(--bdr)',background:'var(--card)',color:'var(--mu)',cursor:'pointer'}}>›</button>}
                </div>
              </div>;})}
            {colTasks.length===0&&<div style={{textAlign:'center',fontSize:10,color:'var(--dm)',padding:'10px 0'}}>—</div>}
          </div>;})}
      </div>}
    </div>}

    {tab==='notes'&&<div>
      {notes.length===0&&<div style={{textAlign:'center',padding:'30px 0'}}><div style={{fontSize:30,marginBottom:8}}>📝</div><div style={{fontSize:12,color:'var(--mu)'}}>Chưa có ghi chú nào</div><button className="btn-p btn-sm" style={{marginTop:10}} onClick={()=>setShowAddNote(true)}>+ Thêm ghi chú đầu tiên</button></div>}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
        {notes.map(note=>{
          const isEdit=editNote?.id===note.id;const bg=note.color||'#1A2038';
          if(isEdit)return<div key={note.id} className="note-card" style={{background:bg,gridColumn:'1/-1'}}>
            <div className="flex-sb" style={{marginBottom:8}}>
              <input value={editNote.title||''} onChange={e=>setEditNote(p=>({...p,title:e.target.value}))} placeholder="Tiêu đề..." style={{fontSize:13,fontWeight:600,background:'transparent',border:'none',borderBottom:'1px solid rgba(255,255,255,.2)',color:'#fff',padding:'2px 0',flex:1,outline:'none'}} autoFocus/>
              <button style={{background:'rgba(255,255,255,.15)',border:'none',cursor:'pointer',color:'#fff',fontSize:11,borderRadius:5,padding:'3px 8px',marginLeft:8,fontWeight:600}} onClick={()=>{updNote(note.id,editNote);setEditNote(null);}}>✓ Lưu</button>
            </div>
            <div style={{display:'flex',gap:4,marginBottom:8}}>
              {NOTE_COLORS.map(([c,l])=><div key={c} onClick={()=>setEditNote(p=>({...p,color:c}))} style={{width:22,height:22,borderRadius:'50%',background:c,border:`2.5px solid ${editNote.color===c?'#fff':'transparent'}`,cursor:'pointer'}} title={l}/>)}
            </div>
            <div style={{display:'flex',gap:5,marginBottom:8}}>
              {[['text','📄 Ghi chú'],['todos','☑️ Todo list']].map(([k,l])=><button key={k} onClick={()=>setEditNote(p=>({...p,noteType:k}))} style={{padding:'3px 9px',borderRadius:5,border:`1px solid ${editNote.noteType===k?'rgba(255,255,255,.5)':'rgba(255,255,255,.15)'}`,background:editNote.noteType===k?'rgba(255,255,255,.12)':'transparent',color:editNote.noteType===k?'#fff':'rgba(255,255,255,.45)',cursor:'pointer',fontSize:10}}>{l}</button>)}
            </div>
            {editNote.noteType==='todos'
              ?<div>{(editNote.todos||[]).map((td,i)=><div key={i} style={{display:'flex',gap:6,marginBottom:4,alignItems:'center'}}>
                  <div style={{width:14,height:14,borderRadius:3,border:'1.5px solid rgba(255,255,255,.4)',background:td.done?'rgba(255,255,255,.4)':'transparent',cursor:'pointer',flexShrink:0}} onClick={()=>setEditNote(p=>({...p,todos:p.todos.map((t,j)=>j===i?{...t,done:!t.done}:t)}))}/>
                  <input value={td.text} onChange={e=>setEditNote(p=>({...p,todos:p.todos.map((t,j)=>j===i?{...t,text:e.target.value}:t)}))} style={{flex:1,background:'transparent',border:'none',borderBottom:'1px solid rgba(255,255,255,.15)',color:'#fff',fontSize:12,padding:'2px 0',outline:'none',textDecoration:td.done?'line-through':'none',opacity:td.done?.6:1}}/>
                  <button onClick={()=>setEditNote(p=>({...p,todos:p.todos.filter((_,j)=>j!==i)}))} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',cursor:'pointer',fontSize:13}}>×</button>
                </div>)}
                <button onClick={()=>setEditNote(p=>({...p,todos:[...(p.todos||[]),{id:uid(),text:'',done:false}]}))} style={{background:'none',border:'none',color:'rgba(255,255,255,.5)',cursor:'pointer',fontSize:11,marginTop:4}}>+ Thêm item</button>
              </div>
              :<textarea value={editNote.content||''} onChange={e=>setEditNote(p=>({...p,content:e.target.value}))} placeholder="Nội dung ghi chú..." style={{width:'100%',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:6,color:'#fff',fontSize:12,padding:'7px',resize:'vertical',minHeight:80,boxSizing:'border-box',outline:'none'}}/>}
            <button onClick={()=>setEditNote(null)} style={{marginTop:8,background:'none',border:'none',color:'rgba(255,255,255,.4)',cursor:'pointer',fontSize:11}}>Đóng</button>
          </div>;
          return<div key={note.id} className="note-card" style={{background:bg,cursor:'pointer'}} onClick={()=>setEditNote({...note})}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:5}}>
              {note.title&&<div style={{fontSize:13,fontWeight:700,color:'#fff',flex:1,marginRight:4,lineHeight:1.3}}>{note.title}</div>}
              <button className="note-del" onClick={e=>{e.stopPropagation();delNote(note.id);}} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,.5)',fontSize:14,flexShrink:0,lineHeight:1}}>×</button>
            </div>
            {note.noteType==='todos'
              ?<div>{(note.todos||[]).slice(0,5).map((td,i)=><div key={i} style={{display:'flex',gap:5,alignItems:'center',marginBottom:3}}
                  onClick={e=>{e.stopPropagation();togNoteTodo(note.id,i);}}>
                  <div style={{width:12,height:12,borderRadius:3,border:'1.5px solid rgba(255,255,255,.35)',background:td.done?'rgba(255,255,255,.35)':'transparent',flexShrink:0}}/>
                  <span style={{fontSize:11,color:td.done?'rgba(255,255,255,.4)':'rgba(255,255,255,.8)',textDecoration:td.done?'line-through':'none'}}>{td.text}</span>
                </div>)}
                {(note.todos||[]).length>5&&<div style={{fontSize:10,color:'rgba(255,255,255,.35)',marginTop:2}}>+{note.todos.length-5} items nữa…</div>}
              </div>
              :<div style={{fontSize:12,color:'rgba(255,255,255,.75)',lineHeight:1.5,whiteSpace:'pre-wrap',overflow:'hidden',display:'-webkit-box',WebkitLineClamp:5,WebkitBoxOrient:'vertical'}}>{note.content}</div>}
            <div style={{fontSize:9,color:'rgba(255,255,255,.28)',marginTop:7}}>{fmt(note.date)}</div>
          </div>;})}
      </div>
    </div>}

    {/* Add Task Modal */}
    {showAddTask&&<div className="ov" onClick={()=>setShowAddTask(false)}><div className="modal" style={{maxWidth:380}} onClick={e=>e.stopPropagation()}>
      <div className="flex-sb" style={{marginBottom:12}}><span style={{fontSize:14,fontWeight:500}}>+ Task mới</span><button className="btn-g btn-sm" onClick={()=>setShowAddTask(false)}>✕</button></div>
      <input className="inp" value={taskForm.text} onChange={e=>tf('text',e.target.value)} placeholder="Nội dung task..." style={{marginBottom:8}} autoFocus onKeyDown={e=>e.key==='Enter'&&addTask()}/>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:8}}>
        <div><div className="tx-dm" style={{marginBottom:2}}>Category</div>
          <select className="sel" value={taskForm.category} onChange={e=>tf('category',e.target.value)}>
            {cats.map(c=><option key={c} value={c}>{c}</option>)}
          </select></div>
        <div><div className="tx-dm" style={{marginBottom:2}}>Deadline</div>
          <input type="date" className="inp" value={taskForm.deadline} onChange={e=>tf('deadline',e.target.value)}/></div>
      </div>
      <div style={{marginBottom:14}}><div className="tx-dm" style={{marginBottom:2}}>Mức độ ưu tiên</div>
        <select className="sel" value={taskForm.priority||'medium'} onChange={e=>tf('priority',e.target.value)}>
          <option value="high">🔴 Cao</option><option value="medium">🟡 Trung bình</option><option value="low">⚪ Thấp</option>
        </select></div>
      <div style={{display:'flex',gap:8}}><button className="btn-p" style={{flex:1,justifyContent:'center'}} onClick={addTask}>Thêm</button><button className="btn-g" onClick={()=>setShowAddTask(false)}>Huỷ</button></div>
    </div></div>}

    {/* Add Note Modal */}
    {showAddNote&&<div className="ov" onClick={()=>setShowAddNote(false)}><div className="modal" style={{maxWidth:380,background:'#151C32',border:'1px solid rgba(255,255,255,.1)'}} onClick={e=>e.stopPropagation()}>
      <div className="flex-sb" style={{marginBottom:10}}><span style={{fontSize:14,fontWeight:500,color:'#fff'}}>📝 Ghi chú mới</span><button onClick={()=>setShowAddNote(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,.5)',cursor:'pointer',fontSize:18,lineHeight:1}}>✕</button></div>
      <input className="inp" value={noteForm.title} onChange={e=>nf('title',e.target.value)} placeholder="Tiêu đề (tùy chọn)..." style={{marginBottom:8,background:'rgba(255,255,255,.06)',borderColor:'rgba(255,255,255,.15)',color:'#fff'}} autoFocus/>
      <div style={{display:'flex',gap:4,marginBottom:8}}>
        {NOTE_COLORS.map(([c,l])=><div key={c} onClick={()=>nf('color',c)} style={{width:22,height:22,borderRadius:'50%',background:c,border:`2.5px solid ${noteForm.color===c?'#fff':'transparent'}`,cursor:'pointer'}} title={l}/>)}
      </div>
      <div style={{display:'flex',gap:5,marginBottom:8}}>
        {[['text','📄 Ghi chú'],['todos','☑️ Todo list']].map(([k,l])=><button key={k} onClick={()=>nf('noteType',k)} style={{padding:'4px 10px',borderRadius:6,border:`1px solid ${noteForm.noteType===k?'rgba(255,255,255,.5)':'rgba(255,255,255,.15)'}`,background:noteForm.noteType===k?'rgba(255,255,255,.1)':'transparent',color:noteForm.noteType===k?'#fff':'rgba(255,255,255,.4)',cursor:'pointer',fontSize:11}}>{l}</button>)}
      </div>
      {noteForm.noteType==='todos'
        ?<div style={{marginBottom:10}}>
          {noteForm.todos.map((td,i)=><div key={td.id||i} style={{display:'flex',gap:5,marginBottom:4,alignItems:'center'}}>
            <div style={{width:14,height:14,borderRadius:3,border:'1.5px solid rgba(255,255,255,.4)',background:'transparent',flexShrink:0}}/>
            <input value={td.text} onChange={e=>nf('todos',noteForm.todos.map((t,j)=>j===i?{...t,text:e.target.value}:t))} placeholder={`Item ${i+1}...`}
              style={{flex:1,background:'transparent',border:'none',borderBottom:'1px solid rgba(255,255,255,.15)',color:'#fff',fontSize:12,padding:'2px 0',outline:'none'}} autoFocus={i===noteForm.todos.length-1&&noteForm.todos.length>0}/>
            <button onClick={()=>nf('todos',noteForm.todos.filter((_,j)=>j!==i))} style={{background:'none',border:'none',color:'rgba(255,255,255,.4)',cursor:'pointer',fontSize:13}}>×</button>
          </div>)}
          <button onClick={()=>nf('todos',[...noteForm.todos,{id:uid(),text:'',done:false}])} style={{background:'none',border:'none',color:'rgba(255,255,255,.5)',cursor:'pointer',fontSize:11,marginTop:2}}>+ Thêm item</button>
        </div>
        :<textarea value={noteForm.content} onChange={e=>nf('content',e.target.value)} placeholder="Viết ghi chú..." style={{width:'100%',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:6,color:'#fff',fontSize:12,padding:'8px',resize:'vertical',minHeight:90,marginBottom:10,boxSizing:'border-box',outline:'none'}}/>}
      <div style={{display:'flex',gap:8,marginTop:4}}>
        <button style={{flex:1,padding:'9px',borderRadius:8,background:'var(--acc)',color:'#fff',border:'none',cursor:'pointer',fontSize:13,fontWeight:600}} onClick={addNote}>Lưu ghi chú</button>
        <button style={{padding:'9px 14px',borderRadius:8,background:'rgba(255,255,255,.08)',color:'rgba(255,255,255,.6)',border:'1px solid rgba(255,255,255,.15)',cursor:'pointer'}} onClick={()=>setShowAddNote(false)}>Huỷ</button>
      </div>
    </div></div>}
  </div>;}

/* ── V10: STUDY JOURNAL ── */
/* ── V10b: STUDY JOURNAL — 2-col blocks, embedded timer, weekly hours ── */
/* ══════════════════════════════════════════════════════════════
   Study Journal — V12.1 rebuild: reads data.journalEntries (Session
   Instances), NOT the old ad-hoc plan-items journal. "Start Study" is
   available here too (per user's decision) — reuses the same
   CurrentSessionCard/SessionEditorModal/useSessionTimer components as
   Course Detail, so state (persisted via session.activeStartedAt) stays
   consistent no matter where you started or navigate to.
   ══════════════════════════════════════════════════════════════ */
/* ── Friction Log review — collapsed by default (supplementary, not part of
   the core daily flow), only renders once there's at least 1 entry so it
   never adds empty clutter to a page someone opens every day. ── */
function FrictionLogWidget({data,upd}){
  const [open,setOpen]=useState(false);
  const log=(data.frictionLog||[]).slice().sort((a,b)=>b.timestamp-a.timestamp);
  if(log.length===0)return null;
  const recent=log.slice(0,8);
  const del=(id)=>upd({frictionLog:(data.frictionLog||[]).filter(e=>e.id!==id)});
  const last7=log.filter(e=>daysTo(e.date)>=-7);
  const tagCounts={};
  last7.forEach(e=>(e.tags||[]).forEach(t=>tagCounts[t]=(tagCounts[t]||0)+1));
  const topTag=Object.entries(tagCounts).sort((a,b)=>b[1]-a[1])[0];
  return<div className="card" style={{marginBottom:14}}>
    <div className="flex-sb" style={{marginBottom:open?8:0,cursor:'pointer'}} onClick={()=>setOpen(o=>!o)}>
      <div style={{display:'flex',alignItems:'center',gap:6}}>
        <span style={{fontSize:10,color:'var(--dm)'}}>{open?'▼':'▶'}</span>
        <span className="lbl" style={{margin:0}}>🚧 FRICTION LOG</span>
        <span className="tx-dm">({log.length} lần ghi)</span>
      </div>
      {topTag&&<span style={{fontSize:10,color:'var(--wa)'}}>7 ngày qua: {topTag[0]} ×{topTag[1]}</span>}
    </div>
    {open&&<div>
      {recent.map(e=><div key={e.id} style={{padding:'6px 0',borderBottom:'1px solid var(--bdr)'}}>
        <div className="flex-sb">
          <div style={{display:'flex',flexWrap:'wrap',gap:4}}>{(e.tags||[]).map(t=><span key={t} style={{fontSize:10,background:'var(--wab)',color:'var(--wa)',borderRadius:5,padding:'1px 6px'}}>{t}</span>)}</div>
          <button onClick={()=>del(e.id)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:12,opacity:.35}}>×</button>
        </div>
        {e.note&&<div style={{fontSize:11,color:'var(--mu)',marginTop:3}}>{e.note}</div>}
        <div className="tx-dm" style={{marginTop:2}}>{fmtL(e.date)}</div>
      </div>)}
    </div>}
  </div>;}

function StudyJournalPage({data,upd,awardXP}){
  const courses=data.courses.filter(c=>!c.archived);
  const [pickedCourseId,setPickedCourseId]=useState(courses[0]?.id||'');
  const journalEntries=data.journalEntries||[];
  const [editSession,setEditSession]=useState(null); // {course, session}
  const [editEntry,setEditEntry]=useState(null); // journal entry being manually edited
  const delEntry=(entry)=>{if(confirm('Xoá Journal Entry này?'))upd({journalEntries:(data.journalEntries||[]).filter(j=>j.id!==entry.id)});};
  const saveEditedEntry=(updatedEntry)=>{
    upd({journalEntries:(data.journalEntries||[]).map(j=>j.id===updatedEntry.id?updatedEntry:j)});
    // Keep the underlying Concept.touches in sync with any edited understanding/confidence
    // (matched by sessionId, since that's the link between a touch and the session that logged it).
    const course=data.courses.find(c=>c.id===updatedEntry.courseId);
    if(course){
      const concepts=(course.concepts||[]).map(c=>{
        const editedTouch=updatedEntry.conceptTouches.find(t=>t.conceptId===c.id);
        if(!editedTouch)return c;
        const touches=(c.touches||[]).map(t=>t.sessionId===updatedEntry.sessionId?{...t,understanding:editedTouch.understanding,confidence:editedTouch.confidence}:t);
        return{...c,touches};
      });
      updCourse(course.id,{concepts});
    }
    setEditEntry(null);
  };

  // If ANY course has an in-progress session, surface it first regardless of picker
  // (so finishing a session you started elsewhere is always one click away here).
  // Prefer the truly-running one (activeStartedAt set) over one merely
  // status='in_progress' but paused — see the same fix in 08/12.
  let globalInProgress=null;
  for(const c of courses){
    const s=(c.sessions||[]).find(x=>x.status==='in_progress'&&x.activeStartedAt)||(c.sessions||[]).find(x=>x.status==='in_progress');
    if(s){globalInProgress={course:c,session:s};break;}
  }

  const pickedCourse=courses.find(c=>c.id===pickedCourseId);
  const updCourse=(courseId,ch)=>upd({courses:data.courses.map(c=>c.id===courseId?{...c,...ch}:c)});
  const delSessionFrom=(course,session)=>{
    if(!confirm('Xoá Session này? Journal Entry liên quan (nếu có) cũng sẽ bị xoá.'))return;
    updCourse(course.id,{sessions:(course.sessions||[]).filter(s=>s.id!==session.id)});
    upd({journalEntries:(data.journalEntries||[]).filter(j=>j.sessionId!==session.id)});
  };
  const saveEditedSession=(f)=>{
    const{course}=editSession;
    updCourse(course.id,{sessions:(course.sessions||[]).map(s=>s.id===f.id?f:s)});
    setEditSession(null);
  };

  const pickedSessions=pickedCourse?.sessions||[];
  const pickedPlanned=pickedSessions.filter(s=>s.status==='planned').sort((a,b)=>(a.createdAt||0)-(b.createdAt||0));
  const pickedCurrent=pickedSessions.find(s=>s.status==='in_progress'&&s.activeStartedAt)||pickedSessions.find(s=>s.status==='in_progress')||pickedPlanned[0]||null;

  // History grouped by course, most recent first
  const grouped={};journalEntries.filter(j=>j.status==='completed').forEach(j=>{if(!grouped[j.courseId])grouped[j.courseId]=[];grouped[j.courseId].push(j);});
  Object.keys(grouped).forEach(k=>grouped[k].sort((a,b)=>b.date.localeCompare(a.date)));
  const wd=weekDates();
  const weekMinutesByCourse={};
  journalEntries.filter(j=>j.status==='completed'&&wd.includes(j.date)).forEach(j=>{weekMinutesByCourse[j.courseId]=(weekMinutesByCourse[j.courseId]||0)+(j.duration||0);});

  const sessionTitle=(courseId,sessionId)=>{const c=data.courses.find(x=>x.id===courseId);const s=(c?.sessions||[]).find(x=>x.id===sessionId);return s?.title||'(session đã xoá)';};

  return<div>
    <div className="h1" style={{marginBottom:4}}>📓 Nhật ký học</div>
    <p className="tx-mu" style={{marginBottom:14}}>Mỗi buổi học là 1 Journal Entry, gắn với 1 Session cụ thể. Analytics đọc từ đây, không đọc % thủ công.</p>

    <FrictionLogWidget data={data} upd={upd}/>

    {globalInProgress&&<div style={{marginBottom:14}}>
      <div className="lbl" style={{marginBottom:6}}>▶️ ĐANG HỌC ({globalInProgress.course.emoji} {globalInProgress.course.name})</div>
      <CurrentSessionCard course={globalInProgress.course} session={globalInProgress.session} journalEntries={journalEntries}
        onUpdateCourse={ch=>updCourse(globalInProgress.course.id,ch)} upd={upd} data={data} awardXP={awardXP}
        onEdit={()=>setEditSession({course:globalInProgress.course,session:globalInProgress.session})} onDelete={()=>delSessionFrom(globalInProgress.course,globalInProgress.session)}/>
    </div>}

    {!globalInProgress&&<div style={{marginBottom:14}}>
      <div className="lbl" style={{marginBottom:6}}>▶️ BẮT ĐẦU HỌC</div>
      <div className="card" style={{marginBottom:8}}>
        <div className="tx-dm" style={{marginBottom:6}}>Chọn môn học</div>
        <select className="sel" value={pickedCourseId} onChange={e=>setPickedCourseId(e.target.value)} style={{marginBottom:0}}>
          {courses.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
        </select>
      </div>
      {pickedCourse&&(pickedCurrent
        ?<CurrentSessionCard course={pickedCourse} session={pickedCurrent} journalEntries={journalEntries}
            onUpdateCourse={ch=>updCourse(pickedCourse.id,ch)} upd={upd} data={data} awardXP={awardXP}
            onEdit={()=>setEditSession({course:pickedCourse,session:pickedCurrent})} onDelete={()=>delSessionFrom(pickedCourse,pickedCurrent)}/>
        :<div className="card" style={{textAlign:'center',padding:16}}>
            <div className="tx-dm">Môn này chưa có Session nào đang chờ học.</div>
            <div className="tx-dm" style={{marginTop:4}}>Vào trang <strong style={{color:'var(--tx)'}}>Môn học → {pickedCourse.name}</strong> để tạo Session mới.</div>
          </div>)}
    </div>}

    <div className="lbl" style={{marginBottom:8}}>📚 LỊCH SỬ</div>
    {Object.keys(grouped).length===0&&<div style={{textAlign:'center',padding:'24px 0',color:'var(--dm)'}}><div style={{fontSize:28,marginBottom:8}}>📓</div>Chưa có buổi học nào hoàn thành.</div>}
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
      {courses.filter(c=>grouped[c.id]).map(c=>{
        const entries=grouped[c.id];const weekMin=weekMinutesByCourse[c.id]||0;
        return<div key={c.id} style={{background:'var(--card)',border:'1px solid var(--bdr)',borderRadius:11,overflow:'hidden'}}>
          <div style={{background:c.color+'18',borderBottom:'1px solid var(--bdr)',padding:'9px 12px',display:'flex',alignItems:'center',gap:7}}>
            <span style={{fontSize:16}}>{c.emoji}</span>
            <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700}}>{c.name}</div><div className="tx-dm">{entries.length} buổi</div></div>
            {weekMin>0&&<div style={{textAlign:'right'}}><div style={{fontSize:15,fontWeight:800,color:c.color,lineHeight:1}}>{(weekMin/60).toFixed(1)}h</div><div style={{fontSize:8,color:'var(--dm)',fontWeight:600}}>TUẦN NÀY</div></div>}
          </div>
          <div style={{padding:'8px',maxHeight:340,overflowY:'auto'}}>
            {entries.map(j=><div key={j.id} style={{marginBottom:8,paddingBottom:8,borderBottom:'1px solid var(--bdr)'}}>
              <div className="flex-sb" style={{marginBottom:3}}>
                <span style={{fontSize:11,fontWeight:600}}>{sessionTitle(j.courseId,j.sessionId)}</span>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span className="tx-dm">{fmt(j.date)}</span>
                  <button onClick={()=>setEditEntry(j)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:10,opacity:.5}}>✏️</button>
                  <button onClick={()=>delEntry(j)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--dm)',fontSize:12,opacity:.4}}>×</button>
                </div>
              </div>
              <div style={{display:'flex',gap:8,fontSize:9,color:'var(--mu)',marginBottom:4}}>
                {j.duration>0&&<span>⏱️ {j.duration}p</span>}
                {j.difficulty>0&&<span>💪 Độ khó {j.difficulty}/5</span>}
                {j.confidenceAfter>0&&<span>⭐ Confidence {j.confidenceAfter}/5</span>}
                {j.conceptTouches?.length>0&&<span>📚 {j.conceptTouches.length} concept</span>}
              </div>
              {j.reflection&&<div style={{fontSize:11,color:'var(--tx)',lineHeight:1.4,marginBottom:3}}>{j.reflection}</div>}
              {j.questionsRaised&&<div style={{fontSize:10,color:'var(--wa)',marginBottom:3}}>❓ {j.questionsRaised}</div>}
              {j.actionItems?.length>0&&<div style={{fontSize:10,color:'var(--mu)'}}>✅ {j.actionItems.length} action item{j.actionItems.length>1?'s':''}</div>}
            </div>)}
          </div>
        </div>;})}
    </div>

    {editSession&&<SessionEditorModal session={editSession.session} concepts={editSession.course.concepts||[]} objectiveLibrary={editSession.course.objectiveLibrary||[]} onUpdateLibrary={(lib)=>updCourse(editSession.course.id,{objectiveLibrary:lib})} onSave={saveEditedSession} onClose={()=>setEditSession(null)}/>}
    {editEntry&&<EditJournalEntryModal entry={editEntry} concepts={(data.courses.find(c=>c.id===editEntry.courseId)?.concepts)||[]} onSave={saveEditedEntry} onClose={()=>setEditEntry(null)}/>}
  </div>;}
