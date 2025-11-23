# Scripts Directory

Utility scripts for development, testing, and operations.

---

## Available Scripts

### `setup-local-webhooks.sh`

**Purpose**: Automated setup for local webhook testing environment

**What it does**:
- Checks for Homebrew installation
- Installs Stripe CLI (if not present)
- Installs ngrok (if not present)
- Creates .env.local from .env.example (if missing)
- Provides instructions for authentication

**Usage**:
```bash
./scripts/setup-local-webhooks.sh
```

**Requirements**:
- macOS (Homebrew-based)
- Internet connection

**After running**:
1. Authenticate Stripe CLI: `stripe login`
2. Authenticate ngrok: `ngrok config add-authtoken YOUR_TOKEN`
3. Edit .env.local with your API keys
4. Follow daily workflow in output

---

## Related Documentation

- **Quick Start**: `docs/WEBHOOK_TESTING_QUICK_START.md`
- **Full Guide**: `docs/LOCAL_WEBHOOK_TESTING.md`
- **Architecture**: `docs/WEBHOOK_ARCHITECTURE.md`
- **Security Fixes**: `docs/SECURITY_FIXES_SUMMARY.md`

---

## Future Scripts (Planned)

### `test-webhooks.sh`
Automated webhook testing script

### `rotate-secrets.sh`
Secret rotation automation

### `backup-db.sh`
Database backup utility

### `deploy-check.sh`
Pre-deployment validation

---

## Contributing

When adding new scripts:

1. **Make executable**: `chmod +x scripts/your-script.sh`
2. **Add shebang**: `#!/bin/bash` at the top
3. **Add description**: Clear comments explaining purpose
4. **Add to this README**: Document usage and requirements
5. **Test thoroughly**: Verify on clean environment
6. **Handle errors**: Use `set -e` for safety
7. **Add colors**: Use ANSI codes for readability
8. **Provide feedback**: Echo status messages

---

## Script Template

```bash
#!/bin/bash

# Script Name and Purpose
# Description of what this script does

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting script...${NC}"

# Your script logic here

echo -e "${GREEN}✅ Script complete!${NC}"
```

---

## Troubleshooting

**Issue**: "Permission denied"
```bash
# Solution: Make script executable
chmod +x scripts/your-script.sh
```

**Issue**: "command not found: brew"
```bash
# Solution: Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

**Issue**: Script fails on non-macOS
```bash
# Solution: Check OS compatibility in script or use manual installation
# See docs/LOCAL_WEBHOOK_TESTING.md for manual steps
```
