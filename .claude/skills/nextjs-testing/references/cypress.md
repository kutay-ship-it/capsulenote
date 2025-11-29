# Cypress Setup for Next.js 15+

## Table of Contents
1. [Installation](#installation)
2. [Configuration](#configuration)
3. [E2E Testing](#e2e-testing)
4. [Component Testing](#component-testing)
5. [Advanced Patterns](#advanced-patterns)
6. [CI/CD Integration](#cicd-integration)

## Installation

```bash
npm install -D cypress
# or
npx create-next-app@latest --example with-cypress my-app
```

**Note**: Cypress 13.6.3+ required for TypeScript 5 with `moduleResolution: "bundler"`.

## Configuration

### cypress.config.ts (E2E + Component)

```typescript
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
  },
  video: false,
  screenshotOnRunFailure: true,
  viewportWidth: 1280,
  viewportHeight: 720,
})
```

### E2E Only Configuration

```typescript
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {},
  },
})
```

### Component Testing Only

```typescript
import { defineConfig } from 'cypress'

export default defineConfig({
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
  },
})
```

### Package.json Scripts

```json
{
  "scripts": {
    "cypress:open": "cypress open",
    "cypress:run": "cypress run",
    "cypress:e2e": "start-server-and-test dev http://localhost:3000 'cypress open --e2e'",
    "cypress:e2e:headless": "start-server-and-test dev http://localhost:3000 'cypress run --e2e'",
    "cypress:component": "cypress open --component",
    "cypress:component:headless": "cypress run --component"
  }
}
```

Install `start-server-and-test` for automatic server management:
```bash
npm install -D start-server-and-test
```

### Support Files

#### cypress/support/e2e.ts
```typescript
import './commands'

// Prevent uncaught exceptions from failing tests
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent failing the test
  return false
})
```

#### cypress/support/component.ts
```typescript
import './commands'
import '../../app/globals.css' // Import your global styles

import { mount } from 'cypress/react18'

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)
```

#### cypress/support/commands.ts
```typescript
// Custom commands

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('input[name="email"]').type(email)
  cy.get('input[name="password"]').type(password)
  cy.get('button[type="submit"]').click()
})

Cypress.Commands.add('getBySel', (selector: string) => {
  return cy.get(`[data-testid="${selector}"]`)
})

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
      getBySel(selector: string): Chainable<JQuery<HTMLElement>>
    }
  }
}
```

## E2E Testing

### Basic Navigation Test

```typescript
// cypress/e2e/navigation.cy.ts
describe('Navigation', () => {
  it('should navigate to the about page', () => {
    cy.visit('/')
    cy.get('a[href*="about"]').click()
    cy.url().should('include', '/about')
    cy.get('h1').contains('About')
  })
})
```

### Form Testing

```typescript
// cypress/e2e/login.cy.ts
describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('logs in successfully', () => {
    cy.get('input[name="email"]').type('user@example.com')
    cy.get('input[name="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    
    cy.url().should('include', '/dashboard')
    cy.contains('Welcome').should('be.visible')
  })

  it('shows error for invalid credentials', () => {
    cy.get('input[name="email"]').type('wrong@example.com')
    cy.get('input[name="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    
    cy.get('.error-message').should('contain', 'Invalid credentials')
  })
})
```

### API Interception

```typescript
// cypress/e2e/api.cy.ts
describe('API Testing', () => {
  it('displays users from API', () => {
    cy.intercept('GET', '/api/users', {
      statusCode: 200,
      body: [
        { id: 1, name: 'John Doe' },
        { id: 2, name: 'Jane Doe' },
      ],
    }).as('getUsers')

    cy.visit('/users')
    cy.wait('@getUsers')

    cy.contains('John Doe').should('be.visible')
    cy.contains('Jane Doe').should('be.visible')
  })

  it('handles API errors', () => {
    cy.intercept('GET', '/api/users', {
      statusCode: 500,
      body: { error: 'Server error' },
    }).as('getUsersError')

    cy.visit('/users')
    cy.wait('@getUsersError')

    cy.get('.error-message').should('contain', 'Failed to load users')
  })
})
```

### Testing with Authentication

```typescript
// cypress/e2e/authenticated.cy.ts
describe('Authenticated Routes', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'password123')
  })

  it('accesses protected page', () => {
    cy.visit('/dashboard')
    cy.contains('Dashboard').should('be.visible')
  })

  it('can update profile', () => {
    cy.visit('/profile')
    cy.get('input[name="name"]').clear().type('New Name')
    cy.get('button[type="submit"]').click()
    cy.contains('Profile updated').should('be.visible')
  })
})
```

### Session Management

```typescript
// cypress/support/e2e.ts
Cypress.Commands.add('loginSession', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/login')
    cy.get('input[name="email"]').type(email)
    cy.get('input[name="password"]').type(password)
    cy.get('button[type="submit"]').click()
    cy.url().should('include', '/dashboard')
  })
})

// Usage
describe('With Session', () => {
  beforeEach(() => {
    cy.loginSession('user@example.com', 'password')
  })

  it('stays logged in across tests', () => {
    cy.visit('/dashboard')
    cy.contains('Welcome').should('be.visible')
  })
})
```

## Component Testing

### Basic Component Test

```typescript
// cypress/component/Button.cy.tsx
import Button from '../../components/Button'

describe('<Button />', () => {
  it('renders with text', () => {
    cy.mount(<Button>Click me</Button>)
    cy.get('button').contains('Click me')
  })

  it('handles click events', () => {
    const onClick = cy.stub().as('clickHandler')
    cy.mount(<Button onClick={onClick}>Click me</Button>)
    
    cy.get('button').click()
    cy.get('@clickHandler').should('have.been.calledOnce')
  })

  it('can be disabled', () => {
    cy.mount(<Button disabled>Disabled</Button>)
    cy.get('button').should('be.disabled')
  })
})
```

### Component Test with Props

```typescript
// cypress/component/Card.cy.tsx
import Card from '../../components/Card'

describe('<Card />', () => {
  it('renders title and description', () => {
    cy.mount(
      <Card 
        title="Test Title" 
        description="Test Description"
        imageUrl="/test.jpg"
      />
    )
    
    cy.contains('Test Title').should('be.visible')
    cy.contains('Test Description').should('be.visible')
  })

  it('renders without image', () => {
    cy.mount(<Card title="No Image" description="Description" />)
    cy.get('img').should('not.exist')
  })
})
```

### Testing Pages as Components

```typescript
// cypress/component/Page.cy.tsx
import Page from '../../app/page'

describe('<Page />', () => {
  it('renders the home page', () => {
    cy.mount(<Page />)
    cy.get('h1').contains('Home')
    cy.get('a[href="/about"]').should('be.visible')
  })
})
```

**Note**: Async Server Components are not supported in Cypress Component Testing. Use E2E testing instead.

### Testing with Context Providers

```typescript
// cypress/component/ThemedButton.cy.tsx
import { ThemeProvider } from '../../context/ThemeContext'
import ThemedButton from '../../components/ThemedButton'

describe('<ThemedButton />', () => {
  const mountWithTheme = (component: React.ReactNode, theme = 'light') => {
    return cy.mount(
      <ThemeProvider initialTheme={theme}>
        {component}
      </ThemeProvider>
    )
  }

  it('renders with light theme', () => {
    mountWithTheme(<ThemedButton>Light</ThemedButton>, 'light')
    cy.get('button').should('have.class', 'bg-white')
  })

  it('renders with dark theme', () => {
    mountWithTheme(<ThemedButton>Dark</ThemedButton>, 'dark')
    cy.get('button').should('have.class', 'bg-gray-800')
  })
})
```

## Advanced Patterns

### Custom Test Data

```typescript
// cypress/fixtures/users.json
[
  { "id": 1, "name": "John Doe", "email": "john@example.com" },
  { "id": 2, "name": "Jane Doe", "email": "jane@example.com" }
]

// cypress/e2e/users.cy.ts
describe('Users', () => {
  it('loads user data from fixture', () => {
    cy.fixture('users').then((users) => {
      cy.intercept('GET', '/api/users', users).as('getUsers')
    })

    cy.visit('/users')
    cy.wait('@getUsers')
    
    cy.contains('John Doe').should('be.visible')
  })
})
```

### Testing File Upload

```typescript
// cypress/e2e/upload.cy.ts
describe('File Upload', () => {
  it('uploads a file', () => {
    cy.visit('/upload')
    
    cy.get('input[type="file"]').selectFile('cypress/fixtures/test-image.png')
    cy.get('button[type="submit"]').click()
    
    cy.contains('Upload successful').should('be.visible')
  })

  it('uploads multiple files', () => {
    cy.visit('/upload')
    
    cy.get('input[type="file"]').selectFile([
      'cypress/fixtures/file1.pdf',
      'cypress/fixtures/file2.pdf',
    ])
    
    cy.get('.file-list').children().should('have.length', 2)
  })
})
```

### Viewport Testing

```typescript
// cypress/e2e/responsive.cy.ts
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
]

describe('Responsive Design', () => {
  viewports.forEach((viewport) => {
    context(`${viewport.name} viewport`, () => {
      beforeEach(() => {
        cy.viewport(viewport.width, viewport.height)
      })

      it('displays navigation correctly', () => {
        cy.visit('/')
        
        if (viewport.name === 'mobile') {
          cy.get('[data-testid="mobile-menu"]').should('be.visible')
          cy.get('[data-testid="desktop-nav"]').should('not.be.visible')
        } else {
          cy.get('[data-testid="desktop-nav"]').should('be.visible')
        }
      })
    })
  })
})
```

### Network Throttling

```typescript
// cypress/e2e/slow-network.cy.ts
describe('Slow Network', () => {
  it('shows loading state', () => {
    cy.intercept('GET', '/api/data', (req) => {
      req.on('response', (res) => {
        res.setDelay(2000) // 2 second delay
      })
    }).as('getData')

    cy.visit('/data')
    cy.get('.loading-spinner').should('be.visible')
    cy.wait('@getData')
    cy.get('.loading-spinner').should('not.exist')
    cy.get('.data-content').should('be.visible')
  })
})
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/cypress.yml
name: Cypress Tests

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  cypress-e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build

      - name: Cypress E2E tests
        uses: cypress-io/github-action@v6
        with:
          start: npm start
          wait-on: 'http://localhost:3000'
          browser: chrome
          spec: cypress/e2e/**/*.cy.ts

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: cypress-screenshots
          path: cypress/screenshots

  cypress-component:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Cypress Component tests
        uses: cypress-io/github-action@v6
        with:
          component: true
          browser: chrome
```

### Running in CI

```bash
# E2E tests (headless)
npm run cypress:e2e:headless

# Component tests (headless)
npm run cypress:component:headless

# Run specific spec
npx cypress run --spec "cypress/e2e/login.cy.ts"

# Record to Cypress Cloud
npx cypress run --record --key YOUR_RECORD_KEY
```

## Debugging

```bash
# Open interactive mode
npm run cypress:open

# Debug specific test
npx cypress open --e2e --browser chrome
```

### Adding Debug Points

```typescript
describe('Debug', () => {
  it('debugging example', () => {
    cy.visit('/')
    cy.pause() // Pause execution
    cy.debug() // Log to console
    cy.get('button').debug() // Debug specific element
  })
})
```

### Time Travel Debugging

Use the Cypress Test Runner to:
- Click on each command to see state at that point
- Inspect DOM snapshots
- View network requests
- See console logs
