#!/usr/bin/env node
/**
 * Vérifie le moteur de projection d'achat (prêt + TF + charges + patrimoine).
 */
var P = require("../js/achat-projection-lib.js");
var failed = 0;

function assert(cond, msg) {
  if (!cond) {
    failed++;
    console.log("FAIL", msg);
  } else {
    console.log("OK  ", msg);
  }
}

var mens = P.monthlyPayment(200000, 3.5, 240);
assert(mens > 1100 && mens < 1250, "mensualité 200k / 3,5 % / 20 ans ≈ 1 160 € (got " + mens + ")");

var back = P.maxPrincipal(mens, 3.5, 240);
assert(Math.abs(back - 200000) < 5, "inversion mensualité → capital (got " + back + ")");

var base = P.project({
  prix: 280000,
  typeBien: "appartement",
  anciennete: "ancien",
  surface: 65,
  dpe: "D",
  chauffage: "gaz",
  postal: "75011",
  occupants: 2,
  apport: 50000,
  epargne: 70000,
  dureeAns: 25,
  taux: 3.45,
  salaire: 2800,
  salaireCo: 2200,
  hasCo: true,
  creditsEnCours: 150,
  loyerActuel: 1400,
  enfants: 0,
  travaux: 15000,
  travauxMode: "pret"
});

assert(base.loan.aFinancer > 200000 && base.loan.aFinancer < 280000, "capital emprunté cohérent (" + base.loan.aFinancer + ")");
assert(base.loan.notaire > 15000 && base.loan.notaire < 25000, "notaire ancien ~7 % (" + base.loan.notaire + ")");
assert(base.tf > 800 && base.tf < 4000, "taxe foncière Paris 65 m² (" + base.tf + ")");
assert(base.utils.elecAn > 200 && base.utils.eauAn > 100, "énergie + eau estimés");
assert(base.coutMensuelTotal > base.loan.mensAc, "coût réel > mensualité crédit");
assert(base.dti > 10 && base.dti < 45, "DTI foyer 5 k€ net (" + base.dti + ")");
assert(base.comfort.score >= 40, "score confort attendu ≥ 40 (" + base.comfort.score + ")");
assert(base.breakdown.length >= 5, "détail des postes logement");
assert(base.loan.travauxInLoan === 15000, "travaux dans le prêt");

var cash = P.project(Object.assign({}, base.input, { travauxMode: "cash", epargne: 90000 }));
assert(cash.loan.travauxCash === 15000, "travaux au comptant");
assert(cash.loan.aFinancer < base.loan.aFinancer, "prêt plus bas si travaux cash");

var neuf = P.project({ prix: 280000, anciennete: "neuf", surface: 65, postal: "33000", apport: 40000 });
assert(neuf.loan.notaire < base.loan.notaire, "notaire neuf < ancien");
assert(neuf.tf < 500, "TF neuf souvent exonérée les 2 premières années (proxy bas)");

var serre = P.project({
  prix: 420000,
  surface: 80,
  postal: "69003",
  apport: 8000,
  epargne: 9000,
  salaire: 1900,
  dureeAns: 25,
  taux: 3.6,
  dpe: "G",
  travaux: 40000
});
assert(serre.dti > 35 || serre.comfort.tone === "no" || serre.comfort.tone === "tight", "dossier serré détecté");
assert(serre.flags.length >= 1, "alertes présentes sur dossier tendu");

var sc = P.scenarios({
  prix: 250000,
  surface: 70,
  apport: 40000,
  epargne: 55000,
  salaire: 3200,
  dpe: "F",
  postal: "44000"
});
assert(sc.durations.length === 3, "scénarios 20 / 25 / 27 ans si DPE F");
assert(sc.durations[0].mensAc > sc.durations[1].mensAc, "20 ans plus cher / mois que 25 ans");
assert(sc.stress.taux > 4, "stress +1 %");
assert(typeof P.summaryText(base) === "string" && P.summaryText(base).indexOf("DTI") !== -1, "résumé texte");

var dept = P.deptFromPostal("75011");
assert(dept === "75", "département Paris");
assert(P.deptFromPostal("97400") === "974", "département Réunion");

if (failed) {
  console.error("\n" + failed + " assertion(s) failed");
  process.exit(1);
}
console.log("\nProjection achat — tous les checks OK");
