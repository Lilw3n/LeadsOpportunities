/**
 * Télécharge les photos SEO (Unsplash) vers images/seo/.
 * Usage: node scripts/download-seo-images.cjs
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const { UNSPLASH } = require("./seo-images-lib.cjs");

const root = path.join(__dirname, "..", "images", "seo");

function download(url, dest) {
  return new Promise(function (resolve, reject) {
    var file = fs.createWriteStream(dest);
    https
      .get(url, { headers: { "User-Agent": "LeadsOpportunitiesSEO/1.0" } }, function (res) {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlink(dest, function () {});
          return download(res.headers.location, dest).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlink(dest, function () {});
          return reject(new Error("HTTP " + res.statusCode + " " + url));
        }
        res.pipe(file);
        file.on("finish", function () {
          file.close(resolve);
        });
      })
      .on("error", function (err) {
        fs.unlink(dest, function () {});
        reject(err);
      });
  });
}

async function main() {
  var keys = Object.keys(UNSPLASH);
  for (var i = 0; i < keys.length; i++) {
    var rel = keys[i];
    var dest = path.join(root, rel);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (fs.existsSync(dest) && fs.statSync(dest).size > 8000) {
      console.log("skip", rel);
      continue;
    }
    var id = UNSPLASH[rel];
    var url = "https://images.unsplash.com/" + id + "?auto=format&fit=crop&w=1280&h=720&q=80";
    process.stdout.write("get " + rel + " … ");
    try {
      await download(url, dest);
      var size = fs.statSync(dest).size;
      if (size < 4000) throw new Error("fichier trop petit (" + size + ")");
      console.log(Math.round(size / 1024) + " ko");
    } catch (e) {
      console.log("FAIL", e.message);
    }
  }
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
