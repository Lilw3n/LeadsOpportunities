/**
 * Hub CRM — dépôt Drive + copie o2switch + vérification Stripe.
 */
(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var params = new URLSearchParams(location.search);
  var form = document.getElementById("depotForm");
  if (params.get("email") && form.email) form.email.value = params.get("email");
  if (params.get("contactId") && form.contactId) form.contactId.value = params.get("contactId");

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function setPill(id, kind, label) {
    var el = document.getElementById(id);
    if (!el) return;
    el.className = "depot-pill " + kind;
    el.textContent = label;
  }

  function authHeaders() {
    return { Authorization: "Bearer " + token };
  }

  function jsonHeaders() {
    return { Authorization: "Bearer " + token, "Content-Type": "application/json" };
  }

  function loadDriveStatus() {
    var out = document.getElementById("depotOut");
    out.textContent = "Vérification Drive + o2switch…";
    return fetch("/api/drive/status", { headers: authHeaders() })
      .then(function (r) {
        return r.json().then(function (body) {
          return { status: r.status, body: body };
        });
      })
      .then(function (res) {
        if (res.status === 403) {
          setPill("drivePill", "ko", "admin requis");
          setPill("backupPill", "ko", "admin requis");
          document.getElementById("driveSummary").textContent = "Réservé aux administrateurs CRM.";
          document.getElementById("backupSummary").textContent = "Même accès admin.";
          out.textContent = "Accès réservé aux administrateurs CRM.";
          return;
        }
        var b = res.body || {};
        out.textContent = JSON.stringify(b, null, 2);
        if (b.ok && b.connection && b.connection.ok) {
          setPill("drivePill", "ok", "connecté");
          var root = (b.connection.rootFolder && b.connection.rootFolder.name) || "dossier racine";
          document.getElementById("driveSummary").textContent =
            root + (b.connection.serviceAccountEmail ? " · " + b.connection.serviceAccountEmail : "");
        } else {
          setPill("drivePill", "ko", "à configurer");
          document.getElementById("driveSummary").textContent = b.error || "Variables Drive manquantes.";
        }
        var backup = b.backup || {};
        if (backup.ok) {
          setPill("backupPill", "ok", "copie prête");
          document.getElementById("backupSummary").textContent =
            (backup.dataDir ? "Dossier " + backup.dataDir : "Script PHP joignable") +
            (b.backupUrlHost ? " · " + b.backupUrlHost : "");
        } else if (!backup.configured) {
          setPill("backupPill", "warn", "optionnel");
          document.getElementById("backupSummary").textContent =
            "O2SWITCH_BACKUP_URL non renseigné — Drive reste le dépôt principal.";
        } else {
          setPill("backupPill", "ko", "hors service");
          document.getElementById("backupSummary").textContent = backup.error || "Ping o2switch échoué.";
        }
      })
      .catch(function (e) {
        setPill("drivePill", "ko", "erreur");
        document.getElementById("driveSummary").textContent = String(e);
        out.textContent = String(e);
      });
  }

  function loadStripe() {
    var out = document.getElementById("stripeOut");
    out.hidden = false;
    out.textContent = "Vérification Stripe…";
    document.getElementById("stripeSummary").textContent = "Appel de l’API Stripe…";
    return fetch("/api/stripe/readiness", { headers: authHeaders() })
      .then(function (r) {
        return r.json().then(function (body) {
          return { status: r.status, body: body };
        });
      })
      .then(function (res) {
        if (res.status === 403) {
          setPill("stripePill", "ko", "admin requis");
          document.getElementById("stripeSummary").textContent = "Réservé aux administrateurs.";
          out.textContent = "Accès réservé aux administrateurs CRM.";
          return;
        }
        var b = res.body || {};
        out.textContent = JSON.stringify(b, null, 2);
        if (b.ok) {
          var mode = b.mode === "live" ? "live" : "test";
          var charges = b.chargesEnabled ? "encaissements OK" : "charges désactivées";
          setPill("stripePill", b.chargesEnabled ? "ok" : "warn", mode);
          document.getElementById("stripeSummary").textContent =
            (b.accountId || "compte") +
            " · " +
            charges +
            (b.hasWebhookSecret ? " · webhook configuré" : " · webhook manquant");
        } else {
          setPill("stripePill", "ko", "échec");
          document.getElementById("stripeSummary").textContent = b.error || "STRIPE_SECRET_KEY manquant";
        }
      })
      .catch(function (e) {
        setPill("stripePill", "ko", "erreur");
        document.getElementById("stripeSummary").textContent = String(e);
        out.textContent = String(e);
      });
  }

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
    if (/\.txt$/i.test(file.name)) return "text/plain";
    return "image/jpeg";
  }

  function loadFiles() {
    var mount = document.getElementById("filesMount");
    var q = form.contactId && form.contactId.value ? "?contactId=" + encodeURIComponent(form.contactId.value) : "";
    mount.textContent = "Chargement…";
    fetch("/api/crm/document-files" + q, { headers: authHeaders() })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        var files = (res && res.files) || [];
        if (!files.length) {
          mount.innerHTML = "<p class='depot-muted'>Aucun dépôt enregistré pour l’instant.</p>";
          return;
        }
        mount.innerHTML =
          "<table class='depot-files'><thead><tr><th>Date</th><th>Fichier</th><th>Contact</th><th>Drive</th><th>o2switch</th></tr></thead><tbody>" +
          files
            .map(function (f) {
              var drive = f.drive_file_id
                ? f.drive_web_view_link
                  ? "<a href='" + esc(f.drive_web_view_link) + "' target='_blank' rel='noopener'>ouvrir</a>"
                  : esc(f.drive_file_id)
                : f.simulated
                  ? "simulé"
                  : "—";
              var bak = f.backup_ok ? esc(f.backup_path || "ok") : f.backup_only ? "copie seule" : "—";
              var when = f.created_at ? new Date(f.created_at).toLocaleString("fr-FR") : "";
              return (
                "<tr><td>" +
                esc(when) +
                "</td><td>" +
                esc(f.file_name) +
                "</td><td>" +
                esc(f.contact_id || "—") +
                "</td><td>" +
                drive +
                "</td><td>" +
                bak +
                "</td></tr>"
              );
            })
            .join("") +
          "</tbody></table>";
      })
      .catch(function (e) {
        mount.textContent = String(e);
      });
  }

  document.getElementById("btnDriveStatus").onclick = loadDriveStatus;
  document.getElementById("btnStripe").onclick = loadStripe;
  document.getElementById("btnRefreshFiles").onclick = loadFiles;

  form.onsubmit = function (e) {
    e.preventDefault();
    var file = form.file.files && form.file.files[0];
    var msg = document.getElementById("uploadOut");
    if (!file) {
      msg.textContent = "Choisissez un fichier.";
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      msg.textContent = "Fichier trop volumineux (max 12 Mo).";
      return;
    }
    msg.textContent = "Envoi vers Drive…";
    readBase64(file)
      .then(function (dataUrl) {
        return fetch("/api/drive/upload", {
          method: "POST",
          headers: jsonHeaders(),
          body: JSON.stringify({
            email: form.email.value,
            contactId: form.contactId.value || undefined,
            fileName: file.name,
            documentType: form.documentType.value,
            mimeType: mimeFor(file),
            fileBase64: dataUrl,
            source: "crm_depot_hub",
          }),
        });
      })
      .then(function (r) {
        return r.json().then(function (body) {
          return { ok: r.ok, body: body };
        });
      })
      .then(function (res) {
        if (!res.ok || res.body.ok === false) {
          msg.style.color = "#b91c1c";
          msg.textContent = res.body.error || "Dépôt impossible";
          return;
        }
        msg.style.color = "";
        var extra = res.body.backupOnly
          ? " (copie o2switch uniquement — reconnecter Drive)"
          : res.body.simulated
            ? " (simulation locale — configurer Drive en prod)"
            : "";
        msg.textContent =
          "Déposé : " + (res.body.fileName || file.name) + extra;
        loadFiles();
      })
      .catch(function (err) {
        msg.style.color = "#b91c1c";
        msg.textContent = String(err);
      });
  };

  loadDriveStatus();
  loadFiles();
})();
