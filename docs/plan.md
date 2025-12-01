# Encryption & Preview Plan

1) Product/security decision on deferred access  
   - Reasoning: Clarify whether users are blocked from decrypting full letters before deliver date and what preview data (title + snippet) can remain plaintext without violating privacy.  
   - Evidence: Current flow encrypts body at creation (`apps/web/server/actions/letters.ts#createLetter`), decrypts for reads (`apps/web/server/actions/letters.ts#getLetter/getLetterById`), and decrypts inside the worker at send time (`workers/inngest/functions/deliver-email.ts:364-418`). Any plaintext snippet changes the threat model and retention expectations.  
   - Ticket-ready tasks: Write an ADR describing the new access model (preview-only pre-delivery, full decrypt post-delivery); define data classification for title/snippet and retention window; get legal/privacy review for storing snippets; add a feature flag (`PREVIEW_SNIPPETS_ENABLED`) and rollout plan (dev → beta → prod) with an explicit kill switch; note that existing API consumers expect decrypted bodies today (adjust contract docs).

2) Add a denormalized preview column (first 100 chars) to `letters`  
   - Reasoning: Avoid decrypting full bodies for list/search/previews while keeping full encryption for content. Speeds common reads and reduces crypto/DB payload size.  
   - Evidence: Lists already avoid encrypted fields (`getLetters` in `apps/web/server/actions/letters.ts`), but any preview today would require a decrypt; schema currently has no preview column (`packages/prisma/schema.prisma` `Letter` model). Worker decrypt cost is tied to full body size; a preview field allows lightweight reads for dashboards and search.  
   - Ticket-ready tasks: Add `previewText String?` with index to `packages/prisma/schema.prisma`; create migration and regenerate Prisma client; add a partial index if we only store previews for “locked” letters; update type exports so downstream packages see the new field; document DB storage format (plain text, no HTML) to avoid XSS when rendered.

3) Populate preview on create/update and backfill existing data  
   - Reasoning: Ensures previews exist without extra decrypts at read time; keeps preview aligned with encrypted content.  
   - Evidence: Letter create/update already has decrypted/plaintext in memory before encryption (`apps/web/server/actions/letters.ts`).  
   - Ticket-ready tasks: On create/update, derive first 100 chars of plain text (strip tags, collapse whitespace) and store in `previewText`; add a background backfill script that decrypts existing letters in batches (rate-limited) and populates previews; add unit tests for sanitization, length, and non-ASCII handling; add a one-time migration guard to skip already-populated rows; ensure previews update when body changes and are cleared if decrypt fails to avoid stale/empty previews.

4) Access control for early decrypt/read  
   - Reasoning: If policy is “no full decrypt before delivery date,” enforce it server-side to prevent client circumvention while still allowing backend delivery decrypt.  
   - Evidence: `getLetter` currently decrypts for any owner request (`apps/web/server/actions/letters.ts`), and worker decrypts at delivery time.  
   - Ticket-ready tasks: In `getLetter` (and any API serving letter content), gate full decrypt behind the earliest scheduled delivery date (or role override); if locked, return metadata + preview only; add UX copy/state for “locked until <date/timezone>”; ensure Inngest worker bypasses the gate (still decrypts for delivery); add integration tests for locked vs unlocked reads and reschedules; review any public share routes (e.g., `view/:token` if exists) to ensure they respect the lock.

5) Measure impact and tune crypto/perf  
   - Reasoning: Validate that previews materially reduce latency and CPU; identify if slowness was crypto or Inngest wait.  
   - Evidence: Crypto is done via WebCrypto AES-GCM (`apps/web/server/lib/encryption.ts`); Inngest delivery flow performs multiple DB reads and decrypt (`workers/inngest/functions/deliver-email.ts`).  
   - Ticket-ready tasks: Add tracing spans/metrics around encrypt/decrypt and Inngest steps (e.g., OpenTelemetry/Next instrumentation); capture cold vs warm performance; run a load test comparing list/detail endpoints before and after previews; define success criteria (p50/p95 latency, CPU, and DB read volume); add dashboards/alerts if decrypt latency or error rate spikes; track Inngest step timings (sleep vs decrypt vs send) to separate crypto cost from scheduling/IO.
