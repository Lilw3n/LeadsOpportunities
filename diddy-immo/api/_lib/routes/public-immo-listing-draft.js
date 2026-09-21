/**
 * POST /api/immo-listing-draft — crée / réutilise lead + contact + bien brouillon
 * dès le premier upload de pièce (sans attendre l’envoi de l’annonce).
 */
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp, normalizeClientIp } = require("../security");
const { getSql } = require("../db");
const { recordFunnelEvent } = require("../funnel-tracker");
const { ensureContactLinked } = require("../crm-ingest-from-lead");

function str(v, max) {
  return String(v == null ? "" : v).trim().slice(0, max || 200);
}

module.exports = async function publicImmoListingDraft(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var ip = getClientIp(req);
  var rl = rateLimit("immo-listing-draft:" + ip, 40, 60 * 1000);
  if (!rl.allowed) {
    res.setHeader("Retry-After", String(Math.ceil(rl.retryAfterMs / 1000)));
    return res.status(429).json({ error: "Trop de requêtes" });
  }

  var parsed = parseJsonBody(req, 256 * 1024);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  var body = parsed.body || {};

  var sql = getSql();
  if (!sql) return res.status(500).json({ ok: false, error: "Base indisponible" });

  var email = str(body.email, 320).toLowerCase() || null;
  var phone = str(body.phone || body.telephone, 40) || null;
  var leadId = str(body.leadId || body.lead_id, 80) || null;
  var propertyId = str(body.propertyId || body.property_id, 80) || null;
  var firstName = str(body.firstName || body.first_name || body.prenom, 80) || null;
  var lastName = str(body.lastName || body.last_name || body.nom, 80) || null;
  var city = str(body.city || body.sellCity, 120) || null;
  var postal = str(body.postal_code || body.sellPostalCode, 5) || null;
  var propertyType = str(body.property_type || body.propertyType || body.sellPropertyType, 40) || "appartement";
  var titleHint = str(body.title, 180);

  try {
    var funnel = await recordFunnelEvent(sql, {
      leadId: leadId,
      event: "deposit_doc_draft",
      step: 1,
      step_total: 1,
      step_name: "property_draft",
      journey: "deposit",
      vertical: str(body.vertical || "vendeur_immo", 80) || "vendeur_immo",
      form_id: "acheteur-immo-deposit",
      source: "immo_listing_draft",
      email: email,
      phone: phone,
      clientIp: normalizeClientIp(req),
      partial_payload: {
        firstName: firstName,
        lastName: lastName,
        city: city,
        postal_code: postal,
        property_type: propertyType,
        draftFromUpload: true,
      },
    });
    leadId = funnel.leadId;

    var contactId = await ensureContactLinked(sql, {
      leadId: leadId,
      email: email,
      phone: phone,
      firstName: firstName,
      lastName: lastName,
      vertical: body.vertical || "vendeur_immo",
      source: "immo_listing_draft",
      autoFrom: "immo_listing_draft",
    });

    var store = require("../immo-properties-store");
    await store.ensureImmoSchema(sql);

    if (propertyId) {
      var byId = await sql`
        SELECT id, lead_id, owner_contact_id FROM crm_immo_properties WHERE id = ${propertyId} LIMIT 1
      `;
      if (!byId.length) propertyId = null;
      else if (byId[0].lead_id && leadId && byId[0].lead_id !== leadId) {
        /* autre lead — ne pas réutiliser */
        propertyId = null;
      }
    }

    if (!propertyId && leadId) {
      var existing = await sql`
        SELECT id, drive_folder_id FROM crm_immo_properties
        WHERE lead_id = ${leadId}
        ORDER BY created_at ASC
        LIMIT 1
      `;
      if (existing.length) propertyId = existing[0].id;
    }

    var title =
      titleHint ||
      ["Bien vendeur (brouillon)", city, postal].filter(Boolean).join(" · ") ||
      "Bien à vendre (brouillon)";

    /* Si le bien existe déjà : mise à jour légère sans recréer (évite courses). */
    if (propertyId) {
      try {
        await sql`
          UPDATE crm_immo_properties SET
            title = COALESCE(NULLIF(${title}, ''), title),
            city = COALESCE(${city}, city),
            postal_code = COALESCE(${postal}, postal_code),
            owner_contact_id = COALESCE(owner_contact_id, ${contactId || null}),
            lead_id = COALESCE(lead_id, ${leadId}),
            updated_at = NOW()
          WHERE id = ${propertyId}
        `;
      } catch (upErr) {
        console.warn("[immo-listing-draft] update prop", upErr.message);
      }
    } else {
      propertyId = await store.upsertProperty(
        sql,
        {
          title: title,
          property_type: propertyType,
          status: "prospection",
          listing_source: "manual",
          city: city,
          postal_code: postal,
          department: postal ? postal.slice(0, 2) : null,
          lead_id: leadId,
          owner_contact_id: contactId || null,
          notes: "Brouillon créé dès dépôt de pièce (avant envoi annonce).",
          metadata: {
            origin: "public_listing_draft",
            draft: true,
            role: "vendeur",
            createdFrom: "document_upload",
          },
        },
        null
      );
      /* Course : un autre draft a pu créer un bien pour le même lead → garder le plus ancien. */
      try {
        var twins = await sql`
          SELECT id FROM crm_immo_properties
          WHERE lead_id = ${leadId}
          ORDER BY created_at ASC
        `;
        if (twins.length > 1) {
          propertyId = twins[0].id;
        }
      } catch (e) {}
    }

    var ensured = null;
    try {
      var { ensurePropertyDriveFolders } = require("../immo-drive");
      ensured = await ensurePropertyDriveFolders(
        {
          id: propertyId,
          title: title,
          city: city,
          postal_code: postal,
          firstName: firstName || "",
          lastName: lastName || "",
        },
        {}
      );
      if (ensured && ensured.folderId) {
        await sql`
          UPDATE crm_immo_properties
          SET drive_folder_id = COALESCE(drive_folder_id, ${ensured.folderId}), updated_at = NOW()
          WHERE id = ${propertyId}
        `;
      }
    } catch (driveErr) {
      console.warn("[immo-listing-draft] drive", driveErr.message);
      ensured = null;
    }

    var driveFolderId = (ensured && ensured.folderId) || null;
    if (!driveFolderId) {
      try {
        var folderRows = await sql`
          SELECT drive_folder_id FROM crm_immo_properties WHERE id = ${propertyId} LIMIT 1
        `;
        if (folderRows.length) driveFolderId = folderRows[0].drive_folder_id || null;
      } catch (e) {}
    }
    var driveWebViewLink = (ensured && ensured.webViewLink) || null;
    if (driveFolderId && !driveWebViewLink) {
      try {
        const { resolveFolderWebLink } = require("../drive-share");
        var link = await resolveFolderWebLink(driveFolderId, { share: false });
        driveWebViewLink = (link && link.webViewLink) || null;
      } catch (e) {}
    }

    return res.status(200).json({
      ok: true,
      leadId: leadId,
      contactId: contactId || null,
      propertyId: propertyId,
      driveFolderId: driveFolderId,
      driveWebViewLink: driveWebViewLink,
      drivePath: ensured
        ? "Immo/" +
          new Date().getFullYear() +
          "/" +
          (ensured.prospectFolderName || "prospect") +
          "/" +
          (ensured.propIdFolderName || propertyId)
        : null,
      draft: true,
      existingDrive: !!(ensured && ensured.existing),
    });
  } catch (e) {
    console.error("[immo-listing-draft]", e);
    return res.status(500).json({ ok: false, error: e.message || "Erreur brouillon bien" });
  }
};
