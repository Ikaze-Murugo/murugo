"use client";

import ProtectedRoute from "@/components/common/ProtectedRoute";
import { useAuth } from "@/context/AuthContext";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footer/Footer1";
import { useState, useEffect } from "react";
import { getUserFavorites } from "@/utils/favoritesQueries";
import { supabase } from "@/utils/supabaseClient";

function DashboardContent() {
  const { user, getUserProfile } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [submittedPropertiesCount, setSubmittedPropertiesCount] = useState(0);

  useEffect(() => {
    async function fetchUserProfile() {
      if (user) {
        // Fetch user profile
        const { data: profile } = await getUserProfile(user.id);
        setUserProfile(profile);

        // Fetch favorites count
        const { data: favoritesData } = await getUserFavorites(user.id);
        setFavoritesCount(favoritesData?.length || 0);

        // Fetch submitted properties count for homeowners
        if (user.user_metadata?.role === 'homeowner') {
          try {
            const { count, error } = await supabase
              .from('properties')
              .select('*', { count: 'exact', head: true })
              .eq('owner_id', user.id);
            
            if (!error) {
              setSubmittedPropertiesCount(count || 0);
            }
          } catch (error) {
            console.error('Error fetching submitted properties count:', error);
          }
        }
      }
      setLoading(false);
    }

    fetchUserProfile();
  }, [user, getUserProfile]);

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex align-items-center mb-4">
                <div className="avatar-large me-3">
                  {user?.user_metadata?.name ? user.user_metadata.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h2 className="mb-1">Welcome back, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}!</h2>
                  <p className="text-muted mb-1">{user?.email}</p>
                  {user?.user_metadata?.role && (
                    <span className="badge bg-primary">
                      {user.user_metadata.role === 'homeowner' ? 'Property Owner' : 
                       user.user_metadata.role === 'admin' ? 'Administrator' : 'User'}
                    </span>
                  )}
                </div>
              </div>

              <div className="row mt-4">
                <div className="col-md-4">
                  <div className="card">
                    <div className="card-body text-center">
                      <i className="icon icon-heart fs-1 text-primary"></i>
                      <h5 className="card-title mt-3">My Favorites</h5>
                      <p className="card-text">
                        {favoritesCount > 0 
                          ? `You have ${favoritesCount} favorite ${favoritesCount === 1 ? 'property' : 'properties'}`
                          : 'No favorite properties yet'
                        }
                      </p>
                      <a 
                        href={favoritesCount > 0 ? "/favorites" : "/properties-v1"} 
                        className="btn btn-primary"
                      >
                        {favoritesCount > 0 ? 'View Favorites' : 'Browse Properties'}
                      </a>
                    </div>
                  </div>
                </div>

                {user?.user_metadata?.role === 'homeowner' ? (
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body text-center">
                        <i className="icon icon-home fs-1 text-success"></i>
                        <h5 className="card-title mt-3">My Properties</h5>
                        <p className="card-text">
                          {submittedPropertiesCount > 0 
                            ? `You have ${submittedPropertiesCount} submitted ${submittedPropertiesCount === 1 ? 'property' : 'properties'}`
                            : 'No properties submitted yet'
                          }
                        </p>
                        <a 
                          href={submittedPropertiesCount > 0 ? "/my-properties" : "/submit-property"} 
                          className="btn btn-success"
                        >
                          {submittedPropertiesCount > 0 ? 'Manage Properties' : 'Submit Property'}
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="col-md-4">
                    <div className="card">
                      <div className="card-body text-center">
                        <i className="icon icon-search fs-1 text-info"></i>
                        <h5 className="card-title mt-3">Browse Properties</h5>
                        <p className="card-text">Explore our latest property listings</p>
                        <a href="/properties-v1" className="btn btn-info">Browse Properties</a>
                      </div>
                    </div>
                  </div>
                )}

                <div className="col-md-4">
                  <div className="card">
                    <div className="card-body text-center">
                      <i className="icon icon-user fs-1 text-warning"></i>
                      <h5 className="card-title mt-3">My Profile</h5>
                      <p className="card-text">Update your profile information</p>
                      <a href="/profile" className="btn btn-warning">Edit Profile</a>
                    </div>
                  </div>
                </div>
              </div>

              {user?.user_metadata?.role === 'homeowner' && (
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h5 className="card-title">
                          <i className="icon icon-info me-2"></i>
                          Property Owner Resources
                        </h5>
                        <p className="card-text">
                          As a property owner, you can submit properties for listing on our platform. 
                          All submissions are reviewed by our admin team before being published.
                        </p>
                        <div className="d-flex gap-2">
                          <a href="/submit-property" className="btn btn-primary btn-sm">
                            Submit New Property
                          </a>
                          <a href="/my-properties" className="btn btn-outline-primary btn-sm">
                            Manage My Properties
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {user?.user_metadata?.role === 'admin' && (
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="card bg-danger text-white">
                      <div className="card-body">
                        <h5 className="card-title">
                          <i className="icon icon-shield me-2"></i>
                          Administrator Panel
                        </h5>
                        <p className="card-text">
                          You have administrative privileges. Access the admin panel to manage properties, users, and platform settings.
                        </p>
                        <a href="/admin" className="btn btn-light">
                          Open Admin Panel
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .avatar-large {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 32px;
        }
        .card {
          border: none;
          border-radius: 15px;
          transition: transform 0.2s;
        }
        .card:hover {
          transform: translateY(-5px);
        }
        .card-body {
          padding: 2rem;
        }
        .fs-1 {
          font-size: 3rem !important;
        }
        .badge {
          font-size: 12px;
        }
      `}</style>
    </div>
  );
}

export default function Dashboard() {
  return (
    <>
      <Header1 />
      <ProtectedRoute>
        <DashboardContent />
      </ProtectedRoute>
      <Footer1 />
    </>
  );
}
