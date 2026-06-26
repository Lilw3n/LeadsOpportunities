/**
 * Telecharge les photos stock (Unsplash) pour les articles blog.
 * Usage: node scripts/download-blog-images.cjs
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const root = path.join(__dirname, "..", "blog", "images");

/** chemin relatif -> id Unsplash verifie */
const ASSETS = {
  "sante/seniors-couple.jpg": "photo-1529156069898-49953e39b3ac",
  "sante/senior-doctor.jpg": "photo-1576091160399-112ba8d25d1d",
  "sante/hospital-care.jpg": "photo-1559757148-5c350d0d3c56",
  "sante/family-health.jpg": "photo-1511895426328-dc8714191300",
  "sante/dental-care.jpg": "photo-1629909613654-28e377c37b09",
  "sante/optique-lunettes.jpg": "photo-1596854407944-bf87f6fdd49e",
  "sante/medecin-consultation.jpg": "photo-1582750433449-648ed127bb54",
  "sante/senior-souriant.jpg": "photo-1559839734-2b71ea197ec2",
  "sante/analyse-medicale.jpg": "photo-1582719478250-c89cae4dc85b",
  "sante/hospitalisation-chambre.jpg": "photo-1576091160550-2173dba999ef",
  "sante/medicaments.jpg": "photo-1585435557343-3b092031a831",
  "sante/mutuelle-documents.jpg": "photo-1450101499163-c8848c66ca85",
  "habitat/maison-famille.jpg": "photo-1560518883-ce09059eeffa",
  "habitat/appartement-locataire.jpg": "photo-1502672260266-1c1ef2d93688",
  "habitat/sinistre-degats.jpg": "photo-1558618666-fcd25c85cd64",
  "habitat/bailleur-cles.jpg": "photo-1560184897-ae75f418493e",
  "habitat/canicule-maison.jpg": "photo-1564013799919-ab600027ffc6",
  "canicule/chaleur-soleil-maison.jpg": "photo-1542601906990-b4d3fb778b09",
  "canicule/secheresse-fissures.jpg": "photo-1600566752355-35792bedcfea",
  "canicule/inondation-degats-eaux.jpg": "photo-1581578731548-c64695cc6952",
  "canicule/senior-hydratation.jpg": "photo-1559839734-2b71ea197ec2",
  "canicule/urgences-chaleur.jpg": "photo-1576091160399-112ba8d25d1d",
  "canicule/prevention-toiture.jpg": "photo-1564013799919-ab600027ffc6",
  "canicule/seniors-couple-ete.jpg": "photo-1529156069898-49953e39b3ac",
  "canicule/logement-frais-senior.jpg": "photo-1497366216548-37526070297c",
  "canicule/climat-chaleur-extreme.jpg": "photo-1542601906990-b4d3fb778b09",
  "canicule/politique-canicule-france.jpg": "photo-1529107386315-e1a2ed48a620",
  "canicule/hydratation-prevention.jpg": "photo-1571019613454-1cb2f99b2d8b",
  "auto/voiture-route.jpg": "photo-1494976388531-d1058494cdd8",
  "auto/jeune-conducteur.jpg": "photo-1549317661-bd32c8ce0db2",
  "auto/bonus-malus.jpg": "photo-1492144534655-ae79c964c9d7",
  "auto/formule1-voyage.jpg": "photo-1473968512647-3e447244af8f",
  "animaux/chien-veterinaire.jpg": "photo-1587300003388-59208cc962cb",
  "animaux/chat-soin.jpg": "photo-1518791841217-8f162f1e1131",
  "animaux/chiot-chaton.jpg": "photo-1601758228041-f3b2795255f1",
  "animaux/chien-promenade.jpg": "photo-1587300003388-59208cc962cb",
  "vtc/chauffeur-vtc.jpg": "photo-1449824913935-59a10b8d2000",
  "vtc/taxi-ville.jpg": "photo-1502877338535-766e1452684a",
  "vtc/vtc-smartphone.jpg": "photo-1551836022-d5d88e9218df",
  "finance/credit-immo-cles.jpg": "photo-1560518883-ce09059eeffa",
  "finance/signature-pret.jpg": "photo-1554224155-6726b3ff858f",
  "finance/budget-famille.jpg": "photo-1454165804606-c3d57bc86b40",
  "prevoyance/famille-protection.jpg": "photo-1511895426328-dc8714191300",
  "prevoyance/deces-obseques.jpg": "photo-1573496359142-b8d87734a5a2",
  "prevoyance/independant-bureau.jpg": "photo-1460925895917-afdab827c52f",
  "patrimoine/epargne-retraite.jpg": "photo-1579621970563-ebec7560ff3e",
  "pro/artisan-chantier.jpg": "photo-1581094794329-c8112a89af12",
  "pro/freelance-laptop.jpg": "photo-1522071820081-009f0129c71c",
  "actu/voyage-foot.jpg": "photo-1436491865332-7a61a109cc05",
  "actu/divorce-couple.jpg": "photo-1516589178581-6cd7833ae3b2",
  "actu/politique-france.jpg": "photo-1529107386315-e1a2ed48a620",
  "actu/inflation-factures.jpg": "photo-1454165804606-c3d57bc86b40",
  "actu/ia-bureau.jpg": "photo-1677442136019-21780ecad995",
  "actu/collection-retro.jpg": "photo-1511512578047-dfb367046420",
};

function download(url, dest) {
  return new Promise(function (resolve, reject) {
    var file = fs.createWriteStream(dest);
    https
      .get(url, function (res) {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          try {
            fs.unlinkSync(dest);
          } catch (e) {}
          return download(res.headers.location, dest).then(resolve).catch(reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          try {
            fs.unlinkSync(dest);
          } catch (e) {}
          return reject(new Error("HTTP " + res.statusCode));
        }
        res.pipe(file);
        file.on("finish", function () {
          file.close(resolve);
        });
      })
      .on("error", reject);
  });
}

async function main() {
  var ok = 0;
  var fail = 0;
  for (var rel of Object.keys(ASSETS)) {
    var id = ASSETS[rel];
    var dest = path.join(root, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (fs.existsSync(dest) && fs.statSync(dest).size > 8000) {
      console.log("skip:", rel);
      ok++;
      continue;
    }
    var url = "https://images.unsplash.com/" + id + "?auto=format&fit=crop&w=1280&h=720&q=80";
    try {
      await download(url, dest);
      var head = fs.readFileSync(dest).slice(0, 4).toString("hex");
      if (head.indexOf("ffd8") !== 0 && head.indexOf("8950") !== 0) {
        fs.unlinkSync(dest);
        throw new Error("invalid image");
      }
      console.log("ok:", rel);
      ok++;
    } catch (e) {
      console.warn("fail:", rel, e.message);
      fail++;
    }
  }
  console.log("Done —", ok, "ok,", fail, "failed");
}

main();
