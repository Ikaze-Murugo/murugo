"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllReviewsForAdmin, updateReviewStatus } from "@/utils/adminQueries";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footer/Footer1";
import Link from "next/link";

export default function AdminReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    rating: 'all',
    review_type: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReview, setSelectedReview] = useState(null);

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
    fetchReviews();
  }, [filters]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const queryFilters = {};
      
      if (filters.status !== 'all') {
        queryFilters.status = filters.status;
      }
      
      if (filters.rating !== 'all') {
        queryFilters.rating = parseInt(filters.rating);
      }
      
      if (filters.review_type !== 'all') {
        queryFilters.review_type = filters.review_type;
      }

      const { data, error } = await getAllReviewsForAdmin(queryFilters);
      if (error) {
        console.error('Error fetching reviews:', error);
      } else {
        // Ensure data is serializable
        const serializableData = data?.map(review => ({
          ...review,
          created_at: review.created_at ? new Date(review.created_at).toISOString() : null,
          updated_at: review.updated_at ? new Date(review.updated_at).toISOString() : null,
          moderated_at: review.moderated_at ? new Date(review.moderated_at).toISOString() : null,
          response_at: review.response_at ? new Date(review.response_at).toISOString() : null
        })) || [];
        setReviews(serializableData);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (reviewId, updates) => {
    setActionLoading(reviewId);
    try {
      const { data, error } = await updateReviewStatus(reviewId, updates);
      
      if (error) {
        alert(`Failed to update review: ${error.message}`);
      } else {
        alert('Review updated successfully!');
        await fetchReviews(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating review:', error);
      alert('Failed to update review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (action) => {
    const selectedReviews = reviews.filter(r => r.selected);
    if (selectedReviews.length === 0) {
      alert('Please select reviews first');
      return;
    }

    if (confirm(`Are you sure you want to ${action} ${selectedReviews.length} reviews?`)) {
      for (const review of selectedReviews) {
        const updates = {};
        if (action === 'approve') updates.status = 'approved';
        if (action === 'reject') updates.status = 'rejected';
        if (action === 'flag') updates.status = 'flagged';
        
        await handleReviewAction(review.id, updates);
      }
    }
  };

  const filteredReviews = reviews.filter(review => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      review.reviewer_name?.toLowerCase().includes(searchLower) ||
      review.comment?.toLowerCase().includes(searchLower) ||
      review.property?.title?.toLowerCase().includes(searchLower) ||
      review.property?.city?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-warning text-dark',
      approved: 'bg-success',
      rejected: 'bg-danger',
      flagged: 'bg-warning text-dark'
    };
    return `badge ${badges[status] || 'bg-secondary'}`;
  };

  const getReviewTypeBadge = (type) => {
    const badges = {
      property: 'bg-primary',
      agent: 'bg-info',
      experience: 'bg-success'
    };
    return `badge ${badges[type] || 'bg-secondary'}`;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <i
        key={i}
        className={`icon icon-star${i < rating ? ' text-warning' : ' text-muted'}`}
      ></i>
    ));
  };

  const getStatusCount = (type, value) => {
    if (value === 'all') return reviews.length;
    
    if (type === 'status') {
      return reviews.filter(r => r.status === value).length;
    }
    if (type === 'rating') {
      return reviews.filter(r => r.rating === parseInt(value)).length;
    }
    if (type === 'review_type') {
      return reviews.filter(r => r.review_type === value).length;
    }
    
    return 0;
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
            <h2>Review Management</h2>
            <p className="text-muted">Moderate and manage all platform reviews</p>
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
                  <option value="all">All Status ({getStatusCount('status', 'all')})</option>
                  <option value="pending">Pending ({getStatusCount('status', 'pending')})</option>
                  <option value="approved">Approved ({getStatusCount('status', 'approved')})</option>
                  <option value="rejected">Rejected ({getStatusCount('status', 'rejected')})</option>
                  <option value="flagged">Flagged ({getStatusCount('status', 'flagged')})</option>
                </select>
              </div>

              <div className="col-lg-3 col-md-6 mb-2">
                <label className="form-label">Rating</label>
                <select
                  className="form-select"
                  value={filters.rating}
                  onChange={(e) => setFilters({...filters, rating: e.target.value})}
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars ({getStatusCount('rating', '5')})</option>
                  <option value="4">4 Stars ({getStatusCount('rating', '4')})</option>
                  <option value="3">3 Stars ({getStatusCount('rating', '3')})</option>
                  <option value="2">2 Stars ({getStatusCount('rating', '2')})</option>
                  <option value="1">1 Star ({getStatusCount('rating', '1')})</option>
                </select>
              </div>

              <div className="col-lg-3 col-md-6 mb-2">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={filters.review_type}
                  onChange={(e) => setFilters({...filters, review_type: e.target.value})}
                >
                  <option value="all">All Types</option>
                  <option value="property">Property ({getStatusCount('review_type', 'property')})</option>
                  <option value="agent">Agent ({getStatusCount('review_type', 'agent')})</option>
                  <option value="experience">Experience ({getStatusCount('review_type', 'experience')})</option>
                </select>
              </div>

              <div className="col-lg-3 col-md-6 mb-2">
                <label className="form-label">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Reviews ({filteredReviews.length})</h5>
            <div className="btn-group">
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleBulkAction('approve')}
              >
                Bulk Approve
              </button>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => handleBulkAction('reject')}
              >
                Bulk Reject
              </button>
              <button
                className="btn btn-warning btn-sm"
                onClick={() => handleBulkAction('flag')}
              >
                Bulk Flag
              </button>
            </div>
          </div>
          <div className="card-body p-0">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-5">
                <h4>No Reviews Found</h4>
                <p className="text-muted">No reviews match your current filters.</p>
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
                            setReviews(prev => prev.map(r => ({...r, selected: checked})));
                          }}
                        />
                      </th>
                      <th>Reviewer</th>
                      <th>Property</th>
                      <th>Rating</th>
                      <th>Review</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th width="150">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.map((review) => (
                      <tr key={review.id}>
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={review.selected || false}
                            onChange={(e) => {
                              setReviews(prev => prev.map(r => 
                                r.id === review.id ? {...r, selected: e.target.checked} : r
                              ));
                            }}
                          />
                        </td>
                        
                        <td>
                          <div>
                            <div className="fw-bold">{review.reviewer_name}</div>
                            <small className="text-muted">{review.reviewer_email}</small>
                            {review.is_verified_purchase && (
                              <div>
                                <span className="badge bg-success" style={{fontSize: '0.6rem'}}>
                                  VERIFIED
                                </span>
                              </div>
                            )}
                          </div>
                        </td>
                        
                        <td>
                          {review.property ? (
                            <div>
                              <Link 
                                href={`/property-details-v1/${review.property.id}`}
                                className="fw-bold text-decoration-none"
                                target="_blank"
                              >
                                {review.property.title}
                              </Link>
                              <div>
                                <small className="text-muted">
                                  {review.property.city}, {review.property.state_province}
                                </small>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted">General Review</span>
                          )}
                        </td>
                        
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              {renderStars(review.rating)}
                            </div>
                            <span className="fw-bold">{review.rating}/5</span>
                          </div>
                        </td>
                        
                        <td>
                          <div style={{maxWidth: '200px'}}>
                            {review.comment?.substring(0, 100)}
                            {review.comment?.length > 100 && '...'}
                          </div>
                          {review.response_from_owner && (
                            <div className="mt-2">
                              <small className="text-info">
                                <i className="icon icon-reply me-1"></i>
                                Owner responded
                              </small>
                            </div>
                          )}
                        </td>
                        
                        <td>
                          <span className={getReviewTypeBadge(review.review_type)}>
                            {review.review_type?.toUpperCase() || 'GENERAL'}
                          </span>
                        </td>
                        
                        <td>
                          <span className={getStatusBadge(review.status)}>
                            {review.status?.toUpperCase() || 'PENDING'}
                          </span>
                        </td>
                        
                        <td>
                          <small className="text-muted">
                            {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'N/A'}
                          </small>
                        </td>
                        
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => setSelectedReview(review)}
                              data-bs-toggle="modal"
                              data-bs-target="#reviewModal"
                            >
                              View
                            </button>
                            
                            <div className="dropdown">
                              <button
                                className="btn btn-outline-secondary btn-sm dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                disabled={actionLoading === review.id}
                              >
                                Actions
                              </button>
                              <ul className="dropdown-menu">
                                {review.status === 'pending' && (
                                  <>
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() => handleReviewAction(review.id, { status: 'approved' })}
                                      >
                                        Approve
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        className="dropdown-item text-danger"
                                        onClick={() => handleReviewAction(review.id, { status: 'rejected' })}
                                      >
                                        Reject
                                      </button>
                                    </li>
                                  </>
                                )}
                                <li>
                                  <button
                                    className="dropdown-item text-warning"
                                    onClick={() => handleReviewAction(review.id, { status: 'flagged' })}
                                  >
                                    Flag for Review
                                  </button>
                                </li>
                                {review.status !== 'pending' && (
                                  <li>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleReviewAction(review.id, { status: 'pending' })}
                                    >
                                      Reset to Pending
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>
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

      {/* Review Detail Modal */}
      <div className="modal fade" id="reviewModal" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Review Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {selectedReview && (
                <div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Reviewer:</strong> {selectedReview.reviewer_name}
                      <br />
                      <strong>Email:</strong> {selectedReview.reviewer_email}
                      {selectedReview.is_verified_purchase && (
                        <>
                          <br />
                          <span className="badge bg-success">VERIFIED PURCHASE</span>
                        </>
                      )}
                    </div>
                    <div className="col-md-6">
                      <strong>Rating:</strong> 
                      <div className="mt-1">
                        {renderStars(selectedReview.rating)}
                        <span className="ms-2 fw-bold">{selectedReview.rating}/5</span>
                      </div>
                      <strong>Type:</strong> <span className={getReviewTypeBadge(selectedReview.review_type)}>
                        {selectedReview.review_type?.toUpperCase()}
                      </span>
                      <br />
                      <strong>Status:</strong> <span className={getStatusBadge(selectedReview.status)}>
                        {selectedReview.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {selectedReview.property && (
                    <div className="alert alert-info">
                      <strong>Property:</strong> {selectedReview.property.title}
                      <br />
                      <strong>Location:</strong> {selectedReview.property.city}, {selectedReview.property.state_province}
                      <br />
                      <Link 
                        href={`/property-details-v1/${selectedReview.property.id}`}
                        className="btn btn-sm btn-outline-primary mt-2"
                        target="_blank"
                      >
                        View Property
                      </Link>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <strong>Review Comment:</strong>
                    <div className="mt-1 border rounded p-3" style={{whiteSpace: 'pre-wrap'}}>
                      {selectedReview.comment}
                    </div>
                  </div>
                  
                  {selectedReview.response_from_owner && (
                    <div className="mb-3">
                      <strong>Owner Response:</strong>
                      <div className="mt-1 border rounded p-3 bg-light" style={{whiteSpace: 'pre-wrap'}}>
                        {selectedReview.response_from_owner}
                      </div>
                      <small className="text-muted">
                        Responded on: {selectedReview.response_at ? new Date(selectedReview.response_at).toLocaleString() : 'N/A'}
                      </small>
                    </div>
                  )}
                  
                  <div className="text-muted">
                    <small>
                      Submitted on: {selectedReview.created_at ? new Date(selectedReview.created_at).toLocaleString() : 'N/A'}
                    </small>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
              {selectedReview && selectedReview.status === 'pending' && (
                <div className="btn-group">
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      handleReviewAction(selectedReview.id, { status: 'approved' });
                      document.querySelector('[data-bs-dismiss="modal"]').click();
                    }}
                  >
                    Approve
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      handleReviewAction(selectedReview.id, { status: 'rejected' });
                      document.querySelector('[data-bs-dismiss="modal"]').click();
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer1 />

      <style jsx>{`
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
        .icon-star {
          font-size: 0.9rem;
        }
      `}</style>
    </>
  );
}