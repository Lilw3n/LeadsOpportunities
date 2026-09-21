#!/usr/bin/env bash
# Clone les dépôts frères (multi-repos) à côté de LeadsOpportunities.
# Utile en Cloud si repositoryDependencies a élargi le token, ou en local.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PARENT="$(dirname "$ROOT")"
REPOS=(
  DiddyImmo
  ShopIA
  NewIA
  multisite-platform
  location-vehicules-reunion
  db-sols-et-peintures
  GTAVI
)
echo "Parent: $PARENT"
for name in "${REPOS[@]}"; do
  dest="$PARENT/$name"
  if [ -d "$dest/.git" ]; then
    echo "OK déjà présent: $name"
    continue
  fi
  echo "Clone Lilw3n/$name …"
  if GIT_TERMINAL_PROMPT=0 git clone "https://github.com/Lilw3n/${name}.git" "$dest" 2>/dev/null; then
    echo "OK cloné: $name"
  else
    echo "SKIP (pas d’accès ou repo absent): $name"
  fi
done
