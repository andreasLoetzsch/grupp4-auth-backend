module.exports = function csrfProtection(req, res, next) {

    const method = req.method.toUpperCase();

    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
        return next();
    }

    const cookieToken = req.cookies?.csrfToken;
    const headerToken = req.get('X-CSRF-Token');

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
        return res.status(403).json({ error: 'CSRF token missing or invalid' });
    }

    next();
};
