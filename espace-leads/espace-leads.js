/**
 * Session légère Espace Leads (localStorage) + helpers pack.
 */
(function (global) {
  var KEY = "lo_espace_leads_v1";

  function readStore() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function writeStore(obj) {
    localStorage.setItem(KEY, JSON.stringify(obj || {}));
  }

  function normalizeEmail(email) {
    return String(email || "")
      .trim()
      .toLowerCase();
  }

  function login(email, password) {
    email = normalizeEmail(email);
    if (!email || email.indexOf("@") < 1) throw new Error("E-mail invalide");
    if (!password || String(password).length < 6) {
      throw new Error("Mot de passe : 6 caractères minimum");
    }
    var store = readStore();
    var users = store.users || {};
    var hash = simpleHash(email + "|" + password);
    if (users[email] && users[email] !== hash) {
      throw new Error("Mot de passe incorrect pour cet e-mail");
    }
    if (!users[email]) users[email] = hash;
    store.users = users;
    store.session = {
      email: email,
      at: new Date().toISOString(),
    };
    writeStore(store);
    return store.session;
  }

  function logout() {
    var store = readStore();
    delete store.session;
    writeStore(store);
  }

  function session() {
    var store = readStore();
    return store.session || null;
  }

  function requireSession(redirectUrl) {
    var s = session();
    if (s) return s;
    var next = redirectUrl || location.pathname.split("/").pop() + location.search;
    location.href =
      "connexion.html?next=" + encodeURIComponent(next.replace(/^\.\//, ""));
    return null;
  }

  function simpleHash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }
    return "h" + (h >>> 0).toString(16);
  }

  function rememberPack(token) {
    if (!token) return;
    var store = readStore();
    var packs = store.packs || [];
    if (packs.indexOf(token) === -1) packs.push(token);
    store.packs = packs.slice(-40);
    writeStore(store);
  }

  function knownPacks() {
    return (readStore().packs || []).slice();
  }

  async function fetchPack(token) {
    var res = await fetch(
      "/api/espace-leads-pack?token=" + encodeURIComponent(token)
    );
    var data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || "Pack introuvable");
    }
    rememberPack(token);
    return data.pack;
  }

  global.EspaceLeads = {
    login: login,
    logout: logout,
    session: session,
    requireSession: requireSession,
    fetchPack: fetchPack,
    rememberPack: rememberPack,
    knownPacks: knownPacks,
    normalizeEmail: normalizeEmail,
  };
})(window);
