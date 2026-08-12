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
  var Fin = window.CrmBuyerFinance;
  if (!Fin) {
    console.error("CrmBuyerFinance missing");
    return;
  }

  var state = {
    agencies: Lib.listAgencies(),
    agencyId: null,
    scheduleId: null,
    loanType: "pret_amortissable",
  };

  if (state.agencies.length) {
    var prefer =
      state.agencies.find(function (a) {
        return a.id === "agency_portes_cles" || /portes?\s*cl[eé]s/i.test(a.name || "");
      }) || state.agencies[0];
    state.agencyId = prefer.id;
    state.scheduleId = (prefer.schedules[0] && prefer.schedules[0].id) || null;
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
        var isPc = a.id === "agency_portes_cles" || /portes?\s*cl[eé]s/i.test(a.name || "");
        var hab = (a.schedules || []).find(function (s) {
          return s.kind === "vente_habitation";
        });
        var nBr = hab && hab.brackets ? hab.brackets.length : 0;
        var extra = isPc
          ? ' · <span class="af-badge ok">TG0422 · ' + nBr + " forfaits</span>"
          : nBr
            ? " · " + nBr + " tranches"
            : "";
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
          " barème(s)" +
          extra +
          "</span></button>"
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
    var special = document.getElementById("scheduleSpecialInfo");
    var tableWrap = document.querySelector("#bracketsTable").closest(".af-table-wrap");
    var addBtn = document.getElementById("btnAddBracket");
    if (!sched) {
      tbody.innerHTML = '<tr><td colspan="5" style="color:var(--muted)">Ajoutez un barème.</td></tr>';
      if (special) {
        special.style.display = "none";
        special.innerHTML = "";
      }
      updateScheduleHint(ag, null);
      return;
    }

    var model = sched.feeModel || "brackets";
    if (model !== "brackets") {
      if (tableWrap) tableWrap.style.display = "none";
      if (addBtn) addBtn.style.display = "none";
      if (special) {
        special.style.display = "block";
        if (model === "annual_rent_percent") {
          special.innerHTML =
            "<strong>Modèle TG0422</strong> : " +
            (sched.percentValue || 0) +
            " % " +
            (sched.percentTax === "ht" ? "HT" : "TTC") +
            " du loyer annuel" +
            (sched.percentTax === "ht" ? " (affiché en TTC = × 1,20)" : "") +
            ".";
        } else if (model === "per_sqm_rental") {
          var ps = sched.perSqm || {};
          var d = ps.dossier || {};
          special.innerHTML =
            "<strong>Location habitation TG0422</strong> (€ TTC / m² habitable) — Négociation " +
            (ps.negotiation || 0) +
            " €/m² (bailleur) · Dossier " +
            (d.tres_tendue || 0) +
            " / " +
            (d.tendue || 0) +
            " / " +
            (d.hors_zone || 0) +
            " €/m² (très tendue / tendue / hors zone, chaque partie) · EDL " +
            (ps.edl || 0) +
            " €/m² (chaque partie).";
        } else if (model === "fixed_fee") {
          special.innerHTML =
            "<strong>Forfait</strong> : " +
            Lib.formatEuro(sched.fixedFee || 0) +
            (sched.notes ? " — " + esc(sched.notes) : "");
        }
      }
      updateScheduleHint(ag, sched);
      return;
    }

    if (tableWrap) tableWrap.style.display = "";
    if (addBtn) addBtn.style.display = "";
    if (special) {
      special.style.display = "none";
      special.innerHTML = "";
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

    updateScheduleHint(ag, sched);
  }

  function updateScheduleHint(ag, sched) {
    var hint = document.getElementById("scheduleHint");
    if (!hint) return;
    var isPc = ag && (ag.id === "agency_portes_cles" || /portes?\s*cl[eé]s/i.test(ag.name || ""));
    if (isPc && sched && sched.kind === "vente_habitation") {
      var n = (sched.brackets || []).length;
      hint.innerHTML =
        "<strong>PDF TG0422 — Vente habitation</strong> : " +
        n +
        " lignes (0–20k / 20–40k / 40–70k → 5 000 € … jusqu’à 1 M€ → 57 000 €, puis 6 %). " +
        "Si tu vois seulement 6 tranches %, tu es sur <em>Laforêt</em> — clique <strong>Les Portes Clés</strong> à gauche, ou « Appliquer barème Portes Clés officiel ».";
      return;
    }
    if (isPc) {
      hint.textContent =
        "Portes Clés TG0422 : pro 10 % TTC · bail 30 % HT · loc. hab. €/m² · loc. pro 18 % TTC · avis 360 € TTC.";
      return;
    }
    if (ag && /lafor[eê]t/i.test(ag.name || "")) {
      hint.textContent =
        "Exemple Laforêt : 170 001–220 000 € → 9 % · Garage → 2 500 € fixe. Pour le PDF Portes Clés, sélectionne l’agence « Les Portes Clés » à gauche.";
      return;
    }
    hint.textContent = "Tranches % ou forfait — enregistre après modification.";
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
    var sched = currentSchedule(ag);
    if (sched && (!sched.feeModel || sched.feeModel === "brackets")) {
      sched.brackets = collectBracketsFromDom();
    }
    persistAgency(ag);
    renderAll();
  }

  function saveBrackets() {
    var ag = currentAgency();
    var sched = currentSchedule(ag);
    if (!ag || !sched) return;
    if (sched.feeModel && sched.feeModel !== "brackets") {
      persistAgency(ag);
      renderAll();
      return;
    }
    sched.brackets = collectBracketsFromDom();
    persistAgency(ag);
    renderAll();
  }

  function kindMeta(kind) {
    if (kind === "bail_commercial" || kind === "location_pro") {
      return { priceLabel: "Loyer annuel (€)", showSurface: false, showZone: false, showParty: false };
    }
    if (kind === "location_habitation") {
      return {
        priceLabel: "Référence (€, optionnel)",
        showSurface: true,
        showZone: true,
        showParty: true,
      };
    }
    if (kind === "avis_valeur") {
      return { priceLabel: "Référence (€, optionnel)", showSurface: false, showZone: false, showParty: false };
    }
    if (kind === "vente_pro" || kind === "vente_habitation" || kind === "garage") {
      return { priceLabel: "Prix net vendeur (€)", showSurface: false, showZone: false, showParty: false };
    }
    return { priceLabel: "Prix / référence (€)", showSurface: false, showZone: false, showParty: false };
  }

  function syncKindFields() {
    var kind = document.getElementById("cmpKind").value;
    var meta = kindMeta(kind);
    var cmpLabel = document.getElementById("cmpPriceLabel");
    var calcLabel = document.getElementById("calcPriceLabel");
    if (cmpLabel) cmpLabel.textContent = meta.priceLabel;
    if (calcLabel) calcLabel.textContent = meta.priceLabel;
    [
      ["cmpSurfaceWrap", meta.showSurface],
      ["cmpZoneWrap", meta.showZone],
      ["cmpPartyWrap", meta.showParty],
      ["calcSurfaceWrap", meta.showSurface],
      ["calcZoneWrap", meta.showZone],
      ["calcPartyWrap", meta.showParty],
    ].forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      if (el) el.hidden = !pair[1];
    });
  }

  function calcExtras() {
    return {
      surface: Number(document.getElementById("calcSurface").value) || Number(document.getElementById("cmpSurface").value) || 0,
      zone: document.getElementById("calcZone").value || document.getElementById("cmpZone").value || "hors_zone",
      rentalParty: document.getElementById("calcParty").value || document.getElementById("cmpParty").value || "total",
    };
  }

  function renderCalc() {
    var ag = currentAgency();
    var box = document.getElementById("calcResult");
    var detail = document.getElementById("calcDetail");
    syncKindFields();
    if (!ag) {
      box.innerHTML = "";
      detail.textContent = "";
      return;
    }
    var price = Number(document.getElementById("calcPrice").value) || 0;
    var extras = calcExtras();
    var res = Lib.calculate({
      agency: ag,
      scheduleId: state.scheduleId,
      price: price,
      surface: extras.surface,
      zone: extras.zone,
      rentalParty: extras.rentalParty,
      chargesPct: currentChargesPct(),
      cfePct: currentCfePct(),
      accountingPct: currentAccountingPct(),
    });
    var refLabel =
      res.priceBasis === "loyer_annuel"
        ? "Loyer annuel"
        : res.priceBasis === "surface_habitable"
          ? "Surface (m²)"
          : res.priceBasis === "forfait"
            ? "Forfait"
            : "Net vendeur";
    var refValue =
      res.feeModel === "per_sqm_rental"
        ? (extras.surface || 0) + " m²"
        : res.feeModel === "fixed_fee"
          ? Lib.formatEuro(res.agencyFee)
          : Lib.formatEuro(res.price);
    box.innerHTML =
      '<div class="af-kpi muted"><span>' +
      refLabel +
      "</span><strong>" +
      refValue +
      '</strong></div>' +
      '<div class="af-kpi muted"><span>Honoraires agence</span><strong>' +
      Lib.formatEuro(res.agencyFee) +
      '</strong></div>' +
      (res.fai != null
        ? '<div class="af-kpi muted"><span>Prix FAI</span><strong>' + Lib.formatEuro(res.fai) + "</strong></div>"
        : "") +
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
      : res.feeModel === "annual_rent_percent"
        ? (res.feeDetail && res.feeDetail.percent) +
          "% " +
          (res.schedule && res.schedule.percentTax === "ht" ? "HT→TTC" : "TTC")
        : res.feeModel === "per_sqm_rental"
          ? extras.surface + " m² · " + extras.zone + " · " + extras.rentalParty
          : res.feeModel === "fixed_fee"
            ? "Forfait TG0422"
            : "—";
    var basis =
      res.priceBasis === "net_vendeur"
        ? "base net vendeur"
        : res.priceBasis === "loyer_annuel"
          ? "base loyer annuel"
          : res.priceBasis === "surface_habitable"
            ? "base m²"
            : res.priceBasis === "forfait"
              ? "forfait"
              : "base prix vente";
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
    syncKindFields();
    var price = Number(document.getElementById("cmpPrice").value) || 0;
    var kind = document.getElementById("cmpKind").value;
    var extras = {
      surface: Number(document.getElementById("cmpSurface").value) || 0,
      zone: document.getElementById("cmpZone").value || "hors_zone",
      rentalParty: document.getElementById("cmpParty").value || "total",
    };
    var rows = Lib.compareAgencies({
      price: price,
      kind: kind,
      surface: extras.surface,
      zone: extras.zone,
      rentalParty: extras.rentalParty,
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
          (r.fai != null ? Lib.formatEuro(r.fai) : "—") +
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
        var kindSel = document.getElementById("cmpKind").value;
        var match = ag && (ag.schedules || []).find(function (s) {
          return s.kind === kindSel;
        });
        state.scheduleId = match
          ? match.id
          : ag && ag.schedules[0]
            ? ag.schedules[0].id
            : null;
        document.getElementById("calcPrice").value = document.getElementById("cmpPrice").value;
        document.getElementById("calcSurface").value = document.getElementById("cmpSurface").value;
        document.getElementById("calcZone").value = document.getElementById("cmpZone").value;
        document.getElementById("calcParty").value = document.getElementById("cmpParty").value;
        renderAll();
      };
    });

    var refHint =
      kind === "location_habitation"
        ? extras.surface + " m² · " + extras.zone
        : Lib.formatEuro(price);
    hint.textContent =
      "Réf. " +
      refHint +
      " · charges " +
      currentChargesPct() +
      " % · classement par ta part brute · clic sur une ligne pour éditer l'agence";
  }

  function readBuyerOpts() {
    return {
      loanType: state.loanType || "pret_amortissable",
      monthlyIncome: Number(document.getElementById("bfIncome").value) || 0,
      coBorrowerIncome: Number(document.getElementById("bfCoIncome").value) || 0,
      existingLoansMonthly: Number(document.getElementById("bfExisting").value) || 0,
      downPayment: Number(document.getElementById("bfDown").value) || 0,
      years: Number(document.getElementById("bfYears").value) || 25,
      ratePct: document.getElementById("bfRate").value === "" ? "" : Number(document.getElementById("bfRate").value),
      dtiMax: Number(document.getElementById("bfDti").value) || 35,
      feePayer: document.getElementById("bfFeePayer").value || "vendeur",
      notaryPreset: document.getElementById("bfNotary").value || "ancien",
      notaryPct: Number(document.getElementById("bfNotaryPct").value) || 7.5,
      financeNotary: document.getElementById("bfFinanceNotary").value !== "0",
      insurancePctYear: Number(document.getElementById("bfInsur").value) || 0.34,
      currentLoanBalance: Number(document.getElementById("bfCurBalance").value) || 0,
      currentLoanMonthly: Number(document.getElementById("bfCurMonthly").value) || 0,
      cashOut: Number(document.getElementById("bfCashOut").value) || 0,
      includeProjectInRachat: document.getElementById("bfIncludeProject").value !== "0",
      bridgeAmount: Number(document.getElementById("bfBridge").value) || 0,
      netVendeur: Number(document.getElementById("cmpPrice").value) || 0,
    };
  }

  function persistBuyerPrefs() {
    Fin.savePrefs(readBuyerOpts());
  }

  function applyBuyerPrefsToForm() {
    var p = Fin.loadPrefs();
    state.loanType = p.loanType || "pret_amortissable";
    document.getElementById("bfIncome").value = p.monthlyIncome;
    document.getElementById("bfCoIncome").value = p.coBorrowerIncome;
    document.getElementById("bfExisting").value = p.existingLoansMonthly;
    document.getElementById("bfDown").value = p.downPayment;
    document.getElementById("bfYears").value = p.years;
    document.getElementById("bfRate").value = p.ratePct === "" || p.ratePct == null ? "" : p.ratePct;
    document.getElementById("bfDti").value = p.dtiMax;
    document.getElementById("bfFeePayer").value = p.feePayer || "vendeur";
    document.getElementById("bfNotary").value = p.notaryPreset || "ancien";
    document.getElementById("bfNotaryPct").value = p.notaryPct != null ? p.notaryPct : 7.5;
    document.getElementById("bfFinanceNotary").value = p.financeNotary === false ? "0" : "1";
    document.getElementById("bfInsur").value = p.insurancePctYear != null ? p.insurancePctYear : 0.34;
    document.getElementById("bfCurBalance").value = p.currentLoanBalance || 0;
    document.getElementById("bfCurMonthly").value = p.currentLoanMonthly || 0;
    document.getElementById("bfCashOut").value = p.cashOut || 0;
    document.getElementById("bfIncludeProject").value = p.includeProjectInRachat === false ? "0" : "1";
    document.getElementById("bfBridge").value = p.bridgeAmount || 0;
  }

  function syncBuyerExtraFields() {
    var lt = state.loanType;
    var rachat = document.getElementById("bfRachatFields");
    var relais = document.getElementById("bfRelaisFields");
    var notaryWrap = document.getElementById("bfNotaryPctWrap");
    if (rachat) rachat.hidden = !(lt === "rachat" || lt === "renegociation");
    if (relais) relais.hidden = lt !== "relais";
    if (notaryWrap) notaryWrap.hidden = document.getElementById("bfNotary").value !== "custom";
  }

  function renderLoanTypeTabs() {
    var root = document.getElementById("loanTypeTabs");
    if (!root) return;
    root.innerHTML = Fin.LOAN_TYPES.map(function (t) {
      var active = t.id === state.loanType ? " active" : "";
      return (
        '<button type="button" class="af-mode-tab' +
        active +
        '" data-id="' +
        esc(t.id) +
        '" title="' +
        esc(t.desc) +
        '">' +
        esc(t.label) +
        "</button>"
      );
    }).join("");
    root.querySelectorAll(".af-mode-tab").forEach(function (btn) {
      btn.onclick = function () {
        state.loanType = btn.getAttribute("data-id");
        syncBuyerExtraFields();
        persistBuyerPrefs();
        renderBuyerFinance();
      };
    });
  }

  function statusBadge(status) {
    if (status === "ok") return '<span class="af-badge ok">OK</span>';
    if (status === "block") return '<span class="af-badge block">Bloqué</span>';
    return '<span class="af-badge warn">Attention</span>';
  }

  function renderBuyerFinance() {
    if (!document.getElementById("buyerFinancePanel")) return;
    renderLoanTypeTabs();
    syncBuyerExtraFields();

    var opts = readBuyerOpts();
    var price = Number(document.getElementById("cmpPrice").value) || 0;
    var kind = document.getElementById("cmpKind").value;
    var agencyRows = Lib.compareAgencies({
      price: price,
      kind: kind,
      surface: Number(document.getElementById("cmpSurface").value) || 0,
      zone: document.getElementById("cmpZone").value || "hors_zone",
      rentalParty: document.getElementById("cmpParty").value || "total",
      chargesPct: currentChargesPct(),
      cfePct: currentCfePct(),
      accountingPct: currentAccountingPct(),
    });

    var rows = Fin.compareWithAgencies(agencyRows, opts);
    var best = rows[0] && rows[0].finance;
    var kpis = document.getElementById("bfCapacityKpis");
    if (best && kpis) {
      var cap = best.capacity;
      kpis.innerHTML =
        '<div class="af-kpi muted"><span>Capacité max emprunt</span><strong>' +
        Fin.formatEuro(cap.maxLoan) +
        '</strong></div>' +
        '<div class="af-kpi muted"><span>Mensualité dispo (DTI)</span><strong>' +
        Fin.formatEuro(cap.roomForNewLoan) +
        '</strong></div>' +
        '<div class="af-kpi"><span>Taux retenu</span><strong>' +
        Fin.formatPct(best.ratePct) +
        '</strong></div>' +
        '<div class="af-kpi muted"><span>Profil taux</span><strong>' +
        esc(best.rateProfile) +
        '</strong></div>' +
        (best.savingsMonthly != null
          ? '<div class="af-kpi highlight"><span>Écart vs mensualité actuelle</span><strong>' +
            (best.savingsMonthly >= 0 ? "−" : "+") +
            Fin.formatEuro(Math.abs(best.savingsMonthly)) +
            "/mois</strong></div>"
          : '<div class="af-kpi highlight"><span>Marge capacité (meilleure agence)</span><strong>' +
            Fin.formatEuro(best.headroom) +
            "</strong></div>");
    }

    var tbody = document.querySelector("#buyerFinanceTable tbody");
    if (!rows.length) {
      tbody.innerHTML = '<tr><td colspan="6" style="color:var(--muted)">Aucune agence</td></tr>';
    } else {
      tbody.innerHTML = rows
        .map(function (row, i) {
          var f = row.finance;
          var bestCls = i === 0 ? " best" : "";
          var win = i === 0 ? '<span class="af-win">plus finançable</span>' : "";
          return (
            '<tr class="' +
            bestCls +
            '">' +
            "<td><strong>" +
            esc(row.agency.name) +
            "</strong>" +
            win +
            "<br><span style='font-size:.78rem;color:var(--muted)'>FAI " +
            Fin.formatEuro(f.project.fai) +
            " · hon. " +
            Fin.formatEuro(f.project.agencyFee) +
            "</span></td>" +
            "<td>" +
            Fin.formatEuro(f.project.totalProject) +
            "<br><span style='font-size:.75rem;color:var(--muted)'>dont notaire " +
            Fin.formatEuro(f.project.notary.amount) +
            "</span></td>" +
            "<td>" +
            Fin.formatEuro(f.loanAmount) +
            "<br><span style='font-size:.75rem;color:var(--muted)'>LTV " +
            Fin.formatPct(f.project.ltv) +
            "</span></td>" +
            "<td><strong>" +
            Fin.formatEuro(f.totalMonthlyHousing) +
            "</strong><br><span style='font-size:.75rem;color:var(--muted)'>crédit " +
            Fin.formatEuro(f.monthlyPayment) +
            " + assur. " +
            Fin.formatEuro(f.insuranceMonthly) +
            "</span></td>" +
            "<td>" +
            Fin.formatPct(f.debtRatio) +
            "</td>" +
            "<td>" +
            statusBadge(f.status) +
            "</td>" +
            "</tr>"
          );
        })
        .join("");
    }

    var hint = document.getElementById("bfHint");
    if (hint && best) {
      hint.textContent = best.messages.join(" · ") + " — indicatif non contractuel.";
    }

    var rules = document.getElementById("bfRules");
    if (rules && best) {
      rules.innerHTML = best.rules
        .map(function (r) {
          return (
            "<li><strong>" +
            esc(r.label) +
            " — " +
            esc(r.value) +
            "</strong><span>" +
            esc(r.detail) +
            "</span></li>"
          );
        })
        .join("");
    }
  }

  function renderAll() {
    renderAgencyList();
    renderAgencyForm();
    renderScheduleTabs();
    renderBrackets();
    renderCalc();
    renderCompare();
    renderBuyerFinance();
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
        "Remplacer le barème Portes Clés par le PDF officiel TG0422 (ventes, bail, locations, avis) ?\nTa part agent (" +
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
    if (sched.feeModel && sched.feeModel !== "brackets") {
      alert("Ce barème TG0422 n'utilise pas de tranches prix (modèle spécial).");
      return;
    }
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

  ["calcPrice", "calcSurface", "calcZone", "calcParty"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", function () {
      if (id === "calcPrice") document.getElementById("cmpPrice").value = el.value;
      if (id === "calcSurface") document.getElementById("cmpSurface").value = el.value;
      if (id === "calcZone") document.getElementById("cmpZone").value = el.value;
      if (id === "calcParty") document.getElementById("cmpParty").value = el.value;
      renderCalc();
      renderCompare();
      renderBuyerFinance();
    });
    el.addEventListener("change", function () {
      renderCalc();
      renderCompare();
      renderBuyerFinance();
    });
  });

  ["cmpPrice", "cmpKind", "cmpSurface", "cmpZone", "cmpParty", "chargesPct", "cfePct", "accountingPct"].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", function () {
      if (id === "cmpPrice") document.getElementById("calcPrice").value = el.value;
      if (id === "cmpSurface") document.getElementById("calcSurface").value = el.value;
      if (id === "cmpZone") document.getElementById("calcZone").value = el.value;
      if (id === "cmpParty") document.getElementById("calcParty").value = el.value;
      if (id === "chargesPct" || id === "cfePct" || id === "accountingPct") {
        document.getElementById("taxPreset").value = "custom";
        persistTaxFromForm();
      }
      renderCompare();
      renderCalc();
      renderBuyerFinance();
    });
    el.addEventListener("change", function () {
      if (id === "chargesPct" || id === "cfePct" || id === "accountingPct") persistTaxFromForm();
      if (id === "cmpKind") syncKindFields();
      renderCompare();
      renderCalc();
      renderBuyerFinance();
    });
  });


  [
    "bfIncome",
    "bfCoIncome",
    "bfExisting",
    "bfDown",
    "bfYears",
    "bfRate",
    "bfDti",
    "bfFeePayer",
    "bfNotary",
    "bfNotaryPct",
    "bfFinanceNotary",
    "bfInsur",
    "bfCurBalance",
    "bfCurMonthly",
    "bfCashOut",
    "bfIncludeProject",
    "bfBridge",
  ].forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", function () {
      syncBuyerExtraFields();
      persistBuyerPrefs();
      renderBuyerFinance();
    });
    el.addEventListener("change", function () {
      syncBuyerExtraFields();
      persistBuyerPrefs();
      renderBuyerFinance();
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
    renderBuyerFinance();
  });

  document.getElementById("btnSyncChargesFromSplit").onclick = function () {
    var u = Number(document.getElementById("calcUrssaf").value) || 0;
    var i = Number(document.getElementById("calcIr").value) || 0;
    document.getElementById("chargesPct").value = Math.round((u + i) * 10) / 10;
    document.getElementById("taxPreset").value = "custom";
    persistTaxFromForm();
    renderCompare();
    renderCalc();
    renderBuyerFinance();
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
    renderBuyerFinance();
  });

  applyBuyerPrefsToForm();
  renderAll();
})();
