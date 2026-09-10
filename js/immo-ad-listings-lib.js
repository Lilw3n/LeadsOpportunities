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

  function tourLib() {
    if (typeof require === "function") {
      try {
        return require("./immo-tour-access-lib.js");
      } catch (e) {
        return null;
      }
    }
    return typeof globalThis !== "undefined" ? globalThis.ImmoTourAccess : null;
  }

  function parseAccessEmails(form) {
    var Access =
      (typeof require === "function"
        ? (function () {
            try {
              return require("./immo-ad-demo-access-lib.js");
            } catch (e) {
              return null;
            }
          })()
        : null) ||
      (typeof globalThis !== "undefined" ? globalThis.ImmoAdDemoAccess : null);
    if (Access && Access.parseContactList) {
      return Access.parseContactList(form.access_emails != null ? form.access_emails : form.emails, "email");
    }
    var raw = form.access_emails != null ? form.access_emails : form.emails;
    if (typeof raw === "string") raw = raw.split(/[\n,;]+/);
    if (!Array.isArray(raw)) return [];
    return raw
      .map(function (e) {
        return String(e || "")
          .trim()
          .toLowerCase();
      })
      .filter(function (e) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
      })
      .slice(0, 12);
  }

  function parseAccessPhones(form) {
    var Access =
      (typeof require === "function"
        ? (function () {
            try {
              return require("./immo-ad-demo-access-lib.js");
            } catch (e) {
              return null;
            }
          })()
        : null) ||
      (typeof globalThis !== "undefined" ? globalThis.ImmoAdDemoAccess : null);
    if (Access && Access.parseContactList) {
      return Access.parseContactList(form.access_phones != null ? form.access_phones : form.phones, "phone");
    }
    return [];
  }

  function getAdMeta(property) {
    var p = property || {};
    var meta = parseJson(p.metadata_json != null ? p.metadata_json : p.metadata, {}) || {};
    var ad = meta.ad && typeof meta.ad === "object" ? meta.ad : {};
    return { meta: meta, ad: ad };
  }

  /** Extrait critères annonce depuis un dossier vente (questionnaire / fiche interlocuteur). */
  function sellDossierToCriteria(sellDossier) {
    var sd = sellDossier && typeof sellDossier === "object" ? sellDossier : {};
    var equip = sd.sellEquip || sd["sellEquip[]"] || [];
    if (typeof equip === "string") {
      equip = equip
        .split(/[,;]+/)
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
    }
    if (!Array.isArray(equip)) equip = [];
    var equipSet = {};
    equip.forEach(function (e) {
      equipSet[String(e).toLowerCase()] = true;
    });

    function countTruthy(v) {
      if (v === true || v === "1" || v === "oui" || v === "Oui") return true;
      var n = toNum(v);
      return n != null && n > 0;
    }

    var out = {
      rooms: toNum(sd.sellRooms != null ? sd.sellRooms : sd.rooms),
      bedrooms: toNum(sd.sellBedrooms != null ? sd.sellBedrooms : sd.bedrooms),
      surface_m2: toNum(sd.sellSurface != null ? sd.sellSurface : sd.surface_m2),
      floor: String(sd.sellFloor != null ? sd.sellFloor : sd.floor || "").trim(),
      dpe: String(sd.sellDpe != null ? sd.sellDpe : sd.dpe || "")
        .trim()
        .toUpperCase()
        .slice(0, 1),
      ges: String(sd.sellGes != null ? sd.sellGes : sd.ges || "")
        .trim()
        .toUpperCase()
        .slice(0, 1),
      heating: String(
        sd.sellHeating ||
          [sd.sellHeatingEnergy, sd.sellHeating].filter(Boolean).join(" ") ||
          sd.heating ||
          ""
      ).trim(),
      energy_cost: toNum(
        sd.sellEnergyCostAnnual != null ? sd.sellEnergyCostAnnual : sd.energy_cost
      ),
      charges: toNum(sd.sellChargesAnnual != null ? sd.sellChargesAnnual : sd.charges),
      year_built: toNum(sd.sellBuildYear != null ? sd.sellBuildYear : sd.year_built),
      furnished:
        sd.sellFurnished === true ||
        sd.sellFurnished === "1" ||
        sd.sellFurnished === "oui" ||
        sd.furnished === true
          ? true
          : sd.sellFurnished === false || sd.sellFurnished === "0" || sd.furnished === false
            ? false
            : null,
      has_elevator: equipSet.ascenseur ? true : null,
      has_cave: countTruthy(sd.sellCaveCount) ? true : null,
      has_garage: countTruthy(sd.sellGarageCount) || countTruthy(sd.sellBoxCount) ? true : null,
      has_parking:
        countTruthy(sd.sellParkingExt) || countTruthy(sd.sellParkingInt) ? true : null,
      has_balcony: null,
      has_terrace: null,
      has_garden: null,
      city: String(sd.sellCity || sd.city || "").trim(),
      postal_code: String(sd.sellPostalCode || sd.postal_code || "")
        .replace(/\D/g, "")
        .slice(0, 5),
      property_type: String(sd.sellPropertyType || sd.property_type || "").trim(),
      videos: sanitizeUrlList(sd.sellVideos || sd.sellVideoUrl || sd.videos, isSafeVideoUrl, 6),
      virtual_tour: String(sd.sellVirtualTour || sd.virtual_tour || "").trim(),
    };
    if (out.virtual_tour && !isSafeTourUrl(out.virtual_tour)) out.virtual_tour = "";
    return out;
  }

  function getSellDossier(property) {
    var bag = getAdMeta(property);
    var meta = bag.meta || {};
    if (meta.sellDossier && typeof meta.sellDossier === "object") return meta.sellDossier;
    if (property && property.sellDossier && typeof property.sellDossier === "object") {
      return property.sellDossier;
    }
    return {};
  }

  function coalesceEmpty(primary, fallback) {
    if (primary != null && primary !== "") return primary;
    if (fallback != null && fallback !== "") return fallback;
    return primary != null ? primary : fallback;
  }

  function coalesceBool(primary, fallback) {
    if (primary === true || primary === false) return primary;
    if (fallback === true || fallback === false) return fallback;
    return null;
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

  /** Visibilité publique = case CRM cochée (choix conseiller), indépendamment du statut mandat. */
  function isPublicMandateAd(property) {
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
    var criteria = ad.criteria && typeof ad.criteria === "object" ? ad.criteria : {};
    var fromSell = sellDossierToCriteria(getSellDossier(p));
    function pickCrit(key, fallback) {
      if (criteria[key] != null && criteria[key] !== "") return criteria[key];
      if (fallback != null && fallback !== "") return fallback;
      if (fromSell[key] != null && fromSell[key] !== "") return fromSell[key];
      return fallback;
    }
    function pickBool(key, raw) {
      if (Object.prototype.hasOwnProperty.call(criteria, key)) return !!criteria[key];
      if (fromSell[key] === true || fromSell[key] === false) return fromSell[key];
      if (raw === true) return true;
      if (raw === false) return false;
      return null;
    }
    var sellVideos = fromSell.videos || [];
    if ((!videos || !videos.length) && sellVideos.length) videos = sellVideos;
    if (!tour && fromSell.virtual_tour) tour = fromSell.virtual_tour;

    var listing = {
      id: base.id,
      title: headline || base.title,
      headline: headline || base.title,
      property_type: coalesceEmpty(base.property_type, fromSell.property_type) || base.property_type,
      type_label:
        base.type_label ||
        (PublicLib && PublicLib.typeLabel
          ? PublicLib.typeLabel(coalesceEmpty(base.property_type, fromSell.property_type) || base.property_type)
          : ""),
      city: coalesceEmpty(base.city, fromSell.city) || "",
      postal_code: coalesceEmpty(base.postal_code, fromSell.postal_code) || "",
      department:
        base.department ||
        String(coalesceEmpty(base.postal_code, fromSell.postal_code) || "").slice(0, 2),
      rooms: coalesceEmpty(base.rooms, fromSell.rooms),
      bedrooms: coalesceEmpty(
        base.bedrooms != null ? base.bedrooms : toNum(p.bedrooms),
        fromSell.bedrooms
      ),
      surface_m2: coalesceEmpty(base.surface_m2, fromSell.surface_m2),
      floor: String(pickCrit("floor", base.floor != null ? base.floor : p.floor || "") || "").trim(),
      has_elevator: pickBool("has_elevator", base.has_elevator),
      has_garage: pickBool("has_garage", base.has_garage),
      has_parking: pickBool("has_parking", base.has_parking),
      has_cave: pickBool("has_cave", base.has_cave),
      has_garden: pickBool("has_garden", base.has_garden),
      has_terrace: pickBool("has_terrace", base.has_terrace),
      has_balcony: pickBool("has_balcony", base.has_balcony),
      dpe: String(pickCrit("dpe", base.dpe || p.dpe || "") || "")
        .trim()
        .toUpperCase()
        .slice(0, 1),
      ges: String(pickCrit("ges", base.ges || p.ges || "") || "")
        .trim()
        .toUpperCase()
        .slice(0, 1),
      energy_cost: pickCrit("energy_cost", p.energy_cost || ""),
      charges: pickCrit("charges", p.charges || ""),
      heating: String(pickCrit("heating", p.heating || "") || "").trim(),
      furnished: coalesceBool(
        Object.prototype.hasOwnProperty.call(criteria, "furnished")
          ? !!criteria.furnished
          : p.furnished === true
            ? true
            : p.furnished === false
              ? false
              : null,
        fromSell.furnished
      ),
      year_built: pickCrit("year_built", p.year_built || ""),
      price_fai: base.price_fai,
      description: body,
      photos: photos,
      cover: PublicLib && PublicLib.coverOf ? PublicLib.coverOf(photos) : photos[0] || null,
      videos: videos,
      virtual_tour: tour,
      has_virtual_tour: !!tour,
      channels: channels,
      status: String(p.status || ""),
      share_token: opts.includeToken ? String(ad.share_token || "") : undefined,
      platforms: Array.isArray(ad.platforms) ? ad.platforms.slice(0, 8).map(String) : ["Meta", "Google", "Leboncoin"],
      demo_label: String(ad.demo_label || "Capacité de diffusion").slice(0, 80),
      listing_url: String(ad.listing_url || p.listing_url || "").trim(),
      _criteria_saved: !!(ad.criteria && typeof ad.criteria === "object" && Object.keys(ad.criteria).length),
      _from_sell_dossier: !!(fromSell.rooms != null || fromSell.floor || fromSell.dpe || fromSell.heating),
    };

    var Tour = tourLib();
    var tourLinks = Tour && Tour.listTourLinks ? Tour.listTourLinks(ad) : ad.tour_access ? [ad.tour_access] : [];
    var shown = null;
    var anyToken = false;
    tourLinks.forEach(function (l) {
      if (l && l.token) anyToken = true;
      if (!shown && Tour && Tour.listedHref && Tour.listedHref(l)) shown = l;
      else if (!shown && l && l.token && l.enabled && l.availability !== "paused" && l.visibility !== "unlisted") shown = l;
    });
    listing.tour_gate = !!(shown && shown.token);
    listing.tour_href = shown
      ? Tour && Tour.publicTourPath
        ? Tour.publicTourPath(shown.token, "site")
        : "/immobilier/visite.html?t=" + encodeURIComponent(shown.token)
      : "";
    listing.tour_name = shown && shown.name ? shown.name : "";
    if (anyToken && !opts.includeTourUrl) {
      listing.virtual_tour = "";
    }
    if (!opts.includeToken) delete listing.share_token;
    return listing;
  }

  function applyAdToProperty(property, form) {
    var p = Object.assign({}, property || {});
    var bag = getAdMeta(p);
    var meta = Object.assign({}, bag.meta);
    var prev = bag.ad || {};
    if (form.status) p.status = String(form.status).trim();

    var channels = [];
    if (form.channel_public) channels.push("public");
    if (form.channel_private) channels.push("private");

    var photos = sanitizePhotos(form.photos);
    var videos = sanitizeUrlList(form.videos || form.video_urls, isSafeVideoUrl, 6);
    var tour = String(form.virtual_tour || form.visite_virtuelle || "").trim();
    if (tour && !isSafeTourUrl(tour)) tour = "";

    var shareToken = prev.share_token || makeShareToken();
    if (form.rotate_token) shareToken = makeShareToken();

    var Tour = tourLib();
    var tourPack = Tour && Tour.applyTourLinks
      ? Tour.applyTourLinks(prev, form)
      : {
          primary: Tour && Tour.normalizeTourAccess
            ? Tour.normalizeTourAccess(prev.tour_access, form)
            : prev.tour_access || { enabled: false },
          links: Array.isArray(prev.tour_links) ? prev.tour_links : [],
        };

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
      listing_url: String(form.listing_url || prev.listing_url || "").trim().slice(0, 500),
      access: {
        emails: parseAccessEmails(form),
        phones: parseAccessPhones(form),
      },
      tour_access: tourPack.primary,
      tour_links: tourPack.links,
      criteria: {
        floor: String(form.floor || "").trim(),
        dpe: String(form.dpe || "").trim().toUpperCase().slice(0, 1),
        ges: String(form.ges || "").trim().toUpperCase().slice(0, 1),
        heating: String(form.heating || "").trim().slice(0, 80),
        energy_cost: form.energy_cost != null && form.energy_cost !== "" ? toNum(form.energy_cost) : "",
        charges: form.charges != null && form.charges !== "" ? toNum(form.charges) : "",
        year_built: form.year_built != null && form.year_built !== "" ? toNum(form.year_built) : "",
        furnished: form.furnished === true || form.furnished === "yes" || form.furnished === "1" ? true : undefined,
        has_elevator: form.has_elevator ? true : undefined,
        has_garage: form.has_garage ? true : undefined,
        has_parking: form.has_parking ? true : undefined,
        has_cave: form.has_cave ? true : undefined,
        has_garden: form.has_garden ? true : undefined,
        has_terrace: form.has_terrace ? true : undefined,
        has_balcony: form.has_balcony ? true : undefined,
      },
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
    p.floor = String(form.floor || p.floor || "").trim();
    p.dpe = String(form.dpe || p.dpe || "").trim().toUpperCase().slice(0, 1);
    p.ges = String(form.ges || p.ges || "").trim().toUpperCase().slice(0, 1);
    p.has_elevator = !!form.has_elevator;
    p.has_garage = !!form.has_garage;
    p.has_parking = !!form.has_parking;
    p.has_cave = !!form.has_cave;
    p.has_garden = !!form.has_garden;
    p.has_terrace = !!form.has_terrace;
    p.has_balcony = !!form.has_balcony;
    if (form.listing_url || prev.listing_url) {
      p.listing_url = String(form.listing_url || prev.listing_url || "").trim().slice(0, 500);
    }
    if (photos.length) p.photos_json = photos;
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

  function findByTourToken(properties, token) {
    var t = String(token || "").trim();
    if (!t || t.indexOf("vt_") !== 0) return null;
    var list = properties || [];
    for (var i = 0; i < list.length; i++) {
      var bag = getAdMeta(list[i]);
      var Tour = tourLib();
      if (Tour && Tour.getTourAccessForToken && Tour.getTourAccessForToken(bag.ad, t)) return list[i];
      var ta = bag.ad && bag.ad.tour_access;
      if (ta && String(ta.token || "") === t) return list[i];
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
    getSellDossier: getSellDossier,
    sellDossierToCriteria: sellDossierToCriteria,
    channelsOf: channelsOf,
    hasChannel: hasChannel,
    isPublicMandateAd: isPublicMandateAd,
    isPrivateDemoAd: isPrivateDemoAd,
    toAdListing: toAdListing,
    applyAdToProperty: applyAdToProperty,
    findByShareToken: findByShareToken,
    findByTourToken: findByTourToken,
    filterPublicAds: filterPublicAds,
    filterPrivateAds: filterPrivateAds,
    sanitizePhotos: sanitizePhotos,
    sanitizeUrlList: sanitizeUrlList,
    isSafeVideoUrl: isSafeVideoUrl,
    isSafeTourUrl: isSafeTourUrl,
    formatPrice: formatPrice,
  };
});
