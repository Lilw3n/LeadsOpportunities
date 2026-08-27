/**
 * Client Todoist — REST API v1.
 * Jeton : OAuth utilisateur (Neon) ou TODOIST_API_TOKEN (Vercel, comme Slack).
 */
const { getSql } = require("./db");
const { ensureTodoistSchema } = require("./ensure-schema");

var API = "https://api.todoist.com/api/v1";

function envToken() {
  return String(process.env.TODOIST_API_TOKEN || "").trim();
}

function envProjectId() {
  return String(process.env.TODOIST_PROJECT_ID || "").trim() || null;
}

function appUrl() {
  return (
    process.env.APP_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "https://www.leadsopportunities.fr"
  ).replace(/\/$/, "");
}

async function getUserConnection(userId) {
  var sql = getSql();
  if (!sql || !userId) return null;
  await ensureTodoistSchema(sql);
  var rows = await sql`
    SELECT todoist_access_token, todoist_project_id, todoist_connected_at
    FROM users
    WHERE id = ${userId}
    LIMIT 1
  `;
  if (!rows.length || !rows[0].todoist_access_token) return null;
  return {
    token: rows[0].todoist_access_token,
    projectId: rows[0].todoist_project_id || envProjectId(),
    connectedAt: rows[0].todoist_connected_at,
    source: "oauth",
  };
}

async function saveUserConnection(userId, token, projectId) {
  var sql = getSql();
  if (!sql || !userId || !token) return false;
  await ensureTodoistSchema(sql);
  await sql`
    UPDATE users SET
      todoist_access_token = ${token},
      todoist_project_id = ${projectId || null},
      todoist_connected_at = NOW()
    WHERE id = ${userId}
  `;
  return true;
}

async function clearUserConnection(userId) {
  var sql = getSql();
  if (!sql || !userId) return false;
  await ensureTodoistSchema(sql);
  await sql`
    UPDATE users SET
      todoist_access_token = NULL,
      todoist_connected_at = NULL
    WHERE id = ${userId}
  `;
  return true;
}

async function resolveAuth(userId) {
  if (userId) {
    var user = await getUserConnection(userId);
    if (user && user.token) return user;
  }
  var env = envToken();
  if (env) {
    return { token: env, projectId: envProjectId(), source: "env", connectedAt: null };
  }
  var sql = getSql();
  if (sql) {
    await ensureTodoistSchema(sql);
    var rows = await sql`
      SELECT todoist_access_token, todoist_project_id, todoist_connected_at
      FROM users
      WHERE todoist_access_token IS NOT NULL AND todoist_access_token <> ''
      ORDER BY todoist_connected_at DESC NULLS LAST
      LIMIT 1
    `;
    if (rows.length && rows[0].todoist_access_token) {
      return {
        token: rows[0].todoist_access_token,
        projectId: rows[0].todoist_project_id || envProjectId(),
        source: "oauth_workspace",
        connectedAt: rows[0].todoist_connected_at,
      };
    }
  }
  return null;
}

function todoistConfiguredSync() {
  return !!envToken() || !!(process.env.TODOIST_CLIENT_ID && process.env.TODOIST_CLIENT_SECRET);
}

async function todoistRequest(auth, method, path, body) {
  var headers = {
    Authorization: "Bearer " + auth.token,
    Accept: "application/json",
  };
  var opts = { method: method, headers: headers };
  if (body) {
    headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  var urls = [API + path];
  if (path.indexOf("/user") < 0) {
    urls.push("https://api.todoist.com/rest/v2" + path);
  }
  var lastErr = null;
  for (var i = 0; i < urls.length; i++) {
    var res = await fetch(urls[i], opts);
    var text = await res.text();
    var data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (e) {
      data = { raw: text };
    }
    if (res.ok) return data;
    lastErr = (data && (data.error || data.message || data.error_description)) || "Todoist HTTP " + res.status;
    if (res.status !== 404) break;
  }
  var err = new Error(lastErr || "Todoist indisponible");
  throw err;
}

function unwrapList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

async function getMe(auth) {
  return todoistRequest(auth, "GET", "/user");
}

async function listProjects(auth) {
  var data = await todoistRequest(auth, "GET", "/projects");
  return unwrapList(data);
}

async function listTasks(auth, query) {
  try {
    var path = "/tasks?limit=50";
    if (query) {
      path = "/tasks/filter?query=" + encodeURIComponent(query) + "&limit=50";
    }
    var data = await todoistRequest(auth, "GET", path);
    return unwrapList(data);
  } catch (e) {
    if (!query) throw e;
    var fallback = await todoistRequest(auth, "GET", "/tasks?limit=50");
    return unwrapList(fallback);
  }
}

async function createTask(auth, payload) {
  var body = {
    content: payload.content,
    description: payload.description || "",
    priority: payload.priority || 2,
  };
  if (payload.dueDate) body.due_date = payload.dueDate;
  else if (payload.dueDatetime) body.due_datetime = payload.dueDatetime;
  else if (payload.dueString) body.due_string = payload.dueString;
  if (payload.dueLang) body.due_lang = payload.dueLang;
  var projectId = payload.projectId || auth.projectId;
  if (projectId) body.project_id = projectId;
  return todoistRequest(auth, "POST", "/tasks", body);
}

async function updateTask(auth, taskId, payload) {
  var body = {};
  if (payload.content) body.content = payload.content;
  if (payload.description != null) body.description = payload.description;
  if (payload.priority) body.priority = payload.priority;
  if (payload.dueDate) body.due_date = payload.dueDate;
  else if (payload.dueDatetime) body.due_datetime = payload.dueDatetime;
  else if (payload.dueString) {
    body.due_string = payload.dueString;
    if (payload.dueLang) body.due_lang = payload.dueLang;
  }
  return todoistRequest(auth, "POST", "/tasks/" + encodeURIComponent(taskId), body);
}

async function closeTask(auth, taskId) {
  return todoistRequest(auth, "POST", "/tasks/" + encodeURIComponent(taskId) + "/close");
}

async function reopenTask(auth, taskId) {
  return todoistRequest(auth, "POST", "/tasks/" + encodeURIComponent(taskId) + "/reopen");
}

function taskIdOf(task) {
  if (!task) return null;
  var id = task.id || (task.task && task.task.id);
  return id != null ? String(id) : null;
}

function taskUrlOf(task, id) {
  if (task && task.url) return task.url;
  var tid = id || taskIdOf(task);
  return tid ? "https://app.todoist.com/app/task/" + tid : null;
}

function isoDateOnly(raw) {
  if (!raw) return "";
  if (raw instanceof Date && !isNaN(raw.getTime())) {
    return raw.toISOString().slice(0, 10);
  }
  var m = String(raw).match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1] : "";
}

function eventDuePayload(eventDate, eventTime) {
  var dateStr = isoDateOnly(eventDate);
  var timeStr = String(eventTime || "").trim();
  if (dateStr && /^\d{1,2}:\d{2}/.test(timeStr)) {
    return { dueString: dateStr + " " + timeStr.slice(0, 5), dueLang: "en" };
  }
  if (dateStr) return { dueDate: dateStr };
  return { dueString: "aujourd'hui", dueLang: "fr" };
}

function eventPriority(priority) {
  var p = String(priority || "").toLowerCase();
  if (p === "urgent") return 4;
  if (p === "high" || p === "haute") return 3;
  if (p === "low" || p === "faible") return 1;
  return 2;
}

function parseExtra(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  try {
    return JSON.parse(raw) || {};
  } catch (e) {
    return {};
  }
}

function eventTaskContent(r, contactName) {
  var title = String(r.title || "RDV").trim();
  var who = String(contactName || "").trim();
  return who ? title + " — " + who : title;
}

function eventTaskDescription(r, extra, contactName) {
  extra = extra || {};
  var lines = [
    r.description || "",
    contactName ? "Contact : " + contactName : "",
    r.contact_id ? "Fiche : " + appUrl() + "/crm-contact.html?id=" + encodeURIComponent(r.contact_id) : "",
    extra.propertyId
      ? "Bien : " + appUrl() + "/crm-immo-property.html?id=" + encodeURIComponent(extra.propertyId)
      : "",
    extra.location ? "Lieu : " + extra.location : "",
    extra.mode ? "Mode : " + extra.mode : "",
    r.event_type ? "Type : " + r.event_type : "",
    "Agenda CRM : " + appUrl() + "/crm-event-manager.html",
    "Événement : " + r.id,
  ];
  return lines.filter(Boolean).join("\n");
}

function eventTaskPayload(r, extra, contactName) {
  extra = extra || parseExtra(r.extra_data);
  var due = eventDuePayload(r.event_date, r.event_time || extra.eventTime);
  return Object.assign(
    {
      content: eventTaskContent(r, contactName),
      description: eventTaskDescription(r, extra, contactName),
      priority: eventPriority(r.priority),
    },
    due
  );
}

async function markEventTodoist(sql, eventId, patch) {
  var taskId = patch.taskId != null ? String(patch.taskId) : null;
  var status = patch.status || null;
  if (taskId) {
    await sql`
      UPDATE crm_events SET
        todoist_task_id = ${taskId},
        todoist_sync_status = ${status || "synced"},
        todoist_updated_at = NOW()
      WHERE id = ${eventId}
    `;
  } else {
    await sql`
      UPDATE crm_events SET
        todoist_sync_status = ${status || "error"},
        todoist_updated_at = NOW()
      WHERE id = ${eventId}
    `;
  }
}

async function syncCrmEventToTodoist(userId, eventId, opts) {
  opts = opts || {};
  var sql = getSql();
  if (!sql) return { ok: false, error: "no_db" };
  await ensureTodoistSchema(sql);

  var auth = await resolveAuth(userId);
  if (!auth) {
    await markEventTodoist(sql, eventId, { status: "skipped" });
    return { ok: false, skipped: true, reason: "todoist_not_connected" };
  }

  var rows = await sql`
    SELECT e.*, c.first_name, c.last_name, c.email AS contact_email
    FROM crm_events e
    INNER JOIN crm_contacts c ON c.id = e.contact_id
    WHERE e.id = ${eventId}
    LIMIT 1
  `;
  if (!rows.length) return { ok: false, error: "event_not_found" };

  var r = rows[0];
  var extra = parseExtra(r.extra_data);
  var contactName =
    ((r.first_name || "") + " " + (r.last_name || "")).trim() || r.contact_email || "";
  var payload = eventTaskPayload(r, extra, contactName);
  var existingId = r.todoist_task_id ? String(r.todoist_task_id) : "";

  if (existingId && !opts.updateIfExists) {
    return {
      ok: true,
      skipped: true,
      todoistTaskId: existingId,
      url: taskUrlOf(null, existingId),
    };
  }

  try {
    var task;
    if (existingId && opts.updateIfExists) {
      task = await updateTask(auth, existingId, payload);
      await markEventTodoist(sql, eventId, { taskId: existingId, status: "synced" });
      return {
        ok: true,
        updated: true,
        todoistTaskId: existingId,
        url: taskUrlOf(task, existingId),
        source: auth.source,
      };
    }
    task = await createTask(auth, payload);
    var id = taskIdOf(task);
    if (!id) throw new Error("Todoist n’a pas renvoyé d’id de tâche");
    await markEventTodoist(sql, eventId, { taskId: id, status: "synced" });
    return { ok: true, todoistTaskId: id, url: taskUrlOf(task, id), source: auth.source };
  } catch (e) {
    console.error("[todoist] sync event", e.message);
    await markEventTodoist(sql, eventId, { status: "error" });
    return { ok: false, error: e.message };
  }
}

async function closeCrmEventOnTodoist(userId, eventId) {
  var sql = getSql();
  if (!sql) return { ok: false, error: "no_db" };
  await ensureTodoistSchema(sql);
  var rows = await sql`
    SELECT todoist_task_id FROM crm_events WHERE id = ${eventId} LIMIT 1
  `;
  if (!rows.length) return { ok: false, error: "event_not_found" };
  var taskId = rows[0].todoist_task_id ? String(rows[0].todoist_task_id) : "";
  if (!taskId) return { ok: true, skipped: true, reason: "no_todoist_task" };

  var auth = await resolveAuth(userId);
  if (!auth) return { ok: false, skipped: true, reason: "todoist_not_connected" };
  try {
    await closeTask(auth, taskId);
    await markEventTodoist(sql, eventId, { taskId: taskId, status: "closed" });
    return { ok: true, closed: true, todoistTaskId: taskId };
  } catch (e) {
    console.error("[todoist] close event", e.message);
    await markEventTodoist(sql, eventId, { taskId: taskId, status: "error" });
    return { ok: false, error: e.message };
  }
}

async function applyTodoistEventChange(userId, eventId, status) {
  var st = String(status || "").toLowerCase();
  if (st === "completed" || st === "cancelled") {
    return closeCrmEventOnTodoist(userId, eventId);
  }
  var sql = getSql();
  if (!sql) return { ok: false, error: "no_db" };
  await ensureTodoistSchema(sql);
  var rows = await sql`SELECT todoist_task_id FROM crm_events WHERE id = ${eventId} LIMIT 1`;
  if (!rows.length || !rows[0].todoist_task_id) {
    return { ok: true, skipped: true, reason: "no_todoist_task" };
  }
  return syncCrmEventToTodoist(userId, eventId, { updateIfExists: true });
}

async function pushUnsyncedCrmEventsToTodoist(userId) {
  var sql = getSql();
  if (!sql) return { ok: false, error: "no_db", pushed: 0 };
  await ensureTodoistSchema(sql);
  var auth = await resolveAuth(userId);
  if (!auth) {
    return { ok: false, error: "Todoist non connecté", pushed: 0, skipped: true };
  }

  var rows = await sql`
    SELECT e.id
    FROM crm_events e
    WHERE (e.todoist_task_id IS NULL OR e.todoist_task_id = '')
      AND (e.status IS NULL OR e.status NOT IN ('completed', 'cancelled'))
    ORDER BY e.event_date DESC NULLS LAST
    LIMIT 100
  `;

  var pushed = 0;
  var errors = 0;
  var skipped = 0;
  for (var i = 0; i < rows.length; i++) {
    var result = await syncCrmEventToTodoist(userId, rows[i].id);
    if (result && result.ok && !result.skipped) pushed++;
    else if (result && result.skipped) skipped++;
    else errors++;
  }
  return { ok: true, pushed: pushed, scanned: rows.length, errors: errors, skipped: skipped };
}

function leadTaskContent(payload, score, leadId) {
  var name = [payload.firstName || payload.first_name, payload.lastName || payload.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  var who = name || payload.email || payload.phone || leadId;
  var need = payload.need || payload.vertical || payload.source || "lead";
  return "Lead " + need + " — " + who;
}

function leadTaskDescription(payload, score, leadId) {
  var lines = [
    "Score : " + (score != null ? score : "?") + "/100",
    payload.email ? "E-mail : " + payload.email : "",
    payload.phone ? "Tél : " + payload.phone : "",
    payload.city || payload.cityFull ? "Ville : " + (payload.city || payload.cityFull) : "",
    "Source : " + (payload.source || "site"),
    "CRM : " + appUrl() + "/crm-leads.html",
    leadId ? "Lead ID : " + leadId : "",
  ];
  return lines.filter(Boolean).join("\n");
}

function leadPriority(score) {
  var n = Number(score) || 0;
  if (n >= 70) return 4;
  if (n >= 50) return 3;
  return 2;
}

async function createTaskForLead(payload, score, leadId, userId) {
  var auth = await resolveAuth(userId);
  if (!auth) return { ok: false, skipped: true, reason: "todoist_not_connected" };
  try {
    var task = await createTask(auth, {
      content: leadTaskContent(payload, score, leadId),
      description: leadTaskDescription(payload, score, leadId),
      dueString: "aujourd'hui",
      dueLang: "fr",
      priority: leadPriority(score),
    });
    return { ok: true, id: task && (task.id || (task.task && task.task.id)), source: auth.source };
  } catch (e) {
    console.error("[todoist] create lead task", e.message);
    return { ok: false, error: e.message };
  }
}

async function createTaskForContact(contact, extra) {
  var auth = await resolveAuth(extra && extra.userId);
  if (!auth) return { ok: false, skipped: true, reason: "todoist_not_connected" };
  var name = ((contact.first_name || "") + " " + (contact.last_name || "")).trim() || contact.email || contact.id;
  var content = (extra && extra.content) || "Rappeler " + name;
  var desc = [
    extra && extra.note ? extra.note : "",
    contact.email ? "E-mail : " + contact.email : "",
    contact.phone ? "Tél : " + contact.phone : "",
    "Fiche : " + appUrl() + "/crm-contact.html?id=" + encodeURIComponent(contact.id),
  ]
    .filter(Boolean)
    .join("\n");
  try {
    var task = await createTask(auth, {
      content: content,
      description: desc,
      dueString: (extra && extra.dueString) || "aujourd'hui",
      dueLang: "fr",
      priority: (extra && extra.priority) || 3,
      projectId: extra && extra.projectId,
    });
    return { ok: true, id: task && task.id, url: task && task.url, source: auth.source };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

module.exports = {
  envToken,
  envProjectId,
  resolveAuth,
  getUserConnection,
  saveUserConnection,
  clearUserConnection,
  todoistConfiguredSync,
  getMe,
  listProjects,
  listTasks,
  createTask,
  updateTask,
  closeTask,
  reopenTask,
  createTaskForLead,
  createTaskForContact,
  syncCrmEventToTodoist,
  closeCrmEventOnTodoist,
  applyTodoistEventChange,
  pushUnsyncedCrmEventsToTodoist,
  eventDuePayload,
  isoDateOnly,
  appUrl,
};
