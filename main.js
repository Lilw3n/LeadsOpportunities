document.addEventListener("DOMContentLoaded", function () {
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

  var form = document.getElementById("contactForm");
  var msg = document.getElementById("formMessage");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
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

      if (msg) msg.hidden = false;
      form.reset();
    });
  }
});
