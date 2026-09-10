/**
 * GET /api/reviews-official-env — injecte Trustpilot / Google review URLs depuis Vercel.
 * Inclure AVANT reviews-official-lib.js.
 */
const { applyApiGuards } = require("../security");

module.exports = function reviewsOfficialEnv(req, res) {
  applyApiGuards(req, res);
  res.setHeader("Content-Type", "application/javascript; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600, stale-while-revalidate=86400");

  var fromEnv = {
    trustpilotBusinessUnitId: String(process.env.TRUSTPILOT_BUSINESS_UNIT_ID || "").trim(),
    trustpilotProfileUrl: String(process.env.TRUSTPILOT_PROFILE_URL || "").trim(),
    trustpilotInviteUrl: String(process.env.TRUSTPILOT_INVITE_URL || "").trim(),
    googlePlaceId: String(process.env.GOOGLE_PLACE_ID || "").trim(),
    googleReviewUrl: String(process.env.GOOGLE_REVIEW_URL || "").trim(),
  };

  res.status(200).send(
    "(function(){try{window.REVIEWS_OFFICIAL_FROM_ENV=" +
      JSON.stringify(fromEnv) +
      ";}catch(_){}})();"
  );
};
