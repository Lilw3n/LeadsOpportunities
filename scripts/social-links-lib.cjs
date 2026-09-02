/**
 * Liens réseaux sociaux publics (config/social-links.json).
 */
var fs = require("fs");
var path = require("path");

var CONFIG_PATH = path.join(__dirname, "..", "config", "social-links.json");

function loadConfig() {
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
  } catch (e) {
    return { links: [] };
  }
}

function socialLinks() {
  return (loadConfig().links || []).filter(function (l) {
    return l && l.url && String(l.url).trim();
  });
}

function sameAsUrls() {
  return socialLinks().map(function (l) {
    return String(l.url).trim();
  });
}

function footerSocialLinksHtml(options) {
  options = options || {};
  var links = socialLinks();
  if (!links.length) return "";
  var sep = options.separator != null ? options.separator : " · ";
  return links
    .map(function (l) {
      var label = l.label || l.id || "Lien";
      var url = String(l.url).trim();
      return (
        '<a href="' +
        url.replace(/"/g, "&quot;") +
        '" target="_blank" rel="noopener noreferrer">' +
        label +
        "</a>"
      );
    })
    .join(sep);
}

module.exports = {
  socialLinks: socialLinks,
  sameAsUrls: sameAsUrls,
  footerSocialLinksHtml: footerSocialLinksHtml,
};
