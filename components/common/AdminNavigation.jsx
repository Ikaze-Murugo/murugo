"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function AdminNavigation() {
  const { user } = useAuth();
  const pathname = usePathname();

  // Only show for admin users
  if (user?.user_metadata?.role !== 'admin') {
    return null;
  }

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: "icon-dashboard"
    },
    {
      href: "/admin/properties",
      label: "Properties",
      icon: "icon-home"
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: "icon-user"
    },
    {
      href: "/admin/messages",
      label: "Messages",
      icon: "icon-message"
    },
    {
      href: "/admin/reviews",
      label: "Reviews",
      icon: "icon-star"
    }
  ];

  const isActive = (href) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="admin-navigation">
      <div className="container">
        <div className="nav-wrapper">
          <div className="d-flex align-items-center">
            <span className="admin-badge me-3">
              <i className="icon icon-shield me-1"></i>
              Admin Panel
            </span>
            <nav className="admin-nav">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                >
                  <i className={`${item.icon} me-1`}></i>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link href="/dashboard" className="btn btn-outline-light btn-sm">
            Exit Admin
          </Link>
        </div>
      </div>

      <style jsx>{`
        .admin-navigation {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 0.75rem 0;
          border-bottom: 3px solid rgba(255,255,255,0.2);
        }
        .nav-wrapper {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .admin-badge {
          color: white;
          font-weight: 600;
          font-size: 0.9rem;
        }
        .admin-nav {
          display: flex;
          gap: 0.5rem;
          margin-left: 2rem;
        }
        .nav-item {
          color: rgba(255,255,255,0.8);
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          transition: all 0.2s;
          font-size: 0.9rem;
          font-weight: 500;
        }
        .nav-item:hover {
          color: white;
          background: rgba(255,255,255,0.1);
          text-decoration: none;
        }
        .nav-item.active {
          color: white;
          background: rgba(255,255,255,0.2);
        }
        @media (max-width: 768px) {
          .admin-nav {
            display: none;
          }
          .nav-wrapper {
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}
