/**
 * Landings financement hors crédit immo (RAC, conso, relais, pro, renégociation).
 * Usage: node scripts/generate-finance-landings.cjs
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const ORIGIN = "https://www.leadsopportunities.fr";

const LANDINGS = [
  {
    file: "rachat.html",
    need: "rachat",
    badge: "Rachat de credits",
    title: "Rachat et regroupement de credits | Baisse de mensualites",
    description:
      "Rachat de credits (RAC) et regroupement : baisse de mensualites, mix immo + conso. Etude gratuite, courtier ORIAS, sans engagement.",
    keywords:
      "rachat de credits, regroupement de credits, RAC, baisse mensualites, rachat credit immobilier, rachat credits conso",
    h1: "Rachat et regroupement de credits",
    sub: "Un seul pret a la place de plusieurs lignes : mensualite plus basse, tresorerie possible, etude de faisabilite avant tout engagement.",
    points: [
      "Regroupement immo + conso (ou conso seul)",
      "Objectif : baisser la mensualite ou degager du reste a vivre",
      "IRA, duree et cout total compares avant de deposer",
      "Dossier FICP / incident : on dit si c est jouable",
    ],
    pills: ["RAC", "Regroupement", "Sans engagement", "Courtier ORIAS"],
    formTitle: "Etude rachat de credits",
    formLead:
      "Encours, mensualites actuelles et objectif (mensualite ou tresorerie). Un courtier calcule si le rachat tient vraiment.",
    hub: "/rachat-credit/",
    hubLabel: "Guide rachat de credits",
  },
  {
    file: "conso.html",
    need: "conso",
    badge: "Credit consommation",
    title: "Credit consommation | Travaux, vehicule, tresorerie",
    description:
      "Credit conso : travaux, vehicule, projet perso ou tresorerie. Montant, duree, endettement. Courtier ORIAS, devis gratuit.",
    keywords:
      "credit consommation, credit conso, pret travaux, credit auto, tresorerie, pret personnel France",
    h1: "Credit consommation : un pret calibre sur votre projet",
    sub: "Travaux, vehicule, tresorerie ou projet personnel : on monte un dossier lisible pour les partenaires, sans survendre la capacite d emprunt.",
    points: [
      "Montant, duree et mensualite cibles",
      "Travaux, auto, perso ou tresorerie",
      "Credits deja en cours pris en compte (HCSF / reste a vivre)",
      "Si un rachat est plus malin, on vous le dit",
    ],
    pills: ["Travaux", "Vehicule", "Tresorerie", "Reponse rapide"],
    formTitle: "Demande credit consommation",
    formLead: "Projet, montant et situation pro : 3 a 4 minutes pour preparer l etude.",
    hub: "/credit-conso/",
    hubLabel: "Guide credit conso",
  },
  {
    file: "pret-relais.html",
    need: "relais",
    badge: "Pret relais",
    title: "Pret relais | Vendre et racheter sans attendre",
    description:
      "Pret relais : financer l achat avant la vente. Duree, quotite, interets. Courtier ORIAS, etude gratuite France.",
    keywords: "pret relais, credit relais, achat vente immobilier, pont financier, quotite pret relais",
    h1: "Pret relais : acheter avant d avoir vendu",
    sub: "Vous vendez un bien et en rachetez un autre : le relais couvre le pont. On chiffre duree, interets et plan B si la vente tarde.",
    points: [
      "Relais sec ou relais-acquisition (rachat + pret principal)",
      "Quotite selon estimation du bien a vendre",
      "Duree typique 12 a 24 mois, interets souvent seuls",
      "Coordination vente + pret d acquisition",
    ],
    pills: ["Vente + achat", "Pont financier", "Quotite", "Courtier ORIAS"],
    formTitle: "Etude pret relais",
    formLead: "Bien a vendre, bien vise, delai et besoin de pont : on simule le relais et le pret d acquisition.",
    hub: "/pret-relais/",
    hubLabel: "Guide pret relais",
  },
  {
    file: "credit-pro.html",
    need: "credit-pro",
    badge: "Credit professionnel",
    title: "Credit professionnel | TNS, entreprise, materiel",
    description:
      "Credit pro : materiel, BFR, developpement. TNS, EI, societe. Courtier ORIAS, etude selon bilans et garanties.",
    keywords: "credit professionnel, pret pro TNS, financement entreprise, credit materiel, BFR",
    h1: "Credit professionnel pour TNS et entreprises",
    sub: "Equipement, tresorerie, developpement : un dossier pro se juge sur l activite, les bilans et les garanties — pas comme un pret immo particulier.",
    points: [
      "Materiel, vehicule pro, BFR, locaux",
      "TNS, EI, SARL, SAS : montage adapte",
      "Garanties : caution, BPI, hypotheque perso",
      "SIREN / SIRET et pieces comptables des le premier echange",
    ],
    pills: ["TNS", "Entreprise", "Materiel", "Tresorerie pro"],
    formTitle: "Demande credit professionnel",
    formLead: "Activite, montant, anciennete et garanties disponibles. Un conseiller oriente vers le bon partenaire.",
    hub: "/credit-pro/",
    hubLabel: "Guide credit pro",
  },
  {
    file: "renegociation.html",
    need: "renegociation",
    badge: "Renegociation",
    title: "Renegociation de pret | Baisse de taux sans racheter",
    description:
      "Renegocier votre pret immobilier aupres de votre banque (taux, duree, assurance). Alternative au rachat externe. Courtier ORIAS.",
    keywords:
      "renegociation pret immobilier, baisser taux credit, renegocier pret banque, rachat vs renegociation",
    h1: "Renegociation de pret : baisser le taux chez votre banque",
    sub: "Si les taux ont baisse depuis votre offre, une renegociation interne peut suffire — moins de frais qu un rachat externe. On compare les deux.",
    points: [
      "Taux actuel vs marche 2026",
      "Capital restant du, duree, mensualite",
      "IRA vs economie : le calcul avant de bouger",
      "Option rachat externe si la banque refuse",
    ],
    pills: ["Taux", "Duree", "Assurance emprunteur", "Comparatif rachat"],
    formTitle: "Etude renegociation",
    formLead: "Capital restant, taux et banque actuelle : on dit si la renegociation vaut le coup, ou s il faut un rachat.",
    hub: "/renegociation-pret/",
    hubLabel: "Guide renegociation",
  },
];

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function render(p) {
  var url = ORIGIN + "/landings/" + p.file;
  var points = p.points.map(function (li) {
    return "              <li>" + esc(li) + "</li>";
  }).join("\n");
  var pills = p.pills
    .map(function (x) {
      return '              <span class="trust-pill">' + esc(x) + "</span>";
    })
    .join("\n");
  return `<!doctype html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(p.title)}</title>
  <meta name="description" content="${esc(p.description)}" />
  <meta name="keywords" content="${esc(p.keywords)}" />
  <meta name="robots" content="index,follow" />
  <meta name="geo.region" content="FR" />
  <meta name="language" content="fr-FR" />
  <link rel="alternate" hreflang="fr-FR" href="${url}" />
  <link rel="alternate" hreflang="x-default" href="${url}" />
  <link rel="canonical" href="${url}" />
  <meta name="google-site-verification" content="I3CAH3KoD216Gpr7VbJ6-p3IM4vGizTzxW0HsqG-HKU" />
  <meta property="og:title" content="${esc(p.title)}" />
  <meta property="og:description" content="${esc(p.description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="fr_FR" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${ORIGIN}/og/og-credit-immo.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-JX8E35693F"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-JX8E35693F');
  </script>
  <script src="/api/google-config-env"></script>
  <script src="../google-config.js"></script>
<script type="text/javascript">
(function(){
  var K="lo_cookie_consent_v1";
  function ok(){try{return localStorage.getItem(K)!=="essential";}catch(e){return true;}}
  window.clarity=window.clarity||function(){(window.clarity.q=window.clarity.q||[]).push(arguments);};
  var g=ok();
  window.clarity("consentv2",{ad_Storage:g?"granted":"denied",analytics_Storage:g?"granted":"denied"});
  if(document.getElementById("clarity-script"))return;
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments);};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;t.id="clarity-script";
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window,document,"clarity","script","x7yqp46fj9");
})();
</script>
  <script src="/js/clarity-init.js" defer></script>
  <link rel="stylesheet" href="./styles.css" />
  <link rel="stylesheet" href="../css/geo-france-banner.css" />
  <link rel="stylesheet" href="../css/form-audit.css" />
  <link rel="stylesheet" href="../css/devis-documents.css" />
  <link rel="stylesheet" href="../css/callback-form.css" />
  <link rel="stylesheet" href="../css/contact-pair.css" />
</head>
<body data-need="${esc(p.need)}" data-market-intent="FR">
  <header class="landing-topbar">
    <div class="landing-topbar-inner">
      <a class="landing-back" href="../finance/">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
        Hub finance
      </a>
      <a class="landing-logo" href="../index.html">
        <span class="landing-logo-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </span>
        Leads Opportunities
      </a>
    </div>
  </header>
  <main class="page">
    <div class="container">
      <span class="badge">${esc(p.badge)}</span>
      <section class="card">
        <div class="hero-surface">
          <div class="hero">
            <h1>${esc(p.h1)}</h1>
            <p class="sub">${esc(p.sub)}</p>
            <ul class="points">
${points}
            </ul>
            <div class="trust-row">
${pills}
            </div>
            <div class="actions">
              <a class="btn btn-primary" href="#demande">${esc(p.formTitle)}</a>
              <a class="btn btn-soft" href="..${p.hub}">${esc(p.hubLabel)}</a>
              <a class="btn btn-soft" href="../credit-immo/">Credit immobilier</a>
            </div>
          </div>
        </div>

        <div class="form-wrap" id="demande">
          <div data-callback-strip data-callback-need="${esc(p.need)}" data-callback-source="landing_${esc(p.need)}"></div>
          <h2 class="form-title">${esc(p.formTitle)}</h2>
          <p class="form-lead">${esc(p.formLead)}</p>

          <form data-track-form data-quote-wizard novalidate id="devisForm">
            <input type="hidden" name="need" id="needField" value="${esc(p.need)}" />
            <input type="hidden" name="serviceLabel" id="serviceLabelField" value="" />
            <input type="hidden" name="serviceCategory" id="serviceCategoryField" value="" />
            <div class="hp-field" aria-hidden="true">
              <label for="hp_${esc(p.need)}">Ne pas remplir</label>
              <input type="text" id="hp_${esc(p.need)}" name="_hp" tabindex="-1" autocomplete="off" />
            </div>
            <div class="wizard-head">
              <div class="wizard-progress-track">
                <div class="wizard-progress-fill"></div>
              </div>
              <div class="wizard-meta">
                <span id="wizardCategoryLabel">Financement</span>
                <span class="wizard-step-counter">Etape 1 / 5</span>
              </div>
            </div>
            <div data-cross-sell-panel hidden></div>
            <div id="wizardStepsMount"></div>
            <div class="wizard-actions">
              <button type="button" class="btn btn-soft wizard-prev" hidden>Retour</button>
              <button type="button" class="btn btn-primary wizard-next">Continuer</button>
              <button type="submit" class="btn btn-primary wizard-submit" hidden data-track="cta_click">Envoyer ma demande</button>
            </div>
            <div class="form-trust-row">
              <div class="form-trust-item">100% gratuit</div>
              <div class="form-trust-item">RGPD</div>
              <div class="form-trust-item">Conseiller dedie</div>
            </div>
          </form>
          <p class="success" data-form-success hidden>Merci, votre demande a bien ete envoyee. Un conseiller prepare votre etude.</p>
          <p class="form-error" data-form-error hidden>Envoi impossible. Reessayez dans quelques instants.</p>
          <div data-lead-insights hidden></div>
        </div>
      </section>
    </div>
  </main>
  <footer class="landing-footer">
    <a href="../finance/">Finance</a>
    <a href="..${p.hub}">${esc(p.hubLabel)}</a>
    <a href="./rachat.html">Rachat</a>
    <a href="./conso.html">Credit conso</a>
    <a href="./pret-relais.html">Pret relais</a>
    <a href="./credit-pro.html">Credit pro</a>
    <a href="./renegociation.html">Renegociation</a>
    <a href="./credit-immo.html">Credit immo</a>
    <a href="../mentions-legales.html">Mentions legales</a>
    <span class="landing-footer-legal">ORIAS n&deg; 15005935</span>
  </footer>
  <script src="../js/landing-seo-config.js"></script>
  <script src="../js/landing-seo-inject.js"></script>
  <script src="../js/service-catalog.js"></script>
  <script src="../js/contact-pair.js"></script>
  <script src="../js/questionnaire-config.js"></script>
  <script src="../js/devis-document-config.js"></script>
  <script src="../js/devis-document-upload.js"></script>
  <script src="./devis-steps.js"></script>
  <script src="./devis-init.js"></script>
  <script src="../js/attribution.js"></script>
  <script src="../js/leads-storage.js"></script>
  <script src="../js/quote-intelligence.js"></script>
  <script src="../js/cookie-banner.js"></script>
  <script src="../js/lead-insights.js"></script>
  <script src="../js/france-seo-meta.js"></script>
  <script src="../js/geo-france-guard.js"></script>
  <script src="./tracking.js"></script>
  <script src="./quote-wizard.js"></script>
  <script src="../js/form-audit.js"></script>
  <script src="../js/callback-form.js"></script>
</body>
</html>
`;
}

LANDINGS.forEach(function (p) {
  var out = path.join(ROOT, "landings", p.file);
  fs.writeFileSync(out, render(p), "utf8");
  console.log("wrote", path.relative(ROOT, out));
});
