/**
 * Messagerie — e-mails recus en avant + fil Q&R par conversation
 */
(function () {
  var LS_SYNC = "mbx_last_imap_sync";
  var LS_SYNC_ERR = "mbx_last_imap_error";
  var LS_SETUP_HIDE = "mbx_setup_hidden";

  var TEMPLATES = {
    merci:
      "Bonjour,\n\nMerci pour votre message. Nous revenons vers vous tres rapidement.\n\nBien cordialement,\nLeads Opportunities",
    rdv:
      "Bonjour,\n\nJe suis disponible pour un echange telephonique. Quelles sont vos disponibilites ?\n\nBien cordialement,\nLeads Opportunities",
    devis:
      "Bonjour,\n\nVotre demande est en cours d'analyse. Nous vous repondrons sous 24 a 48 h ouvrees.\n\nBien cordialement,\nLeads Opportunities",
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
    threads: [],
    view: "received",
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
    try {
      var o = JSON.parse(text);
      return typeof o === "object" && o ? o : null;
    } catch (e) {
      return null;
    }
  }

  function leadIdFromMessage(m) {
    if (!m || String(m.id || "").indexOf("lead_") !== 0) return null;
    return String(m.id).slice(5);
  }

  function messagePreview(m) {
    var t = (m.body_text || "").replace(/\s+/g, " ").trim();
    if (t.charAt(0) === "{") {
      var p = parseLeadPayload(m.body_text);
      if (p) {
        return (
          [p.vertical, p.city, p.phone, p.message || p.comment].filter(Boolean).join(" · ") ||
          "Demande formulaire"
        );
      }
      return "Demande formulaire";
    }
    if (!t && m.body_html) {
      t = String(m.body_html)
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
    return t.slice(0, 140);
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
      var subjIn = t.messages
        .slice()
        .reverse()
        .find(function (m) {
          return m.subject && m.direction === "inbound";
        });
      t.subject = (subjIn && subjIn.subject) || last.subject || "(sans objet)";
      t.preview = messagePreview(last);
      t.priority =
        (t.needsReply && t.hasImap ? 0 : t.needsReply ? 1 : t.hasImap ? 2 : t.hasSite ? 3 : 4);
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
    state.view = view || "received";
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
        feed: "Conversations question → reponse",
        site: "Leads formulaire uniquement",
        sent: "Vos reponses envoyees",
      };
      hint.textContent = hints[state.view] || "";
    }
    applyFilters();
    renderList();
  }

  function countNeedsReply() {
    return buildThreads(state.all).filter(function (t) {
      return t.needsReply && t.hasImap;
    }).length;
  }

  function updateNavBadge() {
    var badge = document.getElementById("mailboxNavBadge");
    if (!badge) return;
    var n = countNeedsReply();
    if (n > 0) {
      badge.hidden = false;
      badge.textContent = n > 99 ? "99+" : String(n);
    } else {
      badge.hidden = true;
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
    el("mbxStatSite", s.siteLeads);
    el("mbxStatOut", s.outbound);
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
    hint.textContent =
      state.all.filter(isReceivedMail).length +
      " e-mail(s) recu(s)" +
      (n ? " · " + n + " a repondre" : "") +
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
    if (t.needsReply && t.hasImap) cls += " mbx-thread-card--reply";
    else if (t.hasImap) cls += " mbx-thread-card--mail";
    var tags =
      (t.needsReply && t.hasImap ? '<span class="mbx-pill mbx-pill--reply">A repondre</span>' : "") +
      (t.hasImap ? '<span class="mbx-pill mbx-pill--mail">E-mail</span>' : "") +
      (t.hasSite ? '<span class="mbx-pill mbx-pill--site">Site</span>' : "") +
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
      list.innerHTML = '<div class="mbx-empty" style="padding:32px 16px"><p>Aucune conversation.</p></div>';
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

    function block(label, items) {
      if (!items.length) return "";
      var h = '<div class="mbx-list-section">' + esc(label) + "</div>";
      items.forEach(function (t) {
        h += renderThreadCard(t, state.selectedThreadKey === t.key);
      });
      return h;
    }

    if (state.view === "feed") {
      html += block("A repondre — e-mail recu", urgent);
      html += block("Conversations e-mail", mail);
      html += block("Demandes site", siteOnly);
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
        list.innerHTML =
          '<div class="mbx-empty" style="padding:32px"><p>Aucun e-mail recu. Synchronisez IMAP.</p></div>';
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
    else if (state.view === "site" || state.view === "sent") {
      if (state.view === "site" || state.view === "sent") {
        var list = document.getElementById("mailboxList");
        if (!state.filtered.length) {
          list.innerHTML = '<div class="mbx-empty" style="padding:32px"><p>Rien ici.</p></div>';
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

  function renderLeadBubble(m, payload) {
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
    return (
      '<div class="mbx-qa-bubble mbx-qa-bubble--site">' +
      '<div class="mbx-qa-bubble__label">Demande site</div>' +
      '<div class="mbx-qa-bubble__body">' +
      rows +
      (msg ? "<br><br>" + esc(msg) : "") +
      "</div>" +
      '<div class="mbx-qa-bubble__meta">' +
      fmtDateLong(m.created_at) +
      "</div></div>"
    );
  }

  function renderQaFeed(messages) {
    var html = '<div class="mbx-qa-feed">';
    messages.forEach(function (m) {
      var payload = parseLeadPayload(m.body_text);
      if (messageKind(m) === "site" && payload) {
        html += renderLeadBubble(m, payload);
        return;
      }
      var isOut = m.direction === "outbound";
      var label = isOut ? "Votre reponse" : "Message recu";
      var text = messagePreview(m);
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
        esc(text) +
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

  function buildStripeMailSnippet(data) {
    var recurring =
      data.interval && INTERVAL_LABELS[data.interval]
        ? " / " + INTERVAL_LABELS[data.interval]
        : data.interval
          ? " / " + data.interval
          : "";
    var lines = [
      "",
      "Pour regler en ligne de maniere securisee :",
      data.url,
      "Montant : " + formatEur(data.amountEur) + recurring,
    ];
    if (data.label) lines.push("Libelle : " + data.label);
    lines.push("");
    return lines.join("\n");
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
      '<div class="mbx-detail-actions" style="margin-top:10px">' +
      (leadId
        ? '<a class="btn-ghost" href="./dashboard.html?section=leads&lead=' +
          encodeURIComponent(leadId) +
          '">Fiche lead</a>'
        : "") +
      "</div>";

    if (state.view === "feed" || state.view === "received") {
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
      var payload = parseLeadPayload(m.body_text);
      if (payload && kind === "site") {
        document.getElementById("mailboxDetailBody").innerHTML = renderQaFeed([m]);
      } else {
        document.getElementById("mailboxDetailBody").innerHTML = renderQaFeed([m]);
      }
    }

    if (!opts.keepDraft) document.getElementById("mailboxReplyBody").value = "";
    setupReplyForMessage(m);
    renderList();
  }

  function pickDefaultSelection() {
    if (state.view === "feed") {
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

    var sub = document.getElementById("mailboxSubtitle");
    if (sub) {
      sub.textContent =
        state.all.filter(isReceivedMail).length +
        " recus · " +
        countNeedsReply() +
        " a repondre · fil Q&R";
    }

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
      if (!ta.value.trim()) ta.value = TEMPLATES[key];
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
        syncStripeIntervalVisibility();
        syncStripeLabelFromKind();
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

        if (status) {
          status.textContent = "";
          status.className = "mbx-stripe-status";
        }
        if (!email || email.indexOf("@") === -1) {
          if (status) {
            status.textContent = "Renseignez d'abord le destinataire.";
            status.className = "mbx-stripe-status is-error";
          }
          return;
        }
        if (!amount || amount <= 0) {
          if (status) {
            status.textContent = "Montant invalide.";
            status.className = "mbx-stripe-status is-error";
          }
          return;
        }

        stripeInsertBtn.disabled = true;
        if (status) status.textContent = "Generation du lien Stripe…";

        var data = await window.Dashboard.api("/api/stripe/create-mailbox-payment-link", {
          method: "POST",
          body: JSON.stringify({
            customerEmail: email,
            amountEur: amount,
            paymentKind: kind,
            label: label || STRIPE_LABELS[kind] || "Paiement",
            interval: interval,
          }),
        });

        stripeInsertBtn.disabled = false;
        if (!data.ok || !data.url) {
          if (status) {
            status.textContent = data.error || "Impossible de creer le lien.";
            status.className = "mbx-stripe-status is-error";
          }
          return;
        }

        insertTextAtCursor(
          document.getElementById("mailboxReplyBody"),
          buildStripeMailSnippet(data)
        );
        if (status) {
          status.textContent = "Lien insere dans le message.";
          status.className = "mbx-stripe-status is-ok";
        }
        toast("Lien Stripe insere");
      });
    }

    var discardBtn = document.getElementById("mailboxDiscardBtn");
    if (discardBtn) {
      discardBtn.addEventListener("click", function () {
        document.getElementById("mailboxReplyBody").value = "";
        var st = document.getElementById("mailboxStripeStatus");
        if (st) {
          st.textContent = "";
          st.className = "mbx-stripe-status";
        }
      });
    }

    syncStripeIntervalVisibility();
    syncStripeLabelFromKind();
    setView("received");
  }

  window.loadMailbox = loadMailbox;
  document.addEventListener("DOMContentLoaded", bindUi);
})();
