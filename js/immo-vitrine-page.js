(function () {
  var params = new URLSearchParams(location.search);
  var id = params.get("id");
  var token = params.get("t") || params.get("token");
  var app = document.getElementById("app");

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function embedCard(item) {
    var emb = item.embed;
    if (!emb) return "";
    if (emb.type === "youtube" || emb.type === "vimeo" || emb.type === "matterport" || emb.type === "tiktok") {
      return (
        '<div class="iv-embed-card">' +
        '<p class="iv-embed-label">' +
        esc(item.icon + " " + item.label) +
        "</p>" +
        '<iframe src="' +
        esc(emb.embedUrl) +
        '" title="' +
        esc(item.label) +
        '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking" allowfullscreen loading="lazy"></iframe>' +
        "</div>"
      );
    }
    return (
      '<p><a href="' +
      esc(emb.original || item.url) +
      '" target="_blank" rel="noopener" class="iv-cta iv-cta-outline">' +
      esc(item.icon + " " + item.label) +
      " →</a></p>"
    );
  }

  function render(v) {
    var tpl = document.getElementById("tplVitrine");
    app.innerHTML = "";
    app.appendChild(tpl.content.cloneNode(true));

    document.title = (v.headline || v.title || "Bien") + " | Leads Opportunities Immo";
    var ogT = document.getElementById("ogTitle");
    var ogD = document.getElementById("ogDesc");
    var ogI = document.getElementById("ogImage");
    if (ogT) ogT.content = document.title;
    if (ogD) ogD.content = v.pitch || v.title || "";
    if (ogI && v.cover) ogI.content = v.cover;

    var heroMedia = document.getElementById("heroMedia");
    if (v.cover) {
      heroMedia.innerHTML = '<img src="' + esc(v.cover) + '" alt="" />';
    }

    var hasLive = v.live && v.live.some(function (e) {
      return e.key === "stream_url";
    });
    document.getElementById("liveBadge").hidden = !hasLive;

    document.getElementById("headline").textContent = v.headline || v.title || "Bien";
    document.getElementById("location").textContent = [v.city, v.postal_code].filter(Boolean).join(" ");
    document.getElementById("price").textContent = v.price_label || "";

    var chips = [];
    if (v.surface_m2) chips.push(v.surface_m2 + " m²");
    if (v.rooms) chips.push(v.rooms + " pièces");
    if (v.bedrooms) chips.push(v.bedrooms + " ch.");
    if (v.dpe) chips.push("DPE " + v.dpe);
    document.getElementById("chips").innerHTML = chips
      .map(function (c) {
        return '<span class="iv-chip">' + esc(c) + "</span>";
      })
      .join("");

    document.getElementById("agentName").textContent = (v.agent && v.agent.name) || "Votre négociateur";
    document.getElementById("agentTag").textContent = (v.agent && v.agent.tagline) || "";
    var phone = v.agent && v.agent.phone;
    var phoneEl = document.getElementById("agentPhone");
    if (phone) {
      phoneEl.href = "tel:" + phone.replace(/\s/g, "");
      phoneEl.textContent = "☎ " + phone;
      phoneEl.hidden = false;
    }
    var cta = v.cta_finance || "../landings/acheteur-immo.html#demande";
    document.getElementById("agentCta").href = cta;
    document.getElementById("ctaTop").href = cta;
    document.getElementById("ctaBottom").href = cta;

    if (v.pitch) {
      document.getElementById("pitchBlock").hidden = false;
      document.getElementById("pitch").textContent = v.pitch;
    }

    if (v.videos && v.videos.length) {
      document.getElementById("videoBlock").hidden = false;
      document.getElementById("videoEmbeds").innerHTML = v.videos.map(embedCard).join("");
    }

    if ((v.live && v.live.length) || v.stream_scheduled) {
      document.getElementById("liveBlock").hidden = false;
      if (v.stream_scheduled) {
        document.getElementById("streamWhen").textContent = "Prochain live : " + v.stream_scheduled;
      }
      document.getElementById("liveEmbeds").innerHTML = (v.live || []).map(embedCard).join("");
    }

    if (v.tours && v.tours.length) {
      document.getElementById("tourBlock").hidden = false;
      document.getElementById("tourEmbeds").innerHTML = v.tours.map(embedCard).join("");
    }

    if (v.photos && v.photos.length > 1) {
      document.getElementById("galleryBlock").hidden = false;
      document.getElementById("gallery").innerHTML = v.photos
        .map(function (url, i) {
          return (
            '<img src="' +
            esc(url) +
            '" alt="Photo ' +
            (i + 1) +
            '" loading="lazy" data-full="' +
            esc(url) +
            '" />'
          );
        })
        .join("");
      document.getElementById("gallery").onclick = function (e) {
        var img = e.target.closest("img[data-full]");
        if (!img) return;
        heroMedia.innerHTML = '<img src="' + img.getAttribute("data-full") + '" alt="" />';
        document.getElementById("hero").scrollIntoView({ behavior: "smooth" });
      };
    }
  }

  if (!id || !token) {
    app.innerHTML = '<div class="iv-error"><p>Lien vitrine incomplet.</p></div>';
    return;
  }

  fetch("/api/immo-vitrine?id=" + encodeURIComponent(id) + "&t=" + encodeURIComponent(token))
    .then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) throw new Error(data.error || "Erreur " + r.status);
        return data;
      });
    })
    .then(function (res) {
      render(res.vitrine);
    })
    .catch(function (e) {
      app.innerHTML =
        '<div class="iv-error"><p>Vitrine indisponible.</p><p>' + esc(String(e.message || e)) + "</p></div>";
    });
})();
