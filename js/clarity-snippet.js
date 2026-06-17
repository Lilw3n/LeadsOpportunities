/**
 * Snippet Microsoft Clarity officiel — charge immédiatement le tag clarity.ms.
 * ID projet : x7yqp46fj9 (surcharge via window.GOOGLE_TRACKING.clarityProjectId si déjà défini).
 */
(function () {
  var id = "x7yqp46fj9";
  try {
    var cfg = window.GOOGLE_TRACKING || window.GOOGLE_TRACKING_FROM_ENV || {};
    if (cfg.clarityProjectId && String(cfg.clarityProjectId).indexOf("XXXX") === -1) {
      id = String(cfg.clarityProjectId).trim();
    }
  } catch (e) {}
  if (!id || document.getElementById("clarity-script")) return;
  (function (c, l, a, r, i, t, y) {
    c[a] =
      c[a] ||
      function () {
        (c[a].q = c[a].q || []).push(arguments);
      };
    t = l.createElement(r);
    t.async = 1;
    t.src = "https://www.clarity.ms/tag/" + i;
    t.id = "clarity-script";
    y = l.getElementsByTagName(r)[0];
    y.parentNode.insertBefore(t, y);
  })(window, document, "clarity", "script", id);
})();
