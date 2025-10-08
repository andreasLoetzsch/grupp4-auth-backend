const mongoose = require('mongoose')
require('dotenv').config()

const connectDB = async () => {
    await mongoose.connect(process.env.DB_CONNECTION_STRING)
    console.log('mongoDB connected')
}

module.exports = connectDB