/**
 * Barème public Immobilier Email / Les Portes Clés — TG0422.
 * Taux extraits du PDF « BARÈME DES HONORAIRES » (TVA 20 % métropole).
 * Honoraires = maximums ; rediscutables au mandat.
 */
(function (root, factory) {
  var api = factory();
  root.BaremeHonorairesLib = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var TVA = 0.2;

  var LOCATION_ZONES = {
    "tres-tendue": {
      id: "tres-tendue",
      label: "Zone très tendue",
      hint: "Arrêté du 30 septembre 2014, annexe 1 tableau A bis (art. R. 304-1 CCH).",
      dossierTtcPerM2: 12.1
    },
    tendue: {
      id: "tendue",
      label: "Zone tendue",
      hint: "Décret n° 2013-392 (TLV), hors communes déjà « très tendues ».",
      dossierTtcPerM2: 10.09
    },
    hors: {
      id: "hors",
      label: "Hors zone tendue",
      hint: "Communes hors listes TLV / très tendues (ex. Lunéville).",
      dossierTtcPerM2: 8.07
    }
  };

  var RATES = {
    tva: TVA,
    locationHabitation: {
      negotiationTtcPerM2: 10,
      etatDesLieuxTtcPerM2: 3.03,
      zones: LOCATION_ZONES,
      decree: "2014-890",
      sharing:
        "Honoraires locataire plafonnés au décret 2014-890 : part locataire ≤ part bailleur, et ≤ plafonds ci-dessus."
    },
    locationPro: {
      rateTtcOfAnnualRentTtc: 0.18,
      charge: "preneur"
    },
    bailCommercial: {
      rateHtOfAnnualRentHt: 0.3,
      minimumHt: 7000,
      charge: "preneur"
    },
    venteAutres: {
      rateTtc: 0.1,
      charge: "vendeur",
      scope: "Terrains, bureaux, commerces, immeubles de rapport — hors habitation."
    },
    avisValeur: {
      forfaitTtc: 360,
      maisonMaxM2: 100,
      appartMaxM2: 50,
      charge: "proprietaire"
    }
  };

  function round2(n) {
    return Math.round(Number(n) * 100) / 100;
  }

  function euro(n) {
    return round2(n).toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR"
    });
  }

  function parsePositive(value) {
    var n = Number(String(value == null ? "" : value).replace(",", "."));
    return Number.isFinite(n) && n > 0 ? n : 0;
  }

  function htToTtc(ht) {
    return round2(ht * (1 + TVA));
  }

  function resolveZone(zoneId) {
    var raw = String(zoneId || "tendue")
      .toLowerCase()
      .replace(/_/g, "-");
    if (raw === "tres-tendue" || raw === "très-tendue" || raw === "tres") {
      return LOCATION_ZONES["tres-tendue"];
    }
    if (raw === "hors" || raw === "hors-zone" || raw === "horszone") {
      return LOCATION_ZONES.hors;
    }
    return LOCATION_ZONES.tendue;
  }

  /**
   * Location habitation — € TTC / m² surface habitable.
   * Négociation : 10 € TTC/m² à la charge du bailleur.
   * Dossier + visite + rédaction du bail : même taux bailleur et locataire (zone).
   * État des lieux : 3,03 € TTC/m² chacun.
   */
  function computeLocationHabitation(surfaceM2, zoneId) {
    var zone = resolveZone(zoneId);
    var m2 = parsePositive(surfaceM2);
    if (!m2) {
      return { ok: false, error: "surface", zone: zone };
    }
    var nego = round2(RATES.locationHabitation.negotiationTtcPerM2 * m2);
    var dossier = round2(zone.dossierTtcPerM2 * m2);
    var edl = round2(RATES.locationHabitation.etatDesLieuxTtcPerM2 * m2);
    var bailleur = round2(nego + dossier + edl);
    var locataire = round2(dossier + edl);
    return {
      ok: true,
      zone: zone,
      surfaceM2: m2,
      lines: {
        negotiationBailleur: nego,
        dossierBailleur: dossier,
        dossierLocataire: dossier,
        edlBailleur: edl,
        edlLocataire: edl
      },
      bailleurTtc: bailleur,
      locataireTtc: locataire,
      totalAgenceTtc: round2(bailleur + locataire),
      locataireLeqBailleur: locataire <= bailleur
    };
  }

  /** Location locaux professionnels / commerciaux : 18 % TTC du loyer TTC annuel, charge preneur. */
  function computeLocationPro(annualRentTtc) {
    var rent = parsePositive(annualRentTtc);
    if (!rent) return { ok: false, error: "loyer" };
    var honoraires = round2(rent * RATES.locationPro.rateTtcOfAnnualRentTtc);
    return {
      ok: true,
      annualRentTtc: rent,
      rate: RATES.locationPro.rateTtcOfAnnualRentTtc,
      honorairesTtc: honoraires,
      charge: "preneur"
    };
  }

  /** Bail commercial : 30 % HT du loyer annuel HT, mini 7 000 € HT, charge preneur. */
  function computeBailCommercial(annualRentHt) {
    var rent = parsePositive(annualRentHt);
    if (!rent) return { ok: false, error: "loyer" };
    var raw = round2(rent * RATES.bailCommercial.rateHtOfAnnualRentHt);
    var min = RATES.bailCommercial.minimumHt;
    var appliedMin = raw < min;
    var ht = appliedMin ? min : raw;
    return {
      ok: true,
      annualRentHt: rent,
      rate: RATES.bailCommercial.rateHtOfAnnualRentHt,
      rawHt: raw,
      minimumHt: min,
      appliedMinimum: appliedMin,
      honorairesHt: ht,
      honorairesTtc: htToTtc(ht),
      charge: "preneur"
    };
  }

  /** Vente terrains / bureaux / commerces / immeubles hors habitation : 10 % TTC. */
  function computeVenteAutres(priceTtc) {
    var price = parsePositive(priceTtc);
    if (!price) return { ok: false, error: "prix" };
    var honoraires = round2(price * RATES.venteAutres.rateTtc);
    return {
      ok: true,
      price: price,
      rate: RATES.venteAutres.rateTtc,
      honorairesTtc: honoraires,
      netVendeur: price,
      fai: round2(price + honoraires),
      charge: "vendeur"
    };
  }

  /**
   * Avis de valeur : 360 € TTC si maison < 100 m² ou appart < 50 m² ; sinon devis.
   */
  function computeAvisValeur(kind, surfaceM2) {
    var m2 = parsePositive(surfaceM2);
    if (!m2) return { ok: false, error: "surface" };
    var k = kind === "maison" ? "maison" : "appartement";
    var eligible =
      (k === "maison" && m2 < RATES.avisValeur.maisonMaxM2) ||
      (k === "appartement" && m2 < RATES.avisValeur.appartMaxM2);
    return {
      ok: true,
      kind: k,
      surfaceM2: m2,
      eligibleForfait: eligible,
      honorairesTtc: eligible ? RATES.avisValeur.forfaitTtc : null,
      charge: "proprietaire"
    };
  }

  return {
    TVA: TVA,
    RATES: RATES,
    LOCATION_ZONES: LOCATION_ZONES,
    round2: round2,
    euro: euro,
    parsePositive: parsePositive,
    htToTtc: htToTtc,
    resolveZone: resolveZone,
    computeLocationHabitation: computeLocationHabitation,
    computeLocationPro: computeLocationPro,
    computeBailCommercial: computeBailCommercial,
    computeVenteAutres: computeVenteAutres,
    computeAvisValeur: computeAvisValeur
  };
});
