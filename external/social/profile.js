(function () {
  var id = new URLSearchParams(location.search).get("id") || "Wendy B.";
  var profiles = {
    "Wendy B.": { role: "Courtier assurance", bio: "Spécialiste VTC & santé — Martinique / IDF", tags: ["VTC", "Santé", "Partenaires"] },
    "Karim V.": { role: "Chauffeur VTC", bio: "Flotte 3 véhicules — Paris", tags: ["VTC", "Flotte"] },
    "Sophie M.": { role: "Apporteur", bio: "Réseau TPE santé", tags: ["Santé", "Collectif"] },
  };
  var p = profiles[id] || { role: "Membre", bio: "Profil public social hub", tags: ["Assurance"] };
  document.getElementById("profName").textContent = id;
  document.getElementById("profBody").innerHTML =
    "<p><strong>" +
    p.role +
    "</strong></p><p style='color:#64748b'>" +
    p.bio +
    "</p><p>" +
    p.tags.join(" · ") +
    '</p><p style="margin-top:20px"><a href="../devis-wizard.html">Contacter via devis →</a></p>';
})();
