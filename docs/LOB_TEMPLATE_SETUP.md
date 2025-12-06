# Lob Template Setup Guide

This guide explains how to configure Capsule Note to use Lob's stored templates for physical mail delivery.

## Overview

Capsule Note supports two methods for sending physical letters via Lob:

1. **Stored Templates** (Recommended): Upload a template to Lob Dashboard, then send only merge variables from the server. More reliable, avoids inline HTML size limits.

2. **Inline HTML** (Fallback): Generate full HTML on the server and send it with each request. Subject to 10,000 character limit.

## Quick Start

### 1. Upload Template to Lob Dashboard

1. Go to [Lob Dashboard Templates](https://dashboard.lob.com/templates)
2. Click **Create Template**
3. Copy the contents of `docs/lob-production-template.html`
4. Paste into the template editor
5. Click **Save**
6. Note the generated IDs:
   - Template ID: `tmpl_xxxxxxxxxxxxxx`
   - Version ID: `vrsn_xxxxxxxxxxxxxx`

### 2. Set Environment Variables

Add to your `.env.local` (development) or production environment:

```bash
# Required: Template ID from Lob Dashboard
LOB_TEMPLATE_ID=tmpl_xxxxxxxxxxxxxx

# Optional: Specific version (uses latest if omitted)
LOB_TEMPLATE_VERSION_ID=vrsn_xxxxxxxxxxxxxx
```

### 3. Verify Configuration

The server logs will show which path is being used:

```
[Lob] Template configured { templateId: "tmpl_xxx", templateVersionId: "vrsn_xxx" }
```

If template is NOT configured:
```
[Lob] No template ID configured, will use inline HTML
```

## Template Files

| File | Purpose |
|------|---------|
| `docs/lob-production-template.html` | **Production template** - Upload this to Lob Dashboard |
| `docs/lob-dashboard-template.html` | Debug version with visual guides for address/QR zones |

## Merge Variables

The server sends these variables to be merged into the template:

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `recipient_name` | String | Name in greeting | "Future Self" |
| `letter_content` | HTML | Letter body content (unescaped) | "<p>Hello...</p>" |
| `written_date` | String | Formatted write date | "January 1, 2024" |
| `delivery_date` | String | Formatted delivery date | "December 25, 2024" |
| `letter_title` | String | Optional title (empty if none) | "New Year Reflections" |

### Code Reference

Merge variables are built in `apps/web/server/providers/lob.ts`:

```typescript
function buildLobMergeVariables(options: TemplatedLetterOptions) {
  return {
    recipient_name: options.recipientName ?? "Future Self",
    letter_content: sanitizeLetterContentForPrint(options.letterContent),
    written_date: format(options.writtenDate, "MMMM d, yyyy"),
    delivery_date: format(options.deliveryDate ?? new Date(), "MMMM d, yyyy"),
    letter_title: options.letterTitle ?? "",
  }
}
```

## Handlebars Syntax

Lob templates use [Handlebars](https://handlebarsjs.com/) syntax:

| Syntax | Description | Example |
|--------|-------------|---------|
| `{{variable}}` | Escaped output | `{{recipient_name}}` |
| `{{{variable}}}` | Unescaped HTML | `{{{letter_content}}}` |
| `{{#if var}}...{{/if}}` | Conditional | `{{#if letter_title}}...{{/if}}` |
| `{{#if var}}...{{else}}...{{/if}}` | If/else | Show fallback if empty |

### Important: Unescaped HTML

The `letter_content` variable contains HTML and must use triple braces `{{{letter_content}}}` to render properly. Using double braces would escape the HTML tags.

### Empty String Handling

In Handlebars, an empty string `""` is **falsy**, so:
- `{{#if letter_title}}` evaluates to `false` when `letter_title` is `""`
- The `{{else}}` branch will be used

## Lob Page Specifications

When customizing templates, respect these Lob specifications:

```
Page Size: 8.5" x 11" (US Letter)

Reserved Zones (DO NOT place content here):
- Address Block: 3.15" x 2" at left: 0.6", top: 0.84"
- QR Code Area: 0.58" x 0.58" at bottom-left

Safe Zone: 1/8" (0.125") from all edges
```

## Fallback Behavior

If the template send fails with a validation error, the system automatically falls back to inline HTML:

```typescript
if (shouldFallbackToInline) {
  console.warn("[Lob] Template send failed, falling back to inline HTML")
  return sendInlineLetter()
}
```

This ensures letters still send even if there's a template configuration issue.

## Testing

### Unit Test

The test file `apps/web/__tests__/unit/lob-template-send.test.ts` verifies template usage:

```bash
pnpm test -- lob-template-send
```

### Manual Test

1. Set `LOB_TEMPLATE_ID` to your test template
2. Create a letter and schedule physical mail delivery
3. Check server logs for `[Lob] Template configured`
4. Verify in Lob Dashboard that the letter used merge variables (not inline HTML)

### Test vs Live API Keys

- **Test keys** (`test_xxx`): Create mock letters, no actual mail sent
- **Live keys** (`live_xxx`): Send real physical mail

Always use test keys during development.

## Troubleshooting

### "No template ID configured, will use inline HTML"

**Cause**: `LOB_TEMPLATE_ID` environment variable not set.

**Fix**: Add the template ID to your environment variables.

### Template validation error (422)

**Cause**: Template in Lob Dashboard doesn't match expected merge variables.

**Fix**:
1. Re-upload `docs/lob-production-template.html` to Lob
2. Ensure all merge variable names match exactly
3. Check for typos in variable names

### Letter content appears escaped

**Cause**: Template uses `{{letter_content}}` instead of `{{{letter_content}}}`.

**Fix**: Use triple braces for HTML content: `{{{letter_content}}}`

### Address prints over content

**Cause**: Content placed in the reserved address zone.

**Fix**: Ensure `.page-content` starts at `top: 3in` (below address block).

## Architecture Flow

```
User writes letter
       ↓
Server Action: scheduleDelivery()
       ↓
Check LOB_TEMPLATE_ID env var
       ↓
┌──────┴──────┐
│ Template    │ No Template
│ Configured  │ Configured
└──────┬──────┘      │
       ↓             ↓
Build merge    Render inline
variables      HTML template
       ↓             │
sendLetter({        │
  template_id,      │
  merge_variables   │
})                  │
       ↓             ↓
       └─────┬───────┘
             ↓
      Lob API Request
             ↓
      Physical Mail Sent
```

## Related Files

- `apps/web/server/providers/lob.ts` - Main Lob provider implementation
- `apps/web/server/templates/mail/` - Inline HTML template rendering
- `apps/web/env.mjs` - Environment variable definitions
- `apps/web/__tests__/unit/lob-template-send.test.ts` - Unit tests
- `workers/inngest/functions/deliver-mail.ts` - Background mail delivery job
