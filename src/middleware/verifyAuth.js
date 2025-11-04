module.exports = async function verifyAuth(req, res, next) {
    if (!req.session?.user) {
        return res.status(401).json({ error: "Not authorized." });
    }
    
    next();
};