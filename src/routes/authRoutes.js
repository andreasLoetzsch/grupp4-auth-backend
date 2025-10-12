const express = require('express')
const { registerUser, loginUser, logoutUser, updateUser, deleteUser } = require('../controllers/authController')

const authRouter = express.Router()

authRouter.post('/register', registerUser)
authRouter.post('/login', loginUser)
authRouter.post("/logout", logoutUser)
authRouter.patch('/update/:id', updateUser)
authRouter.delete('/delete', deleteUser)

module.exports = authRouter