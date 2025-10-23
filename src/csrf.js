const config = require("./config.js");
const crypto = require("crypto");
const redis = require("./redis.js");

async function createCsrf() {
  const token = crypto.randomBytes(32).toString('base64url');
  await redis.set(`csrf:${token}`, token, { EX: config.REDIS_TTL_MINUTES*60 }); // atomic set+ttl
  return token;
}

async function validateCsrf(sid, presented) {
  if (!presented) return false;
  const exists = await redis.exists(`csrf:${presented}`);
  return exists === 1;
}

module.exports = {
    createCsrf,
    validateCsrf
}