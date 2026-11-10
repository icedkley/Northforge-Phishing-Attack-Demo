// Registration — demo only. Stores a salted hash in localStorage.
// ⚠️ Real apps must do this server-side with Argon2id/bcrypt.

const USERS_KEY = 'demoUsers';

const form = document.getElementById('registerForm');
const nameInput = document.getElementById('regName');
const emailInput = document.getElementById('regEmail');
const passInput = document.getElementById('regPass');
const pass2Input = document.getElementById('regPass2');
const termsBox = document.getElementById('regTerms');
const regBtn = document.getElementById('regBtn');
const regMsg = document.getElementById('regMsg');

const nameErr = document.getElementById('regNameError');
const emailErr = document.getElementById('regEmailError');
const passErr = document.getElementById('regPassError');
const pass2Err = document.getElementById('regPass2Error');
const termsErr = document.getElementById('regTermsError');

const strengthWrap = document.getElementById('strengthWrap');
const strengthBar = document.getElementById('strengthBar');
const strengthLabel = document.getElementById('strengthLabel');

const COLORS = ['#d32f2f', '#d32f2f', '#f9a825', '#f9a825', '#2e7d32', '#0b3d2e'];
const LABELS = ['—', 'Very weak', 'Weak', 'Fair', 'Strong', 'Very strong'];

/* ---------- Live strength meter ---------- */
passInput.addEventListener('input', () => {
  const pw = passInput.value;
  if (!pw) { strengthWrap.classList.remove('show'); return; }
  strengthWrap.classList.add('show');
  const score = Validation.passwordScore(pw);
  strengthBar.style.width = (score / 5 * 100) + '%';
  strengthBar.style.background = COLORS[score];
  strengthLabel.textContent = 'Strength: ' + LABELS[score];
  strengthLabel.style.color = COLORS[score];
});

/* ---------- Blur validation ---------- */
nameInput.addEventListener('blur', () => {
  const r = Validation.validateName(nameInput.value);
  Validation.setFieldError(nameInput, nameErr, r.ok ? '' : r.error);
});
emailInput.addEventListener('blur', () => {
  const r = Validation.validateEmail(emailInput.value, { domain: 'northfield.edu' });
  Validation.setFieldError(emailInput, emailErr, r.ok ? '' : r.error);
});
passInput.addEventListener('blur', () => {
  const r = Validation.validatePassword(passInput.value);
  Validation.setFieldError(passInput, passErr, r.ok ? '' : r.error);
});
pass2Input.addEventListener('blur', () => {
  const r = Validation.validateMatch(passInput.value, pass2Input.value);
  Validation.setFieldError(pass2Input, pass2Err, r.ok ? '' : r.error);
});

/* ---------- Submit ---------- */
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nameRes = Validation.validateName(nameInput.value);
  const emailRes = Validation.validateEmail(emailInput.value, { domain: 'northfield.edu' });
  const passRes = Validation.validatePassword(passInput.value);
  const matchRes = Validation.validateMatch(passInput.value, pass2Input.value);

  Validation.setFieldError(nameInput, nameErr, nameRes.ok ? '' : nameRes.error);
  Validation.setFieldError(emailInput, emailErr, emailRes.ok ? '' : emailRes.error);
  Validation.setFieldError(passInput, passErr, passRes.ok ? '' : passRes.error);
  Validation.setFieldError(pass2Input, pass2Err, matchRes.ok ? '' : matchRes.error);

  let termsOk = termsBox.checked;
  termsErr.textContent = termsOk ? '' : 'Please confirm you understand this is a demo.';
  termsErr.classList.toggle('show', !termsOk);

  if (!nameRes.ok || !emailRes.ok || !passRes.ok || !matchRes.ok || !termsOk) return;

  // Duplicate check (case-insensitive, sanitized)
  const users = readUsers();
  if (users.some(u => Validation.sanitizeEmail(u.email) === emailRes.value)) {
    Validation.setFieldError(emailInput, emailErr, 'An account with this email already exists.');
    return;
  }

  regBtn.disabled = true;
  regBtn.textContent = 'Creating account…';

  const salt = Validation.randomSalt();
  const hash = await Validation.hashPassword(passRes.value, salt);

  users.push({
    name: nameRes.value,
    email: emailRes.value,
    salt,
    hash,
    createdAt: new Date().toISOString()
  });

  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (_) {
    regBtn.disabled = false;
    regBtn.textContent = 'Create Account';
    regMsg.textContent = 'Could not save the account (storage unavailable).';
    regMsg.className = 'form-msg show err';
    return;
  }

  regMsg.textContent = '✅ Account created. Redirecting to sign in…';
  regMsg.className = 'form-msg show ok';

  sessionStorage.setItem('flash', JSON.stringify({
    type: 'ok',
    message: '✅ Account created. Please sign in.'
  }));

  setTimeout(() => { window.location.href = 'index.html'; }, 900);
});

function readUsers() {
  try {
    const raw = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter(u => u && typeof u === 'object') : [];
  } catch (_) {
    return [];
  }
}