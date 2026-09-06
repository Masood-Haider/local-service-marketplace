import React, { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { getFirebaseAuthErrorMessage } from "@/lib/authErrors"
import { Wrench, LogIn, Loader2, Eye, EyeOff, ShieldAlert } from "lucide-react"

export const Login: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [googleSubmitting, setGoogleSubmitting] = useState(false)

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const { login, loginWithGoogle } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const location = useLocation()

  // Original destination before being redirected by ProtectedRoute
  const destination = (location.state as any)?.from?.pathname

  const validate = (): boolean => {
    const errs: typeof errors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email.trim()) {
      errs.email = "Email address is required"
    } else if (!emailRegex.test(email.trim())) {
      errs.email = "Please enter a valid email address"
    }

    if (!password) {
      errs.password = "Password is required"
    } else if (password.length < 6) {
      errs.password = "Password must be at least 6 characters"
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) {
      toast.error("Validation error", {
        description: "Please check your email and password.",
      })
      return
    }

    setSubmitting(true)
    try {
      const userProfile = await login(email.trim(), password)
      toast.success("Welcome back!", {
        description: `Signed in as ${userProfile.name} (${userProfile.role || "User"}).`,
      })

      // If user hasn't set a role, send to choose-role
      if (!userProfile.role) {
        navigate("/choose-role", { replace: true })
        return
      }

      // If user came from a protected route, send them there if allowed
      if (destination) {
        navigate(destination, { replace: true })
        return
      }

      // Otherwise redirect based on role
      if (userProfile.role === "admin") {
        navigate("/admin", { replace: true })
      } else if (userProfile.role === "provider") {
        navigate("/dashboard/provider", { replace: true })
      } else {
        navigate("/dashboard/customer", { replace: true })
      }
    } catch (err: any) {
      const message = getFirebaseAuthErrorMessage(err)
      toast.error("Sign-in failed", {
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
      toast.success("Welcome!", {
        description: `Signed in with Google as ${profile.name}.`,
      })

      // Redirect to choose-role screen if first-time user without role
      if (needsRole || !profile.role) {
        navigate("/choose-role", { replace: true })
        return
      }

      if (destination) {
        navigate(destination, { replace: true })
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
      toast.error("Google Sign-In failed", {
        description: message,
      })
    } finally {
      setGoogleSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[calc(100vh-16rem)]">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-3 h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
            <Wrench className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to access your Home Services Hub account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Google Sign-in Button */}
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
                Or with Email & Password
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground" htmlFor="login-email">
                Email Address
              </label>
              <Input
                id="login-email"
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
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground" htmlFor="login-password">
                  Password
                </label>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
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

            <Button type="submit" className="w-full gap-2 mt-4 h-10" disabled={submitting || googleSubmitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </Button>
          </form>

          {/* Quick Admin Helper Hint */}
          <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/80 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Admin Testing Note:</span> Accounts registered with <code className="bg-muted px-1 rounded font-mono text-[11px]">admin123@gmail.com</code> or assigned <code className="bg-muted px-1 rounded font-mono text-[11px]">role: "admin"</code> in Firestore receive Superadmin privileges.
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center border-t border-border/60 pt-4">
          <p className="text-xs text-muted-foreground">
            Don't have an account yet?{" "}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
