import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (user?.role !== "admin") {
    return <Navigate to="/account" replace />;
  }
  return children;
}

export function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/account"} replace />;
  }
  return children;
}
