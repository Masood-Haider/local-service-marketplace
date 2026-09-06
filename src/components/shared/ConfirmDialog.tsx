import React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2, XCircle, AlertCircle, Loader2 } from "lucide-react"

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  variant?: "destructive" | "default" | "warning"
  isLoading?: boolean
  onConfirm: () => void | Promise<void>
  icon?: "danger" | "warning" | "cancel" | "info"
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "destructive",
  isLoading = false,
  onConfirm,
  icon = "danger",
}) => {
  const getIcon = () => {
    switch (icon) {
      case "danger":
        return (
          <div className="w-10 h-10 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
            <Trash2 className="w-5 h-5" />
          </div>
        )
      case "cancel":
        return (
          <div className="w-10 h-10 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-500/20">
            <XCircle className="w-5 h-5" />
          </div>
        )
      case "warning":
        return (
          <div className="w-10 h-10 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5" />
          </div>
        )
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <AlertCircle className="w-5 h-5" />
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => !isLoading && onOpenChange(val)}>
      <DialogContent className="sm:max-w-[440px] p-6 border-border bg-card text-card-foreground shadow-xl rounded-2xl">
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            {getIcon()}
            <div>
              <DialogTitle className="text-lg font-bold text-foreground leading-tight">
                {title}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed pt-1">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-4 gap-2 sm:gap-2 flex flex-col-reverse sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto h-9 text-xs font-semibold"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant === "warning" ? "default" : variant}
            onClick={onConfirm}
            disabled={isLoading}
            className={`w-full sm:w-auto h-9 text-xs font-semibold gap-1.5 shadow-sm ${
              variant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : variant === "warning"
                ? "bg-amber-600 text-white hover:bg-amber-700"
                : ""
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Processing...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
