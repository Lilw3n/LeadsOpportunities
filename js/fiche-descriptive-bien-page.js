/**
 * Page éditeur — Fiche descriptive du bien (édition + PDF).
 */
(function () {
  var Lib = window.FicheDescriptiveBien;
  if (!Lib) return;

  var form = document.querySelector("[data-fiche-form]");
  var statusEl = document.querySelector("[data-fiche-status]");
  var draftsEl = document.querySelector("[data-fiche-drafts]");
  var current = Lib.emptyFiche();

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg || "";
  }

  function qs(name) {
    try {
      return new URLSearchParams(window.location.search).get(name);
    } catch (e) {
      return null;
    }
  }

  function setField(name, value) {
    if (!form) return;
    var el = form.querySelector('[name="' + name + '"]');
    if (!el) return;
    if (el.type === "checkbox") {
      el.checked = !!value && value !== "0" && value !== "false";
      return;
    }
    el.value = value == null ? "" : String(value);
  }

  function getField(name) {
    if (!form) return "";
    var el = form.querySelector('[name="' + name + '"]');
    if (!el) return "";
    if (el.type === "checkbox") return el.checked;
    return (el.value || "").trim();
  }

  function fillForm(fiche) {
    current = Lib.merge(Lib.emptyFiche(), fiche);
    var map = {
      id: current.id,
      title: current.title,
      listingType: current.listingType,
      propertyType: current.propertyType,
      propertySubtype: current.propertySubtype,
      address: current.address,
      complement: current.complement,
      postalCode: current.postalCode,
      city: current.city,
      quartier: current.quartier,
      department: current.department,
      digicode: current.digicode,
      floor: current.floor,
      refCadastrale: current.refCadastrale,
      sectionCadastrale: current.sectionCadastrale,
      numeroCadastre: current.numeroCadastre,
      prixNet: current.prixNet,
      prixFai: current.prixFai,
      honoraires: current.honoraires,
      chargeHonoraires: current.chargeHonoraires,
      chargesMensuelles: current.chargesMensuelles,
      taxeFonciere: current.taxeFonciere,
      taxeHabitation: current.taxeHabitation,
      surfaceHab: current.surfaceHab,
      surfaceCarrez: current.surfaceCarrez,
      surfaceSejour: current.surfaceSejour,
      surfaceTerrain: current.surfaceTerrain,
      rooms: current.rooms,
      bedrooms: current.bedrooms,
      bathrooms: current.bathrooms,
      levels: current.levels,
      orientation: current.orientation,
      view: current.view,
      kitchen: current.kitchen,
      heating: current.heating,
      hotWater: current.hotWater,
      interiorState: current.interiorState,
      generalCondition: current.generalCondition,
      standing: current.standing,
      buildYear: current.buildYear,
      constructionType: current.constructionType,
      description: current.description,
      pointsForts: current.pointsForts,
      pointsFaibles: current.pointsFaibles,
      observations: current.observations,
      notesInternes: current.notesInternes,
      cave: current.cave,
      parkingExt: current.parkingExt,
      parkingInt: current.parkingInt,
      garage: current.garage,
      box: current.box,
      equipements: (current.equipements || []).join(", "),
      pluZone: current.pluZone,
      cos: current.cos,
      plotSurface: current.plotSurface,
      coproStatus: current.coproStatus,
      coproLots: current.coproLots,
      coproTantiemes: current.coproTantiemes,
      coproCharges: current.coproCharges,
      syndic: current.syndic,
      dpeExempt: current.dpeExempt,
      dpe: current.dpe,
      dpeKwh: current.dpeKwh,
      ges: current.ges,
      gesKg: current.gesKg,
      dpeDate: current.dpeDate,
      dpeRefSurface: current.dpeRefSurface,
      energyCostAnnual: current.energyCostAnnual,
      availability: current.availability,
      availabilityStart: current.availabilityStart,
      environment: current.environment,
      listingUrl: current.listingUrl,
      refAffaire: current.refAffaire,
      nMandat: current.nMandat,
      formeMandat: current.formeMandat,
    };
    Object.keys(map).forEach(function (k) {
      setField(k, map[k]);
    });
  }

  function readForm() {
    var equips = getField("equipements");
    var f = Lib.merge(current, {
      id: getField("id") || current.id,
      title: getField("title"),
      listingType: getField("listingType"),
      propertyType: getField("propertyType"),
      propertySubtype: getField("propertySubtype"),
      address: getField("address"),
      complement: getField("complement"),
      postalCode: getField("postalCode"),
      city: getField("city"),
      quartier: getField("quartier"),
      department: getField("department"),
      digicode: getField("digicode"),
      floor: getField("floor"),
      refCadastrale: getField("refCadastrale"),
      sectionCadastrale: getField("sectionCadastrale"),
      numeroCadastre: getField("numeroCadastre"),
      prixNet: getField("prixNet"),
      prixFai: getField("prixFai"),
      honoraires: getField("honoraires"),
      chargeHonoraires: getField("chargeHonoraires"),
      chargesMensuelles: getField("chargesMensuelles"),
      taxeFonciere: getField("taxeFonciere"),
      taxeHabitation: getField("taxeHabitation"),
      surfaceHab: getField("surfaceHab"),
      surfaceCarrez: getField("surfaceCarrez"),
      surfaceSejour: getField("surfaceSejour"),
      surfaceTerrain: getField("surfaceTerrain"),
      rooms: getField("rooms"),
      bedrooms: getField("bedrooms"),
      bathrooms: getField("bathrooms"),
      levels: getField("levels"),
      orientation: getField("orientation"),
      view: getField("view"),
      kitchen: getField("kitchen"),
      heating: getField("heating"),
      hotWater: getField("hotWater"),
      interiorState: getField("interiorState"),
      generalCondition: getField("generalCondition"),
      standing: getField("standing"),
      buildYear: getField("buildYear"),
      constructionType: getField("constructionType"),
      description: getField("description"),
      pointsForts: getField("pointsForts"),
      pointsFaibles: getField("pointsFaibles"),
      observations: getField("observations"),
      notesInternes: getField("notesInternes"),
      cave: getField("cave"),
      parkingExt: getField("parkingExt"),
      parkingInt: getField("parkingInt"),
      garage: getField("garage"),
      box: getField("box"),
      equipements: equips
        ? equips.split(",").map(function (s) {
            return s.trim();
          }).filter(Boolean)
        : [],
      pluZone: getField("pluZone"),
      cos: getField("cos"),
      plotSurface: getField("plotSurface"),
      coproStatus: getField("coproStatus"),
      coproLots: getField("coproLots"),
      coproTantiemes: getField("coproTantiemes"),
      coproCharges: getField("coproCharges"),
      syndic: getField("syndic"),
      dpeExempt: !!getField("dpeExempt"),
      dpe: getField("dpe"),
      dpeKwh: getField("dpeKwh"),
      ges: getField("ges"),
      gesKg: getField("gesKg"),
      dpeDate: getField("dpeDate"),
      dpeRefSurface: getField("dpeRefSurface"),
      energyCostAnnual: getField("energyCostAnnual"),
      availability: getField("availability"),
      availabilityStart: getField("availabilityStart"),
      environment: getField("environment"),
      listingUrl: getField("listingUrl"),
      refAffaire: getField("refAffaire"),
      nMandat: getField("nMandat"),
      formeMandat: getField("formeMandat"),
      owners: current.owners || [],
      roomRows: current.roomRows || [],
      source: current.source || "editor",
    });
    return f;
  }

  function renderDrafts() {
    if (!draftsEl) return;
    var drafts = Lib.listDrafts();
    if (!drafts.length) {
      draftsEl.innerHTML = '<p class="fiche-muted">Aucun brouillon enregistré sur cet appareil.</p>';
      return;
    }
    draftsEl.innerHTML = drafts
      .map(function (d) {
        var label = d.title || [d.city, d.propertyType].filter(Boolean).join(" — ") || d.id;
        var when = d.updatedAt ? new Date(d.updatedAt).toLocaleString("fr-FR") : "";
        return (
          '<div class="fiche-draft-row">' +
          '<button type="button" class="btn btn-soft btn-sm" data-load-draft="' +
          d.id +
          '">' +
          label +
          "</button>" +
          '<span class="fiche-muted">' +
          when +
          "</span>" +
          '<button type="button" class="btn btn-ghost btn-sm" data-del-draft="' +
          d.id +
          '" aria-label="Supprimer">×</button>' +
          "</div>"
        );
      })
      .join("");
  }

  function save() {
    current = Lib.saveDraft(readForm());
    setField("id", current.id);
    setStatus("Brouillon enregistré — " + (current.title || current.id));
    renderDrafts();
    return current;
  }

  function printPdf() {
    var f = save();
    Lib.print(f);
  }

  function newFiche() {
    current = Lib.emptyFiche();
    fillForm(current);
    setStatus("Nouvelle fiche — remplissez puis enregistrez / PDF.");
  }

  function loadFromCrm(propId) {
    if (!propId || !window.CrmImmoStore) return false;
    try {
      var prop =
        (window.CrmImmoStore.getProperty && window.CrmImmoStore.getProperty(propId)) ||
        null;
      if (!prop && window.CrmImmoStore.loadLocal) {
        var db = window.CrmImmoStore.loadLocal();
        var props = (db && db.properties) || [];
        prop = props.filter(function (p) {
          return p.id === propId;
        })[0];
      }
      if (!prop) return false;
      fillForm(Lib.fromCrmProperty(prop));
      setStatus("Chargé depuis la fiche CRM — " + (prop.title || propId));
      return true;
    } catch (e) {
      return false;
    }
  }

  function boot() {
    var transferred = Lib.consumeTransfer();
    if (transferred) {
      fillForm(transferred);
      setStatus("Données importées du questionnaire — éditez puis PDF.");
    } else if (qs("id") && Lib.loadDraft(qs("id"))) {
      fillForm(Lib.loadDraft(qs("id")));
      setStatus("Brouillon ouvert.");
    } else if (qs("prop")) {
      if (!loadFromCrm(qs("prop"))) {
        fillForm(Lib.emptyFiche());
        setStatus("Bien CRM introuvable localement — saisie manuelle.");
      }
    } else {
      fillForm(Lib.emptyFiche());
      setStatus("Nouvelle fiche descriptive — éditable, export PDF navigateur.");
    }
    renderDrafts();

    var btnSave = document.querySelector("[data-fiche-save]");
    var btnPrint = document.querySelector("[data-fiche-print]");
    var btnNew = document.querySelector("[data-fiche-new]");
    if (btnSave) btnSave.addEventListener("click", save);
    if (btnPrint) btnPrint.addEventListener("click", printPdf);
    if (btnNew) btnNew.addEventListener("click", newFiche);

    if (draftsEl) {
      draftsEl.addEventListener("click", function (e) {
        var loadBtn = e.target.closest("[data-load-draft]");
        var delBtn = e.target.closest("[data-del-draft]");
        if (loadBtn) {
          var d = Lib.loadDraft(loadBtn.getAttribute("data-load-draft"));
          if (d) {
            fillForm(d);
            setStatus("Brouillon chargé.");
          }
        }
        if (delBtn) {
          Lib.deleteDraft(delBtn.getAttribute("data-del-draft"));
          renderDrafts();
          setStatus("Brouillon supprimé.");
        }
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
