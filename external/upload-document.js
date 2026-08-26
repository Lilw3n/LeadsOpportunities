(function () {
  var TOKEN_KEY = "lo_ext_token";
  var EMAIL_KEY = "lo_client_email";
  var params = new URLSearchParams(location.search);
  var isPublicFlow = params.get("public") === "1";
  var need = params.get("need") || "default";
  var contactId = params.get("contactId") || "";
  var email =
    (params.get("email") || "").trim().toLowerCase() ||
    (localStorage.getItem(EMAIL_KEY) || "").trim().toLowerCase();

  if (!isPublicFlow && !localStorage.getItem(TOKEN_KEY)) {
    location.href = "./login.html";
    return;
  }
  if (!email && !contactId) {
    var manual = prompt("Votre e-mail (utilisé pour rattacher le document à votre dossier) :");
    email = String(manual || "").trim().toLowerCase();
    if (!email || email.indexOf("@") < 0) {
      alert("E-mail requis pour envoyer vos pièces.");
      if (!isPublicFlow) location.href = "./login.html";
      return;
    }
  }
  if (email) {
    try {
      localStorage.setItem(EMAIL_KEY, email);
    } catch (e) {}
  }

  var root = document.getElementById("docsRoot");
  var msg = document.getElementById("uploadMsg");
  if (!root || !window.DevisDocumentUpload || !window.DevisDocumentUpload.buildChecklistHtml) {
    if (msg) msg.textContent = "Module de dépôt indisponible.";
    return;
  }

  root.innerHTML = window.DevisDocumentUpload.buildChecklistHtml(need, { includeTitle: true });
  var mount = root.querySelector("[data-devis-documents-root]") || root;
  var uploader = window.DevisDocumentUpload.mountOnRoot(mount, need);
  if (!uploader) {
    if (msg) msg.textContent = "Impossible d’afficher le dépôt.";
    return;
  }
  uploader.setSession({
    email: email || null,
    contactId: contactId || null,
  });
  uploader.fetchRemoteList();
})();
