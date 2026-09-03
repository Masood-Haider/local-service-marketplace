import React from "react"
import { Navigate, useLocation, Outlet } from "react-router-dom"
import { useAuth, UserRole } from "@/hooks/useAuth"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  allowedRoles?: UserRole[]
  children?: React.ReactNode
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
}) => {
  const { currentUser, role, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Authenticating session...
        </p>
      </div>
    )
  }

  // Not logged in -> redirect to login with original destination in state
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role permissions (if specified)
  if (allowedRoles && allowedRoles.length > 0) {
    // Admin has universal access
    const isAuthorized = role === "admin" || (role && allowedRoles.includes(role))

    if (!isAuthorized) {
      // Redirect to the user's appropriate portal
      if (role === "customer") {
        return <Navigate to="/dashboard/customer" replace />
      }
      if (role === "provider") {
        return <Navigate to="/dashboard/provider" replace />
      }
      return <Navigate to="/" replace />
    }
  }

  return children ? <>{children}</> : <Outlet />
}
