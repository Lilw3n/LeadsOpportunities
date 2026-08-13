/**
 * Mappe un lead site (payload questionnaire acquéreur) → critères matching CRM.
 */
window.CrmImmoLeadToCriteria = (function () {
  var TYPE_MAP = [
    [/appart/i, "appartement"],
    [/maison/i, "maison"],
    [/terrain/i, "terrain"],
    [/local|commercial|mixte/i, "local"],
    [/immeuble/i, "immeuble"],
    [/parking|garage/i, "parking"],
  ];

  function num(v) {
    if (v == null || v === "") return null;
    var n = Number(String(v).replace(/\s/g, "").replace(",", "."));
    return isNaN(n) ? null : n;
  }

  function listify(v) {
    if (Array.isArray(v)) return v.map(String).map(function (s) { return s.trim(); }).filter(Boolean);
    if (v == null || v === "") return [];
    return String(v)
      .split(/[,;|]/)
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
  }

  function mapPropertyType(raw) {
    var s = String(raw || "");
    if (!s) return [];
    /* déjà un id matcher */
    if (/^(appartement|maison|terrain|local|immeuble|parking|complexe)$/i.test(s)) {
      return [s.toLowerCase()];
    }
    for (var i = 0; i < TYPE_MAP.length; i++) {
      if (TYPE_MAP[i][0].test(s)) return [TYPE_MAP[i][1]];
    }
    return [];
  }

  function buyerNeeds(payload) {
    var n = payload.buyerNeeds;
    if (Array.isArray(n)) return n;
    if (typeof n === "string" && n) return [n];
    return [];
  }

  function fromLeadPayload(payload, meta) {
    payload = payload || {};
    meta = meta || {};
    var types = mapPropertyType(payload.propertyTypeId || payload.propertyType);
    var surface = num(payload.propertySurface);
    var price = num(payload.budgetMax) || num(payload.propertyPrice);
    var budgetMin = num(payload.budgetMin);
    var rooms = num(payload.roomsMin || payload.rooms);
    var beds = num(payload.bedroomsMin || payload.bedrooms);
    var cp = payload.postalProject || payload.postalSearch || payload.postalCode || "";
    var cities = listify(payload.searchCities || payload.cityFull || "");
    var needs = buyerNeeds(payload);

    var notes = [];
    if (needs.length) notes.push("Besoins : " + needs.join(", "));
    if (payload.insuranceBorrower) notes.push("ADE : " + payload.insuranceBorrower);
    if (payload.propertyFound) notes.push("Avancement : " + payload.propertyFound);
    if (payload.horizon) notes.push("Horizon : " + payload.horizon);
    if (payload.downPayment) notes.push("Apport : " + payload.downPayment + " €");
    if (payload.loanDuration) notes.push("Durée : " + payload.loanDuration);
    if (payload.netIncome) notes.push("Revenus nets : " + payload.netIncome + " €/mois");

    var labelBits = [];
    if (meta.email) labelBits.push(String(meta.email).split("@")[0]);
    if (types[0]) labelBits.push(types[0]);
    if (cp) labelBits.push(cp);
    if (price) labelBits.push("≤ " + Math.round(price).toLocaleString("fr-FR") + " €");

    return {
      label: labelBits.length ? "Lead — " + labelBits.join(" · ") : "Lead acquéreur",
      lead_id: meta.leadId || payload.leadId || null,
      contact_id: meta.contactId || null,
      property_types: types,
      cities: cities,
      postal_codes: cp ? [String(cp).slice(0, 5)] : [],
      departments: cp && String(cp).length >= 2 ? [String(cp).slice(0, 2)] : [],
      surface_min: surface != null ? Math.max(0, Math.round(surface * 0.85)) : null,
      surface_max: surface != null ? Math.round(surface * 1.25) : null,
      rooms_min: rooms,
      bedrooms_min: beds,
      budget_min: budgetMin,
      budget_max: price,
      price_mode: "fai",
      want_garage: !!(payload.wantGarage === "1" || payload.wantGarage === true || payload.wantGarage === "on"),
      want_parking: !!(payload.wantParking === "1" || payload.wantParking === true || payload.wantParking === "on"),
      want_cave: !!(payload.wantCave === "1" || payload.wantCave === true || payload.wantCave === "on"),
      want_garden: !!(payload.wantGarden === "1" || payload.wantGarden === true || payload.wantGarden === "on"),
      want_terrace: !!(payload.wantTerrace === "1" || payload.wantTerrace === true || payload.wantTerrace === "on"),
      want_balcony: !!(payload.wantBalcony === "1" || payload.wantBalcony === true || payload.wantBalcony === "on"),
      want_elevator: !!(payload.wantElevator === "1" || payload.wantElevator === true || payload.wantElevator === "on"),
      notes: notes.join(" · "),
      _finance: {
        propertyPrice: num(payload.propertyPrice),
        downPayment: num(payload.downPayment),
        loanDuration: payload.loanDuration || "",
        income: num(payload.netIncome),
        worksAmount: num(payload.worksAmount),
        insuranceBorrower: payload.insuranceBorrower || "",
        buyerNeeds: needs,
      },
    };
  }

  function fromLeadRow(row) {
    row = row || {};
    var payload = row.payload;
    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        payload = {};
      }
    }
    return fromLeadPayload(payload || {}, {
      leadId: row.id,
      contactId: row.contact_id || null,
      email: row.email || (payload && payload.email),
    });
  }

  return {
    fromLeadPayload: fromLeadPayload,
    fromLeadRow: fromLeadRow,
    mapPropertyType: mapPropertyType,
  };
})();
