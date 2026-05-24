(function () {
  var TOKEN_KEY = "lo_token";
  var contactId = new URLSearchParams(location.search).get("id");
  var treeData = null;
  var dragItem = null;

  function token() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function esc(s) {
    if (s == null) return "";
    var d = document.createElement("div");
    d.textContent = String(s);
    return d.innerHTML;
  }

  function api(path, opts) {
    opts = opts || {};
    return fetch(path, {
      method: opts.method || "GET",
      headers: Object.assign(
        { "Content-Type": "application/json" },
        token() ? { Authorization: "Bearer " + token() } : {}
      ),
      body: opts.body ? JSON.stringify(opts.body) : undefined,
    }).then(function (r) {
      return r.json();
    });
  }

  function setParent(resource, itemId, parentId) {
    return api("/api/crm/set-parent", {
      method: "POST",
      body: { resource: resource, itemId: itemId, parentId: parentId || null },
    });
  }

  function contractOptions(contracts, selected) {
    if (!window.CrmFormHelpers) return "";
    return window.CrmFormHelpers.contractOptions(contracts, selected);
  }

  function parentSelect(resource, itemId, contracts, current) {
    var unlink = current
      ? ' <button type="button" class="btn-unlink" data-resource="' +
        esc(resource) +
        '" data-id="' +
        esc(itemId) +
        '">Delier</button>'
      : "";
    return (
      '<label class="parent-link">Lier au contrat <select data-resource="' +
      esc(resource) +
      '" data-id="' +
      esc(itemId) +
      '">' +
      contractOptions(contracts, current) +
      "</select></label>" +
      unlink
    );
  }

  function node(type, label, itemId, resource, parentHtml, childrenHtml, draggable) {
    var drag = draggable
      ? ' draggable="true" class="draggable" data-resource="' +
        esc(resource) +
        '" data-id="' +
        esc(itemId) +
        '"'
      : "";
    var drop =
      resource === "contracts"
        ? ' data-drop-contract="' + esc(itemId) + '" class="drop-target"'
        : "";
    return (
      "<li" +
      drag +
      drop +
      '><span class="type">' +
      esc(type) +
      "</span> <span class=\"label\">" +
      esc(label) +
      "</span> " +
      (parentHtml || "") +
      (childrenHtml ? "<ul>" + childrenHtml + "</ul>" : "") +
      "</li>"
    );
  }

  function buildTree(data) {
    var html = "";
    (data.contracts || []).forEach(function (ctr) {
      var kids = "";
      (data.vehicles || []).forEach(function (v) {
        if (v.parent_id && v.parent_id !== ctr.id) return;
        var vKids = "";
        (data.claims || []).forEach(function (cl) {
          if (cl.vehicle_id === v.id || (cl.parent_id === ctr.id && !cl.vehicle_id)) {
            if (cl.vehicle_id && cl.vehicle_id !== v.id) return;
            vKids += node(
              "Sinistre",
              (cl.claim_type || "sinistre") + " — " + (cl.status || ""),
              cl.id,
              "claims",
              parentSelect("claims", cl.id, data.contracts, cl.parent_id),
              "",
              true
            );
          }
        });
        (data.insuranceRequests || []).forEach(function (r) {
          if (r.vehicle_id === v.id) {
            vKids += node(
              "Demande",
              (r.request_type || "") + " — " + (r.status || ""),
              r.id,
              "insurance-requests",
              parentSelect("insurance-requests", r.id, data.contracts, r.parent_id),
              "",
              true
            );
          }
        });
        kids += node(
          "Vehicule",
          (v.registration || v.brand + " " + v.model || v.id).trim(),
          v.id,
          "vehicles",
          parentSelect("vehicles", v.id, data.contracts, v.parent_id),
          vKids,
          true
        );
      });
      html += node(
        "Contrat",
        (ctr.insurer || ctr.contract_type) + " — " + (ctr.policy_number || ctr.status),
        ctr.id,
        "contracts",
        "",
        kids,
        false
      );
    });

    (data.vehicles || []).forEach(function (v) {
      var linked = (data.contracts || []).some(function (c) {
        return v.parent_id === c.id;
      });
      if ((data.contracts || []).length && linked) return;
      var orphanKids = "";
      (data.claims || []).forEach(function (cl) {
        if (cl.vehicle_id === v.id) {
          orphanKids += node("Sinistre", cl.claim_type || "sinistre", cl.id, "claims", "", "", true);
        }
      });
      html += node("Vehicule", v.registration || v.id, v.id, "vehicles", "", orphanKids, true);
    });

    (data.drivers || []).forEach(function (d) {
      html += node(
        "Conducteur",
        ((d.first_name || "") + " " + (d.last_name || "")).trim(),
        d.id,
        "drivers",
        "",
        "",
        false
      );
    });

    (data.claims || []).forEach(function (cl) {
      if (!cl.vehicle_id) {
        html += node(
          "Sinistre",
          cl.claim_type || "—",
          cl.id,
          "claims",
          parentSelect("claims", cl.id, data.contracts, cl.parent_id),
          "",
          true
        );
      }
    });

    if (!html) html = "<li>Aucun module — ajoutez-en depuis la fiche contact.</li>";
    return html;
  }

  function bindTreeInteractions() {
    var tree = document.getElementById("moduleTree");
    if (!tree) return;

    tree.querySelectorAll("select[data-resource]").forEach(function (sel) {
      sel.onchange = function () {
        var res = sel.getAttribute("data-resource");
        var id = sel.getAttribute("data-id");
        var pid = sel.value || null;
        setParent(res, id, pid).then(function (r) {
          if (!r.ok) alert(r.error || "Erreur");
          else load();
        });
      };
    });

    tree.querySelectorAll(".btn-unlink").forEach(function (btn) {
      btn.onclick = function () {
        if (!confirm("Delier ce module du contrat parent ?")) return;
        setParent(btn.getAttribute("data-resource"), btn.getAttribute("data-id"), null).then(
          function (r) {
            if (!r.ok) alert(r.error || "Erreur");
            else load();
          }
        );
      };
    });

    tree.querySelectorAll(".draggable").forEach(function (el) {
      el.addEventListener("dragstart", function (ev) {
        dragItem = {
          resource: el.getAttribute("data-resource"),
          id: el.getAttribute("data-id"),
        };
        ev.dataTransfer.effectAllowed = "move";
      });
    });

    tree.querySelectorAll(".drop-target").forEach(function (el) {
      el.addEventListener("dragover", function (ev) {
        ev.preventDefault();
        el.classList.add("drag-over");
      });
      el.addEventListener("dragleave", function () {
        el.classList.remove("drag-over");
      });
      el.addEventListener("drop", function (ev) {
        ev.preventDefault();
        el.classList.remove("drag-over");
        if (!dragItem) return;
        var contractId = el.getAttribute("data-drop-contract");
        if (
          dragItem.resource !== "vehicles" &&
          dragItem.resource !== "claims" &&
          dragItem.resource !== "insurance-requests"
        ) {
          return;
        }
        setParent(dragItem.resource, dragItem.id, contractId).then(function (r) {
          if (!r.ok) alert(r.error || "Erreur");
          else load();
        });
        dragItem = null;
      });
    });
  }

  function load() {
    if (!contactId || !token()) {
      location.href = "./crm.html";
      return;
    }
    document.getElementById("backContact").href =
      "./crm-contact.html?id=" + encodeURIComponent(contactId);
    api("/api/crm/contact?id=" + encodeURIComponent(contactId)).then(function (res) {
      document.getElementById("modLoading").classList.add("hidden");
      if (!res.ok) {
        document.getElementById("modApp").innerHTML =
          "<p>" + esc(res.error || "Erreur") + "</p>";
        return;
      }
      treeData = res;
      var name =
        ((res.contact.first_name || "") + " " + (res.contact.last_name || "")).trim() ||
        res.contact.email;
      document.getElementById("modTitle").textContent = "Modules — " + name;
      var pk = "generic";
      if (window.CrmContactProfiles && res.contact) {
        var meta = {};
        try {
          meta = res.contact.metadata ? JSON.parse(res.contact.metadata) : {};
        } catch (e) {}
        pk = window.CrmContactProfiles.resolve({
          meta: meta,
          leads: res.leads || [],
          vehicles: res.vehicles || [],
          drivers: res.drivers || [],
        });
      }
      if (pk !== "mobilite-vtc" && pk !== "mobilite") {
        document.getElementById("modSubtitle").textContent =
          "Vue hierarchique reservee aux fiches mobilite / VTC. Utilisez la fiche contact pour ce profil.";
        document.getElementById("moduleTree").innerHTML =
          "<li>Cette vue concerne les contrats lies a des vehicules. Pour sante ou habitation, utilisez Contrats et Demandes sur la fiche contact.</li>";
        document.getElementById("modApp").classList.remove("hidden");
        return;
      }
      document.getElementById("modSubtitle").textContent =
        "Glissez un element sur un contrat ou choisissez le parent dans la liste.";
      document.getElementById("moduleTree").innerHTML = buildTree(res);
      bindTreeInteractions();
      document.getElementById("modApp").classList.remove("hidden");
    });
  }

  load();
})();
