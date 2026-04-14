/* ============================================================
   main.js — Core application logic for Vault
   All functions are assigned to window.* so inline HTML
   onclick handlers can call them (ES module scope isolation).
   ============================================================ */

/* ── API INTEGRATION ─────────────────────────────────────────
   When VAULT_API_BASE is set (production / dev with a running
   Go server), all data reads/writes go through the REST API.
   When empty (offline / preview), the app works purely from
   the hardcoded STORE below.
   ─────────────────────────────────────────────────────────── */
const IS_CONNECTED = !!window.VAULT_API_BASE;

if (IS_CONNECTED) {
  // Lazy-import auth gate & API client only when backend is configured
  import('./api.js').then(({ Auth, Transactions, Subscriptions, Goals }) => {
    if (!Auth.isLoggedIn()) {
      import('./auth.js').then(({ showAuthGate }) => showAuthGate());
    } else {
      // Load real data from API
      loadFromAPI({ Auth, Transactions, Subscriptions, Goals });
    }
  });
}

async function loadFromAPI({ Auth, Transactions, Subscriptions, Goals }) {
  try {
    const user = await Auth.me();
    // Update hero with real user name
    document.querySelector('.hero-ey').textContent = `Net Balance · ${new Date().toLocaleString('en', { month: 'long', year: 'numeric' })}`;
    // Set theme from user preference
    if (user.theme && user.theme !== 'midnight') setTheme(user.theme);

    // Load transactions
    const { transactions } = await Transactions.list({ limit: 200 });
    if (transactions && transactions.length > 0) {
      STORE.transactions = transactions.map(t => ({
        id: t.id,
        name: t.name,
        cat: t.category,
        ico: t.icon || '📦',
        amt: t.amount,
        date: new Date(t.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
      }));
      renderTxList();
    }

    // Load subscriptions
    const subs = await Subscriptions.list();
    if (subs && subs.length > 0) {
      STORE.subs = subs.map(s => ({
        name: s.name, ico: s.icon, amt: s.amount, cycle: s.cycle_note || 'Monthly',
      }));
      renderSubs();
    }
  } catch (e) {
    console.warn('API load error:', e.message);
  }
}

/* ── THEMES ─────────────────────────────────────────────── */
const THEMES = {
  midnight: {
    '--a1': '#02011a', '--a2': '#05042a', '--a3': '#09073d',
    '--acc': '#7c5ce8', '--acc-lt': '#a992ff', '--acc-dk': '#4e2eb8',
    '--acc-g': 'rgba(124,92,232,0.11)', '--acc-gm': 'rgba(124,92,232,0.22)', '--acc-gl': 'rgba(124,92,232,0.38)',
    '--ink': '#eeeaff', '--ink2': '#8278b8', '--ink3': '#3e3868',
    '--ln': 'rgba(255,255,255,0.07)', '--ln2': 'rgba(255,255,255,0.12)',
    '--card': 'rgba(8,5,32,0.82)', '--card2': 'rgba(14,10,50,0.72)', '--nav': 'rgba(2,1,20,0.97)',
    '--up': '#5abfa0', '--up2': 'rgba(90,191,160,0.10)', '--dn': '#c87880', '--dn2': 'rgba(200,120,128,0.10)',
    '--r': '124', '--g': '92', '--b': '232',
    aurora: [.38, .28, .95], particle: [124, 92, 232], label: '🌌 Midnight', xpRequired: 0, swatch: 'linear-gradient(135deg,#1a0f4a,#5832dc)'
  },
  ember: {
    '--a1': '#080400', '--a2': '#0f0700', '--a3': '#160b00',
    '--acc': '#b05e28', '--acc-lt': '#d4895a', '--acc-dk': '#7a3a10',
    '--acc-g': 'rgba(176,94,40,0.12)', '--acc-gm': 'rgba(176,94,40,0.22)', '--acc-gl': 'rgba(176,94,40,0.36)',
    '--ink': '#f2e4d0', '--ink2': '#a07858', '--ink3': '#5c3a20',
    '--ln': 'rgba(180,100,40,0.15)', '--ln2': 'rgba(180,100,40,0.25)',
    '--card': 'rgba(20,10,2,0.85)', '--card2': 'rgba(30,14,4,0.75)', '--nav': 'rgba(6,3,0,0.97)',
    '--up': '#78b890', '--up2': 'rgba(120,184,144,0.10)', '--dn': '#c07070', '--dn2': 'rgba(192,112,112,0.10)',
    '--r': '176', '--g': '94', '--b': '40',
    aurora: [.62, .28, .06], particle: [176, 94, 40], label: '🔥 Ember', xpRequired: 0, swatch: 'linear-gradient(135deg,#200800,#d4500a)'
  },
  forest: {
    '--a1': '#010801', '--a2': '#020d03', '--a3': '#031405',
    '--acc': '#2dd4a0', '--acc-lt': '#6ef0c4', '--acc-dk': '#189970',
    '--acc-g': 'rgba(45,212,160,0.08)', '--acc-gm': 'rgba(45,212,160,0.16)', '--acc-gl': 'rgba(45,212,160,0.28)',
    '--ink': '#d8f0e4', '--ink2': '#4a8864', '--ink3': '#1e4030',
    '--ln': 'rgba(45,212,160,0.10)', '--ln2': 'rgba(45,212,160,0.18)',
    '--card': 'rgba(2,10,3,0.88)', '--card2': 'rgba(4,16,6,0.78)', '--nav': 'rgba(1,6,1,0.97)',
    '--up': '#2dd4a0', '--up2': 'rgba(45,212,160,0.10)', '--dn': '#c07878', '--dn2': 'rgba(192,120,120,0.10)',
    '--r': '45', '--g': '212', '--b': '160',
    aurora: [.10, .60, .36], particle: [45, 212, 160], label: '🌿 Forest', xpRequired: 200, swatch: 'linear-gradient(135deg,#021408,#1a6e3c)'
  },
  dusk: {
    '--a1': '#0c0408', '--a2': '#14060f', '--a3': '#1e0a18',
    '--acc': '#e06898', '--acc-lt': '#f4a0c4', '--acc-dk': '#a03868',
    '--acc-g': 'rgba(224,104,152,0.10)', '--acc-gm': 'rgba(224,104,152,0.20)', '--acc-gl': 'rgba(224,104,152,0.36)',
    '--ink': '#f5e4ee', '--ink2': '#b87898', '--ink3': '#6a3050',
    '--ln': 'rgba(224,104,152,0.14)', '--ln2': 'rgba(224,104,152,0.24)',
    '--card': 'rgba(22,4,16,0.86)', '--card2': 'rgba(32,8,24,0.76)', '--nav': 'rgba(10,2,8,0.97)',
    '--up': '#78b898', '--up2': 'rgba(120,184,152,0.10)', '--dn': '#e07080', '--dn2': 'rgba(224,112,128,0.10)',
    '--r': '224', '--g': '104', '--b': '152',
    aurora: [.72, .22, .46], particle: [224, 104, 152], label: '🌸 Dusk', xpRequired: 400, swatch: 'linear-gradient(135deg,#1a0820,#e06898)'
  },
  abyss: {
    '--a1': '#000810', '--a2': '#000d1e', '--a3': '#00142e',
    '--acc': '#00c8f0', '--acc-lt': '#60e8ff', '--acc-dk': '#0088b0',
    '--acc-g': 'rgba(0,200,240,0.10)', '--acc-gm': 'rgba(0,200,240,0.20)', '--acc-gl': 'rgba(0,200,240,0.34)',
    '--ink': '#d0eeff', '--ink2': '#3a7898', '--ink3': '#0e3050',
    '--ln': 'rgba(0,180,220,0.14)', '--ln2': 'rgba(0,180,220,0.24)',
    '--card': 'rgba(0,10,24,0.90)', '--card2': 'rgba(0,16,36,0.80)', '--nav': 'rgba(0,5,14,0.98)',
    '--up': '#00d4a8', '--up2': 'rgba(0,212,168,0.10)', '--dn': '#e06070', '--dn2': 'rgba(224,96,112,0.10)',
    '--r': '0', '--g': '200', '--b': '240',
    aurora: [.00, .52, .78], particle: [0, 200, 240], label: '🌊 Abyss', xpRequired: 600, swatch: 'linear-gradient(135deg,#000d1a,#00c8f0)'
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
    aurora: [.878, .722, .251], particle: [224, 184, 64], label: '👑 Gold Prestige', xpRequired: 1000, swatch: 'linear-gradient(135deg,#1a1400,#c09020)'
  },
  obsidian: {
    '--a1': '#060608', '--a2': '#0a0a0e', '--a3': '#0e0e14',
    '--acc': '#9890b8', '--acc-lt': '#c0b8d8', '--acc-dk': '#605878',
    '--acc-g': 'rgba(152,144,184,0.08)', '--acc-gm': 'rgba(152,144,184,0.14)', '--acc-gl': 'rgba(152,144,184,0.24)',
    '--ink': '#e4e4ec', '--ink2': '#7878888', '--ink3': '#3a3a48',
    '--ln': 'rgba(255,255,255,0.06)', '--ln2': 'rgba(255,255,255,0.10)',
    '--card': 'rgba(14,14,20,0.88)', '--card2': 'rgba(20,20,30,0.78)', '--nav': 'rgba(6,6,10,0.98)',
    '--up': '#58b888', '--up2': 'rgba(88,184,136,0.10)', '--dn': '#b87880', '--dn2': 'rgba(184,120,128,0.10)',
    '--r': '152', '--g': '144', '--b': '184',
    aurora: [.46, .42, .56], particle: [152, 144, 184], label: '🖤 Obsidian', xpRequired: 800, swatch: 'linear-gradient(135deg,#0a0a0a,#303048)'
  },
  cream: {
    '--a1': '#faf6f0', '--a2': '#f5efe6', '--a3': '#efe8dc',
    '--acc': '#5848c8', '--acc-lt': '#7868e0', '--acc-dk': '#3828a0',
    '--acc-g': 'rgba(88,72,200,0.07)', '--acc-gm': 'rgba(88,72,200,0.12)', '--acc-gl': 'rgba(88,72,200,0.20)',
    '--ink': '#1c1828', '--ink2': '#5a5670', '--ink3': '#a8a4b8',
    '--ln': 'rgba(0,0,0,0.08)', '--ln2': 'rgba(0,0,0,0.14)',
    '--card': 'rgba(255,252,248,0.96)', '--card2': 'rgba(250,246,240,0.92)', '--nav': 'rgba(250,246,240,0.97)',
    '--up': '#1a9e6a', '--up2': 'rgba(26,158,106,0.10)', '--dn': '#d04858', '--dn2': 'rgba(208,72,88,0.10)',
    '--r': '88', '--g': '72', '--b': '200',
    aurora: [.20, .18, .50], particle: [88, 72, 200], label: '☀️ Light Cream', xpRequired: 300, swatch: 'linear-gradient(135deg,#f5efe6,#c8c0e8)'
  },
  hc: {
    '--a1': '#000000', '--a2': '#000000', '--a3': '#000000',
    '--acc': '#00ff88', '--acc-lt': '#60ffb0', '--acc-dk': '#00c060',
    '--acc-g': 'rgba(0,255,136,0.10)', '--acc-gm': 'rgba(0,255,136,0.20)', '--acc-gl': 'rgba(0,255,136,0.35)',
    '--ink': '#ffffff', '--ink2': '#cccccc', '--ink3': '#888888',
    '--ln': 'rgba(255,255,255,0.20)', '--ln2': 'rgba(255,255,255,0.35)',
    '--card': 'rgba(18,18,18,1.00)', '--card2': 'rgba(24,24,24,1.00)', '--nav': 'rgba(0,0,0,1.00)',
    '--up': '#00ff88', '--up2': 'rgba(0,255,136,0.12)', '--dn': '#ff4466', '--dn2': 'rgba(255,68,102,0.12)',
    '--r': '0', '--g': '255', '--b': '136',
    aurora: [.00, .00, .00], particle: [0, 255, 136], label: '⚡ High Contrast', xpRequired: 500, swatch: 'linear-gradient(135deg,#000000,#003320)'
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
  document.body.className = document.body.className.replace(/\btheme-\S+/g, '').trim();
  document.body.classList.add('theme-' + name);
  document.querySelectorAll('.th-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  // Update trigger button
  const ttSwatch = document.getElementById('ttSwatch');
  const ttName = document.getElementById('ttName');
  if (ttSwatch) ttSwatch.style.background = t.swatch;
  if (ttName) ttName.textContent = t.label.replace(/^\S+\s/, '');
  setTimeout(() => document.body.classList.remove('theme-transition'), 1400);
  showToast(t.label);
  if (document.getElementById('ap-forecast').style.display !== 'none') setTimeout(drawForecast, 100);
};

/* ── MONTHS ──────────────────────────────────────────────── */
const MONTH_LABELS = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
const MONTH_KEYS   = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'];
let activeMonth = 'Mar';

MONTH_LABELS.forEach((m, i) => {
  const el = document.createElement('div');
  el.className = 'mo' + (i === 5 ? ' on' : '');
  el.textContent = m + (i < 3 ? " '24" : " '25");
  el.onclick = () => {
    document.querySelectorAll('.mo').forEach(x => x.classList.remove('on'));
    el.classList.add('on');
    haptic(8);
    activeMonth = MONTH_KEYS[i];
    filterByMonth(activeMonth);
  };
  document.getElementById('mpills').appendChild(el);
});

window.filterByMonth = function (month) {
  const filtered = STORE.transactions.filter(tx => tx.date && tx.date.includes(month));
  renderTxList(filtered.length > 0 ? filtered : STORE.transactions);
  if (filtered.length === 0) showToast('No transactions for ' + month);
};

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
window.renderTxList = function (txs = STORE.transactions) {
  const list = document.getElementById('txList');
  const recent = document.getElementById('recentTxList');
  list.innerHTML = '';
  recent.innerHTML = '';
  if (txs.length === 0) {
    const msg = STORE.transactions.length === 0 ? 'Tap + to add one or import a CSV' : 'No transactions match your search';
    list.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;gap:12px"><div style="font-size:36px">📭</div><div style="font-size:13px;font-weight:400;color:var(--ink);font-family:'Poppins',sans-serif">${STORE.transactions.length === 0 ? 'No transactions yet' : 'Nothing found'}</div><div style="font-size:11px;color:var(--ink3);font-family:'Poppins',sans-serif;text-align:center">${msg}</div></div>`;
    return;
  }
  const groups = {};
  txs.forEach(tx => {
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

window.searchTx = function (q) {
  const query = q.toLowerCase().trim();
  if (!query) { renderTxList(); return; }
  const filtered = STORE.transactions.filter(tx =>
    tx.name.toLowerCase().includes(query) || tx.cat.toLowerCase().includes(query)
  );
  renderTxList(filtered);
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
  return `<div class="tx-wrap" data-id="${tx.id}"><div class="tx-actions"><div class="tx-act dup" onclick="dupTx(${tx.id})"><svg viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg></div><div class="tx-act del" onclick="delTx(${tx.id})"><svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg></div></div><div class="tx" onclick="editTx(${tx.id})" ontouchstart="swipeStart(event,this)" ontouchmove="swipeMove(event,this)" ontouchend="swipeEnd(event,this)"><div class="tx-ico" style="${tx.cat === 'income' ? 'background:var(--up2)' : ''}">${tx.ico}</div><div class="tx-info"><div class="tx-name">${tx.name}</div><div class="tx-cat">${tx.cat}</div></div><div class="tx-amt" style="color:${c}">${s}${amt}</div></div></div>`;
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
  if (IS_CONNECTED) {
    import('./api.js').then(({ Transactions }) => Transactions.remove(id).catch(() => {}));
  }
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

window.openModal = function (desc = '', cat = 'food', amt = 0, type = 'e') {
  selCat = cat;
  txT = type;
  document.getElementById('tbE').className = 'tt' + (type === 'e' ? ' exp' : '');
  document.getElementById('tbI').className = 'tt' + (type === 'i' ? ' inc' : '');
  document.getElementById('amtN').textContent = amt ? amt.toFixed(2) : '0.00';
  const d = document.getElementById('descN');
  d.textContent = desc || 'What was this for?';
  d.style.color = desc ? 'var(--ink)' : 'var(--ink3)';
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  document.getElementById('modalDate').textContent = `${yyyy}-${mm}-${dd}`;
  document.getElementById('modal').style.display = 'flex';
  buildCats();
};

window.closeModal = function () {
  document.getElementById('modal').style.display = 'none';
  editingTxId = null;
  document.getElementById('modalSaveBtn').textContent = 'Save';
};

let editingTxId = null;

window.editTx = function (id) {
  const tx = STORE.transactions.find(t => t.id === id);
  if (!tx) return;
  editingTxId = id;
  const type = tx.amt >= 0 ? 'i' : 'e';
  openModal(tx.name, tx.cat, Math.abs(tx.amt), type);
  document.getElementById('modalSaveBtn').textContent = 'Update';
};

window.saveTx = async function () {
  haptic(20);
  const amt = parseFloat(document.getElementById('amtN').textContent);
  const desc = document.getElementById('descN').textContent;
  const catObj = CATS.find(c => c.id === selCat);
  const finalAmt = txT === 'e' ? -amt : amt;
  const finalName = desc === 'What was this for?' ? catObj.l : desc;
  if (editingTxId !== null) {
    const tx = STORE.transactions.find(t => t.id === editingTxId);
    if (tx) { tx.name = finalName; tx.cat = selCat; tx.ico = catObj.e; tx.amt = finalAmt; }
    if (IS_CONNECTED) {
      const { Transactions } = await import('./api.js');
      await Transactions.update(editingTxId, { name: finalName, category: selCat, icon: catObj.e, amount: Math.abs(finalAmt), is_income: txT === 'i' }).catch(() => {});
    }
    renderTxList();
    closeModal();
    showToast('Updated · ✓');
    return;
  }
  const localTx = {
    id: Date.now(),
    name: finalName,
    cat: selCat, ico: catObj.e,
    amt: finalAmt,
    date: 'Today'
  };
  STORE.transactions.unshift(localTx);
  if (IS_CONNECTED) {
    const { Transactions } = await import('./api.js');
    Transactions.create({
      name: finalName,
      category: selCat,
      icon: catObj.e,
      amount: Math.abs(finalAmt),
      is_income: txT === 'i',
      date: document.getElementById('modalDate').textContent,
    }).then(created => {
      // Replace local ID with server ID
      const idx = STORE.transactions.findIndex(t => t.id === localTx.id);
      if (idx >= 0) STORE.transactions[idx].id = created.id;
    }).catch(() => {});
  }
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

/* ── CSV IMPORT ──────────────────────────────────────────── */
(function () {
  let parsedRows = [];
  let parsedHeaders = [];

  // ── Open / Close ──
  window.openCsvImport = function () {
    haptic(8);
    document.getElementById('csvImport').style.display = 'flex';
    document.getElementById('csvPreview').style.display = 'none';
    document.getElementById('csvDrop').style.display = 'flex';
    document.getElementById('csvFileInput').value = '';
    parsedRows = [];
    parsedHeaders = [];
  };

  window.closeCsvImport = function () {
    document.getElementById('csvImport').style.display = 'none';
  };

  // ── Drag & Drop ──
  const drop = document.getElementById('csvDrop');
  drop.addEventListener('dragover', e => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', e => {
    e.preventDefault();
    drop.classList.remove('over');
    const file = e.dataTransfer.files[0];
    if (file) handleCsvFile(file);
  });

  // ── Parse CSV (handles quoted fields) ──
  function parseCsv(text) {
    const lines = text.trim().split(/\r?\n/);
    return lines.map(line => {
      const cols = [];
      let cur = '', inQ = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') { inQ = !inQ; }
        else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
        else { cur += ch; }
      }
      cols.push(cur.trim());
      return cols;
    });
  }

  // ── Detect columns by header names ──
  function detectColumns(headers) {
    const h = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
    const find = (keywords) => h.findIndex(col => keywords.some(k => col.includes(k)));
    return {
      nameIdx:  find(['description', 'name', 'payee', 'merchant', 'details', 'narrative']),
      amtIdx:   find(['amount', 'value', 'amounteur', 'debit', 'credit', 'sum']),
      dateIdx:  find(['date', 'completeddate', 'valuedate', 'bookingdate', 'time']),
    };
  }

  // ── Populate column selector dropdowns ──
  function populateSelects(headers, detected) {
    ['csvMapName', 'csvMapAmt', 'csvMapDate'].forEach(id => {
      const sel = document.getElementById(id);
      sel.innerHTML = headers.map((h, i) => `<option value="${i}">${h || 'Col ' + (i+1)}</option>`).join('');
    });
    if (detected.nameIdx >= 0)  document.getElementById('csvMapName').value = detected.nameIdx;
    if (detected.amtIdx  >= 0)  document.getElementById('csvMapAmt').value  = detected.amtIdx;
    if (detected.dateIdx >= 0)  document.getElementById('csvMapDate').value  = detected.dateIdx;
  }

  // ── Render preview table (first 12 data rows) ──
  function renderPreview(headers, rows) {
    const preview = rows.slice(0, 12);
    const table = document.getElementById('csvTable');
    table.innerHTML =
      '<thead><tr>' + headers.map(h => `<th>${h || '—'}</th>`).join('') + '</tr></thead>' +
      '<tbody>' + preview.map((row, ri) =>
        `<tr class="${ri < 3 ? 'highlight' : ''}">${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
      ).join('') + '</tbody>';
  }

  // ── Handle file read ──
  window.handleCsvFile = function (file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      const all = parseCsv(e.target.result);
      if (all.length < 2) { showToast('CSV appears empty'); return; }
      parsedHeaders = all[0];
      parsedRows = all.slice(1).filter(r => r.some(c => c));
      const detected = detectColumns(parsedHeaders);
      populateSelects(parsedHeaders, detected);
      renderPreview(parsedHeaders, parsedRows);
      document.getElementById('csvDrop').style.display = 'none';
      document.getElementById('csvPreview').style.display = 'flex';
      document.getElementById('csvPreview').style.flexDirection = 'column';
      const count = Math.min(parsedRows.length, 500);
      document.getElementById('csvConfirmBtn').textContent = `Import ${count} transaction${count !== 1 ? 's' : ''}`;
    };
    reader.readAsText(file);
  };

  // ── Confirm import ──
  window.confirmCsvImport = function () {
    const nameIdx = parseInt(document.getElementById('csvMapName').value);
    const amtIdx  = parseInt(document.getElementById('csvMapAmt').value);
    const dateIdx = parseInt(document.getElementById('csvMapDate').value);

    const catGuess = (name) => {
      const n = name.toLowerCase();
      if (/uber|bolt|taxi|transport|train|bus|tfl/.test(n)) return { cat: 'uber', ico: '🚗' };
      if (/spotify|netflix|apple|amazon|subscription|sub/.test(n)) return { cat: 'subs', ico: '📱' };
      if (/lidl|aldi|tesco|sainsbury|grocery|supermarket/.test(n)) return { cat: 'groceries', ico: '🛒' };
      if (/restaurant|cafe|coffee|food|deliveroo|just eat|pizza/.test(n)) return { cat: 'food', ico: '🍕' };
      if (/rent|landlord|housing/.test(n)) return { cat: 'rent', ico: '🏠' };
      if (/salary|payroll|income|wage/.test(n)) return { cat: 'income', ico: '💰' };
      if (/pharmacy|doctor|health|gym/.test(n)) return { cat: 'health', ico: '💊' };
      return { cat: 'other', ico: '📦' };
    };

    const imported = parsedRows.slice(0, 500).map(row => {
      const name = row[nameIdx] || 'Unknown';
      const rawAmt = parseFloat((row[amtIdx] || '0').replace(/[^0-9.\-]/g, '')) || 0;
      const date = row[dateIdx] || 'Imported';
      const { cat, ico } = catGuess(name);
      return { id: Date.now() + Math.random(), name, cat, ico, amt: rawAmt, date };
    }).filter(tx => tx.amt !== 0);

    STORE.transactions.unshift(...imported);
    renderTxList();
    closeCsvImport();
    haptic(20);
    showToast(`${imported.length} transactions imported`);
  };
})();

/* ── THEME PICKER ────────────────────────────────────────── */
(function () {
  const USER_XP = 680;

  function buildList() {
    const list = document.getElementById('tpList');
    list.innerHTML = '';
    Object.entries(THEMES).forEach(([key, t]) => {
      const locked = t.xpRequired > USER_XP;
      const active = key === currentTheme;
      const row = document.createElement('div');
      row.className = 'tp-row' + (active ? ' active' : '') + (locked ? ' locked' : '');
      row.innerHTML = `
        <div class="tp-swatch" style="background:${t.swatch}"></div>
        <div class="tp-info">
          <div class="tp-name">${t.label}</div>
          ${locked ? `<div class="tp-xp">🔒 Unlock at ${t.xpRequired} xp</div>` : '<div class="tp-xp">Unlocked</div>'}
        </div>
        ${active ? '<div class="tp-check">✓</div>' : ''}
        ${locked ? '<div class="tp-lock"><svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></div>' : ''}
      `;
      row.onclick = () => {
        if (locked) { haptic(8); showToast(`Need ${t.xpRequired - USER_XP} more xp to unlock`); return; }
        setTheme(key);
        closeThemePicker();
        buildList();
      };
      list.appendChild(row);
    });
  }

  window.openThemePicker = function () {
    haptic(8);
    buildList();
    document.getElementById('themePicker').style.display = 'flex';
  };

  window.closeThemePicker = function () {
    document.getElementById('themePicker').style.display = 'none';
  };

  // Init trigger button on load
  const t = THEMES[currentTheme];
  const ttSwatch = document.getElementById('ttSwatch');
  const ttName = document.getElementById('ttName');
  if (ttSwatch) ttSwatch.style.background = t.swatch;
  if (ttName) ttName.textContent = t.label.replace(/^\S+\s/, '');
})();
