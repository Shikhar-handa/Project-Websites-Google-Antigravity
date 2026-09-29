import { Star, Utensils, ThumbsUp, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function ReviewsPage() {
  return (
    <div className="dash-page animate-fade-in-up">

      {/* ── Page Header ── */}
      <div className="dash-page-header">
        <div className="dash-page-icon dash-page-icon--yellow">
          <Star size={22} />
        </div>
        <div className="dash-page-titles">
          <h1 className="dash-page-title">My Reviews</h1>
          <p className="dash-page-sub">Ratings and feedback you&apos;ve left for restaurants</p>
        </div>
      </div>

      {/* ── Empty State ── */}
      <div className="empty-state">
        <div className="empty-state-icon">
          <Star size={28} />
        </div>
        <h3 className="empty-state-title">No reviews yet</h3>
        <p className="empty-state-desc">
          You haven&apos;t reviewed any restaurants yet. Order from a restaurant and share your experience to help the community!
        </p>
        <Link href="/dashboard/orders" className="btn btn-primary">
          View Past Orders
        </Link>
      </div>

      {/* ── Why review? (feature cards) ── */}
      <div>
        <div className="dash-divider-label" style={{ marginBottom: "var(--space-5)" }}>
          Why leave a review?
        </div>
        <div className="dash-feature-grid">
          <div className="dash-feature-card">
            <div
              className="dash-feature-card-icon"
              style={{ background: "rgba(251, 191, 36, 0.10)", color: "var(--accent-yellow)" }}
            >
              <Star size={18} />
            </div>
            <p className="dash-feature-card-title">Rate Your Experience</p>
            <p className="dash-feature-card-desc">
              Give restaurants honest feedback and help other customers make informed choices.
            </p>
          </div>
          <div className="dash-feature-card">
            <div
              className="dash-feature-card-icon"
              style={{ background: "rgba(34, 197, 94, 0.10)", color: "var(--accent-green)" }}
            >
              <ThumbsUp size={18} />
            </div>
            <p className="dash-feature-card-title">Support Great Food</p>
            <p className="dash-feature-card-desc">
              Positive reviews help local restaurants grow and maintain quality standards.
            </p>
          </div>
          <div className="dash-feature-card">
            <div
              className="dash-feature-card-icon"
              style={{ background: "rgba(168, 85, 247, 0.10)", color: "#c084fc" }}
            >
              <MessageSquare size={18} />
            </div>
            <p className="dash-feature-card-title">Build the Community</p>
            <p className="dash-feature-card-desc">
              Your feedback shapes the CraveBite dining experience for everyone.
            </p>
          </div>
        </div>
      </div>

      {/* ── Quick CTA ── */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(26,26,36,0.9) 70%)",
          border: "1px solid rgba(251, 191, 36, 0.18)",
          borderRadius: "var(--radius-2xl)",
          padding: "var(--space-6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "var(--space-4)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <span style={{ fontSize: "1.5rem" }}>🍽️</span>
          <div>
            <p
              style={{
                fontSize: "var(--text-sm)",
                fontWeight: "var(--fw-semibold)",
                color: "var(--text-primary)",
                marginBottom: 2,
              }}
            >
              Ready to review a restaurant?
            </p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--text-secondary)" }}>
              Order first, then come back here to share your experience.
            </p>
          </div>
        </div>
        <Link href="/#restaurants" className="btn btn-secondary" style={{ flexShrink: 0 }}>
          <Utensils size={15} />
          Browse Restaurants
        </Link>
      </div>

      {/* ── Coming soon banner ── */}
      <div className="dash-coming-soon">
        <span className="dash-coming-soon-dot" />
        In-app review submission coming soon — stay tuned for updates.
      </div>

    </div>
  );
}
