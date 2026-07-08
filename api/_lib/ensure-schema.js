/**
 * Migrations idempotentes Neon — exécutées une fois par instance serverless.
 * Évite les erreurs « colonne / table absente » sans passage manuel SQL Editor.
 */
let done = false;
let running = null;

async function runStatement(sql, query) {
  try {
    await query(sql);
    return true;
  } catch (e) {
    console.warn("[ensure-schema]", e.message);
    return false;
  }
}

async function ensureSiteLeadsSchema(sql) {
  if (!sql) return false;
  if (done) return true;
  if (running) return running;

  running = (async function () {
    await runStatement(sql, function (s) {
      return s`
        CREATE TABLE IF NOT EXISTS site_leads (
          id TEXT PRIMARY KEY,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          source TEXT,
          vertical TEXT,
          lead_score INT NOT NULL DEFAULT 0,
          email TEXT,
          phone TEXT,
          utm_source TEXT,
          utm_medium TEXT,
          utm_campaign TEXT,
          gclid TEXT,
          visitor_id TEXT,
          payload TEXT NOT NULL DEFAULT '{}'
        )
      `;
    });

    var steps = [
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'new'`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS notes TEXT`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now()`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS contact_id TEXT`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS platform TEXT`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS pipeline_stage TEXT DEFAULT 'new'`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS questionnaire_step INT DEFAULT 0`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS questionnaire_total INT DEFAULT 10`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS form_id TEXT`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS fbclid TEXT`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS ttclid TEXT`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS msclkid TEXT`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS opened_by TEXT`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS archived_by TEXT`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS archive_reason TEXT`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS assigned_to TEXT`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS shared_with TEXT DEFAULT '[]'`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS last_event_at TIMESTAMPTZ`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS last_event_type TEXT`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS city TEXT`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS postal_code TEXT`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS landing_slug TEXT`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS client_ip TEXT`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS relevance TEXT`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS competitor_monthly NUMERIC`;
      },
      function (s) {
        return s`ALTER TABLE site_leads ADD COLUMN IF NOT EXISTS our_offer_monthly NUMERIC`;
      },
    ];

    for (var i = 0; i < steps.length; i++) {
      await runStatement(sql, steps[i]);
    }

    done = true;
    return true;
  })();

  return running;
}

async function ensureMailboxSchema(sql) {
  if (!sql) return false;
  await ensureSiteLeadsSchema(sql);
  await runStatement(sql, function (s) {
    return s`
      CREATE TABLE IF NOT EXISTS mailbox_messages (
        id TEXT PRIMARY KEY,
        direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
        from_addr TEXT,
        to_addr TEXT,
        subject TEXT,
        body_text TEXT,
        body_html TEXT,
        thread_key TEXT,
        external_uid TEXT UNIQUE,
        message_id TEXT,
        in_reply_to TEXT,
        lead_id TEXT,
        category TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
  });
  await runStatement(sql, function (s) {
    return s`ALTER TABLE mailbox_messages ADD COLUMN IF NOT EXISTS contact_id TEXT`;
  });
  return true;
}

module.exports = {
  ensureSiteLeadsSchema,
  ensureMailboxSchema,
};
