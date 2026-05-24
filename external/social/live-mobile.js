(function () {
  var chat = document.getElementById("chat");
  var form = document.getElementById("chatForm");
  var viewers = document.getElementById("liveViewers");
  var reactions = document.getElementById("reactions");

  var seed = [
    { user: "Modo", text: "Bienvenue sur le live mobile #FormationVTC !" },
    { user: "Karim V.", text: "Question bonus-malus 0,86 — possible ?" },
    { user: "Sophie Formation", text: "Oui avec dérogation — voir devis intelligent" },
  ];

  function paint() {
    if (!chat) return;
    chat.innerHTML = seed
      .map(function (m) {
        return '<div class="chat-msg"><strong>' + m.user + "</strong> " + m.text + "</div>";
      })
      .join("");
    chat.scrollTop = chat.scrollHeight;
  }

  if (form) {
    form.onsubmit = function (e) {
      e.preventDefault();
      var inp = form.querySelector("[name=msg]");
      var t = (inp.value || "").trim();
      if (!t) return;
      seed.push({ user: "Vous", text: t });
      inp.value = "";
      paint();
    };
  }

  if (reactions) {
    reactions.querySelectorAll("button").forEach(function (btn) {
      btn.onclick = function () {
        seed.push({ user: "Vous", text: btn.textContent + " " + (btn.getAttribute("data-emoji") || "") });
        paint();
      };
    });
  }

  setInterval(function () {
    if (viewers) {
      var n = 100 + Math.floor(Math.random() * 80);
      viewers.textContent = "👁 " + n;
    }
  }, 7000);

  paint();
})();
