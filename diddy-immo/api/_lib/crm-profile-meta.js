const VERTICAL_PROFILE = {
  vtc: "mobilite-vtc",
  taxi: "mobilite-vtc",
  auto: "mobilite",
  moto: "mobilite",
  flotte: "mobilite",
  temporaire: "mobilite",
  sante: "sante",
  prevoyance: "sante",
  tns: "sante",
  deces: "sante",
  collective: "sante",
  habitation: "habitat",
  pno: "habitat",
  emprunteur: "habitat",
  mrh: "habitat",
  credit_immo: "finance",
  rachat: "finance",
  conso: "finance",
  credit_pro: "finance",
  rc_pro: "pro",
  mrp: "pro",
  decennale: "pro",
};

function normalizeVertical(v) {
  return String(v || "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
}

function profileKeyFromVertical(vertical, need) {
  const n = normalizeVertical(need || vertical);
  if (!n) return "generic";
  if (VERTICAL_PROFILE[n]) return VERTICAL_PROFILE[n];
  if (n === "vtc" || n === "taxi") return "mobilite-vtc";
  if (n.includes("sante") || n.includes("mutuelle") || n.includes("prevoy")) return "sante";
  if (n.includes("habit") || n.includes("immo") && !n.includes("credit")) return "habitat";
  if (n.includes("credit") || n.includes("pret")) return "finance";
  return "generic";
}

function buildProfileMetadata(body) {
  const vertical = body.vertical || body.insuranceType || body.serviceCategory;
  const need = body.need || body.primaryNeed || body.serviceNeed;
  const profileKey = body.profileKey || profileKeyFromVertical(vertical, need);
  return {
    profileKey,
    primaryNeed: need || vertical || null,
    vertical: vertical ? normalizeVertical(vertical) : null,
    serviceLabel: body.serviceLabel || body.label || null,
    quoteDetails: body.quoteDetails || null,
  };
}

function mergeMeta(existingMeta, patch) {
  const meta = Object.assign({}, existingMeta || {}, patch);
  if (patch.profileKey) meta.profileKey = patch.profileKey;
  if (patch.primaryNeed) meta.primaryNeed = patch.primaryNeed;
  if (patch.vertical) meta.vertical = patch.vertical;
  if (patch.serviceLabel) meta.serviceLabel = patch.serviceLabel;
  return meta;
}

module.exports = {
  profileKeyFromVertical,
  buildProfileMetadata,
  mergeMeta,
};
