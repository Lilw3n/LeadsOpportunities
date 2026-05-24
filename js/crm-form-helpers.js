window.CrmFormHelpers = {
  claimTypeOptions: function () {
    var types = (window.CrmConstants && window.CrmConstants.CLAIM_TYPES) || [];
    return types
      .map(function (t) {
        return '<option value="' + t.value + '">' + t.label + "</option>";
      })
      .join("");
  },

  contractOptions: function (contracts, selected) {
    var html = '<option value="">— Aucun contrat parent —</option>';
    (contracts || []).forEach(function (c) {
      var label = (c.insurer || c.contract_type || c.id) + " — " + (c.policy_number || "");
      html +=
        '<option value="' +
        c.id +
        '"' +
        (selected === c.id ? " selected" : "") +
        ">" +
        label +
        "</option>";
    });
    return html;
  },

  vehicleParentField: function (contracts, selected) {
    return (
      '<label>Contrat parent<select name="parent_id">' +
      this.contractOptions(contracts, selected) +
      "</select></label>"
    );
  },

  vehicleOptions: function (vehicles, selected) {
    var html = '<option value="">— Aucun —</option>';
    (vehicles || []).forEach(function (v) {
      var label = (v.registration || v.brand + " " + v.model || v.id).trim();
      html +=
        '<option value="' +
        v.id +
        '"' +
        (selected === v.id ? " selected" : "") +
        ">" +
        label +
        "</option>";
    });
    return html;
  },

  driverOptions: function (drivers, selected) {
    var html = '<option value="">— Aucun —</option>';
    (drivers || []).forEach(function (d) {
      var label = ((d.first_name || "") + " " + (d.last_name || "")).trim() || d.id;
      html +=
        '<option value="' +
        d.id +
        '"' +
        (selected === d.id ? " selected" : "") +
        ">" +
        label +
        "</option>";
    });
    return html;
  },

  claimContractParentField: function (contracts, selected) {
    return (
      '<label>Contrat lie<select name="parent_id">' +
      this.contractOptions(contracts, selected) +
      "</select></label>"
    );
  },

  claimExtraFields: function (item, vehicles, drivers) {
    var ct = (item && item.claim_type) || "materialRC100";
    var opts = (window.CrmConstants && window.CrmConstants.CLAIM_TYPES) || [];
    var typeHtml = opts
      .map(function (t) {
        return (
          '<option value="' +
          t.value +
          '"' +
          (ct === t.value ? " selected" : "") +
          ">" +
          t.label +
          "</option>"
        );
      })
      .join("");
    return (
      '<label>Type sinistre<select name="claim_type" required>' +
      typeHtml +
      "</select></label>" +
      '<label>Vehicule<select name="vehicle_id">' +
      this.vehicleOptions(vehicles, item && item.vehicle_id) +
      "</select></label>" +
      '<label>Conducteur<select name="driver_id">' +
      this.driverOptions(drivers, item && item.driver_id) +
      "</select></label>" +
      '<label class="full"><input type="checkbox" name="responsible" value="true"' +
      (item && item.responsible ? " checked" : "") +
      " /> Client responsable</label>"
    );
  },

  insuranceRequestExtraFields: function (item, vehicles, drivers, contracts) {
    var ct = (item && item.request_type) || "devis";
    var types = [
      { value: "devis", label: "Devis" },
      { value: "avenant", label: "Avenant" },
      { value: "resiliation", label: "Resiliation" },
      { value: "souscription", label: "Souscription" },
    ];
    var typeHtml = types
      .map(function (t) {
        return (
          '<option value="' +
          t.value +
          '"' +
          (ct === t.value ? " selected" : "") +
          ">" +
          t.label +
          "</option>"
        );
      })
      .join("");
    return (
      '<label>Type<select name="request_type" required>' +
      typeHtml +
      "</select></label>" +
      '<label>Contrat parent<select name="parent_id">' +
      this.contractOptions(contracts, item && item.parent_id) +
      "</select></label>" +
      '<label>Vehicule<select name="vehicle_id">' +
      this.vehicleOptions(vehicles, item && item.vehicle_id) +
      "</select></label>" +
      '<label>Conducteur<select name="driver_id">' +
      this.driverOptions(drivers, item && item.driver_id) +
      "</select></label>"
    );
  },

  companyFields: function (c) {
    c = c || {};
    var lf = c.legalForm || "SARL";
    var forms = ["SARL", "SAS", "EI", "EURL", "SA"];
    var lfHtml = forms
      .map(function (f) {
        return (
          '<option' +
          (lf === f ? " selected" : "") +
          ">" +
          f +
          "</option>"
        );
      })
      .join("");
    return (
      '<label class="full">Raison sociale<input name="name" value="' +
      (c.name || "") +
      '" required /></label>' +
      '<label>SIRET (14 chiffres)<input name="siret" pattern="\\d{14}" maxlength="14" value="' +
      (c.siret || "") +
      '" placeholder="12345678901234" /></label>' +
      '<label>N° TVA<input name="vatNumber" value="' +
      (c.vatNumber || "") +
      '" /></label>' +
      '<label>Forme juridique<select name="legalForm">' +
      lfHtml +
      "</select></label>" +
      '<label>Activite<input name="activity" value="' +
      (c.activity || "") +
      '" /></label>' +
      '<label>Capital social<input type="number" name="capital" value="' +
      (c.capital != null ? c.capital : "") +
      '" /></label>' +
      '<label>Effectif<input type="number" name="employees" value="' +
      (c.employees != null ? c.employees : "") +
      '" /></label>' +
      '<label>Date creation<input type="date" name="foundedDate" value="' +
      (c.foundedDate || "") +
      '" /></label>' +
      '<label class="full">Adresse<input name="address" value="' +
      (c.address || "") +
      '" /></label>' +
      '<label>Telephone<input name="phone" value="' +
      (c.phone || "") +
      '" /></label>' +
      '<label>Email<input type="email" name="email" value="' +
      (c.email || "") +
      '" /></label>' +
      '<label>Site web<input name="website" value="' +
      (c.website || "") +
      '" /></label>'
    );
  },

  childRow: function (ch, i) {
    ch = ch || {};
    var bd = ch.birthDate ? String(ch.birthDate).slice(0, 10) : "";
    return (
      '<div class="child-row form-grid" data-child-index="' +
      i +
      '">' +
      '<label>Prenom<input name="child_firstName_' +
      i +
      '" value="' +
      (ch.firstName || "") +
      '" /></label>' +
      '<label>Nom<input name="child_lastName_' +
      i +
      '" value="' +
      (ch.lastName || "") +
      '" /></label>' +
      '<label>Date naissance<input type="date" name="child_birthDate_' +
      i +
      '" value="' +
      bd +
      '" /></label>' +
      '<button type="button" class="btn btn-ghost btn-xs btn-rm-child">Retirer</button>' +
      "</div>"
    );
  },

  familyFields: function (f) {
    f = f || {};
    var s = f.spouse || {};
    var e = f.emergencyContact || {};
    var children = f.children || [];
    var childHtml = children.length
      ? children.map(this.childRow.bind(this)).join("")
      : this.childRow({}, 0);
    return (
      "<h3>Conjoint</h3>" +
      '<label>Prenom<input name="spouse_firstName" value="' +
      (s.firstName || "") +
      '" /></label>' +
      '<label>Nom<input name="spouse_lastName" value="' +
      (s.lastName || "") +
      '" /></label>' +
      '<label>Telephone<input name="spouse_phone" value="' +
      (s.phone || "") +
      '" /></label>' +
      '<label>Profession<input name="spouse_profession" value="' +
      (s.profession || "") +
      '" /></label>' +
      "<h3>Enfants</h3>" +
      '<div id="childrenBox">' +
      childHtml +
      "</div>" +
      '<button type="button" class="btn btn-ghost btn-sm btn-add-child">+ Enfant</button>' +
      "<h3>Contact urgence</h3>" +
      '<label>Prenom<input name="ec_firstName" value="' +
      (e.firstName || "") +
      '" required /></label>' +
      '<label>Nom<input name="ec_lastName" value="' +
      (e.lastName || "") +
      '" required /></label>' +
      '<label>Lien<input name="ec_relationship" value="' +
      (e.relationship || "") +
      '" /></label>' +
      '<label>Telephone<input name="ec_phone" value="' +
      (e.phone || "") +
      '" required /></label>' +
      '<label>Email<input type="email" name="ec_email" value="' +
      (e.email || "") +
      '" /></label>'
    );
  },

  bindFamilyForm: function (form) {
    if (!form || form._familyBound) return;
    form._familyBound = true;
    form.addEventListener("click", function (e) {
      if (e.target.classList.contains("btn-add-child")) {
        e.preventDefault();
        var box = form.querySelector("#childrenBox");
        var i = box.querySelectorAll(".child-row").length;
        box.insertAdjacentHTML("beforeend", window.CrmFormHelpers.childRow({}, i));
      }
      if (e.target.classList.contains("btn-rm-child")) {
        e.preventDefault();
        var row = e.target.closest(".child-row");
        if (row && form.querySelectorAll(".child-row").length > 1) row.remove();
      }
    });
  },

  parseFamilyForm: function (fd) {
    var children = [];
    var i = 0;
    while (i < 15) {
      var fn = fd.get("child_firstName_" + i);
      var ln = fd.get("child_lastName_" + i);
      if (fn || ln) {
        children.push({
          firstName: fn || "",
          lastName: ln || "",
          birthDate: fd.get("child_birthDate_" + i) || "",
          relationship: "child",
        });
      }
      i++;
    }
    return {
      spouse: {
        firstName: fd.get("spouse_firstName") || "",
        lastName: fd.get("spouse_lastName") || "",
        phone: fd.get("spouse_phone") || "",
        profession: fd.get("spouse_profession") || "",
      },
      emergencyContact: {
        firstName: fd.get("ec_firstName") || "",
        lastName: fd.get("ec_lastName") || "",
        relationship: fd.get("ec_relationship") || "",
        phone: fd.get("ec_phone") || "",
        email: fd.get("ec_email") || "",
      },
      children: children,
    };
  },

  parseCompanyForm: function (fd) {
    var o = {};
    fd.forEach(function (v, k) {
      o[k] = v;
    });
    return o;
  },
};
