(function () {
  var token = localStorage.getItem("lo_token");
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var CHECKLIST_LABELS = {
    identifiedActors: "Cartographier acteurs (fournisseurs, clients B2B, expert-comptable)",
    chosenPdpOrAccountingTool: "Choisir une PDP ou un outil compatible (compta / banque)",
    designatedReceptionPlatform: "Désigner la plateforme de réception",
    updatedSupplierContacts: "Informer les fournisseurs de la plateforme de réception",
    sirenClientsCollected: "Collecter les SIREN clients B2B pour les factures émises",
    invoiceMentionsReady: "Mentions obligatoires prêtes (SIREN client, nature ops, livraison, TVA débits)",
    retentionProcessDefined: "Processus de conservation 6 ans défini",
    expertComptableBriefed: "Expert-comptable briefé / trajectoire documentée",
  };

  function headers() {
    return { Authorization: "Bearer " + token, "Content-Type": "application/json" };
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fillForm(form, data) {
    if (!form || !data) return;
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name) return;
      if (el.type === "checkbox") {
        el.checked = !!data[el.name];
      } else if (data[el.name] != null) {
        el.value = data[el.name];
      }
    });
  }

  function formObject(form) {
    var out = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || el.disabled) return;
      if (el.type === "checkbox") out[el.name] = !!el.checked;
      else out[el.name] = el.value;
    });
    return out;
  }

  function renderBanner(r) {
    var el = document.getElementById("einvBanner");
    if (!el || !r) return;
    var cls = "ok";
    var msg =
      "Réception : échéance " +
      r.receiveDeadline +
      " (" +
      r.daysUntilReceive +
      " j). Émission (" +
      (r.companySize || "") +
      ") : " +
      r.emitDeadline +
      ".";
    if (r.status === "critical" || (r.daysUntilReceive <= 7 && r.blockers && r.blockers.length)) {
      cls = "critical";
      msg =
        "URGENT — J-" +
        Math.max(0, r.daysUntilReceive) +
        " avant l’obligation de réception (1er sept. 2026). " +
        (r.blockers && r.blockers[0] ? r.blockers[0] : "Finalisez la désignation PDP.");
    } else if (r.blockers && r.blockers.length) {
      cls = "warn";
      msg = "En cours — " + r.blockers[0];
    } else {
      msg = "Trajectoire OK — " + msg;
    }
    el.className = "einv-banner " + cls;
    el.textContent = msg;
  }

  function renderKpis(data) {
    var el = document.getElementById("einvKpis");
    if (!el || !data) return;
    var r = data.readiness || {};
    var c = data.counts || {};
    var ch = r.checklist || {};
    el.innerHTML =
      '<div class="kpi-card"><div class="kpi-label">Jours avant réception</div><div class="kpi-value">' +
      esc(String(r.daysUntilReceive != null ? r.daysUntilReceive : "—")) +
      '</div></div><div class="kpi-card"><div class="kpi-label">Checklist</div><div class="kpi-value">' +
      esc(String(ch.done || 0)) +
      "/" +
      esc(String(ch.total || 8)) +
      '</div></div><div class="kpi-card"><div class="kpi-label">PDP</div><div class="kpi-value">' +
      (r.pdpOk ? "OK" : "À faire") +
      '</div></div><div class="kpi-card"><div class="kpi-label">Reçues / Émises</div><div class="kpi-value">' +
      esc(String(c.received || 0)) +
      " / " +
      esc(String(c.issued || 0)) +
      "</div></div>";
  }

  function renderChecklist(settings) {
    var form = document.getElementById("einvChecklist");
    if (!form) return;
    var cl = (settings && settings.checklist) || {};
    var html = "";
    Object.keys(CHECKLIST_LABELS).forEach(function (key) {
      html +=
        "<label><input type=\"checkbox\" name=\"" +
        key +
        "\"" +
        (cl[key] ? " checked" : "") +
        " /> <span>" +
        esc(CHECKLIST_LABELS[key]) +
        "</span></label>";
    });
    html += '<button type="submit" class="btn btn-ghost" style="margin-top:12px">Sauver checklist</button>';
    form.innerHTML = html;
  }

  function downloadXml(id, filename) {
    return fetch("/api/crm/e-invoicing?sub=xml&id=" + encodeURIComponent(id), {
      headers: { Authorization: "Bearer " + token },
    })
      .then(function (r) {
        if (!r.ok) throw new Error("Téléchargement impossible");
        return r.text().then(function (text) {
          return { text: text, name: filename || id + "-factur-x.xml" };
        });
      })
      .then(function (file) {
        var blob = new Blob([file.text], { type: "application/xml" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      })
      .catch(function (err) {
        alert(err.message || "Erreur téléchargement");
      });
  }

  function renderTable(targetId, rows, columns) {
    var el = document.getElementById(targetId);
    if (!el) return;
    if (!rows || !rows.length) {
      el.innerHTML = '<p class="einv-muted">Aucune entrée pour le moment.</p>';
      return;
    }
    var head = columns
      .map(function (c) {
        return "<th>" + esc(c.label) + "</th>";
      })
      .join("");
    var body = rows
      .map(function (row) {
        return (
          "<tr>" +
          columns
            .map(function (c) {
              var v = typeof c.value === "function" ? c.value(row) : row[c.key];
              return "<td>" + (c.html ? v : esc(v == null ? "—" : v)) + "</td>";
            })
            .join("") +
          "</tr>"
        );
      })
      .join("");
    el.innerHTML = '<table class="einv-table"><thead><tr>' + head + "</tr></thead><tbody>" + body + "</tbody></table>";
    Array.prototype.forEach.call(el.querySelectorAll("[data-xml-id]"), function (btn) {
      btn.addEventListener("click", function () {
        downloadXml(btn.getAttribute("data-xml-id"), btn.getAttribute("data-xml-name"));
      });
    });
  }

  function saveSettingsPatch(patch) {
    return fetch("/api/crm/e-invoicing", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ action: "save-settings", settings: patch }),
    }).then(function (r) {
      return r.json();
    });
  }

  function loadAll() {
    return fetch("/api/crm/e-invoicing?sub=status", { headers: headers() })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        if (!data.ok) {
          document.getElementById("einvBanner").className = "einv-banner critical";
          document.getElementById("einvBanner").textContent = data.error || "Impossible de charger le module.";
          return data;
        }
        renderBanner(data.readiness);
        renderKpis(data);
        renderChecklist(data.settings);
        fillForm(document.getElementById("einvPdpForm"), data.settings);
        fillForm(document.getElementById("einvIdentityForm"), data.settings);
        return data;
      });
  }

  function loadLists() {
    fetch("/api/crm/e-invoicing?sub=received", { headers: headers() })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        renderTable("einvRecvList", res.invoices || [], [
          { label: "Date", key: "invoice_date" },
          { label: "Fournisseur", key: "supplier_name" },
          { label: "SIREN", key: "supplier_siren" },
          { label: "N°", key: "invoice_number" },
          { label: "TTC", key: "amount_ttc" },
          { label: "Canal", key: "channel" },
        ]);
      });
    fetch("/api/crm/e-invoicing?sub=issued", { headers: headers() })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        renderTable("einvIssuedList", res.invoices || [], [
          { label: "Date", key: "invoice_date" },
          { label: "N°", key: "invoice_number" },
          { label: "Client", key: "buyer_name" },
          { label: "SIREN", key: "buyer_siren" },
          { label: "TTC", key: "amount_ttc" },
          { label: "Statut", key: "status" },
          {
            label: "XML",
            html: true,
            value: function (row) {
              return (
                '<button type="button" class="btn btn-ghost" data-xml-id="' +
                esc(row.id) +
                '" data-xml-name="' +
                esc((row.invoice_number || row.id) + "-factur-x.xml") +
                '">Télécharger</button>'
              );
            },
          },
        ]);
      });
  }

  document.getElementById("einvChecklist").addEventListener("submit", function (e) {
    e.preventDefault();
    var cl = formObject(e.target);
    saveSettingsPatch({ checklist: cl }).then(function () {
      return loadAll();
    });
  });

  document.getElementById("einvPdpForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var data = formObject(e.target);
    saveSettingsPatch(data).then(function () {
      return loadAll();
    });
  });

  document.getElementById("einvIdentityForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var data = formObject(e.target);
    saveSettingsPatch(data).then(function () {
      return loadAll();
    });
  });

  document.getElementById("einvIssueForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var data = formObject(e.target);
    data.action = "issue";
    data.amountHt = Number(data.amountHt);
    data.vatRate = Number(data.vatRate || 20);
    var box = document.getElementById("einvIssueResult");
    fetch("/api/crm/e-invoicing", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        box.hidden = false;
        if (!res.ok) {
          box.innerHTML =
            "<strong>Erreur</strong><ul>" +
            (res.errors || [res.error || "Échec"])
              .map(function (x) {
                return "<li>" + esc(x) + "</li>";
              })
              .join("") +
            "</ul>";
          return;
        }
        box.innerHTML =
          "<strong>Facture " +
          esc(res.invoiceNumber) +
          " créée.</strong> " +
          '<button type="button" class="btn btn-ghost" id="einvDlXml">Télécharger le XML Factur-X</button>' +
          "<p>" +
          esc(res.warning || "") +
          "</p><p>Mentions :</p><ul>" +
          (res.mentions || [])
            .map(function (m) {
              return "<li>" + esc(m) + "</li>";
            })
            .join("") +
          "</ul>";
        var dl = document.getElementById("einvDlXml");
        if (dl) {
          dl.addEventListener("click", function () {
            downloadXml(res.id, res.invoiceNumber + "-factur-x.xml");
          });
        }
        loadLists();
        loadAll();
      });
  });

  document.getElementById("einvRecvForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var data = formObject(e.target);
    data.action = "register-received";
    if (data.amountTtc) data.amountTtc = Number(data.amountTtc);
    fetch("/api/crm/e-invoicing", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(data),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (res.ok) {
          e.target.reset();
          loadLists();
          loadAll();
        } else {
          alert(res.error || "Erreur");
        }
      });
  });

  loadAll().then(loadLists);
})();
