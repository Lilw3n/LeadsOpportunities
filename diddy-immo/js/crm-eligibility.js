window.CrmEligibility = {
  products: [
    { name: "Zephir VTC Taxi", maxMaterial: 3, maxBodilyResp: 1, bonusMax: 1.5 },
    { name: "Solly Azar VTC", maxMaterial: 2, maxBodilyResp: 0, bonusMax: 0.85 },
    { name: "2M2A VTC Taxi", maxMaterial: 0, maxBodilyResp: 0, bonusMax: 1.0 },
  ],

  countClaims: function (claims, months) {
    var since = Date.now() - months * 30 * 24 * 60 * 60 * 1000;
    var material = 0;
    var bodilyResp = 0;
    (claims || []).forEach(function (c) {
      if (!c.claim_date) return;
      if (new Date(c.claim_date).getTime() < since) return;
      if (c.claim_type && c.claim_type.indexOf("bodily") === 0 && c.responsible) bodilyResp++;
      else material++;
    });
    return { material: material, bodilyResp: bodilyResp };
  },

  evaluate: function (contact) {
    var claims = contact.claims || [];
    var drivers = contact.drivers || [];
    var vehicles = contact.vehicles || [];
    var counts = this.countClaims(claims, 36);
    var results = [];

    this.products.forEach(function (p) {
      var ok = counts.material <= p.maxMaterial && counts.bodilyResp <= p.maxBodilyResp;
      var reasons = [];
      if (counts.material > p.maxMaterial) {
        reasons.push("Trop de sinistres materiels (" + counts.material + "/" + p.maxMaterial + ")");
      }
      if (counts.bodilyResp > p.maxBodilyResp) {
        reasons.push("Sinistre corporel responsable non admis");
      }
      if (!drivers.length) reasons.push("Aucun conducteur renseigne");
      if (!vehicles.length) reasons.push("Aucun vehicule renseigne");
      results.push({
        product: p.name,
        eligible: ok && drivers.length > 0 && vehicles.length > 0,
        reasons: reasons,
      });
    });
    return results;
  },

  quickCheck: function (input, contact) {
    var age = parseInt(input.age, 10);
    var bonus = parseFloat(input.bonusMalus);
    var base = this.evaluate(contact);
    return base.map(function (r) {
      var score = r.eligible ? 85 : 35;
      var reasons = r.reasons.slice();
      if (age && age < 21) {
        score -= 30;
        reasons.push("Age minimum 21 ans");
      }
      if (age && age > 70) {
        score -= 20;
        reasons.push("Age eleve");
      }
      if (!isNaN(bonus) && bonus > 1.0) {
        score -= 15;
        reasons.push("Bonus-malus > 1.0");
      }
      return {
        product: r.product,
        eligible: score >= 60 && r.eligible,
        score: Math.max(0, Math.min(100, score)),
        reasons: reasons,
      };
    });
  },

  renderQuickForm: function () {
    return (
      '<div class="eligibility-quick form-grid" style="margin-bottom:12px">' +
      '<label>Age<input type="number" id="eligAge" min="18" max="99" placeholder="35" /></label>' +
      '<label>Bonus-malus<input type="number" id="eligBonus" step="0.01" min="0.5" max="3.5" placeholder="1.0" /></label>' +
      '<label class="full"><button type="button" class="btn btn-primary btn-sm" id="btnEligCheck">Verifier eligibilite</button></label>' +
      "</div>"
    );
  },

  renderHtml: function (contact, quickResults) {
    var results = quickResults || this.evaluate(contact);
  return (
      '<div class="eligibility-list">' +
      results
        .map(function (r) {
          return (
            '<div class="eligibility-item ' +
            (r.eligible ? "ok" : "ko") +
            '"><strong>' +
            r.product +
            "</strong><span>" +
            (r.score != null ? "Score " + r.score + "% — " : "") +
            (r.eligible ? "Eligible" : r.reasons.join(" · ") || "Non eligible") +
            "</span></div>"
          );
        })
        .join("") +
      "</div>"
    );
  },
};
