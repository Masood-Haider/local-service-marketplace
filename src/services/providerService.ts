import {
  doc,
  getDoc,
  setDoc,
  getDocs,
  collection,
  query,
  where,
  orderBy,
  serverTimestamp,
  addDoc,
  QueryConstraint,
} from "firebase/firestore"
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage"
import { db, storage } from "@/firebase/config"
import { createNotification } from "@/services/notificationService"

export interface ProviderProfile {
  uid: string
  name: string
  category: string
  bio: string
  priceRange: string
  serviceArea: string
  photoURL: string
  portfolioImages: string[]
  avgRating: number
  totalReviews: number
  phone?: string
  email?: string
  verificationStatus?: "approved" | "pending" | "rejected"
  createdAt?: any
  updatedAt?: any
}

export interface QuoteRequest {
  providerId: string
  providerName: string
  customerId?: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  serviceNeeded: string
  serviceLocation: string
  preferredDate: string
  projectDetails: string
  status: "pending" | "quoted" | "declined"
  createdAt?: any
}

export type ProviderSortOption = "rating_desc" | "price_asc" | "price_desc" | "reviews_desc" | "default"

export interface QueryProvidersParams {
  category?: string
  sortBy?: ProviderSortOption
  searchTerm?: string
}

/**
 * Uploads a file to Firebase Storage with live progress reporting.
 * Falls back to client data URL if Firebase Storage bucket is restricted.
 */
export async function uploadToStorage(
  file: File,
  storagePath: string,
  onProgress?: (progressPercent: number) => void
): Promise<string> {
  try {
    const storageRef = ref(storage, storagePath)
    const uploadTask = uploadBytesResumable(storageRef, file)

    return await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          if (onProgress) {
            onProgress(Math.round(progress))
          }
        },
        (error) => {
          console.warn("Firebase storage error, generating fallback preview:", error)
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = () => reject(error)
          reader.readAsDataURL(file)
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
            if (onProgress) onProgress(100)
            resolve(downloadUrl)
          } catch (err) {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = () => reject(err)
            reader.readAsDataURL(file)
          }
        }
      )
    })
  } catch (err) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }
}

/**
 * Saves or updates a provider's profile in the Firestore "providers" collection.
 */
export async function saveProviderProfile(
  profile: Partial<ProviderProfile> & { uid: string }
): Promise<void> {
  const providerRef = doc(db, "providers", profile.uid)
  const existingSnap = await getDoc(providerRef)

  const docPayload = {
    ...profile,
    avgRating: profile.avgRating ?? (existingSnap.exists() ? existingSnap.data().avgRating : 5.0),
    totalReviews: profile.totalReviews ?? (existingSnap.exists() ? existingSnap.data().totalReviews : 0),
    updatedAt: serverTimestamp(),
  }

  if (!existingSnap.exists()) {
    ;(docPayload as any).createdAt = serverTimestamp()
    ;(docPayload as any).verificationStatus = "pending"
  } else {
    // Retain existing verification status so providers cannot self-approve
    ;(docPayload as any).verificationStatus = existingSnap.data().verificationStatus || "pending"
  }

  await setDoc(providerRef, docPayload, { merge: true })

  try {
    const userRef = doc(db, "users", profile.uid)
    await setDoc(
      userRef,
      {
        name: profile.name,
        photoURL: profile.photoURL || null,
        role: "provider",
      },
      { merge: true }
    )
  } catch (syncErr) {
    console.warn("Failed to sync users collection:", syncErr)
  }
}

/**
 * Retrieves a provider profile by user ID.
 */
export async function getProviderProfile(uid: string): Promise<ProviderProfile | null> {
  try {
    const providerRef = doc(db, "providers", uid)
    const snap = await getDoc(providerRef)
    if (snap.exists()) {
      return snap.data() as ProviderProfile
    }
    return null
  } catch (error) {
    console.error("Error fetching provider profile:", error)
    throw error
  }
}

/**
 * Helper to extract starting price numeric value from string (e.g., "$75 - $120/hr" -> 75)
 */
export function extractStartingPrice(priceStr: string | undefined): number {
  if (!priceStr) return 0
  const match = priceStr.match(/\d+/)
  return match ? parseInt(match[0], 10) : 0
}

/**
 * Queries providers from Firestore using real `where` and `orderBy` queries,
 * with graceful fallback for composite indexes and client-side sub-string text search.
 */
export async function fetchProvidersWithQuery(params: QueryProvidersParams): Promise<ProviderProfile[]> {
  const { category, sortBy = "rating_desc", searchTerm } = params
  const providersCol = collection(db, "providers")

  let results: ProviderProfile[] = []

  try {
    const constraints: QueryConstraint[] = []

    // 1. Category Filter via Firestore where()
    if (category && category !== "All") {
      constraints.push(where("category", "==", category))
    }

    // 2. Sorting via Firestore orderBy() where applicable
    if (sortBy === "rating_desc") {
      constraints.push(orderBy("avgRating", "desc"))
    } else if (sortBy === "reviews_desc") {
      constraints.push(orderBy("totalReviews", "desc"))
    }

    const q = query(providersCol, ...constraints)
    const querySnapshot = await getDocs(q)
    querySnapshot.forEach((docSnap) => {
      results.push(docSnap.data() as ProviderProfile)
    })
  } catch (firestoreErr: any) {
    console.warn("Compound query failed (possibly un-indexed), falling back to base query:", firestoreErr.message)

    // Fallback: simple query with category or empty
    const fallbackConstraints: QueryConstraint[] = []
    if (category && category !== "All") {
      fallbackConstraints.push(where("category", "==", category))
    }

    const fallbackQ = query(providersCol, ...fallbackConstraints)
    const snapshot = await getDocs(fallbackQ)
    results = []
    snapshot.forEach((docSnap) => {
      results.push(docSnap.data() as ProviderProfile)
    })
  }

  // 3. In-memory sort for Price (since priceRange is formatted string) or if fallback triggered
  if (sortBy === "price_asc") {
    results.sort((a, b) => extractStartingPrice(a.priceRange) - extractStartingPrice(b.priceRange))
  } else if (sortBy === "price_desc") {
    results.sort((a, b) => extractStartingPrice(b.priceRange) - extractStartingPrice(a.priceRange))
  } else if (sortBy === "rating_desc") {
    results.sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
  } else if (sortBy === "reviews_desc") {
    results.sort((a, b) => (b.totalReviews || 0) - (a.totalReviews || 0))
  }

  // 4. Keyword search refinement (name, bio, category, service area)
  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.toLowerCase().trim()
    results = results.filter(
      (p) =>
        p.name?.toLowerCase().includes(term) ||
        p.bio?.toLowerCase().includes(term) ||
        p.category?.toLowerCase().includes(term) ||
        p.serviceArea?.toLowerCase().includes(term)
    )
  }

  // Only superadmin-approved providers are publicly discoverable on the marketplace
  return results.filter((p) => p.verificationStatus === "approved")
}

/**
 * Legacy wrapper for backward compatibility
 */
export async function getAllProviders(category?: string): Promise<ProviderProfile[]> {
  return fetchProvidersWithQuery({ category })
}

/**
 * Submits a quote request to the "quotes" collection.
 */
export async function submitQuoteRequest(quote: Omit<QuoteRequest, "createdAt" | "status">): Promise<string> {
  const quotesCol = collection(db, "quotes")
  const docRef = await addDoc(quotesCol, {
    ...quote,
    status: "pending",
    createdAt: serverTimestamp(),
  })

  // Notify the recipient provider in real-time
  try {
    await createNotification({
      userId: quote.providerId,
      message: `New quote request from ${quote.customerName} for ${quote.serviceNeeded}.`,
      type: "quote_request",
    })
  } catch (notifErr) {
    console.warn("Failed to trigger quote request notification:", notifErr)
  }

  return docRef.id
}
