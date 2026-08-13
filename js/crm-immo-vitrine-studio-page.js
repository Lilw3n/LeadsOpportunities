(function () {
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }
  var params = new URLSearchParams(location.search);
  var id = params.get("id");
  var Store = window.CrmImmoStore;
  var Kit = window.CrmImmoMediaKit;
  var app = document.getElementById("studioApp");

  if (!id || !Store || !Kit) {
    app.innerHTML = "<p class='iv-error'>Bien introuvable.</p>";
    return;
  }

  document.getElementById("backFiche").href = "./crm-immo-property.html?id=" + encodeURIComponent(id);

  var prop = Store.getProperty(id);
  if (!prop) {
    app.innerHTML = "<p class='iv-error'>Chargez d'abord le bien depuis Piges.</p>";
    return;
  }

  var payload = Kit.toPublicPayload(prop);
  var photos = payload.photos || [];
  var hero = payload.cover || photos[0] || "";

  document.getElementById("btnShare").onclick = function () {
    var url = Kit.vitrineUrl(prop);
    if (!url) {
      alert("Publiez la vitrine depuis l'onglet « Vitrine & live » de la fiche bien.");
      return;
    }
    navigator.clipboard.writeText(url).then(function () {
      alert("Lien vitrine copié !");
    });
  };

  document.getElementById("btnFullscreen").onclick = function () {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  var html =
    '<div class="studio-wrap">' +
    '<section class="studio-hero" id="studioHero">' +
    (hero ? '<img id="heroImg" src="' + hero.replace(/"/g, "&quot;") + '" alt="" />' : "") +
    '<div class="studio-hero-overlay">' +
    (payload.live && payload.live.length ? '<p class="iv-live-badge">🔴 LIVE disponible</p>' : "") +
    "<h1>" +
    (payload.headline || payload.title || "Bien") +
    "</h1>" +
    '<p class="iv-location">' +
    [payload.city, payload.postal_code].filter(Boolean).join(" ") +
    "</p>" +
    '<p class="studio-price">' +
    (payload.price_label || "") +
    "</p></div></section>";

  if (photos.length > 1 || (payload.videos && payload.videos.length) || (payload.tours && payload.tours.length)) {
    html += '<nav class="studio-nav">';
    if (photos.length) html += '<button type="button" data-scroll="secPhotos" class="is-active">Photos</button>';
    if (payload.videos && payload.videos.length) html += '<button type="button" data-scroll="secVideos">Vidéos</button>';
    if (payload.live && payload.live.length) html += '<button type="button" data-scroll="secLive">Live</button>';
    if (payload.tours && payload.tours.length) html += '<button type="button" data-scroll="secTours">Visite 3D</button>';
    html += "</nav>";
  }

  if (payload.pitch) {
    html +=
      '<section class="studio-section"><h2>Accroche</h2><p>' +
      String(payload.pitch).replace(/</g, "&lt;") +
      "</p></section>";
  }

  if (photos.length) {
    html +=
      '<section class="studio-section" id="secPhotos"><h2>Galerie (' +
      photos.length +
      ')</h2><div class="studio-carousel">' +
      photos
        .map(function (u) {
          return '<img src="' + u.replace(/"/g, "&quot;") + '" alt="" data-hero="' + u.replace(/"/g, "&quot;") + '" />';
        })
        .join("") +
      "</div></section>";
  }

  if (payload.videos && payload.videos.length) {
    html +=
      '<section class="studio-section" id="secVideos"><h2>Vidéos</h2><div class="iv-embeds">' +
      payload.videos
        .map(function (item) {
          return (
            '<div class="iv-embed-card"><p class="iv-embed-label">' +
            item.icon +
            " " +
            item.label +
            '</p><iframe src="' +
            item.embed.embedUrl +
            '" allowfullscreen loading="lazy"></iframe></div>'
          );
        })
        .join("") +
      "</div></section>";
  }

  if (payload.live && payload.live.length) {
    html +=
      '<section class="studio-section" id="secLive"><h2>Live & replay</h2>' +
      (payload.stream_scheduled ? '<p class="studio-live">📅 ' + payload.stream_scheduled + "</p>" : "") +
      '<div class="iv-embeds">' +
      payload.live
        .map(function (item) {
          if (item.embed.type === "youtube" || item.embed.type === "vimeo") {
            return (
              '<div class="iv-embed-card"><iframe src="' +
              item.embed.embedUrl +
              '" allowfullscreen></iframe></div>'
            );
          }
          return '<p><a class="iv-cta" href="' + item.url + '" target="_blank" rel="noopener">Ouvrir le live →</a></p>';
        })
        .join("") +
      "</div></section>";
  }

  if (payload.tours && payload.tours.length) {
    html +=
      '<section class="studio-section" id="secTours"><h2>Visites & plans</h2><div class="iv-embeds iv-embeds-tall">' +
      payload.tours
        .map(function (item) {
          return (
            '<div class="iv-embed-card"><p class="iv-embed-label">' +
            item.label +
            '</p><iframe src="' +
            item.embed.embedUrl +
            '" allowfullscreen loading="lazy"></iframe></div>'
          );
        })
        .join("") +
      "</div></section>";
  }

  html += "</div>";
  app.innerHTML = html;

  app.querySelectorAll(".studio-carousel img").forEach(function (img) {
    img.onclick = function () {
      var heroImg = document.getElementById("heroImg");
      if (heroImg) heroImg.src = img.getAttribute("data-hero");
      document.getElementById("studioHero").scrollIntoView({ behavior: "smooth" });
    };
  });

  app.querySelectorAll("[data-scroll]").forEach(function (btn) {
    btn.onclick = function () {
      var target = document.getElementById(btn.getAttribute("data-scroll"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
      app.querySelectorAll(".studio-nav button").forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
      });
    };
  });
})();
