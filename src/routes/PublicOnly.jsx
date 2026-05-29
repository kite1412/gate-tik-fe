import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';

export function PublicOnly({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
