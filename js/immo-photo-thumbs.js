/**
 * Miniatures photos immo — ordre (glisser / flèches) + plafond 40.
 */
(function (global) {
  var MAX = 40;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function moveItem(arr, from, to) {
    if (!arr || !arr.length) return arr;
    from = Number(from);
    to = Number(to);
    if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
    var next = arr.slice();
    var item = next.splice(from, 1)[0];
    next.splice(to, 0, item);
    return next;
  }

  function thumbHtml(item, i, total, opts) {
    opts = opts || {};
    var isCapture = item && item.kind === "capture";
    var isCover = !isCapture && i === 0 && opts.cover !== false;
    var label = isCapture ? "Capture" : isCover ? "1re" : String(i + 1);
    var removeAttr = isCapture
      ? 'data-photo-remove-capture="1"'
      : 'data-photo-remove="' + i + '"';
    var move =
      isCapture || total < 2
        ? ""
        : '<span class="listing-thumb-order">' +
          '<button type="button" class="listing-thumb-move" data-photo-move="-1" data-photo-index="' +
          i +
          '" aria-label="Déplacer avant" ' +
          (i === 0 ? "disabled" : "") +
          ">‹</button>" +
          '<button type="button" class="listing-thumb-move" data-photo-move="1" data-photo-index="' +
          i +
          '" aria-label="Déplacer après" ' +
          (i >= total - 1 ? "disabled" : "") +
          ">›</button>" +
          "</span>";
    return (
      '<div class="listing-thumb' +
      (isCover ? " is-cover" : "") +
      '" draggable="' +
      (isCapture ? "false" : "true") +
      '" data-photo-index="' +
      i +
      '"' +
      (isCapture ? ' data-photo-capture="1"' : "") +
      ">" +
      '<img src="' +
      esc(item.url) +
      '" alt="' +
      esc(label) +
      '" draggable="false" />' +
      "<span>" +
      esc(label) +
      "</span>" +
      move +
      '<button type="button" class="listing-thumb-remove" ' +
      removeAttr +
      ' aria-label="Retirer">×</button>' +
      "</div>"
    );
  }

  function bind(mount, handlers) {
    if (!mount || mount.dataset.photoThumbsBound) return;
    mount.dataset.photoThumbsBound = "1";
    handlers = handlers || {};
    var dragFrom = -1;

    mount.addEventListener("click", function (e) {
      var mv = e.target.closest("[data-photo-move]");
      if (mv && mount.contains(mv) && !mv.disabled) {
        e.preventDefault();
        var from = Number(mv.getAttribute("data-photo-index"));
        var delta = Number(mv.getAttribute("data-photo-move"));
        if (handlers.onMove) handlers.onMove(from, from + delta);
        return;
      }
      var cap = e.target.closest("[data-photo-remove-capture]");
      if (cap && mount.contains(cap)) {
        e.preventDefault();
        if (handlers.onRemoveCapture) handlers.onRemoveCapture();
        return;
      }
      var rm = e.target.closest("[data-photo-remove]");
      if (rm && mount.contains(rm)) {
        e.preventDefault();
        if (handlers.onRemove) handlers.onRemove(Number(rm.getAttribute("data-photo-remove")));
      }
    });

    mount.addEventListener("dragstart", function (e) {
      var thumb = e.target.closest(".listing-thumb");
      if (!thumb || !mount.contains(thumb) || thumb.getAttribute("data-photo-capture")) {
        e.preventDefault();
        return;
      }
      dragFrom = Number(thumb.getAttribute("data-photo-index"));
      e.dataTransfer.effectAllowed = "move";
      try {
        e.dataTransfer.setData("text/plain", String(dragFrom));
      } catch (err) {}
      thumb.classList.add("is-dragging");
    });
    mount.addEventListener("dragend", function (e) {
      var thumb = e.target.closest(".listing-thumb");
      if (thumb) thumb.classList.remove("is-dragging");
      dragFrom = -1;
    });
    mount.addEventListener("dragover", function (e) {
      var thumb = e.target.closest(".listing-thumb");
      if (!thumb || thumb.getAttribute("data-photo-capture")) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });
    mount.addEventListener("drop", function (e) {
      var thumb = e.target.closest(".listing-thumb");
      if (!thumb || !mount.contains(thumb) || thumb.getAttribute("data-photo-capture")) return;
      e.preventDefault();
      var to = Number(thumb.getAttribute("data-photo-index"));
      var from = dragFrom;
      if (from < 0) {
        try {
          from = Number(e.dataTransfer.getData("text/plain"));
        } catch (err) {
          from = -1;
        }
      }
      if (handlers.onMove) handlers.onMove(from, to);
    });
  }

  var api = {
    MAX: MAX,
    moveItem: moveItem,
    thumbHtml: thumbHtml,
    bind: bind,
  };
  global.ImmoPhotoThumbs = api;
  if (typeof module === "object" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : this);
