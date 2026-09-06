import React, { useState, useEffect } from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/EmptyState"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { getProviderProfile, ProviderProfile } from "@/services/providerService"
import {
  listenToOpenJobs,
  submitJobQuote,
  listenToProviderBookings,
  getBookingStatusBadge,
  listenToProviderDirectQuotes,
  acceptDirectQuote,
  declineDirectQuote,
  Job,
  Booking,
  DirectQuote,
} from "@/services/jobService"
import {
  DollarSign,
  Briefcase,
  Star,
  Clock,
  PlusCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Eye,
  UserCheck,
  Send,
  MapPin,
  Calendar,
  Loader2,
  CheckCircle2,
  Inbox,
  Mail,
  Phone,
  Filter,
} from "lucide-react"
import { Link } from "react-router-dom"

export const ProviderDashboard: React.FC = () => {
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const [profile, setProfile] = useState<ProviderProfile | null>(null)
  const [openJobs, setOpenJobs] = useState<Job[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [directQuotes, setDirectQuotes] = useState<DirectQuote[]>([])
  const [selectedTradeFilter, setSelectedTradeFilter] = useState<string>("All")

  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [quotePrice, setQuotePrice] = useState("")
  const [quoteMessage, setQuoteMessage] = useState("")
  const [submittingQuote, setSubmittingQuote] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Direct Quote accept dialog state
  const [selectedDirectQuote, setSelectedDirectQuote] = useState<DirectQuote | null>(null)
  const [acceptPrice, setAcceptPrice] = useState("")
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false)
  const [processingDirectQuote, setProcessingDirectQuote] = useState(false)

  // Load provider profile
  useEffect(() => {
    async function loadData() {
      if (currentUser?.uid) {
        try {
          const data = await getProviderProfile(currentUser.uid)
          setProfile(data)
          if (data?.category) {
            setSelectedTradeFilter(data.category)
          }
        } catch (err) {
          console.error("Error loading provider profile:", err)
        }
      }
    }
    loadData()
  }, [currentUser])

  // Real-time listener for open marketplace jobs matching selected category
  useEffect(() => {
    const filterCat = selectedTradeFilter === "All" ? undefined : selectedTradeFilter
    const unsubscribe = listenToOpenJobs(filterCat, (jobs) => {
      setOpenJobs(jobs)
    })

    return () => unsubscribe()
  }, [selectedTradeFilter])

  // Real-time listener for provider's confirmed bookings
  useEffect(() => {
    if (!currentUser?.uid) return
    const unsubscribe = listenToProviderBookings(currentUser.uid, (data) => {
      setBookings(data)
    })
    return () => unsubscribe()
  }, [currentUser?.uid])

  // Real-time listener for direct quote requests / offers sent by clients
  useEffect(() => {
    if (!currentUser?.uid) return
    const unsubscribe = listenToProviderDirectQuotes(currentUser.uid, (data) => {
      setDirectQuotes(data)
    })
    return () => unsubscribe()
  }, [currentUser?.uid])

  const handleOpenQuoteDialog = (job: Job) => {
    setSelectedJob(job)
    setQuotePrice(job.budget !== "Negotiable" ? job.budget : "$100")
    setQuoteMessage(
      `Hello ${job.customerName}! I am a verified ${job.category} specialist and can complete your project on ${job.preferredDate}.`
    )
    setDialogOpen(true)
  }

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedJob || !currentUser) return

    if (!quotePrice.trim() || !quoteMessage.trim()) {
      toast.error("Please provide both a quote price and message")
      return
    }

    setSubmittingQuote(true)
    try {
      await submitJobQuote(selectedJob.id, {
        providerId: currentUser.uid,
        providerName: profile?.name || currentUser.name,
        providerPhotoURL: profile?.photoURL || currentUser.photoURL || null,
        price: quotePrice.trim(),
        message: quoteMessage.trim(),
      })

      toast.success("Quote submitted!", {
        description: `Your bid of ${quotePrice} was sent to ${selectedJob.customerName}.`,
      })
      setDialogOpen(false)
      setSelectedJob(null)
    } catch (err: any) {
      console.error("Quote submission error:", err)
      toast.error("Could not submit quote", { description: err.message || "Operation failed." })
    } finally {
      setSubmittingQuote(false)
    }
  }

  const handleOpenAcceptDirectDialog = (quote: DirectQuote) => {
    setSelectedDirectQuote(quote)
    setAcceptPrice(profile?.priceRange ? profile.priceRange.split("-")[0].trim() : "$100")
    setAcceptDialogOpen(true)
  }

  const handleConfirmAcceptDirectQuote = async () => {
    if (!selectedDirectQuote) return
    setProcessingDirectQuote(true)
    try {
      await acceptDirectQuote(selectedDirectQuote, acceptPrice.trim() || undefined)
      toast.success("Client Offer Accepted & Booked!", {
        description: `Appointment confirmed for ${selectedDirectQuote.customerName}.`,
      })
      setAcceptDialogOpen(false)
      setSelectedDirectQuote(null)
    } catch (err: any) {
      console.error("Error accepting quote:", err)
      toast.error("Failed to accept offer", { description: err.message })
    } finally {
      setProcessingDirectQuote(false)
    }
  }

  const handleDeclineDirectQuote = async (quote: DirectQuote) => {
    if (!window.confirm(`Decline quote request from ${quote.customerName}?`)) return
    try {
      await declineDirectQuote(quote.id, quote.customerId, profile?.name || currentUser?.name)
      toast.success("Request declined")
    } catch (err: any) {
      console.error("Error declining quote:", err)
      toast.error("Failed to decline request", { description: err.message })
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Provider Business Hub"
        description="Review incoming jobs in your trade, send quotes in real time, and manage booked appointments."
        action={
          <div className="flex items-center gap-2">
            <Link to="/dashboard/provider/onboarding">
              <Button variant="outline" className="gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                {profile ? "Edit Profile" : "Complete Onboarding"}
              </Button>
            </Link>
            {profile && (
              <Link to={`/providers/${currentUser?.uid}`}>
                <Button size="sm" variant="ghost" className="gap-1.5 text-xs">
                  <Eye className="w-4 h-4 text-muted-foreground" /> View Public Profile
                </Button>
              </Link>
            )}
          </div>
        }
      />

      {/* Onboarding Callout Banner if profile is incomplete */}
      {!profile && (
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-card border border-primary/20 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground text-xs">Setup Required</Badge>
              <h3 className="font-bold text-foreground text-base">Complete Your Public Profile & Portfolio</h3>
            </div>
            <p className="text-xs text-muted-foreground max-w-xl">
              Upload your business headshot, work samples, service territory, and price rates to start receiving direct quote inquiries from local customers.
            </p>
          </div>
          <Link to="/dashboard/provider/onboarding">
            <Button size="sm" className="gap-2 shadow-xs shrink-0">
              <Sparkles className="w-4 h-4" /> Start Onboarding <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      )}

      {/* Verification Status Banner */}
      {profile && profile.verificationStatus === "pending" && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-foreground text-sm">Account Verification Pending</h4>
                <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40 text-[10px]">Superadmin Review</Badge>
              </div>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                Your trade specialist profile is currently under review by our superadmin team. Once approved, your business will automatically be discoverable to local customers on the marketplace.
              </p>
            </div>
          </div>
        </div>
      )}

      {profile && profile.verificationStatus === "rejected" && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/30 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-destructive/20 text-destructive shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-foreground text-sm">Verification Not Approved</h4>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                Your application could not be verified by the superadmin. Please update your profile information or contact platform support.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats row */}
      {(() => {
        const pendingDirectCount = directQuotes.filter((q) => q.status === "pending").length

        return (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <Card className={pendingDirectCount > 0 ? "border-primary/50 shadow-xs ring-1 ring-primary/20" : ""}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Direct Inquiries</CardTitle>
                <Inbox className={`w-4 h-4 ${pendingDirectCount > 0 ? "text-primary animate-bounce" : "text-muted-foreground"}`} />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold">{directQuotes.length}</div>
                  {pendingDirectCount > 0 && (
                    <Badge className="bg-primary text-primary-foreground text-[10px] h-5 px-1.5 font-bold">
                      {pendingDirectCount} New
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {pendingDirectCount > 0 ? `${pendingDirectCount} awaiting your response` : "Direct client offers"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Available Jobs</CardTitle>
                <Briefcase className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openJobs.length}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedTradeFilter === "All" ? "All trades" : selectedTradeFilter}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Booked Jobs</CardTitle>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{bookings.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Confirmed appointments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Customer Rating</CardTitle>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{profile?.avgRating || "5.0"}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on {profile?.totalReviews || 0} reviews
                </p>
              </CardContent>
            </Card>
          </div>
        )
      })()}

      {/* Direct Client Offers & Quote Inquiries Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">Direct Client Offers & Quote Inquiries</h3>
              {directQuotes.filter((q) => q.status === "pending").length > 0 && (
                <Badge className="bg-primary text-primary-foreground text-xs font-bold animate-pulse">
                  {directQuotes.filter((q) => q.status === "pending").length} Action Required
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customers who contacted you directly through your public profile page
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {directQuotes.length} Total Offer{directQuotes.length === 1 ? "" : "s"}
          </Badge>
        </div>

        {directQuotes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {directQuotes.map((quote) => {
              const isPending = quote.status === "pending"
              const isAccepted = quote.status === "accepted"
              const isDeclined = quote.status === "declined"

              return (
                <Card
                  key={quote.id}
                  className={`hover:shadow-md transition-all border flex flex-col justify-between ${
                    isPending
                      ? "border-primary/40 bg-primary/[0.02]"
                      : isAccepted
                      ? "border-emerald-500/30 bg-emerald-500/[0.02]"
                      : "border-border opacity-70"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant="outline" className="text-[11px] font-semibold text-primary border-primary/30">
                            {quote.serviceNeeded || "Custom Service"}
                          </Badge>
                          {isPending && (
                            <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] gap-1">
                              <Clock className="w-3 h-3" /> Awaiting Response
                            </Badge>
                          )}
                          {isAccepted && (
                            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Confirmed Booking
                            </Badge>
                          )}
                          {isDeclined && (
                            <Badge variant="secondary" className="text-[10px]">
                              Declined
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg font-bold leading-tight">
                          Offer from {quote.customerName}
                        </CardTitle>
                      </div>

                      {quote.price && (
                        <div className="text-right shrink-0">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                            Rate
                          </span>
                          <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                            {quote.price}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <div className="p-3 rounded-lg bg-muted/40 border border-border/50 text-xs text-foreground/90 leading-relaxed">
                      <p className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                        Client Scope & Request:
                      </p>
                      {quote.projectDetails || "No additional project details provided."}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground pt-1 border-t border-border/60">
                      <span className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        {quote.serviceLocation || "Location on inquiry"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary shrink-0" />
                        {quote.preferredDate ? `Target Date: ${quote.preferredDate}` : "Flexible schedule"}
                      </span>
                    </div>

                    {/* Client Direct Contact details */}
                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
                      {quote.customerEmail && (
                        <a
                          href={`mailto:${quote.customerEmail}`}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Mail className="w-3.5 h-3.5" /> {quote.customerEmail}
                        </a>
                      )}
                      {quote.customerPhone && (
                        <a
                          href={`tel:${quote.customerPhone}`}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" /> {quote.customerPhone}
                        </a>
                      )}
                    </div>
                  </CardContent>

                  <CardFooter className="border-t border-border/60 pt-3.5 flex items-center justify-between bg-muted/20">
                    <span className="text-[11px] text-muted-foreground">
                      {quote.createdAt?.toDate
                        ? `Received ${quote.createdAt.toDate().toLocaleDateString()}`
                        : "Direct request"}
                    </span>

                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8 px-3 text-destructive border-destructive/30 hover:bg-destructive/10"
                          onClick={() => handleDeclineDirectQuote(quote)}
                        >
                          Decline
                        </Button>
                        <Button
                          size="sm"
                          className="gap-1.5 text-xs h-8 px-4 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                          onClick={() => handleOpenAcceptDirectDialog(quote)}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Accept & Schedule
                        </Button>
                      </div>
                    ) : isAccepted ? (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Active Client Booking
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Offer Declined</span>
                    )}
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title="No Direct Offers Yet"
            description="When clients view your public profile and click 'Request a Quote', their direct project offers and contact information will appear here immediately."
            action={
              <Link to={`/providers/${currentUser?.uid}`}>
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Eye className="w-4 h-4 text-primary" /> View Your Public Profile
                </Button>
              </Link>
            }
          />
        )}
      </div>

      {/* Active Bookings Section */}
      {bookings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">Active Bookings & Dispatches</h3>
              <Badge variant="outline" className="text-xs">
                {bookings.length} Appointment{bookings.length === 1 ? "" : "s"}
              </Badge>
            </div>
            <Link to="/dashboard/provider/schedule">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View Full Schedule <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.slice(0, 4).map((booking) => {
              const statusInfo = getBookingStatusBadge(booking.status)

              return (
                <Card key={booking.id} className="border-border hover:shadow-xs transition-shadow">
                  <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] text-primary">
                          {booking.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Client: {booking.customerName}</span>
                      </div>
                      <CardTitle className="text-base font-bold line-clamp-1">{booking.jobTitle}</CardTitle>
                    </div>
                    <Badge className={statusInfo.className}>
                      {statusInfo.label}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" /> {booking.scheduledDate}
                      </span>
                      <span className="font-bold text-foreground">{booking.price}</span>
                    </div>
                    <p className="text-muted-foreground flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-primary shrink-0" /> {booking.location}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Real-time Open Jobs Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">Open Marketplace Jobs</h3>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Submit quotes / bids directly to customer postings
            </p>
          </div>

          {/* Trade Category Filter buttons */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button
              size="sm"
              variant={selectedTradeFilter === "All" ? "default" : "outline"}
              className="h-7 text-xs px-2.5"
              onClick={() => setSelectedTradeFilter("All")}
            >
              All Trades
            </Button>
            {profile?.category && (
              <Button
                size="sm"
                variant={selectedTradeFilter === profile.category ? "default" : "outline"}
                className="h-7 text-xs px-2.5"
                onClick={() => setSelectedTradeFilter(profile.category)}
              >
                My Trade ({profile.category})
              </Button>
            )}
            <Badge variant="outline" className="text-xs ml-1">
              {openJobs.length} Job{openJobs.length === 1 ? "" : "s"}
            </Badge>
          </div>
        </div>

        {openJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {openJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow border-border flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="outline" className="text-[11px] font-semibold text-primary border-primary/30">
                          {job.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">by {job.customerName}</span>
                      </div>
                      <CardTitle className="text-lg font-bold leading-tight">{job.title}</CardTitle>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Budget
                      </span>
                      <span className="font-black text-sm text-foreground">{job.budget}</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/60">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-primary" /> {job.preferredDate}
                    </span>
                  </div>
                </CardContent>

                <CardFooter className="border-t border-border/60 pt-3.5 flex items-center justify-between bg-muted/20">
                  <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-500" /> Active lead
                  </span>
                  <Button
                    size="sm"
                    className="gap-1.5 text-xs h-8 px-4"
                    onClick={() => handleOpenQuoteDialog(job)}
                  >
                    <Send className="w-3.5 h-3.5" /> Send Quote
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No Open Jobs Matching Your Trade"
            description="When homeowners post new requests in your trade category, they will appear here in real time."
            action={
              <Link to="/dashboard/provider/onboarding">
                <Button variant="outline" size="sm">
                  Review Trade & Coverage Settings
                </Button>
              </Link>
            }
          />
        )}
      </div>

      {/* Quote Submission Modal Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Submit Quote for "{selectedJob?.title}"
            </DialogTitle>
            <DialogDescription>
              Provide your competitive price and introductory proposal to {selectedJob?.customerName}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleQuoteSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Quoted Price *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  placeholder="e.g. $125 or $85/hr"
                  className="pl-9"
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Customer's estimated budget: <strong>{selectedJob?.budget}</strong>
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Proposal Message / Approach *
              </label>
              <textarea
                value={quoteMessage}
                onChange={(e) => setQuoteMessage(e.target.value)}
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Explain what is included, your estimated duration, and when you can start..."
                required
              />
            </div>

            <DialogFooter className="pt-3">
              <Button type="submit" className="w-full gap-2" disabled={submittingQuote}>
                {submittingQuote ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting Bid...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Submit Proposal
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Accept & Confirm Direct Quote Modal */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              Accept Client Offer & Schedule Booking
            </DialogTitle>
            <DialogDescription>
              Confirm your rate or estimate for {selectedDirectQuote?.customerName}'s request (
              {selectedDirectQuote?.serviceNeeded}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Confirmed Price / Estimate *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  value={acceptPrice}
                  onChange={(e) => setAcceptPrice(e.target.value)}
                  placeholder="e.g. $125 or $85/hr"
                  className="pl-9"
                  required
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                This confirmed rate will be recorded on the official client appointment.
              </p>
            </div>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              variant="outline"
              onClick={() => setAcceptDialogOpen(false)}
              disabled={processingDirectQuote}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAcceptDirectQuote}
              disabled={processingDirectQuote}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {processingDirectQuote ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Scheduling...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Confirm & Book Client
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
