import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from '@/components/ui/sonner';

// Helper functions for cookie management
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
  loginPatient: (email: string, password: string) => Promise<void>;
  loginStaff: (email: string, password: string, staffId: string) => Promise<void>;
  registerPatient: (email: string, password: string, name: string) => Promise<void>;
  registerStaff: (email: string, password: string, name: string, staffId: string) => Promise<void>;
  logout: () => Promise<void>;
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

  const validStaffIds = ['STAFF001', 'STAFF002', 'STAFF003']; // Predefined staff IDs

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Check if user is patient or staff by checking Firestore
        try {
          const patientDoc = await getDoc(doc(db, 'patients', user.uid));
          if (patientDoc.exists()) {
            setIsPatientLoggedIn(true);
            setIsStaffLoggedIn(false);
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
            return;
          }
        } catch (error) {
          console.error('Error checking staff document:', error);
        }
        setIsPatientLoggedIn(false);
        setIsStaffLoggedIn(false);
      } else {
        setIsPatientLoggedIn(false);
        setIsStaffLoggedIn(false);
      }
    });
    return unsubscribe;
  }, []);

  const loginPatient = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const patientDoc = await getDoc(doc(db, 'patients', user.uid));
    if (!patientDoc.exists()) {
      await signOut(auth);
      toast.error('No patient record found for this user.');
      throw new Error('No patient record found for this user.');
    }
    // Store user details in cookies
    setCookie('userEmail', user.email || '');
    setCookie('userUid', user.uid);
    setCookie('userRole', 'patient');
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
    // Store user details in cookies
    setCookie('userEmail', user.email || '');
    setCookie('userUid', user.uid);
    setCookie('userRole', 'staff');
    toast.success('Staff logged in successfully.');
  };

  const registerPatient = async (email: string, password: string, name: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'patients', user.uid), {
        name,
        email,
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
    // Clear user details from cookies
    eraseCookie('userEmail');
    eraseCookie('userUid');
    eraseCookie('userRole');
    toast.info('Logged out successfully.');
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      isPatientLoggedIn,
      isStaffLoggedIn,
      loginPatient,
      loginStaff,
      registerPatient,
      registerStaff,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
