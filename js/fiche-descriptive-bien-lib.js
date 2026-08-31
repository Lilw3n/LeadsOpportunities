/**
 * Fiche descriptive du bien — modèle éditable + PDF (Imprimer → Enregistrer en PDF).
 * Sources : questionnaire vendeur (sell*), CRM fiche intelligente, brouillons locaux.
 */
(function (root) {
  var STORAGE_KEY = "lo_fiche_descriptive_drafts_v1";
  var TRANSFER_KEY = "lo_fiche_descriptive_transfer";

  function emptyFiche() {
    return {
      id: "",
      updatedAt: null,
      title: "",
      listingType: "vente",
      propertyType: "",
      propertySubtype: "",
      address: "",
      complement: "",
      postalCode: "",
      city: "",
      quartier: "",
      department: "",
      digicode: "",
      floor: "",
      refCadastrale: "",
      sectionCadastrale: "",
      numeroCadastre: "",
      prixNet: "",
      prixFai: "",
      honoraires: "",
      chargeHonoraires: "",
      chargesMensuelles: "",
      taxeFonciere: "",
      taxeHabitation: "",
      priceDisplay: "",
      surfaceHab: "",
      surfaceCarrez: "",
      surfaceSejour: "",
      surfaceTerrain: "",
      rooms: "",
      bedrooms: "",
      bathrooms: "",
      levels: "",
      orientation: "",
      view: "",
      mitoyennete: "",
      kitchen: "",
      heating: "",
      heatingEnergy: "",
      hotWater: "",
      interiorState: "",
      generalCondition: "",
      standing: "",
      buildYear: "",
      constructionType: "",
      buildingFloors: "",
      buildingState: "",
      description: "",
      pointsForts: "",
      pointsFaibles: "",
      observations: "",
      cave: "",
      parkingExt: "",
      parkingInt: "",
      box: "",
      garage: "",
      equipements: [],
      pluZone: "",
      cos: "",
      plotSurface: "",
      frontage: "",
      depth: "",
      coproStatus: "",
      coproLots: "",
      coproTantiemes: "",
      coproCharges: "",
      syndic: "",
      dpeExempt: false,
      dpe: "",
      dpeKwh: "",
      ges: "",
      gesKg: "",
      dpeDate: "",
      dpeRefSurface: "",
      energyCostAnnual: "",
      availability: "",
      availabilityStart: "",
      environment: "",
      listingUrl: "",
      refAffaire: "",
      nMandat: "",
      formeMandat: "",
      owners: [],
      roomRows: [],
      notesInternes: "",
      source: "",
    };
  }

  function val(form, name) {
    if (!form) return "";
    var el = form.querySelector('[name="' + name + '"]');
    if (!el) return "";
    if (el.type === "checkbox") return el.checked ? el.value || "1" : "";
    if (el.type === "radio") {
      var checked = form.querySelector('input[name="' + name + '"]:checked');
      return checked ? checked.value : "";
    }
    return (el.value || "").trim();
  }

  function checkedValues(form, name) {
    return Array.prototype.slice
      .call(form.querySelectorAll('input[name="' + name + '"]:checked'))
      .map(function (el) {
        var chip = el.closest(".search-chip span");
        return chip ? chip.textContent.trim() : el.value;
      });
  }

  function collectOwners(form) {
    var mount = form && form.querySelector("[data-owners-mount]");
    if (!mount) return [];
    return Array.prototype.slice.call(mount.querySelectorAll(".immo-owner-card")).map(function (card, i) {
      var o = { index: i + 1 };
      Array.prototype.slice.call(card.querySelectorAll("[data-owner-field]")).forEach(function (el) {
        var key = el.getAttribute("data-owner-field");
        if (el.type === "radio" && !el.checked) return;
        o[key] = (el.value || "").trim();
      });
      return o;
    });
  }

  function collectRoomRows(form) {
    var mount = form && form.querySelector("[data-rooms-mount]");
    if (!mount) return [];
    return Array.prototype.slice.call(mount.querySelectorAll(".immo-room-row")).map(function (tr) {
      var row = {};
      Array.prototype.slice.call(tr.querySelectorAll("[data-room-field]")).forEach(function (el) {
        row[el.getAttribute("data-room-field")] = (el.value || "").trim();
      });
      return row;
    });
  }

  function fromSellForm(form) {
    var f = emptyFiche();
    if (!form) return f;
    f.source = "questionnaire";
    f.title = val(form, "sellListingTitle") || [val(form, "sellCity"), val(form, "sellPropertyCategory")].filter(Boolean).join(" — ");
    f.listingType = val(form, "sellListingType") || "vente";
    f.propertyType = val(form, "sellPropertyCategory") || val(form, "sellPropertyType");
    f.propertySubtype = val(form, "sellPropertySubtype");
    f.address = val(form, "sellAddress");
    f.complement = val(form, "sellAddressComplement");
    f.postalCode = val(form, "sellPostalCode");
    f.city = val(form, "sellCity");
    f.quartier = val(form, "sellQuartier");
    f.department = val(form, "sellDepartment");
    f.digicode = val(form, "sellDigicode");
    f.floor = val(form, "sellFloor");
    f.refCadastrale = val(form, "sellCadastreRef") || val(form, "sellRefCadastrale");
    f.sectionCadastrale = val(form, "sellCadastreSection");
    f.numeroCadastre = val(form, "sellCadastreNumero");
    f.prixNet = val(form, "sellPriceNet") || val(form, "sellPrixNet");
    f.prixFai = val(form, "sellPriceFai") || val(form, "sellPrixFai");
    f.honoraires = val(form, "sellHonoraires") || val(form, "sellFees");
    f.chargeHonoraires = val(form, "sellFeeCharge") || val(form, "sellChargeHonoraires");
    f.chargesMensuelles = val(form, "sellCharges") || val(form, "sellChargesMensuelles");
    f.taxeFonciere = val(form, "sellTaxeFonciere");
    f.taxeHabitation = val(form, "sellTaxeHabitation");
    f.priceDisplay = val(form, "sellPriceDisplay");
    f.surfaceHab = val(form, "sellSurface");
    f.surfaceCarrez = val(form, "sellSurfaceCarrez");
    f.surfaceSejour = val(form, "sellLivingSurface");
    f.surfaceTerrain = val(form, "sellLandSurface") || val(form, "sellPlotSurface");
    f.rooms = val(form, "sellRooms");
    f.bedrooms = val(form, "sellBedrooms");
    f.bathrooms = val(form, "sellBathrooms");
    f.levels = val(form, "sellLevels");
    f.orientation = val(form, "sellOrientation");
    f.view = val(form, "sellView");
    f.mitoyennete = val(form, "sellMitoyennete");
    f.kitchen = val(form, "sellKitchenType");
    f.heating = val(form, "sellHeating");
    f.heatingEnergy = val(form, "sellHeatingEnergy");
    f.hotWater = val(form, "sellHotWater");
    f.interiorState = val(form, "sellInteriorState");
    f.generalCondition = val(form, "sellGeneralCondition");
    f.standing = val(form, "sellStanding");
    f.buildYear = val(form, "sellBuildYear");
    f.constructionType = val(form, "sellConstructionType");
    f.buildingFloors = val(form, "sellBuildingFloors");
    f.buildingState = val(form, "sellBuildingState");
    f.description = val(form, "sellDescription");
    f.cave = val(form, "sellCaveCount");
    f.parkingExt = val(form, "sellParkingExt");
    f.parkingInt = val(form, "sellParkingInt");
    f.box = val(form, "sellBoxCount");
    f.garage = val(form, "sellGarageCount");
    f.equipements = checkedValues(form, "sellEquip[]");
    f.pluZone = val(form, "sellPluZone");
    f.cos = val(form, "sellCos");
    f.plotSurface = val(form, "sellPlotSurface");
    f.frontage = val(form, "sellFrontage");
    f.depth = val(form, "sellDepth");
    f.coproStatus = val(form, "sellCoproStatus");
    f.coproLots = val(form, "sellCoproLots") || val(form, "sellNbLots");
    f.coproTantiemes = val(form, "sellTantiemes");
    f.coproCharges = val(form, "sellCoproCharges");
    f.syndic = val(form, "sellSyndic");
    f.dpeExempt = !!form.querySelector('input[name="sellDpeExempt"]:checked');
    f.dpe = val(form, "sellDpe");
    f.dpeKwh = val(form, "sellDpeKwh");
    f.ges = val(form, "sellGes");
    f.gesKg = val(form, "sellGesKg");
    f.dpeDate = val(form, "sellDpeDate");
    f.dpeRefSurface = val(form, "sellDpeRefSurface");
    f.energyCostAnnual = val(form, "sellEnergyCostAnnual");
    f.availability = val(form, "sellAvailability");
    f.availabilityStart = val(form, "sellAvailabilityStart");
    f.environment = val(form, "sellEnvironment");
    f.listingUrl = val(form, "sellListingUrl");
    f.refAffaire = val(form, "sellRefAffaire");
    f.nMandat = val(form, "sellMandateNumber") || val(form, "sellNMandat");
    f.formeMandat = val(form, "sellMandateForm") || val(form, "sellFormeMandat");
    f.owners = collectOwners(form);
    f.roomRows = collectRoomRows(form);
    f.observations = val(form, "sellSpecialClause") || val(form, "sellNotes");
    f.updatedAt = new Date().toISOString();
    return f;
  }

  function d(details, section, key) {
    if (!details || !details[section]) return "";
    var v = details[section][key];
    return v == null ? "" : String(v);
  }

  function fromCrmProperty(prop) {
    var f = emptyFiche();
    prop = prop || {};
    var details = prop.details || {};
    f.source = "crm";
    f.id = prop.id || "";
    f.title = prop.title || "";
    f.listingType = prop.transaction || "vente";
    f.propertyType = prop.property_type || "";
    f.address = d(details, "localisation", "adresse") || prop.address || "";
    f.complement = d(details, "localisation", "complement");
    f.postalCode = d(details, "localisation", "code_postal") || prop.postal_code || "";
    f.city = d(details, "localisation", "ville") || prop.city || "";
    f.quartier = d(details, "localisation", "quartier");
    f.department = d(details, "localisation", "departement") || prop.department || "";
    f.digicode = d(details, "localisation", "digicode");
    f.floor = d(details, "localisation", "etage");
    f.prixNet = d(details, "finances", "prix_net") || prop.price_net || "";
    f.prixFai = d(details, "finances", "prix_fai") || prop.price_fai || "";
    f.honoraires = d(details, "finances", "honoraires") || prop.honoraires || "";
    f.chargeHonoraires = d(details, "finances", "charge_honoraires");
    f.chargesMensuelles = d(details, "finances", "charges_mensuelles");
    f.taxeFonciere = d(details, "finances", "taxe_fonciere");
    f.taxeHabitation = d(details, "finances", "taxe_habitation");
    f.surfaceHab = d(details, "surfaces", "surface_habitable") || prop.surface_m2 || "";
    f.surfaceCarrez = d(details, "surfaces", "surface_carrez");
    f.surfaceSejour = d(details, "surfaces", "surface_sejour");
    f.surfaceTerrain = d(details, "surfaces", "surface_terrain");
    f.rooms = d(details, "surfaces", "nb_pieces") || prop.rooms || "";
    f.bedrooms = d(details, "surfaces", "nb_chambres") || prop.bedrooms || "";
    f.bathrooms = d(details, "surfaces", "nb_sdb");
    f.levels = d(details, "surfaces", "nb_niveaux");
    f.kitchen = d(details, "interieur", "cuisine");
    f.heating = d(details, "interieur", "chauffage");
    f.hotWater = d(details, "interieur", "eau_chaude");
    f.description =
      d(details, "interieur", "descriptif_interieur") ||
      d(details, "commentaires", "observations_generales") ||
      "";
    f.pointsForts = d(details, "commentaires", "points_forts");
    f.pointsFaibles = d(details, "commentaires", "points_faibles");
    f.observations = d(details, "commentaires", "observations");
    f.notesInternes = d(details, "commentaires", "note_confidentielle");
    f.cave = d(details, "exterieur", "cave");
    f.garage = d(details, "exterieur", "garage");
    f.parkingExt = d(details, "exterieur", "parking");
    f.box = d(details, "exterieur", "box");
    f.plotSurface = d(details, "terrain", "surface_plancher") || d(details, "surfaces", "surface_terrain");
    f.pluZone = d(details, "terrain", "zonage");
    f.cos = d(details, "terrain", "cos");
    f.coproLots = d(details, "copropriete", "nb_lots");
    f.coproTantiemes = d(details, "copropriete", "tantiemes");
    f.coproCharges = d(details, "copropriete", "charges_copro");
    f.syndic = d(details, "copropriete", "syndic");
    f.dpe = d(details, "diagnostics", "conso_energie_primaire") || prop.dpe || "";
    f.dpeKwh = d(details, "diagnostics", "valeur_energie_primaire");
    f.ges = d(details, "diagnostics", "ges");
    f.gesKg = d(details, "diagnostics", "valeur_ges");
    f.dpeDate = d(details, "diagnostics", "date_dpe");
    f.dpeRefSurface = d(details, "diagnostics", "surface_ref_dpe");
    f.energyCostAnnual = d(details, "diagnostics", "cout_energie_max") || d(details, "diagnostics", "cout_energie_min");
    f.availability = d(details, "mandat", "disponibilite");
    f.listingUrl = d(details, "commentaires", "url_fiche") || prop.listing_url || "";
    f.refAffaire = d(details, "mandat", "ref_affaire");
    f.nMandat = d(details, "mandat", "n_mandat");
    f.formeMandat = d(details, "mandat", "forme_mandat");
    f.sectionCadastrale = d(details, "mandat", "section_cadastrale");
    f.numeroCadastre = d(details, "mandat", "numero_cadastre");
    f.refCadastrale = [f.sectionCadastrale, f.numeroCadastre].filter(Boolean).join(" ");
    f.buildYear = d(details, "mandat", "date_acquisition");
    var equips = [];
    if (d(details, "localisation", "ascenseur") === "Oui") equips.push("Ascenseur");
    if (d(details, "interieur", "alarme") === "Oui") equips.push("Alarme");
    if (d(details, "interieur", "fibre") === "Oui") equips.push("Fibre");
    if (d(details, "interieur", "cheminee") === "Oui") equips.push("Cheminée");
    if (d(details, "exterieur", "piscine") === "Oui") equips.push("Piscine");
    f.equipements = equips;
    f.updatedAt = new Date().toISOString();
    return f;
  }

  function merge(base, patch) {
    var out = emptyFiche();
    var a = base || {};
    var b = patch || {};
    Object.keys(out).forEach(function (k) {
      if (b[k] != null && b[k] !== "") out[k] = b[k];
      else if (a[k] != null) out[k] = a[k];
    });
    return out;
  }

  function ownerLines(owners) {
    return (owners || [])
      .map(function (o, i) {
        var name = [o.salutation, o.firstName, o.lastName].filter(Boolean).join(" ");
        var bits = [name || "Propriétaire " + (o.index || i + 1)];
        if (o.phone) bits.push(o.phone);
        if (o.email) bits.push(o.email);
        if (o.address || o.city) bits.push([o.address, o.postal, o.city].filter(Boolean).join(" "));
        return bits.join(" · ");
      })
      .filter(Boolean);
  }

  function bodyHtml(fiche) {
    var P = root.PrintDocument;
    if (!P) return "";
    var f = merge(emptyFiche(), fiche);

    var idRows = [
      { label: "Titre / intitulé", value: f.title },
      { label: "Transaction", value: f.listingType },
      { label: "Type de bien", value: [f.propertyType, f.propertySubtype].filter(Boolean).join(" — ") },
      { label: "Adresse", value: f.address },
      { label: "Complément", value: f.complement },
      { label: "Code postal", value: f.postalCode },
      { label: "Ville", value: f.city },
      { label: "Quartier", value: f.quartier },
      { label: "Département", value: f.department },
      { label: "Étage", value: f.floor },
      { label: "Digicode", value: f.digicode },
      { label: "Réf. cadastrale", value: f.refCadastrale },
      { label: "Section / n°", value: [f.sectionCadastrale, f.numeroCadastre].filter(Boolean).join(" / ") },
      { label: "Réf. affaire", value: f.refAffaire },
      { label: "N° mandat", value: f.nMandat },
      { label: "Forme mandat", value: f.formeMandat },
      { label: "URL annonce", value: f.listingUrl },
    ];

    var priceRows = [
      { label: "Prix net vendeur", value: f.prixNet ? f.prixNet + " €" : "" },
      { label: "Prix FAI", value: f.prixFai ? f.prixFai + " €" : "" },
      { label: "Honoraires", value: f.honoraires ? f.honoraires + " €" : "" },
      { label: "Honoraires à charge", value: f.chargeHonoraires },
      { label: "Affichage prix", value: f.priceDisplay },
      { label: "Charges mensuelles", value: f.chargesMensuelles ? f.chargesMensuelles + " €" : "" },
      { label: "Taxe foncière", value: f.taxeFonciere ? f.taxeFonciere + " €/an" : "" },
      { label: "Taxe d'habitation", value: f.taxeHabitation ? f.taxeHabitation + " €/an" : "" },
    ];

    var surfRows = [
      { label: "Surface habitable", value: f.surfaceHab ? f.surfaceHab + " m²" : "" },
      { label: "Surface Carrez", value: f.surfaceCarrez ? f.surfaceCarrez + " m²" : "" },
      { label: "Surface séjour", value: f.surfaceSejour ? f.surfaceSejour + " m²" : "" },
      { label: "Surface terrain", value: f.surfaceTerrain ? f.surfaceTerrain + " m²" : "" },
      { label: "Parcelle", value: f.plotSurface ? f.plotSurface + " m²" : "" },
      { label: "Pièces", value: f.rooms },
      { label: "Chambres", value: f.bedrooms },
      { label: "Salles d'eau", value: f.bathrooms },
      { label: "Niveaux", value: f.levels },
      { label: "Orientation", value: f.orientation },
      { label: "Vue", value: f.view },
      { label: "Mitoyenneté", value: f.mitoyennete },
      { label: "Façade / profondeur", value: [f.frontage, f.depth].filter(Boolean).join(" × ") },
      { label: "Zone PLU / COS", value: [f.pluZone, f.cos].filter(Boolean).join(" / ") },
    ];

    var descRows = [
      { label: "Cuisine", value: f.kitchen },
      { label: "Chauffage", value: f.heating },
      { label: "Énergie chauffage", value: f.heatingEnergy },
      { label: "Eau chaude", value: f.hotWater },
      { label: "État intérieur", value: f.interiorState },
      { label: "État général", value: f.generalCondition },
      { label: "Standing", value: f.standing },
      { label: "Année / type construction", value: [f.buildYear, f.constructionType].filter(Boolean).join(" — ") },
      { label: "Étages immeuble", value: f.buildingFloors },
      { label: "État immeuble", value: f.buildingState },
      { label: "Environnement", value: f.environment },
      { label: "Disponibilité", value: [f.availability, f.availabilityStart].filter(Boolean).join(" — ") },
      { label: "Équipements", value: (f.equipements || []).join(", ") },
      { label: "Cave / parking / box / garage", value: [f.cave, f.parkingExt, f.parkingInt, f.box, f.garage].filter(Boolean).join(" · ") },
    ];

    var coproRows = [
      { label: "Statut copropriété", value: f.coproStatus },
      { label: "Nb lots", value: f.coproLots },
      { label: "Tantièmes", value: f.coproTantiemes },
      { label: "Charges copro", value: f.coproCharges ? f.coproCharges + " €/mois" : "" },
      { label: "Syndic", value: f.syndic },
    ];

    var dpeRows = [
      { label: "Non soumis DPE", value: f.dpeExempt ? "Oui" : "" },
      { label: "DPE", value: f.dpe },
      { label: "DPE (kWh/m²/an)", value: f.dpeKwh },
      { label: "GES", value: f.ges },
      { label: "GES (kg CO₂/m²/an)", value: f.gesKg },
      { label: "Date DPE", value: f.dpeDate },
      { label: "Surface réf. DPE", value: f.dpeRefSurface ? f.dpeRefSurface + " m²" : "" },
      { label: "Dépenses énergie estimées", value: f.energyCostAnnual ? f.energyCostAnnual + " €/an" : "" },
    ];

    var ownerRows = ownerLines(f.owners).map(function (line, i) {
      return { label: "Propriétaire " + (i + 1), value: line };
    });

    var roomTable = "";
    if (f.roomRows && f.roomRows.length) {
      var headers = ["Niv.", "Pièce", "Surf.", "Dimensions", "Revêtement", "Expo"];
      var tableRows = f.roomRows.map(function (r) {
        return [r.level || r.niv || "", r.name || r.piece || "", r.surface || r.surf || "", r.dimensions || "", r.flooring || r.revetement || "", r.expo || r.exposure || ""];
      });
      roomTable = P.section("Détail des pièces", P.tableHtml(headers, tableRows));
    }

    return (
      P.section("Identification du bien", P.rowsHtml(idRows)) +
      P.section("Prix & fiscalité", P.rowsHtml(priceRows)) +
      P.section("Surfaces & composition", P.rowsHtml(surfRows)) +
      roomTable +
      P.section("Descriptif & équipements", P.rowsHtml(descRows)) +
      (f.description ? P.section("Texte descriptif", P.prose(f.description)) : "") +
      (f.pointsForts || f.pointsFaibles
        ? P.section(
            "Points forts / faibles",
            P.rowsHtml([
              { label: "Points forts", value: f.pointsForts },
              { label: "Points faibles", value: f.pointsFaibles },
            ])
          )
        : "") +
      P.section("Copropriété", P.rowsHtml(coproRows)) +
      P.section("Diagnostics énergétiques", P.rowsHtml(dpeRows)) +
      (ownerRows.length ? P.section("Propriétaires", P.rowsHtml(ownerRows)) : "") +
      (f.observations ? P.section("Observations", P.prose(f.observations)) : "") +
      (f.notesInternes ? P.section("Notes internes", P.note(f.notesInternes)) : "")
    );
  }

  function print(fiche, extra) {
    extra = extra || {};
    var P = root.PrintDocument;
    if (!P) {
      if (typeof alert === "function") alert("Impression indisponible — rechargez la page.");
      return "";
    }
    var f = merge(emptyFiche(), fiche);
    var title = f.title || [f.city, f.propertyType].filter(Boolean).join(" — ") || "Fiche descriptive du bien";
    return P.open({
      kind: "bien",
      kindLabel: extra.kindLabel || "Fiche descriptive du bien",
      title: title,
      subtitle: extra.subtitle || "Document de travail — éditable puis Imprimer → Enregistrer en PDF",
      meta: (extra.meta || []).concat([
        f.postalCode && f.city ? f.postalCode + " " + f.city : f.city,
        f.listingType,
        f.refAffaire || f.nMandat,
      ]).filter(Boolean),
      bodyHtml: bodyHtml(f),
      footnote:
        extra.footnote ||
        "Fiche descriptive indicative, non contractuelle. Les mentions DPE/GES et honoraires doivent être conformes aux documents officiels et au mandat signé.",
    });
  }

  function listDrafts() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var db = raw ? JSON.parse(raw) : { drafts: [] };
      return Array.isArray(db.drafts) ? db.drafts : [];
    } catch (e) {
      return [];
    }
  }

  function saveDraft(fiche) {
    var f = merge(emptyFiche(), fiche);
    f.updatedAt = new Date().toISOString();
    if (!f.id) f.id = "fiche_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
    var drafts = listDrafts().filter(function (d) {
      return d.id !== f.id;
    });
    drafts.unshift(f);
    drafts = drafts.slice(0, 40);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ drafts: drafts, updatedAt: f.updatedAt }));
    return f;
  }

  function loadDraft(id) {
    return (
      listDrafts().filter(function (d) {
        return d.id === id;
      })[0] || null
    );
  }

  function deleteDraft(id) {
    var drafts = listDrafts().filter(function (d) {
      return d.id !== id;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ drafts: drafts, updatedAt: new Date().toISOString() }));
  }

  function setTransfer(fiche) {
    try {
      sessionStorage.setItem(TRANSFER_KEY, JSON.stringify(merge(emptyFiche(), fiche)));
    } catch (e) {}
  }

  function consumeTransfer() {
    try {
      var raw = sessionStorage.getItem(TRANSFER_KEY);
      if (!raw) return null;
      sessionStorage.removeItem(TRANSFER_KEY);
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function editorUrl(opts) {
    opts = opts || {};
    var base = opts.base || "/landings/fiche-descriptive-bien.html";
    var qs = [];
    if (opts.id) qs.push("id=" + encodeURIComponent(opts.id));
    if (opts.prop) qs.push("prop=" + encodeURIComponent(opts.prop));
    if (opts.from) qs.push("from=" + encodeURIComponent(opts.from));
    return qs.length ? base + "?" + qs.join("&") : base;
  }

  var api = {
    STORAGE_KEY: STORAGE_KEY,
    TRANSFER_KEY: TRANSFER_KEY,
    emptyFiche: emptyFiche,
    fromSellForm: fromSellForm,
    fromCrmProperty: fromCrmProperty,
    merge: merge,
    bodyHtml: bodyHtml,
    print: print,
    listDrafts: listDrafts,
    saveDraft: saveDraft,
    loadDraft: loadDraft,
    deleteDraft: deleteDraft,
    setTransfer: setTransfer,
    consumeTransfer: consumeTransfer,
    editorUrl: editorUrl,
  };

  if (typeof module === "object" && module.exports) module.exports = api;
  root.FicheDescriptiveBien = api;
})(typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : this);
