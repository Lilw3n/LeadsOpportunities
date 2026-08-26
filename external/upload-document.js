(function () {
  var TOKEN_KEY = "lo_ext_token";
  var EMAIL_KEY = "lo_client_email";
  var DOCS_KEY = "lo_ext_documents_v1";
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
  if (!email) {
    var manual = prompt("Votre e-mail (utilise pour rattacher le document a votre dossier) :");
    email = String(manual || "").trim().toLowerCase();
    if (!email || email.indexOf("@") < 0) {
      alert("E-mail requis pour envoyer vos pieces.");
      if (!isPublicFlow) location.href = "./login.html";
      return;
    }
  }

  var pendingFile = null;
  var drop = document.getElementById("dropZone");
  var fileInput = document.getElementById("fileInput");
  var visualGrid = document.getElementById("docsVisualGrid");

  function readBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(reader.result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function mimeFor(file) {
    if (file.type) return file.type;
    if (/\.pdf$/i.test(file.name)) return "application/pdf";
    if (/\.png$/i.test(file.name)) return "image/png";
    return "image/jpeg";
  }

  function applyFile(f) {
    pendingFile = f;
    var nameInput = document.querySelector("[name=fileName]");
    if (nameInput) nameInput.value = f.name;
    var typeSel = document.querySelector("[name=documentType]");
    if (typeSel && /\.(jpg|jpeg|png)$/i.test(f.name) && typeSel.value === "kbis") {
      /* keep user selection */
    }
    document.getElementById("uploadMsg").textContent =
      "Fichier « " + f.name + " » prêt — complétez le formulaire et envoyez.";
  }

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

  function renderRemoteDocs(docs) {
    if (!visualGrid) return;
    if (!docs.length) {
      visualGrid.innerHTML = "<p style='color:#64748b;font-size:.85rem'>Aucun document encore déposé.</p>";
      return;
    }
    visualGrid.innerHTML = docs
      .map(function (d) {
        var visual =
          d.thumbnailLink || (d.mimeType && d.mimeType.indexOf("image") !== -1 && d.webViewLink)
            ? '<img src="' + (d.thumbnailLink || d.webViewLink) + '" alt="" style="width:100%;height:90px;object-fit:cover;border-radius:6px" />'
            : '<div style="font-size:2rem;line-height:90px">📄</div>';
        var link = d.webViewLink
          ? '<a href="' + d.webViewLink + '" target="_blank" rel="noopener">Voir Drive</a>'
          : "";
        return (
          '<div class="devis-docs-visual">' +
          visual +
          "<p>" +
          (d.name || "Document") +
          (link ? "<br>" + link : "") +
          "</p></div>"
        );
      })
      .join("");
  }

  function refreshList() {
    var q = contactId ? "contactId=" + encodeURIComponent(contactId) : "email=" + encodeURIComponent(email);
    fetch("/api/external/documents-list?" + q)
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (res.ok) renderRemoteDocs(res.documents || []);
      });
  }

  if (window.DEVIS_DOCUMENT_CONFIG) {
    var cfg = window.DEVIS_DOCUMENT_CONFIG.getConfig(need);
    var titleEl = document.getElementById("uploadPageTitle");
    var introEl = document.getElementById("uploadPageIntro");
    var typeSel = document.querySelector("[name=documentType]");
    if (titleEl && cfg.title) titleEl.textContent = cfg.title.replace("Pièces pour ", "Déposer — ");
    if (introEl && cfg.intro) introEl.textContent = cfg.intro;
    if (typeSel && cfg.items) {
      typeSel.innerHTML = cfg.items
        .map(function (it) {
          return '<option value="' + it.type + '">' + it.label + "</option>";
        })
        .join("");
      var checklist = document.getElementById("uploadChecklist");
      if (checklist) {
        checklist.innerHTML = cfg.items
          .map(function (it) {
            return "<li>" + it.label + (it.required ? " (nécessaire)" : " (optionnel)") + "</li>";
          })
          .join("");
      }
    }
  }

  refreshList();

  document.getElementById("uploadForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    if (!pendingFile) {
      document.getElementById("uploadMsg").textContent = "Sélectionnez un fichier (PDF, JPG ou PNG).";
      return;
    }
    document.getElementById("uploadMsg").textContent = "Envoi…";
    readBase64(pendingFile)
      .then(function (dataUrl) {
        return fetch("/api/external/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            contactId: contactId || undefined,
            fileName: fd.get("fileName") || pendingFile.name,
            documentType: fd.get("documentType"),
            description: fd.get("description"),
            mimeType: mimeFor(pendingFile),
            fileBase64: dataUrl,
            vertical: need,
            need: need,
            source: "upload_page",
          }),
        });
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
          } catch (err) {}
          pendingFile = null;
          document.getElementById("uploadMsg").innerHTML =
            "✅ Document transmis et archivé. " +
            (res.drive && res.drive.simulated ? "(Mode simulation — Drive non configuré)" : "") +
            (isPublicFlow
              ? ' <a href="/">Retour au site</a>'
              : ' <a href="documents.html">Voir mes documents</a> · <a href="dashboard.html">Retour</a>');
          e.target.reset();
          refreshList();
        } else {
          document.getElementById("uploadMsg").textContent = res.error || "Erreur";
        }
      })
      .catch(function () {
        document.getElementById("uploadMsg").textContent = "Erreur réseau";
      });
  };
})();
