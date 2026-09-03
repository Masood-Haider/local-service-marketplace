import React from "react"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-6 mb-8",
        className
      )}
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-sm md:text-base text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  )
}
