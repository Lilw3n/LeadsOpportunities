const crypto = require("crypto");
const { buildProfileMetadata, mergeMeta } = require("./crm-profile-meta");

/**
 * Cree ou met a jour un contact CRM + demande + evenement depuis un lead site.
 */
async function ingestLeadToCrm(sql, body, leadId) {
  const email = body.email ? String(body.email).trim().toLowerCase() : null;
  if (!email) return null;

  const firstName = body.firstName || body.first_name || body.prenom || "Prospect";
  const lastName = body.lastName || body.last_name || body.nom || "";
  const phone = body.phone || body.telephone || null;

  const existing = await sql`
    SELECT id FROM crm_contacts
    WHERE LOWER(email) = ${email}
    LIMIT 1
  `;

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
    await sql`
      UPDATE crm_contacts SET
        first_name = COALESCE(${firstName}, first_name),
        last_name = COALESCE(${lastName}, last_name),
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
    UPDATE site_leads SET contact_id = ${contactId} WHERE id = ${leadId}
  `;

  try {
    const { ensureClientDriveFolders } = require("./drive-folders");
    await ensureClientDriveFolders(contactId);
  } catch (driveErr) {
    console.warn("[crm-ingest] drive folder", driveErr.message);
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
  });
  await sql`
    INSERT INTO crm_events (
      id, contact_id, event_type, title, description, event_date, status, priority, extra_data
    ) VALUES (
      ${evtId}, ${contactId}, 'note',
      ${"Nouveau lead web — " + (body.vertical || "demande")},
      ${JSON.stringify(body).slice(0, 2000)},
      ${new Date().toISOString().slice(0, 10)},
      'pending', ${body.leadScore >= 70 ? "high" : "medium"}, ${extra}
    )
  `;

  return contactId;
}

module.exports = { ingestLeadToCrm };
