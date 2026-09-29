"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Clock, MapPin, Star, ChevronRight } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/orders", label: "Order History", icon: Clock },
    { href: "/dashboard/addresses", label: "Addresses", icon: MapPin },
    { href: "/dashboard/reviews", label: "Reviews", icon: Star },
  ];

  return (
    <aside className="dashboard-sidebar">
      {/* Sidebar brand header */}
      <div className="sidebar-header">
        <div className="sidebar-header-icon">🍔</div>
        <div>
          <div className="sidebar-header-label">My Account</div>
          <div className="sidebar-header-sub">CraveBite Dashboard</div>
        </div>
      </div>

      <div className="sidebar-section-label">Navigation</div>

      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={`sidebar-link ${isActive ? "active" : ""}`}
          >
            <span className="sidebar-link-icon">
              <Icon size={16} />
            </span>
            <span style={{ flex: 1 }}>{link.label}</span>
            {isActive && <ChevronRight size={14} style={{ opacity: 0.5 }} />}
          </Link>
        );
      })}
    </aside>
  );
}
