const fs = require("fs");
const path = require("path");

const FORM_CATALOG = [
  {
    id: "mandat_vente_simple",
    label: "Mandat de vente simple",
    category: "mandat",
    desc: "Mandat non exclusif — plusieurs agences possibles.",
    icon: "mandat",
  },
  {
    id: "mandat_vente_exclusif",
    label: "Mandat de vente exclusif",
    category: "mandat",
    desc: "Exclusivité, durée, conditions de rémunération.",
    icon: "mandat",
  },
  {
    id: "mandat_recherche",
    label: "Mandat de recherche (acquéreur)",
    category: "mandat",
    desc: "Recherche de bien selon critères — honoraires à la charge de l'acquéreur.",
    icon: "mandat",
  },
  {
    id: "projet_estimation",
    label: "Projet / avis de valeur",
    category: "estimation",
    desc: "Estimation argumentée, fourchette, comparables, DPE.",
    icon: "estimation",
  },
  {
    id: "dossier_estimation",
    label: "Dossier d'estimation terrain",
    category: "estimation",
    desc: "Checklist visite + données bien pour préparer l'avis.",
    icon: "estimation",
  },
  {
    id: "bon_visite",
    label: "Bon de visite",
    category: "visite",
    desc: "Visite acquéreur — bien, date, honoraires rappelés.",
    icon: "visite",
  },
  {
    id: "registre_visites",
    label: "Registre des visites",
    category: "visite",
    desc: "Tableau à remplir sur le terrain (plusieurs lignes).",
    icon: "visite",
  },
  {
    id: "fiche_prospection",
    label: "Fiche prospection / démarchage",
    category: "prospection",
    desc: "Prise de contact porte-à-porte ou téléphone.",
    icon: "prospection",
  },
  {
    id: "offre_achat",
    label: "Projet d'offre d'achat",
    category: "negociation",
    desc: "Brouillon d'offre — prix, conditions suspensives, délai.",
    icon: "negociation",
  },
  {
    id: "autorisation_photos",
    label: "Autorisation photos & diffusion",
    category: "mandat",
    desc: "Accord propriétaire pour photos, annonces et visites.",
    icon: "mandat",
  },
];

function loadImmoBrandConfig() {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), "config", "immo-brand.json"), "utf8");
    return JSON.parse(raw);
  } catch (e) {
    return {
      companyName: "Leads Opportunities",
      agentName: "",
      tagline: "Negociateur immobilier",
      email: "contact@leadsopportunities.fr",
      orias: "15005935",
      accentColor: "#1d4ed8",
      draftNotice: "Modele brouillon a valider.",
      footerLegal: "Leads Opportunities",
    };
  }
}

function escHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDateFr(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("fr-FR");
  } catch (e) {
    return String(iso);
  }
}

function formatEur(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €";
}

function displayReference(formType, seed) {
  const d = new Date();
  const ym = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, "0");
  const prefix =
    {
      mandat_vente_simple: "MAN-S",
      mandat_vente_exclusif: "MAN-E",
      mandat_recherche: "MAN-R",
      projet_estimation: "EST",
      dossier_estimation: "DOS-EST",
      bon_visite: "VIS",
      registre_visites: "REG-VIS",
      fiche_prospection: "PROS",
      offre_achat: "OFF",
      autorisation_photos: "PHO",
    }[formType] || "DOC";
  const tail = String(seed || d.getTime())
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-4)
    .toUpperCase() || "0000";
  return prefix + "-" + ym + "-" + tail;
}

function parseJsonField(v, fallback) {
  if (v == null || v === "") return fallback;
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch (e) {
    return fallback;
  }
}

function sectionDetails(prop, sectionId) {
  const details = prop.details || parseJsonField(prop.metadata_json, {}).details || {};
  const bucket = details[sectionId];
  return bucket && typeof bucket === "object" ? bucket : {};
}

function buildPrefillFromProperty(prop) {
  if (!prop) return {};
  const mandat = sectionDetails(prop, "mandat");
  const estimation = sectionDetails(prop, "estimation");
  const identite = sectionDetails(prop, "identite");
  const localisation = sectionDetails(prop, "localisation");
  const description = sectionDetails(prop, "description");

  const addr =
    prop.address ||
    [localisation.adresse, localisation.complement_adresse].filter(Boolean).join(", ");
  const ville = [prop.postal_code, prop.city].filter(Boolean).join(" ");

  return {
    reference_bien: prop.id || "",
    titre_bien: prop.title || "",
    type_bien: prop.property_type || "",
    adresse: addr,
    ville: ville,
    surface: prop.surface_m2 != null ? String(prop.surface_m2) : description.surface_habitable || "",
    pieces: prop.rooms != null ? String(prop.rooms) : "",
    chambres: prop.bedrooms != null ? String(prop.bedrooms) : "",
    etage: prop.floor || description.etage || "",
    dpe: prop.dpe || description.dpe || "",
    ges: prop.ges || description.ges || "",
    prix_net: prop.price_net != null ? formatEur(prop.price_net) : "",
    prix_fai: prop.price_fai != null ? formatEur(prop.price_fai) : "",
    honoraires: prop.honoraires != null ? formatEur(prop.honoraires) : mandat.honoraires || "",
    description: prop.description || description.descriptif || "",
    n_mandat: mandat.n_mandat || "",
    date_mandat: mandat.date_mandat || formatDateFr(new Date().toISOString()),
    forme_mandat: mandat.forme_mandat || "",
    duree_mandat: mandat.duree_mandat || "3",
    valeur_estimee: estimation.prix_final_ponderation || estimation.valeur_terrain || "",
    commentaire_estimation: estimation.valoris_details || mandat.commentaire_estimation || "",
    vendeur_nom: identite.nom_proprietaire || identite.nom || "",
    vendeur_prenom: identite.prenom_proprietaire || identite.prenom || "",
    vendeur_email: identite.email_proprietaire || "",
    vendeur_tel: identite.tel_proprietaire || identite.telephone || "",
    vendeur_adresse: identite.adresse_proprietaire || "",
  };
}

function inp(name, prefill, opts) {
  const o = opts || {};
  const w = o.width ? ' style="width:' + o.width + '"' : "";
  const ph = o.placeholder ? ' placeholder="' + escHtml(o.placeholder) + '"' : "";
  return (
    '<input class="immo-fill' +
    (o.short ? " immo-fill-short" : "") +
    '" type="text" name="' +
    escHtml(name) +
    '" value="' +
    escHtml(prefill || "") +
    '"' +
    w +
    ph +
    " />"
  );
}

function num(name, prefill, opts) {
  const o = opts || {};
  return (
    '<input class="immo-fill immo-fill-num" type="text" inputmode="decimal" name="' +
    escHtml(name) +
    '" value="' +
    escHtml(prefill || "") +
    '" />' +
    (o.suffix ? '<span class="immo-suffix">' + escHtml(o.suffix) + "</span>" : "")
  );
}

function area(name, prefill, opts) {
  const o = opts || {};
  const rows = o.rows || 3;
  return (
    '<textarea class="immo-fill immo-fill-area" name="' +
    escHtml(name) +
    '" rows="' +
    rows +
    '">' +
    escHtml(prefill || "") +
    "</textarea>"
  );
}

function chk(name, label, checked) {
  return (
    '<label class="immo-chk"><input type="checkbox" name="' +
    escHtml(name) +
    '"' +
    (checked ? " checked" : "") +
    " /> " +
    escHtml(label) +
    "</label>"
  );
}

function line(label, fieldHtml) {
  return (
    '<div class="immo-line"><span class="immo-lbl">' +
    escHtml(label) +
    '</span><span class="immo-val">' +
    fieldHtml +
    "</span></div>"
  );
}

function sigBlock(who) {
  return (
    '<div class="immo-sig">' +
    "<p><strong>" +
    escHtml(who) +
    "</strong></p>" +
    "<p>Fait à " +
    inp("lieu_signature", "", { short: true, width: "140px" }) +
    ", le " +
    inp("date_signature", formatDateFr(new Date().toISOString()), { short: true, width: "110px" }) +
    "</p>" +
    '<p class="immo-sig-pad">Signature précédée de la mention « Lu et approuvé » :</p>' +
    "</div>"
  );
}

function draftBanner(brand) {
  return (
    '<div class="immo-draft">' +
    escHtml(brand.draftNotice || "Modele brouillon a valider.") +
    "</div>"
  );
}

function renderHeader(brand, meta) {
  return (
    '<header class="immo-header">' +
    '<div class="immo-brand">' +
    "<h1>" +
    escHtml(brand.companyName) +
    "</h1>" +
    (brand.agentName ? "<p class=\"immo-agent\">" + escHtml(brand.agentName) + "</p>" : "") +
    '<p class="immo-tag">' +
    escHtml(brand.tagline || "") +
    "</p>" +
    "</div>" +
    '<div class="immo-meta">' +
  (brand.addressLine ? "<div>" + escHtml(brand.addressLine) + "</div>" : "") +
    '<div><a href="mailto:' +
    escHtml(brand.email) +
    '">' +
    escHtml(brand.email) +
    "</a></div>" +
    (brand.phone ? "<div>" + escHtml(brand.phone) + "</div>" : "") +
    (brand.orias ? "<div>ORIAS " + escHtml(brand.orias) + "</div>" : "") +
    (brand.cartePro ? "<div>Carte pro T " + escHtml(brand.cartePro) + "</div>" : "") +
    "</div></header>" +
    '<div class="immo-title-bar">' +
    "<h2>" +
    escHtml(meta.title) +
    "</h2>" +
    "<span>N° " +
    escHtml(meta.reference) +
    " · " +
    escHtml(meta.date) +
    "</span>" +
    "</div>"
  );
}

function renderFooter(brand, page, total) {
  return (
    '<footer class="immo-footer">' +
    "<span>" +
    escHtml(brand.footerLegal || brand.companyName) +
    "</span>" +
    '<span class="immo-pagenum">' +
    page +
    " / " +
    total +
    "</span></footer>"
  );
}

function legalMandatBlock(brand) {
  return (
    '<div class="immo-legal">' +
    "<p><strong>Mentions légales (à adapter)</strong></p>" +
    "<ul>" +
    "<li>Activité de transaction sur immeubles et fonds de commerce — carte professionnelle délivrée par la CCI.</li>" +
    "<li>Garantie financière : " +
    inp("garantie_financiere", brand.garantieFinanciere || "", { width: "200px" }) +
    " · Assurance RCP : " +
    inp("rcp", brand.rcpInsurer || "", { width: "200px" }) +
    "</li>" +
    "<li>" +
    escHtml(brand.honorairesDefault || "Honoraires communiqués avant toute visite.") +
    "</li>" +
    "<li>DPE et diagnostics obligatoires communiqués selon la réglementation en vigueur.</li>" +
    "<li>Délai de rétractation de 14 jours pour les mandats conclus hors établissement (si applicable).</li>" +
    "<li>" +
    escHtml(brand.mediationClause || brand.mediationClause) +
    " Médiateur : " +
    inp("mediateur", brand.mediateur || "", { width: "220px" }) +
    "</li>" +
    "</ul></div>"
  );
}

function renderMandatVenteSimple(p, brand, meta) {
  const total = 2;
  const page1 =
    '<section class="immo-page">' +
    renderHeader(brand, meta) +
    draftBanner(brand) +
    "<p>Le mandant confie au mandataire ci-dessus un <strong>mandat simple de vente</strong> sans exclusivité, pour le bien désigné ci-après.</p>" +
    "<h3>1. Le mandant (vendeur)</h3>" +
    line("Nom", inp("vendeur_nom", p.vendeur_nom)) +
    line("Prénom", inp("vendeur_prenom", p.vendeur_prenom)) +
    line("Adresse", inp("vendeur_adresse", p.vendeur_adresse)) +
    line("E-mail", inp("vendeur_email", p.vendeur_email)) +
    line("Téléphone", inp("vendeur_tel", p.vendeur_tel)) +
    "<h3>2. Le bien à vendre</h3>" +
    line("Adresse", inp("adresse", p.adresse)) +
    line("Commune", inp("ville", p.ville)) +
    line("Type", inp("type_bien", p.type_bien)) +
    line("Surface", num("surface", p.surface, { suffix: "m²" })) +
    line("Pièces / chambres", inp("pieces", p.pieces, { width: "60px" }) + " / " + inp("chambres", p.chambres, { width: "60px" })) +
    line("Étage", inp("etage", p.etage, { short: true })) +
    line("Référence interne", inp("reference_bien", p.reference_bien, { short: true })) +
    "<h3>3. Prix et honoraires</h3>" +
    line("Prix net vendeur", inp("prix_net", p.prix_net)) +
    line("Prix FAI (si applicable)", inp("prix_fai", p.prix_fai)) +
    line("Honoraires TTC", inp("honoraires", p.honoraires)) +
    line("Honoraires à la charge de", inp("honoraires_charge", "Acquéreur", { width: "160px" })) +
    line("Durée du mandat", num("duree_mandat", p.duree_mandat || "3", { suffix: "mois" })) +
    line("N° mandat", inp("n_mandat", p.n_mandat)) +
    renderFooter(brand, 1, total) +
    "</section>";

  const page2 =
    '<section class="immo-page">' +
    renderHeader(brand, meta) +
    "<h3>4. Missions du mandataire</h3>" +
    "<p>Le mandataire est chargé de : présenter le bien, organiser les visites, recevoir les offres, conseiller le mandant et faciliter la vente jusqu'à la signature de l'acte authentique.</p>" +
    area("missions_complement", "", { rows: 4 }) +
    "<h3>5. Engagements du mandant</h3>" +
    "<ul class='immo-list-check'>" +
    "<li>" + chk("eng_info", "Fournir les informations exactes sur le bien et les diagnostics", true) + "</li>" +
    "<li>" + chk("eng_honoraires", "Avoir été informé du montant des honoraires avant signature", true) + "</li>" +
    "<li>" + chk("eng_autres_agences", "Accepte que d'autres professionnels puissent également présenter le bien (mandat simple)", true) + "</li>" +
    "</ul>" +
    legalMandatBlock(brand) +
    '<div class="immo-sigs">' +
    sigBlock("Le mandant") +
    sigBlock("Le mandataire") +
    "</div>" +
    renderFooter(brand, 2, total) +
    "</section>";

  return page1 + page2;
}

function renderMandatVenteExclusif(p, brand, meta) {
  const total = 3;
  const page1 =
    '<section class="immo-page">' +
    renderHeader(brand, meta) +
    draftBanner(brand) +
    "<p>Le mandant confie au mandataire un <strong>mandat exclusif de vente</strong> pour la durée et le bien indiqués ci-dessous.</p>" +
    "<h3>1. Mandant</h3>" +
    line("Nom / prénom", inp("vendeur_nom", p.vendeur_nom) + " " + inp("vendeur_prenom", p.vendeur_prenom)) +
    line("Coordonnées", inp("vendeur_tel", p.vendeur_tel) + " · " + inp("vendeur_email", p.vendeur_email)) +
    line("Adresse", inp("vendeur_adresse", p.vendeur_adresse)) +
    "<h3>2. Bien</h3>" +
    line("Adresse complète", inp("adresse", p.adresse) + ", " + inp("ville", p.ville)) +
    line("Descriptif", inp("type_bien", p.type_bien) + " — " + num("surface", p.surface, { suffix: "m²" }) + " — " + inp("pieces", p.pieces, { width: "40px" }) + " p.") +
    line("DPE / GES", "DPE " + inp("dpe", p.dpe, { width: "50px" }) + " · GES " + inp("ges", p.ges, { width: "50px" })) +
    renderFooter(brand, 1, total) +
    "</section>";

  const page2 =
    '<section class="immo-page">' +
    renderHeader(brand, meta) +
    "<h3>3. Prix de vente et rémunération</h3>" +
    line("Prix de mise en vente FAI", inp("prix_fai", p.prix_fai)) +
    line("Prix net vendeur", inp("prix_net", p.prix_net)) +
    line("Honoraires TTC", inp("honoraires", p.honoraires)) +
    line("À la charge de", inp("honoraires_charge", "Acquéreur")) +
    line("Taux honoraires", num("taux_honoraires", "", { suffix: "%" })) +
    "<h3>4. Exclusivité</h3>" +
    "<p>Pendant " + num("duree_mandat", p.duree_mandat || "3", { suffix: "mois" }) + " à compter du " + inp("date_mandat", p.date_mandat, { width: "110px" }) + ", le mandant s'engage à ne confier la vente qu'au mandataire et à transmettre toute offre reçue directement.</p>" +
    area("clause_exclusivite", "En cas de vente réalisée pendant la durée du mandat ou dans un délai de X mois après son terme à un acquéreur présenté par le mandataire, les honoraires sont dus intégralement.", { rows: 3 }) +
    "<h3>5. Actions autorisées</h3>" +
    chk("pub_panneau", "Panneau « À vendre »", true) +
    chk("pub_web", "Diffusion internet et portails", true) +
    chk("pub_photos", "Prises de vues et visite virtuelle", true) +
    renderFooter(brand, 2, total) +
    "</section>";

  const page3 =
    '<section class="immo-page">' +
    renderHeader(brand, meta) +
    legalMandatBlock(brand) +
    line("N° mandat", inp("n_mandat", p.n_mandat)) +
    '<div class="immo-sigs">' +
    sigBlock("Le mandant") +
    sigBlock("Le mandataire") +
    "</div>" +
    renderFooter(brand, 3, total) +
    "</section>";

  return page1 + page2 + page3;
}

function renderMandatRecherche(p, brand, meta) {
  const total = 2;
  return (
    '<section class="immo-page">' +
    renderHeader(brand, meta) +
    draftBanner(brand) +
    "<p>Le mandant (acquéreur) confie au mandataire une <strong>recherche de bien</strong> selon les critères ci-dessous.</p>" +
    "<h3>1. Mandant acquéreur</h3>" +
    line("Nom", inp("acquereur_nom", "")) +
    line("Prénom", inp("acquereur_prenom", "")) +
    line("Adresse", inp("acquereur_adresse", "")) +
    line("E-mail / tél.", inp("acquereur_email", "") + " · " + inp("acquereur_tel", "")) +
    "<h3>2. Critères de recherche</h3>" +
    line("Type de bien", inp("crit_type", p.type_bien || "Appartement / Maison")) +
    line("Secteur géographique", inp("crit_secteur", p.ville || "Grand Nancy, Meurthe")) +
    line("Budget max.", inp("crit_budget", p.prix_fai || "")) +
    line("Surface min.", num("crit_surface", p.surface, { suffix: "m²" })) +
    line("Pièces min.", inp("crit_pieces", p.pieces)) +
    area("crit_details", "Garage, jardin, étage, état, proximité transports…", { rows: 4 }) +
    "<h3>3. Honoraires</h3>" +
    "<p>En cas de acquisition d'un bien présenté par le mandataire, honoraires de " + inp("honoraires_pct", "3", { width: "50px" }) + " % TTC du prix ou forfait de " + inp("honoraires_forfait", p.honoraires) + " €, à la charge de l'acquéreur.</p>" +
    line("Durée", num("duree_mandat", "3", { suffix: "mois" })) +
    legalMandatBlock(brand) +
    '<div class="immo-sigs">' +
    sigBlock("Le mandant acquéreur") +
    sigBlock("Le mandataire") +
    "</div>" +
    renderFooter(brand, 1, total) +
    "</section>" +
    '<section class="immo-page">' +
    renderHeader(brand, meta) +
    "<h3>4. Biens visités (à compléter)</h3>" +
    '<table class="immo-table"><thead><tr><th>Date</th><th>Adresse</th><th>Prix</th><th>Visite</th><th>Signature</th></tr></thead><tbody>' +
    [1, 2, 3, 4, 5, 6]
      .map(function () {
        return "<tr><td>" + inp("vis_date", "", { width: "80px" }) + "</td><td>" + inp("vis_addr", "") + "</td><td>" + inp("vis_prix", "", { width: "80px" }) + "</td><td>" + inp("vis_ok", "", { width: "40px" }) + "</td><td></td></tr>";
      })
      .join("") +
    "</tbody></table>" +
    renderFooter(brand, 2, total) +
    "</section>"
  );
}

function renderProjetEstimation(p, brand, meta) {
  const total = 2;
  const page1 =
    '<section class="immo-page">' +
    renderHeader(brand, meta) +
    draftBanner(brand) +
    "<p><strong>Avis de valeur / projet d'estimation</strong> — document non contractuel, établi à titre indicatif à la date du " + inp("date_visite", formatDateFr(new Date().toISOString()), { width: "110px" }) + ".</p>" +
    "<h3>1. Identification du bien</h3>" +
    line("Adresse", inp("adresse", p.adresse)) +
    line("Commune", inp("ville", p.ville)) +
    line("Type", inp("type_bien", p.type_bien)) +
    line("Surface habitable", num("surface", p.surface, { suffix: "m²" })) +
    line("Terrain / annexe", inp("annexes", "")) +
    line("Année construction", inp("annee_construction", "")) +
    line("État général", inp("etat_general", "Bon / À rafraîchir / Travaux")) +
    line("DPE / GES", inp("dpe", p.dpe) + " / " + inp("ges", p.ges)) +
    "<h3>2. Contexte de marché</h3>" +
    area("contexte_marche", "Demande locale, délais de vente, quartier, proximité commodités (Grand Nancy, vallée de la Meurthe…)", { rows: 4 }) +
    renderFooter(brand, 1, total) +
    "</section>";

  const page2 =
    '<section class="immo-page">' +
    renderHeader(brand, meta) +
    "<h3>3. Fourchette de valeur</h3>" +
    '<table class="immo-table immo-table-est">' +
    "<tr><th>Estimation basse</th><td>" + inp("est_basse", "", { width: "120px" }) + " €</td></tr>" +
    "<tr><th>Estimation médiane</th><td>" + inp("est_mediane", p.valeur_estimee || p.prix_fai || "", { width: "120px" }) + " €</td></tr>" +
    "<tr><th>Estimation haute</th><td>" + inp("est_haute", "", { width: "120px" }) + " €</td></tr>" +
    "<tr><th>Prix net vendeur conseillé</th><td>" + inp("prix_net", p.prix_net, { width: "120px" }) + "</td></tr>" +
    "<tr><th>Prix FAI conseillé</th><td>" + inp("prix_fai", p.prix_fai, { width: "120px" }) + "</td></tr>" +
    "</table>" +
    "<h3>4. Comparables</h3>" +
    '<table class="immo-table"><thead><tr><th>Réf.</th><th>Adresse</th><th>Surface</th><th>Prix</th><th>€/m²</th></tr></thead><tbody>' +
    [1, 2, 3]
      .map(function (i) {
        return "<tr><td>" + inp("comp" + i + "_ref", "") + "</td><td>" + inp("comp" + i + "_addr", "") + "</td><td>" + inp("comp" + i + "_surf", "", { width: "50px" }) + "</td><td>" + inp("comp" + i + "_prix", "", { width: "80px" }) + "</td><td>" + inp("comp" + i + "_pm2", "", { width: "60px" }) + "</td></tr>";
      })
      .join("") +
    "</tbody></table>" +
    "<h3>5. Commentaires & suite</h3>" +
    area("commentaire", p.commentaire_estimation || "Travaux éventuels, plus-value, délai de commercialisation recommandé…", { rows: 5 }) +
    "<p class='immo-muted'>Cette estimation ne constitue pas un engagement de vente. Validité : " + num("validite_jours", "30", { suffix: "jours" }) + ".</p>" +
    '<div class="immo-sigs">' +
    sigBlock("Le propriétaire (prise de connaissance)") +
    sigBlock("Le négociateur") +
    "</div>" +
    renderFooter(brand, 2, total) +
    "</section>";

  return page1 + page2;
}

function renderDossierEstimation(p, brand, meta) {
  const checks = [
    "Accès et environnement (bruit, commerces, écoles)",
    "Façade / toiture / menuiseries",
    "Pièces principales (luminosité, agencement)",
    "Cuisine / salles d'eau",
    "Chauffage / ECS / électricité",
    "DPE / diagnostics connus",
    "Stationnement / garage / cave",
    "Jardin / terrasse / copropriété",
    "Travaux identifiés",
    "Photos réalisées",
  ];
  return (
    '<section class="immo-page">' +
    renderHeader(brand, meta) +
    draftBanner(brand) +
    "<p><strong>Dossier terrain</strong> — compléter lors de la visite pour préparer l'avis de valeur.</p>" +
    line("Propriétaire", inp("vendeur_nom", p.vendeur_nom) + " " + inp("vendeur_prenom", p.vendeur_prenom)) +
    line("Téléphone", inp("vendeur_tel", p.vendeur_tel)) +
    line("Bien", inp("adresse", p.adresse) + ", " + inp("ville", p.ville)) +
    line("Contact visite", inp("contact_visite", "")) +
    "<h3>Checklist visite</h3><ul class='immo-checklist'>" +
    checks
      .map(function (c, i) {
        return "<li>" + chk("chk_" + i, c, false) + " — Notes : " + inp("note_" + i, "", { width: "200px" }) + "</li>";
      })
      .join("") +
    "</ul>" +
    "<h3>Mesures & données</h3>" +
    line("Surface carrez / habitable", num("surface", p.surface, { suffix: "m²" })) +
    line("Surface terrain", num("surface_terrain", "", { suffix: "m²" })) +
    line("Taxe foncière", inp("taxe_fonciere", "")) +
    line("Charges copro / an", inp("charges_copro", "")) +
    area("observations", "", { rows: 6 }) +
    renderFooter(brand, 1, 1) +
    "</section>"
  );
}

function renderBonVisite(p, brand, meta) {
  return (
    '<section class="immo-page">' +
    renderHeader(brand, meta) +
    draftBanner(brand) +
    "<p>Je soussigné(e), <strong>visiteur / acquéreur</strong> :</p>" +
    line("Nom", inp("visiteur_nom", "")) +
    line("Prénom", inp("visiteur_prenom", "")) +
    line("Adresse", inp("visiteur_adresse", "")) +
    line("E-mail", inp("visiteur_email", "")) +
    line("Téléphone", inp("visiteur_tel", "")) +
    "<p>Reconnais avoir visité ce jour le bien suivant, présenté par le mandataire :</p>" +
    line("Adresse du bien", inp("adresse", p.adresse) + ", " + inp("ville", p.ville)) +
    line("Référence", inp("reference_bien", p.reference_bien)) +
    line("Prix affiché FAI", inp("prix_fai", p.prix_fai)) +
    line("Date et heure", inp("date_visite", formatDateFr(new Date().toISOString())) + " " + inp("heure_visite", "")) +
    "<p class='immo-alert'>J'ai été informé(e) que les honoraires de négociation s'élèvent à <strong>" + inp("honoraires", p.honoraires || "—") + "</strong> € TTC, à la charge de <strong>" + inp("honoraires_charge", "l'acquéreur") + "</strong>, et qu'en cas d'acquisition de ce bien par mon intermédiaire ou celui de mes ayants droit, ces honoraires seront dus.</p>" +
    area("commentaire_visite", "Commentaires / points notés", { rows: 3 }) +
    sigBlock("Le visiteur") +
    sigBlock("Le négociateur") +
    renderFooter(brand, 1, 1) +
    "</section>"
  );
}

function renderRegistreVisites(p, brand, meta) {
  const rows = [];
  for (var i = 0; i < 12; i++) {
    rows.push(
      "<tr><td>" + inp("r" + i + "_date", "", { width: "75px" }) + "</td><td>" + inp("r" + i + "_bien", p.adresse || "", { width: "140px" }) + "</td><td>" + inp("r" + i + "_visiteur", "") + "</td><td>" + inp("r" + i + "_tel", "", { width: "90px" }) + "</td><td>" + inp("r" + i + "_hon", "", { width: "60px" }) + "</td><td></td></tr>"
    );
  }
  return (
    '<section class="immo-page immo-page-landscape">' +
    renderHeader(brand, meta) +
    "<h3>Registre des visites — " + inp("periode", new Date().getFullYear().toString()) + "</h3>" +
    '<table class="immo-table immo-table-reg"><thead><tr><th>Date</th><th>Bien / adresse</th><th>Visiteur</th><th>Tél.</th><th>Honoraires rappelés</th><th>Signature</th></tr></thead><tbody>' +
    rows.join("") +
    "</tbody></table>" +
    renderFooter(brand, 1, 1) +
    "</section>"
  );
}

function renderFicheProspection(p, brand, meta) {
  return (
    '<section class="immo-page">' +
    renderHeader(brand, meta) +
    "<h3>Fiche prospection terrain</h3>" +
    line("Date", inp("date_prospection", formatDateFr(new Date().toISOString()))) +
    line("Secteur / rue", inp("secteur", p.ville || "Dombasle, Varangéville, Lunéville…")) +
    line("Prospect — nom", inp("prospect_nom", p.vendeur_nom)) +
    line("Téléphone", inp("prospect_tel", p.vendeur_tel)) +
    line("E-mail", inp("prospect_email", p.vendeur_email)) +
    line("Adresse bien", inp("adresse", p.adresse)) +
    "<h3>Qualification</h3>" +
    chk("intention_vente", "Intention de vente < 6 mois", false) +
    chk("intention_estimation", "Souhaite une estimation", true) +
    chk("intention_mandat", "Ouvert à un mandat", false) +
    chk("deja_en_ligne", "Déjà en vente (agence / PAP)", false) +
    line("Prix attendu", inp("prix_attendu", "")) +
    line("Délai projet", inp("delai_projet", "")) +
    area("notes", "Argumentaire, objections, rappel prévu…", { rows: 6 }) +
    line("Prochaine action", inp("next_action", "Rappel / RDV estimation")) +
    line("Date rappel", inp("date_rappel", "")) +
    renderFooter(brand, 1, 1) +
    "</section>"
  );
}

function renderOffreAchat(p, brand, meta) {
  const total = 2;
  return (
    '<section class="immo-page">' +
    renderHeader(brand, meta) +
    draftBanner(brand) +
    "<p><strong>Projet d'offre d'achat</strong> — sous réserve d'acceptation du vendeur et de conditions suspensives.</p>" +
    "<h3>1. Acquéreur</h3>" +
    line("Nom / prénom", inp("acquereur_nom", "") + " " + inp("acquereur_prenom", "")) +
    line("Adresse", inp("acquereur_adresse", "")) +
    line("Coordonnées", inp("acquereur_tel", "") + " · " + inp("acquereur_email", "")) +
    "<h3>2. Bien</h3>" +
    line("Adresse", inp("adresse", p.adresse) + ", " + inp("ville", p.ville)) +
    line("Référence", inp("reference_bien", p.reference_bien)) +
    "<h3>3. Prix proposé</h3>" +
    line("Offre FAI", inp("offre_prix", p.prix_fai, { width: "120px" }) + " €") +
    line("Dont honoraires", inp("offre_honoraires", p.honoraires)) +
    line("Validité offre", inp("offre_validite", "10 jours")) +
    renderFooter(brand, 1, total) +
    "</section>" +
    '<section class="immo-page">' +
    renderHeader(brand, meta) +
    "<h3>4. Conditions suspensives</h3>" +
    chk("cs_pret", "Obtention d'un prêt", true) +
    chk("cs_vente", "Vente d'un autre bien", false) +
    chk("cs_diagnostics", "Diagnostics conformes", true) +
    area("cs_autres", "Autres conditions…", { rows: 3 }) +
    "<h3>5. Financement</h3>" +
    line("Apport", inp("fin_apport", "")) +
    line("Montant emprunt", inp("fin_emprunt", "")) +
    line("Banque / courtier", inp("fin_courtier", "Leads Opportunities — financement")) +
    '<div class="immo-sigs">' +
    sigBlock("L'acquéreur") +
    sigBlock("Le négociateur (remise au vendeur)") +
    "</div>" +
    renderFooter(brand, 2, total) +
    "</section>"
  );
}

function renderAutorisationPhotos(p, brand, meta) {
  return (
    '<section class="immo-page">' +
    renderHeader(brand, meta) +
  draftBanner(brand) +
    "<p>Je soussigné(e), propriétaire du bien situé " + inp("adresse", p.adresse) + ", " + inp("ville", p.ville) + ", autorise le mandataire à :</p>" +
    "<ul class='immo-list-check'>" +
    "<li>" + chk("auth_photo", "Réaliser des photographies et vidéos", true) + "</li>" +
    "<li>" + chk("auth_annonces", "Diffuser une annonce (portails, réseaux, vitrine)", true) + "</li>" +
    "<li>" + chk("auth_visites", "Organiser des visites", true) + "</li>" +
    "<li>" + chk("auth_panneau", "Installer un panneau « À vendre »", false) + "</li>" +
    "</ul>" +
    line("Durée autorisation", inp("duree_auth", "Durée du mandat")) +
    area("restrictions", "Restrictions (pièces à ne pas photographier, horaires visites…)", { rows: 3 }) +
    '<div class="immo-sigs">' +
    sigBlock("Le propriétaire") +
    sigBlock("Le mandataire") +
    "</div>" +
    renderFooter(brand, 1, 1) +
    "</section>"
  );
}

const RENDERERS = {
  mandat_vente_simple: renderMandatVenteSimple,
  mandat_vente_exclusif: renderMandatVenteExclusif,
  mandat_recherche: renderMandatRecherche,
  projet_estimation: renderProjetEstimation,
  dossier_estimation: renderDossierEstimation,
  bon_visite: renderBonVisite,
  registre_visites: renderRegistreVisites,
  fiche_prospection: renderFicheProspection,
  offre_achat: renderOffreAchat,
  autorisation_photos: renderAutorisationPhotos,
};

function buildDocumentModel(formType, options) {
  const opts = options || {};
  const brand = opts.brand || loadImmoBrandConfig();
  const catalog = FORM_CATALOG.find(function (f) {
    return f.id === formType;
  });
  if (!catalog) return null;

  const prefill = Object.assign({}, buildPrefillFromProperty(opts.property), opts.prefill || {});
  const reference = opts.reference || displayReference(formType, opts.property && opts.property.id);

  return {
    formType,
    brand,
    prefill,
    meta: {
      title: catalog.label,
      reference,
      date: formatDateFr(opts.date || new Date().toISOString()),
      category: catalog.category,
    },
  };
}

function renderDocumentHtml(model) {
  if (!model) return "";
  const renderer = RENDERERS[model.formType];
  if (!renderer) return "<p>Formulaire inconnu</p>";

  const brand = model.brand;
  const accent = brand.accentColor || "#1d4ed8";
  const body = renderer(model.prefill, brand, model.meta);
  const styles =
    "<style>:root{--immo-accent:" +
    accent +
    ";--immo-accent-dark:" +
    (brand.accentDark || accent) +
    ";}" +
    getDocumentStyles() +
    "</style>";

  return (
    '<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"/>' +
    "<title>" +
    escHtml(model.meta.title) +
    " — " +
    escHtml(brand.companyName) +
    "</title>" +
    styles +
    '</head><body class="immo-doc">' +
    body +
    "</body></html>"
  );
}

function getDocumentStyles() {
  return `
.immo-doc{margin:0;font-family:Inter,Segoe UI,Arial,sans-serif;font-size:11pt;color:#0f172a;background:#fff}
.immo-page{max-width:820px;margin:0 auto;padding:24px 28px 48px;page-break-after:always;min-height:100vh;box-sizing:border-box;position:relative}
.immo-page:last-child{page-break-after:auto}
.immo-page-landscape{max-width:1000px}
.immo-header{display:flex;justify-content:space-between;gap:16px;border-bottom:3px solid var(--immo-accent);padding-bottom:12px;margin-bottom:10px}
.immo-brand h1{margin:0;font-size:1.35rem;color:var(--immo-accent)}
.immo-agent{margin:2px 0 0;font-weight:700;font-size:.95rem}
.immo-tag{margin:4px 0 0;font-size:.82rem;color:#64748b;font-style:italic}
.immo-meta{text-align:right;font-size:.75rem;color:#64748b;line-height:1.45}
.immo-meta a{color:#64748b;text-decoration:none}
.immo-title-bar{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:8px;margin:12px 0 16px;padding:8px 12px;background:#f1f5f9;border-radius:6px}
.immo-title-bar h2{margin:0;font-size:1.05rem;color:var(--immo-accent-dark)}
.immo-title-bar span{font-size:.78rem;color:#64748b}
.immo-draft{background:#fef3c7;border:1px solid #f59e0b;color:#92400e;padding:8px 12px;border-radius:6px;font-size:.78rem;margin-bottom:14px;line-height:1.4}
.immo-doc h3{font-size:.88rem;color:var(--immo-accent-dark);margin:16px 0 8px;text-transform:uppercase;letter-spacing:.03em}
.immo-line{display:grid;grid-template-columns:160px 1fr;gap:8px 12px;padding:5px 0;border-bottom:1px solid #e2e8f0;align-items:baseline;font-size:.88rem}
.immo-lbl{color:#64748b;font-weight:600}
.immo-val{display:flex;flex-wrap:wrap;align-items:center;gap:4px}
.immo-fill{border:none;border-bottom:1px dashed #94a3b8;background:#f8fafc;font:inherit;font-size:.88rem;padding:3px 6px;min-width:140px;flex:1;max-width:100%;border-radius:2px}
.immo-fill:focus{outline:2px solid var(--immo-accent);background:#fff}
.immo-fill-short{min-width:80px;flex:0 1 auto}
.immo-fill-num{min-width:70px;max-width:120px;flex:0 1 auto;text-align:right}
.immo-fill-area{width:100%;min-height:60px;resize:vertical;line-height:1.45;border:1px dashed #cbd5e1;border-radius:4px;padding:8px}
.immo-suffix{font-size:.82rem;color:#64748b;margin-left:2px}
.immo-chk{display:inline-flex;align-items:center;gap:6px;font-size:.86rem;margin:4px 12px 4px 0;cursor:pointer}
.immo-chk input{width:14px;height:14px;accent-color:var(--immo-accent)}
.immo-list-check{list-style:none;padding:0;margin:8px 0}
.immo-list-check li{margin:6px 0}
.immo-checklist{list-style:none;padding:0;font-size:.86rem}
.immo-checklist li{margin:8px 0;padding:6px 0;border-bottom:1px dotted #e2e8f0}
.immo-table{width:100%;border-collapse:collapse;margin:10px 0;font-size:.82rem}
.immo-table th,.immo-table td{border:1px solid #cbd5e1;padding:6px 8px;text-align:left;vertical-align:top}
.immo-table th{background:#f1f5f9;font-weight:700}
.immo-table .immo-fill{min-width:60px;font-size:.8rem;padding:2px 4px}
.immo-table-est th{width:45%}
.immo-legal{font-size:.76rem;color:#475569;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px 12px;margin:14px 0}
.immo-legal ul{margin:6px 0;padding-left:1.1rem}
.immo-alert{border-left:4px solid var(--immo-accent);padding:10px 12px;background:#eff6ff;font-size:.84rem;margin:12px 0}
.immo-muted{font-size:.78rem;color:#94a3b8;font-style:italic}
.immo-sigs{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:20px}
.immo-sig{border:1px solid #e2e8f0;border-radius:6px;padding:12px;min-height:100px;font-size:.82rem}
.immo-sig-pad{margin-top:40px;color:#94a3b8;font-size:.75rem}
.immo-footer{position:absolute;left:28px;right:28px;bottom:16px;display:flex;justify-content:space-between;font-size:.7rem;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:8px}
@media print{
  .immo-fill{background:transparent!important;border-bottom:1px solid #334155}
  .immo-fill-area{border:1px solid #94a3b8}
  .immo-draft{background:#fff;border:1px solid #999}
  .immo-page{padding:14mm 12mm 20mm;min-height:auto}
  .immo-footer{position:fixed;bottom:8mm}
  @page{margin:10mm}
}
`;
}

module.exports = {
  FORM_CATALOG,
  loadImmoBrandConfig,
  buildPrefillFromProperty,
  buildDocumentModel,
  renderDocumentHtml,
  displayReference,
};
