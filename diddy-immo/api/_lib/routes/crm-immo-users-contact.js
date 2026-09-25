/**
 * GET/POST /api/crm/immo-users-contact
 * Super-admin : annuaire contactable du marché immo + envoi groupé Resend.
 */
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm, isSiteAdmin } = require("../rbac");
const { getSql } = require("../db");
const store = require("../immo-properties-store");
const { sendViaResend } = require("../mail-send");
const { saveOutbound } = require("../mail-store");
const Users = require("../../../js/immo-marche-users-lib.js");

const MAX_BULK = 40;
const CONFIRM_ALL = "CONTACTER TOUS";

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function linkifyHtml(text) {
  const parts = String(text || "").split(/(https?:\/\/[^\s<>"']+)/g);
  return parts
    .map(function (part) {
      if (/^https?:\/\//.test(part)) {
        const safe = escapeHtml(part);
        return (
          '<a href="' +
          safe +
          '" style="color:#2563eb;font-weight:600" target="_blank" rel="noopener noreferrer">' +
          safe +
          "</a>"
        );
      }
      return escapeHtml(part).replace(/\n/g, "<br>");
    })
    .join("");
}

async function loadTourRequests(sql) {
  try {
    return await sql`
      SELECT id, tour_token, property_id, property_title, link_name,
             first_name, email, phone, status, contact_id, lead_id,
             created_at, decided_at
      FROM crm_immo_tour_requests
      WHERE email IS NOT NULL AND email <> ''
      ORDER BY created_at DESC
      LIMIT 2000
    `;
  } catch (e) {
    console.warn("[immo-users-contact] tour_requests:", e.message);
    return [];
  }
}

async function loadImmoLeads(sql) {
  try {
    return await sql`
      SELECT id, email, phone, vertical, source, contact_id, payload, created_at, updated_at
      FROM site_leads
      WHERE archived_at IS NULL
        AND (
          vertical IN (
            'acheteur_immo',
            'vendeur_immo',
            'acheteur_vendeur_immo',
            'chasseur_immo',
            'immobilier',
            'immo'
          )
          OR LOWER(COALESCE(source, '')) LIKE '%immo%'
          OR LOWER(COALESCE(source, '')) LIKE '%acheteur%'
          OR LOWER(COALESCE(source, '')) LIKE '%vendeur%'
          OR LOWER(COALESCE(vertical, '')) LIKE '%immo%'
        )
      ORDER BY created_at DESC
      LIMIT 3000
    `;
  } catch (e) {
    console.warn("[immo-users-contact] site_leads:", e.message);
    return [];
  }
}

async function loadImmoContacts(sql) {
  try {
    return await sql`
      SELECT id, first_name, last_name, email, phone, source, notes,
             last_activity_at, updated_at, created_at
      FROM crm_contacts
      WHERE email IS NOT NULL OR phone IS NOT NULL
      ORDER BY COALESCE(last_activity_at, updated_at, created_at) DESC
      LIMIT 3000
    `;
  } catch (e) {
    console.warn("[immo-users-contact] contacts:", e.message);
    return [];
  }
}

async function collectUsers(sql) {
  const db = await store.loadAll(sql);
  const [leads, tourRequests, contacts] = await Promise.all([
    loadImmoLeads(sql),
    loadTourRequests(sql),
    loadImmoContacts(sql),
  ]);

  const contactsById = {};
  (contacts || []).forEach(function (c) {
    contactsById[c.id] = c;
  });

  const users = Users.buildUsers({
    parties: db.parties || [],
    criteria: db.criteria || [],
    leads: leads || [],
    tourRequests: tourRequests || [],
    contacts: contacts || [],
    contactsById: contactsById,
  });

  return {
    users: users,
    stats: Users.stats(users),
  };
}

module.exports = async function crmImmoUsersContact(req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const user = await requireCrm(req, res);
  if (!user) return;

  const sql = getSql();
  if (!sql) {
    return res.status(200).json({
      ok: true,
      offline: true,
      users: [],
      stats: Users.stats([]),
      message: "Base non configurée",
    });
  }

  try {
    if (req.method === "GET") {
      const bag = await collectUsers(sql);
      const url = new URL(req.url, "http://localhost");
      const filtered = Users.filterUsers(bag.users, {
        q: url.searchParams.get("q") || "",
        role: url.searchParams.get("role") || "",
        channel: url.searchParams.get("channel") || "",
      });
      return res.status(200).json({
        ok: true,
        offline: false,
        users: filtered,
        stats: Users.stats(filtered),
        totals: bag.stats,
        canBulkContact: !!(user.isSiteAdmin || isSiteAdmin(user)),
      });
    }

    if (req.method === "POST") {
      if (!(user.isSiteAdmin || isSiteAdmin(user))) {
        return res.status(403).json({
          ok: false,
          error: "Seul le super-admin peut écrire à tous les utilisateurs",
        });
      }

      const parsed = parseJsonBody(req, 200000);
      if (parsed.error) return res.status(400).json({ error: parsed.error });
      const body = parsed.body || {};
      const subject = String(body.subject || "").trim();
      const text = String(body.body || body.text || "").trim();
      const confirm = String(body.confirm || "").trim();

      if (!subject || !text) {
        return res.status(400).json({ error: "Objet et message requis" });
      }
      if (subject.length > 180 || text.length > 8000) {
        return res.status(400).json({ error: "Message trop long" });
      }

      const bag = await collectUsers(sql);
      let targets = bag.users.filter(function (u) {
        return u.emailable;
      });

      if (Array.isArray(body.ids) && body.ids.length) {
        const idSet = {};
        body.ids.forEach(function (id) {
          idSet[String(id)] = true;
        });
        targets = targets.filter(function (u) {
          return idSet[u.id];
        });
      } else if (body.all === true) {
        if (confirm !== CONFIRM_ALL) {
          return res.status(400).json({
            error:
              "Pour contacter tout le monde, confirmez avec la phrase exacte : CONTACTER TOUS",
          });
        }
        targets = Users.filterUsers(targets, {
          q: body.q || "",
          role: body.role || "",
          channel: "email",
        });
      } else {
        return res.status(400).json({ error: "ids[] ou all:true requis" });
      }

      if (!targets.length) {
        return res.status(400).json({ error: "Aucun destinataire e-mail" });
      }
      if (targets.length > MAX_BULK) {
        return res.status(400).json({
          error:
            "Maximum " +
            MAX_BULK +
            " e-mails par envoi (lot suivant ou export CSV / mailto BCC).",
          max: MAX_BULK,
          matched: targets.length,
        });
      }

      const html =
        '<div style="font-family:Georgia,serif;font-size:15px;line-height:1.55;color:#0f172a">' +
        linkifyHtml(text) +
        '<p style="margin-top:24px;font-size:12px;color:#64748b">Leads Opportunities — message de votre conseiller immobilier</p>' +
        "</div>";

      const results = [];
      for (var i = 0; i < targets.length; i++) {
        var dest = targets[i];
        var sent = await sendViaResend({
          to: dest.email,
          subject: subject,
          html: html,
          text: text,
        });
        if (sent.ok) {
          try {
            await saveOutbound({
              to: dest.email,
              subject: subject,
              bodyText: text,
              inReplyTo: null,
              threadKey: dest.email,
            });
          } catch (saveErr) {
            console.warn("[immo-users-contact] saveOutbound", saveErr.message);
          }
          results.push({
            id: dest.id,
            email: dest.email,
            ok: true,
            resendId: sent.resendId,
          });
        } else {
          results.push({
            id: dest.id,
            email: dest.email,
            ok: false,
            error: sent.error || "envoi échoué",
          });
        }
      }

      const sentOk = results.filter(function (r) {
        return r.ok;
      }).length;

      return res.status(200).json({
        ok: sentOk > 0,
        sent: sentOk,
        failed: results.length - sentOk,
        results: results,
      });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (e) {
    console.error("[crm/immo-users-contact]", e);
    return res.status(500).json({ ok: false, error: e.message || "Erreur serveur" });
  }
};
