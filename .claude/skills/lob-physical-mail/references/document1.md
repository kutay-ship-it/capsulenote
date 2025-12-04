Guide to Using the Lob API for Sending Letters
In this guide, we’ll cover everything you need to know to integrate Lob’s API for sending letters (with envelopes) in your application. We’ll discuss setting up your Lob account (test vs. live mode), creating reusable letter templates, verifying addresses, sending letters with various options (black & white vs. color, single vs. double-sided, return envelopes, mail classes like First Class vs Standard, certified mail, etc.), using webhooks for tracking, and canceling letters before they go to production. By the end, you should be able to use the Lob API to send letters confidently.
1. Account Setup: Test vs. Live Environment
Obtain API Keys: Start by creating a Lob account and get your API keys (one for Test and one for Live) from the Lob Dashboard
help.lob.com
help.lob.com
. Lob uses Basic Auth with the API key as username (password blank) for all requests. Be sure to use your test key in development and switch to the live key in production. Test Mode vs. Live Mode: Lob’s API has two environments
help.lob.com
. In Test mode, letters are not actually mailed, but you can simulate requests and get PDF proofs. Test mode has some differences:
Address restrictions: By default, test API calls won’t actually enter the mail stream. (In test mode, tracking events won’t be generated either
help.lob.com
help.lob.com
.) This means you can use any addresses for testing without real mail being sent.
Watermarks: Letters created in test mode will include a “LOB TEST” watermark on the PDF and are not printed/miled.
No charges: Test mode calls are free and purely for development. Use Live mode for actual mailings.
Live Mode considerations: In live mode, ensure you have a valid payment method and are aware of costs (printing, postage, etc.). Also note that Lob imposes default limits like a 4-hour cancellation window (more on cancellation below) and certain feature limits depending on your subscription tier. Live mode letters will actually be printed and mailed, so double-check everything in test mode first! Switching keys: It’s easy to toggle – just use the appropriate API key. Templates and other objects created in test mode are separate from live mode
help.lob.com
, so, for example, a template created in test mode can’t be used in live mode and vice versa.
2. Address Verification and Address Objects
Before sending letters, it’s wise to verify destination addresses. Lob provides an Address Verification API to validate and standardize addresses. This helps ensure your mail isn’t undeliverable or returned.
US Address Verification: Lob can verify US addresses against USPS data (CASS-certified). This API will correct formatting and return metadata about deliverability. For example, you can call POST /v1/us_verifications with an address and Lob will return a standardized address and a deliverability indicator (e.g. “deliverable”, “deliverable_missing_unit”, etc.)
help.lob.com
help.lob.com
. If an address is not deliverable, you may decide not to send the letter.
International Verification: Lob also offers an international address verification endpoint for addresses outside the US.
Strictness Settings: You can configure your account’s Address Strictness setting to control whether Lob will reject a mailing to a potentially bad address. In Strict mode, only fully deliverable addresses are accepted (the API will return a 422 error if the to address is deemed undeliverable)
help.lob.com
help.lob.com
. In Relaxed mode, Lob will attempt to mail to any address (even if unverified)
help.lob.com
. Adjust this based on your needs, and consider verifying addresses yourself if using relaxed mode.
Using Address Objects: You can create address objects via the API (POST /v1/addresses) and store frequently used addresses (like your company’s return address or recurring recipients). Each address gets an ID (adr_...). In letter requests you can then reference the address by its ID instead of passing full address fields each time. This is optional but can simplify recurring mailings.
Example – Verifying an address (US example using cURL):
curl https://api.lob.com/v1/us_verifications \
  -u YOUR_TEST_PUB_KEY: \
  -d "primary_line=210 King Street" \
  -d "city=San Francisco" \
  -d "state=CA" \
  -d "zip_code=94107"
This will return a standardized address if valid (e.g. “210 KING ST SAN FRANCISCO CA 94107-1702”) and metadata like deliverability: "deliverable" or an error if the address is completely invalid. Always verify addresses or use a strict mode to avoid undeliverable mail.
3. Creating Letter Templates (HTML Templates)
If your application will send letters with a set of common layouts or content, you can use Lob’s HTML Templates feature to create reusable templates. This lets you design letter content with placeholders (merge variables) and re-use that template for many letters by just substituting data. What are HTML Templates? They are essentially creative files (HTML/CSS or PDFs) stored on Lob, each with a unique template ID (tmpl_<id>). You can include merge variables in templates (using Handlebars syntax like {{variable_name}}) that get filled in per letter
help.lob.com
. This allows personalized letters at scale. How to Create a Template: You can create templates via the Templates API or in the Lob dashboard. To use the API, you will use the Creatives API (Lob’s term for stored templates for letters, postcards, etc.). An API call to create a letter template will include the HTML content and some metadata. For example, a minimal API request in Node.js using Lob’s SDK might look like:
const lob = require('@lob/lob-typescript-sdk');
const config = new lob.Configuration({ username: process.env.LOB_API_KEY });
const creativesApi = new lob.CreativesApi(config);

const letterTemplate = {
  description: "Welcome Letter Template",
  resource_type: "letter",
  campaign_id: null,            // if not using campaigns, this can be omitted or null
  from: "adr_123...456",        // (optional) default from address ID to use
  file: "<html>Dear {{name}}, ...</html>",  // HTML content with merge var {{name}}
  details: {
    color: true,
    double_sided: false,
    mail_type: "usps_first_class"
    // (you can also specify other settings like address_placement, extra_service, etc. in details)
  }
};

creativesApi.create(letterTemplate).then(response => {
    console.log("Template created! ID:", response.id);
});
In this call:
resource_type: "letter" indicates we’re creating a letter template
raw.githubusercontent.com
.
file contains the HTML content for the letter with merge fields.
details can specify default letter options (here we choose color printing, single-sided, First Class mail, etc.)
raw.githubusercontent.com
raw.githubusercontent.com
.
from (optional) can store a default sender address for this template (as an address ID).
The response will include a Creative ID (crv_...) and also an internal template ID (tmpl_...). In practice, when sending a letter using this template, you will refer to it by the template ID.
Note: You can also create templates in the Lob Dashboard under “HTML Templates”. When doing so, you must specify the mail format (e.g., Letter) and size (e.g., 8.5"x11")
help.lob.com
. Templates in Test and Live environments are separate
help.lob.com
, so create them in the environment you plan to use.
Template Versions: Lob allows editing a template, which creates a new version. Each version has a version_id (vrsn_...). When you send a letter using a template, Lob will use the published version by default (you can specify a version if needed). Always ensure you’ve published the latest changes before using the template in a live mailing
help.lob.com
help.lob.com
. Merge Variables: Design your HTML template with merge fields for any dynamic content (e.g., recipient name, a personalized URL, etc.). For instance, you might have Dear {{first_name}}, your account balance is ${{balance}}. in the HTML. When creating a letter from this template, you’ll provide a merge_variables JSON with values, e.g., { "first_name": "Alice", "balance": "100.00" }. Lob will merge those into the HTML for each letter
help.lob.com
help.lob.com
. If you forget to supply a merge variable, behavior depends on your Merge Variable Strictness setting: in strict mode, the API call will error on missing variables; in relaxed mode, missing variables will simply render as blank
help.lob.com
help.lob.com
. Template Gallery: For inspiration, Lob provides a Template Gallery with pre-designed letter templates for various use cases (marketing, healthcare, etc.). You can use these designs as a starting point. They are optimized for Lob’s specs (including address placement and safe areas).
4. Sending a Letter via the Lob API
Once you have addresses and (optionally) a template ready, you can create a letter through Lob’s API. This is done with a POST request to the /v1/letters endpoint. Below we outline all the key parameters and options.
4.1 Required Basic Parameters
Recipient (“to” address): You must provide the destination address. This can be given as an inline object with fields (name, address_line1, address_city, address_state, address_zip, etc.) or as an address ID (adr_xxx) of a saved address. For international addresses, include the country (address_country). In the API request, this is the to parameter. (Similarly, in cURL you can pass to[name], to[address_line1], etc.)
Sender (“from” address): Specify the return address (often your business or the letter’s sender). This is required and works the same way as “to” – either inline or an adr_... ID. In examples below we’ll use an address ID for the sender for brevity. The from address will appear in the return address area of the envelope.
Content – File or Template: Provide the letter content either as:
HTML or PDF: You can supply a HTML string or a URL to a PDF/HTML file. Use the file parameter. Lob will accept HTML and render it to PDF (each 8.5"x11" page of HTML becomes a page of the letter)
raw.githubusercontent.com
raw.githubusercontent.com
. If you use a PDF, it must already be sized 8.5"x11". For HTML content, ensure you follow Lob’s design guidelines (no external CSS files, all resources accessible, etc.). Tip: If using cURL, use --data-urlencode "file=<html content>" to send HTML.
Template ID: If you have created a template, you can reference it by its template ID. Instead of file, pass file=tmpl_YourTemplateID (or in newer versions, Lob may accept a separate field like template_id). When using a template, also provide the merge_variables for that letter. For example, --data-urlencode "file=tmpl_d2ef...901" along with -d "merge_variables[name]=Harry" (as shown in a postcard example)
help.lob.com
. This will generate the letter using the stored HTML template and the variables you supply. (In the API response, Lob will indicate which template ID and version were used for record-keeping
help.lob.com
.)
use_type: Required – Lob requires you to declare the purpose of the mail for compliance and postal rules
help.lob.com
help.lob.com
. Options are "marketing" (for promotional/marketing content) or "operational" (for transactional or personal content). This affects allowable mail classes (Standard Class cannot be used for operational content) and USPS rules. You can set a default at account level, but if none is set, you must include use_type for each letter, otherwise the API will reject the request
help.lob.com
help.lob.com
. In our examples we’ll use "marketing" for letters with purely marketing content, or "operational" for letters like statements, personal letters, etc.
4.2 Letter Options and Settings
Lob offers several options to customize how the letter is printed and mailed:
Color vs. Black & White (color): By default, letters print in black & white. Set "color": true to print in color
help.lob.com
. Color printing costs slightly more than B&W.
Single-sided vs. Double-sided (double_sided): By default, letters are double-sided (printing on front and back of each sheet) for efficiency. If your letter content is only one page or you prefer one-sided printing, set "double_sided": false. Keep in mind the page count limits: if double_sided is false, up to 6 printed pages (6 sheets) fit in a standard envelope; if true, up to 12 pages (printed on 6 sheets) fit
help.lob.com
help.lob.com
 before Lob automatically uses a larger flat envelope.
Address Placement (address_placement): This tells Lob where on your first page the addresses are located, so they line up with the envelope windows. Options:
"top_first_page" – addresses are at the top of the first page (suitable for letters where the content is positioned so that the recipient address appears in the bottom window after folding, and sender in the top window).
"bottom_first_page" or "bottom_first_page_center" – addresses at bottom of first page (common for tri-fold templates)
raw.githubusercontent.com
.
"insert_blank_page" – addresses aren’t in your content; Lob will insert a blank first page with the addresses for you
raw.githubusercontent.com
raw.githubusercontent.com
. This is useful if you want to keep your first page fully content and let Lob handle a separate address page.
If unsure, you can use the standard Lob templates as a guide. For a typical letter using a #10 double-window envelope, addresses are usually placed such that they appear through the windows when tri-folded (Lob’s default templates put the recipient address near the bottom of page 1 and sender at top). By default, Lob will assume address_placement: "top_first_page" unless you specify otherwise.
Double Window Envelope: All domestic letters use a standard #10 double-window envelope by default
help.lob.com
. You do not need to do anything to get an envelope – Lob will automatically handle inserting the printed letter into the appropriate envelope. The recipient address (and sender address) on your first page will show through the windows. If your letter exceeds 6 sheets (12 printed pages double-sided), Lob will automatically use a larger flat 9x12 envelope at no extra charge
help.lob.com
help.lob.com
. (Letters over 6 sheets are not folded; they go into a flat envelope.)
Envelope Customization: By default, the envelopes are generic (Lob’s standard). Enterprise customers can have custom branded envelopes or business return envelopes. This involves uploading envelope templates and getting an env_<id> to use as custom_envelope in the API. For most users, this won’t apply unless you have upgraded for custom envelopes. We’ll skip custom envelope details here since it requires Lob’s enterprise edition.
Mail Type (mail_type): This specifies the postage class:
"usps_first_class" – First Class Mail (default). Typically 5-7 business days delivery within US, faster processing, and forwarding/return included
help.lob.com
help.lob.com
.
"usps_standard" – Standard Mail (Marketing Mail) for bulk/marketing content. Cheaper but slower (7-21 days) and only for domestic US addresses
help.lob.com
help.lob.com
. Use Standard only for marketing/promotional mail and note USPS requires at least 200 pieces for bulk mail rates, though Lob will handle batching. Also, Standard mail is not forwarded or returned if undeliverable (undeliverable Standard mail is discarded by USPS)
help.lob.com
. Important: You cannot use Standard class for letters marked as “operational” use_type (e.g., a bank statement or personal letter cannot go via Standard Mail due to USPS rules). Lob will enforce this: if mail_type=usps_standard and use_type=operational, the API will error. So use Standard only for marketing mailings.
If not specified, Lob defaults to First Class
postman.com
.
Printing Speed (print_speed): Lob currently offers a standard print speed (“core”) which means a 2-business-day production SLA
raw.githubusercontent.com
. In the future they may offer expedited options, but as of now the only allowed value is "core" (and it is the default)
raw.githubusercontent.com
. This essentially means if you submit a letter today, Lob will hand it off to USPS within 2 business days (often sooner, but 2-day SLA ensures quality checks).
Sustainability (fsc): Lob has an option to use sustainably sourced paper (FSC-certified) by setting "fsc": true. This is in beta and ensures the paper is from responsibly managed forests
raw.githubusercontent.com
raw.githubusercontent.com
. It’s not available for certain sizes like A4 or legal size, but for standard letters it can be used. Setting fsc:true may have an additional cost but reflects your commitment to sustainable practices.
4.3 Optional Add-Ons
Return Envelopes (Business Reply/Courtesy Reply): If you want to include a return envelope for your recipient to mail something back (common in bills or donation solicitations), Lob can add a #9 reply envelope plus a perforated tear-off in your letter. To do this, set return_envelope: true and specify perforated_page: the page number in your PDF/HTML that should have a perforation line
help.lob.com
. Typically, you’d design the bottom of that page as a remittance slip that fits in the return envelope. Lob will print that page with a perforation and include a blank #9 envelope with your letter
help.lob.com
. The reply envelope will have your return address in the window (which you provide via the return_address field when creating the letter, if using the enterprise tracking feature)
help.lob.com
help.lob.com
. By default the reply envelope is not prepaid (Courtesy Reply Mail), meaning your recipient would put a stamp to mail it back. Enterprise users can enable Business Reply Mail (BRE) with a permit, which uses a slightly different setup and a prepaid postage envelope
help.lob.com
help.lob.com
 – that is beyond this guide’s scope, but just note it’s possible. For tracking of reply envelopes, enterprise users can even get webhook events when a reply envelope is returned through USPS (Lob will generate events like “In transit”, “Processed for delivery” for the incoming reply letter)
help.lob.com
help.lob.com
. If you just want a basic courtesy reply envelope: set return_envelope: true and perforated_page to (for example) 1 if your first page has the tear-off section. Lob will handle the rest – the outgoing envelope will be a #10 as usual, containing your letter and the #9 return envelope inside
help.lob.com
help.lob.com
. (Note: Including a return envelope does cost extra per piece.)
Buckslips: A buckslip is an insert, like a small flyer or coupon, included with the letter. Lob supports these as a separate resource (must be pre-printed in inventory). If you have a buckslip ID from Lob, you can include it via the buckslips field. (This is advanced usage and requires volumes; we’ll not delve into details here.)
Embedded Cards: Lob allows attaching a card (e.g., plastic or cardstock loyalty card) to letters for enterprise users. This is controlled by the cards field (an array of card IDs to attach)
raw.githubusercontent.com
raw.githubusercontent.com
. This requires having card inventory set up via the Cards API. We mention it for completeness, but most likely you won’t use this unless you have a special use-case (like sending gift cards or membership cards with letters).
Certified or Registered Mail (Extra Services): If you need proof of mailing or delivery, you can send letters as Certified Mail or Registered Mail through Lob. These are USPS services:
Certified Mail: Provides a USPS tracking number and electronic delivery confirmation. Optionally, you can request an electronic Return Receipt (which provides a signature of the recipient). To use Certified Mail, set extra_service: "certified" in your letter request
help.lob.com
. For an electronic return receipt, also include extra_service: "certified_return_receipt" (you can combine them as an array if using the API directly, or Lob may allow a comma-separated string). For example, extra_service: certified or extra_service: certified_return_receipt. Certified Mail is only available for domestic First Class letters
help.lob.com
help.lob.com
. When you create a Certified letter, the API response will include a tracking_number (and Lob will make this visible in the dashboard) which you can use on the USPS site to track delivery
help.lob.com
. You’ll also get tracking events via Lob (more on tracking below). If return receipt is enabled, you can later retrieve the signature proof from USPS’s website or have USPS email it to you
help.lob.com
help.lob.com
.
Registered Mail: A more secure, chain-of-custody service for high-value mail. Only for domestic First Class as well. Use extra_service: "registered" to send via Registered Mail
help.lob.com
help.lob.com
. Lob will provide a tracking number (available ~3 business days after mailing) that you can use on USPS’s site. Note that Registered Mail doesn’t produce the same scan events in Lob’s system as normal mail – instead you rely on the USPS tracking number for detailed tracking
help.lob.com
. Use this for items that need maximum security (e.g., legal documents, sensitive info).
Including these extra services will incur additional USPS fees (Lob will charge accordingly). Also, if mail_type is usps_standard, you cannot use extra services; they only apply to First Class mail
docs.lob.com
.
4.4 Example: Creating a Letter (API Request)
Putting it all together, here is a comprehensive example of a POST request to create a letter via cURL, demonstrating many of the above fields:
curl https://api.lob.com/v1/letters \
  -u live_XXXXXXXXXXXXXXXX: \
  -d description="Demo Letter to Myself" \
  -d to[name]="John Doe" \
  -d to[address_line1]="123 Main Street" \
  -d to[address_city]="Anytown" \
  -d to[address_state]="CA" \
  -d to[address_zip]="94107" \
  -d from=adr_210a8d4b0b76d77b \
  --data-urlencode file="<html><body><h1>Hello {{name}}</h1><p>This is a test letter.</p></body></html>" \
  -d merge_variables[name]="John" \
  -d color=true \
  -d double_sided=false \
  -d address_placement="insert_blank_page" \
  -d mail_type="usps_first_class" \
  -d use_type="operational" \
  -d extra_service="certified" \
  -d return_envelope=true \
  -d perforated_page=1 \
  -d send_date="2025-01-15T14:00:00Z"
Let’s break down what this does:
We create a letter with a description for our reference.
to[...] fields define the recipient (John Doe at 123 Main Street…).
from=adr_210a8d4b0b76d77b references a stored address (our return address).
The file is provided as an HTML string (using --data-urlencode to handle HTML content). It includes a merge field {{name}} that will be replaced.
merge_variables[name] is set to “John” – this fills in the {{name}} in the HTML with “John”
help.lob.com
.
color=true for color printing
help.lob.com
, double_sided=false to print single-sided.
address_placement="insert_blank_page" – we chose to have Lob generate a blank first page with the address, so our HTML doesn’t need to include the address block
raw.githubusercontent.com
raw.githubusercontent.com
.
mail_type="usps_first_class" explicitly (though that’s the default)
postman.com
.
use_type="operational" since let’s say this is a personal or account statement letter.
extra_service="certified" to send via Certified Mail (we will get a tracking number and delivery confirmation)
help.lob.com
.
return_envelope=true and perforated_page=1 to include a reply envelope, with a tear-off slip on page 1
help.lob.com
. Our HTML content would need to have the bottom of page 1 formatted as a remittance slip with the return address.
send_date="2025-01-15T14:00:00Z" schedules this letter to be sent on Jan 15, 2025 at 2:00 PM UTC. This means Lob will wait until that time before printing/mailing the letter
help.lob.com
help.lob.com
. Scheduling in the future overrides the default cancellation window and effectively gives you until that date to cancel if needed
help.lob.com
.
When this request is successful, the API will return a JSON object for the created letter. It will include fields such as:
id (e.g., ltr_abcdef123456789), the Lob ID for this letter.
expected_delivery_date (an estimate of when USPS will deliver, based on class).
thumbnails (URLs to images of the letter’s pages).
url – a temporary URL to the PDF of the letter
raw.githubusercontent.com
 (for test mode or recently processed letters).
tracking_number (if Certified or Registered extra service was used, you’ll have a USPS tracking number here).
tracking_events – initially empty array; will populate as USPS scans the mail (see Tracking section below).
send_date (if scheduled).
status – Lob may not explicitly label status in the response, but via events you determine if it’s been sent to production or not.
template_id and template_version_id (if you used a stored template to create the letter, these IDs appear to indicate which template and version were used)
raw.githubusercontent.com
raw.githubusercontent.com
.
object: "letter".
Note: If any required field is missing or invalid, Lob will return an error (HTTP 422 Unprocessable Entity). The error message will explain the issue (e.g., missing use_type or an invalid address state). Common pitfalls include forgetting use_type (Lob will error if not set and no default)
help.lob.com
help.lob.com
, or providing an invalid country/state combination, etc.
5. Mail Production and Timeline
Once a letter is created (either immediately or at the scheduled send_date), here’s what happens:
Cancellation Window: If you did not schedule a future send_date, your letter enters a short holding period (default 4 hours for new accounts) during which you can still cancel it without charge
help.lob.com
help.lob.com
. After that, it’s handed off to print. (If you did schedule a future send_date, Lob will hold the letter until that date – effectively extending your cancellation window until that time
help.lob.com
.)
In Production: Lob sends the letter to one of their printing partners. At this stage, the letter is being printed, cut, and inserted into the envelope
help.lob.com
help.lob.com
. In the Lob dashboard, you’ll see a status like “In Production” once this happens. (No webhook event is sent for “In production” – it’s only visible in the dashboard
help.lob.com
.)
Mailed: After printing, the letter is handed over to USPS (or another carrier if international). Lob marks it as “Mailed”. If you are an Enterprise customer, Lob will emit a “Mailed” event (webhook) and show this in your dashboard
help.lob.com
. (For non-Enterprise accounts, “Mailed” is shown greyed out in the tracking timeline and not sent as a webhook
help.lob.com
, because exact handoff time is only guaranteed with certain plans.)
From this point on, USPS takes over and regular postal delivery times apply (First Class ~1 week, Standard up to 3 weeks in US
help.lob.com
). Now tracking events come into play.
6. Tracking Letters and Delivery Events
Lob provides tracking events for mailed pieces by leveraging USPS scanning data. These events help you (and your users) know the status of the mail in the postal system. Tracking is available for First Class and Standard Class mail, and even for return envelopes (and is different for Registered mail, which uses the carrier’s own tracking number). Important: Tracking events are not generated in the Test environment – only live mailings get them
help.lob.com
. Also, there can be delays or occasional missing scans since it depends on USPS scanning. Key tracking events for letters include (in typical order)
help.lob.com
help.lob.com
:
Received: Lob has received the API request for the mail piece. (This appears in the dashboard timeline instantly, but is not sent as a webhook)
help.lob.com
.
In Production: The mail is being printed/processed by Lob’s print facility. (Shown in dashboard, no webhook)
help.lob.com
.
Mailed: The letter was handed off to USPS (entry scan or induction into mail stream). (Webhook sent if enabled for Enterprise, otherwise just a dashboard entry)
help.lob.com
.
In Transit: USPS has processed the mail at an origin facility – it’s on its way.
help.lob.com
In Local Area: The mail reached a USPS facility near the destination (arrival at the destination area).
help.lob.com
Processed for Delivery: The mailpiece was sorted to the delivery route and is expected to be delivered in the next day.
help.lob.com
 This is essentially “out for delivery” in USPS terms – the final step before the mailbox.
Delivered: Marked delivered by USPS carrier (the USPS carrier’s device records a delivery scan)
help.lob.com
help.lob.com
. Note: Not every piece will get an explicit “Delivered” scan – sometimes “Processed for Delivery” might be the last scan. Delivered event is a good sign, but its absence doesn’t always mean not delivered (USPS might miss scanning, or the piece is delivered to a PO box which often doesn’t generate a delivered scan
help.lob.com
help.lob.com
).
Re-routed: USPS had to forward the mail (e.g., recipient moved and filed a change of address, or a sorting issue)
help.lob.com
. USPS will attempt redelivery to a new address if available.
Returned to Sender (RTS): The mail was undeliverable and is being returned to the sender address
help.lob.com
. Reasons could include bad address, no mail receptacle, recipient unknown, etc. (Lob surfaces the RTS event and if the piece comes back to you, you’ll see a yellow NIXIE label on it indicating the reason – e.g. “Not Deliverable as Addressed – Unable to Forward”)
help.lob.com
help.lob.com
. Lob will not automatically resend anything; you’d handle returned mail manually.
For Certified Mail: the tracking events differ (you will mainly rely on the USPS tracking number, but Lob will show events like “Delivered” when the signature is obtained). For Registered Mail, Lob does not populate tracking events in the same way – you must use the USPS tracking number to monitor progress
help.lob.com
. Where to see tracking info:
Lob Dashboard: Each letter’s detail page will show a timeline of events (Received, In Transit, Delivered, etc.). You can also export events via the dashboard or API.
API: The GET /v1/letters/{id} response includes a tracking_events array with events and timestamps
raw.githubusercontent.com
raw.githubusercontent.com
. Note that events are ordered by time and new ones append as USPS scans occur. (Letters in test mode will have no tracking events array at all
raw.githubusercontent.com
.)
Webhooks: You can subscribe to Lob webhooks to get real-time notifications of events. This is highly recommended for updating your application when, say, a letter is delivered or returned.
Using Webhooks: In Lob’s dashboard, set up a webhook endpoint (under Settings or Developers section). Choose the event types you want, e.g., “Letter In Transit”, “Letter Delivered”, “Letter Re-routed”, etc. Lob will send an HTTP POST to your endpoint for each event. Each webhook contains a signature header you should verify for security. (Refer to Lob’s documentation on validating webhook signatures
raw.githubusercontent.com
docs.customer.io
 for implementation – essentially you concatenate the payload with a timestamp and use your signing key to verify the hash.) For example, a webhook payload for a delivered event might look like:
{
  "event_type": "letter.delivered",
  "letter": {
    "id": "ltr_123456789",
    "description": "Demo Letter",
    "to": { ... },
    "...": "...",
    "tracking_events": [
       { "event": "In Transit", "time": "2025-01-16T08:30:00Z" },
       { "event": "In Local Area", "time": "2025-01-18T06:00:00Z" },
       { "event": "Processed for Delivery", "time": "2025-01-18T11:00:00Z" },
       { "event": "Delivered", "time": "2025-01-18T15:45:00Z" }
    ]
  }
}
You can then parse this and update your database (e.g., mark the letter as delivered). Tracking limitations: Keep in mind USPS doesn’t guarantee scans at every stage. Most mail gets a full set of scans, but some might miss a scan (for example, sometimes a piece might jump from In Transit to Delivered with no “In Local Area” visible, etc.). If no scans appear within 5 business days of mailing, Lob suggests contacting support – over 99% of mail does get scans
help.lob.com
, so it’s rare to have none. Also note international letters will generally only have tracking until they leave the US (“International Exit”), after which tracking may not continue depending on destination country
help.lob.com
. International Mail tracking: If you send letters internationally (Lob will route via USPS international service), you might see an “International Exit” event (when it departs the US)
help.lob.com
. After that, tracking often ends as many countries don’t provide scans back. So it can be a bit of a black box after leaving the US. Plan accordingly (e.g., allow ample time, possibly use registered mail if you need international tracking, though that might not be available for all destinations).
7. Cancelling Letters Before Production
It’s possible to cancel a letter after you’ve created it, as long as you act within the allowed cancellation window. Canceling will stop the letter from being mailed (and you won’t be charged for it).
Default Window: New Lob accounts have a 4-hour cancellation window for any mail piece
help.lob.com
help.lob.com
. That means if you create a letter and realize you made a mistake (wrong content or address), you have up to 4 hours to cancel it. After that, it’s locked for printing.
Extended via Scheduling: If you used a send_date in the future, that effectively extends your cancellation window up until that send_date/time
help.lob.com
. Lob will not send the letter to production until the scheduled time, so you can delete it anytime before the scheduled date. (This is a strategy: schedule mail for a future date to allow more QA time. You can always cancel or even update by canceling and recreating.)
How to Cancel: Lob’s API doesn’t have an explicit “cancel” endpoint, instead you delete the object. For letters, you call DELETE /v1/letters/{letter_id}. If the letter is still cancelable (within window or before send_date), the response will indicate it was deleted and it will not be mailed
pipedream.com
help.lob.com
. If it’s too late (already in production or mailed), you’ll get an error and cannot cancel. Example using the Node SDK:
const lettersApi = new LettersApi(config);
await lettersApi.cancel("ltr_1234567890");  // cancels the letter if possible
Or via cURL:
curl -X DELETE https://api.lob.com/v1/letters/ltr_1234567890 \
  -u YOUR_API_KEY:
A successful cancellation returns a 200 status with {"id": "ltr_1234567890", "deleted": true}
raw.githubusercontent.com
.
Cancelling Batches: If you sent a bulk of letters (say via Campaigns or multiple API calls) and need to cancel many, you can list letters (GET /v1/letters) with filters (e.g., by metadata or date) and then script cancellations. Lob suggests using the list+delete approach for mass deletions
help.lob.com
 – essentially retrieve the IDs of the letters you want to nix, then loop through and DELETE each. There is also a Campaigns API where you can cancel a whole campaign in one call if you used that feature.
After the Window: Once the cancellation window has passed, the letter is “in flight” to printing and cannot be stopped
help.lob.com
. Lob’s system and print partners operate quickly after the window, so at that point you’ll have to treat it as sent mail.
Note: If you’re testing in the Live environment and want to cancel a letter to avoid a real send, do so within 4 hours. In Test mode it’s not an issue (nothing actually mails), but in live mode, be mindful of the time. You could also consider using send_date for safety, as mentioned, to give yourself a manual review period (for example, schedule for the next day and cancel if something looks wrong).
8. Additional Tips and Best Practices
Page Limits: A single Lob letter (8.5x11") can be up to 12 pages (double-sided) or 6 pages (single-sided) for domestic, and up to 12 pages (double-sided) for international (Lob imposes 6 page single-sided / 12 page double-sided limit for international mail)
raw.githubusercontent.com
raw.githubusercontent.com
. If you exceed these, Lob will error or truncate (for HTML). For very long documents, consider splitting into multiple letters or using the flat envelope option (which Lob does automatically for >6 sheets). The maximum Lob will handle is 60 sheets (120 pages) in a flat envelope for domestic
raw.githubusercontent.com
 – that’s a lot of pages (essentially a small book).
Legal Size and Other Formats: Lob also supports 8.5x14" (“us_legal”) letters, but that is an enterprise feature
help.lob.com
help.lob.com
. Legal letters have slightly different limits (max 3 sheets)
help.lob.com
. Unless you have that enabled, stick to 8.5x11 (which is default size: us_letter). If you did need A4 or other sizes for international, Lob currently automatically converts 8.5x11 content for international posting as needed – there isn’t direct support for A4 as an input size unless possibly via their API version header for size, which is advanced usage.
HTML Design Best Practices: If you use HTML for letters, ensure you use inline CSS, and absolute positioning for precise layouts
help.lob.com
. Avoid external resources that might fail (host images reliably, or inline images as data URI if small). Test render by retrieving the url from the API response which gives you the PDF to review. Lob’s rendering engine is based on Chromium, so if it looks right in Chrome print-preview at 8.5x11, it should look right in Lob’s output. Also, keep critical content away from the edges (leave 0.125" margin) as printers have a slight variance and Lob requires a 1/16" clear border
help.lob.com
 (no full bleed).
Metadata: You can include a metadata JSON object for your own tracking (e.g., metadata: {"user_id": "abc123", "campaign": "holiday_promo"})
raw.githubusercontent.com
. Lob doesn’t use this except to store and allow filtering on list calls. It’s helpful for reconciling letters to your internal records.
Error Handling: If Lob returns an error, examine the message. Common errors:
422 Unprocessable: e.g., “use_type is required” (you forgot use_type), or address-related errors (like “Zip code invalid” or strictness rejection if address is undeliverable in strict mode), or “merge variable ... not provided” in strict mode. Fix the input accordingly.
401 Unauthorized: Check your API key.
Rate limit (429): If you send a very large burst, you might need to rate limit or contact Lob for higher throughput.
Rate Limiting Bulk Sends: If you plan to send many letters (thousands) at once, consider using the Campaigns API or spacing out API calls. Lob can handle scale, but using their Campaigns feature (which allows you to upload a list of recipients and send a whole campaign) might be more efficient for very large sends.
Address Auto-correction: Lob will standardize addresses (US addresses will be capitalized, formatted, and possibly minor corrections applied). You can see the final address in the letter object returned. If Lob or USPS finds an obvious issue (like a missing street suffix), they may correct it (and the letter will still send). But if the address is invalid, the strictness setting determines if it errors or sends anyway. Lob also offers National Change of Address (NCOA) processing for Enterprise, which can automatically update addresses that have moved
docs.lob.com
 (beyond scope here).
Testing in Live Mode: If you want to test a live letter without actually sending to someone’s address, you could use your own address as the recipient or any controlled address and then just discard the received mail. There’s no “dummy” address that triggers auto-cancel – any valid looking address in live will result in a real mail. So be careful with live API keys.
With all these tools and practices, you should be equipped to integrate Lob into your “Capsule Note” app (or any app that sends letters). For example, you can allow a user to compose a letter in HTML or choose from predefined templates, verify their address, and then use the Lob API to mail it to their future self or loved ones. Lob will handle the printing, enveloping, stamping, and delivery, and you can use webhooks to notify your app when the letter is delivered or if it gets returned. Good luck with your integration, and happy mailing! Sources:
Lob API Documentation – Letters API Reference
raw.githubusercontent.com
raw.githubusercontent.com
, Templates & Personalization
help.lob.com
help.lob.com
, Address Verification
help.lob.com
Lob Help Center – Letters Overview
help.lob.com
, Letter Envelopes
help.lob.com
help.lob.com
, Mailing Classes & Postage
help.lob.com
help.lob.com
, Certified vs Registered Mail
help.lob.com
help.lob.com
, Dynamic Personalization
help.lob.com
, Tracking Your Mail
help.lob.com
help.lob.com
, Cancellation Window
help.lob.com
help.lob.com
, Managing Mail Settings
help.lob.com
help.lob.com
.
Citations

API quickstart guide | Lob Help Center

https://help.lob.com/developer-docs/api-quickstart-guide

API quickstart guide | Lob Help Center

https://help.lob.com/developer-docs/api-quickstart-guide

Dynamic personalization | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/maximizing-engagement/dynamic-personalization

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Dynamic personalization | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/maximizing-engagement/dynamic-personalization

Managing mail settings | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings

Managing mail settings | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings

Managing mail settings | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings

Managing mail settings | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings

Managing mail settings | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings

Dynamic personalization | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/maximizing-engagement/dynamic-personalization

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

Dynamic personalization | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/maximizing-engagement/dynamic-personalization

Dynamic personalization | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/maximizing-engagement/dynamic-personalization

Dynamic personalization | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/maximizing-engagement/dynamic-personalization

Dynamic personalization | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/maximizing-engagement/dynamic-personalization

Dynamic personalization | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/maximizing-engagement/dynamic-personalization

Managing mail settings | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings

Managing mail settings | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

Dynamic personalization | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/maximizing-engagement/dynamic-personalization

Dynamic personalization | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/maximizing-engagement/dynamic-personalization

Declaring mail use type | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings/declaring-mail-use-type

Declaring mail use type | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings/declaring-mail-use-type

Declaring mail use type | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings/declaring-mail-use-type

Declaring mail use type | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings/declaring-mail-use-type

Letters | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letters

Letter envelopes | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letter-envelopes

Letter envelopes | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letter-envelopes

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

Letter envelopes | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letter-envelopes

Letters | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letters

Letters | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letters

Mailing Classes & Postage | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/mailing-classes-and-postage

Mailing Classes & Postage | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/mailing-classes-and-postage

Mailing Classes & Postage | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/mailing-classes-and-postage

Mailing Classes & Postage | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/mailing-classes-and-postage

Mailing Classes & Postage | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/mailing-classes-and-postage

List all letters | Lob API | Postman API Network

https://www.postman.com/lobteam/lob-public-workspace/request/dx3549t/list-all-letters

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

Letter envelopes | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letter-envelopes

Letter envelopes | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letter-envelopes

Letter envelopes | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letter-envelopes

Letter envelopes | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letter-envelopes

Letter envelopes | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letter-envelopes

Letter envelopes | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letter-envelopes

Letter envelopes | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letter-envelopes

Letter envelopes | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letter-envelopes

Letter envelopes | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letter-envelopes

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

Certified Mail or Registered Mail | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/mailing-classes-and-postage/certified-mail-or-registered-mail

Certified Mail or Registered Mail | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/mailing-classes-and-postage/certified-mail-or-registered-mail

Certified Mail or Registered Mail | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/mailing-classes-and-postage/certified-mail-or-registered-mail

Certified Mail or Registered Mail | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/mailing-classes-and-postage/certified-mail-or-registered-mail

Certified Mail or Registered Mail | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/mailing-classes-and-postage/certified-mail-or-registered-mail

Certified Mail or Registered Mail | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/mailing-classes-and-postage/certified-mail-or-registered-mail

Certified Mail or Registered Mail | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/mailing-classes-and-postage/certified-mail-or-registered-mail

Certified Mail or Registered Mail | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/mailing-classes-and-postage/certified-mail-or-registered-mail

Certified Mail or Registered Mail | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/mailing-classes-and-postage/certified-mail-or-registered-mail

Lob API documentation

https://docs.lob.com/

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

Override cancellation window | Lob Help Center

https://help.lob.com/developer-docs/use-case-guides/override-cancellation-window

Override cancellation window | Lob Help Center

https://help.lob.com/developer-docs/use-case-guides/override-cancellation-window

Override cancellation window | Lob Help Center

https://help.lob.com/developer-docs/use-case-guides/override-cancellation-window

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

Declaring mail use type | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings/declaring-mail-use-type

Override cancellation window | Lob Help Center

https://help.lob.com/developer-docs/use-case-guides/override-cancellation-window

Managing mail settings | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Certified Mail or Registered Mail | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/mailing-classes-and-postage/certified-mail-or-registered-mail

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

https://raw.githubusercontent.com/lob/lob-openapi/...

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

Send direct mail with Lob - Customer.io Docs

https://docs.customer.io/journeys/lob-webhook-integration/

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Cancel Postcard with Lob API on New Order Created (Instant) from ...

https://pipedream.com/integrations/cancel-postcard-with-lob-api-on-new-order-created-instant-from-xola-api-int_m8sQQqno

Managing mail settings | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings

Managing mail settings | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

Letters | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letters

Letters | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letters

Letters | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letters

Dynamic personalization | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/maximizing-engagement/dynamic-personalization

Letters | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/mail-piece-design-specs/letters

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

Lob API documentation

https://docs.lob.com/

raw.githubusercontent.com

https://raw.githubusercontent.com/lob/lob-openapi/main/dist/lob-api-bundled.yml

Dynamic personalization | Lob Help Center

https://help.lob.com/print-and-mail/designing-mail-creatives/maximizing-engagement/dynamic-personalization

Mailing Classes & Postage | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/mailing-classes-and-postage

Tracking your mail | Lob Help Center

https://help.lob.com/print-and-mail/getting-data-and-results/tracking-your-mail

Managing mail settings | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings

Managing mail settings | Lob Help Center

https://help.lob.com/print-and-mail/building-a-mail-strategy/managing-mail-settings
All Sources

help.lob

raw.gith...ercontent

postman

docs.lob

docs.customer

pipedream