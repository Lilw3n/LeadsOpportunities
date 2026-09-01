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
  // Priorité Workspace si configuré
  if ((process.env.MAILBOX_WEBMAIL_WORKSPACE_URL || "").trim()) {
    return process.env.MAILBOX_WEBMAIL_WORKSPACE_URL.trim();
  }
  if (cfg.webmail_workspace_url) return cfg.webmail_workspace_url;
  return (cfg.webmail_url || "").trim();
}

function getMailboxExternalLinks() {
  var cfg = loadMailboxExternalConfig();
  var workspaceUrl =
    (process.env.MAILBOX_WEBMAIL_WORKSPACE_URL || "").trim() ||
    cfg.webmail_workspace_url ||
    "https://mail.google.com/a/leadsopportunities.fr";
  var o2Url =
    (process.env.MAILBOX_WEBMAIL_O2SWITCH_URL || "").trim() ||
    (process.env.MAILBOX_WEBMAIL_URL || "").trim() ||
    cfg.webmail_url ||
    "https://sodium.o2switch.net:2096/3rdparty/roundcube/?_task=mail&_mbox=INBOX";

  return {
    webmail_url: getWebmailUrl() || workspaceUrl,
    webmail_label:
      cfg.webmail_primary_label ||
      (getWebmailUrl() === o2Url ? cfg.webmail_label || "Boîte mail o2switch" : "Gmail Workspace"),
    webmail_login_url: (cfg.webmail_login_url || "https://sodium.o2switch.net:2096/").trim(),
    mailbox_address: process.env.MAILBOX_ADDRESS || cfg.mailbox_address || "contact@leadsopportunities.fr",
    webmail_workspace_url: workspaceUrl,
    webmail_workspace_label: cfg.webmail_workspace_label || "Gmail Workspace",
    webmail_o2switch_url: o2Url,
    webmail_o2switch_label: cfg.webmail_o2switch_label || cfg.webmail_label || "o2switch Roundcube",
  };
}

module.exports = {
  getWebmailUrl,
  getMailboxExternalLinks,
};
