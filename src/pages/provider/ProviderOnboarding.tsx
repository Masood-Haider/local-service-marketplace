import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import {
  saveProviderProfile,
  getProviderProfile,
  uploadToStorage,
  ProviderProfile,
} from "@/services/providerService"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  X,
  Briefcase,
  MapPin,
  DollarSign,
  Phone,
  Sparkles,
  Eye,
} from "lucide-react"

export const ProviderOnboarding: React.FC = () => {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  // Form states
  const [name, setName] = useState(currentUser?.name || "")
  const [category, setCategory] = useState("Plumbing")
  const [bio, setBio] = useState("")
  const [priceRange, setPriceRange] = useState("$65 - $120 / hr")
  const [serviceArea, setServiceArea] = useState("Greater Metro Area (25-mile radius)")
  const [phone, setPhone] = useState("")
  const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || "")
  const [portfolioImages, setPortfolioImages] = useState<string[]>([])

  // Upload & Progress states
  const [profileProgress, setProfileProgress] = useState<number | null>(null)
  const [portfolioProgress, setPortfolioProgress] = useState<{ [key: string]: number }>({})
  const [submitting, setSubmitting] = useState(false)
  const [loadingInitial, setLoadingInitial] = useState(true)

  const categories = ["Plumbing", "Electrical", "Cleaning", "Tutoring", "Moving", "HVAC", "Handyman"]

  // Load existing profile if available
  useEffect(() => {
    async function loadData() {
      if (currentUser?.uid) {
        try {
          const profile = await getProviderProfile(currentUser.uid)
          if (profile) {
            setName(profile.name || currentUser.name)
            setCategory(profile.category || "Plumbing")
            setBio(profile.bio || "")
            setPriceRange(profile.priceRange || "$65 - $120 / hr")
            setServiceArea(profile.serviceArea || "Greater Metro Area (25-mile radius)")
            setPhone(profile.phone || "")
            setPhotoURL(profile.photoURL || "")
            setPortfolioImages(profile.portfolioImages || [])
          }
        } catch (err) {
          console.error("Error loading profile:", err)
        }
      }
      setLoadingInitial(false)
    }
    loadData()
  }, [currentUser])

  // Handle Profile Photo Upload
  const handleProfilePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !currentUser?.uid) return

    setProfileProgress(10)
    try {
      const path = `providers/${currentUser.uid}/profile_${Date.now()}_${file.name}`
      const url = await uploadToStorage(file, path, (pct) => setProfileProgress(pct))
      setPhotoURL(url)
      toast.success("Profile photo uploaded!")
    } catch (err: any) {
      toast.error("Upload failed", { description: err.message })
    } finally {
      setProfileProgress(null)
    }
  }

  // Handle Portfolio Images Upload
  const handlePortfolioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !currentUser?.uid) return

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const fileKey = `${file.name}-${i}`
      setPortfolioProgress((prev) => ({ ...prev, [fileKey]: 10 }))

      try {
        const path = `providers/${currentUser.uid}/portfolio_${Date.now()}_${file.name}`
        const url = await uploadToStorage(file, path, (pct) => {
          setPortfolioProgress((prev) => ({ ...prev, [fileKey]: pct }))
        })
        setPortfolioImages((prev) => [...prev, url])
      } catch (err: any) {
        toast.error(`Failed to upload ${file.name}`)
      } finally {
        setPortfolioProgress((prev) => {
          const next = { ...prev }
          delete next[fileKey]
          return next
        })
      }
    }
  }

  const handleRemovePortfolio = (index: number) => {
    setPortfolioImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser?.uid) {
      toast.error("Authentication required")
      return
    }

    if (!name.trim() || !bio.trim()) {
      toast.error("Required fields missing", {
        description: "Please provide a name and bio describing your services.",
      })
      return
    }

    setSubmitting(true)
    try {
      await saveProviderProfile({
        uid: currentUser.uid,
        name: name.trim(),
        category,
        bio: bio.trim(),
        priceRange: priceRange.trim(),
        serviceArea: serviceArea.trim(),
        phone: phone.trim(),
        email: currentUser.email,
        photoURL,
        portfolioImages,
      })

      toast.success("Provider Profile Saved!", {
        description: "Your business is now live on the marketplace.",
      })
      navigate(`/providers/${currentUser.uid}`)
    } catch (err: any) {
      toast.error("Could not save profile", {
        description: err.message || "An error occurred while writing to Firestore.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loadingInitial) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading your profile configuration...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      <PageHeader
        title="Provider Onboarding & Profile"
        description="Set up your verified business profile, upload showcase photos, and configure service pricing."
        action={
          currentUser?.uid && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => navigate(`/providers/${currentUser.uid}`)}
            >
              <Eye className="w-4 h-4 text-primary" /> View Public Profile
            </Button>
          )
        }
      />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basic Information */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Trade & Identity</CardTitle>
                <CardDescription>Tell customers who you are and what trade you specialize in</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Business Name or Professional Name *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Apex Plumbing & Heating"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Direct Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Category selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Primary Trade Category *
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Badge
                    key={cat}
                    variant={category === cat ? "default" : "outline"}
                    className="cursor-pointer py-1.5 px-3.5 text-xs font-semibold rounded-lg transition-all"
                    onClick={() => setCategory(cat)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Rates & Coverage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Standard Rate or Price Range *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    placeholder="e.g. $75 - $120 / hr"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">
                  Service Area & Radius *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    value={serviceArea}
                    onChange={(e) => setServiceArea(e.target.value)}
                    placeholder="e.g. San Francisco Bay Area (25 mile radius)"
                    className="pl-9"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Professional Bio & Qualifications *
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Describe your background, years of experience, warranty, and special equipment..."
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Photos & Media (Firebase Storage) */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">Photos & Portfolio Gallery</CardTitle>
                <CardDescription>
                  Upload your professional headshot and samples of your recent projects
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 1. Profile Headshot */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">
                Profile Photo / Business Logo
              </label>
              <div className="flex items-center gap-5">
                <Avatar className="h-20 w-20 rounded-2xl border-2 border-border shadow-sm">
                  <AvatarImage src={photoURL} />
                  <AvatarFallback className="text-lg font-bold bg-muted text-muted-foreground">
                    {name?.[0]?.toUpperCase() || "P"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <label className="cursor-pointer inline-block">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePhotoSelect}
                      disabled={profileProgress !== null}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="gap-2 pointer-events-none"
                      disabled={profileProgress !== null}
                    >
                      <Upload className="w-4 h-4" />
                      {profileProgress !== null ? "Uploading..." : "Choose Profile Photo"}
                    </Button>
                  </label>
                  {profileProgress !== null && (
                    <div className="w-full max-w-xs space-y-1">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${profileProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{profileProgress}% uploaded</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">JPG, PNG or WEBP up to 5MB.</p>
                </div>
              </div>
            </div>

            {/* 2. Portfolio Gallery */}
            <div className="border-t border-border/80 pt-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <label className="text-sm font-medium text-foreground block">
                    Portfolio & Work Samples ({portfolioImages.length})
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Show before-and-after pictures or past completed installations.
                  </p>
                </div>

                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handlePortfolioSelect}
                  />
                  <Button type="button" variant="outline" size="sm" className="gap-1.5 pointer-events-none">
                    <Upload className="w-4 h-4" /> Upload Samples
                  </Button>
                </label>
              </div>

              {/* Uploading progress items */}
              {Object.keys(portfolioProgress).length > 0 && (
                <div className="p-3 bg-muted/40 rounded-lg space-y-2 mb-4 border border-border">
                  <p className="text-xs font-semibold text-foreground">Uploading images...</p>
                  {Object.entries(portfolioProgress).map(([fileKey, pct]) => (
                    <div key={fileKey} className="space-y-1">
                      <div className="flex justify-between text-[11px] text-muted-foreground">
                        <span className="truncate max-w-[200px]">{fileKey}</span>
                        <span>{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Portfolio Grid Previews */}
              {portfolioImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {portfolioImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="group relative rounded-xl overflow-hidden border border-border aspect-square bg-muted shadow-xs"
                    >
                      <img
                        src={img}
                        alt={`Portfolio sample ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePortfolio(idx)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive"
                        title="Remove photo"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground bg-card/40">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-foreground">No portfolio photos added yet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pros with 3+ photos receive 4x more customer quote inquiries.
                  </p>
                </div>
              )}
            </div>
          </CardContent>

          <CardFooter className="border-t border-border/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Saves instantly to your verified public profile.
            </p>
            <Button type="submit" size="lg" className="w-full sm:w-auto px-8 gap-2" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Profile...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Publish Provider Profile
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
