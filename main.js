/* ============================================================
   js/main.js — Core application logic for Vault
   All functions are assigned to window.* so inline HTML
   onclick handlers can call them (ES module scope isolation).
   ============================================================ */

/* ── THEMES ─────────────────────────────────────────────── */
const THEMES = {
  midnight: {
    '--a1': '#04030e', '--a2': '#07061a', '--a3': '#0c0a28',
    '--acc': '#8b6ef5', '--acc-lt': '#b8a0ff', '--acc-dk': '#5a3fd4',
    '--acc-g': 'rgba(139,110,245,0.09)', '--acc-gm': 'rgba(139,110,245,0.17)', '--acc-gl': 'rgba(139,110,245,0.32)',
    '--ink': '#ece8ff', '--ink2': '#7870a0', '--ink3': '#38325a',
    '--ln': 'rgba(255,255,255,0.06)', '--ln2': 'rgba(255,255,255,0.10)',
    '--card': 'rgba(10,8,28,0.75)', '--card2': 'rgba(16,12,44,0.65)', '--nav': 'rgba(4,3,14,0.96)',
    '--up': '#5abfa0', '--up2': 'rgba(90,191,160,0.10)', '--dn': '#c87880', '--dn2': 'rgba(200,120,128,0.10)',
    '--r': '139', '--g': '110', '--b': '245',
    aurora: [.545, .431, .961], particle: [139, 110, 245], label: '🌌 Midnight'
  },
  ember: {
    '--a1': '#0c0602', '--a2': '#120a03', '--a3': '#180e04',
    '--acc': '#c8783a', '--acc-lt': '#e0a870', '--acc-dk': '#9a5020',
    '--acc-g': 'rgba(200,120,58,0.09)', '--acc-gm': 'rgba(200,120,58,0.16)', '--acc-gl': 'rgba(200,120,58,0.28)',
    '--ink': '#f0e8dc', '--ink2': '#907060', '--ink3': '#503828',
    '--ln': 'rgba(255,255,255,0.06)', '--ln2': 'rgba(255,255,255,0.10)',
    '--card': 'rgba(18,10,4,0.80)', '--card2': 'rgba(26,14,5,0.70)', '--nav': 'rgba(10,5,2,0.96)',
    '--up': '#78b890', '--up2': 'rgba(120,184,144,0.10)', '--dn': '#c07070', '--dn2': 'rgba(192,112,112,0.10)',
    '--r': '200', '--g': '120', '--b': '58',
    aurora: [.784, .471, .227], particle: [200, 120, 58], label: '🔥 Ember'
  },
  forest: {
    '--a1': '#020a05', '--a2': '#040f07', '--a3': '#06160a',
    '--acc': '#50b878', '--acc-lt': '#80d8a0', '--acc-dk': '#2e8850',
    '--acc-g': 'rgba(80,184,120,0.09)', '--acc-gm': 'rgba(80,184,120,0.16)', '--acc-gl': 'rgba(80,184,120,0.28)',
    '--ink': '#e0f0e8', '--ink2': '#6a9078', '--ink3': '#304838',
    '--ln': 'rgba(255,255,255,0.06)', '--ln2': 'rgba(255,255,255,0.10)',
    '--card': 'rgba(4,14,7,0.80)', '--card2': 'rgba(6,20,10,0.70)', '--nav': 'rgba(2,7,3,0.96)',
    '--up': '#60c088', '--up2': 'rgba(96,192,136,0.10)', '--dn': '#c07878', '--dn2': 'rgba(192,120,120,0.10)',
    '--r': '80', '--g': '184', '--b': '120',
    aurora: [.314, .722, .471], particle: [80, 184, 120], label: '🌿 Forest'
  },
  dusk: {
    '--a1': '#0a0508', '--a2': '#100810', '--a3': '#160c18',
    '--acc': '#c070a0', '--acc-lt': '#e098c0', '--acc-dk': '#904870',
    '--acc-g': 'rgba(192,112,160,0.09)', '--acc-gm': 'rgba(192,112,160,0.16)', '--acc-gl': 'rgba(192,112,160,0.28)',
    '--ink': '#ede0ea', '--ink2': '#906880', '--ink3': '#4a2e42',
    '--ln': 'rgba(255,255,255,0.06)', '--ln2': 'rgba(255,255,255,0.10)',
    '--card': 'rgba(18,6,16,0.80)', '--card2': 'rgba(26,10,24,0.70)', '--nav': 'rgba(8,3,8,0.96)',
    '--up': '#78b898', '--up2': 'rgba(120,184,152,0.10)', '--dn': '#c07880', '--dn2': 'rgba(192,120,128,0.10)',
    '--r': '192', '--g': '112', '--b': '160',
    aurora: [.753, .439, .627], particle: [192, 112, 160], label: '🌸 Dusk'
  },
  abyss: {
    '--a1': '#010810', '--a2': '#020e1c', '--a3': '#031528',
    '--acc': '#30b8d8', '--acc-lt': '#70d8f0', '--acc-dk': '#1080a0',
    '--acc-g': 'rgba(48,184,216,0.09)', '--acc-gm': 'rgba(48,184,216,0.16)', '--acc-gl': 'rgba(48,184,216,0.30)',
    '--ink': '#d8eef8', '--ink2': '#527888', '--ink3': '#1e4255',
    '--ln': 'rgba(255,255,255,0.06)', '--ln2': 'rgba(255,255,255,0.10)',
    '--card': 'rgba(2,14,26,0.80)', '--card2': 'rgba(3,20,38,0.70)', '--nav': 'rgba(1,6,14,0.96)',
    '--up': '#48c8a8', '--up2': 'rgba(72,200,168,0.10)', '--dn': '#c07878', '--dn2': 'rgba(192,120,120,0.10)',
    '--r': '48', '--g': '184', '--b': '216',
    aurora: [.188, .722, .847], particle: [48, 184, 216], label: '🌊 Abyss'
  },
  gold: {
    '--a1': '#0a0800', '--a2': '#120f00', '--a3': '#1a1500',
    '--acc': '#e0b840', '--acc-lt': '#f0d080', '--acc-dk': '#a08020',
    '--acc-g': 'rgba(224,184,64,0.09)', '--acc-gm': 'rgba(224,184,64,0.18)', '--acc-gl': 'rgba(224,184,64,0.32)',
    '--ink': '#f8f0d8', '--ink2': '#a09060', '--ink3': '#605030',
    '--ln': 'rgba(255,255,255,0.07)', '--ln2': 'rgba(255,255,255,0.12)',
    '--card': 'rgba(20,16,0,0.80)', '--card2': 'rgba(30,24,0,0.70)', '--nav': 'rgba(10,8,0,0.96)',
    '--up': '#60c080', '--up2': 'rgba(96,192,128,0.10)', '--dn': '#c07878', '--dn2': 'rgba(192,120,120,0.10)',
    '--r': '224', '--g': '184', '--b': '64',
    aurora: [.878, .722, .251], particle: [224, 184, 64], label: '👑 Gold Prestige'
  },
  obsidian: {
    '--a1': '#040404', '--a2': '#080808', '--a3': '#0c0c12',
    '--acc': '#a090c8', '--acc-lt': '#c8b8e8', '--acc-dk': '#706090',
    '--acc-g': 'rgba(160,144,200,0.09)', '--acc-gm': 'rgba(160,144,200,0.16)', '--acc-gl': 'rgba(160,144,200,0.28)',
    '--ink': '#e8e8f0', '--ink2': '#888898', '--ink3': '#404050',
    '--ln': 'rgba(255,255,255,0.05)', '--ln2': 'rgba(255,255,255,0.08)',
    '--card': 'rgba(12,12,18,0.85)', '--card2': 'rgba(18,18,28,0.75)', '--nav': 'rgba(4,4,8,0.97)',
    '--up': '#60b890', '--up2': 'rgba(96,184,144,0.10)', '--dn': '#b87880', '--dn2': 'rgba(184,120,128,0.10)',
    '--r': '160', '--g': '144', '--b': '200',
    aurora: [.627, .565, .784], particle: [160, 144, 200], label: '🖤 Obsidian'
  }
};

let currentTheme = 'midnight';

window.setTheme = function (name, btn) {
  if (name === currentTheme) return;
  haptic(12);
  currentTheme = name;
  const t = THEMES[name];
  document.body.classList.add('theme-transition');
  Object.entries(t).forEach(([k, v]) => { if (k.startsWith('--')) document.documentElement.style.setProperty(k, v); });
  if (window.auroraSetColor) window.auroraSetColor(...t.aurora);
  if (window.particleSetColor) window.particleSetColor(...t.particle);
  document.getElementById('bg-root').style.background = `linear-gradient(180deg,${t['--a1']} 0%,${t['--a2']} 50%,${t['--a3']} 100%)`;
  document.querySelectorAll('.th-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  setTimeout(() => document.body.classList.remove('theme-transition'), 1400);
  showToast(t.label);
  if (document.getElementById('ap-forecast').style.display !== 'none') setTimeout(drawForecast, 100);
};

/* ── MONTHS ──────────────────────────────────────────────── */
['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'].forEach((m, i) => {
  const el = document.createElement('div');
  el.className = 'mo' + (i === 5 ? ' on' : '');
  el.textContent = m + (i < 3 ? " '24" : " '25");
  el.onclick = () => {
    document.querySelectorAll('.mo').forEach(x => x.classList.remove('on'));
    el.classList.add('on');
    haptic(8);
  };
  document.getElementById('mpills').appendChild(el);
});

/* ── SLOT BALANCE ────────────────────────────────────────── */
window.buildSlotDisplay = function (numStr) {
  const sd = document.getElementById('slotDisplay');
  sd.innerHTML = '';
  for (const ch of numStr) {
    if (ch === '.' || ch === ',') {
      const s = document.createElement('span');
      s.textContent = ch;
      s.style.cssText = 'font-size:26px;color:var(--ink2);line-height:1';
      sd.appendChild(s);
    } else {
      const wrap = document.createElement('span');
      wrap.className = 'digit-wrap';
      const col = document.createElement('div');
      col.className = 'digit-col';
      const target = parseInt(ch);
      const start = (target + Math.floor(Math.random() * 7) + 1) % 10;
      for (let d = start; d !== target; d = (d + 1) % 10) {
        const s = document.createElement('span');
        s.textContent = d;
        col.appendChild(s);
      }
      const final = document.createElement('span');
      final.textContent = target;
      col.appendChild(final);
      col.style.transform = 'translateY(0)';
      wrap.appendChild(col);
      sd.appendChild(wrap);
      setTimeout(() => { col.style.transform = `translateY(-${(col.children.length - 1) * 100}%)`; }, 200 + Math.random() * 420);
    }
  }
};

/* ── NAV PILL ────────────────────────────────────────────── */
window.updateNavPill = function (idx) {
  const nbs = document.querySelectorAll('.nb');
  const pill = document.getElementById('navPill');
  const nb = nbs[idx];
  const navRect = document.getElementById('mainNav').getBoundingClientRect();
  const nbRect = nb.getBoundingClientRect();
  pill.style.left = (nbRect.left - navRect.left) + 'px';
  pill.style.width = nbRect.width + 'px';
};

/* ── NAVIGATION ──────────────────────────────────────────── */
const TAB_ORDER = ['pulse', 'ledger', 'vault', 'aura'];
let currentTabIdx = 0;

window.nav = function (page, idx) {
  haptic(8);
  currentTabIdx = idx;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nb').forEach(b => b.classList.remove('on'));
  document.getElementById('s-' + page).classList.add('active');
  document.getElementById('nb-' + page).classList.add('on');
  setTimeout(() => updateNavPill(idx), 10);
};

setTimeout(() => updateNavPill(0), 60);

/* ── VAULT & AURA SUB-TABS ───────────────────────────────── */
window.vtab = function (id) {
  haptic(8);
  ['goals', 'budgets', 'subs'].forEach(t => {
    document.getElementById('vp-' + t).style.display = t === id ? 'block' : 'none';
    document.getElementById('vt-' + t).classList.toggle('on', t === id);
  });
};

window.atab = function (id) {
  haptic(8);
  ['insights', 'forecast', 'badges'].forEach(t => {
    document.getElementById('ap-' + t).style.display = t === id ? 'block' : 'none';
    document.getElementById('at-' + t).classList.toggle('on', t === id);
  });
  if (id === 'badges') renderBadges();
};

/* ── DATA STORE ──────────────────────────────────────────── */
const STORE = {
  transactions: [
    { id: 1, name: 'Red Bull x2', cat: 'drink', ico: '⚡', amt: -7.00, date: 'Today' },
    { id: 2, name: 'Uber to Airport', cat: 'uber', ico: '🚗', amt: -24.00, date: 'Sun 22 Mar' },
    { id: 3, name: 'March Salary', cat: 'income', ico: '💰', amt: 3200, date: 'Fri 20 Mar' },
    { id: 4, name: 'Netflix', cat: 'subs', ico: '🎬', amt: -15.99, date: 'Sun 22 Mar' },
    { id: 5, name: 'Deliveroo', cat: 'food', ico: '🍕', amt: -18.50, date: 'Thu 19 Mar' },
    { id: 6, name: 'Rent — March', cat: 'rent', ico: '🏠', amt: -39.48, date: 'Thu 19 Mar' },
    { id: 7, name: 'Spotify', cat: 'subs', ico: '🎵', amt: -9.99, date: 'Fri 7 Mar' }
  ],
  subs: [
    { name: 'Netflix', ico: '🎬', amt: 15.99, cycle: 'Monthly · 11th' },
    { name: 'Spotify', ico: '🎵', amt: 9.99, cycle: 'Monthly · 7th' },
    { name: 'ChatGPT Plus', ico: '🤖', amt: 20.00, cycle: 'Monthly · 26th' },
    { name: 'iCloud', ico: '☁️', amt: 2.99, cycle: 'Monthly · 1st' },
    { name: 'YouTube Premium', ico: '▶️', amt: 13.99, cycle: 'Monthly · 15th' }
  ]
};

/* ── HAPTIC ──────────────────────────────────────────────── */
window.haptic = function (ms = 8) {
  if (navigator.vibrate) navigator.vibrate(ms);
};

/* ── TRANSACTIONS ────────────────────────────────────────── */
window.renderTxList = function () {
  const list = document.getElementById('txList');
  const recent = document.getElementById('recentTxList');
  list.innerHTML = '';
  recent.innerHTML = '';
  const groups = {};
  STORE.transactions.forEach(tx => {
    if (!groups[tx.date]) groups[tx.date] = [];
    groups[tx.date].push(tx);
  });
  let rc = 0;
  Object.entries(groups).forEach(([date, txs]) => {
    const total = txs.reduce((s, t) => s + t.amt, 0);
    list.innerHTML += `<div class="tx-lbl"><span>${date}</span><span style="color:${total >= 0 ? 'var(--up)' : 'var(--dn)'}">${total >= 0 ? '+' : ''}${fmtAmt(total)}</span></div>`;
    const g = document.createElement('div');
    g.className = 'card';
    g.style.cssText = 'padding:4px 14px;margin:0 0 4px';
    txs.forEach(tx => {
      if (rc < 4) { recent.innerHTML += simTx(tx); rc++; }
      g.innerHTML += swipeTx(tx);
    });
    list.appendChild(g);
  });
};

function simTx(tx) {
  const c = tx.amt >= 0 ? 'var(--up)' : 'var(--dn)';
  const s = tx.amt >= 0 ? '+' : '−';
  const amt = fmtAmt(tx.amt);
  return `<div class="tx"><div class="tx-ico" style="${tx.cat === 'income' ? 'background:var(--up2)' : ''}">${tx.ico}</div><div class="tx-info"><div class="tx-name">${tx.name}</div><div class="tx-cat">${tx.cat}</div></div><div class="tx-amt" style="color:${c}">${s}${amt}</div></div>`;
}

function swipeTx(tx) {
  const c = tx.amt >= 0 ? 'var(--up)' : 'var(--dn)';
  const s = tx.amt >= 0 ? '+' : '−';
  const amt = fmtAmt(tx.amt);
  return `<div class="tx-wrap" data-id="${tx.id}"><div class="tx-actions"><div class="tx-act dup" onclick="dupTx(${tx.id})"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></div><div class="tx-act del" onclick="delTx(${tx.id})"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></div></div><div class="tx" ontouchstart="swipeStart(event,this)" ontouchmove="swipeMove(event,this)" ontouchend="swipeEnd(event,this)"><div class="tx-ico" style="${tx.cat === 'income' ? 'background:var(--up2)' : ''}">${tx.ico}</div><div class="tx-info"><div class="tx-name">${tx.name}</div><div class="tx-cat">${tx.cat}</div></div><div class="tx-amt" style="color:${c}">${s}${amt}</div></div></div>`;
}

let swX = 0;
window.swipeStart = function (e, el) { swX = e.touches[0].clientX; };
window.swipeMove = function (e, el) {
  const dx = e.touches[0].clientX - swX;
  if (dx < -10) { el.style.transform = `translateX(${Math.max(dx, -88)}px)`; e.preventDefault(); }
};
window.swipeEnd = function (e, el) {
  const dx = e.changedTouches[0].clientX - swX;
  if (dx < -44) {
    el.style.transform = 'translateX(-88px)';
    el.parentElement.querySelector('.tx-actions').style.transform = 'translateX(0)';
    haptic(12);
  } else {
    el.style.transform = '';
    const a = el.parentElement.querySelector('.tx-actions');
    if (a) a.style.transform = 'translateX(100%)';
  }
};

window.delTx = function (id) {
  haptic(20);
  const w = document.querySelector(`.tx-wrap[data-id="${id}"]`);
  if (w) { w.style.cssText += 'opacity:0;transform:translateX(-100%);transition:all .3s'; setTimeout(() => { STORE.transactions = STORE.transactions.filter(t => t.id !== id); renderTxList(); }, 300); }
  showToast('Deleted');
};

window.dupTx = function (id) {
  haptic(8);
  const tx = STORE.transactions.find(t => t.id === id);
  if (tx) { STORE.transactions.unshift({ ...tx, id: Date.now(), name: tx.name + ' (copy)' }); renderTxList(); showToast('Duplicated · +10 xp'); }
};

/* ── SUBSCRIPTIONS ───────────────────────────────────────── */
window.renderSubs = function () {
  document.getElementById('subList').innerHTML = STORE.subs.map(s =>
    `<div class="sub-card"><div class="sub-ico">${s.ico}</div><div style="flex:1"><div class="sub-name">${s.name}</div><div class="sub-cycle">${s.cycle}</div></div><div class="sub-amt">€${s.amt.toFixed(2)}</div><div class="sub-flag" onclick="haptic(12);showToast('${s.name} flagged')"><svg viewBox="0 0 24 24"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" fill="var(--dn)"/><line x1="4" y1="22" x2="4" y2="15" stroke="var(--dn)" stroke-width="2"/></svg></div></div>`
  ).join('');
};

/* ── BADGES ──────────────────────────────────────────────── */
const BADGES = [
  { ico: '🏆', lbl: 'Frugal', earned: true },
  { ico: '🔥', lbl: 'On Fire', earned: true },
  { ico: '◇', lbl: 'Goal Set', earned: true },
  { ico: '💰', lbl: 'Saver', earned: true },
  { ico: '📝', lbl: 'Logger', earned: false },
  { ico: '🚗', lbl: 'No Uber', earned: false },
  { ico: '📱', lbl: 'Sub Free', earned: false },
  { ico: '👑', lbl: 'Prestige', earned: false }
];

window.renderBadges = function () {
  document.getElementById('badgeGrid').innerHTML = BADGES.map(b =>
    `<div class="badge${b.earned ? ' earned' : ''}" onclick="haptic(8);showToast('${b.lbl}${b.earned ? '' : ' · locked'}')"><span class="badge-ico">${b.ico}</span><span class="badge-lbl">${b.lbl}</span></div>`
  ).join('');
};

/* ── FORECAST CHART ──────────────────────────────────────── */
window.drawForecast = function () {
  const canvas = document.getElementById('forecastCanvas');
  if (!canvas) return;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const W = canvas.offsetWidth * dpr, H = 110 * dpr;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  const s = getComputedStyle(document.documentElement);
  const acc = s.getPropertyValue('--acc').trim();
  const up = s.getPropertyValue('--up').trim();
  const dn = s.getPropertyValue('--dn').trim();
  const ink3 = s.getPropertyValue('--ink3').trim();
  const months = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'];
  const balance = [2847, 3100, 3380, 3620, 3200, 3800, 4100, 4400, 4700, 5000, 5300, 5552];
  const savings = [463, 480, 500, 520, 400, 550, 570, 590, 610, 630, 650, 670];
  const spend = [352, 380, 400, 420, 560, 400, 420, 440, 460, 480, 500, 520];
  function drawLine(data, color, dashed = false) {
    const maxV = Math.max(...balance) * 1.1;
    ctx.beginPath();
    ctx.setLineDash(dashed ? [4 * dpr, 4 * dpr] : []);
    data.forEach((v, i) => {
      const x = (i / (data.length - 1)) * (W - 14 * dpr) + 7 * dpr;
      const y = H - (v / maxV) * (H - 16 * dpr) - 8 * dpr;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5 * dpr;
    ctx.stroke();
  }
  ctx.font = `${8 * dpr}px Poppins,sans-serif`;
  ctx.fillStyle = ink3;
  ctx.textAlign = 'center';
  months.forEach((m, i) => {
    if (i % 3 === 0) {
      const x = (i / (months.length - 1)) * (W - 14 * dpr) + 7 * dpr;
      ctx.fillText(m, x, H - 1);
    }
  });
  drawLine(spend, dn, true);
  drawLine(savings, up);
  drawLine(balance, acc);
};

/* ── MODAL / FORM ────────────────────────────────────────── */
const CATS = [
  { id: 'food', e: '🍕', l: 'Food' }, { id: 'drink', e: '⚡', l: 'Energy' },
  { id: 'uber', e: '🚗', l: 'Transport' }, { id: 'subs', e: '📱', l: 'Subs' },
  { id: 'pets', e: '🐾', l: 'Pets' }, { id: 'rent', e: '🏠', l: 'Rent' },
  { id: 'health', e: '💊', l: 'Health' }, { id: 'groceries', e: '🛒', l: 'Groceries' },
  { id: 'activity', e: '🎯', l: 'Activity' }, { id: 'shopping', e: '🛍️', l: 'Shopping' },
  { id: 'energy', e: '💡', l: 'Utilities' }, { id: 'other', e: '📦', l: 'Other' }
];

let selCat = 'food', txT = 'e', sw1 = true, sw2 = false;

function buildCats() {
  document.getElementById('catG').innerHTML = CATS.map(c =>
    `<div class="cb${c.id === selCat ? ' sel' : ''}" onclick="pickCat('${c.id}')"><span style="font-size:19px">${c.e}</span><span class="cb-t">${c.l}</span></div>`
  ).join('');
}

window.pickCat = function (id) { selCat = id; buildCats(); };

window.setA = function (v) {
  const el = document.getElementById('amtN');
  el.textContent = v.toFixed(2);
  el.classList.remove('pop');
  void el.offsetWidth;
  el.classList.add('pop');
};

window.setTT = function (t) {
  txT = t;
  document.getElementById('tbE').className = 'tt' + (t === 'e' ? ' exp' : '');
  document.getElementById('tbI').className = 'tt' + (t === 'i' ? ' inc' : '');
};

window.toggleSw = function (n) {
  if (n === 1) { sw1 = !sw1; document.getElementById('sw1').className = 'sw' + (sw1 ? '' : ' off'); }
  else { sw2 = !sw2; document.getElementById('sw2').className = 'sw' + (sw2 ? '' : ' off'); }
};

window.openModal = function (desc = '', cat = 'food', amt = 0) {
  selCat = cat;
  document.getElementById('amtN').textContent = amt ? amt.toFixed(2) : '0.00';
  const d = document.getElementById('descN');
  d.textContent = desc || 'What was this for?';
  d.style.color = desc ? 'var(--ink)' : 'var(--ink3)';
  document.getElementById('modal').style.display = 'flex';
  buildCats();
};

window.closeModal = function () { document.getElementById('modal').style.display = 'none'; };

window.saveTx = function () {
  haptic(20);
  const amt = parseFloat(document.getElementById('amtN').textContent);
  const desc = document.getElementById('descN').textContent;
  const catObj = CATS.find(c => c.id === selCat);
  STORE.transactions.unshift({
    id: Date.now(),
    name: desc === 'What was this for?' ? catObj.l : desc,
    cat: selCat, ico: catObj.e,
    amt: txT === 'e' ? -amt : amt,
    date: 'Today'
  });
  renderTxList();
  closeModal();
  const fl = document.getElementById('flash');
  fl.classList.add('show');
  setTimeout(() => fl.classList.remove('show'), 600);
  spawnMini();
  const msgs = ['Saved · +10 xp', 'Tracked · +10 xp', 'Logged · +10 xp'];
  showToast(msgs[~~(Math.random() * msgs.length)]);
};

/* ── SCANNER ─────────────────────────────────────────────── */
let scanState = 'idle';

window.openScan = function () {
  scanState = 'idle';
  document.getElementById('sProc').className = 's-proc';
  document.getElementById('sRes').className = 's-res';
  document.getElementById('scanScreen').style.display = 'flex';
};

window.closeScan = function () {
  document.getElementById('scanScreen').style.display = 'none';
  scanState = 'idle';
};

window.doScan = function () {
  if (scanState !== 'idle') return;
  scanState = 'scanning';
  haptic(12);
  const btn = document.getElementById('scanBtn');
  btn.classList.add('pulse');
  setTimeout(() => btn.classList.remove('pulse'), 500);
  document.getElementById('sProc').className = 's-proc show';
  setTimeout(() => {
    document.getElementById('sProc').className = 's-proc';
    document.getElementById('sRes').className = 's-res show';
    scanState = 'result';
    haptic(16);
    setTimeout(() => {
      closeScan();
      openModal('Deliveroo', 'food', 18.5);
      showToast('Scanned · €18.50 detected');
    }, 1800);
  }, 2000);
};

/* ── ACHIEVEMENTS ────────────────────────────────────────── */
const ACHS = {
  saving: { ico: '🏆', name: 'Frugal Genius', sub: 'You spent 18% less than last month.', xp: '+150 xp earned' },
  goal: { ico: '◇', name: 'Goal Crusher', sub: 'Your Laptop goal is complete. The discipline compounds.', xp: '+200 xp earned' },
  streak: { ico: '✦', name: 'On Fire', sub: 'Seven consecutive days under budget.', xp: '+100 xp earned' },
  challenge1: { ico: '🥗', name: 'Almost There', sub: 'Five of seven days without takeout.', xp: '+107 xp so far' }
};

window.showAch = function (id) {
  const a = ACHS[id];
  if (!a) return;
  document.getElementById('achIco').textContent = a.ico;
  document.getElementById('achName').textContent = a.name;
  document.getElementById('achSub').textContent = a.sub;
  document.getElementById('achXp').textContent = a.xp;
  document.getElementById('achBg').style.display = 'flex';
  spawnCf();
  haptic(30);
};

window.closeAch = function () { document.getElementById('achBg').style.display = 'none'; };

window.spawnCf = function () {
  const w = document.getElementById('cfw');
  w.innerHTML = '';
  const t = THEMES[currentTheme];
  const [r, g, b] = t.particle;
  const cols = [`rgb(${r},${g},${b})`, '#fff', `rgba(${r},${g},${b},.6)`];
  for (let i = 0; i < 48; i++) {
    const el = document.createElement('div');
    el.className = 'cf';
    const sz = 3 + Math.random() * 8;
    el.style.cssText = `left:${Math.random() * 100}%;top:${4 + Math.random() * 28}%;width:${sz}px;height:${sz}px;background:${cols[~~(Math.random() * cols.length)]};animation-delay:${Math.random() * .6}s;animation-duration:${2.4 + Math.random() * .8}s;opacity:${.5 + Math.random() * .5};border-radius:${Math.random() > .5 ? '50%' : '2px'}`;
    w.appendChild(el);
  }
};

window.spawnMini = function () {
  const a = document.getElementById('app');
  const w = document.createElement('div');
  w.className = 'cfw';
  w.style.zIndex = '300';
  a.appendChild(w);
  for (let i = 0; i < 12; i++) {
    const el = document.createElement('div');
    el.className = 'cf';
    el.style.cssText = `left:${52 + Math.random() * 26}%;top:7%;width:5px;height:5px;background:var(--acc);animation-delay:${Math.random() * .18}s;animation-duration:${1.4 + Math.random() * .5}s`;
    w.appendChild(el);
  }
  setTimeout(() => w.remove(), 2600);
};

/* ── TOAST ───────────────────────────────────────────────── */
let toastTimer;
window.showToast = function (msg) {
  clearTimeout(toastTimer);
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast';
  void t.offsetWidth;
  t.className = 'toast show';
  toastTimer = setTimeout(() => { t.className = 'toast'; }, 3000);
};

/* ── FINANCIAL WRAPPED ───────────────────────────────────── */
const WR_SLIDES = [
  {
    cls: 'wr-slide-0',
    shape: { width: '300px', height: '300px', background: 'rgba(139,110,245,0.22)', top: '-80px', left: '-80px' },
    render: `<div class="wr-tag">2024 · Year in Review</div><div class="wr-ico-big">✦</div><div class="wr-label">Your Financial Story</div><div class="wr-sub">Another year of tracking, saving,<br>and growing. Here's what happened.</div>`
  },
  {
    cls: 'wr-slide-1',
    shape: { width: '340px', height: '200px', background: 'rgba(90,191,160,0.22)', top: '35%', right: '-100px' },
    render: `<div class="wr-eyebrow">Total Moved</div><div class="wr-num">€38,240</div><div class="wr-label">flowed through your account</div><div class="wr-sub">€29,400 in — €8,840 out.<br>Net save rate of <strong style="color:#5abfa0">23.1%</strong></div>`
  },
  {
    cls: 'wr-slide-2',
    shape: { width: '280px', height: '280px', background: 'rgba(200,120,58,0.22)', bottom: '-60px', right: '-60px' },
    render: `<div class="wr-eyebrow">Your Top Category</div><div class="wr-ico-big">🍕</div><div class="wr-num" style="font-size:58px">€2,847</div><div class="wr-label">Food & Dining</div><div class="wr-sub">That's <strong style="color:#e0a870">7.4 meals a week</strong>.<br>Your inner chef has competition.</div>`
  },
  {
    cls: 'wr-slide-3',
    shape: { width: '320px', height: '180px', background: 'rgba(139,110,245,0.18)', top: '22%', left: '-90px' },
    render: `<div class="wr-eyebrow">Spending Breakdown</div><div class="wr-bars"><div class="wr-bar-row"><span class="wr-bar-lbl">Rent</span><div class="wr-bar-track"><div class="wr-bar-fill" style="width:100%;background:#5abfa0"></div></div><span class="wr-bar-val">€3,480</span></div><div class="wr-bar-row"><span class="wr-bar-lbl">Food</span><div class="wr-bar-track"><div class="wr-bar-fill" style="width:82%;background:#8b6ef5"></div></div><span class="wr-bar-val">€2,847</span></div><div class="wr-bar-row"><span class="wr-bar-lbl">Transport</span><div class="wr-bar-track"><div class="wr-bar-fill" style="width:38%;background:#c87880"></div></div><span class="wr-bar-val">€1,320</span></div><div class="wr-bar-row"><span class="wr-bar-lbl">Subs</span><div class="wr-bar-track"><div class="wr-bar-fill" style="width:22%;background:#b8a0ff"></div></div><span class="wr-bar-val">€756</span></div><div class="wr-bar-row"><span class="wr-bar-lbl">Other</span><div class="wr-bar-track"><div class="wr-bar-fill" style="width:13%;background:rgba(255,255,255,.3)"></div></div><span class="wr-bar-val">€437</span></div></div><div class="wr-sub">Under budget 9 of 12 months.</div>`
  },
  {
    cls: 'wr-slide-4',
    shape: { width: '250px', height: '250px', background: 'rgba(48,184,216,0.2)', top: '10%', right: '-60px' },
    render: `<div class="wr-eyebrow">Subscription Audit</div><div class="wr-num">5</div><div class="wr-label">active subscriptions</div><div style="display:flex;gap:8px;margin:14px 0;animation:wrfade .5s ease .4s both"><div style="background:rgba(255,255,255,.08);border-radius:11px;padding:9px 12px;font-size:10px;color:rgba(255,255,255,.7);font-family:Poppins,sans-serif;text-align:center">🎬<br><span style="color:#c87880">€191/yr</span></div><div style="background:rgba(255,255,255,.08);border-radius:11px;padding:9px 12px;font-size:10px;color:rgba(255,255,255,.7);font-family:Poppins,sans-serif;text-align:center">🎵<br><span style="color:#c87880">€120/yr</span></div><div style="background:rgba(255,255,255,.08);border-radius:11px;padding:9px 12px;font-size:10px;color:rgba(255,255,255,.7);font-family:Poppins,sans-serif;text-align:center">🤖<br><span style="color:#c87880">€240/yr</span></div></div><div class="wr-sub">Total drain: <strong style="color:#30b8d8">€755/year</strong><br>Could fund a weekend away 🏖️</div>`
  },
  {
    cls: 'wr-slide-5',
    shape: { width: '320px', height: '320px', background: 'rgba(90,191,160,0.16)', bottom: '-90px', left: '-70px' },
    render: `<div class="wr-eyebrow">Biggest Win</div><div class="wr-ico-big">💻</div><div class="wr-pill" style="background:rgba(90,191,160,.15);border:1px solid rgba(90,191,160,.3);color:#5abfa0">Goal Complete</div><div class="wr-label">New Laptop Fund</div><div class="wr-num" style="font-size:62px">€1,200</div><div class="wr-sub">Saved in 8 months without missing a beat.<br><strong style="color:#80d8a0">That's real discipline.</strong></div>`
  },
  {
    cls: 'wr-slide-6',
    shape: { width: '360px', height: '360px', background: 'rgba(139,110,245,0.14)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' },
    render: `<div class="wr-tag">2024 · Final Score</div><div style="font-family:'Cormorant',serif;font-style:italic;font-size:96px;color:#8b6ef5;letter-spacing:-5px;margin-bottom:10px;line-height:.9;text-align:center;animation:wrnum-pop .6s cubic-bezier(.34,1.5,.64,1) .2s both">A−</div><div class="wr-label">Financial Grade</div><div class="wr-sub" style="margin-bottom:18px">23% save rate · 3 goals hit · 7-day streak.<br>2025 is going to be even better.</div><div class="wr-pill" style="background:rgba(139,110,245,.15);border:1px solid rgba(139,110,245,.3);color:#b8a0ff" onclick="closeWrapped()">Close · Begin 2025 ✦</div>`
  }
];

let wrCurrent = 0, wrTimer = null;

window.openWrapped = function () {
  haptic(16);
  wrCurrent = 0;
  document.getElementById('wrapped-overlay').classList.add('open');
  buildWrappedUI();
  renderWrappedSlide(0);
};

window.closeWrapped = function () {
  haptic(8);
  clearTimeout(wrTimer);
  document.getElementById('wrapped-overlay').classList.remove('open');
};

function buildWrappedUI() {
  const dots = document.getElementById('wrDots');
  const prog = document.getElementById('wrProgress');
  dots.innerHTML = '';
  prog.innerHTML = '';
  WR_SLIDES.forEach((_, i) => {
    const d = document.createElement('div');
    d.className = 'wr-dot' + (i === 0 ? ' on' : '');
    d.onclick = () => goWrapped(i);
    dots.appendChild(d);
    const seg = document.createElement('div');
    seg.className = 'wr-prog-seg';
    const fill = document.createElement('div');
    fill.className = 'wr-prog-fill';
    seg.appendChild(fill);
    prog.appendChild(seg);
  });
}

function renderWrappedSlide(idx) {
  clearTimeout(wrTimer);
  const container = document.getElementById('wrSlides');
  [...container.querySelectorAll('.wr-slide')].forEach(s => s.remove());
  const data = WR_SLIDES[idx];
  const slide = document.createElement('div');
  slide.className = `wr-slide ${data.cls} active`;
  if (data.shape) {
    const sh = document.createElement('div');
    sh.className = 'wr-bg-shape';
    Object.entries(data.shape).forEach(([k, v]) => sh.style[k] = v);
    slide.appendChild(sh);
  }
  slide.innerHTML += data.render;
  container.appendChild(slide);
  document.querySelectorAll('.wr-dot').forEach((d, i) => d.classList.toggle('on', i === idx));
  const segs = document.querySelectorAll('.wr-prog-seg');
  segs.forEach((seg, i) => {
    seg.classList.remove('done', 'active');
    const fill = seg.querySelector('.wr-prog-fill');
    fill.style.animation = 'none';
    void fill.offsetWidth;
    if (i < idx) { fill.style.width = '100%'; }
    else if (i === idx) { fill.style.width = '0'; seg.classList.add('active'); void seg.offsetWidth; fill.style.animation = 'wrprog 6s linear forwards'; }
    else { fill.style.width = '0'; }
  });
  wrTimer = setTimeout(() => wrNext(), 6000);
}

window.wrNext = function () {
  if (wrCurrent < WR_SLIDES.length - 1) { haptic(8); wrCurrent++; renderWrappedSlide(wrCurrent); }
  else { closeWrapped(); }
};

window.wrPrev = function () {
  if (wrCurrent > 0) { haptic(8); wrCurrent--; renderWrappedSlide(wrCurrent); }
};

function goWrapped(idx) { wrCurrent = idx; renderWrappedSlide(idx); }

/* ── CURRENCY SWITCHER ───────────────────────────────────── */
const CURRENCIES = {
  EUR: { symbol: '€', rate: 1.00,   decimals: 2 },
  USD: { symbol: '$', rate: 1.08,   decimals: 2 },
  GBP: { symbol: '£', rate: 0.85,   decimals: 2 },
  CHF: { symbol: '₣', rate: 0.97,   decimals: 2 },
  JPY: { symbol: '¥', rate: 161.5,  decimals: 0 },
};

let activeCurrency = 'EUR';

function fmtAmt(eurAmt) {
  const cur = CURRENCIES[activeCurrency];
  const converted = Math.abs(eurAmt) * cur.rate;
  return cur.symbol + converted.toFixed(cur.decimals);
}

window.setCurrency = function (code) {
  if (code === activeCurrency) return;
  haptic(8);
  activeCurrency = code;
  // Update pills
  document.querySelectorAll('.cy-pill').forEach(p => p.classList.remove('on'));
  document.getElementById('cy-' + code).classList.add('on');
  // Update hero symbol
  document.getElementById('heroSymbol').textContent = CURRENCIES[code].symbol;
  // Update hero balance (base EUR value is 2847.50)
  const cur = CURRENCIES[code];
  const converted = (2847.50 * cur.rate).toFixed(cur.decimals);
  buildSlotDisplay(Number(converted).toLocaleString('en-US', { minimumFractionDigits: cur.decimals, maximumFractionDigits: cur.decimals }));
  // Re-render transactions
  renderTxList();
  showToast(CURRENCIES[code].symbol + ' ' + code);
};

/* ── TAB SWIPE ───────────────────────────────────────────── */
(function () {
  let tsX = 0, tsY = 0, isHorizontal = null;

  const screensEl = document.querySelector('.screens');

  screensEl.addEventListener('touchstart', function (e) {
    tsX = e.touches[0].clientX;
    tsY = e.touches[0].clientY;
    isHorizontal = null;
  }, { passive: true });

  screensEl.addEventListener('touchmove', function (e) {
    if (isHorizontal !== null) return;
    const dx = Math.abs(e.touches[0].clientX - tsX);
    const dy = Math.abs(e.touches[0].clientY - tsY);
    if (dx < 8 && dy < 8) return; // not enough movement yet
    isHorizontal = dx > dy;
    if (isHorizontal) e.preventDefault(); // block scroll only for horizontal
  }, { passive: false });

  screensEl.addEventListener('touchend', function (e) {
    if (!isHorizontal) return;
    const dx = e.changedTouches[0].clientX - tsX;
    if (Math.abs(dx) < 50) return; // too short
    const next = dx < 0
      ? Math.min(currentTabIdx + 1, TAB_ORDER.length - 1) // swipe left → next
      : Math.max(currentTabIdx - 1, 0);                    // swipe right → prev
    if (next !== currentTabIdx) nav(TAB_ORDER[next], next);
  }, { passive: true });
})();

/* ── INIT ────────────────────────────────────────────────── */
buildSlotDisplay('2,847.50');
renderTxList();
renderSubs();
renderBadges();
setTimeout(() => showAch('saving'), 2400);

/* ── ONBOARDING ──────────────────────────────────────────── */
(function () {
  const TOTAL = 5;
  let current = 0;
  let selectedCurrency = { code: 'EUR', symbol: '€' };

  function buildDots() {
    const dots = document.getElementById('obDots');
    dots.innerHTML = '';
    for (let i = 0; i < TOTAL; i++) {
      const d = document.createElement('div');
      d.className = 'ob-dot' + (i === 0 ? ' on' : '');
      d.onclick = () => obGoTo(i);
      dots.appendChild(d);
    }
  }

  function updateDots(idx) {
    document.querySelectorAll('.ob-dot').forEach((d, i) => {
      d.classList.toggle('on', i === idx);
    });
  }

  function goTo(idx) {
    const slides = document.querySelectorAll('.ob-slide');
    slides[current].classList.remove('active');
    slides[current].classList.add('exit-left');
    setTimeout(() => slides[current].classList.remove('exit-left'), 400);
    current = idx;
    slides[current].classList.add('active');
    updateDots(current);
  }

  window.obNext = function () {
    if (current === TOTAL - 1) return;
    if (current === 3) {
      const name = (document.getElementById('obName').value || 'Friend').trim();
      const budget = document.getElementById('obBudget').value || '—';
      document.getElementById('obAllSetTitle').textContent = 'Hey, ' + name + ' 👋';
      document.getElementById('obAllSetSub').textContent =
        'Budget: ' + selectedCurrency.symbol + budget + '/mo · ' + selectedCurrency.code;
    }
    goTo(current + 1);
  };

  window.obPrev = function () {
    if (current === 0) return;
    const slides = document.querySelectorAll('.ob-slide');
    slides[current].classList.remove('active');
    current--;
    slides[current].classList.add('active');
    updateDots(current);
  };

  window.obGoTo = function (idx) { goTo(idx); };

  window.obPickCur = function (el, code, symbol) {
    document.querySelectorAll('.ob-cur').forEach(c => c.classList.remove('on'));
    el.classList.add('on');
    selectedCurrency = { code, symbol };
  };

  window.obFinish = function () {
    const name = (document.getElementById('obName').value || 'Friend').trim();
    const budget = document.getElementById('obBudget').value || '0';
    localStorage.setItem('vault_onboarded', '1');
    localStorage.setItem('vault_name', name);
    localStorage.setItem('vault_budget', budget);
    localStorage.setItem('vault_currency_code', selectedCurrency.code);
    localStorage.setItem('vault_currency_symbol', selectedCurrency.symbol);
    const ob = document.getElementById('onboarding');
    ob.style.transition = 'opacity .5s';
    ob.style.opacity = '0';
    setTimeout(() => ob.classList.add('hidden'), 520);
  };

  // Show or skip
  if (localStorage.getItem('vault_onboarded')) {
    document.getElementById('onboarding').classList.add('hidden');
  } else {
    buildDots();
  }
})();
