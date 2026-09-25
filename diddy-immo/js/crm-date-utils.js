window.CrmDateUtils = {
  todayInput: function () {
    var d = new Date();
    return d.toISOString().slice(0, 10);
  },
  timeRounded: function () {
    var d = new Date();
    var m = Math.ceil(d.getMinutes() / 15) * 15;
    if (m === 60) {
      d.setHours(d.getHours() + 1);
      m = 0;
    }
    return String(d.getHours()).padStart(2, "0") + ":" + String(m).padStart(2, "0");
  },
  formatDateFR: function (date) {
    if (!date) return "";
    try {
      var d = new Date(date);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString("fr-FR");
    } catch (e) {
      return "";
    }
  },
};
