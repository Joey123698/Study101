/* ══════════════════════════════════════════════════════════════
   05-firebase.js — Firebase config + local storage fallback
   ══════════════════════════════════════════════════════════════ */
const FIREBASE_CONFIG={apiKey:"AIzaSyBadw-wBK7V6Nesos-s8xyg9xgZ54NmExM",authDomain:"studyos-7a45b.firebaseapp.com",projectId:"studyos-7a45b",storageBucket:"studyos-7a45b.firebasestorage.app",messagingSenderId:"578987032139",appId:"1:578987032139:web:85666d9b00f889e40517ce"};
let _db=null,_auth=null;
const FB_ON=FIREBASE_CONFIG.apiKey!=="YOUR_API_KEY_HERE";
if(FB_ON){try{firebase.initializeApp(FIREBASE_CONFIG);_db=firebase.firestore();_auth=firebase.auth();_db.enablePersistence({synchronizeTabs:true}).catch(()=>{});}catch(e){console.warn(e);}}

// --- local storage helpers ---
const SK='studyos-v12'; // bumped: v12 data model (Concept/Mastery) is structurally incompatible with pre-v12 saves
function saveLocal(d){try{localStorage.setItem(SK,JSON.stringify(d));}catch(e){}}
function loadLocal(){try{const s=localStorage.getItem(SK)||localStorage.getItem('studyos-v7')||localStorage.getItem('studyos-v6');return s?JSON.parse(s):null;}catch(e){return null;}}
