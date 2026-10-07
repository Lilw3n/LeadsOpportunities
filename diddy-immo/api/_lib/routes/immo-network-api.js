/**
 * GET /api/immo-network/me
 * GET/POST /api/immo-network/properties — biens liés + liens / honoraires (sans durée mandat)
 */
const { applyApiGuards, parseJsonBody } = require("../security");
const { getAuthUser } = require("../auth");
const { getSql } = require("../db");
const Store = require("../immo-network-store");
const MandateAcl = require("../../../js/immo-mandate-acl-lib.js");
const FeeShare = require("../../../js/immo-fee-share-legal-lib.js");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de données non configurée" });

  const auth = Store.partnerFromAuth(req);
  const admin = await getAuthUser(req);
  const isAdmin = !!(admin && (admin.role === "admin" || admin.crm_role === "admin"));

  const url = new URL(req.url, "http://localhost");
  const action = url.searchParams.get("op") || "me";

  if (action === "me") {
    if (!auth) return res.status(401).json({ error: "Non authentifié" });
    const partner = await Store.getPartner(sql, auth.partnerId);
    if (!partner) return res.status(404).json({ error: "Partenaire introuvable" });
    return res.status(200).json({
      ok: true,
      partner: Store.publicPartner(partner),
      roles: Store.VALID_ROLES,
      feeRoles: FeeShare.PARTICIPANT_ROLES,
      legalNotes: FeeShare.LEGAL_NOTES,
    });
  }

  if (action === "properties") {
    if (!auth) return res.status(401).json({ error: "Non authentifié" });
    const props = await Store.listPartnerProperties(sql, auth.partnerId);
    return res.status(200).json({ ok: true, properties: props });
  }

  if (action === "links" && req.method === "GET") {
    if (!auth && !isAdmin) return res.status(401).json({ error: "Non authentifié" });
    const propertyId = url.searchParams.get("propertyId");
    if (!propertyId) return res.status(400).json({ error: "propertyId requis" });
    const links = await Store.listLinks(sql, propertyId);
    return res.status(200).json({ ok: true, links: links });
  }

  if (action === "links" && req.method === "POST") {
    if (!auth && !isAdmin) return res.status(401).json({ error: "Non authentifié" });
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    if (!body.propertyId) return res.status(400).json({ error: "propertyId requis" });
    const links = await Store.replaceLinks(
      sql,
      body.propertyId,
      body.links || [],
      (auth && auth.partnerId) || (admin && admin.id)
    );
    return res.status(200).json({ ok: true, links: links });
  }

  if (action === "fees" && req.method === "GET") {
    if (!auth && !isAdmin) return res.status(401).json({ error: "Non authentifié" });
    const propertyId = url.searchParams.get("propertyId");
    if (!propertyId) return res.status(400).json({ error: "propertyId requis" });
    const rows = await Store.listFeeAgreements(sql, propertyId);
    const honoraires = Number(url.searchParams.get("honoraires") || 0);
    const allocation = FeeShare.allocate(honoraires, rows);
    return res.status(200).json({ ok: true, agreements: rows, allocation: allocation });
  }

  if (action === "fees" && req.method === "POST") {
    if (!isAdmin && !auth) return res.status(401).json({ error: "Non authentifié" });
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    if (!body.property_id || !body.participant_role) {
      return res.status(400).json({ error: "property_id et participant_role requis" });
    }
    const id = await Store.upsertFeeAgreement(
      sql,
      body,
      (admin && admin.id) || (auth && auth.partnerId)
    );
    return res.status(200).json({ ok: true, id: id });
  }

  if (action === "grant" && req.method === "POST") {
    if (!isAdmin) return res.status(403).json({ error: "Admin uniquement" });
    const parsed = parseJsonBody(req);
    if (parsed.error) return res.status(400).json({ error: parsed.error });
    const body = parsed.body || {};
    if (!body.partnerId || !body.propertyId) {
      return res.status(400).json({ error: "partnerId et propertyId requis" });
    }
    const id = await Store.grantAccess(sql, body.partnerId, body.propertyId, body.accessLevel, admin.id);
    return res.status(200).json({ ok: true, id: id });
  }

  if (action === "mandate-duration" && req.method === "GET") {
    // Uniquement propriétaire (email match owner) ou admin Wendy
    const propertyId = url.searchParams.get("propertyId");
    const ownerEmail = String(url.searchParams.get("ownerEmail") || "")
      .trim()
      .toLowerCase();
    if (!propertyId) return res.status(400).json({ error: "propertyId requis" });

    const props = await sql`SELECT * FROM crm_immo_properties WHERE id = ${propertyId} LIMIT 1`;
    if (!props.length) return res.status(404).json({ error: "Bien introuvable" });
    const property = props[0];

    let isOwner = false;
    if (ownerEmail && property.owner_contact_id) {
      const contacts = await sql`
        SELECT id, email FROM crm_contacts WHERE id = ${property.owner_contact_id} LIMIT 1
      `;
      if (contacts.length && String(contacts[0].email || "").toLowerCase() === ownerEmail) {
        isOwner = true;
      }
    }

    const viewer = { isAdmin: isAdmin, isOwner: isOwner };
    if (!MandateAcl.canViewMandateDuration(viewer, property)) {
      return res.status(403).json({
        error: "Durée de mandat réservée au propriétaire et à l'administratrice",
        mandateDurationVisible: false,
      });
    }

    let meta = {};
    try {
      meta = typeof property.metadata_json === "string" ? JSON.parse(property.metadata_json || "{}") : {};
    } catch (e) {
      meta = {};
    }
    return res.status(200).json({
      ok: true,
      mandateDurationVisible: true,
      mandateDuration: MandateAcl.computeDuration(property, meta),
    });
  }

  return res.status(404).json({ error: "Action inconnue" });
};
