/**
 * Bloc vendeur — visiteurs & prêt acquéreur [data-vendeur-visite-pret-block]
 */
(function () {
  var Msg = window.VendeurVisitePretMessaging;
  if (!Msg) return;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function contextFromForm() {
    var city =
      (document.getElementById("sellCity") && document.getElementById("sellCity").value) ||
      (document.getElementById("urlCity") && document.getElementById("urlCity").value) ||
      "";
    var postal =
      (document.getElementById("sellPostalCode") && document.getElementById("sellPostalCode").value) ||
      (document.getElementById("urlPostal") && document.getElementById("urlPostal").value) ||
      "";
    city = String(city).trim();
    postal = String(postal).trim();
    return {
      city: city,
      postal: postal,
      ref: postal && city ? postal + "-" + city.replace(/\s+/g, "_") : "",
    };
  }

  function renderSteps(steps) {
    return steps
      .map(function (s) {
        return (
          '<div class="vvp-step"><strong>' +
          esc(s.title) +
          "</strong><p>" +
          esc(s.text) +
          "</p></div>"
        );
      })
      .join("");
  }

  function render(el) {
    var variant = (el.getAttribute("data-vendeur-visite-pret-block") || "landing").toLowerCase();
    var compact = variant === "compact";
    var ctx = contextFromForm();
    var creditUrl = Msg.buyerCreditUrl(ctx);
    var searchUrl = Msg.buyerSearchUrl(ctx);
    var id = "vvp-link-" + Math.random().toString(36).slice(2, 9);

    el.innerHTML =
      '<div class="vvp-banner' +
      (compact ? " vvp-banner--compact" : "") +
      '">' +
      '<span class="vvp-badge">Vendeurs — convertir les visites</span>' +
      "<h2>" +
      esc(Msg.HEADLINE) +
      "</h2>" +
      '<p class="vvp-lead">' +
      esc(Msg.LEAD) +
      "</p>" +
      '<p class="vvp-ultra"><strong>Ultra important :</strong> ' + esc(Msg.ULTRA_NOTE) + "</p>" +
      (compact ? "" : '<div class="vvp-steps">' + renderSteps(Msg.STEPS || []) + "</div>") +
      '<div class="vvp-link-box">' +
      "<label for=\"" +
      id +
      "\">Lien à envoyer à vos visiteurs — demande de prêt</label>" +
      '<div class="vvp-link-row">' +
      '<input id="' +
      id +
      '" class="vvp-link-input" type="url" readonly value="' +
      esc(creditUrl) +
      '" data-vvp-credit-url />' +
      '<button type="button" class="btn btn-primary btn-sm" data-vvp-copy>Copier le lien</button>' +
      "</div>" +
      '<p class="vvp-link-hint">Après chaque visite : SMS, WhatsApp ou mail. L\'acquéreur monte son dossier prêt en ligne.</p>' +
      '<p class="vvp-link-alt">Besoin recherche de bien aussi ? <a href="' +
      esc(searchUrl) +
      '" target="_blank" rel="noopener">Parcours acquéreur complet</a></p>' +
      "</div></div>";

    el.dataset.vvpMounted = "1";
  }

  function refreshLinks(root) {
    var ctx = contextFromForm();
    var creditUrl = Msg.buyerCreditUrl(ctx);
    (root || document).querySelectorAll("[data-vvp-credit-url]").forEach(function (inp) {
      inp.value = creditUrl;
    });
  }

  function copyLink(btn) {
    var box = btn.closest(".vvp-link-box");
    var inp = box && box.querySelector("[data-vvp-credit-url]");
    if (!inp) return;
    var text = inp.value;
    function ok() {
      var prev = btn.textContent;
      btn.textContent = "Copié ✓";
      setTimeout(function () {
        btn.textContent = prev;
      }, 2000);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(ok).catch(function () {
        inp.select();
        document.execCommand("copy");
        ok();
      });
    } else {
      inp.select();
      try {
        document.execCommand("copy");
      } catch (e) {}
      ok();
    }
  }

  function syncWrapVisibility() {
    var hat = document.documentElement.getAttribute("data-immo-hat") || "acheteur";
    var show = hat === "vendeur" || hat === "les_deux";
    document.querySelectorAll("[data-vendeur-visite-pret-wrap]").forEach(function (wrap) {
      wrap.hidden = !show;
    });
    document.querySelectorAll("[data-vendeur-visite-pret-block]").forEach(function (block) {
      if (block.closest("[data-vendeur-visite-pret-wrap]")) return;
      block.hidden = !show;
    });
  }

  function bind() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-vvp-copy]");
      if (btn) copyLink(btn);
    });

    ["sellCity", "sellPostalCode", "urlCity", "urlPostal"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener("change", function () {
        refreshLinks();
      });
    });

    document.querySelectorAll("[name='immoHat']").forEach(function (r) {
      r.addEventListener("change", syncWrapVisibility);
    });

    syncWrapVisibility();
  }

  function boot() {
    document.querySelectorAll("[data-vendeur-visite-pret-block]").forEach(render);
    bind();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();

  window.VendeurVisitePretBlock = { refresh: refreshLinks, syncVisibility: syncWrapVisibility };
})();
