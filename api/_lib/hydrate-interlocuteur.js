/**
 * Remplit la fiche interlocuteur depuis le payload questionnaire :
 * metadata.dossier, entreprise, famille, véhicule, événement, Slack.
 */
const crypto = require("crypto");
const Dossier = require("../../js/interlocuteur-dossier-lib");
const Validation = require("../../js/questionnaire-field-validation-lib");

function appBase() {
  return (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.leadsopportunities.fr"
  ).replace(/\/$/, "");
}

function parseMeta(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

async function notifyInterlocuteurSlack(dossier, contactId) {
  const { sendSlackText } = require("./slack-notify");
  var base = appBase();
  var text = Dossier.slackLines(dossier, {
    contactUrl: base + "/crm-contact.html?id=" + encodeURIComponent(contactId),
    eventsUrl: base + "/crm-event-manager.html",
  });
  return sendSlackText(text);
}

async function insertQuestionnaireEvent(sql, contactId, userId, lead, dossier) {
  var title = "Questionnaire repris sur la fiche interlocuteur";
  var p = dossier.raw || {};
  var produit = Dossier.first(p, ["need", "serviceNeed", "serviceLabel", "vertical"]) || lead.vertical || "";
  var desc = [
    produit ? "Produit : " + produit : "",
    lead.email ? "Email : " + lead.email : "",
    lead.phone ? "Tél : " + lead.phone : "",
    "Lead " + lead.id,
  ]
    .filter(Boolean)
    .join("\n");
  var evtId = "evt_" + crypto.randomUUID();
  var extra = JSON.stringify({
    source: "questionnaire",
    leadId: lead.id,
    interlocutors: [{ role: "client", name: Dossier.first(p, ["firstName", "first_name"]) || "Client", contactId: contactId }],
  });
  try {
    const existing = await sql`
      SELECT id FROM crm_events
      WHERE contact_id = ${contactId} AND description LIKE ${"%" + lead.id + "%"}
      LIMIT 1
    `;
    if (existing.length) return existing[0].id;
    await sql`
      INSERT INTO crm_events (
        id, contact_id, event_type, title, description, event_date, event_time,
        status, priority, user_id, extra_data
      ) VALUES (
        ${evtId}, ${contactId}, 'note', ${title}, ${desc},
        ${new Date().toISOString().slice(0, 10)}, NULL,
        'completed', 'medium', ${userId || null}, ${extra}
      )
    `;
  } catch (e) {
    console.warn("[hydrate-interlocuteur] event", e.message);
  }
  return evtId;
}

async function insertVehicleIfNeeded(sql, contactId, vehicle) {
  if (!vehicle || !vehicle.registration) return null;
  try {
    const existing = await sql`
      SELECT id FROM crm_vehicles
      WHERE contact_id = ${contactId} AND registration = ${vehicle.registration}
      LIMIT 1
    `;
    if (existing.length) return existing[0].id;
    var id = "veh_" + crypto.randomUUID();
    var year = vehicle.year ? parseInt(vehicle.year, 10) : null;
    if (!Number.isFinite(year)) year = null;
    await sql`
      INSERT INTO crm_vehicles (
        id, contact_id, registration, brand, model, year, vehicle_type, status
      ) VALUES (
        ${id}, ${contactId},
        ${vehicle.registration}, ${vehicle.brand || null}, ${vehicle.model || null},
        ${year}, ${vehicle.vehicle_type || "Voiture particuliere"}, ${vehicle.status || "Actif"}
      )
    `;
    return id;
  } catch (e) {
    console.warn("[hydrate-interlocuteur] vehicle", e.message);
    return null;
  }
}

async function hydrateInterlocuteurFromLead(sql, user, lead, contactId) {
  var rawPayload = Validation.parsePayload(lead && lead.payload);
  var effectivePayload = Validation.getEffectivePayload(rawPayload);
  var leadEffective = Object.assign({}, lead, { payload: JSON.stringify(effectivePayload) });
  const dossier = Dossier.buildDossier(leadEffective);
  const patches = Dossier.patchesFromDossier(dossier);
  const rows = await sql`SELECT metadata, first_name, last_name, email, phone, company FROM crm_contacts WHERE id = ${contactId} LIMIT 1`;
  const current = rows[0] || {};
  const meta = parseMeta(current.metadata);
  const alreadyHydrated = !!(meta.dossier && meta.dossier.leadId);
  meta.dossier = {
    perso: dossier.perso,
    pro: dossier.pro,
    biens: dossier.biens,
    projet: dossier.projet,
    leadId: lead.id,
    filledAt: new Date().toISOString(),
  };
  meta.interlocuteur = true;
  if (patches.company && (patches.company.name || patches.company.siret)) {
    meta.company = Object.assign({}, meta.company || {}, patches.company);
  }
  if (patches.family) {
    meta.family = Object.assign({}, meta.family || {}, patches.family);
    if (patches.family.emergencyContact) {
      meta.family.emergencyContact = Object.assign(
        {},
        (meta.family && meta.family.emergencyContact) || {},
        patches.family.emergencyContact
      );
    }
  }
  if (patches.immo) meta.immo = Object.assign({}, meta.immo || {}, patches.immo);

  const firstName = patches.firstName || current.first_name || null;
  const lastName = patches.lastName || current.last_name || null;
  const email = patches.email || current.email || lead.email || null;
  const phone = patches.phone || current.phone || lead.phone || null;
  const companyName = (patches.company && patches.company.name) || current.company || null;

  await sql`
    UPDATE crm_contacts SET
      first_name = ${firstName},
      last_name = ${lastName},
      email = ${email},
      phone = ${phone},
      company = ${companyName},
      metadata = ${JSON.stringify(meta)},
      updated_at = NOW(),
      last_activity_at = NOW()
    WHERE id = ${contactId}
  `;

  await insertQuestionnaireEvent(sql, contactId, user && user.id, lead, dossier);
  await insertVehicleIfNeeded(sql, contactId, patches.vehicle);

  var slack = { ok: false, skipped: alreadyHydrated };
  if (!alreadyHydrated) {
    try {
      slack = await notifyInterlocuteurSlack(dossier, contactId);
    } catch (e) {
      slack = { ok: false, error: e.message };
    }
  }

  return {
    ok: true,
    contactId: contactId,
    dossierFilled: Dossier.countFilled(dossier),
    slack: slack,
  };
}

module.exports = {
  hydrateInterlocuteurFromLead,
  notifyInterlocuteurSlack,
  parseMeta,
};
