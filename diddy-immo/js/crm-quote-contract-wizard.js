/**
 * Wizard devis/contrat — inspire QuoteContractWizard.tsx multisite
 */
window.CrmQuoteContractWizard = {
  STEPS: [
    { id: 1, title: "Contact", key: "contact" },
    { id: 2, title: "Véhicule", key: "vehicle" },
    { id: 3, title: "Conducteur", key: "driver" },
    { id: 4, title: "Banque", key: "bank" },
    { id: 5, title: "Produit", key: "product" },
  ],

  render: function (mount, opts) {
    opts = opts || {};
    var self = this;
    var step = 1;
    var data = { type: opts.type || "quote" };
    var token = opts.token;

    function headers() {
      return { "Content-Type": "application/json", Authorization: "Bearer " + token };
    }

    function html() {
      var s = self.STEPS[step - 1];
      var fields = "";
      if (step === 1) {
        fields =
          '<label>Rechercher un client existant<input id="wSearch" placeholder="Nom, email, téléphone…" autocomplete="off" /></label>' +
          '<div id="wSearchResults" style="margin-top:8px;font-size:.85rem"></div>' +
          '<label style="margin-top:12px;display:block">ID contact<input id="wContactId" placeholder="ct_…" /></label>' +
          '<label style="margin-top:10px;display:block">Nom<input id="wName" /></label>' +
          '<label style="margin-top:10px;display:block">Email<input type="email" id="wEmail" /></label>';
      } else if (step === 2) {
        fields =
          '<p style="font-size:.85rem;color:var(--muted)">Recherchez une immatriculation existante ou créez-en une nouvelle.</p>' +
          '<label>Immatriculation<input id="wReg" /></label>' +
          '<label style="margin-top:10px;display:block">Marque / Modèle<input id="wBrand" placeholder="Peugeot 508" /></label>';
      } else if (step === 3) {
        fields =
          '<label>Profil du conducteur — Permis n°<input id="wLicense" /></label>' +
          '<label style="margin-top:10px;display:block">Date permis<input type="date" id="wLicDate" /></label>';
      } else if (step === 4) {
        fields =
          '<label>Titulaire compte<input id="wHolder" /></label>' +
          '<label style="margin-top:10px;display:block">IBAN<input id="wIban" placeholder="FR76…" /></label>' +
          '<label style="margin-top:10px;display:block">BIC<input id="wBic" placeholder="BNPAFRPP" /></label>';
      } else {
        fields =
          '<label>Produit<select id="wProduct"><option value="vtc-taxi">VTC Taxi</option><option value="auto">Auto</option><option value="habitation">Habitation</option><option value="sante">Santé</option></select></label>' +
          '<label style="margin-top:10px;display:block">Prime estimée €/an<input type="number" id="wPremium" /></label>' +
          '<label style="margin-top:10px;display:block">Formule<input id="wFormula" placeholder="Tous risques" /></label>' +
          '<p style="margin-top:12px;font-size:.85rem"><a href="./crm-ai-suggestions.html" target="_blank">Assistant IA documents →</a></p>';
      }
      return (
        '<div class="panel"><p style="color:var(--muted)">Étape ' +
        step +
        "/5 — " +
        s.title +
        " · Mode " +
        (data.type === "contract" ? "contrat" : "devis") +
        '</p><div style="display:flex;gap:6px;margin-bottom:16px">' +
        self.STEPS.map(function (st, i) {
          return '<span style="flex:1;height:4px;border-radius:2px;background:' + (i < step ? "#6366f1" : "#e2e8f0") + '"></span>';
        }).join("") +
        "</div>" +
        fields +
        '<div style="display:flex;gap:10px;margin-top:20px">' +
        (step > 1 ? '<button type="button" class="btn btn-ghost" id="wPrev">← Précédent</button>' : "") +
        (step < 5
          ? '<button type="button" class="btn btn-primary" id="wNext">Suivant →</button>'
          : '<button type="button" class="btn btn-primary" id="wFinish">Créer le ' +
            (data.type === "contract" ? "contrat" : "devis") +
            "</button>") +
        "</div></div>"
      );
    }

    function collect() {
      if (step === 1) {
        data.contactId = document.getElementById("wContactId") && document.getElementById("wContactId").value.trim();
        data.name = document.getElementById("wName").value.trim();
        data.email = document.getElementById("wEmail").value.trim();
      } else if (step === 2) {
        data.registration = document.getElementById("wReg").value.trim();
        var parts = document.getElementById("wBrand").value.trim().split(/\s+/);
        data.brand = parts[0] || "";
        data.model = parts.slice(1).join(" ") || "";
      } else if (step === 3) {
        data.license = document.getElementById("wLicense").value.trim();
        data.licenseDate = document.getElementById("wLicDate").value;
      } else if (step === 4) {
        data.accountHolder = document.getElementById("wHolder").value.trim();
        data.iban = document.getElementById("wIban").value.trim();
        data.bic = document.getElementById("wBic").value.trim();
      } else {
        data.productType = document.getElementById("wProduct").value;
        data.premium = document.getElementById("wPremium").value;
        data.formula = document.getElementById("wFormula").value.trim();
      }
    }

    function bindSearch() {
      var inp = document.getElementById("wSearch");
      var box = document.getElementById("wSearchResults");
      if (!inp || !box) return;
      var t;
      inp.oninput = function () {
        clearTimeout(t);
        var q = inp.value.trim();
        if (q.length < 2) {
          box.innerHTML = "";
          return;
        }
        t = setTimeout(function () {
          fetch("/api/crm/contacts?search=" + encodeURIComponent(q) + "&limit=8", {
            headers: headers(),
          })
            .then(function (r) {
              return r.json();
            })
            .then(function (res) {
              if (!res.ok || !res.contacts.length) {
                box.innerHTML = "<span style='color:var(--muted)'>Aucun client</span>";
                return;
              }
              box.innerHTML = res.contacts
                .map(function (c) {
                  var nm = ((c.first_name || "") + " " + (c.last_name || "")).trim() || c.email;
                  return (
                    '<button type="button" class="btn btn-ghost btn-sm" style="display:block;margin:4px 0;width:100%;text-align:left" data-cid="' +
                    c.id +
                    '" data-nm="' +
                    nm.replace(/"/g, "") +
                    '" data-em="' +
                    (c.email || "") +
                    '">' +
                    nm +
                    " · " +
                    (c.email || c.phone || c.id) +
                    "</button>"
                  );
                })
                .join("");
              box.querySelectorAll("button[data-cid]").forEach(function (btn) {
                btn.onclick = function () {
                  document.getElementById("wContactId").value = btn.getAttribute("data-cid");
                  document.getElementById("wName").value = btn.getAttribute("data-nm");
                  document.getElementById("wEmail").value = btn.getAttribute("data-em");
                  box.innerHTML = "";
                };
              });
            });
        }, 300);
      };
    }

    function bind() {
      var prev = document.getElementById("wPrev");
      var next = document.getElementById("wNext");
      var fin = document.getElementById("wFinish");
      if (prev) prev.onclick = function () { collect(); step--; paint(); };
      if (next) next.onclick = function () { collect(); step++; paint(); };
      if (fin) fin.onclick = function () { collect(); self.submit(data, token); };
      bindSearch();
    }

    function paint() {
      mount.innerHTML = html();
      bind();
    }
    paint();
  },

  submit: function (data, token) {
    if (!data.contactId) {
      alert("Sélectionnez ou saisissez un contactId existant (fiche contact).");
      return;
    }
    var h = { "Content-Type": "application/json", Authorization: "Bearer " + token };
    var cid = data.contactId;

    function patchBank() {
      if (!data.iban && !data.accountHolder) return Promise.resolve();
      return fetch("/api/crm/contact?id=" + encodeURIComponent(cid), {
        method: "PATCH",
        headers: h,
        body: JSON.stringify({
          metadata: {
            bank: {
              accountHolder: data.accountHolder,
              iban: data.iban,
              bic: data.bic,
              isDefault: true,
            },
          },
        }),
      }).then(function (r) { return r.json(); });
    }

    function postModule(resource, body) {
      return fetch(
        "/api/crm/modules?resource=" + resource + "&contactId=" + encodeURIComponent(cid),
        { method: "POST", headers: h, body: JSON.stringify(body) }
      ).then(function (r) { return r.json(); });
    }

    patchBank()
      .then(function () {
        var chain = Promise.resolve();
        if (data.registration || data.brand) {
          chain = chain.then(function () {
            return postModule("vehicles", {
              registration: data.registration,
              brand: data.brand,
              model: data.model,
              vehicle_type: "VTC / Taxi",
              status: "En attente",
            });
          });
        }
        if (data.license) {
          chain = chain.then(function () {
            var names = (data.name || "").split(/\s+/);
            return postModule("drivers", {
              first_name: names[0] || "",
              last_name: names.slice(1).join(" ") || "",
              license_number: data.license,
              status: "Actif",
            });
          });
        }
        return chain;
      })
      .then(function () {
        if (data.type === "contract") {
          return fetch(
            "/api/crm/modules?resource=contracts&contactId=" + encodeURIComponent(cid),
            {
              method: "POST",
              headers: h,
              body: JSON.stringify({
                contract_type: data.productType || "vtc-taxi",
                status: "En attente",
                premium: data.premium ? Number(data.premium) / 12 : null,
                insurer: "À définir",
                policy_number: "POL-" + Date.now().toString(36).toUpperCase(),
                description: "Wizard — " + (data.formula || ""),
              }),
            }
          ).then(function (r) { return r.json(); });
        }
        return fetch("/api/crm/quotes", {
          method: "POST",
          headers: h,
          body: JSON.stringify({
            contactId: cid,
            productType: data.productType || "vtc-taxi",
            title: "Devis " + (data.productType || "VTC") + " — wizard",
            premiumEstimate: data.premium ? Number(data.premium) : null,
            status: "brouillon",
            data: data,
          }),
        }).then(function (r) { return r.json(); });
      })
      .then(function (res) {
        if (!res.ok) {
          alert(res.error || "Erreur");
          return;
        }
        if (data.type === "contract" && res.item) {
          location.href =
            "./crm-contract-detail.html?id=" +
            encodeURIComponent(res.item.id) +
            "&contactId=" +
            encodeURIComponent(cid);
        } else if (res.quote) {
          location.href = "./crm-quote-detail.html?id=" + encodeURIComponent(res.quote.id);
        } else alert("Créé");
      });
  },
};
