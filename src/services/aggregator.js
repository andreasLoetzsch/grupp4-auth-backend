const User = require('../models/userModel');

const aggregateUserData = async (userId) => {
  let results = {};
  
  try {
  const user = await User.findById(userId).select("-password");

  //Förenkling. Ändra sedan...

  results["profile"] = user.toObject();
  } catch (error) {
    results["profile"] = { error: error };
  }

  return results;
}

module.exports = { aggregateUserData };