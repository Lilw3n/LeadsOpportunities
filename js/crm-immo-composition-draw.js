/**
 * Dessin architectural intelligent — terrain / maison / immeuble.
 * Vue « bâtiment » : étages empilés, lots côte à côte, pièces en mini-plan.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) module.exports = factory();
  else root.CrmImmoCompositionDraw = factory();
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  var ROLE_COLORS = {
    foncier: { fill: "#dcfce7", stroke: "#15803d", text: "#14532d", accent: "#86efac" },
    bati: { fill: "#e0f2fe", stroke: "#0369a1", text: "#0c4a6e", accent: "#7dd3fc" },
    niveau: { fill: "#f3e8ff", stroke: "#7c3aed", text: "#4c1d95", accent: "#d8b4fe" },
    lot: { fill: "#ffedd5", stroke: "#c2410c", text: "#7c2d12", accent: "#fdba74" },
    annexe: { fill: "#f1f5f9", stroke: "#64748b", text: "#334155", accent: "#cbd5e1" },
    piece: { fill: "#fff7ed", stroke: "#ea580c", text: "#9a3412", accent: "#fed7aa" },
  };

  var PAD = 16;
  var GAP = 12;
  var FLOOR_H = 88;
  var LOT_MIN_W = 110;
  var PIECE_H = 22;
  var PIECE_GAP = 4;
  var ROOF_H = 36;
  var GROUND_H = 28;
  var LABEL_H = 22;

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function roleOf(unit, Dossier) {
    var t = String((unit && unit.type) || "");
    /* Cave / garage / parking : dessin en annexe même si le dossier les traite en lot. */
    if (t === "dependance" || t === "cave" || t === "garage" || t === "parking") return "annexe";
    if (Dossier && Dossier.levelRole) return Dossier.levelRole(unit && unit.type) || "lot";
    if (t === "terrain" || t === "parcelle") return "foncier";
    if (t === "immeuble" || t === "maison") return "bati";
    if (t === "etage") return "niveau";
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

  function isOccupied(u) {
    return !!(u && (u.occupation === "loue" || u.loue === true || u.loue === "yes"));
  }

  function piecesOf(unit, Dossier) {
    if (!unit) return [];
    var list = unit.pieces_list || unit.rooms_list || [];
    if ((!list || !list.length) && Dossier && Dossier.seedPiecesFromCounters) {
      list = Dossier.seedPiecesFromCounters(unit) || [];
    }
    return Array.isArray(list) ? list.filter(Boolean) : [];
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

  function metaShort(unit) {
    var bits = [];
    if (!unit) return bits;
    if (unit.surface_carrez || unit.surface_m2) bits.push((unit.surface_carrez || unit.surface_m2) + " m²");
    if (unit.loyer_reel || unit.loyer || unit.loyer_hc) bits.push((unit.loyer_reel || unit.loyer || unit.loyer_hc) + " €");
    if (unit.lot_number) bits.push("lot " + unit.lot_number);
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

  function partitionChildren(node, Dossier) {
    var kids = (node && node.children) || [];
    var out = { batis: [], niveaux: [], lots: [], annexes: [], other: [] };
    kids.forEach(function (c) {
      var r = roleOf(c.unit, Dossier);
      if (r === "bati") out.batis.push(c);
      else if (r === "niveau") out.niveaux.push(c);
      else if (r === "annexe") out.annexes.push(c);
      else if (r === "lot") out.lots.push(c);
      else out.other.push(c);
    });
    return out;
  }

  function isMaison(unit) {
    return unit && String(unit.type) === "maison";
  }

  /** Rang d’étage pour empiler façade (haut → bas) : R+2 au-dessus de R+1 au-dessus du RDC. */
  function floorRank(floorNode) {
    var u = floorNode && floorNode.unit;
    var raw = String((u && (u.floor || u.label || u.name)) || "").toLowerCase().trim();
    if (/sous.?sol|\bss\b|cave|parking/.test(raw)) return -20;
    if (/rdc|rez|rdj|r\.?\s*d\.?\s*c/.test(raw)) return 0;
    var m = raw.match(/r\s*\+\s*(-?\d+)/) || raw.match(/r\s*-\s*(\d+)/) || raw.match(/(-?\d+)/);
    if (m) {
      if (/r\s*-/.test(raw)) return -Math.abs(Number(m[1]));
      return Number(m[1]);
    }
    return 0;
  }

  function sortFloorsTopFirst(floors) {
    return (floors || []).slice().sort(function (a, b) {
      return floorRank(b.node) - floorRank(a.node);
    });
  }

  /** Largeur d’un lot selon nb de pièces. */
  function lotWidth(unit, Dossier) {
    var pieces = piecesOf(unit, Dossier);
    var cols = Math.min(3, Math.max(1, pieces.length || 1));
    return Math.max(LOT_MIN_W, cols * 56 + 16);
  }

  function floorHeight(lots, Dossier) {
    var maxPieces = 0;
    (lots || []).forEach(function (n) {
      var nPieces = piecesOf(n.unit, Dossier).length;
      if (nPieces > maxPieces) maxPieces = nPieces;
    });
    var rows = Math.max(1, Math.ceil(Math.max(1, maxPieces) / 3));
    return Math.max(FLOOR_H, 36 + rows * (PIECE_H + PIECE_GAP) + 12);
  }

  function measureBuilding(batiNode, Dossier) {
    var parts = partitionChildren(batiNode, Dossier);
    var floors = [];
    if (parts.niveaux.length) {
      parts.niveaux.forEach(function (niv) {
        var np = partitionChildren(niv, Dossier);
        floors.push({
          node: niv,
          lots: np.lots.concat(np.other),
          annexes: np.annexes,
        });
      });
    } else {
      // lots directement sous le bâti → un « plateau »
      floors.push({
        node: null,
        lots: parts.lots.concat(parts.other),
        annexes: [],
      });
    }
    // annexes du bâti (caves, garages) sous le RDC
    var annexes = parts.annexes.slice();
    floors.forEach(function (f) {
      annexes = annexes.concat(f.annexes || []);
    });

    var maison = isMaison(batiNode.unit);
    var maxFloorW = LOT_MIN_W * 2;
    floors.forEach(function (f) {
      var w = 8;
      (f.lots || []).forEach(function (lot, i) {
        w += lotWidth(lot.unit, Dossier) + (i ? 6 : 0);
      });
      if (!(f.lots || []).length) w = LOT_MIN_W * 2;
      f.h = floorHeight(f.lots, Dossier);
      f.w = Math.max(LOT_MIN_W * 2, w + 16);
      if (f.w > maxFloorW) maxFloorW = f.w;
    });
    floors.forEach(function (f) {
      f.w = maxFloorW;
    });

    var annexRowH = annexes.length ? 52 : 0;
    var annexW = annexes.length
      ? Math.max(maxFloorW, annexes.length * 90 + (annexes.length - 1) * 6 + 16)
      : maxFloorW;

    var bodyH = 0;
    floors.forEach(function (f) {
      bodyH += f.h;
    });
    var roofH = maison ? ROOF_H + 8 : ROOF_H;
    var w = Math.max(maxFloorW, annexW) + 24;
    var h = LABEL_H + roofH + bodyH + annexRowH + GROUND_H + 8;

    return {
      kind: "building",
      node: batiNode,
      maison: maison,
      floors: floors,
      annexes: annexes,
      roofH: roofH,
      annexRowH: annexRowH,
      bodyH: bodyH,
      w: w,
      h: h,
    };
  }

  function measureTerrain(node, Dossier) {
    var parts = partitionChildren(node, Dossier);
    var buildings = parts.batis.map(function (b) {
      return measureBuilding(b, Dossier);
    });
    /* Lots / étages / annexes directement sur la parcelle → enveloppe virtuelle. */
    var looseKids = parts.niveaux.concat(parts.lots).concat(parts.other).concat(parts.annexes);
    if (looseKids.length) {
      buildings.push(
        measureBuilding(
          {
            unit: {
              id: ((node.unit && node.unit.id) || "t") + "_enveloppe",
              type: "immeuble",
              label: "Volumes sur parcelle",
            },
            children: looseKids,
          },
          Dossier
        )
      );
    }

    var innerW = 200;
    var innerH = 0;
    buildings.forEach(function (b, i) {
      if (b.w > innerW) innerW = b.w;
      innerH += b.h + (i ? GAP : 0);
    });
    if (!buildings.length) innerH = 40;

    return {
      kind: "terrain",
      node: node,
      buildings: buildings,
      w: innerW + PAD * 2 + 8,
      h: LABEL_H + 10 + innerH + GROUND_H + PAD,
    };
  }

  function measureRoot(node, Dossier) {
    var role = roleOf(node.unit, Dossier);
    if (role === "foncier") return measureTerrain(node, Dossier);
    if (role === "bati") return measureBuilding(node, Dossier);
    // lot or other alone → fake small building
    return measureBuilding({ unit: { id: "solo", type: "maison", label: labelOf(node.unit, Dossier) }, children: [node] }, Dossier);
  }

  function drawBadge(parts, x, y, occ) {
    parts.push(
      '<rect x="' +
        x +
        '" y="' +
        y +
        '" width="38" height="14" rx="7" fill="' +
        (occ ? "#166534" : "#64748b") +
        '"/>' +
        '<text x="' +
        (x + 19) +
        '" y="' +
        (y + 10.5) +
        '" font-size="8" font-weight="700" fill="#fff" text-anchor="middle">' +
        (occ ? "LOUÉ" : "VIDE") +
        "</text>"
    );
  }

  function drawPiecesGrid(parts, pieces, x, y, innerW, Dossier) {
    if (!pieces.length) {
      parts.push(
        '<text x="' +
          (x + 6) +
          '" y="' +
          (y + 14) +
          '" font-size="9" fill="#94a3b8" font-style="italic">Pièces non renseignées</text>'
      );
      return;
    }
    var cols = Math.min(3, pieces.length);
    var pieceW = Math.floor((innerW - (cols - 1) * PIECE_GAP) / cols);
    var colors = ROLE_COLORS.piece;
    pieces.forEach(function (p, i) {
      var col = i % cols;
      var row = Math.floor(i / cols);
      var px = x + col * (pieceW + PIECE_GAP);
      var py = y + row * (PIECE_H + PIECE_GAP);
      var lab = pieceLabel(p, Dossier);
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
          '" rx="4" fill="' +
          colors.fill +
          '" stroke="' +
          colors.stroke +
          '" stroke-width="1"/>' +
          '<text x="' +
          (px + 5) +
          '" y="' +
          (py + 14) +
          '" font-size="9" font-weight="700" fill="' +
          colors.text +
          '">' +
          esc(String(lab).slice(0, 14)) +
          (String(lab).length > 14 ? "…" : "") +
          "</text></g>"
      );
    });
  }

  function drawLot(parts, lotNode, x, y, w, h, Dossier, Schema) {
    var u = lotNode.unit || {};
    var colors = ROLE_COLORS.lot;
    var pieces = piecesOf(u, Dossier);
    var occ = isOccupied(u);
    var title = labelOf(u, Dossier);
    var typ = typeLabelOf(u, Schema);
    var meta = metaShort(u);

    parts.push(
      '<g class="comp-draw-lot" data-unit-id="' +
        esc(u.id) +
        '" data-role="lot">' +
        '<rect x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        w +
        '" height="' +
        h +
        '" rx="6" fill="' +
        colors.fill +
        '" stroke="' +
        colors.stroke +
        '" stroke-width="1.5"/>' +
        // fenêtre façade
        '<rect x="' +
        (x + 8) +
        '" y="' +
        (y + 6) +
        '" width="18" height="14" rx="2" fill="#bae6fd" stroke="#0284c7" stroke-width="1"/>' +
        '<line x1="' +
        (x + 17) +
        '" y1="' +
        (y + 6) +
        '" x2="' +
        (x + 17) +
        '" y2="' +
        (y + 20) +
        '" stroke="#0284c7" stroke-width="1"/>' +
        '<text x="' +
        (x + 32) +
        '" y="' +
        (y + 12) +
        '" font-size="9" font-weight="700" fill="' +
        colors.text +
        '">' +
        esc(String(typ).slice(0, 16)) +
        "</text>" +
        '<text x="' +
        (x + 32) +
        '" y="' +
        (y + 24) +
        '" font-size="11" font-weight="800" fill="#0f172a">' +
        esc(String(title).slice(0, 18)) +
        (String(title).length > 18 ? "…" : "") +
        "</text>"
    );
    drawBadge(parts, x + w - 44, y + 6, occ);
    if (meta.length) {
      parts.push(
        '<text x="' +
          (x + 8) +
          '" y="' +
          (y + 36) +
          '" font-size="8" fill="#64748b">' +
          esc(meta.slice(0, 2).join(" · ")) +
          "</text>"
      );
    }
    drawPiecesGrid(parts, pieces, x + 6, y + 42, w - 12, Dossier);
    parts.push("</g>");
  }

  function drawAnnex(parts, node, x, y, w, Dossier, Schema) {
    var u = node.unit || {};
    var colors = ROLE_COLORS.annexe;
    parts.push(
      '<g class="comp-draw-annexe" data-unit-id="' +
        esc(u.id) +
        '" data-role="annexe">' +
        '<rect x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        w +
        '" height="40" rx="6" fill="' +
        colors.fill +
        '" stroke="' +
        colors.stroke +
        '" stroke-width="1.5"/>' +
        '<text x="' +
        (x + 8) +
        '" y="' +
        (y + 16) +
        '" font-size="9" font-weight="700" fill="' +
        colors.text +
        '">' +
        esc(typeLabelOf(u, Schema)) +
        "</text>" +
        '<text x="' +
        (x + 8) +
        '" y="' +
        (y + 30) +
        '" font-size="11" font-weight="700" fill="#0f172a">' +
        esc(String(labelOf(u, Dossier)).slice(0, 16)) +
        "</text></g>"
    );
  }

  function drawRoof(parts, x, y, w, maison) {
    var colors = ROLE_COLORS.bati;
    if (maison) {
      // toit à 2 pans
      var peakX = x + w / 2;
      var peakY = y;
      var baseY = y + ROOF_H;
      parts.push(
        '<path d="M ' +
          x +
          " " +
          baseY +
          " L " +
          peakX +
          " " +
          peakY +
          " L " +
          (x + w) +
          " " +
          baseY +
          ' Z" fill="#9a3412" stroke="#7c2d12" stroke-width="1.5"/>' +
          '<path d="M ' +
          (x + 8) +
          " " +
          baseY +
          " L " +
          peakX +
          " " +
          (peakY + 6) +
          " L " +
          (x + w - 8) +
          " " +
          baseY +
          ' Z" fill="#c2410c" opacity="0.85"/>'
      );
    } else {
      // acrotère immeuble + antenne légère
      parts.push(
        '<rect x="' +
          x +
          '" y="' +
          (y + 10) +
          '" width="' +
          w +
          '" height="' +
          (ROOF_H - 10) +
          '" rx="2" fill="#cbd5e1" stroke="' +
          colors.stroke +
          '" stroke-width="1.5"/>' +
          '<rect x="' +
          (x + 12) +
          '" y="' +
          y +
          '" width="22" height="14" rx="2" fill="#94a3b8" stroke="#64748b"/>' +
          '<line x1="' +
          (x + w - 20) +
          '" y1="' +
          (y + ROOF_H) +
          '" x2="' +
          (x + w - 20) +
          '" y2="' +
          (y + 4) +
          '" stroke="#64748b" stroke-width="2"/>' +
          '<circle cx="' +
          (x + w - 20) +
          '" cy="' +
          (y + 4) +
          '" r="3" fill="#64748b"/>'
      );
    }
  }

  function drawBuilding(parts, layout, x, y, Dossier, Schema) {
    var u = (layout.node && layout.node.unit) || {};
    var colors = ROLE_COLORS.bati;
    var title = labelOf(u, Dossier);
    var cx = x + 12;
    var cy = y;

    parts.push(
      '<g class="comp-draw-building" data-unit-id="' +
        esc(u.id) +
        '" data-role="bati">' +
        '<text x="' +
        cx +
        '" y="' +
        (cy + 14) +
        '" font-size="11" font-weight="800" fill="' +
        colors.text +
        '">' +
        esc((layout.maison ? "Maison — " : "Immeuble — ") + String(title).slice(0, 32)) +
        "</text>"
    );
    cy += LABEL_H;

    var bodyW = layout.w - 24;
    var bodyX = cx;
    drawRoof(parts, bodyX, cy, bodyW, layout.maison);
    cy += layout.roofH;

    // façades étages — du haut (dernier) vers le bas (RDC) pour lecture architecturale
    var floorsTopFirst = sortFloorsTopFirst(layout.floors);
    floorsTopFirst.forEach(function (floor, fi) {
      var fh = floor.h;
      var floorLabel =
        floor.node && floor.node.unit
          ? labelOf(floor.node.unit, Dossier)
          : fi === floorsTopFirst.length - 1
            ? "RDC"
            : "Niveau";
      parts.push(
        '<g class="comp-draw-floor" data-role="niveau">' +
          '<rect x="' +
          bodyX +
          '" y="' +
          cy +
          '" width="' +
          bodyW +
          '" height="' +
          fh +
          '" fill="#f8fafc" stroke="' +
          colors.stroke +
          '" stroke-width="1.75"/>' +
          '<rect x="' +
          bodyX +
          '" y="' +
          cy +
          '" width="22" height="' +
          fh +
          '" fill="' +
          ROLE_COLORS.niveau.fill +
          '" stroke="' +
          ROLE_COLORS.niveau.stroke +
          '" stroke-width="1"/>' +
          '<text transform="translate(' +
          (bodyX + 14) +
          " " +
          (cy + fh / 2) +
          ') rotate(-90)" font-size="9" font-weight="700" fill="' +
          ROLE_COLORS.niveau.text +
          '" text-anchor="middle">' +
          esc(String(floorLabel).slice(0, 18)) +
          "</text>"
      );

      var lots = floor.lots || [];
      var lx = bodyX + 28;
      var avail = bodyW - 36;
      if (!lots.length) {
        parts.push(
          '<text x="' +
            (lx + 8) +
            '" y="' +
            (cy + 28) +
            '" font-size="10" fill="#94a3b8" font-style="italic">Aucun lot à cet étage</text>'
        );
      } else {
        var totalLotW = 0;
        var widths = lots.map(function (n) {
          var ww = lotWidth(n.unit, Dossier);
          totalLotW += ww;
          return ww;
        });
        totalLotW += (lots.length - 1) * 6;
        var scale = totalLotW > avail ? avail / totalLotW : 1;
        lots.forEach(function (lot, i) {
          var lw = Math.max(72, widths[i] * scale);
          drawLot(parts, lot, lx, cy + 6, lw, fh - 12, Dossier, Schema);
          lx += lw + 6;
        });
      }
      parts.push("</g>");
      cy += fh;
    });

    if (layout.annexes && layout.annexes.length) {
      var ax = bodyX;
      var aw = Math.floor((bodyW - (layout.annexes.length - 1) * 6) / layout.annexes.length);
      layout.annexes.forEach(function (a, i) {
        drawAnnex(parts, a, ax + i * (aw + 6), cy + 4, aw, Dossier, Schema);
      });
      cy += layout.annexRowH;
    }

    // sol / soubassement
    parts.push(
      '<rect x="' +
        bodyX +
        '" y="' +
        cy +
        '" width="' +
        bodyW +
        '" height="10" fill="#78716c" stroke="#57534e" stroke-width="1"/>' +
        "</g>"
    );
  }

  function drawTerrain(parts, layout, x, y, Dossier, Schema) {
    var u = (layout.node && layout.node.unit) || {};
    var colors = ROLE_COLORS.foncier;
    var title = labelOf(u, Dossier);

    parts.push(
      '<g class="comp-draw-terrain" data-unit-id="' +
        esc(u.id) +
        '" data-role="foncier">' +
        // parcelle
        '<rect x="' +
        x +
        '" y="' +
        y +
        '" width="' +
        layout.w +
        '" height="' +
        layout.h +
        '" rx="14" fill="' +
        colors.fill +
        '" stroke="' +
        colors.stroke +
        '" stroke-width="2.5"/>' +
        // motif herbe léger
        '<path d="M ' +
        (x + 12) +
        " " +
        (y + layout.h - 14) +
        " q 8 -10 16 0 q 8 -10 16 0 q 8 -10 16 0" +
        '" fill="none" stroke="' +
        colors.accent +
        '" stroke-width="2" opacity="0.7"/>' +
        '<text x="' +
        (x + 16) +
        '" y="' +
        (y + 18) +
        '" font-size="12" font-weight="800" fill="' +
        colors.text +
        '">Terrain — ' +
        esc(String(title).slice(0, 36)) +
        "</text>"
    );

    var bx = x + PAD;
    var by = y + LABEL_H + 8;
    if (!layout.buildings.length) {
      parts.push(
        '<text x="' +
          (bx + 8) +
          '" y="' +
          (by + 24) +
          '" font-size="11" fill="#64748b" font-style="italic">Ajoutez un immeuble / une maison, puis étages et lots</text>'
      );
    } else {
      layout.buildings.forEach(function (b, i) {
        if (i) by += GAP;
        drawBuilding(parts, b, bx, by, Dossier, Schema);
        by += b.h;
      });
    }
    parts.push("</g>");
  }

  function drawLayout(parts, layout, x, y, Dossier, Schema) {
    if (layout.kind === "terrain") drawTerrain(parts, layout, x, y, Dossier, Schema);
    else drawBuilding(parts, layout, x, y, Dossier, Schema);
  }

  function structureHint(tree, Dossier) {
    var flat = flattenTree(tree, 0, []);
    var roles = {};
    flat.forEach(function (r) {
      roles[roleOf(r.unit, Dossier)] = true;
    });
    var hasPieces = flat.some(function (r) {
      return piecesOf(r.unit, Dossier).length > 0;
    });
    if (roles.foncier && !roles.bati) {
      return "Astuce : ajoutez un <b>immeuble</b> ou une <b>maison</b> sur le terrain, puis des <b>étages</b> et des <b>appartements</b>.";
    }
    if (roles.bati && !roles.niveau && roles.lot) {
      return "Astuce : créez des nœuds <b>Étage</b> pour empiler les lots comme une vraie façade.";
    }
    if (roles.lot && !hasPieces) {
      return "Renseignez les <b>pièces</b> de chaque lot (salon, chambres…) pour les voir dans le plan.";
    }
    return "";
  }

  /**
   * SVG architectural : parcelle → bâtiment(s) → étages → lots → pièces.
   */
  function renderSvg(tree, opts) {
    opts = opts || {};
    var Dossier = opts.Dossier || (typeof window !== "undefined" ? window.CrmImmoDossier : null);
    var Schema = opts.Schema || (typeof window !== "undefined" ? window.CrmImmoSchema : null);

    if (!tree || !tree.length) {
      return (
        '<div class="comp-draw-empty">' +
        "<p>Aucune unité — structure conseillée : <b>terrain → immeuble/maison → étage → lot → pièces</b>.</p>" +
        "</div>"
      );
    }

    var layouts = tree.map(function (n) {
      return measureRoot(n, Dossier);
    });
    var width = PAD * 2;
    var height = PAD * 2;
    layouts.forEach(function (L, i) {
      if (L.w + PAD * 2 > width) width = L.w + PAD * 2;
      height += L.h + (i ? GAP * 2 : 0);
    });
    width = Math.max(320, width);
    height = Math.max(120, height);

    var parts = [
      '<svg class="comp-draw-svg" viewBox="0 0 ' +
        width +
        " " +
        height +
        '" width="100%" role="img" aria-label="Dessin architectural du bien : terrain, bâtiment, étages, lots et pièces">',
    ];

    var y = PAD;
    layouts.forEach(function (L, i) {
      if (i) y += GAP * 2;
      var x = PAD + Math.max(0, (width - PAD * 2 - L.w) / 2);
      drawLayout(parts, L, x, y, Dossier, Schema);
      y += L.h;
    });
    parts.push("</svg>");

    var hint = structureHint(tree, Dossier);

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
      (hint ? '<p class="comp-draw-hint">' + hint + "</p>" : "") +
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
  };
});
