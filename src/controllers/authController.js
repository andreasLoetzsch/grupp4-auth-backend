const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { isValidObjectId } = require('mongoose')

// ------------------------------------------------------------------------------
const crypto = require('crypto');

function createCsrfToken() {
    return crypto.randomBytes(32).toString('base64url');
}

function csrfCookieOptions() {
    const isDev = process.env.NODE_ENV === 'development';
    return {
        httpOnly: false,
        secure: !isDev,
        sameSite: isDev ? 'lax' : 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dagar
    };
}
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
        const accessToken = await jwt.sign(
            {
                userId: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "1h" }
        )
        const refreshToken = await jwt.sign(
            {
                userId: user.id,
            }, process.env.REFRESH_TOKEN_SECRET,
            { expiresIn: "7d" }
        )
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict",
            maxAge: 60 * 60 * 1000
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development",
            sameSite: process.env.NODE_ENV === "development" ? "lax" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        const csrfToken = createCsrfToken();
        res.cookie('csrfToken', csrfToken, csrfCookieOptions());

        return res.status(200).json({ success: true, message: "successfully logged in" })
    } catch (err) {
        console.error(err.message)
        return res.status(500).json({ success: false, message: "Server error" })
    }
}

const logoutUser = (req, res) => {
    try {
        const isDev = process.env.NODE_ENV === 'development';
        const common = { path: '/', secure: !isDev, sameSite: isDev ? 'lax' : 'strict' };

        res.clearCookie('refreshToken', { ...common, httpOnly: true });
        res.clearCookie('accessToken', { ...common, httpOnly: true });
        res.clearCookie('csrfToken', { ...common });

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

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params || {};

        if (!id) {
            return res.status(400).json({ success: false, message: "No user ID present in query parameters." });
        }

        const user = await User.findOneAndDelete({ _id: id });

        if (!user) {
            return res.status(404).json({ success: false, message: "Provided user ID does not exist." });
        }

        return res.status(200).json({ success: true, message: "User was deleted successfully." });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ success: false, message: "Server error." });
    }
}

module.exports = { registerUser, loginUser, logoutUser, updateUser, deleteUser }