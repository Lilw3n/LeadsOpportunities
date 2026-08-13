#!/usr/bin/env node
/**
 * Génère les landings personas visiteurs (inscription / devis).
 * Usage: node scripts/build-persona-landings.cjs
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "landings");

const HEAD_COMMON = `  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="robots" content="index,follow" />
  <meta name="geo.region" content="FR" />
  <meta name="language" content="fr-FR" />
  <meta name="google-site-verification" content="I3CAH3KoD216Gpr7VbJ6-p3IM4vGizTzxW0HsqG-HKU" />
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
  <link rel="stylesheet" href="./persona-landings.css" />
`;

const SCRIPTS = `  <script src="../js/service-catalog.js"></script>
  <script src="../js/attribution.js"></script>
  <script src="../js/leads-storage.js"></script>
  <script src="./tracking.js"></script>
  <script src="../js/cookie-banner.js"></script>
  <script src="../js/geo-france-guard.js"></script>
  <script src="./quote-wizard.js"></script>
  <script src="../js/landing-seo-config.js"></script>
  <script src="../js/landing-seo-inject.js"></script>
  <script src="../js/france-seo-meta.js"></script>
`;

function topbar() {
  return `  <header class="landing-topbar">
    <div class="landing-topbar-inner">
      <a class="landing-back" href="./parcours-immo.html">Tous les parcours</a>
      <a class="landing-logo" href="../index.html">Leads Opportunities</a>
    </div>
  </header>`;
}

function footer() {
  return `  <footer class="landing-footer">
    <a href="./parcours-immo.html">Parcours immo &amp; finance</a>
    <a href="../mentions-legales.html">Mentions legales</a>
    <a href="../politique-confidentialite.html">Confidentialite</a>
    <span>&copy; 2026 Leads Opportunities</span>
    <span class="landing-footer-legal">ORIAS n&deg; 15005935</span>
  </footer>`;
}

function contactStep(submitLabel) {
  return `            <section class="wizard-step" data-wizard-step="3" hidden>
              <h3>Vos coordonnees</h3>
              <div class="grid">
                <div class="field">
                  <label for="firstName">Prenom</label>
                  <input id="firstName" name="firstName" autocomplete="given-name" required />
                </div>
                <div class="field">
                  <label for="lastName">Nom</label>
                  <input id="lastName" name="lastName" autocomplete="family-name" required />
                </div>
                <div class="field">
                  <label for="email">E-mail</label>
                  <input id="email" name="email" type="email" autocomplete="email" required />
                </div>
                <div class="field">
                  <label for="phone">Telephone</label>
                  <input id="phone" name="phone" type="tel" autocomplete="tel" required placeholder="06 / 07…" />
                </div>
                <div class="field">
                  <label for="postal">Code postal</label>
                  <input id="postal" name="postal" inputmode="numeric" maxlength="5" required placeholder="Ex. 67000" />
                </div>
                <div class="field">
                  <label for="city">Ville</label>
                  <input id="city" name="city" autocomplete="address-level2" required />
                </div>
                <label class="field-check full">
                  <input type="checkbox" name="rgpd" value="1" required aria-required="true" />
                  <span>J'accepte d'etre contacte(e) et j'ai lu la <a href="../politique-confidentialite.html">politique de confidentialite</a>.</span>
                </label>
              </div>
            </section>

            <div class="wizard-actions">
              <button type="button" class="btn btn-soft wizard-prev" hidden>Retour</button>
              <button type="button" class="btn btn-primary wizard-next">Continuer</button>
              <button type="submit" class="btn btn-primary wizard-submit" hidden data-track="cta_click">${submitLabel}</button>
            </div>
            <div class="form-trust-row">
              <div class="form-trust-item">100% gratuit</div>
              <div class="form-trust-item">Donnees protegees</div>
              <div class="form-trust-item">Sans engagement</div>
            </div>`;
}

function pageShell(p) {
  const canon = `https://www.leadsopportunities.fr/landings/${p.file}`;
  return `<!doctype html>
<html lang="fr">
<head>
${HEAD_COMMON}
  <title>${p.title}</title>
  <meta name="description" content="${p.description}" />
  <link rel="canonical" href="${canon}" />
  <link rel="alternate" hreflang="fr-FR" href="${canon}" />
  <link rel="alternate" hreflang="x-default" href="${canon}" />
  <meta property="og:title" content="${p.title}" />
  <meta property="og:description" content="${p.description}" />
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="fr_FR" />
  <meta property="og:url" content="${canon}" />
</head>
<body data-market-intent="FR">
${topbar()}
  <main class="page">
    <div class="container">
      <span class="badge persona-badge persona-${p.persona}">${p.badge}</span>
      <section class="card">
        <div class="hero-surface">
          <div class="hero">
            <h1>${p.h1}</h1>
            <p class="sub">${p.sub}</p>
            <ul class="points">
              ${p.points.map((x) => `<li>${x}</li>`).join("\n              ")}
            </ul>
            <div class="trust-row">
              ${p.trust.map((x) => `<span class="trust-pill">${x}</span>`).join("\n              ")}
            </div>
            <div class="actions">
              <a class="btn btn-primary" href="#demande">${p.cta}</a>
              <a class="btn btn-soft" href="./parcours-immo.html">Autre parcours</a>
            </div>
          </div>
        </div>

        <div class="form-wrap" id="demande">
          <h2 class="form-title">${p.formTitle}</h2>
          <p class="form-lead">${p.formLead}</p>
          <form data-track-form data-quote-wizard novalidate>
            <input type="hidden" name="need" value="${p.need}" />
            <input type="hidden" name="serviceNeed" value="${p.need}" />
            <input type="hidden" name="vertical" value="${p.vertical}" />
            <div data-cross-sell-panel hidden></div>
            <div class="hp-field" aria-hidden="true">
              <label for="hp_${p.need}">Ne pas remplir</label>
              <input type="text" id="hp_${p.need}" name="_hp" tabindex="-1" autocomplete="off" />
            </div>
            <div class="wizard-head">
              <div class="wizard-progress-track"><div class="wizard-progress-fill"></div></div>
              <div class="wizard-meta">
                <span>Parcours guide</span>
                <span class="wizard-step-counter">Etape 1 / 3</span>
              </div>
            </div>
${p.stepsHtml}
${contactStep(p.submit)}
          </form>
          <p class="success" data-form-success hidden>Merci, votre demande a bien ete envoyee. Un conseiller vous recontacte rapidement.</p>
          <p class="form-error" data-form-error hidden>Envoi impossible. Reessayez dans quelques instants.</p>
        </div>

        <div class="form-wrap">
          <h2>FAQ</h2>
          <ul class="faq-list landing-faq">
            ${p.faq
              .map(
                (f) => `<li>
              <details class="faq-item">
                <summary><span>${f.q}</span></summary>
                <p>${f.a}</p>
              </details>
            </li>`
              )
              .join("\n            ")}
          </ul>
        </div>
      </section>
    </div>
  </main>
${footer()}
${SCRIPTS}
</body>
</html>
`;
}

const pages = [
  {
    file: "vendeur-immo.html",
    persona: "vendeur",
    badge: "Vendeur immobilier",
    title: "Vendre mon bien | Estimation et accompagnement | Leads Opportunities",
    description:
      "Vous vendez un bien : estimation, mandat, PNO bailleur, plus-value. Inscrivez-vous — un conseiller vous rappelle. Courtier ORIAS.",
    h1: "Vous vendez — on prepare le dossier avec vous",
    sub: "Estimation, strategie de vente, assurances bailleur (PNO) et orientation financement acheteur si besoin. Gratuit, sans engagement.",
    points: [
      "Estimation et cadrage du prix (FAI / net vendeur)",
      "PNO bailleur et points d'attention avant mise en location ou vente",
      "Mise en relation avec le parcours acquereur / pret si l'acheteur est a financer",
    ],
    trust: ["Vendeurs & bailleurs", "Conseiller dedie", "ORIAS"],
    cta: "Demander un rappel vendeur",
    formTitle: "Inscription vendeur",
    formLead: "3 etapes — situation du bien, projet, coordonnees.",
    need: "vendeur-immo",
    vertical: "vendeur_immo",
    submit: "Envoyer ma demande vendeur",
    stepsHtml: `            <section class="wizard-step" data-wizard-step="1">
              <h3>Votre bien</h3>
              <div class="grid">
                <div class="field">
                  <label for="propertyType">Type de bien</label>
                  <select id="propertyType" name="propertyType" required>
                    <option value="">Selectionnez</option>
                    <option>Appartement</option>
                    <option>Maison</option>
                    <option>Terrain</option>
                    <option>Immeuble / lots</option>
                    <option>Local professionnel</option>
                  </select>
                </div>
                <div class="field">
                  <label for="postalProject">Code postal du bien</label>
                  <input id="postalProject" name="postalProject" inputmode="numeric" maxlength="5" required />
                </div>
                <div class="field">
                  <label for="surface">Surface approx. (m²)</label>
                  <input id="surface" name="surface" inputmode="numeric" required placeholder="Ex. 85" />
                </div>
                <div class="field">
                  <label for="priceWish">Prix souhaite (€)</label>
                  <input id="priceWish" name="priceWish" inputmode="numeric" placeholder="Ex. 280000" />
                </div>
              </div>
            </section>
            <section class="wizard-step" data-wizard-step="2" hidden>
              <h3>Votre projet</h3>
              <div class="grid">
                <div class="field">
                  <label for="sellerGoal">Objectif</label>
                  <select id="sellerGoal" name="sellerGoal" required>
                    <option value="">Selectionnez</option>
                    <option>Vente residence principale</option>
                    <option>Vente investissement locatif</option>
                    <option>Mise en location / PNO</option>
                    <option>Estimation seule</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div class="field">
                  <label for="timeline">Delai souhaite</label>
                  <select id="timeline" name="timeline" required>
                    <option value="">Selectionnez</option>
                    <option>Immediat (&lt; 1 mois)</option>
                    <option>1 a 3 mois</option>
                    <option>3 a 6 mois</option>
                    <option>Plus de 6 mois</option>
                  </select>
                </div>
                <div class="field full">
                  <label for="notes">Precisions (optionnel)</label>
                  <textarea id="notes" name="notes" rows="3" placeholder="Mandat en cours, travaux, occupation…"></textarea>
                </div>
              </div>
            </section>`,
    faq: [
      {
        q: "Dois-je deja avoir un mandat ?",
        a: "Non. Vous pouvez demander une estimation et un accompagnement avant de signer un mandat.",
      },
      {
        q: "Puis-je aussi assurer un bien locatif ?",
        a: "Oui — orientez-vous aussi vers le parcours habitation / PNO si vous etes bailleur.",
      },
    ],
  },
  {
    file: "habitation-immo.html",
    persona: "assure",
    badge: "Assure habitation",
    title: "Assurance habitation MRH / PNO / locataire | Devis | Leads Opportunities",
    description:
      "Devis habitation : locataire, proprietaire, PNO bailleur. Comparez et inscrivez-vous — courtier ORIAS France.",
    h1: "Assurer votre logement — devis clair",
    sub: "MRH proprietaire, assurance locataire ou PNO bailleur. Un conseiller prepare des propositions adaptees a votre situation.",
    points: [
      "Locataire, proprietaire occupant ou bailleur (PNO)",
      "Habitation liee a un projet d'achat : croisement avec pret / acquereur",
      "Devis gratuit, rappel humain",
    ],
    trust: ["MRH · PNO · Locataire", "Comparatif", "ORIAS"],
    cta: "Obtenir mon devis habitation",
    formTitle: "Devis habitation",
    formLead: "Indiquez votre profil, le bien, puis vos coordonnees.",
    need: "habitation",
    vertical: "habitation",
    submit: "Envoyer ma demande habitation",
    stepsHtml: `            <section class="wizard-step" data-wizard-step="1">
              <h3>Votre situation</h3>
              <div class="grid">
                <div class="field">
                  <label for="occupancy">Vous etes</label>
                  <select id="occupancy" name="occupancy" required>
                    <option value="">Selectionnez</option>
                    <option>Locataire</option>
                    <option>Proprietaire occupant</option>
                    <option>Bailleur (PNO)</option>
                    <option>Colocataire</option>
                  </select>
                </div>
                <div class="field">
                  <label for="propertyType">Type de logement</label>
                  <select id="propertyType" name="propertyType" required>
                    <option value="">Selectionnez</option>
                    <option>Appartement</option>
                    <option>Maison</option>
                    <option>Studio</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div class="field">
                  <label for="postalProject">Code postal</label>
                  <input id="postalProject" name="postalProject" inputmode="numeric" maxlength="5" required />
                </div>
                <div class="field">
                  <label for="rooms">Nombre de pieces</label>
                  <input id="rooms" name="rooms" inputmode="numeric" required placeholder="Ex. 3" />
                </div>
              </div>
            </section>
            <section class="wizard-step" data-wizard-step="2" hidden>
              <h3>Couverture souhaitee</h3>
              <div class="grid">
                <div class="field">
                  <label for="currentInsurer">Assureur actuel (si connu)</label>
                  <input id="currentInsurer" name="currentInsurer" placeholder="Optionnel" />
                </div>
                <div class="field">
                  <label for="urgency">Urgence</label>
                  <select id="urgency" name="urgency" required>
                    <option value="">Selectionnez</option>
                    <option>Signature bail / achat imminente</option>
                    <option>Renouvellement / resiliation</option>
                    <option>Comparaison tarifaire</option>
                    <option>Sinistre recent</option>
                  </select>
                </div>
                <div class="field full">
                  <label for="notes">Precisions</label>
                  <textarea id="notes" name="notes" rows="3" placeholder="Objets de valeur, piscine, dependances…"></textarea>
                </div>
              </div>
            </section>`,
    faq: [
      {
        q: "PNO : pour qui ?",
        a: "La PNO (proprietaire non occupant) concerne les bailleurs qui louent un bien et ne l'habitent pas.",
      },
      {
        q: "Lie a un pret immobilier ?",
        a: "Oui — vous pouvez aussi lancer le parcours credit ou acquereur si vous achetez.",
      },
    ],
  },
  {
    file: "patrimoine.html",
    persona: "patrimoine",
    badge: "Patrimoine & prevoyance",
    title: "Patrimoine | Retraite, mutuelle, invalidite, famille | Leads Opportunities",
    description:
      "Orientations patrimoine : retraite, mutuelle, invalidite, protection famille. Inscrivez-vous pour un entretien conseil — ORIAS.",
    h1: "Proteger et preparer votre patrimoine",
    sub: "Retraite supplementaire, mutuelle, invalidite, protection famille. Un conseiller vous oriente selon vos priorites.",
    points: [
      "Retraite / epargne long terme",
      "Mutuelle et prevoyance (invalidite, famille)",
      "Complement possible avec assurance emprunteur si pret en cours",
    ],
    trust: ["CGP-oriented", "Sans engagement", "ORIAS"],
    cta: "Demander un entretien patrimoine",
    formTitle: "Inscription patrimoine",
    formLead: "Choisissez vos priorites, puis laissez vos coordonnees.",
    need: "patrimoine",
    vertical: "patrimoine",
    submit: "Envoyer ma demande patrimoine",
    stepsHtml: `            <section class="wizard-step" data-wizard-step="1">
              <h3>Vos priorites</h3>
              <div class="grid">
                <div class="field full">
                  <fieldset style="border:0;padding:0;margin:0">
                    <legend style="font-weight:700;margin-bottom:8px">Que souhaitez-vous etudier ?</legend>
                    <label class="field-check"><input type="checkbox" name="topics" value="retraite" /> Retraite / epargne long terme</label>
                    <label class="field-check"><input type="checkbox" name="topics" value="mutuelle" /> Mutuelle sante</label>
                    <label class="field-check"><input type="checkbox" name="topics" value="invalidite" /> Invalidite / prevoyance</label>
                    <label class="field-check"><input type="checkbox" name="topics" value="famille" /> Protection famille</label>
                    <label class="field-check"><input type="checkbox" name="topics" value="assurance-vie" /> Assurance-vie</label>
                  </fieldset>
                </div>
                <div class="field">
                  <label for="ageRange">Tranche d'age</label>
                  <select id="ageRange" name="ageRange" required>
                    <option value="">Selectionnez</option>
                    <option>Moins de 35 ans</option>
                    <option>35-49 ans</option>
                    <option>50-62 ans</option>
                    <option>63 ans et plus</option>
                  </select>
                </div>
                <div class="field">
                  <label for="situation">Situation</label>
                  <select id="situation" name="situation" required>
                    <option value="">Selectionnez</option>
                    <option>Salarie</option>
                    <option>TNS / independant</option>
                    <option>Retraite</option>
                    <option>Autre</option>
                  </select>
                </div>
              </div>
            </section>
            <section class="wizard-step" data-wizard-step="2" hidden>
              <h3>Contexte</h3>
              <div class="grid">
                <div class="field">
                  <label for="hasLoan">Pret immobilier en cours ?</label>
                  <select id="hasLoan" name="hasLoan" required>
                    <option value="">Selectionnez</option>
                    <option>Oui</option>
                    <option>Non</option>
                    <option>En projet</option>
                  </select>
                </div>
                <div class="field">
                  <label for="budgetHint">Budget mensuel envisage</label>
                  <select id="budgetHint" name="budgetHint">
                    <option value="">Optionnel</option>
                    <option>&lt; 50 €/mois</option>
                    <option>50-150 €/mois</option>
                    <option>&gt; 150 €/mois</option>
                  </select>
                </div>
                <div class="field full">
                  <label for="notes">Precisions</label>
                  <textarea id="notes" name="notes" rows="3"></textarea>
                </div>
              </div>
            </section>`,
    faq: [
      {
        q: "Est-ce un conseil en investissement ?",
        a: "C'est une prise de contact pour orientation. Les propositions sont personnalisees apres echange avec un conseiller.",
      },
      {
        q: "Puis-je croiser avec un pret ?",
        a: "Oui — indiquez si un pret est en cours ; nous pouvons aussi ouvrir le parcours credit.",
      },
    ],
  },
  {
    file: "banque-epargne.html",
    persona: "banque",
    badge: "Banque & epargne",
    title: "Epargne, placements, tresorerie | Demande conseil | Leads Opportunities",
    description:
      "Epargne, placements, tresorerie professionnelle : inscrivez-vous pour un rappel conseiller. Courtier ORIAS France.",
    h1: "Epargne et tresorerie — on clarifie vos options",
    sub: "Epargne, placements, tresorerie pro. Un conseiller vous rappelle pour comprendre vos objectifs et vous orienter.",
    points: [
      "Epargne de precaution et placements",
      "Tresorerie professionnelle",
      "Lien possible avec financement immo / patrimoine",
    ],
    trust: ["Epargne · Placements", "Rappel humain", "ORIAS"],
    cta: "Demander un rappel epargne",
    formTitle: "Inscription banque & epargne",
    formLead: "Objectifs, horizon, puis coordonnees.",
    need: "banque-epargne",
    vertical: "banque_epargne",
    submit: "Envoyer ma demande epargne",
    stepsHtml: `            <section class="wizard-step" data-wizard-step="1">
              <h3>Vos objectifs</h3>
              <div class="grid">
                <div class="field">
                  <label for="goal">Objectif principal</label>
                  <select id="goal" name="goal" required>
                    <option value="">Selectionnez</option>
                    <option>Epargne de precaution</option>
                    <option>Placements / rendement</option>
                    <option>Tresorerie professionnelle</option>
                    <option>Preparation projet immo</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div class="field">
                  <label for="horizon">Horizon</label>
                  <select id="horizon" name="horizon" required>
                    <option value="">Selectionnez</option>
                    <option>Moins de 2 ans</option>
                    <option>2 a 5 ans</option>
                    <option>Plus de 5 ans</option>
                  </select>
                </div>
                <div class="field">
                  <label for="profile">Profil</label>
                  <select id="profile" name="profile" required>
                    <option value="">Selectionnez</option>
                    <option>Particulier</option>
                    <option>Professionnel / TNS</option>
                    <option>SCI / societe</option>
                  </select>
                </div>
                <div class="field">
                  <label for="amountHint">Montant approximatif</label>
                  <select id="amountHint" name="amountHint">
                    <option value="">Optionnel</option>
                    <option>&lt; 10 000 €</option>
                    <option>10 000 – 50 000 €</option>
                    <option>&gt; 50 000 €</option>
                  </select>
                </div>
              </div>
            </section>
            <section class="wizard-step" data-wizard-step="2" hidden>
              <h3>Contexte</h3>
              <div class="grid">
                <div class="field">
                  <label for="hasCredit">Credit ou pret en cours ?</label>
                  <select id="hasCredit" name="hasCredit" required>
                    <option value="">Selectionnez</option>
                    <option>Oui — immo</option>
                    <option>Oui — autre</option>
                    <option>Non</option>
                  </select>
                </div>
                <div class="field full">
                  <label for="notes">Precisions</label>
                  <textarea id="notes" name="notes" rows="3" placeholder="Liquidites, projets, contraintes…"></textarea>
                </div>
              </div>
            </section>`,
    faq: [
      {
        q: "Est-ce une ouverture de compte bancaire ?",
        a: "Non — c'est une demande de conseil / orientation. Les solutions proposees dependent de votre profil.",
      },
      {
        q: "Puis-je combiner avec un pret immo ?",
        a: "Oui — indiquez-le dans le formulaire ou ouvrez aussi le parcours credit immobilier.",
      },
    ],
  },
];

const hub = `<!doctype html>
<html lang="fr">
<head>
${HEAD_COMMON}
  <title>Parcours immobilier &amp; finance | Acquereur, vendeur, pret, assurance | Leads Opportunities</title>
  <meta name="description" content="Choisissez votre parcours : acquereur, vendeur, credit immo, assurance habitation, patrimoine, epargne. Inscription gratuite — courtier ORIAS." />
  <link rel="canonical" href="https://www.leadsopportunities.fr/landings/parcours-immo.html" />
  <meta property="og:title" content="Parcours immobilier &amp; finance | Leads Opportunities" />
  <meta property="og:description" content="Acquereur, vendeur, emprunteur, assure, patrimoine, banque — inscrivez-vous en ligne." />
  <meta property="og:url" content="https://www.leadsopportunities.fr/landings/parcours-immo.html" />
</head>
<body data-market-intent="FR">
  <header class="landing-topbar">
    <div class="landing-topbar-inner">
      <a class="landing-back" href="../index.html">Accueil</a>
      <a class="landing-logo" href="../index.html">Leads Opportunities</a>
    </div>
  </header>
  <main class="page">
    <div class="container">
      <span class="badge">Visiteurs — inscription</span>
      <section class="card">
        <div class="hero-surface">
          <div class="hero">
            <h1>Qui etes-vous dans votre projet ?</h1>
            <p class="sub">
              Pages publiques pour consulter et vous inscrire : futur acquereur, vendeur, emprunteur,
              assure habitation, patrimoine ou epargne. Gratuit, sans engagement — un conseiller vous recontacte.
            </p>
          </div>
        </div>
        <div class="form-wrap">
          <h2>Choisissez votre parcours</h2>
          <div class="persona-grid">
            <a class="persona-card persona-acquereur" href="./acheteur-immo.html">
              <strong>Acquereur</strong>
              <span>Acheter — pret + assurances liees</span>
              <em>S'inscrire</em>
            </a>
            <a class="persona-card persona-vendeur" href="./vendeur-immo.html">
              <strong>Vendeur</strong>
              <span>Vendre ou louer — estimation &amp; PNO</span>
              <em>S'inscrire</em>
            </a>
            <a class="persona-card persona-emprunteur" href="./credit-immo.html">
              <strong>Emprunteur / pret</strong>
              <span>Simulation credit immobilier</span>
              <em>S'inscrire</em>
            </a>
            <a class="persona-card persona-assure" href="./habitation-immo.html">
              <strong>Assure habitation</strong>
              <span>MRH, locataire, PNO</span>
              <em>S'inscrire</em>
            </a>
            <a class="persona-card persona-patrimoine" href="./patrimoine.html">
              <strong>Patrimoine</strong>
              <span>Retraite, mutuelle, famille</span>
              <em>S'inscrire</em>
            </a>
            <a class="persona-card persona-banque" href="./banque-epargne.html">
              <strong>Banque &amp; epargne</strong>
              <span>Epargne, placements, tresorerie</span>
              <em>S'inscrire</em>
            </a>
          </div>
          <p class="form-lead" style="margin-top:18px">
            Besoin d'un rappel sans formulaire long ?
            <a href="./rappel.html">Demande de rappel</a>
            · <a href="./questionnaire.html">Questionnaire universel</a>
            · <a href="../negociateur-immobilier/">Espace negociateur</a>
          </p>
        </div>
      </section>
    </div>
  </main>
${footer()}
  <script src="../js/attribution.js"></script>
  <script src="../js/cookie-banner.js"></script>
  <script src="../js/geo-france-guard.js"></script>
</body>
</html>
`;

const css = `/* Hub & landings personas visiteurs */
.persona-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}
.persona-card {
  display: grid;
  gap: 6px;
  padding: 16px 14px;
  border-radius: 14px;
  text-decoration: none;
  color: #0f172a;
  background: #fff;
  border: 2px solid #e2e8f0;
  min-height: 120px;
  transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease;
}
.persona-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(15, 23, 42, .1);
}
.persona-card strong { font-size: 1.05rem; }
.persona-card span { color: #64748b; font-size: .88rem; line-height: 1.35; }
.persona-card em {
  font-style: normal;
  font-size: .72rem;
  font-weight: 800;
  letter-spacing: .06em;
  text-transform: uppercase;
  color: #1e4f8a;
}
.persona-acquereur { border-color: rgba(30, 58, 138, .35); }
.persona-vendeur { border-color: rgba(15, 76, 92, .35); }
.persona-emprunteur { border-color: rgba(37, 99, 235, .35); }
.persona-assure { border-color: rgba(15, 118, 110, .35); }
.persona-patrimoine { border-color: rgba(180, 83, 9, .35); }
.persona-banque { border-color: rgba(51, 65, 85, .35); }

.persona-badge.persona-vendeur { background: #0f4c5c; }
.persona-badge.persona-assure { background: #0f766e; }
.persona-badge.persona-patrimoine { background: #b45309; }
.persona-badge.persona-banque { background: #334155; }
`;

fs.writeFileSync(path.join(root, "persona-landings.css"), css);
fs.writeFileSync(path.join(root, "parcours-immo.html"), hub);
pages.forEach((p) => {
  fs.writeFileSync(path.join(root, p.file), pageShell(p));
  console.log("wrote", p.file);
});
console.log("wrote parcours-immo.html + persona-landings.css");
