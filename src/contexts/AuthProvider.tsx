
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
  isStaffLoggedIn: boolean;
  isLoading: boolean;
  loginPatient: (identifier: string, password: string) => Promise<void>;
  loginStaff: (email: string, password: string, staffId: string) => Promise<void>;
  registerPatient: (data: { email?: string; phone?: string; password: string; name: string }) => Promise<void>;
  registerStaff: (email: string, password: string, name: string, staffId: string) => Promise<void>;
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
  const [isStaffLoggedIn, setIsStaffLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const validStaffIds = ['STAFF001', 'STAFF002', 'STAFF003']; // Predefined staff IDs

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
            setIsStaffLoggedIn(false);
            setIsLoading(false);
            return;
          } else if (authData.role === 'staff') {
            setIsStaffLoggedIn(true);
            setIsPatientLoggedIn(false);
            setIsLoading(false);
            return;
          }
        }

        // If no valid auth data, check Firestore
        try {
          const patientDoc = await getDoc(doc(db, 'patients', user.uid));
          if (patientDoc.exists()) {
            setIsPatientLoggedIn(true);
            setIsStaffLoggedIn(false);
            setAuthData({
              email: user.email || '',
              uid: user.uid,
              role: 'patient'
            });
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error checking patient document:', error);
        }
        
        try {
          const staffDoc = await getDoc(doc(db, 'staff', user.uid));
          if (staffDoc.exists()) {
            setIsStaffLoggedIn(true);
            setIsPatientLoggedIn(false);
            setAuthData({
              email: user.email || '',
              uid: user.uid,
              role: 'staff'
            });
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('Error checking staff document:', error);
        }
        
        // If user exists but no role found, clear auth data
        clearAuthData();
        setIsPatientLoggedIn(false);
        setIsStaffLoggedIn(false);
      } else {
        // Clear auth data when user is null
        clearAuthData();
        setIsPatientLoggedIn(false);
        setIsStaffLoggedIn(false);
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

  const loginStaff = async (email: string, password: string, staffId: string) => {
    if (!validStaffIds.includes(staffId)) {
      throw new Error('Invalid staff ID.');
    }
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const staffDoc = await getDoc(doc(db, 'staff', user.uid));
    if (!staffDoc.exists()) {
      await signOut(auth);
      throw new Error('No staff record found for this user.');
    }
    const staffData = staffDoc.data();
    if (staffData.staffId !== staffId) {
      await signOut(auth);
      throw new Error('Staff ID does not match.');
    }
    // Store user details in localStorage and cookies
    setAuthData({
      email: user.email || '',
      uid: user.uid,
      role: 'staff'
    });
    toast.success('Staff logged in successfully.');
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

  const registerStaff = async (email: string, password: string, name: string, staffId: string) => {
    if (!validStaffIds.includes(staffId)) {
      toast.error('Invalid staff ID.');
      throw new Error('Invalid staff ID.');
    }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, 'staff', user.uid), {
      name,
      email,
      staffId,
      createdAt: new Date(),
    });
    toast.success('Staff registered successfully.');
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
      isStaffLoggedIn,
      isLoading,
      loginPatient,
      loginStaff,
      registerPatient,
      registerStaff,
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
