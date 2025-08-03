"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllUsersForAdmin, updateUserStatus } from "@/utils/adminQueries";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footer/Footer1";
import Link from "next/link";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filters, setFilters] = useState({
    role: 'all',
    verification_status: 'all',
    is_active: 'all'
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
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const queryFilters = {};
      
      if (filters.role !== 'all') {
        queryFilters.role = filters.role;
      }
      
      if (filters.verification_status !== 'all') {
        queryFilters.verification_status = filters.verification_status;
      }
      
      if (filters.is_active !== 'all') {
        queryFilters.is_active = filters.is_active === 'true';
      }

      const { data, error } = await getAllUsersForAdmin(queryFilters);
      if (error) {
        console.error('Error fetching users:', error);
      } else {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId, updates) => {
    setActionLoading(userId);
    try {
      const { data, error } = await updateUserStatus(userId, updates);
      
      if (error) {
        alert(`Failed to update user: ${error.message}`);
      } else {
        alert('User updated successfully!');
        await fetchUsers(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredUsers = users.filter(userData => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      userData.name?.toLowerCase().includes(searchLower) ||
      userData.email?.toLowerCase().includes(searchLower) ||
      userData.phone_number?.toLowerCase().includes(searchLower)
    );
  });

  const getRoleBadge = (role) => {
    const badges = {
      user: 'bg-primary',
      homeowner: 'bg-success',
      agent: 'bg-info',
      admin: 'bg-danger'
    };
    return `badge ${badges[role] || 'bg-secondary'}`;
  };

  const getVerificationBadge = (status) => {
    const badges = {
      pending: 'bg-warning text-dark',
      verified: 'bg-success',
      rejected: 'bg-danger'
    };
    return `badge ${badges[status] || 'bg-secondary'}`;
  };

  const getStatusCount = (type, value) => {
    if (value === 'all') return users.length;
    
    if (type === 'role') {
      return users.filter(u => u.role === value).length;
    }
    if (type === 'verification_status') {
      return users.filter(u => u.verification_status === value).length;
    }
    if (type === 'is_active') {
      return users.filter(u => u.is_active === (value === 'true')).length;
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
            <h2>User Management</h2>
            <p className="text-muted">Manage all platform users and their permissions</p>
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
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={filters.role}
                  onChange={(e) => setFilters({...filters, role: e.target.value})}
                >
                  <option value="all">All Roles ({getStatusCount('role', 'all')})</option>
                  <option value="user">Users ({getStatusCount('role', 'user')})</option>
                  <option value="homeowner">Homeowners ({getStatusCount('role', 'homeowner')})</option>
                  <option value="agent">Agents ({getStatusCount('role', 'agent')})</option>
                  <option value="admin">Admins ({getStatusCount('role', 'admin')})</option>
                </select>
              </div>

              <div className="col-lg-3 col-md-6 mb-2">
                <label className="form-label">Verification</label>
                <select
                  className="form-select"
                  value={filters.verification_status}
                  onChange={(e) => setFilters({...filters, verification_status: e.target.value})}
                >
                  <option value="all">All Status ({getStatusCount('verification_status', 'all')})</option>
                  <option value="pending">Pending ({getStatusCount('verification_status', 'pending')})</option>
                  <option value="verified">Verified ({getStatusCount('verification_status', 'verified')})</option>
                  <option value="rejected">Rejected ({getStatusCount('verification_status', 'rejected')})</option>
                </select>
              </div>

              <div className="col-lg-3 col-md-6 mb-2">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={filters.is_active}
                  onChange={(e) => setFilters({...filters, is_active: e.target.value})}
                >
                  <option value="all">All ({getStatusCount('is_active', 'all')})</option>
                  <option value="true">Active ({getStatusCount('is_active', 'true')})</option>
                  <option value="false">Inactive ({getStatusCount('is_active', 'false')})</option>
                </select>
              </div>

              <div className="col-lg-3 col-md-6 mb-2">
                <label className="form-label">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Users ({filteredUsers.length})</h5>
          </div>
          <div className="card-body p-0">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-5">
                <h4>No Users Found</h4>
                <p className="text-muted">No users match your current filters.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Verification</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Last Login</th>
                      <th width="200">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((userData) => (
                      <tr key={userData.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="user-avatar me-3">
                              {userData.avatar_url ? (
                                <img
                                  src={userData.avatar_url}
                                  alt={userData.name}
                                  className="rounded-circle"
                                  style={{width: '40px', height: '40px', objectFit: 'cover'}}
                                />
                              ) : (
                                <div
                                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                                  style={{width: '40px', height: '40px'}}
                                >
                                  {userData.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                              )}
                            </div>
                            <div>
                              <h6 className="mb-1">{userData.name || 'Unnamed User'}</h6>
                              <small className="text-muted">{userData.email}</small>
                              {userData.phone_number && (
                                <div><small className="text-muted">{userData.phone_number}</small></div>
                              )}
                            </div>
                          </div>
                        </td>
                        
                        <td>
                          <span className={getRoleBadge(userData.role)}>
                            {userData.role?.toUpperCase() || 'USER'}
                          </span>
                          {userData.company && (
                            <div><small className="text-muted">{userData.company}</small></div>
                          )}
                        </td>
                        
                        <td>
                          <span className={getVerificationBadge(userData.verification_status)}>
                            {userData.verification_status?.toUpperCase() || 'PENDING'}
                          </span>
                        </td>
                        
                        <td>
                          <span className={`badge ${userData.is_active ? 'bg-success' : 'bg-secondary'}`}>
                            {userData.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        
                        <td>
                          <small className="text-muted">
                            {new Date(userData.created_at).toLocaleDateString()}
                          </small>
                        </td>
                        
                        <td>
                          <small className="text-muted">
                            {userData.last_login_at 
                              ? new Date(userData.last_login_at).toLocaleDateString()
                              : 'Never'
                            }
                          </small>
                        </td>
                        
                        <td>
                          <div className="dropdown">
                            <button
                              className="btn btn-sm btn-outline-primary dropdown-toggle"
                              type="button"
                              data-bs-toggle="dropdown"
                              disabled={actionLoading === userData.id}
                            >
                              {actionLoading === userData.id ? 'Loading...' : 'Actions'}
                            </button>
                            <ul className="dropdown-menu">
                              {/* Verification Actions */}
                              {userData.verification_status === 'pending' && (
                                <>
                                  <li>
                                    <button
                                      className="dropdown-item"
                                      onClick={() => handleUserAction(userData.id, { verification_status: 'verified' })}
                                    >
                                      Verify User
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      className="dropdown-item text-danger"
                                      onClick={() => handleUserAction(userData.id, { verification_status: 'rejected' })}
                                    >
                                      Reject Verification
                                    </button>
                                  </li>
                                  <li><hr className="dropdown-divider" /></li>
                                </>
                              )}
                              
                              {/* Status Actions */}
                              <li>
                                <button
                                  className="dropdown-item"
                                  onClick={() => handleUserAction(userData.id, { is_active: !userData.is_active })}
                                >
                                  {userData.is_active ? 'Deactivate' : 'Activate'} User
                                </button>
                              </li>
                              
                              {/* Role Changes */}
                              {userData.role !== 'admin' && (
                                <>
                                  <li><hr className="dropdown-divider" /></li>
                                  <li><h6 className="dropdown-header">Change Role</h6></li>
                                  {userData.role !== 'user' && (
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() => handleUserAction(userData.id, { role: 'user' })}
                                      >
                                        Make User
                                      </button>
                                    </li>
                                  )}
                                  {userData.role !== 'homeowner' && (
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() => handleUserAction(userData.id, { role: 'homeowner' })}
                                      >
                                        Make Homeowner
                                      </button>
                                    </li>
                                  )}
                                  {userData.role !== 'agent' && (
                                    <li>
                                      <button
                                        className="dropdown-item"
                                        onClick={() => handleUserAction(userData.id, { role: 'agent' })}
                                      >
                                        Make Agent
                                      </button>
                                    </li>
                                  )}
                                </>
                              )}
                            </ul>
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
        .user-avatar {
          flex-shrink: 0;
        }
        .table th {
          font-weight: 600;
          border-bottom: 2px solid #dee2e6;
        }
        .dropdown-toggle:focus {
          box-shadow: none;
        }
      `}</style>
    </>
  );
}
