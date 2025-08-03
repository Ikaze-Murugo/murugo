"use client";

import ProtectedRoute from "@/components/common/ProtectedRoute";
import Header1 from "@/components/headers/Header1";
import Footer1 from "@/components/footer/Footer1";
import SubmitProperty from "@/components/forms/SubmitProperty";
import { useAuth } from "@/context/AuthContext";

function SubmitPropertyContent() {
  const { user } = useAuth();

  // Check if user is homeowner
  const userRole = user?.user_metadata?.role || 'user';
  
  if (userRole !== 'homeowner') {
    return (
      <div className="container my-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 text-center">
            <div className="card shadow">
              <div className="card-body p-5">
                <div className="mb-4">
                  <svg
                    width={80}
                    height={80}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#ffc107"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto"
                  >
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <h3 className="mb-3">Homeowner Account Required</h3>
                <p className="text-muted mb-4">
                  To submit a property listing, you need to have a homeowner account. 
                  Regular user accounts can browse properties, save favorites, and contact property owners.
                </p>
                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                  <a 
                    href="#modalRegister"
                    data-bs-toggle="modal"
                    className="btn btn-primary"
                  >
                    Create Homeowner Account
                  </a>
                  <a href="/properties-v1" className="btn btn-outline-primary">
                    Browse Properties
                  </a>
                </div>
                <hr className="my-4" />
                <small className="text-muted">
                  <strong>Already have a homeowner account?</strong><br />
                  Please contact support if you believe this is an error.
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <SubmitProperty />;
}

export default function SubmitPropertyPage() {
  return (
    <>
      <Header1 />
      <ProtectedRoute>
        <SubmitPropertyContent />
      </ProtectedRoute>
      <Footer1 />
    </>
  );
}
