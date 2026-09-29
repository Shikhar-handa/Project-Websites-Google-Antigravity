"use client";
// src/components/Footer.tsx
// Site-wide footer: brand, links, contact info, and social icons via lucide-react.
// "use client" is required here because of styled-jsx/style tags used for scoped CSS.

import Link from "next/link";
import {
  UtensilsCrossed,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

// ─── Data ───────────────────────────────────────────────────────────────────
const FOOTER_LINKS = [
  {
    heading: "Company",
    links: [
      { label: "About Us",  href: "/" },
      { label: "Careers",   href: "/" },
      { label: "Press",     href: "/" },
      { label: "Blog",      href: "/" },
    ],
  },
  {
    heading: "For Users",
    links: [
      { label: "How It Works", href: "/" },
      { label: "Pricing",      href: "/" },
      { label: "Track Order",  href: "/" },
      { label: "Gift Cards",   href: "/" },
    ],
  },
  {
    heading: "For Restaurants",
    links: [
      { label: "Partner With Us", href: "/" },
      { label: "Merchant App",    href: "/" },
      { label: "Marketing",       href: "/" },
      { label: "Support",         href: "/" },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: Twitter,   href: "#", label: "Twitter / X"  },
  { icon: Facebook,  href: "#", label: "Facebook"      },
  { icon: Instagram, href: "#", label: "Instagram"     },
  { icon: Youtube,   href: "#", label: "YouTube"       },
];

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <>
      <footer className="footer-root" role="contentinfo">
        <div className="container">
          {/* ── Main grid ── */}
          <div className="footer-grid">
            {/* Brand column */}
            <div className="footer-brand">
              <Link href="/" className="footer-logo" aria-label="CraveBite home">
                <UtensilsCrossed size={22} className="footer-logo-icon" aria-hidden="true" />
                <span className="text-gradient footer-logo-text">CraveBite</span>
              </Link>

              <p className="footer-tagline">
                Cravings delivered fast. Discover the best local restaurants and
                enjoy hot meals at your door — in 30&nbsp;minutes or less.
              </p>

              {/* Contact info */}
              <address className="footer-contact">
                <a href="mailto:hello@cravebite.app" className="footer-contact-item">
                  <Mail size={14} aria-hidden="true" />
                  hello@cravebite.app
                </a>
                <a href="tel:+911800000000" className="footer-contact-item">
                  <Phone size={14} aria-hidden="true" />
                  1800-000-0000
                </a>
                <span className="footer-contact-item footer-contact-item--plain">
                  <MapPin size={14} aria-hidden="true" />
                  New Delhi, India
                </span>
              </address>

              {/* Social icons */}
              <div className="footer-socials" role="list" aria-label="Social media links">
                {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    className="footer-social-btn"
                    aria-label={label}
                    role="listitem"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon size={16} aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {FOOTER_LINKS.map((col) => (
              <div key={col.heading} className="footer-col">
                <h4 className="footer-col-heading">{col.heading}</h4>
                <ul className="footer-link-list" role="list">
                  {col.links.map(({ label, href }) => (
                    <li key={label}>
                      <Link href={href} className="footer-link">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div
            className="divider-gradient"
            role="separator"
            style={{ margin: "var(--space-8) 0 var(--space-6)" }}
          />

          {/* ── Footer bottom bar ── */}
          <div className="footer-bottom">
            <p className="footer-copy">
              © {currentYear} CraveBite. All rights reserved.
            </p>
            <nav className="footer-legal" aria-label="Legal links">
              <Link href="/"  className="footer-legal-link">Privacy Policy</Link>
              <Link href="/"    className="footer-legal-link">Terms of Service</Link>
              <Link href="/"  className="footer-legal-link">Cookie Policy</Link>
            </nav>
          </div>
        </div>
      </footer>

      <style>{`
        /* ─── Root ────────────────────────────────────────────────── */
        .footer-root {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border-subtle);
          padding-top: var(--space-16);
          padding-bottom: var(--space-8);
        }

        /* ─── Grid ────────────────────────────────────────────────── */
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: var(--space-12);
        }

        /* ─── Brand column ────────────────────────────────────────── */
        .footer-brand {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          text-decoration: none;
          width: fit-content;
        }

        .footer-logo-icon {
          color: var(--accent-orange);
          flex-shrink: 0;
        }

        .footer-logo-text {
          font-family: var(--font-display);
          font-size: var(--text-xl);
          font-weight: var(--fw-extrabold);
          letter-spacing: -0.03em;
        }

        .footer-tagline {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          line-height: var(--lh-relaxed);
          max-width: 280px;
        }

        /* ─── Contact info ────────────────────────────────────────── */
        .footer-contact {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          font-style: normal;
        }

        .footer-contact-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          text-decoration: none;
          transition: var(--transition-fast);
        }

        .footer-contact-item:not(.footer-contact-item--plain):hover {
          color: var(--accent-orange);
        }

        /* ─── Socials ─────────────────────────────────────────────── */
        .footer-socials {
          display: flex;
          gap: var(--space-3);
          margin-top: var(--space-2);
        }

        .footer-social-btn {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-lg);
          background: var(--glass-bg);
          border: 1px solid var(--border-subtle);
          color: var(--text-secondary);
          text-decoration: none;
          transition: var(--transition-base);
        }

        .footer-social-btn:hover {
          background: var(--glass-bg-strong);
          border-color: var(--border-brand);
          color: var(--accent-orange);
          transform: translateY(-3px) scale(1.1);
          box-shadow: 0 6px 20px rgba(255, 107, 53, 0.2);
        }

        /* ─── Link columns ────────────────────────────────────────── */
        .footer-col {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .footer-col-heading {
          font-size: var(--text-sm);
          font-weight: var(--fw-semibold);
          color: var(--text-primary);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .footer-link-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .footer-link {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          text-decoration: none;
          transition: var(--transition-fast);
        }

        .footer-link:hover {
          color: var(--accent-orange);
          padding-left: 4px;
        }

        /* ─── Bottom bar ──────────────────────────────────────────── */
        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-4);
          flex-wrap: wrap;
        }

        .footer-copy {
          font-size: var(--text-sm);
          color: var(--text-muted);
        }

        .footer-legal {
          display: flex;
          gap: var(--space-6);
        }

        .footer-legal-link {
          font-size: var(--text-sm);
          color: var(--text-tertiary);
          text-decoration: none;
          transition: var(--transition-fast);
        }

        .footer-legal-link:hover {
          color: var(--accent-orange);
        }

        /* ─── Responsive ──────────────────────────────────────────── */
        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr;
            gap: var(--space-8);
          }

          .footer-brand {
            grid-column: 1 / -1;
          }

          .footer-tagline {
            max-width: 480px;
          }
        }

        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr;
            gap: var(--space-8);
          }

          .footer-brand {
            grid-column: unset;
          }

          .footer-bottom {
            flex-direction: column;
            text-align: center;
          }

          .footer-legal {
            justify-content: center;
            flex-wrap: wrap;
            gap: var(--space-4);
          }
        }
      `}</style>
    </>
  );
}
