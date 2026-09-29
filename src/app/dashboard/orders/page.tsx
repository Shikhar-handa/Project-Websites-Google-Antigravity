import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Package, Clock, Check, ShoppingBag } from "lucide-react";
import Link from "next/link";

function OrderStatusBadge({ status }: { status: string }) {
  const isPulse = ["PENDING", "PREPARING", "OUT_FOR_DELIVERY"].includes(status);

  let colorClass = "badge badge-orange";
  if (status === "DELIVERED") colorClass = "badge badge-green";
  if (status === "CANCELLED") colorClass = "badge badge-red";

  return (
    <span className={`${colorClass} ${isPulse ? "animate-pulse" : ""}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function LiveTracking({ status }: { status: string }) {
  const steps = [
    { id: "PENDING", label: "Order Placed" },
    { id: "PREPARING", label: "Preparing" },
    { id: "OUT_FOR_DELIVERY", label: "On the Way" },
    { id: "DELIVERED", label: "Delivered" },
  ];

  const statusIndex = steps.findIndex((s) => s.id === status);
  if (statusIndex === -1) return null;

  return (
    <div className="tracking-section">
      <div className="tracking-heading">
        <Clock size={16} style={{ color: "var(--accent-orange)" }} className="animate-pulse" />
        Live Tracking
      </div>
      <div className="tracking-bar">
        {steps.map((step, idx) => {
          const isCompleted = idx < statusIndex;
          const isActive = idx === statusIndex;

          return (
            <div
              key={step.id}
              className={`tracking-step${isCompleted ? " completed" : ""}${isActive ? " active" : ""}`}
            >
              <div className="tracking-dot">
                {isCompleted && <Check size={13} />}
              </div>
              <span className="tracking-label">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      restaurant: {
        select: { name: true },
      },
      orderItems: {
        include: {
          menuItem: {
            select: { name: true },
          },
        },
      },
    },
  });

  return (
    <div className="dash-page">

      {/* ── Page Header ── */}
      <div className="dash-page-header animate-fade-in-up">
        <div className="dash-page-icon dash-page-icon--orange">
          <Package size={22} />
        </div>
        <div className="dash-page-titles">
          <h1 className="dash-page-title">Order History</h1>
          <p className="dash-page-sub">
            {orders.length === 0
              ? "No orders yet"
              : `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`}
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state animate-fade-in-up">
          <div className="empty-state-icon">
            <ShoppingBag size={30} />
          </div>
          <h3 className="empty-state-title">No orders yet</h3>
          <p className="empty-state-desc">
            Looks like you haven&apos;t placed any orders. Browse our top-rated restaurants and start your first order!
          </p>
          <Link href="/#restaurants" className="btn btn-primary">
            Browse Restaurants
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }} className="animate-fade-in-up">
          {orders.map((order) => {
            const isActive = ["PENDING", "PREPARING", "OUT_FOR_DELIVERY"].includes(order.status);

            return (
              <div key={order.id} className="order-detail-card">

                {/* ── Card Header ── */}
                <div className="order-detail-header">
                  {/* Row 1: Restaurant name + status badge */}
                  <div className="order-detail-header-top">
                    <h3 className="order-detail-restaurant">
                      {order.restaurant.name}
                    </h3>
                    <div className="order-detail-badge-wrap">
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>

                  {/* Row 2: Order ID + date */}
                  <div className="order-detail-header-meta">
                    <span className="order-detail-id">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                    <span className="order-detail-date">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {" at "}
                      {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                {/* ── Live Tracking (active orders only) ── */}
                {isActive && <LiveTracking status={order.status} />}

                {/* ── Order Items ── */}
                <div className="order-items-section">
                  <p className="order-items-label">Order Items</p>
                  <ul className="order-items-list">
                    {order.orderItems.map((item) => (
                      <li key={item.id} className="order-item-row">
                        <span className="order-item-qty">{item.quantity}×</span>
                        <span className="order-item-name">
                          {item.menuItem?.name || "Item"}
                        </span>
                        <span className="order-item-price">
                          ₹{item.price * item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ── Grand Total ── */}
                <div className="order-total-row">
                  <span className="order-total-label">Total Paid</span>
                  <span className="order-total-amount">₹{order.totalAmount}</span>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
