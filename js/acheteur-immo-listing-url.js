/**
 * Capture publique d'URL d'annonces (Leboncoin, SeLoger, ParuVendu…).
 */
(function () {
  var Portals = window.ImmoListingPortals;
  if (!Portals) return;

  function qs(root, sel) {
    return (root || document).querySelector(sel);
  }

  function val(root, name) {
    var el = root.querySelector("[name='" + name + "']");
    return el ? String(el.value || "").trim() : "";
  }

  function renderDetected(root, text) {
    var mount = qs(root, "[data-url-detected]");
    if (!mount) return;
    var hits = Portals.detectMany(text).filter(function (d) {
      return d.ok;
    });
    if (!hits.length) {
      mount.innerHTML = "";
      return hits;
    }
    mount.innerHTML = hits
      .map(function (d) {
        var cls = d.portal === "autre" ? " url-pill--unknown" : "";
        return '<span class="url-pill' + cls + '">' + d.label + "</span>";
      })
      .join("");
    return hits;
  }

  function init(root) {
    if (!root || root.dataset.urlCaptureBound) return;
    root.dataset.urlCaptureBound = "1";
    var area = qs(root, "[data-listing-urls]");
    var form = qs(root, "[data-url-capture-form]");
    var err = qs(root, "[data-url-capture-err]");
    var ok = qs(root, "[data-url-capture-ok]");
    if (area) {
      area.addEventListener("input", function () {
        renderDetected(root, area.value);
      });
      area.addEventListener("paste", function () {
        setTimeout(function () {
          renderDetected(root, area.value);
        }, 0);
      });
    }
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (err) {
        err.hidden = true;
        err.textContent = "";
      }
      if (ok) ok.hidden = true;
      var urlsText = area ? area.value : "";
      var hits = Portals.detectMany(urlsText).filter(function (d) {
        return d.ok;
      });
      if (!hits.length) {
        if (err) {
          err.hidden = false;
          err.textContent = "Collez au moins une URL d'annonce (Leboncoin, SeLoger, ParuVendu…).";
        }
        return;
      }
      var payload = {
        urls: hits.map(function (d) {
          return d.url;
        }),
        firstName: val(form, "firstName"),
        lastName: val(form, "lastName"),
        email: val(form, "email"),
        phone: val(form, "phone"),
        city: val(form, "city"),
        postal_code: val(form, "postal_code"),
        property_type: val(form, "property_type"),
        price_fai: val(form, "price_fai"),
        rooms: val(form, "rooms"),
        surface_m2: val(form, "surface_m2"),
        sellerName: val(form, "sellerName"),
        sellerPhone: val(form, "sellerPhone"),
        sellerEmail: val(form, "sellerEmail"),
        sellerAgency: val(form, "sellerAgency"),
        details: val(form, "details"),
        _hp: val(form, "_hp"),
        need: "acheteur-immo",
        vertical: "acheteur_immo",
      };
      if (!payload.email && !payload.phone) {
        if (err) {
          err.hidden = false;
          err.textContent = "Indiquez votre e-mail ou votre téléphone.";
        }
        return;
      }
      var btn = form.querySelector("[type=submit]");
      if (btn) btn.disabled = true;
      fetch("/api/immo-listing-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      })
        .then(function (r) {
          return r.json().then(function (data) {
            return { ok: r.ok, data: data };
          });
        })
        .then(function (res) {
          if (!res.data || !res.data.ok) {
            throw new Error((res.data && res.data.message) || "Envoi impossible");
          }
          if (ok) {
            ok.hidden = false;
            ok.textContent =
              res.data.received +
              " annonce" +
              (res.data.received > 1 ? "s" : "") +
              " enregistrée" +
              (res.data.received > 1 ? "s" : "") +
              ". Un conseiller vous rappelle pour le bien et le vendeur.";
          }
          form.reset();
          renderDetected(root, "");
        })
        .catch(function (ex) {
          if (err) {
            err.hidden = false;
            err.textContent = ex.message || "Envoi impossible.";
          }
        })
        .then(function () {
          if (btn) btn.disabled = false;
        });
    });
  }

  function boot() {
    var nodes = document.querySelectorAll("[data-listing-url-capture]");
    for (var i = 0; i < nodes.length; i++) init(nodes[i]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
