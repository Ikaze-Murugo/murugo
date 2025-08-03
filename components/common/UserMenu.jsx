"use client";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function UserMenu() {
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="spinner-border spinner-border-sm" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="d-flex align-items-center gap-2">
        <a 
          href="#modalLogin" 
          data-bs-toggle="modal" 
          className="btn btn-outline-primary btn-sm"
        >
          Login
        </a>
        <a 
          href="#modalRegister" 
          data-bs-toggle="modal" 
          className="btn btn-primary btn-sm"
        >
          Register
        </a>
      </div>
    );
  }

  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-primary dropdown-toggle d-flex align-items-center"
        type="button"
        id="userDropdown"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        <div className="avatar-circle me-2">
          {user.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <span className="d-none d-md-inline">
          {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
        </span>
      </button>
      <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
        <li className="dropdown-header">
          <div className="d-flex flex-column">
            <span className="fw-bold">{user.user_metadata?.name || 'User'}</span>
            <small className="text-muted">{user.email}</small>
            {user.user_metadata?.role && (
              <small className="badge bg-secondary mt-1 align-self-start">
                {user.user_metadata.role === 'homeowner' ? 'Property Owner' : 
                 user.user_metadata.role === 'admin' ? 'Administrator' : 'User'}
              </small>
            )}
          </div>
        </li>
        <li><hr className="dropdown-divider" /></li>
        <li>
          <Link className="dropdown-item" href="/dashboard">
            <i className="icon icon-dashboard me-2"></i>
            Dashboard
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" href="/profile">
            <i className="icon icon-user me-2"></i>
            Profile
          </Link>
        </li>
        <li>
          <Link className="dropdown-item" href="/favorites">
            <i className="icon icon-heart me-2"></i>
            My Favorites
          </Link>
        </li>
        {user?.user_metadata?.role === 'homeowner' && (
          <li>
            <Link className="dropdown-item" href="/submit-property">
              <i className="icon icon-plus me-2"></i>
              Submit Property
            </Link>
          </li>
        )}
        {user?.user_metadata?.role === 'admin' && (
          <li>
            <Link className="dropdown-item" href="/admin">
              <i className="icon icon-settings me-2"></i>
              Admin Panel
            </Link>
          </li>
        )}
        <li><hr className="dropdown-divider" /></li>
        <li>
          <button
            className="dropdown-item text-danger"
            onClick={handleSignOut}
          >
            <i className="icon icon-logout me-2"></i>
            Sign Out
          </button>
        </li>
      </ul>

      <style jsx>{`
        .avatar-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
        }
        .dropdown-menu {
          min-width: 250px;
          border: none;
          box-shadow: 0 10px 40px rgba(0,0,0,0.1);
          border-radius: 12px;
        }
        .dropdown-item {
          padding: 10px 20px;
          border-radius: 8px;
          margin: 2px 8px;
        }
        .dropdown-item:hover {
          background-color: #f8f9fa;
        }
        .dropdown-header {
          padding: 15px 20px 10px;
          border-bottom: 1px solid #eee;
          margin-bottom: 5px;
        }
        .badge {
          font-size: 10px;
          font-weight: normal;
        }
      `}</style>
    </div>
  );
}
