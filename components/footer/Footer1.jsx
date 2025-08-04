"use client";
import Link from "next/link";
import Image from "next/image";

export default function Footer1() {
  return (
    <footer className="footer-style-1">
      <div className="footer-top">
        <div className="container">
          <div className="row">
            <div className="col-lg-4 col-md-6">
              <div className="footer-widget">
                <div className="footer-logo">
                  <Link href="/">
                    <Image
                      src="/images/logo/logo.svg"
                      alt="Murugo - Rwanda Real Estate"
                      width={150}
                      height={50}
                    />
                  </Link>
                </div>
                <p className="footer-text">
                  Murugo is Rwanda's premier real estate platform, connecting buyers, sellers, and renters 
                  with the perfect properties across the country. Find your dream home in the heart of Africa.
                </p>
                <div className="footer-social">
                  <h6>Follow Us</h6>
                  <div className="social-links">
                    <a href="#" className="social-link">
                      <i className="icon icon-facebook"></i>
                    </a>
                    <a href="#" className="social-link">
                      <i className="icon icon-twitter"></i>
                    </a>
                    <a href="#" className="social-link">
                      <i className="icon icon-instagram"></i>
                    </a>
                    <a href="#" className="social-link">
                      <i className="icon icon-linkedin"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-2 col-md-6">
              <div className="footer-widget">
                <h6 className="footer-title">Quick Links</h6>
                <ul className="footer-links">
                  <li>
                    <Link href="/">Home</Link>
                  </li>
                  <li>
                    <Link href="/sidebar-grid">Properties</Link>
                  </li>
                  <li>
                    <Link href="/about-us">About Us</Link>
                  </li>
                  <li>
                    <Link href="/contact">Contact</Link>
                  </li>
                  <li>
                    <Link href="/submit-property">Submit Property</Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h6 className="footer-title">Property Types</h6>
                <ul className="footer-links">
                  <li>
                    <Link href="/sidebar-grid?type=house">Houses</Link>
                  </li>
                  <li>
                    <Link href="/sidebar-grid?type=apartment">Apartments</Link>
                  </li>
                  <li>
                    <Link href="/sidebar-grid?type=villa">Villas</Link>
                  </li>
                  <li>
                    <Link href="/sidebar-grid?type=office">Commercial</Link>
                  </li>
                  <li>
                    <Link href="/sidebar-grid?type=land">Land</Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h6 className="footer-title">Contact Info</h6>
                <div className="contact-info">
                  <div className="contact-item">
                    <i className="icon icon-location"></i>
                    <div>
                      <h6>Address</h6>
                      <p>Kigali, Rwanda</p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <i className="icon icon-phone"></i>
                    <div>
                      <h6>Phone</h6>
                      <p>+250 788 123 456</p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <i className="icon icon-mail"></i>
                    <div>
                      <h6>Email</h6>
                      <p>info@murugo.rw</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="copyright">
                © 2024 Murugo. All rights reserved. Rwanda's Premier Real Estate Platform.
              </p>
            </div>
            <div className="col-md-6">
              <div className="footer-bottom-links">
                <Link href="/privacy-policy">Privacy Policy</Link>
                <Link href="/terms">Terms of Service</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
