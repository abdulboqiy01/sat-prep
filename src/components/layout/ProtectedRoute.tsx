import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, preferences, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-medium text-slate-500">Loading student session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If student has not completed onboarding yet, enforce redirection to /onboarding
  const isOnboardingOrDiagnostic =
    location.pathname === '/onboarding' || location.pathname === '/diagnostic';
  const hasCompletedOnboarding = !!profile?.target_score && !!preferences;

  if (!hasCompletedOnboarding && !isOnboardingOrDiagnostic) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};
