"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ChevronLeft,
  MapPin,
  CreditCard,
  ShoppingBag,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
  Sparkles,
  Shield,
  Receipt,
  Bike,
} from "lucide-react";

const DELIVERY_FEE = 50;

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { state: cartState, subtotal, totalItems, clearCart } = useCart();

  // Component states
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [addressError, setAddressError] = useState("");
  const [loading, setLoading] = useState(false);

  // Sandbox Simulator Modal states
  const [showSandboxModal, setShowSandboxModal] = useState(false);
  const [sandboxOrderData, setSandboxOrderData] = useState<any>(null);
  const [sandboxVerifying, setSandboxVerifying] = useState(false);
  const [sandboxError, setSandboxError] = useState("");

  // Price calculations matching API route
  const tax = subtotal * 0.05;
  const grandTotal = subtotal + DELIVERY_FEE + tax;

  // 1. Fetch user's defaultAddress on mount
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/address")
        .then((res) => res.json())
        .then((data) => {
          if (data?.defaultAddress) {
            setDeliveryAddress(data.defaultAddress);
          }
        })
        .catch((err) => console.error("Error fetching default address:", err));
    }
  }, [status]);

  // Redirect to login if unauthenticated after load
  if (status === "unauthenticated") {
    return (
      <>
        <Navbar />
        <main className="co-page bg-mesh">
          <div className="co-empty-wrap">
            <div className="co-empty-card glass-card">
              <AlertTriangle size={44} style={{ color: "var(--accent-yellow)" }} />
              <h2 className="co-empty-title">Access Denied</h2>
              <p className="co-empty-desc">Please log in to proceed to checkout and place your order.</p>
              <Link
                href={`/login?callbackUrl=/checkout`}
                className="btn btn-primary btn-lg"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Log In to Continue
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        <style>{checkoutStyles}</style>
      </>
    );
  }

  // Handle empty cart
  if (cartState.items.length === 0 && !showSandboxModal) {
    return (
      <>
        <Navbar />
        <main className="co-page bg-mesh">
          <div className="co-empty-wrap">
            <div className="co-empty-card glass-card">
              <ShoppingBag size={44} style={{ color: "var(--accent-orange)" }} />
              <h2 className="co-empty-title">Your cart is empty</h2>
              <p className="co-empty-desc">You don&apos;t have any items in your cart to checkout.</p>
              <Link
                href="/restaurants"
                className="btn btn-primary btn-lg"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Browse Restaurants
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        <style>{checkoutStyles}</style>
      </>
    );
  }

  // Helper to load Razorpay SDK dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Submit Order / Initiate Payment Flow
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError("");
    setLoading(true);

    if (!deliveryAddress.trim()) {
      setAddressError("Delivery address is required to place an order.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartState.items,
          restaurantId: cartState.restaurantId,
          deliveryAddress: deliveryAddress.trim(),
        }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      if (orderData.isMock) {
        setSandboxOrderData(orderData);
        setShowSandboxModal(true);
        setLoading(false);
      } else {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
        }

        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "CraveBite",
          description: `Order from ${cartState.restaurantName || "Restaurant"}`,
          order_id: orderData.orderId,
          handler: async function (paymentResponse: any) {
            try {
              setLoading(true);
              const verifyRes = await fetch("/api/payments/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  dbOrderId: orderData.dbOrderId,
                }),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok) {
                throw new Error(verifyData.error || "Verification failed");
              }

              clearCart();
              router.push("/dashboard/orders");
            } catch (err: any) {
              alert(`Payment verification failed: ${err.message}`);
            } finally {
              setLoading(false);
            }
          },
          prefill: {
            name: session?.user?.name || "",
            email: session?.user?.email || "",
          },
          theme: {
            color: "#ff6b35",
          },
          modal: {
            ondismiss: function () {
              setLoading(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      }
    } catch (err: any) {
      console.error(err);
      alert(`Order placement error: ${err.message}`);
      setLoading(false);
    }
  };

  // Mock Payment success simulation
  const handleSimulateSuccess = async () => {
    if (!sandboxOrderData) return;
    setSandboxVerifying(true);
    setSandboxError("");

    try {
      const verifyRes = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: sandboxOrderData.orderId,
          razorpay_payment_id: "pay_mock_sandbox_simulator",
          razorpay_signature: "mock_signature",
          dbOrderId: sandboxOrderData.dbOrderId,
        }),
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Failed to verify mock payment");
      }

      clearCart();
      setShowSandboxModal(false);
      router.push("/dashboard/orders");
      router.refresh();
    } catch (err: any) {
      setSandboxError(err.message || "Something went wrong during simulation.");
    } finally {
      setSandboxVerifying(false);
    }
  };

  return (
    <>
      <Navbar />
      <main id="main-content" className="co-page bg-mesh">

        {/* ── Hero Banner ── */}
        <div className="co-hero">
          <div className="co-hero-blob co-hero-blob--1" aria-hidden="true" />
          <div className="co-hero-blob co-hero-blob--2" aria-hidden="true" />
          <div className="container co-hero-inner">
            <Link href="/cart" className="co-back-link" id="checkout-back-btn">
              <ChevronLeft size={16} aria-hidden="true" />
              Back to Cart
            </Link>
            <h1 className="co-hero-heading">
              Secure <span className="text-gradient">Checkout</span>
            </h1>
            <p className="co-hero-sub">
              Complete your order — fast, safe, and reliable delivery guaranteed.
            </p>
          </div>
        </div>

        {/* ── Checkout Body ── */}
        <div className="container co-body">
          <form className="co-layout" onSubmit={handlePlaceOrder}>

            {/* ── Left Column ── */}
            <div className="co-left">

              {/* Delivery Address */}
              <section className="co-section glass-card" aria-label="Delivery Address">
                <div className="co-section-header">
                  <div className="co-section-icon-wrap" style={{ background: "rgba(255, 107, 53, 0.12)", color: "var(--accent-orange)" }}>
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h2 className="co-section-title">Delivery Address</h2>
                    <p className="co-section-sub">Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="delivery-address-input" className="label">
                    Complete Address
                  </label>
                  <textarea
                    id="delivery-address-input"
                    className={`input${addressError ? " input-error" : ""}`}
                    placeholder="Flat / House no., Street, Area, City, PIN code..."
                    rows={4}
                    value={deliveryAddress}
                    onChange={(e) => {
                      setDeliveryAddress(e.target.value);
                      if (e.target.value.trim()) setAddressError("");
                    }}
                    style={{
                      resize: "vertical",
                      minHeight: "108px",
                      background: "rgba(255, 255, 255, 0.02)",
                    }}
                    required
                  />
                  {addressError && (
                    <p className="error-msg">
                      <AlertTriangle size={12} />
                      {addressError}
                    </p>
                  )}
                </div>

                {/* Delivery badge */}
                <div className="co-delivery-badge">
                  <Bike size={14} style={{ color: "var(--accent-green)" }} />
                  <span>Estimated delivery in 30–45 minutes</span>
                </div>
              </section>

              {/* Review Order */}
              <section className="co-section glass-card" aria-label="Order Items">
                <div className="co-section-header">
                  <div className="co-section-icon-wrap" style={{ background: "rgba(34, 197, 94, 0.10)", color: "var(--accent-green)" }}>
                    <Receipt size={18} />
                  </div>
                  <div>
                    <h2 className="co-section-title">Review Order</h2>
                    {cartState.restaurantName && (
                      <p className="co-section-sub">from {cartState.restaurantName}</p>
                    )}
                  </div>
                </div>

                {/* Items */}
                <div className="co-items-list">
                  {cartState.items.map((item) => (
                    <div key={item.itemId} className="co-item-row">
                      <span
                        className={item.isVeg ? "veg-dot" : "nonveg-dot"}
                        style={{ flexShrink: 0, marginTop: 2 }}
                        aria-label={item.isVeg ? "Vegetarian" : "Non-vegetarian"}
                      />
                      <div className="co-item-info">
                        <p className="co-item-name">{item.name}</p>
                        <p className="co-item-unit">
                          Qty {item.qty} × ₹{item.price.toFixed(0)}
                        </p>
                      </div>
                      <p className="co-item-total">
                        ₹{(item.price * item.qty).toFixed(0)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* ── Right Column: Payment Summary ── */}
            <aside className="co-summary glass-card" aria-label="Payment Summary">
              <div className="co-summary-header">
                <div className="co-section-icon-wrap" style={{ background: "rgba(255, 107, 53, 0.12)", color: "var(--accent-orange)" }}>
                  <CreditCard size={18} />
                </div>
                <h2 className="co-section-title">Payment Summary</h2>
              </div>

              {/* Restaurant info */}
              {cartState.restaurantName && (
                <div className="co-summary-restaurant">
                  <p className="co-summary-restaurant-label">Ordering from</p>
                  <p className="co-summary-restaurant-name">{cartState.restaurantName}</p>
                </div>
              )}

              {/* Price breakdown */}
              <dl className="co-price-list">
                <div className="co-price-row">
                  <dt>Items ({totalItems})</dt>
                  <dd>₹{subtotal.toFixed(0)}</dd>
                </div>
                <div className="co-price-row">
                  <dt>Delivery Fee</dt>
                  <dd>₹{DELIVERY_FEE}</dd>
                </div>
                <div className="co-price-row">
                  <dt>Taxes (5% GST)</dt>
                  <dd>₹{tax.toFixed(0)}</dd>
                </div>
              </dl>

              {/* Total */}
              <div className="co-total-row">
                <div>
                  <p className="co-total-label">Grand Total</p>
                  <p className="co-total-sub">Inclusive of all taxes</p>
                </div>
                <span className="co-total-amount">₹{grandTotal.toFixed(0)}</span>
              </div>

              {/* Security assurance */}
              <div className="co-secure-badge">
                <Shield size={13} style={{ color: "var(--accent-green)", flexShrink: 0 }} />
                <span>256-bit SSL encrypted · Powered by Razorpay</span>
              </div>

              {/* Place Order button */}
              <button
                type="submit"
                id="place-order-btn"
                disabled={loading}
                className="btn btn-primary btn-lg co-place-btn animate-glow"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    Place Order · ₹{grandTotal.toFixed(0)}
                  </>
                )}
              </button>
            </aside>
          </form>
        </div>

        {/* ── Sandbox Payment Simulator Modal ── */}
        {showSandboxModal && (
          <div
            className="co-modal-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="sandbox-modal-title"
          >
            <div className="co-modal glass-card animate-scale-in">

              {/* Close Button */}
              <button
                type="button"
                onClick={() => {
                  setShowSandboxModal(false);
                  setLoading(false);
                }}
                className="co-modal-close"
                aria-label="Close Sandbox modal"
              >
                <X size={18} />
              </button>

              {/* Header badge */}
              <div className="co-modal-badge">
                <span className="badge badge-orange">
                  <Sparkles size={11} />
                  Sandbox Payment Simulator
                </span>
              </div>

              <h2 id="sandbox-modal-title" className="co-modal-title">
                Verify Mock Payment
              </h2>
              <p className="co-modal-desc">
                Running in keyless development mode. Use this simulator to bypass active Razorpay servers and test the checkout flow.
              </p>

              {/* Order info panel */}
              <div className="co-modal-info">
                <div className="co-modal-info-row">
                  <span>Order ID</span>
                  <span style={{ fontFamily: "monospace", fontSize: "var(--text-xs)" }}>
                    {sandboxOrderData?.orderId}
                  </span>
                </div>
                <div className="co-modal-info-row">
                  <span>Amount</span>
                  <span style={{ color: "var(--accent-orange)", fontWeight: "var(--fw-bold)" }}>
                    ₹{sandboxOrderData?.amount?.toFixed(2)}
                  </span>
                </div>
              </div>

              {sandboxError && (
                <div className="co-modal-error">
                  <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                  {sandboxError}
                </div>
              )}

              {/* Modal actions */}
              <div className="co-modal-actions">
                <button
                  type="button"
                  onClick={handleSimulateSuccess}
                  disabled={sandboxVerifying}
                  className="btn btn-primary btn-lg"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {sandboxVerifying ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Verifying Signature...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} />
                      Simulate Success
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowSandboxModal(false);
                    setLoading(false);
                  }}
                  disabled={sandboxVerifying}
                  className="btn btn-secondary btn-lg"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
      <Footer />

      <style>{checkoutStyles}</style>
    </>
  );
}

/* ─── Scoped Checkout Styles ────────────────────────────────── */
const checkoutStyles = `

  /* Page shell */
  .co-page {
    min-height: 100vh;
    background: var(--bg-primary);
  }

  /* ── Hero ── */
  .co-hero {
    position: relative;
    background: var(--bg-secondary);
    border-bottom: 1px solid var(--border-subtle);
    overflow: hidden;
    padding: var(--space-10) 0 var(--space-8);
  }

  .co-hero-blob {
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }

  .co-hero-blob--1 {
    top: -50%;
    left: -5%;
    width: 340px;
    height: 340px;
    background: radial-gradient(circle, rgba(255,107,53,0.09) 0%, transparent 65%);
  }

  .co-hero-blob--2 {
    bottom: -60%;
    right: -5%;
    width: 380px;
    height: 380px;
    background: radial-gradient(circle, rgba(251,191,36,0.06) 0%, transparent 65%);
  }

  .co-hero-inner {
    position: relative;
    z-index: 1;
  }

  .co-back-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    text-decoration: none;
    margin-bottom: var(--space-4);
    transition: var(--transition-fast);
  }

  .co-back-link:hover {
    color: var(--accent-orange);
  }

  .co-hero-heading {
    font-family: var(--font-display);
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: var(--fw-black);
    color: var(--text-primary);
    line-height: var(--lh-tight);
    letter-spacing: -0.02em;
    margin-bottom: var(--space-2);
  }

  .co-hero-sub {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    max-width: 420px;
  }

  /* ── Body layout ── */
  .co-body {
    padding-top: var(--space-10);
    padding-bottom: var(--space-20);
  }

  .co-layout {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: var(--space-8);
    align-items: start;
  }

  /* ── Left column ── */
  .co-left {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* ── Section card (glass) ── */
  .co-section {
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .co-section-header {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .co-section-icon-wrap {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .co-section-title {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: var(--fw-bold);
    color: var(--text-primary);
    line-height: var(--lh-snug);
  }

  .co-section-sub {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    margin-top: 2px;
  }

  .co-delivery-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: rgba(34, 197, 94, 0.08);
    border: 1px solid rgba(34, 197, 94, 0.18);
    border-radius: var(--radius-lg);
    font-size: var(--text-xs);
    color: var(--accent-green-light);
    font-weight: var(--fw-medium);
    align-self: flex-start;
  }

  /* ── Items list ── */
  .co-items-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .co-item-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4) 0;
    border-bottom: 1px solid var(--border-subtle);
  }

  .co-item-row:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .co-item-info {
    flex: 1;
    min-width: 0;
  }

  .co-item-name {
    font-size: var(--text-sm);
    font-weight: var(--fw-semibold);
    color: var(--text-primary);
    overflow-wrap: break-word;
    word-break: break-word;
  }

  .co-item-unit {
    font-size: var(--text-xs);
    color: var(--text-muted);
    margin-top: 2px;
  }

  .co-item-total {
    font-family: var(--font-display);
    font-size: var(--text-sm);
    font-weight: var(--fw-bold);
    color: var(--accent-orange);
    flex-shrink: 0;
    min-width: 52px;
    text-align: right;
  }

  /* ── Payment Summary ── */
  .co-summary {
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    position: sticky;
    top: 88px;
    height: fit-content;
  }

  .co-summary-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .co-summary-restaurant {
    background: rgba(255, 107, 53, 0.07);
    border: 1px solid rgba(255, 107, 53, 0.16);
    border-radius: var(--radius-lg);
    padding: var(--space-3) var(--space-4);
  }

  .co-summary-restaurant-label {
    font-size: var(--text-xs);
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 2px;
  }

  .co-summary-restaurant-name {
    font-size: var(--text-sm);
    font-weight: var(--fw-semibold);
    color: var(--accent-orange-light);
  }

  /* Price rows */
  .co-price-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding-bottom: var(--space-4);
    border-bottom: 1px solid var(--border-subtle);
  }

  .co-price-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .co-price-row dt {
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  .co-price-row dd {
    font-size: var(--text-sm);
    font-weight: var(--fw-semibold);
    color: var(--text-primary);
  }

  /* Grand total */
  .co-total-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-5);
    background: rgba(255, 107, 53, 0.06);
    border: 1px solid rgba(255, 107, 53, 0.14);
    border-radius: var(--radius-xl);
  }

  .co-total-label {
    font-size: var(--text-sm);
    font-weight: var(--fw-bold);
    color: var(--text-primary);
  }

  .co-total-sub {
    font-size: var(--text-xs);
    color: var(--text-muted);
    margin-top: 2px;
  }

  .co-total-amount {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: var(--fw-black);
    color: var(--accent-orange);
    letter-spacing: -0.02em;
    flex-shrink: 0;
  }

  /* Security badge */
  .co-secure-badge {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-xs);
    color: var(--text-muted);
    justify-content: center;
  }

  /* Place order button */
  .co-place-btn {
    width: 100%;
    justify-content: center;
    font-size: var(--text-base) !important;
    padding: 0.9rem 1.5rem !important;
    border-radius: var(--radius-xl) !important;
  }

  /* ── Empty / Unauth states ── */
  .co-empty-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 65vh;
    padding: var(--space-6);
  }

  .co-empty-card {
    padding: var(--space-10) var(--space-8);
    max-width: 460px;
    width: 100%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
  }

  .co-empty-title {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: var(--fw-bold);
    color: var(--text-primary);
  }

  .co-empty-desc {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: var(--lh-relaxed);
    max-width: 320px;
  }

  /* ── Sandbox Modal ── */
  .co-modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(7, 7, 10, 0.82);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-5);
  }

  .co-modal {
    max-width: 448px;
    width: 100%;
    padding: var(--space-8);
    background: rgba(20, 20, 28, 0.96);
    border: 1px solid rgba(255, 107, 53, 0.28);
    box-shadow: 0 24px 60px rgba(0,0,0,0.55), 0 0 44px rgba(255, 107, 53, 0.12);
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-4);
    text-align: center;
  }

  .co-modal-close {
    position: absolute;
    top: var(--space-4);
    right: var(--space-4);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-lg);
    background: var(--glass-bg);
    border: 1px solid var(--border-subtle);
    color: var(--text-secondary);
    cursor: pointer;
    transition: var(--transition-fast);
  }

  .co-modal-close:hover {
    background: var(--glass-bg-strong);
    color: var(--text-primary);
  }

  .co-modal-badge {
    margin-bottom: var(--space-1);
  }

  .co-modal-title {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: var(--fw-bold);
    color: var(--text-primary);
    line-height: var(--lh-snug);
  }

  .co-modal-desc {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: var(--lh-relaxed);
    max-width: 340px;
  }

  .co-modal-info {
    width: 100%;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    text-align: left;
  }

  .co-modal-info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: var(--text-sm);
    gap: var(--space-4);
  }

  .co-modal-info-row > span:first-child {
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .co-modal-info-row > span:last-child {
    color: var(--text-primary);
    font-weight: var(--fw-medium);
    word-break: break-all;
  }

  .co-modal-error {
    width: 100%;
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    font-size: var(--text-xs);
    color: var(--accent-red-light);
    background: rgba(239, 68, 68, 0.08);
    border: 1px solid rgba(239, 68, 68, 0.18);
    border-radius: var(--radius-md);
    padding: var(--space-3);
    text-align: left;
  }

  .co-modal-actions {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  /* ── Responsive ── */
  @media (max-width: 1024px) {
    .co-layout {
      grid-template-columns: 1fr 320px;
      gap: var(--space-6);
    }
  }

  @media (max-width: 768px) {
    .co-layout {
      grid-template-columns: 1fr;
    }

    .co-summary {
      position: static;
    }

    .co-body {
      padding-top: var(--space-6);
      padding-bottom: var(--space-12);
    }

    .co-hero {
      padding: var(--space-8) 0 var(--space-6);
    }
  }

  @media (max-width: 480px) {
    .co-section {
      padding: var(--space-5);
    }

    .co-summary {
      padding: var(--space-5);
    }

    .co-total-row {
      padding: var(--space-3) var(--space-4);
    }
  }
`;
