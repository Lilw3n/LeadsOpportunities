(function () {
  var params = new URLSearchParams(location.search);
  var cid = params.get("contactId") || params.get("id");
  if (!cid) return;

  document.querySelectorAll('input[name="contactId"], #contactId, [name="contactId"]').forEach(function (el) {
    if (el.tagName === "INPUT" || el.tagName === "SELECT") el.value = cid;
  });

  var back = document.querySelector('a[href="./crm.html"], a[href="../crm.html"]');
  if (!back) {
    var first = document.querySelector(".btn-ghost");
    if (first && first.textContent.indexOf("←") >= 0) back = first;
  }
  if (back && back.getAttribute("href") && back.getAttribute("href").indexOf("crm-contact") < 0) {
    back.href = "./crm-contact.html?id=" + encodeURIComponent(cid);
    if (back.textContent.indexOf("contact") < 0 && back.textContent.indexOf("Contact") < 0) {
      back.textContent = "← Fiche contact";
    }
  }
})();
