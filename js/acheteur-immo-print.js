/**
 * Impression questionnaire acheteur-immo : vide, partiel (réponses saisies), complet (toute la trame).
 */
(function () {
  var EMPTY_MARK = "…………";

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function labelFor(el, form) {
    if (el.id) {
      var lab = form.querySelector('label[for="' + el.id + '"]');
      if (lab) return lab.textContent.replace(/\s+/g, " ").trim();
    }
    var wrap = el.closest(".field, .immo-price-row, .search-chip");
    if (wrap) {
      var l = wrap.querySelector("label");
      if (l && !l.querySelector("input")) return l.textContent.replace(/\s+/g, " ").trim();
    }
    if (el.placeholder) return el.placeholder;
    return el.name || "Champ";
  }

  function valueOf(el) {
    if (el.type === "checkbox") return el.checked ? el.value || "Oui" : "";
    if (el.type === "radio") return el.checked ? el.value : null;
    return (el.value || "").trim();
  }

  function annotateSections(form) {
    qsa(".wizard-step", form).forEach(function (step) {
      if (step.getAttribute("data-print-section")) return;
      var h = step.querySelector("h3");
      if (h) step.setAttribute("data-print-section", h.textContent.trim());
    });
    qsa("details.immo-vente-block", form).forEach(function (d) {
      if (d.getAttribute("data-print-section")) return;
      var s = d.querySelector("summary");
      if (s) d.setAttribute("data-print-section", s.textContent.trim());
    });
  }

  function searchKind(form) {
    var el = form.querySelector('input[name="searchKind"]:checked');
    return el ? el.value : "bien";
  }

  function sectionApplies(sectionEl, form, kind) {
    var inVente = !!sectionEl.closest("[data-search-vente-panel]");
    var inAchat = !!sectionEl.closest("[data-search-bien-panel]");
    var inService = !!sectionEl.closest("[data-search-service-panel]");
    if (kind === "bien" && (inVente || inService)) return false;
    if (kind === "service" && inAchat) return false;
    return true;
  }

  function collectRadioGroups(container, form, mode, rows, seen) {
    var names = {};
    qsa('input[type="radio"]', container).forEach(function (el) {
      if (el.disabled || !el.name) return;
      if (names[el.name]) return;
      names[el.name] = true;
      var checked = form.querySelector('input[type="radio"][name="' + el.name + '"]:checked');
      var val = checked ? checked.value : "";
      if (mode === "partial" && !val) return;
      var chip = checked && checked.closest(".search-chip span");
      var display = chip ? chip.textContent.trim() : val;
      if (mode === "empty") display = EMPTY_MARK;
      else if (!display) display = mode === "full" ? "—" : "";
      if (mode === "partial" && !display) return;
      var key = "radio:" + el.name;
      if (seen[key]) return;
      seen[key] = true;
      rows.push({ label: labelFor(el, form), value: display });
    });
  }

  function collectCheckboxGroups(container, form, mode, rows, seen) {
    var groups = {};
    qsa('input[type="checkbox"]', container).forEach(function (el) {
      if (el.disabled || !el.name) return;
      if (!groups[el.name]) groups[el.name] = [];
      if (el.checked) {
        var chip = el.closest(".search-chip span");
        groups[el.name].push(chip ? chip.textContent.trim() : el.value);
      }
    });
    Object.keys(groups).forEach(function (name) {
      var key = "chk:" + name;
      if (seen[key]) return;
      seen[key] = true;
      var val = groups[name].join(", ");
      if (mode === "partial" && !val) return;
      if (mode === "empty") val = EMPTY_MARK;
      else if (!val) val = mode === "full" ? "—" : "";
      if (mode === "partial" && !val) return;
      var sample = container.querySelector('input[type="checkbox"][name="' + name + '"]');
      rows.push({ label: labelFor(sample, form), value: val });
    });
  }

  function collectFields(container, form, mode, rows, seen) {
    qsa("input, select, textarea", container).forEach(function (el) {
      if (el.disabled || el.type === "hidden" || el.type === "button" || el.type === "submit") return;
      if (el.name === "_hp") return;
      if (el.type === "radio" || el.type === "checkbox") return;
      if (el.closest("[data-owners-mount], [data-rooms-mount]")) return;
      if (mode !== "empty" && el.closest("[hidden]")) return;

      var key = el.name + ":" + el.type;
      if (seen[key]) return;
      seen[key] = true;

      var val = valueOf(el);
      if (mode === "partial" && !val) return;
      if (mode === "empty") val = EMPTY_MARK;
      else if (!val) val = mode === "full" ? "—" : "";

      if (mode === "partial" && !val) return;
      rows.push({ label: labelFor(el, form), value: val });
    });
  }

  function collectOwners(form, mode) {
    var mount = qs("[data-owners-mount]", form);
    if (!mount) return [];
    if (mode !== "empty" && mount.closest("[hidden]")) return [];

    var cards = qsa(".immo-owner-card", mount);
    if (!cards.length && mode === "empty") cards = [null];

    return cards.map(function (card, i) {
      var rows = [];
      if (!card) {
        return {
          title: "Propriétaire " + (i + 1),
          rows: [
            { label: "Civilité / nom / coordonnées", value: EMPTY_MARK },
          ],
        };
      }
      qsa("[data-owner-field]", card).forEach(function (el) {
        var val = el.type === "radio" ? (el.checked ? el.value : null) : valueOf(el);
        if (el.type === "radio" && !el.checked) return;
        if (mode === "partial" && !val) return;
        if (mode === "empty") val = EMPTY_MARK;
        else if (!val) val = mode === "full" ? "—" : "";
        var labels = {
          role: "Rôle",
          firstName: "Prénom",
          lastName: "Nom",
          address: "Adresse",
          postal: "CP",
          city: "Ville",
          phone: "Téléphone",
          email: "E-mail",
          salutation: "Civilité",
        };
        rows.push({ label: labels[el.getAttribute("data-owner-field")] || "Info", value: val });
      });
      if (mode === "partial" && !rows.length) return null;
      return { title: "Propriétaire " + (i + 1), rows: rows };
    }).filter(Boolean);
  }

  function collectRooms(form, mode) {
    var mount = qs("[data-rooms-mount]", form);
    if (!mount) return null;
    if (mode !== "empty" && mount.closest("[hidden]")) return null;

    var trs = qsa(".immo-room-row", mount);
    if (!trs.length && mode !== "partial") {
      return {
        title: "Pièces / balcons",
        headers: ["Niv.", "Pièce", "Surf.", "Dimensions", "Revêtement", "Expo"],
        tableRows:
          mode === "empty"
            ? [["", "", "", "", "", ""]]
            : [],
      };
    }

    var tableRows = trs
      .map(function (tr) {
        var cells = [];
        var empty = false;
        qsa("[data-room-field]", tr).forEach(function (el) {
          var v = valueOf(el);
          if (!v) empty = true;
          cells.push(mode === "empty" ? "" : v || (mode === "full" ? "—" : ""));
        });
        if (mode === "partial" && empty && cells.every(function (c) {
          return !c;
        }))
          return null;
        return cells;
      })
      .filter(Boolean);

    if (mode === "partial" && !tableRows.length) return null;

    return {
      title: "Pièces / balcons",
      headers: ["Niv.", "Pièce", "Surf.", "Dimensions", "Revêtement", "Expo"],
      tableRows: tableRows.length ? tableRows : mode === "empty" ? [["", "", "", "", "", ""]] : [],
    };
  }

  function collectSections(form, mode) {
    annotateSections(form);
    var kind = searchKind(form);
    var sections = [];
    var containers = qsa("[data-print-section]", form);

    containers.forEach(function (container) {
      if (mode !== "empty" && !sectionApplies(container, form, kind)) return;

      var title = container.getAttribute("data-print-section") || "Section";
      var rows = [];
      var seen = {};

      collectRadioGroups(container, form, mode, rows, seen);
      collectCheckboxGroups(container, form, mode, rows, seen);
      collectFields(container, form, mode, rows, seen);

      if (title.indexOf("Propriétaire") === 0 && container.querySelector("[data-owners-mount]")) return;

      if (mode === "partial" && !rows.length) return;
      if (mode === "empty" || rows.length) {
        sections.push({ title: title, rows: rows });
      }
    });

    var owners = collectOwners(form, mode);
    if (owners.length) {
      sections = owners.concat(sections);
    }

    var rooms = collectRooms(form, mode);
    if (rooms && (rooms.tableRows.length || mode !== "partial")) {
      sections.push(rooms);
    }

    return sections;
  }

  function bodyHtml(sections, mode) {
    var P = window.PrintDocument;
    if (!P) return "";

    return sections
      .map(function (sec) {
        if (sec.tableRows) {
          return (
            P.section(
              sec.title,
              sec.tableRows.length
                ? P.tableHtml(sec.headers, sec.tableRows)
                : '<p class="lop-muted">Aucune pièce renseignée.</p>'
            ) || ""
          );
        }
        if (mode === "empty") {
          var emptyRows = sec.rows.length
            ? sec.rows
            : [{ label: "Informations", value: EMPTY_MARK }];
          return P.section(sec.title, P.rowsHtml(emptyRows));
        }
        return P.section(sec.title, P.rowsHtml(sec.rows));
      })
      .join("");
  }

  function printForm(form, mode) {
    form = form || qs("form[data-acheteur-immo]");
    if (!form || !window.PrintDocument) {
      alert("Impression indisponible — rechargez la page.");
      return;
    }

    mode = mode || "partial";
    var sections = collectSections(form, mode);
    var kind = searchKind(form);
    var fillMode = window.AcheteurImmoFillMode ? window.AcheteurImmoFillMode.getMode() : "client";

    var subtitles = {
      empty: "Modèle vierge — projet de vente / recherche (Laforêt)",
      partial: "État actuel du formulaire — réponses saisies uniquement",
      full: "Questionnaire complet — trame avec toutes les rubriques",
    };

    var casquette =
      kind === "les_deux"
        ? "Vente + rachat"
        : kind === "service"
          ? "Vente / estimation"
          : "Recherche acquéreur";

    window.PrintDocument.open({
      kind: "questionnaire",
      kindLabel: "Questionnaire immobilier",
      title: "Projet immobilier — Leads Opportunities",
      subtitle: subtitles[mode] || subtitles.partial,
      meta: [
        "Casquette : " + casquette,
        "Remplissage : " + (fillMode === "conseiller" ? "Conseiller" : "Client"),
        mode === "empty" ? "Version vierge" : mode === "partial" ? "Partiel" : "Complet",
      ],
      bodyHtml: bodyHtml(sections, mode),
      footnote:
        "Document de travail — non contractuel. Les zones « ………… » sont à compléter. " +
        (fillMode === "conseiller"
          ? "Usage interne conseiller autorisé."
          : "Version client — ne pas modifier les honoraires sans accord écrit."),
    });
  }

  function bind(form) {
    form = form || qs("form[data-acheteur-immo]");
    if (!form || form.dataset.printBound) return;
    form.dataset.printBound = "1";

    var toolbar = qs("[data-immo-fill-toolbar]");
    if (toolbar) {
      qsa("[data-print-mode]", toolbar).forEach(function (btn) {
        btn.addEventListener("click", function () {
          printForm(form, btn.getAttribute("data-print-mode"));
        });
      });
    }
  }

  function boot() {
    bind();
  }

  window.AcheteurImmoPrint = {
    print: printForm,
    collect: collectSections,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
