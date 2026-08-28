// ===== Shared social links (used in footers and hero CTAs) =====
const VELMOUR_SOCIAL = {
  velmourInstagram: "https://www.instagram.com/velmourglobalfoundation/",
  dimunInstagram: "https://www.instagram.com/dimunofficial/",
  koshurInstagram: "https://www.instagram.com/thekoshursummit/",
  credit: "https://www.instagram.com/albidayahtech/"
};

// ===== Header scroll state =====
const header = document.querySelector('.site-header');
if(header){
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll);
}

// ===== Mobile nav =====
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if(navToggle && navLinks){
  navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
}

// ===== Reveal on scroll =====
const revealEls = document.querySelectorAll('.reveal');
if('IntersectionObserver' in window && revealEls.length){
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {threshold:0.15});
  revealEls.forEach(el => io.observe(el));
} else {
  revealEls.forEach(el => el.classList.add('in'));
}

// ===== Tabs (used on DIMUN page) =====
document.querySelectorAll('.tabs').forEach(tabGroup => {
  const targetGroup = tabGroup.dataset.target;
  tabGroup.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      tabGroup.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll(`.tab-panel[data-group="${targetGroup}"]`).forEach(p => p.classList.remove('active'));
      document.querySelector(`.tab-panel[data-group="${targetGroup}"][data-tab="${btn.dataset.tab}"]`)?.classList.add('active');
    });
  });
});

// ===== Modal open/close helpers (used by registration modals) =====
function openModal(id){
  const m = document.getElementById(id);
  if(m){
    m.classList.add('open'); document.body.style.overflow='hidden';
    if(id === 'join-modal' && typeof resetJoinModal === 'function') resetJoinModal();
  }
}
function closeModal(id){
  const m = document.getElementById(id);
  if(m){ m.classList.remove('open'); document.body.style.overflow=''; }
}
document.querySelectorAll('[data-open-modal]').forEach(btn=>{
  btn.addEventListener('click', ()=> openModal(btn.dataset.openModal));
});
document.querySelectorAll('[data-close-modal]').forEach(btn=>{
  btn.addEventListener('click', ()=> closeModal(btn.closest('.modal-overlay').id));
});
document.querySelectorAll('.modal-overlay').forEach(ov=>{
  ov.addEventListener('click', (e)=>{ if(e.target === ov) closeModal(ov.id); });
});

// ===== Countdown timer (used for "Upcoming: Koshur Summit" banners) =====
// Pass an ISO date string and the id of a container with .cd-d/.cd-h/.cd-m/.cd-s spans inside.
function startCountdown(targetISO, containerId){
  const el = document.getElementById(containerId);
  if(!el || !targetISO) return;
  const target = new Date(targetISO).getTime();
  if(isNaN(target)) return;
  function tick(){
    const diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const set = (cls, val) => { const n = el.querySelector('.' + cls); if(n) n.textContent = String(val).padStart(2,'0'); };
    set('cd-d', d); set('cd-h', h); set('cd-m', m); set('cd-s', s);
  }
  tick();
  setInterval(tick, 1000);
}

// ===== Shared modal-form navigation (registration flows) =====
function backToRoles(prefix){
  const roleStep = document.getElementById(prefix + '-step-role');
  const paymentStep = document.getElementById(prefix + '-step-payment');
  if(roleStep) roleStep.style.display = 'block';
  if(paymentStep) paymentStep.style.display = 'none';
  document.querySelectorAll('.' + prefix + '-form').forEach(f => f.style.display = 'none');
}

// ===== Join Us modal flow (Velmour Global / Koshur Summit / DIMUN) =====
// Koshur Summit and DIMUN cards inside the modal simply redirect to their
// own dedicated join pages (koshur-join.html / dimun-join.html). Only the
// Velmour Global track is handled inline here, since it needs an
// Intern-or-Volunteer sub-choice before showing the right form.
function resetJoinModal(){
  const org = document.getElementById('join-step-org');
  const role = document.getElementById('join-step-velmour-role');
  const done = document.getElementById('join-step-done');
  if(org) org.style.display = 'block';
  if(role) role.style.display = 'none';
  if(done) done.style.display = 'none';
  document.querySelectorAll('.join-form').forEach(f => { f.style.display = 'none'; if(f.reset) f.reset(); });
}
function showJoinOrg(org){
  const orgStep = document.getElementById('join-step-org');
  const roleStep = document.getElementById('join-step-velmour-role');
  if(org === 'velmour'){
    if(orgStep) orgStep.style.display = 'none';
    if(roleStep) roleStep.style.display = 'block';
  }
}
function backToJoinOrg(){
  const orgStep = document.getElementById('join-step-org');
  const roleStep = document.getElementById('join-step-velmour-role');
  if(orgStep) orgStep.style.display = 'block';
  if(roleStep) roleStep.style.display = 'none';
  document.querySelectorAll('.join-form').forEach(f => f.style.display = 'none');
}
function showJoinForm(key){
  const roleStep = document.getElementById('join-step-velmour-role');
  if(roleStep) roleStep.style.display = 'none';
  document.querySelectorAll('.join-form').forEach(f => f.style.display = 'none');
  const form = document.getElementById('join-form-' + key);
  if(form) form.style.display = 'block';
}
function backToJoinRole(){
  const roleStep = document.getElementById('join-step-velmour-role');
  if(roleStep) roleStep.style.display = 'block';
  document.querySelectorAll('.join-form').forEach(f => f.style.display = 'none');
}
[{key:'velmour-intern', role:'Intern', formType:'velmour_intern'},
 {key:'velmour-volunteer', role:'Volunteer', formType:'velmour_volunteer'}].forEach(cfg=>{
  const form = document.getElementById('join-form-' + cfg.key);
  if(!form) return;
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if(typeof submitRegistration !== 'function') return;
    const result = submitRegistration(this, {
      event: 'Velmour Global Foundation',
      role: cfg.role,
      formType: cfg.formType,
      required: ['full_name','phone','email','qualification','experience','why_choose','heard_about']
    });
    if(result){
      setTimeout(() => {
        document.querySelectorAll('.join-form').forEach(f => f.style.display = 'none');
        const done = document.getElementById('join-step-done');
        if(done) done.style.display = 'block';
      }, 1400);
    }
  });
});

// ===== Radio card visual state =====
document.querySelectorAll('.radio-card').forEach(card=>{
  const input = card.querySelector('input');
  if(!input) return;
  const sync = () => {
    document.querySelectorAll(`.radio-card input[name="${input.name}"]`).forEach(i=>{
      i.closest('.radio-card').classList.toggle('selected', i.checked);
    });
  };
  input.addEventListener('change', sync);
  sync();
});
