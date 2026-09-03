import React from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, ShieldCheck, Activity, AlertCircle } from "lucide-react"
import { Link } from "react-router-dom"

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Admin System Overview
          </h1>
          <p className="text-sm md:text-base text-slate-400 mt-1">
            Global marketplace metrics, user onboarding verifications, and platform health.
          </p>
        </div>
        <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs">
          System Operational
        </Badge>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-medium text-slate-400">Total Users</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">1</div>
          <p className="text-xs text-slate-500 mt-1">Customers & Providers</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-medium text-slate-400">Verified Providers</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">0</div>
          <p className="text-xs text-slate-500 mt-1">0 pending review</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-medium text-slate-400">Total Requests</span>
            <Briefcase className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">0</div>
          <p className="text-xs text-slate-500 mt-1">0 in progress</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-medium text-slate-400">Platform GMV</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">$0.00</div>
          <p className="text-xs text-slate-500 mt-1">Current billing period</p>
        </div>
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="font-semibold text-lg text-white mb-1">Provider Verification Queue</h3>
          <p className="text-sm text-slate-400 mb-4">
            Review licenses, insurance certificates, and background reports submitted by providers.
          </p>
          <Link to="/admin/users">
            <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-200 text-xs">
              Manage Provider Approvals
            </Button>
          </Link>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="font-semibold text-lg text-white mb-1">Service Categories</h3>
          <p className="text-sm text-slate-400 mb-4">
            Manage marketplace trade taxonomies, custom pricing brackets, and suggested scopes.
          </p>
          <Link to="/admin/services">
            <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-200 text-xs">
              Configure Service Categories
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
