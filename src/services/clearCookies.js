const config = require('../config')

const clearCookies =  async (req, res) => {
     const common = { path: '/', secure: config.SECURE, sameSite: config.SAME_SITE };

        res.clearCookie('refreshToken', { ...common, httpOnly: true });
        res.clearCookie('accessToken', { ...common, httpOnly: true });
        res.clearCookie('csrfToken', { ...common });

        if (!req.session) {
            res.clearCookie('sid', {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/', 
            });

            return res.json({ ok: true });
        }

        await new Promise((resolve, reject) => {
            req.session.destroy(err => (err ? reject(err) : resolve()));
        });

        res.clearCookie('sid', {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/', 
        });
}

module.exports = {clearCookies}