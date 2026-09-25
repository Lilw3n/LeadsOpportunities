const { getAuthUser } = require("./auth");

async function requireDashboardAdmin(req, res) {
  const user = await getAuthUser(req);
  if (!user || user.role !== "admin") {
    if (res) res.status(403).json({ ok: false, error: "Acces refuse" });
    return null;
  }
  return user;
}

module.exports = { requireDashboardAdmin };
