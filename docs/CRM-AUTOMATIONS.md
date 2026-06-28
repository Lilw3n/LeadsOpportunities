# Automatisations CRM privees

Ce document sert de guide interne. Le CRM reste le cerveau metier : scoring, matching VSP, archivage, assignation et priorites doivent rester dans le systeme.

## Outils recommandes

- **n8n** : scenarios durables, webhooks, retries, enrichissement de leads, synchronisation Allo, Drive, Calendar, Stripe.
- **Make** : prototypes rapides, notifications, Google Sheets, Gmail, alertes marketing.
- **Zapier** : seulement si une connexion SaaS precise est plus rapide qu'avec n8n ou Make.
- **Allo** : source complementaire d'evenements d'appel, transcriptions, resumes et tags (activer plus tard — **`docs/SLACK-WITHALLO-NOTIFS.md`**).
- **Slack** : notifications leads via `SLACK_WEBHOOK_URL` (Incoming Webhook, version gratuite suffisante).
- **Google Apps Script** : petites automatisations autour de Drive, Sheets ou Calendar.

## Regles de separation

- Le CRM decide : matching VSP, priorite, archivage, assignation, desarchivage.
- Les outils externes executent : envoyer, notifier, enrichir, synchroniser.
- Aucun outil externe ne doit devenir la source unique de verite pour les leads.

## Scenarios prioritaires

1. Lead chaud Google/Meta : notification CRM, son optionnel, tache rappel rapide.
2. Lead non ouvert : alerte collaborateur apres delai, badge visuel conserve.
3. Lead archive avec nouvel evenement : desarchivage automatique et retour pipeline.
4. Resume Allo recu : activite CRM, extraction prix actuel, objections, documents manquants.
5. Rappel Allo/agenda : evenement CRM + Google Calendar si connecte.
6. Paiement Stripe : demande pieces, dossier Drive, tache de suivi.
7. Devis non repondu : relance J+1, J+3, J+7.
8. Collaborateur indisponible : reassignment ou partage des leads en attente.

## Webhooks internes utiles

- `POST /api/lead` : entree lead site et campagnes.
- `POST /api/webhooks/withallo` : source complementaire Allo.
- `POST /api/stripe/webhook` : paiement Stripe.
- `GET/POST /api/crm/private-offer-match` : matching prive VSP, CRM uniquement.

## Donnees minimales a transmettre

- `leadId`, `phone`, `email`, `visitor_id`.
- `event_type`, `source`, `summary`, `transcript`, `tags`.
- `utm_source`, `utm_medium`, `utm_campaign`, `gclid`, `fbclid`, `ttclid`.
- Champs VSP si connus : age, departement garage, usage, age vehicule, sinistres, suspension/resiliation.
