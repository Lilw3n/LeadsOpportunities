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
  await sql`CREATE INDEX IF NOT EXISTS crm_presence_slots_date_idx ON crm_presence_slots (slot_date)`;
  await sql`CREATE INDEX IF NOT EXISTS crm_presence_slots_market_idx ON crm_presence_slots (market_id, slot_date)`;
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
    var id = newId("mkt");
    await sql`
      INSERT INTO crm_markets (
        id, name, city, postal_code, address, day_of_week,
        default_start_time, default_end_time, recurrence, notes, active, created_by, updated_by
      ) VALUES (
        ${id}, ${m.name}, ${m.city || null}, ${m.postal_code || null}, ${m.address || null},
        ${m.day_of_week != null ? Number(m.day_of_week) : null},
        ${m.default_start_time || null}, ${m.default_end_time || null},
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
  var start = new Date(fromDate);
  start.setHours(12, 0, 0, 0);
  for (var i = 0; i <= daysAhead; i++) {
    var d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d.getDay() !== targetDow) continue;
    if (market.recurrence === "weekly" || !market.recurrence) {
      out.push({
        type: "recurring",
        market_id: market.id,
        market_name: market.name,
        city: market.city,
        address: market.address,
        postal_code: market.postal_code,
        date: formatDate(d),
        day_label: DAY_LABELS[targetDow],
        start_time: market.default_start_time,
        end_time: market.default_end_time,
        notes: market.notes,
        recurrence: market.recurrence,
      });
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
      items.push(
        Object.assign({}, occ, {
          slot_id: slot ? slot.id : null,
          assigned_name: slot ? slot.assigned_name : null,
          assigned_user_id: slot ? slot.assigned_user_id : null,
          status: slot ? slot.status : "planned",
          start_time: slot && slot.start_time ? slot.start_time : occ.start_time,
          end_time: slot && slot.end_time ? slot.end_time : occ.end_time,
          slot_notes: slot ? slot.notes : null,
          has_assignment: !!(slot && (slot.assigned_name || slot.assigned_user_id)),
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
    items.push({
      type: "slot",
      slot_id: s.id,
      market_id: s.market_id,
      market_name: m ? m.name : "(Hors marché)",
      city: m ? m.city : null,
      address: m ? m.address : null,
      postal_code: m ? m.postal_code : null,
      date: String(s.slot_date).slice(0, 10),
      day_label: DAY_LABELS[d.getDay()],
      start_time: s.start_time,
      end_time: s.end_time,
      assigned_name: s.assigned_name,
      assigned_user_id: s.assigned_user_id,
      status: s.status,
      slot_notes: s.notes,
      has_assignment: !!(s.assigned_name || s.assigned_user_id),
      notes: m ? m.notes : null,
    });
  });

  items.sort(function (a, b) {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return (a.start_time || "").localeCompare(b.start_time || "");
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

  var markets = await sql`
    SELECT * FROM crm_markets ORDER BY active DESC, name ASC, day_of_week ASC
  `;
  var since = formatDate(new Date());
  var until = formatDate(new Date(Date.now() + daysAhead * 86400000));
  var slots = await sql`
    SELECT * FROM crm_presence_slots
    WHERE slot_date >= ${since}::date AND slot_date <= ${until}::date
    ORDER BY slot_date ASC, start_time ASC
  `;

  var upcoming = mergeUpcoming(markets, slots, daysAhead);

  var team = [];
  try {
    team = await sql`
      SELECT id, email, full_name, crm_role
      FROM users
      WHERE role = 'admin' OR crm_role IS NOT NULL
      ORDER BY full_name ASC NULLS LAST, email ASC
      LIMIT 100
    `;
  } catch (e) {
    team = [];
  }

  return {
    ok: true,
    markets: markets.map(function (m) {
      return Object.assign({}, m, {
        day_label: m.day_of_week != null ? DAY_LABELS[Number(m.day_of_week)] : null,
      });
    }),
    presence_slots: slots,
    upcoming: upcoming,
    days_ahead: daysAhead,
    day_labels: DAY_LABELS,
    can_edit: true,
    team: team,
  };
}

async function upsertMarket(sql, body, user) {
  var id = body.id || newId("mkt");
  var existing = body.id
    ? await sql`SELECT id FROM crm_markets WHERE id = ${body.id} LIMIT 1`
    : [];
  var fields = {
    name: String(body.name || "").trim(),
    city: body.city ? String(body.city).trim() : null,
    postal_code: body.postal_code ? String(body.postal_code).trim() : null,
    address: body.address ? String(body.address).trim() : null,
    day_of_week: body.day_of_week != null && body.day_of_week !== "" ? Number(body.day_of_week) : null,
    default_start_time: body.default_start_time ? String(body.default_start_time).trim() : null,
    default_end_time: body.default_end_time ? String(body.default_end_time).trim() : null,
    recurrence: body.recurrence ? String(body.recurrence).trim() : "weekly",
    notes: body.notes ? String(body.notes).trim() : null,
    active: body.active !== false && body.active !== "false",
  };
  if (!fields.name) throw new Error("Nom du marché requis");

  if (existing.length) {
    await sql`
      UPDATE crm_markets SET
        name = ${fields.name},
        city = ${fields.city},
        postal_code = ${fields.postal_code},
        address = ${fields.address},
        day_of_week = ${fields.day_of_week},
        default_start_time = ${fields.default_start_time},
        default_end_time = ${fields.default_end_time},
        recurrence = ${fields.recurrence},
        notes = ${fields.notes},
        active = ${fields.active},
        updated_by = ${user.id},
        updated_at = NOW()
      WHERE id = ${id}
    `;
  } else {
    await sql`
      INSERT INTO crm_markets (
        id, name, city, postal_code, address, day_of_week,
        default_start_time, default_end_time, recurrence, notes, active, created_by, updated_by
      ) VALUES (
        ${id}, ${fields.name}, ${fields.city}, ${fields.postal_code}, ${fields.address},
        ${fields.day_of_week}, ${fields.default_start_time}, ${fields.default_end_time},
        ${fields.recurrence}, ${fields.notes}, ${fields.active}, ${user.id}, ${user.id}
      )
    `;
  }
  return id;
}

async function upsertPresenceSlot(sql, body, user) {
  var id = body.id || newId("prs");
  var existing = body.id
    ? await sql`SELECT id FROM crm_presence_slots WHERE id = ${body.id} LIMIT 1`
    : [];
  var slotDate = String(body.slot_date || body.date || "").slice(0, 10);
  if (!slotDate) throw new Error("Date requise");

  var fields = {
    market_id: body.market_id ? String(body.market_id).trim() : null,
    slot_date: slotDate,
    start_time: body.start_time ? String(body.start_time).trim() : null,
    end_time: body.end_time ? String(body.end_time).trim() : null,
    assigned_name: body.assigned_name ? String(body.assigned_name).trim() : null,
    assigned_user_id: body.assigned_user_id ? String(body.assigned_user_id).trim() : null,
    status: body.status ? String(body.status).trim() : "planned",
    notes: body.notes ? String(body.notes).trim() : null,
  };

  if (existing.length) {
    await sql`
      UPDATE crm_presence_slots SET
        market_id = ${fields.market_id},
        slot_date = ${fields.slot_date}::date,
        start_time = ${fields.start_time},
        end_time = ${fields.end_time},
        assigned_name = ${fields.assigned_name},
        assigned_user_id = ${fields.assigned_user_id},
        status = ${fields.status},
        notes = ${fields.notes},
        updated_by = ${user.id},
        updated_at = NOW()
      WHERE id = ${id}
    `;
  } else {
    await sql`
      INSERT INTO crm_presence_slots (
        id, market_id, slot_date, start_time, end_time,
        assigned_name, assigned_user_id, status, notes, created_by, updated_by
      ) VALUES (
        ${id}, ${fields.market_id}, ${fields.slot_date}::date,
        ${fields.start_time}, ${fields.end_time},
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
};
