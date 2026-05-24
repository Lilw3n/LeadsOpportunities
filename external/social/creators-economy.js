(function () {
  var tiers = [
    { name: "Bronze", commission: 5, minLeads: 3, perks: ["Kit média", "Badge profil"] },
    { name: "Argent", commission: 8, minLeads: 10, perks: ["Live co-brandé", "Support prioritaire"] },
    { name: "Or", commission: 12, minLeads: 25, perks: ["Page dédiée", "Challenges mensuels", "Certificat de réussite"] },
  ];
  var stats = { creators: 48, leadsMonth: 312, paidOut: 4280 };

  document.getElementById("economyMount").innerHTML =
    '<p style="text-align:center;color:#64748b;max-width:560px;margin:0 auto 16px">Inspire InfluencerEconomySystem multisite — monétisez votre expertise VTC &amp; assurance.</p>' +
    '<p style="text-align:center"><span class="stat">' +
    stats.creators +
    " créateurs</span><span class='stat'>" +
    stats.leadsMonth +
    " leads/mois</span><span class='stat'>" +
    stats.paidOut.toLocaleString("fr-FR") +
    " € versés</span></p>" +
    '<div class="tier" style="background:#f8fafc"><h3>Simulateur de revenus</h3>' +
    '<label>Leads qualifiés / mois<input type="number" id="simLeads" min="0" value="10" style="width:100%;padding:10px;margin:8px 0;border:1px solid #e2e8f0;border-radius:8px" /></label>' +
    '<label>Panier moyen (€)<input type="number" id="simBasket" min="0" value="450" style="width:100%;padding:10px;margin:8px 0;border:1px solid #e2e8f0;border-radius:8px" /></label>' +
    '<p id="simResult" style="font-weight:700;color:#4338ca;margin:12px 0 0"></p></div>' +
    tiers
      .map(function (t) {
        return (
          '<div class="tier"><h3>' +
          t.name +
          " — " +
          t.commission +
          "% commission</h3><p>Min. " +
          t.minLeads +
          " leads qualifiés / mois</p><ul>" +
          t.perks
            .map(function (p) {
              return "<li>" + p + "</li>";
            })
            .join("") +
          '</ul><button type="button" class="btn-tier" data-tier="' +
          t.name +
          '" style="padding:10px 16px;border:none;border-radius:10px;background:#6366f1;color:#fff;font-weight:600;cursor:pointer">Candidater ' +
          t.name +
          "</button></div>"
        );
      })
      .join("") +
    '<div class="tier"><h3>Candidature créateur</h3>' +
    '<form id="creatorApply"><label>Email<input type="email" name="email" required style="width:100%;padding:10px;margin:6px 0;border:1px solid #e2e8f0;border-radius:8px" /></label>' +
    '<label>Niche<select name="niche" style="width:100%;padding:10px;margin:6px 0;border:1px solid #e2e8f0;border-radius:8px"><option>VTC / Taxi</option><option>Courtier</option><option>RC Pro</option><option>Formation</option></select></label>' +
    '<button type="submit" style="margin-top:10px;padding:12px 20px;background:#0d9488;color:#fff;border:none;border-radius:10px;font-weight:600;cursor:pointer">Envoyer candidature</button></form>' +
    '<p id="creatorMsg" style="margin-top:10px;font-size:.88rem"></p></div>' +
    '<p style="text-align:center;margin:20px"><a href="agency.html">Agence partenaires →</a> · <a href="marketplace.html">Marketplace</a></p>';

  function sim() {
    var leads = Number(document.getElementById("simLeads").value) || 0;
    var basket = Number(document.getElementById("simBasket").value) || 0;
    var tier = tiers[0];
    if (leads >= 25) tier = tiers[2];
    else if (leads >= 10) tier = tiers[1];
    var rev = Math.round(leads * basket * (tier.commission / 100));
    document.getElementById("simResult").textContent =
      "Estimation " + tier.name + " : ~" + rev.toLocaleString("fr-FR") + " € / mois";
  }

  document.getElementById("simLeads").oninput = sim;
  document.getElementById("simBasket").oninput = sim;
  sim();

  document.querySelectorAll(".btn-tier").forEach(function (btn) {
    btn.onclick = function () {
      try {
        localStorage.setItem("lo_creator_tier_apply", btn.getAttribute("data-tier"));
      } catch (e) {}
      document.getElementById("creatorApply").scrollIntoView({ behavior: "smooth" });
    };
  });

  document.getElementById("creatorApply").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    try {
      var list = JSON.parse(localStorage.getItem("lo_creator_applications") || "[]");
      list.unshift({
        email: fd.get("email"),
        niche: fd.get("niche"),
        tier: localStorage.getItem("lo_creator_tier_apply") || "Bronze",
        at: new Date().toISOString(),
      });
      localStorage.setItem("lo_creator_applications", JSON.stringify(list.slice(0, 20)));
    } catch (err) {}
    document.getElementById("creatorMsg").textContent =
      "✅ Candidature enregistrée — l'équipe vous recontacte sous 48 h.";
    e.target.reset();
  };
})();
