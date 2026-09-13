/**
 * Crawlers sociaux (Facebook/Meta, WhatsApp…) : Open Graph dynamique pour /immobilier/visite.
 * Les fichiers statiques passent avant les rewrites vercel.json — le middleware s’exécute en amont.
 */
var SOCIAL_UA =
  /facebookexternalhit|facebot|meta-externalagent|whatsapp|twitterbot|linkedinbot|slackbot|discordbot|telegrambot/i;

export default async function middleware(request) {
  var ua = request.headers.get("user-agent") || "";
  if (!SOCIAL_UA.test(ua)) return;
  var url = new URL(request.url);
  var path = url.pathname.replace(/\/$/, "") || "/";
  if (path !== "/immobilier/visite.html" && path !== "/immobilier/visite") return;
  url.pathname = "/api/immo-tour-og";
  return fetch(url.toString(), {
    headers: request.headers,
    redirect: "manual",
  });
}

export const config = {
  matcher: ["/immobilier/visite.html", "/immobilier/visite", "/immobilier/visite/"],
};
