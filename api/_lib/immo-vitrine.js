/**
 * Payload vitrine publique (sans données confidentielles).
 */
const { parseEmbed, MEDIA_FIELD_IDS } = require("./immo-vitrine-lib");

function parseArr(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      const p = JSON.parse(v);
      return Array.isArray(p) ? p : [];
    } catch (e) {
      return [];
    }
  }
  return [];
}

function parseObj(v) {
  if (v && typeof v === "object" && !Array.isArray(v)) return v;
  if (typeof v === "string") {
    try {
      return JSON.parse(v) || {};
    } catch (e) {
      return {};
    }
  }
  return {};
}

function hydrateProperty(row) {
  if (!row) return null;
  const meta = parseObj(row.metadata_json);
  const photos = parseArr(row.photos_json);
  return Object.assign({}, row, {
    images: photos.length ? photos : meta.images || [],
    details: meta.details || {},
    transaction: meta.transaction || "vente",
  });
}

function formatPrice(prop) {
  const n = prop.price_fai != null ? prop.price_fai : prop.price_net;
  if (n == null || !Number.isFinite(Number(n))) return "";
  return Number(n).toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
}

function getPublicPhotos(prop) {
  return (prop.images || []).filter(function (url) {
    if (!url) return false;
    const s = String(url);
    return s.indexOf("data:") !== 0 && s.indexOf("local://") !== 0;
  });
}

function buildPublicVitrine(prop) {
  const details = prop.details || {};
  const vitrine = details.vitrine || {};
  const medias = details.medias || {};
  const photos = getPublicPhotos(prop);
  const cover =
    vitrine.cover_url && photos.indexOf(vitrine.cover_url) >= 0 ? vitrine.cover_url : photos[0] || "";

  const embeds = [];
  MEDIA_FIELD_IDS.forEach(function (fid) {
    const url = (medias[fid.id] || "").trim();
    if (!url || fid.private) return;
    const emb = parseEmbed(url);
    if (!emb) return;
    embeds.push({
      key: fid.id,
      label: fid.label,
      icon: fid.icon,
      group: fid.group,
      url: url,
      embed: emb,
    });
  });

  return {
    id: prop.id,
    title: prop.title,
    headline: vitrine.headline || prop.title,
    pitch: vitrine.pitch || prop.description || "",
    city: prop.city,
    postal_code: prop.postal_code,
    address: vitrine.show_address ? prop.address : null,
    property_type: prop.property_type,
    surface_m2: prop.surface_m2,
    rooms: prop.rooms,
    bedrooms: prop.bedrooms,
    dpe: prop.dpe,
    ges: prop.ges,
    price_label: formatPrice(prop),
    price_fai: prop.price_fai,
    photos: photos,
    cover: cover,
    embeds: embeds,
    live: embeds.filter(function (e) {
      return e.group === "live";
    }),
    videos: embeds.filter(function (e) {
      return e.group === "video";
    }),
    tours: embeds.filter(function (e) {
      return e.group === "tour";
    }),
    stream_scheduled: medias.stream_scheduled || "",
    cta_finance:
      "/landings/acheteur-immo.html?propertyId=" +
      encodeURIComponent(prop.id) +
      "&propertyPrice=" +
      encodeURIComponent(prop.price_fai || prop.price_net || "") +
      "#demande",
    agent: {
      name: vitrine.agent_name || "Wendy Buchet",
      tagline: vitrine.agent_tagline || "Votre négociateur immobilier",
      phone: vitrine.agent_phone || "",
      email: vitrine.agent_email || "contact@leadsopportunities.fr",
    },
    published_at: vitrine.published_at || null,
  };
}

module.exports = {
  hydrateProperty,
  buildPublicVitrine,
  parseObj,
};
