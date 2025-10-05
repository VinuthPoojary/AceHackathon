import { useAuth } from "@/contexts/AuthProvider";

export const AuthDebugger = () => {
  const { currentUser, isPatientLoggedIn, isStaffLoggedIn, isLoading } = useAuth();

  // Only show in development
  if (import.meta.env.MODE !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <div className="space-y-1">
        <div><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</div>
        <div><strong>Current User:</strong> {currentUser ? currentUser.email || currentUser.uid : 'None'}</div>
        <div><strong>Patient Logged In:</strong> {isPatientLoggedIn ? 'Yes' : 'No'}</div>
        <div><strong>Staff Logged In:</strong> {isStaffLoggedIn ? 'Yes' : 'No'}</div>
        <div><strong>LocalStorage:</strong> {localStorage.getItem('medconnect_auth') ? 'Has Data' : 'Empty'}</div>
        <div><strong>Cookies:</strong> {document.cookie ? 'Present' : 'None'}</div>
      </div>
    </div>
  );
};
