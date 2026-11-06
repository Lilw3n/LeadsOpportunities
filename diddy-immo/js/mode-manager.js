/**
 * ModeManager — inspire ModeManager.tsx multisite (admin / interne / externe / test)
 */
window.ModeManager = {
  KEY: "lo_view_mode",

  get: function () {
    return localStorage.getItem(this.KEY) || "internal";
  },

  set: function (mode) {
    localStorage.setItem(this.KEY, mode);
    this.apply();
  },

  apply: function () {
    var mode = this.get();
    document.documentElement.setAttribute("data-view-mode", mode);
    var bar = document.getElementById("modeManagerBar");
    if (bar) {
      bar.querySelectorAll("[data-mode]").forEach(function (btn) {
        btn.classList.toggle("active", btn.getAttribute("data-mode") === mode);
      });
    }
  },

  render: function () {
    if (document.getElementById("modeManagerBar")) return;
    var bar = document.createElement("div");
    bar.id = "modeManagerBar";
    bar.style.cssText =
      "position:fixed;bottom:12px;right:12px;z-index:9999;background:#1e293b;color:#fff;padding:8px 12px;border-radius:12px;font-size:.75rem;display:flex;gap:6px;align-items:center;box-shadow:0 4px 20px rgba(0,0,0,.2)";
    bar.innerHTML =
      "<span>Mode</span>" +
      '<button type="button" data-mode="admin" style="padding:4px 10px;border:none;border-radius:8px;cursor:pointer;background:#475569;color:#fff">Admin</button>' +
      '<button type="button" data-mode="internal" style="padding:4px 10px;border:none;border-radius:8px;cursor:pointer;background:#475569;color:#fff">Interne</button>' +
      '<button type="button" data-mode="external" style="padding:4px 10px;border:none;border-radius:8px;cursor:pointer;background:#475569;color:#fff">Externe</button>' +
      '<button type="button" data-mode="test" style="padding:4px 10px;border:none;border-radius:8px;cursor:pointer;background:#475569;color:#fff">Test</button>';
    document.body.appendChild(bar);
    bar.querySelectorAll("[data-mode]").forEach(function (btn) {
      btn.onclick = function () {
        window.ModeManager.set(btn.getAttribute("data-mode"));
        var mode = btn.getAttribute("data-mode");
        if (mode === "external") {
          window.open("./external/index.html", "_blank");
        } else if (mode === "test") {
          localStorage.setItem("lo_ext_simulation", "1");
          window.open("./external/dashboard.html", "_blank");
        } else {
          localStorage.removeItem("lo_ext_simulation");
        }
      };
      btn.onmouseover = function () {
        if (!btn.classList.contains("active")) btn.style.background = "#64748b";
      };
      btn.onmouseout = function () {
        if (!btn.classList.contains("active")) btn.style.background = "#475569";
      };
    });
    this.apply();
  },
};

document.addEventListener("DOMContentLoaded", function () {
  if (document.body.classList.contains("crm-body") || document.querySelector(".crm-sidebar")) {
    window.ModeManager.render();
  }
});
