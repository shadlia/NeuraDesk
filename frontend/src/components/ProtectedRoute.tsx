import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // You can replace this with a proper loading spinner
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!session) {
    // Redirect to auth page but save the attempted url
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
