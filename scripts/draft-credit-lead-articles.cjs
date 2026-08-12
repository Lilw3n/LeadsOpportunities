#!/usr/bin/env node
/**
 * Articles evergreen crédit (SCI / SCPI / viager) → questionnaires.
 * Usage: node scripts/draft-credit-lead-articles.cjs [--dry-run]
 */
const { existingFiles, appendPendingArticle, monthLabel } = require("./blog-actu-lib.cjs");

function cta(need, content, label) {
  return {
    href:
      "../landings/questionnaire.html?need=" +
      encodeURIComponent(need) +
      "&journey=standard&utm_source=blog&utm_medium=lead_evergreen&utm_campaign=" +
      encodeURIComponent(need) +
      "&utm_content=" +
      encodeURIComponent(content),
    label: label,
  };
}

function articles() {
  var meta = "8 min · " + monthLabel();
  return [
    {
      file: "financer-bien-en-sci-credit-emprunteur-2026.html",
      section: "finance",
      tag: "Crédit immobilier",
      tagClass: "tag-actu",
      title: "Financer un bien en SCI : crédit, apport et assurance emprunteur",
      description:
        "Acheter en SCI à crédit en 2026 : banque, taux d'endettement, garantie et assurance emprunteur. Questionnaire gratuit, simulation SCI.",
      meta: meta,
      cardExcerpt: "SCI à crédit : le montage compte autant que le taux. Apport, garantie, emprunteur.",
      cta: cta("credit-immo", "sci-2026", "Questionnaire crédit SCI (3 min)"),
      blocks: [
        {
          type: "p",
          text: "Acheter via une <strong>SCI</strong> (familiale ou à l'IS) change le dossier bancaire : la banque regarde la société, les associés et le bien, pas seulement votre fiche de paie. Un crédit mal calé se paie 15 à 25 ans — mensualité, <strong>assurance emprunteur</strong> et frais de garantie.",
        },
        { type: "h2", text: "Ce que la banque exige vraiment" },
        {
          type: "p",
          text: "Au-delà du taux affiché, le prêteur veut un <strong>reste à financer cohérent</strong> : prix FAI, travaux, frais de notaire, hypothèque ou caution. Les associés personnes physiques sont souvent caution solidaire. Sans organigramme clair (parts, gérance, régime fiscal), le dossier reste en attente.",
        },
        {
          type: "ul",
          items: [
            "Objet : résidence des associés, locatif nu, meublé — l'usage change l'assurance et la fiscalité",
            "Apport : 10 à 20 % du projet est fréquent, plus si travaux lourds",
            "Endettement : revenus fonciers futurs sont rarement pris à 100 %",
            "Garantie : hypothèque sur le bien SCI, caution, parfois nantissement de parts",
            "Assurance emprunteur : quotité par associé, ITT selon activité",
          ],
        },
        { type: "bridge" },
        { type: "h2", text: "Assurance emprunteur : le poste souvent oublié" },
        {
          type: "p",
          text: "En SCI, chaque associé emprunteur peut (et devrait) être couvert. La <strong>loi Lemoine</strong> permet de comparer hors banque à garanties équivalentes. Un écart de 30 % sur la prime, multiplié par 20 ans, finance souvent une année de charges de copropriété.",
        },
        {
          type: "p",
          text: "Notre <strong>questionnaire crédit immo</strong> (3 minutes) qualifie le projet SCI : prix, apport, nombre d'associés, locatif ou occupancy. Vous pouvez ensuite lancer une <a href=\"../landings/credit-immo.html\">simulation publique</a> ou transmettre un dossier. Courtier ORIAS, sans engagement.",
        },
      ],
      related: [
        { href: "../landings/credit-immo.html", label: "Simulation crédit immo" },
        { href: "./assurance-emprunteur-loi-lemoine-2026.html", label: "Loi Lemoine" },
        { href: "../credit-immo/simulation/", label: "Capacité d'emprunt" },
      ],
    },
    {
      file: "scpi-a-credit-mensualite-assurance-2026.html",
      section: "finance",
      tag: "Crédit immobilier",
      tagClass: "tag-actu",
      title: "SCPI à crédit : mensualité, nantissement et assurance emprunteur",
      description:
        "Acheter des parts de SCPI à crédit en 2026 : effort d'épargne, nantissement, fiscalité et assurance. Questionnaire gratuit.",
      meta: meta,
      cardExcerpt: "SCPI à crédit : le loyer ne couvre pas toujours la mensualité. Calculez l'effort réel.",
      cta: cta("credit-immo", "scpi-2026", "Questionnaire crédit SCPI (3 min)"),
      blocks: [
        {
          type: "p",
          text: "Financer des <strong>parts de SCPI à crédit</strong> séduit : effet de levier, loyers potentiels, parfois déductibilité des intérêts. En pratique, la banque nantit les parts, calcule un <strong>effort d'épargne</strong> et exige une assurance emprunteur. Un rendement affiché de 4,5 % ne paie pas une mensualité à 4 % + assurance + frais de souscription.",
        },
        { type: "h2", text: "Le vrai coût d'une SCPI à crédit" },
        {
          type: "p",
          text: "Les frais de souscription (souvent 8 à 12 %) et le délai de jouissance réduisent le cash-flow des premières années. La banque retient rarement 100 % des loyers prévisionnels. Résultat : un <strong>reste à charge mensuel</strong> à provisionner, surtout si les parts sont à crédit sur 15 ou 20 ans.",
        },
        {
          type: "ul",
          items: [
            "Montant : nombre de parts × valeur + frais de souscription",
            "Durée : plus courte = effort plus fort, moins d'intérêts",
            "Nantissement des parts au profit de la banque",
            "Assurance emprunteur : décès / invalidité, parfois ITT",
            "Fiscalité : revenus fonciers (SCPI immo) vs autres véhicules",
          ],
        },
        { type: "bridge" },
        { type: "h2", text: "Avant de signer : 3 questions" },
        {
          type: "p",
          text: "<strong>1)</strong> Quel effort d'épargne si les loyers baissent de 20 % ? <strong>2)</strong> L'assurance est-elle déléguable (Lemoine) ? <strong>3)</strong> Pouvez-vous revendre ou racheter le crédit si votre situation change ? Un courtier ORIAS compare banques et contrats plutôt que de figer le premier barème vu en agence.",
        },
        {
          type: "p",
          text: "Le <strong>questionnaire crédit immo</strong> cible un projet SCPI (montant, durée, cash ou crédit). Ensuite : <a href=\"../landings/credit-immo.html\">étude de financement</a>. Gratuit, sans engagement.",
        },
      ],
      related: [
        { href: "../landings/credit-immo.html", label: "Étude financement" },
        { href: "./assurance-emprunteur-loi-lemoine-2026.html", label: "Loi Lemoine" },
        { href: "../credit-immo/", label: "Crédit immobilier" },
      ],
    },
    {
      file: "viager-occupe-financement-assurance-2026.html",
      section: "finance",
      tag: "Crédit immobilier",
      tagClass: "tag-actu",
      title: "Viager occupé : bouquet, rente et financement — ce qu'il faut assurer",
      description:
        "Acheter ou vendre en viager occupé en 2026 : bouquet, rente, prêt et assurances (emprunteur, habitation, PNO). Questionnaire gratuit.",
      meta: meta,
      cardExcerpt: "Viager occupé : le bouquet se finance, la rente se provisionne, l'assurance se calibre.",
      cta: cta("credit-immo", "viager-2026", "Questionnaire crédit viager (3 min)"),
      blocks: [
        {
          type: "p",
          text: "Le <strong>viager occupé</strong> n'est pas un achat classique : vous payez un <strong>bouquet</strong> (capital) et une <strong>rente</strong> jusqu'au décès du crédirentier, pendant que le vendeur reste dans le logement. Financer le bouquet à crédit est possible, mais les banques regardent le ratio hypothécaire, l'âge du vendeur et votre capacité à payer la rente <em>en plus</em> de la mensualité.",
        },
        { type: "h2", text: "Bouquet, rente, prêt : trois flux à caler" },
        {
          type: "p",
          text: "La valeur occupée est inférieure à la valeur libre (décote DUH). Le prêt ne finance en général que le bouquet, pas la rente. Si vous empruntez 70 % du bouquet sur 15 ans, il faut encore provisionner la rente et les charges (taxe foncière selon acte, gros travaux). Un simulateur viager aide à voir le <strong>taux d'effort réel</strong>, pas seulement le taux du crédit.",
        },
        {
          type: "ul",
          items: [
            "Bouquet vs rente : trop de rente = risque de longévité mal provisionné",
            "Prêt : durée courte, hypothèque sur un bien occupé — barème spécifique",
            "Assurance emprunteur sur le capital restant dû",
            "Habitation : qui assure le logement occupé ? PNO vs occupant",
            "Clause de réversibilité et protection du conjoint vendeur",
          ],
        },
        { type: "bridge" },
        { type: "h2", text: "Assurances à ne pas négliger" },
        {
          type: "p",
          text: "Côté acheteur : <strong>emprunteur</strong> (décès / invalidité) et souvent PNO si vous n'occupez pas. Côté vendeur occupant : habitation et parfois dépendance. Un trou de garantie au premier sinistre (dégât des eaux, tempête) bloque tout le monde — crédirentier, débirentier et banque.",
        },
        {
          type: "p",
          text: "Le <strong>questionnaire crédit immo</strong> (3 min) précise si vous achetez ou vendez en viager, le montant du bouquet et un besoin de prêt. Poursuivez avec une <a href=\"../landings/credit-immo.html\">étude de financement</a>. Courtier ORIAS, gratuit.",
        },
      ],
      related: [
        { href: "../landings/credit-immo.html", label: "Étude financement viager" },
        { href: "./pno-bailleur-proprietaire-non-occupant.html", label: "PNO bailleur" },
        { href: "../credit-immo/simulation/", label: "Simulation crédit" },
      ],
    },
  ];
}

function main() {
  var dry = process.argv.indexOf("--dry-run") !== -1;
  var files = existingFiles();
  var list = articles();
  var added = [];
  list.forEach(function (a) {
    if (files.has(a.file)) {
      console.log("skip (existe déjà)", a.file);
      return;
    }
    if (dry) {
      console.log("[dry-run]", a.file, "—", a.title);
      added.push(a.file);
      return;
    }
    appendPendingArticle(a);
    console.log("pending +", a.file);
    added.push(a.file);
  });
  console.log("Evergreen crédit:", added.length, "article(s)");
}

main();
