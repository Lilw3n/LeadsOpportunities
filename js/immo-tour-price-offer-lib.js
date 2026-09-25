/**
 * Offre de prix visiteurs — validation partagée (visite virtuelle / fiche bien).
 * Compare le montant saisi au prix affiché et génère des avertissements.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.ImmoTourPriceOffer = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var LOW_RATIO = 0.7;
  var HIGH_RATIO = 1.25;
  var VERY_LOW_RATIO = 0.5;

  function parseAmount(v) {
    if (v == null || v === "") return null;
    var s = String(v)
      .replace(/\s/g, "")
      .replace(/€/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
    var n = Number(s);
    return isFinite(n) && n > 0 ? Math.round(n) : null;
  }

  function formatPrice(n) {
    if (n == null || !isFinite(n)) return "";
    try {
      return Math.round(n).toLocaleString("fr-FR") + " €";
    } catch (e) {
      return Math.round(n) + " €";
    }
  }

  function clampText(s, max) {
    return String(s == null ? "" : s).trim().slice(0, max || 800);
  }

  /**
   * @returns {{ok:boolean, amount?:number, comment_plus?:string, comment_moins?:string, error?:string}}
   */
  function normalizePayload(raw) {
    raw = raw || {};
    var amount = parseAmount(raw.amount != null ? raw.amount : raw.price_offer || raw.offre);
    if (amount == null) {
      return { ok: false, error: "Indiquez un montant en euros." };
    }
    if (amount < 1000) {
      return { ok: false, error: "Montant trop bas pour être crédible (minimum 1 000 €)." };
    }
    if (amount > 50000000) {
      return { ok: false, error: "Montant irréaliste." };
    }
    return {
      ok: true,
      amount: amount,
      comment_plus: clampText(raw.comment_plus || raw.plus || "", 600),
      comment_moins: clampText(raw.comment_moins || raw.moins || "", 600),
      first_name: clampText(raw.first_name || "", 80),
      email: clampText(raw.email || "", 160).toLowerCase(),
      phone: clampText(raw.phone || "", 40),
    };
  }

  /**
   * Compare offre vs prix affiché / correct.
   * @returns {{ratio:number|null, level:string, warn:string, label:string}}
   */
  function assessOffer(amount, askingPrice) {
    var ask = parseAmount(askingPrice);
    var off = parseAmount(amount);
    if (off == null) {
      return { ratio: null, level: "none", warn: "", label: "" };
    }
    if (ask == null || ask <= 0) {
      return {
        ratio: null,
        level: "info",
        warn: "Indiquez un montant réaliste par rapport au marché local. Cet avis est indicatif.",
        label: "Prix de référence non affiché",
      };
    }
    var ratio = off / ask;
    if (ratio < VERY_LOW_RATIO) {
      return {
        ratio: ratio,
        level: "critical",
        warn:
          "Votre proposition (" +
          formatPrice(off) +
          ") est très en dessous du prix affiché (" +
          formatPrice(ask) +
          "). Les offres trop basses sont rarement retenues — restez réaliste.",
        label: "Très en dessous",
      };
    }
    if (ratio < LOW_RATIO) {
      return {
        ratio: ratio,
        level: "warn",
        warn:
          "En dessous du prix affiché (" +
          formatPrice(ask) +
          "). Vous pouvez soumettre, mais le vendeur privilégie souvent les offres proches du prix correct.",
        label: "En dessous",
      };
    }
    if (ratio > HIGH_RATIO) {
      return {
        ratio: ratio,
        level: "info",
        warn:
          "Au-dessus du prix affiché (" +
          formatPrice(ask) +
          "). Vérifiez que le montant est bien celui que vous êtes prêt(e) à engager.",
        label: "Au-dessus",
      };
    }
    return {
      ratio: ratio,
      level: "ok",
      warn: "Votre estimation est dans une fourchette cohérente avec le prix affiché (" + formatPrice(ask) + ").",
      label: "Cohérent",
    };
  }

  function visitorKey() {
    try {
      var k = localStorage.getItem("lo_visitor_id");
      if (k && String(k).length >= 8) return String(k).slice(0, 120);
      k =
        "v_" +
        Date.now().toString(36) +
        "_" +
        Math.random().toString(36).slice(2, 10);
      localStorage.setItem("lo_visitor_id", k);
      return k;
    } catch (e) {
      return "";
    }
  }

  return {
    LOW_RATIO: LOW_RATIO,
    HIGH_RATIO: HIGH_RATIO,
    VERY_LOW_RATIO: VERY_LOW_RATIO,
    parseAmount: parseAmount,
    formatPrice: formatPrice,
    normalizePayload: normalizePayload,
    assessOffer: assessOffer,
    visitorKey: visitorKey,
    clampText: clampText,
  };
});
