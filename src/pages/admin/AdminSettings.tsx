import React, { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import {
  fetchPlatformSettings,
  savePlatformSettings,
  PlatformSettings,
} from "@/services/adminService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DollarSign,
  Mail,
  Power,
  Save,
  Loader2,
  Server,
  Sparkles,
  Database,
} from "lucide-react"
import { seedMarketplaceData } from "@/services/seedService"

export const AdminSettings: React.FC = () => {
  const { currentUser } = useAuth()
  const { toast } = useToast()

  const [settings, setSettings] = useState<PlatformSettings>({
    platformFeePercent: 12.5,
    supportEmail: "support@homeserviceshub.local",
    emergencyPhone: "+1 (800) 555-0199",
    maintenanceMode: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchPlatformSettings()
        setSettings(data)
      } catch (err: any) {
        toast.error("Failed to load settings", { description: err.message })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await savePlatformSettings(settings)
      toast.success("Platform settings updated successfully!")
    } catch (err: any) {
      toast.error("Failed to save settings", { description: err.message })
    } finally {
      setSaving(false)
    }
  }

  const [seeding, setSeeding] = useState(false)
  const [seedProgress, setSeedProgress] = useState("")

  const handleSeedDatabase = async () => {
    setSeeding(true)
    setSeedProgress("Initializing database seeding...")
    try {
      const stats = await seedMarketplaceData((msg) => setSeedProgress(msg))
      toast.success("Demo database populated successfully!", {
        description: `Created ${stats.providersCount} providers, ${stats.jobsCount} jobs, ${stats.bookingsCount} bookings, and ${stats.reviewsCount} reviews.`,
      })
      setSeedProgress("Database seeded successfully!")
    } catch (err: any) {
      toast.error("Failed to seed database", { description: err.message })
      setSeedProgress("")
    } finally {
      setSeeding(false)
    }
  }

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Platform Configuration & Admin Profile
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Adjust marketplace commission take-rates, emergency support channels, and administrator security.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Admin Profile Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border border-amber-500/40">
                <AvatarFallback className="bg-amber-500 text-slate-950 font-bold text-base">
                  {currentUser?.name?.[0]?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg text-slate-900 dark:text-white">{currentUser?.name || "Administrator"}</CardTitle>
                  <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px] font-bold">
                    Superadmin
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                  {currentUser?.email} • UID: <span className="font-mono">{currentUser?.uid}</span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 2. Platform Commission & Financials */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-500" />
              <CardTitle className="text-base text-slate-900 dark:text-white">Marketplace Take Rate & Commission</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Percentage deducted from accepted job bookings to fund platform escrow and insurance guarantees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Standard Platform Fee (%) *
                </label>
                <div className="relative">
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="50"
                    value={settings.platformFeePercent}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        platformFeePercent: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white h-10 pr-8"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs flex flex-col justify-center">
                <span className="text-slate-500 dark:text-slate-400">Sample Earnings Preview:</span>
                <span className="text-slate-800 dark:text-slate-200 mt-0.5">
                  On a <strong>$200</strong> job, provider earns <strong>${Math.round(200 * (1 - settings.platformFeePercent / 100))}</strong> and platform receives <strong>${Math.round(200 * (settings.platformFeePercent / 100))}</strong>.
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Operational Support Channels */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-base text-slate-900 dark:text-white">Support & Emergency Dispatch Channels</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Contact routes displayed on customer invoices and provider work orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Support Email Address *
                </label>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) =>
                    setSettings({ ...settings, supportEmail: e.target.value })
                  }
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white h-10"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  24/7 Hotline Phone *
                </label>
                <Input
                  type="tel"
                  value={settings.emergencyPhone}
                  onChange={(e) =>
                    setSettings({ ...settings, emergencyPhone: e.target.value })
                  }
                  className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white h-10"
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 4. Demo Data Seeder */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-500" />
              <CardTitle className="text-base text-slate-900 dark:text-white">Demo Data Seeder</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Populate Firestore with 12+ realistic service providers across all categories, sample jobs, bookings, and customer reviews.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Realistic Marketplace Mock Data</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg">
                  Instantly sets up providers for Plumbing, Electrical, Cleaning, Tutoring, Moving, HVAC, Carpentry, Painting, Handyman, Landscaping, Roofing, and Pest Control with portfolios, ratings, and quotes.
                </p>
                {seedProgress && (
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 pt-1">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" /> {seedProgress}
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSeedDatabase}
                disabled={seeding}
                className="gap-2 text-xs font-bold shrink-0 bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 hover:text-amber-900 dark:hover:text-white h-9 px-4"
              >
                {seeding ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Seeding Database...
                  </>
                ) : (
                  <>
                    <Database className="w-3.5 h-3.5 text-amber-500" /> Seed Sample Demo Data
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 5. Platform System & Maintenance Mode */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Power className="w-5 h-5 text-rose-500" />
              <CardTitle className="text-base text-slate-900 dark:text-white">System Maintenance & Status</CardTitle>
            </div>
            <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
              Control marketplace operational availability and scheduled maintenance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Maintenance Mode</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  When active, only administrators can post jobs or submit bids.
                </p>
              </div>

              <Button
                type="button"
                variant={settings.maintenanceMode ? "destructive" : "outline"}
                size="sm"
                onClick={() =>
                  setSettings({
                    ...settings,
                    maintenanceMode: !settings.maintenanceMode,
                  })
                }
                className="gap-1.5 text-xs font-semibold"
              >
                <Power className="w-3.5 h-3.5" />
                {settings.maintenanceMode ? "Enabled (Offline)" : "Disabled (Online)"}
              </Button>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-emerald-500" /> Firestore Database Connected
              </span>
              <span>Platform Build v1.4.2</span>
            </div>
          </CardContent>

          <CardFooter className="border-t border-slate-100 dark:border-slate-800 pt-4 flex justify-end">
            <Button
              type="submit"
              className="h-10 px-6 gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-sm"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Platform Settings
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
