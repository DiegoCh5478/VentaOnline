'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = Schema({
    nameProduct: {type: String, require: true},
    description: {type: String, require: true},
    price: {type: Number, require: true},
    stock: {type: Number, require: true},
    sold: {type: Number, require: true}
})

module.exports = mongoose.Schema('products', Product);