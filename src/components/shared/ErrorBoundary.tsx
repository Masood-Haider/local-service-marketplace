import React, { Component, ErrorInfo, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

interface Props {
  children?: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught application error:", error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  private handleGoHome = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.href = "/"
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4 shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground mb-2">
            {this.props.fallbackTitle || "Something went wrong"}
          </h2>
          <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
            An unexpected error occurred while loading this section. You can try refreshing the view or return to the home page.
          </p>
          {this.state.error && (
            <div className="max-w-md w-full mb-6 p-3 rounded-lg bg-muted/60 text-left border border-border/80 text-xs font-mono text-muted-foreground overflow-x-auto">
              {this.state.error.message}
            </div>
          )}
          <div className="flex items-center gap-3">
            <Button onClick={this.handleReset} variant="outline" className="gap-2 text-xs">
              <RefreshCw className="w-3.5 h-3.5" />
              Reload Page
            </Button>
            <Button onClick={this.handleGoHome} className="gap-2 text-xs">
              <Home className="w-3.5 h-3.5" />
              Back to Home
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
