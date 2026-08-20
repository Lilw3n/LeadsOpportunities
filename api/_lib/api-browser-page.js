/**
 * Pages HTML lisibles pour les endpoints API ouverts dans un navigateur.
 * Les clients JSON (Accept: application/json, fetch XHR, Stripe) gardent le JSON.
 */
function acceptList(req) {
  return String((req && req.headers && req.headers.accept) || "")
    .toLowerCase()
    .split(",")
    .map(function (part) {
      return part.split(";")[0].trim();
    })
    .filter(Boolean);
}

function wantsHtml(req) {
  if (!req) return false;
  var method = String(req.method || "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return false;
  var accepts = acceptList(req);
  if (!accepts.length) return true;
  if (accepts.indexOf("application/json") === 0) return false;
  if (accepts.indexOf("text/html") >= 0) return true;
  if (accepts.indexOf("*/*") >= 0 && accepts.indexOf("application/json") < 0) return true;
  return false;
}

function esc(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderRows(rows) {
  if (!rows || !rows.length) return "";
  return (
    '<dl class="rows">' +
    rows
      .map(function (r) {
        return "<dt>" + esc(r.label) + "</dt><dd>" + esc(r.value) + "</dd>";
      })
      .join("") +
    "</dl>"
  );
}

function renderLinks(links) {
  if (!links || !links.length) return "";
  return (
    '<p class="actions">' +
    links
      .map(function (l) {
        var cls = l.primary ? "btn btn-primary" : "btn";
        return '<a class="' + cls + '" href="' + esc(l.href) + '">' + esc(l.label) + "</a>";
      })
      .join("") +
    "</p>"
  );
}

/**
 * @param {object} res
 * @param {object} opts
 * @param {number} [opts.status]
 * @param {string} opts.title
 * @param {string} [opts.lead]
 * @param {string} [opts.tone] ok|warn|error|info
 * @param {Array<{label:string,value:string}>} [opts.rows]
 * @param {Array<{label:string,href:string,primary?:boolean}>} [opts.links]
 * @param {object} [opts.json] payload JSON affiché + renvoyé aussi en data-attribute
 * @param {string} [opts.hint]
 */
function sendApiPage(res, opts) {
  opts = opts || {};
  var status = opts.status || 200;
  var tone = opts.tone || (status >= 400 ? "error" : status >= 300 ? "warn" : "info");
  var title = opts.title || "API";
  var lead = opts.lead || "";
  var hint = opts.hint || "";
  var json = opts.json;
  var jsonBlock =
    json != null
      ? '<details class="json-box"><summary>Réponse technique (JSON)</summary><pre>' +
        esc(JSON.stringify(json, null, 2)) +
        "</pre></details>"
      : "";

  var html =
    "<!doctype html><html lang=\"fr\"><head><meta charset=\"UTF-8\"/>" +
    '<meta name="viewport" content="width=device-width, initial-scale=1"/>' +
    '<meta name="robots" content="noindex,nofollow"/>' +
    "<title>" +
    esc(title) +
    " · Leads Opportunities</title>" +
    "<style>" +
    ":root{--ink:#0f172a;--muted:#64748b;--line:#e2e8f0;--bg:#f1f5f9;--card:#fff;" +
    "--ok:#047857;--warn:#b45309;--error:#b91c1c;--info:#0369a1;--brand:#0f766e}" +
    "*{box-sizing:border-box}body{margin:0;min-height:100vh;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;" +
    "color:var(--ink);background:radial-gradient(1200px 600px at 10% -10%,#ccfbf1 0%,transparent 55%)," +
    "radial-gradient(900px 500px at 100% 0%,#e0f2fe 0%,transparent 50%),var(--bg)}" +
    ".wrap{max-width:640px;margin:0 auto;padding:48px 20px 64px}" +
    ".brand{font-size:.78rem;font-weight:800;" +
    "letter-spacing:.08em;text-transform:uppercase;color:var(--brand);margin:0 0 18px}" +
    ".card{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:28px 26px;" +
    "box-shadow:0 18px 40px rgba(15,23,42,.06)}" +
    ".tone{display:inline-block;font-size:.72rem;font-weight:800;" +
    "letter-spacing:.04em;text-transform:uppercase;padding:4px 9px;border-radius:999px;margin-bottom:12px}" +
    ".tone-ok{background:#ecfdf5;color:var(--ok)}.tone-warn{background:#fffbeb;color:var(--warn)}" +
    ".tone-error{background:#fef2f2;color:var(--error)}.tone-info{background:#e0f2fe;color:var(--info)}" +
    "h1{margin:0 0 10px;font-size:1.65rem;line-height:1.2;font-weight:700}" +
    ".lead{margin:0 0 18px;font-size:1rem;line-height:1.55;color:#334155}" +
    ".hint{margin:16px 0 0;font-size:.88rem;color:var(--muted);line-height:1.45}" +
    ".rows{display:grid;grid-template-columns:minmax(120px,38%) 1fr;gap:8px 14px;margin:0}" +
    ".rows dt{margin:0;color:var(--muted);font-size:.8rem;font-weight:600}" +
    ".rows dd{margin:0;font-size:.92rem;font-weight:650;word-break:break-word}" +
    ".actions{display:flex;flex-wrap:wrap;gap:10px;margin:22px 0 0}" +
    ".btn{display:inline-flex;align-items:center;padding:10px 14px;border-radius:10px;text-decoration:none;" +
    "font-size:.88rem;font-weight:700;border:1px solid var(--line);color:var(--ink);background:#fff}" +
    ".btn-primary{background:var(--brand);border-color:var(--brand);color:#fff}" +
    ".json-box{margin-top:18px}details>summary{cursor:pointer;color:var(--muted);font-size:.85rem;font-weight:600}" +
    "pre{margin:10px 0 0;padding:12px;border-radius:10px;background:#0f172a;color:#e2e8f0;overflow:auto;font-size:.78rem;line-height:1.45}" +
    "</style></head><body><div class=\"wrap\">" +
    '<p class="brand">Leads Opportunities</p>' +
    '<div class="card">' +
    '<span class="tone tone-' +
    esc(tone) +
    '">HTTP ' +
    esc(String(status)) +
    "</span>" +
    "<h1>" +
    esc(title) +
    "</h1>" +
    (lead ? '<p class="lead">' + esc(lead) + "</p>" : "") +
    renderRows(opts.rows) +
    renderLinks(opts.links) +
    (hint ? '<p class="hint">' + esc(hint) + "</p>" : "") +
    jsonBlock +
    "</div></div></body></html>";

  res.statusCode = status;
  if (typeof res.status === "function") {
    try {
      res.status(status);
    } catch (e) {
      /* ignore */
    }
  }
  if (typeof res.setHeader === "function") {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    if (opts.allow) res.setHeader("Allow", opts.allow);
  }
  if (typeof res.end === "function") return res.end(html);
  return res;
}

/**
 * Réponse JSON ou page HTML selon Accept.
 */
function sendApiResult(req, res, opts) {
  opts = opts || {};
  var status = opts.status || 200;
  var payload = opts.json != null ? opts.json : { error: opts.title || "Erreur" };
  if (wantsHtml(req)) {
    return sendApiPage(res, opts);
  }
  if (opts.allow && typeof res.setHeader === "function") {
    res.setHeader("Allow", opts.allow);
  }
  return res.status(status).json(payload);
}

module.exports = {
  wantsHtml: wantsHtml,
  sendApiPage: sendApiPage,
  sendApiResult: sendApiResult,
};
