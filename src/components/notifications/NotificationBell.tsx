import React, { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import {
  AppNotification,
  listenToUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "@/services/notificationService"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  BellOff,
  CheckCheck,
  CheckCircle2,
  FileText,
  CalendarClock,
  Trash2,
  ExternalLink,
} from "lucide-react"

function formatRelativeTime(timestamp: any): string {
  if (!timestamp) return "Just now"

  let date: Date
  if (timestamp.toDate && typeof timestamp.toDate === "function") {
    date = timestamp.toDate()
  } else if (timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000)
  } else if (timestamp instanceof Date) {
    date = timestamp
  } else {
    date = new Date(timestamp)
  }

  if (isNaN(date.getTime())) return "Recently"

  const now = new Date()
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffSec < 60) return "Just now"
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export const NotificationBell: React.FC<{ className?: string }> = ({ className }) => {
  const { currentUser } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  // Real-time onSnapshot listener for the authenticated user's notifications
  useEffect(() => {
    if (!currentUser?.uid) {
      setNotifications([])
      return
    }

    const unsubscribe = listenToUserNotifications(currentUser.uid, (data) => {
      setNotifications(data)
    })

    return () => {
      unsubscribe()
    }
  }, [currentUser?.uid])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAllRead = async () => {
    if (unreadCount === 0 || isMarkingAll) return
    try {
      setIsMarkingAll(true)
      await markAllNotificationsAsRead(notifications)
    } catch (err) {
      console.error("Failed to mark all as read:", err)
    } finally {
      setIsMarkingAll(false)
    }
  }

  const handleItemClick = async (notif: AppNotification) => {
    if (!notif.read) {
      try {
        await markNotificationAsRead(notif.id)
      } catch (err) {
        console.error("Failed to mark notification as read:", err)
      }
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await deleteNotification(id)
    } catch (err) {
      console.error("Failed to delete notification:", err)
    }
  }

  const getNotificationIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "quote_request":
        return <FileText className="w-4 h-4 text-blue-500 shrink-0" />
      case "quote_accepted":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
      case "booking_status":
        return <CalendarClock className="w-4 h-4 text-amber-500 shrink-0" />
      default:
        return <Bell className="w-4 h-4 text-primary shrink-0" />
    }
  }

  if (!currentUser) return null

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={`relative h-8 w-8 rounded-full hover:bg-accent text-foreground ${className || ""}`}
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-primary text-[10px] font-extrabold text-primary-foreground shadow-sm animate-in zoom-in-50">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[340px] sm:w-[380px] p-0 shadow-xl rounded-xl border border-border bg-card text-card-foreground overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 bg-muted/30">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-sm tracking-tight text-foreground">Notifications</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="px-1.5 py-0 text-[11px] font-bold bg-primary/15 text-primary border-primary/20">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllRead}
              disabled={isMarkingAll}
              className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground gap-1.5 font-medium"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-[380px] overflow-y-auto divide-y divide-border/40">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="h-10 w-10 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-2">
                <BellOff className="w-5 h-5" />
              </div>
              <p className="text-sm font-medium text-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                We'll notify you when quotes, requests, or booking statuses change.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleItemClick(notif)}
                className={`group relative flex items-start gap-3 p-3.5 text-left transition-colors cursor-pointer hover:bg-muted/50 ${
                  !notif.read ? "bg-primary/5 dark:bg-primary/10" : ""
                }`}
              >
                {/* Type Icon */}
                <div className="mt-0.5 p-1.5 rounded-lg bg-background border border-border/80 shadow-2xs">
                  {getNotificationIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <p className={`text-xs leading-snug break-words ${!notif.read ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                    {notif.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground/80 mt-1 font-medium">
                    {formatRelativeTime(notif.createdAt)}
                  </p>
                </div>

                {/* Unread indicator dot & Delete action */}
                <div className="absolute right-3 top-3.5 flex items-center gap-1.5">
                  {!notif.read && (
                    <span className="h-2 w-2 rounded-full bg-primary ring-2 ring-background" title="Unread" />
                  )}
                  <button
                    onClick={(e) => handleDelete(e, notif.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-destructive rounded"
                    title="Delete notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 bg-muted/20 border-t border-border/60 text-center">
            <span className="text-[11px] text-muted-foreground">
              Real-time updates enabled
            </span>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
