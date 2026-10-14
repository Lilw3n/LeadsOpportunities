window.CrmEventSearch = {
  synonyms: {
    appel: ["call", "telephone", "phone"],
    email: ["mail", "courriel", "message"],
    rdv: ["meeting", "rendez-vous", "reunion"],
    urgent: ["urgent", "priorite", "important"],
    sinistre: ["claim", "accident", "dommage"],
    contrat: ["contract", "police", "assurance"],
  },

  expand: function (q) {
    q = (q || "").toLowerCase().trim();
    var terms = [q];
    Object.keys(this.synonyms).forEach(function (key) {
      if (q.indexOf(key) !== -1) terms = terms.concat(this.synonyms[key]);
      this.synonyms[key].forEach(function (s) {
        if (q.indexOf(s) !== -1) terms.push(key);
      });
    }, this);
    return terms;
  },

  match: function (event, q) {
    if (!q) return true;
    var terms = this.expand(q);
    var hay = (
      (event.title || "") +
      " " +
      (event.description || "") +
      " " +
      (event.event_type || "") +
      " " +
      (event.status || "") +
      " " +
      (event.priority || "")
    ).toLowerCase();
    return terms.some(function (t) {
      return t && hay.indexOf(t) !== -1;
    });
  },
};
