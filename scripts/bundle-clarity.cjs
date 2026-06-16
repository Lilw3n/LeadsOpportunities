const esbuild = require("esbuild");
const path = require("path");

esbuild.buildSync({
  entryPoints: [path.join(__dirname, "../js/clarity-source.mjs")],
  bundle: true,
  outfile: path.join(__dirname, "../js/clarity-init.js"),
  format: "iife",
  platform: "browser",
  target: ["es2018"],
  minify: true,
  legalComments: "none",
});

console.log("built js/clarity-init.js");
