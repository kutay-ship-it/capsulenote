# Next.js 15 & React 19 Error Boundaries: Comprehensive Guide

## Executive Summary

This comprehensive guide covers error boundary implementation in Next.js 15 with React 19, including fundamentals, best practices, advanced patterns, and common pitfalls. Error boundaries are critical for graceful error handling in production applications, providing fallback UIs and preventing complete application crashes.

### Key Findings

- **Next.js 15 Error Handling**: Provides two main error boundary patterns: `error.tsx` for route segments and `global-error.tsx` for root-level errors
- **React 19 Enhancements**: Introduces new error reporting APIs (`onCaughtError`, `onUncaughtError`) for better error tracking
- **Server vs Client Boundaries**: Error boundaries must be Client Components but can handle errors from Server Components
- **Recovery Mechanisms**: Built-in `reset()` function enables user-driven error recovery
- **Integration Ready**: Full support for error tracking services like Sentry with production-grade monitoring

## 1. Error Boundary Fundamentals in React 19

### 1.1 How Error Boundaries Work

Error boundaries are React components that catch JavaScript errors anywhere in their child component tree, log those errors, and display a fallback UI. In React 19:

```javascript
// Class-based Error Boundary (still the only option for error boundaries)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state to trigger fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to reporting service
    console.error('Error caught:', error);
    console.error('Component Stack:', errorInfo.componentStack);

    // Send to error tracking service
    logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <h2>Something went wrong</h2>;
    }
    return this.props.children;
  }
}
```

### 1.2 What Error Boundaries Catch vs Don't Catch

**Error Boundaries CATCH:**
- Errors during rendering
- Errors in lifecycle methods
- Errors in constructors
- Errors from child components
- Errors from the `use()` hook (when wrapped with Suspense)

**Error Boundaries DON'T CATCH:**
- Event handlers (use try/catch instead)
- Asynchronous code (setTimeout, requestAnimationFrame callbacks)
- Server-side rendering errors
- Errors thrown in the error boundary itself
- Errors in Server Actions (handle with expected error pattern)

### 1.3 React 19 Error Reporting APIs

React 19 introduces new error reporting options for `createRoot`:

```javascript
import { createRoot } from 'react-dom/client';

const root = createRoot(container, {
  // Called when error boundary catches an error
  onCaughtError: (error, errorInfo) => {
    if (error.message !== 'Known error') {
      reportToErrorService({
        type: 'Caught',
        error,
        componentStack: errorInfo.componentStack,
      });
    }
  },

  // Called when an error is not caught by any boundary
  onUncaughtError: (error, errorInfo) => {
    reportToErrorService({
      type: 'Uncaught',
      error,
      componentStack: errorInfo.componentStack,
    });
  },

  // Called for recoverable errors
  onRecoverableError: (error, errorInfo) => {
    reportToErrorService({
      type: 'Recoverable',
      error,
      componentStack: errorInfo.componentStack,
    });
  }
});
```

## 2. Next.js 15 Error Handling Patterns

### 2.1 Route-Level Error Boundaries (`error.tsx`)

Create an `error.tsx` file in any route segment to handle errors for that segment and its children:

```typescript
// app/dashboard/error.tsx
'use client'; // Error boundaries MUST be Client Components

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <h2 className="text-2xl font-semibold mb-4">
        Something went wrong!
      </h2>
      <details className="mb-4 p-4 bg-gray-100 rounded max-w-xl">
        <summary className="cursor-pointer">Error details</summary>
        <pre className="mt-2 text-sm">{error.message}</pre>
        {error.digest && (
          <p className="mt-2 text-xs text-gray-500">
            Digest: {error.digest}
          </p>
        )}
      </details>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Try again
      </button>
    </div>
  );
}
```

### 2.2 Root-Level Error Boundaries (`global-error.tsx`)

For catching errors in the root layout, create `app/global-error.tsx`:

```typescript
// app/global-error.tsx
'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    // global-error MUST include html and body tags
    <html>
      <body>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Critical Application Error
            </h2>
            <p className="mb-4">
              The application encountered a critical error.
            </p>
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-red-500 text-white rounded"
            >
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
```

### 2.3 Error Boundary Hierarchy

Next.js 15 creates a hierarchy of error boundaries:

```
app/
  global-error.tsx        (catches root layout errors)
  layout.tsx
  error.tsx              (catches page.tsx errors)
  page.tsx

  dashboard/
    error.tsx            (catches dashboard segment errors)
    layout.tsx
    page.tsx

    settings/
      error.tsx          (catches settings page errors)
      page.tsx
```

Errors bubble up to the nearest error boundary. If an error boundary itself throws, it bubbles to the parent boundary.

## 3. Best Practices

### 3.1 Granular Error Boundaries

Place error boundaries strategically for better UX:

```typescript
// app/dashboard/critical-widget/error.tsx
'use client';

export default function WidgetError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="widget-error p-4 border border-red-200 rounded">
      <p>This widget is temporarily unavailable</p>
      <button onClick={reset} className="text-sm underline">
        Retry
      </button>
    </div>
  );
}
```

### 3.2 User-Friendly Error Messages

Provide helpful error messages without exposing sensitive information:

```typescript
// app/error-utils.ts
export function getUserFriendlyError(error: Error): string {
  // In production, show generic messages
  if (process.env.NODE_ENV === 'production') {
    // Map known error types to friendly messages
    if (error.message.includes('Network')) {
      return 'Connection issue. Please check your internet and try again.';
    }
    if (error.message.includes('Permission')) {
      return 'You don\'t have permission to access this resource.';
    }
    // Default generic message
    return 'An unexpected error occurred. Please try again later.';
  }

  // In development, show actual error
  return error.message;
}
```

### 3.3 Error Recovery Strategies

Implement smart recovery mechanisms:

```typescript
// app/smart-error-boundary.tsx
'use client';

import { useState, useEffect } from 'react';

export default function SmartError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    // Auto-retry for transient errors
    if (error.message.includes('Network') && retryCount < maxRetries) {
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        reset();
      }, 1000 * Math.pow(2, retryCount)); // Exponential backoff

      return () => clearTimeout(timer);
    }
  }, [error, reset, retryCount]);

  return (
    <div>
      {retryCount > 0 && (
        <p>Retry attempt {retryCount} of {maxRetries}...</p>
      )}
      {/* Error UI */}
    </div>
  );
}
```

### 3.4 Error Tracking Integration (Sentry Example)

Integrate with error tracking services for production monitoring:

```typescript
// app/sentry-error-boundary.tsx
'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function SentryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to Sentry with additional context
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: error.digest,
        },
      },
      tags: {
        section: 'error-boundary',
      },
    });
  }, [error]);

  return (
    <div>
      <h2>An error occurred</h2>
      <p>Our team has been notified.</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## 4. Advanced Patterns

### 4.1 Handling Errors in Server Components

Server Components can't have error boundaries, but errors thrown in them are caught by the nearest Client Component error boundary:

```typescript
// app/data-component.tsx (Server Component)
async function DataComponent() {
  const data = await fetchData();

  if (!data) {
    // This will be caught by the nearest error.tsx
    throw new Error('Failed to load data');
  }

  return <div>{data.content}</div>;
}
```

### 4.2 Handling Errors in Server Actions

Server Actions require a different approach using expected errors:

```typescript
// app/actions.ts
'use server';

import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
});

export async function createUser(prevState: any, formData: FormData) {
  // Validate input
  const validatedFields = schema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Invalid form data',
    };
  }

  try {
    // Perform action
    await db.user.create({ data: validatedFields.data });

    // Redirect on success
    redirect('/dashboard');
  } catch (error) {
    // Return error state instead of throwing
    return {
      message: 'Failed to create user. Please try again.',
    };
  }
}

// app/signup-form.tsx
'use client';

import { useActionState } from 'react';
import { createUser } from './actions';

export function SignupForm() {
  const [state, formAction, pending] = useActionState(createUser, {});

  return (
    <form action={formAction}>
      <input name="email" type="email" required />
      {state?.errors?.email && (
        <p className="text-red-500">{state.errors.email}</p>
      )}

      <input name="name" required />
      {state?.errors?.name && (
        <p className="text-red-500">{state.errors.name}</p>
      )}

      {state?.message && (
        <p className="text-red-500">{state.message}</p>
      )}

      <button disabled={pending}>
        {pending ? 'Creating...' : 'Create Account'}
      </button>
    </form>
  );
}
```

### 4.3 Handling Async Errors with Suspense

For async operations, combine Suspense with Error Boundaries:

```typescript
// app/async-data-wrapper.tsx
'use client';

import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export function AsyncDataWrapper({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={<div>Failed to load data</div>}
      onError={(error) => console.error('Async error:', error)}
    >
      <Suspense fallback={<div>Loading...</div>}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// Usage with React 19 `use` hook
'use client';

import { use } from 'react';

function DataComponent({ dataPromise }: { dataPromise: Promise<Data> }) {
  // If promise rejects, error boundary catches it
  const data = use(dataPromise);
  return <div>{data.content}</div>;
}
```

### 4.4 Custom Error Types and Handling

Create custom error types for better error handling:

```typescript
// app/lib/errors.ts
export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized access') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ValidationError extends Error {
  constructor(public errors: Record<string, string[]>) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

// app/error-handler.tsx
'use client';

import { NotFoundError, UnauthorizedError } from '@/lib/errors';

export default function ErrorHandler({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  // Handle specific error types
  if (error instanceof NotFoundError) {
    return (
      <div>
        <h2>Not Found</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  if (error instanceof UnauthorizedError) {
    return (
      <div>
        <h2>Access Denied</h2>
        <p>Please login to continue</p>
        <Link href="/login">Go to Login</Link>
      </div>
    );
  }

  // Default error handling
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## 5. Common Pitfalls and Solutions

### 5.1 Error Boundaries Don't Catch Event Handler Errors

**Problem:**
```typescript
// This error won't be caught by error boundary
function Button() {
  return (
    <button onClick={() => {
      throw new Error('Click error'); // Not caught!
    }}>
      Click me
    </button>
  );
}
```

**Solution:**
```typescript
function Button() {
  const handleClick = () => {
    try {
      // Risky operation
      riskyOperation();
    } catch (error) {
      // Handle error locally or report it
      console.error('Click error:', error);
      // Optionally set error state to trigger error boundary
      setError(error);
    }
  };

  return <button onClick={handleClick}>Click me</button>;
}
```

### 5.2 Server Component Async Errors

**Problem:**
```typescript
// Incorrect - async Client Component
'use client';

async function ClientComponent() { // ERROR!
  const data = await fetchData();
  return <div>{data}</div>;
}
```

**Solution:**
```typescript
// Correct - Server Component for async operations
// app/server-component.tsx (no 'use client')
async function ServerComponent() {
  const data = await fetchData();
  return <div>{data}</div>;
}

// Or use Client Component with useEffect
'use client';

function ClientComponent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(setError);
  }, []);

  if (error) throw error; // Will be caught by error boundary
  if (!data) return <div>Loading...</div>;

  return <div>{data}</div>;
}
```

### 5.3 Error Boundary Infinite Loops

**Problem:**
```typescript
// Error boundary that can cause infinite loop
export default function Error({ error, reset }) {
  useEffect(() => {
    // This might throw and cause infinite loop
    riskyLoggingFunction(error);
  }, [error]);

  return <div>Error occurred</div>;
}
```

**Solution:**
```typescript
export default function Error({ error, reset }) {
  useEffect(() => {
    try {
      // Wrap risky operations in try/catch
      riskyLoggingFunction(error);
    } catch (loggingError) {
      // Fallback to console
      console.error('Failed to log error:', loggingError);
      console.error('Original error:', error);
    }
  }, [error]);

  return <div>Error occurred</div>;
}
```

### 5.4 Missing Error Context

**Problem:**
```typescript
// Generic error without context
export default function Error({ error }) {
  return <div>Something went wrong</div>;
}
```

**Solution:**
```typescript
// Enhanced error with context
export default function Error({ error, reset }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Log with context
    logError({
      error,
      url: pathname,
      params: Object.fromEntries(searchParams),
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  }, [error, pathname, searchParams]);

  return (
    <div>
      <h2>Error on {pathname}</h2>
      <p>We've been notified and are working on it.</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

## 6. Testing Error Boundaries

### 6.1 Testing with React Testing Library

```typescript
// __tests__/error-boundary.test.tsx
import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '@/components/error-boundary';

// Component that throws
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
}

describe('ErrorBoundary', () => {
  // Suppress console.error for cleaner test output
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });

  afterAll(() => {
    console.error = originalError;
  });

  it('displays fallback UI when error is thrown', () => {
    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Error occurred')).toBeInTheDocument();
  });

  it('renders children when no error', () => {
    render(
      <ErrorBoundary fallback={<div>Error occurred</div>}>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });
});
```

### 6.2 E2E Testing with Playwright

```typescript
// e2e/error-boundary.spec.ts
import { test, expect } from '@playwright/test';

test('error boundary shows fallback UI', async ({ page }) => {
  // Navigate to page with error trigger
  await page.goto('/test-error');

  // Trigger an error
  await page.click('button#trigger-error');

  // Check for error boundary UI
  await expect(page.locator('h2')).toContainText('Something went wrong');

  // Test reset functionality
  await page.click('button:has-text("Try again")');

  // Verify recovery
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

## 7. Production Deployment Checklist

### 7.1 Pre-Deployment Checklist

- [ ] All error boundaries have appropriate fallback UIs
- [ ] Error messages don't expose sensitive information
- [ ] Error tracking service is configured (Sentry, etc.)
- [ ] Global error boundary is in place
- [ ] Server Actions use expected error pattern
- [ ] Custom error types are properly handled
- [ ] Reset functionality is tested
- [ ] Error boundaries are tested with production React build
- [ ] Performance impact of error boundaries is measured
- [ ] Error recovery strategies are implemented

### 7.2 Monitoring Setup

```typescript
// app/instrumentation.ts
import * as Sentry from '@sentry/nextjs';

export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      integrations: [
        Sentry.captureConsoleIntegration({
          levels: ['error'],
        }),
      ],
      beforeSend(event, hint) {
        // Filter out known non-critical errors
        if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
          return null;
        }
        return event;
      },
    });
  }
}

// app/lib/monitoring.ts
export function logError(error: Error, context?: Record<string, any>) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: context,
    });
  } else {
    console.error('Error:', error);
    console.error('Context:', context);
  }
}
```

## 8. Performance Considerations

### 8.1 Lazy Loading Error Boundaries

For large error UIs, consider lazy loading:

```typescript
// app/lazy-error-boundary.tsx
'use client';

import { lazy, Suspense } from 'react';

const ErrorUI = lazy(() => import('./error-ui'));

export default function LazyError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <Suspense fallback={<div>Loading error details...</div>}>
      <ErrorUI error={error} reset={reset} />
    </Suspense>
  );
}
```

### 8.2 Error Boundary Performance Impact

Error boundaries have minimal performance impact when no errors occur. However, consider:

- Keep error boundary logic lightweight
- Avoid heavy computations in error handlers
- Use error sampling for high-traffic applications
- Implement rate limiting for error reporting

## Conclusion

Error boundaries in Next.js 15 with React 19 provide a robust foundation for building resilient applications. By following these patterns and best practices, you can create applications that gracefully handle errors, provide excellent user experience during failures, and maintain visibility into production issues.

Key takeaways:
- Always use Client Components for error boundaries
- Implement both route-level and global error boundaries
- Handle Server Action errors with expected error pattern
- Integrate error tracking for production monitoring
- Test error boundaries thoroughly
- Provide user-friendly error messages and recovery options

Remember that error boundaries are a safety net, not a substitute for proper error prevention and handling throughout your application.