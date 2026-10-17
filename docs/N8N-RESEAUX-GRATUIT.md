# n8n — blog vers Facebook (0 € à l'exécution)

n8n Cloud facture chaque exécution. On garde l'image community : un prix fixe d'hébergement, puis autant de posts et d'appels d'API que nécessaire.

Le compromis : un droplet DigitalOcean à **6 € par mois** (1 Go de RAM, 1 vCPU, 25 Go). Il reste allumé, donc le créneau de 10 h part. On l'agrandit plus tard (12 €, puis 24 €) si les workflows deviennent lourds. Les API (Facebook, LinkedIn, le site) se branchent dans n8n, sans abonnement supplémentaire.

| Hébergement | Prix affiché | Pour ce cron | Décision |
| --- | --- | --- | --- |
| Ordinateur (`./demarrer.sh`) | 0 € | Part seulement si le PC est allumé à 10 h | Essai |
| DigitalOcean droplet 6 € | 6 €/mois, plafond mensuel | Toujours allumé, Docker, disque conservé | **À prendre** |
| Render gratuit | 0 € | S'éteint après 15 min sans visite, disque effacé, le cron ne réveille pas le service | Écarté |
| Render payant | dès 7 €, n8n y est à l'aise vers 25 € | Disque persistant = une seule instance | Plus cher pour le même service |
| Heroku | Eco 5 € qui dort, Basic 7 € + Postgres 5 € | Disque éphémère, plus de formule gratuite | Écarté |
| Supabase | 0 € puis 25 € | Base et API REST. Ça ne fait pas tourner n8n. Le projet gratuit se met en pause après une semaine | Déjà couvert par Neon pour le CRM |

Supabase et Neon servent à stocker des données et à exposer une API. Le site a déjà Neon. On ne le remplace pas, et on n'y met pas les tables internes de n8n.

## Serveur (le chemin retenu)

1. Créer un droplet Ubuntu 24.04, Basic 1 Go / 6 €, région Francfort ou Amsterdam. Authentification par clé SSH.
2. DNS : enregistrement **A** `n8n.leadsopportunities.fr` vers l'IP du droplet.
3. Sur le droplet, installer Docker, copier le dossier `n8n/`, puis :

```bash
cd n8n
./serveur.sh
```

4. Ouvrir `https://n8n.leadsopportunities.fr`, créer le compte propriétaire, importer le workflow, coller le jeton Facebook.

Caddy obtient le certificat. n8n n'est pas publié en HTTP nu. La clé et le jeton restent dans `n8n/.env` et `n8n/data/` sur le droplet.

Pour agrandir : DigitalOcean → Resize le droplet. Les workflows restent sur le disque. On ne passe pas à une facture par exécution.

## Essai sur l'ordinateur

Même image community, base SQLite. Le post de 10 h part si l'ordinateur est allumé. Meta ne facture pas une publication organique.

Le jeton Facebook reste dans n8n, sur la machine. Il n'est pas dans le dépôt.

## Installer

Docker Desktop est le seul prérequis.

```bash
cd n8n
./demarrer.sh
```

Ouvrir http://127.0.0.1:5678 et créer le compte propriétaire (stocké en local).

Arrêter : `docker compose stop` dans `n8n/`. Les workflows restent dans `n8n/data/`.

## Brancher la Page

1. Dans n8n : Workflows → Importer depuis un fichier → `n8n/workflows/blog-vers-reseaux.json`.
2. Identifiants → Query Auth, nom exact `Facebook Page token`.
3. Nom du paramètre : `access_token`. Valeur : le jeton de la Page `61591265349051`.
4. Ouvrir le nœud « Publier sur la Page Facebook » et choisir cet identifiant.
5. Activer le workflow.

Le jeton se crée dans Meta for Developers, application en mode développement liée à la Page, permission `pages_manage_posts`. C'est le compte Meta du cabinet, sans abonnement n8n.

## Ce qui est publié

`social/queue.json` liste les articles France, VTC d'abord, puis mutuelle, métiers, prêt, habitation, auto. Chaque texte contient le lien de l'article, le devis, et la mention ORIAS n° 15005935. Aucun prix n'est écrit dans le message.

Régénérer la file après de nouveaux articles :

```bash
npm run social:queue
```

n8n mémorise les URL déjà publiées. Quand la file est épuisée, il ne republie pas.

## LinkedIn et Instagram

Le même texte est prêt dans la file (`linkedinLink`). La publication LinkedIn et Instagram demande un jeton de chaque réseau. Le workflow actuel poste sur la Page Facebook, le réseau déjà relié au site. On ajoute l'autre réseau quand son jeton est dans n8n, toujours en local.
