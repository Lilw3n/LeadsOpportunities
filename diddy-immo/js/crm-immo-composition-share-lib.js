/**
 * Partage public de composition + forks utilisateur (couleurs d’auteur).
 * Stockage local (même modèle que le CRM immo) — token public sans PII sensible.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CrmImmoCompositionShare = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var FORKS_KEY = "lo_immo_composition_forks_v1";
  var AGENT_COLOR = "#0f766e";
  var USER_COLOR = "#c2410c";

  function uid(prefix) {
    return (
      (prefix || "id") +
      "_" +
      Math.random().toString(36).slice(2, 8) +
      Date.now().toString(36).slice(-4)
    );
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function readForks() {
    try {
      var raw = localStorage.getItem(FORKS_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function writeForks(list) {
    localStorage.setItem(FORKS_KEY, JSON.stringify(list || []));
  }

  function currentUser() {
    try {
      var u = JSON.parse(localStorage.getItem("lo_user") || "{}");
      if (!u || (!u.id && !u.email && !u.name)) return null;
      return {
        id: String(u.id || u.email || u.name),
        name: u.name || u.email || "Utilisateur",
        email: u.email || "",
        color: USER_COLOR,
        role: "user",
      };
    } catch (e) {
      return null;
    }
  }

  function isConnected() {
    return !!(localStorage.getItem("lo_token") && currentUser());
  }

  function agentFromUser() {
    var u = currentUser() || {};
    return {
      id: u.id || "agent",
      name: u.name || "Mandataire",
      email: u.email || "",
      color: AGENT_COLOR,
      role: "agent",
    };
  }

  function cloneUnits(units) {
    return JSON.parse(JSON.stringify(Array.isArray(units) ? units : []));
  }

  function safeSnapshotFromProperty(prop) {
    prop = prop || {};
    var loc = (prop.details && prop.details.localisation) || {};
    return {
      property_id: prop.id,
      title: prop.title || "Bien",
      property_type: prop.property_type,
      transaction: prop.transaction,
      city: prop.city || loc.ville || "",
      postal_code: prop.postal_code || loc.code_postal || "",
      units: cloneUnits(prop.units),
      localisation_public: {
        ville: loc.ville || prop.city || "",
        code_postal: loc.code_postal || prop.postal_code || "",
        quartier: loc.quartier || "",
        section_cadastrale: loc.section_cadastrale || "",
        numero_cadastre: loc.numero_cadastre || "",
        cadastre_ref_immeuble: loc.cadastre_ref_immeuble || "",
      },
      note_publique:
        "Synthèse renseignée par le mandataire pour coller au plus près à la réalité du bien.",
    };
  }

  function publish(prop, opts) {
    opts = opts || {};
    if (!prop || !prop.id) throw new Error("Bien manquant");
    var agent = opts.agent || agentFromUser();
    var share = Object.assign({}, prop.composition_share || {});
    if (!share.token) share.token = uid("cmp");
    share.enabled = true;
    share.published_at = nowIso();
    share.published_by = agent;
    share.label = opts.label || "Version publique — synthèse du bien";
    share.snapshot = safeSnapshotFromProperty(prop);
    share.snapshot.published_by = agent;
    prop.composition_share = share;
    return share;
  }

  function unpublish(prop) {
    if (!prop) return null;
    if (!prop.composition_share) prop.composition_share = {};
    prop.composition_share.enabled = false;
    prop.composition_share.unpublished_at = nowIso();
    return prop.composition_share;
  }

  function getPublicByToken(token, storeGetProperty) {
    token = String(token || "").trim();
    if (!token) return null;
    // 1) forks list may reference base
    var forks = readForks();
    // 2) scan properties in store if available
    if (typeof storeGetProperty === "function") {
      /* caller may pass finder */
    }
    if (typeof window !== "undefined" && window.CrmImmoStore) {
      var list = window.CrmImmoStore.listProperties ? window.CrmImmoStore.listProperties() : [];
      if (!list.length && window.CrmImmoStore.getAll) list = window.CrmImmoStore.getAll().properties || [];
      for (var i = 0; i < list.length; i++) {
        var p = list[i];
        var sh = p && p.composition_share;
        if (sh && sh.enabled && sh.token === token && sh.snapshot) {
          return { kind: "public", token: token, share: sh, property: p, snapshot: sh.snapshot };
        }
      }
    }
    // orphaned snapshot embedded in a fork base_snapshot
    for (var j = 0; j < forks.length; j++) {
      if (forks[j].base_token === token && forks[j].base_snapshot) {
        return {
          kind: "public",
          token: token,
          share: { token: token, enabled: true, snapshot: forks[j].base_snapshot, published_by: forks[j].base_snapshot.published_by },
          snapshot: forks[j].base_snapshot,
          property: null,
        };
      }
    }
    return null;
  }

  function listForksForToken(token) {
    return readForks().filter(function (f) {
      return f.base_token === token;
    });
  }

  function listMyForks() {
    var u = currentUser();
    if (!u) return [];
    return readForks().filter(function (f) {
      return f.owner && f.owner.id === u.id;
    });
  }

  function getFork(forkId) {
    return (
      readForks().find(function (f) {
        return f.id === forkId;
      }) || null
    );
  }

  function createFork(publicPack, opts) {
    opts = opts || {};
    if (!isConnected()) throw new Error("Connexion requise pour sauvegarder une copie");
    var user = currentUser();
    var snap = publicPack && publicPack.snapshot;
    if (!snap) throw new Error("Synthèse publique introuvable");
    var agent = (publicPack.share && publicPack.share.published_by) || snap.published_by || {
      id: "agent",
      name: "Mandataire",
      color: AGENT_COLOR,
      role: "agent",
    };
    var fieldAuthors = {};
    (snap.units || []).forEach(function (u) {
      Object.keys(u || {}).forEach(function (k) {
        if (k === "id" || k === "parent_id") return;
        if (u[k] !== "" && u[k] != null) fieldAuthors[u.id + "." + k] = "agent";
      });
    });
    var fork = {
      id: uid("fork"),
      base_token: publicPack.token,
      property_id: snap.property_id || null,
      created_at: nowIso(),
      updated_at: nowIso(),
      owner: user,
      authors: {
        agent: { id: agent.id, name: agent.name || "Mandataire", color: agent.color || AGENT_COLOR, role: "agent" },
        user: { id: user.id, name: user.name, color: USER_COLOR, role: "user" },
      },
      base_snapshot: snap,
      units: cloneUnits(snap.units),
      field_authors: fieldAuthors,
      note: opts.note || "Ma copie de la synthèse du bien",
    };
    var all = readForks();
    all.unshift(fork);
    writeForks(all.slice(0, 80));
    return fork;
  }

  function saveFork(fork) {
    if (!fork || !fork.id) throw new Error("Fork invalide");
    fork.updated_at = nowIso();
    var all = readForks();
    var idx = all.findIndex(function (f) {
      return f.id === fork.id;
    });
    if (idx >= 0) all[idx] = fork;
    else all.unshift(fork);
    writeForks(all);
    return fork;
  }

  function markUserEdit(fork, unitId, fieldKey) {
    if (!fork.field_authors) fork.field_authors = {};
    fork.field_authors[unitId + "." + fieldKey] = "user";
    return fork;
  }

  function authorColor(fork, unitId, fieldKey) {
    var who = fork.field_authors && fork.field_authors[unitId + "." + fieldKey];
    if (who === "user") return (fork.authors && fork.authors.user && fork.authors.user.color) || USER_COLOR;
    if (who === "agent") return (fork.authors && fork.authors.agent && fork.authors.agent.color) || AGENT_COLOR;
    return "#94a3b8";
  }

  function unitAuthorMix(fork, unitId) {
    var keys = Object.keys(fork.field_authors || {}).filter(function (k) {
      return k.indexOf(unitId + ".") === 0;
    });
    var hasUser = keys.some(function (k) {
      return fork.field_authors[k] === "user";
    });
    var hasAgent = keys.some(function (k) {
      return fork.field_authors[k] === "agent";
    });
    if (hasUser && hasAgent) return "mixed";
    if (hasUser) return "user";
    if (hasAgent) return "agent";
    return "none";
  }

  function shortSynthesisText(tot, snap) {
    tot = tot || {};
    var city = (snap && (snap.city || (snap.localisation_public && snap.localisation_public.ville))) || "";
    return (
      (snap && snap.title ? snap.title : "Bien") +
      (city ? " · " + city : "") +
      " — " +
      (tot.units || 0) +
      " unité(s), " +
      (tot.loues || 0) +
      " louée(s), " +
      (Number(tot.surface_carrez) || 0) +
      " m² Carrez, loyers réels " +
      (Number(tot.loyer_reel) || 0) +
      " € / prév. " +
      (Number(tot.loyer_previsionnel) || 0) +
      " €."
    );
  }

  function longSynthesisHtml(tot, snap, opts) {
    opts = opts || {};
    tot = tot || {};
    var loc = (snap && snap.localisation_public) || {};
    var lines = [];
    lines.push(
      "<p><strong>Synthèse longue</strong> — dossier renseigné pour coller au plus près à la réalité du bien" +
        (snap && snap.published_by && snap.published_by.name
          ? " (saisie : " + String(snap.published_by.name).replace(/</g, "") + ")"
          : "") +
        ".</p>"
    );
    lines.push(
      "<ul>" +
        "<li><b>Structure</b> : " +
        (tot.units || 0) +
        " unités · " +
        (tot.loues || 0) +
        " louée(s) · " +
        (tot.baux_actifs || 0) +
        " bail(s)</li>" +
        "<li><b>Loyers</b> : réels " +
        (Number(tot.loyer_reel) || 0) +
        " € (HC " +
        (Number(tot.loyer_hc) || 0) +
        " / CC " +
        (Number(tot.loyer_cc) || 0) +
        ") · prévisionnels " +
        (Number(tot.loyer_previsionnel) || 0) +
        " € · charges " +
        (Number(tot.charges_locatives) || 0) +
        " €</li>" +
        "<li><b>Surfaces</b> : Carrez " +
        (Number(tot.surface_carrez) || 0) +
        " m² · hors Carrez " +
        (Number(tot.surface_non_carrez) || 0) +
        " m² · annoncée " +
        (Number(tot.surface_m2) || 0) +
        " m²</li>" +
        "<li><b>Pièces</b> : " +
        (Number(tot.nb_pieces) || 0) +
        " pcs / " +
        (Number(tot.nb_chambres) || 0) +
        " ch. · " +
        (Number(tot.nb_sdb) || 0) +
        " SDB / " +
        (Number(tot.nb_wc) || 0) +
        " WC / " +
        (Number(tot.nb_cuisines) || 0) +
        " cuisine(s)</li>" +
        (loc.ville || loc.section_cadastrale
          ? "<li><b>Localisation / cadastre</b> : " +
            [loc.ville, loc.code_postal, loc.section_cadastrale, loc.numero_cadastre, loc.cadastre_ref_immeuble]
              .filter(Boolean)
              .join(" · ") +
            "</li>"
          : "") +
        "</ul>"
    );
    if (opts.extraHtml) lines.push(opts.extraHtml);
    return '<div class="synthese-longue">' + lines.join("") + "</div>";
  }

  return {
    AGENT_COLOR: AGENT_COLOR,
    USER_COLOR: USER_COLOR,
    FORKS_KEY: FORKS_KEY,
    isConnected: isConnected,
    currentUser: currentUser,
    publish: publish,
    unpublish: unpublish,
    getPublicByToken: getPublicByToken,
    createFork: createFork,
    saveFork: saveFork,
    getFork: getFork,
    listForksForToken: listForksForToken,
    listMyForks: listMyForks,
    markUserEdit: markUserEdit,
    authorColor: authorColor,
    unitAuthorMix: unitAuthorMix,
    shortSynthesisText: shortSynthesisText,
    longSynthesisHtml: longSynthesisHtml,
    safeSnapshotFromProperty: safeSnapshotFromProperty,
  };
});
