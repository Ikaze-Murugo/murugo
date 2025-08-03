"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import ContactPropertyForm from "@/components/forms/ContactPropertyForm";

export default function PropertyCard({ property, className = "" }) {
  const { user } = useAuth();
  const [showContactModal, setShowContactModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Get the primary image
  const primaryImage = property.images?.find(img => img.is_primary) || property.images?.[0];

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!user) {
      alert('Please log in to save favorites');
      return;
    }

    setFavoriteLoading(true);
    try {
      const response = await fetch('/api/properties/favorite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_id: property.id,
          user_id: user.id
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setIsFavorited(!isFavorited);
      } else {
        alert('Error updating favorites');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Error updating favorites');
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Handle property view tracking
  const handleViewProperty = async () => {
    try {
      await fetch('/api/properties/view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          property_id: property.id,
          viewer_id: user?.id || null
        }),
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  return (
    <>
      <div className={`property-card h-100 ${className}`}>
        <div className="card border-0 shadow-sm h-100">
          {/* Property Image */}
          <div className="position-relative">
            <Link 
              href={`/property-details-v1/${property.id}`}
              onClick={handleViewProperty}
            >
              {primaryImage ? (
                <img
                  src={primaryImage.thumbnail_url || primaryImage.url}
                  alt={property.title}
                  className="card-img-top property-image"
                />
              ) : (
                <div className="property-image-placeholder">
                  <i className="icon icon-image fs-1 text-muted"></i>
                </div>
              )}
            </Link>

            {/* Listing Type Badge */}
            <div className="position-absolute top-0 start-0 m-2">
              <span className="badge bg-primary">
                FOR {property.listingTypeDisplay?.toUpperCase()}
              </span>
            </div>

            {/* Favorite Button */}
            <button
              className={`btn position-absolute top-0 end-0 m-2 favorite-btn ${isFavorited ? 'favorited' : ''}`}
              onClick={handleFavoriteToggle}
              disabled={favoriteLoading}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <i className={`icon ${isFavorited ? 'icon-heart-filled' : 'icon-heart'}`}></i>
            </button>

            {/* Property Features Overlay */}
            {(property.bedrooms || property.bathrooms || property.square_footage) && (
              <div className="position-absolute bottom-0 start-0 end-0 property-features-overlay">
                <div className="d-flex justify-content-center gap-3 text-white">
                  {property.bedrooms && (
                    <div className="feature-item">
                      <i className="icon icon-bed me-1"></i>
                      {property.bedrooms} bed
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="feature-item">
                      <i className="icon icon-bath me-1"></i>
                      {property.bathrooms} bath
                    </div>
                  )}
                  {property.square_footage && (
                    <div className="feature-item">
                      <i className="icon icon-expand me-1"></i>
                      {property.square_footage?.toLocaleString()} ft²
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="card-body d-flex flex-column">
            {/* Price */}
            <div className="price-section mb-2">
              <h4 className="text-primary mb-0">
                {formatPrice(property.price)}
                {property.listingType === 'rent' && <small className="text-muted">/month</small>}
              </h4>
              {property.originalPrice && property.originalPrice !== property.price && (
                <small className="text-muted text-decoration-line-through">
                  Was {formatPrice(property.originalPrice)}
                </small>
              )}
            </div>

            {/* Property Title */}
            <h5 className="card-title">
              <Link 
                href={`/property-details-v1/${property.id}`}
                className="text-decoration-none text-dark"
                onClick={handleViewProperty}
              >
                {property.title}
              </Link>
            </h5>

            {/* Location */}
            <p className="text-muted mb-3">
              <i className="icon icon-location me-1"></i>
              {property.fullAddress}
            </p>

            {/* Property Type */}
            <div className="mb-3">
              <span className="badge bg-light text-dark">
                {property.propertyTypeDisplay}
              </span>
              {property.furnished && (
                <span className="badge bg-info ms-2">Furnished</span>
              )}
              {property.pets_allowed && (
                <span className="badge bg-success ms-2">Pet Friendly</span>
              )}
            </div>

            {/* Property Stats */}
            <div className="property-stats mb-3">
              <div className="row text-center">
                <div className="col-4">
                  <small className="text-muted">Views</small>
                  <div className="fw-bold">{property.view_count || 0}</div>
                </div>
                <div className="col-4">
                  <small className="text-muted">Inquiries</small>
                  <div className="fw-bold">{property.inquiry_count || 0}</div>
                </div>
                <div className="col-4">
                  <small className="text-muted">Favorites</small>
                  <div className="fw-bold">{property.favorite_count || 0}</div>
                </div>
              </div>
            </div>

            {/* Contact Person */}
            {property.contactPerson && (
              <div className="contact-person mb-3">
                <small className="text-muted">Contact:</small>
                <div className="fw-bold">{property.contactPerson.name}</div>
                {property.contactPerson.verification_status === 'verified' && (
                  <span className="badge bg-success" style={{fontSize: '0.6rem'}}>VERIFIED</span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-auto">
              <div className="d-flex gap-2">
                <Link
                  href={`/property-details-v1/${property.id}`}
                  className="btn btn-outline-primary flex-fill"
                  onClick={handleViewProperty}
                >
                  <i className="icon icon-eye me-1"></i>
                  View Details
                </Link>
                <button
                  className="btn btn-primary flex-fill"
                  onClick={() => setShowContactModal(true)}
                >
                  <i className="icon icon-message me-1"></i>
                  Contact
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="additional-info mt-2">
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  Listed {new Date(property.created_at).toLocaleDateString()}
                </small>
                {property.available_for_viewing && (
                  <span className="badge bg-warning text-dark" style={{fontSize: '0.6rem'}}>
                    VIEWING AVAILABLE
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Contact Property Owner</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowContactModal(false)}
                ></button>
              </div>
              <div className="modal-header bg-light">
                <div className="d-flex align-items-center">
                  {primaryImage && (
                    <img
                      src={primaryImage.thumbnail_url || primaryImage.url}
                      alt={property.title}
                      className="me-3"
                      style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px'}}
                    />
                  )}
                  <div>
                    <h6 className="mb-1">{property.title}</h6>
                    <small className="text-muted">{property.fullAddress}</small>
                    <div className="mt-1">
                      <span className="fw-bold text-primary">
                        {formatPrice(property.price)}
                        {property.listingType === 'rent' && <small>/month</small>}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-body">
                <ContactPropertyForm
                  property={property}
                  onClose={() => setShowContactModal(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .property-card {
          transition: transform 0.2s ease-in-out;
        }
        .property-card:hover {
          transform: translateY(-4px);
        }
        .property-image {
          height: 250px;
          object-fit: cover;
        }
        .property-image-placeholder {
          height: 250px;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .favorite-btn {
          background: rgba(255,255,255,0.9);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .favorite-btn:hover {
          background: white;
          transform: scale(1.1);
        }
        .favorite-btn.favorited {
          background: #dc3545;
          color: white;
        }
        .property-features-overlay {
          background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
          padding: 1rem;
        }
        .feature-item {
          font-size: 0.9rem;
          font-weight: 500;
        }
        .property-stats {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 0.75rem;
          background: #f8f9fa;
        }
        .contact-person {
          border-left: 3px solid #007bff;
          padding-left: 0.75rem;
        }
        .card {
          border-radius: 12px;
          overflow: hidden;
        }
        .modal.show {
          display: block !important;
        }
      `}</style>
    </>
  );
}