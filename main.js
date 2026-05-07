document.addEventListener("DOMContentLoaded", function () {
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
      if (msg) msg.hidden = false;
      form.reset();
    });
  }
});
