(function () {
  var TOKEN_KEY = "lo_token";
  var ctx = { claims: [], drivers: [], vehicles: [] };
  var timer;

  function token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  if (!token()) {
    location.href = "./crm.html";
    return;
  }

  var params = new URLSearchParams(location.search);
  var product = params.get("product") || "vtc-taxi";
  var partner = params.get("partner");
  var urlContactId = params.get("contactId");

  document.getElementById("eligFormBox").innerHTML = window.PartnerEligibility.renderForm();
  document.getElementById("peProduct").value = product;
  if (partner) {
    var intro = document.createElement("p");
    intro.style.cssText = "color:var(--muted);font-size:.9rem;margin-bottom:12px";
    intro.textContent = "Partenaire ciblé : " + partner;
    document.getElementById("eligFormBox").prepend(intro);
  }

  document.getElementById("btnPartnerElig").onclick = runCheck;

  function runCheck() {
    var results = window.PartnerEligibility.checkAll(
      document.getElementById("peProduct").value,
      {
        age: document.getElementById("peAge").value,
        licenseYears: document.getElementById("peLicense").value,
        bonusMalus: document.getElementById("peBonus").value,
        claimsCount36: document.getElementById("peClaims") ? document.getElementById("peClaims").value : "",
      },
      ctx
    );
    if (partner) {
      results = results.filter(function (r) {
        return r.partnerId === partner || r.partnerId.indexOf(String(partner)) >= 0;
      });
    }
    document.getElementById("eligResultsBox").innerHTML =
      "<h2>Résultats</h2>" + window.PartnerEligibility.renderResults(results);
  }

  document.getElementById("contactPick").oninput = function () {
    clearTimeout(timer);
    var q = document.getElementById("contactPick").value.trim();
    if (q.length < 2) {
      document.getElementById("contactPickResults").innerHTML = "";
      return;
    }
    timer = setTimeout(function () {
      fetch("/api/crm/contacts?search=" + encodeURIComponent(q) + "&limit=5", {
        headers: { Authorization: "Bearer " + token() },
      })
        .then(function (r) {
          return r.json();
        })
        .then(function (res) {
          if (!res.ok || !res.contacts) return;
          document.getElementById("contactPickResults").innerHTML = res.contacts
            .map(function (c) {
              var name = ((c.first_name || "") + " " + (c.last_name || "")).trim() || c.email;
              return (
                '<button type="button" class="btn btn-ghost btn-sm pick-row" data-id="' +
                esc(c.id) +
                '" style="display:block;width:100%;text-align:left;margin-top:6px">' +
                esc(name) +
                " — " +
                esc(c.email || "") +
                "</button>"
              );
            })
            .join("");
          document.querySelectorAll(".pick-row").forEach(function (btn) {
            btn.onclick = function () {
              loadContact(btn.getAttribute("data-id"));
            };
          });
        });
    }, 300);
  };

  if (urlContactId) {
    document.getElementById("contactPick").value = urlContactId;
    var back = document.querySelector('a[href="./crm-partners.html"]');
    if (back) {
      back.href = "./crm-contact.html?id=" + encodeURIComponent(urlContactId);
      back.textContent = "← Fiche contact";
    }
    loadContact(urlContactId);
  }

  function loadContact(id) {
    fetch("/api/crm/contact?id=" + encodeURIComponent(id), {
      headers: { Authorization: "Bearer " + token() },
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) return;
        ctx = {
          claims: res.claims || [],
          drivers: res.drivers || [],
          vehicles: res.vehicles || [],
        };
        var peClaims = document.getElementById("peClaims");
        if (peClaims) peClaims.value = String((res.claims || []).length);
        document.getElementById("contactPickResults").innerHTML =
          '<p style="color:#166534;margin-top:8px">✓ Données chargées depuis la fiche — lancez la vérification</p>' +
          '<a href="./crm-contact.html?id=' +
          encodeURIComponent(id) +
          '">Ouvrir la fiche</a>';
        if (!urlContactId || id === urlContactId) runCheck();
      });
  }
})();
