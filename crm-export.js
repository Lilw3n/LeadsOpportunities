(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  function load(entity) {
    document.getElementById("exportOut").textContent = "Chargement…";
    document.querySelectorAll("[data-entity]").forEach(function (btn) {
      btn.classList.toggle("btn-primary", btn.getAttribute("data-entity") === entity);
      btn.classList.toggle("btn-ghost", btn.getAttribute("data-entity") !== entity);
    });
    fetch("/api/crm/export?entity=" + encodeURIComponent(entity), {
      headers: { Authorization: "Bearer " + token },
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        document.getElementById("exportOut").textContent = JSON.stringify(res, null, 2);
        if (res.ok && res.data) {
          var blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "crm-" + entity + "-" + new Date().toISOString().slice(0, 10) + ".json";
          a.click();
        }
      });
  }

  document.querySelectorAll("[data-entity]").forEach(function (btn) {
    btn.onclick = function () {
      load(btn.getAttribute("data-entity"));
    };
  });
})();
