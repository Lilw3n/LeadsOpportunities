const fs = require("fs");
const path = require("path");

function loadBrandConfig() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "config", "quote-brand.json"), "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return {
      companyName: "Leads Opportunities",
      tagline: "Courtier en assurance",
      email: "contact@leadsopportunities.fr",
      orias: "15005935",
      accentColor: "#0d9488",
      validityDaysDefault: 30,
    };
  }
}

function parseQuoteData(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function escHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatEur(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function formatDateFr(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR");
  } catch (e) {
    return String(iso);
  }
}

function displayReference(quoteId, docRef) {
  if (docRef) return docRef;
  if (!quoteId) return "DEV-—";
  const d = new Date();
  const ym = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, "0");
  const tail = String(quoteId).replace(/[^a-zA-Z0-9]/g, "").slice(-4).toUpperCase() || "0000";
  return "DEV-" + ym + "-" + tail;
}

function linesToList(items) {
  if (!items || !items.length) return '<p class="loq-muted">Aucun element renseigne.</p>';
  return (
    "<ul>" +
    items
      .filter(Boolean)
      .map(function (item) {
        return "<li>" + escHtml(item) + "</li>";
      })
      .join("") +
    "</ul>"
  );
}

function fieldRow(label, value) {
  return (
    '<div class="loq-row"><span class="loq-label">' +
    escHtml(label) +
    '</span><span class="loq-value">' +
    escHtml(value || "—") +
    "</span></div>"
  );
}

function defaultDocument(quote, contact, data) {
  const name = contact
    ? ((contact.first_name || "") + " " + (contact.last_name || "")).trim()
    : ((data.firstName || "") + " " + (data.lastName || "")).trim();
  return {
    reference: null,
    formula: data.formula || data.coverage || data.coverageLevel || "Formule proposee",
    validityDays: 30,
    productLabel: quote.product_type || quote.title || "Assurance",
    vehicle: {
      brand: data.brand || data.vehicleBrand || "",
      model: data.model || data.vehicleModel || "",
      firstRegistration: data.firstRegistration || data.registrationDate || "",
      acquisitionDate: data.acquisitionDate || "",
      acquisitionMode: data.acquisitionMode || "",
      usage: data.usage || data.activityType || "",
      postalCode: data.postalCode || contact?.postal_code || "",
    },
    driver: {
      name: name,
      birthDate: data.birthDate || "",
      license: data.license || data.licenseType || "",
      licenseDate: data.licenseDate || "",
      insuranceHistory: data.insuranceHistory || "",
      reason: data.reason || data.motif || "",
      email: contact?.email || data.email || "",
      phone: contact?.phone || data.phone || "",
    },
    claims: data.claims || [],
    claimsNote: data.claimsNote || "",
    guarantees: {
      base: data.guaranteesBase || data.garanties || [],
      accessories: data.guaranteesAccessories || [],
    },
    pricing: {
      annualPremiumTtc: quote.premium_estimate || data.annualPremium || null,
      brokerageFees: data.brokerageFees || data.depositAmount || data.acompte || null,
      monthlyPremiumTtc: data.monthlyPremium || null,
      attackTaxEur: data.attackTaxEur != null ? data.attackTaxEur : 6.5,
      firstInstallmentsNote: data.firstInstallmentsNote || "",
      pricingNotes: data.pricingNotes || "",
    },
    clauses: data.clauses || [
      "Conditions generales de la compagnie d'assurance",
      "Document d'information sur le produit d'assurance (IPID)",
      "Fiche d'information et de conseil",
    ],
    subscriptionSteps: data.subscriptionSteps || null,
    requiredDocuments: data.requiredDocuments || [
      "Piece d'identite en cours de validite",
      "Carte grise du vehicule",
      "Permis de conduire (si applicable)",
      "Releve d'information ou attestation d'assurance",
      "RIB pour mandat SEPA",
    ],
    companyDocuments: data.companyDocuments || [
      "Extrait Kbis de moins de 3 mois",
      "Statuts de la societe",
      "Piece d'identite du dirigeant",
    ],
    partnerImport: {
      internalOnly: true,
      partnerName: "",
      partnerReference: "",
      notes: "",
    },
  };
}

function mergeDocument(quote, contact, data) {
  const base = defaultDocument(quote, contact, data);
  const doc = data.document && typeof data.document === "object" ? data.document : {};
  return {
    ...base,
    ...doc,
    vehicle: { ...base.vehicle, ...(doc.vehicle || {}) },
    driver: { ...base.driver, ...(doc.driver || {}) },
    guarantees: {
      base: (doc.guarantees && doc.guarantees.base) || base.guarantees.base,
      accessories: (doc.guarantees && doc.guarantees.accessories) || base.guarantees.accessories,
    },
    pricing: { ...base.pricing, ...(doc.pricing || {}) },
    partnerImport: { ...base.partnerImport, ...(doc.partnerImport || {}) },
  };
}

function buildDocumentModel(quote, contact, brand) {
  const data = parseQuoteData(quote?.data);
  const doc = mergeDocument(quote, contact, data);
  const annual = Number(doc.pricing.annualPremiumTtc || quote?.premium_estimate);
  let monthly = Number(doc.pricing.monthlyPremiumTtc);
  if (!monthly && annual > 0) monthly = Math.round((annual / 12) * 100) / 100;

  const brokerage = Number(doc.pricing.brokerageFees || data.depositAmount || quote?.deposit_amount);
  const validityDays = Number(doc.validityDays) || brand.validityDaysDefault || 30;

  return {
    brand,
    quoteId: quote.id,
    createdAt: quote.created_at,
    status: quote.status,
    meta: {
      reference: displayReference(quote.id, doc.reference),
      date: formatDateFr(quote.created_at || new Date().toISOString()),
      validityLabel: "Valable " + validityDays + " jours",
      formula: doc.formula,
      productLabel: doc.productLabel,
    },
    vehicle: doc.vehicle,
    driver: doc.driver,
    claims: doc.claims,
    claimsNote: doc.claimsNote || (doc.claims && doc.claims.length ? null : "Aucun sinistre declare"),
    guarantees: doc.guarantees,
    pricing: {
      annualPremiumTtc: annual || null,
      brokerageFees: brokerage || null,
      monthlyPremiumTtc: monthly || null,
      attackTaxEur: doc.pricing.attackTaxEur,
      firstInstallmentsNote:
        doc.pricing.firstInstallmentsNote ||
        (monthly
          ? "La compagnie d'assurance prelevera directement vos echeances selon le calendrier convenu apres la date d'effet du contrat."
          : ""),
      pricingNotes: doc.pricing.pricingNotes,
    },
    clauses: doc.clauses,
    subscriptionIntro: brand.subscriptionIntro,
    subscriptionSteps: doc.subscriptionSteps || [
      "Vous nous faites parvenir votre accord par e-mail : nous vous enverrons un lien de paiement securise.",
      "Vous reglez les frais de dossier par carte bancaire : cela vaut validation electronique du devis et des conditions.",
      "Un conseiller Leads Opportunities vous contacte pour finaliser la souscription.",
      "Vous recevez votre contrat et votre attestation provisoire par e-mail.",
    ],
    requiredDocuments: doc.requiredDocuments,
    companyDocuments: doc.companyDocuments,
    gdpr: {
      bullets: brand.gdprBullets || [],
      declaration: brand.gdprDeclaration || "",
    },
  };
}

function renderPageHeader(brand, meta, page, total) {
  return (
    '<header class="loq-header">' +
    '<div class="loq-brand">' +
    '<h1 class="loq-logo">' +
    escHtml(brand.companyName) +
    "</h1>" +
    '<p class="loq-tagline">' +
    escHtml(brand.tagline || "") +
    "</p>" +
    "</div>" +
    '<div class="loq-contact">' +
    (brand.addressLine ? "<div>" + escHtml(brand.addressLine) + "</div>" : "") +
    '<div><a href="mailto:' +
    escHtml(brand.email) +
    '">' +
    escHtml(brand.email) +
    "</a></div>" +
    (brand.phone ? "<div>" + escHtml(brand.phone) + "</div>" : "") +
    '<div>ORIAS ' +
    escHtml(brand.orias || "") +
    "</div>" +
    "</div></header>" +
    '<div class="loq-meta-bar">' +
    "<span>Date : " +
    escHtml(meta.date) +
    "</span>" +
    "<span>N° " +
    escHtml(meta.reference) +
    "</span>" +
    "<span>" +
    escHtml(meta.validityLabel) +
    "</span>" +
    '<span class="loq-formula">Formule : ' +
    escHtml(meta.formula) +
    "</span>" +
    "</div>"
  );
}

function renderPageFooter(brand, page, total) {
  return (
    '<footer class="loq-footer">' +
    "<span>" +
    escHtml(brand.footerLegal || brand.companyName) +
    "</span>" +
    '<span class="loq-page-num">' +
    page +
    " / " +
    total +
    "</span></footer>"
  );
}

function renderDocumentHtml(model) {
  const brand = model.brand;
  const accent = brand.accentColor || "#0d9488";
  const totalPages = 3;

  const page1 =
    '<section class="loq-page">' +
    renderPageHeader(brand, model.meta, 1, totalPages) +
    '<h2 class="loq-section">VEHICULE A ASSURER</h2>' +
    fieldRow("Marque", model.vehicle.brand) +
    fieldRow("Modele", model.vehicle.model) +
    fieldRow("1ere immatriculation", model.vehicle.firstRegistration) +
    fieldRow("Date d'acquisition", model.vehicle.acquisitionDate) +
    fieldRow("Mode d'acquisition", model.vehicle.acquisitionMode) +
    fieldRow("Usage", model.vehicle.usage) +
    fieldRow("Code postal", model.vehicle.postalCode) +
    '<h2 class="loq-section">CONDUCTEUR</h2>' +
    fieldRow("Nom", model.driver.name) +
    fieldRow("Date de naissance", model.driver.birthDate) +
    fieldRow("Permis", model.driver.license) +
    fieldRow("Date du permis", model.driver.licenseDate) +
    fieldRow("Historique assurance", model.driver.insuranceHistory) +
    fieldRow("Motif", model.driver.reason) +
    fieldRow("Email", model.driver.email) +
    fieldRow("Telephone", model.driver.phone) +
    '<h2 class="loq-section">SINISTRES DECLARES</h2>' +
    (model.claims && model.claims.length
      ? linesToList(model.claims)
      : '<p class="loq-muted">' + escHtml(model.claimsNote || "Aucun sinistre declare") + "</p>") +
    '<h2 class="loq-section">GARANTIES — ' +
    escHtml(model.meta.formula) +
    "</h2>" +
    '<h3 class="loq-sub">Garanties de base</h3>' +
    linesToList(model.guarantees.base) +
    '<h3 class="loq-sub">Garanties et services accessoires</h3>' +
    linesToList(model.guarantees.accessories) +
    renderPageFooter(brand, 1, totalPages) +
    "</section>";

  const pricingRows =
    '<table class="loq-table">' +
    "<tbody>" +
    "<tr><th>Cotisation annuelle TTC</th><td>" +
    formatEur(model.pricing.annualPremiumTtc) +
    "</td></tr>" +
    "<tr><th>Frais de dossier</th><td>" +
    formatEur(model.pricing.brokerageFees) +
    " <span class=\"loq-muted\">(a regler a la souscription)</span></td></tr>" +
    "</tbody></table>" +
    '<div class="loq-highlight">' +
    "<strong>Prime mensuelle TTC</strong>" +
    "<div class=\"loq-highlight-price\">" +
    formatEur(model.pricing.monthlyPremiumTtc) +
    " / mois</div>" +
    '<span class="loq-muted">Dont cotisation catastrophes naturelles</span>' +
    "</div>" +
    '<p class="loq-note">Taxe attentat : ' +
    formatEur(model.pricing.attackTaxEur) +
    " due des la premiere echeance.</p>" +
    (model.pricing.pricingNotes
      ? '<p class="loq-note">' + escHtml(model.pricing.pricingNotes) + "</p>"
      : '<p class="loq-note">Le tarif est calcule sur la base des informations declarees. La cotisation annuelle reste exigible en cas de non-paiement d\'une echeance. Les frais de dossier ne sont payes qu\'une seule fois a la souscription.</p>') +
    (model.pricing.firstInstallmentsNote
      ? '<div class="loq-alert">' + escHtml(model.pricing.firstInstallmentsNote) + "</div>"
      : "");

  const page2 =
    '<section class="loq-page">' +
    renderPageHeader(brand, model.meta, 2, totalPages) +
    '<h2 class="loq-section">ESTIMATION TARIFAIRE</h2>' +
    pricingRows +
    '<h2 class="loq-section">CLAUSES APPLICABLES</h2>' +
    linesToList(model.clauses) +
    '<h2 class="loq-section">CONSTITUTION DE VOTRE DOSSIER</h2>' +
    "<p>" +
    escHtml(model.subscriptionIntro) +
    "</p>" +
    "<ol class=\"loq-steps\">" +
    model.subscriptionSteps
      .map(function (step) {
        return "<li>" + escHtml(step) + "</li>";
      })
      .join("") +
    "</ol>" +
    "<p><strong>Documents a fournir sous 30 jours :</strong></p>" +
    linesToList(model.requiredDocuments) +
    "<p><strong>Pour les personnes morales :</strong></p>" +
    linesToList(model.companyDocuments) +
    renderPageFooter(brand, 2, totalPages) +
    "</section>";

  const page3 =
    '<section class="loq-page">' +
    renderPageHeader(brand, model.meta, 3, totalPages) +
    '<h2 class="loq-section">PROTECTION DES DONNEES (RGPD)</h2>' +
    "<ul>" +
    (model.gdpr.bullets || [])
      .map(function (b) {
        return "<li>" + escHtml(b) + "</li>";
      })
      .join("") +
    "</ul>" +
    "<p class=\"loq-declaration\">" +
    escHtml(model.gdpr.declaration) +
    "</p>" +
    renderPageFooter(brand, 3, totalPages) +
    "</section>";

  const styles =
    "<style>:root{--loq-accent:" +
    accent +
    ";--loq-accent-dark:" +
    (brand.accentDark || accent) +
    ';}' +
    getDocumentStyles() +
    "</style>";

  return (
    '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>' +
    "<title>Devis " +
    escHtml(model.meta.reference) +
    " — " +
    escHtml(brand.companyName) +
    "</title>" +
    styles +
    '</head><body class="loq-doc">' +
    page1 +
    page2 +
    page3 +
    "</body></html>"
  );
}

function getDocumentStyles() {
  return `
.loq-doc{margin:0;font-family:Inter,Arial,sans-serif;color:#0f172a;background:#fff}
.loq-page{max-width:820px;margin:0 auto;padding:28px 32px 40px;page-break-after:always;min-height:100vh;box-sizing:border-box;position:relative}
.loq-page:last-child{page-break-after:auto}
.loq-header{display:flex;justify-content:space-between;gap:20px;border-bottom:4px solid var(--loq-accent);padding-bottom:14px;margin-bottom:12px}
.loq-logo{margin:0;font-size:1.65rem;color:var(--loq-accent);letter-spacing:.02em;text-transform:uppercase}
.loq-tagline{margin:4px 0 0;font-style:italic;color:var(--loq-accent);font-size:.95rem}
.loq-contact{text-align:right;font-size:.78rem;color:#64748b;line-height:1.5}
.loq-contact a{color:#64748b;text-decoration:none}
.loq-meta-bar{display:flex;flex-wrap:wrap;gap:10px 18px;font-size:.82rem;color:#475569;margin-bottom:18px;align-items:center}
.loq-formula{margin-left:auto;background:var(--loq-accent);color:#fff;padding:6px 12px;border-radius:4px;font-weight:700}
.loq-section{color:var(--loq-accent);font-size:.92rem;margin:22px 0 10px;padding-bottom:6px;border-bottom:2px solid var(--loq-accent);text-transform:uppercase;letter-spacing:.04em}
.loq-sub{color:var(--loq-accent);font-size:.85rem;margin:12px 0 6px}
.loq-row{display:grid;grid-template-columns:200px 1fr;gap:12px;padding:7px 0;border-bottom:1px solid #e2e8f0;font-size:.88rem}
.loq-label{color:#64748b;font-weight:600}
.loq-value{color:#0f172a}
.loq-muted{color:#94a3b8;font-style:italic}
.loq-table{width:100%;border-collapse:collapse;margin:12px 0;font-size:.9rem}
.loq-table th,.loq-table td{padding:10px 12px;border:1px solid #e2e8f0;text-align:left}
.loq-table th{width:55%;background:#f8fafc;font-weight:600}
.loq-highlight{border:2px solid var(--loq-accent);border-radius:8px;padding:14px 16px;margin:16px 0;text-align:center}
.loq-highlight-price{font-size:1.45rem;font-weight:800;color:var(--loq-accent);margin-top:6px}
.loq-note{font-size:.82rem;color:#64748b;line-height:1.5}
.loq-alert{border:2px solid var(--loq-accent);color:var(--loq-accent);padding:12px;border-radius:6px;font-size:.84rem;font-weight:600;margin:14px 0}
.loq-steps{padding-left:1.2rem;font-size:.88rem;line-height:1.55}
.loq-steps li{margin:8px 0}
.loq-doc ul{font-size:.88rem;line-height:1.5;padding-left:1.2rem}
.loq-declaration{font-size:.84rem;color:#64748b;line-height:1.55;margin-top:18px}
.loq-footer{position:absolute;left:32px;right:32px;bottom:18px;display:flex;justify-content:space-between;font-size:.72rem;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px}
@media print{
  .loq-page{padding:18mm 16mm 22mm;min-height:auto}
  .loq-footer{position:fixed;bottom:10mm}
}
`;
}

module.exports = {
  loadBrandConfig,
  parseQuoteData,
  mergeDocument,
  defaultDocument,
  buildDocumentModel,
  renderDocumentHtml,
  displayReference,
};
