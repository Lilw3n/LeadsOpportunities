/**
 * Messagerie dashboard — inbox, filtres, sync IMAP, modeles, raccourcis
 */
(function () {
  var LS_SYNC = "mbx_last_imap_sync";
  var LS_SETUP_HIDE = "mbx_setup_hidden";
  var SYNC_INTERVAL_MS = 10 * 60 * 1000;

  var TEMPLATES = {
    merci:
      "Bonjour,\n\nMerci pour votre message et votre confiance. Nous avons bien recu votre demande et un conseiller vous recontactera tres prochainement.\n\nBien cordialement,\nLeads Opportunities",
    rdv:
      "Bonjour,\n\nSuite a votre demande, je suis disponible pour un echange telephonique. Indiquez-nous vos disponibilites (matin / apres-midi) et nous vous rappellerons.\n\nBien cordialement,\nLeads Opportunities",
    devis:
      "Bonjour,\n\nVotre demande de devis est en cours d'analyse par nos equipes. Nous reviendrons vers vous sous 24 a 48 h ouvrées avec une proposition adaptee.\n\nBien cordialement,\nLeads Opportunities",
  };

  var state = {
    all: [],
    filtered: [],
    selectedId: null,
    filter: "all",
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

  function kindLabel(kind) {
    if (kind === "site") return "Site";
    if (kind === "imap") return "E-mail";
    if (kind === "outbound") return "Envoye";
    return "Recu";
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
      var sameDay =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();
      if (sameDay) {
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
        year: "numeric",
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

  function sortMessages(list) {
    return list.slice().sort(function (a, b) {
      var ta = new Date(a.created_at).getTime() || 0;
      var tb = new Date(b.created_at).getTime() || 0;
      return state.sortDesc ? tb - ta : ta - tb;
    });
  }

  function applyFilters() {
    var q = state.search.toLowerCase().trim();
    var list = state.all.filter(function (m) {
      var kind = messageKind(m);
      if (state.filter === "site" && kind !== "site") return false;
      if (state.filter === "imap" && kind !== "imap") return false;
      if (state.filter === "inbound" && m.direction !== "inbound") return false;
      if (state.filter === "outbound" && m.direction !== "outbound") return false;
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
    state.filtered = sortMessages(list);
  }

  function setFilter(f) {
    state.filter = f || "all";
    document.querySelectorAll(".mbx-filter").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-filter") === state.filter);
    });
    document.querySelectorAll(".mbx-stat[data-stat-filter]").forEach(function (b) {
      b.classList.toggle("is-active-stat", b.getAttribute("data-stat-filter") === state.filter);
    });
    applyFilters();
    renderList();
  }

  function updateNavBadge() {
    var badge = document.getElementById("mailboxNavBadge");
    if (!badge) return;
    var n = (state.stats && state.stats.siteLast7d) || 0;
    if (n > 0) {
      badge.hidden = false;
      badge.textContent = n > 99 ? "99+" : String(n);
    } else {
      badge.hidden = true;
    }
  }

  function updateStatusBar() {
    var el = document.getElementById("mailboxLastUpdate");
    if (el) el.innerHTML = "<strong>Messagerie</strong> — maj. " + fmtDateLong(new Date().toISOString());

    var hint = document.getElementById("mailboxSyncHint");
    if (!hint) return;
    if (!state.imapConfigured) {
      hint.textContent = "IMAP inactif";
      return;
    }
    var last = localStorage.getItem(LS_SYNC);
    if (last) {
      hint.textContent = "Derniere sync IMAP : " + fmtDate(last);
    } else {
      hint.textContent = "Sync IMAP : jamais";
    }
  }

  function renderStats() {
    var s = state.stats || {};
    var el = function (id, v) {
      var n = document.getElementById(id);
      if (n) n.textContent = v != null ? String(v) : "0";
    };
    el("mbxStatTotal", s.total != null ? s.total : state.all.length);
    el("mbxStatSite", s.siteLeads);
    el("mbxStatImap", s.imapMessages);
    el("mbxStatOut", s.outbound);
    var w = document.getElementById("mbxStatSite7d");
    if (w) w.textContent = s.siteLast7d ? "(" + s.siteLast7d + " / 7 j)" : "";
    updateNavBadge();
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
      box.innerHTML =
        "<strong>Table messagerie</strong> — sera creee automatiquement au chargement. Si l'erreur persiste, verifiez <code>DATABASE_URL</code> sur Vercel.";
      return;
    }

    var imapOk = meta && meta.imapConfigured;
    box.className = "mbx-setup " + (imapOk ? "mbx-setup--ok" : "");
    box.innerHTML =
      (imapOk
        ? "<strong>IMAP OK</strong> — sync auto toutes les 10 min."
        : "<strong>IMAP</strong> — ajoutez MAIL_IMAP_USER + MAIL_IMAP_PASS sur Vercel.") +
      ' <button type="button" class="btn-ghost" id="mailboxHideSetup" style="margin-left:8px;font-size:0.75rem">Masquer</button>';
    var hide = document.getElementById("mailboxHideSetup");
    if (hide) {
      hide.addEventListener("click", function () {
        localStorage.setItem(LS_SETUP_HIDE, "1");
        box.hidden = true;
      });
    }
  }

  function renderList() {
    var list = document.getElementById("mailboxList");
    if (!list) return;

    if (state.tableMissing) {
      list.innerHTML = '<div class="mbx-empty" style="padding:24px"><p>Erreur base de donnees.</p></div>';
      return;
    }

    if (!state.filtered.length) {
      list.innerHTML =
        '<div class="mbx-empty" style="padding:32px 16px"><p>Aucun message.</p></div>';
      return;
    }

    list.innerHTML = state.filtered
      .map(function (m, idx) {
        var kind = messageKind(m);
        var active = m.id === state.selectedId ? " is-active" : "";
        var preview = (m.body_text || "").replace(/\s+/g, " ").trim().slice(0, 100);
        if (preview.charAt(0) === "{") preview = "Demande formulaire";
        var from =
          m.direction === "outbound"
            ? "Vers " + extractEmail(m.to_addr)
            : extractEmail(m.from_addr);
        return (
          '<button type="button" class="mbx-item' +
          active +
          '" data-id="' +
          esc(m.id) +
          '" data-idx="' +
          idx +
          '">' +
          '<span class="mbx-item__avatar mbx-item__avatar--' +
          (kind === "site" ? "site" : kind === "outbound" ? "out" : "imap") +
          '">' +
          esc(initials(m.direction === "outbound" ? m.to_addr : m.from_addr)) +
          "</span>" +
          '<span class="mbx-item__main">' +
          '<span class="mbx-item__row"><span class="mbx-item__subject">' +
          esc(m.subject || "(sans objet)") +
          '</span><span class="mbx-item__time">' +
          fmtDate(m.created_at) +
          "</span></span>" +
          '<span class="mbx-item__from">' +
          esc(from) +
          "</span>" +
          '<span class="mbx-item__preview">' +
          esc(preview) +
          "</span></span>" +
          '<span class="mbx-badge mbx-badge--' +
          (kind === "site" ? "site" : kind === "outbound" ? "out" : "imap") +
          '">' +
          kindLabel(kind) +
          "</span></button>"
        );
      })
      .join("");

    list.querySelectorAll(".mbx-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectMessage(btn.getAttribute("data-id"));
      });
    });
  }

  function threadMessages(m) {
    if (!m || !m.thread_key) return [];
    var key = String(m.thread_key).toLowerCase();
    return state.all
      .filter(function (x) {
        return x.id !== m.id && String(x.thread_key || "").toLowerCase() === key;
      })
      .slice(0, 8);
  }

  function renderLeadBody(m, payload) {
    var fields = [
      ["Nom", payload.fullName || payload.name || payload.firstName],
      ["Email", payload.email || extractEmail(m.from_addr)],
      ["Telephone", payload.phone],
      ["Vertical", payload.vertical],
      ["Source", payload.source],
      ["Score", payload.leadScore != null ? payload.leadScore + "/100" : null],
      ["Pertinence", payload.relevance],
      ["Ville", payload.city || payload.seo_city],
      ["Departement", payload.seo_department],
      ["Code postal", payload.postal_code],
      ["Besoin", payload.need || payload.product || payload.seo_product],
      ["UTM", payload.utm_source || payload.attr_last_utm_source],
      ["Page", payload.landing_slug || payload.landing_path],
    ];
    var rows = fields
      .filter(function (f) {
        return f[1];
      })
      .map(function (f) {
        return "<dt>" + esc(f[0]) + "</dt><dd>" + esc(String(f[1])) + "</dd>";
      })
      .join("");
    var extra = "";
    if (payload.message || payload.comment || payload.notes) {
      extra =
        '<p style="margin:12px 0 0"><strong>Message :</strong><br>' +
        esc(payload.message || payload.comment || payload.notes) +
        "</p>";
    }
    return (
      '<div class="mbx-lead-card"><p style="margin:0 0 8px;font-weight:700">Demande via le site</p><dl>' +
      rows +
      "</dl>" +
      extra +
      "</div>"
    );
  }

  function renderThreadBlock(m) {
    var related = threadMessages(m);
    if (!related.length) return "";
    var html =
      '<div class="mbx-thread"><h4>Meme fil (' +
      related.length +
      ")</h4>";
    related.forEach(function (t) {
      html +=
        '<div class="mbx-thread-item" data-id="' +
        esc(t.id) +
        '"><strong>' +
        esc(t.subject || "(sans objet)") +
        "</strong> — " +
        fmtDate(t.created_at) +
        "</div>";
    });
    return html + "</div>";
  }

  function renderDetailBody(m) {
    var payload = parseLeadPayload(m.body_text);
    if (payload && messageKind(m) === "site") {
      return renderLeadBody(m, payload) + renderThreadBlock(m);
    }
    var text = m.body_text || "";
    if (!text.trim() && m.body_html) {
      text = String(m.body_html)
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
    return '<pre class="mbx-body-text">' + esc(text || "(message vide)") + "</pre>" + renderThreadBlock(m);
  }

  function selectMessage(id, opts) {
    opts = opts || {};
    state.selectedId = id;
    var m = state.all.find(function (x) {
      return x.id === id;
    });

    var empty = document.getElementById("mailboxEmptyState");
    var view = document.getElementById("mailboxDetailView");
    if (!m) {
      if (empty) empty.hidden = false;
      if (view) view.hidden = true;
      renderList();
      return;
    }

    if (empty) empty.hidden = true;
    if (view) view.hidden = false;

    if (window.innerWidth <= 960) {
      document.getElementById("mailboxPaneList").classList.add("mbx-pane--hidden-mobile");
      document.getElementById("mailboxPaneDetail").classList.remove("mbx-pane--hidden-mobile");
    }

    var leadId = leadIdFromMessage(m);
    var kind = messageKind(m);
    var head = document.getElementById("mailboxDetailHead");

    if (head) {
      head.innerHTML =
        "<h2>" +
        esc(m.subject || "(sans objet)") +
        "</h2>" +
        '<dl class="mbx-meta-grid">' +
        "<dt>De</dt><dd>" +
        esc(m.from_addr || "—") +
        "</dd><dt>A</dt><dd>" +
        esc(m.to_addr || "—") +
        "</dd><dt>Date</dt><dd>" +
        fmtDateLong(m.created_at) +
        "</dd><dt>Type</dt><dd>" +
        kindLabel(kind) +
        "</dd></dl>" +
        '<div class="mbx-detail-actions">' +
        (leadId
          ? '<a class="btn-ghost" href="./dashboard.html?section=leads&lead=' +
            encodeURIComponent(leadId) +
            '">Fiche lead</a>'
          : "") +
        '<button type="button" class="btn-ghost" data-copy="' +
        esc(extractEmail(m.direction === "inbound" ? m.from_addr : m.to_addr)) +
        '">Copier e-mail</button>' +
        '<button type="button" class="btn-ghost" data-action="tel">' +
        (parseLeadPayload(m.body_text) && parseLeadPayload(m.body_text).phone
          ? "Tel. " + esc(parseLeadPayload(m.body_text).phone)
          : "Telephone") +
        "</button></div>";

      head.querySelector("[data-copy]").addEventListener("click", function () {
        var v = head.querySelector("[data-copy]").getAttribute("data-copy");
        if (navigator.clipboard && v) navigator.clipboard.writeText(v).then(function () { toast("Copie"); });
      });
      var telBtn = head.querySelector("[data-action=tel]");
      if (telBtn) {
        var pl = parseLeadPayload(m.body_text);
        if (pl && pl.phone) {
          telBtn.addEventListener("click", function () {
            window.location.href = "tel:" + String(pl.phone).replace(/\s/g, "");
          });
        } else {
          telBtn.disabled = true;
          telBtn.style.opacity = "0.5";
        }
      }
    }

    var body = document.getElementById("mailboxDetailBody");
    if (body) {
      body.innerHTML = renderDetailBody(m);
      body.querySelectorAll(".mbx-thread-item").forEach(function (el) {
        el.addEventListener("click", function () {
          selectMessage(el.getAttribute("data-id"));
        });
      });
    }

    var replyTo = m.direction === "inbound" ? extractEmail(m.from_addr) : extractEmail(m.to_addr);
    document.getElementById("mailboxReplyTo").value = replyTo;
    document.getElementById("mailboxReplySubject").value = /^re:/i.test(m.subject || "")
      ? m.subject
      : "Re: " + (m.subject || "");
    document.getElementById("mailboxReplyToId").value = m.id;
    if (!opts.keepDraft) document.getElementById("mailboxReplyBody").value = "";

    var summary = document.getElementById("mailboxReplySummary");
    if (summary) summary.textContent = "Repondre a " + replyTo;

    document.getElementById("mailboxReplyPanel").open = true;
    renderList();
  }

  function showListMobile() {
    document.getElementById("mailboxPaneList").classList.remove("mbx-pane--hidden-mobile");
    document.getElementById("mailboxPaneDetail").classList.add("mbx-pane--hidden-mobile");
  }

  function openCompose() {
    state.selectedId = "__compose__";
    document.getElementById("mailboxEmptyState").hidden = true;
    document.getElementById("mailboxDetailView").hidden = false;
    if (window.innerWidth <= 960) {
      document.getElementById("mailboxPaneList").classList.add("mbx-pane--hidden-mobile");
      document.getElementById("mailboxPaneDetail").classList.remove("mbx-pane--hidden-mobile");
    }
    document.getElementById("mailboxDetailHead").innerHTML =
      "<h2>Nouveau message</h2><p style='margin:0;color:var(--muted);font-size:0.88rem'>Envoi via " +
      esc(state.mailboxAddress) +
      "</p>";
    document.getElementById("mailboxDetailBody").innerHTML =
      '<p class="mbx-body-text" style="color:var(--muted)">Composer un e-mail sortant.</p>';
    document.getElementById("mailboxReplyToId").value = "";
    document.getElementById("mailboxReplyTo").value = "";
    document.getElementById("mailboxReplySubject").value = "";
    document.getElementById("mailboxReplyBody").value = "";
    document.getElementById("mailboxReplyPanel").open = true;
    document.getElementById("mailboxReplyBody").focus();
    renderList();
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
    renderList();
    updateStatusBar();

    var sub = document.getElementById("mailboxSubtitle");
    if (sub) {
      sub.textContent =
        (state.stats && state.stats.total) +
        " messages · " +
        (state.imapConfigured ? "IMAP actif" : "IMAP off") +
        " · " +
        state.mailboxAddress;
    }

    var openId = opts.openId || state.pendingOpenId;
    if (openId && state.all.some(function (m) { return m.id === openId; })) {
      selectMessage(openId);
      state.pendingOpenId = null;
    } else if (state.selectedId && state.selectedId !== "__compose__") {
      if (state.all.some(function (m) { return m.id === state.selectedId; })) {
        selectMessage(state.selectedId, { keepDraft: true });
      } else {
        state.selectedId = null;
        if (state.filtered.length) selectMessage(state.filtered[0].id);
      }
    } else if (!state.selectedId && state.filtered.length && !opts.skipAutoSelect) {
      selectMessage(state.filtered[0].id);
    }
  }

  function shouldAutoSync() {
    if (!state.imapConfigured) return false;
    var last = Number(localStorage.getItem(LS_SYNC) || 0);
    return !last || Date.now() - last > SYNC_INTERVAL_MS;
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

    if (data.code === "MAILBOX_TABLE_MISSING" || (data.status === 503 && !data.ok)) {
      state.tableMissing = true;
      state.all = [];
      state.filtered = [];
      renderSetup({});
      renderStats();
      renderList();
      return;
    }

    if (!data.ok) {
      if (list) list.innerHTML = '<div class="mbx-empty"><p>' + esc(data.error) + "</p></div>";
      toast(data.error || "Erreur", "error");
      return;
    }

    ingestMessages(data, { openId: opts.openId, skipAutoSelect: !!opts.openId });

    if (opts.autoSync && shouldAutoSync()) {
      await syncMailbox(true);
    }
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
      if (!silent) toast(data.error || "Erreur sync", "error");
      return;
    }
    if (data.sync && data.sync.ok) {
      localStorage.setItem(LS_SYNC, new Date().toISOString());
      if (!silent) toast("Sync OK — " + (data.sync.imported || 0) + " e-mail(s)");
    } else if (data.sync && data.sync.skipped && !silent) {
      toast(data.sync.error || "IMAP non configure", "error");
    } else if (data.sync && data.sync.error && !silent) {
      toast(data.sync.error, "error");
    }
    if (data.messages) ingestMessages(data, { skipAutoSelect: true });
    else if (!silent) loadMailbox({ skipAutoSelect: true });
    updateStatusBar();
  }

  function navigateList(delta) {
    if (!state.filtered.length) return;
    var idx = state.filtered.findIndex(function (m) {
      return m.id === state.selectedId;
    });
    if (idx < 0) idx = 0;
    idx = Math.max(0, Math.min(state.filtered.length - 1, idx + delta));
    selectMessage(state.filtered[idx].id);
  }

  function bindUi() {
    document.getElementById("mailboxSearch").addEventListener("input", function (e) {
      state.search = e.target.value;
      applyFilters();
      renderList();
    });

    document.querySelectorAll(".mbx-filter").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setFilter(btn.getAttribute("data-filter"));
      });
    });

    document.querySelectorAll(".mbx-stat[data-stat-filter]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setFilter(btn.getAttribute("data-stat-filter"));
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
      else if (confirm("Remplacer le texte actuel par le modele ?")) ta.value = TEMPLATES[key];
      e.target.value = "";
    });

    document.getElementById("mailboxComposeBtn").addEventListener("click", openCompose);
    document.getElementById("mailboxBackBtn").addEventListener("click", showListMobile);
    document.getElementById("mailboxDiscardBtn").addEventListener("click", function () {
      document.getElementById("mailboxReplyBody").value = "";
      toast("Brouillon efface");
    });

    document.getElementById("mailboxReplyForm").addEventListener("submit", async function (e) {
      e.preventDefault();
      var btn = document.getElementById("mailboxSendBtn");
      btn.disabled = true;
      btn.textContent = "Envoi…";
      var replyId = document.getElementById("mailboxReplyToId").value;
      var payload = {
        to: document.getElementById("mailboxReplyTo").value,
        subject: document.getElementById("mailboxReplySubject").value,
        body: document.getElementById("mailboxReplyBody").value,
      };
      if (replyId) payload.replyToId = replyId;
      var data = await window.Dashboard.api("/api/dashboard/mailbox-send", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      btn.disabled = false;
      btn.textContent = "Envoyer";
      if (!data.ok) {
        toast(data.error || "Echec envoi", "error");
        return;
      }
      toast("E-mail envoye");
      loadMailbox({ autoSync: false });
    });

    document.getElementById("mailboxSyncBtn").addEventListener("click", function () {
      syncMailbox(false);
    });
    document.getElementById("mailboxRefreshBtn").addEventListener("click", function () {
      loadMailbox({ autoSync: false });
    });

    document.addEventListener("keydown", function (e) {
      var sec = document.getElementById("sec-mailbox");
      if (!sec || !sec.classList.contains("active")) return;
      var tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        if (e.key === "Escape") e.target.blur();
        return;
      }
      if (e.key === "j" || e.key === "ArrowDown") {
        e.preventDefault();
        navigateList(1);
      }
      if (e.key === "k" || e.key === "ArrowUp") {
        e.preventDefault();
        navigateList(-1);
      }
      if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        document.getElementById("mailboxReplyBody").focus();
      }
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        openCompose();
      }
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        document.getElementById("mailboxSortBtn").click();
      }
    });
  }

  window.loadMailbox = loadMailbox;

  document.addEventListener("DOMContentLoaded", bindUi);
})();
