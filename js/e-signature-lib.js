/**
 * Signature électronique gratuite (canvas + PDF navigateur).
 * Pas d'abonnement SaaS — preuve locale : image, horodatage, IP, consentement.
 */
(function (root) {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function uid(prefix) {
    return (
      (prefix || "sig") +
      "_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2, 8)
    );
  }

  function todayFr() {
    try {
      return new Date().toLocaleString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return new Date().toISOString();
    }
  }

  /** Attache un pad de signature sur un canvas */
  function attachPad(canvas, opts) {
    opts = opts || {};
    if (!canvas || !canvas.getContext) return null;
    var ctx = canvas.getContext("2d");
    var drawing = false;
    var last = null;
    var ratio = Math.max(window.devicePixelRatio || 1, 1);

    function resize() {
      var w = canvas.clientWidth || opts.width || 480;
      var h = canvas.clientHeight || opts.height || 180;
      canvas.width = Math.floor(w * ratio);
      canvas.height = Math.floor(h * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      ctx.lineWidth = opts.lineWidth || 2.2;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = opts.color || "#0f172a";
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, w, h);
    }

    function pos(e) {
      var r = canvas.getBoundingClientRect();
      var t = e.touches && e.touches[0] ? e.touches[0] : e;
      return { x: t.clientX - r.left, y: t.clientY - r.top };
    }

    function start(e) {
      e.preventDefault();
      drawing = true;
      last = pos(e);
    }
    function move(e) {
      if (!drawing) return;
      e.preventDefault();
      var p = pos(e);
      ctx.beginPath();
      ctx.moveTo(last.x, last.y);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      last = p;
    }
    function end(e) {
      if (e) e.preventDefault();
      drawing = false;
      last = null;
    }

    resize();
    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseup", end);
    canvas.addEventListener("mouseleave", end);
    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end);

    return {
      clear: function () {
        resize();
      },
      isEmpty: function () {
        var blank = document.createElement("canvas");
        blank.width = canvas.width;
        blank.height = canvas.height;
        return canvas.toDataURL() === blank.toDataURL();
      },
      toDataURL: function (type, quality) {
        return canvas.toDataURL(type || "image/png", quality || 0.92);
      },
      destroy: function () {
        canvas.removeEventListener("mousedown", start);
        canvas.removeEventListener("mousemove", move);
        canvas.removeEventListener("mouseup", end);
        canvas.removeEventListener("mouseleave", end);
        canvas.removeEventListener("touchstart", start);
        canvas.removeEventListener("touchmove", move);
        canvas.removeEventListener("touchend", end);
      },
    };
  }

  function buildSignedHtml(doc) {
    doc = doc || {};
    var sigImg = doc.signatureDataUrl
      ? '<img class="esig-img" src="' + esc(doc.signatureDataUrl) + '" alt="Signature" />'
      : '<p class="esig-muted">(signature manquante)</p>';
    return (
      '<!doctype html><html lang="fr"><head><meta charset="utf-8"/>' +
      "<title>" +
      esc(doc.title || "Document signé") +
      "</title>" +
      "<style>" +
      "body{font-family:Georgia,'Times New Roman',serif;color:#0f172a;margin:0;padding:28px;line-height:1.5}" +
      ".brand{color:#0d9488;font-weight:700;font-size:1.05rem;margin-bottom:4px}" +
      ".meta{color:#64748b;font-size:.88rem;margin-bottom:22px}" +
      "h1{font-size:1.35rem;margin:0 0 16px}" +
      ".body{white-space:pre-wrap;font-size:1rem;margin:18px 0 28px}" +
      ".sig-box{border:1px solid #cbd5e1;border-radius:10px;padding:14px;max-width:420px}" +
      ".esig-img{max-width:100%;height:auto;display:block}" +
      ".esig-muted{color:#94a3b8}" +
      ".proof{margin-top:18px;font-size:.82rem;color:#475569;border-top:1px solid #e2e8f0;padding-top:12px}" +
      "@media print{body{padding:12px}}" +
      "</style></head><body>" +
      '<div class="brand">Leads Opportunities</div>' +
      '<div class="meta">Courtier — ORIAS 15005935 · contact@leadsopportunities.fr</div>' +
      "<h1>" +
      esc(doc.title || "Document à signer") +
      "</h1>" +
      '<div class="body">' +
      esc(doc.body || "") +
      "</div>" +
      '<div class="sig-box"><strong>Signature</strong><br/>' +
      esc(doc.signerName || "") +
      (doc.signerEmail ? " · " + esc(doc.signerEmail) : "") +
      "<br/>" +
      sigImg +
      "</div>" +
      '<div class="proof">' +
      "<div>Signé le : " +
      esc(doc.signedAtLabel || todayFr()) +
      "</div>" +
      (doc.ip ? "<div>IP : " + esc(doc.ip) + "</div>" : "") +
      (doc.userAgent ? "<div>Appareil : " + esc(String(doc.userAgent).slice(0, 120)) + "</div>" : "") +
      "<div>Réf. : " +
      esc(doc.id || "") +
      "</div>" +
      "<div style=\"margin-top:8px\">Signature électronique simple (SES) — consentement exprès du signataire. " +
      "Pour une signature qualifiée eIDAS (valeur légale maximale), utiliser un prestataire de confiance (Yousign, DocuSign…).</div>" +
      "</div></body></html>"
    );
  }

  function openPrintWindow(html) {
    var w = window.open("", "_blank", "noopener,noreferrer,width=820,height=900");
    if (!w) return false;
    w.document.open();
    w.document.write(html);
    w.document.close();
    setTimeout(function () {
      try {
        w.focus();
        w.print();
      } catch (e) {}
    }, 350);
    return true;
  }

  var api = {
    uid: uid,
    esc: esc,
    todayFr: todayFr,
    attachPad: attachPad,
    buildSignedHtml: buildSignedHtml,
    openPrintWindow: openPrintWindow,
    printSignedDocument: function (doc) {
      return openPrintWindow(buildSignedHtml(doc));
    },
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  } else {
    root.ESignature = api;
  }
})(typeof window !== "undefined" ? window : globalThis);
