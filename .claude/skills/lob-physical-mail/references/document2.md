Let’s wire Capsule Note to Lob step‑by‑step so you can reliably send real letters to users and their loved ones.

I’ll focus on:

* **Templates via API**
* **Letters API** (with envelopes, B&W / color, single / double sided, return envelopes, certified mail, etc.)
* **Address verification** (US + international; autocomplete)
* **Mail types, use_type, tracking & webhooks, cancellation, API states**
* Concrete **request examples** for common Capsule Note scenarios

---

## 0. Mental model: how Lob fits Capsule Note

For Capsule Note, each “capsule” (a letter to self or a loved one) will map roughly to:

* A **Lob Letter** (`/v1/letters`)
* A **From address** (your app / brand or sender)
* A **To address** (recipient)
* Optional **HTML template** with `merge_variables` for personalization
* Optional **return envelope** setup, certified mail, tracking, etc.

Lob does:

* Printing (B&W or color, single or double‑sided, different sizes)
* Automatic envelope insertion (#10 double window or flat envelope)([Lob Help Center][1])
* Mailing via USPS with tracking events and webhooks([GitHub][2])
* Address verification APIs (US + international + autocomplete)([GitHub][2])

Your backend will:

1. Validate addresses (using **publishable** key).
2. Create/update templates.
3. Create letters (using **secret** key).
4. Receive webhooks to keep Capsule Note status in sync.

---

## 1. API keys, auth, environments, rate limits

### 1.1 Keys & auth

* **Secret keys** (e.g. `test_xxx`, `live_xxx`):

  * Full access to Print & Mail + AV.
  * **Only use on backend.**

* **Publishable keys** (e.g. `test_pub_xxx`):

  * Limited to **US Verifications, Intl Verifications, and Autocompletions**.
  * Safe for client‑side usage (web/mobile).([GitHub][2])

**Auth:** HTTP Basic

```http
Authorization: Basic base64("<API_KEY>:")
```

Password is blank. All API requests go to:

```text
https://api.lob.com/v1/...
```

If auth fails you’ll get `401` errors.([GitHub][2])

### 1.2 Test vs Live

* Each key has **test** & **live** pair.
* Responses include a `mode` field (`test` or `live`).
* Test mode uses **fake printing/mailing**, but the API behaves the same.
* Some tracking events and send_date features may be restricted in free / lower editions.([Lob Help Center][3])

### 1.3 Rate limits & idempotency

* Default rate limit: **150 requests / 5 seconds / endpoint**
* US Verifications & US Autocompletions: **300 / 5 seconds**([GitHub][4])
* On limit: HTTP `429` with a JSON error.

Use **idempotency keys** when creating letters:

```http
Idempotency-Key: 8d21e4d0-32ef-4d1a-8363-1f451f0b5850
```

* If you retry the same POST with the same key, you’ll get the same letter back, no duplicates.
* Keys expire after 24h and are scoped by environment + resource.([GitHub][4])

---

## 2. Data model for Capsule Note

Recommended internal tables:

* `users` – Capsule Note users.
* `contacts` – Recipients (name, address fields).
* `lob_addresses` – Lob address IDs if you choose to persist them.
* `templates` – Local records mapping to Lob `tmpl_...` and `vrsn_...`.
* `letters` – Capsule records mapping to Lob `ltr_...` + status + metadata.

Pattern:

1. User types content + recipient.
2. Frontend verifies address via Lob AV (publishable key).
3. Backend creates/updates a **Template** (if needed) and calls **Letters API**.
4. Store `ltr_...`.
5. Webhook events update your `letters.status` (created, mailed, delivered, etc).

---

## 3. Address verification

You **should** verify addresses before sending any mail to reduce undeliverables and avoid 422 errors from Lob when using strict settings.([Lob Help Center][5])

### 3.1 US Verifications (single address)

Endpoint: `POST /v1/us_verifications`([GitHub][2])

You can submit either:

* A free‑form `address` string; **or**
* Structured fields (`primary_line`, `secondary_line`, `city`, `state`, `zip_code`, `urbanization`).

**Example (client‑side with publishable key, JSON):**

```bash
curl https://api.lob.com/v1/us_verifications \
  -u test_pub_xxxxxxxxxxxxxxxx: \
  -H "Content-Type: application/json" \
  -d '{
    "primary_line": "210 King Street",
    "city": "San Francisco",
    "state": "CA",
    "zip_code": "94107"
  }'
```

Important fields in response:

* `deliverability` – one of:

  * `deliverable`
  * `deliverable_missing_unit`
  * `deliverable_incorrect_unit`
  * `deliverable_unnecessary_unit`
  * `undeliverable` / `no_match`([Lob][6])

* `primary_line`, `secondary_line`, `last_line` – standardized USPS address lines.

* `components` – ZIP+4, carrier route, etc.

Capsule Note flow:

* If `deliverability` is clearly bad (`undeliverable` / `no_match`), show a warning and ask user to confirm or correct.
* Otherwise, auto-fill the corrected address for them.

### 3.2 Intl Verifications

Endpoint: `POST /v1/intl_verifications`([GitHub][2])

Body is similar but with `primary_line`, `secondary_line`, `city`, `state`, `postal_code`, `country`.

Use this when users send letters abroad.

### 3.3 Autocompletions (address suggestions)

For type‑ahead UX:

* **US Autocompletions:** `POST /v1/us_autocompletions`
* **Intl Autocompletions:** `POST /v1/intl_autocompletions`([GitHub][2])

Example body (US):

```json
{
  "address_prefix": "210 King",
  "city": "San Francisco",
  "state": "CA",
  "zip_code": "94107"
}
```

Response: up to **10 suggested full addresses**.([Postman][7])

You can then feed a selected suggestion into US Verifications to validate.

### 3.4 Test environment tricks

With **test keys** you can use magic values to simulate many deliverability scenarios. For US:

* `primary_line` or `address` like `"missing unit"` → `deliverable_missing_unit`, etc.([GitHub][2])

Super useful for automated tests.

---

## 4. Templates: how to design & create via API

Lob templates are reusable HTML chunks, used by letters, postcards, checks, etc. They let you avoid sending gigantic HTML strings on every request.([GitHub][4])

### 4.1 HTML template basics

Key design rules (summarized):([GitHub][4])

* Use **inline CSS** or `<style>` in `<head>`, not external CSS.
* Host images on a fast CDN (e.g. S3) and use 300dpi.
* Keep total asset size ≤ ~5MB.
* Test always in Lob test mode and inspect the generated PDF (what Lob prints ≠ what your browser renders).
* Fonts should be embedded in PDFs; or use Lob’s “standard PDF fonts” set if not embedded.([GitHub][4])

For Capsule Note, a simple handlebars‑style template example:

```html
<html>
  <body style="padding: 1in; font-family: 'Helvetica', Arial, sans-serif;">
    <p>Dear {{recipient_name}},</p>

    <p>{{message_body}}</p>

    <p style="margin-top: 2em;">With love,</p>
    <p>{{sender_name}}</p>
  </body>
</html>
```

Later we’ll pass `merge_variables: { "recipient_name": "...", "message_body": "...", "sender_name": "..." }`.

### 4.2 Creating templates via API

The Templates endpoints are marked as **Beta** but publicly documented and used in the bundled OpenAPI spec.([GitHub][4])

**Create initial template**

Endpoint (inferred from OpenAPI & naming):

```http
POST /v1/templates
```

Example:

```bash
curl https://api.lob.com/v1/templates \
  -u test_xxxxxxxxxxxxxxxx: \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Capsule Note Letter Template",
    "html": "<html>...{{recipient_name}}...{{message_body}}...</html>",
    "engine": "handlebars",
    "metadata": {
      "app": "capsule-note",
      "type": "base-letter"
    }
  }'
```

Response will include:

* `id` – template id `tmpl_...`
* `versions` – array with at least 1 version `vrsn_...`
* `published_version` – which version is “live”.

### 4.3 Creating a new template version

Endpoint (from spec):

```http
POST /v1/templates/{tmpl_id}/versions
```

Body shape: `template_version_writable` with `description` + `html`.([GitHub][4])

Example:

```bash
curl https://api.lob.com/v1/templates/tmpl_abc123/versions \
  -u test_xxxxxxxxxxxxxxxx: \
  -H "Content-Type: application/json" \
  -d '{
    "description": "v2 – new typography",
    "html": "<html>...Updated HTML with {{recipient_name}}...</html>"
  }'
```

Then you typically **promote** that version:

```http
PATCH /v1/templates/{tmpl_id}
```

Body (from `template_update`):([GitHub][4])

```bash
curl https://api.lob.com/v1/templates/tmpl_abc123 \
  -u test_xxxxxxxxxxxxxxxx: \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Capsule Note Letter Template v2",
    "published_version": "vrsn_def456"
  }'
```

### 4.4 Listing & retrieving templates

List templates:

```bash
curl "https://api.lob.com/v1/templates?limit=10" \
  -u test_xxxxxxxxxxxxxxxx:
```

List versions:

```bash
curl "https://api.lob.com/v1/templates/tmpl_abc123/versions?limit=5" \
  -u test_xxxxxxxxxxxxxxxx:
```

([GitHub][4])

You can expose these IDs in Capsule Note’s admin UI so non‑devs can pick which Lob template / version a given feature uses.

---

## 5. Letters API: creating, envelopes, printing options

### 5.1 How envelopes work (good news)

You **do not** have to manage standard outer envelopes yourself:

* Letters are automatically mailed in a **standard #10 double‑window** envelope, or a **flat 9x12 envelope** if page count is high.([Lob Help Center][1])
* Your only job is ensuring address placement (`address_placement`) aligns with windows.

Extra envelope features (return envelopes, custom envelopes, certified mail envelopes) are controlled by parameters on the Letter object.([Lob Help Center][8])

### 5.2 Key letter fields

From the OpenAPI letter schema & Lob examples:([GitHub][9])

When **creating** a letter:

* `description` – internal note (string).
* `to` – address id or inline address object.
* `from` – address id or inline; required for all letters in practice.([Lob Help Center][1])
* `file` – HTML string, PDF URL, or **template id** (`tmpl_...`).
* `merge_variables` – JSON object for template placeholders.
* `color` – boolean; `false` => black & white, `true` => color.([pipedream.com][10])
* `double_sided` – boolean; duplex vs simplex printing.
* `address_placement` – `"top_first_page"` or `"insert_blank_page"`.([Lob Help Center][1])
* `mail_type` – `"usps_first_class"` or `"usps_standard"`.([Postman][11])
* `use_type` – `"marketing"` or `"operational"`.([Lob Help Center][12])
* `return_envelope` – boolean or string; enables reply envelope.([Lob Help Center][8])
* `perforated_page` – integer page where tear‑off / reply slip lives (must be set with `return_envelope`).([Lob Help Center][13])
* `return_address` – for reply mail tracking (higher editions).([Lob Help Center][8])
* `extra_service` – e.g. `"certified"` or `"certified_return_receipt"` for USPS Certified Mail / return receipt add‑ons.([Lob Help Center][14])
* `send_date` – ISO timestamp for scheduled mailings & extended cancellation control.([Lob Help Center][3])
* `metadata` – up to 20 key/value pairs (strings) for analytics and filtering.([GitHub][4])
* `cards` – optional card IDs to affix.([GitHub][9])

### 5.3 Mail use type (`use_type`)

Lob **requires** a mail use type on every piece, or an account‑level default:

* `marketing` – promotional mail (campaigns, offers, etc.).
* `operational` – transactional or service‑related (password reset, bills, personal notices, etc.).([Lob Help Center][15])

If neither account default nor per‑request `use_type` is set, you get a 422 `MAIL_USE_TYPE_CAN_NOT_BE_NULL` error.([Lob Help Center][13])

For Capsule Note, most letters to yourself or loved ones will be **operational** (not marketing).

### 5.4 Mail type (`mail_type`)

* `usps_first_class` – faster, more expensive, supports Certified Mail and other extras.
* `usps_standard` – cheaper, slower, domestic; typically only allowed for marketing mail.([Postman][11])

If not set, letters default to first‑class.

---

## 6. End‑to‑end letter examples for Capsule Note

### 6.1 Scenario A – Simple B&W, single‑sided letter using HTML (no template)

**Goal:** User writes a message to themself; we print a simple black & white, single‑sided letter.

```bash
curl https://api.lob.com/v1/letters \
  -u test_xxxxxxxxxxxxxxxx: \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: 6b3f4a21-0a17-4d4e-9b05-efcb4ea23456" \
  -d '{
    "description": "Capsule to future self",
    "to": {
      "name": "Future Me",
      "address_line1": "210 King Street",
      "address_city": "San Francisco",
      "address_state": "CA",
      "address_zip": "94107"
    },
    "from": {
      "name": "Current Me",
      "address_line1": "210 King Street",
      "address_city": "San Francisco",
      "address_state": "CA",
      "address_zip": "94107"
    },
    "file": "<html><body style=\"padding:1in;font-size:14px;\">Dear future me,<br/><br/>{{message_body}}</body></html>",
    "merge_variables": {
      "message_body": "I hope you are proud of how far you have come."
    },
    "color": false,
    "double_sided": false,
    "address_placement": "top_first_page",
    "use_type": "operational",
    "mail_type": "usps_first_class",
    "metadata": {
      "capsule_id": "cap_123",
      "user_id": "user_456"
    }
  }'
```

Key bits for your use case:

* `color: false` → B&W.
* `double_sided: false` → single‑sided.
* `address_placement: "top_first_page"` → Lob prints addresses at top of page; must keep that zone clear in HTML.([Lob Help Center][1])

### 6.2 Scenario B – Color, double‑sided, template‑based love letter

Now using a saved Lob template `tmpl_love123`:

```bash
curl https://api.lob.com/v1/letters \
  -u test_xxxxxxxxxxxxxxxx: \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Anniversary capsule",
    "to": {
      "name": "Alex Doe",
      "address_line1": "50 Main Street",
      "address_city": "Brooklyn",
      "address_state": "NY",
      "address_zip": "11201"
    },
    "from": {
      "name": "Jordan Doe",
      "address_line1": "500 Market Street",
      "address_city": "San Francisco",
      "address_state": "CA",
      "address_zip": "94103"
    },
    "file": "tmpl_love123",
    "merge_variables": {
      "recipient_name": "Alex",
      "sender_name": "Jordan",
      "message_body": "Happy anniversary! Here are my favorite memories of us..."
    },
    "color": true,
    "double_sided": true,
    "address_placement": "insert_blank_page",
    "use_type": "operational",
    "mail_type": "usps_first_class"
  }'
```

Notes:

* `file` is the **template id**.
* `merge_variables` match your template placeholders.
* `address_placement: "insert_blank_page"` – Lob will insert a blank address page at the front; your content starts page 2 and you’re billed for the extra page.([Lob Help Center][1])

Great when your design doesn’t leave room at the top for the address block.

### 6.3 Scenario C – Scheduled send (override cancellation window)

Use **send_date** to delay production and extend cancellation time.([Lob Help Center][3])

```bash
curl https://api.lob.com/v1/letters \
  -u live_xxxxxxxxxxxxxxxx: \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Birthday letter",
    "to": { ... },
    "from": { ... },
    "file": "tmpl_birthday01",
    "merge_variables": { ... },
    "color": true,
    "double_sided": false,
    "address_placement": "top_first_page",
    "use_type": "operational",
    "mail_type": "usps_first_class",
    "send_date": "2026-05-10T14:00:00Z"
  }'
```

* The letter will stay **cancelable** until Lob begins production at that timestamp (subject to edition limits).([Lob Help Center][3])
* If you omit `send_date`, the default account cancellation window applies (e.g. 4 hours).([Lob Help Center][3])

### 6.4 Scenario D – Letter with return envelope + tracking

Higher edition feature, but important for completeness.([Lob Help Center][8])

```bash
curl https://api.lob.com/v1/letters \
  -u live_xxxxxxxxxxxxxxxx: \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Billing letter with remittance",
    "to": { ...customer address... },
    "from": { ...your address... },
    "file": "tmpl_invoice01",
    "merge_variables": { ... },
    "color": false,
    "double_sided": true,
    "address_placement": "top_first_page",
    "use_type": "operational",
    "mail_type": "usps_first_class",
    "return_envelope": true,
    "perforated_page": 2,
    "return_address": {
      "name": "Capsule Note Remittance",
      "address_line1": "900 Payment Way",
      "address_city": "San Jose",
      "address_state": "CA",
      "address_zip": "95112"
    }
  }'
```

This will:

* Add a #9 reply envelope, plus a perforated tear‑off area on page 2 containing the return address & barcode.([Lob Help Center][8])
* Enable **return envelope tracking** events: `letter.return_envelope.in_transit`, `letter.return_envelope.delivered`, etc.([Lob Help Center][8])

### 6.5 Scenario E – Certified Mail + electronic return receipt

For highly sensitive letters (legal or compliance):([Lob Help Center][14])

```bash
curl https://api.lob.com/v1/letters \
  -u live_xxxxxxxxxxxxxxxx: \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Important legal notice",
    "to": { ...US address... },
    "from": { ...US address... },
    "file": "tmpl_notice01",
    "color": false,
    "double_sided": false,
    "address_placement": "top_first_page",
    "use_type": "operational",
    "mail_type": "usps_first_class",
    "extra_service": "certified_return_receipt"
  }'
```

Setting `extra_service` to:

* `"certified"` – Certified Mail.
* `"certified_return_receipt"` – Certified Mail + electronic return receipt.

Tracking events are then `letter.certified.*` variants.([GitHub][2])

---

## 7. Cancelling letters before the deadline

### 7.1 Default cancellation window

* New accounts: default ~4‑hour cancellation window after creation.([Lob Help Center][3])
* Higher editions can configure different windows in dashboard settings.([Lob Help Center][3])

After the window, mail is locked and cannot be canceled.

### 7.2 Cancel via API

Endpoint (from OpenAPI spec):

```http
DELETE /v1/letters/{letter_id}
```

Example:

```bash
curl -X DELETE https://api.lob.com/v1/letters/ltr_123456789 \
  -u live_xxxxxxxxxxxxxxxx:
```

If successful:

* You get a “deleted” flag on the letter object and a `letter.deleted` event.([GitHub][9])

If too late:

* You get a 422 with an error code indicating the letter can no longer be canceled (see Lob error reference).([Lob Help Center][13])

### 7.3 Using send_date to override cancellation window

As discussed earlier, setting `send_date` pushes production start into the future, effectively giving you a longer window to cancel or modify mail.([Lob Help Center][3])

For Capsule Note, you could:

* Let users schedule delivery “on or after” a date.
* Keep a UI “Cancel or edit until X” where X is the send_date minus a small safety margin.

---

## 8. Tracking & all the API “states” for letters

Lob doesn’t have a simple `status` field on the Letter; instead, it uses **webhook events** and `tracking_events` for state transitions. The OpenAPI schema lists **all event types** for letters.([GitHub][2])

### 8.1 Letter event types

Key letter events:

* `letter.created` – Lob created the letter (HTTP 200).
* `letter.rendered_pdf` – PDF rendering finished.
* `letter.rendered_thumbnails` – Thumbnails available.
* `letter.deleted` – Letter successfully canceled.
* `letter.failed` – Rendering error or mailpiece failure.([GitHub][2])

Tracking events (USPS data):

* `letter.mailed` – Handed off to USPS.
* `letter.in_transit` – Moving through USPS network.([GitHub][2])
* `letter.in_local_area` – At destination processing center.
* `letter.processed_for_delivery` – Greenlit for delivery; usually delivered within a day.([Lob Help Center][8])
* `letter.delivered` – Marked delivered.([GitHub][2])
* `letter.re-routed` – Forwarded due to change of address or barcode relabeling.([GitHub][2])
* `letter.returned_to_sender` – Undeliverable, being returned.([GitHub][2])
* `letter.international_exit` – Left the origin country.([GitHub][2])

Engagement & return envelope events:

* `letter.viewed` – A QR code or short URL on the piece was scanned / opened.([GitHub][2])
* `letter.return_envelope.*` – Created, in_transit, in_local_area, processed_for_delivery, re_routed, returned_to_sender for reply envelopes.([Lob Help Center][8])

Certified mail events: `letter.certified.mailed`, `letter.certified.in_transit`, `letter.certified.delivered`, etc.([GitHub][2])

### 8.2 Mapping events to Capsule Note statuses

Inside Capsule Note you can maintain something like:

* `draft` – before calling Lob.
* `created` – after successful API call (based on immediate response).
* `printing` – until you receive `letter.rendered_pdf`.
* `mailed` – when first tracking event appears (often `letter.mailed`).
* `in_transit`, `in_local_area`, `out_for_delivery`, `delivered`, `returned`.
* `canceled` – when you get `letter.deleted`.
* `failed` – when you get `letter.failed`.

Pull this from **webhooks** (below) and/or by retrieving letters:

```bash
curl https://api.lob.com/v1/letters/ltr_123456 \
  -u live_xxxxxxxxxxxxxxxx:
```

Letter objects include a `tracking_events` array and `expected_delivery_date`.([GitHub][9])

---

## 9. Webhooks: real‑time updates to Capsule Note

### 9.1 Setting up webhooks

You configure webhooks in the **Lob dashboard** (not via API):

1. Go to **Webhooks** in the left nav.
2. Choose **Test** or **Live**, click *Create*.
3. Provide:

   * Description
   * URL (your webhook endpoint)
   * Rate limit
   * Event types (e.g. all `letter.*` you care about).([Lob][16])

Lob will POST an **event object** to that URL whenever an event fires.([Lob][16])

Example (abridged) event shape:([Lob][16])

```json
{
  "event_type": {
    "id": "letter.delivered",
    "resource": "letters",
    "enabled_for_test": true,
    "object": "event_type"
  },
  "reference_id": "ltr_123...",
  "date_created": "2025-01-01T12:00:00Z",
  "id": "evt_abc...",
  "body": {
    "...redacted letter object..."
  },
  "object": "event"
}
```

Note: Lob **redacts** PII by default in webhook payloads (addresses, URLs, metadata, merge variables, etc.), but you can adjust redaction level in Account settings.([Lob][16])

### 9.2 Receiving webhooks (backend)

Requirements:

* Endpoint must accept `POST` with `Content-Type: application/json`.([Lob][16])
* Return a **2xx status quickly** to avoid retries.
* Lob will retry with exponential backoff up to 8 attempts, then stop; after 5 days of continuous failures, the webhook is disabled.([Lob][16])

**Minimal Node/Express example (pseudocode):**

```js
import crypto from "crypto";
import express from "express";

const app = express();
app.use(express.json());

const LOB_WEBHOOK_SECRET = process.env.LOB_WEBHOOK_SECRET;

app.post("/lob/webhook", (req, res) => {
  const signature = req.get("Lob-Signature");
  const timestamp = req.get("Lob-Signature-Timestamp");
  const rawBody = JSON.stringify(req.body);

  const expected = crypto
    .createHmac("sha256", LOB_WEBHOOK_SECRET)
    .update(`${timestamp}.${rawBody}`)
    .digest("hex");

  if (signature !== expected) {
    return res.status(400).send("Invalid signature");
  }

  const event = req.body;
  const type = event.event_type.id;
  const letterId = event.reference_id;

  // Map to Capsule Note statuses
  // e.g. if type === "letter.delivered", mark letter as delivered

  res.status(200).json({ received: true });
});

app.listen(3000);
```

Lob’s docs describe that signature scheme (HMAC‑SHA256 over `<timestamp>.<payload>` using the webhook’s secret).([Lob][16])

### 9.3 Debugging webhooks

Use Lob’s **Webhook Debugger** in the dashboard: it sends fake events to your endpoint (with static secret `"secret"`) so you can test; it doesn’t create real letters.([Lob][16])

---

## 10. Address verification ↔ sending letters: recommended flow

Putting it all together for Capsule Note:

1. **User enters address** in app.
2. Frontend calls `POST /v1/us_verifications` (or intl) using publishable key.
3. If `deliverability` ok → show corrected address; else warn user.
4. On “Send capsule”:

   * Frontend sends normalized address + message to backend.
5. Backend:

   * Optionally creates/updates a Lob **Address** (`/v1/addresses`) and stores `adr_...` id.
   * Creates the letter with `/v1/letters` using:

     * `to`: address id or inline.
     * `from`: your Capsule Note brand address or user’s address.
     * `file`: template id or HTML.
     * `merge_variables`: message content + personalization.
     * `color`, `double_sided`, `mail_type`, `use_type`, `send_date`.
   * Stores `ltr_...` and returns summary to client.
6. Webhooks keep Capsule Note “Delivery timeline” up‑to‑date.

---

## 11. Error handling & common Lob‑specific codes

Lob uses normal HTTP codes + custom error `code` in body.([Lob Help Center][13])

Common scenarios:

* `401` – bad or missing API key.
* `402` – billing / edition issue (e.g. using send_date on free Developer edition).([Lob Help Center][3])
* `404` – object not found (letter/addr deleted or wrong ID).
* `422` – validation errors.

Useful 422 codes (from Error Reference):([Lob Help Center][13])

* `MAIL_USE_TYPE_CAN_NOT_BE_NULL` – you forgot `use_type` and no default is set.
* `INVALID_TEMPLATE_HTML` – HTML invalid for template.
* `MERGE_VARIABLE_REQUIRED` – you used a `{{var}}` in template but didn’t provide it in `merge_variables`.
* `INVALID_PERFORATION_RETURN_ENVELOPE` – using `return_envelope` without `perforated_page` or vice versa.

In Capsule Note, log the error message + code and show a friendly user message (“We’re having trouble printing your letter, please contact support”).

---

## 12. Printing options recap (B&W, single‑sided, etc.)

For any letter:

* **Black & white single‑sided:** `color: false`, `double_sided: false`.
* **Black & white double‑sided:** `color: false`, `double_sided: true`.
* **Color single‑sided:** `color: true`, `double_sided: false`.
* **Color double‑sided:** `color: true`, `double_sided: true`.([Lob Help Center][1])

Constraints:

* 8.5x11 letters: up to 6 sheets tri‑fold → standard #10 envelope; 7–60 sheets → flat 9x12 envelope.([Lob Help Center][1])

---

## 13. “API types” you actually care about

Lob has many endpoints, but for Capsule Note you mainly need:

### Print & Mail

* `POST /v1/letters` – create letters
* `GET /v1/letters/{id}` – retrieve
* `GET /v1/letters` – list (filter by metadata, mail_type, date ranges, etc.)([GitHub][9])
* `DELETE /v1/letters/{id}` – cancel

### Templates

* `POST /v1/templates` – create template (Beta)
* `POST /v1/templates/{tmpl_id}/versions` – create a new version
* `PATCH /v1/templates/{tmpl_id}` – update template / published version
* `GET /v1/templates`, `GET /v1/templates/{tmpl_id}`, `GET /v1/templates/{tmpl_id}/versions`

### Address Verification

* `POST /v1/us_verifications`
* `POST /v1/intl_verifications`
* `POST /v1/us_autocompletions`
* `POST /v1/intl_autocompletions`([GitHub][2])

### Supporting

* `GET /v1/addresses`, `POST /v1/addresses` – if you want to store addresses in Lob.
* Webhooks – configured via dashboard (no direct API).

---

## 14. About “jobjobai”

You mentioned **“jobjobai”**. I couldn’t find any Lob concept by that name in their API docs or help center. It’s likely:

* A typo for something like **“job”** in another system, or
* Unrelated to Lob (there *is* a crypto token and some unrelated “job AI” things online).([CoinBrain][17])

Within Lob, there is no central “job” abstraction – each **letter/postcard/self‑mailer/check** is itself the mail job, and campaigns act as grouped “jobs” at the campaign level.

---

## 15. Checklist: what you should implement in Capsule Note

**Backend:**

* [ ] Store Lob **secret** keys securely.
* [ ] Wrapper for Lob requests (handles auth headers, idempotency, logging).
* [ ] Endpoint to call Lob **US/Intl verification** from frontend inputs.
* [ ] CRUD for Lob **templates** & versions (or at least store template IDs).
* [ ] Function to create letters with:

  * B&W or color, single/double sided
  * `use_type` and `mail_type` set
  * Optional `send_date`, `return_envelope` options
  * Metadata tying Lob letters to your `capsule_id`, `user_id`.
* [ ] Endpoint to **cancel letters** using `DELETE /v1/letters/{id}`.
* [ ] Webhook endpoint to handle all `letter.*` events and update internal status.

**Frontend (web/mobile):**

* [ ] Use publishable key to call **US/Intl verifications** and **autocompletions**.
* [ ] Show corrected address + deliverability warnings.
* [ ] Provide UI for scheduled send dates and cancel/edit cut‑off times.
* [ ] Delivery tracking timeline based on statuses from backend (feed from webhooks).


[1]: https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letters "Letters | Lob Help Center"
[2]: https://raw.githubusercontent.com/konfig-sdks/openapi-examples/HEAD/lob/openapi.yaml "raw.githubusercontent.com"
[3]: https://help.lob.com/developer-docs/use-case-guides/override-cancellation-window "Override cancellation window | Lob Help Center"
[4]: https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml "raw.githubusercontent.com"
[5]: https://help.lob.com/address-verification/ready-to-start-av/us-av-product-suite?utm_source=chatgpt.com "US AV product suite - Lob Help Center"
[6]: https://lobapi.zendesk.com/hc/en-us/articles/42406526490259-Managing-mail-settings?utm_source=chatgpt.com "Managing mail settings"
[7]: https://www.postman.com/lobteam/lob-public-workspace/folder/21wgyrq/address-verification-us?utm_source=chatgpt.com "Address Verification (US) | Lob Public Workspace"
[8]: https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letter-envelopes "Letter envelopes | Lob Help Center"
[9]: https://raw.githubusercontent.com/konfig-sdks/openapi-examples/HEAD/lob/openapi.yaml?utm_source=chatgpt.com "https://raw.githubusercontent.com/konfig-sdks/open..."
[10]: https://pipedream.com/apps/drip/integrations/lob/create-letter-with-lob-api-on-new-campaign-subscription-added-instant-from-drip-api-int_qjsZX8Kq "Create Letter with Lob API on New Campaign Subscription Added (Instant) from Drip API - Pipedream"
[11]: https://www.postman.com/lobteam/lob-public-workspace/request/dx3549t/list-all-letters?utm_source=chatgpt.com "List all letters | Lob API"
[12]: https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings/declaring-mail-use-type?utm_source=chatgpt.com "Declaring mail use type - Lob Help Center"
[13]: https://help.lob.com/developer-docs/error-reference?utm_source=chatgpt.com "Error reference | Lob Help Center"
[14]: https://help.lob.com/print-and-mail/building-a-mail-strategy/mailing-classes-and-postage/certified-mail-or-registered-mail?utm_source=chatgpt.com "Certified Mail or Registered Mail - Lob Help Center"
[15]: https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings?utm_source=chatgpt.com "Managing mail settings - Lob Help Center"
[16]: https://lobapi.zendesk.com/hc/en-us/articles/42406528139027-Using-webhooks "Using webhooks – Lob"
[17]: https://coinbrain.com/coins/bnb-0x2a54564217a539fadfa01fe2ef29d0ebe10736c4?utm_source=chatgpt.com "Job AI price - JOB to USD price chart & market cap"
