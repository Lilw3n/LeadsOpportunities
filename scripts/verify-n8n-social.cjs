#!/usr/bin/env node
var fs = require("fs");
var path = require("path");
var queue = require("./build-social-queue.cjs");

var failed = 0;
function assert(ok, msg) {
  if (ok) console.log("OK  ", msg);
  else {
    failed++;
    console.log("FAIL", msg);
  }
}

var data = queue.buildQueue();
assert(data.count > 50, "file sociale : plus de 50 articles (" + data.count + ")");
assert(data.facebookPageId === "61591265349051", "page Facebook du site");
assert(data.posts[0] && data.posts[0].rank === 1 && data.posts[0].section === "vtc", "VTC en tête");

var urls = data.posts.map(function (post) {
  return post.url;
});
assert(urls.indexOf("https://www.leadsopportunities.fr/blog/assurance-streamer-gaming-setup-materiel.html") === -1, "sujet international absent");
assert(
  data.posts.every(function (post) {
    return post.message.indexOf("15005935") >= 0 && post.link.indexOf("utm_source=facebook") >= 0 && post.message.indexOf("€") === -1;
  }),
  "ORIAS, lien UTM, aucun prix en euros"
);

var wf = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "n8n/workflows/blog-vers-reseaux.json"), "utf8"));
var names = wf.nodes.map(function (node) {
  return node.name;
});
assert(names.indexOf("Jours ouvres 10h") >= 0 && names.indexOf("Publier sur la Page Facebook") >= 0, "workflow n8n");
var raw = JSON.stringify(wf);
assert(raw.indexOf("https://www.leadsopportunities.fr/social/queue.json") >= 0, "le workflow lit la file publique");
assert(raw.indexOf("graph.facebook.com") >= 0, "publication Facebook");
assert(raw.indexOf("n8n.cloud") === -1, "pas d'appel à n8n Cloud");

var compose = fs.readFileSync(path.join(__dirname, "..", "n8n/docker-compose.yml"), "utf8");
assert(compose.indexOf("n8nio/n8n:1.109.2") >= 0, "image community épinglée");
assert(compose.indexOf("127.0.0.1:5678:5678") >= 0, "n8n reste sur la machine");
assert(compose.indexOf("N8N_LICENSE") === -1, "pas de licence payante");

var doc = fs.readFileSync(path.join(__dirname, "..", "docs/N8N-RESEAUX-GRATUIT.md"), "utf8");
assert(doc.indexOf("./demarrer.sh") >= 0 && doc.indexOf("15005935") >= 0, "mode d'emploi");
assert(doc.indexOf("À prendre") >= 0 && doc.indexOf("./demarrer.sh") >= 0 && doc.indexOf("Oracle Cloud Always Free") >= 0, "chemin 0 €");
assert(doc.indexOf("Trop cher") >= 0 && doc.indexOf("Supabase") >= 0 && doc.indexOf("Heroku") >= 0 && doc.indexOf("Render gratuit") >= 0, "hébergeurs payants écartés");

var serveur = fs.readFileSync(path.join(__dirname, "..", "n8n/docker-compose.serveur.yml"), "utf8");
assert(serveur.indexOf("n8nio/n8n:1.109.2") >= 0 && serveur.indexOf("caddy:2.8") >= 0, "HTTPS sur le droplet");
assert(serveur.indexOf("5678:5678") === -1, "le port n8n n'est pas ouvert sur Internet");
assert(fs.readFileSync(path.join(__dirname, "..", "n8n/Caddyfile"), "utf8").indexOf("reverse_proxy n8n:5678") >= 0, "Caddy vers n8n");

if (failed) {
  console.log("\n" + failed + " échec(s)");
  process.exit(1);
}
console.log("\nContrôles n8n réseaux OK.");
