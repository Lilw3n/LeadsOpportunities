/**
 * Google Drive local (dev) — inspire localDriveService.ts
 */
const fs = require("fs");
const path = require("path");

function getBasePath() {
  return process.env.LOCAL_DRIVE_PATH || process.env.GOOGLE_DRIVE_DESKTOP_PATH || "";
}

function safeJoin(base, rel) {
  var resolved = path.resolve(base, rel || ".");
  if (!resolved.startsWith(path.resolve(base))) {
    throw new Error("Chemin invalide");
  }
  return resolved;
}

async function listFiles(folderPath) {
  var base = getBasePath();
  if (!base) return { configured: false, files: [] };
  var target = folderPath ? safeJoin(base, folderPath) : base;
  try {
    await fs.promises.access(target);
  } catch (e) {
    return { configured: true, accessible: false, error: "Dossier inaccessible: " + target };
  }
  var items = await fs.promises.readdir(target, { withFileTypes: true });
  var files = items.slice(0, 50).map(function (d) {
    var full = path.join(target, d.name);
    return {
      name: d.name,
      path: path.relative(base, full).replace(/\\/g, "/"),
      isDirectory: d.isDirectory(),
    };
  });
  return { configured: true, accessible: true, basePath: base, files: files };
}

async function readFile(relPath) {
  var base = getBasePath();
  if (!base) return { configured: false };
  var full = safeJoin(base, relPath);
  var stat = await fs.promises.stat(full);
  if (stat.isDirectory()) return { error: "Est un dossier" };
  var ext = path.extname(full).toLowerCase();
  var textExts = [".txt", ".csv", ".json", ".md", ".html"];
  if (textExts.indexOf(ext) >= 0) {
    var text = await fs.promises.readFile(full, "utf8");
    return { configured: true, name: path.basename(full), content: text.slice(0, 50000), contentType: "text/plain" };
  }
  return {
    configured: true,
    name: path.basename(full),
    content: null,
    message: "Fichier binaire — utilisez l'export cloud ou OCR local",
    size: stat.size,
  };
}

module.exports = { listFiles, readFile, getBasePath };
