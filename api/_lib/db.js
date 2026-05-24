function getSql() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;
  const { neon } = require("@neondatabase/serverless");
  return neon(dbUrl);
}

module.exports = { getSql };
