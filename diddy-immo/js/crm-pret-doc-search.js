/**
 * Moteur de recherche ultra-intelligent Prêt Immo
 * — croise grilles de taux + fiches produits
 * — parse profil / intention / région / partenaire
 */
window.CrmPretDocSearch = (function () {
  var catalogs = { grilles: null, fiches: null };

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function tokens(s) {
    return norm(s)
      .split(/\s+/)
      .filter(function (t) {
        return t.length > 1 && STOP.indexOf(t) < 0;
      });
  }

  var STOP = "de du des le la les un une et ou a au aux en pour avec sans sur par plus ans est il elle je on qui que quoi comment voir".split(" ");

  /** Axes projet IMMO ↔ besoins documentation */
  var PROJECT_AXES = [
    { id: "pret_immo", label: "Prêt immo", need: ["immo"], rubrique: "immo", q: "prêt immobilier acquisition" },
    { id: "ptz", label: "PTZ", need: ["ptz", "immo"], profile: ["primo"], rubrique: "immo", q: "prêt à taux zéro PTZ primo-accession" },
    { id: "pret_relais", label: "Prêt relais", need: ["relais", "immo"], rubrique: "immo", q: "prêt relais achat vente" },
    { id: "pret_conso", label: "Prêt conso", need: ["conso", "treso"], rubrique: "conso", q: "prêt consommation trésorerie" },
    { id: "travaux", label: "Travaux", need: ["renov"], rubrique: "immo", q: "travaux rénovation crédit" },
    { id: "rac", label: "RAC", need: ["rac"], rubrique: "rac", q: "regroupement de crédits RAC" },
    { id: "scpi", label: "SCPI", need: ["scpi"], rubrique: "scpi", q: "financement SCPI" },
    { id: "sci", label: "SCI", need: ["sci", "immo"], rubrique: "sci", q: "financement SCI" },
    { id: "hypo", label: "HYPO", need: ["hypo", "treso"], rubrique: "hypo", q: "prêt hypothécaire trésorerie" },
    { id: "pvh", label: "PVH", need: ["pvh"], rubrique: "pvh", q: "prêt viager hypothécaire" }
  ];

  /** Alias besoin → catégories / tags catalogue */
  var NEED_ALIASES = {
    conso: ["conso", "treso"],
    treso: ["treso", "conso"],
    renov: ["renov"],
    ptz: ["ptz", "immo"],
    relais: ["relais"],
    immo: ["immo"],
    hypo: ["hypo", "hypo_treso"],
    rac: ["rac"],
    scpi: ["scpi"],
    sci: ["sci"],
    pvh: ["pvh"]
  };

  var PARTNER_ALIASES = [
    ["cfcal", ["cfcal", "credit foncier"]],
    ["credilift", ["credilift", "credit lift", "normalift", "minilift", "hypolift", "consolift", "unilift", "cautiolift", "assurlift", "cacf"]],
    ["creatis", ["creatis"]],
    ["mmb", ["mmb", "my money", "my new treso", "easy treso", "simply one"]],
    ["sygma", ["sygma", "bnp pf", "bnp"]],
    ["lbp", ["banque postale", "lbp"]],
    ["cgi", ["cgi"]],
    ["cml", ["cml", "credit municipal lyon", "municipal lyon"]],
    ["cmt", ["cmt", "credit municipal toulon", "griffon"]],
    ["bank_b", ["bank b", "banque b"]],
    ["sofinco", ["sofinco"]],
    ["cmt", ["griffon"]]
  ];

  function setCatalogs(grilles, fiches) {
    catalogs.grilles = grilles || null;
    catalogs.fiches = fiches || null;
  }

  function allPartners() {
    var map = {};
    ["grilles", "fiches"].forEach(function (k) {
      var c = catalogs[k];
      if (!c) return;
      (c.partners || []).forEach(function (p) {
        map[p.id] = p.label || p.id;
      });
    });
    return Object.keys(map)
      .sort()
      .map(function (id) {
        return { id: id, label: map[id] };
      });
  }

  function allCategories() {
    var partnerIds = {};
    ["grilles", "fiches"].forEach(function (k) {
      var c = catalogs[k];
      if (!c) return;
      (c.partners || []).forEach(function (p) {
        partnerIds[p.id] = true;
      });
    });
    var map = {};
    ["grilles", "fiches"].forEach(function (k) {
      var c = catalogs[k];
      if (!c) return;
      (c.categories || []).forEach(function (p) {
        // Ne pas remonter un partenaire / DOM-TOM dans la liste des types de prêt
        if (partnerIds[p.id]) return;
        if (p.id === "antilles" || p.id === "reunion") return;
        if (!map[p.id]) map[p.id] = p;
      });
    });
    return Object.keys(map).map(function (id) {
      return map[id];
    });
  }

  function labelPartner(id, source) {
    var c = catalogs[source] || catalogs.fiches || catalogs.grilles;
    if (!c) return id || "—";
    var p = (c.partners || []).find(function (x) {
      return x.id === id;
    });
    return (p && p.label) || id || "—";
  }

  function labelCategory(id, source) {
    var c = catalogs[source] || catalogs.fiches || catalogs.grilles;
    if (!c) return id || "—";
    var cat = (c.categories || []).find(function (x) {
      return x.id === id;
    });
    return (cat && cat.label) || id || "—";
  }

  function regionLabel(id) {
    return (
      {
        metropole: "Métropole",
        reunion: "DOM-TOM Réunion",
        antilles: "DOM-TOM Antilles"
      }[id] ||
      id ||
      "—"
    );
  }

  /**
   * Parse NL → profil + intentions + besoins
   */
  function parseQuery(raw, filters) {
    filters = filters || {};
    var q = String(raw || "").trim();
    var n = norm(q);
    var out = {
      text: q,
      tokens: tokens(q),
      ageMin: numOrNull(filters.ageMin),
      ageMax: numOrNull(filters.ageMax),
      hasProperty: boolOrNull(filters.hasProperty),
      category: filters.category || "",
      partner: filters.partner || "",
      region: filters.region || "",
      source: filters.source || "", // grilles | fiches | ""
      rubrique: filters.rubrique || "",
      project: filters.project || "",
      need: [],
      intents: [],
      profile: [],
      kindHint: "",
      axes: []
    };

    if (out.project) {
      var ax = PROJECT_AXES.find(function (a) {
        return a.id === out.project;
      });
      if (ax) {
        out.axes.push(ax.id);
        (ax.need || []).forEach(function (n) {
          if (out.need.indexOf(n) < 0) out.need.push(n);
        });
        (ax.profile || []).forEach(function (p) {
          if (out.profile.indexOf(p) < 0) out.profile.push(p);
        });
        if (!out.rubrique && ax.rubrique) out.rubrique = ax.rubrique;
      }
    }

    var ageMatch =
      n.match(/(?:plus de|au moins|>=|>|age(?:\s+de)?)\s*(\d{2})/) ||
      n.match(/(\d{2})\s*ans(?:\s+et\s+plus)?/) ||
      n.match(/age\s*(\d{2})/);
    if (out.ageMin == null && ageMatch) out.ageMin = Number(ageMatch[1]);
    if (out.ageMin == null && /\bsenior|retraite|pensionne/.test(n)) out.ageMin = 60;

    if (out.ageMin != null) {
      if (out.ageMin >= 75) out.profile.push("tres_senior");
      else if (out.ageMin >= 60) out.profile.push("senior");
    }
    if (/\bretraite|pension/.test(n)) out.profile.push("retraite");
    if (/\blocataire/.test(n)) {
      out.profile.push("locataire");
      if (out.hasProperty == null) out.hasProperty = false;
    }
    if (/\bproprietaire/.test(n)) {
      out.profile.push("proprietaire");
      if (out.hasProperty == null) out.hasProperty = true;
    }
    if (/\bprimo|premiere acquisition|1ere acquisition/.test(n)) out.profile.push("primo");
    if (/\bsans\s+(bien|garantie|hypotheque)\b/.test(n) && out.hasProperty == null) out.hasProperty = false;
    if (/\bavec\s+garantie|hypotheque|bien\s+immo/.test(n) && out.hasProperty == null) out.hasProperty = true;

    if (!out.region) {
      if (/\breunion/.test(n)) out.region = "reunion";
      else if (/\bantilles|martinique|guadeloupe/.test(n)) out.region = "antilles";
      else if (/\bdom\b|dom tom/.test(n)) out.region = "reunion";
    }

    if (!out.partner) {
      PARTNER_ALIASES.forEach(function (pair) {
        if (pair[1].some(function (a) { return n.indexOf(a) >= 0; })) out.partner = pair[0];
      });
    }

    var needMap = [
      ["rac", ["rac", "regroupement", "rachat de credit", "rachat", "consolidation", "consolift", "minilift", "normalift", "hypolift"]],
      ["scpi", ["scpi"]],
      ["sci", ["sci"]],
      ["pvh", ["pvh", "viager"]],
      ["relais", ["relais", "bridge"]],
      ["renov", ["renov", "renovation", "travaux"]],
      ["ptz", ["ptz", "pret a taux zero", "taux zero", "eco ptz", "ecoptz"]],
      ["immo", ["immobilier", "immo", "acquisition", "edifys", "aquiz", "investys", "pret immobilier"]],
      ["treso", ["treso", "tresorerie", "cash", "soulte"]],
      ["hypo", ["hypo", "hypothecaire"]],
      ["conso", ["conso", "consommation", "personnel", "pret perso", "pret conso"]],
      ["retraite", ["retraite", "pension"]],
      ["senior", ["senior"]],
      ["assurance", ["assurance", "ade", "assurlift"]],
      ["pieces", ["pieces", "dossier", "documents a fournir"]],
      ["conformite", ["conformite", "blanchiment", "devoir de conseil"]]
    ];
    needMap.forEach(function (pair) {
      if (pair[1].some(function (k) { return n.indexOf(k) >= 0; })) out.need.push(pair[0]);
    });
    // « retraite / senior » = profil, pas besoin métier (évite le bruit)
    out.need = out.need.filter(function (need) {
      return need !== "retraite" && need !== "senior";
    });
    if (/\bsans\s+garantie|avec\s+garantie/.test(n) && out.need.indexOf("rac") < 0) {
      out.need.push("rac");
    }

    /* Intentions */
    if (/\beligib|eligible|peut.?il|peut.?elle|droit a|orient/.test(n)) out.intents.push("eligibilite");
    if (/\btaux|grille|bareme|pricing|tarif/.test(n)) out.intents.push("taux");
    if (/\bcritere|norme|condition|acceptation|memento|book/.test(n)) out.intents.push("normes");
    if (/\bpiece|document|checklist|fournir/.test(n)) out.intents.push("pieces");
    if (/\bassurance|ade|quotite/.test(n)) out.intents.push("assurance");
    if (/\bformulaire|attestation|mandat|sepa/.test(n)) out.intents.push("formulaire");
    if (!out.intents.length) {
      if (out.need.indexOf("rac") >= 0 || out.profile.indexOf("senior") >= 0) out.intents.push("eligibilite");
      else out.intents.push("documentation");
    }

    /* Source hint from intent */
    if (out.intents.indexOf("taux") >= 0) out.kindHint = "grilles";
    else if (out.intents.indexOf("pieces") >= 0 || out.intents.indexOf("normes") >= 0 || out.intents.indexOf("formulaire") >= 0)
      out.kindHint = "fiches";

    if (filters.need) {
      String(filters.need)
        .split(/[,\s]+/)
        .filter(Boolean)
        .forEach(function (k) {
          if (out.need.indexOf(k) < 0) out.need.push(k);
        });
    }

    if (out.need.indexOf("ptz") >= 0 && out.profile.indexOf("primo") < 0) out.profile.push("primo");
    if (out.need.indexOf("ptz") >= 0 && out.axes.indexOf("ptz") < 0) out.axes.push("ptz");
    if (out.need.indexOf("relais") >= 0 && out.axes.indexOf("pret_relais") < 0) out.axes.push("pret_relais");
    if (out.need.indexOf("renov") >= 0 && out.axes.indexOf("travaux") < 0) out.axes.push("travaux");
    if (out.need.indexOf("conso") >= 0 && out.axes.indexOf("pret_conso") < 0) out.axes.push("pret_conso");
    if (out.need.indexOf("immo") >= 0 && out.axes.indexOf("pret_immo") < 0 && out.need.indexOf("ptz") < 0 && out.need.indexOf("relais") < 0)
      out.axes.push("pret_immo");

    out.need = unique(out.need);
    out.profile = unique(out.profile);
    out.axes = unique(out.axes);
    out.intents = unique(out.intents);

    return out;
  }

  function ageFromBirthdate(iso) {
    if (!iso) return null;
    var d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    var now = new Date();
    var age = now.getFullYear() - d.getFullYear();
    var m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
    return age >= 18 && age < 120 ? age : null;
  }

  function partnerFromText(text) {
    var n = norm(text);
    if (!n) return "";
    for (var i = 0; i < PARTNER_ALIASES.length; i++) {
      if (PARTNER_ALIASES[i][1].some(function (a) { return n.indexOf(a) >= 0; })) return PARTNER_ALIASES[i][0];
    }
    return "";
  }

  /**
   * Corrélation dossier Prêt Immo → filtres / besoins documentation
   */
  function contextFromDossier(d) {
    d = d || {};
    var p = d.projet || {};
    var need = [];
    var profile = [];
    var axes = [];
    var rubrique = d.rubrique || "";
    var rubriqueMap = {
      immo: ["immo"],
      sci: ["sci", "immo"],
      scpi: ["scpi"],
      conso: ["conso", "treso"],
      hypo: ["hypo", "treso"],
      rac: ["rac"],
      viager: ["pvh"],
      pvh: ["pvh"]
    };
    (rubriqueMap[rubrique] || []).forEach(function (n) {
      if (need.indexOf(n) < 0) need.push(n);
    });

    if (rubrique === "immo") axes.push("pret_immo");
    if (rubrique === "conso") axes.push("pret_conso");
    if (rubrique === "sci") axes.push("sci");
    if (rubrique === "scpi") axes.push("scpi");
    if (rubrique === "hypo") axes.push("hypo");
    if (rubrique === "rac") axes.push("rac");
    if (rubrique === "viager" || rubrique === "pvh") axes.push("pvh");

    if (p.type === "Travaux" || Number(p.travaux) > 0) {
      if (need.indexOf("renov") < 0) need.push("renov");
      if (axes.indexOf("travaux") < 0) axes.push("travaux");
    }
    if (p.ptz) {
      if (need.indexOf("ptz") < 0) need.push("ptz");
      if (need.indexOf("immo") < 0) need.push("immo");
      if (profile.indexOf("primo") < 0) profile.push("primo");
      if (axes.indexOf("ptz") < 0) axes.push("ptz");
    }
    if (p.relais) {
      if (need.indexOf("relais") < 0) need.push("relais");
      if (need.indexOf("immo") < 0) need.push("immo");
      if (axes.indexOf("pret_relais") < 0) axes.push("pret_relais");
    }

    var hs = d.housing_status || "";
    var hasProperty = null;
    if (hs === "locataire" || hs === "heberge") {
      profile.push("locataire");
      hasProperty = false;
    } else if (hs === "proprietaire") {
      profile.push("proprietaire");
      hasProperty = true;
    }

    var ageMin = ageFromBirthdate(d.emprunteur && d.emprunteur.birthdate);
    var partner = partnerFromText([d.banque, d.produit, p.objet].join(" "));

    axes = unique(axes);
    need = unique(need);
    profile = unique(profile);

    var qBits = [];
    axes.forEach(function (id) {
      var ax = PROJECT_AXES.find(function (a) { return a.id === id; });
      if (ax) qBits.push(ax.label);
    });
    if (p.type && p.type !== "Autre" && p.type !== "Travaux") qBits.push(p.type);
    if (Number(p.travaux) > 0) qBits.push("travaux " + Math.round(Number(p.travaux)) + " €");
    if (d.ref) qBits.push(d.ref);

    var projectPriority = ["ptz", "pret_relais", "travaux", "pret_conso", "rac", "scpi", "sci", "hypo", "pvh", "pret_immo"];
    var project = "";
    for (var pi = 0; pi < projectPriority.length; pi++) {
      if (axes.indexOf(projectPriority[pi]) >= 0) {
        project = projectPriority[pi];
        break;
      }
    }

    return {
      dossierId: d.id || "",
      ref: d.ref || "",
      rubrique: rubrique,
      axes: axes,
      need: need,
      profile: profile,
      q: qBits.join(" · ") || "documentation projet",
      filters: {
        need: need.join(","),
        rubrique: rubrique,
        project: project,
        partner: partner,
        hasProperty: hasProperty,
        ageMin: ageMin
      }
    };
  }

  function docsHrefFromDossier(d) {
    var ctx = contextFromDossier(d);
    var parts = [];
    function add(k, v) {
      if (v == null || v === "") return;
      parts.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(v)));
    }
    add("dossierId", ctx.dossierId);
    add("q", ctx.q);
    add("need", ctx.filters.need);
    add("rubrique", ctx.filters.rubrique);
    add("project", ctx.filters.project);
    add("partner", ctx.filters.partner);
    if (ctx.filters.ageMin != null) add("age", ctx.filters.ageMin);
    if (ctx.filters.hasProperty === true) add("prop", "1");
    if (ctx.filters.hasProperty === false) add("prop", "0");
    return "./crm-pret-immo-docs.html" + (parts.length ? "?" + parts.join("&") : "");
  }

  function projectAxes() {
    return PROJECT_AXES.slice();
  }

  function numOrNull(v) {
    if (v == null || v === "") return null;
    var n = Number(v);
    return isNaN(n) ? null : n;
  }

  function boolOrNull(v) {
    if (v === "" || v == null) return null;
    if (v === true || v === "1" || v === 1) return true;
    if (v === false || v === "0" || v === 0) return false;
    return null;
  }

  function docHay(doc, source) {
    return norm(
      [
        doc.title,
        doc.filename,
        doc.notes,
        doc.partner,
        labelPartner(doc.partner, source),
        doc.category,
        labelCategory(doc.category, source),
        doc.subsection,
        (doc.tags || []).join(" "),
        (doc.aliases || []).join(" "),
        (doc.alsoCategories || []).join(" "),
        doc.region,
        doc.kind,
        (doc.flags || []).join(" "),
        source
      ].join(" ")
    );
  }

  function unique(arr) {
    var s = {};
    return (arr || []).filter(function (x) {
      if (s[x]) return false;
      s[x] = 1;
      return true;
    });
  }

  function rulesFrom(catalog, query) {
    if (!catalog || !catalog.eligibilityRules) return [];
    return catalog.eligibilityRules
      .filter(function (rule) {
        var w = rule.when || {};
        if (w.ageMin != null && (query.ageMin == null || query.ageMin < w.ageMin)) return false;
        if (w.hasProperty === true && query.hasProperty !== true) return false;
        if (w.hasProperty === false && query.hasProperty !== false) return false;
        if (w.regionAny && w.regionAny.length) {
          var rn = norm(query.region || "");
          var qt = norm(query.text);
          var ok = w.regionAny.some(function (r) {
            var rr = norm(r);
            return (rn && (rn === rr || rn.indexOf(rr) >= 0)) || qt.indexOf(rr) >= 0;
          });
          if (!ok) return false;
        }
        if (w.needAny && w.needAny.length) {
          var pool = (query.need || []).concat(query.profile || []).concat(tokens(query.text));
          var okN = w.needAny.some(function (need) {
            var nn = norm(need);
            return pool.some(function (x) {
              return norm(x).indexOf(nn) >= 0 || nn.indexOf(norm(x)) >= 0;
            });
          });
          if (!okN) return false;
        }
        return true;
      })
      .sort(function (a, b) {
        return (a.priority || 99) - (b.priority || 99);
      });
  }

  function hasWord(hay, word) {
    if (!word) return false;
    var w = norm(word);
    if (!w) return false;
    if (w.length <= 3) {
      return new RegExp("(^|\\s)" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(\\s|$)").test(hay);
    }
    return hay.indexOf(w) >= 0;
  }

  function categoryMeta(doc, source) {
    var c = catalogs[source];
    if (!c) return null;
    return (c.categories || []).find(function (x) {
      return x.id === doc.category;
    }) || null;
  }

  function needHit(doc, need, hay) {
    if (!need) return false;
    var keys = NEED_ALIASES[need] || [need];
    var title = norm(doc.title + " " + (doc.filename || "") + " " + (doc.subsection || ""));
    var i;
    for (i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (doc.category === k || (doc.alsoCategories || []).indexOf(k) >= 0) return "category";
    }
    for (i = 0; i < keys.length; i++) {
      if ((doc.tags || []).indexOf(keys[i]) >= 0) return "tag";
    }
    if (need === "renov" && (doc.tags || []).indexOf("travaux") >= 0) return "tag";
    if (need === "ptz" && ((doc.tags || []).indexOf("primo") >= 0 || hasWord(title, "ptz") || hasWord(title, "taux zero")))
      return "tag";
    for (i = 0; i < keys.length; i++) {
      if (hasWord(title, keys[i])) return "title";
    }
    for (i = 0; i < keys.length; i++) {
      if (hasWord(hay, keys[i])) return "soft";
    }
    return "";
  }

  function profileHit(doc, profile, hay) {
    if ((doc.tags || []).indexOf(profile) >= 0) return "tag";
    var title = norm(doc.title + " " + (doc.filename || ""));
    if (hasWord(title, profile)) return "title";
    if (hasWord(hay, profile)) return "soft";
    return "";
  }

  function scoreDoc(doc, query, rules, source) {
    var score = 0;
    var reasons = [];
    var hay = docHay(doc, source);
    var strongNeed = false;
    var anyNeed = false;
    var anyProfile = false;

    if (query.category && (doc.category === query.category || (doc.alsoCategories || []).indexOf(query.category) >= 0)) {
      score += 45;
      reasons.push("catégorie");
    }
    if (query.rubrique) {
      var meta = categoryMeta(doc, source);
      if (meta && (meta.rubriques || []).indexOf(query.rubrique) >= 0) {
        score += 22;
        reasons.push("rubrique « " + query.rubrique + " »");
      }
    }
    if (query.partner && doc.partner === query.partner) {
      score += 28;
      reasons.push("partenaire");
    }
    if (query.region) {
      if (doc.region === query.region) {
        score += 35;
        reasons.push("région");
      } else if (doc.region === "metropole" && query.region !== "metropole") score -= 20;
    }

    (query.need || []).forEach(function (need) {
      var hit = needHit(doc, need, hay);
      if (!hit) return;
      anyNeed = true;
      if (hit === "category") {
        score += 48;
        strongNeed = true;
        reasons.push("besoin « " + need + " » (catégorie)");
      } else if (hit === "tag" || hit === "title") {
        score += 36;
        strongNeed = true;
        reasons.push("besoin « " + need + " »");
      } else {
        score += 10;
      }
    });

    (query.profile || []).forEach(function (p) {
      var hit = profileHit(doc, p, hay);
      if (!hit) return;
      anyProfile = true;
      if (hit === "tag" || hit === "title") {
        score += 20;
        reasons.push("profil « " + p + " »");
      } else {
        score += 6;
      }
    });

    /* Intent ↔ kind / source */
    (query.intents || []).forEach(function (intent) {
      if (intent === "taux" && source === "grilles") {
        score += 32;
        reasons.push("intention taux → grille");
      }
      if (intent === "taux" && source === "fiches") {
        if (/grille|taux|bareme/.test(norm(doc.title))) score += 10;
        else score -= 18;
      }
      if ((intent === "normes" || intent === "eligibilite") && source === "fiches") {
        score += 14;
        reasons.push("intention critères → fiche");
      }
      if (intent === "pieces" && (/piece|interne/.test(hay) || doc.kind === "interne")) {
        score += 34;
        reasons.push("pièces dossier");
      }
      if (intent === "assurance" && (doc.kind === "assurance" || (doc.tags || []).indexOf("assurance") >= 0)) {
        score += 30;
        reasons.push("assurance");
      }
      if (intent === "formulaire" && (doc.kind === "formulaire" || /attestation|mandat|formulaire/.test(hay))) {
        score += 28;
        reasons.push("formulaire");
      }
    });

    if (query.kindHint === source) score += 10;
    if (query.kindHint && query.kindHint !== source) score -= 8;

    (query.tokens || []).forEach(function (t) {
      if (t.length < 3) return;
      // ignorer tokens déjà captés (âge, stop, partenaires courts)
      if ("ans age plus avec sans".split(" ").indexOf(t) >= 0) return;
      var title = norm(doc.title + " " + (doc.filename || ""));
      if (hasWord(title, t)) score += 9;
      else if (hasWord(hay, t)) score += 3;
    });

    /* Phrase-ish: consecutive tokens */
    if (query.tokens.length >= 2) {
      for (var i = 0; i < query.tokens.length - 1; i++) {
        var phrase = query.tokens[i] + " " + query.tokens[i + 1];
        if (hay.indexOf(phrase) >= 0) score += 14;
      }
    }

    if ((doc.flags || []).indexOf("suspendu") >= 0) {
      score -= 55;
      reasons.push("suspendu");
    }
    if (doc.status === "available" && doc.path) score += 6;
    if (doc.kind === "book" || doc.kind === "memento" || doc.kind === "liste") {
      if (strongNeed && (query.intents.indexOf("normes") >= 0 || query.intents.indexOf("eligibilite") >= 0)) score += 8;
      else if (!strongNeed) score -= 22;
    }

    (rules || []).forEach(function (rule) {
      if ((rule.preferCategories || []).indexOf(doc.category) >= 0) {
        score += 22;
        strongNeed = true;
        reasons.push("règle : " + rule.label);
      }
      (rule.preferTags || []).forEach(function (tag) {
        if ((doc.tags || []).indexOf(tag) >= 0) score += 10;
      });
      if ((rule.preferPartners || []).indexOf(doc.partner) >= 0) score += 12;
      if ((rule.excludeFlags || []).some(function (f) {
        return (doc.flags || []).indexOf(f) >= 0;
      }))
        score -= 45;
    });

    return {
      score: score,
      reasons: unique(reasons),
      strongNeed: strongNeed,
      anyNeed: anyNeed,
      anyProfile: anyProfile
    };
  }

  function flattenDocs(sourceKey) {
    var c = catalogs[sourceKey];
    if (!c) return [];
    return (c.documents || []).map(function (d) {
      return { doc: d, source: sourceKey };
    });
  }

  function search(raw, filters) {
    filters = filters || {};
    var query = parseQuery(raw, filters);
    var rulesG = rulesFrom(catalogs.grilles, query);
    var rulesF = rulesFrom(catalogs.fiches, query);
    var rules = rulesG.concat(rulesF);
    /* dedupe rules by id */
    var seenR = {};
    rules = rules.filter(function (r) {
      if (seenR[r.id]) return false;
      seenR[r.id] = 1;
      return true;
    });

    var pool = [];
    if (!filters.source || filters.source === "grilles") pool = pool.concat(flattenDocs("grilles"));
    if (!filters.source || filters.source === "fiches") pool = pool.concat(flattenDocs("fiches"));

    var empty =
      !query.text &&
      !query.category &&
      !query.partner &&
      !query.region &&
      !query.need.length &&
      !query.rubrique &&
      !query.project &&
      query.ageMin == null &&
      query.hasProperty == null &&
      !query.profile.length;

    var results = pool
      .map(function (item) {
        var rulesFor = item.source === "grilles" ? rulesG : rulesF;
        var sc = scoreDoc(item.doc, query, rulesFor, item.source);
        return {
          doc: item.doc,
          source: item.source,
          score: sc.score,
          reasons: sc.reasons,
          strongNeed: sc.strongNeed,
          anyNeed: sc.anyNeed,
          anyProfile: sc.anyProfile,
          partnerLabel: labelPartner(item.doc.partner, item.source),
          categoryLabel: labelCategory(item.doc.category, item.source),
          regionLabel: regionLabel(item.doc.region),
          sourceLabel: item.source === "grilles" ? "Grille des taux" : "Fiche produit"
        };
      })
      .filter(function (r) {
        if (empty) return true;
        if (query.partner && r.doc.partner !== query.partner) return false;
        if (query.region && r.doc.region !== query.region) return false;
        if (query.need.length && !r.strongNeed) return false;
        if (query.kindHint === "grilles" && r.source !== "grilles" && !r.strongNeed) return false;
        if (query.kindHint === "fiches" && r.source !== "fiches" && (query.intents || []).indexOf("pieces") >= 0 && !/piece/.test(norm(r.doc.title)))
          return false;
        var min = 36;
        if ((query.intents || []).indexOf("pieces") >= 0 || (query.intents || []).indexOf("taux") >= 0) min = 48;
        if (query.need.length || query.ageMin != null) min = 52;
        if (query.partner && query.need.length) min = 58;
        return r.score >= min;
      })
      .sort(function (a, b) {
        return b.score - a.score || String(a.doc.title).localeCompare(String(b.doc.title), "fr");
      });

    // Pertinence relative : garder le sommet de ranking
    if (!empty && results.length) {
      var top = results[0].score;
      var floor = Math.max(top * 0.55, top - 70);
      if (query.partner && query.need.length) floor = Math.max(top * 0.62, top - 55);
      results = results.filter(function (r) {
        return r.score >= floor;
      });
      var cap = query.partner || query.need.length || query.ageMin != null ? 28 : 48;
      if (results.length > cap) results = results.slice(0, cap);
    }

    var playbook = buildPlaybook(query, rules, results);

    return {
      query: query,
      rules: rules,
      results: results,
      playbook: playbook,
      advice: rules.map(function (r) {
        return {
          id: r.id,
          label: r.label,
          text: r.advice,
          confidence: r.confidence || "draft",
          todoValidate: r.todoValidate || []
        };
      }),
      stats: {
        total: results.length,
        grilles: results.filter(function (r) { return r.source === "grilles"; }).length,
        fiches: results.filter(function (r) { return r.source === "fiches"; }).length
      }
    };
  }

  function buildPlaybook(query, rules, results) {
    var steps = [];
    if (query.ageMin != null && query.ageMin >= 60 && (query.need.indexOf("rac") >= 0 || query.intents.indexOf("eligibilite") >= 0)) {
      steps.push({
        title: "Profil senior — parcours conseillé",
        detail:
          "1) Fiches critères retraite / RAC avec garantie · 2) Grilles RAC hypo CFCAL/CREATIS/MMB · 3) Alternative PVH si besoin de trésorerie sur patrimoine."
      });
    }
    if (query.hasProperty === false) {
      steps.push({
        title: "Sans bien / locataire",
        detail: "Prioriser fiches « sans garantie / locataire », puis grilles RAC conso. Vérifier RAV et montant max."
      });
    }
    if (query.region === "reunion" || query.region === "antilles") {
      steps.push({
        title: "DOM-TOM",
        detail: "Utiliser uniquement fiches + grilles régionales (Réunion / Antilles). Normes et RAV spécifiques."
      });
    }
    if (query.need.indexOf("scpi") >= 0) {
      steps.push({
        title: "SCPI",
        detail: "Croiser listes SCPI éligibles + fiches nantissement/caution + grilles de taux SCPI (CFCAL / Credit Lift)."
      });
    }
    if (query.need.indexOf("ptz") >= 0 || query.axes.indexOf("ptz") >= 0) {
      steps.push({
        title: "PTZ / primo-accession",
        detail:
          "Pas encore de grille PTZ dédiée dans le catalogue — croiser fiches IMMO primo (BANK B 1ère acquisition, Edifys/Aquiz) + conditions zone / plafond. Valider éligibilité PTZ hors catalogue."
      });
    }
    if (query.need.indexOf("relais") >= 0 || query.axes.indexOf("pret_relais") >= 0) {
      steps.push({
        title: "Prêt relais",
        detail: "Grilles / fiches relais (CMT, BANK B, Griffon Patrimoine Relais) + pont vente/achat. Vérifier durée et quotité."
      });
    }
    if (query.need.indexOf("renov") >= 0 || query.axes.indexOf("travaux") >= 0) {
      steps.push({
        title: "Travaux / rénovation",
        detail: "CFCAL HYPO RENOV + BANK B travaux (>75 k€) + book revenus. Distinguer fins privées / pro."
      });
    }
    if (query.need.indexOf("conso") >= 0 || query.axes.indexOf("pret_conso") >= 0) {
      steps.push({
        title: "Prêt conso / trésorerie",
        detail: "Orienter vers catégories TRESO / conso patrimoine, Griffon, Credit Lift conso — croiser RAV et garantie éventuelle."
      });
    }
    if (query.need.indexOf("immo") >= 0 && query.axes.indexOf("pret_immo") >= 0) {
      steps.push({
        title: "Prêt immobilier",
        detail: "Fiches acquisition (Ancien / VEFA / CCMI) + grilles IMMO. Si PTZ ou relais coché sur le dossier, combiner les parcours associés."
      });
    }
    if (!steps.length && rules[0]) {
      steps.push({ title: rules[0].label, detail: rules[0].advice });
    }
    var topPartners = {};
    results.slice(0, 15).forEach(function (r) {
      topPartners[r.doc.partner] = (topPartners[r.doc.partner] || 0) + 1;
    });
    var partners = Object.keys(topPartners)
      .sort(function (a, b) {
        return topPartners[b] - topPartners[a];
      })
      .slice(0, 4)
      .map(function (id) {
        return labelPartner(id, "fiches");
      });
    return { steps: steps, topPartners: partners };
  }

  function groupResults(results, mode) {
    mode = mode || "source";
    var map = {};
    (results || []).forEach(function (r) {
      var key =
        mode === "partner"
          ? r.doc.partner
          : mode === "category"
            ? r.doc.category
            : r.source;
      var label =
        mode === "partner"
          ? r.partnerLabel
          : mode === "category"
            ? r.categoryLabel
            : r.sourceLabel;
      if (!map[key]) map[key] = { id: key, label: label, items: [] };
      map[key].items.push(r);
    });
    return Object.keys(map).map(function (k) {
      return map[k];
    });
  }

  function examples() {
    return [
      { q: "personne de 62 ans retraitée, propriétaire, éligible RAC ?", label: "62 ans · retraite · RAC" },
      { q: "locataire sans garantie Credit Lift", label: "Locataire · Credit Lift" },
      { q: "taux RAC CFCAL avec garantie", label: "Taux RAC CFCAL" },
      { q: "pièces indispensables RAC hypo Creatis", label: "Pièces Creatis" },
      { q: "PVH senior trésorerie", label: "PVH" },
      { q: "SCPI nantissement CFCAL", label: "SCPI" },
      { q: "RAC Réunion avec garantie", label: "DOM-TOM Réunion" },
      { q: "travaux rénovation 80000 BANK B", label: "Travaux BANK B" },
      { q: "prêt à taux zéro PTZ primo-accession", label: "PTZ", project: "ptz" },
      { q: "prêt relais achat vente", label: "Prêt relais", project: "pret_relais" },
      { q: "prêt immobilier acquisition", label: "Prêt immo", project: "pret_immo" },
      { q: "prêt consommation trésorerie", label: "Prêt conso", project: "pret_conso" }
    ];
  }

  function explainQuery(query) {
    var bits = [];
    if (query.axes && query.axes.length) bits.push("projet : " + query.axes.join(", "));
    if (query.rubrique) bits.push("rubrique : " + query.rubrique);
    if (query.ageMin != null) bits.push("âge ≥ " + query.ageMin + " ans");
    if (query.profile.length) bits.push("profil : " + query.profile.join(", "));
    if (query.hasProperty === true) bits.push("avec bien");
    if (query.hasProperty === false) bits.push("sans bien");
    if (query.need.length) bits.push("besoins : " + query.need.join(", "));
    if (query.intents.length) bits.push("intention : " + query.intents.join(", "));
    if (query.partner) bits.push("partenaire : " + labelPartner(query.partner, "fiches"));
    if (query.region) bits.push("région : " + regionLabel(query.region));
    return bits.length ? bits.join(" · ") : "catalogue complet (grilles + fiches)";
  }

  return {
    setCatalogs: setCatalogs,
    parseQuery: parseQuery,
    search: search,
    groupResults: groupResults,
    examples: examples,
    explainQuery: explainQuery,
    allPartners: allPartners,
    allCategories: allCategories,
    regionLabel: regionLabel,
    projectAxes: projectAxes,
    contextFromDossier: contextFromDossier,
    docsHrefFromDossier: docsHrefFromDossier,
    norm: norm
  };
})();
