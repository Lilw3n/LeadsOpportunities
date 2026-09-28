window.CrmValidation = {
  siret: function (s) {
    s = String(s || "").replace(/\s/g, "");
    if (!s) return { ok: true };
    if (!/^\d{14}$/.test(s)) {
      return { ok: false, error: "Le SIRET doit contenir 14 chiffres" };
    }
    return { ok: true };
  },
  email: function (s) {
    if (!s) return { ok: true };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) {
      return { ok: false, error: "Email invalide" };
    }
    return { ok: true };
  },
  validateCompany: function (data) {
    if (!data.name || !String(data.name).trim()) {
      return { ok: false, error: "Raison sociale requise" };
    }
    var s = this.siret(data.siret);
    if (!s.ok) return s;
    var e = this.email(data.email);
    if (!e.ok) return e;
    return { ok: true };
  },
};
