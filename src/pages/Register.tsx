import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
  const [googleSubmitting, setGoogleSubmitting] = useState(false)

  // Validation error state
  const [errors, setErrors] = useState<{
    name?: string
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  const { register, loginWithGoogle } = useAuth()
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
        navigate("/dashboard/provider/onboarding", { replace: true })
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

  const handleGoogleSignIn = async () => {
    setGoogleSubmitting(true)
    try {
      const { profile, needsRole } = await loginWithGoogle()
      toast.success("Account connected!", {
        description: `Signed in with Google as ${profile.name}.`,
      })

      // If user needs to choose role
      if (needsRole || !profile.role) {
        navigate("/choose-role", { replace: true })
        return
      }

      if (profile.role === "admin") {
        navigate("/admin", { replace: true })
      } else if (profile.role === "provider") {
        navigate("/dashboard/provider", { replace: true })
      } else {
        navigate("/dashboard/customer", { replace: true })
      }
    } catch (err: any) {
      const message = getFirebaseAuthErrorMessage(err)
      toast.error("Google Registration failed", {
        description: message,
      })
    } finally {
      setGoogleSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 flex items-center justify-center min-h-[calc(100vh-16rem)]">
      <Card className="w-full max-w-lg shadow-xl border-border">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <Wrench className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Join Home Services Hub</CardTitle>
          <CardDescription>
            Create your account to start hiring trade specialists or offering services
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Continue with Google */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={submitting || googleSubmitting}
            className="w-full h-10 gap-3 border-border hover:bg-muted font-medium text-xs sm:text-sm"
          >
            {googleSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            Continue with Google
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground font-semibold">
                Or Register with Email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Role Selection Tabs */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                I want to:
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  disabled={submitting || googleSubmitting}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    role === "customer"
                      ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <User className="w-4 h-4 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-foreground">Hire Services</p>
                    <p className="text-[10px] text-muted-foreground">Customer</p>
                  </div>
                  {role === "customer" && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-primary" />}
                </button>

                <button
                  type="button"
                  onClick={() => setRole("provider")}
                  disabled={submitting || googleSubmitting}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    role === "provider"
                      ? "border-primary bg-primary/10 text-primary shadow-xs ring-1 ring-primary"
                      : "border-border bg-card text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Briefcase className="w-4 h-4 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-foreground">Offer Services</p>
                    <p className="text-[10px] text-muted-foreground">Specialist</p>
                  </div>
                  {role === "provider" && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-primary" />}
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="reg-name">
                {role === "provider" ? "Business or Specialist Name" : "Full Name"}
              </label>
              <Input
                id="reg-name"
                type="text"
                placeholder={role === "provider" ? "Apex Home Repairs or John Doe" : "John Doe"}
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors({ ...errors, name: undefined })
                }}
                disabled={submitting || googleSubmitting}
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
                disabled={submitting || googleSubmitting}
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
                  disabled={submitting || googleSubmitting}
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
              <label className="text-sm font-medium text-foreground" htmlFor="reg-confirm">
                Confirm Password
              </label>
              <Input
                id="reg-confirm"
                type={showPassword ? "text" : "password"}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined })
                }}
                disabled={submitting || googleSubmitting}
                className={errors.confirmPassword ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive font-medium">{errors.confirmPassword}</p>
              )}
            </div>

            <Button type="submit" className="w-full gap-2 mt-4 h-10" disabled={submitting || googleSubmitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Register as {role === "customer" ? "Customer" : "Service Provider"}
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
