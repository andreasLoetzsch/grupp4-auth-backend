const jwt = require('jsonwebtoken')
const config = require('../config')

async function createAccessToken (user) {
    console.log('hej')
    const accessToken = await jwt.sign(
        {
            userId: user.id,
            username: user.username,
            email: user.email,
            role: user.role
        },
        config.ACCESS_TOKEN_SECRET,
        {expiresIn: '1h'}
    )
    return accessToken
}

 async function createRefreshToken (userId) {
    const refreshToken = await jwt.sign(
        {
            userId: userId
        },
        config.REFRESH_TOKEN_SECRET,
        {expiresIn: '7d'}
    )
    return refreshToken
}

module.exports = {createAccessToken, createRefreshToken}