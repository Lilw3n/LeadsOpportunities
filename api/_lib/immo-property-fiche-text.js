/**
 * Texte de la fiche bien (sans I/O Drive) — pièces, surface, propriétaires.
 */
var FICHE_NAME = "00_fiche_bien.txt";
var FICHE_FOLDER = "03_documents_publics";

function str(v) {
  if (v == null) return "";
  return String(v).trim();
}

function money(v) {
  if (v == null || v === "") return "";
  var n = Number(String(v).replace(/\s/g, "").replace(",", "."));
  if (!isFinite(n)) return str(v);
  try {
    return Math.round(n).toLocaleString("fr-FR") + " €";
  } catch (e) {
    return String(Math.round(n)) + " €";
  }
}

function line(label, value) {
  var s = str(value);
  if (!s) return "";
  return label + " : " + s + "\n";
}

function asArray(v) {
  if (v == null || v === "") return [];
  return Array.isArray(v) ? v : [v];
}

function roomRowsFrom(input) {
  input = input || {};
  var sd = input.sellDossier || {};
  var draft = input.depositDraft || {};
  var list =
    (Array.isArray(input.roomDetails) && input.roomDetails) ||
    (Array.isArray(sd.roomDetails) && sd.roomDetails) ||
    (Array.isArray(draft.rooms) && draft.rooms) ||
    [];
  if (list.length) {
    return list.filter(function (r) {
      return r && typeof r === "object";
    });
  }
  var names = asArray(sd["roomName[]"] || sd.roomName);
  if (!names.length) return [];
  var levels = asArray(sd["roomLevel[]"] || sd.roomLevel);
  var surfaces = asArray(sd["roomSurface[]"] || sd.roomSurface);
  var dims = asArray(sd["roomDimensions[]"] || sd.roomDimensions);
  var floors = asArray(sd["roomFlooring[]"] || sd.roomFlooring);
  var expos = asArray(sd["roomExposure[]"] || sd.roomExposure);
  var n = Math.max(names.length, levels.length, surfaces.length);
  var rows = [];
  var i;
  for (i = 0; i < n; i++) {
    rows.push({
      level: str(levels[i]),
      name: str(names[i]),
      surface: str(surfaces[i]),
      dimensions: str(dims[i]),
      flooring: str(floors[i]),
      exposure: str(expos[i]),
    });
  }
  return rows.filter(function (r) {
    return r.name || r.surface || r.level;
  });
}

function formatRoom(r) {
  return (
    "- " +
    [r.level, r.name, r.surface ? r.surface + " m²" : "", r.dimensions, r.flooring, r.exposure]
      .filter(Boolean)
      .join(" · ")
  );
}

function formatOwner(o) {
  if (!o || typeof o !== "object") return "";
  var name = [o.firstName || o.prenom, o.lastName || o.nom || o.usageName].filter(Boolean).join(" ").trim();
  var bits = [name || "Propriétaire"];
  if (o.role) bits.push(o.role);
  if (o.phone || o.telephone) bits.push(o.phone || o.telephone);
  if (o.email) bits.push(o.email);
  return "- " + bits.join(" · ");
}

function buildFicheContent(input) {
  input = input || {};
  var sd = input.sellDossier || {};
  var out = "FICHE BIEN — Leads Opportunities\n";
  out += "Mise à jour : " + new Date().toLocaleString("fr-FR") + "\n";
  out += "================================\n\n";

  var person = [input.firstName || input.first_name, input.lastName || input.last_name].filter(Boolean).join(" ");
  out += line("Client", person);
  out += line("Titre", input.title);
  out += line("Ville", input.city || sd.sellCity);
  out += line("Code postal", input.postal_code || input.postalCode || sd.sellPostalCode);
  out += line("Type", input.property_type || input.propertyType || sd.sellPropertyType);
  out += line("Pièces (nb)", input.rooms != null ? input.rooms : sd.sellRooms);
  out += line("Chambres", input.bedrooms != null ? input.bedrooms : sd.sellBedrooms);
  var surf = input.surface_m2 != null ? input.surface_m2 : sd.sellSurface;
  out += line("Surface", surf ? surf + " m²" : "");
  out += line("DPE", input.dpe || sd.sellDpe);
  out += line("GES", sd.sellGes);
  out += line("Prix FAI", money(input.price_fai || input.priceFai || sd.sellPriceFai || sd.sellAskingPrice || sd.sellPrice));
  out += line("Adresse", sd.sellAddress || input.addressHint || input.address);

  var rooms = roomRowsFrom(input);
  if (rooms.length) {
    out += "\nPIÈCES / BALCONS\n";
    rooms.forEach(function (r) {
      out += formatRoom(r) + "\n";
    });
  }

  var owners = Array.isArray(sd.owners) ? sd.owners : [];
  if (owners.length) {
    out += "\nPROPRIÉTAIRES\n";
    owners.forEach(function (o) {
      var row = formatOwner(o);
      if (row) out += row + "\n";
    });
  }

  var desc = str(input.description || sd.sellDescription);
  if (desc) {
    out += "\nDESCRIPTION\n" + desc + "\n";
  }

  out += "\n— Fichier généré automatiquement, à actualiser à chaque mise à jour du dossier.\n";
  return out;
}

module.exports = {
  FICHE_NAME: FICHE_NAME,
  FICHE_FOLDER: FICHE_FOLDER,
  buildFicheContent: buildFicheContent,
  roomRowsFrom: roomRowsFrom,
};
