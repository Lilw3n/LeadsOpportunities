const { applyApiGuards } = require("../security");
const { requireDashboardAdmin } = require("../dashboard-admin");
const { imapConfig } = require("../mail-imap");
const { listWithAutoSync } = require("../mailbox-sync-service");
const { getMailboxExternalLinks } = require("../mailbox-external");

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!(await requireDashboardAdmin(req, res))) return;

  try {
    const limit = req.query.limit;
    const offset = req.query.offset;
    const data = await listWithAutoSync(limit, offset);
    const external = getMailboxExternalLinks();
    return res.status(200).json({
      ok: true,
      messages: data.messages,
      total: data.total,
      stats: data.stats,
      sync: data.sync,
      syncMeta: data.syncMeta,
      imapConfigured: !!imapConfig(),
      mailboxAddress: external.mailbox_address,
      webmailUrl: external.webmail_url,
      webmailLabel: external.webmail_label,
      webmailLoginUrl: external.webmail_login_url,
      webmailWorkspaceUrl: external.webmail_workspace_url,
      webmailWorkspaceLabel: external.webmail_workspace_label,
      webmailO2switchUrl: external.webmail_o2switch_url,
      webmailO2switchLabel: external.webmail_o2switch_label,
      imapSources: data.imapSources || [],
    });
  } catch (e) {
    console.error("[mailbox-list]", e);
    const msg = e.message || "";
    if (/mailbox_messages/i.test(msg) && /does not exist|n'existe pas|relation/i.test(msg)) {
      return res.status(503).json({
        ok: false,
        code: "MAILBOX_TABLE_MISSING",
        error: "Table mailbox_messages absente. Executez database/mailbox.sql sur Neon.",
      });
    }
    return res.status(500).json({ ok: false, error: msg || "Erreur liste mail" });
  }
};
