"use client";
// src/app/(auth)/register/page.tsx
// Premium registration page – Name, Email, Password, Phone, Delivery Address.
// POST to /api/auth/register (auth logic unchanged).
// Client-side validation with field-level error indicators.

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import styles from "./register.module.css";

// ─── Validation helpers ────────────────────────────────────
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
function isValidPhone(phone: string) {
  return /^[+]?[\d\s\-()]{7,15}$/.test(phone.trim());
}

// ─── Eye icon ─────────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

// ─── Password strength indicator ──────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;

  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#fbbf24", "#22c55e", "#22c55e"];

  return (
    <div className={styles.strengthWrap}>
      <div className={styles.strengthBars}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={styles.strengthBar}
            style={{ background: i <= strength ? colors[strength] : "var(--border-default)" }}
          />
        ))}
      </div>
      <span className={styles.strengthLabel} style={{ color: colors[strength] }}>
        {labels[strength]}
      </span>
    </div>
  );
}

// ─── Page component ────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();

  const [name, setName]           = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [phone, setPhone]         = useState("");
  const [address, setAddress]     = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [serverErr, setServerErr] = useState("");

  // Field errors
  const [nameErr, setNameErr]     = useState("");
  const [emailErr, setEmailErr]   = useState("");
  const [passErr, setPassErr]     = useState("");
  const [phoneErr, setPhoneErr]   = useState("");
  const [addrErr, setAddrErr]     = useState("");

  // ── Validators ────────────────────────────────────────
  function validateName()  {
    if (!name.trim()) { setNameErr("Full name is required."); return false; }
    if (name.trim().length < 2) { setNameErr("Name must be at least 2 characters."); return false; }
    setNameErr(""); return true;
  }
  function validateEmail() {
    if (!email) { setEmailErr("Email is required."); return false; }
    if (!isValidEmail(email)) { setEmailErr("Please enter a valid email address."); return false; }
    setEmailErr(""); return true;
  }
  function validatePassword() {
    if (!password) { setPassErr("Password is required."); return false; }
    if (password.length < 8) { setPassErr("Password must be at least 8 characters."); return false; }
    setPassErr(""); return true;
  }
  function validatePhone() {
    if (phone && !isValidPhone(phone)) { setPhoneErr("Enter a valid phone number."); return false; }
    setPhoneErr(""); return true;
  }
  function validateAddress() {
    if (address && address.trim().length < 5) { setAddrErr("Address seems too short."); return false; }
    setAddrErr(""); return true;
  }

  // ── Submit – auth logic unchanged ─────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerErr("");

    const allOk = [
      validateName(),
      validateEmail(),
      validatePassword(),
      validatePhone(),
      validateAddress(),
    ].every(Boolean);

    if (!allOk) return;

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerErr(data.error ?? "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Success – redirect to login with registered flag
      router.push("/login?registered=1");
    } catch {
      setServerErr("Network error. Please check your connection and try again.");
      setLoading(false);
    }
  }

  return (
    <div className={styles.card}>
      {/* ── Header ─────────────────────────────── */}
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderIcon}>🚀</div>
        <h1 className={styles.cardTitle}>Create your account</h1>
        <p className={styles.cardSubtitle}>Join 50,000+ food lovers on CraveBite</p>
      </div>

      {/* ── Server error ────────────────────────── */}
      {serverErr && (
        <div
          id="register-error"
          className={`${styles.alert} ${styles.alertError}`}
          role="alert"
        >
          <span>⚠️</span>
          <span>{serverErr}</span>
        </div>
      )}

      {/* ── Form ─────────────────────────────────── */}
      <form id="register-form" onSubmit={handleSubmit} className={styles.form} noValidate>

        {/* Full Name */}
        <div className={styles.field}>
          <label htmlFor="register-name" className={styles.label}>Full Name</label>
          <div className={`${styles.inputWrap} ${nameErr ? styles.inputWrapError : name && !nameErr ? styles.inputWrapSuccess : ""}`}>
            <span className={styles.inputIcon}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
            </span>
            <input
              id="register-name"
              type="text"
              className={styles.input}
              placeholder="Jane Smith"
              autoComplete="name"
              minLength={2}
              value={name}
              onChange={(e) => { setName(e.target.value); if (nameErr) setNameErr(""); }}
              onBlur={validateName}
              aria-describedby={nameErr ? "register-name-err" : undefined}
              aria-invalid={!!nameErr}
              required
            />
          </div>
          {nameErr && <p id="register-name-err" className={styles.fieldError} role="alert"><span aria-hidden="true">✕</span> {nameErr}</p>}
        </div>

        {/* Email */}
        <div className={styles.field}>
          <label htmlFor="register-email" className={styles.label}>Email Address</label>
          <div className={`${styles.inputWrap} ${emailErr ? styles.inputWrapError : email && !emailErr ? styles.inputWrapSuccess : ""}`}>
            <span className={styles.inputIcon}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
              </svg>
            </span>
            <input
              id="register-email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailErr) setEmailErr(""); }}
              onBlur={validateEmail}
              aria-describedby={emailErr ? "register-email-err" : undefined}
              aria-invalid={!!emailErr}
              required
            />
          </div>
          {emailErr && <p id="register-email-err" className={styles.fieldError} role="alert"><span aria-hidden="true">✕</span> {emailErr}</p>}
        </div>

        {/* Password */}
        <div className={styles.field}>
          <label htmlFor="register-password" className={styles.label}>Password</label>
          <div className={`${styles.inputWrap} ${passErr ? styles.inputWrapError : password && !passErr ? styles.inputWrapSuccess : ""}`}>
            <span className={styles.inputIcon}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <input
              id="register-password"
              type={showPass ? "text" : "password"}
              className={`${styles.input} ${styles.inputPaddedRight}`}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (passErr) setPassErr(""); }}
              onBlur={validatePassword}
              aria-describedby={passErr ? "register-password-err" : undefined}
              aria-invalid={!!passErr}
              required
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={() => setShowPass((v) => !v)}
              aria-label={showPass ? "Hide password" : "Show password"}
            >
              <EyeIcon open={showPass} />
            </button>
          </div>
          {passErr && <p id="register-password-err" className={styles.fieldError} role="alert"><span aria-hidden="true">✕</span> {passErr}</p>}
          <PasswordStrength password={password} />
        </div>

        {/* Phone (optional) */}
        <div className={styles.field}>
          <label htmlFor="register-phone" className={styles.label}>
            Phone Number <span className={styles.optionalTag}>optional</span>
          </label>
          <div className={`${styles.inputWrap} ${phoneErr ? styles.inputWrapError : phone && !phoneErr ? styles.inputWrapSuccess : ""}`}>
            <span className={styles.inputIcon}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.37 2 2 0 0 1 3.58 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.1 6.1l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </span>
            <input
              id="register-phone"
              type="tel"
              className={styles.input}
              placeholder="+91 98765 43210"
              autoComplete="tel"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); if (phoneErr) setPhoneErr(""); }}
              onBlur={validatePhone}
              aria-describedby={phoneErr ? "register-phone-err" : undefined}
              aria-invalid={!!phoneErr}
            />
          </div>
          {phoneErr && <p id="register-phone-err" className={styles.fieldError} role="alert"><span aria-hidden="true">✕</span> {phoneErr}</p>}
        </div>

        {/* Default Delivery Address (optional) */}
        <div className={styles.field}>
          <label htmlFor="register-address" className={styles.label}>
            Default Delivery Address <span className={styles.optionalTag}>optional</span>
          </label>
          <div className={`${styles.inputWrap} ${styles.inputWrapTextarea} ${addrErr ? styles.inputWrapError : address && !addrErr ? styles.inputWrapSuccess : ""}`}>
            <span className={`${styles.inputIcon} ${styles.inputIconTop}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
              </svg>
            </span>
            <textarea
              id="register-address"
              className={`${styles.input} ${styles.textarea}`}
              placeholder="123 Main St, Apartment 4B, Mumbai 400001"
              autoComplete="street-address"
              rows={2}
              value={address}
              onChange={(e) => { setAddress(e.target.value); if (addrErr) setAddrErr(""); }}
              onBlur={validateAddress}
              aria-describedby={addrErr ? "register-addr-err" : undefined}
              aria-invalid={!!addrErr}
            />
          </div>
          {addrErr && <p id="register-addr-err" className={styles.fieldError} role="alert"><span aria-hidden="true">✕</span> {addrErr}</p>}
        </div>

        {/* Submit */}
        <button
          id="register-submit"
          type="submit"
          className={`${styles.submitBtn} ${loading ? styles.submitBtnLoading : ""}`}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Creating your account…
            </>
          ) : (
            <>
              <span>Create Account</span>
              <span className={styles.btnArrow}>🚀</span>
            </>
          )}
        </button>

        <p className={styles.termsNote}>
          By registering, you agree to our{" "}
          <a href="#" className={styles.termsLink}>Terms of Service</a>{" "}
          and{" "}
          <a href="#" className={styles.termsLink}>Privacy Policy</a>.
        </p>
      </form>

      {/* ── Divider ─────────────────────────────── */}
      <div className={styles.divider}>
        <span className={styles.dividerText}>already a member?</span>
      </div>

      {/* ── Login link ──────────────────────────── */}
      <p className={styles.switchText}>
        <a href="/login" className={styles.switchLink} id="go-login-link">
          Sign in to your account →
        </a>
      </p>
    </div>
  );
}
