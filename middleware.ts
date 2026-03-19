# ============================================================
# Supabase (REQUIRED)
# ============================================================
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# ============================================================
# App URL (set to your Vercel domain in production)
# ============================================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================================
# Cron secret (for /api/cron/expire)
# Generate: openssl rand -hex 32
# ============================================================
CRON_SECRET=your-cron-secret-here

# ============================================================
# Future payment integration
# ============================================================
# STRIPE_SECRET_KEY=sk_test_xxx
# STRIPE_WEBHOOK_SECRET=whsec_xxx
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
