import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Wrench,
  Zap,
  Sparkles,
  GraduationCap,
  Truck,
  Search,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Star,
  PlusCircle,
  Briefcase,
  Users,
  Check,
  ChevronRight,
  Shield,
  Award,
} from "lucide-react"

export const Landing: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchLocation, setSearchLocation] = useState("")
  const navigate = useNavigate()

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (searchLocation) params.set("loc", searchLocation)
    navigate(`/providers?${params.toString()}`)
  }

  // The 5 key requested service categories + rich metadata
  const serviceCategories = [
    {
      id: "plumbing",
      name: "Plumbing",
      description: "Leak repair, drain cleaning, pipe fitting, and water heaters.",
      icon: Wrench,
      accentColor: "from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/40",
      activePros: "140+ Pros",
      avgRate: "from $65/hr",
    },
    {
      id: "electrical",
      name: "Electrical",
      description: "Wiring, circuit breaker panels, lighting installation, EV chargers.",
      icon: Zap,
      accentColor: "from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40",
      activePros: "95+ Pros",
      avgRate: "from $75/hr",
    },
    {
      id: "cleaning",
      name: "Cleaning",
      description: "Deep house cleaning, move-in/move-out, and recurring maid service.",
      icon: Sparkles,
      accentColor: "from-emerald-500/20 to-teal-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40",
      activePros: "210+ Pros",
      avgRate: "from $45/hr",
    },
    {
      id: "tutoring",
      name: "Tutoring",
      description: "K-12 math, sciences, languages, test prep, and musical instruments.",
      icon: GraduationCap,
      accentColor: "from-purple-500/20 to-indigo-500/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-900/40",
      activePros: "80+ Pros",
      avgRate: "from $40/hr",
    },
    {
      id: "moving",
      name: "Moving",
      description: "Local hauling, heavy furniture moving, packing & loading assistance.",
      icon: Truck,
      accentColor: "from-rose-500/20 to-orange-500/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40",
      activePros: "65+ Pros",
      avgRate: "from $85/hr",
    },
  ]

  // How it works 3-step structured progression
  const howItWorksSteps = [
    {
      step: "01",
      title: "Tell Us What You Need",
      description: "Browse verified local trade pros or post your custom job request with scope, schedule, and photos in under 2 minutes.",
      icon: Search,
      highlight: "Quick & Free",
    },
    {
      step: "02",
      title: "Compare Quotes & Vetted Profiles",
      description: "Review transparent hourly and fixed-price bids, read verified client reviews, and check licensing & insurance credentials.",
      icon: Award,
      highlight: "100% Background Checked",
    },
    {
      step: "03",
      title: "Book & Pay with Confidence",
      description: "Confirm your appointment, communicate directly with your pro, and pay safely only after the service is completed to your satisfaction.",
      icon: ShieldCheck,
      highlight: "Satisfaction Guaranteed",
    },
  ]

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-6 md:pt-10 pb-6">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-primary/10 blur-[120px] rounded-full pointer-events-none -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl relative z-10">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15]">
            Book Verified Local Pros for Every{" "}
            <span className="relative inline-block text-primary">
              Home Project
              <svg
                className="absolute left-0 -bottom-2 w-full h-3 text-primary/30"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
              >
                <path d="M0,15 Q50,0 100,15" stroke="currentColor" strokeWidth="4" fill="none" />
              </svg>
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            From emergency repairs to scheduled maintenance and lessons. Connect with trusted, background-checked plumbers, electricians, cleaners, movers, and tutors in minutes.
          </p>

          {/* Primary Action CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/providers" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto gap-2.5 h-12 px-7 text-base font-semibold shadow-lg shadow-primary/25 rounded-xl">
                <Search className="w-4 h-4" />
                Find a Pro
              </Button>
            </Link>
            <Link to="/post-job" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2.5 h-12 px-7 text-base font-semibold rounded-xl border-border hover:bg-accent">
                <PlusCircle className="w-4 h-4 text-primary" />
                Post a Job
              </Button>
            </Link>
          </div>

          {/* Quick Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-10 mx-auto max-w-3xl bg-card border border-border/80 p-2 sm:p-2.5 rounded-2xl shadow-xl shadow-foreground/5 flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
              <Input
                placeholder="What service do you need? (e.g. Plumbing, Cleaning)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-none shadow-none focus-visible:ring-0 text-sm bg-transparent placeholder:text-muted-foreground"
              />
            </div>
            <div className="relative sm:w-56 border-t sm:border-t-0 sm:border-l border-border/80">
              <MapPin className="w-4 h-4 absolute left-3.5 top-3.5 text-muted-foreground" />
              <Input
                placeholder="City or Zip code"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                className="pl-10 h-11 border-none shadow-none focus-visible:ring-0 text-sm bg-transparent placeholder:text-muted-foreground"
              />
            </div>
            <Button type="submit" className="h-11 px-6 rounded-xl font-medium">
              Search
            </Button>
          </form>

          {/* Trust Value Badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <strong className="text-foreground">100% Verified</strong> Backgrounds
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <strong className="text-foreground">Same-Day</strong> Availability
            </span>
            <span className="flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <strong className="text-foreground">4.9/5</strong> Customer Satisfaction
            </span>
          </div>
        </div>
      </section>

      {/* 2. SERVICE CATEGORIES SECTION */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <Badge variant="outline" className="mb-2 text-primary border-primary/30">
              Popular Services
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Explore Top Service Categories
            </h2>
            <p className="text-muted-foreground mt-2 text-base">
              Direct access to top-rated, certified local trade specialists.
            </p>
          </div>
          <Link to="/providers">
            <Button variant="ghost" className="gap-2 text-primary font-semibold hover:text-primary">
              View All Categories <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* 5 Requested Categories as Clickable Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {serviceCategories.map((category) => (
            <Link
              key={category.id}
              to={`/providers?category=${category.name}`}
              className="group block"
            >
              <Card className="h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-primary/50 border-border bg-card flex flex-col justify-between overflow-hidden">
                <CardHeader className="pb-3">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.accentColor} border flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                  >
                    <category.icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                    {category.name}
                  </CardTitle>
                  <CardDescription className="text-xs leading-relaxed line-clamp-2">
                    {category.description}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="pt-2 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{category.avgRate}</span>
                  <span className="flex items-center gap-1 font-medium group-hover:text-primary transition-colors">
                    {category.activePros} <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. "HOW IT WORKS" 3-STEP SECTION */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-muted/30 rounded-3xl border border-border/80">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="outline" className="mb-2 text-primary border-primary/30">
            Simple 3-Step Process
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            How Home Services Hub Works
          </h2>
          <p className="text-muted-foreground mt-3 text-base">
            We make booking home repairs, maintenance, and learning as easy and safe as ordering dinner.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {howItWorksSteps.map((step, idx) => (
            <div
              key={step.step}
              className="relative rounded-2xl bg-card border border-border p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-extrabold text-primary/30 tracking-tight">
                    {step.step}
                  </span>
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                    <step.icon className="w-6 h-6" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-2.5">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-8 pt-4 border-t border-border/60">
                <Badge variant="secondary" className="text-xs font-semibold text-foreground bg-muted">
                  <Check className="w-3 h-3 text-emerald-500 mr-1.5" />
                  {step.highlight}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button below How it Works */}
        <div className="mt-12 text-center">
          <Link to="/post-job">
            <Button size="lg" className="gap-2 h-11 px-8 font-semibold rounded-xl">
              Get Started Now <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 4. JOIN AS A PRO CTA BANNER */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-primary/15 via-background to-card border border-primary/25 p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
          <div className="max-w-xl">
            <Badge className="mb-3 bg-primary text-primary-foreground">For Professionals</Badge>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Are you a skilled service technician or business owner?
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base mt-3 leading-relaxed">
              Grow your local business with zero upfront lead fees. Receive direct quote requests, schedule customer visits, and build your digital reputation.
            </p>
            <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Keep 90%+ of your earnings
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Direct customer payments
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Automated calendar dispatch
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Verified badge for licensed pros
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto min-w-[200px]">
            <Link to="/register" className="w-full">
              <Button size="lg" className="w-full h-12 text-base font-semibold shadow-md shadow-primary/20 rounded-xl">
                Join as a Service Pro
              </Button>
            </Link>
            <Link to="/login" className="w-full">
              <Button size="lg" variant="outline" className="w-full h-12 text-base font-medium rounded-xl">
                Provider Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
