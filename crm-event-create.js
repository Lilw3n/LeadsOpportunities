(function () {
  var TOKEN_KEY = "lo_token";
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }
  var params = new URLSearchParams(location.search);
  if (params.get("contactId")) document.querySelector("[name=contactId]").value = params.get("contactId");
  var form = document.getElementById("evForm");
  var datePicker = form.querySelector("[name=eventDate]");
  var dateText = form.querySelector("[name=eventDateText]");

  function parseHumanDate(raw) {
    var s = String(raw || "").trim();
    if (!s) return "";
    var m = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
    if (!m) return "";
    var d = Number(m[1]);
    var mo = Number(m[2]);
    var y = Number(m[3]);
    if (!d || !mo || !y || mo < 1 || mo > 12 || d < 1 || d > 31) return "";
    var dt = new Date(y, mo - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return "";
    return y + "-" + String(mo).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  }

  function toHumanDate(iso) {
    var s = String(iso || "").trim();
    var m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return "";
    return m[3] + "/" + m[2] + "/" + m[1];
  }

  if (datePicker && dateText) {
    dateText.value = toHumanDate(datePicker.value);
    datePicker.addEventListener("change", function () {
      dateText.value = toHumanDate(datePicker.value);
    });
    dateText.addEventListener("blur", function () {
      var parsed = parseHumanDate(dateText.value);
      if (!dateText.value.trim()) return;
      if (!parsed) {
        document.getElementById("evMsg").style.color = "#b91c1c";
        document.getElementById("evMsg").textContent = "Date invalide (format attendu: JJ/MM/AAAA)";
        return;
      }
      datePicker.value = parsed;
      dateText.value = toHumanDate(parsed);
      document.getElementById("evMsg").textContent = "";
    });
  }

  form.onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    var msg = document.getElementById("evMsg");
    var typedDate = parseHumanDate(fd.get("eventDateText"));
    var pickedDate = String(fd.get("eventDate") || "").trim();
    var finalDate = typedDate || pickedDate;
    if (!finalDate) {
      msg.style.color = "#b91c1c";
      msg.textContent = "Date requise (calendrier ou saisie JJ/MM/AAAA).";
      return;
    }
    fetch("/api/crm/events", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({
        contactId: fd.get("contactId"),
        title: fd.get("title"),
        eventDate: finalDate,
        priority: fd.get("priority"),
        eventType: fd.get("eventType") || "meeting",
        status: "pending",
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
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
