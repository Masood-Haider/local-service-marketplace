import React, { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import {
  listenToCustomerBookings,
  updateBookingStatus,
  getBookingStatusBadge,
  Booking,
} from "@/services/jobService"
import { ReviewDialog } from "@/components/shared/ReviewDialog"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/shared/EmptyState"
import { ConfirmDialog } from "@/components/shared/ConfirmDialog"
import {
  Calendar as CalendarIcon,
  PlusCircle,
  MapPin,
  Clock,
  Loader2,
  XCircle,
  LayoutGrid,
  List,
  Star,
  CheckCircle2,
} from "lucide-react"
import { Link } from "react-router-dom"

export const CustomerBookings: React.FC = () => {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null)

  useEffect(() => {
    if (!currentUser?.uid) return

    const unsubscribe = listenToCustomerBookings(currentUser.uid, (data) => {
      setBookings(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser?.uid])

  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null)
  const [cancellingBooking, setCancellingBooking] = useState(false)

  const handleConfirmCancelBooking = async () => {
    if (!bookingToCancel) return
    const booking = bookingToCancel
    setCancellingBooking(true)
    try {
      await updateBookingStatus(booking.id, "cancelled")
      toast.success("Booking cancelled", {
        description: `Your appointment with ${booking.providerName} has been cancelled.`,
      })
      setBookingToCancel(null)
    } catch (err: any) {
      toast.error("Failed to cancel booking", { description: err.message })
    } finally {
      setCancellingBooking(false)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="My Bookings & Service Appointments"
        description="Track your scheduled appointments through every stage: pending, confirmed, in-progress, and completed."
        action={
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex border border-border rounded-lg p-0.5 bg-muted/30">
              <Button
                variant={viewMode === "cards" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={() => setViewMode("cards")}
              >
                <LayoutGrid className="w-3.5 h-3.5 mr-1" /> Cards
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={() => setViewMode("table")}
              >
                <List className="w-3.5 h-3.5 mr-1" /> Table
              </Button>
            </div>
            <Link to="/post-job">
              <Button className="gap-2 shadow-sm shadow-primary/20">
                <PlusCircle className="w-4 h-4" /> Book New Service
              </Button>
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading your appointments...</p>
        </div>
      ) : bookings.length > 0 ? (
        viewMode === "cards" ? (
          /* Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookings.map((booking) => {
              const statusInfo = getBookingStatusBadge(booking.status)
              const isCompleted = booking.status === "completed"

              return (
                <Card key={booking.id} className="hover:shadow-md transition-shadow border-border flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="text-[10px] font-semibold text-primary mb-1">
                          {booking.category}
                        </Badge>
                        <CardTitle className="text-lg font-bold line-clamp-1">{booking.jobTitle}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          Provider:{" "}
                          <Link
                            to={`/providers/${booking.providerId}`}
                            className="font-semibold text-primary hover:underline"
                          >
                            {booking.providerName}
                          </Link>
                        </CardDescription>
                      </div>

                      <Badge className={statusInfo.className}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-1">
                    <div className="p-3 rounded-lg bg-muted/40 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Service Date:</span>
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                          {booking.scheduledDate}
                        </span>
                      </div>
                      {booking.scheduledTime && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Time Slot:</span>
                          <span className="font-semibold text-foreground flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                            {booking.scheduledTime}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-border/60">
                        <span className="text-muted-foreground">Agreed Price:</span>
                        <span className="font-bold text-base text-foreground">{booking.price}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{booking.location}</span>
                    </p>
                  </CardContent>

                  <CardFooter className="border-t border-border/60 pt-3 flex items-center justify-between gap-2">
                    <Link to={`/dashboard/customer/jobs/${booking.jobId}`}>
                      <Button variant="ghost" size="sm" className="text-xs h-8">
                        View Project
                      </Button>
                    </Link>

                    {/* COMPLETED BOOKING: LEAVE A REVIEW (ONLY ONCE) */}
                    {isCompleted && !booking.hasReviewed && (
                      <Button
                        size="sm"
                        className="text-xs h-8 gap-1.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-xs"
                        onClick={() => setReviewBooking(booking)}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" /> Leave a Review
                      </Button>
                    )}

                    {isCompleted && booking.hasReviewed && (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[11px] font-semibold gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Reviewed ({booking.rating}★)
                      </Badge>
                    )}

                    {/* ACTIVE BOOKING: CANCEL */}
                    {booking.status !== "completed" && booking.status !== "cancelled" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 text-rose-500 border-rose-500/20 hover:bg-rose-500/10"
                        onClick={() => setBookingToCancel(booking)}
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Cancel
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          /* Table View */
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Appointments Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Project / Job</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Scheduled Slot</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => {
                      const statusInfo = getBookingStatusBadge(booking.status)
                      const isCompleted = booking.status === "completed"

                      return (
                        <TableRow key={booking.id} className="hover:bg-muted/30">
                          <TableCell className="font-semibold text-foreground">
                            <div>
                              <p className="line-clamp-1">{booking.jobTitle}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-primary shrink-0" />
                                <span className="truncate max-w-[180px]">{booking.location}</span>
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Link
                              to={`/providers/${booking.providerId}`}
                              className="font-medium text-primary hover:underline text-sm"
                            >
                              {booking.providerName}
                            </Link>
                          </TableCell>
                          <TableCell className="text-sm">
                            <p className="font-medium">{booking.scheduledDate}</p>
                            {booking.scheduledTime && (
                              <p className="text-xs text-muted-foreground">{booking.scheduledTime}</p>
                            )}
                          </TableCell>
                          <TableCell className="font-bold text-foreground">{booking.price}</TableCell>
                          <TableCell>
                            <Badge className={statusInfo.className}>
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            <Link to={`/dashboard/customer/jobs/${booking.jobId}`}>
                              <Button size="sm" variant="ghost" className="text-xs h-8">
                                View
                              </Button>
                            </Link>

                            {/* COMPLETED BOOKING REVIEW BUTTON IN TABLE */}
                            {isCompleted && !booking.hasReviewed && (
                              <Button
                                size="sm"
                                className="text-xs h-8 gap-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold"
                                onClick={() => setReviewBooking(booking)}
                              >
                                <Star className="w-3 h-3 fill-current" /> Review
                              </Button>
                            )}

                            {isCompleted && booking.hasReviewed && (
                              <Badge variant="outline" className="text-[11px] font-semibold text-emerald-600 border-emerald-500/30">
                                {booking.rating}★ Reviewed
                              </Badge>
                            )}

                            {booking.status !== "completed" && booking.status !== "cancelled" && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs h-8 text-rose-500 border-rose-500/20 hover:bg-rose-500/10"
                                onClick={() => setBookingToCancel(booking)}
                              >
                                Cancel
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <EmptyState
          icon={CalendarIcon}
          title="No Service Bookings Yet"
          description="Once you accept an estimate from a local specialist, your appointment tracking will be displayed here."
          action={
            <Link to="/post-job">
              <Button className="gap-2">
                <PlusCircle className="w-4 h-4" /> Post a Job Request
              </Button>
            </Link>
          }
        />
      )}

      {/* Review Dialog Modal */}
      <ReviewDialog
        booking={reviewBooking}
        open={reviewBooking !== null}
        onOpenChange={(open) => !open && setReviewBooking(null)}
      />

      {/* Cancel Appointment Confirmation Popup */}
      <ConfirmDialog
        open={bookingToCancel !== null}
        onOpenChange={(open) => !open && setBookingToCancel(null)}
        title="Cancel Service Appointment?"
        description={
          <>
            Are you sure you want to cancel your scheduled appointment for <strong>"{bookingToCancel?.jobTitle}"</strong> with <strong>{bookingToCancel?.providerName}</strong>? Both you and the professional will receive cancellation notices.
          </>
        }
        confirmLabel="Cancel Appointment"
        variant="destructive"
        icon="cancel"
        isLoading={cancellingBooking}
        onConfirm={handleConfirmCancelBooking}
      />
    </div>
  )
}
