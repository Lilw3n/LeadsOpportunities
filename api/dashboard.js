/**
 * Legacy : /api/dashboard?action=leads (query string)
 * Les chemins /api/dashboard/leads passent par api/dashboard/[action].js
 */
module.exports = require("./dashboard/[action].js");
