(function () {
  var token = localStorage.getItem("lo_token");
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  var Lib = window.CrmAgencyFees;
  if (!Lib) {
    console.error("CrmAgencyFees missing");
    return;
  }

  var state = {
    agencies: Lib.listAgencies(),
    agencyId: null,
    scheduleId: null,
  };

  if (state.agencies.length) {
    state.agencyId = state.agencies[0].id;
    state.scheduleId = (state.agencies[0].schedules[0] && state.agencies[0].schedules[0].id) || null;
  }

  document.getElementById("calcUrssaf").value = Lib.DEFAULT_URSSAF_PCT;
  document.getElementById("calcIr").value = Lib.DEFAULT_IR_PCT;

  function currentAgency() {
    return state.agencies.find(function (a) {
      return a.id === state.agencyId;
    }) || null;
  }

  function currentSchedule(agency) {
    if (!agency) return null;
    return (
      (agency.schedules || []).find(function (s) {
        return s.id === state.scheduleId;
      }) ||
      agency.schedules[0] ||
      null
    );
  }

  function refreshAgenciesFromStore() {
    state.agencies = Lib.listAgencies();
    if (!state.agencies.some(function (a) { return a.id === state.agencyId; })) {
      state.agencyId = state.agencies[0] ? state.agencies[0].id : null;
    }
    var ag = currentAgency();
    if (ag && !ag.schedules.some(function (s) { return s.id === state.scheduleId; })) {
      state.scheduleId = ag.schedules[0] ? ag.schedules[0].id : null;
    }
  }

  function renderAgencyList() {
    var root = document.getElementById("agencyList");
    if (!state.agencies.length) {
      root.innerHTML = '<p style="padding:14px;color:var(--muted);font-size:.9rem">Aucune agence. Cliquez sur « + Agence ».</p>';
      return;
    }
    root.innerHTML = state.agencies
      .map(function (a) {
        var active = a.id === state.agencyId ? " active" : "";
        return (
          '<button type="button" class="af-agency-btn' +
          active +
          '" data-id="' +
          a.id +
          '"><strong>' +
          esc(a.name) +
          "</strong><span>Ma part : " +
          a.agentSharePct +
          " % · " +
          (a.schedules || []).length +
          " barème(s)</span></button>"
        );
      })
      .join("");
    root.querySelectorAll(".af-agency-btn").forEach(function (btn) {
      btn.onclick = function () {
        state.agencyId = btn.getAttribute("data-id");
        var ag = currentAgency();
        state.scheduleId = ag && ag.schedules[0] ? ag.schedules[0].id : null;
        renderAll();
      };
    });
  }

  function renderAgencyForm() {
    var ag = currentAgency();
    var disabled = !ag;
    document.getElementById("agencyName").disabled = disabled;
    document.getElementById("agentSharePct").disabled = disabled;
    document.getElementById("agencyNotes").disabled = disabled;
    if (!ag) {
      document.getElementById("agencyName").value = "";
      document.getElementById("agentSharePct").value = "";
      document.getElementById("agencyNotes").value = "";
      return;
    }
    document.getElementById("agencyName").value = ag.name;
    document.getElementById("agentSharePct").value = ag.agentSharePct;
    document.getElementById("agencyNotes").value = ag.notes || "";
  }

  function renderScheduleTabs() {
    var ag = currentAgency();
    var root = document.getElementById("scheduleTabs");
    if (!ag || !(ag.schedules || []).length) {
      root.innerHTML = '<span style="color:var(--muted);font-size:.85rem">Aucun barème</span>';
      return;
    }
    root.innerHTML = ag.schedules
      .map(function (s) {
        var active = s.id === state.scheduleId ? " active" : "";
        return (
          '<button type="button" class="af-sched-tab' +
          active +
          '" data-id="' +
          s.id +
          '">' +
          esc(s.name) +
          "</button>"
        );
      })
      .join("");
    root.querySelectorAll(".af-sched-tab").forEach(function (btn) {
      btn.onclick = function () {
        state.scheduleId = btn.getAttribute("data-id");
        renderBrackets();
        renderCalc();
      };
    });
  }

  function renderBrackets() {
    var ag = currentAgency();
    var sched = currentSchedule(ag);
    var tbody = document.querySelector("#bracketsTable tbody");
    if (!sched) {
      tbody.innerHTML = '<tr><td colspan="5" style="color:var(--muted)">Ajoutez un barème.</td></tr>';
      return;
    }
    var rows = (sched.brackets || []).slice().sort(function (a, b) {
      return (a.min || 0) - (b.min || 0);
    });
    tbody.innerHTML = rows
      .map(function (b, i) {
        return (
          "<tr data-id='" +
          esc(b.id) +
          "'>" +
          "<td><input class='af-num' type='number' data-f='min' value='" +
          (b.min || 0) +
          "' /></td>" +
          "<td><input class='af-num' type='number' data-f='max' placeholder='∞' value='" +
          (b.max == null ? "" : b.max) +
          "' /></td>" +
          "<td><select data-f='type'>" +
          "<option value='percent'" +
          (b.type === "percent" ? " selected" : "") +
          ">% du prix</option>" +
          "<option value='fixed'" +
          (b.type === "fixed" ? " selected" : "") +
          ">Montant fixe €</option>" +
          "</select></td>" +
          "<td><input class='af-num' type='number' step='0.01' data-f='value' value='" +
          (b.value || 0) +
          "' /></td>" +
          "<td><button type='button' class='btn btn-ghost af-del-br' data-i='" +
          i +
          "'>✕</button></td>" +
          "</tr>"
        );
      })
      .join("");

    tbody.querySelectorAll(".af-del-br").forEach(function (btn) {
      btn.onclick = function () {
        var id = btn.closest("tr").getAttribute("data-id");
        sched.brackets = sched.brackets.filter(function (x) {
          return x.id !== id;
        });
        persistAgency(ag);
        renderBrackets();
        renderCalc();
      };
    });
  }

  function collectBracketsFromDom() {
    var rows = [];
    document.querySelectorAll("#bracketsTable tbody tr[data-id]").forEach(function (tr) {
      var maxRaw = tr.querySelector("[data-f='max']").value.trim();
      rows.push({
        id: tr.getAttribute("data-id"),
        min: Number(tr.querySelector("[data-f='min']").value) || 0,
        max: maxRaw === "" ? null : Number(maxRaw),
        type: tr.querySelector("[data-f='type']").value,
        value: Number(tr.querySelector("[data-f='value']").value) || 0,
      });
    });
    return rows;
  }

  function persistAgency(ag) {
    Lib.upsertAgency(ag);
    refreshAgenciesFromStore();
  }

  function saveAgencyMeta() {
    var ag = currentAgency();
    if (!ag) return;
    ag.name = document.getElementById("agencyName").value.trim() || ag.name;
    ag.agentSharePct = Number(document.getElementById("agentSharePct").value) || 0;
    ag.notes = document.getElementById("agencyNotes").value;
    // keep current brackets from DOM if editing
    var sched = currentSchedule(ag);
    if (sched) sched.brackets = collectBracketsFromDom();
    persistAgency(ag);
    renderAll();
  }

  function saveBrackets() {
    var ag = currentAgency();
    var sched = currentSchedule(ag);
    if (!ag || !sched) return;
    sched.brackets = collectBracketsFromDom();
    persistAgency(ag);
    renderAll();
  }

  function renderCalc() {
    var ag = currentAgency();
    var box = document.getElementById("calcResult");
    var detail = document.getElementById("calcDetail");
    if (!ag) {
      box.innerHTML = "";
      detail.textContent = "";
      return;
    }
    var price = Number(document.getElementById("calcPrice").value) || 0;
    var res = Lib.calculate({
      agency: ag,
      scheduleId: state.scheduleId,
      price: price,
      urssafPct: Number(document.getElementById("calcUrssaf").value),
      irPct: Number(document.getElementById("calcIr").value),
    });
    box.innerHTML =
      '<div class="af-kpi muted"><span>Honoraires agence</span><strong>' +
      Lib.formatEuro(res.agencyFee) +
      '</strong></div>' +
      '<div class="af-kpi"><span>Ta part (' +
      res.agentSharePct +
      '%)</span><strong>' +
      Lib.formatEuro(res.agentGross) +
      '</strong></div>' +
      '<div class="af-kpi muted"><span>Charges (URSSAF+IR)</span><strong>' +
      Lib.formatEuro(res.charges) +
      '</strong></div>' +
      '<div class="af-kpi highlight"><span>Net estimé</span><strong>' +
      Lib.formatEuro(res.agentNet) +
      "</strong></div>";

    var br = res.bracket;
    var brLabel = br
      ? "Tranche " +
        (br.min || 0).toLocaleString("fr-FR") +
        " → " +
        (br.max == null ? "∞" : Number(br.max).toLocaleString("fr-FR")) +
        " · " +
        Lib.formatBracketLabel(br)
      : "Aucune tranche";
    detail.textContent =
      (res.schedule ? res.schedule.name + " — " : "") +
      brLabel +
      " · agence " +
      ag.name;
  }

  function renderAll() {
    renderAgencyList();
    renderAgencyForm();
    renderScheduleTabs();
    renderBrackets();
    renderCalc();
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  document.getElementById("btnNewAgency").onclick = function () {
    var ag = Lib.emptyAgency();
    Lib.upsertAgency(ag);
    refreshAgenciesFromStore();
    state.agencyId = ag.id;
    state.scheduleId = ag.schedules[0] ? ag.schedules[0].id : null;
    renderAll();
  };

  document.getElementById("btnSaveAgency").onclick = saveAgencyMeta;
  document.getElementById("btnSaveBrackets").onclick = saveBrackets;

  document.getElementById("btnDeleteAgency").onclick = function () {
    var ag = currentAgency();
    if (!ag) return;
    if (!confirm('Supprimer l\'agence « ' + ag.name + ' » et ses barèmes ?')) return;
    Lib.deleteAgency(ag.id);
    refreshAgenciesFromStore();
    renderAll();
  };

  document.getElementById("btnAddBracket").onclick = function () {
    var ag = currentAgency();
    var sched = currentSchedule(ag);
    if (!ag || !sched) return;
    sched.brackets = collectBracketsFromDom();
    sched.brackets.push(Lib.emptyBracket());
    persistAgency(ag);
    renderBrackets();
    renderCalc();
  };

  document.getElementById("btnAddSchedule").onclick = function () {
    var ag = currentAgency();
    if (!ag) return;
    var name = prompt("Nom du barème", "Nouveau barème");
    if (name == null) return;
    var sched = Lib.emptySchedule();
    sched.name = String(name).trim() || "Nouveau barème";
    ag.schedules.push(sched);
    state.scheduleId = sched.id;
    persistAgency(ag);
    renderAll();
  };

  document.getElementById("btnRenameSchedule").onclick = function () {
    var ag = currentAgency();
    var sched = currentSchedule(ag);
    if (!ag || !sched) return;
    var name = prompt("Nouveau nom", sched.name);
    if (name == null) return;
    sched.name = String(name).trim() || sched.name;
    persistAgency(ag);
    renderAll();
  };

  document.getElementById("btnDeleteSchedule").onclick = function () {
    var ag = currentAgency();
    var sched = currentSchedule(ag);
    if (!ag || !sched) return;
    if ((ag.schedules || []).length <= 1) {
      alert("Gardez au moins un barème, ou créez-en un autre avant de supprimer.");
      return;
    }
    if (!confirm('Supprimer le barème « ' + sched.name + ' » ?')) return;
    ag.schedules = ag.schedules.filter(function (s) {
      return s.id !== sched.id;
    });
    state.scheduleId = ag.schedules[0].id;
    persistAgency(ag);
    renderAll();
  };

  document.getElementById("btnResetDefaults").onclick = function () {
    if (!confirm("Réinitialiser Laforêt + Portes Clés (écrase tes modifications locales) ?")) return;
    Lib.resetDefaults();
    refreshAgenciesFromStore();
    state.agencyId = state.agencies[0] ? state.agencies[0].id : null;
    state.scheduleId =
      state.agencies[0] && state.agencies[0].schedules[0] ? state.agencies[0].schedules[0].id : null;
    renderAll();
  };

  ["calcPrice", "calcUrssaf", "calcIr"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", renderCalc);
  });

  // Live recalc when share % changes (before save)
  document.getElementById("agentSharePct").addEventListener("input", function () {
    var ag = currentAgency();
    if (!ag) return;
    ag.agentSharePct = Number(document.getElementById("agentSharePct").value) || 0;
    renderCalc();
  });

  renderAll();
})();
