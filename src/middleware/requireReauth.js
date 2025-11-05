const bcrypt = require("bcryptjs");
const User = require('../models/userModel');
const config = require('../config');

const requireReauth = async (req, userId) => {
  console.log(1)
  if (req.session?.reauth && Date.now() - req.session.reauth < config.REAUTH_WINDOW_MS) {
    return true;
  }

  const { password } = req.body || {};
  if (!password) return false;

  const user = await User.findById(userId);
  if (!user) return false;

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return false;

  req.session.reauth = Date.now();
  return true;
};

module.exports = { requireReauth };