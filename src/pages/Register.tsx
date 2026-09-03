import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { getFirebaseAuthErrorMessage } from "@/lib/authErrors"
import { Wrench, UserPlus, Loader2, CheckCircle2, User, Briefcase, Eye, EyeOff } from "lucide-react"

export const Register: React.FC = () => {
  const [role, setRole] = useState<"customer" | "provider">("customer")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Validation error state
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const { register } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const validate = (): boolean => {
    const errs: typeof errors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!name.trim()) {
      errs.name = role === "provider" ? "Business name or your full name is required" : "Full name is required"
    }

    if (!email.trim()) {
      errs.email = "Email address is required"
    } else if (!emailRegex.test(email.trim())) {
      errs.email = "Please enter a valid email address (e.g., name@example.com)"
    }

    if (!password) {
      errs.password = "Password is required"
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters long"
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match"
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error("Form validation error", {
        description: "Please fix the highlighted fields before proceeding.",
      })
      return
    }

    setSubmitting(true)
    try {
      const userProfile = await register(email.trim(), password, name.trim(), role)
      toast.success("Account created successfully!", {
        description: `Welcome to Home Services Hub as a ${userProfile.role}.`,
      })

      // Redirect to appropriate dashboard
      if (userProfile.role === "admin") {
        navigate("/admin", { replace: true })
      } else if (userProfile.role === "provider") {
        navigate("/dashboard/provider", { replace: true })
      } else {
        navigate("/dashboard/customer", { replace: true })
      }
    } catch (err: any) {
      const message = getFirebaseAuthErrorMessage(err)
      toast.error("Registration failed", {
        description: message,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-16rem)]">
      <Card className="w-full max-w-lg shadow-xl border-border">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <Wrench className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Create an Account</CardTitle>
          <CardDescription>
            Join Home Services Hub to request services or offer your trade expertise
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Role Selector Cards */}
          <div className="mb-6">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 block">
              Step 1: Choose Account Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole("customer")}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  role === "customer"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-muted-foreground/40 bg-card"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  {role === "customer" && (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Customer</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Find and hire local pros
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole("provider")}
                className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  role === "provider"
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-muted-foreground/40 bg-card"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  {role === "provider" && (
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">Service Provider</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Receive job requests & grow
                  </p>
                </div>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="reg-name">
                {role === "provider" ? "Business Name or Full Name" : "Full Name"}
              </label>
              <Input
                id="reg-name"
                placeholder={role === "provider" ? "e.g., Apex Plumbing & Heating" : "e.g., Alex Johnson"}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors({ ...errors, name: undefined })
                }}
                disabled={submitting}
                className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.name && <p className="text-xs text-destructive font-medium">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="reg-email">
                Email Address
              </label>
              <Input
                id="reg-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors({ ...errors, email: undefined })
                }}
                disabled={submitting}
                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.email && <p className="text-xs text-destructive font-medium">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="reg-password">
                Password
              </label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors({ ...errors, password: undefined })
                  }}
                  disabled={submitting}
                  className={`pr-10 ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive font-medium">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="reg-confirm-password">
                Confirm Password
              </label>
              <Input
                id="reg-confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined })
                }}
                disabled={submitting}
                className={errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full gap-2 mt-6 h-10" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Register as {role === "provider" ? "Service Provider" : "Customer"}
                </>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border/60 pt-4">
          <p className="text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
