// Firebase initialization reading from Vite environment variables with safe fallback
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBHaXG_0I36k_j7nhfoD-CEh2-Lmk4-i0E",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "local-services-1f8fb.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "local-services-1f8fb",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "local-services-1f8fb.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "109107015678",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:109107015678:web:8877b75ab3e1bc4a2b5aaf",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9W1PN0RFB0",
}

// Initialize Firebase only once
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
