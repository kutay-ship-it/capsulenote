# Vitest Setup for Next.js 15+

## Table of Contents
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Testing Patterns](#testing-patterns)
4. [Examples](#examples)
5. [Migration from Jest](#migration-from-jest)

## Installation

### TypeScript Project
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths
```

### JavaScript Project
```bash
npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom
```

## Configuration

### vitest.config.mts (Recommended)

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/e2e/**', '**/.next/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        '.next/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
      ],
    },
  },
})
```

### vitest.config.js (JavaScript)

```javascript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
  },
})
```

### vitest.setup.ts

```typescript
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))

// Mock next/image
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}))

// Load environment variables
import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:ui": "vitest --ui"
  }
}
```

## Testing Patterns

### Basic Component Test

```typescript
import { expect, test, describe } from 'vitest'
import { render, screen } from '@testing-library/react'
import Page from '../app/page'

describe('Page', () => {
  test('renders a heading', () => {
    render(<Page />)
    expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeDefined()
  })
})
```

### Using Test Assertions

```typescript
import { expect, test, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '../components/Button'

test('calls onClick when clicked', async () => {
  const handleClick = vi.fn()
  render(<Button onClick={handleClick}>Click me</Button>)
  
  fireEvent.click(screen.getByRole('button'))
  
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

### Mocking with Vitest

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import UserProfile from '../components/UserProfile'

// Mock a module
vi.mock('../lib/api', () => ({
  fetchUser: vi.fn(() => Promise.resolve({ name: 'John Doe' })),
}))

describe('UserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays user name', async () => {
    render(<UserProfile userId="1" />)
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })
})
```

### Mocking Fetch

```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import DataComponent from '../components/DataComponent'

describe('DataComponent', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: 'test data' }),
      })
    ))
  })

  it('fetches and displays data', async () => {
    render(<DataComponent />)
    
    await waitFor(() => {
      expect(screen.getByText('test data')).toBeInTheDocument()
    })
    
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
```

### Snapshot Testing

```typescript
import { expect, test } from 'vitest'
import { render } from '@testing-library/react'
import Card from '../components/Card'

test('Card matches snapshot', () => {
  const { container } = render(
    <Card title="Test" description="Description" />
  )
  expect(container).toMatchSnapshot()
})
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import useCounter from '../hooks/useCounter'

describe('useCounter', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useCounter())
    expect(result.current.count).toBe(0)
  })

  it('increments count', () => {
    const { result } = renderHook(() => useCounter())
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.count).toBe(1)
  })

  it('accepts initial value', () => {
    const { result } = renderHook(() => useCounter(10))
    expect(result.current.count).toBe(10)
  })
})
```

## Examples

### Testing a Form with Validation

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ContactForm from '../components/ContactForm'

describe('ContactForm', () => {
  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    
    render(<ContactForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email/i), 'john@example.com')
    await user.type(screen.getByLabelText(/message/i), 'Hello!')
    await user.click(screen.getByRole('button', { name: /send/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello!',
      })
    })
  })

  it('shows error for invalid email', async () => {
    const user = userEvent.setup()
    render(<ContactForm onSubmit={vi.fn()} />)

    await user.type(screen.getByLabelText(/email/i), 'invalid-email')
    await user.click(screen.getByRole('button', { name: /send/i }))

    expect(await screen.findByText(/invalid email/i)).toBeInTheDocument()
  })
})
```

### Testing Components with Context

```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AuthProvider } from '../context/AuthContext'
import UserGreeting from '../components/UserGreeting'

const renderWithAuth = (component: React.ReactNode, user = null) => {
  return render(
    <AuthProvider initialUser={user}>
      {component}
    </AuthProvider>
  )
}

describe('UserGreeting', () => {
  it('shows login prompt when not authenticated', () => {
    renderWithAuth(<UserGreeting />)
    expect(screen.getByText(/please log in/i)).toBeInTheDocument()
  })

  it('shows greeting when authenticated', () => {
    renderWithAuth(<UserGreeting />, { name: 'Alice' })
    expect(screen.getByText(/hello, alice/i)).toBeInTheDocument()
  })
})
```

### Testing Async Components (Workaround)

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'

// For async server components - use workaround
describe('AsyncComponent', () => {
  it('renders async component content', async () => {
    // Mock the data fetching
    vi.mock('../lib/data', () => ({
      getData: vi.fn(() => Promise.resolve({ title: 'Test Title' })),
    }))

    const AsyncComponent = await import('../components/AsyncComponent')
    const component = await AsyncComponent.default()

    render(
      <Suspense fallback={<div>Loading...</div>}>
        {component}
      </Suspense>
    )

    expect(await screen.findByText('Test Title')).toBeInTheDocument()
  })
})
```

## Migration from Jest

### Key Differences

| Jest | Vitest |
|------|--------|
| `jest.fn()` | `vi.fn()` |
| `jest.mock()` | `vi.mock()` |
| `jest.spyOn()` | `vi.spyOn()` |
| `jest.clearAllMocks()` | `vi.clearAllMocks()` |
| `jest.resetAllMocks()` | `vi.resetAllMocks()` |
| `jest.useFakeTimers()` | `vi.useFakeTimers()` |
| `@jest/globals` | `vitest` |

### Import Changes

```typescript
// Jest
import { jest, describe, it, expect } from '@jest/globals'

// Vitest
import { vi, describe, it, expect } from 'vitest'
```

### Config Migration

Jest config properties map to Vitest:

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // Jest: testEnvironment -> Vitest: environment
    environment: 'jsdom',
    // Jest: setupFilesAfterEnv -> Vitest: setupFiles
    setupFiles: ['./vitest.setup.ts'],
    // Jest: testMatch -> Vitest: include
    include: ['**/*.test.ts'],
    // Jest: moduleNameMapper -> handled by vite-tsconfig-paths or resolve.alias
  },
})
```

## Running Tests

```bash
# Run all tests (watch mode by default)
npm test

# Run once without watch
npm run test:run

# Run with coverage
npm run test:coverage

# Run with UI
npm run test:ui

# Run specific file
npx vitest path/to/test.ts

# Run tests matching pattern
npx vitest --grep "button"
```
