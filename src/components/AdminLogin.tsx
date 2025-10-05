import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface AdminLoginData {
  email: string;
  password: string;
}

const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState<AdminLoginData>({
    email: '',
    password: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Admin credentials - in production, these should be environment variables
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'admin@medconnect.com';
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

  const handleInputChange = (field: keyof AdminLoginData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      // Check if it's the admin email
      if (formData.email !== ADMIN_EMAIL) {
        setError('Access denied. Admin credentials required.');
        toast.error('Access denied. Admin credentials required.');
        return;
      }

      // Check if it's the admin password
      if (formData.password !== ADMIN_PASSWORD) {
        setError('Invalid admin password');
        toast.error('Invalid admin password');
        return;
      }

      // Try to sign in with Firebase Auth
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
        console.log('Admin user signed in successfully');
      } catch (authError: any) {
        console.error('Auth error:', authError);
        
        // If user doesn't exist or invalid credentials, create admin user
        if (authError.code === 'auth/user-not-found' || authError.code === 'auth/wrong-password' || authError.code === 'auth/invalid-credential') {
          console.log('Admin user not found or invalid credentials, creating admin account...');
          
          try {
            userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            console.log('Admin account created successfully');
          } catch (createError: any) {
            console.error('Error creating admin account:', createError);
            if (createError.code === 'auth/email-already-in-use') {
              // User exists but password is wrong
              setError('Invalid admin password. Please contact system administrator.');
              toast.error('Invalid admin password. Please contact system administrator.');
              return;
            } else {
              throw createError;
            }
          }
        } else {
          throw authError;
        }
      }

      const user = userCredential.user;
      
      // Verify admin document exists
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        if (!adminDoc.exists()) {
          console.log('Admin document not found, creating...');
          // Create admin document if it doesn't exist
          await setDoc(doc(db, 'admins', user.uid), {
            email: formData.email,
            role: 'admin',
            createdAt: new Date(),
            isSuperAdmin: true
          });
          console.log('Admin document created successfully');
        } else {
          console.log('Admin document already exists');
        }
      } catch (docError: any) {
        console.error('Error creating admin document:', docError);
        // If it's a permission error, continue with login anyway
        if (docError.code === 'permission-denied') {
          console.log('Permission denied for admin document creation, continuing with login...');
        } else {
          // For other errors, continue with login but log the error
          console.log('Continuing with login despite document creation error...');
        }
      }

      // Store admin login data in localStorage
      localStorage.setItem('admin_auth', JSON.stringify({
        email: formData.email,
        role: 'admin',
        uid: user.uid,
        timestamp: Date.now()
      }));

      toast.success('Admin logged in successfully!');
      navigate('/admin-dashboard');
      
    } catch (error: any) {
      console.error('Admin login error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please try logging in with different credentials.');
        toast.error('This email is already registered. Please try logging in with different credentials.');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak. Please contact administrator.');
        toast.error('Password is too weak. Please contact administrator.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
        toast.error('Network error. Please check your internet connection.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
        toast.error('Too many failed attempts. Please try again later.');
      } else {
        setError(`Login failed: ${error.message}`);
        toast.error(`Login failed: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription>
              Sign in to the admin dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter admin email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Demo Admin Credentials:
              </p>
              <p className="text-xs text-gray-500">
                Email: admin@medconnect.com<br />
                Password: admin123
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
