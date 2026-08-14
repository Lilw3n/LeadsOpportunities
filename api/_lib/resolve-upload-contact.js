/**
 * Rattache un dépôt à un contact CRM — crée un prospect si l’e-mail est inconnu.
 */
const crypto = require("crypto");

async function resolveContact(sql, body) {
  const contactId = body.contactId || body.contact_id || null;
  if (contactId) {
    const rows = await sql`SELECT id, first_name, last_name, email FROM crm_contacts WHERE id = ${contactId} LIMIT 1`;
    if (rows.length) return rows[0];
  }
  const email = body.email ? String(body.email).trim().toLowerCase() : "";
  if (!email) return null;
  const contacts = await sql`
    SELECT id, first_name, last_name, email FROM crm_contacts WHERE LOWER(email) = ${email} LIMIT 1
  `;
  return contacts.length ? contacts[0] : null;
}

async function resolveOrCreateContact(sql, body) {
  const existing = await resolveContact(sql, body);
  if (existing) return { contact: existing, created: false };

  const email = body.email ? String(body.email).trim().toLowerCase() : "";
  if (!email || email.indexOf("@") < 0) return { contact: null, created: false };

  const id = "ct_" + crypto.randomUUID();
  const first = String(body.firstName || body.first_name || email.split("@")[0] || "Prospect").slice(0, 80);
  const last = String(body.lastName || body.last_name || "").slice(0, 80);
  const phone = body.phone ? String(body.phone).slice(0, 40) : null;

  try {
    await sql`
      INSERT INTO crm_contacts (
        id, contact_type, first_name, last_name, email, phone, status, source, last_activity_at
      ) VALUES (
        ${id}, 'prospect', ${first}, ${last}, ${email}, ${phone}, 'active', 'document_upload', NOW()
      )
    `;
  } catch (e) {
    const again = await sql`
      SELECT id, first_name, last_name, email FROM crm_contacts WHERE LOWER(email) = ${email} LIMIT 1
    `;
    if (again.length) return { contact: again[0], created: false };
    throw e;
  }

  try {
    const { ensureClientDriveFolders } = require("./drive-folders");
    ensureClientDriveFolders(id).catch(function (err) {
      console.warn("[upload-contact] drive folder", err.message);
    });
  } catch (e) {}

  return { contact: { id: id, first_name: first, last_name: last, email: email }, created: true };
}

module.exports = { resolveContact, resolveOrCreateContact };
