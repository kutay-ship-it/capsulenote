'use client'

/**
 * Dashboard Error Boundary
 *
 * Catches errors in the dashboard section.
 * Provides user-friendly messaging for authenticated users.
 */

import { useEffect } from 'react'
import { usePathname } from "@/i18n/routing"
import { Link } from "@/i18n/routing"
import { Button } from '@/components/ui/button'
import { Home, RefreshCw } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const pathname = usePathname()
  const t = useTranslations('errors.dashboard')
  const tCommon = useTranslations('errors.common')
  const tFallback = useTranslations('errors.fallback')

  useEffect(() => {
    // Log error with dashboard context
    console.error('Dashboard error:', {
      error,
      pathname,
      timestamp: new Date().toISOString(),
    })

    // TODO: Send to error tracking
    // Sentry.captureException(error, {
    //   tags: {
    //     section: 'dashboard',
    //     pathname,
    //   },
    // })
  }, [error, pathname])

  return (
    <div className="container flex min-h-[500px] items-center justify-center px-4 py-12">
      <div
        className="w-full max-w-xl border-2 border-charcoal bg-white p-8 shadow-md"
        style={{ borderRadius: '2px' }}
      >
        {/* Error Icon */}
        <div
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center border-2 border-charcoal bg-duck-yellow"
          style={{ borderRadius: '2px' }}
        >
          <span className="font-mono text-2xl font-bold text-charcoal">!</span>
        </div>

        {/* Error Title */}
        <h2 className="mb-4 text-center font-mono text-xl font-bold uppercase tracking-wide text-charcoal md:text-2xl">
          {t('title')}
        </h2>

        {/* User-Friendly Message */}
        <p className="mb-6 text-center font-mono text-sm text-gray-secondary">
          {process.env.NODE_ENV === 'development'
            ? `${tCommon('error')} ${error.message}`
            : t('message')}
        </p>

        {/* Error Digest */}
        {error.digest && (
          <div
            className="mb-6 border-2 border-charcoal bg-off-white p-3"
            style={{ borderRadius: '2px' }}
          >
            <p className="font-mono text-xs text-gray-secondary">
              <span className="font-bold">{tFallback('errorIdLabel')}</span> {error.digest}
            </p>
          </div>
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
            {t('actions.reload')}
          </Button>
          <Link href="/dashboard" className="w-full">
            <Button variant="outline" size="lg" className="w-full">
              <Home className="mr-2 h-4 w-4" />
              {t('actions.goHome')}
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-center font-mono text-xs text-gray-secondary">
          {t.rich('help', {
            link: (chunks) => (
              <a
                href="mailto:support@capsulenote.com"
                className="underline hover:opacity-70"
              >
                {t('contactSupport')}
              </a>
            )
          })}
        </p>
      </div>
    </div>
  )
}
