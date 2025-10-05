import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { auth, db } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AdminSetup: React.FC = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [result, setResult] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const ADMIN_EMAIL = 'admin@medconnect.com';
  const ADMIN_PASSWORD = 'admin123';

  const createAdminUser = async () => {
    setIsCreating(true);
    setResult('idle');
    setError('');

    try {
      console.log('Creating admin user...');
      
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
      const user = userCredential.user;
      
      console.log('Firebase Auth user created:', user.uid);

      // Create admin document in Firestore
      await setDoc(doc(db, 'admins', user.uid), {
        email: ADMIN_EMAIL,
        role: 'admin',
        createdAt: new Date(),
        isSuperAdmin: true
      });

      console.log('Admin document created successfully');

      // Store admin auth data
      localStorage.setItem('admin_auth', JSON.stringify({
        email: ADMIN_EMAIL,
        role: 'admin',
        uid: user.uid,
        timestamp: Date.now()
      }));

      setResult('success');
      toast.success('Admin user created successfully!');
      
      // Navigate to admin dashboard after a short delay
      setTimeout(() => {
        navigate('/admin-dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('Error creating admin user:', error);
      setResult('error');
      
      if (error.code === 'auth/email-already-in-use') {
        setError('Admin user already exists. You can now login normally.');
        toast.info('Admin user already exists. You can login now.');
        setTimeout(() => {
          navigate('/admin-login');
        }, 2000);
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please contact administrator.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(`Failed to create admin user: ${error.message}`);
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Admin Setup</CardTitle>
            <CardDescription>
              Create the initial admin user for the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              <p><strong>Email:</strong> {ADMIN_EMAIL}</p>
              <p><strong>Password:</strong> {ADMIN_PASSWORD}</p>
            </div>

            {result === 'success' && (
              <Alert>
                <AlertDescription>
                  ✅ Admin user created successfully! Redirecting to admin dashboard...
                </AlertDescription>
              </Alert>
            )}

            {result === 'error' && (
              <Alert variant="destructive">
                <AlertDescription>
                  ❌ {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={createAdminUser}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? 'Creating Admin User...' : 'Create Admin User'}
            </Button>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin-login')}
                className="text-blue-600 hover:text-blue-800"
              >
                Already have admin account? Login here
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              <p>This will create a Firebase Auth user and admin document in Firestore.</p>
              <p>Make sure Firestore rules are deployed before proceeding.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSetup;
