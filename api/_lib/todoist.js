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
  if (payload.dueString) body.due_string = payload.dueString;
  if (payload.dueLang) body.due_lang = payload.dueLang;
  var projectId = payload.projectId || auth.projectId;
  if (projectId) body.project_id = projectId;
  return todoistRequest(auth, "POST", "/tasks", body);
}

async function closeTask(auth, taskId) {
  return todoistRequest(auth, "POST", "/tasks/" + encodeURIComponent(taskId) + "/close");
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
  closeTask,
  createTaskForLead,
  createTaskForContact,
  appUrl,
};
