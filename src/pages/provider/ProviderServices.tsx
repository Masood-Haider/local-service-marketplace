import React from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Wrench, Trash2 } from "lucide-react"

export const ProviderServices: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        title="Services & Pricing Matrix"
        description="Configure the trades, service packages, and hourly rates displayed on your public profile."
        action={
          <Button className="gap-2">
            <PlusCircle className="w-4 h-4" /> Add Service Offering
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Configured Service Offerings</CardTitle>
          <CardDescription>Customers will be able to book these services directly</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-primary/10 text-primary mt-0.5">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">General Diagnostic & Inspection</h4>
                  <Badge variant="secondary">Standard</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  On-site troubleshooting, diagnostic report, and repair estimate.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 self-end sm:self-center">
              <span className="font-bold text-sm">$75 / visit</span>
              <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="border border-border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/20">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-md bg-primary/10 text-primary mt-0.5">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-sm">Hourly Labor & Repair</h4>
                  <Badge variant="secondary">Hourly</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Active installation, repair, and pipe/fixture fittings.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 self-end sm:self-center">
              <span className="font-bold text-sm">$95 / hr</span>
              <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
