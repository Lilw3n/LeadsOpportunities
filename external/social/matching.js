(function () {
  var KEY = "lo_matching_likes_v1";

  var pool = [
    { id: "m1", name: "Karim V.", role: "Chauffeur VTC", need: "Assurance flotte 3 véhicules", score: 92, rating: 4.8, tags: ["VTC", "Paris", "IDF"], premium: false, href: "profile.html?id=karim" },
    { id: "m2", name: "Sophie M.", role: "Courtier santé", need: "Apporteur clients TNS", score: 87, rating: 4.9, tags: ["Courtier", "Santé", "IDF"], premium: true, href: "profile.html?id=sophie" },
    { id: "m3", name: "Thomas L.", role: "Gérant TPE tech", need: "RC Pro + cyber", score: 84, rating: 4.6, tags: ["RC Pro", "Tech", "Lyon"], premium: false, href: "profile.html?id=thomas" },
    { id: "m4", name: "Amina B.", role: "VTC premium", need: "Remplaçant week-end", score: 91, rating: 4.7, tags: ["VTC", "Urgent"], premium: true, href: "profile.html?id=amina" },
    { id: "m5", name: "Marc D.", role: "Expert-comptable VTC", need: "Partenariat long terme", score: 79, rating: 4.5, tags: ["VTC", "Compta"], premium: false, href: "profile.html?id=marc" },
    { id: "m6", name: "Julie R.", role: "Agent immobilier pro", need: "PNO + GLI pack", score: 88, rating: 4.8, tags: ["Immobilier", "Assurance"], premium: false, href: "profile.html?id=julie" },
  ];

  var deck = [];
  var idx = 0;

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function filterPool() {
    var spec = document.getElementById("mtSpec").value;
    var sort = document.getElementById("mtSort").value;
    var list = pool.slice();
    if (spec) list = list.filter(function (p) { return p.tags.indexOf(spec) >= 0; });
    if (sort === "rating") list.sort(function (a, b) { return b.rating - a.rating; });
    else if (sort === "recent") list.reverse();
    else list.sort(function (a, b) { return b.score - a.score; });
    return list;
  }

  function rebuild() {
    deck = filterPool();
    idx = 0;
    paint();
  }

  function paint() {
    var el = document.getElementById("mtDeck");
    var actions = document.getElementById("mtActions");
    if (idx >= deck.length) {
      el.innerHTML = '<div class="mt-empty"><p>Plus de profils pour le moment !</p><p>Rechargez ou modifiez les filtres.</p></div>';
      actions.style.display = "none";
      return;
    }
    actions.style.display = "flex";
    var p = deck[idx];
    el.innerHTML =
      '<article class="mt-card">' +
      (p.premium ? '<span class="mt-premium">⭐ Premium</span>' : "") +
      '<span class="mt-score">' +
      p.score +
      "% match</span>" +
      "<h2>" +
      esc(p.name) +
      "</h2>" +
      "<p><strong>" +
      esc(p.role) +
      "</strong><br>Besoin : " +
      esc(p.need) +
      "</p>" +
      '<div class="mt-tags">' +
      p.tags.map(function (t) { return '<span class="mt-tag">' + esc(t) + "</span>"; }).join("") +
      '<span class="mt-tag">⭐ ' +
      p.rating +
      "</span></div></article>";
  }

  function saveLike(p, superLike) {
    try {
      var likes = JSON.parse(localStorage.getItem(KEY) || "[]");
      likes.unshift({ id: p.id, name: p.name, super: !!superLike, at: new Date().toISOString() });
      localStorage.setItem(KEY, JSON.stringify(likes.slice(0, 50)));
    } catch (e) {}
  }

  function showMatch(p) {
    document.getElementById("matchText").textContent = "Vous et " + p.name + " pouvez échanger — connectez-vous pour contacter.";
    document.getElementById("matchContact").href = p.href;
    document.getElementById("matchPopup").classList.add("open");
  }

  function advance(liked, superLike) {
    if (idx >= deck.length) return;
    var p = deck[idx];
    if (liked) {
      saveLike(p, superLike);
      if (p.score >= 85 || superLike) showMatch(p);
    }
    idx += 1;
    paint();
    paintLikes();
  }

  document.getElementById("btnPass").onclick = function () { advance(false); };
  document.getElementById("btnLike").onclick = function () { advance(true, false); };
  document.getElementById("btnSuper").onclick = function () { advance(true, true); };
  document.getElementById("mtReload").onclick = rebuild;
  document.getElementById("mtSpec").onchange = rebuild;
  document.getElementById("mtSort").onchange = rebuild;
  document.getElementById("matchClose").onclick = function () {
    document.getElementById("matchPopup").classList.remove("open");
  };
  document.getElementById("matchPopup").onclick = function (e) {
    if (e.target.id === "matchPopup") document.getElementById("matchPopup").classList.remove("open");
  };

  function paintLikes() {
    var el = document.getElementById("mtLikes");
    if (!el) return;
    var likes = [];
    try {
      likes = JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch (e) {}
    if (!likes.length) {
      el.innerHTML = "<p style='font-size:.85rem;color:#64748b'>Aucun like pour le moment.</p>";
      return;
    }
    el.innerHTML =
      "<ul style='margin:0;padding-left:18px;font-size:.88rem'>" +
      likes
        .slice(0, 8)
        .map(function (l) {
          return "<li>" + esc(l.name) + (l.super ? " ⭐" : "") + "</li>";
        })
        .join("") +
      "</ul>";
  }

  document.onkeydown = function (e) {
    if (e.key === "ArrowLeft") document.getElementById("btnPass").click();
    if (e.key === "ArrowRight") document.getElementById("btnLike").click();
    if (e.key === "ArrowUp") document.getElementById("btnSuper").click();
  };

  rebuild();
  paintLikes();
})();
