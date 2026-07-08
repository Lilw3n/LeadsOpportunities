/**
 * Suggestions IA légères — inspire dashboard/ai-suggestions multisite
 */
window.CrmAiSuggestions = {
  render: function (items) {
    if (!items || !items.length) {
      return '<p class="alerts-empty">Aucune suggestion pour le moment.</p>';
    }
    return (
      '<ul class="alerts-list">' +
      items
        .map(function (s) {
          return (
            '<li class="alert-item alert-' +
            (s.priority || "medium") +
            '"><a href="' +
            (s.href || "#") +
            '"><strong>' +
            s.title +
            "</strong><span>" +
            s.message +
            "</span></a></li>"
          );
        })
        .join("") +
      "</ul>"
    );
  },

  safeJson: function (r) {
    return r.json().catch(function () {
      return { ok: false, error: "Réponse invalide" };
    });
  },

  safeFetch: function (url, headers) {
    return fetch(url, { headers: headers })
      .then(window.CrmAiSuggestions.safeJson)
      .catch(function () {
        return { ok: false, error: "Réseau" };
      });
  },

  load: function (token, esc) {
    var headers = token ? { Authorization: "Bearer " + token } : {};
    var safeFetch = window.CrmAiSuggestions.safeFetch;
    return Promise.all([
      safeFetch("/api/crm/alerts", headers),
      safeFetch("/api/crm/insurance-hub", headers),
      safeFetch("/api/crm/periods", headers),
    ]).then(function (results) {
      var alerts = (results[0].ok && results[0].alerts) || [];
      var ins = (results[1].ok && results[1].stats) || {};
      var periods = (results[2].ok && results[2].expiring) || [];
      var items = [];

      if (ins.pendingClaims > 0) {
        items.push({
          title: "Sinistres en cours",
          message: ins.pendingClaims + " sinistre(s) à traiter — ouvrir le module sinistres",
          href: "./crm-claims.html",
          priority: "high",
        });
      }
      if (ins.expiringThisMonth > 0) {
        items.push({
          title: "Renouvellements imminents",
          message: ins.expiringThisMonth + " contrat(s) expirent sous 30 jours",
          href: "./crm-periods.html",
          priority: "high",
        });
      }
      periods.slice(0, 3).forEach(function (e) {
        items.push({
          title: "Échéance " + (e.policyNumber || e.insurer || "contrat"),
          message: "Fin le " + new Date(e.endDate).toLocaleDateString("fr-FR") + " — " + e.contactName,
          href: "./crm-contact.html?id=" + encodeURIComponent(e.contactId),
          priority: "medium",
        });
      });
      alerts.slice(0, 3).forEach(function (a) {
        items.push({
          title: a.title,
          message: a.message,
          href: a.contactId ? "./crm-contact.html?id=" + encodeURIComponent(a.contactId) : "#",
          priority: a.priority || "medium",
        });
      });
      if (!items.length) {
        items.push({
          title: "Portefeuille à jour",
          message: "Aucune action urgente — analysez un document ou consultez les devis",
          href: "./crm-ai-suggestions.html",
          priority: "low",
        });
      }
      return window.CrmAiSuggestions.render(items);
    });
  },
};
