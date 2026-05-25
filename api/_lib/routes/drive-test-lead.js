/**
 * POST /api/drive/test-lead — cree/verifie un dossier Drive "test lead" + fichier test.
 */
const { applyApiGuards } = require("../security");
const { requireCrm } = require("../rbac");
const { getDriveAccessToken, getRootFolderId } = require("../google-drive-auth");

async function driveJson(url, token, options) {
  const resp = await fetch(url, Object.assign({}, options || {}, {
    headers: Object.assign(
      { Authorization: "Bearer " + token },
      (options && options.headers) || {}
    ),
  }));
  const data = await resp.json().catch(function () {
    return {};
  });
  if (!resp.ok) throw new Error(data.error?.message || "Drive API " + resp.status);
  return data;
}

async function findFolder(token, parentId, name) {
  const q =
    "mimeType='application/vnd.google-apps.folder' and name='" +
    name.replace(/'/g, "\\'") +
    "' and '" +
    parentId +
    "' in parents and trashed=false";
  const data = await driveJson(
    "https://www.googleapis.com/drive/v3/files?q=" +
      encodeURIComponent(q) +
      "&fields=files(id,name)&pageSize=1",
    token
  );
  return data.files && data.files[0] ? data.files[0] : null;
}

async function createFolder(token, parentId, name) {
  return driveJson("https://www.googleapis.com/drive/v3/files?fields=id,name", token, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: name,
      mimeType: "application/vnd.google-apps.folder",
      parents: [parentId],
    }),
  });
}

async function uploadTestFile(token, folderId) {
  const fileName = "piece-identite-test.txt";
  const meta = { name: fileName, parents: [folderId], mimeType: "text/plain" };
  const boundary = "boundary_" + Date.now();
  const content =
    "Test Drive Leads Opportunities\n" +
    "Dossier: test lead\n" +
    "Date: " +
    new Date().toISOString() +
    "\n";
  const body =
    "--" +
    boundary +
    "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
    JSON.stringify(meta) +
    "\r\n--" +
    boundary +
    "\r\nContent-Type: text/plain\r\n\r\n" +
    content +
    "\r\n--" +
    boundary +
    "--";
  return driveJson(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name",
    token,
    {
      method: "POST",
      headers: { "Content-Type": "multipart/related; boundary=" + boundary },
      body: body,
    }
  );
}

module.exports = async (req, res) => {
  applyApiGuards(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await requireCrm(req, res);
  if (!user) return;
  if (user.role !== "admin" && user.crmRole !== "admin") {
    return res.status(403).json({ error: "Admin requis pour ce test" });
  }

  const auth = await getDriveAccessToken();
  const rootId = getRootFolderId();
  if (!auth || !rootId) {
    return res.status(400).json({
      ok: false,
      error: "Drive non configure. Verifiez GOOGLE_SERVICE_ACCOUNT_JSON et GOOGLE_DRIVE_FOLDER_ID.",
    });
  }

  try {
    let folder = await findFolder(auth.accessToken, rootId, "test lead");
    const existed = !!folder;
    if (!folder) folder = await createFolder(auth.accessToken, rootId, "test lead");
    const file = await uploadTestFile(auth.accessToken, folder.id);
    return res.status(200).json({
      ok: true,
      folderExisted: existed,
      folder: folder,
      testFile: file,
      authSource: auth.source,
      serviceAccountEmail: auth.email,
    });
  } catch (e) {
    console.error("[drive/test-lead]", e);
    return res.status(502).json({ ok: false, error: e.message });
  }
};
