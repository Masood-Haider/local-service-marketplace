import React, { useState } from "react"
import { useNavigate, Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Wrench,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

export const ChooseRole: React.FC = () => {
  const { currentUser, role, setUserRole, loading } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [selectedRole, setSelectedRole] = useState<"customer" | "provider">("customer")
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  // If not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  // If role is already set, redirect to the user's dashboard
  if (role) {
    if (role === "admin") return <Navigate to="/admin" replace />
    if (role === "provider") return <Navigate to="/dashboard/provider" replace />
    return <Navigate to="/dashboard/customer" replace />
  }

  const handleConfirmRole = async () => {
    setSubmitting(true)
    try {
      await setUserRole(selectedRole)
      toast.success("Profile setup complete!", {
        description: `You are now registered as a ${selectedRole === "customer" ? "Customer" : "Service Provider"}.`,
      })

      if (selectedRole === "provider") {
        navigate("/dashboard/provider/onboarding", { replace: true })
      } else {
        navigate("/dashboard/customer", { replace: true })
      }
    } catch (err: any) {
      toast.error("Failed to set role", {
        description: err.message || "Please try again.",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-12rem)]">
      <div className="w-full max-w-2xl space-y-6">
        {/* Brand & Introduction */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary mb-2 shadow-inner">
            <Wrench className="w-6 h-6" />
          </div>
          <Badge variant="outline" className="px-3 py-1 text-xs font-semibold bg-primary/5 text-primary border-primary/20">
            One-Time Setup
          </Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            How do you plan to use HomeServicesHub?
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Welcome, <span className="font-semibold text-foreground">{currentUser.name}</span>! Select your primary role to configure your personalized dashboard.
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 1. Customer Option */}
          <div
            onClick={() => setSelectedRole("customer")}
            className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200 relative flex flex-col justify-between ${
              selectedRole === "customer"
                ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary/20"
                : "border-border bg-card hover:border-border/80 hover:bg-muted/40"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${
                  selectedRole === "customer" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <User className="w-5 h-5" />
                </div>
                {selectedRole === "customer" && (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                )}
              </div>

              <div>
                <h3 className="font-bold text-base text-foreground">I want to hire Pros</h3>
                <p className="text-xs text-primary font-semibold mt-0.5">Customer Account</p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Post home repair jobs, receive tailored quotes from verified trade specialists, schedule bookings, and leave reviews.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-border/60 flex items-center text-xs font-medium text-muted-foreground">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-primary" /> Free for homeowners
            </div>
          </div>

          {/* 2. Provider Option */}
          <div
            onClick={() => setSelectedRole("provider")}
            className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200 relative flex flex-col justify-between ${
              selectedRole === "provider"
                ? "border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary/20"
                : "border-border bg-card hover:border-border/80 hover:bg-muted/40"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${
                  selectedRole === "provider" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  <Briefcase className="w-5 h-5" />
                </div>
                {selectedRole === "provider" && (
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                )}
              </div>

              <div>
                <h3 className="font-bold text-base text-foreground">I am a Service Provider</h3>
                <p className="text-xs text-primary font-semibold mt-0.5">Specialist / Contractor</p>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Showcase your trade skills and portfolio, browse open customer jobs, submit competitive bids, and build your local reputation.
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-border/60 flex items-center text-xs font-medium text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-500" /> Instant marketplace access
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex flex-col items-center space-y-3">
          <Button
            size="lg"
            onClick={handleConfirmRole}
            disabled={submitting}
            className="w-full sm:w-auto sm:min-w-[280px] h-11 gap-2 text-sm font-bold shadow-md shadow-primary/20"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Setting Up Your Account...
              </>
            ) : (
              <>
                Continue as {selectedRole === "customer" ? "Customer" : "Service Provider"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
          <p className="text-[11px] text-muted-foreground">
            You can always contact support or update preferences from your dashboard settings.
          </p>
        </div>
      </div>
    </div>
  )
}
