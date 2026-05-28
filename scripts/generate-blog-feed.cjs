const fs = require("fs");
const path = require("path");

const blogDir = path.join(__dirname, "..", "blog");
const { SITE_ORIGIN: base } = require("./site-url.cjs");

const articles = [
  { file: "assurance-animaux-comment-choisir.html", title: "Assurance animaux : comment choisir" },
  { file: "assurance-chien-frais-veterinaires.html", title: "Assurance chien : frais veterinaires" },
  { file: "assurance-chat-guide-complet.html", title: "Assurance chat : guide complet" },
  { file: "assurance-chiot-chaton-quand-assurer.html", title: "Chiot et chaton : quand assurer ?" },
  { file: "comparatif-santevet-bulle-bleue-kozoo.html", title: "Comparatif Santévet, Bulle Bleue, Kozoo" },
  { file: "assurance-vtc-moins-cher-2026.html", title: "Assurance VTC moins cher en 2026" },
  { file: "mutuelle-sante-5-criteres.html", title: "Mutuelle sante : 5 criteres" },
  { file: "pret-immo-erreurs-a-eviter.html", title: "Pret immo : erreurs a eviter" },
  { file: "assurance-auto-bonus-malus.html", title: "Assurance auto et bonus-malus" },
  { file: "prevoyance-independants-guide.html", title: "Prevoyance pour independants" },
];

var today = new Date().toISOString().slice(0, 10);

var items = articles
  .filter(function (a) {
    return fs.existsSync(path.join(blogDir, a.file));
  })
  .map(function (a) {
    return (
      "  <item>\n    <title>" +
      escapeXml(a.title) +
      "</title>\n    <link>" +
      base +
      "/blog/" +
      a.file +
      "</link>\n    <guid isPermaLink=\"true\">" +
      base +
      "/blog/" +
      a.file +
      "</guid>\n    <pubDate>" +
      today +
      "</pubDate>\n  </item>"
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
  "<description>Conseils assurance animaux, VTC, sante et credit</description>\n" +
  "<language>fr-FR</language>\n" +
  items +
  "\n</channel></rss>";

fs.writeFileSync(path.join(blogDir, "feed.xml"), xml);
console.log("blog/feed.xml — " + articles.length + " articles");

function escapeXml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
