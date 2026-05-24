(function () {
  var chat = document.getElementById("liveChat");
  var form = document.getElementById("liveChatForm");
  if (!chat || !form) return;

  var messages = [
    { user: "Karim V.", text: "Quelle franchise pour un VTC 0,86 BM ?" },
    { user: "Modération", text: "Réponse dans 2 min — restez connectés." },
    { user: "Sophie M.", text: "Merci pour le comparatif Zéphir !" },
  ];

  function paint() {
    chat.innerHTML = messages
      .map(function (m) {
        return "<p style='margin:4px 0'><strong>" + m.user + "</strong> " + m.text + "</p>";
      })
      .join("");
    chat.scrollTop = chat.scrollHeight;
  }

  form.onsubmit = function (e) {
    e.preventDefault();
    var inp = form.querySelector("[name=msg]");
    var t = (inp.value || "").trim();
    if (!t) return;
    messages.push({ user: "Vous", text: t });
    inp.value = "";
    paint();
  };

  setInterval(function () {
    var n = 120 + Math.floor(Math.random() * 40);
    var v = document.getElementById("liveViewers");
    if (v) v.textContent = "👁 " + n + " spectateurs";
  }, 8000);

  paint();
})();
