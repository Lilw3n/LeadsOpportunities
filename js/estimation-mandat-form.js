/**
 * Formulaire public estimation / mandat → PDF (PrintDocument).
 */
(function () {
  "use strict";

  var form = document.getElementById("emForm");
  if (!form || !window.CrmImmoOps) return;
  var Ops = window.CrmImmoOps;

  function euro(n) {
    var v = Number(n);
    if (isNaN(v)) return "—";
    try {
      return v.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
    } catch (e) {
      return Math.round(v) + " €";
    }
  }

  function readEst() {
    var data = {};
    new FormData(form).forEach(function (v, k) {
      data[k] = v;
    });
    document.querySelectorAll("[form=emForm]").forEach(function (el) {
      if (el.name) data[el.name] = el.value;
    });
    return Ops.normalizeEstimationMandat(data);
  }

  function refresh() {
    var hon = Ops.computeMandatHonoraires(readEst());
    var b = document.getElementById("kBase");
    var h = document.getElementById("kHt");
    var t = document.getElementById("kTtc");
    if (b) b.textContent = euro(hon.base);
    if (h) h.textContent = euro(hon.honoraires_ht);
    if (t) t.textContent = euro(hon.honoraires_ttc);
  }

  form.addEventListener("input", refresh);
  document.getElementById("emValues").addEventListener("input", refresh);
  refresh();

  function pdf(kind) {
    var est = readEst();
    var hon = Ops.computeMandatHonoraires(est);
    if (!window.PrintDocument || !window.PrintDocument.fromKpis) {
      alert("Module PDF indisponible");
      return;
    }
    if (kind === "estimation") {
      window.PrintDocument.fromKpis(
        "Rapport d'estimation personnelle",
        [
          { label: "Client", value: [est.client_prenom, est.client_nom].filter(Boolean).join(" ") },
          { label: "Bien", value: [est.bien_adresse, est.bien_cp, est.bien_ville].filter(Boolean).join(", ") },
          { label: "Type", value: est.bien_type + (est.bien_surface ? " · " + est.bien_surface + " m²" : "") },
          {
            label: "Fourchette",
            value:
              [est.valeur_estimee_basse, est.valeur_estimee, est.valeur_estimee_haute].filter(Boolean).join(" → ") +
              " €",
          },
          { label: "Honoraires TTC", value: euro(hon.honoraires_ttc) + " (" + hon.charge + ")" },
          { label: "Comparables", value: est.comparables },
          { label: "Recommandation", value: est.recommandation },
        ],
        { subtitle: "Avis de valeur", kind: "estimation", note: "Ne constitue pas une expertise judiciaire." }
      );
    } else {
      window.PrintDocument.fromKpis(
        "Projet de mandat " + (est.type_mandat || ""),
        [
          { label: "Mandant", value: [est.client_prenom, est.client_nom].filter(Boolean).join(" ") },
          { label: "Contact", value: [est.client_tel, est.client_email].filter(Boolean).join(" · ") },
          { label: "Objet", value: (est.objet_mandat || est.transaction) + " · " + est.transaction },
          { label: "Bien", value: [est.bien_adresse, est.bien_cp, est.bien_ville].filter(Boolean).join(", ") },
          {
            label: "Référence",
            value:
              est.transaction === "location"
                ? (est.loyer_estime || "") + " €/mois"
                : (est.valeur_estimee || est.prix_souhaite || "") + " €",
          },
          { label: "Honoraires TTC", value: euro(hon.honoraires_ttc) + " — " + hon.charge },
          { label: "Durée", value: (est.duree_mandat_mois || "") + " mois" },
        ],
        { subtitle: "Projet non signé", kind: "mandat", note: "Document généré depuis le formulaire en ligne." }
      );
    }
  }

  document.getElementById("btnPdfEst").onclick = function () {
    pdf("estimation");
  };
  document.getElementById("btnPdfMandat").onclick = function () {
    pdf("mandat");
  };
})();
