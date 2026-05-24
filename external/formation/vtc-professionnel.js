(function () {
  var PROG_KEY = "lo_vtc_modules_done";
  var TOTAL = 8;

  function doneList() {
    try {
      return JSON.parse(localStorage.getItem(PROG_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function paintProgress() {
    var done = doneList();
    var pct = Math.round((done.length / TOTAL) * 100);
    var fill = document.getElementById("progFill");
    var label = document.getElementById("progLabel");
    if (fill) fill.style.width = pct + "%";
    if (label) label.textContent = "Progression : " + done.length + " / " + TOTAL + " modules";
    document.querySelectorAll(".module-card[data-mod]").forEach(function (card) {
      var id = card.getAttribute("data-mod");
      var ok = done.indexOf(id) >= 0;
      if (ok) card.style.borderColor = "#0d9488";
      var badge = card.querySelector(".badge");
      if (badge && ok) badge.textContent = (badge.textContent || "") + " · ✓ Terminé";
      if (!card.querySelector(".btn-mod-done")) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn-mod-done";
        btn.textContent = ok ? "Module validé" : "Marquer terminé";
        btn.style.cssText =
          "margin-top:10px;padding:8px 12px;border:1px solid #0d9488;background:" +
          (ok ? "#ecfdf5" : "#fff") +
          ";color:#0d9488;border-radius:8px;cursor:pointer;font-size:.8rem;font-weight:600";
        btn.onclick = function () {
          var list = doneList();
          var i = list.indexOf(id);
          if (i < 0) list.push(id);
          else list.splice(i, 1);
          localStorage.setItem(PROG_KEY, JSON.stringify(list));
          location.reload();
        };
        card.appendChild(btn);
      }
    });
    if (done.length >= TOTAL) {
      var cert = document.getElementById("certBanner");
      if (!cert) {
        cert = document.createElement("p");
        cert.id = "certBanner";
        cert.style.cssText =
          "background:#ecfdf5;border:1px solid #6ee7b7;padding:14px;border-radius:12px;margin-bottom:16px;font-weight:600;color:#065f46";
        cert.textContent = "🎓 Certificat de réussite disponible — contactez votre conseiller pour l'attestation.";
        var grid = document.getElementById("modulesGrid");
        if (grid && grid.parentNode) grid.parentNode.insertBefore(cert, grid);
      }
    }
  }

  paintProgress();

  document.getElementById("formationForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    if (fd.get("website")) return;
    var msg = document.getElementById("formMsg");
    msg.textContent = "Envoi…";
    fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "formation-vtc",
        vertical: "vtc-taxi",
        firstName: fd.get("firstName"),
        lastName: fd.get("lastName"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        formula: fd.get("formula"),
        message: fd.get("message"),
        modulesDone: doneList().length,
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (res.ok) {
          msg.textContent = "Demande enregistrée — nous vous recontactons sous 48h.";
          e.target.reset();
        } else msg.textContent = res.error || "Erreur";
      })
      .catch(function () {
        msg.textContent = "Erreur réseau";
      });
  };
})();
