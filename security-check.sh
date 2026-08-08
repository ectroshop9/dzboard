#!/bin/bash
# Security checklist for DZBoard deployment

echo "🔐 DZBoard Security Checklist"
echo "============================="
echo ""

# Check environment variables
echo "📋 Checking environment variables..."
REQUIRED_VARS=("ADMIN_USERNAME" "ADMIN_PASSWORD" "ADMIN_TOKEN" "COOKIE_SECRET" "FRONTEND_URL" "SUPABASE_URL" "SUPABASE_ANON_KEY")

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ Missing: $var"
  else
    echo "✅ Set: $var"
  fi
done

echo ""
echo "📦 Checking dependencies..."
npm list helmet express-rate-limit csurf cookie-parser validator

echo ""
echo "🔍 Security audit..."
npm audit --production

echo ""
echo "✅ Security checklist complete!"
echo ""
echo "Before deployment, ensure:"
echo "1. ✅ All environment variables are set"
echo "2. ✅ HTTPS is enabled (Vercel does this automatically)"
echo "3. ✅ npm audit shows no critical vulnerabilities"
echo "4. ✅ All secrets are stored in Vercel, not in Git"
echo "5. ✅ Rate limiting is active"
echo "6. ✅ CSRF protection is enabled"
echo "7. ✅ CORS is restricted to your domain"
