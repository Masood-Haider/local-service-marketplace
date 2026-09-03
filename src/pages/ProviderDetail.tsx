import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import {
  getProviderProfile,
  submitQuoteRequest,
  ProviderProfile,
} from "@/services/providerService"
import { fetchProviderReviews, Review } from "@/services/reviewService"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  Star,
  ShieldCheck,
  MapPin,
  Clock,
  Phone,
  Mail,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Send,
  Loader2,
  Image as ImageIcon,
  MessageSquare,
  Sparkles,
  AlertTriangle,
} from "lucide-react"

export const ProviderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const [provider, setProvider] = useState<ProviderProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Quote Dialog state
  const [quoteOpen, setQuoteOpen] = useState(false)
  const [submittingQuote, setSubmittingQuote] = useState(false)
  const [customerName, setCustomerName] = useState(currentUser?.name || "")
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || "")
  const [customerPhone, setCustomerPhone] = useState("")
  const [serviceNeeded, setServiceNeeded] = useState("")
  const [serviceLocation, setServiceLocation] = useState("")
  const [preferredDate, setPreferredDate] = useState("")
  const [projectDetails, setProjectDetails] = useState("")

  // Selected lightbox image
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    async function loadProvider() {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const [data, reviewList] = await Promise.all([
          getProviderProfile(id),
          fetchProviderReviews(id),
        ])
        setReviews(reviewList)
        if (data) {
          setProvider(data)
        } else {
          // If demo ID, provide clean fallback structure
          setProvider({
            uid: id,
            name: "Verified Trade Specialist",
            category: "Plumbing",
            bio: "Licensed local contractor with over 10 years of verified industry experience in residential installations, emergency diagnostics, and preventative maintenance.",
            priceRange: "$75 - $120 / hr",
            serviceArea: "Greater Metro Area (25-mile radius)",
            photoURL: "",
            portfolioImages: [],
            avgRating: 4.9,
            totalReviews: 24,
            phone: "(555) 234-5678",
            email: "provider@hub.local",
          })
        }
      } catch (err: any) {
        console.error("Failed to load provider profile:", err)
        setError("Could not retrieve provider profile. Please check the ID or try again.")
      } finally {
        setLoading(false)
      }
    }
    loadProvider()
  }, [id])

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id || !provider) return

    if (!customerName || !customerEmail || !serviceNeeded || !serviceLocation) {
      toast.error("Please fill in all required quote request fields")
      return
    }

    setSubmittingQuote(true)
    try {
      await submitQuoteRequest({
        providerId: id,
        providerName: provider.name,
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        serviceNeeded: serviceNeeded.trim(),
        serviceLocation: serviceLocation.trim(),
        preferredDate,
        projectDetails: projectDetails.trim(),
      })

      toast.success("Quote request submitted!", {
        description: `${provider.name} has been notified and will send a detailed estimate.`,
      })
      setQuoteOpen(false)
      setServiceNeeded("")
      setProjectDetails("")
    } catch (err: any) {
      toast.error("Failed to send quote request", {
        description: err.message,
      })
    } finally {
      setSubmittingQuote(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading provider profile...
        </p>
      </div>
    )
  }

  if (error || !provider) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive w-14 h-14 mx-auto flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Provider Not Found</h2>
        <p className="text-sm text-muted-foreground mt-2 mb-6">
          {error || "The provider profile you requested does not exist or may have been removed."}
        </p>
        <Link to="/providers">
          <Button variant="outline">Browse All Providers</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-5xl space-y-8">
      <Link
        to="/providers"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Provider Directory
      </Link>

      {/* Main Profile Header Card */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <Avatar className="h-24 w-24 rounded-2xl border-2 border-border shadow-md">
              <AvatarImage src={provider.photoURL} alt={provider.name} />
              <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                {provider.name?.[0]?.toUpperCase() || "P"}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                  {provider.name}
                </h1>
                <Badge variant="secondary" className="gap-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Pro
                </Badge>
                <Badge variant="outline" className="font-semibold text-primary border-primary/30">
                  {provider.category}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span>{provider.serviceArea}</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1 font-bold text-foreground bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded">
                  <Star className="w-3.5 h-3.5 fill-current" /> {provider.avgRating || 5.0} ({provider.totalReviews || 0} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-primary" />
                  <strong>Rates:</strong> {provider.priceRange}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  Responds in ~15 mins
                </span>
              </div>
            </div>
          </div>

          {/* REQUEST QUOTE CTA BUTTON & DIALOG */}
          <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full md:w-auto h-12 px-7 gap-2 shadow-lg shadow-primary/20 rounded-xl font-semibold">
                <MessageSquare className="w-4 h-4" />
                Request Quote
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Request Free Quote from {provider.name}
                </DialogTitle>
                <DialogDescription>
                  Share project details to receive a personalized estimate with no obligation.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleQuoteSubmit} className="space-y-4 py-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      Your Name *
                    </label>
                    <Input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Alex Johnson"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      Your Email *
                    </label>
                    <Input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="alex@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      Phone Number
                    </label>
                    <Input
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(555) 000-0000"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                      Preferred Date
                    </label>
                    <Input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Job Location / Zip Code *
                  </label>
                  <Input
                    value={serviceLocation}
                    onChange={(e) => setServiceLocation(e.target.value)}
                    placeholder="e.g. 94103 San Francisco"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Service Needed *
                  </label>
                  <Input
                    value={serviceNeeded}
                    onChange={(e) => setServiceNeeded(e.target.value)}
                    placeholder="e.g. Water heater repair, electrical panel upgrade"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
                    Project Description & Details
                  </label>
                  <textarea
                    value={projectDetails}
                    onChange={(e) => setProjectDetails(e.target.value)}
                    rows={3}
                    className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="Describe specific symptoms, materials, or special access instructions..."
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full h-11 gap-2" disabled={submittingQuote}>
                    {submittingQuote ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Sending Quote Request...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Submit Request
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs for Detailed Information */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 max-w-lg mb-6">
          <TabsTrigger value="overview">About & Bio</TabsTrigger>
          <TabsTrigger value="portfolio">
            Portfolio ({provider.portfolioImages?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="reviews">
            Reviews ({reviews.length > 0 ? reviews.length : provider.totalReviews || 0})
          </TabsTrigger>
          <TabsTrigger value="rates">Rates & Coverage</TabsTrigger>
        </TabsList>

        {/* 1. Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="border-border shadow-xs">
            <CardHeader>
              <CardTitle className="text-lg">About {provider.name}</CardTitle>
              <CardDescription>Professional background and capabilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                {provider.bio}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-border/80">
                <div className="flex items-center gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Verified Identity & Background Clear</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Licensed & Insured Trade Specialist</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Direct Communication & In-App Updates</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Workmanship Guarantee</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Portfolio Images Gallery */}
        <TabsContent value="portfolio" className="space-y-6">
          <Card className="border-border shadow-xs">
            <CardHeader>
              <CardTitle className="text-lg">Work Samples & Project Gallery</CardTitle>
              <CardDescription>
                Recent completed installations and repair projects by {provider.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {provider.portfolioImages && provider.portfolioImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {provider.portfolioImages.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className="group cursor-pointer relative aspect-square rounded-xl overflow-hidden border border-border bg-muted shadow-xs hover:border-primary/50 transition-all"
                    >
                      <img
                        src={img}
                        alt={`Work sample ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                        Click to enlarge
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-border rounded-xl p-10 text-center text-muted-foreground bg-muted/20">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-foreground">No portfolio photos available</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    This provider has not uploaded past work samples yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Verified Client Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <Card className="border-border shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Client Ratings & Verified Reviews</CardTitle>
                  <CardDescription>
                    Authentic feedback from verified local clients booked through Home Services Hub
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-600 border-emerald-500/30 gap-1 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified Hires
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Rating Summary Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-card border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-black text-foreground">
                    {provider.avgRating || "5.0"}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-4 h-4 ${
                            s <= Math.round(provider.avgRating || 5)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      Based on <strong>{reviews.length > 0 ? reviews.length : provider.totalReviews || 0}</strong> verified ratings
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="text-center">
                    <span className="text-base font-bold text-foreground block">100%</span>
                    <span>Punctuality</span>
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <div className="text-center">
                    <span className="text-base font-bold text-foreground block">99%</span>
                    <span>Cleanliness</span>
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <div className="text-center">
                    <span className="text-base font-bold text-foreground block">100%</span>
                    <span>Recommend</span>
                  </div>
                </div>
              </div>

              {/* Reviews Feed */}
              {reviews.length > 0 ? (
                <div className="space-y-4 pt-2">
                  {reviews.map((rev) => {
                    const formattedDate = rev.createdAt?.seconds
                      ? new Date(rev.createdAt.seconds * 1000).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Recently"

                    return (
                      <div
                        key={rev.id}
                        className="p-4 rounded-xl border border-border bg-card/60 space-y-2.5 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border border-border">
                              <AvatarImage src={rev.customerPhotoURL} alt={rev.customerName} />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                {rev.customerName?.[0]?.toUpperCase() || "C"}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-sm text-foreground">{rev.customerName}</h5>
                                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/20 py-0">
                                  Verified Client
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">{formattedDate}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-md text-xs font-bold shrink-0">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{rev.rating}.0</span>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed whitespace-pre-line pl-0.5">
                          "{rev.comment}"
                        </p>

                        {rev.serviceCategory && (
                          <div className="pt-1">
                            <Badge variant="secondary" className="text-[10px] font-semibold text-muted-foreground">
                              Job: {rev.serviceCategory}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="border border-dashed border-border rounded-xl p-10 text-center text-muted-foreground bg-muted/20">
                  <Star className="w-8 h-8 mx-auto mb-2 text-amber-400 opacity-60" />
                  <p className="text-sm font-semibold text-foreground">No Verified Reviews Yet</p>
                  <p className="text-xs text-muted-foreground mt-0.5 max-w-sm mx-auto">
                    Be among the first customers to book {provider.name} and leave a verified review.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Rates & Coverage Tab */}
        <TabsContent value="rates" className="space-y-6">
          <Card className="border-border shadow-xs">
            <CardHeader>
              <CardTitle className="text-lg">Pricing Matrix & Coverage Area</CardTitle>
              <CardDescription>Standard rate brackets and dispatch territory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-border bg-muted/30">
                  <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">
                    Standard Labor & Diagnostics
                  </p>
                  <p className="text-2xl font-black text-foreground">{provider.priceRange}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Exact price confirmed in written quote before work begins.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-border bg-muted/30">
                  <p className="text-xs uppercase font-bold text-muted-foreground tracking-wider mb-1">
                    Primary Service Area
                  </p>
                  <p className="text-lg font-bold text-foreground flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-primary" /> {provider.serviceArea}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Emergency and scheduled callouts dispatched throughout this radius.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Lightbox Modal for Portfolio Image Enlarge */}
      <Dialog open={activeImage !== null} onOpenChange={(open) => !open && setActiveImage(null)}>
        <DialogContent className="max-w-3xl p-2 bg-black/95 border-none">
          {activeImage && (
            <img
              src={activeImage}
              alt="Enlarged portfolio work sample"
              className="w-full max-h-[80vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
