'use strict'
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Category = Schema({
    categoryName: {type: String, require: true},
    descriptionCategory: {type: String, require: true},
    productsOfCategory: [{
        product: {type: Schema.Types.ObjectId, ref: 'product'}
    }]
});

module.exports = mongoose.model('categories', Category);