const express = require('express');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const { RedisStore } = require('connect-redis'); // named export in v9
const { createClient } = require('redis');

const consentRouter = require('./routes/consentRoutes');
const meRouter = require('./routes/meRoutes');

// Routers & middleware
const authRouter = require('./routes/authRoutes');
const consentUUID = require('./middleware/consentUUID');
const csrfProtection = require('./middleware/csrf');

const config = require('./config');

const app = express();

// Create & connect redis client
const redisClient = createClient({ url: 'redis://localhost:6379' });
redisClient.connect().catch(console.error);

// Session (uses Redis store)
app.use(
  session({
    name: 'sid',
    store: new RedisStore({ client: redisClient, ttl: 60 * 60 }), // 1 hour TTL
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
    rolling: true,
  })
);

const ALLOWED_ORIGINS = new Set(config.CORS_ALLOWED_ORIGINS || []);

// single source of truth for CORS options delegate
const corsOptionsDelegate = (req, cb) => {
  const origin = req.get('Origin');
  // default: no CORS
  let options = { origin: false };

  const base = {
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-CSRF-Token'],
    maxAge: 600,
  };

  if (!origin && config.ALLOW_EMPTY_ORIGIN) {
    options = { ...base, origin: true };
  } else if (origin && ALLOWED_ORIGINS.has(origin)) {
    options = { ...base, origin };
  }

  cb(null, options);
};

// Security headers (helmet plus a few explicit headers)
app.use(helmet());
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// Body parsing & cookies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Simple deep sanitizer to remove keys that could be used for mongo operators
const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$') || key.includes('.')) {
      delete obj[key];
    } else {
      sanitizeObject(obj[key]);
    }
  }
};

app.use((req, res, next) => {
  sanitizeObject(req.body);
  sanitizeObject(req.query);
  sanitizeObject(req.params);
  next();
});

app.use(consentUUID);

// Ensure X-CSRF-Token is allowed in responses and preserve existing headers
app.use((req, res, next) => {
  const prev = res.getHeader('Access-Control-Allow-Headers');
  const base = prev ? String(prev) : 'Content-Type';
  res.header('Access-Control-Allow-Headers', `${base}, X-CSRF-Token`);
  next();
});

// Auth routes with CORS applied — register these BEFORE CSRF so preflight (OPTIONS)
// is handled by the CORS middleware rather than being rejected by CSRF checks.
app.use('/auth', cors(corsOptionsDelegate), authRouter);
app.options('/auth', cors(corsOptionsDelegate));
// Match /auth and any subpath — RegExp avoids path-to-regexp parameter parsing issues
app.options(/^\/auth(\/.*)?$/, cors(corsOptionsDelegate));

app.use('/api/consent', consentRouter);
app.use('/me', meRouter);

// Apply CSRF except for api-docs
app.use((req, res, next) => {
  if (req.path.startsWith('/api-docs')) return next();
  return csrfProtection(req, res, next);
});

// Add Vary: Origin header only when CORS set
app.use((req, res, next) => {
  if (res.getHeader('Access-Control-Allow-Origin')) res.setHeader('Vary', 'Origin');
  next();
});

// Short-circuit OPTIONS
app.use((req, res, next) => (req.method === 'OPTIONS' ? res.sendStatus(204) : next()));

module.exports = app;