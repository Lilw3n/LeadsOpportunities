/**
 * Entraide communautaire — inspire mutualAidService.ts multisite
 */
window.MutualAidService = {
  STORAGE: "lo_mutual_aid_campaigns",

  defaultCampaigns: function () {
    return [
      {
        id: "camp_vtc_sinistre",
        title: "Cagnotte sinistre VTC — Marc D.",
        goal: 3000,
        raised: 2400,
        contributors: 48,
        category: "urgence",
        emoji: "🚡",
      },
      {
        id: "camp_dashcam",
        title: "Prêt dashcam communautaire",
        goal: 800,
        raised: 520,
        contributors: 12,
        category: "equipement",
        emoji: "📹",
      },
    ];
  },

  load: function () {
    try {
      var s = localStorage.getItem(this.STORAGE);
      return s ? JSON.parse(s) : this.defaultCampaigns();
    } catch (e) {
      return this.defaultCampaigns();
    }
  },

  save: function (campaigns) {
    localStorage.setItem(this.STORAGE, JSON.stringify(campaigns));
  },

  connectionsCount: function () {
    var c = this.load();
    return c.reduce(function (s, x) {
      return s + (x.contributors || 0);
    }, 0);
  },

  createCampaign: function (title, goal, emoji) {
    var campaigns = this.load();
    campaigns.unshift({
      id: "camp_" + Date.now(),
      title: title,
      goal: Number(goal) || 500,
      raised: 0,
      contributors: 0,
      category: "communaute",
      emoji: emoji || "🤝",
    });
    this.save(campaigns);
    return campaigns[0];
  },

  contribute: function (campaignId, amount) {
    var campaigns = this.load();
    var c = campaigns.find(function (x) {
      return x.id === campaignId;
    });
    if (!c) return null;
    var amt = Number(amount) || 10;
    c.raised = Math.min(c.goal, c.raised + amt);
    c.contributors += 1;
    this.save(campaigns);
    return c;
  },

  render: function (mount, opts) {
    opts = opts || {};
    var self = this;
    var campaigns = this.load();
    var conn = this.connectionsCount();

    var html =
      "<h2>Cagnottes solidaires</h2>" +
      '<p style="color:#64748b;font-size:.9rem;margin:0 0 12px"><strong>' +
      conn +
      "</strong> connexions entraide · membres vérifiés</p>";

    if (opts.showCreate !== false) {
      html +=
        '<div style="border:1px dashed #cbd5e1;border-radius:12px;padding:14px;margin-bottom:16px">' +
        "<strong>Lancer une cagnotte</strong>" +
        '<form id="mutualCreate" style="margin-top:10px;display:grid;gap:8px">' +
        '<input name="title" required placeholder="Titre de la cagnotte" style="padding:10px;border:1px solid #e2e8f0;border-radius:8px" />' +
        '<input type="number" name="goal" min="50" placeholder="Objectif €" style="padding:10px;border:1px solid #e2e8f0;border-radius:8px" />' +
        '<button type="submit" style="padding:10px;background:#6366f1;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer">Créer</button></form></div>';
    }

    campaigns.forEach(function (c) {
      var pct = Math.round((c.raised / c.goal) * 100);
      html +=
        '<div style="border:1px solid #e2e8f0;border-radius:12px;padding:16px;margin-bottom:12px">' +
        "<strong>" +
        c.emoji +
        " " +
        c.title +
        "</strong>" +
        '<div style="background:#f1f5f9;border-radius:8px;height:8px;margin:10px 0"><div style="background:#6366f1;height:8px;border-radius:8px;width:' +
        pct +
        '%"></div></div>' +
        "<span>" +
        c.raised +
        " € / " +
        c.goal +
        " € · " +
        c.contributors +
        " contributeurs</span> " +
        '<span style="margin-left:8px"><input type="number" min="5" step="5" value="10" data-amt-for="' +
        c.id +
        '" style="width:64px;padding:4px;border:1px solid #e2e8f0;border-radius:6px" /> €</span> ' +
        '<button type="button" class="btn-contrib" data-id="' +
        c.id +
        '" style="margin-left:4px;padding:6px 12px;background:#6366f1;color:#fff;border:none;border-radius:8px;cursor:pointer">Contribuer</button> ' +
        '<button type="button" class="btn-share" data-id="' +
        c.id +
        '" style="padding:6px 10px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:8px;cursor:pointer">Partager</button></div>';
    });

    html +=
      "<p style='color:#64748b;font-size:.85rem'>Conformité : cagnottes à but non lucratif entre membres vérifiés.</p>";
    if (opts.fullPageLink) {
      html += '<p><a href="' + opts.fullPageLink + '">Page entraide complète →</a></p>';
    }

    mount.innerHTML = html;

    var form = document.getElementById("mutualCreate");
    if (form) {
      form.onsubmit = function (e) {
        e.preventDefault();
        var fd = new FormData(e.target);
        self.createCampaign(fd.get("title"), fd.get("goal"), "🤝");
        self.render(mount, opts);
      };
    }

    mount.querySelectorAll(".btn-contrib").forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute("data-id");
        var inp = mount.querySelector('[data-amt-for="' + id + '"]');
        var amt = inp ? inp.value : 10;
        self.contribute(id, amt);
        self.render(mount, opts);
      };
    });

    mount.querySelectorAll(".btn-share").forEach(function (btn) {
      btn.onclick = function () {
        var url = location.origin + location.pathname.replace(/[^/]+$/, "") + "entraide.html?camp=" + btn.getAttribute("data-id");
        if (navigator.share) {
          navigator.share({ title: "Cagnotte entraide", url: url });
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(url);
          alert("Lien copié");
        }
      };
    });
  },
};
