/* validation.js — shared client-side validation & sanitization helpers.
   ⚠️ CLIENT-SIDE VALIDATION IS UX ONLY. A real server MUST re-validate and
   re-sanitize every field. Never trust the browser. */

const Validation = (() => {
  /* ---------------- Sanitization ---------------- */

  // Normalize, strip control characters, collapse whitespace, trim.
  function sanitizeText(value) {
    if (typeof value !== 'string') return '';
    return value
      .normalize('NFKC')
      .replace(/[\u0000-\u001F\u007F]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function sanitizeEmail(value) {
    return sanitizeText(value).toLowerCase();
  }

  // Escape when you MUST inject into HTML. Prefer textContent instead.
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, s => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
  }

  /* ---------------- Validators ---------------- */

  const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

  function validateEmail(raw, { domain = null, required = true } = {}) {
    const email = sanitizeEmail(raw);
    if (!email) return required
      ? { ok: false, error: 'Email is required.' }
      : { ok: true, value: '' };
    if (email.length > 254) return { ok: false, error: 'Email is too long.' };
    if (!EMAIL_RE.test(email)) return { ok: false, error: 'Enter a valid email address.' };
    if (domain && !email.endsWith('@' + domain)) {
      return { ok: false, error: `Please use your @${domain} address.` };
    }
    return { ok: true, value: email };
  }

  function validateName(raw) {
    const name = sanitizeText(raw);
    if (!name) return { ok: false, error: 'Full name is required.' };
    if (name.length < 2) return { ok: false, error: 'Name is too short.' };
    if (name.length > 60) return { ok: false, error: 'Name is too long (max 60).' };
    // Letters (any script), spaces, apostrophes, hyphens, periods
    if (!/^\p{L}[\p{L}\s.'-]*$/u.test(name)) {
      return { ok: false, error: 'Name contains invalid characters.' };
    }
    return { ok: true, value: name };
  }

  function passwordScore(pw) {
    if (!pw) return 0;
    let score = 0;
    if (pw.length >= 10) score++;
    if (pw.length >= 14) score++;
    if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
    if (/\d/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return Math.min(score, 5);
  }

  function validatePassword(pw) {
    if (typeof pw !== 'string' || !pw) {
      return { ok: false, error: 'Password is required.', score: 0 };
    }
    const score = passwordScore(pw);
    if (pw.length < 10) return { ok: false, error: 'Use at least 10 characters.', score };
    if (pw.length > 128) return { ok: false, error: 'Password is too long (max 128).', score };
    if (score < 3) return { ok: false, error: 'Mix upper/lowercase, a number, or a symbol.', score };
    return { ok: true, value: pw, score };
  }

  function validateMatch(a, b) {
    return a === b ? { ok: true } : { ok: false, error: 'Passwords do not match.' };
  }

  /* ---------------- Demo-grade hashing ---------------- */
  // ⚠️ DEMO ONLY. Production: Argon2id or bcrypt, server-side, per-user salt.

  async function hashPassword(password, salt) {
    const enc = new TextEncoder();
    if (window.crypto && crypto.subtle && crypto.subtle.importKey) {
      try {
        const keyMaterial = await crypto.subtle.importKey(
          'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
        );
        const bits = await crypto.subtle.deriveBits(
          { name: 'PBKDF2', salt: enc.encode(salt), iterations: 100000, hash: 'SHA-256' },
          keyMaterial, 256
        );
        return 'pbkdf2$' + btoa(String.fromCharCode(...new Uint8Array(bits)));
      } catch (_) { /* fall through to fallback */ }
    }
    // Fallback for file:// where crypto.subtle may be unavailable — DEMO ONLY
    return 'fallback$' + fnv1a(salt + ':' + password);
  }

  function fnv1a(str) {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  }

  function randomSalt() {
    const bytes = new Uint8Array(16);
    if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(bytes);
    else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
    return btoa(String.fromCharCode(...bytes));
  }

  /* ---------------- UI helpers ---------------- */

  function setFieldError(input, errorEl, message) {
    if (message) {
      input.setAttribute('aria-invalid', 'true');
      input.classList.add('invalid');
      if (errorEl) { errorEl.textContent = message; errorEl.classList.add('show'); }
    } else {
      input.removeAttribute('aria-invalid');
      input.classList.remove('invalid');
      if (errorEl) { errorEl.textContent = ''; errorEl.classList.remove('show'); }
    }
  }

  return {
    sanitizeText, sanitizeEmail, escapeHtml,
    validateEmail, validateName, validatePassword, validateMatch, passwordScore,
    hashPassword, randomSalt, setFieldError
  };
})();