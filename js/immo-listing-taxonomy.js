/**
 * Taxonomie annonce / bien — alignée fiche CRM (Laforêt / portails).
 */
(function (global) {
  var LISTING_TYPES = [
    { v: "cession_bail", t: "Cession de bail" },
    { v: "location", t: "Location" },
    { v: "location_vacances", t: "Location vacances" },
    { v: "produit_investissement", t: "Produit d'investissement" },
    { v: "vente", t: "Vente" },
    { v: "vente_prestige", t: "Vente de prestige" },
    { v: "viager", t: "Viager" },
    { v: "fonds_commerce", t: "Vente fonds de commerce / murs commerciaux / parts de société" },
  ];

  var PROPERTY_CATEGORIES = [
    { v: "appartement", t: "Appartement" },
    { v: "maison", t: "Maison / villa" },
    { v: "terrain", t: "Terrain" },
    { v: "immeuble", t: "Immeuble" },
    { v: "local", t: "Local / commerce" },
    { v: "parking", t: "Parking / box" },
    { v: "entreprise", t: "Entreprise / fonds" },
    { v: "hotel_particulier", t: "Hôtel particulier" },
  ];

  var COPRO_STATUS = [
    { v: "", t: "— Choisir —" },
    { v: "oui", t: "Oui — bien soumis au statut de la copropriété" },
    { v: "non", t: "Non — pas de copropriété" },
    { v: "na", t: "Non applicable / non renseigné" },
  ];

  var ENVIRONMENTS = [
    { v: "", t: "— Choisir —" },
    { v: "bois", t: "bois" },
    { v: "village", t: "village" },
    { v: "campagne_isolee", t: "campagne isolée" },
    { v: "campagne_non_isolee", t: "campagne non-isolée" },
    { v: "centre_ville", t: "centre ville" },
    { v: "clos_prive", t: "clos privé" },
    { v: "lotissement", t: "lotissement" },
    { v: "parc", t: "parc" },
    { v: "plage", t: "plage" },
    { v: "urbain", t: "urbain" },
    { v: "zone_commerciale", t: "zone Commerciale" },
    { v: "zone_residentielle", t: "zone Résidentielle" },
  ];

  /** Sous-types complets (liste portails / CRM). */
  var PROPERTY_SUBTYPES = [
    "appartement",
    "Bar",
    "Bar Tabac",
    "bastide",
    "bastidon",
    "bergerie",
    "cabanon",
    "Chalet",
    "Chambre de service",
    "Commerce alimentaire",
    "corps de ferme",
    "demeure",
    "domaine",
    "Duplex",
    "Échoppe",
    "Entrepôt",
    "entreprises",
    "Exploitation agricole",
    "Exploitation viticole",
    "ferme",
    "Fermette",
    "grange",
    "hôtel particulier",
    "Île",
    "immeuble",
    "Immeuble commercial",
    "Immeuble de bureaux",
    "Immeuble mixte",
    "local",
    "Local d'activités",
    "Local de stockage",
    "Loft",
    "Lotissement",
    "maison ancienne",
    "maison basque",
    "maison charentaise",
    "maison contemporaine",
    "maison d'architecte",
    "Maison de loisirs",
    "maison de maître",
    "maison de village",
    "maison de ville",
    "Maison d'hôte",
    "Maison en pierre",
    "maison jumelée",
    "maison landaise",
    "maison longère",
    "maison/villa",
    "Maison provençale",
    "Maison traditionnelle",
    "manoir",
    "mas",
    "mazet",
    "moulin",
    "parking/box",
    "pavillon",
    "Programme",
    "Projet (uniquement pour \"Construire\")",
    "propriété",
    "Propriété de chasse",
    "Propriété équestre",
    "Restauration",
    "Riad",
    "Studette",
    "Tabac Presse",
    "terrain",
    "Terrain agricole",
    "Terrain commercial",
    "Terrain de loisirs",
    "Terrain industriel",
    "Terrain viticole",
    "toulousaine",
    "Triplex",
    "villa",
  ];

  /** Activités commerciales CRM — groupées (portails / Laforêt). */
  var COMMERCIAL_ACTIVITIES = [
    {
      label: "INDUSTRIE / PRODUCTION",
      items: [
        "Agriculture Viticulture",
        "Agroalimentaire",
        "BTP",
        "Charpente Menuiserie",
        "Mécanique Métallurgie",
        "Divers Industrie",
        "Liquidation Industrie",
      ],
    },
    {
      label: "CHR ville",
      items: [
        "Bar Brasserie Tabac",
        "Camping",
        "Club discothèque",
        "Creperie Pizzeria",
        "Hotel Hotel restaurant",
        "Restaurant",
        "Restauration rapide",
        "Salon de thé",
        "Sandwicherie",
        "Liquidation CHR",
      ],
    },
    {
      label: "SERVICES",
      items: [
        "Agence Immobilière",
        "Beauté Esthétique Coiffure",
        "Conseil",
        "Club de Sport Salle de Gym",
        "Dépannage Réparation",
        "Garage Station service",
        "Loisirs Tourisme",
        "Nettoyage Laverie Pressing",
        "Pharmacie Parapharmacie",
        "Professions libérales",
        "Prestations multimedia SSII",
        "Publicité",
        "Santé Optique",
        "Taxi",
        "Transport Logistique",
        "Entrepôt logistique",
        "Vidéo Photo",
        "Divers Services",
        "Liquidation Services",
      ],
    },
    {
      label: "COMMERCES / NÉGOCE",
      items: [
        "Alimentation",
        "Animalerie Chasse Peche",
        "Boucherie Charcuterie",
        "Boulangerie Patisserie",
        "Cadeaux Fleurs",
        "Chaussure Cuir",
        "Habillement Textile",
        "HiFi Electroménager",
        "Informatique Multimédia",
        "Librairie Papeterie",
        "Mobilier Décoration",
        "Tabac Presse Loto",
        "Traiteur",
        "Divers Commerces",
        "Liquidation Commerces / Négoce",
      ],
    },
    {
      label: "ARTISANAT BÂTIMENT",
      items: [
        "Carrelage Maconnerie",
        "Couverture Charpente",
        "Electricité Electronique",
        "Menuiserie",
        "Peinture Vitrerie Platrerie",
        "Plomberie Chauffage",
        "Serrurerie métallerie",
        "Divers Artisanat Batiment",
        "Liquidation Artisanat Batiment",
      ],
    },
    {
      label: "LOCAL TERRAIN BIENS IMMOBILIERS",
      items: [
        "Bureau",
        "Immeuble commercial / mixte",
        "Entrepot",
        "Local artisanal",
        "Local commercial Murs",
        "Local industriel",
        "Parking",
        "Terrain industriel",
        "Terre agricole",
        "Divers Local Terrain Biens immobiliers",
      ],
    },
  ];

  var GENERAL_CONDITIONS = [
    { v: "", t: "— Choisir —" },
    { v: "tres_bon", t: "Très bon" },
    { v: "bon", t: "Bon" },
    { v: "moyen", t: "Moyen" },
    { v: "a_renover", t: "À rénover" },
    { v: "a_restaurer", t: "À restaurer" },
    { v: "neuf", t: "Neuf / récent" },
  ];

  var PRICE_DISPLAY = [
    { v: "prix_hai", t: "Prix HAI" },
    { v: "nous_consulter", t: "Prix : nous consulter" },
  ];

  /** Catégories pro → activité commerciale recommandée. */
  var PRO_CATEGORIES = { local: 1, entreprise: 1, parking: 0, fonds_commerce: 1 };

  function slugSubtype(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  }

  function legacyPropertyType(category, subtype) {
    var cat = category || "";
    var sub = String(subtype || "").toLowerCase();
    if (cat === "appartement" || sub.indexOf("appartement") >= 0 || sub === "duplex" || sub === "triplex" || sub === "loft" || sub.indexOf("studette") >= 0)
      return "appartement";
    if (cat === "terrain" || sub.indexOf("terrain") >= 0 || sub.indexOf("programme") >= 0 || sub.indexOf("projet") >= 0) return "terrain";
    if (cat === "immeuble" || sub.indexOf("immeuble") >= 0) return "immeuble";
    if (
      cat === "local" ||
      cat === "entreprise" ||
      sub.indexOf("local") >= 0 ||
      sub.indexOf("commerce") >= 0 ||
      sub.indexOf("entrep") >= 0 ||
      sub === "bar" ||
      sub.indexOf("bar tabac") >= 0 ||
      sub.indexOf("tabac presse") >= 0 ||
      sub.indexOf("restauration") >= 0
    )
      return "local";
    if (cat === "maison" || sub.indexOf("maison") >= 0 || sub === "villa" || sub.indexOf("chalet") >= 0 || sub.indexOf("pavillon") >= 0 || sub.indexOf("propriete") >= 0 || sub.indexOf("propriété") >= 0 || sub.indexOf("riad") >= 0) return "maison";
    return cat || "maison";
  }

  function optionsHtml(list, placeholder) {
    var out = placeholder ? '<option value="">' + placeholder + "</option>" : "";
    list.forEach(function (o) {
      if (typeof o === "string") {
        out += '<option value="' + slugSubtype(o) + '">' + o + "</option>";
      } else {
        out += '<option value="' + o.v + '">' + o.t + "</option>";
      }
    });
    return out;
  }

  function sortedSubtypes() {
    return PROPERTY_SUBTYPES.slice().sort(function (a, b) {
      return a.localeCompare(b, "fr", { sensitivity: "base" });
    });
  }

  function normalizeSearch(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function filteredEnvironments(filter) {
    var q = normalizeSearch(filter);
    return ENVIRONMENTS.filter(function (o) {
      if (!o.v) return !q;
      if (!q) return true;
      return normalizeSearch(o.t).indexOf(q) >= 0;
    });
  }

  function commercialActivityLabel(slug) {
    var target = String(slug || "");
    for (var gi = 0; gi < COMMERCIAL_ACTIVITIES.length; gi++) {
      var group = COMMERCIAL_ACTIVITIES[gi];
      for (var ii = 0; ii < group.items.length; ii++) {
        var label = group.items[ii];
        if (slugSubtype(label) === target) return label;
      }
    }
    return target;
  }

  function filteredCommercialGroups(filter) {
    var q = normalizeSearch(filter);
    return COMMERCIAL_ACTIVITIES.map(function (group) {
      var items = group.items.filter(function (label) {
        if (!q) return true;
        return normalizeSearch(label).indexOf(q) >= 0 || normalizeSearch(group.label).indexOf(q) >= 0;
      });
      return { label: group.label, items: items };
    }).filter(function (group) {
      return group.items.length > 0;
    });
  }

  function groupedOptionsHtml(groups, placeholder) {
    var out = placeholder ? '<option value="">' + placeholder + "</option>" : "";
    groups.forEach(function (group) {
      out += '<optgroup label="' + group.label + '">';
      group.items.forEach(function (label) {
        out += '<option value="' + slugSubtype(label) + '">' + label + "</option>";
      });
      out += "</optgroup>";
    });
    return out;
  }

  global.ImmoListingTaxonomy = {
    LISTING_TYPES: LISTING_TYPES,
    PROPERTY_CATEGORIES: PROPERTY_CATEGORIES,
    PROPERTY_SUBTYPES: PROPERTY_SUBTYPES,
    COPRO_STATUS: COPRO_STATUS,
    ENVIRONMENTS: ENVIRONMENTS,
    COMMERCIAL_ACTIVITIES: COMMERCIAL_ACTIVITIES,
    GENERAL_CONDITIONS: GENERAL_CONDITIONS,
    PRICE_DISPLAY: PRICE_DISPLAY,
    PRO_CATEGORIES: PRO_CATEGORIES,
    slugSubtype: slugSubtype,
    legacyPropertyType: legacyPropertyType,
    optionsHtml: optionsHtml,
    sortedSubtypes: sortedSubtypes,
    normalizeSearch: normalizeSearch,
    commercialActivityLabel: commercialActivityLabel,
    filteredCommercialGroups: filteredCommercialGroups,
    groupedOptionsHtml: groupedOptionsHtml,
    filteredEnvironments: filteredEnvironments,
  };
})(typeof window !== "undefined" ? window : global);
