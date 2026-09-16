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

  var PAD = 20;
  var GAP = 14;
  var FLOOR_H = 88;
  var LOT_MIN_W = 118;
  var LOT_MAX_PER_ROW = 2;
  var SIDEBAR_W = 26;
  var BODY_INSET = 10;
  var PIECE_H = 22;
  var PIECE_GAP = 4;
  var ROOF_H = 36;
  var GROUND_H = 18;
  var LABEL_H = 22;
  var VIEW_MARGIN = 8;

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

  /** Texte brut d’étage sur une unité (champ Étage, alias, ou libellé cave/-1). */
  function unitFloorRaw(unit) {
    if (!unit) return "";
    var fromDetails = unit.details && (unit.details.etage || unit.details.floor);
    var raw = String(
      unit.floor != null && String(unit.floor).trim() !== ""
        ? unit.floor
        : unit.etage != null && String(unit.etage).trim() !== ""
          ? unit.etage
          : fromDetails || ""
    ).trim();
    if (raw) return raw;
    var lab = String(unit.label || unit.name || "").trim();
    if (/^-?\d+$/.test(lab) || /^(rdc|rdj|ss|sous.?sol)$/i.test(lab)) return lab;
    var m = lab.match(/(?:etage|étage|niv(?:eau)?|cave|ss)\s*[:=]?\s*(-?\d+|rdc|rdj)/i);
    if (m) return m[1];
    if (/cave|sous.?sol|\bss\b/i.test(lab) || /cave|garage|parking|dependance|dépendance/i.test(String(unit.type || ""))) {
      return "-1";
    }
    return "";
  }

  /** Rang numérique : R+2 > R+1 > RDC(0) > -1 (cave). */
  function parseFloorRank(raw, unit) {
    var t = String(raw || "").toLowerCase().trim();
    var typ = String((unit && unit.type) || "").toLowerCase();
    if (!t) {
      if (typ === "cave" || typ === "garage" || typ === "parking" || typ === "dependance") return -1;
      return 0;
    }
    if (/sous.?sol|\bss\b|cave|parking|garage/.test(t) && !/^\d+$/.test(t)) return -1;
    if (/rdc|rez|rdj|r\.?\s*d\.?\s*c/.test(t)) return 0;
    var m = t.match(/r\s*\+\s*(-?\d+)/) || t.match(/r\s*-\s*(\d+)/) || t.match(/^(-?\d+)/) || t.match(/(-?\d+)/);
    if (m) {
      if (/r\s*-/.test(t) && !/r\s*\+/.test(t)) return -Math.abs(Number(m[1]));
      return Number(m[1]);
    }
    return 0;
  }

  function floorRank(floorNode) {
    if (floorNode && floorNode._rank != null) return floorNode._rank;
    var u = floorNode && floorNode.unit;
    return parseFloorRank(unitFloorRaw(u) || (u && (u.label || u.name)) || "", u);
  }

  function floorDisplayLabel(rank, raw, unit) {
    var t = String(raw || "").trim();
    if (t && !/^-?\d+$/.test(t) && !/^r\+?-?\d+$/i.test(t)) {
      if (/cave|sous.?sol|\bss\b/i.test(t)) return "Cave / -1";
      if (/rdc|rez|rdj/i.test(t)) return "RDC";
      return t.slice(0, 18);
    }
    if (rank < 0) {
      var typ = String((unit && unit.type) || "").toLowerCase();
      if (typ === "cave" || /cave/i.test(String((unit && unit.label) || ""))) return "Cave / " + rank;
      return "Niveau " + rank;
    }
    if (rank === 0) return "RDC";
    return "R+" + rank;
  }

  function sortFloorsTopFirst(floors) {
    return (floors || []).slice().sort(function (a, b) {
      var ra = a.rank != null ? a.rank : floorRank(a.node);
      var rb = b.rank != null ? b.rank : floorRank(b.node);
      return rb - ra;
    });
  }

  /** Regroupe lots / annexes par champ Étage quand il n’y a pas de nœuds « étage ». */
  function groupNodesByFloor(nodes) {
    var buckets = {};
    var order = [];
    (nodes || []).forEach(function (n) {
      var u = n.unit || {};
      var raw = unitFloorRaw(u);
      var rank = parseFloorRank(raw, u);
      var key = String(rank);
      if (!buckets[key]) {
        buckets[key] = {
          rank: rank,
          raw: raw,
          lots: [],
          annexes: [],
          sample: u,
        };
        order.push(key);
      }
      var role = roleOf(u, null);
      if (role === "annexe") buckets[key].annexes.push(n);
      else buckets[key].lots.push(n);
    });
    return order
      .map(function (k) {
        return buckets[k];
      })
      .sort(function (a, b) {
        return b.rank - a.rank;
      });
  }

  /** Largeur d’un lot selon nb de pièces. */
  function lotWidth(unit, Dossier) {
    var pieces = piecesOf(unit, Dossier);
    var cols = Math.min(3, Math.max(1, pieces.length || 1));
    return Math.max(LOT_MIN_W, cols * 58 + 18);
  }

  function floorLotRows(lots) {
    var list = lots || [];
    var rows = [];
    for (var i = 0; i < list.length; i += LOT_MAX_PER_ROW) {
      rows.push(list.slice(i, i + LOT_MAX_PER_ROW));
    }
    return rows.length ? rows : [[]];
  }

  function floorHeight(lots, Dossier) {
    var rows = floorLotRows(lots);
    var maxPieceRows = 1;
    (lots || []).forEach(function (n) {
      var nPieces = piecesOf(n.unit, Dossier).length;
      var pr = Math.max(1, Math.ceil(Math.max(1, nPieces) / 3));
      if (pr > maxPieceRows) maxPieceRows = pr;
    });
    var lotBlock = 40 + maxPieceRows * (PIECE_H + PIECE_GAP);
    var h = 10 + rows.length * (lotBlock + 8);
    return Math.max(FLOOR_H, h);
  }

  function measureFloorWidth(lots, Dossier) {
    var rows = floorLotRows(lots);
    var maxW = LOT_MIN_W * 2;
    rows.forEach(function (row) {
      var w = 0;
      row.forEach(function (lot, i) {
        w += lotWidth(lot.unit, Dossier) + (i ? 6 : 0);
      });
      if (!row.length) w = LOT_MIN_W * 2;
      w += SIDEBAR_W + BODY_INSET * 2 + 8;
      if (w > maxW) maxW = w;
    });
    return maxW;
  }

  function measureBuilding(batiNode, Dossier) {
    var parts = partitionChildren(batiNode, Dossier);
    var floors = [];
    var annexes = [];

    if (parts.niveaux.length) {
      parts.niveaux.forEach(function (niv) {
        var np = partitionChildren(niv, Dossier);
        var rank = floorRank(niv);
        floors.push({
          node: niv,
          rank: rank,
          label: floorDisplayLabel(rank, unitFloorRaw(niv.unit) || labelOf(niv.unit, Dossier), niv.unit),
          lots: np.lots.concat(np.other),
          annexes: np.annexes,
        });
      });
      /* Annexes du bâti avec un étage (ex. cave -1) → niveau dédié, sinon bandeau. */
      var annexByFloor = groupNodesByFloor(parts.annexes);
      annexByFloor.forEach(function (b) {
        if (b.rank < 0 || b.raw) {
          floors.push({
            node: {
              unit: {
                id: "synth_annexe_" + b.rank,
                type: "etage",
                label: floorDisplayLabel(b.rank, b.raw, b.sample),
                floor: b.raw || String(b.rank),
                _rank: b.rank,
              },
              children: b.annexes,
            },
            rank: b.rank,
            label: floorDisplayLabel(b.rank, b.raw, b.sample),
            lots: b.annexes,
            annexes: [],
            inferred: true,
          });
        } else {
          annexes = annexes.concat(b.annexes);
        }
      });
    } else {
      /* Pas de nœuds Étage : empiler via le champ « Étage » des lots / annexes. */
      var grouped = groupNodesByFloor(parts.lots.concat(parts.other).concat(parts.annexes));
      var distinct = grouped.filter(function (b) {
        return b.raw !== "" || b.rank !== 0 || grouped.length === 1;
      });
      /* Si plusieurs rangs distincts (ex. -1, 0, 1, 2, 3) → une rangée par étage. */
      var ranks = {};
      grouped.forEach(function (b) {
        ranks[b.rank] = true;
      });
      var multi = Object.keys(ranks).length > 1;
      if (multi || grouped.some(function (b) {
        return b.raw !== "";
      })) {
        grouped.forEach(function (b) {
          floors.push({
            node: {
              unit: {
                id: "synth_floor_" + b.rank,
                type: "etage",
                label: floorDisplayLabel(b.rank, b.raw, b.sample),
                floor: b.raw || String(b.rank),
                _rank: b.rank,
              },
              children: b.lots.concat(b.annexes),
            },
            rank: b.rank,
            label: floorDisplayLabel(b.rank, b.raw, b.sample),
            lots: b.lots.concat(b.annexes),
            annexes: [],
            inferred: true,
          });
        });
      } else {
        floors.push({
          node: null,
          rank: 0,
          label: "RDC",
          lots: parts.lots.concat(parts.other),
          annexes: [],
        });
        annexes = parts.annexes.slice();
      }
    }

    floors.forEach(function (f) {
      annexes = annexes.concat(f.annexes || []);
      f.annexes = [];
    });

    var maison = isMaison(batiNode.unit);
    var maxFloorW = LOT_MIN_W * 2 + SIDEBAR_W;
    floors.forEach(function (f) {
      f.h = floorHeight(f.lots, Dossier);
      f.w = measureFloorWidth(f.lots, Dossier);
      if (f.w > maxFloorW) maxFloorW = f.w;
    });
    floors.forEach(function (f) {
      f.w = maxFloorW;
    });

    var annexRowH = annexes.length ? 48 : 0;
    var annexW = annexes.length
      ? Math.max(maxFloorW, annexes.length * 96 + (annexes.length - 1) * 6 + SIDEBAR_W + BODY_INSET * 2)
      : maxFloorW;

    var bodyH = 0;
    floors.forEach(function (f) {
      bodyH += f.h;
    });
    var roofH = maison ? ROOF_H + 8 : ROOF_H;
    var w = Math.max(maxFloorW, annexW) + BODY_INSET * 2;
    var h = LABEL_H + roofH + bodyH + annexRowH + GROUND_H + BODY_INSET;

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
      inferredFloors: floors.some(function (f) {
        return f.inferred;
      }),
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
      h: LABEL_H + 16 + innerH + GROUND_H + PAD + 8,
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
    var showTyp = typ && String(typ).toLowerCase() !== String(title).toLowerCase();

    var titleMax = w >= 100 ? 14 : w >= 70 ? 12 : 18;
    var titleY = y + (showTyp ? 24 : 16);
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
        (showTyp
          ? '<text x="' +
            (x + 32) +
            '" y="' +
            (y + 12) +
            '" font-size="9" font-weight="700" fill="' +
            colors.text +
            '">' +
            esc(String(typ).slice(0, 12)) +
            "</text>"
          : "") +
        '<text x="' +
        (x + 32) +
        '" y="' +
        titleY +
        '" font-size="11" font-weight="800" fill="#0f172a">' +
        esc(String(title).slice(0, titleMax)) +
        (String(title).length > titleMax ? "…" : "") +
        "</text>"
    );
    if (w >= 100) drawBadge(parts, x + w - 44, y + 6, occ);
    else if (w >= 70) drawBadge(parts, x + w - 40, y + 6, occ);
    if (meta.length) {
      parts.push(
        '<text x="' +
          (x + 8) +
          '" y="' +
          (y + (showTyp ? 36 : 30)) +
          '" font-size="8" fill="#64748b">' +
          esc(meta.slice(0, 2).join(" · ")) +
          "</text>"
      );
    }
    drawPiecesGrid(parts, pieces, x + 6, y + (showTyp ? 42 : 36), Math.max(40, w - 12), Dossier);
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
    var inset = 2;
    if (maison) {
      var peakX = x + w / 2;
      var peakY = y + 2;
      var baseY = y + ROOF_H;
      parts.push(
        '<path d="M ' +
          (x + inset) +
          " " +
          baseY +
          " L " +
          peakX +
          " " +
          peakY +
          " L " +
          (x + w - inset) +
          " " +
          baseY +
          ' Z" fill="#9a3412" stroke="#7c2d12" stroke-width="1.5"/>' +
          '<path d="M ' +
          (x + 10) +
          " " +
          baseY +
          " L " +
          peakX +
          " " +
          (peakY + 6) +
          " L " +
          (x + w - 10) +
          " " +
          baseY +
          ' Z" fill="#c2410c" opacity="0.85"/>'
      );
    } else {
      parts.push(
        '<rect x="' +
          (x + inset) +
          '" y="' +
          (y + 12) +
          '" width="' +
          (w - inset * 2) +
          '" height="' +
          (ROOF_H - 12) +
          '" rx="2" fill="#cbd5e1" stroke="' +
          colors.stroke +
          '" stroke-width="1.5"/>' +
          '<rect x="' +
          (x + 14) +
          '" y="' +
          (y + 4) +
          '" width="22" height="14" rx="2" fill="#94a3b8" stroke="#64748b"/>' +
          '<line x1="' +
          (x + w - 28) +
          '" y1="' +
          (y + ROOF_H) +
          '" x2="' +
          (x + w - 28) +
          '" y2="' +
          (y + 8) +
          '" stroke="#64748b" stroke-width="2"/>' +
          '<circle cx="' +
          (x + w - 28) +
          '" cy="' +
          (y + 8) +
          '" r="3" fill="#64748b"/>'
      );
    }
  }

  function drawBuilding(parts, layout, x, y, Dossier, Schema) {
    var u = (layout.node && layout.node.unit) || {};
    var colors = ROLE_COLORS.bati;
    var title = labelOf(u, Dossier);
    var cx = x + BODY_INSET;
    var cy = y + 2;

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

    var bodyW = layout.w - BODY_INSET * 2;
    var bodyX = cx;
    drawRoof(parts, bodyX, cy, bodyW, layout.maison);
    cy += layout.roofH;

    var floorsTopFirst = sortFloorsTopFirst(layout.floors);
    floorsTopFirst.forEach(function (floor, fi) {
      var fh = floor.h;
      var floorLabel =
        floor.label ||
        (floor.node && floor.node.unit
          ? floorDisplayLabel(floor.rank != null ? floor.rank : floorRank(floor.node), unitFloorRaw(floor.node.unit), floor.node.unit)
          : fi === floorsTopFirst.length - 1
            ? "RDC"
            : "Niveau");
      parts.push(
        '<g class="comp-draw-floor" data-role="niveau" data-floor="' +
          esc(floorLabel) +
          '">' +
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
          '" stroke-width="1.5"/>' +
          '<rect x="' +
          (bodyX + 1) +
          '" y="' +
          (cy + 1) +
          '" width="' +
          (SIDEBAR_W - 2) +
          '" height="' +
          (fh - 2) +
          '" fill="' +
          ROLE_COLORS.niveau.fill +
          '" stroke="' +
          ROLE_COLORS.niveau.stroke +
          '" stroke-width="1"/>' +
          '<text transform="translate(' +
          (bodyX + SIDEBAR_W / 2 + 1) +
          " " +
          (cy + fh / 2) +
          ') rotate(-90)" font-size="9" font-weight="700" fill="' +
          ROLE_COLORS.niveau.text +
          '" text-anchor="middle">' +
          esc(String(floorLabel).slice(0, 18)) +
          "</text>"
      );

      var lots = floor.lots || [];
      var contentX = bodyX + SIDEBAR_W + 6;
      var avail = bodyW - SIDEBAR_W - 14;
      if (!lots.length) {
        parts.push(
          '<text x="' +
            (contentX + 8) +
            '" y="' +
            (cy + 28) +
            '" font-size="10" fill="#94a3b8" font-style="italic">Aucun lot à cet étage</text>'
        );
      } else {
        var rows = floorLotRows(lots);
        var rowH = (fh - 10) / rows.length;
        rows.forEach(function (row, ri) {
          var lx = contentX;
          var widths = row.map(function (n) {
            return lotWidth(n.unit, Dossier);
          });
          var totalLotW = widths.reduce(function (a, b) {
            return a + b;
          }, 0) + Math.max(0, row.length - 1) * 6;
          var scale = totalLotW > avail ? avail / totalLotW : 1;
          var used = 0;
          row.forEach(function (lot, i) {
            var isLast = i === row.length - 1;
            var lw = isLast
              ? Math.max(48, avail - used)
              : Math.max(48, Math.floor(widths[i] * scale));
            if (!isLast && used + lw + 6 > avail) lw = Math.max(48, avail - used - 6);
            used += lw + (isLast ? 0 : 6);
            var role = roleOf(lot.unit, Dossier);
            var ly = cy + 5 + ri * rowH;
            var lh = Math.max(56, rowH - 8);
            if (role === "annexe") drawAnnex(parts, lot, lx, ly, lw, Dossier, Schema);
            else drawLot(parts, lot, lx, ly, lw, lh, Dossier, Schema);
            lx += lw + (isLast ? 0 : 6);
          });
        });
      }
      parts.push("</g>");
      cy += fh;
    });

    if (layout.annexes && layout.annexes.length) {
      var ax = bodyX + 4;
      var aw = Math.floor((bodyW - 8 - (layout.annexes.length - 1) * 6) / layout.annexes.length);
      layout.annexes.forEach(function (a, i) {
        drawAnnex(parts, a, ax + i * (aw + 6), cy + 4, Math.max(60, aw), Dossier, Schema);
      });
      cy += layout.annexRowH;
    }

    parts.push(
      '<rect x="' +
        (bodyX + 1) +
        '" y="' +
        cy +
        '" width="' +
        (bodyW - 2) +
        '" height="8" fill="#78716c" stroke="#57534e" stroke-width="1"/>' +
        "</g>"
    );
  }

  function drawTerrain(parts, layout, x, y, Dossier, Schema) {
    var u = (layout.node && layout.node.unit) || {};
    var colors = ROLE_COLORS.foncier;
    var title = labelOf(u, Dossier);
    var stroke = 2;
    var ix = x + stroke;
    var iy = y + stroke;
    var iw = layout.w - stroke * 2;
    var ih = layout.h - stroke * 2;

    parts.push(
      '<g class="comp-draw-terrain" data-unit-id="' +
        esc(u.id) +
        '" data-role="foncier">' +
        '<rect x="' +
        ix +
        '" y="' +
        iy +
        '" width="' +
        iw +
        '" height="' +
        ih +
        '" rx="12" fill="' +
        colors.fill +
        '" stroke="' +
        colors.stroke +
        '" stroke-width="' +
        stroke +
        '"/>' +
        '<path d="M ' +
        (ix + 12) +
        " " +
        (iy + ih - 12) +
        " q 8 -10 16 0 q 8 -10 16 0 q 8 -10 16 0" +
        '" fill="none" stroke="' +
        colors.accent +
        '" stroke-width="2" opacity="0.7"/>' +
        '<text x="' +
        (ix + 14) +
        '" y="' +
        (iy + 18) +
        '" font-size="12" font-weight="800" fill="' +
        colors.text +
        '">Terrain — ' +
        esc(String(title).slice(0, 36)) +
        "</text>"
    );

    var bx = ix + PAD - 4;
    var by = iy + LABEL_H + 6;
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
    var hasFloorField = false;
    flat.forEach(function (r) {
      roles[roleOf(r.unit, Dossier)] = true;
      if (unitFloorRaw(r.unit)) hasFloorField = true;
    });
    var hasPieces = flat.some(function (r) {
      return piecesOf(r.unit, Dossier).length > 0;
    });
    if (roles.foncier && !roles.bati && !roles.lot) {
      return "Astuce : ajoutez un <b>immeuble</b> ou une <b>maison</b> sur le terrain, puis des <b>étages</b> et des <b>appartements</b>.";
    }
    if (roles.lot && !hasFloorField && !roles.niveau) {
      return "Renseignez le champ <b>Étage</b> de chaque lot (ex. -1, RDC, 1, 2) pour empiler la façade.";
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
    width = Math.max(320, width) + VIEW_MARGIN * 2;
    height = Math.max(120, height) + VIEW_MARGIN * 2;

    var parts = [
      '<svg class="comp-draw-svg" viewBox="0 0 ' +
        width +
        " " +
        height +
        '" width="100%" role="img" aria-label="Dessin architectural du bien : terrain, bâtiment, étages, lots et pièces" overflow="visible">',
    ];

    var y = PAD + VIEW_MARGIN;
    layouts.forEach(function (L, i) {
      if (i) y += GAP * 2;
      var x = VIEW_MARGIN + PAD + Math.max(0, (width - VIEW_MARGIN * 2 - PAD * 2 - L.w) / 2);
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
