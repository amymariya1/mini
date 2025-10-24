import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const userData = JSON.parse(localStorage.getItem('mm_user') || 'null');
      setUser(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  // If no specific roles are required, just check if user exists
  if (allowedRoles.length === 0 && !user) {
    return <Navigate to="/login" replace />;
  }

  // If specific roles are required, check if user has the required role
  if (allowedRoles.length > 0 && (!user || !allowedRoles.includes(user.userType))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
