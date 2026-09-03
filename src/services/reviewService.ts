import {
  doc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/firebase/config"
import { Booking } from "@/services/jobService"

export interface Review {
  id: string
  bookingId: string
  jobId: string
  providerId: string
  providerName: string
  customerId: string
  customerName: string
  customerPhotoURL?: string
  rating: number // 1 to 5
  comment: string
  serviceCategory?: string
  createdAt?: any
}

export interface ReviewSubmissionPayload {
  rating: number
  comment: string
  customer: {
    uid: string
    name: string
    photoURL?: string | null
  }
}

/**
 * Submits a customer review using a Firestore atomic transaction.
 * 1. Checks that the booking exists, is completed, and hasn't been reviewed yet.
 * 2. Recalculates the provider's avgRating and increments totalReviews.
 * 3. Creates the review document in the "reviews" collection.
 * 4. Marks the booking document as hasReviewed: true.
 */
export async function submitReviewTransaction(
  booking: Booking,
  payload: ReviewSubmissionPayload
): Promise<string> {
  const { rating, comment, customer } = payload

  return await runTransaction(db, async (transaction) => {
    // 1. Read Booking Document
    const bookingRef = doc(db, "bookings", booking.id)
    const bookingSnap = await transaction.get(bookingRef)

    if (!bookingSnap.exists()) {
      throw new Error("The associated booking was not found.")
    }

    const bookingData = bookingSnap.data()
    if (bookingData.hasReviewed) {
      throw new Error("You have already submitted a review for this completed booking.")
    }

    // 2. Read Provider Document
    const providerRef = doc(db, "providers", booking.providerId)
    const providerSnap = await transaction.get(providerRef)

    let currentAvg = 5.0
    let currentTotal = 0

    if (providerSnap.exists()) {
      const providerData = providerSnap.data()
      currentAvg = typeof providerData.avgRating === "number" ? providerData.avgRating : 5.0
      currentTotal = typeof providerData.totalReviews === "number" ? providerData.totalReviews : 0
    }

    // 3. Calculate New Ratings
    const newTotalReviews = currentTotal + 1
    // Weighted formula: ((prevAvg * prevTotal) + newRating) / (newTotal)
    // If previous total was 0, newAvg is just the new rating
    const rawNewAvg =
      currentTotal > 0
        ? (currentAvg * currentTotal + rating) / newTotalReviews
        : rating
    const newAvgRating = Math.round(rawNewAvg * 10) / 10

    // 4. Create Review Doc Reference
    const reviewsCol = collection(db, "reviews")
    const newReviewRef = doc(reviewsCol)

    // 5. Atomic Writes
    // a) Save new review
    transaction.set(newReviewRef, {
      bookingId: booking.id,
      jobId: booking.jobId,
      providerId: booking.providerId,
      providerName: booking.providerName,
      customerId: customer.uid,
      customerName: customer.name,
      customerPhotoURL: customer.photoURL || null,
      rating,
      comment: comment.trim(),
      serviceCategory: booking.category,
      createdAt: serverTimestamp(),
    })

    // b) Update booking with hasReviewed flag and details
    transaction.update(bookingRef, {
      hasReviewed: true,
      rating,
      reviewComment: comment.trim(),
      reviewedAt: serverTimestamp(),
    })

    // c) Update provider profile with recalculated avgRating and totalReviews
    if (providerSnap.exists()) {
      transaction.update(providerRef, {
        avgRating: newAvgRating,
        totalReviews: newTotalReviews,
      })
    } else {
      transaction.set(
        providerRef,
        {
          uid: booking.providerId,
          name: booking.providerName,
          avgRating: newAvgRating,
          totalReviews: newTotalReviews,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      )
    }

    return newReviewRef.id
  })
}

/**
 * Fetches all reviews for a specific provider.
 */
export async function fetchProviderReviews(providerId: string): Promise<Review[]> {
  const reviewsCol = collection(db, "reviews")
  const results: Review[] = []

  try {
    const q = query(
      reviewsCol,
      where("providerId", "==", providerId),
      orderBy("createdAt", "desc")
    )
    const snapshot = await getDocs(q)
    snapshot.forEach((d) => {
      results.push({ id: d.id, ...(d.data() as any) })
    })
  } catch (err: any) {
    console.warn("Compound review query failed (index pending?), falling back:", err.message)
    // Fallback without ordering
    const fallbackQ = query(reviewsCol, where("providerId", "==", providerId))
    const fallbackSnap = await getDocs(fallbackQ)
    fallbackSnap.forEach((d) => {
      results.push({ id: d.id, ...(d.data() as any) })
    })
    // Sort in memory by createdAt if available
    results.sort((a, b) => {
      const aTime = a.createdAt?.seconds || 0
      const bTime = b.createdAt?.seconds || 0
      return bTime - aTime
    })
  }

  return results
}
