const fs = require("fs");
const path = require("path");
const { getLeadgenPlan, getScheduledLeadArticles } = require("./blog-leadgen-calendar.cjs");

const blogDir = path.join(__dirname, "..", "blog");
const args = process.argv.slice(2);

function hasArg(name) {
  return args.indexOf(name) !== -1;
}

function writeGithubOutput(report) {
  if (!process.env.GITHUB_OUTPUT) return;
  var lines = [
    "due_count=" + report.due.length,
    "future_count=" + report.future.length,
    "missing_count=" + report.missing.length,
    "has_missing=" + (report.missing.length > 0 ? "true" : "false"),
    "missing_files=" + report.missing.map(function (a) { return a.file; }).join(","),
  ];
  fs.appendFileSync(process.env.GITHUB_OUTPUT, lines.join("\n") + "\n");
}

function buildReport() {
  var all = getLeadgenPlan();
  var due = getScheduledLeadArticles();
  var dueFiles = {};
  due.forEach(function (a) {
    dueFiles[a.file] = true;
  });

  var missing = due.filter(function (a) {
    return !fs.existsSync(path.join(blogDir, a.file));
  });
  var future = all.filter(function (a) {
    return !dueFiles[a.file];
  });

  return { due: due, future: future, missing: missing };
}

var report = buildReport();

if (hasArg("--github-output")) {
  writeGithubOutput(report);
}

if (hasArg("--json")) {
  process.stdout.write(JSON.stringify(report) + "\n");
} else {
  console.log("Articles lead-gen planifies:", report.due.length + report.future.length);
  console.log("Articles publies ou publiables:", report.due.length);
  console.log("Articles futurs:", report.future.length);
  if (report.missing.length) {
    console.log("Articles a generer:");
    report.missing.forEach(function (a) {
      console.log("- " + a.publishDate + " " + a.file + " — " + a.title);
    });
  } else {
    console.log("Aucun article lead-gen manquant pour la date courante.");
  }
}
