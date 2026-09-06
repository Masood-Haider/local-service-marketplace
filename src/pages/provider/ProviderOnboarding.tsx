import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import {
  saveProviderProfile,
  getProviderProfile,
  ProviderProfile,
} from "@/services/providerService"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
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
  Link2,
  PlusCircle,
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
  const [newPortfolioUrl, setNewPortfolioUrl] = useState("")

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

  // Handle adding a portfolio image via URL
  const handleAddPortfolioUrl = () => {
    const url = newPortfolioUrl.trim()
    if (!url) return

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      toast.error("Invalid image URL", {
        description: "Please enter a valid web image URL starting with https://",
      })
      return
    }

    if (portfolioImages.includes(url)) {
      toast.error("Duplicate image", {
        description: "This image URL has already been added to your portfolio.",
      })
      return
    }

    setPortfolioImages((prev) => [...prev, url])
    setNewPortfolioUrl("")
    toast.success("Portfolio image added!")
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
        description: "Your business profile has been submitted and is pending verification by the superadmin.",
      })
      navigate("/dashboard/provider")
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
                Profile Photo / Business Logo (URL)
              </label>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <Avatar className="h-20 w-20 rounded-2xl border-2 border-border shadow-sm shrink-0">
                  <AvatarImage src={photoURL} />
                  <AvatarFallback className="text-lg font-bold bg-muted text-muted-foreground">
                    {name?.[0]?.toUpperCase() || "P"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 w-full space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Link2 className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                      <Input
                        value={photoURL}
                        onChange={(e) => setPhotoURL(e.target.value.trim())}
                        placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                        className="pl-9 text-xs"
                      />
                    </div>
                    {photoURL && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-destructive h-9"
                        onClick={() => setPhotoURL("")}
                      >
                        Clear
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter a direct image link (HTTPS) from Unsplash, Imgur, Cloudinary, or any web host.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Portfolio Gallery */}
            <div className="border-t border-border/80 pt-6">
              <div className="mb-3">
                <label className="text-sm font-medium text-foreground block">
                  Portfolio & Work Samples ({portfolioImages.length})
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Add image URLs of your past completed projects or before-and-after transformations.
                </p>

                {/* Add Portfolio Image via URL */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Link2 className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                    <Input
                      value={newPortfolioUrl}
                      onChange={(e) => setNewPortfolioUrl(e.target.value)}
                      placeholder="Paste work sample image URL (e.g. https://images.unsplash.com/...)"
                      className="pl-9 text-xs"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddPortfolioUrl()
                        }
                      }}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="gap-1.5 text-xs h-9 px-4 shrink-0"
                    onClick={handleAddPortfolioUrl}
                  >
                    <PlusCircle className="w-4 h-4" /> Add Image
                  </Button>
                </div>
              </div>

              {/* Portfolio Grid Previews */}
              {portfolioImages.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
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
                <div className="border border-dashed border-border rounded-xl p-8 text-center text-muted-foreground bg-card/40 mt-4">
                  <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium text-foreground">No portfolio photos added yet</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Paste any image URL above and click "Add Image" to showcase your work.
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
