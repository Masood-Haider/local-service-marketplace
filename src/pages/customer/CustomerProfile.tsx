import React from "react"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import { User, Save } from "lucide-react"

export const CustomerProfile: React.FC = () => {
  const { currentUser } = useAuth()
  const { success } = useToast()

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    success("Profile updated successfully!")
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <PageHeader
        title="Customer Profile & Preferences"
        description="Manage your contact details, service addresses, and notification preferences."
      />

      <form onSubmit={handleSave}>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  {currentUser?.name?.[0]?.toUpperCase() || "C"}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and service address</CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Full Name</label>
                <Input defaultValue={currentUser?.name || "Customer User"} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input defaultValue={currentUser?.email || "customer@example.com"} disabled />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Primary Service Address</label>
              <Input placeholder="123 Main Street, Apt 4B" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">City & State</label>
                <Input placeholder="San Francisco, CA" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Phone Number</label>
                <Input placeholder="(555) 000-0000" />
              </div>
            </div>
          </CardContent>

          <CardFooter className="border-t border-border/60 pt-4 flex justify-end">
            <Button type="submit" className="gap-2">
              <Save className="w-4 h-4" /> Save Profile
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
