(function () {
  var TOKEN_KEY = "lo_ext_token";
  var EMAIL_KEY = "lo_client_email";
  var params = new URLSearchParams(location.search);
  var isPublicFlow = params.get("public") === "1";
  var need = params.get("need") || "pieces";
  var contactId = params.get("contactId") || "";
  var leadId = params.get("leadId") || "";
  var email =
    (params.get("email") || "").trim().toLowerCase() ||
    (localStorage.getItem(EMAIL_KEY) || "").trim().toLowerCase();

  if (!isPublicFlow && !localStorage.getItem(TOKEN_KEY) && !email) {
    location.href = "./login.html";
    return;
  }

  var backHref = isPublicFlow
    ? "../index.html"
    : params.get("back") || "./documents.html";

  var mount = document.getElementById("piecesMount");
  if (!mount || !window.PiecesImport) return;

  mount.innerHTML = window.PiecesImport.buildMarkup({
    email: email,
    backHref: backHref,
    mode: "standalone",
  });

  var root = mount.querySelector("[data-pieces-import-root]");
  var widget = new window.PiecesImport.PiecesImport(root, {
    need: need,
    email: email,
    contactId: contactId,
    leadId: leadId,
    backHref: backHref,
    source: isPublicFlow ? "upload_page_public" : "upload_page",
    mode: "standalone",
  });
  widget.setSession({ email: email, contactId: contactId, leadId: leadId });
})();
