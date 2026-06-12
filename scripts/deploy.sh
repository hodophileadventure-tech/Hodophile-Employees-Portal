#!/bin/bash

# Railway Deployment Automation Script
# This script automates database migration and seeding on Railway

set -e

echo "🚀 Railway Deployment Script"
echo "================================"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL environment variable not set"
  exit 1
fi

echo "📊 Environment: $NODE_ENV"
echo "🗄️  Database: PostgreSQL"

# Generate Prisma Client
echo ""
echo "📦 Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"

# Run migrations
echo ""
echo "🔄 Running database migrations..."
npx prisma migrate deploy
echo "✅ Migrations completed"

# Seed database (optional)
if [ "$SEED_DATABASE" = "true" ]; then
  echo ""
  echo "🌱 Seeding database..."
  npx prisma db seed
  echo "✅ Database seeded"
else
  echo ""
  echo "⏭️  Skipping database seeding (set SEED_DATABASE=true to enable)"
fi

echo ""
echo "✨ Railway deployment setup complete!"
echo "You can now start your application with: npm start"
