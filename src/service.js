const app = require('./app')
require('dotenv').config()

const PORT = process.env.PORT || 3001

app.listen(PORT, (req, res) => {
    console.log(`Listening on port: ${PORT}`)
})