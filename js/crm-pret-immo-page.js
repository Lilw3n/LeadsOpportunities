(function () {
  var Lib = window.CrmPretImmo;
  var Store = window.CrmPretImmoStore;
  if (!Lib || !Store) return;
  if (!localStorage.getItem("lo_token")) {
    location.href = "./crm.html";
    return;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function fillFilters() {
    var rub = document.getElementById("fRubrique");
    Lib.SIM_TYPES.filter(function (t) {
      return t.group === "simulation";
    }).forEach(function (t) {
      rub.innerHTML += '<option value="' + t.id + '">' + t.label + "</option>";
    });
    var pos = document.getElementById("fPosition");
    Lib.POSITIONS.forEach(function (p) {
      pos.innerHTML += '<option value="' + p.id + '">' + p.label + "</option>";
    });
  }

  function buildSimMenu() {
    var panel = document.getElementById("simMenuPanel");
    var html = "";
    Lib.SIM_TYPES.forEach(function (t) {
      if (t.id === "rac") {
        html +=
          '<div class="has-sub"><button type="button">RAC <span>›</span></button><div class="pi-sub">';
        Lib.HOUSING_STATUSES.forEach(function (h) {
          html +=
            '<a href="./crm-pret-immo-sim.html?type=rac&housing=' +
            encodeURIComponent(h.id) +
            '">' +
            esc(h.label) +
            "</a>";
        });
        html += "</div></div>";
      } else if (t.id === "pvh") {
        html += '<a href="./crm-pret-immo-pvh.html">' + esc(t.label) + " : Calculette montant à rembourser</a>";
      } else {
        html +=
          '<a href="./crm-pret-immo-sim.html?type=' +
          encodeURIComponent(t.id) +
          '">' +
          esc(t.label) +
          "</a>";
      }
    });
    panel.innerHTML = html;
  }

  function query() {
    return {
      ref: document.getElementById("fRef").value.trim(),
      rubrique: document.getElementById("fRubrique").value,
      position: document.getElementById("fPosition").value,
      search: document.getElementById("fRef").value.trim(),
    };
  }

  function render() {
    var list = Store.list(query());
    var body = document.getElementById("piBody");
    var empty = document.getElementById("piEmpty");
    if (!list.length) {
      body.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    body.innerHTML = list
      .map(function (d) {
        var dep = (d.logement && d.logement.cp ? String(d.logement.cp).slice(0, 2) : "") || "—";
        var date = (d.updated_at || d.created_at || "").slice(0, 10);
        return (
          "<tr>" +
          '<td><a href="./crm-pret-immo-sim.html?id=' +
          encodeURIComponent(d.id) +
          '" title="Ouvrir">🔍</a></td>' +
          "<td>" +
          esc(date) +
          "</td>" +
          "<td><span class='pi-badge'>" +
          esc(Lib.typeLabel(d.rubrique)) +
          "</span></td>" +
          "<td><strong>" +
          esc(d.ref) +
          "</strong></td>" +
          "<td>" +
          esc(Lib.displayName(d.emprunteur) || "—") +
          "</td>" +
          "<td>" +
          esc(Lib.displayName(d.coemprunteur) || "—") +
          "</td>" +
          "<td>" +
          esc(dep) +
          "</td>" +
          "<td>" +
          esc(d.apporteur || "—") +
          "</td>" +
          "<td>" +
          esc(d.reseau || "—") +
          "</td>" +
          "<td>" +
          esc(d.utilisateur || "—") +
          "</td>" +
          "<td>" +
          esc(d.analyste || "—") +
          "</td>" +
          "<td>" +
          esc(d.gestionnaire || "—") +
          "</td>" +
          "<td>" +
          esc(Lib.positionLabel(d.position)) +
          "</td>" +
          "<td>" +
          (d.ddp ? "✓" : "—") +
          "</td>" +
          "<td>" +
          esc(Lib.euro(d.montant)) +
          "</td>" +
          "<td>" +
          esc(d.banque || "—") +
          "</td>" +
          "<td>" +
          esc(d.produit || "—") +
          "</td>" +
          "<td>" +
          (d.comments && d.comments.length ? "💬" + d.comments.length : "") +
          "</td>" +
          '<td><button type="button" class="btn btn-ghost btn-sm" data-arch="' +
          esc(d.id) +
          '">Archiver</button></td>' +
          "</tr>"
        );
      })
      .join("");

    body.querySelectorAll("[data-arch]").forEach(function (btn) {
      btn.onclick = function () {
        Store.archive(btn.getAttribute("data-arch"), true);
        render();
      };
    });
  }

  document.getElementById("btnSimMenu").onclick = function (e) {
    e.stopPropagation();
    document.getElementById("simMenu").classList.toggle("open");
  };
  document.addEventListener("click", function () {
    document.getElementById("simMenu").classList.remove("open");
  });
  document.getElementById("btnSearch").onclick = render;
  document.getElementById("fRubrique").onchange = render;
  document.getElementById("fPosition").onchange = render;
  document.getElementById("fRef").onkeydown = function (e) {
    if (e.key === "Enter") render();
  };

  // Prefill nouveau depuis deep link
  var params = new URLSearchParams(location.search);
  if (params.get("new") === "1") {
    var type = params.get("type") || "immo";
    var housing = params.get("housing") || "";
    location.href =
      "./crm-pret-immo-sim.html?type=" +
      encodeURIComponent(type) +
      (housing ? "&housing=" + encodeURIComponent(housing) : "") +
      (params.get("propertyId") ? "&propertyId=" + encodeURIComponent(params.get("propertyId")) : "") +
      (params.get("contactId") ? "&contactId=" + encodeURIComponent(params.get("contactId")) : "");
    return;
  }

  fillFilters();
  buildSimMenu();
  render();
})();
