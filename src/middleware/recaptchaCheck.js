const { verifyRecaptcha } = require("../services/recaptchaService.js");

require('dotenv').config();

const recaptchaCheck = async (req, res, next) => {
    if(process.env.NODE_ENV == "development") return next();

    const {token} = req.body
    try {
        if (!token) {
            res.status(401).json({ success: false, message:"Captcha token missing"});
            return
        }
        const action = req.path.replace("/", "");
        const captcha = await verifyRecaptcha(token, action)
        console.log(captcha)
        if(!captcha.success && (captcha.score ?? 0) > 0.5){
            res.status(401).json({ success: false, message: "Captcha failed"});
            return;
        }
        next()

    }catch(err){
        console.error(err)
    }
    
}

module.exports = { recaptchaCheck };