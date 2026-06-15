const path = require("path");
const { execFileSync } = require("child_process");
const {
  getDueLeadArticles,
  getPendingLeadArticles,
  getReferenceDate,
} = require("./blog-lead-calendar.cjs");

function parseDateArg() {
  var arg = process.argv.find(function (item) {
    return item.indexOf("--date=") === 0;
  });
  return arg ? arg.slice("--date=".length) : null;
}

function runScript(file, args, env) {
  execFileSync(process.execPath, [path.join(__dirname, file)].concat(args || []), {
    cwd: path.join(__dirname, ".."),
    env: env,
    stdio: "inherit",
  });
}

var dryRun = process.argv.includes("--dry-run");
var forcedDate = parseDateArg();
var env = Object.assign({}, process.env);
if (forcedDate) env.BLOG_PUBLISH_DATE = forcedDate;

var referenceDate = forcedDate || getReferenceDate();
var due = getDueLeadArticles(referenceDate);
var pending = getPendingLeadArticles(referenceDate);

console.log("Publication articles leads — date:", referenceDate);
console.log("Articles publies ou dus:", due.length);
due.forEach(function (article) {
  console.log(" -", article.file);
});

if (pending.length) {
  console.log("Articles planifies a venir:", pending.length);
  pending.forEach(function (article) {
    console.log(" -", article.publishAt, article.file);
  });
}

if (dryRun) {
  process.exit(0);
}

runScript("generate-blog-articles.cjs", ["--force"], env);
runScript("generate-blog-index.cjs", [], env);
runScript("generate-blog-feed.cjs", [], env);
runScript("generate-blog-admin-map.cjs", [], env);
