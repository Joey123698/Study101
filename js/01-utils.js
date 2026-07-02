/* ══════════════════════════════════════════════════════════════
   01-utils.js — React hook aliases, date/format helpers, misc utils
   ══════════════════════════════════════════════════════════════ */
const {useState,useEffect,useRef,useMemo,useCallback}=React;

/* ── V10c FIX: toISOString() converts to UTC, causing date misalignment in
   non-UTC timezones (e.g. Germany UTC+1/+2: at 00:00-02:00 local time, UTC
   date is still yesterday). This helper uses LOCAL date components instead. ── */
function toLocalDateStr(d){const y=d.getFullYear();const m=String(d.getMonth()+1).padStart(2,'0');const day=String(d.getDate()).padStart(2,'0');return `${y}-${m}-${day}`;}
const T=()=>toLocalDateStr(new Date());
const TODAY=T();

/* ── V11e: Translate Firebase Auth error codes into actionable Vietnamese messages ── */
function authErrMsg(e){
  const c=e?.code||'';
  const M={
    'auth/unauthorized-domain':'⚠️ Domain hiện tại chưa được Firebase cho phép đăng nhập. Vào Firebase Console → Authentication → Settings → Authorized domains → thêm domain đang chạy app này.',
    'auth/popup-blocked':'Trình duyệt đã chặn popup đăng nhập. Hãy cho phép popup cho trang này rồi thử lại.',
    'auth/popup-closed-by-user':'Popup đăng nhập đã bị đóng trước khi hoàn tất. Thử lại nhé.',
    'auth/cancelled-popup-request':'', // silent — happens when user double-clicks, no need to show
    'auth/network-request-failed':'Lỗi mạng — kiểm tra kết nối internet rồi thử lại.',
    'auth/email-already-in-use':'Email này đã được đăng ký. Thử đăng nhập thay vì đăng ký.',
    'auth/invalid-email':'Email không hợp lệ.',
    'auth/weak-password':'Mật khẩu quá yếu — cần ít nhất 6 ký tự.',
    'auth/user-not-found':'Không tìm thấy tài khoản với email này.',
    'auth/wrong-password':'Sai mật khẩu.',
    'auth/invalid-credential':'Email hoặc mật khẩu không đúng.',
    'auth/too-many-requests':'Thử sai quá nhiều lần — đợi một lát rồi thử lại.',
  };
  if(c in M)return M[c];
  return e?.message||'Có lỗi xảy ra, thử lại nhé.';
}

function daysTo(ds){if(!ds)return null;return Math.ceil((new Date(ds)-new Date())/86400000);}
function fmt(ds){if(!ds)return'';return new Date(ds).toLocaleDateString('vi-VN',{day:'numeric',month:'short'});}
function fmtL(ds){if(!ds)return'';return new Date(ds).toLocaleDateString('vi-VN',{weekday:'short',day:'numeric',month:'long'});}
function pct(a){if(!a?.length)return 0;return Math.round(a.filter(t=>t.done).length/a.length*100);}
function uid(){return'i'+Date.now()+Math.random().toString(36).slice(2,5);}
function weekDates(){const d=new Date();d.setHours(0,0,0,0);const dow=d.getDay();const m=new Date(d);m.setDate(d.getDate()-(dow===0?6:dow-1));return Array.from({length:7},(_,i)=>{const dd=new Date(m);dd.setDate(m.getDate()+i);return toLocalDateStr(dd);});}
function hStreak(comp){const d=new Date();let s=0;while(true){const k=toLocalDateStr(d);if(!comp[k])break;s++;d.setDate(d.getDate()-1);}return s;}
function fmtS(s){const h=Math.floor(s/3600);const m=Math.floor((s%3600)/60);const ss=s%60;return h>0?`${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`:`${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}`;}
const DV=['CN','T2','T3','T4','T5','T6','T7'];
const MV=['Tháng 1','Tháng 2','Tháng 3','Tháng 4','Tháng 5','Tháng 6','Tháng 7','Tháng 8','Tháng 9','Tháng 10','Tháng 11','Tháng 12'];

/* ── V11c: Auto-convert Google Drive share links to direct-viewable image URLs ──
   Drive share links (drive.google.com/file/d/ID/view) are HTML preview pages,
   not raw images — browsers can't render them in <img src>. This extracts the
   file ID and rewrites to Drive's official thumbnail endpoint, which is the most
   reliable method for public hotlinking. ── */
function extractDriveId(url){
  if(!url)return null;
  let m=url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);if(m)return m[1];
  m=url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);if(m)return m[1];
  m=url.match(/drive\.google\.com\/uc\?.*[?&]id=([a-zA-Z0-9_-]+)/);if(m)return m[1];
  m=url.match(/[?&]id=([a-zA-Z0-9_-]+)/);if(m)return m[1];
  return null;
}
function toDirectImageUrl(url){
  if(!url)return url;
  const id=extractDriveId(url.trim());
  if(!id)return url.trim();
  return `https://drive.google.com/thumbnail?id=${id}&sz=w1200`;
}
function toDirectImageUrlFallback(url){
  const id=extractDriveId(url||'');
  if(!id)return null;
  return `https://lh3.googleusercontent.com/d/${id}=w1200`;
}
