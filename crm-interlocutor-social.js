(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var params = new URLSearchParams(location.search);
  if (params.get("id")) document.getElementById("contactId").value = params.get("id");

  function loadContact(id) {
    fetch("/api/crm/contact?id=" + encodeURIComponent(id), {
      headers: { Authorization: "Bearer " + token },
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) return;
        var meta = {};
        try {
          meta = JSON.parse(res.contact.metadata || "{}");
        } catch (e) {}
        var s = meta.social || {};
        var form = document.getElementById("socialForm");
        if (s.linkedin) form.linkedin.value = s.linkedin;
        if (s.facebook) form.facebook.value = s.facebook;
        if (s.instagram) form.instagram.value = s.instagram;
        if (s.website) form.website.value = s.website;
        if (s.bio) form.bio.value = s.bio;
      });
  }

  if (document.getElementById("contactId").value) loadContact(document.getElementById("contactId").value);

  document.getElementById("socialForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var id = fd.get("contactId");
    fetch("/api/crm/contact?id=" + encodeURIComponent(id), {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({
        metadata: {
          social: {
            linkedin: fd.get("linkedin"),
            facebook: fd.get("facebook"),
            instagram: fd.get("instagram"),
            website: fd.get("website"),
            bio: fd.get("bio"),
          },
        },
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        document.getElementById("socialMsg").textContent = res.ok ? "Profil social enregistré" : res.error || "Erreur";
      });
  };
})();
