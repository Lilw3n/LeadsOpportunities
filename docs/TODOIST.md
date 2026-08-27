# Todoist — CRM Leads Opportunities

Connecter [app.todoist.com](https://app.todoist.com) au site : chaque lead peut devenir une tâche, et le CRM affiche aujourd’hui / en retard.

Page CRM : `/crm-todoist.html`

---

## Option A — jeton API (la plus rapide)

1. Ouvrir [Todoist → Paramètres → Intégrations → Développeur](https://app.todoist.com/app/settings/integrations/developer)
2. Copier le **jeton API**
3. Vercel → projet → **Environment Variables** :
   - `TODOIST_API_TOKEN` = le jeton
   - optionnel `TODOIST_PROJECT_ID` = id du projet (sinon Inbox)
4. **Redeploy**
5. CRM → **Todoist** → Actualiser → **Créer une tâche test**

Les nouveaux leads du site créent alors une tâche « Lead {besoin} — {nom} » due aujourd’hui.

---

## Option B — OAuth (bouton Connecter)

1. Créer une app : [developer.todoist.com/appconsole.html](https://developer.todoist.com/appconsole.html)
2. **OAuth redirect URL** :

```
https://www.leadsopportunities.fr/api/auth/todoist-callback
```

3. Vercel :
   - `TODOIST_CLIENT_ID`
   - `TODOIST_CLIENT_SECRET`
4. Redeploy → CRM → **Connecter Todoist** → autoriser sur app.todoist.com

Le jeton est stocké en base (compte CRM), pas dans l’URL.

---

## Usage

| Action | Où |
|--------|-----|
| Voir les tâches du jour | `/crm-todoist.html` |
| Créer une tâche depuis une fiche | bouton **Ajouter à Todoist** |
| Auto à chaque lead | `finalizeLeadIngest` (comme Slack) |

---

## Variables

| Variable | Rôle |
|----------|------|
| `TODOIST_API_TOKEN` | Jeton personnel (équipe / courtier) |
| `TODOIST_CLIENT_ID` / `TODOIST_CLIENT_SECRET` | OAuth |
| `TODOIST_PROJECT_ID` | Projet cible (optionnel) |

Ne jamais coller le jeton dans une URL publique.
