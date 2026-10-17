#!/bin/sh
# Démarre n8n sur cette machine. Rien n'est envoyé à n8n Cloud.
set -e
cd "$(dirname "$0")"
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker est nécessaire. Installez Docker Desktop, puis relancez ./demarrer.sh"
  exit 1
fi
if [ ! -f .env ]; then
  if ! command -v openssl >/dev/null 2>&1; then
    echo "openssl est nécessaire pour créer n8n/.env"
    exit 1
  fi
  key="$(openssl rand -hex 24)"
  printf 'N8N_ENCRYPTION_KEY=%s\n' "$key" > .env
  echo "Clé locale écrite dans n8n/.env"
fi
mkdir -p data
docker compose up -d
echo "n8n est sur http://127.0.0.1:5678"
echo "Importez workflows/blog-vers-reseaux.json puis collez le jeton de la Page Facebook."
