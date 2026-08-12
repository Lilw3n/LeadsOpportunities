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

  var taxPrefs = Lib.loadTaxPrefs();

  function fillTaxPresetSelect() {
    var sel = document.getElementById("taxPreset");
    sel.innerHTML = Lib.TAX_PRESETS.map(function (p) {
      return '<option value="' + p.id + '">' + p.label + "</option>";
    }).join("");
    sel.value = taxPrefs.presetId || "custom_22";
  }

  function applyTaxPrefsToForm() {
    document.getElementById("chargesPct").value = taxPrefs.chargesPct;
    document.getElementById("cfePct").value = taxPrefs.cfePct != null ? taxPrefs.cfePct : 0.5;
    document.getElementById("accountingPct").value =
      taxPrefs.accountingPct != null ? taxPrefs.accountingPct : 1;
    document.getElementById("calcUrssaf").value = taxPrefs.urssafPct;
    document.getElementById("calcIr").value = taxPrefs.irPct;
    document.getElementById("taxPreset").value = taxPrefs.presetId || "custom";
    var adv = document.getElementById("taxAdvanced");
    if (taxPrefs.advanced) adv.open = true;
  }

  function persistTaxFromForm() {
    taxPrefs = {
      presetId: document.getElementById("taxPreset").value,
      chargesPct: Number(document.getElementById("chargesPct").value) || 0,
      cfePct: Number(document.getElementById("cfePct").value) || 0,
      accountingPct: Number(document.getElementById("accountingPct").value) || 0,
      urssafPct: Number(document.getElementById("calcUrssaf").value) || 0,
      irPct: Number(document.getElementById("calcIr").value) || 0,
      advanced: !!document.getElementById("taxAdvanced").open,
      splitMode: taxPrefs.splitMode || "agent_gross",
      agentSharePct: taxPrefs.agentSharePct != null ? taxPrefs.agentSharePct : 100,
    };
    Lib.saveTaxPrefs(taxPrefs);
  }

  function currentChargesPct() {
    return Number(document.getElementById("chargesPct").value) || 0;
  }

  function currentCfePct() {
    return Number(document.getElementById("cfePct").value) || 0;
  }

  function currentAccountingPct() {
    return Number(document.getElementById("accountingPct").value) || 0;
  }

  function authHeaders() {
    return {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    };
  }

  function syncPrefsToServer() {
    persistTaxFromForm();
    var status = document.getElementById("stripePrefsStatus");
    status.textContent = "Enregistrement…";
    return fetch("/api/crm/agent-tax-prefs", {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify({
        chargesPct: taxPrefs.chargesPct,
        cfePct: taxPrefs.cfePct,
        accountingPct: taxPrefs.accountingPct,
        agentSharePct: taxPrefs.agentSharePct || 100,
        splitMode: taxPrefs.splitMode || "agent_gross",
        presetId: taxPrefs.presetId,
      }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        status.textContent = res.ok
          ? "OK — Stripe utilisera ces % à chaque encaissement"
          : res.error || "Erreur";
        if (res.ok && res.samplePer1000) {
          renderStripePreview(1000, res.samplePer1000);
        }
      })
      .catch(function (e) {
        status.textContent = e.message || "Erreur réseau";
      });
  }

  function loadStripeSplits() {
    fetch("/api/crm/agent-payment-splits?limit=20", { headers: authHeaders() })
      .then(function (r) {
        return r.json();
      })
      .then(function (res) {
        var tbody = document.querySelector("#stripeSplitsTable tbody");
        if (!res.ok || !(res.splits || []).length) {
          tbody.innerHTML =
            '<tr><td colspan="7" style="color:var(--muted)">Aucun encaissement Stripe ventilé pour l’instant. Les prochains paiements CRM/messagerie seront séparés automatiquement.</td></tr>';
          return;
        }
        tbody.innerHTML = res.splits
          .map(function (s) {
            var d = s.created_at ? new Date(s.created_at).toLocaleDateString("fr-FR") : "—";
            return (
              "<tr><td>" +
              d +
              "</td><td>" +
              Lib.formatEuro(s.amount_eur) +
              "</td><td>" +
              Lib.formatEuro(s.agent_gross_eur) +
              "</td><td>" +
              Lib.formatEuro(s.urssaf_reserve_eur) +
              "</td><td>" +
              Lib.formatEuro(s.cfe_reserve_eur) +
              "</td><td>" +
              Lib.formatEuro(s.accounting_reserve_eur) +
              "</td><td><strong>" +
              Lib.formatEuro(s.agent_net_eur) +
              "</strong></td></tr>"
            );
          })
          .join("");
      })
      .catch(function () {
        document.querySelector("#stripeSplitsTable tbody").innerHTML =
          '<tr><td colspan="7" style="color:var(--muted)">Impossible de charger le ledger Stripe.</td></tr>';
      });
  }

  function renderStripePreview(amount, split) {
    var box = document.getElementById("stripeSplitPreview");
    if (!split) {
      split = {
        amountEur: amount,
        agentGross: amount,
        urssafReserve: (amount * currentChargesPct()) / 100,
        cfeReserve: (amount * currentCfePct()) / 100,
        accountingReserve: (amount * currentAccountingPct()) / 100,
      };
      split.totalReserves = split.urssafReserve + split.cfeReserve + split.accountingReserve;
      split.agentNet = amount - split.totalReserves;
    }
    box.innerHTML =
      '<div class="af-kpi muted"><span>Sur ' +
      Lib.formatEuro(split.amountEur || amount) +
      ' encaissé</span><strong>Répartition Stripe</strong></div>' +
      '<div class="af-kpi"><span>Dans ta poche</span><strong>' +
      Lib.formatEuro(split.agentNet) +
      '</strong></div>' +
      '<div class="af-kpi muted"><span>Réserve URSSAF/impôts</span><strong>' +
      Lib.formatEuro(split.urssafReserve) +
      '</strong></div>' +
      '<div class="af-kpi muted"><span>Réserve CFE</span><strong>' +
      Lib.formatEuro(split.cfeReserve) +
      '</strong></div>' +
      '<div class="af-kpi muted"><span>Réserve compta</span><strong>' +
      Lib.formatEuro(split.accountingReserve) +
      "</strong></div>";
  }

  fillTaxPresetSelect();
  applyTaxPrefsToForm();
  loadStripeSplits();
  renderStripePreview(1000);

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
      chargesPct: currentChargesPct(),
      cfePct: currentCfePct(),
      accountingPct: currentAccountingPct(),
    });
    box.innerHTML =
      '<div class="af-kpi muted"><span>Net vendeur</span><strong>' +
      Lib.formatEuro(res.price) +
      '</strong></div>' +
      '<div class="af-kpi muted"><span>Honoraires agence</span><strong>' +
      Lib.formatEuro(res.agencyFee) +
      '</strong></div>' +
      '<div class="af-kpi"><span>Ta part (' +
      res.agentSharePct +
      '%)</span><strong>' +
      Lib.formatEuro(res.agentGross) +
      '</strong></div>' +
      '<div class="af-kpi muted"><span>Réserves (URSSAF+CFE+compta)</span><strong>' +
      Lib.formatEuro(res.charges) +
      '</strong></div>' +
      '<div class="af-kpi highlight"><span>Dans ta poche</span><strong>' +
      Lib.formatEuro(res.agentNet) +
      "</strong></div>";
    renderStripePreview(res.agentGross, {
      amountEur: res.agentGross,
      agentNet: res.agentNet,
      urssafReserve: res.urssafReserve,
      cfeReserve: res.cfeReserve,
      accountingReserve: res.accountingReserve,
    });

    var br = res.bracket;
    var brLabel = br
      ? "Tranche " +
        (br.min || 0).toLocaleString("fr-FR") +
        " → " +
        (br.max == null ? "∞" : Number(br.max).toLocaleString("fr-FR")) +
        " · " +
        Lib.formatBracketLabel(br)
      : "Aucune tranche";
    var basis = res.priceBasis === "net_vendeur" ? "base net vendeur" : "base prix vente";
    detail.textContent =
      (res.schedule ? res.schedule.name + " — " : "") +
      brLabel +
      " · " +
      basis +
      " · " +
      ag.name;
  }

  function renderCompare() {
    var tbody = document.querySelector("#compareTable tbody");
    var hint = document.getElementById("cmpHint");
    var price = Number(document.getElementById("cmpPrice").value) || 0;
    var kind = document.getElementById("cmpKind").value;
    var rows = Lib.compareAgencies({
      price: price,
      kind: kind,
      chargesPct: currentChargesPct(),
      cfePct: currentCfePct(),
      accountingPct: currentAccountingPct(),
    });
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="color:var(--muted)">Aucune agence</td></tr>';
      hint.textContent = "";
      return;
    }
    tbody.innerHTML = rows
      .map(function (row, i) {
        var r = row.result;
        var best = i === 0 ? " best" : "";
        var win = i === 0 ? '<span class="af-win">meilleure part</span>' : "";
        var schedName = row.schedule ? esc(row.schedule.name) : "—";
        var badge = row.hasMatchingKind
          ? ""
          : ' <span class="af-badge warn">barème proche</span>';
        return (
          '<tr class="' +
          best +
          '" data-id="' +
          esc(row.agency.id) +
          '">' +
          "<td><strong>" +
          esc(row.agency.name) +
          "</strong>" +
          win +
          "<br><span style='font-size:.78rem;color:var(--muted)'>Part agent " +
          row.agency.agentSharePct +
          " %</span></td>" +
          "<td>" +
          schedName +
          badge +
          "</td>" +
          "<td>" +
          Lib.formatEuro(r.agencyFee) +
          "</td>" +
          "<td>" +
          Lib.formatEuro(r.fai) +
          "</td>" +
          "<td><strong>" +
          Lib.formatEuro(r.agentGross) +
          "</strong></td>" +
          "<td>" +
          Lib.formatEuro(r.agentNet) +
          "</td>" +
          "</tr>"
        );
      })
      .join("");

    tbody.querySelectorAll("tr[data-id]").forEach(function (tr) {
      tr.style.cursor = "pointer";
      tr.onclick = function () {
        state.agencyId = tr.getAttribute("data-id");
        var ag = currentAgency();
        var kind = document.getElementById("cmpKind").value;
        var match = ag && (ag.schedules || []).find(function (s) {
          return s.kind === kind;
        });
        state.scheduleId = match
          ? match.id
          : ag && ag.schedules[0]
            ? ag.schedules[0].id
            : null;
        document.getElementById("calcPrice").value = document.getElementById("cmpPrice").value;
        renderAll();
      };
    });

    hint.textContent =
      "Net vendeur " +
      Lib.formatEuro(price) +
      " · charges " +
      currentChargesPct() +
      " % · classement par ta part brute · clic sur une ligne pour éditer l'agence";
  }

  function renderAll() {
    renderAgencyList();
    renderAgencyForm();
    renderScheduleTabs();
    renderBrackets();
    renderCalc();
    renderCompare();
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

  document.getElementById("btnApplyPortesCles").onclick = function () {
    var ag = currentAgency();
    var share = ag && /portes?\s*cl/i.test(ag.name) ? ag.agentSharePct : 85;
    if (
      !confirm(
        "Remplacer le barème Portes Clés par le barème officiel TG0422 (habitation forfaits + pro 10 %) ?\nTa part agent (" +
          share +
          " %) est conservée."
      )
    ) {
      return;
    }
    var updated = Lib.applyPortesClesOfficial(share);
    refreshAgenciesFromStore();
    state.agencyId = updated.id;
    state.scheduleId = updated.schedules[0] ? updated.schedules[0].id : null;
    renderAll();
  };

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

  ["calcPrice"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      document.getElementById("cmpPrice").value = document.getElementById("calcPrice").value;
      renderCalc();
      renderCompare();
    });
  });

  ["cmpPrice", "cmpKind", "chargesPct", "cfePct", "accountingPct"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      if (id === "cmpPrice") document.getElementById("calcPrice").value = document.getElementById("cmpPrice").value;
      if (id === "chargesPct" || id === "cfePct" || id === "accountingPct") {
        document.getElementById("taxPreset").value = "custom";
        persistTaxFromForm();
      }
      renderCompare();
      renderCalc();
    });
    document.getElementById(id).addEventListener("change", function () {
      if (id === "chargesPct" || id === "cfePct" || id === "accountingPct") persistTaxFromForm();
      renderCompare();
      renderCalc();
    });
  });

  document.getElementById("btnSyncStripePrefs").onclick = syncPrefsToServer;

  document.getElementById("taxPreset").addEventListener("change", function () {
    var preset = Lib.getTaxPreset(document.getElementById("taxPreset").value);
    if (preset.chargesPct != null) {
      document.getElementById("chargesPct").value = preset.chargesPct;
      document.getElementById("calcUrssaf").value = preset.urssafPct;
      document.getElementById("calcIr").value = preset.irPct;
    }
    persistTaxFromForm();
    renderCompare();
    renderCalc();
  });

  document.getElementById("btnSyncChargesFromSplit").onclick = function () {
    var u = Number(document.getElementById("calcUrssaf").value) || 0;
    var i = Number(document.getElementById("calcIr").value) || 0;
    document.getElementById("chargesPct").value = Math.round((u + i) * 10) / 10;
    document.getElementById("taxPreset").value = "custom";
    persistTaxFromForm();
    renderCompare();
    renderCalc();
  };

  ["calcUrssaf", "calcIr"].forEach(function (id) {
    document.getElementById(id).addEventListener("change", persistTaxFromForm);
  });

  document.getElementById("taxAdvanced").addEventListener("toggle", persistTaxFromForm);

  // Live recalc when share % changes (before save)
  document.getElementById("agentSharePct").addEventListener("input", function () {
    var ag = currentAgency();
    if (!ag) return;
    ag.agentSharePct = Number(document.getElementById("agentSharePct").value) || 0;
    renderCalc();
    renderCompare();
  });

  renderAll();
})();
