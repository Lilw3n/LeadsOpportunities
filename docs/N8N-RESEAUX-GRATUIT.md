# n8n — blog vers Facebook, 0 €

n8n Cloud facture chaque exécution. On garde l'image community sur une machine qui ne facture pas.

Le chemin retenu : **ton ordinateur**, avec `./demarrer.sh`. Les API (Facebook, LinkedIn, le site) se branchent dans n8n. Le post de 10 h part quand l'ordinateur est allumé.

Si l'ordinateur est souvent éteint, la seule machine toujours allumée à 0 € est le palier **Always Free** d'Oracle Cloud : forme `VM.Standard.A1.Flex`, 1 OCPU, 6 Go de RAM. On reste dans le quota gratuit (2 OCPU et 12 Go au total). Si l'écran affiche un prix mensuel ou un bouton pour passer en paiement à l'usage, on s'arrête.

| Hébergement | Prix | Pour ce cron | Décision |
| --- | --- | --- | --- |
| Ordinateur (`./demarrer.sh`) | 0 € | Part quand le PC est allumé | **À prendre** |
| Oracle Cloud Always Free | 0 € | Toujours allumé, même Docker | Seulement si le PC est souvent éteint |
| Render gratuit | 0 € | S'éteint après 15 min, disque effacé, le cron ne le réveille pas | Écarté |
| Heroku, Render payant, DigitalOcean | dès 5 à 6 €/mois | Machine allumée | Trop cher |
| Supabase | 0 € puis 25 € | Base et API. Ça ne fait pas tourner n8n | Le CRM est déjà sur Neon |

## Ordinateur

Même image community, base SQLite. Meta ne facture pas une publication organique.

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

## Oracle, seulement si le PC est éteint à 10 h

1. Compte Oracle Cloud, région d'accueil en Europe (Francfort ou Amsterdam).
2. Instance Ubuntu, forme **VM.Standard.A1.Flex**, 1 OCPU, 6 Go. Image Always Free. Pas de volume payant.
3. DNS : enregistrement **A** `n8n.leadsopportunities.fr` vers l'IP publique.
4. Installer Docker, copier le dossier `n8n/`, puis `./serveur.sh`.

Même import du workflow et même jeton Facebook que sur l'ordinateur. La clé reste dans `n8n/.env` sur cette instance.

## LinkedIn et Instagram

Le même texte est prêt dans la file (`linkedinLink`). La publication LinkedIn et Instagram demande un jeton de chaque réseau. Le workflow actuel poste sur la Page Facebook, le réseau déjà relié au site. On ajoute l'autre réseau quand son jeton est dans n8n, toujours en local.
