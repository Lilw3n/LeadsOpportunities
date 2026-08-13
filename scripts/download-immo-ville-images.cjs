/**
 * Telecharge les visuels villes immobilier (Unsplash) pour assets/immo/villes/.
 * Usage: node scripts/download-immo-ville-images.cjs
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const root = path.join(__dirname, "..", "assets", "immo", "villes");

/** slug -> id Unsplash verifies (reutilise le pool blog quand besoin) */
const ASSETS = {
  "nancy.jpg": "photo-1560518883-ce09059eeffa",
  "vandoeuvre-les-nancy.jpg": "photo-1502672260266-1c1ef2d93688",
  "laxou.jpg": "photo-1564013799919-ab600027ffc6",
  "villers-les-nancy.jpg": "photo-1600585154340-be6161a56a0c",
  "saint-max.jpg": "photo-1600607687939-ce8a6c25118c",
  "essey-les-nancy.jpg": "photo-1600585154340-be6161a56a0c",
  "jarville-la-malgrange.jpg": "photo-1600607687939-ce8a6c25118c",
  "maxeville.jpg": "photo-1600585154526-990dced4db0d",
  "tomblaine.jpg": "photo-1560184897-ae75f418493e",
  "ludres.jpg": "photo-1600566752355-35792bedcfea",
  "pompey.jpg": "photo-1600585154526-990dced4db0d",
  "frouard.jpg": "photo-1558618666-fcd25c85cd64",
  "guadeloupe.jpg": "photo-1544551763-46a013bb70d5",
  "martinique.jpg": "photo-1507525428034-b723cf961d3e",
  "reunion.jpg": "photo-1506905925346-21bda4d32df4",
  "guyane.jpg": "photo-1507525428034-b723cf961d3e",
  "mayotte.jpg": "photo-1544551763-46a013bb70d5",
  "corse.jpg": "photo-1506905925346-21bda4d32df4",
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
  fs.mkdirSync(root, { recursive: true });
  for (var rel of Object.keys(ASSETS)) {
    var id = ASSETS[rel];
    var dest = path.join(root, rel);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 8000) {
      console.log("skip:", rel);
      ok++;
      continue;
    }
    var url = "https://images.unsplash.com/" + id + "?auto=format&fit=crop&w=800&h=500&q=80";
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
  console.log("done:", ok, "ok,", fail, "fail");
  process.exit(fail > 0 ? 1 : 0);
}

main();
