window.CrmEventForm = {
  escAttr: function (s) {
    return String(s || "").replace(/"/g, "&quot;");
  },

  participantRow: function (p, i) {
    p = p || {};
    return (
      '<div class="participant-row form-grid" data-index="' +
      i +
      '">' +
      '<label>Participant<input name="participant_' +
      i +
      '" value="' +
      this.escAttr(p.name) +
      '" placeholder="Nom" /></label>' +
      '<label>Role<select name="participant_role_' +
      i +
      '"><option value="recipient"' +
      (p.role === "recipient" ? " selected" : "") +
      '>Destinataire</option><option value="sender"' +
      (p.role === "sender" ? " selected" : "") +
      ">Expediteur</option><option value=\"attendee\"" +
      (p.role === "attendee" ? " selected" : "") +
      ">Participant</option></select></label>" +
      '<button type="button" class="btn btn-ghost btn-xs btn-rm-participant">Retirer</button>' +
      "</div>"
    );
  },

  attachmentRow: function (a, i) {
    a = a || {};
    return (
      '<div class="attachment-row form-grid" data-index="' +
      i +
      '">' +
      '<label>Nom PJ<input name="attachment_name_' +
      i +
      '" value="' +
      this.escAttr(a.name) +
      '" /></label>' +
      '<label>URL PJ<input name="attachment_url_' +
      i +
      '" value="' +
      this.escAttr(a.url) +
      '" /></label>' +
      '<button type="button" class="btn btn-ghost btn-xs btn-rm-attachment">Retirer</button>' +
      "</div>"
    );
  },

  linkRow: function (u, i) {
    u = u || {};
    return (
      '<div class="link-row form-grid" data-index="' +
      i +
      '">' +
      '<label>Titre lien<input name="link_title_' +
      i +
      '" value="' +
      this.escAttr(u.title) +
      '" /></label>' +
      '<label>URL<input name="link_url_' +
      i +
      '" value="' +
      this.escAttr(u.url) +
      '" /></label>' +
      '<button type="button" class="btn btn-ghost btn-xs btn-rm-link">Retirer</button>' +
      "</div>"
    );
  },

  bindDynamic: function (form) {
    if (!form || form._crmEventBound) return;
    form._crmEventBound = true;
    var self = this;

    form.addEventListener("click", function (e) {
      var t = e.target;
      if (t.classList.contains("btn-add-participant")) {
        e.preventDefault();
        var box = form.querySelector("#participantsBox");
        var idx = box.querySelectorAll(".participant-row").length;
        box.insertAdjacentHTML("beforeend", self.participantRow({}, idx));
      }
      if (t.classList.contains("btn-rm-participant")) {
        e.preventDefault();
        var row = t.closest(".participant-row");
        if (row && form.querySelectorAll(".participant-row").length > 1) row.remove();
      }
      if (t.classList.contains("btn-add-attachment")) {
        e.preventDefault();
        var abox = form.querySelector("#attachmentsBox");
        var ai = abox.querySelectorAll(".attachment-row").length;
        abox.insertAdjacentHTML("beforeend", self.attachmentRow({}, ai));
      }
      if (t.classList.contains("btn-rm-attachment")) {
        e.preventDefault();
        var ar = t.closest(".attachment-row");
        if (ar) ar.remove();
      }
      if (t.classList.contains("btn-add-link")) {
        e.preventDefault();
        var lbox = form.querySelector("#linksBox");
        var li = lbox.querySelectorAll(".link-row").length;
        lbox.insertAdjacentHTML("beforeend", self.linkRow({}, li));
      }
      if (t.classList.contains("btn-rm-link")) {
        e.preventDefault();
        var lr = t.closest(".link-row");
        if (lr) lr.remove();
      }
    });
  },

  build: function (item) {
    item = item || {};
    var extra = {};
    if (item.extra_data) {
      try {
        extra = JSON.parse(item.extra_data);
      } catch (e) {}
    }
    var parts = extra.participants || [];
    if (!parts.length) parts = [{ name: "", role: "recipient" }];
    var attachments = extra.attachments || [];
    var urls = extra.urls || extra.links || [];

    var partHtml = parts.map(this.participantRow.bind(this)).join("");
    var attHtml = attachments.length
      ? attachments.map(this.attachmentRow.bind(this)).join("")
      : "";
    var linkHtml = urls.length ? urls.map(this.linkRow.bind(this)).join("") : "";

    var ed = item.event_date || window.CrmDateUtils.todayInput();
    var et = item.event_time || window.CrmDateUtils.timeRounded();

    return (
      '<label>Type<select name="event_type" required>' +
      ["call", "email", "meeting", "task", "note", "document"]
        .map(function (t) {
          return (
            '<option value="' +
            t +
            '"' +
            ((item.event_type || "call") === t ? " selected" : "") +
            ">" +
            t +
            "</option>"
          );
        })
        .join("") +
      "</select></label>" +
      '<label class="full">Titre<input name="title" required value="' +
      this.escAttr(item.title) +
      '" /></label>' +
      '<label class="full">Description<textarea name="description" rows="3" required>' +
      (item.description || "") +
      "</textarea></label>" +
      '<label>Date<input type="date" name="event_date" value="' +
      ed +
      '" /></label>' +
      '<label>Heure<input type="time" name="event_time" value="' +
      et +
      '" /></label>' +
      '<label>Statut<select name="status"><option value="pending">En attente</option><option value="completed"' +
      (item.status === "completed" ? " selected" : "") +
      '>Termine</option><option value="cancelled"' +
      (item.status === "cancelled" ? " selected" : "") +
      ">Annule</option></select></label>" +
      '<label>Priorite<select name="priority"><option value="low">Faible</option><option value="medium"' +
      (!item.priority || item.priority === "medium" ? " selected" : "") +
      '>Moyenne</option><option value="high"' +
      (item.priority === "high" ? " selected" : "") +
      '>Haute</option><option value="urgent"' +
      (item.priority === "urgent" ? " selected" : "") +
      ">Urgente</option></select></label>" +
      '<h3 class="form-section-title">Participants</h3>' +
      '<div id="participantsBox">' +
      partHtml +
      "</div>" +
      '<button type="button" class="btn btn-ghost btn-sm btn-add-participant">+ Participant</button>' +
      '<h3 class="form-section-title">Pieces jointes</h3>' +
      '<div id="attachmentsBox">' +
      attHtml +
      "</div>" +
      '<button type="button" class="btn btn-ghost btn-sm btn-add-attachment">+ Piece jointe</button>' +
      '<h3 class="form-section-title">Liens</h3>' +
      '<div id="linksBox">' +
      linkHtml +
      "</div>" +
      '<button type="button" class="btn btn-ghost btn-sm btn-add-link">+ Lien</button>'
    );
  },

  parse: function (fd) {
    var participants = [];
    var i = 0;
    while (i < 20) {
      var name = fd.get("participant_" + i);
      if (name) {
        participants.push({
          name: name,
          role: fd.get("participant_role_" + i) || "recipient",
        });
      }
      i++;
    }
    if (!participants.length) {
      return { error: "Au moins un participant est requis" };
    }

    var attachments = [];
    i = 0;
    while (i < 20) {
      var an = fd.get("attachment_name_" + i);
      var au = fd.get("attachment_url_" + i);
      if (an || au) {
        attachments.push({ name: an || "Document", type: "document", url: au || "" });
      }
      i++;
    }

    var urls = [];
    i = 0;
    while (i < 20) {
      var lt = fd.get("link_title_" + i);
      var lu = fd.get("link_url_" + i);
      if (lu) {
        urls.push({ title: lt || "Lien", url: lu, type: "link" });
      }
      i++;
    }

    return {
      event_type: fd.get("event_type"),
      title: fd.get("title"),
      description: fd.get("description"),
      event_date: fd.get("event_date"),
      event_time: fd.get("event_time"),
      status: fd.get("status"),
      priority: fd.get("priority"),
      participants: participants,
      attachments: attachments,
      urls: urls,
    };
  },
};
