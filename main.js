document.addEventListener("DOMContentLoaded", function () {
  // Mobile menu
  var hamburger = document.getElementById("hamburgerBtn");
  var mobileMenu = document.getElementById("mobileMenu");
  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", function () {
      mobileMenu.classList.toggle("open");
    });
    mobileMenu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { mobileMenu.classList.remove("open"); });
    });
  }

  // Topbar scroll shadow
  var topbar = document.querySelector(".topbar");
  if (topbar) {
    window.addEventListener("scroll", function () {
      topbar.classList.toggle("scrolled", window.scrollY > 10);
    }, { passive: true });
  }

  function getUtmParams() {
    var params = new URLSearchParams(window.location.search);
    return {
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_content: params.get("utm_content") || "",
      gclid: params.get("gclid") || "",
    };
  }

  function getAttr() {
    if (typeof window.getAttributionPayload === "function") {
      return window.getAttributionPayload();
    }
    return {};
  }

  function getParcoursPayload() {
    try {
      if (window.Parcours && typeof window.Parcours.getActive === "function") {
        var p = window.Parcours.getActive();
        if (p && p.id) {
          return {
            parcours_id: p.id,
            parcours_label: p.label || p.id,
            parcours_type: p.type || "public",
            parcours_workflow: p.crmWorkflow || [],
          };
        }
      }
    } catch (e) {}
    return {};
  }

  var revealEls = document.querySelectorAll(".reveal");
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.18 }
  );

  revealEls.forEach(function (el) {
    observer.observe(el);
  });

  function appendTrackingParamsToLinks() {
    var params = new URLSearchParams(window.location.search);
    if (!params.toString()) return;

    var tracked = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "gclid", "parcours"];
    var links = document.querySelectorAll("a[href]");
    links.forEach(function (link) {
      var href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("tel:") || href.startsWith("https://wa.me")) return;
      if (href.startsWith("http") && href.indexOf(window.location.origin) !== 0) return;
      if (href.indexOf("mailto:") === 0) return;

      var url = new URL(href, window.location.origin);
      tracked.forEach(function (key) {
        if (params.get(key) && !url.searchParams.get(key)) {
          url.searchParams.set(key, params.get(key));
        }
      });
      link.setAttribute("href", url.pathname + url.search + url.hash);
    });
  }

  appendTrackingParamsToLinks();

  function collectFormFields(form) {
    var fd = new FormData(form);
    var o = {};
    fd.forEach(function (v, k) {
      o[k] = v;
    });
    return o;
  }

  function sendQualifiedLeadGtag(result, vertical) {
    if (typeof window.gtag !== "function" || !window.GOOGLE_TRACKING) return;
    var cfg = window.GOOGLE_TRACKING;
    if (!cfg.ga4MeasurementId || cfg.ga4MeasurementId.indexOf("XXXX") !== -1) return;
    if (result && result.leadScore != null) {
      var score = Number(result.leadScore);
      window.gtag("event", "qualified_lead", {
        send_to: cfg.ga4MeasurementId,
        value: score,
        currency: "EUR",
        vertical: vertical || "",
      });
      if (
        cfg.adsQualifiedLeadConversionId &&
        cfg.adsQualifiedLeadConversionId.indexOf("XXXX") === -1 &&
        score >= 50
      ) {
        window.gtag("event", "conversion", {
          send_to: cfg.adsQualifiedLeadConversionId,
          value: score,
          currency: "EUR",
        });
      }
    }
  }

  function postLeadApi(body) {
    return fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then(function (r) {
        return r.json().catch(function () {
          return null;
        });
      })
      .catch(function () {
        return null;
      });
  }

  function renderDocumentsCta(container, leadPayload) {
    if (!container) return;
    var email = (leadPayload && leadPayload.email ? String(leadPayload.email) : "").trim();
    var href = "/external/upload-document.html?public=1";
    if (email) href += "&email=" + encodeURIComponent(email);
    var cta = document.getElementById("docsCtaInline");
    if (!cta) {
      cta = document.createElement("p");
      cta.id = "docsCtaInline";
      cta.style.marginTop = "10px";
      cta.innerHTML =
        'Etape suivante : <a href="' +
        href +
        '" style="font-weight:700;text-decoration:underline">envoyer vos pieces justificatives</a>.';
      container.insertAdjacentElement("afterend", cta);
    } else {
      cta.innerHTML =
        'Etape suivante : <a href="' +
        href +
        '" style="font-weight:700;text-decoration:underline">envoyer vos pieces justificatives</a>.';
    }
  }

  var form = document.getElementById("contactForm");
  var msg = document.getElementById("formMessage");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var fields = collectFormFields(form);
      var payload = Object.assign(
        {
          event_category: "lead_generation",
          event_label: "homepage_contact_form",
          value: 1,
          page: window.location.pathname,
        },
        getUtmParams()
      );

      if (typeof window.gtag === "function") {
        window.gtag("event", "generate_lead", payload);
        if (window.GOOGLE_TRACKING && window.GOOGLE_TRACKING.adsLeadConversionId) {
          window.gtag("event", "conversion", {
            send_to: window.GOOGLE_TRACKING.adsLeadConversionId,
            value: 1,
            currency: "EUR",
          });
        }
      }

      var leadSource = "homepage_contact";
      if (window.location.pathname.indexOf("nos-services") !== -1) {
        leadSource = "services_catalog";
      }

      var svc =
        window.SERVICE_CATALOG && window.SERVICE_CATALOG.getService
          ? window.SERVICE_CATALOG.getService(fields.need || "")
          : null;

      var leadPayload = Object.assign(
        {
          source: leadSource,
          vertical: (svc && svc.vertical) || fields.need || "",
          serviceNeed: (svc && svc.need) || fields.need || "",
          serviceLabel: (svc && svc.label) || "",
          serviceCategory: (svc && svc.category) || "",
          page: window.location.pathname,
        },
        getUtmParams(),
        getParcoursPayload(),
        getAttr(),
        fields
      );
      delete leadPayload.rgpd;
      if (typeof window.saveLeadRequest === "function") {
        window.saveLeadRequest(leadPayload);
      }
      if (msg) msg.hidden = true;
      var errMsg = document.querySelector("[data-form-error]");

      postLeadApi(leadPayload).then(function (result) {
        sendQualifiedLeadGtag(result, fields.need || "");
        window.dispatchEvent(
          new CustomEvent("lo:lead-sent", {
            detail: { payload: leadPayload, result: result || {} },
          })
        );
        if (result && result.error === "geo_out_of_scope") {
          if (msg) {
            msg.textContent =
              result.message ||
              "Ce service est reserve aux residents en France (assurance et credit immo).";
            msg.hidden = false;
          }
        } else if (result && result.ok) {
          if (msg) {
            if (result.emailSent === false && result.stored === false) {
              msg.textContent =
                "Merci ! Votre demande est prise en compte. Un conseiller vous contacte rapidement. (E-mail de notification serveur en cours de configuration.)";
            }
            msg.hidden = false;
            renderDocumentsCta(msg, leadPayload);
          }
          form.reset();
        } else if (errMsg) {
          errMsg.hidden = false;
        } else if (msg) {
          msg.textContent =
            "Envoi impossible pour le moment. Reessayez ou renvoyez le formulaire.";
          msg.hidden = false;
        }
      });
    });
  }
});
