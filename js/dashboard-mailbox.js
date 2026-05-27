/**
 * Messagerie dashboard — inbox, filtres, leads site, IMAP, reponses Resend
 */
(function () {
  var state = {
    all: [],
    filtered: [],
    selectedId: null,
    filter: "all",
    search: "",
    imapConfigured: false,
    mailboxAddress: "contact@leadsopportunities.fr",
    tableMissing: false,
    stats: null,
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

  function applyFilters() {
    var q = state.search.toLowerCase().trim();
    state.filtered = state.all.filter(function (m) {
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
  }

  function renderSetup(meta) {
    var box = document.getElementById("mailboxSetup");
    if (!box) return;
    box.hidden = false;

    if (state.tableMissing) {
      box.className = "mbx-setup mbx-setup--err";
      box.innerHTML =
        "<strong>Base Neon : table messagerie manquante</strong>" +
        "<p>Executez une fois le fichier <code>database/mailbox.sql</code> dans le SQL Editor Neon (projet LeadsOpportunities). " +
        "C'est sans risque : <code>CREATE TABLE IF NOT EXISTS</code> — vous pouvez le relancer.</p>" +
        "<ul><li>Neon → SQL Editor → coller le contenu de mailbox.sql → Run</li>" +
        "<li>Puis Actualiser cette page</li></ul>";
      return;
    }

    var imapOk = meta && meta.imapConfigured;
    var lines = [];
    lines.push(
      imapOk
        ? "<strong>IMAP configure</strong> — synchronisez pour importer les e-mails de <code>" +
            esc(meta.mailboxAddress || state.mailboxAddress) +
            "</code>."
        : "<strong>IMAP non configure sur Vercel</strong> — ajoutez <code>MAIL_IMAP_USER</code> et <code>MAIL_IMAP_PASS</code>. Les demandes formulaire restent visibles (filtre Site)."
    );
    lines.push(
      "Notifications formulaire : Gmail + contact@ si <code>LEAD_NOTIFICATION_EMAIL</code> ou <code>LEAD_NOTIFY_INCLUDE_MAILBOX=true</code>."
    );

    box.className = "mbx-setup " + (imapOk ? "mbx-setup--ok" : "");
    box.innerHTML = lines.join("<br>");
  }

  function renderList() {
    var list = document.getElementById("mailboxList");
    if (!list) return;

    if (state.tableMissing) {
      list.innerHTML =
        '<div class="mbx-empty" style="padding:24px"><p>Configurez Neon puis actualisez.</p></div>';
      return;
    }

    if (!state.filtered.length) {
      list.innerHTML =
        '<div class="mbx-empty" style="padding:32px 16px">' +
        "<p>Aucun message pour ce filtre.</p>" +
        (state.filter === "imap" && !state.imapConfigured
          ? "<p style='font-size:0.8rem'>Configurez IMAP puis « Synchroniser ».</p>"
          : "") +
        "</div>";
      return;
    }

    list.innerHTML = state.filtered
      .map(function (m) {
        var kind = messageKind(m);
        var active = m.id === state.selectedId ? " is-active" : "";
        var preview = (m.body_text || "").replace(/\s+/g, " ").trim().slice(0, 100);
        if (preview.charAt(0) === "{") preview = "Demande formulaire (donnees structurees)";
        var from =
          m.direction === "outbound"
            ? "Vers " + extractEmail(m.to_addr)
            : extractEmail(m.from_addr);
        return (
          '<button type="button" class="mbx-item' +
          active +
          '" data-id="' +
          esc(m.id) +
          '">' +
          '<span class="mbx-item__avatar mbx-item__avatar--' +
          (kind === "site" ? "site" : kind === "outbound" ? "out" : "imap") +
          '">' +
          esc(initials(m.direction === "outbound" ? m.to_addr : m.from_addr)) +
          "</span>" +
          '<span class="mbx-item__main">' +
          '<span class="mbx-item__row">' +
          '<span class="mbx-item__subject">' +
          esc(m.subject || "(sans objet)") +
          "</span>" +
          '<span class="mbx-item__time">' +
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

  function renderLeadBody(m, payload) {
    var fields = [
      ["Email", payload.email || extractEmail(m.from_addr)],
      ["Telephone", payload.phone],
      ["Vertical", payload.vertical],
      ["Source", payload.source],
      ["Score", payload.leadScore != null ? payload.leadScore + "/100" : null],
      ["Ville", payload.city || payload.seo_city],
      ["Code postal", payload.postal_code],
      ["Besoin", payload.need || payload.product],
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
    if (payload.message || payload.comment) {
      extra =
        '<p style="margin:12px 0 0"><strong>Message :</strong><br>' +
        esc(payload.message || payload.comment) +
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

  function renderDetailBody(m) {
    var payload = parseLeadPayload(m.body_text);
    if (payload && messageKind(m) === "site") {
      return renderLeadBody(m, payload);
    }
    var text = m.body_text || "";
    if (!text.trim() && m.body_html) {
      text = String(m.body_html)
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    }
    return '<pre class="mbx-body-text">' + esc(text || "(message vide)") + "</pre>";
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
      var paneList = document.getElementById("mailboxPaneList");
      var paneDetail = document.getElementById("mailboxPaneDetail");
      if (paneList) paneList.classList.add("mbx-pane--hidden-mobile");
      if (paneDetail) paneDetail.classList.remove("mbx-pane--hidden-mobile");
    }

    var head = document.getElementById("mailboxDetailHead");
    var body = document.getElementById("mailboxDetailBody");
    var kind = messageKind(m);
    var leadId = leadIdFromMessage(m);

    if (head) {
      var actions =
        '<div class="mbx-detail-actions">' +
        (leadId
          ? '<a class="btn-ghost" href="./dashboard.html?section=leads">Voir dans Leads</a>'
          : "") +
        '<button type="button" class="btn-ghost" data-copy="' +
        esc(extractEmail(m.direction === "inbound" ? m.from_addr : m.to_addr)) +
        '">Copier e-mail</button>' +
        (kind === "site"
          ? '<span class="mbx-badge mbx-badge--site">Formulaire site</span>'
          : "") +
        "</div>";

      head.innerHTML =
        "<h2>" +
        esc(m.subject || "(sans objet)") +
        "</h2>" +
        '<dl class="mbx-meta-grid">' +
        "<dt>De</dt><dd>" +
        esc(m.from_addr || "—") +
        "</dd>" +
        "<dt>A</dt><dd>" +
        esc(m.to_addr || "—") +
        "</dd>" +
        "<dt>Date</dt><dd>" +
        fmtDateLong(m.created_at) +
        "</dd>" +
        "<dt>Type</dt><dd>" +
        kindLabel(kind) +
        "</dd></dl>" +
        actions;

      head.querySelectorAll("[data-copy]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var v = btn.getAttribute("data-copy");
          if (navigator.clipboard && v) {
            navigator.clipboard.writeText(v).then(function () {
              toast("E-mail copie");
            });
          }
        });
      });
    }

    if (body) body.innerHTML = renderDetailBody(m);

    var replyTo =
      m.direction === "inbound" ? extractEmail(m.from_addr) : extractEmail(m.to_addr);
    document.getElementById("mailboxReplyTo").value = replyTo;
    document.getElementById("mailboxReplySubject").value = /^re:/i.test(m.subject || "")
      ? m.subject
      : "Re: " + (m.subject || "");
    document.getElementById("mailboxReplyToId").value = m.id;
    if (!opts.keepDraft) {
      document.getElementById("mailboxReplyBody").value = "";
    }

    var summary = document.getElementById("mailboxReplySummary");
    if (summary) {
      summary.textContent =
        m.direction === "outbound" ? "Renvoyer / nouvelle reponse" : "Repondre a " + replyTo;
    }

    renderList();
  }

  function showListMobile() {
    var paneList = document.getElementById("mailboxPaneList");
    var paneDetail = document.getElementById("mailboxPaneDetail");
    if (paneList) paneList.classList.remove("mbx-pane--hidden-mobile");
    if (paneDetail) paneDetail.classList.add("mbx-pane--hidden-mobile");
  }

  function openCompose() {
    state.selectedId = "__compose__";
    var empty = document.getElementById("mailboxEmptyState");
    var view = document.getElementById("mailboxDetailView");
    if (empty) empty.hidden = true;
    if (view) view.hidden = false;

    if (window.innerWidth <= 960) {
      var paneList = document.getElementById("mailboxPaneList");
      var paneDetail = document.getElementById("mailboxPaneDetail");
      if (paneList) paneList.classList.add("mbx-pane--hidden-mobile");
      if (paneDetail) paneDetail.classList.remove("mbx-pane--hidden-mobile");
    }

    var head = document.getElementById("mailboxDetailHead");
    if (head) {
      head.innerHTML =
        "<h2>Nouveau message</h2><p style='margin:0;color:var(--muted);font-size:0.88rem'>Envoi via Resend depuis " +
        esc(state.mailboxAddress) +
        "</p>";
    }
    var body = document.getElementById("mailboxDetailBody");
    if (body) {
      body.innerHTML =
        '<p class="mbx-body-text" style="color:var(--muted)">Remplissez le formulaire ci-dessous. Le message sera enregistre dans l historique.</p>';
    }

    document.getElementById("mailboxReplyToId").value = "";
    document.getElementById("mailboxReplyTo").value = "";
    document.getElementById("mailboxReplySubject").value = "";
    document.getElementById("mailboxReplyBody").value = "";
    document.getElementById("mailboxReplyBody").focus();
    document.getElementById("mailboxReplyPanel").open = true;
    renderList();
  }

  function ingestMessages(data) {
    state.all = data.messages || [];
    state.stats = data.stats || null;
    state.imapConfigured = !!data.imapConfigured;
    state.mailboxAddress = data.mailboxAddress || state.mailboxAddress;
    state.tableMissing = false;
    applyFilters();
    renderStats();
    renderSetup(data);
    renderList();

    var sub = document.getElementById("mailboxSubtitle");
    if (sub) {
      sub.textContent =
        state.all.length +
        " message(s) — " +
        (state.imapConfigured ? "IMAP actif" : "IMAP inactif") +
        " — " +
        state.mailboxAddress;
    }

    if (state.selectedId && state.selectedId !== "__compose__") {
      var still = state.all.some(function (m) {
        return m.id === state.selectedId;
      });
      if (still) selectMessage(state.selectedId, { keepDraft: true });
      else state.selectedId = null;
    } else if (!state.selectedId && state.filtered.length) {
      selectMessage(state.filtered[0].id);
    }
  }

  async function loadMailbox() {
    var list = document.getElementById("mailboxList");
    if (list) {
      list.innerHTML =
        '<div class="loading-state" style="padding:40px"><div class="spinner"></div>Chargement…</div>';
    }

    var data = await window.Dashboard.api("/api/dashboard/mailbox-list?limit=100");

    if (data.code === "MAILBOX_TABLE_MISSING" || data.status === 503) {
      state.tableMissing = true;
      state.all = [];
      state.filtered = [];
      renderSetup({});
      renderStats();
      renderList();
      return;
    }

    if (!data.ok) {
      if (list) {
        list.innerHTML =
          '<div class="mbx-empty"><p>' + esc(data.error || "Erreur chargement") + "</p></div>";
      }
      toast(data.error || "Erreur", "error");
      return;
    }

    ingestMessages(data);
  }

  async function syncMailbox() {
    var btn = document.getElementById("mailboxSyncBtn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Sync…";
    }
    var data = await window.Dashboard.api("/api/dashboard/mailbox-sync", { method: "POST" });
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Synchroniser IMAP";
    }
    if (!data.ok) {
      toast(data.error || "Erreur sync", "error");
      return;
    }
    if (data.sync && data.sync.skipped) {
      toast(data.sync.error || "IMAP non configure", "error");
    } else if (data.sync && data.sync.ok) {
      toast("Sync OK — " + (data.sync.imported || 0) + " nouveau(x) e-mail(s)");
    } else if (data.sync && data.sync.error) {
      toast(data.sync.error, "error");
    }
    if (data.messages) ingestMessages(data);
    else loadMailbox();
  }

  function bindUi() {
    var search = document.getElementById("mailboxSearch");
    if (search) {
      search.addEventListener("input", function () {
        state.search = search.value;
        applyFilters();
        renderList();
      });
    }

    document.querySelectorAll(".mbx-filter").forEach(function (btn) {
      btn.addEventListener("click", function () {
        document.querySelectorAll(".mbx-filter").forEach(function (b) {
          b.classList.remove("is-active");
        });
        btn.classList.add("is-active");
        state.filter = btn.getAttribute("data-filter") || "all";
        applyFilters();
        renderList();
      });
    });

    var compose = document.getElementById("mailboxComposeBtn");
    if (compose) compose.addEventListener("click", openCompose);

    var back = document.getElementById("mailboxBackBtn");
    if (back) back.addEventListener("click", showListMobile);

    var discard = document.getElementById("mailboxDiscardBtn");
    if (discard) {
      discard.addEventListener("click", function () {
        document.getElementById("mailboxReplyBody").value = "";
        toast("Brouillon efface");
      });
    }

    var form = document.getElementById("mailboxReplyForm");
    if (form) {
      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        var btn = document.getElementById("mailboxSendBtn");
        if (btn) {
          btn.disabled = true;
          btn.textContent = "Envoi…";
        }
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
        if (btn) {
          btn.disabled = false;
          btn.textContent = "Envoyer";
        }
        if (!data.ok) {
          toast(data.error || "Echec envoi", "error");
          return;
        }
        toast("E-mail envoye");
        state.selectedId = null;
        loadMailbox();
      });
    }

    var syncBtn = document.getElementById("mailboxSyncBtn");
    var refreshBtn = document.getElementById("mailboxRefreshBtn");
    if (syncBtn) syncBtn.addEventListener("click", syncMailbox);
    if (refreshBtn) refreshBtn.addEventListener("click", loadMailbox);
  }

  window.loadMailbox = loadMailbox;

  document.addEventListener("DOMContentLoaded", bindUi);
})();
