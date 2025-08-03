"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAdminDashboardStats } from "@/utils/adminQueries";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footer/Footer1";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    properties: { total: 0, pending: 0, approved: 0, rejected: 0 },
    users: { total: 0, users: 0, homeowners: 0, agents: 0, admins: 0, active: 0, inactive: 0 },
    activity: { submissions_this_week: 0 },
    messages: { total: 0, unread: 0 }
  });
  const [loading, setLoading] = useState(true);

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
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const dashboardStats = await getAdminDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
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
            <h2>Admin Dashboard</h2>
            <p className="text-muted">Platform management and analytics</p>
          </div>
          <div className="d-flex gap-2">
            <Link href="/admin/properties" className="btn btn-primary">
              Manage Properties
            </Link>
            <Link href="/admin/users" className="btn btn-outline-primary">
              Manage Users
            </Link>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="row mb-4">
          {/* Property Stats */}
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card stats-card bg-primary text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Total Properties</h6>
                    <h2 className="card-title mb-0">{stats.properties.total}</h2>
                  </div>
                  <div className="stats-icon">
                    <i className="icon icon-home fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Properties */}
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card stats-card bg-warning text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Pending Review</h6>
                    <h2 className="card-title mb-0">{stats.properties.pending}</h2>
                  </div>
                  <div className="stats-icon">
                    <i className="icon icon-clock fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Total Users */}
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card stats-card bg-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Total Users</h6>
                    <h2 className="card-title mb-0">{stats.users.total}</h2>
                  </div>
                  <div className="stats-icon">
                    <i className="icon icon-user fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Unread Messages */}
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card stats-card bg-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="card-subtitle mb-2">Unread Messages</h6>
                    <h2 className="card-title mb-0">{stats.messages.unread}</h2>
                  </div>
                  <div className="stats-icon">
                    <i className="icon icon-message fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats Row */}
        <div className="row mb-4">
          {/* Property Breakdown */}
          <div className="col-lg-6 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Property Status Breakdown</h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-3">
                    <div className="stat-item">
                      <h4 className="text-warning">{stats.properties.pending}</h4>
                      <small className="text-muted">Pending</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="stat-item">
                      <h4 className="text-success">{stats.properties.approved}</h4>
                      <small className="text-muted">Approved</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="stat-item">
                      <h4 className="text-danger">{stats.properties.rejected}</h4>
                      <small className="text-muted">Rejected</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="stat-item">
                      <h4 className="text-primary">{stats.activity.submissions_this_week}</h4>
                      <small className="text-muted">This Week</small>
                    </div>
                  </div>
                </div>
                <hr />
                <div className="d-grid">
                  <Link href="/admin/properties" className="btn btn-outline-primary">
                    Manage All Properties
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* User Breakdown */}
          <div className="col-lg-6 mb-4">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">User Role Breakdown</h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-3">
                    <div className="stat-item">
                      <h4 className="text-primary">{stats.users.users}</h4>
                      <small className="text-muted">Browsers</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="stat-item">
                      <h4 className="text-success">{stats.users.homeowners}</h4>
                      <small className="text-muted">Owners</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="stat-item">
                      <h4 className="text-info">{stats.users.agents}</h4>
                      <small className="text-muted">Agents</small>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className="stat-item">
                      <h4 className="text-warning">{stats.users.admins}</h4>
                      <small className="text-muted">Admins</small>
                    </div>
                  </div>
                </div>
                <hr />
                <div className="row">
                  <div className="col-6">
                    <small className="text-muted">Active: {stats.users.active}</small>
                  </div>
                  <div className="col-6">
                    <small className="text-muted">Inactive: {stats.users.inactive}</small>
                  </div>
                </div>
                <div className="d-grid mt-3">
                  <Link href="/admin/users" className="btn btn-outline-primary">
                    Manage All Users
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="row">
          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Quick Actions</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-lg-3 col-md-6 mb-3">
                    <Link href="/admin/properties?status=pending" className="quick-action-card">
                      <div className="d-flex align-items-center">
                        <div className="quick-action-icon bg-warning">
                          <i className="icon icon-clock"></i>
                        </div>
                        <div className="ms-3">
                          <h6 className="mb-1">Review Pending</h6>
                          <small className="text-muted">{stats.properties.pending} properties</small>
                        </div>
                      </div>
                    </Link>
                  </div>

                  <div className="col-lg-3 col-md-6 mb-3">
                    <Link href="/admin/messages?is_read=false" className="quick-action-card">
                      <div className="d-flex align-items-center">
                        <div className="quick-action-icon bg-info">
                          <i className="icon icon-message"></i>
                        </div>
                        <div className="ms-3">
                          <h6 className="mb-1">Check Messages</h6>
                          <small className="text-muted">{stats.messages.unread} unread</small>
                        </div>
                      </div>
                    </Link>
                  </div>

                  <div className="col-lg-3 col-md-6 mb-3">
                    <Link href="/admin/reviews?status=pending" className="quick-action-card">
                      <div className="d-flex align-items-center">
                        <div className="quick-action-icon bg-primary">
                          <i className="icon icon-star"></i>
                        </div>
                        <div className="ms-3">
                          <h6 className="mb-1">Moderate Reviews</h6>
                          <small className="text-muted">Review system</small>
                        </div>
                      </div>
                    </Link>
                  </div>

                  <div className="col-lg-3 col-md-6 mb-3">
                    <Link href="/admin/users?verification_status=pending" className="quick-action-card">
                      <div className="d-flex align-items-center">
                        <div className="quick-action-icon bg-success">
                          <i className="icon icon-user"></i>
                        </div>
                        <div className="ms-3">
                          <h6 className="mb-1">User Verification</h6>
                          <small className="text-muted">Verify accounts</small>
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer1 />

      <style jsx>{`
        .stats-card {
          border: none;
          border-radius: 15px;
          transition: transform 0.2s;
        }
        .stats-card:hover {
          transform: translateY(-5px);
        }
        .stats-icon {
          opacity: 0.7;
        }
        .stat-item {
          padding: 1rem 0;
        }
        .quick-action-card {
          display: block;
          padding: 1.25rem;
          border: 1px solid #e9ecef;
          border-radius: 10px;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
          height: 100%;
        }
        .quick-action-card:hover {
          border-color: #007bff;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,123,255,0.15);
          color: inherit;
          text-decoration: none;
        }
        .quick-action-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .card {
          border: none;
          border-radius: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .card-header {
          border-bottom: 1px solid #e9ecef;
          background: #f8f9fa;
          border-radius: 15px 15px 0 0 !important;
        }
      `}</style>
    </>
  );
}