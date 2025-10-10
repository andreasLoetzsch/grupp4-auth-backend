const express = require('express')
const {registerUser, loginUser, deleteUser} = require('../controllers/authController')

const authRouter = express.Router()

authRouter.post('/register', registerUser)
authRouter.post('/login', loginUser)
authRouter.delete('/delete', deleteUser)

module.exports = authRouter