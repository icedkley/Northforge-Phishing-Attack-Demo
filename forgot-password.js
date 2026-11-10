// Forgot password — demo only. No email is sent; no backend exists.
// Key security idea: the response is IDENTICAL whether or not the email
// is registered (prevents account enumeration).

const form = document.getElementById('forgotForm');
const emailInput = document.getElementById('resetEmail');
const emailErr = document.getElementById('resetEmailError');
const forgotBtn = document.getElementById('forgotBtn');

const stepRequest = document.getElementById('stepRequest');
const stepDone = document.getElementById('stepDone');

emailInput.addEventListener('blur', () => {
  const r = Validation.validateEmail(emailInput.value, { domain: 'northfield.edu' });
  Validation.setFieldError(emailInput, emailErr, r.ok ? '' : r.error);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const r = Validation.validateEmail(emailInput.value, { domain: 'northfield.edu' });
  Validation.setFieldError(emailInput, emailErr, r.ok ? '' : r.error);
  if (!r.ok) return;

  forgotBtn.disabled = true;
  forgotBtn.textContent = 'Sending…';

  // Simulate a round-trip, then ALWAYS show the same generic confirmation.
  setTimeout(() => {
    stepRequest.style.display = 'none';
    stepDone.style.display = 'block';
    // For the demo only: remember which email was used, to show in DevTools.
    sessionStorage.setItem('lastResetRequest', r.value);
  }, 700);
});