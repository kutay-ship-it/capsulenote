# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed by pnpm + Turbo.
- `apps/web`: Next.js 15 app (App Router, shadcn/ui, Tailwind, Clerk).
- `workers/inngest`: durable job handlers.
- `packages/prisma`: Prisma schema/migrations; `packages/types`: shared Zod/TS; `packages/config`: ESLint/TS configs; `packages/ui`: shared UI.
- `docs/`, `audit/`, and `scripts/` hold architecture notes, logging/export helpers, and one-off tooling.

## Build, Test, and Development Commands
- `pnpm install`: install workspace deps.
- `pnpm dev` or `pnpm dev:web+worker`: run web (and Inngest) in watch mode via Turbo; add `--filter web` to isolate.
- `pnpm build`: Turbo build all packages.
- `pnpm lint` / `pnpm typecheck`: ESLint + TS across workspaces.
- `pnpm db:generate | db:push | db:migrate | db:seed`: Prisma workflows (loads env from `apps/web/.env.local`).
- `pnpm format`: Prettier + Tailwind plugin.

## Coding Style & Naming Conventions
- TypeScript everywhere; keep server-only logic in `apps/web/server` and shared types in `packages/types`.
- Prettier config: 2-space indentation, no semicolons, double quotes, 100-char line width, Tailwind class sorting.
- React components: PascalCase files (e.g., `RichTextEditor.tsx`); hooks `useX`; routes/use-case folders kebab-case under `app/`.
- Favor server components and typed Server Actions; co-locate styles with components using Tailwind utility-first patterns.

## Testing Guidelines
- Unit/integration: Vitest in `apps/web/__tests__` or alongside components (`*.test.ts[x]`); run `pnpm test` or `pnpm --filter web test`.
- Coverage: `pnpm --filter web test:coverage`.
- E2E: Playwright config at `apps/web/playwright.config.ts`; run `pnpm --filter web test:e2e` (use `test:e2e:ui` for debugging).
- Mock external services (Clerk, Resend, Stripe, Inngest) and seed minimal fixtures; prefer deterministic dates/timezones.

## Commit & Pull Request Guidelines
- Follow Conventional Commits with scopes (examples from history: `feat(pricing): ...`, `fix(mail-template): ...`, `chore: ...`).
- PRs should include: what changed, why, linked issue/ticket, screenshots for UI changes, and test evidence (`pnpm test`, e2e if relevant).
- Keep branches short-lived; rebase onto main before requesting review.

## UX & Accessibility
- Align with `VISUAL_DESIGN_INDEX.md` and `VISUAL_DESIGN_QUICK_REFERENCE.md` for patterns, motion, and spacing.
- Ensure meaningful labels/ARIA for interactive elements; maintain contrast and keyboard flows.

## Security & Configuration Tips
- Copy `apps/web/.env.example` to `.env.local`; never commit secrets or production keys.
- Sentry, Resend, Stripe, Clerk, and Upstash keys must be set locally before running jobs or e2e.
- When touching Prisma schema, run `pnpm db:migrate` + `pnpm db:generate` and note breaking changes in PR.
