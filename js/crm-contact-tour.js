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
    var selectedLinkId = "";
    var storedTourUrl = "";
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
        var adx = AdLib.getAdMeta(p).ad;
        var found = Tour.listTourLinks ? Tour.listTourLinks(adx) : adx.tour_access ? [adx.tour_access] : [];
        var ta = found[0] || adx.tour_access;
        if (ta && ta.token) existingTour = { property: p, ta: ta };
      });

      var interestHtml = list.length
        ? '<div class="tour-req-card tour-req-pending" id="ctTourInterest">' +
          "<strong>Biens intéressés</strong>" +
          '<p class="pub-hint" style="margin:4px 0 8px">Là où ce prospect a demandé un code — tu pourras lui proposer d’autres liens.</p>' +
          list
            .map(function (p) {
              return (
                '<div class="tour-req-meta" style="margin-top:8px">' +
                "<strong>" +
                esc(p.title || p.city || p.id) +
                "</strong>" +
                (p.city ? " · " + esc(p.city) : "") +
                '<div class="pub-media-actions">' +
                '<button type="button" class="btn btn-primary btn-sm" data-pick-prop="' +
                esc(p.id) +
                '">Proposer un lien</button>' +
                '<a class="btn btn-ghost btn-sm" href="./crm-immo-pubs.html?property=' +
                encodeURIComponent(p.id) +
                '">Fiche pub</a>' +
                "</div></div>"
              );
            })
            .join("") +
          "</div>"
        : '<p class="pub-hint" id="ctTourInterest">Aucun bien intéressé pour l’instant — dès qu’il demandera un code, le bien apparaîtra ici.</p>';

      root.innerHTML =
        '<div class="panel-head"><h2>Visite virtuelle (test avec ce contact)</h2>' +
        '<a class="btn btn-ghost btn-sm" href="./crm-immo-pubs.html">Pubs mandats</a></div>' +
        "<p class=\"pub-hint\">Chaque demande de code crée un <strong>lead</strong> + ce <strong>prospect</strong>, avec le bien intéressé. " +
        "Tu valides ou tu déclines, puis tu peux leur <strong>proposer d’autres liens</strong> ici.</p>" +
        interestHtml +
        '<label>Bien lié<select id="ctTourProp">' +
        options +
        "</select></label>" +
        '<label>Lien à régler<select id="ctTourLinkSelect"><option value="">— Nouveau lien —</option></select></label>' +
        '<label>Nom du lien<input id="ctTourName" type="text" maxlength="80" placeholder="ex. Leboncoin Dombasle, Test Michèle" /></label>' +
        '<div id="ctTourUrlBox">' +
        '<p class="pub-hint" id="ctTourUrlStatus">Lien 3D masqué — jamais publié sur Leboncoin / le site.</p>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="ctTourUrlEdit">Coller / remplacer le lien 3D (reste privé)</button>' +
        '<label id="ctTourUrlLabel" hidden>Nouveau lien 3D (privé)<input id="ctTourUrl" type="url" autocomplete="off" placeholder="https://…" /></label>' +
        "</div>" +
        '<div class="row2">' +
        '<label>Disponibilité<select id="ctTourAvailability">' +
        '<option value="active" selected>Actif</option>' +
        '<option value="paused">En pause (URL inchangée)</option>' +
        "</select></label>" +
        '<label>Visibilité<select id="ctTourVisibility">' +
        '<option value="listed" selected>Visible sur le site</option>' +
        '<option value="unlisted">Masqué sur le site</option>' +
        "</select></label></div>" +
        '<div class="row2">' +
        '<label>Vérif<select id="ctTourVerify">' +
        '<option value="email" selected>E-mail (gratuit)</option>' +
        '<option value="sms">SMS (désactivé, payant)</option>' +
        '<option value="both">E-mail + SMS (SMS désactivé)</option>' +
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
        '<button type="button" class="btn btn-primary btn-sm" id="ctTourSave">Enregistrer les réglages (URL inchangée)</button>' +
        '<button type="button" class="btn btn-ghost btn-sm" id="ctTourNew">Créer un autre lien nommé</button>' +
        "</div>" +
        '<p id="ctTourMsg" class="pub-hint"></p>' +
        '<div id="ctTourLinks"></div>' +
        '<div id="ctTourRequests" class="tour-req-inbox"></div>';

      if (list[0]) {
        var sel = root.querySelector("#ctTourProp");
        if (sel) sel.value = list[0].id;
        var ad0 = AdLib.getAdMeta(list[0]).ad;
        storedTourUrl = ad0.virtual_tour || storedTourUrl || "";
        var urlStatus = root.querySelector("#ctTourUrlStatus");
        if (urlStatus) {
          urlStatus.textContent = storedTourUrl
            ? "Lien 3D enregistré et masqué — un visiteur intelligent ne peut pas le récupérer ici."
            : "Aucun lien 3D : clique « Coller / remplacer » une seule fois (il restera privé).";
        }
        var links0 = Tour.listTourLinks ? Tour.listTourLinks(ad0) : ad0.tour_access ? [ad0.tour_access] : [];
        var selLink = links0[0] || ad0.tour_access || {};
        if (selectedLinkId) {
          links0.forEach(function (l) {
            if (l.id === selectedLinkId || l.token === selectedLinkId) selLink = l;
          });
        }
        var linkSel = root.querySelector("#ctTourLinkSelect");
        if (linkSel) {
          linkSel.innerHTML =
            '<option value="">＋ Créer un lien indépendant</option>' +
            links0
              .map(function (l) {
                return (
                  '<option value="' +
                  esc(l.id || l.token) +
                  '">' +
                  esc((l.name || "Visite") + (l.availability === "paused" ? " · pause" : "") + (l.visibility === "unlisted" ? " · masqué" : "")) +
                  "</option>"
                );
              })
              .join("");
          if (selLink && (selLink.id || selLink.token)) linkSel.value = selLink.id || selLink.token;
        }
        if (selLink.name) root.querySelector("#ctTourName").value = selLink.name;
        if (selLink.availability) root.querySelector("#ctTourAvailability").value = selLink.availability;
        if (selLink.visibility) root.querySelector("#ctTourVisibility").value = selLink.visibility;
        if (selLink.verify_mode) root.querySelector("#ctTourVerify").value = selLink.verify_mode;
        if (selLink.period_mode) root.querySelector("#ctTourPeriod").value = selLink.period_mode;
        if (selLink.duration_value) root.querySelector("#ctTourDuration").value = String(selLink.duration_value);
        if (selLink.duration_unit) root.querySelector("#ctTourDurationUnit").value = selLink.duration_unit;
        if (selLink.max_views != null) root.querySelector("#ctTourMaxViews").value = String(selLink.max_views);
        if (selLink.duration_start) root.querySelector("#ctTourDurationStart").value = selLink.duration_start;
        var emails0 = (selLink.allow_emails || []).slice();
        var phones0 = (selLink.allow_phones || []).slice();
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

      if (existingTour) showLinks(existingTour.ta, existingTour.property, AdLib.getAdMeta(existingTour.property).ad);

      if (msgText) {
        var m = root.querySelector("#ctTourMsg");
        if (m) {
          m.textContent = msgText;
          m.style.color = ok ? "#166534" : "#9a3412";
        }
      }

      root.querySelector("#ctTourSave").onclick = function () {
        save(list, false);
      };
      var newBtn = root.querySelector("#ctTourNew");
      if (newBtn) {
        newBtn.onclick = function () {
          save(list, true);
        };
      }
      var linkSelEl = root.querySelector("#ctTourLinkSelect");
      if (linkSelEl) {
        linkSelEl.onchange = function () {
          selectedLinkId = linkSelEl.value || "";
          if (selectedLinkId) paint();
        };
      }
      var editUrl = root.querySelector("#ctTourUrlEdit");
      if (editUrl) {
        editUrl.onclick = function () {
          var lab = root.querySelector("#ctTourUrlLabel");
          var inp = root.querySelector("#ctTourUrl");
          if (lab) lab.hidden = false;
          if (inp) {
            inp.hidden = false;
            inp.value = "";
            inp.focus();
          }
        };
      }
      root.querySelectorAll("[data-pick-prop]").forEach(function (btn) {
        btn.onclick = function () {
          var sel = root.querySelector("#ctTourProp");
          if (sel) sel.value = btn.getAttribute("data-pick-prop") || "";
          var nameEl = root.querySelector("#ctTourName");
          if (nameEl && !String(nameEl.value || "").trim()) nameEl.value = "Lien proposé";
          var msg = root.querySelector("#ctTourMsg");
          if (msg) {
            msg.textContent = "Bien sélectionné — crée ou copie un lien à lui envoyer.";
            msg.style.color = "#166534";
          }
          sel && sel.scrollIntoView({ behavior: "smooth", block: "center" });
        };
      });
    }

    function showLinks(ta, prop, ad) {
      var box = root.querySelector("#ctTourLinks");
      if (!box || !ta || !ta.token) return;
      var all = Tour.listTourLinks && ad ? Tour.listTourLinks(ad) : [ta];
      if (!all.length) all = [ta];
      var rows = all
        .map(function (l) {
          var lbc = publicUrl(l.token, "leboncoin");
          var site = publicUrl(l.token, "site");
          return (
            '<div class="pub-tour-named">' +
            "<strong>" +
            esc(l.name || "Visite virtuelle") +
            "</strong>" +
            (l.availability === "paused" ? " · en pause" : "") +
            (l.visibility === "unlisted" ? " · masqué site" : "") +
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
            encodeURIComponent(l.token) +
            '">Ouvrir</a>' +
            '<button type="button" class="btn btn-ghost btn-sm" data-give-code="' +
            esc(l.token) +
            '">Donner un code (10 min)</button>' +
            "</div></div>"
          );
        })
        .join("");
      box.innerHTML =
        rows +
        '<div class="pub-media-actions"><a class="btn btn-ghost btn-sm" href="./crm-immo-pubs.html?property=' +
        encodeURIComponent(prop.id) +
        '">Réglages avancés</a></div>' +
        "<p class=\"pub-hint\">L’URL ne change pas quand tu modifies durée / dispo / visibilité. " +
        "<strong>Valider</strong> envoie le code. <strong>Décliner</strong> refuse la visite. " +
        "<strong>Donner un code</strong> valide aussi la demande et copie un code (10 min) à dicter.</p>";
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
      box.querySelectorAll("[data-give-code]").forEach(function (btn) {
        btn.onclick = function () {
          var tok = btn.getAttribute("data-give-code");
          var msg = root.querySelector("#ctTourMsg");
          var crmTok = "";
          try {
            crmTok = localStorage.getItem("lo_token") || "";
          } catch (e) {}
          if (!contact.email && !contact.phone) {
            if (msg) {
              msg.textContent = "Ajoute un e-mail ou un tél. sur la fiche pour générer un code.";
              msg.style.color = "#9a3412";
            }
            return;
          }
          if (msg) {
            msg.textContent = "Génération du code…";
            msg.style.color = "#334155";
          }
          fetch("/api/immo-tour-access", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: crmTok ? "Bearer " + crmTok : "",
            },
            body: JSON.stringify({
              action: "advisor_code",
              token: tok,
              email: contact.email || "",
              phone: contact.phone || "",
            }),
          })
            .then(function (r) {
              return r.json();
            })
            .then(function (d) {
              var code = (d && (d.email_code || d.phone_code)) || "";
              if (!d || !d.ok || !code) {
                if (msg) {
                  msg.textContent = (d && d.error) || "Impossible de générer le code (connexion CRM).";
                  msg.style.color = "#9a3412";
                }
                return;
              }
              if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(code);
              }
              if (msg) {
                msg.textContent =
                  "Code pour " +
                  contactName(contact) +
                  " : " +
                  code +
                  " (valable 10 min). Copié — à donner de vive voix. Sur la page visite : Valider le code.";
                msg.style.color = "#166534";
              }
            })
            .catch(function () {
              if (msg) {
                msg.textContent = "Erreur réseau.";
                msg.style.color = "#9a3412";
              }
            });
        };
      });
      var reqBox = root.querySelector("#ctTourRequests");
      if (reqBox && window.CrmImmoTourRequests) {
        window.CrmImmoTourRequests.mount(reqBox, {
          title: "Demandes sur ces liens",
          propertyId: prop && prop.id,
        });
      }
    }

    function save(list, createNew) {
      var propId = root.querySelector("#ctTourProp").value;
      var typedUrl = root.querySelector("#ctTourUrl") ? root.querySelector("#ctTourUrl").value.trim() : "";
      var url = typedUrl || storedTourUrl;
      var linkName = root.querySelector("#ctTourName").value;
      var availability = root.querySelector("#ctTourAvailability").value;
      var visibility = root.querySelector("#ctTourVisibility").value;
      var linkId = root.querySelector("#ctTourLinkSelect")
        ? root.querySelector("#ctTourLinkSelect").value
        : "";
      if (!createNew && !linkId) createNew = true;
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
        msg.textContent = "Colle d’abord le lien 3D (bouton « Coller / remplacer », il restera privé).";
        msg.style.color = "#9a3412";
        return;
      }
      storedTourUrl = url;
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
        tour_gate: availability !== "paused",
        tour_name: linkName || (createNew ? "Nouveau lien" : "Visite virtuelle"),
        tour_availability: availability,
        tour_visibility: visibility,
        tour_link_id: createNew ? "" : linkId || selectedLinkId,
        tour_create_link: !!createNew,
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
      var savedAd = AdLib.getAdMeta(updated).ad;
      var savedLinks = Tour.listTourLinks ? Tour.listTourLinks(savedAd) : savedAd.tour_access ? [savedAd.tour_access] : [];
      var current =
        (createNew && savedLinks.length ? savedLinks[savedLinks.length - 1] : null) ||
        savedLinks.filter(function (l) {
          return l.id === linkId || l.token === linkId;
        })[0] ||
        savedAd.tour_access;
      selectedLinkId = (current && (current.id || current.token)) || "";
      var doneMsg = createNew
        ? "Nouveau lien « " + ((current && current.name) || "Visite") + " » créé. Les URLs déjà publiées restent valables."
        : current && current.token
          ? "Réglages de « " + (current.name || "Visite") + " » enregistrés. L’URL Leboncoin est inchangée."
          : "Lien enregistré pour " + contactName(contact) + ".";
      paint(doneMsg, true);
      if (root.querySelector("#ctTourProp")) root.querySelector("#ctTourProp").value = updated.id;
      showLinks(current, updated, savedAd);
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
