(function () {
  var STORAGE_KEY = "lo_user_requests_v1";

  window.saveLeadRequest = function (payload) {
    try {
      var list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      var entry = Object.assign(
        {
          id: "req_" + Date.now(),
          ts: new Date().toISOString(),
        },
        payload || {}
      );
      list.unshift(entry);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
    } catch (e) {
      console.warn("[leads-storage]", e);
    }
  };

  window.getLeadRequests = function () {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch (e) {
      return [];
    }
  };

  window.clearLeadRequests = function () {
    localStorage.removeItem(STORAGE_KEY);
  };
})();
