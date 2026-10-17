---
generated: false
type: journal
tags:
  - acquisition
  - reseaux
---

# n8n réseaux

n8n tourne en local (`n8n/docker-compose.yml`, `./demarrer.sh`). Pas d'abonnement à l'exécution.

La file publique est https://www.leadsopportunities.fr/social/queue.json : articles France, VTC en tête. Le workflow `n8n/workflows/blog-vers-reseaux.json` publie un article sur la Page Facebook `61591265349051` les jours ouvrés à 10 h. Mention ORIAS n° 15005935 dans chaque texte. Le jeton reste sur la machine.

Mode d'emploi : `docs/N8N-RESEAUX-GRATUIT.md`.
