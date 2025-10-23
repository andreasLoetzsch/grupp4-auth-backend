const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, updateUser, deleteUser, verifyAuth } = require('../controllers/authController');
const {recaptchaCheck} = require('../middleware/recaptchaCheck.js')
const crypto = require('crypto');
const config = require('../config');
const jwt = require("jsonwebtoken");
const { createCsrf } = require('../csrf.js');

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
  let token = req.cookies?.csrfToken;

  if (!token) {
    token = createCsrfToken(); // your existing generator function
    res.cookie('csrfToken', token, csrfCookieOptions());
  }

  return res.status(200).json({ ok: true, csrfToken: token });
});

router.get('/csrf/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: "refresh_missing" });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, config.ACCESS_TOKEN_SECRET);
    } catch(e) {
      return res.status(401).json({ error: "refresh_invalid" });
    }

    const newAccessToken = await jwt.sign(
        {
            userId: payload.userId,
            username: payload.username,
            email: payload.email,
            role: payload.role
        },
        config.ACCESS_TOKEN_SECRET,
        { expiresIn: "1h" }
    );

    const newRefreshToken = await jwt.sign(
        {
            userId: payload.id,
        }, config.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );

    res.cookie('accessToken', newAccessToken, {
        httpOnly: config.HTTP_ONLY,
        secure: config.SECURE,
        sameSite: config.SAME_SITE,
        maxAge: 60 * 60 * 1000
    })
    
    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: config.HTTP_ONLY,
        secure: config.SECURE,
        sameSite: config.SAME_SITE,
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    // 5. Rotate CSRF token (store in Redis, return for client to update localStorage)
    const csrfToken = await createCsrf(); // generates + saves in Redis with TTL

    return res.status(200).json({ ok: true, csrfToken });
  } catch (err) {
    console.error("refresh error:", err);
    return res.status(401).json({ error: "refresh_failed" });
  }
});

router.post('/register', recaptchaCheck, registerUser);
router.post('/login', recaptchaCheck, loginUser);
router.post('/logout', logoutUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);
router.get('/verify', verifyAuth);

module.exports = router;
