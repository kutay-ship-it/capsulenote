'use client'

/**
 * Root Error Boundary
 *
 * Catches errors in page-level components.
 * Provides user-friendly error UI with recovery options.
 *
 * Implements smart retry logic with exponential backoff for network errors.
 */

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [retryCount, setRetryCount] = useState(0)
  const [isAutoRetrying, setIsAutoRetrying] = useState(false)
  const [isSettling, setIsSettling] = useState(false) // Prevent retry overlap after reset
  const maxRetries = 3

  // Check if error is transient (network-related)
  const isTransientError = error.message.toLowerCase().includes('network') ||
    error.message.toLowerCase().includes('fetch') ||
    error.message.toLowerCase().includes('timeout')

  useEffect(() => {
    // Log error with context
    const errorContext = {
      pathname,
      searchParams: Object.fromEntries(searchParams),
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      timestamp: new Date().toISOString(),
    }

    console.error('Page error boundary caught:', {
      error,
      context: errorContext,
      retryCount,
    })

    // TODO: Send to error tracking service (Sentry)
    // Sentry.captureException(error, {
    //   tags: {
    //     boundary: 'page',
    //     pathname,
    //   },
    //   contexts: {
    //     page: errorContext,
    //   },
    // })

    // Auto-retry for transient errors with exponential backoff
    // isSettling prevents overlap when reset() triggers re-render
    if (isTransientError && retryCount < maxRetries && !isAutoRetrying && !isSettling) {
      setIsAutoRetrying(true)
      const backoffMs = 1000 * Math.pow(2, retryCount) // 1s, 2s, 4s

      const timer = setTimeout(() => {
        setRetryCount((prev) => prev + 1)
        setIsAutoRetrying(false)
        setIsSettling(true)
        reset()
        // Clear settling state after a short delay to allow re-render to complete
        setTimeout(() => setIsSettling(false), 100)
      }, backoffMs)

      return () => clearTimeout(timer)
    }
  }, [error, pathname, searchParams, retryCount, isTransientError, isAutoRetrying, isSettling, reset])

  return (
    <div className="container flex min-h-[600px] items-center justify-center px-4 py-16">
      <div
        className="w-full max-w-2xl border-2 border-charcoal bg-white p-8 shadow-lg"
        style={{ borderRadius: '2px' }}
      >
        {/* Error Icon */}
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-2 border-charcoal bg-duck-yellow"
          style={{ borderRadius: '2px' }}
        >
          <span className="font-mono text-3xl font-bold text-charcoal">⚠</span>
        </div>

        {/* Error Title */}
        <h2 className="mb-4 text-center font-mono text-2xl font-bold uppercase tracking-wide text-charcoal md:text-3xl">
          Something Went Wrong
        </h2>

        {/* Error Message */}
        <p className="mb-6 text-center font-mono text-sm text-gray-secondary md:text-base">
          {process.env.NODE_ENV === 'development' ? (
            <>
              <span className="font-bold">Error:</span> {error.message}
            </>
          ) : isTransientError ? (
            'We encountered a temporary network issue. Retrying automatically...'
          ) : (
            'An unexpected error occurred. Please try refreshing the page.'
          )}
        </p>

        {/* Auto-Retry Status */}
        {isAutoRetrying && isTransientError && retryCount < maxRetries && (
          <div
            className="mb-6 flex items-center justify-center gap-3 border-2 border-charcoal bg-duck-blue p-4"
            style={{ borderRadius: '2px' }}
          >
            <RefreshCw className="h-5 w-5 animate-spin text-charcoal" />
            <p className="font-mono text-sm font-bold uppercase text-charcoal">
              Retry attempt {retryCount + 1} of {maxRetries}...
            </p>
          </div>
        )}

        {/* Max Retries Reached */}
        {isTransientError && retryCount >= maxRetries && (
          <div
            className="mb-6 border-2 border-charcoal bg-coral p-4"
            style={{ borderRadius: '2px' }}
          >
            <p className="font-mono text-sm font-bold text-white">
              Maximum retry attempts reached. Please check your connection and try again manually.
            </p>
          </div>
        )}

        {/* Error Digest (for support) */}
        {error.digest && (
          <div
            className="mb-6 border-2 border-charcoal bg-off-white p-4"
            style={{ borderRadius: '2px' }}
          >
            <p className="font-mono text-xs text-gray-secondary">
              <span className="font-bold">Error ID:</span> {error.digest}
            </p>
          </div>
        )}

        {/* Stack Trace (development only) */}
        {process.env.NODE_ENV === 'development' && error.stack && (
          <details className="mb-6">
            <summary className="cursor-pointer font-mono text-sm font-bold uppercase tracking-wide text-charcoal hover:opacity-70">
              Technical Details
            </summary>
            <pre
              className="mt-3 overflow-auto border-2 border-charcoal bg-off-white p-4 font-mono text-xs"
              style={{ borderRadius: '2px' }}
            >
              {error.stack}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={() => {
              setRetryCount(0)
              setIsAutoRetrying(false)
              reset()
            }}
            variant="default"
            size="lg"
            className="w-full sm:w-auto"
            disabled={isAutoRetrying}
          >
            {isAutoRetrying ? 'Retrying...' : 'Try Again'}
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto"
          >
            Return Home
          </Button>
        </div>

        {/* Context Info (development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-6 border-t-2 border-charcoal pt-4">
            <p className="font-mono text-xs text-gray-secondary">
              <span className="font-bold">Path:</span> {pathname}
            </p>
            {searchParams.toString() && (
              <p className="mt-1 font-mono text-xs text-gray-secondary">
                <span className="font-bold">Query:</span> {searchParams.toString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
