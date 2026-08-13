/**
 * Telecharge les visuels villes immobilier (Unsplash) pour assets/immo/villes/.
 * Usage: node scripts/download-immo-ville-images.cjs
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const root = path.join(__dirname, "..", "assets", "immo", "villes");
const geoPath = path.join(__dirname, "..", "data", "immo-geo-france.json");

/** slug -> id Unsplash (villes citees en priorite, puis pool village / maison) */
const CURATED = {
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
  "dombasle-sur-meurthe.jpg": "photo-1480074568708-e7b720bb3f09",
  "varangeville.jpg": "photo-1568605114967-8130f3a36994",
  "saint-nicolas-de-port.jpg": "photo-1570129477492-45c003edd2be",
  "ville-en-vermois.jpg": "photo-1480074568708-e7b720bb3f09",
  "manoncourt-en-vermois.jpg": "photo-1449844908441-8829872d2607",
  "haraucourt.jpg": "photo-1513584684374-8bab748fbf90",
  "luneville.jpg": "photo-1416331108676-a22ccb276e35",
  "blainville-sur-leau.jpg": "photo-1500382017468-9049fed747ef",
  "damelevieres.jpg": "photo-1448630360428-65456885c650",
  "mont-sur-meurthe.jpg": "photo-1472224371017-08207f84aaae",
  "guadeloupe.jpg": "photo-1544551763-46a013bb70d5",
  "martinique.jpg": "photo-1507525428034-b723cf961d3e",
  "reunion.jpg": "photo-1506905925346-21bda4d32df4",
  "guyane.jpg": "photo-1507525428034-b723cf961d3e",
  "mayotte.jpg": "photo-1544551763-46a013bb70d5",
  "corse.jpg": "photo-1506905925346-21bda4d32df4",
};

const POOL = [
  "photo-1512917774080-9991f1c4c750",
  "photo-1580587771525-78b9dba3b914",
  "photo-1600596542815-ffad4c1539a9",
  "photo-1600047509807-ba8f99d2cd0a",
  "photo-1600573472591-ee6981cf35b6",
  "photo-1560448204-e02f11c3d0e2",
  "photo-1493809842364-78817add7ffb",
  "photo-1523217582562-09da4e334f0a",
  "photo-1600210492486-724fe5c67fb0",
  "photo-1600047509358-9dc75590aef3",
  "photo-1600607687644-c7171b42498f",
  "photo-1600566753086-00f18fb6b3ea",
  "photo-1582268611958-ebfd161ef9cf",
  "photo-1605146769289-440113cc3d00",
  "photo-1592595896551-12b371d546d5",
  "photo-1554995207-c18c203602cb",
  "photo-1560185007-cde436f6a4d0",
  "photo-1605276374104-dee2a0ed3cd6",
  "photo-1600585152220-90363fe7e115",
  "photo-1613490493576-7fde63acd811",
];

function slugify(name) {
  return String(name || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hashSlug(slug) {
  var h = 0;
  for (var i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h;
}

function collectCities(geo) {
  var out = [];
  function push(c) {
    if (!c) return;
    var slug = c.slug || slugify(c.name || c.city);
    if (!slug) return;
    out.push({ slug: slug, file: slug + ".jpg" });
  }
  (geo.localZones || []).forEach(function (z) {
    (z.cities || []).forEach(push);
  });
  ((geo.nancyFocus && geo.nancyFocus.cities) || []).forEach(push);
  (geo.domTom || []).forEach(push);
  return out;
}

function photoIdFor(file, attempt) {
  attempt = attempt || 0;
  if (attempt === 0 && CURATED[file]) return CURATED[file];
  return POOL[(hashSlug(file) + attempt) % POOL.length];
}

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
  var geo = JSON.parse(fs.readFileSync(geoPath, "utf8"));
  var cities = collectCities(geo);
  var seen = {};
  for (var i = 0; i < cities.length; i++) {
    var rel = cities[i].file;
    if (seen[rel]) continue;
    seen[rel] = true;
    var dest = path.join(root, rel);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 8000) {
      console.log("skip:", rel);
      ok++;
      continue;
    }
    var lastErr = null;
    for (var attempt = 0; attempt < POOL.length; attempt++) {
      var id = photoIdFor(rel, attempt);
      var url = "https://images.unsplash.com/" + id + "?auto=format&fit=crop&w=800&h=500&q=80";
      try {
        await download(url, dest);
        var head = fs.readFileSync(dest).slice(0, 4).toString("hex");
        if (head.indexOf("ffd8") !== 0 && head.indexOf("8950") !== 0) {
          fs.unlinkSync(dest);
          throw new Error("invalid image");
        }
        console.log("ok:", rel, attempt ? "(fallback " + attempt + ")" : "");
        lastErr = null;
        ok++;
        break;
      } catch (e) {
        lastErr = e;
        try {
          if (fs.existsSync(dest)) fs.unlinkSync(dest);
        } catch (e2) {}
      }
    }
    if (lastErr) {
      console.warn("fail:", rel, lastErr.message);
      fail++;
    }
  }
  console.log("done:", ok, "ok,", fail, "fail");
  process.exit(fail > 0 ? 1 : 0);
}

main();
