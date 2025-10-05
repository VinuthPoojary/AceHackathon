import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Check if Firebase environment variables are set
const checkFirebaseConfig = () => {
  const requiredVars = [
    'VITE_PUBLIC_FIREBASE_API_KEY',
    'VITE_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'VITE_PUBLIC_FIREBASE_PROJECT_ID',
    'VITE_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_PUBLIC_FIREBASE_APP_ID'
  ];
  
  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing Firebase environment variables:', missingVars);
    console.error('Please create a .env file with your Firebase configuration.');
    console.error('See FIREBASE_SETUP.md for instructions.');
    return false;
  }
  
  return true;
};

// Validate Firebase configuration
if (!checkFirebaseConfig()) {
  throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_PUBLIC_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

console.log('Firebase configuration loaded:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: !!firebaseConfig.apiKey
});

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
