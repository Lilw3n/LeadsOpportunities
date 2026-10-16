# Appels Free — transcript et résumé

Page CRM : `/crm-appels.html` · API : `POST /api/crm/call-summary` (session CRM).

## Ce que Free fournit

La Freebox, sur le réseau local uniquement, expose un journal d’appels :

`http://mafreebox.freebox.fr/api/v8/call/log/`

Chaque ligne contient un numéro, un sens (entrant, sortant, manqué), une durée et une date. **Il n’y a pas d’audio.** Une fonction Vercel ne peut pas joindre `mafreebox.freebox.fr`. Le CRM en HTTPS ne peut pas non plus l’appeler : le navigateur bloque le HTTP local. On colle le JSON, ou on le lit depuis une page ouverte en HTTP sur le même réseau.

## D’où vient le texte

- **WithAllo** : le webhook `POST /api/webhooks/withallo` reçoit `transcript_ready` ou `summary_ready`. Le résumé métier est calculé et rangé sur l’événement du lead. WithAllo est le canal qui informe déjà le correspondant.
- **Collage CRM** : notes ou transcript collés dans `/crm-appels.html`. La case « le correspondant a été informé » est obligatoire. Sans elle, l’API répond 400 et n’enregistre rien.

Le moteur local repère le métier (garage, MRP, décennale, flotte, bateau, etc.) et la suite à donner. S’il existe une clé `GEMINI_API_KEY` ou `OPENAI_API_KEY`, le même texte est reformulé. Sans clé, le résumé local est celui qui est conservé. Aucun prix ni aucune garantie n’est inventé.

## Rattachement

Le numéro du journal est comparé aux 9 derniers chiffres de `site_leads.phone`. S’il y a une fiche, un événement `summary_ready` (source `free`) est écrit. Sinon le résumé s’affiche et n’est pas archivé.
