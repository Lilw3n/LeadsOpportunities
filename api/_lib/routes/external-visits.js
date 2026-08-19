/**
 * GET/POST /api/external/visits — espace Mes visites
 */
const crypto = require("crypto");
const { applyApiGuards, parseJsonBody, rateLimit, getClientIp } = require("../security");
const { getSql } = require("../db");
const { ensureExternalPortalSchema, requireExternalAccount, createPortalActivity } = require("../external-portal");

function sanitizeRating(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(1, Math.min(5, Math.round(n)));
}

function sanitizeVisitorContacts(list) {
  return (Array.isArray(list) ? list : [])
    .slice(0, 5)
    .map(function (item) {
      return {
        fullName: String(item && item.fullName ? item.fullName : "").trim().slice(0, 160),
        email: String(item && item.email ? item.email : "").trim().toLowerCase().slice(0, 160),
        phone: String(item && item.phone ? item.phone : "").trim().slice(0, 40),
        role: String(item && item.role ? item.role : "acquereur").trim().toLowerCase().slice(0, 40),
      };
    })
    .filter(function (item) {
      return item.fullName || item.email || item.phone;
    });
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const rl = rateLimit("ext-visits:" + getClientIp(req), 20, 3600000);
  if (!rl.allowed) return res.status(429).json({ error: "Trop de requetes" });

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    await ensureExternalPortalSchema(sql);
    const account = await requireExternalAccount(req, res, sql);
    if (!account) return;
    const contactId = account.linked_contact_id;

    if (req.method === "GET") {
      const scheduled = await sql`
        SELECT e.id, e.title, e.description, e.event_date, e.event_time, e.status, e.priority, e.extra_data
        FROM crm_events e
        WHERE e.contact_id = ${contactId}
          AND LOWER(COALESCE(e.event_type, '')) IN ('visit', 'visite', 'meeting', 'rdv')
        ORDER BY e.event_date DESC NULLS LAST, e.created_at DESC
        LIMIT 50
      `;
      const feedback = await sql`
        SELECT id, event_id, property_ref, visit_type, rating, interested, would_offer,
               budget_note, comments, visitor_contacts_json, created_at
        FROM crm_visit_feedback
        WHERE contact_id = ${contactId}
        ORDER BY created_at DESC
        LIMIT 50
      `;
      return res.status(200).json({
        ok: true,
        visits: scheduled.map(function (row) {
          var extra = {};
          var visitorContacts = [];
          try {
            extra = row.extra_data ? JSON.parse(row.extra_data) : {};
          } catch (e) {}
          var item = feedback.find(function (f) {
            return f.event_id === row.id;
          });
          try {
            visitorContacts = item && item.visitor_contacts_json ? JSON.parse(item.visitor_contacts_json) : [];
          } catch (e) {
            visitorContacts = [];
          }
          return {
            id: row.id,
            title: row.title,
            description: row.description,
            eventDate: row.event_date,
            eventTime: row.event_time || extra.eventTime || "",
            status: row.status,
            priority: row.priority,
            location: extra.location || "",
            propertyRef: extra.propertyId || "",
            feedback: item
              ? {
                  id: item.id,
                  rating: item.rating,
                  interested: item.interested,
                  wouldOffer: item.would_offer,
                  budgetNote: item.budget_note || "",
                  comments: item.comments || "",
                  visitorContacts: visitorContacts,
                  createdAt: item.created_at,
                }
              : null,
          };
        }),
      });
    }

    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    const rating = sanitizeRating(body.rating);
    if (!rating) return res.status(400).json({ error: "Note de visite requise (1 à 5)" });

    const visitors = sanitizeVisitorContacts(body.visitorContacts);
    const eventId = String(body.eventId || "").trim() || null;
    const propertyRef = String(body.propertyRef || "").trim().slice(0, 160) || null;
    const visitType = String(body.visitType || "onsite").trim().toLowerCase().slice(0, 40) || "onsite";
    const interested = body.interested !== false;
    const wouldOffer = !!body.wouldOffer;
    const budgetNote = String(body.budgetNote || "").trim().slice(0, 240) || null;
    const comments = String(body.comments || "").trim().slice(0, 4000) || null;

    const existing = eventId
      ? await sql`SELECT id FROM crm_visit_feedback WHERE contact_id = ${contactId} AND event_id = ${eventId} LIMIT 1`
      : [];
    const feedbackId = existing.length ? existing[0].id : "vf_" + crypto.randomUUID();

    if (existing.length) {
      await sql`
        UPDATE crm_visit_feedback
        SET property_ref = ${propertyRef},
            visit_type = ${visitType},
            rating = ${rating},
            interested = ${interested},
            would_offer = ${wouldOffer},
            budget_note = ${budgetNote},
            comments = ${comments},
            visitor_contacts_json = ${JSON.stringify(visitors)},
            updated_at = NOW()
        WHERE id = ${feedbackId}
      `;
    } else {
      await sql`
        INSERT INTO crm_visit_feedback (
          id, event_id, contact_id, created_by_user_id, property_ref, visit_type, rating,
          interested, would_offer, budget_note, comments, visitor_contacts_json
        ) VALUES (
          ${feedbackId}, ${eventId}, ${contactId}, ${account.id}, ${propertyRef}, ${visitType}, ${rating},
          ${interested}, ${wouldOffer}, ${budgetNote}, ${comments}, ${JSON.stringify(visitors)}
        )
      `;
    }

    await createPortalActivity(
      sql,
      contactId,
      "Retour de visite",
      "Note " + rating + "/5" + (propertyRef ? " — " + propertyRef : "")
    );
    return res.status(200).json({ ok: true, id: feedbackId });
  } catch (e) {
    console.error("[external/visits]", e);
    return res.status(500).json({ ok: false, error: "Erreur serveur" });
  }
};
