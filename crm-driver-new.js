(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var params = new URLSearchParams(location.search);
  var contactId = params.get("contactId") || params.get("id");
  if (contactId) {
    var inp = document.querySelector('[name="contactId"]');
    if (inp) inp.value = contactId;
    var link = document.getElementById("linkContact");
    if (link) link.href = "./crm-contact.html?id=" + encodeURIComponent(contactId);
  }

  document.getElementById("drvForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var cid = String(fd.get("contactId") || "").trim();
    var msg = document.getElementById("drvMsg");
    msg.textContent = "";

    if (!/^ct_[a-zA-Z0-9_-]+$/.test(cid)) {
      msg.textContent = "ID contact invalide (format ct_…).";
      return;
    }

    fetch("/api/crm/modules?resource=drivers&contactId=" + encodeURIComponent(cid), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        first_name: fd.get("firstName"),
        last_name: fd.get("lastName"),
        license_number: fd.get("licenseNumber") || null,
        license_type: fd.get("licenseType") || null,
        status: fd.get("status") || "Actif",
      }),
    })
      .then(function (r) {
        return r.json().then(function (body) {
          return { ok: r.ok, body: body };
        });
      })
      .then(function (res) {
        if (!res.ok || !res.body.ok) {
          msg.textContent = (res.body && res.body.error) || "Erreur lors de l'enregistrement.";
          return;
        }
        location.href =
          "./crm-driver-detail.html?id=" +
          encodeURIComponent(res.body.item.id) +
          "&contactId=" +
          encodeURIComponent(cid);
      })
      .catch(function () {
        msg.textContent = "Impossible de contacter le serveur.";
      });
  };
})();
