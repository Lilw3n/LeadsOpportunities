/**
 * Compression images pour dépôt immo (vitrine + Drive).
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ImmoPhotoCompress = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var DEFAULT_MAX_DIM = 1200;
  var DEFAULT_MAX_DATA = 240000;

  function compressFile(file, opts) {
    opts = opts || {};
    var maxDim = opts.maxDim || DEFAULT_MAX_DIM;
    var maxData = opts.maxData || DEFAULT_MAX_DATA;
    return new Promise(function (resolve) {
      if (!file || !file.type || file.type.indexOf("image/") !== 0) {
        resolve(null);
        return;
      }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth || 1;
        var h = img.naturalHeight || 1;
        var scale = Math.min(1, maxDim / Math.max(w, h));
        var cw = Math.max(1, Math.round(w * scale));
        var ch = Math.max(1, Math.round(h * scale));
        var canvas = document.createElement("canvas");
        canvas.width = cw;
        canvas.height = ch;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, cw, ch);
        var q = 0.72;
        var data = canvas.toDataURL("image/jpeg", q);
        while (data.length > maxData && q > 0.38) {
          q -= 0.08;
          data = canvas.toDataURL("image/jpeg", q);
        }
        URL.revokeObjectURL(url);
        resolve(data.length <= 280000 ? data : null);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      img.src = url;
    });
  }

  function compressMany(files, opts) {
    var list = Array.prototype.slice.call(files || []);
    return Promise.all(list.map(function (f) {
      return compressFile(f, opts);
    }));
  }

  return {
    compressFile: compressFile,
    compressMany: compressMany,
    MAX_DIM: DEFAULT_MAX_DIM,
  };
});
