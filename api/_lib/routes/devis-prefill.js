const { applyApiGuards } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");

function parseMeta(raw) {
  if (!raw) return {};
  try {
    return typeof raw === "string" ? JSON.parse(raw) : raw;
  } catch (e) {
    return {};
  }
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  const url = new URL(req.url, "http://localhost");
  const contactId = url.searchParams.get("contactId");
  if (!contactId) return res.status(400).json({ error: "contactId requis" });

  const scope = contactScopeFilter(user);

  try {
    const rows = await sql`
      SELECT * FROM crm_contacts
      WHERE id = ${contactId}
        AND (${scope}::text IS NULL OR assigned_to = ${scope})
      LIMIT 1
    `;
    if (!rows.length) return res.status(404).json({ error: "Contact introuvable" });

    const c = rows[0];
    const meta = parseMeta(c.metadata);
    const company = meta.company || {};
    const family = meta.family || {};

    const vehicles = await sql`
      SELECT brand, model, registration, year, vehicle_type
      FROM crm_vehicles WHERE contact_id = ${contactId}
      ORDER BY updated_at DESC LIMIT 1
    `;
    const v = vehicles[0] || {};

    const extracted = {
      customer: {
        fullName: ((c.first_name || "") + " " + (c.last_name || "")).trim(),
        email: c.email,
        phone: c.phone,
        address: meta.address || family.address || "",
      },
      vehicle: {
        brand: v.brand || "",
        model: v.model || "",
        registration: v.registration || "",
        year: v.year ? String(v.year) : "",
      },
      company: {
        name: c.company || company.name || "",
        siret: company.siret || "",
        activity: company.activity || "",
      },
      profileKey: meta.profileKey || null,
      primaryNeed: meta.primaryNeed || null,
    };

    const flat = {
      "customer.fullName": extracted.customer.fullName,
      "customer.email": extracted.customer.email,
      "customer.phone": extracted.customer.phone,
      "vehicle.brand": extracted.vehicle.brand,
      "vehicle.model": extracted.vehicle.model,
      "vehicle.registration": extracted.vehicle.registration,
      "company.name": extracted.company.name,
      "company.siret": extracted.company.siret,
    };

    const fields = Object.keys(flat).map(function (key) {
      var value = flat[key];
      return { key: key, value: value, hasValue: !!(value && String(value).trim()) };
    });

    return res.status(200).json({
      ok: true,
      contactId: contactId,
      data: {
        extracted: extracted,
        fieldStatus: {
          known: fields.filter(function (f) {
            return f.hasValue;
          }),
          missing: fields.filter(function (f) {
            return !f.hasValue;
          }),
          all: fields,
        },
      },
    });
  } catch (e) {
    console.error("[devis/prefill]", e);
    return res.status(500).json({ error: "Erreur serveur" });
  }
};
