import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import {
  listenToJob,
  listenToJobQuotes,
  acceptJobQuoteWithSlot,
  Job,
  JobQuote,
} from "@/services/jobService"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
  MapPin,
  Calendar as CalendarIcon,
  DollarSign,
  Clock,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  AlertCircle,
  ChevronDown,
} from "lucide-react"

export const JobDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>()
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const [job, setJob] = useState<Job | null>(null)
  const [quotes, setQuotes] = useState<JobQuote[]>([])
  const [loadingJob, setLoadingJob] = useState(true)

  // Scheduling Modal State
  const [schedulingQuote, setSchedulingQuote] = useState<JobQuote | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    return d
  })
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("10:00 AM - 12:00 PM")
  const [bookingInProgress, setBookingInProgress] = useState(false)
  const [calendarOpen, setCalendarOpen] = useState(false)

  const timeSlots = [
    "08:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "01:00 PM - 03:00 PM",
    "03:00 PM - 05:00 PM",
    "05:00 PM - 07:00 PM",
  ]

  // 1. Real-time onSnapshot listener for the job document
  useEffect(() => {
    if (!jobId) return

    const unsubscribe = listenToJob(jobId, (updatedJob) => {
      setJob(updatedJob)
      setLoadingJob(false)
    })

    return () => unsubscribe()
  }, [jobId])

  // 2. Real-time onSnapshot listener for quotes subcollection
  useEffect(() => {
    if (!jobId) return

    const unsubscribe = listenToJobQuotes(jobId, (incomingQuotes) => {
      setQuotes(incomingQuotes)
    })

    return () => unsubscribe()
  }, [jobId])

  const handleStartSchedule = (quote: JobQuote) => {
    setSchedulingQuote(quote)
  }

  const handleConfirmBookingWithSlot = async () => {
    if (!job || !schedulingQuote) return

    // Prevent booking dates in the past
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

      await acceptJobQuoteWithSlot(job, schedulingQuote, {
        scheduledDate: formattedDate,
        scheduledTime: selectedTimeSlot,
      })

      toast.success("Appointment Booked Successfully!", {
        description: `Scheduled with ${schedulingQuote.providerName} for ${formattedDate} (${selectedTimeSlot}).`,
      })
      setSchedulingQuote(null)
    } catch (err: any) {
      toast.error("Failed to book appointment", {
        description: err.message || "An error occurred while booking.",
      })
    } finally {
      setBookingInProgress(false)
    }
  }

  if (loadingJob) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading job details...</p>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="py-16 text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
        <h2 className="text-xl font-bold">Job Not Found</h2>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          The requested job posting may have been removed or does not exist.
        </p>
        <Link to="/dashboard/customer">
          <Button variant="outline">Back to Customer Dashboard</Button>
        </Link>
      </div>
    )
  }

  const isBooked = job.status === "booked"

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <Link
        to="/dashboard/customer"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      {/* Job Overview Card */}
      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <Badge
                  variant={isBooked ? "default" : "secondary"}
                  className={`text-xs capitalize font-bold ${
                    isBooked
                      ? "bg-emerald-600 text-white"
                      : "bg-primary/10 text-primary border border-primary/20"
                  }`}
                >
                  {isBooked ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Booked & Scheduled
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 animate-pulse" /> Status: Open for Quotes
                    </span>
                  )}
                </Badge>
                <Badge variant="outline" className="text-xs font-semibold">
                  {job.category}
                </Badge>
              </div>
              <CardTitle className="text-2xl font-bold text-foreground mt-2">
                {job.title}
              </CardTitle>
            </div>

            <div className="text-right sm:self-center">
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider block">
                Agreed / Estimated
              </span>
              <span className="text-2xl font-black text-foreground">
                {isBooked ? job.bookedPrice || job.budget : job.budget}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 pt-2">
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line bg-muted/20 p-4 rounded-xl border border-border">
            {job.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-muted-foreground pt-1">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary shrink-0" />
              <span>
                <strong>Location:</strong> {job.location}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
              <span>
                <strong>Scheduled:</strong> {job.scheduledDate || job.preferredDate}
              </span>
            </div>
            {job.scheduledTime && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  <strong>Time Window:</strong> {job.scheduledTime}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Incoming Quotes Section (Real-Time onSnapshot) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">Received Quotes & Proposals</h3>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review bids, pick your appointment date and time slot
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {quotes.length} Quote{quotes.length === 1 ? "" : "s"} Received
          </Badge>
        </div>

        {quotes.length > 0 ? (
          <div className="space-y-4">
            {quotes.map((quote) => {
              const isAccepted = quote.status === "accepted" || job.acceptedQuoteId === quote.id

              return (
                <Card
                  key={quote.id}
                  className={`transition-all border ${
                    isAccepted
                      ? "border-emerald-500 bg-emerald-500/5 ring-2 ring-emerald-500/20 shadow-md"
                      : "border-border hover:border-primary/40 bg-card shadow-xs"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <Avatar className="h-12 w-12 rounded-xl border border-border">
                          <AvatarImage src={quote.providerPhotoURL} alt={quote.providerName} />
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {quote.providerName?.[0]?.toUpperCase() || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-base text-foreground">{quote.providerName}</h4>
                            <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1">
                              <ShieldCheck className="w-3 h-3" /> Verified Pro
                            </Badge>
                          </div>
                          <Link
                            to={`/providers/${quote.providerId}`}
                            className="text-xs text-primary hover:underline mt-0.5 inline-block"
                          >
                            View Provider Profile & Reviews →
                          </Link>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider block">
                          Quoted Price
                        </span>
                        <span className="text-2xl font-black text-foreground">{quote.price}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-1 space-y-3">
                    <div className="p-3.5 rounded-lg bg-muted/40 text-sm text-foreground/90 border border-border/60">
                      <p className="text-xs font-semibold text-muted-foreground mb-1 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> Provider Note:
                      </p>
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">{quote.message}</p>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t border-border/60 pt-3.5 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Status:{" "}
                      <strong className={isAccepted ? "text-emerald-600 font-bold" : "text-foreground"}>
                        {isAccepted ? "Accepted & Scheduled" : isBooked ? "Closed" : "Pending your review"}
                      </strong>
                    </span>

                    {!isBooked && (
                      <Button
                        size="sm"
                        className="gap-1.5 font-semibold px-5 shadow-xs"
                        onClick={() => handleStartSchedule(quote)}
                      >
                        <CalendarIcon className="w-4 h-4" /> Accept & Schedule Slot
                      </Button>
                    )}

                    {isAccepted && (
                      <Badge className="bg-emerald-600 text-white font-bold px-3 py-1 gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Scheduled Appointment
                      </Badge>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={Clock}
            title="Waiting for Quotes"
            description={`Local verified ${job.category} specialists are reviewing your request. Quotes will appear here dynamically in real time without refreshing.`}
          />
        )}
      </div>

      {/* SCHEDULING MODAL WITH CALENDAR + POPOVER + TIME SLOT PICKER */}
      <Dialog open={schedulingQuote !== null} onOpenChange={(open) => !open && setSchedulingQuote(null)}>
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Schedule Service with {schedulingQuote?.providerName}
            </DialogTitle>
            <DialogDescription>
              Accept quote for <strong>{schedulingQuote?.price}</strong> and select your preferred dispatch time slot.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* 1. Date Picker with Popover + Calendar */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                1. Select Service Date *
              </label>

              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-between h-11 px-3 text-left font-normal"
                  >
                    <span className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-primary" />
                      <span className="font-semibold text-foreground">
                        {selectedDate.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "long",
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
                <strong>Appointment Address:</strong> {job.location}
              </p>
              <p className="text-muted-foreground">
                The provider will arrive within your chosen time window and invoice the agreed price of{" "}
                <strong className="text-foreground">{schedulingQuote?.price}</strong> upon completion.
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
