import React, { createContext, useContext, useState, useEffect } from "react"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser,
} from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/firebase/config"

export type UserRole = "customer" | "provider" | "admin" | null

export interface UserProfile {
  uid: string
  name: string
  email: string
  role: UserRole
  photoURL?: string | null
  authProvider?: "email" | "google"
  createdAt?: any
}

// Configured admin emails for immediate admin access in staging/development
const HARDCODED_ADMIN_EMAILS = [
  "admin123@gmail.com",
  "admin@example.com",
  "admin@homeserviceshub.com",
]

interface AuthContextType {
  currentUser: UserProfile | null
  firebaseUser: FirebaseUser | null
  role: UserRole
  loading: boolean
  login: (email: string, pass: string) => Promise<UserProfile>
  loginWithGoogle: () => Promise<{ profile: UserProfile; needsRole: boolean }>
  register: (email: string, pass: string, name: string, role: "customer" | "provider") => Promise<UserProfile>
  setUserRole: (role: "customer" | "provider") => Promise<void>
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

          const isHardcodedAdmin = HARDCODED_ADMIN_EMAILS.includes(user.email?.toLowerCase() || "")

          let userRole: UserRole = isHardcodedAdmin ? "admin" : null
          let userName = user.displayName || "User"
          let photoURL = user.photoURL || null
          let createdAt = null
          let authProvider: "email" | "google" = user.providerData.some((p) => p.providerId === "google.com")
            ? "google"
            : "email"

          if (userDocSnap.exists()) {
            const data = userDocSnap.data()
            userRole = isHardcodedAdmin ? "admin" : (data.role || null)
            userName = data.name || userName
            photoURL = data.photoURL || photoURL
            createdAt = data.createdAt
            authProvider = data.authProvider || authProvider
          } else {
            // User doc doesn't exist yet (e.g. first-time direct OAuth sign-in)
            userRole = isHardcodedAdmin ? "admin" : null
            const initialDoc = {
              uid: user.uid,
              name: userName,
              email: user.email || "",
              role: userRole,
              photoURL,
              authProvider,
              createdAt: serverTimestamp(),
            }
            await setDoc(userDocRef, initialDoc, { merge: true })
          }

          const profile: UserProfile = {
            uid: user.uid,
            name: userName,
            email: user.email || "",
            role: userRole,
            photoURL,
            authProvider,
            createdAt,
          }

          setCurrentUser(profile)
          setRole(userRole)
        } catch (error) {
          console.error("Error fetching user profile from Firestore:", error)
          const isHardcodedAdmin = HARDCODED_ADMIN_EMAILS.includes(user.email?.toLowerCase() || "")
          const fallbackRole: UserRole = isHardcodedAdmin ? "admin" : null
          const fallbackProfile: UserProfile = {
            uid: user.uid,
            name: user.displayName || "User",
            email: user.email || "",
            role: fallbackRole,
            photoURL: user.photoURL || null,
            authProvider: "email",
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
        authProvider: "email",
      }

      // Save user profile in Firestore "users" collection with all required fields
      const userDocRef = doc(db, "users", user.uid)
      await setDoc(userDocRef, {
        ...newProfile,
        createdAt: serverTimestamp(),
      })

      // If registered as provider, initialize a default provider record in "providers" collection
      if (finalRole === "provider") {
        const provRef = doc(db, "providers", user.uid)
        await setDoc(provRef, {
          uid: user.uid,
          name,
          email: user.email || email,
          photoURL: null,
          category: "General",
          priceRange: "$50 - $100 / hr",
          serviceArea: "Metropolitan Area",
          bio: "Specialist ready to serve local customers.",
          portfolioImages: [],
          avgRating: 5.0,
          totalReviews: 0,
          verificationStatus: "approved",
          createdAt: serverTimestamp(),
        }, { merge: true })
      }

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
      let userRole: UserRole = isHardcodedAdmin ? "admin" : null
      let userName = user.displayName || "User"
      let photoURL = user.photoURL || null
      let createdAt = null
      let authProvider: "email" | "google" = "email"

      if (userDocSnap.exists()) {
        const data = userDocSnap.data()
        userRole = isHardcodedAdmin ? "admin" : (data.role || null)
        userName = data.name || userName
        photoURL = data.photoURL || photoURL
        createdAt = data.createdAt
        authProvider = data.authProvider || "email"
      } else {
        // Create profile if missing
        userRole = isHardcodedAdmin ? "admin" : "customer"
        const initialDoc = {
          uid: user.uid,
          name: userName,
          email: user.email || "",
          role: userRole,
          photoURL,
          authProvider: "email" as const,
          createdAt: serverTimestamp(),
        }
        await setDoc(userDocRef, initialDoc, { merge: true })
      }

      const profile: UserProfile = {
        uid: user.uid,
        name: userName,
        email: user.email || "",
        role: userRole,
        photoURL,
        authProvider,
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

  // Google Sign-In with popup
  const loginWithGoogle = async (): Promise<{ profile: UserProfile; needsRole: boolean }> => {
    setLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: "select_account" })
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      const userDocRef = doc(db, "users", user.uid)
      const userDocSnap = await getDoc(userDocRef)

      const isHardcodedAdmin = HARDCODED_ADMIN_EMAILS.includes(user.email?.toLowerCase() || "")

      let userRole: UserRole = isHardcodedAdmin ? "admin" : null
      let userName = user.displayName || "Google User"
      let photoURL = user.photoURL || null
      let createdAt: any = null
      let needsRole = false

      if (userDocSnap.exists()) {
        const data = userDocSnap.data()
        userRole = isHardcodedAdmin ? "admin" : (data.role || null)
        userName = data.name || userName
        photoURL = data.photoURL || photoURL
        createdAt = data.createdAt

        // If user document exists but role is not set yet, they need to pick a role
        if (!userRole && !isHardcodedAdmin) {
          needsRole = true
        }
      } else {
        // First-time Google sign-in: create user profile document in Firestore
        userRole = isHardcodedAdmin ? "admin" : null
        needsRole = !isHardcodedAdmin

        const newProfileDoc = {
          uid: user.uid,
          name: userName,
          email: user.email || "",
          role: userRole,
          photoURL,
          authProvider: "google" as const,
          createdAt: serverTimestamp(),
        }

        await setDoc(userDocRef, newProfileDoc)
        createdAt = new Date()
      }

      const profile: UserProfile = {
        uid: user.uid,
        name: userName,
        email: user.email || "",
        role: userRole,
        photoURL,
        authProvider: "google",
        createdAt,
      }

      setCurrentUser(profile)
      setRole(userRole)
      setFirebaseUser(user)

      return { profile, needsRole }
    } finally {
      setLoading(false)
    }
  }

  // Set user role after Google sign-in
  const setUserRole = async (chosenRole: "customer" | "provider"): Promise<void> => {
    if (!currentUser?.uid) throw new Error("No active authenticated session found.")

    const userDocRef = doc(db, "users", currentUser.uid)
    await updateDoc(userDocRef, {
      role: chosenRole,
      updatedAt: serverTimestamp(),
    })

    // If role is provider, initialize minimal provider profile in "providers" collection if missing
    if (chosenRole === "provider") {
      const provRef = doc(db, "providers", currentUser.uid)
      const provSnap = await getDoc(provRef)
      if (!provSnap.exists()) {
        await setDoc(provRef, {
          uid: currentUser.uid,
          name: currentUser.name,
          email: currentUser.email,
          photoURL: currentUser.photoURL || null,
          category: "General",
          priceRange: "$50 - $100 / hr",
          serviceArea: "Metropolitan Area",
          bio: "Specialist ready to serve local customers.",
          portfolioImages: [],
          avgRating: 5.0,
          totalReviews: 0,
          verificationStatus: "approved",
          createdAt: serverTimestamp(),
        }, { merge: true })
      }
    }

    const updatedProfile: UserProfile = {
      ...currentUser,
      role: chosenRole,
    }

    setCurrentUser(updatedProfile)
    setRole(chosenRole)
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
        loginWithGoogle,
        register,
        setUserRole,
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
