import React, { useState, useEffect } from "react"
import {
  fetchAdminUsers,
  updateUserDisabledStatus,
  deleteUserDocument,
  AdminUser,
} from "@/services/adminService"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Users,
  Search,
  UserX,
  UserCheck,
  Trash2,
  RefreshCw,
  Loader2,
  Shield,
  Briefcase,
  User,
  AlertTriangle,
} from "lucide-react"

export const AdminUsers: React.FC = () => {
  const { toast } = useToast()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [updatingUid, setUpdatingUid] = useState<string | null>(null)

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadUsers = async () => {
    setLoading(true)
    try {
      const data = await fetchAdminUsers()
      setUsers(data)
    } catch (err: any) {
      toast.error("Failed to load users", { description: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleToggleDisabled = async (user: AdminUser) => {
    setUpdatingUid(user.uid)
    const newDisabledState = !user.disabled
    try {
      await updateUserDisabledStatus(user.uid, newDisabledState)
      setUsers((prev) =>
        prev.map((u) => (u.uid === user.uid ? { ...u, disabled: newDisabledState } : u))
      )
      toast.success(
        newDisabledState ? `Account disabled: ${user.name}` : `Account enabled: ${user.name}`
      )
    } catch (err: any) {
      toast.error("Status update failed", { description: err.message })
    } finally {
      setUpdatingUid(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteUserDocument(deleteTarget.uid)
      setUsers((prev) => prev.filter((u) => u.uid !== deleteTarget.uid))
      toast.success(`User removed: ${deleteTarget.name}`)
      setDeleteTarget(null)
    } catch (err: any) {
      toast.error("Failed to delete user", { description: err.message })
    } finally {
      setDeleting(false)
    }
  }

  // Filtering
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || u.role === roleFilter

    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold gap-1 text-[11px]">
            <Shield className="w-3 h-3" /> Admin
          </Badge>
        )
      case "provider":
        return (
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 font-semibold gap-1 text-[11px]">
            <Briefcase className="w-3 h-3" /> Provider
          </Badge>
        )
      default:
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 font-semibold gap-1 text-[11px]">
            <User className="w-3 h-3" /> Customer
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            User Accounts Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search, moderate credentials, and adjust permissions for customer, provider, and administrator accounts.
          </p>
        </div>

        <Button
          onClick={loadUsers}
          variant="outline"
          size="sm"
          className="gap-2 text-xs bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh List
        </Button>
      </div>

      {/* Filter and Search Controls */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
            <Input
              placeholder="Search users by name or email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs"
            />
          </div>

          <div className="w-full sm:w-48">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="h-10 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs">
                <SelectValue placeholder="Filter by Role" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200">
                <SelectItem value="all">All Roles ({users.length})</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="provider">Service Providers</SelectItem>
                <SelectItem value="admin">Administrators</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs overflow-hidden">
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-white">Registered Accounts</CardTitle>
            <Badge variant="outline" className="text-xs text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
              Showing {filteredUsers.length} of {users.length} Users
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-2">
              <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Loading user records from Firestore...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800">
                  <TableRow className="border-slate-200 dark:border-slate-800 hover:bg-transparent">
                    <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">User Profile</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Email Address</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Assigned Role</TableHead>
                    <TableHead className="text-slate-600 dark:text-slate-400 font-semibold">Account Status</TableHead>
                    <TableHead className="text-right text-slate-600 dark:text-slate-400 font-semibold">Moderation Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.uid} className="border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 border border-slate-200 dark:border-slate-700">
                            <AvatarImage src={user.photoURL || undefined} alt={user.name} />
                            <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs">
                              {user.name?.[0]?.toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-xs text-slate-900 dark:text-white">{user.name || "Anonymous User"}</p>
                            <p className="text-[10px] text-slate-500 font-mono">UID: {user.uid.slice(0, 10)}...</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="text-xs text-slate-700 dark:text-slate-300 font-mono">
                        {user.email}
                      </TableCell>

                      <TableCell>{getRoleBadge(user.role)}</TableCell>

                      <TableCell>
                        {user.disabled ? (
                          <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 text-[10px]">
                            Suspended / Disabled
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">
                            Active Account
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleDisabled(user)}
                          disabled={updatingUid === user.uid}
                          className={`h-7 px-2.5 text-xs ${
                            user.disabled
                              ? "text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              : "text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-800/40 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                          }`}
                        >
                          {user.disabled ? (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" /> Re-enable
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3 mr-1" /> Suspend
                            </>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteTarget(user)}
                          className="h-7 px-2.5 text-xs text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                        >
                          <Trash2 className="w-3 h-3 mr-1" /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12">
              <EmptyState
                icon={Users}
                title="No Users Found"
                description="No user accounts match your search or role filter criteria."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete User Confirmation Modal */}
      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[420px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
          <DialogHeader>
            <div className="flex items-center gap-2 text-rose-500 mb-1">
              <AlertTriangle className="w-5 h-5" />
              <DialogTitle className="text-lg text-slate-900 dark:text-white">Delete User Document?</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to permanently remove the user profile document for{" "}
              <strong className="text-slate-900 dark:text-white">{deleteTarget?.name}</strong> ({deleteTarget?.email})?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(null)}
              className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={deleting}
              className="gap-1.5"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
