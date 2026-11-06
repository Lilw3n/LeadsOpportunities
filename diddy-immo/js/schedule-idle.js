/**
 * Exécute une tâche non critique après le premier rendu (requestIdleCallback ou setTimeout).
 */
(function (g) {
  function scheduleIdle(fn, timeoutMs) {
    if (typeof fn !== "function") return;
    timeoutMs = timeoutMs == null ? 2500 : timeoutMs;
    function run() {
      try {
        fn();
      } catch (e) {}
    }
    if (typeof g.requestIdleCallback === "function") {
      g.requestIdleCallback(run, { timeout: timeoutMs });
    } else {
      g.setTimeout(run, Math.min(timeoutMs, 1500));
    }
  }
  g.scheduleIdle = scheduleIdle;
})(typeof window !== "undefined" ? window : globalThis);
