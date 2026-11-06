/**
 * Partage d'honoraires immobiliers — cadre légal FR (affichage + convention écrite).
 * Entrant / sortant / apporteur / notaire / avocat — sans inventer de % imposés.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.ImmoFeeShareLegal = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var PARTICIPANT_ROLES = [
    {
      id: "agence",
      label: "Agence / titulaire du mandat",
      desc: "Détient le mandat de vente (sortant).",
    },
    {
      id: "sortant",
      label: "Négociateur sortant",
      desc: "A le mandat vendeur.",
    },
    {
      id: "entrant",
      label: "Négociateur entrant",
      desc: "Amène l'acquéreur.",
    },
    {
      id: "negociateur",
      label: "Négociateur partenaire",
      desc: "Réseau / co-négociation.",
    },
    {
      id: "apporteur",
      label: "Apporteur d'affaires",
      desc: "Rémunération uniquement si convention écrite préalable.",
    },
    {
      id: "notaire",
      label: "Notaire",
      desc: "Émoluments réglementés — hors partage honoraires agence sauf convention distincte.",
    },
    {
      id: "avocat",
      label: "Avocat",
      desc: "Honoraires librement convenus (lettre de mission) — pas de % caché sur le mandat.",
    },
  ];

  var LEGAL_NOTES = [
    "Les honoraires d'agence doivent être affichés et portés au mandat (montant ou % + assiette).",
    "Le partage entrant / sortant entre professionnels suppose une convention écrite (ou usage réseau formalisé).",
    "Un apporteur d'affaires n'est rémunéré que si une convention écrite le prévoit avant l'opération.",
    "Notaire : émoluments selon barème ; ne pas confondre avec la commission d'agence.",
    "Avocat : honoraires selon lettre de mission ; transparence envers le client.",
    "Le consommateur (vendeur / acquéreur) doit pouvoir connaître qui est rémunéré et sur quelle base.",
  ];

  function round2(n) {
    return Math.round((Number(n) || 0) * 100) / 100;
  }

  /**
   * Répartit des honoraires TTC selon une liste d'accords { role, share_pct }.
   * Normalise si la somme des % > 0.
   */
  function allocate(honorairesTtc, agreements) {
    var fee = round2(honorairesTtc);
    var list = Array.isArray(agreements) ? agreements : [];
    var sumPct = 0;
    list.forEach(function (a) {
      sumPct += Math.max(0, Number(a.share_pct) || 0);
    });
    var rows = list.map(function (a) {
      var pct = Math.max(0, Number(a.share_pct) || 0);
      var amount =
        a.share_amount != null && a.share_amount !== ""
          ? round2(a.share_amount)
          : sumPct > 0
            ? round2((fee * pct) / sumPct)
            : 0;
      return {
        id: a.id || null,
        participant_role: a.participant_role || a.role || "",
        label: a.label || "",
        partner_id: a.partner_id || null,
        share_pct: pct,
        share_amount: amount,
        base: a.base || "honoraires_ttc",
        legal_basis: a.legal_basis || "",
        status: a.status || "draft",
      };
    });
    var allocated = rows.reduce(function (s, r) {
      return s + r.share_amount;
    }, 0);
    return {
      honorairesTtc: fee,
      sumPct: round2(sumPct),
      allocated: round2(allocated),
      remainder: round2(fee - allocated),
      rows: rows,
      warnings: buildWarnings(rows, sumPct),
      legalNotes: LEGAL_NOTES.slice(),
    };
  }

  function buildWarnings(rows, sumPct) {
    var w = [];
    if (sumPct > 100.05) {
      w.push("La somme des pourcentages dépasse 100 % — normaliser avant signature.");
    }
    rows.forEach(function (r) {
      if (r.participant_role === "apporteur" && !r.legal_basis) {
        w.push("Apporteur : indiquer la référence de la convention écrite.");
      }
      if (r.participant_role === "notaire" && r.share_pct > 0) {
        w.push("Notaire : vérifier que ce n'est pas un double emploi avec les émoluments.");
      }
      if (r.participant_role === "avocat" && !r.legal_basis) {
        w.push("Avocat : joindre ou référencer la lettre de mission.");
      }
    });
    return w;
  }

  function defaultSortantEntrantSplit(honorairesTtc, sortantPct, entrantPct) {
    return allocate(honorairesTtc, [
      {
        participant_role: "sortant",
        label: "Part sortant (mandat vendeur)",
        share_pct: sortantPct != null ? sortantPct : 50,
        legal_basis: "Convention co-négociation / usage réseau",
      },
      {
        participant_role: "entrant",
        label: "Part entrant (acquéreur amené)",
        share_pct: entrantPct != null ? entrantPct : 50,
        legal_basis: "Convention co-négociation / usage réseau",
      },
    ]);
  }

  return {
    PARTICIPANT_ROLES: PARTICIPANT_ROLES,
    LEGAL_NOTES: LEGAL_NOTES,
    allocate: allocate,
    defaultSortantEntrantSplit: defaultSortantEntrantSplit,
    round2: round2,
  };
});
