/* Panneau « Sécurité pubs » du hub Gestion pubs (crm-pubs.html) */
(function () {
  var box = document.getElementById("adsGuardStatus");
  var btn = document.getElementById("adsGuardRelaunch");
  if (!box || !btn) return;

  function fmt(d) {
    if (!d) return "—";
    return new Date(d).toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" });
  }

  function render(g) {
    var lines = [];
    if (!g.tokenConfigured) {
      lines.push(
        '<p style="color:#b42318"><strong>Inactive :</strong> ajoutez la variable <code>META_ADS_TOKEN</code> dans Vercel pour que le site puisse couper les pubs.</p>'
      );
    }
    lines.push(
      g.expired
        ? '<p style="color:#b42318"><strong>Délai dépassé</strong> : les campagnes actives sont coupées au prochain passage du cron (8 h).</p>'
        : "<p>Les pubs seront coupées le <strong>" + fmt(g.deadline) + "</strong> si vous ne relancez pas.</p>"
    );
    lines.push(
      '<p style="color:var(--muted);margin:0">Délai : ' + g.days + " jours · dernière relance : " + fmt(g.lastRelaunchAt) +
        (g.lastPausedAt ? " · dernière coupure : " + fmt(g.lastPausedAt) : "") + "</p>"
    );
    box.innerHTML = lines.join("");
  }

  function load() {
    fetch("/api/crm/ads-guard", { credentials: "include" })
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        if (d.ok) render(d.guard);
        else box.textContent = d.error || "Erreur";
      })
      .catch(function () {
        box.textContent = "Impossible de charger l'état.";
      });
  }

  btn.addEventListener("click", function () {
    btn.disabled = true;
    fetch("/api/crm/ads-guard", { method: "POST", credentials: "include" })
      .then(function (r) {
        return r.json();
      })
      .then(function (d) {
        if (d.ok) render(d.guard);
      })
      .finally(function () {
        btn.disabled = false;
      });
  });

  load();
})();
