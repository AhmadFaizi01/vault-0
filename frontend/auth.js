/* ============================================================
   auth.js — Login / register gate
   Injected before app boots when no token is present.
   ============================================================ */
import { Auth } from './api.js';

export function showAuthGate() {
  const gate = document.createElement('div');
  gate.id = 'auth-gate';
  gate.innerHTML = `
    <style>
      #auth-gate {
        position: fixed; inset: 0; z-index: 9999;
        background: var(--a1);
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        padding: 32px 28px;
        font-family: 'Poppins', sans-serif;
      }
      #auth-gate .ag-logo {
        font-family: 'Cormorant', serif;
        font-size: 72px; color: var(--acc);
        margin-bottom: 8px; line-height: 1;
      }
      #auth-gate .ag-name {
        font-family: 'Cormorant', serif;
        font-size: 38px; font-weight: 300;
        color: var(--ink); letter-spacing: -1px;
        margin-bottom: 6px;
      }
      #auth-gate .ag-sub {
        font-size: 11px; color: var(--ink3);
        letter-spacing: 2px; text-transform: uppercase;
        margin-bottom: 40px;
      }
      #auth-gate .ag-tabs {
        display: flex; gap: 0; width: 100%; max-width: 320px;
        background: var(--card); border-radius: 12px;
        border: 1px solid var(--ln); margin-bottom: 20px;
        overflow: hidden;
      }
      #auth-gate .ag-tab {
        flex: 1; padding: 10px; text-align: center;
        font-size: 12px; color: var(--ink3); cursor: pointer;
        transition: all .2s;
      }
      #auth-gate .ag-tab.on {
        background: var(--acc-g); color: var(--acc);
      }
      #auth-gate input {
        width: 100%; max-width: 320px;
        background: var(--card); border: 1px solid var(--ln2);
        border-radius: 12px; padding: 14px 16px;
        color: var(--ink); font-size: 14px;
        font-family: 'Poppins', sans-serif;
        margin-bottom: 10px; outline: none;
        -webkit-appearance: none; box-sizing: border-box;
      }
      #auth-gate input:focus { border-color: var(--acc); }
      #auth-gate input::placeholder { color: var(--ink3); }
      #auth-gate .ag-btn {
        width: 100%; max-width: 320px;
        background: linear-gradient(135deg, var(--acc-dk), var(--acc));
        border: none; border-radius: 14px;
        padding: 15px; font-size: 13px; font-weight: 500;
        color: #fff; cursor: pointer; margin-top: 6px;
        letter-spacing: .5px; font-family: 'Poppins', sans-serif;
        transition: opacity .2s;
      }
      #auth-gate .ag-btn:active { opacity: .8; }
      #auth-gate .ag-err {
        font-size: 11px; color: var(--dn);
        margin-top: 8px; text-align: center; max-width: 320px;
        min-height: 18px;
      }
    </style>
    <div class="ag-logo">✦</div>
    <div class="ag-name">Vault</div>
    <div class="ag-sub">Personal Finance</div>

    <div class="ag-tabs">
      <div class="ag-tab on" id="ag-tab-login" onclick="agSwitchTab('login')">Sign In</div>
      <div class="ag-tab" id="ag-tab-register" onclick="agSwitchTab('register')">Create Account</div>
    </div>

    <div id="ag-login">
      <input id="ag-login-email"    type="email"    placeholder="Email" autocomplete="email" />
      <input id="ag-login-pass"     type="password" placeholder="Password" autocomplete="current-password" />
      <button class="ag-btn" onclick="agLogin()">Sign In</button>
    </div>

    <div id="ag-register" style="display:none">
      <input id="ag-reg-name"   type="text"     placeholder="Your name" autocomplete="name" />
      <input id="ag-reg-email"  type="email"    placeholder="Email" autocomplete="email" />
      <input id="ag-reg-pass"   type="password" placeholder="Password (min 6 chars)" autocomplete="new-password" />
      <input id="ag-reg-budget" type="number"   placeholder="Monthly budget (e.g. 1500)" />
      <button class="ag-btn" onclick="agRegister()">Create Account</button>
    </div>

    <div class="ag-err" id="ag-err"></div>
  `;
  document.body.appendChild(gate);
}

function agErr(msg) {
  document.getElementById('ag-err').textContent = msg;
}

window.agSwitchTab = function (tab) {
  document.getElementById('ag-login').style.display    = tab === 'login'    ? 'contents' : 'none';
  document.getElementById('ag-register').style.display = tab === 'register' ? 'contents' : 'none';
  document.getElementById('ag-tab-login').classList.toggle('on',    tab === 'login');
  document.getElementById('ag-tab-register').classList.toggle('on', tab === 'register');
  document.getElementById('ag-err').textContent = '';
};

window.agLogin = async function () {
  const email = document.getElementById('ag-login-email').value.trim();
  const pass  = document.getElementById('ag-login-pass').value;
  if (!email || !pass) { agErr('Please fill in all fields'); return; }
  try {
    await Auth.login(email, pass);
    document.getElementById('auth-gate').remove();
  } catch (e) {
    agErr(e.message || 'Login failed');
  }
};

window.agRegister = async function () {
  const name   = document.getElementById('ag-reg-name').value.trim();
  const email  = document.getElementById('ag-reg-email').value.trim();
  const pass   = document.getElementById('ag-reg-pass').value;
  const budget = parseFloat(document.getElementById('ag-reg-budget').value) || 1500;
  if (!name || !email || !pass) { agErr('Please fill in all fields'); return; }
  if (pass.length < 6)          { agErr('Password must be at least 6 characters'); return; }
  try {
    await Auth.register(name, email, pass, 'EUR', '€', budget);
    document.getElementById('auth-gate').remove();
  } catch (e) {
    agErr(e.message || 'Registration failed');
  }
};
