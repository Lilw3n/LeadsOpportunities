(function () {
  var KEY = "crm_settings";

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch (e) {
      return {};
    }
  }

  function save(data) {
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(data));
    sessionStorage.setItem("crm_timeline_period", data.timelinePeriod || "all");
    var el = document.getElementById("setSaved");
    if (el) {
      el.style.display = "block";
      setTimeout(function () {
        el.style.display = "none";
      }, 3000);
    }
    var upd = document.getElementById("setUpdated");
    if (upd) upd.textContent = new Date(data.updatedAt).toLocaleString("fr-FR");
  }

  var s = load();
  var form = document.getElementById("settingsForm");
  if (s.companyName) form.companyName.value = s.companyName;
  if (s.contactEmail) form.contactEmail.value = s.contactEmail;
  if (s.currency) form.currency.value = s.currency;
  if (s.timelinePeriod) form.timelinePeriod.value = s.timelinePeriod;
  if (s.compactKpis) form.compactKpis.checked = true;
  if (s.autoLogout) form.autoLogout.checked = true;
  if (s.emailNotifs) form.emailNotifs.checked = true;
  if (s.matterportAdminEmail) form.matterportAdminEmail.value = s.matterportAdminEmail;
  else if (form.matterportAdminEmail) form.matterportAdminEmail.value = "wendy.buchet.pro@gmail.com";
  if (s.extraAdminEmails && form.extraAdminEmails) form.extraAdminEmails.value = s.extraAdminEmails;
  if (s.updatedAt) document.getElementById("setUpdated").textContent = new Date(s.updatedAt).toLocaleString("fr-FR");

  form.onsubmit = function (e) {
    e.preventDefault();
    save({
      companyName: form.companyName.value,
      contactEmail: form.contactEmail.value,
      currency: form.currency.value,
      timelinePeriod: form.timelinePeriod.value,
      compactKpis: !!form.compactKpis.checked,
      autoLogout: !!form.autoLogout.checked,
      emailNotifs: !!form.emailNotifs.checked,
      matterportAdminEmail: form.matterportAdminEmail ? form.matterportAdminEmail.value.trim() : "",
      extraAdminEmails: form.extraAdminEmails ? form.extraAdminEmails.value.trim() : "",
    });
  };

  document.getElementById("btnExportSettings").onclick = function () {
    var blob = new Blob([JSON.stringify(load(), null, 2)], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "crm-settings-" + new Date().toISOString().slice(0, 10) + ".json";
    a.click();
  };

  var btnMaint = document.getElementById("btnMaintenance");
  if (btnMaint) {
    btnMaint.onclick = function () {
      alert("Maintenance simulée — purge cache, reindex recherche (multisite).");
    };
  }
})();
