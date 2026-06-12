#!/bin/sh
set -e

echo "🚀 Starting application..."
echo "📊 Running database migrations..."

npx prisma migrate deploy

echo "✅ Migrations complete!"
echo "🌱 Seeding database (optional)..."

# Optional: seed database on first deploy
if [ "$SEED_DATABASE" = "true" ]; then
  npx prisma db seed || true
fi

echo "✨ Starting Next.js server..."
exec next start
