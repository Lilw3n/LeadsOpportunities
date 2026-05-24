(function () {
  var TOKEN_KEY = "lo_ext_token";
  var EMAIL_KEY = "lo_client_email";
  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./login.html";
    return;
  }
  var email = localStorage.getItem(EMAIL_KEY);
  if (!email) {
    location.href = "./login.html";
    return;
  }
  document.querySelector("[name=claimDate]").value = new Date().toISOString().slice(0, 10);

  document.getElementById("claimForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    document.getElementById("claimMsg").textContent = "Envoi en cours…";
    fetch("/api/external/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        claimType: fd.get("claimType"),
        claimDate: fd.get("claimDate"),
        amount: fd.get("amount") || null,
        description:
          fd.get("description") +
          (fd.get("vehicleRegistration") ? "\nVéhicule: " + fd.get("vehicleRegistration") : "") +
          (fd.get("location") ? "\nLieu: " + fd.get("location") : "") +
          (fd.get("thirdParty") ? "\nTiers: " + fd.get("thirdParty") : "") +
          (fd.get("responsible") ? "\nResponsabilité: " + fd.get("responsible") : "") +
          (fd.get("docConstat") ? "\n[Doc] Constat amiable" : "") +
          (fd.get("docPhotos") ? "\n[Doc] Photos" : "") +
          (fd.get("docRapport") ? "\n[Doc] Rapport police" : ""),
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (res.ok) {
          document.getElementById("claimMsg").innerHTML =
            "✅ Sinistre enregistré (réf. " + res.claimId + '). <a href="dashboard.html">Retour espace</a>';
          e.target.reset();
        } else {
          document.getElementById("claimMsg").textContent = res.error || "Erreur";
        }
      });
  };
})();
