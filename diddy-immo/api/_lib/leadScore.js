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
  if (body.fbclid || body.ttclid || body.msclkid) s += 7;
  if (body.utm_source || body.attr_first_utm_source) s += 6;
  if (body.source === "landing_form") s += 4;

  var step = Number(body.questionnaire_step || body.formStep || body.step || 0);
  var total = Number(body.questionnaire_total || body.formTotalSteps || body.totalSteps || 0);
  if (total > 0) s += Math.min(20, Math.round((step / total) * 20));

  if (/facebook|instagram|google|tiktok/i.test(String(body.platform || body.utm_source || ""))) s += 5;

  var country = String(body.visitor_country || "").toUpperCase();
  if (country && country !== "FR" && !/^(GP|MQ|GF|RE|YT|PM|WF|PF|NC|BL|MF|TF)$/.test(country)) {
    s -= 40;
  } else if (country === "FR" || /^(GP|MQ|GF|RE|YT|PM|WF|PF|NC|BL|MF|TF)$/.test(country)) {
    s += 4;
  }

  if (body.phone_format_warning === "non_french_format") s -= 12;
  if (body.postal_format_warning === "non_french_format") s -= 8;

  return Math.min(100, Math.max(0, Math.round(s)));
}

module.exports = { computeLeadScore };
