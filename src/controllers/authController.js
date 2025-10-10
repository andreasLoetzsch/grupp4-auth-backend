const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const registerUser = async (req, res) => {
    const {username, password, email, role, phoneNumber} = req.body
    try {
        if(!username || !password || !email || !role || !phoneNumber)return res.status(403).json({success: false, message: "All the fields needs to be answered"})
        if(username.length < 3) return res.status(403).json({success: false, message: "Username needs to be atleast 3 characters"})
        if(password.length < 8) return res.status(403).json({success: false, message: "Password needs to be atleast 8 characters"})

        function isEmailValid (email) {
            const emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            return emailCheck.test(email)
        }
        if(!isEmailValid(email)) return res.status(403).json({success: false, message: "Email not valid"})
        const isEmailInUse = await User.findOne({
            email: {$regex: "^" + email + "$", $options: "i" }
        })
        if(isEmailInUse) return res.status(403).json({success: false, message: "Email already taken"})
        const isUsernameInUse = await User.findOne({
            username: {$regex: "^" + username + "$", $options: "i" }
        })
        if(isUsernameInUse) return res.status(403).json({success: false, message: "Username already taken"})
        function isPhoneNumberValid (phoneNumber){
            const phoneNumberCheck = /^(?:\+46|0)(7[\d]{8})$/
            return phoneNumberCheck.test(phoneNumber)
        }
        if(!isPhoneNumberValid(phoneNumber)) return res.status(403).json({success: false, message: "Needs to be a swedish number"})
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

const loginUser = async (req, res) => {
    const {username, password} = req.body;
    try{
        if(!username || !password) return res.status(403).json({success: false, message: "Username and Password required"})
        const user = await User.findOne({
            username: { $regex: "^" + username + "$", $options: "i" },
        });
        if(!user) return res.status(404).json({success: false, message:"User not found"})
        const passwordCheck = await user.checkPassword(password)
        if( !passwordCheck) return res.status(404).json({success: false, message:"Invalid credentials"})
        const accessToken = await jwt.sign(
            {
                userId: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }, 
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: "1h"}
        )
        const refreshToken = await jwt.sign(
            {
                userId: user.id,
            }, process.env.REFRESH_TOKEN_SECRET,
            {expiresIn: "7d"}
        )
        res.cookie('refreshToken', refreshToken, {
            httpsOnly: true, 
            secure: true, 
            sameSite: "strict", 
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        res.status(200).json({success: true, message: "successfully logged in", accessToken})
    }catch(err){
        console.error(err.message)
        res.status(500).json({success: false, message: "Server error"})
    }
}

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        if(!id) {
            return res.status(400).json({ success: false, message: "No user ID present in query parameters."});
        }

        const user = await User.findOneAndDelete({ _id: id });

        if(!user) {
            return res.status(404).json({ success: false, message: "Provided user ID does not exist."});
        }

        return res.status(200).json({ success: true, message: "User was deleted successfully."});
    } catch(error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Server error."});
    }
}

module.exports = {registerUser, loginUser, deleteUser}