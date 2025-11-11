'use client'

/**
 * Global Error Boundary
 *
 * Catches errors in root layout and provides fallback UI.
 * MUST include <html> and <body> tags per Next.js requirements.
 *
 * This is the last line of defense for unhandled errors.
 */

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console in development
    console.error('Global error boundary caught:', error)

    // TODO: Send to error tracking service (Sentry)
    // Sentry.captureException(error, {
    //   tags: {
    //     boundary: 'global',
    //   },
    //   contexts: {
    //     errorDigest: {
    //       digest: error.digest,
    //     },
    //   },
    // })
  }, [error])

  return (
    // global-error MUST include html and body tags
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-cream p-4">
          <div
            className="w-full max-w-2xl border-2 border-charcoal bg-white p-8 shadow-lg"
            style={{ borderRadius: '2px' }}
          >
            {/* Error Icon */}
            <div
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center border-2 border-charcoal bg-coral"
              style={{ borderRadius: '2px' }}
            >
              <span className="font-mono text-3xl font-bold text-white">!</span>
            </div>

            {/* Error Title */}
            <h1 className="mb-4 text-center font-mono text-2xl font-bold uppercase tracking-wide text-charcoal md:text-3xl">
              Critical Application Error
            </h1>

            {/* Error Message */}
            <p className="mb-6 text-center font-mono text-sm text-gray-secondary md:text-base">
              {process.env.NODE_ENV === 'development'
                ? `The application encountered a critical error: ${error.message}`
                : 'The application encountered a critical error. Our team has been notified.'}
            </p>

            {/* Error Digest (for support) */}
            {error.digest && (
              <div
                className="mb-6 border-2 border-charcoal bg-off-white p-4"
                style={{ borderRadius: '2px' }}
              >
                <p className="font-mono text-xs text-gray-secondary">
                  <span className="font-bold">Error ID:</span> {error.digest}
                </p>
                <p className="mt-1 font-mono text-xs text-gray-secondary">
                  Please include this ID when contacting support.
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
                onClick={() => reset()}
                variant="default"
                size="lg"
                className="w-full sm:w-auto"
              >
                Reload Application
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

            {/* Support Contact */}
            <p className="mt-6 text-center font-mono text-xs text-gray-secondary">
              Need help?{' '}
              <a
                href="mailto:support@dearme.app"
                className="underline hover:opacity-70"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
