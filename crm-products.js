(function () {
  if (!localStorage.getItem("lo_token")) location.href = "./crm.html";

  var products = [];

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = s == null ? "" : s;
    return d.innerHTML;
  }

  function optionalLine(label, value, suffix) {
    if (value === null || value === undefined || value === "") return "";
    return "<span><strong>" + esc(label) + "</strong> " + esc(value) + (suffix || "") + "</span>";
  }

  function formPayload() {
    return {
      name: document.getElementById("productName").value.trim(),
      category: document.getElementById("productCategory").value,
      status: document.getElementById("productStatus").value,
      type: document.getElementById("productType").value.trim(),
      price: document.getElementById("productPrice").value,
      commission: document.getElementById("productCommission").value,
      description: document.getElementById("productDescription").value.trim(),
      audience: document.getElementById("productAudience").value,
      internalNotes: document.getElementById("productNotes").value.trim(),
    };
  }

  function resetForm() {
    document.getElementById("productId").value = "";
    document.getElementById("productForm").reset();
    document.getElementById("productStatus").value = "draft";
    document.getElementById("productForm").classList.remove("show");
  }

  function showForm(product) {
    product = product || {};
    document.getElementById("productId").value = product.id || "";
    document.getElementById("productName").value = product.name || "";
    document.getElementById("productCategory").value = product.category || "";
    document.getElementById("productStatus").value = product.status || "draft";
    document.getElementById("productType").value = product.type || "";
    document.getElementById("productPrice").value = product.price == null ? "" : product.price;
    document.getElementById("productCommission").value = product.commission == null ? "" : product.commission;
    document.getElementById("productDescription").value = product.description || "";
    document.getElementById("productAudience").value = (product.audience || []).join(", ");
    document.getElementById("productNotes").value = product.internalNotes || "";
    document.getElementById("productForm").classList.add("show");
  }

  function render() {
    var q = document.getElementById("prodSearch").value.toLowerCase();
    var cat = document.getElementById("prodFilter").value;
    var list = products.filter(function (p) {
      if (cat && p.category !== cat) return false;
      if (q && p.name.toLowerCase().indexOf(q) < 0 && (p.description || "").toLowerCase().indexOf(q) < 0) return false;
      return true;
    });
    if (!list.length) {
      document.getElementById("prodGrid").innerHTML =
        '<div class="prod-empty">Aucun produit vérifié enregistré. Ajoutez uniquement des informations confirmées par vos partenaires ou contrats.</div>';
      return;
    }
    document.getElementById("prodGrid").innerHTML = list
      .map(function (p) {
        var money = optionalLine("Prix indicatif :", p.price == null ? "" : Number(p.price).toLocaleString("fr-FR") + " EUR");
        var commission = optionalLine("Commission :", p.commission == null ? "" : p.commission, "%");
        return (
          '<article class="prod-card" data-id="' + esc(p.id) + '">' +
          '<span class="prod-badge">' +
          esc(p.category || "non-classe") +
          "</span>" +
          '<span class="prod-badge">' +
          esc(p.status || "draft") +
          "</span>" +
          (p.type ? '<span class="prod-badge">' + esc(p.type) + "</span>" : "") +
          "<h3>" +
          esc(p.name) +
          "</h3>" +
          '<p class="prod-meta">' +
          esc(p.description || "Aucune description vérifiée renseignée.") +
          "</p>" +
          (money || commission ? "<p style='margin:12px 0 0;display:grid;gap:4px'>" + money + commission + "</p>" : "") +
          ((p.audience || []).length ? '<p class="prod-meta">Cibles : ' + esc((p.audience || []).join(", ")) + "</p>" : "") +
          (p.internalNotes ? '<p class="prod-meta">Notes internes : ' + esc(p.internalNotes) + "</p>" : "") +
          '<p style="margin-top:10px"><button type="button" class="btn btn-ghost btn-sm btn-edit" data-id="' +
          esc(p.id) +
          '">Modifier</button> <button type="button" class="btn btn-ghost btn-sm btn-delete" data-id="' +
          esc(p.id) +
          '">Supprimer</button> <a href="./crm-quote-new.html?productId=' +
          encodeURIComponent(p.id) +
          '" class="btn btn-primary btn-sm">+ Devis</a> ' +
          '<a href="./crm-contract-new.html?productId=' +
          encodeURIComponent(p.id) +
          '" class="btn btn-ghost btn-sm">+ Contrat</a></p>' +
          "</article>"
        );
      })
      .join("");
    document.querySelectorAll(".btn-edit").forEach(function (btn) {
      btn.onclick = function () {
        showForm(products.find(function (p) { return p.id === btn.getAttribute("data-id"); }));
      };
    });
    document.querySelectorAll(".btn-delete").forEach(function (btn) {
      btn.onclick = function () {
        if (!confirm("Supprimer ce produit du catalogue interne ?")) return;
        window.CrmProductService.remove(btn.getAttribute("data-id")).then(load).catch(function (e) {
          alert(e.message || "Suppression impossible");
        });
      };
    });
  }

  function load() {
    window.CrmProductService.list().then(function (list) {
      products = list || [];
      render();
    });
  }

  document.getElementById("prodSearch").oninput = render;
  document.getElementById("prodFilter").onchange = render;
  document.getElementById("btnProductNew").onclick = function () { showForm(); };
  document.getElementById("btnProductCancel").onclick = resetForm;
  document.getElementById("productForm").onsubmit = function (e) {
    e.preventDefault();
    var id = document.getElementById("productId").value;
    var payload = formPayload();
    var op = id ? window.CrmProductService.update(id, payload) : window.CrmProductService.create(payload);
    op.then(function () {
      resetForm();
      load();
    }).catch(function (err) {
      alert(err.message || "Enregistrement impossible");
    });
  };
  load();
})();
