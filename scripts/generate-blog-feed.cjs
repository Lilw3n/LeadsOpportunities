const fs = require("fs");
const path = require("path");

const blogDir = path.join(__dirname, "..", "blog");
const base = "https://leads-opportunities.vercel.app";

const articles = [
  { file: "assurance-vtc-moins-cher-2026.html", title: "Assurance VTC moins cher en 2026" },
  { file: "mutuelle-sante-5-criteres.html", title: "Mutuelle sante : 5 criteres" },
  { file: "pret-immo-erreurs-a-eviter.html", title: "Pret immo : erreurs a eviter" },
  { file: "assurance-auto-bonus-malus.html", title: "Assurance auto et bonus-malus" },
  { file: "prevoyance-independants-guide.html", title: "Prevoyance pour independants" },
];

var items = articles
  .filter(function (a) {
    return fs.existsSync(path.join(blogDir, a.file));
  })
  .map(function (a) {
    return (
      "  <item><title>" +
      escapeXml(a.title) +
      "</title><link>" +
      base +
      "/blog/" +
      a.file +
      "</link><guid>" +
      base +
      "/blog/" +
      a.file +
      "</guid></item>"
    );
  })
  .join("\n");

var xml =
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<rss version="2.0"><channel>\n' +
  "<title>Leads Opportunities Blog</title>\n" +
  "<link>" +
  base +
  "/blog/</link>\n" +
  "<description>Conseils assurance et credit immobilier</description>\n" +
  items +
  "\n</channel></rss>";

fs.writeFileSync(path.join(blogDir, "feed.xml"), xml);
console.log("blog/feed.xml generated");

function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
