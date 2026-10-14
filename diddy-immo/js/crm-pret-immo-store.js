/**
 * Persistance dossiers Prêt Immo (localStorage + sync optionnelle).
 */
window.CrmPretImmoStore = (function () {
  var KEY = "lo_crm_pret_immo_v1";
  var Lib = null;

  function getLib() {
    if (!Lib) Lib = window.CrmPretImmo;
    return Lib;
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function save(db) {
    localStorage.setItem(KEY, JSON.stringify(db));
  }

  function ensure() {
    var db = load();
    if (!Array.isArray(db.dossiers)) db.dossiers = [];
    return db;
  }

  function uid() {
    return "prt_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function nextRef() {
    var db = ensure();
    var n = (db.seq || 1000) + 1;
    db.seq = n;
    save(db);
    return "PI-" + n;
  }

  function list(query) {
    var db = ensure();
    var q = query || {};
    var list = db.dossiers.slice();
    if (!q.includeArchived) {
      list = list.filter(function (d) {
        return !d.archived && d.position !== "archive";
      });
    }
    if (q.rubrique) {
      list = list.filter(function (d) {
        return d.rubrique === q.rubrique;
      });
    }
    if (q.position) {
      list = list.filter(function (d) {
        return d.position === q.position;
      });
    }
    if (q.ref) {
      var r = String(q.ref).toLowerCase();
      list = list.filter(function (d) {
        return String(d.ref || "").toLowerCase().indexOf(r) !== -1;
      });
    }
    if (q.search) {
      var s = String(q.search).toLowerCase();
      list = list.filter(function (d) {
        var hay = [
          d.ref,
          getLib().displayName(d.emprunteur),
          getLib().displayName(d.coemprunteur),
          d.banque,
          d.produit,
          d.apporteur,
        ]
          .join(" ")
          .toLowerCase();
        return hay.indexOf(s) !== -1;
      });
    }
    list.sort(function (a, b) {
      return String(b.updated_at || b.created_at || "").localeCompare(String(a.updated_at || a.created_at || ""));
    });
    return list;
  }

  function get(id) {
    return (
      ensure().dossiers.find(function (d) {
        return d.id === id;
      }) || null
    );
  }

  function upsert(input) {
    var L = getLib();
    var db = ensure();
    var item = L.emptyDossier(input || {});
    if (!item.id) item.id = uid();
    if (!item.ref) item.ref = nextRef();
    item.updated_at = new Date().toISOString();
    if (!item.created_at) item.created_at = item.updated_at;
    var syn = L.synthesize(item);
    item.montant = item.montant || syn.besoinTotal;
    var idx = db.dossiers.findIndex(function (d) {
      return d.id === item.id;
    });
    if (idx >= 0) db.dossiers[idx] = Object.assign({}, db.dossiers[idx], item);
    else db.dossiers.unshift(item);
    save(db);
    return item;
  }

  function remove(id) {
    var db = ensure();
    db.dossiers = db.dossiers.filter(function (d) {
      return d.id !== id;
    });
    save(db);
  }

  function archive(id, on) {
    var d = get(id);
    if (!d) return null;
    d.archived = on !== false;
    if (d.archived) d.position = "archive";
    return upsert(d);
  }

  return {
    list: list,
    get: get,
    upsert: upsert,
    remove: remove,
    archive: archive,
    nextRef: nextRef,
  };
})();
