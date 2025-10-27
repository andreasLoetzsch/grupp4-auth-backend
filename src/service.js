const app = require('./app')
const connectDB = require('./config/connectDB')
const config = require('./config');
const { initRedis } = require('./redis');

const PORT = config.PORT

connectDB()

initRedis()

app.listen(PORT, async (req, res) => {
    console.log(`Listening on port: ${PORT}`)
})