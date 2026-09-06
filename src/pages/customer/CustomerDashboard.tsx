import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { useAuth } from "@/hooks/useAuth"
import {
  listenToCustomerJobs,
  listenToCustomerBookings,
  listenToJobQuotes,
  acceptJobQuoteWithSlot,
  declineJobQuote,
  deleteCustomerJob,
  updateBookingStatus,
  getBookingStatusBadge,
  Job,
  JobQuote,
  Booking,
} from "@/services/jobService"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/shared/EmptyState"
import {
  Calendar as CalendarIcon,
  PlusCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  MapPin,
  Loader2,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  Tag,
  Trash2,
} from "lucide-react"

const timeSlots = [
  "08:00 AM - 10:00 AM (Morning)",
  "10:00 AM - 12:00 PM (Late Morning)",
  "12:00 PM - 02:00 PM (Early Afternoon)",
  "02:00 PM - 04:00 PM (Afternoon)",
  "04:00 PM - 06:00 PM (Evening)",
]

export const CustomerDashboard: React.FC = () => {
  const { currentUser } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [quotesByJob, setQuotesByJob] = useState<Record<string, JobQuote[]>>({})
  const [loading, setLoading] = useState(true)

  // Scheduling Dialog state for accepting a quote
  const [schedulingTarget, setSchedulingTarget] = useState<{ job: Job; quote: JobQuote } | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d
  })
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("10:00 AM - 12:00 PM")
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [bookingInProgress, setBookingInProgress] = useState(false)

  // Listen to customer jobs & bookings
  useEffect(() => {
    if (!currentUser?.uid) return

    const unsubJobs = listenToCustomerJobs(currentUser.uid, (data) => {
      setJobs(data)
      setLoading(false)
    })

    const unsubBookings = listenToCustomerBookings(currentUser.uid, (data) => {
      setBookings(data)
    })

    return () => {
      unsubJobs()
      unsubBookings()
    }
  }, [currentUser?.uid])

  // Listen to quotes for all open jobs
  useEffect(() => {
    const openJobs = jobs.filter((j) => j.status === "open")
    if (openJobs.length === 0) {
      setQuotesByJob({})
      return
    }

    const unsubs: (() => void)[] = []
    openJobs.forEach((job) => {
      const unsub = listenToJobQuotes(job.id, (quotes) => {
        setQuotesByJob((prev) => ({
          ...prev,
          [job.id]: quotes,
        }))
      })
      unsubs.push(unsub)
    })

    return () => {
      unsubs.forEach((u) => u())
    }
  }, [jobs])

  const openJobs = jobs.filter((j) => j.status === "open")

  // Flatten pending quotes with their parent job attached
  const pendingQuotesList = Object.entries(quotesByJob).flatMap(([jobId, quotes]) => {
    const targetJob = jobs.find((j) => j.id === jobId)
    if (!targetJob || targetJob.status !== "open") return []
    return quotes
      .filter((q) => !q.status || q.status === "pending")
      .map((q) => ({ quote: q, job: targetJob }))
  })

  const handleStartSchedule = (job: Job, quote: JobQuote) => {
    setSchedulingTarget({ job, quote })
  }

  const handleDeclineQuote = async (job: Job, quote: JobQuote) => {
    if (!window.confirm(`Are you sure you want to decline the quote of ${quote.price} from ${quote.providerName}?`)) {
      return
    }
    try {
      await declineJobQuote(job.id, quote)
      toast.success("Quote declined", {
        description: `You declined the quote from ${quote.providerName}.`,
      })
    } catch (err: any) {
      console.error("Failed to decline quote:", err)
      toast.error("Failed to decline quote", { description: err.message })
    }
  }

  const [deletingJobId, setDeletingJobId] = useState<string | null>(null)

  const handleDeleteJob = async (jobId: string, title: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete your service request "${title}"? This will permanently remove the request and any bids received.`
      )
    ) {
      return
    }

    setDeletingJobId(jobId)
    try {
      await deleteCustomerJob(jobId)
      toast.success("Service request deleted", {
        description: `"${title}" has been permanently removed.`,
      })
    } catch (err: any) {
      console.error("Failed to delete job request:", err)
      toast.error("Failed to delete request", { description: err.message })
    } finally {
      setDeletingJobId(null)
    }
  }

  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null)

  const handleCancelBooking = async (bookingId: string, proName: string) => {
    if (
      !window.confirm(
        `Are you sure you want to cancel your scheduled appointment with ${proName}? Both you and the professional will be notified.`
      )
    ) {
      return
    }

    setCancellingBookingId(bookingId)
    try {
      await updateBookingStatus(bookingId, "cancelled")
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" } : b))
      )
      toast.success("Appointment cancelled", {
        description: `Your appointment with ${proName} has been cancelled.`,
      })
    } catch (err: any) {
      console.error("Error cancelling booking:", err)
      toast.error("Failed to cancel appointment", { description: err.message || "Operation failed." })
    } finally {
      setCancellingBookingId(null)
    }
  }

  const handleConfirmBookingWithSlot = async () => {
    if (!schedulingTarget) return
    const { job, quote } = schedulingTarget

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const selectedNormalized = new Date(selectedDate)
    selectedNormalized.setHours(0, 0, 0, 0)

    if (selectedNormalized < today) {
      toast.error("Invalid booking date", {
        description: "You cannot schedule an appointment for a date in the past.",
      })
      return
    }

    setBookingInProgress(true)
    try {
      const formattedDate = selectedDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })

      await acceptJobQuoteWithSlot(job, quote, {
        scheduledDate: formattedDate,
        scheduledTime: selectedTimeSlot,
      })

      toast.success("Appointment Booked Successfully!", {
        description: `Scheduled with ${quote.providerName} for ${formattedDate} (${selectedTimeSlot}).`,
      })
      setSchedulingTarget(null)
    } catch (err: any) {
      toast.error("Failed to book appointment", {
        description: err.message || "An error occurred while booking.",
      })
    } finally {
      setBookingInProgress(false)
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Customer Hub"
        description="Monitor your active service requests, review incoming proposals, and track booked appointments."
        action={
          <Link to="/post-job">
            <Button className="gap-2 shadow-sm shadow-primary/20">
              <PlusCircle className="w-4 h-4" />
              Post New Request
            </Button>
          </Link>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Accepted Offers</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Confirmed & scheduled</p>
          </CardContent>
        </Card>

        <Card className={pendingQuotesList.length > 0 ? "border-primary/50 bg-primary/5" : ""}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground">Incoming Pro Bids</CardTitle>
            <Tag className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">{pendingQuotesList.length}</span>
              {pendingQuotesList.length > 0 && (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[10px] text-white">
                  Action Required
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Quotes awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Requests</CardTitle>
            <Clock className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openJobs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting pro proposals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Postings</CardTitle>
            <CalendarIcon className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Prominent Incoming Pro Quotes & Proposals Section */}
      {pendingQuotesList.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-bold text-foreground">Incoming Pro Quotes & Proposals</h3>
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs">
                {pendingQuotesList.length} Awaiting Review
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingQuotesList.map(({ quote, job }) => (
              <Card key={quote.id} className="border-primary/40 shadow-sm hover:shadow-md transition-all flex flex-col justify-between bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 border border-border">
                        <AvatarImage src={quote.providerPhotoURL || undefined} alt={quote.providerName} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {quote.providerName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-foreground leading-none">{quote.providerName}</h4>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
                            <ShieldCheck className="w-2.5 h-2.5 mr-0.5 inline" /> Certified Pro
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          For request:{" "}
                          <Link to={`/dashboard/customer/jobs/${job.id}`} className="font-medium text-foreground hover:underline truncate max-w-[160px] sm:max-w-[200px]">
                            {job.title}
                          </Link>
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Offered Price</span>
                      <span className="text-xl font-black text-primary">{quote.price}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <div className="p-3 rounded-lg bg-muted/50 border border-border/60 text-xs text-foreground/90 italic">
                    "{quote.message}"
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-primary" /> Preferred: {job.preferredDate}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="border-t border-border/60 pt-3 flex items-center gap-2 bg-muted/20">
                  <Button
                    size="sm"
                    className="flex-1 gap-1.5 text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                    onClick={() => handleStartSchedule(job, quote)}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Accept & Schedule
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                    onClick={() => handleDeclineQuote(job, quote)}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" /> Decline
                  </Button>
                  <Link to={`/dashboard/customer/jobs/${job.id}`}>
                    <Button size="sm" variant="ghost" className="text-xs px-2.5">
                      Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Accepted Offers & Scheduled Appointments Section */}
      {bookings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">Accepted Offers & Scheduled Appointments</h3>
              <Badge variant="outline" className="text-xs font-semibold">
                {bookings.length} Confirmed
              </Badge>
            </div>
            <Link to="/dashboard/customer/bookings">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View All Bookings <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.slice(0, 4).map((booking) => {
              const statusInfo = getBookingStatusBadge(booking.status)

              return (
                <Card key={booking.id} className="border-border hover:shadow-xs transition-shadow flex flex-col justify-between">
                  <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] text-primary">
                          {booking.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Pro: {booking.providerName}</span>
                      </div>
                      <CardTitle className="text-base font-bold line-clamp-1">{booking.jobTitle}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1.5 flex-wrap justify-end">
                      {booking.status !== "cancelled" ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Accepted Offer
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10 text-[10px] font-semibold gap-1">
                          <XCircle className="w-3 h-3" /> Cancelled
                        </Badge>
                      )}
                      <Badge className={statusInfo.className}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-primary" /> {booking.scheduledDate} {booking.scheduledTime && `(${booking.scheduledTime})`}
                      </span>
                      <span className="font-bold text-foreground">{booking.price}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-muted-foreground flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 text-primary shrink-0" /> {booking.location}
                      </span>
                      <Link to={`/dashboard/customer/jobs/${booking.jobId}`}>
                        <Button variant="link" size="sm" className="text-xs h-6 p-0">
                          Job Details →
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-border/60 pt-3 flex items-center justify-between bg-muted/10">
                    <span className="text-[11px] text-muted-foreground">
                      Status: <span className="font-semibold capitalize text-foreground">{booking.status.replace("_", " ")}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {booking.status !== "cancelled" && booking.status !== "completed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30 h-7 px-2.5 gap-1"
                          onClick={() => handleCancelBooking(booking.id, booking.providerName)}
                          disabled={cancellingBookingId === booking.id}
                        >
                          {cancellingBookingId === booking.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5" />
                          )}
                          Cancel Appointment
                        </Button>
                      )}
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Active Service Requests List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">My Service Requests</h3>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground">
              Open requests awaiting quotes (confirmed jobs move to Accepted Offers above)
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {openJobs.length} Open
          </Badge>
        </div>

        {openJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {openJobs.map((job) => {
              const jobQuotes = (quotesByJob[job.id] || []).filter((q) => !q.status || q.status === "pending")

              return (
                <Card key={job.id} className="hover:shadow-md transition-shadow border-border flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <Badge
                            variant="secondary"
                            className="text-[10px] uppercase font-bold bg-primary/10 text-primary"
                          >
                            Open for quotes
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-semibold text-primary border-primary/30">
                            {job.category}
                          </Badge>
                          {jobQuotes.length > 0 && (
                            <Badge className="bg-emerald-500 text-white text-[10px] font-bold">
                              {jobQuotes.length} Quote{jobQuotes.length === 1 ? "" : "s"} Received
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg font-bold leading-tight line-clamp-1">{job.title}</CardTitle>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                          Budget
                        </span>
                        <span className="font-bold text-sm text-foreground">
                          {job.budget}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/60">
                      <span className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        <CalendarIcon className="w-3.5 h-3.5 text-primary" /> {job.preferredDate}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t border-border/60 pt-3.5 flex items-center justify-between bg-muted/20">
                    <span className="text-xs text-muted-foreground">
                      {jobQuotes.length > 0 ? `${jobQuotes.length} quote(s) pending your review` : "Awaiting proposals"}
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-8 px-2.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border gap-1"
                        onClick={() => handleDeleteJob(job.id, job.title)}
                        disabled={deletingJobId === job.id}
                        title="Delete service request"
                      >
                        {deletingJobId === job.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Delete
                      </Button>
                      <Link to={`/dashboard/customer/jobs/${job.id}`}>
                        <Button size="sm" className="gap-1.5 text-xs h-8">
                          Quotes & Details <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <EmptyState
            title="No Active Service Requests"
            description={
              bookings.length > 0
                ? "Your confirmed requests are active under Accepted Offers above. Post a new request to get bids from certified pros."
                : "Post your first home project or repair request to receive free bids from certified local pros."
            }
            action={
              <Link to="/post-job">
                <Button className="gap-2">
                  <PlusCircle className="w-4 h-4" /> Post New Request
                </Button>
              </Link>
            }
          />
        )}
      </div>

      {/* Booking Slot Selection Modal */}
      <Dialog
        open={!!schedulingTarget}
        onOpenChange={(open) => {
          if (!open) setSchedulingTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="w-5 h-5 text-primary" />
              Book Appointment with {schedulingTarget?.quote.providerName}
            </DialogTitle>
            <DialogDescription>
              Select your preferred service date and arrival window to confirm this booking for{" "}
              <strong className="text-foreground">{schedulingTarget?.quote.price}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* 1. Date Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                1. Select Service Date *
              </label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between text-left font-normal h-11 border-border"
                  >
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-foreground">
                        {selectedDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground opacity-60" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    selected={selectedDate}
                    minDate={new Date()}
                    onSelect={(d) => {
                      setSelectedDate(d)
                      setCalendarOpen(false)
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* 2. Time Slot Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                2. Select Arrival Time Window *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`p-2.5 rounded-lg border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                      selectedTimeSlot === slot
                        ? "border-primary bg-primary/10 text-primary ring-1 ring-primary"
                        : "border-border hover:bg-muted text-foreground"
                    }`}
                  >
                    <span>{slot}</span>
                    {selectedTimeSlot === slot && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary Banner */}
            <div className="p-3.5 rounded-xl bg-muted/50 border border-border text-xs space-y-1">
              <p className="text-foreground">
                <strong>Appointment Address:</strong> {schedulingTarget?.job.location}
              </p>
              <p className="text-muted-foreground">
                The provider will arrive within your chosen time window and invoice the agreed price of{" "}
                <strong className="text-foreground">{schedulingTarget?.quote.price}</strong> upon completion.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              className="w-full h-11 gap-2 font-semibold"
              onClick={handleConfirmBookingWithSlot}
              disabled={bookingInProgress}
            >
              {bookingInProgress ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Confirming Booking...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Confirm & Book Appointment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
