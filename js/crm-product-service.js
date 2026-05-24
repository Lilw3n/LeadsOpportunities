/**
 * Catalogue produits assurance — inspire productService.ts multisite.
 */
window.CrmProductService = {
  KEY: "lo_crm_products",

  defaults: function () {
    return [
      {
        id: "prod-vtc",
        name: "Assurance Auto VTC/Taxi",
        category: "assurance-auto",
        type: "premium",
        status: "actif",
        price: 1200,
        commission: 15,
        description: "Assurance automobile VTC et taxi",
        audience: ["VTC", "Taxi"],
      },
      {
        id: "prod-entreprise",
        name: "Pack Assurance Entreprise",
        category: "assurance-entreprise",
        type: "pack",
        status: "actif",
        price: 2500,
        commission: 12,
        description: "RC, multirisque, cyber",
        audience: ["PME", "Startups"],
      },
      {
        id: "prod-sante",
        name: "Assurance Santé Individuelle",
        category: "assurance-sante",
        type: "standard",
        status: "actif",
        price: 800,
        commission: 8,
        description: "Complémentaire santé",
        audience: ["Particuliers", "Familles"],
      },
      {
        id: "prod-rcpro",
        name: "RC Pro",
        category: "assurance-pro",
        type: "standard",
        status: "actif",
        price: 450,
        commission: 10,
        description: "Responsabilité civile professionnelle",
        audience: ["Artisans", "Professions libérales"],
      },
    ];
  },

  all: function () {
    try {
      var list = JSON.parse(localStorage.getItem(this.KEY) || "[]");
      if (!list.length) {
        list = this.defaults();
        this.save(list);
      }
      return list;
    } catch (e) {
      return this.defaults();
    }
  },

  save: function (list) {
    localStorage.setItem(this.KEY, JSON.stringify(list));
  },

  byId: function (id) {
    return this.all().find(function (p) {
      return p.id === id;
    });
  },
};
