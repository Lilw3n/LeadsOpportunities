---
generated: false
type: journal
tags:
  - acquisition
  - reseaux
---

# n8n réseaux

Hébergement : ordinateur, 0 € (`n8n/demarrer.sh`). Si le PC est souvent éteint, instance Oracle Cloud Always Free (`VM.Standard.A1.Flex`, 1 OCPU, 6 Go, `./serveur.sh`). Render, Heroku et DigitalOcean sont trop chers ou s'endorment. Supabase est une base, le CRM est déjà sur Neon.

[[Journal/o2switch|o2switch]] garde le DNS et le mail de secours. L'hébergement mutualisé ne fait pas tourner n8n (pas de Docker, processus long coupé, cron wget limité à 360 s, et il ne voit pas `127.0.0.1` de l'ordinateur).

La file publique est https://www.leadsopportunities.fr/social/queue.json : articles France, VTC en tête. Le workflow `n8n/workflows/blog-vers-reseaux.json` publie un article sur la Page Facebook `61591265349051` les jours ouvrés à 10 h. Mention ORIAS n° 15005935 dans chaque texte. Le jeton reste sur la machine.

Mode d'emploi : `docs/N8N-RESEAUX-GRATUIT.md`.
