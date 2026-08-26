/**
 * Correspondance d’identité pour la reprise d’un dossier (e-mail / téléphone).
 * Un identifiant de lead seul ne suffit pas.
 */
function normEmail(v) {
  return String(v || "")
    .trim()
    .toLowerCase();
}

function normPhone(v) {
  var d = String(v || "").replace(/\D/g, "");
  if (d.length === 11 && d.indexOf("33") === 0) d = "0" + d.slice(2);
  if (d.length === 12 && d.indexOf("33") === 0) d = "0" + d.slice(2);
  return d.slice(-10);
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

function collectLeadEmails(lead) {
  lead = lead || {};
  var p = parsePayload(lead.payload);
  return [lead.email, p.email, p.sellerEmail].map(normEmail).filter(Boolean);
}

function collectLeadPhones(lead) {
  lead = lead || {};
  var p = parsePayload(lead.payload);
  return [lead.phone, p.phone, p.sellerPhone].map(normPhone).filter(function (d) {
    return d.length >= 10;
  });
}

/**
 * @param {object} lead row site_leads (email, phone, payload)
 * @param {{email?: string, phone?: string}} creds
 */
function identityMatchesLead(lead, creds) {
  creds = creds || {};
  var email = normEmail(creds.email);
  var digits = normPhone(creds.phone);
  if (!email && digits.length < 10) return false;

  var emails = collectLeadEmails(lead);
  var phones = collectLeadPhones(lead);
  var emailMatch = !!(email && emails.indexOf(email) >= 0);
  var phoneMatch = digits.length >= 10 && phones.indexOf(digits) >= 0;

  if (!emailMatch && !phoneMatch) return false;
  if (email && emails.length && !emailMatch) return false;
  if (digits.length >= 10 && phones.length && !phoneMatch) return false;
  return true;
}

module.exports = {
  normEmail: normEmail,
  normPhone: normPhone,
  identityMatchesLead: identityMatchesLead,
};
