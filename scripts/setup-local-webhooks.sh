#!/bin/bash

# Local Webhook Testing Setup Script
# Sets up Stripe CLI and ngrok for local webhook testing

set -e

echo "🚀 Setting up local webhook testing environment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
  echo -e "${RED}❌ This script is for macOS only.${NC}"
  echo "For other platforms, please follow manual installation in docs/LOCAL_WEBHOOK_TESTING.md"
  exit 1
fi

# Function to check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check for Homebrew
if ! command_exists brew; then
  echo -e "${RED}❌ Homebrew is not installed.${NC}"
  echo "Install Homebrew first: https://brew.sh"
  exit 1
fi

echo -e "${GREEN}✅ Homebrew found${NC}"
echo ""

# Install Stripe CLI
echo -e "${BLUE}📦 Checking Stripe CLI...${NC}"
if command_exists stripe; then
  echo -e "${GREEN}✅ Stripe CLI already installed${NC}"
  stripe version
else
  echo "Installing Stripe CLI..."
  brew install stripe/stripe-cli/stripe
  echo -e "${GREEN}✅ Stripe CLI installed${NC}"
fi
echo ""

# Install ngrok
echo -e "${BLUE}📦 Checking ngrok...${NC}"
if command_exists ngrok; then
  echo -e "${GREEN}✅ ngrok already installed${NC}"
  ngrok version
else
  echo "Installing ngrok..."
  brew install ngrok
  echo -e "${GREEN}✅ ngrok installed${NC}"
fi
echo ""

# Check for .env.local
echo -e "${BLUE}🔧 Checking environment configuration...${NC}"
if [ ! -f "apps/web/.env.local" ]; then
  echo -e "${YELLOW}⚠️  .env.local not found${NC}"
  echo "Creating from .env.example..."
  cp apps/web/.env.example apps/web/.env.local
  echo -e "${GREEN}✅ Created apps/web/.env.local${NC}"
  echo -e "${YELLOW}📝 Please edit apps/web/.env.local and add your API keys${NC}"
else
  echo -e "${GREEN}✅ .env.local found${NC}"
fi
echo ""

# Stripe authentication
echo -e "${BLUE}🔐 Stripe CLI Authentication${NC}"
echo "Run: ${GREEN}stripe login${NC}"
echo "This will open your browser for authentication."
echo ""

# ngrok authentication
echo -e "${BLUE}🔐 ngrok Authentication${NC}"
echo "1. Sign up at: ${BLUE}https://ngrok.com${NC}"
echo "2. Get your auth token from: ${BLUE}https://dashboard.ngrok.com/get-started/your-authtoken${NC}"
echo "3. Run: ${GREEN}ngrok config add-authtoken YOUR_AUTH_TOKEN${NC}"
echo ""

# Next steps
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${BLUE}📝 Next Steps:${NC}"
echo ""
echo "1. Authenticate Stripe CLI:"
echo -e "   ${GREEN}stripe login${NC}"
echo ""
echo "2. Authenticate ngrok:"
echo -e "   ${GREEN}ngrok config add-authtoken YOUR_AUTH_TOKEN${NC}"
echo ""
echo "3. Edit environment variables:"
echo -e "   ${GREEN}code apps/web/.env.local${NC}"
echo "   Add your API keys (Stripe, Resend, etc.)"
echo ""
echo "4. Start development workflow:"
echo -e "   ${GREEN}# Terminal 1: Start Next.js${NC}"
echo -e "   ${GREEN}pnpm dev${NC}"
echo ""
echo -e "   ${GREEN}# Terminal 2: Forward Stripe webhooks${NC}"
echo -e "   ${GREEN}stripe listen --forward-to localhost:3000/api/webhooks/stripe${NC}"
echo "   Copy the webhook secret (whsec_xxx) and add to .env.local as STRIPE_WEBHOOK_SECRET"
echo ""
echo -e "   ${GREEN}# Terminal 3 (optional): Start ngrok for Resend${NC}"
echo -e "   ${GREEN}ngrok http 3000${NC}"
echo "   Use the HTTPS URL for Resend webhook configuration"
echo ""
echo "5. Test webhooks:"
echo -e "   ${GREEN}stripe trigger payment_intent.succeeded${NC}"
echo ""
echo "6. View Inngest dashboard:"
echo -e "   ${GREEN}open http://localhost:8288${NC}"
echo ""
echo -e "${YELLOW}📚 Full documentation: docs/LOCAL_WEBHOOK_TESTING.md${NC}"
echo ""
