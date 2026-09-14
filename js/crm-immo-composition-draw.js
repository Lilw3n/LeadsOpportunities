/**
 * Dessin intelligent de composition immo (SVG).
 * Terrain → bâti → étages → lots — lisible mobile + desktop.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CrmImmoCompositionDraw = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var ROLE_COLORS = {
    foncier: { fill: "#dcfce7", stroke: "#15803d", text: "#14532d" },
    bati: { fill: "#e0f2fe", stroke: "#0369a1", text: "#0c4a6e" },
    niveau: { fill: "#f3e8ff", stroke: "#7c3aed", text: "#4c1d95" },
    lot: { fill: "#ffedd5", stroke: "#c2410c", text: "#7c2d12" },
    annexe: { fill: "#f1f5f9", stroke: "#64748b", text: "#334155" },
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function roleOf(unit, Dossier) {
    if (Dossier && Dossier.levelRole) return Dossier.levelRole(unit.type) || "lot";
    var t = String(unit.type || "");
    if (t === "terrain" || t === "parcelle") return "foncier";
    if (t === "immeuble" || t === "maison") return "bati";
    if (t === "etage") return "niveau";
    if (t === "dependance" || t === "cave" || t === "garage" || t === "parking") return "annexe";
    return "lot";
  }

  function labelOf(unit, Dossier) {
    if (Dossier && Dossier.unitLabel) return Dossier.unitLabel(unit);
    return unit.label || unit.type || "Lot";
  }

  function typeLabelOf(unit, Schema) {
    if (Schema && Schema.UNIT_TYPES) {
      var hit = Schema.UNIT_TYPES.find(function (x) {
        return x.id === unit.type;
      });
      if (hit) return hit.label;
    }
    return unit.type || "Lot";
  }

  function flattenTree(tree, depth, out) {
    out = out || [];
    (tree || []).forEach(function (node) {
      out.push({ unit: node.unit, children: node.children || [], depth: depth, childCount: (node.children || []).length });
      flattenTree(node.children || [], depth + 1, out);
    });
    return out;
  }

  /**
   * SVG arborescent intelligent : boîtes par rôle, connecteurs, badges occupation.
   */
  function renderSvg(tree, opts) {
    opts = opts || {};
    var Dossier = opts.Dossier || (typeof window !== "undefined" ? window.CrmImmoDossier : null);
    var Schema = opts.Schema || (typeof window !== "undefined" ? window.CrmImmoSchema : null);
    var flat = flattenTree(tree, 0, []);
    if (!flat.length) {
      return (
        '<div class="comp-draw-empty">' +
        "<p>Aucune unité à dessiner — ajoutez un terrain, un bâti ou un lot.</p>" +
        "</div>"
      );
    }

    var rowH = 56;
    var padX = 16;
    var padY = 20;
    var boxH = 44;
    var indent = 28;
    var maxDepth = 0;
    flat.forEach(function (row) {
      if (row.depth > maxDepth) maxDepth = row.depth;
    });
    var width = Math.max(320, 280 + maxDepth * indent + 40);
    var height = padY * 2 + flat.length * rowH;

    var svg =
      '<svg class="comp-draw-svg" viewBox="0 0 ' +
      width +
      " " +
      height +
      '" width="100%" role="img" aria-label="Schéma intelligent de composition du bien">';

    flat.forEach(function (row, i) {
      var u = row.unit;
      var role = roleOf(u, Dossier);
      var colors = ROLE_COLORS[role] || ROLE_COLORS.lot;
      var x = padX + row.depth * indent;
      var y = padY + i * rowH;
      var boxW = width - x - padX;
      var occ = u.occupation === "loue" || u.loue;
      var title = labelOf(u, Dossier);
      var typ = typeLabelOf(u, Schema);
      var metaBits = [];
      if (u.cadastre_ref || (u.cadastre_section && u.cadastre_numero)) {
        metaBits.push(u.cadastre_ref || [u.cadastre_section, u.cadastre_numero].join(" "));
      }
      if (u.surface_m2 || u.surface_carrez) metaBits.push((u.surface_carrez || u.surface_m2) + " m²");
      if (u.loyer_reel || u.loyer) metaBits.push((u.loyer_reel || u.loyer) + " €");
      if (row.childCount) metaBits.push(row.childCount + " enfant(s)");

      if (row.depth > 0) {
        var parentY = padY + (i - 1) * rowH;
        // soft connector toward parent column
        var cx = x - indent / 2;
        svg +=
          '<path d="M ' +
          (x - 8) +
          " " +
          (y + boxH / 2) +
          " H " +
          cx +
          '" fill="none" stroke="#94a3b8" stroke-width="1.5"/>';
      }

      svg +=
        '<g class="comp-draw-node" data-unit-id="' +
        esc(u.id) +
        '">' +
        '<rect x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        boxW +
        '" height="' +
        boxH +
        '" rx="10" fill="' +
        colors.fill +
        '" stroke="' +
        colors.stroke +
        '" stroke-width="1.75"/>' +
        '<text x="' +
        (x + 12) +
        '" y="' +
        (y + 18) +
        '" font-size="11" font-weight="700" fill="' +
        colors.text +
        '">' +
        esc(typ) +
        "</text>" +
        '<text x="' +
        (x + 12) +
        '" y="' +
        (y + 34) +
        '" font-size="13" font-weight="700" fill="#0f172a">' +
        esc(String(title).slice(0, 42)) +
        (String(title).length > 42 ? "…" : "") +
        "</text>";

      if (metaBits.length) {
        svg +=
          '<text x="' +
          (x + boxW - 12) +
          '" y="' +
          (y + 34) +
          '" font-size="10" fill="#475569" text-anchor="end">' +
          esc(metaBits.slice(0, 3).join(" · ")) +
          "</text>";
      }

      svg +=
        '<rect x="' +
        (x + boxW - 54) +
        '" y="' +
        (y + 8) +
        '" width="42" height="16" rx="8" fill="' +
        (occ ? "#166534" : "#64748b") +
        '"/>' +
        '<text x="' +
        (x + boxW - 33) +
        '" y="' +
        (y + 19.5) +
        '" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">' +
        (occ ? "LOUÉ" : "VIDE") +
        "</text></g>";
    });

    svg += "</svg>";
    return (
      '<div class="comp-draw-wrap">' +
      '<div class="comp-draw-legend">' +
      '<span class="leg foncier">Terrain</span>' +
      '<span class="leg bati">Bâti</span>' +
      '<span class="leg niveau">Étage</span>' +
      '<span class="leg lot">Lot</span>' +
      '<span class="leg annexe">Annexe</span>' +
      "</div>" +
      svg +
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
  };
});
