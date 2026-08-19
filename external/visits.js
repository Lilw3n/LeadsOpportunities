(function () {
  var TOKEN_KEY = "lo_ext_token";

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function authHeaders() {
    return {
      Authorization: "Bearer " + localStorage.getItem(TOKEN_KEY),
      "Content-Type": "application/json",
    };
  }

  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./login.html";
    return;
  }

  function renderVisits(items) {
    var host = document.getElementById("visList");
    if (!items || !items.length) {
      host.innerHTML = '<h2>Visites planifiées et notées</h2><p class="vis-empty">Aucune visite disponible pour le moment.</p>';
      return;
    }
    host.innerHTML =
      "<h2>Visites planifiées et notées</h2>" +
      items
        .map(function (item) {
          var feedback = item.feedback;
          return (
            '<div class="vis-item"><h3>' +
            esc(item.title || "Visite") +
            "</h3>" +
            '<div class="vis-meta">' +
            (item.eventDate ? new Date(item.eventDate).toLocaleDateString("fr-FR") : "Date à confirmer") +
            (item.eventTime ? " · " + esc(item.eventTime) : "") +
            (item.location ? " · " + esc(item.location) : "") +
            "</div>" +
            (feedback
              ? '<div><span class="vis-note">Note ' +
                esc(String(feedback.rating || "—")) +
                "/5</span>" +
                (feedback.wouldOffer ? " · prêt à faire une offre" : "") +
                (feedback.comments ? "<p>" + esc(feedback.comments) + "</p>" : "") +
                "</div>"
              : '<p class="vis-empty">Aucun retour saisi pour cette visite.</p>') +
            "</div>"
          );
        })
        .join("")
    ;
  }

  function populateSelect(items) {
    var select = document.getElementById("visEventId");
    items.forEach(function (item) {
      var opt = document.createElement("option");
      opt.value = item.id;
      opt.textContent =
        (item.eventDate ? new Date(item.eventDate).toLocaleDateString("fr-FR") + " — " : "") +
        (item.title || "Visite");
      select.appendChild(opt);
    });
  }

  function load() {
    fetch("/api/external/visits", { method: "GET", headers: authHeaders() })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || "Erreur");
        renderVisits(res.visits || []);
        populateSelect(res.visits || []);
      })
      .catch(function (err) {
        document.getElementById("visList").innerHTML = '<p class="vis-empty">' + esc(String(err.message || err)) + "</p>";
      });
  }

  document.getElementById("visForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var visitors = [];
    if (fd.get("visitorFullName") || fd.get("visitorEmail") || fd.get("visitorPhone")) {
      visitors.push({
        fullName: fd.get("visitorFullName"),
        email: fd.get("visitorEmail"),
        phone: fd.get("visitorPhone"),
        role: "acquereur",
      });
    }
    fetch("/api/external/visits", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        eventId: fd.get("eventId"),
        propertyRef: fd.get("propertyRef"),
        visitType: fd.get("visitType"),
        rating: fd.get("rating"),
        budgetNote: fd.get("budgetNote"),
        wouldOffer: fd.get("wouldOffer") === "yes",
        comments: fd.get("comments"),
        visitorContacts: visitors,
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) throw new Error(res.error || "Erreur");
        document.getElementById("visMsg").textContent = "Retour enregistré ✓";
        e.target.reset();
        document.getElementById("visEventId").innerHTML = '<option value="">Aucune / saisie libre</option>';
        load();
      })
      .catch(function (err) {
        document.getElementById("visMsg").textContent = String(err.message || err);
      });
  };

  load();
})();
