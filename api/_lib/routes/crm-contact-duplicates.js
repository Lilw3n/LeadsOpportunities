const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");

function normEmail(v) {
  return String(v || "").trim().toLowerCase();
}

function normName(first, last) {
  return (String(first || "") + " " + String(last || ""))
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normPhone(v) {
  var d = String(v || "").replace(/\D+/g, "");
  if (!d) return "";
  if (d.indexOf("33") === 0 && d.length >= 11) d = "0" + d.slice(2);
  if (d.indexOf("0033") === 0 && d.length >= 13) d = "0" + d.slice(4);
  if (d.length === 9 && /^[67]/.test(d)) d = "0" + d;
  return d;
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const user = await requireCrm(req, res);
  if (!user) return;
  const sql = getSql();
  if (!sql) return res.status(500).json({ error: "Base de donnees non configuree" });

  try {
    const rows = await sql`
      SELECT id, first_name, last_name, email, phone, contact_type, company, created_at
      FROM crm_contacts
      ORDER BY created_at DESC
      LIMIT 2000
    `;

    const byKey = {};
    function push(key, reason, c) {
      if (!key) return;
      const k = reason + ":" + key;
      byKey[k] = byKey[k] || { key: key, reason: reason, contacts: [] };
      byKey[k].contacts.push(c);
    }

    rows.forEach(function (c) {
      push(normEmail(c.email), "email", c);
      push(normPhone(c.phone), "phone", c);
      var n = normName(c.first_name, c.last_name);
      if (n && (normEmail(c.email) || normPhone(c.phone))) push(n, "name", c);
    });

    const groups = Object.values(byKey)
      .filter(function (g) {
        return g.contacts.length > 1;
      })
      .map(function (g) {
        var uniq = {};
        g.contacts.forEach(function (c) {
          uniq[c.id] = c;
        });
        var arr = Object.values(uniq);
        return {
          reason: g.reason,
          key: g.key,
          contacts: arr.sort(function (a, b) {
            return new Date(a.created_at) - new Date(b.created_at);
          }),
          size: arr.length,
        };
      })
      .sort(function (a, b) {
        if (b.size !== a.size) return b.size - a.size;
        return a.reason.localeCompare(b.reason);
      })
      .slice(0, 200);

    return res.status(200).json({ ok: true, groups: groups });
  } catch (e) {
    console.error("[crm/contact-duplicates]", e);
    return res.status(500).json({ ok: false, error: "Erreur analyse doublons" });
  }
};
