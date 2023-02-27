'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = Schema({
    userName: {type: String, require: true},
    lastName: {type:String, require: true},
    email: {type: String, require: true},
    password: {type: String, require: true},
    rol: {type: String, require: true},
    shoppingCar: [{
        product: {type: Schema.Types.ObjectId, ref: 'product'}
    }]
});

module.exports = mongoose.Schema('users', User);