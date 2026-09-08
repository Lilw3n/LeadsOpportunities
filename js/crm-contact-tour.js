/**
 * Fiche contact — rattacher une visite virtuelle à ce contact (acquéreur ou vendeur).
 */
(function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function contactName(c) {
    if (!c) return "ce contact";
    return [c.first_name, c.last_name].filter(Boolean).join(" ").trim() || c.email || c.id;
  }

  function propsForContact(Store, contactId) {
    var all = Store.listProperties() || [];
    var parties = Store.listParties() || [];
    var partyIds = {};
    parties.forEach(function (pt) {
      if (pt.contact_id === contactId && pt.property_id) partyIds[pt.property_id] = true;
    });
    return all.filter(function (p) {
      return p.owner_contact_id === contactId || p.buyer_contact_id === contactId || partyIds[p.id];
    });
  }

  function publicUrl(token, utm) {
    return (
      location.origin +
      "/immobilier/visite.html?t=" +
      encodeURIComponent(token) +
      "&utm_source=" +
      encodeURIComponent(utm || "leboncoin")
    );
  }

  function mount(root, contact, extra) {
    if (!root || !contact) return;
    var Store = window.CrmImmoStore;
    var AdLib = window.ImmoAdListings;
    var Tour = window.ImmoTourAccess;
    if (!Store || !AdLib || !Tour) {
      root.innerHTML = "<p class='pub-hint'>Libs visite non chargées.</p>";
      return;
    }

    extra = extra || {};
    var driveProps = ((extra.driveInfo && extra.driveInfo.propertyFolders) || []).map(function (f) {
      return f.propertyId;
    });

    function paint(msgText, ok) {
      var list = propsForContact(Store, contact.id);
      driveProps.forEach(function (id) {
        if (id && !list.some(function (p) { return p.id === id; })) {
          var p = Store.getProperty(id);
          if (p) list.push(p);
        }
      });
      var options =
        '<option value="">— Choisir un bien —</option>' +
        list
          .map(function (p) {
            return '<option value="' + esc(p.id) + '">' + esc(p.title || p.city || p.id) + "</option>";
          })
          .join("") +
        '<option value="__new__">Créer un bien de test pour ce contact</option>';

      var existingTour = null;
      list.forEach(function (p) {
        var ta = AdLib.getAdMeta(p).ad.tour_access;
        if (ta && ta.enabled && ta.token) existingTour = { property: p, ta: ta };
      });

      root.innerHTML =
        '<div class="panel-head"><h2>Visite virtuelle (test avec ce contact)</h2>' +
        '<a class="btn btn-ghost btn-sm" href="./crm-immo-pubs.html">Pubs mandats</a></div>' +
        "<p class=\"pub-hint\">Colle ton lien Matterport / 3D. Pour autoriser quelqu’un : " +
        "<strong>ajoute son e-mail ou son 06</strong> dans les champs ci-dessous (un par ligne), " +
        "coche «&nbsp;Restreindre à ces personnes&nbsp;», puis Enregistrer. " +
        "La durée (ex. 30 h) commence à la <strong>première ouverture réelle de la visite</strong>, pas à la création du lien.</p>" +
        '<label>Bien lié<select id="ctTourProp">' +
        options +
        "</select></label>" +
        '<label>Lien visite 3D (Matterport, Nodalview…)<input id="ctTourUrl" type="url" placeholder="https://my.matterport.com/show/?m=…" /></label>' +
        '<div class="row2">' +
        '<label>Vérif<select id="ctTourVerify">' +
        '<option value="both" selected>E-mail + SMS</option>' +
        '<option value="email">E-mail</option>' +
        '<option value="sms">SMS</option>' +
        '<option value="none">Aucune</option>' +
        "</select></label>" +
        '<label>Période<select id="ctTourPeriod">' +
        '<option value="limited" selected>Durée ci-dessous</option>' +
        '<option value="unlimited">Illimitée</option>' +
        '<option value="mandate">Mandat exclusif</option>' +
        "</select></label></div>" +
        '<div class="row2">' +
        '<label>Durée<input id="ctTourDuration" type="number" min="0" step="1" value="30" /></label>' +
        '<label>Unité<select id="ctTourDurationUnit">' +
        '<option value="hours">Heures</option>' +
        '<option value="days" selected>Jours</option>' +
        "</select></label></div>" +
        '<label>Utilisations max (0 = illimité)<input id="ctTourMaxViews" type="number" min="0" step="1" value="1" /></label>' +
        '<label>La durée commence<select id="ctTourDurationStart">' +
        '<option value="first_view" selected>À la première consultation du lien</option>' +
        '<option value="created">Dès la création du lien</option>' +
        "</select></label>" +
        '<label>E-mails autorisés (un par ligne, ajoute ou retire puis Enregistrer)<textarea id="ctTourEmails" rows="3" placeholder="michele@exemple.fr&#10;autre@exemple.fr"></textarea></label>' +
        '<label>Téléphones autorisés (un 06 / 07 par ligne)<textarea id="ctTourPhones" rows="3" placeholder="06 12 34 56 78"></textarea></label>' +
        '<label class="pub-checks"><input type="checkbox" id="ctTourAllow" checked /> Restreindre à ces e-mails / tél. (sinon tout le monde qui passe la vérif)</label>' +
        '<div class="pub-media-actions">' +
        '<button type="button" class="btn btn-primary btn-sm" id="ctTourSave">Enregistrer et créer le lien</button>' +
        "</div>" +
        '<p id="ctTourMsg" class="pub-hint"></p>' +
        '<div id="ctTourLinks"></div>';

      if (list[0]) {
        var sel = root.querySelector("#ctTourProp");
        if (sel) sel.value = list[0].id;
        var ad0 = AdLib.getAdMeta(list[0]).ad;
        if (ad0.virtual_tour) root.querySelector("#ctTourUrl").value = ad0.virtual_tour;
        if (ad0.tour_access && ad0.tour_access.verify_mode) {
          root.querySelector("#ctTourVerify").value = ad0.tour_access.verify_mode;
        }
        if (ad0.tour_access && ad0.tour_access.period_mode) {
          root.querySelector("#ctTourPeriod").value = ad0.tour_access.period_mode;
        }
        if (ad0.tour_access && ad0.tour_access.duration_value) {
          root.querySelector("#ctTourDuration").value = String(ad0.tour_access.duration_value);
        }
        if (ad0.tour_access && ad0.tour_access.duration_unit) {
          root.querySelector("#ctTourDurationUnit").value = ad0.tour_access.duration_unit;
        }
        if (ad0.tour_access && ad0.tour_access.max_views != null) {
          root.querySelector("#ctTourMaxViews").value = String(ad0.tour_access.max_views);
        }
        if (ad0.tour_access && ad0.tour_access.duration_start) {
          root.querySelector("#ctTourDurationStart").value = ad0.tour_access.duration_start;
        }
        var emails0 = ((ad0.tour_access && ad0.tour_access.allow_emails) || []).slice();
        var phones0 = ((ad0.tour_access && ad0.tour_access.allow_phones) || []).slice();
        var allowOn = emails0.length + phones0.length > 0;
        var contactEmail = Tour.normalizeEmail ? Tour.normalizeEmail(contact.email) : String(contact.email || "").toLowerCase();
        var contactPhone = Tour.normalizePhone ? Tour.normalizePhone(contact.phone) : String(contact.phone || "").replace(/\D/g, "");
        if (contactEmail && emails0.indexOf(contactEmail) === -1) emails0 = emails0.concat([contactEmail]);
        if (contactPhone && phones0.indexOf(contactPhone) === -1) phones0 = phones0.concat([contactPhone]);
        root.querySelector("#ctTourEmails").value = emails0.join("\n");
        root.querySelector("#ctTourPhones").value = phones0.join("\n");
        root.querySelector("#ctTourAllow").checked = allowOn || (!ad0.tour_access || !ad0.tour_access.token);
      } else {
        root.querySelector("#ctTourEmails").value = contact.email || "";
        root.querySelector("#ctTourPhones").value = contact.phone || "";
      }

      if (existingTour) showLinks(existingTour.ta, existingTour.property);

      if (msgText) {
        var m = root.querySelector("#ctTourMsg");
        if (m) {
          m.textContent = msgText;
          m.style.color = ok ? "#166534" : "#9a3412";
        }
      }

      root.querySelector("#ctTourSave").onclick = function () {
        save(list);
      };
    }

    function showLinks(ta, prop) {
      var box = root.querySelector("#ctTourLinks");
      if (!box || !ta || !ta.token) return;
      var lbc = publicUrl(ta.token, "leboncoin");
      var site = publicUrl(ta.token, "site");
      box.innerHTML =
        '<p class="pub-tour-url">' +
        esc(lbc) +
        "</p>" +
        '<div class="pub-media-actions">' +
        '<button type="button" class="btn btn-primary btn-sm" data-copy="' +
        esc(lbc) +
        '">Copier Leboncoin</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-copy="' +
        esc(site) +
        '">Copier site</button>' +
        '<a class="btn btn-ghost btn-sm" target="_blank" rel="noopener" href="./immobilier/visite.html?t=' +
        encodeURIComponent(ta.token) +
        '">Ouvrir la page visite</a>' +
        '<a class="btn btn-ghost btn-sm" href="./crm-immo-pubs.html?property=' +
        encodeURIComponent(prop.id) +
        '">Réglages avancés</a>' +
        "</div>" +
        "<p class=\"pub-hint\">Pour tester : ouvre le lien, utilise l’e-mail / tél. de <strong>" +
        esc(contactName(contact)) +
        "</strong>.</p>";
      box.querySelectorAll("[data-copy]").forEach(function (btn) {
        btn.onclick = function () {
          var u = btn.getAttribute("data-copy");
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(u).then(function () {
              var m = root.querySelector("#ctTourMsg");
              if (m) {
                m.textContent = "Lien copié.";
                m.style.color = "#166534";
              }
            });
          }
        };
      });
    }

    function save(list) {
      var propId = root.querySelector("#ctTourProp").value;
      var url = root.querySelector("#ctTourUrl").value.trim();
      var verify = root.querySelector("#ctTourVerify").value;
      var period = root.querySelector("#ctTourPeriod").value;
      var durationVal = root.querySelector("#ctTourDuration").value;
      var durationUnit = root.querySelector("#ctTourDurationUnit").value;
      var maxViews = root.querySelector("#ctTourMaxViews").value;
      var durationStart = root.querySelector("#ctTourDurationStart").value;
      var extraEmails = root.querySelector("#ctTourEmails").value;
      var extraPhones = root.querySelector("#ctTourPhones").value;
      var allow = root.querySelector("#ctTourAllow").checked;
      var msg = root.querySelector("#ctTourMsg");
      if (!url || !/^https:\/\//i.test(url)) {
        msg.textContent = "Colle un lien https de visite 3D.";
        msg.style.color = "#9a3412";
        return;
      }
      var prop = propId && propId !== "__new__" ? Store.getProperty(propId) : null;
      if (!prop) {
        prop = {
          title: (contactName(contact) || "Visite") + " — bien test",
          city: contact.city || "Nancy",
          status: "mandat",
          owner_contact_id: contact.id,
          buyer_contact_id: contact.id,
        };
      }

      var bag = AdLib.getAdMeta(prop);
      var ad = bag.ad || {};
      var emails = Tour.parseList ? Tour.parseList(extraEmails, "email") : [];
      var phones = Tour.parseList ? Tour.parseList(extraPhones, "phone") : [];
      var contactEmail = Tour.normalizeEmail ? Tour.normalizeEmail(contact.email) : "";
      var contactPhone = Tour.normalizePhone ? Tour.normalizePhone(contact.phone) : "";
      var extraPeople = emails.some(function (e) { return e !== contactEmail; })
        || phones.some(function (p) { return p !== contactPhone; });
      if (extraPeople) allow = true;
      if (allow && contactEmail && emails.indexOf(contactEmail) === -1) {
        emails = emails.concat([contactEmail]);
      }
      if (allow && contactPhone && phones.indexOf(contactPhone) === -1) {
        phones = phones.concat([contactPhone]);
      }

      var updated = AdLib.applyAdToProperty(prop, {
        headline: ad.headline || prop.title,
        body: ad.body || prop.description || "",
        photos: ad.photos || [],
        videos: ad.videos || [],
        virtual_tour: url,
        listing_url: ad.listing_url || "",
        channel_public: true,
        tour_gate: true,
        tour_verify_mode: verify,
        tour_period_mode: period,
        tour_days: period === "limited" && durationUnit === "days" ? durationVal : period === "unlimited" ? 0 : "",
        tour_duration_value: period === "limited" ? durationVal : "",
        tour_duration_unit: durationUnit,
        tour_duration_start: durationStart,
        tour_max_views: maxViews,
        tour_max_per_contact: 8,
        tour_allow_emails: allow ? emails : "",
        tour_allow_phones: allow ? phones : "",
        tour_bind_site: true,
        tour_bind_leboncoin: true,
        tour_bind_seloger: true,
        tour_bind_meta: true,
        tour_bind_other: true,
      });
      if (!updated.owner_contact_id) updated.owner_contact_id = contact.id;
      Store.upsertProperty(updated);
      if (allow) {
        Store.upsertParty({
          property_id: updated.id,
          contact_id: contact.id,
          role: "acheteur",
          name: contactName(contact),
          email: contact.email || "",
          phone: contact.phone || "",
        });
      }
      var ta = AdLib.getAdMeta(updated).ad.tour_access;
      paint("Lien créé pour " + contactName(contact) + ".", true);
      root.querySelector("#ctTourProp").value = updated.id;
      root.querySelector("#ctTourUrl").value = url;
      showLinks(ta, updated);
    }

    Store.syncFromApi().then(function () {
      paint();
      if (location.hash === "#visite" || new URLSearchParams(location.search).get("tour") === "1") {
        root.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  window.CrmContactTour = { mount: mount };
})();
