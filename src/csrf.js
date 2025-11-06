const config = require("./config.js");
const crypto = require("crypto");
const redis = require("./redis.js");

async function createCsrf(req) {
  const token = crypto.randomBytes(32).toString('base64url');
  await redis.redisServer.set(`csrf:${token}`, token, { EX: config.REDIS_TTL_MINUTES*60 }); // atomic set+ttl
  req.session.csrf = token
  return token;
}

async function validateCsrf(sid, presented) {
  if (!presented) return false;
  const exists = await redisServer.exists(`csrf:${presented}`);
  return exists === 1;
}

async function deleteCsrf(req) {
  if (!req?.session?.csrf) return;
  const csrfToken = req.session.csrf
  await redis.redisServer.del(`csrf:${csrfToken}`)
  delete req.session.csrf;
}

module.exports = {
    createCsrf,
    validateCsrf,
    deleteCsrf
}