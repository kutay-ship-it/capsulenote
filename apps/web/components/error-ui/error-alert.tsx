/**
 * Inline Error Alert Component
 *
 * Brutalist design system alert for displaying errors inline within forms and pages.
 * Suitable for validation errors, failed operations, and user feedback.
 */

"use client"

import { AlertTriangle, XCircle, Info, CheckCircle, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'

export interface ErrorAlertProps {
  /** Alert variant */
  variant?: 'error' | 'warning' | 'info' | 'success'
  /** Alert title */
  title?: string
  /** Alert message */
  message: string
  /** Optional error code or ID */
  errorCode?: string
  /** Callback when alert is dismissed */
  onDismiss?: () => void
  /** Whether alert is dismissible */
  dismissible?: boolean
  /** Custom CSS class */
  className?: string
}

export function ErrorAlert({
  variant = 'error',
  title,
  message,
  errorCode,
  onDismiss,
  dismissible = false,
  className = '',
}: ErrorAlertProps) {
  const t = useTranslations('common.accessibility')
  const variants = {
    error: {
      bg: 'bg-coral',
      border: 'border-charcoal',
      text: 'text-white',
      icon: XCircle,
    },
    warning: {
      bg: 'bg-duck-yellow',
      border: 'border-charcoal',
      text: 'text-charcoal',
      icon: AlertTriangle,
    },
    info: {
      bg: 'bg-duck-blue',
      border: 'border-charcoal',
      text: 'text-charcoal',
      icon: Info,
    },
    success: {
      bg: 'bg-bg-green-light',
      border: 'border-charcoal',
      text: 'text-charcoal',
      icon: CheckCircle,
    },
  }

  const config = variants[variant]
  const Icon = config.icon

  return (
    <div
      className={`relative border-2 ${config.border} ${config.bg} p-4 ${className}`}
      style={{ borderRadius: '2px' }}
      role="alert"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <Icon className={`h-5 w-5 shrink-0 ${config.text}`} strokeWidth={2} />

        {/* Content */}
        <div className="flex-1">
          {title && (
            <p className={`mb-1 font-mono text-sm font-bold uppercase tracking-wide ${config.text}`}>
              {title}
            </p>
          )}
          <p className={`font-mono text-sm ${config.text}`}>{message}</p>

          {errorCode && (
            <p className={`mt-2 font-mono text-xs ${config.text} opacity-80`}>
              Error Code: {errorCode}
            </p>
          )}
        </div>

        {/* Dismiss Button */}
        {dismissible && onDismiss && (
          <Button
            onClick={onDismiss}
            variant="ghost"
            size="icon"
            className={`h-6 w-6 shrink-0 ${config.text} hover:opacity-70`}
            aria-label={t('dismissAlert')}
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Compact inline error for form fields
 */
export interface FieldErrorProps {
  /** Error message */
  message: string
  /** Custom CSS class */
  className?: string
}

export function FieldError({ message, className = '' }: FieldErrorProps) {
  if (!message) return null

  return (
    <p className={`mt-1 font-mono text-xs text-coral ${className}`} role="alert">
      {message}
    </p>
  )
}
