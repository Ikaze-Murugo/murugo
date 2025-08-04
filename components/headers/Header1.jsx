"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "@/components/common/UserMenu";
import LoginModals from "@/components/modals/LoginModals";
import MobileNav from "@/components/headers/MobileNav";

export default function Header1() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`header-style-1 ${isScrolled ? "header-fixed" : ""}`}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-3 col-md-6 col-6">
                              <div className="logo">
                  <Link href="/">
                    <Image
                      src="/images/logo/logo.svg"
                      alt="Murugo - Rwanda Real Estate"
                      width={150}
                      height={50}
                      priority
                    />
                  </Link>
                </div>
            </div>
            <div className="col-lg-9 col-md-6 col-6">
              <div className="header-right">
                <div className="header-menu">
                  <nav className="main-menu">
                    <ul className="menu-list">
                      <li className="menu-item">
                        <Link href="/">Home</Link>
                      </li>
                      <li className="menu-item">
                        <Link href="/sidebar-grid">Properties</Link>
                      </li>
                      <li className="menu-item">
                        <Link href="/about-us">About</Link>
                      </li>
                      <li className="menu-item">
                        <Link href="/contact">Contact</Link>
                      </li>
                      {user && (
                        <>
                          <li className="menu-item">
                            <Link href="/submit-property">Submit Property</Link>
                          </li>
                          <li className="menu-item">
                            <Link href="/dashboard">Dashboard</Link>
                          </li>
                        </>
                      )}
                    </ul>
                  </nav>
                </div>
                <div className="header-action">
                  {!loading && (
                    <>
                      {user ? (
                        <UserMenu />
                      ) : (
                        <div className="header-btn">
                          <button
                            className="tf-btn btn-primary"
                            onClick={() => document.getElementById("loginModal").showModal()}
                          >
                            Login
                          </button>
                          <button
                            className="tf-btn btn-secondary"
                            onClick={() => document.getElementById("registerModal").showModal()}
                          >
                            Register
                          </button>
                        </div>
                      )}
                    </>
                  )}
                  <div className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <LoginModals />
      <MobileNav isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}
