# Capsule Note Email Branding Guidelines

## Brand Overview

**Capsule Note** is a privacy-first platform for writing letters to your future self. Our email communications reflect our core values:

- **Privacy & Trust** - User data is encrypted and protected
- **Thoughtfulness** - Time-capsule letters deserve thoughtful presentation
- **Clarity** - Clear, professional communication
- **Reliability** - Dependable delivery when it matters

## Email Sender Identity

### Brand Name

**Always use:** "Capsule Note"

**Never use:**
- ❌ "DearMe" (legacy brand name)
- ❌ "Dear Me"
- ❌ "CapsuleNote" (no space)
- ❌ "Capsule" (incomplete)

### Sender Addresses

We use two distinct sender addresses based on email purpose:

#### 1. Notification Sender

**Email:** `noreply@capsulenote.com`
**Display Name:** "Capsule Note"
**Full Format:** `Capsule Note <noreply@capsulenote.com>`

**Purpose:**
- Letter creation confirmations
- Account notifications
- System alerts
- Security notifications
- Subscription updates

**Tone:** Professional, reassuring, system-focused

**Example subject lines:**
- ✓ "Your letter has been created"
- ✓ "Security alert: New login detected"
- ✓ "Your subscription has been updated"

#### 2. Delivery Sender

**Email:** `yourcapsulenote@capsulenote.com`
**Display Name:** "Capsule Note"
**Full Format:** `Capsule Note <yourcapsulenote@capsulenote.com>`

**Purpose:**
- Scheduled letter deliveries
- Time-capsule letter opening
- Future-dated personal messages

**Tone:** Personal, meaningful, time-focused

**Example subject lines:**
- ✓ "A Letter from Your Past Self"
- ✓ "Your letter from [Date]"
- ✓ "Remember when you wrote this?"

### Why Two Addresses?

**User Experience:**
- Users can filter "yourletters@" for personal messages vs "noreply@" for system notifications
- Creates clear mental model of email types
- Personal letters feel more special coming from "yourcapsulenote@"

**Technical Benefits:**
- Separate sender reputation tracking
- Different bounce/complaint handling
- Better deliverability metrics per email type

## Email Template Structure

### Header

All emails should include consistent header branding:

```html
<div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600;">
    Capsule Note
  </h1>
  <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 16px 0;">
</div>
```

### Footer

All emails should include consistent footer:

```html
<div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
  <p style="color: #999; font-size: 14px; text-align: center;">
    This email was sent by Capsule Note
    <br>
    <a href="https://capsulenote.com/dashboard" style="color: #666;">View your dashboard</a>
    ·
    <a href="https://capsulenote.com/unsubscribe" style="color: #666;">Unsubscribe</a>
  </p>
</div>
```

### Typography

**Fonts:**
- Primary: `system-ui, -apple-system, sans-serif`
- Fallback: `Arial, Helvetica, sans-serif`

**Font sizes:**
- Heading 1: 24px (main title)
- Heading 2: 20px (section headers)
- Body: 16px (main content)
- Small: 14px (metadata, footer)

**Colors:**
- Primary text: `#1a1a1a` (near black)
- Secondary text: `#666` (medium gray)
- Tertiary text: `#999` (light gray)
- Links: `#0066cc` (blue)
- Background: `#f9f9f9` (light gray for content blocks)

## Email Type Templates

### Notification Email Template

For system notifications, confirmations, and alerts.

**Subject format:** `[Action] [Object]`
- "Your letter has been created"
- "Security alert: [Description]"
- "Your subscription has been updated"

**Content structure:**
```html
<div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
  <!-- Header -->
  <h1 style="color: #1a1a1a;">Capsule Note</h1>
  <hr style="border-top: 1px solid #e5e5e5;">

  <!-- Main content -->
  <div style="margin: 24px 0;">
    <h2 style="color: #1a1a1a; font-size: 20px;">
      [Action Heading]
    </h2>
    <p style="color: #666; font-size: 16px; line-height: 1.6;">
      [Brief explanation of what happened and why user received this email]
    </p>
  </div>

  <!-- Call-to-action (if applicable) -->
  <div style="margin: 32px 0; text-align: center;">
    <a href="[action-url]" style="display: inline-block; padding: 12px 24px; background: #0066cc; color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
      [Action Button Text]
    </a>
  </div>

  <!-- Footer -->
  <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e5e5;">
    <p style="color: #999; font-size: 14px;">
      This email was sent by Capsule Note
      <br>
      <a href="[dashboard-url]">View your dashboard</a>
    </p>
  </div>
</div>
```

### Delivery Email Template

For scheduled letter deliveries to users.

**Subject format:** `A Letter from Your Past Self`
- Standard: "A Letter from Your Past Self"
- Dated: "Your letter from [Date]"
- Personalized: "Remember when you wrote this?"

**Content structure:**
```html
<div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
  <!-- Header with brand -->
  <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600;">
    A Letter from Your Past Self
  </h1>

  <!-- Context about timing -->
  <p style="color: #666; font-size: 14px; margin: 8px 0 24px;">
    You scheduled this letter to be delivered on [Delivery Date].
  </p>

  <!-- Letter content block -->
  <div style="background: #f9f9f9; padding: 24px; border-radius: 8px; margin: 24px 0;">
    <h2 style="color: #1a1a1a; margin-top: 0; font-size: 20px;">
      [Letter Title]
    </h2>
    [Letter HTML Content]
  </div>

  <!-- Footer -->
  <p style="color: #999; font-size: 14px; text-align: center;">
    This letter was sent via Capsule Note.
    <br>
    <a href="[dashboard-url]" style="color: #666;">View your dashboard</a>
  </p>
</div>
```

## Email Subject Line Guidelines

### Best Practices

**✅ Do:**
- Keep under 50 characters
- Be specific and actionable
- Use title case
- Include context when helpful
- Be consistent across similar emails

**❌ Don't:**
- Use all caps: "YOUR LETTER IS HERE"
- Use excessive punctuation: "Letter Delivered!!!"
- Be vague: "Update"
- Use marketing language: "Amazing news!"
- Include emoji (except sparingly in confirmations: ✓)

### Examples by Email Type

**Letter creation confirmations:**
- ✓ "Your letter \"[Title]\" has been created ✓"
- ✓ "Letter saved: [Title]"
- ❌ "Success! Your letter is ready!!!"

**Letter deliveries:**
- ✓ "A Letter from Your Past Self"
- ✓ "Your letter from [Date]"
- ✓ "Remember when you wrote this?"
- ❌ "OMG! Your letter arrived!"

**Account notifications:**
- ✓ "Security alert: New login detected"
- ✓ "Your password has been changed"
- ✓ "Your subscription has been updated"
- ❌ "URGENT: Account update"

**Subscription/billing:**
- ✓ "Your subscription has been renewed"
- ✓ "Payment receipt for [Date]"
- ✓ "Your plan has been upgraded to Pro"
- ❌ "Amazing offer inside!"

## Voice and Tone

### Brand Voice Attributes

**Professional** - We're reliable and trustworthy
**Warm** - We care about users' memories and future selves
**Clear** - No jargon, straightforward communication
**Respectful** - Users' letters are personal and meaningful

### Tone by Email Type

#### Notification Emails (from noreply@)
**Characteristics:**
- Professional and reassuring
- Clear and direct
- System-focused
- Helpful and informative

**Example:**
> Your letter "New Year's Resolutions" has been created successfully. You can view, edit, or schedule delivery from your dashboard.

#### Delivery Emails (from yourcapsulenote@)
**Characteristics:**
- Personal and meaningful
- Time-aware and reflective
- Gentle and thoughtful
- Slightly more emotional

**Example:**
> You scheduled this letter to be delivered today. Take a moment to read what you wrote to your future self.

### Writing Guidelines

**✅ Do:**
- Use "you" and "your" (second person)
- Be conversational but professional
- Explain what happened and why
- Provide clear next steps
- Show respect for users' privacy and time

**❌ Don't:**
- Use "we" excessively (company-focused)
- Be overly casual or cutesy
- Use marketing buzzwords
- Create anxiety or urgency
- Be vague about actions

## Personalization

### Acceptable Personalization

**User's display name:**
```
Hi [Display Name],

Your letter has been created...
```

**Letter title:**
```
Your letter "[Letter Title]" has been created.
```

**Delivery date:**
```
You scheduled this letter to be delivered on [Month Day, Year].
```

**Scheduled date context:**
```
It's been [X months/years] since you wrote this letter.
```

### Privacy Considerations

**Never include in emails:**
- ❌ Letter content (except in delivery emails)
- ❌ User's email address in greeting
- ❌ Account creation date
- ❌ Usage statistics
- ❌ Other users' information

## Accessibility

### Plain Text Alternative

Always provide plain text alternative for HTML emails:

```
CAPSULE NOTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━

Your letter has been created

Hi [Name],

Your letter "[Title]" has been created successfully.

You can view, edit, or schedule delivery from your dashboard:
[Dashboard URL]

━━━━━━━━━━━━━━━━━━━━━━━━━━━
This email was sent by Capsule Note
View your dashboard: [URL]
```

### Email Client Compatibility

**Test on:**
- Gmail (web, iOS, Android)
- Apple Mail (macOS, iOS)
- Outlook (web, Windows, macOS)
- Yahoo Mail
- Protonmail

**Ensure:**
- Images have alt text
- Links have descriptive text (not "click here")
- Tables used for layout have role="presentation"
- Sufficient color contrast (WCAG AA: 4.5:1)

## Localization

### Current Support

**Primary language:** English (US)

**Date formats:**
- US: "January 15, 2025"
- ISO: "2025-01-15"

**Time zones:**
- Display in user's timezone (from profile)
- Always include timezone: "9:00 AM PST"

### Future Localization

When adding languages:
- Translate subject lines
- Translate body content
- Maintain brand name: "Capsule Note" (don't translate)
- Adapt date/time formats
- Consider cultural context for tone

## Technical Implementation

### Environment Configuration

```bash
# Notification emails (system, confirmations)
EMAIL_FROM_NOTIFICATION="Capsule Note <noreply@capsulenote.com>"

# Letter delivery emails (time capsules)
EMAIL_FROM_DELIVERY="Capsule Note <yourcapsulenote@capsulenote.com>"
```

### Code Usage

```typescript
import { getEmailSender } from "@/workers/inngest/lib/email-config"

// For notifications
const notificationSender = getEmailSender('notification')
await emailProvider.send({
  from: notificationSender.from,
  to: user.email,
  subject: `Your letter "${letterTitle}" has been created ✓`,
  html: emailHtml,
})

// For deliveries
const deliverySender = getEmailSender('delivery')
await emailProvider.send({
  from: deliverySender.from,
  to: user.email,
  subject: "A Letter from Your Past Self",
  html: letterHtml,
})
```

### Compliance

**Required elements in all emails:**
- Physical mailing address (footer)
- Unsubscribe link (except transactional)
- Privacy policy link
- Company identification: "Capsule Note"

**CAN-SPAM compliance:**
- Accurate sender information
- Clear subject lines
- Honor opt-out requests within 10 days
- Include physical address

**GDPR compliance:**
- Clear purpose for email
- Easy unsubscribe process
- Data processing disclosure
- Right to deletion information

## Brand Assets

### Logo Usage

**Email logo specifications:**
- Format: SVG or PNG (2x resolution)
- Size: 200px width maximum
- Background: Transparent or white
- Placement: Top left of email header

**Don't:**
- Stretch or distort logo
- Change logo colors
- Add effects or shadows
- Place on busy backgrounds

### Color Palette

**Primary colors:**
```
Brand Blue:   #0066cc
Dark Text:    #1a1a1a
Medium Gray:  #666666
Light Gray:   #999999
Border Gray:  #e5e5e5
Background:   #f9f9f9
```

**Accent colors:**
```
Success:  #00aa44
Warning:  #ff9900
Error:    #dd3333
Info:     #3388dd
```

## Quality Checklist

Before sending any new email template:

**Content:**
- [ ] Subject line under 50 characters
- [ ] Sender name is "Capsule Note"
- [ ] Correct sender address (notification vs delivery)
- [ ] Clear primary message
- [ ] Appropriate tone for email type
- [ ] No grammar or spelling errors
- [ ] Links work and go to correct destinations

**Design:**
- [ ] Mobile responsive (tested on small screens)
- [ ] Consistent with brand guidelines
- [ ] Proper typography and spacing
- [ ] Sufficient color contrast
- [ ] All images have alt text
- [ ] Footer includes required elements

**Technical:**
- [ ] Plain text alternative included
- [ ] Tested in major email clients
- [ ] Unsubscribe link works (if applicable)
- [ ] Tracking parameters added (if using)
- [ ] Idempotency key implemented (for transactional)

**Compliance:**
- [ ] CAN-SPAM compliant
- [ ] GDPR compliant (if EU users)
- [ ] Privacy policy linked
- [ ] Physical address included

## Examples

### Letter Creation Confirmation

**From:** `Capsule Note <noreply@capsulenote.com>`
**Subject:** `Your letter "New Year's Resolutions" has been created ✓`

```html
<div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #1a1a1a;">Capsule Note</h1>
  <hr style="border-top: 1px solid #e5e5e5;">

  <h2 style="color: #1a1a1a; font-size: 20px; margin: 24px 0 16px;">
    Your letter has been created
  </h2>

  <p style="color: #666; font-size: 16px; line-height: 1.6;">
    Your letter "<strong>New Year's Resolutions</strong>" has been saved successfully.
    You can now schedule when you'd like to receive it in the future.
  </p>

  <div style="margin: 32px 0; text-align: center;">
    <a href="https://capsulenote.com/letters/abc123"
       style="display: inline-block; padding: 12px 24px; background: #0066cc;
              color: white; text-decoration: none; border-radius: 6px; font-weight: 500;">
      View Your Letter
    </a>
  </div>

  <p style="color: #999; font-size: 14px; text-align: center;">
    This email was sent by Capsule Note
    <br>
    <a href="https://capsulenote.com/dashboard" style="color: #666;">View your dashboard</a>
  </p>
</div>
```

### Letter Delivery

**From:** `Capsule Note <yourcapsulenote@capsulenote.com>`
**Subject:** `A Letter from Your Past Self`

```html
<div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #1a1a1a; font-size: 24px; font-weight: 600;">
    A Letter from Your Past Self
  </h1>

  <p style="color: #666; font-size: 14px; margin: 8px 0 24px;">
    You scheduled this letter to be delivered on January 15, 2025.
  </p>

  <div style="background: #f9f9f9; padding: 24px; border-radius: 8px; margin: 24px 0;">
    <h2 style="color: #1a1a1a; margin-top: 0; font-size: 20px;">
      New Year's Resolutions
    </h2>
    <p style="color: #1a1a1a; line-height: 1.6;">
      Dear future me,
      <br><br>
      [Letter content here...]
    </p>
  </div>

  <p style="color: #999; font-size: 14px; text-align: center;">
    This letter was sent via Capsule Note.
    <br>
    <a href="https://capsulenote.com/dashboard" style="color: #666;">View your dashboard</a>
  </p>
</div>
```

## Revision History

**Version 1.0** (2025-01-15)
- Initial branding guidelines
- Established two sender addresses
- Defined email templates and tone
- Added accessibility requirements

---

**Questions or suggestions?** Contact the product team or submit a pull request to this document.
