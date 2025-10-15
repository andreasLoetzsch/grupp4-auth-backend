const express = require('express')
const {registerUser, loginUser, deleteUser} = require('../controllers/authController')
const {recaptchaCheck} = require('../middlewear/recaptchaCheck')

const authRouter = express.Router()

authRouter.post('/register', registerUser)
authRouter.post('/login', recaptchaCheck, loginUser)
authRouter.delete('/delete', deleteUser)

module.exports = authRouter