const express = require('express')
const {registerUser, loginUser, logoutUser, deleteUser} = require('../controllers/authController')

const authRouter = express.Router()

authRouter.post('/register', registerUser)
authRouter.post('/login', loginUser)
authRouter.post("/logout", logoutUser)
authRouter.delete('/delete', deleteUser)

module.exports = authRouter