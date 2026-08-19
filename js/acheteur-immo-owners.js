/**
 * Bloc propriétaires répétables — fiche Laforêt (projet de vente).
 * Évite les doublons avec « Vos coordonnées » ; adresse proprio ≠ adresse du bien (héritage).
 */
(function () {
  var MAX_OWNERS = 6;

  var ROLE_OPTS = [
    { v: "proprietaire", t: "Propriétaire" },
    { v: "nu_proprietaire", t: "Nu-propriétaire" },
    { v: "usufruitier", t: "Usufruitier" },
    { v: "indivisaire", t: "Indivisaire / co-propriétaire" },
    { v: "sci", t: "SCI / personne morale" },
    { v: "mandataire", t: "Mandataire / représentant" },
    { v: "heritier", t: "Héritier" },
    { v: "autre", t: "Autre" },
  ];

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function roleOptions(selected) {
    return ROLE_OPTS.map(function (o) {
      return (
        '<option value="' +
        esc(o.v) +
        '"' +
        (selected === o.v ? " selected" : "") +
        ">" +
        esc(o.t) +
        "</option>"
      );
    }).join("");
  }

  function salutationRadios(index, data) {
    var name = "ownerSalutation_" + index;
    var vals = [
      { v: "M", t: "M." },
      { v: "Mme", t: "Mme" },
      { v: "Mlle", t: "Mlle" },
    ];
    return vals
      .map(function (o) {
        var checked = (data.salutation || (index === 0 ? "M" : "")) === o.v ? " checked" : "";
        return (
          '<label class="immo-salutation"><input type="radio" name="' +
          name +
          '" value="' +
          o.v +
          '" data-owner-field="salutation"' +
          checked +
          " /> " +
          o.t +
          "</label>"
        );
      })
      .join("");
  }

  function depositForm() {
    return document.querySelector("[data-url-capture-form]");
  }

  function getPropertyAddress() {
    var sellAddr = document.querySelector("#sellAddress");
    var sellCity = document.querySelector("#sellCity");
    var sellPostal = document.querySelector("#sellPostalCode");
    var urlCity = document.querySelector("#urlCity");
    var urlPostal = document.querySelector("#urlPostal");
    return {
      address: sellAddr && String(sellAddr.value || "").trim() ? String(sellAddr.value).trim() : "",
      city:
        (sellCity && String(sellCity.value || "").trim()) ||
        (urlCity && String(urlCity.value || "").trim()) ||
        "",
      postal:
        (sellPostal && String(sellPostal.value || "").trim()) ||
        (urlPostal && String(urlPostal.value || "").trim()) ||
        "",
    };
  }

  function getContactFromForm(form) {
    form = form || depositForm();
    if (!form) return { firstName: "", lastName: "", phone: "", email: "" };
    function v(name) {
      var el = form.querySelector("[name='" + name + "']");
      return el ? String(el.value || "").trim() : "";
    }
    return {
      firstName: v("firstName"),
      lastName: v("lastName"),
      phone: v("phone"),
      email: v("email"),
    };
  }

  function syncCardFieldVisibility(card) {
    if (!card) return;
    var index = Number(card.getAttribute("data-owner-index") || "0");
    var sameContactEl = card.querySelector("[data-owner-same-contact]");
    var samePropertyEl = card.querySelector("[data-owner-same-property]");
    var sameContact = index === 0 && sameContactEl && sameContactEl.checked;
    var sameProperty = samePropertyEl && samePropertyEl.checked;
    var contactWrap = card.querySelector("[data-owner-contact-fields]");
    var addressWrap = card.querySelector("[data-owner-address-fields]");
    if (contactWrap) contactWrap.hidden = sameContact;
    if (addressWrap) {
      addressWrap.hidden = sameProperty;
      if (samePropertyEl) {
        var prop = getPropertyAddress();
        samePropertyEl.disabled = !(prop.city || prop.postal || prop.address);
      }
    }
    if (sameContactEl) sameContactEl.closest("[data-owner-same-contact-wrap]").hidden = index !== 0;
  }

  function syncAllCards(mount) {
    if (!mount) return;
    mount.querySelectorAll(".immo-owner-card").forEach(syncCardFieldVisibility);
  }

  function ownerCardHtml(index, data) {
    data = data || {};
    var n = index + 1;
    var removable = index > 0;
    var mailChecked = data.mailRecipient || index === 0 ? " checked" : "";
    var sameContactChecked = index === 0 && data.sameAsContact !== false ? " checked" : "";
    var samePropertyChecked = data.sameAsPropertyAddress ? " checked" : "";
    return (
      '<article class="immo-owner-card" data-owner-index="' +
      index +
      '">' +
      '<div class="immo-owner-card-head">' +
      "<strong>Propriétaire " +
      n +
      (index === 0 ? " — destinataire courriers par défaut" : "") +
      "</strong>" +
      (removable
        ? '<button type="button" class="immo-owner-remove" data-owner-remove aria-label="Retirer">Retirer</button>'
        : "") +
      "</div>" +
      '<div class="immo-owner-same-row">' +
      '<label class="field-check immo-owner-same-opt" data-owner-same-contact-wrap' +
      (index !== 0 ? " hidden" : "") +
      '><input type="checkbox" data-owner-same-contact' +
      sameContactChecked +
      ' /> Même personne que « Vos coordonnées » (déposant)</label>' +
      '<label class="field-check immo-owner-same-opt"><input type="checkbox" data-owner-same-property' +
      samePropertyChecked +
      ' /> Adresse postale = adresse du bien vendu</label>' +
      "</div>" +
      '<div class="immo-salutation-row" role="group" aria-label="Civilite">' +
      salutationRadios(index, data) +
      "</div>" +
      '<div class="grid">' +
      '<div class="field"><label>Rôle / qualité</label><select name="ownerRole[]" data-owner-field="role"><option value="">— Choisir —</option>' +
      roleOptions(data.role) +
      "</select></div>" +
      '<div class="immo-owner-contact-fields" data-owner-contact-fields>' +
      '<div class="field"><label>Prénom</label><input name="ownerFirstName[]" data-owner-field="firstName" autocomplete="given-name" placeholder="Ex. Jean" value="' +
      esc(data.firstName || "") +
      '" /></div>' +
      '<div class="field"><label>Nom</label><input name="ownerLastName[]" data-owner-field="lastName" autocomplete="family-name" placeholder="Ex. Dupont" value="' +
      esc(data.lastName || "") +
      '" /></div>' +
      '<div class="field"><label>Téléphone</label><input name="ownerPhone[]" data-owner-field="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="06 12 34 56 78" value="' +
      esc(data.phone || "") +
      '" /></div>' +
      '<div class="field"><label>E-mail</label><input name="ownerEmail[]" data-owner-field="email" type="email" autocomplete="email" placeholder="vous@email.fr" value="' +
      esc(data.email || "") +
      '" /></div>' +
      "</div>" +
      '<div class="immo-owner-address-fields" data-owner-address-fields>' +
      '<div class="field full"><label>Adresse postale du propriétaire</label><input name="ownerAddress[]" data-owner-field="address" autocomplete="street-address" placeholder="Rue, numéro… (si différente du bien)" value="' +
      esc(data.address || "") +
      '" /></div>' +
      '<div class="field"><label>Code postal</label><input name="ownerPostal[]" data-owner-field="postal" inputmode="numeric" maxlength="5" placeholder="75011" value="' +
      esc(data.postal || "") +
      '" /></div>' +
      '<div class="field"><label>Ville</label><input name="ownerCity[]" data-owner-field="city" autocomplete="address-level2" placeholder="Paris" value="' +
      esc(data.city || "") +
      '" /></div>' +
      "</div>" +
      '<div class="field full"><label class="field-check"><input type="radio" name="ownerMailRecipient" value="' +
      index +
      '"' +
      mailChecked +
      ' data-owner-mail /> Destinataire des courriers</label></div>' +
      "</div></article>"
    );
  }

  function readCardFields(card) {
    var o = {};
    card.querySelectorAll("[data-owner-field]").forEach(function (el) {
      if (el.type === "radio") {
        if (el.checked) o[el.getAttribute("data-owner-field")] = el.value;
      } else {
        o[el.getAttribute("data-owner-field")] = (el.value || "").trim();
      }
    });
    var mail = card.querySelector("[data-owner-mail]");
    o.mailRecipient = !!(mail && mail.checked);
    var index = Number(card.getAttribute("data-owner-index") || "0");
    var sameContactEl = card.querySelector("[data-owner-same-contact]");
    var samePropertyEl = card.querySelector("[data-owner-same-property]");
    o.sameAsContact = index === 0 && !!(sameContactEl && sameContactEl.checked);
    o.sameAsPropertyAddress = !!(samePropertyEl && samePropertyEl.checked);
    return o;
  }

  function resolveOwnerRow(row, form) {
    row = Object.assign({}, row);
    if (row.sameAsContact) {
      var contact = getContactFromForm(form);
      row.firstName = contact.firstName;
      row.lastName = contact.lastName;
      row.phone = contact.phone;
      row.email = contact.email;
    }
    if (row.sameAsPropertyAddress) {
      var prop = getPropertyAddress();
      row.address = prop.address;
      row.city = prop.city;
      row.postal = prop.postal;
    }
    return row;
  }

  function collectCards(mount, form) {
    return Array.prototype.slice
      .call(mount.querySelectorAll(".immo-owner-card"))
      .map(function (card, index) {
        var row = readCardFields(card);
        row.index = index;
        return resolveOwnerRow(row, form);
      });
  }

  function render(mount, owners) {
    owners = owners && owners.length ? owners : [{}];
    mount.innerHTML = owners
      .slice(0, MAX_OWNERS)
      .map(function (o, i) {
        return ownerCardHtml(i, o);
      })
      .join("");
    syncAllCards(mount);
    var addBtn = mount.parentElement && mount.parentElement.querySelector("[data-owner-add]");
    if (addBtn) addBtn.hidden = owners.length >= MAX_OWNERS;
  }

  function ownerHasContact(row) {
    var name = ((row.firstName || "") + " " + (row.lastName || "")).trim();
    var ph = String(row.phone || "").replace(/\D/g, "");
    var em = String(row.email || "").trim();
    return (
      name.length >= 2 &&
      (ph.length >= 10 || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em))
    );
  }

  function validateOwners(mount, form) {
    if (!mount || mount.closest("[hidden]")) return { ok: true, count: 0 };
    var cards = mount.querySelectorAll(".immo-owner-card");
    var ok = false;
    cards.forEach(function (card) {
      card.classList.remove("immo-owner-card--invalid");
      var row = resolveOwnerRow(readCardFields(card), form);
      if (ownerHasContact(row)) ok = true;
      else if (
        row.firstName ||
        row.lastName ||
        row.phone ||
        row.email ||
        readCardFields(card).firstName ||
        readCardFields(card).lastName
      ) {
        card.classList.add("immo-owner-card--invalid");
      }
    });
    return { ok: ok, count: cards.length };
  }

  function bindMount(mount) {
    if (!mount || mount.dataset.ownersBound) return;
    mount.dataset.ownersBound = "1";
    render(mount, [{}]);

    var root = mount.closest("form") || mount.parentElement || document;

    root.addEventListener("click", function (e) {
      var add = e.target.closest("[data-owner-add]");
      if (add) {
        var section = add.closest("[data-search-vente-panel], [data-listing-url-capture], form");
        var localMount = section && section.querySelector("[data-owners-mount]");
        if (localMount !== mount) return;
        var cards = collectCards(mount, depositForm());
        if (cards.length >= MAX_OWNERS) return;
        cards.push({});
        render(mount, cards);
        return;
      }
      var rm = e.target.closest("[data-owner-remove]");
      if (rm && mount.contains(rm)) {
        var idx = Number(rm.closest("[data-owner-index]").getAttribute("data-owner-index"));
        var list = collectCards(mount, depositForm());
        list.splice(idx, 1);
        render(mount, list.length ? list : [{}]);
      }
    });

    mount.addEventListener("change", function (e) {
      if (
        e.target.matches("[data-owner-same-contact]") ||
        e.target.matches("[data-owner-same-property]")
      ) {
        syncCardFieldVisibility(e.target.closest(".immo-owner-card"));
      }
    });

    document.addEventListener("input", function (e) {
      if (!e.target || !e.target.closest("[data-url-capture-form], [data-search-vente-panel]")) return;
      syncAllCards(mount);
    });
  }

  function boot() {
    document.querySelectorAll("[data-owners-mount]").forEach(bindMount);
  }

  window.AcheteurImmoOwners = {
    validate: validateOwners,
    render: render,
    bind: bindMount,
    collect: collectCards,
    getPropertyAddress: getPropertyAddress,
    syncAllCards: syncAllCards,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
