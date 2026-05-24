(function () {
  var creators = [
    { name: "Wendy B.", niche: "Assurance VTC", followers: 2400, deals: 12, rating: 4.9 },
    { name: "Karim V.", niche: "Mobilité pro", followers: 890, deals: 5, rating: 4.7 },
    { name: "Assurance Pro FM", niche: "RC Pro BTP", followers: 5100, deals: 28, rating: 4.8 },
    { name: "Sophie M.", niche: "Santé collective", followers: 1200, deals: 9, rating: 4.6 },
  ];

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function render(list) {
    document.getElementById("mount").innerHTML =
      "<p style='text-align:center;color:#64748b;max-width:640px;margin:0 auto 16px'>Inspire CreatorAgencySystem multisite — briefs &amp; partenariats.</p>" +
      '<div style="max-width:640px;margin:0 auto 16px;display:flex;gap:8px;flex-wrap:wrap">' +
      '<select id="agFilter" style="flex:1;padding:10px;border:1px solid #e2e8f0;border-radius:10px"><option value="">Toutes niches</option><option>Assurance VTC</option><option>Mobilité pro</option><option>RC Pro BTP</option><option>Santé collective</option></select>' +
      '<input type="search" id="agSearch" placeholder="Rechercher créateur…" style="flex:1;padding:10px;border:1px solid #e2e8f0;border-radius:10px" />' +
      "</div>" +
      '<div id="agList">' +
      list
        .map(function (c) {
          return (
            '<div class="creator-card"><strong>' +
            esc(c.name) +
            "</strong> — " +
            esc(c.niche) +
            "<p style='color:#64748b;margin:8px 0'>" +
            c.followers.toLocaleString("fr-FR") +
            " abonnés · " +
            c.deals +
            " partenariats · ⭐ " +
            c.rating +
            ' · <a href="profile.html?id=' +
            encodeURIComponent(c.name) +
            '">Profil</a></p>' +
            '<button type="button" class="btn-brief" data-name="' +
            esc(c.name) +
            '" style="padding:8px 14px;border:1px solid #6366f1;background:#fff;color:#4338ca;border-radius:8px;cursor:pointer;font-weight:600">Proposer un brief</button></div>'
          );
        })
        .join("") +
      "</div>" +
      '<div class="creator-card" style="max-width:640px;margin:24px auto"><h3 style="margin:0 0 10px">Brief campagne</h3>' +
      '<form id="briefForm"><input type="hidden" name="creator" id="briefCreator" />' +
      '<label>Objectif<textarea name="goal" rows="3" required placeholder="Lancement RC Pro, live VTC…" style="width:100%;padding:10px;margin:6px 0;border:1px solid #e2e8f0;border-radius:8px;box-sizing:border-box"></textarea></label>' +
      '<label>Budget (€)<input type="number" name="budget" min="0" style="width:100%;padding:10px;margin:6px 0;border:1px solid #e2e8f0;border-radius:8px" /></label>' +
      '<button type="submit" style="padding:12px 18px;background:#6366f1;color:#fff;border:none;border-radius:10px;font-weight:600;cursor:pointer">Envoyer le brief</button></form>' +
      '<p id="briefMsg" style="margin-top:10px;font-size:.88rem"></p></div>' +
      '<p style="text-align:center;margin-top:20px"><a href="creators.html">Programme créateurs →</a></p>';

    document.querySelectorAll(".btn-brief").forEach(function (btn) {
      btn.onclick = function () {
        document.getElementById("briefCreator").value = btn.getAttribute("data-name");
        document.getElementById("briefForm").scrollIntoView({ behavior: "smooth" });
      };
    });
  }

  function filter() {
    var niche = document.getElementById("agFilter").value;
    var q = document.getElementById("agSearch").value.trim().toLowerCase();
    var list = creators.slice();
    if (niche) list = list.filter(function (c) { return c.niche === niche; });
    if (q) list = list.filter(function (c) { return (c.name + c.niche).toLowerCase().indexOf(q) >= 0; });
    render(list);
    var ff = document.getElementById("agFilter");
    var fs = document.getElementById("agSearch");
    if (ff) ff.onchange = filter;
    if (fs) fs.oninput = filter;
  }

  render(creators);
  filter();

  document.getElementById("briefForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    try {
      var hist = JSON.parse(localStorage.getItem("lo_agency_briefs") || "[]");
      hist.unshift({
        creator: fd.get("creator") || document.getElementById("briefCreator").value,
        goal: fd.get("goal"),
        budget: fd.get("budget"),
        at: new Date().toISOString(),
      });
      localStorage.setItem("lo_agency_briefs", JSON.stringify(hist.slice(0, 15)));
    } catch (err) {}
    document.getElementById("briefMsg").textContent = "✅ Brief envoyé — réponse sous 48 h (simulation).";
    e.target.reset();
  };
})();
