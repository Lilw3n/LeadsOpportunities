/**
 * Annonces pub immobilières — canal public (mandats) ou privé (démo vendeur).
 * Utilisable en Node et dans le navigateur.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(
      typeof require === "function" ? require("./immo-public-listings-lib.js") : null
    );
  } else {
    root.ImmoAdListings = factory(root.ImmoPublicListings || null);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (PublicLib) {
  var CHANNELS = {
    public: "public",
    private: "private",
  };

  function parseJson(v, fallback) {
    if (Array.isArray(v) || (v && typeof v === "object" && !Array.isArray(v))) return v;
    if (typeof v !== "string" || !v.trim()) return fallback;
    try {
      return JSON.parse(v);
    } catch (e) {
      return fallback;
    }
  }

  function toNum(v) {
    if (v == null || v === "") return null;
    var n = Number(String(v).replace(/\s/g, "").replace(",", "."));
    return isFinite(n) ? n : null;
  }

  function isSafeHttpUrl(url) {
    if (!url || typeof url !== "string") return false;
    if (/^https:\/\//i.test(url) && url.length <= 2000 && !/@/.test(url)) return true;
    return false;
  }

  function isSafeMediaUrl(url) {
    if (PublicLib && PublicLib.isSafeMediaUrl) return PublicLib.isSafeMediaUrl(url);
    if (/^data:image\/(jpeg|jpg|png|webp);base64,/i.test(url) && url.length <= 280000) return true;
    return isSafeHttpUrl(url);
  }

  function isSafeVideoUrl(url) {
    if (!isSafeHttpUrl(url)) return false;
    return /youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com|cloudinary|drive\.google|dropbox|cdn\.|blob\.|mp4|webm|mov/i.test(
      url
    ) || /^https:\/\//i.test(url);
  }

  function isSafeTourUrl(url) {
    if (!isSafeHttpUrl(url)) return false;
    return /matterport|kuula|thelittlegallery|visite.?virtuelle|3d|tourpano|giraffe360|immovirtualtour|nodalview|ricoh/i.test(
      url
    ) || /^https:\/\//i.test(url);
  }

  function sanitizeUrlList(raw, checker, max) {
    var arr = raw;
    if (typeof raw === "string") {
      arr = raw
        .split(/[\n,]+/)
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
    }
    if (!Array.isArray(arr)) arr = [];
    var out = [];
    arr.forEach(function (item) {
      if (out.length >= (max || 8)) return;
      var url = typeof item === "string" ? item.trim() : item && (item.url || item.src);
      if (!url || !checker(url)) return;
      out.push(url);
    });
    return out;
  }

  function sanitizePhotos(list) {
    if (PublicLib && PublicLib.sanitizeMedia) return PublicLib.sanitizeMedia(list);
    var arr = parseJson(list, list);
    if (!Array.isArray(arr)) arr = [];
    var out = [];
    arr.forEach(function (item) {
      if (out.length >= 12) return;
      var url = typeof item === "string" ? item : item && (item.url || item.src);
      if (!isSafeMediaUrl(url)) return;
      out.push({ url: url, kind: item && item.kind === "capture" ? "capture" : "photo" });
    });
    return out;
  }

  function makeShareToken() {
    var a = Date.now().toString(36);
    var b = Math.random().toString(36).slice(2, 10);
    var c = Math.random().toString(36).slice(2, 8);
    return "ad_" + a + "_" + b + c;
  }

  function getAdMeta(property) {
    var p = property || {};
    var meta = parseJson(p.metadata_json != null ? p.metadata_json : p.metadata, {}) || {};
    var ad = meta.ad && typeof meta.ad === "object" ? meta.ad : {};
    return { meta: meta, ad: ad };
  }

  function channelsOf(ad) {
    var ch = ad && ad.channels;
    if (Array.isArray(ch)) {
      return ch
        .map(function (c) {
          return String(c).toLowerCase();
        })
        .filter(function (c) {
          return c === "public" || c === "private";
        });
    }
    if (ad && ad.publish_public === true) return ["public"];
    if (ad && ad.demo_private === true) return ["private"];
    return [];
  }

  function hasChannel(property, channel) {
    var bag = getAdMeta(property);
    return channelsOf(bag.ad).indexOf(channel) !== -1;
  }

  function isPublicMandateAd(property) {
    var status = String((property && property.status) || "").toLowerCase();
    if (status !== "mandat" && status !== "sous_offre" && status !== "reserve_sru") return false;
    return hasChannel(property, "public");
  }

  function isPrivateDemoAd(property) {
    return hasChannel(property, "private");
  }

  function toAdListing(raw, opts) {
    opts = opts || {};
    var p = raw || {};
    var bag = getAdMeta(p);
    var ad = bag.ad;
    var base =
      PublicLib && PublicLib.toPublicListing
        ? PublicLib.toPublicListing(p)
        : {
            id: String(p.id || ""),
            title: String(p.title || "").trim(),
            property_type: String(p.property_type || "appartement"),
            city: String(p.city || "").trim(),
            postal_code: String(p.postal_code || "").replace(/\D/g, "").slice(0, 5),
            rooms: toNum(p.rooms),
            surface_m2: toNum(p.surface_m2),
            price_fai: toNum(p.price_fai != null ? p.price_fai : p.price),
            description: String(p.description || "").slice(0, 1200),
            photos: sanitizePhotos(p.photos || p.photos_json),
          };

    var headline = String(ad.headline || ad.ad_title || base.title || "").trim().slice(0, 120);
    var body = String(ad.body || ad.ad_description || base.description || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1600);
    var photos = sanitizePhotos(
      ad.photos && ad.photos.length ? ad.photos : p.photos || p.photos_json || base.photos
    );
    var videos = sanitizeUrlList(ad.videos || ad.video_urls, isSafeVideoUrl, 6);
    var tour = String(ad.virtual_tour || ad.visite_virtuelle || "").trim();
    if (tour && !isSafeTourUrl(tour)) tour = "";

    var channels = channelsOf(ad);
    var listing = {
      id: base.id,
      title: headline || base.title,
      headline: headline || base.title,
      property_type: base.property_type,
      type_label: base.type_label || (PublicLib && PublicLib.typeLabel ? PublicLib.typeLabel(base.property_type) : ""),
      city: base.city,
      postal_code: base.postal_code,
      department: base.department || String(base.postal_code || "").slice(0, 2),
      rooms: base.rooms,
      bedrooms: base.bedrooms != null ? base.bedrooms : toNum(p.bedrooms),
      surface_m2: base.surface_m2,
      price_fai: base.price_fai,
      description: body,
      photos: photos,
      cover: PublicLib && PublicLib.coverOf ? PublicLib.coverOf(photos) : photos[0] || null,
      videos: videos,
      virtual_tour: tour,
      channels: channels,
      status: String(p.status || ""),
      share_token: opts.includeToken ? String(ad.share_token || "") : undefined,
      platforms: Array.isArray(ad.platforms) ? ad.platforms.slice(0, 8).map(String) : ["Meta", "Google", "Leboncoin"],
      demo_label: String(ad.demo_label || "Capacité de diffusion").slice(0, 80),
    };

    if (!opts.includeToken) delete listing.share_token;
    return listing;
  }

  function applyAdToProperty(property, form) {
    var p = Object.assign({}, property || {});
    var bag = getAdMeta(p);
    var meta = Object.assign({}, bag.meta);
    var prev = bag.ad || {};
    var channels = [];
    if (form.channel_public) channels.push("public");
    if (form.channel_private) channels.push("private");

    var photos = sanitizePhotos(form.photos);
    var videos = sanitizeUrlList(form.videos || form.video_urls, isSafeVideoUrl, 6);
    var tour = String(form.virtual_tour || form.visite_virtuelle || "").trim();
    if (tour && !isSafeTourUrl(tour)) tour = "";

    var shareToken = prev.share_token || makeShareToken();
    if (form.rotate_token) shareToken = makeShareToken();

    meta.ad = {
      headline: String(form.headline || form.title || "").trim().slice(0, 120),
      body: String(form.body || form.description || "").trim().slice(0, 1600),
      photos: photos,
      videos: videos,
      virtual_tour: tour,
      channels: channels,
      share_token: shareToken,
      platforms: Array.isArray(form.platforms)
        ? form.platforms
        : String(form.platforms || "Meta,Google,Leboncoin")
            .split(/[,;\n]+/)
            .map(function (s) {
              return s.trim();
            })
            .filter(Boolean)
            .slice(0, 8),
      demo_label: String(form.demo_label || "Capacité de diffusion").slice(0, 80),
      updated_at: new Date().toISOString(),
    };

    p.title = String(form.title || form.headline || p.title || "Annonce").trim().slice(0, 120);
    p.description = String(form.description || form.body || p.description || "").trim().slice(0, 4000);
    p.city = String(form.city || p.city || "").trim();
    p.postal_code = String(form.postal_code || p.postal_code || "").replace(/\D/g, "").slice(0, 5);
    p.property_type = String(form.property_type || p.property_type || "appartement");
    p.rooms = toNum(form.rooms);
    p.bedrooms = toNum(form.bedrooms);
    p.surface_m2 = toNum(form.surface_m2);
    p.price_fai = toNum(form.price_fai != null ? form.price_fai : form.price);
    p.price = p.price_fai;
    if (photos.length) p.photos_json = photos;
    if (form.status) p.status = form.status;
    else if (channels.indexOf("public") !== -1 && (!p.status || p.status === "estimation" || p.status === "prospection")) {
      p.status = "mandat";
    }
    p.metadata = meta;
    p.metadata_json = meta;
    p.seo_published = channels.indexOf("public") !== -1;
    return p;
  }

  function findByShareToken(properties, token) {
    var t = String(token || "").trim();
    if (!t || t.length < 8) return null;
    var list = properties || [];
    for (var i = 0; i < list.length; i++) {
      var bag = getAdMeta(list[i]);
      if (String(bag.ad.share_token || "") === t && isPrivateDemoAd(list[i])) return list[i];
    }
    return null;
  }

  function filterPublicAds(properties) {
    return (properties || []).filter(isPublicMandateAd).map(function (p) {
      return toAdListing(p);
    });
  }

  function filterPrivateAds(properties) {
    return (properties || []).filter(isPrivateDemoAd).map(function (p) {
      return toAdListing(p, { includeToken: true });
    });
  }

  function formatPrice(n) {
    if (PublicLib && PublicLib.formatPrice) return PublicLib.formatPrice(n);
    var v = toNum(n);
    if (v == null) return "Prix sur demande";
    return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " €";
  }

  return {
    CHANNELS: CHANNELS,
    makeShareToken: makeShareToken,
    getAdMeta: getAdMeta,
    channelsOf: channelsOf,
    hasChannel: hasChannel,
    isPublicMandateAd: isPublicMandateAd,
    isPrivateDemoAd: isPrivateDemoAd,
    toAdListing: toAdListing,
    applyAdToProperty: applyAdToProperty,
    findByShareToken: findByShareToken,
    filterPublicAds: filterPublicAds,
    filterPrivateAds: filterPrivateAds,
    sanitizePhotos: sanitizePhotos,
    sanitizeUrlList: sanitizeUrlList,
    isSafeVideoUrl: isSafeVideoUrl,
    isSafeTourUrl: isSafeTourUrl,
    formatPrice: formatPrice,
  };
});
