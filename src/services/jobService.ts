import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Unsubscribe,
} from "firebase/firestore"
import { db } from "@/firebase/config"
import { createNotification } from "@/services/notificationService"

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
  providerPhotoURL?: string | null
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
 * Deletes a customer's service request / job posting from Firestore,
 * cleaning up any associated quotes in its subcollection.
 */
export async function deleteCustomerJob(jobId: string): Promise<void> {
  // 1. Delete quotes in subcollection jobs/{jobId}/quotes
  try {
    const quotesCol = collection(db, "jobs", jobId, "quotes")
    const quotesSnap = await getDocs(quotesCol)
    if (!quotesSnap.empty) {
      const batch = writeBatch(db)
      quotesSnap.forEach((qDoc) => {
        batch.delete(qDoc.ref)
      })
      await batch.commit()
    }
  } catch (err) {
    console.warn("Error cleaning up job quotes subcollection:", err)
  }

  // 2. Delete the job document itself
  const jobRef = doc(db, "jobs", jobId)
  await deleteDoc(jobRef)
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

  const q = query(jobsCol, where("status", "==", "open"))

  return onSnapshot(
    q,
    (snapshot) => {
      const jobs: Job[] = []
      snapshot.forEach((d) => {
        const data = d.data() as any
        if (!category || category === "All" || data.category === category) {
          jobs.push({ id: d.id, ...data })
        }
      })
      callback(jobs)
    },
    (err) => {
      console.warn("listenToOpenJobs error:", err)
      callback([])
    }
  )
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
  
  const payload: any = {
    providerId: quoteData.providerId,
    providerName: quoteData.providerName,
    providerPhotoURL: quoteData.providerPhotoURL || null,
    price: quoteData.price,
    message: quoteData.message,
    jobId,
    status: "pending",
    createdAt: serverTimestamp(),
  }

  // Ensure no undefined values are sent to Firestore
  Object.keys(payload).forEach((key) => {
    if (payload[key] === undefined) {
      delete payload[key]
    }
  })

  const docRef = await addDoc(quotesCol, payload)

  // Notify the job's customer that a provider submitted a quote
  try {
    const jobSnap = await getDoc(doc(db, "jobs", jobId))
    if (jobSnap.exists()) {
      const jData = jobSnap.data() as Job
      await createNotification({
        userId: jData.customerId,
        message: `${quoteData.providerName} submitted a quote (${quoteData.price}) for "${jData.title}".`,
        type: "quote_request",
      })
    }
  } catch (err) {
    console.warn("Failed to notify customer of new quote:", err)
  }

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

  // Real-time notifications: trigger for provider whose quote was accepted & customer
  try {
    // Notify provider that their quote was accepted
    await createNotification({
      userId: quote.providerId,
      message: `Your quote (${quote.price}) for "${job.title}" has been accepted! Booking confirmed for ${slot.scheduledDate}.`,
      type: "quote_accepted",
    })

    // Also notify customer of confirmed booking
    await createNotification({
      userId: job.customerId,
      message: `Quote from ${quote.providerName} for "${job.title}" was accepted. Booking confirmed.`,
      type: "quote_accepted",
    })
  } catch (err) {
    console.warn("Failed to notify participants on quote acceptance:", err)
  }

  return newBookingRef.id
}

/**
 * Declines/rejects a provider's quote on a job:
 * 1. Updates quote status to "declined" in jobs/{jobId}/quotes/{quoteId}
 * 2. Notifies the provider that their quote was declined
 */
export async function declineJobQuote(
  jobId: string,
  quote: JobQuote
): Promise<void> {
  const quoteRef = doc(db, "jobs", jobId, "quotes", quote.id)
  await updateDoc(quoteRef, {
    status: "declined",
    updatedAt: serverTimestamp(),
  })

  try {
    const jobSnap = await getDoc(doc(db, "jobs", jobId))
    const jobTitle = jobSnap.exists() ? (jobSnap.data() as any).title : "job request"
    await createNotification({
      userId: quote.providerId,
      message: `Your quote (${quote.price}) for "${jobTitle}" was declined by the customer.`,
      type: "general",
    })
  } catch (err) {
    console.warn("Failed to notify provider of declined quote:", err)
  }
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
 * and dispatches real-time in-app notifications to participants.
 */
export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus
): Promise<void> {
  const bookingRef = doc(db, "bookings", bookingId)

  // Fetch booking details prior to updating to inform participants
  let bookingData: Booking | null = null
  try {
    const snap = await getDoc(bookingRef)
    if (snap.exists()) {
      bookingData = { id: snap.id, ...(snap.data() as any) }
    }
  } catch (e) {
    console.warn("Could not retrieve booking for status notification:", e)
  }

  await updateDoc(bookingRef, {
    status: newStatus,
    updatedAt: serverTimestamp(),
  })

  // Trigger real-time notifications for both participants
  if (bookingData) {
    const statusLabel = newStatus.replace("_", " ").toUpperCase()
    const jobTitle = bookingData.jobTitle || "Service"

    try {
      // Notify customer
      await createNotification({
        userId: bookingData.customerId,
        message: `Booking for "${jobTitle}" status changed to ${statusLabel}.`,
        type: "booking_status",
      })

      // Notify provider
      await createNotification({
        userId: bookingData.providerId,
        message: `Booking for "${jobTitle}" status changed to ${statusLabel}.`,
        type: "booking_status",
      })
    } catch (nErr) {
      console.warn("Failed to trigger booking status notification:", nErr)
    }
  }
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
    list.sort((a, b) => {
      const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
      const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
      return tB - tA
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
    list.sort((a, b) => {
      const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
      const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
      return tB - tA
    })
    callback(list)
  }, (err) => {
    console.warn("listenToProviderBookings error:", err)
    callback([])
  })
}

export interface DirectQuote {
  id: string
  providerId: string
  providerName: string
  customerId?: string
  customerName: string
  customerEmail: string
  customerPhone?: string
  serviceNeeded: string
  serviceLocation: string
  preferredDate?: string
  projectDetails: string
  status: "pending" | "accepted" | "declined"
  price?: string
  createdAt?: any
}

/**
 * Subscribes in real time to direct quote requests / client offers sent to this provider.
 */
export function listenToProviderDirectQuotes(
  providerId: string,
  callback: (quotes: DirectQuote[]) => void
): Unsubscribe {
  const quotesCol = collection(db, "quotes")
  const q = query(quotesCol, where("providerId", "==", providerId))

  return onSnapshot(
    q,
    (snapshot) => {
      const list: DirectQuote[] = []
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as any) })
      })
      list.sort((a, b) => {
        const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0
        const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0
        return tB - tA
      })
      callback(list)
    },
    (err) => {
      console.warn("listenToProviderDirectQuotes error:", err)
      callback([])
    }
  )
}

/**
 * Accepts a direct client quote request / offer:
 * 1. Updates quote status to "accepted"
 * 2. Creates a confirmed booking record in "bookings" collection
 * 3. Sends real-time notification to the customer
 */
export async function acceptDirectQuote(
  quote: DirectQuote,
  customPrice?: string,
  slot?: { scheduledDate?: string; scheduledTime?: string }
): Promise<string> {
  const quoteRef = doc(db, "quotes", quote.id)
  await updateDoc(quoteRef, {
    status: "accepted",
    price: customPrice || "Agreed upon direct estimate",
    updatedAt: serverTimestamp(),
  })

  // Create booking record
  const bookingsCol = collection(db, "bookings")
  const bookingRef = await addDoc(bookingsCol, {
    jobId: quote.id,
    jobTitle: quote.serviceNeeded,
    customerId: quote.customerId || "",
    customerName: quote.customerName,
    customerEmail: quote.customerEmail || "",
    providerId: quote.providerId,
    providerName: quote.providerName,
    category: quote.serviceNeeded,
    price: customPrice || "Estimate on inspection",
    scheduledDate: slot?.scheduledDate || quote.preferredDate || new Date().toISOString().split("T")[0],
    scheduledTime: slot?.scheduledTime || "10:00 AM - 12:00 PM",
    location: quote.serviceLocation,
    status: "confirmed",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  if (quote.customerId) {
    try {
      await createNotification({
        userId: quote.customerId,
        message: `${quote.providerName} accepted your direct service request for "${quote.serviceNeeded}"!`,
        type: "quote_accepted",
      })
    } catch (nErr) {
      console.warn("Failed to notify customer of accepted quote:", nErr)
    }
  }

  return bookingRef.id
}

/**
 * Declines a direct client quote request / offer.
 */
export async function declineDirectQuote(
  quoteId: string,
  customerId?: string,
  providerName?: string
): Promise<void> {
  const quoteRef = doc(db, "quotes", quoteId)
  await updateDoc(quoteRef, {
    status: "declined",
    updatedAt: serverTimestamp(),
  })

  if (customerId && providerName) {
    try {
      await createNotification({
        userId: customerId,
        message: `${providerName} was unable to accept your quote request at this time.`,
        type: "general",
      })
    } catch (nErr) {
      console.warn("Failed to notify customer of declined quote:", nErr)
    }
  }
}

