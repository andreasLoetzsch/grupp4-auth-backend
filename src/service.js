const app = require('./app')
const connectDB = require('./config/connectDB')
const config = require('./config');
const https = require("https");
const fs = require('fs');
const { initRedis } = require('./redis');

const PORT = config.PORT

connectDB()

initRedis()

const key  = fs.readFileSync('./certs/localhost+2-key.pem');
const cert = fs.readFileSync('./certs/localhost+2.pem');
https.createServer({ key, cert }, app).listen(PORT, () => {
  console.log(`Listening on port (HTTPS): ${PORT}`);
});
