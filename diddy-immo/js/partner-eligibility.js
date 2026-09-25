/**
 * Eligibilite partenaires grossistes — inspire partnerEligibilityService + wholesalerPartners (multisite).
 */
window.PartnerEligibility = {
  PARTNERS: [
    {
      id: "sollyazar",
      displayName: "Solly Azar Pro",
      products: ["vtc-taxi", "auto"],
      minAge: 27,
      maxAge: 65,
      minLicenseYears: 5,
      bonusMin: 0.5,
      bonusMax: 0.85,
      maxMaterialClaims: 2,
      maxBodilyResp: 0,
    },
    {
      id: "zephir",
      displayName: "Zephir VTC Taxi",
      products: ["vtc-taxi"],
      minAge: 23,
      maxAge: 70,
      minLicenseYears: 3,
      bonusMin: 0.5,
      bonusMax: 1.5,
      maxMaterialClaims: 3,
      maxBodilyResp: 1,
    },
    {
      id: "2m2a",
      displayName: "2M2A VTC Taxi",
      products: ["vtc-taxi"],
      minAge: 25,
      maxAge: 68,
      minLicenseYears: 4,
      bonusMin: 0.5,
      bonusMax: 1.0,
      maxMaterialClaims: 0,
      maxBodilyResp: 0,
    },
    {
      id: "april",
      displayName: "April",
      products: ["sante", "habitation", "auto"],
      minAge: 18,
      maxAge: 75,
      minLicenseYears: 0,
      bonusMin: 0.5,
      bonusMax: 2.5,
      maxMaterialClaims: 5,
      maxBodilyResp: 2,
    },
  ],

  countClaims: function (claims, months) {
    var since = Date.now() - months * 30 * 24 * 60 * 60 * 1000;
    var material = 0;
    var bodilyResp = 0;
    (claims || []).forEach(function (c) {
      if (!c.claim_date) return;
      if (new Date(c.claim_date).getTime() < since) return;
      if (c.claim_type && String(c.claim_type).indexOf("bodily") === 0 && c.responsible) bodilyResp++;
      else material++;
    });
    return { material: material, bodilyResp: bodilyResp };
  },

  checkPartner: function (partner, data) {
    var score = 100;
    var reasons = [];
    var missing = [];
    var eligible = true;

    if (data.age == null || isNaN(data.age)) {
      missing.push("Age");
    } else {
      if (data.age < partner.minAge || data.age > partner.maxAge) {
        eligible = false;
        score -= 30;
        reasons.push("Age hors plage (" + partner.minAge + "-" + partner.maxAge + ")");
      } else reasons.push("Age OK");
    }

    if (partner.minLicenseYears > 0) {
      if (data.licenseYears == null) missing.push("Anciennete permis");
      else if (data.licenseYears < partner.minLicenseYears) {
        eligible = false;
        score -= 25;
        reasons.push("Permis < " + partner.minLicenseYears + " ans");
      } else reasons.push("Permis OK");
    }

    if (data.bonusMalus != null && !isNaN(data.bonusMalus)) {
      if (data.bonusMalus < partner.bonusMin || data.bonusMalus > partner.bonusMax) {
        eligible = false;
        score -= 20;
        reasons.push("Bonus-malus hors plage");
      } else reasons.push("Bonus OK");
    } else missing.push("Bonus-malus");

    var cc = this.countClaims(data.claims, 36);
    if (data.claimsCount36 != null && !isNaN(data.claimsCount36)) {
      if (data.claimsCount36 > 3) {
        eligible = false;
        score -= 25;
        reasons.push("Trop de sinistres: " + data.claimsCount36 + " (maximum: 3 sur 36 mois)");
      } else if (data.claimsCount36 > partner.maxMaterialClaims) {
        eligible = false;
        score -= 20;
        reasons.push("Sinistres hors critère partenaire (" + data.claimsCount36 + ")");
      } else reasons.push("Sinistres OK (" + data.claimsCount36 + "/36 mois)");
    } else if (cc.material > partner.maxMaterialClaims) {
      eligible = false;
      score -= 20;
      reasons.push("Trop sinistres materiels (" + cc.material + ")");
    }
    if (cc.bodilyResp > partner.maxBodilyResp) {
      eligible = false;
      score -= 25;
      reasons.push("Sinistre corporel responsable non admis");
    }

    if (!data.drivers || !data.drivers.length) {
      score -= 10;
      reasons.push("Aucun conducteur");
    }
    if (!data.vehicles || !data.vehicles.length) {
      score -= 10;
      reasons.push("Aucun vehicule");
    }

    return {
      partnerId: partner.id,
      partnerName: partner.displayName,
      isEligible: eligible && score >= 55,
      score: Math.max(0, Math.min(100, score)),
      reasons: reasons,
      missingInfo: missing,
    };
  },

  checkAll: function (productType, input, ctx) {
    var product = productType || "vtc-taxi";
    return this.PARTNERS.filter(function (p) {
      return p.products.indexOf(product) !== -1 || p.products.indexOf("auto") !== -1;
    }).map(function (p) {
      return PartnerEligibility.checkPartner(p, {
        age: parseInt(input.age, 10),
        licenseYears: parseInt(input.licenseYears, 10),
        bonusMalus: parseFloat(input.bonusMalus),
        claimsCount36: input.claimsCount36 != null && input.claimsCount36 !== "" ? parseInt(input.claimsCount36, 10) : null,
        claims: (ctx && ctx.claims) || [],
        drivers: (ctx && ctx.drivers) || [],
        vehicles: (ctx && ctx.vehicles) || [],
      });
    });
  },

  renderForm: function () {
    return (
      '<div class="partner-elig-form form-grid">' +
      '<label>Age<input type="number" id="peAge" min="18" max="99" /></label>' +
      '<label>Anciennete permis (ans)<input type="number" id="peLicense" min="0" max="50" /></label>' +
      '<label>Bonus-malus<input type="number" id="peBonus" step="0.01" min="0.5" max="3.5" value="1" /></label>' +
      '<label>Produit<select id="peProduct"><option value="vtc-taxi">VTC / Taxi</option><option value="auto">Auto</option><option value="sante">Sante</option><option value="habitation">Habitation</option></select></label>' +
      '<label>Sinistres (36 mois)<input type="number" id="peClaims" min="0" max="10" placeholder="Auto si fiche chargée" /></label>' +
      '<label class="full"><button type="button" class="btn btn-primary btn-sm" id="btnPartnerElig">Verifier tous les partenaires</button> ' +
      '<a href="./crm-derogations.html" class="btn btn-ghost btn-sm">Assistant dérogations</a></label>' +
      "</div>"
    );
  },

  renderResults: function (results) {
    var html =
      '<p style="margin:0 0 10px"><button type="button" class="btn btn-ghost btn-sm" id="btnCopyElig">Copier résultats</button></p>' +
      '<div class="partner-elig-results" id="eligResultsInner">' +
      results
        .map(function (r) {
          return (
            '<div class="eligibility-item ' +
            (r.isEligible ? "ok" : "ko") +
            '"><strong>' +
            r.partnerName +
            "</strong><span>Score " +
            r.score +
            "% — " +
            (r.isEligible ? "Éligible" : "Non éligible") +
            (r.reasons.length ? " · " + r.reasons.join(" · ") : "") +
            (!r.isEligible ? ' · <a href="./crm-derogations.html">Dérogation possible</a>' : "") +
            "</span></div>"
          );
        })
        .join("") +
      "</div>";
    setTimeout(function () {
      var btn = document.getElementById("btnCopyElig");
      if (!btn) return;
      btn.onclick = function () {
        var txt = results
          .map(function (r) {
            return r.partnerName + ": " + (r.isEligible ? "OK" : "KO") + " " + r.score + "% — " + r.reasons.join(", ");
          })
          .join("\n");
        if (navigator.clipboard) navigator.clipboard.writeText(txt);
        else prompt("Copiez :", txt);
      };
    }, 0);
    return html;
  },
};
