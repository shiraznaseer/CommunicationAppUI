import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

/**
 * Protected route wrapper component.
 * Redirects to login if user is not authenticated.
 */
export default function ProtectedRoute({ children }) {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
