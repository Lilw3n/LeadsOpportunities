/**
 * Recherche leads côté navigateur (ID Slack UUID, email, téléphone, nom).
 */
(function (root) {
  var UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  function isLeadUuid(value) {
    return UUID_RE.test(String(value || "").trim());
  }

  function matches(lead, q) {
    var needle = String(q || "")
      .trim()
      .toLowerCase();
    if (!needle) return true;
    var id = String(lead && lead.id ? lead.id : "").toLowerCase();
    if (isLeadUuid(needle) && id === needle) return true;
    var hay = [
      lead.id,
      lead.email,
      lead.phone,
      lead.full_name,
      lead.name,
      lead.vertical,
      lead.source,
      lead.contact_id,
      lead.contactId,
      lead.visitor_id,
      lead.visitorId,
      lead.devis_summary,
      lead.notes,
      lead.client_ip,
      lead.ip,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return hay.indexOf(needle) >= 0;
  }

  function detailUrl(leadId) {
    return "./crm-lead-detail.html?id=" + encodeURIComponent(String(leadId || "").trim());
  }

  root.LeadSearch = {
    isLeadUuid: isLeadUuid,
    matches: matches,
    detailUrl: detailUrl,
  };
})(typeof window !== "undefined" ? window : globalThis);
