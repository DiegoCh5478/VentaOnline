const jwt = require('jsonwebtoken');
require('dotenv').config();
const key = process.env.SECRET_KEY;

const generateJWT = async(_id, userName,email) =>{
    const payLoad = {_id, userName, email};
    try {
        const token = await jwt.sign(payLoad, key,{
            expiresIn: '1h'
        } );
        return token;
    } catch (error) {
        throw new Error(error);
    }
}

module.exports = {generateJWT};