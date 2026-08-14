/**
 * Création d’une fiche interlocuteur depuis n’importe quel écran lead.
 * Clique sur [data-create-interlocuteur] → promote → redirection vers crm-contact.html.
 */
(function (root) {
  function token() {
    return localStorage.getItem("lo_token");
  }

  function defaultEsc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
  }

  function create(leadId, opts) {
    opts = opts || {};
    if (!leadId) {
      alert("Lead introuvable");
      return Promise.resolve({ ok: false });
    }
    var btn = opts.button;
    if (btn) {
      btn.disabled = true;
      btn.setAttribute("data-prev-label", btn.textContent);
      btn.textContent = "Création…";
    }
    return fetch("/api/crm/lead-lifecycle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + (token() || ""),
      },
      body: JSON.stringify({ action: "promote", leadId: leadId }),
    })
      .then(function (r) {
        return r.json().catch(function () {
          return { ok: false, error: "Réponse invalide" };
        });
      })
      .then(function (res) {
        if (res.ok && res.contactId) {
          location.href = "./crm-contact.html?id=" + encodeURIComponent(res.contactId);
          return res;
        }
        alert(res.error || "Impossible de créer la fiche interlocuteur");
        if (btn) {
          btn.disabled = false;
          btn.textContent = btn.getAttribute("data-prev-label") || "Créer fiche interlocuteur";
        }
        return res;
      })
      .catch(function () {
        alert("Erreur réseau — reconnectez-vous si besoin");
        if (btn) {
          btn.disabled = false;
          btn.textContent = btn.getAttribute("data-prev-label") || "Créer fiche interlocuteur";
        }
        return { ok: false };
      });
  }

  function buttonHtml(lead, escFn, opts) {
    if (escFn && typeof escFn === "object" && !opts) {
      opts = escFn;
      escFn = null;
    }
    escFn = escFn || defaultEsc;
    opts = opts || {};
    if (!lead || !lead.id) return "";
    var compact = !!opts.compact;
    if (lead.contact_id) {
      return (
        '<a class="btn btn-primary btn-sm btn-int-create btn-int-open" href="./crm-contact.html?id=' +
        encodeURIComponent(lead.contact_id) +
        '">' +
        (compact ? "Ouvrir fiche" : "Ouvrir fiche interlocuteur") +
        "</a>"
      );
    }
    return (
      '<button type="button" class="btn btn-primary btn-sm btn-int-create" data-create-interlocuteur="' +
      escFn(lead.id) +
      '">' +
      (compact ? "Créer fiche" : "Créer fiche interlocuteur") +
      "</button>"
    );
  }

  function barHtml(lead, escFn, opts) {
    opts = opts || {};
    var btn = buttonHtml(lead, escFn, opts);
    if (!btn) return "";
    var hint =
      opts.hint !== false
        ? '<span class="lead-modal-cta-hint">' +
          (opts.hint ||
            "Fiche classée perso / pro / biens + événements. Sans ça, le lead reste une liste brute.") +
          "</span>"
        : "";
    return '<div class="int-cta-bar">' + btn + hint + "</div>";
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-create-interlocuteur]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    create(btn.getAttribute("data-create-interlocuteur"), { button: btn });
  });

  root.CrmCreateInterlocuteur = { create: create, buttonHtml: buttonHtml, barHtml: barHtml };
  root.crmCreateInterlocuteurButtonHtml = buttonHtml;
})(typeof window !== "undefined" ? window : this);
