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
        "<p class=\"pub-hint\">Colle ton lien Matterport / 3D. <strong>" +
        esc(contactName(contact)) +
        "</strong> sera ajouté aux personnes autorisées (e-mail + tél. de la fiche). " +
        "Le lien public à coller sur Leboncoin / le site se génère ensuite.</p>" +
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
        '<option value="limited" selected>30 jours</option>' +
        '<option value="unlimited">Illimitée</option>' +
        '<option value="mandate">Mandat exclusif</option>' +
        "</select></label></div>" +
        '<label class="pub-checks"><input type="checkbox" id="ctTourAllow" checked /> Autoriser uniquement ce contact (et ceux déjà listés)</label>' +
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
      var emails = (ad.tour_access && ad.tour_access.allow_emails) || [];
      var phones = (ad.tour_access && ad.tour_access.allow_phones) || [];
      if (allow) {
        if (contact.email && emails.indexOf(String(contact.email).toLowerCase()) === -1) {
          emails = emails.concat([contact.email]);
        }
        if (contact.phone) phones = phones.concat([contact.phone]);
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
        tour_days: period === "limited" ? 30 : period === "unlimited" ? 0 : "",
        tour_max_views: 50,
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
