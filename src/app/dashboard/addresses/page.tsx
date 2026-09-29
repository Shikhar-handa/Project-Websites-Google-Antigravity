import { MapPin, Plus, Home, Building2, Briefcase } from "lucide-react";

export default function AddressesPage() {
  return (
    <div className="dash-page animate-fade-in-up">

      {/* ── Page Header ── */}
      <div className="dash-page-header">
        <div className="dash-page-icon dash-page-icon--orange">
          <MapPin size={22} />
        </div>
        <div className="dash-page-titles">
          <h1 className="dash-page-title">My Addresses</h1>
          <p className="dash-page-sub">Saved delivery locations for faster checkout</p>
        </div>
      </div>

      {/* ── Empty State ── */}
      <div className="empty-state">
        <div className="empty-state-icon">
          <MapPin size={28} />
        </div>
        <h3 className="empty-state-title">No addresses saved yet</h3>
        <p className="empty-state-desc">
          Save your home, office, or any delivery address to make checkout faster next time.
        </p>
        <button className="btn btn-primary" type="button">
          <Plus size={16} />
          Add New Address
        </button>
      </div>

      {/* ── Why save addresses? (feature cards) ── */}
      <div>
        <div className="dash-divider-label" style={{ marginBottom: "var(--space-5)" }}>
          Why save addresses?
        </div>
        <div className="dash-feature-grid">
          <div className="dash-feature-card">
            <div
              className="dash-feature-card-icon"
              style={{ background: "rgba(255, 107, 53, 0.10)", color: "var(--accent-orange)" }}
            >
              <Home size={18} />
            </div>
            <p className="dash-feature-card-title">One-tap Delivery</p>
            <p className="dash-feature-card-desc">
              Skip typing your address every time. Select a saved location at checkout in one tap.
            </p>
          </div>
          <div className="dash-feature-card">
            <div
              className="dash-feature-card-icon"
              style={{ background: "rgba(34, 197, 94, 0.10)", color: "var(--accent-green)" }}
            >
              <Building2 size={18} />
            </div>
            <p className="dash-feature-card-title">Multiple Locations</p>
            <p className="dash-feature-card-desc">
              Save your home and office. Switch between them without re-entering details.
            </p>
          </div>
          <div className="dash-feature-card">
            <div
              className="dash-feature-card-icon"
              style={{ background: "rgba(251, 191, 36, 0.10)", color: "var(--accent-yellow)" }}
            >
              <Briefcase size={18} />
            </div>
            <p className="dash-feature-card-title">Faster Checkout</p>
            <p className="dash-feature-card-desc">
              A pre-filled address reduces checkout time and means your food arrives sooner.
            </p>
          </div>
        </div>
      </div>

      {/* ── Coming soon banner ── */}
      <div className="dash-coming-soon">
        <span className="dash-coming-soon-dot" />
        Address management panel coming soon — for now, set your default address during registration or checkout.
      </div>

    </div>
  );
}
