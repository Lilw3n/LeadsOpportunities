/**
 * Dessin intelligent de composition immo (SVG).
 * Schéma imbriqué : terrain → bâti → étage → lot → pièces.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CrmImmoCompositionDraw = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var ROLE_COLORS = {
    foncier: { fill: "#dcfce7", stroke: "#15803d", text: "#14532d", header: "#bbf7d0" },
    bati: { fill: "#e0f2fe", stroke: "#0369a1", text: "#0c4a6e", header: "#bae6fd" },
    niveau: { fill: "#f3e8ff", stroke: "#7c3aed", text: "#4c1d95", header: "#e9d5ff" },
    lot: { fill: "#ffedd5", stroke: "#c2410c", text: "#7c2d12", header: "#fed7aa" },
    annexe: { fill: "#f1f5f9", stroke: "#64748b", text: "#334155", header: "#e2e8f0" },
    piece: { fill: "#fff7ed", stroke: "#ea580c", text: "#9a3412", header: "#ffedd5" },
  };

  var PAD = 10;
  var GAP = 8;
  var HEADER_H = 36;
  var PIECE_H = 26;
  var PIECE_GAP = 6;
  var MIN_INNER_W = 180;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function roleOf(unit, Dossier) {
    if (Dossier && Dossier.levelRole) return Dossier.levelRole(unit && unit.type) || "lot";
    var t = String((unit && unit.type) || "");
    if (t === "terrain" || t === "parcelle") return "foncier";
    if (t === "immeuble" || t === "maison") return "bati";
    if (t === "etage") return "niveau";
    if (t === "dependance" || t === "cave" || t === "garage" || t === "parking") return "annexe";
    if (t === "piece" || t === "room") return "piece";
    return "lot";
  }

  function labelOf(unit, Dossier) {
    if (Dossier && Dossier.unitLabel) return Dossier.unitLabel(unit);
    return (unit && (unit.label || unit.type)) || "Lot";
  }

  function typeLabelOf(unit, Schema) {
    if (Schema && Schema.UNIT_TYPES) {
      var hit = Schema.UNIT_TYPES.find(function (x) {
        return x.id === unit.type;
      });
      if (hit) return hit.label;
    }
    return (unit && unit.type) || "Lot";
  }

  function pieceLabel(p, Dossier) {
    if (!p) return "Pièce";
    var lab = p.label;
    if ((!lab || !String(lab).trim()) && Dossier && Dossier.ROOM_TYPES) {
      var meta = Dossier.ROOM_TYPES.find(function (t) {
        return t.id === p.type;
      });
      if (meta) lab = meta.label;
    }
    lab = lab || p.type || "Pièce";
    var q = Number(p.qty) || 1;
    return q > 1 ? lab + " ×" + q : lab;
  }

  function piecesOf(unit, Dossier) {
    if (!unit) return [];
    var list = unit.pieces_list || unit.rooms_list || [];
    if ((!list || !list.length) && Dossier && Dossier.seedPiecesFromCounters) {
      list = Dossier.seedPiecesFromCounters(unit) || [];
    }
    return Array.isArray(list) ? list.filter(Boolean) : [];
  }

  function metaBits(unit, childCount) {
    var bits = [];
    if (!unit) return bits;
    if (unit.cadastre_ref || (unit.cadastre_section && unit.cadastre_numero)) {
      bits.push(unit.cadastre_ref || [unit.cadastre_section, unit.cadastre_numero].join(" "));
    }
    if (unit.floor != null && String(unit.floor).trim() !== "") bits.push("Niv. " + unit.floor);
    if (unit.lot_number) bits.push("Lot " + unit.lot_number);
    if (unit.surface_m2 || unit.surface_carrez) bits.push((unit.surface_carrez || unit.surface_m2) + " m²");
    if (unit.loyer_reel || unit.loyer || unit.loyer_hc) {
      bits.push((unit.loyer_reel || unit.loyer || unit.loyer_hc) + " €");
    }
    if (childCount) bits.push(childCount + " enfant(s)");
    return bits;
  }

  function flattenTree(tree, depth, out) {
    out = out || [];
    (tree || []).forEach(function (node) {
      out.push({
        unit: node.unit,
        children: node.children || [],
        depth: depth || 0,
        childCount: (node.children || []).length,
      });
      flattenTree(node.children || [], (depth || 0) + 1, out);
    });
    return out;
  }

  function measureNode(node, Dossier, Schema) {
    var unit = node.unit || {};
    var role = roleOf(unit, Dossier);
    var kids = node.children || [];
    var pieces = role === "lot" || role === "annexe" ? piecesOf(unit, Dossier) : [];

    var measuredChildren = kids.map(function (c) {
      return measureNode(c, Dossier, Schema);
    });

    var innerW = MIN_INNER_W;
    var innerH = 0;

    if (measuredChildren.length) {
      measuredChildren.forEach(function (c) {
        if (c.w > innerW) innerW = c.w;
      });
      measuredChildren.forEach(function (c, i) {
        innerH += c.h + (i ? GAP : 0);
      });
    } else if (pieces.length) {
      var cols = Math.min(3, pieces.length);
      var rows = Math.ceil(pieces.length / cols);
      var pieceW = Math.max(72, Math.floor((MIN_INNER_W - (cols - 1) * PIECE_GAP) / cols));
      innerW = Math.max(innerW, cols * pieceW + (cols - 1) * PIECE_GAP);
      innerH = rows * PIECE_H + (rows - 1) * PIECE_GAP;
    } else if (role === "foncier" || role === "bati" || role === "niveau") {
      innerH = 18;
    } else {
      innerH = 4;
    }

    return {
      unit: unit,
      role: role,
      title: labelOf(unit, Dossier),
      typ: typeLabelOf(unit, Schema),
      meta: metaBits(unit, kids.length),
      children: measuredChildren,
      pieces: pieces,
      childCount: kids.length,
      w: innerW + PAD * 2,
      h: HEADER_H + PAD + innerH + PAD,
    };
  }

  function measureForest(tree, Dossier, Schema) {
    var roots = (tree || []).map(function (n) {
      return measureNode(n, Dossier, Schema);
    });
    if (!roots.length) return null;
    var w = 0;
    var h = 0;
    roots.forEach(function (r, i) {
      if (r.w > w) w = r.w;
      h += r.h + (i ? GAP * 2 : 0);
    });
    return { roots: roots, w: w + PAD * 2, h: h + PAD * 2 };
  }

  function drawOccBadge(parts, x, y, w, occupied) {
    var bx = x + w - 50;
    var by = y + 10;
    parts.push(
      '<rect x="' +
        bx +
        '" y="' +
        by +
        '" width="40" height="16" rx="8" fill="' +
        (occupied ? "#166534" : "#64748b") +
        '"/>' +
        '<text x="' +
        (bx + 20) +
        '" y="' +
        (by + 11.5) +
        '" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">' +
        (occupied ? "LOUÉ" : "VIDE") +
        "</text>"
    );
  }

  function drawPieces(parts, pieces, x, y, innerW, Dossier) {
    var cols = Math.min(3, Math.max(1, pieces.length));
    var pieceW = Math.floor((innerW - (cols - 1) * PIECE_GAP) / cols);
    var colors = ROLE_COLORS.piece;
    pieces.forEach(function (p, i) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var px = x + col * (pieceW + PIECE_GAP);
      var py = y + row * (PIECE_H + PIECE_GAP);
      var lab = pieceLabel(p, Dossier);
      var surf = p.surface_m2 ? " · " + p.surface_m2 + " m²" : "";
      var full = String(lab + surf);
      parts.push(
        '<g class="comp-draw-piece">' +
          '<rect x="' +
          px +
          '" y="' +
          py +
          '" width="' +
          pieceW +
          '" height="' +
          PIECE_H +
          '" rx="6" fill="' +
          colors.fill +
          '" stroke="' +
          colors.stroke +
          '" stroke-width="1.25"/>' +
          '<text x="' +
          (px + 8) +
          '" y="' +
          (py + 17) +
          '" font-size="10" font-weight="700" fill="' +
          colors.text +
          '">' +
          esc(full.slice(0, 22)) +
          (full.length > 22 ? "…" : "") +
          "</text></g>"
      );
    });
  }

  function drawNode(parts, layout, x, y, Dossier) {
    var colors = ROLE_COLORS[layout.role] || ROLE_COLORS.lot;
    var u = layout.unit || {};
    var occ = !!(u.occupation === "loue" || u.loue);

    parts.push(
      '<g class="comp-draw-node role-' +
        esc(layout.role) +
        '" data-unit-id="' +
        esc(u.id) +
        '" data-role="' +
        esc(layout.role) +
        '">' +
        '<rect class="comp-draw-box" x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        layout.w +
        '" height="' +
        layout.h +
        '" rx="12" fill="' +
        colors.fill +
        '" stroke="' +
        colors.stroke +
        '" stroke-width="2"/>' +
        '<rect class="comp-draw-header" x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        layout.w +
        '" height="' +
        HEADER_H +
        '" rx="12" fill="' +
        colors.header +
        '" stroke="' +
        colors.stroke +
        '" stroke-width="2"/>' +
        '<rect x="' +
        x +
        '" y="' +
        (y + HEADER_H - 10) +
        '" width="' +
        layout.w +
        '" height="10" fill="' +
        colors.header +
        '"/>' +
        '<text x="' +
        (x + 12) +
        '" y="' +
        (y + 15) +
        '" font-size="10" font-weight="700" fill="' +
        colors.text +
        '">' +
        esc(layout.typ) +
        "</text>" +
        '<text x="' +
        (x + 12) +
        '" y="' +
        (y + 29) +
        '" font-size="12" font-weight="800" fill="#0f172a">' +
        esc(String(layout.title).slice(0, 40)) +
        (String(layout.title).length > 40 ? "…" : "") +
        "</text>"
    );

    drawOccBadge(parts, x, y, layout.w, occ);

    if (layout.meta && layout.meta.length) {
      parts.push(
        '<text x="' +
          (x + layout.w - 56) +
          '" y="' +
          (y + 15) +
          '" font-size="9" fill="#475569" text-anchor="end">' +
          esc(layout.meta.slice(0, 2).join(" · ")) +
          "</text>"
      );
    }

    var cx = x + PAD;
    var cy = y + HEADER_H + PAD;
    var innerW = layout.w - PAD * 2;

    if (layout.children && layout.children.length) {
      layout.children.forEach(function (child, i) {
        if (i) cy += GAP;
        parts.push(
          '<path d="M ' +
            (x + 18) +
            " " +
            (y + HEADER_H) +
            " V " +
            (cy + 8) +
            " H " +
            cx +
            '" fill="none" stroke="#94a3b8" stroke-width="1.25" stroke-dasharray="3 3"/>'
        );
        drawNode(parts, child, cx, cy, Dossier);
        cy += child.h;
      });
    } else if (layout.pieces && layout.pieces.length) {
      drawPieces(parts, layout.pieces, cx, cy, innerW, Dossier);
    } else if (layout.role === "foncier" || layout.role === "bati" || layout.role === "niveau") {
      parts.push(
        '<text x="' +
          (cx + 4) +
          '" y="' +
          (cy + 12) +
          '" font-size="10" fill="#64748b" font-style="italic">Ajoutez un enfant (immeuble, étage, lot…)</text>'
      );
    }

    parts.push("</g>");
  }

  function renderSvg(tree, opts) {
    opts = opts || {};
    var Dossier = opts.Dossier || (typeof window !== "undefined" ? window.CrmImmoDossier : null);
    var Schema = opts.Schema || (typeof window !== "undefined" ? window.CrmImmoSchema : null);

    if (!tree || !tree.length) {
      return (
        '<div class="comp-draw-empty">' +
        "<p>Aucune unité à dessiner — structure conseillée : <b>terrain → immeuble → étage → lot → pièces</b>.</p>" +
        "</div>"
      );
    }

    var forest = measureForest(tree, Dossier, Schema);
    if (!forest) {
      return '<div class="comp-draw-empty"><p>Aucune unité à dessiner.</p></div>';
    }

    var width = Math.max(320, forest.w);
    var height = Math.max(80, forest.h);
    var parts = [
      '<svg class="comp-draw-svg" viewBox="0 0 ' +
        width +
        " " +
        height +
        '" width="100%" role="img" aria-label="Schéma intelligent terrain → bâti → étage → lot → pièces">',
    ];

    var y = PAD;
    forest.roots.forEach(function (rootLayout, i) {
      if (i) y += GAP * 2;
      var x = PAD + Math.max(0, (width - PAD * 2 - rootLayout.w) / 2);
      drawNode(parts, rootLayout, x, y, Dossier);
      y += rootLayout.h;
    });
    parts.push("</svg>");

    var flat = flattenTree(tree, 0, []);
    var roles = {};
    flat.forEach(function (r) {
      roles[roleOf(r.unit, Dossier)] = true;
    });
    var hasPieces = flat.some(function (r) {
      return piecesOf(r.unit, Dossier).length > 0;
    });

    var hint = "";
    if (roles.foncier && !roles.bati) {
      hint =
        '<p class="comp-draw-hint">Astuce : placez un <b>immeuble / maison</b> sous le terrain, puis des <b>étages</b> et des <b>lots</b> — le dessin s’empile niveau par niveau.</p>';
    } else if (roles.bati && !roles.niveau && roles.lot) {
      hint =
        '<p class="comp-draw-hint">Astuce : insérez des nœuds <b>Étage</b> entre le bâti et les lots pour un schéma plus clair.</p>';
    } else if (roles.lot && !hasPieces) {
      hint =
        '<p class="comp-draw-hint">Renseignez les <b>pièces</b> de chaque lot (chambre, séjour, cuisine…) pour les voir dans le dessin.</p>';
    }

    return (
      '<div class="comp-draw-wrap">' +
      '<div class="comp-draw-legend">' +
      '<span class="leg foncier">Terrain</span>' +
      '<span class="leg bati">Bâti</span>' +
      '<span class="leg niveau">Étage</span>' +
      '<span class="leg lot">Lot</span>' +
      '<span class="leg annexe">Annexe</span>' +
      '<span class="leg piece">Pièce</span>' +
      "</div>" +
      hint +
      parts.join("") +
      "</div>"
    );
  }

  function renderLegendAuthors(authors) {
    authors = authors || [];
    if (!authors.length) return "";
    return (
      '<div class="comp-author-legend">' +
      authors
        .map(function (a) {
          return (
            '<span class="comp-author-chip" style="--author:' +
            esc(a.color || "#64748b") +
            '"><i></i>' +
            esc(a.label || a.name || "Auteur") +
            "</span>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  return {
    ROLE_COLORS: ROLE_COLORS,
    renderSvg: renderSvg,
    renderLegendAuthors: renderLegendAuthors,
    flattenTree: flattenTree,
    roleOf: roleOf,
    measureForest: measureForest,
  };
});
