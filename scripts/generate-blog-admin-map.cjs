const fs = require("fs");
const path = require("path");
const manifest = require("./blog-articles-manifest.cjs");
const { listAdminRows } = require("./blog-questionnaire-bridge.cjs");

var rows = listAdminRows(manifest.articles.filter(function (a) {
  return !a.skipGenerate;
}));
var sections = [];
rows.forEach(function (r) {
  if (sections.indexOf(r.section) === -1) sections.push(r.section);
});
sections.sort();

var out = {
  updated: new Date().toISOString().slice(0, 10),
  sections: sections,
  rows: rows,
};

var dest = path.join(__dirname, "..", "data", "blog-questionnaire-admin.json");
fs.writeFileSync(dest, JSON.stringify(out, null, 2) + "\n");
console.log("written:", dest, "—", rows.length, "articles");
