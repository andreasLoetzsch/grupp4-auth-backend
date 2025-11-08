const express = require('express');
const router = express.Router();
const { registerUser, loginUser, logoutUser, updateUser, deleteUser, verifyUser, editProfile } = require('../controllers/authController');
const {recaptchaCheck} = require('../middleware/recaptchaCheck.js')
const crypto = require('crypto');
const config = require('../config');
const jwt = require("jsonwebtoken");
const { createCsrf } = require('../csrf.js');

const verifyAuth = require("../middleware/verifyAuth.js");
const { createAccessToken, createRefreshToken } = require('../utils/tokenUtils.js');

function csrfCookieOptions() {
    return {
        httpOnly: config.HTTP_ONLY,
        secure: config.SECURE,
        sameSite: config.SAME_SITE,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
}

router.get('/csrf', (req, res) => {
  let token = req.cookies?.csrfToken;

  if (!token) {
    token = createCsrf(req); // your existing generator function
    res.cookie('csrfToken', token, csrfCookieOptions());
  }

  return res.status(200).json({ ok: true, csrfToken: token });
});

router.get('/csrf/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: "Refresh token is missing." });
    }

    let payload;
    try {
      payload = jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET);
    } catch(e) {
      return res.status(401).json({ error: "Refresh token invalid or expired." });
    }

    const newAccessToken = await createAccessToken(payload)
    const newRefreshToken = await createRefreshToken(payload.id)

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
    return res.status(401).json({ error: "Failed to frefresh CSRF token." });
  }
});

router.post('/register', recaptchaCheck, registerUser);
router.post('/login', recaptchaCheck, loginUser);
router.post('/logout', [verifyAuth],logoutUser);
router.patch('/user', [verifyAuth], editProfile);
router.patch('/:id', [verifyAuth], updateUser);
router.delete('/:id', [verifyAuth] ,deleteUser);
router.get('/verify', verifyUser);

module.exports = router;
