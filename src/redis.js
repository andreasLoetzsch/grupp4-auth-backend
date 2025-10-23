const redis = require("redis");
const config = require("./config.js");

const redisServer = redis.createClient({
  // Prefer a single URL with TLS and ACL creds
  // e.g. 'rediss://user:password@my-redis.example.com:6380'
  url: config.REDIS_URL,
  // Safety nets
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 1000), // backoff up to 1s
    connectTimeout: 2000,
    tls: config.REDIS_TLS === 'true' ? {} : undefined,
  }
});

redisServer.on('error', (err) => {
  console.error('[redis] error', err);
});

async function initRedis() {
  if (!redisServer.isOpen) await redisServer.connect();
}

async function shutdownRedis() {
  if (redisServer.isOpen) await redisServer.quit();
}


module.exports = {
    redisServer,
    initRedis,
    shutdownRedis
}