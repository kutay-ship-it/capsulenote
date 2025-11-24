/**
 * Reusable Error Fallback Component
 *
 * Brutalist design system error UI for use across the application.
 * Can be used in error boundaries or for displaying error states.
 */

import { Button } from '@/components/ui/button'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export interface ErrorFallbackProps {
  /** Error title */
  title?: string
  /** Error message to display to user */
  message?: string
  /** Error digest/ID for support reference */
  errorId?: string
  /** Optional error stack for development */
  stack?: string
  /** Callback for retry action */
  onRetry?: () => void
  /** Whether retry is currently in progress */
  isRetrying?: boolean
  /** Custom retry button text */
  retryText?: string
  /** Show link to return home */
  showHomeLink?: boolean
  /** Custom home link URL */
  homeUrl?: string
  /** Custom CSS class */
  className?: string
  /** Icon variant */
  iconVariant?: 'warning' | 'error' | 'info'
}

export function ErrorFallback({
  title = 'Something Went Wrong',
  message = 'An unexpected error occurred. Please try again.',
  errorId,
  stack,
  onRetry,
  isRetrying = false,
  retryText = 'Try Again',
  showHomeLink = true,
  homeUrl = '/',
  className = '',
  iconVariant = 'warning',
}: ErrorFallbackProps) {
  const iconColors = {
    warning: 'bg-duck-yellow',
    error: 'bg-coral',
    info: 'bg-duck-blue',
  }

  const iconBg = iconColors[iconVariant]

  return (
    <div className={`w-full max-w-2xl ${className}`}>
      <div
        className="border-2 border-charcoal bg-white p-6 shadow-md md:p-8"
        style={{ borderRadius: '2px' }}
      >
        {/* Error Icon */}
        <div
          className={`mx-auto mb-6 flex h-14 w-14 items-center justify-center border-2 border-charcoal ${iconBg} md:h-16 md:w-16`}
          style={{ borderRadius: '2px' }}
        >
          <AlertTriangle
            className="h-7 w-7 text-charcoal md:h-8 md:w-8"
            strokeWidth={2}
          />
        </div>

        {/* Error Title */}
        <h2 className="mb-4 text-center font-mono text-xl font-bold uppercase tracking-wide text-charcoal md:text-2xl">
          {title}
        </h2>

        {/* Error Message */}
        <p className="mb-6 text-center font-mono text-sm text-gray-secondary md:text-base">
          {message}
        </p>

        {/* Error ID */}
        {errorId && (
          <div
            className="mb-6 border-2 border-charcoal bg-off-white p-3"
            style={{ borderRadius: '2px' }}
          >
            <p className="font-mono text-xs text-gray-secondary">
              <span className="font-bold">Error ID:</span> {errorId}
            </p>
            <p className="mt-1 font-mono text-xs text-gray-secondary">
              Please include this ID when contacting support.
            </p>
          </div>
        )}

        {/* Stack Trace (development only) */}
        {process.env.NODE_ENV === 'development' && stack && (
          <details className="mb-6">
            <summary className="cursor-pointer font-mono text-sm font-bold uppercase tracking-wide text-charcoal hover:opacity-70">
              Technical Details
            </summary>
            <pre
              className="mt-3 max-h-60 overflow-auto border-2 border-charcoal bg-off-white p-4 font-mono text-xs"
              style={{ borderRadius: '2px' }}
            >
              {stack}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="default"
              size="lg"
              className="w-full"
              disabled={isRetrying}
            >
              <RefreshCw
                className={`mr-2 h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`}
              />
              {isRetrying ? 'Retrying...' : retryText}
            </Button>
          )}

          {showHomeLink && (
            <Link href={homeUrl} className="w-full">
              <Button variant="outline" size="lg" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Button>
            </Link>
          )}
        </div>

        {/* Support Link */}
        <p className="mt-6 text-center font-mono text-xs text-gray-secondary">
          Need help?{" "}
          <a
            href="mailto:support@capsulenote.com"
            className="underline hover:opacity-70"
          >
            Contact Support
          </a>
        </p>
      </div>
    </div>
  )
}
