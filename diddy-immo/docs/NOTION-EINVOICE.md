# Notion + facturation électronique (0 €)

Notion sert de **tableau de bord** (factures émises/reçues, suivi go-live).  
Ce n’est **pas** une PDP — Tiime reste la plateforme légale.

## Deux chemins 0 €

| Chemin | Prérequis | Usage |
|---|---|---|
| **A — Make → Notion** | Compte Notion Free + Make Free | Recommandé si Make déjà prévu |
| **B — API directe CRM → Notion** | Internal Integration Notion | Sans attendre Make |

## A. Make → Notion

1. Crée la base Notion avec le schéma `data/notion/einvoice-database-schema.json`
2. Notion → … → **Add connections** → ton intégration Make / Notion
3. Dans le scénario Make (après le webhook CRM) : module **Notion → Create a Database Item**
4. Mappe les champs (voir `makeMapping` dans le schéma JSON)
5. Blueprint étendu : `data/make-blueprints/einvoice-crm-to-make-notion.json`

## B. API directe (vars Vercel)

1. [notion.so/my-integrations](https://www.notion.so/my-integrations) → **New integration**
2. Copie le **Internal Integration Token**
3. Ouvre ta base Facturation → **… → Add connections** → sélectionne l’intégration
4. Copie l’ID de la base (URL `notion.so/xxxx?v=` → les 32 caractères avant `?`)

```bash
NOTION_TOKEN=secret_xxxxxxxx
NOTION_EINVOICE_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

5. Redeploy Vercel — chaque `invoice_issued` / facture reçue crée une ligne Notion.

Test CRM : bouton **Tester Notion** sur `/crm-e-invoicing.html`.

## Go-live

Voir aussi `docs/MAKE-TIIME-GOLIVE.md` — après Tiime ID + Make, ajoute Notion dans le même scénario.
