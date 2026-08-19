(function () {
  var TOKEN_KEY = "lo_ext_token";

  document.getElementById("regForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var errEl = document.getElementById("regError");
    errEl.classList.add("hidden");
    if (fd.get("password") !== fd.get("passwordConfirm")) {
      errEl.textContent = "Les mots de passe ne correspondent pas.";
      errEl.classList.remove("hidden");
      return;
    }
    fetch("/api/external/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: fd.get("firstName"),
        lastName: fd.get("lastName"),
        fullName: [fd.get("firstName"), fd.get("lastName")].filter(Boolean).join(" ").trim(),
        email: fd.get("email"),
        phone: fd.get("phone"),
        password: fd.get("password"),
        portalRole: fd.get("portalRole"),
        company: fd.get("company"),
        primaryNeed: fd.get("need"),
        preferredCity: fd.get("preferredCity"),
        budget: fd.get("budget"),
        notes: fd.get("notes"),
        website: fd.get("website"),
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        if (!res.ok) {
          errEl.textContent = res.error || "Erreur";
          errEl.classList.remove("hidden");
          return;
        }
        if (res.token) localStorage.setItem(TOKEN_KEY, res.token);
        if (res.user) {
          localStorage.setItem("lo_ext_profile", JSON.stringify(res.user));
          localStorage.setItem("lo_client_email", res.user.email || String(fd.get("email") || ""));
        }
        document.getElementById("regForm").classList.add("hidden");
        document.getElementById("regSuccess").classList.remove("hidden");
        setTimeout(function () {
          location.href = "./dashboard.html";
        }, 2000);
      })
      .catch(function () {
        errEl.textContent = "Erreur réseau";
        errEl.classList.remove("hidden");
      });
  };

  var prefill = new URLSearchParams(location.search).get("email");
  if (prefill) document.querySelector('input[name="email"]').value = prefill;
})();
