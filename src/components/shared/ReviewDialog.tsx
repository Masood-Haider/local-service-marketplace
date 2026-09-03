import React, { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { Booking } from "@/services/jobService"
import { submitReviewTransaction } from "@/services/reviewService"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Loader2, Send, CheckCircle2, Award } from "lucide-react"

interface ReviewDialogProps {
  booking: Booking | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export const ReviewDialog: React.FC<ReviewDialogProps> = ({
  booking,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const ratingDescriptions: Record<number, string> = {
    1: "Poor - Significant issues with the service",
    2: "Fair - Needs improvement",
    3: "Good - Met basic expectations",
    4: "Very Good - High quality work and communication",
    5: "Exceptional - Highly recommended, outstanding work!",
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking || !currentUser) return

    if (!comment.trim()) {
      toast.error("Please provide a review comment describing your experience.")
      return
    }

    setSubmitting(true)
    try {
      await submitReviewTransaction(booking, {
        rating,
        comment: comment.trim(),
        customer: {
          uid: currentUser.uid,
          name: currentUser.name,
          photoURL: currentUser.photoURL,
        },
      })

      toast.success("Review submitted successfully!", {
        description: `Thank you for reviewing ${booking.providerName}. Your feedback helps our community.`,
      })

      setComment("")
      setRating(5)
      onOpenChange(false)
      if (onSuccess) onSuccess()
    } catch (err: any) {
      toast.error("Failed to submit review", {
        description: err.message || "An error occurred during submission.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!booking) return null

  const activeRating = hoverRating || rating

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500" />
            </div>
            <DialogTitle className="text-xl">Rate & Review Your Experience</DialogTitle>
          </div>
          <DialogDescription>
            Share verified feedback for <strong>{booking.providerName}</strong> on the project{" "}
            <em>"{booking.jobTitle}"</em>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Booking Context Pill */}
          <div className="p-3 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between text-xs">
            <div>
              <span className="text-muted-foreground block">Service Category</span>
              <span className="font-semibold text-foreground">{booking.category}</span>
            </div>
            <div className="text-right">
              <span className="text-muted-foreground block">Completed Slot</span>
              <span className="font-semibold text-foreground">{booking.scheduledDate}</span>
            </div>
          </div>

          {/* Star Rating Picker */}
          <div className="space-y-2 text-center py-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
              Overall Satisfaction Rating *
            </label>

            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((starVal) => {
                const isFilled = starVal <= activeRating

                return (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded-lg hover:scale-110 transition-transform focus:outline-none"
                    aria-label={`Rate ${starVal} stars`}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        isFilled
                          ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                          : "text-muted-foreground/30 hover:text-muted-foreground/60"
                      }`}
                    />
                  </button>
                )
              })}
            </div>

            <p className="text-xs font-medium text-amber-600 dark:text-amber-400 min-h-[18px]">
              {ratingDescriptions[activeRating] || ""}
            </p>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-1.5">
            <label htmlFor="review-comment" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Your Review / Comments *
            </label>
            <textarea
              id="review-comment"
              rows={4}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="How was the pro's punctuality, quality of craft, cleanliness, and communication? Would you hire them again?"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <span className="text-[11px] text-muted-foreground">
              Your review will appear publicly on {booking.providerName}'s public profile page.
            </span>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              className="w-full h-11 gap-2 font-semibold shadow-xs"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting Review...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Submit Verified Review
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
