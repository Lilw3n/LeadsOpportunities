#!/usr/bin/env node
/**
 * Garde-fous pipeline blog actu (cron GitHub + Cursor).
 */
const { execSync } = require("child_process");
const path = require("path");
const { isPlaceholderQueueItem, hasQualifiedLeadAngle, readJson } = require("./blog-actu-lib.cjs");

var ROOT = path.join(__dirname, "..");
var failed = 0;

function assert(cond, msg) {
  if (cond) {
    console.log("OK  ", msg);
  } else {
    failed += 1;
    console.error("FAIL", msg);
  }
}

assert(
  isPlaceholderQueueItem({
    id: "cafeyn-pending-template",
    title: "COLLEZ ICI le titre de la une Cafeyn (Le Figaro, Le Parisien…)",
    status: "pending",
  }),
  "placeholder « COLLEZ ICI » ignoré même en pending"
);

assert(
  isPlaceholderQueueItem({ id: "x", title: "Vrai titre actu mutuelle", status: "template" }),
  "status template ignoré"
);

assert(
  !isPlaceholderQueueItem({
    id: "rss-mutuelle",
    title: "Mutuelle : le reste à charge dentaire augmente",
    status: "queued",
  }),
  "vrai candidat RSS conservé"
);

assert(
  hasQualifiedLeadAngle({
    title: "Solimut Mutuelle victime d'une cyberattaque, des IBAN exposés",
    summary: "Plus d'un million d'assurés concernés",
  }),
  "actu mutuelle / cyberattaque = lead qualifié"
);

assert(
  !hasQualifiedLeadAngle({
    title: "Basket : Wembanyama et l'équipe de France avant la Slovénie",
    summary: "Le sélectionneur a fait le point à la veille du match",
  }),
  "sport sans angle assurance ignoré"
);

assert(
  !hasQualifiedLeadAngle({
    title: "HSBC Continental Europe Enters Into a Memorandum of Understanding Regarding Potential Sale of HSBC Assurances Vie",
  }),
  "titre anglais ignoré"
);

assert(
  !hasQualifiedLeadAngle({
    title: "Maisons détruites : coulée de boue massive",
    summary: "Au Népal, des inondations massives ont fait près de 100 morts",
  }),
  "catastrophe hors France ignorée"
);

var queue = readJson("blog-actu-queue.json", { items: [] });
var templateItems = (queue.items || []).filter(function (item) {
  return isPlaceholderQueueItem(item);
});
templateItems.forEach(function (item) {
  assert(
    item.status === "template" || item.status === "ignored" || item.status === "example",
    "item inbox « " + item.id + " » n'est plus pending/queued"
  );
});

try {
  execSync("echo -n '' | node scripts/verify-actu-quality.cjs", {
    cwd: ROOT,
    stdio: "pipe",
  });
  assert(true, "qualité : stdin vide (CI) ne plante plus");
} catch (e) {
  assert(false, "qualité : stdin vide — " + (e.stderr || e.message || e).toString().slice(0, 180));
}

if (failed) {
  console.error("\n" + failed + " échec(s) pipeline actu.");
  process.exit(1);
}
console.log("\nPipeline actu OK.");
