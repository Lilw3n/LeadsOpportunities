#!/bin/sh
# Installe Docker si besoin, démarre n8n, importe le workflow, crée le compte local.
# 0 €. Rien n'est envoyé à n8n Cloud.
set -e
cd "$(dirname "$0")"

if ! command -v docker >/dev/null 2>&1; then
  echo "Installation de Docker (paquet Ubuntu, 0 €)..."
  if ! command -v sudo >/dev/null 2>&1; then
    echo "sudo est nécessaire pour installer Docker."
    exit 1
  fi
  sudo DEBIAN_FRONTEND=noninteractive apt-get update
  sudo DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose-v2
  sudo systemctl enable --now docker || true
fi

if ! docker info >/dev/null 2>&1 && ! sudo docker info >/dev/null 2>&1; then
  echo "Démarrage du démon Docker..."
  sudo nohup dockerd >/tmp/dockerd.log 2>&1 &
  i=0
  while [ "$i" -lt 40 ]; do
    if sudo docker info >/dev/null 2>&1; then
      break
    fi
    i=$((i + 1))
    sleep 1
  done
fi

if docker info >/dev/null 2>&1; then
  DOCKER="docker"
else
  DOCKER="sudo docker"
fi

if [ ! -f .env ]; then
  if ! command -v openssl >/dev/null 2>&1; then
    echo "openssl est nécessaire pour créer n8n/.env"
    exit 1
  fi
  key="$(openssl rand -hex 24)"
  pass="$(openssl rand -hex 8)Aa1"
  printf 'N8N_ENCRYPTION_KEY=%s\nN8N_OWNER_EMAIL=%s\nN8N_OWNER_PASSWORD=%s\n' \
    "$key" "contact@leadsopportunities.fr" "$pass" > .env
  echo "Compte local écrit dans n8n/.env"
fi

# shellcheck disable=SC1091
. ./.env

mkdir -p data
$DOCKER compose up -d

echo "Attente de n8n..."
ready=0
i=0
while [ "$i" -lt 90 ]; do
  if curl -sf http://127.0.0.1:5678/healthz >/dev/null 2>&1; then
    ready=1
    break
  fi
  i=$((i + 1))
  sleep 2
done
if [ "$ready" -ne 1 ]; then
  echo "n8n ne répond pas encore. Journaux :"
  $DOCKER compose logs --tail 40
  exit 1
fi

if ! $DOCKER compose exec -T n8n n8n list:workflow | grep -q "Blog vers réseaux"; then
  $DOCKER compose exec -T n8n n8n import:workflow --input=/files/workflows/blog-vers-reseaux.json
else
  echo "Workflow déjà importé."
fi

setup="$(curl -sS -X POST http://127.0.0.1:5678/rest/owner/setup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${N8N_OWNER_EMAIL}\",\"firstName\":\"Wendy\",\"lastName\":\"Buchet\",\"password\":\"${N8N_OWNER_PASSWORD}\"}" || true)"
echo "$setup" | head -c 400
echo ""

echo "n8n : http://127.0.0.1:5678"
echo "E-mail : ${N8N_OWNER_EMAIL}"
echo "Mot de passe : ${N8N_OWNER_PASSWORD}"
echo "Le jeton Facebook se colle dans n8n : identifiant Query Auth nommé « Facebook Page token »."
