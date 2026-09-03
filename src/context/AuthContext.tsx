import React, { createContext, useContext, useState, useEffect } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/firebase/config"

export type UserRole = "customer" | "provider" | "admin" | null

export interface UserProfile {
  uid: string
  name: string
  email: string
  role: UserRole
  photoURL?: string | null
  createdAt?: any
}

// Configured admin emails for immediate admin access in staging/development
const HARDCODED_ADMIN_EMAILS = [
  "admin@hub.local",
  "admin@example.com",
  "admin@homeserviceshub.com",
]

interface AuthContextType {
  currentUser: UserProfile | null
  firebaseUser: FirebaseUser | null
  role: UserRole
  loading: boolean
  login: (email: string, pass: string) => Promise<UserProfile>
  register: (email: string, pass: string, name: string, role: "customer" | "provider") => Promise<UserProfile>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [role, setRole] = useState<UserRole>(null)
  const [loading, setLoading] = useState(true)

  // Listen to Firebase auth state changes and fetch Firestore profile
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      if (user) {
        try {
          const userDocRef = doc(db, "users", user.uid)
          const userDocSnap = await getDoc(userDocRef)

          let userRole: UserRole = "customer"
          let userName = user.displayName || "User"
          let photoURL = user.photoURL || null
          let createdAt = null

          const isHardcodedAdmin = HARDCODED_ADMIN_EMAILS.includes(user.email?.toLowerCase() || "")

          if (userDocSnap.exists()) {
            const data = userDocSnap.data()
            userRole = isHardcodedAdmin ? "admin" : (data.role || "customer")
            userName = data.name || userName
            photoURL = data.photoURL || photoURL
            createdAt = data.createdAt
          } else {
            // Document doesn't exist yet (e.g. created directly via Auth console)
            userRole = isHardcodedAdmin ? "admin" : "customer"
            const fallbackProfile: UserProfile = {
              uid: user.uid,
              name: userName,
              email: user.email || "",
              role: userRole,
              photoURL,
              createdAt: serverTimestamp(),
            }
            await setDoc(userDocRef, fallbackProfile, { merge: true })
          }

          const profile: UserProfile = {
            uid: user.uid,
            name: userName,
            email: user.email || "",
            role: userRole,
            photoURL,
            createdAt,
          }

          setCurrentUser(profile)
          setRole(userRole)
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error)
          // Graceful fallback with basic auth info
          const fallbackRole: UserRole = HARDCODED_ADMIN_EMAILS.includes(user.email?.toLowerCase() || "")
            ? "admin"
            : "customer"
          const fallbackProfile: UserProfile = {
            uid: user.uid,
            name: user.displayName || "User",
            email: user.email || "",
            role: fallbackRole,
            photoURL: user.photoURL || null,
          }
          setCurrentUser(fallbackProfile)
          setRole(fallbackRole)
        }
      } else {
        setCurrentUser(null)
        setRole(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Register new user with email, password, name, and chosen role
  const register = async (
    email: string,
    pass: string,
    name: string,
    chosenRole: "customer" | "provider"
  ): Promise<UserProfile> => {
    setLoading(true)
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass)
      const user = userCredential.user

      // Update Auth Profile display name
      await updateProfile(user, { displayName: name })

      // Determine final role (respecting admin email list)
      const finalRole: UserRole = HARDCODED_ADMIN_EMAILS.includes(email.toLowerCase())
        ? "admin"
        : chosenRole

      const newProfile: UserProfile = {
        uid: user.uid,
        name,
        email: user.email || email,
        role: finalRole,
        photoURL: null,
      }

      // Save user profile in Firestore "users" collection
      const userDocRef = doc(db, "users", user.uid)
      await setDoc(userDocRef, {
        ...newProfile,
        createdAt: serverTimestamp(),
      })

      setCurrentUser(newProfile)
      setRole(finalRole)
      setFirebaseUser(user)
      return newProfile
    } finally {
      setLoading(false)
    }
  }

  // Sign in existing user with email and password
  const login = async (email: string, pass: string): Promise<UserProfile> => {
    setLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass)
      const user = userCredential.user

      // Retrieve user profile from Firestore
      const userDocRef = doc(db, "users", user.uid)
      const userDocSnap = await getDoc(userDocRef)

      const isHardcodedAdmin = HARDCODED_ADMIN_EMAILS.includes(user.email?.toLowerCase() || "")
      let userRole: UserRole = isHardcodedAdmin ? "admin" : "customer"
      let userName = user.displayName || "User"
      let photoURL = user.photoURL || null
      let createdAt = null

      if (userDocSnap.exists()) {
        const data = userDocSnap.data()
        userRole = isHardcodedAdmin ? "admin" : (data.role || "customer")
        userName = data.name || userName
        photoURL = data.photoURL || photoURL
        createdAt = data.createdAt
      }

      const profile: UserProfile = {
        uid: user.uid,
        name: userName,
        email: user.email || "",
        role: userRole,
        photoURL,
        createdAt,
      }

      setCurrentUser(profile)
      setRole(userRole)
      setFirebaseUser(user)
      return profile
    } finally {
      setLoading(false)
    }
  }

  // Sign out user
  const logout = async () => {
    await signOut(auth)
    setCurrentUser(null)
    setFirebaseUser(null)
    setRole(null)
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        role,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
