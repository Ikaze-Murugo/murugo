"use client";
import Link from "next/link";
import Image from "next/image";

export default function Hero() {
  return (
    <section className="hero-section">
      <div className="hero-slider">
        <div className="hero-slide active">
          <div className="hero-bg">
            <Image
              src="/images/banner/banner.png"
              alt="Murugo - Rwanda Real Estate"
              width={1920}
              height={800}
              priority
            />
          </div>
          <div className="hero-content">
            <div className="container">
              <div className="row">
                <div className="col-lg-8 col-md-10">
                  <div className="hero-text">
                    <h1 className="hero-title">
                      Find Your Dream Home in <span className="text-primary">Rwanda</span>
                    </h1>
                    <p className="hero-subtitle">
                      Discover the perfect property in the heart of Africa. From modern apartments in Kigali 
                      to luxury villas across Rwanda, Murugo connects you with exceptional real estate opportunities.
                    </p>
                    <div className="hero-actions">
                      <Link href="/sidebar-grid" className="tf-btn btn-primary">
                        Browse Properties
                      </Link>
                      <Link href="/submit-property" className="tf-btn btn-secondary">
                        List Your Property
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="hero-search">
        <div className="container">
          <div className="search-box">
            <div className="row">
              <div className="col-lg-3 col-md-6">
                <div className="search-item">
                  <label>Property Type</label>
                  <select className="form-select">
                    <option>All Types</option>
                    <option>House</option>
                    <option>Apartment</option>
                    <option>Villa</option>
                    <option>Office</option>
                    <option>Land</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="search-item">
                  <label>Location</label>
                  <select className="form-select">
                    <option>All Locations</option>
                    <option>Kigali</option>
                    <option>Huye</option>
                    <option>Musanze</option>
                    <option>Rubavu</option>
                    <option>Rusizi</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="search-item">
                  <label>Price Range</label>
                  <select className="form-select">
                    <option>Any Price</option>
                    <option>Under 50M RWF</option>
                    <option>50M - 100M RWF</option>
                    <option>100M - 200M RWF</option>
                    <option>Over 200M RWF</option>
                  </select>
                </div>
              </div>
              <div className="col-lg-3 col-md-6">
                <div className="search-item">
                  <label>&nbsp;</label>
                  <Link href="/sidebar-grid" className="tf-btn btn-primary w-100">
                    Search Properties
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
