# Agenda CRM ↔ Google Calendar

## Accès
- UI : [`crm-calendar.html`](../crm-calendar.html) — **Agenda (Google)** dans la sidebar
- **Gestionnaire** : [`crm-event-manager.html`](../crm-event-manager.html) — suivi dossiers + interlocuteurs (client, banque, notaire, partenaire, apporteur…)
- Création : [`crm-event-create.html`](../crm-event-create.html)
- Liste : [`crm-events.html`](../crm-events.html)

## Vues
Timeline · Jour · Semaine · Mois — filtres type (Estimation, Visite, Mandat…) — export **iCalendar (.ics)**

## Sync Google
1. Google Cloud → activer **Google Calendar API**
2. OAuth client (même `GOOGLE_CLIENT_ID` / `SECRET` que le login)
3. Colonnes users : `integrations-calendar-drive-stripe.sql`
4. Dans Agenda → **Connecter Google** (scope `calendar.events`)
5. Chaque RDV créé est **poussé** vers Google ; **Synchroniser** importe les events Google déjà tagués CRM

Champs poussés : titre, horaires, lieu, description, lien contact, lien bien immo (`propertyId`), rappel, `extendedProperties.lo*`.

## Types métier
Estimation · Visite · Signature mandat · Compromis · RDV · Appel · Email · Tâche · Prospection · Relance suivi · Pièces dossier · RDV banque · RDV notaire · Point partenaire · Note

## Branches futures (non bloquantes)
| Module | Statut | Hook prévu |
|--------|--------|------------|
| **Stripe** | Déjà quotes / acomptes | RDV « rappel paiement » après checkout |
| **WithAllo** (`withallo.com`) | Webhook `meeting_booked` → `crm_events` | Appeler `syncCrmEventToGoogle` après insert |
| **Compta gratuite** | À choisir | Candidats FR : [Indy](https://www.indy.fr) (auto-entrepreneur), [Pennylane](https://www.pennylane.com) (essai), [Axonaut](https://axonaut.com), export FEC / CSV vers logiciel local |

Ne pas bloquer l’agenda sur ces intégrations : les points d’ancrage existent (`crm_events`, webhooks, Stripe quote).
