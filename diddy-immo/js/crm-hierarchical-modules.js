/**
 * Modules hiérarchiques beta — inspire HierarchicalModuleManager + BaseModuleDragDrop multisite.
 */
window.CrmHierarchicalModules = {
  render: function (mount, tree, options) {
    options = options || {};
    if (!tree || !tree.length) {
      mount.innerHTML = "<p>Aucun module — ouvrez une fiche contact modules.</p>";
      return;
    }
    var self = this;
    mount.innerHTML = '<div class="hm-tree" data-draggable="' + (options.draggable ? "1" : "0") + '"></div>';
    var root = mount.querySelector(".hm-tree");
    tree.forEach(function (n) {
      root.appendChild(self._nodeEl(n, 0, options));
    });
    if (options.draggable) self._bindDrag(root);
  },

  _nodeEl: function (n, depth, options) {
    var wrap = document.createElement("div");
    wrap.className = "hm-node";
    wrap.style.paddingLeft = depth * 18 + "px";
    wrap.dataset.type = n.type || "";
    wrap.dataset.id = n.id || "";
    if (options && options.draggable) wrap.draggable = true;

    var href = this._href(n);
    var head =
      '<div class="hm-head">' +
      (n.children && n.children.length ? '<button type="button" class="hm-toggle" aria-expanded="true">▼</button>' : '<span class="hm-spacer"></span>') +
      "<span>" + (n.icon || "📦") + " <strong>" + esc(n.label || n.type) + "</strong></span> " +
      "<span class='hm-status'>" + esc(n.status || "") + "</span> " +
      (href ? '<a href="' + href + '" class="btn btn-ghost btn-sm">Ouvrir</a>' : "") +
      "</div>";
    wrap.innerHTML = head;

    if (n.children && n.children.length) {
      var ch = document.createElement("div");
      ch.className = "hm-children";
      var self = this;
      n.children.forEach(function (c) {
        ch.appendChild(self._nodeEl(c, depth + 1, options));
      });
      wrap.appendChild(ch);
      var btn = wrap.querySelector(".hm-toggle");
      if (btn) {
        btn.onclick = function () {
          var open = btn.getAttribute("aria-expanded") === "true";
          btn.setAttribute("aria-expanded", open ? "false" : "true");
          btn.textContent = open ? "▶" : "▼";
          ch.style.display = open ? "none" : "block";
        };
      }
    }

    return wrap;
  },

  _href: function (n) {
    if (!n.id) return "";
    if (n.type === "contract") return "./crm-contract-detail.html?id=" + encodeURIComponent(n.id);
    if (n.type === "vehicle") return "./crm-vehicle-detail.html?id=" + encodeURIComponent(n.id);
    if (n.type === "claim") return "./crm-claim-detail.html?id=" + encodeURIComponent(n.id);
    return "";
  },

  _bindDrag: function (root) {
    var drag;
    var self = this;
    root.querySelectorAll(".hm-node[draggable]").forEach(function (el) {
      el.addEventListener("dragstart", function () {
        drag = el;
        el.classList.add("hm-dragging");
      });
      el.addEventListener("dragend", function () {
        el.classList.remove("hm-dragging");
      });
      el.addEventListener("dragover", function (e) {
        e.preventDefault();
      });
      el.addEventListener("drop", function (e) {
        e.preventDefault();
        if (!drag || drag === el) return;
        var parentMod = {
          id: el.dataset.id,
          type: el.dataset.type,
          label: el.querySelector("strong") ? el.querySelector("strong").textContent : el.dataset.type,
          icon: "📦",
          status: "",
        };
        var childMod = {
          id: drag.dataset.id,
          type: drag.dataset.type,
          label: drag.querySelector("strong") ? drag.querySelector("strong").textContent : drag.dataset.type,
          icon: "📦",
          status: "",
        };
        if (window.CrmModuleRelationshipValidator) {
          window.CrmModuleRelationshipValidator.confirm(parentMod, childMod, function () {
            if (el.parentNode === drag.parentNode) {
              el.parentNode.insertBefore(drag, el);
            }
            if (window.CrmModuleEventBus) {
              window.CrmModuleEventBus.emit("reorder", { parentId: parentMod.id, childId: childMod.id });
            }
          });
        } else if (el.parentNode === drag.parentNode) {
          el.parentNode.insertBefore(drag, el);
        }
      });
    });
  },

  buildTreeFromContact: function (data) {
    var contracts = (data.contracts || []).map(function (c) {
      return {
        id: c.id,
        type: "contract",
        label: c.policy_number || c.contract_type || "Contrat",
        icon: "📄",
        status: c.status,
        children: [],
      };
    });
    (data.vehicles || []).forEach(function (v) {
      var parent = contracts.find(function (c) { return c.id === v.parent_contract_id; }) || contracts[0];
      var node = { id: v.id, type: "vehicle", label: v.registration || "Véhicule", icon: "🚗", status: v.status, children: [] };
      if (parent) parent.children.push(node);
      else contracts.push(node);
    });
    (data.claims || []).forEach(function (cl) {
      var parent = contracts.find(function (c) { return c.id === cl.parent_contract_id; }) || contracts[0];
      var node = { id: cl.id, type: "claim", label: cl.claim_type || "Sinistre", icon: "⚠️", status: cl.status, children: [] };
      if (parent) parent.children.push(node);
    });
    (data.drivers || []).forEach(function (d) {
      var parent = contracts[0];
      var node = { id: d.id, type: "driver", label: ((d.first_name || "") + " " + (d.last_name || "")).trim() || "Conducteur", icon: "👤", status: d.status, children: [] };
      if (parent) parent.children.push(node);
    });
    return contracts.length ? contracts : [{ type: "empty", label: "Aucun contrat", icon: "—", children: [] }];
  },
};

function esc(s) {
  var d = document.createElement("div");
  d.textContent = s == null ? "" : s;
  return d.innerHTML;
}
