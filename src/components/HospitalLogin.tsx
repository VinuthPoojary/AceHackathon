import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/sonner';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

interface HospitalLoginData {
  hospitalName: string;
  password: string;
  hospitalID: string;
}

const HospitalLogin: React.FC = () => {
  const [formData, setFormData] = useState<HospitalLoginData>({
    hospitalName: '',
    password: '',
    hospitalID: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (field: keyof HospitalLoginData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.hospitalName.trim()) {
      setError('Hospital name is required');
      return false;
    }
    if (!formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    if (!formData.hospitalID.trim()) {
      setError('Hospital ID is required');
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
      console.log('Attempting hospital login with:', {
        hospitalID: formData.hospitalID,
        hospitalName: formData.hospitalName
      });

      // First, check if the hospital exists and is approved
      // The document ID is the hospital.id (like MGL001, UDP001)
      const hospitalDoc = await getDoc(doc(db, 'hospitals', formData.hospitalID));
      
      if (!hospitalDoc.exists()) {
        console.log('Hospital document not found for ID:', formData.hospitalID);
        setError('Hospital not found. Please check your Hospital ID.');
        return;
      }

      const hospitalData = hospitalDoc.data();
      console.log('Hospital data found:', {
        id: hospitalData.hospitalId,
        name: hospitalData.hospitalName,
        status: hospitalData.status,
        email: hospitalData.email
      });
      
      if (!['active', 'approved'].includes(hospitalData.status)) {
        console.log('Hospital status not approved:', hospitalData.status);
        setError('Hospital application is not approved yet. Please contact admin.');
        return;
      }

      if (hospitalData.hospitalName.toLowerCase() !== formData.hospitalName.toLowerCase()) {
        console.log('Hospital name mismatch:', {
          provided: formData.hospitalName,
          stored: hospitalData.hospitalName
        });
        setError('Hospital name does not match our records.');
        return;
      }

      // Use the email from hospital data for authentication
      console.log('Attempting Firebase Auth with:', {
        email: hospitalData.email,
        passwordLength: formData.password.length
      });

      const userCredential = await signInWithEmailAndPassword(
        auth, 
        hospitalData.email, 
        formData.password
      );

      console.log('Firebase Auth successful:', userCredential.user.uid);

      // Store hospital login data in localStorage
      localStorage.setItem('hospital_auth', JSON.stringify({
        hospitalId: formData.hospitalID,
        hospitalName: hospitalData.hospitalName,
        email: hospitalData.email,
        uid: userCredential.user.uid,
        role: 'hospital',
        timestamp: Date.now()
      }));

      toast.success('Hospital logged in successfully!');
      navigate('/hospital-dashboard');
      
    } catch (error: any) {
      console.error('Hospital login error:', error);
      
      if (error.code === 'auth/user-not-found') {
        setError('Hospital account not found. Please check your credentials.');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password.');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email format.');
      } else if (error.code === 'auth/user-disabled') {
        setError('This hospital account has been disabled.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Login failed. Please check your credentials and try again.');
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
            <CardTitle className="text-2xl font-bold">Hospital Login</CardTitle>
            <CardDescription>
              Sign in to your hospital account
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
                <Label htmlFor="hospitalName">Hospital Name</Label>
                <Input
                  id="hospitalName"
                  value={formData.hospitalName}
                  onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                  placeholder="Enter hospital name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hospitalID">Hospital ID</Label>
                <Input
                  id="hospitalID"
                  value={formData.hospitalID}
                  onChange={(e) => handleInputChange('hospitalID', e.target.value)}
                  placeholder="Enter Hospital ID"
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
                  placeholder="Enter password"
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
                Don't have an account?{' '}
                <a 
                  href="/hospital-application" 
                  className="text-blue-600 hover:text-blue-500"
                >
                  Apply here
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HospitalLogin;
