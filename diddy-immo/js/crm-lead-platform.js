/**
 * Détection plateforme d'acquisition — Meta, Google, TikTok, Instagram, LinkedIn, etc.
 */
window.CrmLeadPlatform = {
  PLATFORMS: [
    { id: "facebook", label: "Facebook / Meta", icon: "📘", color: "#1877f2" },
    { id: "instagram", label: "Instagram", icon: "📸", color: "#e4405f" },
    { id: "google", label: "Google Ads", icon: "🔍", color: "#4285f4" },
    { id: "tiktok", label: "TikTok", icon: "🎵", color: "#010101" },
    { id: "linkedin", label: "LinkedIn", icon: "💼", color: "#0a66c2" },
    { id: "youtube", label: "YouTube", icon: "▶️", color: "#ff0000" },
    { id: "snapchat", label: "Snapchat", icon: "👻", color: "#fffc00" },
    { id: "bing", label: "Bing / Microsoft", icon: "🅱️", color: "#00809d" },
    { id: "site_web", label: "Site web", icon: "🌐", color: "#0d9488" },
    { id: "email", label: "Email / newsletter", icon: "✉️", color: "#64748b" },
    { id: "referral", label: "Apporteur / reco", icon: "🤝", color: "#7c3aed" },
    { id: "autre", label: "Autre", icon: "📋", color: "#94a3b8" },
  ],

  STAGES: [
    { id: "new", label: "Nouveau lead", hint: "Premier contact entrant" },
    { id: "questionnaire", label: "Questionnaire", hint: "Formulaire en cours" },
    { id: "tariff_editing", label: "Bordereau tarifaire", hint: "Édition des tarifs assureur" },
    { id: "quote_sent", label: "Devis envoyé", hint: "Proposition transmise" },
    { id: "follow_up", label: "À relancer", hint: "Relance commerciale planifiée" },
    { id: "won", label: "Converti", hint: "Client / contrat" },
    { id: "lost", label: "Perdu", hint: "Sans suite" },
  ],

  detect: function (lead) {
    if (!lead) return "autre";
    if (lead.platform) return lead.platform;
    var payload = {};
    try {
      payload = typeof lead.payload === "string" ? JSON.parse(lead.payload) : lead.payload || {};
    } catch (e) {}
    var src = String(lead.source || payload.source || "").toLowerCase();
    var utm = String(lead.utm_source || payload.utm_source || "").toLowerCase();
    var medium = String(lead.utm_medium || payload.utm_medium || "").toLowerCase();
    var combined = src + " " + utm + " " + medium;

    if (lead.fbclid || payload.fbclid || /facebook|fbads|meta|instagram|ig\b/.test(combined)) {
      return /instagram|ig\b/.test(combined) ? "instagram" : "facebook";
    }
    if (lead.ttclid || payload.ttclid || /tiktok|tt\b/.test(combined)) return "tiktok";
    if (lead.gclid || payload.gclid || lead.msclkid || /google|gclid|adwords|cpc.*google/.test(combined))
      return "google";
    if (/linkedin|lnkd/.test(combined)) return "linkedin";
    if (/youtube|yt\b/.test(combined)) return "youtube";
    if (/snapchat|snap/.test(combined)) return "snapchat";
    if (/bing|microsoft|msclkid/.test(combined)) return "bing";
    if (/email|newsletter|mailchimp/.test(combined)) return "email";
    if (/apporteur|referral|reco|partner/.test(combined)) return "referral";
    if (/landing|site|web|organic|direct/.test(combined)) return "site_web";
    return "autre";
  },

  meta: function (id) {
    return (
      this.PLATFORMS.find(function (p) {
        return p.id === id;
      }) || this.PLATFORMS[this.PLATFORMS.length - 1]
    );
  },

  questionnairePct: function (lead) {
    var step = Number(lead.questionnaire_step || 0);
    var total = Number(lead.questionnaire_total || 10) || 10;
    return Math.min(100, Math.round((step / total) * 100));
  },

  isDormant: function (lead, hours) {
    hours = hours || 72;
    var ref = lead.last_activity_at || lead.updated_at || lead.created_at;
    if (!ref) return false;
    return Date.now() - new Date(ref).getTime() > hours * 3600000;
  },
};
