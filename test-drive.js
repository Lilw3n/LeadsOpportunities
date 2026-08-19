(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  var lastText = "";
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  document.getElementById("btnDriveOAuth").onclick = function () {
    fetch("/api/drive/oauth-start", {
      headers: { Authorization: "Bearer " + token },
      redirect: "manual",
    })
      .then(function (r) {
        var loc = r.headers.get("Location");
        if (loc) {
          location.href = loc;
          return;
        }
        return r.json().then(function (data) {
          alert((data && data.error) || "OAuth Drive indisponible");
        });
      })
      .catch(function (e) {
        alert(String(e));
      });
  };

  document.getElementById("btnTestDrive").onclick = function () {
    var out = document.getElementById("driveConfigOut");
    out.textContent = "Test en cours…";
    fetch("/api/drive/status", { headers: { Authorization: "Bearer " + token } })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        out.textContent = JSON.stringify(res, null, 2);
      })
      .catch(function (e) {
        out.textContent = String(e);
      });
  };

  document.getElementById("btnCreateTestLead").onclick = function () {
    var out = document.getElementById("driveConfigOut");
    out.textContent = "Creation du dossier test lead…";
    fetch("/api/drive/test-lead", {
      method: "POST",
      headers: { Authorization: "Bearer " + token },
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        out.textContent = JSON.stringify(res, null, 2);
        loadCloud();
      })
      .catch(function (e) {
        out.textContent = String(e);
      });
  };

  document.getElementById("btnCreateCrmTestLead").onclick = function () {
    var out = document.getElementById("driveConfigOut");
    out.textContent = "Creation contact CRM Test Lead…";
    fetch("/api/crm/contacts", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({
        contactType: "prospect",
        firstName: "Test",
        lastName: "Lead",
        email: "testlead@example.com",
        phone: "0600000000",
        source: "drive_test",
        notes: "Contact cree automatiquement depuis test-drive.html pour verifier Drive.",
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (created) {
        if (!created.ok || !created.id) {
          out.textContent = JSON.stringify(created, null, 2);
          return;
        }
        return fetch("/api/drive/status?contactId=" + encodeURIComponent(created.id), {
          headers: { Authorization: "Bearer " + token },
        })
          .then(function (r) {
            return r.json();
          })
          .then(function (drive) {
            out.textContent = JSON.stringify({ contact: created, drive: drive }, null, 2);
            loadCloud();
          });
      })
      .catch(function (e) {
        out.textContent = String(e);
      });
  };

  function loadCloud() {
    fetch("/api/drive/files", { headers: { Authorization: "Bearer " + token } })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        var files = res.files || res.demoFiles || [];
        document.getElementById("cloudList").innerHTML =
          (res.message ? "<p style='color:var(--muted)'>" + esc(res.message) + "</p>" : "") +
          "<ul>" +
          files
            .map(function (f) {
              return (
                '<li><button type="button" class="btn btn-ghost btn-sm btn-cloud" data-id="' +
                esc(f.id) +
                '">' +
                esc(f.name) +
                "</button></li>"
              );
            })
            .join("") +
          "</ul>";
        document.querySelectorAll(".btn-cloud").forEach(function (btn) {
          btn.onclick = function () {
            fetch("/api/drive/file-content?fileId=" + encodeURIComponent(btn.getAttribute("data-id")), {
              headers: { Authorization: "Bearer " + token },
            })
              .then(function (r) {
                return r.json();
              })
              .then(function (r) {
                lastText = r.text || r.content || "";
                document.getElementById("fileContent").textContent = lastText || r.message || JSON.stringify(r);
              });
          };
        });
      });
  }

  function loadLocal() {
    fetch("/api/drive/local-files", { headers: { Authorization: "Bearer " + token } })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        var files = res.files || res.demoFiles || [];
        document.getElementById("localList").innerHTML =
          (res.message ? "<p>" + esc(res.message) + "</p>" : "") +
          "<ul>" +
          files
            .map(function (f) {
              return (
                '<li><button type="button" class="btn btn-ghost btn-sm btn-local" data-path="' +
                esc(f.path) +
                '">' +
                esc(f.name) +
                "</button></li>"
              );
            })
            .join("") +
          "</ul>";
        document.querySelectorAll(".btn-local").forEach(function (btn) {
          btn.onclick = function () {
            fetch("/api/drive/local-read?path=" + encodeURIComponent(btn.getAttribute("data-path")), {
              headers: { Authorization: "Bearer " + token },
            })
              .then(function (r) {
                return r.json();
              })
              .then(function (r) {
                lastText = r.content || "";
                document.getElementById("fileContent").textContent = lastText || r.message || "";
              });
          };
        });
      });
  }

  document.querySelectorAll(".tabs button").forEach(function (btn) {
    btn.onclick = function () {
      document.querySelectorAll(".tabs button").forEach(function (b) {
        b.classList.toggle("active", b === btn);
      });
      var t = btn.getAttribute("data-tab");
      document.getElementById("panelCloud").classList.toggle("hidden", t !== "cloud");
      document.getElementById("panelLocal").classList.toggle("hidden", t !== "local");
    };
  });

  document.getElementById("btnAnalyze").onclick = function () {
    if (!lastText) {
      document.getElementById("aiOut").innerHTML = "<p>Chargez un fichier d'abord</p>";
      return;
    }
    document.getElementById("aiOut").innerHTML = "<p>Analyse…</p>";
    fetch("/api/ai/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ text: lastText, documentType: "generic" }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        document.getElementById("aiOut").innerHTML = res.ok
          ? "<pre>" + esc(JSON.stringify(res.extractedData, null, 2)) + "</pre>"
          : "<p style='color:#b91c1c'>" + esc(res.error) + "</p>";
      });
  };

  loadCloud();
  loadLocal();
})();
