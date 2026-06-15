const { execFileSync } = require("child_process");
const path = require("path");
const { getDueLeadGenerationArticles } = require("./blog-lead-editorial-calendar.cjs");

const ROOT = path.join(__dirname, "..");
const publishDate = process.env.BLOG_PUBLISH_DATE || new Date().toISOString().slice(0, 10);
const dueArticles = getDueLeadGenerationArticles({ publishDate: publishDate });

function run(script, args) {
  execFileSync(process.execPath, [path.join(__dirname, script)].concat(args || []), {
    cwd: ROOT,
    env: Object.assign({}, process.env, { BLOG_PUBLISH_DATE: publishDate }),
    stdio: "inherit",
  });
}

if (!dueArticles.length) {
  console.log("Aucun article lead du calendrier n'est du au", publishDate);
  process.exit(0);
}

console.log(
  "Articles lead dus au",
  publishDate + ":",
  dueArticles
    .map(function (article) {
      return article.file;
    })
    .join(", ")
);

run("generate-blog-articles.cjs");
run("generate-blog-index.cjs");
run("generate-blog-feed.cjs");
run("generate-blog-admin-map.cjs");
run("generate-seo-pages.cjs");
