/**
 * POST /api/immo-listing-submit — dépôt de bien (vendeur) ou URL collée (acquéreur).
 * Saisie manuelle ou URL. Double casquette : vend + rachète. Pas de scraping.
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

function normalizeRole(v) {
  var s = String(v || "")
    .toLowerCase()
    .replace(/-/g, "_");
  if (s === "vendeur" || s === "seller" || s === "vendeur_immo") return "vendeur";
  if (s === "les_deux" || s === "both" || s === "acheteur_vendeur" || s === "acheteur_vendeur_immo") {
    return "les_deux";
  }
  return "acheteur";
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

function manualDetection() {
  return {
    ok: true,
    portal: "manual",
    url: "",
    label: "Saisie manuelle",
    listingId: "",
    host: "",
  };
}

function needForRole(role) {
  if (role === "vendeur") return "vendeur-immo";
  if (role === "les_deux") return "acheteur-vendeur-immo";
  return "acheteur-immo";
}

function verticalForRole(role) {
  if (role === "vendeur") return "vendeur_immo";
  if (role === "les_deux") return "acheteur_vendeur_immo";
  return "acheteur_immo";
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

  var role = normalizeRole(body.role || body.hat || body.immoHat);
  var isOwner = role === "vendeur" || role === "les_deux";
  var alsoBuys = role === "les_deux" || body.alsoBuys === true || body.alsoBuys === "1";
  if (alsoBuys && role === "vendeur") role = "les_deux";
  isOwner = role === "vendeur" || role === "les_deux";

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
  var personName = [firstName, lastName].filter(Boolean).join(" ");
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
  var sellerKind = str(body.sellerKind || body.sellerType, 40) || (isOwner ? "particulier" : "");
  var sellerName = str(body.sellerName || body.vendeurNom, 120);
  var sellerPhone = str(body.sellerPhone || body.vendeurTel, 40);
  var sellerEmail = str(body.sellerEmail || body.vendeurEmail, 320).toLowerCase();
  var sellerAgency = str(body.sellerAgency || body.agence, 120);

  if (isOwner) {
    sellerName = sellerName || personName || "Vendeur";
    sellerPhone = sellerPhone || phone;
    sellerEmail = sellerEmail || email;
  }

  var buyCity = str(body.buyCity || body.searchCitiesBuy, 120);
  var buyPostal = str(body.buyPostal || body.buy_postal_code, 5);
  var buyBudget = num(body.buyBudgetMax || body.buy_budget_max);
  var buyRooms = num(body.buyRoomsMin || body.buy_rooms_min);
  var buySurface = num(body.buySurfaceMin || body.buy_surface_min);
  var buyType = str(body.buyPropertyType || body.buy_property_type, 40);
  var wantsRelais = body.wantsRelais === true || body.wantsRelais === "1" || body.pretRelais === true;

  var detections = collectDetections(body);
  var hasManualBits = !!(city || description || photos.length || price);
  if (!detections.length) {
    if (isOwner && hasManualBits) {
      detections = [manualDetection()];
    } else {
      return res.status(400).json({
        ok: false,
        error: isOwner ? "listing_required" : "url_required",
        message: isOwner
          ? "Indiquez la ville du bien, ou collez l'URL de votre annonce."
          : "Collez au moins une URL d'annonce (Leboncoin, SeLoger, ParuVendu…).",
      });
    }
  }

  if (isOwner && !city) {
    return res.status(400).json({
      ok: false,
      error: "city_required",
      message: "Indiquez la ville du bien à vendre.",
    });
  }

  var need = needForRole(role);
  var vertical = verticalForRole(role);
  var serviceIntent =
    role === "acheteur"
      ? "recherche_locale_mandat"
      : role === "les_deux"
        ? "vente_et_rachat"
        : "prise_mandat_vendeur";
  var leadScore = role === "les_deux" ? 85 : isOwner ? 75 : sellerPhone || sellerEmail ? 70 : 55;
  var leadId = crypto.randomUUID();
  var propertyIds = [];
  var criteriaId = null;
  var sql = getSql();

  if (sql) {
    try {
      var store = require("../immo-properties-store");
      await store.ensureImmoSchema(sql);

      for (var i = 0; i < detections.length; i++) {
        var d = detections[i];
        var origin = d.portal === "manual" ? "public_listing_manual" : "public_listing_url";
        var titleBits = [
          isOwner ? "Bien vendeur" : d.label,
          city || d.host,
          price ? Math.round(price) + " €" : "",
        ].filter(Boolean);
        var notesBits = [
          isOwner ? "Dépôt vendeur (" + (d.portal === "manual" ? "saisie manuelle" : d.label) + ")." : "Soumis via URL publique. Portail : " + d.label,
          !isOwner ? "Mission : rechercher localement le mandat à partir de l'annonce transmise par l'acquéreur." : "",
          d.listingId ? "#" + d.listingId : "",
          role === "les_deux" ? "Double casquette : vend et rachète." : "",
          wantsRelais ? "Intérêt prêt relais / chaîne." : "",
          details,
        ]
          .filter(Boolean)
          .join(" ");

        var propId = await store.upsertProperty(
          sql,
          {
            title: titleBits.join(" · ") || (isOwner ? "Bien à vendre" : "Annonce " + d.label),
            property_type: propertyType,
            status: "prospection",
            listing_source: d.portal || "manual",
            listing_url: d.url || null,
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
            notes: notesBits,
            lead_id: leadId,
            a_contacter: !!(sellerPhone || sellerEmail),
            contact_connu: !!(sellerPhone || sellerEmail || sellerName),
            metadata: {
              origin: origin,
              serviceIntent: serviceIntent,
              territory: city || postal || "",
              role: role,
              hats: role === "les_deux" ? ["vendeur", "acquereur"] : isOwner ? ["vendeur"] : ["acquereur"],
              portal: d.portal,
              listingId: d.listingId,
              sellerKind: sellerKind,
              seller: {
                name: sellerName,
                phone: sellerPhone,
                email: sellerEmail,
                agency: sellerAgency,
                kind: sellerKind,
              },
              buyer: { firstName: firstName, lastName: lastName, email: email, phone: phone },
              alsoBuys: role === "les_deux",
              wantsRelais: wantsRelais,
            },
          },
          null
        );
        propertyIds.push(propId);

        if (isOwner || sellerName || sellerPhone || sellerEmail) {
          await store.upsertParty(sql, {
            property_id: propId,
            role: "vendeur",
            name: sellerName || sellerAgency || personName || "Vendeur",
            email: sellerEmail || null,
            phone: sellerPhone || null,
            notes: isOwner
              ? "Propriétaire / déposant" + (sellerAgency ? " — " + sellerAgency : "") + (sellerKind ? " (" + sellerKind + ")" : "")
              : sellerAgency
                ? "Agence : " + sellerAgency
                : "Infos collées depuis l'annonce",
          });
        }

        if (role === "acheteur" || role === "les_deux") {
          await store.upsertParty(sql, {
            property_id: propId,
            role: "acquereur",
            name: personName || (role === "les_deux" ? "Vendeur-acquéreur" : "Acquéreur"),
            email: email || null,
            phone: phone || null,
            notes:
              role === "les_deux"
                ? "Vend ce bien et cherche à racheter" + (wantsRelais ? " (prêt relais / chaîne)" : "")
                : d.url
                  ? "A collé l'URL " + d.url
                  : "Prospect acquéreur",
          });
        }
      }

      if (role === "les_deux") {
        try {
          criteriaId = await store.upsertCriteria(
            sql,
            {
              lead_id: leadId,
              label: "Rachat — " + (personName || "vendeur-acquéreur"),
              status: "active",
              property_types: buyType ? [buyType] : [],
              cities: buyCity ? [buyCity] : [],
              postal_codes: buyPostal ? [buyPostal] : [],
              departments: buyPostal ? [buyPostal.slice(0, 2)] : [],
              rooms_min: buyRooms,
              surface_min: buySurface,
              budget_max: buyBudget,
              notes: wantsRelais ? "Chaîne / prêt relais demandé." : "Vend et rachète.",
              metadata: { origin: "public_dual_hat", role: "les_deux" },
            },
            null
          );
        } catch (critErr) {
          console.warn("[immo-listing-submit] criteria", critErr && critErr.message);
        }
      }

      try {
        await sql`
        INSERT INTO site_leads (
          id, source, vertical, lead_score, email, phone, payload, platform, status, pipeline_stage
        ) VALUES (
          ${leadId},
          ${detections[0] && detections[0].portal === "manual" ? "listing_manual" : "listing_url"},
          ${vertical},
          ${leadScore},
          ${email || null},
          ${phone || null},
          ${JSON.stringify({
            need: need,
            serviceIntent: serviceIntent,
            territory: city || postal || "",
            role: role,
            hats: role === "les_deux" ? ["vendeur", "acquereur"] : isOwner ? ["vendeur"] : ["acquereur"],
            listingUrls: detections.map(function (d) {
              return d.url;
            }).filter(Boolean),
            portals: detections.map(function (d) {
              return d.portal;
            }),
            propertyIds: propertyIds,
            criteriaId: criteriaId,
            city: city,
            postal_code: postal,
            sellerName: sellerName,
            sellerPhone: sellerPhone,
            sellerAgency: sellerAgency,
            sellerKind: sellerKind,
            firstName: firstName,
            lastName: lastName,
            photoCount: photos.length,
            hasCapture: photos.some(function (p) {
              return p.kind === "capture";
            }),
            hasDescription: !!description,
            alsoBuys: role === "les_deux",
            wantsRelais: wantsRelais,
            buyCity: buyCity,
            buyBudgetMax: buyBudget,
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
    role: role,
    hats: role === "les_deux" ? ["vendeur", "acquereur"] : isOwner ? ["vendeur"] : ["acquereur"],
    received: detections.length,
    propertyIds: propertyIds,
    criteriaId: criteriaId,
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
