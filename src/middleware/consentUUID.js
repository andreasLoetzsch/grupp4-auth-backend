const { randomUUID } = require("crypto");

const consentUUID = (req, res, next) => {
    const cookieName = "consent_UUID";
    let consentUUID = req.cookies?.[cookieName];

    if(!consentUUID) {
        consentUUID = randomUUID();
        res.cookie(cookieName, consentUUID, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year
        });
    }

    req.consentUUID = consentUUID;
    next();
}

module.exports = consentUUID;