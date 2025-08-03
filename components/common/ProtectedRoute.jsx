// components/common/ProtectedRoute.jsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children, redirectTo = "/", requireRole = null }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // No user logged in, redirect to specified route or home
        router.push(redirectTo);
        return;
      }

      if (requireRole) {
        // Check if user has required role
        const userRole = user.user_metadata?.role || 'user';
        if (userRole !== requireRole) {
          // User doesn't have required role, redirect
          router.push("/unauthorized");
          return;
        }
      }
    }
  }, [user, loading, router, redirectTo, requireRole]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render children if user is not authenticated
  if (!user) {
    return null;
  }

  // Check role requirement
  if (requireRole) {
    const userRole = user.user_metadata?.role || 'user';
    if (userRole !== requireRole) {
      return null;
    }
  }

  // User is authenticated and has required role, render children
  return children;
}
