const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, updateUser, deleteUser } = require('../controllers/authController');
const {recaptchaCheck} = require('../middleware/recaptchaCheck.js')
const crypto = require('crypto');
const config = require('../config');

function createCsrfToken() {
    return crypto.randomBytes(32).toString('base64url');
}
function csrfCookieOptions() {
    return {
        httpOnly: config.HTTP_ONLY,
        secure: config.SECURE,
        sameSite: "lax",
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
}

router.get('/csrf', (req, res) => {
    const token = createCsrfToken();
    res.cookie('csrfToken', token, csrfCookieOptions());
    return res.status(200).json({ ok: true, csrfToken: token });
});

router.post('/register', recaptchaCheck, registerUser);
router.post('/login', recaptchaCheck, loginUser);
router.post('/logout', logoutUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
