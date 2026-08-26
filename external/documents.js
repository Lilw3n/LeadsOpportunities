(function () {
  var TOKEN_KEY = "lo_ext_token";
  var PROFILE_KEY = "lo_ext_profile";

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./login.html";
    return;
  }

  var el = document.getElementById("docList");
  var gallery = document.getElementById("docGallery");
  if (!el && !gallery) return;
  if (el) el.innerHTML = "<li>Chargement des documents…</li>";
  if (gallery) gallery.innerHTML = "<p class='lo-doc-empty'>Chargement…</p>";

  var email = "";
  var contactId = "";
  try {
    var profile = JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
    email = (profile.email || "").toLowerCase();
    contactId = profile.contactId || profile.contact_id || "";
  } catch (e) {}
  try {
    email = email || (localStorage.getItem("lo_client_email") || "").toLowerCase();
  } catch (e2) {}

  function renderGallery(docs) {
    var wrap = gallery || el;
    if (window.LoDocumentGallery && wrap) {
      if (el) {
        el.hidden = true;
        el.innerHTML = "";
      }
      if (gallery) gallery.hidden = false;
      window.LoDocumentGallery.mount(wrap, docs, {
        email: email,
        contactId: contactId,
        emptyText: "Aucun document déposé pour l’instant.",
        onDeleted: function () {
          loadRemote();
        },
      });
      return;
    }
    if (el) el.hidden = false;
    if (!docs.length) {
      if (el)
        el.innerHTML =
          "<li>Aucun document. Utilisez « Déposer un document » pour transmettre un fichier.</li>";
      return;
    }
    if (el) {
      el.innerHTML = docs
        .map(function (d) {
          return (
            "<li><strong>" +
            esc(d.name || "Document") +
            "</strong> — " +
            esc(d.type || "autre") +
            (d.webViewLink
              ? ' · <a href="' + esc(d.webViewLink) + '" target="_blank" rel="noopener">Ouvrir</a>'
              : "") +
            "</li>"
          );
        })
        .join("");
    }
  }

  function loadRemote() {
    if (!email && !contactId) {
      if (gallery) gallery.innerHTML = "<p class='lo-doc-empty'>Connectez-vous avec un e-mail pour voir vos documents.</p>";
      if (el)
        el.innerHTML =
          "<li>Connectez-vous avec un e-mail pour voir vos documents Drive.</li>";
      return;
    }
    var q = contactId
      ? "contactId=" + encodeURIComponent(contactId)
      : "email=" + encodeURIComponent(email);
    fetch("/api/external/documents-list?" + q, { credentials: "same-origin" })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || "Erreur");
        if (res.contactId) contactId = res.contactId;
        renderGallery(res.documents || []);
      })
      .catch(function () {
        if (gallery)
          gallery.innerHTML = "<p class='lo-doc-empty'>Impossible de charger les documents.</p>";
        if (el)
          el.innerHTML =
            "<li>Impossible de charger les documents. Réessayez ou déposez un nouveau fichier.</li>";
      });
  }

  loadRemote();
})();
