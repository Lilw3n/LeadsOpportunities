window.CrmFinancialList = {
  init: function (type) {
    var TOKEN_KEY = "lo_token";

    if (!localStorage.getItem(TOKEN_KEY)) {
      location.href = "./crm.html";
      return;
    }

    function esc(s) {
      var d = document.createElement("div");
      d.textContent = String(s == null ? "" : s);
      return d.innerHTML;
    }

    function kpi(label, val) {
      return (
        '<div class="kpi-card panel"><div class="kpi-label">' +
        label +
        '</div><div class="kpi-value">' +
        val +
        "</div></div>"
      );
    }

    function moduleLinks(type) {
      var links = {
        receivables: [
          ["crm-interlocutors.html", "Créances ↔ Interlocuteurs"],
          ["crm-financial-payments.html", "Créances ↔ Paiements"],
          ["crm-intelligent-alerts.html", "Créances ↔ Notifications"],
        ],
        payments: [
          ["crm-financial-receivables.html", "Paiements ↔ Créances"],
          ["crm-insurance.html", "Paiements ↔ Assurance"],
          ["crm-intelligent-alerts.html", "Paiements ↔ Notifications"],
        ],
        debits: [
          ["crm-interlocutors.html", "Débits ↔ Interlocuteurs"],
          ["crm-financial-payments.html", "Débits ↔ Paiements"],
          ["crm-financial.html", "Débits ↔ Rapports"],
        ],
      };
      var items = links[type] || [];
      if (!items.length) return "";
      return (
        '<div class="panel" style="margin-bottom:16px;padding:12px 14px"><strong style="font-size:.9rem">🔗 Liaisons de modules</strong><p style="margin:8px 0 0;display:flex;flex-wrap:wrap;gap:8px">' +
        items
          .map(function (pair) {
            return '<a href="./' + pair[0] + '" class="btn btn-ghost btn-sm">' + esc(pair[1]) + "</a>";
          })
          .join("") +
        "</p></div>"
      );
    }

    function recentActivity(entries, type) {
      var slice = entries.slice(0, 3);
      if (!slice.length) return "";
      var labels = {
        receivables: "Alertes automatiques de relances",
        payments: "Activité récente",
        debits: "Génération automatique de rapports financiers",
      };
      return (
        '<div class="panel" style="margin-bottom:16px;padding:12px 14px"><strong style="font-size:.9rem">📅 ' +
        esc(labels[type] || "Activité") +
        '</strong><ul style="margin:8px 0 0;padding-left:18px;font-size:.88rem;color:var(--muted)">' +
        slice
          .map(function (e, i) {
            var when = ["Il y a 2 heures", "Il y a 1 jour", "Il y a 2 jours"][i] || "Récent";
            return (
              "<li>" +
              esc(e.contactName || "Client") +
              " — " +
              Number(e.amount).toLocaleString("fr-FR") +
              " € — " +
              when +
              "</li>"
            );
          })
          .join("") +
        "</ul></div>"
      );
    }

    var titles = {
      receivables: "💰 Créances clients",
      payments: "💳 Liste des paiements",
      debits: "📉 Débits fournisseurs",
    };

    var subtitles = {
      receivables: "Suivi et recouvrement des créances clients",
      payments: "Paiement automatique des primes · rapprochement créances",
      debits: "Suivi des dettes et obligations financières",
    };

    function manualForType(t) {
      var all = [];
      try {
        all = JSON.parse(localStorage.getItem("lo_financial_manual") || "[]");
      } catch (e) {}
      return all.filter(function (m) {
        if (t === "payments") return m.type === "payment";
        if (t === "debits") return m.type === "debit";
        return false;
      });
    }

    fetch("/api/crm/financial-entries?type=" + encodeURIComponent(type), {
      headers: { Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY) },
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        var mount = document.getElementById("listMount");
        var entries = (res.ok && res.entries ? res.entries : []).concat(manualForType(type));

        if (!entries.length) {
          mount.innerHTML =
            moduleLinks(type) +
            "<p>Aucune entrée — " +
            (type === "debits"
              ? "débits dérivés des obligations fournisseurs."
              : "données dérivées des contrats CRM.") +
            "</p>" +
            (type === "payments"
              ? '<p><a href="./crm-financial-payment-new.html" class="btn btn-primary">+ Nouveau paiement</a></p>'
              : type === "debits"
                ? '<p><a href="./crm-financial-debit-new.html" class="btn btn-primary">+ Nouveau débit</a></p>'
                : "");
          return;
        }
        var total = entries.reduce(function (s, e) {
          return s + (Number(e.amount) || 0);
        }, 0);

        var pending = entries.filter(function (e) {
          var st = String(e.status || "").toLowerCase();
          return st.indexOf("attente") >= 0 || st === "pending" || st.indexOf("retard") >= 0;
        });

        var confirmed = entries.filter(function (e) {
          var st = String(e.status || "").toLowerCase();
          return st.indexOf("confirm") >= 0 || st.indexOf("pay") >= 0 || st.indexOf("actif") >= 0;
        });

        var paid = entries.length - pending.length;

        var kpis = kpi("Montant total", total.toLocaleString("fr-FR") + " €") + kpi("Entrées", entries.length);

        if (type === "receivables") {
          kpis += kpi("En attente / retard", pending.length) + kpi("Payées", paid);
        } else if (type === "payments") {
          kpis += kpi("Confirmés", confirmed.length || paid) + kpi("En attente", pending.length);
        } else if (type === "debits") {
          kpis += kpi("Payés", confirmed.length || paid) + kpi("En retard", pending.length);
        }

        var toolbar =
          (titles[type] ? "<h2 style='margin:0 0 4px;font-size:1.1rem'>" + titles[type] + "</h2>" : "") +
          (subtitles[type] ? "<p style='margin:0 0 12px;color:var(--muted);font-size:.9rem'>" + subtitles[type] + "</p>" : "") +
          moduleLinks(type) +
          recentActivity(entries, type) +
          '<div class="crm-kpis" style="margin-bottom:16px">' +
          kpis +
          "</div>" +
          (type === "receivables"
            ? '<p style="margin-bottom:12px"><button type="button" id="btnExportCsv" class="btn btn-ghost btn-sm">📊 Exporter CSV</button> · <button type="button" id="btnRelance" class="btn btn-ghost btn-sm">📧 Relances (bientôt)</button></p>'
            : type === "payments"
              ? '<p style="margin-bottom:12px"><a href="./crm-financial-payment-new.html" class="btn btn-primary btn-sm">+ Nouveau paiement</a> · <button type="button" id="btnLinkDebit" class="btn btn-ghost btn-sm">Lier / délier créance</button></p>'
              : type === "debits"
                ? '<p style="margin-bottom:12px"><a href="./crm-financial-debit-new.html" class="btn btn-primary btn-sm">+ Nouveau débit</a> · <button type="button" id="btnPlanDebit" class="btn btn-ghost btn-sm">📅 Planifier débit</button></p>'
                : "");

        mount.innerHTML =
          toolbar +
          "<table><thead><tr><th>Réf.</th><th>Montant</th><th>Statut</th><th>Contact</th><th>Actions</th></tr></thead><tbody>" +
          entries
            .map(function (e) {
              return (
                "<tr><td><a href='./crm-financial-detail.html?type=" +
                encodeURIComponent(type) +
                "&id=" +
                encodeURIComponent(e.id) +
                "'>" +
                esc(e.label) +
                "</a></td><td>" +
                Number(e.amount).toLocaleString("fr-FR") +
                " €</td><td>" +
                esc(e.status) +
                "</td><td><a href='./crm-contact.html?id=" +
                encodeURIComponent(e.contactId) +
                "'>" +
                esc(e.contactName) +
                "</a></td><td>" +
                (e.manual
                  ? "<span style='font-size:.75rem;color:var(--muted)'>Manuel</span>"
                  : type === "receivables" && String(e.status || "").toLowerCase().indexOf("attente") >= 0
                    ? "<button type='button' class='btn btn-ghost btn-sm btn-relance-one' data-id='" +
                      esc(e.id) +
                      "'>Relancer</button>"
                    : type === "payments"
                      ? "<button type='button' class='btn btn-ghost btn-sm btn-link-one' data-id='" +
                        esc(e.id) +
                        "'>Lier</button>"
                      : "—") +
                "</td></tr>"
              );
            })
            .join("") +
          "</tbody></table>";

        var btnCsv = document.getElementById("btnExportCsv");
        if (btnCsv) {
          btnCsv.onclick = function () {
            var csv =
              "ref;montant;statut;contact\n" +
              entries
                .map(function (e) {
                  return [e.label, e.amount, e.status, e.contactName].join(";");
                })
                .join("\n");
            var a = document.createElement("a");
            a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
            a.download = type + "-" + new Date().toISOString().slice(0, 10) + ".csv";
            a.click();
          };
        }

        mount.querySelectorAll(".btn-relance-one").forEach(function (btn) {
          btn.onclick = function () {
            alert(
              "Relance simulée pour " + btn.getAttribute("data-id") + " — branchez SMTP ou webhook multisite."
            );
          };
        });

        var btnDebit = document.getElementById("btnPlanDebit");
        if (btnDebit) {
          btnDebit.onclick = function () {
            alert("Planification débit simulée — branchez calendrier multisite.");
          };
        }
        var btnLink = document.getElementById("btnLinkDebit");
        if (btnLink) {
          btnLink.onclick = function () {
            var id = prompt("ID créance / contrat à lier au paiement :");
            if (id) alert("Liaison simulée : " + id);
          };
        }
        mount.querySelectorAll(".btn-link-one").forEach(function (btn) {
          btn.onclick = function () {
            var id = prompt("ID créance à lier :");
            if (id) alert("Paiement " + btn.getAttribute("data-id") + " lié à " + id + " (simulation).");
          };
        });
      });
  },
};
