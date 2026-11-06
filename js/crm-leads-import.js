/**
 * Leads importés à traiter — import CSV/collage + suivi des relances avant échéance.
 * API : /api/crm/leads-import
 */
(function () {
  var token = localStorage.getItem("lo_token");
  if (!token) return;

  var STATUS_LABELS = {
    a_traiter: "À traiter",
    mail_envoye: "Mail envoyé",
    appele: "Appelé",
    devis_envoye: "Devis envoyé",
    plus_cher_retour: "Moins cher ailleurs (retour)",
    gagne: "Gagné",
    perdu: "Perdu",
    injoignable: "Injoignable",
  };
  // Adresses d'autres courtiers / compagnies : ne jamais écrire dessus (le message partirait chez un concurrent).
  var BROKER_DOMAINS = /calipso|assurin|egidia|bcnci|agiassurance|elassure|kelips|aksam|prevo\.fr|nz-courtage|vtcprotect|presticourtage|yopmail|^a\.fr$|^xxx/i;

  var state = { items: [], parsed: [] };

  function $(id) { return document.getElementById(id); }
  function esc(s) { var d = document.createElement("div"); d.textContent = s == null ? "" : s; return d.innerHTML; }

  function api(method, body) {
    return fetch("/api/crm/leads-import", {
      method: method,
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: body ? JSON.stringify(body) : undefined,
    }).then(function (r) { return r.json(); });
  }

  /* ---------- Parsing ---------- */
  function splitLines(text) {
    var delim = text.indexOf("\t") >= 0 ? "\t" : (text.split("\n")[0].split(";").length > text.split("\n")[0].split(",").length ? ";" : ",");
    var rows = [], row = [], cell = "", q = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') q = false;
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === delim) { row.push(cell); cell = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows.map(function (r) { return r.map(function (x) { return String(x || "").trim(); }); });
  }

  function toIso(v) {
    v = String(v || "").trim();
    if (!v) return null;
    if (/^\d{5}$/.test(v)) { // numéro de série Excel / Sheets
      var d = new Date(Date.UTC(1899, 11, 30) + Number(v) * 86400000);
      return d.toISOString().slice(0, 10);
    }
    var m = v.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})/);
    if (m) {
      var y = m[3].length === 2 ? "20" + m[3] : m[3];
      return y + "-" + ("0" + m[2]).slice(-2) + "-" + ("0" + m[1]).slice(-2);
    }
    m = v.match(/^\d{4}-\d{2}-\d{2}/);
    return m ? m[0] : null;
  }

  function splitEmail(raw) {
    var m = String(raw || "").match(/[\w.+-]+@([\w-]+\.)+[\w-]+/);
    if (!m) return { email: null, broker: null };
    var e = m[0].toLowerCase();
    return BROKER_DOMAINS.test(e.split("@")[1]) ? { email: null, broker: e } : { email: e, broker: null };
  }

  function parseRows(text) {
    var lines = splitLines(text);
    var out = [];
    var segment = "prospect";
    var header = null;
    lines.forEach(function (r) {
      var a = (r[0] || "").toUpperCase();
      if (/CONTRATS SOUSCRITS|CLIENTS/.test(a) && !r[2]) { segment = "client"; header = null; return; }
      if (/PROJETS TRAIT|DEVIS/.test(a) && !r[2]) { segment = "prospect"; header = null; return; }
      // En-têtes génériques (nom / prénom / email / téléphone / produit / date)
      if (r.some(function (c) { return /^e-?mail$/i.test(c); })) {
        header = {};
        r.forEach(function (c, i) {
          var k = c.toLowerCase();
          if (/^nom/.test(k)) header.last = i;
          else if (/pr[ée]nom/.test(k)) header.first = i;
          else if (/mail/.test(k)) header.email = i;
          else if (/t[ée]l|phone|portable/.test(k)) header.phone = i;
          else if (/produit|type|contrat/.test(k)) header.product = i;
          else if (/date|[ée]ch[ée]ance|souscri/.test(k)) header.date = i;
          else if (/statut|segment/.test(k)) header.segment = i;
        });
        return;
      }
      var e, row;
      if (header) {
        e = splitEmail(r[header.email]);
        row = {
          segment: /client|sign|souscri/i.test(r[header.segment] || "") ? "client" : segment,
          lastName: r[header.last], firstName: r[header.first],
          email: e.email, emailBroker: e.broker, phone: r[header.phone],
          product: r[header.product] || "VTC", refDate: toIso(r[header.date]),
        };
      } else {
        if (!r[0] && !r[1]) return;
        if (!/@/.test(r[2] || "") && !/\d{6,}/.test((r[3] || "").replace(/\D/g, ""))) return; // lignes de total, titres
        e = splitEmail(r[2]);
        var isClient = segment === "client";
        row = {
          segment: segment,
          lastName: isClient ? r[0] : null,
          firstName: isClient ? r[1] : null,
          fullName: isClient ? [r[1], r[0]].join(" ").trim() : (r[1] || r[0]),
          email: e.email, emailBroker: e.broker, phone: r[3],
          product: r[4] || "VTC",
          refDate: toIso(r[5]) || toIso(r[6]),
        };
      }
      out.push(row);
    });
    return out;
  }

  function preview(text) {
    state.parsed = parseRows(text);
    var c = state.parsed.filter(function (r) { return r.segment === "client"; }).length;
    var withMail = state.parsed.filter(function (r) { return r.email; }).length;
    var broker = state.parsed.filter(function (r) { return r.emailBroker; }).length;
    $("liPreviewInfo").textContent = state.parsed.length
      ? state.parsed.length + " lignes reconnues : " + c + " clients signés, " + (state.parsed.length - c) +
        " devis non signés · " + withMail + " avec e-mail perso · " + broker + " e-mails d'autres courtiers mis de côté. Les doublons seront ignorés."
      : "Aucune ligne reconnue — vérifiez qu'il y a au moins nom + e-mail ou téléphone.";
    $("liImport").disabled = !state.parsed.length;
  }

  /* ---------- Échéance ---------- */
  function nextDue(refIso) {
    if (!refIso) return null;
    var d = new Date(String(refIso).slice(0, 10) + "T00:00:00");
    if (isNaN(d)) return null;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    while (d <= today) d.setFullYear(d.getFullYear() + 1);
    return d;
  }
  function dueCell(it) {
    var d = nextDue(it.ref_date);
    if (!d) return "—";
    var days = Math.round((d - new Date()) / 86400000);
    // Préavis courant de 2 mois : relancer au plus tard ~70 jours avant.
    var cls = days <= 60 ? "li-due--late" : days <= 120 ? "li-due--soon" : "";
    return '<span class="' + cls + '">' + d.toLocaleDateString("fr-FR") + "</span><br><span class=\"muted\">J-" + days + "</span>";
  }

  /* ---------- Mail ---------- */
  function mailto(it) {
    var prenom = it.first_name || (it.full_name || "").split(" ")[0] || "";
    var client = it.segment === "client";
    var subject = client
      ? "Votre assurance " + (it.product || "VTC") + " arrive bientôt à échéance – on vous refait le point ?"
      : "Votre assurance " + (it.product || "VTC") + " : et si on comparait avant votre échéance ?";
    var body = "Bonjour " + prenom + ",\n\n" + (client
      ? "Votre contrat souscrit avec moi arrive bientôt à échéance : c'est le bon moment pour vérifier que vous payez le juste prix.\n\nJe remets votre contrat en concurrence auprès de mes compagnies partenaires. Si je trouve mieux, je vous envoie le devis ; si vous avez reçu une offre moins chère ailleurs, transmettez-la-moi et je ferai mon possible pour m'aligner."
      : "Nous avions étudié ensemble votre assurance début 2025. Votre contrat actuel arrive sûrement à échéance dans les prochains mois : c'est le moment idéal pour comparer.\n\nJe vous propose une nouvelle étude gratuite et sans engagement. Si votre contrat actuel est plus intéressant, dites-le-moi : votre retour m'aide à faire mieux.") +
      "\n\nIl me suffit de votre avis d'échéance et d'un relevé d'informations récent.\n\nJe peux aussi vous faire un devis mutuelle santé, prévoyance (arrêt de travail), RC Pro, habitation, auto perso ou crédit.\n\nBien à vous,\nWendy Buchet\nCourtier en assurance\nhttps://www.leadsopportunities.fr\n\nPour ne plus recevoir nos messages, répondez STOP.";
    return "mailto:" + encodeURIComponent(it.email) + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  /* ---------- Liste ---------- */
  function fold(s) {
    return String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  /** Tous les mots trouvés, dans n'importe quel ordre, sans accents ; les chiffres ignorent les espaces. */
  function matchesSearch(it, q) {
    var hay = fold([it.full_name, it.last_name, it.first_name, it.email, it.email_broker, it.phone, it.product, it.batch].join(" "));
    var digits = q.replace(/\D/g, "");
    if (digits.length >= 6 && String(it.phone || "").replace(/\D/g, "").indexOf(digits.replace(/^33/, "0")) >= 0) return true;
    return fold(q).split(/\s+/).filter(Boolean).every(function (w) { return hay.indexOf(w) >= 0; });
  }

  function globalSearchLink(q, label) {
    return '<a class="btn btn-ghost btn-sm" href="./crm-search.html?q=' + encodeURIComponent(q) + '">' + label + "</a>";
  }

  function filtered() {
    var q = $("liSearch").value.trim();
    var seg = $("liSegment").value, st = $("liStatus").value, reach = $("liReach").value;
    return state.items.filter(function (it) {
      if (seg && it.segment !== seg) return false;
      if (st && it.status !== st) return false;
      if (reach === "email" && !it.email) return false;
      if (reach === "phone" && !it.phone) return false;
      if (reach === "none" && (it.email || it.phone)) return false;
      if (q && !matchesSearch(it, q)) return false;
      return true;
    }).sort(function (a, b) { return (nextDue(a.ref_date) || 9e15) - (nextDue(b.ref_date) || 9e15); });
  }

  function render() {
    var all = state.items;
    var count = function (f) { return all.filter(f).length; };
    $("liKpis").innerHTML = [
      ["Total", all.length],
      ["Clients signés", count(function (i) { return i.segment === "client"; })],
      ["Devis non signés", count(function (i) { return i.segment === "prospect"; })],
      ["À traiter", count(function (i) { return i.status === "a_traiter"; })],
      ["Gagnés", count(function (i) { return i.status === "gagne"; })],
    ].map(function (k) { return '<div class="acq-stat"><strong>' + k[1] + "</strong><span>" + k[0] + "</span></div>"; }).join("");

    var rows = filtered();
    if (!rows.length) {
      var typed = $("liSearch").value.trim();
      $("liTable").innerHTML = '<p class="muted">Aucun lead importé pour ces filtres.</p>' +
        (typed ? "<p>" + globalSearchLink(typed, "Chercher « " + esc(typed) + " » dans tout le CRM") + "</p>" : "");
      return;
    }
    var opts = Object.keys(STATUS_LABELS);
    $("liTable").innerHTML = '<table class="lh-table"><thead><tr><th>Lead</th><th>Type</th><th>Contact</th><th>Prochaine échéance</th><th>Statut</th><th>Notes</th><th>Actions</th></tr></thead><tbody>' +
      rows.map(function (it) {
        return "<tr data-id=\"" + esc(it.id) + "\">" +
          "<td><strong>" + esc(it.full_name || "—") + "</strong><br><span class=\"lh-badge lh-badge--" + esc(it.segment) + "\">" + (it.segment === "client" ? "Client signé" : "Devis non signé") + "</span></td>" +
          "<td>" + esc(it.product || "") + "<br><span class=\"muted\">" + esc(it.batch || "") + "</span></td>" +
          "<td>" + (it.email ? esc(it.email) : '<span class="muted">pas d\'e-mail perso</span>') + "<br>" + (it.phone ? esc(it.phone) : '<span class="muted">pas de tél.</span>') +
          (it.email_broker ? '<br><span class="li-warn">E-mail d\'un autre courtier, ne pas écrire</span>' : "") + "</td>" +
          "<td>" + dueCell(it) + "</td>" +
          '<td><select class="crm-input li-status">' + opts.map(function (o) { return '<option value="' + o + '"' + (o === it.status ? " selected" : "") + ">" + STATUS_LABELS[o] + "</option>"; }).join("") + "</select></td>" +
          '<td><textarea class="crm-input li-notes" rows="2">' + esc(it.notes || "") + "</textarea></td>" +
          '<td class="li-row-actions">' +
            (it.email ? '<a class="btn btn-ghost btn-sm li-mail" href="' + mailto(it) + '">Mail</a>' : "") +
            (it.phone
              ? '<a class="btn btn-ghost btn-sm" href="tel:' + esc(it.phone) + '">Appeler</a>'
              : globalSearchLink(it.full_name || it.email || "", "Chercher le numéro")) +
          "</td></tr>";
      }).join("") + "</tbody></table>";
  }

  function load() {
    $("liTable").innerHTML = '<p class="muted">Chargement…</p>';
    api("GET").then(function (d) {
      if (!d.ok) { $("liTable").innerHTML = '<p class="muted">' + esc(d.error || "Erreur") + "</p>"; return; }
      state.items = d.items || [];
      var fromUrl = new URLSearchParams(location.search).get("q");
      if (fromUrl && !$("liSearch").value) $("liSearch").value = fromUrl;
      render();
    });
  }

  function patch(id, body) {
    body.id = id;
    var it = state.items.find(function (x) { return x.id === id; });
    if (it) Object.keys(body).forEach(function (k) { if (k !== "id") it[k] = body[k]; });
    return api("PATCH", body);
  }

  /* ---------- Events ---------- */
  var sel = $("liStatus");
  Object.keys(STATUS_LABELS).forEach(function (k) { var o = document.createElement("option"); o.value = k; o.textContent = STATUS_LABELS[k]; sel.appendChild(o); });

  $("liFile").addEventListener("change", function (e) {
    var f = e.target.files[0]; if (!f) return;
    if (!$("liBatch").value) $("liBatch").value = f.name.replace(/\.[^.]+$/, "");
    var rd = new FileReader();
    rd.onload = function () { preview(String(rd.result || "")); };
    rd.readAsText(f, "utf-8");
  });
  $("liPreview").addEventListener("click", function () { preview($("liPaste").value); });
  $("liImport").addEventListener("click", function () {
    var btn = this; btn.disabled = true;
    api("POST", { batch: $("liBatch").value, rows: state.parsed }).then(function (d) {
      $("liPreviewInfo").textContent = d.ok ? d.inserted + " leads importés, " + d.skipped + " doublons ignorés." : "Erreur : " + (d.error || "");
      state.parsed = []; $("liPaste").value = ""; $("liFile").value = "";
      load();
    });
  });

  ["liSearch", "liSegment", "liStatus", "liReach"].forEach(function (id) { $(id).addEventListener("input", render); });
  $("liRefresh").addEventListener("click", load);

  $("liTable").addEventListener("change", function (e) {
    var tr = e.target.closest("tr"); if (!tr) return;
    if (e.target.classList.contains("li-status")) patch(tr.dataset.id, { status: e.target.value }).then(render);
    if (e.target.classList.contains("li-notes")) patch(tr.dataset.id, { notes: e.target.value });
  });
  $("liTable").addEventListener("click", function (e) {
    var a = e.target.closest(".li-mail"); if (!a) return;
    var tr = a.closest("tr");
    var it = state.items.find(function (x) { return x.id === tr.dataset.id; });
    if (it && it.status === "a_traiter") patch(it.id, { status: "mail_envoye" }).then(render);
  });

  $("liCopyEmails").addEventListener("click", function () {
    var emails = filtered().map(function (i) { return i.email; }).filter(Boolean);
    navigator.clipboard.writeText(emails.join(", ")).then(function () {
      alert(emails.length + " e-mails copiés : collez-les en Cci (jamais en « À »).");
    });
  });
  $("liExport").addEventListener("click", function () {
    var head = ["Nom", "Type", "Produit", "Email", "Téléphone", "Prochaine échéance", "Statut", "Notes"];
    var lines = [head].concat(filtered().map(function (i) {
      var d = nextDue(i.ref_date);
      return [i.full_name, i.segment === "client" ? "Client signé" : "Devis non signé", i.product, i.email, i.phone,
        d ? d.toLocaleDateString("fr-FR") : "", STATUS_LABELS[i.status] || i.status, i.notes];
    }));
    var csv = lines.map(function (r) { return r.map(function (c) { return '"' + String(c == null ? "" : c).replace(/"/g, '""') + '"'; }).join(";"); }).join("\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" }));
    a.download = "leads-importes.csv"; a.click();
  });

  load();
})();
