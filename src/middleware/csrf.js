const { validateCsrf } = require("../csrf");
const jwt = require("jsonwebtoken");
const config = require("../config.js");

module.exports = async function csrfProtection(req, res, next) {
    const method = req.method.toUpperCase();
    const path = req.path;

    if(
        method != "POST" && !(method == "GET" && path == "/auth/verify") 
        || (method == "POST" && (path == "/auth/login" || path == "/auth/register"))
    ) {
        return next();
    }

    const accessToken = req.cookies.accessToken;

    if(!accessToken) return res.status(401).json({ message: 'Authorization token required' });

    try {
        const decoded = jwt.verify(accessToken, config.ACCESS_TOKEN_SECRET);

        req.user = {
            id: decoded.userId,
            role: decoded.role,
            username: decoded.username,
            email: decoded.email
        };

        const csrfToken = req.get("X-CSRF-Token");
        if(!csrfToken) return res.status(403).json({ message: 'CSRF token required' });

        const valid = await validateCsrf(csrfToken);
        if(!valid) if(!csrfToken) return res.status(403).json({ message: 'CSRF token expired or invalid.' });

        next();
    } catch(e) {
        return res.status(401).json({ message: 'Authorization token expired.' });
    }
};