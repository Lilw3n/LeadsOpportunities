/**
 * Formulaire « poser une question » forum → POST /api/lead (source=forum)
 */
(function () {
  function qs(root, sel) {
    return root.querySelector(sel);
  }

  function collectUtm() {
    var out = {};
    try {
      var sp = new URLSearchParams(window.location.search);
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "fbclid", "gclid"].forEach(function (k) {
        if (sp.get(k)) out[k] = sp.get(k);
      });
    } catch (e) {}
    if (!out.utm_source) out.utm_source = "forum";
    if (!out.utm_medium) out.utm_medium = "ask_form";
    return out;
  }

  function bindCopy() {
    document.querySelectorAll("[data-copy-link]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var url = btn.getAttribute("data-url") || window.location.href;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url).then(
            function () {
              btn.textContent = "Lien copié";
            },
            function () {}
          );
        }
      });
    });
  }

  function bindForm(root) {
    var form = qs(root, "form");
    var msg = qs(root, "[data-forum-msg]");
    if (!form) return;

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      if (msg) {
        msg.hidden = true;
        msg.className = "forum-ask-msg";
      }
      var fd = new FormData(form);
      if (fd.get("_hp")) return;

      var question = String(fd.get("question") || "").trim();
      var email = String(fd.get("email") || "").trim();
      var firstName = String(fd.get("first_name") || "").trim();
      if (!question || !email || !firstName) {
        if (msg) {
          msg.hidden = false;
          msg.className = "forum-ask-msg is-err";
          msg.textContent = "Prénom, e-mail et question sont requis.";
        }
        return;
      }

      var need = root.getAttribute("data-need") || "sante";
      var theme = root.getAttribute("data-theme") || "";
      var thread = root.getAttribute("data-thread") || "";
      var utm = collectUtm();
      if (theme) utm.utm_campaign = utm.utm_campaign || "forum_" + theme;

      var body = {
        source: "forum",
        vertical: need,
        need: need,
        journey: "forum_ask",
        first_name: firstName,
        email: email,
        phone: String(fd.get("phone") || "").trim() || undefined,
        postal_code: String(fd.get("postal_code") || "").trim() || undefined,
        message: question,
        notes: question,
        forum_theme: theme,
        forum_thread: thread,
        landing_path: window.location.pathname,
        page_path: window.location.pathname,
        page_url: window.location.href,
        _hp: "",
      };
      Object.keys(utm).forEach(function (k) {
        body[k] = utm[k];
      });

      var btn = form.querySelector('[type="submit"]');
      if (btn) btn.disabled = true;

      fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
        .then(function (r) {
          return r.json().catch(function () {
            return { ok: r.ok };
          });
        })
        .then(function (res) {
          if (msg) {
            msg.hidden = false;
            if (res && (res.ok === false || res.error)) {
              msg.className = "forum-ask-msg is-err";
              msg.textContent = res.error || "Envoi impossible. Écrivez à contact@leadsopportunities.fr";
            } else {
              msg.className = "forum-ask-msg is-ok";
              msg.textContent =
                "Demande envoyée. Nous vous répondons à " + email + " — ou contact@leadsopportunities.fr";
              form.reset();
              if (typeof window.gtag === "function") {
                window.gtag("event", "generate_lead", {
                  event_category: "lead_generation",
                  event_label: "forum_ask",
                  vertical: need,
                });
              }
            }
          }
        })
        .catch(function () {
          if (msg) {
            msg.hidden = false;
            msg.className = "forum-ask-msg is-err";
            msg.textContent = "Erreur réseau. Écrivez à contact@leadsopportunities.fr";
          }
        })
        .finally(function () {
          if (btn) btn.disabled = false;
        });
    });
  }

  function init() {
    bindCopy();
    document.querySelectorAll("[data-forum-ask]").forEach(bindForm);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
