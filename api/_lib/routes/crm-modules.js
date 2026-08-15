const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, contactScopeFilter } = require("../rbac");
const { getSql } = require("../db");
const {
  RESOURCES,
  pickBody,
  assertContactAccess,
  touchContact,
  newId,
} = require("../crm-modules-lib");
const Interlocutors = require("../../../js/crm-dossier-interlocutors");

async function listForContact(sql, resource, contactId, scope) {
  if (resource === "events") {
    return sql`
      SELECT m.* FROM crm_events m
      INNER JOIN crm_contacts c ON c.id = m.contact_id
      WHERE m.contact_id = ${contactId}
        AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
      ORDER BY m.event_date DESC NULLS LAST, m.created_at DESC
    `;
  }
  if (resource === "claims") {
    return sql`
      SELECT m.* FROM crm_claims m
      INNER JOIN crm_contacts c ON c.id = m.contact_id
      WHERE m.contact_id = ${contactId}
        AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
      ORDER BY m.created_at DESC
    `;
  }
  if (resource === "vehicles") {
    return sql`
      SELECT m.* FROM crm_vehicles m
      INNER JOIN crm_contacts c ON c.id = m.contact_id
      WHERE m.contact_id = ${contactId}
        AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
      ORDER BY m.created_at DESC
    `;
  }
  if (resource === "drivers") {
    return sql`
      SELECT m.* FROM crm_drivers m
      INNER JOIN crm_contacts c ON c.id = m.contact_id
      WHERE m.contact_id = ${contactId}
        AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
      ORDER BY m.created_at DESC
    `;
  }
  if (resource === "contracts") {
    return sql`
      SELECT m.* FROM crm_contracts m
      INNER JOIN crm_contacts c ON c.id = m.contact_id
      WHERE m.contact_id = ${contactId}
        AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
      ORDER BY m.created_at DESC
    `;
  }
  if (resource === "insurance-requests") {
    return sql`
      SELECT m.* FROM crm_insurance_requests m
      INNER JOIN crm_contacts c ON c.id = m.contact_id
      WHERE m.contact_id = ${contactId}
        AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
      ORDER BY m.created_at DESC
    `;
  }
  return [];
}

async function getOne(sql, resource, itemId, scope) {
  if (resource === "events") {
    return sql`
      SELECT m.* FROM crm_events m
      INNER JOIN crm_contacts c ON c.id = m.contact_id
      WHERE m.id = ${itemId} AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
      LIMIT 1
    `;
  }
  if (resource === "claims") {
    return sql`
      SELECT m.* FROM crm_claims m
      INNER JOIN crm_contacts c ON c.id = m.contact_id
      WHERE m.id = ${itemId} AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
      LIMIT 1
    `;
  }
  if (resource === "vehicles") {
    return sql`
      SELECT m.* FROM crm_vehicles m
      INNER JOIN crm_contacts c ON c.id = m.contact_id
      WHERE m.id = ${itemId} AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
      LIMIT 1
    `;
  }
  if (resource === "drivers") {
    return sql`
      SELECT m.* FROM crm_drivers m
      INNER JOIN crm_contacts c ON c.id = m.contact_id
      WHERE m.id = ${itemId} AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
      LIMIT 1
    `;
  }
  if (resource === "contracts") {
    return sql`
      SELECT m.* FROM crm_contracts m
      INNER JOIN crm_contacts c ON c.id = m.contact_id
      WHERE m.id = ${itemId} AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
      LIMIT 1
    `;
  }
  if (resource === "insurance-requests") {
    return sql`
      SELECT m.* FROM crm_insurance_requests m
      INNER JOIN crm_contacts c ON c.id = m.contact_id
      WHERE m.id = ${itemId} AND (${scope}::text IS NULL OR c.assigned_to = ${scope})
      LIMIT 1
    `;
  }
  return [];
}

async function selectById(sql, resource, id) {
  if (resource === "events") return sql`SELECT * FROM crm_events WHERE id = ${id} LIMIT 1`;
  if (resource === "claims") return sql`SELECT * FROM crm_claims WHERE id = ${id} LIMIT 1`;
  if (resource === "vehicles") return sql`SELECT * FROM crm_vehicles WHERE id = ${id} LIMIT 1`;
  if (resource === "drivers") return sql`SELECT * FROM crm_drivers WHERE id = ${id} LIMIT 1`;
  if (resource === "contracts") return sql`SELECT * FROM crm_contracts WHERE id = ${id} LIMIT 1`;
  if (resource === "insurance-requests") {
    return sql`SELECT * FROM crm_insurance_requests WHERE id = ${id} LIMIT 1`;
  }
  return [];
}

async function deleteById(sql, resource, id) {
  if (resource === "events") return sql`DELETE FROM crm_events WHERE id = ${id}`;
  if (resource === "claims") return sql`DELETE FROM crm_claims WHERE id = ${id}`;
  if (resource === "vehicles") return sql`DELETE FROM crm_vehicles WHERE id = ${id}`;
  if (resource === "drivers") return sql`DELETE FROM crm_drivers WHERE id = ${id}`;
  if (resource === "contracts") return sql`DELETE FROM crm_contracts WHERE id = ${id}`;
  if (resource === "insurance-requests") {
    return sql`DELETE FROM crm_insurance_requests WHERE id = ${id}`;
  }
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  const url = new URL(req.url, "http://localhost");
  const resource = url.searchParams.get("resource");
  const contactId = url.searchParams.get("contactId");
  const itemId = url.searchParams.get("id");
  const def = RESOURCES[resource];

  if (!def) {
    return res.status(400).json({
      error: "resource invalide",
      resources: Object.keys(RESOURCES),
    });
  }

  const scope = contactScopeFilter(user);

  if (req.method === "GET") {
    if (!contactId && !itemId) {
      return res.status(400).json({ error: "contactId ou id requis" });
    }
    try {
      if (itemId) {
        const rows = await getOne(sql, resource, itemId, scope);
        if (!rows.length) return res.status(404).json({ error: "Element introuvable" });
        if (contactId && rows[0].contact_id !== contactId) {
          return res.status(404).json({ error: "Element introuvable" });
        }
        return res.status(200).json({ ok: true, item: rows[0] });
      }
      const ok = await assertContactAccess(sql, contactId, scope);
      if (!ok) return res.status(404).json({ error: "Contact introuvable" });
      const rows = await listForContact(sql, resource, contactId, scope);
      return res.status(200).json({ ok: true, items: rows });
    } catch (e) {
      console.error("[crm/modules GET]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "POST") {
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    const cid = contactId || body.contactId || body.contact_id;
    if (!cid) return res.status(400).json({ error: "contactId requis" });

    try {
      const ok = await assertContactAccess(sql, cid, scope);
      if (!ok) return res.status(404).json({ error: "Contact introuvable" });

      const data = pickBody(body, def.createFields);
      const id = newId(def.prefix);

      if (resource === "events") {
        var participants =
          body.participants ||
          (body.participant_name || body.participantName
            ? [{ name: body.participant_name || body.participantName, role: "recipient" }]
            : []);
        var extraData = JSON.stringify({
          participants: participants,
          interlocutors: Interlocutors.normalizeList(body.interlocutors || participants),
          attachments: body.attachments || [],
          urls: body.urls || [],
          createdBy: user.email || user.id,
        });
        await sql`
          INSERT INTO crm_events (
            id, contact_id, event_type, title, description, event_date, event_time,
            status, priority, user_id, extra_data
          ) VALUES (
            ${id}, ${cid},
            ${data.event_type || "note"},
            ${data.title || "Sans titre"},
            ${data.description || null},
            ${data.event_date || null},
            ${data.event_time || null},
            ${data.status || "pending"},
            ${data.priority || "medium"},
            ${user.id},
            ${extraData}
          )
        `;
      } else if (resource === "claims") {
        await sql`
          INSERT INTO crm_claims (
            id, contact_id, vehicle_id, driver_id, claim_type, claim_date, amount,
            description, insurer, status, responsible, percentage, parent_id
          ) VALUES (
            ${id}, ${cid},
            ${data.vehicle_id || null}, ${data.driver_id || null},
            ${data.claim_type || null}, ${data.claim_date || null},
            ${data.amount != null ? Number(data.amount) : null},
            ${data.description || null}, ${data.insurer || null},
            ${data.status || "En attente"},
            ${data.responsible === true || data.responsible === "true"},
            ${data.percentage != null ? parseInt(data.percentage, 10) : 0},
            ${data.parent_id || null}
          )
        `;
      } else if (resource === "vehicles") {
        await sql`
          INSERT INTO crm_vehicles (
            id, contact_id, registration, brand, model, year, vehicle_type, status, parent_id
          ) VALUES (
            ${id}, ${cid},
            ${data.registration || null}, ${data.brand || null}, ${data.model || null},
            ${data.year != null ? parseInt(data.year, 10) : null},
            ${data.vehicle_type || "Voiture particuliere"},
            ${data.status || "En attente"},
            ${data.parent_id || null}
          )
        `;
      } else if (resource === "drivers") {
        await sql`
          INSERT INTO crm_drivers (
            id, contact_id, first_name, last_name, license_number, license_type, status
          ) VALUES (
            ${id}, ${cid},
            ${data.first_name || null}, ${data.last_name || null},
            ${data.license_number || null}, ${data.license_type || null},
            ${data.status || "Actif"}
          )
        `;
      } else if (resource === "contracts") {
        await sql`
          INSERT INTO crm_contracts (
            id, contact_id, contract_type, status, start_date, end_date, premium,
            insurer, policy_number, description
          ) VALUES (
            ${id}, ${cid},
            ${data.contract_type || "assurance"}, ${data.status || "En attente"},
            ${data.start_date || null}, ${data.end_date || null},
            ${data.premium != null ? Number(data.premium) : null},
            ${data.insurer || null}, ${data.policy_number || null},
            ${data.description || null}
          )
        `;
      } else if (resource === "insurance-requests") {
        await sql`
          INSERT INTO crm_insurance_requests (
            id, contact_id, request_type, status, vehicle_id, driver_id,
            requested_date, processed_date, amount, description, priority, assigned_to, parent_id
          ) VALUES (
            ${id}, ${cid},
            ${data.request_type || "devis"}, ${data.status || "En attente"},
            ${data.vehicle_id || null}, ${data.driver_id || null},
            ${data.requested_date || null}, ${data.processed_date || null},
            ${data.amount != null ? Number(data.amount) : null},
            ${data.description || null},
            ${data.priority || "Moyenne"},
            ${data.assigned_to || user.id},
            ${data.parent_id || null}
          )
        `;
      }

      await touchContact(sql, cid);
      const rows = await selectById(sql, resource, id);
      return res.status(201).json({ ok: true, item: rows[0] });
    } catch (e) {
      console.error("[crm/modules POST]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "PATCH") {
    if (!itemId) return res.status(400).json({ error: "id requis" });
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    const data = pickBody(body, def.createFields);

    try {
      const existingRows = await getOne(sql, resource, itemId, scope);
      if (!existingRows.length) return res.status(404).json({ error: "Element introuvable" });
      const cid = existingRows[0].contact_id;

      if (resource === "events") {
        var extraPatch = null;
        if (body.participants || body.attachments || body.urls || body.interlocutors) {
          var prev = {};
          if (existingRows[0].extra_data) {
            try {
              prev = JSON.parse(existingRows[0].extra_data);
            } catch (e) {}
          }
          extraPatch = JSON.stringify(
            Object.assign({}, prev, {
              participants: body.participants || prev.participants || [],
              interlocutors: Interlocutors.normalizeList(
                body.interlocutors || prev.interlocutors || body.participants || prev.participants || []
              ),
              attachments: body.attachments || prev.attachments || [],
              urls: body.urls || prev.urls || [],
              createdBy: prev.createdBy || user.email,
            })
          );
        }
        await sql`
          UPDATE crm_events SET
            event_type = COALESCE(${data.event_type ?? null}, event_type),
            title = COALESCE(${data.title ?? null}, title),
            description = COALESCE(${data.description ?? null}, description),
            event_date = COALESCE(${data.event_date ?? null}, event_date),
            event_time = COALESCE(${data.event_time ?? null}, event_time),
            status = COALESCE(${data.status ?? null}, status),
            priority = COALESCE(${data.priority ?? null}, priority),
            extra_data = COALESCE(${extraPatch}, extra_data),
            updated_at = NOW()
          WHERE id = ${itemId}
        `;
      } else if (resource === "claims") {
        await sql`
          UPDATE crm_claims SET
            vehicle_id = COALESCE(${data.vehicle_id ?? null}, vehicle_id),
            driver_id = COALESCE(${data.driver_id ?? null}, driver_id),
            claim_type = COALESCE(${data.claim_type ?? null}, claim_type),
            claim_date = COALESCE(${data.claim_date ?? null}, claim_date),
            amount = COALESCE(${data.amount != null ? Number(data.amount) : null}, amount),
            description = COALESCE(${data.description ?? null}, description),
            insurer = COALESCE(${data.insurer ?? null}, insurer),
            status = COALESCE(${data.status ?? null}, status),
            responsible = COALESCE(${data.responsible != null ? (data.responsible === true || data.responsible === "true") : null}, responsible),
            percentage = COALESCE(${data.percentage != null ? parseInt(data.percentage, 10) : null}, percentage),
            parent_id = COALESCE(${data.parent_id ?? null}, parent_id),
            updated_at = NOW()
          WHERE id = ${itemId}
        `;
      } else if (resource === "vehicles") {
        await sql`
          UPDATE crm_vehicles SET
            registration = COALESCE(${data.registration ?? null}, registration),
            brand = COALESCE(${data.brand ?? null}, brand),
            model = COALESCE(${data.model ?? null}, model),
            year = COALESCE(${data.year != null ? parseInt(data.year, 10) : null}, year),
            vehicle_type = COALESCE(${data.vehicle_type ?? null}, vehicle_type),
            status = COALESCE(${data.status ?? null}, status),
            parent_id = COALESCE(${data.parent_id ?? null}, parent_id),
            updated_at = NOW()
          WHERE id = ${itemId}
        `;
      } else if (resource === "drivers") {
        await sql`
          UPDATE crm_drivers SET
            first_name = COALESCE(${data.first_name ?? null}, first_name),
            last_name = COALESCE(${data.last_name ?? null}, last_name),
            license_number = COALESCE(${data.license_number ?? null}, license_number),
            license_type = COALESCE(${data.license_type ?? null}, license_type),
            status = COALESCE(${data.status ?? null}, status),
            updated_at = NOW()
          WHERE id = ${itemId}
        `;
      } else if (resource === "contracts") {
        await sql`
          UPDATE crm_contracts SET
            contract_type = COALESCE(${data.contract_type ?? null}, contract_type),
            status = COALESCE(${data.status ?? null}, status),
            start_date = COALESCE(${data.start_date ?? null}, start_date),
            end_date = COALESCE(${data.end_date ?? null}, end_date),
            premium = COALESCE(${data.premium != null ? Number(data.premium) : null}, premium),
            insurer = COALESCE(${data.insurer ?? null}, insurer),
            policy_number = COALESCE(${data.policy_number ?? null}, policy_number),
            description = COALESCE(${data.description ?? null}, description),
            updated_at = NOW()
          WHERE id = ${itemId}
        `;
      } else if (resource === "insurance-requests") {
        await sql`
          UPDATE crm_insurance_requests SET
            request_type = COALESCE(${data.request_type ?? null}, request_type),
            status = COALESCE(${data.status ?? null}, status),
            vehicle_id = COALESCE(${data.vehicle_id ?? null}, vehicle_id),
            driver_id = COALESCE(${data.driver_id ?? null}, driver_id),
            requested_date = COALESCE(${data.requested_date ?? null}, requested_date),
            processed_date = COALESCE(${data.processed_date ?? null}, processed_date),
            amount = COALESCE(${data.amount != null ? Number(data.amount) : null}, amount),
            description = COALESCE(${data.description ?? null}, description),
            priority = COALESCE(${data.priority ?? null}, priority),
            assigned_to = COALESCE(${data.assigned_to ?? null}, assigned_to),
            parent_id = COALESCE(${data.parent_id ?? null}, parent_id),
            updated_at = NOW()
          WHERE id = ${itemId}
        `;
      }

      await touchContact(sql, cid);
      const rows = await selectById(sql, resource, itemId);
      return res.status(200).json({ ok: true, item: rows[0] });
    } catch (e) {
      console.error("[crm/modules PATCH]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  if (req.method === "DELETE") {
    if (!itemId) return res.status(400).json({ error: "id requis" });
    try {
      const existingRows = await getOne(sql, resource, itemId, scope);
      if (!existingRows.length) return res.status(404).json({ error: "Element introuvable" });
      await deleteById(sql, resource, itemId);
      await touchContact(sql, existingRows[0].contact_id);
      return res.status(200).json({ ok: true });
    } catch (e) {
      console.error("[crm/modules DELETE]", e);
      return res.status(500).json({ error: "Erreur serveur" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
