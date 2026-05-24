/**
 * Mode lecture devis — inspire QuoteReadingMode (multisite-platform)
 */
window.CrmQuoteReadingMode = {
  esc: function (s) {
    if (s == null) return "";
    var d = document.createElement("div");
    d.textContent = String(s);
    return d.innerHTML;
  },

  currency: function (n) {
    if (n == null || isNaN(n)) return "—";
    return Number(n).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
  },

  stepClass: function (status) {
    if (status === "done") return "qrm-step done";
    if (status === "current") return "qrm-step current";
    return "qrm-step";
  },

  eligClass: function (status) {
    if (status === "ok") return "qrm-elig ok";
    if (status === "warning") return "qrm-elig warn";
    return "qrm-elig err";
  },

  buildFromQuote: function (quote, contact) {
    var data = {};
    try {
      data = typeof quote.data === "string" ? JSON.parse(quote.data) : quote.data || {};
    } catch (e) {
      data = {};
    }
    var offers = (data.quoteDetails && data.quoteDetails.offers) || data.offers || [];
    var status = quote.status || "brouillon";
    var stepOffer = status === "brouillon" ? "current" : "done";
    var stepSig =
      status === "signe" || status === "accepte" ? "done" : status === "envoye" ? "current" : "upcoming";

    return {
      meta: {
        reference: quote.id,
        quoteType: quote.product_type || quote.title || "Devis",
        agent: "Wendy BUCHET",
        createdAt: quote.created_at,
        subtitle: "Synthèse verticale — mode lecture multisite",
        steps: [
          { id: "q", label: "Questionnaire", status: "done" },
          { id: "o", label: "Offre", status: stepOffer },
          { id: "d", label: "Documents", status: status === "envoye" ? "current" : "upcoming" },
          { id: "s", label: "Signature", status: stepSig },
          { id: "p", label: "Paiement", status: status === "signe" ? "done" : "upcoming" },
        ],
        tags: ["Mode lecture", quote.product_type || "assurance"],
      },
      prospect: {
        fields: [
          {
            label: "Contact",
            value: contact ? ((contact.first_name || "") + " " + (contact.last_name || "")).trim() : "—",
            accent: true,
          },
          { label: "Email", value: (contact && contact.email) || data.email || "—" },
          { label: "Téléphone", value: (contact && contact.phone) || data.phone || "—" },
        ],
        contact: [
          { label: "Entreprise", value: (contact && contact.company) || data.companyName || "—" },
          { label: "Couverture", value: data.coverage || data.coverageLevel || "—" },
          { label: "Budget", value: data.budget ? data.budget + " €" : "—" },
        ],
      },
      tariffQuestions: [
        { id: "t1", label: "Produit", value: quote.product_type || "—", emphasis: true },
        { id: "t2", label: "Urgence", value: data.urgency || "—" },
        { id: "t3", label: "Source", value: data.source || "crm" },
      ],
      eligibilityQuestions: [
        {
          id: "e1",
          label: "Statut devis",
          answer: status,
          status: status === "refuse" ? "error" : status === "signe" ? "ok" : "warning",
        },
      ],
      plans: offers.length
        ? offers.map(function (o, i) {
            return {
              id: "p" + i,
              name: o.insurer || o.name || "Offre " + (i + 1),
              price: o.premium || o.price || 0,
              frequency: "yearly",
              commission: 12,
              tag: o.recommended ? "Recommandée" : undefined,
              highlights: ["Score " + (o.score || "—"), "Comparatif wizard"],
            };
          })
        : quote.premium_estimate
          ? [
              {
                id: "main",
                name: quote.title || "Offre principale",
                price: quote.premium_estimate,
                frequency: "yearly",
                commission: 10,
                tag: "Estimation",
                highlights: ["Basé sur fiche CRM"],
              },
            ]
          : [],
      options: [],
      documents: [
        { id: "d1", name: "Questionnaire", status: "received" },
        { id: "d2", name: "Pièces justificatives", status: status === "signe" ? "received" : "missing" },
      ],
      requests: [
        {
          id: "r1",
          label: quote.title || "Demande devis",
          date: quote.created_at,
          status: status,
          owner: "CRM",
        },
      ],
      coverage: {
        garanties: data.garanties || data.guarantees || "RC, Défense recours, Bris de glace, Vol, Incendie",
        franchise: data.franchise || data.deductible || "300 € bris de glace · 500 € collision",
        exclusions: data.exclusions || "Usage racing, transport marchandises dangereuses",
        plafond: data.plafond || data.coverageLimit || "Illimité corporel · 50 M€ matériels",
        conditions: data.conditions || quote.notes || "Valide sous réserve pièces justificatives",
        validUntil: data.validUntil || data.valid_until || null,
      },
    };
  },

  render: function (container, readingData) {
    var self = this;
    var d = readingData;
    var stepsHtml = d.meta.steps
      .map(function (s) {
        return (
          '<li class="' +
          self.stepClass(s.status) +
          '"><span class="qrm-step-dot"></span>' +
          self.esc(s.label) +
          "</li>"
        );
      })
      .join("");

    function fieldsHtml(fields) {
      return fields
        .map(function (f) {
          return (
            '<div class="qrm-field' +
            (f.accent ? " accent" : "") +
            '"><span>' +
            self.esc(f.label) +
            "</span><strong>" +
            self.esc(f.value) +
            "</strong></div>"
          );
        })
        .join("");
    }

    var plansHtml = d.plans.length
      ? d.plans
          .map(function (p) {
            return (
              '<article class="qrm-plan' +
              (p.tag ? " featured" : "") +
              '"><h4>' +
              self.esc(p.name) +
              (p.tag ? ' <span class="qrm-tag">' + self.esc(p.tag) + "</span>" : "") +
              '</h4><p class="qrm-price">' +
              self.currency(p.price) +
              ' <small>/ an</small></p><ul>' +
              p.highlights
                .map(function (h) {
                  return "<li>" + self.esc(h) + "</li>";
                })
                .join("") +
              "</ul></article>"
            );
          })
          .join("")
      : "<p>Aucune offre comparée.</p>";

    container.innerHTML =
      '<div class="qrm">' +
      '<header class="qrm-header"><div><p class="qrm-ref">' +
      self.esc(d.meta.reference) +
      '</p><h2>' +
      self.esc(d.meta.quoteType) +
      '</h2><p class="qrm-sub">' +
      self.esc(d.meta.subtitle || "") +
      '</p></div><div class="qrm-tags">' +
      d.meta.tags
        .map(function (t) {
          return '<span class="qrm-tag">' + self.esc(t) + "</span>";
        })
        .join("") +
      "</div></header>" +
      '<ol class="qrm-steps">' +
      stepsHtml +
      "</ol>" +
      '<div class="qrm-grid">' +
      '<section class="panel"><h3>Prospect</h3><div class="qrm-fields">' +
      fieldsHtml(d.prospect.fields) +
      '</div><h4>Coordonnées</h4><div class="qrm-fields">' +
      fieldsHtml(d.prospect.contact) +
      "</div></section>" +
      '<section class="panel"><h3>Offres</h3><div class="qrm-plans">' +
      plansHtml +
      "</div></section>" +
      '<section class="panel"><h3>Éligibilité</h3>' +
      d.eligibilityQuestions
        .map(function (q) {
          return (
            '<div class="' +
            self.eligClass(q.status) +
            '"><strong>' +
            self.esc(q.label) +
            "</strong> — " +
            self.esc(q.answer) +
            "</div>"
          );
        })
        .join("") +
      "</section>" +
      (d.coverage
        ? '<section class="panel"><h3>Garanties &amp; conditions</h3><dl style="display:grid;grid-template-columns:120px 1fr;gap:8px 12px;font-size:.9rem;margin:0">' +
          "<dt>Garanties</dt><dd>" +
          self.esc(d.coverage.garanties) +
          "</dd><dt>Franchise</dt><dd>" +
          self.esc(d.coverage.franchise) +
          "</dd><dt>Exclusions</dt><dd>" +
          self.esc(d.coverage.exclusions) +
          "</dd><dt>Plafond</dt><dd>" +
          self.esc(d.coverage.plafond) +
          "</dd><dt>Conditions</dt><dd>" +
          self.esc(d.coverage.conditions) +
          (d.coverage.validUntil ? "</dd><dt>Valide jusqu'au</dt><dd>" + self.esc(d.coverage.validUntil) : "") +
          "</dd></dl></section>"
        : "") +
      "</div></div>";
  },
};
