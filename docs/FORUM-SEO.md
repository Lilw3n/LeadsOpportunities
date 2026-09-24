# Forum — interactif + SEO

## Deux couches

| Couche | Rôle |
|--------|------|
| **Live** (`/forum/#/…`) | Vrai forum : compte, catégories, sujets, réponses, liens articles |
| **SEO** (`/forum/{cat}/{slug}.html`) | Pages indexables (questions langue naturelle) + schema QAPage |

Les questions seed (`data/forum-themes.json`) alimentent les pages SEO **et** sont importées en base (`forum_*`) au premier appel API.

## Compte

- Inscription / connexion : `/api/auth/register` · `/api/auth/login` (JWT `lo_token`)
- UI : `#/auth/register` · `#/auth/login` sur le hub
- Poster / répondre / lier un article → connexion requise
- Badge **Courtier** si `role=admin` ou `crm_role`

## API

`GET/POST /api/forum?op=…`

| op | Méthode | Auth |
|----|---------|------|
| `board` | GET | non |
| `topics` | GET | non |
| `topic` | GET | non |
| `suggest-articles` | GET | non |
| `create-topic` | POST | oui |
| `reply` | POST | oui |
| `link-article` | POST | oui |

## Articles liés

Sur un sujet live : formulaire « Lier un article » + suggestions depuis le manifeste blog (`suggest-articles`).  
Ça crée l’interaction quand un fil mutuelle croise un article blog, une landing devis, le hub Nancy, etc.

## Build / vérif

```bash
npm run forum:build
npm run verify:forum-seo
npm run verify:forum-live
```

## Redirects 404

`/mutuelle-sante` → `/forum/mutuelle-sante/` (idem VTC / crédit) — voir `vercel.json`.
