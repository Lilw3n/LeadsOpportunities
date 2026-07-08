/**
 * Classe les leads site pour la messagerie dashboard.
 * questionnaire = parcours / devis multi-étapes
 * contact_request = formulaire contact, rappel express, message libre
 */
function parsePayloadSafe(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function isExpressCallbackPayload(row, payloadIn) {
  var payload = payloadIn || parsePayloadSafe(row && row.payload);
  var source = String((row && row.source) || payload.source || "").toLowerCase();
  var journey = String(payload.journey || "").toLowerCase();
  var msg = String(payload.message || payload.comment || "").toLowerCase();

  if (
    payload.callbackRequested === true ||
    journey === "callback" ||
    source === "callback_rappel" ||
    source === "homepage_callback" ||
    source === "landing_callback_strip" ||
    source.indexOf("callback") >= 0 ||
    msg.indexOf("rappel express") >= 0 ||
    msg.indexOf("demande de rappel express") >= 0
  ) {
    return true;
  }
  return false;
}

function classifyLeadInboxKind(row, payloadIn) {
  var payload = payloadIn || parsePayloadSafe(row && row.payload);
  var source = String((row && row.source) || payload.source || "").toLowerCase();
  var journey = String(payload.journey || (row && row.journey) || "").toLowerCase();
  var step = Number(
    (row && row.questionnaire_step) || payload.questionnaire_step || payload.step || 0
  );
  var total = Number(
    (row && row.questionnaire_total) || payload.questionnaire_total || payload.step_total || 0
  );

  if (isExpressCallbackPayload(row, payload)) {
    return "express_callback";
  }

  if (
    source === "homepage_contact" ||
    source === "services_catalog" ||
    source.indexOf("_contact") >= 0 ||
    source.indexOf("contact_") === 0
  ) {
    return "contact_request";
  }

  if (
    source === "wizard_progress" ||
    source === "landing_form" ||
    source === "landing_quick" ||
    journey === "standard" ||
    journey === "full" ||
    journey === "express" ||
    journey === "pet_express" ||
    step > 0 ||
    total > 0 ||
    payload.funnel ||
    payload.questionnaireDraft ||
    payload.parcours_id ||
    payload.parcours_label
  ) {
    return "questionnaire";
  }

  if ((payload.message || payload.comment) && step === 0 && !payload.funnel) {
    return "contact_request";
  }

  return "questionnaire";
}

function subjectForKind(kind, row, payload) {
  payload = payload || parsePayloadSafe(row && row.payload);
  var vertical = row.vertical || payload.vertical || payload.need || "lead";
  var name = [payload.firstName || payload.first_name, payload.lastName || payload.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  if (kind === "express_callback") {
    return "Rappel express — " + vertical + (name ? " — " + name : "");
  }
  if (kind === "contact_request") {
    if (payload.callbackRequested || String(payload.journey || "") === "callback") {
      return "Rappel express — " + vertical + (name ? " — " + name : "");
    }
    return "Demande de contact — " + vertical + (name ? " — " + name : "");
  }
  var step = Number(row.questionnaire_step || payload.questionnaire_step || payload.step || 0);
  var total = Number(row.questionnaire_total || payload.questionnaire_total || 10) || 10;
  var suffix = step > 0 ? " — étape " + step + "/" + total : "";
  if (name) return "Questionnaire " + vertical + " — " + name + suffix;
  return "Questionnaire — " + vertical + suffix;
}

function classifyMailboxMessage(m) {
  if (!m) return null;
  if (
    m.category === "express_callback" ||
    m.category === "questionnaire" ||
    m.category === "contact_request"
  ) {
    return m.category;
  }
  if (String(m.id || "").indexOf("lead_") !== 0 && !m.lead_id) return null;
  var sub = String(m.subject || "").toLowerCase();
  if (sub.indexOf("rappel express") >= 0) return "express_callback";
  if (sub.indexOf("demande de contact") >= 0) return "contact_request";
  if (sub.indexOf("questionnaire") >= 0) return "questionnaire";
  var body = String(m.body_text || "");
  if (body.indexOf("Type: Rappel express") >= 0 || body.indexOf("Demande de rappel express") >= 0) {
    return "express_callback";
  }
  if (body.indexOf("Type: Demande de contact") >= 0) return "contact_request";
  if (body.indexOf("Type: Questionnaire") >= 0) return "questionnaire";
  var p = parsePayloadSafe(body.indexOf("--- Données JSON ---") >= 0 ? body.split("--- Données JSON ---")[1] : body);
  if (p && Object.keys(p).length) {
    return classifyLeadInboxKind({ source: p.source, payload: JSON.stringify(p) }, p);
  }
  return "questionnaire";
}

module.exports = {
  parsePayloadSafe,
  isExpressCallbackPayload,
  classifyLeadInboxKind,
  subjectForKind,
  classifyMailboxMessage,
};
