# Advanced Testing Patterns for Next.js 15+

## Table of Contents
1. [Testing Async Server Components](#testing-async-server-components)
2. [Mocking Strategies](#mocking-strategies)
3. [Testing API Routes](#testing-api-routes)
4. [Testing Middleware](#testing-middleware)
5. [Testing with Next.js Features](#testing-with-nextjs-features)
6. [CI/CD Best Practices](#cicd-best-practices)
7. [Performance Testing](#performance-testing)

## Testing Async Server Components

### The Challenge

Async Server Components are not fully supported by Jest/Vitest because they return Promises rather than React elements. The testing tools expect synchronous rendering.

**Error you'll see:**
```
Error: Objects are not valid as a React child (found: [object Promise])
```

### Recommended Approach: Use E2E Testing

```typescript
// e2e/server-component.spec.ts (Playwright)
import { test, expect } from '@playwright/test'

test('async server component renders data', async ({ page }) => {
  await page.goto('/products')
  
  // Wait for async content
  await expect(page.locator('[data-testid="product-list"]')).toBeVisible()
  
  // Verify fetched data
  const products = page.locator('[data-testid="product-item"]')
  await expect(products).toHaveCount(10)
  await expect(products.first()).toContainText('Product')
})
```

### Workaround: Testing Async Components with Jest/Vitest

```typescript
// __tests__/AsyncPage.test.tsx
import { render, screen } from '@testing-library/react'
import { Suspense } from 'react'

// Mock the data fetching
jest.mock('../lib/api', () => ({
  fetchProducts: jest.fn(() => Promise.resolve([
    { id: 1, name: 'Product 1' },
    { id: 2, name: 'Product 2' },
  ])),
}))

describe('AsyncProductPage', () => {
  it('renders async component', async () => {
    // Import after mocking
    const AsyncProductPage = (await import('../app/products/page')).default
    
    // Call the async component as a function
    const component = await AsyncProductPage()
    
    render(
      <Suspense fallback={<div>Loading...</div>}>
        {component}
      </Suspense>
    )

    // Use findBy for async content
    expect(await screen.findByText('Product 1')).toBeInTheDocument()
    expect(await screen.findByText('Product 2')).toBeInTheDocument()
  })
})
```

### Alternative: Render Async Component Directly

```typescript
// __tests__/AsyncComponent.test.tsx
import { render, screen } from '@testing-library/react'

describe('AsyncComponent', () => {
  it('renders with awaited result', async () => {
    // Mock data
    jest.mock('../lib/data', () => ({
      getData: () => Promise.resolve({ title: 'Test' }),
    }))

    const AsyncComponent = (await import('../components/AsyncComponent')).default
    
    // Await the component itself
    // @ts-expect-error - Async component workaround
    render(await AsyncComponent())

    expect(screen.getByText('Test')).toBeInTheDocument()
  })
})
```

### Testing Async Components with Props (searchParams/params)

```typescript
// __tests__/SearchPage.test.tsx
describe('SearchPage', () => {
  it('renders with searchParams', async () => {
    const SearchPage = (await import('../app/search/page')).default
    
    // Create async searchParams (Next.js 15+)
    const searchParams = Promise.resolve({ query: 'test', page: '1' })
    
    // @ts-expect-error - Async component workaround
    const component = await SearchPage({ searchParams })
    
    render(component)
    
    expect(await screen.findByText(/results for "test"/i)).toBeInTheDocument()
  })
})
```

## Mocking Strategies

### Mocking next/navigation

```typescript
// jest.setup.ts or inline
const mockRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  prefetch: jest.fn(),
}

const mockPathname = '/'
const mockSearchParams = new URLSearchParams()

jest.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
  useParams: () => ({}),
  redirect: jest.fn(),
  notFound: jest.fn(),
}))

// In test
it('navigates on click', async () => {
  render(<NavigationButton />)
  
  await userEvent.click(screen.getByRole('button'))
  
  expect(mockRouter.push).toHaveBeenCalledWith('/new-page')
})
```

### Mocking next/headers

```typescript
// For server components that use headers() or cookies()
jest.mock('next/headers', () => ({
  headers: () => new Headers({ 'x-custom-header': 'value' }),
  cookies: () => ({
    get: (name: string) => ({ value: 'cookie-value' }),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}))
```

### Mocking fetch Globally

```typescript
// jest.setup.ts
global.fetch = jest.fn()

// Helper for common patterns
const mockFetch = (data: any, status = 200) => {
  ;(global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  })
}

// In test
beforeEach(() => {
  jest.clearAllMocks()
})

it('fetches and displays data', async () => {
  mockFetch({ users: [{ id: 1, name: 'John' }] })
  
  render(<UserList />)
  
  await waitFor(() => {
    expect(screen.getByText('John')).toBeInTheDocument()
  })
})
```

### Mocking with MSW (Mock Service Worker)

```typescript
// mocks/handlers.ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Doe' },
    ])
  }),
  
  http.post('/api/login', async ({ request }) => {
    const body = await request.json()
    if (body.email === 'test@example.com') {
      return HttpResponse.json({ token: 'fake-token' })
    }
    return HttpResponse.json({ error: 'Invalid' }, { status: 401 })
  }),
]

// mocks/server.ts
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)

// jest.setup.ts
import { server } from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Testing API Routes

### Testing Route Handlers (App Router)

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = searchParams.get('limit') || '10'
  
  // Fetch users...
  return NextResponse.json({ users: [], limit })
}

export async function POST(request: Request) {
  const body = await request.json()
  
  if (!body.email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }
  
  // Create user...
  return NextResponse.json({ user: { id: 1, ...body } }, { status: 201 })
}
```

```typescript
// __tests__/api/users.test.ts
import { GET, POST } from '../../app/api/users/route'

describe('GET /api/users', () => {
  it('returns users with default limit', async () => {
    const request = new Request('http://localhost:3000/api/users')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.limit).toBe('10')
  })

  it('accepts limit parameter', async () => {
    const request = new Request('http://localhost:3000/api/users?limit=5')
    const response = await GET(request)
    const data = await response.json()
    
    expect(data.limit).toBe('5')
  })
})

describe('POST /api/users', () => {
  it('creates user with valid data', async () => {
    const request = new Request('http://localhost:3000/api/users', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', name: 'Test' }),
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(201)
    expect(data.user.email).toBe('test@example.com')
  })

  it('returns error for missing email', async () => {
    const request = new Request('http://localhost:3000/api/users', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
    })
    
    const response = await POST(request)
    
    expect(response.status).toBe(400)
  })
})
```

### Testing Route Handlers with Params

```typescript
// app/api/users/[id]/route.ts
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params
  // Fetch user by id...
  return NextResponse.json({ user: { id } })
}
```

```typescript
// __tests__/api/users/[id].test.ts
import { GET } from '../../../app/api/users/[id]/route'

describe('GET /api/users/[id]', () => {
  it('returns user by id', async () => {
    const request = new Request('http://localhost:3000/api/users/123')
    const response = await GET(request, { params: { id: '123' } })
    const data = await response.json()
    
    expect(data.user.id).toBe('123')
  })
})
```

## Testing Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  
  if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: '/dashboard/:path*',
}
```

```typescript
// __tests__/middleware.test.ts
import { middleware } from '../middleware'
import { NextRequest } from 'next/server'

describe('middleware', () => {
  it('redirects unauthenticated users from dashboard', () => {
    const request = new NextRequest('http://localhost:3000/dashboard')
    const response = middleware(request)
    
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('http://localhost:3000/login')
  })

  it('allows authenticated users to access dashboard', () => {
    const request = new NextRequest('http://localhost:3000/dashboard', {
      headers: {
        cookie: 'token=valid-token',
      },
    })
    const response = middleware(request)
    
    expect(response.status).toBe(200)
  })
})
```

## Testing with Next.js Features

### Testing with next/image

```typescript
// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt} />
  },
}))

it('renders image with alt text', () => {
  render(<ProductCard product={{ name: 'Test', image: '/test.jpg' }} />)
  expect(screen.getByAltText('Test')).toBeInTheDocument()
})
```

### Testing with next/link

```typescript
it('renders navigation links', () => {
  render(<Navigation />)
  
  const homeLink = screen.getByRole('link', { name: /home/i })
  expect(homeLink).toHaveAttribute('href', '/')
})
```

### Testing with Suspense

```typescript
import { Suspense } from 'react'
import { render, screen } from '@testing-library/react'

it('shows loading state', async () => {
  render(
    <Suspense fallback={<div>Loading...</div>}>
      <AsyncComponent />
    </Suspense>
  )
  
  // Loading state appears first
  expect(screen.getByText('Loading...')).toBeInTheDocument()
  
  // Then content appears
  expect(await screen.findByText('Content')).toBeInTheDocument()
})
```

## CI/CD Best Practices

### Comprehensive GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  CI: true
  DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      
      - name: Run unit tests
        run: npm test -- --coverage --ci
        
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          file: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      
      - name: Build
        run: npm run build

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  visual-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - run: npm ci
      - run: npm run build
      
      - name: Run visual regression tests
        run: npm run test:visual
```

### Test Organization Strategy

```
__tests__/
├── unit/                    # Pure functions, utils
│   ├── formatDate.test.ts
│   └── validateEmail.test.ts
├── components/              # Component tests
│   ├── Button.test.tsx
│   └── Form.test.tsx
├── integration/             # Multiple units together
│   ├── auth-flow.test.tsx
│   └── checkout.test.tsx
├── api/                     # API route tests
│   └── users.test.ts
e2e/
├── auth.spec.ts
├── navigation.spec.ts
└── checkout.spec.ts
```

### Test Tagging for Selective Running

```typescript
// __tests__/slow-test.test.ts
describe.skip('Slow tests', () => {
  // Or use tags in test name
})

// Run selective tests
// npm test -- --testPathPattern="unit"
// npm test -- --testNamePattern="fast"
```

## Performance Testing

### Lighthouse CI

```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI

on: [push]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci
      - run: npm run build

      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouserc.json'
          uploadArtifacts: true
```

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm start",
      "url": ["http://localhost:3000/", "http://localhost:3000/about"],
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["warn", { "minScore": 0.9 }],
        "categories:seo": ["warn", { "minScore": 0.9 }]
      }
    }
  }
}
```

### Load Testing with k6

```javascript
// k6/load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 10,
  duration: '30s',
}

export default function () {
  const res = http.get('http://localhost:3000/api/products')
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })
  
  sleep(1)
}
```

```bash
# Run load test
k6 run k6/load-test.js
```
