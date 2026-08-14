/**
 * Vercel /api/foo/[action].js : req.query.action est le segment d’URL.
 * Un ?action=… supplémentaire devient un tableau ou écrase le segment,
 * ce qui casse le routeur et les sous-actions (ex. calendar-sync).
 */
function collectQueryValues(req, key) {
  var out = [];
  var q = req.query || {};
  var v = q[key];
  if (Array.isArray(v)) {
    v.forEach(function (x) {
      if (x) out.push(String(x));
    });
  } else if (v) {
    out.push(String(v));
  }
  try {
    var url = new URL(req.url, "http://localhost");
    url.searchParams.getAll(key).forEach(function (x) {
      if (x) out.push(String(x));
    });
  } catch (e) {}
  return out;
}

function resolveCatchAllAction(req, routes, pathRe) {
  var list = collectQueryValues(req, "action");
  if (req.url && pathRe) {
    var m = String(req.url).match(pathRe);
    if (m && m[1]) list.unshift(decodeURIComponent(m[1]));
  }
  for (var i = 0; i < list.length; i++) {
    if (routes[list[i]]) return list[i];
  }
  return list[0] || "";
}

function resolveInnerOp(req, allowed, fallback, body) {
  var list = [];
  ["op", "mode", "sub"].forEach(function (k) {
    collectQueryValues(req, k).forEach(function (v) {
      list.push(v);
    });
  });
  collectQueryValues(req, "action").forEach(function (v) {
    if (allowed[v]) list.push(v);
  });
  if (body && typeof body === "object") {
    ["op", "mode", "action"].forEach(function (k) {
      if (body[k]) list.push(String(body[k]));
    });
  }
  for (var i = 0; i < list.length; i++) {
    if (allowed[list[i]]) return list[i];
  }
  return fallback;
}

module.exports = {
  collectQueryValues,
  resolveCatchAllAction,
  resolveInnerOp,
};
