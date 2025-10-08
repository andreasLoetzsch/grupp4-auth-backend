const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const registerUser = async (req, res) => {
    const {username, password, email, role, phoneNumber} = req.body
    try {
        if(username.length < 3) res.status(403).json({success: false, message: "Username needs to be atleast 3 characters"})
        if(password.length < 8) res.status(403).json({success: false, message: "Password needs to be atleast 8 characters"})

        function isEmailValid (email) {
            const emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            return emailCheck.test(email)
        }
        if(!isEmailValid(email)) res.status(403).json({success: false, message: "Email not valid"})
        const isEmailInUse = await User.findOne({
            email: {$regex: "^" + email + "$", $options: "i" }
        })
        if(isEmailInUse) res.status(403).json({success: false, message: "Email already taken"})
        const isUsernameInUse = await User.findOne({
            username: {$regex: "^" + username + "$", $options: "i" }
        })
        if(isUsernameInUse) res.status(403).json({success: false, message: "Username already taken"})
        function isPhoneNumberValid (phoneNumber){
            const phoneNumberCheck = /^(?:\+46|0)(7[\d]{8})$/
            return phoneNumberCheck.test(phoneNumber)
        }
        if(!isPhoneNumberValid(phoneNumber)) res.status(403).json({success: false, message: "Needs to be a swedish number"})
        const user = new User({
            username: username, 
            password: password, 
            email: email,
            role: role, 
            phoneNumber: phoneNumber
        })
        await user.save()
        res.status(200).json({success: true, message: "User successfully created"})
    }catch(err){
        console.error(err.message);
        res.status(500).send("Server error");
    }
}

module.exports = {registerUser}