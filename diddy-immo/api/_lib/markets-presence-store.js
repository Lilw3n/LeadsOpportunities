const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { getSql } = require("./db");

const SEED_PATH = path.join(process.cwd(), "config/markets-presence-seed.json");
const DAY_LABELS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

function newId(prefix) {
  return prefix + "_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

function formatDate(d) {
  return d.toISOString().slice(0, 10);
}

function parseDate(s) {
  var d = new Date(s + "T12:00:00");
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseBreaks(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (typeof raw === "string") {
    try {
      var p = JSON.parse(raw);
      return Array.isArray(p) ? p : [];
    } catch (e) {
      return [];
    }
  }
  return [];
}

function normalizeSchedule(row) {
  if (!row) return {};
  var breaks = parseBreaks(row.breaks_json || row.breaks);
  var marketStart = row.market_start_time || row.default_start_time || null;
  var marketEnd = row.market_end_time || row.default_end_time || null;
  var workPrep = row.work_prep_start || null;
  var workStart = row.work_start || row.start_time || workPrep || marketStart || null;
  var workEnd = row.work_end || row.end_time || marketEnd || null;
  return {
    market_start_time: marketStart,
    market_end_time: marketEnd,
    work_prep_start: workPrep,
    work_start: workStart,
    work_end: workEnd,
    breaks: breaks,
    presence_start: workPrep || workStart,
    presence_end: workEnd,
  };
}

async function migrateScheduleColumns(sql) {
  await sql`ALTER TABLE crm_markets ADD COLUMN IF NOT EXISTS market_start_time TEXT`;
  await sql`ALTER TABLE crm_markets ADD COLUMN IF NOT EXISTS market_end_time TEXT`;
  await sql`ALTER TABLE crm_markets ADD COLUMN IF NOT EXISTS work_prep_start TEXT`;
  await sql`ALTER TABLE crm_markets ADD COLUMN IF NOT EXISTS work_start TEXT`;
  await sql`ALTER TABLE crm_markets ADD COLUMN IF NOT EXISTS work_end TEXT`;
  await sql`ALTER TABLE crm_markets ADD COLUMN IF NOT EXISTS breaks_json JSONB NOT NULL DEFAULT '[]'::jsonb`;
  await sql`ALTER TABLE crm_presence_slots ADD COLUMN IF NOT EXISTS market_start_time TEXT`;
  await sql`ALTER TABLE crm_presence_slots ADD COLUMN IF NOT EXISTS market_end_time TEXT`;
  await sql`ALTER TABLE crm_presence_slots ADD COLUMN IF NOT EXISTS work_prep_start TEXT`;
  await sql`ALTER TABLE crm_presence_slots ADD COLUMN IF NOT EXISTS work_start TEXT`;
  await sql`ALTER TABLE crm_presence_slots ADD COLUMN IF NOT EXISTS work_end TEXT`;
  await sql`ALTER TABLE crm_presence_slots ADD COLUMN IF NOT EXISTS breaks_json JSONB NOT NULL DEFAULT '[]'::jsonb`;
  await sql`
    UPDATE crm_markets SET market_start_time = default_start_time
    WHERE market_start_time IS NULL AND default_start_time IS NOT NULL
  `;
  await sql`
    UPDATE crm_markets SET market_end_time = default_end_time
    WHERE market_end_time IS NULL AND default_end_time IS NOT NULL
  `;
  await sql`
    UPDATE crm_markets SET work_start = default_start_time
    WHERE work_start IS NULL AND default_start_time IS NOT NULL
  `;
  await sql`
    UPDATE crm_markets SET work_end = default_end_time
    WHERE work_end IS NULL AND default_end_time IS NOT NULL
  `;
}

async function ensureMarketsSchema(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS crm_markets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT,
      postal_code TEXT,
      address TEXT,
      day_of_week INT,
      default_start_time TEXT,
      default_end_time TEXT,
      market_start_time TEXT,
      market_end_time TEXT,
      work_prep_start TEXT,
      work_start TEXT,
      work_end TEXT,
      breaks_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      recurrence TEXT NOT NULL DEFAULT 'weekly',
      notes TEXT,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_by TEXT,
      updated_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS crm_presence_slots (
      id TEXT PRIMARY KEY,
      market_id TEXT,
      slot_date DATE NOT NULL,
      start_time TEXT,
      end_time TEXT,
      market_start_time TEXT,
      market_end_time TEXT,
      work_prep_start TEXT,
      work_start TEXT,
      work_end TEXT,
      breaks_json JSONB NOT NULL DEFAULT '[]'::jsonb,
      assigned_name TEXT,
      assigned_user_id TEXT,
      status TEXT NOT NULL DEFAULT 'planned',
      notes TEXT,
      created_by TEXT,
      updated_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await migrateScheduleColumns(sql);
  await sql`CREATE INDEX IF NOT EXISTS crm_presence_slots_date_idx ON crm_presence_slots (slot_date)`;
  await sql`CREATE INDEX IF NOT EXISTS crm_presence_slots_market_idx ON crm_presence_slots (market_id, slot_date)`;
}

function scheduleFieldsFromBody(body) {
  var breaks = parseBreaks(body.breaks);
  var marketStart =
    body.market_start_time || body.default_start_time
      ? String(body.market_start_time || body.default_start_time).trim()
      : null;
  var marketEnd =
    body.market_end_time || body.default_end_time
      ? String(body.market_end_time || body.default_end_time).trim()
      : null;
  var workPrep = body.work_prep_start ? String(body.work_prep_start).trim() : null;
  var workStart = body.work_start ? String(body.work_start).trim() : null;
  var workEnd = body.work_end ? String(body.work_end).trim() : null;
  if (!workStart && body.start_time) workStart = String(body.start_time).trim();
  if (!workEnd && body.end_time) workEnd = String(body.end_time).trim();
  return {
    market_start_time: marketStart,
    market_end_time: marketEnd,
    default_start_time: marketStart,
    default_end_time: marketEnd,
    work_prep_start: workPrep,
    work_start: workStart,
    work_end: workEnd,
    start_time: workPrep || workStart,
    end_time: workEnd,
    breaks_json: JSON.stringify(breaks),
    breaks: breaks,
  };
}

function mergeSchedule(market, slot) {
  var base = normalizeSchedule(market || {});
  if (!slot) return base;
  var over = normalizeSchedule(slot);
  return {
    market_start_time: over.market_start_time || base.market_start_time,
    market_end_time: over.market_end_time || base.market_end_time,
    work_prep_start: over.work_prep_start || base.work_prep_start,
    work_start: over.work_start || base.work_start,
    work_end: over.work_end || base.work_end,
    breaks: over.breaks && over.breaks.length ? over.breaks : base.breaks,
    presence_start: over.work_prep_start || over.work_start || base.work_prep_start || base.work_start,
    presence_end: over.work_end || base.work_end,
  };
}

async function seedIfEmpty(sql, userId) {
  var count = await sql`SELECT COUNT(*)::int AS c FROM crm_markets`;
  if ((count[0] && count[0].c) > 0) return false;
  var seed = [];
  try {
    seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
  } catch (e) {
    return false;
  }
  for (var i = 0; i < seed.length; i++) {
    var m = seed[i];
    var sch = scheduleFieldsFromBody(m);
    var id = newId("mkt");
    await sql`
      INSERT INTO crm_markets (
        id, name, city, postal_code, address, day_of_week,
        default_start_time, default_end_time,
        market_start_time, market_end_time,
        work_prep_start, work_start, work_end, breaks_json,
        recurrence, notes, active, created_by, updated_by
      ) VALUES (
        ${id}, ${m.name}, ${m.city || null}, ${m.postal_code || null}, ${m.address || null},
        ${m.day_of_week != null ? Number(m.day_of_week) : null},
        ${sch.default_start_time}, ${sch.default_end_time},
        ${sch.market_start_time}, ${sch.market_end_time},
        ${sch.work_prep_start}, ${sch.work_start}, ${sch.work_end},
        ${sch.breaks_json}::jsonb,
        ${m.recurrence || "weekly"}, ${m.notes || null}, TRUE, ${userId || null}, ${userId || null}
      )
    `;
  }
  return true;
}

function nextOccurrencesForMarket(market, fromDate, daysAhead) {
  var out = [];
  if (!market.active || market.day_of_week == null) return out;
  var targetDow = Number(market.day_of_week);
  var sch = normalizeSchedule(market);
  var start = new Date(fromDate);
  start.setHours(12, 0, 0, 0);
  for (var i = 0; i <= daysAhead; i++) {
    var d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d.getDay() !== targetDow) continue;
    if (market.recurrence === "weekly" || !market.recurrence) {
      out.push(
        Object.assign(
          {
            type: "recurring",
            market_id: market.id,
            market_name: market.name,
            city: market.city,
            address: market.address,
            postal_code: market.postal_code,
            date: formatDate(d),
            day_label: DAY_LABELS[targetDow],
            notes: market.notes,
            recurrence: market.recurrence,
          },
          sch
        )
      );
    }
  }
  return out;
}

function mergeUpcoming(markets, slots, daysAhead) {
  var today = new Date();
  today.setHours(0, 0, 0, 0);
  var end = new Date(today);
  end.setDate(end.getDate() + daysAhead);
  var slotByKey = {};
  (slots || []).forEach(function (s) {
    var key = (s.market_id || "none") + "|" + String(s.slot_date).slice(0, 10);
    slotByKey[key] = s;
  });

  var items = [];
  (markets || []).forEach(function (m) {
    if (!m.active) return;
    nextOccurrencesForMarket(m, today, daysAhead).forEach(function (occ) {
      var key = m.id + "|" + occ.date;
      var slot = slotByKey[key];
      if (slot && slot.status === "cancelled") return;
      var sch = mergeSchedule(m, slot);
      items.push(
        Object.assign({}, occ, sch, {
          slot_id: slot ? slot.id : null,
          assigned_name: slot ? slot.assigned_name : null,
          assigned_user_id: slot ? slot.assigned_user_id : null,
          status: slot ? slot.status : "planned",
          slot_notes: slot ? slot.notes : null,
          has_assignment: !!(slot && (slot.assigned_name || slot.assigned_user_id)),
          start_time: sch.presence_start,
          end_time: sch.presence_end,
        })
      );
      delete slotByKey[key];
    });
  });

  Object.keys(slotByKey).forEach(function (key) {
    var s = slotByKey[key];
    var d = parseDate(String(s.slot_date).slice(0, 10));
    if (!d || d < today || d > end) return;
    if (s.status === "cancelled") return;
    var m = (markets || []).find(function (x) {
      return x.id === s.market_id;
    });
    var sch = mergeSchedule(m, s);
    items.push(
      Object.assign(
        {
          type: "slot",
          slot_id: s.id,
          market_id: s.market_id,
          market_name: m ? m.name : "(Hors marché)",
          city: m ? m.city : null,
          address: m ? m.address : null,
          postal_code: m ? m.postal_code : null,
          date: String(s.slot_date).slice(0, 10),
          day_label: DAY_LABELS[d.getDay()],
          assigned_name: s.assigned_name,
          assigned_user_id: s.assigned_user_id,
          status: s.status,
          slot_notes: s.notes,
          has_assignment: !!(s.assigned_name || s.assigned_user_id),
          notes: m ? m.notes : null,
        },
        sch,
        { start_time: sch.presence_start, end_time: sch.presence_end }
      )
    );
  });

  items.sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return (a.presence_start || "").localeCompare(b.presence_start || "");
  });
  return items;
}

async function listMarketsPresence(options) {
  options = options || {};
  var sql = getSql();
  if (!sql) return { ok: false, error: "Base de données non configurée" };
  await ensureMarketsSchema(sql);
  if (options.seed) await seedIfEmpty(sql, options.userId);

  var daysAhead = Math.min(Math.max(Number(options.days) || 28, 7), 90);

  var markets = await sql`SELECT * FROM crm_markets ORDER BY active DESC, name ASC, day_of_week ASC`;
  var since = formatDate(new Date());
  var until = formatDate(new Date(Date.now() + daysAhead * 86400000));
  var slots = await sql`
    SELECT * FROM crm_presence_slots
    WHERE slot_date >= ${since}::date AND slot_date <= ${until}::date
    ORDER BY slot_date ASC, work_prep_start ASC, work_start ASC
  `;

  return {
    ok: true,
    markets: markets.map(function (m) {
      return Object.assign({}, m, normalizeSchedule(m), {
        day_label: m.day_of_week != null ? DAY_LABELS[Number(m.day_of_week)] : null,
      });
    }),
    presence_slots: slots.map(function (s) {
      return Object.assign({}, s, normalizeSchedule(s));
    }),
    upcoming: mergeUpcoming(markets, slots, daysAhead),
    days_ahead: daysAhead,
    day_labels: DAY_LABELS,
    can_edit: true,
    schedule_help:
      "Horaires marché = ouverture du lieu. Horaires travail = arrivée (prépa), activité, rangement. Pauses libres.",
    team: await loadTeam(sql),
  };
}

async function loadTeam(sql) {
  try {
    return await sql`
      SELECT id, email, full_name, crm_role
      FROM users WHERE role = 'admin' OR crm_role IS NOT NULL
      ORDER BY full_name ASC NULLS LAST, email ASC LIMIT 100
    `;
  } catch (e) {
    return [];
  }
}

async function upsertMarket(sql, body, user) {
  var id = body.id || newId("mkt");
  var existing = body.id ? await sql`SELECT id FROM crm_markets WHERE id = ${body.id} LIMIT 1` : [];
  var sch = scheduleFieldsFromBody(body);
  var fields = {
    name: String(body.name || "").trim(),
    city: body.city ? String(body.city).trim() : null,
    postal_code: body.postal_code ? String(body.postal_code).trim() : null,
    address: body.address ? String(body.address).trim() : null,
    day_of_week: body.day_of_week != null && body.day_of_week !== "" ? Number(body.day_of_week) : null,
    recurrence: body.recurrence ? String(body.recurrence).trim() : "weekly",
    notes: body.notes ? String(body.notes).trim() : null,
    active: body.active !== false && body.active !== "false",
  };
  if (!fields.name) throw new Error("Nom du marché requis");

  if (existing.length) {
    await sql`
      UPDATE crm_markets SET
        name = ${fields.name}, city = ${fields.city}, postal_code = ${fields.postal_code},
        address = ${fields.address}, day_of_week = ${fields.day_of_week},
        default_start_time = ${sch.default_start_time}, default_end_time = ${sch.default_end_time},
        market_start_time = ${sch.market_start_time}, market_end_time = ${sch.market_end_time},
        work_prep_start = ${sch.work_prep_start}, work_start = ${sch.work_start}, work_end = ${sch.work_end},
        breaks_json = ${sch.breaks_json}::jsonb,
        recurrence = ${fields.recurrence}, notes = ${fields.notes}, active = ${fields.active},
        updated_by = ${user.id}, updated_at = NOW()
      WHERE id = ${id}
    `;
  } else {
    await sql`
      INSERT INTO crm_markets (
        id, name, city, postal_code, address, day_of_week,
        default_start_time, default_end_time, market_start_time, market_end_time,
        work_prep_start, work_start, work_end, breaks_json,
        recurrence, notes, active, created_by, updated_by
      ) VALUES (
        ${id}, ${fields.name}, ${fields.city}, ${fields.postal_code}, ${fields.address},
        ${fields.day_of_week}, ${sch.default_start_time}, ${sch.default_end_time},
        ${sch.market_start_time}, ${sch.market_end_time},
        ${sch.work_prep_start}, ${sch.work_start}, ${sch.work_end}, ${sch.breaks_json}::jsonb,
        ${fields.recurrence}, ${fields.notes}, ${fields.active}, ${user.id}, ${user.id}
      )
    `;
  }
  return id;
}

async function upsertPresenceSlot(sql, body, user) {
  var id = body.id || newId("prs");
  var existing = body.id ? await sql`SELECT id FROM crm_presence_slots WHERE id = ${body.id} LIMIT 1` : [];
  var slotDate = String(body.slot_date || body.date || "").slice(0, 10);
  if (!slotDate) throw new Error("Date requise");
  var sch = scheduleFieldsFromBody(body);

  var fields = {
    market_id: body.market_id ? String(body.market_id).trim() : null,
    slot_date: slotDate,
    assigned_name: body.assigned_name ? String(body.assigned_name).trim() : null,
    assigned_user_id: body.assigned_user_id ? String(body.assigned_user_id).trim() : null,
    status: body.status ? String(body.status).trim() : "planned",
    notes: body.notes ? String(body.notes).trim() : null,
  };

  if (existing.length) {
    await sql`
      UPDATE crm_presence_slots SET
        market_id = ${fields.market_id}, slot_date = ${fields.slot_date}::date,
        start_time = ${sch.start_time}, end_time = ${sch.end_time},
        market_start_time = ${sch.market_start_time}, market_end_time = ${sch.market_end_time},
        work_prep_start = ${sch.work_prep_start}, work_start = ${sch.work_start}, work_end = ${sch.work_end},
        breaks_json = ${sch.breaks_json}::jsonb,
        assigned_name = ${fields.assigned_name}, assigned_user_id = ${fields.assigned_user_id},
        status = ${fields.status}, notes = ${fields.notes},
        updated_by = ${user.id}, updated_at = NOW()
      WHERE id = ${id}
    `;
  } else {
    await sql`
      INSERT INTO crm_presence_slots (
        id, market_id, slot_date, start_time, end_time,
        market_start_time, market_end_time, work_prep_start, work_start, work_end, breaks_json,
        assigned_name, assigned_user_id, status, notes, created_by, updated_by
      ) VALUES (
        ${id}, ${fields.market_id}, ${fields.slot_date}::date,
        ${sch.start_time}, ${sch.end_time},
        ${sch.market_start_time}, ${sch.market_end_time},
        ${sch.work_prep_start}, ${sch.work_start}, ${sch.work_end}, ${sch.breaks_json}::jsonb,
        ${fields.assigned_name}, ${fields.assigned_user_id},
        ${fields.status}, ${fields.notes}, ${user.id}, ${user.id}
      )
    `;
  }
  return id;
}

async function deleteMarket(sql, id) {
  await sql`DELETE FROM crm_presence_slots WHERE market_id = ${id}`;
  await sql`DELETE FROM crm_markets WHERE id = ${id}`;
}

async function deletePresenceSlot(sql, id) {
  await sql`DELETE FROM crm_presence_slots WHERE id = ${id}`;
}

module.exports = {
  DAY_LABELS,
  ensureMarketsSchema,
  listMarketsPresence,
  upsertMarket,
  upsertPresenceSlot,
  deleteMarket,
  deletePresenceSlot,
  mergeUpcoming,
  normalizeSchedule,
  parseBreaks,
};
