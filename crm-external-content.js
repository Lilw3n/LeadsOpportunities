(function () {
  var KEY = "lo_external_cms";
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }
  if (window.CrmAdminGuard && !window.CrmAdminGuard.ensureAdmin("cmsPanel")) return;

  var data = {};
  try {
    data = JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch (e) {}
  var form = document.getElementById("cmsForm");
  if (data.heroTitle) form.heroTitle.value = data.heroTitle;
  if (data.heroSubtitle) form.heroSubtitle.value = data.heroSubtitle;
  if (data.ctaLabel) form.ctaLabel.value = data.ctaLabel;
  if (data.ctaUrl) form.ctaUrl.value = data.ctaUrl;

  form.onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    localStorage.setItem(
      KEY,
      JSON.stringify({
        heroTitle: fd.get("heroTitle"),
        heroSubtitle: fd.get("heroSubtitle"),
        ctaLabel: fd.get("ctaLabel"),
        ctaUrl: fd.get("ctaUrl"),
      })
    );
    var msg = document.getElementById("cmsMsg");
    if (msg) msg.textContent = "Contenu enregistré — rechargez le portail externe pour prévisualiser.";
  };
})();
