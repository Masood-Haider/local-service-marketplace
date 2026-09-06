import React, { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"
import {
  getProviderProfile,
  saveProviderServices,
  updateProviderPriceRange,
  ProviderProfile,
  ProviderServiceItem,
} from "@/services/providerService"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { EmptyState } from "@/components/shared/EmptyState"
import {
  PlusCircle,
  Wrench,
  Trash2,
  Edit3,
  DollarSign,
  Loader2,
  CheckCircle2,
  Tag,
  Save,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react"
import { Link } from "react-router-dom"

const RATE_TYPE_OPTIONS = [
  { label: "Standard", value: "Standard" },
  { label: "Hourly", value: "Hourly" },
  { label: "Per Visit", value: "Per Visit" },
  { label: "Flat Rate", value: "Flat Rate" },
  { label: "Inspection", value: "Inspection" },
  { label: "Emergency", value: "Emergency" },
]

export const ProviderServices: React.FC = () => {
  const { currentUser } = useAuth()
  const [profile, setProfile] = useState<ProviderProfile | null>(null)
  const [services, setServices] = useState<ProviderServiceItem[]>([])
  const [basePriceRange, setBasePriceRange] = useState("")
  const [loading, setLoading] = useState(true)
  const [savingBaseRate, setSavingBaseRate] = useState(false)

  // Dialog State (Add / Edit)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [serviceName, setServiceName] = useState("")
  const [servicePrice, setServicePrice] = useState("")
  const [serviceRateType, setServiceRateType] = useState("Standard")
  const [serviceDescription, setServiceDescription] = useState("")
  const [savingService, setSavingService] = useState(false)

  // Load provider profile
  useEffect(() => {
    async function loadData() {
      if (!currentUser?.uid) return
      try {
        const data = await getProviderProfile(currentUser.uid)
        setProfile(data)
        if (data) {
          setBasePriceRange(data.priceRange || "$50 - $120/hr")
          if (data.services && data.services.length > 0) {
            setServices(data.services)
          } else {
            // Provide sensible defaults if not yet customized
            const defaults: ProviderServiceItem[] = [
              {
                id: "default-1",
                name: "General Diagnostic & Inspection",
                price: "$75 / visit",
                rateType: "Inspection",
                description: "On-site troubleshooting, diagnostic evaluation, and written repair recommendations.",
              },
              {
                id: "default-2",
                name: "Standard Labor & Service Call",
                price: "$95 / hr",
                rateType: "Hourly",
                description: "Active maintenance, repairs, installations, and material fitting.",
              },
            ]
            setServices(defaults)
          }
        }
      } catch (err: any) {
        console.error("Failed to load provider profile:", err)
        toast.error("Could not load services", { description: err.message })
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [currentUser?.uid])

  // Open modal for Adding
  const handleOpenAddModal = () => {
    setEditingId(null)
    setServiceName("")
    setServicePrice("")
    setServiceRateType("Standard")
    setServiceDescription("")
    setModalOpen(true)
  }

  // Open modal for Editing
  const handleOpenEditModal = (item: ProviderServiceItem) => {
    setEditingId(item.id)
    setServiceName(item.name)
    setServicePrice(item.price)
    setServiceRateType(item.rateType || "Standard")
    setServiceDescription(item.description)
    setModalOpen(true)
  }

  // Save base display rate
  const handleSaveBaseRate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser?.uid || !basePriceRange.trim()) return

    setSavingBaseRate(true)
    try {
      await updateProviderPriceRange(currentUser.uid, basePriceRange.trim())
      toast.success("Base rate updated!", {
        description: `Your display price range is now set to "${basePriceRange.trim()}".`,
      })
    } catch (err: any) {
      console.error("Error updating base rate:", err)
      toast.error("Failed to update base rate", { description: err.message })
    } finally {
      setSavingBaseRate(false)
    }
  }

  // Save Service item (Add or Edit)
  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser?.uid) return

    if (!serviceName.trim() || !servicePrice.trim()) {
      toast.error("Please fill in both the service name and price")
      return
    }

    setSavingService(true)
    try {
      let updatedList: ProviderServiceItem[] = []

      if (editingId) {
        // Edit existing
        updatedList = services.map((s) =>
          s.id === editingId
            ? {
                ...s,
                name: serviceName.trim(),
                price: servicePrice.trim(),
                rateType: serviceRateType,
                description: serviceDescription.trim(),
              }
            : s
        )
      } else {
        // Add new
        const newItem: ProviderServiceItem = {
          id: `srv-${Date.now()}`,
          name: serviceName.trim(),
          price: servicePrice.trim(),
          rateType: serviceRateType,
          description: serviceDescription.trim(),
        }
        updatedList = [...services, newItem]
      }

      await saveProviderServices(currentUser.uid, updatedList)
      setServices(updatedList)
      toast.success(editingId ? "Service updated successfully!" : "New service offering added!")
      setModalOpen(false)
    } catch (err: any) {
      console.error("Failed to save service:", err)
      toast.error("Could not save service", { description: err.message })
    } finally {
      setSavingService(false)
    }
  }

  // Delete Service item
  const handleDeleteService = async (id: string, name: string) => {
    if (!currentUser?.uid) return
    if (!window.confirm(`Are you sure you want to delete "${name}" from your services?`)) {
      return
    }

    const updatedList = services.filter((s) => s.id !== id)
    try {
      await saveProviderServices(currentUser.uid, updatedList)
      setServices(updatedList)
      toast.success("Service removed", {
        description: `"${name}" was deleted from your pricing matrix.`,
      })
    } catch (err: any) {
      console.error("Error deleting service:", err)
      toast.error("Could not delete service", { description: err.message })
    }
  }

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-muted-foreground">Loading services & pricing...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      <PageHeader
        title="Services & Pricing Matrix"
        description="Configure your transparent service packages, hourly rates, and standard pricing menu displayed on your public profile."
        action={
          <Button onClick={handleOpenAddModal} className="gap-2 shadow-sm">
            <PlusCircle className="w-4 h-4" /> Add Service Offering
          </Button>
        }
      />

      {/* General Display Rate / Hourly Bracket Card */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-primary" />
            General Display Rate & Hourly Bracket
          </CardTitle>
          <CardDescription>
            This price range appears on your search directory badge and profile header (e.g. "$50 - $120/hr" or "$85/hr standard").
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveBaseRate} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <DollarSign className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={basePriceRange}
                onChange={(e) => setBasePriceRange(e.target.value)}
                placeholder="e.g. $60 - $120/hr or $75 flat"
                className="pl-9 font-semibold"
                required
              />
            </div>
            <Button type="submit" disabled={savingBaseRate} className="gap-1.5 shrink-0">
              {savingBaseRate ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Save Rate
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Configured Service Offerings List */}
      <Card className="border-border">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Itemized Service Packages & Prices</CardTitle>
              <Badge variant="outline" className="text-xs font-semibold">
                {services.length} Offering{services.length === 1 ? "" : "s"}
              </Badge>
            </div>
            <CardDescription className="mt-1">
              Customers review these clear prices when deciding to request a quote or book appointments.
            </CardDescription>
          </div>
          <Button onClick={handleOpenAddModal} size="sm" variant="outline" className="gap-1.5 text-xs shrink-0 self-start sm:self-center">
            <PlusCircle className="w-3.5 h-3.5 text-primary" /> Add New Service
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {services.length > 0 ? (
            <div className="space-y-3">
              {services.map((item) => (
                <div
                  key={item.id}
                  className="border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card hover:bg-muted/20 hover:border-primary/30 transition-all shadow-2xs"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary mt-0.5 shrink-0">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-foreground">{item.name}</h4>
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-semibold uppercase tracking-wider py-0 px-2"
                        >
                          {item.rateType || "Standard"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-xl">
                        {item.description || "No specific details added."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="font-black text-base text-emerald-600 dark:text-emerald-400">
                      {item.price}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={() => handleOpenEditModal(item)}
                        title="Edit Service & Price"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteService(item.id, item.name)}
                        title="Delete Service"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Wrench}
              title="No Service Offerings Configured"
              description="Add your first service package and price (e.g. Diagnostic Visit, Hourly Labor, Fixture Install) so customers can see your transparent rates."
              action={
                <Button onClick={handleOpenAddModal} className="gap-2">
                  <PlusCircle className="w-4 h-4" /> Add First Service
                </Button>
              }
            />
          )}
        </CardContent>
        {currentUser?.uid && (
          <CardFooter className="border-t border-border/60 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-muted-foreground bg-muted/10">
            <span>Changes made here are instantly synced to your public profile.</span>
            <Link to={`/providers/${currentUser.uid}`}>
              <Button variant="link" size="sm" className="text-xs h-auto p-0 gap-1 text-primary">
                Preview Public Profile <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </CardFooter>
        )}
      </Card>

      {/* Add / Edit Service Modal Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {editingId ? "Edit Service Offering" : "Add New Service Offering"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the price, description, or title of this service offering."
                : "Add a specific service package and rate for prospective customers."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveService} className="space-y-4 py-2">
            {/* Service Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Service Name *
              </label>
              <Input
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                placeholder="e.g. Water Heater Flush & Diagnostic"
                required
              />
            </div>

            {/* Price and Rate Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Price / Rate *
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    placeholder="e.g. $85 / visit, $95 / hr"
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Pricing Model
                </label>
                <select
                  value={serviceRateType}
                  onChange={(e) => setServiceRateType(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {RATE_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-background text-foreground">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Service Description & Scope
              </label>
              <textarea
                value={serviceDescription}
                onChange={(e) => setServiceDescription(e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="Describe what is included in this service (e.g. On-site troubleshooting, diagnostic report, standard labor)..."
              />
            </div>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={savingService}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={savingService} className="gap-1.5">
                {savingService ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    {editingId ? "Save Changes" : "Add Offering"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
