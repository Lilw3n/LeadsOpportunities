(function () {
  var TOKEN_KEY = "lo_ext_token";
  var EMAIL_KEY = "lo_client_email";

  function showMsg(el, text, ok) {
    el.textContent = text;
    el.classList.remove("hidden");
    el.style.color = ok ? "#15803d" : "#b91c1c";
  }

  function storeAndRedirect(token, email, profile, dest) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(EMAIL_KEY, email);
    localStorage.setItem("lo_ext_profile", JSON.stringify(profile || { email: email }));
    location.href = dest || "./dashboard.html";
  }

  var params = new URLSearchParams(location.search);
  if (params.get("ext_oauth") === "success" || params.get("verify") === "success") {
    var token = params.get("token");
    var email = params.get("email");
    var dest = params.get("dest") || "./dashboard.html";
    if (token && email) {
      var msg =
        params.get("verified") === "google"
          ? "Connexion Google réussie — redirection…"
          : "E-mail confirmé — redirection…";
      document.body.insertAdjacentHTML(
        "afterbegin",
        '<p style="text-align:center;padding:12px;background:#ecfdf5;color:#065f46;margin:0">' + msg + "</p>"
      );
      storeAndRedirect(token, email, { email: email }, dest.indexOf("/") === 0 ? dest : "./dashboard.html");
    }
  }

  var verifyErr = params.get("verify_error") || params.get("oauth_error");
  if (verifyErr) {
    var errEl = document.getElementById("loginError");
    if (errEl) showMsg(errEl, decodeURIComponent(verifyErr), false);
  }

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
        storeAndRedirect(res.token, res.profile.email, res.profile);
      })
      .catch(function () {
        errEl.textContent = "Erreur réseau";
        errEl.classList.remove("hidden");
      });
  };

  if (localStorage.getItem(TOKEN_KEY) && !params.get("verify")) location.href = "./dashboard.html";

  var q = params.get("email");
  if (q) {
    var inp = document.querySelector('input[name="email"]');
    if (inp) inp.value = q;
  }
})();
