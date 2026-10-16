(function () {
  var token = localStorage.getItem("lo_token");
  if (!token) {
    location.href = "./crm.html";
    return;
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : String(s);
    return d.innerHTML;
  }

  function authHeaders() {
    return { Authorization: "Bearer " + token, "Content-Type": "application/json" };
  }

  function setStatus(msg) {
    var el = document.getElementById("freeboxStatus");
    if (el) el.textContent = msg;
  }

  function renderResult(data) {
    var box = document.getElementById("callResult");
    var body = document.getElementById("callResultBody");
    box.hidden = false;
    var metier = data.metier ? esc(data.metier.label) + " · questionnaire " + esc(data.metier.need) : "Métier non reconnu";
    var lead = data.lead ? "Rattaché au lead " + esc(data.lead.id) : "Aucun lead avec ce numéro — le résumé n’est pas archivé.";
    var free = data.free
      ? esc(data.free.direction || "") + " · " + esc(data.free.duration || 0) + " s"
      : "Pas de ligne Freebox";
    body.innerHTML =
      "<p><strong>" +
      esc(data.summary || "") +
      "</strong></p>" +
      "<p>Métier : " +
      metier +
      "</p>" +
      "<p>Suite : " +
      esc(data.nextStep || "") +
      "</p>" +
      "<p>Free : " +
      free +
      " · moteur " +
      esc(data.provider || "local") +
      " · audio non reçu</p>" +
      "<p>" +
      esc(lead) +
      (data.stored ? " · enregistré." : "") +
      "</p>" +
      "<p style=\"color:var(--muted)\">" +
      esc(data.note || "") +
      "</p>";
  }

  function renderHistory(items) {
    var el = document.getElementById("callHistory");
    if (!items || !items.length) {
      el.innerHTML = '<p style="color:var(--muted)">Aucun résumé stocké pour le moment.</p>';
      return;
    }
    el.innerHTML =
      "<table><thead><tr><th>Quand</th><th>Métier</th><th>Résumé</th></tr></thead><tbody>" +
      items
        .map(function (row) {
          return (
            "<tr><td>" +
            esc(row.createdAt || "") +
            "</td><td>" +
            esc(row.metier && row.metier.label ? row.metier.label : row.source || "") +
            "</td><td>" +
            esc(row.summary || "") +
            "</td></tr>"
          );
        })
        .join("") +
      "</tbody></table>";
  }

  function loadHistory() {
    fetch("/api/crm/call-summary", { headers: authHeaders() })
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        renderHistory((data && data.items) || []);
      })
      .catch(function () {
        renderHistory([]);
      });
  }

  document.getElementById("btnFreebox").addEventListener("click", function () {
    if (location.protocol === "https:") {
      setStatus(
        "Le CRM est en HTTPS. Le navigateur bloque la Freebox, qui répond en HTTP sur le réseau local. Ouvrez http://mafreebox.freebox.fr/api/v8/call/log/ depuis un appareil du foyer et collez le JSON."
      );
      return;
    }
    setStatus("Lecture du journal Freebox…");
    fetch("http://mafreebox.freebox.fr/api/v8/call/log/")
      .then(function (r) {
        return r.json();
      })
      .then(function (data) {
        document.getElementById("callFreebox").value = JSON.stringify(data);
        var n = data && data.result ? data.result.length : Array.isArray(data) ? data.length : 1;
        setStatus("Journal lu (" + n + " ligne(s)). Free ne joint pas l’audio.");
      })
      .catch(function () {
        setStatus("Freebox injoignable (autre réseau, ou appel bloqué). Collez le JSON du journal.");
      });
  });

  document.getElementById("btnSummarize").addEventListener("click", function () {
    var consent = document.getElementById("callConsent").checked;
    if (!consent) {
      setStatus("Cochez l’information du correspondant avant de résumer.");
      return;
    }
    var freeRaw = document.getElementById("callFreebox").value.trim();
    var freebox = null;
    if (freeRaw) {
      try {
        freebox = JSON.parse(freeRaw);
      } catch (e) {
        setStatus("Le journal Freebox n’est pas du JSON valide.");
        return;
      }
    }
    setStatus("Résumé en cours…");
    fetch("/api/crm/call-summary", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({
        consent: true,
        phone: document.getElementById("callPhone").value.trim(),
        leadId: document.getElementById("callLeadId").value.trim(),
        transcript: document.getElementById("callTranscript").value,
        freebox: freebox,
      }),
    })
      .then(function (r) {
        return r.json().then(function (data) {
          return { status: r.status, data: data };
        });
      })
      .then(function (res) {
        if (!res.data || res.data.ok === false) {
          setStatus((res.data && res.data.error) || "Résumé refusé.");
          return;
        }
        setStatus(res.data.stored ? "Résumé enregistré sur le lead." : "Résumé prêt. Aucun lead correspondant, rien n’est archivé.");
        renderResult(res.data);
        loadHistory();
      })
      .catch(function () {
        setStatus("Le serveur n’a pas répondu.");
      });
  });

  loadHistory();
})();
