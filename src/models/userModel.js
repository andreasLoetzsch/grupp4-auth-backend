const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const { Schema } = mongoose;

const userSchema = new Schema({
    username: {type: String, required: true  },
    password: {type: String, required: true},
    email: {type: String, required: true},
    role: {type: String},
    phoneNumber: {type: String} 
})

userSchema.pre("save", async function (next) {
    if(!this.isModified("password"))return next();
    const genSalt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, genSalt);
    next()
})

userSchema.methods.checkPassword = function(password) {
    return bcrypt.compare(password, this.password)
}

module.exports = mongoose.model('User', userSchema)