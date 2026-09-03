import React from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "@/context/AuthContext"
import { Toaster } from "@/components/ui/sonner"
import { ProtectedRoute } from "@/components/shared/ProtectedRoute"

// Layouts
import { MainLayout } from "@/components/layout/MainLayout"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { AdminLayout } from "@/components/layout/AdminLayout"

// Public & Main Pages
import { Landing } from "@/pages/Landing"
import { Login } from "@/pages/Login"
import { Register } from "@/pages/Register"
import { BrowseProviders } from "@/pages/BrowseProviders"
import { ProviderDetail } from "@/pages/ProviderDetail"
import { PostJob } from "@/pages/PostJob"

// Customer Dashboard Pages
import { CustomerDashboard } from "@/pages/customer/CustomerDashboard"
import { JobDetail } from "@/pages/customer/JobDetail"
import { CustomerBookings } from "@/pages/customer/CustomerBookings"
import { CustomerProfile } from "@/pages/customer/CustomerProfile"

// Provider Dashboard Pages
import { ProviderDashboard } from "@/pages/provider/ProviderDashboard"
import { ProviderServices } from "@/pages/provider/ProviderServices"
import { ProviderSchedule } from "@/pages/provider/ProviderSchedule"
import { ProviderOnboarding } from "@/pages/provider/ProviderOnboarding"

// Admin Dashboard Pages
import { AdminOverview } from "@/pages/admin/AdminOverview"
import { AdminUsers } from "@/pages/admin/AdminUsers"
import { AdminProviders } from "@/pages/admin/AdminProviders"
import { AdminJobs } from "@/pages/admin/AdminJobs"
import { AdminSettings } from "@/pages/admin/AdminSettings"

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Main Marketplace Routes (Public) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/providers" element={<BrowseProviders />} />
            <Route path="/providers/:id" element={<ProviderDetail />} />
            <Route path="/post-job" element={<PostJob />} />
            <Route path="/jobs/:jobId" element={<JobDetail />} />
          </Route>

          {/* Customer Dashboard (Protected: Customer & Admin) */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["customer", "admin"]}>
                <DashboardLayout type="customer" />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard/customer" index element={<CustomerDashboard />} />
            <Route path="/dashboard/customer/jobs/:jobId" element={<JobDetail />} />
            <Route path="/dashboard/customer/bookings" element={<CustomerBookings />} />
            <Route path="/dashboard/customer/profile" element={<CustomerProfile />} />
          </Route>

          {/* Provider Dashboard (Protected: Provider & Admin) */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["provider", "admin"]}>
                <DashboardLayout type="provider" />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard/provider" index element={<ProviderDashboard />} />
            <Route path="/dashboard/provider/onboarding" element={<ProviderOnboarding />} />
            <Route path="/dashboard/provider/profile" element={<ProviderOnboarding />} />
            <Route path="/dashboard/provider/services" element={<ProviderServices />} />
            <Route path="/dashboard/provider/schedule" element={<ProviderSchedule />} />
          </Route>

          {/* Admin Portal (Protected: Admin Only) */}
          <Route
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" index element={<AdminOverview />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/providers" element={<AdminProviders />} />
            <Route path="/admin/jobs" element={<AdminJobs />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" closeButton richColors />
    </AuthProvider>
  )
}

export default App
