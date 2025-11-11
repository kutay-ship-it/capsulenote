'use client'

/**
 * Letters Section Error Boundary
 *
 * Catches errors in the letters CRUD section.
 * Provides specific messaging for letter-related failures.
 */

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileText, Home, RefreshCw } from 'lucide-react'

export default function LettersError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Log error with letters context
    console.error('Letters section error:', {
      error,
      pathname,
      searchParams: Object.fromEntries(searchParams),
      timestamp: new Date().toISOString(),
    })

    // TODO: Send to error tracking
    // Sentry.captureException(error, {
    //   tags: {
    //     section: 'letters',
    //     pathname,
    //   },
    // })
  }, [error, pathname, searchParams])

  return (
    <div className="container flex min-h-[500px] items-center justify-center px-4 py-12">
      <div
        className="w-full max-w-xl border-2 border-charcoal bg-white p-8 shadow-md"
        style={{ borderRadius: '2px' }}
      >
        {/* Error Icon */}
        <div
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border-2 border-charcoal bg-duck-blue"
          style={{ borderRadius: '2px' }}
        >
          <FileText className="h-7 w-7 text-charcoal" strokeWidth={2} />
        </div>

        {/* Error Title */}
        <h2 className="mb-4 text-center font-mono text-xl font-bold uppercase tracking-wide text-charcoal md:text-2xl">
          Letter Operation Failed
        </h2>

        {/* Context-Aware Message */}
        <p className="mb-6 text-center font-mono text-sm text-gray-secondary">
          {process.env.NODE_ENV === 'development' ? (
            <>
              <span className="font-bold">Error:</span> {error.message}
            </>
          ) : pathname.includes('/new') ? (
            'We encountered an issue creating your letter. Your work may not have been saved.'
          ) : pathname.includes('/edit') ? (
            'We encountered an issue updating your letter. Your changes may not have been saved.'
          ) : (
            'We encountered an issue loading your letters. Your data is safe.'
          )}
        </p>

        {/* Unsaved Work Warning */}
        {(pathname.includes('/new') || pathname.includes('/edit')) && (
          <div
            className="mb-6 border-2 border-charcoal bg-duck-yellow p-4"
            style={{ borderRadius: '2px' }}
          >
            <p className="font-mono text-sm font-bold text-charcoal">
              ⚠ Unsaved Changes
            </p>
            <p className="mt-2 font-mono text-xs text-charcoal">
              If you were editing a letter, please copy your content before refreshing to avoid losing your work.
            </p>
          </div>
        )}

        {/* Error Digest */}
        {error.digest && (
          <div
            className="mb-6 border-2 border-charcoal bg-off-white p-3"
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
            <summary className="cursor-pointer font-mono text-xs font-bold uppercase tracking-wide text-charcoal hover:opacity-70">
              Technical Details
            </summary>
            <pre
              className="mt-3 max-h-40 overflow-auto border-2 border-charcoal bg-off-white p-3 font-mono text-xs"
              style={{ borderRadius: '2px' }}
            >
              {error.stack}
            </pre>
          </details>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={() => reset()}
            variant="default"
            size="lg"
            className="w-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/letters" className="w-full">
              <Button variant="outline" size="lg" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                My Letters
              </Button>
            </Link>
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" size="lg" className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-center font-mono text-xs text-gray-secondary">
          Need help recovering your work?{' '}
          <a
            href="mailto:support@dearme.app"
            className="underline hover:opacity-70"
          >
            Contact support
          </a>
          .
        </p>
      </div>
    </div>
  )
}
