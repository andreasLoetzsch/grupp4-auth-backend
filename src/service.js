const app = require('./app')
const connectDB = require('./config/connectDB')
require('dotenv').config()

const PORT = process.env.PORT || 3001

connectDB()

app.listen(PORT, (req, res) => {
    console.log(`Listening on port: ${PORT}`)
})