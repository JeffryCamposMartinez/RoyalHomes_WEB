// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBPlP4sjK2AR_g-8aCEtq0jbvRcDfCHq-c",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "royalhomes-58cc0.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "royalhomes-58cc0",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "royalhomes-58cc0.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "896891068490",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:896891068490:web:6488e509113e65afe186b3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-F64HBMKE99"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
