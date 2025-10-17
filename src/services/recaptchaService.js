const config = require('./config');

export async function verifyRecaptcha(recaptchaToken, action) {
  const secret = config.SECRET_RECAPTCHA_SERVER_KEY;
  if (!secret) throw new Error("RECAPTCHA_SECRET_KEY not set");

  const params = new URLSearchParams();

  params.append("secret", secret);
  params.append("response", recaptchaToken);
  
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    body: params,
  });

  const data = await res.json();

  if (action && data.action !== action) {
    return { success: false};
  }

  return { success: data.success, score: data.score, action: data.action };
}