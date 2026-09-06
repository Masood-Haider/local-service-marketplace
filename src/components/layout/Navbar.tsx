import React, { useState } from "react"
import { Link, NavLink, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import {
  Wrench,
  Menu,
  PlusCircle,
  LayoutDashboard,
  Shield,
  LogOut,
  User,
  Search,
  Briefcase,
  ChevronDown,
  Calendar,
  Settings,
} from "lucide-react"
import { NotificationBell } from "@/components/notifications/NotificationBell"

export const Navbar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { currentUser, role, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors hover:text-primary ${
      isActive ? "text-primary font-semibold" : "text-muted-foreground"
    }`

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Signed out successfully")
      navigate("/")
    } catch (err: any) {
      toast.error("Sign out failed", { description: err.message })
    }
  }

  const getDashboardPath = () => {
    if (role === "admin") return "/admin"
    if (role === "provider") return "/dashboard/provider"
    return "/dashboard/customer"
  }

  const getDashboardLabel = () => {
    if (role === "admin") return "Admin Console"
    if (role === "provider") return "Provider Hub"
    return "Customer Dashboard"
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-xs">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight text-primary group">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            <Wrench className="w-4 h-4" />
          </div>
          <span className="font-bold text-foreground tracking-tight text-base sm:text-lg">
            HomeServices<span className="text-primary">Hub</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLink to="/" className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/providers" className={navLinkClass}>
            Find a Pro
          </NavLink>
          <NavLink to="/post-job" className={navLinkClass}>
            Post a Job
          </NavLink>

          {currentUser && (
            <NavLink to={getDashboardPath()} className={navLinkClass}>
              {getDashboardLabel()}
            </NavLink>
          )}
        </nav>

        {/* Desktop Right Action Buttons */}
        <div className="hidden md:flex items-center gap-2.5">
          <Link to="/post-job">
            <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs rounded-lg border-primary/30 text-foreground hover:border-primary hover:bg-primary/5">
              <PlusCircle className="w-3.5 h-3.5 text-primary" />
              Post a Job
            </Button>
          </Link>

          {currentUser ? (
            <>
              <NotificationBell />
              <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 pl-1 pr-2 py-1 h-8 rounded-full border border-border/80 hover:bg-accent hover:text-accent-foreground text-xs"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-[10px]">
                      {currentUser.name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs font-semibold max-w-[100px] truncate text-foreground">
                    {currentUser.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 p-2 shadow-lg">
                <DropdownMenuLabel className="font-normal px-2 py-1.5">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold leading-none truncate text-foreground">{currentUser.name}</p>
                      <Badge variant="secondary" className="capitalize text-[10px] px-1.5 py-0 font-bold bg-primary/10 text-primary border border-primary/20">
                        {role || "user"}
                      </Badge>
                    </div>
                    <p className="text-xs leading-none text-muted-foreground truncate">{currentUser.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem onClick={() => navigate(getDashboardPath())} className="cursor-pointer py-2">
                  <LayoutDashboard className="w-4 h-4 mr-2 text-primary" />
                  <span>{getDashboardLabel()}</span>
                </DropdownMenuItem>

                {role === "customer" && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/dashboard/customer/bookings")} className="cursor-pointer py-2">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>My Bookings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/dashboard/customer/profile")} className="cursor-pointer py-2">
                      <User className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Profile & Settings</span>
                    </DropdownMenuItem>
                  </>
                )}

                {role === "provider" && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/dashboard/provider/services")} className="cursor-pointer py-2">
                      <Briefcase className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Services & Pricing</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/dashboard/provider/schedule")} className="cursor-pointer py-2">
                      <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Schedule & Availability</span>
                    </DropdownMenuItem>
                  </>
                )}

                {role === "admin" && (
                  <>
                    <DropdownMenuItem onClick={() => navigate("/admin/users")} className="cursor-pointer py-2">
                      <Shield className="w-4 h-4 mr-2 text-amber-500" />
                      <span>User Management</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/admin/settings")} className="cursor-pointer py-2">
                      <Settings className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span>Platform Settings</span>
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive py-2">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="h-8 px-3 text-xs font-medium">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="h-8 px-3 text-xs font-medium shadow-sm shadow-primary/20">
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Header: Notifications & Hamburger Sheet */}
        <div className="md:hidden flex items-center gap-1.5">
          {currentUser && <NotificationBell />}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Open menu">
                <Menu className="w-4 h-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[360px] flex flex-col justify-between p-6">
              <div>
                <SheetHeader className="text-left pb-6 border-b border-border">
                  <SheetTitle className="flex items-center gap-2 text-primary font-bold text-lg">
                    <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                      <Wrench className="w-4 h-4" />
                    </div>
                    <span>HomeServicesHub</span>
                  </SheetTitle>
                </SheetHeader>

                {/* User summary if logged in */}
                {currentUser && (
                  <div className="my-4 p-3 rounded-xl bg-muted/60 border border-border flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold text-sm">
                        {currentUser.name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold truncate text-foreground">{currentUser.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Badge variant="outline" className="text-[10px] capitalize px-1 py-0 font-bold bg-background">
                          {role}
                        </Badge>
                        <span className="text-xs text-muted-foreground truncate">{currentUser.email}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Links */}
                <div className="py-4 space-y-1">
                  <SheetClose asChild>
                    <Link
                      to="/"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
                    >
                      Home
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to="/providers"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
                    >
                      <Search className="w-4 h-4 text-primary" />
                      Find a Pro
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      to="/post-job"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-muted"
                    >
                      <PlusCircle className="w-4 h-4 text-primary" />
                      Post a Job
                    </Link>
                  </SheetClose>

                  {/* Role-based dashboard link */}
                  {currentUser && (
                    <div className="pt-2 mt-2 border-t border-border">
                      <SheetClose asChild>
                        <Link
                          to={getDashboardPath()}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-primary bg-primary/10"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          {getDashboardLabel()}
                        </Link>
                      </SheetClose>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-border space-y-2">
                {currentUser ? (
                  <Button
                    variant="outline"
                    className="w-full justify-center text-destructive border-destructive/20 hover:bg-destructive/10"
                    onClick={() => {
                      setMobileOpen(false)
                      handleLogout()
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <SheetClose asChild>
                      <Link to="/login" className="w-full block">
                        <Button variant="outline" className="w-full">
                          Sign In
                        </Button>
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link to="/register" className="w-full block">
                        <Button className="w-full">
                          Register
                        </Button>
                      </Link>
                    </SheetClose>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
