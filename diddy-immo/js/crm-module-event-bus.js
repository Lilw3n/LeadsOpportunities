/**
 * Bus d'événements modules — inspire moduleEventBus.ts (multisite).
 */
window.CrmModuleEventBus = {
  _handlers: {},

  on: function (event, fn) {
    if (!this._handlers[event]) this._handlers[event] = [];
    this._handlers[event].push(fn);
  },

  off: function (event, fn) {
    if (!this._handlers[event]) return;
    this._handlers[event] = this._handlers[event].filter(function (h) {
      return h !== fn;
    });
  },

  emit: function (event, payload) {
    (this._handlers[event] || []).forEach(function (fn) {
      try {
        fn(payload);
      } catch (e) {
        console.warn("[CrmModuleEventBus]", event, e);
      }
    });
    window.dispatchEvent(new CustomEvent("crm:module:" + event, { detail: payload }));
  },
};
