import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfile?: boolean;
  requireGoals?: boolean;
}

/**
 * ProtectedRoute component to guard routes with authentication and setup requirements
 * 
 * @param children - Component to render if protected conditions are met
 * @param requireProfile - If true, redirect to /profile-setup if profile not complete
 * @param requireGoals - If true, redirect to /goal-setup if goals not complete
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireProfile = true,
  requireGoals = true,
}) => {
  const { isLoggedIn, isLoading, hasProfile, hasGoals } = useAuth();
  const location = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="glass-card p-8 flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to profile setup if required and not completed
  if (requireProfile && !hasProfile && location.pathname !== '/profile-setup') {
    return <Navigate to="/profile-setup" replace />;
  }

  // Redirect to goal setup if profile complete but goals not, and goals required
  if (
    requireGoals &&
    hasProfile &&
    !hasGoals &&
    location.pathname !== '/goal-setup' &&
    location.pathname !== '/profile-setup'
  ) {
    return <Navigate to="/goal-setup" replace />;
  }

  return <>{children}</>;
};
