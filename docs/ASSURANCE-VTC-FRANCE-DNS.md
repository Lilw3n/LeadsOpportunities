# assurancevtcfrance.com — DNS (o2switch → Vercel)

Domaine pub / SEO / leads VTC, même dépôt que Leads Opportunities.

## Objectif

| Usage | URL |
|-------|-----|
| Accueil pub | `https://www.assurancevtcfrance.com/` |
| Devis express | `https://www.assurancevtcfrance.com/devis` |
| Chemin aussi sur LO | `https://www.leadsopportunities.fr/assurance-vtc-france/` |

Leads → `POST /api/lead` (Neon / CRM) avec `utm_source=assurancevtcfrance` et `site_domain=assurancevtcfrance.com`.

## État actuel (zone o2switch)

D’après l’éditeur de zone :

- Apex **A** → `109.234.166.232` (o2switch)
- **www** CNAME → `assurancevtcfrance.com`
- Mail (**MX**, SPF, DKIM, DMARC) sur o2switch / Jabatus

Pour héberger le **site** sur Vercel **sans casser le mail**, ne touchez qu’aux enregistrements web.

## Étapes Vercel

1. Vercel → projet **Leads Opportunities** (ou projet dédié même repo) → **Settings → Domains**
2. Ajouter `assurancevtcfrance.com` et `www.assurancevtcfrance.com`
3. Vercel affiche les valeurs DNS à coller (souvent) :
   - **A** apex → `76.76.21.21`
   - **CNAME** `www` → `cname.vercel-dns.com`
4. Dans o2switch **Éditeur de zone** :
   - **Éditer** l’A de `assurancevtcfrance.com` : remplacer `109.234.166.232` par l’IP Vercel indiquée
   - **Éditer** le CNAME `www` : cible `cname.vercel-dns.com` (plus `assurancevtcfrance.com`)
   - **Ne pas supprimer** : MX `mail`, A `mail`, TXT SPF / DKIM / DMARC, SRV CalDAV (sauf si vous migrez la messagerie)

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
