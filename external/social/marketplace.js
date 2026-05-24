(function () {
  var CART_KEY = "lo_marketplace_cart_v1";
  var WISH_KEY = "lo_marketplace_wish_v1";

  var products = [
    { id: "p1", title: "Formation VTC certifiante", cat: "Formation", price: 299, priceLabel: "299 €", rating: 4.9, sales: 842, tags: ["bestseller"], desc: "Parcours complet examen + business.", href: "../formation/vtc-professionnel.html" },
    { id: "p2", title: "Expertise sinistre express", cat: "Services", price: 150, priceLabel: "150 €", rating: 4.7, sales: 312, tags: ["sale"], desc: "Analyse dossier sous 48h.", href: "../claim-declare.html" },
    { id: "p3", title: "Comptabilité VTC annuelle", cat: "Services", price: 0, priceLabel: "Sur devis", rating: 4.8, sales: 156, tags: [], desc: "Tenue + liasse fiscale VTC.", href: "../devis-wizard.html?type=rc-pro" },
    { id: "p4", title: "Audit contrat flotte", cat: "Assurance", price: 199, priceLabel: "199 €", rating: 4.6, sales: 98, tags: ["new"], desc: "Revue multi-contrats entreprise.", href: "../assurance/produit.html?p=flotte" },
    { id: "p5", title: "Coaching bonus-malus", cat: "Formation", price: 89, priceLabel: "89 €", rating: 4.5, sales: 421, tags: [], desc: "Session live 1h avec expert.", href: "live.html" },
    { id: "p6", title: "Assurance VTC Premium", cat: "Assurance", price: 0, priceLabel: "Devis", rating: 4.9, sales: 1200, tags: ["bestseller", "sponsored"], desc: "Économisez jusqu'à 40% — comparatif courtiers.", href: "../assurance/vtc.html" },
    { id: "p7", title: "Entretien véhicule VTC à domicile", cat: "Services", price: 79, priceLabel: "79 €", rating: 4.4, sales: 67, tags: ["new"], desc: "Livraison gratuite zone urbaine.", href: "../devis-wizard.html" },
    { id: "p8", title: "Pack RC Pro + décennale", cat: "Assurance", price: 0, priceLabel: "Devis", rating: 4.7, sales: 203, tags: [], desc: "Bundle artisans BTP.", href: "../assurance/rc-pro.html" },
  ];

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function saveCart(c) {
    localStorage.setItem(CART_KEY, JSON.stringify(c));
    paintCartBadge();
  }

  function paintCartBadge() {
    var n = loadCart().length;
    var badge = document.getElementById("cartCount");
    badge.textContent = String(n);
    badge.classList.toggle("hidden", n === 0);
  }

  function tagHtml(tags) {
    return (tags || [])
      .map(function (t) {
        if (t === "bestseller") return '<span class="mp-tag mp-tag-hot">Bestseller</span>';
        if (t === "new") return '<span class="mp-tag mp-tag-new">Nouveau</span>';
        if (t === "sale") return '<span class="mp-tag mp-tag-sale">Vente Flash</span>';
        if (t === "sponsored") return '<span class="mp-tag mp-tag-hot">Sponsorisé</span>';
        return "";
      })
      .join("");
  }

  function loadWish() {
    try {
      return JSON.parse(localStorage.getItem(WISH_KEY) || "[]");
    } catch (e) {
      return [];
    }
  }

  function toggleWish(id) {
    var w = loadWish();
    var i = w.indexOf(id);
    if (i >= 0) w.splice(i, 1);
    else w.push(id);
    localStorage.setItem(WISH_KEY, JSON.stringify(w));
    renderGrid();
  }

  function filterSort(list, q, cat, sort) {
    var out = list.slice();
    if (cat) out = out.filter(function (p) { return p.cat === cat; });
    var sponsoredOnly = document.getElementById("mpSponsored") && document.getElementById("mpSponsored").checked;
    if (sponsoredOnly) out = out.filter(function (p) { return (p.tags || []).indexOf("sponsored") >= 0; });
    var wishOnly = document.getElementById("mpWishlistOnly") && document.getElementById("mpWishlistOnly").checked;
    if (wishOnly) {
      var w = loadWish();
      out = out.filter(function (p) { return w.indexOf(p.id) >= 0; });
    }
    var maxP = document.getElementById("mpMaxPrice") && Number(document.getElementById("mpMaxPrice").value);
    if (maxP > 0) out = out.filter(function (p) { return p.price === 0 || p.price <= maxP; });
    if (q) {
      var nq = q.toLowerCase();
      out = out.filter(function (p) {
        return (p.title + " " + p.desc + " " + p.cat).toLowerCase().indexOf(nq) >= 0;
      });
    }
    if (sort === "price-asc") out.sort(function (a, b) { return a.price - b.price; });
    else if (sort === "price-desc") out.sort(function (a, b) { return b.price - a.price; });
    else if (sort === "rating") out.sort(function (a, b) { return b.rating - a.rating; });
    else if (sort === "new") out.sort(function (a, b) { return (b.tags.indexOf("new") >= 0) - (a.tags.indexOf("new") >= 0); });
    else if (sort === "sales") out.sort(function (a, b) { return b.sales - a.sales; });
    return out;
  }

  function renderGrid() {
    var q = document.getElementById("mpSearch").value.trim();
    var cat = document.getElementById("mpCategory").value;
    var sort = document.getElementById("mpSort").value;
    var hits = filterSort(products, q, cat, sort);
    var grid = document.getElementById("mpGrid");
    var empty = document.getElementById("mpEmpty");
    if (!hits.length) {
      grid.innerHTML = "";
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");
    var wish = loadWish();
    grid.innerHTML = hits
      .map(function (p) {
        var inWish = wish.indexOf(p.id) >= 0;
        return (
          '<article class="mp-card" data-id="' +
          esc(p.id) +
          '"><div class="mp-tags">' +
          tagHtml(p.tags) +
          '<span class="mp-tag mp-tag-new" style="background:#f1f5f9;color:#64748b">' +
          esc(p.cat) +
          '</span></div><h3>' +
          esc(p.title) +
          "</h3><p>" +
          esc(p.desc) +
          '</p><div class="mp-price">' +
          esc(p.priceLabel) +
          (p.rating ? ' · ⭐ ' + p.rating : "") +
          (p.sales ? " · " + p.sales + " ventes" : "") +
          '</div><button type="button" class="btn-add" data-id="' +
          esc(p.id) +
          '">Ajouter au panier</button><button type="button" class="btn-wish secondary" data-id="' +
          esc(p.id) +
          '">' +
          (inWish ? "♥ Liste" : "♡ Liste") +
          '</button><a href="' +
          esc(p.href) +
          '" style="display:block;text-align:center;margin-top:8px;font-size:.85rem;color:#6366f1;font-weight:600">Voir la boutique</a></article>'
        );
      })
      .join("");
    grid.querySelectorAll(".btn-add").forEach(function (btn) {
      btn.onclick = function () {
        addToCart(btn.getAttribute("data-id"));
      };
    });
    grid.querySelectorAll(".btn-wish").forEach(function (btn) {
      btn.onclick = function () {
        toggleWish(btn.getAttribute("data-id"));
      };
    });
  }

  function addToCart(id) {
    var p = products.find(function (x) { return x.id === id; });
    if (!p) return;
    var cart = loadCart();
    if (!cart.some(function (c) { return c.id === id; })) {
      cart.push({ id: p.id, title: p.title, priceLabel: p.priceLabel, price: p.price });
      saveCart(cart);
    }
    document.getElementById("cartPanel").classList.add("open");
    paintCartPanel();
  }

  function paintCartPanel() {
    var cart = loadCart();
    var body = document.getElementById("cartBody");
    if (!cart.length) {
      body.innerHTML = "<p style='color:#64748b'>Votre panier est vide. Découvrez nos produits et ajoutez-les à votre panier.</p>";
      document.getElementById("cartTotal").textContent = "";
      return;
    }
    body.innerHTML = cart
      .map(function (c) {
        return (
          '<div class="mp-cart-item"><div><strong>' +
          esc(c.title) +
          "</strong><br>" +
          esc(c.priceLabel) +
          '</div><button type="button" data-rm="' +
          esc(c.id) +
          '">Supprimer</button></div>'
        );
      })
      .join("");
    body.querySelectorAll("[data-rm]").forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.getAttribute("data-rm");
        saveCart(loadCart().filter(function (c) { return c.id !== id; }));
        paintCartPanel();
      };
    });
    var total = cart.reduce(function (s, c) { return s + (c.price || 0); }, 0);
    var promo = document.getElementById("mpPromo") && document.getElementById("mpPromo").value.trim().toUpperCase();
    if (promo === "COMMUNAUTE" && total > 0) total = Math.round(total * 0.9);
    document.getElementById("cartTotal").textContent =
      total > 0
        ? "Total indicatif : " + total.toLocaleString("fr-FR") + " €" + (promo === "COMMUNAUTE" ? " (-10 % COMMUNAUTE)" : "")
        : "Certains articles nécessitent un devis.";
  }

  var cats = [];
  products.forEach(function (p) {
    if (cats.indexOf(p.cat) < 0) cats.push(p.cat);
  });
  var sel = document.getElementById("mpCategory");
  cats.forEach(function (c) {
    var o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    sel.appendChild(o);
  });

  document.getElementById("mpSearch").oninput = renderGrid;
  document.getElementById("mpCategory").onchange = renderGrid;
  document.getElementById("mpSort").onchange = renderGrid;
  var mpPromo = document.getElementById("mpPromo");
  if (mpPromo) mpPromo.oninput = paintCartPanel;
  ["mpSponsored", "mpWishlistOnly"].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.onchange = renderGrid;
  });
  var mpMax = document.getElementById("mpMaxPrice");
  if (mpMax) mpMax.oninput = renderGrid;
  document.getElementById("btnCart").onclick = function () {
    document.getElementById("cartPanel").classList.add("open");
    paintCartPanel();
  };
  document.getElementById("cartClose").onclick = function () {
    document.getElementById("cartPanel").classList.remove("open");
  };
  document.getElementById("cartContinue").onclick = function () {
    document.getElementById("cartPanel").classList.remove("open");
  };
  document.getElementById("cartPanel").onclick = function (e) {
    if (e.target === document.getElementById("cartPanel")) document.getElementById("cartPanel").classList.remove("open");
  };
  document.getElementById("cartCheckout").onclick = function () {
    var cart = loadCart();
    if (!cart.length) return;
    try {
      sessionStorage.setItem("lo_marketplace_checkout", JSON.stringify(cart));
    } catch (e) {}
    location.href = "../devis-wizard.html?source=marketplace";
  };

  paintCartBadge();
  renderGrid();
})();
