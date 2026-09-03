import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Unsubscribe,
} from "firebase/firestore"
import { db } from "@/firebase/config"

export interface Job {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  title: string
  category: string
  description: string
  budget: string
  preferredDate: string
  location: string
  status: "open" | "booked" | "completed" | "cancelled"
  acceptedQuoteId?: string
  acceptedProviderId?: string
  bookedPrice?: string
  scheduledDate?: string
  scheduledTime?: string
  createdAt?: any
}

export interface JobQuote {
  id: string
  jobId: string
  providerId: string
  providerName: string
  providerPhotoURL?: string
  price: string
  message: string
  status: "pending" | "accepted" | "declined"
  createdAt?: any
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"

export interface Booking {
  id: string
  jobId: string
  jobTitle: string
  category: string
  customerId: string
  customerName: string
  customerEmail: string
  providerId: string
  providerName: string
  price: string
  scheduledDate: string
  scheduledTime?: string
  location: string
  status: BookingStatus
  hasReviewed?: boolean
  rating?: number
  reviewComment?: string
  reviewedAt?: any
  createdAt?: any
  updatedAt?: any
}

/**
 * Returns badge styling and label for each booking status
 */
export function getBookingStatusBadge(status: BookingStatus) {
  switch (status) {
    case "pending":
      return {
        label: "Pending Confirmation",
        className: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 font-semibold",
      }
    case "confirmed":
      return {
        label: "Confirmed",
        className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 font-semibold",
      }
    case "in_progress":
      return {
        label: "In Progress",
        className: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30 font-semibold",
      }
    case "completed":
      return {
        label: "Completed",
        className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-semibold",
      }
    case "cancelled":
      return {
        label: "Cancelled",
        className: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-semibold",
      }
    default:
      return {
        label: status,
        className: "bg-muted text-muted-foreground font-medium",
      }
  }
}

/**
 * Creates a new job in the "jobs" Firestore collection with status: "open".
 */
export async function createJob(
  jobData: Omit<Job, "id" | "status" | "createdAt">
): Promise<string> {
  const jobsCol = collection(db, "jobs")
  const docRef = await addDoc(jobsCol, {
    ...jobData,
    status: "open",
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

/**
 * Subscribes to real-time updates for a single job.
 */
export function listenToJob(
  jobId: string,
  callback: (job: Job | null) => void
): Unsubscribe {
  const docRef = doc(db, "jobs", jobId)
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...(docSnap.data() as any) })
    } else {
      callback(null)
    }
  }, (err) => {
    console.warn("listenToJob error:", err)
    callback(null)
  })
}

/**
 * Subscribes in real time to open jobs matching a given category or all open jobs.
 */
export function listenToOpenJobs(
  category: string | undefined,
  callback: (jobs: Job[]) => void
): Unsubscribe {
  const jobsCol = collection(db, "jobs")

  let q = query(jobsCol, where("status", "==", "open"))
  if (category && category !== "All") {
    q = query(jobsCol, where("status", "==", "open"), where("category", "==", category))
  }

  return onSnapshot(q, (snapshot) => {
    const jobs: Job[] = []
    snapshot.forEach((d) => {
      jobs.push({ id: d.id, ...(d.data() as any) })
    })
    callback(jobs)
  }, (err) => {
    console.warn("listenToOpenJobs error:", err)
    callback([])
  })
}

/**
 * Subscribes in real time to all jobs posted by a customer.
 */
export function listenToCustomerJobs(
  customerId: string,
  callback: (jobs: Job[]) => void
): Unsubscribe {
  const jobsCol = collection(db, "jobs")
  const q = query(jobsCol, where("customerId", "==", customerId))

  return onSnapshot(q, (snapshot) => {
    const jobs: Job[] = []
    snapshot.forEach((d) => {
      jobs.push({ id: d.id, ...(d.data() as any) })
    })
    callback(jobs)
  }, (err) => {
    console.warn("listenToCustomerJobs error:", err)
    callback([])
  })
}

/**
 * Subscribes to quotes subcollection under a specific job: jobs/{jobId}/quotes
 */
export function listenToJobQuotes(
  jobId: string,
  callback: (quotes: JobQuote[]) => void
): Unsubscribe {
  const quotesCol = collection(db, "jobs", jobId, "quotes")

  return onSnapshot(quotesCol, (snapshot) => {
    const quotes: JobQuote[] = []
    snapshot.forEach((d) => {
      quotes.push({ id: d.id, ...(d.data() as any) })
    })
    callback(quotes)
  }, (err) => {
    console.warn("listenToJobQuotes error:", err)
    callback([])
  })
}

/**
 * Submits a quote (price + message) from a provider to a job's "quotes" subcollection.
 */
export async function submitJobQuote(
  jobId: string,
  quoteData: Omit<JobQuote, "id" | "jobId" | "status" | "createdAt">
): Promise<string> {
  const quotesCol = collection(db, "jobs", jobId, "quotes")
  const docRef = await addDoc(quotesCol, {
    ...quoteData,
    jobId,
    status: "pending",
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

/**
 * Accepting a quote with a chosen date/time slot:
 * 1. Updates job status to "booked" and records date/time
 * 2. Updates the accepted quote status to "accepted"
 * 3. Creates a document in the "bookings" collection with status: "confirmed" (or "pending")
 */
export async function acceptJobQuoteWithSlot(
  job: Job,
  quote: JobQuote,
  slot: { scheduledDate: string; scheduledTime: string }
): Promise<string> {
  const batch = writeBatch(db)

  // 1. Update job doc
  const jobRef = doc(db, "jobs", job.id)
  batch.update(jobRef, {
    status: "booked",
    acceptedQuoteId: quote.id,
    acceptedProviderId: quote.providerId,
    bookedPrice: quote.price,
    scheduledDate: slot.scheduledDate,
    scheduledTime: slot.scheduledTime,
    updatedAt: serverTimestamp(),
  })

  // 2. Update quote in subcollection
  const quoteRef = doc(db, "jobs", job.id, "quotes", quote.id)
  batch.update(quoteRef, {
    status: "accepted",
  })

  // 3. Create document in "bookings" collection with initial status: "confirmed"
  const bookingsCol = collection(db, "bookings")
  const newBookingRef = doc(bookingsCol)
  batch.set(newBookingRef, {
    jobId: job.id,
    jobTitle: job.title,
    category: job.category,
    customerId: job.customerId,
    customerName: job.customerName,
    customerEmail: job.customerEmail,
    providerId: quote.providerId,
    providerName: quote.providerName,
    price: quote.price,
    scheduledDate: slot.scheduledDate,
    scheduledTime: slot.scheduledTime,
    location: job.location,
    status: "confirmed" as BookingStatus,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await batch.commit()
  return newBookingRef.id
}

/**
 * Legacy wrapper for backward compatibility
 */
export async function acceptJobQuote(job: Job, quote: JobQuote): Promise<string> {
  return acceptJobQuoteWithSlot(job, quote, {
    scheduledDate: job.preferredDate || new Date().toISOString().split("T")[0],
    scheduledTime: "10:00 AM - 12:00 PM",
  })
}

/**
 * Updates a booking's status in Firestore (e.g. pending -> confirmed -> in_progress -> completed -> cancelled)
 */
export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus
): Promise<void> {
  const bookingRef = doc(db, "bookings", bookingId)
  await updateDoc(bookingRef, {
    status: newStatus,
    updatedAt: serverTimestamp(),
  })
}

/**
 * Subscribes in real time to customer bookings.
 */
export function listenToCustomerBookings(
  customerId: string,
  callback: (bookings: Booking[]) => void
): Unsubscribe {
  const bookingsCol = collection(db, "bookings")
  const q = query(bookingsCol, where("customerId", "==", customerId))

  return onSnapshot(q, (snapshot) => {
    const list: Booking[] = []
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as any) })
    })
    callback(list)
  }, (err) => {
    console.warn("listenToCustomerBookings error:", err)
    callback([])
  })
}

/**
 * Subscribes in real time to provider bookings.
 */
export function listenToProviderBookings(
  providerId: string,
  callback: (bookings: Booking[]) => void
): Unsubscribe {
  const bookingsCol = collection(db, "bookings")
  const q = query(bookingsCol, where("providerId", "==", providerId))

  return onSnapshot(q, (snapshot) => {
    const list: Booking[] = []
    snapshot.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as any) })
    })
    callback(list)
  }, (err) => {
    console.warn("listenToProviderBookings error:", err)
    callback([])
  })
}
