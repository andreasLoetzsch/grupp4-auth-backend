const mongoose = require('mongoose')
const config = require('../config');

const connectDB = async () => {
    await mongoose.connect(config.DB_CONNECTION_STRING)
    console.log('mongoDB connected')
}

module.exports = connectDB