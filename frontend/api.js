/* ============================================================
   api.js — Vault API client
   All backend calls go through this module.
   Falls back to localStorage (offline / demo mode) when no
   API_BASE is set or the server is unreachable.
   ============================================================ */

const API_BASE = window.VAULT_API_BASE || '';

// ── Token management ─────────────────────────────────────────

const Token = {
  get()        { return localStorage.getItem('vault_token'); },
  set(t)       { localStorage.setItem('vault_token', t); },
  clear()      { localStorage.removeItem('vault_token'); },
};

// ── Base fetch wrapper ────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const token = Token.get();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(API_BASE + path, { ...options, headers });

  if (res.status === 401) {
    Token.clear();
    // Reload so the auth gate shows
    location.reload();
    return;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data;
}

const get  = (path)        => apiFetch(path, { method: 'GET' });
const post = (path, body)  => apiFetch(path, { method: 'POST',   body: JSON.stringify(body) });
const put  = (path, body)  => apiFetch(path, { method: 'PUT',    body: JSON.stringify(body) });
const del  = (path)        => apiFetch(path, { method: 'DELETE' });

// ── Auth ──────────────────────────────────────────────────────

export const Auth = {
  async register(name, email, password, currencyCode = 'EUR', currencySymbol = '€', monthlyBudget = 1500) {
    const data = await post('/api/auth/register', { name, email, password, currency_code: currencyCode, currency_symbol: currencySymbol, monthly_budget: monthlyBudget });
    Token.set(data.token);
    return data.user;
  },

  async login(email, password) {
    const data = await post('/api/auth/login', { email, password });
    Token.set(data.token);
    return data.user;
  },

  logout() {
    Token.clear();
    location.reload();
  },

  me()              { return get('/api/auth/me'); },
  updateMe(updates) { return put('/api/auth/me', updates); },
  isLoggedIn()      { return !!Token.get(); },
};

// ── Transactions ──────────────────────────────────────────────

export const Transactions = {
  list(params = {}) {
    const qs = new URLSearchParams(params).toString();
    return get('/api/transactions' + (qs ? '?' + qs : ''));
  },
  create(tx)    { return post('/api/transactions', tx); },
  update(id, d) { return put(`/api/transactions/${id}`, d); },
  remove(id)    { return del(`/api/transactions/${id}`); },
  import(txs)   { return post('/api/transactions/import', { transactions: txs }); },
};

// ── Subscriptions ─────────────────────────────────────────────

export const Subscriptions = {
  list()        { return get('/api/subscriptions'); },
  create(sub)   { return post('/api/subscriptions', sub); },
  update(id, d) { return put(`/api/subscriptions/${id}`, d); },
  remove(id)    { return del(`/api/subscriptions/${id}`); },
};

// ── Goals ─────────────────────────────────────────────────────

export const Goals = {
  list()        { return get('/api/goals'); },
  create(goal)  { return post('/api/goals', goal); },
  update(id, d) { return put(`/api/goals/${id}`, d); },
  remove(id)    { return del(`/api/goals/${id}`); },
};

// ── Budgets ───────────────────────────────────────────────────

export const Budgets = {
  list(month)   { return get('/api/budgets' + (month ? `?month=${month}` : '')); },
  create(b)     { return post('/api/budgets', b); },
  update(id, d) { return put(`/api/budgets/${id}`, d); },
  remove(id)    { return del(`/api/budgets/${id}`); },
};

// ── Insights ──────────────────────────────────────────────────

export const Insights = {
  get(month) { return get('/api/insights' + (month ? `?month=${month}` : '')); },
};
