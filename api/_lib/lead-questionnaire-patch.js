/**
 * Patch admin questionnaire → site_leads.payload + sync fiche interlocuteur.
 * Les champs sell* alimentent aussi sellDossier et les critères de l'annonce liée.
 */
const crypto = require("crypto");
const { hydrateInterlocuteurFromLead } = require("./hydrate-interlocuteur");

function parsePayload(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function normalizePatch(obj) {
  var out = {};
  if (!obj || typeof obj !== "object") return out;
  Object.keys(obj).forEach(function (k) {
    if (k.indexOf("__") === 0) return;
    var v = obj[k];
    if (v === undefined) return;
    out[String(k).slice(0, 120)] = v == null ? "" : String(v).slice(0, 4000);
  });
  return out;
}

function mirrorSellIntoDossier(payload) {
  var sd =
    payload.sellDossier && typeof payload.sellDossier === "object" && !Array.isArray(payload.sellDossier)
      ? Object.assign({}, payload.sellDossier)
      : {};
  var touched = false;
  Object.keys(payload).forEach(function (k) {
    if (k.indexOf("sell") !== 0) return;
    if (k === "sellDossier" || k === "sellDossierSummary") return;
    sd[k] = payload[k];
    touched = true;
  });
  if (touched) payload.sellDossier = sd;
  return payload;
}

async function syncSellToLinkedProperties(sql, payload, leadId) {
  if (!sql || !leadId) return { synced: 0 };
  var AdLib;
  try {
    AdLib = require("../../js/immo-ad-listings-lib.js");
  } catch (e) {
    return { synced: 0, error: e.message };
  }
  var store;
  try {
    store = require("./immo-properties-store");
  } catch (e) {
    return { synced: 0, error: e.message };
  }

  var ids = [];
  if (Array.isArray(payload.propertyIds)) {
    payload.propertyIds.forEach(function (id) {
      if (id && ids.indexOf(String(id)) === -1) ids.push(String(id));
    });
  }
  try {
    var byLead = await sql`
      SELECT id FROM crm_immo_properties WHERE lead_id = ${leadId} LIMIT 20
    `;
    (byLead || []).forEach(function (r) {
      if (r.id && ids.indexOf(String(r.id)) === -1) ids.push(String(r.id));
    });
  } catch (e) {
    /* table may miss lead_id in edge envs */
  }
  if (!ids.length) return { synced: 0 };

  var fromSell = AdLib.sellDossierToCriteria(payload.sellDossier || payload);
  var synced = 0;
  for (var i = 0; i < ids.length; i++) {
    try {
      var rows = await sql`SELECT * FROM crm_immo_properties WHERE id = ${ids[i]} LIMIT 1`;
      if (!rows || !rows.length) continue;
      var prop = store.rowToProperty ? store.rowToProperty(rows[0]) : rows[0];
      var meta =
        typeof prop.metadata_json === "string"
          ? parsePayload(prop.metadata_json)
          : prop.metadata_json || prop.metadata || {};
      meta = Object.assign({}, meta);
      meta.sellDossier = Object.assign({}, meta.sellDossier || {}, payload.sellDossier || {});

      var bag = AdLib.getAdMeta(Object.assign({}, prop, { metadata: meta, metadata_json: meta }));
      var ch = AdLib.channelsOf(bag.ad);

      var form = {
        title: prop.title,
        headline: (meta.ad && meta.ad.headline) || prop.title,
        body: (meta.ad && meta.ad.body) || prop.description || "",
        description: prop.description || "",
        photos: prop.photos || prop.photos_json || (meta.ad && meta.ad.photos) || [],
        videos:
          fromSell.videos && fromSell.videos.length
            ? fromSell.videos
            : (meta.ad && meta.ad.videos) || [],
        virtual_tour: fromSell.virtual_tour || (meta.ad && meta.ad.virtual_tour) || "",
        channel_public: ch.indexOf("public") !== -1,
        channel_private: ch.indexOf("private") !== -1 || ch.length === 0,
        platforms: (meta.ad && meta.ad.platforms) || ["Meta", "Google", "Leboncoin"],
        demo_label: (meta.ad && meta.ad.demo_label) || "Capacité de diffusion",
        access_emails: (meta.ad && meta.ad.access && meta.ad.access.emails) || [],
        access_phones: (meta.ad && meta.ad.access && meta.ad.access.phones) || [],
        city: fromSell.city || prop.city,
        postal_code: fromSell.postal_code || prop.postal_code,
        property_type: fromSell.property_type || prop.property_type,
        rooms: fromSell.rooms != null ? fromSell.rooms : prop.rooms,
        bedrooms: fromSell.bedrooms != null ? fromSell.bedrooms : prop.bedrooms,
        surface_m2: fromSell.surface_m2 != null ? fromSell.surface_m2 : prop.surface_m2,
        floor: fromSell.floor || prop.floor,
        heating: fromSell.heating,
        dpe: fromSell.dpe || prop.dpe,
        ges: fromSell.ges || prop.ges,
        energy_cost: fromSell.energy_cost,
        charges: fromSell.charges,
        year_built: fromSell.year_built,
        furnished: fromSell.furnished === true,
        has_elevator: fromSell.has_elevator === true,
        has_garage: fromSell.has_garage === true,
        has_parking: fromSell.has_parking === true,
        has_cave: fromSell.has_cave === true,
        has_garden: fromSell.has_garden === true,
        has_terrace: fromSell.has_terrace === true,
        has_balcony: fromSell.has_balcony === true,
        status: prop.status,
        price_fai: prop.price_fai,
      };

      var merged = AdLib.applyAdToProperty(
        Object.assign({}, prop, { metadata: meta, metadata_json: meta }),
        form
      );
      var crit = merged.metadata.ad.criteria || {};
      [
        "has_elevator",
        "has_garage",
        "has_parking",
        "has_cave",
        "has_garden",
        "has_terrace",
        "has_balcony",
        "furnished",
      ].forEach(function (k) {
        if (fromSell[k] == null && bag.ad.criteria && bag.ad.criteria[k] != null) {
          crit[k] = bag.ad.criteria[k];
        } else if (fromSell[k] == null) {
          delete crit[k];
        }
      });
      merged.metadata.ad.criteria = crit;
      merged.metadata.sellDossier = meta.sellDossier;
      if (fromSell.has_elevator == null) merged.has_elevator = prop.has_elevator;
      if (fromSell.has_garage == null) merged.has_garage = prop.has_garage;
      if (fromSell.has_parking == null) merged.has_parking = prop.has_parking;
      if (fromSell.has_cave == null) merged.has_cave = prop.has_cave;
      if (fromSell.has_garden == null) merged.has_garden = prop.has_garden;
      if (fromSell.has_terrace == null) merged.has_terrace = prop.has_terrace;
      if (fromSell.has_balcony == null) merged.has_balcony = prop.has_balcony;

      await store.upsertProperty(sql, merged, null);
      synced++;
    } catch (e) {
      console.warn("[lead-questionnaire-patch] sync property", ids[i], e && e.message);
    }
  }
  return { synced: synced };
}

async function patchLeadQuestionnaire(sql, opts) {
  opts = opts || {};
  var leadId = opts.leadId;
  if (!leadId || !sql) return { ok: false, error: "leadId requis" };

  var rows = await sql`
    SELECT id, email, phone, vertical, payload, contact_id
    FROM site_leads WHERE id = ${leadId} LIMIT 1
  `;
  if (!rows.length) return { ok: false, error: "Lead introuvable" };
  var lead = rows[0];
  var payload = parsePayload(lead.payload);
  var patch = normalizePatch(opts.payloadPatch || opts.fields || {});
  var fieldComments = opts.fieldComments && typeof opts.fieldComments === "object" ? opts.fieldComments : {};
  var adminNotes =
    opts.adminQuestionnaireNotes != null
      ? String(opts.adminQuestionnaireNotes).slice(0, 8000)
      : opts.adminComment != null
        ? String(opts.adminComment).slice(0, 8000)
        : undefined;

  var adminEdits = Array.isArray(payload.adminEdits) ? payload.adminEdits.slice() : [];
  var now = new Date().toISOString();
  var editorId = opts.user && opts.user.id ? opts.user.id : null;

  Object.keys(patch).forEach(function (key) {
    var prev = payload[key];
    if (String(prev == null ? "" : prev) === String(patch[key])) return;
    adminEdits.push({
      field: key,
      previous: prev == null ? "" : String(prev),
      value: patch[key],
      by: editorId,
      at: now,
    });
    payload[key] = patch[key];
  });

  mirrorSellIntoDossier(payload);

  if (Object.keys(fieldComments).length) {
    payload.adminFieldComments = Object.assign({}, payload.adminFieldComments || {}, fieldComments);
  }
  if (adminNotes !== undefined) {
    payload.adminQuestionnaireNotes = adminNotes;
  }
  if (adminEdits.length) {
    payload.adminEdits = adminEdits.slice(-80);
    payload.adminEditedAt = now;
    payload.adminEditedBy = editorId;
  }

  var email = lead.email;
  var phone = lead.phone;
  if (Object.prototype.hasOwnProperty.call(patch, "email")) {
    email = String(patch.email || "")
      .trim()
      .toLowerCase()
      .slice(0, 320);
  }
  if (Object.prototype.hasOwnProperty.call(patch, "phone") || Object.prototype.hasOwnProperty.call(patch, "telephone")) {
    phone = String(patch.phone || patch.telephone || "")
      .trim()
      .slice(0, 40);
  }

  await sql`
    UPDATE site_leads SET
      payload = ${JSON.stringify(payload)},
      email = ${email || null},
      phone = ${phone || null},
      updated_at = NOW(),
      last_activity_at = NOW()
    WHERE id = ${leadId}
  `;

  var contactId = lead.contact_id || opts.contactId || null;
  var syncContact = opts.syncContact !== false;
  var hydrated = null;

  if (syncContact && contactId) {
    try {
      var leadForHydrate = Object.assign({}, lead, {
        email: email || lead.email,
        phone: phone || lead.phone,
        payload: JSON.stringify(payload),
      });
      hydrated = await hydrateInterlocuteurFromLead(sql, opts.user || null, leadForHydrate, contactId);
    } catch (e) {
      console.warn("[lead-questionnaire-patch] hydrate", e.message);
    }
  }

  var propSync = { synced: 0 };
  try {
    propSync = await syncSellToLinkedProperties(sql, payload, leadId);
  } catch (e) {
    console.warn("[lead-questionnaire-patch] property sync", e.message);
  }

  if (contactId && adminNotes) {
    try {
      var actId = "act_" + crypto.randomUUID();
      await sql`
        INSERT INTO crm_activities (id, contact_id, lead_id, user_id, activity_type, title, body)
        VALUES (
          ${actId}, ${contactId}, ${leadId}, ${editorId},
          'note', ${"Commentaire admin — questionnaire"},
          ${JSON.stringify({ adminQuestionnaireNotes: adminNotes, source: "questionnaire_edit" })}
        )
      `;
    } catch (e) {
      console.warn("[lead-questionnaire-patch] activity", e.message);
    }
  }

  return {
    ok: true,
    leadId: leadId,
    contactId: contactId,
    payload: payload,
    dossierFilled: hydrated && hydrated.dossierFilled,
    syncedInterlocuteur: !!hydrated,
    syncedProperties: propSync.synced || 0,
  };
}

module.exports = {
  patchLeadQuestionnaire,
  parsePayload,
  normalizePatch,
  mirrorSellIntoDossier,
  syncSellToLinkedProperties,
};
