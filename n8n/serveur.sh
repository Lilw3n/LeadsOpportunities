#!/bin/sh
# n8n sur une instance Oracle Always Free (0 €). Le jeton et la clé restent dans n8n/.env.
set -e
cd "$(dirname "$0")"
if ! command -v docker >/dev/null 2>&1; then
  echo "Installez Docker sur le serveur, puis relancez ./serveur.sh"
  exit 1
fi
if [ ! -f .env ]; then
  if ! command -v openssl >/dev/null 2>&1; then
    echo "openssl est nécessaire pour créer n8n/.env"
    exit 1
  fi
  key="$(openssl rand -hex 24)"
  printf 'N8N_ENCRYPTION_KEY=%s\nN8N_HOST=n8n.leadsopportunities.fr\n' "$key" > .env
  echo "Clé locale écrite dans n8n/.env"
fi
if ! grep -q '^N8N_HOST=.\+' .env; then
  echo "Ajoutez N8N_HOST=n8n.leadsopportunities.fr dans n8n/.env"
  exit 1
fi
mkdir -p data
docker compose -f docker-compose.serveur.yml up -d
host="$(grep '^N8N_HOST=' .env | head -n 1 | cut -d= -f2-)"
echo "n8n : https://${host}"
echo "Le DNS A de ${host} doit pointer vers ce serveur avant le certificat."
