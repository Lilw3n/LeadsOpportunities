/**
 * Bloc propriétaires répétables — fiche vente (aligné fiche Contact / Informations).
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

  var MARITAL_OPTS = [
    { v: "mariage", t: "Mariage" },
    { v: "pacs", t: "PACS" },
    { v: "concubinage", t: "Concubinage" },
    { v: "celibataire", t: "Célibataire / veuf(ve) / divorcé(e)" },
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

  /** Genre Homme / Femme (+ rétrocompat civilité M/Mme/Mlle). */
  function normalizeGender(data) {
    var g = data.gender || data.genre || "";
    if (g === "Homme" || g === "H" || g === "M" || g === "homme") return "Homme";
    if (g === "Femme" || g === "F" || g === "Mme" || g === "Mlle" || g === "femme") return "Femme";
    var s = data.salutation || "";
    if (s === "M") return "Homme";
    if (s === "Mme" || s === "Mlle") return "Femme";
    return "";
  }

  function genderRadios(index, data) {
    var name = "ownerGender_" + index;
    var cur = normalizeGender(data);
    return ["Homme", "Femme"]
      .map(function (v) {
        var checked = cur === v ? " checked" : "";
        return (
          '<label class="immo-salutation"><input type="radio" name="' +
          name +
          '" value="' +
          v +
          '" data-owner-field="gender"' +
          checked +
          " /> " +
          v +
          "</label>"
        );
      })
      .join("");
  }

  function maritalRadios(index, data) {
    var name = "ownerMarital_" + index;
    var cur = data.maritalStatus || data.situationFamiliale || "";
    return MARITAL_OPTS.map(function (o) {
      var checked = cur === o.v ? " checked" : "";
      return (
        '<label class="immo-salutation immo-salutation--wide"><input type="radio" name="' +
        name +
        '" value="' +
        esc(o.v) +
        '" data-owner-field="maritalStatus"' +
        checked +
        " /> " +
        esc(o.t) +
        "</label>"
      );
    }).join("");
  }

  function field(label, name, attr, value, extraClass) {
    return (
      '<div class="field' +
      (extraClass ? " " + extraClass : "") +
      '"><label>' +
      label +
      '</label><input name="' +
      name +
      '" ' +
      attr +
      ' value="' +
      esc(value || "") +
      '" /></div>'
    );
  }

  function ownerCardHtml(index, data) {
    data = data || {};
    var n = index + 1;
    var removable = index > 0;
    var mailChecked = data.mailRecipient || index === 0 ? " checked" : "";
    var lastName = data.lastName || data.usageName || "";
    var birthName = data.birthName || data.maidenName || "";
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
      '<p class="immo-owner-section-title">Informations</p>' +
      '<div class="immo-salutation-row" role="group" aria-label="Genre">' +
      '<span class="immo-owner-req-label">Genre</span>' +
      genderRadios(index, data) +
      "</div>" +
      '<div class="grid">' +
      field(
        "Nom d'usage *",
        "ownerLastName[]",
        'data-owner-field="lastName" autocomplete="family-name" required placeholder="Ex. HAFFNER"',
        lastName
      ) +
      field(
        "Nom de jeune fille",
        "ownerBirthName[]",
        'data-owner-field="birthName" autocomplete="additional-name" placeholder="Ex. GAUTHER"',
        birthName
      ) +
      field(
        "Prénom *",
        "ownerFirstName[]",
        'data-owner-field="firstName" autocomplete="given-name" required placeholder="Ex. Michèle"',
        data.firstName || ""
      ) +
      field(
        "Profession",
        "ownerProfession[]",
        'data-owner-field="profession" autocomplete="organization-title" placeholder="Ex. Retraitée"',
        data.profession || ""
      ) +
      "</div>" +
      '<div class="immo-salutation-row immo-salutation-row--wrap" role="group" aria-label="Situation familiale">' +
      '<span class="immo-owner-req-label">Situation familiale</span>' +
      maritalRadios(index, data) +
      "</div>" +
      '<div class="grid">' +
      field(
        "Date du mariage / PACS / divorce",
        "ownerMaritalDate[]",
        'data-owner-field="maritalDate" type="date" placeholder="jj/mm/aaaa"',
        data.maritalDate || ""
      ) +
      field(
        "Lieu du mariage / PACS / divorce",
        "ownerMaritalPlace[]",
        'data-owner-field="maritalPlace" placeholder="Ville"',
        data.maritalPlace || ""
      ) +
      field(
        "Forme du contrat de mariage",
        "ownerMarriageContract[]",
        'data-owner-field="marriageContract" placeholder="Ex. communauté réduite aux acquêts"',
        data.marriageContract || "",
        "full"
      ) +
      field(
        "Notaire rédacteur",
        "ownerNotary[]",
        'data-owner-field="notary" placeholder="Rechercher / nom du notaire…"',
        data.notary || "",
        "full"
      ) +
      field(
        "Ajouté par",
        "ownerAddedBy[]",
        'data-owner-field="addedBy" placeholder="Ex. Wendy Buchet"',
        data.addedBy || "Wendy Buchet"
      ) +
      field(
        "Date de naissance",
        "ownerBirthDate[]",
        'data-owner-field="birthDate" type="date" placeholder="jj/mm/aaaa"',
        data.birthDate || ""
      ) +
      field(
        "Lieu de naissance",
        "ownerBirthPlace[]",
        'data-owner-field="birthPlace" placeholder="Ville / pays"',
        data.birthPlace || ""
      ) +
      field(
        "Nationalité",
        "ownerNationality[]",
        'data-owner-field="nationality" placeholder="Française"',
        data.nationality || ""
      ) +
      field(
        "N° sécurité sociale",
        "ownerSocialSecurity[]",
        'data-owner-field="socialSecurity" inputmode="numeric" autocomplete="off" placeholder="15 chiffres"',
        data.socialSecurity || ""
      ) +
      field(
        "Numéro d'identité nationale",
        "ownerNationalId[]",
        'data-owner-field="nationalId" autocomplete="off" placeholder="CNI / passeport…"',
        data.nationalId || ""
      ) +
      '<div class="field full"><label>Commentaires</label><textarea name="ownerComments[]" data-owner-field="comments" rows="3" placeholder="Notes internes…">' +
      esc(data.comments || "") +
      "</textarea></div>" +
      '<div class="field full"><label>Rôle / qualité</label><select name="ownerRole[]" data-owner-field="role"><option value="">— Choisissez un élément —</option>' +
      roleOptions(data.role) +
      '</select><p class="immo-owner-hint">Les autres rôles (propriétaire, acquéreur, agent…) peuvent être assignés automatiquement selon le dossier.</p></div>' +
      "</div>" +
      '<p class="immo-owner-section-title">Coordonnées</p>' +
      '<div class="grid">' +
      field(
        "Adresse postale",
        "ownerAddress[]",
        'data-owner-field="address" autocomplete="street-address" placeholder="Rue, numéro…"',
        data.address || "",
        "full"
      ) +
      field(
        "Code postal",
        "ownerPostal[]",
        'data-owner-field="postal" inputmode="numeric" maxlength="5" placeholder="75011"',
        data.postal || ""
      ) +
      field(
        "Ville",
        "ownerCity[]",
        'data-owner-field="city" autocomplete="address-level2" placeholder="Paris"',
        data.city || ""
      ) +
      field(
        "Téléphone *",
        "ownerPhone[]",
        'data-owner-field="phone" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="06 12 34 56 78"',
        data.phone || ""
      ) +
      field(
        "E-mail *",
        "ownerEmail[]",
        'data-owner-field="email" type="email" autocomplete="email" placeholder="vous@email.fr"',
        data.email || ""
      ) +
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
        var key = el.getAttribute("data-owner-field");
        if (el.type === "radio") {
          if (el.checked) o[key] = el.value;
          return;
        }
        if (el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.tagName === "INPUT") {
          o[key] = (el.value || "").trim();
        }
      });
      // rétrocompat civilité
      if (o.gender === "Homme") o.salutation = "M";
      if (o.gender === "Femme") o.salutation = "Mme";
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
