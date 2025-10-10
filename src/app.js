const express = require('express')
const authRouter = require('./routes/authRoutes')
const cookieParser = require("cookie-parser");
const helmet = require("helmet");

const app = express()

app.use(helmet());
app.use(express.json())
app.use(cookieParser());

app.use('/auth', authRouter)

module.exports = app