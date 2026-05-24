(function () {
  if (!localStorage.getItem("lo_token")) location.href = "./crm.html";

  var requirements = {
    antecedents: "33 mois sur les 36 derniers mois",
    typeAntecedents: "Particuliers acceptés",
    bonus: "0.85 à 0.50",
    age: "27 à 65 ans",
    permis: "≥ 5 ans",
    sinistres:
      "Max 4 sinistres — aucun corporel responsable ; 1 corporel non resp. ; 2 matériels resp. ; 3 mat. non resp. ; 2 BDG ; 1 vol/inc.",
    responsabilite: "Aucun corporel responsable accepté",
  };

  var emailTemplate =
    "Bonjour Mme/Mr,\n\nSuite à votre demande de devis.\n\nPouvez-vous nous indiquer :\n- Bonus malus\n- Assuré 33 mois en particulier et/ou 1 an VTC sur 12 mois\n\nPièces en gras minimum : permis, carte pro, RI 36 mois, carte grise, KBIS.\n\nCdlt — contact@diddyhome.com";

  function renderReq(mount) {
    mount.innerHTML = Object.keys(requirements)
      .map(function (k) {
        return (
          '<div class="req-item"><strong>' +
          k +
          "</strong>" +
          requirements[k] +
          "</div>"
        );
      })
      .join("");
  }

  renderReq(document.getElementById("reqVtc"));
  renderReq(document.getElementById("reqTaxi"));
  document.getElementById("emailTpl").textContent = emailTemplate;

  document.querySelectorAll(".tabs button").forEach(function (btn) {
    btn.onclick = function () {
      document.querySelectorAll(".tabs button").forEach(function (b) {
        b.classList.remove("active");
      });
      btn.classList.add("active");
      var t = btn.dataset.tab;
      document.getElementById("tabVtc").classList.toggle("hidden", t !== "vtc");
      document.getElementById("tabTaxi").classList.toggle("hidden", t !== "taxi");
    };
  });

  document.getElementById("btnCopyEmail").onclick = function () {
    navigator.clipboard.writeText(emailTemplate).then(function () {
      alert("Template copié.");
    });
  };
})();
