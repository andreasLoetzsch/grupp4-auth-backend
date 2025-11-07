const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { isValidObjectId } = require('mongoose')
const config = require('../config');
const { clearCookies } = require('../services/cookieService');
const {createAccessToken, createRefreshToken} = require('../utils/tokenUtils')
const Journal = require("../models/journalModel.js");

// ------------------------------------------------------------------------------
const crypto = require('crypto');
const { createCsrf, deleteCsrf } = require('../csrf');
const { todayISODate } = require('../utils/dates');
// ------------------------------------------------------------------------------

const registerUser = async (req, res) => {
    const { username, password, email, phoneNumber } = req.body || {}
    try {
        if (!username || !password || !email || !phoneNumber) return res.status(403).json({ success: false, message: "All the fields needs to be answered" })
        if (username.length < 3) return res.status(403).json({ success: false, message: "Username needs to be atleast 3 characters" })
        if (password.length < 8) return res.status(403).json({ success: false, message: "Password needs to be atleast 8 characters" })

        function isEmailValid(email) {
            const emailCheck = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            return emailCheck.test(email)
        }
        if (!isEmailValid(email)) return res.status(403).json({ success: false, message: "Email not valid" })
        const isEmailInUse = await User.findOne({
            email: { $regex: "^" + email + "$", $options: "i" }
        })
        if (isEmailInUse) return res.status(403).json({ success: false, message: "Email already taken" })
        const isUsernameInUse = await User.findOne({
            username: { $regex: "^" + username + "$", $options: "i" }
        })
        if (isUsernameInUse) return res.status(403).json({ success: false, message: "Username already taken" })
        function isPhoneNumberValid(phoneNumber) {
            const phoneNumberCheck = /^(?:\+46|0)(7[\d]{8})$/
            return phoneNumberCheck.test(phoneNumber)
        }
        if (!isPhoneNumberValid(phoneNumber)) return res.status(403).json({ success: false, message: "Needs to be a swedish number" })
        const user = new User({
            username: username,
            password: password,
            email: email,
            role: "user",
            phoneNumber: phoneNumber
        })
        await user.save()

        // create journal
        const journalDoc = await new Journal({
            title: "My first journal",
            content: "This is my first journal entry.",
            author: user._id,
            date: todayISODate()
        });

        await journalDoc.save();

        return res.status(200).json({ success: true, message: "User successfully created" })
    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server error");
    }
}

const loginUser = async (req, res) => {
    const { username, password } = req.body || {};

    try {
        if (!username || !password) return res.status(403).json({ success: false, message: "Username and Password required" })
        const user = await User.findOne({
            username: { $regex: "^" + username + "$", $options: "i" },
        });
        if (!user) return res.status(404).json({ success: false, message: "User not found" })
        const passwordCheck = await user.checkPassword(password)
        if (!passwordCheck) return res.status(404).json({ success: false, message: "Invalid credentials" })
        
        const accessToken = await createAccessToken(user)
        const refreshToken = await createRefreshToken(user.id)
        
        res.cookie('accessToken', accessToken, {
            httpOnly: config.HTTP_ONLY,
            secure: config.SECURE,
            sameSite: config.SAME_SITE,
            maxAge: 60 * 60 * 1000
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: config.HTTP_ONLY,
            secure: config.SECURE,
            sameSite: config.SAME_SITE,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        const csrfToken = createCsrf();

        // Wrap regenerate in a promise for await
        await new Promise((resolve, reject) => {
            req.session.regenerate(err => (err ? reject(err) : resolve()));
        });

        req.session.user = accessToken;

        // Optionally persist before responding (usually not required, but safe)
        await new Promise((resolve, reject) => {
            req.session.save(err => (err ? reject(err) : resolve()));
        });

        return res.status(200).json({ success: true, message: "successfully logged in", data: { user: {id: user.id, username: user.username, email: user.email, phoneNumber: user.phoneNumber}, csrfToken: csrfToken } })
    } catch (err) {
        console.error(err.message)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

const logoutUser = async (req, res) => {
    try {
        await clearCookies(req, res)
        return res.status(200).json({ success: true, message: "User logged out" });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params || {};

        if (!id) {
            return res.status(400).json({ success: false, message: "No user ID present in query parameters." });
        }

        if (!isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: "Invalid user ID format." });
        }

        const updates = req.body;

        if (updates.password && updates.password.length < 9) {
            return res.status(400).json({ success: false, message: "Password must be more than 8 characters long." });
        }

        if (updates.phoneNumber && !(/^(?:\+46|0)\s*(?:7\d{8}|[1-9]\d{5,8})$/.test(updates.phoneNumber))) {
            return res.status(400).json({ success: false, message: "Invalid phone number format." });
        }

        if (updates.email && !(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updates.email))) {
            return res.status(400).json({ success: false, message: "Invalid email format." });
        }

        const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "User updated", user: updatedUser });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

const editProfile = async (req, res) => {
try {
    const {email, phoneNumber} = req.body;
    if (!email || !phoneNumber) {
        return res.status(400).json({ success: false, message: "Fields can not be empty" });
    }
            if (!(/^(?:\+46|0)\s*(?:7\d{8}|[1-9]\d{5,8})$/.test(phoneNumber))) {
            return res.status(400).json({ success: false, message: "Invalid phone number format." });
        }

        if (!(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
            return res.status(400).json({ success: false, message: "Invalid email format." });
        }
    const decodedUser = jwt.decode(req.session.user);

const userId = decodedUser.userId 

        const user = await User.findByIdAndUpdate(userId, { $set: {email:email, phoneNumber:phoneNumber}});

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, message: "User updated" });

} catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
}
}

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const requesterId = req.session.user.id;
        const isAdmin = req.session.user.role === 'admin';
        if (!userId) {
            return res.status(400).json({ success: false, message: "No user ID present in query parameters." });
        }

        if (requesterId === userId && !isAdmin) {
            return res.status(403).json({ success: false, message: "Not authorized." });
        }

        const user = await User.findOneAndDelete({ _id: userId });

        if (!user) {
            return res.status(404).json({ success: false, message: "Provided user ID does not exist." });
        }

        await clearCookies(req, res)

        return res.status(200).json({ success: true, message: "User was deleted successfully." });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Server error." });
    }
}

const verifyUser = async (req, res) => {
    try {
        const decodedUser = jwt.decode(req.session.user);
        
        return res.status(200).json({ 
            success: true, 
            message: "User is authenticated.", 
            user: decodedUser
        });
    } catch(e) {
        console.error(e);
        return res.status(500).json({ success: false, message: "Server Error." });
    }
}

module.exports = { registerUser, loginUser, logoutUser, updateUser, editProfile, deleteUser, verifyUser };