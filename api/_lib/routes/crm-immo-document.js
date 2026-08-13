const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const { listAgencyProfiles, resolveAgencyBrand } = require("../immo-agency-profiles");
const {
  FORM_CATALOG,
  loadImmoBrandConfig,
  buildDocumentModel,
  renderDocumentHtml,
  buildPrefillFromProperty,
} = require("../immo-document");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireCrm(req, res);
  if (!user) return;

  const url = new URL(req.url, "http://localhost");
  const formType = url.searchParams.get("type");
  const format = (url.searchParams.get("format") || "json").toLowerCase();
  const propertyId = url.searchParams.get("propertyId") || url.searchParams.get("property");
  const agencyId = url.searchParams.get("agency") || url.searchParams.get("agencyId");

  if (!formType) {
    const profileId = url.searchParams.get("profile");
    if (profileId) {
      return res.status(200).json({
        ok: true,
        profile: resolveAgencyBrand(profileId),
      });
    }
    return res.status(200).json({
      ok: true,
      catalog: FORM_CATALOG,
      agencies: listAgencyProfiles(),
      categories: [
        { id: "mandat", label: "Mandats" },
        { id: "estimation", label: "Estimation & avis de valeur" },
        { id: "visite", label: "Visites" },
        { id: "prospection", label: "Prospection terrain" },
        { id: "negociation", label: "Négociation" },
      ],
    });
  }

  const known = FORM_CATALOG.some(function (f) {
    return f.id === formType;
  });
  if (!known) return res.status(400).json({ error: "type de formulaire inconnu" });

  let property = null;
  if (propertyId) {
    const sql = getSql();
    if (sql) {
      try {
        const rows = await sql`
          SELECT * FROM crm_immo_properties WHERE id = ${propertyId} LIMIT 1
        `;
        if (rows.length) property = rows[0];
      } catch (e) {
        console.warn("[crm/immo-document] property load", e.message);
      }
    }
  }

  const brand = loadImmoBrandConfig(agencyId);
  const model = buildDocumentModel(formType, { brand, property, agencyId });

  if (format === "html") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(renderDocumentHtml(model));
  }

  const agencyQs = agencyId ? "&agency=" + encodeURIComponent(agencyId) : "";
  return res.status(200).json({
    ok: true,
    formType,
    agencyId: brand.agencyId || agencyId || null,
    model: {
      meta: model.meta,
      prefill: model.prefill,
      propertyId: property ? property.id : null,
    },
    brand: {
      companyName: brand.companyName,
      networkName: brand.networkName,
      accentColor: brand.accentColor,
    },
    prefillFromProperty: property ? buildPrefillFromProperty(property) : null,
    viewerUrl:
      "/crm-immo-formulaire.html?type=" +
      encodeURIComponent(formType) +
      (propertyId ? "&property=" + encodeURIComponent(propertyId) : "") +
      agencyQs,
  });
};
