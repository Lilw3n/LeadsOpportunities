const crypto = require("crypto");
const { buildProfileMetadata, mergeMeta } = require("./crm-profile-meta");
const { hydrateInterlocuteurFromLead } = require("./hydrate-interlocuteur");

function phoneDigits(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function flattenLeadBody(body) {
  if (!body || typeof body !== "object") return {};
  if (body.payload && typeof body.payload === "object" && !Array.isArray(body.payload)) {
    var merged = Object.assign({}, body, body.payload);
    delete merged.payload;
    return merged;
  }
  return Object.assign({}, body);
}

function leadEventSummaryText(body) {
  var p = flattenLeadBody(body);
  var parts = [];
  var name = [p.firstName || p.first_name, p.lastName || p.last_name].filter(Boolean).join(" ");
  if (name) parts.push(name);
  if (p.email) parts.push(String(p.email));
  var phone = p.phone || p.sellerPhone;
  if (phone) parts.push(String(phone));
  var city = p.city || p.sellCity;
  var postal = p.postal_code || p.sellPostalCode || p.postalCode;
  if (city) parts.push(city + (postal ? " (" + postal + ")" : ""));
  if (p.sellerName && p.sellerName !== name) parts.push("vendeur annonce : " + p.sellerName);
  if (p.sellerKind) parts.push(p.sellerKind);
  if (p.vertical || p.need) parts.push(String(p.vertical || p.need));
  if (p.leadScore != null) parts.push("score " + p.leadScore);
  if (Array.isArray(p.propertyIds) && p.propertyIds.length) parts.push(p.propertyIds.length + " bien(s)");
  return parts.join(" · ").slice(0, 480) || "Lead web — " + (body.vertical || "demande");
}

async function findExistingContact(sql, email, phone) {
  if (email) {
    const byEmail = await sql`
      SELECT id FROM crm_contacts
      WHERE LOWER(email) = ${email}
      LIMIT 1
    `;
    if (byEmail.length) return byEmail[0].id;
  }
  var digits = phoneDigits(phone);
  if (digits.length >= 10) {
    var tail = digits.slice(-10);
    const byPhone = await sql`
      SELECT id FROM crm_contacts
      WHERE phone IS NOT NULL
        AND REPLACE(REPLACE(REPLACE(REPLACE(phone, ' ', ''), '.', ''), '-', ''), '+33', '0') LIKE ${"%" + tail}
      LIMIT 1
    `;
    if (byPhone.length) return byPhone[0].id;
  }
  return null;
}

async function linkPropertiesToContact(sql, contactId, propertyIds, leadId) {
  if (!sql || !contactId || !Array.isArray(propertyIds) || !propertyIds.length) return;
  for (var i = 0; i < propertyIds.length; i++) {
    var pid = propertyIds[i];
    if (!pid) continue;
    try {
      await sql`
        UPDATE crm_immo_properties SET
          owner_contact_id = COALESCE(owner_contact_id, ${contactId}),
          lead_id = COALESCE(lead_id, ${leadId || null}),
          updated_at = NOW()
        WHERE id = ${pid}
      `;
    } catch (e) {
      console.warn("[crm-ingest] link property", pid, e.message);
    }
  }
}

function buildLeadRow(body, leadId, email, phone) {
  var payload = body.payload;
  if (payload && typeof payload !== "string") {
    try {
      payload = JSON.stringify(payload);
    } catch (e) {
      payload = "{}";
    }
  }
  if (!payload) {
    try {
      payload = JSON.stringify(body);
    } catch (e2) {
      payload = "{}";
    }
  }
  return {
    id: leadId,
    email: email || body.email || null,
    phone: phone || body.phone || body.telephone || null,
    vertical: body.vertical || body.need || "",
    payload: payload,
  };
}

/**
 * Cree ou met a jour un contact CRM + demande + evenement depuis un lead site.
 * Options : { hydrate, leadRow, propertyIds }
 */
async function ingestLeadToCrm(sql, body, leadId, options) {
  options = options || {};
  const email = body.email ? String(body.email).trim().toLowerCase() : null;
  const phone = body.phone || body.telephone || null;
  if (!email && !phone) return null;

  const firstName = body.firstName || body.first_name || body.prenom || "Prospect";
  const lastName = body.lastName || body.last_name || body.nom || "";

  var existingId = await findExistingContact(sql, email, phone);
  const existing = existingId ? [{ id: existingId }] : [];

  let contactId;
  if (existing.length) {
    contactId = existing[0].id;
    const cur = await sql`SELECT metadata FROM crm_contacts WHERE id = ${contactId} LIMIT 1`;
    let meta = {};
    try {
      meta = cur[0]?.metadata ? JSON.parse(cur[0].metadata) : {};
    } catch (e) {}
    meta = mergeMeta(meta, buildProfileMetadata(body));
    if (body.confirmByEmail !== false && body.confirmByEmail !== "0") meta.confirmByEmail = true;
    if (body.confirmByPhone === true || body.confirmByPhone === "1") {
      meta.confirmByPhone = true;
      meta.pendingPhoneConfirm = true;
    }
    if (meta.interlocuteur !== true) meta.interlocuteur = true;
    await sql`
      UPDATE crm_contacts SET
        contact_type = 'prospect',
        first_name = COALESCE(${firstName}, first_name),
        last_name = COALESCE(${lastName}, last_name),
        email = COALESCE(${email}, email),
        phone = COALESCE(${phone}, phone),
        metadata = ${JSON.stringify(meta)},
        last_activity_at = NOW(),
        updated_at = NOW()
      WHERE id = ${contactId}
    `;
  } else {
    contactId = "ct_" + crypto.randomUUID();
      const profileMeta = buildProfileMetadata(body);
      if (body.confirmByEmail !== false && body.confirmByEmail !== "0") profileMeta.confirmByEmail = true;
      if (body.confirmByPhone === true || body.confirmByPhone === "1") {
        profileMeta.confirmByPhone = true;
        profileMeta.pendingPhoneConfirm = true;
      }
      profileMeta.interlocuteur = true;
      await sql`
        INSERT INTO crm_contacts (
          id, contact_type, first_name, last_name, email, phone,
          status, source, notes, metadata, last_activity_at
        ) VALUES (
          ${contactId}, 'prospect', ${firstName}, ${lastName}, ${email}, ${phone},
          'active', ${body.source || "site_lead"},
          ${"Lead " + (body.vertical || "") + " #" + leadId},
          ${JSON.stringify(profileMeta)},
          NOW()
        )
      `;
  }

  await sql`
    UPDATE site_leads SET contact_id = ${contactId}, updated_at = NOW() WHERE id = ${leadId}
  `;

  try {
    const { ensureClientDriveFolders } = require("./drive-folders");
    await ensureClientDriveFolders(contactId);
  } catch (driveErr) {
    console.warn("[crm-ingest] drive folder", driveErr.message);
  }

  await linkPropertiesToContact(sql, contactId, options.propertyIds || body.propertyIds, leadId);

  var shouldHydrate = options.hydrate !== false && (email || phone);
  if (shouldHydrate && leadId) {
    try {
      var leadRow = options.leadRow || buildLeadRow(body, leadId, email, phone);
      await hydrateInterlocuteurFromLead(sql, null, leadRow, contactId);
    } catch (hydrateErr) {
      console.warn("[crm-ingest] hydrate interlocuteur", hydrateErr.message);
    }
  }

  const reqId = "req_" + crypto.randomUUID();
  const vertical = body.vertical || body.need || "";
  const skipInsurance =
    vertical === "vendeur_immo" ||
    vertical === "acheteur_vendeur_immo" ||
    vertical === "acheteur-immo" ||
    vertical === "vendeur-immo" ||
    String(body.source || "").indexOf("listing") >= 0;
  if (!skipInsurance) {
    await sql`
    INSERT INTO crm_insurance_requests (
      id, contact_id, request_type, status, requested_date, description, priority
    ) VALUES (
      ${reqId}, ${contactId}, 'devis', 'En attente',
      ${new Date().toISOString().slice(0, 10)},
      ${"Lead site — " + (body.vertical || body.serviceLabel || "assurance")},
      ${body.leadScore >= 70 ? "Haute" : "Moyenne"}
    )
  `;
  }

  const evtId = "evt_" + crypto.randomUUID();
  const extra = JSON.stringify({
    participants: [{ name: (firstName + " " + lastName).trim(), role: "recipient" }],
    leadId: leadId,
    leadSnapshot: body,
  });
  await sql`
    INSERT INTO crm_events (
      id, contact_id, event_type, title, description, event_date, status, priority, extra_data
    ) VALUES (
      ${evtId}, ${contactId}, 'note',
      ${"Nouveau lead web — " + (body.vertical || "demande")},
      ${leadEventSummaryText(body)},
      ${new Date().toISOString().slice(0, 10)},
      'pending', ${body.leadScore >= 70 ? "high" : "medium"}, ${extra}
    )
  `;

  return contactId;
}

function isPlaceholderNamePart(s) {
  var v = String(s || "").trim().toLowerCase();
  if (!v) return true;
  return (
    v === "dossier" ||
    v === "provisoire" ||
    v === "prospect" ||
    v === "client" ||
    v === "admin" ||
    v === "controle" ||
    v === "contrôle"
  );
}

function pickPersonName(incoming, current) {
  var inc = String(incoming || "").trim();
  var cur = String(current || "").trim();
  if (inc && !isPlaceholderNamePart(inc)) return inc;
  if (cur && !isPlaceholderNamePart(cur)) return cur;
  if (inc) return inc;
  return cur;
}

/**
 * Crée / lie un contact CRM pour uploads et autosave.
 * Sans e-mail / tél / nom : fiche « Dossier provisoire » (renommée à la MAJ).
 */
async function ensureContactLinked(sql, opts) {
  opts = opts || {};
  var leadId = opts.leadId || null;
  var email = opts.email ? String(opts.email).trim().toLowerCase() : null;
  if (!email) email = null;
  var phone = opts.phone || opts.telephone || null;
  if (!phone) phone = null;
  var firstNameEarly = String(opts.firstName || opts.first_name || opts.prenom || "").trim();
  var lastNameEarly = String(opts.lastName || opts.last_name || opts.nom || "").trim();
  var docsSessionId = opts.docsSessionId
    ? String(opts.docsSessionId)
        .trim()
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .slice(0, 80)
    : "";
  var forcedId = opts.contactId || opts.contact_id || null;
  if (forcedId) forcedId = String(forcedId).trim().slice(0, 80);
  var allowProvisional = opts.allowProvisional === true || !!docsSessionId || !!forcedId;
  if (!email && !phone && !leadId && !(firstNameEarly && lastNameEarly) && !allowProvisional) return null;

  var existingId = null;

  if (forcedId) {
    try {
      var forced = await sql`SELECT id FROM crm_contacts WHERE id = ${forcedId} LIMIT 1`;
      if (forced.length) existingId = forced[0].id;
    } catch (e) {}
  }

  if (!existingId && docsSessionId) {
    try {
      var like = '%"docsSessionId":"' + docsSessionId + '"%';
      var bySess = await sql`
        SELECT id FROM crm_contacts
        WHERE metadata IS NOT NULL
          AND (
            metadata->>'docsSessionId' = ${docsSessionId}
            OR metadata::text LIKE ${like}
          )
        ORDER BY updated_at DESC NULLS LAST
        LIMIT 1
      `;
      if (bySess.length) existingId = bySess[0].id;
    } catch (e) {
      console.warn("[ensureContactLinked] docsSession", e.message);
    }
  }

  if (leadId) {
    try {
      var leads = await sql`
        SELECT id, contact_id, email, phone, payload, vertical, source
        FROM site_leads WHERE id = ${leadId} LIMIT 1
      `;
      if (leads.length) {
        var lead = leads[0];
        if (!existingId && lead.contact_id) {
          var linked = await sql`
            SELECT id FROM crm_contacts WHERE id = ${lead.contact_id} LIMIT 1
          `;
          if (linked.length) existingId = linked[0].id;
        }
        if (!email && lead.email) email = String(lead.email).trim().toLowerCase();
        if (!phone && lead.phone) phone = lead.phone;
        if (!firstNameEarly && !lastNameEarly && lead.payload) {
          try {
            var p =
              typeof lead.payload === "string" ? JSON.parse(lead.payload || "{}") : lead.payload || {};
            firstNameEarly = String(p.firstName || p.first_name || p.prenom || "").trim();
            lastNameEarly = String(p.lastName || p.last_name || p.nom || "").trim();
            opts.vertical = opts.vertical || lead.vertical || p.vertical || null;
            opts.source = opts.source || lead.source || null;
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn("[ensureContactLinked] lead lookup", e.message);
    }
  }

  if (!existingId) {
    existingId = await findExistingContact(sql, email, phone);
  }

  var contactId = existingId;
  var hasRealName =
    firstNameEarly &&
    lastNameEarly &&
    !isPlaceholderNamePart(firstNameEarly) &&
    !isPlaceholderNamePart(lastNameEarly);
  var isProvisional = !email && !phone && !hasRealName;
  var firstName = firstNameEarly || (isProvisional ? "Dossier" : "Prospect");
  var lastName = lastNameEarly || (isProvisional ? "provisoire" : "");

  if (!contactId) {
    contactId = "ct_" + crypto.randomUUID();
    var meta = {
      interlocuteur: true,
      provisional: isProvisional,
      leadId: leadId || null,
      docsSessionId: docsSessionId || null,
      autoFrom: opts.autoFrom || "ensure_contact_linked",
    };
    await sql`
      INSERT INTO crm_contacts (
        id, contact_type, first_name, last_name, email, phone,
        status, source, notes, metadata, last_activity_at
      ) VALUES (
        ${contactId}, 'prospect', ${firstName}, ${lastName}, ${email}, ${phone},
        'active', ${opts.source || "site_progress"},
        ${leadId ? "Dossier progressif #" + leadId : "Dossier provisoire (pièces)"},
        ${JSON.stringify(meta)},
        NOW()
      )
    `;
  } else {
    var cur = await sql`
      SELECT first_name, last_name, metadata FROM crm_contacts WHERE id = ${contactId} LIMIT 1
    `;
    var curFirst = cur.length ? cur[0].first_name : "";
    var curLast = cur.length ? cur[0].last_name : "";
    var nextFirst = pickPersonName(firstNameEarly, curFirst) || firstName;
    var nextLast = pickPersonName(lastNameEarly, curLast) || lastName;
    var metaObj = {};
    try {
      var raw = cur.length ? cur[0].metadata : null;
      metaObj = typeof raw === "string" ? JSON.parse(raw || "{}") : Object.assign({}, raw || {});
    } catch (e) {
      metaObj = {};
    }
    if (docsSessionId) metaObj.docsSessionId = docsSessionId;
    if (leadId) metaObj.leadId = metaObj.leadId || leadId;
    if (email || phone || hasRealName) metaObj.provisional = false;
    await sql`
      UPDATE crm_contacts SET
        first_name = ${nextFirst},
        last_name = ${nextLast},
        email = COALESCE(${email}, email),
        phone = COALESCE(${phone}, phone),
        metadata = ${JSON.stringify(metaObj)},
        last_activity_at = NOW(),
        updated_at = NOW()
      WHERE id = ${contactId}
    `;
  }

  if (leadId) {
    await sql`
      UPDATE site_leads SET
        contact_id = COALESCE(contact_id, ${contactId}),
        email = COALESCE(email, ${email}),
        phone = COALESCE(phone, ${phone}),
        updated_at = NOW()
      WHERE id = ${leadId}
    `;
  }

  try {
    const drive = require("./drive-folders");
    await drive.ensureClientDriveFolders(contactId);
    if (typeof drive.maybeRenamePersonFolder === "function") {
      await drive.maybeRenamePersonFolder(contactId);
    }
  } catch (driveErr) {
    console.warn("[ensureContactLinked] drive folder", driveErr.message);
  }

  return contactId;
}

module.exports = {
  ingestLeadToCrm,
  linkPropertiesToContact,
  findExistingContact,
  ensureContactLinked,
};
