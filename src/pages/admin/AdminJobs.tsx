import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import {
  fetchAdminJobsAndBookings,
  adminOverrideBookingStatus,
  AdminQuoteRequest,
} from "@/services/adminService"
import { Booking, Job, BookingStatus, getBookingStatusBadge } from "@/services/jobService"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EmptyState } from "@/components/shared/EmptyState"
import {
  Briefcase,
  CalendarCheck,
  Search,
  MoreVertical,
  RefreshCw,
  Loader2,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  PlayCircle,
  CheckCheck,
  DollarSign,
  User,
  ShieldAlert,
  MessageSquareQuote,
  ExternalLink,
  Calendar as CalendarIcon,
  Phone,
} from "lucide-react"

export const AdminJobs: React.FC = () => {
  const { toast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [quoteRequests, setQuoteRequests] = useState<AdminQuoteRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all")
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null)

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await fetchAdminJobsAndBookings()
      setJobs(data.jobs)
      setBookings(data.bookings)
      setQuoteRequests(data.quoteRequests)
    } catch (err: any) {
      toast.error("Failed to load jobs & bookings", { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOverrideStatus = async (bookingId: string, newStatus: BookingStatus) => {
    setUpdatingBookingId(bookingId)
    try {
      await adminOverrideBookingStatus(bookingId, newStatus)
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      )
      toast.success(`Booking status overridden to ${newStatus.replace("_", " ").toUpperCase()}`)
    } catch (err: any) {
      toast.error("Failed to override status", { description: err.message })
    } finally {
      setUpdatingBookingId(null)
    }
  }

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.providerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.category?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      bookingStatusFilter === "all" || b.status === bookingStatusFilter

    return matchesSearch && matchesStatus
  })

  const filteredJobs = jobs.filter((j) => {
    return (
      j.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      j.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const filteredQuoteRequests = quoteRequests.filter((q) => {
    const matchesSearch =
      q.serviceNeeded?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.providerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.serviceLocation?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      bookingStatusFilter === "all" || q.status === bookingStatusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Jobs & Bookings Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Monitor client service requests, dispatch appointments, and execute administrative status overrides.
          </p>
        </div>

        <Button
          onClick={loadData}
          variant="outline"
          size="sm"
          className="gap-2 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Records
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bookings" className="w-full space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1">
            <TabsTrigger value="bookings" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 text-xs font-semibold">
              Client Bookings ({bookings.length})
            </TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 text-xs font-semibold">
              Job Requests ({jobs.length})
            </TabsTrigger>
            <TabsTrigger value="pro_requests" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 text-xs font-semibold">
              Direct Pro Requests ({quoteRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* Search bar */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Search by job, client, or pro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs"
              />
            </div>

            <div className="w-40 shrink-0">
              <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
                <SelectTrigger className="h-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 1. BOOKINGS TABLE TAB */}
        <TabsContent value="bookings">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                  <p className="text-xs text-slate-500 dark:text-slate-400">Loading bookings from Firestore...</p>
                </div>
              ) : filteredBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
                      <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                        <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Project / Job</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Parties Involved</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Date & Slot</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Price</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Current Status</TableHead>
                        <TableHead className="text-right text-slate-600 dark:text-slate-400 font-semibold">Admin Override</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking) => {
                        const statusBadge = getBookingStatusBadge(booking.status)

                        return (
                          <TableRow key={booking.id} className="border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                            <TableCell>
                              <div>
                                <Badge variant="outline" className="text-[10px] text-primary border-primary/30 mb-0.5">
                                  {booking.category}
                                </Badge>
                                <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{booking.jobTitle}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-primary shrink-0" />
                                  <span className="truncate max-w-[160px]">{booking.location}</span>
                                </p>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="text-xs space-y-0.5">
                                <p className="text-slate-700 dark:text-slate-300">
                                  Client: <strong className="text-slate-900 dark:text-white">{booking.customerName}</strong>
                                </p>
                                <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                                  Pro: <strong className="text-amber-600 dark:text-amber-400">{booking.providerName}</strong>
                                </p>
                              </div>
                            </TableCell>

                            <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                              <p className="font-medium">{booking.scheduledDate}</p>
                              {booking.scheduledTime && (
                                <p className="text-[11px] text-slate-400 dark:text-slate-500">{booking.scheduledTime}</p>
                              )}
                            </TableCell>

                            <TableCell className="font-bold text-slate-900 dark:text-white text-xs">
                              {booking.price}
                            </TableCell>

                            <TableCell>
                              <Badge className={statusBadge.className}>
                                {statusBadge.label}
                              </Badge>
                            </TableCell>

                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-7 text-xs gap-1 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    disabled={updatingBookingId === booking.id}
                                  >
                                    Override <MoreVertical className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-md">
                                  <DropdownMenuLabel className="text-xs text-slate-500 dark:text-slate-400">
                                    Override Booking Status
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                  <DropdownMenuItem
                                    onClick={() => handleOverrideStatus(booking.id, "confirmed")}
                                    className="cursor-pointer text-xs focus:bg-slate-100 dark:focus:bg-slate-800"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-blue-500" />
                                    Mark Confirmed
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleOverrideStatus(booking.id, "in_progress")}
                                    className="cursor-pointer text-xs focus:bg-slate-100 dark:focus:bg-slate-800"
                                  >
                                    <PlayCircle className="w-3.5 h-3.5 mr-2 text-purple-500" />
                                    Mark In Progress
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleOverrideStatus(booking.id, "completed")}
                                    className="cursor-pointer text-xs text-emerald-600 dark:text-emerald-400 font-semibold focus:bg-slate-100 dark:focus:bg-slate-800"
                                  >
                                    <CheckCheck className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                                    Mark Completed
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
                                  <DropdownMenuItem
                                    onClick={() => handleOverrideStatus(booking.id, "cancelled")}
                                    className="cursor-pointer text-xs text-rose-600 dark:text-rose-400 font-semibold focus:bg-slate-100 dark:focus:bg-slate-800"
                                  >
                                    <XCircle className="w-3.5 h-3.5 mr-2 text-rose-500" />
                                    Mark Cancelled
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12">
                  <EmptyState
                    icon={CalendarCheck}
                    title="No Bookings Match Criteria"
                    description="Adjust search keywords or status filter to see appointments."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. JOB REQUESTS TAB */}
        <TabsContent value="jobs">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs overflow-hidden">
            <CardContent className="p-0">
              {filteredJobs.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
                      <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                        <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Job Title & Category</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Client</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Location</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Budget</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Current Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJobs.map((job) => (
                        <TableRow key={job.id} className="border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <TableCell>
                            <div>
                              <Badge variant="outline" className="text-[10px] text-primary border-primary/30 mb-0.5">
                                {job.category}
                              </Badge>
                              <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{job.title}</p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{job.description}</p>
                            </div>
                          </TableCell>

                          <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                            <p className="font-medium text-slate-900 dark:text-white">{job.customerName}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">{job.customerEmail}</p>
                          </TableCell>

                          <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                            {job.location}
                          </TableCell>

                          <TableCell className="text-xs font-bold text-slate-900 dark:text-white">
                            {job.budget}
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={`text-[10px] capitalize font-bold ${
                                job.status === "booked"
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                              }`}
                            >
                              {job.status || "open"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12">
                  <EmptyState
                    icon={Briefcase}
                    title="No Jobs Found"
                    description="No customer jobs match your current search query."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. DIRECT PRO QUOTE REQUESTS TAB */}
        <TabsContent value="pro_requests">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs overflow-hidden">
            <CardContent className="p-0">
              {filteredQuoteRequests.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
                      <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                        <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Service & Details</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Recipient Provider</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Customer</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Preferred Date</TableHead>
                        <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuoteRequests.map((req) => (
                        <TableRow key={req.id} className="border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="font-bold text-xs text-slate-900 dark:text-white">{req.serviceNeeded}</p>
                              {req.projectDetails && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                                  {req.projectDetails}
                                </p>
                              )}
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                <MapPin className="w-3 h-3 text-primary shrink-0" />
                                <span className="truncate">{req.serviceLocation}</span>
                              </p>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div>
                              <p className="font-semibold text-xs text-slate-900 dark:text-white">{req.providerName}</p>
                              <Link
                                to={`/providers/${req.providerId}`}
                                target="_blank"
                                className="text-[11px] text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 mt-0.5"
                              >
                                View Profile <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          </TableCell>

                          <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                            <p className="font-medium text-slate-900 dark:text-white">{req.customerName}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">{req.customerEmail}</p>
                            {req.customerPhone && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3" /> {req.customerPhone}
                              </p>
                            )}
                          </TableCell>

                          <TableCell className="text-xs text-slate-700 dark:text-slate-300">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3.5 h-3.5 text-primary shrink-0" />
                              {req.preferredDate || "Flexible"}
                            </span>
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={`text-[10px] capitalize font-bold ${
                                req.status === "quoted"
                                  ? "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30"
                                  : req.status === "declined"
                                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
                                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                              }`}
                            >
                              {req.status || "pending"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="py-12">
                  <EmptyState
                    icon={MessageSquareQuote}
                    title="No Direct Requests Found"
                    description="No direct quote requests have been sent to service providers yet."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
