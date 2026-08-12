# SaaS revendable — vision produit

Le CRM + site **Leads Opportunities** peut évoluer vers un **SaaS courtier / immo / patrimoine** revendable (licences cabinets, white-label, puis multi-tenant).

Aujourd’hui ce n’est **pas** encore un SaaS multi-clients sur une seule instance : c’est un **produit mono-cabinet** très riche, déjà duplicable par **fork + déploiement** (`PLATEFORME.md`).

---

## Produit à vendre (modules)

| Pilier | Contenu | Argument revente |
|--------|---------|------------------|
| **Prêts** | Dossiers, sims, docs/grilles/fiches | Cœur courtier crédit |
| **Assurance immo** | ADE, MRH, demandes | Cross-sell natural |
| **Patrimoine** | Retraite, mutuelle, invalidité, famille | Posture CGP light |
| **Banque & épargne** | Trésorerie, placements | Cash-flow commissions |
| **Barèmes FAI** | Honoraires + charges + revenu imposable estimé | Outil négo / réseau |
| **CRM leads** | Acquisition, mailbox, Stripe devis | Tunnel complet |

Pack commercial type : **Starter** (leads + CRM) · **Courtier** (+ prêts / assurance) · **Patrimoine** (+ prévoyance / banque) · **Réseau** (barèmes multi-agences).

---

## État actuel (honnête)

**Forces**
- API serverless modulaire (`api/_lib/routes/*`)
- RBAC (`admin` / `staff` / `commercial` / `apporteur`)
- Stripe déjà branché (paiements clients, pas encore abonnements SaaS)
- Brand partiel via `config/quote-brand.json` + env
- Duplication multi-marques documentée (`PLATEFORME.md`)

**Freins à la revente multi-tenant**
- Pas d’`org_id` / isolation cabinets sur Neon
- Staff voit toute la base (seul l’apporteur est scopé)
- Marque / domaine / ORIAS / pixels souvent hardcodés
- Beaucoup de métier encore en `localStorage` (`lo_*`)
- Stripe = checkout devis, pas abonnement siège / plan
- Une boîte mail / un Drive / un compte Meta par déploiement

---

## Stratégie de revente (3 phases)

### Phase 0 — Durcir le produit (même instance LO)
- Secrets & auth propres (JWT, plus d’emails admin en dur)
- Inventaire `lo_*` → migrer le métier critique côté API/DB
- Checklist modules on/off (feature flags env)
- Pack commercial interne (ce doc + démo)

### Phase 1 — White-label mono-tenant *(revente rapide)*
**1 client = 1 Vercel + 1 Neon + 1 Stripe** (modèle déjà amorcé dans `PLATEFORME.md`).

Livrables techniques :
- `config/tenant-brand.json` (nom, logo, ORIAS, couleurs, emails, domaine)
- Brancher brand pack → SEO, shell CRM, devis, mails
- Paramétrer redirects domaine (`vercel.json` / `APP_URL`)
- Script / doc « provisionner un cabinet » (env + brand + Stripe)

Prix de vente réaliste dès cette phase : **licence annuelle + setup**, sans partager la prod LO.

### Phase 2 — SaaS multi-tenant *(échelle)*
**1 déploiement, N cabinets.**

- Table `organizations` + `org_id` partout (leads, contacts, mailbox, prêts…)
- JWT avec `orgId` ; isolation staff par org ; super-admin plateforme
- Intégrations par org (Stripe Connect ou clés chiffrées, mailbox, Drive)
- Billing SaaS : abonnement Stripe par org + entitlements modules
- Namespacing stockage navigateur `lo_{orgId}_*` ou suppression du métier local

---

## Principes de design « revendable » (à respecter dès maintenant)

1. **Zéro marque en dur dans le métier** — logos / ORIAS / domaines via config.
2. **Modules découplés** — prêts / assurance / patrimoine / banque activables.
3. **Données serveur d’abord** — localStorage = cache UI, pas source de vérité.
4. **RBAC + futur org** — toute nouvelle table prévoit une colonne `org_id` nullable.
5. **Stripe en deux couches** — (A) paiements clients finaux (B) abonnement cabinet.
6. **Démo sans données LO** — seed anonymisé pour pitch investisseurs / acheteurs.

---

## Prochaines briques concrètes (ordre recommandé)

1. Créer `config/tenant-brand.json` + chargeur unique (shell CRM, devis, mails).
2. Feature flags modules : `MODULES=prets,assurance,patrimoine,banque,baremes`.
3. Ajouter `organizations` + `users.org_id` (même si une seule org « LO » au début).
4. Abonnement Stripe `price_saas_*` + page « Mon plan ».
5. Playbook commercial PDF (hors repo) : positionnement courtier 360° / patrimoine.

---

## Liens

- Fork multi-marques actuel : [`PLATEFORME.md`](../PLATEFORME.md)
- Barèmes / fiscalité indicative : [`BAREMES-KPI-REF.md`](./BAREMES-KPI-REF.md)
- Piliers prêts / assurance / patrimoine : [`CRM-PRET-IMMO.md`](./CRM-PRET-IMMO.md)
