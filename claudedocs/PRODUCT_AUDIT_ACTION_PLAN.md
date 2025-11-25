# Capsule Note: Prioritized Action Plan

**From Audit Score: 67/100 → Target: 95/100**

---

## The Core Insight

You built a **vault** when users wanted a **time machine**.

The security is world-class. The emotion is missing.

---

## Priority Matrix

### P0: Trust Violations (Fix Immediately)

| Issue | Impact | Action |
|-------|--------|--------|
| Physical mail advertised but broken | Users paying for non-existent feature | Ship Lob integration OR remove from pricing |
| Free tier limits unclear | Signup disappointment → churn | Add "Free: Draft only, no delivery" to landing + pricing |

**Timeline**: 1 week

---

### P1: Conversion Killers (Next 2 Weeks)

| Issue | Impact | Action |
|-------|--------|--------|
| Blank page paralysis | 30-40% first letters never completed | Ship 12 letter templates with UI |
| Technical onboarding | Users don't feel emotional hook | Rewrite 3 steps around feelings, not features |
| Dashboard is a dead end | No reason to return | Add countdown timers + "write another" prompts |

**Expected Impact**: +15-20% signup → first letter rate

---

### P2: Retention Gaps (Weeks 3-6)

| Issue | Impact | Action |
|-------|--------|--------|
| Plain delivery emails | Zero word-of-mouth | Design beautiful delivery template |
| No re-engagement | Single-use product feel | Build 5-email lifecycle sequence |
| No delivery anticipation | Users forget they scheduled | Add 24-hour reminder email |

**Expected Impact**: +25% post-delivery return rate

---

### P3: Growth Mechanics (Weeks 6-12)

| Issue | Impact | Action |
|-------|--------|--------|
| 100% solo experience | Zero virality | Add "send to someone else's future" |
| No gifting | Missing revenue stream | Subscription gifting flow |
| No milestones | Generic feeling | Birthday/anniversary integration |

**Expected Impact**: 2-3x organic acquisition

---

## Quick Wins (< 1 Day Each)

1. **Landing Page**: Change "Start free" to "Draft free, pay to deliver"
2. **Pricing Page**: Add feature comparison table with free tier
3. **Hero Copy**: "A letter is waiting for you" (flip from action to reward)
4. **Testimonial**: Move the sister/med school story ABOVE the fold
5. **Dashboard**: Add "Write another letter" button after scheduling

---

## The 5 Copy Changes That Matter Most

### 1. Hero Headline
**Before**: "Write to your future self"
**After**: "A letter is waiting for you"

### 2. Subheadline
**Before**: "No apps to check. No reminders to dismiss."
**After**: "Schedule letters to future-you. Delivered exactly when emotions are highest."

### 3. CTA Button
**Before**: "Start Writing"
**After**: "Write to Future Me"

### 4. Onboarding Step 1
**Before**: "Your letters are encrypted with AES-256"
**After**: "Imagine opening a letter from past-you on your birthday next year"

### 5. Dashboard Empty State
**Before**: "No letters yet"
**After**: "What does future-you need to hear right now?"

---

## Template Seed Data (12 Templates)

### Reflections (3)
```
1. Annual Check-In
   Prompt: "Where am I right now? What's working? What's not? What do I want to change?"

2. Year in Review
   Prompt: "What were my biggest wins this year? What lessons did I learn the hard way?"

3. Monthly Snapshot
   Prompt: "How am I feeling today? What's on my mind? What am I grateful for?"
```

### Goals (3)
```
4. New Year's Promises
   Prompt: "What am I committing to this year? Why does it matter to me?"

5. Accountability Letter
   Prompt: "Future me: did you follow through? If not, what got in the way?"

6. Dream Life Vision
   Prompt: "Where do I want to be in 5 years? What would make me proud?"
```

### Gratitude (3)
```
7. Thank You to Myself
   Prompt: "What am I proud of? What did I handle well? Where did I grow?"

8. People I Appreciate
   Prompt: "Who made a difference in my life? What would I tell them?"

9. Moments That Mattered
   Prompt: "What moments do I want to remember forever? Why?"
```

### Life Events (3)
```
10. Before the Big Change
    Prompt: "I'm about to [start/end/change something]. How do I feel right now?"

11. Advice to Future Me
    Prompt: "What do I know right now that I'll probably forget? What should I remember?"

12. Love Letter to Self
    Prompt: "If future-me is struggling, what do I want them to know?"
```

---

## Delivery Email Template (Markdown)

```markdown
Subject: A message from your past self has arrived ✉️

---

**[Date written]** · *[X days/months/years] ago*

---

Dear Future Me,

[LETTER CONTENT]

---

*You wrote this letter on [date]. You asked yourself to remember this moment.*

---

[ Write Your Next Letter → ]

---

"The best time to write to your future self was yesterday.
The second best time is now."

---

Capsule Note · Your words, delivered on time.
Unsubscribe · Privacy Policy
```

---

## Metrics Dashboard (What to Track)

### Primary KPIs
| Metric | Current | Target |
|--------|---------|--------|
| Signup → First Letter | ? | 65% |
| First Letter → Scheduled | ? | 50% |
| Free → Paid Conversion | ? | 10% |
| Delivery Open Rate | ? | 90% |
| Post-Delivery Return (7d) | ? | 35% |

### Funnel to Instrument
```
Landing Visit
    ↓ (track: time on page, scroll depth)
Signup
    ↓ (track: source, device, time to signup)
Onboarding Complete
    ↓ (track: steps completed, skip rate)
First Letter Started
    ↓ (track: template used, word count)
First Letter Saved
    ↓ (track: time to save, session duration)
First Delivery Scheduled
    ↓ (track: delivery date distance, time in app)
Conversion to Paid
    ↓ (track: plan selected, time to convert)
Letter Delivered
    ↓ (track: open rate, click rate)
Return Visit
    ↓ (track: days to return, next action)
Second Letter Written
```

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Physical mail never ships | Medium | High | Set hard deadline or remove from pricing |
| Template adoption low | Low | Medium | A/B test prominent vs. subtle placement |
| Email deliverability issues | Low | Critical | Monitor Resend dashboard, warm IP |
| User backlash on freemium clarity | Medium | Low | Grandfather existing free users |

---

## Success Criteria

### 30-Day Checkpoint
- [ ] Physical mail shipped OR removed from pricing
- [ ] 12 templates live with UI
- [ ] Onboarding rewritten and A/B tested
- [ ] Free tier clearly explained everywhere

### 60-Day Checkpoint
- [ ] Beautiful delivery email template live
- [ ] 5-email lifecycle sequence active
- [ ] Dashboard countdown timers shipped
- [ ] PostHog analytics tracking full funnel

### 90-Day Checkpoint
- [ ] Signup → Scheduled rate > 30%
- [ ] Post-delivery return rate > 25%
- [ ] Net Promoter Score measured
- [ ] First gifting/sharing feature in beta

---

## The Bottom Line

**Current State**: 67/100 - Good foundation, incomplete experience
**30-Day Target**: 78/100 - Trust restored, conversion improved
**90-Day Target**: 88/100 - Emotional design complete, retention solid
**6-Month Target**: 95/100 - Growth mechanics, market expansion

**The product is 10 focused weeks away from being genuinely excellent.**

The hard part (security, reliability, architecture) is done.
The remaining work (emotion, copy, templates, emails) is creative, not technical.

Ship the soul.
