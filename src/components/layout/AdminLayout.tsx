import React, { useState } from "react"
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import {
  ShieldAlert,
  Users,
  Briefcase,
  Settings,
  LayoutDashboard,
  CalendarCheck,
  ArrowLeft,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  ShieldCheck,
  ExternalLink,
} from "lucide-react"

export const AdminLayout: React.FC = () => {
  const { currentUser, logout } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await logout()
      toast.success("Signed out of Admin Console")
      navigate("/")
    } catch (err: any) {
      toast.error("Sign out failed", { description: err.message })
    }
  }

  const adminNavItems = [
    { label: "Overview", path: "/admin", icon: LayoutDashboard, end: true },
    { label: "User Accounts", path: "/admin/users", icon: Users },
    { label: "Providers & Approvals", path: "/admin/providers", icon: ShieldCheck },
    { label: "Jobs & Bookings", path: "/admin/jobs", icon: CalendarCheck },
    { label: "Platform Settings", path: "/admin/settings", icon: Settings },
  ]

  const NavItemsContent = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-1.5">
      {adminNavItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all ${
              isActive
                ? "bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20"
                : "text-slate-300 hover:bg-slate-800 hover:text-white"
            } ${collapsed ? "justify-center px-2" : ""}`
          }
          title={collapsed ? item.label : undefined}
        >
          <item.icon className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{item.label}</span>}
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      {/* 1. Collapsible Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col justify-between border-r border-slate-800/80 bg-slate-900 transition-all duration-300 ${
          collapsed ? "w-20 p-3" : "w-64 p-4"
        }`}
      >
        <div className="space-y-6">
          {/* Header & Brand */}
          <div className="flex items-center justify-between px-1 pt-1">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-8 w-8 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-4 h-4" />
              </div>
              {!collapsed && (
                <span className="font-bold text-base text-white tracking-tight">
                  Admin<span className="text-amber-400">Hub</span>
                </span>
              )}
            </Link>

            {/* Collapse toggle button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-800"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>

          {/* Admin badge */}
          {!collapsed ? (
            <div className="px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Superadmin
                  </p>
                </div>
                <Badge className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0 border-amber-500/30">
                  Live
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 truncate">
                {currentUser?.email || "admin@hub.local"}
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" title="System Live" />
            </div>
          )}

          {/* Nav Items */}
          <NavItemsContent />
        </div>

        {/* Footer info & Logout */}
        <div className="space-y-3 pt-4 border-t border-slate-800">
          <Link to="/">
            <Button
              variant="ghost"
              size="sm"
              className={`w-full justify-start gap-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 ${
                collapsed ? "justify-center px-0" : ""
              }`}
            >
              <ExternalLink className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Marketplace View</span>}
            </Button>
          </Link>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className={`w-full justify-start gap-2 text-xs text-rose-400 border-rose-900/40 bg-rose-950/20 hover:bg-rose-900/40 hover:text-rose-300 ${
              collapsed ? "justify-center px-0" : ""
            }`}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </aside>

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-800/80 bg-slate-900/70 backdrop-blur px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile Sheet Trigger */}
            <div className="md:hidden">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-300">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 bg-slate-900 border-slate-800 text-slate-100 p-4">
                  <SheetHeader className="text-left pb-4 border-b border-slate-800">
                    <SheetTitle className="flex items-center gap-2 text-white">
                      <div className="h-7 w-7 rounded-md bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                      <span>Admin<span className="text-amber-400">Hub</span></span>
                    </SheetTitle>
                  </SheetHeader>
                  <div className="py-4">
                    <NavItemsContent onNavigate={() => setMobileOpen(false)} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <span className="text-xs font-semibold text-slate-400">
              Admin Console <span className="text-slate-600">/</span> Local Marketplace Platform
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-7 w-7 border border-amber-500/40">
                <AvatarFallback className="bg-amber-500 text-slate-950 font-bold text-xs">
                  {currentUser?.name?.[0]?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white leading-tight">{currentUser?.name || "Admin"}</p>
                <p className="text-[10px] text-amber-400 leading-tight">Super Administrator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Admin Pages */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
