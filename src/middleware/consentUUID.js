const { randomUUID } = require("crypto");
const config = require("../config.js");

const consentUUID = (req, res, next) => {
    const cookieName = "consent_UUID";
    let consentUUID = req.cookies?.[cookieName];

    if(!consentUUID) {
        consentUUID = randomUUID();
        res.cookie(cookieName, consentUUID, {
            httpOnly: true,
            secure: config.SECURE,
            sameSite: config.SAME_SITE,
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
        });
    }

    req.consentUUID = consentUUID;
    next();
}

module.exports = consentUUID;