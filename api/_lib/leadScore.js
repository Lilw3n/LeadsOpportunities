function computeLeadScore(body) {
  if (!body || typeof body !== "object") return 40;
  var s = 35;
  var keys = Object.keys(body).filter(function (k) {
    var v = body[k];
    if (v === null || v === undefined) return false;
    if (typeof v === "boolean") return v;
    return String(v).trim().length > 0;
  });
  s += Math.min(28, keys.length * 2);

  var email = String(body.email || "").trim();
  var phone = String(body.phone || "").trim();
  if (email.indexOf("@") !== -1) s += 8;
  if (phone.length >= 10) s += 7;

  var det = String(body.details || "").trim();
  if (det.length > 40) s += 12;
  else if (det.length > 10) s += 6;

  if (body.hasCompany === "1" || body.hasCompany === true) s += 6;
  if (body.gclid || body.attr_first_gclid || body.attr_last_gclid) s += 8;
  if (body.utm_source || body.attr_first_utm_source) s += 6;
  if (body.source === "landing_form") s += 4;

  return Math.min(100, Math.round(s));
}

module.exports = { computeLeadScore };
