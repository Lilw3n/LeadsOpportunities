"use strict";
var guard = require("../api/_lib/upload-guard");

function assert(cond, msg) {
  if (!cond) throw new Error(msg || "assert failed");
}

var pdf = Buffer.from("%PDF-1.4 test\n");
var png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
var jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46]);
var exe = Buffer.from("MZfakeexe");

assert(guard.detectMime(pdf) === "application/pdf", "pdf");
assert(guard.detectMime(png) === "image/png", "png");
assert(guard.detectMime(jpeg) === "image/jpeg", "jpeg");
assert(!guard.detectMime(exe), "exe blocked");

var ok = guard.validateUpload({
  base64: pdf.toString("base64"),
  fileName: "acte.pdf",
  kind: "document",
});
assert(ok.mimeType === "application/pdf", "validate pdf");

try {
  guard.validateUpload({ base64: exe.toString("base64"), fileName: "virus.exe", kind: "document" });
  throw new Error("exe should fail");
} catch (e) {
  assert(/non autorise/i.test(e.message), "exe error");
}

try {
  guard.validateUpload({
    base64: pdf.toString("base64"),
    fileName: "doc.pdf",
    mimeType: "image/png",
    kind: "document",
  });
  throw new Error("mime mismatch should fail");
} catch (e) {
  assert(/correspond pas/i.test(e.message), "mime mismatch");
}

console.log("verify-upload-guard: OK");
