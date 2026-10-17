---
generated: false
type: journal
tags:
  - hebergement
  - n8n
---

# o2switch

Hébergeur déjà en place. Il sert au DNS et au mail. Il ne fait pas tourner n8n.

## Ce qu'o2switch porte déjà

- Zone DNS de `assurancevtcfrance.com` (apex vers l'IP o2switch, mail MX / SPF / DKIM). Détail : `docs/ASSURANCE-VTC-FRANCE-DNS.md`.
- Secours mail de `leadsopportunities.fr` : MX priorité 10, Roundcube `https://sodium.o2switch.net:2096/`, import IMAP dans le CRM (bouton Historique o2switch). La réception principale est Google Workspace.
- Le site public et les API sont sur Vercel. La base des leads est sur Neon.

## n8n

n8n a besoin d'un processus Node qui reste allumé, d'un disque pour SQLite, et du créneau de 10 h. L'installation retenue est l'ordinateur : `n8n/demarrer.sh`. Voir [[Journal/n8n reseaux|n8n réseaux]].

L'offre mutualisée o2switch (cPanel, une Lune) sait lancer une application **web** Node.js avec Setup Node.js App et Passenger. Elle ne fournit pas Docker. Un processus qui reste ouvert (n8n, son éditeur, ses workflows) peut être arrêté par l'hébergeur, et une tâche cron wget est coupée au bout de 360 secondes. Le cron o2switch ne joint pas non plus n8n quand il écoute seulement sur `127.0.0.1` de l'ordinateur.

On laisse donc o2switch sur le DNS et le mail. On n'y déplace pas n8n, et on ne prend pas l'offre bare-metal payante.

Source o2switch : [Setup Node.js App](https://faq.o2switch.fr/cpanel/logiciels/hebergement-nodejs-multi-version/), [tâches cron](https://faq.o2switch.fr/cpanel/outils-avances/tache-planifiee-cron/).
