/**
 * Prêts communautaires — inspire lendingService.ts multisite (#ServiceMobile)
 */
window.LendingService = {
  STORAGE: "lo_lending_offers",

  defaultOffers: function () {
    return [
      { id: "loan_1", lender: "Sophie VTC", item: "Dashcam 4K", deposit: 50, days: 7, available: true, category: "equipement" },
      { id: "loan_2", lender: "Communauté VTC", item: "Kit secours route", deposit: 0, days: 14, available: true, category: "equipement" },
      { id: "loan_3", lender: "Wendy B.", item: "Expertise sinistre (1h)", deposit: 0, days: 1, available: false, category: "service" },
      { id: "loan_4", lender: "Thomas M.", item: "Service Mobile — diagnostic batterie", deposit: 0, days: 1, available: true, category: "mobile" },
    ];
  },

  load: function () {
    try {
      var s = localStorage.getItem(this.STORAGE);
      return s ? JSON.parse(s) : this.defaultOffers();
    } catch (e) {
      return this.defaultOffers();
    }
  },

  save: function (offers) {
    localStorage.setItem(this.STORAGE, JSON.stringify(offers));
  },

  addOffer: function (item, lender, days, deposit) {
    var offers = this.load();
    offers.unshift({
      id: "loan_" + Date.now(),
      lender: lender || "Vous",
      item: item,
      deposit: Number(deposit) || 0,
      days: Number(days) || 7,
      available: true,
      category: "communaute",
    });
    this.save(offers);
  },

  requestLoan: function (offerId) {
    var offers = this.load();
    var o = offers.find(function (x) {
      return x.id === offerId;
    });
    if (!o || !o.available) return { ok: false, error: "Indisponible" };
    o.available = false;
    o.borrowedAt = new Date().toISOString();
    this.save(offers);
    return { ok: true, offer: o };
  },

  returnLoan: function (offerId) {
    var offers = this.load();
    var o = offers.find(function (x) {
      return x.id === offerId;
    });
    if (!o) return false;
    o.available = true;
    delete o.borrowedAt;
    this.save(offers);
    return true;
  },

  render: function (mount, opts) {
    opts = opts || {};
    var self = this;
    var offers = this.load();
    var filter = opts.filter || "";

    var list = offers.filter(function (o) {
      if (!filter) return true;
      return o.category === filter || (filter === "mobile" && String(o.item).indexOf("Mobile") >= 0);
    });

    var html =
      "<h2>Prêts entre membres</h2>" +
      '<p style="color:#64748b;font-size:.9rem">Service Mobile &amp; équipement — caution et durée affichées.</p>' +
      '<p style="margin:8px 0"><button type="button" class="btn-loan-filter" data-f="">Tous</button> ' +
      '<button type="button" class="btn-loan-filter" data-f="mobile">📱 Mobile</button> ' +
      '<button type="button" class="btn-loan-filter" data-f="equipement">Équipement</button></p>';

    if (opts.showPropose !== false) {
      html +=
        '<details style="margin:12px 0;border:1px solid #e2e8f0;border-radius:10px;padding:10px"><summary style="cursor:pointer;font-weight:600">Proposer un prêt</summary>' +
        '<form id="loanPropose" style="margin-top:10px;display:grid;gap:8px">' +
        '<input name="item" required placeholder="Objet ou service" style="padding:10px;border:1px solid #e2e8f0;border-radius:8px" />' +
        '<input name="days" type="number" min="1" value="7" placeholder="Durée (jours)" style="padding:10px;border:1px solid #e2e8f0;border-radius:8px" />' +
        '<input name="deposit" type="number" min="0" placeholder="Caution €" style="padding:10px;border:1px solid #e2e8f0;border-radius:8px" />' +
        '<button type="submit" style="padding:10px;background:#0d9488;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer">Publier</button></form></details>';
    }

    html += "<ul style='list-style:none;padding:0'>";
    list.forEach(function (o) {
      html +=
        "<li style='padding:12px 0;border-bottom:1px solid #f1f5f9'>" +
        "<strong>" +
        o.item +
        "</strong> — " +
        o.lender +
        " · " +
        o.days +
        " j";
      if (o.deposit) html += " · caution " + o.deposit + " €";
      if (o.available) {
        html +=
          ' <button type="button" data-loan="' +
          o.id +
          '" style="padding:4px 10px;background:#0d9488;color:#fff;border:none;border-radius:6px;cursor:pointer">Demander</button>';
      } else {
        html +=
          " <span style='color:#94a3b8'>(emprunté)</span> " +
          '<button type="button" data-return="' +
          o.id +
          '" style="padding:4px 10px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:6px;cursor:pointer;font-size:.8rem">Rendre</button>';
      }
      html += "</li>";
    });
    html += "</ul>";
    mount.innerHTML = html;

    var form = document.getElementById("loanPropose");
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var fd = new FormData(e.target);
        var tok = "";
        try {
          tok = localStorage.getItem("lo_ext_token");
        } catch (err) {}
        self.addOffer(fd.get("item"), tok ? "Membre connecté" : "Anonyme", fd.get("days"), fd.get("deposit"));
        self.render(mount, opts);
      };
    }

    mount.querySelectorAll("[data-loan]").forEach(function (btn) {
      btn.onclick = function () {
        var r = self.requestLoan(btn.getAttribute("data-loan"));
        alert(r.ok ? "Demande enregistrée — le prêteur vous contacte." : r.error);
        self.render(mount, opts);
      };
    });

    mount.querySelectorAll("[data-return]").forEach(function (btn) {
      btn.onclick = function () {
        self.returnLoan(btn.getAttribute("data-return"));
        self.render(mount, opts);
      };
    });

    mount.querySelectorAll(".btn-loan-filter").forEach(function (btn) {
      btn.onclick = function () {
        opts.filter = btn.getAttribute("data-f");
        self.render(mount, opts);
      };
    });
  },
};
