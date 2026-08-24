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
    { v: "centre_ville", t: "Centre-ville" },
    { v: "peripherie", t: "Périphérie / périurbain" },
    { v: "campagne", t: "Campagne" },
    { v: "littoral", t: "Bord de mer / littoral" },
    { v: "montagne", t: "Montagne / station" },
    { v: "zone_commerciale", t: "Zone commerciale" },
    { v: "zone_industrielle", t: "Zone industrielle" },
    { v: "residentiel", t: "Quartier résidentiel" },
    { v: "rural", t: "Zone rurale" },
    { v: "autre", t: "Autre" },
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
    "échoppe",
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
    "terrain",
    "Terrain de loisirs",
    "Terrain industriel",
    "Terrain viticole",
    "toulousaine",
    "Triplex",
    "villa",
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
    if (cat === "appartement" || sub.indexOf("appartement") >= 0 || sub === "duplex" || sub === "triplex" || sub === "loft")
      return "appartement";
    if (cat === "terrain" || sub.indexOf("terrain") >= 0) return "terrain";
    if (cat === "immeuble" || sub.indexOf("immeuble") >= 0) return "immeuble";
    if (
      cat === "local" ||
      cat === "entreprise" ||
      sub.indexOf("local") >= 0 ||
      sub.indexOf("commerce") >= 0 ||
      sub.indexOf("entrep") >= 0 ||
      sub === "bar" ||
      sub.indexOf("bar tabac") >= 0
    )
      return "local";
    if (cat === "maison" || sub.indexOf("maison") >= 0 || sub === "villa" || sub.indexOf("chalet") >= 0) return "maison";
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

  global.ImmoListingTaxonomy = {
    LISTING_TYPES: LISTING_TYPES,
    PROPERTY_CATEGORIES: PROPERTY_CATEGORIES,
    PROPERTY_SUBTYPES: PROPERTY_SUBTYPES,
    COPRO_STATUS: COPRO_STATUS,
    ENVIRONMENTS: ENVIRONMENTS,
    PRO_CATEGORIES: PRO_CATEGORIES,
    slugSubtype: slugSubtype,
    legacyPropertyType: legacyPropertyType,
    optionsHtml: optionsHtml,
    sortedSubtypes: sortedSubtypes,
  };
})(typeof window !== "undefined" ? window : global);
