#!/usr/bin/env bash
# Verification rapide Meta Pixel + webhook Lead Ads
set -euo pipefail

BASE="${1:-https://www.leadsopportunities.fr}"

echo "=== Config env (metaPixelId) ==="
CFG=$(curl -sS "$BASE/api/google-config-env")
echo "$CFG" | tr ';' '\n' | rg 'metaPixelId' || true

echo ""
echo "=== google-config.js (default pixel si env vide) ==="
curl -sS "$BASE/google-config.js" | rg 'metaPixelId' | head -3

echo ""
echo "=== Landing rappel (fbq present?) ==="
HTML=$(curl -sS "$BASE/landings/rappel.html")
echo "$HTML" | rg -o 'google-config|fbevents|metaPixelId' | sort -u || echo "scripts tracking absents"

echo ""
echo "=== Webhook meta-lead (GET verify) ==="
CODE=$(curl -sS -o /dev/null -w "%{http_code}" "$BASE/api/webhooks/meta-lead?hub.mode=subscribe&hub.verify_token=test&hub.challenge=ok")
echo "HTTP $CODE (403/404 attendu sans META_VERIFY_TOKEN ou avant deploy webhook)"

echo ""
echo "=== Test URL a ouvrir dans le navigateur ==="
echo "$BASE/landings/rappel.html?utm_source=meta&utm_medium=test&utm_campaign=pixel-check"
