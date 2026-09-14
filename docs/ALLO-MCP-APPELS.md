# Allo (WithAllo) — appels via MCP

Pour piloter **les appels** (historique, SMS, tags, file d’attente, réceptionniste IA) depuis Cursor / un agent MCP.

Doc officielle : [help.withallo.com/en/integrations/mcp](https://help.withallo.com/en/integrations/mcp) · [withallo.com/mcp](https://www.withallo.com/mcp)

## Config Cursor (recommandé)

1. Allo → **Settings → API** → créer une clé (scopes lecture/écriture appels selon besoin).
2. Copier `.cursor/mcp.json.example` → `.cursor/mcp.json` (fichier **gitignoré**).
3. Remplacer `YOUR_ALLO_API_KEY` par la clé.
4. **Cursor Settings → MCP** → vérifier que le serveur **Allo** est vert, ou redémarrer Cursor.

Exemple :

```json
{
  "mcpServers": {
    "Allo": {
      "url": "https://mcp.withallo.com/mcp",
      "headers": {
        "Authorization": "YOUR_ALLO_API_KEY"
      }
    }
  }
}
```

Important :

- Header `Authorization` = la clé **brute** (pas de préfixe `Bearer`).
- **Ne jamais committer** `.cursor/mcp.json` ni coller la clé dans le dépôt / une PR.
- Si la clé a été exposée (chat, capture, logs) : la **révoquer** dans Allo et en créer une nouvelle.

## Lien avec le CRM Leads Opportunities

| Canal | Rôle |
|-------|------|
| **MCP Allo** (Cursor) | Agent : chercher un appel, résumé, SMS, tags, dialer |
| **Webhook CRM** | `POST /api/webhooks/withallo` → leads + `crm_events` (appels, RDV, rappels) |
| **Secret Vercel** | `WITHALLO_WEBHOOK_SECRET` (Bearer côté webhook entrant) |

Le MCP ne remplace pas le webhook : MCP = pilotage agent ; webhook = ingestion automatique dans le pipeline.

Voir aussi `docs/SLACK-WITHALLO-NOTIFS.md`.

## Vérif rapide MCP

```bash
curl -sS -X POST "https://mcp.withallo.com/mcp" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Authorization: $ALLO_API_KEY" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"check","version":"1.0"}}}'
```

Réponse attendue : `serverInfo.name = "allo"` (SSE `event: message`).

## REST (optionnel, hors MCP)

```bash
curl -sS "https://api.withallo.com/v2/api/me" \
  -H "Authorization: Api-Key $ALLO_API_KEY"
```

(Le schéma REST utilise souvent `Api-Key …` ; le MCP utilise la clé seule dans `Authorization`.)
