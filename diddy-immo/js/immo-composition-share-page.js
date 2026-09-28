/**
 * Vue publique composition — lecture + fork utilisateur connecté.
 */
(function () {
  var Share = window.CrmImmoCompositionShare;
  var Draw = window.CrmImmoCompositionDraw;
  var Dossier = window.CrmImmoDossier;
  var root = document.getElementById("root");
  if (!Share || !root) return;

  var params = new URLSearchParams(location.search);
  var token = params.get("token") || "";
  var forkId = params.get("fork") || "";
  var mode = forkId ? "fork" : "public";

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function euro(n) {
    n = Number(n) || 0;
    return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €";
  }

  function totals(units) {
    if (Dossier && Dossier.unitTotals) return Dossier.unitTotals(units || []);
    return { units: (units || []).length, loues: 0, loyer_reel: 0, loyer_hc: 0, loyer_cc: 0, loyer_previsionnel: 0, charges_locatives: 0, surface_carrez: 0, surface_non_carrez: 0, surface_m2: 0, nb_pieces: 0, nb_chambres: 0, nb_sdb: 0, nb_wc: 0, nb_cuisines: 0, baux_actifs: 0 };
  }

  function cardsHtml(tot) {
    return (
      '<div class="totals-grid">' +
      '<div class="total-card"><span>Unités</span><strong>' +
      tot.units +
      "</strong><small>" +
      tot.loues +
      " louée(s)</small></div>" +
      '<div class="total-card"><span>Loyers réels</span><strong>' +
      euro(tot.loyer_reel) +
      "</strong><small>HC " +
      euro(tot.loyer_hc) +
      " · CC " +
      euro(tot.loyer_cc) +
      "</small></div>" +
      '<div class="total-card"><span>Prévisionnels</span><strong>' +
      euro(tot.loyer_previsionnel) +
      "</strong></div>" +
      '<div class="total-card"><span>Carrez</span><strong>' +
      (Number(tot.surface_carrez) || 0) +
      " m²</strong></div>" +
      '<div class="total-card"><span>Pièces / chambres</span><strong>' +
      (Number(tot.nb_pieces) || 0) +
      " / " +
      (Number(tot.nb_chambres) || 0) +
      "</strong></div>" +
      "</div>"
    );
  }

  function unitRows(units, fork) {
    return (units || [])
      .map(function (u) {
        var mix = fork ? Share.unitAuthorMix(fork, u.id) : "agent";
        var label = Dossier && Dossier.unitLabel ? Dossier.unitLabel(u) : u.label || u.type || "Lot";
        return (
          '<div class="unit-row author-' +
          esc(mix) +
          '"><strong>' +
          esc(label) +
          "</strong> · " +
          esc(u.type || "") +
          (u.occupation === "loue" || u.loue ? " · loué" : " · vide") +
          (u.surface_carrez || u.surface_m2 ? " · " + (u.surface_carrez || u.surface_m2) + " m²" : "") +
          (u.loyer_reel || u.loyer ? " · " + euro(u.loyer_reel || u.loyer) : "") +
          (fork
            ? ' <em class="muted">(' +
              (mix === "user" ? "modifié par vous" : mix === "mixed" ? "mixte" : "saisie mandataire") +
              ")</em>"
            : "") +
          "</div>"
        );
      })
      .join("");
  }

  function renderPublic(pack) {
    var snap = pack.snapshot;
    var units = snap.units || [];
    var tot = totals(units);
    var tree = Dossier && Dossier.buildCompositionTree ? Dossier.buildCompositionTree(units) : [];
    var agent = (pack.share && pack.share.published_by) || snap.published_by || { name: "Mandataire", color: Share.AGENT_COLOR };
    document.getElementById("pageTitle").textContent = snap.title || "Synthèse du bien";
    document.getElementById("pageSub").textContent =
      "Publié par " + (agent.name || "mandataire") + " — synthèse courte + longue + dessin.";

    root.innerHTML =
      '<div class="panel"><p class="ok">Cette vue montre les infos renseignées par le mandataire, le plus précisément possible.</p>' +
      '<p>Légende : <span class="chip-agent"><i></i>Mandataire</span> ' +
      '<span class="chip-user"><i></i>Vos modifications (après copie)</span></p></div>' +
      '<div class="panel"><h2>Synthèse courte</h2><p>' +
      esc(Share.shortSynthesisText(tot, snap)) +
      "</p>" +
      cardsHtml(tot) +
      "</div>" +
      '<div class="panel"><h2>Synthèse longue</h2>' +
      Share.longSynthesisHtml(tot, snap, {}) +
      "</div>" +
      '<div class="panel"><h2>Dessin du bâtiment</h2><p class="muted">Terrain → immeuble/maison → étage → lot → pièces</p>' +
      (Draw && Draw.renderSvg ? Draw.renderSvg(tree, { Dossier: Dossier }) : "") +
      "</div>" +
      '<div class="panel"><h2>Lots</h2>' +
      unitRows(units, null) +
      "</div>" +
      '<div class="panel"><h2>Votre copie</h2>' +
      (Share.isConnected()
        ? "<p>Connecté en tant que <b>" +
          esc((Share.currentUser() || {}).name || "") +
          "</b>. Vous pouvez créer une <b>nouvelle sauvegarde</b> (fork) pour annoter / corriger — sans écraser la version publique.</p>" +
          '<div class="actions"><button type="button" class="btn btn-primary" id="btnFork">Sauvegarder ma copie</button></div>'
        : '<p class="warn">Connectez-vous (CRM) pour sauvegarder votre propre copie de cette synthèse.</p>' +
          '<div class="actions"><a class="btn btn-primary" href="./crm.html">Se connecter</a></div>') +
      "</div>";

    var btn = document.getElementById("btnFork");
    if (btn) {
      btn.onclick = function () {
        try {
          var fork = Share.createFork(pack);
          location.href = "./immo-composition-partage.html?token=" + encodeURIComponent(token) + "&fork=" + encodeURIComponent(fork.id);
        } catch (e) {
          alert(e.message || "Impossible de créer la copie");
        }
      };
    }
  }

  function renderFork(fork, pack) {
    var units = fork.units || [];
    var tot = totals(units);
    var tree = Dossier && Dossier.buildCompositionTree ? Dossier.buildCompositionTree(units) : [];
    document.getElementById("pageTitle").textContent = "Ma copie — " + ((fork.base_snapshot && fork.base_snapshot.title) || "bien");
    document.getElementById("pageSub").textContent = "Sauvegarde personnelle · codes couleurs mandataire / vous";

    root.innerHTML =
      '<div class="panel"><p class="ok">Copie personnelle créée le ' +
      esc(fork.created_at || "") +
      ". La version publique du mandataire reste intacte.</p>" +
      '<p><span class="chip-agent"><i></i>' +
      esc((fork.authors && fork.authors.agent && fork.authors.agent.name) || "Mandataire") +
      "</span> " +
      '<span class="chip-user"><i></i>' +
      esc((fork.authors && fork.authors.user && fork.authors.user.name) || "Vous") +
      "</span></p>" +
      '<div class="actions"><a class="btn btn-ghost" href="./immo-composition-partage.html?token=' +
      encodeURIComponent(token) +
      '">← Voir la version publique</a>' +
      '<button type="button" class="btn btn-primary" id="btnMarkEdit">Simuler une modif. utilisateur</button></div></div>' +
      '<div class="panel"><h2>Synthèse courte</h2><p>' +
      esc(Share.shortSynthesisText(tot, fork.base_snapshot || {})) +
      "</p>" +
      cardsHtml(tot) +
      "</div>" +
      '<div class="panel"><h2>Dessin</h2>' +
      (Draw && Draw.renderSvg ? Draw.renderSvg(tree, { Dossier: Dossier }) : "") +
      "</div>" +
      '<div class="panel"><h2>Lots (couleurs d’auteur)</h2>' +
      unitRows(units, fork) +
      "</div>";

    var mark = document.getElementById("btnMarkEdit");
    if (mark) {
      mark.onclick = function () {
        var u = units[0];
        if (!u) return alert("Aucun lot");
        var note = prompt("Note / correction sur le premier lot (ex. surface réelle) :", u.notes || "");
        if (note == null) return;
        u.notes = note;
        Share.markUserEdit(fork, u.id, "notes");
        Share.saveFork(fork);
        renderFork(fork, pack);
      };
    }
  }

  if (!token && !forkId) {
    root.innerHTML = '<p class="warn">Lien invalide : token manquant.</p>';
    return;
  }

  if (forkId) {
    var fork = Share.getFork(forkId);
    if (!fork) {
      root.innerHTML = '<p class="warn">Copie introuvable. Recréez-la depuis la synthèse publique.</p>';
      return;
    }
    var pack0 = Share.getPublicByToken(fork.base_token) || { token: fork.base_token, snapshot: fork.base_snapshot, share: { published_by: fork.base_snapshot && fork.base_snapshot.published_by } };
    renderFork(fork, pack0);
    return;
  }

  var pack = Share.getPublicByToken(token);
  if (!pack) {
    root.innerHTML =
      '<p class="warn">Synthèse publique introuvable. Le mandataire doit cliquer « Rendre la synthèse publique » sur la fiche CRM, puis renvoyer le lien.</p>';
    return;
  }
  renderPublic(pack);
})();
