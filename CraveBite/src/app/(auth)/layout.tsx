// src/app/(auth)/layout.tsx
// Split-screen auth layout: immersive food panel (left) + form panel (right).
// This is a server component – no "use client" needed.
import type { Metadata } from "next";
import styles from "./auth.module.css";

export const metadata: Metadata = {
  title: {
    default: "Welcome Back",
    template: "%s | CraveBite",
  },
  description: "Sign in or create your CraveBite account to start ordering delicious food.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.authShell}>
      {/* ── Left: Visual panel ─────────────────────────────── */}
      <aside className={styles.visualPanel} aria-hidden="true">
        {/* Animated mesh blobs */}
        <div className={styles.blob1} />
        <div className={styles.blob2} />
        <div className={styles.blob3} />

        {/* Floating food emojis */}
        <div className={styles.floatingFood}>
          {["🍕", "🍔", "🍣", "🌮", "🍜", "🍛", "🥗", "🍰", "🧆", "🥘"].map(
            (emoji, i) => (
              <span
                key={i}
                className={styles.foodEmoji}
                style={{ "--delay": `${i * 0.55}s`, "--idx": i } as React.CSSProperties}
              >
                {emoji}
              </span>
            )
          )}
        </div>

        {/* Central visual card */}
        <div className={styles.heroCard}>
          <div className={styles.heroCardInner}>
            <span className={styles.brandIcon}>🍴</span>
            <h2 className={styles.heroTitle}>
              Cravings<br />
              <span className={styles.heroTitleAccent}>Delivered</span>
            </h2>
            <p className={styles.heroDesc}>
              500+ restaurants · 30-min delivery · 50k+ happy customers
            </p>

            <div className={styles.statsRow}>
              {[
                { value: "500+", label: "Restaurants" },
                { value: "4.9★", label: "Rating" },
                { value: "30m",  label: "Avg. Delivery" },
              ].map((s) => (
                <div key={s.label} className={styles.statItem}>
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom testimonial strip */}
        <div className={styles.testimonialStrip}>
          <div className={styles.testimonialAvatars}>
            {["😊", "😍", "🥰", "😋"].map((e, i) => (
              <span key={i} className={styles.avatar} style={{ "--i": i } as React.CSSProperties}>{e}</span>
            ))}
          </div>
          <p className={styles.testimonialText}>
            <strong>Loved by 50,000+</strong> food enthusiasts
          </p>
        </div>
      </aside>

      {/* ── Right: Form panel ──────────────────────────────── */}
      <main className={styles.formPanel}>
        {/* Top nav link */}
        <div className={styles.formNav}>
          <a href="/" className={styles.backLink} aria-label="Back to home">
            <span className={styles.backIcon}>←</span>
            <span className={styles.logoMark}>🍴</span>
            <span className={styles.logoName}>CraveBite</span>
          </a>
        </div>

        <div className={styles.formWrapper}>
          {children}
        </div>

        <p className={styles.formFooter}>
          © {new Date().getFullYear()} CraveBite. All rights reserved.
        </p>
      </main>
    </div>
  );
}
