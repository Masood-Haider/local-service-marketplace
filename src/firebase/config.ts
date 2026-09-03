// Firebase initialization reading from Vite environment variables with safe fallback
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAhMLTNgGQ4UlNXety7Kz0Wng1JA_9fHxo",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "marketplace-for-local-services.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "marketplace-for-local-services",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "marketplace-for-local-services.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "451028406744",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:451028406744:web:ca40165ea42c86d020e2ad",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-VD4PGT5CK1",
}

// Initialize Firebase only once
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
