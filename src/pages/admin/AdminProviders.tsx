import React, { useState, useEffect } from "react"
import {
  fetchAdminProviders,
  updateProviderVerification,
  AdminProvider,
} from "@/services/adminService"
import { useToast } from "@/hooks/useToast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/shared/EmptyState"
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Loader2,
  Star,
  MapPin,
  ExternalLink,
  Clock,
} from "lucide-react"
import { Link } from "react-router-dom"

export const AdminProviders: React.FC = () => {
  const { toast } = useToast()
  const [providers, setProviders] = useState<AdminProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("all")
  const [updatingUid, setUpdatingUid] = useState<string | null>(null)

  const categories = [
    "All",
    "Plumbing",
    "Electrical",
    "Cleaning",
    "Tutoring",
    "Moving",
    "HVAC",
    "Carpentry",
    "Painting",
  ]

  const loadProviders = async () => {
    setLoading(true)
    try {
      const data = await fetchAdminProviders()
      setProviders(data)
    } catch (err: any) {
      toast.error("Failed to load providers", { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProviders()
  }, [])

  const handleSetStatus = async (
    provider: AdminProvider,
    newStatus: "approved" | "rejected" | "pending"
  ) => {
    setUpdatingUid(provider.uid)
    try {
      await updateProviderVerification(provider.uid, newStatus)
      setProviders((prev) =>
        prev.map((p) =>
          p.uid === provider.uid ? { ...p, verificationStatus: newStatus } : p
        )
      )
      toast.success(
        `Provider ${provider.name} set to ${newStatus.toUpperCase()}`
      )
    } catch (err: any) {
      toast.error("Failed to update status", { description: err.message })
    } finally {
      setUpdatingUid(null)
    }
  }

  const filteredProviders = providers.filter((p) => {
    const matchesSearch =
      p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.serviceArea?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory =
      categoryFilter === "All" || p.category === categoryFilter

    const currentStatus = p.verificationStatus || "approved"
    const matchesStatus =
      statusFilter === "all" || currentStatus === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 gap-1 text-[11px]">
            <CheckCircle2 className="w-3 h-3" /> Approved & Verified
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1 text-[11px]">
            <Clock className="w-3 h-3" /> Verification Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 gap-1 text-[11px]">
            <XCircle className="w-3 h-3" /> Application Declined
          </Badge>
        )
      default:
        return (
          <Badge className="bg-slate-800 text-slate-300 text-[11px]">
            {status || "Active"}
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Trade Providers & Verifications
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review licenses, approve onboarding applications, and monitor service provider ratings.
          </p>
        </div>

        <Button
          onClick={loadProviders}
          variant="outline"
          size="sm"
          className="gap-2 text-xs bg-slate-900 border-slate-800 text-slate-300 hover:text-white shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Providers
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="bg-slate-900 border-slate-800 p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <Input
              placeholder="Search provider by business name, trade, or territory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-slate-950 border-slate-800 text-slate-200 text-xs"
            />
          </div>

          <div className="w-full sm:w-48">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="h-10 bg-slate-950 border-slate-800 text-slate-200 text-xs">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c === "All" ? "All Categories" : c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-44">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 bg-slate-950 border-slate-800 text-slate-200 text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Providers Table */}
      <Card className="bg-slate-900 border-slate-800 text-slate-100 overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-white">Registered Providers</CardTitle>
            <Badge variant="outline" className="text-xs text-slate-400 border-slate-700">
              Showing {filteredProviders.length} of {providers.length} Pros
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-xs text-slate-400">Loading service providers...</p>
            </div>
          ) : filteredProviders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-950/60 border-slate-800">
                  <TableRow className="border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-400">Provider</TableHead>
                    <TableHead className="text-slate-400">Category & Rates</TableHead>
                    <TableHead className="text-slate-400">Territory</TableHead>
                    <TableHead className="text-slate-400">Rating & Reviews</TableHead>
                    <TableHead className="text-slate-400">Verification Status</TableHead>
                    <TableHead className="text-right text-slate-400">Approval Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProviders.map((provider) => (
                    <TableRow key={provider.uid} className="border-slate-800/80 hover:bg-slate-800/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 border border-slate-700">
                            <AvatarImage src={provider.photoURL} alt={provider.name} />
                            <AvatarFallback className="bg-slate-800 text-slate-300 font-bold text-xs">
                              {provider.name?.[0]?.toUpperCase() || "P"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-xs text-white">{provider.name}</p>
                            <Link
                              to={`/providers/${provider.uid}`}
                              target="_blank"
                              className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
                            >
                              Public Profile <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <Badge variant="outline" className="text-[10px] text-primary border-primary/30">
                            {provider.category}
                          </Badge>
                          <p className="text-xs font-semibold text-slate-300 mt-1">{provider.priceRange}</p>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-slate-300">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-primary shrink-0" />
                          <span className="truncate max-w-[150px]">{provider.serviceArea}</span>
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="flex items-center gap-1 text-amber-400 font-bold">
                            <Star className="w-3.5 h-3.5 fill-current" /> {provider.avgRating || "5.0"}
                          </span>
                          <span className="text-slate-500">({provider.totalReviews || 0})</span>
                        </div>
                      </TableCell>

                      <TableCell>{getStatusBadge(provider.verificationStatus)}</TableCell>

                      <TableCell className="text-right space-x-1.5">
                        <Button
                          size="sm"
                          onClick={() => handleSetStatus(provider, "approved")}
                          disabled={
                            updatingUid === provider.uid ||
                            provider.verificationStatus === "approved"
                          }
                          className="h-7 px-2 text-[11px] bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1" /> Approve
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSetStatus(provider, "rejected")}
                          disabled={
                            updatingUid === provider.uid ||
                            provider.verificationStatus === "rejected"
                          }
                          className="h-7 px-2 text-[11px] text-rose-400 border-rose-900/50 hover:bg-rose-950/40"
                        >
                          <XCircle className="w-3 h-3 mr-1" /> Reject
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12">
              <EmptyState
                icon={ShieldCheck}
                title="No Providers Found"
                description="No trade providers match your category and verification filters."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
