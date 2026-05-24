(function () {
  var TOKEN_KEY = "lo_ext_token";
  var EMAIL_KEY = "lo_client_email";

  document.getElementById("loginForm").onsubmit = function (e) {
    e.preventDefault();
    var email = new FormData(e.target).get("email");
    var errEl = document.getElementById("loginError");
    errEl.classList.add("hidden");
    fetch("/api/external/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email }),
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
        localStorage.setItem(TOKEN_KEY, res.token);
        localStorage.setItem(EMAIL_KEY, res.profile.email);
        localStorage.setItem("lo_ext_profile", JSON.stringify(res.profile));
        location.href = "./dashboard.html";
      })
      .catch(function () {
        errEl.textContent = "Erreur réseau";
        errEl.classList.remove("hidden");
      });
  };

  if (localStorage.getItem(TOKEN_KEY)) location.href = "./dashboard.html";

  var q = new URLSearchParams(location.search).get("email");
  if (q) {
    var inp = document.querySelector('input[name="email"]');
    if (inp) inp.value = q;
  }
})();
