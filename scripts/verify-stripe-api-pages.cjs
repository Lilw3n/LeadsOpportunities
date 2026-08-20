#!/usr/bin/env node
/**
 * Vérifie les pages HTML navigateur pour webhook / readiness Stripe.
 */
var path = require("path");
var assert = require("assert");
var browserPage = require("../api/_lib/api-browser-page");
var failed = 0;

function ok(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

function mockRes() {
  var out = { statusCode: 200, headers: {}, body: "" };
  return {
    out: out,
    statusCode: 200,
    setHeader: function (k, v) {
      out.headers[k] = v;
    },
    status: function (n) {
      out.statusCode = n;
      this.statusCode = n;
      return this;
    },
    json: function (obj) {
      out.body = JSON.stringify(obj);
      out.headers["Content-Type"] = "application/json";
      return this;
    },
    end: function (html) {
      out.body = html || "";
      return this;
    },
  };
}

ok(browserPage.wantsHtml({ method: "GET", headers: { accept: "text/html" } }), "GET + Accept html");
ok(!browserPage.wantsHtml({ method: "GET", headers: { accept: "application/json" } }), "GET + Accept json");
ok(!browserPage.wantsHtml({ method: "POST", headers: { accept: "text/html" } }), "POST pas HTML");

var resHtml = mockRes();
browserPage.sendApiResult(
  { method: "GET", headers: { accept: "text/html" } },
  resHtml,
  {
    status: 405,
    title: "Webhook Stripe",
    lead: "POST uniquement",
    json: { error: "Method not allowed" },
  }
);
ok(String(resHtml.out.headers["Content-Type"] || "").indexOf("text/html") >= 0, "Content-Type HTML");
ok(String(resHtml.out.body).indexOf("Leads Opportunities") >= 0, "marque dans HTML");
ok(String(resHtml.out.body).indexOf("Webhook Stripe") >= 0, "titre dans HTML");
ok(String(resHtml.out.body).indexOf("Method not allowed") >= 0, "JSON technique inclus");

var resJson = mockRes();
browserPage.sendApiResult(
  { method: "GET", headers: { accept: "application/json" } },
  resJson,
  {
    status: 405,
    title: "Webhook Stripe",
    json: { error: "Method not allowed" },
  }
);
ok(String(resJson.out.body).indexOf('"error":"Method not allowed"') >= 0, "JSON inchangé pour clients API");

require("child_process").execFileSync(process.execPath, ["--check", path.join(__dirname, "../api/stripe/webhook.js")]);
require("child_process").execFileSync(process.execPath, [
  "--check",
  path.join(__dirname, "../api/_lib/routes/stripe-readiness.js"),
]);
require("child_process").execFileSync(process.execPath, [
  "--check",
  path.join(__dirname, "../api/_lib/api-browser-page.js"),
]);
ok(true, "syntaxe webhook + readiness + helper");

// Chargement readiness (sans appeler Stripe)
var readiness = require("../api/_lib/routes/stripe-readiness");
ok(typeof readiness === "function", "handler readiness exporté");

var webhook = require("../api/stripe/webhook");
ok(typeof webhook === "function", "handler webhook exporté");

var html = require("fs").readFileSync(path.join(__dirname, "../crm-stripe.html"), "utf8");
ok(html.indexOf("js/crm-stripe.js") >= 0, "page CRM Stripe");
ok(require("fs").readFileSync(path.join(__dirname, "../js/crm-sidebar.js"), "utf8").indexOf("crm-stripe.html") >= 0, "lien sidebar");

var whRes = mockRes();
webhook({ method: "GET", headers: { accept: "text/html,application/xhtml+xml" } }, whRes).then(function () {
  ok(String(whRes.out.body).indexOf("Webhook Stripe") >= 0, "webhook GET → page HTML");
  ok(whRes.statusCode === 405 || whRes.out.statusCode === 405, "webhook GET → 405");

  if (failed) {
    console.log("\n" + failed + " échec(s)");
    process.exit(1);
  }
  console.log("\nTous les contrôles pages Stripe sont OK.");
}).catch(function (e) {
  console.error(e);
  process.exit(1);
});
