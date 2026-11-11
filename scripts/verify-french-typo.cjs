/** Vérifie la relecture typographique des pages générées (accents, apostrophes, « à »). */
const { frenchifyText: f, frenchifyHtml } = require("./french-typo-lib.cjs");
const cases = [
  ["Assurance VTC a Lyon", "Assurance VTC à Lyon"],
  ["Chauffeur VTC base a Marseille ?", "Chauffeur VTC basé à Marseille ?"],
  ["jusqu a la souscription, sans engagement", "jusqu’à la souscription, sans engagement"],
  ["Besoin d aide ?", "Besoin d’aide ?"],
  ["Provence-Alpes-Cote d Azur", "Provence-Alpes-Côte d’Azur"],
  ["Sante Animaux Credit immo", "Santé Animaux Crédit immo"],
  ["le transport de personnes a titre onereux", "le transport de personnes à titre onéreux"],
  ["Il a un contrat et il a la carte", "Il a un contrat et il a la carte"],
  ["Le chauffeur a plus de 3 ans de permis", "Le chauffeur a plus de 3 ans de permis"],
  ["Ile-de-France et Auvergne-Rhone-Alpes", "Île-de-France et Auvergne-Rhône-Alpes"],
  ["Pret immobilier a Essey-les-Nancy", "Prêt immobilier à Essey-lès-Nancy"],
  ["Brie-Comte-Robert", "Brie-Comte-Robert"],
  ["Un prêt déjà accentué à Nancy", "Un prêt déjà accentué à Nancy"],
  ["comparer a garanties equivalentes", "comparer à garanties équivalentes"],
  ["5 l et 3 m en plus", "5 l et 3 m en plus"],
  ["c est simple, il n a pas de frais", "c’est simple, il n’a pas de frais"],
  ["Vehicule de remplacement si activite a temps plein", "Véhicule de remplacement si activité à temps plein"],
  ["Le dossier a été accepté", "Le dossier a été accepté"],
];
let bad = 0;
for (const [i, want] of cases) {
  const got = f(i);
  if (got !== want) {
    bad++;
    console.log("FAIL", JSON.stringify(i), "→", JSON.stringify(got), "| attendu", JSON.stringify(want));
  }
}
const html =
  '<a href="/pret-immobilier/departement/rhone/" class="credit">Pret a Lyon</a><script>var credit="pret";</script>' +
  '<meta name="description" content="Credit a Lyon" /><script type="application/ld+json">{"@type":"FAQPage","name":"Sante","url":"/sante/"}</script>';
console.log(frenchifyHtml(html));
console.log(bad ? bad + " échec(s)" : "Typographie française : OK.");
if (bad) process.exit(1);
