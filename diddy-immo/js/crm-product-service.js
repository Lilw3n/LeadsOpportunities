/**
 * Catalogue produits assurance interne.
 * Aucune donnee commerciale n'est inventee : le catalogue demarre vide.
 */
window.CrmProductService = {
  KEY: "lo_crm_products",
  LEGACY_IDS: ["prod-vtc", "prod-entreprise", "prod-sante", "prod-rcpro"],

  defaults: function () {
    return [];
  },

  authHeaders: function () {
    return {
      Authorization: "Bearer " + (localStorage.getItem("lo_token") || ""),
      "Content-Type": "application/json",
    };
  },

  removeLegacySeedData: function (list) {
    var legacy = this.LEGACY_IDS;
    return (list || []).filter(function (p) {
      return legacy.indexOf(p.id) === -1;
    });
  },

  allLocal: function () {
    try {
      var list = this.removeLegacySeedData(JSON.parse(localStorage.getItem(this.KEY) || "[]"));
      this.save(list);
      return list;
    } catch (e) {
      return this.defaults();
    }
  },

  save: function (list) {
    localStorage.setItem(this.KEY, JSON.stringify(list));
  },

  byId: function (id) {
    return this.allLocal().find(function (p) {
      return p.id === id;
    });
  },

  list: function () {
    var self = this;
    return fetch("/api/crm/products", { headers: self.authHeaders() })
      .then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok || !data.ok) throw new Error(data.error || "Chargement produits impossible");
          self.save(data.products || []);
          return data.products || [];
        });
      })
      .catch(function () {
        return self.allLocal();
      });
  },

  create: function (payload) {
    return fetch("/api/crm/products", {
      method: "POST",
      headers: this.authHeaders(),
      body: JSON.stringify(payload),
    }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok || !data.ok) throw new Error(data.error || "Creation impossible");
        return data;
      });
    });
  },

  update: function (id, payload) {
    return fetch("/api/crm/products?id=" + encodeURIComponent(id), {
      method: "PATCH",
      headers: this.authHeaders(),
      body: JSON.stringify(payload),
    }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok || !data.ok) throw new Error(data.error || "Modification impossible");
        return data;
      });
    });
  },

  remove: function (id) {
    return fetch("/api/crm/products?id=" + encodeURIComponent(id), {
      method: "DELETE",
      headers: this.authHeaders(),
    }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok || !data.ok) throw new Error(data.error || "Suppression impossible");
        return data;
      });
    });
  },
};
