const app = require('./app')
const connectDB = require('./config/connectDB')
const config = require('./config');

const PORT = config.PORT

connectDB()

app.listen(PORT, (req, res) => {
    console.log(`Listening on port: ${PORT}`)
})