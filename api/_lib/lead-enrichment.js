const { randomUUID } = require("crypto");

function normalizeEmail(email) {
  if (!email) return null;
  return String(email).trim().toLowerCase();
}

function normalizePhone(phone) {
  if (!phone) return null;
  var d = String(phone).replace(/\D/g, "");
  if (d.indexOf("33") === 0 && d.length === 11) d = "0" + d.slice(2);
  if (d.length === 9 && /^[67]/.test(d)) d = "0" + d;
  return d.length >= 10 ? d.slice(0, 15) : null;
}

function parseSeoFromPath(path) {
  var p = String(path || "").replace(/\/index\.html$/, "/").replace(/\/$/, "");
  var parts = p.split("/").filter(Boolean);
  var out = { seo_product: null, seo_city: null, seo_department: null, landing_slug: p || "/" };
  if (!parts.length) return out;

  var products = ["vtc-taxi", "assurance-sante", "credit-immo", "assurance-auto", "assurance-habitation", "prevoyance"];
  if (products.indexOf(parts[0]) !== -1 || ["vtc", "sante", "credit-immo"].indexOf(parts[0]) !== -1) {
    out.seo_product = parts[0];
    if (parts[1] === "villes" && parts[2]) out.seo_city = decodeURIComponent(parts[2]);
    if (parts[1] === "departement" && parts[2]) out.seo_department = parts[2];
  }
  if (parts[0] === "france" && parts[1] === "villes" && parts[2]) {
    out.seo_city = decodeURIComponent(parts[2]);
  }
  return out;
}

function extractAddressFields(body) {
  return {
    address_line: body.street || body.address || body.address_line || null,
    postal_code: body.postalCode || body.postal_code || body.cp || null,
    city: body.cityFull || body.city || body.ville || null,
  };
}

async function geocodeBan(postalCode, city, addressLine) {
  var q = [addressLine, postalCode, city, "France"].filter(Boolean).join(" ");
  if (!q || q.length < 5) return null;
  try {
    var url =
      "https://api-adresse.data.gouv.fr/search/?q=" +
      encodeURIComponent(q) +
      "&limit=1";
    var res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    var data = await res.json();
    var feat = data.features && data.features[0];
    if (!feat) return null;
    var coords = feat.geometry && feat.geometry.coordinates;
    return {
      lat: coords ? coords[1] : null,
      lng: coords ? coords[0] : null,
      confidence: feat.properties && feat.properties.score > 0.6 ? "high" : "medium",
      label: feat.properties && feat.properties.label,
    };
  } catch (e) {
    return null;
  }
}

async function findDuplicateLead(sql, email, phone) {
  var normEmail = normalizeEmail(email);
  var normPhone = normalizePhone(phone);
  if (!normEmail && !normPhone) return null;

  if (normEmail) {
    var byEmail = await sql`
      SELECT id, email, phone, created_at FROM site_leads
      WHERE LOWER(email) = ${normEmail}
      ORDER BY created_at DESC LIMIT 1
    `;
    if (byEmail.length) return byEmail[0];
  }
  if (normPhone) {
    var byPhone = await sql`
      SELECT id, email, phone, created_at FROM site_leads
      WHERE phone = ${normPhone} OR phone LIKE ${"%" + normPhone.slice(-9)}
      ORDER BY created_at DESC LIMIT 1
    `;
    if (byPhone.length) return byPhone[0];
  }
  return null;
}

async function recordTouchpoint(sql, payload) {
  if (!sql || !payload) return;
  var id = "tp_" + randomUUID();
  await sql`
    INSERT INTO lead_touchpoints (
      id, visitor_id, lead_id, event_type, page_path, page_title,
      seo_city, seo_product, utm_source, utm_medium, utm_campaign, referrer, payload
    ) VALUES (
      ${id},
      ${payload.visitor_id ? String(payload.visitor_id).slice(0, 120) : null},
      ${payload.lead_id ? String(payload.lead_id).slice(0, 80) : null},
      ${String(payload.event_type || "page_view").slice(0, 40)},
      ${payload.page_path ? String(payload.page_path).slice(0, 500) : null},
      ${payload.page_title ? String(payload.page_title).slice(0, 300) : null},
      ${payload.seo_city ? String(payload.seo_city).slice(0, 120) : null},
      ${payload.seo_product ? String(payload.seo_product).slice(0, 80) : null},
      ${payload.utm_source ? String(payload.utm_source).slice(0, 200) : null},
      ${payload.utm_medium ? String(payload.utm_medium).slice(0, 200) : null},
      ${payload.utm_campaign ? String(payload.utm_campaign).slice(0, 200) : null},
      ${payload.referrer ? String(payload.referrer).slice(0, 500) : null},
      ${payload.extra ? JSON.stringify(payload.extra).slice(0, 8000) : null}
    )
  `;
  return id;
}

module.exports = {
  normalizeEmail,
  normalizePhone,
  parseSeoFromPath,
  extractAddressFields,
  geocodeBan,
  findDuplicateLead,
  recordTouchpoint,
};
