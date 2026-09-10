(function () {
  "use strict";

  var Lib = window.ReviewsOfficial;
  var KEY = Lib ? Lib.STORAGE_KEY : "lo_reviews_official_v1";

  function $(id) {
    return document.getElementById(id);
  }

  function setMsg(msg, isErr) {
    var el = $("formMsg");
    if (!el) return;
    el.textContent = msg || "";
    el.style.color = isErr ? "#b91c1c" : "";
  }

  function val(id) {
    var el = $(id);
    return el ? String(el.value || "").trim() : "";
  }

  function checked(id) {
    var el = $(id);
    return !!(el && el.checked);
  }

  function readForm() {
    return {
      version: 1,
      enabled: checked("enabled"),
      primaryProvider: "trustpilot",
      trustpilot: {
        businessUnitId: val("tpBusinessUnitId"),
        templateId: val("tpTemplateId") || "54ad5defc6454f11c34ba34d",
        microTemplateId: "5419b6ffb0d04a09e42d81af",
        locale: "fr-FR",
        profileUrl: val("tpProfileUrl"),
        inviteUrl: val("tpInviteUrl"),
        stars: "4,5",
        theme: "light",
        score: val("tpScore"),
        reviewCount: val("tpCount"),
        verified: checked("tpVerified"),
      },
      google: {
        enabled: checked("gEnabled"),
        placeId: val("gPlaceId"),
        mapsUrl: "https://www.google.com/maps",
        reviewUrl: val("gReviewUrl"),
        score: val("gScore"),
        reviewCount: val("gCount"),
        verified: checked("gVerified"),
      },
      display: {
        showTrustBox: true,
        showScoreStrip: true,
        showGoogleBadge: true,
        keepHumanQuotes: true,
      },
      invite: {
        smsTemplate: $("smsTemplate") ? $("smsTemplate").value : "",
        emailSubject: val("emailSubject"),
        emailBody: $("emailBody") ? $("emailBody").value : "",
      },
    };
  }

  function fillForm(cfg) {
    var c = Lib.normalize(cfg);
    if ($("enabled")) $("enabled").checked = c.enabled !== false;
    if ($("tpBusinessUnitId")) $("tpBusinessUnitId").value = c.trustpilot.businessUnitId || "";
    if ($("tpTemplateId")) $("tpTemplateId").value = c.trustpilot.templateId || "54ad5defc6454f11c34ba34d";
    if ($("tpProfileUrl")) $("tpProfileUrl").value = c.trustpilot.profileUrl || "";
    if ($("tpInviteUrl")) $("tpInviteUrl").value = c.trustpilot.inviteUrl || "";
    if ($("tpScore")) $("tpScore").value = c.trustpilot.score == null ? "" : String(c.trustpilot.score);
    if ($("tpCount")) $("tpCount").value = c.trustpilot.reviewCount == null ? "" : String(c.trustpilot.reviewCount);
    if ($("tpVerified")) $("tpVerified").checked = !!c.trustpilot.verified;
    if ($("gReviewUrl")) $("gReviewUrl").value = c.google.reviewUrl || "";
    if ($("gPlaceId")) $("gPlaceId").value = c.google.placeId || "";
    if ($("gScore")) $("gScore").value = c.google.score == null ? "" : String(c.google.score);
    if ($("gCount")) $("gCount").value = c.google.reviewCount == null ? "" : String(c.google.reviewCount);
    if ($("gVerified")) $("gVerified").checked = !!c.google.verified;
    if ($("gEnabled")) $("gEnabled").checked = c.google.enabled !== false;
    if ($("smsTemplate")) $("smsTemplate").value = c.invite.smsTemplate || "";
    if ($("emailSubject")) $("emailSubject").value = c.invite.emailSubject || "";
    if ($("emailBody")) $("emailBody").value = c.invite.emailBody || "";
    refreshPreview();
  }

  function refreshPreview() {
    var box = $("invitePreview");
    if (!box || !Lib) return;
    var cfg = Lib.normalize(readForm());
    var sms = Lib.fillInvite(cfg.invite.smsTemplate, cfg);
    var subject = Lib.fillInvite(cfg.invite.emailSubject, cfg);
    var body = Lib.fillInvite(cfg.invite.emailBody, cfg);
    box.textContent =
      "SMS\n" +
      sms +
      "\n\nE-mail\nObjet : " +
      subject +
      "\n\n" +
      body +
      (cfg.trustpilot.verified && cfg.trustpilot.score != null
        ? "\n\n— Score Trustpilot vérifié : " + cfg.trustpilot.score + "/5 (" + cfg.trustpilot.reviewCount + " avis)"
        : "\n\n— Aucune note publique tant que « Note vérifiée » n’est pas cochée.");
  }

  function copyText(text, okMsg) {
    if (!text) {
      setMsg("Rien à copier.", true);
      return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        setMsg(okMsg || "Copié.");
      }).catch(function () {
        setMsg(text);
      });
    } else {
      setMsg(text);
    }
  }

  function downloadJson(cfg) {
    var blob = new Blob([JSON.stringify(cfg, null, 2) + "\n"], { type: "application/json" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "reviews-official.json";
    a.click();
    URL.revokeObjectURL(a.href);
    setMsg("JSON téléchargé — déposez-le dans data/reviews-official.json puis commit / merge.");
  }

  function persist(cfg) {
    var n = Lib.saveLocal(cfg);
    setMsg("Enregistré localement (navigateur). Exportez le JSON pour la prod.");
    return n;
  }

  function bind() {
    var form = $("roForm");
    if (form) {
      form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        persist(readForm());
        refreshPreview();
      });
      form.addEventListener("input", refreshPreview);
      form.addEventListener("change", refreshPreview);
    }
    var saveBtn = $("btnSave");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        persist(readForm());
        refreshPreview();
      });
    }
    var exportBtn = $("btnExport");
    if (exportBtn) {
      exportBtn.addEventListener("click", function () {
        var n = persist(readForm());
        downloadJson(n);
      });
    }
    var reloadBtn = $("btnReload");
    if (reloadBtn) {
      reloadBtn.addEventListener("click", function () {
        Lib.clearLocal();
        Lib.fetchConfig({ preferLocal: false }).then(function (cfg) {
          fillForm(cfg);
          setMsg("Fichier data/reviews-official.json rechargé.");
        });
      });
    }
    var resetBtn = $("btnReset");
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        Lib.clearLocal();
        location.reload();
      });
    }
    var smsBtn = $("btnCopySms");
    if (smsBtn) {
      smsBtn.addEventListener("click", function () {
        var cfg = Lib.normalize(readForm());
        copyText(Lib.fillInvite(cfg.invite.smsTemplate, cfg), "SMS copié.");
      });
    }
    var mailBtn = $("btnCopyEmail");
    if (mailBtn) {
      mailBtn.addEventListener("click", function () {
        var cfg = Lib.normalize(readForm());
        var subject = Lib.fillInvite(cfg.invite.emailSubject, cfg);
        var body = Lib.fillInvite(cfg.invite.emailBody, cfg);
        copyText("Objet : " + subject + "\n\n" + body, "E-mail copié.");
      });
    }
  }

  function boot() {
    if (!Lib) {
      setMsg("Lib avis manquante.", true);
      return;
    }
    bind();
    Lib.fetchConfig({ preferLocal: true, dataUrl: Lib.DATA_URL }).then(function (cfg) {
      fillForm(cfg);
      var local = Lib.loadLocal();
      setMsg(local ? "Config locale chargée (aperçu)." : "Config fichier chargée.");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
