// Attacker clone — educational simulation only.
// Captures credentials into sessionStorage (never sent anywhere),
// fakes a successful login to avoid suspicion, then hands the user to
// a fake dashboard whose only exit is the debrief reveal.

const phishForm = document.getElementById('phishForm');
const phishBtn = document.getElementById('phishBtn');
const phishMsg = document.getElementById('phishMsg');
const phishEmail = document.getElementById('phishEmail');
const phishPass = document.getElementById('phishPass');
const phishEmailErr = document.getElementById('phishEmailError');
const phishPassErr = document.getElementById('phishPassError');
const phishForgot = document.getElementById('phishForgot');

/* ---------- The clone "validates" too — but only shallowly ----------
   Teaching point: the clone checks the email FORMAT (to look professional)
   but does NOT enforce password strength, because the attacker wants ANY
   password the victim types. The real site enforces strength at signup. */

phishEmail.addEventListener('blur', () => {
  const r = Validation.validateEmail(phishEmail.value, { domain: 'northfield.edu' });
  Validation.setFieldError(phishEmail, phishEmailErr, r.ok ? '' : r.error);
});

phishForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const emailRes = Validation.validateEmail(phishEmail.value, { domain: 'northfield.edu' });
  const passOk = phishPass.value.length > 0;

  Validation.setFieldError(phishEmail, phishEmailErr, emailRes.ok ? '' : emailRes.error);
  Validation.setFieldError(phishPass, phishPassErr, passOk ? '' : 'Password is required.');
  if (!emailRes.ok || !passOk) return;

  phishBtn.disabled = true;
  phishBtn.textContent = 'Signing in…';

  // Capture (locally only) — sanitized email, raw password
  sessionStorage.setItem('phishEmail', emailRes.value);
  sessionStorage.setItem('phishPassword', phishPass.value);
  sessionStorage.setItem('phishTimestamp', new Date().toLocaleString());

  // FAKE SUCCESS
  setTimeout(() => {
    phishBtn.textContent = 'Success! Redirecting…';
    setTimeout(() => { window.location.href = 'dashbord.html'; }, 700);
  }, 900);
});

/* ---------- Fake forgot-password: harvests more addresses ----------
   Attackers clone the reset page too, to collect emails (and sometimes
   to phish the reset token). Here we just capture the email locally. */

phishForgot.addEventListener('click', function (e) {
  e.preventDefault();

  const email = Validation.sanitizeEmail(phishEmail.value);

  if (!email || !Validation.validateEmail(email).ok) {
    Validation.setFieldError(phishEmail, phishEmailErr, 'Enter your email to reset your password.');
    return;
  }

  sessionStorage.setItem('phishForgotEmail', email);

  phishMsg.textContent = '📧 If an account exists, a reset link has been sent.';
  phishMsg.className = 'form-msg show ok';
});