const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { requireJwtSecret, safeEqual } = require("./security");

const JWT_EXPIRY = "7d";
const JWT_ISSUER = "leads-opportunities";

function hashPassword(password, salt) {
  if (!salt) salt = crypto.randomBytes(32).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, "sha512")
    .toString("hex");
  return { hash, salt };
}

function verifyPassword(password, storedHash, salt) {
  if (!password || !storedHash || !salt) return false;
  try {
    const { hash } = hashPassword(password, salt);
    const a = Buffer.from(hash);
    const b = Buffer.from(storedHash);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function signToken(payload) {
  return jwt.sign(payload, requireJwtSecret(), {
    expiresIn: JWT_EXPIRY,
    algorithm: "HS256",
    issuer: JWT_ISSUER,
  });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, requireJwtSecret(), {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
    });
  } catch {
    return null;
  }
}

function extractToken(req) {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7).trim();
  return null;
}

async function getAuthUser(req) {
  const token = extractToken(req);
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) return null;
  return decoded;
}

function setCors(req, res) {
  const { setCors: cors } = require("./security");
  cors(req, res);
}

function generateResetCode() {
  return String(crypto.randomInt(100000, 1000000));
}

module.exports = {
  hashPassword,
  verifyPassword,
  signToken,
  verifyToken,
  extractToken,
  getAuthUser,
  setCors,
  generateResetCode,
  safeEqual,
};
