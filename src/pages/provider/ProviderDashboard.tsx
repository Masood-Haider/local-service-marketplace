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
  Job,
  Booking,
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
} from "lucide-react"
import { Link } from "react-router-dom"

export const ProviderDashboard: React.FC = () => {
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const [profile, setProfile] = useState<ProviderProfile | null>(null)
  const [openJobs, setOpenJobs] = useState<Job[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [quotePrice, setQuotePrice] = useState("")
  const [quoteMessage, setQuoteMessage] = useState("")
  const [submittingQuote, setSubmittingQuote] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Load provider profile
  useEffect(() => {
    async function loadData() {
      if (currentUser?.uid) {
        try {
          const data = await getProviderProfile(currentUser.uid)
          setProfile(data)
        } catch (err) {
          console.error("Error loading provider profile:", err)
        }
      }
    }
    loadData()
  }, [currentUser])

  // Real-time listener for open jobs matching provider's category
  useEffect(() => {
    const category = profile?.category || undefined
    const unsubscribe = listenToOpenJobs(category, (jobs) => {
      setOpenJobs(jobs)
    })

    return () => unsubscribe()
  }, [profile?.category])

  // Real-time listener for provider's confirmed bookings
  useEffect(() => {
    if (!currentUser?.uid) return
    const unsubscribe = listenToProviderBookings(currentUser.uid, (data) => {
      setBookings(data)
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
        providerPhotoURL: profile?.photoURL || currentUser.photoURL || undefined,
        price: quotePrice.trim(),
        message: quoteMessage.trim(),
      })

      toast.success("Quote submitted!", {
        description: `Your bid of ${quotePrice} was sent to ${selectedJob.customerName}.`,
      })
      setDialogOpen(false)
      setSelectedJob(null)
    } catch (err: any) {
      toast.error("Could not submit quote", { description: err.message })
    } finally {
      setSubmittingQuote(false)
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

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available Jobs</CardTitle>
            <Briefcase className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openJobs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Matching {profile?.category || "all trades"}
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
            <p className="text-xs text-muted-foreground mt-1">Confirmed client bookings</p>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Trade Specialty</CardTitle>
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{profile?.category || "General Trade"}</div>
            <p className="text-xs text-muted-foreground mt-1">Verified status active</p>
          </CardContent>
        </Card>
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
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">Open Jobs in Your Trade</h3>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Customers waiting for quotes • Updates automatically in real time
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {openJobs.length} Open Request{openJobs.length === 1 ? "" : "s"}
          </Badge>
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
    </div>
  )
}
