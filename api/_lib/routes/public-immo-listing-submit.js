/**
 * POST /api/immo-listing-submit — coller des URL d'annonces (Leboncoin, SeLoger…).
 * Enregistre le bien + infos vendeur fournies. Pas de scraping des portails.
 */
const crypto = require("crypto");
const { applyApiGuards, parseJsonBody, isHoneypotFilled, rateLimit, getClientIp } = require("../security");
const { getVisitorCountry, isFranceAudience } = require("../geo-france");
const { getSql } = require("../db");
const Portals = require("../../../js/immo-listing-portals-lib.js");
const Lib = require("../../../js/immo-public-listings-lib.js");

function str(v, max) {
  var s = String(v == null ? "" : v).trim();
  return s.slice(0, max || 200);
}

function num(v) {
  if (v == null || v === "") return null;
  var n = Number(String(v).replace(/\s/g, "").replace(",", "."));
  return isFinite(n) ? n : null;
}

function collectDetections(body) {
  var urls = [];
  if (Array.isArray(body.urls)) urls = body.urls;
  else if (body.listingUrl || body.listing_url) urls = [body.listingUrl || body.listing_url];
  else if (body.listingUrls || body.listing_urls) urls = String(body.listingUrls || body.listing_urls);
  else urls = body.urlsText || body.urls_text || "";
  var detected = Portals.detectMany(urls);
  return detected.filter(function (d) {
    return d.ok;
  }).slice(0, 8);
}

module.exports = async function publicImmoListingSubmit(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var ip = getClientIp(req);
  var rl = rateLimit("immo-listing-submit:" + ip, 12, 60 * 1000);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(Math.ceil(rl.retryAfterMs / 1000)));
    return res.status(429).json({ error: "Trop de requêtes, réessayez plus tard" });
  }

  var parsed = parseJsonBody(req, 2500000);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  var body = parsed.body || {};
  if (isHoneypotFilled(body)) {
    return res.status(200).json({ ok: true, received: 0 });
  }

  var country = getVisitorCountry(req);
  if (country && !isFranceAudience(country)) {
    return res.status(200).json({
      ok: false,
      error: "geo_out_of_scope",
      message: "Collecte d'annonces disponible en France uniquement.",
    });
  }

  var detections = collectDetections(body);
  if (!detections.length) {
    return res.status(400).json({
      ok: false,
      error: "url_required",
      message: "Collez au moins une URL d'annonce (Leboncoin, SeLoger, ParuVendu…).",
    });
  }

  var email = str(body.email, 320).toLowerCase();
  var phone = str(body.phone || body.telephone, 40);
  if (!email && !phone) {
    return res.status(400).json({
      ok: false,
      error: "contact_required",
      message: "Indiquez votre e-mail ou téléphone pour qu'on puisse vous recontacter.",
    });
  }

  var firstName = str(body.firstName || body.prenom, 80);
  var lastName = str(body.lastName || body.nom, 80);
  var city = str(body.city || body.searchCities, 120);
  var postal = str(body.postal_code || body.postalProject || body.postal, 5);
  var propertyType = str(body.property_type || body.propertyType || body.propertySought, 40) || "appartement";
  var price = num(body.price_fai || body.budgetMax || body.price);
  var rooms = num(body.rooms || body.roomsMin);
  var bedrooms = num(body.bedrooms);
  var surface = num(body.surface_m2 || body.propertySurfaceSearch);
  var dpe = str(body.dpe, 1).toUpperCase();
  var description = str(body.description, 800);
  var details = str(body.details, 500);
  var photos = Lib.sanitizeMedia(body.photos);
  var sellerName = str(body.sellerName || body.vendeurNom, 120);
  var sellerPhone = str(body.sellerPhone || body.vendeurTel, 40);
  var sellerEmail = str(body.sellerEmail || body.vendeurEmail, 320).toLowerCase();
  var sellerAgency = str(body.sellerAgency || body.agence, 120);

  var leadId = crypto.randomUUID();
  var propertyIds = [];
  var sql = getSql();

  if (sql) {
    try {
      var store = require("../immo-properties-store");
      await store.ensureImmoSchema(sql);

      for (var i = 0; i < detections.length; i++) {
        var d = detections[i];
        var titleBits = [d.label, city || d.host, price ? Math.round(price) + " €" : ""].filter(Boolean);
        var propId = await store.upsertProperty(
          sql,
          {
            title: titleBits.join(" · ") || "Annonce " + d.label,
            property_type: propertyType,
            status: "prospection",
            listing_source: d.portal,
            listing_url: d.url,
            city: city || null,
            postal_code: postal || null,
            department: postal ? postal.slice(0, 2) : null,
            rooms: rooms,
            bedrooms: bedrooms,
            surface_m2: surface,
            dpe: dpe || null,
            price_fai: price,
            description: description,
            photos: photos,
            notes:
              "Soumis via URL publique. Portail : " +
              d.label +
              (d.listingId ? " #" + d.listingId : "") +
              (details ? "\n" + details : ""),
            lead_id: leadId,
            a_contacter: !!(sellerPhone || sellerEmail),
            contact_connu: !!(sellerPhone || sellerEmail || sellerName),
            metadata: {
              origin: "public_listing_url",
              portal: d.portal,
              listingId: d.listingId,
              seller: {
                name: sellerName,
                phone: sellerPhone,
                email: sellerEmail,
                agency: sellerAgency,
              },
              buyer: { firstName: firstName, lastName: lastName, email: email, phone: phone },
            },
          },
          null
        );
        propertyIds.push(propId);

        if (sellerName || sellerPhone || sellerEmail) {
          await store.upsertParty(sql, {
            property_id: propId,
            role: "vendeur",
            name: sellerName || sellerAgency || "Vendeur annonce",
            email: sellerEmail || null,
            phone: sellerPhone || null,
            notes: sellerAgency ? "Agence : " + sellerAgency : "Infos collées depuis l'annonce",
          });
        }

        await store.upsertParty(sql, {
          property_id: propId,
          role: "acquereur",
          name: [firstName, lastName].filter(Boolean).join(" ") || "Acquéreur",
          email: email || null,
          phone: phone || null,
          notes: "A collé l'URL " + d.url,
        });
      }

      try {
        await sql`
        INSERT INTO site_leads (
          id, source, vertical, lead_score, email, phone, payload, platform, status, pipeline_stage
        ) VALUES (
          ${leadId},
          ${"listing_url"},
          ${"acheteur_immo"},
          ${sellerPhone || sellerEmail ? 70 : 55},
          ${email || null},
          ${phone || null},
          ${JSON.stringify({
            need: "acheteur-immo",
            listingUrls: detections.map(function (d) { return d.url; }),
            portals: detections.map(function (d) { return d.portal; }),
            propertyIds: propertyIds,
            city: city,
            postal_code: postal,
            sellerName: sellerName,
            sellerPhone: sellerPhone,
            sellerAgency: sellerAgency,
            firstName: firstName,
            lastName: lastName,
            photoCount: photos.length,
            hasCapture: photos.some(function (p) { return p.kind === "capture"; }),
            hasDescription: !!description,
          })},
          ${"site_web"},
          ${"new"},
          ${"new"}
        )
      `;
      } catch (leadErr) {
        console.warn("[immo-listing-submit] site_leads", leadErr && leadErr.message);
      }
    } catch (err) {
      console.warn("[immo-listing-submit]", err && err.message);
      return res.status(500).json({ ok: false, error: "save_failed" });
    }
  }

  return res.status(200).json({
    ok: true,
    leadId: leadId,
    received: detections.length,
    propertyIds: propertyIds,
    listings: detections.map(function (d) {
      return { url: d.url, portal: d.portal, label: d.label, listingId: d.listingId };
    }),
    stored: propertyIds.length > 0,
    photos: photos.length,
    hasCapture: photos.some(function (p) {
      return p.kind === "capture";
    }),
    hasDescription: !!description,
  });
};
