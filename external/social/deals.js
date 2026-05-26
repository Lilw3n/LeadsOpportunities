(function () {
  var deals = [
    { title: "Étude parrainage mutuelle", desc: "Conditions à vérifier selon partenaire.", until: "Selon disponibilité", cat: "Santé", save: null, trend: true, link: "../assurance/produit.html?p=sante-collective" },
    { title: "Étude RC Pro", desc: "Proposition éventuelle après étude du dossier.", until: "Selon disponibilité", cat: "Assurance", save: null, trend: true, link: "../assurance/produit.html?p=rc-pro" },
    { title: "Étude franchise VTC", desc: "Conditions d'éligibilité à vérifier auprès du partenaire.", until: "Selon disponibilité", cat: "Assurance", save: null, trend: false, link: "../devis-wizard.html?type=vtc-taxi" },
    { title: "Formation VTC", desc: "Programme et conditions à confirmer.", until: "Selon disponibilité", cat: "Formation", save: null, trend: false, link: "../formation/vtc-professionnel.html" },
    { title: "Étude flotte", desc: "Revue multi-contrats après transmission des éléments.", until: "Selon disponibilité", cat: "Services", save: null, trend: true, link: "../assurance/produit.html?p=flotte" },
    { title: "Étude Cyber / RC Pro", desc: "Options possibles selon activité et partenaire.", until: "Selon disponibilité", cat: "Assurance", save: null, trend: false, link: "../assurance/rc-pro.html" },
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
    if (sort === "save") list.sort(function (a, b) { return Number(b.save || 0) - Number(a.save || 0); });
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
          (d.save ? '<span class="dl-tag">Économie estimée ~' + d.save + "%</span>" : '<span class="dl-tag">Selon éligibilité</span>') +
          '</div><h3>' +
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
