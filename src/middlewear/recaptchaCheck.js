import { verifyRecaptcha } from "../services/recaptchaService.js"

export const recaptchaCheck = async (req, res, next) => {
    const {recaptchaToken} = req.body
    try {
        if (!recaptchaToken) {
            R.forbidden(res, "Captcha token missing");
            return
        }
        const action = req.path.replace("/", "");
        const captcha = await verifyRecaptcha(recaptchaToken, action)

        if(!captcha.success && (captcha.score ?? 0) > 0.5){
            R.forbidden(res, "captcha failed");
            return;
        }
        next()

    }catch(err){
        console.error(err)
    }
    
}