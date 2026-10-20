import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// NOTE: client-side guard only (UX). Real authorization must be enforced by a backend.
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) {
    return <section className="container glass pad"><h2>Access denied</h2><p className="muted">Your role ({user.role}) cannot open this page.</p></section>;
  }
  return children;
}
