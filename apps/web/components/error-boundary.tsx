"use client"

import * as React from "react"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@dearme/ui/components/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * React Error Boundary component
 *
 * Catches JavaScript errors in child component tree, logs them,
 * and displays a fallback UI instead of crashing the whole app.
 *
 * @example
 * <ErrorBoundary onError={(error) => logError(error)}>
 *   <MyComponent />
 * </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null })
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 p-8 text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
          <h2 className="mb-2 font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
            Something went wrong
          </h2>
          <p className="mb-6 max-w-md text-sm text-stone-600">
            An error occurred while loading this component. This has been logged
            and we&apos;re working to fix it.
          </p>
          <Button
            variant="outline"
            onClick={this.handleRetry}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="mt-4 max-w-full overflow-auto rounded bg-charcoal p-4 text-left text-xs text-red-400">
              {this.state.error.message}
              {"\n\n"}
              {this.state.error.stack}
            </pre>
          )}
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Letter Editor Error Boundary
 *
 * Specialized error boundary for the letter editor with
 * auto-save recovery messaging.
 */
export function LetterEditorErrorBoundary({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary
      onError={(error) => {
        // Log to error tracking service
        console.error("[LetterEditor] Error caught:", error)
        // TODO: Send to Sentry when configured
      }}
      fallback={
        <div className="flex min-h-[500px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 p-8 text-center">
          <AlertTriangle className="mb-4 h-12 w-12 text-amber-500" />
          <h2 className="mb-2 font-mono text-lg font-bold uppercase tracking-wide text-charcoal">
            Editor Error
          </h2>
          <p className="mb-4 max-w-md text-sm text-stone-600">
            The letter editor encountered an error. Don&apos;t worry - your work
            is automatically saved as you type.
          </p>
          <p className="mb-6 max-w-md text-xs text-stone-500">
            Try refreshing the page. If the problem persists, please contact
            support.
          </p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Page
          </Button>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  )
}
