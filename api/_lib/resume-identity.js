/**
 * Correspondance d’identité pour une reprise de dossier (e-mail ou téléphone).
 * Un leadId seul ne suffit jamais — évite de renvoyer le dossier d’un autre client.
 */
function normPhone(v) {
  var d = String(v || "").replace(/\D/g, "");
  if (d.length === 11 && d.indexOf("33") === 0) d = "0" + d.slice(2);
  return d.slice(-10);
}

function identityMatchesLead(row, payload, email, phone) {
  row = row || {};
  payload = payload && typeof payload === "object" ? payload : {};
  var wantEmail = String(email || "")
    .trim()
    .toLowerCase();
  var wantPhone = normPhone(phone);
  var rowEmail = String(row.email || payload.email || "")
    .trim()
    .toLowerCase();
  var rowPhone = normPhone(row.phone || payload.phone || "");
  if (wantEmail && rowEmail && wantEmail === rowEmail) return true;
  if (wantPhone.length >= 10 && rowPhone.length >= 10 && wantPhone === rowPhone) return true;
  return false;
}

module.exports = {
  normPhone: normPhone,
  identityMatchesLead: identityMatchesLead,
};
