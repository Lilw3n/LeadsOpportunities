(function () {
  var TOKEN_KEY = "lo_token";
  var Types = window.CrmAgendaTypes;
  var token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    location.href = "./crm.html";
    return;
  }
  var params = new URLSearchParams(location.search);
  var form = document.getElementById("evForm");
  var datePicker = form.querySelector("[name=eventDate]");
  var dateText = form.querySelector("[name=eventDateText]");
  var contactIdInput = document.getElementById("contactId");
  var propertyIdInput = document.getElementById("propertyId");
  var suggest = document.getElementById("contactSuggest");
  var searchInput = document.getElementById("contactSearch");

  if (params.get("contactId")) contactIdInput.value = params.get("contactId");
  if (params.get("propertyId")) propertyIdInput.value = params.get("propertyId");
  if (params.get("title")) form.querySelector("[name=title]").value = params.get("title");
  if (params.get("type") && Types) form.querySelector("[name=eventType]").value = params.get("type");

  if (Types) {
    document.getElementById("eventType").innerHTML = Types.TYPES.map(function (t) {
      return '<option value="' + t.id + '">' + t.label + "</option>";
    }).join("");
    document.getElementById("eventMode").innerHTML = Types.MODES.map(function (m) {
      return '<option value="' + m.id + '">' + m.label + "</option>";
    }).join("");
    if (params.get("type")) document.getElementById("eventType").value = params.get("type");
  }

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

  if (!datePicker.value) {
    var today = new Date();
    datePicker.value =
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0");
  }
  dateText.value = toHumanDate(datePicker.value);
  datePicker.addEventListener("change", function () {
    dateText.value = toHumanDate(datePicker.value);
  });
  dateText.addEventListener("blur", function () {
    var parsed = parseHumanDate(dateText.value);
    if (!dateText.value.trim()) return;
    if (!parsed) {
      document.getElementById("evMsg").style.color = "#b91c1c";
      document.getElementById("evMsg").textContent = "Date invalide (JJ/MM/AAAA)";
      return;
    }
    datePicker.value = parsed;
    dateText.value = toHumanDate(parsed);
    document.getElementById("evMsg").textContent = "";
  });

  form.querySelector("[name=allDay]").onchange = function () {
    var on = this.checked;
    form.querySelector("[name=eventTime]").disabled = on;
    form.querySelector("[name=eventEndTime]").disabled = on;
  };

  var searchTimer = null;
  function searchContacts(q) {
    if (!q || q.length < 2) {
      suggest.style.display = "none";
      suggest.innerHTML = "";
      return;
    }
    fetch("/api/crm/contacts?search=" + encodeURIComponent(q) + "&limit=8", {
      headers: { Authorization: "Bearer " + token },
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        var list = (res.ok && res.contacts) || [];
        if (!list.length) {
          suggest.style.display = "none";
          return;
        }
        suggest.style.display = "block";
        suggest.innerHTML = list
          .map(function (c) {
            var name = ((c.first_name || "") + " " + (c.last_name || "")).trim() || c.email || c.id;
            return (
              '<button type="button" data-id="' +
              c.id +
              '" data-name="' +
              String(name).replace(/"/g, "&quot;") +
              '">' +
              name +
              (c.email ? " · " + c.email : "") +
              (c.phone ? " · " + c.phone : "") +
              "</button>"
            );
          })
          .join("");
        suggest.querySelectorAll("button").forEach(function (btn) {
          btn.onclick = function () {
            contactIdInput.value = btn.getAttribute("data-id");
            document.getElementById("contactLabel").textContent = "Sélectionné : " + btn.getAttribute("data-name");
            suggest.style.display = "none";
            searchInput.value = btn.getAttribute("data-name");
          };
        });
      });
  }

  searchInput.addEventListener("input", function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(function () {
      searchContacts(searchInput.value.trim());
    }, 250);
  });

  var interlocutorsBox = document.getElementById("interlocutorsBox");
  var INT = window.CrmDossierInterlocutors;

  function interlocutorRow(data) {
    data = data || {};
    var wrap = document.createElement("div");
    wrap.className = "ev-int-row";
    wrap.style.cssText = "display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:8px;margin-bottom:8px;align-items:end";
    wrap.innerHTML =
      '<label>Rôle<select class="crm-input ev-int-role">' +
      (INT ? INT.roleOptionsHtml(data.role || "client") : "") +
      "</select></label>" +
      '<label>Nom<input class="crm-input ev-int-name" placeholder="Nom" value="' +
      String(data.name || "").replace(/"/g, "&quot;") +
      '" /></label>' +
      '<label>Tél / e-mail<input class="crm-input ev-int-reach" placeholder="06… ou email" value="' +
      String(data.phone || data.email || "").replace(/"/g, "&quot;") +
      '" /></label>' +
      '<button type="button" class="btn btn-ghost btn-sm ev-int-rm">×</button>';
    wrap.querySelector(".ev-int-rm").onclick = function () {
      wrap.remove();
    };
    return wrap;
  }

  function collectInterlocutors() {
    if (!interlocutorsBox) return [];
    return Array.prototype.slice.call(interlocutorsBox.querySelectorAll(".ev-int-row")).map(function (row) {
      var reach = (row.querySelector(".ev-int-reach").value || "").trim();
      var item = {
        role: row.querySelector(".ev-int-role").value,
        name: row.querySelector(".ev-int-name").value,
        followUp: "pending",
      };
      if (reach.indexOf("@") >= 0) item.email = reach;
      else item.phone = reach;
      return item;
    });
  }

  if (interlocutorsBox && INT) {
    interlocutorsBox.appendChild(interlocutorRow({ role: "client" }));
    document.getElementById("btnAddInterlocutor").onclick = function () {
      interlocutorsBox.appendChild(interlocutorRow({ role: "banque" }));
    };
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
      msg.textContent = "Date requise.";
      return;
    }
    var allDay = !!form.querySelector("[name=allDay]").checked;
    msg.style.color = "#64748b";
    msg.textContent = "Enregistrement…";
    fetch("/api/crm/events", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({
        contactId: fd.get("contactId"),
        propertyId: fd.get("propertyId") || "",
        title: fd.get("title"),
        description: fd.get("description") || "",
        eventDate: finalDate,
        eventTime: allDay ? "09:00" : fd.get("eventTime") || "09:00",
        eventEndTime: allDay ? "18:00" : fd.get("eventEndTime") || null,
        location: fd.get("location") || "",
        mode: fd.get("mode") || "",
        reminderMinutes: Number(fd.get("reminderMinutes")),
        confidential: !!form.querySelector("[name=confidential]").checked,
        priority: fd.get("priority"),
        eventType: fd.get("eventType") || "meeting",
        status: "pending",
        source: "crm-agenda",
        interlocutors: collectInterlocutors(),
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (res.ok) {
          var sync = res.googleSync || {};
          msg.style.color = "#065f46";
          msg.textContent =
            "Événement créé" +
            (sync.ok && !sync.skipped
              ? " — synchronisé Google Calendar"
              : sync.skipped
                ? " — Google non connecté (RDV CRM OK)"
                : sync.error
                  ? " — CRM OK, sync Google : " + sync.error
                  : "");
          setTimeout(function () {
            location.href = "./crm-event-manager.html";
          }, 900);
        } else {
          msg.style.color = "#b91c1c";
          msg.textContent = res.error || "Erreur";
        }
      })
      .catch(function () {
        msg.style.color = "#b91c1c";
        msg.textContent = "Impossible de contacter le serveur.";
      });
  };
})();
