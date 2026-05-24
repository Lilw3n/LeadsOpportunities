/**
 * Validation relation parent/enfant — inspire ModuleRelationshipValidator.tsx multisite.
 */
window.CrmModuleRelationshipValidator = {
  _state: null,

  allowedPairs: [
    ["contract", "vehicle"],
    ["contract", "claim"],
    ["contract", "driver"],
    ["vehicle", "claim"],
  ],

  isAllowed: function (parentType, childType) {
    return this.allowedPairs.some(function (p) {
      return p[0] === parentType && p[1] === childType;
    });
  },

  confirm: function (parent, child, onConfirm, onCancel) {
    var self = this;
    if (!parent || !child) return;
    if (!this.isAllowed(parent.type, child.type)) {
      alert(
        "Relation non autorisée : un " +
          (parent.type || "?") +
          " ne peut pas être parent d'un " +
          (child.type || "?") +
          "."
      );
      if (onCancel) onCancel();
      return;
    }

    var overlay = document.createElement("div");
    overlay.className = "mrv-overlay";
    overlay.innerHTML =
      '<div class="mrv-modal panel">' +
      '<h3>🔗 Validation relation parent-enfant</h3>' +
      '<p class="mrv-sub">Confirmer la liaison hiérarchique entre modules (multisite).</p>' +
      '<div class="mrv-flow">' +
      '<div class="mrv-box"><span>Parent</span><strong>' +
      (parent.icon || "📦") +
      " " +
      esc(parent.label || parent.type) +
      '</strong><em>' +
      esc(parent.status || "") +
      "</em></div>" +
      '<span class="mrv-arrow">→</span>' +
      '<div class="mrv-box"><span>Enfant</span><strong>' +
      (child.icon || "📦") +
      " " +
      esc(child.label || child.type) +
      '</strong><em>' +
      esc(child.status || "") +
      "</em></div>" +
      "</div>" +
      '<p class="mrv-hint">L\'enfant suivra le parent lors des déplacements dans l\'arbre beta.</p>' +
      '<div class="mrv-actions">' +
      '<button type="button" class="btn btn-ghost" data-act="cancel">Annuler</button>' +
      '<button type="button" class="btn btn-primary" data-act="ok">Confirmer</button>' +
      "</div></div>";

    document.body.appendChild(overlay);
    overlay.querySelector('[data-act="cancel"]').onclick = function () {
      overlay.remove();
      if (onCancel) onCancel();
    };
    overlay.querySelector('[data-act="ok"]').onclick = function () {
      overlay.remove();
      if (onConfirm) onConfirm(parent.id, child.id);
      if (window.CrmModuleEventBus) {
        window.CrmModuleEventBus.emit("link", { parentId: parent.id, childId: child.id });
      }
    };
    overlay.onclick = function (e) {
      if (e.target === overlay) {
        overlay.remove();
        if (onCancel) onCancel();
      }
    };
  },
};

function esc(s) {
  var d = document.createElement("div");
  d.textContent = s == null ? "" : s;
  return d.innerHTML;
}
