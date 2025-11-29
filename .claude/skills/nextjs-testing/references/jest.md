# Jest Setup for Next.js 15+

## Table of Contents
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Mocking](#mocking)
4. [Testing Patterns](#testing-patterns)
5. [Examples](#examples)

## Installation

```bash
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom ts-node @types/jest
```

Generate config:
```bash
npm init jest@latest
```

## Configuration

### jest.config.ts (TypeScript)

```typescript
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Path to Next.js app for loading next.config.js and .env files
  dir: './',
})

const config: Config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    // Handle path aliases
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/', '<rootDir>/e2e/'],
}

export default createJestConfig(config)
```

### jest.config.js (JavaScript)

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

/** @type {import('jest').Config} */
const config = {
  coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}

module.exports = createJestConfig(config)
```

### jest.setup.ts

```typescript
import '@testing-library/jest-dom'

// Optional: Load environment variables
import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())
```

### What next/jest Auto-Configures

- `transform` using Next.js Compiler (SWC)
- Auto mocking of `.css`, `.module.css`, `.scss` files
- Auto mocking of image imports
- Auto mocking of `next/font`
- Loading `.env` files into `process.env`
- Ignoring `node_modules` and `.next` from transforms
- Loading `next.config.js` for SWC transforms

## Mocking

### Mock Static Assets

Create `__mocks__/fileMock.js`:
```javascript
module.exports = {
  src: '/img.jpg',
  height: 24,
  width: 24,
  blurDataURL: 'data:image/png;base64,imagedata',
}
```

Create `__mocks__/styleMock.js`:
```javascript
module.exports = {}
```

### Mock next/font

Create `__mocks__/nextFontMock.js`:
```javascript
module.exports = new Proxy(
  {},
  {
    get: function getter() {
      return () => ({
        className: 'className',
        variable: 'variable',
        style: { fontFamily: 'fontFamily' },
      })
    },
  }
)
```

### Mock next/navigation

```typescript
// In test file or setup
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}))
```

### Mock next/image

```typescript
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}))
```

## Testing Patterns

### Basic Component Test

```typescript
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '../app/page'

describe('Page', () => {
  it('renders a heading', () => {
    render(<Page />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toBeInTheDocument()
  })
})
```

### Snapshot Test

```typescript
import { render } from '@testing-library/react'
import Page from '../app/page'

it('renders homepage unchanged', () => {
  const { container } = render(<Page />)
  expect(container).toMatchSnapshot()
})
```

### Testing User Interactions

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Counter from '../components/Counter'

describe('Counter', () => {
  it('increments count on click', async () => {
    const user = userEvent.setup()
    render(<Counter />)
    
    const button = screen.getByRole('button', { name: /increment/i })
    await user.click(button)
    
    expect(screen.getByText('Count: 1')).toBeInTheDocument()
  })
})
```

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import useCounter from '../hooks/useCounter'

describe('useCounter', () => {
  it('increments counter', () => {
    const { result } = renderHook(() => useCounter())
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.count).toBe(1)
  })
})
```

### Testing with Providers

```typescript
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '../context/ThemeContext'
import ThemedButton from '../components/ThemedButton'

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  )
}

describe('ThemedButton', () => {
  it('renders with theme', () => {
    renderWithProviders(<ThemedButton>Click me</ThemedButton>)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
```

## Examples

### Testing a Form Component

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginForm from '../components/LoginForm'

describe('LoginForm', () => {
  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<LoginForm onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /submit/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('shows validation errors', async () => {
    const user = userEvent.setup()
    render(<LoginForm onSubmit={jest.fn()} />)

    await user.click(screen.getByRole('button', { name: /submit/i }))

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument()
  })
})
```

### Testing API Route Handlers

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ users: [] })
}

// __tests__/api/users.test.ts
import { GET } from '../../app/api/users/route'

describe('/api/users', () => {
  it('returns users', async () => {
    const response = await GET()
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('users')
  })
})
```

### Testing Component with Data Fetching (Client)

```typescript
import { render, screen, waitFor } from '@testing-library/react'
import UserList from '../components/UserList'

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([{ id: 1, name: 'John' }]),
  })
) as jest.Mock

describe('UserList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders users after loading', async () => {
    render(<UserList />)
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument()
    })
  })
})
```

## Coverage Configuration

```typescript
// jest.config.ts
const config: Config = {
  collectCoverage: true,
  coverageProvider: 'v8',
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!<rootDir>/out/**',
    '!<rootDir>/.next/**',
    '!<rootDir>/*.config.js',
    '!<rootDir>/coverage/**',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

## Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Run specific file
npm test -- path/to/test.ts

# With coverage
npm test -- --coverage

# Update snapshots
npm test -- -u
```
