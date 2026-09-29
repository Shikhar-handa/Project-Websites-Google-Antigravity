import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Clock, Utensils, TrendingUp } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null; // Handled by layout redirect
  }

  const userId = session.user.id;

  const [activeOrdersCount, totalOrdersCount, recentOrders] = await Promise.all([
    db.order.count({
      where: { userId, status: { in: ["PENDING", "PREPARING", "OUT_FOR_DELIVERY"] } }
    }),
    db.order.count({
      where: { userId }
    }),
    db.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        restaurant: {
          select: { name: true }
        },
        orderItems: true
      }
    })
  ]);

  const firstName = session.user.name?.split(" ")[0] || "Foodie";

  return (
    <div className="dash-page">

      {/* ── Welcome Card ── */}
      <div className="welcome-card animate-fade-in-up">
        <div className="welcome-card-body">
          <p className="welcome-greeting">Good to see you 👋</p>
          <h1 className="welcome-name">
            Welcome back, <span>{firstName}</span>!
          </h1>
          <p className="welcome-subtitle">
            Ready for your next delicious meal? Explore top-rated restaurants near you or track your active orders.
          </p>
        </div>
        <div className="welcome-card-cta">
          <Link href="/#restaurants" className="btn btn-primary btn-lg">
            <Utensils size={18} />
            Browse Restaurants
          </Link>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="stats-grid animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
        <div className="stat-card stat-card--orange">
          <div className="stat-card-header">
            <span className="stat-card-label">Active Orders</span>
            <div className="stat-card-icon stat-card-icon--orange">
              <Clock size={18} />
            </div>
          </div>
          <div>
            <div className="stat-card-value">{activeOrdersCount}</div>
            <div className="stat-card-sub">
              {activeOrdersCount === 0 ? "No active orders" : "In progress right now"}
            </div>
          </div>
        </div>

        <div className="stat-card stat-card--green">
          <div className="stat-card-header">
            <span className="stat-card-label">Total Orders</span>
            <div className="stat-card-icon stat-card-icon--green">
              <TrendingUp size={18} />
            </div>
          </div>
          <div>
            <div className="stat-card-value">{totalOrdersCount}</div>
            <div className="stat-card-sub">
              {totalOrdersCount === 0 ? "Start ordering today" : "Orders placed with us"}
            </div>
          </div>
        </div>
      </div>

      {/* ── Recent Orders ── */}
      <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
        <div className="section-header">
          <h2 className="section-title">Recent Orders</h2>
          <Link href="/dashboard/orders" className="section-link">
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <ShoppingBag size={30} />
            </div>
            <h3 className="empty-state-title">No orders yet</h3>
            <p className="empty-state-desc">
              You haven&apos;t placed any orders yet. Discover top-rated restaurants near you and start ordering!
            </p>
            <Link href="/#restaurants" className="btn btn-primary">
              Start Exploring
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {recentOrders.map((order) => {
              const isActive = ["PENDING", "PREPARING", "OUT_FOR_DELIVERY"].includes(order.status);
              const badgeClass = isActive
                ? "badge badge-orange animate-pulse"
                : order.status === "DELIVERED"
                ? "badge badge-green"
                : "badge badge-red";

              return (
                <Link
                  href="/dashboard/orders"
                  key={order.id}
                  className="order-card"
                >
                  <div className="order-card-inner">
                    {/* Top row: Restaurant name + badge */}
                    <div className="order-card-top">
                      <span className="order-card-restaurant">
                        {order.restaurant.name}
                      </span>
                      <div className="order-card-badge-wrap">
                        <span className={badgeClass}>
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>

                    {/* Meta row: Order ID + date */}
                    <div className="order-card-meta">
                      <span>
                        #{order.id.slice(-8).toUpperCase()}
                      </span>
                      <span className="order-card-meta-sep">•</span>
                      <span>
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="order-card-meta-sep">•</span>
                      <span>
                        {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Bottom: item count + total */}
                    <div className="order-card-body">
                      <span className="order-card-items-count">
                        {order.orderItems.length} item
                        {order.orderItems.length !== 1 ? "s" : ""}
                      </span>
                      <span className="order-card-total">
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Quick CTA ── */}
      {totalOrdersCount > 0 && (
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.3s" }}
        >
          <Link
            href="/dashboard/orders"
            className="btn btn-secondary"
            style={{ width: "100%", justifyContent: "center", padding: "var(--space-4)" }}
          >
            <ShoppingBag size={16} />
            View Full Order History
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
