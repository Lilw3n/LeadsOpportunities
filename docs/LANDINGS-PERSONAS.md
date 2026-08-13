# Landings personas visiteurs (inscription)

Pages publiques pour consulter et s’inscrire selon le profil :

| Persona | URL |
|---------|-----|
| Hub choix | [`/landings/parcours-immo.html`](../landings/parcours-immo.html) |
| Acquéreur | [`/landings/acheteur-immo.html`](../landings/acheteur-immo.html) |
| Vendeur | [`/landings/vendeur-immo.html`](../landings/vendeur-immo.html) |
| Emprunteur / prêt | [`/landings/credit-immo.html`](../landings/credit-immo.html) |
| Assuré habitation | [`/landings/habitation-immo.html`](../landings/habitation-immo.html) |
| Patrimoine | [`/landings/patrimoine.html`](../landings/patrimoine.html) |
| Banque & épargne | [`/landings/banque-epargne.html`](../landings/banque-epargne.html) |

Chaque page (sauf hub) envoie un lead via `data-track-form` / `POST /api/lead` (wizard 3 étapes + RGPD).

Régénération :

```bash
npm run landings:personas
```

Catalogue : `js/service-catalog.js` (`vendeur-immo`, `patrimoine`, `banque-epargne`, landings habitation…).
