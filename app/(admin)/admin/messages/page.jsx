"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllMessagesForAdmin, updateMessageStatus } from "@/utils/adminQueries";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footer/Footer1";
import Link from "next/link";

export default function AdminMessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [filters, setFilters] = useState({
    is_read: 'all',
    status: 'all',
    message_type: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);

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
    fetchMessages();
  }, [filters]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const queryFilters = {};
      
      if (filters.is_read !== 'all') {
        queryFilters.is_read = filters.is_read === 'true';
      }
      
      if (filters.status !== 'all') {
        queryFilters.status = filters.status;
      }
      
      if (filters.message_type !== 'all') {
        queryFilters.message_type = filters.message_type;
      }

      const { data, error } = await getAllMessagesForAdmin(queryFilters);
      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageAction = async (messageId, updates) => {
    setActionLoading(messageId);
    try {
      const { data, error } = await updateMessageStatus(messageId, updates);
      
      if (error) {
        alert(`Failed to update message: ${error.message}`);
      } else {
        alert('Message updated successfully!');
        await fetchMessages(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating message:', error);
      alert('Failed to update message');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkAction = async (action) => {
    const selectedMessages = messages.filter(m => m.selected);
    if (selectedMessages.length === 0) {
      alert('Please select messages first');
      return;
    }

    if (confirm(`Are you sure you want to ${action} ${selectedMessages.length} messages?`)) {
      for (const message of selectedMessages) {
        const updates = {};
        if (action === 'mark-read') updates.is_read = true;
        if (action === 'mark-unread') updates.is_read = false;
        if (action === 'archive') updates.status = 'archived';
        if (action === 'delete') updates.status = 'deleted';
        
        await handleMessageAction(message.id, updates);
      }
    }
  };

  const filteredMessages = messages.filter(message => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      message.sender_name?.toLowerCase().includes(searchLower) ||
      message.sender_email?.toLowerCase().includes(searchLower) ||
      message.subject?.toLowerCase().includes(searchLower) ||
      message.message?.toLowerCase().includes(searchLower) ||
      message.property?.title?.toLowerCase().includes(searchLower)
    );
  });

  const getStatusBadge = (status) => {
    const badges = {
      new: 'bg-primary',
      replied: 'bg-success',
      pending: 'bg-warning text-dark',
      archived: 'bg-secondary',
      deleted: 'bg-danger'
    };
    return `badge ${badges[status] || 'bg-secondary'}`;
  };

  const getMessageTypeBadge = (type) => {
    const badges = {
      inquiry: 'bg-info',
      contact: 'bg-primary',
      support: 'bg-warning text-dark',
      complaint: 'bg-danger'
    };
    return `badge ${badges[type] || 'bg-secondary'}`;
  };

  const getStatusCount = (type, value) => {
    if (value === 'all') return messages.length;
    
    if (type === 'is_read') {
      return messages.filter(m => m.is_read === (value === 'true')).length;
    }
    if (type === 'status') {
      return messages.filter(m => m.status === value).length;
    }
    if (type === 'message_type') {
      return messages.filter(m => m.message_type === value).length;
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
            <h2>Message Management</h2>
            <p className="text-muted">Manage all platform messages and inquiries</p>
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
                <label className="form-label">Read Status</label>
                <select
                  className="form-select"
                  value={filters.is_read}
                  onChange={(e) => setFilters({...filters, is_read: e.target.value})}
                >
                  <option value="all">All Messages ({getStatusCount('is_read', 'all')})</option>
                  <option value="false">Unread ({getStatusCount('is_read', 'false')})</option>
                  <option value="true">Read ({getStatusCount('is_read', 'true')})</option>
                </select>
              </div>

              <div className="col-lg-3 col-md-6 mb-2">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="all">All Status ({getStatusCount('status', 'all')})</option>
                  <option value="new">New ({getStatusCount('status', 'new')})</option>
                  <option value="replied">Replied ({getStatusCount('status', 'replied')})</option>
                  <option value="pending">Pending ({getStatusCount('status', 'pending')})</option>
                  <option value="archived">Archived ({getStatusCount('status', 'archived')})</option>
                </select>
              </div>

              <div className="col-lg-3 col-md-6 mb-2">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={filters.message_type}
                  onChange={(e) => setFilters({...filters, message_type: e.target.value})}
                >
                  <option value="all">All Types ({getStatusCount('message_type', 'all')})</option>
                  <option value="inquiry">Property Inquiry ({getStatusCount('message_type', 'inquiry')})</option>
                  <option value="contact">General Contact ({getStatusCount('message_type', 'contact')})</option>
                  <option value="support">Support ({getStatusCount('message_type', 'support')})</option>
                  <option value="complaint">Complaint ({getStatusCount('message_type', 'complaint')})</option>
                </select>
              </div>

              <div className="col-lg-3 col-md-6 mb-2">
                <label className="form-label">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Messages ({filteredMessages.length})</h5>
            <div className="btn-group">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleBulkAction('mark-read')}
              >
                Mark Read
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleBulkAction('mark-unread')}
              >
                Mark Unread
              </button>
              <button
                className="btn btn-warning btn-sm"
                onClick={() => handleBulkAction('archive')}
              >
                Archive
              </button>
            </div>
          </div>
          <div className="card-body p-0">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-5">
                <h4>No Messages Found</h4>
                <p className="text-muted">No messages match your current filters.</p>
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
                            setMessages(prev => prev.map(m => ({...m, selected: checked})));
                          }}
                        />
                      </th>
                      <th>Sender</th>
                      <th>Subject</th>
                      <th>Property</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th width="150">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMessages.map((message) => (
                      <tr 
                        key={message.id}
                        className={!message.is_read ? 'table-primary' : ''}
                      >
                        <td>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={message.selected || false}
                            onChange={(e) => {
                              setMessages(prev => prev.map(m => 
                                m.id === message.id ? {...m, selected: e.target.checked} : m
                              ));
                            }}
                          />
                        </td>
                        
                        <td>
                          <div>
                            <div className="fw-bold d-flex align-items-center">
                              {message.sender_name || 'Anonymous'}
                              {!message.is_read && (
                                <span className="badge bg-danger ms-2" style={{fontSize: '0.6rem'}}>NEW</span>
                              )}
                            </div>
                            <small className="text-muted">{message.sender_email}</small>
                            {message.sender_phone && (
                              <div><small className="text-muted">{message.sender_phone}</small></div>
                            )}
                          </div>
                        </td>
                        
                        <td>
                          <div className="message-preview">
                            <div className="fw-bold">
                              {message.subject || 'No Subject'}
                            </div>
                            <small className="text-muted">
                              {message.message?.substring(0, 80)}
                              {message.message?.length > 80 && '...'}
                            </small>
                          </div>
                        </td>
                        
                        <td>
                          {message.property ? (
                            <div>
                              <Link 
                                href={`/property-details-v1/${message.property.id}`}
                                className="fw-bold text-decoration-none"
                                target="_blank"
                              >
                                {message.property.title}
                              </Link>
                              <div>
                                <small className="text-muted">
                                  {message.property.city}, {message.property.state_province}
                                </small>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted">General Message</span>
                          )}
                        </td>
                        
                        <td>
                          <span className={getMessageTypeBadge(message.message_type)}>
                            {message.message_type?.toUpperCase() || 'GENERAL'}
                          </span>
                        </td>
                        
                        <td>
                          <span className={getStatusBadge(message.status)}>
                            {message.status?.toUpperCase() || 'NEW'}
                          </span>
                        </td>
                        
                        <td>
                          <small className="text-muted">
                            {new Date(message.created_at).toLocaleDateString()}
                          </small>
                          <div>
                            <small className="text-muted">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </small>
                          </div>
                        </td>
                        
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => setSelectedMessage(message)}
                              data-bs-toggle="modal"
                              data-bs-target="#messageModal"
                            >
                              View
                            </button>
                            
                            <div className="dropdown">
                              <button
                                className="btn btn-outline-secondary btn-sm dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                disabled={actionLoading === message.id}
                              >
                                Actions
                              </button>
                              <ul className="dropdown-menu">
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleMessageAction(message.id, { is_read: !message.is_read })}
                                  >
                                    Mark as {message.is_read ? 'Unread' : 'Read'}
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleMessageAction(message.id, { status: 'replied' })}
                                  >
                                    Mark as Replied
                                  </button>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => handleMessageAction(message.id, { status: 'archived' })}
                                  >
                                    Archive
                                  </button>
                                </li>
                                <li><hr className="dropdown-divider" /></li>
                                <li>
                                  <button
                                    className="dropdown-item text-danger"
                                    onClick={() => handleMessageAction(message.id, { status: 'deleted' })}
                                  >
                                    Delete
                                  </button>
                                </li>
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

      {/* Message Detail Modal */}
      <div className="modal fade" id="messageModal" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Message Details</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {selectedMessage && (
                <div>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>From:</strong> {selectedMessage.sender_name || 'Anonymous'}
                      <br />
                      <strong>Email:</strong> {selectedMessage.sender_email}
                      {selectedMessage.sender_phone && (
                        <>
                          <br />
                          <strong>Phone:</strong> {selectedMessage.sender_phone}
                        </>
                      )}
                    </div>
                    <div className="col-md-6">
                      <strong>Date:</strong> {new Date(selectedMessage.created_at).toLocaleString()}
                      <br />
                      <strong>Type:</strong> <span className={getMessageTypeBadge(selectedMessage.message_type)}>
                        {selectedMessage.message_type?.toUpperCase()}
                      </span>
                      <br />
                      <strong>Status:</strong> <span className={getStatusBadge(selectedMessage.status)}>
                        {selectedMessage.status?.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  {selectedMessage.property && (
                    <div className="alert alert-info">
                      <strong>Property:</strong> {selectedMessage.property.title}
                      <br />
                      <strong>Location:</strong> {selectedMessage.property.city}, {selectedMessage.property.state_province}
                      <br />
                      <Link 
                        href={`/property-details-v1/${selectedMessage.property.id}`}
                        className="btn btn-sm btn-outline-primary mt-2"
                        target="_blank"
                      >
                        View Property
                      </Link>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <strong>Subject:</strong>
                    <div className="mt-1">{selectedMessage.subject || 'No Subject'}</div>
                  </div>
                  
                  <div className="mb-3">
                    <strong>Message:</strong>
                    <div className="mt-1 border rounded p-3" style={{whiteSpace: 'pre-wrap'}}>
                      {selectedMessage.message}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
              {selectedMessage && (
                <div className="btn-group">
                  <button
                    className="btn btn-success"
                    onClick={() => {
                      handleMessageAction(selectedMessage.id, { status: 'replied' });
                      // Close modal
                      document.querySelector('[data-bs-dismiss="modal"]').click();
                    }}
                  >
                    Mark as Replied
                  </button>
                  <button
                    className="btn btn-warning"
                    onClick={() => {
                      handleMessageAction(selectedMessage.id, { status: 'archived' });
                      // Close modal
                      document.querySelector('[data-bs-dismiss="modal"]').click();
                    }}
                  >
                    Archive
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
        .message-preview {
          max-width: 250px;
        }
        .table-primary {
          background-color: rgba(13, 110, 253, 0.05);
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