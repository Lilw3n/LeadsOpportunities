#!/usr/bin/env node
/**
 * Crée les formulaires Meta Lead Ads sur la page Facebook via Graph API.
 *
 * Prérequis Vercel / .env :
 *   META_PAGE_ACCESS_TOKEN — token page avec pages_manage_ads + leads_retrieval
 *   META_PAGE_ID — 1183829618147455
 *
 * Usage :
 *   node scripts/meta-create-lead-forms.cjs --dry-run
 *   node scripts/meta-create-lead-forms.cjs --create
 *   node scripts/meta-create-lead-forms.cjs --create --template=vtc_express
 */
const fs = require("fs");
const path = require("path");
const {
  buildLeadFormPayload,
  buildFormRegistryEntry,
  DEFAULT_PRIVACY_URL,
} = require("../api/_lib/meta-lead-form-builder");

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, "config/meta-lead-forms.json");
const RANKING_PATH = path.join(ROOT, "data/meta-blog-form-ranking.json");
const LOG_PATH = path.join(ROOT, "data/meta-lead-forms-created.json");

function getArg(name) {
  var prefix = "--" + name + "=";
  var hit = process.argv.find(function (a) {
    return a.indexOf(prefix) === 0;
  });
  return hit ? hit.slice(prefix.length) : null;
}

function hasFlag(flag) {
  return process.argv.indexOf("--" + flag) >= 0;
}

function getToken() {
  return (
    process.env.META_PAGE_ACCESS_TOKEN ||
    process.env.META_SYSTEM_USER_TOKEN ||
    ""
  ).trim();
}

function getVersion() {
  return process.env.META_CAPI_VERSION || "v20.0";
}

async function graphGet(pathSuffix, token) {
  var url =
    "https://graph.facebook.com/" +
    getVersion() +
    pathSuffix +
    (pathSuffix.indexOf("?") >= 0 ? "&" : "?") +
    "access_token=" +
    encodeURIComponent(token);
  var r = await fetch(url);
  var text = await r.text();
  if (!r.ok) throw new Error("Graph GET " + r.status + ": " + text.slice(0, 500));
  return JSON.parse(text);
}

async function resolvePageToken(userOrPageToken, pageId) {
  var me = await graphGet("/me?fields=id,name", userOrPageToken);
  if (String(me.id) === String(pageId)) {
    return userOrPageToken;
  }
  var accounts = await graphGet("/me/accounts?fields=id,access_token&limit=50", userOrPageToken);
  var hit = (accounts.data || []).find(function (p) {
    return String(p.id) === String(pageId);
  });
  if (hit && hit.access_token) return hit.access_token;
  throw new Error(
    "Token utilisateur sans accès page " +
      pageId +
      " — regénérez un token Page dans Graph API Explorer."
  );
}

async function graphArchiveForm(formId, token) {
  var url = "https://graph.facebook.com/" + getVersion() + "/" + formId;
  var body = new URLSearchParams();
  body.set("access_token", token);
  body.set("status", "ARCHIVED");
  var r = await fetch(url, { method: "POST", body: body });
  var text = await r.text();
  if (!r.ok) throw new Error("Graph archive " + formId + " " + r.status + ": " + text.slice(0, 400));
  return JSON.parse(text);
}

async function archiveActiveForms(pageId, token) {
  var listed = await graphGet(
    "/" + pageId + "/leadgen_forms?fields=id,name,status&limit=50",
    token
  );
  var active = (listed.data || []).filter(function (f) {
    return f.status === "ACTIVE";
  });
  for (var i = 0; i < active.length; i++) {
    var f = active[i];
    await graphArchiveForm(f.id, token);
    console.log("  Archivé:", f.id, "—", f.name);
  }
  return active.length;
}

async function graphPostForm(pageId, token, payload) {
  var url = "https://graph.facebook.com/" + getVersion() + "/" + pageId + "/leadgen_forms";
  var body = new URLSearchParams();
  body.set("access_token", token);
  body.set("name", payload.name);
  body.set("locale", payload.locale || "fr_FR");
  body.set("follow_up_action_url", payload.follow_up_action_url);
  body.set("privacy_policy", JSON.stringify(payload.privacy_policy));
  body.set("questions", JSON.stringify(payload.questions));
  if (payload.context_card) {
    body.set("context_card", JSON.stringify(payload.context_card));
  }

  var r = await fetch(url, { method: "POST", body: body });
  var text = await r.text();
  if (!r.ok) throw new Error("Graph POST leadgen_forms " + r.status + ": " + text.slice(0, 800));
  return JSON.parse(text);
}

function loadRanking() {
  if (!fs.existsSync(RANKING_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(RANKING_PATH, "utf8"));
  } catch (e) {
    return null;
  }
}

function saveConfig(cfg) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2) + "\n");
}

async function main() {
  var dryRun = hasFlag("dry-run") || !hasFlag("create");
  var onlyTemplate = getArg("template");
  var replaceAll = hasFlag("replace");
  var archiveOnly = hasFlag("archive-active");
  var rawToken = getToken();
  var cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  var pageId = process.env.META_PAGE_ID || cfg.page_id;
  var ranking = loadRanking();
  var token = rawToken;

  if (!pageId) {
    console.error("META_PAGE_ID ou config.page_id manquant");
    process.exit(1);
  }

  if (rawToken && !dryRun) {
    try {
      token = await resolvePageToken(rawToken, pageId);
      console.log("Token Page résolu pour", pageId);
    } catch (e) {
      console.warn("resolvePageToken:", e.message);
    }
  }

  console.log("Page Meta:", pageId);
  console.log("Mode:", dryRun ? "DRY-RUN (ajoutez --create pour publier)" : "CREATE");
  if (replaceAll) console.log("Option: --replace (archive actifs + recréer)");
  console.log("Privacy:", DEFAULT_PRIVACY_URL);

  if ((replaceAll || archiveOnly) && !dryRun && token) {
    var n = await archiveActiveForms(pageId, token);
    console.log("Formulaires ACTIVE archivés:", n);
    if (replaceAll) {
      cfg.forms = {};
      saveConfig(cfg);
      console.log("Config forms{} vidé");
    }
    if (archiveOnly) {
      process.exit(0);
    }
  }

  var existingForms = [];
  if (!dryRun && token) {
    try {
      var listed = await graphGet(
        "/" + pageId + "/leadgen_forms?fields=id,name,status,leads_count&limit=50",
        token
      );
      existingForms = (listed.data || []).filter(function (f) {
        return f.status === "ACTIVE";
      });
      console.log("Formulaires ACTIVE sur la page:", existingForms.length);
    } catch (e) {
      console.warn("Liste formulaires:", e.message);
    }
  }

  var templates = cfg.form_templates || {};
  var keys = Object.keys(templates).sort(function (a, b) {
    return (templates[a].priority || 99) - (templates[b].priority || 99);
  });
  if (onlyTemplate) {
    keys = keys.filter(function (k) {
      return k === onlyTemplate;
    });
  }

  var results = [];
  var formsRegistry = Object.assign({}, cfg.forms || {});

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var template = templates[key];
    var payload = buildLeadFormPayload(template, cfg, {
      nameSuffix: replaceAll || hasFlag("fresh-names") ? " · LO 2026" : "",
    });

    var existingByName = existingForms.find(function (f) {
      return f.name === payload.name && f.status === "ACTIVE";
    });
    if (existingByName) {
      console.log("\n✓ Déjà existant:", key, "→", existingByName.id, existingByName.name);
      formsRegistry[String(existingByName.id)] = Object.assign(
        { template: key, vertical: template.vertical, campaign: template.campaign, landing: template.landing },
        buildFormRegistryEntry(key, template, existingByName.id, ranking)
      );
      results.push({ template: key, form_id: existingByName.id, status: "existing" });
      continue;
    }

    if (formsRegistry && Object.values(formsRegistry).some(function (e) { return e.template === key; })) {
      var regId = Object.keys(formsRegistry).find(function (id) {
        return formsRegistry[id].template === key;
      });
      console.log("\n✓ Déjà en config:", key, "→", regId);
      results.push({ template: key, form_id: regId, status: "configured" });
      continue;
    }

    console.log("\n→ Template:", key, "—", template.name);
    console.log("  Questions:", payload.questions.length);
    console.log("  Follow-up:", payload.follow_up_action_url);
    if (ranking && ranking.byTemplate) {
      var block = ranking.byTemplate.find(function (b) {
        return b.templateKey === key;
      });
      if (block && block.articles[0]) {
        console.log("  Top blog:", block.articles[0].slug, "(score", block.articles[0].score + ")");
      }
    }

    if (dryRun) {
      console.log("  [dry-run] payload questions:", JSON.stringify(payload.questions, null, 2).slice(0, 400) + "...");
      results.push({ template: key, status: "dry_run", payload: payload });
      continue;
    }

    if (!token) {
      console.error("\nMETA_PAGE_ACCESS_TOKEN manquant — impossible de créer sur Meta.");
      console.error("Ajoutez le token sur Vercel puis: node scripts/meta-create-lead-forms.cjs --create");
      process.exit(1);
    }

    try {
      var created = await graphPostForm(pageId, token, payload);
      var formId = String(created.id);
      console.log("  ✓ Créé form_id:", formId);
      formsRegistry[formId] = Object.assign(
        {
          template: key,
          vertical: template.vertical,
          campaign: template.campaign,
          landing: template.landing,
          name: template.name,
        },
        buildFormRegistryEntry(key, template, formId, ranking)
      );
      results.push({ template: key, form_id: formId, status: "created" });
    } catch (err) {
      console.error("  ✗ Erreur:", err.message);
      results.push({ template: key, status: "error", error: err.message });
    }
  }

  if (!dryRun && results.some(function (r) { return r.status === "created" || r.status === "existing"; })) {
    cfg.forms = formsRegistry;
    saveConfig(cfg);
    console.log("\nConfig mise à jour:", CONFIG_PATH);
  }

  fs.writeFileSync(
    LOG_PATH,
    JSON.stringify({ at: new Date().toISOString(), pageId: pageId, dryRun: dryRun, results: results }, null, 2)
  );
  console.log("Log:", LOG_PATH);

  if (dryRun) {
    console.log("\nPour créer sur Meta : META_PAGE_ACCESS_TOKEN=... node scripts/meta-create-lead-forms.cjs --create");
  }
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
