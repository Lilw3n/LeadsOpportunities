const fs = require("fs");
const path = require("path");

const CONFIG_PATH = path.join(process.cwd(), "config/mailbox-external.json");

function loadMailboxExternalConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch (e) {
    return {};
  }
}

function getWebmailUrl() {
  var env = (process.env.MAILBOX_WEBMAIL_URL || "").trim();
  if (env) return env;
  var cfg = loadMailboxExternalConfig();
  return (cfg.webmail_url || "").trim();
}

function getMailboxExternalLinks() {
  var cfg = loadMailboxExternalConfig();
  return {
    webmail_url: getWebmailUrl(),
    webmail_label: cfg.webmail_label || "Boîte mail o2switch (Roundcube)",
    webmail_login_url: (cfg.webmail_login_url || "https://sodium.o2switch.net:2096/").trim(),
    mailbox_address: process.env.MAILBOX_ADDRESS || cfg.mailbox_address || "contact@leadsopportunities.fr",
  };
}

module.exports = {
  getWebmailUrl,
  getMailboxExternalLinks,
};
