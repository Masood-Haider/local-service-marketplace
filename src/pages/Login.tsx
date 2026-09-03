import React, { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { getFirebaseAuthErrorMessage } from "@/lib/authErrors"
import { Wrench, LogIn, Loader2, Eye, EyeOff, ShieldAlert, Sparkles } from "lucide-react"

export const Login: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const { login } = useAuth()
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
        description: `Signed in as ${userProfile.name} (${userProfile.role}).`,
      })

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

        <CardContent>
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
                disabled={submitting}
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
                <span className="text-xs text-primary hover:underline cursor-pointer">
                  Forgot?
                </span>
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

            <Button type="submit" className="w-full gap-2 mt-4 h-10" disabled={submitting}>
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
          <div className="mt-6 p-3 rounded-lg bg-muted/50 border border-border/80 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Admin Testing Note:</span> Accounts registered or created with email <code className="bg-muted px-1 rounded font-mono text-[11px]">admin@hub.local</code> or Firestore <code className="bg-muted px-1 rounded font-mono text-[11px]">role: "admin"</code> automatically receive Superadmin privileges.
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
