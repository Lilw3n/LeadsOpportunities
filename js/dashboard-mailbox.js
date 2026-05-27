/**
 * Messagerie dashboard — liste, sync IMAP, reponse Resend
 */
(function () {
  var selectedId = null;

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function fmtDate(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return iso;
    }
  }

  function toast(msg, type) {
    var el = document.getElementById("toast");
    if (!el) return;
    el.textContent = msg;
    el.className = "toast " + (type || "success") + " show";
    setTimeout(function () {
      el.classList.remove("show");
    }, 3500);
  }

  function extractEmail(addr) {
    var m = String(addr || "").match(/<([^>]+)>/);
    return (m && m[1]) || String(addr || "").trim();
  }

  function renderList(messages) {
    var list = document.getElementById("mailboxList");
    var status = document.getElementById("mailboxStatus");
    if (!list) return;
    if (!messages.length) {
      list.innerHTML =
        '<p class="mailbox-empty">Aucun message. Cliquez « Synchroniser la boite » si IMAP est configure.</p>';
      return;
    }
    list.innerHTML = messages
      .map(function (m) {
        var active = m.id === selectedId ? " mailbox-item--active" : "";
        var dir = m.direction === "outbound" ? "↗" : "↙";
        var preview = (m.body_text || "").replace(/\s+/g, " ").trim().slice(0, 90);
        return (
          '<button type="button" class="mailbox-item' +
          active +
          '" data-id="' +
          esc(m.id) +
          '">' +
          '<span class="mailbox-item__dir">' +
          dir +
          "</span>" +
          '<span class="mailbox-item__main">' +
          '<strong>' +
          esc(m.subject || "(sans objet)") +
          "</strong>" +
          '<span class="mailbox-item__meta">' +
          esc(extractEmail(m.from_addr)) +
          " · " +
          fmtDate(m.created_at) +
          "</span>" +
          '<span class="mailbox-item__preview">' +
          esc(preview) +
          "</span>" +
          "</span></button>"
        );
      })
      .join("");

    list.querySelectorAll(".mailbox-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        selectedId = btn.getAttribute("data-id");
        var msg = messages.find(function (x) {
          return x.id === selectedId;
        });
        renderDetail(msg);
        renderList(messages);
      });
    });
    if (status) status.textContent = messages.length + " message(s)";
  }

  function renderDetail(m) {
    var pane = document.getElementById("mailboxDetail");
    var form = document.getElementById("mailboxReplyForm");
    if (!pane || !form) return;
    if (!m) {
      pane.innerHTML = '<p class="mailbox-empty">Selectionnez un message.</p>';
      form.hidden = true;
      return;
    }
    pane.innerHTML =
      '<div class="mailbox-detail__head">' +
      "<h3>" +
      esc(m.subject) +
      "</h3>" +
      '<p><strong>De :</strong> ' +
      esc(m.from_addr) +
      "<br><strong>A :</strong> " +
      esc(m.to_addr) +
      "<br><strong>Date :</strong> " +
      fmtDate(m.created_at) +
      "</p></div>" +
      '<pre class="mailbox-detail__body">' +
      esc(m.body_text || "") +
      "</pre>";

    form.hidden = false;
    document.getElementById("mailboxReplyTo").value =
      m.direction === "inbound" ? extractEmail(m.from_addr) : extractEmail(m.to_addr);
    document.getElementById("mailboxReplySubject").value = /^re:/i.test(m.subject || "")
      ? m.subject
      : "Re: " + (m.subject || "");
    document.getElementById("mailboxReplyBody").value = "";
    document.getElementById("mailboxReplyToId").value = m.id;
  }

  async function loadMailbox() {
    var list = document.getElementById("mailboxList");
    if (list) list.innerHTML = '<div class="loading-state"><div class="spinner"></div>Chargement…</div>';
    var data = await window.Dashboard.api("/api/dashboard/mailbox-list?limit=50");
    if (!data.ok) {
      if (list) list.innerHTML = "<p>" + esc(data.error) + "</p>";
      return;
    }
    var hint = document.getElementById("mailboxImapHint");
    if (hint) {
      hint.textContent = data.imapConfigured
        ? "IMAP configure — synchronisez pour lire contact@" + (data.mailboxAddress || "")
        : "IMAP non configure sur Vercel (MAIL_IMAP_USER + MAIL_IMAP_PASS). Les demandes site s'affichent deja.";
    }
    renderList(data.messages || []);
    if ((data.messages || []).length && !selectedId) {
      selectedId = data.messages[0].id;
      renderDetail(data.messages[0]);
      renderList(data.messages);
    }
  }

  async function syncMailbox() {
    var btn = document.getElementById("mailboxSyncBtn");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Synchronisation…";
    }
    var data = await window.Dashboard.api("/api/dashboard/mailbox-sync", { method: "POST" });
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Synchroniser la boite";
    }
    if (!data.ok) {
      toast(data.error || "Erreur sync", "error");
      return;
    }
    if (data.sync && data.sync.skipped) {
      toast(data.sync.error || "IMAP non configure", "error");
    } else if (data.sync && data.sync.ok) {
      toast("Boite synchronisee (" + (data.sync.imported || 0) + " messages)");
    } else if (data.sync && data.sync.error) {
      toast(data.sync.error, "error");
    }
    renderList(data.messages || []);
    if ((data.messages || []).length) {
      selectedId = data.messages[0].id;
      renderDetail(data.messages[0]);
      renderList(data.messages);
    }
  }

  function bindReplyForm() {
    var form = document.getElementById("mailboxReplyForm");
    if (!form) return;
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      var btn = document.getElementById("mailboxSendBtn");
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Envoi…";
      }
      var payload = {
        to: document.getElementById("mailboxReplyTo").value,
        subject: document.getElementById("mailboxReplySubject").value,
        body: document.getElementById("mailboxReplyBody").value,
        replyToId: document.getElementById("mailboxReplyToId").value,
      };
      var data = await window.Dashboard.api("/api/dashboard/mailbox-send", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (btn) {
        btn.disabled = false;
        btn.textContent = "Envoyer la reponse";
      }
      if (!data.ok) {
        toast(data.error || "Echec envoi", "error");
        return;
      }
      toast("E-mail envoye");
      document.getElementById("mailboxReplyBody").value = "";
      loadMailbox();
    });
  }

  window.loadMailbox = loadMailbox;

  document.addEventListener("DOMContentLoaded", function () {
    var syncBtn = document.getElementById("mailboxSyncBtn");
    var refreshBtn = document.getElementById("mailboxRefreshBtn");
    if (syncBtn) syncBtn.addEventListener("click", syncMailbox);
    if (refreshBtn) refreshBtn.addEventListener("click", loadMailbox);
    bindReplyForm();
  });
})();
