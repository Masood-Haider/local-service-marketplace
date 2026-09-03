import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { createJob } from "@/services/jobService"
import { PageHeader } from "@/components/shared/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Briefcase,
  Send,
  Sparkles,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  Loader2,
  CheckCircle2,
} from "lucide-react"

export const PostJob: React.FC = () => {
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Plumbing")
  const [location, setLocation] = useState("")
  const [preferredDate, setPreferredDate] = useState("")
  const [budget, setBudget] = useState("")
  const [description, setDescription] = useState("")
  const [customerName, setCustomerName] = useState(currentUser?.name || "")
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || "")
  const [submitting, setSubmitting] = useState(false)

  const categories = [
    "Plumbing",
    "Electrical",
    "Cleaning",
    "Tutoring",
    "Moving",
    "HVAC",
    "Carpentry",
    "Painting",
    "Handyman",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !description.trim() || !location.trim()) {
      toast.error("Required fields missing", {
        description: "Please provide a title, location, and project description.",
      })
      return
    }

    setSubmitting(true)
    try {
      const jobId = await createJob({
        customerId: currentUser?.uid || "guest-" + Date.now(),
        customerName: currentUser?.name || customerName || "Customer",
        customerEmail: currentUser?.email || customerEmail || "customer@example.com",
        title: title.trim(),
        category,
        description: description.trim(),
        budget: budget.trim() || "Negotiable",
        preferredDate: preferredDate || "Flexible",
        location: location.trim(),
      })

      toast.success("Job request posted!", {
        description: `Your job has been published to local ${category} providers.`,
      })

      navigate(`/dashboard/customer/jobs/${jobId}`)
    } catch (err: any) {
      toast.error("Failed to post job", {
        description: err.message || "An error occurred while saving the job.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-3xl">
      <PageHeader
        title="Post a Service Request"
        description="Describe your project to receive real-time bids and transparent quotes from certified local pros."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="shadow-sm border-border">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Project Scope & Location</CardTitle>
                <CardDescription>Tell service professionals what you need done</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Project Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="job-title">
                Job Headline / Title *
              </label>
              <Input
                id="job-title"
                placeholder="e.g. Kitchen sink drain leak repair, EV charger installation"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Category Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Service Trade Category *
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

            {/* Location & Preferred Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="job-location">
                  Location / City / Zip Code *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="job-location"
                    placeholder="e.g. 94103 San Francisco, CA"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="job-date">
                  Preferred Service Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    id="job-date"
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Estimated Budget */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="job-budget">
                Estimated Budget (Optional)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  id="job-budget"
                  placeholder="e.g. $100 - $250 or Negotiable"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="job-desc">
                Detailed Job Description *
              </label>
              <textarea
                id="job-desc"
                rows={4}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Explain the problem, specific parts or appliances involved, access restrictions, or any questions for the contractor..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Non-logged in customer contact details if needed */}
            {!currentUser && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/80">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Your Name *</label>
                  <Input
                    placeholder="Alex Johnson"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Your Email *</label>
                  <Input
                    type="email"
                    placeholder="alex@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-6">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              Quotes arrive in real time without refreshing your page.
            </p>
            <Button type="submit" size="lg" className="w-full sm:w-auto gap-2 px-8" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Publishing Job...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" /> Post Job Request
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
