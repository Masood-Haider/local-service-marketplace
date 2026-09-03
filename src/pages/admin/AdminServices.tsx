import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Wrench, Zap, Sparkles, Home } from "lucide-react"

export const AdminServices: React.FC = () => {
  const serviceCategories = [
    { name: "Plumbing & Heating", slug: "plumbing", providersCount: 0, status: "Active", icon: Wrench },
    { name: "Electrical & Lighting", slug: "electrical", providersCount: 0, status: "Active", icon: Zap },
    { name: "House Cleaning & Maid Services", slug: "cleaning", providersCount: 0, status: "Active", icon: Sparkles },
    { name: "HVAC & Air Conditioning", slug: "hvac", providersCount: 0, status: "Active", icon: Home },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Service Categories & Taxonomy</h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure marketplace categories, keyword tags, and service definitions.
          </p>
        </div>
        <Button className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold gap-2">
          <PlusCircle className="w-4 h-4" /> Add Category
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {serviceCategories.map((cat) => (
          <div key={cat.slug} className="rounded-xl border border-slate-800 bg-slate-900 p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-slate-800 text-amber-400">
                <cat.icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-sm">{cat.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">/{cat.slug} • {cat.providersCount} providers</p>
              </div>
            </div>
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30">
              {cat.status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}
