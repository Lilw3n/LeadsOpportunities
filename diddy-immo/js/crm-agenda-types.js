/**
 * Types d'événements agenda (réf. métier immo + CRM).
 */
window.CrmAgendaTypes = (function () {
  var TYPES = [
    { id: "estimation", label: "Estimation", color: "#2563eb" },
    { id: "visite", label: "Visite", color: "#0d9488" },
    { id: "mandat", label: "Signature mandat", color: "#7c3aed" },
    { id: "compromis", label: "Compromis", color: "#c2410c" },
    { id: "meeting", label: "RDV", color: "#1d4ed8" },
    { id: "call", label: "Appel", color: "#0369a1" },
    { id: "email", label: "Email", color: "#475569" },
    { id: "task", label: "Tâche", color: "#64748b" },
    { id: "prospection", label: "Prospection", color: "#9333ea" },
    { id: "relance", label: "Relance suivi", color: "#b45309" },
    { id: "pieces", label: "Pièces dossier", color: "#7c3aed" },
    { id: "banque", label: "RDV banque", color: "#1e3a8a" },
    { id: "notaire", label: "RDV notaire", color: "#9a3412" },
    { id: "partenaire", label: "Point partenaire", color: "#0f766e" },
    { id: "note", label: "Note", color: "#94a3b8" },
  ];

  var MODES = [
    { id: "sur_place", label: "Sur place" },
    { id: "visio", label: "Visio" },
    { id: "telephone", label: "Téléphone" },
    { id: "agence", label: "En agence" },
  ];

  function byId(id) {
    return (
      TYPES.find(function (t) {
        return t.id === id;
      }) || { id: id || "meeting", label: id || "RDV", color: "#6366f1" }
    );
  }

  function colorFor(evt, mode) {
    if (mode === "status") {
      if (evt.googleSyncStatus === "synced") return "#059669";
      if (evt.googleSyncStatus === "error") return "#dc2626";
      return "#d97706";
    }
    return byId(evt.eventType).color;
  }

  return { TYPES: TYPES, MODES: MODES, byId: byId, colorFor: colorFor };
})();
