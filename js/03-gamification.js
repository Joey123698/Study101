/* ══════════════════════════════════════════════════════════════
   03-gamification.js — XP, Levels, Achievements, popup toasts
   ══════════════════════════════════════════════════════════════ */
const LEVELS=[{min:0,max:200,level:1,name:'Newbie',emoji:'🌱'},{min:200,max:500,level:2,name:'Student',emoji:'📖'},{min:500,max:1000,level:3,name:'Scholar',emoji:'🎓'},{min:1000,max:2000,level:4,name:'Analyst',emoji:'📊'},{min:2000,max:3500,level:5,name:'Expert',emoji:'⚡'},{min:3500,max:6000,level:6,name:'Master',emoji:'🏆'},{min:6000,max:99999,level:7,name:'Legend',emoji:'👑'}];
function getLevel(xp){return LEVELS.find(l=>xp>=l.min&&xp<l.max)||LEVELS[0];}
const ACH=[{id:'first_log',emoji:'📝',name:'First Log',desc:'Log buổi học đầu tiên'},{id:'streak3',emoji:'🔥',name:'On Fire',desc:'Habits 3 ngày liên tục'},{id:'mastery_first',emoji:'🧠',name:'First Mastery',desc:'Đạt Mastered cho 1 Concept đầu tiên'},{id:'exam_ready',emoji:'🎯',name:'Exam Ready',desc:'Tất cả Concept của môn thi đạt Mastered'}];
const XPR={habit:10,hour:15,concept_eval:15,task:5,focus:10,session_complete:20};
const RISK={critical:{label:'KHẨN CẤP',cls:'risk-cr',c:'#E24B4A'},watch:{label:'CHÚ Ý',cls:'risk-wa',c:'#BA7517'},medium:{label:'TB',cls:'risk-in',c:'#378ADD'},good:{label:'ỔN',cls:'risk-su',c:'#1D9E75'}};
const PAL=['#7C6EF5','#E24B4A','#BA7517','#378ADD','#1D9E75','#D4537E','#26C6DA','#F5A623'];
function showXpPop(n){const el=document.createElement('div');el.className='xp-pop';el.textContent=`+${n} XP`;document.body.appendChild(el);setTimeout(()=>{if(el.parentNode)el.parentNode.removeChild(el);},2000);}
function showAch(a){const el=document.createElement('div');el.className='ach-pop';el.innerHTML=`<div style="font-size:10px;opacity:.8;margin-bottom:3px">🏆 THÀNH TÍCH MỚI!</div><div style="font-size:17px;margin-bottom:3px">${a.emoji} ${a.name}</div><div style="font-size:11px;opacity:.8">${a.desc}</div>`;document.body.appendChild(el);setTimeout(()=>{if(el.parentNode)el.parentNode.removeChild(el);},4000);}
