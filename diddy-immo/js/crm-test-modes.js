(function () {
  var SIM_KEY = "lo_ext_simulation";

  function current() {
    return window.ModeManager ? window.ModeManager.get() : localStorage.getItem("lo_view_mode") || "internal";
  }

  function paint() {
    var mode = current();
    document.getElementById("tmCurrent").textContent = "Configuration actuelle : " + mode.toUpperCase();
    document.querySelectorAll("#tmModes .tm-card").forEach(function (card) {
      card.classList.toggle("active", card.getAttribute("data-mode") === mode);
    });
  }

  document.querySelectorAll("#tmModes .tm-card").forEach(function (card) {
    card.onclick = function () {
      var mode = card.getAttribute("data-mode");
      if (window.ModeManager) window.ModeManager.set(mode);
      else localStorage.setItem("lo_view_mode", mode);

      if (mode === "test") {
        localStorage.setItem(SIM_KEY, "1");
        window.open("./external/dashboard.html", "_blank");
      } else if (mode === "external") {
        localStorage.removeItem(SIM_KEY);
        window.open("./external/index.html", "_blank");
      } else {
        localStorage.removeItem(SIM_KEY);
      }
      paint();
    };
  });

  document.getElementById("tmEmergency").onclick = function () {
    if (window.ModeManager) window.ModeManager.set("admin");
    else localStorage.setItem("lo_view_mode", "admin");
    localStorage.removeItem(SIM_KEY);
    localStorage.removeItem("lo_ext_token");
    paint();
    location.href = "./crm.html";
  };

  paint();
})();
