import React from "react"
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import {
  Wrench,
  LayoutDashboard,
  Calendar,
  Briefcase,
  User,
  ArrowLeft,
  LogOut,
  Sparkles,
} from "lucide-react"

interface DashboardLayoutProps {
  type: "customer" | "provider"
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ type }) => {
  const { currentUser, role, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Signed out successfully")
      navigate("/")
    } catch (err: any) {
      toast.error("Sign out failed", { description: err.message })
    }
  }

  const customerNavItems = [
    { label: "Overview", path: "/dashboard/customer", icon: LayoutDashboard, end: true },
    { label: "My Bookings", path: "/dashboard/customer/bookings", icon: Calendar },
    { label: "Profile & Settings", path: "/dashboard/customer/profile", icon: User },
  ]

  const providerNavItems = [
    { label: "Overview", path: "/dashboard/provider", icon: LayoutDashboard, end: true },
    { label: "Profile & Portfolio", path: "/dashboard/provider/onboarding", icon: User },
    { label: "Services & Pricing", path: "/dashboard/provider/services", icon: Briefcase },
    { label: "Schedule & Bookings", path: "/dashboard/provider/schedule", icon: Calendar },
  ]

  const navItems = type === "customer" ? customerNavItems : providerNavItems

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col justify-between p-4">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-2 pt-2">
            <Link to="/" className="flex items-center gap-2 font-bold text-base text-primary">
              <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
                <Wrench className="w-3.5 h-3.5" />
              </div>
              <span className="text-foreground">HomeServices</span>
            </Link>
          </div>

          <div className="px-3 py-2 rounded-lg bg-muted/60 border border-border/50">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-semibold capitalize text-foreground">
                {type} Workspace
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Active Role: <span className="font-semibold text-foreground capitalize">{role || type}</span>
            </p>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-border pt-4 space-y-3">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {currentUser?.name?.[0]?.toUpperCase() || (type === "customer" ? "C" : "P")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-foreground">
                {currentUser?.name || (type === "customer" ? "Customer User" : "Pro Provider")}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {currentUser?.email || `${type}@example.com`}
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-1.5">
            <Link to="/">
              <Button variant="ghost" size="sm" className="w-full justify-start text-xs text-muted-foreground">
                <ArrowLeft className="w-3.5 h-3.5 mr-2" />
                Back to Marketplace
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="w-full justify-start text-xs text-destructive hover:text-destructive"
            >
              <LogOut className="w-3.5 h-3.5 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/60 backdrop-blur px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="md:hidden text-xs text-muted-foreground flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="capitalize">{type} Dashboard</span>
              <span>/</span>
              <span className="font-medium text-foreground">Overview</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={type === "customer" ? "/post-job" : "/providers"}>
              <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                {type === "customer" ? "Post New Request" : "Market Directory"}
              </Button>
            </Link>
          </div>
        </header>

        {/* Mobile secondary tab bar */}
        <div className="md:hidden bg-card border-b border-border px-4 py-2 flex overflow-x-auto gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                `text-xs px-3 py-1.5 rounded-md whitespace-nowrap font-medium ${
                  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground bg-muted"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
