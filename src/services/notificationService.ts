import {
  collection,
  doc,
  addDoc,
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

export type NotificationType = "quote_request" | "quote_accepted" | "booking_status" | "general"

export interface AppNotification {
  id: string
  userId: string
  message: string
  type: NotificationType
  read: boolean
  createdAt?: any
}

/**
 * Creates a notification in the "notifications" collection.
 */
export async function createNotification(data: {
  userId: string
  message: string
  type: NotificationType
}): Promise<string> {
  try {
    const notifsCol = collection(db, "notifications")
    const docRef = await addDoc(notifsCol, {
      userId: data.userId,
      message: data.message,
      type: data.type,
      read: false,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Failed to create notification:", error)
    return ""
  }
}

/**
 * Subscribes in real-time to notifications for a specific user using onSnapshot.
 * Gracefully handles compound query indexing by sorting in-memory if needed.
 */
export function listenToUserNotifications(
  userId: string,
  callback: (notifications: AppNotification[]) => void
): Unsubscribe {
  const notifsCol = collection(db, "notifications")

  // Primary attempt: indexed by userId + createdAt desc
  try {
    const q = query(
      notifsCol,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    )

    return onSnapshot(
      q,
      (snapshot) => {
        const list: AppNotification[] = []
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) })
        })
        callback(list)
      },
      (error) => {
        console.warn("Index query for notifications failed, falling back to simple query:", error.message)
        // Fallback to simple query without orderBy (in case composite index is not yet generated)
        const fallbackQ = query(notifsCol, where("userId", "==", userId))
        return onSnapshot(fallbackQ, (snapshot) => {
          const list: AppNotification[] = []
          snapshot.forEach((d) => {
            list.push({ id: d.id, ...(d.data() as any) })
          })
          // In-memory sort by createdAt
          list.sort((a, b) => {
            const timeA = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || 0
            const timeB = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || 0
            return timeB - timeA
          })
          callback(list)
        })
      }
    )
  } catch (err: any) {
    console.error("listenToUserNotifications initialization error:", err)
    // Fallback: simple query
    const fallbackQ = query(notifsCol, where("userId", "==", userId))
    return onSnapshot(fallbackQ, (snapshot) => {
      const list: AppNotification[] = []
      snapshot.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as any) })
      })
      list.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || 0
        const timeB = b.createdAt?.toMillis?.() || 0
        return timeB - timeA
      })
      callback(list)
    })
  }
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const notifRef = doc(db, "notifications", notificationId)
  await updateDoc(notifRef, {
    read: true,
  })
}

/**
 * Marks all unread notifications for a user as read.
 */
export async function markAllNotificationsAsRead(notifications: AppNotification[]): Promise<void> {
  const unreadList = notifications.filter((n) => !n.read)
  if (unreadList.length === 0) return

  const batch = writeBatch(db)
  unreadList.forEach((n) => {
    const notifRef = doc(db, "notifications", n.id)
    batch.update(notifRef, { read: true })
  })

  await batch.commit()
}

/**
 * Deletes a notification from Firestore.
 */
export async function deleteNotification(notificationId: string): Promise<void> {
  const notifRef = doc(db, "notifications", notificationId)
  await deleteDoc(notifRef)
}
