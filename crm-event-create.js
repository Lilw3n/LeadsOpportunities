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
        eventType: fd.get("eventType") || "meeting",
        status: "pending",
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        var msg = document.getElementById("evMsg");
        if (res.ok) {
          msg.style.color = "#065f46";
          msg.textContent = "Événement créé";
          setTimeout(function () {
            location.href = "./crm-events.html";
          }, 800);
        } else {
          msg.style.color = "#b91c1c";
          msg.textContent = res.error || "Erreur";
        }
      })
      .catch(function () {
        document.getElementById("evMsg").textContent = "Impossible de contacter le serveur.";
      });
  };
})();
