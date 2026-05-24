(function () {
  var deals = [
    { title: "-10 % parrainage mutuelle", desc: "Pour chaque salarié parrainé dans votre entreprise.", until: "31/12/2026", cat: "Santé", save: 10, trend: true, link: "../assurance/produit.html?p=sante-collective" },
    { title: "1 mois RC Pro offert", desc: "Nouveaux clients TPE — sans engagement 12 mois.", until: "30/06/2026", cat: "Assurance", save: 15, trend: true, link: "../assurance/produit.html?p=rc-pro" },
    { title: "Franchise réduite VTC", desc: "Partenaire Zéphir — conditions d'éligibilité.", until: "Permanent", cat: "Assurance", save: 8, trend: false, link: "../devis-wizard.html?type=vtc-taxi" },
    { title: "Formation VTC -20 %", desc: "Pack examen + business avec code COMMUNAUTE.", until: "15/09/2026", cat: "Formation", save: 20, trend: false, link: "../formation/vtc-professionnel.html" },
    { title: "Audit flotte gratuit", desc: "Revue multi-contrats pour 5+ véhicules.", until: "31/08/2026", cat: "Services", save: 25, trend: true, link: "../assurance/produit.html?p=flotte" },
    { title: "Cyber RC Pro bundle", desc: "RC Pro + extension cyber à tarif préférentiel.", until: "31/12/2026", cat: "Assurance", save: 12, trend: false, link: "../assurance/rc-pro.html" },
  ];

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  var cats = [];
  deals.forEach(function (d) {
    if (cats.indexOf(d.cat) < 0) cats.push(d.cat);
  });
  var sel = document.getElementById("dlCat");
  cats.forEach(function (c) {
    var o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    sel.appendChild(o);
  });

  function render() {
    var q = document.getElementById("dlSearch").value.trim().toLowerCase();
    var cat = document.getElementById("dlCat").value;
    var sort = document.getElementById("dlSort").value;
    var list = deals.slice();
    if (cat) list = list.filter(function (d) { return d.cat === cat; });
    if (q) {
      list = list.filter(function (d) {
        return (d.title + " " + d.desc + " " + d.cat).toLowerCase().indexOf(q) >= 0;
      });
    }
    if (sort === "save") list.sort(function (a, b) { return b.save - a.save; });
    else if (sort === "trend") list.sort(function (a, b) { return (b.trend ? 1 : 0) - (a.trend ? 1 : 0); });
    var el = document.getElementById("dlList");
    var empty = document.getElementById("dlEmpty");
    if (!list.length) {
      el.innerHTML = "";
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");
    el.innerHTML = list
      .map(function (d) {
        return (
          '<article class="dl-card"><div class="dl-tags">' +
          '<span class="dl-tag">' +
          esc(d.cat) +
          "</span>" +
          (d.trend ? '<span class="dl-tag dl-tag-hot">🔥 Tendance</span>' : "") +
          '<span class="dl-tag">Économisez ~' +
          d.save +
          '%</span></div><h3>' +
          esc(d.title) +
          "</h3><p>" +
          esc(d.desc) +
          '</p><div class="dl-foot"><span>Jusqu\'au ' +
          esc(d.until) +
          '</span><a href="' +
          esc(d.link) +
          '">En profiter →</a></div></article>'
        );
      })
      .join("");
  }

  var KEY = "lo_social_deals_extra";
  try {
    var extra = JSON.parse(localStorage.getItem(KEY) || "[]");
    extra.forEach(function (d) {
      deals.unshift(d);
    });
  } catch (e) {}

  var shareForm = document.getElementById("dlShare");
  if (shareForm) {
    shareForm.onsubmit = function (e) {
      e.preventDefault();
      var fd = new FormData(e.target);
      var item = {
        title: fd.get("title"),
        desc: fd.get("desc") || "",
        until: "30 jours",
        cat: fd.get("cat"),
        save: 5,
        trend: false,
        link: "../index.html",
      };
      var stored = [];
      try {
        stored = JSON.parse(localStorage.getItem(KEY) || "[]");
      } catch (err) {}
      stored.unshift(item);
      localStorage.setItem(KEY, JSON.stringify(stored.slice(0, 20)));
      deals.unshift(item);
      shareForm.reset();
      render();
    };
  }

  document.getElementById("dlSearch").oninput = render;
  document.getElementById("dlCat").onchange = render;
  document.getElementById("dlSort").onchange = render;
  render();
})();
