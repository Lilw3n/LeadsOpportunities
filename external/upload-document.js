(function () {
  var TOKEN_KEY = "lo_ext_token";
  var EMAIL_KEY = "lo_client_email";
  var DOCS_KEY = "lo_ext_documents_v1";
  var params = new URLSearchParams(location.search);
  var isPublicFlow = params.get("public") === "1";
  var email =
    (params.get("email") || "").trim().toLowerCase() ||
    (localStorage.getItem(EMAIL_KEY) || "").trim().toLowerCase();
  if (!isPublicFlow && !localStorage.getItem(TOKEN_KEY)) {
    location.href = "./login.html";
    return;
  }
  if (!email) {
    var manual = prompt("Votre e-mail (utilise pour rattacher le document a votre dossier) :");
    email = String(manual || "").trim().toLowerCase();
    if (!email || email.indexOf("@") < 0) {
      alert("E-mail requis pour envoyer vos pieces.");
      if (!isPublicFlow) location.href = "./login.html";
      return;
    }
  }

  var drop = document.getElementById("dropZone");
  var fileInput = document.getElementById("fileInput");
  if (drop && fileInput) {
    drop.onclick = function () {
      fileInput.click();
    };
    drop.ondragover = function (e) {
      e.preventDefault();
      drop.style.borderColor = "#0d9488";
    };
    drop.ondragleave = function () {
      drop.style.borderColor = "#94a3b8";
    };
    drop.ondrop = function (e) {
      e.preventDefault();
      drop.style.borderColor = "#94a3b8";
      var f = e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) applyFile(f);
    };
    fileInput.onchange = function () {
      if (fileInput.files[0]) applyFile(fileInput.files[0]);
    };
  }

  function applyFile(f) {
    var nameInput = document.querySelector("[name=fileName]");
    if (nameInput) nameInput.value = f.name;
    var typeSel = document.querySelector("[name=documentType]");
    if (typeSel && /\.(jpg|jpeg|png)$/i.test(f.name)) typeSel.value = "carte_grise";
    document.getElementById("uploadMsg").textContent =
      "Fichier « " + f.name + " » prêt — complétez le formulaire et envoyez.";
  }

  document.getElementById("uploadForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    document.getElementById("uploadMsg").textContent = "Envoi…";
    fetch("/api/external/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        fileName: fd.get("fileName"),
        documentType: fd.get("documentType"),
        description: fd.get("description"),
        content: fd.get("content") || fd.get("description"),
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (res.ok) {
          try {
            var hist = JSON.parse(localStorage.getItem(DOCS_KEY) || "[]");
            hist.unshift({
              fileName: fd.get("fileName"),
              documentType: fd.get("documentType"),
              description: fd.get("description"),
              sentAt: new Date().toISOString(),
            });
            localStorage.setItem(DOCS_KEY, JSON.stringify(hist.slice(0, 30)));
          } catch (e) {}
          document.getElementById("uploadMsg").innerHTML =
            "✅ Document transmis. " +
            (res.drive && res.drive.simulated ? "(Archivage simulé — Drive non configuré)" : "") +
            (isPublicFlow
              ? ' <a href="/">Retour au site</a>'
              : ' <a href="documents.html">Voir mes documents</a> · <a href="dashboard.html">Retour</a>');
          e.target.reset();
        } else {
          document.getElementById("uploadMsg").textContent = res.error || "Erreur";
        }
      });
  };
})();
