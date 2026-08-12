/**
 * GET/POST /api/cron/traffic-alert — endpoint manuel / compat
 * Le cron Vercel unique reste /api/mailbox/cron-sync (voir vercel.json).
 */
module.exports = require("../_lib/routes/cron-traffic-alert");
