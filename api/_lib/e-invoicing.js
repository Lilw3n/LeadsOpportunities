/**
 * Facturation électronique FR — identité émetteur, mentions obligatoires, export CII/Factur-X (profil minimum).
 * Références : CGI art. 289 bis / 289 E — calendrier réception 01/09/2026, émission GE/ETI 2026, PME/micro 2027.
 */
const fs = require("fs");
const path = require("path");

const RECEIVE_DEADLINE = "2026-09-01";
const EMIT_DEADLINE_GE_ETI = "2026-09-01";
const EMIT_DEADLINE_PME = "2027-09-01";

const DEFAULT_SETTINGS = {
  companyName: "Leads Opportunities",
  legalForm: "Entreprise individuelle",
  directorName: "Wendy Buchet",
  siren: "810571513",
  siret: "",
  vatNumber: "",
  vatRegime: "standard",
  addressLine1: "15 & 17 rue Pierre Curie",
  postalCode: "54110",
  city: "Varangéville",
  countryCode: "FR",
  email: "contact@leadsopportunities.fr",
  orias: "15005935",
  companySize: "micro",
  receiveDeadline: RECEIVE_DEADLINE,
  emitDeadline: EMIT_DEADLINE_PME,
  pdpName: "Tiime",
  pdpId: "",
  pdpStatus: "pending_identity",
  pdpDesignatedAt: null,
  directoryRegistered: false,
  notes: "",
  stackPrimaryPdp: "tiime",
  stackCompanions: ["crm_lo", "make", "notion"],
  tiimeAccountCreated: true,
  tiimeIdentityPending: true,
  tiimeIsPrimaryPlatform: true,
  makeAccountPending: true,
  notionAccountPending: true,
  checklist: {
    identifiedActors: true,
    chosenPdpOrAccountingTool: true,
    designatedReceptionPlatform: true,
    updatedSupplierContacts: false,
    sirenClientsCollected: false,
    invoiceMentionsReady: true,
    retentionProcessDefined: false,
    expertComptableBriefed: false,
  },
};

function loadConfigFile() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "config", "e-invoicing.json"), "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function loadStackCatalog() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "config", "e-invoicing-stack.json"), "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function buildSmartMix(settings) {
  const stack = loadStackCatalog();
  if (!stack) {
    return {
      rule: "Une seule PDP légale.",
      recommendedPrimaryPdp: "tiime",
      tools: [],
      mix: { now: [], optional: [], avoid: [] },
      chosen: null,
    };
  }
  const s = mergeSettings(settings);
  const primaryId = s.stackPrimaryPdp || stack.recommendedPrimaryPdp || "tiime";
  const primary = (stack.tools || []).find(function (t) {
    return t.id === primaryId;
  });
  const companions = Array.isArray(s.stackCompanions) ? s.stackCompanions : [];
  return {
    rule: stack.rule,
    recommendedPrimaryPdp: stack.recommendedPrimaryPdp,
    tools: stack.tools || [],
    mix: stack.mix || { now: [], optional: [], avoid: [] },
    chosen: {
      primaryPdp: primaryId,
      primaryName: primary ? primary.name : primaryId,
      companions: companions,
      alignedWithRecommendation: primaryId === stack.recommendedPrimaryPdp,
    },
  };
}

function applyStackSelection(settings, selection) {
  const next = Object.assign({}, mergeSettings(settings));
  const stack = loadStackCatalog() || { tools: [], recommendedPrimaryPdp: "tiime" };
  const primaryId = (selection && selection.primaryPdp) || stack.recommendedPrimaryPdp || "tiime";
  const tool = (stack.tools || []).find(function (t) {
    return t.id === primaryId;
  });
  next.stackPrimaryPdp = primaryId;
  next.stackCompanions = Array.isArray(selection && selection.companions) ? selection.companions : [];
  if (tool && tool.pdp) {
    next.pdpName = tool.name;
    if (!next.pdpStatus || next.pdpStatus === "not_started") {
      next.pdpStatus = "in_progress";
    }
    next.checklist = Object.assign({}, next.checklist, {
      chosenPdpOrAccountingTool: true,
    });
  }
  if (selection && selection.markDesignated && tool && tool.pdp) {
    next.pdpStatus = "designated";
    next.pdpDesignatedAt = next.pdpDesignatedAt || new Date().toISOString();
    next.checklist = Object.assign({}, next.checklist, {
      chosenPdpOrAccountingTool: true,
      designatedReceptionPlatform: true,
    });
  }
  return next;
}

function mergeSettings(stored) {
  const file = loadConfigFile();
  const base = Object.assign({}, DEFAULT_SETTINGS, file);
  if (!stored || typeof stored !== "object") {
    return Object.assign({}, base, {
      checklist: Object.assign({}, DEFAULT_SETTINGS.checklist, file.checklist || {}),
    });
  }
  return Object.assign({}, base, stored, {
    checklist: Object.assign({}, DEFAULT_SETTINGS.checklist, file.checklist || {}, stored.checklist || {}),
  });
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

function isValidSiren(value) {
  const d = digitsOnly(value);
  return d.length === 9;
}

function isValidSiret(value) {
  const d = digitsOnly(value);
  return d.length === 14;
}

function emitDeadlineForSize(size) {
  if (size === "ge" || size === "eti") return EMIT_DEADLINE_GE_ETI;
  return EMIT_DEADLINE_PME;
}

function daysUntil(isoDate) {
  const target = new Date(isoDate + "T00:00:00+02:00");
  const now = new Date();
  const ms = target.getTime() - now.getTime();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

function checklistScore(checklist) {
  const keys = Object.keys(DEFAULT_SETTINGS.checklist);
  let done = 0;
  keys.forEach(function (k) {
    if (checklist && checklist[k]) done += 1;
  });
  return { done: done, total: keys.length, pct: Math.round((done / keys.length) * 100) };
}

function readiness(settings) {
  const s = mergeSettings(settings);
  const receiveDays = daysUntil(s.receiveDeadline || RECEIVE_DEADLINE);
  const emitDl = emitDeadlineForSize(s.companySize);
  const emitDays = daysUntil(emitDl);
  const score = checklistScore(s.checklist);
  const pdpOk = s.pdpStatus === "designated" || s.pdpStatus === "active";
  const pdpTrajectory =
    pdpOk ||
    s.pdpStatus === "pending_identity" ||
    s.pdpStatus === "in_progress" ||
    !!s.tiimeAccountCreated;
  const identityOk = isValidSiren(s.siren) && !!(s.companyName && s.addressLine1 && s.postalCode && s.city);
  const blockers = [];
  if (s.pdpStatus === "pending_identity" || s.tiimeIdentityPending) {
    blockers.push("Tiime : attendre la validation de la pièce d'identité, puis passer le statut PDP à Active.");
  } else if (!pdpOk && !pdpTrajectory) {
    blockers.push("Désigner une plateforme agréée (PDP) pour recevoir les factures au 1er septembre 2026.");
  } else if (!pdpOk) {
    blockers.push("Finaliser la désignation PDP (statut Désignée ou Active).");
  }
  if (s.makeAccountPending) {
    blockers.push("Créer le compte Make Free et renseigner MAKE_EINVOICE_WEBHOOK_URL + SECRET sur Vercel.");
  }
  if (s.notionAccountPending) {
    blockers.push("Créer la base Notion Facturation + brancher Make ou NOTION_TOKEN (docs/NOTION-EINVOICE.md).");
  }
  if (!identityOk) {
    blockers.push("Compléter l'identité légale (SIREN, adresse, raison sociale).");
  }
  if (!s.checklist.designatedReceptionPlatform && !pdpTrajectory) {
    blockers.push("Cocher la réception via plateforme agréée dans la checklist.");
  }
  var status = "ready";
  if (blockers.length) {
    status = pdpTrajectory && (s.pdpStatus === "pending_identity" || s.tiimeIdentityPending) ? "waiting" : "in_progress";
    if (receiveDays <= 7 && !pdpOk) status = "critical";
  }
  return {
    companySize: s.companySize,
    receiveDeadline: s.receiveDeadline || RECEIVE_DEADLINE,
    emitDeadline: emitDl,
    daysUntilReceive: receiveDays,
    daysUntilEmit: emitDays,
    receiveMandatoryNow: receiveDays <= 0,
    emitMandatoryNow: emitDays <= 0,
    pdpOk: pdpOk,
    pdpTrajectory: pdpTrajectory,
    tiimeIdentityPending: !!(s.tiimeIdentityPending || s.pdpStatus === "pending_identity"),
    makeAccountPending: !!s.makeAccountPending,
    identityOk: identityOk,
    checklist: score,
    blockers: blockers,
    status: status,
  };
}

function escXml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatAmount(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0.00";
  return x.toFixed(2);
}

function isoDate(value) {
  if (!value) {
    return new Date().toISOString().slice(0, 10);
  }
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value).slice(0, 10);
}

/**
 * Mentions obligatoires réforme (émission GE/ETI 2026, PME/micro 2027) + mentions classiques.
 */
function buildMandatoryMentions(invoice, seller) {
  const op =
    invoice.operationType === "goods"
      ? "Livraisons de biens exclusivement"
      : invoice.operationType === "mixed"
        ? "Livraisons de biens et prestations de services"
        : "Prestations de services exclusivement";
  const lines = [
    "Émetteur SIREN : " + digitsOnly(seller.siren),
    seller.siret ? "Émetteur SIRET : " + digitsOnly(seller.siret) : null,
    seller.vatNumber ? "N° TVA intracommunautaire : " + seller.vatNumber : null,
    "Client SIREN : " + digitsOnly(invoice.buyerSiren),
    "Nature des opérations : " + op,
  ];
  if (invoice.deliveryAddress) {
    lines.push("Adresse de livraison (si différente) : " + invoice.deliveryAddress);
  }
  if (invoice.vatOnDebits) {
    lines.push("Option pour le paiement de la TVA sur les débits.");
  }
  lines.push("Conservation des factures électroniques : 6 ans (support informatique).");
  return lines.filter(Boolean);
}

/**
 * Export XML Cross Industry Invoice (CII) — profil minimum Factur-X / e-invoicing FR.
 * À transmettre via une PDP agréée (pas un envoi PDF seul).
 */
function buildCiiXml(invoice, seller) {
  const sellerSiren = digitsOnly(seller.siren);
  const buyerSiren = digitsOnly(invoice.buyerSiren);
  const invDate = isoDate(invoice.invoiceDate);
  const due = isoDate(invoice.dueDate || invoice.invoiceDate);
  const ht = Number(invoice.amountHt) || 0;
  const rate = Number(invoice.vatRate);
  const vatRate = Number.isFinite(rate) ? rate : 20;
  const tva = invoice.amountTva != null ? Number(invoice.amountTva) : (ht * vatRate) / 100;
  const ttc = invoice.amountTtc != null ? Number(invoice.amountTtc) : ht + tva;
  const currency = invoice.currency || "EUR";
  const desc = invoice.lineDescription || "Prestation";
  const invNum = invoice.invoiceNumber || "FAC-DRAFT";
  const opCode =
    invoice.operationType === "goods" ? "goods" : invoice.operationType === "mixed" ? "mixed" : "services";

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rsm:CrossIndustryInvoice xmlns:rsm="urn:un:unece:uncefact:data:standard:CrossIndustryInvoice:100" ' +
    'xmlns:ram="urn:un:unece:uncefact:data:standard:ReusableAggregateBusinessInformationEntity:100" ' +
    'xmlns:udt="urn:un:unece:uncefact:data:standard:UnqualifiedDataType:100">\n' +
    "  <rsm:ExchangedDocumentContext>\n" +
    "    <ram:GuidelineSpecifiedDocumentContextParameter>\n" +
    "      <ram:ID>urn:cen.eu:en16931:2017#compliant#urn:factur-x.eu:1p0:minimum</ram:ID>\n" +
    "    </ram:GuidelineSpecifiedDocumentContextParameter>\n" +
    "  </rsm:ExchangedDocumentContext>\n" +
    "  <rsm:ExchangedDocument>\n" +
    "    <ram:ID>" +
    escXml(invNum) +
    "</ram:ID>\n" +
    "    <ram:TypeCode>380</ram:TypeCode>\n" +
    "    <ram:IssueDateTime><udt:DateTimeString format=\"102\">" +
    invDate.replace(/-/g, "") +
    "</udt:DateTimeString></ram:IssueDateTime>\n" +
    "    <ram:IncludedNote><ram:Content>" +
    escXml("OperationType=" + opCode) +
    "</ram:Content></ram:IncludedNote>\n" +
    "  </rsm:ExchangedDocument>\n" +
    "  <rsm:SupplyChainTradeTransaction>\n" +
    "    <ram:IncludedSupplyChainTradeLineItem>\n" +
    "      <ram:AssociatedDocumentLineDocument><ram:LineID>1</ram:LineID></ram:AssociatedDocumentLineDocument>\n" +
    "      <ram:SpecifiedTradeProduct><ram:Name>" +
    escXml(desc) +
    "</ram:Name></ram:SpecifiedTradeProduct>\n" +
    "      <ram:SpecifiedLineTradeAgreement>\n" +
    "        <ram:NetPriceProductTradePrice><ram:ChargeAmount>" +
    formatAmount(ht) +
    "</ram:ChargeAmount></ram:NetPriceProductTradePrice>\n" +
    "      </ram:SpecifiedLineTradeAgreement>\n" +
    "      <ram:SpecifiedLineTradeDelivery><ram:BilledQuantity unitCode=\"C62\">1</ram:BilledQuantity></ram:SpecifiedLineTradeDelivery>\n" +
    "      <ram:SpecifiedLineTradeSettlement>\n" +
    "        <ram:ApplicableTradeTax>\n" +
    "          <ram:TypeCode>VAT</ram:TypeCode>\n" +
    "          <ram:CategoryCode>S</ram:CategoryCode>\n" +
    "          <ram:RateApplicablePercent>" +
    formatAmount(vatRate) +
    "</ram:RateApplicablePercent>\n" +
    "        </ram:ApplicableTradeTax>\n" +
    "        <ram:SpecifiedTradeSettlementLineMonetarySummation>\n" +
    "          <ram:LineTotalAmount>" +
    formatAmount(ht) +
    "</ram:LineTotalAmount>\n" +
    "        </ram:SpecifiedTradeSettlementLineMonetarySummation>\n" +
    "      </ram:SpecifiedLineTradeSettlement>\n" +
    "    </ram:IncludedSupplyChainTradeLineItem>\n" +
    "    <ram:ApplicableHeaderTradeAgreement>\n" +
    "      <ram:SellerTradeParty>\n" +
    "        <ram:Name>" +
    escXml(seller.companyName) +
    "</ram:Name>\n" +
    "        <ram:SpecifiedLegalOrganization><ram:ID schemeID=\"0002\">" +
    escXml(sellerSiren) +
    "</ram:ID></ram:SpecifiedLegalOrganization>\n" +
    "        <ram:PostalTradeAddress>\n" +
    "          <ram:PostcodeCode>" +
    escXml(seller.postalCode) +
    "</ram:PostcodeCode>\n" +
    "          <ram:LineOne>" +
    escXml(seller.addressLine1) +
    "</ram:LineOne>\n" +
    "          <ram:CityName>" +
    escXml(seller.city) +
    "</ram:CityName>\n" +
    "          <ram:CountryID>" +
    escXml(seller.countryCode || "FR") +
    "</ram:CountryID>\n" +
    "        </ram:PostalTradeAddress>\n" +
    (seller.vatNumber
      ? "        <ram:SpecifiedTaxRegistration><ram:ID schemeID=\"VA\">" +
        escXml(seller.vatNumber) +
        "</ram:ID></ram:SpecifiedTaxRegistration>\n"
      : "") +
    "      </ram:SellerTradeParty>\n" +
    "      <ram:BuyerTradeParty>\n" +
    "        <ram:Name>" +
    escXml(invoice.buyerName || "") +
    "</ram:Name>\n" +
    "        <ram:SpecifiedLegalOrganization><ram:ID schemeID=\"0002\">" +
    escXml(buyerSiren) +
    "</ram:ID></ram:SpecifiedLegalOrganization>\n" +
    "      </ram:BuyerTradeParty>\n" +
    "    </ram:ApplicableHeaderTradeAgreement>\n" +
    "    <ram:ApplicableHeaderTradeDelivery/>\n" +
    "    <ram:ApplicableHeaderTradeSettlement>\n" +
    "      <ram:InvoiceCurrencyCode>" +
    escXml(currency) +
    "</ram:InvoiceCurrencyCode>\n" +
    "      <ram:ApplicableTradeTax>\n" +
    "        <ram:CalculatedAmount>" +
    formatAmount(tva) +
    "</ram:CalculatedAmount>\n" +
    "        <ram:TypeCode>VAT</ram:TypeCode>\n" +
    "        <ram:BasisAmount>" +
    formatAmount(ht) +
    "</ram:BasisAmount>\n" +
    "        <ram:CategoryCode>S</ram:CategoryCode>\n" +
    "        <ram:RateApplicablePercent>" +
    formatAmount(vatRate) +
    "</ram:RateApplicablePercent>\n" +
    "      </ram:ApplicableTradeTax>\n" +
    "      <ram:SpecifiedTradePaymentTerms>\n" +
    "        <ram:DueDateDateTime><udt:DateTimeString format=\"102\">" +
    due.replace(/-/g, "") +
    "</udt:DateTimeString></ram:DueDateDateTime>\n" +
    "      </ram:SpecifiedTradePaymentTerms>\n" +
    "      <ram:SpecifiedTradeSettlementHeaderMonetarySummation>\n" +
    "        <ram:LineTotalAmount>" +
    formatAmount(ht) +
    "</ram:LineTotalAmount>\n" +
    "        <ram:TaxBasisTotalAmount>" +
    formatAmount(ht) +
    "</ram:TaxBasisTotalAmount>\n" +
    "        <ram:TaxTotalAmount currencyID=\"" +
    escXml(currency) +
    "\">" +
    formatAmount(tva) +
    "</ram:TaxTotalAmount>\n" +
    "        <ram:GrandTotalAmount>" +
    formatAmount(ttc) +
    "</ram:GrandTotalAmount>\n" +
    "        <ram:DuePayableAmount>" +
    formatAmount(ttc) +
    "</ram:DuePayableAmount>\n" +
    "      </ram:SpecifiedTradeSettlementHeaderMonetarySummation>\n" +
    "    </ram:ApplicableHeaderTradeSettlement>\n" +
    "  </rsm:SupplyChainTradeTransaction>\n" +
    "</rsm:CrossIndustryInvoice>\n"
  );
}

function validateIssuePayload(body, seller) {
  const errors = [];
  if (!body || typeof body !== "object") {
    return { ok: false, errors: ["Payload invalide"] };
  }
  if (!isValidSiren(seller.siren)) errors.push("SIREN émetteur invalide (9 chiffres)");
  if (!isValidSiren(body.buyerSiren)) errors.push("SIREN client obligatoire (9 chiffres)");
  if (!body.buyerName) errors.push("Nom du client obligatoire");
  if (!body.invoiceNumber) errors.push("Numéro de facture obligatoire");
  const ht = Number(body.amountHt);
  if (!Number.isFinite(ht) || ht < 0) errors.push("Montant HT invalide");
  return { ok: errors.length === 0, errors: errors };
}

function nextInvoiceNumber(prefix, existingNumbers) {
  const d = new Date();
  const ym = d.getFullYear() + String(d.getMonth() + 1).padStart(2, "0");
  const base = (prefix || "FAC") + "-" + ym + "-";
  let max = 0;
  (existingNumbers || []).forEach(function (n) {
    if (String(n).indexOf(base) === 0) {
      const tail = parseInt(String(n).slice(base.length), 10);
      if (Number.isFinite(tail) && tail > max) max = tail;
    }
  });
  return base + String(max + 1).padStart(4, "0");
}

module.exports = {
  RECEIVE_DEADLINE,
  EMIT_DEADLINE_GE_ETI,
  EMIT_DEADLINE_PME,
  DEFAULT_SETTINGS,
  loadConfigFile,
  loadStackCatalog,
  buildSmartMix,
  applyStackSelection,
  mergeSettings,
  digitsOnly,
  isValidSiren,
  isValidSiret,
  emitDeadlineForSize,
  daysUntil,
  checklistScore,
  readiness,
  buildMandatoryMentions,
  buildCiiXml,
  validateIssuePayload,
  nextInvoiceNumber,
  formatAmount,
  isoDate,
};
