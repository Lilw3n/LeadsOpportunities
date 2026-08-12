/**
 * Catalogue grilles de taux + moteur de recherche / éligibilité (indicatif).
 * Les règles sont des brouillons à valider à l’import des PDF/XLS.
 */
window.CrmPretGrilles = (function () {
  var catalog = null;

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function tokens(s) {
    return norm(s).split(/\s+/).filter(Boolean);
  }

  function ensureCatalog(data) {
    catalog = data || catalog;
    return catalog;
  }

  function getCatalog() {
    return catalog;
  }

  function partnerLabel(id) {
    if (!catalog) return id || "—";
    var p = (catalog.partners || []).find(function (x) {
      return x.id === id;
    });
    return p ? p.label : id || "—";
  }

  function categoryLabel(id) {
    if (!catalog) return id || "—";
    var c = (catalog.categories || []).find(function (x) {
      return x.id === id;
    });
    return c ? c.label : id || "—";
  }

  function regionLabel(id) {
    var map = {
      metropole: "Métropole",
      reunion: "DOM-TOM Réunion",
      antilles: "DOM-TOM Antilles"
    };
    return map[id] || id || "—";
  }

  /**
   * Parse une requête libre + filtres structurés.
   * Ex. "personne de plus de 60 ans eligible RAC Réunion"
   */
  function parseQuery(raw, filters) {
    filters = filters || {};
    var q = String(raw || "");
    var n = norm(q);
    var out = {
      text: q.trim(),
      tokens: tokens(q),
      ageMin: filters.ageMin != null && filters.ageMin !== "" ? Number(filters.ageMin) : null,
      ageMax: filters.ageMax != null && filters.ageMax !== "" ? Number(filters.ageMax) : null,
      hasProperty: filters.hasProperty === "" || filters.hasProperty == null ? null : filters.hasProperty === "1" || filters.hasProperty === true,
      category: filters.category || "",
      partner: filters.partner || "",
      region: filters.region || "",
      need: [],
      kind: filters.kind || ""
    };

    var ageMatch = n.match(/(?:plus de|>=|>|age(?:\s+de)?|aged?)\s*(\d{2})/) || n.match(/(\d{2})\s*ans/);
    if (out.ageMin == null && ageMatch) out.ageMin = Number(ageMatch[1]);

    var needMap = [
      ["rac", ["rac", "regroupement", "rachat", "consolidation"]],
      ["scpi", ["scpi"]],
      ["sci", ["sci"]],
      ["pvh", ["pvh", "viager"]],
      ["relais", ["relais", "bridge"]],
      ["renov", ["renov", "renovation", "travaux"]],
      ["immo", ["immobilier", "immo", "acquisition"]],
      ["treso", ["treso", "tresorerie", "cash"]],
      ["hypo", ["hypo", "hypothecaire"]],
      ["conso", ["conso", "consommation", "personnel"]]
    ];
    needMap.forEach(function (pair) {
      var id = pair[0];
      var keys = pair[1];
      if (keys.some(function (k) { return n.indexOf(k) >= 0; })) out.need.push(id);
    });
    if (filters.need) {
      String(filters.need)
        .split(/[,\s]+/)
        .filter(Boolean)
        .forEach(function (k) {
          if (out.need.indexOf(k) < 0) out.need.push(k);
        });
    }

    if (!out.region) {
      if (n.indexOf("reunion") >= 0 || n.indexOf("réunion".normalize("NFD").replace(/[\u0300-\u036f]/g, "")) >= 0) out.region = "reunion";
      else if (n.indexOf("antilles") >= 0 || n.indexOf("martinique") >= 0 || n.indexOf("guadeloupe") >= 0) out.region = "antilles";
      else if (n.indexOf("dom") >= 0) out.region = "reunion";
    }

    if (out.hasProperty == null) {
      if (/\bsans\s+(bien|garantie|hypotheque)\b/.test(n) || /\blocataire\b/.test(n)) out.hasProperty = false;
      else if (/\b(avec\s+garantie|proprietaire|hypotheque|bien\s+immo)/.test(n)) out.hasProperty = true;
    }

    return out;
  }

  function docSearchText(doc) {
    return norm(
      [
        doc.title,
        doc.filename,
        doc.notes,
        doc.partner,
        partnerLabel(doc.partner),
        doc.category,
        categoryLabel(doc.category),
        (doc.tags || []).join(" "),
        (doc.aliases || []).join(" "),
        (doc.alsoCategories || []).join(" "),
        doc.region,
        doc.kind,
        (doc.flags || []).join(" ")
      ].join(" ")
    );
  }

  function scoreDocument(doc, query, matchedRules) {
    var score = 0;
    var reasons = [];
    var hay = docSearchText(doc);

    if (query.category && doc.category === query.category) {
      score += 40;
      reasons.push("catégorie");
    }
    if (query.partner && doc.partner === query.partner) {
      score += 35;
      reasons.push("partenaire");
    }
    if (query.region && doc.region === query.region) {
      score += 30;
      reasons.push("région");
    } else if (query.region && doc.region === "metropole" && query.region !== "metropole") {
      score -= 15;
    }
    if (query.kind && doc.kind === query.kind) {
      score += 10;
    }

    (query.need || []).forEach(function (need) {
      if (doc.category === need || (doc.tags || []).indexOf(need) >= 0 || hay.indexOf(need) >= 0) {
        score += 25;
        reasons.push("besoin « " + need + " »");
      }
    });

    (query.tokens || []).forEach(function (t) {
      if (t.length < 2) return;
      if (hay.indexOf(t) >= 0) score += 6;
    });

    if ((doc.flags || []).indexOf("suspendu") >= 0) {
      score -= 50;
      reasons.push("produit suspendu");
    }
    if (doc.status === "available" && doc.path) score += 5;
    if (doc.status === "pending_upload") score -= 1;

    (matchedRules || []).forEach(function (rule) {
      if ((rule.preferCategories || []).indexOf(doc.category) >= 0) {
        score += 20;
        reasons.push("règle : " + rule.label);
      }
      (rule.preferTags || []).forEach(function (tag) {
        if ((doc.tags || []).indexOf(tag) >= 0) score += 8;
      });
      if ((rule.preferPartners || []).indexOf(doc.partner) >= 0) score += 10;
      if ((rule.excludeFlags || []).some(function (f) {
        return (doc.flags || []).indexOf(f) >= 0;
      })) {
        score -= 40;
      }
    });

    return { score: score, reasons: unique(reasons) };
  }

  function unique(arr) {
    var seen = {};
    return (arr || []).filter(function (x) {
      if (seen[x]) return false;
      seen[x] = true;
      return true;
    });
  }

  function ruleMatches(rule, query) {
    var w = rule.when || {};
    if (w.ageMin != null && (query.ageMin == null || query.ageMin < w.ageMin)) return false;
    if (w.ageMax != null && query.ageMin != null && query.ageMin > w.ageMax) return false;
    if (w.hasProperty === true && query.hasProperty !== true) return false;
    if (w.hasProperty === false && query.hasProperty !== false) return false;
    if (w.regionAny && w.regionAny.length) {
      var rn = norm(query.region || "");
      var okRegion = w.regionAny.some(function (r) {
        return rn && (rn === norm(r) || rn.indexOf(norm(r)) >= 0);
      });
      /* aussi si la requête texte mentionne la région */
      if (!okRegion) {
        var qt = norm(query.text);
        okRegion = w.regionAny.some(function (r) {
          return qt.indexOf(norm(r)) >= 0;
        });
      }
      if (!okRegion) return false;
    }
    if (w.needAny && w.needAny.length) {
      var needs = (query.need || []).concat(tokens(query.text));
      var okNeed = w.needAny.some(function (n) {
        var nn = norm(n);
        return needs.some(function (x) {
          return norm(x).indexOf(nn) >= 0 || nn.indexOf(norm(x)) >= 0;
        });
      });
      if (!okNeed && query.category) {
        okNeed = w.needAny.indexOf(query.category) >= 0;
      }
      if (!okNeed) return false;
    }
    return true;
  }

  function matchingRules(query) {
    if (!catalog) return [];
    return (catalog.eligibilityRules || [])
      .filter(function (r) {
        return ruleMatches(r, query);
      })
      .sort(function (a, b) {
        return (a.priority || 99) - (b.priority || 99);
      });
  }

  /**
   * Recherche intelligente : documents scorés + conseils d’éligibilité.
   */
  function search(rawQuery, filters) {
    if (!catalog) {
      return { query: parseQuery(rawQuery, filters), rules: [], results: [], advice: [] };
    }
    var query = parseQuery(rawQuery, filters);
    var rules = matchingRules(query);
    var results = (catalog.documents || [])
      .map(function (doc) {
        var sc = scoreDocument(doc, query, rules);
        return {
          doc: doc,
          score: sc.score,
          reasons: sc.reasons,
          partnerLabel: partnerLabel(doc.partner),
          categoryLabel: categoryLabel(doc.category),
          regionLabel: regionLabel(doc.region)
        };
      })
      .filter(function (r) {
        /* sans requête : tout lister ; avec requête : score > 0 ou filtres stricts */
        if (!query.text && !query.category && !query.partner && !query.region && !query.need.length && query.ageMin == null && query.hasProperty == null) {
          return true;
        }
        return r.score > 0;
      })
      .sort(function (a, b) {
        return b.score - a.score || String(a.doc.title).localeCompare(String(b.doc.title), "fr");
      });

    return {
      query: query,
      rules: rules,
      results: results,
      advice: rules.map(function (r) {
        return {
          id: r.id,
          label: r.label,
          text: r.advice,
          confidence: r.confidence || "draft",
          todoValidate: r.todoValidate || []
        };
      })
    };
  }

  function groupByCategory(results) {
    var map = {};
    (results || []).forEach(function (r) {
      var id = r.doc.category;
      if (!map[id]) map[id] = { id: id, label: categoryLabel(id), items: [] };
      map[id].items.push(r);
    });
    return Object.keys(map).map(function (k) {
      return map[k];
    });
  }

  function examples() {
    return [
      { q: "personne de plus de 60 ans éligible RAC", label: "60 ans+ → RAC" },
      { q: "PVH senior propriétaire", label: "PVH senior" },
      { q: "RAC sans garantie locataire", label: "RAC sans bien" },
      { q: "financement SCPI nantissement", label: "SCPI" },
      { q: "RAC Réunion avec garantie", label: "DOM-TOM Réunion" },
      { q: "travaux rénovation hypo", label: "Rénovation" }
    ];
  }

  return {
    ensureCatalog: ensureCatalog,
    getCatalog: getCatalog,
    parseQuery: parseQuery,
    search: search,
    matchingRules: matchingRules,
    groupByCategory: groupByCategory,
    partnerLabel: partnerLabel,
    categoryLabel: categoryLabel,
    regionLabel: regionLabel,
    examples: examples,
    norm: norm
  };
})();
