document.addEventListener('DOMContentLoaded',()=>{
  const yearEl=document.getElementById('year');
  if(yearEl){yearEl.textContent=String(new Date().getFullYear());}

  const params=new URLSearchParams(location.search);
  const q=params.get('q');
  const searchInput=document.querySelector('form.search input[type="search"]');
  if(searchInput && q){searchInput.value=q;}

  // Auto-render YouTube section if placeholder exists
  const videoMount=document.getElementById('videoMount');
  if(videoMount){
    renderYoutube(videoMount);
  }

  // Update login/logout button state if present
  const loginLink=document.querySelector('a[href="login.html"].btn');
  if(loginLink){
    const u=auth.user();
    loginLink.textContent=u?`Logout (${u.email})`:'Login';
    loginLink.addEventListener('click',e=>{
      if(auth.user()){
        e.preventDefault();auth.logout();location.reload();
      }
    });
  }

  // Favicon injection
  ensureFavicon();

  // Scroll reveal
  setupReveal();
});

// Simple localStorage helpers
const store={
  get(key, fallback){
    try{const v=localStorage.getItem(key);return v?JSON.parse(v):fallback;}catch{return fallback}
  },
  set(key, value){localStorage.setItem(key, JSON.stringify(value));}
};

function renderYoutube(mount){
  const params=new URLSearchParams(location.search);
  const ytId=params.get('yt');
  const title=document.querySelector('h1')?.textContent?.trim()||document.title||'PC fix';
  const query=encodeURIComponent(title.replace(/\s+/g,' '));
  const searchUrl=`https://www.youtube.com/results?search_query=${query}`;
  let inner='';
  if(ytId){
    inner=`<div class="iframe-wrap"><iframe src="https://www.youtube.com/embed/${ytId}" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
  } else {
    inner=`<p class="muted">Prefer video? Watch a related guide on YouTube.</p>`;
  }
  mount.innerHTML=`<div class="video">${inner}<div class="video-actions"><a class="btn" target="_blank" rel="noopener" href="${searchUrl}">Search on YouTube</a></div></div>`;
}

// Captcha utility (very simple math captcha)
const captcha={
  create(targetId){
    const a=Math.floor(Math.random()*9)+1;
    const b=Math.floor(Math.random()*9)+1;
    const answer=a+b;
    const id=`cap-${Math.random().toString(36).slice(2,8)}`;
    const mount=document.getElementById(targetId);
    mount.innerHTML=`<span class="chip" aria-hidden="true">🔐 What is ${a} + ${b}?</span><input id="${id}" placeholder="Answer" aria-label="Captcha answer">`;
    return {id, answer};
  },
  validate(ctx){
    const el=document.getElementById(ctx.id);
    const ok=Number(el.value)==ctx.answer;
    if(!ok){el.focus();el.value='';el.placeholder='Try again';}
    return ok;
  },
  refresh(ctx){
    const parent=document.getElementById(ctx.id).parentElement.id;
    return this.create(parent);
  }
};

// Simple auth demo
const auth={
  register(email, password){
    if(!email||!password) return false;
    const users=store.get('users',{});
    if(users[email]) return false;
    users[email]={email, password};
    store.set('users',users);
    store.set('session',{email});
    return true;
  },
  login(email, password){
    const users=store.get('users',{});
    if(!users[email]||users[email].password!==password) return false;
    store.set('session',{email});
    return true;
  },
  logout(){localStorage.removeItem('session');},
  user(){return store.get('session',null);}
};

function authSyncUI(){
  const u=auth.user();
  const btnLogout=document.getElementById('btnLogout');
  if(btnLogout){btnLogout.style.display=u?'inline-flex':'none';}
}

function ensureFavicon(){
  if(document.querySelector('link[rel="icon"]')) return;
  const link=document.createElement('link');
  link.rel='icon';
  link.href='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 64 64%22><defs><linearGradient id=%22g%22 x1=%220%22 x2=%221%22><stop stop-color=%22%235b8cff%22/><stop offset=%221%22 stop-color=%22%237f56d9%22/></linearGradient></defs><rect width=%2264%22 height=%2264%22 rx=%2216%22 fill=%22white%22/><path d=%22M12 32c10-12 30-12 40 0-10 12-30 12-40 0z%22 fill=%22url(%23g)%22/></svg>';
  document.head.appendChild(link);
}

function setupReveal(){
  const observer=new IntersectionObserver((entries)=>{
    for(const e of entries){
      if(e.isIntersecting){
        e.target.style.transition='transform .6s cubic-bezier(.2,.8,.2,1), opacity .6s';
        e.target.style.transform='translateY(0)';
        e.target.style.opacity='1';
        observer.unobserve(e.target);
      }
    }
  },{threshold:.08});
  document.querySelectorAll('.card, .cta-box, .grid > *, .steps .step').forEach(el=>{
    el.style.transform='translateY(10px)';
    el.style.opacity='.001';
    observer.observe(el);
  });
} 