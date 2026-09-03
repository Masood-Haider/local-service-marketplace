import React, { useState, useEffect } from "react"
import {
  fetchAdminJobsAndBookings,
  adminOverrideBookingStatus,
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
} from "lucide-react"

export const AdminJobs: React.FC = () => {
  const { toast } = useToast()
  const [jobs, setJobs] = useState<Job[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
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

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Jobs & Bookings Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor client service requests, dispatch appointments, and execute administrative status overrides.
          </p>
        </div>

        <Button
          onClick={loadData}
          variant="outline"
          size="sm"
          className="gap-2 text-xs bg-slate-900 border-slate-800 text-slate-300 hover:text-white shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Records
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bookings" className="w-full space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <TabsList className="bg-slate-900 border border-slate-800 p-1">
            <TabsTrigger value="bookings" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 text-xs font-semibold">
              Client Bookings ({bookings.length})
            </TabsTrigger>
            <TabsTrigger value="jobs" className="data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950 text-xs font-semibold">
              Job Requests ({jobs.length})
            </TabsTrigger>
          </TabsList>

          {/* Search bar */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <Input
                placeholder="Search by job, client, or pro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-9 bg-slate-900 border-slate-800 text-slate-200 text-xs"
              />
            </div>

            <div className="w-40 shrink-0">
              <Select value={bookingStatusFilter} onValueChange={setBookingStatusFilter}>
                <SelectTrigger className="h-9 bg-slate-900 border-slate-800 text-slate-200 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
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
          <Card className="bg-slate-900 border-slate-800 text-slate-100 overflow-hidden">
            <CardContent className="p-0">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                  <p className="text-xs text-slate-400">Loading bookings from Firestore...</p>
                </div>
              ) : filteredBookings.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-950/60 border-slate-800">
                      <TableRow className="border-slate-800 hover:bg-transparent">
                        <TableHead className="text-slate-400">Project / Job</TableHead>
                        <TableHead className="text-slate-400">Parties Involved</TableHead>
                        <TableHead className="text-slate-400">Date & Slot</TableHead>
                        <TableHead className="text-slate-400">Price</TableHead>
                        <TableHead className="text-slate-400">Current Status</TableHead>
                        <TableHead className="text-right text-slate-400">Admin Override</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking) => {
                        const statusBadge = getBookingStatusBadge(booking.status)

                        return (
                          <TableRow key={booking.id} className="border-slate-800/80 hover:bg-slate-800/40">
                            <TableCell>
                              <div>
                                <Badge variant="outline" className="text-[10px] text-primary border-primary/30 mb-0.5">
                                  {booking.category}
                                </Badge>
                                <p className="font-bold text-xs text-white line-clamp-1">{booking.jobTitle}</p>
                                <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-primary shrink-0" />
                                  <span className="truncate max-w-[160px]">{booking.location}</span>
                                </p>
                              </div>
                            </TableCell>

                            <TableCell>
                              <div className="text-xs space-y-0.5">
                                <p className="text-slate-300">
                                  Client: <strong className="text-white">{booking.customerName}</strong>
                                </p>
                                <p className="text-slate-400 text-[11px]">
                                  Pro: <strong className="text-amber-400">{booking.providerName}</strong>
                                </p>
                              </div>
                            </TableCell>

                            <TableCell className="text-xs text-slate-300">
                              <p className="font-medium">{booking.scheduledDate}</p>
                              {booking.scheduledTime && (
                                <p className="text-[11px] text-slate-500">{booking.scheduledTime}</p>
                              )}
                            </TableCell>

                            <TableCell className="font-bold text-white text-xs">
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
                                    className="h-7 text-xs gap-1 bg-slate-950 border-slate-700 text-slate-200"
                                    disabled={updatingBookingId === booking.id}
                                  >
                                    Override <MoreVertical className="w-3 h-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800 text-slate-200">
                                  <DropdownMenuLabel className="text-xs text-slate-400">
                                    Override Booking Status
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator className="bg-slate-800" />
                                  <DropdownMenuItem
                                    onClick={() => handleOverrideStatus(booking.id, "confirmed")}
                                    className="cursor-pointer text-xs"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-blue-400" />
                                    Mark Confirmed
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleOverrideStatus(booking.id, "in_progress")}
                                    className="cursor-pointer text-xs"
                                  >
                                    <PlayCircle className="w-3.5 h-3.5 mr-2 text-purple-400" />
                                    Mark In Progress
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleOverrideStatus(booking.id, "completed")}
                                    className="cursor-pointer text-xs text-emerald-400 font-semibold"
                                  >
                                    <CheckCheck className="w-3.5 h-3.5 mr-2 text-emerald-400" />
                                    Mark Completed
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator className="bg-slate-800" />
                                  <DropdownMenuItem
                                    onClick={() => handleOverrideStatus(booking.id, "cancelled")}
                                    className="cursor-pointer text-xs text-rose-400 font-semibold"
                                  >
                                    <XCircle className="w-3.5 h-3.5 mr-2 text-rose-400" />
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
          <Card className="bg-slate-900 border-slate-800 text-slate-100 overflow-hidden">
            <CardContent className="p-0">
              {filteredJobs.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-slate-950/60 border-slate-800">
                      <TableRow className="border-slate-800 hover:bg-transparent">
                        <TableHead className="text-slate-400">Job Title & Category</TableHead>
                        <TableHead className="text-slate-400">Client</TableHead>
                        <TableHead className="text-slate-400">Location</TableHead>
                        <TableHead className="text-slate-400">Budget</TableHead>
                        <TableHead className="text-slate-400">Current Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredJobs.map((job) => (
                        <TableRow key={job.id} className="border-slate-800/80 hover:bg-slate-800/40">
                          <TableCell>
                            <div>
                              <Badge variant="outline" className="text-[10px] text-primary border-primary/30 mb-0.5">
                                {job.category}
                              </Badge>
                              <p className="font-bold text-xs text-white line-clamp-1">{job.title}</p>
                              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{job.description}</p>
                            </div>
                          </TableCell>

                          <TableCell className="text-xs text-slate-300">
                            <p className="font-medium text-white">{job.customerName}</p>
                            <p className="text-[11px] text-slate-500">{job.customerEmail}</p>
                          </TableCell>

                          <TableCell className="text-xs text-slate-300">
                            {job.location}
                          </TableCell>

                          <TableCell className="text-xs font-bold text-white">
                            {job.budget}
                          </TableCell>

                          <TableCell>
                            <Badge
                              className={`text-[10px] capitalize font-bold ${
                                job.status === "booked"
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : "bg-amber-500/20 text-amber-400 border-amber-500/30"
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
      </Tabs>
    </div>
  )
}
