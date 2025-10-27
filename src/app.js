const express = require('express')
const authRouter = require('./routes/authRoutes')
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger');
const bodyParser = require('body-parser');
const csrfProtection = require('./middleware/csrf');
const config = require('./config.js');

const app = express()

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin && config.ALLOW_EMPTY_ORIGIN) {
      callback(null, true); // tillåt tom origin i dev
    } else if (origin && config.CORS_ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true); // tillåt konfigurerade origins
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));

app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json())
app.use(cookieParser());

app.use((req, res, next) => {
  const sanitize = (obj) => {
    if (obj && typeof obj == "object") {
      for (const key in obj) {
        if (key.startsWith("$") || key.includes(".")) {
          delete obj[key];
        } else {
          sanitize(obj[key]);
        }
      }
    }
  }

  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
});

app.use((req, res, next) => {
  const prev = res.getHeader('Access-Control-Allow-Headers');
  const base = prev ? String(prev) : 'Content-Type';
  res.header('Access-Control-Allow-Headers', `${base}, X-CSRF-Token`);
  next();
});

app.use((req, res, next) => {
  if (req.path.startsWith('/api-docs')) return next();
  return csrfProtection(req, res, next);
});

app.use('/auth', authRouter)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

module.exports = app