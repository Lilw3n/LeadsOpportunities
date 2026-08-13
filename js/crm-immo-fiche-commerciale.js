/**
 * Fiche commerciale bien — vue présentation (pas l’éditeur agent).
 * Layout : héros + récit | caractéristiques | contacts · Diaporama · Documents publics
 */
window.CrmImmoFicheCommerciale = (function () {
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function euro(n) {
    if (n == null || n === "" || isNaN(Number(n))) return "—";
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(Number(n));
  }

  function d(prop, sec, key) {
    var bucket = (prop.details && prop.details[sec]) || {};
    var v = bucket[key];
    if (v == null || v === "" || v === "any") return "";
    return v;
  }

  function firstImage(prop) {
    var imgs = Array.isArray(prop.images) ? prop.images.filter(Boolean) : [];
    return imgs[0] || "";
  }

  function allImages(prop) {
    return Array.isArray(prop.images) ? prop.images.filter(Boolean) : [];
  }

  function typeLabel(prop, Schema) {
    if (!Schema) return prop.property_type || "";
    var t = (Schema.TYPES || []).find(function (x) {
      return x.id === prop.property_type;
    });
    return (t && t.label) || prop.property_type || "";
  }

  function txLabel(prop, Schema) {
    if (!Schema) return prop.transaction || "";
    var t = (Schema.TRANSACTIONS || []).find(function (x) {
      return x.id === prop.transaction;
    });
    return (t && t.label) || (prop.transaction === "location" ? "Location" : "À vendre");
  }

  function sourceLabel(prop, Matcher) {
    if (!Matcher) return prop.listing_source || "";
    var s = (Matcher.LISTING_SOURCES || []).find(function (x) {
      return x.id === prop.listing_source;
    });
    return (s && s.label) || prop.listing_source || "";
  }

  function headline(prop, Schema) {
    var ref = (prop.ref || prop.id || "").toString().slice(-6).toUpperCase();
    var type = typeLabel(prop, Schema).toUpperCase();
    var tx = txLabel(prop, Schema).toUpperCase();
    var city = (prop.city || d(prop, "localisation", "ville") || "").toUpperCase();
    var rooms = prop.rooms || d(prop, "surfaces", "nb_pieces") || "";
    var surf = prop.surface_m2 || d(prop, "surfaces", "surface_habitable") || "";
    var price = prop.price_fai || prop.price_net || d(prop, "finances", "prix_fai") || d(prop, "finances", "prix_net");
    var bits = ["REF : " + ref];
    bits.push("(" + type + (tx ? " · " + tx : "") + ")");
    if (city) bits.push(city);
    if (rooms) bits.push(rooms + " PIÈCE(S)");
    if (surf) bits.push(surf + " M²");
    if (price) bits.push(euro(price));
    return bits.join(" — ");
  }

  function narrative(prop) {
    var parts = [];
    if (prop.description) parts.push(String(prop.description).trim());
    var obs = d(prop, "commentaires", "observations_generales");
    var pf = d(prop, "commentaires", "points_forts");
    var info = d(prop, "commentaires", "infos_complementaires");
    if (obs) parts.push(obs);
    if (pf) parts.push("Points forts : " + pf);
    if (info) parts.push(info);
    return parts.join("\n\n") || "Aucune description commerciale pour l’instant — complétez-la dans l’édition.";
  }

  function addressLine(prop) {
    var a = prop.address || d(prop, "localisation", "adresse") || "";
    var cp = prop.postal_code || d(prop, "localisation", "code_postal") || "";
    var v = prop.city || d(prop, "localisation", "ville") || "";
    return [a, (cp + " " + v).trim()].filter(Boolean).join(" · ");
  }

  function charGroups(prop, Schema) {
    var groups = [];
    groups.push({
      title: "Général",
      rows: [
        ["Type de bien", typeLabel(prop, Schema)],
        ["Transaction", txLabel(prop, Schema)],
        ["Statut", (window.CrmImmoMatcher && window.CrmImmoMatcher.propertyStatusLabel(prop.status)) || prop.status || "—"],
      ],
    });
    groups.push({
      title: "Localisation",
      rows: [
        ["Adresse", prop.address || d(prop, "localisation", "adresse") || "—"],
        ["Code postal", prop.postal_code || d(prop, "localisation", "code_postal") || "—"],
        ["Ville", prop.city || d(prop, "localisation", "ville") || "—"],
        ["Quartier", d(prop, "localisation", "quartier") || "—"],
      ],
    });
    var prixFai = prop.price_fai != null ? prop.price_fai : d(prop, "finances", "prix_fai");
    var prixNet = prop.price_net != null ? prop.price_net : d(prop, "finances", "prix_net");
    var prixAnnonce = d(prop, "finances", "prix_annonce") || prop.price_listing;
    var finRows = [
      ["Prix FAI", euro(prixFai)],
      ["Prix net", euro(prixNet)],
      ["Honoraires", euro(prop.honoraires != null ? prop.honoraires : d(prop, "finances", "honoraires"))],
    ];
    if (prixAnnonce) finRows.unshift(["Prix annonce d’origine", euro(prixAnnonce)]);
    groups.push({ title: "Aspects financiers", rows: finRows });
    groups.push({
      title: "Surfaces & volumes",
      rows: [
        ["Surface", (prop.surface_m2 || d(prop, "surfaces", "surface_habitable") || "—") + (prop.surface_m2 || d(prop, "surfaces", "surface_habitable") ? " m²" : "")],
        ["Terrain", d(prop, "surfaces", "surface_terrain") ? d(prop, "surfaces", "surface_terrain") + " m²" : "—"],
        ["Pièces", String(prop.rooms || d(prop, "surfaces", "nb_pieces") || "—")],
        ["Chambres", String(prop.bedrooms || d(prop, "surfaces", "nb_chambres") || "—")],
      ],
    });
    var dpe = prop.dpe || d(prop, "diagnostics", "conso_energie_primaire") || "";
    var ges = prop.ges || d(prop, "diagnostics", "ges") || "";
    if (dpe || ges) {
      groups.push({
        title: "Diagnostics",
        rows: [
          ["DPE", dpe || "—"],
          ["GES", ges || "—"],
        ],
      });
    }
    var ext = [];
    if (prop.has_garden || d(prop, "exterieur", "jardin") === "yes") ext.push(["Jardin", "Oui"]);
    if (prop.has_terrace || d(prop, "exterieur", "terrasse") === "yes") ext.push(["Terrasse", "Oui"]);
    if (prop.has_garage || d(prop, "exterieur", "garage") === "yes") ext.push(["Garage", "Oui"]);
    if (prop.has_balcony || d(prop, "exterieur", "balcon") === "yes") ext.push(["Balcon", "Oui"]);
    if (prop.has_elevator || d(prop, "localisation", "ascenseur") === "yes") ext.push(["Ascenseur", "Oui"]);
    if (ext.length) groups.push({ title: "Équipements", rows: ext });
    return groups.filter(function (g) {
      return g.rows.some(function (r) {
        return r[1] && r[1] !== "—";
      });
    });
  }

  function pickContacts(prop, Store) {
    var parties = Store && Store.listParties ? Store.listParties(prop.id) : [];
    var agence =
      parties.find(function (p) {
        return p.role === "agence" || p.role === "agent";
      }) || null;
    var vendeur =
      parties.find(function (p) {
        return p.role === "vendeur" || p.role === "mandant";
      }) || null;
    var gerance = d(prop, "gestion", "agence_gerance");
    return { agence: agence, vendeur: vendeur, gerance: gerance, parties: parties };
  }

  function contactCard(title, person, fallbackText) {
    if (!person && !fallbackText) {
      return (
        '<div class="fc-contact"><h4>' +
        esc(title) +
        '</h4><p class="fc-muted">Non renseigné — ajoutez un contact dans l’onglet Vendeur (édition).</p></div>'
      );
    }
    if (!person) {
      return '<div class="fc-contact"><h4>' + esc(title) + "</h4><p>" + esc(fallbackText) + "</p></div>";
    }
    var tel = person.phone
      ? '<a class="fc-link" href="tel:' + esc(person.phone.replace(/\s/g, "")) + '">' + esc(person.phone) + "</a>"
      : "";
    var mail = person.email
      ? '<a class="fc-link" href="mailto:' + esc(person.email) + '">' + esc(person.email) + "</a>"
      : "";
    return (
      '<div class="fc-contact"><h4>' +
      esc(title) +
      "</h4><p class=\"fc-name\">" +
      esc(person.name || "—") +
      "</p>" +
      (person.company ? "<p>" + esc(person.company) + "</p>" : "") +
      (person.address ? "<p>" + esc(person.address) + "</p>" : "") +
      (tel ? "<p>" + tel + "</p>" : "") +
      (mail ? "<p>" + mail + "</p>" : "") +
      "</div>"
    );
  }

  function priceDeltaHtml(prop) {
    var current = Number(prop.price_fai || prop.price_net || d(prop, "finances", "prix_fai") || 0);
    var listed = Number(d(prop, "finances", "prix_annonce") || prop.price_listing || 0);
    if (!current || !listed || current === listed) return "";
    var diff = current - listed;
    var pct = Math.round((diff / listed) * 1000) / 10;
    var down = diff < 0;
    return (
      '<span class="fc-delta ' +
      (down ? "down" : "up") +
      '" title="Écart vs prix annonce">' +
      (down ? "↓" : "↑") +
      " " +
      euro(Math.abs(diff)) +
      " (" +
      (down ? "" : "+") +
      pct +
      "%)</span>"
    );
  }

  function metaChips(prop, Matcher) {
    var chips = [];
    var src = sourceLabel(prop, Matcher);
    if (src) chips.push(src);
    if (prop.dpe) chips.push("DPE " + prop.dpe);
    if (prop.listing_url) chips.push("Annonce liée");
    return chips
      .map(function (c) {
        return '<span class="fc-chip">' + esc(c) + "</span>";
      })
      .join("");
  }

  function renderFiche(prop, ctx) {
    var img = firstImage(prop);
    var groups = charGroups(prop, ctx.Schema);
    var contacts = pickContacts(prop, ctx.Store);
    var delta = priceDeltaHtml(prop);
    return (
      '<div class="fc-grid">' +
      '<div class="fc-col-media">' +
      '<div class="fc-hero' +
      (img ? "" : " is-empty") +
      '">' +
      (img
        ? '<img src="' + esc(img) + '" alt="" loading="lazy" />'
        : '<div class="fc-hero-ph"><span>Photo principale</span><small>Ajoutez des images dans l’édition</small></div>') +
      "</div>" +
      '<div class="fc-story">' +
      "<h3>Description du bien</h3>" +
      '<p class="fc-addr">' +
      esc(addressLine(prop) || "Adresse à compléter") +
      "</p>" +
      '<div class="fc-chips">' +
      metaChips(prop, ctx.Matcher) +
      delta +
      "</div>" +
      '<p class="fc-desc">' +
      esc(narrative(prop)).replace(/\n/g, "<br>") +
      "</p>" +
      (prop.listing_url
        ? '<p><a class="fc-link" href="' +
          esc(prop.listing_url) +
          '" target="_blank" rel="noopener">Voir l’annonce d’origine</a></p>'
        : "") +
      "</div></div>" +
      '<div class="fc-col-specs">' +
      groups
        .map(function (g) {
          return (
            '<section class="fc-spec"><h4>' +
            esc(g.title) +
            "</h4><dl>" +
            g.rows
              .map(function (r) {
                return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>";
              })
              .join("") +
            "</dl></section>"
          );
        })
        .join("") +
      "</div>" +
      '<aside class="fc-col-side">' +
      contactCard("Agence / mandataire", contacts.agence, contacts.gerance || "") +
      contactCard("Vendeur / mandant", contacts.vendeur, null) +
      '<div class="fc-side-actions">' +
      '<a class="btn btn-primary" href="./crm-immo-matching.html?propertyId=' +
      encodeURIComponent(prop.id) +
      '">Matching acquéreurs</a>' +
      '<a class="btn btn-ghost" id="fcFinLink" href="./crm-agency-fees.html">Financement</a>' +
      "</div></aside></div>"
    );
  }

  function renderDiaporama(prop) {
    var imgs = allImages(prop);
    if (!imgs.length) {
      return '<div class="fc-empty">Aucune photo — passez en édition → Images.</div>';
    }
    return (
      '<div class="fc-diapo" data-idx="0">' +
      '<div class="fc-diapo-stage"><img id="fcDiapoImg" src="' +
      esc(imgs[0]) +
      '" alt="" /></div>' +
      '<div class="fc-diapo-bar">' +
      '<button type="button" class="btn btn-ghost" data-diapo="-1">←</button>' +
      '<span class="fc-diapo-count">1 / ' +
      imgs.length +
      "</span>" +
      '<button type="button" class="btn btn-ghost" data-diapo="1">→</button>' +
      '<button type="button" class="btn btn-ghost" data-diapo="play">Lecture</button>' +
      "</div>" +
      '<div class="fc-diapo-thumbs">' +
      imgs
        .map(function (u, i) {
          return (
            '<button type="button" class="fc-thumb' +
            (i === 0 ? " is-on" : "") +
            '" data-thumb="' +
            i +
            '"><img src="' +
            esc(u) +
            '" alt="" /></button>'
          );
        })
        .join("") +
      "</div></div>"
    );
  }

  function renderDocs(prop, Store) {
    var docs = Store && Store.listDocuments ? Store.listDocuments(prop.id) : [];
    var publicish = docs.filter(function (d) {
      var t = String(d.doc_type || "") + " " + String(d.title || "");
      return /public|annonce|fiche|mandat|diag|dpe/i.test(t) || d.visibility === "public";
    });
    var checklist = prop.docs_checklist || {};
    var keys = Object.keys(checklist);
    return (
      '<div class="fc-docs">' +
      "<h3>Documents publics / dossier</h3>" +
      (publicish.length
        ? "<ul class=\"fc-doc-list\">" +
          publicish
            .map(function (d) {
              return (
                "<li><strong>" +
                esc(d.title || d.doc_type) +
                "</strong> · " +
                esc(d.status || "draft") +
                ' · <a href="./crm-immo-documents.html?propertyId=' +
                encodeURIComponent(prop.id) +
                "&docId=" +
                encodeURIComponent(d.id) +
                '">Ouvrir</a></li>'
              );
            })
            .join("") +
          "</ul>"
        : '<p class="fc-muted">Pas encore de document marqué public. Utilisez Documents immo ou Immo cloud.</p>') +
      (keys.length
        ? "<h4>Checklist pièces</h4><ul class=\"fc-doc-list\">" +
          keys
            .slice(0, 40)
            .map(function (k) {
              var row = checklist[k] || {};
              return (
                "<li>" +
                esc(k) +
                (row.recu ? ' <span class="fc-chip ok">Reçu</span>' : ' <span class="fc-chip">Attendu</span>') +
                "</li>"
              );
            })
            .join("") +
          "</ul>"
        : "") +
      '<p><a class="btn btn-ghost" href="./crm-immo-documents.html?propertyId=' +
      encodeURIComponent(prop.id) +
      '">Éditeur documents</a></p></div>'
    );
  }

  function wireDiaporama(root, prop) {
    var imgs = allImages(prop);
    if (!imgs.length) return;
    var idx = 0;
    var timer = null;
    var stage = root.querySelector("#fcDiapoImg");
    var count = root.querySelector(".fc-diapo-count");
    function show(i) {
      idx = (i + imgs.length) % imgs.length;
      if (stage) stage.src = imgs[idx];
      if (count) count.textContent = idx + 1 + " / " + imgs.length;
      root.querySelectorAll(".fc-thumb").forEach(function (t) {
        t.classList.toggle("is-on", Number(t.getAttribute("data-thumb")) === idx);
      });
    }
    root.querySelectorAll("[data-diapo]").forEach(function (btn) {
      btn.onclick = function () {
        var v = btn.getAttribute("data-diapo");
        if (v === "play") {
          if (timer) {
            clearInterval(timer);
            timer = null;
            btn.textContent = "Lecture";
            return;
          }
          btn.textContent = "Pause";
          timer = setInterval(function () {
            show(idx + 1);
          }, 3200);
          return;
        }
        show(idx + Number(v));
      };
    });
    root.querySelectorAll("[data-thumb]").forEach(function (t) {
      t.onclick = function () {
        show(Number(t.getAttribute("data-thumb")));
      };
    });
  }

  function shareUrl(prop) {
    var u = new URL(location.href);
    u.searchParams.set("id", prop.id);
    u.searchParams.set("view", "commercial");
    return u.toString();
  }

  async function share(prop) {
    var url = shareUrl(prop);
    var title = prop.title || "Bien immobilier";
    if (navigator.share) {
      try {
        await navigator.share({ title: title, text: headline(prop, window.CrmImmoSchema), url: url });
        return;
      } catch (e) {
        /* fall through */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      alert("Lien fiche commerciale copié.");
    } catch (e2) {
      prompt("Copiez le lien :", url);
    }
  }

  function printTechSheet(prop, ctx) {
    var groups = charGroups(prop, ctx.Schema);
    var w = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
    if (!w) {
      alert("Autorisez les pop-ups pour imprimer la fiche technique.");
      return;
    }
    w.document.write(
      "<!doctype html><html lang=fr><head><meta charset=utf-8><title>Fiche technique — " +
        esc(prop.title || "") +
        "</title><style>body{font-family:Georgia,serif;padding:32px;color:#0f172a}h1{font-size:1.25rem}h2{font-size:.95rem;margin:1.2rem 0 .4rem;color:#1e4f8a}dl{display:grid;grid-template-columns:200px 1fr;gap:4px 12px;font-size:.9rem}dt{color:#64748b} @media print{button{display:none}}</style></head><body>" +
        "<button onclick='print()'>Imprimer</button>" +
        "<h1>" +
        esc(headline(prop, ctx.Schema)) +
        "</h1><p>" +
        esc(addressLine(prop)) +
        "</p><p>" +
        esc(narrative(prop)).replace(/\n/g, "<br>") +
        "</p>" +
        groups
          .map(function (g) {
            return (
              "<h2>" +
              esc(g.title) +
              "</h2><dl>" +
              g.rows
                .map(function (r) {
                  return "<dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd>";
                })
                .join("") +
              "</dl>"
            );
          })
          .join("") +
        "<p style='margin-top:2rem;font-size:.8rem;color:#64748b'>Document professionnel — Leads Opportunities</p></body></html>"
    );
    w.document.close();
  }

  function render(mount, prop, opts) {
    opts = opts || {};
    var ctx = {
      Schema: window.CrmImmoSchema,
      Store: window.CrmImmoStore,
      Matcher: window.CrmImmoMatcher,
    };
    var tab = opts.tab || "fiche";
    mount.innerHTML =
      '<div class="fc-root">' +
      '<header class="fc-head">' +
      '<p class="fc-kicker">Fiche commerciale</p>' +
      "<h2>" +
      esc(headline(prop, ctx.Schema)) +
      "</h2>" +
      '<div class="fc-tabs" role="tablist">' +
      '<button type="button" class="fc-tab' +
      (tab === "fiche" ? " is-on" : "") +
      '" data-fctab="fiche">Fiche commerciale</button>' +
      '<button type="button" class="fc-tab' +
      (tab === "diapo" ? " is-on" : "") +
      '" data-fctab="diapo">Diaporama</button>' +
      '<button type="button" class="fc-tab' +
      (tab === "docs" ? " is-on" : "") +
      '" data-fctab="docs">Documents publics</button>' +
      "</div>" +
      '<div class="fc-actions">' +
      '<button type="button" class="btn btn-ghost" id="fcShare">Partager</button>' +
      '<button type="button" class="btn btn-ghost" id="fcPrint">Fiche technique</button>' +
      "</div></header>" +
      '<div class="fc-body" id="fcBody"></div></div>';

    var body = mount.querySelector("#fcBody");
    function paint(t) {
      tab = t;
      mount.querySelectorAll(".fc-tab").forEach(function (b) {
        b.classList.toggle("is-on", b.getAttribute("data-fctab") === t);
      });
      if (t === "diapo") {
        body.innerHTML = renderDiaporama(prop);
        wireDiaporama(body, prop);
      } else if (t === "docs") {
        body.innerHTML = renderDocs(prop, ctx.Store);
      } else {
        body.innerHTML = renderFiche(prop, ctx);
        var fin = body.querySelector("#fcFinLink");
        if (fin && window.FinanceDeepLink) {
          fin.href = window.FinanceDeepLink.baremesUrl({
            propertyPrice: prop.price_fai || prop.price_net || "",
            prixFai: prop.price_fai || "",
            prixNet: prop.price_net || "",
            priceMode: prop.price_fai ? "fai" : "net_vendeur",
            propertyId: prop.id,
            utmSource: "crm-immo-fiche-com",
          });
        } else if (fin) {
          var qs = new URLSearchParams();
          if (prop.price_fai) qs.set("prixFai", Math.round(prop.price_fai));
          if (prop.price_net) qs.set("prixNet", Math.round(prop.price_net));
          qs.set("propertyId", prop.id);
          fin.href = "./crm-agency-fees.html?" + qs.toString();
        }
      }
      body.classList.remove("fc-anim");
      void body.offsetWidth;
      body.classList.add("fc-anim");
    }

    mount.querySelectorAll("[data-fctab]").forEach(function (b) {
      b.onclick = function () {
        paint(b.getAttribute("data-fctab"));
      };
    });
    mount.querySelector("#fcShare").onclick = function () {
      share(prop);
    };
    mount.querySelector("#fcPrint").onclick = function () {
      printTechSheet(prop, ctx);
    };
    paint(tab);
  }

  return {
    render: render,
    share: share,
    printTechSheet: printTechSheet,
    headline: headline,
  };
})();
