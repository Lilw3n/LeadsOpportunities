(function () {
  document.getElementById("regForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var errEl = document.getElementById("regError");
    errEl.classList.add("hidden");
    fetch("/api/external/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName: fd.get("firstName"),
        lastName: fd.get("lastName"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        company: fd.get("company"),
        primaryNeed: fd.get("need"),
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
        document.getElementById("regForm").classList.add("hidden");
        document.getElementById("regSuccess").classList.remove("hidden");
        setTimeout(function () {
          location.href = "./login.html?email=" + encodeURIComponent(fd.get("email"));
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
