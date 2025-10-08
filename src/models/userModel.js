const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userModel = new Schema({
    username: {type: string, required: true  },
    password: {type: string, required: true},
    email: {type: string, required: true},
    role: {type: string},
    phoneNumber: {type: number} 
})

userModel.pre("save", async function (next) {
    if(!this.isModified(password))return next();
    const genSalt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, genSalt);
    next()
})

userModel.methods.checkPassword = function(password) {
    return bcrypt.compare(password, this.password)
}

module.exports = mongoose.model('user', userModel)