import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthProvider';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  type: 'patient' | 'staff';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, type }) => {
  const { isPatientLoggedIn, isStaffLoggedIn, isLoading } = useAuth();

  // Show loading spinner while authentication state is being determined
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">MedConnect Udupi</h2>
          <p className="text-gray-500">Loading your healthcare dashboard...</p>
        </div>
      </div>
    );
  }

  if (type === 'patient' && !isPatientLoggedIn) {
    return <Navigate to="/auth/patient" replace />;
  }

  if (type === 'staff' && !isStaffLoggedIn) {
    return <Navigate to="/auth/staff" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
