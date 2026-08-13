/**
 * Kit média immo — photos, vidéos, visites 3D, live / replays.
 * Style vitrine « présentateur » pour mise en avant des biens.
 */
window.CrmImmoMediaKit = (function () {
  var MEDIA_FIELDS = [
    { id: "lien_video", label: "Vidéo de présentation", icon: "🎬", group: "video" },
    { id: "video_aerienne", label: "Vidéo drone / aérienne", icon: "🚁", group: "video" },
    { id: "pitch_reel", label: "Reel / TikTok / Short", icon: "📱", group: "video" },
    { id: "visite_virtuelle", label: "Visite virtuelle 3D", icon: "🏠", group: "tour" },
    { id: "visite_privee", label: "Visite privée (lien sécurisé)", icon: "🔒", group: "tour" },
    { id: "url_360", label: "Panorama 360°", icon: "🔄", group: "tour" },
    { id: "plan_2d_3d", label: "Plan 2D / 3D", icon: "📐", group: "tour" },
    { id: "url_myphoto", label: "MyPhotoAgency", icon: "📷", group: "tour" },
    { id: "stream_url", label: "Live en cours (YouTube, Facebook…)", icon: "🔴", group: "live" },
    { id: "stream_replay", label: "Replay du live", icon: "▶️", group: "live" },
    { id: "stream_scheduled", label: "Prochain live (date ISO ou texte)", icon: "📅", group: "live" },
  ];

  function uidToken() {
    return (
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 12)
    );
  }

  function ensureVitrine(prop) {
    if (!prop.details) prop.details = {};
    if (!prop.details.vitrine || typeof prop.details.vitrine !== "object") {
      prop.details.vitrine = {};
    }
    var v = prop.details.vitrine;
    if (!v.token) v.token = uidToken();
    if (v.published == null) v.published = false;
    if (!v.headline) v.headline = "";
    if (!v.pitch) v.pitch = "";
    return v;
  }

  function ensureMedias(prop) {
    if (!prop.details) prop.details = {};
    if (!prop.details.medias || typeof prop.details.medias !== "object") {
      prop.details.medias = {};
    }
    return prop.details.medias;
  }

  function getPublicPhotos(prop) {
    return (prop && Array.isArray(prop.images) ? prop.images : []).filter(function (url) {
      if (!url) return false;
      var s = String(url);
      return s.indexOf("data:") !== 0 && s.indexOf("local://") !== 0;
    });
  }

  function getCoverUrl(prop) {
    var photos = getPublicPhotos(prop);
    var v = prop && prop.details && prop.details.vitrine;
    if (v && v.cover_url && photos.indexOf(v.cover_url) >= 0) return v.cover_url;
    return photos[0] || "";
  }

  function parseEmbed(url) {
    if (!url || typeof url !== "string") return null;
    var u = url.trim();
    if (!u) return null;

    var yt =
      u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{6,})/) ||
      u.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{6,})/);
    if (yt) {
      return {
        type: "youtube",
        id: yt[1],
        embedUrl: "https://www.youtube-nocookie.com/embed/" + yt[1] + "?rel=0",
        thumbUrl: "https://img.youtube.com/vi/" + yt[1] + "/hqdefault.jpg",
        original: u,
      };
    }

    var vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeo) {
      return {
        type: "vimeo",
        id: vimeo[1],
        embedUrl: "https://player.vimeo.com/video/" + vimeo[1],
        thumbUrl: "",
        original: u,
      };
    }

    var matterport = u.match(/matterport\.com\/show\/\?m=([a-zA-Z0-9]+)/) || u.match(/my\.matterport\.com\/show\/\?m=([a-zA-Z0-9]+)/);
    if (matterport) {
      return {
        type: "matterport",
        id: matterport[1],
        embedUrl: "https://my.matterport.com/show/?m=" + matterport[1],
        thumbUrl: "",
        original: u,
      };
    }

    var tiktok = u.match(/tiktok\.com\/@[^/]+\/video\/(\d+)/);
    if (tiktok) {
      return {
        type: "tiktok",
        id: tiktok[1],
        embedUrl: "https://www.tiktok.com/embed/v2/" + tiktok[1],
        thumbUrl: "",
        original: u,
      };
    }

    if (/facebook\.com|fb\.watch/i.test(u)) {
      return { type: "facebook", embedUrl: u, thumbUrl: "", original: u };
    }

    if (/instagram\.com\/(p|reel|tv)\//i.test(u)) {
      return { type: "instagram", embedUrl: u, thumbUrl: "", original: u };
    }

    return { type: "link", embedUrl: u, thumbUrl: "", original: u };
  }

  function collectEmbeds(prop) {
    var m = ensureMedias(prop);
    var out = [];
    MEDIA_FIELDS.forEach(function (f) {
      var url = (m[f.id] || "").trim();
      if (!url) return;
      var emb = parseEmbed(url);
      if (!emb) return;
      out.push({
        key: f.id,
        label: f.label,
        icon: f.icon,
        group: f.group,
        url: url,
        embed: emb,
      });
    });
    return out;
  }

  function formatPrice(prop) {
    var n = prop.price_fai != null ? prop.price_fai : prop.price_net;
    if (n == null || !isFinite(Number(n))) return "";
    return Number(n).toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
  }

  function vitrinePath(prop) {
    var v = ensureVitrine(prop);
    if (!v.published || !v.token) return "";
    return (
      "/vitrine/bien.html?id=" +
      encodeURIComponent(prop.id) +
      "&t=" +
      encodeURIComponent(v.token)
    );
  }

  function vitrineUrl(prop) {
    var path = vitrinePath(prop);
    return path ? location.origin + path : "";
  }

  function studioUrl(prop) {
    return "./crm-immo-vitrine-studio.html?id=" + encodeURIComponent(prop.id);
  }

  function toPublicPayload(prop) {
    var v = ensureVitrine(prop);
    var photos = getPublicPhotos(prop);
    var embeds = collectEmbeds(prop).filter(function (e) {
      return e.key !== "visite_privee";
    });
    return {
      id: prop.id,
      title: prop.title,
      headline: v.headline || prop.title,
      pitch: v.pitch || prop.description || "",
      city: prop.city,
      postal_code: prop.postal_code,
      address: v.show_address ? prop.address : null,
      property_type: prop.property_type,
      surface_m2: prop.surface_m2,
      rooms: prop.rooms,
      bedrooms: prop.bedrooms,
      dpe: prop.dpe,
      ges: prop.ges,
      price_label: formatPrice(prop),
      price_fai: prop.price_fai,
      photos: photos,
      cover: getCoverUrl(prop),
      embeds: embeds,
      live: embeds.filter(function (e) {
        return e.group === "live" || e.key === "stream_url";
      }),
      videos: embeds.filter(function (e) {
        return e.group === "video";
      }),
      tours: embeds.filter(function (e) {
        return e.group === "tour";
      }),
      stream_scheduled: ensureMedias(prop).stream_scheduled || "",
      cta_finance:
        "/landings/acheteur-immo.html?propertyId=" +
        encodeURIComponent(prop.id) +
        "&propertyPrice=" +
        encodeURIComponent(prop.price_fai || prop.price_net || "") +
        "#demande",
      agent: {
        name: v.agent_name || "Wendy Buchet",
        tagline: v.agent_tagline || "Votre négociateur immobilier",
        phone: v.agent_phone || "",
        email: v.agent_email || "contact@leadsopportunities.fr",
      },
      published_at: v.published_at || null,
    };
  }

  function renderEmbedHtml(item, opts) {
    opts = opts || {};
    var emb = item.embed;
    if (!emb) return "";
    if (emb.type === "youtube" || emb.type === "vimeo" || emb.type === "matterport" || emb.type === "tiktok") {
      return (
        '<div class="imk-embed-wrap">' +
        (opts.label !== false ? '<p class="imk-embed-label">' + item.icon + " " + item.label + "</p>" : "") +
        '<iframe src="' +
        emb.embedUrl +
        '" title="' +
        item.label +
        '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking" allowfullscreen loading="lazy"></iframe>' +
        "</div>"
      );
    }
    return (
      '<p class="imk-link-row"><a href="' +
      emb.original +
      '" target="_blank" rel="noopener">' +
      item.icon +
      " " +
      item.label +
      " →</a></p>"
    );
  }

  return {
    MEDIA_FIELDS: MEDIA_FIELDS,
    ensureVitrine: ensureVitrine,
    ensureMedias: ensureMedias,
    getPublicPhotos: getPublicPhotos,
    getCoverUrl: getCoverUrl,
    parseEmbed: parseEmbed,
    collectEmbeds: collectEmbeds,
    formatPrice: formatPrice,
    vitrinePath: vitrinePath,
    vitrineUrl: vitrineUrl,
    studioUrl: studioUrl,
    toPublicPayload: toPublicPayload,
    renderEmbedHtml: renderEmbedHtml,
    uidToken: uidToken,
  };
})();
