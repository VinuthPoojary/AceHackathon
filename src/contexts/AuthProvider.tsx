import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import type { Auth } from 'firebase/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/sonner';

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

// Helper functions for authentication persistence
const setAuthData = (userData: { email: string; uid: string; role: string }) => {
  localStorage.setItem('medconnect_auth', JSON.stringify({
    ...userData,
    timestamp: Date.now()
  }));
  
  // Also set cookies as backup
  const expires = new Date();
  expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
  document.cookie = `userEmail=${userData.email};expires=${expires.toUTCString()};path=/`;
  document.cookie = `userUid=${userData.uid};expires=${expires.toUTCString()};path=/`;
  document.cookie = `userRole=${userData.role};expires=${expires.toUTCString()};path=/`;
};

const getAuthData = (): { email: string; uid: string; role: string } | null => {
  try {
    const authData = localStorage.getItem('medconnect_auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      // Check if data is not older than 7 days
      if (Date.now() - parsed.timestamp < 7 * 24 * 60 * 60 * 1000) {
        return parsed;
      }
    }
    
    // Fallback to cookies
    const email = getCookie('userEmail');
    const uid = getCookie('userUid');
    const role = getCookie('userRole');
    
    if (email && uid && role) {
      return { email, uid, role };
    }
    
    return null;
  } catch (error) {
    console.error('Error getting auth data:', error);
    return null;
  }
};

const clearAuthData = () => {
  localStorage.removeItem('medconnect_auth');
  eraseCookie('userEmail');
  eraseCookie('userUid');
  eraseCookie('userRole');
};

// Helper functions for cookie management (backup)
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const getCookie = (name: string): string | null => {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
};

const eraseCookie = (name: string) => {
  document.cookie = name + '=; Max-Age=-99999999;';
};

interface AuthContextType {
  currentUser: User | null;
  isPatientLoggedIn: boolean;
  isLoading: boolean;
  loginPatient: (identifier: string, password: string) => Promise<void>;
  registerPatient: (data: { email?: string; phone?: string; password: string; name: string }) => Promise<void>;
  logout: () => Promise<void>;
  sendPatientOTP: (phoneNumber: string) => Promise<ConfirmationResult>;
  verifyPatientOTP: (confirmationResult: ConfirmationResult, otp: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isPatientLoggedIn, setIsPatientLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setIsLoading(true);
      
      if (user) {
        // Check localStorage first for faster authentication
        const authData = getAuthData();
        
        if (authData && authData.uid === user.uid) {
          if (authData.role === 'patient') {
            setIsPatientLoggedIn(true);
            setIsLoading(false);
            return;
          }
        }

        // If no valid auth data, check Firestore
        try {
          const patientDoc = await getDoc(doc(db, 'patients', user.uid));
          if (patientDoc.exists()) {
            setIsPatientLoggedIn(true);
            setAuthData({
              email: user.email || '',
              uid: user.uid,
              role: 'patient'
            });
            setIsLoading(false);
            return;
          }
        } catch (error: any) {
          console.error('Error checking patient document:', error);
          // If it's a permission error, continue to check other roles
          if (error.code !== 'permission-denied') {
            // For non-permission errors, we might want to handle differently
          }
        }
        
        
        // Check if user is admin
        try {
          const adminDoc = await getDoc(doc(db, 'admins', user.uid));
          if (adminDoc.exists()) {
            // Admin users don't use the regular patient auth flow
            // They use localStorage-based auth in AdminLogin component
            setIsPatientLoggedIn(false);
            setIsLoading(false);
            return;
          }
        } catch (error: any) {
          console.error('Error checking admin document:', error);
          // Continue with normal flow
        }
        
        // If user exists but no role found, clear auth data
        clearAuthData();
        setIsPatientLoggedIn(false);
      } else {
        // Clear auth data when user is null
        clearAuthData();
        setIsPatientLoggedIn(false);
      }
      
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  }, []);

  const loginPatient = async (identifier: string, password: string) => {
    // identifier can be email or phone number
    let userCredential;
    if (identifier.includes('@')) {
      // email login
      userCredential = await signInWithEmailAndPassword(auth, identifier, password);
    } else {
      // phone login with phone number and password (custom logic)
      // For simplicity, assume phone number is stored as email in Firebase with domain '@phone.local'
      const fakeEmail = `${identifier}@phone.local`;
      userCredential = await signInWithEmailAndPassword(auth, fakeEmail, password);
    }
    const user = userCredential.user;
    const patientDoc = await getDoc(doc(db, 'patients', user.uid));
    if (!patientDoc.exists()) {
      await signOut(auth);
      toast.error('No patient record found for this user.');
      throw new Error('No patient record found for this user.');
    }
    // Store user details in localStorage and cookies
    setAuthData({
      email: user.email || '',
      uid: user.uid,
      role: 'patient'
    });
    toast.success('Patient logged in successfully.');
  };


  const registerPatient = async (data: { email?: string; phone?: string; password: string; name: string }) => {
    try {
      let userCredential;
      if (data.email) {
        userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      } else if (data.phone) {
        // For phone registration, create a fake email to use Firebase email/password auth
        const fakeEmail = `${data.phone}@phone.local`;
        userCredential = await createUserWithEmailAndPassword(auth, fakeEmail, data.password);
      } else {
        throw new Error('Email or phone number is required for registration.');
      }
      const user = userCredential.user;
      await setDoc(doc(db, 'patients', user.uid), {
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        createdAt: new Date(),
      });
      toast.success('Patient registered successfully.');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Email already in use. Please use a different email.');
        throw new Error('Email already in use. Please use a different email.');
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak. Please choose a stronger password.');
        throw new Error('Password is too weak. Please choose a stronger password.');
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address.');
        throw new Error('Invalid email address.');
      } else if (error.code === 'permission-denied') {
        toast.error('Database access denied. Please check Firestore security rules.');
        throw new Error('Database access denied. Please check Firestore security rules.');
      } else {
        const message = error.message || 'Registration failed';
        // Remove Firebase error prefix if present
        const cleanedMessage = message.replace(/^Firebase: Error \([^)]+\)\.\s*/, '');
        toast.error(cleanedMessage);
        throw new Error(cleanedMessage);
      }
    }
  };


  const logout = async () => {
    await signOut(auth);
    // Clear user details from localStorage and cookies
    clearAuthData();
    toast.info('Logged out successfully.');
  };

  const sendPatientOTP = async (phoneNumber: string): Promise<ConfirmationResult> => {
    // Since login with phone number uses password, no need to send OTP again
    throw new Error('OTP sending is disabled for phone number login with password.');
  };

  const verifyPatientOTP = async (confirmationResult: ConfirmationResult, otp: string) => {
    try {
      const result = await confirmationResult.confirm(otp);
      const user = result.user;
      const patientDoc = await getDoc(doc(db, 'patients', user.uid));
      if (!patientDoc.exists()) {
        await signOut(auth);
        toast.error('No patient record found for this phone number.');
        throw new Error('No patient record found for this phone number.');
      }
      // Store user details in localStorage and cookies
      setAuthData({
        email: user.phoneNumber || '',
        uid: user.uid,
        role: 'patient'
      });
      toast.success('Patient logged in successfully with phone.');
    } catch (error: any) {
      toast.error('Invalid OTP: ' + error.message);
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send password reset email.');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isPatientLoggedIn,
      isLoading,
      loginPatient,
      registerPatient,
      logout,
      sendPatientOTP,
      verifyPatientOTP,
      forgotPassword,
    }}>
      {children}
      <div id="recaptcha-container" style={{ display: 'none' }}></div>
    </AuthContext.Provider>
  );
};