"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getPropertiesByOwner } from "@/utils/propertyQueries";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footer/Footer1";
import Link from "next/link";

export default function MyPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    listing_type: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Check if user is homeowner
  if (user?.user_metadata?.role !== 'homeowner') {
    return (
      <>
        <Header1 />
        <div className="container my-5">
          <div className="alert alert-warning">
            <h4>Homeowner Access Required</h4>
            <p>You need to be registered as a homeowner to access this page.</p>
            <div className="d-flex gap-2">
              <Link href="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
              <Link href="/submit-property" className="btn btn-outline-primary">
                Submit a Property
              </Link>
            </div>
          </div>
        </div>
        <Footer1 />
      </>
    );
  }

  useEffect(() => {
    fetchMyProperties();
  }, [user, filters]);

  const fetchMyProperties = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const { data, error } = await getPropertiesByOwner(user.id, filters);
      if (error) {
        console.error('Error fetching properties:', error);
      } else {
        setProperties(data || []);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
      return;
    }

    try {
      // You'll need to implement this function in propertyQueries.js
      // const { error } = await deleteProperty(propertyId);
      // For now, we'll just show an alert
      alert('Property deletion will be implemented in the next update.');
      // await fetchMyProperties(); // Refresh the list
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Failed to delete property');
    }
  };

  const filteredProperties = properties.filter(property => {
    // Apply filters
    if (filters.status !== 'all' && property.status !== filters.status) {
      return false;
    }
    if (filters.listing_type !== 'all' && property.listing_type !== filters.listing_type) {
      return false;
    }
    
    // Apply search
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        property.title?.toLowerCase().includes(searchLower) ||
        property.address?.toLowerCase().includes(searchLower) ||
        property.city?.toLowerCase().includes(searchLower) ||
        property.state_province?.toLowerCase().includes(searchLower)
      );
    }
    
    return true;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning text-dark',
      approved: 'bg-success',
      rejected: 'bg-danger',
      draft: 'bg-secondary',
      active: 'bg-info',
      sold: 'bg-dark',
      rented: 'bg-primary'
    };
    return `badge ${badges[status] || 'bg-secondary'}`;
  };

  const getStatusCount = (status) => {
    if (status === 'all') return properties.length;
    return properties.filter(p => p.status === status).length;
  };

  const getListingTypeCount = (type) => {
    if (type === 'all') return properties.length;
    return properties.filter(p => p.listing_type === type).length;
  };

  if (loading) {
    return (
      <>
        <Header1 />
        <div className="container my-5 text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <Footer1 />
      </>
    );
  }

  return (
    <>
      <Header1 />
      <div className="container my-5">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2>My Properties</h2>
            <p className="text-muted">Manage your property listings and submissions</p>
          </div>
          <div className="d-flex gap-2">
            <Link href="/submit-property" className="btn btn-primary">
              <i className="icon icon-plus me-1"></i>
              Add New Property
            </Link>
            <Link href="/dashboard" className="btn btn-outline-primary">
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="row mb-4">
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card stats-card bg-primary text-white">
              <div className="card-body text-center">
                <h3 className="mb-1">{properties.length}</h3>
                <small>Total Properties</small>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card stats-card bg-warning text-dark">
              <div className="card-body text-center">
                <h3 className="mb-1">{getStatusCount('pending')}</h3>
                <small>Pending Review</small>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card stats-card bg-success text-white">
              <div className="card-body text-center">
                <h3 className="mb-1">{getStatusCount('approved')}</h3>
                <small>Approved</small>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card stats-card bg-info text-white">
              <div className="card-body text-center">
                <h3 className="mb-1">{getStatusCount('active')}</h3>
                <small>Active Listings</small>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row align-items-end">
              <div className="col-lg-3 col-md-6 mb-2">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="all">All Status ({getStatusCount('all')})</option>
                  <option value="pending">Pending ({getStatusCount('pending')})</option>
                  <option value="approved">Approved ({getStatusCount('approved')})</option>
                  <option value="rejected">Rejected ({getStatusCount('rejected')})</option>
                  <option value="active">Active ({getStatusCount('active')})</option>
                  <option value="sold">Sold ({getStatusCount('sold')})</option>
                  <option value="rented">Rented ({getStatusCount('rented')})</option>
                </select>
              </div>

              <div className="col-lg-3 col-md-6 mb-2">
                <label className="form-label">Listing Type</label>
                <select
                  className="form-select"
                  value={filters.listing_type}
                  onChange={(e) => setFilters({...filters, listing_type: e.target.value})}
                >
                  <option value="all">All Types ({getListingTypeCount('all')})</option>
                  <option value="sale">For Sale ({getListingTypeCount('sale')})</option>
                  <option value="rent">For Rent ({getListingTypeCount('rent')})</option>
                  <option value="lease">For Lease ({getListingTypeCount('lease')})</option>
                </select>
              </div>

              <div className="col-lg-4 col-md-8 mb-2">
                <label className="form-label">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search your properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="col-lg-2 col-md-4 mb-2">
                <button
                  className="btn btn-outline-secondary w-100"
                  onClick={() => {
                    setFilters({ status: 'all', listing_type: 'all' });
                    setSearchTerm('');
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Properties List */}
        {filteredProperties.length === 0 ? (
          <div className="card">
            <div className="card-body text-center py-5">
              {properties.length === 0 ? (
                <>
                  <i className="icon icon-home fs-1 text-muted mb-3"></i>
                  <h4>No Properties Yet</h4>
                  <p className="text-muted mb-4">You haven't submitted any properties yet. Start by adding your first property listing.</p>
                  <Link href="/submit-property" className="btn btn-primary">
                    Submit Your First Property
                  </Link>
                </>
              ) : (
                <>
                  <h4>No Properties Found</h4>
                  <p className="text-muted">No properties match your current filters.</p>
                  <button
                    className="btn btn-outline-primary"
                    onClick={() => {
                      setFilters({ status: 'all', listing_type: 'all' });
                      setSearchTerm('');
                    }}
                  >
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="row">
            {filteredProperties.map((property) => (
              <div key={property.id} className="col-lg-6 col-xl-4 mb-4">
                <div className="card property-card h-100">
                  {/* Property Image */}
                  <div className="position-relative">
                    {property.images?.length > 0 ? (
                      <img
                        src={property.images[0].thumbnail_url || property.images[0].url}
                        alt={property.title}
                        className="card-img-top property-image"
                      />
                    ) : (
                      <div className="property-image-placeholder d-flex align-items-center justify-content-center">
                        <i className="icon icon-image fs-1 text-muted"></i>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className="position-absolute top-0 end-0 m-2">
                      <span className={getStatusBadge(property.status)}>
                        {property.status?.toUpperCase()}
                      </span>
                    </div>
                    
                    {/* Listing Type Badge */}
                    <div className="position-absolute top-0 start-0 m-2">
                      <span className="badge bg-dark">
                        FOR {property.listing_type?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="card-body d-flex flex-column">
                    <div className="flex-grow-1">
                      <h5 className="card-title">{property.title}</h5>
                      <p className="text-muted mb-2">
                        <i className="icon icon-location me-1"></i>
                        {property.address}, {property.city}, {property.state_province}
                      </p>
                      
                      <div className="property-details mb-3">
                        <div className="row text-center">
                          {property.bedrooms && (
                            <div className="col-4">
                              <small className="text-muted">Bedrooms</small>
                              <div className="fw-bold">{property.bedrooms}</div>
                            </div>
                          )}
                          {property.bathrooms && (
                            <div className="col-4">
                              <small className="text-muted">Bathrooms</small>
                              <div className="fw-bold">{property.bathrooms}</div>
                            </div>
                          )}
                          {property.square_footage && (
                            <div className="col-4">
                              <small className="text-muted">Sq Ft</small>
                              <div className="fw-bold">{property.square_footage.toLocaleString()}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="price-section mb-3">
                        <div className="h4 text-primary mb-1">
                          ${property.price?.toLocaleString()}
                          {property.listing_type === 'rent' && <small className="text-muted">/month</small>}
                        </div>
                        {property.original_price && property.original_price !== property.price && (
                          <small className="text-muted text-decoration-line-through">
                            Original: ${property.original_price.toLocaleString()}
                          </small>
                        )}
                      </div>

                      {/* Property Stats */}
                      <div className="property-stats">
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
                    </div>

                    {/* Action Buttons */}
                    <div className="property-actions mt-3">
                      <div className="d-flex gap-2 mb-2">
                        <Link
                          href={`/property-details-v1/${property.id}`}
                          className="btn btn-outline-primary btn-sm flex-fill"
                          target="_blank"
                        >
                          <i className="icon icon-eye me-1"></i>
                          View
                        </Link>
                        <Link
                          href={`/my-properties/edit/${property.id}`}
                          className="btn btn-primary btn-sm flex-fill"
                        >
                          <i className="icon icon-edit me-1"></i>
                          Edit
                        </Link>
                      </div>
                      
                      <div className="dropdown d-grid">
                        <button
                          className="btn btn-outline-secondary btn-sm dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                        >
                          More Actions
                        </button>
                        <ul className="dropdown-menu w-100">
                          {property.status === 'active' && (
                            <>
                              <li>
                                <button className="dropdown-item">
                                  <i className="icon icon-pause me-2"></i>
                                  Pause Listing
                                </button>
                              </li>
                              {property.listing_type === 'sale' && (
                                <li>
                                  <button className="dropdown-item">
                                    <i className="icon icon-check me-2"></i>
                                    Mark as Sold
                                  </button>
                                </li>
                              )}
                              {property.listing_type === 'rent' && (
                                <li>
                                  <button className="dropdown-item">
                                    <i className="icon icon-check me-2"></i>
                                    Mark as Rented
                                  </button>
                                </li>
                              )}
                            </>
                          )}
                          
                          {property.status === 'draft' && (
                            <li>
                              <button className="dropdown-item">
                                <i className="icon icon-send me-2"></i>
                                Submit for Review
                              </button>
                            </li>
                          )}
                          
                          <li>
                            <button className="dropdown-item">
                              <i className="icon icon-copy me-2"></i>
                              Duplicate Listing
                            </button>
                          </li>
                          
                          <li>
                            <button className="dropdown-item">
                              <i className="icon icon-camera me-2"></i>
                              Manage Photos
                            </button>
                          </li>
                          
                          <li><hr className="dropdown-divider" /></li>
                          
                          <li>
                            <button 
                              className="dropdown-item text-danger"
                              onClick={() => handleDeleteProperty(property.id)}
                            >
                              <i className="icon icon-trash me-2"></i>
                              Delete Property
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Additional Info Footer */}
                  <div className="card-footer bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        Created: {new Date(property.created_at).toLocaleDateString()}
                      </small>
                      {property.updated_at !== property.created_at && (
                        <small className="text-muted">
                          Updated: {new Date(property.updated_at).toLocaleDateString()}
                        </small>
                      )}
                    </div>
                    {property.rejection_reason && (
                      <div className="mt-2">
                        <small className="text-danger">
                          <strong>Rejection Reason:</strong> {property.rejection_reason}
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer1 />

      <style jsx>{`
        .stats-card {
          border: none;
          border-radius: 10px;
          transition: transform 0.2s;
        }
        .stats-card:hover {
          transform: translateY(-2px);
        }
        .property-card {
          border: none;
          border-radius: 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .property-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        .property-image {
          height: 200px;
          object-fit: cover;
          border-radius: 15px 15px 0 0;
        }
        .property-image-placeholder {
          height: 200px;
          background: #f8f9fa;
          border-radius: 15px 15px 0 0;
        }
        .property-details, .property-stats {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 0.75rem;
        }
        .card-footer {
          border-radius: 0 0 15px 15px;
          border-top: 1px solid #e9ecef;
        }
      `}</style>
    </>
  );
}