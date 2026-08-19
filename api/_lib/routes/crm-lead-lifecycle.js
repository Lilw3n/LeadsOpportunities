const crypto = require("crypto");
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const { ensurePersonLinksSchema } = require("../ensure-schema");
const { buildProfileMetadata } = require("../crm-profile-meta");
const { hydrateInterlocuteurFromLead } = require("../hydrate-interlocuteur");
const { deleteLeadById } = require("../lead-delete-lib");
const Ident = require("../../../js/lead-identity-lib");

function isAdmin(user) {
  return user.role === "admin" || user.crmRole === "admin";
}

function parsePayload(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

async function loadLead(sql, id) {
  const rows = await sql`
    SELECT l.*, c.contact_type, c.first_name, c.last_name
    FROM site_leads l
    LEFT JOIN crm_contacts c ON c.id = l.contact_id
    WHERE l.id = ${id}
    LIMIT 1
  `;
  return rows[0] || null;
}

async function applyContactMerge(sql, keepId, mergeId) {
  const rows = await sql`SELECT * FROM crm_contacts WHERE id IN (${keepId}, ${mergeId})`;
  const keep = rows.find(function (r) {
    return r.id === keepId;
  });
  const lose = rows.find(function (r) {
    return r.id === mergeId;
  });
  if (!keep || !lose) return { ok: false, error: "Contacts introuvables" };

  function mergeText(a, b) {
    return a || b || null;
  }
  const mergedNotes = [keep.notes, lose.notes]
    .filter(Boolean)
    .join("\n\n---\nFusion " + new Date().toISOString() + "\n");
  await sql`
    UPDATE crm_contacts SET
      first_name = ${mergeText(keep.first_name, lose.first_name)},
      last_name = ${mergeText(keep.last_name, lose.last_name)},
      email = ${mergeText(keep.email, lose.email)},
      phone = ${mergeText(keep.phone, lose.phone)},
      company = ${mergeText(keep.company, lose.company)},
      notes = ${mergedNotes || null},
      updated_at = NOW(),
      last_activity_at = NOW()
    WHERE id = ${keepId}
  `;
  const leadRows = await sql`SELECT id FROM site_leads WHERE contact_id = ${mergeId}`;
  await sql`UPDATE site_leads SET contact_id = ${keepId} WHERE contact_id = ${mergeId}`;
  await sql`UPDATE crm_activities SET contact_id = ${keepId} WHERE contact_id = ${mergeId}`;
  await sql`UPDATE crm_events SET contact_id = ${keepId} WHERE contact_id = ${mergeId}`;
  try {
    await sql`UPDATE crm_claims SET contact_id = ${keepId} WHERE contact_id = ${mergeId}`;
    await sql`UPDATE crm_vehicles SET contact_id = ${keepId} WHERE contact_id = ${mergeId}`;
    await sql`UPDATE crm_drivers SET contact_id = ${keepId} WHERE contact_id = ${mergeId}`;
    await sql`UPDATE crm_contracts SET contact_id = ${keepId} WHERE contact_id = ${mergeId}`;
    await sql`UPDATE crm_insurance_requests SET contact_id = ${keepId} WHERE contact_id = ${mergeId}`;
    await sql`UPDATE crm_quotes SET contact_id = ${keepId} WHERE contact_id = ${mergeId}`;
  } catch (e) {
    /* tables optionnelles */
  }
  await sql`DELETE FROM crm_contacts WHERE id = ${mergeId}`;
  return {
    ok: true,
    snapshot: {
      contact: lose,
      leadIds: leadRows.map(function (r) {
        return r.id;
      }),
    },
  };
}

async function promoteLead(sql, user, lead) {
  if (lead.contact_id) {
    await sql`
      UPDATE crm_contacts
      SET contact_type = 'prospect',
          status = 'active',
          updated_at = NOW(),
          last_activity_at = NOW()
      WHERE id = ${lead.contact_id}
    `;
    const hydrated = await hydrateInterlocuteurFromLead(sql, user, lead, lead.contact_id);
    return {
      ok: true,
      contactId: lead.contact_id,
      alreadyLinked: true,
      dossierFilled: hydrated.dossierFilled,
      slack: hydrated.slack,
    };
  }
  var payload = parsePayload(lead.payload);
  const contactId = "ct_" + crypto.randomUUID();
  const firstName = payload.firstName || payload.first_name || payload.fullName || null;
  const lastName = payload.lastName || payload.last_name || null;
  const profileMeta = buildProfileMetadata(
    Object.assign({}, payload, { vertical: lead.vertical, interlocuteur: true })
  );
  await sql`
    INSERT INTO crm_contacts (
      id, contact_type, first_name, last_name, email, phone,
      status, source, assigned_to, notes, metadata, last_activity_at
    ) VALUES (
      ${contactId},
      'prospect',
      ${firstName},
      ${lastName},
      ${lead.email},
      ${lead.phone},
      'active',
      ${"lead:" + (lead.vertical || "web")},
      ${user.id},
      ${"Prospect / interlocuteur depuis lead " + lead.id},
      ${JSON.stringify(profileMeta)},
      NOW()
    )
  `;
  await sql`UPDATE site_leads SET contact_id = ${contactId}, updated_at = NOW() WHERE id = ${lead.id}`;
  await sql`
    INSERT INTO crm_activities (id, contact_id, lead_id, user_id, activity_type, title, body)
    VALUES (
      ${"act_" + crypto.randomUUID()},
      ${contactId},
      ${lead.id},
      ${user.id},
      'conversion',
      'Lead devenu prospect / interlocuteur',
      ${"Vertical: " + (lead.vertical || "")}
    )
  `;
  const hydrated = await hydrateInterlocuteurFromLead(sql, user, lead, contactId);
  return {
    ok: true,
    contactId: contactId,
    dossierFilled: hydrated.dossierFilled,
    slack: hydrated.slack,
  };
}

async function deleteLeadAndMaybeContact(sql, lead, alsoContact) {
  await deleteLeadById(sql, lead.id, { allowLinkedContact: !!alsoContact });
  if (alsoContact && lead.contact_id) {
    const others = await sql`SELECT id FROM site_leads WHERE contact_id = ${lead.contact_id} LIMIT 1`;
    if (!others.length) {
      const cid = lead.contact_id;
      try {
        await sql`DELETE FROM crm_events WHERE contact_id = ${cid}`;
        await sql`DELETE FROM crm_activities WHERE contact_id = ${cid}`;
        await sql`DELETE FROM crm_insurance_requests WHERE contact_id = ${cid}`;
      } catch (e) {}
      await sql`DELETE FROM crm_contacts WHERE id = ${cid}`;
    }
  }
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;

  const parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  const body = parsed.body || {};
  const action = String(body.action || "").toLowerCase();

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });
  await ensurePersonLinksSchema(sql);

  try {
    if (action === "promote") {
      const lead = await loadLead(sql, body.leadId);
      if (!lead) return res.status(404).json({ error: "Lead introuvable" });
      const out = await promoteLead(sql, user, lead);
      return res.status(200).json(out);
    }

    if (action === "delete") {
      if (!isAdmin(user)) return res.status(403).json({ error: "Suppression : admin uniquement" });
      if (body.confirm !== "SUPPRIMER" || body.confirmAck !== true) {
        return res.status(400).json({
          error: "Double validation requise",
          need: { confirm: "SUPPRIMER", confirmAck: true },
        });
      }
      const lead = await loadLead(sql, body.leadId);
      if (!lead) return res.status(404).json({ error: "Lead introuvable" });
      if (lead.contact_id && !body.deleteInterlocutor) {
        return res.status(409).json({
          ok: false,
          error:
            "Ce lead est rattaché à une fiche interlocuteur — suppression impossible sans supprimer la fiche contact.",
          contactId: lead.contact_id,
          hint: "Leads < fiche interlocuteur : ouvrez la fiche CRM ou cochez la suppression du contact.",
        });
      }
      await deleteLeadAndMaybeContact(sql, lead, !!body.deleteInterlocutor);
      return res.status(200).json({ ok: true, deleted: lead.id });
    }

    if (action === "link" || action === "fuse") {
      const keepLead = await loadLead(sql, body.keepLeadId || body.leadId);
      const otherLead = await loadLead(sql, body.otherLeadId);
      if (!keepLead || !otherLead) return res.status(404).json({ error: "Leads introuvables" });
      if (keepLead.id === otherLead.id) return res.status(400).json({ error: "Deux dossiers distincts requis" });
      const match = Ident.matchPair(
        {
          id: keepLead.id,
          email: keepLead.email,
          phone: keepLead.phone,
          ip: keepLead.client_ip,
          visitorId: keepLead.visitor_id,
        },
        {
          id: otherLead.id,
          email: otherLead.email,
          phone: otherLead.phone,
          ip: otherLead.client_ip,
          visitorId: otherLead.visitor_id,
        }
      );
      if (action === "fuse" && !Ident.canFuse(match) && !body.force) {
        return res.status(400).json({
          error: "Coordonnées insuffisantes pour fusionner — liaison possible, ou force admin",
          match: match,
        });
      }
      if (!Ident.canLink(match) && !body.force) {
        return res.status(400).json({ error: "Aucune coordonnée identique (email, tél, IP, visitor)", match: match });
      }
      const id = "plnk_" + crypto.randomUUID();
      const keepKind = keepLead.contact_id ? "contact" : "lead";
      const otherKind = otherLead.contact_id ? "contact" : "lead";
      const keepId = keepLead.contact_id || keepLead.id;
      const otherId = otherLead.contact_id || otherLead.id;
      const status = isAdmin(user) && body.autoApprove ? "approved" : "pending";
      await sql`
        INSERT INTO crm_person_links (
          id, keep_kind, keep_id, other_kind, other_id, link_type, status,
          match_reasons, created_by, notes
        ) VALUES (
          ${id}, ${keepKind}, ${keepId}, ${otherKind}, ${otherId},
          ${action === "fuse" ? "fusion" : "liaison"},
          ${status},
          ${JSON.stringify({ reasons: match.reasons, strength: match.strength, keepLeadId: keepLead.id, otherLeadId: otherLead.id })},
          ${user.id},
          ${body.notes || null}
        )
      `;
      var applied = null;
      if (status === "approved" && action === "fuse") {
        if (keepLead.contact_id && otherLead.contact_id && keepLead.contact_id !== otherLead.contact_id) {
          applied = await applyContactMerge(sql, keepLead.contact_id, otherLead.contact_id);
          if (applied.ok) {
            await sql`UPDATE crm_person_links SET snapshot = ${JSON.stringify(applied.snapshot)} WHERE id = ${id}`;
          }
        } else if (keepLead.contact_id && !otherLead.contact_id) {
          await sql`UPDATE site_leads SET contact_id = ${keepLead.contact_id}, parent_lead_id = ${keepLead.id}, is_duplicate = true, updated_at = NOW() WHERE id = ${otherLead.id}`;
        } else if (!keepLead.contact_id && otherLead.contact_id) {
          await sql`UPDATE site_leads SET contact_id = ${otherLead.contact_id}, updated_at = NOW() WHERE id = ${keepLead.id}`;
        } else {
          await sql`UPDATE site_leads SET parent_lead_id = ${keepLead.id}, is_duplicate = true, updated_at = NOW() WHERE id = ${otherLead.id}`;
        }
      }
      return res.status(201).json({
        ok: true,
        id: id,
        status: status,
        match: match,
        needsAdmin: status === "pending",
      });
    }

    if (action === "review") {
      if (!isAdmin(user)) return res.status(403).json({ error: "Validation manuelle : admin uniquement" });
      const linkId = body.linkId || body.id;
      const decision = String(body.decision || "").toLowerCase();
      if (!linkId || (decision !== "approve" && decision !== "reject")) {
        return res.status(400).json({ error: "linkId et decision (approve|reject) requis" });
      }
      const links = await sql`SELECT * FROM crm_person_links WHERE id = ${linkId} LIMIT 1`;
      if (!links.length) return res.status(404).json({ error: "Demande introuvable" });
      const link = links[0];
      if (link.status !== "pending") return res.status(400).json({ error: "Déjà traitée" });
      if (decision === "reject") {
        await sql`
          UPDATE crm_person_links
          SET status = 'rejected', reviewed_by = ${user.id}, reviewed_at = NOW(), notes = ${body.notes || link.notes}
          WHERE id = ${linkId}
        `;
        return res.status(200).json({ ok: true, status: "rejected" });
      }
      var reasons = {};
      try {
        reasons = JSON.parse(link.match_reasons || "{}");
      } catch (e) {}
      var snapshot = null;
      if (link.link_type === "fusion") {
        if (link.keep_kind === "contact" && link.other_kind === "contact" && link.keep_id !== link.other_id) {
          var merged = await applyContactMerge(sql, link.keep_id, link.other_id);
          if (!merged.ok) return res.status(400).json({ error: merged.error });
          snapshot = merged.snapshot;
        } else if (reasons.keepLeadId && reasons.otherLeadId) {
          await sql`UPDATE site_leads SET parent_lead_id = ${reasons.keepLeadId}, is_duplicate = true, updated_at = NOW() WHERE id = ${reasons.otherLeadId}`;
        }
      }
      await sql`
        UPDATE crm_person_links
        SET status = 'approved',
            reviewed_by = ${user.id},
            reviewed_at = NOW(),
            snapshot = ${snapshot ? JSON.stringify(snapshot) : link.snapshot},
            notes = ${body.notes || link.notes}
        WHERE id = ${linkId}
      `;
      return res.status(200).json({ ok: true, status: "approved" });
    }

    if (action === "unlink") {
      if (!isAdmin(user)) return res.status(403).json({ error: "Déliaison : admin uniquement" });
      const linkId = body.linkId || body.id;
      if (!linkId) return res.status(400).json({ error: "linkId requis" });
      const links = await sql`SELECT * FROM crm_person_links WHERE id = ${linkId} LIMIT 1`;
      if (!links.length) return res.status(404).json({ error: "Liaison introuvable" });
      await sql`
        UPDATE crm_person_links
        SET status = 'unlinked', reviewed_by = ${user.id}, reviewed_at = NOW(), notes = ${body.notes || links[0].notes}
        WHERE id = ${linkId}
      `;
      return res.status(200).json({ ok: true, status: "unlinked" });
    }

    if (action === "split") {
      if (!isAdmin(user)) return res.status(403).json({ error: "Séparation : admin uniquement" });
      const linkId = body.linkId || body.id;
      if (!linkId) return res.status(400).json({ error: "linkId requis" });
      const links = await sql`SELECT * FROM crm_person_links WHERE id = ${linkId} LIMIT 1`;
      if (!links.length) return res.status(404).json({ error: "Fusion introuvable" });
      const link = links[0];
      if (link.link_type !== "fusion" || link.status !== "approved") {
        return res.status(400).json({ error: "Séparation possible uniquement après une fusion validée" });
      }
      var snap = {};
      try {
        snap = JSON.parse(link.snapshot || "{}");
      } catch (e) {}
      var restoredId = null;
      if (snap.contact && snap.contact.id) {
        var c = snap.contact;
        restoredId = c.id;
        const exists = await sql`SELECT id FROM crm_contacts WHERE id = ${c.id} LIMIT 1`;
        if (!exists.length) {
          await sql`
            INSERT INTO crm_contacts (
              id, contact_type, first_name, last_name, email, phone, company,
              status, source, assigned_to, notes, metadata, last_activity_at
            ) VALUES (
              ${c.id}, ${c.contact_type || "prospect"}, ${c.first_name || null}, ${c.last_name || null},
              ${c.email || null}, ${c.phone || null}, ${c.company || null},
              ${c.status || "active"}, ${c.source || null}, ${c.assigned_to || null},
              ${c.notes || null}, ${typeof c.metadata === "string" ? c.metadata : JSON.stringify(c.metadata || {})},
              NOW()
            )
          `;
        }
        if (Array.isArray(snap.leadIds)) {
          for (var i = 0; i < snap.leadIds.length; i++) {
            await sql`UPDATE site_leads SET contact_id = ${c.id}, updated_at = NOW() WHERE id = ${snap.leadIds[i]}`;
          }
        }
      }
      await sql`
        UPDATE crm_person_links
        SET status = 'split', reviewed_by = ${user.id}, reviewed_at = NOW()
        WHERE id = ${linkId}
      `;
      return res.status(200).json({ ok: true, status: "split", restoredId: restoredId });
    }

    return res.status(400).json({
      error: "action inconnue",
      allowed: ["promote", "delete", "link", "fuse", "review", "unlink", "split"],
    });
  } catch (e) {
    console.error("[crm/lead-lifecycle]", e);
    return res.status(500).json({ error: "Erreur serveur", detail: e.message });
  }
};

