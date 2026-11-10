// Legitimate demo portal — local only, no network requests.
// ⚠️ Demo-grade only. Real apps validate + hash on the server.

const DEMO_USER = { email: 'student@northfield.edu', password: 'demo1234', name: 'Demo Student' };
const USERS_KEY = 'demoUsers';
const LOCK_KEY = 'loginLock';
const MAX_ATTEMPTS = 5;
const LOCK_MS = 30 * 1000;

const legitForm = document.getElementById('legitForm');
const emailInput = document.getElementById('studentEmail');
const passInput = document.getElementById('studentPass');
const emailErr = document.getElementById('studentEmailError');
const passErr = document.getElementById('studentPassError');
const rememberBox = document.getElementById('rememberMe');
const legitBtn = document.getElementById('legitBtn');
const formMsg = document.getElementById('formMsg');

/* ---------- Remember-me: email only, never the password ---------- */
const remembered = localStorage.getItem('rememberedEmail');
if (remembered) {
  emailInput.value = remembered;
  if (rememberBox) rememberBox.checked = true;
}

/* ---------- Flash message from previous page (register/logout) ---------- */
const flash = sessionStorage.getItem('flash');
if (flash) {
  try {
    const { type, message } = JSON.parse(flash);
    showMsg(message, type === 'error');
  } catch (_) { /* ignore malformed */ }
  sessionStorage.removeItem('flash');
}

/* ---------- Live validation on blur ---------- */
emailInput.addEventListener('blur', () => {
  const r = Validation.validateEmail(emailInput.value, { domain: 'northfield.edu' });
  Validation.setFieldError(emailInput, emailErr, r.ok ? '' : r.error);
});

passInput.addEventListener('blur', () => {
  Validation.setFieldError(passInput, passErr, passInput.value ? '' : 'Password is required.');
});

/* ---------- Submit ---------- */
legitForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // 1) Lockout check
  if (isLocked()) {
    showMsg(`Too many failed attempts. Try again in ${secondsLeft()}s.`, true);
    return;
  }

  // 2) Validate + sanitize
  const emailRes = Validation.validateEmail(emailInput.value, { domain: 'northfield.edu' });
  const passRes = passInput.value
    ? { ok: true }
    : { ok: false, error: 'Password is required.' };

  Validation.setFieldError(emailInput, emailErr, emailRes.ok ? '' : emailRes.error);
  Validation.setFieldError(passInput, passErr, passRes.ok ? '' : passRes.error);
  if (!emailRes.ok || !passRes.ok) return;

  const email = emailRes.value;
  const password = passInput.value;

  // 3) Verify
  legitBtn.disabled = true;
  legitBtn.textContent = 'Verifying…';

  const user = findUser(email);
  let ok = false;
  if (user) {
    ok = (await Validation.hashPassword(password, user.salt)) === user.hash;
  } else if (email === DEMO_USER.email && password === DEMO_USER.password) {
    ok = true; // built-in demo account (plaintext by design for the demo)
  }

  legitBtn.disabled = false;
  legitBtn.textContent = 'Sign In';

  // 4) Result
  if (ok) {
    clearAttempts();
    sessionStorage.setItem('uniLoggedIn', 'true');
    sessionStorage.setItem('uniEmail', email);
    sessionStorage.setItem('uniName', user ? user.name : DEMO_USER.name);

    if (rememberBox && rememberBox.checked) localStorage.setItem('rememberedEmail', email);
    else localStorage.removeItem('rememberedEmail');

    showMsg('✅ Login successful. Redirecting…', false);
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 700);
  } else {
    recordAttempt();
    // Generic message — never reveal whether the email exists (anti-enumeration)
    showMsg('❌ Invalid email or password.', true);
  }
});

/* ---------- Helpers ---------- */

function findUser(email) {
  try {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    if (!Array.isArray(users)) return null;
    return users.find(u => u && typeof u.email === 'string' &&
      Validation.sanitizeEmail(u.email) === email) || null;
  } catch (_) {
    return null;
  }
}

function showMsg(message, isError) {
  formMsg.textContent = message;
  formMsg.className = 'form-msg show ' + (isError ? 'err' : 'ok');
}

function lockState() {
  try { return JSON.parse(localStorage.getItem(LOCK_KEY) || '{}'); }
  catch (_) { return {}; }
}
function isLocked() {
  const s = lockState();
  return !!(s.until && Date.now() < s.until);
}
function secondsLeft() {
  const s = lockState();
  return s.until ? Math.ceil((s.until - Date.now()) / 1000) : 0;
}
function recordAttempt() {
  const s = lockState();
  const count = (s.count || 0) + 1;
  const until = count >= MAX_ATTEMPTS ? Date.now() + LOCK_MS : 0;
  localStorage.setItem(LOCK_KEY, JSON.stringify({ count, until }));
}
function clearAttempts() {
  localStorage.removeItem(LOCK_KEY);
}