/**
 * Admin : liste blog → questionnaires (compte admin + JSON généré)
 */
(function () {
  var USER_KEY = "lo_user";

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function guard() {
    try {
      var user = JSON.parse(localStorage.getItem(USER_KEY) || "null");
      if (user && user.role === "admin") return true;
    } catch (e) {}
    document.body.innerHTML =
      '<main style="max-width:480px;margin:48px auto;padding:24px;text-align:center">' +
      "<h1>Accès admin requis</h1>" +
      '<p>Connectez-vous avec un compte administrateur.</p>' +
      '<p><a class="btn btn-primary" href="./auth.html">Connexion</a></p></main>';
    return false;
  }

  function renderRows(rows) {
    var tbody = document.getElementById("bqTableBody");
    if (!tbody) return;
    if (!rows.length) {
      tbody.innerHTML =
        '<tr><td colspan="6">Aucune donnée. Lancez <code>npm run blog:admin-map</code> sur le projet.</td></tr>';
      return;
    }
    tbody.innerHTML = rows
      .map(function (r) {
        return (
          "<tr>" +
          '<td><a href="./blog/' +
          esc(r.file) +
          '" target="_blank" rel="noopener"><strong>' +
          esc(r.title) +
          "</strong></a><br><code style='font-size:.7rem'>" +
          esc(r.file) +
          "</code></td>" +
          "<td>" +
          esc(r.section) +
          (r.species ? ' <span class="bq-badge">' + esc(r.species) + "</span>" : "") +
          "</td>" +
          '<td class="bq-hook">' +
          esc(r.hook) +
          "</td>" +
          '<td class="bq-question">' +
          esc(r.question) +
          "</td>" +
          '<td class="bq-links">' +
          '<a href="' +
          esc(r.landing) +
          '">Landing</a>' +
          (r.express ? '<a href="' + esc(r.express) + '">Express</a>' : "") +
          '<a href="' +
          esc(r.questionnaire) +
          '">Questionnaire</a>' +
          "</td>" +
          "<td>" +
          (r.matchedRule ? '<span class="bq-badge bq-badge--rule">' + esc(r.matchedRule) + "</span>" : "—") +
          "</td></tr>"
        );
      })
      .join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!guard()) return;
    var allRows = [];
    fetch("./data/blog-questionnaire-admin.json")
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        allRows = data.rows || [];
        var sections = data.sections || [];
        var sel = document.getElementById("bqSection");
        sections.forEach(function (s) {
          var o = document.createElement("option");
          o.value = s;
          o.textContent = s;
          sel.appendChild(o);
        });
        function apply() {
          var q = (document.getElementById("bqSearch").value || "").trim().toLowerCase();
          var sec = sel.value;
          renderRows(
            allRows.filter(function (r) {
              if (sec && r.section !== sec) return false;
              if (!q) return true;
              return [r.title, r.file, r.section, r.hook, r.question, r.need, r.species, r.matchedRule]
                .join(" ")
                .toLowerCase()
                .includes(q);
            })
          );
        }
        document.getElementById("bqSearch").addEventListener("input", apply);
        sel.addEventListener("change", apply);
        renderRows(allRows);
      })
      .catch(function () {
        renderRows([]);
      });
  });
})();
