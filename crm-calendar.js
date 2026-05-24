(function () {

  var TOKEN_KEY = "lo_token";

  var events = [];

  var viewDate = new Date();



  if (!localStorage.getItem(TOKEN_KEY)) {

    location.href = "./crm.html";

    return;

  }



  var token = localStorage.getItem(TOKEN_KEY);

  var calBanner = document.getElementById("calBanner");

  var btnConnectCal = document.getElementById("btnConnectCal");
  var btnPullCal = document.getElementById("btnPullCal");

  function authHeaders() {

    return { Authorization: "Bearer " + token };

  }



  function loadCalendarStatus() {

    fetch("/api/crm/calendar-sync?action=status", { headers: authHeaders() })

      .then(function (r) {

        return r.json();

      })

      .then(function (res) {

        if (!calBanner) return;

        if (res.connected) {

          calBanner.className = "cal-banner cal-banner-ok";

          calBanner.textContent =

            "Agenda Google connecte (" + (res.calendarId || "primary") + ")";

          if (btnConnectCal) btnConnectCal.textContent = "Reconnecter agenda Google";

        } else {

          calBanner.className = "cal-banner cal-banner-warn";

          calBanner.textContent =

            "Agenda Google non connecte — les evenements CRM ne seront pas synchronises.";

        }

      })

      .catch(function () {

        if (calBanner) calBanner.textContent = "Statut agenda indisponible";

      });

  }



  if (btnConnectCal) {

    btnConnectCal.onclick = function () {

      fetch("/api/crm/calendar-sync?action=connect", { headers: authHeaders() })

        .then(function (r) {

          return r.json();

        })

        .then(function (res) {

          if (res.url) location.href = res.url;

          else alert(res.error || "Connexion impossible");

        });

    };

  }

  if (btnPullCal) {
    btnPullCal.onclick = function () {
      fetch("/api/crm/calendar-sync?action=pull", { headers: authHeaders() })
        .then(function (r) {
          return r.json();
        })
        .then(function (res) {
          alert(
            res.ok
              ? "Sync OK — " + (res.imported || 0) + " importe(s)"
              : res.error || "Erreur"
          );
          loadEvents(render);
        });
    };
  }

  if (new URLSearchParams(location.search).get("calendar") === "connected") {

    loadCalendarStatus();

  } else {

    loadCalendarStatus();

  }



  var days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  document.getElementById("calHead").innerHTML = days

    .map(function (d) {

      return '<div class="cal-head">' + d + "</div>";

    })

    .join("");



  function loadEvents(cb) {

    fetch("/api/crm/events", { headers: authHeaders() })

      .then(function (r) {

        return r.json();

      })

      .then(function (res) {

        events = (res.ok && res.events) || [];

        if (cb) cb();

      });

  }



  function render() {

    var y = viewDate.getFullYear();

    var m = viewDate.getMonth();

    document.getElementById("monthLabel").textContent = viewDate.toLocaleDateString("fr-FR", {

      month: "long",

      year: "numeric",

      timeZone: "Europe/Paris",

    });

    var first = new Date(y, m, 1);

    var start = new Date(first);

    var dow = (first.getDay() + 6) % 7;

    start.setDate(first.getDate() - dow);

    var html = "";

    for (var i = 0; i < 42; i++) {

      var d = new Date(start);

      d.setDate(start.getDate() + i);

      var key = d.toISOString().slice(0, 10);

      var dayEv = events.filter(function (e) {

        return e.eventDate && String(e.eventDate).slice(0, 10) === key;

      });

      var cls =

        "cal-day" +

        (d.getMonth() !== m ? " style='opacity:.4'" : "") +

        (dayEv.length ? " has-ev" : "");

      html +=

        "<div class='" +

        cls +

        "'><span>" +

        d.getDate() +

        "</span>" +

        dayEv

          .slice(0, 3)

          .map(function (e) {

            var sync = e.googleSyncStatus === "synced" ? " ✓" : "";

            return (

              '<a class="cal-ev" href="./crm-contact.html?id=' +

              encodeURIComponent(e.contactId) +

              '" title="' +

              (e.title || "") +

              sync +

              '">' +

              (e.title || "Evt") +

              sync +

              "</a>"

            );

          })

          .join("") +

        "</div>";

    }

    document.getElementById("calMount").innerHTML = html;

  }



  document.getElementById("btnPrev").onclick = function () {

    viewDate.setMonth(viewDate.getMonth() - 1);

    render();

  };

  document.getElementById("btnNext").onclick = function () {

    viewDate.setMonth(viewDate.getMonth() + 1);

    render();

  };



  loadEvents(render);

})();

