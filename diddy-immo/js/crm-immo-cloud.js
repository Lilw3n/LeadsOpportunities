/**
 * Client Immo Cloud — Google Drive intelligent + fallback local.
 */
window.CrmImmoCloud = (function () {
  var LOCAL_KEY = "lo_crm_immo_cloud_v1";

  var DEFAULT_FOLDERS = [
    { id: "01_photos_publiques", label: "Photos publiques", kind: "photos" },
    { id: "02_photos_confidentielles", label: "Photos confidentielles", kind: "photos" },
    { id: "03_documents_publics", label: "Documents publics", kind: "docs" },
    { id: "04_documents_confidentiels", label: "Documents confidentiels", kind: "docs" },
    { id: "05_diagnostics", label: "Diagnostics", kind: "docs" },
    { id: "06_mandat_pieces", label: "Mandat & pièces", kind: "docs" },
    { id: "07_medias_3d_video", label: "Médias 3D / vidéo", kind: "media" },
    { id: "08_documents_imprimes", label: "Documents imprimés", kind: "docs" },
  ];

  function token() {
    return localStorage.getItem("lo_token") || "";
  }

  function loadLocal() {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || "{}") || {};
    } catch (e) {
      return {};
    }
  }

  function saveLocal(db) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(db));
  }

  function propBucket(propertyId) {
    var db = loadLocal();
    if (!db[propertyId]) {
      db[propertyId] = { folders: {}, files: [] };
      DEFAULT_FOLDERS.forEach(function (f) {
        db[propertyId].folders[f.id] = { id: f.id, label: f.label, files: [] };
      });
      saveLocal(db);
    }
    return db[propertyId];
  }

  function classify(fileName, mimeType, confidential, hint) {
    var name = String(fileName || "").toLowerCase();
    var mime = String(mimeType || "").toLowerCase();
    var conf = !!confidential;
    var h = String(hint || "").toLowerCase();
    if (h === "diagnostics" || /dpe|erp|amiante|plomb|termite|gaz|elec|carrez/.test(name)) return "05_diagnostics";
    if (h === "mandat" || /mandat|compromis|offre|titre|identite|kbis/.test(name)) return "06_mandat_pieces";
    if (h === "media" || /video|360|visite|plan.?3d|drone/.test(name) || mime.indexOf("video/") === 0) return "07_medias_3d_video";
    if (mime.indexOf("image/") === 0 || /\.(jpe?g|png|webp|gif|heic)$/i.test(name)) {
      return conf ? "02_photos_confidentielles" : "01_photos_publiques";
    }
    if (h === "imprime") return "08_documents_imprimes";
    return conf ? "04_documents_confidentiels" : "03_documents_publics";
  }

  async function api(method, body) {
    var opts = {
      method: method,
      headers: { Authorization: "Bearer " + token(), "Content-Type": "application/json" },
    };
    if (body != null) opts.body = JSON.stringify(body);
    var res = await fetch("/api/drive/immo", opts);
    return res.json();
  }

  async function ensure(property) {
    try {
      var data = await api("POST", { action: "ensure", property: property });
      if (data && data.ok) {
        if (data.folderId && property) property.drive_folder_id = data.folderId;
        if (data.subfolderIds && property) property.drive_subfolders = data.subfolderIds;
        return data;
      }
    } catch (e) {}
    return {
      ok: true,
      simulated: true,
      configured: false,
      subfolders: DEFAULT_FOLDERS,
      message: "Mode local (Drive non joignable / non configuré)",
    };
  }

  function readFileAsBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(String(reader.result || ""));
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function upload(property, file, opts) {
    opts = opts || {};
    var confidential = !!opts.confidential;
    var hint = opts.hint || "";
    var classified = opts.subfolder || classify(file.name, file.type, confidential, hint);
    var dataUrl = await readFileAsBase64(file);

    try {
      var remote = await api("POST", {
        action: "upload",
        property: {
          id: property.id,
          title: property.title,
          city: property.city,
          postal_code: property.postal_code,
          drive_folder_id: property.drive_folder_id || null,
        },
        folderId: property.drive_folder_id || null,
        subfolderIds: property.drive_subfolders || null,
        fileName: file.name,
        base64: dataUrl,
        mimeType: file.type || "application/octet-stream",
        confidential: confidential,
        hint: hint,
        subfolder: classified,
      });
      if (remote && remote.ok && !remote.simulated && remote.file) {
        if (remote.folderId) property.drive_folder_id = remote.folderId;
        if (remote.subfolderIds) property.drive_subfolders = remote.subfolderIds;
        return {
          ok: true,
          source: "drive",
          classifiedAs: remote.classifiedAs || classified,
          file: {
            id: remote.file.fileId,
            name: remote.file.fileName || file.name,
            mimeType: remote.file.mimeType || file.type,
            webViewLink: remote.file.webViewLink,
            thumbnailLink: remote.file.thumbnailLink,
            url: remote.file.webViewLink || remote.file.thumbnailLink || dataUrl,
          },
        };
      }
    } catch (e) {}

    // Fallback local intelligent
    var bucket = propBucket(property.id);
    var entry = {
      id: "local_" + Date.now().toString(36),
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      folder: classified,
      confidential: confidential,
      url: dataUrl,
      modifiedTime: new Date().toISOString(),
      source: "local",
    };
    bucket.files.unshift(entry);
    if (!bucket.folders[classified]) bucket.folders[classified] = { id: classified, files: [] };
    bucket.folders[classified].files = bucket.files.filter(function (f) {
      return f.folder === classified;
    });
    var db = loadLocal();
    db[property.id] = bucket;
    saveLocal(db);
    return { ok: true, source: "local", classifiedAs: classified, file: entry, simulated: true };
  }

  function listLocal(propertyId, folderId) {
    var bucket = propBucket(propertyId);
    var files = bucket.files || [];
    if (folderId) {
      files = files.filter(function (f) {
        return f.folder === folderId;
      });
    }
    return files;
  }

  async function list(property, folderKey) {
    var localFiles = listLocal(property.id, folderKey);
    if (!property.drive_folder_id) {
      return { configured: false, files: localFiles, subfolders: DEFAULT_FOLDERS };
    }
    try {
      var subId =
        folderKey && property.drive_subfolders && property.drive_subfolders[folderKey]
          ? property.drive_subfolders[folderKey].id
          : null;
      var data = await api("POST", {
        action: "list",
        folderId: property.drive_folder_id,
        subfolderId: subId || undefined,
      });
      if (data && data.ok && data.configured) {
        var remote = (data.files || []).map(function (f) {
          return {
            id: f.id,
            name: f.name,
            mimeType: f.mimeType,
            webViewLink: f.webViewLink,
            thumbnailLink: f.thumbnailLink,
            url: f.thumbnailLink || f.webViewLink,
            modifiedTime: f.modifiedTime,
            source: "drive",
            folder: folderKey || "",
          };
        });
        return { configured: true, files: remote.concat(localFiles), subfolders: data.subfolders || DEFAULT_FOLDERS };
      }
    } catch (e) {}
    return { configured: false, files: localFiles, subfolders: DEFAULT_FOLDERS };
  }

  return {
    DEFAULT_FOLDERS: DEFAULT_FOLDERS,
    classify: classify,
    ensure: ensure,
    upload: upload,
    list: list,
    listLocal: listLocal,
  };
})();
