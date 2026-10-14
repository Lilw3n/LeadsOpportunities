/**
 * Store relations personnes — localStorage + sync API Neon.
 */
window.CrmRelationsStore = (function () {
  var KEY = "lo_crm_relations_v1";
  var Rel = window.CrmPeopleRelations;

  function uid() {
    return (
      "rel_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 8)
    );
  }

  function loadLocal() {
    try {
      var raw = localStorage.getItem(KEY);
      var db = raw ? JSON.parse(raw) : null;
      if (!db || !Array.isArray(db.relations)) return { relations: [] };
      db.relations = db.relations.map(function (r) {
        return Rel ? Rel.stripPromises(r) : r;
      });
      return db;
    } catch (e) {
      return { relations: [] };
    }
  }

  function saveLocal(db) {
    localStorage.setItem(KEY, JSON.stringify(db));
    return db;
  }

  function token() {
    return localStorage.getItem("lo_token") || "";
  }

  async function api(method, path, body) {
    var opts = {
      method: method,
      headers: {
        Authorization: "Bearer " + token(),
        "Content-Type": "application/json",
      },
    };
    if (body != null) opts.body = JSON.stringify(body);
    var res = await fetch(path, opts);
    var data = await res.json().catch(function () {
      return {};
    });
    if (!res.ok || data.ok === false) {
      var err = new Error(data.error || "API relations");
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  function listLocal(contactId, relType) {
    return loadLocal().relations.filter(function (r) {
      if (relType && r.rel_type !== relType) return false;
      if (!contactId) return true;
      return r.from_contact_id === contactId || r.to_contact_id === contactId;
    });
  }

  async function list(opts) {
    opts = opts || {};
    var q = [];
    if (opts.contactId) q.push("contactId=" + encodeURIComponent(opts.contactId));
    if (opts.relType) q.push("relType=" + encodeURIComponent(opts.relType));
    try {
      var data = await api("GET", "/api/crm/relations" + (q.length ? "?" + q.join("&") : ""));
      if (data && Array.isArray(data.relations)) {
        if (!opts.contactId && !opts.relType) {
          saveLocal({ relations: data.relations });
        }
        return data.relations;
      }
    } catch (e) {
      /* offline */
    }
    return listLocal(opts.contactId, opts.relType);
  }

  async function upsert(input) {
    var norm = Rel.normalizeRelationship(input);
    if (!norm.id) norm.id = uid();
    try {
      var data = await api("POST", "/api/crm/relations", norm);
      if (data && data.relation) {
        mergeLocal(data.relation);
        return data.relation;
      }
    } catch (e) {
      if (e && e.data && e.data.code === "no_promise") throw e;
    }
    var db = loadLocal();
    var idx = db.relations.findIndex(function (r) {
      return (
        r.id === norm.id ||
        (r.from_contact_id === norm.from_contact_id &&
          r.to_contact_id === norm.to_contact_id &&
          r.rel_type === norm.rel_type)
      );
    });
    var now = new Date().toISOString();
    var item = Object.assign({}, idx >= 0 ? db.relations[idx] : {}, norm, {
      updated_at: now,
    });
    if (!item.created_at) item.created_at = now;
    if (idx >= 0) db.relations[idx] = item;
    else db.relations.unshift(item);
    saveLocal(db);
    return item;
  }

  function mergeLocal(item) {
    var db = loadLocal();
    var idx = db.relations.findIndex(function (r) {
      return r.id === item.id;
    });
    if (idx >= 0) db.relations[idx] = Object.assign({}, db.relations[idx], item);
    else db.relations.unshift(item);
    saveLocal(db);
  }

  async function remove(id) {
    try {
      await api("DELETE", "/api/crm/relations?id=" + encodeURIComponent(id));
    } catch (e) {
      /* offline */
    }
    var db = loadLocal();
    db.relations = db.relations.filter(function (r) {
      return r.id !== id;
    });
    saveLocal(db);
  }

  return {
    KEY: KEY,
    list: list,
    listLocal: listLocal,
    upsert: upsert,
    remove: remove,
  };
})();
