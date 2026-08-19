/**
 * Sync casquette immo (vendeur / les_deux) ↔ questionnaire #demande (fiche complète).
 */
(function () {
  var DOSSIER_COPY = {
    acheteur: {
      kicker: "Alerte & dossier",
      title: "Pas le bon bien ? Déposez une alerte",
      lead:
        "On vous prévient quand un mandat correspond. Le prêt et les assurances viennent ensuite, seulement si vous en avez besoin — ce n'est pas l'écran de recherche.",
      wizardLabel: "Alerte recherche",
    },
    vendeur: {
      kicker: "Fiche vendeur",
      title: "Fiche complète de votre bien à vendre",
      lead:
        "Propriétaires, coordonnées du bien, mandat, descriptif pièce par pièce, copro, travaux, construction récente, mobilier, photos, pièces justificatives, projet de vente… Le conseiller et le client remplissent le même dossier.",
      wizardLabel: "Fiche vente",
    },
    les_deux: {
      kicker: "Vente + rachat",
      title: "Vous vendez et vous rachetez — dossier complet",
      lead:
        "Section 1 : fiche vente (propriétaires, mandat, bien, copro, photos, pièces). Section 2 : critères du bien recherché. Prêt relais possible.",
      wizardLabel: "Vente puis recherche",
    },
  };

  function hatFromDoc() {
    return document.documentElement.getAttribute("data-immo-hat") || "acheteur";
  }

  function wizardModeForHat(hat) {
    if (hat === "vendeur") return "service";
    if (hat === "les_deux") return "les_deux";
    return "bien";
  }

  function setWizardMode(form, mode) {
    if (!form) return;
    var ui = form.querySelector('[name="searchModeUi"][value="' + mode + '"]');
    var sk = form.querySelector('[name="searchKind"][value="' + mode + '"]');
    if (ui) ui.checked = true;
    if (sk) sk.checked = true;
    if (window.AcheteurImmoWizard && typeof window.AcheteurImmoWizard.sync === "function") {
      window.AcheteurImmoWizard.sync(form);
    } else {
      ui && ui.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (window.VendeurVisitePretBlock) window.VendeurVisitePretBlock.syncVisibility();
  }

  function applyDossierCopy(hat) {
    var copy = DOSSIER_COPY[hat] || DOSSIER_COPY.acheteur;
    var dossier = document.getElementById("dossier");
    if (!dossier) return;

    var kicker = dossier.querySelector(".dossier-kicker");
    var title = dossier.querySelector(".form-title");
    var lead = dossier.querySelector(".form-lead");
    var wizardMeta = dossier.querySelector(".wizard-meta span:first-child");

    if (kicker) kicker.textContent = copy.kicker;
    if (title) title.textContent = copy.title;
    if (lead) lead.textContent = copy.lead;
    if (wizardMeta) wizardMeta.textContent = copy.wizardLabel;

    var form = dossier.querySelector("form[data-acheteur-immo]");
    if (hat === "vendeur" || hat === "les_deux") {
      setWizardMode(form, wizardModeForHat(hat));
    } else if (hat === "acheteur") {
      setWizardMode(form, "bien");
    }
  }

  function valOf(sel, root) {
    var el = (root || document).querySelector(sel);
    return el && el.value ? String(el.value).trim() : "";
  }

  function setIfEmpty(dst, value) {
    if (!dst || !value || String(dst.value || "").trim()) return;
    dst.value = value;
  }

  function prefillFromExpress() {
    var expressForm = document.querySelector("[data-url-capture-form]");
    var dossierForm = document.querySelector("#dossier form[data-acheteur-immo]");
    if (!expressForm || !dossierForm) return;

    setIfEmpty(dossierForm.querySelector("#sellCity"), valOf("#urlCity", expressForm));
    setIfEmpty(dossierForm.querySelector("#sellPostalCode"), valOf("#urlPostal", expressForm));
    setIfEmpty(dossierForm.querySelector("#sellRooms"), valOf("#urlRooms", expressForm));
    setIfEmpty(dossierForm.querySelector("#sellSurface"), valOf("#urlSurf", expressForm));
    setIfEmpty(dossierForm.querySelector("#sellBedrooms"), valOf("#urlBedrooms", expressForm));
    setIfEmpty(dossierForm.querySelector("#sellDescription"), valOf("#urlDescription", expressForm));
    setIfEmpty(dossierForm.querySelector("#sellPriceFai"), valOf("#urlPrice", expressForm));

    var pt = expressForm.querySelector("[name='property_type']");
    if (pt && pt.value && !dossierForm.querySelector('[name="sellPropertyType"]:checked')) {
      var radio = dossierForm.querySelector('[name="sellPropertyType"][value="' + pt.value + '"]');
      if (radio) radio.checked = true;
    }

    var dpe = expressForm.querySelector("#urlDpe");
    var sellDpe = dossierForm.querySelector("#sellDpe");
    if (dpe && sellDpe && dpe.value) setIfEmpty(sellDpe, dpe.value);
  }

  function syncBridge(hat) {
    /* Pont remplacé par fusion inline (AcheteurImmoDepositVente). */
  }

  function syncAll(hat) {
    hat = hat || hatFromDoc();
    applyDossierCopy(hat);
    if (window.AcheteurImmoDepositVente) window.AcheteurImmoDepositVente.sync();
  }

  function bindGotoFiche() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-goto-fiche-complete]");
      if (!btn) return;
      e.preventDefault();
      var hat = hatFromDoc();
      prefillFromExpress();
      syncAll(hat);
      var dossier = document.getElementById("dossier");
      if (dossier) {
        dossier.scrollIntoView({ behavior: "smooth", block: "start" });
        if (history.replaceState) {
          history.replaceState(null, "", "#demande");
        }
      }
    });
  }

  function bindHatChanges() {
    document.querySelectorAll("[name='immoHat']").forEach(function (el) {
      el.addEventListener("change", function () {
        syncAll(el.value);
      });
    });
  }

  function boot() {
    bindGotoFiche();
    bindHatChanges();
    syncAll(hatFromDoc());
    document.addEventListener("DOMContentLoaded", function () {
      syncAll(hatFromDoc());
    });
  }

  window.AcheteurImmoHatDossier = { sync: syncAll };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
