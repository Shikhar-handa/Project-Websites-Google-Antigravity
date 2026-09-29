"use client";
// src/app/(auth)/login/page.tsx
// Premium login page – glassmorphism inputs, client-side validation,
// NextAuth signIn('credentials') with post-login redirect.
// Authentication logic is unchanged from the original implementation.

import { useState, FormEvent, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./login.module.css";

// ─── Client-side validation helpers ───────────────────────
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// ─── Eye icon SVG ──────────────────────────────────────────
function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

// ─── Inner component that uses useSearchParams ─────────────
// Must be wrapped in Suspense per Next.js App Router requirements.
function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);

  // Field-level errors
  const [emailErr, setEmailErr]     = useState("");
  const [passwordErr, setPasswordErr] = useState("");
  const [serverErr, setServerErr]   = useState("");

  // Success toast after registration redirect
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (searchParams.get("registered") === "1") {
      setRegistered(true);
      const t = setTimeout(() => setRegistered(false), 5000);
      return () => clearTimeout(t);
    }
  }, [searchParams]);

  // ── Inline validation ──────────────────────────────────
  function validateEmail() {
    if (!email) { setEmailErr("Email is required."); return false; }
    if (!isValidEmail(email)) { setEmailErr("Please enter a valid email."); return false; }
    setEmailErr("");
    return true;
  }

  function validatePassword() {
    if (!password) { setPasswordErr("Password is required."); return false; }
    if (password.length < 6) { setPasswordErr("Password must be at least 6 characters."); return false; }
    setPasswordErr("");
    return true;
  }

  // ── Submit handler (auth logic unchanged) ──────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerErr("");

    const emailOk = validateEmail();
    const passOk  = validatePassword();
    if (!emailOk || !passOk) return;

    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (result?.error) {
      setServerErr("Invalid email or password. Please try again.");
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className={styles.card}>
      {/* ── Header ────────────────────────────────────── */}
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderIcon}>👋</div>
        <h1 className={styles.cardTitle}>Welcome back</h1>
        <p className={styles.cardSubtitle}>Sign in to your CraveBite account</p>
      </div>

      {/* ── Registered success toast ───────────────── */}
      {registered && (
        <div className={`${styles.alert} ${styles.alertSuccess}`} role="alert">
          <span>✅</span>
          <span>Account created! Please sign in.</span>
        </div>
      )}

      {/* ── Server error ───────────────────────────── */}
      {serverErr && (
        <div
          id="login-error"
          className={`${styles.alert} ${styles.alertError}`}
          role="alert"
        >
          <span>⚠️</span>
          <span>{serverErr}</span>
        </div>
      )}

      {/* ── Form ──────────────────────────────────────  */}
      <form id="login-form" onSubmit={handleSubmit} className={styles.form} noValidate>

        {/* Email */}
        <div className={styles.field}>
          <label htmlFor="login-email" className={styles.label}>
            Email address
          </label>
          <div className={`${styles.inputWrap} ${emailErr ? styles.inputWrapError : email && !emailErr ? styles.inputWrapSuccess : ""}`}>
            <span className={styles.inputIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </span>
            <input
              id="login-email"
              type="email"
              className={styles.input}
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (emailErr) setEmailErr(""); }}
              onBlur={validateEmail}
              aria-describedby={emailErr ? "login-email-err" : undefined}
              aria-invalid={!!emailErr}
              required
            />
          </div>
          {emailErr && (
            <p id="login-email-err" className={styles.fieldError} role="alert">
              <span aria-hidden="true">✕</span> {emailErr}
            </p>
          )}
        </div>

        {/* Password */}
        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor="login-password" className={styles.label}>Password</label>
            <a href="#" className={styles.forgotLink}>Forgot password?</a>
          </div>
          <div className={`${styles.inputWrap} ${passwordErr ? styles.inputWrapError : password && !passwordErr ? styles.inputWrapSuccess : ""}`}>
            <span className={styles.inputIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </span>
            <input
              id="login-password"
              type={showPass ? "text" : "password"}
              className={`${styles.input} ${styles.inputPaddedRight}`}
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (passwordErr) setPasswordErr(""); }}
              onBlur={validatePassword}
              aria-describedby={passwordErr ? "login-password-err" : undefined}
              aria-invalid={!!passwordErr}
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
          {passwordErr && (
            <p id="login-password-err" className={styles.fieldError} role="alert">
              <span aria-hidden="true">✕</span> {passwordErr}
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          id="login-submit"
          type="submit"
          className={`${styles.submitBtn} ${loading ? styles.submitBtnLoading : ""}`}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              Signing in…
            </>
          ) : (
            <>
              <span>Sign In</span>
              <span className={styles.btnArrow}>→</span>
            </>
          )}
        </button>
      </form>

      {/* ── Divider ───────────────────────────────────── */}
      <div className={styles.divider}>
        <span className={styles.dividerText}>or</span>
      </div>

      {/* ── Register link ─────────────────────────────── */}
      <p className={styles.switchText}>
        Don&apos;t have an account?{" "}
        <a href="/register" className={styles.switchLink} id="go-register-link">
          Create one free →
        </a>
      </p>
    </div>
  );
}

// ─── Page export – wraps LoginForm in Suspense ─────────────
// Required because LoginForm uses useSearchParams().
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{
          width: "100%",
          maxWidth: "440px",
          background: "rgba(20,20,30,0.85)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "1.5rem",
          padding: "3rem",
          textAlign: "center",
          color: "var(--text-secondary)"
        }}>
          Loading…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
