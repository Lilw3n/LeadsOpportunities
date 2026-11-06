window.CrmConstants = {
  CLAIM_TYPES: [
    { value: "materialRC100", label: "RC materiel 100%" },
    { value: "materialRC50", label: "RC materiel 50%" },
    { value: "materialRC0", label: "RC materiel 0%" },
    { value: "bodilyRC100", label: "RC corporel 100%" },
    { value: "bodilyRC50", label: "RC corporel 50%" },
    { value: "bodilyRC0", label: "RC corporel 0%" },
    { value: "glassBreakage", label: "Bris de glace" },
    { value: "theft", label: "Vol" },
    { value: "fire", label: "Incendie" },
    { value: "naturalDisaster", label: "Catastrophe naturelle" },
  ],
  VEHICLE_TYPES: [
    "Voiture particuliere",
    "Vehicule utilitaire",
    "Moto",
    "Camion",
    "VTC / Taxi",
    "Autre",
  ],
  PRIORITY_LABELS: {
    low: "Faible",
    medium: "Moyenne",
    high: "Haute",
    urgent: "Urgente",
  },
  PRIORITY_CLASS: {
    low: "prio-low",
    medium: "prio-medium",
    high: "prio-high",
    urgent: "prio-urgent",
  },
};
