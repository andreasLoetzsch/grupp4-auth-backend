const jwt = require("jsonwebtoken");
const {createAccessToken} = require('../utils/tokenUtils')

module.exports = async function verifyAuth(req, res, next) {
    if (!req.session?.user) {
        return res.status(401).json({ error: "Not authorized." });
    }
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken && !refreshToken) {
        return res.status(401).json({ error: "Not authorized." });
    }

    try {
        const user = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = user;
        return next();
    } catch (err) {
        if (err.name !== "TokenExpiredError") {
            return res.status(401).json({ error: "Invalid token." });
        }
    }

    if (!refreshToken) {
        return res.status(401).json({ error: "Token expired. Login again." });
    }

    try {
        const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const newAccessToken = await createAccessToken(req.session.user)

        res.cookie("accessToken", newAccessToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });

        req.user = user;
        next();

    } catch (err) {
        req.session.destroy();
        return res.status(401).json({ error: "Session expired. Please login again." });
    }
};