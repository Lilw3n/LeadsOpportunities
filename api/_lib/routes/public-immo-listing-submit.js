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
  if (s === "signalement" || s === "temoin" || s === "témoin" || s === "chasseur" || s === "tip") {
    return "signalement";
  }
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
  if (role === "signalement") return "signalement-bien";
  if (role === "vendeur") return "vendeur-immo";
  if (role === "les_deux") return "acheteur-vendeur-immo";
  return "acheteur-immo";
}

function verticalForRole(role) {
  if (role === "signalement") return "chasseur_immo";
  if (role === "vendeur") return "vendeur_immo";
  if (role === "les_deux") return "acheteur_vendeur_immo";
  return "acheteur_immo";
}

function hatsForRole(role) {
  if (role === "les_deux") return ["vendeur", "acquereur"];
  if (role === "vendeur") return ["vendeur"];
  if (role === "signalement") return ["signalement", "chasseur"];
  return ["acquereur"];
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
  var isSignalement = role === "signalement";
  var isOwner = role === "vendeur" || role === "les_deux";
  var alsoBuys = role === "les_deux" || body.alsoBuys === true || body.alsoBuys === "1";
  if (alsoBuys && role === "vendeur") role = "les_deux";
  isOwner = role === "vendeur" || role === "les_deux";

  var email = str(body.email, 320).toLowerCase();
  var phone = str(body.phone || body.telephone, 40);
  var confirmMethod = str(body.confirmMethod, 20).toLowerCase();
  var allowIncomplete =
    isOwner ||
    body.dossierIncomplete === true ||
    body.dossierIncomplete === "1" ||
    body.allowIncomplete === true ||
    body.allowIncomplete === "1";
  if (!email && !phone && !allowIncomplete) {
    return res.status(400).json({
      ok: false,
      error: "contact_required",
      message:
        confirmMethod === "google"
          ? "Connectez-vous avec Google ou choisissez e-mail / téléphone pour confirmer votre identité."
          : confirmMethod === "email"
            ? "Indiquez votre e-mail pour qu'on puisse vous recontacter."
            : confirmMethod === "phone"
              ? "Indiquez votre téléphone pour qu'on puisse vous recontacter."
              : "Indiquez votre e-mail ou téléphone pour qu'on puisse vous recontacter.",
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
  var signalementSource = str(body.signalementSource || body.signalement_source, 80);
  var addressHint = str(body.addressHint || body.address_hint || body.adresse, 200);

  var sellerAgency = str(body.sellerAgency || body.agence, 120);

  if (isSignalement) {
    sellerName = sellerName || "Vendeur (non identifié)";
  } else if (isOwner) {
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
  var wantsSellDossier = body.wantsSellDossier === true || body.wantsSellDossier === "1";
  var sellDossier =
    body.sellDossier && typeof body.sellDossier === "object" && !Array.isArray(body.sellDossier)
      ? body.sellDossier
      : null;
  if (sellDossier) wantsSellDossier = true;

  if (sellDossier) {
    city = city || str(sellDossier.sellCity, 120);
    postal = postal || str(sellDossier.sellPostalCode, 5);
    description = description || str(sellDossier.sellDescription, 800);
    rooms = rooms != null ? rooms : num(sellDossier.sellRooms);
    bedrooms = bedrooms != null ? bedrooms : num(sellDossier.sellBedrooms);
    surface = surface != null ? surface : num(sellDossier.sellSurface);
    dpe = dpe || str(sellDossier.sellDpe, 1).toUpperCase();
    price = price != null ? price : num(sellDossier.sellPriceFai || sellDossier.sellAskingPrice);
    propertyType = propertyType || str(sellDossier.sellPropertyType, 40);
    if (Array.isArray(sellDossier.sellPhotos) && sellDossier.sellPhotos.length) {
      photos = Lib.sanitizeMedia(photos.concat(sellDossier.sellPhotos));
    }
  }

  var detections = collectDetections(body);
  var hasManualBits = !!(city || postal || description || photos.length || price || addressHint);
  if (!detections.length) {
    if ((isOwner || isSignalement) && hasManualBits) {
      detections = [manualDetection()];
    } else if (isSignalement) {
      return res.status(400).json({
        ok: false,
        error: "signalement_incomplete",
        message: "Indiquez la ville du bien et au moins une photo ou une description.",
      });
    } else if (!isOwner) {
      return res.status(400).json({
        ok: false,
        error: "url_required",
        message: "Collez au moins une URL d'annonce (Leboncoin, SeLoger, ParuVendu…).",
      });
    } else {
      /* Vendeur : dépôt sans URL / ville encore — brouillon incomplet accepté. */
      detections = [manualDetection()];
    }
  }

  if ((isOwner || isSignalement) && !city && !postal && !addressHint && !allowIncomplete) {
    return res.status(400).json({
      ok: false,
      error: "city_required",
      message: isSignalement
        ? "Indiquez la ville, le code postal ou la commune du bien signalé."
        : "Indiquez au minimum la ville, le code postal ou l'adresse du bien à vendre.",
    });
  }
  if ((isOwner || isSignalement) && !city && postal) {
    city = postal;
  }

  if (isSignalement && !photos.length && !description) {
    return res.status(400).json({
      ok: false,
      error: "photo_or_desc_required",
      message: "Ajoutez au moins une photo ou une courte description du bien.",
    });
  }

  var need = needForRole(role);
  var vertical = verticalForRole(role);
  var leadScore =
    role === "les_deux" ? 85 : isOwner ? 75 : isSignalement ? (photos.length ? 72 : 62) : sellerPhone || sellerEmail ? 70 : 55;
  var leadId = str(body.leadId || body.lead_id, 80) || crypto.randomUUID();
  var propertyIds = [];
  var reusePropertyId = str(body.propertyId || body.property_id, 80) || null;
  if (!reusePropertyId && Array.isArray(body.propertyIds) && body.propertyIds[0]) {
    reusePropertyId = str(body.propertyIds[0], 80);
  }
  var criteriaId = null;
  var sql = getSql();
  var leadPayload = null;

  if (sql) {
    try {
      var store = require("../immo-properties-store");
      await store.ensureImmoSchema(sql);

      for (var i = 0; i < detections.length; i++) {
        var d = detections[i];
        var origin = isSignalement
          ? "public_signalement_chasseur"
          : d.portal === "manual"
            ? "public_listing_manual"
            : "public_listing_url";
        var titleBits = [
          isSignalement ? "Signalement chasseur" : isOwner ? "Bien vendeur" : d.label,
          city || d.host,
          price ? Math.round(price) + " €" : "",
        ].filter(Boolean);
        var notesBits = [
          isSignalement
            ? "Signalement tiers (chasseur de bien)." +
              (signalementSource ? " Source : " + signalementSource + "." : "") +
              (addressHint ? " Adresse / repère : " + addressHint + "." : "")
            : isOwner
              ? "Dépôt vendeur (" + (d.portal === "manual" ? "saisie manuelle" : d.label) + ")."
              : "Soumis via URL publique. Portail : " + d.label,
          d.listingId ? "#" + d.listingId : "",
          role === "les_deux" ? "Double casquette : vend et rachète." : "",
          wantsRelais ? "Intérêt prêt relais / chaîne." : "",
          details,
        ]
          .filter(Boolean)
          .join(" ");

        var propMetadata = {
          origin: origin,
          role: role,
          hats: hatsForRole(role),
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
          wantsSellDossier: wantsSellDossier,
          sellDossier: sellDossier || null,
        };

        var propId = await store.upsertProperty(
          sql,
          {
            id: i === 0 && reusePropertyId ? reusePropertyId : undefined,
            title: titleBits.join(" · ") || (isSignalement ? "Bien signalé" : isOwner ? "Bien à vendre" : "Annonce " + d.label),
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
            metadata: propMetadata,
          },
          null
        );
        propertyIds.push(propId);

        if (photos.length && (isOwner || isSignalement)) {
          try {
            var driveSync = require("../immo-listing-drive");
            var driveResult = await driveSync.syncPropertyPhotosToDrive(
              {
                id: propId,
                title: titleBits.join(" · ") || (isSignalement ? "Bien signalé" : "Bien à vendre"),
                city: city,
                postal_code: postal,
                surface_m2: surface,
                firstName: firstName,
                lastName: lastName,
                sellerName: sellerName || personName || "",
              },
              photos
            );
            if (driveResult.uploaded > 0 || driveResult.driveFolderId) {
              propMetadata.drive = {
                folderId: driveResult.driveFolderId || null,
                uploaded: driveResult.uploaded || 0,
                simulated: !!driveResult.simulated,
                webViewLink: driveResult.webViewLink || null,
              };
              await store.patchPropertyMedia(sql, propId, {
                photos: driveResult.photos || photos,
                drive_folder_id: driveResult.driveFolderId || null,
                metadata: propMetadata,
              });
              photos = driveResult.photos || photos;
            }
          } catch (driveErr) {
            console.warn("[immo-listing-submit] drive", driveErr && driveErr.message);
          }
        }

        if (!isSignalement && (isOwner || sellerName || sellerPhone || sellerEmail)) {
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

        if (isSignalement) {
          await store.upsertParty(sql, {
            property_id: propId,
            role: "signaleur",
            name: personName || "Signaleur",
            email: email || null,
            phone: phone || null,
            notes:
              "Signalement chasseur de bien" +
              (signalementSource ? " — source : " + signalementSource : "") +
              (addressHint ? " — repère : " + addressHint : ""),
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

      leadPayload = {
        need: need,
        role: role,
        hats: hatsForRole(role),
        listingUrls: detections
          .map(function (d) {
            return d.url;
          })
          .filter(Boolean),
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
        email: email || null,
        phone: phone || null,
        photoCount: photos.length,
        hasCapture: photos.some(function (p) {
          return p.kind === "capture";
        }),
        hasDescription: !!description,
        alsoBuys: role === "les_deux",
        wantsRelais: wantsRelais,
        buyCity: buyCity,
        buyBudgetMax: buyBudget,
        signalementSource: signalementSource,
        addressHint: addressHint,
        wantsSellDossier: wantsSellDossier,
        sellDossier: sellDossier || null,
        confirmByEmail:
          body.confirmMethod === "email" ||
          body.confirmMethod === "google" ||
          (body.confirmByEmail !== false && body.confirmByEmail !== "0" && body.confirmMethod !== "phone"),
        confirmByPhone: body.confirmMethod === "phone" || body.confirmByPhone === true || body.confirmByPhone === "1",
        confirmMethod: confirmMethod || null,
        createAccount: body.createAccount !== false && body.createAccount !== "0",
        depositDraft:
          body.depositDraft && typeof body.depositDraft === "object" && !Array.isArray(body.depositDraft)
            ? body.depositDraft
            : null,
        dossierIncomplete:
          body.dossierIncomplete === true ||
          body.dossierIncomplete === "1" ||
          (!email && !phone) ||
          ((isOwner || isSignalement) && !city && !postal && !addressHint),
      };

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
          ${JSON.stringify(leadPayload)},
          ${"site_web"},
          ${"new"},
          ${"new"}
        )
        ON CONFLICT (id) DO UPDATE SET
          source = EXCLUDED.source,
          vertical = COALESCE(EXCLUDED.vertical, site_leads.vertical),
          lead_score = GREATEST(COALESCE(site_leads.lead_score, 0), EXCLUDED.lead_score),
          email = COALESCE(EXCLUDED.email, site_leads.email),
          phone = COALESCE(EXCLUDED.phone, site_leads.phone),
          payload = EXCLUDED.payload,
          status = EXCLUDED.status,
          pipeline_stage = EXCLUDED.pipeline_stage,
          updated_at = NOW()
      `;
      } catch (leadErr) {
        console.warn("[immo-listing-submit] site_leads", leadErr && leadErr.message);
      }
    } catch (err) {
      console.warn("[immo-listing-submit]", err && err.message);
      return res.status(500).json({ ok: false, error: "save_failed" });
    }
  }

  var contactId = null;
  var verifyEmailSent = false;
  var accountCreated = false;
  var interlocuteurCreated = false;
  if (sql && (email || phone)) {
    try {
      var confirmByEmail =
        body.confirmMethod === "email" ||
        body.confirmMethod === "google" ||
        (body.confirmByEmail !== false && body.confirmByEmail !== "0" && body.confirmMethod !== "phone");
      var confirmByPhone = body.confirmMethod === "phone" || body.confirmByPhone === true || body.confirmByPhone === "1";
      var ingest = require("../crm-ingest-from-lead");
      var ingestBody = {
        email: email,
        phone: phone,
        firstName: firstName,
        lastName: lastName,
        vertical: vertical,
        need: need,
        source: "vendeur_immo_listing",
        leadScore: leadScore,
        confirmByEmail: confirmByEmail,
        confirmByPhone: confirmByPhone,
        payload: leadPayload,
        city: city,
        postal_code: postal,
        propertyIds: propertyIds,
        wantsSellDossier: wantsSellDossier,
        sellDossier: sellDossier || null,
      };
      contactId = await ingest.ingestLeadToCrm(sql, ingestBody, leadId, {
        hydrate: true,
        propertyIds: propertyIds,
        leadRow: {
          id: leadId,
          email: email || null,
          phone: phone || null,
          vertical: vertical,
          payload: JSON.stringify(leadPayload || ingestBody),
        },
      });
      accountCreated = !!contactId;
      interlocuteurCreated = !!(contactId && email && phone);
      if (contactId && confirmByEmail && email) {
        var authLib = require("../external-client-auth");
        var sent = await authLib.sendEmailVerification(
          contactId,
          email,
          firstName,
          "/landings/acheteur-immo.html?hat=vendeur&reprise=1#deposer-bien"
        );
        verifyEmailSent = sent.ok;
      }
      var wantsMandate =
        !!(sellDossier && (sellDossier.sellWantsMandate === "1" || sellDossier.sellWantsMandate === true));
      if (wantsMandate && email) {
        try {
          var quest = require("../quest-resume");
          var token = quest.signResumeToken({
            leadId: leadId,
            contactId: contactId,
            vertical: vertical || "vendeur_immo",
          });
          var mandateMail = await quest.sendMandateRequestNotice({
            email: email,
            firstName: firstName,
            token: token,
            vertical: vertical || "vendeur_immo",
            preference: sellDossier.sellMandatePreference || "exclusif",
          });
          verifyEmailSent = verifyEmailSent || !!mandateMail.ok;
        } catch (mandateErr) {
          console.warn("[immo-listing-submit] mandate email", mandateErr && mandateErr.message);
        }
      }
    } catch (crmErr) {
      console.warn("[immo-listing-submit] crm", crmErr && crmErr.message);
    }
  }

  return res.status(200).json({
    ok: true,
    leadId: leadId,
    contactId: contactId,
    accountCreated: accountCreated,
    interlocuteurCreated: interlocuteurCreated,
    verifyEmailSent: verifyEmailSent,
    role: role,
    hats: hatsForRole(role),
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
    driveConfigured: (function () {
      try {
        return require("../google-drive-auth").isDriveConfigured();
      } catch (e) {
        return false;
      }
    })(),
  });
};
