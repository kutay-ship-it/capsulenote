# Contributing to DearMe

Thank you for your interest in contributing to DearMe! This document provides guidelines and instructions for contributing.

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

## Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Dearme.git
   cd Dearme
   ```
3. **Install dependencies**
   ```bash
   pnpm install
   ```
4. **Set up environment**
   ```bash
   cp apps/web/.env.example apps/web/.env.local
   # Fill in your environment variables
   ```
5. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code style (enforced by ESLint and Prettier)
- Write meaningful commit messages
- Add comments for complex logic

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

Examples:
```
feat: add letter scheduling with timezone support
fix: resolve email delivery race condition
docs: update deployment guide
```

### Pull Request Process

1. **Update documentation** if you're adding features
2. **Add tests** if applicable
3. **Run checks** before submitting:
   ```bash
   pnpm format
   pnpm lint
   pnpm typecheck
   ```
4. **Create pull request** with clear description
5. **Address review comments**

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
```

## Project Structure

```
dearme/
├── apps/web/          # Main Next.js application
├── packages/
│   ├── prisma/       # Database schema
│   ├── types/        # Shared types
│   ├── ui/           # UI components
│   └── config/       # Shared config
└── workers/inngest/  # Background jobs
```

## Development Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm dev:web          # Start web app only

# Database
pnpm db:generate      # Generate Prisma client
pnpm db:push          # Push schema changes
pnpm db:migrate       # Create migration
pnpm db:studio        # Open database GUI

# Code Quality
pnpm format           # Format code
pnpm lint             # Run linter
pnpm typecheck        # Type check

# Build
pnpm build            # Build all apps
```

## Areas for Contribution

### Good First Issues

Look for issues labeled `good first issue`:
- Documentation improvements
- UI polish
- Bug fixes
- Test coverage

### Feature Requests

- Check existing issues first
- Discuss in issues before implementing
- Consider backwards compatibility

### Bug Reports

When reporting bugs, include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details

## Database Changes

When modifying the database schema:

1. Edit `packages/prisma/schema.prisma`
2. Create migration:
   ```bash
   pnpm db:migrate
   ```
3. Update Prisma client:
   ```bash
   pnpm db:generate
   ```
4. Update TypeScript types if needed
5. Document breaking changes

## Testing

### Manual Testing

1. Test the happy path
2. Test edge cases
3. Test error handling
4. Test different browsers/devices

### Automated Testing (Coming Soon)

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e
```

## Documentation

When adding features:

1. Update relevant `.md` files
2. Add inline code comments
3. Update API documentation
4. Add examples if helpful

## Questions?

- Check [DEVELOPMENT.md](./DEVELOPMENT.md)
- Review [ARCHITECTURE.md](./ARCHITECTURE.md)
- Ask in GitHub Discussions
- Open an issue

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- README.md
- Release notes
- GitHub contributors page

Thank you for contributing to DearMe! 🎉
