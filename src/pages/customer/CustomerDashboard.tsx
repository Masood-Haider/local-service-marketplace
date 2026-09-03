import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import {
  listenToCustomerJobs,
  listenToCustomerBookings,
  getBookingStatusBadge,
  Job,
  Booking,
} from "@/services/jobService"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/EmptyState"
import {
  Calendar,
  PlusCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Briefcase,
  Loader2,
} from "lucide-react"

export const CustomerDashboard: React.FC = () => {
  const { currentUser } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentUser?.uid) return

    const unsubJobs = listenToCustomerJobs(currentUser.uid, (data) => {
      setJobs(data)
      setLoading(false)
    })

    const unsubBookings = listenToCustomerBookings(currentUser.uid, (data) => {
      setBookings(data)
    })

    return () => {
      unsubJobs()
      unsubBookings()
    }
  }, [currentUser?.uid])

  const openJobs = jobs.filter((j) => j.status === "open")

  return (
    <div className="space-y-8 pb-12">
      <PageHeader
        title="Customer Hub"
        description="Monitor your active service requests, review incoming proposals, and track booked appointments."
        action={
          <Link to="/post-job">
            <Button className="gap-2 shadow-sm shadow-primary/20">
              <PlusCircle className="w-4 h-4" />
              Post New Request
            </Button>
          </Link>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Bookings</CardTitle>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Confirmed appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open Job Posts</CardTitle>
            <Clock className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openJobs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Receiving pro quotes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Requests</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime postings</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Confirmed Bookings Section */}
      {bookings.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">Upcoming Service Appointments</h3>
              <Badge variant="outline" className="text-xs">
                {bookings.length} Appointment{bookings.length === 1 ? "" : "s"}
              </Badge>
            </div>
            <Link to="/dashboard/customer/bookings">
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                View All Bookings <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.slice(0, 4).map((booking) => {
              const statusInfo = getBookingStatusBadge(booking.status)

              return (
                <Card key={booking.id} className="border-border hover:shadow-xs transition-shadow">
                  <CardHeader className="pb-2 flex flex-row items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px] text-primary">
                          {booking.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">Pro: {booking.providerName}</span>
                      </div>
                      <CardTitle className="text-base font-bold line-clamp-1">{booking.jobTitle}</CardTitle>
                    </div>
                    <Badge className={statusInfo.className}>
                      {statusInfo.label}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary" /> {booking.scheduledDate} {booking.scheduledTime && `(${booking.scheduledTime})`}
                      </span>
                      <span className="font-bold text-foreground">{booking.price}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-muted-foreground flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin className="w-3 h-3 text-primary shrink-0" /> {booking.location}
                      </span>
                      <Link to={`/dashboard/customer/jobs/${booking.jobId}`}>
                        <Button variant="link" size="sm" className="text-xs h-6 p-0">
                          Job Details →
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Active Service Requests List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">My Service Requests</h3>
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time bids and status tracking
            </p>
          </div>
          <Badge variant="outline" className="text-xs">
            {jobs.length} Total
          </Badge>
        </div>

        {jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job) => {
              const isBooked = job.status === "booked"

              return (
                <Card key={job.id} className="hover:shadow-md transition-shadow border-border flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge
                            variant={isBooked ? "default" : "secondary"}
                            className={`text-[10px] uppercase font-bold ${
                              isBooked ? "bg-emerald-600 text-white" : "bg-primary/10 text-primary"
                            }`}
                          >
                            {isBooked ? "Booked" : "Open for quotes"}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-semibold text-primary border-primary/30">
                            {job.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg font-bold leading-tight line-clamp-1">{job.title}</CardTitle>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                          Budget
                        </span>
                        <span className="font-bold text-sm text-foreground">
                          {isBooked ? job.bookedPrice || job.budget : job.budget}
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 pt-0">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {job.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t border-border/60">
                      <span className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> {job.location}
                      </span>
                      <span className="flex items-center gap-1.5 shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-primary" /> {job.preferredDate}
                      </span>
                    </div>
                  </CardContent>

                  <CardFooter className="border-t border-border/60 pt-3.5 flex items-center justify-between bg-muted/20">
                    <span className="text-xs text-muted-foreground">
                      {isBooked ? "Provider confirmed" : "Quotes appear in real-time"}
                    </span>
                    <Link to={`/dashboard/customer/jobs/${job.id}`}>
                      <Button size="sm" className="gap-1.5 text-xs h-8">
                        View Quotes & Details <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        ) : (
          <EmptyState
            title="No Service Requests Yet"
            description="Post your first home project or repair request to receive free bids from certified local pros."
            action={
              <Link to="/post-job">
                <Button className="gap-2">
                  <PlusCircle className="w-4 h-4" /> Post First Job
                </Button>
              </Link>
            }
          />
        )}
      </div>
    </div>
  )
}
