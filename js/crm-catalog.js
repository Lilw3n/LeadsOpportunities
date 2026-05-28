/**
 * Catalogue « Tous nos produits » — style plateforme grossiste
 */
(function () {
  if (!localStorage.getItem("lo_token")) location.href = "./crm.html";

  var catalog = { products: [] };
  var merged = [];

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function fmtPrice(n) {
    return Number(n).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  }

  function priceLabel(p) {
    if (p.pricingMode === "sur_mesure" || p.priceFrom == null) {
      return "<strong>Offre sur-mesure</strong>";
    }
    return "<strong>À partir de " + esc(fmtPrice(p.priceFrom)) + "</strong>";
  }

  function categories(list) {
    var map = {};
    list.forEach(function (p) {
      if (p.category) map[p.category] = p.category;
    });
    return Object.keys(map).sort();
  }

  function mergeProducts(broker, crmVerified) {
    var byKey = {};
    (broker || []).forEach(function (p) {
      byKey[p.id] = Object.assign({ source: "broker" }, p);
    });
    (crmVerified || []).forEach(function (p) {
      if (p.status !== "verified") return;
      var key = p.id || p.name;
      byKey[key] = {
        id: key,
        name: p.name,
        category: p.category || "crm",
        priceFrom: p.price,
        pricingMode: p.price == null ? "sur_mesure" : "from",
        icon: "✓",
        landingUrl: "./crm-quote-new.html?productId=" + encodeURIComponent(p.id),
        need: p.type || "",
        description: p.description || "",
        source: "crm",
      };
    });
    return Object.values(byKey).sort(function (a, b) {
      return a.name.localeCompare(b.name, "fr");
    });
  }

  function render() {
    var q = (document.getElementById("catalogSearch").value || "").toLowerCase();
    var cat = document.getElementById("catalogCategory").value;
    var list = merged.filter(function (p) {
      if (cat && p.category !== cat) return false;
      if (!q) return true;
      var hay = (p.name + " " + (p.category || "") + " " + (p.description || "")).toLowerCase();
      return hay.indexOf(q) >= 0;
    });

    var mount = document.getElementById("catalogList");
    if (!list.length) {
      mount.innerHTML = '<div class="catalog-empty">Aucun produit pour ce filtre.</div>';
      return;
    }

    mount.innerHTML = list
      .map(function (p) {
        var landing = p.landingUrl || "./crm-quote-new.html";
        if (landing.indexOf("/") === 0) landing = "." + landing;
        var quoteUrl =
          "./crm-quote-new.html?product=" +
          encodeURIComponent(p.id) +
          "&need=" +
          encodeURIComponent(p.need || "") +
          "&name=" +
          encodeURIComponent(p.name);
        return (
          '<a class="catalog-row" href="' +
          esc(quoteUrl) +
          '" data-landing="' +
          esc(landing) +
          '">' +
          '<div class="catalog-row-main">' +
          "<h3>" +
          esc(p.name) +
          "</h3>" +
          '<div class="catalog-row-price">' +
          priceLabel(p) +
          '<button type="button" class="catalog-info-btn" title="' +
          esc(p.description || p.category || "Produit assurance") +
          '" onclick="event.preventDefault();event.stopPropagation();alert(this.title)">i</button>' +
          "</div></div>" +
          '<div class="catalog-thumb" aria-hidden="true">' +
          esc(p.icon || "📋") +
          "</div></a>"
        );
      })
      .join("");
  }

  function loadCategoryFilter() {
    var sel = document.getElementById("catalogCategory");
    var cats = categories(merged);
    sel.innerHTML =
      '<option value="">Toutes catégories</option>' +
      cats
        .map(function (c) {
          return '<option value="' + esc(c) + '">' + esc(c) + "</option>";
        })
        .join("");
  }

  function init() {
    Promise.all([
      fetch("/data/crm-catalog-broker.json").then(function (r) {
        return r.json();
      }),
      window.CrmProductService ? window.CrmProductService.list() : Promise.resolve([]),
    ])
      .then(function (res) {
        catalog = res[0] || { products: [] };
        if (catalog.title) {
          document.getElementById("catalogTitle").textContent = catalog.title;
        }
        if (catalog.subtitle) {
          document.getElementById("catalogToplink").textContent = catalog.subtitle;
        }
        merged = mergeProducts(catalog.products, res[1]);
        loadCategoryFilter();
        render();
      })
      .catch(function () {
        document.getElementById("catalogList").innerHTML =
          '<div class="catalog-empty">Erreur chargement catalogue.</div>';
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("catalogSearch").addEventListener("input", render);
    document.getElementById("catalogCategory").addEventListener("change", render);
    document.getElementById("btnEditTariffs").addEventListener("click", function () {
      window.open("./docs/NICHES-TARIFS.md", "_blank");
    });
    document.getElementById("btnEditCatalog").addEventListener("click", function () {
      window.open("./data/crm-catalog-broker.json", "_blank");
    });
    document.getElementById("btnAdminProducts").addEventListener("click", function () {
      location.href = "./crm-products.html";
    });
    init();
  });
})();
