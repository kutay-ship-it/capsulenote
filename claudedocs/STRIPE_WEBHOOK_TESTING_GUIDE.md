# Stripe Webhook Testing Guide

Quick reference for testing the webhook infrastructure.

---

## Local Development Testing

### 1. Start Stripe CLI

```bash
# Install Stripe CLI (if not already)
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward webhooks to local development
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

You'll see output like:
```
> Ready! Your webhook signing secret is whsec_xxxxx (^C to quit)
```

**Important**: Copy the webhook signing secret and add to `.env.local`:
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

### 2. Start Development Servers

```bash
# Terminal 1: Next.js + Inngest workers
pnpm dev

# The Inngest Dev Server will be available at:
# http://localhost:8288
```

### 3. Trigger Test Events

```bash
# Test subscription creation
stripe trigger customer.subscription.created

# Test payment failure
stripe trigger invoice.payment_failed

# Test trial ending
stripe trigger customer.subscription.trial_will_end

# Test subscription cancellation
stripe trigger customer.subscription.deleted

# Test payment success
stripe trigger invoice.payment_succeeded
```

---

## Inngest Dev UI

Open http://localhost:8288 to:
- View all queued events
- See function execution logs
- Retry failed functions
- Inspect event payloads

---

## Test Scenarios

### Scenario 1: New Subscription

**Steps**:
1. Trigger `customer.subscription.created` event
2. Check Inngest UI for `process-stripe-webhook` function
3. Verify in database:
   - `subscriptions` table has new record
   - `subscription_usage` table has usage record
   - `webhook_events` table has processed event

**Expected Behavior**:
- Subscription created with status `active` or `trialing`
- Usage record with 2 mail credits
- Entitlements cache invalidated

### Scenario 2: Payment Failure + Dunning

**Steps**:
1. Trigger `invoice.payment_failed` event
2. Check Inngest UI for `handle-dunning` function
3. Observe 3-day sleep timer (use shorter time in dev)

**Expected Behavior**:
- Payment recorded with `failed` status
- Dunning function triggered
- Day 0 email sent immediately
- Day 3, 7, 10 reminders (adjust sleep time for testing)

### Scenario 3: Trial Ending Reminder

**Steps**:
1. Trigger `customer.subscription.trial_will_end` event
2. Check Inngest UI for `send-billing-notification` function
3. Verify email sent

**Expected Behavior**:
- Email sent with trial ending notice
- 3 days remaining calculated
- Audit event recorded

### Scenario 4: Idempotency Test

**Steps**:
1. Trigger same event twice (e.g., `customer.subscription.created`)
2. Check Inngest UI - second event should skip
3. Verify database - only one record created

**Expected Behavior**:
- First event: Processed normally
- Second event: Returns "Event already processed"
- No duplicate subscriptions or usage records

### Scenario 5: Failed Webhook (DLQ)

**Steps**:
1. Temporarily break database connection
2. Trigger any event
3. Let Inngest retry 3 times
4. Check `failed_webhooks` table

**Expected Behavior**:
- 3 retry attempts
- After final failure, event moved to DLQ
- Error message logged

---

## Monitoring Queries

### Check processed webhooks
```sql
SELECT id, type, processed_at 
FROM webhook_events 
ORDER BY processed_at DESC 
LIMIT 10;
```

### Check failed webhooks
```sql
SELECT event_id, event_type, error, retried_at 
FROM failed_webhooks 
WHERE resolved_at IS NULL
ORDER BY retried_at DESC;
```

### Check subscription status
```sql
SELECT u.email, s.status, s.plan, s.current_period_end
FROM subscriptions s
JOIN users u ON s.user_id = u.id
ORDER BY s.created_at DESC;
```

### Check usage records
```sql
SELECT u.email, su.period, su.letters_created, su.mails_sent, su.mail_credits
FROM subscription_usage su
JOIN users u ON su.user_id = u.id
ORDER BY su.period DESC;
```

### Check payment records
```sql
SELECT u.email, p.type, p.amount_cents, p.status, p.created_at
FROM payments p
JOIN users u ON p.user_id = u.id
ORDER BY p.created_at DESC;
```

---

## Common Issues & Solutions

### Issue: Webhook not receiving events

**Solutions**:
1. Verify Stripe CLI is running: `stripe listen`
2. Check webhook secret in `.env.local`
3. Verify Next.js server is running on port 3000
4. Check Stripe CLI output for errors

### Issue: Inngest function not executing

**Solutions**:
1. Verify Inngest Dev Server is running (check port 8288)
2. Check function is registered in `/api/inngest/route.ts`
3. Look for errors in Next.js console
4. Check Inngest UI for function status

### Issue: Idempotency not working

**Solutions**:
1. Verify `webhook_events` table exists
2. Check database connection
3. Ensure event ID is being used correctly
4. Look for database constraint errors

### Issue: Emails not sending

**Solutions**:
1. Verify `RESEND_API_KEY` in environment
2. Check `EMAIL_FROM_NOTIFICATION` configured
3. Look at Inngest UI for email function errors
4. Check Resend dashboard for delivery status

### Issue: Dunning sequence not progressing

**Solutions**:
1. Check Inngest UI for `handle-dunning` function
2. Verify sleep times are reasonable for testing
3. Look for invoice status check errors
4. Check Stripe API connection

---

## Production Testing

### Before Deployment

1. ✅ Test all 18 webhook event types locally
2. ✅ Verify idempotency with duplicate events
3. ✅ Test dunning sequence with short sleep times
4. ✅ Confirm emails sending successfully
5. ✅ Check database records created correctly
6. ✅ Monitor failed_webhooks table (should be empty)

### After Deployment

1. Update webhook endpoint in Stripe Dashboard
2. Select all relevant event types:
   - `customer.*`
   - `customer.subscription.*`
   - `invoice.*`
   - `checkout.session.*`
   - `payment_intent.*`
   - `charge.refunded`
   - `payment_method.*`
3. Copy production webhook signing secret
4. Update `STRIPE_WEBHOOK_SECRET` in production
5. Test with Stripe CLI in test mode first
6. Monitor for 24 hours
7. Check failed_webhooks table daily

---

## Performance Benchmarks

### Target Metrics

- Webhook endpoint response: <100ms
- Inngest processing: <500ms per event
- Email delivery: <2 seconds
- Idempotency check: <50ms
- Database operations: <100ms

### Monitoring Commands

```bash
# Watch Inngest logs
tail -f logs/inngest.log

# Check webhook response times
stripe logs tail --filter-endpoint /api/webhooks/stripe

# Monitor database performance
psql -c "SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;"
```

---

## Debugging Tips

### Enable verbose logging

Add to `.env.local`:
```
DEBUG=inngest:*
LOG_LEVEL=debug
```

### Check Stripe event object

In Inngest UI, click on any function execution to see full event payload.

### Test individual handlers

```typescript
// In test file
import { handleSubscriptionCreatedOrUpdated } from '@/functions/billing/handlers'

const testSubscription = {
  id: 'sub_test123',
  customer: 'cus_test456',
  status: 'active',
  // ... other fields
}

await handleSubscriptionCreatedOrUpdated(testSubscription)
```

### Check cache invalidation

```bash
# Redis CLI
redis-cli
> KEYS entitlements:*
> GET entitlements:user_123
> DEL entitlements:user_123
```

---

## Emergency Procedures

### If webhooks are failing

1. Check Stripe Dashboard for failed webhook deliveries
2. Query `failed_webhooks` table
3. Manually reprocess from DLQ:
   ```sql
   SELECT * FROM failed_webhooks WHERE resolved_at IS NULL;
   ```
4. Fix issue, then trigger manual reprocessing via Inngest UI

### If subscription data is incorrect

1. Query subscription in Stripe Dashboard
2. Compare with database record
3. Manually sync if needed:
   ```sql
   UPDATE subscriptions 
   SET status = 'active', current_period_end = '2025-12-17'
   WHERE stripe_subscription_id = 'sub_xxx';
   ```
4. Invalidate cache:
   ```typescript
   await invalidateEntitlementsCache(userId)
   ```

### If dunning is stuck

1. Check Inngest UI for `handle-dunning` function
2. Look for paused or failed executions
3. Manually cancel or retry from UI
4. Verify invoice status in Stripe

---

## Success Checklist

Before marking Phase 2 complete:

- [ ] All 18 webhook event types tested
- [ ] Idempotency working (duplicate events handled)
- [ ] Dunning sequence completes successfully
- [ ] Emails sending and rendering correctly
- [ ] Database records accurate
- [ ] Cache invalidation working
- [ ] Failed webhooks go to DLQ
- [ ] Audit trail complete
- [ ] No errors in production logs
- [ ] Stripe webhook endpoint verified

---

**Last Updated**: 2025-11-17
**Next Review**: After production deployment
