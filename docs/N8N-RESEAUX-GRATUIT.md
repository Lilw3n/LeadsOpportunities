# n8n chez vous — blog vers Facebook (0 € à l'exécution)

n8n Cloud facture les exécutions. Ici, n8n tourne sur votre ordinateur avec l'image community et une base SQLite. Un article du blog part sur la Page Facebook chaque jour ouvré à 10 h, heure de Paris. Meta ne facture pas une publication organique.

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
