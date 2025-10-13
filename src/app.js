const express = require('express')
const authRouter = require('./routes/authRoutes')
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const cors = require("cors");
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')

const app = express()

app.use(helmet());
app.use(express.json())
app.use(cookieParser());

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use('/auth', authRouter)

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

module.exports = app