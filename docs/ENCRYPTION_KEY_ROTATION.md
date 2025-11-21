# Encryption Key Rotation Procedure

## Overview

DearMe uses AES-256-GCM encryption to protect letter content at rest. This document describes the procedure for rotating encryption keys safely without data loss.

## Current Encryption Architecture

### Key Management
- **Master Key**: Stored in `CRYPTO_MASTER_KEY` environment variable
- **Key Format**: Base64-encoded 32-byte (256-bit) random key
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Versioning**: Supported via `keyVersion` field in database

### Database Schema
```prisma
model Letter {
  bodyCiphertext  Bytes    // Encrypted content
  bodyNonce       Bytes    // Unique 96-bit nonce
  keyVersion      Int @default(1)  // Key rotation support
  bodyFormat      String   // "rich" | "md" | "html"
}
```

### Encryption Flow
1. Generate unique 96-bit nonce for each encryption
2. Encrypt content using AES-256-GCM with master key
3. Store ciphertext, nonce, and key version
4. On read: decrypt using corresponding key version

## Why Rotate Keys?

Rotate encryption keys when:
- **Compliance requirements**: PCI-DSS, HIPAA, SOC2 require periodic rotation
- **Security incident**: Suspected key compromise
- **Employee offboarding**: Key may have been exposed
- **Regular schedule**: Annual rotation as best practice
- **Algorithm upgrade**: Moving to stronger encryption

## Key Rotation Strategies

### Option 1: Online Rotation (Zero Downtime, Recommended)

**Supports:** Gradual migration with mixed key versions

```typescript
// Step 1: Add new key to environment (keep old key)
CRYPTO_MASTER_KEY_V1=<old-key-base64>
CRYPTO_MASTER_KEY_V2=<new-key-base64>
CRYPTO_CURRENT_KEY_VERSION=2

// Step 2: Update encryption.ts to support multiple keys
const ENCRYPTION_KEYS = {
  1: Buffer.from(process.env.CRYPTO_MASTER_KEY_V1!, 'base64'),
  2: Buffer.from(process.env.CRYPTO_MASTER_KEY_V2!, 'base64'),
}

const CURRENT_KEY_VERSION = parseInt(process.env.CRYPTO_CURRENT_KEY_VERSION || '1')

async function encryptLetter(data) {
  // Use new key for new encryptions
  const key = ENCRYPTION_KEYS[CURRENT_KEY_VERSION]
  // ... encrypt with key
  return { ciphertext, nonce, keyVersion: CURRENT_KEY_VERSION }
}

async function decryptLetter(ciphertext, nonce, keyVersion) {
  // Use appropriate key based on version
  const key = ENCRYPTION_KEYS[keyVersion]
  if (!key) throw new Error(\`Key version \${keyVersion} not found\`)
  // ... decrypt with key
}

// Step 3: Background job to re-encrypt old data
async function reencryptLetters() {
  const oldLetters = await prisma.letter.findMany({
    where: { keyVersion: 1 },
    take: 100, // Batch size
  })

  for (const letter of oldLetters) {
    // Decrypt with old key
    const data = await decryptLetter(
      letter.bodyCiphertext,
      letter.bodyNonce,
      letter.keyVersion
    )

    // Re-encrypt with new key
    const { ciphertext, nonce, keyVersion } = await encryptLetter(data)

    // Update database
    await prisma.letter.update({
      where: { id: letter.id },
      data: { bodyCiphertext: ciphertext, bodyNonce: nonce, keyVersion },
    })
  }
}

// Step 4: Monitor progress
SELECT key_version, COUNT(*) FROM letters GROUP BY key_version;

// Step 5: After 100% migrated, remove old key from environment
// CRYPTO_MASTER_KEY_V1 can be deleted (keep backup for 30 days)
```

### Option 2: Offline Rotation (Maintenance Window)

**Requires:** Brief downtime for migration

```bash
# Step 1: Schedule maintenance window
# Put app in maintenance mode

# Step 2: Generate new key
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
# Save output as NEW_KEY

# Step 3: Run migration script
DATABASE_URL="..." \
CRYPTO_MASTER_KEY="<old-key>" \
NEW_CRYPTO_MASTER_KEY="<new-key>" \
node scripts/rotate-encryption-key.js

# Step 4: Update environment variables
CRYPTO_MASTER_KEY=<new-key>

# Step 5: Deploy app with new key
# End maintenance mode
```

### Option 3: Opportunistic Rotation (Lazy Migration)

**Strategy:** Re-encrypt on write, no batch job

```typescript
async function updateLetter(letterId, newContent) {
  const letter = await prisma.letter.findUnique({ where: { id: letterId } })

  // Always encrypt updates with current key version
  const { ciphertext, nonce, keyVersion } = await encryptLetter(newContent)

  await prisma.letter.update({
    where: { id: letterId },
    data: { bodyCiphertext: ciphertext, bodyNonce: nonce, keyVersion },
  })
}

// Over time, all actively-used letters migrate to new key
// Inactive letters remain on old key (acceptable for many use cases)
```

## Implementation: Migration Script

Create `scripts/rotate-encryption-key.ts`:

```typescript
import { PrismaClient } from '@dearme/prisma'
import crypto from 'crypto'

const prisma = new PrismaClient()

// Old and new keys from environment
const OLD_KEY = Buffer.from(process.env.CRYPTO_MASTER_KEY!, 'base64')
const NEW_KEY = Buffer.from(process.env.NEW_CRYPTO_MASTER_KEY!, 'base64')
const NEW_KEY_VERSION = 2

async function decryptWithOldKey(ciphertext: Buffer, nonce: Buffer) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', OLD_KEY, nonce)
  decipher.setAuthTag(ciphertext.slice(-16)) // Last 16 bytes are auth tag
  const encrypted = ciphertext.slice(0, -16)

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ])

  return JSON.parse(decrypted.toString('utf-8'))
}

async function encryptWithNewKey(data: any) {
  const nonce = crypto.randomBytes(12) // 96 bits
  const cipher = crypto.createCipheriv('aes-256-gcm', NEW_KEY, nonce)

  const plaintext = Buffer.from(JSON.stringify(data), 'utf-8')
  const encrypted = Buffer.concat([
    cipher.update(plaintext),
    cipher.final(),
    cipher.getAuthTag()
  ])

  return { ciphertext: encrypted, nonce }
}

async function rotateKeys() {
  console.log('Starting key rotation...')

  const totalLetters = await prisma.letter.count({ where: { keyVersion: 1 } })
  console.log(\`Found \${totalLetters} letters to re-encrypt\`)

  const batchSize = 100
  let processed = 0

  while (true) {
    const letters = await prisma.letter.findMany({
      where: { keyVersion: 1 },
      take: batchSize,
    })

    if (letters.length === 0) break

    for (const letter of letters) {
      try {
        // Decrypt with old key
        const data = await decryptWithOldKey(letter.bodyCiphertext, letter.bodyNonce)

        // Re-encrypt with new key
        const { ciphertext, nonce } = await encryptWithNewKey(data)

        // Update database
        await prisma.letter.update({
          where: { id: letter.id },
          data: {
            bodyCiphertext: ciphertext,
            bodyNonce: nonce,
            keyVersion: NEW_KEY_VERSION,
          },
        })

        processed++

        if (processed % 10 === 0) {
          console.log(\`Progress: \${processed}/\${totalLetters} (\${((processed/totalLetters)*100).toFixed(1)}%)\`)
        }
      } catch (error) {
        console.error(\`Failed to rotate key for letter \${letter.id}:\`, error)
        throw error // Halt on error
      }
    }
  }

  console.log(\`✅ Successfully re-encrypted \${processed} letters\`)
}

rotateKeys()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**Run migration:**
```bash
CRYPTO_MASTER_KEY="<old-key>" \
NEW_CRYPTO_MASTER_KEY="<new-key>" \
DATABASE_URL="..." \
tsx scripts/rotate-encryption-key.ts
```

## Monitoring & Validation

### Pre-Rotation Checklist

- [ ] **Backup database**: Full backup before starting
- [ ] **Generate new key**: `crypto.randomBytes(32).toString('base64')`
- [ ] **Store securely**: Save in password manager (1Password, Vault)
- [ ] **Test in staging**: Run full rotation on staging environment
- [ ] **Verify decryption**: Ensure staging app works with new key
- [ ] **Schedule maintenance**: Notify users of downtime (if offline)

### During Rotation

Monitor:
```sql
-- Progress tracking
SELECT key_version, COUNT(*) as count
FROM letters
GROUP BY key_version;

-- Failed migrations (if any)
SELECT id, updated_at, key_version
FROM letters
WHERE key_version = 1
ORDER BY updated_at DESC
LIMIT 100;
```

### Post-Rotation Validation

```bash
# 1. Verify all letters migrated
psql $DATABASE_URL -c "SELECT key_version, COUNT(*) FROM letters GROUP BY key_version;"
# Expected: 100% on new key version

# 2. Test decryption in production
# - Open app and view a letter
# - Create new letter
# - Schedule delivery

# 3. Monitor error logs
# - Check for decryption errors
# - Verify no key version mismatches

# 4. Keep old key for 30 days
# - In case of rollback needed
# - After 30 days, delete from all systems
```

## Rollback Procedure

If issues occur during rotation:

```bash
# 1. Stop migration script (Ctrl+C)

# 2. Revert environment to old key
CRYPTO_MASTER_KEY=<old-key>  # Restore original

# 3. Deploy with old key
# Letters with keyVersion=1: use old key ✅
# Letters with keyVersion=2: will fail ⚠️

# 4. Rollback database (if needed)
# Restore from pre-rotation backup

# 5. Investigate and fix issue

# 6. Retry rotation with fix
```

## Key Storage Best Practices

### Development
- Use `.env.local` (gitignored)
- Never commit keys to version control
- Rotate dev keys regularly (they're less critical)

### Staging
- Store in Vercel environment variables
- Use different keys than production
- Can use same rotation schedule as prod

### Production
- **Option 1**: Vercel environment variables (encrypted at rest)
- **Option 2**: AWS Secrets Manager / Google Secret Manager
- **Option 3**: HashiCorp Vault (enterprise)
- **Recommended**: Use secret management service with audit trail

**Access control:**
- Limit key access to 2-3 senior engineers
- Require 2FA for secret management access
- Log all key access events
- Rotate immediately if someone leaves company

## Migration to KMS (Future Enhancement)

For enhanced security, migrate to Key Management Service:

### AWS KMS
```typescript
import { KMSClient, DecryptCommand, EncryptCommand } from "@aws-sdk/client-kms"

const kms = new KMSClient({ region: "us-east-1" })

async function encryptLetter(data: any) {
  const command = new EncryptCommand({
    KeyId: process.env.AWS_KMS_KEY_ID,
    Plaintext: Buffer.from(JSON.stringify(data)),
  })

  const result = await kms.send(command)
  return { ciphertext: result.CiphertextBlob }
}
```

**Benefits:**
- Automatic key rotation
- Audit trail (CloudTrail)
- Access control (IAM policies)
- Hardware Security Module (HSM) backing
- Compliance (FIPS 140-2)

**Migration path:**
1. Set up KMS key in AWS
2. Update encryption.ts to support KMS
3. Run re-encryption with KMS (similar to key rotation)
4. Remove CRYPTO_MASTER_KEY from environment

## Compliance Notes

### GDPR
- Encryption is not required by GDPR, but recommended
- Key rotation demonstrates security commitment
- Document rotation in privacy policy

### PCI-DSS
- Requires key rotation at least annually
- Cryptographic key components must be stored securely
- Access to keys must be restricted to minimum necessary

### HIPAA
- Encryption is "addressable" (not strictly required)
- Key management must be documented
- Regular rotation demonstrates "reasonable and appropriate" safeguards

### SOC2
- Key rotation demonstrates "security monitoring"
- Document procedures in System Description
- Auditors will verify rotation actually occurred

## FAQ

**Q: How often should we rotate keys?**
A: Recommended: Annually. Minimum: Every 2 years. After any security incident: Immediately.

**Q: What if we lose the old key before migration completes?**
A: Data encrypted with lost key is permanently unrecoverable. Always keep backups of old keys for 30+ days after rotation completes.

**Q: Can we rotate while app is running?**
A: Yes, using Online Rotation (Option 1). New encryptions use new key, old data decrypts with old key.

**Q: How long does rotation take?**
A: Depends on data volume. Estimate: ~1000 letters per minute. For 100K letters: ~100 minutes.

**Q: What happens if script fails mid-rotation?**
A: Partially migrated (some v1, some v2). Safe to restart script - it only processes v1 letters.

**Q: Should we rotate Stripe, Clerk, etc. keys too?**
A: Different process. Those are API keys, not encryption keys. Rotate via provider dashboard.

## Resources

- [NIST Key Management Guidelines](https://csrc.nist.gov/publications/detail/sp/800-57-part-1/rev-5/final)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)
- [AWS KMS Best Practices](https://docs.aws.amazon.com/kms/latest/developerguide/best-practices.html)

## Support

For questions or issues with key rotation:
1. Check this document first
2. Review error logs
3. Restore from backup if needed
4. Contact security team
5. Never share keys in Slack/email
