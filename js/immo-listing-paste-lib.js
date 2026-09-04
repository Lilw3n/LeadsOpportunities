/**
 * Reprise d'infos depuis un lien / texte d'annonce (Leboncoin & portails).
 * Pas de scraping serveur (LBC renvoie un captcha) : on parse l'URL + le texte collé.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory(
      typeof require === "function" ? require("./immo-listing-portals-lib.js") : null
    );
  } else {
    root.ImmoListingPaste = factory(root.ImmoListingPortals || null);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function (Portals) {
  function toNum(v) {
    if (v == null || v === "") return null;
    var n = Number(String(v).replace(/\s/g, "").replace(",", "."));
    return isFinite(n) ? n : null;
  }

  function cleanText(s) {
    return String(s || "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+/g, " ")
      .trim();
  }

  function extractUrls(text) {
    var out = [];
    var re = /https?:\/\/[^\s<>"')\]]+/gi;
    var m;
    while ((m = re.exec(String(text || "")))) {
      var u = m[0].replace(/[.,;:!?)]+$/, "");
      if (out.indexOf(u) === -1) out.push(u);
    }
    return out;
  }

  function detectListingUrl(text) {
    var urls = extractUrls(text);
    var i;
    for (i = 0; i < urls.length; i++) {
      if (Portals && Portals.detectFromUrl) {
        var d = Portals.detectFromUrl(urls[i]);
        if (d && d.ok && d.portal && d.portal !== "manual") {
          return Object.assign({ url: urls[i] }, d);
        }
      }
      if (/leboncoin\.fr/i.test(urls[i])) {
        return {
          ok: true,
          url: urls[i],
          portal: "leboncoin",
          label: "Leboncoin",
          listingId: (urls[i].match(/\/(\d{8,})/) || [])[1] || "",
        };
      }
    }
    var raw = cleanText(text);
    if (/^https?:\/\//i.test(raw) || /leboncoin\.fr/i.test(raw)) {
      var only = raw.split(/\s+/)[0];
      if (Portals && Portals.detectFromUrl) {
        var det = Portals.detectFromUrl(only);
        if (det && det.ok) return Object.assign({ url: only }, det);
      }
      if (/leboncoin\.fr/i.test(only)) {
        return {
          ok: true,
          url: /^https?:\/\//i.test(only) ? only : "https://" + only,
          portal: "leboncoin",
          label: "Leboncoin",
          listingId: (only.match(/\/(\d{8,})/) || [])[1] || "",
        };
      }
    }
    return null;
  }

  function categoryFromUrl(url) {
    var m = String(url || "").match(/\/ad\/([^/]+)\//i);
    if (!m) return "";
    var cat = m[1].toLowerCase();
    if (/appart|vente/.test(cat) && /maison|villa/.test(cat)) return "maison";
    if (/maison|villa/.test(cat)) return "maison";
    if (/appart/.test(cat)) return "appartement";
    if (/terrain/.test(cat)) return "terrain";
    if (/parking|garage/.test(cat)) return "parking";
    if (/immeuble/.test(cat)) return "immeuble";
    if (/local|bureau|commerce/.test(cat)) return "local";
    if (/ventes_immobilieres|locations_immobilieres/.test(cat)) return "";
    return "";
  }

  function detectType(text) {
    var t = text.toLowerCase();
    if (/\bmaison\b|\bvilla\b|\bpavillon\b/.test(t)) return "maison";
    if (/\bappartement\b|\bappart\b|\bstudio\b|\bt[1-6]\b/.test(t)) return "appartement";
    if (/\bterrain\b/.test(t)) return "terrain";
    if (/\bimmeuble\b/.test(t)) return "immeuble";
    if (/\bparking\b|\bgarage\b|\bbox\b/.test(t)) return "parking";
    if (/\blocal\b|\bbureau\b|\bcommerce\b/.test(t)) return "local";
    return "";
  }

  function hasAmenity(text, yesRe, noRe) {
    if (noRe && noRe.test(text)) return false;
    if (yesRe.test(text)) return true;
    return null;
  }

  function pickTitle(lines, price) {
    var i;
    for (i = 0; i < lines.length; i++) {
      var line = cleanText(lines[i]);
      if (!line || line.length < 8 || line.length > 120) continue;
      if (/^https?:\/\//i.test(line)) continue;
      if (/leboncoin\.fr/i.test(line)) continue;
      if (/^\d[\d\s]*\s*€/.test(line)) continue;
      if (price && line.replace(/\s/g, "").indexOf(String(Math.round(price))) !== -1 && /€/.test(line)) {
        continue;
      }
      if (/^(critères|description|référence|publiée|voir le numéro)/i.test(line)) continue;
      return line;
    }
    return "";
  }

  function pickDescription(text, title) {
    var parts = String(text || "").split(/\n{2,}/);
    var best = "";
    parts.forEach(function (block) {
      var b = cleanText(block);
      if (b.length < 80) return;
      if (/^https?:\/\//i.test(b)) return;
      if (title && b.indexOf(title) === 0 && b.length < title.length + 40) return;
      if (b.length > best.length) best = b;
    });
    if (best) return best.slice(0, 1600);
    var lines = String(text || "")
      .split(/\n/)
      .map(cleanText)
      .filter(function (l) {
        return l.length > 40 && !/^https?:\/\//i.test(l) && !/leboncoin\.fr/i.test(l);
      });
    return lines.slice(0, 8).join("\n").slice(0, 1600);
  }

  /**
   * @param {string} raw
   * @returns {object} champs normalisés pour le formulaire pubs
   */
  function parseListingPaste(raw) {
    var text = String(raw || "").replace(/\r/g, "");
    var detected = detectListingUrl(text);
    var urls = extractUrls(text);
    var body = text;
    if (detected && detected.url) {
      body = text.replace(detected.url, " ").replace(/https?:\/\/[^\s]+/gi, " ");
    }

    var out = {
      ok: false,
      listing_url: detected && detected.url ? detected.url : "",
      portal: detected && detected.portal ? detected.portal : "",
      portal_label: detected && detected.label ? detected.label : "",
      listing_id: detected && detected.listingId ? detected.listingId : "",
      title: "",
      headline: "",
      description: "",
      property_type: categoryFromUrl(detected && detected.url) || "",
      city: "",
      postal_code: "",
      price_fai: null,
      surface_m2: null,
      rooms: null,
      bedrooms: null,
      floor: "",
      heating: "",
      dpe: "",
      ges: "",
      charges: null,
      energy_cost: null,
      year_built: null,
      furnished: null,
      has_elevator: null,
      has_parking: null,
      has_garage: null,
      has_cave: null,
      has_balcony: null,
      has_terrace: null,
      has_garden: null,
      photo_urls: [],
      fields_filled: [],
      hint: "",
    };

    var priceM =
      body.match(/(?:prix|fai|hai)?\s*:?\s*(\d{1,3}(?:[\s\u00a0.]\d{3})+|\d{4,7})\s*€/i) ||
      body.match(/(\d{1,3}(?:[\s\u00a0.]\d{3})+)\s*€/);
    if (priceM) out.price_fai = toNum(priceM[1]);

    var surfM = body.match(/(\d+(?:[.,]\d+)?)\s*m[²2]/i);
    if (surfM) out.surface_m2 = toNum(surfM[1]);

    var roomsM = body.match(/(\d+)\s*pi[eè]ces?\b/i) || body.match(/\bT\s*([1-9])\b/i);
    if (roomsM) out.rooms = toNum(roomsM[1]);

    var bedM = body.match(/(\d+)\s*chambres?\b/i);
    if (bedM) out.bedrooms = toNum(bedM[1]);

    var floorM =
      body.match(/[ée]tage\s*:?\s*(RDC|rdc|rez[- ]?de[- ]?chauss[ée]e|\d{1,2})\b/i) ||
      body.match(/\b(RDC)\b/);
    if (floorM) {
      var fl = floorM[1];
      out.floor = /rdc|rez/i.test(fl) ? "RDC" : String(fl);
    }

    var cpCity = body.match(/\b(\d{5})\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'’\-\s]{1,40})/);
    var cityCp = body.match(/\b([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ'’\-]{2,40})\s*\((\d{5})\)/);
    if (cpCity) {
      out.postal_code = cpCity[1];
      out.city = cleanText(cpCity[2]).replace(/\s+/g, " ").slice(0, 60);
    } else if (cityCp) {
      out.city = cleanText(cityCp[1]);
      out.postal_code = cityCp[2];
    }

    var dpeM =
      body.match(/(?:DPE|classe\s*[ée]nerg(?:ie|étique)|consommation\s*[ée]nergétique)\s*:?\s*([A-G])\b/i) ||
      body.match(/\bclasse\s+([A-G])\b/i);
    if (dpeM) out.dpe = dpeM[1].toUpperCase();

    var gesM = body.match(/\bGES\s*:?\s*([A-G])\b/i);
    if (gesM) out.ges = gesM[1].toUpperCase();

    var heatM = body.match(/chauffage\s*:?\s*([^\n.;]{3,60})/i);
    if (heatM) out.heating = cleanText(heatM[1]).slice(0, 80);

    var chargesM = body.match(/charges(?:\s*annuelles|\s*\/\s*an|\s*par\s*an)?\s*:?\s*(\d[\d\s]*)\s*€/i);
    if (chargesM) out.charges = toNum(chargesM[1]);

    var energyM = body.match(
      /(?:co[uû]t|[ée]nergie|d[ée]penses?\s*(?:annuelles?)?(?:\s*d['’][ée]nergie)?)\s*:?\s*(\d[\d\s]*)\s*€/i
    );
    if (energyM && /[ée]nergie|d[ée]pense/i.test(energyM[0] || body)) {
      out.energy_cost = toNum(energyM[1]);
    }

    var yearM = body.match(/ann[ée]e\s*(?:de\s*)?construction\s*:?\s*(\d{4})\b/i);
    if (yearM) out.year_built = toNum(yearM[1]);

    if (!out.property_type) out.property_type = detectType(body);

    out.has_elevator = hasAmenity(body, /\bascenseur\b/i, /\bsans\s+ascenseur\b/i);
    out.has_parking = hasAmenity(body, /\bparking\b|\bstationnement\b/i, /\bsans\s+parking\b/i);
    out.has_garage = hasAmenity(body, /\bgarage\b|\bbox\b/i, /\bsans\s+garage\b/i);
    out.has_cave = hasAmenity(body, /\bcave\b/i, /\bsans\s+cave\b/i);
    out.has_balcony = hasAmenity(body, /\bbalcon\b/i, null);
    out.has_terrace = hasAmenity(body, /\bterrasse\b/i, null);
    out.has_garden = hasAmenity(body, /\bjardin\b/i, null);
    if (/\bmeubl[ée]\b/i.test(body) && !/\bnon\s+meubl/i.test(body)) out.furnished = true;
    if (/\bnon\s+meubl/i.test(body) || /\bvide\b/i.test(body)) out.furnished = false;

    urls.forEach(function (u) {
      if (/img\.leboncoin\.fr|leboncoin\.fr\/.*\.(jpe?g|png|webp)/i.test(u) || /\.(jpe?g|png|webp)(\?|$)/i.test(u)) {
        if (out.photo_urls.indexOf(u) === -1) out.photo_urls.push(u);
      }
    });

    var lines = text.split(/\n/);
    out.title = pickTitle(lines, out.price_fai);
    out.headline = out.title;
    out.description = pickDescription(text, out.title);

    Object.keys(out).forEach(function (k) {
      if (
        [
          "ok",
          "listing_url",
          "portal",
          "portal_label",
          "listing_id",
          "fields_filled",
          "hint",
          "photo_urls",
          "headline",
        ].indexOf(k) !== -1
      ) {
        return;
      }
      var v = out[k];
      if (v == null || v === "" || v === false) return;
      if (Array.isArray(v) && !v.length) return;
      out.fields_filled.push(k);
    });
    if (out.listing_url) out.fields_filled.push("listing_url");
    if (out.photo_urls.length) out.fields_filled.push("photos");

    out.ok = out.fields_filled.length > 0;

    if (detected && out.fields_filled.length <= 2 && !out.price_fai && !out.surface_m2) {
      out.hint =
        "Lien " +
        (out.portal_label || "Leboncoin") +
        " reconnu. Leboncoin bloque la lecture automatique : ouvrez l’annonce, sélectionnez le texte (titre, prix, critères, description) puis collez-le ici pour préremplir.";
    } else if (out.ok) {
      out.hint =
        out.fields_filled.length +
        " info(s) reprises" +
        (out.portal_label ? " (" + out.portal_label + ")" : "") +
        ". Vérifiez puis enregistrez.";
    } else {
      out.hint = "Aucune info détectée. Collez un lien Leboncoin et/ou le texte de l’annonce.";
    }

    return out;
  }

  return {
    parseListingPaste: parseListingPaste,
    detectListingUrl: detectListingUrl,
    extractUrls: extractUrls,
  };
});
