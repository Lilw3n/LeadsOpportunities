(function () {
  var TOKEN_KEY = "lo_token";

  function token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function api(path, opts) {
    return fetch(path, {
      method: (opts && opts.method) || "GET",
      headers: Object.assign(
        { "Content-Type": "application/json" },
        token() ? { Authorization: "Bearer " + token() } : {}
      ),
      body: opts && opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(function (r) {
      return r.json();
    });
  }

  function toggleMobilite() {
    var pk = document.getElementById("profileKey").value;
    var show = pk === "mobilite-vtc" || pk === "mobilite";
    document.getElementById("mobiliteBlocks").style.display = show ? "block" : "none";
  }

  document.getElementById("profileKey").addEventListener("change", toggleMobilite);
  toggleMobilite();

  if (!token()) location.href = "./crm.html";

  document.getElementById("createForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var msg = document.getElementById("createMsg");
    var body = {
      profileKey: fd.get("profileKey"),
      primaryNeed: fd.get("profileKey") === "mobilite-vtc" ? "vtc" : fd.get("profileKey"),
      contactType: fd.get("contactType"),
      firstName: fd.get("firstName"),
      lastName: fd.get("lastName"),
      email: fd.get("email"),
      phone: fd.get("phone"),
      company: fd.get("company"),
      source: "crm_create_complete",
      accountHolder: fd.get("accountHolder"),
      iban: fd.get("iban"),
      bic: fd.get("bic"),
    };
  if (fd.get("driver_first_name") || fd.get("driver_last_name")) {
      body.drivers = [
        {
          first_name: fd.get("driver_first_name"),
          last_name: fd.get("driver_last_name"),
          license_number: fd.get("driver_license_number"),
        },
      ];
    }
    if (fd.get("vehicle_registration") || fd.get("vehicle_brand")) {
      body.vehicles = [
        {
          registration: fd.get("vehicle_registration"),
          brand: fd.get("vehicle_brand"),
          model: fd.get("vehicle_model"),
          vehicle_type: fd.get("vehicle_type"),
        },
      ];
    }
    api("/api/crm/create-complete", { method: "POST", body: body }).then(function (res) {
      if (res.ok && res.contactId) {
        location.href = "./crm-contact.html?id=" + encodeURIComponent(res.contactId);
      } else {
        msg.textContent = res.error || "Erreur";
        msg.style.color = "#b91c1c";
      }
    });
  });
})();
