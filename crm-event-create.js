(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }
  var params = new URLSearchParams(location.search);
  if (params.get("contactId")) document.querySelector("[name=contactId]").value = params.get("contactId");

  document.getElementById("evForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    fetch("/api/crm/events", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({
        contactId: fd.get("contactId"),
        title: fd.get("title"),
        eventDate: fd.get("eventDate"),
        priority: fd.get("priority"),
        eventType: "rdv",
        status: "pending",
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        document.getElementById("evMsg").textContent = res.ok ? "Événement créé" : res.error || "Erreur";
        if (res.ok) setTimeout(function () {
          location.href = "./crm-calendar.html";
        }, 800);
      });
  };
})();
