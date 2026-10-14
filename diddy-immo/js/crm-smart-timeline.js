window.CrmSmartTimeline = {
  filterPeriod: function (events, period) {
    if (!period || period === "all") return events;
    var now = new Date();
    var start = new Date(now);
    if (period === "today") start.setHours(0, 0, 0, 0);
    else if (period === "week") start.setDate(start.getDate() - 7);
    else if (period === "month") start.setMonth(start.getMonth() - 1);
    else return events;
    return (events || []).filter(function (e) {
      var d = e.event_date || e.created_at;
      if (!d) return false;
      return new Date(d).getTime() >= start.getTime();
    });
  },

  groupByDate: function (events) {
    var groups = {};
    (events || []).forEach(function (e) {
      var key = e.event_date
        ? String(e.event_date).slice(0, 10)
        : String(e.created_at || "").slice(0, 10);
      if (!key) key = "sans-date";
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return Object.keys(groups)
      .sort()
      .reverse()
      .map(function (k) {
        return { date: k, events: groups[k] };
      });
  },

  insights: function (events) {
    var pending = 0;
    var urgent = 0;
    var completed = 0;
    var byType = {};
    (events || []).forEach(function (e) {
      if (e.status === "pending") pending++;
      if (e.priority === "urgent") urgent++;
      if (e.status === "completed") completed++;
      byType[e.event_type] = (byType[e.event_type] || 0) + 1;
    });
    var topType = Object.keys(byType).sort(function (a, b) {
      return byType[b] - byType[a];
    })[0];
    return { pending: pending, urgent: urgent, completed: completed, topType: topType, total: events.length };
  },

  render: function (events, escFn, period) {
    escFn = escFn || function (s) {
      return s;
    };
    events = this.filterPeriod(events, period);
    var ins = this.insights(events);
    var groups = this.groupByDate(events.slice(0, 40));
    var html =
      '<div class="smart-timeline-toolbar">' +
      '<label>Période <select id="smartTimelinePeriod" class="smart-period-select">' +
      '<option value="all"' +
      (period === "all" || !period ? " selected" : "") +
      ">Tout</option>" +
      '<option value="today"' +
      (period === "today" ? " selected" : "") +
      ">Aujourd'hui</option>" +
      '<option value="week"' +
      (period === "week" ? " selected" : "") +
      ">7 jours</option>" +
      '<option value="month"' +
      (period === "month" ? " selected" : "") +
      ">30 jours</option>" +
      "</select></label></div>" +
      '<div class="smart-insights">' +
      "<span><strong>" +
      ins.total +
      "</strong> evenements</span>" +
      "<span>" +
      ins.pending +
      " en attente</span>" +
      "<span>" +
      ins.urgent +
      " urgents</span>" +
      "<span>" +
      ins.completed +
      " termines</span>" +
      (ins.topType ? "<span>Type frequent : " + escFn(ins.topType) + "</span>" : "") +
      "</div>";

    groups.forEach(function (g) {
      var label =
        g.date === "sans-date"
          ? "Sans date"
          : new Date(g.date).toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            });
      html += '<div class="smart-day"><h4>' + escFn(label) + "</h4>";
      g.events.forEach(function (e) {
        html +=
          '<div class="smart-event"><span class="dot ' +
          escFn(e.priority || "medium") +
          '"></span><div><strong>' +
          escFn(e.title) +
          "</strong><br><small>" +
          escFn(e.event_type) +
          " · " +
          escFn(e.status) +
          (e.event_time ? " · " + escFn(e.event_time) : "") +
          "</small></div></div>";
      });
      html += "</div>";
    });
    if (!groups.length) html += "<p>Aucun evenement pour cette periode.</p>";
    return html;
  },
};
