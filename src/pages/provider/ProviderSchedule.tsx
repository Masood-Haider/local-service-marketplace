import React, { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import {
  listenToProviderBookings,
  updateBookingStatus,
  getBookingStatusBadge,
  Booking,
  BookingStatus,
} from "@/services/jobService"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EmptyState } from "@/components/shared/EmptyState"
import {
  Calendar as CalendarIcon,
  Clock,
  Settings2,
  MapPin,
  CheckCircle2,
  DollarSign,
  User,
  Loader2,
  MoreVertical,
  PlayCircle,
  CheckCheck,
  XCircle,
  LayoutGrid,
  List,
} from "lucide-react"

export const ProviderSchedule: React.FC = () => {
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    if (!currentUser?.uid) return

    const unsubscribe = listenToProviderBookings(currentUser.uid, (data) => {
      setBookings(data)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [currentUser?.uid])

  const handleUpdateStatus = async (bookingId: string, newStatus: BookingStatus) => {
    setUpdatingId(bookingId)
    try {
      await updateBookingStatus(bookingId, newStatus)
      toast.success("Booking status updated", {
        description: `Status changed to ${newStatus.replace("_", " ")}.`,
      })
    } catch (err: any) {
      toast.error("Failed to update status", { description: err.message })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Schedule & Booked Appointments"
        description="View your confirmed dispatches, update service progress in real time, and manage customer appointments."
        action={
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex border border-border rounded-lg p-0.5 bg-muted/30">
              <Button
                variant={viewMode === "cards" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={() => setViewMode("cards")}
              >
                <LayoutGrid className="w-3.5 h-3.5 mr-1" /> Cards
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                className="h-8 px-2.5 text-xs"
                onClick={() => setViewMode("table")}
              >
                <List className="w-3.5 h-3.5 mr-1" /> Table
              </Button>
            </div>
            <Button variant="outline" className="gap-2 text-xs">
              <Settings2 className="w-4 h-4" /> Working Hours
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-7 h-7 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading dispatches...</p>
        </div>
      ) : bookings.length > 0 ? (
        viewMode === "cards" ? (
          /* Cards View with Status Dropdown */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookings.map((booking) => {
              const statusInfo = getBookingStatusBadge(booking.status)

              return (
                <Card key={booking.id} className="hover:shadow-md transition-shadow border-border flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="text-[10px] font-semibold text-primary mb-1">
                          {booking.category}
                        </Badge>
                        <CardTitle className="text-lg font-bold line-clamp-1">{booking.jobTitle}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          Client: <strong className="text-foreground">{booking.customerName}</strong>
                        </CardDescription>
                      </div>

                      <Badge className={statusInfo.className}>
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-1">
                    <div className="p-3 rounded-lg bg-muted/40 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Service Date:</span>
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                          {booking.scheduledDate}
                        </span>
                      </div>
                      {booking.scheduledTime && (
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Arrival Window:</span>
                          <span className="font-semibold text-foreground flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                            {booking.scheduledTime}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-1 border-t border-border/60">
                        <span className="text-muted-foreground">Agreed Price:</span>
                        <span className="font-bold text-base text-foreground">{booking.price}</span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="truncate">{booking.location}</span>
                    </p>
                  </CardContent>

                  <CardFooter className="border-t border-border/60 pt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Client email: <span className="font-mono text-[11px]">{booking.customerEmail}</span>
                    </span>

                    {/* Provider Status Update Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs"
                          disabled={updatingId === booking.id}
                        >
                          Update Status <MoreVertical className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Update Progress</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                          className="cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-blue-500" />
                          Mark as Confirmed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(booking.id, "in_progress")}
                          className="cursor-pointer"
                        >
                          <PlayCircle className="w-3.5 h-3.5 mr-2 text-purple-500" />
                          Mark as In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(booking.id, "completed")}
                          className="cursor-pointer font-semibold text-emerald-600 focus:text-emerald-600"
                        >
                          <CheckCheck className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                          Mark as Completed
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                          className="cursor-pointer text-rose-500 focus:text-rose-500"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-2 text-rose-500" />
                          Mark as Cancelled
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          /* Table View with Status Dropdown */
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Appointments Table</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Project / Job</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Scheduled Slot</TableHead>
                      <TableHead>Agreed Price</TableHead>
                      <TableHead>Current Status</TableHead>
                      <TableHead className="text-right">Change Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => {
                      const statusInfo = getBookingStatusBadge(booking.status)

                      return (
                        <TableRow key={booking.id} className="hover:bg-muted/30">
                          <TableCell className="font-semibold text-foreground">
                            <div>
                              <p className="line-clamp-1">{booking.jobTitle}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-primary shrink-0" />
                                <span className="truncate max-w-[180px]">{booking.location}</span>
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm text-foreground">{booking.customerName}</p>
                              <p className="text-xs text-muted-foreground">{booking.customerEmail}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            <p className="font-medium">{booking.scheduledDate}</p>
                            {booking.scheduledTime && (
                              <p className="text-xs text-muted-foreground">{booking.scheduledTime}</p>
                            )}
                          </TableCell>
                          <TableCell className="font-bold text-foreground">{booking.price}</TableCell>
                          <TableCell>
                            <Badge className={statusInfo.className}>
                              {statusInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1 text-xs"
                                  disabled={updatingId === booking.id}
                                >
                                  Update <MoreVertical className="w-3 h-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Update Progress</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                                  className="cursor-pointer"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-blue-500" />
                                  Mark as Confirmed
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(booking.id, "in_progress")}
                                  className="cursor-pointer"
                                >
                                  <PlayCircle className="w-3.5 h-3.5 mr-2 text-purple-500" />
                                  Mark as In Progress
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(booking.id, "completed")}
                                  className="cursor-pointer font-semibold text-emerald-600 focus:text-emerald-600"
                                >
                                  <CheckCheck className="w-3.5 h-3.5 mr-2 text-emerald-600" />
                                  Mark as Completed
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                                  className="cursor-pointer text-rose-500 focus:text-rose-500"
                                >
                                  <XCircle className="w-3.5 h-3.5 mr-2 text-rose-500" />
                                  Mark as Cancelled
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
            </CardContent>
          </Card>
        )
      ) : (
        <EmptyState
          icon={CalendarIcon}
          title="No Confirmed Dispatches Yet"
          description="When customers accept your price quotes and schedule a time slot, your booked dispatches will appear here."
        />
      )}
    </div>
  )
}
