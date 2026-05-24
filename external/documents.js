(function () {
  var TOKEN_KEY = "lo_ext_token";
  var DOCS_KEY = "lo_ext_documents_v1";

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./login.html";
    return;
  }

  var list = [];
  try {
    list = JSON.parse(localStorage.getItem(DOCS_KEY) || "[]");
  } catch (e) {}

  var el = document.getElementById("docList");
  if (!list.length) {
    el.innerHTML =
      "<li>Aucun document enregistré localement. Utilisez « Déposer un document » pour transmettre un fichier au courtier.</li>";
    return;
  }

  el.innerHTML = list
    .map(function (d) {
      return (
        "<li><strong>" +
        esc(d.fileName || "Document") +
        "</strong> — " +
        esc(d.documentType || "autre") +
        (d.sentAt ? " · " + new Date(d.sentAt).toLocaleString("fr-FR") : "") +
        (d.description ? "<br><span style='color:#64748b'>" + esc(d.description) + "</span>" : "") +
        "</li>"
      );
    })
    .join("");
})();
