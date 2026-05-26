(function () {
  var panels = {
    feed: function () {
      var postBox =
        '<div style="margin-bottom:16px;padding:12px;background:#fff;border:1px solid #e2e8f0;border-radius:12px">' +
        '<textarea id="feedPostText" rows="2" placeholder="Partagez une astuce VTC, un retour sinistre…" style="width:100%;padding:10px;border:1px solid #e2e8f0;border-radius:8px;box-sizing:border-box"></textarea>' +
        '<p style="margin:8px 0 0"><button type="button" id="btnCreatePost" class="btn btn-primary" style="padding:8px 14px;border:none;border-radius:8px;background:#6366f1;color:#fff;font-weight:600;cursor:pointer">Publier</button></p></div>';
      return (
        "<h2>Feed pro VTC &amp; assurance</h2>" +
        postBox +
        '<div id="feedPosts">' +
        '<p style="font-size:.88rem;color:#64748b;margin-bottom:12px">Découvrez les dernières actualités, conseils et témoignages de la communauté VTC/Taxi.</p>' +
        '<div class="feed-item"><strong>Wendy BUCHET</strong> · Astuce bonus-malus VTC<p style="color:#64748b;margin:4px 0 0">Anticipez le renouvellement 45j avant échéance.</p></div>' +
        '<div class="feed-item"><strong>Communauté VTC</strong> · Comparatif Zéphir / Solly Azar<p style="color:#64748b;margin:4px 0 0">Retour d\'expérience sur les franchises.</p></div>' +
        '<div class="feed-item"><strong>🎉 C\'est un match !</strong><p style="color:#64748b;margin:4px 0 0">3 nouvelles mises en relation cette semaine.</p></div>' +
        '<p style="margin-top:16px"><a href="../assurance/devis-intelligent.html">Analyse IA éligibilité →</a></p>'
      );
    },
    marketplace: function () {
      return (
        "<h2>Marketplace Pro</h2>" +
        '<p style="font-size:.88rem;color:#64748b">Formation, services pro, assurance — offres à confirmer selon disponibilité.</p>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin:12px 0">' +
        '<a href="marketplace.html" class="feed-item" style="text-decoration:none;color:inherit"><strong>Formation VTC</strong><p style="margin:4px 0 0;color:#64748b">Sur devis</p></a>' +
        '<a href="marketplace.html" class="feed-item" style="text-decoration:none;color:inherit"><strong>Étude sinistre</strong><p style="margin:4px 0 0;color:#64748b">Sur devis</p></a>' +
        '<a href="marketplace.html" class="feed-item" style="text-decoration:none;color:inherit"><strong>Étude assurance VTC</strong><p style="margin:4px 0 0;color:#64748b">Selon éligibilité</p></a>' +
        "</div>" +
        '<p><a href="marketplace.html">Marketplace complète →</a> · <a href="deals.html">#Deal bons plans</a></p>'
      );
    },
    deals: function () {
      return (
        "<h2>Bons plans assurance</h2>" +
        "<ul><li>Conditions partenaires à vérifier</li><li>Offres affichées uniquement après validation</li></ul>" +
        '<p><a href="deals.html">Tous les bons plans →</a></p>'
      );
    },
    matching: function () {
      return (
        "<h2>Matching professionnel</h2>" +
        "<p>Trouvez un apporteur, un expert-comptable VTC ou un collègue courtier.</p>" +
        "<ul><li>🚡 Chauffeurs VTC — 124 profils</li><li>🛡️ Courtiers assurance — 38 profils</li></ul>" +
        '<p><a href="matching.html">Lancer une recherche →</a></p>'
      );
    },
    live: function () {
      return (
        "<h2>Live &amp; webinaires</h2>" +
        "<p>Prochain live : <strong>Réforme RC Pro 2026</strong> — Jeudi 18h</p>" +
        '<p><a href="live.html">Voir les lives →</a> · <a href="live-mobile.html">📱 Version mobile</a></p>'
      );
    },
    creators: function () {
      return (
        "<h2>Économie créateurs</h2>" +
        "<p>Monétisez votre expertise VTC &amp; assurance.</p>" +
        "<ul><li>Formations premium</li><li>Contenus sponsorisés</li><li>Affiliation devis</li></ul>" +
        '<p><a href="creators.html">Devenir créateur →</a></p>'
      );
    },
    agency: function () {
      return (
        "<h2>Agence créateurs</h2>" +
        "<p>Accompagnement branding, contenus et monétisation pour courtiers &amp; VTC.</p>" +
        '<p><a href="agency.html">Découvrir l\'agence →</a></p>'
      );
    },
    mutual: function () {
      var conn = window.MutualAidService ? window.MutualAidService.connectionsCount() : 0;
      return (
        "<h2>Entraide communautaire</h2>" +
        '<p style="font-size:.88rem;color:#64748b">' +
        conn +
        ' connexions · <a href="entraide.html">Page entraide complète →</a></p>' +
        '<div id="mutualMount"></div><div id="lendingMount" style="margin-top:24px"></div>'
      );
    },
    groups: function () {
      return (
        "<h2>Groupes sectoriels</h2>" +
        "<ul>" +
        "<li><a href='groups/vtc-taxi.html'>🚡 VTC &amp; Taxi</a></li>" +
        "<li><a href='groups/assurance-pro.html'>🛡️ Assurance Pro</a></li>" +
        "<li><a href='groups/sante.html'>❤️ Santé</a></li>" +
        "<li><a href='groups/private.html'>🔒 Groupe privé</a></li>" +
        "</ul>" +
        '<p><a href="groups.html">Annuaire complet →</a></p>'
      );
    },
  };

  function show(tab) {
    document.getElementById("panel").innerHTML = panels[tab] ? panels[tab]() : "<p>Section en cours</p>";
    if (tab === "feed") {
      var btn = document.getElementById("btnCreatePost");
      if (btn) {
        btn.onclick = function () {
          var tok = localStorage.getItem("lo_ext_token");
          if (!tok) {
            alert("Créez votre compte pour publier — connexion requise.");
            location.href = "../login.html";
            return;
          }
          var ta = document.getElementById("feedPostText");
          var t = ta && ta.value.trim();
          if (!t) return;
          var posts = document.getElementById("feedPosts");
          if (posts) {
            var el = document.createElement("div");
            el.className = "feed-item";
            el.innerHTML =
              "<strong>Vous</strong> · à l'instant<p style='color:#64748b;margin:4px 0 0'>" + t.replace(/</g, "&lt;") + "</p>";
            posts.insertBefore(el, posts.firstChild);
          }
          try {
            var hist = JSON.parse(localStorage.getItem("lo_social_feed_posts") || "[]");
            hist.unshift({ text: t, at: new Date().toISOString() });
            localStorage.setItem("lo_social_feed_posts", JSON.stringify(hist.slice(0, 20)));
          } catch (e) {}
          if (ta) ta.value = "";
        };
      }
      try {
        var hist = JSON.parse(localStorage.getItem("lo_social_feed_posts") || "[]");
        var posts = document.getElementById("feedPosts");
        hist.forEach(function (p) {
          if (!posts) return;
          var el = document.createElement("div");
          el.className = "feed-item";
          el.innerHTML =
            "<strong>Vous</strong> · " +
            new Date(p.at).toLocaleDateString("fr-FR") +
            "<p style='color:#64748b;margin:4px 0 0'>" +
            String(p.text).replace(/</g, "&lt;") +
            "</p>";
          posts.insertBefore(el, posts.firstChild);
        });
      } catch (e) {}
    }
    if (tab === "mutual") {
      if (window.MutualAidService) {
        window.MutualAidService.render(document.getElementById("mutualMount"), {
          showCreate: true,
          fullPageLink: "entraide.html",
        });
      }
      if (window.LendingService) {
        window.LendingService.render(document.getElementById("lendingMount"), { showPropose: true });
      }
    }
    document.querySelectorAll("#hubTabs button[data-tab]").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-tab") === tab);
    });
    try {
      localStorage.setItem("social_hub_tab", tab);
    } catch (e) {}
  }

  document.querySelectorAll("#hubTabs button[data-tab]").forEach(function (btn) {
    btn.onclick = function () {
      show(btn.getAttribute("data-tab"));
    };
  });
  var saved = "";
  try {
    saved = localStorage.getItem("social_hub_tab") || "";
  } catch (e) {}
  show(panels[saved] ? saved : "feed");

  var extTok = "";
  try {
    extTok = localStorage.getItem("lo_ext_token") || "";
  } catch (e) {}
  var cta = document.getElementById("hubCta");
  var hint = document.getElementById("hubGuestHint");
  if (extTok && cta) {
    cta.innerHTML =
      '<a class="primary" href="../dashboard.html">Mon espace client</a>' +
      '<a class="ghost" href="../profile.html">Mon profil</a>' +
      '<a class="ghost" href="#hubTabs">Explorer le hub</a>';
  }
  if (hint) {
    hint.textContent = extTok
      ? "Connecté — accès complet au feed, marketplace et matching."
      : "Mode invité — créez un compte gratuit pour accéder à toutes les fonctionnalités de l'écosystème social.";
  }
})();
