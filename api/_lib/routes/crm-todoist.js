/**
 * GET/POST /api/crm/todoist
 * GET  ?op=status|tasks|projects
 * POST { op: create|close|test|disconnect|project, ... }
 */
const { applyApiGuards, parseJsonBody } = require("../security");
const { requireCrm } = require("../rbac");
const { getSql } = require("../db");
const {
  resolveAuth,
  getUserConnection,
  saveUserConnection,
  clearUserConnection,
  getMe,
  listProjects,
  listTasks,
  closeTask,
  createTask,
  createTaskForContact,
  createTaskForLead,
  todoistConfiguredSync,
  envToken,
} = require("../todoist");
const { isTodoistOAuthConfigured, getRedirectUri } = require("../todoist-oauth");

function publicTask(t) {
  if (!t) return null;
  return {
    id: t.id,
    content: t.content,
    description: t.description || "",
    url: t.url || (t.id ? "https://app.todoist.com/app/task/" + t.id : null),
    due: t.due || null,
    priority: t.priority,
    projectId: t.project_id,
    isCompleted: !!(t.is_completed || t.checked),
  };
}

module.exports = async function (req, res) {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  var user = await requireCrm(req, res);
  if (!user) return;

  var url = new URL(req.url, "http://localhost");
  var op = url.searchParams.get("op") || "status";

  if (req.method === "GET") {
    try {
      var oauthUser = await getUserConnection(user.id);
      var auth = await resolveAuth(user.id);
      var oauthReady = isTodoistOAuthConfigured();
      var base = {
        ok: true,
        configured: !!(auth && auth.token) || oauthReady || !!envToken(),
        connected: !!(auth && auth.token),
        source: auth ? auth.source : null,
        oauthReady: oauthReady,
        envToken: !!envToken(),
        redirectUri: getRedirectUri(),
        connectUrl: oauthReady ? "/api/auth/todoist?returnTo=/crm-todoist.html" : null,
        projectId: auth && auth.projectId,
        connectedAt: (oauthUser && oauthUser.connectedAt) || (auth && auth.connectedAt),
      };

      if (op === "status") {
        if (auth) {
          try {
            var me = await getMe(auth);
            base.account = me && (me.full_name || me.email || me.id) ? { name: me.full_name || me.email, email: me.email } : null;
          } catch (e) {
            base.accountError = e.message;
          }
        }
        return res.status(200).json(base);
      }

      if (op === "connect") {
        if (!oauthReady) {
          return res.status(400).json({
            ok: false,
            error: "OAuth Todoist non configuré (TODOIST_CLIENT_ID / SECRET)",
            hint: "Ou collez TODOIST_API_TOKEN (jeton développeur) sur Vercel",
            redirectUri: getRedirectUri(),
          });
        }
        var oauth = require("../todoist-oauth");
        var returnTo = url.searchParams.get("returnTo") || "/crm-todoist.html";
        var state = oauth.signTodoistOAuthState({ userId: user.id, returnTo: returnTo });
        return res.status(200).json({ ok: true, url: oauth.buildTodoistAuthUrl(state) });
      }

      if (!auth) {
        return res.status(200).json(Object.assign(base, { tasks: [], projects: [], error: "Todoist non connecté" }));
      }

      if (op === "projects") {
        var projects = await listProjects(auth);
        return res.status(200).json(
          Object.assign(base, {
            projects: projects.map(function (p) {
              return { id: p.id, name: p.name, isInbox: !!(p.is_inbox_project || p.inbox_project) };
            }),
          })
        );
      }

      var query = url.searchParams.get("query") || "aujourd'hui | en retard";
      var tasks = await listTasks(auth, query);
      return res.status(200).json(
        Object.assign(base, {
          query: query,
          tasks: tasks.map(publicTask),
        })
      );
    } catch (e) {
      console.error("[crm/todoist GET]", e);
      return res.status(502).json({ ok: false, error: e.message || "Erreur Todoist" });
    }
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  var parsed = parseJsonBody(req);
  if (parsed.error) return res.status(400).json({ error: parsed.error });
  var body = parsed.body || {};
  var action = body.op || "create";

  try {
    if (action === "disconnect") {
      await clearUserConnection(user.id);
      return res.status(200).json({ ok: true, message: "Todoist déconnecté pour ce compte" });
    }

    if (action === "project") {
      var conn = await getUserConnection(user.id);
      if (!conn) {
        return res.status(400).json({ ok: false, error: "Connectez Todoist (OAuth) pour enregistrer un projet." });
      }
      await saveUserConnection(user.id, conn.token, body.projectId || null);
      return res.status(200).json({ ok: true, projectId: body.projectId || null });
    }

    var auth = await resolveAuth(user.id);
    if (!auth) {
      return res.status(503).json({
        ok: false,
        error: "Todoist non connecté",
        hint: "Ouvrez /crm-todoist.html ou ajoutez TODOIST_API_TOKEN sur Vercel",
      });
    }

    if (action === "close") {
      if (!body.taskId) return res.status(400).json({ error: "taskId manquant" });
      await closeTask(auth, body.taskId);
      return res.status(200).json({ ok: true, message: "Tâche cochée" });
    }

    if (action === "test") {
      var test = await createTask(auth, {
        content: "Test Leads Opportunities — Todoist connecté",
        description: "Tâche créée depuis le CRM. Vous pouvez la supprimer.",
        dueString: "aujourd'hui",
        dueLang: "fr",
        priority: 2,
      });
      return res.status(200).json({ ok: true, message: "Tâche test créée", task: publicTask(test) });
    }

    if (action === "lead") {
      var result = await createTaskForLead(body.payload || body, body.score, body.leadId, user.id);
      if (!result.ok) return res.status(502).json(result);
      return res.status(200).json(result);
    }

    if (body.contactId) {
      var sql = getSql();
      if (!sql) return res.status(500).json({ error: "Base de données non configurée" });
      var rows = await sql`SELECT * FROM crm_contacts WHERE id = ${body.contactId} LIMIT 1`;
      if (!rows.length) return res.status(404).json({ error: "Contact introuvable" });
      var created = await createTaskForContact(rows[0], {
        userId: user.id,
        content: body.content,
        note: body.note,
        dueString: body.dueString,
        projectId: body.projectId,
      });
      if (!created.ok) return res.status(502).json(created);
      return res.status(200).json(Object.assign({ message: "Tâche Todoist créée" }, created));
    }

    if (!body.content) return res.status(400).json({ error: "content manquant" });
    var task = await createTask(auth, {
      content: body.content,
      description: body.description,
      dueString: body.dueString || "aujourd'hui",
      dueLang: "fr",
      priority: body.priority,
      projectId: body.projectId,
    });
    return res.status(200).json({ ok: true, task: publicTask(task) });
  } catch (e) {
    console.error("[crm/todoist POST]", e);
    return res.status(502).json({ ok: false, error: e.message || "Erreur Todoist" });
  }
};
