/**
 * Centre de notifications CRM — inspiré MobileNotifications / notificationService multisite.
 * Stockage : localStorage lo_crm_notifications_v1
 */
(function () {
  var KEY = "lo_crm_notifications_v1";

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return [
      {
        id: "n1",
        title: "Rappel renouvellement",
        body: "Anticipez les échéances contrats à J-45.",
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "n2",
        title: "Devis en attente",
        body: "Validez ou relancez les devis brouillon depuis Documents.",
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  function save(list) {
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, 50)));
  }

  function unreadCount(list) {
    return list.filter(function (n) {
      return !n.read;
    }).length;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function bellHtml(count) {
    return (
      '<button type="button" id="loNotifBell" style="position:relative;padding:8px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:#1e293b;color:#fff;cursor:pointer;font-size:1rem" aria-label="Notifications">' +
      "🔔" +
      (count
        ? '<span id="loNotifBadge" style="position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;font-size:.65rem;min-width:18px;height:18px;border-radius:999px;display:flex;align-items:center;justify-content:center">' +
          count +
          "</span>"
        : "") +
      "</button>"
    );
  }

  function refreshBadge(bell, list) {
    var u = unreadCount(list);
    var badge = document.getElementById("loNotifBadge");
    if (u === 0) {
      if (badge) badge.parentNode.removeChild(badge);
      return;
    }
    if (badge) {
      badge.textContent = String(u);
      return;
    }
    var span = document.createElement("span");
    span.id = "loNotifBadge";
    span.style.cssText =
      "position:absolute;top:-4px;right:-4px;background:#ef4444;color:#fff;font-size:.65rem;min-width:18px;height:18px;border-radius:999px;display:flex;align-items:center;justify-content:center";
    span.textContent = String(u);
    bell.appendChild(span);
  }

  function mount() {
    if (document.getElementById("loNotifCenter")) return;

    var list = load();
    var u = unreadCount(list);
    var panelOpen = false;

    var wrap = document.createElement("div");
    wrap.id = "loNotifCenter";
    wrap.style.cssText =
      "position:fixed;top:12px;right:12px;z-index:10000;font-family:system-ui,sans-serif";

    wrap.innerHTML =
      bellHtml(u) +
      '<div id="loNotifPanel" style="display:none;margin-top:8px;width:min(360px,92vw);max-height:70vh;overflow:auto;background:#fff;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 12px 40px rgba(0,0,0,.15)">' +
      '<div style="padding:10px 12px;border-bottom:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center">' +
      "<strong>Notifications</strong>" +
      '<button type="button" id="loNotifMarkAll" style="font-size:.8rem;border:none;background:none;color:#6366f1;cursor:pointer">Tout lu</button></div>' +
      '<div id="loNotifBody"></div></div>';

    document.body.appendChild(wrap);

    var bell = document.getElementById("loNotifBell");
    var panel = document.getElementById("loNotifPanel");
    var bodyEl = document.getElementById("loNotifBody");

    function fillBody() {
      list = load();
      bodyEl.innerHTML = list.length
        ? list
            .map(function (n) {
              return (
                '<div style="padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:.85rem;opacity:' +
                (n.read ? "0.65" : "1") +
                '"><strong>' +
                esc(n.title) +
                "</strong><br>" +
                esc(n.body) +
                (!n.read
                  ? ' <button type="button" class="lo-notif-read" data-id="' +
                    esc(n.id) +
                    '" style="font-size:.75rem;margin-top:4px;border:none;background:#f1f5f9;padding:4px 8px;border-radius:6px;cursor:pointer">Marquer lu</button>'
                  : "") +
                "</div>"
              );
            })
            .join("")
        : "<p style='padding:12px;color:#64748b;margin:0'>Aucune notification</p>";

      bodyEl.querySelectorAll(".lo-notif-read").forEach(function (btn) {
        btn.onclick = function (e) {
          e.stopPropagation();
          var id = btn.getAttribute("data-id");
          save(
            load().map(function (n) {
              return n.id === id ? Object.assign({}, n, { read: true }) : n;
            })
          );
          refreshBadge(bell, load());
          fillBody();
        };
      });
    }

    bell.onclick = function (e) {
      e.stopPropagation();
      panelOpen = !panelOpen;
      panel.style.display = panelOpen ? "block" : "none";
      if (panelOpen) fillBody();
    };

    document.getElementById("loNotifMarkAll").onclick = function (e) {
      e.stopPropagation();
      save(
        load().map(function (n) {
          return Object.assign({}, n, { read: true });
        })
      );
      refreshBadge(bell, load());
      fillBody();
    };

    document.addEventListener("click", function () {
      panelOpen = false;
      panel.style.display = "none";
    });
    panel.onclick = function (e) {
      e.stopPropagation();
    };
  }

  function tryMount() {
    var app = document.getElementById("crmApp");
    if (!app || app.classList.contains("hidden")) return;
    mount();
  }

  document.addEventListener("DOMContentLoaded", tryMount);
  window.addEventListener("lo:crm-app-visible", tryMount);
})();
