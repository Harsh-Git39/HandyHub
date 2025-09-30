const API = {
  videos: '/api/videos',
  register: '/api/register',
  login: '/api/login',
  upgrade: '/api/upgrade',
  me: '/api/me'
};

// Simple i18n
const i18n = {
  en: {
    subtitle: 'DIY hardware videos — retailers & consumers',
    heroTitle: 'Learn, fix, sell — DIY videos for hardware.',
    heroSub: 'Short, clear, India-focused guides from retailers & experts.',
    viewVideos: 'View Videos',
    upload: 'Upload / Become Seller',
    loginRegister: 'Login / Register',
    profile: 'Profile',
    upgrade: 'Upgrade to Premium',
    premiumOnly: 'Premium'
  },
  hi: {
    subtitle: 'DIY हार्डवेयर वीडियो — रिटेलर्स और उपभोक्ता',
    heroTitle: 'सीखें, ठीक करें, बेचें — हार्डवेयर DIY वीडियो।',
    heroSub: 'छोटे, स्पष्ट, भारत-केंद्रित गाइड रिटेलर्स और विशेषज्ञों से।',
    viewVideos: 'वीडियो देखें',
    upload: 'अपलोड करें / विक्रेता बनें',
    loginRegister: 'लॉगिन / रजिस्टर',
    profile: 'प्रोफ़ाइल',
    upgrade: 'प्रीमियम में अपग्रेड करें',
    premiumOnly: 'प्रीमियम'
  }
};

let lang = localStorage.getItem('hh_lang') || 'en';
let currentUser = JSON.parse(localStorage.getItem('hh_user') || 'null');
document.addEventListener('DOMContentLoaded', init);

function t(key) {
  return i18n[lang][key] || i18n['en'][key] || key;
}

function init(){
  // set up language select
  const langSelect = document.getElementById('langSelect');
  langSelect.value = lang;
  langSelect.addEventListener('change', (e)=>{
    lang = e.target.value;
    localStorage.setItem('hh_lang', lang);
    applyLanguage();
  });
  applyLanguage();

  // auth buttons
  const loginBtn = document.getElementById('loginBtn');
  const profileBtn = document.getElementById('profileBtn');
  loginBtn.addEventListener('click', ()=> showAuth());
  profileBtn.addEventListener('click', ()=> showProfile());

  // logout button
  const logoutBtn = document.getElementById('logoutBtn');
  logoutBtn.addEventListener('click', ()=>{
    localStorage.removeItem('hh_user');
    currentUser = null;
    refreshUserUI();
    loadVideos();
    alert('Logged out successfully');
  });

  // gallery
  document.getElementById('viewGallery').addEventListener('click', ()=> {
    document.getElementById('gallery').classList.remove('hidden');
    loadVideos();
  });

  // search/filter UI
  document.getElementById('search').addEventListener('input', loadVideos);
  document.getElementById('filterPremium').addEventListener('change', loadVideos);

  // auth modal behaviour
  setupAuthModal();

  // video modal actions
  document.getElementById('closeVideo').addEventListener('click', closeVideoModal);
  document.getElementById('closeVideo2').addEventListener('click', closeVideoModal);

  // profile state
  refreshUserUI();
}

function applyLanguage(){
  document.getElementById('subtitle').innerText = t('subtitle');
  document.getElementById('heroTitle').innerText = t('heroTitle');
  document.getElementById('heroSub').innerText = t('heroSub');
  document.getElementById('viewGallery').innerText = t('viewVideos');
  document.getElementById('becomeSeller').innerText = t('upload');
  document.getElementById('loginBtn').innerText = t('loginRegister');
  document.getElementById('profileBtn').innerText = currentUser ? currentUser.name : t('profile');
}

// AUTH
function setupAuthModal(){
  const authModal = document.getElementById('authModal');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const authMsg = document.getElementById('authMsg');

  tabLogin.addEventListener('click', ()=> {
    tabLogin.classList.add('active'); tabRegister.classList.remove('active');
    loginForm.classList.remove('hidden'); registerForm.classList.add('hidden');
    authMsg.innerText = '';
  });
  tabRegister.addEventListener('click', ()=> {
    tabRegister.classList.add('active'); tabLogin.classList.remove('active');
    registerForm.classList.remove('hidden'); loginForm.classList.add('hidden');
    authMsg.innerText = '';
  });

  document.getElementById('doLogin').addEventListener('click', async ()=>{
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();
    if(!email || !password){ authMsg.innerText = 'Email & password required'; return; }
    const res = await fetch(API.login, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
    const data = await res.json();
    if(!data.ok){ authMsg.innerText = data.message || 'Login failed'; return; }
    currentUser = data.user;
    localStorage.setItem('hh_user', JSON.stringify(currentUser));
    authMsg.innerText = 'Logged in';
    document.getElementById('authModal').classList.add('hidden');
    refreshUserUI();
    loadVideos();
    applyLanguage();
  });

  document.getElementById('doRegister').addEventListener('click', async ()=>{
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    if(!name || !email || !password){ authMsg.innerText = 'All fields required'; return; }
    const res = await fetch(API.register, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name, email, password }) });
    const data = await res.json();
    if(!data.ok){ authMsg.innerText = data.message || 'Register failed'; return; }
    currentUser = data.user;
    localStorage.setItem('hh_user', JSON.stringify(currentUser));
    authMsg.innerText = 'Registered & logged in';
    document.getElementById('authModal').classList.add('hidden');
    refreshUserUI();
    loadVideos();
    applyLanguage();
  });

  document.getElementById('closeAuth').addEventListener('click', ()=> authModal.classList.add('hidden'));
}

function showAuth(){ document.getElementById('authModal').classList.remove('hidden'); }
function showProfile(){
  if(!currentUser){ showAuth(); return; }
  alert(`${currentUser.name} (${currentUser.email})\nPremium: ${currentUser.premium ? 'Yes' : 'No'}`);
}

function refreshUserUI(){
  const profileBtn = document.getElementById('profileBtn');
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const userStatus = document.getElementById('userStatus');

  if(currentUser){
    loginBtn.classList.add('hidden');
    profileBtn.classList.remove('hidden');
    profileBtn.innerText = currentUser.name;
    logoutBtn.classList.remove('hidden');  // show logout button
    userStatus.innerText = currentUser.premium ? 'Premium member' : 'Free user';
  } else {
    loginBtn.classList.remove('hidden');
    profileBtn.classList.add('hidden');
    logoutBtn.classList.add('hidden');  // hide logout
    userStatus.innerText = 'Not logged in';
  }
  applyLanguage();
}

// VIDEOS load & render
async function loadVideos(){
  const q = document.getElementById('search').value.trim().toLowerCase();
  const onlyPremium = document.getElementById('filterPremium').checked;
  const res = await fetch(API.videos);
  const data = await res.json();
  const videos = data.videos || [];
  // filter
  const filtered = videos.filter(v => {
    if(onlyPremium && !v.premium) return false;
    const text = (v.title_en + ' ' + v.title_hi + ' ' + v.tags.join(' ')).toLowerCase();
    if(q && !text.includes(q)) return false;
    return true;
  });
  renderVideos(filtered);
}

function renderVideos(videos){
  const grid = document.getElementById('videosGrid');
  grid.innerHTML = '';
  videos.forEach(v => {
    const card = document.createElement('div');
    card.className = 'card';
    const thumb = document.createElement('div');
    thumb.className = 'thumb';
    thumb.innerHTML = `<iframe src="${v.url}" title="${v.title_en}" frameborder="0" allowfullscreen style="width:100%;height:100%;pointer-events:none;opacity:.75"></iframe>`;
    const title = document.createElement('div');
    title.innerHTML = `<strong>${lang==='hi'?v.title_hi:v.title_en}</strong>`;
    const meta = document.createElement('div');
    meta.className = 'meta';
    const dur = document.createElement('small');
    dur.className = 'muted small';
    dur.innerText = `${v.duration} • ${v.tags.join(', ')}`;
    const lock = document.createElement('div');
    lock.innerHTML = v.premium ? `<span class="lock">${t('premiumOnly')}</span>` : '';
    meta.appendChild(dur); meta.appendChild(lock);

    const btns = document.createElement('div');
    btns.style.display='flex'; btns.style.gap='8px';
    const view = document.createElement('button');
    view.className='btn';
    view.innerText = 'Open';
    view.addEventListener('click', ()=> openVideo(v));
    btns.appendChild(view);

    card.appendChild(thumb); card.appendChild(title); card.appendChild(meta); card.appendChild(btns);
    grid.appendChild(card);
  });
}

// Video modal
function openVideo(v){
  const modal = document.getElementById('videoModal');
  document.getElementById('videoTitle').innerText = lang==='hi'?v.title_hi:v.title_en;
  document.getElementById('videoDesc').innerText = lang==='hi'?v.desc_hi:v.desc_en;
  const frame = document.getElementById('videoFrame');
  frame.innerHTML = `<iframe src="${v.url}" allowfullscreen></iframe>`;

  const upgradeBtn = document.getElementById('upgradeBtn');
  upgradeBtn.classList.add('hidden');
  upgradeBtn.onclick = null;
  if(v.premium && (!currentUser || !currentUser.premium)){
    upgradeBtn.classList.remove('hidden');
    upgradeBtn.innerText = t('upgrade');
    upgradeBtn.onclick = async ()=>{
      if(!currentUser){ alert('Please login first'); showAuth(); return; }
      const res = await fetch(API.upgrade, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email: currentUser.email }) });
      const data = await res.json();
      if(data.ok){
        currentUser = data.user;
        localStorage.setItem('hh_user', JSON.stringify(currentUser));
        alert('Upgraded to premium (simulated). Enjoy!');
        upgradeBtn.classList.add('hidden');
        refreshUserUI();
      } else {
        alert(data.message || 'Upgrade failed');
      }
    };
  }
  modal.classList.remove('hidden');
}

function closeVideoModal(){ 
  document.getElementById('videoModal').classList.add('hidden');
  document.getElementById('videoFrame').innerHTML = '';
}
