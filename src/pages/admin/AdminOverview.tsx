import React, { useState, useEffect } from "react"
import {
  fetchAdminMetrics,
  AdminMetrics,
} from "@/services/adminService"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"
import {
  Users,
  Briefcase,
  DollarSign,
  CalendarCheck,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react"

export const AdminOverview: React.FC = () => {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAdminMetrics()
      setMetrics(data)
    } catch (err: any) {
      setError(err.message || "Failed to load platform analytics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-sm font-medium text-slate-400">Loading platform metrics and charts...</p>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center max-w-md mx-auto my-12">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h3 className="font-bold text-white text-lg">Unable to Load Metrics</h3>
        <p className="text-xs text-slate-400 mt-1 mb-4">{error}</p>
        <Button onClick={loadData} variant="outline" className="gap-2 text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Try Again
        </Button>
      </div>
    )
  }

  const kpis = [
    {
      title: "Total Registered Users",
      value: metrics.totalUsers,
      change: "+14% this month",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      title: "Verified Trade Pros",
      value: metrics.totalProviders,
      change: "Active network",
      icon: ShieldCheck,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
    {
      title: "Posted Jobs",
      value: metrics.totalJobs,
      change: "Customer requests",
      icon: Briefcase,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
    },
    {
      title: "Confirmed Bookings",
      value: metrics.totalBookings,
      change: "Scheduled & complete",
      icon: CalendarCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Estimated GMV & Fees",
      value: `$${metrics.estimatedRevenue.toLocaleString()}`,
      change: "15% platform commission",
      icon: DollarSign,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
    },
  ]

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Executive Analytics Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time platform performance metrics, customer volume, and marketplace transaction activity.
          </p>
        </div>

        <Button
          onClick={loadData}
          variant="outline"
          size="sm"
          className="gap-2 text-xs bg-slate-900 border-slate-800 text-slate-300 hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Real-time Data
        </Button>
      </div>

      {/* 1. KPI CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="bg-slate-900 border-slate-800/90 text-slate-100 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-400">{kpi.title}</CardTitle>
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-white">{kpi.value}</div>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-400 inline" />
                {kpi.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2. CHARTS SECTION USING RECHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: Bookings Over Time */}
        <Card className="bg-slate-900 border-slate-800/90 text-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-white flex items-center justify-between">
              <span>Bookings Volume Trend</span>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px]">
                Past 7 Days
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Daily appointments booked through the marketplace
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.bookingsOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="bookings"
                  name="Appointments"
                  stroke="#38bdf8"
                  strokeWidth={3}
                  dot={{ fill: "#38bdf8", r: 4 }}
                  activeDot={{ r: 6, fill: "#0284c7" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Bar Chart: Jobs by Trade Category */}
        <Card className="bg-slate-900 border-slate-800/90 text-slate-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-white flex items-center justify-between">
              <span>Job Demand by Trade Category</span>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">
                Marketplace Demand
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Total customer job requests per trade specialty
            </CardDescription>
          </CardHeader>
          <CardContent className="h-72 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.jobsByCategory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "8px",
                    color: "#f8fafc",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="count" name="Jobs Posted" fill="#a855f7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 3. Booking Status Breakdown Pie Chart */}
      <Card className="bg-slate-900 border-slate-800/90 text-slate-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-bold text-white flex items-center justify-between">
            <span>Booking Pipeline & Status Breakdown</span>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">
              Lifecycle Distribution
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs text-slate-400">
            Real-time status ratio of pending, confirmed, in-progress, and completed dispatches
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={metrics.bookingStatusBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {metrics.bookingStatusBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  color: "#f8fafc",
                  fontSize: "12px",
                }}
              />
              <Legend
                verticalAlign="bottom"
                wrapperStyle={{ fontSize: "12px", color: "#94a3b8", paddingTop: "10px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
