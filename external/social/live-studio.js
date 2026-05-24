/**
 * Aperçu caméra local — inspire LiveStreamingSystem / streamingService multisite (sans SFU).
 */
(function () {
  var stream = null;
  var video = document.getElementById("livePreview");
  var msg = document.getElementById("liveCamMsg");
  var btnStart = document.getElementById("btnCamStart");
  var btnStop = document.getElementById("btnCamStop");
  if (!video || !btnStart) return;

  function setMsg(t) {
    if (msg) msg.textContent = t || "";
  }

  btnStart.onclick = function () {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMsg("getUserMedia non disponible sur ce navigateur.");
      return;
    }
    setMsg("Demande d'accès à la caméra…");
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "user" }, audio: false })
      .then(function (s) {
        stream = s;
        video.srcObject = s;
        setMsg("Caméra active — diffusion RTMP/WebRTC serveur à brancher côté prod.");
      })
      .catch(function (e) {
        setMsg(e.message || "Accès caméra refusé.");
      });
  };

  btnStop.onclick = function () {
    if (stream) {
      stream.getTracks().forEach(function (t) {
        t.stop();
      });
      stream = null;
    }
    video.srcObject = null;
    setMsg("Caméra arrêtée.");
  };
})();
