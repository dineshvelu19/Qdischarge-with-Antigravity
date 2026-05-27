#!/bin/bash

# Exit immediately if any command exits with a non-zero status
set -e

echo "===================================================="
echo "          Qdischarge Platform Setup Script          "
echo "===================================================="

# 1. Install dependencies
echo "Installing project dependencies..."
npm install

# 2. shadcn/ui initialisation
echo "Initializing shadcn/ui components..."
npx shadcn@latest init --yes --defaults

# 3. Environment variable setup
if [ ! -f .env.local ]; then
  echo "Setting up local environment variables..."
  cp .env.local.example .env.local
  echo "✓ Created .env.local from example template."
else
  echo "✓ .env.local already exists, skipping copy."
fi

# 4. Instructions print
echo "===================================================="
echo "                 SETUP SUCCESSFUL                   "
echo "===================================================="
echo "To complete the integration, please fill in your env variables in:"
echo "   -> .env.local"
echo ""
echo "Variables to configure from your Supabase Dashboard:"
echo " - NEXT_PUBLIC_SUPABASE_URL"
echo " - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo " - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "Starting local clinical development server..."
echo "===================================================="

# 5. Dev server trigger
npm run dev
