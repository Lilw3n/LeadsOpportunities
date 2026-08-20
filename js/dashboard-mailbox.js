/**
 * Messagerie — e-mails recus en avant + fil Q&R par conversation
 */
(function () {
  var LS_SYNC = "mbx_last_imap_sync";
  var LS_SYNC_ERR = "mbx_last_imap_error";
  var LS_SETUP_HIDE = "mbx_setup_hidden";
  var LS_EXPRESS_SEEN = "mbx_express_seen_ids";

  var TEMPLATES = {
    merci:
      "Bonjour,\n\nMerci pour votre message. Nous revenons vers vous tres rapidement.\n\nBien cordialement,\nLeads Opportunities",
    rdv:
      "Bonjour,\n\nJe suis disponible pour un echange telephonique. Quelles sont vos disponibilites ?\n\nBien cordialement,\nLeads Opportunities",
    devis:
      "Bonjour,\n\nVotre demande est en cours d'analyse. Nous vous repondrons sous 24 a 48 h ouvrees.\n\nBien cordialement,\nLeads Opportunities",
    pay_dossier:
      "Bonjour,\n\nSuite a votre demande, merci de regler les frais de dossier via le lien securise ci-dessous :\n\n{{LINK_BLOCK}}\n\nCe paiement permet le traitement de votre dossier. Nous restons a votre disposition pour toute question.\n\nBien cordialement,\nLeads Opportunities",
    pay_abo:
      "Bonjour,\n\nVoici le lien pour activer votre abonnement :\n\n{{LINK_BLOCK}}\n\nLe prelevement sera effectue selon la periodicite indiquee. Pour toute modification, repondez a cet e-mail.\n\nBien cordialement,\nLeads Opportunities",
    pay_acompte:
      "Bonjour,\n\nMerci de regler l'acompte relatif a votre devis{{QUOTE_REF}} via le lien securise ci-dessous :\n\n{{LINK_BLOCK}}\n\nDes reception du paiement, nous poursuivrons la mise en place de votre contrat.\n\nBien cordialement,\nLeads Opportunities",
  };

  var PAYMENT_TEMPLATE_KIND = {
    pay_dossier: "dossier_fee",
    pay_abo: "subscription",
    pay_acompte: "acompte",
  };

  var STRIPE_LABELS = {
    dossier_fee: "Frais de dossier",
    subscription: "Abonnement",
    one_time: "Paiement",
    acompte: "Acompte",
  };

  var state = {
    all: [],
    filtered: [],
    printLead: null,
    threads: [],
    view: "feed",
    selectedId: null,
    selectedThreadKey: null,
    search: "",
    sortDesc: true,
    imapConfigured: false,
    mailboxAddress: "contact@leadsopportunities.fr",
    tableMissing: false,
    stats: null,
    pendingOpenId: null,
  };

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function toast(msg, type) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.className = "toast " + (type || "success") + " show";
    setTimeout(function () {
      el.classList.remove("show");
    }, 3800);
  }

  function extractEmail(addr) {
    var m = String(addr || "").match(/<([^>]+)>/);
    return (m && m[1]) || String(addr || "").trim();
  }

  function messageKind(m) {
    if (!m) return "other";
    if (m.direction === "outbound") return "outbound";
    if (String(m.id || "").indexOf("lead_") === 0) return "site";
    if (m.external_uid) return "imap";
    return "inbound";
  }

  function isExpressCallback(m) {
    if (!m || messageKind(m) !== "site") return false;
    if (m.category === "express_callback") return true;
    var sub = String(m.subject || "").toLowerCase();
    if (sub.indexOf("rappel express") >= 0) return true;
    var body = String(m.body_text || "");
    if (
      body.indexOf("Type: Rappel express") >= 0 ||
      body.indexOf("Demande de rappel express") >= 0
    ) {
      return true;
    }
    var p = parseLeadPayload(m.body_text);
    if (p.callbackRequested === true || String(p.journey || "") === "callback") return true;
    var src = String(p.source || "").toLowerCase();
    if (
      src.indexOf("callback") >= 0 ||
      src === "homepage_callback" ||
      src === "landing_callback_strip"
    ) {
      return true;
    }
    return false;
  }

  function siteLeadKind(m) {
    if (!m || messageKind(m) !== "site") return null;
    if (isExpressCallback(m)) return "express_callback";
    if (m.category === "questionnaire" || m.category === "contact_request") return m.category;
    var sub = String(m.subject || "").toLowerCase();
    if (sub.indexOf("demande de contact") >= 0 || sub.indexOf("rappel express") >= 0) {
      return "contact_request";
    }
    if (sub.indexOf("questionnaire") >= 0) return "questionnaire";
    var body = String(m.body_text || "");
    if (body.indexOf("Type: Rappel express") >= 0 || body.indexOf("Type: Demande de contact") >= 0) {
      return "contact_request";
    }
    if (body.indexOf("Type: Questionnaire") >= 0) return "questionnaire";
    return "questionnaire";
  }

  function isSiteQuestionnaire(m) {
    return messageKind(m) === "site" && siteLeadKind(m) === "questionnaire";
  }

  function isSiteContactRequest(m) {
    return messageKind(m) === "site" && siteLeadKind(m) === "contact_request";
  }

  function isSiteExpressCallback(m) {
    return messageKind(m) === "site" && siteLeadKind(m) === "express_callback";
  }

  function isReceivedMail(m) {
    return messageKind(m) === "imap" || (m.direction === "inbound" && messageKind(m) !== "site");
  }

  function initials(addr) {
    var e = extractEmail(addr) || "?";
    var parts = e.replace(/@.*/, "").split(/[._-]/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return e.slice(0, 2).toUpperCase();
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    try {
      var d = new Date(iso);
      var now = new Date();
      if (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      ) {
        return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      }
      return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
    } catch (e) {
      return iso;
    }
  }

  function fmtDateLong(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("fr-FR", {
        weekday: "short",
        day: "2-digit",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return iso;
    }
  }

  function parseLeadPayload(text) {
    if (!text) return null;
    var raw = String(text).trim();
    var jsonPart = raw;
    var marker = "--- Données JSON ---";
    var cut = raw.indexOf(marker);
    if (cut >= 0) {
      jsonPart = raw.slice(cut + marker.length).trim();
    } else if (raw.charAt(0) !== "{") {
      return null;
    }
    try {
      var o = JSON.parse(jsonPart);
      return typeof o === "object" && o ? o : null;
    } catch (e) {
      return null;
    }
  }

  function leadIdFromMessage(m) {
    if (!m) return null;
    if (m.lead_id) return String(m.lead_id);
    if (String(m.id || "").indexOf("lead_") === 0) return String(m.id).slice(5);
    return null;
  }

  function messagePreview(m) {
    var t = (m.body_text || "").replace(/\s+/g, " ").trim();
    if (t.indexOf("===") === 0 || t.charAt(0) === "{") {
      var p = parseLeadPayload(m.body_text);
      if (p) {
        return (
          [p.vertical, p.city, p.phone, p.message || p.comment].filter(Boolean).join(" · ") ||
          "Demande formulaire"
        );
      }
      var stepMatch = t.match(/Étape\s*:\s*(\d+)\s*\/\s*(\d+)/i);
      if (stepMatch) {
        return (
          (m.subject || "Questionnaire").replace(/\s+/g, " ").trim() +
          " · étape " +
          stepMatch[1] +
          "/" +
          stepMatch[2]
        );
      }
      return (m.subject || "Demande formulaire").replace(/\s+/g, " ").trim();
    }
    if (!t && m.body_html) {
      t = String(m.body_html)
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
    return t.slice(0, 140);
  }

  function messageBodyForDisplay(m) {
    var t = (m.body_text || "").trim();
    if (t.indexOf("===") === 0) {
      var cut = t.indexOf("--- Données JSON ---");
      if (cut > 0) return t.slice(0, cut).trim();
      return t;
    }
    if (t.indexOf("=== Demande formulaire") === 0) {
      var cut = t.indexOf("--- Données JSON ---");
      if (cut > 0) return t.slice(0, cut).trim();
      return t;
    }
    if (t.charAt(0) === "{") {
      var p = parseLeadPayload(m.body_text);
      if (p) {
        var msg = [p.message, p.comment].filter(Boolean).join("\n");
        if (msg) return msg;
      }
    }
    if (!t && m.body_html) {
      t = String(m.body_html)
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
    }
    return t || "";
  }

  function threadKeyForMessage(m) {
    var p = parseLeadPayload(m.body_text);
    var email = (p && p.email) || extractEmail(m.direction === "inbound" ? m.from_addr : m.to_addr);
    if (email && email.indexOf("@") > 0) return email.toLowerCase();
    if (m.thread_key) return String(m.thread_key).toLowerCase();
    return m.id;
  }

  function buildThreads(messages) {
    var map = {};
    messages.forEach(function (m) {
      var key = threadKeyForMessage(m);
      if (!map[key]) {
        map[key] = {
          key: key,
          contact: extractEmail(m.from_addr) || extractEmail(m.to_addr) || key,
          messages: [],
        };
      }
      map[key].messages.push(m);
    });

    var threads = Object.keys(map).map(function (k) {
      var t = map[k];
      t.messages.sort(function (a, b) {
        return new Date(a.created_at) - new Date(b.created_at);
      });
      var last = t.messages[t.messages.length - 1];
      t.last = last;
      t.lastAt = last.created_at;
      t.needsReply = last.direction === "inbound";
      t.hasImap = t.messages.some(function (m) {
        return messageKind(m) === "imap";
      });
      t.hasSite = t.messages.some(function (m) {
        return messageKind(m) === "site";
      });
      t.hasQuestionnaire = t.messages.some(isSiteQuestionnaire);
      t.hasContactRequest = t.messages.some(isSiteContactRequest);
      t.hasExpress = t.messages.some(isExpressCallback);
      t.needsCallback =
        t.hasExpress &&
        !t.messages.some(function (m) {
          return m.direction === "outbound";
        });
      var subjIn = t.messages
        .slice()
        .reverse()
        .find(function (m) {
          return m.subject && m.direction === "inbound";
        });
      t.subject = (subjIn && subjIn.subject) || last.subject || "(sans objet)";
      t.preview = messagePreview(last);
      if (t.needsCallback && t.hasExpress) {
        t.priority = 0;
      } else if (t.needsReply && t.hasImap) {
        t.priority = 1;
      } else if (t.needsReply) {
        t.priority = 2;
      } else if (t.hasImap) {
        t.priority = 3;
      } else if (t.hasSite) {
        t.priority = 4;
      } else {
        t.priority = 5;
      }
      return t;
    });

    threads.sort(function (a, b) {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return new Date(b.lastAt) - new Date(a.lastAt);
    });
    return threads;
  }

  function applyFilters() {
    var q = state.search.toLowerCase().trim();
    var pool = state.all.filter(function (m) {
      if (!q) return true;
      var hay =
        (m.subject || "") +
        " " +
        (m.from_addr || "") +
        " " +
        (m.to_addr || "") +
        " " +
        (m.body_text || "");
      return hay.toLowerCase().indexOf(q) >= 0;
    });

    if (state.view === "received") {
      pool = pool.filter(isReceivedMail);
    } else if (state.view === "questionnaires") {
      pool = pool.filter(isSiteQuestionnaire);
    } else if (state.view === "express_callbacks") {
      pool = pool.filter(isSiteExpressCallback);
    } else if (state.view === "contact_requests") {
      pool = pool.filter(isSiteContactRequest);
    } else if (state.view === "site") {
      pool = pool.filter(function (m) {
        return messageKind(m) === "site";
      });
    } else if (state.view === "sent") {
      pool = pool.filter(function (m) {
        return m.direction === "outbound";
      });
    }

    pool.sort(function (a, b) {
      var ta = new Date(a.created_at).getTime() || 0;
      var tb = new Date(b.created_at).getTime() || 0;
      return state.sortDesc ? tb - ta : ta - tb;
    });

    state.filtered = pool;
    state.threads = buildThreads(
      state.view === "feed"
        ? pool
        : state.all.filter(function (m) {
            if (!q) return true;
            var hay = (m.subject || "") + (m.from_addr || "") + (m.body_text || "");
            return hay.toLowerCase().indexOf(q) >= 0;
          })
    );
  }

  function setView(view) {
    state.view = view || "feed";
    document.querySelectorAll(".mbx-view-tab").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-view") === state.view);
    });
    document.querySelectorAll(".mbx-stat[data-view]").forEach(function (b) {
      b.classList.toggle("is-active-stat", b.getAttribute("data-view") === state.view);
    });
    var hint = document.getElementById("mailboxListHint");
    if (hint) {
      var hints = {
        received: "E-mails recus sur contact@",
        feed: "E-mails + questionnaires + rappels express + contacts",
        express_callbacks: "Rappels express — a traiter en priorite (~15 min)",
        questionnaires: "Parcours devis / questionnaires multi-etapes",
        contact_requests: "Formulaire contact accueil et message libre (hors rappel express)",
        site: "Tous les leads site (legacy)",
        sent: "Vos reponses envoyees",
      };
      hint.textContent = hints[state.view] || "";
    }
    applyFilters();
    renderList();
  }

  function countPendingExpress() {
    return buildThreads(state.all).filter(function (t) {
      return t.needsCallback && t.hasExpress;
    }).length;
  }

  function countNeedsReply() {
    return buildThreads(state.all).filter(function (t) {
      return t.needsReply && t.hasImap;
    }).length;
  }

  function updateNavBadge() {
    var badge = document.getElementById("mailboxNavBadge");
    if (!badge) return;
    var expressN = countPendingExpress();
    var mailN = countNeedsReply();
    var n = expressN + mailN;
    if (n > 0) {
      badge.hidden = false;
      badge.textContent = n > 99 ? "99+" : String(n);
      badge.title =
        (expressN ? expressN + " rappel(s) express" : "") +
        (expressN && mailN ? " · " : "") +
        (mailN ? mailN + " e-mail(s) a repondre" : "");
      if (expressN > 0) badge.classList.add("nav-badge--urgent");
      else badge.classList.remove("nav-badge--urgent");
    } else {
      badge.hidden = true;
      badge.classList.remove("nav-badge--urgent");
    }
  }

  function renderStats() {
    var s = state.stats || {};
    var received = state.all.filter(isReceivedMail).length;
    var threads = buildThreads(state.all).length;
    var el = function (id, v) {
      var n = document.getElementById(id);
      if (n) n.textContent = v != null ? String(v) : "0";
    };
    el("mbxStatReceived", received || s.imapMessages || 0);
    el("mbxStatThreads", threads);
    el("mbxStatQuestionnaires", s.questionnaires != null ? s.questionnaires : "—");
    el("mbxStatExpress", countPendingExpress() || s.expressCallbacks || 0);
    el("mbxStatContactRequests", s.contactRequests != null ? s.contactRequests : "—");
    el("mbxStatSite", s.siteLeads);
    el("mbxStatOut", s.outbound);
    var expressStat = document.querySelector('.mbx-stat[data-view="express_callbacks"]');
    if (expressStat) {
      expressStat.classList.toggle("mbx-stat--urgent", countPendingExpress() > 0);
    }
    updateNavBadge();
  }

  function updateStatusBar() {
    var el = document.getElementById("mailboxLastUpdate");
    if (el) el.innerHTML = "<strong>Messagerie</strong> — " + fmtDateLong(new Date().toISOString());
    var hint = document.getElementById("mailboxSyncHint");
    if (!hint) return;
    var err = localStorage.getItem(LS_SYNC_ERR);
    if (!state.imapConfigured) {
      hint.innerHTML = '<span style="color:#b45309">Configurez IMAP pour voir les e-mails contact@</span>';
      return;
    }
    if (err) {
      hint.innerHTML = '<span style="color:#b91c1c">IMAP : ' + esc(err) + "</span>";
      return;
    }
    var n = countNeedsReply();
    var ex = countPendingExpress();
    hint.textContent =
      state.all.filter(isReceivedMail).length +
      " e-mail(s) recu(s)" +
      (ex ? " · " + ex + " rappel(s) express" : "") +
      (n ? " · " + n + " e-mail(s) a repondre" : "") +
      " · sync " +
      (localStorage.getItem(LS_SYNC) ? fmtDate(localStorage.getItem(LS_SYNC)) : "—");
  }

  function renderSetup(meta) {
    var box = document.getElementById("mailboxSetup");
    if (!box) return;
    if (localStorage.getItem(LS_SETUP_HIDE) === "1" && !state.tableMissing) {
      box.hidden = true;
      return;
    }
    box.hidden = false;
    if (state.tableMissing) {
      box.className = "mbx-setup mbx-setup--err";
      box.innerHTML = "<strong>Base messagerie</strong> — verifiez DATABASE_URL.";
      return;
    }
    box.className = "mbx-setup " + (meta && meta.imapConfigured ? "mbx-setup--ok" : "");
    box.innerHTML =
      (meta && meta.imapConfigured
        ? "<strong>Boite contact@ synchronisee</strong> — les e-mails recus apparaissent en premier."
        : "<strong>IMAP</strong> — requis pour les e-mails recus.") +
      ' <button type="button" class="btn-ghost" id="mailboxHideSetup" style="margin-left:8px;font-size:0.75rem">Masquer</button>';
    var hide = document.getElementById("mailboxHideSetup");
    if (hide) {
      hide.addEventListener("click", function () {
        localStorage.setItem(LS_SETUP_HIDE, "1");
        box.hidden = true;
      });
    }
  }

  function renderThreadCard(t, active) {
    var cls = "mbx-thread-card";
    if (active) cls += " is-active";
    if (t.needsCallback && t.hasExpress) cls += " mbx-thread-card--express";
    else if (t.needsReply && t.hasImap) cls += " mbx-thread-card--reply";
    else if (t.hasImap) cls += " mbx-thread-card--mail";
    var tags =
      (t.needsCallback && t.hasExpress
        ? '<span class="mbx-pill mbx-pill--express">Rappel express</span>'
        : "") +
      (t.needsReply && t.hasImap ? '<span class="mbx-pill mbx-pill--reply">A repondre</span>' : "") +
      (t.hasImap ? '<span class="mbx-pill mbx-pill--mail">E-mail</span>' : "") +
      (t.hasExpress && !(t.needsCallback && t.hasExpress)
        ? '<span class="mbx-pill mbx-pill--express-done">Rappel (traite)</span>'
        : "") +
      (t.hasSite && !t.hasExpress ? '<span class="mbx-pill mbx-pill--site">Site</span>' : "") +
      '<span class="mbx-pill" style="background:#f1f5f9;color:#64748b">' +
      t.messages.length +
      " msg</span>";
    return (
      '<button type="button" class="' +
      cls +
      '" data-thread="' +
      esc(t.key) +
      '">' +
      '<div class="mbx-thread-card__top"><span class="mbx-thread-card__who">' +
      esc(t.contact) +
      '</span><span class="mbx-thread-card__time">' +
      fmtDate(t.lastAt) +
      "</span></div>" +
      '<div class="mbx-thread-card__sub">' +
      esc(t.subject) +
      "</div>" +
      '<div class="mbx-thread-card__prev">' +
      esc(t.preview) +
      "</div>" +
      '<div class="mbx-thread-card__tags">' +
      tags +
      "</div></button>"
    );
  }

  function renderThreadList() {
    var list = document.getElementById("mailboxList");
    if (!list) return;

    var threads = state.threads;
    if (state.view === "feed") {
      threads = state.threads;
    } else {
      threads = buildThreads(state.filtered);
    }

    if (!threads.length) {
      var siteN = (state.stats && state.stats.siteLeads) || 0;
      list.innerHTML =
        '<div class="mbx-empty" style="padding:32px 16px"><p>Aucune conversation.</p>' +
        (siteN > 0
          ? "<p>Essayez l'onglet <strong>Site</strong> (" + siteN + " demande(s)).</p>"
          : "<p>Verifiez DATABASE_URL et <code>site_leads.sql</code> sur Neon.</p>") +
        "</div>";
      return;
    }

    var html = "";
    var urgent = threads.filter(function (t) {
      return t.needsReply && t.hasImap;
    });
    var mail = threads.filter(function (t) {
      return t.hasImap && !(t.needsReply && t.hasImap);
    });
    var siteOnly = threads.filter(function (t) {
      return !t.hasImap && t.hasSite;
    });
    var questionnairesOnly = threads.filter(function (t) {
      return !t.hasImap && t.hasQuestionnaire && !t.hasExpress;
    });
    var expressOnly = threads.filter(function (t) {
      return t.needsCallback && t.hasExpress;
    });
    var contactOnly = threads.filter(function (t) {
      return !t.hasImap && t.hasContactRequest && !t.hasQuestionnaire && !t.hasExpress;
    });

    function block(label, items) {
      if (!items.length) return "";
      var h = '<div class="mbx-list-section">' + esc(label) + "</div>";
      items.forEach(function (t) {
        h += renderThreadCard(t, state.selectedThreadKey === t.key);
      });
      return h;
    }

    if (state.view === "feed") {
      html += block("URGENT — Rappels express a traiter", expressOnly);
      html += block("A repondre — e-mail recu", urgent);
      html += block("Conversations e-mail", mail);
      html += block("Questionnaires remplis", questionnairesOnly);
      html += block("Demandes de contact", contactOnly);
    } else {
      threads.forEach(function (t) {
        html += renderThreadCard(t, state.selectedThreadKey === t.key);
      });
    }

    list.innerHTML = html;
    list.querySelectorAll("[data-thread]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectThread(btn.getAttribute("data-thread"));
      });
    });
  }

  function renderMessageList() {
    var list = document.getElementById("mailboxList");
    if (!list || !state.filtered.length) {
      if (list) {
        var siteN = (state.stats && state.stats.siteLeads) || 0;
        var qN = (state.stats && state.stats.questionnaires) || 0;
        var cN = (state.stats && state.stats.contactRequests) || 0;
        var exN = countPendingExpress();
        list.innerHTML =
          '<div class="mbx-empty" style="padding:32px"><p>Aucun e-mail IMAP recu.</p>' +
          (exN > 0
            ? "<p><strong style='color:#c2410c'>" +
              exN +
              " rappel(s) express</strong> — onglet <em>Rappels express</em> ou <em>Fil Q&amp;R</em>.</p>"
            : qN > 0 || cN > 0
              ? "<p><strong>" +
                qN +
                " questionnaire(s)</strong> · <strong>" +
                cN +
                " demande(s) contact</strong> — onglets dedies.</p>"
              : siteN > 0
                ? "<p><strong>" + siteN + " lead(s) site</strong> — voir Fil Q&amp;R.</p>"
                : "<p>Les formulaires apparaissent apres enregistrement en base (DATABASE_URL).</p>") +
          "</div>";
      }
      return;
    }

    list.innerHTML = state.filtered
      .map(function (m) {
        var active = m.id === state.selectedId ? " is-active" : "";
        var received = isReceivedMail(m) ? " mbx-item--received" : "";
        return (
          '<button type="button" class="mbx-item' +
          active +
          received +
          '" data-id="' +
          esc(m.id) +
          '">' +
          '<span class="mbx-item__avatar mbx-item__avatar--imap">' +
          esc(initials(m.from_addr)) +
          "</span>" +
          '<span class="mbx-item__main">' +
          '<span class="mbx-item__row"><span class="mbx-item__subject">' +
          esc(m.subject || "(sans objet)") +
          '</span><span class="mbx-item__time">' +
          fmtDate(m.created_at) +
          "</span></span>" +
          '<span class="mbx-item__from">' +
          esc(extractEmail(m.from_addr)) +
          "</span>" +
          '<span class="mbx-item__preview">' +
          esc(messagePreview(m)) +
          "</span></span>" +
          '<span class="mbx-badge mbx-badge--imap">Recu</span></button>'
        );
      })
      .join("");

    list.querySelectorAll(".mbx-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectMessage(btn.getAttribute("data-id"));
      });
    });
  }

  function renderList() {
    if (state.tableMissing) {
      document.getElementById("mailboxList").innerHTML =
        '<div class="mbx-empty" style="padding:24px"><p>Erreur base.</p></div>';
      return;
    }
    if (state.view === "feed") renderThreadList();
    else if (state.view === "received") renderMessageList();
    else if (
      state.view === "questionnaires" ||
      state.view === "express_callbacks" ||
      state.view === "contact_requests" ||
      state.view === "site" ||
      state.view === "sent"
    ) {
      if (
        state.view === "questionnaires" ||
        state.view === "express_callbacks" ||
        state.view === "contact_requests" ||
        state.view === "site" ||
        state.view === "sent"
      ) {
        var list = document.getElementById("mailboxList");
        if (!state.filtered.length) {
          var emptyMsg =
            state.view === "express_callbacks"
              ? "Aucun rappel express en attente."
              : state.view === "questionnaires"
                ? "Aucun questionnaire enregistre."
                : state.view === "contact_requests"
                  ? "Aucune demande de contact."
                  : "Rien ici.";
          list.innerHTML = '<div class="mbx-empty" style="padding:32px"><p>' + emptyMsg + "</p></div>";
          return;
        }
        list.innerHTML = state.filtered
          .map(function (m) {
            var kind = messageKind(m);
            var active = m.id === state.selectedId ? " is-active" : "";
            return (
              '<button type="button" class="mbx-item' +
              active +
              '" data-id="' +
              esc(m.id) +
              '"><span class="mbx-item__main"><strong>' +
              esc(m.subject || "(sans objet)") +
              "</strong><br><span style='font-size:0.8rem;color:var(--muted)'>" +
              esc(extractEmail(m.from_addr)) +
              " · " +
              fmtDate(m.created_at) +
              "</span></span></button>"
            );
          })
          .join("");
        list.querySelectorAll(".mbx-item").forEach(function (btn) {
          btn.addEventListener("click", function () {
            selectMessage(btn.getAttribute("data-id"));
          });
        });
      }
    }
  }

  function renderLeadBubble(m, payload, lead) {
    if (window.CrmLeadPayloadView && window.CrmLeadPayloadView.renderQuestionnairePanel) {
      var merged = Object.assign({}, lead || {}, {
        payload: payload,
        payload_obj: payload,
        questionnaire_step: (lead && lead.questionnaire_step) || payload.questionnaire_step,
        questionnaire_total: (lead && lead.questionnaire_total) || payload.questionnaire_total,
        email: (lead && lead.email) || payload.email,
        phone: (lead && lead.phone) || payload.phone,
        vertical: (lead && lead.vertical) || payload.vertical,
      });
      return (
        '<div class="mbx-qa-bubble mbx-qa-bubble--site mbx-qa-bubble--answers">' +
        window.CrmLeadPayloadView.renderQuestionnairePanel(merged, esc) +
        '<div class="mbx-qa-bubble__meta">' +
        fmtDateLong(m.created_at) +
        "</div></div>"
      );
    }
    var rows = [
      ["Nom", payload.fullName || payload.name],
      ["Tel", payload.phone],
      ["Vertical", payload.vertical],
      ["Score", payload.leadScore != null ? payload.leadScore + "/100" : null],
      ["Ville", payload.city || payload.seo_city],
    ]
      .filter(function (r) {
        return r[1];
      })
      .map(function (r) {
        return "<strong>" + esc(r[0]) + " :</strong> " + esc(String(r[1]));
      })
      .join("<br>");
    var msg = payload.message || payload.comment;
    var label = isExpressCallback(m) ? "Rappel express" : "Demande site";
    var labelCls = isExpressCallback(m) ? " mbx-qa-bubble__label--express" : "";
    return (
      '<div class="mbx-qa-bubble mbx-qa-bubble--site' +
      (isExpressCallback(m) ? " mbx-qa-bubble--express" : "") +
      '">' +
      '<div class="mbx-qa-bubble__label' +
      labelCls +
      '">' +
      esc(label) +
      "</div>" +
      '<div class="mbx-qa-bubble__body">' +
      rows +
      (msg ? "<br><br>" + linkifyPreviewHtml(msg) : "") +
      "</div>" +
      '<div class="mbx-qa-bubble__meta">' +
      fmtDateLong(m.created_at) +
      "</div></div>"
    );
  }

  function renderMailboxLeadDetail(m, leadData) {
    var lead = leadData && leadData.lead ? leadData.lead : null;
    var payload =
      lead && lead.payload
        ? lead.payload
        : parseLeadPayload(m.body_text) || {};
    if (lead && lead.payload && typeof lead.payload === "string") {
      try {
        payload = JSON.parse(lead.payload);
      } catch (e) {}
    }
    state.printLead = lead
      ? Object.assign({}, lead, { payload: payload, payload_obj: payload })
      : { payload: payload, payload_obj: payload };

    if (window.CrmQuestionnaireTools && lead && lead.id) {
      var ctx = window.CrmQuestionnaireTools.leadContextFromData(lead);
      ctx.payload = payload;
      return (
        '<div class="mbx-lead-answers-wrap" id="mbxQuestionnaireWorkspace" data-lead-id="' +
        esc(lead.id) +
        '"></div>'
      );
    }

    var html = '<div class="mbx-lead-answers-wrap">';
    html += renderLeadBubble(m, payload, lead);
    html += "</div>";
    return html;
  }

  function bindMailboxQuestionnaireWorkspace(m, leadData) {
    var root = document.getElementById("mbxQuestionnaireWorkspace");
    if (!root || !window.CrmQuestionnaireTools || !leadData || !leadData.lead) return;
    var lead = leadData.lead;
    var payload = lead.payload || {};
    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch (e) {
        payload = {};
      }
    }
    var ctx = window.CrmQuestionnaireTools.leadContextFromData(lead);
    ctx.payload = payload;
    window.CrmQuestionnaireTools.mountQuestionnaireWorkspace(root, ctx, {
      api: "dashboard",
      authHeaders: window.Dashboard && window.Dashboard.authHeaders,
      onSaved: function () {
        var leadId = lead.id;
        if (leadId) hydrateLeadQuestionnaireAnswers(m, leadId);
      },
    });
  }

  async function hydrateLeadQuestionnaireAnswers(m, leadId) {
    var body = document.getElementById("mailboxDetailBody");
    if (!body || !leadId || !window.Dashboard || !window.Dashboard.api) {
      if (body) body.innerHTML = renderQaFeed([m]);
      return;
    }
    body.innerHTML =
      '<div class="loading-state" style="padding:28px;text-align:center"><div class="spinner"></div><p>Chargement des réponses questionnaire…</p></div>';
    try {
      var data = await window.Dashboard.api(
        "/api/dashboard/lead-detail?id=" + encodeURIComponent(leadId)
      );
      if (!data.ok || !data.lead) {
        body.innerHTML = renderMailboxLeadDetail(m, null);
        return;
      }
      body.innerHTML = renderMailboxLeadDetail(m, data);
      bindMailboxQuestionnaireWorkspace(m, data);
    } catch (e) {
      body.innerHTML = renderMailboxLeadDetail(m, null);
    }
  }

  function renderQaFeed(messages) {
    var html = '<div class="mbx-qa-feed">';
    messages.forEach(function (m) {
      var payload = parseLeadPayload(m.body_text);
      if (messageKind(m) === "site" && payload) {
        html += renderLeadBubble(m, payload, null);
        return;
      }
      var isOut = m.direction === "outbound";
      var label = isOut ? "Votre reponse" : "Message recu";
      var text = messageBodyForDisplay(m) || messagePreview(m);
      html +=
        '<div class="mbx-qa-bubble ' +
        (isOut ? "mbx-qa-bubble--out" : "mbx-qa-bubble--in") +
        '">' +
        '<div class="mbx-qa-bubble__label">' +
        label +
        (messageKind(m) === "imap" ? " · e-mail" : "") +
        "</div>" +
        '<div class="mbx-qa-bubble__body">' +
        (m.subject ? "<strong>" + esc(m.subject) + "</strong><br><br>" : "") +
        linkifyPreviewHtml(text) +
        "</div>" +
        '<div class="mbx-qa-bubble__meta">' +
        fmtDateLong(m.created_at) +
        "</div></div>";
    });
    return html + "</div>";
  }

  function showDetailPane(show) {
    var empty = document.getElementById("mailboxEmptyState");
    var detail = document.getElementById("mailboxDetailView");
    if (empty) empty.hidden = show;
    if (detail) detail.hidden = !show;
    if (show && window.innerWidth <= 960) {
      document.getElementById("mailboxPaneList").classList.add("mbx-pane--hidden-mobile");
      document.getElementById("mailboxPaneDetail").classList.remove("mbx-pane--hidden-mobile");
    }
  }

  function syncStripeIntervalVisibility() {
    var kindEl = document.getElementById("mailboxStripeKind");
    var wrap = document.getElementById("mailboxStripeIntervalWrap");
    if (!kindEl || !wrap) return;
    var isSub = kindEl.value === "subscription";
    wrap.hidden = !isSub;
    wrap.style.display = isSub ? "" : "none";
  }

  function syncStripeLabelFromKind() {
    var kindEl = document.getElementById("mailboxStripeKind");
    var labelEl = document.getElementById("mailboxStripeLabel");
    if (!kindEl || !labelEl) return;
    var next = STRIPE_LABELS[kindEl.value] || "Paiement";
    if (!labelEl.value.trim() || STRIPE_LABELS[labelEl.dataset.autoKind || ""]) {
      labelEl.value = next;
      labelEl.dataset.autoKind = kindEl.value;
    }
  }

  function formatEur(amount) {
    try {
      return Number(amount).toLocaleString("fr-FR", {
        style: "currency",
        currency: "EUR",
      });
    } catch (e) {
      return amount + " EUR";
    }
  }

  var INTERVAL_LABELS = {
    day: "jour",
    week: "semaine",
    month: "mois",
    year: "an",
  };

  function buildStripeLinkBlock(data) {
    var recurring =
      data.interval && INTERVAL_LABELS[data.interval]
        ? " / " + INTERVAL_LABELS[data.interval]
        : data.interval
          ? " / " + data.interval
          : "";
    var lines = [
      "Pour regler en ligne de maniere securisee :",
      data.url,
      "Montant : " + formatEur(data.amountEur) + recurring,
    ];
    if (data.label) lines.push("Libelle : " + data.label);
    if (data.referenceId) lines.push("Reference devis : " + data.referenceId);
    return lines.join("\n");
  }

  function buildStripeMailSnippet(data) {
    return "\n" + buildStripeLinkBlock(data) + "\n";
  }

  function paymentTemplateKeyForKind(kind) {
    if (kind === "dossier_fee") return "pay_dossier";
    if (kind === "subscription") return "pay_abo";
    if (kind === "acompte") return "pay_acompte";
    return null;
  }

  function buildPaymentEmailFromTemplate(data) {
    var key = paymentTemplateKeyForKind(data.paymentKind) || "pay_dossier";
    var tpl = TEMPLATES[key] || TEMPLATES.pay_dossier;
    var quoteRef = data.referenceId ? " " + data.referenceId : "";
    return tpl
      .replace("{{LINK_BLOCK}}", buildStripeLinkBlock(data))
      .replace(/\{\{QUOTE_REF\}\}/g, quoteRef);
  }

  function depositAmountFromQuote(quote) {
    if (!quote) return null;
    if (quote.deposit_amount != null && Number(quote.deposit_amount) > 0) {
      return Number(quote.deposit_amount);
    }
    var data = quote.data;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch (e) {
        data = null;
      }
    }
    if (data) {
      if (data.depositAmount != null && Number(data.depositAmount) > 0) return Number(data.depositAmount);
      if (data.acompte != null && Number(data.acompte) > 0) return Number(data.acompte);
    }
    var premium = Number(quote.premium_estimate);
    if (premium > 0) {
      return Math.round(Math.max(1, Math.min(premium * 0.2, premium * 0.5, 5000)) * 100) / 100;
    }
    return null;
  }

  async function lookupMailboxQuote() {
    var refEl = document.getElementById("mailboxStripeQuoteRef");
    var status = document.getElementById("mailboxStripeStatus");
    if (!refEl) return;
    var ref = (refEl.value || "").trim();
    if (!ref || ref.indexOf("qte_") !== 0) return;

    if (status) {
      status.textContent = "Chargement du devis…";
      status.className = "mbx-stripe-status";
    }

    var data = await window.Dashboard.api("/api/crm/quotes?id=" + encodeURIComponent(ref));
    if (!data.ok || !data.quote) {
      if (status) {
        status.textContent = data.error || "Devis introuvable.";
        status.className = "mbx-stripe-status is-error";
      }
      return;
    }

    var quote = data.quote;
    var amountEl = document.getElementById("mailboxStripeAmount");
    var kindEl = document.getElementById("mailboxStripeKind");
    var emailEl = document.getElementById("mailboxReplyTo");
    var deposit = depositAmountFromQuote(quote);

    if (kindEl && !kindEl.dataset.userChanged) kindEl.value = "acompte";
    syncStripeIntervalVisibility();
    syncStripeLabelFromKind();
    if (amountEl && deposit && !amountEl.value) amountEl.value = deposit;
    if (emailEl && quote.contact_email && !emailEl.value) emailEl.value = quote.contact_email;
    if (status) {
      status.textContent = quote.title
        ? "Devis charge : " + quote.title + (deposit ? " — " + formatEur(deposit) : "")
        : "Devis charge.";
      status.className = "mbx-stripe-status is-ok";
    }
  }

  function applyPaymentTemplateOnly(includePlaceholder) {
    var kind = document.getElementById("mailboxStripeKind").value;
    var key = paymentTemplateKeyForKind(kind) || "pay_dossier";
    var tpl = TEMPLATES[key];
    var quoteRef = (document.getElementById("mailboxStripeQuoteRef").value || "").trim();
    var linkBlock = includePlaceholder
      ? "[LIEN DE PAIEMENT STRIPE — cliquez sur « Generer et inserer le lien »]"
      : "{{LINK_BLOCK}}";
    var body = tpl
      .replace("{{LINK_BLOCK}}", linkBlock)
      .replace(/\{\{QUOTE_REF\}\}/g, quoteRef ? " " + quoteRef : "");
    document.getElementById("mailboxReplyBody").value = body;
    syncMailboxReplyPreview();
  }

  function insertTextAtCursor(textarea, text) {
    if (!textarea) return;
    var start = textarea.selectionStart;
    var end = textarea.selectionEnd;
    var value = textarea.value || "";
    if (typeof start === "number" && typeof end === "number") {
      textarea.value = value.slice(0, start) + text + value.slice(end);
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
    } else {
      textarea.value = value + (value && !value.endsWith("\n") ? "\n" : "") + text;
    }
    textarea.focus();
    syncMailboxReplyPreview();
  }

  function extractUrls(text) {
    return String(text || "").match(/https?:\/\/[^\s<>"']+/g) || [];
  }

  function linkifyPreviewHtml(text) {
    var parts = String(text || "").split(/(https?:\/\/[^\s<>"']+)/g);
    return parts
      .map(function (part) {
        if (/^https?:\/\//.test(part)) {
          return (
            '<a href="' +
            esc(part) +
            '" target="_blank" rel="noopener noreferrer">' +
            esc(part) +
            "</a>"
          );
        }
        return esc(part).replace(/\n/g, "<br>");
      })
      .join("");
  }

  function syncMailboxReplyPreview() {
    var ta = document.getElementById("mailboxReplyBody");
    var preview = document.getElementById("mailboxReplyPreview");
    var body = document.getElementById("mailboxReplyPreviewBody");
    var verify = document.getElementById("mailboxStripeVerifyLink");
    var title = document.getElementById("mailboxReplyPreviewTitle");
    if (!ta || !preview || !body) return;

    var text = ta.value || "";
    var urls = extractUrls(text);
    if (!text.trim() && !urls.length) {
      preview.hidden = true;
      if (verify) verify.hidden = true;
      return;
    }

    preview.hidden = false;
    body.innerHTML = linkifyPreviewHtml(text);
    if (title) {
      title.textContent = urls.length
        ? "Apercu — liens cliquables (verifiez avant envoi)"
        : "Apercu du message";
    }

    var stripeUrl =
      urls.find(function (u) {
        return u.indexOf("checkout.stripe.com") !== -1;
      }) || urls[0];

    if (verify) {
      if (stripeUrl) {
        verify.href = stripeUrl;
        verify.hidden = false;
        verify.textContent = stripeUrl.indexOf("checkout.stripe.com") !== -1
          ? "Ouvrir le lien Stripe dans un nouvel onglet"
          : "Ouvrir le lien dans un nouvel onglet";
      } else {
        verify.hidden = true;
      }
    }
  }

  function setupReplyForMessage(m) {
    if (!m) return;
    var replyTo = m.direction === "inbound" ? extractEmail(m.from_addr) : extractEmail(m.to_addr);
    document.getElementById("mailboxReplyTo").value = replyTo;
    document.getElementById("mailboxReplySubject").value = /^re:/i.test(m.subject || "")
      ? m.subject
      : "Re: " + (m.subject || "");
    document.getElementById("mailboxReplyToId").value = m.id;
    document.getElementById("mailboxReplySummary").textContent = "Repondre a " + replyTo;
    var body = document.getElementById("mailboxDetailBody");
    if (body) {
      setTimeout(function () {
        body.scrollTop = body.scrollHeight;
      }, 80);
    }
    syncMailboxReplyPreview();
  }

  function selectThread(key, opts) {
    opts = opts || {};
    state.selectedThreadKey = key;
    state.selectedId = null;
    var t = state.threads.find(function (x) {
      return x.key === key;
    });
    if (!t) {
      showDetailPane(false);
      renderList();
      return;
    }
    showDetailPane(true);
    var lastIn =
      t.messages
        .slice()
        .reverse()
        .find(function (m) {
          return m.direction === "inbound";
        }) || t.last;

    document.getElementById("mailboxDetailHead").innerHTML =
      "<h2>" +
      esc(t.contact) +
      "</h2>" +
      '<p style="margin:0;color:var(--muted);font-size:0.88rem">' +
      esc(t.subject) +
      (t.needsReply ? ' · <strong style="color:#b45309">En attente de reponse</strong>' : "") +
      "</p>" +
      '<div class="mbx-detail-actions" style="margin-top:12px">' +
      (t.hasSite
        ? '<a class="btn-ghost" href="./dashboard.html?section=leads">Voir leads</a>'
        : "") +
      '<button type="button" class="btn-ghost" data-copy="' +
      esc(t.contact) +
      '">Copier e-mail</button></div>';

    document.getElementById("mailboxDetailHead").querySelector("[data-copy]").addEventListener("click", function () {
      navigator.clipboard.writeText(t.contact).then(function () {
        toast("Copie");
      });
    });

    document.getElementById("mailboxDetailBody").innerHTML = renderQaFeed(t.messages);
    if (!opts.keepDraft) document.getElementById("mailboxReplyBody").value = "";
    setupReplyForMessage(lastIn);
    renderList();
  }

  function selectMessage(id, opts) {
    opts = opts || {};
    state.selectedId = id;
    state.selectedThreadKey = null;
    var m = state.all.find(function (x) {
      return x.id === id;
    });
    if (!m) {
      showDetailPane(false);
      renderList();
      return;
    }
    showDetailPane(true);
    var kind = messageKind(m);
    var leadId = leadIdFromMessage(m);

    document.getElementById("mailboxDetailHead").innerHTML =
      "<h2>" +
      esc(m.subject || "(sans objet)") +
      "</h2>" +
      '<p style="margin:0;font-size:0.85rem;color:var(--muted)">' +
      esc(extractEmail(m.from_addr)) +
      " · " +
      fmtDateLong(m.created_at) +
      (isReceivedMail(m) ? ' · <span style="color:#1d4ed8;font-weight:700">E-mail recu</span>' : "") +
      "</p>" +
      '<div class="mbx-detail-actions" style="margin-top:10px;display:flex;flex-wrap:wrap;gap:8px">' +
      (leadId
        ? '<button type="button" class="btn btn-primary btn-sm" id="mbxBtnAllAnswers">Toutes les réponses</button>' +
          '<button type="button" class="btn btn-ghost btn-sm" id="mbxBtnPrintPdf">Imprimer / PDF</button>' +
          (window.CrmQuestionnaireTools
            ? '<a class="btn-ghost btn-sm" href="' +
              esc(window.CrmQuestionnaireTools.buildResumeUrl({ leadId: leadId, email: extractEmail(m.from_addr) })) +
              '" target="_blank" rel="noopener">Ouvrir questionnaire</a>'
            : "") +
          '<a class="btn-ghost btn-sm" href="./crm-lead-detail.html?id=' +
          encodeURIComponent(leadId) +
          '">Fiche CRM</a>' +
          '<a class="btn-ghost btn-sm" href="./dashboard.html?section=leads&lead=' +
          encodeURIComponent(leadId) +
          '">Modal lead</a>'
        : '<button type="button" class="btn btn-ghost btn-sm" id="mbxBtnPrintPdf">Imprimer / PDF</button>') +
      "</div>";

    var answersBtn = document.getElementById("mbxBtnAllAnswers");
    if (answersBtn) {
      answersBtn.addEventListener("click", function () {
        if (typeof window.openLeadDetail === "function") window.openLeadDetail(leadId);
      });
    }
    var printBtn = document.getElementById("mbxBtnPrintPdf");
    if (printBtn) {
      printBtn.addEventListener("click", function () {
        var payload = parseLeadPayload(m.body_text) || {};
        var lead = state.printLead || {
          payload: payload,
          payload_obj: payload,
          email: payload.email || extractEmail(m.from_addr),
          phone: payload.phone,
          vertical: payload.vertical,
        };
        if (window.PrintDocument) window.PrintDocument.fromLead(lead, { kind: "questionnaire" });
      });
    }

    if (leadId && messageKind(m) === "site") {
      hydrateLeadQuestionnaireAnswers(m, leadId);
    } else if (state.view === "feed" || state.view === "received") {
      var tk = threadKeyForMessage(m);
      var th = state.threads.find(function (x) {
        return x.key === tk;
      });
      if (th && th.messages.length > 1) {
        document.getElementById("mailboxDetailBody").innerHTML = renderQaFeed(th.messages);
      } else {
        document.getElementById("mailboxDetailBody").innerHTML = renderQaFeed([m]);
      }
    } else {
      document.getElementById("mailboxDetailBody").innerHTML = renderQaFeed([m]);
    }

    if (!opts.keepDraft) document.getElementById("mailboxReplyBody").value = "";
    setupReplyForMessage(m);
    renderList();
  }

  function playExpressAlert() {
    try {
      var Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      var ctx = new Ctx();
      [880, 1100].forEach(function (freq, i) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        var t0 = ctx.currentTime + i * 0.18;
        gain.gain.setValueAtTime(0.0001, t0);
        gain.gain.exponentialRampToValueAtTime(0.1, t0 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 0.22);
      });
    } catch (e) {}
  }

  function notifyNewExpressCallbacks() {
    var pending = state.all.filter(function (m) {
      return isSiteExpressCallback(m) && m.direction === "inbound";
    });
    if (!pending.length) return;
    var seen = [];
    try {
      seen = JSON.parse(localStorage.getItem(LS_EXPRESS_SEEN) || "[]");
    } catch (e) {
      seen = [];
    }
    var fresh = pending.filter(function (m) {
      return seen.indexOf(m.id) < 0;
    });
    if (!fresh.length) return;
    var exPending = countPendingExpress();
    toast(
      fresh.length +
        " rappel(s) express — " +
        (exPending || fresh.length) +
        " a traiter. Onglet « Rappels express ».",
      "error"
    );
    playExpressAlert();
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification("Leads Opportunities — Rappel express", {
          body: fresh.length + " nouvelle(s) demande(s) de rappel a traiter",
          tag: "lo-express-callback",
        });
      } catch (e) {}
    }
    var allIds = pending.map(function (m) {
      return m.id;
    });
    localStorage.setItem(LS_EXPRESS_SEEN, JSON.stringify(allIds.slice(0, 200)));
  }

  function pickDefaultSelection() {
    if (state.view === "feed" || state.view === "express_callbacks") {
      var expressUrgent = state.threads.find(function (t) {
        return t.needsCallback && t.hasExpress;
      });
      if (expressUrgent) return selectThread(expressUrgent.key);
      var urgent = state.threads.find(function (t) {
        return t.needsReply && t.hasImap;
      });
      if (urgent) return selectThread(urgent.key);
      if (state.threads[0]) return selectThread(state.threads[0].key);
    }
    if (state.view === "received" && state.filtered[0]) return selectMessage(state.filtered[0].id);
    if (state.filtered[0]) return selectMessage(state.filtered[0].id);
    showDetailPane(false);
  }

  function ingestMessages(data, opts) {
    opts = opts || {};
    state.all = data.messages || [];
    state.stats = data.stats || null;
    state.imapConfigured = !!data.imapConfigured;
    state.mailboxAddress = data.mailboxAddress || state.mailboxAddress;
    state.tableMissing = false;
    applyFilters();
    renderStats();
    renderSetup(data);
    updateStatusBar();

    var siteN = (state.stats && state.stats.siteLeads) || 0;
    var qN = (state.stats && state.stats.questionnaires) || 0;
    var exN = (state.stats && state.stats.expressCallbacks) || countPendingExpress();
    var cN = (state.stats && state.stats.contactRequests) || 0;
    var sub = document.getElementById("mailboxSubtitle");
    if (sub) {
      sub.textContent =
        state.all.filter(isReceivedMail).length +
        " e-mails · " +
        exN +
        " rappel(s) express · " +
        qN +
        " questionnaire(s) · " +
        countNeedsReply() +
        " e-mail(s) a repondre";
    }

    if (exN > 0 && state.view === "received" && !sessionStorage.getItem("mbx_express_hint")) {
      sessionStorage.setItem("mbx_express_hint", "1");
      toast(exN + " rappel(s) express en attente — onglet dedie", "error");
    } else if ((qN > 0 || cN > 0) && state.view === "received" && !sessionStorage.getItem("mbx_site_hint")) {
      sessionStorage.setItem("mbx_site_hint", "1");
      toast(qN + " questionnaire(s) · " + cN + " contact(s) — voir onglets dedies", "success");
    }

    notifyNewExpressCallbacks();
    updateNavBadge();

    if (opts.openId && state.all.some(function (m) { return m.id === opts.openId; })) {
      selectMessage(opts.openId);
      return;
    }
    if (!opts.skipAutoSelect) pickDefaultSelection();
    else renderList();
  }

  async function loadMailbox(opts) {
    opts = opts || {};
    if (opts.openId) state.pendingOpenId = opts.openId;
    var list = document.getElementById("mailboxList");
    if (list) {
      list.innerHTML =
        '<div class="loading-state" style="padding:40px"><div class="spinner"></div>Chargement…</div>';
    }
    var data = await window.Dashboard.api("/api/dashboard/mailbox-list?limit=100");
    if (!data.ok) {
      if (list) list.innerHTML = "<p>" + esc(data.error) + "</p>";
      return;
    }
    if (data.sync && data.sync.ok) {
      localStorage.setItem(LS_SYNC, new Date().toISOString());
      localStorage.removeItem(LS_SYNC_ERR);
    } else if (data.sync && data.sync.error) {
      localStorage.setItem(LS_SYNC_ERR, data.sync.error);
    }
    ingestMessages(data, { openId: opts.openId, skipAutoSelect: !!opts.openId });
    updateWebmailLink(data);
  }

  function updateWebmailLink(data) {
    var btn = document.getElementById("mailboxWebmailBtn");
    var empty = document.getElementById("mailboxWebmailEmptyLink");
    if (!data) return;
    if (btn) {
      if (data.webmailUrl) btn.href = data.webmailUrl;
      if (data.webmailLabel) btn.textContent = data.webmailLabel + " ↗";
      if (data.mailboxAddress) btn.title = "Roundcube o2switch — " + data.mailboxAddress;
    }
    if (empty && data.webmailUrl) empty.href = data.webmailUrl;
  }

  async function syncMailbox(silent) {
    var btn = document.getElementById("mailboxSyncBtn");
    if (btn && !silent) {
      btn.disabled = true;
      btn.textContent = "Sync…";
    }
    var data = await window.Dashboard.api("/api/dashboard/mailbox-sync", { method: "POST" });
    if (btn && !silent) {
      btn.disabled = false;
      btn.textContent = "Synchroniser IMAP";
    }
    if (!data.ok) {
      toast(data.error || "Erreur", "error");
      return;
    }
    if (data.sync && data.sync.ok) {
      localStorage.removeItem(LS_SYNC_ERR);
      localStorage.setItem(LS_SYNC, new Date().toISOString());
      toast("Sync OK — " + (data.sync.imported || 0) + " e-mail(s)");
    } else if (data.sync && data.sync.error) {
      localStorage.setItem(LS_SYNC_ERR, data.sync.error);
      toast(data.sync.error, "error");
    }
    if (data.messages) ingestMessages(data);
    else loadMailbox({});
  }

  function bindUi() {
    document.getElementById("mailboxSearch").addEventListener("input", function (e) {
      state.search = e.target.value;
      applyFilters();
      renderList();
    });

    document.querySelectorAll(".mbx-view-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setView(btn.getAttribute("data-view"));
        pickDefaultSelection();
      });
    });

    document.querySelectorAll(".mbx-stat[data-view]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setView(btn.getAttribute("data-view"));
        pickDefaultSelection();
      });
    });

    document.getElementById("mailboxSortBtn").addEventListener("click", function () {
      state.sortDesc = !state.sortDesc;
      this.textContent = state.sortDesc ? "Plus recent" : "Plus ancien";
      applyFilters();
      renderList();
    });

    document.getElementById("mailboxTemplate").addEventListener("change", function (e) {
      var key = e.target.value;
      if (!key || !TEMPLATES[key]) return;
      var ta = document.getElementById("mailboxReplyBody");
      if (PAYMENT_TEMPLATE_KIND[key]) {
        var kindEl = document.getElementById("mailboxStripeKind");
        if (kindEl) {
          kindEl.value = PAYMENT_TEMPLATE_KIND[key];
          kindEl.dataset.userChanged = "";
          syncStripeIntervalVisibility();
          syncStripeLabelFromKind();
        }
        var panel = document.getElementById("mailboxStripePanel");
        if (panel) panel.open = true;
        applyPaymentTemplateOnly(true);
      } else if (!ta.value.trim()) ta.value = TEMPLATES[key];
      else if (confirm("Remplacer le brouillon ?")) ta.value = TEMPLATES[key];
      e.target.value = "";
    });

    document.getElementById("mailboxComposeBtn").addEventListener("click", function () {
      state.selectedThreadKey = null;
      state.selectedId = "__compose__";
      showDetailPane(true);
      document.getElementById("mailboxDetailHead").innerHTML = "<h2>Nouveau message</h2>";
      document.getElementById("mailboxDetailBody").innerHTML = "";
      document.getElementById("mailboxReplyToId").value = "";
      document.getElementById("mailboxReplyTo").value = "";
      document.getElementById("mailboxReplySubject").value = "";
      document.getElementById("mailboxReplyBody").value = "";
    });

    document.getElementById("mailboxBackBtn").addEventListener("click", function () {
      document.getElementById("mailboxPaneList").classList.remove("mbx-pane--hidden-mobile");
      document.getElementById("mailboxPaneDetail").classList.add("mbx-pane--hidden-mobile");
    });

    document.getElementById("mailboxReplyForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      var btn = document.getElementById("mailboxSendBtn");
      btn.disabled = true;
      var payload = {
        to: document.getElementById("mailboxReplyTo").value,
        subject: document.getElementById("mailboxReplySubject").value,
        body: document.getElementById("mailboxReplyBody").value,
        replyToId: document.getElementById("mailboxReplyToId").value || undefined,
      };
      var data = await window.Dashboard.api("/api/dashboard/mailbox-send", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      btn.disabled = false;
      if (!data.ok) {
        toast(data.error || "Echec", "error");
        return;
      }
      toast("Envoye");
      loadMailbox({});
    });

    document.getElementById("mailboxSyncBtn").addEventListener("click", function () {
      syncMailbox(false);
    });
    document.getElementById("mailboxRefreshBtn").addEventListener("click", function () {
      loadMailbox({});
    });

    var stripeKind = document.getElementById("mailboxStripeKind");
    var stripeLabel = document.getElementById("mailboxStripeLabel");
    if (stripeKind) {
      stripeKind.addEventListener("change", function () {
        stripeKind.dataset.userChanged = "1";
        syncStripeIntervalVisibility();
        syncStripeLabelFromKind();
      });
    }

    var stripeQuoteRef = document.getElementById("mailboxStripeQuoteRef");
    if (stripeQuoteRef) {
      stripeQuoteRef.addEventListener("change", lookupMailboxQuote);
      stripeQuoteRef.addEventListener("blur", lookupMailboxQuote);
    }

    var stripeTemplateBtn = document.getElementById("mailboxStripeTemplateBtn");
    if (stripeTemplateBtn) {
      stripeTemplateBtn.addEventListener("click", function () {
        applyPaymentTemplateOnly(true);
        toast("Modele applique");
      });
    }
    if (stripeLabel) {
      stripeLabel.addEventListener("input", function () {
        stripeLabel.dataset.autoKind = "";
      });
    }

    var stripeInsertBtn = document.getElementById("mailboxStripeInsertBtn");
    if (stripeInsertBtn) {
      stripeInsertBtn.addEventListener("click", async function () {
        var status = document.getElementById("mailboxStripeStatus");
        var email = (document.getElementById("mailboxReplyTo").value || "").trim();
        var amount = Number(document.getElementById("mailboxStripeAmount").value);
        var kind = document.getElementById("mailboxStripeKind").value;
        var label = (document.getElementById("mailboxStripeLabel").value || "").trim();
        var interval = document.getElementById("mailboxStripeInterval").value;
        var quoteRef = (document.getElementById("mailboxStripeQuoteRef").value || "").trim();
        var useTemplate = document.getElementById("mailboxStripeUseTemplate").checked;
        var bodyTa = document.getElementById("mailboxReplyBody");

        if (status) {
          status.textContent = "";
          status.className = "mbx-stripe-status";
        }
        if (quoteRef && quoteRef.indexOf("qte_") !== 0) {
          if (status) {
            status.textContent = "Reference devis invalide (format qte_…).";
            status.className = "mbx-stripe-status is-error";
          }
          return;
        }
        if (email && email.indexOf("@") === -1) {
          if (status) {
            status.textContent = "Email destinataire invalide — laissez vide pour un lien sans e-mail.";
            status.className = "mbx-stripe-status is-error";
          }
          return;
        }
        if ((!amount || amount <= 0) && !(quoteRef && kind === "acompte")) {
          if (status) {
            status.textContent = "Montant invalide.";
            status.className = "mbx-stripe-status is-error";
          }
          return;
        }

        stripeInsertBtn.disabled = true;
        if (status) status.textContent = "Generation du lien Stripe…";

        var payload = {
          paymentKind: kind,
          label: label || STRIPE_LABELS[kind] || "Paiement",
          interval: interval,
        };
        if (email) payload.customerEmail = email;
        if (amount > 0) payload.amountEur = amount;
        if (quoteRef) payload.referenceId = quoteRef;

        var data = await window.Dashboard.api("/api/stripe/create-mailbox-payment-link", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        stripeInsertBtn.disabled = false;
        if (!data.ok || !data.url) {
          if (status) {
            status.textContent = data.error || "Impossible de creer le lien.";
            status.className = "mbx-stripe-status is-error";
          }
          return;
        }

        if (useTemplate || !bodyTa.value.trim()) {
          bodyTa.value = buildPaymentEmailFromTemplate(data);
        } else if (
          bodyTa.value.indexOf("[LIEN DE PAIEMENT STRIPE") !== -1 ||
          bodyTa.value.indexOf("{{LINK_BLOCK}}") !== -1
        ) {
          bodyTa.value = bodyTa.value
            .replace("[LIEN DE PAIEMENT STRIPE — cliquez sur « Generer et inserer le lien »]", buildStripeLinkBlock(data))
            .replace("{{LINK_BLOCK}}", buildStripeLinkBlock(data))
            .replace(/\{\{QUOTE_REF\}\}/g, data.referenceId ? " " + data.referenceId : "");
        } else {
          insertTextAtCursor(bodyTa, buildStripeMailSnippet(data));
        }
        if (status) {
          status.textContent = useTemplate ? "Modele et lien inseres." : "Lien insere dans le message.";
          status.className = "mbx-stripe-status is-ok";
        }
        syncMailboxReplyPreview();
        var lastWrap = document.getElementById("mailboxStripeLastLink");
        var lastA = document.getElementById("mailboxStripeLastLinkUrl");
        if (lastWrap && lastA && data.url) {
          lastA.href = data.url;
          lastA.textContent = data.url;
          lastWrap.hidden = false;
        }
        if (window.DashboardPayments && window.DashboardPayments.trackLink) {
          window.DashboardPayments.trackLink({
            sessionId: data.sessionId,
            paymentLinkId: data.paymentLinkId,
            url: data.url,
          });
        }
        toast("Lien Stripe pret — suivi paiement actif");
      });
    }

    var replyBody = document.getElementById("mailboxReplyBody");
    if (replyBody) {
      replyBody.addEventListener("input", syncMailboxReplyPreview);
    }

    var discardBtn = document.getElementById("mailboxDiscardBtn");
    if (discardBtn) {
      discardBtn.addEventListener("click", function () {
        document.getElementById("mailboxReplyBody").value = "";
        syncMailboxReplyPreview();
        var st = document.getElementById("mailboxStripeStatus");
        if (st) {
          st.textContent = "";
          st.className = "mbx-stripe-status";
        }
      });
    }

    syncStripeIntervalVisibility();
    syncStripeLabelFromKind();
    var initView = "feed";
    try {
      var p = new URLSearchParams(window.location.search);
      var v = p.get("view") || p.get("mbx");
      if (
        v &&
        [
          "feed",
          "received",
          "express_callbacks",
          "questionnaires",
          "contact_requests",
          "sent",
        ].indexOf(v) >= 0
      ) {
        initView = v;
      }
    } catch (e) {}
    setView(initView);
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(function () {});
    }
  }

  window.loadMailbox = loadMailbox;
  window.setMailboxView = setView;
  document.addEventListener("DOMContentLoaded", bindUi);
})();
