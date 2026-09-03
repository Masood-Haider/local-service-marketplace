import React from "react"
import { Link } from "react-router-dom"
import { Wrench, ShieldCheck, Heart } from "lucide-react"

export const Footer: React.FC = () => {
  const popularCategories = [
    { name: "Plumbing", href: "/providers?category=Plumbing" },
    { name: "Electrical", href: "/providers?category=Electrical" },
    { name: "Cleaning", href: "/providers?category=Cleaning" },
    { name: "Tutoring", href: "/providers?category=Tutoring" },
    { name: "Moving", href: "/providers?category=Moving" },
  ]

  return (
    <footer className="border-t border-border bg-card/60 backdrop-blur">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-primary">
              <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-foreground tracking-tight">HomeServices<span className="text-primary">Hub</span></span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Your premier local services marketplace connecting homeowners with verified, background-checked trade professionals. Transparent pricing and satisfaction guaranteed.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Pros • Licensed & Insured
            </div>
          </div>

          {/* Popular Categories */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Top Services
            </h5>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {popularCategories.map((cat) => (
                <li key={cat.name}>
                  <Link to={cat.href} className="hover:text-primary transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer & Marketplace Links */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Explore
            </h5>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/providers" className="hover:text-primary transition-colors">
                  Find a Local Pro
                </Link>
              </li>
              <li>
                <Link to="/post-job" className="hover:text-primary transition-colors">
                  Post a Job Request
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary transition-colors">
                  Join as a Pro
                </Link>
              </li>
              <li>
                <Link to="/dashboard/customer" className="hover:text-primary transition-colors">
                  Customer Portal
                </Link>
              </li>
              <li>
                <Link to="/dashboard/provider" className="hover:text-primary transition-colors">
                  Provider Hub
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-foreground mb-4">
              Account & Legal
            </h5>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <Link to="/login" className="hover:text-primary transition-colors">
                  Account Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-primary transition-colors">
                  Create an Account
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-primary transition-colors">
                  Admin Console
                </Link>
              </li>
              <li>
                <span className="hover:text-primary cursor-pointer transition-colors">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-primary cursor-pointer transition-colors">
                  Terms of Service
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} Home Services Hub Inc. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for local communities with quality craftsmanship.
          </p>
        </div>
      </div>
    </footer>
  )
}
