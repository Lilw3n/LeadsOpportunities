# assurancevtcfrance.com — DNS (o2switch → Vercel)

Domaine pub / SEO / leads VTC, même dépôt que Leads Opportunities.

## Objectif

| Usage | URL (apex prioritaire) |
|-------|-----|
| **Page VTC directe** | `https://assurancevtcfrance.com/` |
| Devis (alias) | `https://assurancevtcfrance.com/devis` |
| Mention | « par leadsopportunities.fr » dans le header / footer |
| Chemin aussi sur LO | `https://www.leadsopportunities.fr/assurance-vtc-france/` |

`/` sur **apex et www** est réécrit vers la page VTC (`/assurance-vtc-france/index.html`) — jamais l’accueil multi-métiers LO. Middleware + `vercel.json` en double sécurité.

Leads → `POST /api/lead` avec `source=assurancevtcfrance`, `utm_source=assurancevtcfrance`, `site_domain=assurancevtcfrance.com`, `platform=assurancevtcfrance`.

**Recensement CRM (obligatoire)** :
- `/crm-sources.html` — panneau **Assurance VTC France** + filtre plateforme
- Dashboard → Leads → réseau **Assurance VTC France**
- Lien direct : `/crm-sources.html?platform=assurancevtcfrance`

## État actuel (zone o2switch)

D’après l’éditeur de zone :

- Apex **A** → `109.234.166.232` (o2switch)
- **www** CNAME → `assurancevtcfrance.com`
- Mail (**MX**, SPF, DKIM, DMARC) sur o2switch / Jabatus

Pour héberger le **site** sur Vercel **sans casser le mail**, ne touchez qu’aux enregistrements web.

## Étapes Vercel

1. Vercel → projet **Leads Opportunities** (ou projet dédié même repo) → **Settings → Domains**
2. Ajouter `assurancevtcfrance.com` et `www.assurancevtcfrance.com` (les deux doivent servir la **page VTC** en `/`)
3. Vercel affiche les valeurs DNS à coller (souvent) :
   - **A** apex → `76.76.21.21`
   - **CNAME** `www` → `cname.vercel-dns.com`
4. Dans o2switch **Éditeur de zone** :
   - **Éditer** l’A de `assurancevtcfrance.com` : remplacer `109.234.166.232` par l’IP Vercel indiquée
   - **Éditer** le CNAME `www` : cible `cname.vercel-dns.com` (plus `assurancevtcfrance.com`)
   - **Ne pas supprimer** : MX `mail`, A `mail`, TXT SPF / DKIM / DMARC, SRV CalDAV (sauf si vous migrez la messagerie)

## Vérifier que `/` = page VTC

```bash
curl -sI https://assurancevtcfrance.com/ | head -10
curl -sL https://assurancevtcfrance.com/ | grep -o 'Devis assurance VTC' | head -1
curl -sL https://assurancevtcfrance.com/ | grep -o 'leadsopportunities.fr' | head -1
```

Le HTML doit contenir le formulaire VTC et la mention **leadsopportunities.fr** — pas l’accueil général LO.

## Propagation

- TTL actuel souvent 14400 (4 h) — attendre la propagation
- Vérifier : `dig +short assurancevtcfrance.com A` et `dig +short www.assurancevtcfrance.com CNAME`
- HTTPS : Vercel émet le certificat après validation DNS

## Après go-live

```bash
npm run verify:assurance-vtc-france
curl -sI https://www.assurancevtcfrance.com/ | head -5
curl -sI https://www.assurancevtcfrance.com/devis | head -5
```

- Search Console : propriété `https://www.assurancevtcfrance.com/`
- Meta / Google Ads : URLs finales du CSV `ads/meta-assurancevtcfrance.csv` et `ads/google-assurancevtcfrance.csv`
- CRM : filtrer leads `utm_source=assurancevtcfrance` ou message / champ `site_domain`

## Mail (optionnel plus tard)

Garder o2switch pour `mail.` tant que MX pointe dessus. Une migration Google Workspace demandera d’autres MX (voir `docs/GOOGLE-WORKSPACE-DNS.md` pour le modèle LO — à adapter au domaine AVF).
