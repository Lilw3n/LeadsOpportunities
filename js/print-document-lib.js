/**
 * Documents papier / PDF — mise en page client (Imprimer → Enregistrer en PDF).
 * Navigateur + Node (tests).
 */
(function (root) {
  var BRAND = {
    companyName: "Leads Opportunities",
    tagline: "Courtier en assurance",
    email: "contact@leadsopportunities.fr",
    website: "https://www.leadsopportunities.fr",
    orias: "15005935",
    accent: "#0d9488",
    accentDark: "#0f766e",
    footerLegal: "Leads Opportunities — Courtier en assurance — ORIAS 15005935",
  };

  var KIND_LABELS = {
    questionnaire: "Questionnaire",
    interlocuteur: "Fiche interlocuteur",
    mandat: "Document immobilier",
    estimation: "Estimation",
    projection: "Projection d'achat",
    bien: "Fiche bien",
    listing: "Listing de biens",
    devis: "Devis",
    contrat: "Contrat",
    avenant: "Avenant",
    bordereau: "Bordereau tarifaire",
    sinistre: "Sinistre",
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function todayFr() {
    try {
      return new Date().toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }

  function flattenValue(v) {
    if (v == null || v === "") return "";
    if (Array.isArray(v)) return v.filter(Boolean).join(", ");
    if (typeof v === "object") {
      try {
        return JSON.stringify(v);
      } catch (e) {
        return String(v);
      }
    }
    return String(v);
  }

  function row(label, value) {
    var v = flattenValue(value);
    if (!v) return "";
    return (
      '<div class="lop-row"><span class="lop-label">' +
      esc(label) +
      '</span><span class="lop-value">' +
      esc(v) +
      "</span></div>"
    );
  }

  function rowsHtml(rows) {
    if (!rows || !rows.length) return '<p class="lop-muted">Aucune information renseignée.</p>';
    return rows
      .map(function (r) {
        return row(r.label || r.key, r.value);
      })
      .filter(Boolean)
      .join("");
  }

  function section(title, innerHtml) {
    if (!innerHtml) return "";
    return (
      '<section class="lop-section"><h2>' +
      esc(title) +
      "</h2>" +
      innerHtml +
      "</section>"
    );
  }

  function kpisHtml(items) {
    if (!items || !items.length) return "";
    return (
      '<div class="lop-kpis">' +
      items
        .map(function (k) {
          return (
            '<div class="lop-kpi"><span>' +
            esc(k.label) +
            "</span><strong>" +
            esc(k.value) +
            "</strong></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function note(text) {
    if (!text) return "";
    return '<p class="lop-note">' + esc(text) + "</p>";
  }

  function prose(text) {
    if (!text) return "";
    return '<div class="lop-prose">' + esc(text).replace(/\n/g, "<br>") + "</div>";
  }

  function tableHtml(headers, rows) {
    if (!rows || !rows.length) return "";
    return (
      '<table class="lop-table"><thead><tr>' +
      headers
        .map(function (h) {
          return "<th>" + esc(h) + "</th>";
        })
        .join("") +
      "</tr></thead><tbody>" +
      rows
        .map(function (r) {
          return (
            "<tr>" +
            r
              .map(function (c) {
                return "<td>" + esc(c) + "</td>";
              })
              .join("") +
            "</tr>"
          );
        })
        .join("") +
      "</tbody></table>"
    );
  }

  function css() {
    return (
      ":root{--lop:" +
      BRAND.accent +
      ";--lop-dark:" +
      BRAND.accentDark +
      "}" +
      "html,body{margin:0;padding:0;background:#e2e8f0}" +
      ".lop-toolbar{position:sticky;top:0;z-index:2;display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;padding:12px 18px;background:#0f172a;color:#fff;font-family:Inter,Arial,sans-serif;font-size:.88rem}" +
      ".lop-toolbar p{margin:0;max-width:42rem;line-height:1.4;color:#cbd5e1}" +
      ".lop-toolbar button{border:0;background:#0d9488;color:#fff;font-weight:700;padding:8px 14px;border-radius:8px;cursor:pointer}" +
      ".lop-sheet{max-width:820px;margin:18px auto 40px;background:#fff;color:#0f172a;font-family:Inter,Arial,sans-serif;padding:36px 40px 48px;box-shadow:0 18px 50px rgba(15,23,42,.12);min-height:1000px;box-sizing:border-box}" +
      ".lop-header{display:flex;justify-content:space-between;gap:20px;border-bottom:4px solid var(--lop);padding-bottom:14px;margin-bottom:14px}" +
      ".lop-logo{margin:0;font-size:1.45rem;color:var(--lop);letter-spacing:.04em;text-transform:uppercase}" +
      ".lop-tag{margin:4px 0 0;font-style:italic;color:var(--lop-dark);font-size:.92rem}" +
      ".lop-contact{text-align:right;font-size:.78rem;color:#64748b;line-height:1.5}" +
      ".lop-kind{display:inline-block;background:var(--lop);color:#fff;font-size:.72rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:5px 10px;border-radius:4px;margin-bottom:8px}" +
      ".lop-title{margin:0 0 4px;font-size:1.55rem;line-height:1.2}" +
      ".lop-sub{margin:0 0 16px;color:#64748b;font-size:.92rem}" +
      ".lop-meta{display:flex;flex-wrap:wrap;gap:8px 16px;font-size:.8rem;color:#475569;margin-bottom:20px}" +
      ".lop-section{margin:22px 0 0}" +
      ".lop-section h2{margin:0 0 10px;padding-bottom:6px;border-bottom:2px solid var(--lop);color:var(--lop-dark);font-size:.86rem;letter-spacing:.05em;text-transform:uppercase}" +
      ".lop-row{display:grid;grid-template-columns:210px 1fr;gap:12px;padding:8px 0;border-bottom:1px solid #e2e8f0;font-size:.9rem}" +
      ".lop-label{color:#64748b;font-weight:600}" +
      ".lop-value{color:#0f172a}" +
      ".lop-muted{color:#94a3b8;font-style:italic}" +
      ".lop-kpis{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin:8px 0 18px}" +
      ".lop-kpi{background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;padding:12px 14px}" +
      ".lop-kpi span{display:block;font-size:.72rem;color:#0f766e;text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px}" +
      ".lop-kpi strong{font-size:1.15rem}" +
      ".lop-note{font-size:.82rem;color:#64748b;line-height:1.5;margin:12px 0 0}" +
      ".lop-prose{font-size:.92rem;line-height:1.65;white-space:pre-wrap;margin:8px 0}" +
      ".lop-table{width:100%;border-collapse:collapse;margin:8px 0 0;font-size:.86rem}" +
      ".lop-table th,.lop-table td{padding:8px 10px;border:1px solid #e2e8f0;text-align:left}" +
      ".lop-table th{background:#f8fafc;font-size:.75rem;text-transform:uppercase;letter-spacing:.03em;color:#64748b}" +
      ".lop-footer{margin-top:36px;padding-top:12px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;gap:12px;font-size:.72rem;color:#94a3b8}" +
      ".lop-disclaimer{margin-top:18px;font-size:.78rem;color:#64748b;line-height:1.5}" +
      "@media print{html,body{background:#fff}.lop-toolbar{display:none!important}.lop-sheet{margin:0;box-shadow:none;max-width:none;min-height:auto;padding:14mm 14mm 18mm}@page{margin:12mm}}"
    );
  }

  function renderHtml(opts) {
    opts = opts || {};
    var kind = opts.kind || "document";
    var kindLabel = opts.kindLabel || KIND_LABELS[kind] || "Document";
    var title = opts.title || kindLabel;
    var subtitle = opts.subtitle || "";
    var meta = opts.meta || [];
    var body = opts.bodyHtml || "";
    var footnote = opts.footnote || "Document indicatif, non contractuel sauf mention contraire. Destiné à l'échange avec le client.";
    var pageTitle = title + " — " + BRAND.companyName;
    var metaHtml = meta
      .filter(Boolean)
      .map(function (m) {
        return "<span>" + esc(m) + "</span>";
      })
      .join("");

    return (
      "<!DOCTYPE html><html lang=\"fr\"><head><meta charset=\"UTF-8\"/>" +
      "<title>" +
      esc(pageTitle) +
      "</title><style>" +
      css() +
      "</style></head><body>" +
      '<div class="lop-toolbar"><p>Aperçu présentable — dans la boîte d’impression, choisissez <strong>Enregistrer au format PDF</strong>.</p>' +
      '<button type="button" onclick="window.print()">Imprimer / PDF</button></div>' +
      '<article class="lop-sheet">' +
      '<header class="lop-header"><div><h1 class="lop-logo">' +
      esc(BRAND.companyName) +
      '</h1><p class="lop-tag">' +
      esc(BRAND.tagline) +
      '</p></div><div class="lop-contact">' +
      esc(BRAND.email) +
      "<br>" +
      esc(BRAND.website) +
      "<br>ORIAS " +
      esc(BRAND.orias) +
      "</div></header>" +
      '<div class="lop-kind">' +
      esc(kindLabel) +
      "</div>" +
      "<h1 class=\"lop-title\">" +
      esc(title) +
      "</h1>" +
      (subtitle ? '<p class="lop-sub">' + esc(subtitle) + "</p>" : "") +
      '<div class="lop-meta">' +
      metaHtml +
      "<span>Édité le " +
      esc(todayFr()) +
      "</span></div>" +
      body +
      '<p class="lop-disclaimer">' +
      esc(footnote) +
      "</p>" +
      '<footer class="lop-footer"><span>' +
      esc(BRAND.footerLegal) +
      "</span><span>" +
      esc(kindLabel) +
      "</span></footer></article>" +
      "<script>window.addEventListener('load',function(){setTimeout(function(){window.focus();window.print();},250);});</script>" +
      "</body></html>"
    );
  }

  function open(opts) {
    if (typeof window === "undefined") return renderHtml(opts);
    var html = renderHtml(opts);
    var w = window.open("", "_blank", "noopener,noreferrer,width=920,height=1100");
    if (!w) {
      alert("Autorisez les fenêtres pop-up pour imprimer / enregistrer le PDF.");
      return html;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    return html;
  }

  function dossierBody(dossier) {
    var d = dossier || {};
    var b = d.biens || {};
    return (
      section("Info perso", rowsHtml(d.perso)) +
      section("Info pro", rowsHtml(d.pro)) +
      section(
        "Biens — véhicule",
        rowsHtml(b.vehicules)
      ) +
      section("Biens — immobilier", rowsHtml(b.immobilier)) +
      ((b.autres || []).length ? section("Autres éléments", rowsHtml(b.autres)) : "") +
      section("Projet / produit demandé", rowsHtml(d.projet))
    );
  }

  function personName(obj) {
    obj = obj || {};
    var p = obj.payload || obj.payload_obj || obj;
    return (
      [p.firstName || p.first_name || obj.first_name, p.lastName || p.last_name || obj.last_name]
        .filter(Boolean)
        .join(" ") ||
      p.fullName ||
      obj.full_name ||
      obj.email ||
      p.email ||
      "Dossier"
    );
  }

  function contactName(contact) {
    contact = contact || {};
    return (
      [contact.first_name, contact.last_name].filter(Boolean).join(" ") ||
      contact.email ||
      contact.company ||
      ""
    );
  }

  function money(n) {
    if (n == null || n === "") return "";
    var num = Number(n);
    if (isNaN(num)) return String(n);
    return num.toLocaleString("fr-FR") + " €";
  }

  function parseJson(value) {
    if (!value) return {};
    if (typeof value === "object") return value;
    try {
      return JSON.parse(value);
    } catch (e) {
      return {};
    }
  }

  function fromDossier(dossier, extra) {
    extra = extra || {};
    var raw = (dossier && dossier.raw) || {};
    var name = extra.title || personName(raw);
    return open({
      kind: extra.kind || "interlocuteur",
      title: name,
      subtitle: extra.subtitle || "Fiche classée à partir du questionnaire",
      meta: extra.meta || [],
      bodyHtml: dossierBody(dossier),
      footnote: extra.footnote,
    });
  }

  function fromLead(lead, extra) {
    extra = extra || {};
    var Lib = typeof root !== "undefined" ? root.InterlocuteurDossier : null;
    if (typeof window !== "undefined") Lib = window.InterlocuteurDossier || Lib;
    var dossier = extra.dossier || (Lib && Lib.buildDossier ? Lib.buildDossier(lead) : null);
    var l = lead || {};
    var name = personName(l);
    var meta = [
      l.vertical ? "Produit : " + l.vertical : "",
      l.lead_score != null ? "Score " + l.lead_score : "",
      l.email || "",
      l.phone || "",
    ].filter(Boolean);
    return open({
      kind: extra.kind || "questionnaire",
      title: extra.title || name,
      subtitle: extra.subtitle || "Réponses questionnaire — document de travail client",
      meta: extra.meta || meta,
      bodyHtml: dossier ? dossierBody(dossier) : extra.bodyHtml || "",
      footnote: extra.footnote,
    });
  }

  function fromImmoDoc(doc, prop, extra) {
    extra = extra || {};
    doc = doc || {};
    var data = doc.data || {};
    var parties = data.parties || {};
    var partyRows = Object.keys(parties).map(function (k) {
      return { label: k, value: flattenValue(parties[k]) };
    });
    var propRows = [];
    if (prop) {
      propRows = [
        { label: "Bien", value: prop.title },
        { label: "Ville", value: [prop.postal_code, prop.city].filter(Boolean).join(" ") },
        { label: "Type", value: prop.property_type },
        { label: "Surface", value: prop.surface_m2 ? prop.surface_m2 + " m²" : "" },
        { label: "Pièces", value: prop.rooms },
        { label: "Prix FAI", value: prop.price_fai },
        { label: "Prix net vendeur", value: prop.price_net },
      ];
    }
    var body =
      section("Bien", rowsHtml(propRows)) +
      section("Parties", rowsHtml(partyRows)) +
      section("Clauses / corps du document", prose(data.clauses || data.body || "")) +
      (doc.notes ? section("Notes internes", note(doc.notes)) : "");
    return open({
      kind: "mandat",
      kindLabel: extra.kindLabel || "Document immobilier",
      title: doc.title || "Document",
      subtitle: extra.subtitle || (doc.status ? "Statut : " + doc.status : ""),
      meta: extra.meta || [],
      bodyHtml: body,
      footnote:
        extra.footnote ||
        "Projet de document. Non signé tant que les parties n'ont pas paraphé. Honoraire et conditions à confirmer.",
    });
  }

  function fromProperty(prop, extra) {
    extra = extra || {};
    prop = prop || {};
    var rows = [
      { label: "Intitulé", value: prop.title },
      { label: "Type", value: prop.property_type },
      { label: "Statut", value: prop.status },
      { label: "Ville", value: [prop.postal_code, prop.city].filter(Boolean).join(" ") },
      { label: "Département", value: prop.department },
      { label: "Surface", value: prop.surface_m2 ? prop.surface_m2 + " m²" : "" },
      { label: "Pièces", value: prop.rooms },
      { label: "Chambres", value: prop.bedrooms },
      { label: "Prix FAI", value: prop.price_fai },
      { label: "Prix net", value: prop.price_net },
      { label: "Honoraires", value: prop.honoraires },
      { label: "Annonce", value: prop.listing_url },
    ];
    return open({
      kind: "bien",
      title: prop.title || "Fiche bien",
      subtitle: extra.subtitle || "Fiche de présentation",
      meta: extra.meta || [],
      bodyHtml: section("Caractéristiques", rowsHtml(rows)),
    });
  }

  function fromKpis(title, items, extra) {
    extra = extra || {};
    return open({
      kind: extra.kind || "estimation",
      title: title,
      subtitle: extra.subtitle || "",
      meta: extra.meta || [],
      bodyHtml: kpisHtml(items) + (extra.bodyHtml || "") + (extra.note ? note(extra.note) : ""),
      footnote: extra.footnote,
    });
  }

  function fromQuote(quote, contact, extra) {
    extra = extra || {};
    quote = quote || {};
    contact = contact || {};
    var data = parseJson(quote.data);
    var offers = (data.quoteDetails && data.quoteDetails.offers) || data.offers || [];
    var name = extra.contactName || contactName(contact) || personName(quote);
    var body =
      kpisHtml(
        [
          { label: "Prime estimée", value: money(quote.premium_estimate) || "—" },
          { label: "Statut", value: quote.status || "brouillon" },
          { label: "Produit", value: quote.product_type || quote.title || "—" },
        ]
      ) +
      section(
        "Client",
        rowsHtml([
          { label: "Nom", value: name },
          { label: "E-mail", value: contact.email || data.email },
          { label: "Téléphone", value: contact.phone || data.phone },
          { label: "Entreprise", value: contact.company || data.companyName },
        ])
      ) +
      section(
        "Devis",
        rowsHtml([
          { label: "Référence", value: quote.id },
          { label: "Titre", value: quote.title },
          { label: "Produit", value: quote.product_type },
          { label: "Couverture", value: data.coverage || data.coverageLevel },
          { label: "Budget", value: data.budget },
          { label: "Notes", value: quote.notes },
        ])
      ) +
      (offers.length
        ? section(
            "Offres",
            tableHtml(
              ["Assureur", "Prime", "Score"],
              offers.map(function (o) {
                return [
                  o.insurer || o.name || "—",
                  money(o.premium || o.price) || "—",
                  o.score != null ? String(o.score) : "—",
                ];
              })
            )
          )
        : "") +
      section(
        "Garanties",
        rowsHtml([
          { label: "Garanties", value: data.garanties || data.guarantees },
          { label: "Franchise", value: data.franchise || data.deductible },
          { label: "Exclusions", value: data.exclusions },
          { label: "Plafond", value: data.plafond || data.coverageLimit },
          { label: "Conditions", value: data.conditions || quote.notes },
        ])
      );
    return open({
      kind: "devis",
      title: extra.title || quote.title || ("Devis " + (quote.product_type || "")).trim(),
      subtitle: extra.subtitle || (name ? "Proposition commerciale — " + name : "Proposition commerciale"),
      meta: extra.meta || [quote.id, quote.status].filter(Boolean),
      bodyHtml: body,
      footnote:
        extra.footnote ||
        "Proposition indicative. Non contractuelle tant que le devis n'est pas signé et les pièces validées.",
    });
  }

  function fromContract(contract, contact, extras) {
    extras = extras || {};
    contract = contract || {};
    contact = contact || {};
    var name = extras.contactName || contactName(contact);
    var vehicles = extras.vehicles || [];
    var claims = extras.claims || [];
    var body =
      kpisHtml([
        {
          label: "Prime",
          value: contract.premium != null ? money(contract.premium) + " / mois" : "—",
        },
        { label: "Statut", value: contract.status || "—" },
        { label: "Assureur", value: contract.insurer || "—" },
      ]) +
      section(
        "Client",
        rowsHtml([
          { label: "Nom", value: name },
          { label: "E-mail", value: contact.email },
          { label: "Téléphone", value: contact.phone },
        ])
      ) +
      section(
        "Contrat",
        rowsHtml([
          { label: "Référence", value: contract.id },
          { label: "N° police", value: contract.policy_number },
          { label: "Type", value: contract.contract_type },
          { label: "Assureur", value: contract.insurer },
          { label: "Début", value: contract.start_date },
          { label: "Fin", value: contract.end_date },
          {
            label: "Prime mensuelle",
            value: contract.premium != null ? money(contract.premium) : "",
          },
        ])
      ) +
      (vehicles.length
        ? section(
            "Véhicules liés",
            tableHtml(
              ["Immatriculation", "Véhicule"],
              vehicles.slice(0, 8).map(function (v) {
                return [
                  v.registration || "—",
                  [v.brand, v.model].filter(Boolean).join(" ") || "—",
                ];
              })
            )
          )
        : "") +
      (claims.length
        ? section(
            "Sinistres",
            tableHtml(
              ["Type", "Statut"],
              claims.slice(0, 8).map(function (cl) {
                return [cl.claim_type || "—", cl.status || "—"];
              })
            )
          )
        : "") +
      (contract.description ? section("Description / avenants", prose(contract.description)) : "");
    return open({
      kind: "contrat",
      title: extras.title || contract.policy_number || contract.contract_type || "Contrat",
      subtitle: extras.subtitle || (name ? "Assuré : " + name : ""),
      meta: extras.meta || [contract.id, contract.status].filter(Boolean),
      bodyHtml: body,
      footnote:
        extras.footnote ||
        "Synthèse de contrat destinée à l'échange avec le client. Les conditions générales de l'assureur prévalent.",
    });
  }

  function fromAvenant(avenant, contract, contact, extra) {
    extra = extra || {};
    avenant = avenant || {};
    contract = contract || {};
    contact = contact || {};
    var name = extra.contactName || contactName(contact);
    var body =
      kpisHtml([
        { label: "Type", value: avenant.avenantType || "—" },
        {
          label: "Nouvelle prime",
          value:
            avenant.premium != null && avenant.premium !== ""
              ? money(avenant.premium) + " / mois"
              : "—",
        },
        { label: "Statut", value: avenant.status || "—" },
      ]) +
      section(
        "Contrat d'origine",
        rowsHtml([
          { label: "Référence", value: contract.id || avenant.contractId },
          { label: "N° police", value: contract.policy_number },
          { label: "Type", value: contract.contract_type },
          { label: "Assureur", value: contract.insurer },
          {
            label: "Prime actuelle",
            value: contract.premium != null ? money(contract.premium) + " / mois" : "",
          },
          { label: "Fin actuelle", value: contract.end_date },
        ])
      ) +
      section(
        "Client",
        rowsHtml([
          { label: "Nom", value: name },
          { label: "E-mail", value: contact.email },
        ])
      ) +
      section(
        "Modification demandée",
        rowsHtml([
          { label: "Type d'avenant", value: avenant.avenantType },
          {
            label: "Nouvelle prime",
            value:
              avenant.premium != null && avenant.premium !== ""
                ? money(avenant.premium) + " / mois"
                : "",
          },
          { label: "Nouvelle date de fin", value: avenant.endDate },
          { label: "Nouveau statut", value: avenant.status },
        ])
      ) +
      section("Motif", prose(avenant.notes || ""));
    return open({
      kind: "avenant",
      title: extra.title || ("Avenant — " + (avenant.avenantType || "modification")),
      subtitle: extra.subtitle || (name ? "Assuré : " + name : "Projet d'avenant"),
      meta: extra.meta || [contract.policy_number || contract.id, avenant.status].filter(Boolean),
      bodyHtml: body,
      footnote:
        extra.footnote ||
        "Projet d'avenant. Non contractuel tant que l'assureur n'a pas émis l'avenant signé.",
    });
  }

  function fromTariffGrid(grid, extra) {
    extra = extra || {};
    grid = grid || {};
    var rows = grid.rows || [];
    var total = rows.reduce(function (s, r) {
      return s + (Number(r.annualPremium) || 0);
    }, 0);
    if (grid.totalAnnual != null) total = Number(grid.totalAnnual) || total;
    var body =
      kpisHtml([
        { label: "Assureur", value: grid.insurerLabel || grid.insurer || extra.insurer || "—" },
        { label: "Produit", value: grid.product || extra.product || "—" },
        { label: "Prime annuelle", value: money(total) || "—" },
      ]) +
      section(
        "Garanties",
        tableHtml(
          ["Garantie", "Code", "Franchise", "Prime annuelle", "Commission"],
          rows.map(function (r) {
            return [
              r.label || "—",
              r.code || "—",
              r.franchise != null && r.franchise !== "" ? money(r.franchise) : "—",
              r.annualPremium != null && r.annualPremium !== "" ? money(r.annualPremium) : "—",
              r.commissionPct != null && r.commissionPct !== "" ? r.commissionPct + " %" : "—",
            ];
          })
        )
      ) +
      (grid.note || extra.note ? note(grid.note || extra.note) : "");
    return open({
      kind: "bordereau",
      title:
        extra.title ||
        ("Bordereau tarifaire" +
          (grid.insurerLabel || grid.insurer
            ? " — " + (grid.insurerLabel || grid.insurer)
            : "")),
      subtitle: extra.subtitle || "Grille de garanties et primes — document de travail",
      meta: extra.meta || [grid.product || extra.product, extra.leadId ? "Lead " + extra.leadId : ""].filter(Boolean),
      bodyHtml: body,
      footnote:
        extra.footnote ||
        "Bordereau indicatif interne. Valider les tarifs sur le bordereau partenaire avant remise client.",
    });
  }

  function fromClaim(claim, contact, extra) {
    extra = extra || {};
    claim = claim || {};
    contact = contact || {};
    var name = extra.contactName || contactName(contact);
    var body =
      kpisHtml([
        { label: "Type", value: claim.claim_type || "—" },
        { label: "Statut", value: claim.status || "—" },
        { label: "Montant", value: claim.amount != null ? money(claim.amount) : "—" },
      ]) +
      section(
        "Assuré",
        rowsHtml([
          { label: "Nom", value: name },
          { label: "E-mail", value: contact.email },
        ])
      ) +
      section(
        "Sinistre",
        rowsHtml([
          { label: "Date", value: claim.claim_date },
          { label: "Type", value: claim.claim_type },
          { label: "Statut", value: claim.status },
          { label: "Montant", value: claim.amount != null ? money(claim.amount) : "" },
        ])
      ) +
      section("Description", prose(claim.description || ""));
    return open({
      kind: "sinistre",
      title: extra.title || ("Sinistre — " + (claim.claim_type || "déclaration")),
      subtitle: extra.subtitle || (name ? "Assuré : " + name : ""),
      meta: extra.meta || [claim.id, claim.status].filter(Boolean),
      bodyHtml: body,
      footnote:
        extra.footnote ||
        "Fiche de suivi sinistre. Document de travail, non opposable à l'assureur.",
    });
  }

  var api = {
    BRAND: BRAND,
    KIND_LABELS: KIND_LABELS,
    esc: esc,
    row: row,
    rowsHtml: rowsHtml,
    section: section,
    kpisHtml: kpisHtml,
    note: note,
    prose: prose,
    tableHtml: tableHtml,
    money: money,
    contactName: contactName,
    css: css,
    renderHtml: renderHtml,
    open: open,
    dossierBody: dossierBody,
    fromDossier: fromDossier,
    fromLead: fromLead,
    fromImmoDoc: fromImmoDoc,
    fromProperty: fromProperty,
    fromKpis: fromKpis,
    fromQuote: fromQuote,
    fromContract: fromContract,
    fromAvenant: fromAvenant,
    fromTariffGrid: fromTariffGrid,
    fromClaim: fromClaim,
    personName: personName,
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  root.PrintDocument = api;
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
