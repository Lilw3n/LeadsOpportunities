/**
 * Bloc propriétaires répétables — fiche Laforêt (projet de vente).
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

  function ownerCardHtml(index, data) {
    data = data || {};
    var n = index + 1;
    var removable = index > 0;
    var mailChecked = data.mailRecipient || index === 0 ? " checked" : "";
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
      '<div class="immo-salutation-row" role="group" aria-label="Civilite">' +
      salutationRadios(index, data) +
      "</div>" +
      '<div class="grid">' +
      '<div class="field"><label>Rôle / qualité</label><select name="ownerRole[]" data-owner-field="role"><option value="">— Choisir —</option>' +
      roleOptions(data.role) +
      "</select></div>" +
      '<div class="field"><label>Prénom</label><input name="ownerFirstName[]" data-owner-field="firstName" autocomplete="given-name" placeholder="Ex. Jean" value="' +
      esc(data.firstName || "") +
      '" /></div>' +
      '<div class="field"><label>Nom</label><input name="ownerLastName[]" data-owner-field="lastName" autocomplete="family-name" placeholder="Ex. Dupont" value="' +
      esc(data.lastName || "") +
      '" /></div>' +
      '<div class="field full"><label>Adresse postale</label><input name="ownerAddress[]" data-owner-field="address" autocomplete="street-address" placeholder="Rue, numéro…" value="' +
      esc(data.address || "") +
      '" /></div>' +
      '<div class="field"><label>Code postal</label><input name="ownerPostal[]" data-owner-field="postal" inputmode="numeric" maxlength="5" placeholder="75011" value="' +
      esc(data.postal || "") +
      '" /></div>' +
      '<div class="field"><label>Ville</label><input name="ownerCity[]" data-owner-field="city" autocomplete="address-level2" placeholder="Paris" value="' +
      esc(data.city || "") +
      '" /></div>' +
      '<div class="field"><label>Téléphone</label><input name="ownerPhone[]" data-owner-field="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="06 12 34 56 78" value="' +
      esc(data.phone || "") +
      '" /></div>' +
      '<div class="field"><label>E-mail</label><input name="ownerEmail[]" data-owner-field="email" type="email" autocomplete="email" placeholder="vous@email.fr" value="' +
      esc(data.email || "") +
      '" /></div>' +
      '<div class="field full"><label class="field-check"><input type="radio" name="ownerMailRecipient" value="' +
      index +
      '"' +
      mailChecked +
      ' data-owner-mail /> Destinataire des courriers</label></div>' +
      "</div></article>"
    );
  }

  function collectCards(mount) {
    return Array.prototype.slice.call(mount.querySelectorAll(".immo-owner-card")).map(function (card, index) {
      var o = { index: index };
      card.querySelectorAll("[data-owner-field]").forEach(function (el) {
        if (el.type === "radio") {
          if (el.checked) o[el.getAttribute("data-owner-field")] = el.value;
        } else {
          o[el.getAttribute("data-owner-field")] = (el.value || "").trim();
        }
      });
      var mail = card.querySelector("[data-owner-mail]");
      o.mailRecipient = !!(mail && mail.checked);
      return o;
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
    var addBtn = mount.parentElement && mount.parentElement.querySelector("[data-owner-add]");
    if (addBtn) addBtn.hidden = owners.length >= MAX_OWNERS;
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
        var cards = collectCards(mount);
        if (cards.length >= MAX_OWNERS) return;
        cards.push({});
        render(mount, cards);
        return;
      }
      var rm = e.target.closest("[data-owner-remove]");
      if (rm && mount.contains(rm)) {
        var idx = Number(rm.closest("[data-owner-index]").getAttribute("data-owner-index"));
        var list = collectCards(mount);
        list.splice(idx, 1);
        render(mount, list.length ? list : [{}]);
      }
    });
  }

  function validateOwners(mount) {
    if (!mount || mount.closest("[hidden]")) return { ok: true, count: 0 };
    var cards = mount.querySelectorAll(".immo-owner-card");
    var ok = false;
    cards.forEach(function (card) {
      card.classList.remove("immo-owner-card--invalid");
      var fn = card.querySelector('[data-owner-field="firstName"]');
      var ln = card.querySelector('[data-owner-field="lastName"]');
      var ph = card.querySelector('[data-owner-field="phone"]');
      var em = card.querySelector('[data-owner-field="email"]');
      var name = ((fn && fn.value) || "").trim() + " " + ((ln && ln.value) || "").trim();
      var hasContact =
        ((ph && ph.value) || "").replace(/\D/g, "").length >= 10 ||
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(((em && em.value) || "").trim());
      if (name.trim().length >= 2 && hasContact) ok = true;
      else if ((fn && fn.value) || (ln && ln.value) || (ph && ph.value) || (em && em.value)) {
        card.classList.add("immo-owner-card--invalid");
      }
    });
    return { ok: ok, count: cards.length };
  }

  function boot() {
    document.querySelectorAll("[data-owners-mount]").forEach(bindMount);
  }

  window.AcheteurImmoOwners = {
    validate: validateOwners,
    render: render,
    bind: bindMount,
    collect: collectCards,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
