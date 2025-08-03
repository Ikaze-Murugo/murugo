"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllPropertiesForAdmin, updatePropertyStatus } from "@/utils/adminQueries";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footer/Footer1";
import Link from "next/link";

export default function AdminPropertiesPage() {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    property_type: 'all',
    listing_type: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Check if user is admin
  if (user?.user_metadata?.role !== 'admin') {
    return (
      <>
        <Header1 />
        <div className="container my-5">
          <div className="alert alert-danger">
            <h4>Access Denied</h4>
            <p>You need administrator privileges to access this page.</p>
            <Link href="/dashboard" className="btn btn-primary">
              Go to Dashboard
            </Link>
          </div>
        </div>
        <Footer1 />
      </>
    );
  }

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const queryFilters = {};
      
      if (filters.status !== 'all') {
        if (filters.status === 'pending') {
          queryFilters.status = ['pending'];
        } else {
          queryFilters.status = [filters.status];
        }
      }
      
      if (filters.property_type !== 'all') {
        queryFilters.property_type = filters.property_type;
      }
      
      if (filters.listing_type !== 'all') {
        queryFilters.listing_type = filters.listing_type;
      }

      const { data, error } = await getAllPropertiesForAdmin(queryFilters);
      if (error) {
        console.error('Error fetching properties:', error);
      } else {
        setProperties(data);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyAction = async (propertyId, action, notes = '') => {
    setActionLoading(propertyId);
    try {
      const { data, error } = await updatePropertyStatus(propertyId, action, user.id, notes);
      
      if (error) {
        alert(`Failed to ${action} property: ${error.message}`);
      } else {
        alert(`Property ${action} successfully!`);
        await fetchProperties(); // Refresh the list
      }
    } catch (error) {
      console.error(`Error ${action} property:`, error);
      alert(`Failed to ${action} property`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (action) => {
    const selectedProperties = properties.filter(p => p.selected);
    if (selectedProperties.length === 0) {
      alert('Please select properties first');
      return;
    }

    if (confirm(`Are you sure you want to ${action} ${selectedProperties.length} properties?`)) {
      for (const property of selectedProperties) {
        await handlePropertyAction(property.id, action);
      }
    }
  };

  const filteredProperties = properties.filter(property => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      property.title?.toLowerCase().includes(searchLower) ||
      property.city?.toLowerCase().includes(searchLower) ||
      property.state_province?.toLowerCase().includes(searchLower) ||
      property.owner?.name?.toLowerCase().includes(searchLower) ||
      property.owner?.email?.toLowerCase().includes(searchLower)
    );
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
            <h2>Property Management</h2>
            <p className="text-muted">Review and manage all property submissions</p>
          </div>
          <Link href="/admin" className="btn btn-outline-primary">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Filters and Search */}
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
                  <option value="all">All Statuses ({getStatusCount('all')})</option>
                  <option value="pending">Pending ({getStatusCount('pending')})</option>
                  <option value="approved">Approved ({getStatusCount('approved')})</option>
                  <option value="rejected">Rejected ({getStatusCount('rejected')})</option>
                  <option value="draft">Draft ({getStatusCount('draft')})</option>
                </select>
              </div>

              <div className="col-lg-3 col-md-6 mb-2">
                <label className="form-label">Property Type</label>
                <select
                  className="form-select"
                  value={filters.property_type}
                  onChange={(e) => setFilters({...filters, property_type: e.target.value})}
                >
                  <option value="all">All Types</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="villa">Villa</option>
                </select>
              </div>

              <div className="col-lg-3 col-md-6 mb-2">
                <label className="form-label">Listing Type</label>
                <select
                  className="form-select"
                  value={filters.listing_type}
                  onChange={(e) => setFilters({...filters, listing_type: e.target.value})}
                >
                  <option value="all">All Listings</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                  <option value="lease">For Lease</option>
                </select>
              </div>

              <div className="col-lg-3 col-md-6 mb-2">
                <label className="form-label">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Properties List */}
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Properties ({filteredProperties.length})</h5>
            {filters.status === 'pending' && (
              <div className="btn-group">
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => handleBulkAction('approved')}
                >
                  Bulk Approve
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleBulkAction('rejected')}
                >
                  Bulk Reject
                </button>
              </div>
            )}
          </div>
          <div className="card-body p-0">
            {filteredProperties.length === 0 ? (
              <div className="text-center py-5">
                <h4>No Properties Found</h4>
                <p className="text-muted">No properties match your current filters.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th width="40">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setProperties(prev => prev.map(p => ({...p, selected: checked})));
                          }}
                        />
                      </th>
                      <th>Property</th>
                      <th>Owner</th>
                      <th>Details</th>
                      <th>Status</th>
                      <th>Submitted</th>
                      <th width="200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProperties.map((property) => (
                      <tr key={property.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={property.selected || false}
                            onChange={(e) => {
                              setProperties(prev => prev.map(p => 
                                p.id === property.id ? {...p, selected: e.target.checked} : p
                              ));
                            }}
                          />
                        </td>
                        
                        <td>
                          <div className="d-flex align-items-center">
                            {property.images?.length > 0 && (
                              <img
                                src={property.images[0].thumbnail_url || property.images[0].url}
                                alt={property.title}
                                className="property-thumbnail me-3"
                                style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px'}}
                              />
                            )}
                            <div>
                              <h6 className="mb-1">{property.title}</h6>
                              <small className="text-muted">
                                {property.address}, {property.city}, {property.state_province}
                              </small>
                            </div>
                          </div>
                        </td>
                        
                        <td>
                          <div>
                            <div className="fw-bold">{property.owner?.name || 'Unknown'}</div>
                            <small className="text-muted">{property.owner?.email}</small>
                            {property.contact_phone && (
                              <div><small className="text-muted">{property.contact_phone}</small></div>
                            )}
                          </div>
                        </td>
                        
                        <td>
                          <div>
                            <div className="fw-bold">${property.price?.toLocaleString()}</div>
                            <small className="text-muted">
                              {property.property_type} • {property.listing_type}
                            </small>
                            {property.bedrooms && (
                              <div>
                                <small className="text-muted">
                                  {property.bedrooms}bd • {property.bathrooms}ba
                                </small>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td>
                          <span className={getStatusBadge(property.status)}>
                            {property.status.toUpperCase()}
                          </span>
                          {property.rejection_reason && (
                            <div className="mt-1">
                              <small className="text-danger">
                                Reason: {property.rejection_reason}
                              </small>
                            </div>
                          )}
                        </td>
                        
                        <td>
                          <small className="text-muted">
                            {new Date(property.created_at).toLocaleDateString()}
                          </small>
                          {property.approved_by_user && (
                            <div>
                              <small className="text-success">
                                By: {property.approved_by_user.name}
                              </small>
                            </div>
                          )}
                        </td>
                        
                        <td>
                          <div className="btn-group" role="group">
                            {property.status === 'pending' && (
                              <>
                                <button
                                  className="btn btn-success btn-sm"
                                  onClick={() => handlePropertyAction(property.id, 'approved')}
                                  disabled={actionLoading === property.id}
                                >
                                  {actionLoading === property.id ? '...' : 'Approve'}
                                </button>
                                <button
                                  className="btn btn-danger btn-sm"
                                  onClick={() => {
                                    const reason = prompt('Rejection reason (optional):');
                                    if (reason !== null) {
                                      handlePropertyAction(property.id, 'rejected', reason);
                                    }
                                  }}
                                  disabled={actionLoading === property.id}
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            
                            {property.status === 'approved' && (
                              <button
                                className="btn btn-warning btn-sm"
                                onClick={() => handlePropertyAction(property.id, 'pending')}
                                disabled={actionLoading === property.id}
                              >
                                Unapprove
                              </button>
                            )}
                            
                            <Link
                              href={`/property-details-v1/${property.id}`}
                              className="btn btn-outline-primary btn-sm"
                              target="_blank"
                            >
                              View
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer1 />

      <style jsx>{`
        .property-thumbnail {
          border: 1px solid #dee2e6;
        }
        .table th {
          font-weight: 600;
          border-bottom: 2px solid #dee2e6;
        }
        .btn-group .btn {
          margin-right: 2px;
        }
        .btn-group .btn:last-child {
          margin-right: 0;
        }
      `}</style>
    </>
  );
}