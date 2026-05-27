/**
 * Sandbox modules — réordonnancement local pour tests.
 */
window.CrmModulesSandbox = {
  MODULES: [
    { id: "m1", type: "contract", label: "Contrat auto", icon: "📄" },
    { id: "m2", type: "vehicle", label: "Véhicule AB-123-CD", icon: "🚗" },
    { id: "m3", type: "driver", label: "Conducteur principal", icon: "👤" },
    { id: "m4", type: "claim", label: "Sinistre 2024", icon: "⚠️" },
    { id: "m5", type: "quote", label: "Devis VTC", icon: "📋" },
  ],

  render: function (mount) {
    var order = this.MODULES.slice();
    var dragIdx = null;
    var linkType = localStorage.getItem("lo_modules_sandbox_link_type") || "association";

    function paint() {
      mount.innerHTML =
        '<p class="crm-muted-inline" style="margin-bottom:12px">Glissez pour réordonner les modules de démonstration (stockage local).</p>' +
        '<label style="display:block;margin-bottom:12px;font-size:.9rem">Type de lien (démo locale)<select id="sandboxLinkType">' +
        '<option value="association"' +
        (linkType === "association" ? " selected" : "") +
        ">Association</option>" +
        '<option value="hierarchy"' +
        (linkType === "hierarchy" ? " selected" : "") +
        ">Hiérarchie parent → enfant</option>" +
        '<option value="dependency"' +
        (linkType === "dependency" ? " selected" : "") +
        ">Dépendance technique</option>" +
        "</select></label>" +
        '<div id="sandboxList">' +
        order
          .map(function (m, i) {
            return (
              '<div class="sandbox-item panel" draggable="true" data-idx="' +
              i +
              '" style="padding:14px;margin-bottom:8px;cursor:grab;display:flex;align-items:center;gap:12px">' +
              '<span style="font-size:1.5rem">' +
              m.icon +
              "</span><div><strong>" +
              m.label +
              '</strong><div style="font-size:.8rem;color:var(--muted)">' +
              m.type +
              "</div></div></div>"
            );
          })
          .join("") +
        '</div><p style="margin-top:12px"><button type="button" class="btn btn-primary" id="btnSaveOrder">Enregistrer ordre + type (local)</button></p>';

      var sel = document.getElementById("sandboxLinkType");
      if (sel) {
        sel.onchange = function () {
          linkType = sel.value;
        };
      }

      mount.querySelectorAll(".sandbox-item").forEach(function (el) {
        el.addEventListener("dragstart", function (e) {
          dragIdx = parseInt(el.getAttribute("data-idx"), 10);
          e.dataTransfer.effectAllowed = "move";
        });
        el.addEventListener("dragover", function (e) {
          e.preventDefault();
        });
        el.addEventListener("drop", function (e) {
          e.preventDefault();
          var targetIdx = parseInt(el.getAttribute("data-idx"), 10);
          if (dragIdx === null || dragIdx === targetIdx) return;
          var item = order.splice(dragIdx, 1)[0];
          order.splice(targetIdx, 0, item);
          dragIdx = null;
          paint();
        });
      });
      document.getElementById("btnSaveOrder").onclick = function () {
        localStorage.setItem("lo_modules_sandbox_order", JSON.stringify(order.map(function (m) { return m.id; })));
        localStorage.setItem("lo_modules_sandbox_link_type", linkType);
        alert("Ordre et type de lien enregistrés localement");
      };
    }
    try {
      var saved = JSON.parse(localStorage.getItem("lo_modules_sandbox_order") || "null");
      if (saved && Array.isArray(saved)) {
        order.sort(function (a, b) {
          return saved.indexOf(a.id) - saved.indexOf(b.id);
        });
      }
    } catch (e) {}
    paint();
  },
};
