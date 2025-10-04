import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  type: 'patient' | 'staff';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, type }) => {
  const { isPatientLoggedIn, isStaffLoggedIn } = useAuth();

  if (type === 'patient' && !isPatientLoggedIn) {
    return <Navigate to="/auth/patient" replace />;
  }

  if (type === 'staff' && !isStaffLoggedIn) {
    return <Navigate to="/auth/staff" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
