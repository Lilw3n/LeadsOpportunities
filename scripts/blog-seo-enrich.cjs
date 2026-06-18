/**
 * Enrichissement SEO automatique des articles blog (contenu long + FAQ + lexique).
 */

function p(text) {
  return { type: "p", text: text };
}
function h2(text) {
  return { type: "h2", text: text };
}
function h3(text) {
  return { type: "h3", text: text };
}
function ul(items) {
  return { type: "ul", items: items };
}

function kwList(keywords) {
  return keywords.slice(0, 12).join(", ");
}

/** Terme assurance pour le corps de texte — jamais un badge type "Actu people". */
function insuranceTopicLabel(article, keywords) {
  var title = String(article.title || "").toLowerCase();
  var need = article.need || "";
  if (title.indexOf("divorce") !== -1 || title.indexOf("separation") !== -1) {
    return "assurance habitation et emprunteur";
  }
  if (title.indexOf("coupe du monde") !== -1 || title.indexOf("mondial") !== -1) {
    return "assurance voyage et mutuelle";
  }
  if (need === "sante" || title.indexOf("mutuelle") !== -1) return "mutuelle sante";
  if (need === "habitation") return "assurance habitation";
  if (need === "auto") return "assurance auto";
  if (need === "emprunteur") return "assurance emprunteur";
  if (need === "prevoyance") return "assurance prevoyance";
  if (need === "vtc") return "assurance VTC";
  if (need === "animaux") return "assurance animaux";
  for (var i = 0; i < keywords.length; i++) {
    var w = keywords[i];
    if (!w || /^actu\s/i.test(w) || w.toLowerCase() === "actu people") continue;
    if (w.indexOf("assurance") !== -1 || w.indexOf("mutuelle") !== -1 || w.indexOf("devis") !== -1) {
      return w;
    }
  }
  return "contrat d'assurance";
}

function pickPrimaryKeyword(keywords) {
  for (var i = 0; i < keywords.length; i++) {
    var w = keywords[i];
    if (!w || /^actu\s/i.test(w) || w.toLowerCase() === "actu people") continue;
    return w;
  }
  return "assurance";
}

function buildAutoFaq(article, keywords) {
  var k = pickPrimaryKeyword(keywords);
  var label = article.title.split(":")[0] || article.title;
  return [
    {
      q: "Comment comparer une offre " + k + " en 2026 ?",
      a: "Listez vos besoins reels (budget, garanties, situation familiale ou pro), puis demandez un comparatif a garanties equivalentes. Un courtier ORIAS explique les exclusions avant de signer.",
    },
    {
      q: "Le devis est-il gratuit et sans engagement ?",
      a: "Oui chez Leads Opportunities : devis gratuit, accompagnement humain, aucune obligation de souscription immediate.",
    },
    {
      q: "Puis-je changer d'assureur en cours d'annee ?",
      a: "Selon le contrat : loi Hamon, loi Chatel, loi Lemoine (emprunteur) ou echeance annuelle. Verifiez delais de preavis et equivalence de garanties.",
    },
    {
      q: "Quels documents preparer pour un devis ?",
      a: "Contrat actuel, dernier avis d'echeance, sinistres des 3 a 5 ans, situation (locataire, emprunteur, salarie, independant).",
    },
    {
      q: "Courtier ou comparateur en ligne : quelle difference ?",
      a: "Le comparateur affiche un prix ; le courtier verifie les plafonds, franchises, delais de carence et la compatibilite avec votre profil.",
    },
    {
      q: "Cet article " + label + " remplace-t-il un conseil personnalise ?",
      a: "Non : il informe sur les garanties et mots-cles utiles. Une etude personnalisee reste necessaire avant de resilier ou souscrire.",
    },
  ];
}

function buildAutoBlocks(article, keywords) {
  var k = keywords;
  var topic = insuranceTopicLabel(article, k);
  var primary = pickPrimaryKeyword(k);
  return [
    h2("Pourquoi ce sujet compte pour vos garanties"),
    p(
      "Que vous soyez en recherche d'un <strong>devis " +
        topic +
        "</strong>, en renouvellement ou suite a l'actualite, l'objectif reste le meme : <strong>comprendre vos garanties</strong>, comparer a postes equivalents et eviter les exclusions cachees. Mots-cles utiles : " +
        kwList(k) +
        "."
    ),
    h2("Les garanties a verifier avant de signer"),
    ul([
      "<strong>Plafonds et franchises</strong> : ce qui reste a votre charge apres sinistre",
      "<strong>Exclusions</strong> : situations non couvertes (usure, negligence, zones a risque…)",
      "<strong>Delais</strong> : carence, declaration de sinistre, traitement du dossier",
      "<strong>Options</strong> : assistance, protection juridique, extension famille ou materiel",
      "<strong>Prix annuel</strong> : hors promotions — refaire un comparatif chaque annee",
    ]),
    h3("Comparer sans se fier au seul prix affiche"),
    p(
      "Un tarif bas peut masquer un plafond bas ou une franchise elevee. Demandez un <strong>tableau comparatif</strong> avec les memes postes : " +
        (k[1] ? k[1] : "garanties essentielles") +
        ", " +
        (k[2] ? k[2] : "responsabilite civile") +
        ", " +
        (k[3] ? k[3] : "assistance") +
        ". C'est la methode utilisee par les courtiers pour aligner Allianz, AXA, April, Generali, Zéphir, Solly Azar et le reste du marche."
    ),
    h2("Erreurs frequentes a eviter"),
    ul([
      "Souscrire en ligne sans lire les exclusions ni les plafonds",
      "Oublier de mettre a jour le contrat apres un demenagement, divorce ou changement d'activite",
      "Resilier avant d'avoir une attestation de remplacement (risque de rupture de garantie)",
      "Ne pas declarer un sinistre dans les delais contractuels",
      "Ignorer la clause de beneficiaire (prevoyance, assurance-vie, deces)",
    ]),
    h2("Lexique et mots-cles utiles"),
    ul(
      k
        .filter(function (word) {
          return word && !/^actu\s/i.test(word) && word.toLowerCase() !== "actu people";
        })
        .map(function (word, i) {
          return (
            "<strong>" +
            word +
            "</strong>" +
            (i === 0
              ? " : a retrouver dans votre contrat ou devis"
              : " : a comparer entre assureurs a garanties equivalentes")
          );
        })
    ),
    h2("Comment obtenir un accompagnement Leads Opportunities"),
    p(
      "Notre equipe de courtiers ORIAS vous aide a <strong>comparer</strong>, <strong>resilier</strong> ou <strong>souscrire</strong> avec un langage clair. Formulaire en ligne, demande de rappel ou parcours devis selon votre besoin (" +
        topic +
        "), sans engagement."
    ),
    p(
      'Consultez aussi notre <a href="../assurances/">catalogue complet des assurances</a> (sante, auto, habitation, emprunteur, prevoyance, VTC, animaux) et nos pages SEO par ville pour un devis localise.'
    ),
  ];
}

function estimateMeta(blocks, faq) {
  var text = JSON.stringify(blocks) + JSON.stringify(faq);
  var words = text.split(/\s+/).length;
  var min = Math.max(8, Math.min(18, Math.round(words / 180)));
  return min + " min · Mai 2026";
}

function defaultKeywords(article) {
  var base = ["devis assurance", "comparatif assurance", "courtier ORIAS", "Leads Opportunities"];
  var tag = (article.tag || "").toLowerCase();
  if (tag.indexOf("vtc") >= 0 || article.section === "vtc") {
    return ["assurance vtc", "rc pro chauffeur", "uber bolt heetch", "devis vtc"].concat(base);
  }
  if (article.section === "animaux") {
    return ["assurance animaux", "assurance chien", "assurance chat", "remboursement veterinaire"].concat(base);
  }
  if (article.section === "sante") {
    return ["mutuelle sante", "complementaire sante", "remboursement optique dentaire"].concat(base);
  }
  if (article.section === "habitat") {
    return ["assurance habitation", "assurance emprunteur", "loi lemoine", "multirisque habitation"].concat(base);
  }
  if (article.section === "auto") {
    return ["assurance auto", "bonus malus", "jeune conducteur", "tous risques"].concat(base);
  }
  if (article.section === "actu") {
    var title = (article.title || "").toLowerCase();
    if (title.indexOf("divorce") !== -1 || title.indexOf("people") !== -1 || title.indexOf("separation") !== -1) {
      return ["assurance habitation", "assurance emprunteur", "prevoyance", "beneficiaire"].concat(base);
    }
    if (title.indexOf("coupe du monde") !== -1 || title.indexOf("mondial") !== -1 || title.indexOf("foot") !== -1) {
      return ["assurance voyage", "mutuelle etranger", "assurance sante", "deplacement"].concat(base);
    }
    if (title.indexOf("gaming") !== -1 || title.indexOf("gta") !== -1) {
      return ["assurance habitation", "materiel informatique", "assurance emprunteur"].concat(base);
    }
    return ["conseil assurance", "actualite assurance", "assurance 2026"].concat(base);
  }
  return base;
}

function enrichArticle(article, override) {
  var keywords = (override && override.keywords) || article.keywords || defaultKeywords(article);
  var baseBlocks = (override && override.blocks) || article.blocks || [];
  var extra = (override && override.extraBlocks) || [];
  var autoBlocks = buildAutoBlocks(article, keywords);
  var baseFaq = buildAutoFaq(article, keywords);
  var extraFaq = (override && override.faq) || [];
  var faq = baseFaq.concat(extraFaq);
  var blocks = baseBlocks.concat(extra).concat(autoBlocks);
  return Object.assign({}, article, {
    keywords: keywords,
    blocks: blocks,
    faq: faq,
    meta: (override && override.meta) || estimateMeta(blocks, faq),
    description:
      (override && override.description) ||
      article.description +
        " Mots-cles : " +
        keywords.slice(0, 6).join(", ") +
        ".",
  });
}

module.exports = {
  enrichArticle: enrichArticle,
  buildAutoBlocks: buildAutoBlocks,
  buildAutoFaq: buildAutoFaq,
};
