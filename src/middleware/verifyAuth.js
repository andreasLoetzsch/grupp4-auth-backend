module.exports = async function verifyAuth(req, res, next) {
    if (!req.session?.userId) {
        return res.status(401).json({ error: "Not authorized." });
    }
    
    next();
};