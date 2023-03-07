'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Product = Schema({
    nameProduct: {type: String, require: true},
    description: {type: String, require: true},
    price: {type: Number, require: true},
    stock: {type: Number, require: true},
    sold: {type: Number, require: true},
    idProductCategory: {type: Schema.Types.ObjectId, ref: 'categories'}
});

module.exports = mongoose.model('products', Product);