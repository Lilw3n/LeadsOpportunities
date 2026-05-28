(function () {
  var TOKEN_KEY = "lo_token";
  if (!localStorage.getItem(TOKEN_KEY)) {
    location.href = "./crm.html";
    return;
  }

  var Memo = window.CrmWholesalersMemo;
  if (!Memo) return;

  var filter = "all";
  var searchQ = "";
  var viewMode = "table";

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function filtered() {
    return Memo.listAll().filter(function (p) {
      if (filter === "to_contact" && p.partnershipStatus !== "to_contact") return false;
      if (filter === "active_partner" && p.partnershipStatus !== "active_partner" && p.partnershipStatus !== "signed") return false;
      if (filter === "vtc" && p.products.indexOf("vtc-taxi") < 0) return false;
      if (filter === "rc-pro" && p.products.indexOf("rc-pro") < 0) return false;
      if (filter === "negociant" && p.products.indexOf("negociant-auto") < 0) return false;
      if (searchQ) {
        var q = searchQ.toLowerCase();
        var hay =
          (p.displayName +
            " " +
            p.specialties +
            " " +
            p.contactName +
            " " +
            p.contactEmail +
            " " +
            p.notes +
            " " +
            p.products.join(" ")).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
  }

  function renderStats() {
    var all = Memo.listAll();
    var active = all.filter(function (p) {
      return p.partnershipStatus === "active_partner" || p.partnershipStatus === "signed";
    }).length;
    var todo = all.filter(function (p) {
      return p.partnershipStatus === "to_contact";
    }).length;
    var progress = all.filter(function (p) {
      return p.partnershipStatus === "in_progress" || p.partnershipStatus === "docs_sent";
    }).length;
    document.getElementById("whStats").innerHTML =
      '<div class="wh-stat"><strong>' +
      all.length +
      '</strong><span>Grossistes suivis</span></div>' +
      '<div class="wh-stat"><strong>' +
      active +
      '</strong><span>Partenariats actifs</span></div>' +
      '<div class="wh-stat"><strong>' +
      progress +
      '</strong><span>En cours</span></div>' +
      '<div class="wh-stat"><strong>' +
      todo +
      '</strong><span>A contacter</span></div>';
  }

  function productPills(products) {
    if (!products || !products.length) return '<span style="color:var(--muted)">—</span>';
    return products
      .map(function (id) {
        return '<span class="wh-pill-products">' + esc(Memo.productLabel(id)) + "</span>";
      })
      .join("");
  }

  function renderTable() {
    var items = filtered();
    var tbody = document.getElementById("whTableBody");
    if (!items.length) {
      tbody.innerHTML =
        '<tr><td colspan="8">Aucun grossiste — cliquez sur « + Ajouter grossiste ».</td></tr>';
      return;
    }
    tbody.innerHTML = items
      .map(function (p) {
        var st = Memo.statusMeta(p.partnershipStatus);
        return (
          "<tr>" +
          "<td><strong>" +
          p.logo +
          " " +
          esc(p.displayName) +
          "</strong>" +
          (p.website
            ? '<br><a href="' +
              esc(p.website) +
              '" target="_blank" rel="noopener" style="font-size:.78rem">Site</a>'
            : "") +
          "</td>" +
          "<td>" +
          productPills(p.products) +
          (p.specialties ? '<br><small style="color:var(--muted)">' + esc(p.specialties) + "</small>" : "") +
          "</td>" +
          "<td>" +
          esc(p.contactName || "—") +
          (p.contactEmail ? "<br>" + esc(p.contactEmail) : "") +
          (p.contactPhone ? "<br>" + esc(p.contactPhone) : "") +
          "</td>" +
          '<td><span class="wh-badge ' +
          st.cls +
          '">' +
          esc(st.label) +
          "</span></td>" +
          "<td>" +
          esc(p.commission || "—") +
          (p.onboardingDays ? "<br><small>" + esc(p.onboardingDays) + " j</small>" : "") +
          "</td>" +
          "<td>" +
          esc(p.priority || "—") +
          "</td>" +
          "<td>" +
          esc(p.nextAction || "—") +
          "</td>" +
          '<td style="white-space:nowrap">' +
          '<button type="button" class="btn btn-ghost btn-sm btn-edit-wh" data-id="' +
          esc(p.id) +
          '">Modifier</button> ' +
          (p.isCustom
            ? '<button type="button" class="btn btn-ghost btn-sm btn-del-wh" data-id="' +
              esc(p.id) +
              '">Suppr.</button>'
            : "") +
          "</td></tr>"
        );
      })
      .join("");

    bindRowActions();
  }

  function renderCards() {
    var items = filtered();
    var mount = document.getElementById("whCardWrap");
    if (!items.length) {
      mount.innerHTML = "<p>Aucun grossiste.</p>";
      return;
    }
    mount.innerHTML = items
      .map(function (p) {
        var st = Memo.statusMeta(p.partnershipStatus);
        var cls =
          "wh-card" +
          (p.partnershipStatus === "active_partner" || p.partnershipStatus === "signed"
            ? " verified"
            : p.partnershipStatus === "to_contact"
              ? " doubtful"
              : "");
        return (
          '<div class="' +
          cls +
          '"><div style="display:flex;justify-content:space-between;align-items:start;gap:8px">' +
          '<div><span style="font-size:1.6rem">' +
          p.logo +
          '</span> <strong style="font-size:1.05rem">' +
          esc(p.displayName) +
          "</strong></div>" +
          '<span class="wh-badge ' +
          st.cls +
          '">' +
          esc(st.label) +
          "</span></div>" +
          '<p style="margin:8px 0">' +
          productPills(p.products) +
          "</p>" +
          (p.specialties
            ? '<p style="color:var(--muted);font-size:.85rem;margin:0 0 8px">' + esc(p.specialties) + "</p>"
            : "") +
          (p.commission ? "<p><strong>Commission :</strong> " + esc(p.commission) + "</p>" : "") +
          (p.notes ? '<p style="font-size:.85rem;margin-top:8px">' + esc(p.notes) + "</p>" : "") +
          '<p style="margin-top:10px;display:flex;flex-wrap:wrap;gap:6px">' +
          (p.website
            ? '<a href="' + esc(p.website) + '" target="_blank" rel="noopener">Extranet</a>'
            : "") +
          '<button type="button" class="btn btn-ghost btn-sm btn-edit-wh" data-id="' +
          esc(p.id) +
          '">Modifier</button>' +
          '<a href="./crm-eligibility-test.html?partner=' +
          encodeURIComponent(p.id) +
          '" class="btn btn-ghost btn-sm">Eligibilite</a>' +
          "</p></div>"
        );
      })
      .join("");
    bindRowActions();
  }

  function bindRowActions() {
    document.querySelectorAll(".btn-edit-wh").forEach(function (btn) {
      btn.onclick = function () {
        openForm(Memo.getById(btn.getAttribute("data-id")));
      };
    });
    document.querySelectorAll(".btn-del-wh").forEach(function (btn) {
      btn.onclick = function () {
        if (!confirm("Supprimer ce grossiste du memo ?")) return;
        Memo.remove(btn.getAttribute("data-id"));
        renderAll();
      };
    });
  }

  function renderAll() {
    renderStats();
    if (viewMode === "table") renderTable();
    else renderCards();
  }

  function setView(mode) {
    viewMode = mode;
    document.getElementById("whTableWrap").classList.toggle("wh-hidden", mode !== "table");
    document.getElementById("whCardWrap").classList.toggle("wh-hidden", mode !== "cards");
    document.getElementById("btnViewTable").classList.toggle("active", mode === "table");
    document.getElementById("btnViewCards").classList.toggle("active", mode === "cards");
    renderAll();
  }

  function fillSelects() {
    var statusSel = document.getElementById("whStatusSelect");
    var prioSel = document.getElementById("whPrioritySelect");
    var prodBox = document.getElementById("whProductsBox");
    statusSel.innerHTML = Memo.PARTNERSHIP_STATUS.map(function (s) {
      return '<option value="' + s.id + '">' + s.label + "</option>";
    }).join("");
    prioSel.innerHTML = Memo.PRIORITY.map(function (p) {
      return '<option value="' + p.id + '">' + p.label + "</option>";
    }).join("");
    prodBox.innerHTML = Memo.PRODUCT_OPTIONS.map(function (p) {
      return (
        '<label><input type="checkbox" name="prod_' +
        p.id +
        '" value="' +
        p.id +
        '" /> ' +
        p.label +
        "</label>"
      );
    }).join("");
  }

  function openForm(entry) {
    var panel = document.getElementById("whFormPanel");
    var form = document.getElementById("whForm");
    panel.classList.remove("wh-hidden");
    document.getElementById("whFormTitle").textContent = entry
      ? "Modifier — " + entry.displayName
      : "Ajouter un grossiste";
    form.reset();
    if (!entry) {
      form.querySelector('[name="id"]').value = "";
      form.querySelector('[name="isCustom"]').value = "1";
      return;
    }
    form.querySelector('[name="id"]').value = entry.id;
    form.querySelector('[name="isCustom"]').value = entry.isCustom ? "1" : "0";
    form.displayName.value = entry.displayName;
    form.logo.value = entry.logo || "";
    form.website.value = entry.website || "";
    form.contactName.value = entry.contactName || "";
    form.contactEmail.value = entry.contactEmail || "";
    form.contactPhone.value = entry.contactPhone || "";
    form.partnershipStatus.value = entry.partnershipStatus || "to_contact";
    form.commission.value = entry.commission || "";
    form.onboardingDays.value = entry.onboardingDays || "";
    form.priority.value = entry.priority || "medium";
    form.specialties.value = entry.specialties || "";
    form.nextAction.value = entry.nextAction || "";
    form.notes.value = entry.notes || "";
    entry.products.forEach(function (pid) {
      var cb = form.querySelector('[name="prod_' + pid + '"]');
      if (cb) cb.checked = true;
    });
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  document.getElementById("btnAddWh").onclick = function () {
    openForm(null);
  };
  document.getElementById("btnCancelForm").onclick = function () {
    document.getElementById("whFormPanel").classList.add("wh-hidden");
  };
  document.getElementById("btnViewTable").onclick = function () {
    setView("table");
  };
  document.getElementById("btnViewCards").onclick = function () {
    setView("cards");
  };
  document.getElementById("btnExportCsv").onclick = function () {
    var csv = Memo.toCsv(filtered());
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "memo-grossistes-" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click();
  };

  document.getElementById("whForm").onsubmit = function (e) {
    e.preventDefault();
    var fd = new FormData(e.target);
    var products = [];
    Memo.PRODUCT_OPTIONS.forEach(function (p) {
      if (fd.get("prod_" + p.id)) products.push(p.id);
    });
    var id = fd.get("id") || "wh_" + Date.now();
    Memo.upsert({
      id: id,
      isCustom: fd.get("isCustom") === "1" || !Memo.getById(id),
      displayName: fd.get("displayName"),
      logo: fd.get("logo") || "🏢",
      website: fd.get("website"),
      contactName: fd.get("contactName"),
      contactEmail: fd.get("contactEmail"),
      contactPhone: fd.get("contactPhone"),
      products: products,
      specialties: fd.get("specialties"),
      partnershipStatus: fd.get("partnershipStatus"),
      commission: fd.get("commission"),
      onboardingDays: fd.get("onboardingDays"),
      priority: fd.get("priority"),
      nextAction: fd.get("nextAction"),
      notes: fd.get("notes"),
    });
    document.getElementById("whFormPanel").classList.add("wh-hidden");
    renderAll();
  };

  document.querySelectorAll("#filters .crm-filter-chip").forEach(function (btn) {
    btn.onclick = function () {
      filter = btn.getAttribute("data-f");
      document.querySelectorAll("#filters .crm-filter-chip").forEach(function (b) {
        b.classList.toggle("active", b === btn);
      });
      renderAll();
    };
  });

  document.getElementById("whSearch").oninput = function (e) {
    searchQ = e.target.value.trim();
    renderAll();
  };

  fillSelects();
  setView("table");
})();
